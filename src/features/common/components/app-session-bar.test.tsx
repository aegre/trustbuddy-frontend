import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { AppSessionBar } from "@/features/common/components/app-session-bar";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/render";

describe("AppSessionBar", () => {
  it("given_authenticated_when_logoutClicked_then_callsLogoutApi", async () => {
    const user = userEvent.setup();
    let logoutCalled = false;
    server.use(
      http.post("*/api/v1/auth/logout", () => {
        logoutCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderWithProviders(<AppSessionBar />, {
      initialAuthenticated: true,
    });

    await user.click(screen.getByRole("button", { name: /^log out$/i }));

    await waitFor(() => {
      expect(logoutCalled).toBe(true);
    });
  });
});
