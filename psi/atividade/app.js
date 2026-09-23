// ═══════════════════════════════════════════════════════════════
//  PÁGINA PÚBLICA DE ATIVIDADE
//
//  É o que abre quando o paciente clica no link que a psicóloga
//  mandou pelo WhatsApp. Não tem login, não tem menu: abre direto
//  na ferramenta, pronta pra preencher no celular.
//
//  Tudo que a tela precisa (qual ferramenta, nome do paciente, cor
//  e logo da clínica) vem gravado no próprio documento do link, em
//  clinica_links_partilhados — assim a página não precisa ler
//  nenhuma outra coleção, e ninguém sem o link enxerga nada.
//
//  As ferramentas em si são as MESMAS do Portal do Paciente, vindas
//  de ../compartilhado/ferramentas.js.
// ═══════════════════════════════════════════════════════════════

function TelaAviso({ icone, titulo, texto }) {
  return (
    <div className="envelope-atividade" style={{ paddingTop: 60 }}>
      <div className="cartao" style={{ textAlign: "center", padding: "36px 22px" }}>
        <Icone nome={icone} tamanho={40} />
        <h2 style={{ margin: "12px 0 8px" }}>{titulo}</h2>
        <p className="texto-vazio-p" style={{ lineHeight: 1.7 }}>{texto}</p>
      </div>
    </div>
  );
}

function AppAtividade() {
  const [estado, setEstado] = useState("carregando");
  const [link, setLink] = useState(null);

  useEffect(() => {
    if (!TOKEN_ATIVIDADE) { setEstado("invalido"); return; }
    bancoReal
      .collection("clinica_links_partilhados")
      .doc(TOKEN_ATIVIDADE)
      .get()
      .then((doc) => {
        if (!doc.exists) { setEstado("invalido"); return; }
        const dados = doc.data();
        if (dados.cancelado) { setEstado("cancelado"); return; }
        setLink(dados);
        aplicarCorMarca(dados.corMarca || "#6A2BD9");
        document.title = (dados.titulo || "Atividade") + " — " + (dados.nomeClinica || "PsiCoWorking");
        setEstado("pronto");
      })
      .catch(() => setEstado("invalido"));
  }, []);

  if (estado === "carregando") {
    return <TelaAviso icone="loader" titulo="Carregando" texto="Abrindo sua atividade..." />;
  }
  if (estado === "cancelado") {
    return (
      <TelaAviso
        icone="circle-off"
        titulo="Link desativado"
        texto="Esta atividade não está mais disponível. Fale com a sua psicóloga para receber um link novo."
      />
    );
  }
  if (estado === "invalido") {
    return (
      <TelaAviso
        icone="link-2-off"
        titulo="Link não encontrado"
        texto="Este link pode ter expirado ou sido substituído por um mais novo. Fale com a sua psicóloga para receber outro."
      />
    );
  }

  // O "usuário" aqui não veio de um login — veio do link. Quem grava
  // de verdade é a Cloud Function, que confere o token e usa os dados
  // dela mesma; isso aqui é só pra ferramenta ter o nome na tela.
  const usuario = { uid: link.pacienteId || "", psiId: link.psi_id || "" };
  const paciente = { nome: link.pacienteNome || "" };
  const item = link.item || {};
  const primeiroNome = (link.pacienteNome || "").split(" ")[0];

  const paginas = Array.isArray(item.paginas) ? item.paginas : [];
  const blocos = Array.isArray(item.blocos) ? item.blocos : [];
  const ComponenteFerramenta = COMPONENTES_FERRAMENTA[resolverFormularioKey(item)];

  return (
    <div>
      <div className="topo-atividade">
        {link.logoUrl
          ? <img src={link.logoUrl} alt={link.nomeClinica || ""} />
          : <div style={{ fontWeight: 700, fontSize: 15 }}>{link.nomeClinica || "PsiCoWorking"}</div>}
        <div style={{ fontSize: 12.5, opacity: 0.85 }}>Atividade terapêutica</div>
      </div>

      <div className="envelope-atividade">
        {primeiroNome && (
          <p style={{ fontSize: 14.5, marginBottom: 14 }}>
            Olá, <strong>{primeiroNome}</strong>. Esta atividade foi preparada para você.
          </p>
        )}

        <div className="cartao">
          <h2 style={{ margin: "0 0 6px" }}>{item.titulo || item.nome}</h2>

          {ComponenteFerramenta && (
            <ComponenteFerramenta usuario={usuario} paciente={paciente} recurso={item} />
          )}
          {!ComponenteFerramenta && paginas.length > 0 && (
            <LeitorFabula usuario={usuario} paciente={paciente} recurso={item} />
          )}
          {!ComponenteFerramenta && paginas.length === 0 && blocos.length > 0 && (
            <VisualizadorBlocos blocos={blocos} usuario={usuario} paciente={paciente} recurso={item} />
          )}
          {!ComponenteFerramenta && paginas.length === 0 && blocos.length === 0 && (
            <LeitorConteudo item={item} />
          )}
        </div>

        <p className="rodape-atividade">
          O que você escrever aqui fica registrado no seu prontuário e só
          a sua psicóloga tem acesso.<br />
          {link.nomeClinica || "PsiCoWorking"}
        </p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AppAtividade />);
