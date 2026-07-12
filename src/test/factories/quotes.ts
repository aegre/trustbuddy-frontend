import type { PageQuoteResponse, QuoteResponse } from "@/api/types";

export function createQuoteFixture(
  overrides: Partial<QuoteResponse> = {},
): QuoteResponse {
  return {
    id: "quote-1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    age: 36,
    zipCode: "94105",
    status: "DRAFT",
    estimatedMonthlyPremium: 120.5,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-16T12:00:00Z",
    version: 1,
    ...overrides,
  };
}

export function createQuotesPageFixture(
  overrides: Partial<PageQuoteResponse> = {},
): PageQuoteResponse {
  const content = overrides.content ?? [createQuoteFixture()];
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    size: 20,
    number: 0,
    numberOfElements: content.length,
    first: true,
    last: true,
    empty: content.length === 0,
    ...overrides,
  };
}
