import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { ProgressLine } from "../components/ProgressLine/ProgressLine";
import { AnswerOption } from "../components/AnswerOption/AnswerOption";
import { Button } from "../components/Button/Button";
import type { AnswerOptionFixture, RecallCheckFixture } from "../types/content";
import "./RecallScreen.css";

interface RecallScreenProps {
  recallCheck: RecallCheckFixture;
  onContinue: () => void;
}

/**
 * Brief cumulative-recall check drawn from an already-taught lesson,
 * shown before new learning. `recallCheck` is resolved by the active
 * content source (Phase 5B prototype fixtures or the production content
 * loader) — this component never knows which. Deliberately short: one
 * question, immediate reinforcement, continue.
 */
export function RecallScreen({ recallCheck, onContinue }: RecallScreenProps): JSX.Element {
  const [selected, setSelected] = useState<AnswerOptionFixture["key"] | null>(null);
  const submitted = selected !== null;
  const selectedOption = recallCheck.options.find((o) => o.key === selected);
  const correctOption = recallCheck.options.find((o) => o.correct);

  return (
    <div class="screen recall-screen">
      <div class="daily-study-header">
        <ProgressLine percent={20} label="Daily Study progress: phase 1 of 5" />
      </div>

      <p class="recall-eyebrow">Recall</p>
      <p class="recall-domain">{recallCheck.domainLabel}</p>
      <h1 class="recall-prompt">{recallCheck.prompt}</h1>

      <div class="recall-options" role="group" aria-label="Recall answer options">
        {recallCheck.options.map((option) => (
          <AnswerOption
            key={option.key}
            option={option}
            selected={selected === option.key}
            submitted={submitted}
            onSelect={() => setSelected(option.key)}
          />
        ))}
      </div>

      {submitted && (
        <p class="recall-reinforcement">
          {!selectedOption?.correct && correctOption && (
            <span class="recall-correction">Actually: {correctOption.text}. </span>
          )}
          {recallCheck.reinforcement}
        </p>
      )}

      <div class="recall-actions">
        <Button disabled={!submitted} onClick={onContinue}>Continue to today's lesson &rarr;</Button>
      </div>
    </div>
  );
}
