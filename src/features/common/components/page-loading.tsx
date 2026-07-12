import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export type PageLoadingProps = {
  /** Accessible name for the loading status (e.g. "Loading quotes"). */
  label: string;
};

const rootSx = {
  display: "flex",
  justifyContent: "center",
  py: 6,
} as const;

export function PageLoading({ label }: PageLoadingProps) {
  return (
    <Box sx={rootSx}>
      <output aria-label={label}>
        <CircularProgress />
      </output>
    </Box>
  );
}
