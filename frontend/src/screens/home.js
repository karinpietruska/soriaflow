import { exercises } from "../data/dummy.js";
import { cycleDurationSec } from "../utils/duration.js";

export function renderHome(el, selectedExercise = null, currentConfig = null) {
  const ex = selectedExercise || exercises[0];
  const config =
    currentConfig || {
      inhaleSec: ex.defaultInhale,
      hold1Sec: ex.defaultHold1,
      exhaleSec: ex.defaultExhale,
      hold2Sec: ex.defaultHold2,
      repetitions: ex.defaultRepetitions,
    };
  const chooseLabel = "Change Exercise";
  const cycleSec = cycleDurationSec(config);
  const totalSec = cycleSec * Number(config.repetitions);
  const totalMin = Math.max(1, Math.round(totalSec / 60));
  el.innerHTML = `
    <div class="text-center mb-4">
      <h1 class="display-6 mb-2">${ex.name}</h1>
      <div class="text-secondary">
        Cycle: ${cycleSec}s · Total: ${totalMin} min · Reps: ${config.repetitions}
      </div>
    </div>

    <div class="d-flex justify-content-center my-5">
      <div class="rounded-circle" style="width:160px;height:160px;background:#5bc0de;box-shadow:0 0 0 10px rgba(91,192,222,.25)"></div>
    </div>

    <div class="d-flex justify-content-center gap-3 flex-wrap">
      <button class="btn btn-info btn-lg" data-nav="run">Start Exercise</button>
      <button class="btn btn-outline-light btn-lg" data-nav="exercises">${chooseLabel}</button>
    </div>
  `;
}