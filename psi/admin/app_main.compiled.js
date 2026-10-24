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
      aplicarCorMarca(dados.corPrimaria);
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
  const [telaAtiva, setTelaAtiva] = useState("dashboard");
  const statusConexaoGoogle = usarConexaoGoogleAgenda(usuario);
  const configClinica = usarConfiguracaoClinica(usuario && usuario.psiId);
  const configPreLogin = usarConfiguracaoPreLogin(!usuario ? pegarPsiIdConhecido() : null);
  useEffect(() => {
    if (statusConexaoGoogle === "ok") setTelaAtiva("agenda");
  }, [statusConexaoGoogle]);

  // Guarda o psi_id assim que ele fica conhecido de verdade (custom
  // claim, pós-login), pra reconhecer a clínica em visitas futuras
  // mesmo sem o ?psi= na URL.
  useEffect(() => {
    if (usuario?.psiId) {
      try {
        localStorage.setItem("psicoworking_psi_id", usuario.psiId);
      } catch (e) {}
    }
  }, [usuario]);

  // Prontuário aberto por link do sistema antigo da clínica: leva direto
  // para a tela de Pacientes, onde o paciente certo é localizado.
  useEffect(() => {
    if (usuario && (usuario.role === "psi" || usuario.role === "secretaria") && acaoPorLinkPendente()) {
      setTelaAtiva("pacientes");
    }
  }, [usuario]);
  if (carregando) {
    return /*#__PURE__*/React.createElement("div", {
      className: "tela-central"
    }, /*#__PURE__*/React.createElement("p", null, "Carregando..."));
  }
  if (!usuario) {
    return /*#__PURE__*/React.createElement(TelaLogin, {
      configClinica: configPreLogin
    });
  }

  // A administradora da plataforma entra aqui só para gerenciar o catálogo
  // (fábulas, ferramentas e psicoeducação). As psicólogas apenas usam o catálogo.
  const ehAdminPlataforma = usuario.role === "admin_matriz";
  const telaEfetiva = ehAdminPlataforma ? "recursos" : telaAtiva;
  const podeAcessarAdmin = usuario.role === "psi" || usuario.role === "secretaria" || ehAdminPlataforma;
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
    telaAtiva: telaEfetiva,
    aoTrocarTela: setTelaAtiva,
    configClinica: configClinica
  }), /*#__PURE__*/React.createElement("main", {
    className: "area-principal"
  }, statusConexaoGoogle && statusConexaoGoogle.startsWith("erro") && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, "N\xE3o foi poss\xEDvel conectar o Google Agenda: ", statusConexaoGoogle), telaEfetiva === "dashboard" && /*#__PURE__*/React.createElement(TelaDashboard, {
    usuario: usuario,
    aoAbrirPaciente: () => setTelaAtiva("pacientes")
  }), telaEfetiva === "pacientes" && /*#__PURE__*/React.createElement(TelaPacientes, {
    usuario: usuario
  }), telaEfetiva === "financeiro" && /*#__PURE__*/React.createElement(TelaFinanceiro, {
    usuario: usuario
  }), telaEfetiva === "recursos" && /*#__PURE__*/React.createElement(TelaRecursos, {
    usuario: usuario
  }), telaEfetiva === "agenda" && /*#__PURE__*/React.createElement(TelaAgenda, {
    usuario: usuario
  }), telaEfetiva === "configuracoes" && /*#__PURE__*/React.createElement(TelaConfiguracoes, {
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
  const todosItens = [{
    id: "dashboard",
    rotulo: "Dashboard",
    icone: "layout-dashboard"
  }, {
    id: "pacientes",
    rotulo: "Pacientes",
    icone: "users"
  }, {
    id: "financeiro",
    rotulo: "Financeiro",
    icone: "circle-dollar-sign"
  }, {
    id: "recursos",
    rotulo: "Recursos Terapêuticos",
    icone: "wrench"
  }, {
    id: "agenda",
    rotulo: "Agenda",
    icone: "calendar-days"
  }, {
    id: "configuracoes",
    rotulo: "Configurações",
    icone: "settings"
  }];
  const ehAdminPlataforma = usuario.role === "admin_matriz";
  const itens = ehAdminPlataforma ? todosItens.filter(i => i.id === "recursos") : todosItens;
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
  }), item.rotulo)), ehAdminPlataforma && /*#__PURE__*/React.createElement("a", {
    className: "item-menu",
    href: "/psi/matriz/"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "building-2",
    tamanho: 17
  }), "Painel da plataforma")), /*#__PURE__*/React.createElement("div", {
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

// Wrapper simples da biblioteca Lucide (CDN, sem lucide-react).
// React gerencia o <span>; lucide gerencia o conteúdo interno.
// Se usarmos <i> como nó React direto, o lucide substitui o <i> por
// <svg> fora do controle do React e o removeChild quebra na desmontagem.
function Icone({
  nome,
  tamanho = 16
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = `<i data-lucide="${nome}" class="icone-lucide" style="width:${tamanho}px;height:${tamanho}px"></i>`;
    window.lucide.createIcons();
  }, [nome, tamanho]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      display: "inline-flex",
      width: tamanho,
      height: tamanho,
      flexShrink: 0
    }
  });
}
function Spinner({
  tamanho = 24
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-block",
      width: tamanho,
      height: tamanho,
      border: "3px solid var(--borda)",
      borderTopColor: "var(--cor-marca)",
      borderRadius: "50%",
      animation: "girar 0.7s linear infinite"
    }
  });
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));