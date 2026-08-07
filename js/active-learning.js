(function () {
  const labs = window.CISMActiveLearning;
  const storage = window.CISMStorage;

  let domainId = "1";
  let sessionChallenges = [];
  let challengeIndex = 0;
  let score = 0;
  let currentState = {};
  let sessionResults = [];

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

  function shuffled(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildAdaptiveSession(domain) {
    const lab = labs[domain];
    const state = storage.getActiveLearning();
    const history = state.challengeHistory || [];
    const mastery = state.mastery || {};
    const sessionSize = Math.min(lab.sessionSize || 8, lab.challenges.length);

    const recentIds = history.slice(-8).map(x => x.challengeId);

    const scored = lab.challenges.map(challenge => {
      const m = mastery[challenge.concept] || { attempts: 0, correct: 0, state: "New" };
      const conceptRate = m.attempts ? m.correct / m.attempts : 0;
      const challengeHistory = history.filter(x => x.challengeId === challenge.id);
      const challengeRate = challengeHistory.length
        ? challengeHistory.filter(x => x.correct).length / challengeHistory.length
        : 0;

      let weight = 1;
      if (!challengeHistory.length) weight += 5;                  // unseen
      if (m.state === "Learning") weight += 5;
      if (m.state === "Needs Refresh") weight += 6;
      if (m.attempts && conceptRate < 0.7) weight += 5;           // weak concept
      if (challengeHistory.length && challengeRate < 0.7) weight += 4;
      if (recentIds.includes(challenge.id)) weight -= 2;          // avoid immediate repeat
      if (challenge.type === "sequence") weight += 1.5;           // ensure process practice
      weight += Math.random() * 2.5;                              // fresh mix

      return { challenge, weight };
    }).sort((a,b) => b.weight - a.weight);

    // Ensure variety of interaction types where possible.
    const chosen = [];
    const wantedTypes = ["distinguish", "apply", "pattern", "sequence"];
    wantedTypes.forEach(type => {
      const candidate = scored.find(x => x.challenge.type === type && !chosen.includes(x.challenge));
      if (candidate) chosen.push(candidate.challenge);
    });

    for (const item of scored) {
      if (chosen.length >= sessionSize) break;
      if (!chosen.includes(item.challenge)) chosen.push(item.challenge);
    }

    return shuffled(chosen.slice(0, sessionSize));
  }

  function open(domain) {
    domainId = String(domain);
    sessionChallenges = buildAdaptiveSession(domainId);
    challengeIndex = 0;
    score = 0;
    currentState = {};
    sessionResults = [];
    nextButton.onclick = null;
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
    sessionChallenges = buildAdaptiveSession(domainId);
    challengeIndex = 0;
    score = 0;
    currentState = {};
    sessionResults = [];
    nextButton.onclick = null;
    render();
  }

  function render() {
    const lab = labs[domainId];
    const challenge = sessionChallenges[challengeIndex];

    title.textContent = lab.title;
    eyebrow.textContent = `DOMAIN ${domainId} · ADAPTIVE PRACTICE`;
    scoreEl.textContent = `${score} / ${challengeIndex}`;
    progressBar.style.width = `${((challengeIndex + 1) / sessionChallenges.length) * 100}%`;

    if (challenge.type === "sequence") {
      if (!currentState.sequencePool) {
        currentState.sequencePool = shuffled(challenge.steps);
        currentState.sequence = [];
      }
      content.innerHTML = renderSequence(challenge);
    } else {
      content.innerHTML = renderChoiceChallenge(challenge);
    }

    bind(challenge);
    updateNextButton();
  }

  function renderChoiceChallenge(c) {
    const submitted = currentState.submitted;
    return `
      <article class="active-card">
        <div class="active-type">${escapeHTML(c.type.toUpperCase())} · ${escapeHTML(c.concept)}</div>
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
        <div class="active-type">SEQUENCE · ${escapeHTML(c.concept)}</div>
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
            ${remaining.map((step, i) => `<button type="button" data-sequence-add-index="${i}">${escapeHTML(step)}</button>`).join("")}
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
        <div class="active-result-kicker">${correct ? "UNDERSTOOD" : "ADD THIS TO REPAIR"}</div>
        <h3>${correct ? "You applied the concept correctly." : "This miss will now carry more weight in future practice."}</h3>
        <p>${escapeHTML(c.explanation)}</p>
        <div class="memory-rule"><strong>Memory rule</strong><span>${escapeHTML(c.memory)}</span></div>
      </div>`;
  }

  function renderSequenceResult(c) {
    const correct = currentState.sequence.every((x, i) => x === c.steps[i]);
    return `
      <div class="active-result ${correct ? "correct-result" : "repair-result"}">
        <div class="active-result-kicker">${correct ? "SEQUENCE LOCKED IN" : "ADD THIS PROCESS TO REPAIR"}</div>
        <h3>${correct ? "You built the lifecycle in the right order." : "Compare your order with the correct process model."}</h3>
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

    content.querySelectorAll("[data-sequence-add-index]").forEach(btn => {
      btn.addEventListener("click", () => {
        const remaining = currentState.sequencePool.filter(x => !currentState.sequence.includes(x));
        const step = remaining[Number(btn.dataset.sequenceAddIndex)];
        if (step != null) currentState.sequence.push(step);
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

  function saveResult(c, correct) {
    const result = {
      domain: domainId,
      challengeId: c.id,
      type: c.type,
      concept: c.concept,
      correct
    };
    sessionResults.push(result);
    storage.recordActiveResult(result);
  }

  function submitChoice(c) {
    if (currentState.selectedIndex == null) return;
    currentState.submitted = true;
    const correct = currentState.selectedIndex === c.correctIndex;
    if (correct) score++;
    saveResult(c, correct);
    render();
  }

  function submitSequence(c) {
    if ((currentState.sequence || []).length !== c.steps.length) return;
    currentState.submitted = true;
    const correct = currentState.sequence.every((x, i) => x === c.steps[i]);
    if (correct) score++;
    saveResult(c, correct);
    render();
  }

  function updateNextButton() {
    nextButton.disabled = !currentState.submitted;
    nextButton.style.opacity = nextButton.disabled ? ".45" : "1";
    const last = challengeIndex === sessionChallenges.length - 1;
    nextButton.innerHTML = last ? `Finish <span>✓</span>` : `Next <span>→</span>`;
    nextButton.onclick = () => {
      if (!currentState.submitted) return;
      if (!last) {
        challengeIndex++;
        currentState = {};
        render();
      } else {
        renderCompletion();
      }
    };
  }

  function getRepairSummary() {
    const state = storage.getActiveLearning();
    const misses = sessionResults.filter(x => !x.correct);
    const concepts = [...new Set(misses.map(x => x.concept))];

    return concepts.map(concept => {
      const mastery = state.mastery?.[concept] || {};
      const related = labs[domainId].challenges.filter(c => c.concept === concept);
      const memory = related[0]?.memory || "Review and reapply the concept.";
      return {
        concept,
        memory,
        state: mastery.state || "Learning",
        correct: mastery.correct || 0,
        attempts: mastery.attempts || 0
      };
    });
  }

  function renderCompletion() {
    const repair = getRepairSummary();
    scoreEl.textContent = `${score} / ${sessionChallenges.length}`;
    progressBar.style.width = "100%";

    content.innerHTML = `
      <article class="active-card completion-card adaptive-completion">
        <div class="active-type">ADAPTIVE SESSION COMPLETE</div>
        <h2>${repair.length ? "We found exactly what needs another pass." : "Strong session — no repair needed from this set."}</h2>
        <p class="active-prompt">${repair.length
          ? "These concepts are now weighted more heavily in future practice. You do not need to hunt them down manually."
          : "Future sessions will keep sampling other concepts so strong areas are still revalidated over time."}</p>

        <div class="completion-score"><strong>${score}</strong><span>of ${sessionChallenges.length} correct</span></div>

        ${repair.length ? `<div class="adaptive-repair-list">
          ${repair.map(item => `<div class="adaptive-repair-item">
            <div>
              <span class="repair-state">${escapeHTML(item.state)}</span>
              <strong>${escapeHTML(item.concept)}</strong>
            </div>
            <p>${escapeHTML(item.memory)}</p>
            <small>${item.correct} correct across ${item.attempts} active attempts</small>
          </div>`).join("")}
        </div>` : ""}

        <div class="study-callout">
          <strong>How the next session changes</strong>
          <div>Unseen questions remain important, but missed concepts receive extra selection weight. Recently repeated questions are de-prioritized so you see fresh wording instead of memorizing the answer.</div>
        </div>
      </article>`;

    nextButton.innerHTML = `Done <span>✓</span>`;
    nextButton.disabled = false;
    nextButton.style.opacity = "1";
    nextButton.onclick = close;
  }

  closeButton.addEventListener("click", close);
  restartButton.addEventListener("click", restart);

  window.CISMActiveEngine = { open, close, buildAdaptiveSession };
})();
