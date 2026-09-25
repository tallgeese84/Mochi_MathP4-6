# Teaching-first interventions — v5.4.0

## Behaviour

The intervention layer reads existing attempt history; it does not embed a
learner's mistakes or private records. GST-direction and cube-edge tracks start
after two consecutive first-answer misses within the same generator. A correct
answer after hints or a retry is useful practice, but is not an independent pass.
The short explanation is closed before a conceptual exit question appears.
Reopening it is recorded as help. Practice, a different-context transfer problem
and a recall stage after at least 24 hours follow. Other blocked generators get a
short concept check using the existing authored concept-probe bank. Skipped and
custom questions do not trigger a calculation guard. This is a teaching heuristic,
not a diagnosis. Explicit diagnostics and enrichment remain separate modes.

GST questions state their rate. The lesson contrasts the original 100% plus tax
with the original 100% less a discount. Cube teaching uses accessible square
layers and repeated multiplication, without WebGL. Circuit teaching distinguishes
one complete series path, independent parallel branches, and a common switch.
The parallel-brightness prediction explicitly assumes an unchanged ideal supply.

## Progression and science

The ordinary two-form progression rule remains. In a single form, four distinct
question texts answered independently can instead invite a provisional higher
level in another form. Repeating the source form cannot confirm it. Two missed
trials withdraw the invitation. Numeric tiers are not school grades or percentiles.

Original science practice now requires both answer and reasoning-check success
for independent evidence. A small, conservative offline detector flags affirmative
current-leak/current-flood explanations for discussion. It is NOT a general writing
grader: no flag does not mean an explanation is correct, and negated statements
are deliberately not flagged. Free text still needs a parent/teacher review or the
optional configured tutor. New circuit checks use distinct concept probes; reserved
assessment items are not exposed by remediation. Familiar prompts wait a full day;
when a focused bank is exhausted, the learner can change topic, use the textbook
or investigate instead of farming the same prompt repeatedly.

## Classroom and storage

Finishing a textbook now opens its native conceptual exit check. Topic practice
and all-subject review remain available. A `practiceContext` links subsequent
matching subject work to the relevant unit. `course.attempts` can additionally
contain `source: "practice-link"` observations with the original attempt ID,
lesson key, phase, answer, first-answer correctness, help and reasoning flags.
These observations are duplicates for analysis, not additional answered questions.
Native classroom promotion and planner totals exclude them. Backup validation and
cross-device merging retain these links conservatively; known help/first failures
cannot become independence through a merge. Reading exposure and linked before/
after outcomes do not establish mastery or causal effects of a lesson.

No storage key is reset. Existing answers, notes and earned companion milestones
remain. Independence counts may become more conservative under the new science
criteria; this does not delete the original answers or remove earned rewards.

## Validation

`npm test` exercises random-answer bank checks, two-miss routing, focus guards,
old and new repair sequences, delayed recall, provisional progression, science
reasoning and repetition, backup/merge semantics, and full-page button interactions.
`npm run check:course` and `npm run check:release` verify generated content and the
versioned offline asset list. Desktop and narrow-screen teaching cards are also
checked in a local Chromium render without cloud or paid-provider requests.
