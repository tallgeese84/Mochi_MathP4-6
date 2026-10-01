# v6.9.0 DSA challenge units

## Why

The supplied PD STEM booklet (Lesson 1: algebra and rates, geometry, counting and number theory) was compared problem by problem with the pathway. Of its 44 problems, 26 already had a matching question type, 9 were practised only at an easier level, and 9 had no matching type. Four of the five starred (hardest) problems fell in the last two groups.

This release adds original question types for those 18 gaps. No booklet problem, wording or diagram is reproduced: the booklet is used only to judge difficulty and topic coverage.

## The six units

| Unit | Question types |
|---|---|
| Challenge · Keep track of every total | Ticket takings with percentage changes; “leftovers make k times the others”; multi-stage transfers between games; grass that keeps growing |
| Challenge · Same time, different distances | Symmetric meeting point (two variants); escalator step counting (two variants) |
| Challenge · Hidden radii and circle patterns | Rectangle in a quadrant; hexagon with unequal sides in a circle; nested circle ratios; quarter circle minus two semicircles on a grid |
| Challenge · Angles on grids and overlapping shapes | Sums of grid angles (two variants); three overlapping squares, area and outline |
| Challenge · Factors, squares and letter sums | Factor counts with three primes; conditional factor counts; difference of two squares; letter-sum puzzles |
| Challenge · Find the rule behind a sequence | Constant second differences; Fibonacci-type forwards; Fibonacci-type backwards; doubling or tripling differences |

The units come after the 28 core and bridge lessons in the recommended order. They can also be opened at any time from **Maths lessons**. They are not part of the reserved mixed papers or starting checks, so existing paper results remain comparable.

## How answers are checked

`tests/dsa-extension.test.cjs` recomputes every answer by a different route from the generator, across 250 seeds per type. It uses brute-force search for the ticket, leftover, transfer, difference-of-squares and letter-sum types; a minute-by-minute or continuous model for motion; coordinates for the quadrant and hexagon; repeated construction for nested circles; grid sampling for the curved shaded region; unit-cell counting for overlapping squares; divisor enumeration for factors; and recomputation from the printed terms for sequences. Each letter-sum puzzle is confirmed to have exactly one solution.

## Limits

These are practice types, not predictions of the real selection test, which NUS High does not publish. The booklet is one provider’s preparation material. The best measure of readiness remains Euna working unseen problems without help, and the evidence the grown-up view already records.
