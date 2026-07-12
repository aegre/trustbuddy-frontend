import { describe, expect, it } from "vitest";
import {
  formatQuoteDate,
  formatQuotePremium,
  formatQuoteStatus,
} from "@/features/quotes/utils/format-quote";
import { paths, wizardPersonalHref } from "@/routes/paths";

describe("formatQuote", () => {
  it("formats premium and status", () => {
    expect(formatQuotePremium(120.5)).toMatch(/120/);
    expect(formatQuotePremium(undefined)).toBe("—");
    expect(formatQuoteStatus("DRAFT")).toBe("DRAFT");
    expect(formatQuoteStatus(undefined)).toBe("—");
  });

  it("formats dates or em dash", () => {
    expect(formatQuoteDate("2026-01-15T10:00:00Z")).not.toBe("—");
    expect(formatQuoteDate(undefined)).toBe("—");
    expect(formatQuoteDate("not-a-date")).toBe("—");
  });
});

describe("wizardPersonalHref", () => {
  it("builds new and edit hrefs", () => {
    expect(wizardPersonalHref()).toBe(paths.wizardPersonal);
    expect(wizardPersonalHref("q-1")).toBe(
      `${paths.wizardPersonal}?quoteId=q-1`,
    );
  });
});
