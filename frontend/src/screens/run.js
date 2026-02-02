export function renderRun(el) {
  el.innerHTML = `
    <h2 class="h4 mb-3">Run Exercise</h2>
    <div class="d-flex justify-content-center my-4">
      <div id="breath-circle" class="rounded-circle" style="width:200px;height:200px;background:#5bc0de;"></div>
    </div>
    <div class="text-center">
      <div class="text-secondary mb-2">Phase</div>
      <div class="fs-3 mb-4">Inhale</div>

      <div class="d-flex justify-content-center gap-2">
        <button class="btn btn-outline-light" data-nav="home">Back</button>
        <button class="btn btn-danger" disabled>Abort (later)</button>
        <button class="btn btn-success" disabled>Finish (later)</button>
      </div>

      <p class="text-secondary mt-4 mb-0">
        GSAP animation will be attached to #breath-circle when we implement it.
      </p>
    </div>
  `;
}