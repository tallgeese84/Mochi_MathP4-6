# v4.3.5 loading review and v4.3.6 repair

Reviewed 14 September 2026 against GitHub main commit
`17a141b905dfba842680d1441338b7b7ba8f7461`. This review covers the complete script
loading chain, active home/motion/cloud layers, local storage, offline worker,
release generation, assets, existing learning tests and Pages build setup.
It is not a new curriculum certification or a live AI evaluation.

## Findings and changes

| Severity | Verified finding in v4.3.5 | Repair |
| --- | --- | --- |
| Critical | version-lock.js observes the whole body, calls mark through queueMicrotask, and unconditionally sets releaseNotes.textContent. That replacement triggers the same observer again, starving rendering and timers. Its writing guard is reset before observer delivery. | Remove the observer and every competing runtime version writer. Generate labels from release.json before publishing. |
| High | index.html unregisters origin-wide workers and clears caches before a second, unbounded no-store HTML fetch followed by document.write. | Deliver the real page directly with ordered deferred scripts. No startup cache purge or second HTML download. |
| High | input-mode.js independently injects baseline-week.js?v=4.2.2 while the loader also includes the current module. | One explicit script list; remove the hidden injector and obsolete patch files. |
| High | The worker forces open tabs to navigate during activation, registers under an old query version and has no saved HTML despite an offline fallback referring to it. | Versioned registration, release precache, bounded network-first HTML recovery and no client navigation. |
| Medium | Every static cache hit also starts a network request. Cache cleanup can affect sibling apps on the same github.io origin. | Cache-first versioned assets without redundant fetches; cache ownership includes this app's registration scope. Preserve unrelated/legacy caches. |
| Medium | Cloud modules can start before local progress hydration; remote requests and optional host storage have no deadlines. | Emit mochi:ready after local hydration; cloud services start afterwards. Cloud request/body deadline: 12 seconds. Optional host storage deadline: 1.5 seconds. Saves remain local even if a host service stalls. |
| Medium | baseline-week.js and quest-visuals.js still write v4.2.8; old release validation fails because index.html contains no release UI. | Restore one generated version for visible labels, runtime, manifest and worker assets. No periodic version writes. |
| Medium | Two elements have id=focusMore, making control bindings ambiguous. | Rename the home details element to focusMoreChoices. |
| Medium | Pages can publish successfully with broken startup; no CI runs the app tests or release validation. | Add App checks on PRs/main and a full-page startup regression test with an external process deadline. Add .nojekyll for this plain static site. |
| Low | Two identical embedded WebP strings enlarge each HTML navigation unnecessarily. | Reuse the unchanged drawing as mochi-builtin.webp. Precache original art and icons in the background. |
| Low | Manual cloud-only backup claims a local download; Drive's opaque no-cors response cannot prove delivery. | Accurate cloud status; Drive says request sent, delivery unconfirmed. Only small pagehide payloads use keepalive. |

The repository is roughly 1.7 MB before this change. Large science images are
worth caching, but their sizes do not explain an infinite browser freeze.

## Evidence and validation

- Running the exact old version-lock.js in an isolated DOM process prevented a
  500 ms heartbeat from firing; the process hit its 3-second external deadline.
- All **160 automated tests pass**, including the existing mathematical generator,
  learning-evidence, science and studio tests. The earlier checkout's test harness
  also fails when it encounters the untested hidden baseline loader.
- The new full-page test loads the actual index.html and every active script in
  deferred order. It checks a rendered question, home illustration, Maths/Science
  switching, stylus/keyboard switching, unique control IDs, one worker registration,
  no duplicate scripts and stable release labels. Cloud responses deliberately
  never resolve. A child-process deadline catches microtask starvation.
- Worker tests cover release installation, sibling cache preservation, no forced
  navigation, zero network requests on warm static hits, offline HTML recovery,
  stalled-navigation fallback and explicit first-load offline errors.
- Cloud timeout tests include a response whose JSON body never finishes.
- Release consistency and whitespace checks pass. The tests use jsdom and a worker
  harness; they do not measure Safari rendering or establish a device load-time SLA.
- Live browser interaction froze while inspecting v4.3.5, and the browser tool
  could not subsequently recover its tab listing. Consequently the corrected
  release still needs the device checks below. No live AI/handwriting recognition,
  Firebase credentials, private progress, database rules or Drive relay were tested.

The existing successful Pages run
[34793478184](https://github.com/tallgeese84/Mochi_MathP4-6/actions/runs/34793478184)
only ran the Pages/Jekyll build and deployment. Main currently reports no required
status checks. The new checks workflow provides a check; an owner must make it
required in branch rules to prevent future untested merges. The publishing source
has not been changed and this patch does not merge itself.

## Remaining setup risks

Firebase currently PUTs a whole progress snapshot without ETag conflict detection.
Concurrent devices can overwrite each other's latest snapshot; initial merge logic
is not equivalent to transactional syncing. A save occurring during an in-flight
sync can also miss its scheduled upload. Local records remain on the originating
device, but multi-device recovery needs a separately tested conflict/retry design.
This release bounds requests and fixes startup ordering; it does not claim to solve
those synchronisation semantics.

Drive uses a no-cors Apps Script relay. The browser cannot verify an opaque response
or confirm that a file reached Drive. Verify the relay independently before relying
on that mirror. Server access rules and ownership cannot be inferred from repository
code. API/provider keys are excluded from the existing Firebase progress payload.

## After merge: device acceptance

1. Wait for the main Pages deployment to finish. Reload the existing GitHub Pages
   website online and confirm **v4.3.6** in the header and Parent settings. The Sites
   preview is a separate deployment and is not updated by this PR.
2. Check Euna's existing progress and settings; start today's task, switch subjects,
   and write with both keyboard and stylus. Check the animated home and her avatar.
3. Leave the app open while the worker downloads the release and illustrations.
   Once installed, turn off networking and reload; questions and science art should
   remain available. AI and remote backups still require a network connection.
4. Verify an update does not reload a tab containing unfinished working. Test both
   an existing installation and a clean browser on the actual iPad/phone.
5. With the family's configured services, check timeout/retry messages and inspect
   the backup destination. Do not clear site data as a performance remedy: it can
   erase learning records and provider settings.

## Platform references

[MDN textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
explains that assigning textContent replaces children, even when assigning the same
text. [MDN document.write](https://developer.mozilla.org/en-US/docs/Web/API/Document/write)
documents its deprecated, timing-sensitive behaviour. GitHub documents
[Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
and the difference between publishing files and application validation.
