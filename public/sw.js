const CACHE_PREFIX = "comptes-assets-";
const CACHE_NAME = `${CACHE_PREFIX}v4`;
const APP_ROUTES = ["/", "/moviments", "/moviments/nou", "/moviments/nou/despesa", "/moviments/nou/ingres", "/moviments/nou/transferencia", "/moviments/nou/estalvi", "/moviments/editar", "/estadistiques", "/comptes", "/comptes/nou", "/comptes/editar", "/configuracio"];
const APP_SHELL = [...APP_ROUTES, "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];

const routeKey = (url) => new Request(`${url.origin}${url.pathname}`, { method: "GET" });
const rscKey = (url) => new Request(`${url.origin}/__comptes_rsc_cache__${url.pathname}`, { method: "GET" });

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) =>
    Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => undefined)))
  ));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  const isRsc = request.headers.get("RSC") === "1" || url.searchParams.has("_rsc");
  if (request.mode === "navigate" || isRsc) {
    const key = isRsc ? rscKey(url) : routeKey(url);
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(key, response.clone())));
        return response;
      }).catch(async () => (await caches.match(key)) || Response.error())
    );
    return;
  }

  if (url.pathname.startsWith("/_next/") || ["style", "script", "image", "font"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok) event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone())));
        return response;
      }))
    );
  }
});
