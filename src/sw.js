importScripts("https://storage.googleapis.com/workbox-cdn/releases/5.1.3/workbox-sw.js");

const { registerRoute } = workbox.routing;
const { CacheFirst, StaleWhileRevalidate } = workbox.strategies;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { ExpirationPlugin } = workbox.expiration;
const { skipWaiting, clientsClaim, setCacheNameDetails } = workbox.core;

var VERSION = "v1.5.2";
setCacheNameDetails({
    prefix: "cuisine-ead",
    suffix: VERSION,
});

skipWaiting();
clientsClaim();

self.addEventListener("activate", function () {
    console.log("Service Worker version", VERSION);
});

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
    /^https:\/\/fonts\.googleapis\.com/,
    new StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
    })
);

registerRoute(
    /^https:\/\/cdn\.usefathom\.com/,
    new StaleWhileRevalidate({
        cacheName: "fathom-analytics",
    })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
    /^https:\/\/fonts\.gstatic\.com/,
    new CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30,
            }),
        ],
    })
);
