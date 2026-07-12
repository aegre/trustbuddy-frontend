import { describe, expect, it, vi } from "vitest";
import {
  notifyUnauthorized,
  setUnauthorizedHandler,
  shouldNotifyUnauthorized,
} from "@/api/auth-session";
import { customFetch } from "@/api/mutator/custom-fetch";

describe("auth-session", () => {
  it("skips notify for login and logout urls", () => {
    expect(shouldNotifyUnauthorized("/api/v1/auth/token")).toBe(false);
    expect(shouldNotifyUnauthorized("/api/v1/auth/logout")).toBe(false);
    expect(shouldNotifyUnauthorized("/api/v1/auth/me")).toBe(true);
    expect(shouldNotifyUnauthorized("/api/v1/quotes")).toBe(true);
  });

  it("invokes registered unauthorized handler", () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    notifyUnauthorized();
    expect(handler).toHaveBeenCalledTimes(1);
    setUnauthorizedHandler(null);
  });
});

describe("customFetch unauthorized", () => {
  it("notifies on 401 for authenticated endpoints", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(customFetch("/api/v1/quotes")).rejects.toMatchObject({
      status: 401,
    });
    expect(handler).toHaveBeenCalledTimes(1);

    setUnauthorizedHandler(null);
    vi.restoreAllMocks();
  });

  it("does not notify on 401 for login token", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(customFetch("/api/v1/auth/token")).rejects.toMatchObject({
      status: 401,
    });
    expect(handler).not.toHaveBeenCalled();

    setUnauthorizedHandler(null);
    vi.restoreAllMocks();
  });
});
