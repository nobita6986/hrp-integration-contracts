// Build helper for the packaging candidate.
//
// Copies the compiled TypeScript output and declaration files from the
// CONTRACT-03A dev harness into this candidate's dist/talent-context-read/
// directory so that consumers can install the tarball without a workspace.
//
// Source root: ../../contracts/dist/talent-context-read/
// Target root: ../dist/talent-context-read/
//
// This script does NOT copy source (.ts) files or any DTOs. It only copies
// the emitted JavaScript and TypeScript declarations of the dev harness.

import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const candidateRoot = path.resolve(here, '..');
const harnessRoot = path.resolve(candidateRoot, '..', 'contracts');
const sourceDir = path.join(harnessRoot, 'dist');
const targetDir = path.join(candidateRoot, 'dist', 'talent-context-read');

const ENTRIES = [
  'assertion.js',
  'assertion.d.ts',
  'conformance.js',
  'conformance.d.ts',
  'delegation.js',
  'delegation.d.ts',
  'index.js',
  'index.d.ts',
  'primitives.js',
  'primitives.d.ts',
  'query-errors.js',
  'query-errors.d.ts',
  'query-parser.js',
  'query-parser.d.ts',
  'query-types.js',
  'query-types.d.ts',
  'redaction.js',
  'redaction.d.ts',
];

let copied = 0;
let totalBytes = 0;
const copiedFiles = [];

await fs.mkdir(targetDir, { recursive: true });

for (const entry of ENTRIES) {
  const src = path.join(sourceDir, entry);
  const dst = path.join(targetDir, entry);
  const data = await fs.readFile(src);
  await fs.writeFile(dst, data);
  copied += 1;
  totalBytes += data.length;
  copiedFiles.push({ name: entry, bytes: data.length });
}

console.log(`Copied ${copied} files (${totalBytes} bytes) from harness to candidate.`);
for (const f of copiedFiles) {
  console.log(`  ${f.name}  ${f.bytes} bytes`);
}
