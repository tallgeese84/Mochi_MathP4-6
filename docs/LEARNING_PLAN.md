# Euna’s weekly learning plan — v5.1.0

The daily panel sits below the header in normal document flow. Two subject clocks
are visible; goals and recommendations open on demand. The full weekly editor
stays inside Euna’s avatar panel. The same files serve the website and installed
home-screen app, including narrow windows and portrait tablets.

## Starting routine

| Day | Maths | Science | Suggested emphasis |
| --- | ---: | ---: | --- |
| Monday | 25 min | 20 min | Learn an idea, explain an example, practise |
| Tuesday | 20 min | 25 min | Continue teaching and check the relationship |
| Wednesday | 25 min | 20 min | Repair one difficulty; fade the help |
| Thursday | 20 min | 25 min | Explain and apply in a different situation |
| Friday | 15 min | 15 min | Short retrieval and reflection |
| Saturday | 30 min | 30 min | Longer problem or investigation, with a break |
| Sunday | 10 min | 10 min | Light review and discuss the week |

These are editable starting goals around her existing schooling: 145 minutes per
subject, 4 hours 50 minutes total each week. They are not a research-prescribed
dose or a guarantee of admissions readiness. The emphasis column is a suggested
family routine; the actual next topic comes from her evidence. Set a subject to
0 minutes on any day for rest. No catch-up debt or penalty accrues. Adjust after
a week based on fatigue, attention and the quality of explanations. A five-minute
break between subjects is encouraged and is outside the study clocks.

1. Tap **Start** beside the subject. Starting the other subject pauses this one.
2. Open **Today’s goals & next steps**. **Next study focus** opens the recommended
   textbook topic; **Practice** connects to its existing question bank once the
   teaching is explored. Units without an original Science bank use their
   authored course checks. All earlier questions remain available from the
   textbook’s **All Maths practice / All Science practice** control.
3. Study or revisit one idea, using the worked explanation, models and notebook.
   Tick **I studied or reviewed one idea** yourself. This records activity, not
   demonstrated understanding. Teaching can span several days.
4. Aim for three practice answers per weekday, five on Saturday, one on Sunday.
   A multi-part problem is one recorded attempt. Prioritise thoughtful working;
   stop at the time goal even if the question count is unfinished.
5. Tap **Exit check** for one short authored course question. Finish that unit’s
   teaching first. Explain in the notebook and try without reopening help. A
   wrong answer still records the check and informs repair; it is not a pass/fail
   gate. Retries never become first independent answers. The authored bank is
   finite: when fresh checks at the current level are exhausted, the app asks for
   review and a later return, rather than calling the same answer new evidence.
6. Save a reflection: what changed in the reasoning, and how was it checked?
   The separate notebook retains stylus drawings and longer working. Text length
   and ticking a box do not prove a sound explanation.

## Clocks and devices

Clocks start explicitly and reload paused. Hidden tabs, inactive windows, another
subject/activity, three minutes without interaction, and a suspended timer pause
counting. Long quiet reading can trigger the idle pause: tap Resume when needed.
Reaching the target stops the clock, without submitting or closing a question.
Minutes are estimates of foreground time, not a measure of thinking speed or
learning quality. Old question-level `seconds` fields still include idle time.

Days follow the device’s local calendar; no UTC-midnight rollover is used for the
weekly schedule. Daily answer counts use the first submission time for new Maths
and classroom attempts (or the first saved Science response); older records fall
back to their original timestamp. Revisions are not a second daily answer.
Midnight ends a running session and the next day starts fresh.
The weekly goal can change without deleting earlier recorded time. Time records
keep their original local date, so travel between time zones does not relabel
past sessions. There are no alarm notifications or external calendar reminders.

Sessions have stable IDs. Merging a copied session takes its furthest recorded
endpoint; overlapping intervals across devices and subjects are counted once,
assigned to the earlier session. Device clocks still need to be reasonably
accurate. The planner retains up to 3,000 timing sessions and 400 daily entries.

## Adaptation and review

