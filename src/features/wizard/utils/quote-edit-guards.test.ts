import { describe, expect, it } from "vitest";
import {
  isDraftQuote,
  isQuoteEditable,
} from "@/features/wizard/utils/quote-edit-guards";

describe("quote edit guards", () => {
  it("treats missing quote as editable draft flow", () => {
    expect(isDraftQuote(undefined)).toBe(true);
    expect(isDraftQuote(null)).toBe(true);
    expect(isQuoteEditable(undefined)).toBe(true);
  });

  it("allows edit only for DRAFT", () => {
    expect(isQuoteEditable({ status: "DRAFT" })).toBe(true);
    expect(isDraftQuote({ status: "DRAFT" })).toBe(true);

    expect(isQuoteEditable({ status: "SUBMITTED" })).toBe(false);
    expect(isQuoteEditable({ status: "EXPIRED" })).toBe(false);
    expect(isQuoteEditable({ status: "SUBMISSION_FAILED" })).toBe(false);
    expect(isQuoteEditable({ status: undefined })).toBe(false);
  });
});
