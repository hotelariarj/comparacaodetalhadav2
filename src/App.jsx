import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowsClockwise, Bell, CaretDown, CaretLeft, CaretRight, ChartBar, Check,
  CheckCircle, ClockCounterClockwise, DotsThreeVertical, DownloadSimple,
  ArrowSquareOut, DotsNine, FileArrowUp, Funnel, GearSix, House,
  Info, LinkSimple, List, MagnifyingGlass, MapPin, MapTrifold, Paperclip,
  SidebarSimple, Sparkle, SpinnerGap, WarningCircle, X,
} from "@phosphor-icons/react";
import demo from "./data/detailed-comparison.sample.json";
import aiResults from "./data/ai-analysis-result.sample.json";
import AccountDrilldown from "./AccountDrilldown";

const primaryRows = [
  { id: "LOTE-2024-001", date: "14/08/2024", description: "Pagamentos Lote - Fornecedores Diversos", origin: 6000, accounting: 6800, difference: "+R$ 800,00", status: "Divergente", issue: "valor", ai: true },
  { id: "DOC-2024-001", date: "02/08/2024", description: "Pagamento Cliente Alpha", origin: 125, accounting: 125, difference: "data", status: "Divergente", issue: "data", ai: true },
  { id: "DOC-2024-005", date: "06/08/2024", description: "Recebimento Cliente Gamma", origin: 2850, accounting: 2850, difference: "data", status: "Divergente", issue: "data" },
  { id: "DOC-2024-003", date: "08/08/2024", description: "Pagamento Fornecedor Beta", origin: 1240, accounting: 1240, difference: "data", status: "Divergente", issue: "data" },
  { id: "DOC-2024-007", date: "20/08/2024", description: "Pagamento de imposto", origin: 780, accounting: 780, difference: "data", status: "Divergente", issue: "data" },
  { id: "DOC-2024-002", date: "26/08/2024", description: "Recebimento Fatura 1234", origin: 87.5, accounting: 87.5, difference: "data", status: "Divergente", issue: "data" },
  { id: "DOC-2024-009", date: "30/08/2024", description: "Pagamento de aluguel", origin: 4200, accounting: 4200, difference: "data", status: "Divergente", issue: "data" },
  { id: "DOC-2024-004", date: "03/08/2024", description: "Tarifa bancária", origin: 35.9, accounting: null, difference: "—", status: "Não encontrada", issue: "missing", ai: true },
  { id: "DOC-2024-010", date: "09/08/2024", description: "Recebimento de vendas", origin: 1180, accounting: null, difference: "—", status: "Não encontrada", issue: "missing" },
  { id: "DOC-2024-006", date: "21/08/2024", description: "Estorno de pagamento", origin: 430, accounting: null, difference: "—", status: "Não encontrada", issue: "missing" },
];

const demoRows = demo.entries
  .flatMap((entry) => entry.rows.map((row) => ({ entry, row })))
  .slice(0, 32)
  .map(({ entry, row }, index) => ({
    id: row.accounting.documentId || row.system.documentId || `MOV-${String(index + 11).padStart(3, "0")}`,
    date: row.accounting.date || row.system.date || "—",
    description: row.accounting.description || row.system.description || entry.accountName,
    origin: row.system.value || 0,
    accounting: row.accounting.id ? row.accounting.value : null,
    difference: "R$ 0,00",
    status: "Conciliada",
    issue: "ok",
  }));

const allRows = [...primaryRows, ...demoRows].slice(0, 42);
const suggestionTargetIds = { match_001: "LOTE-2024-001", match_002: "DOC-2024-001", match_003: "DOC-2024-004" };
const money = (value) => value == null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const navItems = [
  { label: "Home", icon: House },
  { label: "Comparação Detalhada", icon: ChartBar, active: true },
  { label: "Logs de Auditoria", icon: ClockCounterClockwise },
  { label: "Cadastros", icon: List },
  { label: "Mapa do Projeto", icon: MapTrifold },
];

function IconButton({ label, children, className = "", type = "button", ...props }) {
  return <button type={type} className={`icon-button ${className}`} aria-label={label} title={label} {...props}>{children}</button>;
}

function Status({ row }) {
  const Icon = row.issue === "ok" ? CheckCircle : row.issue === "missing" ? Info : WarningCircle;
  return <span className={`status status--${row.issue}`}><Icon size={16} weight="fill" />{row.status}</span>;
}

