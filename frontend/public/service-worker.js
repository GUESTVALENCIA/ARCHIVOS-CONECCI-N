
// Heian PWA Service Worker
const VERSION = 'heian-pwa-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const STATIC_ASSETS = [
  '/',
  '/app/heian',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/apple-touch-icon.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Strategy helpers
async function cacheFirst(request, cacheName=STATIC_CACHE) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  cache.put(request, res.clone());
  return res;
}

async function networkFirst(request, cacheName=PAGE_CACHE) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    cache.put(request, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Fallback simple: home
    return caches.match('/app/heian') || new Response('Offline', { status: 503 });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass non-GET and all /api/* (never cache), also SDP/voice
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return; // go to network
  }

  // HTML pages → network-first
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets → cache-first
  const ext = url.pathname.split('.').pop()?.toLowerCase() || '';
  const staticExts = ['js','css','png','jpg','jpeg','gif','svg','webp','ico','woff','woff2','ttf','otf','map'];
  if (staticExts.includes(ext)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request));
});
