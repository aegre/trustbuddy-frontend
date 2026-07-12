import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { TrustbuddyMark } from "@/features/common/components/trustbuddy-mark";
import { paths } from "@/routes/paths";

const toolbarSx = {
  gap: 1.5,
  minHeight: 52,
  px: { xs: 2, sm: 3 },
} as const;

const brandLinkSx = {
  color: "text.primary",
  display: "inline-flex",
  alignItems: "center",
  textDecoration: "none",
  "&:hover": {
    opacity: 0.85,
  },
} as const;

const spacerSx = { flexGrow: 1 } as const;

export function AppSessionBar() {
  const { username, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout]);

  return (
    <AppBar position="sticky" color="default" elevation={0} component="header">
      <Toolbar variant="dense" sx={toolbarSx}>
        <Box
          component={RouterLink}
          to={paths.home}
          aria-label="Trustbuddy home"
          sx={brandLinkSx}
        >
          <TrustbuddyMark />
        </Box>
        <Box sx={spacerSx} />
        {username ? (
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ maxWidth: { xs: "6.5rem", sm: "14rem" } }}
          >
            {username}
          </Typography>
        ) : null}
        <IconButton
          color="inherit"
          size="small"
          aria-label={isLoggingOut ? "Signing out" : "Log out"}
          onClick={() => {
            void onLogout();
          }}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <CircularProgress color="inherit" size={18} />
          ) : (
            <LogoutOutlinedIcon fontSize="small" />
          )}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
