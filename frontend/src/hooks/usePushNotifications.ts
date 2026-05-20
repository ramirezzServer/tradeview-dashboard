import { useEffect, useState } from 'react';
import {
  isPushSupported,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/services/pushNotification';

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const isSupported = isPushSupported();

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    registerServiceWorker()
      .then(registration => registration.pushManager.getSubscription())
      .then(subscription => setIsSubscribed(!!subscription))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not check push subscription.'));
  }, [isSupported]);

  const subscribe = async () => {
    setIsBusy(true);
    setError(null);
    try {
      await subscribeToPush();
      setPermission(Notification.permission);
      setIsSubscribed(true);
    } catch (err) {
      setPermission('Notification' in window ? Notification.permission : 'denied');
      setError(err instanceof Error ? err.message : 'Could not enable push notifications.');
      throw err;
    } finally {
      setIsBusy(false);
    }
  };

  const unsubscribe = async () => {
    setIsBusy(true);
    setError(null);
    try {
      await unsubscribeFromPush();
      setIsSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not disable push notifications.');
      throw err;
    } finally {
      setIsBusy(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isBusy,
    permission,
    error,
    subscribe,
    unsubscribe,
  };
}
