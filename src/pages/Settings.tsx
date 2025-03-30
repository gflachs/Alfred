import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Switch,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { sendSMS, supabase } from "../utils/supabase";
import EmergencyAlertDialog from "../components/EmergencyAlertDialog";
import { dataService } from "../services/dataService";
import { EmergencyContact } from "../types/emergencyContact";

/** Props für die SettingsPage-Komponente */
interface SettingsPageProps {
  useMockData: boolean;
  setUseMockData: (useMockData: boolean) => void;
}

/**
 * Eine React-Komponente zur Verwaltung von Notfallkontakten und Mock-Daten-Einstellungen.
 * @param {SettingsPageProps} props - Eigenschaften der Komponente
 * @returns {JSX.Element} Die gerenderte Einstellungsseite
 */
const SettingsPage: React.FC<SettingsPageProps> = ({
  useMockData,
  setUseMockData,
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialisiere Datenabonnements und Benutzer-ID
  useEffect(() => {
    if (!isSubscribed) {
      console.log("Subscribing to EmergencyContacts");
      dataService.subscribeToData("EmergencyContacts", (data) => {
        setContacts(data as EmergencyContact[]);
      });
      setIsSubscribed(true); // Verhindert Mehrfachabonnements
    }
    if (!userId) {
      console.log("Getting user profile");
      dataService.getUserProfile().then((user) => {
        if (user) {
          setUserId(user.idUserProfile);
        }
      });
    }
  }, [isSubscribed, userId]);

  /**
   * Fügt einen neuen Kontakt hinzu oder aktualisiert einen bestehenden.
   */
  const handleAddOrUpdateContact = async () => {
    if (!firstName || !lastName || !phoneNumber) {
      setError("Bitte füllen Sie alle Felder aus.");
      return;
    }
    if (!userId) {
      setError("Benutzer nicht authentifiziert.");
      return;
    }

    if (editingContact) {
      // Aktualisiere bestehenden Kontakt
      const { error } = await supabase
        .from("EmergencyContacts")
        .update({ firstName, lastName, phoneNumber })
        .eq("idEmergencyContact", editingContact.idEmergencyContact);

      if (error) {
        setError("Fehler beim Aktualisieren des Kontakts: " + error.message);
        return;
      }
      setSuccess("Kontakt erfolgreich aktualisiert!");
    } else {
      // Füge neuen Kontakt hinzu
      const { error } = await supabase
        .from("EmergencyContacts")
        .insert([{ firstName, lastName, phoneNumber, idUser: userId }]);

      if (error) {
        setError("Fehler beim Hinzufügen des Kontakts: " + error.message);
        return;
      }

      // Sende Bestätigungs-SMS an den neuen Kontakt
      const { success } = await sendSMS(
        `Hallo ${firstName} ${lastName}, Sie wurden als Notfallkontakt bei Alfred hinzugefügt.`,
        phoneNumber
      );

      setSuccess(
        success
          ? "Kontakt erfolgreich hinzugefügt! Eine SMS wurde an den Kontakt gesendet."
          : "Kontakt erfolgreich hinzugefügt, aber die SMS konnte nicht gesendet werden."
      );
    }

    // Formular zurücksetzen
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setEditingContact(null);
    setError(null);
  };

  /**
   * Öffnet den Testdialog, wenn Kontakte vorhanden sind.
   */
  const handleTestSMS = () => {
    if (contacts.length === 0) {
      setError("Keine Notfallkontakte vorhanden, um Test-SMS zu senden.");
      return;
    }
    setOpenTestDialog(true);
  };

  /**
   * Bereitet einen Kontakt zum Bearbeiten vor.
   * @param {EmergencyContact} contact - Der zu bearbeitende Kontakt
   */
  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFirstName(contact.firstName);
    setLastName(contact.lastName);
    setPhoneNumber(contact.phoneNumber);
  };

  /**
   * Löscht einen Kontakt aus der Datenbank.
   * @param {string} idEmergencyContact - ID des zu löschenden Kontakts
   */
  const handleDeleteContact = async (idEmergencyContact: string) => {
    const { error } = await supabase
      .from("EmergencyContacts")
      .delete()
      .eq("idEmergencyContact", idEmergencyContact);

    if (error) {
      setError("Fehler beim Löschen des Kontakts: " + error.message);
      return;
    }
    setSuccess("Kontakt erfolgreich gelöscht!");
    setError(null);
  };

  /**
   * Bricht das Bearbeiten eines Kontakts ab.
   */
  const handleCancelEdit = () => {
    setEditingContact(null);
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setError(null);
  };

  // Zeige Ladeanimation, bis Benutzer-ID geladen ist
  if (!userId) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: "auto" }}>
      {/* Switch für Mock-Daten */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
        Mockdaten
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center">
        <Typography variant="body1">Mockdaten verwenden</Typography>
        <Switch
          checked={useMockData}
          onChange={() => setUseMockData(!useMockData)}
        />
      </Stack>

      {/* Titel für Notfallkontakte */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
        Notfallkontakte
      </Typography>

      {/* Formular zum Hinzufügen/Bearbeiten */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <TextField
          label="Vorname"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Nachname"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Telefonnummer"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddOrUpdateContact}
          >
            {editingContact ? "Aktualisieren" : "Hinzufügen"}
          </Button>
          {editingContact && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancelEdit}
            >
              Abbrechen
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Liste der Notfallkontakte */}
      <Typography variant="h6" gutterBottom sx={{ textAlign: "center" }}>
        Ihre Notfallkontakte
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <ListItem
              key={contact.idEmergencyContact}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleEditContact(contact)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() =>
                      handleDeleteContact(contact.idEmergencyContact)
                    }
                  >
                    <Delete />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={`${contact.firstName} ${contact.lastName}`}
                secondary={contact.phoneNumber}
              />
            </ListItem>
          ))
        ) : (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ textAlign: "center" }}
          >
            Keine Notfallkontakte vorhanden.
          </Typography>
        )}
      </List>

      {/* Testbutton für SMS */}
      {contacts.length > 0 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Button variant="outlined" color="primary" onClick={handleTestSMS}>
            Test-SMS an alle Kontakte senden
          </Button>
        </Stack>
      )}

      {/* Dialog für Notfalltests */}
      <EmergencyAlertDialog
        open={openTestDialog}
        onClose={() => setOpenTestDialog(false)}
        contacts={contacts}
        onSuccess={(message) => setSuccess(message)}
        onError={(message) => setError(message)}
      />
    </Box>
  );
};

export default SettingsPage;
