// ═══════════════════════════════════════════════════════════════
//  psi/paciente/app.js — Portal do Paciente (Fase 1)
//
//  Babel CDN inline (não usa o pipeline pré-compilado do admin — ver
//  CLAUDE.md REGRA 2, essa regra é só pro admin). Login via Firebase
//  Auth de verdade (a conta já existe desde que a psicóloga cadastrou
//  o paciente ou ele se autocadastrou — REGRA 9, nunca senha
//  comparada na mão).
//
//  Fase 1 do cronograma: login, painel simples, e as ferramentas que
//  já tinham visualização pronta no admin (Gestão da Ansiedade e
//  leitor de Fábula) agora gravando de verdade pro paciente logado.
//  As demais ferramentas e a Psicoeducação aparecem só como
//  visualização de leitura por enquanto — ver PENDÊNCIAS no final.
// ═══════════════════════════════════════════════════════════════

const { useState, useEffect } = React;

function Icone({ nome, tamanho = 16 }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  return <i data-lucide={nome} className="icone-lucide" style={{ width: tamanho, height: tamanho }}></i>;
}

// ─── Sessão / login ────────────────────────────────────────────
function useUsuarioLogado() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cancelar = auth.onAuthStateChanged(async (usuarioFirebase) => {
      if (!usuarioFirebase) {
        setUsuario(null);
        setCarregando(false);
        return;
      }
      const resultado = await usuarioFirebase.getIdTokenResult(true);
      setUsuario({
        uid: usuarioFirebase.uid,
        email: usuarioFirebase.email,
        psiId: resultado.claims.psi_id || null,
        role: resultado.claims.role || null,
      });
      setCarregando(false);
    });
    return cancelar;
  }, []);

  return { usuario, carregando };
}

function logout() {
  auth.signOut();
}

// Descobre de qual clínica é o paciente ANTES do login, pra já mostrar
// o nome/logo/cor da psicóloga dele na tela de login (não da pra usar
// o custom claim ainda, ele só existe depois de autenticar). Vem do
// parâmetro ?psi= na URL (link que a psicóloga compartilha) ou, se já
// logou aqui antes, do que ficou guardado no navegador.
function pegarPsiIdConhecido() {
  const daUrl = new URLSearchParams(window.location.search).get("psi");
  if (daUrl) return daUrl;
  try { return localStorage.getItem("psicoworking_psi_id") || ""; } catch (e) { return ""; }
}

function usarConfiguracaoPreLogin(psiId) {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    if (!psiId) return;
    db.collection("psi_config").doc(psiId).get().then((doc) => {
      if (doc.exists) {
        const dados = doc.data();
        setConfig(dados);
        aplicarCorMarca(dados.corPrimaria);
      }
    }).catch(() => {});
  }, [psiId]);
  return config;
}

// psi_config só guarda UMA cor (corPrimaria) — as variações mais
// clara/escura usadas no degradê do painel de login são calculadas a
// partir dela, pra tudo ficar de fato na identidade visual da
// psicóloga (mesmo cálculo usado no admin).
function ajustarClaridadeCor(hex, percentual) {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) & 0xff, g = (num >> 8) & 0xff, b = num & 0xff;
  const ajustar = (canal) => (percentual >= 0 ? canal + (255 - canal) * (percentual / 100) : canal * (1 + percentual / 100));
  r = Math.min(255, Math.max(0, Math.round(ajustar(r))));
  g = Math.min(255, Math.max(0, Math.round(ajustar(g))));
  b = Math.min(255, Math.max(0, Math.round(ajustar(b))));
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function aplicarCorMarca(corPrimaria) {
  if (!corPrimaria) return;
  document.documentElement.style.setProperty("--cor-marca", corPrimaria);
  document.documentElement.style.setProperty("--cor-marca-clara", ajustarClaridadeCor(corPrimaria, 35));
  document.documentElement.style.setProperty("--cor-marca-escura", ajustarClaridadeCor(corPrimaria, -45));
}

