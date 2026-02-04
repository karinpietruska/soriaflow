import {
  exercises as initialExercises,
  sessions as initialSessions,
  moodEntries as initialMoodEntries,
} from "./dummy.js";

let exercises = [...initialExercises];
let sessions = [...initialSessions];
let moodEntries = [...initialMoodEntries];

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

export function getMoodEntries() {
  return moodEntries;
}

export function addMoodEntry(newEntry) {
  moodEntries = [newEntry, ...moodEntries];
}
