# DSA readiness (v7.2.0)

This release reworks how the Maths and Science paths schedule and test Euna for the NUS High selection test, expected on the first Saturday of July 2027. It follows an audit of the app against what the test is reported to need: choosing a method for an unfamiliar problem under time pressure, olympiad-style maths, lower-secondary science, explaining reasoning, and wide reading.

## What the test is (as far as is public)

- **Official (NUS High admissions page and FAQ):**
  - Maths and Science selection tests, then a selection camp for those shortlisted.
  - The tests cover school maths and science, plus general-knowledge questions about how widely read applicants are.
  - The camp looks at problem solving, passion, independence, creativity and communication.
- **Reported, not official:**
  - Maths: about 90 minutes, about 23 questions, whole-number answers worth 1–4 marks each, no calculator.
  - Science: multiple choice reaching into lower-secondary content.
- **What this means for the app:** the mocks follow the reported format, but no admissions score or probability is calculated.

## How the path works now

| Change | Why |
|---|---|
| Reviews come back after 7, 14, 30, 60, then 90 days. | Before, every finished method came back every 7 days forever, and reviews always went before new learning. In a simulation, she never reached the challenge units. |
| Due reviews come as a short **mixed set** with no topic title, method hint or lesson link: 2 questions, or 3 when several methods are due. There is at most one set a day; with nothing due, a warm-up set runs every third day. | She practises deciding which method a problem needs. Reviews stay at about a third of a short day. |
| A unit missed four times at the same step is **set aside for three days**. | One stuck method can no longer block everything else. |
| Independent answers on the **starting checks** and **papers or mocks** count as evidence. A correct paper question means the method needn't be taught again. | She doesn't re-learn what she already knows. |
| When a question form has no unseen variant left, the one seen longest ago is reused and still counts (flagged). | Small question pools no longer trap the path. |
| Every missed first try goes into a **mistake log**. She can tag it (misread, wrong method, calculation slip, rushed, not sure). It comes back unchanged three days later for **a second look**, at most one a day. | Fixing a mistake later, rather than seeing the answer once, makes it stick. |
| Maths asks for **one line on the plan** before checking a new-twist or mixed-set question. A missing line is not counted as a mistake. | Practice for explaining reasoning at the camp. |

**Simulation results:** with perfect answers at four questions a day, all 40 maths units are reached in about 90 days. With 30% first-try misses, it takes 150–180 days, which fits before July. `tests/dsa-readiness.test.cjs` simulates four random sequences.

## Mock papers

- **Maths:** six DSA-style mocks.
  - Each has 24 questions in rising difficulty, worth 1, 2, 3 or 4 marks (55 marks in all).
  - They take 90 minutes and are drawn from the core, geometry-bridge and challenge units.
  - No question repeats across any paper.
- **Science:** four mocks covering all 30 units, including the new lower-secondary ones, in 70 minutes.
- **Schedule:** mocks count back from the test date. Maths runs from January to June; science from January to early June.
- **Where they show up:** a mock that is due appears on Today and on the path home page. It is never started automatically.
- **Original papers unchanged:** the original starting checks and mixed papers A–C are unchanged.

## Content added in this release

- **Maths:** nine new challenge units.
  - `dsa-puzzles.js`: logic and strategy; seeing in 3D and counting shapes; counting cleverly.
  - `dsa-numbers.js`: digits and divisibility; clocks, calendars and laps; most and least.
  - Each form has at least two structurally different variants, and every answer is re-solved by brute force in the tests.
- **Maths fixes:**
  - The rates paper question now gives whole-number answers.
  - Invariants questions now have "Yes" answers as well as "No".
  - Angle questions vary.
  - The "challenge" questions that were too easy have been made harder.
  - Ratios are simplified and money shows two decimal places.
- **Science:**
  - Six new units: cells, levers and pulleys, pressure, sound and pendulums, acids/alkalis and chemical change, and life cycles and reproduction.
  - Number-entry and short written answers, marked by key ideas.
  - Questions that ask her to name the variables, and plans for a fair test.
  - Bar charts.
  - Distractors that are believable misconceptions. The correct reason is now the longest option about 10% of the time, down from 87%.
- **General knowledge:** `wide-reading.js` has 72 "Did you know?" questions (36 maths, 36 science), one a day on Today. There are also 12 weekend camp-style investigations with prompts for explaining to a grown-up.

## History stays stable

- **Why it matters:** past answers are re-marked by regenerating each question from its unit, form and seed. Question banks now have revisions.
- **What is stored:** every attempt, draft and paper records the revision it was generated with. Anything saved before this release reads as revision 1.
- **What doesn't change:** the original checks and papers are pinned to revision 1.
- **Tests:**
  - `tests/history-stability.test.cjs` snapshots revision 1 of every existing template.
  - Two older tests pin the original papers byte for byte.

## For the grown-up

The Maths and Science grown-up panels now open with a **Selection-test readiness** section:
- weeks left and methods remaining;
- the pace needed against the recent pace, with a plain status;
- first-try accuracy and help use by strand, for the last four weeks against the four before;
- mistakes by reason, with how many are waiting for a second look;
- mock results over time;
- a date field that sets the test date for both subjects.

The grown-up planner's "Next" now shows what Today will actually open.
