import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import { supabase } from "./utils/supabase";
import LoginDialog from "./components/user/login";
import SignupDialog from "./components/user/signup";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/Settings";
import type { User } from "@supabase/supabase-js";
import { useMediaQuery } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#4caf50" },
    background: { default: "#f5f5f5", paper: "#ffffff" },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontSize: "2.5rem", fontWeight: 500 },
    body1: { fontSize: "1.25rem" },
    button: { fontSize: "1.1rem", textTransform: "none" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "12px 24px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { "& .MuiInputBase-input": { fontSize: "1.25rem" } },
      },
    },
  },
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [currentPage, setCurrentPage] = useState<"dashboard" | "settings">(
    "dashboard"
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Mobile Ansicht bei < 600px

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) setOpenLogin(true);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (!session?.user && event !== "SIGNED_OUT") setOpenLogin(true);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOpenLogin(true);
    handleMenuClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (page: "dashboard" | "settings") => {
    setCurrentPage(page);
    handleMenuClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary" sx={{ maxWidth: "100%" }}>
        <Toolbar>
          <img
            src="/alfred.svg"
            alt="Alfred Logo"
            style={{ height: 50, marginRight: 16 }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Alfred
          </Typography>
          {user && (
            <>
              {isMobile ? (
                <>
                  <IconButton
                    color="inherit"
                    onClick={handleMenuOpen}
                    edge="end"
                    aria-label="menu"
                  >
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <MenuItem
                      onClick={() => handleMenuItemClick("dashboard")}
                      selected={currentPage === "dashboard"}
                    >
                      Dashboard
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleMenuItemClick("settings")}
                      selected={currentPage === "settings"}
                    >
                      Einstellungen
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Abmelden</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    onClick={() => setCurrentPage("dashboard")}
                    sx={{ mr: 1 }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => setCurrentPage("settings")}
                    sx={{ mr: 1 }}
                  >
                    Einstellungen
                  </Button>
                  <Button color="inherit" onClick={handleLogout}>
                    Abmelden
                  </Button>
                </>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
      {user ? (
        currentPage === "dashboard" ? (
          <Dashboard />
        ) : (
          <SettingsPage />
        )
      ) : (
        <Typography sx={{ p: 4, textAlign: "center" }}>
          Bitte melden Sie sich an.
        </Typography>
      )}
      <LoginDialog
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onSignup={() => {
          setOpenLogin(false);
          setOpenSignup(true);
        }}
      />
      <SignupDialog
        open={openSignup}
        onClose={() => setOpenSignup(false)}
        onLogin={() => {
          setOpenSignup(false);
          setOpenLogin(true);
        }}
      />
    </ThemeProvider>
  );
};

export default App;
