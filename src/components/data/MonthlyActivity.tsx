import React from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MovementData } from "../../types/movementData";
import { getActivityLabel, calculateDuration } from "../../utils/activityUtils";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
} from "date-fns";

const COLORS = ["#1976d2", "#4caf50", "#ff9800"]; // Blau, Grün, Orange

const prepareMonthlyData = (data: MovementData[], monthStart: Date) => {
  const days = eachDayOfInterval({
    start: startOfMonth(monthStart),
    end: endOfMonth(monthStart),
  });
  const monthlyData: {
    [date: string]: { Liegen: number; Sitzen: number; Aktiv: number };
  } = {};

  days.forEach((day) => {
    monthlyData[format(day, "d")] = { Liegen: 0, Sitzen: 0, Aktiv: 0 };
  });

  data.forEach((entry) => {
    const start = new Date(entry.startedAt);
    if (
      start.getMonth() === monthStart.getMonth() &&
      start.getFullYear() === monthStart.getFullYear()
    ) {
      const day = format(start, "d");
      const duration = calculateDuration(entry.startedAt, entry.endedAt);
      monthlyData[day][getActivityLabel(entry.idMovementType)] += duration;
    }
  });

  // Berechne die maximale Gesamtaktivität für die Skalierung der Kreise
  const maxActivity = Math.max(
    ...days.map((day) => {
      const dayData = monthlyData[format(day, "d")];
      return dayData.Liegen + dayData.Sitzen + dayData.Aktiv;
    })
  );

  return days.map((day) => {
    const dayData = monthlyData[format(day, "d")];
    const totalActivity = dayData.Liegen + dayData.Sitzen + dayData.Aktiv;
    return {
      day: format(day, "d"),
      totalActivity,
      activityRatio: maxActivity > 0 ? totalActivity / maxActivity : 0, // Für die Skalierung der Kreise
      ...dayData,
      pieData: [
        { name: "Liegen", value: dayData.Liegen, color: COLORS[0] },
        { name: "Sitzen", value: dayData.Sitzen, color: COLORS[1] },
        { name: "Aktiv", value: dayData.Aktiv, color: COLORS[2] },
      ].filter((entry) => entry.value > 0), // Nur Werte > 0 anzeigen
    };
  });
};

interface MonthlyActivityProps {
  data: MovementData[];
  selectedDate: Date;
}

const MonthlyActivity: React.FC<MonthlyActivityProps> = ({
  data,
  selectedDate,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const monthlyData = prepareMonthlyData(data, selectedDate);

  // Wochentagsüberschriften
  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  // Berechne den Starttag des Monats (0 = So, 1 = Mo, ..., 6 = Sa)
  const firstDayOfMonth = getDay(startOfMonth(selectedDate));
  const firstDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Verschiebe So (0) ans Ende

  // Füge leere Boxen vor dem ersten Tag hinzu, um das Grid korrekt auszurichten
  const gridItems = [
    ...Array(firstDayOffset).fill(null), // Leere Boxen für den Offset
    ...monthlyData,
  ];

  // Berechne die Anzahl der Wochen (für die Grid-Zeilen)
  const totalDays = gridItems.length;
  const weeks = Math.ceil(totalDays / 7);

  return (
    <Box sx={{ width: "100%", overflowX: "hidden" }}>
      {/* Wochentagsüberschriften */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 1,
          mb: 2,
          textAlign: "center",
        }}
      >
        {weekdays.map((day) => (
          <Typography key={day} variant="body2" fontWeight="bold">
            {day}
          </Typography>
        ))}
      </Box>

      {/* Kalender-Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: `repeat(${weeks}, auto)`,
          gap: isMobile ? 1 : 2,
          width: "100%",
          justifyItems: "center",
        }}
      >
        {gridItems.map((dayData, index) => {
          if (!dayData) {
            return <Box key={`empty-${index}`} />;
          }

          const { day, activityRatio, pieData } = dayData;
          const circleSize = isMobile ? 40 : 50; // Kleinere Kreise auf Mobile
          const minSize = isMobile ? 20 : 30; // Minimale Größe für Kreise
          const size = minSize + activityRatio * (circleSize - minSize); // Skaliere die Größe basierend auf Aktivität

          return (
            <Box key={day} sx={{ textAlign: "center" }}>
              <ResponsiveContainer width={size} height={size}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={size / 2}
                    innerRadius={size / 3}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieData.map(
                      (
                        entry: { color: string | undefined },
                        index: unknown
                      ) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      )
                    )}
                  </Pie>
                  <text
                    x={size / 2}
                    y={size / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#000"
                    fontSize={isMobile ? 12 : 14}
                    fontWeight="bold"
                  >
                    {day}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default MonthlyActivity;
