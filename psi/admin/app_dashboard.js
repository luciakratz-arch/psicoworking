// ═══════════════════════════════════════════════════════════════
//  app_dashboard.js — Dashboard
//
//  Portado do painel real da Dra. Lucia, mas só com os números que
//  já temos de verdade (Pacientes, Agenda). Financeiro e Terapia de
//  Casais aparecem quando esses módulos existirem — nada de número
//  inventado (CLAUDE.md REGRA 5: escopo cirúrgico).
// ═══════════════════════════════════════════════════════════════

const COLECOES_ATIVIDADE = [
  { colecao: "clinica_diario", rotulo: "Diário", icone: "📖" },
  { colecao: "clinica_humor", rotulo: "Humor", icone: "😊" },
  { colecao: "clinica_arvore_decisao", rotulo: "Árvore Decisão", icone: "🌳" },
];

function TelaDashboard({ usuario, aoAbrirPaciente }) {
  const [pacientes, setPacientes] = useState([]);
  const [carregandoPacientes, setCarregandoPacientes] = useState(true);
  const [sessoesHoje, setSessoesHoje] = useState(null); // null = não sabemos ainda
  const [atividades, setAtividades] = useState([]);
  const [carregandoAtividades, setCarregandoAtividades] = useState(true);

  useEffect(() => {
    const cancelar = db
      .collection("clinica_pacientes")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot((snapshot) => {
        setPacientes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setCarregandoPacientes(false);
      });
    return cancelar;
  }, [usuario.psiId]);

  useEffect(() => {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 1);

    chamarListarEventosAgenda({ dataInicio: inicio.toISOString(), dataFim: fim.toISOString() })
      .then((resultado) => setSessoesHoje((resultado.data.eventos || []).length))
      .catch(() => setSessoesHoje(null));
  }, [usuario.psiId]);

  useEffect(() => {
    // Busca as últimas atividades do paciente nas 3 ferramentas que já
    // existem no portal (o portal do paciente ainda não foi construído,
    // então isso aparece vazio até ter pacientes usando o app).
    Promise.all(
      COLECOES_ATIVIDADE.map((c) =>
        db
          .collection(c.colecao)
          .where("psi_id", "==", usuario.psiId)
          .get()
          .then((snap) => snap.docs.map((d) => ({ ...d.data(), _tipo: c.rotulo, _icone: c.icone })))
          .catch(() => [])
      )
    ).then((listas) => {
      const todas = listas.flat();
      todas.sort((a, b) => (b.criadoEm?.toMillis?.() || 0) - (a.criadoEm?.toMillis?.() || 0));
      setAtividades(todas.slice(0, 20));
      setCarregandoAtividades(false);
    });
  }, [usuario.psiId]);

  const ativos = pacientes.filter((p) => p.status === "ativo").length;
  const pendentes = pacientes.filter((p) => p.status === "pendente").length;

  // Agrupa atividades por paciente, contando quantas de cada tipo.
  const atividadesPorPaciente = {};
  atividades.forEach((a) => {
    const id = a.pacienteId;
    if (!id) return;
    if (!atividadesPorPaciente[id]) atividadesPorPaciente[id] = {};
    atividadesPorPaciente[id][a._tipo] = (atividadesPorPaciente[id][a._tipo] || 0) + 1;
  });

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="conteudo conteudo-larga">
      <div className="cabecalho-secao">
        <div>
          <h2>Dashboard</h2>
          <p className="subtitulo-pagina">{dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)}</p>
        </div>
      </div>

      <div className="grade-cartoes-stat">
        <CartaoStat titulo="Pacientes Ativos" valor={carregandoPacientes ? "..." : ativos} legenda={`${pacientes.length} total`} icone="users" />
        <CartaoStat
          titulo="Sessões Hoje"
          valor={sessoesHoje === null ? "—" : sessoesHoje}
          legenda={sessoesHoje === null ? "Conecte a Agenda" : "agendadas"}
          icone="calendar-days"
        />
        <CartaoStat titulo="Cadastros Pendentes" valor={carregandoPacientes ? "..." : pendentes} legenda="via autocadastro" icone="user-plus" />
      </div>

      <div className="cartao-secao">
        <div className="titulo-cartao-secao">
          <Icone nome="activity" tamanho={17} /> Atividade recente dos pacientes
        </div>
        <p className="descricao-cartao-secao">Uso das ferramentas do portal do paciente (Diário, Humor, Árvore de Decisão).</p>

        {carregandoAtividades && <p className="texto-vazio">Carregando...</p>}

        {!carregandoAtividades && Object.keys(atividadesPorPaciente).length === 0 && (
          <p className="texto-vazio">
            Nenhuma atividade ainda — vai aparecer aqui assim que os pacientes começarem a usar o portal.
          </p>
        )}

        {Object.entries(atividadesPorPaciente).map(([pacienteId, contagens]) => {
          const paciente = pacientes.find((p) => p.id === pacienteId);
          return (
            <div key={pacienteId} className="linha-atividade">
              <div className="avatar-paciente">{(paciente?.nome || "?").charAt(0).toUpperCase()}</div>
              <div className="info-atividade">
                <div className="nome-paciente">{paciente?.nome || "Paciente"}</div>
                <div className="badges-atividade">
                  {Object.entries(contagens).map(([tipo, qtd]) => (
                    <span key={tipo} className="badge-atividade">{tipo} ({qtd})</span>
                  ))}
                </div>
              </div>
              {paciente && (
                <button className="botao-secundario" onClick={() => aoAbrirPaciente(paciente)}>
                  Ver perfil
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="aviso-modulo-futuro">
        <Icone nome="info" tamanho={16} />
        Financeiro e Terapia de Casais ainda não têm dados aqui — esses módulos entram em uma próxima etapa.
      </div>
    </div>
  );
}

function CartaoStat({ titulo, valor, legenda, icone }) {
  return (
    <div className="cartao-stat">
      <div className="cabecalho-cartao-stat">
        <span className="titulo-cartao-stat">{titulo}</span>
        <div className="icone-cartao-stat"><Icone nome={icone} tamanho={16} /></div>
      </div>
      <div className="valor-cartao-stat">{valor}</div>
      <div className="legenda-cartao-stat">{legenda}</div>
    </div>
  );
}
