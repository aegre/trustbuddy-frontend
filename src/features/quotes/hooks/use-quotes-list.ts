import type { UseQueryOptions } from "@tanstack/react-query";
import {
  useListQuotes,
  type listQuotesResponse,
} from "@/api/generated/quotes/quotes";
import type { ListQuotesParams, PageQuoteResponse } from "@/api/types";

/** Fixed list paging for Phase 3 (pagination UI later). */
export const QUOTES_LIST_DEFAULTS: Required<
  Pick<ListQuotesParams, "page" | "size">
> & { sort: string[] } = {
  page: 0,
  size: 20,
  sort: ["createdAt,desc"],
};

export type UseQuotesListOptions = {
  params?: ListQuotesParams;
  query?: Omit<
    UseQueryOptions<listQuotesResponse, unknown, PageQuoteResponse>,
    "queryKey" | "queryFn" | "select"
  >;
};

/**
 * Thin wrapper over Orval `useListQuotes` with dashboard defaults.
 * Selects `PageQuoteResponse` from the fetch envelope.
 */
export function useQuotesList(options: UseQuotesListOptions = {}) {
  const params: ListQuotesParams = {
    page: options.params?.page ?? QUOTES_LIST_DEFAULTS.page,
    size: options.params?.size ?? QUOTES_LIST_DEFAULTS.size,
    sort: options.params?.sort ?? QUOTES_LIST_DEFAULTS.sort,
  };

  return useListQuotes(params, {
    query: {
      ...options.query,
      select: (response) => response.data,
    },
  });
}
