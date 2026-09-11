# Euna’s maths studio — design and teaching review

Version 2.0.0, 11 September 2026. This completes the GUI redesign requested after
the first curriculum review. It includes the previous 1.4.0 improvements, which
were not yet published to the repository.

## Experience

The first screen is a working maths surface. A compact session strip sits above
the problem, with a tutor beside it on wide screens. The main canvas has four
editable stages: Understand, Connect, Solve and Verify. They are a way to expose
thinking, not a compulsory sequence or a scored checklist. Euna can move backwards
and revise any stage; earlier submitted edits remain in a bounded revision history.
The sketch pad is available when useful rather than occupying the entire screen.

The visual lab is an actual interactive panel. It can be dragged on wide screens
or used as a bottom panel on smaller screens. Fraction strips link to a number
line; ratio bars share the same unit; area grids distinguish interior from
boundary; triangular dot patterns support prediction and generalisation.
Measurements are hidden until requested. The prompt asks for a prediction and an
observation, but does not lock controls behind prose entry. Experiments use
learner-chosen values, not an automatic rendering of the active answer.

Mochi receives the experiment, prediction, observation and reasoning trace when
asked to discuss them. Opening a visual aid before solving counts as support.
The app does not call supported performance independent mastery. A learner can
later demonstrate independence on a different question.

The map displays actual evidence, with empty states before any work. It exposes
prerequisites and observed solution routes, starts focused sessions and shows
saved insights. It does not invent completion percentages or percentile badges.

## Adaptation to Euna’s logic

| Evidence | Action | Limit |
|---|---|---|
| Written reasoning stages and revisions | Tutor follows the relationship, operation and check in order | Text is not automatically graded for proof quality |
| Selected approach: model, equation, table, backwards or small cases | Tutor can engage with her chosen approach and compare an alternative | A route is not a fixed learning style or proof of effectiveness |
| Learner-reported difficulty | Suggest an appropriate next thinking step | Self-report is a clue, not a diagnosis |
| One checked small-case concept probe | Revisit that relationship or connect it to the original problem | Passing one probe does not establish general understanding |
| Three latest answers independently correct in a skill | Prefer a deeper question form where the bank provides one | Difficulty tags and thresholds are design heuristics |
| Two latest first answers incorrect | Prefer a smaller conceptual step | Speed is not used to label ability |
| A missed problem without concept evidence | Check an unproven prerequisite | The tutor must investigate rather than invent the cause |
| Delayed independent work on different forms | Build retention evidence | This is not a validated learner model or admissions prediction |

A skipped question is excluded from sampled-skill evidence and inferred misses.
The app retains it as a session event. Transfer requires an explicitly authored
transfer item, previous independent evidence for that skill and a question family
not used in the last five attempts for that skill. Even this stricter rule records
only an opportunity and observed numerical performance; adult review is needed
to establish the breadth and quality of transfer.

## Challenging work

The eight added generators cover:

| Investigation | Thinking to look for |
|---|---|
| Parity-preserving moves | An invariant that applies to every possible move sequence |
| Reversed digits | Representing place value and satisfying two constraints |
| Rectangles of all sizes in a grid | A complete counting scheme without duplicates |
| Guaranteed matching socks | A worst-case argument and a construction proving minimality |
| Mixed-value coins | A useful starting model and controlled substitution |
| Boundary tiles in a square | Duplicate correction and two equivalent general arguments |
| Multiples from a restricted digit set | Divisibility and exhaustive case organisation |
| Closest two numbers from four digits | Optimisation plus an argument ruling out a better result |

These are original enrichment items, not NUS High questions or a calibrated top
1% test. Bank marking checks the numerical/choice answer; it cannot verify that
the learner's explanation is valid merely because the value matches.

## Evidence-informed premises

The US What Works Clearinghouse's elementary mathematics guide recommends clear
mathematical language, systematic teaching, well-chosen representations, number
lines and deliberate instruction in word problems. Those principles inform the
small-case explanations and connected visual tools here. This guide concerns
intervention and does not validate this app, these thresholds or elite attainment.
[IES/WWC mathematics practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/26).

The WWC study guide supports spaced study, alternating worked examples with
problem solving, connecting concrete and abstract representations, retrieval
practice and explanatory questions. These inform the review, explanation and
verification cycle. The guide does not establish that a conversational AI tutor
can guarantee a particular percentile.
[IES/WWC study practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1).

The Singapore content and admissions distinctions remain documented in the
[curriculum review](CURRICULUM_REVIEW.md), using MOE, SEAB and NUS High sources.

## How to evaluate the top 1% ambition

Use an external assessment with a defined reference population and a reported
percentile, where available. A score of 99% on an easy paper is not the 99th
percentile. The parent panel accepts a paper/source, date, score/feedback and an
optional externally supplied percentile; it never calculates a percentile from
app accuracy. Adult-entered percentile values are explicitly unverified records.

Review unfamiliar problems and written arguments with a teacher. Look for
identifying the unknown, building a defensible model, carrying out the operations,
checking the result, and adapting a method when the structure changes. Prefer a
fresh independently completed task after feedback to simply repeating a template.
No validated method can promise that this app alone will make Euna a top 1% pupil.

## Verification and remaining validation

113 tests pass. The question tests independently solve 100 visible statements from
each of 80 generator families (8,000 questions), with checks for wrong answers.
Additional tests cover learning, numerical marking, revisions, retention, backups,
stale provider replies, reasoning traces, concept-probe routing, focused practice,
lab relationships, assessment isolation and map-to-practice actions. Transport
tests use mocked providers. HTML nesting, IDs, local asset references, JavaScript
syntax and whitespace were checked.

The tests use a lightweight event/storage harness. They are not browser rendering,
touch-device, live handwriting or live AI quality tests. Those remain outstanding.
After review, trial portrait and landscape on Euna's iPad, opening and closing the
lab and tutor, using the pencil, following stage tabs, resuming offline and checking
the configured AI connection. Then conduct a supervised session with Euna to see
whether prompts actually expose her reasoning and help her progress independently.

The app keeps the existing family API setup and device-local learning history.
Keys remain on that device and requests go directly to the selected provider.
The parent gate is a convenience. Multi-user production would require a server
relay, real authentication and usage controls. There is no automatic cloud sync.
