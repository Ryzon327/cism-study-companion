(function () {
  const LABS = {
    "1": {
      title: "Governance Active Learning",
      description: "Practice authority, sequence, business cases, and governance thinking without rereading definitions.",
      challenges: [
        {
          id: "D1-DIST-OWNER-CUSTODIAN",
          type: "distinguish",
          concept: "Roles & authority",
          title: "Owner or custodian?",
          prompt: "IT administrators maintain a customer database and apply its encryption controls. Who is responsible for determining the data classification?",
          options: ["Data owner", "Data custodian"],
          correctIndex: 0,
          explanation: "The data owner assigns classification based on business requirements. The custodian implements and operates the required protections.",
          memory: "Owner decides → custodian does."
        },
        {
          id: "D1-APPLY-BUSINESS-CASE",
          type: "apply",
          concept: "Business case",
          title: "What persuades management?",
          prompt: "A CISO wants funding for a security initiative that is not in the current budget. Which deliverable BEST supports senior-management approval?",
          options: ["A detailed vulnerability list", "A complete business case", "A technical architecture diagram", "A list of peer-company tools"],
          correctIndex: 1,
          explanation: "A business case combines the need, risk, benefits, costs, feasibility, and alignment with organizational objectives into the decision context management needs.",
          memory: "Funding/support → complete business case."
        },
        {
          id: "D1-PATTERN-REG-FIRST",
          type: "pattern",
          concept: "FIRST sequencing",
          title: "Recognize the pattern",
          prompt: "A new regulation may affect the way sensitive data is handled. What is the strongest FIRST move?",
          options: ["Estimate compliance cost", "Determine affected processes and activities", "Implement compensating controls", "Ask management to choose a response"],
          correctIndex: 1,
          explanation: "Before cost, remediation, or a management response can be determined, the organization needs to understand which processes and activities are affected.",
          memory: "New requirement + FIRST → establish scope before response."
        },
        {
          id: "D1-SEQUENCE-BUSINESS-CASE",
          type: "sequence",
          concept: "Business case lifecycle",
          title: "Put the business-case flow in order",
          prompt: "Build the management sequence from first need to execution.",
          steps: ["Define the need", "Analyze value / feasibility", "Develop business case", "Obtain approval", "Establish authority / charter", "Plan implementation"],
          explanation: "The need must be understood before value, approval, authority, and implementation planning can logically follow.",
          memory: "Need → value → case → approval → authority → plan."
        }
      ]
    },

    "2": {
      title: "Risk Active Learning",
      description: "Practice risk language, treatment, sequence, and acceptable-risk decisions.",
      challenges: [
        {
          id: "D2-DIST-INHERENT-RESIDUAL",
          type: "distinguish",
          concept: "Inherent vs residual risk",
          title: "Before or after controls?",
          prompt: "Controls have been implemented, but some exposure remains. Which term describes the remaining risk?",
          options: ["Inherent risk", "Residual risk"],
          correctIndex: 1,
          explanation: "Inherent risk is the risk before mitigation. Residual risk is what remains after controls or other treatment.",
          memory: "Before controls = inherent. After controls = residual."
        },
        {
          id: "D2-APPLY-TRANSFER",
          type: "apply",
          concept: "Risk treatment",
          title: "Which treatment is this?",
          prompt: "An organization purchases insurance to reduce the financial consequences of a security event. Which risk response is being used?",
          options: ["Accept", "Mitigate", "Transfer", "Avoid"],
          correctIndex: 2,
          explanation: "Insurance transfers financial consequences to another party. The source material explicitly uses insurance as a risk-transfer example.",
          memory: "Insurance → transfer."
        },
        {
          id: "D2-PATTERN-RESIDUAL-NEXT",
          type: "pattern",
          concept: "Residual-risk sequence",
          title: "What comes NEXT?",
          prompt: "Residual risk has been calculated after treatment. What should the enterprise do NEXT?",
          options: ["Immediately buy insurance", "Validate that residual risk is acceptable", "Perform another vulnerability scan", "Formally accept it without evaluation"],
          correctIndex: 1,
          explanation: "The next step is to validate whether the remaining risk is within the enterprise's acceptable range before formal acceptance or additional treatment.",
          memory: "Residual risk → validate acceptability → formal decision."
        },
        {
          id: "D2-SEQUENCE-RISK",
          type: "sequence",
          concept: "Risk lifecycle",
          title: "Build the risk lifecycle",
          prompt: "Put the core risk-management flow in order.",
          steps: ["Identify assets / risk context", "Assess likelihood and impact", "Evaluate against risk criteria", "Select treatment", "Determine residual risk", "Validate acceptability", "Monitor and reassess"],
          explanation: "The source questions repeatedly depend on this ordering, especially treatment, residual-risk validation, and reassessment after change.",
          memory: "Understand → evaluate → treat → check what remains → monitor."
        }
      ]
    },

    "3": {
      title: "Security Program Active Learning",
      description: "Practice ownership, classification, policy hierarchy, and control selection.",
      challenges: [
        {
          id: "D3-DIST-OWNER-CUSTODIAN",
          type: "distinguish",
          concept: "Data owner vs custodian",
          title: "Who makes the business decision?",
          prompt: "A database administrator stores and protects finance records. Finance leadership determines their sensitivity and who should access them. Which role is the database administrator performing?",
          options: ["Data owner", "Data custodian"],
          correctIndex: 1,
          explanation: "The administrator handles and protects the information according to requirements established by the owner; that is the custodian role.",
          memory: "Owner decides → custodian implements."
        },
        {
          id: "D3-APPLY-AUTHORIZATION",
          type: "apply",
          concept: "Authentication vs authorization",
          title: "Identity or permission?",
          prompt: "A supplier successfully signs in, but the organization must prevent the supplier from modifying certain database records. What control decision is most relevant?",
          options: ["Authentication", "Authorization / access rights"],
          correctIndex: 1,
          explanation: "The user's identity has already been established. The remaining question is what that authenticated identity is allowed to do.",
          memory: "Authentication = who. Authorization = what."
        },
        {
          id: "D3-PATTERN-SHARE-FIRST",
          type: "pattern",
          concept: "Classification before protection",
          title: "External sharing: what FIRST?",
          prompt: "Business information must be shared with an external entity. What should the information security manager do FIRST?",
          options: ["Encrypt everything immediately", "Review the information classification", "Execute an NDA before analysis", "Create a new firewall rule"],
          correctIndex: 1,
          explanation: "The classification determines the risk and protection requirements, including whether an NDA, secure channel, or encryption is needed.",
          memory: "Protection choice follows classification/business impact."
        },
        {
          id: "D3-SEQUENCE-PROTECTION",
          type: "sequence",
          concept: "Asset protection lifecycle",
          title: "Build the protection flow",
          prompt: "Put the asset-protection decisions in logical order.",
          steps: ["Identify asset and owner", "Determine business value / impact", "Classify the asset", "Define required protection", "Select and implement controls", "Monitor effectiveness"],
          explanation: "Classification and protection are downstream of business value and ownership, not independent technical choices.",
          memory: "Own → value → classify → protect → measure."
        }
      ]
    },

    "4": {
      title: "Incident & Continuity Active Learning",
      description: "Practice incident sequencing, recovery objectives, continuity decisions, and business-impact thinking.",
      challenges: [
        {
          id: "D4-DIST-RTO-RPO",
          type: "distinguish",
          concept: "RTO vs RPO",
          title: "Time to restore or data loss?",
          prompt: "The business can tolerate losing no more than 30 minutes of transaction data. Which recovery objective is being defined?",
          options: ["RTO", "RPO"],
          correctIndex: 1,
          explanation: "RPO is based on acceptable data loss and the point in time to which data must be recoverable.",
          memory: "Data loss → RPO. Time to restore → RTO."
        },
        {
          id: "D4-APPLY-CONTAIN",
          type: "apply",
          concept: "Containment",
          title: "Active incident: what now?",
          prompt: "A server is confirmed infected and the malicious activity may spread to other systems. What is the strongest immediate action?",
          options: ["Perform root-cause analysis", "Isolate the infected server", "Restore the server from backup", "Prepare the post-incident report"],
          correctIndex: 1,
          explanation: "The priority is to limit further impact. Isolation is a containment action; root-cause analysis and recovery occur later.",
          memory: "Active + spreading → contain."
        },
        {
          id: "D4-PATTERN-BIA",
          type: "pattern",
          concept: "BIA and recovery priority",
          title: "What process answers this?",
          prompt: "The enterprise needs to determine which business functions must recover first and how damaging downtime becomes over time. Which activity provides that information?",
          options: ["Vulnerability assessment", "Business impact analysis", "Penetration test", "Root-cause analysis"],
          correctIndex: 1,
          explanation: "BIA identifies critical functions, disruption impact, and recovery priorities and requirements.",
          memory: "Recovery priority / downtime impact → BIA."
        },
        {
          id: "D4-SEQUENCE-INCIDENT",
          type: "sequence",
          concept: "Incident lifecycle",
          title: "Build the incident lifecycle",
          prompt: "Put the major response stages in order.",
          steps: ["Prepare", "Detect / analyze", "Contain", "Eradicate", "Recover", "Post-incident review", "Improve"],
          explanation: "The source bank repeatedly tests boundaries between containment, eradication, recovery, and post-incident improvement.",
          memory: "Detect → stop → remove → restore → learn."
        }
      ]
    }
  };

  window.CISMActiveLearning = LABS;
})();
