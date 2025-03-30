import React, { useState, useEffect } from "react"; // Importiert React sowie die Hooks useState und useEffect
import { ThemeProvider, createTheme } from "@mui/material/styles"; // Importiert ThemeProvider und createTheme für Material-UI-Theming
import CssBaseline from "@mui/material/CssBaseline"; // Normalisiert CSS über verschiedene Browser hinweg
import AppBar from "@mui/material/AppBar"; // Material-UI-Komponente für die Navigationsleiste
import Toolbar from "@mui/material/Toolbar"; // Container innerhalb der AppBar
import Typography from "@mui/material/Typography"; // Für Textdarstellung
import Button from "@mui/material/Button"; // Für Schaltflächen
import IconButton from "@mui/material/IconButton"; // Für Icon-Schaltflächen
import Menu from "@mui/material/Menu"; // Dropdown-Menü
import MenuItem from "@mui/material/MenuItem"; // Elemente im Dropdown-Menü
import MenuIcon from "@mui/icons-material/Menu"; // Hamburger-Menü-Icon
import { supabase } from "./utils/supabase"; // Supabase-Client für Authentifizierung und Datenbankzugriff
import LoginDialog from "./components/user/login"; // Login-Dialog-Komponente
import SignupDialog from "./components/user/signup"; // Signup-Dialog-Komponente
import Dashboard from "./pages/Dashboard"; // Dashboard-Seite
import SettingsPage from "./pages/Settings"; // Einstellungs-Seite
import type { User } from "@supabase/supabase-js"; // Typdefinition für Supabase User
import { useMediaQuery } from "@mui/material"; // Hook für Responsive Design (Media Queries)
import * as movementDataService from "./services/movementDataService"; // Service für Bewegungsdaten
import { BluetoothService } from "./services/bluetooth"; // Bluetooth-Service Singleton
import { dataService } from "./services/dataService"; // Service für Datenabonnements
import { EmergencyContact } from "./types/emergencyContact"; // Typ für Notfallkontakte
import EmergencyAlertDialog from "./components/EmergencyAlertDialog"; // Dialog für Notfallalarme
import { MovementData, mockMovementData } from "./types/movementData"; // Typen und Mock-Daten für Bewegungsdaten

// Initialisierung des BluetoothService Singleton
const bluetoothService = BluetoothService.getInstance();

// Abonnieren von neuen Werten vom BluetoothService und Weiterleitung an movementDataService
bluetoothService.subscribeToNewValue(movementDataService.handleNewValue);

// Setzt die UUID des Bluetooth-Dienstes
bluetoothService.setServiceUUID("c38a205a-5dc3-4126-86d1-487028603576");

// Definition des Material-UI-Themes
const theme = createTheme({
  palette: {
    mode: "light", // Helles Farbschema
    primary: { main: "#1976d2" }, // Primärfarbe (Blau)
    secondary: { main: "#4caf50" }, // Sekundärfarbe (Grün)
    background: { default: "#f5f5f5", paper: "#ffffff" }, // Hintergrundfarben
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Schriftart
    h4: { fontSize: "2.5rem", fontWeight: 500 }, // Stil für h4
    body1: { fontSize: "1.25rem" }, // Stil für body1
    button: { fontSize: "1.1rem", textTransform: "none" }, // Stil für Buttons
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Abgerundete Ecken
          padding: "12px 24px", // Innenabstand
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Leichter Schatten
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { "& .MuiInputBase-input": { fontSize: "1.25rem" } }, // Größere Schrift in Textfeldern
      },
    },
  },
});

