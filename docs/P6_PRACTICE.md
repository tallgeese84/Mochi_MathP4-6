# Private P6 paper practice — v7.5.0

The public application contains only the reader, marking engine and synthetic tests. Purchased scans and source file references belong in a separate private `.mochi-p6.json` pack, not in this repository or its Actions artifacts.

## Using it

Open **More → P6 exam practice → Grown-ups: import a private question pack**. Import the supplied JSON once on each device. A single Maths or Science next-question button is the default; the full question list and source inventory stay in disclosures. This is supplemental practice, not a new compulsory daily task or an authenticated NUS High paper.

The original scan is authoritative. Tap it to enlarge; multiple-page questions keep their continuation pages. The accessible description is an aid, not substituted wording. Question and source-key page references are retained. Source inventory items labelled “Catalogued only” do not represent completed question imports.

Numbers accept equivalent fractions and specified unit spellings. Ratios accept equivalent positive ratios. Multiple-choice numbering stays as printed. Marking checks final responses, not the validity of working or a PSLE method-mark allocation. Written/drawing tasks remain **pending adult review**, including when numerical subparts are correct. Their source marking points can be opened after work is saved. There is no keyword-based written-answer pass.

“Help me start,” source-key viewing and a related-lesson visit record support. Outside-app help is self-reported in a separate row above working. Identical repeated taps do not record extra errors. Earlier exposure is never recycled as a fresh unseen success. A correct first response can be followed by studying the key without erasing that original success. No P6 result automatically advances the DSA pathway.

## Data and timing

Source packs live in IndexedDB (`mochi-private-p6`), not `S` or service-worker assets. The importer validates the schema, limits size, rejects arbitrary remote or SVG images, and verifies each normalized question using SHA-256 before replacing an installed pack. This detects damage/version drift; it is not an endorsement of an unknown pack author.

Only `S.p6` learner records (answers, typed working, handwriting, first responses, source IDs, support, exposure and a saved draft) join the existing export, Drive mirror and family sync. Cross-device merge conservatively unions responses and support. The original source pack must be installed on a second device before a saved scanned question can be displayed there. Keep the private pack file: a site-data clear removes its local copy. Importing a pack does not reset progress.

Explicitly starting a P6 question starts the existing subject foreground clock. The import/library screens do not count. Pause, Home, app hiding and subject changes retain the original clock rules and daily caps. P6 practice is untimed as an assessment: it has no invented examination deadline. Native reserved paper deadlines and interruption controls are not changed. No new point award or DSA mastery calculation is introduced.

## Extension contract

A pack has `schema: mochi-private-p6-v1`, an ID, a title, a digest, a question array and an optional private source catalogue. Each question has a stable ID, source ID, subject, question/page references, raster scans, typed answer fields, key pages/excerpts, and a content hash. The hash is SHA-256 of `MochiP6.signable(question)` after `MochiP6.pack` normalization. Update content hashes whenever a scan, field/key or explanation changes; an old saved draft requires its exact question version.

Only reviewed questions should receive deterministic keys. Unclear scans, contradictory keys, genuinely open-ended explanations and drawings must not be silently assigned an automatic pass. Author-written hints and any corrections must be explicitly distinguished from the source key. No learner records or purchased content belong in fixture files.
