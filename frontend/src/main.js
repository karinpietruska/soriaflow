import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";

import { gsap } from "gsap";

import {
  getExercises,
  getSessions,
  loadExercises,
  loadSessions,
  loadMoods,
} from "./data/store.js";
import { createPresetExercise } from "./data/exercisesService.js";
import { createMood } from "./api/moods.js";
import { finishSession, startSession } from "./api/sessions.js";
import { cycleDurationSec } from "./utils/duration.js";
import { renderLayout } from "./ui/layout.js";
import { setupNav } from "./ui/nav.js";

import { renderHome } from "./screens/home.js";
import { renderRun } from "./screens/run.js";
import { renderHistory } from "./screens/history.js";
import { renderMood } from "./screens/mood.js";

let currentView = "exercise-list"; // exercise-list | configure | preset-name
let selectedExercise = null;
let currentConfig = null;
let presetName = "";
let presetError = "";
let presetSaved = false;
let homeMessage = null;
let homeMessageTimeout = null;

let historySelectedSessionId = null;
let historyPresetName = "";
let historyPresetError = "";
let historyPresetSaved = false;
let historyPreset = null;
let historyStatusFilter = "all";
let historySortOrder = "desc";

let moodSelectedColor = "";
let moodSavedMessage = "";
let moodSavedTimeout = null;
let autoLogMoodAfterExercise = true;
let moodAutoPromptActive = false;

const MOOD_AUTO_PROMPT_KEY = "autoLogMoodAfterExercise";
const storedAutoPrompt = localStorage.getItem(MOOD_AUTO_PROMPT_KEY);
if (storedAutoPrompt !== null) {
  autoLogMoodAfterExercise = storedAutoPrompt === "true";
}

let runState = {
  active: false,
  phases: [],
  phaseIndex: 0,
  secondsRemaining: 0,
  repetitionsCompleted: 0,
  repetitionsPlanned: 0,
  startedAt: null,
  sessionID: null,
};
let runTimer = null;
let breathTimeline = null;
let exercisesLoading = true;
let exercisesError = "";

async function hydrateExercises() {
  exercisesLoading = true;
  exercisesError = "";
  try {
    await loadExercises();
  } catch (err) {
    exercisesError = err?.message || "Failed to load exercises.";
  }
  const list = getExercises();
  selectedExercise = list[0] ?? null;
  currentConfig = selectedExercise
    ? {
        exerciseID: selectedExercise.exerciseID,
      exerciseName: selectedExercise.name,
        inhaleSec: selectedExercise.defaultInhale,
        hold1Sec: selectedExercise.defaultHold1,
        exhaleSec: selectedExercise.defaultExhale,
        hold2Sec: selectedExercise.defaultHold2,
        repetitions: selectedExercise.defaultRepetitions,
      }
    : null;
  exercisesLoading = false;
}

function isPresetNameTaken(name) {
  const normalized = name.trim().toLowerCase();
  return getExercises().some(
    (ex) => ex.name.trim().toLowerCase() === normalized
  );
}

function setHomeMessage(message) {
  homeMessage = message;
  if (homeMessageTimeout) clearTimeout(homeMessageTimeout);
  homeMessageTimeout = setTimeout(() => {
    homeMessage = null;
    renderHome(
      document.querySelector("#screen-home"),
      selectedExercise,
      currentConfig,
      homeMessage
    );
  }, 3000);
}

function buildPhases(config) {
  const phases = [
    { label: "Inhale", seconds: Number(config.inhaleSec) },
    { label: "Hold", seconds: Number(config.hold1Sec) },
    { label: "Exhale", seconds: Number(config.exhaleSec) },
    { label: "Hold", seconds: Number(config.hold2Sec) },
  ];
  return phases.filter((p) => p.seconds > 0);
}

