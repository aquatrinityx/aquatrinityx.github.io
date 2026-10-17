/* AquaLife service worker (hosted build) - root scope: controls the game page.
   Network-first for navigations so updates land immediately; cache is the
   offline fallback. Saves live in localStorage and are never touched. */
var CACHE = 'aqualife-shell-v1';
var CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png',
            './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(CORE.map(function (u) {
      return c.add(u).catch(function () {});
    }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(function (r) {
      var cp = r.clone();
      caches.open(CACHE).then(function (c) { c.put('./index.html', cp); });
      return r;
    }).catch(function () {
      return caches.match('./index.html').then(function (m) { return m || caches.match(req); });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function (m) { return m || fetch(req); }));
});
