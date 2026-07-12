import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { useAuth } from "@/features/auth/context/use-auth";
import { server } from "@/test/msw/server";

function AuthProbe() {
  const { isAuthenticated, isPending, login, logout } = useAuth();

  return (
    <div>
      <output data-testid="authenticated">
        {isAuthenticated ? "yes" : "no"}
      </output>
      <output data-testid="pending">{isPending ? "yes" : "no"}</output>
      <button
        type="button"
        onClick={() => {
          void login({ username: "agent", password: "secret" }).catch(() => {
            /* surfaced via authenticated flag */
          });
        }}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => {
          void logout();
        }}
      >
        Logout
      </button>
    </div>
  );
}

function LoginErrorProbe() {
  const { isAuthenticated, login } = useAuth();

  return (
    <div>
      <output data-testid="authenticated">
        {isAuthenticated ? "yes" : "no"}
      </output>
      <button
        type="button"
        onClick={() => {
          void login({ username: "agent", password: "wrong" }).catch(
            (error: unknown) => {
              const message =
                error instanceof Error ? error.message : "unknown";
              const el = document.querySelector("[data-testid=error]");
              if (el) {
                el.textContent = message;
              }
            },
          );
        }}
      >
        Login
      </button>
      <output data-testid="error" />
    </div>
  );
}

describe("AuthContext", () => {
  it("given_outsideProvider_when_useAuth_then_throws", () => {
    expect(() => render(<AuthProbe />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });

  it("given_validCredentials_when_login_then_setsAuthenticated", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("authenticated")).toHaveTextContent("no");

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
    });
    expect(screen.getByTestId("pending")).toHaveTextContent("no");
  });

  it("given_invalidCredentials_when_login_then_staysUnauthenticated", async () => {
    server.use(
      http.post("*/api/v1/auth/token", () =>
        HttpResponse.json({ message: "Invalid credentials" }, { status: 401 }),
      ),
    );

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <LoginErrorProbe />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByTestId("error")).not.toHaveTextContent("");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
  });

  it("given_authenticated_when_logout_then_clearsSession", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider initialAuthenticated>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");

    await user.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
    });
  });
});
