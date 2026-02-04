export function renderRun(el, runState) {
  const exName = runState?.exerciseName || "Exercise";
  const phaseLabel = runState?.phaseLabel || "Ready";
  const secondsRemaining = runState?.secondsRemaining ?? 0;
  const repetitionLabel = runState?.repetitionLabel || "0 / 0";
  el.innerHTML = `
    <h2 class="h4 mb-3">Run Exercise</h2>
    <div class="text-light-emphasis fs-4 mb-3">
      ${exName}
    </div>
    <div class="d-flex justify-content-center my-4">
      <div id="breath-circle" class="rounded-circle breath-circle breath-circle--run"></div>
    </div>
    <div class="text-center">
      <div class="d-flex justify-content-center align-items-center gap-3 flex-wrap mb-4">
        <div class="px-3">
          <div class="text-secondary small fs-6">Phase</div>
          <div class="fs-3">${phaseLabel}</div>
        </div>
        <div class="px-3">
          <div class="text-secondary small fs-6">Time</div>
          <div class="fs-3">${secondsRemaining}s</div>
        </div>
        <div class="px-3">
          <div class="text-secondary small fs-6">Repetition</div>
          <div class="fs-3">${repetitionLabel}</div>
        </div>
      </div>

      <div class="d-flex justify-content-center gap-2">
        <button class="btn btn-danger" data-end-exercise>End Exercise</button>
      </div>

      <p class="text-secondary mt-4 mb-0">
        GSAP animation will be attached to #breath-circle when we implement it.
      </p>
    </div>
  `;
}