function renderRunScreen() {
  const container = document.querySelector("#screen-run");
  if (!container) return;
  if (!container.dataset.rendered) {
    renderRun(container, {
      exerciseName: selectedExercise?.name,
      phaseLabel: "Ready",
      secondsRemaining: 0,
      repetitionLabel: `0 / ${currentConfig?.repetitions ?? 0}`,
      metaLabel: "",
    });
    container.dataset.rendered = "true";
  }

  const nameEl = container.querySelector("[data-run-name]");
  const metaEl = container.querySelector("[data-run-meta]");
  const phaseEl = container.querySelector("[data-run-phase]");
  const timeEl = container.querySelector("[data-run-time]");
  const repEl = container.querySelector("[data-run-rep]");

  const phase = runState.active
    ? runState.phases[runState.phaseIndex]
    : { label: "Ready" };
  const currentRep = runState.active
    ? Math.min(runState.repetitionsCompleted + 1, runState.repetitionsPlanned)
    : 0;

  if (nameEl) nameEl.textContent = selectedExercise?.name || "Exercise";
  if (metaEl && currentConfig) {
    const phases = `${currentConfig.inhaleSec}-${currentConfig.hold1Sec}-${currentConfig.exhaleSec}-${currentConfig.hold2Sec}`;
    const cycleSec = cycleDurationSec({
      inhaleSec: currentConfig.inhaleSec,
      hold1Sec: currentConfig.hold1Sec,
      exhaleSec: currentConfig.exhaleSec,
      hold2Sec: currentConfig.hold2Sec,
    });
    const totalMin = Math.max(1, Math.round((cycleSec * currentConfig.repetitions) / 60));
    metaEl.textContent = `Phases: ${phases} · Total: ${totalMin} min · Reps: ${currentConfig.repetitions}`;
  }
  if (phaseEl) phaseEl.textContent = phase?.label ?? "Ready";
  if (timeEl) {
    const secs = runState.active ? runState.secondsRemaining : 0;
    timeEl.textContent = `${secs}s`;
  }
  if (repEl) {
    const total = runState.active ? runState.repetitionsPlanned : currentConfig?.repetitions ?? 0;
    repEl.textContent = `${currentRep} / ${total}`;
  }
}

function renderHistoryView() {
  const visibleSessions = getSessions()
    .filter((s) => s.repetitionsCompleted >= 1)
    .filter((s) => {
      if (historyStatusFilter === "completed") return !s.wasAborted;
      if (historyStatusFilter === "aborted") return s.wasAborted;
      return true;
    });
  if (
    historySelectedSessionId &&
    !visibleSessions.some((s) => s.sessionID === historySelectedSessionId)
  ) {
    historySelectedSessionId = null;
  }
  renderHistory(document.querySelector("#screen-history"), {
    selectedSessionId: historySelectedSessionId,
    presetName: historyPresetName,
    presetError: historyPresetError,
    presetSaved: historyPresetSaved,
    statusFilter: historyStatusFilter,
    sortOrder: historySortOrder,
  });
}

function renderMoodView() {
  renderMood(document.querySelector("#screen-mood"), {
    selectedColor: moodSelectedColor,
    savedMessage: moodSavedMessage,
    autoPrompt: autoLogMoodAfterExercise,
  });
}

function stopRunTimer() {
  if (runTimer) clearInterval(runTimer);
  runTimer = null;
}

