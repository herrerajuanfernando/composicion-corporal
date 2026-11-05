const CACHE = 'composicion-v5';
const ASSETS = ['./', 'index.html', 'chart.umd.min.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png', 'xlsx.mini.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
const save = (req, res) => {
  if (res.ok && (req.url.startsWith(self.location.origin) || req.url.includes('fonts.g'))) {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy));
  }
  return res;
};
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // La página y el código: primero internet (siempre la versión más nueva); sin conexión, la copia guardada.
  if (req.mode === 'navigate' || /\.(html|js|webmanifest)$/.test(new URL(req.url).pathname)) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => save(req, res))
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html'))));
    return;
  }
  // Íconos y fuentes: primero la copia guardada.
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => save(req, res))));
});