function AppShell({ children, currentNav, onNavigate, detailTabOpen }) {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [contextExpanded, setContextExpanded] = useState(false);
  const [company, setCompany] = useState("02 - Bourbon Curitiba Convention Hotel");
  const [companyDraft, setCompanyDraft] = useState(company);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerMenu, setHeaderMenu] = useState(null);
  const [environment, setEnvironment] = useState("Produção");
  const chooseEnvironment = (value) => {
    setEnvironment(value);
    setHeaderMenu(null);
    window.dispatchEvent(new CustomEvent("smartx-toast", { detail: `Ambiente alterado para ${value}.` }));
  };
  const navigate = (label) => { onNavigate(label); setMobileMenuOpen(false); };
  const tabs = ["TOTVS News", "Meu TOTVS", "Conciliações", ...(detailTabOpen ? ["Comparação Detalhada"] : [])];
  const toggleContext = () => {
    setCompanyDraft(company);
    setContextExpanded((value) => !value);
  };
  const applyContext = () => {
    setCompany(companyDraft);
    setContextExpanded(false);
    window.dispatchEvent(new CustomEvent("smartx-toast", { detail: "Empresa atualizada com sucesso." }));
  };
  return <div className={`app-shell ${menuExpanded ? "menu-expanded" : ""} ${contextExpanded ? "context-expanded" : ""}`}>
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    <header className="global-header">
      <IconButton className="mobile-menu-trigger" label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMobileMenuOpen((value) => !value)}>{mobileMenuOpen ? <X size={22} /> : <List size={22} />}</IconButton>
      <img src={`${import.meta.env.BASE_URL}assets/logo-totvs-dark.svg`} alt="TOTVS" />
      <div className="header-menu-anchor"><button type="button" className="environment" aria-label="Trocar ambiente" aria-expanded={headerMenu === "environment"} onClick={() => setHeaderMenu(headerMenu === "environment" ? null : "environment")}><span>{environment}</span><strong>Conciliador Contábil</strong><CaretDown size={16} /></button>{headerMenu === "environment" && <div className="header-popover environment-popover" role="menu"><strong>Ambiente</strong>{["Produção", "Homologação"].map((value) => <button type="button" role="menuitemradio" aria-checked={environment === value} key={value} onClick={() => chooseEnvironment(value)}>{environment === value && <Check weight="bold" />}{value}</button>)}</div>}</div>
      <div className="header-actions"><IconButton label="Aplicativos" onClick={() => navigate("Home")}><DotsNine size={22} /></IconButton><div className="header-menu-anchor"><IconButton label="Notificações" aria-expanded={headerMenu === "notifications"} onClick={() => setHeaderMenu(headerMenu === "notifications" ? null : "notifications")}><Bell size={22} /></IconButton>{headerMenu === "notifications" && <div className="header-popover notification-popover" role="dialog" aria-label="Notificações"><strong>Notificações</strong><p><span className="notification-dot" />A análise inteligente encontrou 3 sugestões.</p><button type="button" onClick={() => { setHeaderMenu(null); navigate("Comparação Detalhada"); }}>Ver comparação</button></div>}</div><IconButton className="lynn-action" label="Lynn, assistente TOTVS" onClick={() => window.dispatchEvent(new CustomEvent("smartx-toast", { detail: "Lynn está pronta para ajudar nesta rotina." }))}><Sparkle size={22} /></IconButton><div className="header-menu-anchor"><button type="button" className="avatar" aria-label="Perfil: Rafael R. Oliveira" aria-expanded={headerMenu === "profile"} onClick={() => setHeaderMenu(headerMenu === "profile" ? null : "profile")}>RO</button>{headerMenu === "profile" && <div className="header-popover profile-popover" role="menu"><strong>Rafael R. Oliveira</strong><span>Administrador</span><button type="button" role="menuitem" onClick={() => { setHeaderMenu(null); window.dispatchEvent(new CustomEvent("smartx-toast", { detail: "Preferências do perfil abertas." })); }}>Preferências</button></div>}</div></div>
    </header>
    <nav className="product-tabs" aria-label="Abas abertas">{tabs.map((tab) => {
      const destination = tab === "Conciliações" ? "Home" : tab;
      const active = currentNav === destination;
      return <button type="button" key={tab} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => tab === "TOTVS News" || tab === "Meu TOTVS" ? window.dispatchEvent(new CustomEvent("smartx-toast", { detail: `${tab} selecionada.` })) : navigate(destination)}>{tab}{tab === "Comparação Detalhada" && <X size={16} aria-hidden="true" />}</button>;
    })}</nav>
    <div className={`context-bar ${contextExpanded ? "expanded" : ""}`}>
      <div className="context-bar-row">
        <button type="button" className="context-options" aria-expanded={contextExpanded} aria-controls="context-options-panel" onClick={toggleContext}>{contextExpanded ? "Ocultar opções" : "Exibir opções"} <CaretDown className={contextExpanded ? "rotate" : ""} size={18} /></button>
        {!contextExpanded && <span className="context-company"><MapPin size={22} /><span>Empresa: <strong>{company}</strong></span></span>}
        <button type="button" className="context-shortcuts" onClick={() => window.dispatchEvent(new CustomEvent("smartx-toast", { detail: "Atalhos da rotina abertos." }))}>Atalhos <ArrowSquareOut size={20} /></button>
      </div>
      {contextExpanded && <div className="context-options-panel" id="context-options-panel">
        <div className="context-options-content">
          <label>Empresa
            <select value={companyDraft} onChange={(event) => setCompanyDraft(event.target.value)}>
              <option>02 - Bourbon Curitiba Convention Hotel</option>
              <option>01 - Matriz Curitiba</option>
              <option>03 - Bourbon Cataratas do Iguaçu</option>
            </select>
          </label>
        </div>
        <footer><button type="button" className="button ghost" onClick={() => { setCompanyDraft(company); setContextExpanded(false); }}>Cancelar</button><button type="button" className="button primary" onClick={applyContext}>Aplicar</button></footer>
      </div>}
    </div>
    {mobileMenuOpen && <button type="button" className="mobile-menu-scrim" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)} />}
    <aside className={`journey-menu ${mobileMenuOpen ? "mobile-open" : ""}`} aria-label="Menu da jornada">
      <div className="mobile-menu-header"><strong>Conciliador Contábil</strong><span>{environment}</span></div>
      <IconButton label={menuExpanded ? "Recolher menu" : "Expandir menu"} onClick={() => setMenuExpanded((value) => !value)}><SidebarSimple size={22} /></IconButton>
      <nav>{navItems.map(({ label }) => <button type="button" key={label} className={currentNav === label ? "active" : ""} title={label} aria-current={currentNav === label ? "page" : undefined} onClick={() => navigate(label)}><span>{label}</span></button>)}</nav>
      <button type="button" className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}><X />Fechar menu</button>
    </aside>
    {children}
  </div>;
}

