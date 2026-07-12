import type { Theme } from "@mui/material/styles";

/**
 * Condition option label.
 * Matches Yes/No ToggleButton type tokens; selected uses primary.
 */
export function conditionCardTitleSx(selected: boolean) {
  return {
    fontWeight: 500,
    fontSize: (theme: Theme) => theme.typography.body2.fontSize,
    lineHeight: (theme: Theme) => theme.typography.body2.lineHeight,
    letterSpacing: (theme: Theme) => theme.typography.body2.letterSpacing,
    color: selected ? "primary.main" : "text.primary",
  };
}
