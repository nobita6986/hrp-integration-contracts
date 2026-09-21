#!/usr/bin/env node
/** CONTRACT-01: inspect committed source; never execute application/test code.
 * Default is read-only verification. --write writes ONLY the inventory and evidence appendix.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseline = '72643356a0d1355f9dccc3921b47c990ea9c31c1';
const output = path.join(root, 'docs/contracts/neutral-contract-evidence.json');
const argv = process.argv.slice(2);
if (argv.some(x => !['--write', '--check'].includes(x)) || argv.length > 1) {
  throw new Error('Usage: node scripts/contract-inventory.mjs [--check|--write]');
}
const require = createRequire(path.join(root, 'packages/contracts/package.json'));
const ts = require('typescript');
const git = (args, options = {}) => execFileSync('git', args, {
  cwd: root, maxBuffer: 64 * 1024 * 1024, ...options,
});
const sha256 = b => createHash('sha256').update(b).digest('hex');
const files = git(['ls-tree', '-r', '-z', baseline]).toString('utf8').split('\0')
  .filter(Boolean).map(row => {
    const [meta, file] = row.split('\t');
    const [mode, kind, blob] = meta.split(' ');
    return { file, mode, kind, blob };
  }).filter(x => x.kind === 'blob').sort((a, b) => a.file.localeCompare(b.file, 'en'));
const selected = files.filter(x => /^(apps|packages)\//.test(x.file) &&
  (/\.(?:ts|tsx|js|mjs|cjs)$/.test(x.file) || /(?:package(?:-lock)?\.json|tsconfig\.json)$/.test(x.file)));
const batch = git(['cat-file', '--batch'], { input: selected.map(x => x.blob).join('\n') + '\n' });
let cursor = 0;
const source = new Map();
for (const record of selected) {
  const end = batch.indexOf(10, cursor);
  const [blob, kind, sizeText] = batch.subarray(cursor, end).toString().split(' ');
  const size = Number(sizeText);
  if (blob !== record.blob || kind !== 'blob' || !Number.isInteger(size)) throw new Error('Invalid git batch response');
  const bytes = batch.subarray(end + 1, end + 1 + size);
  cursor = end + 1 + size + 1;
  source.set(record.file, { ...record, sha256: sha256(bytes), text: bytes.toString('utf8') });
}
const syntax = new Map();
for (const [file, data] of source) {
  if (/\.(?:ts|tsx|js|mjs|cjs)$/.test(file)) syntax.set(file,
    ts.createSourceFile(file, data.text, ts.ScriptTarget.Latest, true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : /\.(?:mjs|cjs|js)$/.test(file) ? ts.ScriptKind.JS : ts.ScriptKind.TS));
}
const line = (sf, node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
const loc = (file, node) => ({ file, line: line(syntax.get(file), node), blob: source.get(file).blob });
const walk = (node, visit) => { visit(node); ts.forEachChild(node, child => walk(child, visit)); };
const packageName = '@hrp-engagement/contracts';
const contractPaths = [...syntax.keys()].filter(x => x.startsWith('packages/contracts/src/'));

// Compiler resolves export-star chains and aliases from baseline source, not dist.
const host = ts.createCompilerHost({});
const originalGetSource = host.getSourceFile.bind(host);
const rel = filename => path.relative(root, filename).replaceAll('\\', '/');
host.getSourceFile = (filename, lang, onError, createNew) => {
  const data = source.get(rel(filename));
  return data ? ts.createSourceFile(filename, data.text, lang, true) : originalGetSource(filename, lang, onError, createNew);
};
const exists = host.fileExists.bind(host);
host.fileExists = filename => source.has(rel(filename)) || exists(filename);
const read = host.readFile.bind(host);
host.readFile = filename => source.get(rel(filename))?.text ?? read(filename);
const program = ts.createProgram(contractPaths.map(x => path.join(root, x)), {
  module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext,
  target: ts.ScriptTarget.ES2022, noEmit: true, skipLibCheck: true,
}, host);
const checker = program.getTypeChecker();
const entry = program.getSourceFile(path.join(root, 'packages/contracts/src/index.ts'));
const rootSymbol = checker.getSymbolAtLocation(entry);
if (!rootSymbol) throw new Error('Cannot resolve contracts root');
function targetOf(symbol) {
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}
const publicExports = checker.getExportsOfModule(rootSymbol).map(symbol => {
  const target = targetOf(symbol);
  const declarations = (target.declarations ?? []).filter(d => rel(d.getSourceFile().fileName).startsWith('packages/contracts/src/'));
  return {
    name: symbol.name, targetName: target.name,
    typeOnly: !(target.flags & ts.SymbolFlags.Value),
    declarations: declarations.map(d => {
      const sf = d.getSourceFile(); const file = rel(sf.fileName);
      return { file, line: sf.getLineAndCharacterOfPosition(d.getStart(sf)).line + 1,
        blob: source.get(file)?.blob, kind: ts.SyntaxKind[d.kind] };
    }),
  };
}).sort((a, b) => a.name.localeCompare(b.name, 'en'));
if (publicExports.some(x => x.declarations.length === 0)) throw new Error('Unresolved public export');
const publicByName = new Map(publicExports.map(x => [x.name, x]));
const imports = [];
const allImports = [];
const unresolvedPatterns = [];
const testCases = [];

function isContractModule(spec, file) {
  if (spec === packageName || spec.startsWith(packageName + '/')) return true;
  return spec.startsWith('.') && /^packages\/contracts\/(src|dist)\//.test(path.posix.normalize(path.posix.join(path.posix.dirname(file), spec)));
}
function addBinding(file, node, module, imported, local, typeOnly, kind) {
  const record = { ...loc(file, node), module, imported, local, typeOnly, kind };
  allImports.push(record);
  if (isContractModule(module, file)) imports.push(record);
}
for (const [file, sf] of syntax) {
  walk(sf, node => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const spec = node.moduleSpecifier.text, clause = node.importClause;
      if (!clause) addBinding(file, node, spec, '*side-effect*', null, false, 'side-effect');
      else {
        if (clause.name) addBinding(file, node, spec, 'default', clause.name.text, clause.isTypeOnly, 'default');
        const bindings = clause.namedBindings;
        if (bindings && ts.isNamespaceImport(bindings)) addBinding(file, bindings, spec, '*', bindings.name.text, clause.isTypeOnly, 'namespace');
        if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements)
          addBinding(file, item, spec, (item.propertyName ?? item.name).text, item.name.text, clause.isTypeOnly || item.isTypeOnly, 'named');
      }
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const spec = node.moduleSpecifier.text;
      if (node.exportClause && ts.isNamedExports(node.exportClause)) for (const item of node.exportClause.elements)
        addBinding(file, item, spec, (item.propertyName ?? item.name).text, item.name.text, node.isTypeOnly || item.isTypeOnly, 're-export');
      else addBinding(file, node, spec, '*', null, node.isTypeOnly, 're-export-star');
    }
    if (ts.isCallExpression(node)) {
      const name = node.expression.getText(sf);
      if (/^(test|it|describe)(\.(skip|only|todo))?$/.test(name) && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0]))
        testCases.push({ ...loc(file, node), kind: name, label: node.arguments[0].text });
      if ((node.expression.kind === ts.SyntaxKind.ImportKeyword || name === 'require') && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) {
        const spec = node.arguments[0].text;
        let parent = node.parent;
        if (ts.isAwaitExpression(parent)) parent = parent.parent;
        if (ts.isVariableDeclaration(parent) && ts.isObjectBindingPattern(parent.name)) {
          for (const el of parent.name.elements) addBinding(file, el, spec,
            (el.propertyName ?? el.name).getText(sf), el.name.getText(sf), false, 'dynamic-destructure');
        } else if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
          addBinding(file, node, spec, '*', parent.name.text, false, 'dynamic-namespace');
        } else if (ts.isArrayLiteralExpression(parent) && ts.isCallExpression(parent.parent) &&
                   parent.parent.expression.getText(sf) === 'Promise.all') {
          let declaration = parent.parent.parent;
          if (ts.isAwaitExpression(declaration)) declaration = declaration.parent;
          const index = parent.elements.indexOf(node);
          const element = ts.isVariableDeclaration(declaration) && ts.isArrayBindingPattern(declaration.name)
            ? declaration.name.elements[index] : undefined;
          if (element && ts.isBindingElement(element) && ts.isObjectBindingPattern(element.name)) {
            for (const el of element.name.elements) addBinding(file, el, spec,
              (el.propertyName ?? el.name).getText(sf), el.name.getText(sf), false, 'dynamic-promise-all');
          } else if (isContractModule(spec, file)) unresolvedPatterns.push({ ...loc(file, node), module: spec, expression: node.getText(sf) });
        } else if (isContractModule(spec, file)) {
          unresolvedPatterns.push({ ...loc(file, node), module: spec, expression: node.getText(sf) });
        }
      }
    }
  });
}

// Syntactic evidence only: import declaration is NOT proof of parse execution.
for (const binding of imports) {
  const sf = syntax.get(binding.file);
  binding.publicSymbolFound = binding.imported.startsWith('*') ? null : publicByName.has(binding.imported);
  binding.references = [];
  binding.validatorCalls = [];
  binding.namespaceMembers = [];
  if (!binding.local || binding.kind.startsWith('re-export')) continue;
  walk(sf, node => {
    if (binding.imported === '*' && ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === binding.local) {
      binding.namespaceMembers.push({ name: node.name.text, line: line(sf, node), publicSymbolFound: publicByName.has(node.name.text) });
    }
    if (ts.isIdentifier(node) && node.text === binding.local) {
      let parent = node.parent, typeContext = false, declaration = false;
      while (parent && parent !== sf) {
        if (ts.isImportDeclaration(parent)) { declaration = true; break; }
        if (ts.isTypeNode(parent) || ts.isInterfaceDeclaration(parent)) typeContext = true;
        parent = parent.parent;
      }
      if (!declaration) binding.references.push({ line: line(sf, node), typeContext });
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
        ['parse', 'safeParse', 'parseAsync', 'safeParseAsync'].includes(node.expression.name.text)) {
      const receiver = node.expression.expression;
      if ((ts.isIdentifier(receiver) && receiver.text === binding.local) ||
          (ts.isPropertyAccessExpression(receiver) && ts.isIdentifier(receiver.expression) && receiver.expression.text === binding.local)) {
        binding.validatorCalls.push({ line: line(sf, node), method: node.expression.name.text,
          receiver: receiver.getText(sf), expression: node.getText(sf).slice(0, 300) });
      }
    }
  });
}

const modules = contractPaths.map(file => {
  const sf = syntax.get(file), data = source.get(file);
  const exports = [];
  for (const node of sf.statements) {
    if (ts.isExportDeclaration(node)) {
      exports.push({ ...loc(file, node), kind: 're-export', text: node.getText(sf) });
    } else if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      if (ts.isVariableStatement(node)) for (const d of node.declarationList.declarations)
        exports.push({ ...loc(file, d), kind: 'value', name: d.name.getText(sf), initializer: d.initializer?.getText(sf).slice(0, 240) ?? null });
      else exports.push({ ...loc(file, node), kind: ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) ? 'type' : 'value',
        name: node.name?.getText(sf) ?? 'default', declarationKind: ts.SyntaxKind[node.kind] });
    }
  }
  const names = new Set(publicExports.filter(x => x.declarations.some(d => d.file === file)).map(x => x.name));
  const uses = imports.filter(x => names.has(x.imported));
  return { file, blob: data.blob, sha256: data.sha256, exports,
    publicNames: [...names].sort(),
    namedConsumers: [...new Set(uses.filter(x => !x.file.startsWith('packages/contracts/')).map(x => x.file))].sort(),
    testImportEvidence: uses.filter(x => /\/tests?\//.test(x.file)).map(x => ({ file: x.file, line: x.line, symbol: x.imported,
      referenceLines: [...new Set(x.references?.map(r => r.line) ?? [])], validatorCalls: x.validatorCalls ?? [] })),
  };
});
const activeTests = files.filter(x => /^packages\/contracts\/tests\/[^/]+\.test\.mjs$/.test(x.file)).map(x => x.file);
const referenceTestFiles = files.filter(x => x.file.startsWith('packages/contracts/tests/') && !activeTests.includes(x.file)).map(x => x.file);
const consumers = imports.filter(x => !x.file.startsWith('packages/contracts/'));
const packageFiles = [...source.values()].filter(x => /\/package\.json$/.test(x.file)).map(x => {
  const pkg = JSON.parse(x.text);
  return { file: x.file, blob: x.blob, name: pkg.name, version: pkg.version, scripts: pkg.scripts,
    contractDependency: pkg.dependencies?.[packageName] ?? pkg.devDependencies?.[packageName] ?? null };
});
const result = {
  formatVersion: 1, baseline, generator: 'scripts/contract-inventory.mjs', typescriptVersion: ts.version,
  method: 'Git baseline blobs + TypeScript AST; compiler resolves contracts root export aliases. No application or test execution.',
  limitations: [
    'Consumer references/parse calls are syntactic evidence, not control-flow proof or test coverage/pass claims; aliases passed through helpers and shadowed names require manual tracing.',
    'Direct package imports, contract-relative imports/re-exports and literal dynamic imports are scanned; transitive consumer graph and computed imports are not claimed exhaustive.',
    'Non-type import syntax may be used only in a type context; actual runtime behavior is not inferred from syntax alone.',
    'Root export checker uses pinned baseline source and installed TypeScript; dependency declarations are local, not evidence of HRP support.',
  ],
  counts: { contractSourceFiles: modules.length, sourceModulesExcludingIndex: modules.length - 1,
    publicExportNames: publicExports.length, typeOnlyPublicNames: publicExports.filter(x => x.typeOnly).length,
    activeContractTestFiles: activeTests.length, scannedCodeFiles: syntax.size,
    directConsumerFiles: new Set(consumers.map(x => x.file)).size },
  packageFiles, modules, publicExports, imports, unresolvedPatterns, activeTests, referenceTestFiles,
  testCases: testCases.filter(x => activeTests.includes(x.file)),
  history: git(['log', '--format=%H %s', baseline, '--', 'packages/contracts']).toString('utf8').trim().split('\n'),
};
const encoded = JSON.stringify(result, null, 2) + '\n';
const inventoryPath = path.join(root, 'docs/contracts/neutral-contract-inventory.md');
const md = [];
const add = (...lines) => md.push(...lines, '');
add('# CONTRACT-01 — Neutral contract inventory',
  '', 'Status: READY FOR TIER-0 INVENTORY REVIEW. Provisional classification only.',
  '', `Baseline: \`${baseline}\`. Package: \`@hrp-engagement/contracts@0.0.8-g0.8-fixes\`.`,
  '', 'Repo contract không tự định nghĩa lại domain của hai app. Gate 0 freeze phía CRM không phải bằng chứng HRP đã triển khai hoặc chấp nhận wire contract.');
add('## 1. Evidence and reproducibility',
  '', 'Generated from committed Git blobs, not stale dist or uncommitted runtime files. Every module/export/import record in `neutral-contract-evidence.json` carries a Git blob and source line where applicable.',
  '', `Evidence appendix SHA-256: \`${sha256(Buffer.from(encoded))}\`.`,
  '', `TypeScript AST/compiler: ${ts.version}. ${syntax.size} code files inspected.`,
  '', 'Read-only verification: `node scripts/contract-inventory.mjs --check`. Intentional regeneration: `node scripts/contract-inventory.mjs --write` (writes these two documents only).',
  '', 'No application, contract fixture or HRP runtime tests are executed by this inventory tool. Local TypeScript dependencies are needed to run the extractor.');
add('## 2. Counts and counting units',
  '', `- ${modules.length} contract source files: ${modules.length - 1} modules plus index.ts; ${modules.filter(m => m.file.includes('/commands/')).length} command-directory files.`,
  `- ${publicExports.length} distinct root public export names: ${publicExports.filter(x => x.typeOnly).length} type-only names and ${publicExports.filter(x => !x.typeOnly).length} value-capable names. Re-export aliases are resolved; this is not a count of commands or schemas.`,
  `- ${activeTests.length} active test files selected by the package test glob. Fixture counts in old CHANGELOG/audit reports are historical, not a current test run.`,
  `- ${new Set(consumers.map(x => x.file)).size} direct consumer files outside packages/contracts, including tests. Transitive consumers are not included in this count.`);
add('## 3. Authority and provisional classification',
  '', '- ACCEPTED_SHARED = 0 verified symbols/modules. No bilateral acceptance artifact has been supplied.',
  '- HRP_IMPLEMENTED = 0 verified symbols/modules. No pinned HRP baseline and runtime evidence have been supplied.',
  '- TARGET_ONLY is the default for candidate wire schemas, types and validators below. It means present in CRM baseline, not approved by HRP.',
  '- OWNER_DECISION_BLOCKED: merge-review explicitly exposes proposed/unavailable contracts and unresolved dependencies; actor delegation and capability authority also require reconciliation before promotion.',
  '- CRM_INTERNAL candidate: Vietnamese display-label maps/errorMessagesVi are presentation conveniences. This recommendation does not authorize moving or deleting them. PACKAGE_VERSION is package metadata, not a wire command.',
  '- UNKNOWN ownership/split: ports, gateway test hooks/clock interfaces, ConstantsSnapshot composition, AI proposal/provider-config responsibility and KPI phase placement. Keep draft pending reconciliation.',
  '- DEPRECATED_OR_CONFLICTING: do not label current source deprecated without evidence. Excluded synthetic/legacy test artifacts are listed separately; their historical expectations are not authoritative.',
  '', 'These are symbol-group overlays, not disjoint module counts. No fabricated totals are obtained by adding statuses to the 29-file count.',
  '', 'HRP owns canonical identity/labor/application/placement/workforce lifecycle and permissions. CRM owns chat/CSKH, campaign/agent workflow, internal UI and automation state. Shared wire shape does not transfer domain authority. Shared hosting does not authorize direct HRP DB access.',
  '', 'Stable neutral root remains EMPTY at Stage 0. Existing CRM exports remain unchanged. A future neutral export requires explicit ACCEPTED_SHARED evidence.');
add('## 4. Module inventory', '', 'All names below come from AST declarations. Complete resolved root symbols and declaration locations are in appendix.publicExports; full module exports/re-exports are in appendix.modules. Imported-test evidence is not coverage or execution proof.');
for (const [i, m] of modules.entries()) {
  const localNames = m.exports.filter(x => x.name).map(x => `${x.name} (L${x.line}; ${x.kind})`);
  const status = m.file.endsWith('/index.ts') ? 'Package export facade; existing CRM surface only.' :
    m.file.endsWith('/merge-review.ts') ? 'OWNER_DECISION_BLOCKED: proposed/unavailable review and merge boundary; retain markers.' :
    m.file.endsWith('/ports.ts') ? 'UNKNOWN ownership split: port DTOs versus application abstractions; no neutral promotion.' :
    'TARGET_ONLY by default; symbol-group qualifications in §3 apply.';
  add(`### 4.${i + 1} ${m.file}`, '', `Git blob: \`${m.blob}\`. Source SHA-256: \`${m.sha256}\`.`, '', status,
    '', `Local declarations (${localNames.length}): ${localNames.join('; ') || 'none'}.`,
    '', `Resolved root names declared here: ${m.publicNames.length}. Direct named consumer files: ${m.namedConsumers.length}.`);
  const tests = [...new Set(m.testImportEvidence.map(t => `${t.file}:${t.line}`))];
  add('Test import locations (active and reference artifacts; see §6): ' + (tests.join('; ') || 'None found by direct named-import matching; not proof of missing tests.') + '.');
}
add('## 5. Direct consumer map', '', 'T = explicit type-only syntax. V = value-capable import syntax, not proof of execution. R = direct syntactic parse/safeParse call. Imported schemas can also be composed into local schemas without direct parse calls. Appendix includes reference lines and namespace members.');
for (const file of [...new Set(consumers.map(x => x.file))].sort()) {
  const bindings = consumers.filter(x => x.file === file);
  add(`### ${file}`, '', `Git blob: \`${bindings[0].blob}\`.`,
    '', ...bindings.map(b => `- ${b.typeOnly ? 'T' : 'V'} L${b.line}: \`${b.imported}\` as \`${b.local ?? b.imported}\` from \`${b.module}\` (${b.kind}).`));
  const calls = bindings.flatMap(b => b.validatorCalls.map(c => `- R L${c.line}: \`${c.receiver}.${c.method}(…)\`.`));
  add(...(calls.length ? [...new Set(calls)] : ['No direct imported-validator parse call found; no claim about transitive/manual validation.']));
}
add('## 6. Test artifacts', '', 'Package script: `npm run build && node --test tests/*.test.mjs`.', '', 'Active glob files:', '', ...activeTests.map(f => `- ${f}`),
  '', 'Other tracked test-directory artifacts (not selected directly by that glob; helpers can be imported by tests):', '', ...referenceTestFiles.map(f => `- ${f}`),
  '', 'The appendix testCases list contains AST test declarations, not a runtime fixture count. Namespace imports and helper-composed validators can cover more symbols than the module-level named-import map shows.');
add('## 7. Corrections to prior inventory',
  '', '- packages/config/src/types.ts imports SCHEMA_VERSION as a value and uses it in schema composition. The earlier ProviderConfig/GatewayTier/AiProviderConfig type-only import claim was incorrect.',
  '- packages/integration-store contains explicit type imports from contracts. Absence of direct imported parse calls does not mean absence of manual validation.',
  '- integration-worker shared-types imports contract validators and also declares a local gateway transport wrapper. It is not wholly disconnected from the shared package; wrapper semantic reconciliation remains pending.',
  '- Scheduling is consumed by the CORE/1.13 assistant. It must not be described as uniformly unwired.',
  '- Merge/review input/result schemas have active tests in fixtures-fix-f1-f5.test.mjs. Prior claims of no test file/coverage evidence were incorrect; see appendix imports and testCases.',
  '- No KpiSnapshot export is present in the resolved root surface. Do not classify that invented symbol as an implemented module.',
  '- Zod schema exports are runtime validator values; inferred TypeScript types are separate declarations. A runtime schema is not HRP runtime implementation.');
add('## 8. Pending reconciliation evidence',
  '', '- CRM_CONTRACT_GAP_REPORT.md and THIN_SLICE_CAPABILITY_MATRIX.md: pending HRP-side evidence; do not invent method acceptance or capability keys.',
  '- HRP baseline commit/version and accepted module list: pending. A future hrp-contract-baseline.json must cite supplied evidence, not a CRM assumption.',
  '- Authority hierarchy/P0-C discovery: pending cross-repo reconciliation.',
  '- Actor delegation/authentication, DNC canonical mapping, review/merge availability and delivery semantics: pending authoritative HRP decisions.',
  '- RecordClientInteraction, ConstantsSnapshot, SecretPort/other ports, KPI namespace and AI proposal/provider config ownership: pending allocation/reconciliation.',
  '', 'UNKNOWN means evidence missing. OWNER_DECISION_BLOCKED means an identified semantic choice needs its authorized decision-maker. Neither status permits implementation or stable promotion.');
add('## 9. History and future extraction proposal', '', 'Actual package history at baseline:', '', ...result.history.map(h => `- ${h}`),
  '', 'The package was introduced by one snapshot commit. This is not evidence that subtree extraction fails. No split/extraction has been attempted in this task.',
  '', 'After explicit authorization, try git subtree split for packages/contracts in an isolated checkout and verify source/history before pushing. Do not invent a history-percentage threshold or discard provenance.',
  '', 'Target repo proposed by Owner: https://github.com/nobita6986/hrp-integration-contracts.git. Its live remote state was not queried in this inventory task.',
  '', 'Later neutral bootstrap remains DRAFT_RECONCILIATION with empty stable root until bilateral acceptance. No consumer migration, CRM package removal, version/exports change, publish or tag is authorized here.');
add('## 10. Verification limitations', '', ...result.limitations.map(x => `- ${x}`),
  '- Computed imports, symbol shadowing and helper alias/control-flow paths need targeted follow-up when deciding migrations.',
  '- AST import/export evidence demonstrates source presence, not correct business behavior, coverage completeness or successful runtime execution.',
  '- Historical 385/398 fixture counts are not reproduced by this task. No new PASS or independent audit verdict is issued.');
add('## 11. Change boundaries and handoff',
  '', 'This task changes only this inventory, its JSON evidence appendix and the inspection script. Preserve the pre-existing docs/contracts/inventory.md delta. Frozen contracts, runtime apps, dependencies, old manifests and Git history remain unchanged.',
  '', 'No bootstrap, split, commit, push, tag, publish, merge, deployment or HRP runtime work. STOP at READY FOR TIER-0 INVENTORY REVIEW. CONTRACT-02 requires a separate brief.');
const inventory = md.join('\n');
if (argv.includes('--write')) {
  fs.writeFileSync(output, encoded, 'utf8');
  fs.writeFileSync(inventoryPath, inventory, 'utf8');
  console.log('Wrote inventory and evidence appendix.');
} else {
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== encoded) throw new Error('Evidence missing or stale; run --write intentionally.');
  if (!fs.existsSync(inventoryPath) || fs.readFileSync(inventoryPath, 'utf8') !== inventory) throw new Error('Inventory missing or stale; run --write intentionally.');
  console.log('Evidence matches baseline; verification read-only.');
}
console.log(JSON.stringify(result.counts));
console.log('Appendix SHA-256: ' + sha256(Buffer.from(encoded)));
