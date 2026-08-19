# Changelog

## v1.3.0 - 2026-08-19

The tutor no longer works towards giving the answer. It works towards her finding it.

- **Six-level hint ladder.** One level per time she asks: orient, then the first
  step as a question, then name the tool, then the exact stuck step, then try it
  with easy numbers. The answer to her own question is never given while she is
  still working on it, however many times she asks.
- **A worked example on the sixth ask** - of a SIMILAR question, not hers. The
  example is minted by the same generator that produced her question, so it is the
  same shape and correct by construction rather than invented by a model. It is
  rejected if it shares her answer or reuses her own numbers; structural constants
  like pi as 22/7 do not count as reuse. Roughly 96% of questions can mint one; the
  rest fall back to the model composing its own.
- **Attempts are counted** and reported to the tutor, so it answers what she
  actually did before moving further down the ladder.
- **The offline ladder follows the same policy** and shows the same minted example
  at level 5, with no connection at all.
- Once she submits an answer, the withholding lifts and the tutor explains fully.
- Fixed: "the ratio of his cards to his cards" when both names in a question were male.

## v1.2.0 - 2026-08-19

Calibrated against two 2025 P6 prelim papers. No question is copied from either;
the papers were read for topic spread, difficulty and mark weighting only.

- **Data handling added** - the biggest gap. Pie charts, bar graphs and line
  graphs, all drawn from parameters, with questions read off the chart.
- **20 new generators**, taking the bank from 22 to 42 across 16 topics:
  place value, rounding, factors and multiples, measurement conversion, time
  duration, fraction to decimal, fraction divided by a whole number, GST,
  algebra with a fraction term, isosceles triangle angles, parallel lines and a
  transversal, pie / bar / line graph reading, missing value from an average,
  banded pay rates, commission bands, two coin denominations, two vehicles
  meeting, and pouring water between tanks.
- **Two new figures**: an isosceles triangle with tick marks, and two parallel
  lines cut by a transversal.
- **Fraction answers** now reach the tutor as `4/27` rather than `0.148148`.
- Four new topics: Measurement, Time, Data and Money, each with its own offline
  hint ladder entry.

## v1.1.0 — 2026-08-19

- **Coins and Mochi's room.** Correct answers earn 2 coins, with a +5 bonus every fifth
  in a row. No coins if the worked solution was revealed first. A second tab holds the
  room: stroke him, buy cat munch, and buy accessories that he actually wears.
- **Six accessories** across three slots (head, eyes, neck), drawn as SVG over his photo.
- **Purr is a moment, not a chore.** It rises when she plays and drifts back to calm on
  its own. Mochi is never hungry, never sad, and never asks for anything.
- **Question bank widened** from 14 to 22 generators across 12 topics: change in ratio,
  percentage increase and decrease, two-leg average speed, rate, depth from volume,
  angles in a parallelogram, dividing by a fraction, and working backwards.
- **New parallelogram figure**, checked for label collisions across every angle.
- **Answer marking generalised** — any unit she writes after a number is now accepted,
  instead of a fixed list. Found by mutation testing: "15 cards" was being marked wrong.
- **App icon is now a cat paw.**
- **Version numbering starts here.** The build is shown under the cog.

## v1.0.0 — 2026-08-19

First complete build. 14 question generators, handwriting recognition with
deterministic line-by-line marking, tutor over Claude or ChatGPT with an offline
hint ladder, working page, PWA install, and the grown-ups panel.
