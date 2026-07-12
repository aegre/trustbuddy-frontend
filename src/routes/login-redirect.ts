import { paths } from "@/routes/paths";

/**
 * Safe in-app return path from React Router location state (`from`).
 * Used after login and when an authenticated user hits a guest-only route.
 */
export function redirectPathFromLocationState(state: unknown): string {
  if (
    typeof state === "object" &&
    state !== null &&
    "from" in state &&
    typeof state.from === "string" &&
    state.from.startsWith("/") &&
    !state.from.startsWith("//")
  ) {
    return state.from;
  }
  return paths.home;
}
