import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuotesListSkeleton } from "@/features/quotes/components/quotes-list-skeleton";
import { renderWithProviders } from "@/test/render";

describe("QuotesListSkeleton", () => {
  it("given_default_when_rendered_then_announcesLoadingStatus", () => {
    renderWithProviders(<QuotesListSkeleton />);

    expect(
      screen.getByRole("status", { name: /loading quotes/i }),
    ).toBeInTheDocument();
  });
});
