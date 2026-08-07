(function () {
  const MIXED = {
    sessionSize: 12,
    dimensions: {
      qualifier: ["FIRST", "NEXT", "BEST", "MOST", "PRIMARY", "NONE"],
      role: ["Senior management", "Security manager", "Business/data owner", "Custodian/operations", "Internal audit", "Incident response team", "None/implicit"],
      lifecycle: ["Governance", "Risk assessment/evaluation", "Risk treatment/acceptance", "Security program", "Incident response", "Continuity/recovery", "Post-incident/improvement"],
      decision: ["Business decision", "Risk decision", "Program/control decision", "Incident decision", "Recovery decision"]
    },

    questions: [
      {
        id: "MIX-D1-001",
        domain: 1,
        concept: "Business objectives",
        pattern: "Business outcome over technical activity",
        qualifier: "MOST",
        role: "Security manager",
        lifecycle: "Governance",
        decision: "Business decision",
        memory: "Security strategy exists to support organizational objectives.",
        stem: "When reviewing an information security strategy, what is the MOST important consideration?",
        options: [
          "Maximum use of available security technology",
          "Alignment with organizational objectives",
          "Elimination of all residual risk",
          "Adoption of the strictest available controls"
        ],
        correctIndex: 1,
        rationale: "The supplied governance material repeatedly frames information security strategy and governance around business objectives and enterprise needs rather than technology for its own sake."
      },
      {
        id: "MIX-D1-002",
        domain: 1,
        concept: "Business case",
        pattern: "Need management support for investment → business case",
        qualifier: "BEST",
        role: "Security manager",
        lifecycle: "Governance",
        decision: "Business decision",
        memory: "Funding / executive support → business case.",
        stem: "A security initiative is not funded in the current budget. Which deliverable BEST supports management approval?",
        options: [
          "A vulnerability list",
          "A complete business case",
          "A product comparison",
          "A technical architecture diagram"
        ],
        correctIndex: 1,
        rationale: "A complete business case integrates the need, business value, risk, cost, and feasibility into the decision context management needs."
      },
      {
        id: "MIX-D1-003",
        domain: 1,
        concept: "Regulatory sequencing",
        pattern: "FIRST = establish scope before response",
        qualifier: "FIRST",
        role: "Security manager",
        lifecycle: "Governance",
        decision: "Business decision",
        memory: "New requirement + FIRST → determine what is affected before choosing the response.",
        stem: "A new regulation applies to the handling of sensitive information. What should the information security manager do FIRST?",
        options: [
          "Estimate the cost of compliance",
          "Determine affected processes and activities",
          "Implement compensating controls",
          "Ask management to choose a response"
        ],
        correctIndex: 1,
        rationale: "The affected scope must be understood before cost, remediation, or management response can be determined."
      },
      {
        id: "MIX-D1-004",
        domain: 1,
        concept: "Policy hierarchy",
        pattern: "Policy direction → standard boundary → procedure steps",
        qualifier: "NONE",
        role: "Security manager",
        lifecycle: "Security program",
        decision: "Program/control decision",
        memory: "Policy = direction. Standard = mandatory boundary. Procedure = steps.",
        stem: "Which document most directly sets mandatory allowable boundaries so detailed procedures remain aligned with policy?",
        options: ["Policy", "Standard", "Procedure", "Guideline"],
        correctIndex: 1,
        rationale: "Standards translate policy intent into mandatory boundaries that procedures must follow."
      },

      {
        id: "MIX-D2-001",
        domain: 2,
        concept: "Residual risk",
        pattern: "Residual risk → validate acceptability",
        qualifier: "NEXT",
        role: "Security manager",
        lifecycle: "Risk treatment/acceptance",
        decision: "Risk decision",
        memory: "Residual risk → validate acceptability → formal decision.",
        stem: "Risk treatment has been implemented and residual risk has been determined. What should happen NEXT?",
        options: [
          "Formally accept it immediately",
          "Validate whether the residual risk is acceptable",
          "Run a vulnerability scan",
          "Transfer the risk automatically"
        ],
        correctIndex: 1,
        rationale: "The next step is to determine whether the remaining risk is within the organization's acceptable range before formal acceptance or more treatment."
      },
      {
        id: "MIX-D2-002",
        domain: 2,
        concept: "Risk treatment",
        pattern: "Insurance → transfer",
        qualifier: "NONE",
        role: "Business/data owner",
        lifecycle: "Risk treatment/acceptance",
        decision: "Risk decision",
        memory: "Insurance → transfer.",
        stem: "An organization purchases insurance to reduce the financial consequences of a security event. Which response is this?",
        options: ["Accept", "Mitigate", "Transfer", "Avoid"],
        correctIndex: 2,
        rationale: "Insurance shifts financial consequences to another party and is a classic risk-transfer mechanism."
      },
      {
        id: "MIX-D2-003",
        domain: 2,
        concept: "Risk reassessment",
        pattern: "Material change → reassess risk",
        qualifier: "BEST",
        role: "Security manager",
        lifecycle: "Risk assessment/evaluation",
        decision: "Risk decision",
        memory: "Material change → reassess risk assumptions.",
        stem: "A significant technology change alters the effectiveness of existing controls. What is the BEST response?",
        options: [
          "Wait for the annual audit",
          "Reassess the risk",
          "Rewrite all policies",
          "Accept the new exposure automatically"
        ],
        correctIndex: 1,
        rationale: "A material change can invalidate prior risk assumptions, so reassessment is needed."
      },
      {
        id: "MIX-D2-004",
        domain: 2,
        concept: "Acceptable risk",
        pattern: "CISM targets acceptable risk, not zero risk",
        qualifier: "PRIMARY",
        role: "Senior management",
        lifecycle: "Risk treatment/acceptance",
        decision: "Risk decision",
        memory: "Risk management aims for acceptable risk — not zero risk.",
        stem: "The PRIMARY goal of an effective risk management program is to reduce risk to:",
        options: [
          "Zero",
          "An acceptable level",
          "The lowest technically possible level",
          "A fixed percentage of revenue"
        ],
        correctIndex: 1,
        rationale: "The source material treats acceptable risk as the practical risk-management target."
      },

      {
        id: "MIX-D3-001",
        domain: 3,
        concept: "Data owner vs custodian",
        pattern: "Owner decides → custodian implements",
        qualifier: "NONE",
        role: "Business/data owner",
        lifecycle: "Security program",
        decision: "Program/control decision",
        memory: "Owner decides → custodian implements.",
        stem: "A database administrator maintains and protects finance data. Who should determine the classification of that data?",
        options: [
          "Database administrator",
          "Finance/data owner",
          "Security analyst",
          "Internal audit"
        ],
        correctIndex: 1,
        rationale: "The owner determines classification based on business value and impact; the custodian implements the required protections."
      },
      {
        id: "MIX-D3-002",
        domain: 3,
        concept: "Authentication vs authorization",
        pattern: "Authentication = who; authorization = what",
        qualifier: "BEST",
        role: "Security manager",
        lifecycle: "Security program",
        decision: "Program/control decision",
        memory: "Authentication = who. Authorization = what.",
        stem: "A supplier has successfully authenticated but must be prevented from modifying certain records. Which control is BEST suited to the remaining problem?",
        options: [
          "Authentication",
          "Authorization / access rights",
          "Password complexity",
          "Identity proofing"
        ],
        correctIndex: 1,
        rationale: "Identity is already established. The remaining issue is what the authenticated identity is permitted to do."
      },
      {
        id: "MIX-D3-003",
        domain: 3,
        concept: "Asset classification",
        pattern: "Classification follows business impact",
        qualifier: "FIRST",
        role: "Security manager",
        lifecycle: "Security program",
        decision: "Program/control decision",
        memory: "Before classifying → understand business impact.",
        stem: "What should be established FIRST before assigning an information asset classification?",
        options: [
          "Threat intelligence",
          "Business impact / criticality",
          "The current firewall configuration",
          "The penetration-testing schedule"
        ],
        correctIndex: 1,
        rationale: "Classification should reflect business value, criticality, sensitivity, and potential impact."
      },
      {
        id: "MIX-D3-004",
        domain: 3,
        concept: "Control types",
        pattern: "Prevent = stop; detect = see",
        qualifier: "MOST",
        role: "Security manager",
        lifecycle: "Security program",
        decision: "Program/control decision",
        memory: "Prevent = stop. Detect = see. Correct = fix.",
        stem: "Which control is MOST clearly detective rather than preventive?",
        options: [
          "Role-based access control",
          "Security event logging",
          "Least privilege",
          "Approval workflow"
        ],
        correctIndex: 1,
        rationale: "Logging identifies activity after or as it occurs; it does not itself prevent the action."
      },

      {
        id: "MIX-D4-001",
        domain: 4,
        concept: "Containment",
        pattern: "Active + spreading → contain",
        qualifier: "FIRST",
        role: "Incident response team",
        lifecycle: "Incident response",
        decision: "Incident decision",
        memory: "Active + spreading → contain.",
        stem: "A server is confirmed infected and malicious activity may spread. What should the incident response team do FIRST?",
        options: [
          "Perform root-cause analysis",
          "Isolate the affected server",
          "Restore from backup",
          "Write the post-incident report"
        ],
        correctIndex: 1,
        rationale: "Containment limits additional damage and spread. Root-cause analysis and recovery occur later."
      },
      {
        id: "MIX-D4-002",
        domain: 4,
        concept: "RTO vs RPO",
        pattern: "Data loss → RPO; restore time → RTO",
        qualifier: "NONE",
        role: "Business/data owner",
        lifecycle: "Continuity/recovery",
        decision: "Recovery decision",
        memory: "Data loss → RPO. Restore time → RTO.",
        stem: "The business can tolerate losing no more than 30 minutes of transaction data. Which recovery objective is being defined?",
        options: ["RTO", "RPO", "SDO", "MTO"],
        correctIndex: 1,
        rationale: "RPO addresses acceptable data loss and the point in time to which data must be recoverable."
      },
      {
        id: "MIX-D4-003",
        domain: 4,
        concept: "BIA",
        pattern: "Recovery priority / downtime impact → BIA",
        qualifier: "BEST",
        role: "Security manager",
        lifecycle: "Continuity/recovery",
        decision: "Recovery decision",
        memory: "Recovery priority / downtime impact → BIA.",
        stem: "The enterprise needs to determine which business functions must recover first and how damaging downtime becomes over time. Which activity BEST provides that information?",
        options: [
          "Vulnerability assessment",
          "Business impact analysis",
          "Penetration test",
          "Root-cause analysis"
        ],
        correctIndex: 1,
        rationale: "BIA identifies critical functions, disruption impact, recovery priorities, and recovery requirements."
      },
      {
        id: "MIX-D4-004",
        domain: 4,
        concept: "Evidence integrity",
        pattern: "Forensic copy → hash → prove integrity",
        qualifier: "NEXT",
        role: "Incident response team",
        lifecycle: "Incident response",
        decision: "Incident decision",
        memory: "Forensic copy → hash → prove integrity.",
        stem: "Primary and backup forensic disk images have been created. What should be done NEXT to establish authenticity?",
        options: [
          "Encrypt the images",
          "Create a third image",
          "Generate hashes",
          "Begin post-incident reporting"
        ],
        correctIndex: 2,
        rationale: "Hashes are used to demonstrate that the working copy remains identical to the reference image."
      },

      {
        id: "MIX-X-001",
        domain: 1,
        concept: "Senior management support",
        pattern: "Enterprise program success → management commitment",
        qualifier: "MOST",
        role: "Senior management",
        lifecycle: "Governance",
        decision: "Business decision",
        memory: "Enterprise program success → senior management support first.",
        stem: "Which factor is MOST important for successful implementation of an enterprise information security program?",
        options: [
          "Senior management support",
          "More vulnerability assessments",
          "A larger security team",
          "A new SIEM platform"
        ],
        correctIndex: 0,
        rationale: "Management support provides enterprise authority, commitment, resources, and organizational alignment."
      },
      {
        id: "MIX-X-002",
        domain: 2,
        concept: "Cost-benefit treatment",
        pattern: "Treatment choice + cost question → cost-benefit",
        qualifier: "BEST",
        role: "Security manager",
        lifecycle: "Risk treatment/acceptance",
        decision: "Risk decision",
        memory: "Control economics → cost versus risk reduction.",
        stem: "A proposed mitigation control is expensive and the business impact of the vulnerability is low. Which analysis BEST supports the decision?",
        options: [
          "Business impact analysis",
          "Cost-benefit analysis",
          "Root-cause analysis",
          "Forensic analysis"
        ],
        correctIndex: 1,
        rationale: "Cost-benefit analysis compares control cost with expected risk reduction."
      },
      {
        id: "MIX-X-003",
        domain: 3,
        concept: "Policy exceptions",
        pattern: "Policy approver → exception authority",
        qualifier: "NONE",
        role: "Senior management",
        lifecycle: "Security program",
        decision: "Program/control decision",
        memory: "Policy approver → exception authority.",
        stem: "Who has inherent authority to grant an exception to an information security policy?",
        options: [
          "Business process owner",
          "Department manager",
          "Policy approver",
          "Security analyst"
        ],
        correctIndex: 2,
        rationale: "The authority to approve policy includes authority to approve exceptions to that policy."
      },
      {
        id: "MIX-X-004",
        domain: 4,
        concept: "IRP vs BCP vs DRP",
        pattern: "Breach handling → IRP",
        qualifier: "BEST",
        role: "Incident response team",
        lifecycle: "Incident response",
        decision: "Incident decision",
        memory: "Breach handling → IRP. Business continuity → BCP. Technology recovery → DRP.",
        stem: "Which plan BEST provides roles and step-by-step processes for handling an information security breach?",
        options: [
          "Business continuity plan",
          "Disaster recovery plan",
          "Incident response plan",
          "Vulnerability management plan"
        ],
        correctIndex: 2,
        rationale: "The incident response plan defines the incident-handling process and assigned responsibilities."
      }
    ]
  };

  window.CISMMixedPractice = MIXED;
})();
