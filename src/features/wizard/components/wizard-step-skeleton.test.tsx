import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WizardStepSkeleton } from "@/features/wizard/components/wizard-step-skeleton";
import { renderWithProviders } from "@/test/render";

describe("WizardStepSkeleton", () => {
  it("given_default_when_rendered_then_announcesLoadingStatus", () => {
    renderWithProviders(<WizardStepSkeleton />);

    expect(
      screen.getByRole("status", { name: /loading quote/i }),
    ).toBeInTheDocument();
  });
});
