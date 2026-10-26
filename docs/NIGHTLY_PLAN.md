# Private nightly priorities (v7.7.0)

Daily Quests can consume a private, date-specific plan independently of an app
release. This is a lesson queue, not a grading engine or a nightly code generator.
The one-time relay setup is in `tools/NIGHTLY_PLAN_SETUP.md`.

## What changes

The existing midnight assessment writes JSON to one owner-controlled private Google
Doc named **Euna — App next-session plan (JSON)**. A read-only authenticated action
in the existing Google Apps Script mirror returns only that configured document.
The app uses the existing saved relay URL and secret. No plan, report, token, private
Doc ID or learner responses are committed to the public repository.

The app checks on startup, reconnect and foreground/home transitions (a five-minute
throttle avoids repeated automatic requests). A Grown-ups button can check immediately.
The actual received plan date and its evidence date are separate from the app version.
Network changes do not reload an open lesson or question. A new revision waits for
Home or the next explicit safe learning-step boundary. Receiving data is not the same
as confirming it was worked on: the exported receipt distinguishes these states.

## Routing and completion

A valid plan supplies one short goal and at most five existing lesson/practice steps
per subject, with no more than six planned questions. Each question step contains one
or two attempts. Only supported phases guided/apply/transfer are permitted; no direct
question text, answer, seed, paper, script, URL, score, time or reward override exists.

Unfinished papers (with their original deadlines), unsent/incorrect drafts, saved
mixed sets, incomplete lessons and the existing daily delayed-review allowance have
priority. The plan never silently discards them. Existing geometry prerequisites
remain active. An untaught practice topic first becomes a lesson; a requested
transfer without two independent applications becomes application practice.

Completing a planned lesson explicitly advances its queue slot. Clicking Next after
a recorded planned question advances its bounded question slot. Merely opening a
question, checking it, or changing the plan does not complete a slot. A supported,
revised or pending written response keeps its ordinary evidence status. Completing
the queue means these activities were tried, NOT that the topic is mastered. Existing
adaptive practice resumes after the finite queue, within the remaining scheduled
minutes; no additional mandatory time or missed-day debt is created.

The daily time goal still wins at a safe boundary. Quiet thinking, timer rules,
science assessment marking, tutor help, cats, coins and all prior learning records
are unchanged. A downloaded plan cannot grant independent credit or change scores.

## Data contract (schema 1)

The machine document contains **only one JSON object**, no Markdown fences or prose.
Required keys:

- `schema`: 1
- `id`: 8–100 ASCII letters, digits, underscores or hyphens; stable for a session date
- `revision`: integer 1–10000; increase for any changed content on the same date
- `student`: `Euna`
- `timeZone`: IANA timezone, normally `America/Chicago`
- `reviewedDate`, `sessionDate`: valid YYYY-MM-DD dates; session follows review by 1–3 days
- `generatedAt`, `sourceExportedAt`: ISO UTC timestamps ending Z; source must precede
  generation, not be older than three days, and cover at least the review date
- `subjects`: both `maths` and `science`; each contains `focus` (plain text, 1–160 chars)
  and `steps` (1–5 entries). No angle brackets or control characters in focus.

Lesson step: `{ "kind": "lesson", "unit": "existing-unit-id" }`.
Practice step: `{ "kind": "practice", "unit": "existing-unit-id", "phase": "guided|apply|transfer", "count": 1 }`.
`count` may also be 2. Use real IDs from entrance-data/science-path-data in this release.
No extra keys are accepted. Both subjects must be provided even on a scheduled rest day;
the saved schedule controls whether they actually run.

Before writing: read the latest mirror and document revision, validate timestamps and
units, and leave priorities stable if no new evidence warrants a change. Preserve parent
edits in the separate human journal. Replace only the machine document, with a revision
precondition, then read it back and compare parsed JSON. Repeated runs with the same
source/date/content should not reset the revision or make duplicate journal entries.

## Freshness, privacy and limitations

