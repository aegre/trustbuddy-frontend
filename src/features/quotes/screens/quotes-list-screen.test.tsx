import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect } from "vitest";
import test from "vitest-gwt";
import { QuotesListScreen } from "@/features/quotes/screens/quotes-list-screen";
import { createQuoteFixture, createQuotesPageFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/render";
import { paths, wizardPersonalHref } from "@/routes/paths";

describe("QuotesListScreen", () => {
  test("renders rows and new quote CTA when quotes load", {
    given: {
      quotes_list_with_one_quote,
    },
    when: {
      rendering_quotes_list,
    },
    then: {
      heading_and_cta_are_shown,
      quote_row_is_shown,
    },
  });

  test("shows empty message when list is empty", {
    given: {
      empty_quotes_list,
    },
    when: {
      rendering_quotes_list,
    },
    then: {
      empty_message_is_shown,
    },
  });

  test("shows error and retry when API fails", {
    given: {
      quotes_list_error,
    },
    when: {
      rendering_quotes_list,
    },
    then: {
      error_and_retry_are_shown,
    },
  });

  test("shows loading status while fetching", {
    given: {
      delayed_quotes_list,
    },
    when: {
      rendering_quotes_list,
    },
    then: {
      loading_status_is_shown,
    },
  });
});

function quotes_list_with_one_quote() {
  const page = createQuotesPageFixture({
    content: [
      createQuoteFixture({
        id: "q-42",
        name: "Grace Hopper",
        email: "grace@example.com",
        status: "DRAFT",
        estimatedMonthlyPremium: 99,
      }),
    ],
  });

  server.use(
    http.get("*/api/v1/quotes", () => HttpResponse.json(page, { status: 200 })),
  );
}

function empty_quotes_list() {
  server.use(
    http.get("*/api/v1/quotes", () =>
      HttpResponse.json(createQuotesPageFixture({ content: [], empty: true }), {
        status: 200,
      }),
    ),
  );
}

function quotes_list_error() {
  server.use(
    http.get("*/api/v1/quotes", () =>
      HttpResponse.json({ message: "Boom" }, { status: 500 }),
    ),
  );
}

function delayed_quotes_list() {
  server.use(
    http.get("*/api/v1/quotes", async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return HttpResponse.json(createQuotesPageFixture(), { status: 200 });
    }),
  );
}

function rendering_quotes_list() {
  renderWithProviders(<QuotesListScreen />, {
    initialAuthenticated: true,
  });
}

async function heading_and_cta_are_shown() {
  expect(
    await screen.findByRole("heading", { name: /^quotes$/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /^new quote$/i })).toHaveAttribute(
    "href",
    paths.wizardPersonal,
  );
}

async function quote_row_is_shown() {
  expect(await screen.findByText("Grace Hopper")).toBeInTheDocument();
  expect(screen.getByText("grace@example.com")).toBeInTheDocument();
  expect(screen.getByText("DRAFT")).toBeInTheDocument();

  const row = screen.getByRole("row", { name: /grace hopper/i });
  expect(row).toHaveAttribute("href", wizardPersonalHref("q-42"));
}

async function empty_message_is_shown() {
  expect(await screen.findByText(/no quotes yet/i)).toBeInTheDocument();
}

async function error_and_retry_are_shown() {
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not load quotes",
  );
  expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
}

function loading_status_is_shown() {
  expect(
    screen.getByRole("status", { name: /loading quotes/i }),
  ).toBeInTheDocument();
}
