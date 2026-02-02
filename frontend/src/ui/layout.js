export function renderLayout(appEl) {
  appEl.innerHTML = `
    <div class="min-vh-100 bg-dark text-light">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary px-3">
        <span class="navbar-brand mb-0 h1">SoriaFlow</span>

        <div class="ms-auto d-flex gap-3">
          <button class="btn btn-sm btn-outline-light" data-nav="home">Home</button>
          <button class="btn btn-sm btn-outline-light" data-nav="exercises">Exercises</button>
          <button class="btn btn-sm btn-outline-light" data-nav="run">Run</button>
          <button class="btn btn-sm btn-outline-light" data-nav="history">History</button>
          <button class="btn btn-sm btn-outline-light" data-nav="mood">Mood</button>
        </div>
      </nav>

      <main class="container py-4">
        <section id="screen-home"></section>
        <section id="screen-exercises" class="d-none"></section>
        <section id="screen-run" class="d-none"></section>
        <section id="screen-history" class="d-none"></section>
        <section id="screen-mood" class="d-none"></section>
      </main>
    </div>
  `;
}