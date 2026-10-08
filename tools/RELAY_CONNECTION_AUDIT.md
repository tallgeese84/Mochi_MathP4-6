# Relay connection audit — 2026-10-08

## Confirmed active shared deployment

The owner identified Jonah's saved app endpoint and matched it to the active
**Family learning mirror: Euna, Jonah and Hana** deployment in
**Mochi-drive-mirror**. The deployment screenshot shows **Version 4**, dated
September 27, 2026, 10:04 PM as displayed. Retain Version 4 as the rollback target.

A public GET to that endpoint returned `family-learning-mirror`, all three app
names and `writeOnly:true`. This establishes its advertised interface, not
successful authenticated uploads or plan delivery. No POST was sent.

The owner then supplied Code.gs from Version 4. Its text exactly matches
`family-relay-tests/family-original.gs` in all three review branches:
SHA-256 `16b0b660547f21c75e8ff729179430578ba6b1180401298ae9f946d5b15bc559`.
Relay 1.2.0 retains that baseline's upload block and all upload helpers
byte-for-byte. The 102 synthetic relay tests passed again after this comparison.

| Source or deployment | Uploads | Retention | Plan reader |
|---|---|---|---|
| Active shared Version 4 in Mochi-drive-mirror | Euna, Hana and Jonah | Latest plus weekly; Hana export ordering; Jonah session/revision merge | None |
| Current saved Mochi editor source supplied earlier | Euna only | Latest plus weekly, with different helpers | Euna only |
| Saved Hana-drive-mirror source supplied earlier | Hana only | Latest plus daily UTC files; LAST_EXPORT_AT ordering | None |
| Prepared shared relay 1.2.0 | Same upload behavior as active shared Version 4 | Same as Version 4 | Fixed private readers for all three children |

Do not deploy the current Euna-only editor source to the shared deployment.
It would reject sibling uploads. A separate Jonah Apps Script project is not
needed for the endpoint the owner identified.

## Upgrade path and remaining evidence

Use the tested `family-drive-mirror.gs` to prepare the shared Version 4 upgrade,
keeping the existing deployment URL, secret, folder properties and access setting.
Retain the current saved source too; the Euna-only source supplied by the owner is
already archived as `family-relay-tests/euna-only-v7.7.0.gs`.

Only missing fixed plan-document properties should be added after approval.
`checkFamilyRelayReadOnly` checks saved source/configuration; it does not prove
published endpoint access, browser CORS, device receipt or session adoption.
Complete that check and resolve errors before publishing a new version of the
same deployment. Do not send synthetic learning uploads to production.

The actual saved endpoints on Euna's and Hana's usual devices still need matching.
Shared Version 4 supports Hana, but that does not prove her app uses it. Preserve
Hana-drive-mirror until this is resolved. If Hana uses that standalone deployment,
apply the supplemental reader and single dispatch line documented in HanaP3Math's
`tools/HANA_STANDALONE_NIGHTLY_SETUP.md`. Preserve its daily snapshots,
LAST_EXPORT_AT, original initializer and other settings. Do not migrate it to
shared weekly storage merely because a shared endpoint exists.

## Owner setup and saved-source check

The owner approved the missing plan-document settings, Docs authorization if
needed, and updating the same deployment after the read-only check passes.
The owner copied relay 1.2.0 into Code.gs, removed the duplicate old script from
the editor, and supplied a screenshot showing all three plan property names.
Only document-ID prefixes were visible; the subsequent checks establish access.

The October 8, 5:23 PM editor log reports recognised existing Euna and Jonah
mirrors and a readable Euna plan for October 8, revision 1. No Hana mirror was
found in this relay's configured folder. Do not create replacement history or
infer no Hana activity; verify her actual saved app connection in stage 2.

Both sibling diagnostics reported `readable:false`, which does not distinguish
an empty plan from a read failure. The two private plan Docs contained JSON null
when read separately through Drive. The tested editor-only companion
`family-plan-access-check.gs` supplies explicit `readOk` and `state` results
without modifying relay 1.2.0, settings or learner data. Its live result is pending.

## Status

Implementation and app integrations are on the existing draft review branches.
No app PR has been merged or deployed by this work. Shared relay 1.2.0 has not
been deployed by this work; the owner has prepared its saved source and plan
settings, but no updated deployment has been verified. No secrets, sharing,
plan documents, nightly schedules or learner data were changed by this work.
Actual authenticated uploads,
live plan delivery, app adoption and subsequent practice remain separate checks.

The approved Google configuration/deployment work must retain the existing URL,
secret, upload folders and sharing. Daily plans remain private data and require
no daily GitHub commits or app-version changes. No fabricated progress uploads
may be used as live tests.
