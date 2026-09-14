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
      .catch(() => setStatus("erro"));
  }, [usuario]);

  return status;
}

function App() {
  const { usuario, carregando } = useUsuarioLogado();
  const [telaAtiva, setTelaAtiva] = useState("pacientes");
  const statusConexaoGoogle = usarConexaoGoogleAgenda(usuario);

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
      <Sidebar usuario={usuario} telaAtiva={telaAtiva} aoTrocarTela={setTelaAtiva} />
      <main className="area-principal">
        {statusConexaoGoogle === "erro" && (
          <p className="mensagem-erro">
            Não foi possível conectar o Google Agenda. Tente novamente.
          </p>
        )}
        {telaAtiva === "pacientes" && <TelaPacientes usuario={usuario} />}
        {telaAtiva === "agenda" && <TelaAgenda usuario={usuario} />}
      </main>
    </div>
  );
}

function Sidebar({ usuario, telaAtiva, aoTrocarTela }) {
  return (
    <aside className="barra-lateral">
      <div className="marca-barra-lateral">PsiCoWorking</div>
      <nav>
        <a
          className={"item-menu" + (telaAtiva === "pacientes" ? " item-menu-ativo" : "")}
          href="#"
          onClick={(e) => { e.preventDefault(); aoTrocarTela("pacientes"); }}
        >
          Pacientes
        </a>
        <a
          className={"item-menu" + (telaAtiva === "agenda" ? " item-menu-ativo" : "")}
          href="#"
          onClick={(e) => { e.preventDefault(); aoTrocarTela("agenda"); }}
        >
          Agenda
        </a>
      </nav>
      <div className="rodape-barra-lateral">
        <p className="email-usuario">{usuario.email}</p>
        <button className="botao-sair" onClick={logout}>Sair</button>
      </div>
    </aside>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
