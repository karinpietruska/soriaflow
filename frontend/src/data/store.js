import { exercises as initialExercises } from "./dummy.js";

let exercises = [...initialExercises];

export function getExercises() {
  return exercises;
}

export function addExercise(newExercise) {
  exercises = [newExercise, ...exercises];
}
