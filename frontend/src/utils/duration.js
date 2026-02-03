export function cycleDurationSec({ inhaleSec, hold1Sec, exhaleSec, hold2Sec }) {
  return Number(inhaleSec) + Number(hold1Sec) + Number(exhaleSec) + Number(hold2Sec);
}

export function totalDurationSec(session) {
  return cycleDurationSec(session) * Number(session.repetitionsCompleted ?? 0);
}

export function defaultCycleDuration(ex) {
  return Number(ex.defaultInhale) + Number(ex.defaultHold1) + Number(ex.defaultExhale) + Number(ex.defaultHold2);
}

export function defaultTotalDuration(ex) {
  return defaultCycleDuration(ex) * Number(ex.defaultRepetitions);
}