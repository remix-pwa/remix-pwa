/// <reference lib="WebWorker" />

import { json } from "@remix-run/server-runtime";
import type { AssetsManifest } from "@remix-run/react/dist/entry";
import type { EntryRoute } from "@remix-run/react/dist/routes";

export type {};
declare let self: ServiceWorkerGlobalScope;

function debug(...messages: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug(...messages);
  }
}

async function handleInstall(event: ExtendableEvent) {
  debug("Service worker installed");
}

async function handleActivate(event: ExtendableEvent) {
  debug("Service worker activated");
}

const ASSET_CACHE = "asset-cache";
const DATA_CACHE = "data-cache";
const DOCUMENT_CACHE = "document-cache";
const STATIC_ASSETS = ["/build/", "/icons/"];

async function handleSyncRemixManifest(event: ExtendableMessageEvent) {
  console.debug("sync manifest");
  const cachePromises: Map<string, Promise<void>> = new Map();
  const [dataCache, documentCache, assetCache] = await Promise.all([
    caches.open(DATA_CACHE),
    caches.open(DOCUMENT_CACHE),
    caches.open(ASSET_CACHE),
  ]);
  const manifest: AssetsManifest = event.data.manifest;
  const routes = Object.values(manifest.routes);

  for (const route of routes) {
    if (route.id.includes("$")) {
      console.debug("parametrized route", route.id);
      continue;
    }

    cacheRoute(route);
  }

  await Promise.all(cachePromises.values());

  function cacheRoute(route: EntryRoute) {
    const pathname = getPathname(route);
    if (route.hasLoader) {
      cacheLoaderData(route);
    }

    if (route.module) {
      cachePromises.set(route.module, cacheAsset(route.module));
    }

    if (route.imports) {
      for (const assetUrl of route.imports) {
        debug(route.index, route.parentId, route.imports, route.module);
        if (cachePromises.has(assetUrl)) {
          continue;
        }

        cachePromises.set(assetUrl, cacheAsset(assetUrl));
      }
    }

    cachePromises.set(
      pathname,
      documentCache.add(pathname).catch((error) => {
        console.debug(`Failed to cache document ${pathname}:`, error);
      }),
    );
  }

  function cacheLoaderData(route: EntryRoute) {
    const pathname = getPathname(route);
    const params = new URLSearchParams({ _data: route.id });
    const search = `?${params.toString()}`;
    const url = pathname + search;
    if (!cachePromises.has(url)) {
      console.debug("Caching data for", url);
      cachePromises.set(
        url,
        dataCache.add(url).catch((error) => {
          console.debug(`Failed to cache data for ${url}:`, error);
        }),
      );
    }
  }

  async function cacheAsset(assetUrl: string) {
    if (await assetCache.match(assetUrl)) {
      return;
    }

    console.debug("Caching asset", assetUrl);
    return assetCache.add(assetUrl).catch((error) => {
      console.debug(`Failed to cache asset ${assetUrl}:`, error);
    });
  }

  function getPathname(route: EntryRoute) {
    let pathname = "";
    if (route.path && route.path.length > 0) {
      pathname = "/" + route.path;
    }
    if (route.parentId) {
      const parentPath = getPathname(manifest.routes[route.parentId]);
      if (parentPath) {
        pathname = parentPath + pathname;
      }
    }
    return pathname;
  }
}

async function handleFetch(event: FetchEvent): Promise<Response> {
  const url = new URL(event.request.url);

  if (isAssetRequest(event.request)) {
    const cached = await caches.match(event.request, {
      cacheName: ASSET_CACHE,
      ignoreVary: true,
      ignoreSearch: true,
    });
    if (cached) {
      debug("Serving asset from cache", url.pathname);
      return cached;
    }

    debug("Serving asset from network", url.pathname);
    const response = await fetch(event.request);
    if (response.status === 200) {
      const cache = await caches.open(ASSET_CACHE);
      await cache.put(event.request, response.clone());
    }
    return response;
  }

  if (isLoaderRequest(event.request)) {
    try {
      debug("Serving data from network", url.pathname + url.search);
      const response = await fetch(event.request.clone());
      const cache = await caches.open(DATA_CACHE);
      await cache.put(event.request, response.clone());
      return response;
    } catch (error) {
      debug("Serving data from network failed, falling back to cache", url.pathname + url.search);
      const response = await caches.match(event.request);
      if (response) {
        response.headers.set("X-Remix-Worker", "yes");
        return response;
      }

      return json(
        { message: "Network Error" },
        {
          status: 500,
          headers: { "X-Remix-Catch": "yes", "X-Remix-Worker": "yes" },
        },
      );
    }
  }

  if (isDocumentGetRequest(event.request)) {
    const url = new URL(event.request.url);
    console.debug("Serving document from network", url.pathname);
    return caches.open(DOCUMENT_CACHE).then((cache) =>
      fetch(event.request.clone())
        .then((response) => {
          cache.put(event.request, response.clone());
          return response;
        })
        .catch(async (error) => {
          console.debug("Serving document from network failed, falling back to cache", url.pathname);
          const response = await caches.match(event.request);
          if (!response) {
            throw error;
          }
          return response;
        }),
    );
  }

  return fetch(event.request.clone());
}

const handlePush = (event: PushEvent) => {
  const data = JSON.parse(event?.data!.text());
  const title = data.title ? data.title : "Remix PWA";

  const options = {
    body: data.body ? data.body : "Notification Body Text",
    icon: data.icon ? data.icon : "/icons/android-icon-192x192.png",
    badge: data.badge ? data.badge : "/icons/android-icon-48x48.png",
    dir: data.dir ? data.dir : "auto",
    image: data.image ? data.image : undefined,
    silent: data.silent ? data.silent : false,
  };

  self.registration.showNotification(title, {
    ...options,
  });
};

function isMethod(request: Request, methods: string[]) {
  return methods.includes(request.method.toLowerCase());
}

function isAssetRequest(request: Request) {
  return isMethod(request, ["get"]) && STATIC_ASSETS.some((publicPath) => request.url.startsWith(publicPath));
}

function isLoaderRequest(request: Request) {
  const url = new URL(request.url);
  return isMethod(request, ["get"]) && url.searchParams.get("_data");
}

function isDocumentGetRequest(request: Request) {
  return isMethod(request, ["get"]) && request.mode === "navigate";
}

self.addEventListener("install", (event) => {
  event.waitUntil(handleInstall(event).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(handleActivate(event).then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  // event.waitUntil(handleMessage(event));
  event.waitUntil(handleSyncRemixManifest(event));
});

self.addEventListener("push", (event) => {
  // self.clients.matchAll().then(function (c) {
  // if (c.length === 0) {
  event.waitUntil(handlePush(event));
  // } else {
  //   console.log("Application is already open!");
  // }
  // });
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const result = {} as { error: unknown; response: Response } | { error: undefined; response: Response };
      try {
        result.response = await handleFetch(event);
      } catch (error) {
        result.error = error;
      }

      return appHandleFetch(event, result);
    })(),
  );
});

async function appHandleFetch(
  event: FetchEvent,
  { error, response }: { error: unknown; response: Response } | { error: undefined; response: Response },
): Promise<Response> {
  return response;
}
