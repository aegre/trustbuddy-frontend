import Typography from "@mui/material/Typography";

const headingSx = { p: 3 } as const;

/** Temporary protected home until Phase 3 quotes list. */
export function QuotesHomePlaceholder() {
  return (
    <Typography component="h1" variant="h5" sx={headingSx}>
      Quotes
    </Typography>
  );
}
