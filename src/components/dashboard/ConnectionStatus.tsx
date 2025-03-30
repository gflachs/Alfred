import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Wifi as WifiIcon } from "@mui/icons-material";
import { BluetoothService } from "../../services/bluetooth";

async function connectToDevice() {
  const bluetoothService = BluetoothService.getInstance();
  const connected = await bluetoothService.tryConnect();
  if (!connected) {
    console.error("Verbindung konnte nicht hergestellt werden.");
  }
}

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: isConnected ? "#e8f5e9" : "#ffebee",
        textAlign: "center",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
      >
        <WifiIcon color={isConnected ? "success" : "error"} />
        <Typography variant="h6">
          {isConnected ? "Alfred ist verbunden" : "Alfred ist nicht verbunden"}
        </Typography>
        {isConnected === false && (
          <Button variant="outlined" color="primary" onClick={connectToDevice}>
            Verbinden
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default ConnectionStatus;
