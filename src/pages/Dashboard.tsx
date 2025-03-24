import React, { useState } from "react";
import { Box, Typography, Stack, Grid, useMediaQuery } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { de } from "date-fns/locale";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { mockMovementData } from "../types/movementData";
import { hasDataForDate } from "../utils/activityUtils";
import {
  getCurrentActivity,
  getDailySummary,
  getMotivationalMessage,
} from "../utils/dashboardUtils";
import ConnectionStatus from "../components/dashboard/ConnectionStatus";
import ActivitySummary from "../components/dashboard/ActivitySummary";
import ActivityLog from "../components/dashboard/ActivityLog";
import ActivityMetrics from "../components/dashboard/ActivityMetrics";
import HourlyActivity from "../components/data/HourlyActivity";
import WeeklyActivity from "../components/data/WeeklyActivity";
import MonthlyActivity from "../components/data/MonthlyActivity";

const Dashboard: React.FC = () => {
  const [view, setView] = useState<"hourly" | "weekly" | "monthly">("hourly");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isConnected] = useState(true); // Platzhalter für Bluetooth-Verbindung

  const isMobile = useMediaQuery("(max-width:600px)");

  const currentActivity = getCurrentActivity(mockMovementData, new Date());
  const dailySummary = getDailySummary(mockMovementData, new Date());
  const motivationalMessage = getMotivationalMessage(dailySummary);

  const recentActivities = mockMovementData.filter(
    (entry) =>
      new Date(entry.startedAt).toDateString() === new Date().toDateString()
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          backgroundColor: "#f9f9f9",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{ mb: 5 }}
        >
          <Typography variant="h4" textAlign="center">
            Willkommen bei Alfred
          </Typography>
        </Stack>

        {/* Connection Status */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
          <Box
            sx={{ width: { xs: "100%", sm: "80%", md: "50%" }, maxWidth: 400 }}
          >
            <ConnectionStatus
              isConnected={isConnected}
              lastUpdated={new Date().toLocaleTimeString()}
            />
          </Box>
        </Box>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            mb: 3,
            justifyContent: "center",
          }}
        >
          <Box sx={{ width: { xs: "100%", sm: "80%", md: "80%" } }}>
            <ActivitySummary
              currentActivity={currentActivity}
              dailySummary={dailySummary}
              motivationalMessage={motivationalMessage}
            />
          </Box>
        </Box>

        {/* Main Grid */}
        <Grid container spacing={4}>
          {/* Letzte Aktivitäten und Metriken in einer Box (Desktop) */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: "#fff",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                width: "100%",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "column" }}
                spacing={3}
                sx={{ alignItems: "center" }}
              >
                <Box sx={{ width: "100%", maxWidth: 500 }}>
                  <ActivityMetrics data={mockMovementData} />
                </Box>
                <Box sx={{ width: "100%", maxWidth: 500 }}>
                  <ActivityLog activities={recentActivities} />
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* Chart & Date Filter */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: "#fff",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                sx={{ mb: 3, justifyContent: "center" }}
              >
                <FormControl sx={{ width: { xs: "100%", sm: 200 } }}>
                  <InputLabel>Ansicht</InputLabel>
                  <Select
                    value={view}
                    onChange={(e) =>
                      setView(e.target.value as "hourly" | "weekly" | "monthly")
                    }
                    label="Ansicht"
                  >
                    <MenuItem value="hourly">Stündlich</MenuItem>
                    <MenuItem value="weekly">Wöchentlich</MenuItem>
                    <MenuItem value="monthly">Monatlich</MenuItem>
                  </Select>
                </FormControl>
                <DatePicker
                  label={
                    view === "hourly"
                      ? "Tag"
                      : view === "weekly"
                      ? "Woche"
                      : "Monat"
                  }
                  value={selectedDate}
                  onChange={(newValue) =>
                    setSelectedDate(newValue || new Date())
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { width: { xs: "100%", sm: 200 } },
                    },
                  }}
                  views={
                    view === "hourly"
                      ? ["year", "month", "day"]
                      : view === "weekly"
                      ? ["year", "month", "day"]
                      : ["year", "month"]
                  }
                  shouldDisableDate={(date) =>
                    !hasDataForDate(mockMovementData, date, view)
                  }
                />
              </Stack>
              {view === "hourly" && (
                <HourlyActivity
                  data={mockMovementData}
                  selectedDate={selectedDate}
                />
              )}
              {view === "weekly" && (
                <WeeklyActivity
                  data={mockMovementData}
                  selectedDate={selectedDate}
                />
              )}
              {view === "monthly" && (
                <MonthlyActivity
                  data={mockMovementData}
                  selectedDate={selectedDate}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;
