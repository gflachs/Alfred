import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Wifi as WifiIcon } from "@mui/icons-material";

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdated: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  lastUpdated,
}) => {
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
      </Stack>
      <Typography variant="body2" color="textSecondary">
        Zuletzt aktualisiert: {lastUpdated}
      </Typography>
    </Box>
  );
};

export default ConnectionStatus;
