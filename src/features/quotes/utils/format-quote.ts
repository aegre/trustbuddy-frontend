import type { QuoteResponse } from "@/api/types";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const createdDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});

const premiumAmountFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatQuoteDate(value: string | undefined): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return dateFormatter.format(date);
}

/** Date-only label for list cards (e.g. Mar 14, 2026). */
export function formatQuoteCreatedDate(value: string | undefined): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return createdDateFormatter.format(date);
}

export function formatQuotePremium(
  value: QuoteResponse["estimatedMonthlyPremium"],
): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return currencyFormatter.format(value);
}

/** Whole-dollar premium amount for list cards (pair with a "/mo" suffix in UI). */
export function formatQuotePremiumAmount(
  value: QuoteResponse["estimatedMonthlyPremium"],
): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return premiumAmountFormatter.format(value);
}

export function formatQuoteStatus(status: QuoteResponse["status"]): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
      return "Submitted";
    case "SUBMISSION_FAILED":
      return "Failed";
    case "EXPIRED":
      return "Expired";
    default:
      return status ?? "—";
  }
}

export function formatQuoteCoverageTitle(
  coverageType: QuoteResponse["coverageType"],
  fallbackName?: string,
): string {
  switch (coverageType) {
    case "BASIC":
      return "Basic coverage";
    case "STANDARD":
      return "Standard coverage";
    case "PREMIUM":
      return "Premium coverage";
    default:
      return fallbackName?.trim() || "Untitled quote";
  }
}

/** Short display id for list cards (e.g. Q-A1B2). */
export function formatQuoteRef(id: string | undefined): string {
  if (!id) {
    return "—";
  }
  const compact = id.replaceAll("-", "");
  if (compact.length >= 4 && /^[0-9a-f]+$/i.test(compact)) {
    return `Q-${compact.slice(0, 4).toUpperCase()}`;
  }
  if (/^q-/i.test(id)) {
    return id.toUpperCase();
  }
  return `Q-${id}`;
}

export type QuoteStatusChipColor =
  "default" | "info" | "success" | "warning" | "error";

/** MUI Chip color for quote lifecycle status. */
export function quoteStatusChipColor(
  status: QuoteResponse["status"],
): QuoteStatusChipColor {
  switch (status) {
    case "DRAFT":
      return "info";
    case "SUBMITTED":
      return "success";
    case "SUBMISSION_FAILED":
      return "error";
    case "EXPIRED":
      return "warning";
    default:
      return "default";
  }
}
