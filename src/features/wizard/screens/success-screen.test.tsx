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
      {
        path: paths.wizardPersonal,
        element: <div>New quote</div>,
      },
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
      await screen.findByRole("heading", {
        name: /your quote has been submitted/i,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/thank you, ada lovelace/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/estimated monthly premium/i),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^ok$/i })).toHaveAttribute(
      "href",
      paths.home,
    );
    expect(
      screen.getByRole("link", { name: /start a new quote/i }),
    ).toHaveAttribute("href", paths.wizardPersonal);
  });
});