export function App() {
  const [currentNav, setCurrentNav] = useState("Home");
  const [accountDrilldown, setAccountDrilldown] = useState(false);
  const [detailTabOpen, setDetailTabOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(DEFAULT_ACCOUNT);
  const [drilldownSource, setDrilldownSource] = useState("overview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [actionsFor, setActionsFor] = useState(null);
  const [details, setDetails] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiState, setAiState] = useState("ready");
  const [progress, setProgress] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [justification, setJustification] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [toast, setToast] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [scope, setScope] = useState("1.1.2.001");
  const [period, setPeriod] = useState("ago/2024");
  const [updatedAt, setUpdatedAt] = useState("08:12");
  const [calloutVisible, setCalloutVisible] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState({ values: true, status: true, document: true });
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [linkTarget, setLinkTarget] = useState(null);
  const [resolvedIds, setResolvedIds] = useState(new Set());
  const [suggestionOpen, setSuggestionOpen] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set(aiResults.suggestions.slice(0, 3).map((item) => item.id)));
  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState(new Set());
  const modalInput = useRef(null);

  useEffect(() => { const listener = (event) => setToast(event.detail); window.addEventListener("smartx-toast", listener); return () => window.removeEventListener("smartx-toast", listener); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 3600); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { if (reviewOpen) requestAnimationFrame(() => modalInput.current?.focus()); }, [reviewOpen]);
  useEffect(() => { setMoreActionsOpen(false); }, [aiOpen, filterOpen, viewOpen, currentNav]);
  useEffect(() => {
    if (!moreActionsOpen) return;
    const closeOutside = (event) => { if (!event.target.closest(".footer-menu-anchor")) setMoreActionsOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [moreActionsOpen]);
  useEffect(() => {
    if (aiState !== "processing") return;
    setProgress(14);
    const timer = setInterval(() => setProgress((current) => {
      if (current >= 92) { clearInterval(timer); setTimeout(() => setAiState("ready"), 500); return 100; }
      return Math.min(100, current + 13);
    }), 420);
    return () => clearInterval(timer);
  }, [aiState]);

  const displayedRows = useMemo(() => allRows.map((row) => resolvedIds.has(row.id) ? { ...row, status: "Conciliada", issue: "ok", difference: "R$ 0,00" } : row), [resolvedIds]);
  const filtered = useMemo(() => displayedRows.filter((row) => `${row.id} ${row.description}`.toLowerCase().includes(query.toLowerCase()) && (statusFilter === "Todos" || row.status === statusFilter)), [displayedRows, query, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const rows = filtered.slice((page - 1) * 10, page * 10);
  const chooseFilter = (value) => { setStatusFilter(value); setFilterOpen(false); setPage(1); };
  const toggleSelected = (id) => setSelected((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const approveReview = () => { setReviewed(true); setReviewOpen(false); setJustification(""); setToast("Conciliação marcada como revisada com sucesso."); };
  const togglePageSelection = (checked) => setSelected((current) => { const next = new Set(current); rows.forEach((row) => checked ? next.add(row.id) : next.delete(row.id)); return next; });
  const finishLink = (row) => { setResolvedIds((current) => new Set(current).add(row.id)); setSelected((current) => { const next = new Set(current); next.delete(row.id); return next; }); setLinkTarget(null); setDetails(null); setToast(`${row.id} vinculado e conciliado com sucesso.`); };
  const exportCsv = () => {
    const header = ["Data", "Descrição", "Documento", "Valor origem", "Valor contábil", "Diferença", "Status"];
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [header, ...filtered.map((row) => [row.date, row.description, row.id, row.origin, row.accounting ?? "", row.difference, row.status])].map((line) => line.map(escape).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `comparacao-${period.replace("/", "-")}.csv`; anchor.hidden = true; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast(`${filtered.length} registros exportados em CSV.`);
  };
  const availableSuggestions = aiResults.suggestions.slice(0, 3).filter((item) => !appliedSuggestionIds.has(item.id));
  const applySuggestions = () => {
    const suggestionIds = [...selectedSuggestions].filter((id) => !appliedSuggestionIds.has(id));
    const rowIds = suggestionIds.map((id) => suggestionTargetIds[id]).filter(Boolean);
    setResolvedIds((current) => new Set([...current, ...rowIds]));
    setAppliedSuggestionIds((current) => new Set([...current, ...suggestionIds]));
    setSelectedSuggestions(new Set()); setAiOpen(false); setToast(`${suggestionIds.length} ${suggestionIds.length === 1 ? "sugestão aplicada" : "sugestões aplicadas"} e registros conciliados.`);
  };

  const navigateTo = (destination) => {
    if (destination === "Comparação Detalhada") setDetailTabOpen(true);
    setCurrentNav(destination);
  };
  const openAccountComparison = (account) => {
    setSelectedAccount(account || DEFAULT_ACCOUNT);
    setDrilldownSource("home");
    setDetailTabOpen(true);
    setAccountDrilldown(true);
    setCurrentNav("Comparação Detalhada");
  };
  const closeAccountComparison = () => {
    setAccountDrilldown(false);
    if (drilldownSource === "home") setCurrentNav("Home");
  };

  return <AppShell currentNav={currentNav} onNavigate={navigateTo} detailTabOpen={detailTabOpen}>
    {currentNav === "Home" ? <HomeDashboard onOpenComparison={openAccountComparison} onToast={setToast} /> : currentNav !== "Comparação Detalhada" ? <ModulePage name={currentNav} onBack={() => navigateTo("Home")} /> : accountDrilldown ? <>
    <AccountDrilldown account={selectedAccount} onBack={closeAccountComparison} onToast={setToast} versionLabel="V2" />
    </> : <>
    <main id="main-content" className="main-content">
      <nav className="breadcrumb" aria-label="Você está em"><button type="button" onClick={() => setCurrentNav("Home")}>Home</button><CaretRight /><button type="button" onClick={() => { setScope("Todas as contas"); setPage(1); }}>Ativo Circulante</button><CaretRight /><span>{scope === "Todas as contas" ? "Todas as contas" : "1.1.2.001 Banco Conta Movimento"}</span></nav>
      <section className="page-heading">
        <div><div className="heading-line"><h1>{scope === "Todas as contas" ? "Ativo Circulante" : scope.includes("1.1.2.002") ? "1.1.2.002 Banco Conta Aplicação" : scope.includes("1.1.3.001") ? "1.1.3.001 Clientes Nacionais" : "1.1.2.001 Banco Conta Movimento"}</h1><span className={`analysis-tag ${reviewed ? "success" : ""}`}>{reviewed ? <CheckCircle weight="fill" /> : <WarningCircle weight="fill" />}{reviewed ? "Revisada" : "Em análise"}</span></div><p>Comparação detalhada · <strong>02 - Bourbon Curitiba Convention Hotel</strong> · Atualizado hoje às {updatedAt} <IconButton label="Atualizar dados" onClick={() => { setUpdatedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })); setToast("Dados atualizados agora."); }}><ArrowsClockwise /></IconButton></p></div>
        <div className="page-actions"><label>Escopo<select value={scope} onChange={(e) => { setScope(e.target.value); setPage(1); setSelected(new Set()); }}><option>Todas as contas</option><option value="1.1.2.001">1.1.2.001 Banco Conta Movimento</option><option>1.1.2.002 Banco Conta Aplicação</option><option>1.1.3.001 Clientes Nacionais</option></select></label><label>Período<select value={period} onChange={(e) => { setPeriod(e.target.value); setPage(1); setUpdatedAt("agora"); setToast(`Período alterado para ${e.target.value}.`); }}><option>ago/2024</option><option>jul/2024</option><option>jun/2024</option></select></label><button type="button" className="button secondary" onClick={() => { setSelectedAccount(DEFAULT_ACCOUNT); setDrilldownSource("overview"); setAccountDrilldown(true); }}><List />Detalhar conta</button><button type="button" className="button secondary" onClick={exportCsv}><DownloadSimple />Exportar</button></div>
      </section>

      <section className="summary-card" aria-label="Resumo da conciliação">
        <div className="desktop-balances"><span><small>Saldo contábil</small><strong>{money(850000)}</strong></span><span><small>Valor origem</small><strong>{money(849200)}</strong></span></div>
        <div className="summary-primary"><span>Sem explicação</span><strong><WarningCircle weight="fill" />+R$ 800,00</strong></div>
        <div className="summary-progress"><strong>32 de 42</strong><span>conciliadas</span><div><i /></div></div>
        <div className="summary-filters" role="group" aria-label="Filtrar por situação"><button onClick={() => chooseFilter("Divergente")}><WarningCircle weight="fill" /><strong>7</strong><span>divergentes</span></button><button onClick={() => chooseFilter("Não encontrada")}><Info weight="fill" /><strong>3</strong><span>não encontradas</span></button><button onClick={() => { setAiOpen(true); setStatusFilter("Todos"); }}><Sparkle weight="fill" /><strong>3</strong><span>sugestões</span></button></div>
        <IconButton label={summaryExpanded ? "Recolher resumo" : "Expandir resumo"} onClick={() => setSummaryExpanded((v) => !v)}><CaretDown className={summaryExpanded ? "rotate" : ""} /></IconButton>
        {summaryExpanded && <div className="summary-details"><span><small>Taxa de conciliação</small><strong>76%</strong></span><span><small>Itens pendentes</small><strong>10</strong></span><span><small>Sugestões da IA</small><strong>3</strong></span></div>}
      </section>

      {!aiOpen && calloutVisible && <section className="ai-callout" role="status"><Sparkle weight="fill" /><span>Há +R$ 800,00 sem explicação nesta conta. A IA pode analisar as causas.</span><button type="button" className="button primary" onClick={() => { setAiOpen(true); setAiState("processing"); }}><Sparkle />Analisar com IA</button><button type="button" className="button ghost" onClick={() => { setCalloutVisible(false); setToast("Lembrete dispensado. Você pode abrir a IA pela barra da tabela."); }}>Agora não</button></section>}

      <div className={`workspace ${aiOpen ? "with-ai" : ""}`}>
        <section className="table-card">
          <div className="toolbar">
            <label className="search"><MagnifyingGlass /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Buscar documento, descrição ou planilha…" aria-label="Buscar documento, descrição ou planilha" /></label>
            <div className="menu-anchor"><button className={`button secondary ${statusFilter !== "Todos" ? "active" : ""}`} onClick={() => { setFilterOpen((v) => !v); setViewOpen(false); }}><Funnel />Filtros{statusFilter !== "Todos" && <span className="badge">1</span>}</button>{filterOpen && <div className="popover filter-popover"><strong>Status</strong>{["Todos", "Divergente", "Não encontrada", "Conciliada"].map((value) => <button key={value} onClick={() => chooseFilter(value)}><span className={`radio ${statusFilter === value ? "selected" : ""}`} />{value}</button>)}</div>}</div>
            <div className="menu-anchor"><button className="button secondary" onClick={() => { setViewOpen((v) => !v); setFilterOpen(false); }}><GearSix />Visão</button>{viewOpen && <div className="popover view-popover"><strong>Gerenciar visão</strong>{[["values", "Valores"], ["status", "Status"], ["document", "Documento"]].map(([key, label]) => <label key={key}><input type="checkbox" checked={visibleColumns[key]} onChange={(e) => setVisibleColumns((current) => ({ ...current, [key]: e.target.checked }))} /> {label}</label>)}</div>}</div>
            <div className="toolbar-meta"><strong>{filtered.length} registros</strong><span className="info-indicator" title="Diferença = Valor contábil menos valor origem" aria-label="Diferença = Valor contábil menos valor origem"><Info /></span></div>
            <button className="button ai-panel-button" onClick={() => setAiOpen((v) => !v)}><Sparkle weight="fill" /><span className="ai-panel-label">Painel da IA</span><span className="badge">3</span></button>
          </div>
          {statusFilter !== "Todos" && <div className="applied-filters"><span>Status: {statusFilter}<button aria-label={`Remover filtro ${statusFilter}`} onClick={() => chooseFilter("Todos")}><X /></button></span><button onClick={() => chooseFilter("Todos")}>Remover todos</button></div>}

          {selected.size > 0 && <div className="bulk-actions" role="region" aria-label="Ações em lote"><strong>{selected.size} selecionado{selected.size > 1 ? "s" : ""}</strong><button type="button" className="button primary" onClick={() => { setResolvedIds((current) => new Set([...current, ...selected])); setToast(`${selected.size} registros conciliados em lote.`); setSelected(new Set()); }}><LinkSimple />Vincular selecionados</button><button type="button" className="button ghost" onClick={() => setSelected(new Set())}>Limpar seleção</button></div>}
          <div className="desktop-table-wrap"><table aria-label="Transações pareadas: sistema de origem e contabilidade"><thead><tr><th><input type="checkbox" aria-label="Selecionar linhas elegíveis desta página" checked={rows.length > 0 && rows.every((row) => selected.has(row.id))} onChange={(e) => togglePageSelection(e.target.checked)} /></th><th>Data</th><th>Descrição</th>{visibleColumns.document && <th>Documento</th>}{visibleColumns.values && <><th>Valor origem</th><th>Valor contábil</th><th>Diferença</th></>}{visibleColumns.status && <th>Status</th>}<th>Ações</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className={selected.has(row.id) ? "selected" : ""}>
            <td><input type="checkbox" aria-label={`Marcar ${row.id} para vincular`} checked={selected.has(row.id)} onChange={() => toggleSelected(row.id)} /></td><td>{row.date}</td><td><div className="description">{row.ai && <span className="ai-mark" title="Sugestão da IA"><Sparkle weight="fill" />IA</span>}<span title={row.description}>{row.description}</span></div></td>{visibleColumns.document && <td><code>{row.id}</code></td>}{visibleColumns.values && <><td className="number">{money(row.origin)}</td><td className="number">{money(row.accounting)}</td><td className={`difference difference--${row.issue}`}>{row.issue === "data" && <Info weight="fill" />}{row.difference}</td></>}{visibleColumns.status && <td><Status row={row} /></td>}<td className="actions-cell"><IconButton label={`Ações de ${row.id}`} onClick={() => setActionsFor(actionsFor === row.id ? null : row.id)}><DotsThreeVertical weight="bold" /></IconButton>{actionsFor === row.id && <RowMenu row={row} onDetails={() => { setDetails(row); setActionsFor(null); }} onLink={() => { setLinkTarget(row); setActionsFor(null); }} onAttach={() => { setDetails(row); setActionsFor(null); }} />}</td>
          </tr>)}</tbody></table></div>

          <div className="mobile-cards">{rows.map((row) => <article key={row.id} className="transaction-card"><header><label><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelected(row.id)} /> <code>{row.id}</code></label><Status row={row} /></header><strong>{row.description}</strong><span>{row.date}</span><dl><div><dt>Origem</dt><dd>{money(row.origin)}</dd></div><div><dt>Contábil</dt><dd>{money(row.accounting)}</dd></div><div><dt>Diferença</dt><dd className={`difference--${row.issue}`}>{row.difference}</dd></div></dl><button className="button secondary full" onClick={() => setDetails(row)}>Ver detalhes</button></article>)}</div>
          {rows.length === 0 && <div className="empty-state"><MagnifyingGlass size={30} /><strong>Nenhuma transação encontrada</strong><span>Ajuste a busca ou remova os filtros aplicados.</span><button className="button secondary" onClick={() => { setQuery(""); chooseFilter("Todos"); }}>Limpar filtros</button></div>}
          <footer className="table-footer"><span>Mostrando {rows.length ? (page - 1) * 10 + 1 : 0}–{Math.min(page * 10, filtered.length)} de {filtered.length} · Diferença = Valor contábil − Valor origem</span><nav aria-label="Paginação"><IconButton label="Página anterior" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><CaretLeft /></IconButton>{Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((number) => <button key={number} className={page === number ? "current" : ""} onClick={() => setPage(number)} aria-label={`Página ${number}`}>{number}</button>)}<IconButton label="Próxima página" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}><CaretRight /></IconButton></nav></footer>
        </section>

        {aiOpen && <aside className="ai-panel" aria-label="Painel da IA"><header><div><Sparkle weight="fill" /><span><strong>Análise inteligente</strong><small>{aiState === "processing" ? "Analisando as divergências" : `${availableSuggestions.length} sugestões prontas`}</small></span></div><IconButton label="Fechar painel da IA" onClick={() => setAiOpen(false)}><X /></IconButton></header>{aiState === "processing" ? <div className="ai-processing"><SpinnerGap className="spin" size={36} /><strong>Analisando 42 transações…</strong><p>Comparando datas, valores, documentos e padrões históricos.</p><div className="progress"><i style={{ width: `${progress}%` }} /></div><span>{progress}% concluído</span><button className="button secondary" onClick={() => { setAiState("ready"); setProgress(0); }}>Cancelar análise</button></div> : <div className="suggestion-list"><div className="ai-summary"><Sparkle weight="fill" /><div><strong>{availableSuggestions.length} correspondência{availableSuggestions.length === 1 ? "" : "s"} encontrada{availableSuggestions.length === 1 ? "" : "s"}</strong><span>{availableSuggestions.length ? "Selecione e revise antes de aplicar." : "Todas as sugestões desta análise foram tratadas."}</span></div></div>{availableSuggestions.map((item) => <article key={item.id} className={selectedSuggestions.has(item.id) ? "suggestion-selected" : ""}><div><label className="suggestion-check"><input type="checkbox" checked={selectedSuggestions.has(item.id)} onChange={() => setSelectedSuggestions((current) => { const next = new Set(current); next.has(item.id) ? next.delete(item.id) : next.add(item.id); return next; })} /><span className={`confidence confidence--${item.confidencePercent >= 85 ? "high" : "medium"}`}>{item.confidencePercent}% confiança</span></label><strong>{item.comparison.sourceSystem.documentId || "Sem documento"}</strong></div><p>{item.reasoning}</p><button className="button secondary full" onClick={() => setSuggestionOpen(item)}>Revisar sugestão</button></article>)}{availableSuggestions.length > 0 && <button className="button primary full" disabled={selectedSuggestions.size === 0} onClick={applySuggestions}><Check />Aplicar {selectedSuggestions.size} {selectedSuggestions.size === 1 ? "sugestão" : "sugestões"}</button>}</div>}</aside>}
      </div>
    </main>

    <footer className="review-bar" aria-label="Ações da conciliação"><div><Info weight="fill" /><span>{reviewed ? "Conciliação revisada. Reabra para fazer novos ajustes." : "Diferença sem explicação +R$ 800,00 e 10 itens pendentes: aprovar exige justificativa."}</span></div><div className="footer-menu-anchor"><IconButton label="Mais ações" aria-expanded={moreActionsOpen} onClick={() => setMoreActionsOpen((value) => !value)}><DotsThreeVertical /></IconButton>{moreActionsOpen && <div className="footer-popover" role="menu"><button role="menuitem" onClick={() => { exportCsv(); setMoreActionsOpen(false); }}><DownloadSimple />Exportar pendências</button><button role="menuitem" onClick={() => { setAiOpen(true); setAiState("processing"); setMoreActionsOpen(false); }}><Sparkle />Nova análise</button></div>}</div><button className="button primary" onClick={() => reviewed ? (setReviewed(false), setToast("Conciliação reaberta para ajustes.")) : setReviewOpen(true)}>{reviewed ? <ArrowsClockwise /> : <CheckCircle />} {reviewed ? "Reabrir revisão" : "Marcar como revisado"}</button></footer>
    {details && <DetailsDrawer row={details} onClose={() => setDetails(null)} onLink={() => setLinkTarget(details)} onToast={setToast} />}
    {reviewOpen && <ReviewDialog justification={justification} setJustification={setJustification} inputRef={modalInput} onClose={() => { setReviewOpen(false); setJustification(""); }} onApprove={approveReview} />}
    {linkTarget && <LinkDialog row={linkTarget} onClose={() => setLinkTarget(null)} onConfirm={() => finishLink(linkTarget)} />}
    {suggestionOpen && <SuggestionDialog item={suggestionOpen} onClose={() => { setSuggestionOpen(null); setToast("Sugestão descartada sem alterar a conciliação."); }} onApply={() => { const targetId = suggestionTargetIds[suggestionOpen.id]; if (targetId) setResolvedIds((current) => new Set(current).add(targetId)); setAppliedSuggestionIds((current) => new Set(current).add(suggestionOpen.id)); setSelectedSuggestions((current) => { const next = new Set(current); next.delete(suggestionOpen.id); return next; }); setSuggestionOpen(null); setToast(`${targetId || "Registro"} conciliado pela sugestão da IA.`); }} />}
    </>}
    {toast && <div className="toast" role="status"><CheckCircle weight="fill" /><span>{toast}</span><IconButton label="Fechar notificação" onClick={() => setToast("")}><X /></IconButton></div>}
  </AppShell>;
}

