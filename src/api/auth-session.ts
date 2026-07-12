/**
 * Lets AuthProvider clear UI session when customFetch sees 401 on
 * authenticated API calls (expired/invalid cookie).
 */

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(
  handler: UnauthorizedHandler | null,
): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}

/** Login/logout failures must not clear (or recurse on) session handling. */
export function shouldNotifyUnauthorized(url: string): boolean {
  const path = url.split("?")[0] ?? url;
  return (
    !path.endsWith("/api/v1/auth/token") &&
    !path.endsWith("/api/v1/auth/logout")
  );
}
