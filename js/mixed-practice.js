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


  const mindsetWhy = {
    qualifier: {
      "FIRST": "The question is testing sequence. Several actions may eventually be valid; choose the prerequisite that must happen before the others.",
      "NEXT": "The question gives you a completed stage and asks what logically follows from that point in the process.",
      "BEST": "More than one choice may be reasonable. Choose the option that most completely fits the business problem and CISM management perspective.",
      "MOST": "The question is asking for the strongest priority or most important factor, not merely something that is true.",
      "PRIMARY": "Look for the fundamental purpose or main driver. Secondary benefits can be true and still be wrong.",
      "NONE": "There is no explicit sequencing or priority qualifier here, so focus on the core concept, role, and lifecycle context."
    },
    role: {
      "Senior management": "This is an enterprise direction, approval, arbitration, or business-risk decision. Security can advise, but senior management owns the higher-level business authority.",
      "Security manager": "The question is asking for security analysis, recommendation, coordination, governance execution, or management of the security response—not final ownership of the business asset or enterprise risk.",
      "Business/data owner": "The decision depends on business value, classification, acceptable use, access need, or impact. The owner is closest to the business consequence and therefore owns that decision.",
      "Custodian/operations": "The scenario is about implementing, maintaining, or operating protections already required by an owner, policy, or control decision.",
      "Internal audit": "The question calls for independent assurance or evaluation. Audit should assess rather than own or operate the control.",
      "Incident response team": "The scenario is inside active incident handling, where the response team executes the established containment, evidence, eradication, and recovery process.",
      "None/implicit": "No specific actor owns the question. Solve it from the lifecycle and decision context instead of forcing a role onto the scenario."
    },
    lifecycle: {
      "Governance": "The scenario is about direction, authority, alignment, policy, strategy, or senior-level oversight rather than day-to-day control execution.",
      "Risk assessment/evaluation": "The organization is still trying to understand or evaluate exposure, likelihood, impact, or significance before choosing the response.",
      "Risk treatment/acceptance": "The risk is already understood and the question is about what to do with it, what remains afterward, or whether the remaining risk is acceptable.",
      "Security program": "The question is about translating strategy and requirements into ownership, policy, classification, controls, access, operation, or measurement.",
      "Incident response": "A security event is being actively handled. Sequence matters: analyze, contain, eradicate, recover, and preserve evidence as appropriate.",
      "Continuity/recovery": "The focus is business disruption, recovery priorities, RTO/RPO, alternate processing, BCP/DRP, or restoring critical operations.",
      "Post-incident/improvement": "The active incident is over. The focus has moved to root cause, lessons learned, corrective actions, and improving future performance."
    },
    decision: {
      "Business decision": "The answer should reflect organizational objectives, management authority, business value, or enterprise direction rather than a purely technical choice.",
      "Risk decision": "The decision is about understanding, treating, accepting, transferring, or monitoring risk. Think in terms of business exposure and acceptable risk.",
      "Program/control decision": "The organization is deciding how security requirements become policies, classifications, access rules, controls, responsibilities, or operating practices.",
      "Incident decision": "The decision is about the active response to a security event: containment, evidence, communication, eradication, or recovery sequencing.",
      "Recovery decision": "The decision is driven by business interruption and recovery requirements—what must recover, how quickly, and with how much acceptable data loss or degraded service."
    }
  };

  const mindsetMemory = {
    qualifier: {
      "FIRST": "FIRST → find the missing prerequisite.",
      "NEXT": "NEXT → continue from the current lifecycle stage.",
      "BEST": "BEST → choose the most complete fit.",
      "MOST": "MOST → identify the strongest priority.",
      "PRIMARY": "PRIMARY → find the fundamental purpose.",
      "NONE": "No qualifier → solve the concept, role, and lifecycle."
    },
    role: {
      "Senior management": "Security advises → senior management owns enterprise direction.",
      "Security manager": "Security manager → assess, advise, coordinate, manage.",
      "Business/data owner": "Owner decides based on business value and impact.",
      "Custodian/operations": "Owner decides → custodian implements.",
      "Internal audit": "Audit verifies independently; it should not own the control.",
      "Incident response team": "Active incident → response team executes the incident process.",
      "None/implicit": "No clear role → do not invent one."
    },
    lifecycle: {
      "Governance": "Governance → direction, authority, alignment, oversight.",
      "Risk assessment/evaluation": "Understand risk before choosing treatment.",
      "Risk treatment/acceptance": "Treat → residual risk → validate acceptability.",
      "Security program": "Strategy → policy / ownership → controls → measure.",
      "Incident response": "Detect → contain → eradicate → recover.",
      "Continuity/recovery": "BIA / business requirements → recovery objectives → strategy → test.",
      "Post-incident/improvement": "Recover first → then learn and improve."
    },
    decision: {
      "Business decision": "Business decision → objectives, value, authority.",
      "Risk decision": "Risk decision → exposure, treatment, acceptable risk.",
      "Program/control decision": "Program decision → turn requirements into protection.",
      "Incident decision": "Incident decision → limit impact in the right sequence.",
      "Recovery decision": "Recovery decision → business impact drives recovery."
    }
  };

  function mindsetRepairHTML(q) {
    const labels = {
      qualifier: "Qualifier",
      role: "Role / authority",
      lifecycle: "Lifecycle",
      decision: "Decision context"
    };

    const correctValues = {
      qualifier: q.qualifier,
      role: q.role,
      lifecycle: q.lifecycle,
      decision: q.decision
    };

    const missed = Object.keys(labels).filter(key => !state.mindsetResult[key]);
    if (!missed.length) {
      return `<div class="mindset-all-good">
        <span>DECODER</span>
        <strong>You recognized all four mindset signals.</strong>
      </div>`;
    }

    return `<div class="mindset-repair">
      <div class="eyebrow">MINDSET REPAIR · ONLY WHAT YOU MISSED</div>
      ${missed.map(key => {
        const selected = state.mindset[key];
        const correct = correctValues[key];
        return `<div class="mindset-repair-item">
          <div class="mindset-repair-heading">
            <span>${escapeHTML(labels[key])}</span>
            <div><em>${escapeHTML(selected)}</em><b>→</b><strong>${escapeHTML(correct)}</strong></div>
          </div>
          <p>${escapeHTML(mindsetWhy[key]?.[correct] || "Re-read the stem and identify this signal before choosing an answer.")}</p>
          <div class="mindset-mini-memory">
            <span>Memory rule</span>
            <strong>${escapeHTML(mindsetMemory[key]?.[correct] || "Name the signal first, then eliminate answers that ignore it.")}</strong>
          </div>
        </div>`;
      }).join("")}
    </div>`;
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
    const recent = new Set(history.slice(-10).map(x => x.questionId));
    // Seen-set built once; this was history.some() per question, i.e.
    // O(questions x history) on every session build.
    const seen = new Set(history.map(h => h.questionId));

    const ranked = bank.questions.map(q => {
      const m = mastery[q.concept] || { state: "New", attempts: 0, correct: 0 };
      let weight = 1 + Math.random() * 3;
      if (!seen.has(q.id)) weight += 6;
      if (m.state === "Learning") weight += 4;
      if (m.state === "Needs Refresh") weight += 6;
      if (m.attempts && m.correct / m.attempts < .7) weight += 4;
      if (recent.has(q.id)) weight -= 3;
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
    if (!q) {
      content.innerHTML = `<article class="mixed-card">
        <h2>No mixed questions are available right now.</h2>
        <p class="mixed-help">Your progress is unaffected. Try Daily Study or Active Practice instead.</p>
      </article>`;
      nextButton.disabled = true;
      nextButton.style.opacity = ".45";
      progressBar.style.width = "0%";
      return;
    }
    // Denominator counts questions actually answered, not the index.
    const answered = index + (state.answerSubmitted ? 1 : 0);
    scoreEl.textContent = `${score} / ${answered}`;
    progressBar.style.width = questions.length ? `${((index + 1) / questions.length) * 100}%` : "0%";

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

        <div class="mixed-question-reference">
          <span>QUESTION</span>
          <strong>${escapeHTML(q.stem)}</strong>
        </div>

        <div class="mixed-answer-comparison">
          <div>
            <span>YOUR ANSWER</span>
            <strong>${state.selectedIndex == null ? "No answer" : `${String.fromCharCode(65 + state.selectedIndex)}. ${escapeHTML(q.options[state.selectedIndex])}`}</strong>
          </div>
          <div>
            <span>BEST ANSWER</span>
            <strong>${String.fromCharCode(65 + q.correctIndex)}. ${escapeHTML(q.options[q.correctIndex])}</strong>
          </div>
        </div>

        <div class="mixed-answer-block ${correct ? "correct" : "miss"}">
          <strong>Why</strong>
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

        ${mindsetRepairHTML(q)}

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
    const mindset = mixed.mindset || {};
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
