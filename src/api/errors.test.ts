import { describe, expect, it } from "vitest";
import {
  createApiError,
  getApiErrorMessage,
  getUserFacingErrorMessage,
  isApiError,
} from "@/api/errors";

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

  it("given_4xx_when_userFacing_then_showsApiMessage", () => {
    const error = createApiError(401, { message: "Invalid credentials" });
    expect(getUserFacingErrorMessage(error, "Could not sign in")).toBe(
      "Invalid credentials",
    );
  });

  it("given_5xx_when_userFacing_then_showsFallback", () => {
    const error = createApiError(500, { message: "NullPointerException at …" });
    expect(getUserFacingErrorMessage(error, "Could not load quotes")).toBe(
      "Could not load quotes",
    );
  });

  it("given_unknownError_when_userFacing_then_showsFallback", () => {
    expect(
      getUserFacingErrorMessage(
        new Error("network boom"),
        "Could not load quotes",
      ),
    ).toBe("Could not load quotes");
  });
});
