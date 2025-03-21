import React, { useState } from "react";
import {
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { mockMovementData, MovementData } from "../../types/movementData";
import { Bed, Chair, DirectionsRun } from "@mui/icons-material";

const getActivityLabel = (type: number) => {
  switch (type) {
    case 1:
      return "Liegen";
    case 2:
      return "Sitzen";
    case 3:
      return "Aktiv";
    default:
      return "Aktiv";
  }
};

const getActivityIcon = (type: number) => {
  switch (type) {
    case 1:
      return <Bed color="primary" />;
    case 2:
      return <Chair color="primary" />;
    case 3:
      return <DirectionsRun color="primary" />;
    default:
      return null;
  }
};

const calculateDuration = (start: string, end: string) => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diffMs = endTime.getTime() - startTime.getTime();
  return diffMs / (1000 * 60 * 60); // Stunden
};

// Daten für stündliches Diagramm vorbereiten
const prepareHourlyData = (data: MovementData[]) => {
  const hourlyData: {
    [hour: string]: { Liegen: number; Sitzen: number; Aktiv: number };
  } = {};
  for (let h = 0; h < 24; h++) {
    hourlyData[`${h}:00`] = { Liegen: 0, Sitzen: 0, Aktiv: 0 };
  }

  data.forEach((entry) => {
    const start = new Date(entry.startedAt);
    const end = new Date(entry.endedAt);
    const startHour = start.getHours();
    const endHour = end.getHours();
    const duration = calculateDuration(entry.startedAt, entry.endedAt);
    const type = getActivityLabel(entry.idMovementType);
    console.log(entry);
    console.log(startHour, endHour, duration, type);
    if (startHour === endHour) {
      hourlyData[`${startHour}:00`][type] += duration;
    } else {
      for (let h = startHour; h <= endHour; h++) {
        const hourStart =
          h === startHour
            ? new Date(start)
            : new Date(start.setHours(h, 0, 0, 0));
        const hourEnd =
          h === endHour ? end : new Date(start.setHours(h + 1, 0, 0, 0));
        const hourDuration = calculateDuration(
          hourStart.toISOString(),
          hourEnd.toISOString()
        );
        console.log(hourStart, hourEnd, hourDuration);
        hourlyData[`${h}:00`][type] += Math.min(hourDuration, duration);
      }
    }
  });

  console.log(hourlyData);

  return Object.entries(hourlyData).map(([hour, values]) => ({
    hour,
    ...values,
  }));
};

// Daten für Gesamtübersicht vorbereiten
const prepareTotalData = (data: MovementData[]) => {
  const totals = { Liegen: 0, Sitzen: 0, Aktiv: 0 };
  data.forEach((entry) => {
    const duration = calculateDuration(entry.startedAt, entry.endedAt);
    const type = getActivityLabel(entry.idMovementType);
    totals[type] += duration;
  });
  return [totals];
};

const IntradayActivity: React.FC = () => {
  const [view, setView] = useState<"hourly" | "total" | "log">("hourly");
  const todayData = mockMovementData.filter((data) => {
    const date = new Date(data.startedAt).toDateString();
    return date === new Date().toDateString();
  });

  const hourlyData = prepareHourlyData(todayData);
  const totalData = prepareTotalData(todayData);

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Tagesübersicht
      </Typography>
      <Tabs
        value={view}
        onChange={(e, newValue) => setView(newValue)}
        centered
        sx={{ mb: 2 }}
      >
        <Tab label="Stündlich" value="hourly" />
        <Tab label="Gesamt" value="total" />
        <Tab label="Log" value="log" />
      </Tabs>
      <Divider sx={{ mb: 2 }} />

      {view === "hourly" && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyData}>
            <XAxis dataKey="hour" />
            <YAxis
              label={{ value: "Anteil", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="Liegen" stackId="a" fill="#1976d2" />
            <Bar dataKey="Sitzen" stackId="a" fill="#4caf50" />
            <Bar dataKey="Aktiv" stackId="a" fill="#ff9800" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {view === "total" && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={totalData} layout="vertical">
            <XAxis
              type="number"
              label={{ value: "Stunden", position: "insideBottom" }}
            />
            <YAxis type="category" hide />
            <Tooltip />
            <Legend />
            <Bar dataKey="Liegen" stackId="a" fill="#1976d2" />
            <Bar dataKey="Sitzen" stackId="a" fill="#4caf50" />
            <Bar dataKey="Aktiv" stackId="a" fill="#ff9800" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {view === "log" && (
        <List>
          {todayData.length > 0 ? (
            todayData.map((activity) => (
              <ListItem key={activity.idMovementData}>
                <ListItemIcon>
                  {getActivityIcon(activity.idMovementType)}
                </ListItemIcon>
                <ListItemText
                  primary={`${getActivityLabel(activity.idMovementType)}`}
                  secondary={`${new Date(activity.startedAt).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                  )} - ${new Date(activity.endedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} (${calculateDuration(
                    activity.startedAt,
                    activity.endedAt
                  ).toFixed(2)}h)`}
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">
              Keine Aktivitäten für heute verfügbar.
            </Typography>
          )}
        </List>
      )}
    </Paper>
  );
};

export default IntradayActivity;
