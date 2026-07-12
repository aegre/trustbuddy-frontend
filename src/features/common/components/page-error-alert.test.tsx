import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PageErrorAlert } from "@/features/common/components/page-error-alert";
import { renderWithProviders } from "@/test/render";

describe("PageErrorAlert", () => {
  it("given_message_when_rendered_then_showsAlert", () => {
    renderWithProviders(<PageErrorAlert>Could not load quotes</PageErrorAlert>);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load quotes",
    );
  });

  it("given_onRetry_when_clicked_then_invokesCallback", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    renderWithProviders(
      <PageErrorAlert onRetry={onRetry}>Boom</PageErrorAlert>,
    );

    await user.click(screen.getByRole("button", { name: /retry/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
