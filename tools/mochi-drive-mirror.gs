/* Mochi -> Google Drive mirror relay (Google Apps Script)
 *
 * Script Properties required:
 *   MIRROR_SECRET    = a long random secret copied from Mochi Grown-ups settings
 *   MIRROR_FOLDER_ID = the Drive folder id for "Mochi Euna Learning Mirror"
 *
 * Deploy as a Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Security model: the web app accepts only POST requests carrying MIRROR_SECRET in
 * the JSON body. The secret is never stored in the public Mochi GitHub repo.
 */

const LATEST_NAME = 'euna-mochi-latest.json';

function doGet() {
  return json_({ok:true, service:'mochi-drive-mirror', writeOnly:true});
}

function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const expected = String(props.getProperty('MIRROR_SECRET') || '');
    const folderId = String(props.getProperty('MIRROR_FOLDER_ID') || '');
    if (!expected || !folderId) throw new Error('Relay is not configured.');

    const raw = e && e.postData ? String(e.postData.contents || '') : '';
    if (!raw || raw.length > 8000000) throw new Error('Invalid or oversized payload.');
    const body = JSON.parse(raw);
    if (String(body.secret || '') !== expected) throw new Error('Unauthorized.');
    if (!body.backup || body.backup.app !== 'Mochi learning' || body.backup.version !== 1) {
      throw new Error('Invalid Mochi backup.');
    }

    const folder = DriveApp.getFolderById(folderId);
    const text = JSON.stringify(body.backup, null, 2);
    upsert_(folder, LATEST_NAME, text);

    const d = new Date();
    const weekName = weeklyName_(d);
    const weekly = folder.getFilesByName(weekName);
    if (weekly.hasNext()) {
      weekly.next().setContent(text);
    } else {
      folder.createFile(weekName, text, MimeType.PLAIN_TEXT);
    }

    return json_({ok:true, latest:LATEST_NAME, weekly:weekName, bytes:text.length});
  } catch (err) {
    return json_({ok:false, error:String(err && err.message || err)});
  }
}

function upsert_(folder, name, text) {
  const files = folder.getFilesByName(name);
  if (files.hasNext()) {
    const f = files.next();
    f.setContent(text);
    while (files.hasNext()) files.next().setTrashed(true);
    return f;
  }
  return folder.createFile(name, text, MimeType.PLAIN_TEXT);
}

function weeklyName_(d) {
  const iso = isoWeek_(d);
  return `euna-mochi-${iso.year}-W${String(iso.week).padStart(2,'0')}.json`;
}

function isoWeek_(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return {year:d.getUTCFullYear(), week};
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
