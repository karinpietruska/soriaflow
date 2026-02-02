import { sessions, exercises } from "../data/dummy.js";
import { cycleDurationSec, totalDurationSec } from "../ui/duration.js";

export function renderHistory(el) {
  const exNameById = Object.fromEntries(exercises.map((e) => [e.exerciseID, e.name]));

  const rows = sessions
    .map((s) => {
      const cycle = cycleDurationSec(s);
      const total = totalDurationSec(s);
      return `
        <tr>
          <td>${exNameById[s.exerciseID] ?? s.exerciseID}</td>
          <td>${s.repetitionsCompleted}/${s.repetitionsPlanned}</td>
          <td>${cycle}s</td>
          <td>${total}s</td>
          <td>${s.wasAborted ? "Yes" : "No"}</td>
        </tr>
      `;
    })
    .join("");

  el.innerHTML = `
    <h2 class="h4 mb-3">History</h2>
    <div class="table-responsive">
      <table class="table table-dark table-striped align-middle">
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Completed/Planned</th>
            <th>Cycle</th>
            <th>Total</th>
            <th>Aborted</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}