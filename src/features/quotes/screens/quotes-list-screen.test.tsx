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
          status: "DRAFT",
          estimatedMonthlyPremium: 99,
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
      await screen.findByRole("heading", { name: /^quotes$/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^new quote$/i })).toHaveAttribute(
      "href",
      paths.wizardPersonal,
    );
    expect(await screen.findByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText("grace@example.com")).toBeInTheDocument();
    expect(screen.getByText("DRAFT")).toBeInTheDocument();

    const row = screen.getByRole("row", { name: /grace hopper/i });
    expect(row).toHaveAttribute("href", wizardPersonalHref("q-42"));
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
            content: [createQuoteFixture({ name: "Only One" })],
            totalPages: 1,
            number: 0,
          }),
          { status: 200 },
        ),
      ),
    );

    renderQuotesList();

    expect(await screen.findByText("Only One")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("given_multiPageList_when_pageTwoClicked_then_loadsNextPage", async () => {
    const user = userEvent.setup();
    const page0 = createQuotesPageFixture({
      content: [
        createQuoteFixture({
          id: "q-page-0",
          name: "Page Zero Quote",
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

    expect(await screen.findByText("Page Zero Quote")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /pagination/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^go to page 2$/i }));

    expect(await screen.findByText("Page One Quote")).toBeInTheDocument();
    expect(screen.queryByText("Page Zero Quote")).not.toBeInTheDocument();
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
});
