# One-use usability correction on the verified working branch.
from pathlib import Path
import hashlib
changes = [['entrance-ui.js', '1e4c21061e1c5c8c7ea1c1087b45e6c7856332308e109c3d56765b50b6776c2f', '<p id="epFeedback"', '${!done&&(v.revealed||(a?.responses.length||0)>=2)?\'<button id="epFreshGuided">Try a fresh guided question</button>\':\'\'}<p id="epFeedback"', "  $('epRevisitLesson').onclick=", "  if($('epFreshGuided'))$('epFreshGuided').onclick=()=>{capture();const id=view.unit;E.finishPractice(data());beginPractice(id,'guided');};\n  $('epRevisitLesson').onclick="], ['tests/fixtures/entrance-controls.js', '3a8a9bed1355ed004f313e5c90d8fc6d1a040cc0e9e689bf6ae5ce8acff4036b', ' // Fresh, synthetic paper state for timing, revision and feedback withholding.', " // The learner can always leave an exhausted retry sequence for guided teaching.\n w.MochiEntranceUI.practice('percent');\n for(let i=0;i<12;i++){input('epAnswer','999999');click('epCheckAnswer');}\n const stuckId=evalIn('S.entrance.draft.id');assert(d.getElementById('epFreshGuided'),'Guided recovery offered');click('epFreshGuided');\n assert(evalIn('S.entrance.draft.id')!==stuckId,'Fresh question replaces only the draft');assert(evalIn('S.entrance.draft.phase')==='guided','Recovery is supported practice');\n assert(evalIn('S.entrance.attempts.at(-1).responses.length')===12,'Original response history retained');assert(!evalIn('S.entrance.attempts.at(-1).independent'),'Recovery does not erase failures');\n // Fresh, synthetic paper state for timing, revision and feedback withholding."]]
for name, expected, *pairs in changes:
    path = Path(name)
    source = path.read_text()
    assert hashlib.sha256(source.encode()).hexdigest() == expected, name
    for i in range(0,len(pairs),2):
        old,new = pairs[i:i+2]
        assert source.count(old) == 1, name
        source = source.replace(old,new)
    path.write_text(source)
Path('.github/workflows/entrance-publish.yml').unlink()
Path(__file__).unlink()
