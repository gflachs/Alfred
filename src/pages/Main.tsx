import React, { useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import IntradayActivity from "../components/data/movementDataIntraday";

const MainPage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deviceConnected, setDeviceConnected] = useState(false); // Mock-Status

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Willkommen bei Alfred
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Chip
          label={deviceConnected ? "Gerät verbunden" : "Gerät nicht verbunden"}
          color={deviceConnected ? "success" : "error"}
          sx={{ fontSize: "1.1rem", padding: "8px" }}
        />
      </Box>
      <IntradayActivity />
    </Box>
  );
};

export default MainPage;
