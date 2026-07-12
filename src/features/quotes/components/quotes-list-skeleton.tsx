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
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: { xs: 1.5, sm: 2 },
  p: { xs: 2, sm: 2.5 },
  borderRadius: 3,
} as const;

const metaSx = {
  minWidth: 0,
  flex: "1 1 auto",
} as const;

const trailingSx = {
  display: "flex",
  alignItems: "center",
  gap: { xs: 1, sm: 1.5 },
  flexShrink: 0,
} as const;

function QuoteCardSkeleton() {
  return (
    <Paper elevation={0} variant="outlined" sx={cardSx}>
      <Box sx={metaSx}>
        <Skeleton variant="text" width="48%" height={28} />
        <Skeleton variant="text" width="36%" height={20} />
      </Box>
      <Box sx={trailingSx}>
        <Skeleton variant="text" width={72} height={32} />
        <Skeleton
          variant="rounded"
          width={88}
          height={24}
          sx={{ borderRadius: 999 }}
        />
      </Box>
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
      <Stack component="ul" spacing={{ xs: 1.5, sm: 2 }} sx={listSx}>
        {Array.from({ length: count }, (_, index) => (
          <Box key={index} component="li" aria-hidden>
            <QuoteCardSkeleton />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