The planner considers the classroom plus the Maths and Science studio records.
Two recent first-answer misses in a skill prioritise its explanation or an
unexplored prerequisite. Science reasoning-check misses can trigger this even
when the main choice was right. Delayed course review comes before new topics.
Two distinct, unassisted answers can prompt the next available course check;
the existing course engine controls the actual difficulty tier. The original
Maths repair/transfer engine and Science follow-up selection remain in place.
Recommendations are applied when choosing the next focus, not by replacing a
problem while Euna is writing an answer.

The parent panel’s **Thinking patterns & next learning steps** shows a window of
up to 12 recorded answers per subject, counts and example IDs. Repeated signals
can suggest checking confidence, making verification visible, fading support,
or investigating an explicitly reported obstacle. One mistake never establishes
a pattern. Missing written checking does not prove an absence of mental checking.
This is transparent rule-based adaptation, not an inferred personality, diagnosis
or fixed learning style. The AI tutor receives these observations with the actual
question and working, and is asked to discuss the reasoning rather than diagnose.
Live AI still needs the existing provider configuration; offline lessons,
questions, timers, recommendations and pet growth do not.

## Growing with Mochi

The original cat illustration and customised room are retained. Mochi visibly
grows through five named stages in the room; accessories scale with the cat.
There is no loss of size or progress for resting or missing a day, and no reward
for speed, clock minutes, repeated guesses or a long typed reflection.

Each skill can earn a celebration for an independent correct answer, for two
different question forms, and for successful independent retrieval at least
three days after earlier evidence. Same-form immediate repeats do not count as
new evidence. A correct Science main choice with an incorrect structured concept
check is insufficient. Both subjects are required for growth stages:

- Little companion: initial stage.
- Curious companion: at least one idea and two forms in each subject.
- Explorer: independent evidence in at least three skills per subject.
- Thoughtful explorer: at least five skills per subject and four retained ideas.
- Learning companion: at least eight skills per subject and ten retained ideas.

Earned milestone records are retained even when old detailed history ages out.
They are celebrations of recorded practice, not proof of mastery, an exam grade,
a percentile or an admission prediction. Existing coins, treats and accessories
work separately. Explicitly resetting all learning clears the plan, both subject
histories, course records and growth; make a backup first if retaining them.

## Learning mirror and backups

The existing backup, Firebase backup and Google Drive mirror use one builder.
They now include `planner` and `learningPlanReview`: schedule, timed sessions,
daily reflections, exit-attempt IDs, earned milestones, next recommendations and
thinking observations. API keys and relay secrets stay excluded. Existing relay
configuration continues to work; no new Google Apps Script deployment is needed.
The mirror remains a one-way review copy, not a remote teaching controller.

Here is a useful request after a week:

> Review Euna’s latest learning mirror. Compare planned time with foreground
> estimates, independent work with supported work, and new checks with familiar
> retrieval. Read her explanations and reflections. Give three evidence-backed
> priorities for next week and identify what still needs a human assessment.

A review here happens when requested with access to a fresh mirror file; the app
cannot automatically run a ChatGPT conversation in the background. Check the
mirror file date: a browser’s “request sent” message still does not confirm relay
delivery. Restoring a new backup restores the planner too. Legacy backups without
planner data keep this device’s plan. Merge preserves records without summing
copied timing sessions twice.

## Instructional rationale and limits

Spacing, retrieval, worked examples and explicit planning/monitoring/reflection
inform this routine. These sources do not validate these exact durations:

- [IES practice guide: Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/practiceguide/1)
- [EEF: Metacognition and Self-Regulated Learning](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition)

The existing curriculum scope and admissions limitations remain documented in
[CLASSROOM_CURRICULUM_AUDIT.md](CLASSROOM_CURRICULUM_AUDIT.md). Daily checks are
small, authored, uncalibrated samples. Free explanations, practical science,
transfer to unfamiliar assessments and the broader NUS High selection process
still need human review and independent evidence. This release adds scheduling
and evidence connections; it does not add an official admissions question bank.
