const CACHE_NAME = 'enresumido-v4.0.32';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/favicon-48.png',
  '/favicon-16.png',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/apple-touch-icon-180.png',
  '/apple-touch-icon-precomposed.png',
  '/apple-touch-icon-167.png',
  '/apple-touch-icon-152.png',
  '/apple-touch-icon-120.png',
  '/pwa-192.png',
  '/pwa-512.png',
  '/pwa-maskable.png',
  '/pwa-192.svg',
  '/pwa-512.svg',
  '/pwa-maskable.svg'
];

// Install Event: Precaching core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Purge old caches and logos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting obsolete cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Multi-tier offline caching strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and non-http protocols (e.g. chrome-extension://)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Audio streams: bypass SW caching, delegate to IndexedDB (offlineStorage) or native audio streaming
  if (
    request.url.includes('.mp3') ||
    request.url.includes('anchor.fm') ||
    request.headers.get('range')
  ) {
    return;
  }

  // 1. HTML Navigation Requests -> Network First with Offline Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          return fallback || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // 2. Static Assets, Fonts & External Images -> Stale-While-Revalidate (supports basic, cors, opaque)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            (networkResponse.status === 200 || networkResponse.type === 'opaque' || networkResponse.type === 'cors')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// ==========================================================
// PUSH & NOTIFICATION EVENTS
// ==========================================================

// Handle Notification Click in OS tray / lock screen
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const episodeId = event.notification.data ? event.notification.data.episodeId : undefined;
  const targetUrl = (event.notification.data && event.notification.data.url) || (episodeId ? ('/?listen=' + encodeURIComponent(episodeId)) : '/');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (episodeId && 'postMessage' in client) {
            client.postMessage({ type: 'NAVIGATE_EPISODE', episodeId });
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle Background Web Push Notifications
self.addEventListener('push', (event) => {
  let data = {
    title: '⚡ Nuevo Resumen en EnResumido',
    body: 'Hay un nuevo audio resumen disponible. ¡Toca para escucharlo!',
    icon: '/pwa-192.png',
    badge: '/favicon-48.png',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/pwa-192.png',
      badge: data.badge || '/favicon-48.png',
      tag: data.tag || 'enresumido-push',
      renotify: true,
      data: data.data || {},
    })
  );
});