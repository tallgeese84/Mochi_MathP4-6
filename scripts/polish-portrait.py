# Complete the daily-plan avatar and remove whitespace in generated SVG documents.
from pathlib import Path
import hashlib,subprocess
p=Path('cat-portraits.js')
s=p.read_text()
assert ")+'\\n';" in s
s=s.replace(")+'\\n';", ").replace(/[ \\t]+$/gm,'')+'\\n';",1)
p.write_text(s)
p=Path('planner-ui.js');s=p.read_text()
assert 'id="plannerPetImage" src="mochi-builtin.webp"' in s
s=s.replace('id="plannerPetImage" src="mochi-builtin.webp"','id="plannerPetImage" data-mochi-avatar src="${MOCHI_AVATAR}"')
assert "$('plannerPetImage').src=$('roomImg').src;" in s
s=s.replace("$('plannerPetImage').src=$('roomImg').src;","$('plannerPetImage').src=$('stage').dataset.portrait==='flat'?MOCHI_AVATAR:$('roomImg').src;")
p.write_text(s)
p=Path('tests/fixtures/cat-portraits.html');s=p.read_text().replace("length===2,'Both tutor controls'","length===3,'Tutor controls and daily-plan avatar'");p.write_text(s)
p=Path('tests/cat-portraits.test.cjs');s=p.read_text()+'''
test('daily plan uses the same current portrait instead of a leftover detailed image',()=>{
 const ui=fs.readFileSync(path.join(root,'planner-ui.js'),'utf8');
 assert.match(ui,/id="plannerPetImage" data-mochi-avatar src="\\$\\{MOCHI_AVATAR\\}"/);
 assert.doesNotMatch(ui,/mochi-builtin\\.webp/);
});
''';p.write_text(s)
subprocess.run(['node','scripts/build-cat-portraits.cjs'],check=True)
Path(__file__).unlink()
