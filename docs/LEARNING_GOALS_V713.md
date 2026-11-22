# Learning goals and family reward points — v7.13

The daily clock paces a study block. A learning goal records what the learner
finished, explained and checked. These are separate from mastery and from the
existing coins, Cat Points and cat collection.

## Daily agreement

Agree the next task before starting it. The daily route supplies the task; a
lesson can lead into its practice question. A goal keeps the actual question
identity so a different easy question cannot silently replace it.

Before leaving a goal, record the method or evidence and how it was checked.
Help is allowed and remains visible in the learning records. A supported finish
can qualify when the learner explains or reproduces the important step. When a
problem is too difficult, a suitable prerequisite can be completed while the
original question is saved with a specific next step. Saving unfinished work
alone does not earn reward points.

The final two minutes prompt checking, explaining and saving. Reaching the time
boundary keeps the active question available and offers a finish or save step;
it does not declare the learning goal complete. The existing optional five
minutes of Maths remains a choice. There is no obligation to keep working until
an answer is correct, and no extra compulsory block to collect reward points.

## Four-week trial

The first agreed goal starts a 28-calendar-day trial in America/Chicago. It does
not award points for past work. After the trial, previously earned points and
payment records remain available; the trial does not renew automatically.

| Daily category | Points | What a grown-up reviews |
| --- | ---: | --- |
| Maths | 2 | Agreed task or prerequisite, a meaningful method, and a check/correction |
| Science | 2 | Agreed task, evidence supporting the answer, and a check/correction |
| Return-and-remember | 1 | An initial retrieval attempt with help closed, followed by checking/correction |

Each category can earn points once per Chicago date. The daily maximum is five.
The agreed conversion is **20 US cents per point**, up to **US$1 per day** or
**US$7 for seven full-point days**. Recall uses existing review work; it does not
create an extra required assignment. A wrong first recall answer can qualify
after checking and correction; first-answer correctness is not the cash rule.

The learner records a finish. A grown-up uses the existing PIN gate to review
the recorded answer, explanation and check before approving points. Text length
or a ticked box cannot verify the quality of an explanation automatically.
Approval does not change a response, help flag, written-answer grade or mastery.
There are no deductions, missed-day debt or streak conditions.

## Weekly cash record

The grown-up view groups approved points into weeks and shows the amount still
unpaid. After paying outside the app, the grown-up can record that payment.
The app **does not transfer money**. A payment entry says what the parent
recorded; it is not independent proof that a transfer occurred. Later approval
of an earlier goal appears as an additional unpaid balance.

## Data and nightly review

`learningGoals` is an optional state/backup field. The review export also carries
`learningGoalsReview`. Current clients merge goals, approvals and payment records
without duplicating daily awards. Restoring an older backup combines its ledger
with the current ledger; a general learning reset keeps earned points and cash
payment records. Unsupported ledger versions are rejected instead of silently
rewritten. Use the current app version on devices that manage reward points;
older clients do not understand concurrent ledger changes.

The existing Drive mirror and Firebase backup serialize the shared export; no
relay deployment or public copy of private learner data is needed. The nightly
review reads goal progress and reward evidence alongside learning records, but
does not approve points, record payments, alter grades or extend the trial.
Missing reward fields in an older export mean reward status is unavailable.

Nightly machine plans keep the existing schema and supported lesson/practice
steps. Goal finishes, parent approval, independent mastery, plan-linked answers
and recorded cash payments are distinct facts.
