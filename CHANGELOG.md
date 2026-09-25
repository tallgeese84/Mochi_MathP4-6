# v5.5.2 — A consistent 2D cat family

- Render Mochi with the same flat, rounded, big-eyed portrait renderer as his friends.
  Keep his brown tabby markings, white muzzle/paws, green eyes and blue collar.
- Use generated SVG assets for the picture room, tutor controls and background.
  Precache versioned SVGs so an old unversioned illustration cannot linger offline.
- Preserve saved custom photos and add an explicit “Use illustrated Mochi” control.
  Reposition neck accessories for the full-body portrait without changing ownership.
- Leave all 3D meshes, progress, coins and companion unlock thresholds unchanged.
- Check generated artwork consistency, saved-photo behaviour and real picture-mode UI.

# v5.5.1 — Keep Cat Friends visible and recover missing graphics

- Put selected cat portraits, names and a Choose friends control at the top of the room in both viewing modes. Explain an empty or resting roster explicitly.
- Retry the companion graphics dependency if its original request failed. Check the room module's companion capability before mounting, retry a stale module once with a fresh URL, and verify the rendered count matches the selected roster.
- Fall back to the visible portraits with an explanatory status instead of silently presenting a Mochi-only 3D scene.
- Preserve existing milestones, deliberate roster choices, learning data and rewards. No unlock thresholds are changed.
- Add upgraded-state, missing-dependency and legacy-module regression tests; use synthetic progress in public tests.

# v5.5.0 — Cat friends for Mochi

- Add four distinct breed-inspired companions with coat, face, ear and tail differences.
- Keep Mochi as the main cat; invite up to three friends without spending coins.
- Unlock companions from 2, 8, 18 and 32 already-earned learning milestones.
  Existing progress counts immediately; mistakes and rest days do not remove friends.
- Share the original 3D renderer and animation clock, including pause, visibility
  and reduced-motion behaviour. Keep companions accessible in picture mode.
- Preserve earned unlocks across cloud merges and save deliberate room selections
  across device sync, exports and imports. Older backups remain supported.
- Add core, Three.js model and real-page roster tests. No learner records are bundled.

# v5.4.0 — Teach before another numerical variant

- Add short GST-direction, cube-layer and complete-circuit-path mini-lessons.
  Two first-answer misses on GST or cube-edge questions select the matching
  conceptual check before another numerical variant. Other repeated generator
  failures receive a conceptual gate. Focused sessions cannot bypass the gate.
- Add eight GST/cube repair generators with practice, different-context transfer
  and a recall stage that waits a full day. Preserve the original fraction tracks.
- Add four ratio forms. Four distinct independent variants may invite a higher
  different-form trial; same-form repetition cannot confirm that trial.
- Add five circuit situations with separate reasoning probes. Require reasoning
  evidence for independent practice, flag selected circuit contradictions for
  discussion and defer familiar questions for at least a day.
- Route specific GST, cube-edge and circuit signals to their own teaching units,
  rather than generic percentage-whole, area or materials prerequisites.
- Finish textbook reading with an exit check. Link subject attempts to classroom
  outcomes without double-counting questions or treating reading as mastery.
- Preserve original answers, notes, handwriting, configuration and earned
  companion milestones; test restore/merge and real answer-button interactions.

# v5.2.0 — Mochi’s 3D room

- Integrate the approved bright-eyed kitten with a continuous body and leg mesh,
  planted paws, walking, sitting, blinking and petting reactions.
- Connect petting, treats, growth milestones and six accessories to existing
  progress and purchases. Keep custom artwork in the Picture view.
- Initialise 3D on the first room visit; suspend rendering when the room or tab
  is hidden. Honour reduced motion and preserve Pause when returning to the room.
- Include Three.js locally and cache the complete scene for offline use. Fall
  back to the picture when 3D is unavailable, with a retry after context loss.

# v4.4.0 — Open into the lesson

- Replace the home review cards and top-level schedule with one lesson surface.
  Keep Maths and Science in the header; move the suggested schedule, progress,
  practice options, learning map and parent settings behind Euna’s avatar.
- Keep Think and Ask Mochi below the maths question in normal document flow,
  including on phones, tablets and narrow browser windows.
- Fold Investigate into Science as Try an experiment. Preserve the current
  question, answer, reasoning choice and notes while exploring. Experiments count
  as support; independent checks keep them unavailable. Accept handwritten
  explanations in saved experiment notes.
- Add expandable Why this question? explanations and reduce repeated labels.
  Use the Science check button to continue after a correct answer.
