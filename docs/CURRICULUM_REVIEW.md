# Curriculum and tutoring review

Reviewed 11 September 2026. Baseline: repository v1.3.0, 42 generators / 16 topics.
Initial revision: v1.4.0, 72 generators / 19 evidence groups.
The v2.0.0 studio adds 8 investigations (80 total); see [the studio review](STUDIO_REVIEW.md). This is a code and content
review against public standards, not a psychometric calibration or a teacher’s
assessment of Euna. No learner answers or existing device history were available.

## Finding

The original app was useful for generated practice but insufficient as the main
preparation programme. Topic accuracy blurred independent understanding with
helped answers, several questions or explanations misled the learner, the bank
missed substantial primary geometry and algebra, and tutor rules prioritised a
rigid withholding ladder over responsive teaching. The update addresses these
problems while preserving its offline bank and pet experience.

## Official benchmarks

| Benchmark | Verified requirement | Consequence for the app |
|---|---|---|
| SPERS-Sec1 | P6 mathematics; no calculator; 34 MCQs / 30 min, then 20 short-answer and 10–15 open-ended / 105 min; written methods | Core primary coverage, no-calculator practice, working and explanation; a short sprint is labelled practice, not a replica |
| MOE primary framework | Concepts, skills, processes, metacognition and attitudes support problem solving | A plan, representation, reflection, verification and alternative methods alongside calculations |
| Current P6 curriculum | The 2021 syllabus applies to P6 from 2026; includes simple linear equations; no dedicated speed topic | Add equation work; retain speed as extension rather than core |
| 2026 PSLE | Revised paper format and explicit assessment of application, inference and strategy selection | Remove obsolete paper-format claims; do not equate difficulty stars or app accuracy with ALs |
| NUS High | Separate DSA admissions; school learning plus wider reading, mathematics/science, problem solving, independence, creativity and communication | Original reasoning investigations and resource use; no invented entrance cut-off or “NUS-ready” badge |

Sources checked:

