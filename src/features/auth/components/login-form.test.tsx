import { ThemeProvider } from "@mui/material/styles";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/components/login-form";
import { appTheme } from "@/features/common/theme/app-theme";

function renderLoginForm(
  props: Partial<ComponentProps<typeof LoginForm>> = {},
) {
  const onSubmit = props.onSubmit ?? vi.fn();
  render(
    <ThemeProvider theme={appTheme}>
      <LoginForm onSubmit={onSubmit} {...props} />
    </ThemeProvider>,
  );
  return { onSubmit };
}

describe("LoginForm", () => {
  it("given_emptyFields_when_submitted_then_showsValidationErrors", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderLoginForm();

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Username is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("given_validCredentials_when_submitted_then_callsOnSubmit", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderLoginForm();

    await user.type(screen.getByLabelText("Username"), "agent");
    await user.type(
      screen.getByLabelText("Password", { selector: "input" }),
      "secret",
    );
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { username: "agent", password: "secret" },
        expect.anything(),
      );
    });
  });

  it("given_errorMessage_when_rendered_then_showsAlert", () => {
    renderLoginForm({ errorMessage: "Invalid credentials" });

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
  });
});
