import React from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { MovementData } from "../../types/movementData";
import { getActivityIcon, calculateDuration } from "../../utils/dashboardUtils";
import { movementTypeMap } from "../../types/activity";

interface ActivityLogProps {
  activities: MovementData[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activities }) => {
  // Sortiere die Aktivitäten nach startedAt in absteigender Reihenfolge (neueste zuerst)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  return (
    <Box sx={{ p: 3, borderRadius: 2, backgroundColor: "#fff", boxShadow: 1 }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: "center" }}>
        Dein Aktivitätslog
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
        <List>
          {sortedActivities.length > 0 ? (
            sortedActivities.map((activity) => (
              <ListItem key={activity.idMovementData + activity.startedAt}>
                <ListItemIcon>
                  {getActivityIcon(movementTypeMap[activity.idMovementType])}
                </ListItemIcon>
                <ListItemText
                  primary={movementTypeMap[activity.idMovementType]}
                  secondary={`${new Date(activity.startedAt).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )} - ${calculateDuration(
                    activity.startedAt,
                    activity.endedAt
                  ).toFixed(1)}h`}
                />
              </ListItem>
            ))
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ textAlign: "center" }}
            >
              Keine Aktivitäten für heute verfügbar.
            </Typography>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default ActivityLog;
