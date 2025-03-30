import { MovementData } from "../types/movementData";
import { getActivityLabel, calculateDuration } from "./activityUtils";
import { Bed, Chair, DirectionsRun } from "@mui/icons-material";
import React, { ReactNode } from "react";

/**
 * Ermittelt die aktuelle Aktivität basierend auf der aktuellen Zeit.
 * @param {MovementData[]} data - Array von Bewegungsdaten
 * @param {Date} currentTime - Aktuelle Zeit
 * @returns {string} Die aktuelle Aktivität oder "Unbekannt"
 */
export const getCurrentActivity = (data: MovementData[], currentTime: Date) => {
  const currentEntry = data.find(
    (entry) =>
      new Date(entry.startedAt) <= currentTime &&
      new Date(entry.endedAt) >= currentTime
  );
  return currentEntry
    ? getActivityLabel(currentEntry.idMovementType)
    : "Unbekannt";
};

/**
 * Berechnet die tägliche Zusammenfassung der Aktivitäten für ein bestimmtes Datum.
 * @param {MovementData[]} data - Array von Bewegungsdaten
 * @param {Date} selectedDate - Ausgewähltes Datum
 * @returns {{ Liegen: number, Sitzen: number, Aktiv: number }} Zusammenfassung der Stunden pro Aktivität
 */
export const getDailySummary = (data: MovementData[], selectedDate: Date) => {
  const summary = { Liegen: 0, Sitzen: 0, Aktiv: 0 };
  data.forEach((entry) => {
    const start = new Date(entry.startedAt);
    if (start.toDateString() === selectedDate.toDateString()) {
      const duration = calculateDuration(entry.startedAt, entry.endedAt);
      summary[getActivityLabel(entry.idMovementType)] += duration;
    }
  });
  return summary;
};

/**
 * Erstellt eine motivierende Nachricht basierend auf der täglichen Aktivität.
 * @param {{ Liegen: number, Sitzen: number, Aktiv: number }} summary - Tägliche Aktivitätszusammenfassung
 * @returns {string} Motivationsnachricht
 */
export const getMotivationalMessage = (summary: {
  Liegen: number;
  Sitzen: number;
  Aktiv: number;
}) => {
  const activeHours = summary.Aktiv;
  const sittingHours = summary.Sitzen;
  const lyingHours = summary.Liegen;
  const inactivtyHours = sittingHours + lyingHours - 6;
  if (activeHours > 5) {
    return (
      "Super, du warst heute schon " +
      activeHours.toFixed(1) +
      " Stunden aktiv – weiter so!"
    );
  } else if (inactivtyHours / activeHours > 2) {
    return "Du hast heute noch nicht viel gemacht. Wie wäre es mit einem Spaziergang?";
  } else if (activeHours === 0) {
    return "Du warst heute noch nicht aktiv. Bewegung ist wichtig!";
  } else if (activeHours < 3) {
    return (
      "Du hast heute schon " +
      activeHours.toFixed(1) +
      " Stunden aktiv verbracht. Versuche noch etwas mehr zu machen!"
    );
  } else if (sittingHours > activeHours * 1.5) {
    return "Du hast heute viel mehr gesessen als aktiv zu sein. Bewegung ist wichtig! Wie wäre es mit einem Spaziergang?";
  }
  return (
    "Du hast heute schon " +
    activeHours.toFixed(1) +
    " Stunden aktiv verbracht. Weiter so!"
  );
};

/**
 * Gibt ein Icon für die Aktivität zurück.
 * @param {string} type - Aktivitätstyp (Liegen, Sitzen, Aktiv)
 * @returns {ReactNode} Icon-Komponente oder null
 */
export const getActivityIcon = (type: string): ReactNode => {
  switch (type) {
    case "Liegen":
      return React.createElement(Bed, { color: "primary" });
    case "Sitzen":
      return React.createElement(Chair, { color: "primary" });
    case "Aktiv":
      return React.createElement(DirectionsRun, { color: "primary" });
    default:
      return null;
  }
};

/**
 * Berechnet die durchschnittlichen aktiven Stunden über eine bestimmte Anzahl von Tagen.
 * @param {MovementData[]} data - Array von Bewegungsdaten
 * @param {number} days - Anzahl der Tage für den Durchschnitt
 * @returns {string} Durchschnittliche aktive Stunden als String (z. B. "2.5")
 */
export const getAverageActiveHours = (data: MovementData[], days: number) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  let totalActiveHours = 0;
  let daysWithData = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dailySummary = getDailySummary(data, new Date(d));
    if (dailySummary.Aktiv > 0) {
      totalActiveHours += dailySummary.Aktiv;
      daysWithData++;
    }
  }

  return daysWithData > 0
    ? (totalActiveHours / daysWithData).toFixed(1)
    : "0.0";
};

/**
 * Berechnet die wöchentlichen Durchschnittswerte für Aktivitäten.
 * @param {MovementData[]} data - Array von Bewegungsdaten
 * @param {Date} startDate - Startdatum der Woche
 * @param {Date} endDate - Enddatum der Woche
 * @returns {{ Liegen: number, Sitzen: number, Aktiv: number }} Durchschnittswerte pro Aktivität
 */
export const getWeeklyAverages = (
  data: MovementData[],
  startDate: Date,
  endDate: Date
): { Liegen: number; Sitzen: number; Aktiv: number } => {
  const summary = { Liegen: 0, Sitzen: 0, Aktiv: 0 };
  let daysWithData = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dailySummary = getDailySummary(data, new Date(d));
    if (
      dailySummary.Liegen > 0 ||
      dailySummary.Sitzen > 0 ||
      dailySummary.Aktiv > 0
    ) {
      summary.Liegen += dailySummary.Liegen;
      summary.Sitzen += dailySummary.Sitzen;
      summary.Aktiv += dailySummary.Aktiv;
      daysWithData++;
    }
  }

  return {
    Liegen: daysWithData > 0 ? summary.Liegen / daysWithData : 0,
    Sitzen: daysWithData > 0 ? summary.Sitzen / daysWithData : 0,
    Aktiv: daysWithData > 0 ? summary.Aktiv / daysWithData : 0,
  };
};

/**
 * Berechnet den Trend der aktuellen Woche im Vergleich zur Vorwoche.
 * @param {MovementData[]} data - Array von Bewegungsdaten
 * @param {Date} currentWeekStart - Start der aktuellen Woche
 * @param {Date} currentWeekEnd - Ende der aktuellen Woche
 * @param {Date} previousWeekStart - Start der Vorwoche
 * @param {Date} previousWeekEnd - Ende der Vorwoche
 * @returns {{ Liegen: number, Sitzen: number, Aktiv: number }} Differenz der Durchschnittswerte
 */
export const getWeeklyTrend = (
  data: MovementData[],
  currentWeekStart: Date,
  currentWeekEnd: Date,
  previousWeekStart: Date,
  previousWeekEnd: Date
): { Liegen: number; Sitzen: number; Aktiv: number } => {
  const currentAverages = getWeeklyAverages(
    data,
    currentWeekStart,
    currentWeekEnd
  );
  const previousAverages = getWeeklyAverages(
    data,
    previousWeekStart,
    previousWeekEnd
  );

  return {
    Liegen: currentAverages.Liegen - previousAverages.Liegen,
    Sitzen: currentAverages.Sitzen - previousAverages.Sitzen,
    Aktiv: currentAverages.Aktiv - previousAverages.Aktiv,
  };
};

/** Re-Export der calculateDuration-Funktion aus activityUtils */
export { calculateDuration };
