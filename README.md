# Mochi · Euna’s maths and science studio

An offline-capable family maths and science studio with optional conversational AI.
Both subjects now build towards **June 2027 entrance-style preparation**, with
separate evidence of application, transfer and retention. The original primary
foundations and September 2027 SPERS-Sec1 planning goal remain available. Internal
practice targets are not official school cutoffs or validated test equivalents.
Exact 2027 test and application dates must be checked when published.

**v6.1.0 — 25 September 2026.** Science now has a matching structured reasoning pathway. Open **Science → My path** for 24 lessons, conclusion-and-reason practice, original figures and separate assessments. Core and enrichment scope is explicit; SPSO samples are supplementary, not an official DSA paper. Maths and prior records remain intact. See [Science pathway](docs/SCIENCE_PATH.md).

**v6.0.0 — 25 September 2026.** Maths now opens a June 2027 entrance-reasoning pathway: 24 short teaching units, three original worked-example forms per unit, adaptive guided/application/transfer practice, seven-day retrieval and monochrome examination-style diagrams. Two untimed starting checks and three reserved 24-question mixed papers keep assessment separate from teaching. The 85% goal is an internal training target, not a school cutoff or an admission prediction. See [scope, evidence and validation](docs/ENTRANCE_PATH.md). The foundation classroom, Science, existing notes, cats and rewards remain available.

**v5.5.2 — 25 September 2026.** The 2D room, tutor portraits and background now use a flat, rounded Mochi that matches his friends. Custom photos remain optional; the parent settings include **Use illustrated Mochi**. The 3D models and learning rewards are unchanged.

**Cat Friends:** Mochi now has four cat friends: Miso (British Shorthair), Suki (Siamese), Kumo (Maine Coon) and Yuki (Ragdoll). Open **Mochi’s room → Cat Friends** to invite up to three companions. Earned milestone thresholds are 2, 8, 18 and 32; coins and learning scores are unchanged. The new models share the existing renderer, with picture-mode companions as a fallback. Roster preferences are included in backup and family sync.

**v5.4.0 teaching improvements:** Targeted mini-lessons now interrupt repeated GST and cube-edge errors. Four distinct unassisted variants can invite a harder question in another form, without immediately certifying mastery. Science keeps answer choice separate from the reasoning check, limits immediate repeats and flags selected circuit explanations for discussion. Completing a textbook opens a conceptual exit check. Linked practice records preserve lesson context without double-counting questions. See [the implementation notes](docs/TEACHING_FIRST.md).

Mochi’s room now opens the approved 3D kitten with
large bright eyes and a continuous body and leg mesh. Visit Mochi from the daily
plan or More → Mochi’s room. Walk, sit, stroke, turn the view or tap the rug to
choose a destination. Treats and all six owned accessories use the existing shop
and coin balance. The Picture button retains custom cat artwork.

The renderer initialises only when the room opens and pauses away from it.
Three.js r180 is included locally with its MIT licence; the service worker saves
the scene and renderer for offline use after the release finishes downloading.
Reduced motion starts with a still cat. Browsers without WebGL use the picture
view, and a lost graphics context offers a retry. Learning history, handwriting,
provider settings and saved coins are preserved. Old topic totals remain legacy
accuracy; they are not treated as new evidence of independent learning.

## Classroom before practice

The app now opens a written **Maths and Science classroom**: 42 sequenced units,
294 teaching sections, about 25,800 teaching words and 252 initial checks.
Original illustrations accompany worked explanations, notebook activities and
labelled interactive models. Switch subjects in the header, choose a unit and
explore its teaching sections before checking understanding. Keyboard and stylus
notes are saved. **Finish & check understanding** opens a conceptual exit check. The original adaptive Maths
questions and related Science questions remain accessible through **Practice
questions**, a main action for an explored textbook, while **Quick lesson check**
offers the short authored checks separately. Science units without a matching
original bank use their own lesson questions; the primary forces unit keeps its
core checks, with the original forces extension available in the wider bank.

**All Maths practice / All Science practice** is always visible above the lesson
for review of earlier work, even before a new textbook is explored. It restores
the full subject bank, without the textbook's topic filter. Returning to the
textbook and resuming the same practice session preserves the question, answer
and working. Reading related teaching during an unfinished attempt records help.

Read the [classroom guide](docs/CLASSROOM_GUIDE.md) for a daily teaching routine,
difficulty decisions and how to review progress. Read the [curriculum audit](docs/CLASSROOM_CURRICULUM_AUDIT.md)
for official sources, topic mapping, admissions distinctions and validation limits.
The route is **NUS High DSA-Sec**. This is an original preparation course, not an
MOE-approved textbook or a calibrated official entrance syllabus.