const homeAccounts = {
  cash: { code: "1.1.1.001", routeId: "1110001", name: "Caixa Geral", balance: "R$ 25.000,00", systemValue: "R$ 25.000,00", difference: "R$ 0,00", status: "Conciliado", tone: "positive", updated: "21/08/2024 10:30", attachments: [{ name: "extrato_bancario_agosto.pdf", size: "1,95 MB", date: "21/08/2024", author: "João Silva" }] },
  bank: { code: "1.1.2.001", routeId: "1120001", name: "Banco Conta Movimento", balance: "R$ 850.000,00", systemValue: "R$ 849.200,00", difference: "R$ 800,00", status: "Divergente", tone: "negative", updated: "21/08/2024 10:28", attachments: [] },
  receivable: { code: "1.1.3.001", routeId: "1130001", name: "Contas a Receber - Clientes", balance: "R$ 375.000,00", systemValue: "R$ 374.300,00", difference: "R$ 700,00", status: "Divergente", tone: "negative", updated: "21/08/2024 10:25", attachments: [] },
};
const DEFAULT_ACCOUNT = homeAccounts.bank;
const matched = (code, name, value) => ({ code, name, balance: value, systemValue: value, difference: "R$ 0,00", status: "Conciliado", tone: "positive", updated: "21/08/2024 10:20", attachments: [] });
const divergent = (code, name, balance, systemValue, difference) => ({ code, name, balance, systemValue, difference, status: "Divergente", tone: "negative", updated: "21/08/2024 10:20", attachments: [] });

