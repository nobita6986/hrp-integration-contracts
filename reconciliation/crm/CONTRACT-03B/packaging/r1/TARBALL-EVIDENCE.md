# CONTRACT-03B.1 - Tarball evidence

## Tarball metadata

| Field | Value |
|-------|-------|
| filename | hrp-engagement-contracts-0.0.0-candidate.0.tgz |
| package | @hrp-engagement/contracts |
| version | 0.0.0-candidate.0 |
| bytes | 28 571 |
| SHA-256 | 4fc0cef16e3dbf9f5412ccb9771e30ce3acd8bc438f9b7bd527395eac35f363a |
| npm-registry shasum (sha1) | 3523ec849cd3262485641644a988eb5ee9aaffa9 |
| npm-registry integrity | sha512-HTULQC93jO5VA[...]CvfddNg3ZFLTA== |
| file count | 20 |
| unpacked size | 131 919 bytes (131.9 kB) |
| package size | 28 571 bytes (28.6 kB) |

## Tarball is a TEST ARTIFACT

- NOT npm-published
- NOT pushed to GitHub Releases
- NOT Git-tagged
- NOT committed as a binary blob (only its SHA-256 is referenced
  in this evidence; the file lives only at
  packages/publish-candidate/hrp-engagement-contracts-0.0.0-candidate.0.tgz
  on disk, and is excluded from git by .gitignore `*.tgz`)

## Reproducible build

From a clean checkout at the parent commit of the candidate SHA:

```bash
# 1. dev harness
cd packages/contracts
npm ci
npm run build
npm test    # 288/288 PASS, plus generator test 23/23

# 2. copy compiled output into the packaging candidate
cd ../publish-candidate
node scripts/copy-from-harness.mjs   # 18 files (125 923 bytes)

# 3. pack
npm pack --dry-run                    # inventory check
npm pack                              # produces tarball
# SHA-256:
node -e "require('crypto').createHash('sha256')
  .update(require('fs').readFileSync('hrp-engagement-contracts-0.0.0-candidate.0.tgz'))
  .digest('hex')"
```

## Tarball SHA-256

```
4fc0cef16e3dbf9f5412ccb9771e30ce3acd8bc438f9b7bd527395eac35f363a  hrp-engagement-contracts-0.0.0-candidate.0.tgz
```

## Inventory

See PACKAGE-INVENTORY.md for the full 20-file unpacked inventory.

## Verification

Re-running `npm pack` from the same SHA must produce the same tarball
byte size (28 571 bytes) and the same SHA-256.

Tarball excluded from git by `packages/publish-candidate/.gitignore`:

```
node_modules/
dist/
*.tgz
```
