/// <reference lib="WebWorker" />

import { RemixNavigationHandler } from "@remix-pwa/sw";

export type {};
declare let self: ServiceWorkerGlobalScope;

const ASSETS = "asset-cache";
const DOCUMENTS = "page-cache";
const DATA = "data-cache";
const STATIC_ASSETS = ["/build/", "/icons/", "/favicon.ico"];

const messageHandler = new RemixNavigationHandler({
  dataCacheName: DATA,
  documentCacheName: DOCUMENTS,
});

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request.clone()));
});

self.addEventListener("message", (event) => {
  event.waitUntil(messageHandler.handle(event));
});
