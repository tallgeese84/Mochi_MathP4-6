# v4.1.0 — Illustrated science refresh

- Added original painted organ studies, matching insulated/bare cups and a dynamics cart.
- Replaced the body flowchart with an illustrated study and readable pathway steps.
- Gave food-web arrows fixed-size heads and clear gaps around labels. Opposing force
  arrows occupy separate lanes and share one length scale.
- Reveal cooling curves and body explanations after a recorded prediction and trial;
  keep these explanations out of independent checks.
- Optimised the new art to WebP (about 206 KB combined) and added offline caching.

# v4.0.0 — Maths and science trial

- Added eight illustrated science activity areas with original botanical and pond
  artwork, checked scientific diagrams, prediction-led trials and a saved notebook.
- Added 24 science practice questions and 8 reserved independent checks with
  delayed feedback, assistance/guess tracking, review selection and parent evidence.
- Integrated subject navigation, stylus notes/transcription, the existing tutor
  connection and combined learning backups. Preserved all existing maths features.
- Added eight connected maths problem generators (88 total) and independent checks.
- 147 tests pass; first browser/device and live-provider trial remains outstanding.

## 3.2.0 — Reading comfort and Euna’s avatar

- Larger question text (24px on phones, 28px on tablets, up to 30px on desktop at default browser size), smaller topic headings and improved spacing.
- Larger answer fields and choices; full-width Check answer on phones. Side-by-side question and writing on wide screens in Stylus mode.
- Reused the original Euna avatar from the supplied Pokémon Academy app in her profile and session panel.
- Purple paw icons throughout, including browser and home-screen icons; versioned URLs avoid stale orange artwork.

## 3.1.0 — Purple mobile studio

- Purple theme, a single mobile dock and large, faint Mochi cat watermarks.
- Keyboard / Stylus toggle beside the answer; preserve text, ink and answer when switching.
- Typed step entry and stylus writing with pressure, undo, eraser and palm filtering.
- Scale ink consistently on resizing; reject stale recognition after edits.
- Handwriting proposes an answer for learner review; never submits automatically.
- 125 automated tests pass, including 8,000 generated questions and seven input-flow checks. Actual iPad/Apple Pencil use and live recognition require a device trial.

## v3.0.0 — 2026-09-11

- Completely replace the GUI stylesheet and rebuild the practice hierarchy around
  an open question surface, large topic typography and a single answer composer.
- Use graphite, white and electric citron; replace the bottom-only dock with
  floating desktop instruments and a separate Ask Mochi conversation control.
- Rework the learning map as a skill index and evidence inspector, and redesign
  the tutor, reasoning stages, visual lab, session controls and parent settings.
- Add a subtle session progress line, responsive navigation, enlarged-text
  navigation overflow and reduced-motion support. Preserve existing learning data.
- Validate the existing 118 tests and static asset/control checks. Browser visual
  checks and live-provider tests have not been performed.

## v2.1.0 — 2026-09-11

- Simplify the first screen to a single question sheet and answer field.
- Introduce a floating six-icon dock with persistent labels, soft shadows, subtle
  motion and reduced-motion support; use warm white and muted green throughout.
- Move reasoning, sketching, session controls, resources and tutor conversation
  into one on-demand panel at a time. Preserve working when switching tools.
- Keep the active question visible beside tools on wide screens; add a collapsible
  problem reference inside mobile panels. Offer reflection after answering.
- Maintain focus restoration, Escape dismissal and keyboard-accessible controls.
- Bump the offline shell and application versions to refresh the deployed UI.
- Validate all 118 tests, including new panel state and assistance-accounting checks.
  Browser and live AI-provider testing have not been performed.

## v2.0.0 — 2026-09-11

- Rebuild the GUI as a minimal maths studio with a focused problem canvas, floating
  tutor, movable visual lab, clickable learning map and responsive layouts.
- Add four reasoning stages with revision history, solution-route observations,
  concept probes and tutor context drawn from the learner’s actual reasoning.
- Add interactive fractions/number lines, ratio bars, area/perimeter grids and dot
  patterns; record predictions, experiments and independent checks.
- Add 8 original challenge generators (80 total), including invariants, exhaustive
  counting, worst-case guarantees, constrained cases and optimisation.
- Adapt difficulty to recent independent evidence; use concept probes to guide
  repair; support focused practice from the map. Skips do not diagnose mistakes.
- Tighten transfer evidence: new numbers or a review slot alone do not qualify.
- Keep reasoning and external assessments in validated local learning backups;
  do not infer percentiles or guarantee top 1% outcomes.
