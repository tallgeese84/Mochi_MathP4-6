"""Checksum-locked public source transport; removed before the production commit."""
from pathlib import Path, PurePosixPath
import base64, bz2, hashlib, json
expected=['2f600c318077dbea2cda43f52154ede48f2d9ae4','3d9803ee6f171c98200a7e0d71ff71ac9234b352','0c78b9fa05ab53c00a6fc52eb98bf920da5570d1','8811eb02e6c62229fc916d428e3efd958563d68d','4a68a46188bcbc4fdfb702ca5fc6b0be12d057e0']
parts=[]
for i,checksum in enumerate(expected):
    raw=Path(f'.nightly-release.part{i}').read_bytes()
    assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==checksum, f'Transport {i}'
    parts.append(raw)
encoded=b''.join(parts)
assert hashlib.sha256(encoded).hexdigest()=='7608dfc7366240cc9c157e279375fd3fcf621edd4fa0e4566bab62e0a3750bfe'
raw=bz2.decompress(base64.b64decode(encoded,validate=True))
assert hashlib.sha256(raw).hexdigest()=='125cdae23c95ad4eca17e06cbea6d8eb7812aa4345e0f664af6078791c6914c8'
changes=json.loads(raw)
assert len(changes)==22 and len({c['path'] for c in changes})==22
corrections=json.loads(Path('.nightly-corrections.json').read_text())
assert len(corrections)==4
for change in changes+corrections:
    name=change['path']; relative=PurePosixPath(name)
    assert not relative.is_absolute() and '..' not in relative.parts
    path=Path(name);before=path.read_bytes() if path.exists() else None
    assert (hashlib.sha256(before).hexdigest() if before is not None else None)==change['before'], 'Unexpected baseline: '+name
    lines=(before or b'').decode('utf-8').splitlines(keepends=True)
    for start,end,replacement in reversed(change['edits']):
        assert 0<=start<=end<=len(lines)
        lines[start:end]=[replacement]
    after=''.join(lines).encode('utf-8')
    assert hashlib.sha256(after).hexdigest()==change['after'], 'Unexpected output: '+name
    path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(after)
for i in range(5):Path(f'.nightly-release.part{i}').unlink()
Path('.nightly-corrections.json').unlink()
Path('.github/workflows/nightly-release.yml').unlink()
Path(__file__).unlink()
print('Reconstructed 22 reviewed public source files. Private learner plan is not part of this repository.')
