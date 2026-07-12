import { describe, expect, it } from "vitest";
import { handlers } from "@/test/msw/handlers";

describe("smoke", () => {
  it("runs the Vitest harness", () => {
    expect(true).toBe(true);
  });

  it("registers Orval MSW handlers", () => {
    expect(handlers.length).toBeGreaterThan(0);
  });
});
