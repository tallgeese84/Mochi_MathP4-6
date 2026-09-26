# Today’s Plan — v6.4.0

The student landing page has one primary action, Start/Continue Maths or Science.
It shows one next activity, two compact Maths/Science quest chips, and a small Mochi
room link. Detailed subject libraries, reserved papers, foundation access,
experiments, weekly scheduling and parent evidence remain behind More. The screen
is intentionally short enough to keep the next action above the fold on a tablet.

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
is no added required workload, mandatory third review block, streak penalty or
catch-up debt. The visible two-step completion indicator means the configured
study-time goals were reached, not that their concepts are mastered. A rest day
has no required block. Reviews fit within the existing budget.

Start/Continue explicitly starts a foreground study clock for an ordinary lesson
or practice question. Home, menus, pausing, backgrounding, inactivity, and reload
leave it stopped. A timed paper uses its own original deadline and does not start
the study clock. Quiet reading, thinking and paper work count without requiring repeated taps. A
10-minute no-interaction guard still pauses conservatively, and ordinary short browser
timer stalls are tolerated. Longer browser/OS interruptions pause with an explicit
reason. Counts are foreground estimates, not proof of engagement.

When the time goal is reached, the current answer remains visible and editable.
The learner may finish the thought and return to the plan. The next learning-step
button returns to Today at a safe boundary rather than opening endless drills.
Unfinished work remains resumable, including on the next planned day.

## Mastery coaching

Every active lesson or practice question now shows one **Quest goal** and a compact
five-step method path: **Learn → Apply → Transfer → Remember → Mix**. These labels
summarise the existing evidence rules; they do not introduce a new mastery score.
Apply requires two fresh independent applications, Transfer requires a changed
problem structure, Remember requires qualifying delayed retrieval, and Mix is only
checked after actual independent mixed-paper evidence.

After the first incorrect response, the app offers one short **Quick check** aimed
at the underlying relationship rather than another numerical retry. Known current
gaps such as systematic counting, factors/LCM, shared-height area, exposed cube
faces, circuits and matter use targeted forks; other units reuse their authored
concept check. Opening or answering the Quick check records help, so the original
attempt cannot later be presented as independent. Feedback stays short; a deeper
explanation is available on demand, and Ask Mochi remains available for a tailored
scaffold.



After every non-rest scheduled subject has reached its daily time goal, the home
screen may offer one optional **Bonus Quest**. It chooses from methods already
taught and does not start another required time block. A fresh independent application earns one coin when the first submitted answer is
correct, no hint/AI help/solution was used, and the item is not a familiar repeat.
Independent changed-structure transfer or a genuine week-later recall earns two
coins because those are stronger learning signals. A retry, supported answer, guided
question or repeated item earns no bonus coin. This reward rule is deliberately
stricter than ordinary learning credit.

At most three bonus successes are rewarded per local day. Completing all three
adds a two-coin chest. Because stronger transfer/recall questions can earn two
coins each, the daily maximum is eight bonus coins. Coins buy room treats/accessories only. They do not change mastery, pathway
recommendations, admissions evidence, time goals, or companion growth. Failed
bonus questions carry no penalty and the learner may stop at any time.

## Navigation and preservation

The prominent Today link and return buttons save the current working before
leaving. More is a keyboard-accessible modal with Escape/focus restoration. Before
leaving an active paper, the learner must confirm the interruption. Declining
leaves the paper alone; accepting keeps answers/deadline and records supported,
interrupted conditions under the existing assessment rules.

A small additive `questRewards` ledger records only optional bonus-question IDs,
subject, and whether the three-question chest was earned. It does not alter lesson
or mastery evidence. The ledger is validated, merged across family sync, and
included in learning backups. Existing subject state, lesson-page positions,
drafts, paper records and planner sessions remain authoritative. Loading an older backup or a
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
