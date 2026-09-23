import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=process.env.HRP_REVIEW_ROOT??execFileSync('git',['rev-parse','--show-toplevel'],{cwd:here,encoding:'utf8'}).trim();
const git=(...args)=>execFileSync('git',args,{cwd:root});
const priorCommit='4d144821f99b81d7706e2749e8f3d09124c88d8d';
const priorPath='reconciliation/hrp/CONTRACT-03A-producer-probe-correction/r1/recheck.mjs';
const before=git('show',priorCommit+':'+priorPath).toString('utf8');
const oldLine="check('F01 query accepted actor cannot be stripped/rejected by claims schema',true,()=>validate({...implClaims,actor},implHeader,{query:true}));";
const newLine="check('F01 query accepted actor cannot be stripped/rejected by claims schema',true,()=>validate({...implClaims,actor},{...implHeader,typ:'hrp-crm-service+jwt'},{query:true}));";
assert.equal(before.split(oldLine).length,2);
const expected=before.replace("const sha = '7c804c92ff8105596383b13ef9f9546617d69b6e';","const sha = '272e883ef48c552054849905d7b75695b7ac4d8f';").replace(oldLine,newLine);
const after=fs.readFileSync(path.join(here,'recheck.mjs'),'utf8');
assert.equal(after,expected);
const oldResults=JSON.parse(git('show',priorCommit+':reconciliation/hrp/CONTRACT-03A-producer-probe-correction/r1/recheck-results.json'));
const current=JSON.parse(fs.readFileSync(path.join(here,'recheck-results.json'),'utf8'));
assert.deepEqual(current.records.map(r=>({id:r.id,expected:r.expected})),oldResults.records.map(r=>({id:r.id,expected:r.expected})));
const legacyId='F01 query accepted actor cannot be stripped/rejected by claims schema';
const categories={checkout:[],integrity:[],legacyDiagnostic:[],behavioral:[]};
for(const r of current.records){
 const group=r.id.startsWith('pin ')?'checkout':r.id.startsWith('I01 ')?'integrity':r.id===legacyId?'legacyDiagnostic':'behavioral';
 categories[group].push(r.id);
}
assert.equal(current.records.length,175);
assert.equal(new Set(current.records.map(r=>r.id)).size,175);
const report={
 priorCommit,priorPath,
 priorScriptSha256:createHash('sha256').update(git('show',priorCommit+':'+priorPath)).digest('hex'),
 newScriptSha256:createHash('sha256').update(Buffer.from(after)).digest('hex'),
 exactChanges:['candidate pin only','one actor-positive header typ only; claims/actor/options/expected unchanged'],
 all175RecordIdsAndExpectationsPreserved:true,
 observedTotal:current.records.length,
 observedPass:current.summary.pass,
 excludedFromNormativeConformance:[legacyId],
 retainedGateObservations:current.records.length-1,
 categoryCounts:Object.fromEntries(Object.entries(categories).map(([k,v])=>[k,v.length])),
 categories,
 crmReported174:'Not reproduced for the exact MSG-037 committed runner. No CRM runner hash or per-record ID inventory supplied. Do not invent which observation CRM omitted.',
 warning:'Legacy-shaped actor positive is a DIAGNOSTIC replay only, not a requirement to accept invalid wire claims. Future strict implementations should reject it. Old legacy-header negatives are not sufficient independent claims tests; use canonical-probes.mjs.'
};
fs.writeFileSync(path.join(here,'correction-verification.json'),JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({result:'PASS',total:report.observedTotal,pass:report.observedPass,categoryCounts:report.categoryCounts,retainedGateObservations:report.retainedGateObservations},null,2));
