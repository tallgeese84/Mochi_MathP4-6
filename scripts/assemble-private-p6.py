"""Checksum-locked generic source transport; contains no purchased question pack."""
from pathlib import Path, PurePosixPath
import base64,bz2,hashlib,json,os
expected=['5d745adee14290acf0a232537a58228be1d84e5e','e8706e114e908f5a4068e4cd2d7180cd202c3848']
parts=[]
for i,sha in enumerate(expected):
    raw=Path(f'.p6-release.part{i}').read_bytes()
    assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==sha
    parts.append(raw)
encoded=b''.join(parts)
assert hashlib.sha256(encoded).hexdigest()=='401e8460f6767536a05802f1907113e9c2cff9178db48dea0cb990d796c60213'
raw=bz2.decompress(base64.b64decode(encoded,validate=True))
assert hashlib.sha256(raw).hexdigest()=='53b4e9a3bd2249576c037b24c4452121fe0e908fb1b97e5c184c44ad96a9300a'
changes=json.loads(raw)
assert len(changes)==22 and len({x['path'] for x in changes})==22
outputs={}
for c in changes:
    name=c['path']; rel=PurePosixPath(name)
    assert not rel.is_absolute() and '..' not in rel.parts
    p=Path(name);before=p.read_bytes() if p.exists() else None
    assert (hashlib.sha256(before).hexdigest() if before is not None else None)==c['before'],'Baseline changed: '+name
    lines=(before or b'').decode().splitlines(keepends=True)
    for a,b,text in reversed(c['edits']):
        assert 0<=a<=b<=len(lines)
        lines[a:b]=[text]
    after=''.join(lines).encode()
    assert hashlib.sha256(after).hexdigest()==c['after'],'Output changed: '+name
    outputs[name]=after
for name,after in outputs.items():
    p=Path(name);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(after)
Path(os.environ['RUNNER_TEMP'],'p6-reviewed.json').write_text(json.dumps({c['path']:c['after'] for c in changes}))
for i in range(2):Path(f'.p6-release.part{i}').unlink()
Path('.github/workflows/private-p6-release.yml').unlink()
Path(__file__).unlink()
print('Verified 22 reviewed public source files; temporary transport removed. No private source content.')
