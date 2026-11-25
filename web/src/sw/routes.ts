// Request matchers for the service worker, kept free of worker globals so they
// can be unit tested.

const FILE_EXTENSION = /\/[^/]+\.[^/]+$/;

/** A page navigation inside the app, as opposed to opening a file such as a PDF. */
export function isAppNavigation(
  request: Pick<Request, "mode">,
  url: URL,
  origin: string,
  base: string,
): boolean {
  return (
    request.mode === "navigate" &&
    url.origin === origin &&
    url.pathname.startsWith(base) &&
    !FILE_EXTENSION.test(url.pathname)
  );
}

/** User guide screenshots, which are too large to precache. */
export function isUserGuideImage(
  url: URL,
  origin: string,
  base: string,
): boolean {
  return (
    url.origin === origin &&
    url.pathname.startsWith(`${base}user_guide/`) &&
    url.pathname.endsWith(".png")
  );
}
