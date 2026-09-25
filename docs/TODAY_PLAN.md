# Today’s Plan — v6.2.0

The student landing page has one primary action, Start/Continue Maths or Science.
It shows the next activity, a short two-subject time plan, and a small Mochi room
link. Subject libraries, reserved papers, foundation access (from the libraries),
experiments, weekly scheduling and parent evidence remain behind More.

## Routing and learning

The new daily controller reads the two existing learning pathways. It does not
replace their lessons, adaptive rules, question generators, marking, evidence,
seven-day retrieval, or admission-readiness qualifications. A correct familiar
answer still does not become new transfer evidence. No entrance-test equivalence
or new mastery threshold is introduced in this UI update.

An already-open paper has priority and keeps its original deadline. Otherwise,
within scheduled unfinished time blocks, recently unfinished questions/lessons
come first, followed by due retrieval or the engines’ next recommendations. The
maths block normally precedes science. Only existing, unreserved practice is
chosen automatically after the course has been explored. Merely opening home or
the paper catalogue never creates a question, changes exposure, starts a reserved
paper, marks an answer, completes a lesson, or grants a reward.

## Time is not mastery

The original Monday–Sunday minutes and foreground-time records are reused. There
is no added daily workload, mandatory third review block, streak penalty or
catch-up debt. The visible two-step completion indicator means the configured
study-time goals were reached, not that their concepts are mastered. A rest day
has no required block. Reviews fit within the existing budget.

Start/Continue explicitly starts a foreground study clock for an ordinary lesson
or practice question. Home, menus, pausing, backgrounding, inactivity, and reload
leave it stopped. A timed paper uses its own original deadline and does not start
the study clock. The original three-minute inactivity guard remains: long reading
may require Resume time. Counts are foreground estimates, not proof of engagement.

When the time goal is reached, the current answer remains visible and editable.
The learner may finish the thought and return to the plan. The next learning-step
button returns to Today at a safe boundary rather than opening endless drills.
Unfinished work remains resumable, including on the next planned day.

## Navigation and preservation

The prominent Today link and return buttons save the current working before
leaving. More is a keyboard-accessible modal with Escape/focus restoration. Before
leaving an active paper, the learner must confirm the interruption. Declining
leaves the paper alone; accepting keeps answers/deadline and records supported,
interrupted conditions under the existing assessment rules.

No new stored schema is needed: home is derived from existing subject state,
lesson-page positions, drafts, paper records and planner sessions. Existing cloud
merging and backup validation remain authoritative. Loading an older backup or a
cloud update recomputes the displayed recommendation. A failed Today script does
not apply the new shell class, leaving the original controls available.

The only automatic change is navigation/presentation; there is no live learner
record replacement, reset, new external service, or credential change. The
original overview renderers remain for compatibility, but are not the default
landing page. Time/learning detail is deliberately separated from the student’s
one-next-action screen.

## Validation

Run the full existing `npm test`, `npm run check:release` and `npm run check:course`.
`tests/today.test.cjs` checks read-only routing, exact resumes, rest/time boundaries,
existing-paper priority and no inadvertent paper exposure.
`tests/fixtures/today-browser.html` is a localhost-only synthetic-profile browser
test of the real page: initial simplicity, lessons, saved answers/notes/ink, clock
pause/resume, science handoff, menus, exports, paper navigation and 375px layout.
It refuses an existing learner/sync profile. Synthetic pointer capture is mocked
only for untrusted test events; production pointer handling is unchanged.
