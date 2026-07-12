import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export type PremiumSkeletonProps = {
  /** Accessible loading label. */
  label?: string;
};

const rootSx = {
  display: "inline-flex",
  m: 0,
  verticalAlign: "middle",
} as const;

const barSx = {
  borderRadius: 0.5,
} as const;

/** Inline shimmer for estimated monthly premium while it recalculates. */
export function PremiumSkeleton({
  label = "Updating estimated monthly premium",
}: PremiumSkeletonProps) {
  return (
    <Box component="output" aria-label={label} aria-busy="true" sx={rootSx}>
      <Skeleton variant="rounded" width={88} height={22} sx={barSx} />
    </Box>
  );
}
