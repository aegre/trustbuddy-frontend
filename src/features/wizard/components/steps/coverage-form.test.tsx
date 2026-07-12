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

async function answerRequiredHealthQuestions(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(
    screen.getByRole("button", {
      name: /takes prescription medication, no/i,
    }),
  );
  await user.click(screen.getByRole("button", { name: /uses tobacco, yes/i }));
  await user.click(
    screen.getByRole("button", { name: /needs spouse coverage, no/i }),
  );
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

    await user.click(screen.getByRole("radio", { name: /^standard$/i }));
    await answerRequiredHealthQuestions(user);
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

    await user.click(screen.getByRole("radio", { name: /^basic$/i }));
    await answerRequiredHealthQuestions(user);
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

    await user.click(screen.getByRole("radio", { name: /^premium$/i }));
    await answerRequiredHealthQuestions(user);
    await user.click(
      screen.getByRole("button", { name: /pre-existing conditions, yes/i }),
    );
    await user.click(screen.getByRole("checkbox", { name: /^diabetes$/i }));
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

  it("given_premiumLoading_when_rendered_then_showsShimmerInsteadOfCost", () => {
    renderCoverageForm({
      estimatedMonthlyPremium: 120.5,
      isPremiumLoading: true,
    });

    expect(screen.getByText(/estimated monthly premium/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/updating estimated monthly premium/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/\$120\.50/)).not.toBeInTheDocument();
  });

  it("given_premiumError_when_retryClicked_then_callsOnRetryPremium", async () => {
    const user = userEvent.setup();
    const onRetryPremium = vi.fn();
    renderCoverageForm({
      estimatedMonthlyPremium: 100,
      premiumErrorMessage: "Could not update premium",
      onRetryPremium,
      defaultValues: { coverageType: "STANDARD" },
    });

    await user.click(screen.getByRole("button", { name: /^retry$/i }));

    expect(onRetryPremium).toHaveBeenCalledWith(
      expect.objectContaining({ coverageType: "STANDARD" }),
    );
  });

  it("given_fieldChange_when_incomplete_then_callsOnValuesChange", async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    renderCoverageForm({ onValuesChange });

    await user.click(screen.getByRole("radio", { name: /^standard$/i }));

    await waitFor(() => {
      expect(onValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({ coverageType: "STANDARD" }),
      );
    });
  });

  it("given_readOnly_when_rendered_then_hidesSubmit", () => {
    renderCoverageForm({
      readOnly: true,
      defaultValues: { coverageType: "BASIC" },
    });

    expect(
      screen.queryByRole("button", { name: /continue/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^basic$/i })).toBeChecked();
  });
});
