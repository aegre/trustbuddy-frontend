import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppProviders } from "@/features/common/providers/app-providers";
import { QuotesHomePlaceholder } from "@/features/quotes/screens/quotes-home-placeholder";
import { GuestOutlet } from "@/routes/guest-outlet";
import { LoginRoute } from "@/routes/login-route";
import { paths } from "@/routes/paths";
import { ProtectedOutlet } from "@/routes/protected-outlet";

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
        children: [{ path: paths.home, element: <QuotesHomePlaceholder /> }],
      },
    ],
    { initialEntries: [initialEntry] },
  );

  render(
    <AppProviders initialAuthenticated={options?.initialAuthenticated}>
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

  it("given_authenticated_when_visitsHome_then_showsQuotesPlaceholder", async () => {
    renderAppAt(paths.home, { initialAuthenticated: true });

    expect(
      await screen.findByRole("heading", { name: /^quotes$/i }),
    ).toBeInTheDocument();
  });

  it("given_authenticated_when_visitsLogin_then_redirectsHome", async () => {
    renderAppAt(paths.login, { initialAuthenticated: true });

    expect(
      await screen.findByRole("heading", { name: /^quotes$/i }),
    ).toBeInTheDocument();
  });

  it("given_guest_when_logsIn_then_reachesProtectedHome", async () => {
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
