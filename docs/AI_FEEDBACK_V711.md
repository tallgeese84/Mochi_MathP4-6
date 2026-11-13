# AI feedback in v7.11

Written 12 November 2026, after a photo of an Ask Mochi reply in Maths practice showed two faults:
the reply was printed as typesetting code (`\[ 284937 \times 273833 \]`, `\boxed{…}`), and Mochi had
worked a twelve-digit multiplication out for her.

## What a child sees now

| Before | Now |
| --- | --- |
| `\[ 284937 \times 273000 = 77,787,801,000 \]` | `284937 × 273000 = 77,787,801,000` |
| `\frac{3}{4}`, `5^2`, `90^\circ`, `**total**` | `3/4`, `5²`, `90°`, `total` |
| Types "284937 × 273833" and gets the product | A built-in reply: estimate first, split one number into easier parts, write each step |
| A reply could state the checked answer of an open question | The reply is rewritten once; if it still states it, the built-in hint is shown |
| Automatic help after a wrong answer in six topics only | One next-step nudge in every Maths and Science topic |

## How it works

`tutor-guard.js` is deterministic and works offline. Every AI call that a child can read passes through it.

- **`clean(reply)`** turns LaTeX and Markdown into plain text. Money such as "$5 and $7" is left alone.
- **`leaks(reply, question)`** is true when a reply states the checked answer of a question that is not yet solved.
  A number the question itself prints is never counted. Long numbers count wherever they stand; one- and two-digit
  answers only when presented as the result. Written Science answers are skipped (a grown-up reviews those).
- **`sumRequest(message)`** recognises a bare sum and returns the coaching reply. No model is called.
- **`RULES`** are three lines added to every tutor prompt: plain text only; not a calculator and never the final
  answer before it is solved; stay with the question on screen.

| Where | Rules in prompt | Reply cleaned | Answer-leak check | Bare sum coached |
| --- | --- | --- | --- | --- |
| Ask Mochi, Maths practice | yes | yes | yes | yes |
| Ask Mochi, Science practice | yes | yes | yes | yes |
| Automatic quick check (pilot topics) | yes | yes | yes | n/a |
| Automatic nudge (all other topics) | yes | yes | yes | n/a |
| Lesson tutor | yes | yes | no open question | yes |
| Science lab tutor | yes | yes | no open question | no |
| Original Mochi chat | yes | yes | yes (bank questions) | yes (bank questions) |
| Written-answer suggestions (grown-ups) | n/a | yes | n/a | n/a |

In the original Mochi chat, a problem she pastes in herself has no checked answer, so only the plain-text rule applies there.

## The automatic nudge (`tutor-nudge.js`)

The structured pilot still covers Motion, Ratios, Two conditions, Percentages, Light and Circuits. In every other
topic, a first wrong answer in guided, apply or challenge practice now triggers one short nudge:

- it uses her typed working when there is any, and the opening half of the checked steps as private context;
- at most three a day per subject and one per question; mixed review, delayed recall and papers are left alone;
- showing it records the attempt as helped, exactly like tapping Ask Mochi, so it never counts as independent evidence;
- if the AI is not connected nothing is shown; if the reply is empty or gives the answer away, the built-in hint is shown;
- the existing switch in Grown-ups ("Automatic AI teaching") turns it off together with the pilot's automatic turn.

Nudges and their daily count are kept on the tablet only (`mochi_tutor_nudge_v1`). They are not written to learning
records or exports; the nightly review sees their effect as a helped attempt.

## Things to know

- The tutor's model is still chosen per tablet in Grown-ups. This release does not change it.
- The answer check is a safety net, not a proof. A model can still describe a method so fully that only the last
  step is left; the prompt asks for one step at a time.
- Checked in a desktop browser with simulated AI replies and in `tests/ai-feedback-v711.test.cjs`. Not yet
  watched on her tablet with the live model.
