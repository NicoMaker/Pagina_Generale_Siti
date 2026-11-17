// Logo Stamp: cache dell'app per usarla anche offline. Cambia VERSION quando aggiorni i file.
const VERSION = "logo-stamp-v5";
const SHELL = [
  "./",
  "css/animations.css",
  "css/base.css",
  "css/components/card.css",
  "css/components/dropzone.css",
  "css/components/export-bar.css",
  "css/components/gallery.css",
  "css/components/header.css",
  "css/components/logo-panel.css",
  "css/components/preview-modal.css",
  "css/components/progress.css",
  "css/components/settings-panel.css",
  "css/components/shortcuts.css",
  "css/components/splash.css",
  "css/components/toast.css",
  "css/components/ui.css",
  "css/layout.css",
  "favicon.ico",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/icon.svg",
  "index.html",
  "js/components/card.js",
  "js/components/dropzone.js",
  "js/components/export-bar.js",
  "js/components/gallery.js",
  "js/components/header.js",
  "js/components/logo-panel.js",
  "js/components/preview-modal.js",
  "js/components/progress.js",
  "js/components/settings-panel.js",
  "js/components/shortcuts.js",
  "js/components/toast.js",
  "js/core/actions.js",
  "js/core/component.js",
  "js/core/exif.js",
  "js/core/exporter.js",
  "js/core/geo.js",
  "js/core/loader.js",
  "js/core/stamp.js",
  "js/core/store.js",
  "js/core/utils.js",
  "js/core/watermark.js",
  "js/main.js",
  "manifest.webmanifest",
  "vendor/jszip.min.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(VERSION)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // OpenStreetMap ecc. passano diretti
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy));
          return res;
        }),
    ),
  );
});