function TelaLogin({ configClinica }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState("");
  const [msgReset, setMsgReset] = useState("");

  async function aoEntrar(evento) {
    evento.preventDefault();
    setErro("");
    setEntrando(true);
    try {
      await auth.signInWithEmailAndPassword(email, senha);
    } catch (e) {
      setErro("E-mail ou senha incorretos. Confira e tente de novo.");
    } finally {
      setEntrando(false);
    }
  }

  async function esqueciSenha() {
    if (!email) { setErro("Digite seu e-mail acima primeiro, depois clique em Esqueci minha senha."); return; }
    try {
      await auth.sendPasswordResetEmail(email);
      setMsgReset("Enviamos um link para " + email + " — confira sua caixa de entrada.");
      setErro("");
    } catch (e) {
      setErro("Não foi possível enviar o link. Confira o e-mail digitado.");
    }
  }

  const temMarca = configClinica && (configClinica.nome || configClinica.logoUrl || configClinica.fotoUrl);

  return (
    <div className="tela-login-split">
      <div className="painel-marca-p">
        <div className="painel-marca-p-conteudo">
          <span className="etiqueta-tipo-portal">Portal do Paciente</span>
          {temMarca ? (
            <div className="marca-clinica-login">
              <div className="foto-profissional-login-caixa">
                {configClinica.fotoUrl ? (
                  <img src={configClinica.fotoUrl} alt={configClinica.nome} className="foto-profissional-login" />
                ) : (
                  <div className="avatar-clinica-login">{(configClinica.nome || "?").trim().charAt(0).toUpperCase()}</div>
                )}
                {configClinica.logoUrl && <img src={configClinica.logoUrl} alt="Logo" className="selo-logo-login" />}
              </div>
              <span className="nome-clinica-login">{configClinica.nome}</span>
            </div>
          ) : (
            <span className="logo-plataforma-p-negativa">PsiCoWorking</span>
          )}
          <h1 style={{ marginTop: 16 }}>Bem-vindo(a) de volta</h1>
          <p>Acesse seu portal e continue de onde parou.</p>
        </div>
      </div>
      <div className="painel-formulario-p">
        <form className="cartao-login" onSubmit={aoEntrar}>
          <span className="logo-plataforma-p">PsiCoWorking</span>
          <h2>Portal do Paciente</h2>
          <p className="subtitulo">Entre com o e-mail e a senha que você cadastrou.</p>

          <label>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />

          {erro && <p className="erro-p">{erro}</p>}
          {msgReset && <p className="erro-p" style={{ background: "#DCFCE7", color: "#166534" }}>{msgReset}</p>}

          <button type="submit" className="botao-primario-p" style={{ marginTop: 18 }} disabled={entrando}>
            {entrando ? "Entrando..." : "Entrar"}
          </button>
          <button type="button" className="link-p" style={{ display: "block", textAlign: "center", width: "100%" }} onClick={esqueciSenha}>
            Esqueci minha senha
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Configuração visual da clínica (cor/logo) ────────────────
function usarConfiguracaoClinica(psiId) {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    if (!psiId) return;
    const cancelar = db.collection("psi_config").doc(psiId).onSnapshot((doc) => {
      const dados = doc.exists ? doc.data() : {};
      setConfig(dados);
      aplicarCorMarca(dados.corPrimaria);
    });
    return cancelar;
  }, [psiId]);
  return config;
}

