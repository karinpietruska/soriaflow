import { exercises as initialExercises, sessions as initialSessions } from "./dummy.js";

let exercises = [...initialExercises];
let sessions = [...initialSessions];

export function getExercises() {
  return exercises;
}

export function addExercise(newExercise) {
  exercises = [newExercise, ...exercises];
}

export function getSessions() {
  return sessions;
}

export function addSession(newSession) {
  sessions = [newSession, ...sessions];
}
