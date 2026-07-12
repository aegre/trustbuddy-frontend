import Typography from "@mui/material/Typography";
import type { WizardStepProps } from "@/features/wizard/types/wizard-steps";

const bodySx = { mt: 1 } as const;

export function ReviewStep({ quoteId, quote }: WizardStepProps) {
  return (
    <>
      <Typography component="h2" variant="h6">
        Review & submit
      </Typography>
      <Typography color="text.secondary" sx={bodySx}>
        {quote
          ? `Review ${quote.name} before submit. Submit flow arrives in Phase 7.`
          : quoteId
            ? `Stub review for quote ${quoteId}. Submit flow arrives in Phase 7.`
            : "Stub review step. Create personal info first (Phase 5)."}
      </Typography>
    </>
  );
}