- Enable browser zoom, reduced-motion preferences, stage keyboard navigation and
  accessible panel controls; preserve offline practice and the existing cat room.
- Validate 113 tests, including 8,000 generated questions. Browser/iPad and live
  provider checks remain outstanding.

## v1.4.0 — 2026-09-11

- Add a personal learning notebook with 17 core skill checks, 19 evidence groups,
  adaptive daily sessions, spaced review, extension investigations and local backup.
- Review the original 42 generators and add 30 original question types; align core
  versus extension routing with MOE's current primary syllabus.
- Add responsive, evidence-aware tutoring, a plan/confidence/obstacle record,
  revision after errors, independent verification and resource-evaluation notes.
- Add typed learner-supplied problems with unverified AI discussion and no marking.
- Repair unknown-depth answer leakage, percentage-decrease working, mixed-number
  parsing, loose answer tolerance, misleading working feedback and async races.
- Preserve old progress as legacy totals, preserve the cat/room and provider setup,
  and separate static modules for review without adding runtime dependencies.
- Update offline cache/version handling, standards audit and executable tests.

# Changelog

## v1.3.0 - 2026-08-19

The tutor no longer works towards giving the answer. It works towards her finding it.

- **Six-level hint ladder.** One level per time she asks: orient, then the first
  step as a question, then name the tool, then the exact stuck step, then try it
  with easy numbers. The answer to her own question is never given while she is
  still working on it, however many times she asks.
- **A worked example on the sixth ask** - of a SIMILAR question, not hers. The
  example is minted by the same generator that produced her question, so it is the
  same shape and correct by construction rather than invented by a model. It is
  rejected if it shares her answer or reuses her own numbers; structural constants
  like pi as 22/7 do not count as reuse. Roughly 96% of questions can mint one; the
  rest fall back to the model composing its own.
- **Attempts are counted** and reported to the tutor, so it answers what she
  actually did before moving further down the ladder.
- **The offline ladder follows the same policy** and shows the same minted example
  at level 5, with no connection at all.
- Once she submits an answer, the withholding lifts and the tutor explains fully.
- Fixed: "the ratio of his cards to his cards" when both names in a question were male.

## v1.2.0 - 2026-08-19

Calibrated against two 2025 P6 prelim papers. No question is copied from either;
the papers were read for topic spread, difficulty and mark weighting only.

- **Data handling added** - the biggest gap. Pie charts, bar graphs and line
  graphs, all drawn from parameters, with questions read off the chart.
- **20 new generators**, taking the bank from 22 to 42 across 16 topics:
  place value, rounding, factors and multiples, measurement conversion, time
  duration, fraction to decimal, fraction divided by a whole number, GST,
  algebra with a fraction term, isosceles triangle angles, parallel lines and a
  transversal, pie / bar / line graph reading, missing value from an average,
  banded pay rates, commission bands, two coin denominations, two vehicles
  meeting, and pouring water between tanks.
- **Two new figures**: an isosceles triangle with tick marks, and two parallel
  lines cut by a transversal.
- **Fraction answers** now reach the tutor as `4/27` rather than `0.148148`.
- Four new topics: Measurement, Time, Data and Money, each with its own offline
  hint ladder entry.

## v1.1.0 — 2026-08-19

- **Coins and Mochi's room.** Correct answers earn 2 coins, with a +5 bonus every fifth
  in a row. No coins if the worked solution was revealed first. A second tab holds the
  room: stroke him, buy cat munch, and buy accessories that he actually wears.
- **Six accessories** across three slots (head, eyes, neck), drawn as SVG over his photo.
- **Purr is a moment, not a chore.** It rises when she plays and drifts back to calm on
  its own. Mochi is never hungry, never sad, and never asks for anything.
- **Question bank widened** from 14 to 22 generators across 12 topics: change in ratio,
  percentage increase and decrease, two-leg average speed, rate, depth from volume,
  angles in a parallelogram, dividing by a fraction, and working backwards.
- **New parallelogram figure**, checked for label collisions across every angle.
- **Answer marking generalised** — any unit she writes after a number is now accepted,
  instead of a fixed list. Found by mutation testing: "15 cards" was being marked wrong.
- **App icon is now a cat paw.**
- **Version numbering starts here.** The build is shown under the cog.

## v1.0.0 — 2026-08-19

First complete build. 14 question generators, handwriting recognition with
deterministic line-by-line marking, tutor over Claude or ChatGPT with an offline
hint ladder, working page, PWA install, and the grown-ups panel.
