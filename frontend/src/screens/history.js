import { getExercises, getMoodEntries, getSessions } from "../data/store.js";
import { cycleDurationSec, totalDurationSec } from "../utils/duration.js";

export function renderHistory(
  el,
  {
    selectedSessionId = null,
    presetName = "",
    presetError = "",
    presetSaved = false,
    statusFilter = "all",
    sortOrder = "desc",
  } = {}
) {
  const exercises = getExercises();
  const sessions = getSessions();
  const exNameById = Object.fromEntries(
    exercises.map((e) => [e.exerciseID, e.name])
  );
  const selectedSession = sessions.find((s) => s.sessionID === selectedSessionId);

  const filteredSessions = sessions
    .filter((s) => {
      if (statusFilter === "completed") return !s.wasAborted;
      if (statusFilter === "aborted") return s.wasAborted;
      return true;
    })
    .sort((a, b) => {
      const aTime = new Date(a.startedAt).getTime();
      const bTime = new Date(b.startedAt).getTime();
      return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    });

  const historyItems = filteredSessions
    .map((s) => {
      const phases = `${s.inhaleSec}-${s.hold1Sec}-${s.exhaleSec}-${s.hold2Sec}`;
      const date = new Date(s.startedAt);
      const dateLabel = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const timeLabel = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `
        <button
          type="button"
          class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          data-history-session-id="${s.sessionID}"
        >
          <div>
            <div class="fw-semibold">${exNameById[s.exerciseID] ?? s.exerciseID}</div>
            <small class="text-muted">
              ${phases}s · ${s.repetitionsCompleted} reps · ${dateLabel} · ${timeLabel}
            </small>
          </div>
        </button>
      `;
    })
    .join("");

  const moodItems = getMoodEntries()
    .map((s) => {
      const date = new Date(s.timeStamp);
      const dateLabel = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const timeLabel = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `
        <div class="list-group-item d-flex align-items-center gap-2">
          <span
            class="d-inline-block rounded-circle"
            style="width:12px;height:12px;background:${s.color};"
            aria-hidden="true"
          ></span>
          <small class="text-muted">${dateLabel} · ${timeLabel}</small>
        </div>
      `;
    })
    .join("");

  let modalMarkup = "";
  if (selectedSession) {
    const cycle = cycleDurationSec(selectedSession);
    const total = totalDurationSec(selectedSession);
    const date = new Date(selectedSession.startedAt);
    const dateLabel = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeLabel = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const totalMin = Math.floor(total / 60);
    const totalSec = total % 60;
    const totalLabel =
      totalMin > 0
        ? `${totalMin} min ${String(totalSec).padStart(2, "0")} s`
        : `${totalSec} s`;
    modalMarkup = `
      <div class="modal-backdrop fade show"></div>
      <div class="modal d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content bg-dark text-light border border-secondary">
            <div class="modal-header">
              <h5 class="modal-title">Session details</h5>
              <button type="button" class="btn-close btn-close-white" aria-label="Close" data-history-close></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <div class="fw-semibold">${exNameById[selectedSession.exerciseID] ?? selectedSession.exerciseID}</div>
                <small class="text-muted">${dateLabel} · ${timeLabel}</small>
              </div>
              <div class="mb-3 history-kv">
                <div class="history-kv__row">
                  <span class="history-kv__label">Repetitions</span>
                  <span class="history-kv__value">${selectedSession.repetitionsPlanned}</span>
                </div>
                <div class="history-kv__row">
                  <span class="history-kv__label">Inhale</span>
                  <span class="history-kv__value">${selectedSession.inhaleSec} s</span>
                </div>
                <div class="history-kv__row">
                  <span class="history-kv__label">Hold after inhale</span>
                  <span class="history-kv__value">${selectedSession.hold1Sec} s</span>
                </div>
                <div class="history-kv__row">
                  <span class="history-kv__label">Exhale</span>
                  <span class="history-kv__value">${selectedSession.exhaleSec} s</span>
                </div>
                <div class="history-kv__row">
                  <span class="history-kv__label">Hold after exhale</span>
                  <span class="history-kv__value">${selectedSession.hold2Sec} s</span>
                </div>
                <div class="history-kv__row">
                  <span class="history-kv__label">Total duration</span>
                  <span class="history-kv__value">${totalLabel}</span>
                </div>
              </div>
              <div class="mb-3">
                <div class="text-uppercase text-muted small mb-2">Phase seconds</div>
                <div class="text-muted small">
                  Inhale: ${selectedSession.inhaleSec}s · Hold: ${selectedSession.hold1Sec}s · Exhale: ${selectedSession.exhaleSec}s · Hold: ${selectedSession.hold2Sec}s
                </div>
              </div>
              ${
                presetSaved
                  ? `
                    <div class="alert alert-success py-2">Preset saved.</div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-primary" data-history-start>Start now</button>
                      <button class="btn btn-outline-light" data-history-back>Close</button>
                    </div>
                  `
                  : `
                    <div class="mb-3">
                      <label class="form-label">Preset name</label>
                      <input
                        type="text"
                        class="form-control"
                        value="${presetName}"
                        data-history-preset-name
                      />
                      ${presetError ? `<div class="text-danger small mt-2">${presetError}</div>` : ""}
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-primary" data-history-save>Save as preset</button>
                      <button class="btn btn-outline-light" data-history-back>Close</button>
                    </div>
                  `
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  el.innerHTML = `
    <h2 class="h4 mb-3">History</h2>
    <div class="row g-4">
      <div class="col-12 col-lg-7">
        <h3 class="h5 mb-3">Exercise History</h3>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <select class="form-select form-select-sm w-auto" data-history-filter>
            <option value="all" ${statusFilter === "all" ? "selected" : ""}>All sessions</option>
            <option value="completed" ${statusFilter === "completed" ? "selected" : ""}>Completed</option>
            <option value="aborted" ${statusFilter === "aborted" ? "selected" : ""}>Aborted</option>
          </select>
          <select class="form-select form-select-sm w-auto" data-history-sort>
            <option value="desc" ${sortOrder === "desc" ? "selected" : ""}>Newest first</option>
            <option value="asc" ${sortOrder === "asc" ? "selected" : ""}>Oldest first</option>
          </select>
        </div>
        <div class="list-group">
          ${historyItems || `<div class="text-muted small">No sessions yet</div>`}
        </div>
      </div>
      <div class="col-12 col-lg-5">
        <h3 class="h5 mb-3">Mood Log</h3>
        <div class="list-group">
          ${moodItems || `<div class="text-muted small">No mood entries yet</div>`}
        </div>
      </div>
    </div>
    ${modalMarkup}
  `;
}