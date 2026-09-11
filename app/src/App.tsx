import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { AppShell } from "./app-shell/AppShell";
import type { ProductNavItem } from "./app-shell/ProductNav";
import type { PrototypeStateItem, ContentSourceMode } from "./app-shell/PrototypeSwitcher";
import { ThemeProvider } from "./state/ThemeContext";
import { HomeScreen } from "./screens/HomeScreen";
import { DailyStudyLearnScreen } from "./screens/DailyStudyLearnScreen";
import { QuestionApplyScreen } from "./screens/QuestionApplyScreen";
import { FeedbackScreen } from "./screens/FeedbackScreen";
import { CompletionScreen } from "./screens/CompletionScreen";
import { PracticeExamScreen } from "./screens/PracticeExamScreen";
import { ReviewCenterScreen } from "./screens/ReviewCenterScreen";
import { ExploreScreen } from "./screens/ExploreScreen";
import { PracticeScreen } from "./screens/PracticeScreen";
import { DailyStudySession } from "./session/DailyStudySession";
import type { DailyStudyContentSource } from "./session/contentSource";
import { prototypeContentSource } from "./data/prototypeContentSource";
import { productionContentSource, setTodaysLessonIdForReview, getTodaysLessonIdForReview } from "./content/productionContentSource";
import { feedbackCorrect, feedbackIncorrect } from "./data/fixtures";

// The learner's real navigation: four destinations, matching the approved
// MVP learning-mode layer (Phase 10B-1 through 10B-4). "Daily Study" enters
// the live, controlled Recall → Learn → Apply → Feedback → Completion →
// optional Reinforcement experience; "Explore" enters the Phase 10B-2
// concept-driven experience; "Practice" enters the Phase 10B-3 bounded
// deliberate-testing experience. Optional Reinforcement is deliberately
// NOT a fifth item here — it is contextual, reachable only from Daily
// Study's own Completion screen (see DailyStudySession.tsx), never a
// destination a learner navigates to directly. All four are deliberately
// separate from the Visual Prototype Gate states below, which exist for
// QA only.
//
// "Explore" was renamed from "Explore & Practice" in Phase 10B-2, before
// Practice was real, because the destination no longer opened the Phase
// 5B Practice Exam prototype fixture at all. Practice itself became real
// in Phase 10B-3 as its own destination below — the Phase 5B Practice Exam
// prototype screen remains untouched and still reachable only via the QA
// switcher, never as the real learner-facing Practice flow.
const PRODUCT_NAV_ITEMS: ProductNavItem[] = [
  { id: "home", label: "Home" },
  { id: "daily-study", label: "Daily Study" },
  { id: "explore", label: "Explore" },
  { id: "practice", label: "Practice" }
];

const PRODUCT_ENTRY_SCREEN: Record<string, string> = {
  home: "home",
  "daily-study": "daily-study-session",
  explore: "explore",
  practice: "practice"
};

// Phase 5B is a visual prototype: no routing library, per the Phase 5A
// decision. Screen selection is local component state. These eight states
// are the seven Visual Prototype Gate screens (Feedback exposed as its two
// required correct/incorrect variants) reachable only through the
// prototype/QA switcher, never as primary navigation — the learner
// experiences Daily Study through the live "daily-study-session" flow
// instead (see DailyStudySession.tsx), started from Home or product nav.
const PROTOTYPE_ITEMS: PrototypeStateItem[] = [
  { id: "home", label: "Home / Today" },
  { id: "daily-study-learn", label: "Daily Study — Learn" },
  { id: "question-apply", label: "Question / Apply" },
  { id: "feedback-correct", label: "Feedback — Correct" },
  { id: "feedback-incorrect", label: "Feedback — Incorrect" },
  { id: "daily-study-completion", label: "Daily Study Completion" },
  { id: "practice-exam", label: "Practice Exam" },
  { id: "review-center", label: "Review Center" }
];

