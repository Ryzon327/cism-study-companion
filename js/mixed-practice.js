(function () {
  const bank = window.CISMMixedPractice;
  const storage = window.CISMStorage;

  const overlay = document.getElementById("mixedOverlay");
  const closeButton = document.getElementById("closeMixedButton");
  const restartButton = document.getElementById("mixedRestartButton");
  const nextButton = document.getElementById("mixedNextButton");
  const content = document.getElementById("mixedContent");
  const scoreEl = document.getElementById("mixedScore");
  const progressBar = document.getElementById("mixedProgressBar");

  let questions = [];
  let index = 0;
  let score = 0;
  let state = {};
  let results = [];

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildSession() {
    const history = storage.getMixedPractice().attempts || [];
    const active = storage.getActiveLearning();
    const mastery = active.mastery || {};
    const recent = history.slice(-10).map(x => x.questionId);

    const ranked = bank.questions.map(q => {
      const m = mastery[q.concept] || { state: "New", attempts: 0, correct: 0 };
      let weight = 1 + Math.random() * 3;
      if (!history.some(h => h.questionId === q.id)) weight += 6;
      if (m.state === "Learning") weight += 4;
      if (m.state === "Needs Refresh") weight += 6;
      if (m.attempts && m.correct / m.attempts < .7) weight += 4;
      if (recent.includes(q.id)) weight -= 3;
      return { q, weight };
    }).sort((a,b) => b.weight - a.weight);

    const chosen = [];
    // Ensure all four domains appear.
    ["1","2","3","4"].forEach(d => {
      const found = ranked.find(x => String(x.q.domain) === d && !chosen.includes(x.q));
      if (found) chosen.push(found.q);
    });

    for (const item of ranked) {
      if (chosen.length >= Math.min(bank.sessionSize, bank.questions.length)) break;
      if (!chosen.includes(item.q)) chosen.push(item.q);
    }
    return shuffle(chosen);
  }

  function open() {
    questions = buildSession();
    index = 0;
    score = 0;
    state = {};
    results = [];
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    render();
  }

  function close() {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.dispatchEvent(new CustomEvent("cism-mixed-updated"));
  }

  function restart() {
    questions = buildSession();
    index = 0;
    score = 0;
    state = {};
    results = [];
    render();
  }

  function render() {
    const q = questions[index];
    scoreEl.textContent = `${score} / ${index}`;
    progressBar.style.width = `${((index + 1) / questions.length) * 100}%`;

    if (!state.mindsetSubmitted) {
      content.innerHTML = renderMindset(q);
    } else if (!state.answerSubmitted) {
      content.innerHTML = renderQuestion(q);
    } else {
      content.innerHTML = renderFeedback(q);
    }

    bind(q);
    updateFooter();
  }

  function renderMindset(q) {
    return `
      <article class="mixed-card">
        <div class="mixed-stage">STEP 1 · READ THE STEM LIKE A CISM MANAGER</div>
        <h2>${escapeHTML(q.stem)}</h2>
        <p class="mixed-help">Before seeing the answer choices, identify the signals. This is training your question decoder.</p>

        ${renderMindsetGroup("qualifier", "Qualifier", bank.dimensions.qualifier)}
        ${renderMindsetGroup("role", "Whose perspective / authority?", bank.dimensions.role)}
        ${renderMindsetGroup("lifecycle", "Where are we in the lifecycle?", bank.dimensions.lifecycle)}
        ${renderMindsetGroup("decision", "What kind of decision is this?", bank.dimensions.decision)}

        <button class="primary-button mixed-check" id="checkMindsetButton" type="button"
          ${mindsetComplete() ? "" : "disabled"}>Lock in mindset <span>→</span></button>
      </article>
    `;
  }

  function renderMindsetGroup(key, label, values) {
    return `
      <div class="mindset-group">
        <span>${escapeHTML(label)}</span>
        <div class="mindset-chips">
          ${values.map(v => `<button type="button" data-mindset-key="${key}" data-mindset-value="${escapeHTML(v)}"
            class="${state.mindset?.[key] === v ? "selected" : ""}">${escapeHTML(v)}</button>`).join("")}
        </div>
      </div>`;
  }

  function mindsetComplete() {
    return ["qualifier","role","lifecycle","decision"].every(k => state.mindset?.[k]);
  }

  function renderQuestion(q) {
    const reveal = state.mindsetResult;
    return `
      <article class="mixed-card">
        <div class="mixed-stage">STEP 2 · ANSWER WITHOUT A DOMAIN LABEL</div>
        <h2>${escapeHTML(q.stem)}</h2>

        <div class="mindset-summary">
          ${["qualifier","role","lifecycle","decision"].map(k => {
            const ok = reveal[k];
            const val = state.mindset[k];
            return `<span class="${ok ? "correct" : "miss"}">${escapeHTML(val)}</span>`;
          }).join("")}
        </div>

        <div class="mixed-options">
          ${q.options.map((option, i) => `
            <button type="button" data-mixed-choice="${i}" class="${state.selectedIndex === i ? "selected" : ""}">
              <span>${String.fromCharCode(65+i)}</span><strong>${escapeHTML(option)}</strong>
            </button>`).join("")}
        </div>

        <button class="primary-button mixed-check" id="checkMixedAnswerButton" type="button"
          ${state.selectedIndex == null ? "disabled" : ""}>Check answer <span>→</span></button>
      </article>
    `;
  }

  function renderFeedback(q) {
    const correct = state.selectedIndex === q.correctIndex;
    const mindsetLabels = {
      qualifier: q.qualifier,
      role: q.role,
      lifecycle: q.lifecycle,
      decision: q.decision
    };

    return `
      <article class="mixed-card">
        <div class="mixed-stage">${correct ? "CORRECT" : "REPAIR THE REASONING"}</div>
        <h2>${correct ? "You solved the management problem." : "The answer matters — but the reasoning pattern matters more."}</h2>

        <div class="mixed-answer-block ${correct ? "correct" : "miss"}">
          <strong>Best answer</strong>
          <span>${String.fromCharCode(65 + q.correctIndex)}. ${escapeHTML(q.options[q.correctIndex])}</span>
          <p>${escapeHTML(q.rationale)}</p>
        </div>

        <div class="mindset-reveal">
          <div class="eyebrow">CISM DECODER</div>
          ${Object.entries(mindsetLabels).map(([k,v]) => `
            <div>
              <span>${escapeHTML(k)}</span>
              <strong>${escapeHTML(v)}</strong>
              <em class="${state.mindsetResult[k] ? "correct" : "miss"}">${state.mindsetResult[k] ? "recognized" : "missed"}</em>
            </div>`).join("")}
        </div>

        <div class="mixed-pattern">
          <span>QUESTION PATTERN</span>
          <strong>${escapeHTML(q.pattern)}</strong>
        </div>

        <div class="study-memory-rule mixed-memory">
          <div class="memory-rule-icon">↳</div>
          <div><span>MEMORY RULE</span><strong>${escapeHTML(q.memory)}</strong></div>
        </div>

        <div class="mixed-domain-reveal">
          Domain ${q.domain} · ${escapeHTML(q.concept)}
        </div>
      </article>
    `;
  }

  function bind(q) {
    content.querySelectorAll("[data-mindset-key]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.mindset = state.mindset || {};
        state.mindset[btn.dataset.mindsetKey] = btn.dataset.mindsetValue;
        render();
      });
    });

    content.querySelector("#checkMindsetButton")?.addEventListener("click", () => {
      state.mindsetSubmitted = true;
      state.mindsetResult = {
        qualifier: state.mindset.qualifier === q.qualifier,
        role: state.mindset.role === q.role,
        lifecycle: state.mindset.lifecycle === q.lifecycle,
        decision: state.mindset.decision === q.decision
      };
      render();
    });

    content.querySelectorAll("[data-mixed-choice]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.selectedIndex = Number(btn.dataset.mixedChoice);
        render();
      });
    });

    content.querySelector("#checkMixedAnswerButton")?.addEventListener("click", () => {
      state.answerSubmitted = true;
      const correct = state.selectedIndex === q.correctIndex;
      if (correct) score++;

      const result = {
        questionId: q.id,
        domain: q.domain,
        concept: q.concept,
        correct,
        selectedIndex: state.selectedIndex,
        correctIndex: q.correctIndex,
        mindset: state.mindsetResult
      };
      results.push(result);
      storage.recordMixedAttempt(result);
      render();
    });
  }

  function updateFooter() {
    const completeCurrent = state.answerSubmitted;
    nextButton.disabled = !completeCurrent;
    nextButton.style.opacity = completeCurrent ? "1" : ".45";
    const last = index === questions.length - 1;
    nextButton.innerHTML = last ? `Finish <span>✓</span>` : `Next <span>→</span>`;
    nextButton.onclick = () => {
      if (!completeCurrent) return;
      if (!last) {
        index++;
        state = {};
        render();
      } else {
        renderCompletion();
      }
    };
  }

  function renderCompletion() {
    const mixed = storage.getMixedPractice();
    const mindset = mixed.mindset;
    const misses = results.filter(r => !r.correct);
    const conceptMisses = [...new Set(misses.map(r => r.concept))];

    const rates = Object.entries(mindset).map(([k,v]) => ({
      key: k,
      attempts: v.attempts || 0,
      correct: v.correct || 0,
      pct: v.attempts ? Math.round((v.correct / v.attempts) * 100) : 0
    }));

    storage.recordMixedSession({
      score,
      total: questions.length,
      missedConcepts: conceptMisses
    });

    content.innerHTML = `
      <article class="mixed-card mixed-completion">
        <div class="mixed-stage">MIXED SESSION COMPLETE</div>
        <h2>${misses.length ? "We now know where your CISM judgment needs another pass." : "Strong mixed-domain reasoning."}</h2>
        <p class="mixed-help">These results feed the same mastery and repair engine used by Active Practice.</p>

        <div class="completion-score"><strong>${score}</strong><span>of ${questions.length} answers correct</span></div>

        <div class="mindset-score-grid">
          ${rates.map(r => `
            <div>
              <span>${escapeHTML(r.key)}</span>
              <strong>${r.pct}%</strong>
              <small>${r.correct}/${r.attempts} recognized</small>
            </div>`).join("")}
        </div>

        ${conceptMisses.length ? `<div class="mixed-repair-list">
          <div class="eyebrow">ROLLED INTO REPAIR</div>
          ${conceptMisses.map(c => `<span>${escapeHTML(c)}</span>`).join("")}
        </div>` : ""}

        <div class="study-callout">
          <strong>Why this matters</strong>
          <div>The real exam will not tell you the domain. Mixed Practice trains you to recognize role, qualifier, lifecycle stage, and business decision context before selecting an answer.</div>
        </div>
      </article>`;

    scoreEl.textContent = `${score} / ${questions.length}`;
    progressBar.style.width = "100%";
    nextButton.disabled = false;
    nextButton.style.opacity = "1";
    nextButton.innerHTML = `Done <span>✓</span>`;
    nextButton.onclick = close;
  }

  closeButton.addEventListener("click", close);
  restartButton.addEventListener("click", restart);

  window.CISMMixedEngine = { open, close };
})();
