import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const r=spawnSync(process.execPath,[join(here,'canonical-probes.mjs')],{maxBuffer:8*1024*1024});
const dec=b=>new TextDecoder('utf8',{fatal:true}).decode(b??new Uint8Array()).replace(/\r\n/g,'\n');
writeFileSync(join(here,'canonical-probes.log'),dec(r.stdout)+'\nSTDERR:\n'+dec(r.stderr)+`\nEXIT_CODE=${r.status}\n`,'utf8');
console.log(dec(r.stdout));process.exitCode=r.status??1;
