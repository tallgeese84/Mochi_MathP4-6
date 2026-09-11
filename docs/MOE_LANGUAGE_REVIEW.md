# MOE terminology and explanation review

Reviewed 11 September 2026 for application release 4.2.0.

The authored learning text was reviewed against the published MOE primary
Mathematics and Science syllabuses and SEAB's 2026 assessment objectives. This is
an editorial and scientific review, not MOE approval or an official marking
scheme. Clear, scientifically or mathematically equivalent explanations remain
valid; the app must not teach that one memorised sentence is the only answer.

## Sources and scope

- [MOE primary syllabus index](https://www.moe.gov.sg/primary/curriculum/syllabus).
- [Primary Science syllabus 2023](https://cms.moe.gov.sg/assets/ba3562d3-5b31-4459-8693-45cde7b97273/Primary%20Science%20Syllabus%202023.pdf): changes of state (printed p. 49), digestive and respiratory/circulatory systems (pp. 53–54), electrical circuits (p. 59), forces (pp. 63–64), heat (pp. 76–77), photosynthesis (p. 78).
- [Primary Mathematics syllabus, updated October 2025](https://www.moe.gov.sg/media/files/primary/92bff26d-b2b4-4535-b868-b8415c744b91.pdf): terminology, primary content and learning experiences emphasising reasoning, communication and checking.
- [SEAB Science 2026](https://isomer-user-content.by.gov.sg/334/24bb2fea-a0e0-4aaf-9a11-ae1ef1b8840e/0009_y26_sy.pdf) and [Mathematics 2026](https://isomer-user-content.by.gov.sg/334/fe51f29b-04ae-4fcb-a907-8db04c028510/0008_y26_sy.pdf): assessment objectives include application, inquiry and reasoning. These documents do not provide an exhaustive list of required answer sentences.

Reviewed the prompts, answer choices, hints, worked explanations and diagram
captions in all 88 maths generators and 32 authored science items; the 18 maths
concept probes; learning prompts, interactive model observations and learner-facing
UI; and both subjects' tutor instructions and built-in responses. Incorrect
multiple-choice distractors are intentional and remain incorrect options, followed
by corrective explanations. The scope is the app's own current text, not external
websites, imported learner notes or future AI responses.

## Corrections made

| Area | Correction and reason |
| --- | --- |
| Melting and freezing | Use ice and liquid water, and explicitly link melting to heat gain and freezing to heat loss. The melting explanation now reads: “Ice gains heat and melts into liquid water. This is a change of state. No new substance is formed.” |
| Evaporation and condensation | Explain evaporation from the exposed surface below the boiling point; condensation occurs when water vapour loses heat. Distinguish invisible water vapour from liquid droplets and from air. |
| Water illustrations | Ice now has a more open arrangement than liquid water, with the same particle count across states. The picture is explicitly an extension model, not a primary requirement or a literal view of water. Incompatible starting states produce a correction rather than a fictitious transition. |
| Heat and fair tests | Use heat loss, temperature and poor conductor accurately. Name controlled variables. The unequal-temperature question now starts its bare and wrapped cups at the stated 60°C and 80°C, including the plotted curves and recorded trial. Other heat activities retain their supplied starting temperatures. |
| Circuits | Use closed circuit and electric current. Explain a working parallel branch without requiring an unexplained relative-power value. Brightness is an illustration, not a measurement. |
| Plant systems | Identify light energy, water and carbon dioxide as photosynthesis requirements, and food (sugar) and oxygen as products. Explain that respiration releases energy from food. Roots absorb water and mineral salts. |
| Food webs | Arrows represent energy transfer from food to consumer. Population effects are possible consequences, not guaranteed predictions. |
| Human systems | Prefer gullet, windpipe and digested food. Distinguish digestion, absorption and transport in blood. The tutor accepts oesophagus as another name for gullet. |
| Forces | Use speed and direction in explanations. Mark the numerical net-force activity as an extension, define its assumptions and avoid teaching the direction of friction on rolling wheels. Explain the balanced case as well as speeding up and slowing down. |
| Maths vocabulary | Use equivalent fractions, average, and breadth for rectangles/cuboids; distinguish a digit from its value and area from perimeter. Correct the cube hint to describe three equal factors. |
| Maths question precision | Specify the positive common multiple, internal tank dimensions, the shared diameter in the semicircle/rectangle question, and the sock quantities needed for a worst-case guarantee. Make the L-shaped diagram's cut-out dimensions explicit. |
| Maths explanations | Replace the unqualified prohibition on averaging speeds with the reason it fails for unequal time intervals in the supplied journey. Explain fraction division using equal-size parts. Supply a complete elapsed-time calculation and correct misleading bar captions. |
| Tutor and UI | Both tutors receive subject terminology and accuracy guidance, accept valid alternatives and must flag conflicting references. Remove an incorrect “computer science tutor” role description and an inaccurate claim that AI never calculates. |

Answer keys, question IDs and stored learning evidence remain compatible. Practice
still accepts numerically equivalent fractions; a wording change removes a
simplest-form requirement that the current checker did not enforce. Worked
references continue to demonstrate simplification. Written explanations themselves
are not automatically validated by multiple-choice marking.

## Primary content and extensions

The force activity's numerical net force and continued motion when balanced are
extensions. The primary syllabus covers force effects but excludes the direction
of friction on rolling objects. Particle arrangements and photosynthesis carbon
tracing are also labelled extensions. Existing maths extension routing for speed
and investigations remains in place. Advanced vocabulary is introduced with its
meaning rather than presented as a compulsory primary answer phrase.

The Science bank still has only 24 practice and 8 reserved check questions across
eight areas. It is not complete syllabus coverage, a PSLE/SPERS mock or calibrated
NUS High preparation. Terminology review does not resolve those separate coverage
and difficulty limitations. See [the science review](SCIENCE_REVIEW.md) and
[the curriculum review](CURRICULUM_REVIEW.md).

## Verification and remaining limits

153 automated tests pass, including independent calculations from 8,800 generated
maths questions. New regression checks cover the four water transitions and invalid
starting states; the unequal-temperature question's actual trial and graph; equal
particle counts and the ice/liquid arrangement; and delivery of terminology and
alternative-wording guidance in both tutor requests. Existing checks cover learning
records, assistance, assessment isolation and input preservation.

The source review is the basis for the terminology changes. Passing software tests
alone cannot certify educational quality. AI replies remain generated and can be
wrong despite the strengthened instructions; no live-provider session was tested
for this release. No new browser/device trial was performed. Parent/teacher review
of Euna's explanations and any questionable AI output remains part of the learning
process. Future authored questions should undergo the same source and
question/diagram/reference consistency review before release.
