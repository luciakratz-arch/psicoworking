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
      redirectUri: window.location.origin + "/psi/admin/"
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

// Faixa no topo conforme a situação da assinatura (teste, somente leitura, etc.).
function FaixaAssinatura({
  assinatura,
  aoAbrirPlano
}) {
  if (!assinatura) return null;
  const dataBr = ts => ts && ts.toDate ? ts.toDate().toLocaleDateString("pt-BR") : "";
  let texto = "";
  let cor = "#F5F0FF";
  let borda = "#D9C7F5";
  let link = false;
  if (assinatura.situacao === "teste") {
    const dias = assinatura.testeAte && assinatura.testeAte.toDate ? Math.max(Math.ceil((assinatura.testeAte.toDate().getTime() - Date.now()) / 86400000), 0) : null;
    texto = "Período de teste" + (dias !== null ? ": restam " + dias + " dia(s)" : "") + ". Ao terminar, a clínica fica 15 dias só para consulta e exportação de dados.";
    link = true;
  } else if (assinatura.situacao === "ativa" && assinatura.origem === "cortesia" && assinatura.cortesiaAte && assinatura.cortesiaAte.toDate && Math.ceil((assinatura.cortesiaAte.toDate().getTime() - Date.now()) / 86400000) <= 7) {
    const dias = Math.max(Math.ceil((assinatura.cortesiaAte.toDate().getTime() - Date.now()) / 86400000), 0);
    texto = "Seu acesso de cortesia termina " + (dias === 0 ? "hoje" : "em " + dias + " dia(s)") + " (" + dataBr(assinatura.cortesiaAte) + "). Depois disso, a clínica fica 15 dias só para consulta.";
    cor = "#FEF3C7";
    borda = "#F59E0B";
    link = true;
  } else if (assinatura.situacao === "ativa" && assinatura.proximoVencimento && assinatura.proximoVencimento.toDate && Math.ceil((assinatura.proximoVencimento.toDate().getTime() - Date.now()) / 86400000) <= 7) {
    const dias = Math.max(Math.ceil((assinatura.proximoVencimento.toDate().getTime() - Date.now()) / 86400000), 0);
    texto = "Seu plano vence " + (dias === 0 ? "hoje" : "em " + dias + " dia(s)") + " (" + dataBr(assinatura.proximoVencimento) + ").";
    cor = "#FEF3C7";
    borda = "#F59E0B";
    link = true;
  } else if (assinatura.situacao === "atrasada") {
    texto = "Há um pagamento em atraso. Regularize para evitar a limitação do acesso.";
    cor = "#FEF3C7";
    borda = "#F59E0B";
    link = true;
  } else if (assinatura.situacao === "somente_leitura") {
    texto = "Seu teste terminou. Você pode consultar e exportar seus dados até " + dataBr(assinatura.leituraAte) + ", mas não pode gravar novas informações. Assine para continuar.";
    cor = "#FEF3C7";
    borda = "#F59E0B";
    link = true;
  } else if (assinatura.situacao === "suspensa" || assinatura.situacao === "cancelada") {
    texto = "Sua assinatura está " + (assinatura.situacao === "suspensa" ? "suspensa" : "cancelada") + ". Você pode consultar e exportar seus dados, mas não gravar novas informações. Fale conosco para reativar.";
    cor = "#FEE2E2";
    borda = "#DC2626";
    link = true;
  } else {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: cor,
      border: "1px solid " + borda,
      borderRadius: 10,
      padding: "10px 14px",
      marginBottom: 16,
      fontSize: 13,
      color: "#1F1B2E"
    }
  }, texto, " ", link && (assinatura.linkCobranca ? /*#__PURE__*/React.createElement("a", {
    href: assinatura.linkCobranca,
    target: "_blank",
    rel: "noopener",
    style: {
      color: "var(--cor-marca)",
      fontWeight: 700
    }
  }, "Pagar agora") : /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      if (aoAbrirPlano) aoAbrirPlano();
    },
    style: {
      color: "var(--cor-marca)",
      fontWeight: 700
    }
  }, "Ver meu plano")));
}
function App() {
  const {
    usuario,
    carregando
  } = useUsuarioLogado();
  const [telaAtiva, setTelaAtiva] = useState("dashboard");
  const statusConexaoGoogle = usarConexaoGoogleAgenda(usuario);
  const configClinica = usarConfiguracaoClinica(usuario && usuario.psiId);
  const assinatura = usarAssinatura(usuario && usuario.psiId);

  // A administradora entra pela mesma porta (/entrar) e vai direto para o painel da
  // plataforma, sem pedir o login de novo (a sessão é a mesma). Dentro do painel da
  // plataforma, o catálogo aparece embutido (?embutido=1) e não redireciona.
  useEffect(() => {
    if (usuario && usuario.role === "admin_matriz" && new URLSearchParams(window.location.search).get("embutido") !== "1") {
      window.location.replace("/plataforma");
    }
  }, [usuario]);
  const psiIdEndereco = usarPsiIdPorEndereco();
  const configPreLogin = usarConfiguracaoPreLogin(!usuario ? psiIdEndereco : null);
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
  // Dentro do painel da plataforma (iframe) o menu lateral não aparece: o catálogo ocupa a tela.
  const embutido = ehAdminPlataforma && new URLSearchParams(window.location.search).get("embutido") === "1";
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
  }, !embutido && /*#__PURE__*/React.createElement(Sidebar, {
    usuario: usuario,
    telaAtiva: telaEfetiva,
    aoTrocarTela: setTelaAtiva,
    configClinica: configClinica
  }), /*#__PURE__*/React.createElement("main", {
    className: "area-principal"
  }, !embutido && /*#__PURE__*/React.createElement(FaixaAssinatura, {
    assinatura: assinatura,
    aoAbrirPlano: () => setTelaAtiva("plano")
  }), statusConexaoGoogle && statusConexaoGoogle.startsWith("erro") && /*#__PURE__*/React.createElement("p", {
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
  }), telaEfetiva === "plano" && usuario.role === "psi" && /*#__PURE__*/React.createElement(TelaMeuPlano, {
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
    id: "plano",
    rotulo: "Meu plano",
    icone: "credit-card"
  }, {
    id: "configuracoes",
    rotulo: "Configurações",
    icone: "settings"
  }];
  const ehAdminPlataforma = usuario.role === "admin_matriz";
  const itens = ehAdminPlataforma ? todosItens.filter(i => i.id === "recursos") : todosItens.filter(i => i.id !== "plano" || usuario.role === "psi");
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