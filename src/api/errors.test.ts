import { describe, expect, it } from "vitest";
import { createApiError, getApiErrorMessage, isApiError } from "@/api/errors";

describe("api errors", () => {
  it("detects ApiError shape", () => {
    const error = createApiError(401, { message: "Unauthorized" });
    expect(isApiError(error)).toBe(true);
    expect(isApiError(new Error("nope"))).toBe(false);
  });

  it("reads message from response body", () => {
    const error = createApiError(400, { message: "Invalid credentials" });
    expect(getApiErrorMessage(error)).toBe("Invalid credentials");
  });

  it("falls back when body has no message", () => {
    const error = createApiError(500, {});
    expect(getApiErrorMessage(error, "Request failed")).toBe("Request failed");
  });
});
