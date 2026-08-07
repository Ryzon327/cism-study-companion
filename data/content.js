(function () {
  const CONTENT = {
    universalPatterns: [
      {
        id: "U-BUSINESS-FIRST",
        title: "Business outcome over technical activity",
        signal: "Choices mix technical security with business objectives, impact, value, or criticality.",
        ask: "Which answer best supports the enterprise objective or manages business risk?",
        trap: "Choosing the most technical or restrictive answer because it sounds more secure.",
        rule: "CISM repeatedly treats security as an enabler of organizational objectives."
      },
      {
        id: "U-RIGHT-ROLE",
        title: "Right action, right authority",
        signal: "Several roles could reasonably participate in the scenario.",
        ask: "Who recommends, who decides, who implements, and who independently verifies?",
        trap: "Giving final business authority to the person with the most security expertise.",
        rule: "Expertise does not automatically equal decision ownership."
      },
      {
        id: "U-FIRST",
        title: "FIRST = missing prerequisite",
        signal: "The stem asks FIRST or NEXT.",
        ask: "What must be known, authorized, contained, or completed before the other choices make sense?",
        trap: "Always choosing risk assessment just because the question says FIRST.",
        rule: "Sequence depends on lifecycle stage."
      },
      {
        id: "U-BEST",
        title: "BEST = most complete fit",
        signal: "Multiple choices are technically true.",
        ask: "Which answer most directly and completely solves the management problem?",
        trap: "Selecting a valid supporting activity instead of the broader management answer.",
        rule: "Correct statement does not automatically mean best answer."
      },
      {
        id: "U-PRIMARY",
        title: "PRIMARY = fundamental purpose",
        signal: "The stem asks PRIMARY, MAIN, or MOST important.",
        ask: "Why does this activity, process, or document fundamentally exist?",
        trap: "Choosing a secondary benefit.",
        rule: "Separate the core purpose from useful side effects."
      },
      {
        id: "U-PROPORTIONAL",
        title: "Appropriate security, not maximum security",
        signal: "Choices vary in strength, cost, or disruption to the business.",
        ask: "Which response is proportionate to risk, business value, and enterprise need?",
        trap: "Assuming stronger controls are always better.",
        rule: "CISM targets acceptable risk, not zero risk."
      },
      {
        id: "U-CHANGE",
        title: "Material change → reconsider assumptions",
        signal: "Technology, threat, controls, business process, or environment changes.",
        ask: "Does the prior risk decision still hold?",
        trap: "Treating risk decisions as permanent.",
        rule: "Meaningful change can trigger reassessment."
      },
      {
        id: "U-LIFE-SAFETY",
        title: "People first",
        signal: "A physical emergency creates a conflict between people and information/assets.",
        ask: "What protects human life and safety first?",
        trap: "Prioritizing data, infrastructure, or recovery over people.",
        rule: "Human safety outranks information protection."
      }
    ],

    domains: {
      "1": {
        name: "Information Security Governance",
        shortName: "Governance",
        story: "What is the business trying to accomplish, who directs security, and how are security decisions aligned with enterprise objectives?",
        lifecycle: [
          "Business objectives",
          "Governance & authority",
          "Risk direction",
          "Security strategy",
          "Business case / approval",
          "Policies & framework",
          "Measure & improve"
        ],
        concepts: [
          {
            id: "D1-BUSINESS-OBJECTIVES",
            title: "Business objectives drive security",
            status: "core",
            plain: "Governance and security strategy begin with what the enterprise is trying to achieve.",
            exam: "When governance, strategy, or alignment is being established, business objectives usually sit above technical concerns.",
            prerequisites: []
          },
          {
            id: "D1-GOVERNANCE-MANAGEMENT",
            title: "Governance vs management",
            status: "core",
            plain: "Governance provides direction, accountability, and oversight. Management executes within that direction.",
            exam: "Look for senior-level direction and oversight when the stem is about governance; look for execution when it is about management."
          },
          {
            id: "D1-AUTHORITY",
            title: "Roles, authority & accountability",
            status: "core",
            plain: "Board/senior management, steering committees, security managers, owners, custodians, audit, and legal have different decision rights.",
            exam: "CISM frequently tests whether the correct action is assigned to the correct role."
          },
          {
            id: "D1-STRATEGY",
            title: "Information security strategy",
            status: "core",
            plain: "The strategy translates enterprise objectives and risk direction into security priorities.",
            exam: "Supporting business objectives is a stronger strategy driver than technology for its own sake."
          },
          {
            id: "D1-BUSINESS-CASE",
            title: "Business case",
            status: "core",
            plain: "A business case packages the need, value, cost, risk, feasibility, and organizational alignment into a management decision.",
            exam: "For management support or investment approval, a complete business case often beats a single risk, cost, or technical analysis."
          },
          {
            id: "D1-CHARTER-ROADMAP",
            title: "Charter, roadmap & plan",
            status: "distinguish",
            plain: "A charter establishes authority; a roadmap/plan explains how the approved direction will be executed.",
            exam: "Do not confuse justification, authorization, and execution planning."
          },
          {
            id: "D1-FRAMEWORK",
            title: "Governance framework",
            status: "recognize",
            plain: "A framework gives structure for integrating governance and the security program with business processes.",
            exam: "A framework is broader than one process or guideline."
          },
          {
            id: "D1-LEGAL",
            title: "Legal, regulatory & contractual requirements",
            status: "core",
            plain: "Requirements must be evaluated for applicability, impact, enforcement, and organizational response.",
            exam: "New requirements commonly trigger scoping/gap work before remediation decisions."
          }
        ],
        comparisons: [
          {
            title: "Governance vs Management",
            left: ["Governance", "Direction, accountability, oversight, alignment"],
            right: ["Management", "Execution, operation, implementation"],
            memory: "Governance asks where and why. Management asks how."
          },
          {
            title: "Security Manager vs Senior Management",
            left: ["Security manager", "Assess, advise, recommend, coordinate"],
            right: ["Senior management", "Approve direction, arbitrate business conflicts, accept major business decisions"],
            memory: "Security informs the decision; business authority owns the decision."
          },
          {
            title: "Business Case vs Charter vs Plan",
            items: [
              ["Business case", "Why should we invest?"],
              ["Charter", "Who/what is formally authorized?"],
              ["Plan / roadmap", "How and when will we execute?"]
            ],
            memory: "Why → authority → how."
          },
          {
            title: "Policy hierarchy",
            items: [
              ["Policy", "High-level management direction"],
              ["Standard", "Mandatory requirement / minimum expectation"],
              ["Baseline", "Minimum or uniform configuration"],
              ["Procedure", "Step-by-step execution"],
              ["Guideline", "Recommended, flexible guidance"]
            ],
            memory: "Direction becomes increasingly specific as you move downward."
          }
        ],
        patterns: [
          ["Governance begins", "Start with organizational/business objectives."],
          ["Need senior support", "Translate security into business objectives, risk, value, and desired outcomes."],
          ["Unfunded initiative", "Use a complete business case rather than one supporting analysis."],
          ["Business case FIRST", "Define the issue/need before objectives, cost, or cost-effectiveness."],
          ["New regulation FIRST", "Determine affected processes/scope or gap before selecting remediation."],
          ["Cross-unit conflict", "Escalate with recommendations to senior management for enterprise arbitration."],
          ["Classification responsibility", "Owner assigns classification; security defines the framework; custodian protects."],
          ["Physical control conflict", "Life safety has priority."]
        ]
      },

      "2": {
        name: "Information Security Risk Management",
        shortName: "Risk Management",
        story: "What could affect the enterprise, how significant is it, what level is acceptable, and what response should be selected?",
        lifecycle: [
          "Identify assets",
          "Identify threats / vulnerabilities",
          "Assess likelihood & impact",
          "Evaluate against criteria",
          "Select treatment",
          "Determine residual risk",
          "Accept / approve",
          "Monitor & reassess"
        ],
        concepts: [
          {
            id: "D2-ASSETS",
            title: "Assets & business value",
            status: "core",
            plain: "Risk assessment begins with understanding what matters to the business.",
            exam: "Asset criticality and business impact provide context for risk decisions."
          },
          {
            id: "D2-RISK-BUILDING-BLOCKS",
            title: "Threat, vulnerability, likelihood & impact",
            status: "core",
            plain: "These are distinct inputs used to understand risk.",
            exam: "Do not treat a vulnerability by itself as proof that a particular treatment is justified."
          },
          {
            id: "D2-ASSESSMENT",
            title: "Risk assessment & evaluation",
            status: "core",
            plain: "Assessment identifies/analyzes risk; evaluation compares it with criteria and supports response decisions.",
            exam: "Risk evaluation provides a basis for selecting a response."
          },
          {
            id: "D2-QUAL-QUANT",
            title: "Qualitative vs quantitative",
            status: "distinguish",
            plain: "Qualitative is useful for impacts that do not lend themselves cleanly to money; quantitative is useful when impacts can be measured numerically.",
            exam: "Customer trust/goodwill often fits qualitative reasoning better than directly measurable losses."
          },
          {
            id: "D2-APPETITE-TOLERANCE",
            title: "Risk appetite & tolerance",
            status: "core",
            plain: "These enterprise-level boundaries guide what levels of risk the organization is prepared to accept.",
            exam: "Risk appetite/tolerance strongly influence security strategy and treatment decisions."
          },
          {
            id: "D2-INHERENT-RESIDUAL",
            title: "Inherent vs residual risk",
            status: "core",
            plain: "Inherent risk exists before controls; residual risk remains after the chosen response/controls.",
            exam: "After treatment, determine what remains and whether it is acceptable."
          },
          {
            id: "D2-TREATMENT",
            title: "Accept, mitigate, transfer, avoid",
            status: "core",
            plain: "These are response options selected after risk is understood and evaluated.",
            exam: "Insurance is a classic transfer example; mitigation applies controls; avoidance stops the risky activity."
          },
          {
            id: "D2-KRI",
            title: "KRIs & risk monitoring",
            status: "core",
            plain: "KRIs are predictive signals that risk may be developing or changing.",
            exam: "For ongoing timely senior-management decisions on current risk, KRIs tied to critical business assets are powerful."
          }
        ],
        comparisons: [
          {
            title: "Threat vs Vulnerability vs Impact vs Risk",
            items: [
              ["Threat", "Something capable of causing harm"],
              ["Vulnerability", "A weakness that can be exploited"],
              ["Impact", "Business consequence if the event occurs"],
              ["Risk", "The resulting exposure considered with likelihood/impact"]
            ],
            memory: "Threat acts on weakness → consequence → risk decision."
          },
          {
            title: "Risk Appetite vs Risk Tolerance",
            left: ["Risk appetite", "Enterprise-level amount/type of risk it is prepared to pursue or accept"],
            right: ["Risk tolerance", "Acceptable variation around defined risk expectations"],
            memory: "Appetite sets direction; tolerance defines acceptable variation."
          },
          {
            title: "Inherent vs Residual Risk",
            left: ["Inherent", "Before controls/treatment"],
            right: ["Residual", "Remaining after controls/treatment"],
            memory: "Before → controls → after."
          },
          {
            title: "Risk responses",
            items: [
              ["Accept", "Knowingly retain the risk"],
              ["Mitigate", "Reduce likelihood and/or impact"],
              ["Transfer", "Shift financial/contractual consequences to another party"],
              ["Avoid", "Stop the activity creating the risk"]
            ],
            memory: "Keep it, reduce it, share it, or stop it."
          },
          {
            title: "Risk assessment vs Risk treatment",
            left: ["Assessment", "Understand and evaluate the risk"],
            right: ["Treatment", "Choose what to do about the evaluated risk"],
            memory: "Understand before responding."
          }
        ],
        patterns: [
          ["Different departments rate risk differently", "Use common risk measurement criteria."],
          ["Risk response decision", "Evaluate the risk against acceptance criteria before selecting treatment."],
          ["Residual risk remains", "Validate whether it is acceptable to the appropriate management/business authority."],
          ["Insurance", "Think risk transfer when the scenario is about shifting financial impact."],
          ["Low-impact issue + mitigation decision", "Cost-benefit analysis helps determine whether control cost is justified."],
          ["Current evolving risk for executives", "KRIs provide early warning and decision support."],
          ["Meaningful environmental/control change", "Reassess risk assumptions."],
          ["Security involvement in change management", "Ensure proposed changes do not adversely change the risk posture."]
        ]
      },

      "3": {
        name: "Information Security Program",
        shortName: "Security Program",
        story: "How do strategy and risk decisions become an operating security program, protection requirements, controls, and measurable outcomes?",
        lifecycle: [
          "Strategy & objectives",
          "Resources & responsibilities",
          "Identify / own assets",
          "Classify by business value",
          "Define protection",
          "Select / implement controls",
          "Operate & communicate",
          "Measure & improve"
        ],
        concepts: [
          {
            id: "D3-PROGRAM",
            title: "Strategy → security program",
            status: "core",
            plain: "The program operationalizes the security strategy.",
            exam: "Senior leadership support is a critical enabler for major program creation or change."
          },
          {
            id: "D3-RESOURCES",
            title: "Program resources",
            status: "recognize",
            plain: "People, skills, tools, technology, and external expertise enable the program.",
            exam: "Resources matter, but leadership support and business alignment often sit above individual resource questions."
          },
          {
            id: "D3-OWNERSHIP",
            title: "Data owner vs custodian",
            status: "core",
            plain: "The owner makes business decisions about classification and access; the custodian implements and operates protection.",
            exam: "The person physically maintaining data is not automatically the owner."
          },
          {
            id: "D3-CLASSIFICATION",
            title: "Classification, criticality & sensitivity",
            status: "core",
            plain: "Classification should reflect business value, sensitivity, and impact so protection can be proportionate.",
            exam: "Replacement cost alone is not the same as business impact."
          },
          {
            id: "D3-POLICY",
            title: "Policy, standards, baselines, procedures & guidelines",
            status: "core",
            plain: "These documents translate management direction into increasingly specific expectations and execution.",
            exam: "Policies are high-level and less likely to change with technology; standards/procedures are more operational."
          },
          {
            id: "D3-CONTROLS",
            title: "Control objectives & control types",
            status: "core",
            plain: "Controls should be selected because they address the identified risk and required protection objective.",
            exam: "Detective controls do not prevent; preventive controls do not necessarily prove an event occurred."
          },
          {
            id: "D3-ACCESS",
            title: "Authentication, authorization & least privilege",
            status: "core",
            plain: "Authentication establishes identity; authorization determines allowed actions; least privilege restricts access to what is needed.",
            exam: "A user can authenticate successfully and still be unauthorized for a particular action."
          },
          {
            id: "D3-RETENTION",
            title: "Retention & handling",
            status: "distinguish",
            plain: "Retention policies define how long records are kept and what occurs at the end of retention.",
            exam: "Retention questions are distinct from classification and acceptable-use questions."
          }
        ],
        comparisons: [
          {
            title: "Data Owner vs Custodian",
            left: ["Data owner", "Determines classification, business access requirements, acceptable use"],
            right: ["Custodian", "Implements and operates required protections"],
            memory: "Owner decides; custodian does."
          },
          {
            title: "Criticality vs Sensitivity",
            left: ["Criticality", "How essential the asset/process is to business operations"],
            right: ["Sensitivity", "How harmful unauthorized disclosure/use could be"],
            memory: "Can we operate without it? vs What happens if it is exposed?"
          },
          {
            title: "Authentication vs Authorization",
            left: ["Authentication", "Who are you?"],
            right: ["Authorization", "What are you allowed to do?"],
            memory: "Identity first, permissions second."
          },
          {
            title: "Policy vs Standard vs Baseline vs Procedure vs Guideline",
            items: [
              ["Policy", "Management direction"],
              ["Standard", "Mandatory requirement"],
              ["Baseline", "Minimum/uniform configuration"],
              ["Procedure", "Steps to perform"],
              ["Guideline", "Recommended approach"]
            ],
            memory: "Direction → mandatory detail → minimum configuration → steps / advice."
          },
          {
            title: "Preventive vs Detective vs Corrective",
            items: [
              ["Preventive", "Stops or reduces the chance of the event"],
              ["Detective", "Identifies that an event occurred/is occurring"],
              ["Corrective", "Repairs/restores after the event"]
            ],
            memory: "Stop → see → fix."
          }
        ],
        patterns: [
          ["Major program change", "Secure senior leadership support before expecting resources and broad adoption."],
          ["Who classifies data?", "Data/information owner."],
          ["Who secures data according to classification?", "Custodian/operational role."],
          ["Policy exception", "Authority belongs to the policy approver/appropriate authority; exception must be risk-justified."],
          ["Technology changes", "Policies change less often than standards/procedures/guidelines."],
          ["Need to prevent an action", "Choose a preventive control, not merely logging/monitoring."],
          ["Successful authentication but action must be blocked", "Think authorization/access rights."],
          ["Retention/destruction question", "Look to the retention policy."]
        ]
      },

      "4": {
        name: "Incident Management",
        shortName: "Incident Management",
        story: "When something goes wrong, how do we limit impact, preserve evidence, continue critical business operations, recover, and improve?",
        lifecycle: [
          "Prepare",
          "Detect / analyze",
          "Contain",
          "Eradicate",
          "Recover",
          "Communicate",
          "Post-incident review",
          "Improve"
        ],
        continuityLifecycle: [
          "Business criticality",
          "BIA",
          "Recovery requirements",
          "Recovery strategy",
          "BCP / DRP",
          "Test",
          "Find gaps",
          "Improve"
        ],
        concepts: [
          {
            id: "D4-IRP",
            title: "Incident response plan & roles",
            status: "core",
            plain: "The plan establishes how incidents are handled, classified, escalated, communicated, contained, eradicated, and recovered.",
            exam: "When an incident is reported, initiating the established response process may precede isolated technical actions."
          },
          {
            id: "D4-CONTAINMENT",
            title: "Containment",
            status: "core",
            plain: "Containment limits or reduces additional impact from an active incident.",
            exam: "Confirmed spreading malware commonly triggers isolation before deeper investigation or recovery."
          },
          {
            id: "D4-EVIDENCE",
            title: "Evidence preservation",
            status: "core",
            plain: "Evidence integrity must be protected so investigation results remain reliable.",
            exam: "Hashing forensic images is used to demonstrate integrity; evidence handling must be balanced with containment."
          },
          {
            id: "D4-ERADICATION-RECOVERY",
            title: "Eradication vs recovery",
            status: "core",
            plain: "Eradication removes the threat/cause; recovery restores safe business operations.",
            exam: "Restoring too early can reintroduce the problem or destroy useful evidence."
          },
          {
            id: "D4-BIA",
            title: "Business Impact Analysis",
            status: "core",
            plain: "BIA determines impact of disruption, critical processes, priorities, and recovery requirements.",
            exam: "When the question is about recovery priority or downtime impact, BIA is often central."
          },
          {
            id: "D4-BCP-DRP",
            title: "BCP vs DRP",
            status: "core",
            plain: "BCP focuses on continuing critical business functions; DRP focuses on restoring technology, systems, and data.",
            exam: "Do not treat technology restoration alone as proof that business continuity works."
          },
          {
            id: "D4-RECOVERY-OBJECTIVES",
            title: "RTO, RPO, AIW, MTO & SDO",
            status: "core",
            plain: "These recovery measurements answer different questions about time, data loss, interruption, alternate-mode operation, and service level.",
            exam: "CISM repeatedly places these terms beside each other."
          },
          {
            id: "D4-TESTING",
            title: "BCP / DRP testing",
            status: "core",
            plain: "Testing validates whether plans, people, technology, and end-to-end business processes can meet requirements.",
            exam: "Testing should expose gaps and prove business-process capability, not just that servers boot."
          },
          {
            id: "D4-COMMS",
            title: "Incident communications & escalation",
            status: "distinguish",
            plain: "Communication must go to the correct internal/external parties through authorized channels and escalation levels.",
            exam: "Data owners may need early notification to determine business impact; media communication should be controlled by authorized messaging."
          },
          {
            id: "D4-POST",
            title: "Post-incident review & root cause",
            status: "core",
            plain: "After recovery, determine why the incident occurred, what worked, what failed, and what must improve.",
            exam: "Do not confuse post-incident learning with active containment."
          }
        ],
        comparisons: [
          {
            title: "Containment vs Eradication vs Recovery",
            items: [
              ["Containment", "Limit spread/impact now"],
              ["Eradication", "Remove the threat/cause"],
              ["Recovery", "Restore safe operations"]
            ],
            memory: "Stop it → remove it → restore."
          },
          {
            title: "Incident Response vs BCP vs DRP",
            items: [
              ["Incident response", "Handle the security incident"],
              ["BCP", "Keep critical business functions operating"],
              ["DRP", "Restore technology, systems, and data"]
            ],
            memory: "Handle → continue business → restore technology."
          },
          {
            title: "Risk Assessment vs BIA",
            left: ["Risk assessment", "What might happen? likelihood + impact + exposure"],
            right: ["BIA", "If disruption occurs, what is the business impact over time and what must recover first?"],
            memory: "Risk looks at possible events; BIA focuses on disruption consequences and recovery priorities."
          },
          {
            title: "RTO vs RPO",
            left: ["RTO", "How quickly must the function/resource be restored?"],
            right: ["RPO", "How much data loss is acceptable?"],
            memory: "Time to restore vs point in time/data loss."
          },
          {
            title: "AIW vs MTO vs SDO",
            items: [
              ["AIW", "Maximum interruption window before unacceptable business damage"],
              ["MTO", "Maximum time the enterprise can support processing in alternate mode (per source wording)"],
              ["SDO", "Acceptable service level while operating in alternate mode"]
            ],
            memory: "Interruption boundary → alternate-mode duration → alternate-mode service level."
          },
          {
            title: "Recovery sites",
            items: [
              ["Hot", "High readiness / processing capability"],
              ["Warm", "Partially equipped; more preparation needed"],
              ["Cold", "Facility basics; equipment must be supplied"],
              ["Reciprocal", "Another organization provides capacity; higher coordination/capacity risk"],
              ["Redundant", "Equivalent alternate capability"]
            ],
            memory: "More readiness usually means faster recovery and greater cost."
          }
        ],
        patterns: [
          ["Confirmed active spread", "Contain/isolate before deep investigation or restoration."],
          ["Fire / physical emergency", "People and life safety first."],
          ["Recovery priority", "Use business impact/BIA rather than vulnerability severity alone."],
          ["RPO clue", "Wording focuses on acceptable data loss or how far back data can be restored."],
          ["Recovery strategy selection", "Business requirements and BIA/RTO/RPO drive the technical solution."],
          ["BCP/DRP test purpose", "Find gaps and prove end-to-end business capability."],
          ["Post-incident", "Root cause, lessons learned, corrective action, and improvement."],
          ["Media during disaster", "Use authorized spokesperson and prepared/controlled messages."],
          ["Customer data modified", "Notify affected data owners early so impact/corrective action can be coordinated."]
        ]
      }
    }
  };

  window.CISMContent = CONTENT;
})();
