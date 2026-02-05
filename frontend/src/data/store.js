import { fetchExercises } from "../api/exercises.js";
import { fetchSessions } from "../api/sessions.js";
import { fetchMoods } from "../api/moods.js";

let exercises = [];
let sessions = [];
let moodEntries = [];

export function getExercises() {
  return exercises;
}

export function setExercises(nextExercises) {
  exercises = Array.isArray(nextExercises) ? [...nextExercises] : [];
}

export async function loadExercises() {
  const data = await fetchExercises();
  setExercises(data);
  return exercises;
}

export function addExercise(newExercise) {
  exercises = [newExercise, ...exercises];
}

export function getSessions() {
  return sessions;
}

export function setSessions(nextSessions) {
  sessions = Array.isArray(nextSessions) ? [...nextSessions] : [];
}

export async function loadSessions() {
  const data = await fetchSessions();
  setSessions(data);
  return sessions;
}

export function addSession(newSession) {
  sessions = [newSession, ...sessions];
}

export function getMoodEntries() {
  return moodEntries;
}

export function setMoodEntries(nextEntries) {
  moodEntries = Array.isArray(nextEntries) ? [...nextEntries] : [];
}

export async function loadMoods() {
  const data = await fetchMoods();
  setMoodEntries(data);
  return moodEntries;
}

export function addMoodEntry(newEntry) {
  moodEntries = [newEntry, ...moodEntries];
}
