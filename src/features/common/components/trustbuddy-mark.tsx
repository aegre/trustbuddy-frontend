import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

const rootSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  color: "inherit",
  textDecoration: "none",
} as const;

const markSx = {
  display: "inline-flex",
  width: 28,
  height: 28,
  flexShrink: 0,
} as const;

export type TrustbuddyMarkProps = {
  /** When true, render as a link target (parent supplies RouterLink). */
  sx?: SxProps<Theme>;
};

/**
 * Compact Trustbuddy shield + wordmark for app chrome and login.
 */
export function TrustbuddyMark({ sx }: TrustbuddyMarkProps) {
  return (
    <Box sx={[rootSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      <Box
        component="svg"
        viewBox="0 0 32 32"
        aria-hidden
        sx={markSx}
        fill="currentColor"
      >
        <path d="M16 2.5 5 6.5v8.2c0 7.1 4.7 13.1 11 14.8 6.3-1.7 11-7.7 11-14.8V6.5L16 2.5Zm0 3.1 8 2.9v6.2c0 5.2-3.3 9.7-8 11.2-4.7-1.5-8-6-8-11.2V8.5l8-2.9Z" />
        <path d="M14.2 10.2h3.6v7.4h-3.6V10.2Zm0 8.8h3.6V22h-3.6v-3Z" />
      </Box>
      <Typography
        component="span"
        variant="subtitle1"
        sx={{ fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2 }}
      >
        Trustbuddy
      </Typography>
    </Box>
  );
}
