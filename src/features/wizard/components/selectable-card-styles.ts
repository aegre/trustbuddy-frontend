/** Shared styles for card-style radio/checkbox selects. */

/** Visually hide native radio/checkbox; cards provide the select UI. */
export const hiddenControlSx = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

/** CardActionArea padding — aligned with ToggleButton density. */
export const selectableCardActionSx = {
  height: "100%",
  minHeight: 40,
  px: 2,
  py: 1.25,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
} as const;

/** MUI global state classes — same tokens as ToggleButton. */
export function selectableCardClassName(
  selected: boolean,
  disabled: boolean,
): string {
  return [selected && "Mui-selected", disabled && "Mui-disabled"]
    .filter(Boolean)
    .join(" ");
}

/** Selected / hover / disabled chrome — mirrors MuiToggleButton theme overrides. */
export const selectableCardSx = {
  position: "relative",
  overflow: "hidden",
  "&:not(.Mui-disabled):hover": {
    bgcolor: "action.hover",
  },
  "&.Mui-selected": {
    bgcolor: "action.selected",
    borderColor: "primary.main",
    color: "primary.main",
    fontWeight: 500,
    "& .MuiTypography-root": {
      fontWeight: 500,
    },
    "&:not(.Mui-disabled):hover": {
      bgcolor: "action.selected",
    },
  },
  "&.Mui-disabled": {
    opacity: 0.5,
    color: "text.primary",
    borderColor: "divider",
    bgcolor: "background.paper",
    "&.Mui-selected": {
      bgcolor: "action.selected",
      borderColor: "primary.main",
      color: "primary.main",
    },
  },
  "&:has(.Mui-focusVisible)": {
    outline: "2px solid",
    outlineColor: "primary.main",
    outlineOffset: 2,
  },
} as const;
