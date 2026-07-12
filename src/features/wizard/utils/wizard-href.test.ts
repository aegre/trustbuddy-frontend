import { describe, expect } from "vitest";
import test from "vitest-gwt";
import { wizardHref } from "@/features/wizard/utils/wizard-href";
import { paths } from "@/routes/paths";

type Context = {
  personal?: string;
  coverage?: string;
  review?: string;
};

describe("wizardHref", () => {
  test("builds step paths without quoteId", {
    when: {
      building_step_paths,
    },
    then: {
      paths_match_wizard_routes,
    },
  });

  test("appends quoteId query when provided", {
    when: {
      building_step_paths_with_quote_id,
    },
    then: {
      paths_include_quote_id_query,
    },
  });
});

function building_step_paths(this: Context) {
  this.personal = wizardHref("personal");
  this.coverage = wizardHref("coverage");
  this.review = wizardHref("review");
}

function building_step_paths_with_quote_id(this: Context) {
  this.personal = wizardHref("personal", { quoteId: "q-1" });
  this.coverage = wizardHref("coverage", { quoteId: "q-1" });
}

function paths_match_wizard_routes(this: Context) {
  expect(this.personal).toBe(paths.wizardPersonal);
  expect(this.coverage).toBe(`${paths.wizardBase}/coverage`);
  expect(this.review).toBe(`${paths.wizardBase}/review`);
}

function paths_include_quote_id_query(this: Context) {
  expect(this.personal).toBe(`${paths.wizardPersonal}?quoteId=q-1`);
  expect(this.coverage).toBe(`${paths.wizardBase}/coverage?quoteId=q-1`);
}
