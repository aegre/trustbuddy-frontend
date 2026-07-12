import { ThemeProvider } from "@mui/material/styles";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { PersonalForm } from "@/features/wizard/components/steps/personal-form";
import { appTheme } from "@/features/common/theme/app-theme";

function renderPersonalForm(
  props: Partial<ComponentProps<typeof PersonalForm>> = {},
) {
  const onSubmit = props.onSubmit ?? vi.fn();
  render(
    <ThemeProvider theme={appTheme}>
      <PersonalForm onSubmit={onSubmit} {...props} />
    </ThemeProvider>,
  );
  return { onSubmit };
}

describe("PersonalForm", () => {
  it("given_emptyFields_when_submitted_then_showsValidationErrors", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderPersonalForm();

    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Age is required")).toBeInTheDocument();
    expect(screen.getByText("ZIP code is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("given_validValues_when_submitted_then_callsOnSubmit", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderPersonalForm();

    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Age"), "36");
    await user.type(screen.getByLabelText("ZIP code"), "06600");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          name: "Ada Lovelace",
          email: "ada@example.com",
          age: 36,
          zipCode: "06600",
        },
        expect.anything(),
      );
    });
  });

  it("given_errorMessage_when_rendered_then_showsAlert", () => {
    renderPersonalForm({ errorMessage: "Quote was updated elsewhere" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Quote was updated elsewhere",
    );
  });

  it("given_readOnly_when_rendered_then_hidesSubmit", () => {
    renderPersonalForm({
      readOnly: true,
      defaultValues: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        age: 36,
        zipCode: "06600",
      },
    });

    expect(screen.getByLabelText("Full name")).toHaveValue("Ada Lovelace");
    expect(
      screen.queryByRole("button", { name: /continue/i }),
    ).not.toBeInTheDocument();
  });
});
