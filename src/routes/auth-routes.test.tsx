import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppProviders } from "@/features/common/providers/app-providers";
import { createTestQueryClient } from "@/features/common/query/query-client";
import { createQuotesPageFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { GuestOutlet } from "@/routes/guest-outlet";
import { LoginRoute } from "@/routes/login-route";
import { paths } from "@/routes/paths";
import { ProtectedOutlet } from "@/routes/protected-outlet";
import { QuotesListRoute } from "@/routes/quotes-list-route";
import { WizardPersonalRoute } from "@/routes/wizard-personal-route";

function renderAppAt(
  initialEntry: string,
  options?: { initialAuthenticated?: boolean },
) {
  const router = createMemoryRouter(
    [
      {
        element: <GuestOutlet />,
        children: [{ path: paths.login, element: <LoginRoute /> }],
      },
      {
        element: <ProtectedOutlet />,
        children: [
          { path: paths.home, element: <QuotesListRoute /> },
          { path: paths.wizardPersonal, element: <WizardPersonalRoute /> },
        ],
      },
    ],
    { initialEntries: [initialEntry] },
  );

  render(
    <AppProviders
      initialAuthenticated={options?.initialAuthenticated}
      queryClient={createTestQueryClient()}
    >
      <RouterProvider router={router} />
    </AppProviders>,
  );

  return router;
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
