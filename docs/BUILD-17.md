# Build 17 — Corpus calibration

Data-layer build. No new engines, no questions added. Every change below is
derived from statistical analysis of a 1,123-question CISM question corpus
(1,205 pages across the four domains).

Source material was used for measurement only. No stems, options, or
justifications were copied into this repository.

## 1. Exam weighting corrected

`bank.weights` did not match ISACA's published job practice, so practice exams
tested the wrong mix and `weightedReadiness` was computed against wrong weights.

| Domain | Was | Now | ISACA | Corpus |
| --- | --- | --- | --- | --- |
| 1 Governance | 17% | 17% | 17% | 17.9% |
| 2 Risk Management | 33% | 20% | 20% | 20.7% |
| 3 Security Program | 30% | 33% | 33% | 37.6% |
| 4 Incident Management | 20% | 30% | 30% | 23.8% |

`buildSession` counts moved from `{1:7, 2:13, 3:12, 4:8}` to
`{1:7, 2:8, 3:13, 4:12}` — 17.5 / 20 / 32.5 / 30 percent of a 40-question exam.
Bank supply confirmed sufficient for every domain (28 / 31 / 31 / 29 available).

## 2. Missing qualifiers added

The corpus contains qualifiers the decoder could not represent, so a learner had
no chip to select on roughly 7% of exam-style questions.

| Qualifier | Corpus share | Status |
| --- | --- | --- |
| MOST | 31.5% | already modelled |
| BEST | 20.4% | already modelled |
| FIRST | 7.4% | already modelled |
| PRIMARY | 7.0% | already modelled |
| PRIMARILY | 3.7% | **added** |
| GREATEST | 2.0% | **added** |
| MAIN | 1.3% | **added** |
| NEXT | 0.7% | already modelled |

Each new chip has a full decoder explanation and memory rule, so none can render
as `undefined`.

## 3. MOST vs BEST decoder lesson

MOST and BEST together account for 52% of corpus questions — more than every
other qualifier combined — and had no dedicated teaching. The new lesson frames
the distinction as ranking versus fit:

- MOST asks you to rank. Several options are true; one carries the greatest
  business weight.
- BEST asks you to fit. Several options are reasonable; one most completely
  solves the problem as stated.

## 4. Decoder lesson rotation

`decoderLesson()` resolved with `.find()`, which returns only the first lesson
for a dimension. With two qualifier lessons now present, the second would have
been unreachable. Lessons for a dimension now rotate across days, keyed to the
number of completed decoder phases.

## Corpus findings recorded but NOT acted on in this build

These require rewriting question content and are scoped to Build 18:

- **Option length.** Corpus options have a median of 8 words and 95.4% are noun
  phrases. All three of our layers sit at a median of 3 words
  (mixed-practice 2.9, exam-bank extras 3.4, pattern-bank 2.9). Short options
  make discrimination artificially easy; this is the largest realism gap.
- **Qualifier mix in our own banks.** Ours over-represents NEXT (10% vs 0.7%)
  and FIRST (15% vs 7.4%), and under-represents MOST (15% vs 31.5%). Correcting
  this means editing stems, not just tags, because the qualifier tag must match
  the word actually printed in the stem.
- **Stem length.** Corpus median is 18 words with 12% running past 31 words. Our
  banks have no stems over 30 words at all.
- **Role framing.** 79.7% of corpus stems name no actor. Mixed Practice requires
  a role selection on every question; `None/implicit` already exists as a chip
  but our banks under-use it.

## Validation

`docs/BUILD-17-VALIDATION.md`.
