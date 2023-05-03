/// <reference lib="WebWorker" />

import { CacheFirst, NetworkFirst, PrecacheHandler, matchRequest } from "@remix-pwa/sw";

export type {};
declare let self: ServiceWorkerGlobalScope;

const PAGES = "page-cache";
const DATA = "data-cache";
const ASSETS = "assets-cache";
const staticAssets = ["/build/", "/icons/"];

const assetHandler = new CacheFirst({ cacheName: ASSETS });
const pageHandler = new NetworkFirst({ cacheName: PAGES });
const dataHandler = new NetworkFirst({ cacheName: DATA, isLoader: true });

const precacheHandler = new PrecacheHandler();

const fetchHandler = async (event: FetchEvent): Promise<Response> => {
  const { request } = event;
  const match = matchRequest(request, staticAssets);

  switch (match) {
    case "asset":
      return assetHandler.handle(request);
    case "document":
      return pageHandler.handle(request);
    case "loader":
      return dataHandler.handle(request);
    default:
      return fetch(request.clone());
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  event.waitUntil(precacheHandler.handle(event, {
    caches: {
      DOCUMENT_CACHE: PAGES,
      DATA_CACHE: DATA,
      ASSET_CACHE: ASSETS,
    }
  }));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetchHandler(event));
});