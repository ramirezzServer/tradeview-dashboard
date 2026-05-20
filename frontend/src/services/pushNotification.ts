import { api } from '@/services/api';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported by this browser.');
  }

  return navigator.serviceWorker.register('/sw.js');
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  return Notification.requestPermission();
}

export async function sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
  await api.post('/push/subscribe', subscription.toJSON());
}

export async function subscribeToPush(): Promise<PushSubscription> {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error('VITE_VAPID_PUBLIC_KEY is not configured.');
  }

  const registration = await registerServiceWorker();
  const permission = await requestPermission();

  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await sendSubscriptionToBackend(existing);
    return existing;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  await sendSubscriptionToBackend(subscription);
  return subscription;
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await api.delete('/push/unsubscribe', { endpoint });
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
