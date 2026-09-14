# Mochi private Google Drive mirror

This is a one-time setup. Firebase remains Mochi's live cross-device database. The Drive mirror stores the exact same JSON produced by **Back up learning** so ChatGPT can retrieve and analyse Euna's learning history through the connected Google Drive plugin.

## Destination folder

- Folder: `Mochi Euna Learning Mirror`
- Folder ID: `1A5A9LZ6vTP2UckVtl5DwdVkc8-ktnlX2`

The relay writes:

- `euna-mochi-latest.json` — overwritten with the newest backup
- `euna-mochi-YYYY-Www.json` — one weekly snapshot, updated during that week

## One-time Apps Script deployment

1. Open https://script.google.com and create a new project named `Mochi Drive Mirror`.
2. Replace the default code with `tools/mochi-drive-mirror.gs` from this repository.
3. Open **Project Settings → Script Properties** and add:
   - `MIRROR_FOLDER_ID` = `1A5A9LZ6vTP2UckVtl5DwdVkc8-ktnlX2`
   - `MIRROR_SECRET` = the secret generated in Mochi under **Grown-ups → ChatGPT learning mirror**.
4. Click **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorise Drive access when Google asks.
6. Copy the deployed URL ending in `/exec`.
7. In Mochi, open **Grown-ups → ChatGPT learning mirror**, paste the `/exec` URL and the same secret, click **Save settings**, then **Mirror now**.
8. Check the Drive folder for `euna-mochi-latest.json`.

## Privacy

- Tutor/API keys are never included in the backup.
- The Apps Script source contains no secret.
- The relay secret stays in Apps Script Script Properties and Mochi device-local storage.
- The Drive folder should remain private.

## What ChatGPT can do afterwards

With Google Drive connected, ask things such as:

- “Review Euna's Mochi learning from the last two weeks.”
- “Which reasoning skills are lagging?”
- “Set next week's Mochi programme from her actual results.”

ChatGPT can locate `euna-mochi-latest.json` in Drive and analyse it on demand.
