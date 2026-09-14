// One release record supplies the visible labels and versioned offline assets.
// Edit release.json, run `node scripts/release.cjs`, then commit the generated files.
// Use --check to reject drift without changing files.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const runtime = fs.existsSync(path.join(root, 'dist/index.html')) ? path.join(root, 'dist') : root;
const release = JSON.parse(fs.readFileSync(path.join(root, 'release.json'), 'utf8'));
if (!/^\d+\.\d+\.\d+$/.test(release.version) || !/^\d{4}-\d{2}-\d{2}$/.test(release.releasedOn) || typeof release.summary !== 'string') throw Error('Invalid release record');
const date = new Date(release.releasedOn + 'T00:00:00Z');
if (!Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== release.releasedOn) throw Error('Invalid release date');
const dateLabel = date.toLocaleDateString('en-SG', {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'});
const escapeHTML = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const generated = [];
for (const file of ['index.html', 'app.js', 'sw.js', 'manifest.webmanifest']) {
  const filename = path.join(runtime, file), original = fs.readFileSync(filename, 'utf8');
  let text = original.replace(/\?v=\d+\.\d+\.\d+/g, '?v=' + release.version);
  if (file === 'index.html') {
    text = text.replace(/<!-- Mochi Maths v[^>]+-->/, `<!-- Mochi Maths v${release.version} — ${release.releasedOn} -->`)
      .replace(/(<[^>]+\bdata-app-version\b[^>]*>)[^<]*(<\/[^>]+>)/g, (_, before, after) => before + 'v' + release.version + after)
      .replace(/<time data-release-date datetime="[^"]*">[^<]*<\/time>/, `<time data-release-date datetime="${release.releasedOn}">${dateLabel}</time>`)
      .replace(/(<p id="releaseNotes">)[^<]*(<\/p>)/, (_, before, after) => before + escapeHTML(release.summary) + after);
    if ((text.match(/data-app-version/g) || []).length !== 2 || !text.includes('id="releaseNotes"') || !text.includes('data-release-date')) throw Error('Missing release UI');
  }
  if (file === 'app.js') {
    text = text.replace(/const APP_VERSION = '[^']+';/, `const APP_VERSION = '${release.version}';`)
      .replace(/const BUILD_DATE\s*= '[^']+';/, `const BUILD_DATE  = '${release.releasedOn}';`);
    if (!text.includes(`const APP_VERSION = '${release.version}';`)) throw Error('Missing runtime version');
  }
  if (file === 'sw.js') {
    const html = generated.find(f => path.basename(f.filename) === 'index.html').text;
    const core = ['./index.html', './manifest.webmanifest', './mochi-builtin.webp', './mochi-watermark.webp', './euna-avatar.webp',
      ...fs.readdirSync(runtime).filter(f => /^science-.*\.webp$/.test(f)).map(f => './' + f),
      ...Array.from(html.matchAll(/(?:src|href)="([^"]+\.(?:js|css|png)(?:\?[^"]*)?)"/g), m => './' + m[1]).filter(x => !x.includes('://'))];
    for (const asset of core) if (!fs.existsSync(path.join(runtime, asset.split('?')[0]))) throw Error('Missing offline asset: ' + asset);
    text = text.replace(/const VERSION = '[^']+';/, `const VERSION = '${release.version}';`)
      .replace(/const CORE = .*?;[^\n]*/, 'const CORE = ' + JSON.stringify([...new Set(core)]) + '; // Generated from index.html.');
  }
  generated.push({filename, original, text});
}
const changed = generated.filter(f => f.original !== f.text);
if (process.argv.includes('--check')) {
  if (changed.length) throw Error('Release metadata is out of sync: ' + changed.map(f => path.basename(f.filename)).join(', ') + '. Run node scripts/release.cjs.');
} else for (const f of changed) fs.writeFileSync(f.filename, f.text);
console.log(`Release v${release.version}: ${process.argv.includes('--check') ? 'verified' : 'synchronised'} labels, date, runtime and offline assets.`);
