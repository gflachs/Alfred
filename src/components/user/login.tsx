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

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onSignup: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({
  open,
  onClose,
  onSignup,
}) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { email, password } = formData;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      onClose(); // Schließt den Dialog bei Erfolg
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
          Anmelden bei Alfred
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
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
        <Button onClick={onSignup} color="primary">
          Registrieren
        </Button>
        <Button type="submit" variant="contained" onClick={handleSubmit}>
          Anmelden
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;