// ─── App principal ──────────────────────────────────────────────
function App() {
  const { usuario, carregando } = useUsuarioLogado();
  const [tela, setTela] = useState("painel");
  const configClinica = usarConfiguracaoClinica(usuario && usuario.psiId);
  const configPreLogin = usarConfiguracaoPreLogin(!usuario ? pegarPsiIdConhecido() : null);
  const [paciente, setPaciente] = useState(null);
  const [recursoAberto, setRecursoAberto] = useState(null);

  useEffect(() => {
    if (!usuario || usuario.role !== "paciente") return;
    const cancelar = db.collection("clinica_pacientes").doc(usuario.uid).onSnapshot((doc) => {
      if (doc.exists) setPaciente({ id: doc.id, ...doc.data() });
    });
    return cancelar;
  }, [usuario]);

  // Guarda o psi_id assim que ele fica conhecido de verdade (custom
  // claim, pós-login), pra reconhecer a clínica em visitas futuras
  // mesmo sem o ?psi= na URL.
  useEffect(() => {
    if (usuario?.psiId) {
      try { localStorage.setItem("psicoworking_psi_id", usuario.psiId); } catch (e) {}
    }
  }, [usuario]);

  if (carregando) {
    return <div className="tela-central-p"><p>Carregando...</p></div>;
  }

  if (!usuario) return <TelaLogin configClinica={configPreLogin} />;

  if (usuario.role !== "paciente") {
    return (
      <div className="tela-central-p">
        <div className="cartao-login" style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <h2>Acesso não permitido</h2>
          <p className="subtitulo">Esta área é exclusiva de pacientes.</p>
          <button className="botao-primario-p" onClick={logout}>Sair</button>
        </div>
      </div>
    );
  }

  const inicial = (configClinica?.nome || "P").trim().charAt(0).toUpperCase();

  return (
    <div>
      <div className="topo">
        <div className="topo-marca">
          {configClinica?.logoUrl ? (
            <img src={configClinica.logoUrl} alt="Logo" />
          ) : (
            <div className="topo-marca-inicial">{inicial}</div>
          )}
          <span className="topo-nome">{configClinica?.nome || "PsiCoWorking"}</span>
        </div>
        <button className="botao-sair-topo" onClick={logout}>
          <Icone nome="log-out" tamanho={13} /> Sair
        </button>
      </div>

      <div className="nav-abas">
        <button className={"nav-aba" + (tela === "painel" ? " nav-aba-ativa" : "")} onClick={() => { setTela("painel"); setRecursoAberto(null); }}>
          <Icone nome="layout-dashboard" tamanho={15} /> Meu Painel
        </button>
        <button className={"nav-aba" + (tela === "recursos" ? " nav-aba-ativa" : "")} onClick={() => { setTela("recursos"); setRecursoAberto(null); }}>
          <Icone nome="wrench" tamanho={15} /> Recursos Terapêuticos
        </button>
      </div>

      <div className="conteudo">
        {tela === "painel" && <TelaPainel paciente={paciente} usuario={usuario} aoAbrirRecursos={() => setTela("recursos")} />}
        {tela === "recursos" && (
          <TelaRecursosPaciente
            paciente={paciente}
            usuario={usuario}
            recursoAberto={recursoAberto}
            setRecursoAberto={setRecursoAberto}
          />
        )}
      </div>
    </div>
  );
}

// ─── Meu Painel ──────────────────────────────────────────────────
function TelaPainel({ paciente, usuario, aoAbrirRecursos }) {
  const ativos = paciente?.modulosConfig
    ? Object.values(paciente.modulosConfig).filter((m) => m && m.ativo).length
    : 0;

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div>
      <div className="cartao">
        <div className="saudacao">{saudacao}, {paciente?.nome ? paciente.nome.split(" ")[0] : ""}</div>
        <div className="saudacao-sub">Que bom te ver por aqui.</div>

        <div className="grade-stat">
          <div>
            <div className="stat-num">{ativos}</div>
            <div className="stat-label">recurso(s) disponível(is) pra você</div>
          </div>
        </div>

        <button className="botao-primario-p" onClick={aoAbrirRecursos}>
          <Icone nome="wrench" tamanho={16} /> Ver meus Recursos Terapêuticos
        </button>
      </div>

      {!paciente && (
        <div className="cartao">
          <p className="texto-vazio-p">Carregando seus dados...</p>
        </div>
      )}
    </div>
  );
}

// ─── Recursos Terapêuticos do paciente ──────────────────────────
const COLECAO_POR_TIPO = {
  ferramenta: "recursos_terapeuticos",
  fabula: "fabulas_terapeuticas",
  psicoeducacao: "psicoeducacao_conteudos",
};
const ICONE_POR_TIPO_P = { ferramenta: "wrench", fabula: "book-open", psicoeducacao: "brain" };
const ROTULO_POR_TIPO = { ferramenta: "Ferramenta", fabula: "Fábula", psicoeducacao: "Psicoeducação" };

