import { describe, expect, it } from "vitest";
import { redirectPathFromLocationState } from "@/routes/login-redirect";
import { paths } from "@/routes/paths";

describe("redirectPathFromLocationState", () => {
  it("given_pathWithSearch_when_resolved_then_preservesQuery", () => {
    expect(
      redirectPathFromLocationState({
        from: "/wizard/personal?quoteId=q-1",
      }),
    ).toBe("/wizard/personal?quoteId=q-1");
  });

  it("given_missingOrUnsafe_when_resolved_then_defaultsHome", () => {
    expect(redirectPathFromLocationState(null)).toBe(paths.home);
    expect(redirectPathFromLocationState({ from: "//evil.example" })).toBe(
      paths.home,
    );
    expect(redirectPathFromLocationState({ from: "https://evil" })).toBe(
      paths.home,
    );
  });
});
