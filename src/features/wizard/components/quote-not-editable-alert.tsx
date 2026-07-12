import Alert from "@mui/material/Alert";
import type { QuoteResponse } from "@/api/types";

export type QuoteNotEditableAlertProps = {
  quote: QuoteResponse;
};

export function QuoteNotEditableAlert({ quote }: QuoteNotEditableAlertProps) {
  const statusLabel = quote.status ?? "unknown";

  return (
    <Alert severity="info">
      This quote is {statusLabel} and can no longer be edited.
    </Alert>
  );
}
