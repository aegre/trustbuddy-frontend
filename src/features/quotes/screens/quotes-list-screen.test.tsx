import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { QuotesListScreen } from "@/features/quotes/screens/quotes-list-screen";
import { createQuoteFixture, createQuotesPageFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/render";
import { paths, wizardPersonalHref } from "@/routes/paths";

function renderQuotesList(route = "/") {
  return renderWithProviders(<QuotesListScreen />, {
    initialAuthenticated: true,
    route,
  });
}

describe("QuotesListScreen", () => {
  it("given_quotes_when_loaded_then_rendersRowsAndNewQuoteCta", async () => {
    const page = createQuotesPageFixture({
      content: [
        createQuoteFixture({
          id: "q-42",
          name: "Grace Hopper",
          email: "grace@example.com",
          coverageType: "PREMIUM",
          status: "DRAFT",
          estimatedMonthlyPremium: 189,
        }),
      ],
    });

    server.use(
      http.get("*/api/v1/quotes", () =>
        HttpResponse.json(page, { status: 200 }),
      ),
    );

    renderQuotesList();

    expect(
      await screen.findByRole("heading", { name: /your quotes/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/review drafts, submitted quotes, and start a new one/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /\+ create new quote/i }),
    ).toHaveAttribute("href", paths.wizardPersonal);
    expect(await screen.findByText("Premium coverage")).toBeInTheDocument();
    expect(screen.getByText(/· Q-42/i)).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText(/\/mo/i)).toBeInTheDocument();

    const card = screen.getByRole("link", { name: /premium coverage/i });
    expect(card).toHaveAttribute("href", wizardPersonalHref("q-42"));
  });

  it("given_emptyList_when_loaded_then_showsEmptyMessage", async () => {
    server.use(
      http.get("*/api/v1/quotes", () =>
        HttpResponse.json(
          createQuotesPageFixture({ content: [], empty: true }),
          { status: 200 },
        ),
      ),
    );

    renderQuotesList();

    expect(await screen.findByText(/no quotes yet/i)).toBeInTheDocument();
  });

  it("given_singlePage_when_loaded_then_hidesPagination", async () => {
    server.use(
      http.get("*/api/v1/quotes", () =>
        HttpResponse.json(
          createQuotesPageFixture({
            content: [
              createQuoteFixture({
                name: "Only One",
                coverageType: "STANDARD",
              }),
            ],
            totalPages: 1,
            number: 0,
          }),
          { status: 200 },
        ),
      ),
    );

    renderQuotesList();

    expect(await screen.findByText("Standard coverage")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("given_multiPageList_when_pageTwoClicked_then_loadsNextPage", async () => {
    const user = userEvent.setup();
    const page0 = createQuotesPageFixture({
      content: [
        createQuoteFixture({
          id: "q-page-0",
          name: "Page Zero Quote",
          coverageType: "BASIC",
        }),
      ],
      totalElements: 40,
      totalPages: 3,
      size: 20,
      number: 0,
      first: true,
      last: false,
    });
    const page1 = createQuotesPageFixture({
      content: [
        createQuoteFixture({
          id: "q-page-1",
          name: "Page One Quote",
          coverageType: "PREMIUM",
        }),
      ],
      totalElements: 40,
      totalPages: 3,
      size: 20,
      number: 1,
      first: false,
      last: false,
    });

    const requestedPages: string[] = [];
    server.use(
      http.get("*/api/v1/quotes", ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") ?? "0";
        requestedPages.push(page);
        if (page === "1") {
          return HttpResponse.json(page1, { status: 200 });
        }
        return HttpResponse.json(page0, { status: 200 });
      }),
    );

    renderQuotesList();

    expect(await screen.findByText("Basic coverage")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /pagination/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^go to page 2$/i }));

    expect(await screen.findByText("Premium coverage")).toBeInTheDocument();
    expect(screen.queryByText("Basic coverage")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(requestedPages).toContain("1");
    });
  });

  it("given_apiError_when_loaded_then_showsErrorAndRetry", async () => {
    server.use(
      http.get("*/api/v1/quotes", () =>
        HttpResponse.json({ message: "Boom" }, { status: 500 }),
      ),
    );

    renderQuotesList();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load quotes",
    );
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("given_loading_when_rendered_then_showsStatus", () => {
    server.use(
      http.get("*/api/v1/quotes", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json(createQuotesPageFixture(), { status: 200 });
      }),
    );

    renderQuotesList();

    expect(
      screen.getByRole("status", { name: /loading quotes/i }),
    ).toBeInTheDocument();
  });

  it("given_multiPageList_when_pageTwoClicked_then_showsRefreshingShimmer", async () => {
    const user = userEvent.setup();
    const page0 = createQuotesPageFixture({
      content: [
        createQuoteFixture({
          id: "q-page-0",
          name: "Page Zero Quote",
          coverageType: "BASIC",
        }),
      ],
      totalElements: 40,
      totalPages: 3,
      size: 20,
      number: 0,
      first: true,
      last: false,
    });
    const page1 = createQuotesPageFixture({
      content: [
        createQuoteFixture({
          id: "q-page-1",
          name: "Page One Quote",
          coverageType: "PREMIUM",
        }),
      ],
      totalElements: 40,
      totalPages: 3,
      size: 20,
      number: 1,
      first: false,
      last: false,
    });

    let releasePage1: (() => void) | undefined;
    const page1Gate = new Promise<void>((resolve) => {
      releasePage1 = resolve;
    });

    server.use(
      http.get("*/api/v1/quotes", async ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") ?? "0";
        if (page === "1") {
          await page1Gate;
          return HttpResponse.json(page1, { status: 200 });
        }
        return HttpResponse.json(page0, { status: 200 });
      }),
    );

    renderQuotesList();

    expect(await screen.findByText("Basic coverage")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^go to page 2$/i }));

    expect(
      await screen.findByRole("status", {
        name: /(loading|refreshing) quotes/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Basic coverage")).not.toBeInTheDocument();

    releasePage1?.();

    expect(await screen.findByText("Premium coverage")).toBeInTheDocument();
  });
});
