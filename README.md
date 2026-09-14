# Mochi · Euna’s maths and science studio

An offline-capable family maths app with optional conversational AI. It prepares
Euna for Primary 6 mathematics and her **September 2027 SPERS-Sec1 planning target**,
with a separate enrichment strand for mathematical thinking. The exact 2027 test
and application dates must be checked when published.

**v4.3.8 — 14 September 2026.** The existing cat, room, handwriting pad, provider
settings and saved coins are preserved. Old topic totals are retained as legacy
accuracy; they are not treated as new evidence of independent learning.

## New science trial

Use the **Maths / Science / Investigate** switch. Science includes eight illustrated
activity areas, 24 authored practice questions and 8 reserved independent checks.
Predict before recording a model trial; explain the evidence in the notebook.
Stylus notes, optional transcription and typed explanations share the existing
family provider connection and backup controls. Original botanical, pond, anatomy, cup and cart art
supports the science diagrams; model assumptions appear below each activity.

This is the first testable science set, not complete syllabus or calibrated NUS High
preparation. Read [the science review and trial checklist](docs/SCIENCE_REVIEW.md).

Authored wording and tutor instructions have been reviewed against current MOE
terminology. Read the [terminology review and its limits](docs/MOE_LANGUAGE_REVIEW.md).

## Tracking the published version

The header shows the version loaded on this device. Parent settings show the same
version, release date and change summary. Refresh while online to load a newer
published release. The private preview and GitHub Pages can run different releases;
compare their displayed numbers.

For each release, update `release.json`, run `node scripts/release.cjs`, and commit
the generated changes together. Run `node scripts/release.cjs --check` before
publishing to reject inconsistent labels, runtime metadata and offline asset
versions. Release numbering uses `major.minor.patch`; the current release is v4.3.8.

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