- Start the next appropriate session when returning after a finished prior-day
  session. Preserve unfinished sessions and existing learning history.
- Share v4.4.0 and the updated offline assets across the website and installed PWA.
  Stop loading the retired dashboard animation scripts.

# v4.3.9 — Follow the reasoning; clear the tablet workspace

- Prioritise targeted follow-ups for percentage wholes, changing remainders and
  fraction division from existing learning history. Check intermediate steps,
  practise another context, and schedule recall after one day. Mix in other work
  after two targeted questions; preserve the sequence through backup/restore.
- Add 12 mathematically checked generators; avoid exact recent question repeats.
- Add four fresh circuit/food-chain questions and 16 short authored Science
  reasoning checks, scored separately from the main
  choice. Save unsuccessful submissions immediately and preserve revisions.
  Typed and handwritten explanations still need tutor/adult discussion.
- Prefer unseen Science items and follow up on missed concepts. Mark familiar
  questions as repeats and exclude them from new independent evidence.
- Put navigation in normal page flow on tablets and phones (up to 1199 px), and
  reserve a separate navigation gutter on desktop. Keep panels within the usable
  viewport. The website and installed PWA share the same release and offline assets.
- Include follow-up stages and Science reasoning evidence in the existing learning
  mirror. Existing progress, provider settings and mirror setup are preserved.

# v4.3.8 — Copy the mirror secret

- Add Show secret / Hide secret and Copy secret controls to the existing mirror setup.
- Copy the actual field value; preserve the existing secret and saved settings.
- If clipboard access is unavailable, denied or times out, reveal and select the
  value for manual copying. Never claim success unless the clipboard write resolves.
- Clarify that MIRROR_SECRET requires the generated characters, not instructional
  placeholder text. No Apps Script code change or redeployment is required.

# v4.3.7 — Small windows and learning review

- Keep the toolbar and panels reachable in short desktop windows. Stack narrow
  Science controls and keep mobile input text at a readable size.
- Use the visual viewport to fit panels above mobile keyboards. Preserve pinch
  zoom and release stale dragged-lab coordinates when a window shrinks.
- Pause home animation and timer repainting while minimised; retain answers.
- Add Parent settings → Review Euna’s progress with ChatGPT → Download for ChatGPT,
  plus a direct link to the existing Drive mirror folder.
- Share one backup builder across downloads, Firebase backups and Drive mirrors,
  with app version, timestamps, independent/support counts, reasoning and Science
  question references. Preserve restore compatibility and exclude app credentials.
- Retry a queued Drive mirror when a save arrived during the prior request.

# v4.3.6 — Startup and offline recovery

- Remove the self-triggering version observer, competing version writers and the
  hidden loader that fetched baseline-week.js twice.
- Serve the full page directly with ordered deferred scripts. Keep legacy-shell.html
  as a compatibility redirect; remove the cache-clearing document.write bootloader.
- Initialise cloud sync and home enhancements after local progress hydration.
  Bound optional storage reads and cloud requests; load custom cat photos separately.
- Precache the release and illustrations in a scope-specific service-worker cache.
  Offline navigation has a saved shell; updates never force an open tab to navigate.
  Cached static assets no longer trigger a background fetch on every use.
- Extract the two identical embedded cat images into one reusable original asset.
- Add full-page startup and offline regression checks, release consistency CI and
  .nojekyll. Repair the duplicate More control ID and inaccurate backup status text.
- Preserve learning records and settings. See docs/LOADING_REVIEW.md for evidence,
  remaining cloud limitations and the device acceptance checklist.

# v4.2.1 — Visible release tracking

- Show a compact version label below the Mochi brand on phones, tablets and desktop.
- Put the loaded version, release date and change summary at the top of Parent settings.
- Correct the stale v3.0.0 build label. Generate visible and runtime versions and
  offline asset URLs from release.json; add a read-only consistency check.

# v4.2.0 — MOE terminology and explanation review

- Review all authored questions, explanations, probes, model observations and tutor
  instructions against the current official primary syllabuses.
- Use heat gain/loss for changes of state, gullet and digested food for human
  systems, and clear primary terminology for circuits, plants and food webs.
- Label science extensions; correct ice particle spacing and unequal starting
  temperatures in the fair-test activity and graph.
- Clarify maths terminology, question constraints, captions and worked reasoning;
  accept correct alternative wording and methods in tutor guidance.
- Document sources and limits in docs/MOE_LANGUAGE_REVIEW.md. No MOE approval or
  guarantee of future AI replies is implied. All 153 automated checks pass.

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
