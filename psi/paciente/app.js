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

const { useState, useEffect, useRef } = React;

function Icone({ nome, tamanho = 16 }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  return <i data-lucide={nome} className="icone-lucide" style={{ width: tamanho, height: tamanho }}></i>;
}

// Campo de texto com ditado por voz — mesmo componente usado em todo
// o admin (app_core.js). Regra permanente: todo campo de texto livre
// no PsiCoWorking tem esse microfone, nunca um <textarea> cru (ver
// memória "Padrão de UI PsiCoWorking"). Arquivo separado do admin,
// sem escopo compartilhado, por isso a mesma lógica é duplicada aqui.
function TextAreaVoz({ value, onChange, rows, placeholder }) {
  const [gravando, setGravando] = useState(false);
  const reconhecimentoRef = useRef(null);
  const temSuporte = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  function alternarGravacao() {
    if (gravando) {
      reconhecimentoRef.current?.stop();
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let textoNovo = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) textoNovo += e.results[i][0].transcript;
      }
      if (textoNovo) {
        onChange({ target: { value: (value ? value + " " : "") + textoNovo } });
      }
    };
    rec.onend = () => setGravando(false);
    rec.start();
    reconhecimentoRef.current = rec;
    setGravando(true);
  }

  return (
    <div className="campo-com-mic">
      <textarea rows={rows} placeholder={placeholder} value={value} onChange={onChange} />
      {temSuporte && (
        <button type="button" className={"botao-mic" + (gravando ? " botao-mic-gravando" : "")} onClick={alternarGravacao} title="Falar em vez de digitar">
          <Icone nome={gravando ? "square" : "mic"} tamanho={14} />
        </button>
      )}
    </div>
  );
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

// Cada ferramenta interativa tem seu próprio componente (mesmo padrão
// do app de referência: dispatcher por formularioKey). Uma ferramenta
// sem componente próprio ainda cai nos fallbacks (fábula/blocos/texto)
// logo abaixo — é assim que ela "nasce" simples e vai virando interativa.
const COMPONENTES_FERRAMENTA = {
  "anxiety-management": FerramentaGestaoAnsiedade,
  "abc-record": FerramentaABC,
  "decision-tree": FerramentaArvore,
};

function DetalheRecurso({ item, usuario, paciente, aoVoltar }) {
  const paginas = Array.isArray(item.paginas) ? item.paginas : [];
  const blocos = Array.isArray(item.blocos) ? item.blocos : [];
  const conteudoTexto = item.conteudo || item.passos || item.texto || "";
  const ComponenteFerramenta = COMPONENTES_FERRAMENTA[item.formularioKey];

  return (
    <div>
      <button className="botao-voltar" onClick={aoVoltar}>
        <Icone nome="arrow-left" tamanho={15} /> Voltar para Recursos
      </button>
      <div className="cartao">
        <h2 style={{ margin: "0 0 6px" }}>{item.titulo || item.nome}</h2>
        {item.descricao && <p style={{ color: "#6B7280", fontSize: 13.5, marginBottom: 18 }}>{item.descricao}</p>}

        {ComponenteFerramenta && (
          <ComponenteFerramenta usuario={usuario} paciente={paciente} recurso={item} />
        )}
        {!ComponenteFerramenta && paginas.length > 0 && (
          <LeitorFabula usuario={usuario} paciente={paciente} recurso={item} />
        )}
        {!ComponenteFerramenta && paginas.length === 0 && blocos.length > 0 && (
          <VisualizadorBlocos blocos={blocos} />
        )}
        {!ComponenteFerramenta && paginas.length === 0 && blocos.length === 0 && conteudoTexto && (
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: 14 }}>{conteudoTexto}</p>
        )}
        {item.formularioKey && !ComponenteFerramenta && paginas.length === 0 && blocos.length === 0 && !conteudoTexto && (
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
          <TextAreaVoz rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Observações..." />
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
              <TextAreaVoz rows={2} value={resp[i]} onChange={(e) => { const r = [...resp]; r[i] = e.target.value; setResp(r); }} placeholder="Sua resposta..." />
            </div>
          ))}
          <button className="botao-primario-p" onClick={salvarPensamentos}>{msg || "Salvar respostas"}</button>
        </div>
      )}
    </div>
  );
}

