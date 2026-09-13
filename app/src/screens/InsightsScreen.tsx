import type { JSX } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button/Button";
import { Dialog } from "../components/Dialog/Dialog";
import { listLearningEvents, resetLearningHistory, isQuestionAttemptEvent, type LearningEvent } from "../learning-history";
import { deriveLearningInsights } from "../learning-intelligence";
import { buildInsightsViewModel, type InsightsStatus, type InsightsViewModel } from "../insights/insightPresentation";
import { buildStudyHistoryExport, downloadStudyHistoryExport } from "../insights/studyHistoryExport";
import "./InsightsScreen.css";

const EMPTY_VIEW_MODEL: InsightsViewModel = { status: "no-history", focusNext: [], strongerAreas: [], trendSummaries: [], domainSummary: null };

/**
 * LI-3: the one learner-facing surface reading Learning Intelligence
 * history — pure interpretation of LI-2's deterministic output, never a
 * re-implementation of it. One IndexedDB read per visit
 * (`listLearningEvents()`), then `deriveLearningInsights()` (pure, no
 * IndexedDB) derives the result every child section reads from — no
 * section queries storage independently. Screen-entry refresh only: no
 * polling, no reactive subscription (see docs/architecture/
 * LI-3-IMPLEMENTATION-RECORD.md's data-flow section).
 */
export function InsightsScreen(): JSX.Element {
  const [status, setStatus] = useState<InsightsStatus | "loading">("loading");
  const [viewModel, setViewModel] = useState<InsightsViewModel>(EMPTY_VIEW_MODEL);
  const [productionAttemptCount, setProductionAttemptCount] = useState(0);
  const [rawEvents, setRawEvents] = useState<LearningEvent[]>([]);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const events = await listLearningEvents();
      const insights = deriveLearningInsights(events);
      const nextViewModel = buildInsightsViewModel(insights);
      setRawEvents(events);
      setProductionAttemptCount(events.filter((e) => e.sourceContext === "production" && isQuestionAttemptEvent(e)).length);
      setViewModel(nextViewModel);
      setStatus(nextViewModel.status);
    } catch {
      setStatus("error");
      setViewModel(EMPTY_VIEW_MODEL);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleExport() {
    const payload = buildStudyHistoryExport(rawEvents);
    downloadStudyHistoryExport(payload);
  }

  async function handleConfirmReset() {
    await resetLearningHistory();
    setResetDialogOpen(false);
    await refresh();
  }

  return (
    <div class="screen insights-screen">
      <p class="insights-eyebrow">Insights</p>
      <h1 class="insights-title">What to focus on</h1>

      {status === "loading" && <p class="insights-status-text">Loading your study insights…</p>}

      {status === "error" && (
        <p class="insights-status-text" role="status">
          Study insights couldn't be loaded right now. You can keep studying — Daily Study, Explore, and
          Practice are unaffected.
        </p>
      )}

      {status === "no-history" && (
        <div class="insights-empty" role="status">
          <p class="insights-empty-headline">Your study insights will appear as you answer questions.</p>
          <p class="insights-empty-detail">
            Keep studying normally. Insights become more useful as the app sees how your reasoning transfers
            across different questions.
          </p>
        </div>
      )}

      {status === "insufficient-evidence" && (
        <div class="insights-empty" role="status">
          <p class="insights-empty-headline">Building your study picture</p>
          <p class="insights-empty-detail">
            You've started creating history, but there isn't enough varied evidence yet to identify reliable
            focus areas.
          </p>
        </div>
      )}

      {status === "ready" && (
        <div class="insights-sections">
          {viewModel.focusNext.length > 0 && (
            <section class="insights-section" aria-labelledby="insights-focus-next-heading">
              <h2 id="insights-focus-next-heading" class="insights-section-heading">Focus next</h2>
              <ul class="insights-card-list">
                {viewModel.focusNext.map((item) => (
                  <li key={item.key} class={`insights-card insights-card-${item.state === "NEEDS_REVIEW" ? "needs-review" : "developing"}`}>
                    <div class="insights-card-header">
                      <h3 class="insights-card-title">{item.displayLabel}</h3>
                      <span class="insights-card-state">{item.stateLabel}</span>
                    </div>
                    {item.whyLines.length > 0 && (
                      <ul class="insights-card-why">
                        {item.whyLines.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    )}
                    {item.evidenceLines.length > 0 && (
                      <ul class="insights-card-evidence">
                        {item.evidenceLines.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    )}
                    <p class="insights-card-action">
                      <span class="insights-card-action-label">Next</span>
                      {item.suggestedAction}
                    </p>
                  </li>
                ))}
              </ul>
              {viewModel.domainSummary && <p class="insights-domain-summary">{viewModel.domainSummary}</p>}
            </section>
          )}

          {viewModel.trendSummaries.length > 0 && (
            <section class="insights-section" aria-labelledby="insights-trend-heading">
              <h2 id="insights-trend-heading" class="insights-section-heading">How you're doing</h2>
              <ul class="insights-trend-list">
                {viewModel.trendSummaries.map((trend) => (
                  <li key={trend.key}>
                    <span class="insights-trend-label">{trend.displayLabel}:</span> {trend.trendLabel}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {viewModel.strongerAreas.length > 0 && (
            <section class="insights-section" aria-labelledby="insights-stronger-heading">
              <h2 id="insights-stronger-heading" class="insights-section-heading">Stronger areas</h2>
              <ul class="insights-stronger-list">
                {viewModel.strongerAreas.map((area) => (
                  <li key={area.key} class="insights-stronger-item">
                    <span class="insights-stronger-title">{area.displayLabel}</span>
                    <span class="insights-stronger-note">Recent evidence is stronger here.</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <section class="insights-section insights-study-data" aria-labelledby="insights-study-data-heading">
        <h2 id="insights-study-data-heading" class="insights-section-heading">Study data</h2>
        <p class="insights-study-data-text">Your study history is stored only in this browser on this device.</p>
        <p class="insights-study-data-text">It is not currently synced or backed up online.</p>
        {productionAttemptCount > 0 && (
          <p class="insights-study-data-count">
            {productionAttemptCount} recorded question attempt{productionAttemptCount === 1 ? "" : "s"}
          </p>
        )}
        <div class="insights-study-data-actions">
          <Button variant="secondary" onClick={handleExport} disabled={rawEvents.length === 0}>
            Export study history
          </Button>
          <Button variant="secondary" onClick={() => setResetDialogOpen(true)} disabled={rawEvents.length === 0}>
            Reset study history
          </Button>
        </div>
      </section>

      <Dialog
        open={resetDialogOpen}
        titleId="reset-history-dialog-title"
        title="Reset study history?"
        onClose={() => setResetDialogOpen(false)}
      >
        <p>
          This deletes the study history stored in this browser. It cannot be undone unless you previously
          exported a copy.
        </p>
        <div class="dialog-actions">
          <Button variant="secondary" onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmReset}>Reset history</Button>
        </div>
      </Dialog>
    </div>
  );
}
