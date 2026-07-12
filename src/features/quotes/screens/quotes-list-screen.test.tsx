import { render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppProviders } from "@/features/common/providers/app-providers";
import { createTestQueryClient } from "@/features/common/query/query-client";
import { QuotesListScreen } from "@/features/quotes/screens/quotes-list-screen";
import { createQuoteFixture, createQuotesPageFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { paths, wizardPersonalHref } from "@/routes/paths";

function renderQuotesList() {
  render(
    <AppProviders initialAuthenticated queryClient={createTestQueryClient()}>
      <MemoryRouter>
        <QuotesListScreen />
      </MemoryRouter>
    </AppProviders>,
  );
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

  it("given_apiError_when_loaded_then_showsErrorAndRetry", async () => {
    server.use(
      http.get("*/api/v1/quotes", () =>
        HttpResponse.json({ message: "Boom" }, { status: 500 }),
      ),
    );

    renderQuotesList();

    expect(await screen.findByRole("alert")).toHaveTextContent("Boom");
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
