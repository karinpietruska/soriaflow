import { exercises } from "../data/dummy.js";
import { defaultCycleDuration, defaultTotalDuration } from "../ui/duration.js";

export function renderHome(el) {
  const ex = exercises[0];
  el.innerHTML = `
    <div class="text-center mb-4">
      <h1 class="display-6 mb-2">${ex.name}</h1>
      <div class="text-secondary">
        Default cycle: ${defaultCycleDuration(ex)}s · Total: ${defaultTotalDuration(ex)}s · Reps: ${ex.defaultRepetitions}
      </div>
    </div>

    <div class="d-flex justify-content-center my-5">
      <div class="rounded-circle" style="width:160px;height:160px;background:#5bc0de;box-shadow:0 0 0 10px rgba(91,192,222,.25)"></div>
    </div>

    <div class="d-flex justify-content-center gap-3">
      <button class="btn btn-info btn-lg" data-nav="run">Start Exercise</button>
      <button class="btn btn-outline-light btn-lg" data-nav="exercises">Choose Exercise</button>
    </div>
  `;
}