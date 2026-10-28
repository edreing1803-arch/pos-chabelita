// Service worker del POS Moles Chabelita.
// IMPORTANTE: cada vez que subas cambios a index.html, aumenta VERSION
// para que los teléfonos descarguen la versión nueva.
const VERSION = 'pos-v3';
const APP = ['./', './index.html', './manifest.json',
             './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'pos-imagenes').map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // La API de Google Sheets no se cachea aquí: la app ya guarda su propia copia en localStorage.
  if (url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')) return;

  // La app (HTML): primero internet para recibir actualizaciones; sin señal, la copia guardada.
  if (req.mode === 'navigate' || url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        const copia = res.clone();
        caches.open(VERSION).then(c => c.put(req, copia));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Imágenes de productos y logo: se guardan la primera vez para verse sin internet.
  if (req.destination === 'image') {
    e.respondWith(
      caches.open('pos-imagenes').then(c =>
        c.match(req).then(r => r || fetch(req).then(res => { c.put(req, res.clone()); return res; }))
      ).catch(() => fetch(req))
    );
  }
});
