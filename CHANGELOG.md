# vt-helper

## 1.0.1

### Patch Changes

- 4c4150f: Pin npm to v11 in release workflow to fix OIDC trusted publishing
- a350888: Pin esbuild to a patched version via npm overrides to resolve a low-severity Dependabot advisory (arbitrary file read on Windows dev server, GHSA-g7r4-m6w7-qqqr). Dev-only dependency; no runtime impact.
