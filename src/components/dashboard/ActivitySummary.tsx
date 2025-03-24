import React from "react";
import { Box, Stack, Typography, useMediaQuery } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface ActivitySummaryProps {
  currentActivity: string;
  dailySummary: { Liegen: number; Sitzen: number; Aktiv: number };
  motivationalMessage: string;
}

const COLORS = ["#1976d2", "#4caf50", "#ff9800"]; // Blau, Grün, Orange

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) / 2; // Mittig im Slice
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff" // Weiß für Kontrast im Slice
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="12"
      fontWeight="500"
    >
      {`${value.toFixed(1)}h`}
    </text>
  );
};

const ActivitySummary: React.FC<ActivitySummaryProps> = ({
  currentActivity,
  dailySummary,
  motivationalMessage,
}) => {
  const isDesktop = useMediaQuery("(min-width:900px)"); // Desktop ab 900px

  // Dynamische Höhe basierend auf Bildschirmgröße
  const chartHeight = isDesktop ? 500 : 250;
  // Dynamischer Radius basierend auf Höhe
  const outerRadius = isDesktop ? 200 : 100;

  // Daten für das Tortendiagramm vorbereiten
  const pieData = [
    { name: "Liegen", value: dailySummary.Liegen },
    { name: "Sitzen", value: dailySummary.Sitzen },
    { name: "Aktiv", value: dailySummary.Aktiv },
  ].filter((entry) => entry.value > 0); // Nur Werte > 0 anzeigen

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: "#f5f5f5",
        textAlign: "center",
        width: { xs: "100%", md: "100%", lg: "1200" },
      }}
    >
      <Stack direction="column" spacing={2} alignItems="center">
        <Typography variant="h6" gutterBottom>
          Heutiges Aktivitätsprofil
        </Typography>
        <Typography variant="h5">
          Aktueller Status: {currentActivity}
        </Typography>
        {pieData.length > 0 && (
          <Box sx={{ width: "100%", height: chartHeight }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={outerRadius}
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  wrapperStyle={{
                    fontSize: isDesktop ? 14 : 12,
                    marginTop: 10,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="body1">{motivationalMessage}</Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ActivitySummary;
