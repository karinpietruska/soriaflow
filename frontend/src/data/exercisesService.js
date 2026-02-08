import { createExercise } from "../api/exercises.js";
import { getExercises, loadExercises } from "./store.js";

export async function createPresetExercise({ name, baseExercise, defaults }) {
  const normalized = name.trim().toLowerCase();
  const existingNames = new Set(
    getExercises().map((ex) => ex.name.trim().toLowerCase())
  );
  if (existingNames.has(normalized)) {
    throw new Error("Preset name must be unique.");
  }

  const payload = {
    name: name.trim(),
    description: baseExercise?.description || null,
    source: "USER_PRESET",
    defaultRepetitions: defaults.defaultRepetitions,
    defaultInhale: defaults.defaultInhale,
    defaultHold1: defaults.defaultHold1,
    defaultExhale: defaults.defaultExhale,
    defaultHold2: defaults.defaultHold2,
  };

  const preset = await createExercise(payload);
  await loadExercises();
  return preset;
}
