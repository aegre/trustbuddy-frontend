import Typography from "@mui/material/Typography";
import type { WizardStepProps } from "@/features/wizard/types/wizard-steps";

const bodySx = { mt: 1 } as const;

export function ReviewStep({ quote, readOnly }: WizardStepProps) {
  return (
    <>
      <Typography component="h2" variant="h6">
        Review & submit
      </Typography>
      <Typography color="text.secondary" sx={bodySx}>
        {readOnly && quote
          ? `Viewing ${quote.name} (read-only). Submit flow arrives in Phase 7.`
          : `Review ${quote?.name ?? "quote"} before submit. Submit flow arrives in Phase 7.`}
      </Typography>
    </>
  );
}
