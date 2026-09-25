# Cat Friends — v5.5.0

Mochi remains the primary companion, with his existing mesh, growth, wardrobe,
coins and learning logic unchanged. Four breed-inspired visitors are additive:
Miso (British Shorthair), Suki (Siamese), Kumo (Maine Coon) and Yuki (Ragdoll).
These are stylised models, not a biological breed-identification resource.

The Cat Friends panel is in Mochi's room. Milestones from the existing validated
planner ledger unlock friends at 2, 8, 18 and 32. Already-earned milestones count.
Up to three friends visit alongside Mochi. No real money, coin charge, attendance
streak or penalty is involved. Unlocked friends remain available after mistakes,
rest days and retained-history trimming. Deliberately removing all visitors is
supported and is not silently undone by auto-fill.

`catFriends` is a versioned, allowlisted state field. Cloud merging unions unlocks
and selects the latest deliberate roster edit; equal timestamps use a deterministic
tie-break. Provider credentials stay device-local. Learning exports and imports
retain the roster. Importing an older backup without this field keeps existing
friends. The existing, explicitly confirmed full reset clears the roster too.

3D visitors share Mochi's renderer and animation clock. Hidden views, Pause and
reduced-motion mode stop automatic animation for all cats. At most four companion
models are allocated per room mount, with three visible. Materials/geometries are
released when the room is disposed. Picture mode keeps all selected friends and
roster controls available if WebGL cannot start. The feature makes no extra model,
voice or network-service calls and stores no new personal identifiers.

Validation: `npm test`, `npm run check:release`, `npm run check:course`.
The isolated `tests/fixtures/cat-friends-browser.html` uses synthetic milestones and
checks the actual page/renderer, roster controls, picture fallback, export and
375px layout. Serve the repository locally with a fresh temporary browser profile for this graphics
smoke test. It refuses non-local hosts or an existing progress/sync configuration,
and contains no learner data.

## v5.5.1 visibility and load recovery

The top of the room now always lists and displays the selected friends, including
in 3D mode. Choose friends opens the roster. A deliberately empty roster stays
empty and explains how to invite friends back; a device with no earned milestones
shows that state instead of implying the feature is missing.

The room loader recovers a missing companion graphics script, checks the room
module's `CAT_FRIENDS_VERSION` contract, retries an outdated module once, and
checks the renderer's companion count. If recovery fails it reports the error and
keeps picture companions available. The version label alone is not a graphics
health check. This release does not change milestone thresholds or reset progress.