function startBreathAnimation() {
  const circle = document.querySelector("#breath-circle");
  if (!circle) return;
  const ring = circle.querySelector("[data-breath-ring]");
  if (breathTimeline) breathTimeline.kill();
  const minScale = 0.85;
  const maxScale = 1.2;
  gsap.set(circle, { scale: minScale, transformOrigin: "50% 50%" });
  const inhale = Number(currentConfig?.inhaleSec ?? 0);
  const hold1 = Number(currentConfig?.hold1Sec ?? 0);
  const exhale = Number(currentConfig?.exhaleSec ?? 0);
  const hold2 = Number(currentConfig?.hold2Sec ?? 0);
  let circumference = null;
  if (ring) {
    const radius = ring.r.baseVal.value;
    circumference = 2 * Math.PI * radius;
    ring.style.strokeDasharray = `${circumference} ${circumference}`;
    ring.style.strokeDashoffset = `${circumference}`;
  }
  breathTimeline = gsap.timeline({ repeat: -1 });
  if (inhale > 0) {
    breathTimeline.to(circle, {
      scale: maxScale,
      duration: inhale,
      ease: "power1.inOut",
    });
  }
  if (hold1 > 0) {
    breathTimeline.to(circle, { scale: maxScale, duration: hold1, ease: "none" });
  }
  if (exhale > 0) {
    breathTimeline.to(circle, {
      scale: minScale,
      duration: exhale,
      ease: "power1.inOut",
    });
  }
  if (hold2 > 0) {
    breathTimeline.to(circle, { scale: minScale, duration: hold2, ease: "none" });
  }

  if (ring && circumference) {
    const inhaleStart = 0;
    const hold1Start = inhaleStart + (inhale > 0 ? inhale : 0);
    const exhaleStart = hold1Start + (hold1 > 0 ? hold1 : 0);
    const hold2Start = exhaleStart + (exhale > 0 ? exhale : 0);
    let ringFilled = false;

    if (hold1 > 0) {
      breathTimeline.add(() => {
        const target = ringFilled ? circumference : 0;
        ringFilled = !ringFilled;
        gsap.to(ring, { strokeDashoffset: target, duration: hold1, ease: "none" });
      }, hold1Start);
    }
    if (hold2 > 0) {
      breathTimeline.add(() => {
        const target = ringFilled ? circumference : 0;
        ringFilled = !ringFilled;
        gsap.to(ring, {
          strokeDashoffset: target,
          duration: hold2,
          ease: "none",
        });
      }, hold2Start);
    }
  }
}

function stopBreathAnimation() {
  if (breathTimeline) {
    breathTimeline.kill();
    breathTimeline = null;
  }
}

async function finishRun({ wasAborted, navigateHome = true }) {
  if (!runState.active) return;
  stopBreathAnimation();
  stopRunTimer();
  runState.active = false;
  const endedAt = new Date().toISOString();
  const repetitionsCompleted = wasAborted
    ? runState.repetitionsCompleted
    : runState.repetitionsPlanned;
  const shouldLog = repetitionsCompleted >= 1;

  // Session is created on run start; finishing only records the outcome.
  if (runState.sessionID) {
    try {
      await finishSession(runState.sessionID, {
        wasAborted,
        repetitionsCompleted,
      });
      await loadSessions();
      renderHistoryView();
    } catch (err) {
      setHomeMessage({
        tone: "secondary",
        text: err?.message || "Failed to save session.",
      });
    }
  }

  if (!homeMessage) {
    setHomeMessage({
      tone: shouldLog ? (wasAborted ? "secondary" : "success") : "secondary",
      text: shouldLog
        ? wasAborted
          ? "Session saved (ended early)."
          : "Session saved."
        : "Session ended early.",
    });
  }
  renderHome(
    document.querySelector("#screen-home"),
    selectedExercise,
    currentConfig,
    homeMessage
  );
  if (navigateHome) {
    if (!wasAborted && autoLogMoodAfterExercise) {
      moodSelectedColor = "";
      moodSavedMessage = "";
      moodAutoPromptActive = true;
      renderMoodView();
      nav.show("mood");
    } else {
      moodAutoPromptActive = false;
      nav.show("home");
    }
  }
}

