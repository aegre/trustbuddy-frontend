import { describe, expect } from "vitest";
import test from "vitest-gwt";
import {
  createApiError,
  getApiErrorMessage,
  getUserFacingErrorMessage,
  isApiError,
} from "@/api/errors";

type Context = {
  error?: unknown;
  message?: string;
  fallback?: string;
};

describe("api errors", () => {
  test("detects ApiError shape", {
    given: {
      an_api_error,
    },
    then: {
      is_detected_as_api_error,
      plain_error_is_not_api_error,
    },
  });

  test("reads message from response body", {
    given: {
      api_error_with_message,
    },
    when: {
      reading_api_error_message,
    },
    then: {
      message_comes_from_body,
    },
  });

  test("falls back when body has no message", {
    given: {
      api_error_without_message,
    },
    when: {
      reading_api_error_message_with_fallback,
    },
    then: {
      message_uses_fallback,
    },
  });

  test("shows API message for 4xx user-facing errors", {
    given: {
      a_4xx_api_error,
    },
    when: {
      reading_user_facing_message,
    },
    then: {
      message_comes_from_body,
    },
  });

  test("shows fallback for 5xx user-facing errors", {
    given: {
      a_5xx_api_error,
    },
    when: {
      reading_user_facing_message,
    },
    then: {
      message_uses_fallback,
    },
  });

  test("shows fallback for unknown errors", {
    given: {
      an_unknown_error,
    },
    when: {
      reading_user_facing_message,
    },
    then: {
      message_uses_fallback,
    },
  });
});

function an_api_error(this: Context) {
  this.error = createApiError(401, { message: "Unauthorized" });
}

function api_error_with_message(this: Context) {
  this.error = createApiError(400, { message: "Invalid credentials" });
}

function api_error_without_message(this: Context) {
  this.error = createApiError(500, {});
  this.fallback = "Request failed";
}

function a_4xx_api_error(this: Context) {
  this.error = createApiError(401, { message: "Invalid credentials" });
  this.fallback = "Could not sign in";
}

function a_5xx_api_error(this: Context) {
  this.error = createApiError(500, { message: "NullPointerException at …" });
  this.fallback = "Could not load quotes";
}

function an_unknown_error(this: Context) {
  this.error = new Error("network boom");
  this.fallback = "Could not load quotes";
}

function reading_api_error_message(this: Context) {
  this.message = getApiErrorMessage(this.error);
}

function reading_api_error_message_with_fallback(this: Context) {
  this.message = getApiErrorMessage(this.error, this.fallback);
}

function reading_user_facing_message(this: Context) {
  this.message = getUserFacingErrorMessage(this.error, this.fallback ?? "");
}

function is_detected_as_api_error(this: Context) {
  expect(isApiError(this.error)).toBe(true);
}

function plain_error_is_not_api_error() {
  expect(isApiError(new Error("nope"))).toBe(false);
}

function message_comes_from_body(this: Context) {
  expect(this.message).toBe("Invalid credentials");
}

function message_uses_fallback(this: Context) {
  expect(this.message).toBe(this.fallback);
}