function TelaRecursosPaciente({ paciente, usuario, recursoAberto, setRecursoAberto }) {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const ativos = React.useMemo(() => {
    if (!paciente?.modulosConfig) return [];
    return Object.entries(paciente.modulosConfig)
      .filter(([, cfg]) => cfg && cfg.ativo)
      .map(([id, cfg]) => ({ id, tipo: cfg.tipo, tituloSalvo: cfg.titulo }));
  }, [paciente]);

  useEffect(() => {
    if (ativos.length === 0) { setItens([]); setCarregando(false); return; }
    setCarregando(true);
    Promise.all(
      ativos.map(async (a) => {
        const colecao = COLECAO_POR_TIPO[a.tipo];
        if (!colecao) return null;
        try {
          const doc = await db.collection(colecao).doc(a.id).get();
          if (!doc.exists) return null;
          return { id: doc.id, tipo: a.tipo, ...doc.data() };
        } catch (e) {
          return null;
        }
      })
    ).then((lista) => {
      setItens(lista.filter(Boolean));
      setCarregando(false);
    });
  }, [JSON.stringify(ativos)]);

  if (recursoAberto) {
    return <DetalheRecurso item={recursoAberto} usuario={usuario} paciente={paciente} aoVoltar={() => setRecursoAberto(null)} />;
  }

  if (carregando) return <p className="texto-vazio-p">Carregando...</p>;

  if (itens.length === 0) {
    return (
      <div className="cartao">
        <p className="texto-vazio-p">
          Sua psicóloga ainda não ativou nenhuma ferramenta, fábula ou material pra você. Assim que ela
          ativar algo, vai aparecer aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grade-recursos">
      {itens.map((item) => (
        <div key={item.id} className="cartao-recurso-p" onClick={() => setRecursoAberto(item)}>
          <span className="etiqueta-tipo">{ROTULO_POR_TIPO[item.tipo]}</span>
          <div className="icone-tipo"><Icone nome={ICONE_POR_TIPO_P[item.tipo]} tamanho={20} /></div>
          <div className="titulo-r">{item.titulo || item.nome}</div>
          {item.descricao && <div className="desc-r">{item.descricao}</div>}
        </div>
      ))}
    </div>
  );
}

function DetalheRecurso({ item, usuario, paciente, aoVoltar }) {
  const paginas = Array.isArray(item.paginas) ? item.paginas : [];
  const blocos = Array.isArray(item.blocos) ? item.blocos : [];
  const conteudoTexto = item.conteudo || item.passos || item.texto || "";

  return (
    <div>
      <button className="botao-voltar" onClick={aoVoltar}>
        <Icone nome="arrow-left" tamanho={15} /> Voltar para Recursos
      </button>
      <div className="cartao">
        <h2 style={{ margin: "0 0 6px" }}>{item.titulo || item.nome}</h2>
        {item.descricao && <p style={{ color: "#6B7280", fontSize: 13.5, marginBottom: 18 }}>{item.descricao}</p>}

        {item.formularioKey === "anxiety-management" && (
          <FerramentaGestaoAnsiedade usuario={usuario} paciente={paciente} recurso={item} />
        )}
        {item.formularioKey !== "anxiety-management" && paginas.length > 0 && (
          <LeitorFabula usuario={usuario} paciente={paciente} recurso={item} />
        )}
        {item.formularioKey !== "anxiety-management" && paginas.length === 0 && blocos.length > 0 && (
          <VisualizadorBlocos blocos={blocos} />
        )}
        {item.formularioKey !== "anxiety-management" && paginas.length === 0 && blocos.length === 0 && conteudoTexto && (
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: 14 }}>{conteudoTexto}</p>
        )}
        {item.formularioKey && item.formularioKey !== "anxiety-management" && paginas.length === 0 && blocos.length === 0 && !conteudoTexto && (
          <p className="texto-vazio-p">
            Essa ferramenta ainda está sendo preparada — em breve você vai poder usá-la por aqui.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Ferramenta: Gestão da Ansiedade (grava de verdade) ─────────
function FerramentaGestaoAnsiedade({ usuario, paciente, recurso }) {
  const TECNICAS = [
    { id: "resp", label: "Respiração Relaxada", desc: "Inspirar → Pausar → Expirar por 2 min" },
    { id: "visao", label: "Visão Periférica", desc: "Mover os olhos da direita para a esquerda" },
    { id: "musc", label: "Relaxamento Muscular", desc: "Contrair músculos 5s e relaxar com suspiro" },
  ];
  const ATIVIDADES = [
    { id: "caminhada", label: "Caminhada", icone: "footprints" }, { id: "meditacao", label: "Meditação", icone: "flower-2" },
    { id: "diario", label: "Diário", icone: "book-open" }, { id: "musica", label: "Música", icone: "music" },
    { id: "alongamento", label: "Alongamento", icone: "stretch-horizontal" }, { id: "agua", label: "Hidratação", icone: "droplet" },
  ];
  const PERGUNTAS = [
    "Qual situação está me deixando ansioso(a)?", "Qual é o meu pensamento ansioso?",
    "Tenho provas reais de que é 100% verdadeiro?", "Quais evidências indicam que pode NÃO ser verdadeiro?",
    "Qual a probabilidade real de que o pior aconteça?", "O que eu diria a um amigo com esse mesmo pensamento?",
    "Existe uma forma mais útil de ver essa situação?", "Preocupar-me está me ajudando ou me machucando?",
  ];
  const DESC_ESTRESSE = { 1: "Em paz.", 2: "Otimista.", 3: "Calmo.", 4: "Confortável.", 5: "Neutro.", 6: "Estressando.", 7: "Estressado.", 8: "Irritado.", 9: "Tenso.", 10: "Em pânico." };

  const [aba, setAba] = useState(0);
  const [stress, setStress] = useState(5);
  const [nota, setNota] = useState("");
  const [track, setTrack] = useState({});
  const [resp, setResp] = useState(Array(8).fill(""));
  const [msg, setMsg] = useState("");
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    db.collection("clinica_gestao_ansiedade")
      .where("pacienteId", "==", usuario.uid)
      .where("tipo", "==", "estresse")
      .get()
      .then((snap) => {
        const docs = snap.docs.map((d) => d.data()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setHistorico(docs.slice(0, 5));
      })
      .catch(() => {});
  }, [usuario.uid]);

  const corEstresse = stress <= 3 ? "#059669" : stress <= 5 ? "#d97706" : stress <= 7 ? "#f97316" : "#dc2626";

  async function registrarEstresse() {
    setMsg("Salvando...");
    try {
      await db.collection("clinica_gestao_ansiedade").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        tipo: "estresse", nivel: stress, nota,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setHistorico((h) => [{ nivel: stress, nota, data: new Date().toLocaleDateString("pt-BR") }, ...h].slice(0, 5));
      setNota("");
      setMsg("Registrado!");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    }
  }

  async function salvarTracking() {
    const feitos = [...TECNICAS, ...ATIVIDADES].filter((x) => track[x.id]).map((x) => x.label);
    if (feitos.length === 0) { alert("Marque pelo menos uma técnica ou atividade."); return; }
    setMsg("Salvando...");
    try {
      await db.collection("clinica_gestao_ansiedade").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        tipo: "tracking", itens: feitos,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setTrack({});
      setMsg("Tracking salvo!");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    }
  }

  async function salvarPensamentos() {
    if (!resp.some((r) => r.trim())) { alert("Responda pelo menos uma pergunta antes de salvar."); return; }
    setMsg("Salvando...");
    try {
      await db.collection("clinica_tcc").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        origem: "gestao-ansiedade",
        registros: PERGUNTAS.map((p, i) => ({ pergunta: p, resposta: resp[i] || "" })),
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setResp(Array(8).fill(""));
      setMsg("Salvo!");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    }
  }

  return (
    <div>
      <div className="nav-abas" style={{ background: "none", padding: 0, marginBottom: 16 }}>
        {[
          { rotulo: "Estresse", icone: "gauge" },
          { rotulo: "Tracking", icone: "list-checks" },
          { rotulo: "Pensamentos", icone: "brain" },
        ].map((a, i) => (
          <button key={i} className={"nav-aba" + (aba === i ? " nav-aba-ativa" : "")} onClick={() => setAba(i)}>
            <Icone nome={a.icone} tamanho={14} /> {a.rotulo}
          </button>
        ))}
      </div>

      {aba === 0 && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: corEstresse, lineHeight: 1 }}>{stress}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>/10</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: corEstresse }}>{DESC_ESTRESSE[stress]}</div>
          </div>
          <input type="range" min={1} max={10} value={stress} onChange={(e) => setStress(+e.target.value)} style={{ width: "100%", accentColor: corEstresse, marginBottom: 14 }} />
          <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Observações..." />
          <button className="botao-primario-p" style={{ marginTop: 10 }} onClick={registrarEstresse}>{msg || "Registrar"}</button>

          {historico.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {historico.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "8px 10px", background: "#F9FAFB", borderRadius: 8, marginBottom: 6, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 700, color: corEstresse }}>{h.nivel}/10</span>
                  <span style={{ flex: 1, color: "#6B7280" }}>{h.nota || "—"}</span>
                  <span style={{ color: "#9CA3AF" }}>{h.data}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === 1 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "var(--cor-marca)" }}>Técnicas Anti-Ansiedade</div>
          {TECNICAS.map((t) => (
            <div
              key={t.id}
              onClick={() => setTrack((tr) => ({ ...tr, [t.id]: !tr[t.id] }))}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: "1.5px solid", borderColor: track[t.id] ? "var(--cor-marca)" : "#E5E7EB", background: track[t.id] ? "#EADDFC" : "white", cursor: "pointer", marginBottom: 8 }}
            >
              <Icone nome={track[t.id] ? "check-circle-2" : "circle"} tamanho={18} />
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div><div style={{ fontSize: 12, color: "#6B7280" }}>{t.desc}</div></div>
            </div>
          ))}
          <div style={{ fontWeight: 700, fontSize: 13, margin: "14px 0 10px", color: "var(--cor-marca)" }}>Atividades</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ATIVIDADES.map((a) => (
              <div
                key={a.id}
                onClick={() => setTrack((tr) => ({ ...tr, [a.id]: !tr[a.id] }))}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, borderRadius: 10, border: "1.5px solid", borderColor: track[a.id] ? "var(--cor-marca)" : "#E5E7EB", background: track[a.id] ? "#EADDFC" : "white", cursor: "pointer", fontSize: 12, textAlign: "center", fontWeight: track[a.id] ? 600 : 400 }}
              >
                <Icone nome={a.icone} tamanho={14} /> {a.label}
              </div>
            ))}
          </div>
          <button className="botao-primario-p" style={{ marginTop: 14 }} onClick={salvarTracking}>{msg || "Salvar tracking do dia"}</button>
        </div>
      )}

      {aba === 2 && (
        <div>
          <p className="texto-vazio-p" style={{ marginBottom: 14 }}>Responda cada pergunta com honestidade para questionar pensamentos ansiosos.</p>
          {PERGUNTAS.map((p, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>{i + 1}. {p}</label>
              <textarea rows={2} value={resp[i]} onChange={(e) => { const r = [...resp]; r[i] = e.target.value; setResp(r); }} placeholder="Sua resposta..." />
            </div>
          ))}
          <button className="botao-primario-p" onClick={salvarPensamentos}>{msg || "Salvar respostas"}</button>
        </div>
      )}
    </div>
  );
}

