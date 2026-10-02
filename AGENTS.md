# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## V2 design decision

The Home is intentionally shared with V1: it must keep the same information architecture, Patrimonial/Por Sistema views, four patrimonial groups, expandable account cards, account action menu, daily overview, summary, and route into the selected account. Express it through the Smart X shell and updated Animalia tokens/components already present in this project.

The account-level detailed comparison is intentionally different from V1. Its canonical content and interaction source is `https://conciliador-contabil.lovable.app/account-drilldown/1110001`: preserve the account summary, document-validation states, AI reconciliation suggestions, accept/reject decisions, and the two detailed ledgers in one continuous page. The selected Home account must be passed into this screen so code, name, balances, difference, status, and accounting ledger context never fall back silently to Caixa Geral. Do not copy V1's task-oriented, tabbed detail workspace into V2.
