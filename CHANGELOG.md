# vt-helper

## 1.0.2

### Patch Changes

- 089df45: Update dev dependencies and GitHub Actions to their latest versions (eslint 10, vitest 5, prettier 3.9, jsdom 30, @changesets/cli 3, typescript-eslint 8.69, actions/checkout@v7, actions/setup-node@v7, actions/upload-pages-artifact@v5, actions/deploy-pages@v5, changesets/action@v2.1.1). TypeScript stays on the 5.x line since typescript-eslint doesn't support TypeScript 7 yet. No runtime or API changes.

## 1.0.1

### Patch Changes

- 4c4150f: Pin npm to v11 in release workflow to fix OIDC trusted publishing
- a350888: Pin esbuild to a patched version via npm overrides to resolve a low-severity Dependabot advisory (arbitrary file read on Windows dev server, GHSA-g7r4-m6w7-qqqr). Dev-only dependency; no runtime impact.
