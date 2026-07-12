import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WizardPageSkeleton } from "@/features/wizard/components/wizard-page-skeleton";
import { renderWithProviders } from "@/test/render";

describe("WizardPageSkeleton", () => {
  it("given_default_when_rendered_then_announcesLoadingWizard", () => {
    renderWithProviders(<WizardPageSkeleton />);

    expect(
      screen.getByRole("status", { name: /loading wizard/i }),
    ).toBeInTheDocument();
  });

  it("given_customLabel_when_rendered_then_announcesThatLabel", () => {
    renderWithProviders(<WizardPageSkeleton label="Loading quote" />);

    expect(
      screen.getByRole("status", { name: /loading quote/i }),
    ).toBeInTheDocument();
  });
});
