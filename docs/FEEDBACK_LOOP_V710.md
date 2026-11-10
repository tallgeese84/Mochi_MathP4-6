# v7.10 — making the feedback loop teach (9 November 2026)

The 2–8 November reviews showed the nightly plan reaching Euna's tablet but rarely changing what she did in Maths. On four days, a question saved from an earlier day blocked the plan. The plan could only name a topic and a stage, and each stage served a different problem type, so the worked model never showed the method she was then tested on. Maths practice ran at about 20% unaided success while Science ran at about 86% on familiar templates. This release changes six things.

## 1. Saved questions no longer block the plan

At the next visit to Today's plan, a Maths or Science question is set aside if it:

- was last touched on an earlier day; or
- had its worked solution opened.

Nothing is deleted.

- **A recorded wrong answer** comes back through the normal three-day second try.
- **Unsent working** is offered again after three days.
- **Questions Euna sets aside herself** are offered after today's focus, as in v7.9.

Up to 20 set-aside questions are kept. When the list is full, the oldest question whose answers are already in her history makes room first; unsent working is never dropped.

A lesson she half-read on an earlier day stays in the library. It no longer takes priority over the plan; only a lesson opened today does.

Mixed sets and papers keep their own flows.

## 2. Same-type Maths microcycles

A nightly Maths priority of three questions in one unit becomes three steps on **one problem type**, with help fading:

1. **Study the example.** A worked example of the same type with different numbers, shown above a guided question.
2. **Finish the steps.** The opening steps of a new question are shown, and she completes it.
3. **On your own.** A new question of the same type, with one line of working required before the first check.

The problem type is chosen in this order:

- the plan's optional `form` and `structure` (see below);
- otherwise, the type of her most recent first-answer miss in that unit;
- otherwise, the next form her evidence needs.

The type is fixed when the first step starts, so all three steps match.

Steps 1 and 2 count as supported practice. Step 3 counts as **application**, not transfer, because a model of the same type has just been shown. Transfer credit still needs an unmodelled success on a later question. Science microcycles are unchanged.

## 3. Maths difficulty and review

**Completion problems.** A unit drops into support when, over its last 4–6 unaided questions (21 days):

- fewer than half were solved unaided; and
- the last two were not both unaided successes.

In support, the next question shows its opening steps for her to finish. After a supported success, the following question has no steps shown, so support fades as soon as she can work alone.

Small question banks are protected. Support is only offered when at least 8 unseen questions of that type remain, so the bank's unseen items stay available for independent evidence.

**Review.** Delayed recall and mixed review now draw a harder form-2 question only from a type she has already solved unaided. Otherwise they use the standard form-1 method.

**Used-up units.** Recommendations pass over a unit whose unseen questions are used up, so new learning keeps moving. In a 220-day simulation at 30% misses, every unit is reached.

**Ratios.** Equal-additions problems are now solved by the units method:

1. The difference between the colours stays the same.
2. Make the difference the same number of parts in both ratios.
3. Read the red increase as the added counters, which gives the value of one part.

A before-and-after bar model shows this in worked examples and revealed solutions. Both Ratio lessons now include a worked example.

## 4. Study time and Science repeats

**Time.** The weekly plan has a new switch, **Balance study time** (on by default). At the first visit to Today, the day's balance is decided once. Five minutes move from Science to Maths when, over the previous seven days:

- Science unaided success is at least 85% (at least 20 questions); and
- Maths unaided success is below 50% (at least 10 questions).

The day's total never changes, and Science keeps at least 10 minutes. The weekly plan panel shows today's decision and the figures behind it.

**Science repeats.** Ordinary Science practice serves at most two questions of the same unit and question type a day, then moves to another unit. Daily-plan steps, recall and mixed review are unaffected.

## 5. Automatic AI help for the weak Maths units

The one automatic AI coaching turn after a first wrong answer now covers **Ratios, Two conditions and Percentages**, as well as Motion. Each problem type has its own skill name and a checked built-in aid, so help still works offline or without a key.

The Maths and Science grown-up panels now say whether an AI provider is connected on the tablet. **If it says "not connected", add a key under Grown-ups → Tutor on Euna's tablet.**

## 6. Written-answer review queue

Grown-ups → **Science pathway · evidence** now opens with **Written answers waiting for review (N)**. The panel's summary line shows the count while it is closed.

Each card shows:

- the question;
- Euna's answer, working and handwriting;
- the key-idea check;
- the model answer.

One tap records **Reasoning is valid** or **Needs discussion**.

With a provider connected, **Ask AI for a suggestion** (or a batch of 10) shows a verdict and a reason beside the answer. The suggestion is only saved if a grown-up taps **Use this suggestion**; the AI never records a review itself.

---

## For the ChatGPT nightly review — text to paste into its instructions

Add this to the scheduled task's instructions **after v7.10 is live on Euna's tablet**. Older app versions reject plans that contain the new optional fields.

> **Mochi v7.10 plan options (Maths).**
>
> **Problem type.** A Maths practice step may add `"form"`: 1 for the standard method or 2 for the harder paper-style type. With form 2 it may also add one `"structure"` from `tools/euna-problem-types.json`, for example `"pb3:ratios:equal-additions"`. Use these when the review identifies a specific problem type she missed. Example: `{"kind":"practice","unit":"ratios","phase":"guided","count":1,"form":2,"structure":"pb3:ratios:equal-additions"},{"kind":"practice","unit":"ratios","phase":"apply","count":2,"form":2,"structure":"pb3:ratios:equal-additions"}`. Omit both fields to let the app pick the type of her latest miss.
>
> **What a three-question priority does.** It now teaches one type in three steps: a worked example, then the opening steps shown, then the same type unaided. Do not repeat an unchanged priority for more than two days if step 3 keeps failing. Instead, name a prerequisite unit or the standard form 1.
>
> **Saved questions.** A question left from an earlier day, or whose solution she opened, is now set aside automatically and returns as a three-day second try. Do not plan around a saved draft.
>
> **What not to count.** Questions with `scaffold` (`example` or `steps`) are supported practice. Questions with `modelled: true` are application straight after a model, not transfer. Exclude both from unaided success rates, and do not count `modelled` successes as transfer.
>
> **Writing reviews.** Written Science answers are reviewed by a grown-up in the app. If more than 10 are pending, say so once at the top of the review.
>
> **Pacing.** The planner may move 5 minutes from Science to Maths on some days (see `planner.shifts` in the export); the total is unchanged. Report it, but do not add catch-up time.

---

## Checks

`npm test` covers:

- parking stale and solution-opened questions, and returning them after three days;
- the session-day lesson rule;
- same-type microcycles: type selection and freezing, scaffolds, and modelled evidence;
- plan validation of `form` and `structure`;
- completion support and fading, and the small-bank guard;
- safe review forms;
- the equal-additions steps and bar model, verified for every generated question;
- the balance decision and planner merge;
- the Science type cap;
- the tutor keys;
- the review queue's parsing and grown-up-only saving;
- a 60%-miss pacing simulation alongside the existing 30% one.

Real-tablet checks remain:

- that the worked example and first steps read well at tablet size;
- that the AI provider is connected on Euna's tablet;
- that the ChatGPT task is updated after deployment.
