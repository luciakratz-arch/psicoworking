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
      redirectUri: window.location.origin + window.location.pathname
    }).then(() => setStatus("ok")).catch(() => setStatus("erro"));
  }, [usuario]);
  return status;
}
function App() {
  const {
    usuario,
    carregando
  } = useUsuarioLogado();
  const [telaAtiva, setTelaAtiva] = useState("pacientes");
  const statusConexaoGoogle = usarConexaoGoogleAgenda(usuario);
  useEffect(() => {
    if (statusConexaoGoogle === "ok") setTelaAtiva("agenda");
  }, [statusConexaoGoogle]);
  if (carregando) {
    return /*#__PURE__*/React.createElement("div", {
      className: "tela-central"
    }, /*#__PURE__*/React.createElement("p", null, "Carregando..."));
  }
  if (!usuario) {
    return /*#__PURE__*/React.createElement(TelaLogin, null);
  }
  const podeAcessarAdmin = usuario.role === "psi" || usuario.role === "secretaria";
  if (!podeAcessarAdmin) {
    return /*#__PURE__*/React.createElement("div", {
      className: "tela-central"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cartao-login"
    }, /*#__PURE__*/React.createElement("h1", null, "Acesso n\xE3o permitido"), /*#__PURE__*/React.createElement("p", null, "Esta \xE1rea \xE9 exclusiva da equipe da cl\xEDnica."), /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      onClick: logout
    }, "Sair")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "layout-admin"
  }, /*#__PURE__*/React.createElement(Sidebar, {
    usuario: usuario,
    telaAtiva: telaAtiva,
    aoTrocarTela: setTelaAtiva
  }), /*#__PURE__*/React.createElement("main", {
    className: "area-principal"
  }, statusConexaoGoogle === "erro" && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, "N\xE3o foi poss\xEDvel conectar o Google Agenda. Tente novamente."), telaAtiva === "pacientes" && /*#__PURE__*/React.createElement(TelaPacientes, {
    usuario: usuario
  }), telaAtiva === "agenda" && /*#__PURE__*/React.createElement(TelaAgenda, {
    usuario: usuario
  })));
}
function Sidebar({
  usuario,
  telaAtiva,
  aoTrocarTela
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "barra-lateral"
  }, /*#__PURE__*/React.createElement("div", {
    className: "marca-barra-lateral"
  }, "PsicoWorking"), /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("a", {
    className: "item-menu" + (telaAtiva === "pacientes" ? " item-menu-ativo" : ""),
    href: "#",
    onClick: e => {
      e.preventDefault();
      aoTrocarTela("pacientes");
    }
  }, "Pacientes"), /*#__PURE__*/React.createElement("a", {
    className: "item-menu" + (telaAtiva === "agenda" ? " item-menu-ativo" : ""),
    href: "#",
    onClick: e => {
      e.preventDefault();
      aoTrocarTela("agenda");
    }
  }, "Agenda")), /*#__PURE__*/React.createElement("div", {
    className: "rodape-barra-lateral"
  }, /*#__PURE__*/React.createElement("p", {
    className: "email-usuario"
  }, usuario.email), /*#__PURE__*/React.createElement("button", {
    className: "botao-sair",
    onClick: logout
  }, "Sair")));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));