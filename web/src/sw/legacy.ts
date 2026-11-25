// The Create React App build registered a Workbox worker at the same URL as
// this one. Its precache shares Workbox's cache name, so Workbox prunes those
// entries itself on activation. Runtime caches that no route fills any more
// are cleaned up here.

/**
 * Runtime caches no current route uses: the CRA worker's `images`, and the
 * Google Fonts caches from before Material Symbols was self-hosted.
 */
export const LEGACY_CACHES = [
  "images",
  "web-ide-google-fonts",
  "web-ide-google-fonts-css",
];

/** CRA emitted its bundles under static/js and static/css; Vite uses assets/. */
const CRA_ASSET = /\/static\/(js|css)\//;

/**
 * True when a precache still holds CRA build output, meaning this worker is
 * replacing the CRA worker and any open tab is running the CRA app.
 */
export async function hasLegacyPrecache(storage: CacheStorage) {
  for (const name of await storage.keys()) {
    if (!name.includes("-precache-")) continue;
    const cache = await storage.open(name);
    const requests = await cache.keys();
    if (
      requests.some((request) => CRA_ASSET.test(new URL(request.url).pathname))
    ) {
      return true;
    }
  }
  return false;
}

/** Deletes the legacy runtime caches. Resolves to the names that were deleted. */
export async function deleteLegacyCaches(storage: CacheStorage) {
  const names = await storage.keys();
  const legacy = names.filter((name) => LEGACY_CACHES.includes(name));
  await Promise.all(legacy.map((name) => storage.delete(name)));
  return legacy;
}
