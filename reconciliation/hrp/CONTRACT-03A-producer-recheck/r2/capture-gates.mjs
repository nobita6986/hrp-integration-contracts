import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..', '..');
const packageDir = path.join(root, 'packages', 'contracts');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const env = { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' };

const gates = [
  { name: 'npm-ci', command: npm, args: ['ci'], cwd: packageDir, expected: 0 },
  { name: 'npm-run-build', command: npm, args: ['run', 'build'], cwd: packageDir, expected: 0 },
  { name: 'npm-test', command: npm, args: ['test'], cwd: packageDir, expected: 0 },
  {
    name: 'producer-corrected-expectations',
    command: process.execPath,
    args: [path.join(here, 'producer-recheck.mjs')],
    cwd: root,
    expected: 1,
  },
];

const results = [];
for (const gate of gates) {
  const run = spawnSync(gate.command, gate.args, {
    cwd: gate.cwd,
    env,
    encoding: 'utf8',
    shell: process.platform === 'win32' && gate.command === npm,
    maxBuffer: 16 * 1024 * 1024,
  });
  const output = [
    `COMMAND=${gate.command} ${gate.args.join(' ')}`,
    `NODE=${process.version}`,
    `EXIT=${run.status}`,
    `EXPECTED_EXIT=${gate.expected}`,
    'STDOUT:',
    run.stdout ?? '',
    'STDERR:',
    run.stderr ?? '',
  ].join('\n');
  const file = `gate-${gate.name}.txt`;
  fs.writeFileSync(path.join(here, file), output, 'utf8');
  results.push({
    name: gate.name,
    command: `${gate.command} ${gate.args.join(' ')}`,
    exit: run.status,
    expectedExit: gate.expected,
    captured: file,
    expectationMet: run.status === gate.expected,
  });
  console.log(JSON.stringify(results.at(-1)));
  if (!results.at(-1).expectationMet) break;
}

fs.writeFileSync(
  path.join(here, 'gate-summary.json'),
  JSON.stringify({ observedAt: new Date().toISOString(), node: process.version, results }, null, 2) + '\n',
  'utf8',
);
process.exitCode = results.every((result) => result.expectationMet) ? 0 : 1;
