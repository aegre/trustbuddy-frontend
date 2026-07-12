import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { Navigate } from "react-router-dom";
import { describe, expect } from "vitest";
import test from "vitest-gwt";
import { createQuotesPageFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { renderAppRouter } from "@/test/render";
import { GuestOutlet } from "@/routes/guest-outlet";
import { LoginRoute } from "@/routes/login-route";
import { paths } from "@/routes/paths";
import { ProtectedOutlet } from "@/routes/protected-outlet";
import { QuotesListRoute } from "@/routes/quotes-list-route";
import { WizardRoute } from "@/routes/wizard-route";

type Context = {
  user: UserEvent;
};

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
  test("redirects guest from home to login", {
    when: {
      visiting_home_as_guest,
    },
    then: {
      login_heading_is_shown,
    },
  });

  test("shows quotes list for authenticated home visit", {
    given: {
      empty_quotes_list,
    },
    when: {
      visiting_home_as_authenticated,
    },
    then: {
      quotes_heading_is_shown,
    },
  });

  test("redirects authenticated user from login to home", {
    given: {
      empty_quotes_list,
    },
    when: {
      visiting_login_as_authenticated,
    },
    then: {
      quotes_heading_is_shown,
    },
  });

  test("reaches protected home after guest login", {
    given: {
      empty_quotes_list,
      a_user,
    },
    when: {
      visiting_login_as_guest,
      submitting_valid_credentials,
    },
    then: {
      quotes_heading_is_shown,
    },
  });
});

function a_user(this: Context) {
  this.user = userEvent.setup();
}

function empty_quotes_list() {
  server.use(
    http.get("*/api/v1/quotes", () =>
      HttpResponse.json(createQuotesPageFixture({ content: [] }), {
        status: 200,
      }),
    ),
  );
}

function visiting_home_as_guest() {
  renderAppAt(paths.home);
}

function visiting_home_as_authenticated() {
  renderAppAt(paths.home, { initialAuthenticated: true });
}

function visiting_login_as_authenticated() {
  renderAppAt(paths.login, { initialAuthenticated: true });
}

function visiting_login_as_guest() {
  renderAppAt(paths.login);
}

async function submitting_valid_credentials(this: Context) {
  await this.user.type(screen.getByLabelText("Username"), "agent");
  await this.user.type(
    screen.getByLabelText("Password", { selector: "input" }),
    "secret",
  );
  await this.user.click(screen.getByRole("button", { name: /^sign in$/i }));
}

async function login_heading_is_shown() {
  expect(
    await screen.findByRole("heading", { name: /sign in to trustbuddy/i }),
  ).toBeInTheDocument();
}

async function quotes_heading_is_shown() {
  await waitFor(() => {
    expect(
      screen.getByRole("heading", { name: /^quotes$/i }),
    ).toBeInTheDocument();
  });
}
