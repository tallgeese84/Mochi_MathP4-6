# v7.8.2 — Euna's daily learning improvements
Released: 2026-11-01

## Why
Child practice does not always line up with the dated private teaching plan. A depleted independently eligible item may yield `NO_FRESH_QUESTION`. The existing proactive pilot can also fail its model-output schema check, and automatic support previously covered only Motion and Light.

## Behavior
- Read-only question selection searches up to 768 candidates in existing authored Motion/Light/Circuits banks, with unchanged fingerprint and seen-before checks. No generated-by-AI questions are introduced; no re-used application or transfer is mislabelled fresh.
- If **no** eligible original is available, the existing private step remains pending and Today explains this. The child can continue scheduled learning without additional compulsory minutes. Parent and tablet receipts remain distinct.
- The existing one-per-question automatic provider reservation permits one tightly scoped JSON-format recovery request. Only schema-and-evidence-validated text is accepted as live tutoring; otherwise the checked local explanation is shown. API settings and per-subject/day limit are unchanged.
- Circuit quick checks now offer a complete-path representation for series and parallel scenarios, without treating electrical current as leaking or disappearing.
- The one primary Today activity labels the current guided, changed-practice or independent stage. A learner who makes a second wrong attempt still sees the diagnostic rather than a blank area.

## What does not change
Historical answers; pending Science adult-review flags; stored handwriting; drafts; saved papers; due recall; lesson prerequisites; curriculum sequence; dated private plan JSON; Google Drive relay; active timers; Monday–Sunday goals; cat points/coins; pet state; achievements; web permissions and accounts.

## Verification and limitations
Automated tests cover question-pool search, nonfabrication on a depleted route, circuit pilot evidence, daily provider gating, and structured-response constraints. GitHub checks and GitHub Pages publication must also succeed before the new version can be claimed live. A passing structured response check does **not** establish pedagogy accuracy. Live AI delivery, the installed PWA refresh and independently successful changed problems still require observed tablet data.
