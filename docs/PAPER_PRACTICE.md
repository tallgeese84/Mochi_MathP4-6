# v7.5.0 — Paper-style reasoning within the existing maths path

## Benchmark and scope

This update was made against two supplied files, not a guessed post-admission syllabus:

* **PD STEM Education, NUS High DSA Selection Test Preparation: Mathematics (2024)**, 28 pages. This is a commercial preparation booklet, not an authenticated released entrance test. Its three lessons organise work around Algebra, Rates & Proportions; Geometry (with miscellaneous puzzles); and Counting and Arithmetic Techniques / Number Theory. Its geometry advice emphasises symmetry, cutting and rearranging, preserving pi, and choosing a useful method.
* **National Mathematical Olympiad of Singapore 2024**, supplied 12-page scan, 35 questions. This is a separate competition benchmark. We inspected all 12 pages. Its questions range from short numerical reasoning to difficult combined constraints, geometric constructions, hidden surfaces and optimisation. Its demand is not treated as proven equivalent to DSA.

The common topics substantially overlap the existing bank; the larger gap is often the representation, combination of constraints, hidden intermediate quantities and need to choose a method. Not every new question is equally difficult, and this release is not a claim of complete coverage of either paper. It does not relabel the post-entry Programme of Studies as entrance requirements.

## What was changed, rather than just added to another menu

The existing mathematics bank advances from revision 2 to revision 3. For 12 existing topic IDs, **transfer form 2 now draws from two new original structures**. That is 24 question types, not 24 fixed questions. A deterministic seed varies values and structure. The guided and basic application forms remain available; the other topics and geometry bridge content are unchanged.

| Existing topic | New original structures | Related source demand (not copied questions) |
|---|---|---|
| Relationships | Swap-height arrangements; equal stacks with cancellation | Booklet Lesson 1: translating multiple arrangements into equations |
| Percentages | Two different group changes and earlier revenue; reverse the order of a discount and voucher | Booklet Lesson 1 monetary constraints; NMOS Q11: different reference groups |
| Remainders | Reverse two successive transfers; recover initial stock across delivery and fractional sales | Booklet Lesson 1 Q13; NMOS Q26: changing totals |
| Simultaneous relationships | Coin replacement before a total-value baseline; combine pairwise measurements | Booklet Lesson 1 equations; NMOS Q3 extended beyond its direct baseline |
| Ratios | Recover an unknown group from within-group and combined proportions; equal additions with unchanged difference | NMOS Q25; booklet proportion techniques |
| Rates | Infer pump rate and unknown continuing inflow from two trials; infer three worker rates and a mid-job departure | Booklet Lesson 1 Q14, NMOS Q9: net and combined rates |
| Motion | Three runners with two relative gains; invert average speed with a rest included | NMOS Q14; booklet Lesson 1 Q2 average-speed reasoning |
| Area | Intersecting lines in a rectangle; reconstruct a missing triangle from opposite area pairs | NMOS Q13; booklet Geometry: height relationships and decomposition |
| Circles | Infer annular area from a circumference difference; large semicircle minus two inner semicircles | Booklet Geometry Q4–5 and Q10: length versus area, composite curves |
| Volume / surface | Three perpendicular square tunnels with variable sizes; compare exposed surfaces after rearrangement | NMOS Q23: new inner surfaces; bridge from joined cubes |
| Counting | Grid rectangles required to contain a cell; unordered teams excluding one forbidden pairing | NMOS Q2 and booklet counting principles, extended with constraints |
| Factors | Least multiplier to make a square; restricted integer rectangle factor pairs | Booklet Number Theory Q12, Q14–15: prime factors, squares, exhaustive cases |

These are new wording, data and SVG constructions. There are no copied paper pages, images, learner records or credentials in the repository. Straightforward cases remain within the set; numerical size alone is not used as the definition of difficulty.

## Teaching and daily selection

Each affected lesson has an additional explanation about connecting ideas in paper-style problems. Its third worked-example option uses the new form. Each question has a full checked solution, two specific hints and a conceptual diagnostic tied to that structure, rather than an old form's unrelated rule. The existing TA receives the active question and working. In-app hints, solutions and models retain support tracking.

After the existing application stage, a fresh transfer uses revision 3. New mixed practice can revisit these upgraded forms without a topic title. An unfinished mixed set created before this update stays on revision 2; its questions cannot change under an already-entered answer.

Previously the 12 extension units were late in the topic list. The recommender can now introduce one unstarted extension lesson when **all its prerequisites are taught and each has two independent applications and a transfer**, with no current teaching/parking flag. It never replaces a saved question, an active paper, a due review, an unfinished mixed set, an error redo, or a geometry bridge recommendation. At most one extension lesson is introduced per local day. No extra mandatory minutes or new homepage menu is added.

This raises the destination of the daily path without requiring a learner with an insecure area/volume concept to begin with a drilled-cube problem. The 2D/3D teaching models remain optional support; independent questions use ordinary static diagrams. Harder original questions are a teaching design, not a calibrated NUS High test level or an admission forecast.

## Protect existing records and assessment meaning

Revision 1 and revision 2 question objects are frozen, including diagrams and explanations. Existing 11 maths papers/checks/mocks and 9 science papers/checks/mocks keep their old definitions, questions and deadlines. Old full-paper scores remain comparable. New practice strength must not be inferred from an old score: the assessment bank has not been silently upgraded underneath past results.

Saved practice and error-redo records regenerate their own revision. Mixed queue items now carry a revision which is preserved through validation and merge; older unversioned maths queues resolve to revision 2. The legacy 5:3 ratio bar illustration is not attached to unrelated revision-3 ratio problems.

Grown-up evidence has a collapsed **New paper-style transfer evidence** table showing attempts, first-correct, fresh independent answers, and the number of the two new structures independently solved for each affected topic. Old evidence is not relabelled as new. Helped, copied corrections and previously seen successes cannot increase that fresh-independent count. Written reasoning still requires adult review; these counts do not establish mastery or entrance readiness.

## Validation

`tests/paper-practice.test.cjs` independently recomputes 6,000 generated new questions (500 seeds in each affected topic), using enumeration for inverse problems, integer inventories and factor pairs, positions/rates for motion, intersecting lines and polygon areas for geometry, and explicit unit-cube exposed-face counting for both tunnel and rearrangement problems. It also verifies all earlier revision-1/2 question objects across 12,800 cases and all 20 existing subject paper objects against hashes from main commit `6988e5e04febb0b7979a26d7733477fb3ef93f74`.

The focused browser fixture checks both new structures in all 12 topics, correct answers, support flags, diagnostics, specific hints, old saved questions, backup, the old ratio-model guard, reserved-paper restrictions/deadline, science navigation and 375px layout. Existing release, course and regression checks remain in place. Software checks do not psychometrically equate questions with an entrance exam.
