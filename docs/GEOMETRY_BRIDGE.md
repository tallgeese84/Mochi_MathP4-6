# Geometry bridge — v6.7.0

The June 2027 entrance-reasoning goal remains. This update repairs prerequisite
relationships rather than lowering the entire course or treating a school score as
an app mastery flag. No child-specific assessment records are bundled.

## Teaching progression

Four original bridge units supplement the existing 24 methods (28 total):

1. **Length, covering and filling** (`geo-measure`): cm, cm², cm³; identify the
   requested quantity and recognise what a calculation actually measures.
2. **Build volume one layer at a time** (`geo-layers`): unit cubes per layer,
   layer counts, equal cube edges, and the inverse relationship. Volume divided by
   three is not a cube edge.
3. **Cover faces, then hide the joins** (`geo-surface`): one face before all six,
   pairs of cuboid faces, then two touching cubes and complete rows.
4. **Name the angle before calculating** (`geo-angles`): vertex and ray names,
   the requested inside/outside opening, rotated figures and split straight angles.

Each uses the existing explanation, worked examples, concept check, guided,
independent application, changed-form and week-later review engine. New bridge
records are separate from older questions. Two fresh independent applications and
one changed-form success in each volume bridge are required before the UI starts
complex volume/surface practice. Previously proven volume application/transfer is
not reset. These criteria are teaching choices, not calibrated mastery claims.

Recent volume misses guide the daily recommendation into this bridge. Existing
unsent work is retained while the lesson is explored; replacing a different saved
question still requires the existing confirmation. After three geometry questions,
a taught algebra strength can provide a brief change of task before the bridge
continues. Existing due retrieval and active-paper priorities are retained.

## Interactive geometry

The model is embedded in lessons and optionally opened in practice, not added as
another homepage dashboard. Its geometry is genuinely constructed in x,y,z and
projected into SVG; it does **not** require WebGL or another remote library.

- Trace unit lengths; cover squares with tiles; fill a cube by adding/removing layers.
- Drag or use arrow keys to rotate solids. Front, top and side views connect a 3D
  object to flat drawings. Range controls also work by keyboard.
- Compare the same cube's face area, total surface area and interior volume.
- Separate joined cubes to inspect both hidden faces at a join. Displayed surface
  totals explicitly refer to the joined solid, not the exploded inspection view.
- Fold six hinged, labelled squares from a flat net into a cube. Opposite pairs
  and unit edge lengths are geometrically checked.
- Rotate an angle drawing and identify the two rays. Slide the apex of two
  shared-height triangles without changing their area ratio.

Models use separate teaching examples, not the active question's unknown values.
Opening them on an unresolved practice question records support. The independent
answer then cannot be misreported as unassisted. Paper mode has no model controls;
all reserved question identities, text, answers, order and deadlines are unchanged.
Static assessment-style figures remain restrained grayscale. No automatic spinning
or extra animation loop is used; detached models dispose their DOM handlers.

## Feedback and incentives

An identical submitted answer with identical working and ink is not appended again.
The learner gets explicit feedback and may change the answer, explain a new step or
open help. Meaningful revisions are recorded; past repeated submissions remain in
history unchanged. First-answer accuracy is never retroactively improved.

Cat Points celebrate learning separately from mastery:
- +1 once for completing each of the four new bridge lessons (exposure, not mastery).
- +1 once per geometry method for correcting an answer and subsequently solving a
  different, fresh problem independently. Reveal/retry alone earns no recovery point.

These are bounded lifetime awards (four lesson awards and up to eight recovery
awards). They join the existing point system without charging coins or removing
cats. Stable award keys prevent duplicate grants on repeated saves and cloud merges.
The existing optional extra-question rewards and bounded double-time awards remain.
Written explanations are saved for human review; no keyword-based reasoning grade
has been introduced.

## Preservation and validation

The update retains old maths/science attempts, draft work, timers, cats, coins,
wardrobe and stored paper results. New units reuse the validated pathway schema;
the cat-state additions are allowlisted and union-merged. One digest test locks all
reserved paper question objects to the v6.6.0 baseline.

Run `npm test`, `npm run check:release`, and `npm run check:course`.
The geometry tests independently enumerate unit-cube faces, verify layer counts,
check net hinge closure/opposite faces, rotate 3D coordinates, test gated routing,
protect supported evidence, deduplicate submissions and validate bounded rewards.
`tests/fixtures/geometry-browser.html` exercises real page controls on a local test
server and refuses a non-local host or an existing learner/sync profile. It uses
synthetic state only. Software tests do not establish educational efficacy or an
admissions probability.
