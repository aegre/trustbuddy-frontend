import { describe, expect } from "vitest";
import test from "vitest-gwt";
import { handlers } from "@/test/msw/handlers";

describe("smoke", () => {
  test("runs the Vitest harness", {
    then: {
      harness_is_ready,
    },
  });

  test("registers Orval MSW handlers", {
    then: {
      handlers_are_registered,
    },
  });
});

function harness_is_ready() {
  expect(true).toBe(true);
}

function handlers_are_registered() {
  expect(handlers.length).toBeGreaterThan(0);
}
