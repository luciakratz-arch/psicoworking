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

const firebaseApp = firebase.initializeApp(FIREBASE_CONFIG, "psicoworking-matriz");
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
  .sidebar { width: 220px; background: #1E1B4B; color: white; display: flex; flex-direction: column; flex-shrink: 0; }
  .sidebar-logo { padding: 24px 20px 16px; border-bottom: 1px solid rgba(255,255,255,.1); }
  .sidebar-logo h1 { font-size: 15px; font-weight: 700; color: white; }
  .sidebar-logo p { font-size: 11px; color: rgba(255,255,255,.5); margin-top: 2px; }
  .sidebar-nav { flex: 1; padding: 16px 0; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px; cursor: pointer;
    font-size: 13px; color: rgba(255,255,255,.7); transition: background .15s; border: none;
    background: none; width: 100%; text-align: left; }
  .nav-item:hover, .nav-item.ativo { background: rgba(255,255,255,.1); color: white; }
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
  .btn-primario { background: #4F46E5; color: white; }
  .btn-perigo { background: #DC2626; color: white; }
  .btn-sucesso { background: #059669; color: white; }
  .btn-ghost { background: #F3F4F6; color: #374151; }
  .form-grupo { margin-bottom: 16px; }
  .form-grupo label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
  .form-grupo input { width: 100%; padding: 9px 12px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; font-family: inherit; }
  .form-grupo input:focus { outline: none; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
  .painel-form { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.06); max-width: 520px; }
  .msg-ok { background: #D1FAE5; color: #065F46; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-top: 12px; }
  .msg-erro { background: #FEE2E2; color: #991B1B; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-top: 12px; }
  .link-copia { background: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 8px; padding: 10px 14px;
    font-size: 12px; word-break: break-all; margin-top: 10px; color: #374151; }
  .tela-login { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1E1B4B; }
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
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────
function PaginaDashboard() {
  const [stats, setStats] = useState({ total: 0, ativas: 0, inativas: 0, recursos: 0 });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      db.collection("psi_profiles").get(),
      db.collection("recursos_terapeuticos").get(),
    ]).then(([profis, recursos]) => {
      const total = profis.size;
      const ativas = profis.docs.filter((d) => d.data().ativo !== false).length;
      setStats({ total, ativas, inativas: total - ativas, recursos: recursos.size });
      setCarregando(false);
    });
  }, []);

  if (carregando) return <p style={{ color: "#6B7280" }}>Carregando...</p>;

  return (
    <div>
      <div className="pagina-titulo">Dashboard</div>
      <div className="cartoes-stats">
        <div className="cartao-stat">
          <div className="valor" style={{ color: "#4F46E5" }}>{stats.total}</div>
          <div className="label">Clínicas cadastradas</div>
        </div>
        <div className="cartao-stat">
          <div className="valor" style={{ color: "#059669" }}>{stats.ativas}</div>
          <div className="label">Clínicas ativas</div>
        </div>
        <div className="cartao-stat">
          <div className="valor" style={{ color: "#DC2626" }}>{stats.inativas}</div>
          <div className="label">Clínicas inativas</div>
        </div>
        <div className="cartao-stat">
          <div className="valor" style={{ color: "#D97706" }}>{stats.recursos}</div>
          <div className="label">Recursos no catálogo</div>
        </div>
      </div>
    </div>
  );
}

// ── Lista de Clínicas ────────────────────────────────────────
function PaginaClinicas() {
  const [clinicas, setClinicas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(null);

  useEffect(() => {
    db.collection("psi_profiles").orderBy("nome").onSnapshot((snap) => {
      setClinicas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCarregando(false);
    });
  }, []);

  async function alternarStatus(c) {
    setProcessando(c.id);
    try {
      const fn = functions.httpsCallable("ativarDesativarClinica");
      await fn({ psiId: c.id, ativo: !c.ativo });
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setProcessando(null);
    }
  }

  if (carregando) return <p style={{ color: "#6B7280" }}>Carregando...</p>;

  return (
    <div>
      <div className="pagina-titulo">Clínicas Cadastradas</div>
      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>CRP</th>
              <th>Cidade</th>
              <th>Status</th>
              <th>Acao</th>
            </tr>
          </thead>
          <tbody>
            {clinicas.length === 0 && (
              <tr><td colSpan={6} style={{ color: "#9CA3AF", textAlign: "center", padding: 24 }}>Nenhuma clínica cadastrada ainda.</td></tr>
            )}
            {clinicas.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.nome}</td>
                <td>{c.email}</td>
                <td>{c.crp || "—"}</td>
                <td>{c.cidade || "—"}</td>
                <td>
                  <span className={"badge " + (c.ativo !== false ? "badge-ativo" : "badge-inativo")}>
                    {c.ativo !== false ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td>
                  <button
                    className={"btn " + (c.ativo !== false ? "btn-perigo" : "btn-sucesso")}
                    style={{ padding: "5px 12px", fontSize: 12 }}
                    onClick={() => alternarStatus(c)}
                    disabled={processando === c.id}
                  >
                    {processando === c.id ? "..." : (c.ativo !== false ? "Desativar" : "Ativar")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Nova Psicóloga ───────────────────────────────────────────
function PaginaNovaPsicologa() {
  const [form, setForm] = useState({ nome: "", email: "", crp: "", cidade: "", titulo: "Psicóloga" });
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [copiado, setCopiado] = useState(false);

  function campo(key) {
    return { value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) };
  }

  async function cadastrar(e) {
    e.preventDefault();
    setResultado(null);
    setSalvando(true);
    try {
      const fn = functions.httpsCallable("cadastrarPsicologa");
      const { data } = await fn(form);
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

  useEffect(() => {
    return auth.onAuthStateChanged(async (u) => {
      if (!u) { setUsuario(null); return; }
      const token = await u.getIdTokenResult();
      if (token.claims.role !== "admin_matriz") {
        await auth.signOut();
        setUsuario(null);
      } else {
        setUsuario(u);
      }
    });
  }, []);

  if (usuario === undefined) return null;
  if (!usuario) return <TelaLogin aoLogar={setUsuario} />;

  const NAV = [
    { id: "dashboard", label: "Dashboard", icone: "layout-dashboard" },
    { id: "clinicas", label: "Clínicas", icone: "building-2" },
    { id: "nova", label: "Nova Psicóloga", icone: "user-plus" },
  ];

  const paginas = {
    dashboard: <PaginaDashboard />,
    clinicas: <PaginaClinicas />,
    nova: <PaginaNovaPsicologa />,
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
                onClick={() => setPagina(item.id)}
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