const patrimonialGroups = [
  { id: "current-assets", code: "1.1", title: "Ativo Circulante", status: "Divergência: R$ 1.500,00", tone: "negative", balance: "R$ 1.250.000,00", systemValue: "R$ 1.248.500,00", difference: "R$ 1.500,00", accounts: [homeAccounts.cash, homeAccounts.bank, homeAccounts.receivable] },
  { id: "noncurrent-assets", code: "1.2", title: "Ativo Não Circulante", status: "Conciliado", tone: "positive", balance: "R$ 2.850.000,00", systemValue: "R$ 2.850.000,00", difference: "R$ 0,00", accounts: [matched("1.2.1.001", "Imobilizado", "R$ 2.100.000,00"), matched("1.2.2.001", "Investimentos", "R$ 500.000,00"), matched("1.2.3.001", "Intangível", "R$ 250.000,00")] },
  { id: "current-liabilities", code: "2.1", title: "Passivo Circulante", status: "Divergência: R$ 2.300,00", tone: "negative", balance: "R$ 680.000,00", systemValue: "R$ 682.300,00", difference: "R$ 2.300,00", accounts: [divergent("2.1.1.001", "Fornecedores", "R$ 320.000,00", "R$ 321.500,00", "R$ 1.500,00"), divergent("2.1.2.001", "Obrigações Trabalhistas", "R$ 210.000,00", "R$ 210.800,00", "R$ 800,00"), matched("2.1.3.001", "Impostos a Recolher", "R$ 150.000,00")] },
  { id: "noncurrent-liabilities", code: "2.2", title: "Passivo Não Circulante", status: "Conciliado", tone: "positive", balance: "R$ 1.200.000,00", systemValue: "R$ 1.200.000,00", difference: "R$ 0,00", accounts: [matched("2.2.1.001", "Empréstimos e Financiamentos", "R$ 900.000,00"), matched("2.2.2.001", "Provisões de Longo Prazo", "R$ 300.000,00")] },
];

const systemGroups = [
  { id: "cap", code: "CAP", title: "Contas a Pagar", status: "Divergência: R$ 1.500,00", tone: "negative", balance: "R$ 500.000,00", systemValue: "R$ 501.500,00", difference: "-R$ 1.500,00", attachments: 2, accounts: patrimonialGroups[2].accounts },
  { id: "car", code: "CAR", title: "Contas a Receber", status: "Divergência: R$ 700,00", tone: "negative", balance: "R$ 375.000,00", systemValue: "R$ 374.300,00", difference: "R$ 700,00", accounts: [homeAccounts.receivable, matched("1.1.3.002", "Cartões a Receber", "R$ 210.000,00"), matched("1.1.3.003", "Adiantamentos", "R$ 95.000,00")] },
  { id: "alm", code: "ALM", title: "Almoxarifado", status: "Divergência: R$ 800,00", tone: "negative", balance: "R$ 180.000,00", systemValue: "R$ 179.200,00", difference: "R$ 800,00", accounts: [divergent("1.1.4.001", "Estoque Operacional", "R$ 110.000,00", "R$ 109.200,00", "R$ 800,00"), matched("1.1.4.002", "Estoque de Alimentos", "R$ 45.000,00"), matched("1.1.4.003", "Estoque de Bebidas", "R$ 25.000,00")] },
  { id: "pms", code: "PMS", title: "Sistema de Gestão", status: "Conciliado", tone: "positive", balance: "R$ 2.850.000,00", systemValue: "R$ 2.850.000,00", difference: "R$ 0,00", accounts: patrimonialGroups[1].accounts },
  { id: "fin", code: "FIN", title: "Controle Financeiro", status: "Divergência: R$ 800,00", tone: "negative", balance: "R$ 875.000,00", systemValue: "R$ 874.200,00", difference: "R$ 800,00", accounts: [homeAccounts.cash, homeAccounts.bank] },
];

