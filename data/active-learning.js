(function () {
  const LABS = {
    "1": {
      title: "Governance Adaptive Practice",
      description: "A fresh mix of governance questions each session. Misses are weighted back into future practice and repair.",
      sessionSize: 10,
      challenges: [
        {
          id: "D1-POLICY-HIERARCHY-1",
          type: "distinguish",
          concept: "Policy hierarchy",
          title: "Policy, standard, procedure, or guideline?",
          prompt: "Which document sets mandatory allowable boundaries so procedures remain aligned with management policy?",
          options: ["Policy", "Standard", "Procedure", "Guideline"],
          correctIndex: 1,
          explanation: "Standards set mandatory boundaries and provide the linkage between high-level policy and more detailed procedures.",
          memory: "Policy sets direction → standards set mandatory boundaries → procedures explain the steps."
        },
        {
          id: "D1-POLICY-HIERARCHY-2",
          type: "apply",
          concept: "Policy hierarchy",
          title: "Which layer is this?",
          prompt: "Management wants a high-level statement of intent that should remain relatively stable even when technology changes. Which document fits best?",
          options: ["Policy", "Procedure", "Technical standard", "Guideline"],
          correctIndex: 0,
          explanation: "Policy expresses high-level management direction and is less likely to change with specific technologies than standards, procedures, or guidelines.",
          memory: "Policy = durable management direction."
        },
        {
          id: "D1-POLICY-HIERARCHY-3",
          type: "pattern",
          concept: "Policy hierarchy",
          title: "Governance implementation FIRST",
          prompt: "Successful implementation of information security governance will FIRST require which of the following?",
          options: ["Security awareness training", "Updated security policies", "An incident response team", "A security architecture"],
          correctIndex: 1,
          explanation: "Management objectives translate into policy, and policy then drives standards and procedures. Architecture and awareness follow the governance direction.",
          memory: "Management objectives → policy → standards/procedures."
        },
        {
          id: "D1-BASELINE-1",
          type: "distinguish",
          concept: "Standards and baselines",
          title: "What defines the baseline?",
          prompt: "Which governance element most directly establishes the lowest acceptable limits of security across similar systems?",
          options: ["Policies", "Standards", "Guidelines", "Metrics"],
          correctIndex: 1,
          explanation: "Standards taken together establish mandatory minimum limits and therefore define the baseline.",
          memory: "Standards collectively define the baseline."
        },
        {
          id: "D1-OWNER-CUSTODIAN-1",
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
          id: "D1-OWNER-CUSTODIAN-2",
          type: "apply",
          concept: "Roles & authority",
          title: "Who determines protection need?",
          prompt: "Who is in the best position to determine the level of information security needed for a specific business application?",
          options: ["System developer", "Information security manager", "System custodian", "Business owner"],
          correctIndex: 3,
          explanation: "The business owner understands the application's value, criticality, and business impact and is best positioned to determine the required level of protection.",
          memory: "Business value decisions belong closest to the business owner."
        },
        {
          id: "D1-ACCOUNTABILITY-1",
          type: "apply",
          concept: "Roles & authority",
          title: "Why define roles clearly?",
          prompt: "What is the most immediate benefit of clearly defined information security roles and responsibilities?",
          options: ["Perfect policy compliance", "Improved procedure speed", "Automatic segregation of duties", "Better accountability"],
          correctIndex: 3,
          explanation: "Clear roles make it explicit who is accountable for performance and outcomes.",
          memory: "Clear role → clear accountability."
        },
        {
          id: "D1-BUSINESS-CASE-1",
          type: "apply",
          concept: "Business case",
          title: "What persuades management?",
          prompt: "A CISO wants funding for a security initiative that is not in the current budget. Which deliverable BEST supports senior-management approval?",
          options: ["A detailed vulnerability list", "A complete business case", "A technical architecture diagram", "A list of peer-company tools"],
          correctIndex: 1,
          explanation: "A business case combines need, risk, benefits, costs, feasibility, and organizational alignment into management decision context.",
          memory: "Funding/support → complete business case."
        },
        {
          id: "D1-BUSINESS-CASE-2",
          type: "pattern",
          concept: "Business case",
          title: "FIRST step in a business case",
          prompt: "What should happen FIRST when developing a business case for an information security investment?",
          options: ["Calculate return on investment", "Define the need", "Estimate project cost", "Analyze cost-effectiveness"],
          correctIndex: 1,
          explanation: "The need or issue must be clearly defined before objectives, cost, value, or cost-effectiveness can be meaningfully assessed.",
          memory: "Business case starts with the need."
        },
        {
          id: "D1-BUSINESS-CASE-3",
          type: "distinguish",
          concept: "Business case",
          title: "Whole case or supporting input?",
          prompt: "Senior management asks why it should fund a security initiative. Which answer is the most complete?",
          options: ["Risk assessment only", "Cost-benefit analysis only", "Business case", "Technical evaluation only"],
          correctIndex: 2,
          explanation: "Risk, cost-benefit, and technical evaluation can all support the decision, but the business case integrates them into the complete investment rationale.",
          memory: "BEST / MOST complete → business case can encompass its supporting analyses."
        },
        {
          id: "D1-REG-FIRST-1",
          type: "pattern",
          concept: "Regulatory sequencing",
          title: "New regulation: what FIRST?",
          prompt: "A new regulation may affect the way sensitive data is handled. What is the strongest FIRST move?",
          options: ["Estimate compliance cost", "Determine affected processes and activities", "Implement compensating controls", "Ask management to choose a response"],
          correctIndex: 1,
          explanation: "Before cost, remediation, or management response can be determined, the organization needs to understand which processes and activities are affected.",
          memory: "New requirement + FIRST → establish scope before response."
        },
        {
          id: "D1-REG-FIRST-2",
          type: "apply",
          concept: "Regulatory sequencing",
          title: "High-cost new requirement",
          prompt: "New industry requirements may be expensive to implement. What should the security manager do FIRST?",
          options: ["Demand immediate compliance", "Perform a gap analysis", "Implement compensating controls", "Escalate directly to the audit committee"],
          correctIndex: 1,
          explanation: "A gap analysis determines the level of compliance already in place and what is actually missing before remediation decisions are made.",
          memory: "Known requirement + current-state question → gap analysis."
        },
        {
          id: "D1-MGMT-SUPPORT-1",
          type: "apply",
          concept: "Senior management support",
          title: "What gets executive attention?",
          prompt: "Which presentation is MOST likely to gain executive commitment to information security?",
          options: ["Technical attack details", "Security tool capabilities", "Security risk tied to key business objectives", "A list of industry certifications"],
          correctIndex: 2,
          explanation: "Senior management is most persuaded when security risk and investment are connected directly to business objectives and outcomes.",
          memory: "Executives → business objectives, value, risk, outcomes."
        },
        {
          id: "D1-STRATEGY-1",
          type: "pattern",
          concept: "Strategic alignment",
          title: "What drives the strategy?",
          prompt: "What is the MOST important objective when reviewing an information security strategy?",
          options: ["Maximum security-tool utilization", "Alignment with organizational goals", "Elimination of all residual risk", "Highest possible security spending"],
          correctIndex: 1,
          explanation: "The strategy is primarily valuable when it supports organizational goals and business objectives.",
          memory: "Strategy review → business alignment."
        },
        {
          id: "D1-GOVERNANCE-1",
          type: "apply",
          concept: "Governance",
          title: "What is governance really for?",
          prompt: "Which outcome BEST reflects effective information security governance?",
          options: ["All vulnerabilities are closed", "Security architecture is highly standardized", "Business objectives are achieved through direction and monitored performance", "The security team owns all risk decisions"],
          correctIndex: 2,
          explanation: "Governance evaluates stakeholder needs, sets direction through prioritization and decision-making, and monitors performance against plans to support business objectives.",
          memory: "Governance = direction + decision + oversight in support of business."
        },
        {
          id: "D1-BSC-1", type: "distinguish", concept: "Governance measurement",
          title: "Which tool measures objective achievement?",
          prompt: "Which tool is MOST effective for evaluating the degree to which information security objectives are being met?",
          options: ["SWOT analysis", "Waterfall chart", "Gap analysis", "Balanced scorecard"], correctIndex: 3,
          explanation: "The supplied Domain 1 material identifies the balanced scorecard as the most effective option for evaluating how well information security objectives are being met.",
          memory: "Objectives being met → balanced scorecard."
        },
        {
          id: "D1-STANDARDS-LINK-1", type: "apply", concept: "Policy hierarchy",
          title: "What links procedure to policy?",
          prompt: "Which governance document provides the linkage that keeps procedures aligned with information security policy requirements?",
          options: ["Standards", "Guidelines", "Security metrics", "Gap analysis"], correctIndex: 0,
          explanation: "Standards set allowable boundaries for procedures so they comply with policy intent.",
          memory: "Policy direction → standards boundaries → procedures steps."
        },
        {
          id: "D1-MATURITY-1", type: "pattern", concept: "Security strategy",
          title: "Evidence of program maturity",
          prompt: "Which is the BEST evidence of a mature information security program?",
          options: ["A comprehensive risk assessment", "A physical security architecture", "A controls statement of applicability", "An effective information security strategy"], correctIndex: 3,
          explanation: "The source bank treats an effective security strategy as the strongest evidence because it defines the program's direction and alignment.",
          memory: "Mature program → effective strategy, not a single artifact."
        },
        {
          id: "D1-EXEC-COMMIT-1", type: "apply", concept: "Senior management support",
          title: "How do you gain commitment?",
          prompt: "What is MOST appropriate for gaining senior-management commitment to the security strategy?",
          options: ["Workforce security education", "Frequent operational meetings with executives", "A standalone detailed cost-benefit analysis", "A formal presentation linking the program to business goals"], correctIndex: 3,
          explanation: "The source emphasizes educating senior management on key program aspects and showing how security enables business goals.",
          memory: "Executive commitment → communicate security in business terms."
        },
        {
          id: "D1-SEQUENCE-GOVERNANCE",
          type: "sequence",
          concept: "Governance lifecycle",
          title: "Build the governance flow",
          prompt: "Put this simplified governance sequence in order.",
          steps: ["Business objectives", "Security strategy", "Policies", "Standards / procedures", "Controls / implementation", "Measurement / improvement"],
          explanation: "Business objectives drive strategy; strategy informs policy; policy drives more specific standards/procedures; controls implement the direction; measurement feeds improvement.",
          memory: "Business → strategy → policy → detail → controls → measure."
        }
      ]
    },

    "2": {
      title: "Risk Adaptive Practice",
      description: "A weighted mix of risk terminology, treatment, ownership, and sequencing.",
      sessionSize: 10,
      challenges: [
        {
          id: "D2-INHERENT-RESIDUAL-1",
          type: "distinguish",
          concept: "Inherent vs residual risk",
          title: "Before or after controls?",
          prompt: "Controls have been implemented, but some exposure remains. Which term describes the remaining risk?",
          options: ["Inherent risk", "Residual risk"],
          correctIndex: 1,
          explanation: "Inherent risk is before mitigation; residual risk remains after controls or treatment.",
          memory: "Before controls = inherent. After controls = residual."
        },
        {
          id: "D2-APPETITE-TOLERANCE-1",
          type: "distinguish",
          concept: "Risk appetite vs tolerance",
          title: "Appetite or tolerance?",
          prompt: "Management permits a defined amount of variation around a particular risk level while pursuing objectives. What is this?",
          options: ["Risk appetite", "Risk tolerance"],
          correctIndex: 1,
          explanation: "Risk tolerance is the acceptable variation management permits around a defined risk expectation.",
          memory: "Appetite sets direction; tolerance allows variation."
        },
        {
          id: "D2-TRANSFER-1",
          type: "apply",
          concept: "Risk treatment",
          title: "Which treatment is this?",
          prompt: "An organization purchases insurance to reduce the financial consequences of a security event. Which response is being used?",
          options: ["Accept", "Mitigate", "Transfer", "Avoid"],
          correctIndex: 2,
          explanation: "Insurance transfers financial consequences to another party.",
          memory: "Insurance → transfer."
        },
        {
          id: "D2-ACCEPTABLE-1",
          type: "apply",
          concept: "Acceptable risk",
          title: "Who decides acceptable risk?",
          prompt: "Who ultimately determines whether an IT risk has been reduced to an acceptable level?",
          options: ["Security requirements", "International standards", "Organizational/management requirements", "System administrator preference"],
          correctIndex: 2,
          explanation: "Risk acceptability is ultimately a management decision based on organizational requirements.",
          memory: "Acceptable risk is a business/management decision."
        },
        {
          id: "D2-RESIDUAL-NEXT-1",
          type: "pattern",
          concept: "Residual-risk sequence",
          title: "What comes NEXT?",
          prompt: "Residual risk has been calculated after treatment. What should the enterprise do NEXT?",
          options: ["Immediately buy insurance", "Validate that residual risk is acceptable", "Perform another vulnerability scan", "Formally accept it without evaluation"],
          correctIndex: 1,
          explanation: "The next step is validating whether remaining risk is within acceptable range before formal acceptance or additional treatment.",
          memory: "Residual risk → validate acceptability → formal decision."
        },
        {
          id: "D2-COST-BENEFIT-1",
          type: "pattern",
          concept: "Cost-benefit treatment",
          title: "Control cost vs risk",
          prompt: "A vulnerability presents low business impact, and a proposed control is expensive. What analysis BEST supports the mitigation decision?",
          options: ["Gap analysis", "Cost-benefit analysis", "Forensic analysis", "BIA"],
          correctIndex: 1,
          explanation: "Cost-benefit analysis determines whether control cost is justified by the reduction in risk or expected loss.",
          memory: "Treatment choice + cost question → cost-benefit."
        },
        {
          id: "D2-BUSINESS-OWNER-1",
          type: "apply",
          concept: "Risk and control ownership",
          title: "Who decides the control?",
          prompt: "Sensitive health data is used in a new AI project. Who should primarily decide which controls are acceptable to remediate the risk to that data?",
          options: ["Head data scientist", "IT security manager", "Health data owner", "External vendor"],
          correctIndex: 2,
          explanation: "Security can advise on options, but the data owner is responsible for deciding controls appropriate to the business value and risk of the data.",
          memory: "Security advises; owner decides for owned data/risk."
        },
        {
          id: "D2-CHANGE-1",
          type: "pattern",
          concept: "Risk reassessment",
          title: "A major change occurs",
          prompt: "A significant technology change alters existing control effectiveness. What should happen to the prior risk assumptions?",
          options: ["Leave them unchanged until the next annual audit", "Reassess the risk", "Replace policy immediately", "Accept the new risk automatically"],
          correctIndex: 1,
          explanation: "Meaningful changes can invalidate prior assumptions and should trigger reassessment.",
          memory: "Material change → reassess risk."
        },
        {
          id: "D2-KRI-1",
          type: "distinguish",
          concept: "KRIs",
          title: "Which measure warns about risk?",
          prompt: "Senior management wants timely indicators that risk around critical business assets may be developing. What is MOST useful?",
          options: ["Key risk indicators", "Asset age", "Number of security employees", "Project milestones"],
          correctIndex: 0,
          explanation: "KRIs provide early warning about developing or changing risk and support management decisions.",
          memory: "KRI = early warning for risk."
        },
        {
          id: "D2-CBA-PURPOSE-2", type: "apply", concept: "Cost-benefit treatment",
          title: "Why perform cost-benefit analysis?",
          prompt: "A cost-benefit analysis is performed on a proposed control primarily to do what?",
          options: ["Define budget limits", "Demonstrate due diligence", "Verify it fits the security budget", "Show the control cost is justified by risk reduction"], correctIndex: 3,
          explanation: "Management uses the analysis to weigh control cost against the reduction in risk.",
          memory: "Control economics → cost versus risk reduction."
        },
        {
          id: "D2-ACCEPTABLE-2", type: "pattern", concept: "Acceptable risk",
          title: "What is the risk-management destination?",
          prompt: "An effective risk management program should reduce risk to:",
          options: ["Zero", "An acceptable level", "A fixed percentage of revenue", "Zero probability of occurrence"], correctIndex: 1,
          explanation: "The supplied material explicitly states that risk is reduced to an acceptable level; eliminating all risk is neither realistic nor cost-effective.",
          memory: "CISM does not chase zero risk → acceptable risk."
        },
        {
          id: "D2-INSIDER-1", type: "apply", concept: "Control selection",
          title: "Best preventive insider control",
          prompt: "Which control is MOST effective against insider threats to confidential information?",
          options: ["Role-based access control", "Audit trail monitoring", "Privacy policy", "Defense in depth"], correctIndex: 0,
          explanation: "The source selects role-based access control because it is preventive, limits access according to business need, and supports accountability.",
          memory: "Unnecessary insider access → preventive business-need access."
        },
        {
          id: "D2-EXPOSURE-1", type: "distinguish", concept: "Risk mechanics",
          title: "What does reduced exposure change?",
          prompt: "Reducing exposure of a critical asset primarily reduces which element?",
          options: ["Impact of compromise", "Likelihood of exploitation", "The asset's vulnerability", "Recovery time"], correctIndex: 1,
          explanation: "Reducing exposure makes exploitation less likely but does not remove the underlying vulnerability.",
          memory: "Less exposure → lower likelihood, not lower impact."
        },
        {
          id: "D2-TREAT-VULN-1", type: "pattern", concept: "Risk treatment",
          title: "Significant vulnerabilities found",
          prompt: "A scan finds significant vulnerabilities. What is the BEST treatment approach?",
          options: ["Mitigate every significant finding immediately", "Base treatment on threat, impact, and cost", "Always implement compensating controls", "Always seek management approval first"], correctIndex: 1,
          explanation: "Treatment should consider exposure/threat, potential impact, and the costs of available treatment options.",
          memory: "Finding ≠ automatic fix → evaluate threat + impact + cost."
        },
        {
          id: "D2-RESOURCES-1", type: "apply", concept: "Risk analysis",
          title: "What drives mitigation resources?",
          prompt: "What should primarily determine resources devoted to mitigating exposures?",
          options: ["Risk analysis results", "Audit findings", "Penetration-test findings", "Available IT budget"], correctIndex: 0,
          explanation: "The source identifies risk analysis as the most complete basis for allocating mitigation resources.",
          memory: "Resource allocation follows risk analysis."
        },
        {
          id: "D2-SEQUENCE-RISK",
          type: "sequence",
          concept: "Risk lifecycle",
          title: "Build the risk lifecycle",
          prompt: "Put the core risk-management flow in order.",
          steps: ["Identify assets / context", "Assess likelihood and impact", "Evaluate against criteria", "Select treatment", "Determine residual risk", "Validate acceptability", "Monitor and reassess"],
          explanation: "The question bank repeatedly depends on this ordering.",
          memory: "Understand → evaluate → treat → check what remains → monitor."
        }
      ]
    },

    "3": {
      title: "Security Program Adaptive Practice",
      description: "A weighted mix of ownership, classification, policy hierarchy, access, and controls.",
      sessionSize: 10,
      challenges: [
        {
          id: "D3-OWNER-CUSTODIAN-1",
          type: "distinguish",
          concept: "Data owner vs custodian",
          title: "Who makes the business decision?",
          prompt: "A database administrator stores and protects finance records. Finance leadership determines sensitivity and access. Which role is the database administrator?",
          options: ["Data owner", "Data custodian"],
          correctIndex: 1,
          explanation: "The administrator implements protection according to requirements set by the owner.",
          memory: "Owner decides → custodian implements."
        },
        {
          id: "D3-AUTH-AUTHZ-1",
          type: "distinguish",
          concept: "Authentication vs authorization",
          title: "Identity or permission?",
          prompt: "A supplier successfully signs in, but must be prevented from modifying certain records. What is the remaining control issue?",
          options: ["Authentication", "Authorization / access rights"],
          correctIndex: 1,
          explanation: "Identity is already established; authorization determines what that identity may do.",
          memory: "Authentication = who. Authorization = what."
        },
        {
          id: "D3-POLICY-TECH-1",
          type: "pattern",
          concept: "Policy hierarchy",
          title: "What changes least with technology?",
          prompt: "Which document is least likely to require revision simply because technology changes?",
          options: ["Standard", "Procedure", "Policy", "Guideline"],
          correctIndex: 2,
          explanation: "Policy is high-level management intent and direction. Standards, procedures, and guidelines are more likely to change with technology.",
          memory: "Policy is durable; implementation detail changes faster."
        },
        {
          id: "D3-POLICY-EXCEPTION-1",
          type: "apply",
          concept: "Policy exceptions",
          title: "Who can grant an exception?",
          prompt: "Who has inherent authority to grant an exception to an information security policy?",
          options: ["Business process owner", "Department manager", "Policy approver", "Information security manager"],
          correctIndex: 2,
          explanation: "The person/body empowered to approve the policy is empowered to grant exceptions because it owns responsibility for the policy's intended results.",
          memory: "Policy approver → exception authority."
        },
        {
          id: "D3-POLICY-EXCEPTION-2",
          type: "pattern",
          concept: "Policy exceptions",
          title: "When is an exception justified?",
          prompt: "Which situation most strongly supports initiating a policy exception process?",
          options: ["Operations are busy", "The risk is justified by the business benefit", "Users are inconvenienced", "The policy is hard to enforce"],
          correctIndex: 1,
          explanation: "An exception can be justified when compliance is difficult/impossible and the risk of noncompliance is outweighed by business benefit.",
          memory: "Exception = explicit risk/benefit decision, not convenience."
        },
        {
          id: "D3-RETENTION-1",
          type: "distinguish",
          concept: "Retention policy",
          title: "Which policy answers deletion timing?",
          prompt: "An employee wants to overwrite old backup media. Which policy should determine whether the data may be deleted?",
          options: ["Classification policy", "Retention policy", "Acceptable use policy", "Encryption policy"],
          correctIndex: 1,
          explanation: "Retention policy establishes how long data must be retained and what occurs when the retention period ends.",
          memory: "How long / when delete → retention."
        },
        {
          id: "D3-SHARE-FIRST-1",
          type: "pattern",
          concept: "Classification before protection",
          title: "External sharing: what FIRST?",
          prompt: "Business information must be shared with an external entity. What should the security manager do FIRST?",
          options: ["Encrypt everything immediately", "Review information classification", "Execute an NDA before analysis", "Create a firewall rule"],
          correctIndex: 1,
          explanation: "Classification determines the risk and protection requirements, including whether an NDA, secure channel, or encryption is needed.",
          memory: "Protection choice follows classification/business impact."
        },
        {
          id: "D3-CONTROL-TYPE-1",
          type: "distinguish",
          concept: "Control types",
          title: "Prevent or detect?",
          prompt: "Which is a detective rather than preventive control?",
          options: ["Role-based access restriction", "Security event logging", "Least privilege", "Approval workflow"],
          correctIndex: 1,
          explanation: "Logging identifies activity after or as it occurs; it does not itself prevent unauthorized action.",
          memory: "Prevent = stop. Detect = see."
        },
        {
          id: "D3-CLASS-PREREQ-1", type: "pattern", concept: "Asset classification",
          title: "Before classification",
          prompt: "What is the MOST important prerequisite to undertaking asset classification?",
          options: ["Threat analysis", "Impact assessment", "Controls evaluation", "Penetration testing"], correctIndex: 1,
          explanation: "Classification reflects asset value and importance, so criticality and sensitivity must first be established through impact assessment.",
          memory: "Before classifying → understand business impact."
        },
        {
          id: "D3-CLASS-BASIS-1", type: "distinguish", concept: "Asset classification",
          title: "What primarily drives classification?",
          prompt: "The classification level of an asset should be PRIMARILY based on:",
          options: ["Criticality and sensitivity", "Likelihood and impact", "Replacement cost", "Threat vector and exposure"], correctIndex: 0,
          explanation: "The supplied questions consistently base classification on business criticality, sensitivity, and potential impact.",
          memory: "Classification → criticality + sensitivity."
        },
        {
          id: "D3-PROTECTION-LEVEL-1", type: "apply", concept: "Asset classification",
          title: "What best determines protection level?",
          prompt: "Which factor BEST helps determine the appropriate protection level for an information asset?",
          options: ["Acquisition cost", "Known vulnerabilities", "Threat exposure", "Criticality of the supported business function"], correctIndex: 3,
          explanation: "Business-function criticality is the strongest basis because protection should reflect the business consequence of loss or unavailability.",
          memory: "Protection strength follows business criticality."
        },
        {
          id: "D3-CLASS-BENEFIT-1", type: "apply", concept: "Asset classification",
          title: "Why classify information?",
          prompt: "What is the PRIMARY benefit of information asset classification?",
          options: ["It directly defines business objectives", "It identifies controls commensurate with impact", "It defines all access rights", "It establishes ownership"], correctIndex: 1,
          explanation: "Classification translates business value and potential impact into the level of protection required.",
          memory: "Classify so protection matches impact."
        },
        {
          id: "D3-CLASS-METHOD-1", type: "pattern", concept: "Asset classification",
          title: "Who and what determine classification?",
          prompt: "What is the BEST method to determine classification of data?",
          options: ["Data owner assesses impact of compromise", "Security policy alone determines it", "Existing protection level determines it", "Security manager assesses probability of loss"], correctIndex: 0,
          explanation: "The source says classification is based on potential impact and is determined by the data owner.",
          memory: "Owner + impact → classification."
        },
        {
          id: "D3-POLICY-STANDARD-1", type: "distinguish", concept: "Policy hierarchy",
          title: "Direction or boundary?",
          prompt: "Which statement BEST distinguishes policy from a standard?",
          options: ["Policy sets mandatory direction; a standard sets mandatory allowable boundaries", "Policy is optional; a standard is mandatory", "Policy is a step-by-step method; a standard is guidance", "They are interchangeable"], correctIndex: 0,
          explanation: "Policy sets management direction while standards establish boundaries that must be met to satisfy policy intent.",
          memory: "Policy = direction. Standard = boundary."
        },
        {
          id: "D3-SEQUENCE-PROTECTION",
          type: "sequence",
          concept: "Asset protection lifecycle",
          title: "Build the protection flow",
          prompt: "Put the asset-protection decisions in logical order.",
          steps: ["Identify asset and owner", "Determine business value / impact", "Classify the asset", "Define required protection", "Select and implement controls", "Monitor effectiveness"],
          explanation: "Classification and protection are downstream of business value and ownership.",
          memory: "Own → value → classify → protect → measure."
        }
      ]
    },

    "4": {
      title: "Incident & Continuity Adaptive Practice",
      description: "A weighted mix of incident sequencing, evidence, BIA, recovery objectives, and continuity.",
      sessionSize: 10,
      challenges: [
        {
          id: "D4-RTO-RPO-1",
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
          id: "D4-RTO-RPO-2",
          type: "apply",
          concept: "RTO vs RPO",
          title: "How fast must service return?",
          prompt: "Management requires the payroll application to be restored within four hours after disruption. Which objective is being defined?",
          options: ["RPO", "RTO"],
          correctIndex: 1,
          explanation: "RTO describes how quickly a service/function must be restored.",
          memory: "Restore-time requirement → RTO."
        },
        {
          id: "D4-CONTAIN-1",
          type: "apply",
          concept: "Containment",
          title: "Active incident: what now?",
          prompt: "A server is confirmed infected and malicious activity may spread. What is the strongest immediate action?",
          options: ["Perform root-cause analysis", "Isolate the infected server", "Restore from backup", "Prepare the post-incident report"],
          correctIndex: 1,
          explanation: "Priority is limiting additional impact. Isolation is containment; root-cause and recovery occur later.",
          memory: "Active + spreading → contain."
        },
        {
          id: "D4-IRP-FIRST-1",
          type: "pattern",
          concept: "Incident response process",
          title: "Stolen laptop: FIRST action",
          prompt: "A company laptop is reported stolen. What should the security manager do FIRST?",
          options: ["Evaluate data-loss impact", "Update the inventory", "Initiate incident response procedures", "Disable every account tied to the user"],
          correctIndex: 2,
          explanation: "The established incident response process coordinates the appropriate impact evaluation, containment, notification, and other actions.",
          memory: "Reported incident → initiate the response process."
        },
        {
          id: "D4-BIA-1",
          type: "pattern",
          concept: "BIA",
          title: "What process answers this?",
          prompt: "The enterprise needs to determine which business functions must recover first and how damaging downtime becomes over time. Which activity provides that information?",
          options: ["Vulnerability assessment", "Business impact analysis", "Penetration test", "Root-cause analysis"],
          correctIndex: 1,
          explanation: "BIA identifies critical functions, disruption impact, and recovery priorities and requirements.",
          memory: "Recovery priority / downtime impact → BIA."
        },
        {
          id: "D4-EVIDENCE-1",
          type: "apply",
          concept: "Evidence integrity",
          title: "Legal action may follow",
          prompt: "If legal action may result from a security incident, what is the PRIMARY evidence concern?",
          options: ["Collecting it as fast as possible", "Preserving evidence integrity", "Disconnecting every device", "Reconstructing the timeline first"],
          correctIndex: 1,
          explanation: "Evidence must be collected and handled in a way that preserves integrity and chain of custody for legal use.",
          memory: "Legal evidence → integrity and chain of custody."
        },
        {
          id: "D4-BCP-DRP-1",
          type: "distinguish",
          concept: "IRP vs BCP vs DRP",
          title: "Which plan handles the breach?",
          prompt: "Which plan most directly provides the roles and step-by-step process for handling an information security breach?",
          options: ["Business continuity plan", "Disaster recovery plan", "Incident response plan", "Vulnerability management plan"],
          correctIndex: 2,
          explanation: "The incident response plan defines the response process and related responsibilities for security incidents.",
          memory: "Breach handling → IRP. Business continuity → BCP. Technology recovery → DRP."
        },
        {
          id: "D4-DATA-OWNER-FIRST-1",
          type: "pattern",
          concept: "Incident communications",
          title: "Who should know FIRST?",
          prompt: "Sensitive records are exposed in an unsecured cloud database. Which group should be notified FIRST so business impact and corrective action can be coordinated?",
          options: ["Steering committee", "Customers", "Regulators", "Affected data owners"],
          correctIndex: 3,
          explanation: "Affected data owners should be notified first so they can determine damage and coordinate corrective action with the response team.",
          memory: "Business-impact decision → notify the affected data owner early."
        },
        {
          id: "D4-SDO-1", type: "distinguish", concept: "Recovery objectives",
          title: "Which recovery objective is service level?",
          prompt: "Which objective describes the acceptable level of service during alternate processing until normal operations are restored?",
          options: ["RTO", "RPO", "SDO", "MTO"], correctIndex: 2,
          explanation: "The source defines SDO as the acceptable level of service within the RTO during alternate processing.",
          memory: "SDO = service level while operating in alternate mode."
        },
        {
          id: "D4-MTO-1", type: "distinguish", concept: "Recovery objectives",
          title: "Which objective is maximum outage?",
          prompt: "Which term describes the maximum time an enterprise can support processing in alternate mode?",
          options: ["RPO", "RTO", "SDO", "MTO"], correctIndex: 3,
          explanation: "The supplied material defines maximum tolerable outage as the maximum period the enterprise can support alternate-mode processing.",
          memory: "MTO = maximum tolerable outage."
        },
        {
          id: "D4-RTO-PRIMARY-1", type: "pattern", concept: "Recovery objectives",
          title: "What primarily drives RTO?",
          prompt: "What is the PRIMARY consideration when defining recovery time objectives for information assets?",
          options: ["Regulatory requirements", "Business requirements", "Financial purchase value", "IT resource availability"], correctIndex: 1,
          explanation: "The source states that business criticality should drive RTO decisions.",
          memory: "Recovery objectives begin with business requirements."
        },
        {
          id: "D4-BCP-FIRST-1", type: "pattern", concept: "BIA",
          title: "Starting a continuity program",
          prompt: "What should be determined FIRST when establishing a business continuity program?",
          options: ["Cost to rebuild facilities", "Incremental daily cost of system unavailability", "Offsite facility location", "Recovery-team composition"], correctIndex: 1,
          explanation: "The source uses incremental loss over time to establish recovery requirements before selecting facilities or teams.",
          memory: "Continuity FIRST → quantify business impact over time."
        },
        {
          id: "D4-PRIORITY-BIA-1", type: "apply", concept: "BIA",
          title: "What drives response priority?",
          prompt: "Prioritization of incident response activities is driven primarily by which analysis?",
          options: ["RPO", "Quantitative risk assessment", "BCP", "BIA"], correctIndex: 3,
          explanation: "Once an incident exists, potential business impact drives response priority, captured by the BIA.",
          memory: "Incident priority → impact → BIA."
        },
        {
          id: "D4-FORENSIC-HASH-1", type: "pattern", concept: "Evidence integrity",
          title: "Disk image created — what NEXT?",
          prompt: "After primary and backup forensic images are created, what should be done NEXT to establish authenticity?",
          options: ["Encrypt both images", "Create another image with a different tool", "Generate hashes for the images", "Write new response procedures"], correctIndex: 2,
          explanation: "Hashes demonstrate that the analysis copy is identical to the reference image and should be generated promptly.",
          memory: "Forensic copy → hash → prove integrity."
        },
        {
          id: "D4-RECIPROCAL-1", type: "apply", concept: "Recovery strategies",
          title: "Which strategy is most fragile?",
          prompt: "Which recovery strategy has the GREATEST chance of failure?",
          options: ["Hot site", "Redundant site", "Reciprocal arrangement", "Cold site"], correctIndex: 2,
          explanation: "The source identifies reciprocal arrangements as particularly failure-prone because two organizations must maintain compatible capacity and commitments.",
          memory: "Reciprocal arrangement → high coordination risk."
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
