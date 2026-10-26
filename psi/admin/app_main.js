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
      redirectUri: window.location.origin + "/psi/admin/",
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
        aplicarCorMarca(dados.corPrimaria);
      });
    return cancelar;
  }, [psiId]);

  return config;
}

// Faixa no topo conforme a situação da assinatura (teste, somente leitura, etc.).
function FaixaAssinatura({ assinatura }) {
  if (!assinatura) return null;
  const dataBr = (ts) => (ts && ts.toDate ? ts.toDate().toLocaleDateString("pt-BR") : "");
  let texto = "";
  let cor = "#F5F0FF";
  let borda = "#D9C7F5";
  let link = false;
  if (assinatura.situacao === "teste") {
    const dias = assinatura.testeAte && assinatura.testeAte.toDate ? Math.max(Math.ceil((assinatura.testeAte.toDate().getTime() - Date.now()) / 86400000), 0) : null;
    texto = "Período de teste" + (dias !== null ? ": restam " + dias + " dia(s)" : "") + ". Ao terminar, a clínica fica 15 dias só para consulta e exportação de dados.";
    link = true;
  } else if (assinatura.situacao === "ativa" && assinatura.origem === "cortesia" && assinatura.cortesiaAte && assinatura.cortesiaAte.toDate
             && Math.ceil((assinatura.cortesiaAte.toDate().getTime() - Date.now()) / 86400000) <= 7) {
    const dias = Math.max(Math.ceil((assinatura.cortesiaAte.toDate().getTime() - Date.now()) / 86400000), 0);
    texto = "Seu acesso de cortesia termina " + (dias === 0 ? "hoje" : "em " + dias + " dia(s)") + " (" + dataBr(assinatura.cortesiaAte) + "). Depois disso, a clínica fica 15 dias só para consulta.";
    cor = "#FEF3C7"; borda = "#F59E0B"; link = true;
  } else if (assinatura.situacao === "ativa" && assinatura.proximoVencimento && assinatura.proximoVencimento.toDate
             && Math.ceil((assinatura.proximoVencimento.toDate().getTime() - Date.now()) / 86400000) <= 7) {
    const dias = Math.max(Math.ceil((assinatura.proximoVencimento.toDate().getTime() - Date.now()) / 86400000), 0);
    texto = "Seu plano vence " + (dias === 0 ? "hoje" : "em " + dias + " dia(s)") + " (" + dataBr(assinatura.proximoVencimento) + ").";
    cor = "#FEF3C7"; borda = "#F59E0B"; link = true;
  } else if (assinatura.situacao === "atrasada") {
    texto = "Há um pagamento em atraso. Regularize para evitar a limitação do acesso.";
    cor = "#FEF3C7"; borda = "#F59E0B"; link = true;
  } else if (assinatura.situacao === "somente_leitura") {
    texto = "Seu teste terminou. Você pode consultar e exportar seus dados até " + dataBr(assinatura.leituraAte) + ", mas não pode gravar novas informações. Assine para continuar.";
    cor = "#FEF3C7"; borda = "#F59E0B"; link = true;
  } else if (assinatura.situacao === "suspensa" || assinatura.situacao === "cancelada") {
    texto = "Sua assinatura está " + (assinatura.situacao === "suspensa" ? "suspensa" : "cancelada") + ". Você pode consultar e exportar seus dados, mas não gravar novas informações. Fale conosco para reativar.";
    cor = "#FEE2E2"; borda = "#DC2626"; link = true;
  } else {
    return null;
  }
  return (
    <div style={{ background: cor, border: "1px solid " + borda, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#1F1B2E" }}>
      {texto}{" "}
      {link && (assinatura.linkCobranca
        ? <a href={assinatura.linkCobranca} target="_blank" rel="noopener" style={{ color: "var(--cor-marca)", fontWeight: 700 }}>Pagar agora</a>
        : <a href={LINK_PLANO_PLUS} style={{ color: "var(--cor-marca)", fontWeight: 700 }}>Falar sobre o plano</a>)}
    </div>
  );
}

function App() {
  const { usuario, carregando } = useUsuarioLogado();
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
      try { localStorage.setItem("psicoworking_psi_id", usuario.psiId); } catch (e) {}
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
    return <div className="tela-central"><p>Carregando...</p></div>;
  }

  if (!usuario) {
    return <TelaLogin configClinica={configPreLogin} />;
  }

  // A administradora da plataforma entra aqui só para gerenciar o catálogo
  // (fábulas, ferramentas e psicoeducação). As psicólogas apenas usam o catálogo.
  const ehAdminPlataforma = usuario.role === "admin_matriz";
  const telaEfetiva = ehAdminPlataforma ? "recursos" : telaAtiva;
  // Dentro do painel da plataforma (iframe) o menu lateral não aparece: o catálogo ocupa a tela.
  const embutido = ehAdminPlataforma && new URLSearchParams(window.location.search).get("embutido") === "1";
  const podeAcessarAdmin = usuario.role === "psi" || usuario.role === "secretaria" || ehAdminPlataforma;
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
      {!embutido && (
        <Sidebar
          usuario={usuario}
          telaAtiva={telaEfetiva}
          aoTrocarTela={setTelaAtiva}
          configClinica={configClinica}
        />
      )}
      <main className="area-principal">
        {!embutido && <FaixaAssinatura assinatura={assinatura} />}
        {statusConexaoGoogle && statusConexaoGoogle.startsWith("erro") && (
          <p className="mensagem-erro">
            Não foi possível conectar o Google Agenda: {statusConexaoGoogle}
          </p>
        )}
        {telaEfetiva === "dashboard" && (
          <TelaDashboard usuario={usuario} aoAbrirPaciente={() => setTelaAtiva("pacientes")} />
        )}
        {telaEfetiva === "pacientes" && <TelaPacientes usuario={usuario} />}
        {telaEfetiva === "financeiro" && <TelaFinanceiro usuario={usuario} />}
        {telaEfetiva === "recursos" && <TelaRecursos usuario={usuario} />}
        {telaEfetiva === "agenda" && <TelaAgenda usuario={usuario} />}
        {telaEfetiva === "configuracoes" && <TelaConfiguracoes usuario={usuario} />}
      </main>
    </div>
  );
}

