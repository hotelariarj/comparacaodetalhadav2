# Design QA — Separação funcional da V2

- Source visual truth: canonical detail flow at https://conciliador-contabil.lovable.app/account-drilldown/1110001 and the canonical V1 Home implementation.
- Rendered implementation screenshot path: local V2 at http://127.0.0.1:4174/ (captured in the Codex in-app browser).
- Viewport comparison: 1280 × 720 CSS px, same browser surface and density
- Responsive verification: 390 × 844 CSS px
- State: Home with Ativo Circulante expanded; account action menu; Caixa Geral and Banco Conta Movimento detail states; document and AI analysis complete; accept/reject decisions.
- Full-view evidence: source and implementation captures were inspected at the same desktop browser surface; the V2 preserves the source page sequence while applying the existing Smart X/Animalia shell.
- Focused-region evidence: account summary, document-analysis states, suggestion decisions, dual ledgers, product tabs, account-group accordion and overflow menu were inspected through screenshots and accessibility snapshots.

## Findings

No actionable P0, P1 or P2 findings remain.

- Typography: hierarchy, weights and wrapping stay aligned with the existing Smart X/Animalia shell.
- Spacing and layout: KPI rhythm, accordion headers and account-card grid are consistent with the existing card system.
- Colors and tokens: all surfaces and status states use the existing Animalia semantic tokens.
- Image quality and assets: the correct TOTVS logo remains in use and interface icons come from the existing Phosphor set.
- Copy and content: the Home matches V1's groups, views, balances, daily chart and summary; the V2 detail follows the canonical Lovable content and remains a continuous page rather than V1's task-oriented tabs.
- Interaction: expanding groups, switching Patrimonial/Por Sistema, opening the three-dot menu, choosing Comparação detalhada, returning to Home, document analysis, expanding validation details, AI analysis and accept/reject all work.
- Dynamic account context: Banco Conta Movimento renders `1.1.2.001`, R$ 850.000,00 / R$ 849.200,00 / R$ 800,00; Caixa Geral renders `1.1.1.001`, R$ 25.000,00 / R$ 25.000,00 / R$ 0,00. Ledger account labels update with the selected account.
- Responsiveness: the Home stacks cleanly and has no document-level horizontal overflow (`scrollWidth = innerWidth = 390`).

## Comparison history

1. Replaced V2's divergent Home with the canonical V1 Home information architecture and interactions.
2. Corrected the account-context bug and verified two different account selections end to end.
3. Compared the continuous V2 detail with the Lovable source on desktop and mobile and preserved the V2-only structure.
4. Found that Home could carry its previous scroll position into the detail; added an account-change scroll reset and retested from `scrollY = 787.5` to `scrollY = 0`.
5. Mobile verification at 390 × 844 confirmed stacked summary/content cards and usable navigation.

## Verification

- Production build passed.
- Interaction audit passed.
- Sites packaging tests passed.
- Browser flow passed in desktop and mobile viewports, with no console warnings or errors.

## Follow-up polish

- P3: production data may later benefit from search and status filters when the number of account groups grows.

final result: passed
