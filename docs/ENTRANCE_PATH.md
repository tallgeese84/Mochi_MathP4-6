# June 2027 entrance-reasoning pathway — v6.0.0

## Target and scope

The working benchmark is the supplied **PD STEM Education, NUS High DSA Selection
Test Preparation: Mathematics (2024)** booklet. It is commercial preparation
material, not an official entrance paper, admissions syllabus or cutoff. The
post-admission Programme of Studies is not the curriculum target. NMOS is a
supplementary problem-solving reference, not the main score target.

The June 2027 date is a preparation goal, not a claimed examination date. The
internal goal is 85% on three distinct, previously unopened mixed forms, breadth
across four strands, and adult-reviewed explanations. An external unseen-paper
check must separately corroborate progress. No percentile or admission probability
is calculated. The three 24-question/75-minute formats are **original training
formats**, not replicas or validated difficulty equivalents of the school's test.

## What is included

24 units each provide a conceptual lesson, three selectable original worked
examples, a conceptual exit, guided practice, application and structurally changed
practice. There are 96 seeded question templates: three learning forms per unit and
one reserved paper form. Numerical variants of a template are not counted as
independent new methods. The older foundation classroom, Maths bank and Science
course remain accessible.

| Strand | New methods | Benchmark correspondence |
|---|---|---|
| Algebra, Rates & Proportions | Relationships; percentage wholes; changing remainders; simultaneous conditions; fixed-quantity ratios; combined/net rates; relative motion and average speed; equivalent capacity | Booklet pp. 2–9. Percentage and remainder lessons supply explicit prerequisite bridges. |
| Geometry & Spatial Reasoning | Shared-height area; decomposition and overlaps; circles; angle arguments; nets and cube views; cube dimensions and exposed faces | Booklet pp. 11–17. Surface-area work is a labelled extension/bridge, not an asserted entrance prerequisite. |
| Counting & Arithmetic / Number Theory | Prime factors; remainder cycles; counting cases; digits and palindromes; sums; patterns; spirals | Booklet pp. 20–27; organising cases follows its systematic approach. |
| Logic & Strategy | Conditions and cases; invariants/guarantees; bounds/optimisation | Booklet p. 18 plus original enrichment. |

The bank does not yet reproduce every advanced problem demand in the booklet.
In particular, decorated-net letter orientation, full multi-letter alphametics,
unknown grass-growth systems and the irregular cyclic hexagon need further
specialised teaching and assessment. A correct app paper is not evidence of
mastering unrepresented demands. Independent external work remains necessary.

No booklet pages, copied drawings, learner records or credentials are distributed.
The questions, explanations and SVG constructions are original. The diagrams use
monochrome linework, lettered vertices, hatching and restrained grey cube faces.
Support-only construction lines are absent from unassisted diagrams.

## Learning and evidence

* Lesson completion records exposure plus a small conceptual check, not mastery.
* Guided answers are supported; two fresh unassisted application answers invite a
  structurally different practice form. This is a teaching heuristic.
* A successful transfer form schedules a recall check after a full week. Reopening
  related teaching prevents an immediate response from being called delayed recall.
* The original history can suggest foundation-repair priorities. It does not
  retroactively grant entrance-path mastery or erase prior achievements.
* First errors, hints, guessing and solution reveals remain sticky through revision
  and cross-device merging. Later reflection is separate from submitted working.
* Answer-format problems prompt correction without recording a mathematics miss.
* Free explanations and handwriting are saved, not automatically graded. An adult
  can mark an explanation valid or needing discussion in Grown-up settings.
* New independent work contributes to the existing planner's earned milestones.
  No new coin charge, daily-streak penalty or additional paid API call is introduced.

## Paper mode

Two six-question untimed starting checks precede three optional balanced mixed
papers. Starting checks identify teaching needs; they are not entrance predictions.
Question/strand labels, hints and feedback are withheld while answering a paper.
Answers can be revised and questions marked for later until submission. The original
deadline survives reload; late changes are rejected. Leaving for another activity,
pausing or opening parent help makes the form supported practice, not qualifying
independent timed evidence. Each reserved form counts at most once. All items in an
opened form count as exposed, even if the learner has not navigated to them yet.

The client-side app is an educational tool, not secure/proctored test software.
Offline source inspection can reveal answers. Paper scores are automatically
marked numeric/choice scores; valid alternative reasoning still needs adult review.
Printed practice uses separate learning variants, not reserved paper content.

## Persistence and safety

`S.entrance` is an additive, versioned field inside the existing storage key.
Lessons, original response histories, working, bounded ink, exposure fingerprints,
parent reviews, fixed-paper states and parent-entered external scores are validated
on restore. Exported reviews include this field and a separately labelled summary.
Older backups without it preserve the current pathway. Provider keys are excluded.
Cloud merging unions history and exposure, preserves known help/first failures,
freezes submitted papers and marks incompatible concurrent edits conservatively.
An explicit full reset remains the only normal way to clear all progress/rewards.

## Validation

`npm test` includes deterministic checks of all 96 forms over 100 seeds each,
independent calculations/brute-force solutions, exact fraction/π marking, diagram
geometry, study stages, seven-day recall, exposure, paper freezing, deadlines,
three-form target criteria and conservative restore/merge semantics. The original
startup and subject/cat tests remain part of the suite.

`tests/fixtures/entrance-browser.html` runs real page controls using synthetic state
only. It refuses non-local hosts or an existing saved progress/sync configuration.
Use a fresh temporary browser profile and a local HTTP server. It exercises lessons,
wrong/format answers, guided/application separation, subject switching, reflection,
backup, paper feedback withholding, edit/submit/timer behaviour and 375px layout.
