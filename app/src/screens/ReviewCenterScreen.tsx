import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { ReviewQueueGrid } from "../components/ReviewQueueGrid/ReviewQueueGrid";
import { Button } from "../components/Button/Button";
import { Dialog } from "../components/Dialog/Dialog";
import { examQuestions } from "../data/fixtures";
import "./ReviewCenterScreen.css";

interface ReviewCenterScreenProps {
  onReturnToExam: () => void;
}

export function ReviewCenterScreen({ onReturnToExam }: ReviewCenterScreenProps): JSX.Element {
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const marked = examQuestions.filter((q) => q.marked);
  const unanswered = examQuestions.filter((q) => !q.answered);
  const answeredCount = examQuestions.length - unanswered.length;

  return (
    <div class="screen review-center-screen">
      <p class="review-center-eyebrow">Review Center</p>
      <h1 class="review-center-title">Review what matters before you submit.</h1>
      <p class="review-center-summary">
        You answered <strong>{answeredCount}</strong> of {examQuestions.length}. {marked.length}{" "}
        question{marked.length === 1 ? " is" : "s are"} marked for review.
      </p>

      <section class="review-section" aria-labelledby="review-marked-title">
        <div class="review-section-heading">
          <h2 id="review-marked-title">Marked for review</h2>
          <span class="review-count-pill">{marked.length}</span>
        </div>
        <ReviewQueueGrid items={marked} emptyLabel="Nothing marked" />
        {marked.length > 0 && (
          <button type="button" class="review-all-btn">Review marked questions in order →</button>
        )}
      </section>

      <section class="review-section" aria-labelledby="review-unanswered-title">
        <div class="review-section-heading">
          <h2 id="review-unanswered-title">Unanswered</h2>
          <span class="review-count-pill">{unanswered.length}</span>
        </div>
        <ReviewQueueGrid items={unanswered} emptyLabel="All questions answered" />
        {unanswered.length > 0 && (
          <button type="button" class="review-all-btn">Review unanswered questions in order →</button>
        )}
      </section>

      <div class="review-center-actions">
        <Button variant="secondary" onClick={onReturnToExam}>Return to exam</Button>
        <Button onClick={() => setSubmitDialogOpen(true)}>Submit practice exam</Button>
      </div>

      <Dialog
        open={submitDialogOpen}
        titleId="submit-dialog-title"
        title="Submit practice exam?"
        onClose={() => setSubmitDialogOpen(false)}
      >
        <p>
          You have {unanswered.length} unanswered question{unanswered.length === 1 ? "" : "s"}. You can
          still go back and review before submitting.
        </p>
        <div class="dialog-actions">
          <Button variant="secondary" onClick={() => setSubmitDialogOpen(false)}>Keep reviewing</Button>
          <Button onClick={() => setSubmitDialogOpen(false)}>Submit anyway</Button>
        </div>
      </Dialog>
    </div>
  );
}