async function startRunSession() {
  if (!selectedExercise || !currentConfig) return;
  if (currentConfig.exerciseID) {
    const matched =
      getExercises().find((ex) => ex.exerciseID === currentConfig.exerciseID) ||
      null;
    selectedExercise =
      matched ||
      selectedExercise || {
        exerciseID: currentConfig.exerciseID,
        name: currentConfig.exerciseName || "Exercise",
        defaultInhale: currentConfig.inhaleSec,
        defaultHold1: currentConfig.hold1Sec,
        defaultExhale: currentConfig.exhaleSec,
        defaultHold2: currentConfig.hold2Sec,
        defaultRepetitions: currentConfig.repetitions,
      };
  }
  const phases = buildPhases(currentConfig);
  if (!phases.length) return;
  stopRunTimer();
  let startedSession = null;
  try {
    startedSession = await startSession({
      exerciseID: selectedExercise.exerciseID,
      repetitionsPlanned: Number(currentConfig.repetitions) || 0,
      inhaleSec: currentConfig.inhaleSec,
      hold1Sec: currentConfig.hold1Sec,
      exhaleSec: currentConfig.exhaleSec,
      hold2Sec: currentConfig.hold2Sec,
    });
  } catch (err) {
    setHomeMessage({
      tone: "secondary",
      text: err?.message || "Failed to start session.",
    });
    // Continue locally even if backend session fails.
    startedSession = null;
  }
  runState = {
    active: true,
    phases,
    phaseIndex: 0,
    secondsRemaining: phases[0].seconds,
    repetitionsCompleted: 0,
    repetitionsPlanned: Number(currentConfig.repetitions) || 0,
    startedAt: startedSession?.startedAt ?? new Date().toISOString(),
    sessionID: startedSession?.sessionID ?? null,
  };
  renderRunScreen();
  startBreathAnimation();
  runTimer = setInterval(() => {
    if (!runState.active) return;
    runState.secondsRemaining -= 1;
    if (runState.secondsRemaining <= 0) {
      runState.phaseIndex += 1;
      if (runState.phaseIndex >= runState.phases.length) {
        runState.repetitionsCompleted += 1;
        if (runState.repetitionsCompleted >= runState.repetitionsPlanned) {
          finishRun({ wasAborted: false });
          return;
        }
        runState.phaseIndex = 0;
      }
      runState.secondsRemaining =
        runState.phases[runState.phaseIndex]?.seconds ?? 0;
    }
    renderRunScreen();
  }, 1000);
}

function renderExerciseItem(ex) {
  return `
    <button
      class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
      data-exercise-id="${ex.exerciseID}"
    >
      <div>
        <div class="fw-semibold">${ex.name}</div>
        <small class="text-muted d-block">
          ${ex.defaultRepetitions} reps · 
          ${ex.defaultInhale}-${ex.defaultHold1}-${ex.defaultExhale}-${ex.defaultHold2}s
        </small>
      </div>
      <span class="text-muted">&rsaquo;</span>
    </button>
  `;
}

function renderExerciseSelection() {
  const list = getExercises();
  if (exercisesLoading) {
    return `
      <section class="container my-4">
        <h2 class="mb-3">Exercises</h2>
        <div class="text-muted small">Loading exercises...</div>
      </section>
    `;
  }
  if (exercisesError) {
    return `
      <section class="container my-4">
        <h2 class="mb-3">Exercises</h2>
        <div class="alert alert-secondary">${exercisesError}</div>
      </section>
    `;
  }
  if (!list.length) {
    return `
      <section class="container my-4">
        <h2 class="mb-3">Exercises</h2>
        <div class="text-muted small">No exercises available.</div>
      </section>
    `;
  }
  const defaultExercises = list.filter((e) => e.source === "DEFAULT");
  const userPresets = list.filter((e) => e.source === "USER_PRESET");

  return `
    <section class="container my-4">
      <h2 class="mb-3">Exercises</h2>

      <div class="mb-4">
        <h5 class="text-light">Default Exercises</h5>
        <div class="list-group">
          ${defaultExercises.map(renderExerciseItem).join("")}
        </div>
      </div>

      <div>
        <h5 class="text-light">Your Presets (${userPresets.length})</h5>
        <div class="list-group">
          ${
            userPresets.length
              ? userPresets.map(renderExerciseItem).join("")
              : `<div class="text-muted small">No presets yet</div>`
          }
        </div>
      </div>
    </section>
  `;
}

