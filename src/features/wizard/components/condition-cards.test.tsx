import { ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { appTheme } from "@/features/common/theme/app-theme";
import { ConditionCards } from "@/features/wizard/components/condition-cards";

describe("ConditionCards", () => {
  it("given_optionClicked_when_enabled_then_togglesSelection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ThemeProvider theme={appTheme}>
        <ConditionCards value={[]} onChange={onChange} />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("group", { name: /conditions/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /^diabetes$/i }));

    expect(onChange).toHaveBeenCalledWith(["DIABETES"]);
  });

  it("given_disabled_when_rendered_then_optionsAreDisabled", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <ConditionCards value={["DIABETES"]} onChange={vi.fn()} disabled />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("checkbox", { name: /^diabetes$/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("checkbox", { name: /^hypertension$/i }),
    ).toBeDisabled();
  });
});
