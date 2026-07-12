import type { QuoteResponse } from "@/api/types";

export type QuoteStatusLike = Pick<QuoteResponse, "status"> | null | undefined;

export function isDraftQuote(quote: QuoteStatusLike): boolean {
  if (quote == null) {
    return true;
  }
  return quote.status === "DRAFT";
}

export function isQuoteEditable(quote: QuoteStatusLike): boolean {
  return isDraftQuote(quote);
}

/** Draft or failed submit may call POST /submit (retry). */
export function canSubmitQuote(quote: QuoteStatusLike): boolean {
  if (quote == null) {
    return false;
  }
  return quote.status === "DRAFT" || quote.status === "SUBMISSION_FAILED";
}
