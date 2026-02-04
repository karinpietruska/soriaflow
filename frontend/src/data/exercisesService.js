import { addExercise, getExercises } from "./store.js";

export function createPresetExercise({ name, baseExercise, defaults }) {
  const normalized = name.trim().toLowerCase();
  const existingNames = new Set(
    getExercises().map((ex) => ex.name.trim().toLowerCase())
  );
  if (existingNames.has(normalized)) {
    throw new Error("Preset name must be unique.");
  }

  const exerciseID = crypto?.randomUUID?.() ?? `pre-${Date.now()}`;

  const preset = {
    exerciseID,
    name: name.trim(),
    source: "USER_PRESET",
    defaultRepetitions: defaults.defaultRepetitions,
    defaultInhale: defaults.defaultInhale,
    defaultHold1: defaults.defaultHold1,
    defaultExhale: defaults.defaultExhale,
    defaultHold2: defaults.defaultHold2,
  };

  if (baseExercise?.exerciseID) {
    preset.baseExerciseID = baseExercise.exerciseID;
  }

  addExercise(preset);
  return preset;
}
