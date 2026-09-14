# v4.3.7 mobile and learning-review changes

The v4.3.6 loading repair is merged. This follow-up targets narrow windows, short
landscape windows, mobile keyboards, minimisation and reviewing learning in ChatGPT.

## Layout fixes

The desktop rail used `top:calc(50% - 210px)`, making its top negative below 420 px
of window height. It now has a 16 px floor and its own scrollable height. Panels
use the available height in short windows; mobile Science controls stack. Inputs
remain at least 16 px to avoid focus zoom caused by small text. Pinch zoom remains
available. Dragged visual-lab coordinates reset if a resize puts the lab outside
the window, and dragging clamps the whole panel within the viewport.

VisualViewport resize/scroll events adjust panel height above a software keyboard.
This is feature-detected, event-driven and has vh/dvh fallbacks. A shrinking visual
viewport is treated as a keyboard only while typing and without pinch zoom. The
bottom icon dock is hidden while that keyboard is open to free space; the panel's
close button remains available. No resize replaces the question or clears ink.

Home motion pauses while the document is hidden. Existing elapsed time fields
include idle/minimised time, so export guidance explicitly rejects using them as
a calibrated measure of speed. This release does not rewrite historical timing.

## Learning access

The existing Drive folder was accessible but empty on 14 September 2026. No
private progress records were available to assess. The app cannot confirm opaque
Drive delivery, and this change does not claim the relay is deployed/configured.

Parent settings now provide **Download for ChatGPT** and **Open Drive folder**.
Attach the JSON here for review, or request the latest mirrored file through the
connected Drive plugin once the relay is configured and the file exists. Backups
remain restore-compatible. Their additional metadata records app version, export
time, record counts, independent results and latest attempt dates. Actual plans,
reasoning revisions, working and Science explanations remain available as raw
learning evidence. Recorded Science item text is included for context.

A useful review should state the available date range and sample sizes; compare
independent, supported and repeated work; cite specific reasoning examples;
separate a possible misconception from an established pattern; and propose three
next learning priorities with a fresh check for each. Empty or sparse data are
not evidence of weakness. App results do not establish an exam percentile or
admission probability. Review happens on request, not automatically in the background.

Downloads and both mirror paths share one builder. Only learning/science records
are copied, not the settings object. User-authored notes remain private data.
The existing relay accepts the same schema without redeployment for this change.

## Validation and limits

165 automated tests pass, including full-page startup and checks for viewport
height changes, keyboard-versus-zoom detection, minimise/restore, dragged-lab
recovery, export readiness, independent/support counts, credential exclusion and
backup restore compatibility. These are DOM and application tests, not rendered
Safari/Chrome/Firefox device certification.

The browser connection could create a fresh tab, but local preview navigation was
blocked (`ERR_BLOCKED_BY_CLIENT`) and live-page navigation timed out. No alternate
browser-control mechanism was used. Actual rendered device validation remains:

- 320/375 px phones, 768 px tablet split view, 1024×400 short desktop and 1440 px desktop.
- Open the tutor, More, parent settings and visual lab; reach every close button.
- Resize a dragged lab; confirm it remains reachable. Check answers and ink survive.
- Open/close the iOS and Android keyboards and test 200% browser zoom.
- Minimise/restore during a question, then download the review file.
- Confirm a real mirrored file's modified date, `exported` and latest-attempt dates.

Platform behaviour was checked against [MDN VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport)
and [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API).
