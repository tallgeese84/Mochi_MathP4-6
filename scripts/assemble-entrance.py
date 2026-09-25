# One-use branch-local assembly of the reviewed source; removed before publication.
from pathlib import Path
import hashlib, json, shutil, subprocess
root = Path.cwd()
parts = root / '.release-entrance-src'
sha = lambda data: hashlib.sha256(data).hexdigest()
for edit in json.loads((parts / 'edits.json').read_text()):
    path = root / edit['path']
    assert path.is_relative_to(root) and '..' not in Path(edit['path']).parts
    raw = path.read_bytes()
    assert sha(raw) == edit['before'], 'Unexpected baseline: ' + edit['path']
    lines = raw.decode('utf-8').splitlines(keepends=True)
    for start, end, replacement in reversed(edit['edits']):
        lines[start:end] = [replacement]
    data = ''.join(lines).encode('utf-8')
    assert sha(data) == edit['after'], 'Patched content mismatch: ' + edit['path']
    path.write_bytes(data)
joined = {'entrance-bank.js': 'fd436542745a9d090045fa9fc76d6b405c75424bdd5e8569dfccdd01661e5230', 'entrance-core.js': '3306b7b5d46601c95cdb27dd7593a3ecd2d05e9c9e18705cf65884035c72bde5', 'entrance-ui.js': '1e4c21061e1c5c8c7ea1c1087b45e6c7856332308e109c3d56765b50b6776c2f'}
for name, expected in joined.items():
    fragments = sorted(parts.glob(name + '.*'))
    assert fragments, 'Missing source fragments: ' + name
    data = b''.join(f.read_bytes() for f in fragments)
    assert sha(data) == expected, 'Source assembly mismatch: ' + name
    (root / name).write_bytes(data)
index = root / 'index.html'
raw = index.read_bytes()
assert sha(raw) == '7eab90b6e8626490e2d253da19a8cd563a2a8c39413a05462d19a8834d180e0e', 'Unexpected page baseline'
html = raw.decode('utf-8')
old = '<script defer src="planner-core.js?v=5.5.2"></script>'
assert html.count(old) == 1
scripts = ['entrance-data.js','entrance-figures.js','entrance-bank.js','entrance-core.js','planner-core.js']
html = html.replace(old, '\n'.join('<script defer src="'+f+'?v=5.5.2"></script>' for f in scripts))
old = '<link rel="stylesheet" href="course.css?v=5.5.2">'
assert html.count(old) == 1
html = html.replace(old, old+'\n<link rel="stylesheet" href="entrance.css?v=5.5.2">')
end = html.rfind('</script>', 0, html.index('</head>')) + len('</script>')
assert end > 0
html = html[:end] + '\n<script defer src="entrance-ui.js?v=5.5.2"></script>' + html[end:]
index.write_text(html, encoding='utf-8')
release = {'version': '6.0.0', 'releasedOn': '2026-09-25', 'summary': 'A June 2027 entrance-reasoning pathway: 24 teaching units, original paper-style diagrams, guided and independent practice, delayed retrieval, and reserved mixed papers. Existing maths, science, notes and companions are preserved.'}
(root / 'release.json').write_text(json.dumps(release, indent=2)+'\n')
subprocess.run(['node','scripts/release.cjs'], check=True)
assert sha(index.read_bytes()) == 'e115e7524ee18dbe7682817ccd5d0d792a276f58fc632e109920896a5abe3f06', 'Release page mismatch'
shutil.rmtree(parts)
(root / '.github/workflows/entrance-publish.yml').unlink()
Path(__file__).unlink()
