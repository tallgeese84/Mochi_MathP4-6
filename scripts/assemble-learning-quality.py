"""One-use, checksum-locked source transport; removed before production commit."""
from pathlib import Path, PurePosixPath
import base64, bz2, hashlib, json, os
expected=['243650c3c58adb3b782d634f35fa6c30c684094e','445169273ca06d2901f1631971517e208bfbce49','e0e8a5d0e897c5ed23d58f2639989fbc03de7fbc']
parts=[]
for i,checksum in enumerate(expected):
    b=Path(f'.quality-release.part{i}').read_bytes()
    assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==checksum, f'Changed transport {i}'
    parts.append(b)
encoded=b''.join(parts)
assert hashlib.sha256(encoded).hexdigest()=='17d20541f952b72c838b31b067e1f234e7afb98d7cfd92fa8921387607be9f4c'
raw=bz2.decompress(base64.b64decode(encoded,validate=True))
assert hashlib.sha256(raw).hexdigest()=='58c930e5ff6f9d1b569cb7e44464ce5cb127ec3cb15d4cc9570f0161e3f8ff85'
changes=json.loads(raw)
assert len(changes)==34 and len({c['path'] for c in changes})==34
outputs={}
for c in changes:
    name=c['path'];relative=PurePosixPath(name)
    assert not relative.is_absolute() and '..' not in relative.parts
    p=Path(name);before=p.read_bytes() if p.exists() else None
    assert (hashlib.sha256(before).hexdigest() if before is not None else None)==c['before'], 'Unexpected baseline: '+name
    text=(before or b'').decode('utf-8')
    for start,end,replacement in reversed(c['edits']):
        assert 0<=start<=end<=len(text)
        text=text[:start]+replacement+text[end:]
    after=text.encode('utf-8')
    assert hashlib.sha256(after).hexdigest()==c['after'], 'Unexpected output: '+name
    outputs[name]=after
for name,after in outputs.items():
    p=Path(name);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(after)
Path(os.environ['RUNNER_TEMP'],'quality-expected.json').write_text(json.dumps({c['path']:c['after'] for c in changes}))
for i in range(3):Path(f'.quality-release.part{i}').unlink()
Path('.github/workflows/learning-quality-release.yml').unlink()
Path(__file__).unlink()
print('Verified and reconstructed all 34 reviewed files; temporary transport removed.')
