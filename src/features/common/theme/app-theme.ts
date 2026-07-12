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
    h5: {
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
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});
