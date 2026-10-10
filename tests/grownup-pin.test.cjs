const test=require('node:test'),assert=require('node:assert/strict'),harness=require('./harness.cjs');

test('Grown-ups asks a new device to set a PIN, then requires it, and the old multiplication no longer opens settings',()=>{
 const h=harness(),$=id=>h.nodes.get(id)||h.ctx.document.getElementById(id);
 const open=()=>$('panel').style.display==='';
 $('adultBtn').onclick();
 assert.equal($('ovTitle').textContent,'Set a grown-up PIN');assert.equal($('panel').style.display,'none');
 $('gateInput').value='12';$('gateBtn').onclick();assert.match($('ovSub').textContent,/4 to 8 digits/);assert.equal(open(),false);
 $('gateInput').value='2468';$('gateBtn').onclick();assert.equal($('ovSub').textContent,'Type the same PIN again.');
 $('gateInput').value='2469';$('gateBtn').onclick();assert.match($('ovSub').textContent,/didn’t match/);assert.equal(open(),false);
 $('gateInput').value='2468';$('gateBtn').onclick();$('gateInput').value='2468';$('gateBtn').onclick();
 assert.equal(open(),true,'settings open after the PIN is saved');assert.equal($('ovTitle').textContent,'Settings');
 assert.ok(![...h.stored.values()].some(v=>String(v).includes('"2468"')),'PIN is not stored in plain text');
 // Lock again: the PIN is now required and wrong answers keep settings closed.
 h.run('grownupGate.lock()');$('panel').style.display='none';
 $('adultBtn').onclick();assert.equal($('ovTitle').textContent,'Grown-ups only');
 $('gateInput').value='323';$('gateBtn').onclick();assert.equal(open(),false,'a multiplication answer is not accepted');
 $('gateInput').value='2468';$('gateBtn').onclick();assert.equal(open(),true);
});
