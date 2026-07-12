import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export type QuotesListSkeletonProps = {
  /** Accessible loading label. */
  label?: string;
  /** Number of placeholder cards. */
  count?: number;
};

const listSx = {
  listStyle: "none",
  m: 0,
  p: 0,
  width: "100%",
} as const;

const cardSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 2,
} as const;

const topRowSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
} as const;

const footerSx = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 1.5,
  pt: 0.25,
} as const;

function QuoteCardSkeleton() {
  return (
    <Paper elevation={0} variant="outlined" sx={cardSx}>
      <Stack spacing={1}>
        <Box sx={topRowSx}>
          <Skeleton variant="text" width="42%" height={28} />
          <Skeleton
            variant="rounded"
            width={72}
            height={24}
            sx={{ borderRadius: 4 }}
          />
        </Box>
        <Skeleton variant="text" width="68%" height={20} />
        <Box sx={footerSx}>
          <Skeleton variant="text" width="40%" height={18} />
          <Skeleton variant="text" width={88} height={32} />
        </Box>
      </Stack>
    </Paper>
  );
}

/** Shimmer placeholders matching the quotes dashboard cards. */
export function QuotesListSkeleton({
  label = "Loading quotes",
  count = 3,
}: QuotesListSkeletonProps) {
  return (
    <Box component="output" aria-label={label} aria-busy="true" sx={{ m: 0 }}>
      <Stack component="ul" spacing={{ xs: 1.25, sm: 1.5 }} sx={listSx}>
        {Array.from({ length: count }, (_, index) => (
          <Box key={index} component="li" aria-hidden>
            <QuoteCardSkeleton />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
