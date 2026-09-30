"""One-use verified UI patch; removed before the production commit."""
from pathlib import Path
import hashlib, json, os, subprocess
before={
 'entrance-ui.js':'cce03f834439343f96bb49f73aa43ff7454ac5eddd3d81be62ebff9d94350478',
 'science-path-ui.js':'839e5b14c3df33582c16ef2d6ebb8082da05b55c12360a87e6afbf28364443f1',
 'entrance.css':'7fa78ded9fc61efd53c8fb3ffd3c88b136558b2c672773fe6c5ae0475302945b',
 'science-path.css':'9d20b077e4629fe5ab5b55c087e48d691b716c5c95f55579deb64268823d2471',
 'release.json':'fb784d6812f7a6d42e4029c40d055a690a7e0c59d9cf95117d8e902e4bbb0100',
 'index.html':'88b3c98bc0339666ea447d58717c5d374e5e4e97105efd40e79e2a866d7e304a',
 'app.js':'3ddf8720f773217976942632d82698883e36bd4b0b24263941720da5b89f8ac4',
 'sw.js':'5e942a16fcfd682a13a18bfb7b8985d2655db634aa6e0e4a274afaa69c7a0859',
 'manifest.webmanifest':'84ab17c9f6073d0278f19c558c0d2eaa12e9c40d6a843818bc59e172ff883902',
 'CHANGELOG.md':'2dea73db3d6d04c204b5efeccd1354eba580c27f742f03cc5d3f7a954fbae2d4'
}
after={
 'entrance-ui.js':'527efb07a329cd3ce330d5752f2db0097272c8f8c45839e703f5ed8e61a2f05a',
 'science-path-ui.js':'9bb5804155ca2805d01fe59de97373faaa4479d48e8e6640109c1d9e9cb1c007',
 'entrance.css':'afa21bb407eb65a7107edd88fef81ed0410e50a6e65831a0f62b29fc5842f1a2',
 'science-path.css':'73ef1eb77f011a03e2a548e72c5374ad073cad15f12289f727b28f129f4cce82',
 'release.json':'cf2ce0d90e423dcaa805d1fc80a063213a046c5f95cfd1ce4a8279a43f0f4d7f',
 'index.html':'26e9e38cfd086dd57557666a649f8cd2c3c5756a775625d8d425c37a1197362d',
 'app.js':'7ffe935c286903a08f2270e0dc981aaa59eeb8aa566990c9105ef43e2a3abb2a',
 'sw.js':'7f34a85c6c036636befe855d6dabd9ab258a64d1b49fed688bfcbe6ab30d1942',
 'manifest.webmanifest':'227d6fb1e86e4d3a487ca21ae06d3d19041281456ed2512ef5235b6d92a45ca3',
 'CHANGELOG.md':'223f156c76a449435d23094572ba8a79066b0ecbf997d872867c74351cbd0cbb',
 'tests/help-spacing.test.cjs':'12150d7a6a1e9d5bd6d26013199f564a120364be8903766bf2c6d1d7c4bb2451',
 'tests/fixtures/help-spacing-browser.html':'22bbd2645e0e8f347439b23713a6d41fac6cc2022d6332beb1b5c8012378ec28'
}
for name,checksum in before.items():
 assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==checksum, 'Unexpected baseline: '+name
for filename,css,p in [('entrance-ui.js','entrance.css','ep'),('science-path-ui.js','science-path.css','sp')]:
 f=Path(filename);s=f.read_text()
 old="${!paper?`<label class=\""+p+"-check\"><input type=\"checkbox\" id=\""+p+"Guess\" ${saved.guess?'checked':''} ${disabled?'disabled':''}> I guessed or received help outside the app</label>`:''}"
 new="${!paper?`<div class=\""+p+"-attempt-note\"><label class=\""+p+"-check\" for=\""+p+"Guess\"><input type=\"checkbox\" id=\""+p+"Guess\" aria-describedby=\""+p+"GuessNote\" ${saved.guess?'checked':''} ${disabled?'disabled':''}><span>I guessed or received help outside the app</span></label><p id=\""+p+"GuessNote\">Tick only if this applies. In-app help is recorded automatically.</p></div>`:''}"
 anchor='<div class="'+p+'-input-switch" role="group"'
 assert s.count(old)==s.count(anchor)==1, filename
 f.write_text(s.replace(old,'').replace(anchor,new+anchor))
 style='''
/* Keep the help declaration above the working pad, away from answer submission. */
.P-attempt-note{margin:20px 0 24px;padding:8px 12px 12px;border:1px solid #e5ddea;border-radius:12px;background:#faf8fc;box-sizing:border-box}
.P-attempt-note .P-check{align-items:center;gap:12px;min-height:44px;margin:0;line-height:1.5;cursor:pointer}
.P-attempt-note .P-check input[type=checkbox]{flex:0 0 22px;width:22px;height:22px;margin:0;accent-color:#785295}
.P-attempt-note .P-check span{min-width:0}
.P-attempt-note p{margin:0 0 0 34px;font-size:12px;line-height:1.5;color:#74657e}
.P-answer-area+.P-actions{padding-top:20px;margin-top:24px;border-top:1px solid #e8e3ec}
'''.replace('.P-','.'+p+'-')
 with Path(css).open('a') as out:out.write(style)
r=json.loads(Path('release.json').read_text());assert r['version']=='6.7.0'
r.update(version='6.7.1',summary='Move the guess/outside-help checkbox above the working pad in Maths and Science, away from Check my answer. Give it a separate touch-friendly row and clearer instructions without changing help recording, saved work, rewards or timers.')
Path('release.json').write_text(json.dumps(r,indent=2)+'\n')
c=Path('CHANGELOG.md');c.write_text('# v6.7.1 — Separate help reporting from checking answers\n\n- Move the guess/outside-help checkbox above the reasoning pad in Maths and Science.\n- Use a distinct row, a 22 px checkbox and a label with a minimum 44 px touch height.\n- Keep the writing area and a divider between help reporting and answer submission.\n- Preserve existing saved flags, automatic in-app help recording, assessment restrictions, rewards and timers.\n\n'+c.read_text())
subprocess.run(['node','scripts/release.cjs'],check=True)
for name,checksum in after.items():
 assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==checksum, 'Output differs from reviewed file: '+name
Path(os.environ['RUNNER_TEMP'],'help-spacing-expected.json').write_text(json.dumps(after))
Path('.github/workflows/help-spacing-release.yml').unlink()
Path(__file__).unlink()
print('Verified all 12 production files; one-use patch and workflow removed.')
