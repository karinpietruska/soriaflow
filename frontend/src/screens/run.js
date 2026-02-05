export function renderRun(el, runState) {
  const exName = runState?.exerciseName || "Exercise";
  const phaseLabel = runState?.phaseLabel || "Ready";
  const secondsRemaining = runState?.secondsRemaining ?? 0;
  const repetitionLabel = runState?.repetitionLabel || "0 / 0";
  const metaLabel = runState?.metaLabel || "";
  el.innerHTML = `
    <div class="run-title">
      <h2 class="h4 mb-0">Run Exercise</h2>
    </div>
    <div class="mb-3">
      <div class="text-exercise-name fs-2" data-run-name>
        ${exName}
      </div>
      <div class="text-secondary fs-6" data-run-meta>${metaLabel}</div>
    </div>
    <div class="text-center run-stack">
      <div class="d-flex justify-content-center my-4 run-hero">
        <div id="breath-circle" class="rounded-circle breath-circle breath-circle--run">
          <svg class="breath-ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle
              class="breath-ring__circle"
              cx="50"
              cy="50"
              r="50"
              data-breath-ring
            ></circle>
          </svg>
        </div>
      </div>
      <div class="d-flex justify-content-center align-items-center gap-3 flex-wrap mb-4 run-info-row">
        <div class="px-3 run-info-item">
          <div class="text-secondary small fs-6">Phase</div>
          <div class="fs-3" data-run-phase>${phaseLabel}</div>
        </div>
        <div class="px-3 run-info-item">
          <div class="text-secondary small fs-6">Time</div>
          <div class="fs-3" data-run-time>${secondsRemaining}s</div>
        </div>
        <div class="px-3 run-info-item">
          <div class="text-secondary small fs-6">Repetition</div>
          <div class="fs-3" data-run-rep>${repetitionLabel}</div>
        </div>
      </div>

      <div class="d-flex justify-content-center gap-2 run-actions">
        <button class="btn btn-danger" data-end-exercise>End Exercise</button>
      </div>

    </div>
  `;
}