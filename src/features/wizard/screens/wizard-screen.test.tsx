import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navigate } from "react-router-dom";
import { describe, expect, it } from "vitest";
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

describe("wizard routes", () => {
  it("given_personalStep_when_loaded_then_showsStepperAndStub", async () => {
    renderWizardAt(paths.wizardPersonal);

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
  });

  it("given_quoteId_when_navigatingSteps_then_preservesQuery", async () => {
    const user = userEvent.setup();
    renderWizardAt(`${paths.wizardPersonal}?quoteId=q-9`);

    expect(await screen.findByText(/stub for quote q-9/i)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /^next$/i }));

    expect(
      await screen.findByRole("heading", { name: /^coverage$/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^previous$/i })).toHaveAttribute(
      "href",
      `${paths.wizardPersonal}?quoteId=q-9`,
    );
    expect(screen.getByRole("link", { name: /^next$/i })).toHaveAttribute(
      "href",
      `${paths.wizardBase}/review?quoteId=q-9`,
    );
  });

  it("given_invalidStepSlug_when_loaded_then_redirectsToPersonal", async () => {
    renderWizardAt(`${paths.wizardBase}/not-a-step?quoteId=q-1`);

    expect(
      await screen.findByRole("heading", { name: /personal information/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/stub for quote q-1/i)).toBeInTheDocument();
  });

  it("given_wizardBase_when_loaded_then_redirectsToPersonal", async () => {
    renderWizardAt(paths.wizardBase);

    expect(
      await screen.findByRole("heading", { name: /personal information/i }),
    ).toBeInTheDocument();
  });
});
