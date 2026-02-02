import { moodEntries } from "../data/dummy.js";

export function renderMood(el) {
  const items = moodEntries
    .map(
      (m) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${m.timeStamp}</span>
        <span style="width:24px;height:24px;border-radius:6px;background:${m.color};display:inline-block"></span>
      </li>
    `
    )
    .join("");

  el.innerHTML = `
    <h2 class="h4 mb-3">Mood</h2>
    <ul class="list-group">${items}</ul>
  `;
}