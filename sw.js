// Service worker del POS Moles Chabelita.
// IMPORTANTE: cada vez que subas cambios a index.html, aumenta VERSION
// para que los teléfonos descarguen la versión nueva.
const VERSION = 'pos-v21';
// Cada copia de la app (carpeta distinta en el mismo sitio) usa sus propios cachés
const PREFIJO = self.registration.scope + '::';
const CACHE_APP = PREFIJO + VERSION;
const CACHE_IMG = PREFIJO + 'imagenes';
const APP = ['./', './index.html', './manifest.json',
             './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_APP).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k =>
        (k.startsWith(PREFIJO) && k !== CACHE_APP && k !== CACHE_IMG) ||   // versiones viejas de ESTA copia
        /^pos-v\d+$/.test(k) || k === 'pos-imagenes'                        // cachés de antes de este cambio
      ).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // El catálogo (carpeta catalogo/) y la app de San Vicente (carpeta sv/) son otras páginas: no se mezclan
  const BASE = new URL(self.registration.scope).pathname;
  if (url.pathname.startsWith(BASE + 'catalogo/') || url.pathname.startsWith(BASE + 'sv/')) return;

  // La API de Google Sheets no se cachea aquí: la app ya guarda su propia copia.
  if (url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')) return;

  // La app (HTML): primero internet para recibir actualizaciones; sin señal, la copia guardada.
  if (req.mode === 'navigate' || url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        const copia = res.clone();
        caches.open(CACHE_APP).then(c => c.put(req, copia));
        return res;
      }).catch(() => caches.match(req, { cacheName: CACHE_APP }).then(r => r || caches.match(new URL('./index.html', self.registration.scope).href)))
    );
    return;
  }

  // Imágenes de productos y logo: se guardan la primera vez para verse sin internet.
  if (req.destination === 'image') {
    e.respondWith(
      caches.open(CACHE_IMG).then(c =>
        c.match(req).then(r => r || fetch(req).then(res => { c.put(req, res.clone()); return res; }))
      ).catch(() => fetch(req))
    );
  }
});
