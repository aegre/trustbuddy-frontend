import { describe, expect, it } from "vitest";
import {
  formatQuoteDate,
  formatQuotePremium,
  formatQuoteStatus,
  quoteStatusChipColor,
} from "@/features/quotes/utils/format-quote";
import { paths, successHref, wizardPersonalHref } from "@/routes/paths";

describe("formatQuote", () => {
  it("formats premium and status", () => {
    expect(formatQuotePremium(120.5)).toMatch(/120/);
    expect(formatQuotePremium(undefined)).toBe("—");
    expect(formatQuoteStatus("DRAFT")).toBe("Draft");
    expect(formatQuoteStatus("SUBMISSION_FAILED")).toBe("Failed");
    expect(formatQuoteStatus(undefined)).toBe("—");
  });

  it("maps status to chip colors", () => {
    expect(quoteStatusChipColor("DRAFT")).toBe("info");
    expect(quoteStatusChipColor("SUBMITTED")).toBe("success");
    expect(quoteStatusChipColor("SUBMISSION_FAILED")).toBe("error");
    expect(quoteStatusChipColor("EXPIRED")).toBe("warning");
    expect(quoteStatusChipColor(undefined)).toBe("default");
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

describe("successHref", () => {
  it("builds success confirmation href", () => {
    expect(successHref("q-1")).toBe(`${paths.success}?quoteId=q-1`);
  });
});
