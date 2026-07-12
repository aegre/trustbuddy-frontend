import Typography from "@mui/material/Typography";
import type { WizardStepProps } from "@/features/wizard/types/wizard-steps";

const bodySx = { mt: 1 } as const;

export function PersonalStep({ quote, readOnly }: WizardStepProps) {
  return (
    <>
      <Typography component="h2" variant="h6">
        Personal information
      </Typography>
      <Typography color="text.secondary" sx={bodySx}>
        {readOnly && quote
          ? `Viewing ${quote.name} (read-only). Form arrives in Phase 5.`
          : quote
            ? `Editing ${quote.name} (${quote.status}). Form arrives in Phase 5.`
            : "Stub for a new quote. Form arrives in Phase 5."}
      </Typography>
    </>
  );
}
