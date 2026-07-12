import AddModeratorOutlinedIcon from "@mui/icons-material/AddModeratorOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import Box from "@mui/material/Box";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { alpha, type SxProps, type Theme } from "@mui/material/styles";

export type CoveragePlanType = "BASIC" | "STANDARD" | "PREMIUM" | undefined;

export function CoveragePlanIcon({
  coverageType,
  ...iconProps
}: {
  coverageType: CoveragePlanType;
} & SvgIconProps) {
  switch (coverageType) {
    case "PREMIUM":
      return <WorkspacePremiumOutlinedIcon {...iconProps} />;
    case "STANDARD":
      return <AddModeratorOutlinedIcon {...iconProps} />;
    case "BASIC":
    default:
      return <ShieldOutlinedIcon {...iconProps} />;
  }
}

function planToneSx(theme: Theme, coverageType: CoveragePlanType) {
  switch (coverageType) {
    case "PREMIUM":
      return {
        bgcolor: alpha(theme.palette.warning.main, 0.14),
        color: "warning.dark",
      };
    case "STANDARD":
      return {
        bgcolor: alpha(theme.palette.primary.main, 0.12),
        color: "primary.main",
      };
    case "BASIC":
      return {
        bgcolor: alpha(theme.palette.info.main, 0.12),
        color: "info.dark",
      };
    default:
      return {
        bgcolor: "action.hover",
        color: "text.secondary",
      };
  }
}

export type CoveragePlanIconBadgeProps = {
  coverageType: CoveragePlanType;
  size?: number;
  iconFontSize?: SvgIconProps["fontSize"];
  sx?: SxProps<Theme>;
};

export function CoveragePlanIconBadge({
  coverageType,
  size = 56,
  iconFontSize = "medium",
  sx,
}: CoveragePlanIconBadgeProps) {
  return (
    <Box
      aria-hidden
      sx={[
        (theme) => ({
          display: "grid",
          placeItems: "center",
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: "50%",
          ...planToneSx(theme, coverageType),
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <CoveragePlanIcon coverageType={coverageType} fontSize={iconFontSize} />
    </Box>
  );
}