// Hauptkomponente der App
const App: React.FC = () => {
  // Zustände (State) der Anwendung
  const [user, setUser] = useState<User | null>(null); // Aktueller Benutzer (oder null)
  const [openLogin, setOpenLogin] = useState(false); // Steuert Sichtbarkeit des Login-Dialogs
  const [openSignup, setOpenSignup] = useState(false); // Steuert Sichtbarkeit des Signup-Dialogs
  const [useMockData, setUseMockData] = useState(false); // Umschalten zwischen echten und Mock-Daten
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([]); // Liste der Notfallkontakte
  const [currentPage, setCurrentPage] = useState<"dashboard" | "settings">(
    "dashboard"
  ); // Aktuelle Seite
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // Anker für das Dropdown-Menü
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Prüft, ob Bildschirm < 600px (Mobil)
  const [openTestDialog, setOpenTestDialog] = useState(false); // Steuert Sichtbarkeit des Testdialogs
  const [movementData, setMovementData] = useState<MovementData[]>([]); // Bewegungsdaten

  // Handler für Sturzerkennung
  const handleFalling = () => {
    console.log("Falling detected");
    setOpenTestDialog(true); // Öffnet Testdialog bei Sturz
  };

  // useEffect für Initialisierung und Authentifizierungsüberwachung
  useEffect(() => {
    // Initiale Sitzung prüfen
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || !session.user) {
        setOpenLogin(true); // Öffnet Login-Dialog, wenn kein Benutzer angemeldet
      } else {
        setUser(session.user); // Setzt den aktuellen Benutzer
        movementDataService.subscribeToFalling(handleFalling); // Abonniert Sturzerkennung
        // Abonnieren von Notfallkontakten
        dataService.subscribeToData("EmergencyContacts", (data) => {
          setEmergencyContacts(data as EmergencyContact[]);
        });
        // Abonnieren von Bewegungsdaten
        dataService.subscribeToData(
          "MovementData",
          (data) => {
            setMovementData(data as MovementData[]);
          },
          false
        );
        // Bewegungsdaten der letzten 7 Tage abrufen
        dataService
          .getMovementData({
            startDate: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(),
          })
          .then((data) => {
            setMovementData(data as MovementData[]);
          });
      }
    });

    // Authentifizierungsänderungen überwachen
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null); // Aktualisiert Benutzerstatus
      setOpenLogin(!session?.user); // Öffnet Login-Dialog bei Abmeldung
      if (!session?.user) {
        // Bereinigung bei Abmeldung
        movementDataService.unsubscribeFromFalling(handleFalling);
        dataService.unsubscribeFromData("EmergencyContacts", (data) => {
          setEmergencyContacts(data as EmergencyContact[]);
        });
        dataService.unsubscribeFromData("MovementData", (data) => {
          setMovementData(data as MovementData[]);
        });
      }
    });

    // Bereinigung bei Komponentenabbau
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Leeres Array -> Effekt läuft nur beim Mount

  // Logout-Handler
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Meldet Benutzer ab
    setUser(null);
    setOpenLogin(true); // Öffnet Login-Dialog
    handleMenuClose();
  };

  // Öffnet das Dropdown-Menü (mobil)
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Schließt das Dropdown-Menü
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handler für Menüauswahl
  const handleMenuItemClick = (page: "dashboard" | "settings") => {
    setCurrentPage(page);
    handleMenuClose();
  };

  // Testet Sturzerkennung manuell
  const testFalling = () => {
    movementDataService.handleNewValue(4); // Simuliert einen Sturz (Wert 4)
  };

  // Rendern der UI
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary" sx={{ maxWidth: "100%" }}>
        <Toolbar>
          <img
            src="/alfred.svg"
            alt="Alfred Logo"
            style={{ height: 50, marginRight: 16 }}
          />{" "}
          {/* Logo */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Alfred
          </Typography>
          {user && ( // Nur anzeigen, wenn Benutzer angemeldet
            <>
              {isMobile ? ( // Mobile Ansicht: Hamburger-Menü
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
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
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
                // Desktop-Ansicht: Buttons
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
                  <Button color="inherit" onClick={testFalling}>
                    Testfall
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
      {user ? ( // Bedingte Anzeige basierend auf Benutzerstatus
        currentPage === "dashboard" ? (
          <Dashboard
            useMockData={useMockData}
            movementData={useMockData ? mockMovementData : movementData}
          />
        ) : (
          <SettingsPage
            useMockData={useMockData}
            setUseMockData={setUseMockData}
          />
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
          setOpenSignup(true); // Wechselt zu Signup-Dialog
        }}
      />
      <SignupDialog
        open={openSignup}
        onClose={() => setOpenSignup(false)}
        onLogin={() => {
          setOpenSignup(false);
          setOpenLogin(true); // Wechselt zu Login-Dialog
        }}
      />
      <EmergencyAlertDialog
        open={openTestDialog}
        onClose={() => setOpenTestDialog(false)}
        contacts={emergencyContacts}
        onSuccess={() => {}} // Platzhalter für Erfolgs-Handler
        onError={() => {}} // Platzhalter für Fehler-Handler
      />
    </ThemeProvider>
  );
};

export default App; // Exportiert die App-Komponente
// Dies ist die Hauptkomponente der Alfred-App, die das Layout und die Navigation verwaltet.
