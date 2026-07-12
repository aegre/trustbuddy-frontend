import { describe, expect, it } from "vitest";
import {
  formatQuoteCoverageTitle,
  formatQuoteCreatedDate,
  formatQuoteDate,
  formatQuotePremium,
  formatQuotePremiumAmount,
  formatQuoteRef,
  formatQuoteStatus,
  quoteStatusChipColor,
} from "@/features/quotes/utils/format-quote";
import { paths, successHref, wizardPersonalHref } from "@/routes/paths";

describe("formatQuote", () => {
  it("formats premium and status", () => {
    expect(formatQuotePremium(120.5)).toMatch(/120/);
    expect(formatQuotePremium(undefined)).toBe("—");
    expect(formatQuotePremiumAmount(189)).toMatch(/189/);
    expect(formatQuotePremiumAmount(undefined)).toBe("—");
    expect(formatQuoteStatus("DRAFT")).toBe("Draft");
    expect(formatQuoteStatus("SUBMISSION_FAILED")).toBe("Failed");
    expect(formatQuoteStatus(undefined)).toBe("—");
  });

  it("formats coverage titles and refs for list cards", () => {
    expect(formatQuoteCoverageTitle("PREMIUM")).toBe("Premium coverage");
    expect(formatQuoteCoverageTitle("STANDARD")).toBe("Standard coverage");
    expect(formatQuoteCoverageTitle("BASIC")).toBe("Basic coverage");
    expect(formatQuoteCoverageTitle(undefined, "Ada Lovelace")).toBe(
      "Ada Lovelace",
    );
    expect(formatQuoteCoverageTitle(undefined)).toBe("Untitled quote");
    expect(formatQuoteRef("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe(
      "Q-A1B2",
    );
    expect(formatQuoteRef("q-42")).toBe("Q-42");
    expect(formatQuoteRef(undefined)).toBe("—");
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
    expect(formatQuoteCreatedDate("2026-03-14T10:00:00Z")).not.toBe("—");
    expect(formatQuoteCreatedDate(undefined)).toBe("—");
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
