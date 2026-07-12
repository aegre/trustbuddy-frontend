import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Typography from "@mui/material/Typography";
import { conditionCardTitleSx } from "@/features/wizard/components/condition-cards.styles";
import {
  hiddenControlSx,
  selectableCardActionSx,
  selectableCardSx,
} from "@/features/wizard/components/selectable-card-styles";
import {
  CONDITION_LABELS,
  CONDITION_OPTIONS,
  type ConditionValue,
} from "@/features/wizard/schemas/coverage";

const conditionsGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
  gap: 1.5,
  mt: 1,
} as const;

export type ConditionCardsProps = {
  value: ConditionValue[];
  onChange: (value: ConditionValue[]) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  labelId?: string;
};

export function ConditionCards({
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
  label = "Conditions",
  labelId = "conditions-label",
}: ConditionCardsProps) {
  return (
    <FormControl
      component="fieldset"
      fullWidth
      error={error}
      disabled={disabled}
    >
      <FormLabel id={labelId} component="legend">
        {label}
      </FormLabel>
      <Box sx={conditionsGridSx}>
        {CONDITION_OPTIONS.map((condition) => {
          const selected = value.includes(condition);
          return (
            <Card
              key={condition}
              variant="outlined"
              sx={selectableCardSx(selected, disabled)}
            >
              <CardActionArea
                component="label"
                disabled={disabled}
                sx={selectableCardActionSx}
              >
                <Checkbox
                  sx={hiddenControlSx}
                  disableRipple
                  checked={selected}
                  disabled={disabled}
                  onChange={(_, checked) => {
                    onChange(
                      checked
                        ? [...value, condition]
                        : value.filter((item) => item !== condition),
                    );
                  }}
                />
                <Typography
                  component="span"
                  sx={conditionCardTitleSx(selected)}
                >
                  {CONDITION_LABELS[condition]}
                </Typography>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}
