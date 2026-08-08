(function () {
  function bindStep(container, state, handlers) {
    container.querySelectorAll("[data-choice-index]").forEach(btn => {
      btn.addEventListener("click", () => handlers.onSelect(Number(btn.dataset.choiceIndex)));
    });
    // Confidence uses one delegated handler so it remains reliable even when
    // the study card re-renders after an answer or confidence change.
    container.querySelectorAll("[data-confidence]").forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const value = event.currentTarget.dataset.confidence;
        if (value && handlers.onConfidence) handlers.onConfidence(value);
      });
    });
    container.querySelector("#submitAnswerButton")?.addEventListener("click", handlers.onSubmit);
    container.querySelector("#openTransferButton")?.addEventListener("click", handlers.onOpenTransfer);

    container.querySelectorAll("[data-transfer-index]").forEach(btn => {
      btn.addEventListener("click", () => handlers.onTransferSelect(Number(btn.dataset.transferIndex)));
    });
    container.querySelector("#submitTransferButton")?.addEventListener("click", handlers.onTransferSubmit);
  }
  window.CISMQuiz = { bindStep };
})();
