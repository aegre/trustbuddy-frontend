import { waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { RenderHookResult } from "@testing-library/react";
import { describe, expect } from "vitest";
import test from "vitest-gwt";
import type { PageQuoteResponse } from "@/api/types";
import { useQuotesList } from "@/features/quotes/hooks/use-quotes-list";
import { createQuotesPageFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/render";

type HookResult = RenderHookResult<
  ReturnType<typeof useQuotesList>,
  unknown
>["result"];

type Context = {
  page?: PageQuoteResponse;
  result?: HookResult;
};

describe("useQuotesList", () => {
  test("returns page content when quotes exist", {
    given: {
      quotes_list_response,
    },
    when: {
      fetching_quotes_list,
    },
    then: {
      page_content_is_returned,
    },
  });

  test("returns empty page when list is empty", {
    given: {
      empty_quotes_list_response,
    },
    when: {
      fetching_quotes_list,
    },
    then: {
      empty_page_is_returned,
    },
  });

  test("exposes error when API fails", {
    given: {
      quotes_list_error_response,
    },
    when: {
      fetching_quotes_list,
    },
    then: {
      hook_is_in_error_state,
    },
  });
});

function quotes_list_response(this: Context) {
  this.page = createQuotesPageFixture({
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
      HttpResponse.json(this.page, { status: 200 }),
    ),
  );
}

function empty_quotes_list_response() {
  server.use(
    http.get("*/api/v1/quotes", () =>
      HttpResponse.json(createQuotesPageFixture({ content: [], empty: true }), {
        status: 200,
      }),
    ),
  );
}

function quotes_list_error_response() {
  server.use(
    http.get("*/api/v1/quotes", () =>
      HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
    ),
  );
}

function fetching_quotes_list(this: Context) {
  const { result } = renderHookWithProviders(() => useQuotesList());
  this.result = result;
}

async function page_content_is_returned(this: Context) {
  await waitFor(() => {
    expect(this.result?.current.isSuccess).toBe(true);
  });

  expect(this.result?.current.data?.content).toEqual(this.page?.content);
  expect(this.result?.current.data?.totalElements).toBe(1);
}

async function empty_page_is_returned(this: Context) {
  await waitFor(() => {
    expect(this.result?.current.isSuccess).toBe(true);
  });

  expect(this.result?.current.data?.content).toEqual([]);
  expect(this.result?.current.data?.empty).toBe(true);
}

async function hook_is_in_error_state(this: Context) {
  await waitFor(() => {
    expect(this.result?.current.isError).toBe(true);
  });
}
