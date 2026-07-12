import { ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { appTheme } from "@/features/common/theme/app-theme";
import { CoverageTypeCards } from "@/features/wizard/components/coverage-type-cards";

describe("CoverageTypeCards", () => {
  it("given_optionClicked_when_enabled_then_callsOnChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ThemeProvider theme={appTheme}>
        <CoverageTypeCards value="" onChange={onChange} />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("radiogroup", { name: /coverage type/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /^standard$/i }));

    expect(onChange).toHaveBeenCalledWith("STANDARD");
  });

  it("given_disabled_when_rendered_then_optionsAreDisabled", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <CoverageTypeCards value="BASIC" onChange={vi.fn()} disabled />
      </ThemeProvider>,
    );

    expect(screen.getByRole("radio", { name: /^basic$/i })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /^premium$/i })).toBeDisabled();
  });
});