Two different first-answer successes without help or guessing advance a classroom
check by one level. Two misses lower the target. Revisions retain the first answer;
immediate repetitions do not count as fresh evidence. Delayed familiar retrieval
is labelled separately. Lesson completion records exposure, not mastery.

The existing learning mirror now includes classroom progress, answers, explanations
and handwriting; no new setup is required. Existing Maths and Science history,
provider settings, cat customisation and coins are preserved. Parent settings
show the classroom evidence alongside the earlier question-studio records.

The website and installed home-screen app share the same code and release.
After publication, refresh online and confirm **v5.2.0** in the header. Do not
clear app storage or reinstall to update: retain the existing learning history.

## Weekly learning and Mochi’s growth

The compact Today panel adds separate Maths and Science clocks and optional daily
goals: study an idea, practise, try one exit check and reflect. Edit Monday–Sunday
minutes in Euna’s avatar panel. The starting routine totals 145 minutes per subject
per week, with a light Sunday and no missed-day penalties. Clocks pause when the
app is hidden or inactive; minutes measure foreground time, not mastery.

Next-topic recommendations connect existing course and practice evidence to
prerequisite repair, delayed review and the next available challenge. The parent
view gives cautious thinking observations with example IDs. Mochi’s original
illustration grows through five stages based on independent work across both
subjects and delayed retrieval. Existing coins and accessories are kept.

The learning mirror and backups include the schedule, active-time estimates,
reflections, recommendations and growth milestones. No new mirror setup is needed.
Read [the learning-plan guide](docs/LEARNING_PLAN.md) for the default week,
daily workflow, timing/merge rules and evidence limits.

## Tracking the published version

The header shows the version loaded on this device. Parent settings show the same
version, release date and change summary. Refresh while online to load a newer
published release. The private preview and GitHub Pages can run different releases;
compare their displayed numbers.

For each release, update `release.json`, run `node scripts/release.cjs`, and commit
the generated changes together. Run `node scripts/release.cjs --check` before
publishing to reject inconsistent labels, runtime metadata and offline asset
versions. Release numbering uses `major.minor.patch`; the current release is v5.2.0.

Run `npm ci --ignore-scripts`, `npm run check:release`, and `npm test` using Node
24.15 or later before merging. GitHub's **App checks / test** job runs the same
checks on pull requests and main. Make this check required in the main branch
rules if you want GitHub to block untested merges; a successful Pages deployment
alone only confirms that files were published.

See [the v4.3.5 loading review](docs/LOADING_REVIEW.md) for the cause and repair.

## Reviewing Euna’s learning here in ChatGPT

In Parent settings, open **Review Euna’s progress with ChatGPT** and choose
**Download for ChatGPT**. Attach the JSON in this conversation. It includes the
app version, export date, Maths reasoning and assistance history, Science records,
and the text of recorded Science questions. No provider settings or mirror secrets
are copied. It remains compatible with **Restore learning**.

The existing Google Drive mirror writes `euna-mochi-latest.json` and weekly
snapshots to the private **Mochi Euna Learning Mirror** folder. Follow
[the one-time relay setup](tools/DRIVE_MIRROR_SETUP.md). The folder was accessible
but empty when checked on 14 September 2026; delivery has not been established.
After a file appears, ask ChatGPT to review that file through connected Google
Drive. Reviews are on demand, not automatic monitoring. Do not judge progress
from percentages alone: distinguish independent evidence, help, repeated items,
written reasoning and missing coverage. Older timing includes idle time.

Responsive behaviour and remaining device checks are documented in
[the mobile and review notes](docs/MOBILE_REVIEW.md).

## What to do first

1. Tap **Euna** in the header and choose **Discover my starting point**. It samples 17 core skill
   groups. Break the first look into several sittings if needed. One question per
   group is a starting sample, not a diagnosis or an exam prediction.
2. Choose **My daily practice** from that session panel for an eight-question session: a warm-up, adaptive
   foundation/practice questions, delayed review when due, transfer and an
   investigation. Aim for about 20–25 minutes, with understanding setting the pace.
3. Ask Mochi about the exact step that is unclear. A wrong answer stays open for
   revision. **Show the working** remains available; needing an explanation is fine.
4. Write a plan and a brief insight. Use **More → Explore a resource** to learn how
   to look up a concept, explain it without copying, and verify it independently.
5. Once a week, open the grown-ups panel together. Discuss an example of an error,
   a repaired method and an independent solution. Back up learning regularly.

**Bring my own problem** accepts a typed problem, including diagram labels. AI
can discuss it but there is no verified bank answer, so it does not affect scores
or learning evidence. Check its proposed solution with a second method or an adult.
Image upload of an external question is not implemented; the pad supports her
handwritten working on the selected problem.

