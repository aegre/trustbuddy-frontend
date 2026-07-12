import { waitFor } from "@testing-library/react";
import type { RenderHookResult } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect } from "vitest";
import test from "vitest-gwt";
import type { QuoteResponse } from "@/api/types";
import { useQuote } from "@/features/wizard/hooks/use-quote";
import { createQuoteFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/render";

type HookResult = RenderHookResult<
  ReturnType<typeof useQuote>,
  unknown
>["result"];

type Context = {
  quote?: QuoteResponse;
  result?: HookResult;
};

describe("useQuote", () => {
  test("does not fetch when quoteId is missing", {
    when: {
      calling_use_quote_without_id,
    },
    then: {
      hook_stays_idle,
    },
  });

  test("returns quote when it exists", {
    given: {
      quote_response,
    },
    when: {
      fetching_quote,
    },
    then: {
      quote_is_returned,
    },
  });

  test("exposes error when API fails", {
    given: {
      quote_error_response,
    },
    when: {
      fetching_missing_quote,
    },
    then: {
      hook_is_in_error_state,
    },
  });
});

function quote_response(this: Context) {
  this.quote = createQuoteFixture({
    id: "q-1",
    name: "Grace Hopper",
    status: "DRAFT",
  });

  server.use(
    http.get("*/api/v1/quotes/:id", () =>
      HttpResponse.json(this.quote, { status: 200 }),
    ),
  );
}

function quote_error_response() {
  server.use(
    http.get("*/api/v1/quotes/:id", () =>
      HttpResponse.json({ message: "Not found" }, { status: 404 }),
    ),
  );
}

function calling_use_quote_without_id(this: Context) {
  const { result } = renderHookWithProviders(() => useQuote(undefined));
  this.result = result;
}

function fetching_quote(this: Context) {
  const { result } = renderHookWithProviders(() => useQuote("q-1"));
  this.result = result;
}

function fetching_missing_quote(this: Context) {
  const { result } = renderHookWithProviders(() => useQuote("missing"));
  this.result = result;
}

function hook_stays_idle(this: Context) {
  expect(this.result?.current.fetchStatus).toBe("idle");
  expect(this.result?.current.data).toBeUndefined();
}

async function quote_is_returned(this: Context) {
  await waitFor(() => {
    expect(this.result?.current.isSuccess).toBe(true);
  });

  expect(this.result?.current.data).toEqual(this.quote);
}

async function hook_is_in_error_state(this: Context) {
  await waitFor(() => {
    expect(this.result?.current.isError).toBe(true);
  });
}
