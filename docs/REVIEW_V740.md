# Review of v7.4.0 and integration boundary

Reviewed baseline: `6988e5e04febb0b7979a26d7733477fb3ef93f74` (PR39). The v7.5.0 private-paper route is additive. It does not silently replace Claude's curriculum, question-bank revisions, progression thresholds or native assessment formats.

## Useful improvements to retain

The streamlined question surface, four-place navigation, progressively revealed lessons, geometry models, mixed-topic retrieval, mistake log, extra challenge content, and bank revision tracking are substantial improvements. In particular, historical questions can retain their original bank revision instead of being reinterpreted after content changes. Reduced-motion and lower-powered-device alternatives are present.

## Findings requiring care (not repaired in native banks by v7.5.0)

1. **Written science is not reliable semantic marking.** Reproduction at the baseline: `MochiSciencePath.B.make('fairtest',2,17)` asks for a fair fertiliser investigation. The response `Do not change fertiliser. Do not keep water the same. Do not measure height. Never repeat the test.` returns `claim: true`, `reason: true`, `mark: true`. The matcher finds its four phrase groups without rejecting those negations. Some templates provide explicit contradictions, but that is not a general scientific reasoning validator. A passing code suite does not remove this defect. Proposed correction: distinguish provisional key-idea feedback from adult-confirmed written evidence; do not regrade historical attempts without a clear new revision/migration policy.

2. **Pool exhaustion can promote familiar questions as new evidence.** `path-core.js` accepts `!seenBefore || exhausted` in eligible progression evidence. A repeat can therefore count for progression once its finite question pool is exhausted. The relevant automated test intentionally allows this. That may prevent a small bank from blocking navigation, but it must not be described as fresh transfer or stronger evidence of retention. The private P6 route never applies this exception.

3. **One changed-form success is a milestone, not broad mastery.** The celebration and skill map can use language such as a topic being mastered after a first challenge success. That is narrower evidence than durable independent performance across unfamiliar diagrams and mixed papers. The model can still guide next practice; its simulation of course coverage is not an individual readiness forecast.

4. **Selection date and mock formats are planning choices.** The default 2027-07-03 date is extrapolated and the grown-up panel tells users to check the school announcement. The student countdown does not make that uncertainty equally visible. The six 90-minute maths mocks and four 70-minute science mocks are original training formats, not authenticated official formats. The official Year 1 admissions page inspected during review still described the 4 July 2026 selection; no 2027 selection date was verified there. Keep the target date labelled provisional until confirmed.

5. **Help context has limits.** The existing TA prompt receives question text and typed working, but should not be assumed to understand all details in a scanned diagram or handwritten work. The new private pack does not automatically send purchased scans or a child's working to an AI provider; it uses reviewed starting hints and related lessons instead.

## Verification boundaries

Local baseline release/course checks passed. Most pure tests ran locally; five test failures were missing-jsdom environment failures, not diagnosed production defects. The GitHub validation for the final release runs the complete supported Node 24 suite plus real HTTP Chrome controls. Local inlined-HTML screenshots are rendering checks only, not service-worker, cloud-server or physical-tablet tests.

The private-paper importer separates source content from synchronized progress and uses human review for written science. These safeguards do not retroactively fix the native written-science marker or recalibrate existing mastery. Do not infer admission chances from a passing test suite, attractive graphics or course-completion percentages.
