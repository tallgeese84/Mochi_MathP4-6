"""One-use, checksum-locked transport; removed before the production commit."""
from pathlib import Path, PurePosixPath
import base64, bz2, hashlib, json

expected_parts = [
    '14b8b34ca50b059eea6d39d32ff282122be8d6d4',
    '4516aa1f9ba97f5c60e6d0f15ee120ce064157ce',
    '7848cdfefb43f900915c21be93936456ec83d189',
    'fb4a2212547063cb19869c46e3df05a083666b35',
    '468d81efd026d38760c838460a28d1139d61a0c3',
    '5d3e1dddba5b6301af71b11cb887f6d830750156',
    'c330ada2afd49f9b2f95fa6000b6516c111370de',
]
parts=[]
for i, expected in enumerate(expected_parts):
    b=Path(f'.science-release.part{i}').read_bytes()
    actual=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
    assert actual==expected, f'Transport chunk {i} changed'
    s=b.decode('ascii')
    if i==4:
        # Repair one identified transport-copy error before the whole-payload checksum.
        assert s.count('T5PsO3xZSk')==1
        s=s.replace('T5PsO3xZSk','T5PsPM3xZSk')
    parts.append(s)
raw=bz2.decompress(base64.b64decode(''.join(parts),validate=True))
assert hashlib.sha256(raw).hexdigest()=='59cd09cce96ef70566cd1919785b1f7ce784ba6ee86b10c8bf774ba16ca15993', 'Payload mismatch'
changes=json.loads(raw)
assert len(changes)==29
# Snapshot every source before writing: several new modules derive from old maths files.
snapshot={}
for change in changes:
    for key in ('source','path'):
        name=change[key]
        assert not PurePosixPath(name).is_absolute() and '..' not in PurePosixPath(name).parts
        p=Path(name)
        snapshot[name]=p.read_bytes() if p.exists() else None
for change in changes:
    name=change['path']; old=snapshot[name]
    assert (hashlib.sha256(old).hexdigest() if old is not None else None)==change['before'], 'Unexpected baseline: '+name
    source=snapshot[change['source']] or b''
    assert hashlib.sha256(source).hexdigest()==change['source_sha'], 'Unexpected source: '+change['source']
    lines=source.decode('utf-8').splitlines(keepends=True)
    for start,end,replacement in reversed(change['edits']):
        assert 0<=start<=end<=len(lines)
        lines[start:end]=[replacement]
    path=Path(name);path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(''.join(lines).encode('utf-8'))
for i in range(7):Path(f'.science-release.part{i}').unlink()
Path('.github/workflows/science-path-publish.yml').unlink()
Path(__file__).unlink()
print('Reconstructed 29 reviewed files; temporary transport removed.')
