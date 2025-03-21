export interface MovementData {
  idMovementData: string;
  startedAt: string; // ISO Timestamp
  endedAt: string; // ISO Timestamp
  idMovementType: number; // 1 = Liegen, 2 = Sitzen, 3 = Aktiv
  user_id?: string; // Optional, da RLS das filtert
}

export const mockMovementData: MovementData[] = [
  // 06:00 - 08:00
  {
    idMovementData: "1",
    startedAt: "2025-03-21T06:00:00Z",
    endedAt: "2025-03-21T06:30:00Z",
    idMovementType: 1,
  },
  {
    idMovementData: "2",
    startedAt: "2025-03-21T06:30:00Z",
    endedAt: "2025-03-21T07:00:00Z",
    idMovementType: 2,
  },
  {
    idMovementData: "3",
    startedAt: "2025-03-21T07:00:00Z",
    endedAt: "2025-03-21T08:00:00Z",
    idMovementType: 1,
  },
  // 08:00 - 10:00
  {
    idMovementData: "4",
    startedAt: "2025-03-21T08:00:00Z",
    endedAt: "2025-03-21T08:15:00Z",
    idMovementType: 2,
  },
  {
    idMovementData: "5",
    startedAt: "2025-03-21T08:15:00Z",
    endedAt: "2025-03-21T09:00:00Z",
    idMovementType: 3,
  },
  {
    idMovementData: "6",
    startedAt: "2025-03-21T09:00:00Z",
    endedAt: "2025-03-21T10:00:00Z",
    idMovementType: 2,
  },
  // 10:00 - 12:00
  {
    idMovementData: "7",
    startedAt: "2025-03-21T10:00:00Z",
    endedAt: "2025-03-21T11:00:00Z",
    idMovementType: 3,
  },
  {
    idMovementData: "8",
    startedAt: "2025-03-21T11:00:00Z",
    endedAt: "2025-03-21T11:30:00Z",
    idMovementType: 2,
  },
  {
    idMovementData: "9",
    startedAt: "2025-03-21T11:30:00Z",
    endedAt: "2025-03-21T12:00:00Z",
    idMovementType: 3,
  },
  // Weitere Stunden bis 22:00 mit Mischung
  {
    idMovementData: "10",
    startedAt: "2025-03-21T12:00:00Z",
    endedAt: "2025-03-21T14:00:00Z",
    idMovementType: 2,
  },
  {
    idMovementData: "11",
    startedAt: "2025-03-21T14:00:00Z",
    endedAt: "2025-03-21T16:00:00Z",
    idMovementType: 3,
  },
  {
    idMovementData: "12",
    startedAt: "2025-03-21T16:00:00Z",
    endedAt: "2025-03-21T18:00:00Z",
    idMovementType: 1,
  },
  {
    idMovementData: "13",
    startedAt: "2025-03-21T18:00:00Z",
    endedAt: "2025-03-21T22:00:00Z",
    idMovementType: 1,
  },
];
