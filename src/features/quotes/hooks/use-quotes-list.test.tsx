import { waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { useQuotesList } from "@/features/quotes/hooks/use-quotes-list";
import { createQuotesPageFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/render";

describe("useQuotesList", () => {
  it("given_quotesExist_when_fetched_then_returnsPageContent", async () => {
    const page = createQuotesPageFixture({
      content: [
        {
          id: "q-1",
          name: "Grace Hopper",
          email: "grace@example.com",
          status: "DRAFT",
          estimatedMonthlyPremium: 99,
          createdAt: "2026-02-01T00:00:00Z",
          updatedAt: "2026-02-02T00:00:00Z",
        },
      ],
    });

    server.use(
      http.get("*/api/v1/quotes", () =>
        HttpResponse.json(page, { status: 200 }),
      ),
    );

    const { result } = renderHookWithProviders(() => useQuotesList());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.content).toEqual(page.content);
    expect(result.current.data?.totalElements).toBe(1);
  });

  it("given_emptyList_when_fetched_then_returnsEmptyPage", async () => {
    server.use(
      http.get("*/api/v1/quotes", () =>
        HttpResponse.json(
          createQuotesPageFixture({ content: [], empty: true }),
          {
            status: 200,
          },
        ),
      ),
    );

    const { result } = renderHookWithProviders(() => useQuotesList());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.content).toEqual([]);
    expect(result.current.data?.empty).toBe(true);
  });

  it("given_apiError_when_fetched_then_exposesError", async () => {
    server.use(
      http.get("*/api/v1/quotes", () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );

    const { result } = renderHookWithProviders(() => useQuotesList());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("given_customPageParam_when_fetched_then_forwardsPageToRequest", async () => {
    let requestedPage: string | null = null;
    server.use(
      http.get("*/api/v1/quotes", ({ request }) => {
        const url = new URL(request.url);
        requestedPage = url.searchParams.get("page");
        return HttpResponse.json(
          createQuotesPageFixture({
            number: 2,
            totalPages: 4,
            first: false,
            last: false,
          }),
          { status: 200 },
        );
      }),
    );

    const { result } = renderHookWithProviders(() =>
      useQuotesList({ params: { page: 2 } }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(requestedPage).toBe("2");
    expect(result.current.data?.number).toBe(2);
  });
});
