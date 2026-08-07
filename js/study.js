(function () {
  const steps = [
    {
      name: "Recall",
      kicker: "RETRIEVE",
      title: "Start with the management lens.",
      body: "CISM is not asking you to be the best engineer in the room. It is asking you to make the best management decision for the enterprise.",
      calloutTitle: "Ask first",
      callout: "What is the business trying to accomplish, and who actually owns this decision?"
    },
    {
      name: "Learn",
      kicker: "FOUNDATION",
      title: "Security supports the business.",
      body: "Your default perspective should be business objectives, enterprise risk, appropriate authority, and the correct stage of the process — not maximum security at any cost.",
      map: ["Business", "Governance", "Risk", "Program", "Incident"],
      mapActive: 0
    },
    {
      name: "Compare",
      kicker: "KNOW THE DIFFERENCE",
      title: "Recommend ≠ decide ≠ implement.",
      body: "A security manager may assess, recommend, coordinate, and enforce security responsibilities, while senior management and business owners retain important approval and risk decisions.",
      calloutTitle: "Role check",
      callout: "Working on something does not automatically mean you own the final business decision."
    },
    {
      name: "Pattern",
      kicker: "QUESTION PATTERN",
      title: "FIRST means: what prerequisite is missing?",
      body: "Do not memorize “FIRST = risk assessment.” Sometimes the missing prerequisite is understanding business requirements, sometimes assessment, and during an active incident it may be containment.",
      calloutTitle: "Muscle-memory prompt",
      callout: "What has to be true before the other answer choices make sense?"
    },
    {
      name: "Guided Practice",
      kicker: "GUIDED",
      title: "Which answer best fits the CISM perspective?",
      body: "A security initiative needs executive support. Which option is most likely to persuade senior management?",
      choices: [
        "A detailed explanation of technical vulnerabilities",
        "A business case connecting risk, value, and organizational objectives",
        "A list of security products used by peer organizations",
        "A technical architecture diagram"
      ],
      correctIndex: 1
    },
    {
      name: "Independent",
      kicker: "INDEPENDENT",
      title: "Now remove the training wheels.",
      body: "A new regulation affects sensitive data handling. What should the information security manager do FIRST?",
      choices: [
        "Estimate the implementation cost",
        "Ask senior management how they want to respond",
        "Determine which processes and activities may be affected",
        "Immediately implement compensating controls"
      ],
      correctIndex: 2
    },
    {
      name: "Close",
      kicker: "SESSION COMPLETE",
      title: "You have the first layer.",
      body: "Today you established the CISM lens: business first, correct authority, correct lifecycle stage, and qualifiers that test sequence or priority.",
      calloutTitle: "Next",
      callout: "Domain 1 will build on this with governance, senior management, business cases, roles, and regulatory decisions."
    }
  ];

  function renderStep(index) {
    const step = steps[index];
    const map = step.map
      ? `<div class="study-map">${step.map.map((x, i) => `<span class="${i === step.mapActive ? "active" : ""}">${x}</span>${i < step.map.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>`
      : "";

    const callout = step.callout
      ? `<div class="study-callout"><strong>${step.calloutTitle}</strong><div>${step.callout}</div></div>`
      : "";

    const choices = step.choices
      ? `<div class="choice-list">${step.choices.map((choice, i) => `<button class="choice-button" data-choice-index="${i}" type="button">${choice}</button>`).join("")}</div>`
      : "";

    return `
      <article class="study-card">
        <div class="step-label">${step.kicker}</div>
        <h2>${step.title}</h2>
        <p>${step.body}</p>
        ${map}
        ${callout}
        ${choices}
      </article>
    `;
  }

  window.CISMStudy = {
    steps,
    renderStep
  };
})();
