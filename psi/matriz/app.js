// ═══════════════════════════════════════════════════════════════
//  ADMIN MATRIZ — PsiCoWorking
//  Painel exclusivo para o papel admin_matriz.
//  Gerencia clínicas cadastradas na plataforma.
// ═══════════════════════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCJx1RwX5-FM2wcUqzeC_CYAUdkmTKU2u4",
  authDomain: "psicoworking.firebaseapp.com",
  projectId: "psicoworking",
  storageBucket: "psicoworking.appspot.com",
  messagingSenderId: "176262015536",
  appId: "1:176262015536:web:placeholder",
};

// Mesma sessão do painel da equipe (/entrar): quem entra uma vez já está dentro dos dois.
const firebaseApp = firebase.initializeApp(FIREBASE_CONFIG, "psicoworking-admin");
const auth = firebaseApp.auth();
const db = firebaseApp.firestore();
const functions = firebaseApp.functions("southamerica-east1");

const { useState, useEffect, useRef } = React;

// ── Ícone Lucide ──────────────────────────────────────────────
function Icone({ nome, tamanho = 18, cor }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = "";
    const el = document.createElement("i");
    el.setAttribute("data-lucide", nome);
    ref.current.appendChild(el);
    window.lucide.createIcons({ nodes: [el] });
  }, [nome]);
  return <span ref={ref} style={{ display: "inline-flex", alignItems: "center", color: cor }} />;
}

// ── CSS inline ────────────────────────────────────────────────
const estilos = `
  .layout { display: flex; min-height: 100vh; }
  .sidebar { width: 220px; background: #3B0D6F; color: white; display: flex; flex-direction: column; flex-shrink: 0; }
  .sidebar-logo { padding: 24px 20px 16px; border-bottom: 1px solid rgba(255,255,255,.1); }
  .sidebar-logo h1 { font-size: 15px; font-weight: 700; color: white; }
  .sidebar-logo p { font-size: 11px; color: rgba(255,255,255,.5); margin-top: 2px; }
  .sidebar-nav { flex: 1; padding: 16px 0; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px; cursor: pointer;
    font-size: 13px; color: rgba(255,255,255,.7); transition: background .15s; border: none;
    background: none; width: 100%; text-align: left; }
  .nav-item:hover, .nav-item.ativo { background: rgba(169,123,239,.28); color: white; }
  .sidebar-footer { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,.1); }
  .conteudo { flex: 1; overflow-y: auto; padding: 32px; }
  .pagina-titulo { font-size: 20px; font-weight: 700; margin-bottom: 24px; }
  .cartoes-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 16px; margin-bottom: 32px; }
  .cartao-stat { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
  .cartao-stat .valor { font-size: 28px; font-weight: 700; }
  .cartao-stat .label { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .tabela { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06); overflow: hidden; }
  .tabela table { width: 100%; border-collapse: collapse; }
  .tabela th { text-align: left; font-size: 11px; color: #6B7280; padding: 12px 16px;
    border-bottom: 1px solid #F3F4F6; background: #F9FAFB; text-transform: uppercase; letter-spacing: .05em; }
  .tabela td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #F3F4F6; }
  .tabela tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .badge-ativo { background: #D1FAE5; color: #065F46; }
  .badge-inativo { background: #FEE2E2; color: #991B1B; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px;
    font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: opacity .15s; }
  .btn:hover { opacity: .85; }
  .btn-primario { background: #6A2BD9; color: white; }
  .btn-perigo { background: #DC2626; color: white; }
  .btn-sucesso { background: #059669; color: white; }
  .btn-ghost { background: #F3F4F6; color: #374151; }
  .form-grupo { margin-bottom: 16px; }
  .form-grupo label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
  .form-grupo input { width: 100%; padding: 9px 12px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; font-family: inherit; }
  .form-grupo input:focus { outline: none; border-color: #6A2BD9; box-shadow: 0 0 0 3px rgba(106,43,217,.14); }
  .painel-form { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.06); max-width: 520px; }
  .msg-ok { background: #D1FAE5; color: #065F46; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-top: 12px; }
  .msg-erro { background: #FEE2E2; color: #991B1B; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-top: 12px; }
  .link-copia { background: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 8px; padding: 10px 14px;
    font-size: 12px; word-break: break-all; margin-top: 10px; color: #374151; }
  .badge-teste { background: #EADDFC; color: #3B0D6F; }
  .badge-aviso { background: #FEF3C7; color: #92400E; }
  .badge-neutro { background: #F3F4F6; color: #374151; }
  .campo-busca { padding: 9px 12px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 13px; font-family: inherit; background: white; flex: 1; min-width: 200px; }
  .grade-detalhe { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; align-items: start; }
  .subtitulo-painel { font-size: 13px; font-weight: 700; color: #3B0D6F; margin-bottom: 12px; text-transform: uppercase; letter-spacing: .04em; }
  .form-grupo select { width: 100%; padding: 9px 12px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; font-family: inherit; background: white; }
  .tela-login { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #3B0D6F; }
  .card-login { background: white; border-radius: 20px; padding: 40px; width: 100%; max-width: 380px; }
  .card-login h1 { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 4px; }
  .card-login p { font-size: 13px; color: #6B7280; text-align: center; margin-bottom: 28px; }
  @media (max-width: 640px) {
    .layout { flex-direction: column; }
    .sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; }
    .conteudo { padding: 16px; }
  }
`;

// ── Tela de Login ────────────────────────────────────────────
function TelaLogin({ aoLogar }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const cred = await auth.signInWithEmailAndPassword(email, senha);
      const token = await cred.user.getIdTokenResult();
      if (token.claims.role !== "admin_matriz") {
        await auth.signOut();
        setErro("Esta conta não tem acesso ao painel Admin Matriz.");
        return;
      }
      aoLogar(cred.user);
    } catch (err) {
      setErro("E-mail ou senha incorretos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <style>{estilos}</style>
      <div className="tela-login">
        <div className="card-login">
          <h1>PsiCoWorking</h1>
          <p>Painel Admin Matriz</p>
          <form onSubmit={entrar}>
            <div className="form-grupo">
              <label>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-grupo">
              <label>Senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </div>
            {erro && <div className="msg-erro">{erro}</div>}
            <button type="submit" className="btn btn-primario" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: 18, fontSize: 13 }}>
            <a href="https://psicoworking.app.br/" style={{ color: "#6A2BD9", fontWeight: 600, textDecoration: "none" }}>Conheça o PsiCoWorking</a>
          </p>
        </div>
      </div>
    </>
  );
}

// ── Planos, assinaturas e dados compartilhados entre as telas ──────
const DOMINIO_PUBLICO = "https://psicoworking.app.br";

const PLANOS_BASE = {
  testeDias: 30,
  testeIaUsos: 5,
  somenteLeituraDias: 15,
  essencial: { nome: "Essencial", precoMensal: 39.9, precoAnual: 399 },
  plus: { nome: "Plus", precoMensal: 69.9, precoAnual: 699, cotaIaMes: 200 },
};

const SITUACOES = [
  { id: "teste", rotulo: "Em teste" },
  { id: "ativa", rotulo: "Ativa" },
  { id: "atrasada", rotulo: "Atrasada" },
  { id: "somente_leitura", rotulo: "Somente leitura" },
  { id: "suspensa", rotulo: "Suspensa" },
  { id: "cancelada", rotulo: "Cancelada" },
];

