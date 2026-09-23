import { spawnSync, execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const root = process.env.HRP_REVIEW_ROOT ?? execFileSync('git',['rev-parse','--show-toplevel'],{cwd:here,encoding:'utf8'}).trim();
const pkg = resolve(root, 'packages/contracts');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const stages = [
  ['npm-ci', npm, ['ci'], pkg],
  ['build', npm, ['run', 'build'], pkg],
  ['test', npm, ['test'], pkg],
];
for (const [name, cmd, args, cwd] of stages) {
  const start = new Date().toISOString();
  const r = spawnSync(cmd, args, { cwd, shell: process.platform === 'win32', env: {...process.env, NO_COLOR:'1', FORCE_COLOR:'0'}, timeout: 180000, maxBuffer: 20*1024*1024 });
  const decode = b => new TextDecoder('utf-8',{fatal:true}).decode(b ?? new Uint8Array()).replace(/\r\n/g,'\n');
  const log = `START=${start}\nNODE=${process.version}\nCOMMAND=${cmd} ${args.join(' ')}\nCWD=${cwd}\n${decode(r.stdout)}\nSTDERR:\n${decode(r.stderr)}\nEXIT_CODE=${r.status}\nEND=${new Date().toISOString()}\n`;
  writeFileSync(resolve(here, name+'.log'),log,'utf8');
  console.log(JSON.stringify({stage:name,exit:r.status, error:r.error?.message, tail:decode(r.stdout).split('\n').slice(-12)}));
  if(r.status !== 0) { process.exitCode = 1; break; }
}
