import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const dir = path.dirname(fileURLToPath(import.meta.url));
const cwd = path.resolve(dir, '../packages/contracts');
const commands = [['ci'], ['run','build'], ['test']];
const results = [];
for (const args of commands) {
  const r = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    cwd, encoding: 'utf8', shell: process.platform === 'win32',
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' }, maxBuffer: 10 * 1024 * 1024,
  });
  const file = `gate-${args.join('-')}.txt`;
  fs.writeFileSync(path.join(dir, file), `COMMAND=npm ${args.join(' ')}\nNODE=${process.version}\nEXIT=${r.status}\nSTDOUT:\n${r.stdout ?? ''}\nSTDERR:\n${r.stderr ?? ''}`, 'utf8');
  results.push({ command: 'npm ' + args.join(' '), exit: r.status, file });
  console.log(JSON.stringify(results.at(-1)));
  if (r.status !== 0) break;
}
process.exitCode = results.some(r => r.exit !== 0) ? 1 : 0;
