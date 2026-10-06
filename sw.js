// Offline: the app shell and images are precached; Google Fonts are cached on first use.
const VERSION = "v5";
const SHELL = "hw-shell-" + VERSION, FONTS = "hw-fonts";
const GIFS = ["0mB6wHO", "1jXLYEw", "1kB3Wmk", "3uj0Ozg", "9E25EOx", "A6wtbuL", "BJ0Hz5L", "C5jncD2", "DFGXwZr", "GSDioYu", "I4hDWkc", "NbVPDMW", "PdmaD0N", "QChZi3x", "QY39eBr", "VBAWRPG", "X7jbxra", "jV65tKx", "m0tCHqc", "rR0LJzx", "rearfly", "uL9CsKm", "uOV3Itw", "xifhB5W", "yn8yg1r"];
const STILLS = ["1kB3Wmk", "9E25EOx", "A6wtbuL", "BJ0Hz5L", "I4hDWkc", "NbVPDMW", "PdmaD0N", "VBAWRPG", "rR0LJzx", "rearfly", "yn8yg1r"];
const FILES = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"]
  .concat(["icons/icon-512-maskable.png"], GIFS.map(id => "img/" + id + ".gif"), ...STILLS.map(id => ["img/" + id + "-a.webp", "img/" + id + "-b.webp"]));

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("hw-shell-") && k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONTS).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  // Page: network first so updates show up, cache when offline. Everything else: cache first.
  if (req.mode === "navigate" || url.pathname.endsWith("/index.html")) {
    e.respondWith(fetch(req, { cache: "no-cache" }).then(r => { const copy = r.clone(); caches.open(SHELL).then(c => c.put("index.html", copy)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(SHELL).then(c => c.put(req, copy)); }
    return r;
  })));
});