function renderConfigureExercise() {
  if (!selectedExercise) {
    return `
      <section class="container my-4">
        <div class="alert alert-secondary mb-3">No exercise selected.</div>
        <button class="btn btn-outline-secondary" data-exercise-back>
          Back to list
        </button>
      </section>
    `;
  }

  const ex = selectedExercise;
  const config = currentConfig || {
    inhaleSec: ex.defaultInhale,
    hold1Sec: ex.defaultHold1,
    exhaleSec: ex.defaultExhale,
    hold2Sec: ex.defaultHold2,
    repetitions: ex.defaultRepetitions,
  };
  const cycleSec = cycleDurationSec(config);
  const totalSec = cycleSec * Number(config.repetitions);
  const totalMin = Math.max(1, Math.round(totalSec / 60));
  return `
    <section class="container my-4">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h2 class="mb-0">Exercise Settings</h2>
        <button class="btn btn-outline-secondary btn-sm" data-exercise-back>
          Back
        </button>
      </div>

      <div class="mb-3">
        <div class="h5 mb-1">${ex.name}</div>
        <div class="text-muted">
          ${config.inhaleSec}-${config.hold1Sec}-${config.exhaleSec}-${config.hold2Sec}
        </div>
      </div>

      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="text-uppercase text-muted small mb-2">Exercise Title</div>
          <div class="fw-semibold">${ex.name}</div>
        </div>
      </div>

      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="text-uppercase text-muted small mb-3">Breath Cycle</div>
          <div class="d-grid gap-2">
            <div class="d-flex justify-content-between align-items-center">
              <span>Inhale</span>
              <div class="d-flex align-items-center gap-2 config-control">
                <button class="btn btn-outline-secondary btn-sm" data-adjust="inhaleSec" data-delta="-1">−</button>
                <span class="config-value">${config.inhaleSec} sec</span>
                <button class="btn btn-outline-secondary btn-sm" data-adjust="inhaleSec" data-delta="1">+</button>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span>Hold after Inhale</span>
              <div class="d-flex align-items-center gap-2 config-control">
                <button class="btn btn-outline-secondary btn-sm" data-adjust="hold1Sec" data-delta="-1">−</button>
                <span class="config-value">${config.hold1Sec} sec</span>
                <button class="btn btn-outline-secondary btn-sm" data-adjust="hold1Sec" data-delta="1">+</button>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span>Exhale</span>
              <div class="d-flex align-items-center gap-2 config-control">
                <button class="btn btn-outline-secondary btn-sm" data-adjust="exhaleSec" data-delta="-1">−</button>
                <span class="config-value">${config.exhaleSec} sec</span>
                <button class="btn btn-outline-secondary btn-sm" data-adjust="exhaleSec" data-delta="1">+</button>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span>Hold after Exhale</span>
              <div class="d-flex align-items-center gap-2 config-control">
                <button class="btn btn-outline-secondary btn-sm" data-adjust="hold2Sec" data-delta="-1">−</button>
                <span class="config-value">${config.hold2Sec} sec</span>
                <button class="btn btn-outline-secondary btn-sm" data-adjust="hold2Sec" data-delta="1">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="text-uppercase text-muted small mb-3">Repetitions</div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span>Repetitions</span>
            <div class="d-flex align-items-center gap-2 config-control config-control--reps">
              <button class="btn btn-outline-secondary btn-sm" data-adjust="repetitions" data-delta="-1">−</button>
              <span class="config-value config-value--narrow">${config.repetitions}</span>
              <button class="btn btn-outline-secondary btn-sm" data-adjust="repetitions" data-delta="1">+</button>
            </div>
          </div>
          <div class="small text-muted">Duration: ${totalMin} min</div>
        </div>
      </div>

      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="text-uppercase text-muted small mb-1">Exercise Description</div>
          <div class="text-muted" style="white-space: pre-line;">
            ${ex.description || "No description available."}
          </div>
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-primary" data-confirm-exercise>Confirm</button>
        <button class="btn btn-outline-secondary" data-save-preset>Save as Preset</button>
        <button class="btn btn-outline-secondary" data-exercise-back>Cancel</button>
      </div>
    </section>
  `;
}

