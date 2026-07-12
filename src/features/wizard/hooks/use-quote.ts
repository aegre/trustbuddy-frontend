import type { UseQueryOptions } from "@tanstack/react-query";
import {
  useGetQuote,
  type getQuoteResponse,
} from "@/api/generated/quotes/quotes";
import type { QuoteResponse } from "@/api/types";

export type UseQuoteOptions = {
  query?: Omit<
    UseQueryOptions<getQuoteResponse, unknown, QuoteResponse>,
    "queryKey" | "queryFn" | "select"
  >;
};

/**
 * Thin wrapper over Orval `useGetQuote`.
 * Enabled only when `quoteId` is present (new-quote flow skips the fetch).
 * Selects `QuoteResponse` from the fetch envelope.
 */
export function useQuote(
  quoteId: string | undefined,
  options: UseQuoteOptions = {},
) {
  return useGetQuote(quoteId ?? "", {
    query: {
      ...options.query,
      enabled: Boolean(quoteId) && (options.query?.enabled ?? true),
      select: (response) => response.data,
    },
  });
}
