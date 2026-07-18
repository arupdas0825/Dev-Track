import { defaultCache } from "@serwist/next/worker";
import { installSerwist } from "@serwist/sw";
import { NetworkOnly, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: WorkerGlobalScope;

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Never cache Firebase Auth, Firestore, or GitHub API calls — this data must always stay live.
    // Explicitly intercept and force NetworkOnly for all live API calls before checking defaultCache.
    {
      matcher: ({ url }) =>
        url.hostname.endsWith("googleapis.com") ||
        url.hostname.endsWith("firebaseio.com") ||
        url.hostname.endsWith("firebaseapp.com") ||
        url.hostname === "api.github.com",
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        revision: "1",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});
