// Service worker mínimo — só o suficiente para o navegador considerar a app "instalável"
// e permitir abrir a última versão vista mesmo com má ligação.
const CACHE = 'cargas-bem-estar-v1';
const SHELL = ['./monitor-cargas.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Estratégia "network-first": tenta sempre a rede primeiro (para dados atuais),
// só usa a cópia guardada se estiver offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(event.request, copy)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
