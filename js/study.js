(function () {
  const session = {
    id: "foundation-cism-mindset-01",
    title: "Think Like CISM",
    domain: "Foundation",
    estimatedMinutes: 35,
    steps: [
      {
        type: "recall",
        name: "Recall",
        kicker: "RETRIEVE",
        title: "Who owns the decision?",
        body: "Before learning anything new, retrieve the management lens.",
        question: "An information security manager identifies a significant compliance risk. Who ultimately makes the business decision about the extent of compliance?",
        choices: [
          "Information security manager",
          "Senior management",
          "Internal audit",
          "Security administrator"
        ],
        correctIndex: 1,
        confidence: true,
        rationale: "Information security advises on risk and impact, but the business decision is made by senior management.",
        pattern: "Security advises → management makes the business decision.",
        memoryRule: "Security advises → business authority decides.",
        repair: {
          whyAttractive: "Operational security roles often discover and analyze the issue, so they can feel like the decision owner.",
          correction: "CISM separates expertise from authority. Identifying or analyzing a risk does not transfer business accountability to the security manager.",
          transferQuestion: "A security manager recommends accepting residual risk after treatment. Who should approve that business risk decision?",
          transferChoices: ["Security operations", "Senior management / appropriate business owner", "Internal audit", "The control owner"],
          transferCorrectIndex: 1
        }
      },
      {
        type: "learn",
        name: "Learn",
        kicker: "FOUNDATION",
        title: "Business first. Security enables.",
        body: "CISM repeatedly frames information security as an enterprise management function. Start by understanding the business objective, stakeholder requirement, or risk before jumping to a technical solution.",
        calloutTitle: "Mental model",
        callout: "Business objective → understand risk/requirements → choose the appropriate response → measure whether it works.",
        map: ["Business", "Risk / Requirements", "Decision", "Controls", "Measure"],
        mapActive: 0,
        memoryRule: "Business → risk / requirements → decision → controls → measure."
      },
      {
        type: "compare",
        name: "Compare",
        kicker: "KNOW THE DIFFERENCE",
        title: "Recommend vs approve vs implement",
        body: "Many CISM distractors are reasonable actions assigned to the wrong role.",
        compare: [
          ["Security manager", "Assess, advise, recommend, coordinate, manage"],
          ["Senior management / business", "Approve direction, make business decisions, accept appropriate risk"],
          ["Control / operational owner", "Implement and maintain assigned controls"],
          ["Internal audit", "Independently assess and provide assurance"]
        ],
        calloutTitle: "Question to ask",
        callout: "Is the question asking who understands the issue, who recommends the response, who approves it, or who carries it out?",
        memoryRule: "Recommend ≠ approve ≠ implement ≠ independently verify."
      },
      {
        type: "pattern",
        name: "Pattern",
        kicker: "QUESTION PATTERN",
        title: "FIRST = find the missing prerequisite.",
        body: "Do not memorize a single FIRST answer. Determine which action must occur before the others can be performed intelligently.",
        patternCards: [
          ["New regulation", "Determine affected processes / scope before choosing the response."],
          ["Weak compliance", "Assess the risk before changing policy or increasing enforcement."],
          ["Program after management commitment", "Assess risk to identify enterprise needs before strategy and tools."],
          ["Business case", "Define the need before objectives, cost, and cost-effectiveness."]
        ],
        calloutTitle: "Muscle-memory question",
        callout: "What information or decision must exist before the other answer choices make sense?",
        memoryRule: "FIRST = find the prerequisite for this lifecycle stage — not a universal keyword answer."
      },
      {
        type: "guided",
        name: "Guided Practice",
        kicker: "GUIDED DECODER",
        title: "Walk the question before answering.",
        body: "An information security manager learns that new regulations apply to the handling of sensitive data. What should the manager do FIRST?",
        decoder: [
          ["Situation", "New external requirement"],
          ["Qualifier", "FIRST"],
          ["Role", "Information security manager"],
          ["Need", "Understand scope and risk before choosing a response"],
          ["Ask yourself", "What must be known before management can decide how to respond?"]
        ],
        choices: [
          "Determine the processes and activities that may be affected",
          "Ask senior management how it wants to respond",
          "Determine whether the enterprise qualifies for an exemption",
          "Estimate the cost of compliance"
        ],
        correctIndex: 0,
        confidence: true,
        rationale: "The potential effects must be understood first. Management cannot choose a response, exemptions cannot be evaluated sensibly, and costs cannot be estimated until scope is known.",
        pattern: "FIRST + new requirement → establish affected scope before response.",
        memoryRule: "New requirement + FIRST → scope what is affected before choosing the response.",
        repair: {
          whyAttractive: "Escalating to management sounds appropriately managerial, while cost and exemptions sound business-focused.",
          correction: "Those actions need facts. CISM often places assessment or scoping before decision-making when the decision-makers do not yet have a basis for choosing.",
          transferQuestion: "A new privacy requirement may affect several business units. What should happen before selecting remediation controls?",
          transferChoices: ["Purchase a compliance tool", "Identify affected processes and resulting risk", "Request a policy exception", "Escalate the budget request"],
          transferCorrectIndex: 1
        }
      },
      {
        type: "independent",
        name: "Independent Practice",
        kicker: "INDEPENDENT",
        title: "No decoder this time.",
        body: "Which factor is MOST important for successful implementation of an enterprise information security program?",
        choices: [
          "Senior management support",
          "Budget for security activities",
          "Regular vulnerability assessments",
          "Knowledgeable security administrators"
        ],
        correctIndex: 0,
        confidence: true,
        rationale: "Management support enables governance, resources, authority, and organizational commitment. The other choices can contribute, but they are insufficient without that support.",
        pattern: "Enterprise program / governance success → management commitment is foundational.",
        memoryRule: "Enterprise program success → senior management support first.",
        repair: {
          whyAttractive: "Budget and skilled administrators are tangible resources and can feel more directly connected to implementation.",
          correction: "CISM asks for the enterprise-level enabler. Resources and technical skill can be ineffective when leadership has not provided authority, commitment, or organizational support.",
          transferQuestion: "A security steering committee exists but cannot get business units to follow its direction. What missing factor is MOST likely undermining governance?",
          transferChoices: ["More security tools", "Senior management involvement", "More vulnerability scans", "A larger security team"],
          transferCorrectIndex: 1
        }
      },
      {
        type: "independent",
        name: "Independent Practice",
        kicker: "INDEPENDENT",
        title: "Test the business-case pattern.",
        body: "Which action is MOST likely to persuade management to support an unfunded information security initiative?",
        choices: [
          "Present only the detailed risk assessment",
          "Describe the regulatory requirement",
          "Develop a complete business case",
          "Show technical security metrics"
        ],
        correctIndex: 2,
        confidence: true,
        rationale: "A complete business case gives management the broader decision context, including need, benefits, costs, risk, and business value. Individual inputs such as a risk assessment or metrics are not as persuasive by themselves.",
        pattern: "Need management support for investment → business case.",
        memoryRule: "Funding / executive support → package the decision in a business case.",
        repair: {
          whyAttractive: "Risk assessments and regulations are legitimate reasons to act and frequently appear in security decisions.",
          correction: "The question is about persuading management to invest. CISM favors the complete business decision package over one supporting input.",
          transferQuestion: "A CISO needs executive approval for a major security investment. Which deliverable best supports the decision?",
          transferChoices: ["A vulnerability list", "A complete business case", "A vendor comparison", "A technical architecture diagram"],
          transferCorrectIndex: 1
        }
      },
      {
        type: "close",
        name: "Close",
        kicker: "CUMULATIVE CLOSE",
        title: "Connect the patterns.",
        body: "Today’s foundation is not a list of answers. It is a decision lens you will reuse across all four domains.",
        summary: [
          "Business objectives and enterprise risk provide context.",
          "Security expertise does not automatically equal approval authority.",
          "FIRST questions often test prerequisites and sequence.",
          "Management support is foundational to enterprise governance and programs.",
          "A business case packages security into a management decision."
        ],
        calloutTitle: "Carry this forward",
        callout: "When two answers both look correct, ask which one fits the role, qualifier, business need, and lifecycle stage better.",
        memoryRule: "Role + qualifier + lifecycle + business = CISM judgment."
      }
    ]
  };

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
  }

  function renderMap(step) {
    if (!step.map) return "";
    return `<div class="study-map">${step.map.map((x, i) =>
      `<span class="${i === step.mapActive ? "active" : ""}">${escapeHTML(x)}</span>${i < step.map.length - 1 ? "<i>→</i>" : ""}`
    ).join("")}</div>`;
  }

  function renderCallout(step) {
    if (!step.callout) return "";
    return `<div class="study-callout"><strong>${escapeHTML(step.calloutTitle)}</strong><div>${escapeHTML(step.callout)}</div></div>`;
  }

  function renderMemoryRule(step) {
    if (!step.memoryRule) return "";
    return `<div class="study-memory-rule">
      <div class="memory-rule-icon">↳</div>
      <div>
        <span>MEMORY RULE</span>
        <strong>${escapeHTML(step.memoryRule)}</strong>
      </div>
    </div>`;
  }

  function renderCompare(step) {
    if (!step.compare) return "";
    return `<div class="compare-grid">${step.compare.map(([left, right]) =>
      `<div class="compare-row"><strong>${escapeHTML(left)}</strong><span>${escapeHTML(right)}</span></div>`
    ).join("")}</div>`;
  }

  function renderPatternCards(step) {
    if (!step.patternCards) return "";
    return `<div class="pattern-grid">${step.patternCards.map(([signal, response]) =>
      `<div class="pattern-card"><strong>${escapeHTML(signal)}</strong><span>${escapeHTML(response)}</span></div>`
    ).join("")}</div>`;
  }

  function renderDecoder(step) {
    if (!step.decoder) return "";
    return `<div class="decoder-grid">${step.decoder.map(([label, value]) =>
      `<div><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></div>`
    ).join("")}</div>`;
  }

  function renderChoices(step, attempt) {
    if (!step.choices) return "";
    const locked = attempt?.submitted;
    return `
      <div class="choice-list">
        ${step.choices.map((choice, i) => {
          let classes = "choice-button";
          if (attempt?.selectedIndex === i) classes += " selected";
          if (locked && i === step.correctIndex) classes += " correct-choice";
          if (locked && attempt.selectedIndex === i && i !== step.correctIndex) classes += " wrong-choice";
          return `<button class="${classes}" data-choice-index="${i}" type="button" ${locked ? "disabled" : ""}>
            <span class="choice-letter">${String.fromCharCode(65 + i)}</span>
            <span>${escapeHTML(choice)}</span>
          </button>`;
        }).join("")}
      </div>
      ${step.confidence ? renderConfidence(attempt, locked) : ""}
      ${attempt?.submitted ? renderFeedback(step, attempt) : `<button class="primary-button answer-button" id="submitAnswerButton" type="button" ${attempt?.selectedIndex == null ? "disabled" : ""}>Check answer <span>→</span></button>`}
    `;
  }

  function renderConfidence(attempt, locked) {
    return `
      <div class="confidence-block">
        <span>Confidence</span>
        <div class="confidence-options">
          ${["sure","not-sure","guessing"].map(v => `<button type="button" data-confidence="${v}" class="${attempt?.confidence === v ? "selected" : ""}" ${locked ? "disabled" : ""}>${v === "sure" ? "Sure" : v === "not-sure" ? "Not sure" : "Guessing"}</button>`).join("")}
        </div>
      </div>
    `;
  }

  function renderFeedback(step, attempt) {
    const correct = attempt.selectedIndex === step.correctIndex;
    return `
      <div class="answer-feedback ${correct ? "is-correct" : "needs-repair"}">
        <div class="feedback-kicker">${correct ? "CORRECT" : "LET’S REPAIR THE REASONING"}</div>
        <h3>${correct ? "That reasoning fits the CISM lens." : "The selected answer is understandable — but it skips the stronger CISM decision."}</h3>
        <p>${escapeHTML(step.rationale)}</p>
        <div class="feedback-pattern"><strong>Pattern</strong><span>${escapeHTML(step.pattern)}</span></div>
        ${step.memoryRule ? `<div class="feedback-memory"><strong>Memory rule</strong><span>${escapeHTML(step.memoryRule)}</span></div>` : ""}
        ${!correct && step.repair ? `
          <div class="repair-grid">
            <div><strong>Why the distractor can feel right</strong><p>${escapeHTML(step.repair.whyAttractive)}</p></div>
            <div><strong>Where the reasoning changes</strong><p>${escapeHTML(step.repair.correction)}</p></div>
          </div>
          <button class="secondary-button transfer-button" id="openTransferButton" type="button">Try a new scenario</button>
        ` : ""}
      </div>
    `;
  }

  function renderTransfer(step, transferAttempt) {
    if (!step.repair) return "";
    const r = step.repair;
    const locked = transferAttempt?.submitted;
    return `
      <article class="study-card">
        <div class="step-label">TRANSFER CHECK</div>
        <h2>Same concept. Different wording.</h2>
        <p>${escapeHTML(r.transferQuestion)}</p>
        <div class="choice-list">
          ${r.transferChoices.map((choice, i) => {
            let cls = "choice-button";
            if (transferAttempt?.selectedIndex === i) cls += " selected";
            if (locked && i === r.transferCorrectIndex) cls += " correct-choice";
            if (locked && transferAttempt.selectedIndex === i && i !== r.transferCorrectIndex) cls += " wrong-choice";
            return `<button class="${cls}" data-transfer-index="${i}" type="button" ${locked ? "disabled" : ""}>
              <span class="choice-letter">${String.fromCharCode(65+i)}</span><span>${escapeHTML(choice)}</span>
            </button>`;
          }).join("")}
        </div>
        ${locked ? `<div class="answer-feedback ${transferAttempt.selectedIndex === r.transferCorrectIndex ? "is-correct" : "needs-repair"}">
          <div class="feedback-kicker">${transferAttempt.selectedIndex === r.transferCorrectIndex ? "TRANSFER SUCCESS" : "KEEP THIS IN REVIEW"}</div>
          <h3>${transferAttempt.selectedIndex === r.transferCorrectIndex ? "You applied the concept in a new scenario." : "This concept will return in a future retrieval session."}</h3>
        </div>` : `<button class="primary-button answer-button" id="submitTransferButton" type="button" ${transferAttempt?.selectedIndex == null ? "disabled" : ""}>Check scenario <span>→</span></button>`}
      </article>
    `;
  }

  function renderStep(index, state) {
    const step = session.steps[index];
    if (state?.showTransfer && step.repair) return renderTransfer(step, state.transferAttempt || {});
    const summary = step.summary ? `<div class="summary-list">${step.summary.map(x => `<div><span>✓</span><strong>${escapeHTML(x)}</strong></div>`).join("")}</div>` : "";
    return `
      <article class="study-card">
        <div class="step-label">${escapeHTML(step.kicker)}</div>
        <h2>${escapeHTML(step.title)}</h2>
        <p>${escapeHTML(step.body)}</p>
        ${renderMap(step)}
        ${renderCompare(step)}
        ${renderPatternCards(step)}
        ${renderDecoder(step)}
        ${renderCallout(step)}
        ${renderMemoryRule(step)}
        ${summary}
        ${renderChoices(step, state?.attempt)}
      </article>
    `;
  }

  window.CISMStudy = { session, renderStep };
})();
