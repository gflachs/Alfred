import { MovementData } from "../types/movementData";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export const getActivityLabel = (type: number) => {
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

export const calculateDuration = (start: string, end: string) => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diffMs = endTime.getTime() - startTime.getTime();
  return diffMs / (1000 * 60 * 60); // Stunden
};

export const hasDataForDate = (
  data: MovementData[],
  date: Date,
  view: string
) => {
  return data.some((entry) => {
    const start = new Date(entry.startedAt);
    if (view === "hourly") return start.toDateString() === date.toDateString();
    if (view === "weekly") {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      return start >= weekStart && start <= weekEnd;
    }
    if (view === "monthly") {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      return start >= monthStart && start <= monthEnd;
    }
    return false;
  });
};
