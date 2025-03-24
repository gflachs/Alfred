import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { getWeeklyAverages, getWeeklyTrend } from "../../utils/dashboardUtils";
import type { MovementData } from "../../types/movementData";

interface ActivityMetricsProps {
  data: MovementData[];
}

const ActivityMetrics: React.FC<ActivityMetricsProps> = ({ data }) => {
  // Berechne die durchschnittlichen Stunden für die aktuelle und vorherige Woche
  const currentWeekEnd = new Date();
  const currentWeekStart = new Date(currentWeekEnd);
  currentWeekStart.setDate(currentWeekEnd.getDate() - 6); // Letzte 7 Tage

  const previousWeekEnd = new Date(currentWeekStart);
  previousWeekEnd.setDate(currentWeekStart.getDate() - 1);
  const previousWeekStart = new Date(previousWeekEnd);
  previousWeekStart.setDate(previousWeekEnd.getDate() - 6); // Vorherige 7 Tage

  const currentAverages = getWeeklyAverages(
    data,
    currentWeekStart,
    currentWeekEnd
  );
  const trend = getWeeklyTrend(
    data,
    currentWeekStart,
    currentWeekEnd,
    previousWeekStart,
    previousWeekEnd
  );

  const renderTrend = (value: number, reverse: boolean = false) => {
    let symbolPositiv = "+";
    let symbolNegativ = "-";
    if (reverse) {
      value = -value;
      symbolPositiv = "-";
      symbolNegativ = "+";
    }
    if (value > 0) {
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <ArrowUpward color="success" fontSize="small" />
          <Typography variant="caption" color="success.main">
            {`${symbolPositiv}${Math.abs(value).toFixed(1)}h`}
          </Typography>
        </Stack>
      );
    } else if (value < 0) {
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <ArrowDownward color="error" fontSize="small" />
          <Typography variant="caption" color="error.main">
            {`${symbolNegativ}${Math.abs(value).toFixed(1)}h`}
          </Typography>
        </Stack>
      );
    } else {
      return (
        <Typography variant="caption" color="textSecondary">
          ±0.0h
        </Typography>
      );
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: "#fff",
        boxShadow: 1,
        width: "100%",
        maxWidth: 500,
      }}
    >
      <Stack direction="column" spacing={1} alignItems="center">
        <Typography variant="body1">Durchschnitt (letzte 7 Tage):</Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body1">
              Liegen: {currentAverages.Liegen.toFixed(1)}h
            </Typography>
            {renderTrend(trend.Liegen, true)}
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body1">
              Sitzen: {currentAverages.Sitzen.toFixed(1)}h
            </Typography>
            {renderTrend(trend.Sitzen, true)}
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body1">
              Aktiv: {currentAverages.Aktiv.toFixed(1)}h
            </Typography>
            {renderTrend(trend.Aktiv, false)}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ActivityMetrics;
