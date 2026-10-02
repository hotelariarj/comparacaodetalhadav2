# Smart X — Comparação Detalhada V2

Implementação responsiva da comparação por conta baseada na rota canônica `account-drilldown/1110001`, preservando seu conteúdo e comportamento dentro do shell Smart X e do Design System Animalia atualizado.

## O que está incluído

- Shell Smart X validado no Figma: header TOTVS, abas, barra de contexto e navegação da jornada.
- Home de conciliação com indicadores, grupos expansíveis e cards de contas.
- Menu de três pontos que abre a comparação detalhada em uma nova aba interna.
- Resumo da conta com saldo contábil, valor do sistema, diferença e status.
- Validação de cinco documentos com estados vazio, processamento e resultado.
- Sugestões de conciliação com confiança, justificativa e ações de aceitar/rejeitar.
- Razão Analítico e Relatório do Sistema Financeiro com os registros da referência.
- Feedbacks de sucesso e contadores atualizados durante as decisões.
- Tokens semânticos `--ani-*` e fonte TOTVS Pro Variable.
- Dados de demonstração derivados de `DemoProduto/Package`.

## Executar

```bash
npm install
npm run dev
```

## Validar

```bash
npm run build
npm run test:interactions
npm run test:sites
```

O relatório visual e funcional está em `design-qa.md`.

## Arquivos principais

- `src/App.jsx` — shell Smart X e navegação do protótipo.
- `src/AccountDrilldown.jsx` — comparação detalhada V2 e seus estados interativos.
- `src/styles.css` — layout e responsividade.
- `src/tokens.css` — tokens Smart X/Animalia consumidos pelo protótipo.
- `src/data/` — mocks do DemoProduto.
- `public/assets/` — fonte e logotipo oficiais usados na réplica.
