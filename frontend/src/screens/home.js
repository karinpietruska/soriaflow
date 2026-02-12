import { getExercises } from "../data/store.js";
import { cycleDurationSec } from "../utils/duration.js";

export function renderHome(
  el,
  selectedExercise = null,
  currentConfig = null,
  message = null
) {
  const ex = selectedExercise || getExercises()[0];
  if (!ex) {
    el.innerHTML = `
      <div class="alert alert-secondary">
        No exercises available yet. Please try again shortly.
      </div>
    `;
    return;
  }
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
  const totalMinutes = Math.floor(totalSec / 60);
  const totalSeconds = totalSec % 60;
  const totalLabel = `${totalMinutes} min ${totalSeconds} s`;
  const messageBlock = message
    ? `
      <div class="alert alert-${message.tone || "secondary"} py-2 mb-3">
        ${message.text}
      </div>
    `
    : "";
  el.innerHTML = `
    ${messageBlock}
    <div class="run-title run-title--transparent">
      <h2 class="h4 mb-0">Run Exercise</h2>
    </div>
    <div class="mb-3">
      <div class="text-exercise-name fs-2 mb-2">${ex.name}</div>
      <div class="text-secondary fs-6">
        Phases: ${config.inhaleSec}-${config.hold1Sec}-${config.exhaleSec}-${config.hold2Sec} · Total: ${totalLabel} · Reps: ${config.repetitions}
      </div>
    </div>

    <div class="text-center run-stack">
      <div class="d-flex justify-content-center my-4 run-hero">
        <div class="rounded-circle breath-circle breath-circle--run breath-circle--start"></div>
      </div>

      <div class="d-flex justify-content-center align-items-center gap-3 flex-wrap mb-4 run-info-row">
        <div class="px-3 run-info-item">
          <div class="text-secondary small fs-6">Phase</div>
          <div class="fs-3">Ready</div>
        </div>
        <div class="px-3 run-info-item">
          <div class="text-secondary small fs-6">Time</div>
          <div class="fs-3">0s</div>
        </div>
        <div class="px-3 run-info-item">
          <div class="text-secondary small fs-6">Repetition</div>
          <div class="fs-3">0 / ${config.repetitions}</div>
        </div>
      </div>

      <div class="d-flex justify-content-center gap-3 flex-wrap run-actions">
        <button class="btn btn-info btn-lg" data-nav="run">Start Exercise</button>
        <button
          class="btn btn-outline-light btn-lg"
          data-nav="exercises"
          data-origin="home"
        >
          ${chooseLabel}
        </button>
      </div>
    </div>
  `;
}