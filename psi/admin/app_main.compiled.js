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
    }).then(() => setStatus("ok")).catch(e => setStatus("erro: " + (e.message || JSON.stringify(e))));
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
    const cancelar = db.collection("psi_config").doc(psiId).onSnapshot(doc => {
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
  const {
    usuario,
    carregando
  } = useUsuarioLogado();
  const [telaAtiva, setTelaAtiva] = useState("pacientes");
  const statusConexaoGoogle = usarConexaoGoogleAgenda(usuario);
  const configClinica = usarConfiguracaoClinica(usuario && usuario.psiId);
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
    aoTrocarTela: setTelaAtiva,
    configClinica: configClinica
  }), /*#__PURE__*/React.createElement("main", {
    className: "area-principal"
  }, statusConexaoGoogle && statusConexaoGoogle.startsWith("erro") && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, "N\xE3o foi poss\xEDvel conectar o Google Agenda: ", statusConexaoGoogle), telaAtiva === "pacientes" && /*#__PURE__*/React.createElement(TelaPacientes, {
    usuario: usuario
  }), telaAtiva === "agenda" && /*#__PURE__*/React.createElement(TelaAgenda, {
    usuario: usuario
  }), telaAtiva === "configuracoes" && /*#__PURE__*/React.createElement(TelaConfiguracoes, {
    usuario: usuario
  })));
}
function Sidebar({
  usuario,
  telaAtiva,
  aoTrocarTela,
  configClinica
}) {
  const temMarca = configClinica && (configClinica.nome || configClinica.logoUrl);
  const inicial = (configClinica?.nome || usuario.email || "?").trim().charAt(0).toUpperCase();
  const itens = [{
    id: "pacientes",
    rotulo: "Pacientes",
    icone: "users"
  }, {
    id: "agenda",
    rotulo: "Agenda",
    icone: "calendar-days"
  }, {
    id: "configuracoes",
    rotulo: "Configurações",
    icone: "settings"
  }];
  return /*#__PURE__*/React.createElement("aside", {
    className: "barra-lateral"
  }, temMarca ? /*#__PURE__*/React.createElement("div", {
    className: "marca-barra-lateral-clinica"
  }, configClinica.logoUrl ? /*#__PURE__*/React.createElement("img", {
    src: configClinica.logoUrl,
    alt: "Logo",
    className: "logo-barra-lateral"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "avatar-marca"
  }, inicial), /*#__PURE__*/React.createElement("span", null, configClinica.nome)) : /*#__PURE__*/React.createElement("div", {
    className: "logo-plataforma-negativa marca-barra-lateral"
  }, "PsiCoWorking"), /*#__PURE__*/React.createElement("nav", null, itens.map(item => /*#__PURE__*/React.createElement("a", {
    key: item.id,
    className: "item-menu" + (telaAtiva === item.id ? " item-menu-ativo" : ""),
    href: "#",
    onClick: e => {
      e.preventDefault();
      aoTrocarTela(item.id);
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: item.icone,
    tamanho: 17
  }), item.rotulo))), /*#__PURE__*/React.createElement("div", {
    className: "rodape-barra-lateral"
  }, configClinica?.fotoUrl ? /*#__PURE__*/React.createElement("img", {
    src: configClinica.fotoUrl,
    alt: "Sua foto",
    className: "avatar-usuario avatar-usuario-foto"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "avatar-usuario"
  }, usuario.email.charAt(0).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "rodape-info"
  }, /*#__PURE__*/React.createElement("p", {
    className: "email-usuario"
  }, usuario.email), /*#__PURE__*/React.createElement("button", {
    className: "botao-sair",
    onClick: logout
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "log-out",
    tamanho: 13
  }), " Sair"))), /*#__PURE__*/React.createElement("div", {
    className: "selo-rodape"
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo-plataforma-negativa"
  }, "PsiCoWorking")));
}

// Wrapper simples da biblioteca Lucide (CDN, sem lucide-react) —
// desenha um <i data-lucide> e deixa a lib substituir pelo SVG.
function Icone({
  nome,
  tamanho = 16
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  return /*#__PURE__*/React.createElement("i", {
    ref: ref,
    "data-lucide": nome,
    className: "icone-lucide",
    style: {
      width: tamanho,
      height: tamanho
    }
  });
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));