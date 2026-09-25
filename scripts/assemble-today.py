"""One-use, checksum-locked release transport; deleted before publication."""
from pathlib import Path, PurePosixPath
import base64, bz2, hashlib, json, os
expected = ['2f19ba9b65e26d1b0b3934b8e43c9de41f0791d2', 'a2408c22014f3c59f36f91bddcce4b3ca80967c9']
parts = []
for i, checksum in enumerate(expected):
    data = Path(f'.today-release.part{i}').read_bytes()
    assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest() == checksum, f'Changed transport {i}'
    parts.append(data)
encoded = b''.join(parts)
assert hashlib.sha256(encoded).hexdigest() == '55cddc672a5e205c152b9221f4f05fa13b5521bd6ed022c3c6304dd31c95b8b4'
raw = bz2.decompress(base64.b64decode(encoded, validate=True))
assert hashlib.sha256(raw).hexdigest() == 'bddfbcf58c270291f7424e4184b658c78fda692355bcf0c283e3bcf70d661154'
changes = json.loads(raw)
assert len(changes) == 24 and len({c['path'] for c in changes}) == 24
outputs = {}
for change in changes:
    name = change['path']; relative = PurePosixPath(name)
    assert not relative.is_absolute() and '..' not in relative.parts
    path = Path(name); before = path.read_bytes() if path.exists() else None
    assert (hashlib.sha256(before).hexdigest() if before is not None else None) == change['before'], 'Unexpected baseline: '+name
    lines = (before or b'').decode('utf-8').splitlines(keepends=True)
    for start, end, replacement in reversed(change['edits']):
        assert 0 <= start <= end <= len(lines)
        lines[start:end] = [replacement]
    after = ''.join(lines).encode('utf-8')
    assert hashlib.sha256(after).hexdigest() == change['after'], 'Output differs from reviewed file: '+name
    outputs[name] = after
for name, after in outputs.items():
    path = Path(name); path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(after)
Path(os.environ['RUNNER_TEMP'], 'today-expected.json').write_text(json.dumps({c['path']: c['after'] for c in changes}))
for i in range(2): Path(f'.today-release.part{i}').unlink()
Path('.github/workflows/today-plan-publish.yml').unlink()
Path(__file__).unlink()
print('Reconstructed and verified all 24 reviewed files; temporary transport removed.')
