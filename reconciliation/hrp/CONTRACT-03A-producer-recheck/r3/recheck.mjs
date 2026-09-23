import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

// Producer probes with ACCEPTED-spec expectations, not old-bug assertions.
// Synthetic values only; no network, signature verification, DB or runtime auth.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.HRP_REVIEW_ROOT ?? execFileSync('git',['rev-parse','--show-toplevel'],{cwd:here,encoding:'utf8'}).trim();
const api = await import(pathToFileURL(path.join(root,'packages/contracts/dist/index.js')).href);
const sha = '7c804c92ff8105596383b13ef9f9546617d69b6e';
const git = (...args) => execFileSync('git', args, {cwd:root});
const hash = b => createHash('sha256').update(b).digest('hex');
const blob = p => git('show',`${sha}:${p}`);
const records=[];
function check(id, expected, fn) {
  let actual; try { actual=fn(); } catch(e) { actual={threw:e.message}; }
  const pass=isDeepStrictEqual(actual,expected);
  records.push({id,expected,actual,pass});
  console.log(`${pass?'PASS':'FAIL'} ${id}: ${JSON.stringify(actual)}`);
}
const observedHead=git('rev-parse','HEAD').toString().trim();
const paths=git('ls-tree','-r','--name-only',sha).toString().trim().split('\n');
const manifests=['packages/contracts/manifest.sha256','reconciliation/crm/CONTRACT-03A/r2/manifest.txt'];
const integrity=manifests.map(p=>{
  const raw=blob(p);const errors=[];const entries=[];
  for(const line of new TextDecoder('utf8',{fatal:true}).decode(raw).split('\n').filter(l=>l.trim()&&!l.startsWith('#'))) {
    const m=/^([0-9a-f]{64})  ([^\r\n]+)$/.exec(line);
    if(!m){errors.push('malformed entry');continue;}
    const [_,expected,file]=m;
    if(entries.some(e=>e.file===file))errors.push('duplicate '+file);
    try {const b=blob(file);const t=new TextDecoder('utf8',{fatal:true}).decode(b);entries.push({file,expected,actual:hash(b),match:hash(b)===expected,utf8:true,bom:b.subarray(0,3).toString('hex')==='efbbbf',cr:b.includes(13),nul:b.includes(0),replacement:t.includes('\ufffd')});}
    catch(e){errors.push('missing or invalid encoding '+file);}
  }
  return {path:p,sha256:hash(raw),entries,errors};
});
const covered=integrity.flatMap(m=>m.entries.map(e=>e.file));
const perimeter=paths.filter(p=>(p.startsWith('packages/contracts/')&&!p.endsWith('/manifest.sha256')&&!p.endsWith('/.gitignore'))||(p.startsWith('reconciliation/crm/CONTRACT-03A/r2/')&&!p.endsWith('/manifest.txt')));
check('pin checkout source/config/test/docs bytes to reviewed commit',[],()=>perimeter.filter(p=>hash(fs.readFileSync(path.join(root,p)))!==hash(blob(p))));
check('I01 all manifest entries raw-blob SHA256 match',true,()=>integrity.every(m=>!m.errors.length&&m.entries.every(e=>e.match)));
check('I01 coverage complete',[],()=>perimeter.filter(p=>!covered.includes(p)));
check('I01 covered files strict UTF8 no NUL or replacement',true,()=>integrity.every(m=>m.entries.every(e=>!e.nul&&!e.replacement)));
// Historical BOM/CRLF are recorded above; the generator itself must be LF/no BOM.
check('I01 generator LF no BOM',true,()=>integrity[0].entries.filter(e=>e.file.endsWith('/scripts/generate-manifest.mjs')).every(e=>!e.bom&&!e.cr));
const snapshot=()=>Object.fromEntries(paths.map(p=>[p,hash(fs.readFileSync(path.join(root,p)))]));
const before=snapshot();
const verify=spawnSync(process.execPath,['packages/contracts/scripts/generate-manifest.mjs','--verify'],{cwd:root,encoding:'utf8'});
fs.writeFileSync(path.join(here,'generator-verify.log'),`${verify.stdout}\n${verify.stderr}\nEXIT_CODE=${verify.status}\n`,'utf8');
check('I01 generator verify exit zero',0,()=>verify.status);
check('I01 generator verify leaves all tracked file bytes unchanged',true,()=>isDeepStrictEqual(before,snapshot()));
const token=(prefix,n=0)=>prefix+Buffer.alloc(32,n).toString('base64url');
const B={organizationId:'org-test',crmSubject:'crm-test',crmSessionHandle:'session-test',crmSessionDeadline:'2026-09-23T10:00:00Z',callbackId:'callback-test'};
const actor={kind:'DELEGATED_USER',serviceId:'svc-test',userId:'hrp-test',delegationRef:token('dg_')};
const scope='talent-context:read:identitySummary';
const epHeader={alg:'RS256',typ:'hrp-crm-service+jwt',kid:'key-1'};
const epClaims={iss:'urn:test:issuer',sub:'svc-test',serviceId:'svc-test',aud:'urn:test:query',iat:100,exp:130,jti:token('jt_'),scope:[scope],binding:B,request:{method:'POST',path:'/api/integrations/crm/talent-context/query',bodySha256:'a'.repeat(64)},actor};
const options={operation:'create',serviceId:'svc-test',expectedIssuer:'urn:test:issuer',expectedAudience:'urn:test:query',method:'POST',path:'/api/integrations/crm/talent-context/query',bodySha256:'a'.repeat(64),organizationId:B.organizationId,crmSubject:B.crmSubject,verifierNowSeconds:120};
check('F01 accepted EP01 claims must parse',true,()=>api.validateClaimsObject(epClaims).ok);
check('F01 accepted EP01 query profile must pass entrypoint',true,()=>api.validateAssertionProfile({...options,operation:'query',query:true,protectedHeader:epHeader,claims:epClaims}).ok);
const epCreate={...epClaims,aud:'urn:test:create'};delete epCreate.actor;
check('F01 accepted EP01 create profile must pass entrypoint',true,()=>api.validateAssertionProfile({...options,query:false,protectedHeader:epHeader,claims:epCreate,expectedAudience:'urn:test:create'}).ok);
// Implementation-shaped positive control isolates later negative cases;
// it is explicitly NOT an accepted wire specimen.
const implHeader={alg:'RS256',typ:'JWT',kid:'key-1'};
const implClaims={iss:'urn:test:issuer',sub:'svc-test',aud:'urn:test:query',iat:100,exp:130,jti:token('jt_'),scope, binding:{method:options.method,path:options.path,bodySha256:options.bodySha256},request:{organizationId:B.organizationId,crmSubject:B.crmSubject,delegationRef:token('dg_')}};
const validate=(c=implClaims,h=implHeader,o={})=>api.validateAssertionProfile({...options,protectedHeader:h,claims:c,...o}).ok;
check('F01 implementation-shaped control (diagnostic, not wire approval)',true,()=>validate());
check('F01 reject HS256 through entrypoint',false,()=>validate(implClaims,{...implHeader,alg:'HS256'}));
check('F01 reject generic JWT typ through entrypoint',false,()=>validate());
check('F01 reject wrong registered issuer',false,()=>validate({...implClaims,iss:'urn:attacker:issuer'}));
check('F01 reject arbitrary string scope',false,()=>validate({...implClaims,scope:'read-everything'}));
check('F01 reject nbf',false,()=>validate({...implClaims,nbf:100}));
check('F01 reject unapproved organizationIdDigest',false,()=>validate({...implClaims,organizationIdDigest:'b'.repeat(64)}));
check('F01 reject negative epoch',false,()=>validate({...implClaims,iat:-20,exp:-10},implHeader,{verifierNowSeconds:0}));
check('F01 reject unsafe integer epoch',false,()=>validate({...implClaims,iat:2**53,exp:2**53+2},implHeader,{verifierNowSeconds:2**53}));
check('F01 exp+skew boundary rejected',false,()=>validate(implClaims,implHeader,{verifierNowSeconds:160}));
check('F01 wrong body hash rejected',false,()=>validate({...implClaims,binding:{...implClaims.binding,bodySha256:'b'.repeat(64)}}));
check('F01 crit rejected',false,()=>validate(implClaims,{...implHeader,crit:[]}));
check('F01 raw escaped duplicate rejected',false,()=>api.parseAssertionHeader('{"iss":"a","\\u0069ss":"b"}').ok);
check('F01 raw nested duplicate rejected',false,()=>api.parseAssertionHeader('{"binding":{"organizationId":"a","organizationId":"b"}}').ok);
check('F01 query accepted actor cannot be stripped/rejected by claims schema',true,()=>validate({...implClaims,actor},implHeader,{query:true}));
const create={...B,requestedScopes:[scope],callbackState:token('st_')};
const exchange={...B,receipt:token('rc_')};
const cancel={...B,reason:'USER_CANCELLED'};
const revoke={...B,delegationRef:token('dg_'),reason:'USER_CANCELLED'};
check('F02 exchange excludes path id',true,()=>api.ExchangeDelegationRequestSchema.safeParse(exchange).success);
check('F02 exchange rejects body path id',false,()=>api.ExchangeDelegationRequestSchema.safeParse({...exchange,pendingRequestId:token('pd_')}).success);
check('F02 code-only delegation error',true,()=>api.DelegationErrorResponseSchema.safeParse({status:'FAILED',error:{code:'FORBIDDEN'}}).success);
check('F02 exchange result effective user mandatory',false,()=>api.ExchangeDelegationSuccessSchema.safeParse({delegationRef:token('dg_'),expiresAt:B.crmSessionDeadline}).success);
const tokenSchemas=[['PendingRequestIdSchema','pd_'],['HandoffProofSchema','hp_'],['ReceiptSchema','rc_'],['DelegationRefSchema','dg_'],['CallbackStateSchema','st_'],['JtiSchema','jt_'],['CsrfTokenSchema','cs_']];
for(const [name,prefix] of tokenSchemas) {
  for(const n of [0,128,251,255])check(`F03 ${name} canonical byte ${n}`,true,()=>api[name].safeParse(token(prefix,n)).success);
  check(`F03 ${name} pad bits reject`,false,()=>api[name].safeParse(prefix+'A'.repeat(42)+'B').success);
}
const savedAtob=globalThis.atob,savedBtoa=globalThis.btoa;
try {
  globalThis.atob=undefined;globalThis.btoa=undefined;
  for(const n of [0,128,255])check(`F03 supported Buffer fallback canonical byte ${n}`,true,()=>api.DelegationRefSchema.safeParse(token('dg_',n)).success);
} finally {globalThis.atob=savedAtob;globalThis.btoa=savedBtoa;}
for(const [name,schema,body] of [['create',api.CreateDelegationRequestSchema,create],['exchange',api.ExchangeDelegationRequestSchema,exchange],['cancel',api.CancelDelegationRequestSchema,cancel],['revoke',api.RevokeDelegationRequestSchema,revoke]]) {
  check(`F04 ${name} valid binding`,true,()=>schema.safeParse(body).success);
  for(const patch of [{callbackId:'bad id'},{crmSessionHandle:'bad\nhandle'},{crmSessionHandle:'_session'},{crmSessionHandle:'-session'},{crmSessionDeadline:'2026-02-30T10:00:00Z'},{crmSessionDeadline:'2026-09-23T17:00:00+07:00'}])check(`F04 ${name} reject ${JSON.stringify(patch)}`,false,()=>schema.safeParse({...body,...patch}).success);
}
check('F04 cleanup accepts syntactically valid past deadline',true,()=>api.CancelDelegationRequestSchema.safeParse({...cancel,crmSessionDeadline:'2020-01-01T00:00:00Z'}).success);
check('F04 effectiveHrpUserId rejects whitespace grammar',false,()=>api.ExchangeDelegationSuccessSchema.safeParse({delegationRef:token('dg_'),effectiveHrpUserId:'bad id',expiresAt:B.crmSessionDeadline}).success);
for(const [name,input,expected] of [['Arabic','علي','ع••'],['Hangul','홍길동','홍••'],['Deseret','\u{10400}\u{10401}','\u{10400}••']])check(`F05 Unicode ${name}`,expected,()=>api.redactFullName(input).redacted??null);
for(const input of ['\ufeffAlpha','A\u200bB','Alpha\tBeta','\u0301Alpha','-Alpha',"'Alpha",'Alpha-','A','\ud800Alpha','Q'+'\u0301'.repeat(254)+'b','Ab '.repeat(17).trim(),'A'.repeat(257)])check(`F05 unsafe ${JSON.stringify(input).slice(0,55)}`,false,()=>api.redactFullName(input).success);
check('F05 result byte bound',false,()=>api.IdentitySummarySchema.safeParse({schemaVersion:'1',displayOnly:true,fullNameRedacted:'•'.repeat(512)}).success);
const seg=Intl.Segmenter;
try {Intl.Segmenter=undefined;check('F05 missing segmenter omit',false,()=>api.redactFullName('Alpha').success);Intl.Segmenter=class{segment(){throw Error('synthetic');}};check('F05 throwing segmenter omit',false,()=>api.redactFullName('Alpha').success);}finally{Intl.Segmenter=seg;}
const vectorRaw=git('show','49f2dbc34cae66e8d63df5dd5d8cec0c008c4623:reconciliation/hrp/CONTRACT-02B-conformance-response/r2/REDACTION-VECTORS.json');
const vectors=JSON.parse(vectorRaw).vectors;
const fixture=JSON.parse(blob('packages/contracts/tests/fixtures/redaction-vectors.fixtures.json'));
check('F06 fixture authoritative hash correct',hash(vectorRaw),()=>fixture.provenance.authoritativeSha256);
check('F06 fixture authoritative byteCount correct',vectorRaw.length,()=>fixture.provenance.byteCount);
const vectorDeltas=vectors.flatMap(v=>{const f=fixture.vectors.find(f=>f.id===v.id);return isDeepStrictEqual(v,f)?[]:[{id:v.id,expected:v,actual:f}];});
check('F06 exact pinned vectors preserved',[],()=>vectorDeltas);
for(const v of vectors) {
  check(`F06 pinned ${v.id}`,{name:v.expectedName,unavailable:v.expectedUnavailableFields},()=>{
    const r=api.checkResultConformance(v.requested?['identitySummary']:['placementCase'],api.redactFullName(v.input));
    return {name:r.identitySummary?.fullNameRedacted??null,unavailable:v.requested?r.unavailableFields:r.unavailableFields.filter(f=>f==='identitySummary')};
  });
}
for(const field of api.CONFORMANCE_KNOWN_UNSUPPORTED)check(`F06 unsupported ${field} only when requested`,[field],()=>api.checkResultConformance([field],{success:false,reason:'unsafe'}).unavailableFields);
// S25 requires unique requested markers, not their ordering. Compare sets.
check('F06 multiple requested marker set', ['contactability','identitySummary','placementCase'],()=>api.checkResultConformance(['contactability','identitySummary','placementCase'],{success:false,reason:'unsafe'}).unavailableFields.slice().sort());
for(const code of Object.keys(api.QUERY_ERROR_HTTP_STATUS)) {
  const body={schemaVersion:'1',status:'FAILED',correlationId:'probe-0001',errors:[{code,messageKey:api.QUERY_ERROR_MESSAGE_KEY[code],retryClass:api.QUERY_ERROR_RETRY_CLASS[code]}]};
  check(`query ${code} exact triple`,'QUERY_ERROR',()=>api.parseTalentContextReadResponse(api.QUERY_ERROR_HTTP_STATUS[code],body).status);
  check(`query ${code} wrong HTTP`,'PROTOCOL_ERROR',()=>api.parseTalentContextReadResponse(418,body).status);
  check(`query ${code} wrong messageKey`,'PROTOCOL_ERROR',()=>api.parseTalentContextReadResponse(api.QUERY_ERROR_HTTP_STATUS[code],{...body,errors:[{...body.errors[0],messageKey:'wrong'}]}).status);
  check(`query ${code} command retry literal`,'PROTOCOL_ERROR',()=>api.parseTalentContextReadResponse(api.QUERY_ERROR_HTTP_STATUS[code],{...body,errors:[{...body.errors[0],retryClass:'BOUNDED_SAME_KEY'}]}).status);
}
const result={reviewedSha:sha,observedHead,observedAt:new Date().toISOString(),node:process.version,integrity,vectorHash:hash(vectorRaw),vectorBytes:vectorRaw.length,vectorDeltas,records,summary:{total:records.length,pass:records.filter(r=>r.pass).length,fail:records.filter(r=>!r.pass).length}};
fs.writeFileSync(path.join(here,'recheck-results.json'),JSON.stringify(result,null,2)+'\n','utf8');
console.log(JSON.stringify(result.summary));process.exitCode=result.summary.fail?1:0;
