# v6.8.0 UX and quality pass

## What changed and why

**Quick checks match the question.** Before v6.8.0, each unit had one Quick check, and 18 of 24 Maths units fell back to the lesson's concept check. Each unit has four question types, so a miss on, say, "multiply by 5, then add 9" opened a check about sums and differences. `quick-checks.js` now holds one check per unit and question type (28 Maths units and 24 Science units, four types each). `path-coach.js` looks up the type on screen first and falls back to the old behaviour only if a type has no entry. Using a Quick check is still recorded as help.

**Lessons explain themselves.** A greyed-out **Finish lesson** or **Continue discovery** button now says what is missing ("Open section 2 first", "Make your prediction to continue"). Concept checks include a "Why? Explain in your own words" box. It is the same field as **My lesson notes**, so nothing new is stored or synced.

**Bar models.** `bar-models.js` draws Singapore-style bar models in the relationships lesson, in sum-and-difference and ratio worked examples, and in revealed solutions. They are scaffolds, so they never appear on independent questions or papers. They are not stored in question data, so question fingerprints, "seen before" detection and reserved papers are unaffected.

**Home and Mochi.** The home screen keeps one main action but is sized for a tablet: larger type, Mochi with a speech bubble, coins, Cat Points and the next cat friend with a progress bar. On landscape tablets the companion sits in a second column. During practice, Mochi sits beside the feedback line and reacts to the result: on her own, with help, try again, or look back at the lesson. None of the lines use guilt, hunger, loss or streaks, and a test checks this.

**Plainer wording for Euna.** Phrases such as "not independent evidence", "benchmark mapping" and "Delayed retrieval" are replaced on her screens. The grown-up panels keep the precise evidence language.

**Touch fix.** On tablets, the hover style stayed active after a tap and turned the next purple button pale with white text. Primary buttons now stay dark, and disabled ones are legible.

## What did not change

- Cloud sync (`cloud-sync.js`), cloud backup, the Drive mirror, the review export and network code are byte-for-byte identical to v6.7.1. `tests/data-compat.test.cjs` fails if any of them change.
- The saved-state key (`mochi-tutor-v1`), sync identifiers and export schema are unchanged.
- Marking, mastery rules, help recording, coins, Cat Points, timers and papers are unchanged.

## Considered and not done

Loading Science, Geometry and the classroom only when opened was investigated. At four-times CPU slowdown the home screen is ready in about one second, and almost all of that is the browser parsing and laying out the page rather than running the scripts. Splitting script loading would save little and would put offline mode and saved-state loading at risk, so it was left as is. The 3D room scene was already loaded only when the room opens.

The lesson teaching text itself (for example "preserves equality") was not rewritten in this release.
