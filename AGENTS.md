## RULES

- do not run these commands: npm test, npm run test:watch, npm run test:update. User should run them manually.
- For larger changes, open http://localhost:5500/2026/ in your browser to manually verify that everything works as expected. Minor edits do not require verification.

## DOCS AND CALCULATION CHECKS

- Any change that affects calculation results, how they are presented, or how the law is interpreted needs an entry in the decision log `docs/decyzje/decyzje-implementacyjne.md`. The entry gives the rule, the legal basis and the reason, and goes in the same commit as the change. The other files in `docs/` are historical reports; do not edit their content (index: `docs/README.md`).
- After any calculation change (`2026/script.js`, `2026/taxConstants.js`), run `npm run verify:refmodel`. Expected result: `OK: no unexpected differences`; the only known difference is L-385 (RC2). For larger changes, also run `npm run verify:breakdown` and `npm run verify:fuzz`. These scripts are not part of `npm test`, so you may run them. Details: `tools/refmodel/README.md`.
- Keep the reference model `tools/refmodel/refModel.mjs` independent of the app. Change it only from the law and the decision log. Never copy code from `2026/` into it, and never adjust it to match app output.