// Dev-only QA affordance (Phase 7B-1): lets a human reviewer preview any of
// the Domain 1 governance/authority sequence's four lessons as "today's
// lesson," one at a time, in the running production Daily Study session —
// see PrototypeSwitcher's "Today's lesson (QA)" panel. Never learner-facing
// navigation; scoped to exactly this slice's lessons, not every production
// lesson, to keep the panel legible.
const REVIEW_LESSON_ITEMS: PrototypeStateItem[] = [
  { id: "lesson.d1.governance-vs-management", label: "D1-U1 — Governance vs. Management" },
  { id: "lesson.d1.authority-follows-accountability", label: "D1-U2 — Authority Follows Accountability" },
  { id: "lesson.d1.governance-layer-authority", label: "D1-U3 — Governance Layer Authority" },
  { id: "lesson.d1.data-ownership-accountability", label: "D1-U4 — Data Ownership" },
  { id: "lesson.d1.security-strategy-alignment", label: "D1-U5 — Security Strategy & Alignment" },
  { id: "lesson.d1.business-justification-roadmap", label: "D1-U6 — Business Justification & Roadmaps" },
  { id: "lesson.d1.governance-effectiveness", label: "D1-U7 — Frameworks, GRC & Effectiveness" },
  { id: "lesson.d1.legal-regulatory-risk", label: "D1-U8 — Legal, Regulatory & Contractual Risk" },
  { id: "lesson.d1.organizational-culture-governance", label: "D1-U9 — Organizational Culture & Governance" },
  { id: "lesson.d2.risk-fundamentals", label: "D2-U1 — Risk Fundamentals & Emerging Risk" },
  { id: "lesson.d2.risk-assessment-lifecycle", label: "D2-U2 — Risk Assessment Lifecycle" },
  { id: "lesson.d2.risk-analysis-methods", label: "D2-U3 — Risk Analysis Methods" },
  { id: "lesson.d2.quantitative-risk-decisions", label: "D2-U4 — Quantitative Risk for Decisions" },
  { id: "lesson.d2.risk-evaluation", label: "D2-U5 — Risk Evaluation" },
  { id: "lesson.d2.risk-treatment-response", label: "D2-U6 — Risk Treatment / Response Selection" },
  { id: "lesson.d2.residual-risk-acceptability", label: "D2-U7 — Residual Risk & Acceptability" },
  { id: "lesson.d2.risk-control-ownership", label: "D2-U8 — Risk Owner vs. Control Owner" },
  { id: "lesson.d2.risk-monitoring-reporting", label: "D2-U9 — Risk Monitoring, Reassessment & Reporting" },
  { id: "lesson.d2.risk-management-embedding-synthesis", label: "D2-U10 — Embedding Risk Management & Domain 2 Synthesis" },
  { id: "lesson.d3.program-foundations", label: "D3-U1 — Program Foundations (Strategy to Program)" },
  { id: "lesson.d3.asset-classification", label: "D3-U2 — Asset Identification & Classification" },
  { id: "lesson.d3.policy-governance", label: "D3-U3 — Program-Level Policy Governance" },
  { id: "lesson.d3.control-design-selection", label: "D3-U4 — Control Design & Selection" },
  { id: "lesson.d3.control-implementation-integration", label: "D3-U5 — Control Implementation & Integration" },
  { id: "lesson.d3.control-testing-evaluation", label: "D3-U6 — Control Testing & Evaluation" },
  { id: "lesson.d3.awareness-training", label: "D3-U7 — Security Awareness & Training" },
  { id: "lesson.d3.external-services", label: "D3-U8 — Managing External Services" },
  { id: "lesson.d3.program-metrics-reporting", label: "D3-U9 — Program Metrics & Reporting" },
  { id: "lesson.d3.program-synthesis", label: "D3-U10 — Program Synthesis (Capstone)" },
  { id: "lesson.d4.program-foundations-readiness", label: "D4-U1 — Program Foundations & Readiness" },
  { id: "lesson.d4.business-impact-analysis-prioritization", label: "D4-U2 — Business Impact Analysis & Prioritization" },
  { id: "lesson.d4.incident-classification-severity", label: "D4-U3 — Incident Classification / Severity" },
  { id: "lesson.d4.escalation-communications", label: "D4-U4 — Escalation & Communications" },
  { id: "lesson.d4.incident-containment", label: "D4-U5 — Containment" },
  { id: "lesson.d4.evidence-investigation", label: "D4-U6 — Evidence Handling / Investigation" }
];

const SESSION_SCREENS = new Set([
  "daily-study-session",
  "daily-study-learn",
  "question-apply",
  "feedback-correct",
  "feedback-incorrect",
  "daily-study-completion",
  "practice-exam",
  // Phase 10B-3: the whole bounded Practice experience (scope/count
  // landing -> questions -> summary) recedes to a single Exit action, the
  // same treatment Daily Study's own bounded session already gets — never
  // trapping the learner (Exit always works), just matching the "focused,
  // deliberate, bounded" feel a start-to-finish session calls for. Explore
  // deliberately does NOT get this treatment (Phase 10B-2) since it's
  // open-ended browsing, not a bounded session.
  "practice"
]);

