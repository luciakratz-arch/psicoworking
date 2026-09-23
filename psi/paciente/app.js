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

// useState/useEffect/useRef, Icone e TextAreaVoz vêm do arquivo
// compartilhado ../compartilhado/ferramentas.js, carregado antes
// deste — é o mesmo arquivo que a página pública de atividades usa.


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
// ─── Modal de Aniversário ────────────────────────────────────────
// Aparece uma vez, no primeiro login do dia do aniversário do
// paciente (campo clinica_pacientes.dataNasc). Confete em CSS puro
// (sem emoji, regra permanente do projeto) — cada quadradinho cai e
// gira com uma animação simples.
function ModalAniversario({ nome, nomeClinica, corMarca, onClose }) {
  const [visivel, setVisivel] = useState(false);
  const [confetes, setConfetes] = useState([]);

  useEffect(() => {
    setTimeout(() => setVisivel(true), 50);
    const cores = [corMarca || "#7B00C4", "#0891b2", "#059669", "#d97706", "#db2777", "#6366f1"];
    setConfetes(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        atraso: Math.random() * 2,
        duracao: 2.5 + Math.random() * 2,
        cor: cores[Math.floor(Math.random() * cores.length)],
        tamanho: 6 + Math.random() * 8,
        rotacao: Math.random() * 360,
      }))
    );
  }, [corMarca]);

  const primeiroNome = (nome || "").split(" ")[0];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        opacity: visivel ? 1 : 0, transition: "opacity .4s",
      }}
    >
      {confetes.map((c) => (
        <div
          key={c.id}
          style={{
            position: "fixed", left: c.x + "%", top: "-20px", width: c.tamanho, height: c.tamanho, background: c.cor,
            borderRadius: c.id % 2 === 0 ? "50%" : "2px",
            animation: `cair-confete ${c.duracao}s ${c.atraso}s ease-in forwards`,
            transform: `rotate(${c.rotacao}deg)`, pointerEvents: "none", zIndex: 10000,
          }}
        />
      ))}
      <style>{`
        @keyframes cair-confete { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
        @keyframes pulsar-bolo { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 24, padding: "40px 32px", maxWidth: 420, width: "100%", textAlign: "center", position: "relative",
          boxShadow: "0 20px 60px rgba(123,0,196,0.3)",
          transform: visivel ? "scale(1) translateY(0)" : "scale(.8) translateY(30px)",
          transition: "transform .4s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <div style={{ color: "var(--cor-marca)", animation: "pulsar-bolo 1.5s ease-in-out infinite", marginBottom: 8 }}>
          <Icone nome="cake" tamanho={64} />
        </div>
        <div style={{ fontSize: 26, color: "var(--cor-marca)", fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
          Feliz Aniversário,<br />{primeiroNome}!
        </div>
        <div style={{ fontSize: 15, color: "#555", lineHeight: 1.7, margin: "16px 0 24px" }}>
          Que este novo ciclo seja repleto de<br />
          <strong style={{ color: "var(--cor-marca)" }}>saúde, leveza e crescimento</strong>.<br />
          É uma honra caminhar ao seu lado.
        </div>
        {nomeClinica && (
          <div style={{ fontSize: 13, color: "#888", fontStyle: "italic", marginBottom: 24, borderTop: "1px solid #F3E6FF", paddingTop: 16 }}>
            Com carinho,<br />
            <strong style={{ color: "var(--cor-marca)", fontSize: 16 }}>{nomeClinica}</strong>
          </div>
        )}
        <button
          onClick={onClose}
          className="botao-primario-p"
          style={{ padding: "12px 32px", fontSize: 15, borderRadius: 50, justifyContent: "center" }}
        >
          <Icone nome="party-popper" tamanho={16} /> Obrigada!
        </button>
      </div>
    </div>
  );
}

function App() {
  const { usuario, carregando } = useUsuarioLogado();
  const [tela, setTela] = useState("painel");
  const configClinica = usarConfiguracaoClinica(usuario && usuario.psiId);
  const configPreLogin = usarConfiguracaoPreLogin(!usuario ? pegarPsiIdConhecido() : null);
  const [paciente, setPaciente] = useState(null);
  const [recursoAberto, setRecursoAberto] = useState(null);
  const [mostrarAniversario, setMostrarAniversario] = useState(false);
  const aniversarioChecado = useRef(false);

  useEffect(() => {
    if (!usuario || usuario.role !== "paciente") return;
    const cancelar = db.collection("clinica_pacientes").doc(usuario.uid).onSnapshot((doc) => {
      if (doc.exists) setPaciente({ id: doc.id, ...doc.data() });
    });
    return cancelar;
  }, [usuario]);

  // Mostra o modal de aniversário uma vez por sessão (não a cada
  // atualização do documento do paciente via onSnapshot).
  useEffect(() => {
    if (!paciente || aniversarioChecado.current) return;
    aniversarioChecado.current = true;
    if (!paciente.dataNasc) return;
    const hoje = new Date();
    const mes = parseInt(paciente.dataNasc.slice(5, 7), 10);
    const dia = parseInt(paciente.dataNasc.slice(8, 10), 10);
    if (mes === hoje.getMonth() + 1 && dia === hoje.getDate()) {
      setMostrarAniversario(true);
    }
  }, [paciente]);

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
  const iniciaisPaciente = (paciente?.nome || "?").trim().split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const NAV = [
    { id: "painel", rotulo: "Meu Painel", icone: "layout-dashboard" },
    { id: "humor", rotulo: "Check-in Diário", icone: "heart" },
    { id: "metas", rotulo: "Minhas Metas", icone: "target" },
    { id: "diario", rotulo: "Diário Terapêutico", icone: "book-open" },
    { id: "recursos", rotulo: "Recursos Terapêuticos", icone: "wrench" },
    { id: "laudos", rotulo: "Meus Laudos", icone: "file-text" },
    { id: "avaliar", rotulo: "Avaliar", icone: "star" },
    { id: "conta", rotulo: "Minha Conta", icone: "user-circle" },
  ];

  function irPara(id) {
    setTela(id);
    setRecursoAberto(null);
  }

  return (
    <div className="layout-paciente">
      {mostrarAniversario && (
        <ModalAniversario nome={paciente?.nome} nomeClinica={configClinica?.nome} corMarca={configClinica?.corPrimaria} onClose={() => setMostrarAniversario(false)} />
      )}
      <aside className="barra-lateral-p">
        <div className="marca-barra-lateral-p">
          {configClinica?.logoUrl ? (
            <img src={configClinica.logoUrl} alt="Logo" />
          ) : (
            <div className="avatar-marca-p">{inicial}</div>
          )}
          <div>
            <div className="marca-barra-lateral-p-nome">{configClinica?.nome || "PsiCoWorking"}</div>
            <div className="marca-barra-lateral-p-sub">Área do Paciente</div>
          </div>
        </div>

        <div className="paciente-barra-lateral">
          {paciente?.fotoUrl ? (
            <img src={paciente.fotoUrl} alt="Sua foto" className="avatar-paciente-p avatar-paciente-p-foto" />
          ) : (
            <div className="avatar-paciente-p">{iniciaisPaciente || "?"}</div>
          )}
          <div>
            <div className="nome-paciente-p">{paciente?.nome || usuario.email}</div>
            <span className="etiqueta-status-p">{paciente?.status || "paciente"}</span>
          </div>
        </div>

        <nav>
          {NAV.map((item) => (
            <button key={item.id} className={"item-menu-p" + (tela === item.id ? " item-menu-p-ativo" : "")} onClick={() => irPara(item.id)}>
              <Icone nome={item.icone} tamanho={16} /> {item.rotulo}
            </button>
          ))}
        </nav>

        <div className="rodape-barra-lateral-p">
          <button className="botao-sair-p" onClick={logout}>
            <Icone nome="log-out" tamanho={13} /> Sair
          </button>
        </div>
      </aside>

      <main className="area-principal-p">
        <div className="conteudo">
          {tela === "painel" && (
            <TelaPainel
              paciente={paciente}
              usuario={usuario}
              configClinica={configClinica}
              aoAbrirRecursos={() => irPara("recursos")}
              aoIrPara={irPara}
            />
          )}
          {tela === "recursos" && (
            <TelaRecursosPaciente
              paciente={paciente}
              usuario={usuario}
              recursoAberto={recursoAberto}
              setRecursoAberto={setRecursoAberto}
            />
          )}
          {tela === "humor" && <TelaCheckinHumor usuario={usuario} />}
          {tela === "metas" && <TelaMinhasMetas usuario={usuario} />}
          {tela === "diario" && <TelaDiario usuario={usuario} paciente={paciente} />}
          {tela === "avaliar" && <TelaAvaliar usuario={usuario} />}
          {tela === "laudos" && <TelaMeusLaudos usuario={usuario} />}
          {tela === "conta" && <TelaMinhaConta usuario={usuario} paciente={paciente} />}
        </div>
      </main>
    </div>
  );
}

// ─── Meu Painel ──────────────────────────────────────────────────
function TelaPainel({ paciente, usuario, configClinica, aoAbrirRecursos, aoIrPara }) {
  const ativos = paciente?.modulosConfig
    ? Object.values(paciente.modulosConfig).filter((m) => m && m.ativo).length
    : 0;
  const [proximaSessao, setProximaSessao] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [humores, setHumores] = useState([]);
  const [metasAtivas, setMetasAtivas] = useState(0);
  const [entradasDiario, setEntradasDiario] = useState(0);

  useEffect(() => {
    const hoje = new Date().toISOString().slice(0, 10);
    db.collection("clinica_sessoes")
      .where("pacienteId", "==", usuario.uid)
      .where("status", "==", "agendado")
      .get()
      .then((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          .filter((s) => s.data >= hoje)
          .sort((a, b) => (a.data || "").localeCompare(b.data || ""));
        setProximaSessao(docs[0] || null);
        setCarregandoSessao(false);
      })
      .catch(() => setCarregandoSessao(false));
  }, [usuario.uid]);

  useEffect(() => {
    db.collection("clinica_humor")
      .where("pacienteId", "==", usuario.uid)
      .get()
      .then((snap) => {
        const docs = snap.docs.map((d) => d.data());
        docs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        setHumores(docs);
      })
      .catch(() => {});
    db.collection("clinica_metas")
      .where("pacienteId", "==", usuario.uid)
      .where("status", "==", "ativa")
      .get()
      .then((snap) => setMetasAtivas(snap.size))
      .catch(() => {});
    db.collection("clinica_diario")
      .where("pacienteId", "==", usuario.uid)
      .get()
      .then((snap) => setEntradasDiario(snap.size))
      .catch(() => {});
  }, [usuario.uid]);

  async function confirmarPresenca() {
    if (!proximaSessao) return;
    setConfirmando(true);
    try {
      await db.collection("clinica_sessoes").doc(proximaSessao.id).update({
        statusConfirmacao: "confirmado",
        confirmadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setProximaSessao((p) => ({ ...p, statusConfirmacao: "confirmado" }));
    } catch (e) {
      alert("Não foi possível confirmar: " + e.message);
    } finally {
      setConfirmando(false);
    }
  }

  function reagendarWhatsApp() {
    const numero = (configClinica?.whatsapp || "").replace(/\D/g, "");
    if (!numero || !proximaSessao) return;
    const dataFmt = new Date(proximaSessao.data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    const msg = `Olá! Sou ${paciente?.nome || ""}.\n\nGostaria de solicitar o reagendamento da minha sessão marcada para ${dataFmt}${proximaSessao.hora ? " às " + proximaSessao.hora : ""}.\n\nPodemos verificar uma nova data disponível? Obrigado(a)!`;
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const hojeFmt = new Date().toLocaleDateString("pt-BR");
  const humorHoje = humores.find((h) => h.data === hojeFmt);
  const media30 = humores.length > 0 ? (humores.reduce((a, h) => a + (h.valor || 0), 0) / humores.length).toFixed(1) : null;

  return (
    <div>
      <div className="banner-painel">
        <div className="banner-painel-data">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</div>
        <div className="banner-painel-saudacao">{saudacao}, {paciente?.nome ? paciente.nome.split(" ")[0] : ""}!</div>
      </div>

      {!carregandoSessao && proximaSessao && (
        <div className="barra-sessao">
          <div className="barra-sessao-icone"><Icone nome="calendar" tamanho={20} /></div>
          <div className="barra-sessao-info">
            <div className="barra-sessao-rotulo">Próxima Sessão</div>
            <div className="barra-sessao-data">
              {new Date(proximaSessao.data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
              {proximaSessao.hora ? ` às ${proximaSessao.hora}` : ""}
            </div>
          </div>
          <div className="barra-sessao-acoes">
            {proximaSessao.statusConfirmacao === "confirmado" ? (
              <span className="etiqueta-confirmada"><Icone nome="check" tamanho={13} /> Presença confirmada</span>
            ) : (
              <button className="botao-primario-p" style={{ width: "auto", padding: "9px 16px" }} onClick={confirmarPresenca} disabled={confirmando}>
                <Icone nome="check" tamanho={14} /> {confirmando ? "Confirmando..." : "Confirmar presença"}
              </button>
            )}
            {configClinica?.whatsapp && (
              <button className="botao-reagendar-p" onClick={reagendarWhatsApp}>
                <Icone nome="message-circle" tamanho={14} /> Reagendar
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grade-stat-painel">
        <div className="cartao-stat-painel">
          <div className="cartao-stat-painel-topo">
            <span className="cartao-stat-painel-label">Humor hoje</span>
            <div className="cartao-stat-painel-icone"><Icone nome="heart" tamanho={15} /></div>
          </div>
          <div className="cartao-stat-painel-num">{humorHoje ? `${humorHoje.valor}/10` : "—"}</div>
        </div>
        <div className="cartao-stat-painel">
          <div className="cartao-stat-painel-topo">
            <span className="cartao-stat-painel-label">Média 30 dias</span>
            <div className="cartao-stat-painel-icone"><Icone nome="trending-up" tamanho={15} /></div>
          </div>
          <div className="cartao-stat-painel-num">{media30 ? `${media30}/10` : "—"}</div>
        </div>
        <div className="cartao-stat-painel">
          <div className="cartao-stat-painel-topo">
            <span className="cartao-stat-painel-label">Metas ativas</span>
            <div className="cartao-stat-painel-icone"><Icone nome="target" tamanho={15} /></div>
          </div>
          <div className="cartao-stat-painel-num">{metasAtivas}</div>
        </div>
        <div className="cartao-stat-painel">
          <div className="cartao-stat-painel-topo">
            <span className="cartao-stat-painel-label">Entradas no diário</span>
            <div className="cartao-stat-painel-icone"><Icone nome="book-open" tamanho={15} /></div>
          </div>
          <div className="cartao-stat-painel-num">{entradasDiario}</div>
        </div>
      </div>

      <div className="cartao-atalhos">
        <div className="cartao-atalhos-topo">
          <strong>Acesso Rápido</strong>
          <span className="texto-vazio-p">{ativos} módulo(s) ativo(s)</span>
        </div>
        <div className="grade-atalhos">
          <button className="atalho-p" onClick={() => aoIrPara("humor")}><Icone nome="heart" tamanho={15} /> Registrar</button>
          <button className="atalho-p" onClick={() => aoIrPara("diario")}><Icone nome="book-open" tamanho={15} /> Diário</button>
          <button className="atalho-p" onClick={() => aoIrPara("metas")}><Icone nome="target" tamanho={15} /> Minhas Metas</button>
          <button className="atalho-p" onClick={aoAbrirRecursos}><Icone nome="wrench" tamanho={15} /> Recursos</button>
        </div>
      </div>

      {humores.length > 1 && (
        <div className="cartao-grafico">
          <div className="cartao-grafico-topo">
            <strong>Minha Evolução de Humor</strong>
            {media30 && <span style={{ color: "var(--cor-marca)", fontWeight: 700, fontSize: 13 }}>Média: {media30}/10</span>}
          </div>
          <GraficoHumor humores={humores.slice(-14)} />
        </div>
      )}

      {!paciente && (
        <div className="cartao">
          <p className="texto-vazio-p">Carregando seus dados...</p>
        </div>
      )}
    </div>
  );
}

// Gráfico de linha simples (SVG puro, sem biblioteca) com a evolução
// do humor nos últimos registros.
function GraficoHumor({ humores }) {
  const largura = 600, altura = 180, margem = 24;
  const n = humores.length;
  const pontoX = (i) => margem + (i * (largura - margem * 2)) / Math.max(1, n - 1);
  const pontoY = (v) => altura - margem - ((v || 0) / 10) * (altura - margem * 2);
  const pontos = humores.map((h, i) => `${pontoX(i)},${pontoY(h.valor)}`).join(" ");
  const areaPontos = `${margem},${altura - margem} ${pontos} ${largura - margem},${altura - margem}`;

  return (
    <svg viewBox={`0 0 ${largura} ${altura}`} style={{ width: "100%", height: "auto" }}>
      {[0, 2.5, 5, 7.5, 10].map((v) => (
        <line key={v} x1={margem} x2={largura - margem} y1={pontoY(v)} y2={pontoY(v)} stroke="#F3F4F6" strokeWidth="1" />
      ))}
      <polygon points={areaPontos} fill="var(--cor-marca)" opacity="0.08" />
      <polyline points={pontos} fill="none" stroke="var(--cor-marca)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {humores.map((h, i) => (
        <circle key={i} cx={pontoX(i)} cy={pontoY(h.valor)} r="5" fill="white" stroke="var(--cor-marca)" strokeWidth="3" />
      ))}
    </svg>
  );
}

// ─── Check-in de Humor (dentro de Recursos, acessível também no Painel) ─
function TelaCheckinHumor({ usuario }) {
  const [valor, setValor] = useState(5);
  const [nota, setNota] = useState("");
  const [msg, setMsg] = useState("");
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    db.collection("clinica_humor")
      .where("pacienteId", "==", usuario.uid)
      .get()
      .then((snap) => {
        const docs = snap.docs.map((d) => d.data()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setHistorico(docs.slice(0, 10));
      })
      .catch(() => {});
  }, [usuario.uid]);

  const cor = valor <= 3 ? "#dc2626" : valor <= 5 ? "#d97706" : valor <= 7 ? "#65a30d" : "#059669";

  async function registrar() {
    setMsg("Salvando...");
    try {
      await db.collection("clinica_humor").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid,
        valor, nota,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setHistorico((h) => [{ valor, nota, data: new Date().toLocaleDateString("pt-BR") }, ...h].slice(0, 10));
      setNota("");
      setMsg("Registrado!");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    }
  }

  return (
    <div className="cartao">
      <strong>Como você está se sentindo hoje?</strong>
      <div style={{ textAlign: "center", margin: "16px 0" }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: cor, lineHeight: 1 }}>{valor}</div>
        <div style={{ fontSize: 12, color: "#9CA3AF" }}>/10</div>
      </div>
      <input type="range" min={1} max={10} value={valor} onChange={(e) => setValor(+e.target.value)} style={{ width: "100%", accentColor: cor, marginBottom: 14 }} />
      <TextAreaVoz rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Quer contar mais alguma coisa? (opcional)" />
      <button className="botao-primario-p" style={{ marginTop: 10 }} onClick={registrar}>{msg || "Registrar humor"}</button>

      {historico.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <strong style={{ fontSize: 13 }}>Últimos registros</strong>
          {historico.map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "8px 10px", background: "#F9FAFB", borderRadius: 8, marginTop: 6, fontSize: 12.5 }}>
              <span style={{ fontWeight: 700, color: "var(--cor-marca)" }}>{h.valor}/10</span>
              <span style={{ flex: 1, color: "#6B7280" }}>{h.nota || "—"}</span>
              <span style={{ color: "#9CA3AF" }}>{h.data}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Minhas Metas ────────────────────────────────────────────────
function TelaMinhasMetas({ usuario }) {
  const [metas, setMetas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cancelar = db.collection("clinica_metas")
      .where("pacienteId", "==", usuario.uid)
      .onSnapshot((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((m) => m.status !== "arquivada");
        docs.sort((a, b) => (b.criadoEm?.toMillis?.() || 0) - (a.criadoEm?.toMillis?.() || 0));
        setMetas(docs);
        setCarregando(false);
      }, () => setCarregando(false));
    return cancelar;
  }, [usuario.uid]);

  async function atualizarProgresso(meta, delta) {
    const novo = Math.max(0, Math.min(100, (meta.progresso || 0) + delta));
    try {
      await db.collection("clinica_metas").doc(meta.id).update({
        progresso: novo,
        status: novo >= 100 ? "concluida" : "ativa",
        atualizadoPor: "paciente",
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {}
  }

  if (carregando) return <p className="texto-vazio-p">Carregando...</p>;

  if (metas.length === 0) {
    return (
      <div className="cartao" style={{ textAlign: "center" }}>
        <Icone nome="target" tamanho={32} />
        <p style={{ fontWeight: 600, marginTop: 10 }}>Nenhuma meta por enquanto</p>
        <p className="texto-vazio-p">Suas metas terapêuticas vão aparecer aqui assim que forem definidas com sua psicóloga.</p>
      </div>
    );
  }

  return (
    <div>
      {metas.map((m) => {
        const p = m.progresso || 0;
        const completa = p >= 100;
        return (
          <div key={m.id} className="cartao" style={completa ? { border: "1.5px solid #059669" } : {}}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{m.titulo}</div>
                {m.categoria && <span className="etiqueta-tipo">{m.categoria}</span>}
              </div>
              <span style={{ fontWeight: 700, color: completa ? "#059669" : "var(--cor-marca)" }}>{p}%</span>
            </div>
            {m.descricao && <p style={{ fontSize: 13, color: "#6B7280", marginTop: 8 }}>{m.descricao}</p>}
            <div style={{ height: 8, background: "#F3F4F6", borderRadius: 20, marginTop: 12, overflow: "hidden" }}>
              <div style={{ width: p + "%", height: "100%", background: completa ? "#059669" : "var(--cor-marca)", borderRadius: 20, transition: "width .3s" }} />
            </div>
            {!completa && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="botao-secundario-p" onClick={() => atualizarProgresso(m, -10)}>-10%</button>
                <button className="botao-secundario-p" onClick={() => atualizarProgresso(m, 10)}>+10%</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Diário Terapêutico ──────────────────────────────────────────
function TelaDiario({ usuario, paciente }) {
  const [texto, setTexto] = useState("");
  const [msg, setMsg] = useState("");
  const [entradas, setEntradas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cancelar = db.collection("clinica_diario")
      .where("pacienteId", "==", usuario.uid)
      .onSnapshot((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.criadoEm?.toMillis?.() || 0) - (a.criadoEm?.toMillis?.() || 0));
        setEntradas(docs);
        setCarregando(false);
      }, () => setCarregando(false));
    return cancelar;
  }, [usuario.uid]);

  async function salvar() {
    if (!texto.trim()) return;
    setMsg("Salvando...");
    try {
      await db.collection("clinica_diario").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        texto,
        data: new Date().toLocaleDateString("pt-BR"),
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setTexto("");
      setMsg("Salvo!");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    }
  }

  return (
    <div>
      <div className="cartao">
        <strong>Escreva livremente</strong>
        <p className="texto-vazio-p" style={{ marginBottom: 10 }}>Sem julgamento, sem estrutura — um espaço só seu.</p>
        <TextAreaVoz rows={5} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Como foi o seu dia?" />
        <button className="botao-primario-p" style={{ marginTop: 10 }} onClick={salvar}>{msg || "Salvar entrada"}</button>
      </div>

      {!carregando && entradas.length > 0 && (
        <div>
          {entradas.map((e) => (
            <div key={e.id} className="cartao">
              <div style={{ fontSize: 11.5, color: "#9CA3AF", marginBottom: 6 }}>{e.data}</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{e.texto}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Avaliar ─────────────────────────────────────────────────────
function TelaAvaliar({ usuario }) {
  const [estrelas, setEstrelas] = useState(0);
  const [texto, setTexto] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar() {
    if (!estrelas) { setErro("Escolha de 1 a 5 estrelas."); return; }
    setErro("");
    try {
      await db.collection("psi_depoimentos").add({
        psi_id: usuario.psiId, estrelas, texto,
        aprovado: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setEnviado(true);
    } catch (e) {
      setErro(e.message || "Não foi possível enviar.");
    }
  }

  if (enviado) {
    return (
      <div className="cartao" style={{ textAlign: "center" }}>
        <Icone nome="check-circle-2" tamanho={32} />
        <p style={{ fontWeight: 600, marginTop: 10 }}>Obrigado pela sua avaliação!</p>
        <p className="texto-vazio-p">Ela é anônima e ajuda sua psicóloga a melhorar o atendimento.</p>
      </div>
    );
  }

  return (
    <div className="cartao">
      <strong>Como está sendo sua experiência?</strong>
      <p className="texto-vazio-p" style={{ marginBottom: 14 }}>Sua avaliação é anônima — a psicóloga não vê quem escreveu.</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setEstrelas(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: n <= estrelas ? "var(--cor-marca)" : "#D1D5DB" }}>
            <Icone nome="star" tamanho={28} />
          </button>
        ))}
      </div>
      <TextAreaVoz rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Quer contar mais alguma coisa? (opcional)" />
      {erro && <p className="erro-p">{erro}</p>}
      <button className="botao-primario-p" style={{ marginTop: 10 }} onClick={enviar}>Enviar avaliação</button>
    </div>
  );
}

// ─── Meus Laudos ─────────────────────────────────────────────────
// A psicóloga ainda não tem uma tela pra emitir laudos (é uma das
// próximas etapas do lado dela) — essa tela já fica pronta pra
// mostrar assim que existir.
function TelaMeusLaudos({ usuario }) {
  const [laudos, setLaudos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    db.collection("clinica_laudos")
      .where("pacienteId", "==", usuario.uid)
      .get()
      .then((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.criadoEm?.toMillis?.() || 0) - (a.criadoEm?.toMillis?.() || 0));
        setLaudos(docs);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, [usuario.uid]);

  if (carregando) return <p className="texto-vazio-p">Carregando...</p>;

  if (laudos.length === 0) {
    return (
      <div className="cartao" style={{ textAlign: "center" }}>
        <Icone nome="file-text" tamanho={32} />
        <p style={{ fontWeight: 600, marginTop: 10 }}>Nenhum laudo por enquanto</p>
        <p className="texto-vazio-p">Quando sua psicóloga emitir um laudo ou relatório, ele aparece aqui.</p>
      </div>
    );
  }

  return (
    <div>
      {laudos.map((l) => (
        <div key={l.id} className="cartao">
          <div style={{ fontWeight: 700, fontSize: 15 }}>{l.titulo || "Laudo"}</div>
          <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 4 }}>{l.data}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Minha Conta ─────────────────────────────────────────────────
function TelaMinhaConta({ usuario, paciente }) {
  const [msg, setMsg] = useState("");
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState("");
  const inputFotoRef = useRef(null);

  const iniciaisPaciente = (paciente?.nome || "?").trim().split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  async function alterarSenha() {
    try {
      await auth.sendPasswordResetEmail(usuario.email);
      setMsg("Enviamos um link para " + usuario.email + " pra você definir uma senha nova.");
    } catch (e) {
      setMsg("Não foi possível enviar: " + e.message);
    }
  }

  async function aoEscolherFoto(evento) {
    const arquivo = evento.target.files[0];
    evento.target.value = "";
    if (!arquivo) return;
    setErroFoto("");
    setEnviandoFoto(true);
    try {
      const extensao = arquivo.name.split(".").pop();
      const referencia = appPaciente.storage().ref(`pacientes/${usuario.psiId}/${usuario.uid}/foto.${extensao}`);
      await referencia.put(arquivo);
      const url = await referencia.getDownloadURL();
      await db.collection("clinica_pacientes").doc(usuario.uid).update({
        fotoUrl: url,
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      setErroFoto(e.message || "Não foi possível enviar a foto.");
    } finally {
      setEnviandoFoto(false);
    }
  }

  return (
    <div className="cartao">
      <strong>Meus dados</strong>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 16 }}>
        {paciente?.fotoUrl ? (
          <img src={paciente.fotoUrl} alt="Sua foto" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <div className="avatar-paciente-p" style={{ width: 72, height: 72, fontSize: 22 }}>{iniciaisPaciente || "?"}</div>
        )}
        <div>
          <button
            type="button"
            className="botao-secundario-p"
            onClick={() => inputFotoRef.current && inputFotoRef.current.click()}
            disabled={enviandoFoto}
          >
            <Icone nome="camera" tamanho={14} /> {enviandoFoto ? "Enviando..." : "Trocar minha foto"}
          </button>
          <input ref={inputFotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={aoEscolherFoto} />
          <p className="dica-campo" style={{ marginTop: 6 }}>PNG ou JPG, até 3MB.</p>
        </div>
      </div>
      {erroFoto && <p className="erro-p">{erroFoto}</p>}
      <div style={{ marginTop: 14 }}>
        <label>Nome completo</label>
        <input value={paciente?.nome || ""} disabled />
        <label>E-mail</label>
        <input value={usuario.email || ""} disabled />
        <label>Telefone</label>
        <input value={paciente?.telefone || "—"} disabled />
      </div>
      <p className="texto-vazio-p" style={{ marginTop: 10 }}>
        Pra corrigir algum desses dados, fale com sua psicóloga.
      </p>
      <button className="botao-secundario-p" style={{ marginTop: 14 }} onClick={alterarSenha}>
        <Icone nome="key" tamanho={14} /> Alterar minha senha
      </button>
      {msg && <p className="erro-p" style={{ background: "#DCFCE7", color: "#166534" }}>{msg}</p>}
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

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
