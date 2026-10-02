import { useEffect, useState } from "react";
import {
  ArrowLeft, ArrowSquareOut, ArrowsClockwise, CaretDown, Check, CheckCircle, DotsThreeVertical,
  FileArrowUp, Info, Sparkle, SpinnerGap, WarningCircle, X,
} from "@phosphor-icons/react";

const ledgerRows = [
  { date: "14/08/2024", document: "DOC-001", description: "Depósito Cliente ABC Ltda", meta: "Conta: 1.1.02.001", value: "R$ 25.000,00", status: "OK" },
  { date: "15/08/2024", document: "DOC-002", description: "Pagamento Fornecedor XYZ", meta: "Conta: 1.1.02.001", value: "-R$ 12.000,00", status: "Divergente" },
  { date: "16/08/2024", document: "DOC-003", description: "Transferência TED Recebida", meta: "Conta: 1.1.02.001", value: "R$ 8.500,00", status: "Divergente" },
  { date: "17/08/2024", document: "DOC-004", description: "Pagamento Taxa Bancária", meta: "Conta: 1.1.02.001", value: "-R$ 45,00", status: "Divergente" },
  { date: "18/08/2024", document: "DOC-005", description: "Recebimento Cliente Premium Corp", meta: "Conta: 1.1.02.001", value: "R$ 15.000,00", status: "Divergente" },
  { date: "19/08/2024", document: "DOC-006", description: "Pagamento Salários", meta: "Conta: 1.1.02.001", value: "-R$ 28.000,00", status: "OK" },
  { date: "20/08/2024", document: "DOC-007", description: "Depósito Cliente DEF", meta: "Conta: 1.1.02.001", value: "R$ 12.000,00", status: "OK" },
  { date: "20/08/2024", document: "DOC-008", description: "Pagamento Fornecedor ABC Materiais", meta: "Conta: 1.1.02.001", value: "-R$ 5.500,00", status: "Divergente" },
];

const systemRows = [
  { date: "14/08/2024", document: "DOC-001", description: "Depósito Cliente ABC Ltda", meta: "Sistema: SYS-FIN", value: "R$ 25.000,00", status: "OK" },
  { date: "15/08/2024", document: "DOC-002", description: "Pagamento Fornecedor XYZ", meta: "Sistema: SYS-FIN", value: "-R$ 10.500,00", status: "Divergente" },
  { date: "16/08/2024", document: "DOC-003", description: "TED Recebida Cliente", meta: "Sistema: SYS-FIN", value: "R$ 8.500,00", status: "Divergente" },
  { date: "17/08/2024", document: "DOC-004", description: "Taxa Bancária", meta: "Sistema: SYS-FIN", value: "-R$ 45,00", status: "Divergente" },
  { date: "19/08/2024", document: "DOC-005", description: "Recebimento Cliente Premium Corp", meta: "Sistema: SYS-FIN", value: "R$ 15.000,00", status: "Divergente" },
  { date: "19/08/2024", document: "DOC-006", description: "Pagamento Salários", meta: "Sistema: SYS-FIN", value: "-R$ 28.000,00", status: "OK" },
  { date: "20/08/2024", document: "DOC-007", description: "Depósito Cliente DEF", meta: "Sistema: SYS-FIN", value: "R$ 12.000,00", status: "OK" },
];

const documents = [
  { name: "NF_001_ClienteABC.pdf", checks: 3, score: 95, state: "valid", label: "Válido", value: "R$ 25.000,00", date: "14/08/2024", number: "NF-001", entity: "Cliente ABC Ltda" },
  { name: "Comprovante_Pagto_XYZ.pdf", checks: 3, score: 72, state: "warning", label: "Atenção", value: "R$ 10.500,00", date: "15/08/2024", number: "CP-2024-002", entity: "Fornecedor XYZ" },
  { name: "TED_Recebida_170824.png", checks: 2, score: 88, state: "valid", label: "Válido", value: "R$ 8.500,00", date: "16/08/2024", number: "TED-003", entity: "—" },
  { name: "Boleto_Salarios.pdf", checks: 3, score: 35, state: "invalid", label: "Inválido", value: "R$ 15.000,00", date: "09/08/2024", number: "BOL-456", entity: "—" },
  { name: "Recibo_ClienteDEF.jpg", checks: 2, score: 91, state: "valid", label: "Válido", value: "R$ 12.000,00", date: "20/08/2024", number: "REC-007", entity: "Cliente DEF" },
];