function renderPresetName() {
  const ex = selectedExercise;
  const config = currentConfig || {
    inhaleSec: 0,
    hold1Sec: 0,
    exhaleSec: 0,
    hold2Sec: 0,
    repetitions: 0,
  };
  return `
    <section class="container my-4">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h2 class="mb-0">Save as Preset</h2>
        <button class="btn btn-outline-secondary btn-sm" data-preset-cancel>
          Back
        </button>
      </div>

      <div class="mb-3">
        <div class="h5 mb-1">${ex ? ex.name : "Exercise"}</div>
        <div class="text-muted">
          ${config.inhaleSec}-${config.hold1Sec}-${config.exhaleSec}-${config.hold2Sec}
        </div>
      </div>

      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <label class="form-label fw-semibold" for="preset-name-input">
            Preset name
          </label>
          <input
            id="preset-name-input"
            class="form-control"
            type="text"
            placeholder="e.g. Evening Calm"
            value="${presetName}"
            data-preset-name
          />
          ${
            presetError
              ? `<div class="text-danger small mt-2">${presetError}</div>`
              : ""
          }
        </div>
      </div>

      ${
        presetSaved
          ? `
            <div class="alert alert-success py-2">Preset saved.</div>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-primary" data-start-now>Start now</button>
              <button class="btn btn-outline-secondary" data-back-exercises>Back to exercises</button>
            </div>
          `
          : `
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-primary" data-preset-confirm>Save Preset</button>
              <button class="btn btn-outline-secondary" data-preset-cancel>Cancel</button>
            </div>
          `
      }
    </section>
  `;
}

function renderExercisesView() {
  const container = document.querySelector("#screen-exercises");
  if (currentView === "configure") {
    container.innerHTML = renderConfigureExercise();
    return;
  }
  if (currentView === "preset-name") {
    container.innerHTML = renderPresetName();
    return;
  }
  container.innerHTML = renderExerciseSelection();
}

// Layout
const app = document.querySelector("#app");
renderLayout(app);

async function initializeApp() {
  await hydrateExercises();
  try {
    await loadSessions();
  } catch (err) {
    setHomeMessage({
      tone: "secondary",
      text: err?.message || "Failed to load session history.",
    });
  }
  try {
    await loadMoods();
  } catch (err) {
    setHomeMessage({
      tone: "secondary",
      text: err?.message || "Failed to load moods.",
    });
  }
  // Render screens once (sections stay mounted)
  renderHome(
    document.querySelector("#screen-home"),
    selectedExercise,
    currentConfig,
    homeMessage
  );
  renderRunScreen();
  renderHistoryView();
  renderMoodView();
  renderExercisesView();
}

const nav = setupNav({
  onEnterRun: () => {
    startRunSession();
  },
  onLeaveRun: () => {
    if (runState.active) {
      finishRun({ wasAborted: true, navigateHome: false });
    }
    stopBreathAnimation();
  },
});

initializeApp();