// ─── Ferramenta: Registro ABC de Pensamentos (grava de verdade) ─
function FerramentaABC({ usuario, paciente, recurso }) {
  const EMOCOES = ["Ansiedade", "Tristeza", "Raiva", "Medo", "Vergonha", "Culpa", "Frustração", "Insegurança", "Alívio", "Esperança"];
  const PASSOS_INFO = [
    { n: 1, letra: "A", titulo: "Situação", subtitulo: "O que aconteceu?", dica: "Descreva a situação de forma objetiva — onde estava, com quem, o que aconteceu. Sem interpretações ainda.", placeholder: "Ex: Meu chefe me chamou para uma conversa inesperada..." },
    { n: 2, letra: "B", titulo: "Pensamento Automático", subtitulo: "O que passou pela sua cabeça?", dica: "Escreva exatamente como o pensamento veio à mente, sem filtrar.", placeholder: "Ex: Vou ser demitido(a), eu fiz tudo errado..." },
    { n: 3, letra: "C", titulo: "Emoção e Intensidade", subtitulo: "O que você sentiu?", dica: "Escolha a emoção mais próxima e avalie a intensidade dela." },
    { n: 4, letra: "D", titulo: "Resposta Racional", subtitulo: "O que a razão diz?", dica: "Questione o pensamento: há evidências reais? Existe outra forma de ver essa situação?", placeholder: "Ex: Não tenho provas de que serei demitido(a); posso perguntar diretamente..." },
  ];

  const [passo, setPasso] = useState(1);
  const [draft, setDraft] = useState({ situacao: "", pensamento: "", emocao: "", intensidade: 60, alternativo: "" });
  const [historico, setHistorico] = useState([]);
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    db.collection("clinica_registro_abc")
      .where("pacienteId", "==", usuario.uid)
      .get()
      .then((snap) => {
        const docs = snap.docs.map((d) => d.data()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setHistorico(docs.slice(0, 5));
      })
      .catch(() => {});
  }, [usuario.uid]);

  const passoInfo = PASSOS_INFO[passo - 1];
  const podeAvancar =
    (passo === 1 && draft.situacao.trim()) ||
    (passo === 2 && draft.pensamento.trim()) ||
    (passo === 3 && draft.emocao) ||
    (passo === 4 && draft.alternativo.trim());

  async function salvar() {
    setSalvando(true);
    try {
      await db.collection("clinica_registro_abc").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        situacao: draft.situacao, pensamento: draft.pensamento, emocao: draft.emocao,
        intensidade: draft.intensidade, alternativo: draft.alternativo,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setHistorico((h) => [{ ...draft, data: new Date().toLocaleDateString("pt-BR") }, ...h].slice(0, 5));
      setPasso(5);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  function recomecar() {
    setDraft({ situacao: "", pensamento: "", emocao: "", intensidade: 60, alternativo: "" });
    setPasso(1);
    setMsg("");
  }

  if (passo === 5) {
    return (
      <div>
        <div className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB", textAlign: "center" }}>
          <Icone nome="check-circle-2" tamanho={36} />
          <h3 style={{ margin: "10px 0 4px" }}>Registro concluído</h3>
          <p className="texto-vazio-p">Seu registro foi salvo. Sua psicóloga vai poder ver isso na próxima sessão.</p>
          <button className="botao-primario-p" style={{ marginTop: 12 }} onClick={recomecar}>
            <Icone nome="plus" tamanho={14} /> Novo registro
          </button>
        </div>
        {historico.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong style={{ fontSize: 13 }}>Registros recentes</strong>
            {historico.map((h, i) => (
              <div key={i} className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB", marginTop: 8 }}>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{h.data} · {h.emocao} ({h.intensidade}/100)</div>
                <div style={{ fontSize: 13, marginTop: 4 }}><strong>Situação:</strong> {h.situacao}</div>
                <div style={{ fontSize: 13, marginTop: 2 }}><strong>Pensamento:</strong> {h.pensamento}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {PASSOS_INFO.map((p) => (
          <div
            key={p.n}
            style={{ flex: 1, height: 5, borderRadius: 20, background: p.n <= passo ? "var(--cor-marca)" : "#EADDFC", cursor: p.n < passo ? "pointer" : "default", transition: "background .2s" }}
            onClick={() => p.n < passo && setPasso(p.n)}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EADDFC", color: "var(--cor-marca)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{passoInfo.letra}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{passoInfo.titulo}</div>
          <div style={{ fontSize: 12.5, color: "#6B7280" }}>{passoInfo.subtitulo}</div>
        </div>
      </div>

      {passoInfo.dica && (
        <p style={{ fontSize: 12.5, color: "#6B7280", background: "#F9FAFB", borderRadius: 8, padding: "8px 10px", margin: "10px 0" }}>{passoInfo.dica}</p>
      )}

      {passo === 1 && (
        <TextAreaVoz rows={4} value={draft.situacao} onChange={(e) => setDraft((d) => ({ ...d, situacao: e.target.value }))} placeholder={passoInfo.placeholder} />
      )}
      {passo === 2 && (
        <TextAreaVoz rows={4} value={draft.pensamento} onChange={(e) => setDraft((d) => ({ ...d, pensamento: e.target.value }))} placeholder={passoInfo.placeholder} />
      )}
      {passo === 3 && (
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {EMOCOES.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, emocao: em }))}
                style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid", borderColor: draft.emocao === em ? "var(--cor-marca)" : "#E5E7EB", background: draft.emocao === em ? "var(--cor-marca)" : "white", color: draft.emocao === em ? "white" : "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                {em}
              </button>
            ))}
          </div>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Intensidade: {draft.intensidade}/100</label>
          <input type="range" min={0} max={100} value={draft.intensidade} onChange={(e) => setDraft((d) => ({ ...d, intensidade: +e.target.value }))} style={{ width: "100%", accentColor: "var(--cor-marca)" }} />
        </div>
      )}
      {passo === 4 && (
        <TextAreaVoz rows={4} value={draft.alternativo} onChange={(e) => setDraft((d) => ({ ...d, alternativo: e.target.value }))} placeholder={passoInfo.placeholder} />
      )}

      {msg && <p className="erro-p">{msg}</p>}

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="botao-secundario-p" style={{ flex: 1 }} disabled={passo === 1} onClick={() => setPasso((p) => p - 1)}>
          <Icone nome="arrow-left" tamanho={14} /> Anterior
        </button>
        {passo < 4 ? (
          <button className="botao-primario-p" style={{ flex: 2 }} disabled={!podeAvancar} onClick={() => setPasso((p) => p + 1)}>
            Próximo <Icone nome="arrow-right" tamanho={14} />
          </button>
        ) : (
          <button className="botao-primario-p" style={{ flex: 2 }} disabled={!podeAvancar || salvando} onClick={salvar}>
            <Icone nome="check" tamanho={14} /> {salvando ? "Salvando..." : "Salvar registro"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Ferramenta: Árvore da Decisão (grava de verdade) ────────────
function FerramentaArvore({ usuario, paciente, recurso }) {
  const [step, setStep] = useState("home");
  const [preocupacao, setPreocupacao] = useState("");
  const [acoes, setAcoes] = useState("");
  const [plano, setPlano] = useState("");
  const [conclusao, setConclusao] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    db.collection("clinica_arvore_decisao")
      .where("pacienteId", "==", usuario.uid)
      .get()
      .then((snap) => {
        const docs = snap.docs.map((d) => d.data()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setHistorico(docs.slice(0, 5));
      })
      .catch(() => {});
  }, [usuario.uid]);

  const TEXTO_CONCLUSAO = {
    redirect: { icone: "wind", titulo: "Solte essa preocupação", texto: "Isso não está sob seu controle agora. Tente redirecionar sua atenção para algo que você pode influenciar." },
    "act-now": { icone: "zap", titulo: "Ótimo, você pode agir agora", texto: "Você já sabe o que fazer — coloque em prática assim que possível." },
    plan: { icone: "calendar-check", titulo: "Você tem um plano", texto: "Nem tudo precisa ser resolvido agora. Ter um plano já reduz a ansiedade." },
  };

  async function salvarHistorico(c) {
    setSalvando(true);
    try {
      await db.collection("clinica_arvore_decisao").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        preocupacao, acoes, plano, conclusao: c,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setHistorico((h) => [{ preocupacao, acoes, plano, conclusao: c, data: new Date().toLocaleDateString("pt-BR") }, ...h].slice(0, 5));
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    } finally {
      setConclusao(c);
      setStep("conclusao");
      setSalvando(false);
    }
  }

  function recomecar() {
    setPreocupacao(""); setAcoes(""); setPlano(""); setConclusao(null); setStep("home"); setMsg("");
  }

  if (step === "conclusao" && conclusao) {
    const info = TEXTO_CONCLUSAO[conclusao];
    return (
      <div>
        <div className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB", textAlign: "center" }}>
          <Icone nome={info.icone} tamanho={32} />
          <h3 style={{ margin: "10px 0 4px" }}>{info.titulo}</h3>
          <p className="texto-vazio-p">{info.texto}</p>
          <button className="botao-primario-p" style={{ marginTop: 12 }} onClick={recomecar}>
            <Icone nome="plus" tamanho={14} /> Nova preocupação
          </button>
        </div>
        {historico.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong style={{ fontSize: 13 }}>Registros recentes</strong>
            {historico.map((h, i) => (
              <div key={i} className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB", marginTop: 8 }}>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{h.data}</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>{h.preocupacao}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {step === "home" && (
        <div>
          <label style={{ fontWeight: 600, fontSize: 13 }}>O que está te preocupando?</label>
          <TextAreaVoz rows={3} value={preocupacao} onChange={(e) => setPreocupacao(e.target.value)} placeholder="Descreva a preocupação..." />
          <button className="botao-primario-p" style={{ marginTop: 12 }} disabled={!preocupacao.trim()} onClick={() => setStep("can-intervene")}>
            Continuar <Icone nome="arrow-right" tamanho={14} />
          </button>
        </div>
      )}

      {step === "can-intervene" && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Você pode fazer algo para resolver esta preocupação?</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="botao-primario-p" style={{ flex: 1 }} onClick={() => setStep("actions")}>
              <Icone nome="check" tamanho={14} /> Sim, posso agir
            </button>
            <button className="botao-secundario-p" style={{ flex: 1 }} onClick={() => salvarHistorico("redirect")}>
              <Icone nome="x" tamanho={14} /> Não está no meu controle
            </button>
          </div>
        </div>
      )}

      {step === "actions" && (
        <div>
          <label style={{ fontWeight: 600, fontSize: 13 }}>O que você pode fazer a respeito?</label>
          <TextAreaVoz rows={3} value={acoes} onChange={(e) => setAcoes(e.target.value)} placeholder="Liste as ações possíveis..." />
          <button className="botao-primario-p" style={{ marginTop: 12 }} disabled={!acoes.trim()} onClick={() => setStep("can-act-now")}>
            Continuar <Icone nome="arrow-right" tamanho={14} />
          </button>
        </div>
      )}

      {step === "can-act-now" && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Você pode agir agora mesmo?</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="botao-primario-p" style={{ flex: 1 }} onClick={() => salvarHistorico("act-now")}>
              <Icone nome="zap" tamanho={14} /> Sim, agora
            </button>
            <button className="botao-secundario-p" style={{ flex: 1 }} onClick={() => setStep("plan")}>
              <Icone nome="calendar" tamanho={14} /> Preciso planejar
            </button>
          </div>
        </div>
      )}

      {step === "plan" && (
        <div>
          <label style={{ fontWeight: 600, fontSize: 13 }}>Quando e como você vai agir?</label>
          <TextAreaVoz rows={3} value={plano} onChange={(e) => setPlano(e.target.value)} placeholder="Ex: Vou conversar com meu chefe na sexta-feira..." />
          <button className="botao-primario-p" style={{ marginTop: 12 }} disabled={!plano.trim() || salvando} onClick={() => salvarHistorico("plan")}>
            <Icone nome="check" tamanho={14} /> {salvando ? "Salvando..." : "Concluir"}
          </button>
        </div>
      )}

      {msg && <p className="erro-p">{msg}</p>}
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
              <TextAreaVoz rows={2} value={respostas[i] || ""} onChange={(e) => setRespostas((r) => ({ ...r, [i]: e.target.value }))} placeholder="Escreva sua reflexão..." />
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
