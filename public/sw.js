// Service worker — enables PWA install + caches API responses for offline use.

const CACHE_NAME = "si-imsak-v1";
const API_CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only cache own API schedule responses (network-first, cache fallback)
  if (url.origin === self.location.origin && url.pathname === "/api/schedule") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              // Store with timestamp header for TTL
              const headers = new Headers(clone.headers);
              headers.set("sw-cached-at", Date.now().toString());
              const cachedResponse = new Response(clone.body, {
                status: clone.status,
                statusText: clone.statusText,
                headers,
              });
              cache.put(event.request, cachedResponse);
            });
          }
          return response;
        })
        .catch(() =>
          caches.open(CACHE_NAME).then((cache) =>
            cache.match(event.request).then((cached) => {
              if (cached) {
                const cachedAt = Number(cached.headers.get("sw-cached-at") || 0);
                if (Date.now() - cachedAt < API_CACHE_MAX_AGE) {
                  return cached;
                }
                cache.delete(event.request);
              }
              return new Response(
                JSON.stringify({ status: false, error: "Offline" }),
                { status: 503, headers: { "Content-Type": "application/json" } }
              );
            })
          )
        )
    );
    return;
  }

  // All other requests: network-only
  event.respondWith(fetch(event.request));
});
