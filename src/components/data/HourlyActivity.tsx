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

const prepareHourlyData = (data: MovementData[], selectedDate: Date) => {
  const hourlyData: {
    [hour: string]: { Liegen: number; Sitzen: number; Aktiv: number };
  } = {};
  for (let h = 0; h < 24; h++)
    hourlyData[`${h}:00`] = { Liegen: 0, Sitzen: 0, Aktiv: 0 };

  data.forEach((entry) => {
    const start = new Date(entry.startedAt);
    const end = new Date(entry.endedAt);
    if (start.toDateString() !== selectedDate.toDateString()) return;

    const startHour = start.getHours();
    const endHour = end.getHours();
    const duration = calculateDuration(entry.startedAt, entry.endedAt);
    const type = getActivityLabel(entry.idMovementType);

    if (startHour === endHour) {
      hourlyData[`${startHour}:00`][type] += duration;
    } else {
      const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      let remainingMinutes = totalMinutes;
      for (let h = startHour; h <= endHour; h++) {
        const hourStart = new Date(start);
        hourStart.setHours(h, 0, 0, 0);
        const hourEnd = new Date(start);
        hourEnd.setHours(h + 1, 0, 0, 0);
        if (hourEnd > end) hourEnd.setTime(end.getTime());

        const segmentMinutes =
          (hourEnd.getTime() - hourStart.getTime()) / (1000 * 60);
        const segmentDuration = Math.min(
          segmentMinutes / 60,
          remainingMinutes / 60
        );
        hourlyData[`${h}:00`][type] += segmentDuration;
        remainingMinutes -= segmentMinutes;
        if (remainingMinutes <= 0) break;
      }
    }
  });

  return Object.entries(hourlyData).map(([hour, values]) => ({
    hour,
    ...values,
  }));
};

interface HourlyActivityProps {
  data: MovementData[];
  selectedDate: Date;
}

const HourlyActivity: React.FC<HourlyActivityProps> = ({
  data,
  selectedDate,
}) => {
  const hourlyData = prepareHourlyData(data, selectedDate);

  return (
    <ResponsiveContainer width="100%" height={500} minWidth={300}>
      <BarChart data={hourlyData}>
        <XAxis
          dataKey="hour"
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={16}
        />
        <YAxis
          label={{ value: "Stunden", angle: -90, position: "insideLeft" }}
          fontSize={16}
        />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 16 }} />
        <Bar dataKey="Liegen" stackId="a" fill="#1976d2" barSize={20} />
        <Bar dataKey="Sitzen" stackId="a" fill="#4caf50" barSize={20} />
        <Bar dataKey="Aktiv" stackId="a" fill="#ff9800" barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HourlyActivity;