## The interactive studio

The GUI uses an open question surface, large question typography, purple
controls, original painted science illustrations and quiet cat watermarks. A vertical rail of floating instruments
moves to the bottom on phones; **Ask Mochi** has a separate floating control.
The question, answer and current session progress are immediately available.

**Think** opens the reasoning stages and sketchpad. **Explore** opens the visual
lab. **My map** opens a skill index with an evidence inspector. Tap **Euna’s
session** to choose practice or bring your own problem. Only one tool panel opens
at a time; working survives tool switches. The active problem stays alongside
panels on wide screens and is available through “See the problem” on small screens.
Zoom, keyboard controls and reduced-motion preferences remain supported.

- **Understand → Connect → Solve → Verify:** write in any order. Each stage keeps
  its own text; revisions and typed working accompany the problem into the tutor.
- **Visual lab:** a movable panel with fraction strips and a number line, ratio
  bars, rectangle grids and growing dot patterns. Predict, manipulate, reveal the
  measurements, then explain an observation. Save it or discuss it with Mochi.
- **Small examples:** 18 checked concept probes cover all 17 core skill groups
  plus inquiry. Speed uses the rate probe. The result identifies what was checked,
  rather than diagnosing Euna from a wrong final answer.
- **Learning map:** select a skill to inspect its evidence, building blocks and
  attempted solution routes, or start a focused session. Saved insights remain
  available below the map.
- **Challenge:** eight added investigations address invariants, systematic
  counting, worst-case guarantees, constraints and optimisation. A correct value
  still needs a sound argument; the app does not automatically grade the proof.

Read the [design, adaptation and evaluation notes](docs/STUDIO_REVIEW.md).

## Learning and tutoring

The bank has **88 generators**: the original 42 reviewed and repaired, plus 30
primary/reasoning question types, 8 further investigations, and 8 connected-problem generators. Across 19 skill groups, 17 are core and two are extension.
Some individual geometry tasks also carry an extension tag. See the full
[standards and question audit](docs/CURRICULUM_REVIEW.md).

The learning engine records first-answer correctness, revisions, hints, model and
solution use, confidence, reported obstacle, plan, reflection, elapsed time and
question type, reasoning stages, revisions, chosen route, typed working, concept
checks and visual experiments. The tutor sees recent relevant evidence and the learner’s actual
working. It must ask for evidence before attributing a misconception and accept
valid alternative methods. It guides, explains when needed, and asks for a check,
not just a repeated procedure.

Selection uses prerequisite relationships, recent independent evidence and review
due dates. Review intervals are 1, 3, 7, 14 and 30 days as independent practice
accumulates. Three consecutive independent answers invite a harder form; two
consecutive first-answer misses invite a simpler step. Time is not used to infer
ability. Concept checks help choose between revisiting a relationship and testing
a prerequisite. The learner can also focus a session on a chosen skill.

These are transparent design heuristics, not a calibrated learner
model or a validated educational intervention.

“Independent” requires a correct first answer without hints, model or solution,
and not identified as a guess. “Retained in practice” additionally requires recent
independent evidence on at least three calendar days, two question types, a transfer
question and a written plan, with no more than two recent first-answer misses.
A transfer observation now also needs an explicitly authored transfer question,
prior independent evidence in that skill and a generator not used in the last five
attempts in that skill. A review slot or new numbers alone do not qualify.

**Plan quality is not automatically validated.** Neither label predicts a school
placement or an admissions result. Same-session success alone cannot satisfy the
retention rule. Date comparisons for evidence use UTC calendar days.

The tutor uses the bank’s answer and worked steps as its reference. It can still
make mistakes when explaining; its response is never used to award numerical credit.
Arithmetic checking cannot prove that a method is valid, complete or relevant.
Handwriting is a proposed transcription that the learner should inspect and correct.

Resource links point to Maths Is Fun and Cambridge’s NRICH. The model has no web
search tool: it must not pretend to have visited sources or independently checked a
page. Notes and pasted problems are treated as untrusted learning material.

## Standards and routes

