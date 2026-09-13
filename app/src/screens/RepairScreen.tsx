import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { ProgressLine } from "../components/ProgressLine/ProgressLine";
import { AnswerOption } from "../components/AnswerOption/AnswerOption";
import { Button } from "../components/Button/Button";
import type { AnswerOptionFixture, RepairCheckFixture } from "../types/content";
import { displayLetterForPosition } from "../content/answerOrder";
import "./RepairScreen.css";

interface RepairScreenProps {
  repairCheck: RepairCheckFixture;
  mistakeContext?: string;
  // LI-1: reports which option the learner actually selected, so a caller
  // can compare it against `repairCheck.options[].correct` and record the
  // result — this screen only renders the comparison (see the immediate
  // correct/wrong styling below); it doesn't own the correctness
  // determination itself.
  onContinue: (selectedKey: AnswerOptionFixture["key"]) => void;
}

/**
 * One controlled, targeted repair interaction — not a general repair
 * engine. Names the specific reasoning slip via `mistakeContext`, offers
 * a short corrective micro-question, then continues. `repairCheck` is
 * selected by the active content source based on which repair_target the
 * learner's wrong answer actually triggered.
 */
export function RepairScreen({ repairCheck, mistakeContext, onContinue }: RepairScreenProps): JSX.Element {
  const [selected, setSelected] = useState<AnswerOptionFixture["key"] | null>(null);
  const submitted = selected !== null;

  return (
    <div class="screen repair-screen">
      <div class="daily-study-header">
        <ProgressLine percent={90} label="Daily Study progress: phase 4 of 5" />
      </div>

      <p class="repair-eyebrow">Repair</p>
      <h1 class="repair-title">Let's correct that reasoning.</h1>

      {mistakeContext && <blockquote class="repair-mistake">{mistakeContext}</blockquote>}

      <p class="repair-prompt">{repairCheck.prompt}</p>

      <div class="repair-options" role="group" aria-label="Repair answer options">
        {repairCheck.options.map((option, index) => (
          <AnswerOption
            key={option.key}
            option={option}
            displayLetter={displayLetterForPosition(index)}
            selected={selected === option.key}
            submitted={submitted}
            onSelect={() => setSelected(option.key)}
          />
        ))}
      </div>

      {submitted && <p class="repair-confirmation">{repairCheck.confirmation}</p>}

      <div class="repair-actions">
        <Button disabled={!submitted} onClick={() => selected && onContinue(selected)}>Continue &rarr;</Button>
      </div>
    </div>
  );
}
