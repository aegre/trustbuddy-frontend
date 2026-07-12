import type { QuoteResponse } from "@/api/types";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
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

export function formatQuotePremium(
  value: QuoteResponse["estimatedMonthlyPremium"],
): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return currencyFormatter.format(value);
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
