# Science reasoning pathway — v6.5.0

## The benchmark and its limits

June 2027 is the family's preparation goal, not an announced examination date.
The aim is independent application, evidence evaluation and explanation in unfamiliar
science situations. No authenticated released NUS High DSA science paper was found
in the public sources checked for this release. That is a search result, not a claim
that no such document exists.

The references have different roles:

- [NUS High admissions FAQ](https://www.nushigh.edu.sg/admissions/year-1-and-3-admissions/admissions-faq/)
  supplies official selection aims: understanding and applying school science,
  wider reading, problem solving, independence, creativity and communication.
- [MOE Primary Science Syllabus](https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf),
  for the 2023 Primary 3 cohort, updated January 2026, supplies the core concepts
  and inquiry practices. This includes fair comparisons, measurements, data and
  explanations supported by evidence.
- [Official SPSO sample questions and topic guide](https://www.nushigh.edu.sg/spso/sample/)
  supply a supplementary challenge/breadth reference. They include physical and
  living systems, matter, Earth science and scientific methodology, with both
  single-choice and multiple-statement questions.
- [The school's SPSO FAQ](https://www.nushigh.edu.sg/spso/faq/) explicitly distinguishes
  SPSO from DSA and directs learners to samples rather than past SPSO papers.

This course is not derived from the post-admission Programme of Studies. SPSO is
not the entrance test and does not establish an equivalent difficulty distribution.
No commercial or official questions or diagrams are reproduced. The new examples
are original; synthetic data are labelled. Scientifically important assumptions
are explicit, such as a closed system, matched conditions, an ideal battery,
near-equilibrium melting, or a supplied buoyancy model. The course does not teach
unconditional claims that photosynthesis always rises with temperature, that all
floating objects are half-submerged, or that a positive result proves every cause.

## Discovery-first lessons

Science lessons now introduce the **reasoning that produced the concept** before asking Euna to use the finished rule. Each of the 24 units follows the same compact sequence:

1. **Mystery** — encounter a phenomenon and make an ungraded prediction before the explanation is shown.
2. **How the idea changed** — read a short historical or representative investigation: what people thought, what was observed, and what competing explanation was challenged.
3. **Recreate the evidence** — choose the observation or comparison that actually discriminates between the explanations.
4. **Build the model** — reveal the modern scientific model and use it in a worked changed-context example.
5. **Explain and check** — put the model into words, complete the authored concept check, then move to guided and independent practice.

The history is explicitly **not a scientist-name memory list**. Some lessons use named historical cases (for example Snow on cholera evidence, Lind on treatment comparisons, Volta/Galvani on electricity, Ibn al-Haytham on optics, Lavoisier on quantitative chemistry, Harvey on circulation, Perrault on hydrology, and the Wright brothers on wind-tunnel testing). Other units use a representative sequence of observations where attributing the idea to one person would be misleading. The student interface reminds Euna that scientific discovery is cumulative and that the question is always: *what evidence would have made the explanation change?*

Prediction and discovery choices are low-stakes lesson state. They do not count as independent mastery, paper evidence, or admissions-readiness evidence. Existing completed lessons remain completed after this update; revisiting them opens the new discovery story without deleting prior progress. Historical source notes are collapsed for grown-ups and are separate from the official syllabus/selection references below.

## The 24-unit route

| Strand | Units |
|---|---|
| Investigations and evidence | Observation/inference; fair comparisons; measurement and bias; graphs; normalised rates; discriminating models. |
| Physical systems | Circuit topology; light paths/shadows/reflection; heat and temperature; force and motion; energy accounting; magnets/electromagnets. |
| Living systems | Classification; photosynthesis and limiting effects; respiration and net exchange; transport; digestion and controls; ecology/life-stage needs. |
| Matter, Earth and technology | System boundaries/particles; changes and separation; density/buoyancy models; water/environmental evidence; Sun/Earth/Moon models; unfamiliar passages/design trade-offs. |

Each unit has three compact teaching sections: **Mystery**, **Evidence**, and **Build the model**, followed by the same guided/application/transfer/retrieval pathway. The Evidence section can reveal three original worked examples after the discriminating-evidence check; the final section includes the conceptual exit check. There are 96 seeded templates: 72 learning forms plus 24
reserved assessment forms. Numerical variants are not 96 different methods and
some conceptual forms are intentionally finite. Repeated exposure does not become
fresh evidence merely because choices are shuffled. The interface labels core
work, enrichment bridges and enrichment; these labels are teaching judgements,
not an asserted official DSA syllabus. Existing primary science lessons and the
original virtual experiment activities remain available.

This is not exhaustive coverage of every item in the broad SPSO guide or of an
unknown entrance paper. Specialist factual breadth (for example detailed Earth
structure, many species names, health facts and technological history) is not
certified by this bank. Appropriate wider reading and external unseen work remain
important; the new science course is not a substitute for a complete school course.

## Learning and marking

The sequence parallels maths: learn, guided attempt, two fresh independent
applications, a changed-structure form, and delayed retrieval after a full week.
These advancement counts and intervals are teaching heuristics, not validated
admissions predictors. A learner can access help and revise mistakes without losing
companions or rewards. Repeated failure offers a fresh guided question rather than
trapping the learner. Format/incomplete-choice problems are not recorded as science
misconceptions.

Each new question checks a conclusion (or three independently selected true/false
statements) AND a supporting reason. Both must be correct for full question credit.
The two components are separately recorded, including their first responses. A
correct conclusion with a wrong reason is useful diagnostic evidence, not independent
success. Hints, guessing, solution reveals and wrong first pairs remain sticky after
revision and device merging. Fixed ordering does not expose a repeating answer key:
conclusions, reasons and statement rows are shuffled without creating new novelty.

The free "My explanation" working box and stylus diagrams are saved and are **not
automatically graded**. (From bank revision 2, some questions are themselves short
written answers; those are first-checked by key ideas — see "Revision 2" below.) Grown-up settings displays
reference reasoning and a review rubric (claim, evidence, scientific connection and
limits). Adult judgements and parent-entered external scores are separate records.
The lesson and paper diagrams use original monochrome SVG constructions and
semantic tables, with accessible equivalent graph values. Circuit diagrams show
connections without revealing which bulbs are powered. The activities are virtual;
no mains-electricity or unsupervised heating experiment is required.

## Assessments

Two six-question untimed starting checks identify teaching needs. Three optional
mixed forms each contain 24 questions (six per strand) with an original 60-minute
practice limit. These are training formats, not the DSA test format and not
psychometrically calibrated difficulty equivalents. Conclusions and reasons remain
editable before submission. Paper mode withholds hints, feedback and solutions
until submission. The original deadline survives reload. Submitted answers are
frozen. Assistance, interruption, prior exposure and conflicting edits disqualify
an otherwise high score from the internal independent-paper target.

The internal aspiration is 85% full conclusion/reason pairs on three distinct
reserved forms, broad independent evidence and adult-reviewed explanations. An
external unseen-paper result must separately corroborate progress. The interface
never calculates an admission chance, percentile or a school cutoff. Single-component
subtotals describe the structured questions only, not the quality of free writing.
Printing uses separate practice forms with choices and space for working, not
reserved questions. The client-side app is educational, not secure proctoring:
source inspection can reveal keys.

## Persistence and regressions

`S.sciencePath` is a new versioned field inside the existing storage envelope.
It does not replace `S.science` or `S.entrance`. Previous maths/science histories,
lesson notes, coins, wardrobe, companions and device-local provider settings are
preserved. Old practice can suggest a prerequisite repair without granting new
science-path mastery. Exports include the separate path and report but no provider
keys. Old backups lacking the new field keep current pathway records. Full reset
continues to require the existing explicit confirmation.

Maths and science now share `path-core.js`, with separate content, record keys,
paper identities and timing. The existing maths regression suite remains in use.
Science tests cover 9,600 distributed generated cases for structure, deterministic
marking, distinct options and separate claim/reason results; quantitative cases are
also independently recalculated from their stated givens. Other checks cover
logical statements, circuit topology, scientific conditions, exposure, seven-day
retrieval, validation/merge, deadlines, frozen submission, old-state preservation
and offline assets. These are software/content checks, not educational-outcome
validation.

`tests/fixtures/science-path-browser.html` runs actual controls in a localhost-only
empty temporary profile using synthetic data. It checks learning navigation, dual
answers, incomplete selections, saved working, access to older labs/classrooms,
maths preservation, statement controls, paper feedback/submission and narrow layout.

## Ask Mochi · AI TA

During science practice questions, Euna can open **Ask Mochi · AI TA** and choose **I don’t understand the question**, **I don’t know how to start**, **Check my idea/reasoning**, or type her own question. The TA receives the active question and her current typed working. Before the solution is open, it is instructed to scaffold one next step rather than reveal the final answer. Asking records the attempt as supported, so it cannot be counted as independent evidence. Reserved paper mode deliberately has no tutor access before submission. Without a configured live provider, the panel falls back to the built-in lesson guidance.

## Revision 2 of the science bank (DSA upgrade)

Past answers are re-marked by regenerating each question from (unit, form, seed), so
`science-path-bank.js` now has `REV = 2` and `make(id, form, seed, rev = REV)`. Revision 1
of the 24 original units (96 templates) is frozen and byte-identical; every change to an
original template lives in `science-path-rev2.js`. Existing papers and starting checks
are pinned to the original 24 units at revision 1 (`rev: 1` in their definitions).

- **No answer-length cue.** Revision-2 distractors are believable misconceptions of
  similar length. Across the bank the correct reason is strictly the longest option in
  about 10% of choice questions and the correct conclusion in about 7% (the test limit is
  40%); no option is shorter than 55% of the longest.
- **New answer kinds.** *Numeric* answers accept a tolerance and an optional unit
  (equivalent units such as km/m or N cm/N m are converted; a wrong unit is recorded as
  a unit slip). *Written* answers are checked against key ideas (claim, evidence,
  scientific reason): each idea is a set of word groups matched within one sentence,
  forgiving one spelling slip in longer word stems; some items also reject a stated
  misconception. The learner sees which key ideas were found and which are missing, and a
  grown-up can record a "Reasoning is valid" review alongside the automatic check.
  *Variable roles* ask for the changed, measured and kept-the-same variables.
- **Fair tests.** The fair-test unit now includes variable-role items and two written
  "plan a fair test" items (change one thing, keep others the same, measure, repeat).
- **Six DSA bridge units** (`sx-cells`, `sx-machines`, `sx-pressure`, `sx-waves`,
  `sx-chem`, `sx-life`) follow the original 24 in the path, each with lessons, a
  discovery story, a concept check, quick checks and four forms mixing question kinds.
- **Figures.** New accessible SVG figures: bar chart (with an optional non-zero baseline,
  now used by the truncated-axis question), plant cell, lever, pulley, water can, fruit
  and life cycle.
- **Variety.** Many single-question templates gain several contexts at revision 2.

Key-idea marking is a first check, not expert grading: it can miss an unusual but valid
answer, so grown-up review remains part of the evidence.
