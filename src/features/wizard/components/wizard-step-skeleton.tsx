import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export type WizardStepSkeletonProps = {
  /** Accessible loading label. When omitted with announce=false, used as nested chrome. */
  label?: string;
  /** When false, render fields only (parent owns the status region). */
  announce?: boolean;
};

const fieldSx = { borderRadius: 1 } as const;

function WizardStepSkeletonFields() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" height={56} sx={fieldSx} />
      <Skeleton variant="rounded" height={56} sx={fieldSx} />
      <Skeleton variant="rounded" height={56} sx={fieldSx} />
      <Skeleton variant="rounded" height={56} sx={fieldSx} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
        <Skeleton variant="rounded" width={120} height={42} sx={fieldSx} />
      </Box>
    </Stack>
  );
}

/** Shimmer placeholders for wizard step content while a quote loads. */
export function WizardStepSkeleton({
  label = "Loading quote",
  announce = true,
}: WizardStepSkeletonProps) {
  if (!announce) {
    return <WizardStepSkeletonFields />;
  }

  return (
    <Box component="output" aria-label={label} aria-busy="true" sx={{ m: 0 }}>
      <Box aria-hidden>
        <WizardStepSkeletonFields />
      </Box>
    </Box>
  );
}
