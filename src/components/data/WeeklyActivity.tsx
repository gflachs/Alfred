import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MovementData } from "../../types/movementData";
import { getActivityLabel, calculateDuration } from "../../utils/activityUtils";
import { startOfWeek, endOfWeek } from "date-fns";

const prepareWeeklyData = (data: MovementData[], weekStart: Date) => {
  const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const weeklyData: {
    [day: string]: { Liegen: number; Sitzen: number; Aktiv: number };
  } = {};
  weekDays.forEach(
    (day) => (weeklyData[day] = { Liegen: 0, Sitzen: 0, Aktiv: 0 })
  );

  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });

  data.forEach((entry) => {
    const entryStart = new Date(entry.startedAt);
    if (entryStart >= start && entryStart <= end) {
      const dayIndex = (entryStart.getDay() + 6) % 7; // Montag = 0
      const day = weekDays[dayIndex];
      const duration = calculateDuration(entry.startedAt, entry.endedAt);
      weeklyData[day][getActivityLabel(entry.idMovementType)] += duration;
    }
  });

  return weekDays.map((day) => ({ day, ...weeklyData[day] }));
};

interface WeeklyActivityProps {
  data: MovementData[];
  selectedDate: Date;
}

const WeeklyActivity: React.FC<WeeklyActivityProps> = ({
  data,
  selectedDate,
}) => {
  const weeklyData = prepareWeeklyData(data, selectedDate);

  return (
    <ResponsiveContainer width="100%" height={500} minWidth={300}>
      <BarChart data={weeklyData}>
        <XAxis dataKey="day" fontSize={16} />
        <YAxis
          label={{ value: "Stunden", angle: -90, position: "insideLeft" }}
          fontSize={16}
        />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 16 }} />
        <Bar dataKey="Liegen" stackId="a" fill="#1976d2" barSize={40} />
        <Bar dataKey="Sitzen" stackId="a" fill="#4caf50" barSize={40} />
        <Bar dataKey="Aktiv" stackId="a" fill="#ff9800" barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyActivity;
