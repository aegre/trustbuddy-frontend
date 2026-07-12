import { describe, expect } from "vitest";
import test from "vitest-gwt";
import {
  isDraftQuote,
  isQuoteEditable,
} from "@/features/wizard/utils/quote-edit-guards";

describe("quote edit guards", () => {
  test("treats missing quote as editable draft flow", {
    then: {
      missing_quote_is_draft,
      missing_quote_is_editable,
    },
  });

  test("allows edit only for DRAFT", {
    then: {
      draft_quote_is_editable,
      non_draft_quotes_are_not_editable,
    },
  });
});

function missing_quote_is_draft() {
  expect(isDraftQuote(undefined)).toBe(true);
  expect(isDraftQuote(null)).toBe(true);
}

function missing_quote_is_editable() {
  expect(isQuoteEditable(undefined)).toBe(true);
}

function draft_quote_is_editable() {
  expect(isQuoteEditable({ status: "DRAFT" })).toBe(true);
  expect(isDraftQuote({ status: "DRAFT" })).toBe(true);
}

function non_draft_quotes_are_not_editable() {
  expect(isQuoteEditable({ status: "SUBMITTED" })).toBe(false);
  expect(isQuoteEditable({ status: "EXPIRED" })).toBe(false);
  expect(isQuoteEditable({ status: "SUBMISSION_FAILED" })).toBe(false);
  expect(isQuoteEditable({ status: undefined })).toBe(false);
}
