import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from "react";
import { useAuth } from "@/features/auth";

const toolbarSx = {
  gap: 2,
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
        <Typography variant="body2" color="text.secondary" noWrap>
          {username ? `Signed in as ${username}` : "Signed in"}
        </Typography>
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
