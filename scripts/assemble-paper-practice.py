"""Checksum-locked transport of reviewed sources; removed before final commit."""
from pathlib import Path, PurePosixPath
import base64, bz2, hashlib, json, os
checksums=['2e076c06aa6811410e025d843884bb7a0ab8383b','c547160d175eafe195f624d731d01182e75b7e72','b250c05b2695a403a83e07f64b65f4fd750f61e2','dfec26b36747cb23793b4818067c9ddb4c5fa6d4']
def gitsha(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
parts=[]
for i,expected in enumerate(checksums):
    b=Path(f'.paper-practice.part{i}').read_bytes()
    assert gitsha(b)==expected, f'Transport chunk {i} changed'
    if i==2:
        # Repair an identified copy error, then verify the exact intended chunk.
        assert b.count(b'PditJJpnoyz')==1
        b=b.replace(b'PditJJpnoyz',b'PditJpnoyz')
        assert gitsha(b)=='de569f1183154c3b5c66877ecff7c81c62c57948'
    parts.append(b)
encoded=b''.join(parts)
assert hashlib.sha256(encoded).hexdigest()=='7c5e2a6bce40123117f6214e825164d635a40aeccfef9a9fa146a7c9ab4bcf71'
raw=bz2.decompress(base64.b64decode(encoded,validate=True))
assert hashlib.sha256(raw).hexdigest()=='04ba5d1bc04b8cb9270b5fa9a9c0023159a59a3822f03c4adb0916e637097545'
changes=json.loads(raw)
assert len(changes)==21 and len({c['path'] for c in changes})==21
outputs={}
for c in changes:
    name=c['path'];p=Path(name);rel=PurePosixPath(name)
    assert not rel.is_absolute() and '..' not in rel.parts
    before=p.read_bytes() if p.exists() else None
    assert (hashlib.sha256(before).hexdigest() if before is not None else None)==c['before'], 'Unexpected baseline: '+name
    lines=(before or b'').decode('utf-8').splitlines(keepends=True)
    for start,end,replacement in reversed(c['edits']):
        assert 0<=start<=end<=len(lines)
        lines[start:end]=[replacement]
    after=''.join(lines).encode('utf-8')
    assert hashlib.sha256(after).hexdigest()==c['after'], 'Unexpected output: '+name
    outputs[name]=after
for name,after in outputs.items():
    p=Path(name);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(after)
Path(os.environ['RUNNER_TEMP'],'paper-expected.json').write_text(json.dumps({c['path']:c['after'] for c in changes}))
for i in range(4):Path(f'.paper-practice.part{i}').unlink()
Path('.github/workflows/paper-practice-release.yml').unlink()
Path(__file__).unlink()
print('All 21 reviewed production files reconstructed and verified; transport removed.')
