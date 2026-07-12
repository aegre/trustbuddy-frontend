import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { createQuoteFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { renderAppRouter } from "@/test/render";
import { paths } from "@/routes/paths";
import { ProtectedOutlet } from "@/routes/protected-outlet";
import { SuccessRoute } from "@/routes/success-route";

const successRoutes = [
  {
    element: <ProtectedOutlet />,
    children: [
      { path: paths.success, element: <SuccessRoute /> },
      { path: paths.home, element: <div>Quotes home</div> },
    ],
  },
];

describe("SuccessScreen", () => {
  it("given_missingQuoteId_when_loaded_then_redirectsHome", async () => {
    const { router } = renderAppRouter({
      initialEntry: paths.success,
      routes: successRoutes,
      initialAuthenticated: true,
    });

    expect(await screen.findByText("Quotes home")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.home);
  });

  it("given_submittedQuote_when_loaded_then_showsConfirmation", async () => {
    server.use(
      http.get("*/api/v1/quotes/:id", () =>
        HttpResponse.json(
          createQuoteFixture({
            id: "q-ok",
            name: "Ada Lovelace",
            status: "SUBMITTED",
            estimatedMonthlyPremium: 175.5,
          }),
          { status: 200 },
        ),
      ),
    );

    renderAppRouter({
      initialEntry: `${paths.success}?quoteId=q-ok`,
      routes: successRoutes,
      initialAuthenticated: true,
    });

    expect(
      await screen.findByRole("heading", { name: /quote submitted/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /your quote for ada lovelace has been submitted/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/estimated monthly premium/i)).toBeInTheDocument();
    expect(screen.getByText(/\$175\.50/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to quotes/i }),
    ).toHaveAttribute("href", paths.home);
  });
});
