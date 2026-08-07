(function () {
  function bindChoices(container) {
    const buttons = [...container.querySelectorAll(".choice-button")];
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("selected"));
        button.classList.add("selected");
      });
    });
  }

  window.CISMQuiz = { bindChoices };
})();
