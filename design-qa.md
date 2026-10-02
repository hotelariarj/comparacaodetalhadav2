# Design QA — Home e Comparação Detalhada V2

- Source visual truth: Smart X/Animalia shell from the deployed V2 at https://hotelariarj.github.io/comparacaodetalhadav2/
- Rendered implementation: local V2 Home at http://127.0.0.1:4175/
- Viewport comparison: 1280 × 720 CSS px, same browser surface and density
- Responsive verification: 390 × 844 CSS px
- State: Home with Ativo Circulante expanded; account action menu; detailed-comparison tab open; return to Conciliações
- Full-view evidence: the deployed Smart X detail screen and the new Home were emitted together at the same desktop viewport.
- Focused-region evidence: product tabs, account-group accordion, account cards, overflow menu and canonical drilldown were inspected through screenshots and accessibility snapshots.

## Findings

No actionable P0, P1 or P2 findings remain.

- Typography: hierarchy, weights and wrapping stay aligned with the existing Smart X/Animalia shell.
- Spacing and layout: KPI rhythm, accordion headers and account-card grid are consistent with the existing card system.
- Colors and tokens: all surfaces and status states use the existing Animalia semantic tokens.
- Image quality and assets: the correct TOTVS logo remains in use and interface icons come from the existing Phosphor set.
- Copy and content: group, account, balance, difference and status labels are realistic and internally consistent.
- Interaction: expanding groups, opening the three-dot menu, choosing Comparação detalhada, creating the tab and returning to Conciliações all work.
- Responsiveness: the Home stacks cleanly and has no document-level horizontal overflow (`scrollWidth = innerWidth = 390`).

## Comparison history

1. Added the Home using the existing Smart X shell and Animalia component language.
2. Desktop comparison found no actionable visual mismatch in the shared shell, tokens or density.
3. Mobile verification confirmed the drawer stays off-canvas, KPI cards stack and the page remains within the viewport.

## Verification

- Production build passed.
- Interaction audit passed.
- Sites packaging tests passed.
- Browser flow passed in desktop and mobile viewports.

## Follow-up polish

- P3: production data may later benefit from search and status filters when the number of account groups grows.

final result: passed