The app applies a plan only on its `sessionDate`, in the plan's timezone. It does not
relable an expired plan as today's. If absent, stale, invalid, offline or not connected,
the existing built-in adaptive route remains usable. A valid same-day cached plan can
be used offline. Older revisions or older-source replacements are rejected. Future
plans wait for their own day. Unexpected fields and unknown units fail closed.

Plan and queue position are cached on the device, bound to a SHA-256 fingerprint of
the existing relay credentials. Credentials never enter the learning export or a URL.
Queue position is device-local, not a new cross-device database; changing devices can
repeat a planned activity, while the ordinary synced learning evidence still prevents
that repeat being relabelled fresh. A parent can disable nightly priorities immediately.

`nightlyPlanReview` in the normal private learning export reports plan ID/revision,
source/export/session dates, receipt/adoption times and per-subject queue position.
It never exports connection credentials. `available` means the plan is loaded and
eligible, not that every priority is presently on screen (saved work can come first).
The active question ID and completed queue positions show actual use. No nightly
process should say the tablet applied a plan without this receipt from a later sync.

The legacy relay is write-only and cannot provide a readable plan. Updating GitHub
alone does NOT upgrade an already deployed Google Apps Script version. Until the
one-time deployment step is completed, the app explicitly reports setup/unavailability.
The browser must permit readable cross-origin simple POST responses from the deployed
relay. The implementation does not use no-cors, JSONP or secrets in query strings.
Connection errors never mean a plan was delivered. The documented connection check
is required to validate the live deployment; mocked relay tests are not end-to-end proof.

## Validation

Pure tests cover strict schema/date limits, Chicago DST, both finite queues, saved
work/paper/recall precedence, help preservation, conservative phase choices, reload
and fixed-scope relay authentication. A local-only browser fixture uses a simulated
private response and synthetic learning records to exercise actual app controls,
revision changes without a software release, notes preservation, deferred adoption,
failure/legacy-relay fallback, both queues, paper deadlines, export privacy and 375px
layout. Existing tests continue to check old questions, papers, rewards and timers.

## Focus handoff (v7.7.5)

A received queue is not a started queue. Daily Quests now explicitly resumes an unfinished short mixed set before the private focus instead of falling back to an unrelated adaptive repair. A completed single recall or short mixed set satisfies the daily routing allowance irrespective of correctness; this is scheduling only, never mastery credit. Drafts, incomplete lessons, active papers and prerequisite teaching still come first.

Within Daily Quests, Another question, Try a similar guided question and the end of a mixed set re-evaluate the same focused route at the explicit Next boundary. Subject-overview Continue also enters that route while the subject's saved time block is available. Deliberate library and bonus activity remains separate, and no received plan interrupts an open answer or changes a time goal.

The private export adds a read-only `nightlyPlanReview.routing` entry for each subject: `SAVED_PAPER`, `SAVED_DRAFT`, `SAVED_LESSON`, `SAVED_MIXED`, `DUE_RECALL`, `READY`, `PLAN_COMPLETE`, `NO_CURRENT_PLAN` or `DISABLED`. These are blockers/availability, not evidence of starting or completing learning. Only actual planned questions receive plan provenance.

## Three-question microcycles (v7.7.6)

When a subject priority contains exactly three practice questions for one unit, Daily Quests treats them as one coherent microcycle without rewriting the private plan or resetting queue progress:

1. **Learn the move** — one guided model.
2. **Beat the example** — one changed application.
3. **Final challenge** — one changed transfer when prerequisites support transfer; otherwise a changed application remains in place until the pathway evidence is ready.

The last two checks require a short typed line or handwritten working before the first answer check. This requirement is instructional only: an empty working box is not recorded as a wrong answer. Existing help/reveal/guess flags still determine independence normally.

Euna's learner-facing feedback is deliberately encouraging and self-competitive: progress is framed as 1/3, 2/3 and 3/3, clean solves are celebrated, and a corrected answer is praised as a comeback. The app does not compare her with another child, create a leaderboard, penalize a miss, add compulsory minutes, or alter cats, coins, rewards, scores, prerequisites or prior evidence.
