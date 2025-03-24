export interface MovementData {
  idMovementData: string;
  startedAt: string; // ISO Timestamp
  endedAt: string; // ISO Timestamp
  idMovementType: number; // 1 = Liegen, 2 = Sitzen, 3 = Aktiv
  user_id?: string; // Optional, da RLS das filtert
}

export const mockMovementData: MovementData[] = [
  // 14. März 2025
  // 00:00 - 06:00 (Nacht, hauptsächlich Liegen)
  {
    idMovementData: "1",
    startedAt: "2025-03-14T00:00:00Z",
    endedAt: "2025-03-14T06:00:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Mischung aus Sitzen und Aktiv)
  {
    idMovementData: "2",
    startedAt: "2025-03-14T06:00:00Z",
    endedAt: "2025-03-14T07:00:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "3",
    startedAt: "2025-03-14T07:00:00Z",
    endedAt: "2025-03-14T08:30:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "4",
    startedAt: "2025-03-14T08:30:00Z",
    endedAt: "2025-03-14T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, mehr Aktiv und Sitzen)
  {
    idMovementData: "5",
    startedAt: "2025-03-14T12:00:00Z",
    endedAt: "2025-03-14T14:00:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "6",
    startedAt: "2025-03-14T14:00:00Z",
    endedAt: "2025-03-14T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "7",
    startedAt: "2025-03-14T18:00:00Z",
    endedAt: "2025-03-14T22:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "8",
    startedAt: "2025-03-14T22:00:00Z",
    endedAt: "2025-03-15T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 15. März 2025
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "9",
    startedAt: "2025-03-15T00:00:00Z",
    endedAt: "2025-03-15T07:00:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Sitzen und Aktiv)
  {
    idMovementData: "10",
    startedAt: "2025-03-15T07:00:00Z",
    endedAt: "2025-03-15T08:00:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "11",
    startedAt: "2025-03-15T08:00:00Z",
    endedAt: "2025-03-15T10:00:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "12",
    startedAt: "2025-03-15T10:00:00Z",
    endedAt: "2025-03-15T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, Aktiv und Sitzen)
  {
    idMovementData: "13",
    startedAt: "2025-03-15T12:00:00Z",
    endedAt: "2025-03-15T15:00:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "14",
    startedAt: "2025-03-15T15:00:00Z",
    endedAt: "2025-03-15T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "15",
    startedAt: "2025-03-15T18:00:00Z",
    endedAt: "2025-03-15T21:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "16",
    startedAt: "2025-03-15T21:00:00Z",
    endedAt: "2025-03-16T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 16. März 2025
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "17",
    startedAt: "2025-03-16T00:00:00Z",
    endedAt: "2025-03-16T06:30:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Sitzen und Aktiv)
  {
    idMovementData: "18",
    startedAt: "2025-03-16T06:30:00Z",
    endedAt: "2025-03-16T07:30:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "19",
    startedAt: "2025-03-16T07:30:00Z",
    endedAt: "2025-03-16T09:00:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "20",
    startedAt: "2025-03-16T09:00:00Z",
    endedAt: "2025-03-16T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, Aktiv und Sitzen)
  {
    idMovementData: "21",
    startedAt: "2025-03-16T12:00:00Z",
    endedAt: "2025-03-16T13:30:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "22",
    startedAt: "2025-03-16T13:30:00Z",
    endedAt: "2025-03-16T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "23",
    startedAt: "2025-03-16T18:00:00Z",
    endedAt: "2025-03-16T22:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "24",
    startedAt: "2025-03-16T22:00:00Z",
    endedAt: "2025-03-17T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 17. März 2025
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "25",
    startedAt: "2025-03-17T00:00:00Z",
    endedAt: "2025-03-17T06:00:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Sitzen und Aktiv)
  {
    idMovementData: "26",
    startedAt: "2025-03-17T06:00:00Z",
    endedAt: "2025-03-17T07:00:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "27",
    startedAt: "2025-03-17T07:00:00Z",
    endedAt: "2025-03-17T08:30:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "28",
    startedAt: "2025-03-17T08:30:00Z",
    endedAt: "2025-03-17T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, Aktiv und Sitzen)
  {
    idMovementData: "29",
    startedAt: "2025-03-17T12:00:00Z",
    endedAt: "2025-03-17T14:00:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "30",
    startedAt: "2025-03-17T14:00:00Z",
    endedAt: "2025-03-17T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "31",
    startedAt: "2025-03-17T18:00:00Z",
    endedAt: "2025-03-17T21:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "32",
    startedAt: "2025-03-17T21:00:00Z",
    endedAt: "2025-03-18T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 18. März 2025
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "33",
    startedAt: "2025-03-18T00:00:00Z",
    endedAt: "2025-03-18T06:30:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Sitzen und Aktiv)
  {
    idMovementData: "34",
    startedAt: "2025-03-18T06:30:00Z",
    endedAt: "2025-03-18T07:30:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "35",
    startedAt: "2025-03-18T07:30:00Z",
    endedAt: "2025-03-18T09:00:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "36",
    startedAt: "2025-03-18T09:00:00Z",
    endedAt: "2025-03-18T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, Aktiv und Sitzen)
  {
    idMovementData: "37",
    startedAt: "2025-03-18T12:00:00Z",
    endedAt: "2025-03-18T13:30:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "38",
    startedAt: "2025-03-18T13:30:00Z",
    endedAt: "2025-03-18T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "39",
    startedAt: "2025-03-18T18:00:00Z",
    endedAt: "2025-03-18T22:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "40",
    startedAt: "2025-03-18T22:00:00Z",
    endedAt: "2025-03-19T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 19. März 2025
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "41",
    startedAt: "2025-03-19T00:00:00Z",
    endedAt: "2025-03-19T06:00:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Sitzen und Aktiv)
  {
    idMovementData: "42",
    startedAt: "2025-03-19T06:00:00Z",
    endedAt: "2025-03-19T07:00:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "43",
    startedAt: "2025-03-19T07:00:00Z",
    endedAt: "2025-03-19T08:30:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "44",
    startedAt: "2025-03-19T08:30:00Z",
    endedAt: "2025-03-19T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, Aktiv und Sitzen)
  {
    idMovementData: "45",
    startedAt: "2025-03-19T12:00:00Z",
    endedAt: "2025-03-19T14:00:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "46",
    startedAt: "2025-03-19T14:00:00Z",
    endedAt: "2025-03-19T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "47",
    startedAt: "2025-03-19T18:00:00Z",
    endedAt: "2025-03-19T21:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "48",
    startedAt: "2025-03-19T21:00:00Z",
    endedAt: "2025-03-20T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 20. März 2025
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "49",
    startedAt: "2025-03-20T00:00:00Z",
    endedAt: "2025-03-20T06:30:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Sitzen und Aktiv)
  {
    idMovementData: "50",
    startedAt: "2025-03-20T06:30:00Z",
    endedAt: "2025-03-20T07:30:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "51",
    startedAt: "2025-03-20T07:30:00Z",
    endedAt: "2025-03-20T09:00:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "52",
    startedAt: "2025-03-20T09:00:00Z",
    endedAt: "2025-03-20T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, Aktiv und Sitzen)
  {
    idMovementData: "53",
    startedAt: "2025-03-20T12:00:00Z",
    endedAt: "2025-03-20T13:30:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "54",
    startedAt: "2025-03-20T13:30:00Z",
    endedAt: "2025-03-20T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "55",
    startedAt: "2025-03-20T18:00:00Z",
    endedAt: "2025-03-20T22:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "56",
    startedAt: "2025-03-20T22:00:00Z",
    endedAt: "2025-03-21T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 21. März 2025 (bestehende Daten)
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "57",
    startedAt: "2025-03-21T00:00:00Z",
    endedAt: "2025-03-21T06:00:00Z",
    idMovementType: 1, // Liegen
  },
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
  // 12:00 - 22:00
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
  // 22:00 - 00:00 (Abend, Liegen)
  {
    idMovementData: "58",
    startedAt: "2025-03-21T22:00:00Z",
    endedAt: "2025-03-22T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 22. März 2025
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "59",
    startedAt: "2025-03-22T00:00:00Z",
    endedAt: "2025-03-22T06:00:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Sitzen und Aktiv)
  {
    idMovementData: "60",
    startedAt: "2025-03-22T06:00:00Z",
    endedAt: "2025-03-22T07:00:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "61",
    startedAt: "2025-03-22T07:00:00Z",
    endedAt: "2025-03-22T08:30:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "62",
    startedAt: "2025-03-22T08:30:00Z",
    endedAt: "2025-03-22T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, Aktiv und Sitzen)
  {
    idMovementData: "63",
    startedAt: "2025-03-22T12:00:00Z",
    endedAt: "2025-03-22T14:00:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "64",
    startedAt: "2025-03-22T14:00:00Z",
    endedAt: "2025-03-22T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "65",
    startedAt: "2025-03-22T18:00:00Z",
    endedAt: "2025-03-22T21:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "66",
    startedAt: "2025-03-22T21:00:00Z",
    endedAt: "2025-03-23T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 23. März 2025
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "67",
    startedAt: "2025-03-23T00:00:00Z",
    endedAt: "2025-03-23T06:30:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Sitzen und Aktiv)
  {
    idMovementData: "68",
    startedAt: "2025-03-23T06:30:00Z",
    endedAt: "2025-03-23T07:30:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "69",
    startedAt: "2025-03-23T07:30:00Z",
    endedAt: "2025-03-23T09:00:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "70",
    startedAt: "2025-03-23T09:00:00Z",
    endedAt: "2025-03-23T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, Aktiv und Sitzen)
  {
    idMovementData: "71",
    startedAt: "2025-03-23T12:00:00Z",
    endedAt: "2025-03-23T13:30:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "72",
    startedAt: "2025-03-23T13:30:00Z",
    endedAt: "2025-03-23T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "73",
    startedAt: "2025-03-23T18:00:00Z",
    endedAt: "2025-03-23T22:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "74",
    startedAt: "2025-03-23T22:00:00Z",
    endedAt: "2025-03-24T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 24. März 2025
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "75",
    startedAt: "2025-03-24T00:00:00Z",
    endedAt: "2025-03-24T06:00:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Sitzen und Aktiv)
  {
    idMovementData: "76",
    startedAt: "2025-03-24T06:00:00Z",
    endedAt: "2025-03-24T07:00:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "77",
    startedAt: "2025-03-24T07:00:00Z",
    endedAt: "2025-03-24T08:30:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "78",
    startedAt: "2025-03-24T08:30:00Z",
    endedAt: "2025-03-24T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, Aktiv und Sitzen)
  {
    idMovementData: "79",
    startedAt: "2025-03-24T12:00:00Z",
    endedAt: "2025-03-24T14:00:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "80",
    startedAt: "2025-03-24T14:00:00Z",
    endedAt: "2025-03-24T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "81",
    startedAt: "2025-03-24T18:00:00Z",
    endedAt: "2025-03-24T21:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "82",
    startedAt: "2025-03-24T21:00:00Z",
    endedAt: "2025-03-25T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 25. März 2025
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "83",
    startedAt: "2025-03-25T00:00:00Z",
    endedAt: "2025-03-25T06:30:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Sitzen und Aktiv)
  {
    idMovementData: "84",
    startedAt: "2025-03-25T06:30:00Z",
    endedAt: "2025-03-25T07:30:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "85",
    startedAt: "2025-03-25T07:30:00Z",
    endedAt: "2025-03-25T09:00:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "86",
    startedAt: "2025-03-25T09:00:00Z",
    endedAt: "2025-03-25T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, Aktiv und Sitzen)
  {
    idMovementData: "87",
    startedAt: "2025-03-25T12:00:00Z",
    endedAt: "2025-03-25T13:30:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "88",
    startedAt: "2025-03-25T13:30:00Z",
    endedAt: "2025-03-25T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "89",
    startedAt: "2025-03-25T18:00:00Z",
    endedAt: "2025-03-25T22:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "90",
    startedAt: "2025-03-25T22:00:00Z",
    endedAt: "2025-03-26T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 26. März 2025
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "91",
    startedAt: "2025-03-26T00:00:00Z",
    endedAt: "2025-03-26T06:00:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Sitzen und Aktiv)
  {
    idMovementData: "92",
    startedAt: "2025-03-26T06:00:00Z",
    endedAt: "2025-03-26T07:00:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "93",
    startedAt: "2025-03-26T07:00:00Z",
    endedAt: "2025-03-26T08:30:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "94",
    startedAt: "2025-03-26T08:30:00Z",
    endedAt: "2025-03-26T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, Aktiv und Sitzen)
  {
    idMovementData: "95",
    startedAt: "2025-03-26T12:00:00Z",
    endedAt: "2025-03-26T14:00:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "96",
    startedAt: "2025-03-26T14:00:00Z",
    endedAt: "2025-03-26T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "97",
    startedAt: "2025-03-26T18:00:00Z",
    endedAt: "2025-03-26T21:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "98",
    startedAt: "2025-03-26T21:00:00Z",
    endedAt: "2025-03-27T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },

  // 27. März 2025
  // 00:00 - 06:00 (Nacht, Liegen)
  {
    idMovementData: "99",
    startedAt: "2025-03-27T00:00:00Z",
    endedAt: "2025-03-27T06:30:00Z",
    idMovementType: 1, // Liegen
  },
  // 06:00 - 12:00 (Morgen, Sitzen und Aktiv)
  {
    idMovementData: "100",
    startedAt: "2025-03-27T06:30:00Z",
    endedAt: "2025-03-27T07:30:00Z",
    idMovementType: 2, // Sitzen (Frühstück)
  },
  {
    idMovementData: "101",
    startedAt: "2025-03-27T07:30:00Z",
    endedAt: "2025-03-27T09:00:00Z",
    idMovementType: 3, // Aktiv (Spaziergang)
  },
  {
    idMovementData: "102",
    startedAt: "2025-03-27T09:00:00Z",
    endedAt: "2025-03-27T12:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 12:00 - 18:00 (Nachmittag, Aktiv und Sitzen)
  {
    idMovementData: "103",
    startedAt: "2025-03-27T12:00:00Z",
    endedAt: "2025-03-27T13:30:00Z",
    idMovementType: 3, // Aktiv (Bewegung)
  },
  {
    idMovementData: "104",
    startedAt: "2025-03-27T13:30:00Z",
    endedAt: "2025-03-27T18:00:00Z",
    idMovementType: 2, // Sitzen (Ruhe)
  },
  // 18:00 - 00:00 (Abend, Sitzen und Liegen)
  {
    idMovementData: "105",
    startedAt: "2025-03-27T18:00:00Z",
    endedAt: "2025-03-27T22:00:00Z",
    idMovementType: 2, // Sitzen (Fernsehen)
  },
  {
    idMovementData: "106",
    startedAt: "2025-03-27T22:00:00Z",
    endedAt: "2025-03-28T00:00:00Z",
    idMovementType: 1, // Liegen (Schlaf)
  },
];
