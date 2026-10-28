# Motion and Light tutoring pilot — v7.8.0 candidate

Status: implemented and locally tested, **not published or installed on a device**.
Base: upstream `93edd50776d17477d7e7f8ee9712d78c3243d539` (v7.7.7).

## What changes in an ordinary practice session

After the first incorrect answer in Motion or Light, an existing authored quick check now saves the actual first choice, prompt, options, timestamp, stable question identity and subskill. A correct relationship check preserves the learner's method and prompts a step check; an incorrect check opens a checked representation. An alternative representation and a Maths units aid are available. This is provisional evidence, not a diagnosis from one wrong answer. Repeated unsuccessful attempts after the alternative produce a change-of-approach message rather than another compulsory drill.

The existing AI conversation receives recent same-subskill observations and whether later independent work has been observed. Its response must match a small schema and quote current working/message exactly before a definite provisional focus is accepted. Its allowed suggestion can offer a checked representation, units aid or step check. No model action can change scores, rewards, reviews or navigation. The provider badge distinguishes a schema-checked live reply, disconnected built-in help, invalid reply and connection failure. Schema/quote checking does **not** verify the scientific or pedagogical correctness of a model reply.

Evidence survives subject validation, merging, export and reopening. A parent summary distinguishes supported completion, changed independent application and a later independent check. Changed numbers in the same structure do not establish broad transfer. Later checks require at least 24 elapsed hours and a different America/Chicago date, with a first correct, unhelped, unrepeated response. These are observations, not causal proof that an explanation worked.

When a new apply/transfer question is already scheduled, the selector may prefer a fresh existing variant of the recently supported subskill, but only within the same topic, form and phase. It cannot force a new study block, change a recall, replace a saved question, skip prerequisites or invent questions. If that form has no matching variant, independent evidence remains pending. Ordinary due recall remains with the existing scheduler; the pilot does not promise a new automatic next-day check.

## Scope and preserved behavior

The pilot applies only to guided/apply/transfer/recall practice in Motion and Light, not papers, mixed assessments or redos. Different Motion and Light subskills remain separate. It reuses the existing question bank and diagnostics. The private nightly plan schema, publication helper, relay, source files, credentials, folder permissions and Google deployment are untouched.

Saved tasks, lesson prerequisites, time limits, earned rewards, cat collections, history and adult Science reviews retain their existing mechanisms. Tutoring state is a bounded additional `tutorPilot` field inside the subject's existing private state. Existing subject reports include its read-only summary; the pinned backup builder is unchanged. No learner data is included in the repository or test package.

## What this does not yet implement

This is a narrow connected pilot, not a complete autonomous tutor. It does not expand the private nightly-plan schema, transcribe handwriting, replace adult marking of free-text Science, create new curriculum questions, or guarantee retrieval after a set interval. It does not automatically establish causation, mastery or entrance readiness. The real provider connection and the learner's installed tablet build have not been checked in this implementation task. Real model quality and physical-device behavior remain release checks.

## Verification performed

- 36 new Node tests pass.
- Full available suite: 835 passes, 7 failures, all in test entries blocked by missing `jsdom`. Untouched baseline: 799 passes and the same 7 blocked entries. Files aborting at module import mean these are not the full expected CI counts.
- 21 synthetic Chromium DOM integration checks pass, covering actual Maths/Science controls, diagnostics, alternative support, AI provenance/schema fallback, stale async replies, saved state, exports, adult-review preservation, daily time boundaries and narrow layout.
- Browser checks used local source insertion in production order, a storage adapter and mocked AI. No real model, production-origin storage, service worker, physical tablet or private plan receipt was tested.
- Release assets, course generation, cat portraits, JavaScript syntax and unchanged backup/relay hashes pass their checks.

The workspace has Node 22.16.0; the project requires Node >=24.15.0 and jsdom 30.0.1. The full suite is **not green** here and must run in the supported environment before merging.

## Release gate

Use a clean checkout of the exact base commit. Apply this candidate on a new branch. With the supported Node version, run `npm ci`, `npm test`, `npm run check:release` and `npm run check:course`. Do not bypass a failure or weaken frozen compatibility tests. Review the diff, then use the existing pull-request and deployment workflow. Confirm the new build on the actual tablet and check a fresh private export before claiming use or benefit. Reopen a saved question, test a connected and disconnected AI interaction, and verify no extra daily block appears.

Rollback must retain private exports: old versions preserve established subject data but may discard the new optional tutoring field when validating. Export the candidate state privately before downgrading. Do not reset local storage, rewards or the private learning files.