document.addEventListener("click", async (e) => {
  const navBtn = e.target.closest("[data-nav]");
  if (navBtn) {
    const target = navBtn.dataset.nav;
    if (target === "home") {
      renderHome(
        document.querySelector("#screen-home"),
        selectedExercise,
        currentConfig,
        homeMessage
      );
    }
    if (target === "history") {
      try {
        await loadExercises();
      } catch (err) {
        // Ignore load errors here; history can still render.
      }
      renderHistoryView();
    }
    if (target === "mood") {
      moodAutoPromptActive = false;
      renderMoodView();
    }
    if (target === "exercises") {
      currentView = "exercise-list";
      renderExercisesView();
    }
  }
  const presetNameInput = e.target.closest("[data-preset-name]");
  if (presetNameInput && presetNameInput.tagName === "INPUT") {
    presetName = presetNameInput.value;
  }

  const item = e.target.closest("[data-exercise-id]");
  if (item) {
    const exerciseID = item.dataset.exerciseId;
    selectedExercise = getExercises().find((ex) => ex.exerciseID === exerciseID);
    currentView = "configure";
    currentConfig = {
      exerciseID: selectedExercise.exerciseID,
      exerciseName: selectedExercise.name,
      inhaleSec: selectedExercise.defaultInhale,
      hold1Sec: selectedExercise.defaultHold1,
      exhaleSec: selectedExercise.defaultExhale,
      hold2Sec: selectedExercise.defaultHold2,
      repetitions: selectedExercise.defaultRepetitions,
    };
    renderHome(
      document.querySelector("#screen-home"),
      selectedExercise,
      currentConfig,
      homeMessage
    );
    renderExercisesView();
    return;
  }

  const adjustBtn = e.target.closest("[data-adjust]");
  if (adjustBtn) {
    const field = adjustBtn.dataset.adjust;
    const delta = Number(adjustBtn.dataset.delta || 0);
    if (!currentConfig) return;
    const minValue = field === "repetitions" ? 1 : 0;
    const next = Math.max(minValue, Number(currentConfig[field]) + delta);
    currentConfig = { ...currentConfig, [field]: next };
    renderExercisesView();
    return;
  }

  const confirmBtn = e.target.closest("[data-confirm-exercise]");
  if (confirmBtn) {
    currentView = "exercise-list";
    renderHome(
      document.querySelector("#screen-home"),
      selectedExercise,
      currentConfig,
      homeMessage
    );
    renderExercisesView();
    nav.show("home");
    return;
  }

  const saveBtn = e.target.closest("[data-save-preset]");
  if (saveBtn) {
    presetName = selectedExercise ? selectedExercise.name : "";
    presetError = "";
    presetSaved = false;
    currentView = "preset-name";
    renderExercisesView();
    return;
  }

  const presetInput = e.target.closest("[data-preset-name]");
  if (presetInput && presetInput.tagName === "INPUT") {
    return;
  }

  const presetConfirm = e.target.closest("[data-preset-confirm]");
  if (presetConfirm) {
    const trimmedName = presetName.trim();
    if (!trimmedName) {
      presetError = "Please enter a preset name.";
      renderExercisesView();
      return;
    }
    if (isPresetNameTaken(trimmedName)) {
      presetError = "Name already exists. Choose a different name.";
      renderExercisesView();
      return;
    }
    try {
      const preset = await createPresetExercise({
        name: trimmedName,
        baseExercise: selectedExercise,
        defaults: {
          defaultRepetitions: currentConfig.repetitions,
          defaultInhale: currentConfig.inhaleSec,
          defaultHold1: currentConfig.hold1Sec,
          defaultExhale: currentConfig.exhaleSec,
          defaultHold2: currentConfig.hold2Sec,
        },
      });
      selectedExercise = preset;
      currentConfig = {
        ...currentConfig,
        exerciseID: preset.exerciseID,
        exerciseName: preset.name,
      };
      presetSaved = true;
    } catch (err) {
      presetError = err?.message || "Failed to save preset.";
      renderExercisesView();
      return;
    }
    presetError = "";
    renderExercisesView();
    return;
  }

  const startNowBtn = e.target.closest("[data-start-now]");
  if (startNowBtn) {
    renderHome(
      document.querySelector("#screen-home"),
      selectedExercise,
      currentConfig,
      homeMessage
    );
    nav.show("home");
    return;
  }

  const backToExercises = e.target.closest("[data-back-exercises]");
  if (backToExercises) {
    currentView = "exercise-list";
    renderExercisesView();
    return;
  }

  const presetCancel = e.target.closest("[data-preset-cancel]");
  if (presetCancel) {
    presetError = "";
    presetSaved = false;
    currentView = "configure";
    renderExercisesView();
    return;
  }

  const endBtn = e.target.closest("[data-end-exercise]");
  if (endBtn) {
    finishRun({ wasAborted: true });
    return;
  }

  const backBtn = e.target.closest("[data-exercise-back]");
  if (backBtn) {
    currentView = "exercise-list";
    renderHome(
      document.querySelector("#screen-home"),
      selectedExercise,
      currentConfig,
      homeMessage
    );
    renderExercisesView();
  }

  const historyRow = e.target.closest("[data-history-session-id]");
  if (historyRow) {
    const sessionId = historyRow.dataset.historySessionId;
    const session = getSessions().find((s) => s.sessionID === sessionId);
    if (!session) return;
    const ex = getExercises().find((e) => e.exerciseID === session.exerciseID);
    const cycle = cycleDurationSec(session);
    historySelectedSessionId = sessionId;
    historyPresetName = ex ? `${ex.name} (${cycle}s)` : "New preset";
    historyPresetError = "";
    historyPresetSaved = false;
    historyPreset = null;
    renderHistoryView();
    return;
  }

  const historyClose = e.target.closest("[data-history-close],[data-history-back]");
  if (historyClose) {
    historySelectedSessionId = null;
    historyPresetError = "";
    historyPresetSaved = false;
    historyPreset = null;
    renderHistoryView();
    return;
  }

  const historySave = e.target.closest("[data-history-save]");
  if (historySave) {
    const trimmedName = historyPresetName.trim();
    if (!trimmedName) {
      historyPresetError = "Please enter a preset name.";
      renderHistoryView();
      return;
    }
    try {
      const session = getSessions().find(
        (s) => s.sessionID === historySelectedSessionId
      );
      if (!session) return;
      const preset = await createPresetExercise({
        name: trimmedName,
        baseExercise: getExercises().find(
          (e) => e.exerciseID === session.exerciseID
        ),
        defaults: {
          defaultRepetitions: session.repetitionsPlanned,
          defaultInhale: session.inhaleSec,
          defaultHold1: session.hold1Sec,
          defaultExhale: session.exhaleSec,
          defaultHold2: session.hold2Sec,
        },
      });
      historyPreset = preset;
      historyPresetSaved = true;
      historyPresetError = "";
      renderHistoryView();
      return;
    } catch (err) {
      historyPresetError = err?.message || "Failed to save preset.";
      renderHistoryView();
      return;
    }
  }

  const historyStart = e.target.closest("[data-history-start]");
  if (historyStart && historyPreset) {
    selectedExercise = historyPreset;
    currentConfig = {
      exerciseID: historyPreset.exerciseID,
      exerciseName: historyPreset.name,
      inhaleSec: historyPreset.defaultInhale,
      hold1Sec: historyPreset.defaultHold1,
      exhaleSec: historyPreset.defaultExhale,
      hold2Sec: historyPreset.defaultHold2,
      repetitions: historyPreset.defaultRepetitions,
    };
    historySelectedSessionId = null;
    historyPresetSaved = false;
    historyPreset = null;
    renderHistoryView();
    renderHome(
      document.querySelector("#screen-home"),
      selectedExercise,
      currentConfig,
      homeMessage
    );
    nav.show("home");
    return;
  }

  const moodColorBtn = e.target.closest("[data-mood-color]");
  if (moodColorBtn) {
    moodSelectedColor = moodColorBtn.dataset.moodColor;
    moodSavedMessage = "";
    renderMoodView();
    return;
  }

  const moodSaveBtn = e.target.closest("[data-mood-save]");
  if (moodSaveBtn && moodSelectedColor) {
    try {
      await createMood({ color: moodSelectedColor });
      await loadMoods();
      moodSavedMessage = "Mood saved.";
      if (moodSavedTimeout) clearTimeout(moodSavedTimeout);
      moodSavedTimeout = setTimeout(() => {
        moodSavedMessage = "";
        renderMoodView();
      }, 2500);
      renderMoodView();
      if (moodAutoPromptActive) {
        moodAutoPromptActive = false;
        nav.show("home");
      }
    } catch (err) {
      moodSavedMessage = "";
      setHomeMessage({
        tone: "secondary",
        text: err?.message || "Failed to save mood.",
      });
      renderMoodView();
    }
  }
});

document.addEventListener("input", (e) => {
  const input = e.target.closest("[data-preset-name]");
  if (!input || input.tagName !== "INPUT") return;
  presetName = input.value;
  if (presetError) {
    presetError = "";
    renderExercisesView();
  }
});

document.addEventListener("input", (e) => {
  const input = e.target.closest("[data-history-preset-name]");
  if (!input || input.tagName !== "INPUT") return;
  historyPresetName = input.value;
  if (historyPresetError) {
    historyPresetError = "";
    renderHistoryView();
  }
});

document.addEventListener("change", (e) => {
  const filter = e.target.closest("[data-history-filter]");
  if (filter) {
    historyStatusFilter = filter.value;
    renderHistoryView();
    return;
  }
  const sort = e.target.closest("[data-history-sort]");
  if (sort) {
    historySortOrder = sort.value;
    renderHistoryView();
    return;
  }
  const moodAuto = e.target.closest("[data-mood-auto-prompt]");
  if (moodAuto && moodAuto.type === "checkbox") {
    autoLogMoodAfterExercise = moodAuto.checked;
    localStorage.setItem(MOOD_AUTO_PROMPT_KEY, String(autoLogMoodAfterExercise));
    renderMoodView();
  }
});