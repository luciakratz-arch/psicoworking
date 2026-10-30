// ═══════════════════════════════════════════════════════════════
//  PAINEL GERAL — todos os negócios num só lugar (só admin_matriz).
//  PsiCoWorking, 9&Self, NR-1 Map, clínica da Dra. Lucia e infoprodutos (Hotmart).
//  Os produtos antigos moram no projeto "entrevista-inicial": aqui só se LÊ.
// ═══════════════════════════════════════════════════════════════

const CONFIG_ANTIGO = {
  apiKey: "AIzaSyDnrgaY8R0Zetkr18uHQJAZXIUa4EwDnv4",
  authDomain: "entrevista-inicial.firebaseapp.com",
  projectId: "entrevista-inicial",
  storageBucket: "entrevista-inicial.firebasestorage.app",
  messagingSenderId: "437375609844",
  appId: "1:437375609844:web:9435b1fb3b21778f2e27a1",
};
const appAntigo = firebase.initializeApp(CONFIG_ANTIGO, "entrevista-inicial-leitura");
const dbAntigo = appAntigo.firestore();
const authAntigo = appAntigo.auth();
const EMAIL_DONA = "luciakratz@gmail.com";

const LINKS_PRODUTOS = {
  nself: "https://luciakratz-arch.github.io/9-Self/index.html?login=true",
  nr1: "https://luciakratz-arch.github.io/NR-1Map/admin.html",
  clinica: "https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/admin/",
  hotmart: "https://app.hotmart.com",
};

function mesAtualIso() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }).slice(0, 7);
}

// Lê uma coleção inteira do projeto antigo; devolve { docs, erro }.
async function lerAntigo(nome) {
  try {
    const s = await dbAntigo.collection(nome).get();
    return { docs: s.docs.map((d) => ({ id: d.id, ...d.data() })), erro: null };
  } catch (e) {
    return { docs: [], erro: e.code || e.message };
  }
}

function numero(v) {
  if (typeof v === "number") return v;
  const s = String(v || "0").trim();
  // "1.234,56" (formato brasileiro) ou "1234.56" (formato do computador)
  const n = s.includes(",") ? parseFloat(s.replace(/\./g, "").replace(",", ".")) : parseFloat(s);
  return isNaN(n) ? 0 : n;
}
function isoDe(v) {
  if (!v) return "";
  if (v.toDate) return v.toDate().toISOString();
  return String(v);
}
function noMes(v, mes) {
  return isoDe(v).slice(0, 7) === mes;
}

function CartaoProduto({ titulo, cor, linhas, aviso, botao, carregando }) {
  return (
    <div className="painel-form" style={{ borderTop: "4px solid " + cor, marginBottom: 0 }}>
      <div className="subtitulo-painel" style={{ marginBottom: 10 }}>{titulo}</div>
      {carregando && <p style={{ color: "#6B7280", fontSize: 13 }}>Carregando...</p>}
      {!carregando && linhas && linhas.map(([rot, val, destaque], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, padding: "5px 0", borderBottom: "1px solid #F3F4F6" }}>
          <span style={{ color: "#6B7280" }}>{rot}</span>
          <strong style={destaque ? { color: cor } : undefined}>{val}</strong>
        </div>
      ))}
      {aviso && <p style={{ fontSize: 12, color: "#6B7280", margin: "10px 0 0", lineHeight: 1.5 }}>{aviso}</p>}
      {botao && <div style={{ marginTop: 12 }}>{botao}</div>}
    </div>
  );
}

