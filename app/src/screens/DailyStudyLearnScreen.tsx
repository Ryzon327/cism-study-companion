import type { JSX } from "preact";
import { ProgressLine } from "../components/ProgressLine/ProgressLine";
import { PatternCallout } from "../components/PatternCallout/PatternCallout";
import { Scenario } from "../components/Scenario/Scenario";
import { MemoryRule } from "../components/MemoryRule/MemoryRule";
import { Button } from "../components/Button/Button";
import type { LessonFixture } from "../types/content";
import { lesson as defaultLesson } from "../data/fixtures";
import "./DailyStudyLearnScreen.css";

interface DailyStudyLearnScreenProps {
  lesson?: LessonFixture;
  onApply?: () => void;
}

export function DailyStudyLearnScreen({ lesson = defaultLesson, onApply }: DailyStudyLearnScreenProps = {}): JSX.Element {
  return (
    <div class="screen daily-study-screen">
      <div class="daily-study-header">
        <ProgressLine percent={40} label="Daily Study progress: phase 2 of 5" />
      </div>

      <article class="lesson">
        <p class="lesson-domain">{lesson.domainLabel}</p>
        <h1 class="lesson-title">{lesson.conceptTitle}</h1>
        <p class="lesson-why">{lesson.whyItMatters}</p>
        <p class="lesson-body">{lesson.context}</p>

        {lesson.pattern && <PatternCallout pattern={lesson.pattern} />}

        <Scenario>{lesson.scenario}</Scenario>

        <MemoryRule>{lesson.memoryRule}</MemoryRule>
      </article>

      <div class="daily-study-actions">
        <Button onClick={onApply}>Apply it &rarr;</Button>
      </div>
    </div>
  );
}