const initialSuggestions = [
  { id: 1, kind: "Valor + Data", score: 91, title: "Lote de 3 transações = R$ 6.000,00", sourceDoc: "LOTE-2024-001", sourceDate: "14/08/2024", sourceDescription: "Pagamentos Lote - Fornecedores Diversos", sourceValue: "R$ 6.000,00", accountingDoc: "CTB-8845", accountingDate: "14/08/2024", accountingDescription: "Pgto Fornecedores - Lote Agosto", accountingValue: "R$ 6.000,00", reason: "A soma dos valores de 3 movimentos no Sistema Origem corresponde exatamente ao valor único na Contabilidade. Datas idênticas indicam provável pagamento via lote bancário." },
  { id: 2, kind: "Padrão", score: 88, title: "Diferença de data: 4 dias (D+3)", sourceDoc: "DOC-008", sourceDate: "01/09/2024", sourceDescription: "TED Recebida Cliente ABC Ltda", sourceValue: "R$ 25.000,00", accountingDoc: "DOC-008", accountingDate: "28/08/2024", accountingDescription: "TED Recebida Cliente ABC Ltda", accountingValue: "R$ 25.000,00", reason: "Descrição e valores idênticos. A diferença cruza a virada do mês e respeita a lógica de dias úteis." },
  { id: 3, kind: "Documento", score: 85, title: "Diferença de valor: R$ 150,00 (1,5%)", sourceDoc: "DOC-7789", sourceDate: "21/08/2024", sourceDescription: "Recebimento Cliente XYZ Comércio", sourceValue: "R$ 10.000,00", accountingDoc: "DOC-7789", accountingDate: "21/08/2024", accountingDescription: "Recebimento Cliente XYZ Comércio", accountingValue: "R$ 10.150,00", reason: "Data e documento coincidem. A diferença pode resultar de alteração na planilha contábil realizada por maria.silva." },
];

function useAnalysisState() {
  const [state, setState] = useState("empty");
  useEffect(() => {
    if (state !== "loading") return undefined;
    const timer = window.setTimeout(() => setState("ready"), 900);
    return () => window.clearTimeout(timer);
  }, [state]);
  return [state, setState];
}

const fallbackAccount = { code: "1.1.2.001", routeId: "1120001", name: "Banco Conta Movimento", balance: "R$ 850.000,00", systemValue: "R$ 849.200,00", difference: "R$ 800,00", status: "Divergente", tone: "negative", attachments: [] };