function Sidebar({ usuario, telaAtiva, aoTrocarTela, configClinica }) {
  const temMarca = configClinica && (configClinica.nome || configClinica.logoUrl);
  const inicial = (configClinica?.nome || usuario.email || "?").trim().charAt(0).toUpperCase();

  const todosItens = [
    { id: "dashboard", rotulo: "Dashboard", icone: "layout-dashboard" },
    { id: "pacientes", rotulo: "Pacientes", icone: "users" },
    { id: "financeiro", rotulo: "Financeiro", icone: "circle-dollar-sign" },
    { id: "recursos", rotulo: "Recursos Terapêuticos", icone: "wrench" },
    { id: "agenda", rotulo: "Agenda", icone: "calendar-days" },
    { id: "configuracoes", rotulo: "Configurações", icone: "settings" },
  ];
  const ehAdminPlataforma = usuario.role === "admin_matriz";
  const itens = ehAdminPlataforma ? todosItens.filter((i) => i.id === "recursos") : todosItens;

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
        {ehAdminPlataforma && (
          <a className="item-menu" href="/psi/matriz/">
            <Icone nome="building-2" tamanho={17} />
            Painel da plataforma
          </a>
        )}
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

// Wrapper simples da biblioteca Lucide (CDN, sem lucide-react).
// React gerencia o <span>; lucide gerencia o conteúdo interno.
// Se usarmos <i> como nó React direto, o lucide substitui o <i> por
// <svg> fora do controle do React e o removeChild quebra na desmontagem.
function Icone({ nome, tamanho = 16 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = `<i data-lucide="${nome}" class="icone-lucide" style="width:${tamanho}px;height:${tamanho}px"></i>`;
    window.lucide.createIcons();
  }, [nome, tamanho]);
  return <span ref={ref} style={{ display: "inline-flex", width: tamanho, height: tamanho, flexShrink: 0 }} />;
}

function Spinner({ tamanho = 24 }) {
  return (
    <div style={{
      display: "inline-block", width: tamanho, height: tamanho,
      border: "3px solid var(--borda)", borderTopColor: "var(--cor-marca)",
      borderRadius: "50%", animation: "girar 0.7s linear infinite",
    }} />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
