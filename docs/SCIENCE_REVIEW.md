# Maths and science trial — 11 September 2026

Version 4.1.0 is a first testable science release in the existing Euna studio.
It retains maths, local progress, input modes, tutor configuration, purple styling,
Euna's avatar and cat watermarks. No claim of complete science syllabus coverage or
NUS High difficulty calibration is made.

## What can be tested

- Maths / Science / Investigate navigation preserves the current maths answer.
- Eight science areas: circuits, shadows, heat and fair tests, plant systems,
  food webs, forces, states of matter, and human body systems.
- Original generated botanical, pond, organ-study, cup and cart illustration plates; original SVG
  scientific diagrams for the models. No emoji substitutes for science diagrams.
- Touch/keyboard model controls, a prediction before recorded trials, explanations,
  a notebook, stylus notes and optional inspected handwriting transcription.
- 24 authored practice questions and 8 separate assessment questions. Practice
  adapts using recent independent choices, mistakes and elapsed review time.
- Assessment questions are reserved from practice and marked seen when displayed.
  Feedback is deferred to the end. Previously exposed items do not become new tests.
- Wrong answers remain revisable. Guesses, retries, resource use and model help do
  not become independent evidence. A correct choice does not validate a written proof.
- Eight additional maths generators cover overlapping sets, changing averages,
  inside borders, fixed-quantity ratios, water displacement (extension), successive
  discounts, perimeter-to-area reasoning and repeated fractional remainders.
- Parent review includes science explanations and ink; the existing backup includes
  science notes, practice history, exposed assessment IDs and drawings, but no keys.

## Models and accuracy boundaries

Circuits assume ideal cells, ideal wires and identical constant-resistance bulbs.
Relative power scales as V squared / R, and is not calibrated visual brightness.
A broken series path extinguishes both bulbs; a broken parallel branch leaves the
other working. Source checks: [series circuits](https://openstax.org/books/physics/pages/19-2-series-circuits)
and [parallel circuits](https://openstax.org/books/physics/pages/19-3-parallel-circuits).

Shadows use a point source, parallel object/screen planes and similar triangles.
An extended light source and partial shadows are outside this model.

Cooling uses 20 + 60 exp(-k t), with illustrative rates 0.085 and 0.025 per minute.
Both cups start at 80 degrees Celsius in a fixed 20 degree room. These are generated
curves, not real measurements or a comparison of named materials. [Heat transfer](https://openstax.org/books/physics/pages/11-2-heat-specific-heat-and-heat-transfer).

Forces describe an instant when a 2 kg cart is already moving right. Positive and
negative net force indicate acceleration, not necessarily the direction of motion.
The model does not continue the motion through stopping or reversal. Numerical
force reasoning is enrichment. [Newton's second law](https://openstax.org/books/physics/pages/4-3-newtons-second-law-of-motion).

Plants and food webs are conceptual illustrations. Conditions do not produce
invented growth rates or population forecasts. [Photosynthesis](https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis)
and [energy flow](https://openstax.org/books/biology-2e/pages/46-2-energy-flow-through-ecosystems).

Particle arrangements and body pathways are schematic, not scale anatomy or
molecular dynamics. [Evaporation](https://www.usgs.gov/water-science-school/science/evaporation-and-water-cycle)
and [digestive systems](https://openstax.org/books/biology-2e/pages/34-1-digestive-systems).

The linked detailed references often need adult help; the in-app explanations use
primary-school language. The tutor receives model assumptions, question references,
predictions, trials and actual learner text. It cannot browse. AI replies discuss
reasoning but never award science credit. Family provider settings are reused.

## Remaining educational work

This first science set does not yet cover classification in depth, reproduction,
life cycles, cells, magnetism, materials and all upper-primary syllabus outcomes.
The eight assessment items are a small first sample, not an entrance-exam replica.
Written explanations and diagrams require parent/teacher review. Longer unseen
problems, broader contexts, hands-on group work and external assessments remain
necessary to judge readiness. NUS High also evaluates wider reading and attributes
through its separate DSA selection process; preparation is not an admission forecast.
[Official admissions criteria](https://www.nushigh.edu.sg/admissions/year-1-and-3-admissions/admissions-faq/).

## Verification and first user trial

149 Node tests pass, including independent calculations from 8,800 generated maths
statements. Science checks cover circuit continuity, shadow geometry, cooling
bounds, balanced/opposing forces, authored item integrity, reserved assessment
exposure, help/guess handling, revision, trial capture, combined data behavior,
subject switching and rejection of stale AI replies. HTML IDs, asset references,
JavaScript syntax and service worker files are checked.

No browser/device or live provider trial has been performed. Suggested first trial:
1. Science > Circuits: predict, close the switch, test, compare series and parallel.
2. Investigate > Plant systems: select the parts and change light availability.
3. Write with Stylus; return to Keyboard. Check preservation and transcription.
4. Save an investigation; inspect it in parent settings and back up learning.
5. Use Independent check when Euna is ready; items cannot be reset as unseen.

## Illustration refresh (4.1.0)

Three additional original generated plates replace or accompany schematic-only
views. They are illustrations, not photographs or measurements. Anatomy is an
organ study, not a labelled clinical atlas: accessory organs appear, the upper
ends of the oesophagus and airway are outside the study, and organ scales differ.
The cups depict matching geometry and water levels; numerical temperatures come
from the explicit cooling model. The cart painting supplies context; its force
arrows use an equal length-per-newton scale in separate, unobstructed lanes.

SVG arrowheads use fixed drawing units so highlighting a path cannot enlarge its
head into a label. Food-web arrow endpoints clear the node boxes by 16 drawing
units. Text labels are separate from the painted art. The body pathway explanation
and cooling curves appear after a recorded trial, which counts as assistance;
independent checks cannot expose those explanations.
