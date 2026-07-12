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
  ml: "auto",
} as const;

const priceBlockSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 0.75,
} as const;

function QuoteCardSkeleton() {
  return (
    <Paper elevation={0} variant="outlined" sx={cardSx}>
      <Skeleton
        variant="circular"
        width={56}
        height={56}
        sx={{ flexShrink: 0, display: { xs: "none", sm: "block" } }}
      />
      <Box sx={metaSx}>
        <Skeleton variant="text" width="48%" height={28} />
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="28%" height={16} />
      </Box>
      <Box sx={trailingSx}>
        <Box sx={priceBlockSx}>
          <Skeleton variant="text" width={72} height={32} />
          <Skeleton
            variant="rounded"
            width={72}
            height={24}
            sx={{ borderRadius: 999 }}
          />
        </Box>
        <Skeleton variant="circular" width={24} height={24} />
      </Box>
    </Paper>
  );
}

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
