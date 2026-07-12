import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

export type YesNoToggleProps = {
  label: string;
  value?: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  /** Stable id for the label / aria-labelledby association. */
  labelId?: string;
};

const toggleGroupSx = { mt: 1 } as const;

function toToggleValue(value: boolean | null | undefined): "yes" | "no" | null {
  if (value === undefined || value === null) {
    return null;
  }
  return value ? "yes" : "no";
}

export function YesNoToggle({
  label,
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
  labelId,
}: YesNoToggleProps) {
  const id = labelId ?? `yes-no-${label.toLowerCase().replaceAll(/\s+/g, "-")}`;

  return (
    <FormControl error={error} disabled={disabled} fullWidth>
      <FormLabel id={id}>{label}</FormLabel>
      <ToggleButtonGroup
        exclusive
        fullWidth
        color="primary"
        sx={toggleGroupSx}
        aria-labelledby={id}
        value={toToggleValue(value)}
        onChange={(_, next: "yes" | "no" | null) => {
          if (next !== null) {
            onChange(next === "yes");
          }
        }}
        disabled={disabled}
      >
        <ToggleButton value="yes" aria-label={`${label}, Yes`}>
          Yes
        </ToggleButton>
        <ToggleButton value="no" aria-label={`${label}, No`}>
          No
        </ToggleButton>
      </ToggleButtonGroup>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}
