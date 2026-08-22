import type { JSX } from "preact";
import { Button } from "../components/Button/Button";
import { Journey } from "../components/Journey/Journey";
import type { DailyStudyContentSource } from "../session/contentSource";
import "./HomeScreen.css";

interface HomeScreenProps {
  onNavigate: (id: string) => void;
  contentSource: DailyStudyContentSource;
}

export function HomeScreen({ onNavigate, contentSource }: HomeScreenProps): JSX.Element {
  const { journeySteps, todayFocus } = contentSource.getHomeState();
  return (
    <div class="screen home-screen">
      <h1 class="visually-hidden">Today</h1>

      <section class="home-hero" aria-labelledby="home-hero-title">
        <div class="home-hero-main">
          <p class="home-hero-eyebrow">Continue your journey</p>
          <span class="home-domain-pill">{todayFocus.domainLabel}</span>
          <h2 id="home-hero-title" class="home-hero-title">{todayFocus.title}</h2>
          <p class="home-hero-reason">{todayFocus.reason}</p>
          <div class="home-hero-actions">
            <Button onClick={() => onNavigate("daily-study-session")}>Start Today's Study &rarr;</Button>
            <span class="home-hero-meta">Quick study session</span>
          </div>
        </div>

        <aside class="home-hero-snapshot" aria-hidden="true">
          <span class="home-hero-snapshot-numeral">{todayFocus.domainNumeral}</span>
          <span class="home-hero-snapshot-position">{todayFocus.domainPosition}</span>
          <span class="home-hero-snapshot-rule" />
          <span class="home-hero-snapshot-label">Focus</span>
          <span class="home-hero-snapshot-detail">{todayFocus.focus}</span>
        </aside>
      </section>

      <section class="home-journey" aria-labelledby="home-journey-title">
        <div class="home-section-heading">
          <h2 id="home-journey-title" class="home-section-title">Your journey</h2>
          <p class="home-journey-sub">{todayFocus.domainPosition}</p>
        </div>
        <Journey steps={journeySteps} currentDetail={todayFocus.title} />
      </section>

      <section class="home-secondary" aria-labelledby="home-secondary-title">
        <div>
          <h2 id="home-secondary-title" class="home-secondary-title">Explore &amp; Practice</h2>
          <p class="home-secondary-text">
            Optional additional practice, whenever you want it — browse by domain or start a timed
            practice exam.
          </p>
        </div>
        <button type="button" class="home-secondary-link" onClick={() => onNavigate("practice-exam")}>
          Browse Explore &amp; Practice &rarr;
        </button>
      </section>
    </div>
  );
}
