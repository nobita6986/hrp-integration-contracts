import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(here, 'manifest.sha256');
const files = fs.readdirSync(here, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name !== 'manifest.sha256')
  .map((entry) => entry.name)
  .sort();

const rows = files.map((name) => {
  const raw = fs.readFileSync(path.join(here, name));
  const hash = createHash('sha256').update(raw).digest('hex');
  return `${hash}  ${name}`;
});
fs.writeFileSync(output, rows.join('\n') + '\n', 'utf8');
console.log(`WROTE=${output}`);
console.log(`ENTRY_COUNT=${rows.length}`);
