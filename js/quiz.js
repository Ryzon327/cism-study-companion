(function () {
  function bindStep(container, state, handlers) {
    container.querySelectorAll("[data-choice-index]").forEach(btn => {
      btn.addEventListener("click", () => handlers.onSelect(Number(btn.dataset.choiceIndex)));
    });
    // Confidence is handled by the stable studyContent delegation in app.js.
    // Do not bind per-render confidence listeners here.
    container.querySelector("#submitAnswerButton")?.addEventListener("click", handlers.onSubmit);
    container.querySelector("#openTransferButton")?.addEventListener("click", handlers.onOpenTransfer);

    container.querySelectorAll("[data-transfer-index]").forEach(btn => {
      btn.addEventListener("click", () => handlers.onTransferSelect(Number(btn.dataset.transferIndex)));
    });
    container.querySelector("#submitTransferButton")?.addEventListener("click", handlers.onTransferSubmit);
  }
  window.CISMQuiz = { bindStep };
})();
