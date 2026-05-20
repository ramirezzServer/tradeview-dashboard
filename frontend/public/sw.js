self.addEventListener('push', event => {
  const fallback = {
    title: 'TradeView',
    body: 'You have a new market notification.',
    icon: '/favicon.ico',
    url: '/',
  };

  const data = event.data ? event.data.json() : fallback;
  const title = data.title || fallback.title;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || fallback.body,
      icon: data.icon || fallback.icon,
      data: {
        url: data.url || fallback.url,
      },
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});