// ─── Fábula (leitor real, grava reflexões) ──────────────────────
function LeitorFabula({ usuario, paciente, recurso }) {
  const paginas = Array.isArray(recurso.paginas) ? recurso.paginas : [];
  const perguntas = Array.isArray(recurso.perguntas) ? recurso.perguntas : [];
  const [idx, setIdx] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [msg, setMsg] = useState("");

  if (paginas.length === 0) return null;
  const pagina = paginas[idx];
  const textoPagina = typeof pagina === "string" ? pagina : pagina?.texto || "";
  const pct = Math.round(((idx + 1) / paginas.length) * 100);
  const concluido = idx === paginas.length - 1;

  async function salvarReflexoes() {
    if (!perguntas.some((_, i) => (respostas[i] || "").trim())) { alert("Escreva pelo menos uma reflexão antes de salvar."); return; }
    setMsg("Salvando...");
    try {
      await db.collection("clinica_reflexoes").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        origem: "fabula", origemId: recurso.id, origemTitulo: recurso.titulo || recurso.nome || "",
        registros: perguntas.map((p, i) => ({ pergunta: p, resposta: respostas[i] || "" })),
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setMsg("Reflexões salvas!");
      setTimeout(() => setMsg(""), 2500);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    }
  }

  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 5, background: "#EADDFC", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: "var(--cor-marca)", borderRadius: 20, transition: "width .4s ease" }} />
        </div>
        <span style={{ fontSize: 12, color: "var(--cor-marca)", fontWeight: 700, flexShrink: 0 }}>{idx + 1}/{paginas.length}</span>
      </div>

      <div style={{ background: "linear-gradient(145deg, #4c0094, var(--cor-marca, #7B00C4))", borderRadius: 20, padding: "32px 26px", minHeight: 170, marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 18, color: "white", lineHeight: 1.9, textAlign: "center", fontStyle: "italic", margin: 0 }}>{textoPagina}</p>
      </div>

      {concluido && recurso.moral && (
        <div className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB" }}>
          <strong>Moral da história</strong>
          <p style={{ fontSize: 13.5, color: "#6B7280", marginTop: 6 }}>{recurso.moral}</p>
        </div>
      )}

      {concluido && perguntas.length > 0 && (
        <div className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: 6 }}><Icone nome="message-circle" tamanho={15} /> Para Refletir</strong>
          {perguntas.map((p, i) => (
            <div key={i} style={{ marginTop: 12 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>{i + 1}. {p}</label>
              <textarea rows={2} value={respostas[i] || ""} onChange={(e) => setRespostas((r) => ({ ...r, [i]: e.target.value }))} placeholder="Escreva sua reflexão..." />
            </div>
          ))}
          <button className="botao-primario-p" style={{ marginTop: 10 }} onClick={salvarReflexoes}>{msg || "Salvar minhas reflexões"}</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button className="botao-secundario-p" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
          <Icone nome="arrow-left" tamanho={14} /> Anterior
        </button>
        {!concluido ? (
          <button className="botao-primario-p" style={{ flex: 2 }} onClick={() => setIdx((i) => Math.min(paginas.length - 1, i + 1))}>
            Próxima página <Icone nome="arrow-right" tamanho={14} />
          </button>
        ) : (
          <button className="botao-primario-p" style={{ flex: 2, background: "#059669" }} onClick={() => setIdx(0)}>
            <Icone nome="check" tamanho={14} /> Concluído — Reler
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Psicoeducação (blocos, leitura) ─────────────────────────────
function VisualizadorBlocos({ blocos }) {
  return (
    <div>
      {blocos.map((b, i) => {
        switch (b.tipo) {
          case "banner":
            return (
              <div key={i} style={{ background: b.cor || "var(--cor-marca)", borderRadius: 12, padding: 20, marginBottom: 14, color: "white", textAlign: "center" }}>
                {b.emoji && <div style={{ fontSize: 32, marginBottom: 6 }}>{b.emoji}</div>}
                <div style={{ fontWeight: 700, fontSize: 16 }}>{b.titulo}</div>
              </div>
            );
          case "texto":
            return <p key={i} style={{ marginBottom: 14, lineHeight: 1.7, fontSize: 14 }}>{b.conteudo}</p>;
          case "card":
            return (
              <div key={i} className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB", marginBottom: 12 }}>
                {b.icone && <div style={{ fontSize: 22, marginBottom: 4 }}>{b.icone}</div>}
                <strong>{b.titulo}</strong>
                <p style={{ fontSize: 13.5, color: "#6B7280", marginTop: 6 }}>{b.texto}</p>
              </div>
            );
          case "lista":
            return (
              <ul key={i} style={{ marginBottom: 14, paddingLeft: 20 }}>
                {(b.itens || []).map((it, j) => <li key={j} style={{ fontSize: 13.5, color: "#374151", marginBottom: 4 }}>{it}</li>)}
              </ul>
            );
          case "checklist":
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                {b.titulo && <strong style={{ display: "block", marginBottom: 8 }}>{b.titulo}</strong>}
                {(b.itens || []).map((it, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <input type="checkbox" style={{ width: "auto" }} /> <span style={{ fontSize: 13.5 }}>{it}</span>
                  </div>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// ═══════════════════════════════════════════════════════════════
//  PENDÊNCIAS (ver [[projeto-psicoworking]] na memória):
//  - Só Gestão da Ansiedade e Fábulas gravam de verdade. As outras
//    ferramentas (Respiração 4-7-8, Árvore da Decisão, Registro ABC
//    etc.) ainda não têm implementação própria aqui.
//  - Perguntas do tipo "pergunta" dentro de blocos de Psicoeducação
//    ainda são só leitura (não salvam resposta).
//  - Check-in Diário, Minhas Metas, Diário Terapêutico e Avaliar
//    (do CLAUDE.md) ainda não têm tela.
//  - Formulário público de Anamnese/Questionários ainda não existe
//    (a aba Questionários do admin depende disso).
// ═══════════════════════════════════════════════════════════════
