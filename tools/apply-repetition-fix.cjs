// Temporary public-source patch; rejects transport or source drift before any write.
'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),zlib=require('node:zlib'),path=require('node:path');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const expected=['cbf4c3abfc5c6115ba6196d2d96cd2b337dca378a5d5f79074f909b08316034d','18c896a35afd8bcc7b88ab2524f46cc36c8a0783a4fa1169ba88792be0c8e3b5','64cec7640ae4c26e7e3e721b35e6fc4ef8f401b7c5c25f3b00d47a611e19b054','3ba2648c6c45581083e8ddf022df690c4c6df22b5c152b3b793f600240009292'];
const encoded=expected.map((digest,i)=>{const b=fs.readFileSync('tools/repeat-patch-'+(i+1)+'.b64','utf8').trim();if(sha(Buffer.from(b))!==digest)throw Error('Patch transport mismatch: '+(i+1));return b;}).join('');
const changes=JSON.parse(zlib.gunzipSync(Buffer.from(encoded,'base64')).toString('utf8')),prepared=[];
for(const c of changes){if(c.path.includes('..')||path.isAbsolute(c.path))throw Error('Invalid patch path');let b=fs.existsSync(c.path)?fs.readFileSync(c.path):Buffer.alloc(0);if(c.before?sha(b)!==c.before:b.length)throw Error('Source drift: '+c.path);for(const e of c.edits.slice().reverse())b=Buffer.concat([b.subarray(0,e.start),Buffer.from(e.text),b.subarray(e.end)]);if(sha(b)!==c.after)throw Error('Patch mismatch: '+c.path);prepared.push([c.path,b]);}
for(const [name,b] of prepared){fs.mkdirSync(path.dirname(name),{recursive:true});fs.writeFileSync(name,b);}
console.log('Verified public-source repetition patch applied.');
