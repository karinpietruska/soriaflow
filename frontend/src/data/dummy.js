export const exercises = [
  {
    exerciseID: "box",
    name: "Box Breathing",
    source: "DEFAULT",
    defaultRepetitions: 4,
    defaultInhale: 4,
    defaultHold1: 4,
    defaultExhale: 4,
    defaultHold2: 4,
  },
  {
    exerciseID: "box-3sec",
    name: "Box Breathing (3s)",
    source: "USER_PRESET",
    defaultRepetitions: 4,
    defaultInhale: 3,
    defaultHold1: 3,
    defaultExhale: 3,
    defaultHold2: 3,
  },
];

export const sessions = [
  {
    sessionID: "s-001",
    exerciseID: "box",
    startedAt: "2026-02-02T07:30:00Z",
    endedAt: "2026-02-02T07:32:00Z",
    wasAborted: false,
    repetitionsPlanned: 4,
    repetitionsCompleted: 4,
    inhaleSec: 4,
    hold1Sec: 4,
    exhaleSec: 4,
    hold2Sec: 4,
  },
];

export const moodEntries = [
  { entryID: "m-001", timeStamp: "2026-02-02T07:33:00Z", color: "#2ecc71" },
];