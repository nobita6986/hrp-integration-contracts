import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:dirname(fileURLToPath(import.meta.url)),encoding:'utf8'}).trim();
const ref=process.argv[2];
assert.match(ref??'',/^[0-9a-f]{40}$/,'pass full immutable evidence commit SHA');
const base='reconciliation/hrp/CONTRACT-03A-producer-recheck/r4';
const git=(...args)=>execFileSync('git',args,{cwd:root});
const blob=p=>git('show',ref+':'+p);
const hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=blob(base+'/manifest.sha256');
const decode=b=>new TextDecoder('utf8',{fatal:true}).decode(b);
function encoding(b){decode(b);assert.notEqual(b.subarray(0,3).toString('hex'),'efbbbf');assert.equal(b.includes(13),false);}
encoding(manifest);
const entries=decode(manifest).trimEnd().split('\n').map(line=>{
 const m=/^([0-9a-f]{64})  (.+)$/.exec(line);assert.ok(m);
 const [,expected,p]=m;assert.ok(p.startsWith(base+'/'));assert.ok(!p.includes('..'));
 const b=blob(p);encoding(b);assert.equal(hash(b),expected,p);
 return p;
});
assert.equal(new Set(entries).size,entries.length);
const all=git('ls-tree','-r','--name-only',ref,'--',base).toString('utf8').trim().split('\n').filter(p=>p!==base+'/manifest.sha256');
assert.deepEqual([...entries].sort(),all.sort());
console.log(JSON.stringify({ref,manifestSHA256:hash(manifest),entries:entries.length,match:entries.length,encoding:'UTF8_LF_NO_BOM',coverage:'COMPLETE',mode:'READ_ONLY_RAW_COMMITTED_BLOBS'},null,2));
