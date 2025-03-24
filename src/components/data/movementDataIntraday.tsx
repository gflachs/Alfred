import React, { useState } from "react";
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { mockMovementData } from "../../types/movementData";
import { de } from "date-fns/locale";
import { hasDataForDate } from "../../utils/activityUtils";
import HourlyActivity from "./HourlyActivity";
import WeeklyActivity from "./WeeklyActivity";
import MonthlyActivity from "./MonthlyActivity";

const IntradayActivity: React.FC = () => {
  const [view, setView] = useState<"hourly" | "weekly" | "monthly">("hourly");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
      <Box
        sx={{
          mt: 3,
          boxShadow: 2,
          borderRadius: 2,
          p: 3,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Bewegungsübersicht
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
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
              view === "hourly" ? "Tag" : view === "weekly" ? "Woche" : "Monat"
            }
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue || new Date())}
            slotProps={{ textField: { size: "small" } }}
            views={
              view === "hourly"
                ? ["day"]
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
          <HourlyActivity data={mockMovementData} selectedDate={selectedDate} />
        )}
        {view === "weekly" && (
          <WeeklyActivity data={mockMovementData} selectedDate={selectedDate} />
        )}
        {view === "monthly" && (
          <MonthlyActivity
            data={mockMovementData}
            selectedDate={selectedDate}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default IntradayActivity;
