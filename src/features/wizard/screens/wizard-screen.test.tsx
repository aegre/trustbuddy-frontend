import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { Navigate } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { createQuoteFixture } from "@/test/factories";
import { server } from "@/test/msw/server";
import { renderAppRouter } from "@/test/render";
import { paths } from "@/routes/paths";
import { ProtectedOutlet } from "@/routes/protected-outlet";
import { WizardRoute } from "@/routes/wizard-route";

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
  it("given_personalStep_when_loaded_then_showsFormAndContinue", async () => {
    renderWizardAt(paths.wizardPersonal);

    expect(
      await screen.findByRole("heading", { name: /quote wizard/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /personal information/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^continue$/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^next$/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /^previous$/i })).toBeNull();
  });

  it("given_submittedQuote_when_loaded_then_showsReadOnlyGuard", async () => {
    mockQuote({
      id: "q-sub",
      name: "Submitted User",
      status: "SUBMITTED",
    });
    renderWizardAt(`${paths.wizardPersonal}?quoteId=q-sub`);

    expect(
      await screen.findByText(
        /this quote is submitted and can no longer be edited/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveValue("Submitted User");
    expect(
      screen.queryByRole("button", { name: /^continue$/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^next$/i })).toHaveAttribute(
      "href",
      `${paths.wizardBase}/coverage?quoteId=q-sub`,
    );
  });

  it("given_draftQuote_when_loaded_then_prefillsEditableForm", async () => {
    mockQuote({
      id: "q-9",
      name: "Ada Lovelace",
      email: "ada@example.com",
      age: 36,
      zipCode: "06600",
      status: "DRAFT",
    });
    renderWizardAt(`${paths.wizardPersonal}?quoteId=q-9`);

    expect(await screen.findByLabelText("Full name")).toHaveValue(
      "Ada Lovelace",
    );
    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com");
    expect(
      screen.getByRole("button", { name: /^continue$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/can no longer be edited/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^next$/i })).toBeNull();
  });

  it("given_quoteId_when_loaded_then_showsQuoteFromQuery", async () => {
    mockQuote({ id: "q-9", name: "Ada Lovelace", status: "DRAFT" });
    renderWizardAt(`${paths.wizardPersonal}?quoteId=q-9`);

    expect(await screen.findByLabelText("Full name")).toHaveValue(
      "Ada Lovelace",
    );
  });

  it("given_quoteId_when_navigatingViaStepper_then_preservesQuery", async () => {
    mockQuote({ id: "q-9", name: "Ada Lovelace", status: "DRAFT" });
    const user = userEvent.setup();
    renderWizardAt(`${paths.wizardPersonal}?quoteId=q-9`);

    expect(await screen.findByLabelText("Full name")).toHaveValue(
      "Ada Lovelace",
    );

    await user.click(screen.getByRole("tab", { name: /^coverage$/i }));

    expect(
      await screen.findByRole("heading", { name: /^coverage$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: /coverage type/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^continue$/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^previous$/i })).toHaveAttribute(
      "href",
      `${paths.wizardPersonal}?quoteId=q-9`,
    );
    expect(screen.queryByRole("link", { name: /^next$/i })).toBeNull();
  });

  it("given_quoteLoadError_when_retry_then_loadsQuote", async () => {
    let attempts = 0;
    server.use(
      http.get("*/api/v1/quotes/:id", () => {
        attempts += 1;
        if (attempts === 1) {
          return HttpResponse.json(
            { message: "Temporary failure" },
            { status: 500 },
          );
        }
        return HttpResponse.json(
          createQuoteFixture({ id: "q-err", name: "Retry User" }),
          { status: 200 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWizardAt(`${paths.wizardPersonal}?quoteId=q-err`);

    expect(
      await screen.findByText(/could not load quote/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /personal/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /^next$/i })).toBeNull();

    await user.click(screen.getByRole("button", { name: /^retry$/i }));

    expect(await screen.findByLabelText("Full name")).toHaveValue("Retry User");
    expect(
      screen.getByRole("button", { name: /^continue$/i }),
    ).toBeInTheDocument();
  });

  it("given_invalidStepSlug_when_loaded_then_redirectsToPersonal", async () => {
    mockQuote({ id: "q-1", name: "Redirect User", status: "DRAFT" });
    renderWizardAt(`${paths.wizardBase}/not-a-step?quoteId=q-1`);

    expect(
      await screen.findByRole("heading", { name: /personal information/i }),
    ).toBeInTheDocument();
    expect(await screen.findByLabelText("Full name")).toHaveValue(
      "Redirect User",
    );
  });

  it("given_wizardBase_when_loaded_then_redirectsToPersonal", async () => {
    renderWizardAt(paths.wizardBase);

    expect(
      await screen.findByRole("heading", { name: /personal information/i }),
    ).toBeInTheDocument();
  });

  it("given_newQuote_when_personalSaved_then_createsAndAdvancesWithQuoteId", async () => {
    server.use(
      http.post("*/api/v1/quotes", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          createQuoteFixture({
            id: "q-created",
            name: body.name as string,
            email: body.email as string,
            age: body.age as number,
            zipCode: body.zipCode as string,
          }),
          { status: 200 },
        );
      }),
      http.get("*/api/v1/quotes/:id", ({ params }) =>
        HttpResponse.json(
          createQuoteFixture({
            id: String(params.id),
            name: "Grace Hopper",
            email: "grace@example.com",
            age: 40,
            zipCode: "10100",
          }),
          { status: 200 },
        ),
      ),
    );

    const user = userEvent.setup();
    const { router } = renderWizardAt(paths.wizardPersonal);

    await user.type(screen.getByLabelText("Full name"), "Grace Hopper");
    await user.type(screen.getByLabelText("Email"), "grace@example.com");
    await user.type(screen.getByLabelText("Age"), "40");
    await user.type(screen.getByLabelText("ZIP code"), "10100");
    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(
      await screen.findByRole("heading", { name: /^coverage$/i }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`${paths.wizardBase}/coverage`);
    expect(router.state.location.search).toBe("?quoteId=q-created");
  });

  it("given_draftQuote_when_personalSaved_then_patchesAndAdvances", async () => {
    mockQuote({
      id: "q-9",
      name: "Ada Lovelace",
      email: "ada@example.com",
      age: 36,
      zipCode: "06600",
      status: "DRAFT",
    });
    server.use(
      http.patch("*/api/v1/quotes/:id", async ({ params, request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          createQuoteFixture({
            id: String(params.id),
            name: body.name as string,
            email: body.email as string,
            age: body.age as number,
            zipCode: body.zipCode as string,
            status: "DRAFT",
          }),
          { status: 200 },
        );
      }),
    );

    const user = userEvent.setup();
    const { router } = renderWizardAt(`${paths.wizardPersonal}?quoteId=q-9`);

    expect(await screen.findByLabelText("Full name")).toHaveValue(
      "Ada Lovelace",
    );

    await user.clear(screen.getByLabelText("Full name"));
    await user.type(screen.getByLabelText("Full name"), "Augusta Ada");
    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(
      await screen.findByRole("heading", { name: /^coverage$/i }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`${paths.wizardBase}/coverage`);
    expect(router.state.location.search).toBe("?quoteId=q-9");
  });

  it("given_409_when_personalSaved_then_showsAlertAndStays", async () => {
    mockQuote({
      id: "q-conflict",
      name: "Conflict User",
      email: "conflict@example.com",
      age: 30,
      zipCode: "12345",
      status: "DRAFT",
    });
    server.use(
      http.patch("*/api/v1/quotes/:id", () =>
        HttpResponse.json(
          { message: "Quote was updated elsewhere" },
          { status: 409 },
        ),
      ),
    );

    const user = userEvent.setup();
    const { router } = renderWizardAt(
      `${paths.wizardPersonal}?quoteId=q-conflict`,
    );

    expect(await screen.findByLabelText("Full name")).toHaveValue(
      "Conflict User",
    );

    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Quote was updated elsewhere",
    );
    expect(router.state.location.pathname).toBe(paths.wizardPersonal);
    expect(router.state.location.search).toBe("?quoteId=q-conflict");
    expect(
      screen.getByRole("heading", { name: /personal information/i }),
    ).toBeInTheDocument();
  });

  it("given_draftQuote_when_coverageLoaded_then_showsPremium", async () => {
    mockQuote({
      id: "q-cov",
      name: "Ada Lovelace",
      age: 36,
      status: "DRAFT",
      estimatedMonthlyPremium: 120.5,
    });
    renderWizardAt(`${paths.wizardBase}/coverage?quoteId=q-cov`);

    expect(
      await screen.findByRole("heading", { name: /^coverage$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/estimated monthly premium/i)).toBeInTheDocument();
    expect(screen.getByText(/\$120\.50/)).toBeInTheDocument();
  });

  it("given_incompleteCoverage_when_typeChanged_then_updatesPremium", async () => {
    mockQuote({
      id: "q-cov-live",
      name: "Ada Lovelace",
      age: 36,
      status: "DRAFT",
      estimatedMonthlyPremium: 100,
    });
    let patchCount = 0;
    server.use(
      http.patch("*/api/v1/quotes/:id/coverage", async ({ request }) => {
        patchCount += 1;
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          createQuoteFixture({
            id: "q-cov-live",
            name: "Ada Lovelace",
            age: 36,
            status: "DRAFT",
            coverageType: body.coverageType as "BASIC" | "STANDARD" | "PREMIUM",
            estimatedMonthlyPremium: 155.25,
          }),
          { status: 200 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWizardAt(`${paths.wizardBase}/coverage?quoteId=q-cov-live`);

    expect(
      await screen.findByRole("heading", { name: /^coverage$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /^standard$/i }));

    await waitFor(() => {
      expect(screen.getByText(/\$155\.25/)).toBeInTheDocument();
    });
    expect(patchCount).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole("button", { name: /^continue$/i }),
    ).toBeInTheDocument();
  });

  it("given_draftQuote_when_coverageSaved_then_patchesAndAdvancesToReview", async () => {
    mockQuote({
      id: "q-cov",
      name: "Ada Lovelace",
      age: 36,
      status: "DRAFT",
      estimatedMonthlyPremium: 100,
    });
    let patchedBody: Record<string, unknown> | undefined;
    server.use(
      http.patch(
        "*/api/v1/quotes/:id/coverage",
        async ({ params, request }) => {
          patchedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            createQuoteFixture({
              id: String(params.id),
              name: "Ada Lovelace",
              age: 36,
              status: "DRAFT",
              coverageType: "STANDARD",
              estimatedMonthlyPremium: 199.99,
            }),
            { status: 200 },
          );
        },
      ),
    );

    const user = userEvent.setup();
    const { router } = renderWizardAt(
      `${paths.wizardBase}/coverage?quoteId=q-cov`,
    );

    expect(
      await screen.findByRole("heading", { name: /^coverage$/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /^standard$/i }));
    await user.click(
      screen.getByRole("button", {
        name: /takes prescription medication, no/i,
      }),
    );
    await user.click(
      screen.getByRole("button", { name: /uses tobacco, yes/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /needs spouse coverage, no/i }),
    );
    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(
      await screen.findByRole("heading", { name: /review & submit/i }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`${paths.wizardBase}/review`);
    expect(router.state.location.search).toBe("?quoteId=q-cov");
    expect(patchedBody).toMatchObject({
      coverageType: "STANDARD",
      usesTobacco: true,
      takesPrescriptionMedication: false,
      needsSpouseCoverage: false,
    });
    expect(patchedBody).not.toHaveProperty("hasPreexistingConditions");
  });

  it("given_seniorDraft_when_coverageSaved_then_sendsConditions", async () => {
    mockQuote({
      id: "q-senior",
      name: "Senior Ada",
      age: 70,
      status: "DRAFT",
    });
    let patchedBody: Record<string, unknown> | undefined;
    server.use(
      http.patch(
        "*/api/v1/quotes/:id/coverage",
        async ({ params, request }) => {
          patchedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            createQuoteFixture({
              id: String(params.id),
              age: 70,
              status: "DRAFT",
              estimatedMonthlyPremium: 250,
            }),
            { status: 200 },
          );
        },
      ),
    );

    const user = userEvent.setup();
    const { router } = renderWizardAt(
      `${paths.wizardBase}/coverage?quoteId=q-senior`,
    );

    expect(
      await screen.findByRole("heading", { name: /^coverage$/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /^premium$/i }));
    await user.click(
      screen.getByRole("button", {
        name: /takes prescription medication, no/i,
      }),
    );
    await user.click(screen.getByRole("button", { name: /uses tobacco, no/i }));
    await user.click(
      screen.getByRole("button", { name: /needs spouse coverage, no/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /pre-existing conditions, yes/i }),
    );
    await user.click(screen.getByRole("checkbox", { name: /^diabetes$/i }));
    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(
      await screen.findByRole("heading", { name: /review & submit/i }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`${paths.wizardBase}/review`);
    expect(patchedBody).toMatchObject({
      coverageType: "PREMIUM",
      hasPreexistingConditions: true,
      conditions: ["DIABETES"],
    });
  });

  it("given_409_when_coverageSaved_then_showsAlertAndStays", async () => {
    mockQuote({
      id: "q-cov-conflict",
      name: "Conflict User",
      age: 40,
      status: "DRAFT",
    });
    server.use(
      http.patch("*/api/v1/quotes/:id/coverage", () =>
        HttpResponse.json(
          { message: "Quote was updated elsewhere" },
          { status: 409 },
        ),
      ),
    );

    const user = userEvent.setup();
    const { router } = renderWizardAt(
      `${paths.wizardBase}/coverage?quoteId=q-cov-conflict`,
    );

    expect(
      await screen.findByRole("heading", { name: /^coverage$/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /^basic$/i }));
    await user.click(
      screen.getByRole("button", {
        name: /takes prescription medication, no/i,
      }),
    );
    await user.click(screen.getByRole("button", { name: /uses tobacco, no/i }));
    await user.click(
      screen.getByRole("button", { name: /needs spouse coverage, no/i }),
    );
    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Quote was updated elsewhere",
    );
    expect(router.state.location.pathname).toBe(`${paths.wizardBase}/coverage`);
    expect(router.state.location.search).toBe("?quoteId=q-cov-conflict");
  });
});