const dailyValues = [44, 52, 48, 66, 58, 73, 61, 82, 76, 88, 79, 94];

function HomeDashboard({ onOpenComparison, onToast }) {
  const [view, setView] = useState("patrimonial");
  const [expandedGroups, setExpandedGroups] = useState(new Set(["current-assets"]));
  const [accountMenu, setAccountMenu] = useState(null);
  const groups = view === "patrimonial" ? patrimonialGroups : systemGroups;
  const summary = view === "patrimonial" ? { groups: "4 Grupos Patrimoniais", aligned: "2 Itens Alinhados", divergences: "2 Divergências Ativas" } : { groups: "5 Sistemas Monitorados", aligned: "1 Item Alinhado", divergences: "4 Divergências Ativas" };
  const toggleGroup = (id) => setExpandedGroups((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const chooseView = (nextView) => { setView(nextView); setExpandedGroups(new Set([nextView === "patrimonial" ? "current-assets" : "cap"])); setAccountMenu(null); };
  const action = (message) => { setAccountMenu(null); onToast?.(message); };

  useEffect(() => {
    if (!accountMenu) return undefined;
    const close = (event) => { if (!event.target.closest(".home-account-actions")) setAccountMenu(null); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [accountMenu]);

  return <main id="main-content" className="main-content home-dashboard">
    <nav className="breadcrumb" aria-label="Você está em"><span>Home</span></nav>
    <section className="home-heading">
      <div><span className="home-eyebrow">Conciliação contábil</span><h1>Dashboard de Conciliação</h1><p>{view === "patrimonial" ? "Auditoria patrimonial - Ativo e Passivo" : "Acompanhamento das conciliações por sistema de origem"}</p></div>
      <div className="home-view-controls" role="group" aria-label="Modo de visualização"><button type="button" className={view === "patrimonial" ? "active" : ""} onClick={() => chooseView("patrimonial")}>Visão Patrimonial</button><button type="button" className={view === "system" ? "active" : ""} onClick={() => chooseView("system")}>Por Sistema</button><span><WarningCircle weight="fill" />{view === "patrimonial" ? 2 : 4} Divergências</span></div>
    </section>
    <section className="home-groups" aria-label={view === "patrimonial" ? "Grupos patrimoniais" : "Sistemas monitorados"}>
      <header><div><h2>{view === "patrimonial" ? "Grupos Patrimoniais" : "Sistemas de Origem"}</h2><p>Expanda um grupo para consultar suas contas e ações.</p></div><span>{groups.length} grupos</span></header>
      {groups.map((group) => {
        const expanded = expandedGroups.has(group.id);
        return <article className={`home-group ${expanded ? "expanded" : ""}`} key={group.id}>
          <button type="button" className="home-group-toggle" aria-expanded={expanded} aria-controls={`accounts-${group.id}`} onClick={() => toggleGroup(group.id)}>
            <span className="home-group-title"><small>{group.code}</small><strong>{group.title}</strong><em className={`home-state ${group.tone}`}>{group.status}</em></span>
            <span className="home-group-metric"><small>Saldo Contábil</small><strong>{group.balance}</strong></span>
            <span className="home-group-metric"><small>Valor Sistema</small><strong>{group.systemValue}</strong></span>
            <span className="home-group-difference"><small>Diferença</small><strong className={group.tone === "negative" ? "negative" : ""}>{group.difference}</strong></span>
            <span className="home-group-meta">{group.attachments ? <><Paperclip />{group.attachments}</> : null}<b>{group.accounts.length} contas</b></span>
            <CaretDown className={expanded ? "rotate" : ""} />
          </button>
          {expanded && <div className="home-account-grid" id={`accounts-${group.id}`}>
            {group.accounts.map((account) => {
              const menuId = `${group.id}-${account.code}`;
              return <article className="home-account-card" key={account.code}>
                <header><span><small>{account.code}</small><strong>{account.name}</strong></span><div className="home-account-actions"><IconButton label={`Ações de ${account.name}`} aria-expanded={accountMenu === menuId} onClick={() => setAccountMenu(accountMenu === menuId ? null : menuId)}><DotsThreeVertical weight="bold" /></IconButton>{accountMenu === menuId && <div className="home-account-menu" role="menu"><button type="button" role="menuitem" onClick={() => { setAccountMenu(null); onOpenComparison(account); }}><ChartBar />Comparação detalhada</button><button type="button" role="menuitem" onClick={() => action(`Seleção de documento aberta para ${account.name}.`)}><Paperclip />Anexar documento</button><button type="button" role="menuitem" onClick={() => action(`Relatório de auditoria de ${account.name} exportado.`)}><DownloadSimple />Exportar para auditoria</button><button type="button" role="menuitem" onClick={() => action(`Análise de ${account.name} aprovada.`)}><CheckCircle />Aprovar análise</button></div>}</div></header>
                <dl><div><dt>Contábil</dt><dd>{account.balance}</dd></div><div><dt>Sistema</dt><dd>{account.systemValue}</dd></div><div><dt>Diferença</dt><dd className={account.tone === "negative" ? "negative" : ""}>{account.difference}</dd></div></dl>
                <footer><span className={`home-state ${account.tone}`}>{account.tone === "positive" ? <CheckCircle weight="fill" /> : <WarningCircle weight="fill" />}{account.status}</span><small>{account.attachments?.length ? <><Paperclip /> {account.attachments.length} documento</> : "Sem anexos"} · {account.updated}</small></footer>
              </article>;
            })}
          </div>}
        </article>;
      })}
    </section>
    <section className="daily-overview" aria-labelledby="daily-overview-title"><header><div><h2 id="daily-overview-title">Visão Geral Diária</h2><p>Comparativo dos valores totais diários entre sistemas de origem e contabilidade</p></div><div><select aria-label="Filtrar sistema"><option>Todos os Sistemas</option><option>CAP</option><option>CAR</option><option>ALM</option><option>PMS</option><option>FIN</option></select><select aria-label="Filtrar status"><option>Todos</option><option>Conciliados</option><option>Divergentes</option></select></div></header><div className="daily-chart"><div className="daily-chart-title"><strong>Valores Diários - Dezembro 2024</strong><span><i className="origin" />Sistema de Origem <i className="accounting" />Contabilidade <i className="divergence" />Divergência</span></div><div className="daily-bars" aria-label="Gráfico demonstrativo de valores diários">{dailyValues.map((value, index) => <span key={index}><i className="origin" style={{ height: `${value}%` }} /><i className="accounting" style={{ height: `${Math.max(20, value - (index % 4 === 0 ? 9 : 2))}%` }} /><small>{String(index + 1).padStart(2, "0")}/12</small></span>)}</div></div></section>
    <section className="home-summary" aria-label="Resumo da conciliação"><span><strong>{summary.groups.split(" ")[0]}</strong>{summary.groups.substring(summary.groups.indexOf(" ") + 1)}</span><span><strong>{summary.aligned.split(" ")[0]}</strong>{summary.aligned.substring(summary.aligned.indexOf(" ") + 1)}</span><span><strong>{summary.divergences.split(" ")[0]}</strong>{summary.divergences.substring(summary.divergences.indexOf(" ") + 1)}</span><span><strong>R$ 3.800,00</strong>Total de Divergências</span></section>
  </main>;
}

const documentCategories = ["Comprovante de Transação", "Nota Fiscal", "Recibo", "Contrato", "Extrato Bancário", "Outro Documento"];

function AttachDocumentDialog({ account, onClose, onComplete }) {
  const [category, setCategory] = useState(documentCategories[0]);
  const [file, setFile] = useState(null);
  const input = useRef(null);
  return <div className="overlay modal-overlay home-flow-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="home-flow-dialog" role="dialog" aria-modal="true" aria-labelledby="attach-dialog-title"><header><div><small>Anexar documentos</small><h2 id="attach-dialog-title">{account.name}</h2></div><IconButton label="Fechar" onClick={onClose}><X /></IconButton></header><div className="home-flow-body"><label className="home-flow-field">Categoria padrão<select value={category} onChange={(event) => setCategory(event.target.value)}>{documentCategories.map((item) => <option key={item}>{item}</option>)}</select></label><section className={`home-file-drop ${file ? "selected" : ""}`}><FileArrowUp size={36} /><strong>{file ? file.name : "Arraste arquivos aqui ou clique para selecionar"}</strong><span>{file ? `${Math.max(1, Math.round(file.size / 1024))} KB selecionado` : "Formatos aceitos: PDF, DOC, XLS, JPG, PNG, TXT"}</span><button type="button" className="button secondary" onClick={() => input.current?.click()}>{file ? "Trocar arquivo" : "Selecionar arquivos"}</button><input ref={input} className="visually-hidden" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" onChange={(event) => setFile(event.target.files?.[0] || null)} /></section></div><footer><button type="button" className="button secondary" onClick={onClose}>Cancelar</button><button type="button" className="button primary" disabled={!file} onClick={() => onComplete(file, category)}><Paperclip />Anexar documento</button></footer></section></div>;
}

const reportTypes = [
  { id: "complete", title: "Relatório completo da conta", description: "Dados completos incluindo transações, reconciliações e análises", formats: "PDF, Excel", size: "2–5 MB" },
  { id: "transactions", title: "Apenas transações", description: "Lista detalhada de todas as transações", formats: "CSV, Excel, PDF", size: "500 KB–2 MB" },
  { id: "reconciliation", title: "Dados de reconciliação", description: "Comparação entre dados contábeis e do sistema", formats: "Excel, PDF", size: "1–3 MB" },
];

function AuditExportDialog({ target, scope, onClose, onComplete }) {
  const [step, setStep] = useState("type");
  const [reportType, setReportType] = useState("complete");
  const [dateFrom, setDateFrom] = useState("2026-09-02");
  const [dateTo, setDateTo] = useState("2026-10-02");
  const [format, setFormat] = useState("PDF");
  const [included, setIncluded] = useState({ documents: true, analyses: true, divergences: true, audit: false });
  const selectedReport = reportTypes.find((item) => item.id === reportType);
  const toggleIncluded = (key) => setIncluded((current) => ({ ...current, [key]: !current[key] }));
  const title = scope === "group" ? `Grupo ${target.title}` : `${target.name} · ${target.code}`;
  const includedLabels = [["documents", "Documentos anexados"], ["analyses", "Análises e comentários"], ["divergences", "Apenas divergências"], ["audit", "Trilha de auditoria"]];
  return <div className="overlay modal-overlay home-flow-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="home-flow-dialog home-export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-dialog-title"><header><div><small>Exportar para auditoria</small><h2 id="export-dialog-title">{title}</h2></div><IconButton label="Fechar" onClick={onClose}><X /></IconButton></header><nav className="home-flow-tabs" aria-label="Etapas da exportação">{[["type", "Tipo de relatório"], ["period", "Período"], ["options", "Opções"], ["preview", "Visualizar"]].map(([id, label]) => <button type="button" key={id} className={step === id ? "active" : ""} aria-current={step === id ? "step" : undefined} onClick={() => setStep(id)}>{label}</button>)}</nav><div className="home-flow-body">
    {step === "type" && <section className="export-step"><h3>Selecione o tipo de exportação</h3><div className="report-type-list">{reportTypes.map((item) => <button type="button" key={item.id} className={reportType === item.id ? "selected" : ""} onClick={() => setReportType(item.id)}><span><strong>{item.title}</strong>{reportType === item.id && <em>Selecionado</em>}</span><small>{item.description}</small><span><b>Formatos: {item.formats}</b><b>Tamanho estimado: {item.size}</b></span></button>)}</div></section>}
    {step === "period" && <section className="export-step"><h3>Selecione o período para exportação</h3><div className="export-period"><label>Data inicial<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label><span>até</span><label>Data final<input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label></div></section>}
    {step === "options" && <section className="export-step"><h3>Formato de exportação</h3><label className="home-flow-field">Formato<select value={format} onChange={(event) => setFormat(event.target.value)}><option>PDF</option><option>Excel</option></select></label><h3>Dados a incluir</h3><div className="export-checks">{includedLabels.map(([key, label]) => <label key={key}><input type="checkbox" checked={included[key]} onChange={() => toggleIncluded(key)} />{label}</label>)}</div></section>}
    {step === "preview" && <section className="export-step"><h3>Resumo da exportação</h3><dl className="export-preview"><div><dt>{scope === "group" ? "Grupo" : "Conta"}</dt><dd>{scope === "group" ? target.title : target.name}<small>{target.code}</small></dd></div><div><dt>Tipo de relatório</dt><dd>{selectedReport.title}</dd></div><div><dt>Período</dt><dd>{dateFrom.split("-").reverse().join("/")} – {dateTo.split("-").reverse().join("/")}</dd></div><div><dt>Formato</dt><dd>{format}</dd></div></dl><div className="export-chips">{includedLabels.filter(([key]) => included[key]).map(([, label]) => <span key={label}>{label}</span>)}</div></section>}
  </div><footer><button type="button" className="button secondary" onClick={onClose}>Cancelar</button><button type="button" className="button primary" onClick={() => onComplete(`${selectedReport.title} de ${title} em ${format}`)}><DownloadSimple />Gerar exportação</button></footer></section></div>;
}

function ApproveAnalysisDialog({ account, approved, onClose, onConfirm }) {
  return <div className="overlay modal-overlay home-flow-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="home-flow-dialog home-approve-dialog" role="dialog" aria-modal="true" aria-labelledby="approve-dialog-title"><header><div><small>Análise da conta</small><h2 id="approve-dialog-title">{account.name}</h2></div><IconButton label="Fechar" onClick={onClose}><X /></IconButton></header><div className="home-flow-body"><div className={`approval-message ${approved ? "approved" : ""}`}>{approved ? <CheckCircle size={34} weight="fill" /> : <WarningCircle size={34} weight="fill" />}<div><strong>{approved ? "Análise já aprovada" : "Aprovar esta análise?"}</strong><p>{approved ? "Esta conta já foi revisada e aprovada nesta sessão." : `Você confirma os saldos, documentos e divergências apresentados para ${account.code}?`}</p></div></div><dl className="approval-summary"><div><dt>Saldo contábil</dt><dd>{account.balance}</dd></div><div><dt>Diferença</dt><dd>{account.difference}</dd></div><div><dt>Status atual</dt><dd>{account.status}</dd></div></dl></div><footer><button type="button" className="button secondary" onClick={onClose}>{approved ? "Fechar" : "Cancelar"}</button>{!approved && <button type="button" className="button primary" onClick={onConfirm}><CheckCircle />Confirmar aprovação</button>}</footer></section></div>;
}

function ModulePage({ name, onBack }) {
  const item = navItems.find((entry) => entry.label === name) || navItems[0];
  const Icon = item.icon;
  const descriptions = { Home: "Visão geral das conciliações e pendências do projeto.", "Logs de Auditoria": "Histórico rastreável das ações realizadas na conciliação.", Cadastros: "Contas, regras e fontes de dados usadas pelo conciliador.", "Mapa do Projeto": "Estrutura das etapas e integrações do projeto." };
  return <main id="main-content" className="main-content module-page"><nav className="breadcrumb"><button type="button" onClick={onBack}>Comparação Detalhada</button><CaretRight /><span>{name}</span></nav><section className="module-hero"><Icon size={34} weight="duotone" /><div><h1>{name}</h1><p>{descriptions[name]}</p></div></section><section className="module-placeholder"><strong>Módulo acessível</strong><p>Este destino está conectado ao menu do protótipo. Volte para a comparação detalhada para continuar o fluxo principal.</p><button type="button" className="button primary" onClick={onBack}>Voltar para comparação</button></section></main>;
}

function RowMenu({ row, onDetails, onLink, onAttach }) {
  return <div className="row-menu" role="menu"><button role="menuitem" onClick={onDetails}><List />Ver detalhes</button><button role="menuitem" onClick={onLink}><LinkSimple />Vincular manualmente</button><button role="menuitem" onClick={onAttach}><Paperclip />Anexar documento</button></div>;
}

function FilePicker({ onPicked, children = "Anexar documento", className = "button secondary" }) {
  const input = useRef(null);
  return <><button type="button" className={className} onClick={() => input.current?.click()}><FileArrowUp />{children}</button><input ref={input} className="visually-hidden" type="file" accept="application/pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) onPicked(file); }} /></>;
}

function DetailsDrawer({ row, onClose, onLink, onToast }) {
  const [attachment, setAttachment] = useState("");
  return <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><aside className="details-drawer" role="dialog" aria-modal="true" aria-labelledby="detail-title"><header><div><small>Detalhes da transação</small><h2 id="detail-title">{row.id}</h2></div><IconButton label="Fechar detalhes" onClick={onClose}><X /></IconButton></header><div className="drawer-body"><Status row={row} /><section><h3>Movimento na origem</h3><dl><div><dt>Data</dt><dd>{row.date}</dd></div><div><dt>Documento</dt><dd>{row.id}</dd></div><div><dt>Descrição</dt><dd>{row.description}</dd></div><div><dt>Valor</dt><dd>{money(row.origin)}</dd></div></dl></section><section><h3>Lançamento contábil</h3><dl><div><dt>Valor</dt><dd>{money(row.accounting)}</dd></div><div><dt>Diferença</dt><dd>{row.difference}</dd></div><div><dt>Conta</dt><dd>1.1.2.001 Banco Conta Movimento</dd></div></dl></section>{attachment && <div className="attachment-chip"><Paperclip />{attachment}</div>}{row.ai && <div className="drawer-insight"><Sparkle weight="fill" /><div><strong>Sugestão da IA</strong><p>Encontramos uma provável correspondência com base em documento, valor e proximidade de datas.</p></div></div>}</div><footer><FilePicker onPicked={(file) => { setAttachment(file.name); onToast(`${file.name} anexado a ${row.id}.`); }} /><button className="button primary" onClick={onLink}><LinkSimple />Vincular manualmente</button></footer></aside></div>;
}

function ReviewDialog({ justification, setJustification, inputRef, onClose, onApprove }) {
  const valid = justification.trim().length >= 20;
  const [attachment, setAttachment] = useState("");
  return <div className="overlay modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title"><header><div><WarningCircle weight="fill" /><div><h2 id="review-title">Marcar conciliação como revisada?</h2><p>Ainda existem pendências que precisam ser registradas.</p></div></div><IconButton label="Fechar" onClick={onClose}><X /></IconButton></header><div className="dialog-body"><div className="pending-summary"><strong>Antes de confirmar</strong><ul><li><WarningCircle />7 transações divergentes</li><li><Info />3 transações não encontradas</li><li><WarningCircle />+R$ 800,00 sem explicação</li></ul></div><label>Justificativa <span>Obrigatória</span><textarea ref={inputRef} value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Descreva por que a conciliação pode ser marcada como revisada…" rows={4} /><small className={valid ? "valid" : ""}>{justification.length} caracteres — mínimo 20 {valid && <Check weight="bold" />}</small></label><div className="review-attachment"><FilePicker className="button ghost" onPicked={(file) => setAttachment(file.name)}>Anexar arquivo</FilePicker><span>{attachment || "Anexo opcional (PDF, até 10 MB)"}</span></div></div><footer><button className="button secondary" onClick={onClose}>Cancelar</button><button className="button primary" disabled={!valid} onClick={onApprove}><CheckCircle />Confirmar revisão</button></footer></section></div>;
}

function LinkDialog({ row, onClose, onConfirm }) {
  const [match, setMatch] = useState("LCT-2024-00872");
  return <div className="overlay modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="review-dialog compact-dialog" role="dialog" aria-modal="true" aria-labelledby="link-title"><header><div><LinkSimple /><div><h2 id="link-title">Vincular {row.id}</h2><p>Escolha o lançamento contábil correspondente.</p></div></div><IconButton label="Fechar" onClick={onClose}><X /></IconButton></header><div className="dialog-body"><label className="stack-label">Lançamento<select value={match} onChange={(e) => setMatch(e.target.value)}><option>LCT-2024-00872</option><option>LCT-2024-00891</option><option>LCT-2024-00904</option></select></label><div className="match-preview"><span>{row.description}</span><strong>{money(row.origin)}</strong></div></div><footer><button className="button secondary" onClick={onClose}>Cancelar</button><button className="button primary" onClick={onConfirm}><LinkSimple />Confirmar vínculo</button></footer></section></div>;
}

function SuggestionDialog({ item, onClose, onApply }) {
  return <div className="overlay modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="review-dialog compact-dialog" role="dialog" aria-modal="true" aria-labelledby="suggestion-title"><header><div><Sparkle weight="fill" /><div><h2 id="suggestion-title">Revisar sugestão da IA</h2><p>{item.confidencePercent}% de confiança</p></div></div><IconButton label="Fechar" onClick={onClose}><X /></IconButton></header><div className="dialog-body"><div className="suggestion-review"><strong>Por que esta correspondência?</strong><p>{item.reasoning}</p></div></div><footer><button className="button secondary" onClick={onClose}>Descartar</button><button className="button primary" onClick={onApply}><Check />Aplicar sugestão</button></footer></section></div>;
}