- [SEAB SPERS test details](https://www.seab.gov.sg/spers-sec/test-details/).
- [MOE primary syllabus page](https://www.moe.gov.sg/primary/curriculum/syllabus), including its linked
  [2021 Primary Mathematics Syllabus, updated October 2025](https://cms.moe.gov.sg/assets/92bff26d-b2b4-4535-b868-b8415c744b91/2021%20Primary%20Mathematics%20Syllabus%20P1%20to%20P6%20Updated%20October%202025.pdf).
  The PDF was downloaded from MOE: framework pp. 5, 13–14; implementation note p.30;
  standard P4–P6 content pp.37–44. Foundation P5–P6 is a separate section.
- [SEAB 2026 Mathematics examination format](https://isomer-user-content.by.gov.sg/334/fe51f29b-04ae-4fcb-a907-8db04c028510/0008_y26_sy.pdf):
  18 MCQs and 12 short answers in Paper 1, 70 minutes; 5 short answers and 10
  structured/long answers in Paper 2, 80 minutes. Paper 2 allows calculators;
  SPERS does not. AO1: basic knowledge/computation; AO2: interpretation/application;
  AO3: reasoning/inference/strategy. No allocation of app questions to official
  assessment-objective weightings is claimed.
- [NUS High Year 1 admissions](https://www.nushigh.edu.sg/admissions/year-1-and-3-admissions/year-1-admissions/)
  and [FAQ, especially Q11](https://www.nushigh.edu.sg/admissions/year-1-and-3-admissions/admissions-faq/).
  The 2026 May–June application and July selection dates are historical guidance
  for planning, not published dates for the 2027 exercise / 2028 entry.
- [Returning citizens / PR admissions](https://www.nushigh.edu.sg/admissions/year-1-and-3-admissions/admissions-for-singapore-citizen-pr-and-international-students/).
  Overseas status does not merge the NUS High route with SPERS. Check the applicable
  2028 intake’s eligibility and arrangements directly when published.

## Audit of all original generator families

Names below identify every original generator; mathematical correctness checks
parse generated statements independently of their implementation.

| Group | Original families reviewed | Coverage judgement / action |
|---|---|---|
| Whole numbers | `placeValue`, `rounding`, `factorsMultiples`, `orderOps` | Useful foundation; still needs larger-number operations, brackets and more representations |
| Fractions | `fracRemainder`, `fractionDivide`, `fracDivWhole`, `workingBackwards` | Overweighted word templates without enough operation/concept practice; add comparisons, addition, multiplication, fraction division and mixed subtraction |
| Ratio | `ratioDiff`, `ratioChange` | `ratioChange` gives the total and initial ratio, making the final ratio/transfer unnecessary; reduce its rating and add a genuinely unknown-total transfer and three-part sharing |
| Percentages | `percentDiscount`, `percentWhole`, `percentChange`, `gst`, `commission` | Good range of numerical applications; repair erroneous decrease equation and add a changing-reference-whole task; annual interest remains missing |
| Decimals | `decimals`, `fracToDecimal` | Add decimal division; replace fictional $30 note; still needs thousandths, rounding and broader operations |
| Rates | `rateWork`, `rateTable` | Retained as primary rate work; combine with units and proportional explanations |
| Speed | `speed`, `twoLegSpeed`, `twoVehiclesMeet` | Move to extension; repair noon displayed as a.m.; no longer presented as a required primary topic |
| Algebra | `algebra`, `algebraFraction` | Both only substitute; add relationship interpretation, simplification and simple linear equations |
| Circle geometry | `semicircle`, `quadrant` | Useful but repetitive; add composite boundary with an internal edge excluded |
| Volume | `volume`, `volumeDepth`, `waterTransfer` | Repair diagram leaking unknown depth; add face area and cube-edge problems |
| Angles | `angles`, `parallelogramAngle`, `isoscelesAngle`, `parallelAngle` | Basic properties covered; standalone parallel-transversal task is conservatively extension; multi-shape angle deduction remains thin |
| Averages / data | `average`, `averageTable`, `pieChartQ`, `barGraphQ`, `lineGraphQ` | Retain; add evidence/claim critique in enrichment; table completion and richer inference still needed |
| Measurement / time | `measureConvert`, `timeDuration` | Add measurement comparison and reverse-time problem to check transfer and vary methods |
| Modelling / money | `gapDiff`, `coinsProblem` | Retain; add a linked two-part budgeting task. Complex long-answer and partial-method assessment remain limited |

## Added questions

30 original generators, grouped by purpose:

- Foundations: `fractionSum`, `fractionProduct`, `fractionCompare`,
  `decimalDivision`, `fractionByFraction`, `mixedSubtract`, `timeStart`,
  `measurementCompare`.
- Geometry/spatial: `areaTriangle`, `rectanglePerimeter`, `compositeArea`,
  `parallelogramArea` (extension), `symmetryCount`, `cubeNet`, `unitCubes`,
  `circleComposite`, `cuboidFace`, `cubeEdge`.
- Relationships/transfer: `ratioUnknownTotal`, `fractionRemainderTransfer`,
  `multiPartBudget`, `algebraRelationship`, `changingWhole`, `linearEquation`,
  `simplifyExpression`, `ratioThreeParts`.
- Investigation: `counterexample`, `patternGeneralise`, `systematicCounting`,
  `evidenceClaim`.

These are original practice tasks, not copied examination questions. The cube net
has a small fixed family and the survey critique is a single fixed claim; neither
should be mistaken for a deep bank of novel spatial/statistical problems. Correct
recognition of those items alone cannot establish mathematical independence.

## Bugs and misleading behaviours repaired

1. `volumeDepth` printed the target depth on the figure despite describing it as
   unknown. The label is now `?` and water height uses a fixed schematic proportion.
2. Percentage-decrease working subtracted the new price from itself. It now uses
   the larger amount minus the smaller amount.
3. Mixed-number parsing collapsed `1 1/2` into `11/2`. Fraction/mixed syntax is now
   explicit, and expected units are validated instead of discarding arbitrary words.
4. A 0.005 numerical tolerance credited wrong short fractions. Exact-value marking
   now allows only floating-point noise, not unspecified rounding. Equivalent
   fractions are accepted as the same value; automatic simplest-form grading is
   not claimed.
5. A wrong answer locked the question. It now remains editable; retries do not
   double-count the question, coins, or independent evidence.
6. Correct answers after hints/reveal fed “mastery.” A separate evidence store now
   distinguishes assistance, guesses and retries; old history is not back-filled.
7. Working feedback inferred an incorrect method from unfinished/unreadable sums,
   and claimed earlier lines were all correct. It now describes only detected
   arithmetic evidence and asks about the method. Typed lines retain focus while
   being edited; blur/commit refreshes arithmetic feedback.
8. Late model or transcription responses could arrive after moving to a new
   problem. Question epochs reject stale responses; active tutoring calls abort.
9. The service worker evicted unrelated same-origin caches. Cleanup is now limited
   to `mochi-` buckets; all new modules are included in the offline shell.
10. Old README claims about exam calibration, six-step withholding, fixed prices and
    marking guarantees were not supported by the checkout. Documentation now
    reflects what is implemented and what was actually verified.

## What “personalised” means here

The learner record is local and changes with Euna’s work. A sparse initial sample
leads to more foundation checks; difficulty rises with repeated independent
answers. A missed or heavily assisted skill can trigger an unproven prerequisite.
Due reviews and new contexts prevent only practising the latest template. The
model receives a small slice of relevant history, her plan, obstacle choice and
working, and must distinguish observations from hypotheses.

No automated clinical or cognitive diagnosis is made. “Strategy” or “calculation”
is currently Euna’s self-report, with arithmetic evidence where readable; the tutor
investigates it conversationally. Free-form explanations are discussed by AI, not
scored by a validated rubric. A long sentence is not proof of correct reasoning.
Time is supporting context, not a speed penalty. No school rank, intelligence,
learning disorder or likelihood of admission is inferred.

## Suggested programme through September 2027

This pacing is a recommendation, not a guaranteed acceleration schedule.

| Period | Main work | Evidence to look for |
|---|---|---|
| Sep–Oct 2026 | Initial sample; repair fractions, number sense, units and question reading | Can explain the quantities, draw a representation and revise an error |
| Nov 2026–Feb 2027 | Full primary coverage, varied applications, spaced practice | Can solve fresh variants without hints on separated days |
| Mar–Jun 2027 | Mixed unfamiliar problems, investigations, reading and explanation | Can choose a method without a topic cue, challenge a claim, and teach the idea back |
| Jul–Aug 2027 | No-calculator paper sections, written methods and remaining gaps | Accuracy and clear working under realistic timing, independently marked |
| Sep 2027 | Targeted revision, confirmed exam arrangements, rest | Stable independent performance across several unseen papers, not one app percentage |

NUS High application preparation must start earlier than September; include
science and broad mathematical/scientific reading. SPERS also has an English test.
For competitive mainstream placement, use fresh, independently marked paper work;
there is no defensible conversion from this app’s scores to particular schools.

## Verification and remaining work

91 code-level checks pass. They re-solve 100 generated statements for every generator (7,200 total),
exercise wrong-answer mutations, and check evidence, learning routes, backup/import,
revision, multi-part marking, mocked provider success/failure and stale-response rejection. They do not establish item difficulty or reliability.
No live AI call, handwriting accuracy measurement or browser/iPad visual QA was
performed. A parent should run Test with the configured provider and supervise the
first session. Suggested live checks:

- An incorrect answer with a sound method: does Mochi identify the arithmetic step?
- A correct guess: does it request an explanation rather than assume understanding?
- A valid alternative method: does it accept and examine it?
- Repeated confusion: does it explain concretely rather than repeat questions?
- “I read this rule online”: does it ask for applicability and a test?
- A pasted problem missing a diagram: does it ask for missing information?

Priority remaining content: drawing/measuring constructions and grid symmetry;
varied nets and solid views; complex composite geometry; whole-number/mixed-number
operations; annual interest; rich long-answer questions with teacher-checked method
marks. Add these as item families with independent answer checks, rather than
asking an AI to generate unchecked scored questions on demand.

API keys still reside on the family device, an inherited limitation of the static
app. Backups omit them. An authenticated server relay is needed before turning this
into a multi-user service. [OpenAI guidance](https://developers.openai.com/api/docs/guides/text)
was checked for the integration; live provider access was not verified.
