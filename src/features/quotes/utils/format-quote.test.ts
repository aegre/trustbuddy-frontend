import { describe, expect } from "vitest";
import test from "vitest-gwt";
import {
  formatQuoteDate,
  formatQuotePremium,
  formatQuoteStatus,
} from "@/features/quotes/utils/format-quote";
import { paths, wizardPersonalHref } from "@/routes/paths";

type Context = {
  result?: string;
};

describe("formatQuote", () => {
  test("formats premium values", {
    then: {
      premium_is_formatted,
      missing_premium_is_em_dash,
    },
  });

  test("formats status values", {
    then: {
      status_is_formatted,
      missing_status_is_em_dash,
    },
  });

  test("formats dates or em dash", {
    then: {
      valid_date_is_formatted,
      missing_date_is_em_dash,
      invalid_date_is_em_dash,
    },
  });
});

describe("wizardPersonalHref", () => {
  test("builds new quote href", {
    when: {
      building_new_quote_href,
    },
    then: {
      href_is_personal_path,
    },
  });

  test("builds edit quote href", {
    when: {
      building_edit_quote_href,
    },
    then: {
      href_includes_quote_id,
    },
  });
});

function premium_is_formatted() {
  expect(formatQuotePremium(120.5)).toMatch(/120/);
}

function missing_premium_is_em_dash() {
  expect(formatQuotePremium(undefined)).toBe("—");
}

function status_is_formatted() {
  expect(formatQuoteStatus("DRAFT")).toBe("DRAFT");
}

function missing_status_is_em_dash() {
  expect(formatQuoteStatus(undefined)).toBe("—");
}

function valid_date_is_formatted() {
  expect(formatQuoteDate("2026-01-15T10:00:00Z")).not.toBe("—");
}

function missing_date_is_em_dash() {
  expect(formatQuoteDate(undefined)).toBe("—");
}

function invalid_date_is_em_dash() {
  expect(formatQuoteDate("not-a-date")).toBe("—");
}

function building_new_quote_href(this: Context) {
  this.result = wizardPersonalHref();
}

function building_edit_quote_href(this: Context) {
  this.result = wizardPersonalHref("q-1");
}

function href_is_personal_path(this: Context) {
  expect(this.result).toBe(paths.wizardPersonal);
}

function href_includes_quote_id(this: Context) {
  expect(this.result).toBe(`${paths.wizardPersonal}?quoteId=q-1`);
}
