// ═══════════════════════════════════════════════════════════════
//  app_main.js — App(), Sidebar, routing
// ═══════════════════════════════════════════════════════════════

function usarConexaoGoogleAgenda(usuario) {
  const [status, setStatus] = useState(null); // null=verificando, 'ok', 'erro'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("code");
    if (!codigo || !usuario || usuario.role !== "psi") return;

    // Limpa o código da URL imediatamente para não reenviar em caso de F5.
    window.history.replaceState({}, "", window.location.pathname);

    chamarConectarGoogleCalendar({
      codigoAutorizacao: codigo,
      redirectUri: window.location.origin + window.location.pathname,
    })
      .then(() => setStatus("ok"))
      .catch((e) => setStatus("erro: " + (e.message || JSON.stringify(e))));
  }, [usuario]);

  return status;
}

// Lê psi_config (nome, logo, cor) e já aplica a cor no CSS assim que
// carrega — usado pra branding do próprio painel (o login, antes de
// autenticar, ainda não sabe qual clínica é, ver CLAUDE.md).
function usarConfiguracaoClinica(psiId) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (!psiId) return;
    const cancelar = db
      .collection("psi_config")
      .doc(psiId)
      .onSnapshot((doc) => {
        const dados = doc.exists ? doc.data() : {};
        setConfig(dados);
        if (dados.corPrimaria) {
          document.documentElement.style.setProperty("--cor-marca", dados.corPrimaria);
        }
      });
    return cancelar;
  }, [psiId]);

  return config;
}

function App() {
  const { usuario, carregando } = useUsuarioLogado();
  const [telaAtiva, setTelaAtiva] = useState("pacientes");
  const statusConexaoGoogle = usarConexaoGoogleAgenda(usuario);
  const configClinica = usarConfiguracaoClinica(usuario && usuario.psiId);

  useEffect(() => {
    if (statusConexaoGoogle === "ok") setTelaAtiva("agenda");
  }, [statusConexaoGoogle]);

  if (carregando) {
    return <div className="tela-central"><p>Carregando...</p></div>;
  }

  if (!usuario) {
    return <TelaLogin />;
  }

  const podeAcessarAdmin = usuario.role === "psi" || usuario.role === "secretaria";
  if (!podeAcessarAdmin) {
    return (
      <div className="tela-central">
        <div className="cartao-login">
          <h1>Acesso não permitido</h1>
          <p>Esta área é exclusiva da equipe da clínica.</p>
          <button className="botao-secundario" onClick={logout}>Sair</button>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-admin">
      <Sidebar
        usuario={usuario}
        telaAtiva={telaAtiva}
        aoTrocarTela={setTelaAtiva}
        configClinica={configClinica}
      />
      <main className="area-principal">
        {statusConexaoGoogle && statusConexaoGoogle.startsWith("erro") && (
          <p className="mensagem-erro">
            Não foi possível conectar o Google Agenda: {statusConexaoGoogle}
          </p>
        )}
        {telaAtiva === "pacientes" && <TelaPacientes usuario={usuario} />}
        {telaAtiva === "agenda" && <TelaAgenda usuario={usuario} />}
        {telaAtiva === "configuracoes" && <TelaConfiguracoes usuario={usuario} />}
      </main>
    </div>
  );
}

function Sidebar({ usuario, telaAtiva, aoTrocarTela, configClinica }) {
  const temMarca = configClinica && (configClinica.nome || configClinica.logoUrl);
  const inicial = (configClinica?.nome || usuario.email || "?").trim().charAt(0).toUpperCase();

  const itens = [
    { id: "pacientes", rotulo: "Pacientes", icone: "users" },
    { id: "agenda", rotulo: "Agenda", icone: "calendar-days" },
    { id: "configuracoes", rotulo: "Configurações", icone: "settings" },
  ];

  return (
    <aside className="barra-lateral">
      {temMarca ? (
        <div className="marca-barra-lateral-clinica">
          {configClinica.logoUrl ? (
            <img src={configClinica.logoUrl} alt="Logo" className="logo-barra-lateral" />
          ) : (
            <div className="avatar-marca">{inicial}</div>
          )}
          <span>{configClinica.nome}</span>
        </div>
      ) : (
        <div className="logo-plataforma-negativa marca-barra-lateral">PsiCoWorking</div>
      )}
      <nav>
        {itens.map((item) => (
          <a
            key={item.id}
            className={"item-menu" + (telaAtiva === item.id ? " item-menu-ativo" : "")}
            href="#"
            onClick={(e) => { e.preventDefault(); aoTrocarTela(item.id); }}
          >
            <Icone nome={item.icone} tamanho={17} />
            {item.rotulo}
          </a>
        ))}
      </nav>
      <div className="rodape-barra-lateral">
        {configClinica?.fotoUrl ? (
          <img src={configClinica.fotoUrl} alt="Sua foto" className="avatar-usuario avatar-usuario-foto" />
        ) : (
          <div className="avatar-usuario">{usuario.email.charAt(0).toUpperCase()}</div>
        )}
        <div className="rodape-info">
          <p className="email-usuario">{usuario.email}</p>
          <button className="botao-sair" onClick={logout}>
            <Icone nome="log-out" tamanho={13} /> Sair
          </button>
        </div>
      </div>
      <div className="selo-rodape">
        <div className="logo-plataforma-negativa">PsiCoWorking</div>
      </div>
    </aside>
  );
}

// Wrapper simples da biblioteca Lucide (CDN, sem lucide-react) —
// desenha um <i data-lucide> e deixa a lib substituir pelo SVG.
function Icone({ nome, tamanho = 16 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  return <i ref={ref} data-lucide={nome} className="icone-lucide" style={{ width: tamanho, height: tamanho }}></i>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
