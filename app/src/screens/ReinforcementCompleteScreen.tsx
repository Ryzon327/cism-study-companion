import type { JSX } from "preact";
import { Button } from "../components/Button/Button";
import "./ReinforcementCompleteScreen.css";

interface MissedConcept {
  id: string;
  label: string;
}

interface ReinforcementCompleteScreenProps {
  questionCount: number;
  missedConcepts: MissedConcept[];
  onDone: () => void;
  onExploreConcept: (conceptId: string) => void;
}

/**
 * The deliberately minimal end of Optional Reinforcement — no grade, no
 * percentage, no pass/fail, no mastery/readiness score, no badges or
 * streaks. Just a truthful count and, only when a miss this round actually
 * ties to a concept, one lightweight link into Explore's existing routing.
 */
export function ReinforcementCompleteScreen({
  questionCount,
  missedConcepts,
  onDone,
  onExploreConcept
}: ReinforcementCompleteScreenProps): JSX.Element {
  return (
    <div class="screen reinforcement-complete-screen">
      <p class="reinforcement-complete-eyebrow">Reinforcement</p>
      <h1 class="reinforcement-complete-title">Reinforcement complete</h1>
      <p class="reinforcement-complete-line">
        {questionCount} question{questionCount === 1 ? "" : "s"} completed
      </p>

      {missedConcepts.length > 0 && (
        <div class="reinforcement-complete-review">
          <p class="reinforcement-complete-review-label">Review</p>
          <ul class="reinforcement-complete-review-list">
            {missedConcepts.map((concept) => (
              <li key={concept.id} class="reinforcement-complete-review-item">
                <span>{concept.label}</span>
                <button type="button" class="reinforcement-complete-review-link" onClick={() => onExploreConcept(concept.id)}>
                  Explore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div class="reinforcement-complete-actions">
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}
