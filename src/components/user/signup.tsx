import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  DialogActions,
  Box,
} from "@mui/material";
import { supabase } from "../../utils/supabase";

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const SignupDialog: React.FC<SignupDialogProps> = ({
  open,
  onClose,
  onLogin,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const { email, firstName, lastName, password } = formData;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { firstName, lastName } },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: "center" }}>
        <img
          src="/alfred.svg"
          alt="Alfred"
          style={{ height: 60, marginBottom: 8 }}
        />
        <Typography variant="h5" color="primary">
          Registrieren bei Alfred
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Erfolgreich registriert! Bitte überprüfen Sie Ihre E-Mail.
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="E-Mail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              type="email"
            />
            <TextField
              label="Vorname"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Nachname"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Passwort"
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              type="password"
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button onClick={onLogin} color="primary">
          Anmelden
        </Button>
        <Button type="submit" variant="contained" onClick={handleSubmit}>
          Registrieren
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignupDialog;