export default function AccountDrilldown({ account = fallbackAccount, onBack, onToast, versionLabel = "" }) {
  const [documentState, setDocumentState] = useAnalysisState();
  const [suggestionState, setSuggestionState] = useAnalysisState();
  const [expandedDocument, setExpandedDocument] = useState(null);
  const [suggestions, setSuggestions] = useState(initialSuggestions.map((item) => ({ ...item, decision: "pending" })));

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [account?.code]);

  const decide = (id, decision) => {
    setSuggestions((items) => items.map((item) => item.id === id ? { ...item, decision } : item));
    onToast?.(decision === "accepted" ? "Sugestão aceita e vinculada à conciliação." : "Sugestão rejeitada sem alterar os registros.");
  };
  const pending = suggestions.filter((item) => item.decision === "pending").length;
  const accepted = suggestions.filter((item) => item.decision === "accepted").length;
  const selectedAccount = account || fallbackAccount;
  const isMatched = selectedAccount.tone === "positive";
  const accountLedgerRows = ledgerRows.map((row) => ({ ...row, meta: `Conta: ${selectedAccount.code}` }));

  return <main id="main-content" className="main-content account-drilldown">
    <nav className="breadcrumb" aria-label="Você está em"><button type="button" onClick={onBack}>Home</button><span>/</span><span>{selectedAccount.code} {selectedAccount.name}</span></nav>
    <section className="drilldown-heading">
      <button type="button" className="icon-button" aria-label="Voltar para a Home" onClick={onBack}><ArrowLeft /></button>
      <div><div className="heading-line"><h1>Comparação Detalhada</h1>{versionLabel && <span className="analysis-tag success">{versionLabel}</span>}</div><p>{selectedAccount.code} - {selectedAccount.name}</p></div>
    </section>

    <section className="drilldown-card account-summary" aria-labelledby="account-summary-title">
      <h2 id="account-summary-title"><FileArrowUp />Resumo da Conta</h2>
      <dl><div><dt>Saldo Contábil</dt><dd>{selectedAccount.balance}</dd></div><div><dt>Valor Sistema</dt><dd>{selectedAccount.systemValue}</dd></div><div><dt>Diferença</dt><dd className={isMatched ? "positive" : "negative"}>{selectedAccount.difference}</dd></div><div><dt>Status</dt><dd><span className={`status ${isMatched ? "status--ok" : "status--valor"}`}>{isMatched ? <CheckCircle weight="fill" /> : <WarningCircle weight="fill" />}{selectedAccount.status}</span></dd></div></dl>
    </section>

    <section className="drilldown-card document-analysis" aria-labelledby="document-analysis-title">
      <header><h2 id="document-analysis-title"><FileArrowUp />Análise de Documentos com IA</h2>{documentState === "ready" && <button className="button secondary" onClick={() => setDocumentState("loading")}><ArrowsClockwise />Nova análise</button>}</header>
      {documentState === "empty" && <div className="analysis-empty"><FileArrowUp size={46} /><strong>Validar Documentos Anexados</strong><p>A IA irá analisar os documentos anexados e verificar se são compatíveis com as transações (valores, datas e descrições).</p><button className="button primary" onClick={() => setDocumentState("loading")}><FileArrowUp />Analisar Documentos com IA</button></div>}
      {documentState === "loading" && <div className="analysis-empty"><SpinnerGap className="spin" size={42} /><strong>Analisando documentos...</strong><p>Extraindo dados e validando informações com as transações.</p></div>}
      {documentState === "ready" && <div className="document-results">
        <div className="document-kpis"><span><strong>5</strong>Total</span><span className="positive"><strong>3</strong>Válidos</span><span className="warning"><strong>1</strong>Atenção</span><span className="negative"><strong>1</strong>Inválido</span></div>
        {documents.map((document) => <article key={document.name} className={`document-result ${document.state}`}>
          <div className="document-result-head"><span><CheckCircle weight="fill" /><span><strong>{document.name}</strong><small>{document.checks} verificações realizadas</small></span></span><span className="document-score"><strong>{document.score}%</strong><em>{document.label}</em><i><b style={{ width: `${document.score}%` }} /></i></span></div>
          <dl><div><dt>Valor</dt><dd>{document.value}</dd></div><div><dt>Data</dt><dd>{document.date}</dd></div><div><dt>Nº Doc</dt><dd>{document.number}</dd></div><div><dt>Entidade</dt><dd>{document.entity}</dd></div></dl>
          <button className="button ghost document-details" onClick={() => setExpandedDocument(expandedDocument === document.name ? null : document.name)}><CaretDown className={expandedDocument === document.name ? "rotate" : ""} />Ver detalhes ({document.checks})</button>
          {expandedDocument === document.name && <div className="document-checks"><span><Check />Valor reconhecido</span><span><Check />Data compatível</span><span><Info />Documento relacionado à conta</span></div>}
        </article>)}
      </div>}
    </section>

    <section className="drilldown-card suggestion-analysis" aria-labelledby="suggestion-analysis-title">
      <header><h2 id="suggestion-analysis-title"><Sparkle weight="fill" />Sugestões de Conciliação com IA</h2><div>{suggestionState === "ready" && <button className="button ghost" onClick={() => { setSuggestions(initialSuggestions.map((item) => ({ ...item, decision: "pending" }))); setSuggestionState("empty"); }}><ArrowsClockwise />Reiniciar</button>}<button className="button primary" disabled={suggestionState === "loading"} onClick={() => setSuggestionState("loading")}><Sparkle />{suggestionState === "loading" ? "Analisando..." : "Analisar com IA"}</button></div></header>
      {suggestionState === "empty" && <div className="analysis-empty compact"><Sparkle size={42} /><strong>Nenhuma análise realizada</strong><p>Clique em “Analisar com IA” para buscar sugestões de conciliação automaticamente.</p></div>}
      {suggestionState === "loading" && <div className="analysis-empty compact"><SpinnerGap className="spin" size={42} /><strong>Analisando transações divergentes...</strong><p>A IA está comparando valores, datas e descrições para sugerir correspondências.</p></div>}
      {suggestionState === "ready" && <div className="suggestion-results">
        <div className="suggestion-kpis"><span>3 sugestões</span><span>{accepted} aceitas</span><span>{pending} pendentes</span></div>
        {suggestions.map((item) => <article key={item.id} className={`match-suggestion ${item.decision}`}>
          <header><div><Sparkle weight="fill" /><strong>Sugestão de Match</strong><span>{item.kind}</span></div><strong>{item.score}%</strong></header>
          <h3>{item.title}</h3>
          <div className="match-columns"><section><small>Sistema Origem</small><code>{item.sourceDoc}</code><span>{item.sourceDate}</span><strong>{item.sourceDescription}</strong><b>{item.sourceValue}</b></section><section><small>Contabilidade</small><code>{item.accountingDoc}</code><span>{item.accountingDate}</span><strong>{item.accountingDescription}</strong><b>{item.accountingValue}</b></section></div>
          <p><Sparkle weight="fill" /> <strong>Motivo:</strong> {item.reason}</p>
          {item.decision === "pending" ? <footer><button className="button primary" onClick={() => decide(item.id, "accepted")}><Check />Aceitar</button><button className="button secondary" onClick={() => decide(item.id, "rejected")}><X />Rejeitar</button></footer> : <footer><span className={`decision ${item.decision}`}>{item.decision === "accepted" ? <><CheckCircle weight="fill" />Sugestão aceita</> : <><X />Sugestão rejeitada</>}</span></footer>}
        </article>)}
      </div>}
    </section>

    <section className="comparison-ledgers" aria-label="Comparação entre razão analítico e sistema financeiro">
      <Ledger title="Razão Analítico (Contábil)" rows={accountLedgerRows} icon={<CheckCircle />} actions onInspect={(row) => onToast?.(`Detalhes de ${row.document} abertos.`)} />
      <Ledger title="Relatório Sistema (Sistema Financeiro)" rows={systemRows} icon={<WarningCircle />} action={<button className="button secondary" onClick={() => onToast?.("Sistema Financeiro aberto em modo demonstrativo.")}><ArrowSquareOut />Abrir Sistema</button>} />
    </section>
  </main>;
}

function Ledger({ title, rows, icon, action, actions = false, onInspect }) {
  return <section className="drilldown-card ledger-card"><header><h2>{icon}{title}</h2>{action}</header><div className="ledger-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>{actions ? "Ações" : "Status"}</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.document}-${row.date}`} className={row.status === "OK" ? "matched" : "divergent"}><td><strong>{row.date}</strong><small>{row.document}</small></td><td><strong>{row.description}</strong><small>{row.meta}</small></td><td className="number">{row.value}</td><td><div className="ledger-status-cell"><span className={`status ${row.status === "OK" ? "status--ok" : "status--valor"}`}>{row.status === "OK" ? <CheckCircle weight="fill" /> : <WarningCircle weight="fill" />}{row.status}</span>{actions && <button type="button" className="icon-button" aria-label={`Ações de ${row.document}`} onClick={() => onInspect?.(row)}><DotsThreeVertical weight="bold" /></button>}</div></td></tr>)}</tbody></table></div></section>;
}
