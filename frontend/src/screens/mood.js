import { getMoodEntries } from "../data/store.js";

const MOOD_COLORS = [
  { id: "blue-6", color: "#228be6" },
  { id: "teal-6", color: "#12b886" },
  { id: "green-6", color: "#40c057" },
  { id: "yellow-6", color: "#fab005" },
  { id: "orange-6", color: "#fd7e14" },
  { id: "red-6", color: "#fa5252" },
  { id: "grape-6", color: "#be4bdb" },
];

export function renderMood(
  el,
  { selectedColor = "", savedMessage = "" } = {}
) {
  const palette = MOOD_COLORS.map(
    (m) => `
      <button
        type="button"
        class="mood-swatch ${selectedColor === m.color ? "mood-swatch--active" : ""}"
        style="background:${m.color};"
        data-mood-color="${m.color}"
        aria-label="${m.id}"
      ></button>
    `
  ).join("");

  const entries = getMoodEntries();
  const byDay = new Map();
  const toLocalKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  entries.forEach((m) => {
    const d = new Date(m.timeStamp);
    const key = toLocalKey(d);
    if (!byDay.has(key)) {
      byDay.set(key, m);
    } else {
      const existing = byDay.get(key);
      if (new Date(existing.timeStamp).getTime() < d.getTime()) {
        byDay.set(key, m);
      }
    }
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toLocalKey(d);
    days.push({ key, entry: byDay.get(key) || null });
  }
  const moodGrid = days
    .map((d) => {
      const color = d.entry ? d.entry.color : "transparent";
      const label = d.entry
        ? new Date(d.entry.timeStamp).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })
        : d.key;
      return `
        <div
          class="mood-day"
          style="background:${color};"
          title="${label}"
        ></div>
      `;
    })
    .join("");

  el.innerHTML = `
    <h2 class="h4 mb-3">Mood</h2>
    <div class="mb-3">
      <div class="text-secondary mb-2">
        Pick a color that represents how you are feeling right now:
      </div>
      <div class="mood-palette">${palette}</div>
      ${
        savedMessage
          ? `<div class="alert alert-success py-2 mt-3">${savedMessage}</div>`
          : ""
      }
      <div class="mt-3">
        <button class="btn btn-primary" data-mood-save ${
          selectedColor ? "" : "disabled"
        }>
          Save mood
        </button>
      </div>
    </div>
    <h3 class="h5 mb-2 mt-5">Mood Summary</h3>
    <div class="text-secondary small mb-3">
      Each square represents the last mood logged for a day over the past 30 days. Days are ordered from top-left to bottom-right (oldest to newest). Empty squares mean no mood was logged.
    </div>
    <div class="mood-summary">${moodGrid}</div>
  `;
}