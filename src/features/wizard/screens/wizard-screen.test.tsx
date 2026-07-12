import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { Navigate } from "react-router-dom";
import { describe, expect } from "vitest";
import test from "vitest-gwt";
import { createQuoteFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { renderAppRouter } from "@/test/render";
import { paths } from "@/routes/paths";
import { ProtectedOutlet } from "@/routes/protected-outlet";
import { WizardRoute } from "@/routes/wizard-route";

type Context = {
  user: UserEvent;
  attempts: number;
  quoteId: string;
};

const wizardRoutes = [
  {
    element: <ProtectedOutlet />,
    children: [
      {
        path: paths.wizardBase,
        element: <Navigate to={paths.wizardPersonal} replace />,
      },
      { path: paths.wizardStep, element: <WizardRoute /> },
      { path: paths.home, element: <div>Quotes home</div> },
    ],
  },
];

function renderWizardAt(initialEntry: string) {
  return renderAppRouter({
    initialEntry,
    routes: wizardRoutes,
    initialAuthenticated: true,
  });
}

function mockQuote(overrides: Parameters<typeof createQuoteFixture>[0] = {}) {
  const quote = createQuoteFixture(overrides);
  server.use(
    http.get("*/api/v1/quotes/:id", () =>
      HttpResponse.json(quote, { status: 200 }),
    ),
  );
  return quote;
}

describe("wizard routes", () => {
  test("shows stepper and stub on personal step", {
    when: {
      loading_personal_step,
    },
    then: {
      personal_step_chrome_is_shown,
    },
  });

  test("shows read-only guard for submitted quote", {
    given: {
      a_submitted_quote,
    },
    when: {
      loading_personal_step_with_quote,
    },
    then: {
      read_only_guard_is_shown,
    },
  });

  test("allows edit for draft quote", {
    given: {
      a_draft_quote,
    },
    when: {
      loading_personal_step_with_quote,
    },
    then: {
      draft_edit_banner_is_shown,
    },
  });

  test("shows quote from query string", {
    given: {
      a_draft_quote,
    },
    when: {
      loading_personal_step_with_quote,
    },
    then: {
      draft_edit_banner_is_shown,
    },
  });

  test("preserves quoteId while navigating steps", {
    given: {
      a_draft_quote,
      a_user,
    },
    scenario: [
      {
        name: "Load personal step",
        when: {
          loading_personal_step_with_quote,
        },
        then: {
          draft_edit_banner_is_shown,
        },
      },
      {
        name: "Navigate to coverage",
        then_when: {
          clicking_next,
        },
        then: {
          coverage_step_preserves_quote_id,
        },
      },
    ],
  });

  test("retries after quote load error", {
    given: {
      a_flaky_quote_response,
      a_user,
    },
    scenario: [
      {
        name: "Initial load fails",
        when: {
          loading_flaky_quote,
        },
        then: {
          quote_load_error_is_shown,
        },
      },
      {
        name: "Retry succeeds",
        then_when: {
          clicking_retry,
        },
        then: {
          retried_quote_is_loaded,
        },
      },
    ],
  });

  test("redirects invalid step slug to personal", {
    given: {
      a_redirect_quote,
    },
    when: {
      loading_invalid_step,
    },
    then: {
      redirected_to_personal_with_quote,
    },
  });

  test("redirects wizard base to personal", {
    when: {
      loading_wizard_base,
    },
    then: {
      personal_step_heading_is_shown,
    },
  });
});

function a_user(this: Context) {
  this.user = userEvent.setup();
}

function a_submitted_quote(this: Context) {
  this.quoteId = "q-sub";
  mockQuote({
    id: this.quoteId,
    name: "Submitted User",
    status: "SUBMITTED",
  });
}

function a_draft_quote(this: Context) {
  this.quoteId = "q-9";
  mockQuote({ id: this.quoteId, name: "Ada Lovelace", status: "DRAFT" });
}

function a_redirect_quote(this: Context) {
  this.quoteId = "q-1";
  mockQuote({ id: this.quoteId, name: "Redirect User", status: "DRAFT" });
}

function a_flaky_quote_response(this: Context) {
  this.attempts = 0;
  this.quoteId = "q-err";
  server.use(
    http.get("*/api/v1/quotes/:id", () => {
      this.attempts += 1;
      if (this.attempts === 1) {
        return HttpResponse.json(
          { message: "Temporary failure" },
          { status: 500 },
        );
      }
      return HttpResponse.json(
        createQuoteFixture({ id: this.quoteId, name: "Retry User" }),
        { status: 200 },
      );
    }),
  );
}

function loading_personal_step() {
  renderWizardAt(paths.wizardPersonal);
}

function loading_personal_step_with_quote(this: Context) {
  renderWizardAt(`${paths.wizardPersonal}?quoteId=${this.quoteId}`);
}

function loading_flaky_quote(this: Context) {
  renderWizardAt(`${paths.wizardPersonal}?quoteId=${this.quoteId}`);
}

function loading_invalid_step(this: Context) {
  renderWizardAt(`${paths.wizardBase}/not-a-step?quoteId=${this.quoteId}`);
}

function loading_wizard_base() {
  renderWizardAt(paths.wizardBase);
}

async function clicking_next(this: Context) {
  await this.user.click(screen.getByRole("link", { name: /^next$/i }));
}

async function clicking_retry(this: Context) {
  await this.user.click(screen.getByRole("button", { name: /^retry$/i }));
}

async function personal_step_chrome_is_shown() {
  expect(
    await screen.findByRole("heading", { name: /quote wizard/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /personal information/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /^next$/i })).toHaveAttribute(
    "href",
    `${paths.wizardBase}/coverage`,
  );
  expect(screen.queryByRole("link", { name: /^previous$/i })).toBeNull();
}

async function read_only_guard_is_shown() {
  expect(
    await screen.findByText(
      /this quote is submitted and can no longer be edited/i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/viewing submitted user \(read-only\)/i),
  ).toBeInTheDocument();
}

async function draft_edit_banner_is_shown() {
  expect(
    await screen.findByText(/editing ada lovelace \(draft\)/i),
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/can no longer be edited/i),
  ).not.toBeInTheDocument();
}

async function coverage_step_preserves_quote_id(this: Context) {
  expect(
    await screen.findByRole("heading", { name: /^coverage$/i }),
  ).toBeInTheDocument();
  expect(
    await screen.findByText(/coverage for ada lovelace/i),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /^previous$/i })).toHaveAttribute(
    "href",
    `${paths.wizardPersonal}?quoteId=${this.quoteId}`,
  );
  expect(screen.getByRole("link", { name: /^next$/i })).toHaveAttribute(
    "href",
    `${paths.wizardBase}/review?quoteId=${this.quoteId}`,
  );
}

async function quote_load_error_is_shown() {
  expect(await screen.findByText(/could not load quote/i)).toBeInTheDocument();
  expect(screen.queryByRole("tab", { name: /personal/i })).toBeNull();
  expect(screen.queryByRole("link", { name: /^next$/i })).toBeNull();
}

async function retried_quote_is_loaded() {
  expect(
    await screen.findByText(/editing retry user \(draft\)/i),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /^next$/i })).toBeInTheDocument();
}

async function redirected_to_personal_with_quote() {
  expect(
    await screen.findByRole("heading", { name: /personal information/i }),
  ).toBeInTheDocument();
  expect(
    await screen.findByText(/editing redirect user \(draft\)/i),
  ).toBeInTheDocument();
}

async function personal_step_heading_is_shown() {
  expect(
    await screen.findByRole("heading", { name: /personal information/i }),
  ).toBeInTheDocument();
}
