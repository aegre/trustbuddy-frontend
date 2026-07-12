import { ThemeProvider } from "@mui/material/styles";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, vi } from "vitest";
import test from "vitest-gwt";
import { LoginForm } from "@/features/auth/components/login-form";
import { appTheme } from "@/features/common/theme/app-theme";

type OnSubmit = ComponentProps<typeof LoginForm>["onSubmit"];

type Context = {
  onSubmit: ReturnType<typeof vi.fn<OnSubmit>>;
  user: UserEvent;
};

describe("LoginForm", () => {
  test("shows validation errors for empty fields", {
    given: {
      a_login_form,
    },
    when: {
      submitting_the_form,
    },
    then: {
      validation_errors_are_shown,
      on_submit_is_not_called,
    },
  });

  test("calls onSubmit with valid credentials", {
    given: {
      a_login_form,
    },
    when: {
      filling_valid_credentials,
      submitting_the_form,
    },
    then: {
      on_submit_is_called_with_credentials,
    },
  });

  test("shows alert when errorMessage is provided", {
    given: {
      a_login_form_with_error,
    },
    then: {
      error_alert_is_shown,
    },
  });
});

function a_login_form(this: Context) {
  this.onSubmit = vi.fn();
  this.user = userEvent.setup();
  render(
    <ThemeProvider theme={appTheme}>
      <LoginForm onSubmit={this.onSubmit} />
    </ThemeProvider>,
  );
}

function a_login_form_with_error(this: Context) {
  this.onSubmit = vi.fn();
  render(
    <ThemeProvider theme={appTheme}>
      <LoginForm onSubmit={this.onSubmit} errorMessage="Invalid credentials" />
    </ThemeProvider>,
  );
}

async function submitting_the_form(this: Context) {
  await this.user.click(screen.getByRole("button", { name: /sign in/i }));
}

async function filling_valid_credentials(this: Context) {
  await this.user.type(screen.getByLabelText("Username"), "agent");
  await this.user.type(
    screen.getByLabelText("Password", { selector: "input" }),
    "secret",
  );
}

async function validation_errors_are_shown() {
  expect(await screen.findByText("Username is required")).toBeInTheDocument();
  expect(screen.getByText("Password is required")).toBeInTheDocument();
}

function on_submit_is_not_called(this: Context) {
  expect(this.onSubmit).not.toHaveBeenCalled();
}

async function on_submit_is_called_with_credentials(this: Context) {
  await waitFor(() => {
    expect(this.onSubmit).toHaveBeenCalledWith(
      { username: "agent", password: "secret" },
      expect.anything(),
    );
  });
}

function error_alert_is_shown() {
  expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
}
