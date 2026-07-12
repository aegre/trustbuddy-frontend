import { ThemeProvider } from "@mui/material/styles";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { appTheme } from "@/features/common/theme/app-theme";
import { CoverageForm } from "@/features/wizard/components/steps/coverage-form";

function renderCoverageForm(
  props: Partial<ComponentProps<typeof CoverageForm>> = {},
) {
  const onSubmit = props.onSubmit ?? vi.fn();
  render(
    <ThemeProvider theme={appTheme}>
      <CoverageForm onSubmit={onSubmit} age={40} {...props} />
    </ThemeProvider>,
  );
  return { onSubmit };
}

describe("CoverageForm", () => {
  it("given_missingCoverageType_when_submitted_then_showsValidationError", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderCoverageForm();

    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      await screen.findByText("Select a coverage type"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("given_validValues_when_submitted_then_callsOnSubmit", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderCoverageForm();

    await user.click(screen.getByLabelText("Coverage type"));
    await user.click(screen.getByRole("option", { name: /standard/i }));
    await user.click(screen.getByLabelText("Uses tobacco"));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          coverageType: "STANDARD",
          usesTobacco: true,
          takesPrescriptionMedication: false,
          needsSpouseCoverage: false,
        }),
        expect.anything(),
      );
    });
  });

  it("given_seniorWithoutPreexistingAnswer_when_submitted_then_showsError", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderCoverageForm({ age: 70 });

    await user.click(screen.getByLabelText("Coverage type"));
    await user.click(screen.getByRole("option", { name: /basic/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      await screen.findByText(
        "Indicate whether you have pre-existing conditions",
      ),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("given_seniorWithConditions_when_submitted_then_includesConditions", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderCoverageForm({ age: 70 });

    await user.click(screen.getByLabelText("Coverage type"));
    await user.click(screen.getByRole("option", { name: /premium/i }));
    await user.click(screen.getByRole("radio", { name: /^yes$/i }));
    await user.click(screen.getByLabelText("Diabetes"));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          coverageType: "PREMIUM",
          hasPreexistingConditions: true,
          conditions: ["DIABETES"],
        }),
        expect.anything(),
      );
    });
  });

  it("given_premium_when_rendered_then_showsFormattedPremium", () => {
    renderCoverageForm({ estimatedMonthlyPremium: 120.5 });

    expect(screen.getByText(/estimated monthly premium/i)).toBeInTheDocument();
    expect(screen.getByText(/\$120\.50/)).toBeInTheDocument();
  });

  it("given_readOnly_when_rendered_then_hidesSubmit", () => {
    renderCoverageForm({
      readOnly: true,
      defaultValues: { coverageType: "BASIC" },
    });

    expect(
      screen.queryByRole("button", { name: /continue/i }),
    ).not.toBeInTheDocument();
  });
});
