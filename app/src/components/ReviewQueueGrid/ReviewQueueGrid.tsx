import type { JSX } from "preact";
import type { ExamQuestionState } from "../../types/content";
import "./ReviewQueueGrid.css";

interface ReviewQueueGridProps {
  items: ExamQuestionState[];
  emptyLabel: string;
}

export function ReviewQueueGrid({ items, emptyLabel }: ReviewQueueGridProps): JSX.Element {
  if (items.length === 0) {
    return <p class="review-queue-empty">{emptyLabel}</p>;
  }

  return (
    <div class="review-queue-grid">
      {items.map((item) => (
        <button
          key={item.index}
          type="button"
          class={`review-queue-item ${item.answered ? "review-queue-item-answered" : "review-queue-item-unanswered"}`}
        >
          <span class="review-queue-number">{item.index}</span>
          <span class="review-queue-status">
            <span aria-hidden="true">{item.answered ? "✓" : "○"}</span>
            {item.answered ? "Answered" : "Unanswered"}
          </span>
        </button>
      ))}
    </div>
  );
}
