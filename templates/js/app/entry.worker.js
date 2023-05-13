/// <reference lib="WebWorker" />

import {
  CacheFirst,
  NetworkFirst,
  RemixNavigationHandler,
  isAssetRequest,
  isDocumentRequest,
  isLoaderRequest,
  logger,
} from "@remix-pwa/sw";

let self;

const ASSETS = "asset-cache";
const DOCUMENTS = "page-cache";
const DATA = "data-cache";

const loaderHandler = new NetworkFirst({
  cacheName: DATA,
  isLoader: true,
});

const documentHandler = new NetworkFirst({
  cacheName: DOCUMENTS,
});

const assetHandler = new CacheFirst({
  cacheName: ASSETS,
});

const fetchHandler = (event) => {
  if (isDocumentRequest(event.request)) {
    return documentHandler.handle(event.request);
  } else if (isLoaderRequest(event.request)) {
    return loaderHandler.handle(event.request);
  } else if (isAssetRequest(event.request)) {
    return assetHandler.handle(event.request);
  }

  return fetch(event.request.clone());
};

const messageHandler = new RemixNavigationHandler();

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetchHandler(event));
});

self.addEventListener("message", (event) => {
  logger.log("message", event.data.isMount);
  event.waitUntil(
    messageHandler.handle(event, {
      caches: {
        DATA,
        PAGES: DOCUMENTS,
      },
    })
  );
});
