import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import type { QuoteResponse } from "@/api/types";

export type QuoteNotEditableAlertProps = {
  quote: QuoteResponse;
};

export function QuoteNotEditableAlert({ quote }: QuoteNotEditableAlertProps) {
  if (quote.status === "SUBMISSION_FAILED") {
    return (
      <Box component="output">
        <Alert severity="warning">
          Submission failed. Personal and coverage details are locked — open
          Review to retry submit.
        </Alert>
      </Box>
    );
  }

  const statusLabel = quote.status ?? "unknown";

  return (
    <Box component="output">
      <Alert severity="info">
        This quote is {statusLabel} and can no longer be edited.
      </Alert>
    </Box>
  );
}
