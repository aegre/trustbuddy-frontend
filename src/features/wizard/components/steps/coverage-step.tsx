import Typography from "@mui/material/Typography";
import type { WizardStepProps } from "@/features/wizard/types/wizard-steps";

const bodySx = { mt: 1 } as const;

export function CoverageStep({ quoteId }: WizardStepProps) {
  return (
    <>
      <Typography component="h2" variant="h6">
        Coverage
      </Typography>
      <Typography color="text.secondary" sx={bodySx}>
        {quoteId
          ? `Stub coverage step for quote ${quoteId}. Form arrives in Phase 6.`
          : "Stub coverage step. Create personal info first (Phase 5)."}
      </Typography>
    </>
  );
}
