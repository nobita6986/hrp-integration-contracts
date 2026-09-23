import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.HRP_REVIEW_ROOT ?? execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: here, encoding: 'utf8' }).trim();
const packageRoot = path.join(root, 'packages', 'contracts');
const node = process.execPath;
const npm = 'npm';
const npmCommand = (args) => process.platform === 'win32'
  ? { command: process.env.ComSpec ?? 'cmd.exe', args: ['/d', '/s', '/c', `npm ${args.join(' ')}`] }
  : { command: npm, args };
const commands = [
  { id: 'npm-ci', ...npmCommand(['ci']), cwd: packageRoot, log: 'npm-ci.log' },
  { id: 'build', ...npmCommand(['run', 'build']), cwd: packageRoot, log: 'build.log' },
  { id: 'test', ...npmCommand(['test']), cwd: packageRoot, log: 'test.log' },
  { id: 'manifest-verify', command: node, args: ['packages/contracts/scripts/generate-manifest.mjs', '--verify'], cwd: root, log: 'manifest-verify.log' },
  { id: 'canonical-probes', command: node, args: [path.join(here, 'canonical-probes.mjs')], cwd: root, log: 'canonical-probes.log' },
  { id: 'regression-probes', command: node, args: [path.join(here, 'regression-probes.mjs')], cwd: root, log: 'regression-probes.log' },
];

const environment = [
  `reviewed_sha=${execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()}`,
  `node=${process.version}`,
  `npm=${process.platform === 'win32'
    ? execFileSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'npm --version'], { cwd: root, encoding: 'utf8' }).trim()
    : execFileSync(npm, ['--version'], { cwd: root, encoding: 'utf8' }).trim()}`,
  `platform=${process.platform}`,
  `arch=${process.arch}`,
];
fs.writeFileSync(path.join(here, 'environment.txt'), environment.join('\n') + '\n', 'utf8');

let failed = false;
for (const item of commands) {
  const result = spawnSync(item.command, item.args, { cwd: item.cwd, encoding: 'utf8', env: { ...process.env, HRP_REVIEW_ROOT: root } });
  const output = [
    `COMMAND=${item.command} ${item.args.join(' ')}`,
    `CWD=${item.cwd}`,
    result.stdout ?? '',
    result.stderr ?? '',
    `EXIT_CODE=${result.status}`,
  ].join('\n').replace(/\r\n/g, '\n');
  fs.writeFileSync(path.join(here, item.log), output, 'utf8');
  if (result.status !== 0) {
    failed = true;
    console.error(`${item.id}: FAIL (${result.status})`);
  } else {
    console.log(`${item.id}: PASS`);
  }
}

process.exitCode = failed ? 1 : 0;
