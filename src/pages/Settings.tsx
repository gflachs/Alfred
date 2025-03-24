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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { sendSMS, supabase } from "../utils/supabase";
import EmergencyAlertDialog from "../components/EmergencyAlertDialog";

interface EmergencyContact {
  idEmergencyContact: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  idUser: string;
}

const SettingsPage: React.FC = () => {
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

  // Authentifizierten Benutzer abrufen
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndContacts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchContacts(user.id);
      } else {
        setError("Benutzer nicht authentifiziert. Bitte melden Sie sich an.");
      }
    };

    fetchUserAndContacts();
  }, []);

  const fetchContacts = async (userId: string) => {
    const { data, error } = await supabase
      .from("EmergencyContacts")
      .select("*")
      .eq("idUser", userId);

    if (error) {
      setError("Fehler beim Abrufen der Notfallkontakte: " + error.message);
      return;
    }

    setContacts(data || []);
  };

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
      // Bearbeiten eines bestehenden Kontakts
      const { error } = await supabase
        .from("EmergencyContacts")
        .update({
          firstName,
          lastName,
          phoneNumber,
        })
        .eq("idEmergencyContact", editingContact.idEmergencyContact);

      if (error) {
        setError("Fehler beim Aktualisieren des Kontakts: " + error.message);
        return;
      }

      setSuccess("Kontakt erfolgreich aktualisiert!");
    } else {
      // Hinzufügen eines neuen Kontakts
      const { error } = await supabase.from("EmergencyContacts").insert([
        {
          firstName,
          lastName,
          phoneNumber,
          idUser: userId,
        },
      ]);

      if (error) {
        setError("Fehler beim Hinzufügen des Kontakts: " + error.message);
        return;
      }

      // Sende SMS an den neuen Kontakt
      const { success } = await sendSMS(
        `Hallo ${firstName} ${lastName}, Sie wurden als Notfallkontakt bei Alfred hinzugefügt.`,
        phoneNumber
      );

      if (success) {
        setSuccess(
          "Kontakt erfolgreich hinzugefügt! Eine SMS wurde an den Kontakt gesendet."
        );
      } else {
        setSuccess(
          "Kontakt erfolgreich hinzugefügt, aber die SMS konnte nicht gesendet werden."
        );
      }
    }

    // Formular zurücksetzen
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setEditingContact(null);
    setError(null);

    // Kontakte neu laden
    fetchContacts(userId);
  };

  const handleTestSMS = () => {
    if (contacts.length === 0) {
      setError("Keine Notfallkontakte vorhanden, um Test-SMS zu senden.");
      return;
    }

    setOpenTestDialog(true);
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFirstName(contact.firstName);
    setLastName(contact.lastName);
    setPhoneNumber(contact.phoneNumber);
  };

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

    // Kontakte neu laden
    if (userId) {
      fetchContacts(userId);
    }
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setError(null);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: "auto" }}>
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

      {/* Testbutton zum Senden von Test-SMS */}
      {contacts.length > 0 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Button variant="outlined" color="primary" onClick={handleTestSMS}>
            Test-SMS an alle Kontakte senden
          </Button>
        </Stack>
      )}

      {/* Notfall-Alarm-Dialog */}
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
