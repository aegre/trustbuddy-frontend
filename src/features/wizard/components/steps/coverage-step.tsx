import Typography from "@mui/material/Typography";
import type { WizardStepProps } from "@/features/wizard/types/wizard-steps";

const bodySx = { mt: 1 } as const;

export function CoverageStep({ quote, readOnly }: WizardStepProps) {
  return (
    <>
      <Typography component="h2" variant="h6">
        Coverage
      </Typography>
      <Typography color="text.secondary" sx={bodySx}>
        {readOnly && quote
          ? `Viewing coverage for ${quote.name} (read-only). Form arrives in Phase 6.`
          : quote
            ? `Coverage for ${quote.name}. Form arrives in Phase 6.`
            : "Stub coverage step. Create personal info first (Phase 5)."}
      </Typography>
    </>
  );
}
