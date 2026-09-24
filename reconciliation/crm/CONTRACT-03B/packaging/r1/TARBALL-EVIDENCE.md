# CONTRACT-03B.1 - Tarball evidence

## Tarball metadata

| Field | Value |
|-------|-------|
| filename | hrp-engagement-contracts-0.0.0-candidate.0.tgz |
| package | @hrp-engagement/contracts |
| version | 0.0.0-candidate.0 |
| bytes | 27 949 |
| SHA-256 | 7c394f74bfa16458bb67d414ff2373e27fb2fb934606a82b3f04e8127f0e87c0 |
| npm-registry shasum (sha1) | aaa23def3c0247a77da75b87ea9474bc82f9da2c |
| npm-registry integrity | sha512-HTULQC93jO5VA[...]CvfddNg3ZFLTA== |
| file count | 20 |
| unpacked size | 129 392 bytes (129.4 kB) |
| package size | 27 949 bytes (27.9 kB) |

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
byte size (27 949 bytes) and the same SHA-256.

Tarball excluded from git by `packages/publish-candidate/.gitignore`:

```
node_modules/
dist/
*.tgz
```
