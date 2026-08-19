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
import { DailyStudySession } from "./session/DailyStudySession";
import type { DailyStudyContentSource } from "./session/contentSource";
import { prototypeContentSource } from "./data/prototypeContentSource";
import { productionContentSource } from "./content/productionContentSource";
import { feedbackCorrect, feedbackIncorrect } from "./data/fixtures";

// The learner's real navigation: three destinations, matching the intended
// final application. "Daily Study" enters the live, controlled Recall →
// Learn → Apply → Feedback → Completion experience; "Explore & Practice"
// enters Practice Exam. Deliberately separate from the Visual Prototype
// Gate states below, which exist for QA only.
const PRODUCT_NAV_ITEMS: ProductNavItem[] = [
  { id: "home", label: "Home" },
  { id: "daily-study", label: "Daily Study" },
  { id: "explore", label: "Explore & Practice" }
];

const PRODUCT_ENTRY_SCREEN: Record<string, string> = {
  home: "home",
  "daily-study": "daily-study-session",
  explore: "practice-exam"
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

const SESSION_SCREENS = new Set([
  "daily-study-session",
  "daily-study-learn",
  "question-apply",
  "feedback-correct",
  "feedback-incorrect",
  "daily-study-completion",
  "practice-exam"
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
  "practice-exam": "Practice Exam"
};

function sectionForScreen(id: string): string {
  if (id === "home") return "home";
  if (id === "practice-exam" || id === "review-center") return "explore";
  return "daily-study";
}

function renderScreen(
  id: string,
  onNavigate: (id: string) => void,
  contentSource: DailyStudyContentSource
): JSX.Element {
  switch (id) {
    case "home":
      return <HomeScreen onNavigate={onNavigate} />;
    case "daily-study-session":
      return <DailyStudySession contentSource={contentSource} onDone={() => onNavigate("home")} />;
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
    default:
      return <HomeScreen onNavigate={onNavigate} />;
  }
}

export function App(): JSX.Element {
  const [activeId, setActiveId] = useState("home");
  const [contentSourceMode, setContentSourceMode] = useState<ContentSourceMode>("prototype");

  const mode = SESSION_SCREENS.has(activeId) ? "session" : "full";
  const contentSource = contentSourceMode === "production" ? productionContentSource : prototypeContentSource;

  function handleSelectProduct(sectionId: string) {
    setActiveId(PRODUCT_ENTRY_SCREEN[sectionId] ?? "home");
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
      >
        {renderScreen(activeId, setActiveId, contentSource)}
      </AppShell>
    </ThemeProvider>
  );
}