function moeda(v) {
  return "R$ " + Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function paraData(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  return new Date(ts);
}

function dataBr(ts) {
  const d = paraData(ts);
  return d ? d.toLocaleDateString("pt-BR") : "—";
}

function diasAte(ts) {
  const d = paraData(ts);
  return d ? Math.ceil((d.getTime() - Date.now()) / 86400000) : null;
}

function usarPlanos() {
  const [planos, setPlanos] = useState(PLANOS_BASE);
  useEffect(() => {
    return db.collection("plataforma_config").doc("planos").onSnapshot(
      (s) => {
        const c = s.exists ? s.data() : {};
        setPlanos({
          ...PLANOS_BASE,
          ...c,
          essencial: { ...PLANOS_BASE.essencial, ...(c.essencial || {}) },
          plus: { ...PLANOS_BASE.plus, ...(c.plus || {}) },
        });
      },
      () => {}
    );
  }, []);
  return planos;
}

// Junta o que existe de cada clínica: assinatura (plano e situação), configuração
// (nome) e perfil (e-mail, CRP, cidade, ativo). Ao abrir, prepara as clínicas antigas.
function usarClinicas() {
  const [assin, setAssin] = useState({});
  const [conf, setConf] = useState({});
  const [perf, setPerf] = useState({});
  const [pronto, setPronto] = useState(false);
  const tentouPreparar = useRef(false);

  useEffect(() => {
    const mapa = (setter, marcar) => (snap) => {
      const m = {};
      snap.docs.forEach((d) => { m[d.id] = d.data(); });
      setter(m);
      if (marcar) setPronto(true);
    };
    const u1 = db.collection("psi_assinaturas").onSnapshot(mapa(setAssin, true), () => setPronto(true));
    const u2 = db.collection("psi_config").onSnapshot(mapa(setConf), () => {});
    const u3 = db.collection("psi_profiles").onSnapshot(mapa(setPerf), () => {});
    return () => { u1(); u2(); u3(); };
  }, []);

  useEffect(() => {
    if (!pronto || tentouPreparar.current) return;
    const faltando = Object.keys(conf).some((id) => !assin[id] || !conf[id].slug);
    if (!faltando) return;
    tentouPreparar.current = true;
    functions.httpsCallable("garantirAssinaturas")().catch(() => {});
  }, [pronto, conf, assin]);

  const ids = [...new Set([...Object.keys(assin), ...Object.keys(conf), ...Object.keys(perf)])];
  const lista = ids
    .map((id) => ({
      id,
      nome: (perf[id] && perf[id].nome) || (conf[id] && conf[id].nome) || id,
      email: (perf[id] && perf[id].email) || "",
      crp: (perf[id] && perf[id].crp) || "",
      cidade: (perf[id] && perf[id].cidade) || "",
      slug: (conf[id] && conf[id].slug) || "",
      ativo: perf[id] ? perf[id].ativo !== false : true,
      assinatura: assin[id] || null,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return { lista, pronto };
}

function usarUsoClinicas(quantas) {
  const [uso, setUso] = useState({});
  useEffect(() => {
    if (!quantas) return;
    functions.httpsCallable("usoDasClinicas")()
      .then((r) => setUso(r.data.uso || {}))
      .catch(() => {});
  }, [quantas]);
  return uso;
}

function rotuloPlano(a, planos) {
  if (!a) return "—";
  if (a.origem === "fundadora") return "Fundadora (Plus)";
  if (a.origem === "cortesia") return "Cortesia (" + (a.plano === "plus" ? planos.plus.nome : planos.essencial.nome) + ")";
  return a.plano === "plus" ? planos.plus.nome : planos.essencial.nome;
}

function EtiquetaSituacao({ a }) {
  if (!a) return <span className="badge badge-neutro">Sem assinatura</span>;
  const dias = diasAte(a.testeAte);
  if (a.origem === "cortesia" && a.situacao === "ativa") {
    return <span className="badge badge-teste">{a.cortesiaAte ? "Cortesia até " + dataBr(a.cortesiaAte) : "Cortesia sem prazo"}</span>;
  }
  if (a.situacao === "teste") {
    return <span className="badge badge-teste">{"Teste até " + dataBr(a.testeAte) + (dias !== null ? " (" + Math.max(dias, 0) + "d)" : "")}</span>;
  }
  if (a.situacao === "ativa") return <span className="badge badge-ativo">Ativa</span>;
  if (a.situacao === "atrasada") return <span className="badge badge-aviso">Atrasada</span>;
  if (a.situacao === "somente_leitura") return <span className="badge badge-aviso">{"Somente leitura até " + dataBr(a.leituraAte)}</span>;
  if (a.situacao === "suspensa") return <span className="badge badge-inativo">Suspensa</span>;
  return <span className="badge badge-neutro">Cancelada</span>;
}

function textoIA(a, planos) {
  if (!a) return "—";
  if (a.situacao === "teste") return (a.iaTestesUsados || 0) + " de " + (a.iaTestesLimite !== undefined ? a.iaTestesLimite : planos.testeIaUsos) + " testes";
  if (a.plano !== "plus") return "sem IA";
  const mes = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }).slice(0, 7);
  const usos = a.iaMes === mes ? (a.iaUsosMes || 0) : 0;
  const cota = a.iaCotaMes !== undefined ? a.iaCotaMes : planos.plus.cotaIaMes;
  return usos + (cota === null || cota === undefined ? " (sem limite)" : " de " + cota);
}

// Quem precisa de atenção: testes terminando, planos vencendo e atrasos.
function CartaoVencimentos({ lista, planos, irPara }) {
  const itens = [];
  lista.forEach((c) => {
    const a = c.assinatura;
    if (!a || a.origem === "fundadora") return;
    if (a.situacao === "teste" && a.testeAte) {
      const d = diasAte(a.testeAte);
      if (d !== null && d <= 7) itens.push({ c, ordem: d, texto: "Teste termina " + (d <= 0 ? "hoje" : "em " + d + " dia(s)") });
    } else if (a.situacao === "ativa" && a.origem === "cortesia" && a.cortesiaAte) {
      const d = diasAte(a.cortesiaAte);
      if (d !== null && d <= 7) itens.push({ c, ordem: d, texto: "Cortesia termina " + (d <= 0 ? "hoje" : "em " + d + " dia(s)") });
    } else if (a.situacao === "ativa" && a.proximoVencimento) {
      const d = diasAte(a.proximoVencimento);
      if (d !== null && d <= 7) itens.push({ c, ordem: d, texto: "Plano vence " + (d <= 0 ? "hoje" : "em " + d + " dia(s)") + " (" + dataBr(a.proximoVencimento) + ")" });
    } else if (a.situacao === "atrasada") {
      itens.push({ c, ordem: -100, texto: "Pagamento em atraso" + (a.proximoVencimento ? " desde " + dataBr(a.proximoVencimento) : "") });
    } else if (a.situacao === "somente_leitura") {
      itens.push({ c, ordem: -50, texto: "Somente leitura até " + dataBr(a.leituraAte) });
    }
  });
  itens.sort((x, y) => x.ordem - y.ordem);
  if (itens.length === 0) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="pagina-titulo" style={{ fontSize: 15 }}>Vencimentos e cobranças ({itens.length})</div>
      <div className="tabela">
        <table>
          <tbody>
            {itens.map(({ c, texto }) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.nome}</td>
                <td>{rotuloPlano(c.assinatura, planos)}</td>
                <td>{texto}</td>
                <td><button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => irPara("clinicas", { abrir: c.id })}>Abrir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Pedidos de mudança de plano feitos pelas psicólogas dentro do sistema.
function CartaoPedidosPlano({ lista, planos, irPara }) {
  const [pedidos, setPedidos] = useState([]);
  useEffect(() => {
    return db.collection("psi_pedidos_plano").onSnapshot(
      (snap) => setPedidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.status === "pendente")),
      () => {}
    );
  }, []);
  async function atender(p) {
    try { await db.collection("psi_pedidos_plano").doc(p.id).update({ status: "atendido" }); } catch (e) { alert("Erro: " + e.message); }
  }
  if (pedidos.length === 0) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="pagina-titulo" style={{ fontSize: 15 }}>Pedidos de mudança de plano ({pedidos.length})</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pedidos.map((p) => {
          const c = lista.find((x) => x.id === p.psi_id);
          const nomePlano = (id) => (id === "plus" ? planos.plus.nome : planos.essencial.nome);
          return (
            <div key={p.id} className="painel-form" style={{ maxWidth: 720, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{(c && c.nome) || p.nomeClinica || p.psi_id}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>
                  {"Quer mudar de " + nomePlano(p.de) + " para " + nomePlano(p.para) + " (" + p.ciclo + ")" + (p.pedidoEm ? " · pedido em " + dataBr(p.pedidoEm) : "")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => atender(p)}>Marcar atendido</button>
                <button className="btn btn-primario" onClick={() => irPara("clinicas", { abrir: p.psi_id })}>Abrir clínica</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Painel ───────────────────────────────────────────────────
function PaginaDashboard({ irPara }) {
  const planos = usarPlanos();
  const { lista, pronto } = usarClinicas();
  const [interesses, setInteresses] = useState([]);

  useEffect(() => {
    return db.collection("psi_interesse").onSnapshot((snap) => setInteresses(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {});
  }, []);

  if (!pronto) return <p style={{ color: "#6B7280" }}>Carregando...</p>;

  const comAssin = lista.filter((c) => c.assinatura);
  const ativas = comAssin.filter((c) => c.assinatura.situacao === "ativa" || c.assinatura.situacao === "atrasada").length;
  const emTeste = comAssin.filter((c) => c.assinatura.situacao === "teste").length;
  const emAtraso = comAssin.filter((c) => c.assinatura.situacao === "atrasada").length;
  const pendentes = interesses.filter((i) => !i.status || i.status === "pendente").length;
  const cortesias = comAssin.filter((c) => c.assinatura.origem === "cortesia" && c.assinatura.situacao === "ativa").length;

  // Receita mensal estimada: só quem paga (fundadoras e testes não entram).
  let receita = 0;
  comAssin.forEach((c) => {
    const a = c.assinatura;
    if (a.origem === "fundadora" || a.origem === "cortesia" || (a.situacao !== "ativa" && a.situacao !== "atrasada")) return;
    const p = a.plano === "plus" ? planos.plus : planos.essencial;
    receita += a.ciclo === "anual" ? Number(p.precoAnual || 0) / 12 : Number(p.precoMensal || 0);
  });

  const mes = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }).slice(0, 7);
  let usosIA = 0;
  comAssin.forEach((c) => {
    const a = c.assinatura;
    if (a.iaMes === mes) usosIA += a.iaUsosMes || 0;
  });
  const recentes = [...comAssin]
    .filter((c) => c.assinatura.criadoEm)
    .sort((x, y) => paraData(y.assinatura.criadoEm) - paraData(x.assinatura.criadoEm))
    .slice(0, 5);

  return (
    <div>
      <div className="pagina-titulo">Painel</div>
      <div className="cartoes-stats">
        <div className="cartao-stat"><div className="valor" style={{ color: "#059669" }}>{ativas}</div><div className="label">Clínicas ativas</div></div>
        <div className="cartao-stat"><div className="valor" style={{ color: "#6A2BD9" }}>{emTeste}</div><div className="label">Em teste</div></div>
        <div className="cartao-stat" style={{ cursor: "pointer" }} onClick={() => irPara("aprovacoes")}><div className="valor" style={{ color: "#D97706" }}>{pendentes}</div><div className="label">Aguardando aprovação</div></div>
        <div className="cartao-stat"><div className="valor" style={{ color: "#DC2626" }}>{emAtraso}</div><div className="label">Em atraso</div></div>
      </div>
      <div className="cartoes-stats">
        <div className="cartao-stat"><div className="valor">{moeda(receita)}</div><div className="label">Receita mensal estimada</div></div>
        <div className="cartao-stat"><div className="valor" style={{ color: "#6A2BD9" }}>{cortesias}</div><div className="label">Acessos de cortesia</div></div>
        <div className="cartao-stat"><div className="valor">{usosIA}</div><div className="label">Usos de IA neste mês (custo estimado {moeda(usosIA * 0.02)})</div></div>
      </div>
      <CartaoVencimentos lista={lista} planos={planos} irPara={irPara} />
      <CartaoPedidosPlano lista={lista} planos={planos} irPara={irPara} />
      <div className="pagina-titulo" style={{ fontSize: 15 }}>Últimas entradas</div>
      <div className="tabela">
        <table>
          <tbody>
            {recentes.length === 0 && <tr><td style={{ color: "#9CA3AF", textAlign: "center", padding: 24 }}>Nenhuma clínica ainda.</td></tr>}
            {recentes.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.nome}</td>
                <td>{rotuloPlano(c.assinatura, planos)}</td>
                <td><EtiquetaSituacao a={c.assinatura} /></td>
                <td>{dataBr(c.assinatura.criadoEm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Catálogo (fábulas, ferramentas, psicoeducação) ───────────
// A edição fica no gerenciador do painel principal; só esta conta
// (administradora da plataforma) consegue gravar nele.
function PaginaCatalogo() {
  // O gerenciador abre aqui dentro, na mesma sessão da administradora.
  return (
    <iframe
      title="Fábulas e ferramentas"
      src="/psi/admin/?plataforma=1&embutido=1"
      style={{ width: "100%", height: "calc(100vh - 64px)", border: "none", borderRadius: 12, background: "white" }}
    />
  );
}

// ── Lista e detalhe das clínicas ─────────────────────────────
function PaginaClinicas({ abrirId }) {
  const planos = usarPlanos();
  const { lista, pronto } = usarClinicas();
  const uso = usarUsoClinicas(lista.length);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [aberta, setAberta] = useState(abrirId || null);

  if (!pronto) return <p style={{ color: "#6B7280" }}>Carregando...</p>;

  const atual = aberta ? lista.find((c) => c.id === aberta) : null;
  if (atual) return <DetalheClinica clinica={atual} planos={planos} uso={uso[atual.id]} aoVoltar={() => setAberta(null)} />;

  const filtradas = lista.filter((c) => {
    const texto = (c.nome + " " + c.email + " " + c.crp).toLowerCase();
    if (busca && !texto.includes(busca.toLowerCase())) return false;
    if (filtro !== "todas" && (!c.assinatura || c.assinatura.situacao !== filtro)) return false;
    return true;
  });

  return (
    <div>
      <div className="pagina-titulo">Clínicas</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="campo-busca" placeholder="Buscar por nome, e-mail ou CRP" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select className="campo-busca" style={{ maxWidth: 200 }} value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="todas">Todas as situações</option>
          {SITUACOES.map((s) => <option key={s.id} value={s.id}>{s.rotulo}</option>)}
        </select>
      </div>
      <div className="tabela">
        <table>
          <thead>
            <tr><th>Clínica</th><th>Plano</th><th>Situação</th><th>Pacientes</th><th>IA</th><th></th></tr>
          </thead>
          <tbody>
            {filtradas.length === 0 && <tr><td colSpan={6} style={{ color: "#9CA3AF", textAlign: "center", padding: 24 }}>Nenhuma clínica encontrada.</td></tr>}
            {filtradas.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{c.nome}{c.ativo === false ? " (login bloqueado)" : ""}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>{c.email}</div>
                </td>
                <td>{rotuloPlano(c.assinatura, planos)}</td>
                <td><EtiquetaSituacao a={c.assinatura} /></td>
                <td>{uso[c.id] ? uso[c.id].ativos + " ativos / " + uso[c.id].pacientes : "—"}</td>
                <td>{textoIA(c.assinatura, planos)}</td>
                <td><button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setAberta(c.id)}>Abrir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetalheClinica({ clinica, planos, uso, aoVoltar }) {
  const a = clinica.assinatura;
  const ref = db.collection("psi_assinaturas").doc(clinica.id);
  const [plano, setPlano] = useState((a && a.plano) || "essencial");
  const [ciclo, setCiclo] = useState((a && a.ciclo) || "mensal");
  const [situacao, setSituacao] = useState((a && a.situacao) || "teste");
  const [diasExtra, setDiasExtra] = useState(15);
  const [valorPg, setValorPg] = useState("");
  const [formaPg, setFormaPg] = useState("Pix");
  const [linkCobranca, setLinkCobranca] = useState((a && a.linkCobranca) || "");
  const [slugEdit, setSlugEdit] = useState(clinica.slug || "");
  const [planoCortesia, setPlanoCortesia] = useState((a && a.plano) || "essencial");
  const [mesesCortesia, setMesesCortesia] = useState("0");
  const [msg, setMsg] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const FV = firebase.firestore.FieldValue;
  const TS = firebase.firestore.Timestamp;

  async function executar(fn, ok) {
    setOcupado(true);
    setMsg("");
    try { await fn(); setMsg(ok); } catch (e) { setMsg("Erro: " + e.message); } finally { setOcupado(false); }
  }

  function salvarPlano() {
    return executar(() => ref.set({
      plano, ciclo,
      iaCotaMes: plano === "plus" ? (planos.plus.cotaIaMes === undefined ? null : planos.plus.cotaIaMes) : FV.delete(),
    }, { merge: true }), "Plano atualizado.");
  }

  function salvarSituacao() {
    const extra = {};
    if (situacao === "somente_leitura") extra.leituraAte = TS.fromMillis(Date.now() + planos.somenteLeituraDias * 86400000);
    return executar(() => ref.set({ situacao, ...extra }, { merge: true }), "Situação atualizada.");
  }

  function estenderTeste() {
    const base = Math.max(Date.now(), paraData(a && a.testeAte) ? paraData(a.testeAte).getTime() : 0);
    return executar(() => ref.set({
      situacao: "teste",
      testeAte: TS.fromMillis(base + Number(diasExtra) * 86400000),
      leituraAte: FV.delete(),
    }, { merge: true }), "Teste estendido em " + diasExtra + " dias.");
  }

  function maisIA() {
    const limite = a && a.iaTestesLimite !== undefined ? a.iaTestesLimite : planos.testeIaUsos;
    return executar(() => ref.set({ iaTestesLimite: limite + 5 }, { merge: true }), "Liberados mais 5 usos de IA no teste.");
  }

  function registrarPagamento() {
    const p = plano === "plus" ? planos.plus : planos.essencial;
    const padrao = ciclo === "anual" ? p.precoAnual : p.precoMensal;
    const valor = Number(String(valorPg).replace(",", ".")) || Number(padrao);
    const atualVenc = paraData(a && a.proximoVencimento);
    const inicio = atualVenc && atualVenc.getTime() > Date.now() ? atualVenc : new Date();
    const novo = new Date(inicio.getTime());
    novo.setMonth(novo.getMonth() + (ciclo === "anual" ? 12 : 1));
    return executar(() => ref.set({
      plano, ciclo,
      situacao: "ativa",
      proximoVencimento: TS.fromDate(novo),
      iaCotaMes: plano === "plus" ? (planos.plus.cotaIaMes === undefined ? null : planos.plus.cotaIaMes) : FV.delete(),
      pagamentos: FV.arrayUnion({ em: TS.now(), valor, forma: formaPg, ciclo, ate: TS.fromDate(novo) }),
    }, { merge: true }), "Pagamento registrado. Próximo vencimento: " + novo.toLocaleDateString("pt-BR") + ".");
  }

  function salvarLinkCobranca() {
    const link = linkCobranca.trim();
    if (link && !/^https:\/\//i.test(link)) { setMsg("Erro: o link de cobrança precisa começar com https://"); return Promise.resolve(); }
    return executar(() => ref.set({ linkCobranca: link ? link : FV.delete() }, { merge: true }), link ? "Link de cobrança salvo. Ele aparece para a psicóloga e nos e-mails de aviso." : "Link de cobrança removido.");
  }

  function concederCortesia() {
    const meses = Number(mesesCortesia);
    const ate = new Date();
    ate.setMonth(ate.getMonth() + meses);
    return executar(() => ref.set({
      plano: planoCortesia,
      situacao: "ativa",
      origem: "cortesia",
      ciclo: "mensal",
      iaCotaMes: planoCortesia === "plus" ? (planos.plus.cotaIaMes === undefined ? null : planos.plus.cotaIaMes) : FV.delete(),
      cortesiaAte: meses ? TS.fromDate(ate) : FV.delete(),
      proximoVencimento: FV.delete(),
      testeAte: FV.delete(),
      leituraAte: FV.delete(),
      avisosEnviados: FV.delete(),
    }, { merge: true }), meses ? "Cortesia concedida por " + meses + " meses." : "Cortesia concedida, sem prazo.");
  }

  function encerrarCortesia() {
    if (!confirm("Encerrar a cortesia e iniciar um teste de " + planos.testeDias + " dias?")) return Promise.resolve();
    return executar(() => ref.set({
      origem: "cadastro",
      situacao: "teste",
      testeAte: TS.fromMillis(Date.now() + planos.testeDias * 86400000),
      cortesiaAte: FV.delete(),
      avisosEnviados: FV.delete(),
    }, { merge: true }), "Cortesia encerrada. A clínica entrou em teste de " + planos.testeDias + " dias.");
  }

  function salvarSlug() {
    return executar(async () => {
      const r = await functions.httpsCallable("definirSlugClinica")({ psiId: clinica.id, slug: slugEdit });
      setSlugEdit(r.data.slug);
    }, "Endereço atualizado. O apelido antigo continua funcionando.");
  }

  async function alternarLogin() {
    if (!confirm((clinica.ativo ? "Bloquear" : "Liberar") + " o login desta clínica?")) return;
    await executar(() => functions.httpsCallable("ativarDesativarClinica")({ psiId: clinica.id, ativo: !clinica.ativo }), clinica.ativo ? "Login bloqueado." : "Login liberado.");
  }

  const pagamentos = [...((a && a.pagamentos) || [])].reverse();

  return (
    <div>
      <button className="btn btn-ghost" style={{ marginBottom: 14 }} onClick={aoVoltar}><Icone nome="arrow-left" tamanho={14} /> Voltar</button>
      <div className="pagina-titulo" style={{ marginBottom: 6 }}>{clinica.nome}</div>
      <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 20 }}>
        {[clinica.email, clinica.crp ? "CRP " + clinica.crp : "", clinica.cidade].filter(Boolean).join(" · ")}
      </p>

      {!a && <div className="msg-erro">Esta clínica ainda não tem assinatura. Atualize a página; se continuar, me avise.</div>}

      {a && (
        <div className="grade-detalhe">
          <div className="painel-form">
            <div className="subtitulo-painel">Situação</div>
            <div style={{ marginBottom: 12 }}><EtiquetaSituacao a={a} /> <span style={{ fontSize: 12, color: "#6B7280", marginLeft: 8 }}>{a.origem === "fundadora" ? "Fundadora, sem cobrança" : ""}</span></div>
            <div style={{ fontSize: 13, lineHeight: 1.8, marginBottom: 10 }}>
              <div>Pacientes: <strong>{uso ? uso.ativos + " ativos de " + uso.pacientes : "—"}</strong></div>
              <div>IA: <strong>{textoIA(a, planos)}</strong></div>
              {a.proximoVencimento && <div>Próximo vencimento: <strong>{dataBr(a.proximoVencimento)}</strong></div>}
            </div>
            <div className="form-grupo">
              <label>Mudar situação para</label>
              <select value={situacao} onChange={(e) => setSituacao(e.target.value)}>
                {SITUACOES.map((s) => <option key={s.id} value={s.id}>{s.rotulo}</option>)}
              </select>
            </div>
            <button className="btn btn-ghost" disabled={ocupado} onClick={salvarSituacao}>Salvar situação</button>
          </div>

          <div className="painel-form">
            <div className="subtitulo-painel">Plano</div>
            <div className="form-grupo">
              <label>Plano</label>
              <select value={plano} onChange={(e) => setPlano(e.target.value)}>
                <option value="essencial">{planos.essencial.nome} ({moeda(planos.essencial.precoMensal)}/mês)</option>
                <option value="plus">{planos.plus.nome} ({moeda(planos.plus.precoMensal)}/mês, com IA)</option>
              </select>
            </div>
            <div className="form-grupo">
              <label>Cobrança</label>
              <select value={ciclo} onChange={(e) => setCiclo(e.target.value)}>
                <option value="mensal">Mensal</option>
                <option value="anual">Anual (com desconto)</option>
              </select>
            </div>
            <button className="btn btn-ghost" disabled={ocupado} onClick={salvarPlano}>Salvar plano</button>
          </div>

          <div className="painel-form">
            <div className="subtitulo-painel">Registrar pagamento</div>
            <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>Enquanto a cobrança automática não está ligada, marque aqui o que a psicóloga pagou. A clínica passa a Ativa e o vencimento avança 1 mês (ou 12, se anual).</p>
            <div className="form-grupo">
              <label>Valor recebido (deixe em branco para usar o preço do plano)</label>
              <input value={valorPg} onChange={(e) => setValorPg(e.target.value)} placeholder="ex: 39,90" />
            </div>
            <div className="form-grupo">
              <label>Forma</label>
              <select value={formaPg} onChange={(e) => setFormaPg(e.target.value)}>
                {["Pix", "Cartão de crédito", "Boleto", "Dinheiro", "Outra"].map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <button className="btn btn-sucesso" disabled={ocupado} onClick={registrarPagamento}>Registrar pagamento</button>
            <div className="form-grupo" style={{ marginTop: 18 }}>
              <label>Link de cobrança (Pix, boleto ou fatura que você gerou)</label>
              <input value={linkCobranca} onChange={(e) => setLinkCobranca(e.target.value)} placeholder="https://..." />
            </div>
            <button className="btn btn-ghost" disabled={ocupado} onClick={salvarLinkCobranca}>Salvar link de cobrança</button>
          </div>

          <div className="painel-form">
            <div className="subtitulo-painel">Teste e IA</div>
            <div className="form-grupo">
              <label>Estender o teste em (dias)</label>
              <input type="number" min="1" value={diasExtra} onChange={(e) => setDiasExtra(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-ghost" disabled={ocupado} onClick={estenderTeste}>Estender teste</button>
              <button className="btn btn-ghost" disabled={ocupado} onClick={maisIA}>Liberar +5 usos de IA no teste</button>
            </div>
          </div>
        </div>
      )}

      {a && a.origem !== "fundadora" && (
        <div className="painel-form" style={{ maxWidth: 720, marginTop: 16 }}>
          <div className="subtitulo-painel">Acesso de cortesia (gratuito)</div>
          <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>
            {a.origem === "cortesia"
              ? "Esta clínica está com acesso de cortesia: sem cobrança e sem avisos de pagamento."
              : "Conceda acesso gratuito a esta clínica. Ela deixa de ser cobrada e de receber avisos de pagamento."}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div className="form-grupo" style={{ flex: 1, minWidth: 180 }}>
              <label>Plano</label>
              <select value={planoCortesia} onChange={(e) => setPlanoCortesia(e.target.value)}>
                <option value="essencial">Essencial (sem IA)</option>
                <option value="plus">Plus (com IA)</option>
              </select>
            </div>
            <div className="form-grupo" style={{ flex: 1, minWidth: 180 }}>
              <label>Duração</label>
              <select value={mesesCortesia} onChange={(e) => setMesesCortesia(e.target.value)}>
                <option value="0">Sem prazo</option>
                <option value="3">3 meses</option>
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-primario" disabled={ocupado} onClick={concederCortesia}>{a.origem === "cortesia" ? "Atualizar cortesia" : "Conceder cortesia"}</button>
            {a.origem === "cortesia" && <button className="btn btn-ghost" disabled={ocupado} onClick={encerrarCortesia}>Encerrar cortesia e iniciar teste</button>}
          </div>
        </div>
      )}

      <div className="painel-form" style={{ maxWidth: 720, marginTop: 16 }}>
        <div className="subtitulo-painel">Endereço da clínica</div>
        {clinica.slug ? (
          <div style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 10 }}>
            <div>Pacientes: <strong>{DOMINIO_PUBLICO + "/" + clinica.slug}</strong></div>
            <div>Equipe: <strong>{DOMINIO_PUBLICO + "/" + clinica.slug + "/equipe"}</strong></div>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>Esta clínica ainda não tem endereço. Atualize a página em alguns segundos.</p>
        )}
        <div className="form-grupo">
          <label>Apelido no endereço (3 a 40 letras minúsculas, números e hífen)</label>
          <input value={slugEdit} onChange={(e) => setSlugEdit(e.target.value)} placeholder="ex: maria-souza" />
        </div>
        <button className="btn btn-ghost" disabled={ocupado} onClick={salvarSlug}>Salvar endereço</button>
      </div>

      {msg && <div className={msg.startsWith("Erro") ? "msg-erro" : "msg-ok"}>{msg}</div>}

      {a && (
        <div style={{ marginTop: 24 }}>
          <div className="pagina-titulo" style={{ fontSize: 15 }}>Pagamentos registrados</div>
          <div className="tabela">
            <table>
              <thead><tr><th>Data</th><th>Valor</th><th>Forma</th><th>Cobre até</th></tr></thead>
              <tbody>
                {pagamentos.length === 0 && <tr><td colSpan={4} style={{ color: "#9CA3AF", textAlign: "center", padding: 18 }}>Nenhum pagamento registrado.</td></tr>}
                {pagamentos.map((p, i) => (
                  <tr key={i}><td>{dataBr(p.em)}</td><td>{moeda(p.valor)}</td><td>{p.forma}</td><td>{dataBr(p.ate)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <button className={"btn " + (clinica.ativo ? "btn-perigo" : "btn-sucesso")} disabled={ocupado} onClick={alternarLogin}>
          {clinica.ativo ? "Bloquear login desta clínica" : "Liberar login desta clínica"}
        </button>
      </div>
    </div>
  );
}

// ── Aprovações de cadastro ───────────────────────────────────
function LinkCadastro() {
  const [copiado, setCopiado] = useState("");
  const base = DOMINIO_PUBLICO + "/cadastro";
  function copiar(texto, chave) {
    navigator.clipboard.writeText(texto)
      .then(() => { setCopiado(chave); setTimeout(() => setCopiado(""), 2000); })
      .catch(() => prompt("Copie o link:", texto));
  }
  function copiarIndicacao() {
    const nome = prompt("Nome de quem vai indicar (aparece no pedido de cadastro):");
    if (nome && nome.trim()) copiar(base + "?ind=" + encodeURIComponent(nome.trim()), "ind");
  }
  return (
    <div className="painel-form" style={{ maxWidth: 720, marginBottom: 18 }}>
      <div className="subtitulo-painel">Link de cadastro para divulgar</div>
      <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>Quem preencher cai na lista abaixo para você conferir o CRP e aprovar.</p>
      <div className="link-copia">{base}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => copiar(base, "geral")}>{copiado === "geral" ? "Copiado!" : "Copiar link"}</button>
        <button className="btn btn-ghost" onClick={copiarIndicacao}>{copiado === "ind" ? "Copiado!" : "Copiar link de indicação"}</button>
      </div>
    </div>
  );
}

function PaginaAprovacoes({ irPara }) {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [verResolvidos, setVerResolvidos] = useState(false);

  useEffect(() => {
    return db.collection("psi_interesse").onSnapshot(
      (snap) => { setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setCarregando(false); },
      () => setCarregando(false)
    );
  }, []);

  async function recusar(i) {
    if (!confirm("Recusar o pedido de " + i.nome + "?")) return;
    try {
      await db.collection("psi_interesse").doc(i.id).update({ status: "recusado", resolvidoEm: firebase.firestore.FieldValue.serverTimestamp() });
    } catch (e) { alert("Erro: " + e.message); }
  }

  if (carregando) return <p style={{ color: "#6B7280" }}>Carregando...</p>;

  const pendentes = itens.filter((i) => !i.status || i.status === "pendente")
    .sort((a, b) => ((b.criadoEm && b.criadoEm.seconds) || 0) - ((a.criadoEm && a.criadoEm.seconds) || 0));
  const resolvidos = itens.filter((i) => i.status && i.status !== "pendente");

  return (
    <div>
      <div className="pagina-titulo">Aprovações de cadastro</div>
      <p style={{ color: "#4B5563", fontSize: 13, maxWidth: 620, lineHeight: 1.6, marginBottom: 18 }}>
        Pedidos enviados pelo site. Antes de aprovar, confira o CRP no site do Conselho Federal de Psicologia (cadastro nacional de psicólogas). Ao aprovar, a conta é criada e ela entra em teste de 30 dias.
      </p>
      <LinkCadastro />
      {pendentes.length === 0 && <p style={{ color: "#9CA3AF" }}>Nenhum pedido aguardando aprovação.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pendentes.map((i) => (
          <div key={i.id} className="painel-form" style={{ maxWidth: 720, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{i.nome}</div>
              <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.7 }}>
                {[i.email, i.telefone, i.cidade, i.crp ? "CRP " + i.crp : "", i.indicadoPor ? "indicada por " + i.indicadoPor : "", i.origem ? "origem: " + i.origem : "", i.criadoEm ? "em " + dataBr(i.criadoEm) : ""].filter(Boolean).join(" · ")}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a className="btn btn-ghost" style={{ textDecoration: "none" }} href="https://cadastro.cfp.org.br/" target="_blank" rel="noopener">Conferir CRP</a>
              <button className="btn btn-ghost" onClick={() => recusar(i)}>Recusar</button>
              <button className="btn btn-primario" onClick={() => irPara("nova", { nome: i.nome, email: i.email, cidade: i.cidade || "", crp: i.crp || "", interesseId: i.id })}>Aprovar e cadastrar</button>
            </div>
          </div>
        ))}
      </div>
      {resolvidos.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={() => setVerResolvidos(!verResolvidos)}>{verResolvidos ? "Esconder" : "Ver"} pedidos já resolvidos ({resolvidos.length})</button>
          {verResolvidos && (
            <div className="tabela" style={{ marginTop: 12 }}>
              <table>
                <tbody>
                  {resolvidos.map((i) => (
                    <tr key={i.id}><td style={{ fontWeight: 600 }}>{i.nome}</td><td>{i.email}</td><td><span className={"badge " + (i.status === "aprovado" ? "badge-ativo" : "badge-inativo")}>{i.status}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Cobrança automática (Asaas) ──────────────────────────────
function PainelAsaas() {
  const [estado, setEstado] = useState(null);
  const [msg, setMsg] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function chamar(nome, texto) {
    setOcupado(true);
    setMsg("");
    try {
      const r = await functions.httpsCallable(nome)();
      if (nome === "asaasStatus") setEstado(r.data);
      else setMsg(texto);
      if (nome !== "asaasStatus") {
        const s = await functions.httpsCallable("asaasStatus")();
        setEstado(s.data);
      }
    } catch (e) {
      setMsg("Erro: " + e.message);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="painel-form" style={{ maxWidth: 560, marginBottom: 24 }}>
      <div className="subtitulo-painel">Cobrança automática (Asaas)</div>
      <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 12, lineHeight: 1.6 }}>
        Quando ligada, a psicóloga assina pelo próprio sistema, paga pelo link do Asaas e o plano é liberado sozinho assim que o pagamento é confirmado.
      </p>
      {estado && (
        <div style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 12 }}>
          <div>Ambiente: <strong>{estado.ambiente === "producao" ? "Produção (dinheiro real)" : "Teste (sandbox, sem dinheiro real)"}</strong></div>
          <div>Saldo da conta: <strong>{moeda(estado.saldo)}</strong></div>
          <div>Cobrança automática: <strong>{estado.cobrancaAtiva ? "ligada" : "ainda não ligada"}</strong></div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn btn-ghost" disabled={ocupado} onClick={() => chamar("asaasStatus")}>Testar conexão</button>
        <button className="btn btn-primario" disabled={ocupado} onClick={() => chamar("asaasConfigurarWebhook", "Pronto: o Asaas vai avisar o PsiCoWorking de cada pagamento, e a cobrança automática está ligada.")}>Ligar cobrança automática</button>
      </div>
      {msg && <div className={msg.startsWith("Erro") ? "msg-erro" : "msg-ok"}>{msg}</div>}
    </div>
  );
}

// ── Depoimentos de psicólogas (para o site) ──────────────────
function PaginaDepoimentos() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [edicao, setEdicao] = useState({});
  const [copiado, setCopiado] = useState("");
  const [msg, setMsg] = useState("");
  const link = DOMINIO_PUBLICO + "/depoimento";
  const convite =
    "Olá! Você está usando o PsiCoWorking e eu adoraria saber a sua opinião. " +
    "Se puder deixar uma mensagem curta (menos de 1 minuto), com o seu nome, neste link: " + link + ". " +
    "Ela só vai ao ar no site depois que eu revisar, e só com a autorização que você marca no formulário. Obrigada!";

  useEffect(() => {
    return db.collection("site_depoimentos").onSnapshot(
      (snap) => { setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setCarregando(false); },
      () => setCarregando(false)
    );
  }, []);

  function copiar(texto, chave) {
    navigator.clipboard.writeText(texto)
      .then(() => { setCopiado(chave); setTimeout(() => setCopiado(""), 2000); })
      .catch(() => prompt("Copie:", texto));
  }

  const valor = (d, campo) => (edicao[d.id] && edicao[d.id][campo] !== undefined ? edicao[d.id][campo] : (d[campo] || ""));
  const mudar = (d, campo, v) => setEdicao((e) => ({ ...e, [d.id]: { ...(e[d.id] || {}), [campo]: v } }));

  async function salvar(d, aprovado) {
    setMsg("");
    try {
      await db.collection("site_depoimentos").doc(d.id).update({
        nome: valor(d, "nome").trim(), detalhe: valor(d, "detalhe").trim(), texto: valor(d, "texto").trim(),
        aprovado, aprovadoEm: aprovado ? firebase.firestore.FieldValue.serverTimestamp() : firebase.firestore.FieldValue.delete(),
      });
      setMsg(aprovado ? "Depoimento publicado no site." : "Depoimento salvo.");
    } catch (e) { setMsg("Erro: " + e.message); }
  }

  async function excluir(d) {
    if (!confirm("Excluir o depoimento de " + d.nome + "? Não dá para desfazer.")) return;
    try { await db.collection("site_depoimentos").doc(d.id).delete(); } catch (e) { setMsg("Erro: " + e.message); }
  }

  const ordenar = (a, b) => ((b.criadoEm && b.criadoEm.seconds) || 0) - ((a.criadoEm && a.criadoEm.seconds) || 0);
  const pendentes = itens.filter((d) => !d.aprovado).sort(ordenar);
  const publicados = itens.filter((d) => d.aprovado).sort(ordenar);

  const cartao = (d, publicado) => (
    <div key={d.id} className="painel-form" style={{ maxWidth: 720 }}>
      <div className="form-grupo"><label>Nome (como aparece no site)</label><input value={valor(d, "nome")} onChange={(e) => mudar(d, "nome", e.target.value)} /></div>
      <div className="form-grupo"><label>Cidade ou CRP</label><input value={valor(d, "detalhe")} onChange={(e) => mudar(d, "detalhe", e.target.value)} /></div>
      <div className="form-grupo"><label>Mensagem</label>
        <textarea rows={4} style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit" }}
          value={valor(d, "texto")} onChange={(e) => mudar(d, "texto", e.target.value)} />
      </div>
      <div style={{ fontSize: 11.5, color: "#6B7280", marginBottom: 10 }}>
        {d.criadoEm ? "Enviado em " + dataBr(d.criadoEm) : ""}{d.autorizou ? " · autorizou a publicação" : ""}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!publicado && <button className="btn btn-primario" onClick={() => salvar(d, true)}>Publicar no site</button>}
        {publicado && <button className="btn btn-ghost" onClick={() => salvar(d, true)}>Salvar alterações</button>}
        {publicado && <button className="btn btn-ghost" onClick={() => salvar(d, false)}>Tirar do site</button>}
        {!publicado && <button className="btn btn-ghost" onClick={() => salvar(d, false)}>Salvar sem publicar</button>}
        <button className="btn btn-perigo" onClick={() => excluir(d)}>Excluir</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="pagina-titulo">Depoimentos</div>
      <div className="painel-form" style={{ maxWidth: 720, marginBottom: 22 }}>
        <div className="subtitulo-painel">Link para pedir depoimentos</div>
        <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 8, lineHeight: 1.6 }}>
          Envie às psicólogas que já usam o sistema. O que elas escreverem chega aqui para você revisar. Nada vai ao site sem a sua aprovação, e só profissionais, nunca pacientes.
        </p>
        <div className="link-copia">{link}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={() => copiar(link, "link")}>{copiado === "link" ? "Copiado!" : "Copiar link"}</button>
          <button className="btn btn-primario" onClick={() => copiar(convite, "convite")}>{copiado === "convite" ? "Copiado!" : "Copiar mensagem de convite"}</button>
        </div>
      </div>

      {msg && <div className={msg.startsWith("Erro") ? "msg-erro" : "msg-ok"} style={{ maxWidth: 720, marginBottom: 14 }}>{msg}</div>}
      {carregando && <p style={{ color: "#6B7280" }}>Carregando...</p>}

      <div className="pagina-titulo" style={{ fontSize: 15 }}>Aguardando a sua revisão ({pendentes.length})</div>
      {!carregando && pendentes.length === 0 && <p style={{ color: "#9CA3AF", marginBottom: 20 }}>Nenhum depoimento novo.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 26 }}>{pendentes.map((d) => cartao(d, false))}</div>

      <div className="pagina-titulo" style={{ fontSize: 15 }}>Publicados no site ({publicados.length})</div>
      {!carregando && publicados.length === 0 && <p style={{ color: "#9CA3AF" }}>Nenhum ainda.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{publicados.map((d) => cartao(d, true))}</div>
    </div>
  );
}

// ── Planos e preços ──────────────────────────────────────────
function PaginaPlanos() {
  const planos = usarPlanos();
  const [f, setF] = useState(null);
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (f === null) {
      setF({
        essMensal: planos.essencial.precoMensal, essAnual: planos.essencial.precoAnual,
        plusMensal: planos.plus.precoMensal, plusAnual: planos.plus.precoAnual, plusCota: planos.plus.cotaIaMes,
        testeDias: planos.testeDias, testeIaUsos: planos.testeIaUsos, leituraDias: planos.somenteLeituraDias,
      });
    }
  }, [planos]);

  // Mantém a cópia pública dos preços (usada pelo site de vendas) igual à configuração atual.
  useEffect(() => {
    db.collection("plataforma_publico").doc("planos").set({
      testeDias: planos.testeDias,
      testeIaUsos: planos.testeIaUsos,
      essencial: { nome: planos.essencial.nome, precoMensal: Number(planos.essencial.precoMensal), precoAnual: Number(planos.essencial.precoAnual) },
      plus: { nome: planos.plus.nome, precoMensal: Number(planos.plus.precoMensal), precoAnual: Number(planos.plus.precoAnual), cotaIaMes: Number(planos.plus.cotaIaMes) },
    }).catch(() => {});
  }, [planos]);

  if (!f) return null;
  const campo = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  const num = (v) => Number(String(v).replace(",", "."));

  async function salvar() {
    setSalvando(true);
    setMsg("");
    try {
      await db.collection("plataforma_config").doc("planos").set({
        testeDias: num(f.testeDias), testeIaUsos: num(f.testeIaUsos), somenteLeituraDias: num(f.leituraDias),
        essencial: { nome: "Essencial", precoMensal: num(f.essMensal), precoAnual: num(f.essAnual) },
        plus: { nome: "Plus", precoMensal: num(f.plusMensal), precoAnual: num(f.plusAnual), cotaIaMes: num(f.plusCota) },
      }, { merge: true });
      setMsg("Planos salvos. Valem para novos cadastros e para as próximas mudanças de plano; quem já assina mantém o que foi gravado.");
    } catch (e) { setMsg("Erro: " + e.message); } finally { setSalvando(false); }
  }

  return (
    <div>
      <div className="pagina-titulo">Planos e preços</div>
      <PainelAsaas />
      <div className="painel-form" style={{ maxWidth: 560 }}>
        <div className="subtitulo-painel">Essencial (sem IA)</div>
        <div className="form-grupo"><label>Mensal (R$)</label><input {...campo("essMensal")} /></div>
        <div className="form-grupo"><label>Anual (R$)</label><input {...campo("essAnual")} /></div>
        <div className="subtitulo-painel" style={{ marginTop: 18 }}>Plus (com IA)</div>
        <div className="form-grupo"><label>Mensal (R$)</label><input {...campo("plusMensal")} /></div>
        <div className="form-grupo"><label>Anual (R$)</label><input {...campo("plusAnual")} /></div>
        <div className="form-grupo"><label>Usos de IA por mês</label><input {...campo("plusCota")} /></div>
        <div className="subtitulo-painel" style={{ marginTop: 18 }}>Teste</div>
        <div className="form-grupo"><label>Dias de teste</label><input {...campo("testeDias")} /></div>
        <div className="form-grupo"><label>Usos de IA durante o teste</label><input {...campo("testeIaUsos")} /></div>
        <div className="form-grupo"><label>Dias em somente leitura depois do teste</label><input {...campo("leituraDias")} /></div>
        <button className="btn btn-primario" onClick={salvar} disabled={salvando}>{salvando ? "Salvando..." : "Salvar planos"}</button>
        {msg && <div className={msg.startsWith("Erro") ? "msg-erro" : "msg-ok"}>{msg}</div>}
      </div>
    </div>
  );
}

// ── Nova Psicóloga ───────────────────────────────────────────
function PaginaNovaPsicologa({ prefill }) {
  const [form, setForm] = useState({
    nome: (prefill && prefill.nome) || "", email: (prefill && prefill.email) || "",
    crp: (prefill && prefill.crp) || "", cidade: (prefill && prefill.cidade) || "", titulo: "Psicóloga",
  });
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const [acessoTipo, setAcessoTipo] = useState("teste");
  const [acessoPlano, setAcessoPlano] = useState("essencial");
  const [acessoMeses, setAcessoMeses] = useState("0");

  function campo(key) {
    return { value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) };
  }

  async function cadastrar(e) {
    e.preventDefault();
    setResultado(null);
    setSalvando(true);
    try {
      const fn = functions.httpsCallable("cadastrarPsicologa");
      const acesso = acessoTipo === "cortesia"
        ? { tipo: "cortesia", plano: acessoPlano, meses: Number(acessoMeses) }
        : { tipo: "teste" };
      const { data } = await fn({ ...form, interesseId: (prefill && prefill.interesseId) || undefined, acesso });
      setResultado({ ok: true, link: data.linkDefinirSenha });
      setForm({ nome: "", email: "", crp: "", cidade: "", titulo: "Psicóloga" });
    } catch (err) {
      setResultado({ ok: false, msg: err.message });
    } finally {
      setSalvando(false);
    }
  }

  function copiar() {
    navigator.clipboard.writeText(resultado.link).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  return (
    <div>
      <div className="pagina-titulo">Cadastrar Nova Psicóloga</div>
      <p style={{ color: "#4B5563", fontSize: 13, maxWidth: 520, lineHeight: 1.6, marginBottom: 16 }}>
        Prefere que ela se cadastre sozinha? Envie o link de cadastro (menu Aprovações). Use este formulário quando for você quem cadastra.
      </p>
      <div className="painel-form">
        <form onSubmit={cadastrar}>
          <div className="form-grupo">
            <label>Nome completo *</label>
            <input type="text" required {...campo("nome")} />
          </div>
          <div className="form-grupo">
            <label>E-mail *</label>
            <input type="email" required {...campo("email")} />
          </div>
          <div className="form-grupo">
            <label>CRP</label>
            <input type="text" placeholder="ex: 09/12345" {...campo("crp")} />
          </div>
          <div className="form-grupo">
            <label>Cidade</label>
            <input type="text" {...campo("cidade")} />
          </div>
          <div className="form-grupo">
            <label>Título profissional</label>
            <input type="text" {...campo("titulo")} />
          </div>
          <div className="form-grupo">
            <label>Tipo de acesso</label>
            <select value={acessoTipo} onChange={(e) => setAcessoTipo(e.target.value)}>
              <option value="teste">Teste de 30 dias (depois assina um plano)</option>
              <option value="cortesia">Cortesia (acesso gratuito)</option>
            </select>
          </div>
          {acessoTipo === "cortesia" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div className="form-grupo" style={{ flex: 1, minWidth: 180 }}>
                <label>Plano da cortesia</label>
                <select value={acessoPlano} onChange={(e) => setAcessoPlano(e.target.value)}>
                  <option value="essencial">Essencial (sem IA)</option>
                  <option value="plus">Plus (com IA)</option>
                </select>
              </div>
              <div className="form-grupo" style={{ flex: 1, minWidth: 180 }}>
                <label>Duração</label>
                <select value={acessoMeses} onChange={(e) => setAcessoMeses(e.target.value)}>
                  <option value="0">Sem prazo</option>
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                </select>
              </div>
            </div>
          )}
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            <Icone nome="user-plus" tamanho={15} />
            {salvando ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        {resultado && resultado.ok && (
          <div className="msg-ok">
            Psicóloga cadastrada! Envie o link abaixo para ela definir a senha:
            <div className="link-copia">{resultado.link}</div>
            <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={copiar}>
              <Icone nome={copiado ? "check" : "copy"} tamanho={14} />
              {copiado ? "Copiado!" : "Copiar link"}
            </button>
          </div>
        )}
        {resultado && !resultado.ok && (
          <div className="msg-erro">{resultado.msg}</div>
        )}
      </div>
    </div>
  );
}

// ── App Principal ────────────────────────────────────────────
function App() {
  const [usuario, setUsuario] = useState(undefined);
  const [pagina, setPagina] = useState("dashboard");
  const [dadosNova, setDadosNova] = useState(null);

  function irPara(destino, dados) {
    setDadosNova(dados || null);
    setPagina(destino);
  }

  useEffect(() => {
    return auth.onAuthStateChanged(async (u) => {
      if (!u) { setUsuario(null); return; }
      const token = await u.getIdTokenResult();
      if (token.claims.role !== "admin_matriz") {
        // Pode ser uma psicóloga com o painel dela aberto neste navegador: não desloga.
        setUsuario(false);
      } else {
        setUsuario(u);
      }
    });
  }, []);

  if (usuario === undefined) return null;
  if (usuario === false) {
    return (
      <>
        <style>{estilos}</style>
        <div className="tela-login">
          <div className="card-login" style={{ textAlign: "center" }}>
            <h1>Área da administradora</h1>
            <p>Esta página é só para a administradora da plataforma. Você está conectada com o seu painel da clínica.</p>
            <a className="btn btn-primario" style={{ width: "100%", justifyContent: "center", textDecoration: "none", marginBottom: 10 }} href="/entrar">Ir para o meu painel</a>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => auth.signOut()}>Sair e entrar com outra conta</button>
          </div>
        </div>
      </>
    );
  }
  if (!usuario) return <TelaLogin aoLogar={setUsuario} />;

  const NAV = [
    { id: "dashboard", label: "Painel", icone: "layout-dashboard" },
    { id: "clinicas", label: "Clínicas", icone: "building-2" },
    { id: "aprovacoes", label: "Aprovações", icone: "user-check" },
    { id: "planos", label: "Planos", icone: "credit-card" },
    { id: "depoimentos", label: "Depoimentos", icone: "message-circle" },
    { id: "nova", label: "Nova Psicóloga", icone: "user-plus" },
    { id: "catalogo", label: "Fábulas e ferramentas", icone: "book-open" },
  ];

  const paginas = {
    dashboard: <PaginaDashboard irPara={irPara} />,
    clinicas: <PaginaClinicas key={(dadosNova && dadosNova.abrir) || "lista"} abrirId={dadosNova && dadosNova.abrir} />,
    aprovacoes: <PaginaAprovacoes irPara={irPara} />,
    planos: <PaginaPlanos />,
    depoimentos: <PaginaDepoimentos />,
    nova: <PaginaNovaPsicologa key={(dadosNova && dadosNova.interesseId) || "novo"} prefill={dadosNova} />,
    catalogo: <PaginaCatalogo />,
  };

  return (
    <>
      <style>{estilos}</style>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>PsiCoWorking</h1>
            <p>Admin Matriz</p>
          </div>
          <nav className="sidebar-nav">
            {NAV.map((item) => (
              <button
                key={item.id}
                className={"nav-item" + (pagina === item.id ? " ativo" : "")}
                onClick={() => irPara(item.id)}
              >
                <Icone nome={item.icone} tamanho={16} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button
              className="nav-item"
              style={{ padding: 0, fontSize: 12, color: "rgba(255,255,255,.5)" }}
              onClick={() => auth.signOut()}
            >
              <Icone nome="log-out" tamanho={14} />
              Sair
            </button>
          </div>
        </aside>

        <main className="conteudo">
          {paginas[pagina] || paginas.dashboard}
        </main>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
