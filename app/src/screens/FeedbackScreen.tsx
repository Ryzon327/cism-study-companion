import type { JSX } from "preact";
import { ProgressLine } from "../components/ProgressLine/ProgressLine";
import { FeedbackPanel } from "../components/FeedbackPanel/FeedbackPanel";
import { Button } from "../components/Button/Button";
import type { FeedbackFixture } from "../types/content";
import "./FeedbackScreen.css";

interface FeedbackScreenProps {
  feedback: FeedbackFixture;
  onContinue?: () => void;
}

export function FeedbackScreen({ feedback, onContinue }: FeedbackScreenProps): JSX.Element {
  return (
    <div class="screen feedback-screen">
      <div class="daily-study-header">
        <ProgressLine percent={80} label="Daily Study progress: phase 4 of 5" />
      </div>

      <FeedbackPanel feedback={feedback} />

      <div class="feedback-actions">
        <Button onClick={onContinue}>Continue →</Button>
      </div>
    </div>
  );
}
