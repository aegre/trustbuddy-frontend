import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageLoading } from "@/features/common/components/page-loading";
import { renderWithProviders } from "@/test/render";

describe("PageLoading", () => {
  it("given_label_when_rendered_then_announcesStatus", () => {
    renderWithProviders(<PageLoading label="Loading quotes" />);

    expect(
      screen.getByRole("status", { name: /loading quotes/i }),
    ).toBeInTheDocument();
  });
});
