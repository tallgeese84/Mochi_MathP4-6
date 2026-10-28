// Temporary public-source patch; rejects drift before writing any target.
'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),zlib=require('node:zlib'),path=require('node:path');
const changes=JSON.parse(zlib.gunzipSync(Buffer.from('H4sIAAAAAAAC/+1925bbSHLgr0DyuEi6UCjcCbLEqiO1qj1tt9SySj1zxpJOdwKZqMKIJNgAWJct8Rz/w/ph33bf9mXf930/Zb9gP2EjIjNxI1mSemSfsWfsHhWYyGtEZNwyMvD2/vGKVVePp495npTHL7/7+9+++f4PP736/ulLa8Efm49jkeaFgPdOMOE8cWM7jj1P8PGY23YSjKM4TMPA5dwO4wlLx6nrRikUJWmcuIy5kUjdKBGOA32xtBIFdDX2fM/zQh54kR2IJAh817XtSWqPo2jCE3vCJ5Mw5E46mcRMiPE48INJYqehnXgsTsbQleBZVT6evr1/XFasqB5PJ747huIl14+VuIXix++Wf/M3xmuxElVWZfnSWBV5JRJ6HF6PLfj/0bvlu+U/rUVJhRkXS6h6Z6xLURrVlTDEbQavlpdGKRYM3iVGCr9EsSqyZWUay7wymMGzNBUFNIVaght5YZRX6zSd4/MKOy4t44eCZ0tW3BlstZpnCcPi46pgyxKawsQYTCsR0KExz3EAoxDJXTKHabAlzOKKrcsK+lvl+e/cd','base64')).toString('utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),prepared=[];
for(const c of changes){if(c.path.includes('..')||path.isAbsolute(c.path))throw Error('Invalid patch path');let b=fs.existsSync(c.path)?fs.readFileSync(c.path):Buffer.alloc(0);if(c.before?sha(b)!==c.before:b.length)throw Error('Source drift: '+c.path);for(const e of c.edits.slice().reverse())b=Buffer.concat([b.subarray(0,e.start),Buffer.from(e.text),b.subarray(e.end)]);if(sha(b)!==c.after)throw Error('Patch mismatch: '+c.path);prepared.push([c.path,b]);}
for(const [name,b] of prepared){fs.mkdirSync(path.dirname(name),{recursive:true});fs.writeFileSync(name,b);}
console.log('Verified public-source repetition patch applied.');
