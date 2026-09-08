const CACHE = 'punchline-high-v2';
const ASSETS = ['./index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Non intercettare le chiamate a Gemini o ad altri servizi esterni
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('workers.dev') || e.request.url.includes('web.val.run')) return;

  // Network-first per tutto il resto: prova sempre a scaricare l'ultima versione,
  // usa la cache solo come riserva se sei offline.
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
