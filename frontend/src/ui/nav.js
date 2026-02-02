export function setupNav({ onEnterRun, onLeaveRun }) {
  let current = "home";

  function show(target) {
    if (target === current) return;

    // leave hook
    if (current === "run" && onLeaveRun) onLeaveRun();

    document.querySelector(`#screen-${current}`).classList.add("d-none");
    document.querySelector(`#screen-${target}`).classList.remove("d-none");

    // enter hook
    if (target === "run" && onEnterRun) onEnterRun();

    current = target;
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-nav]");
    if (!btn) return;
    show(btn.dataset.nav);
  });

  return { show, getCurrent: () => current };
}