# v7.12 — AMC 8 preparation (20 November 2026)

Euna can take the AMC 8 through her school's MATHCOUNTS club on **Tuesday 26 January 2027**. It is 25 multiple-choice questions in 40 minutes with no calculator, and wrong answers cost nothing.

Mochi's Maths topics were checked problem by problem against the 2025 and 2026 AMC 8 papers. About 21 of the 25 problems each year fall in topics Mochi already teaches. The gaps were:

- the Pythagorean theorem, right triangles and square roots;
- probability;
- coordinates and negative numbers, which the Singapore primary syllabus does not teach;
- the contest format: Mochi practice is untimed and free-response, and its entrance-style mocks allow 4–6 minutes a question, against about 1.6 on the AMC 8.

No AMC problem, wording or figure is reproduced. Past papers are copyrighted and stay on paper.

## 1. Three contest topics (`dsa-contest.js`)

| Unit | Lesson | Question types (forms 0–3) |
| --- | --- | --- |
| `amc-right` · Right triangles and square roots | Squares and roots, Pythagoras’ theorem, where right angles hide | Longest side, missing side, side of a square · rectangle diagonal, ladder, east-then-north walk, √N between whole numbers · area of a triangle with two equal sides, rhombus perimeter from diagonals, perimeter from area, tilted square · box diagonal, trapezoid area, shortcut across a park |
| `amc-chance` · Probability by counting | Equally likely outcomes, 36 pairs for two dice, complements, without replacement, “or” | Bag, one dice, spinner · two-dice sums, coins (exactly, at most, more heads), “at least one” · two draws without replacement, multiple of a or b, products of two dice · larger of two dice, choosing a pair, difference of two dice |
| `amc-coords` · Coordinates and negative numbers | Number line, coordinates, areas on a grid | Temperature changes, distance on a number line, subtracting negatives · horizontal or vertical segment, rectangle area, reflect and move, midpoint (both ways) · triangle with a horizontal side, triangle inside a rectangle, tilted square · distance between points, four-sided shape inside a rectangle, two-leg walk |

Each unit has three lesson pages, a lesson check, one Quick check per form and figures for the coordinate and triangle questions. The lessons also cover American words: one dice is a “die”, a trapezium is a “trapezoid”.

They are extension units in the Maths pathway, so they appear under **Topics** and can be opened at any time. Before the contest, Mochi may suggest one of them as the day's new lesson (at most one new contest lesson a day) once its foundations are learnt: Area and Angles; Counting and Percentages; Relationships and Area. A repair, review or saved question is never replaced.

They are kept out of the entrance-style mocks and reserved papers, so every existing paper is unchanged.

## 2. Contest sprints (`contest-core.js`, `contest-ui.js`)

**Maths → Papers → Contest practice** (also suggested on Today and the Maths overview before the contest):

- **25 original questions, 40 minutes, no calculator.** Choices A to E, sorted like a contest paper. Questions rise in difficulty and follow the AMC 8 mix of topics, weighted towards the three new ones: 3 probability, 2 right-triangle and 2 coordinate questions in every sprint, plus arithmetic, data, geometry, number theory, counting, ratio and rate, algebra and logic from the existing bank and challenge units.
- **Answer choices** come from the question's own worked steps (the numbers a slip produces) and nearby values of the same kind and size. Exactly one is correct; probabilities stay between 0 and 1, and there are no negative lengths or areas.
- **Flag and return**, a question grid, and a clock that keeps running across reloads. Time-out submits automatically. No hints or Ask Mochi until the sprint is submitted.
- **Review:** score, time, questions 1–13 against 14–25, results by topic with links back to the lessons, and a worked solution for every question.
- **Suggestions only:** about weekly in December and every three days in January, never twice in one day, and none from the contest day on.

Sprint answers are **not** mastery evidence, because a correct choice may be a guess. They sync between tablets (merged by sprint), are included in backups, and are exported for the nightly review as `contest` (records and per-question detail) and `contestReview` (summary).

For reference, the review mentions that 15/25 earns the AMC 8 Achievement Roll for 6th grade and below. It also says plainly that a practice score is not a prediction.

## For the ChatGPT nightly review — text to paste into its instructions

Add this **after v7.12 is live on Euna's tablet**.

> **Mochi v7.12: AMC 8 on Tuesday 26 January 2027.**
>
> **New Maths units.** `amc-right` (right triangles and square roots), `amc-chance` (probability by counting) and `amc-coords` (coordinates and negative numbers) can be named in plan steps like any other unit, for example `{"kind":"lesson","unit":"amc-chance"}` or a practice step with `"form": 1` or `2`. Teach all three before mid-December, with at most one new lesson a day, then mix them into practice.
>
> **Contest sprints.** The export now has `contestReview`: each completed sprint's score out of 25, minutes, whether time ran out, questions 1–13 against 14–25, and results by topic. `contest.detail` lists every question with its choices, the correct letter and her letter. Plans cannot launch a sprint. Mochi suggests one about weekly in December and every three days in January. If none was done in the past week, say so in the note.
>
> **How to read sprints.** A sprint is multiple choice and may include guesses, so never count it as unaided mastery. Use it to find topics to plan practice for (for example, two probability misses → an `amc-chance` practice step), and to watch pacing: many unanswered questions late in the sprint or “time ran out” means she needs speed on questions 1–15, not harder content. Do not predict an AMC score.

---

## Checks

`tests/dsa-contest.test.cjs` recomputes every answer by a different route, across 260 seeds per form:

- right triangles from coordinates, Heron’s formula and direct search;
- probability by enumerating every equally likely outcome, and checking the fraction is in its simplest form;
- coordinates with the shoelace formula and the app’s safe arithmetic parser.

It also checks that each form has several variants and at least 40 different questions, and that every form has a Quick check and figure.

`tests/contest-sprint.test.cjs` checks:

- 25 slots, the topic mix and deterministic sprints;
- five ordered choices with exactly one correct, never also accepted by the marker, of a believable kind and size;
- the 40-minute clock and auto-submit;
- validation, merging and export;
- that sprints change no mastery evidence and no paper or mock;
- the suggestion schedule and the one-lesson-a-day rule;
- that the sprint screen offers no hints or tutor.

The question-history snapshot (`tests/paper-practice.test.cjs`) still pins every older unit, and the reserved papers and mocks are byte-identical. `tests/data-compat.test.cjs` pins `cloud-sync.js` and `learning-review.js` at their new hashes. The only change there is the optional `contest` key; older tablets copy it unchanged.

Checked in desktop Chromium at iPad size with a full sprint, time-out, review, Today card and lesson. It has not yet been watched on Euna's tablet.
