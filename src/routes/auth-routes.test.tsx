import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { Navigate } from "react-router-dom";
import { createQuotesPageFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { renderAppRouter } from "@/test/render";
import { GuestOutlet } from "@/routes/guest-outlet";
import { LoginRoute } from "@/routes/login-route";
import { paths } from "@/routes/paths";
import { ProtectedOutlet } from "@/routes/protected-outlet";
import { QuotesListRoute } from "@/routes/quotes-list-route";
import { WizardRoute } from "@/routes/wizard-route";

const appRoutes = [
  {
    element: <GuestOutlet />,
    children: [{ path: paths.login, element: <LoginRoute /> }],
  },
  {
    element: <ProtectedOutlet />,
    children: [
      { path: paths.home, element: <QuotesListRoute /> },
      {
        path: paths.wizardBase,
        element: <Navigate to={paths.wizardPersonal} replace />,
      },
      { path: paths.wizardStep, element: <WizardRoute /> },
    ],
  },
];

function renderAppAt(
  initialEntry: string,
  options?: { initialAuthenticated?: boolean },
) {
  return renderAppRouter({
    initialEntry,
    routes: appRoutes,
    initialAuthenticated: options?.initialAuthenticated,
  });
}

describe("auth routes", () => {
  it("given_guest_when_visitsHome_then_redirectsToLogin", async () => {
    renderAppAt(paths.home);

    expect(
      await screen.findByRole("heading", { name: /sign in to trustbuddy/i }),
    ).toBeInTheDocument();
  });

  it("given_authenticated_when_visitsHome_then_showsQuotesList", async () => {
    server.use(
      http.get("*/api/v1/quotes", () =>
        HttpResponse.json(createQuotesPageFixture({ content: [] }), {
          status: 200,
        }),
      ),
    );

    renderAppAt(paths.home, { initialAuthenticated: true });

    expect(
      await screen.findByRole("heading", { name: /^quotes$/i }),
    ).toBeInTheDocument();
  });

  it("given_authenticated_when_visitsLogin_then_redirectsHome", async () => {
    server.use(
      http.get("*/api/v1/quotes", () =>
        HttpResponse.json(createQuotesPageFixture({ content: [] }), {
          status: 200,
        }),
      ),
    );

    renderAppAt(paths.login, { initialAuthenticated: true });

    expect(
      await screen.findByRole("heading", { name: /^quotes$/i }),
    ).toBeInTheDocument();
  });

  it("given_guest_when_logsIn_then_reachesProtectedHome", async () => {
    server.use(
      http.get("*/api/v1/quotes", () =>
        HttpResponse.json(createQuotesPageFixture({ content: [] }), {
          status: 200,
        }),
      ),
    );

    const user = userEvent.setup();
    renderAppAt(paths.login);

    await user.type(screen.getByLabelText("Username"), "agent");
    await user.type(
      screen.getByLabelText("Password", { selector: "input" }),
      "secret",
    );
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^quotes$/i }),
      ).toBeInTheDocument();
    });
  });
});
