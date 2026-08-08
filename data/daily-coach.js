(function(){
  window.CISMDailyCoach = {
    definitions: {
      "1": [
        {term:"Policy", plain:"High-level management direction that states what the organization expects.", clue:"Direction or intent", contrast:"Standard = mandatory boundary; Procedure = steps; Guideline = recommended guidance.", memory:"Policy points the direction."},
        {term:"Standard", plain:"A mandatory requirement or allowable boundary used to satisfy policy intent.", clue:"Must, minimum, required boundary", contrast:"A standard is more specific than policy but is not the step-by-step procedure.", memory:"Standard sets the line you must meet."},
        {term:"Business case", plain:"The management justification for an investment, combining need, value, risk, cost, feasibility, and alignment.", clue:"Funding, approval, executive support", contrast:"Charter authorizes; roadmap/plan explains execution.", memory:"Business case = why invest?"},
        {term:"Governance", plain:"Direction, accountability, alignment, and oversight from the appropriate authority.", clue:"Direction, oversight, enterprise alignment", contrast:"Management executes within the direction governance establishes.", memory:"Governance = where and why; management = how."}
      ],
      "2": [
        {term:"Risk appetite", plain:"The amount and type of risk the organization is willing to pursue or retain in support of objectives.", clue:"How much risk the organization is willing to take", contrast:"Tolerance is the acceptable variation around objectives; appetite is broader direction.", memory:"Appetite sets the risk-taking direction."},
        {term:"Inherent risk", plain:"Risk that exists before considering the effect of controls.", clue:"Before controls", contrast:"Residual risk is what remains after controls or treatment.", memory:"Inherent = before; residual = remains."},
        {term:"Residual risk", plain:"The risk remaining after controls or treatment have been applied.", clue:"After treatment / remaining risk", contrast:"It still needs to be evaluated against what the organization considers acceptable.", memory:"Residual = what remains."},
        {term:"Risk owner", plain:"The person with accountability and authority to make decisions about a risk.", clue:"Authority to accept or direct treatment", contrast:"The security manager can assess and advise without owning the business risk.", memory:"Security advises; the risk owner decides."}
      ],
      "3": [
        {term:"Control", plain:"A safeguard or measure used to modify risk and support security requirements.", clue:"Prevent, detect, correct, compensate", contrast:"A policy gives direction; a control is part of how that direction is achieved.", memory:"Controls change exposure; policies set direction."},
        {term:"KPI", plain:"A measure of performance against an objective.", clue:"Are we performing as intended?", contrast:"KRI focuses on changing risk exposure rather than performance itself.", memory:"KPI = performance; KRI = risk signal."},
        {term:"Maturity", plain:"How consistently and effectively a process is defined, managed, measured, and improved.", clue:"Process capability over time", contrast:"A gap analysis compares current and desired states; maturity describes process capability.", memory:"Maturity asks how well the process operates."}
      ],
      "4": [
        {term:"BIA", plain:"Business impact analysis identifies critical activities and the consequences of disruption so recovery requirements can be established.", clue:"Criticality, impact, recovery requirements", contrast:"Risk assessment asks what can go wrong; BIA asks what interruption means to the business.", memory:"BIA tells recovery what matters and how fast."},
        {term:"RTO", plain:"The targeted time for restoring a process or service after disruption.", clue:"How quickly must we recover?", contrast:"RPO addresses acceptable data loss measured in time.", memory:"RTO = time to restore; RPO = point to restore to."},
        {term:"RPO", plain:"The maximum tolerable period of data loss expressed as time.", clue:"How much data can we lose?", contrast:"RTO is restoration time, not data-loss tolerance.", memory:"RPO = acceptable data-loss window."}
      ]
    },
    lifecycleExercises: {
      "1": [
        {stem:"Leadership is deciding what security must accomplish in support of enterprise goals.", answer:"Business objectives", why:"The direction starts with what the business is trying to achieve before security strategy and controls are selected.", trap:"Jumping to policies or controls starts execution before direction is clear."},
        {stem:"The security direction is approved. The organization is now defining mandatory requirements that translate that direction into expectations.", answer:"Policies & framework", why:"The strategy has already been established; the organization is now formalizing direction and structure.", trap:"A business case would justify investment earlier; measurement happens after implementation."}
      ],
      "2": [
        {stem:"A new third party will process sensitive information. The organization is determining what threats and vulnerabilities this introduces.", answer:"Identify threats / vulnerabilities", why:"The organization is discovering what could create risk. Likelihood and impact have not yet been analyzed.", trap:"Treatment is premature because the risk has not been evaluated yet."},
        {stem:"Threats and vulnerabilities are known. The team is estimating likelihood and business impact.", answer:"Assess likelihood & impact", why:"This is analysis of significance, not yet selection of a response.", trap:"Do not choose treatment simply because a control sounds useful."},
        {stem:"The risk has been assessed and management is choosing mitigation, transfer, avoidance, or acceptance.", answer:"Select treatment", why:"Understanding is sufficient to choose a response that fits the business and risk criteria.", trap:"Assessment is already complete; monitoring comes after a decision and implementation."},
        {stem:"Controls were implemented and the remaining exposure has been calculated. The organization is deciding whether that remaining level is acceptable.", answer:"Accept / approve", why:"Residual risk must be considered against organizational criteria by the appropriate authority.", trap:"The security manager may recommend, but business/risk authority owns acceptance."}
      ],
      "3": [
        {stem:"Security requirements have been approved and are being translated into controls, ownership, and operating practices.", answer:"Security program", why:"The organization is moving from direction into managed implementation.", trap:"This is broader than a single technical control."}
      ],
      "4": [
        {stem:"A disruption has occurred and the organization is determining which critical business services must be restored first.", answer:"Continuity/recovery", why:"Business impact and recovery priorities drive restoration decisions.", trap:"Post-incident improvement comes after operations are stabilized."}
      ]
    },
    decoderLessons: [
      {dimension:"role", title:"ROLE — whose perspective are you answering from?", rule:"Security manager = assess, advise, recommend, coordinate, monitor. Business/risk owner = decide based on business value and accept risk. Custodian/operations = implement and maintain. Audit = independently verify.", question:"If the stem asks what the information security manager should do, which verb should make you cautious?", options:["Assess","Recommend","Accept business risk","Coordinate"], correctIndex:2, why:"Accepting business risk usually belongs to the accountable business/risk authority. The security manager provides security expertise and recommendations."},
      {dimension:"qualifier", title:"QUALIFIER — what kind of answer is the question demanding?", rule:"FIRST/NEXT test sequence. BEST tests the most complete fit. MOST tests priority. PRIMARY tests fundamental purpose.", question:"A FIRST question has four actions that could all be reasonable. What should you look for?", options:["The strongest technical control","The missing prerequisite","The most expensive action","The action with the most detail"], correctIndex:1, why:"FIRST is about sequence. Find what must happen before the other reasonable actions make sense."},
      {dimension:"lifecycle", title:"LIFECYCLE — what has already happened, and what has not?", rule:"A correct action at the wrong stage is still the wrong answer. Use completed actions in the stem to locate yourself in the process.", question:"A risk has been identified but likelihood and impact are not yet understood. Which action is premature?", options:["Assess the risk","Determine likelihood","Select treatment","Determine impact"], correctIndex:2, why:"Treatment should follow sufficient assessment. The tempting control choice skips the stage needed to understand the risk."},
      {dimension:"constraint", title:"CONSTRAINT — what small phrase changes the answer?", rule:"Read the entire stem for limits such as without disrupting operations, within approved risk appetite, independent, or immediate.", question:"Two answers both provide assurance, but the stem adds ‘without interrupting normal operations.’ What changed?", options:["The role","The constraint","The domain","The definition"], correctIndex:1, why:"The constraint eliminates an otherwise reasonable answer. CISM often makes several choices plausible until a qualifier or constraint narrows the best fit."}
    ]
  };
})();
