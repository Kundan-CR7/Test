/* global self, caches, fetch, URL */

const CACHE_NAME = 'production-entry-v12';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-192.png',
  '/icons/maskable-512.png',
];

function sameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function assetUrlsFromHtml(html) {
  const urls = new Set(CORE_ASSETS);
  const pattern = /\b(?:src|href)="([^"]+)"/g;
  let match = pattern.exec(html);

  while (match !== null) {
    const url = new URL(match[1], self.location.origin);
    if (url.origin === self.location.origin) {
      urls.add(url.pathname + url.search);
    }
    match = pattern.exec(html);
  }

  return Array.from(urls);
}

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const indexResponse = await fetch('/', { cache: 'reload' });
  const html = await indexResponse.clone().text();
  await cache.put('/', indexResponse.clone());
  await cache.put('/index.html', indexResponse);

  const urls = assetUrlsFromHtml(html);
  await Promise.allSettled(
    urls.map(async (url) => {
      const response = await fetch(url, { cache: 'reload' });
      if (response.ok) await cache.put(url, response);
    }),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (
      (await cache.match(request)) ||
      (await cache.match('/')) ||
      (await cache.match('/index.html'))
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !sameOrigin(request)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (
    ['script', 'style', 'image', 'font', 'manifest', 'worker'].includes(
      request.destination,
    )
  ) {
    event.respondWith(cacheFirst(request));
  }
});
