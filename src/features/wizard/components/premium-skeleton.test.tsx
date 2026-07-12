import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PremiumSkeleton } from "@/features/wizard/components/premium-skeleton";
import { renderWithProviders } from "@/test/render";

describe("PremiumSkeleton", () => {
  it("given_default_when_rendered_then_announcesUpdatingPremium", () => {
    renderWithProviders(<PremiumSkeleton />);

    expect(
      screen.getByRole("status", {
        name: /updating estimated monthly premium/i,
      }),
    ).toBeInTheDocument();
  });
});
