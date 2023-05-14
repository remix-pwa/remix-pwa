/// <reference lib="WebWorker" />

import { PrecacheHandler, matchAssetRequest, matchDocumentRequest, matchLoaderRequest, remixLoaderPlugin } from "@remix-pwa/sw";
import { registerRoute, setDefaultHandler } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

const PAGES = "page-cache-v1";
const DATA = "data-cache-v1";
const ASSETS = "assets-cache-v1";
const staticAssets = ['/build/', '/icons/']

const messageHandler = new PrecacheHandler({
  dataCacheName: DATA,
  documentCacheName: PAGES,
  assetCacheName: ASSETS
})

// Assets
registerRoute((event) => matchAssetRequest(event, staticAssets),
  new CacheFirst({
    cacheName: ASSETS,
  })
);

// Loaders
registerRoute(
  matchLoaderRequest,
  new NetworkFirst({
    cacheName: DATA,
    plugins: [remixLoaderPlugin],
  })
);

// Documents
registerRoute(
  matchDocumentRequest,
  new NetworkFirst({
    cacheName: PAGES,
  })
);

setDefaultHandler(({ request }) => {
  return fetch(request.clone());
});

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});


self.addEventListener("message", (event) => {
  event.waitUntil(messageHandler.handle(event));
});