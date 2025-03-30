import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import { sendSMS } from "../utils/supabase";

interface EmergencyContact {
  idEmergencyContact: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  idUser: string;
}

interface EmergencyAlertDialogProps {
  open: boolean;
  onClose: () => void;
  contacts: EmergencyContact[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const EmergencyAlertDialog: React.FC<EmergencyAlertDialogProps> = ({
  open,
  onClose,
  contacts,
  onSuccess,
  onError,
}) => {
  const [countdown, setCountdown] = useState(10); // Countdown von 10 Sekunden
  const [isCancelled, setIsCancelled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null); // Warnton laden
  useEffect(() => {
    if (!open) {
      setCountdown(10);
      setIsCancelled(false);
      setIsSending(false);
      if (audio) {
        audio.pause(); // Stoppe den Ton, wenn der Dialog geschlossen wird
        audio.currentTime = 0; // Setze den Ton auf den Anfang zurück
      }
      setAudio(null);

      if ("vibrate" in navigator) {
        navigator.vibrate(0); // 0 stoppt die Vibration
      }
      return;
    } else if (!audio) {
      setAudio(new Audio("/alarm.ogg"));
    }

    // Spiele den Warnton ab, wenn der Dialog geöffnet wird
    if (audio) {
      audio.loop = true; // Spiele den Ton in einer Schleife

      audio.play().catch((error) => {
        console.error("Fehler beim Abspielen des Warntons:", error);
      });
    }
    let vibrationInterval: NodeJS.Timeout;
    if ("vibrate" in navigator) {
      // Vibrationsmuster: 500ms Vibration, 500ms Pause, wiederholt
      const pattern = [500, 500];
      //start a repeating vibration, with an interval of 500ms
      vibrationInterval = setInterval(() => {
        navigator.vibrate(pattern);
        if (isCancelled) {
          //cancel the interval after 1000ms
          clearInterval(vibrationInterval);
          navigator.vibrate(0);
        }
      }, 1000);
    } else {
      console.warn("Vibration API wird auf diesem Gerät nicht unterstützt.");
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev == 0) {
          clearInterval(timer);
          if (!isCancelled) {
            clearInterval(vibrationInterval);
            handleSendSMS();
          }
          return -1;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (audio) {
        audio.pause(); // Stoppe den Ton, wenn der Dialog unmountet wird
        audio.currentTime = 0;
      }
      if ("vibrate" in navigator) {
        navigator.vibrate(0);
      }
    };
  }, [open, isCancelled, audio]);

  const handleSendSMS = async () => {
    setIsSending(true);
    if (audio) {
      audio.pause(); // Stoppe den Ton, während die SMS gesendet werden
      audio.currentTime = 0;
    }

    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }

    let successfulSends = 0;
    const failedSends: string[] = [];

    console.log("Sende Notfall-SMS an Kontakte:", contacts);

    for (const contact of contacts) {
      const { success } = await sendSMS(
        "Test-SMS von Alfred: Dies ist eine Notfallnachricht.",
        contact.phoneNumber
      );

      if (success) {
        successfulSends++;
      } else {
        failedSends.push(
          `${contact.firstName} ${contact.lastName} (${contact.phoneNumber})`
        );
      }
    }

    if (successfulSends === contacts.length) {
      onSuccess(
        `Notfall-SMS an alle ${successfulSends} Kontakte erfolgreich gesendet!`
      );
    } else {
      onSuccess(
        `Notfall-SMS an ${successfulSends} von ${contacts.length} Kontakten gesendet.`
      );
      if (failedSends.length > 0) {
        onError(
          `Fehler beim Senden an: ${failedSends.join(
            ", "
          )}. Bitte überprüfen Sie die Telefonnummern.`
        );
      }
    }

    setIsSending(false);
    onClose();
  };

  const handleCancel = () => {
    setIsCancelled(true);
    if (audio) {
      audio.pause(); // Stoppe den Ton, wenn abgebrochen wird
      audio.currentTime = 0;
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
    onSuccess("Notfall-SMS-Versand abgebrochen.");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle sx={{ textAlign: "center" }}>Notfall-Alarm</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ textAlign: "center", mb: 2 }}>
          Sturz erkannt. Hilfe wird angefordert.
        </Typography>
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          Verbleibende Zeit zum Abbrechen: {countdown} Sekunden
        </Typography>
        {isSending && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleCancel}
          disabled={isSending}
        >
          Abbrechen ({countdown})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmergencyAlertDialog;
