import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";

import { renderLayout } from "./ui/layout.js";
import { setupNav } from "./ui/nav.js";

import { renderHome } from "./screens/home.js";
import { renderExercises } from "./screens/exercises.js";
import { renderRun } from "./screens/run.js";
import { renderHistory } from "./screens/history.js";
import { renderMood } from "./screens/mood.js";

// Layout
const app = document.querySelector("#app");
renderLayout(app);

// Render screens once (sections stay mounted)
renderHome(document.querySelector("#screen-home"));
renderExercises(document.querySelector("#screen-exercises"));
renderRun(document.querySelector("#screen-run"));
renderHistory(document.querySelector("#screen-history"));
renderMood(document.querySelector("#screen-mood"));

// GSAP hooks later (for now: placeholders)
setupNav({
  onEnterRun: () => {
    // later: start GSAP timeline on #breath-circle
  },
  onLeaveRun: () => {
    // later: stop/kill GSAP timeline
  },
});