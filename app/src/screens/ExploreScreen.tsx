import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { Button } from "../components/Button/Button";
import { MemoryRule } from "../components/MemoryRule/MemoryRule";
import { QuestionAttemptFlow } from "../session/QuestionAttemptFlow";
import {
  listExploreDomains,
  listExploreConcepts,
  getExploreConceptDetail,
  getExploreScenarioQuestion
} from "../content/explore";
import { productionContentSource } from "../content/productionContentSource";
import "./ExploreScreen.css";

type ExplorePhase = "domains" | "concepts" | "concept" | "scenario";

interface ExploreScreenProps {
  onExit: () => void;
}

/**
 * Explore — "let me understand or revisit something specific," distinct
 * from Daily Study's guided "teach me what I should learn next." The
 * learner deliberately chooses a domain, then a concept, sees a concise
 * concept-focused review composed from already-authored curriculum data
 * (see app/src/content/explore.ts), and may optionally attempt one
 * concept-tied scenario through the exact same shared
 * QuestionAttemptFlow -> Feedback -> Repair pipeline Daily Study uses.
 * There is no random question launcher: every question shown here is
 * reached only by a learner's own domain -> concept choice.
 *
 * Deliberately NOT a locked/focused session like Daily Study (it is never
 * added to App.tsx's SESSION_SCREENS) — normal product navigation stays
 * visible throughout, so the learner is never trapped and can always leave
 * or jump back to a different concept.
 */
export function ExploreScreen({ onExit }: ExploreScreenProps): JSX.Element | null {
  const [phase, setPhase] = useState<ExplorePhase>("domains");
  const [domainId, setDomainId] = useState<string | null>(null);
  const [conceptId, setConceptId] = useState<string | null>(null);

  if (phase === "domains") {
    const domains = listExploreDomains();
    return (
      <div class="screen explore-screen">
        <p class="explore-eyebrow">Explore</p>
        <h1 class="explore-title">Choose something to revisit</h1>
        <p class="explore-intro">Pick a domain, then a concept — a concise review, and an optional scenario if you want one.</p>

        {domains.length === 0 ? (
          <p class="explore-empty">Nothing is available to explore yet.</p>
        ) : (
          <ul class="explore-list" aria-label="Domains">
            {domains.map((domain) => (
              <li key={domain.id}>
                <button
                  type="button"
                  class="explore-list-item"
                  onClick={() => {
                    setDomainId(domain.id);
                    setPhase("concepts");
                  }}
                >
                  <span class="explore-list-item-title">{domain.label}</span>
                  <span class="explore-list-item-meta">{domain.conceptCount} concept{domain.conceptCount === 1 ? "" : "s"}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div class="explore-actions">
          <Button variant="secondary" onClick={onExit}>Done</Button>
        </div>
      </div>
    );
  }

  if (phase === "concepts") {
    if (!domainId) return null;
    const concepts = listExploreConcepts(domainId);
    const domain = listExploreDomains().find((d) => d.id === domainId);
    return (
      <div class="screen explore-screen">
        <button type="button" class="explore-back" onClick={() => setPhase("domains")}>&larr; Domains</button>
        <p class="explore-eyebrow">Explore</p>
        <h1 class="explore-title">{domain?.label ?? "Concepts"}</h1>

        {concepts.length === 0 ? (
          <p class="explore-empty">No concepts are available in this domain yet.</p>
        ) : (
          <ul class="explore-list" aria-label={`Concepts in ${domain?.label ?? "this domain"}`}>
            {concepts.map((concept) => (
              <li key={concept.id}>
                <button
                  type="button"
                  class="explore-list-item"
                  onClick={() => {
                    setConceptId(concept.id);
                    setPhase("concept");
                  }}
                >
                  <span class="explore-list-item-title">{concept.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (phase === "concept") {
    if (!conceptId) return null;
    const detail = getExploreConceptDetail(conceptId);
    if (!detail) {
      return (
        <div class="screen explore-screen">
          <p class="explore-empty">That concept isn't available right now.</p>
          <div class="explore-actions">
            <Button variant="secondary" onClick={() => setPhase("domains")}>Back to Explore</Button>
          </div>
        </div>
      );
    }

    return (
      <div class="screen explore-screen">
        <button type="button" class="explore-back" onClick={() => setPhase("concepts")}>&larr; {detail.domainLabel}</button>

        <article class="explore-concept">
          <p class="explore-eyebrow">{detail.domainLabel}</p>
          <h1 class="explore-title">{detail.title}</h1>
          <p class="explore-concept-plain">{detail.whatIsThis}</p>

          {detail.perspective && (
            <p class="explore-concept-perspective">
              <span class="explore-concept-label">Perspective</span>
              {detail.perspective}
            </p>
          )}

          {detail.recognitionClue && (
            <p class="explore-concept-field">
              <span class="explore-concept-label">Notice this</span>
              {detail.recognitionClue}
            </p>
          )}

          {detail.trap && (
            <p class="explore-concept-field">
              <span class="explore-concept-label">Common trap</span>
              {detail.trap}
            </p>
          )}

          {detail.memoryRule && <MemoryRule>{detail.memoryRule}</MemoryRule>}
        </article>

        <div class="explore-actions">
          {detail.hasScenario && <Button onClick={() => setPhase("scenario")}>Try a scenario &rarr;</Button>}
          <Button variant="secondary" onClick={() => setPhase("concepts")}>Explore another concept</Button>
        </div>
      </div>
    );
  }

  // phase === "scenario"
  if (!conceptId) return null;
  const scenario = getExploreScenarioQuestion(conceptId);
  if (!scenario) {
    return (
      <div class="screen explore-screen">
        <p class="explore-empty">No scenario is available for this concept right now.</p>
        <div class="explore-actions">
          <Button variant="secondary" onClick={() => setPhase("concept")}>Back to concept</Button>
        </div>
      </div>
    );
  }

  return (
    <QuestionAttemptFlow
      question={scenario.question}
      meta={scenario.meta}
      buildFeedback={productionContentSource.buildFeedback}
      getRepairCheck={productionContentSource.getRepairCheck}
      onComplete={() => setPhase("concept")}
    />
  );
}
