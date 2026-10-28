# v7.8.1 — Proactive AI tutor (Motion and Light only)

## Teaching loop

When Euna submits her first **incorrect** answer in ordinary Motion or Light practice, the app shows the existing checked diagnostic and, if the existing OpenAI or Anthropic provider is configured and online, starts one background-generated coaching turn **without waiting for her to tap Ask Mochi**. The reply appears inline in a prominent but nonmodal tutoring area.

The tutor receives the question, answer entered, typed working and bounded prior evidence about the same subskill. It does **not** receive an answer key for the automatic turn. Instructions require one short next-step scaffold or diagnostic question, not a completed solution. A validated response is recorded as provisional supported learning and can suggest a verified local diagram, table or units aid. No model writes scores, chooses a new curriculum topic, overrides an adult's Science review or changes a nightly plan. Handwritten strokes are not transcribed or represented as understood.

Automatic tutoring is limited to first incorrect answers that have not already been helped; a successful first attempt is untouched. Tests, timed papers, mixed checks, redos, spaced recall and free-text Science awaiting adult review are excluded. If an AI service is unavailable, the existing checked diagnostic remains available. The child can still open the manual AI TA.

## Consent, rate and persistence

A parent-visible checkbox in **Maths / Science pathway → evidence** pauses or enables the proactive AI independently by subject. It defaults enabled for the requested rollout, but **actual API calls require a previously configured provider key and network**. Enabling does not add keys. At most three automatic calls per subject per America/Chicago day and one per question. Reservation is recorded before a network call, so reload does not silently resend the same prompt. Most recent parent preference merges by timestamp. Legacy data validates with proactive teaching enabled by default without changing attempts or rewards.

Automatic results are stored in the existing private `tutorPilot` state, with a distinct mode and provider provenance. Evidence of use is not verified understanding. A correct follow-up on a different example and a delayed independent check must still be observed separately. Source files, private plans, Google Drive docs, exports, credentials, permissions and deployment settings are unchanged.

## Safeguards and limitations

An in-flight request is aborted on a new answer or navigation. Replies are ignored after navigation, completion of the question, or a parent pausing the feature. The server's response must follow the v7.8.0 bounded JSON format, with quotation from actual typed working for non-uncertain diagnoses; otherwise the app offers checked built-in help rather than accepting a made-up diagnosis. Provider availability and device reception require separate verification. This does not prove that AI instructional content is scientifically correct; semantic quality and real-device checks are required before claiming personalized learning effectiveness.

No extra required study time, new questions, reward scoring, or app deployment changes are introduced.