// Deliberately just the flow name, not the specific phase/outcome — the
// screen content itself (progress line, FeedbackPanel's own outcome
// heading) already communicates that detail. Repeating it in the topbar
// would be exactly the redundant chrome the redesign was asked to remove.
const SESSION_LABELS: Record<string, string> = {
  "daily-study-session": "Daily Study",
  "daily-study-learn": "Daily Study",
  "question-apply": "Daily Study",
  "feedback-correct": "Daily Study",
  "feedback-incorrect": "Daily Study",
  "daily-study-completion": "Daily Study",
  "practice-exam": "Practice Exam",
  practice: "Practice"
};

function sectionForScreen(id: string): string {
  if (id === "home") return "home";
  if (id === "practice-exam" || id === "review-center" || id === "explore") return "explore";
  if (id === "practice") return "practice";
  return "daily-study";
}

function renderScreen(
  id: string,
  onNavigate: (id: string) => void,
  contentSource: DailyStudyContentSource,
  exploreInitialConceptId: string | undefined,
  onExploreConceptHandoff: (conceptId?: string) => void
): JSX.Element {
  switch (id) {
    case "home":
      return <HomeScreen onNavigate={onNavigate} contentSource={contentSource} />;
    case "daily-study-session":
      return (
        <DailyStudySession
          contentSource={contentSource}
          onDone={() => onNavigate("home")}
          onExploreConcept={(conceptId) => onExploreConceptHandoff(conceptId)}
        />
      );
    case "daily-study-learn":
      return <DailyStudyLearnScreen />;
    case "question-apply":
      return <QuestionApplyScreen />;
    case "feedback-correct":
      return <FeedbackScreen feedback={feedbackCorrect} />;
    case "feedback-incorrect":
      return <FeedbackScreen feedback={feedbackIncorrect} />;
    case "daily-study-completion":
      return <CompletionScreen />;
    case "practice-exam":
      return <PracticeExamScreen onOpenReview={() => onNavigate("review-center")} />;
    case "review-center":
      return <ReviewCenterScreen onReturnToExam={() => onNavigate("practice-exam")} />;
    case "explore":
      return <ExploreScreen onExit={() => onNavigate("home")} initialConceptId={exploreInitialConceptId} />;
    case "practice":
      return (
        <PracticeScreen
          onExit={() => onNavigate("home")}
          onExploreConcept={(conceptId) => onExploreConceptHandoff(conceptId)}
        />
      );
    default:
      return <HomeScreen onNavigate={onNavigate} contentSource={contentSource} />;
  }
}

export function App(): JSX.Element {
  const [activeId, setActiveId] = useState("home");
  const [contentSourceMode, setContentSourceMode] = useState<ContentSourceMode>("prototype");
  const [reviewLessonId, setReviewLessonId] = useState(getTodaysLessonIdForReview());
  // Phase 10B-3: set only by Practice's summary "Explore" handoff, never by
  // normal product navigation — handleSelectProduct below always clears it,
  // so clicking the real "Explore" nav item never inherits a stale concept
  // from an earlier Practice session.
  const [exploreInitialConceptId, setExploreInitialConceptId] = useState<string | undefined>(undefined);

  const mode = SESSION_SCREENS.has(activeId) ? "session" : "full";
  const contentSource = contentSourceMode === "production" ? productionContentSource : prototypeContentSource;

  function handleSelectProduct(sectionId: string) {
    setExploreInitialConceptId(undefined);
    setActiveId(PRODUCT_ENTRY_SCREEN[sectionId] ?? "home");
  }

  function handleExploreConceptHandoff(conceptId?: string) {
    setExploreInitialConceptId(conceptId);
    setActiveId("explore");
  }

  function handleSelectReviewLesson(lessonId: string) {
    setTodaysLessonIdForReview(lessonId);
    setReviewLessonId(lessonId);
  }

  return (
    <ThemeProvider>
      <AppShell
        mode={mode}
        productNavItems={PRODUCT_NAV_ITEMS}
        activeProductId={sectionForScreen(activeId)}
        onSelectProduct={handleSelectProduct}
        sessionLabel={SESSION_LABELS[activeId]}
        prototypeItems={PROTOTYPE_ITEMS}
        activePrototypeId={activeId}
        onSelectPrototype={setActiveId}
        contentSourceMode={contentSourceMode}
        onSelectContentSourceMode={setContentSourceMode}
        reviewLessons={REVIEW_LESSON_ITEMS}
        activeReviewLessonId={reviewLessonId}
        onSelectReviewLesson={handleSelectReviewLesson}
      >
        {renderScreen(activeId, setActiveId, contentSource, exploreInitialConceptId, handleExploreConceptHandoff)}
      </AppShell>
    </ThemeProvider>
  );
}
