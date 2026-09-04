---
"vt-helper": patch
---

Update dev dependencies and GitHub Actions to their latest versions (eslint 10, vitest 5, prettier 3.9, jsdom 30, @changesets/cli 3, typescript-eslint 8.69, actions/checkout@v7, actions/setup-node@v7, actions/upload-pages-artifact@v5, actions/deploy-pages@v5, changesets/action@v2.1.1). TypeScript stays on the 5.x line since typescript-eslint doesn't support TypeScript 7 yet. No runtime or API changes.
