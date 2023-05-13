/// <reference lib="WebWorker" />

import {
  RemixNavigationHandler,
  remixLoaderPlugin,
  matchAssetRequest,
  matchLoaderRequest,
  matchDocumentRequest,
} from "@remix-pwa/sw";
import { registerRoute, setDefaultHandler } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";

export type {};
declare let self: ServiceWorkerGlobalScope;

const PAGES = "page-cache-v1";
const DATA = "data-cache-v1";
const ASSETS = "assets-cache-v1";
const staticAssets = ["/build/", "/icons/"];

// Assets
registerRoute(
  (event) => matchAssetRequest(event, staticAssets),
  new CacheFirst({
    cacheName: ASSETS,
  }),
);

// Loaders
registerRoute(
  matchLoaderRequest,
  new NetworkFirst({
    cacheName: DATA,
    plugins: [remixLoaderPlugin],
  }),
);

// Documents
registerRoute(
  matchDocumentRequest,
  new NetworkFirst({
    cacheName: PAGES,
  }),
);

const messageHandler = new RemixNavigationHandler();

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
  event.waitUntil(
    messageHandler.handle(event, {
      caches: {
        DATA: DATA,
        PAGES: PAGES,
      },
    }),
  );
});
