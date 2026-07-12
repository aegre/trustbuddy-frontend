import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect } from "vitest";
import test from "vitest-gwt";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { useAuth } from "@/features/auth/context/use-auth";
import { server } from "@/test/msw/server";

type Context = {
  user: UserEvent;
};

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
  test("throws when useAuth is used outside provider", {
    when: {
      rendering_probe_outside_provider,
    },
    then: {
      expect_error: use_auth_requires_provider,
    },
  });

  test("sets authenticated after valid login", {
    given: {
      an_auth_probe,
    },
    when: {
      clicking_login,
    },
    then: {
      user_is_authenticated,
      pending_is_cleared,
    },
  });

  test("stays unauthenticated after invalid login", {
    given: {
      invalid_credentials_response,
      a_login_error_probe,
    },
    when: {
      clicking_login,
    },
    then: {
      login_error_is_surfaced,
      user_is_not_authenticated,
    },
  });

  test("clears session on logout", {
    given: {
      an_authenticated_auth_probe,
    },
    when: {
      clicking_logout,
    },
    then: {
      user_is_not_authenticated,
    },
  });
});

function rendering_probe_outside_provider() {
  render(<AuthProbe />);
}

function use_auth_requires_provider(error: unknown) {
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(
    "useAuth must be used within an AuthProvider",
  );
}

function an_auth_probe(this: Context) {
  this.user = userEvent.setup();
  render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>,
  );
  expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
}

function a_login_error_probe(this: Context) {
  this.user = userEvent.setup();
  render(
    <AuthProvider>
      <LoginErrorProbe />
    </AuthProvider>,
  );
}

function an_authenticated_auth_probe(this: Context) {
  this.user = userEvent.setup();
  render(
    <AuthProvider initialAuthenticated>
      <AuthProbe />
    </AuthProvider>,
  );
  expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
}

function invalid_credentials_response() {
  server.use(
    http.post("*/api/v1/auth/token", () =>
      HttpResponse.json({ message: "Invalid credentials" }, { status: 401 }),
    ),
  );
}

async function clicking_login(this: Context) {
  await this.user.click(screen.getByRole("button", { name: "Login" }));
}

async function clicking_logout(this: Context) {
  await this.user.click(screen.getByRole("button", { name: "Logout" }));
}

async function user_is_authenticated() {
  await waitFor(() => {
    expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
  });
}

async function user_is_not_authenticated() {
  await waitFor(() => {
    expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
  });
}

function pending_is_cleared() {
  expect(screen.getByTestId("pending")).toHaveTextContent("no");
}

async function login_error_is_surfaced() {
  await waitFor(() => {
    expect(screen.getByTestId("error")).not.toHaveTextContent("");
  });
}
