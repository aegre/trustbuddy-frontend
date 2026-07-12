import { describe, expect, it } from "vitest";
import { wizardHref } from "@/features/wizard/utils/wizard-href";
import { paths } from "@/routes/paths";

describe("wizardHref", () => {
  it("builds step paths without quoteId", () => {
    expect(wizardHref("personal")).toBe(paths.wizardPersonal);
    expect(wizardHref("coverage")).toBe(`${paths.wizardBase}/coverage`);
    expect(wizardHref("review")).toBe(`${paths.wizardBase}/review`);
  });

  it("appends quoteId query when provided", () => {
    expect(wizardHref("personal", { quoteId: "q-1" })).toBe(
      `${paths.wizardPersonal}?quoteId=q-1`,
    );
    expect(wizardHref("coverage", { quoteId: "q-1" })).toBe(
      `${paths.wizardBase}/coverage?quoteId=q-1`,
    );
  });
});
