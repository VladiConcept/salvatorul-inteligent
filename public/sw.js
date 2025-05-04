const CACHE_NAME = 'my-awesome-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/chat.html',
  '/manual.html',
  '/quiz.html',
  'videoclipuri.html',
  '/style.css',
  '/index.js',
  '/chat.js',
  '/quiz.js',
  '/videoclipuri.js',
  '/background.jpg',
  '/MANUAL PRIM AJUTOR.pdf',
  '/icons/haus.png',
  '/icons/info.png',
  '/icons/logo nou.png',
  '/icons/manual.png',
  '/icons/quiz.png',
  '/icons/salv1.png',
  '/icons/salv2.png',
  '/icons/yt.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching resources...');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
