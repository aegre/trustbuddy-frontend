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

export function selectableCardSx(selected: boolean, disabled: boolean) {
  return {
    position: "relative",
    overflow: "hidden",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: selected ? "primary.main" : "divider",
    bgcolor: selected ? "action.selected" : "background.paper",
    boxShadow: "none",
    opacity: disabled ? 0.55 : 1,
    transition:
      "border-color 120ms ease, background-color 120ms ease, opacity 120ms ease",
    "&:hover": disabled
      ? undefined
      : {
          borderColor: selected ? "primary.main" : "primary.light",
          bgcolor: selected ? "action.selected" : "action.hover",
        },
    "&:has(.Mui-focusVisible)": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: 2,
    },
  } as const;
}
