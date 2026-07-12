import { describe, expect, it } from "vitest";
import {
  canSubmitQuote,
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

  it("allows submit for DRAFT and SUBMISSION_FAILED only", () => {
    expect(canSubmitQuote({ status: "DRAFT" })).toBe(true);
    expect(canSubmitQuote({ status: "SUBMISSION_FAILED" })).toBe(true);
    expect(canSubmitQuote({ status: "SUBMITTED" })).toBe(false);
    expect(canSubmitQuote({ status: "EXPIRED" })).toBe(false);
    expect(canSubmitQuote(undefined)).toBe(false);
    expect(canSubmitQuote(null)).toBe(false);
  });
});
