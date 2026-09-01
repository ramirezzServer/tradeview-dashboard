self.addEventListener('push', event => {
  // Icon must be a raster image (PNG/JPG/GIF), not favicon.svg or favicon.ico:
  // - favicon.ico never existed in frontend/public/ (only *.svg files do) -> 404 on every push.
  // - SVG isn't a fix either: Chrome/Chromium (desktop AND Android, most push traffic)
  //   does not render SVG for Notification API icons; only Firefox does. Confirmed via
  //   OneSignal's current docs (lists PNG/JPG/GIF as supported, no SVG) and a Pushpad
  //   Chrome-vs-Firefox test. Safari uses its own PNG .iconset mechanism, also not SVG.
  // 192x192 follows web.dev/web-push-book's sizing (Android 64dp x max devicePixelRatio 3).
  //
  // favicon-192.png is generated FROM the existing favicon.svg (same brand mark), via:
  //   pip install resvg-py
  //   python -c "
  //   import resvg_py
  //   with open('frontend/public/favicon.svg', encoding='utf-8') as f: svg = f.read()
  //   png = resvg_py.svg_to_bytes(svg_string=svg, width=192, height=192)
  //   open('frontend/public/favicon-192.png', 'wb').write(bytes(png))
  //   "
  // resvg-py (bundles the Rust `resvg` renderer, same engine family Firefox uses) was used
  // instead of the more common `cairosvg` because cairosvg needs the native libcairo-2.dll,
  // which isn't installed on this Windows dev machine and isn't something pip alone provides.
  // On Linux/Mac, libcairo is usually already present or a one-line apt/brew install, so
  // cairosvg (`cairosvg favicon.svg -o favicon-192.png --output-width 192 --output-height 192`)
  // is likely simpler there — either tool produces the same PNG from the same source SVG.
  // encoding='utf-8' on open() matters: without it, Windows' default codepage can fail to
  // read the SVG if it ever gains non-ASCII characters (e.g. a copyright symbol in a comment).
  //
  // backend/app/Services/PushNotificationService.php sets the real 'icon' value sent in
  // every push payload — this comment is the single source of truth; keep that path in sync
  // with this one if the icon ever changes.
  const fallback = {
    title: 'TradeView',
    body: 'You have a new market notification.',
    icon: '/favicon-192.png',
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
