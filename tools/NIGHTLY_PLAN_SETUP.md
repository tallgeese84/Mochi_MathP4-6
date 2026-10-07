# One-time connection: nightly priorities into Daily Quests

The private plan document and nightly assessment are separate from the public app.
After this one-time setup, ordinary nightly priority changes need no GitHub merge and
no app-version change. This guide upgrades your EXISTING working Drive mirror relay.

1. Open the existing **Mochi Drive Mirror** project in Google Apps Script. Save a copy
   of its old source, then replace the code with `tools/mochi-drive-mirror.gs` from
   this release. Do not change MIRROR_SECRET, MIRROR_FOLDER_ID or the tablet settings.
2. Select **setupNightlyPlan** in the function selector and click **Run**. Approve the
   new Docs access if Google asks. It finds the single private plan Doc owned by you,
   named **Euna — App next-session plan (JSON)**, verifies that it has no public/domain
   link access, and stores its ID in NIGHTLY_PLAN_DOC_ID. It does not change sharing.
   A duplicate-title or missing-document error should be resolved before continuing.
3. Choose **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**.
   Keep **Execute as Me** and the existing web-app access setting. Updating the
   EXISTING deployment retains the same /exec URL; there is no new secret to copy.
4. Open Mochi online and confirm **v7.7.0 or later**. Go to **More → Grown-up settings
   & progress → Nightly learning priorities → Check plan connection**. A successful
   read shows the received plan date/revision. Check the small plan-date line on the
   home page; it must not still say only “no nightly priorities loaded.” If the plan
   is future-dated, it waits until that date. If expired, today's built-in plan is used.

Do not publish either private Google Doc to the web. Do not make a folder public,
enter private tokens into GitHub, clear browser storage, or reset learning progress.
A code update or an opaque “request sent” message alone is NOT evidence of a working
read connection. The nightly report says “published” until an app receipt confirms use.

## Troubleshooting without losing progress

“Relay upgrade needed”: verify you edited and redeployed the existing /exec deployment,
not just saved code. “Unavailable”: run setupNightlyPlan again under the owner account;
check Apps Script Executions, Docs permission and the deployment access. Test in an
ordinary online browser, not an editor preview. Do not paste secrets into chat. A
browser/CORS/network restriction may prevent a readable response even though the
progress mirror can still send; use the displayed connection status, not guesswork.

No plan for this date: the private document needs a valid schema-1 plan for this local
session date. Leave the old date intact; do not relabel stale assessment data. Daily
Quests continue normally with the local adaptive engine. A later sync's
`nightlyPlanReview` receipt distinguishes publication, receipt and actual use.

## Technical references

Google Apps Script web-app versioning/deployment:
https://developers.google.com/apps-script/guides/deployments

ContentService returns text via a redirect (the app follows it):
https://developers.google.com/apps-script/guides/content

Web-app POST handling and execution identity:
https://developers.google.com/apps-script/guides/web
