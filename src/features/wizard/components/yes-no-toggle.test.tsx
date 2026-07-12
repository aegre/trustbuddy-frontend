import { ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { appTheme } from "@/features/common/theme/app-theme";
import { YesNoToggle } from "@/features/wizard/components/yes-no-toggle";

describe("YesNoToggle", () => {
  it("given_unanswered_when_yesClicked_then_callsOnChangeTrue", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ThemeProvider theme={appTheme}>
        <YesNoToggle label="Uses tobacco" onChange={onChange} />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("group", { name: /uses tobacco/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /uses tobacco, yes/i }),
    );

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("given_true_when_noClicked_then_callsOnChangeFalse", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ThemeProvider theme={appTheme}>
        <YesNoToggle label="Uses tobacco" value={true} onChange={onChange} />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: /uses tobacco, no/i }));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("given_error_when_rendered_then_showsHelperText", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <YesNoToggle
          label="Uses tobacco"
          onChange={vi.fn()}
          error
          helperText="Select whether you use tobacco"
        />
      </ThemeProvider>,
    );

    expect(
      screen.getByText("Select whether you use tobacco"),
    ).toBeInTheDocument();
  });
});
