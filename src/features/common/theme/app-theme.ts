import { createTheme } from "@mui/material/styles";

/**
 * Palette from the Vite scaffold CSS variables (preview look).
 * Refine when dedicated brand styling lands.
 */
export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#aa3bff",
      light: "#c084fc",
      dark: "#8b2fd6",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#08060d",
      secondary: "#6b6375",
    },
    background: {
      default: "#f4f3ec",
      paper: "#ffffff",
    },
    divider: "#e5e4e7",
    action: {
      hover: "rgba(170, 59, 255, 0.08)",
      selected: "rgba(170, 59, 255, 0.12)",
      focus: "rgba(170, 59, 255, 0.16)",
    },
  },
  typography: {
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
    h4: {
      color: "#08060d",
      fontWeight: 600,
    },
    h5: {
      color: "#08060d",
      fontWeight: 600,
    },
    h6: {
      color: "#08060d",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: "none",
          fontWeight: 600,
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiTable: {
      defaultProps: {
        size: "small",
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: ({ theme }) => ({
          ...theme.typography.body2,
          "&.Mui-active": {
            fontWeight: 600,
          },
          "&.Mui-completed": {
            fontWeight: 500,
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundImage: "none",
        }),
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          fontSize: theme.typography.body2.fontSize,
          fontWeight: 500,
          lineHeight: 1.4,
          "&.Mui-focused": {
            color: theme.palette.text.secondary,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
            borderWidth: 1,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.light,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
          },
        }),
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          borderWidth: 1,
          fontWeight: 500,
          fontSize: theme.typography.body2.fontSize,
          lineHeight: 1.4,
          textTransform: "none",
          color: theme.palette.text.primary,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.action.selected,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            fontWeight: 500,
            "&:hover": {
              backgroundColor: theme.palette.action.selected,
            },
          },
          "&.Mui-disabled": {
            opacity: 0.5,
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            backgroundColor: theme.palette.background.paper,
            "&.Mui-selected": {
              backgroundColor: theme.palette.action.selected,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
            },
          },
        }),
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
        }),
        grouped: {
          "&:not(:first-of-type)": {
            marginLeft: 0,
          },
        },
      },
    },
  },
});
