// ═══════════════════════════════════════════════════════════════
//  app_dashboard.js — Dashboard
//
//  Portado do painel real da Dra. Lucia, mas só com os números que
//  já temos de verdade (Pacientes, Agenda). Financeiro e Terapia de
//  Casais aparecem quando esses módulos existirem — nada de número
//  inventado (CLAUDE.md REGRA 5: escopo cirúrgico).
// ═══════════════════════════════════════════════════════════════

const COLECOES_ATIVIDADE = [
  { colecao: "clinica_diario", rotulo: "Diário", icone: "book-open" },
  { colecao: "clinica_humor", rotulo: "Humor", icone: "smile" },
  { colecao: "clinica_arvore_decisao", rotulo: "Árvore Decisão", icone: "trees" },
];

// Pedidos de privacidade feitos pelos pacientes (LGPD): exclusão de dados, etc.
// Nada é apagado automaticamente: a psicóloga decide, respeitando o prazo legal
// de guarda do prontuário (CFP 001/2009: 5 anos após o fim do atendimento).
function CartaoSolicitacoesLGPD({ usuario }) {
  const [lista, setLista] = useState([]);
  const [salvando, setSalvando] = useState(null);

  useEffect(() => {
    const cancelar = db.collection("clinica_solicitacoes_lgpd")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot(
        (snap) => setLista(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            .filter((s) => s.status === "pendente")
            .sort((a, b) => ((a.solicitadoEm && a.solicitadoEm.seconds) || 0) - ((b.solicitadoEm && b.solicitadoEm.seconds) || 0))
        ),
        () => setLista([])
      );
    return cancelar;
  }, [usuario.psiId]);

  async function resolver(s, status, pergunta) {
    if (!confirm(pergunta)) return;
    setSalvando(s.id);
    try {
      await db.collection("clinica_solicitacoes_lgpd").doc(s.id).update({
        status,
        resolvidoEm: firebase.firestore.FieldValue.serverTimestamp(),
        resolvidoPor: usuario.email,
      });
    } catch (e) {
      alert("Não foi possível registrar: " + e.message);
    } finally {
      setSalvando(null);
    }
  }

  if (lista.length === 0) return null;
  return (
    <div className="cartao-secao">
      <div className="titulo-cartao-secao"><Icone nome="shield" tamanho={17} /> Pedidos de privacidade (LGPD)</div>
      <p className="descricao-cartao-secao">
        Pacientes pediram a exclusão dos dados. O sistema não apaga nada sozinho. Dados clínicos têm prazo legal de guarda
        (5 anos após o fim do atendimento). Atenda, ou registre que serão mantidos por obrigação legal.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lista.map((s) => (
          <div key={s.id} style={{ border: "1px solid var(--borda)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{s.pacienteNome || "Paciente"}</div>
              <div style={{ fontSize: 11.5, color: "var(--texto-suave)" }}>
                {s.pacienteEmail}{s.solicitadoEm && s.solicitadoEm.seconds ? " · pedido em " + new Date(s.solicitadoEm.seconds * 1000).toLocaleDateString("pt-BR") : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="botao-secundario" disabled={salvando === s.id}
                onClick={() => resolver(s, "mantida_prazo_legal", "Registrar que os dados de " + (s.pacienteNome || "este paciente") + " serão mantidos por obrigação legal?")}>
                Manter por prazo legal
              </button>
              <button className="botao-primario" disabled={salvando === s.id}
                onClick={() => resolver(s, "atendida", "Registrar que o pedido de " + (s.pacienteNome || "este paciente") + " foi atendido? (Isso não apaga dados. Apague antes, se for o caso.)")}>
                Marcar como atendido
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TelaDashboard({ usuario, aoAbrirPaciente }) {
  const [pacientes, setPacientes] = useState([]);
  const [carregandoPacientes, setCarregandoPacientes] = useState(true);
  const [sessoesHoje, setSessoesHoje] = useState(null); // null = não sabemos ainda
  const [atividades, setAtividades] = useState([]);
  const [carregandoAtividades, setCarregandoAtividades] = useState(true);
  const [linkAnivCopiado, setLinkAnivCopiado] = useState(false);

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

  // Aniversários — campo clinica_pacientes.dataNasc ("YYYY-MM-DD"),
  // já coletado no cadastro (admin e autocadastro público), só
  // opcional. Comparação por mês/dia (não por Date completo, pra não
  // ter problema de fuso horário virando o dia errado).
  const pacientesAtivos = pacientes.filter((p) => p.status === "ativo");
  const hojeD = new Date();
  const aniversariantesHoje = pacientesAtivos.filter((p) => {
    if (!p.dataNasc) return false;
    return parseInt(p.dataNasc.slice(5, 7), 10) === hojeD.getMonth() + 1 && parseInt(p.dataNasc.slice(8, 10), 10) === hojeD.getDate();
  });
  const proximosAniv = pacientesAtivos
    .filter((p) => {
      if (!p.dataNasc || aniversariantesHoje.some((a) => a.id === p.id)) return false;
      for (let i = 1; i <= 7; i++) {
        const prox = new Date(hojeD);
        prox.setDate(hojeD.getDate() + i);
        if (parseInt(p.dataNasc.slice(5, 7), 10) === prox.getMonth() + 1 && parseInt(p.dataNasc.slice(8, 10), 10) === prox.getDate()) return true;
      }
      return false;
    })
    .sort((a, b) => {
      const proximaOcorrencia = (p) => {
        const d = new Date(hojeD.getFullYear(), parseInt(p.dataNasc.slice(5, 7), 10) - 1, parseInt(p.dataNasc.slice(8, 10), 10));
        if (d < hojeD) d.setFullYear(hojeD.getFullYear() + 1);
        return d.getTime();
      };
      return proximaOcorrencia(a) - proximaOcorrencia(b);
    });
  const semDataNasc = pacientesAtivos.filter((p) => !p.dataNasc);

  // Cartão de aniversário personalizado (estilo pelo gênero do cadastro; cor, nome e CRP da própria clínica)
  async function abrirCartao(p) {
    let cfg = {};
    try { const d = await db.collection("psi_config").doc(usuario.psiId).get(); if (d.exists) cfg = d.data(); } catch (e) {}
    const wa = whatsappDoPaciente(p);
    window.abrirCartaoAniversario && window.abrirCartaoAniversario({
      nome: p.nome,
      genero: p.genero,
      telefone: wa.numero,
      cor: cfg.corPrimaria,
      assinatura: cfg.nome || "",
      subtitulo: [cfg.crp ? "CRP " + cfg.crp : "", cfg.tituloProfissional || ""].filter(Boolean).join(" · "),
    });
  }

  function copiarLinkAniversario() {
    const url = `${window.location.origin}/psi/aniversario/?psi=${usuario.psiId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setLinkAnivCopiado(true);
        setTimeout(() => setLinkAnivCopiado(false), 2500);
      })
      .catch(() => prompt("Copie o link:", url));
  }

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

      {usuario.role === "psi" && <CartaoSolicitacoesLGPD usuario={usuario} />}

      {!carregandoPacientes && (aniversariantesHoje.length > 0 || proximosAniv.length > 0 || semDataNasc.length > 0) && (
        <div className="cartao-secao">
          <div className="titulo-cartao-secao">
            <Icone nome="cake" tamanho={17} /> Aniversários
          </div>

          {aniversariantesHoje.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div className="rotulo-mini" style={{ color: "var(--cor-marca)", fontWeight: 600 }}>Hoje</div>
              {aniversariantesHoje.map((p) => {
                const anos = p.dataNasc ? hojeD.getFullYear() - parseInt(p.dataNasc.slice(0, 4), 10) : null;
                return (
                  <div key={p.id} className="linha-atividade" style={{
                    borderLeft: "3px solid var(--cor-marca)",
                    paddingLeft: 12,
                    borderRadius: "0 8px 8px 0",
                    background: "color-mix(in srgb, var(--cor-marca) 8%, transparent)",
                  }}>
                    <div className="avatar-paciente" style={{ background: "var(--cor-marca)", color: "#fff" }}>
                      {(p.nome || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="info-atividade">
                      <div className="nome-paciente">{p.nome}</div>
                      {anos != null && (
                        <div className="badges-atividade">
                          <span className="badge-atividade" style={{ background: "var(--cor-marca)", color: "#fff" }}>{anos} anos</span>
                        </div>
                      )}
                    </div>
                    {contatoDoPaciente(p).email && (
                      <a
                        className="botao-secundario"
                        href={`mailto:${contatoDoPaciente(p).email}?subject=${encodeURIComponent(
                          contatoDoPaciente(p).ehResponsavel
                            ? "Hoje é aniversário de " + primeiroNomeDe(p.nome) + "!"
                            : "Feliz Aniversário, " + primeiroNomeDe(p.nome) + "!"
                        )}`}
                      >
                        <Icone nome="mail" tamanho={14} /> Enviar e-mail
                      </a>
                    )}
                    <button className="botao-secundario" onClick={() => abrirCartao(p)}>
                      <Icone nome="cake" tamanho={14} /> Cartão de aniversário
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {proximosAniv.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div className="rotulo-mini">Próximos 7 dias</div>
              {proximosAniv.map((p) => (
                <div key={p.id} className="linha-atividade">
                  <div className="avatar-paciente">{(p.nome || "?").charAt(0).toUpperCase()}</div>
                  <div className="info-atividade">
                    <div className="nome-paciente">{p.nome}</div>
                    <div className="badges-atividade">
                      <span className="badge-atividade">{p.dataNasc.slice(8, 10)}/{p.dataNasc.slice(5, 7)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {semDataNasc.length > 0 && (
            <div className="aviso-modulo-futuro" style={{ alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <Icone nome="alert-triangle" tamanho={16} />
              <span style={{ flex: 1 }}>{semDataNasc.length} paciente(s) sem data de nascimento cadastrada.</span>
              <button className="botao-secundario" onClick={copiarLinkAniversario}>
                <Icone nome={linkAnivCopiado ? "check" : "link"} tamanho={13} /> {linkAnivCopiado ? "Copiado!" : "Copiar link para o paciente preencher"}
              </button>
            </div>
          )}
        </div>
      )}

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
