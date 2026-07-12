import { waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { useQuote } from "@/features/wizard/hooks/use-quote";
import { createQuoteFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/render";

describe("useQuote", () => {
  it("given_noQuoteId_when_called_then_doesNotFetch", () => {
    const { result } = renderHookWithProviders(() => useQuote(undefined));

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });

  it("given_quoteExists_when_fetched_then_returnsQuote", async () => {
    const quote = createQuoteFixture({
      id: "q-1",
      name: "Grace Hopper",
      status: "DRAFT",
    });

    server.use(
      http.get("*/api/v1/quotes/:id", () =>
        HttpResponse.json(quote, { status: 200 }),
      ),
    );

    const { result } = renderHookWithProviders(() => useQuote("q-1"));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(quote);
  });

  it("given_apiError_when_fetched_then_exposesError", async () => {
    server.use(
      http.get("*/api/v1/quotes/:id", () =>
        HttpResponse.json({ message: "Not found" }, { status: 404 }),
      ),
    );

    const { result } = renderHookWithProviders(() => useQuote("missing"));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