// ── Importação de planilha do Hotmart ────────────────────────
function separarCsv(texto) {
  const sep = (texto.split("\n")[0].match(/;/g) || []).length >= (texto.split("\n")[0].match(/,/g) || []).length ? ";" : ",";
  const linhas = [];
  let campo = "", linha = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) { linha.push(campo); campo = ""; }
    else if (c === "\n") { linha.push(campo); linhas.push(linha); linha = []; campo = ""; }
    else if (c !== "\r") campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas.filter((l) => l.some((x) => x.trim()));
}
function semAcento(t) {
  return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
function achar(cab, opcoes) {
  for (const o of opcoes) {
    const i = cab.findIndex((h) => semAcento(h).includes(o));
    if (i >= 0) return i;
  }
  return -1;
}
function dataIso(t) {
  const s = String(t || "").trim();
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return m[3] + "-" + m[2] + "-" + m[1];
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[0] : "";
}

function ImportarHotmart({ aoImportar }) {
  const [msg, setMsg] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function ler(e) {
    const arq = e.target.files[0];
    if (!arq) return;
    setOcupado(true);
    setMsg("");
    try {
      const linhas = separarCsv(await arq.text());
      if (linhas.length < 2) throw new Error("A planilha está vazia.");
      const cab = linhas[0];
      const iId = achar(cab, ["transacao", "codigo da transacao", "transaction"]);
      const iProd = achar(cab, ["nome do produto", "produto", "product"]);
      const iSt = achar(cab, ["status"]);
      const iVal = achar(cab, ["valor recebido", "preco total", "valor liquido", "faturamento liquido", "valor", "preco"]);
      const iData = achar(cab, ["data de aprovacao", "confirmacao do pagamento", "data do pedido", "data da transacao", "data"]);
      const iNome = achar(cab, ["nome do comprador", "comprador", "nome"]);
      if (iVal < 0 || iData < 0) throw new Error("Não achei as colunas de valor e data. Me mande a planilha para eu ajustar.");
      const lote = [];
      linhas.slice(1).forEach((l, n) => {
        const data = dataIso(l[iData]);
        if (!data) return;
        const id = (iId >= 0 && l[iId] ? l[iId] : "linha-" + data + "-" + n).replace(/[^A-Za-z0-9_-]/g, "_");
        lote.push({
          id,
          produto: iProd >= 0 ? l[iProd].trim() : "Infoproduto",
          status: iSt >= 0 ? l[iSt].trim() : "",
          valor: numero(l[iVal]),
          data,
          comprador: iNome >= 0 ? l[iNome].trim() : "",
        });
      });
      if (!lote.length) throw new Error("Nenhuma venda com data válida.");
      for (let i = 0; i < lote.length; i += 400) {
        const b = db.batch();
        lote.slice(i, i + 400).forEach((v) => {
          const { id, ...resto } = v;
          b.set(db.collection("plataforma_vendas_externas").doc(id), { ...resto, origem: "hotmart", importadoEm: firebase.firestore.FieldValue.serverTimestamp() });
        });
        await b.commit();
      }
      setMsg("Pronto: " + lote.length + " vendas importadas. Importar de novo a mesma planilha não duplica.");
      aoImportar && aoImportar();
    } catch (err) {
      setMsg("Erro: " + err.message);
    } finally {
      setOcupado(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="btn btn-primario" style={{ cursor: "pointer", display: "inline-flex" }}>
        {ocupado ? "Importando..." : "Importar planilha do Hotmart"}
        <input type="file" accept=".csv,text/csv" onChange={ler} disabled={ocupado} style={{ display: "none" }} />
      </label>
      {msg && <div className={msg.startsWith("Erro") ? "msg-erro" : "msg-ok"} style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}

function PaginaPainelGeral({ irPara }) {
  const planos = usarPlanos();
  const { lista, pronto } = usarClinicas();
  const [mes, setMes] = useState(mesAtualIso());
  const [dados, setDados] = useState({ pronto: false });
  const [usuarioAntigo, setUsuarioAntigo] = useState(null);
  const [erroGoogle, setErroGoogle] = useState("");
  const [vendasExt, setVendasExt] = useState([]);

  useEffect(() => authAntigo.onAuthStateChanged((u) => setUsuarioAntigo(u && u.email === EMAIL_DONA ? u : null)), []);

  function carregarExternas() {
    db.collection("plataforma_vendas_externas").get()
      .then((s) => setVendasExt(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(() => setVendasExt([]));
  }
  useEffect(carregarExternas, []);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [vendas, creditos, lanc, pagNr1] = await Promise.all([
        lerAntigo("nself_vendas"), lerAntigo("nself_creditos_log"), lerAntigo("clinica_lancamentos"),
        usuarioAntigo ? lerAntigo("nr1map_pagamentos") : Promise.resolve({ docs: [], erro: "sem-login" }),
      ]);
      if (vivo) setDados({ pronto: true, vendas, creditos, lanc, pagNr1 });
    })();
    return () => { vivo = false; };
  }, [usuarioAntigo]);

  async function entrarGoogle() {
    setErroGoogle("");
    try {
      const r = await authAntigo.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      if (r.user.email !== EMAIL_DONA) {
        await authAntigo.signOut();
        setErroGoogle("Entre com a conta " + EMAIL_DONA + ", que é a dona do NR-1 Map.");
      }
    } catch (e) {
      setErroGoogle(e.code === "auth/unauthorized-domain"
        ? "Falta autorizar o endereço psicoworking.app.br no projeto entrevista-inicial (Authentication, Configurações, Domínios autorizados)."
        : "Não foi possível entrar: " + (e.message || e.code));
    }
  }

  // ── PsiCoWorking ──
  let psiReceita = 0, psiAtivas = 0, psiTeste = 0;
  if (pronto) {
    lista.filter((c) => c.assinatura).forEach((c) => {
      const a = c.assinatura;
      if (a.situacao === "ativa" || a.situacao === "atrasada") psiAtivas++;
      if (a.situacao === "teste") psiTeste++;
      if (a.origem === "fundadora" || a.origem === "cortesia" || (a.situacao !== "ativa" && a.situacao !== "atrasada")) return;
      const p = a.plano === "plus" ? planos.plus : planos.essencial;
      psiReceita += a.ciclo === "anual" ? Number(p.precoAnual || 0) / 12 : Number(p.precoMensal || 0);
    });
  }

  // ── 9&Self ──
  const PAGO = ["pago", "paga", "confirmado", "aprovado", "concluido", "concluida", "recebido"];
  let nsPago = 0, nsQtd = 0, nsAguard = 0;
  if (dados.pronto) {
    dados.vendas.docs.forEach((v) => {
      if (!noMes(v.criadoEm, mes)) return;
      if (PAGO.includes(semAcento(v.status))) { nsPago += numero(v.valor); nsQtd++; } else nsAguard++;
    });
    dados.creditos.docs.forEach((c) => { if (noMes(c.criadoEm, mes) && numero(c.valorPago) > 0) { nsPago += numero(c.valorPago); nsQtd++; } });
  }

  // ── NR-1 Map ──
  let nrPago = 0, nrQtd = 0;
  if (dados.pronto && !dados.pagNr1.erro) {
    dados.pagNr1.docs.forEach((p) => {
      const quando = p.pagoEm || p.dataPagamento || p.criadoEm || p.data;
      if (!noMes(quando, mes)) return;
      const st = semAcento(p.status);
      if (st && !PAGO.includes(st)) return;
      nrPago += numero(p.valor || p.valorPago || p.amount); nrQtd++;
    });
  }

  // ── Clínica ──
  let clRec = 0, clAReceber = 0, clDesp = 0;
  if (dados.pronto) {
    dados.lanc.docs.forEach((l) => {
      const ehDesp = l.tipo_lancamento === "despesa";
      if (ehDesp) { if (semAcento(l.status) === "pago" && noMes(l.dataPagamento || l.data, mes)) clDesp += numero(l.valor); return; }
      if (semAcento(l.status) === "recebido" && noMes(l.dataPagamento || l.data, mes)) clRec += numero(l.valor);
      else if (semAcento(l.status) === "pendente" && noMes(l.data, mes)) clAReceber += numero(l.valor);
    });
  }

  // ── Infoprodutos ──
  const extMes = vendasExt.filter((v) => noMes(v.data, mes));
  const okExt = extMes.filter((v) => { const s = semAcento(v.status); return !s || ["aprovado", "completo", "complete", "approved", "pago", "concluido"].some((x) => s.includes(x)); });
  const hotTotal = okExt.reduce((s, v) => s + numero(v.valor), 0);
  const porProduto = {};
  okExt.forEach((v) => { porProduto[v.produto] = (porProduto[v.produto] || 0) + numero(v.valor); });

  const totalGeral = psiReceita + nsPago + nrPago + clRec + hotTotal;
  const carreg = !dados.pronto || !pronto;
  const erroAntigo = dados.pronto && (dados.vendas.erro || dados.lanc.erro);

  return (
    <div>
      <div className="pagina-titulo">Painel geral</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <label style={{ fontSize: 13, color: "#6B7280" }}>Mês:</label>
        <input type="month" value={mes} onChange={(e) => setMes(e.target.value || mesAtualIso())} style={{ padding: "8px 10px", border: "1px solid #E5E7EB", borderRadius: 8 }} />
      </div>

      <div className="cartoes-stats">
        <div className="cartao-stat"><div className="valor" style={{ color: "#059669" }}>{carreg ? "..." : moeda(totalGeral)}</div><div className="label">Entrou no mês (soma dos negócios abaixo)</div></div>
        <div className="cartao-stat"><div className="valor" style={{ color: "#DC2626" }}>{carreg ? "..." : moeda(clDesp)}</div><div className="label">Despesas pagas da clínica no mês</div></div>
      </div>
      {erroAntigo && <div className="msg-erro" style={{ marginBottom: 12 }}>Não consegui ler os dados do sistema antigo ({erroAntigo}). Tente de novo mais tarde.</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16, marginBottom: 20 }}>
        <CartaoProduto titulo="PsiCoWorking" cor="#6A2BD9" carregando={!pronto}
          linhas={[["Clínicas pagantes", String(psiAtivas)], ["Em teste", String(psiTeste)], ["Receita mensal estimada", moeda(psiReceita), true]]}
          aviso="É uma estimativa pelos planos; a cobrança real pelo Asaas ainda está em teste."
          botao={<button className="btn btn-ghost" onClick={() => irPara("dashboard")}>Abrir painel do PsiCoWorking</button>} />
        <CartaoProduto titulo="9&Self" cor="#7C3AED" carregando={carreg}
          linhas={[["Vendas pagas e créditos comprados", String(nsQtd)], ["Aguardando pagamento", String(nsAguard)], ["Entrou no mês", moeda(nsPago), true]]}
          botao={<a className="btn btn-ghost" style={{ textDecoration: "none" }} href={LINKS_PRODUTOS.nself} target="_blank" rel="noopener">Abrir o 9&Self</a>} />
        <CartaoProduto titulo="NR-1 Map" cor="#059669" carregando={carreg}
          linhas={usuarioAntigo && !dados.pagNr1?.erro ? [["Pagamentos no mês", String(nrQtd)], ["Entrou no mês", moeda(nrPago), true]] : [["Financeiro", "não conectado"]]}
          aviso={usuarioAntigo ? (dados.pagNr1?.erro ? "Sem permissão para ler os pagamentos (" + dados.pagNr1.erro + ")." : null) : "Para ver o financeiro do NR-1 Map, entre com a conta " + EMAIL_DONA + "."}
          botao={<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!usuarioAntigo && <button className="btn btn-primario" onClick={entrarGoogle}>Conectar com Google</button>}
            <a className="btn btn-ghost" style={{ textDecoration: "none" }} href={LINKS_PRODUTOS.nr1} target="_blank" rel="noopener">Abrir o NR-1 Map</a>
          </div>} />
        <CartaoProduto titulo="Clínica Dra. Lucia Kratz" cor="#0EA5E9" carregando={carreg}
          linhas={[["Recebido no mês", moeda(clRec), true], ["A receber no mês", moeda(clAReceber)], ["Despesas pagas", moeda(clDesp)], ["Resultado do mês", moeda(clRec - clDesp)]]}
          aviso="Vem do sistema antigo da clínica. Depois da migração, vem do próprio PsiCoWorking."
          botao={<a className="btn btn-ghost" style={{ textDecoration: "none" }} href={LINKS_PRODUTOS.clinica} target="_blank" rel="noopener">Abrir o sistema da clínica</a>} />
        <CartaoProduto titulo="Infoprodutos (Hotmart)" cor="#F97316"
          linhas={[["Vendas aprovadas no mês", String(okExt.length)], ["Entrou no mês", moeda(hotTotal), true], ...Object.entries(porProduto).slice(0, 5).map(([p, v]) => [p, moeda(v)])]}
          aviso={vendasExt.length ? vendasExt.length + " vendas importadas no total." : "Nenhuma venda importada ainda. Baixe o relatório de vendas no Hotmart (planilha CSV) e importe aqui."}
          botao={<div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <ImportarHotmart aoImportar={carregarExternas} />
            <a className="btn btn-ghost" style={{ textDecoration: "none" }} href={LINKS_PRODUTOS.hotmart} target="_blank" rel="noopener">Abrir o Hotmart</a>
          </div>} />
      </div>
      {erroGoogle && <div className="msg-erro">{erroGoogle}</div>}
    </div>
  );
}
