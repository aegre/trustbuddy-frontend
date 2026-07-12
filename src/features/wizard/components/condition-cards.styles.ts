import type { Theme } from "@mui/material/styles";

/** Condition option label — matches Yes/No ToggleButton type tokens. */
export const conditionCardTitleSx = {
  fontWeight: 500,
  fontSize: (theme: Theme) => theme.typography.body2.fontSize,
  lineHeight: (theme: Theme) => theme.typography.body2.lineHeight,
  letterSpacing: (theme: Theme) => theme.typography.body2.letterSpacing,
  color: "inherit",
};
