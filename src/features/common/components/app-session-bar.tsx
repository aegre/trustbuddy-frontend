import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { paths } from "@/routes/paths";

const toolbarSx = {
  gap: 1.5,
  minHeight: 48,
  px: { xs: 2, sm: 3 },
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
        <IconButton
          component={RouterLink}
          to={paths.home}
          edge="start"
          color="inherit"
          aria-label="Home"
          size="small"
        >
          <HomeOutlinedIcon fontSize="small" />
        </IconButton>
        {username ? (
          <Typography variant="body2" color="text.secondary" noWrap>
            {username}
          </Typography>
        ) : null}
        <Box sx={spacerSx} />
        <Button
          color="inherit"
          size="small"
          onClick={() => {
            void onLogout();
          }}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Signing out…" : "Log out"}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
