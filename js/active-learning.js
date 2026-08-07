(function () {
  const labs = window.CISMActiveLearning;
  const storage = window.CISMStorage;

  let domainId = "1";
  let challengeIndex = 0;
  let score = 0;
  let currentState = {};
  let orderPool = [];

  const overlay = document.getElementById("learningOverlay");
  const closeButton = document.getElementById("closeLearningButton");
  const restartButton = document.getElementById("learningRestartButton");
  const nextButton = document.getElementById("learningNextButton");
  const content = document.getElementById("learningContent");
  const title = document.getElementById("learningTitle");
  const eyebrow = document.getElementById("learningEyebrow");
  const scoreEl = document.getElementById("learningScore");
  const progressBar = document.getElementById("learningProgressBar");

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function open(domain) {
    domainId = String(domain);
    challengeIndex = 0;
    score = 0;
    currentState = {};
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    render();
  }

  function close() {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.dispatchEvent(new CustomEvent("cism-active-learning-updated"));
  }

  function restart() {
    challengeIndex = 0;
    score = 0;
    currentState = {};
    render();
  }

  function render() {
    const lab = labs[domainId];
    const challenge = lab.challenges[challengeIndex];
    title.textContent = lab.title;
    eyebrow.textContent = `DOMAIN ${domainId} · ACTIVE PRACTICE`;
    scoreEl.textContent = `${score} / ${challengeIndex}`;
    progressBar.style.width = `${((challengeIndex + 1) / lab.challenges.length) * 100}%`;

    if (challenge.type === "sequence") {
      if (!currentState.sequencePool) {
        orderPool = shuffle(challenge.steps);
        currentState.sequencePool = orderPool;
        currentState.sequence = [];
      }
      content.innerHTML = renderSequence(challenge);
    } else {
      content.innerHTML = renderChoiceChallenge(challenge);
    }

    bind(challenge);
    updateNextButton(challenge);
  }

  function renderChoiceChallenge(c) {
    const submitted = currentState.submitted;
    return `
      <article class="active-card">
        <div class="active-type">${escapeHTML(c.type.toUpperCase())}</div>
        <h2>${escapeHTML(c.title)}</h2>
        <p class="active-prompt">${escapeHTML(c.prompt)}</p>
        <div class="active-options">
          ${c.options.map((option, i) => {
            let cls = "active-option";
            if (currentState.selectedIndex === i) cls += " selected";
            if (submitted && i === c.correctIndex) cls += " correct";
            if (submitted && currentState.selectedIndex === i && i !== c.correctIndex) cls += " incorrect";
            return `<button type="button" class="${cls}" data-active-choice="${i}" ${submitted ? "disabled" : ""}>
              <span>${String.fromCharCode(65+i)}</span><strong>${escapeHTML(option)}</strong>
            </button>`;
          }).join("")}
        </div>
        ${submitted ? renderResult(c, currentState.selectedIndex === c.correctIndex) :
          `<button class="primary-button active-check-button" id="activeCheckButton" type="button" ${currentState.selectedIndex == null ? "disabled" : ""}>Check understanding <span>→</span></button>`}
      </article>
    `;
  }

  function renderSequence(c) {
    const submitted = currentState.submitted;
    const selected = currentState.sequence || [];
    const remaining = currentState.sequencePool.filter(x => !selected.includes(x));

    return `
      <article class="active-card">
        <div class="active-type">SEQUENCE</div>
        <h2>${escapeHTML(c.title)}</h2>
        <p class="active-prompt">${escapeHTML(c.prompt)}</p>

        <div class="sequence-answer">
          <div class="sequence-label">YOUR ORDER</div>
          ${selected.length ? selected.map((step, i) =>
            `<button class="sequence-selected ${submitted ? "" : "removable"}" data-sequence-remove="${i}" type="button" ${submitted ? "disabled" : ""}>
              <span>${i+1}</span><strong>${escapeHTML(step)}</strong>
            </button>`
          ).join("") : `<div class="sequence-empty">Choose the first step below.</div>`}
        </div>

        ${!submitted ? `<div class="sequence-pool">
          <div class="sequence-label">AVAILABLE STEPS</div>
          <div class="sequence-buttons">
            ${remaining.map(step => `<button type="button" data-sequence-add="${escapeHTML(step)}">${escapeHTML(step)}</button>`).join("")}
          </div>
        </div>` : ""}

        ${submitted ? renderSequenceResult(c) :
          `<button class="primary-button active-check-button" id="sequenceCheckButton" type="button" ${selected.length !== c.steps.length ? "disabled" : ""}>Check order <span>→</span></button>`}
      </article>
    `;
  }

  function renderResult(c, correct) {
    return `
      <div class="active-result ${correct ? "correct-result" : "repair-result"}">
        <div class="active-result-kicker">${correct ? "UNDERSTOOD" : "REPAIR THIS DISTINCTION"}</div>
        <h3>${correct ? "You applied the concept correctly." : "This is exactly the kind of distinction worth repairing."}</h3>
        <p>${escapeHTML(c.explanation)}</p>
        <div class="memory-rule"><strong>Memory rule</strong><span>${escapeHTML(c.memory)}</span></div>
      </div>`;
  }

  function renderSequenceResult(c) {
    const correct = currentState.sequence.every((x, i) => x === c.steps[i]);
    return `
      <div class="active-result ${correct ? "correct-result" : "repair-result"}">
        <div class="active-result-kicker">${correct ? "SEQUENCE LOCKED IN" : "REBUILD THE PROCESS MODEL"}</div>
        <h3>${correct ? "You put the lifecycle in the right order." : "Compare your order with the CISM process."}</h3>
        <div class="correct-sequence">${c.steps.map((s,i) => `<div><span>${i+1}</span><strong>${escapeHTML(s)}</strong></div>`).join("")}</div>
        <p>${escapeHTML(c.explanation)}</p>
        <div class="memory-rule"><strong>Memory rule</strong><span>${escapeHTML(c.memory)}</span></div>
      </div>`;
  }

  function bind(c) {
    content.querySelectorAll("[data-active-choice]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentState.selectedIndex = Number(btn.dataset.activeChoice);
        render();
      });
    });

    content.querySelector("#activeCheckButton")?.addEventListener("click", () => submitChoice(c));

    content.querySelectorAll("[data-sequence-add]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentState.sequence.push(btn.dataset.sequenceAdd);
        render();
      });
    });

    content.querySelectorAll("[data-sequence-remove]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentState.sequence.splice(Number(btn.dataset.sequenceRemove), 1);
        render();
      });
    });

    content.querySelector("#sequenceCheckButton")?.addEventListener("click", () => submitSequence(c));
  }

  function submitChoice(c) {
    if (currentState.selectedIndex == null) return;
    currentState.submitted = true;
    const correct = currentState.selectedIndex === c.correctIndex;
    if (correct) score++;
    storage.recordActiveResult({
      domain: domainId,
      challengeId: c.id,
      type: c.type,
      concept: c.concept,
      correct
    });
    render();
  }

  function submitSequence(c) {
    if ((currentState.sequence || []).length !== c.steps.length) return;
    currentState.submitted = true;
    const correct = currentState.sequence.every((x, i) => x === c.steps[i]);
    if (correct) score++;
    storage.recordActiveResult({
      domain: domainId,
      challengeId: c.id,
      type: c.type,
      concept: c.concept,
      correct
    });
    render();
  }

  function updateNextButton(c) {
    nextButton.disabled = !currentState.submitted;
    nextButton.style.opacity = nextButton.disabled ? ".45" : "1";
    const last = challengeIndex === labs[domainId].challenges.length - 1;
    nextButton.innerHTML = last ? `Finish <span>✓</span>` : `Next <span>→</span>`;
  }

  nextButton.addEventListener("click", () => {
    if (!currentState.submitted) return;
    const lab = labs[domainId];
    if (challengeIndex < lab.challenges.length - 1) {
      challengeIndex++;
      currentState = {};
      render();
    } else {
      renderCompletion();
    }
  });

  function renderCompletion() {
    const lab = labs[domainId];
    scoreEl.textContent = `${score} / ${lab.challenges.length}`;
    progressBar.style.width = "100%";
    content.innerHTML = `
      <article class="active-card completion-card">
        <div class="active-type">ACTIVE REVIEW COMPLETE</div>
        <h2>You practiced the domain — you did not just reread it.</h2>
        <p class="active-prompt">The app saved this evidence so future retention work can focus on what actually needs attention.</p>
        <div class="completion-score"><strong>${score}</strong><span>of ${lab.challenges.length} challenges correct</span></div>
        <div class="study-callout">
          <strong>What this confirms</strong>
          <div>You were asked to distinguish concepts, apply them in scenarios, recognize a question pattern, and build a lifecycle from memory.</div>
        </div>
      </article>`;
    nextButton.innerHTML = `Done <span>✓</span>`;
    nextButton.disabled = false;
    nextButton.style.opacity = "1";
    nextButton.onclick = close;
  }

  closeButton.addEventListener("click", close);
  restartButton.addEventListener("click", restart);

  window.CISMActiveEngine = { open, close };
})();
