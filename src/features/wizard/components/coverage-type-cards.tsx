import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import {
  hiddenControlSx,
  selectableCardActionSx,
  selectableCardClassName,
  selectableCardSx,
} from "@/features/wizard/components/selectable-card-styles";
import { coverageTypeCardTitleSx } from "@/features/wizard/components/coverage-type-cards.styles";
import {
  COVERAGE_TYPE_LABELS,
  COVERAGE_TYPES,
  type CoverageTypeValue,
} from "@/features/wizard/schemas/coverage";

const coverageTypeGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
  gap: 1.5,
} as const;

export type CoverageTypeCardsProps = {
  value: CoverageTypeValue | "";
  onChange: (value: CoverageTypeValue) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  name?: string;
  label?: string;
  labelId?: string;
};

export function CoverageTypeCards({
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
  name = "coverageType",
  label = "Coverage type",
  labelId = "coverage-type-label",
}: CoverageTypeCardsProps) {
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
      <RadioGroup
        aria-labelledby={labelId}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value as CoverageTypeValue)}
        sx={coverageTypeGridSx}
      >
        {COVERAGE_TYPES.map((type) => {
          const selected = value === type;
          return (
            <Card
              key={type}
              variant="outlined"
              className={selectableCardClassName(selected, disabled)}
              sx={selectableCardSx}
            >
              <CardActionArea
                component="label"
                disabled={disabled}
                sx={selectableCardActionSx}
              >
                <Radio
                  value={type}
                  sx={hiddenControlSx}
                  disableRipple
                  disabled={disabled}
                />
                <Typography component="span" sx={coverageTypeCardTitleSx}>
                  {COVERAGE_TYPE_LABELS[type]}
                </Typography>
              </CardActionArea>
            </Card>
          );
        })}
      </RadioGroup>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}