- **SPERS-Sec1:** P6 topics; 34 MCQs in 30 minutes, followed by 20 short-answer and
  10–15 open-ended questions in 105 minutes. No calculator; written methods matter.
  [SEAB test details](https://www.seab.gov.sg/spers-sec/test-details/).
- **Current primary syllabus:** the 2021 syllabus, updated October 2025, applies to
  P6 from 2026. Speed is not listed in it; this app keeps speed in enrichment. Simple
  linear equations are included in P6 and are now practised here.
  [MOE syllabuses](https://www.moe.gov.sg/primary/curriculum/syllabus).
- **NUS High:** a separate DSA route, with mathematics and science tests and
  shortlisted selection activities. Broad reading, problem solving, independence,
  creativity and communication matter. Its 2026 applications ran May–June and
  selection took place in July; do not assume September 2027 is the application
  deadline. [Admissions](https://www.nushigh.edu.sg/admissions/year-1-and-3-admissions/year-1-admissions/)
  · [Selection qualities](https://www.nushigh.edu.sg/admissions/year-1-and-3-admissions/admissions-faq/).

The 10-question fluency session is **not a full SPERS mock**, and the investigations
are **not official NUS High questions**. The app cannot assign PSLE ALs, predict
admission, or replace English, comprehensive science study, written paper practice and teacher review.

## Running and updating

The app remains a buildless GitHub Pages site. Deploy the repository root from the
chosen release branch. Keep these files together:

- `index.html`, `app.js`, `learning.js`, `question-bank.js`, `study-ui.js`, `tutor.css`
- `reasoning.js`, `challenge-bank.js`, `studio.js`, `studio.css`
- `science-core.js`, `science-scenes.js`, `science-ui.js`, `science.css`, `transfer-bank.js`
- `science-plant.webp`, `science-pond.webp`, `euna-avatar.webp`, `mochi-watermark.webp`
- `input-mode.js`, `baseline-week.js`, `quest-visuals.js`, `motion-runtime.js`
- `network.js`, `cloud-sync.js`, `cloud-backup.js`, `drive-mirror.js`
- `mochi-builtin.webp`, `science-body.webp`, `science-heat.webp`, `science-cart.webp`
- `sw.js`, `manifest.webmanifest`, `.nojekyll` and all app icons

Do not deploy only `index.html`: the JavaScript has been extracted into modules to
make future review and testing manageable. Use `scripts/release.cjs` to update script/style URLs and the offline cache together. External resource links and AI
need a network connection; bank questions, marking, local hints and progress do not.
Install on an iPad with Share → Add to Home Screen. Font files use their own cache.
The service worker only removes this app’s older cache buckets.

## Connecting the AI

The existing OpenAI/Anthropic connection flow is retained. Open the cog, pass the
parent convenience gate, select the provider, enter an API key/model available to
your account, then **Test** and **Save**. A ChatGPT subscription is not an API key.
The app shows “offline” when built-in hints answer, including after an API failure.
The grown-ups panel reports which provider actually answered and the last connection
error from the Test action. No live provider request was made during this review;
there was no configured family API credential in this checkout.

Existing provider defaults are preserved rather than silently migrated. The Test
button verifies access for your account. The current integration uses Chat
Completions for OpenAI and Messages for Anthropic. See
[official OpenAI text generation documentation](https://developers.openai.com/api/docs/guides/text).

**Deployment limitation:** provider API keys remain in device-local storage and
are sent directly to the selected provider over HTTPS. The parent multiplication
gate is a convenience, not security. This inherited design is appropriate only for
a controlled family setup; a public/multi-user release needs an authenticated
server relay with server-held credentials and usage limits. Never commit API keys
or learning backups. The model receives the active problem, typed/transcribed
working and limited relevant learning notes. Handwriting images are sent only when
checking handwriting. There is no automatic cloud synchronisation of the learning
record.

## Backup and verification

**Back up learning** downloads JSON containing attempts, notes, reasoning and external assessment records, excluding API
keys, provider configuration and the cat photo. Restore validates and reconstructs
allowed fields and recomputes independence. It replaces learning history only after
confirmation; API settings and Mochi’s room are retained. These files contain the
child’s work, so keep them private.

No runtime dependencies or package installation are required. Node 22+ can run:

```sh
node --test tests/*.test.cjs
```

Tests independently re-solve 100 visible generated statements per generator (8,800
questions), reject nearby/wrong answers and units, and cover learning, revision,
retention, migration, backup validation, custom questions, and multi-part marking.
The full suite currently contains **153 passing tests**, including concept probes,
reasoning traces, route adaptation, lab mathematics and focused-session behavior.
They are code-level tests using a small event/storage adapter, not browser or iPad
visual tests. Live AI answer quality and handwriting recognition still need a parent
supervised trial with the configured provider. The audit documents remaining
curriculum gaps and a practical evaluation rubric.

## Editing the course

Edit `course/lessons/*.md`, `course/catalog.json` and `course/questions.json`, then
run `node scripts/build-course.cjs`. Its generated `course-data.js` is the offline
runtime source. `npm run check:course` rejects stale generated content. Keep question
IDs and option identities stable; allocate a new question ID for a materially
changed question or answer so old learning records are not reinterpreted.

Run `npm run check:course`, `npm run check:release` and `npm test` before publishing.
Release metadata and offline assets are generated from `release.json` and the page.
