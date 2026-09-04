---
"vt-helper": patch
---

Pin esbuild to a patched version via npm overrides to resolve a low-severity Dependabot advisory (arbitrary file read on Windows dev server, GHSA-g7r4-m6w7-qqqr). Dev-only dependency; no runtime impact.
