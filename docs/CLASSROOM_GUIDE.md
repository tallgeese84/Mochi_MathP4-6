# Euna’s classroom — v5.0.0

This release adds a substantial written teaching course: **23 Maths units and 19 Science units**, each with seven teaching sections, worked reasoning, notebook activities and six initial checks. It contains about **25,800 words of original teaching**, six original raster illustrations and labelled teaching models. The existing generated Maths questions, Science experiments, tutor, progress history and family backup remain available.

The admissions route is **NUS High DSA-Sec**, not “DTA”. The course uses the published Singapore primary syllabuses as its foundation and provides separately identified reasoning enrichment. NUS High’s admissions guidance describes the abilities assessed; it does not provide the detailed public entrance-test blueprint that would be needed to certify exhaustive exam coverage. This release is a structured home-learning course, not an MOE-approved textbook or a validated replacement for all formal instruction.

## Start a class

1. Open Maths or Science in the header. Choose a unit in **Your classroom**. Start with the stated prerequisites if they are unfamiliar.
2. Read one or two sections, explain the idea aloud, and work through the examples in the notebook. Use **Explore a model** to predict, manipulate and explain. Take as many sittings as needed; the course does not infer understanding from time spent reading.
3. Use Keyboard or Stylus in **My notebook**. “Pen only” ignores finger input on the drawing pad; scroll beside the pad. Typed notes and normalised ink coordinates are saved with the unit. Turning a page or changing subjects preserves them.
4. After exploring all seven sections, select **Finish teaching sections**, then **Check my understanding**. The check starts with a fresh notebook, so the lesson notes do not reveal answers during an independent attempt.
5. If an answer is wrong, explain the feedback and revise. **Revisit the teaching** records support for an unfinished check. A revision cannot overwrite the first answer.
6. Use **Next recommendation** for an unfinished unit, the next unit, or a delayed review. Use the avatar for parent settings and the classroom evidence table. The old question studio is available through **Sources and additional practice** after the unit’s teaching has been explored.

Lesson completion records **exposure**, not mastery. A child can click through pages; the app cannot establish that she understood or performed the practical activity. A parent or teacher should listen to explanations and inspect working before treating a topic as secure.

## How difficulty changes

Each unit’s checks cover three teaching levels:

| Level | Purpose | Evidence needed for the next level |
|---|---|---|
| Understand | Recognise meanings, representations and relationships | Two different first-answer successes without recorded help or guessing |
| Apply | Use the idea in a specified situation | Two different first-answer successes at this level without help or guessing |
| Connect | Evaluate a claim, combine ideas or reason in a less familiar situation | Recorded as evidence; there is no claimed exam percentile |

Two misses at the reached level lower the next target by one level and prompt revisiting the explanation. A wrong answer stays open for revision. Reading the teaching or asking the AI during an unfinished check records support. Explanations and handwriting are retained but **not automatically graded**. A correct multiple-choice answer can be lucky, so selecting “guessing or used help outside the app” prevents it from counting as independent.

The authored checks are finite: two per level. The app does not relabel their immediate repetitions as fresh questions. When those examples are used, it recommends teaching review and additional unfamiliar work. Familiar retrieval becomes available after a full day. Successful delayed retrieval of two different forms can support recovery and advancement, but remains separate from new independent and transfer evidence. Reviews use intervals of roughly 1, 3, 7 and 14 days depending on the recorded evidence; these are transparent heuristics, not a validated learner model.

In the existing generated Maths studio, actual question difficulty is now stored with answers. Difficulty advances gradually using independent successes across different generator forms. Two misses lower the target, and the selector picks the nearest available difficulty within the selected skill. Historical records without difficulty do not justify an invented starting tier. Supported answers and response speed do not cause promotion. Existing targeted repair sequences still operate, while an explicitly focused session stays on its chosen skill.

## A workable home-teaching rhythm

A suggested class lasts 35–60 minutes, adjusted to attention and prior knowledge:

- Retrieve a previous idea in words or a sketch for 5 minutes.
- Read and discuss a small part of the new teaching for 10–15 minutes.
- Work through an example or safe practical investigation for 10–20 minutes.
- Complete one or two independent checks, then explain the reasoning for 5–10 minutes.
- Record one uncertainty and the next step. Stop before fatigue turns practice into guessing.

A unit can span several classes. Alternate Maths and Science; include longer investigation and discussion time each week. Topic order follows prerequisites, not a promise of a particular admission date. An experienced teacher should periodically check the level against unfamiliar external work and adjust the teaching pace. The six checks per unit are an initial sample, not enough to establish comprehensive retention or admission readiness.

## Feedback beyond right and wrong

Ask Euna to show what she noticed, what relationship she used, why each step follows, and how she checked it. Treat a suspected misconception as a question to investigate. Distinguish a vocabulary gap, a representation problem, a calculation slip and an unsupported inference before choosing more practice.

For Science, assess whether she identifies the observation, applies the appropriate scientific idea, connects cause and effect, and limits the conclusion to the evidence. For Maths, assess whether the method fits all conditions, quantities and units are clear, and the result survives an estimate or alternative check. Accurate alternative wording and methods should be accepted; this is not a keyword marking scheme.

The reading-and-investigation routine is: identify what needs explaining, consult a reliable source, explain the idea in her own words, apply it, then check what remains uncertain. NUS High’s published FAQ also discusses wider reading, independence, creativity and communication. The course’s discussion activities support these habits without pretending to reproduce official selection-camp tasks.

## Review Euna’s learning here

The existing **learning mirror needs no new setup**. Its shared export builder now includes:

- `course.lessons`: sections visited, completion timestamps, teaching notes, drawings and unfinished check drafts;
- `course.attempts`: every submitted choice and revision, actual level, help/guess/familiarity flags, explanations and drawings;
- `courseQuestions`: the recorded questions and answer explanations, so a reviewer can inspect what was asked;
- `courseReview`: per-unit exposure, new independent successes, familiar retrieval, supported attempts and review dates.

A downloadable learning backup contains the same classroom data. API keys and mirror secrets are excluded. Existing family cloud sync merges course attempts and section visits across devices; for conflicting notebook edits it retains the more recently updated unit notebook rather than pretending to merge handwriting semantically. Export an important notebook before making simultaneous edits on multiple devices.

A reviewer still needs a recent mirror file or uploaded backup. Setting up the mirror does not give ChatGPT access to a device’s local storage, and a “request sent” message is not confirmation that Drive received it. Use file timestamps and latest attempt dates to establish freshness before assessing a day’s work.

## Scope that still needs human input

The lessons are original and checked against the published topic framework. They have not been approved by MOE, SEAB or NUS High, and have not undergone independent teacher validation. This is written instruction with interactive models, not recorded video lectures, a live class or automatic assessment of free responses. Practical science, scientific discussion, extended written explanations and unfamiliar externally marked work still need adult feedback. English and any other admission eligibility requirements are separate.

No live AI provider session or physical Samsung tablet pen trial was performed for this release. The app’s full startup, teaching/check flow, evidence accounting, backups and offline asset coverage are checked automatically. Test a short unit on Euna’s tablet before making this her primary daily learning tool.
