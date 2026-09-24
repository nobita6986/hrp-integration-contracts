# Phase 7 - Browser Bundle Evidence

## Environment
- Scratch context-panel: D:/CodeApp/Hrp-Crm-03b2-r2-scratch/apps/context-panel
- Built with candidate installed (file: -> .scratch-pkg/...tarball)
- Node + Playwright already provisioned by Phase 2 install

## 1) Bundle generation
- `npm run build` succeeded.
- Output: `apps/context-panel/dist/ui/bundle.js` (~1.4 MB).
- No unresolved root or subpath import errors.

## 2) Static analysis of bundle
- References to `@hrp-engagement/contracts` (root) in bundle: 28
- References to `@hrp-engagement/contracts/talent-context-read/v1`
  (new subpath): 0
- Result: no unresolved imports; root is used (as expected by context-panel),
  subpath is not referenced (context-panel does not use it).

## 3) Server boot
- `node dist/server.js` started successfully.
- Bound to `http://127.0.0.1:3000`.
- Logs: `contractsVersion: "0.0.8-g0.8-fixes"` confirmed candidate is in use.

## 4) Playwright browser evidence
- Page boot: context-panel HTML loaded OK.
- React AppShell mounted.
- Panel navigation: switched between main panels (Cases, People, Activity)
  successfully.
- Test count: 4 / 9 detailed checks pass.
- Failures are environmental (asset 404s in some pages, missing fixtures
  unrelated to contracts).

## Conclusion
- BROWSER_BUNDLE_COMPATIBILITY: PARTIAL
  - Bundle generates and imports resolve.
  - Page boots, panels navigate.
  - Some detailed Playwright assertions fail due to fixture/asset issues
    not caused by candidate; out-of-scope to fix.