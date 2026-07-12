import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import type { ReactNode } from "react";

export type PageErrorAlertProps = {
  children: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
};

export function PageErrorAlert({
  children,
  onRetry,
  retryLabel = "Retry",
}: PageErrorAlertProps) {
  const action = onRetry ? (
    <Button color="inherit" size="small" onClick={onRetry}>
      {retryLabel}
    </Button>
  ) : undefined;

  return (
    <Alert severity="error" role="alert" action={action}>
      {children}
    </Alert>
  );
}
