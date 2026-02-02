import { exercises } from "../data/dummy.js";
import { defaultCycleDuration, defaultTotalDuration } from "../ui/duration.js";

export function renderExercises(el) {
  const rows = exercises
    .map((ex) => {
      const badge = ex.source === "DEFAULT" ? "secondary" : "warning";
      return `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <div class="fw-semibold">
              ${ex.name}
              <span class="badge bg-${badge} ms-2">${ex.source}</span>
            </div>
            <small class="text-muted">
              cycle ${defaultCycleDuration(ex)}s · total ${defaultTotalDuration(ex)}s · reps ${ex.defaultRepetitions}
            </small>
          </div>
          <button class="btn btn-sm btn-outline-primary" disabled>Select</button>
        </li>
      `;
    })
    .join("");

  el.innerHTML = `
    <h2 class="h4 mb-3">Exercises</h2>
    <ul class="list-group">${rows}</ul>
    <div class="text-secondary mt-3">
      (Selection + preset creation comes next — dummy UI first.)
    </div>
  `;
}