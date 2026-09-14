// ═══════════════════════════════════════════════════════════════
//  app_financeiro.js — Financeiro da Clínica
//
//  Portado do sistema real da Dra. Lucia (mesmos campos, categorias
//  e formas de pagamento). O módulo completo tem 5 abas (Lançamentos,
//  Pacotes & Sessões, Acompanhamento Geral, Comissões, Orçamento) —
//  construindo uma de cada vez (CLAUDE.md REGRA 5). Por enquanto só
//  "Lançamentos" está funcional; as outras aparecem como "em breve".
// ═══════════════════════════════════════════════════════════════

const CATS_DESPESA_CLINICA = [
  "Aluguel", "Condomínio", "Energia / Água", "Telefone / Internet",
  "Salário Secretária", "Contador / Impostos", "Marketing", "Equipamentos",
  "Materiais", "Ferramentas de IA", "Cursos e Capacitação", "Musicoterapia",
  "Manutenção", "Outros",
];
const FORMAS_PAG_CLINICA = ["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Depósito", "Transferência", "Outro"];
const TIPOS_RECEITA = ["Consulta", "Avaliação", "Sessão Avulsa", "Outro"];
const RECORRENCIAS = ["Semanal (1x/semana)", "2x por semana", "3x por semana", "Quinzenal", "Mensal", "Sessão única"];
const DIAS_SEMANA_LABEL = { 0: "Dom", 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb" };
const TIPOS_ATENDIMENTO = [
  { valor: "particular", rotulo: "Particular", icone: "banknote" },
  { valor: "social", rotulo: "Social", icone: "leaf" },
  { valor: "parceria", rotulo: "Parceria", icone: "handshake" },
];

// Gera as datas das sessões de um pacote a partir da recorrência —
// mesma lógica do sistema original.
function gerarDatasPacote(dataInicio, recorrencia, total, diasSemana) {
  if (recorrencia === "Sessão única") return [dataInicio];
  const datas = [];
  if (["Semanal (1x/semana)", "Quinzenal", "Mensal"].includes(recorrencia)) {
    let atual = new Date(dataInicio + "T00:00:00");
    while (datas.length < total) {
      datas.push(atual.toISOString().split("T")[0]);
      if (recorrencia === "Semanal (1x/semana)") atual.setDate(atual.getDate() + 7);
      else if (recorrencia === "Quinzenal") atual.setDate(atual.getDate() + 14);
      else atual.setMonth(atual.getMonth() + 1);
    }
    return datas.slice(0, total);
  }
  // 2x ou 3x por semana — sempre inclui a data de início como 1ª sessão
  const dias = (diasSemana || []).map(Number).sort();
  if (!dias.length) return [];
  datas.push(dataInicio);
  let atual = new Date(dataInicio + "T00:00:00");
  atual.setDate(atual.getDate() + 1);
  const fim = new Date(atual);
  fim.setFullYear(fim.getFullYear() + 2);
  while (datas.length < total && atual < fim) {
    if (dias.includes(atual.getDay())) datas.push(atual.toISOString().split("T")[0]);
    atual.setDate(atual.getDate() + 1);
  }
  return datas.slice(0, total);
}
const ABAS_FINANCEIRO = [
  { id: "lancamentos", rotulo: "Lançamentos", icone: "circle-dollar-sign" },
  { id: "pacotes", rotulo: "Pacotes & Sessões", icone: "package" },
  { id: "acompanhamento", rotulo: "Acompanhamento Geral", icone: "users" },
  { id: "comissoes", rotulo: "Comissões", icone: "percent" },
  { id: "orcamento", rotulo: "Orçamento", icone: "file-text" },
];

function fmtMoeda(v) {
  return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Configuração padrão de comissões — cada clínica tem a sua, em
// clinica_config/{psi_id} (coleção protegida, nunca pública, ao
// contrário de psi_config que é lida pelo site público).
const CONFIG_COMISSAO_PADRAO = {
  nomeSecretaria: "", salarioFixo: 0, percPrimeira: 10, percRecorrente: 5,
  valorSupervisaoSocial: 40, valorEstagiariaSocial: 20,
};

// Registra a comissão da secretária sobre uma venda (pacote/sessão avulsa).
// Só gera algo se a clínica tiver secretária configurada — clínicas sem
// secretária (a maioria no início) não veem nenhuma comissão.
async function registrarComissao(usuario, config, { tipo, valor, pacienteNome, tipoVenda, pacoteId = null }) {
  if (!config?.nomeSecretaria) return;
  const perc = tipoVenda === "primeira" ? (parseFloat(config.percPrimeira) || 0) : (parseFloat(config.percRecorrente) || 0);
  if (perc <= 0) return;
  const valorComissao = parseFloat((valor * (perc / 100)).toFixed(2));
  await db.collection("clinica_comissoes").add({
    psi_id: usuario.psiId,
    tipo, tipoVenda, perc,
    valorBase: valor, valorComissao,
    pacienteNome, pacoteId,
    responsavel: config.nomeSecretaria,
    mesRef: new Date().toISOString().slice(0, 7),
    status: "pendente",
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

// Registra o repasse devido a uma parceira numa venda em parceria.
async function registrarRepasseParceria(usuario, { parceira, valorTotal, pacienteNome, pacoteId }) {
  const perc = parseFloat(parceira.percentual) || 0;
  const valorComissao = parseFloat((valorTotal * (perc / 100)).toFixed(2));
  if (valorComissao <= 0) return;
  await db.collection("clinica_comissoes").add({
    psi_id: usuario.psiId,
    tipo: "Repasse Parceria", perc,
    valorBase: valorTotal, valorComissao,
    pacienteNome, pacoteId,
    responsavel: parceira.nome,
    mesRef: new Date().toISOString().slice(0, 7),
    status: "pendente",
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

// Projeto Social: lança o valor de supervisão recebido e a comissão
// da estagiária responsável (mesmo padrão do sistema real: R$40/R$20
// por padrão, editável em Configuração de Comissões).
async function registrarComissaoSocial(usuario, config, parceiras, { pacienteNome, pacoteId, dataInicio }) {
  const vSupervisao = parseFloat(config?.valorSupervisaoSocial) || 40;
  const vEstagiaria = parseFloat(config?.valorEstagiariaSocial) || 20;
  const estagiaria = parceiras.find((p) => p.tipo === "estagiaria");
  const nomeEst = estagiaria?.nome || "Estagiária";
  const mesRef = (dataInicio || new Date().toISOString().slice(0, 10)).slice(0, 7);
  const batch = db.batch();
  batch.set(db.collection("clinica_lancamentos").doc(), {
    psi_id: usuario.psiId,
    tipo_lancamento: "social",
    tipo: `${pacienteNome || ""} — Projeto Social`,
    descricao: `${pacienteNome || ""} — Projeto Social`,
    pacienteNome: pacienteNome || "",
    valor: vSupervisao, data: dataInicio, formaPag: "PIX", status: "pendente",
    origem: "pacote-social",
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
  });
  batch.set(db.collection("clinica_comissoes").doc(), {
    psi_id: usuario.psiId,
    tipo: "Social — Estagiária",
    tipoVenda: "primeira", perc: 0,
    valorBase: vSupervisao, valorComissao: vEstagiaria,
    pacienteNome: pacienteNome || "",
    responsavel: nomeEst, pacoteId,
    mesRef, status: "pendente",
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
  });
  await batch.commit();
}

function mesesUltimos12() {
  const arr = [];
  const hoje = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    arr.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return arr;
}
function mesLabelCurto(m) {
  try { return new Date(m + "-15").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }); }
  catch (e) { return m; }
}

function TelaFinanceiro({ usuario }) {
  const [aba, setAba] = useState("lancamentos");
  const [pacientes, setPacientes] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [anoFiltro, setAnoFiltro] = useState(String(new Date().getFullYear()));
  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().slice(0, 7));
  const [filtroTipo, setFiltroTipo] = useState("tudo");
  const [mostrarNovo, setMostrarNovo] = useState(false);
  const [mostrarDespesa, setMostrarDespesa] = useState(false);
  const [lancEditando, setLancEditando] = useState(null);
  const [pacotes, setPacotes] = useState([]);
  const [sessoesPacotes, setSessoesPacotes] = useState([]);
  const [mostrarPacote, setMostrarPacote] = useState(false);
  const [pacoteEditando, setPacoteEditando] = useState(null);
  const [pacienteFoco, setPacienteFoco] = useState(null);
  const [configComissao, setConfigComissao] = useState({ ...CONFIG_COMISSAO_PADRAO });
  const [parceiras, setParceiras] = useState([]);

  useEffect(() => {
    const cancelar = db
      .collection("clinica_pacientes")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot((snap) => setPacientes(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return cancelar;
  }, [usuario.psiId]);

  useEffect(() => {
    const cancelar = db
      .collection("clinica_lancamentos")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot(
        (snap) => {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          docs.sort((a, b) => (b.data || "").localeCompare(a.data || ""));
          setLancamentos(docs);
          setCarregando(false);
        },
        () => setCarregando(false)
      );
    return cancelar;
  }, [usuario.psiId]);

  useEffect(() => {
    const cancelar = db
      .collection("clinica_pacotes")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.criadoEm?.toMillis?.() || 0) - (a.criadoEm?.toMillis?.() || 0));
        setPacotes(docs);
      });
    return cancelar;
  }, [usuario.psiId]);

  useEffect(() => {
    const cancelar = db
      .collection("clinica_sessoes")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot((snap) => setSessoesPacotes(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return cancelar;
  }, [usuario.psiId]);

  useEffect(() => {
    const cancelar = db
      .collection("clinica_config")
      .doc(usuario.psiId)
      .onSnapshot((doc) => {
        const dados = doc.exists ? doc.data().comissoes || {} : {};
        setConfigComissao({ ...CONFIG_COMISSAO_PADRAO, ...dados });
      });
    return cancelar;
  }, [usuario.psiId]);

  useEffect(() => {
    const cancelar = db
      .collection("clinica_parceiras")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
        setParceiras(docs);
      });
    return cancelar;
  }, [usuario.psiId]);

  function nomePaciente(id) {
    return pacientes.find((p) => p.id === id)?.nome || "—";
  }

  // Anos disponíveis (a partir dos lançamentos existentes + o atual)
  const anosDisp = [...new Set(lancamentos.map((l) => l.data?.slice(0, 4)).filter(Boolean))];
  if (!anosDisp.includes(anoFiltro)) anosDisp.push(anoFiltro);
  anosDisp.sort();

  const mesesDoAno = Array.from({ length: 12 }, (_, i) => `${anoFiltro}-${String(i + 1).padStart(2, "0")}`);
  const mesFiltroEfetivo = mesFiltro.startsWith(anoFiltro) ? mesFiltro : anoFiltro + "-01";

  const mesAtualStr = new Date().toISOString().slice(0, 7);
  const lancMesAtual = lancamentos.filter((l) => l.data?.startsWith(mesAtualStr));
  const lancDoAno = lancamentos.filter((l) => l.data?.startsWith(anoFiltro));
  const lancDoMesFiltrado = lancamentos.filter((l) => l.data?.startsWith(mesFiltroEfetivo));

  function calcReceitas(lista) { return lista.filter((l) => l.tipo_lancamento !== "despesa").reduce((a, l) => a + (parseFloat(l.valor) || 0), 0); }
  function calcDespesas(lista) { return lista.filter((l) => l.tipo_lancamento === "despesa").reduce((a, l) => a + (parseFloat(l.valor) || 0), 0); }

  const saldoMesAtual = calcReceitas(lancMesAtual) - calcDespesas(lancMesAtual);
  const pendenteDoAno = calcReceitas(lancDoAno.filter((l) => l.status === "pendente"));
  const receitasMesFiltro = calcReceitas(lancDoMesFiltrado);
  const despesasMesFiltro = calcDespesas(lancDoMesFiltrado);
  const saldoMesFiltro = receitasMesFiltro - despesasMesFiltro;

  const mesLabel = (m) => {
    try { return new Date(m + "-15").toLocaleDateString("pt-BR", { month: "long" }); }
    catch (e) { return m; }
  };

  const listaFiltrada = lancDoMesFiltrado.filter((l) => {
    if (filtroTipo === "receitas") return l.tipo_lancamento !== "despesa";
    if (filtroTipo === "despesas") return l.tipo_lancamento === "despesa";
    return true;
  });
  const receitasLista = listaFiltrada.filter((l) => l.tipo_lancamento !== "despesa");
  const despesasLista = listaFiltrada.filter((l) => l.tipo_lancamento === "despesa");

  function abrirEditar(l) {
    setLancEditando(l);
    if (l.tipo_lancamento === "despesa") setMostrarDespesa(true);
    else setMostrarNovo(true);
  }

  async function excluirLancamento(id) {
    if (!confirm("Excluir este lançamento?")) return;
    await db.collection("clinica_lancamentos").doc(id).delete();
  }

  if (aba === "acompanhamento" && pacienteFoco) {
    const pac = pacientes.find((p) => p.id === pacienteFoco);
    const pacotesPac = pacotes.filter((p) => p.pacienteId === pacienteFoco);
    const idsPacotesPac = pacotesPac.map((p) => p.id);
    const sessPac = sessoesPacotes.filter((s) => s.pacienteId === pacienteFoco || idsPacotesPac.includes(s.pacoteId));
    return (
      <div className="conteudo conteudo-larga">
        <ControleSessoes paciente={pac} sessoes={sessPac} onVoltar={() => setPacienteFoco(null)} />
      </div>
    );
  }

  return (
    <div className="conteudo conteudo-larga">
      <div className="cabecalho-secao">
        <div>
          <h2>Financeiro da Clínica</h2>
          <p className="subtitulo-pagina">Lançamentos, pacotes e controle de sessões</p>
        </div>
        <div className="acoes-cabecalho">
          {aba === "pacotes" && (
            <button className="botao-primario" onClick={() => { setPacoteEditando(null); setMostrarPacote(true); }}>
              <Icone nome="plus" tamanho={16} /> Novo Pacote
            </button>
          )}
          {aba === "lancamentos" && (
            <>
              <button className="botao-perigo" onClick={() => { setLancEditando(null); setMostrarDespesa(true); }}>
                <Icone nome="minus-circle" tamanho={16} /> Nova Despesa
              </button>
              <button className="botao-primario" onClick={() => { setLancEditando(null); setMostrarNovo(true); }}>
                <Icone nome="plus" tamanho={16} /> Novo Lançamento
              </button>
            </>
          )}
        </div>
      </div>

      <div className="seletor-ano">
        {anosDisp.map((a) => (
          <button key={a} className={"botao-ano" + (a === anoFiltro ? " botao-ano-ativo" : "")} onClick={() => setAnoFiltro(a)}>
            {a}
          </button>
        ))}
      </div>

      <div className="grade-cartoes-stat">
        <CartaoStat titulo={`Saldo (${mesLabel(mesAtualStr)})`} valor={fmtMoeda(saldoMesAtual)} legenda="mês atual" icone="wallet" />
        <CartaoStat titulo={`Pendente (${anoFiltro})`} valor={fmtMoeda(pendenteDoAno)} legenda="a receber" icone="clock" />
        <CartaoStat titulo="Pacotes ativos" valor={pacotes.filter((p) => p.status === "ativo").length} legenda="em andamento" icone="package" />
        <CartaoStat titulo={`Lançamentos (${mesLabel(mesFiltroEfetivo)})`} valor={lancDoMesFiltrado.length} legenda="neste mês" icone="list" />
      </div>

      <div className="abas-financeiro">
        {ABAS_FINANCEIRO.map((a) => (
          <button
            key={a.id}
            className={"aba-financeiro" + (aba === a.id ? " aba-financeiro-ativa" : "")}
            onClick={() => setAba(a.id)}
          >
            <Icone nome={a.icone} tamanho={15} /> {a.rotulo}
          </button>
        ))}
      </div>

      {aba !== "lancamentos" && aba !== "pacotes" && aba !== "acompanhamento" && aba !== "comissoes" && (
        <div className="cartao-secao">
          <p className="texto-vazio">
            Essa aba ({ABAS_FINANCEIRO.find((a) => a.id === aba)?.rotulo}) ainda não foi construída — é a próxima etapa combinada.
          </p>
        </div>
      )}

      {aba === "pacotes" && (
        <ListaPacotes
          pacotes={pacotes}
          sessoes={sessoesPacotes}
          pacientes={pacientes}
          aoEditar={(p) => { setPacoteEditando(p); setMostrarPacote(true); }}
        />
      )}

      {aba === "acompanhamento" && (
        <AcompanhamentoGeral
          pacientes={pacientes}
          pacotes={pacotes}
          sessoes={sessoesPacotes}
          aoAbrirPaciente={setPacienteFoco}
        />
      )}

      {aba === "comissoes" && (
        <ComissoesTab usuario={usuario} config={configComissao} parceiras={parceiras} />
      )}

      {aba === "lancamentos" && (
        <>
          <div className="faixa-meses">
            {mesesDoAno.map((m) => (
              <button
                key={m}
                className={"botao-mes" + (m === mesFiltroEfetivo ? " botao-mes-ativo" : "")}
                onClick={() => setMesFiltro(m)}
              >
                {mesLabel(m)}
              </button>
            ))}
          </div>

          <div className="filtro-tipo-lanc">
            {[["tudo", "Tudo"], ["receitas", "Receitas"], ["despesas", "Despesas"]].map(([v, l]) => (
              <button key={v} className={"botao-filtro" + (filtroTipo === v ? " botao-filtro-ativo" : "")} onClick={() => setFiltroTipo(v)}>
                {l}
              </button>
            ))}
          </div>

          <div className="grade-resumo-mes">
            <div className="cartao-resumo receita">
              <span className="rotulo-resumo">Total Receitas</span>
              <span className="valor-resumo">{fmtMoeda(receitasMesFiltro)}</span>
            </div>
            <div className="cartao-resumo despesa">
              <span className="rotulo-resumo">Total Despesas</span>
              <span className="valor-resumo">{fmtMoeda(despesasMesFiltro)}</span>
            </div>
            <div className="cartao-resumo saldo">
              <span className="rotulo-resumo">Saldo Líquido</span>
              <span className="valor-resumo">{fmtMoeda(saldoMesFiltro)}</span>
            </div>
          </div>

          {carregando && <p>Carregando...</p>}

          {!carregando && receitasLista.length > 0 && (
            <SecaoLancamentos titulo="Receitas" cor="receita" itens={receitasLista} nomePaciente={nomePaciente} aoEditar={abrirEditar} aoExcluir={excluirLancamento} />
          )}
          {!carregando && despesasLista.length > 0 && (
            <SecaoLancamentos titulo="Despesas" cor="despesa" itens={despesasLista} nomePaciente={nomePaciente} aoEditar={abrirEditar} aoExcluir={excluirLancamento} />
          )}
          {!carregando && listaFiltrada.length === 0 && (
            <p className="texto-vazio">Nenhum lançamento em {mesLabel(mesFiltroEfetivo)}.</p>
          )}
        </>
      )}

      {mostrarNovo && (
        <FormLancamento
          usuario={usuario}
          pacientes={pacientes}
          lancamento={lancEditando}
          aoFechar={() => { setMostrarNovo(false); setLancEditando(null); }}
        />
      )}
      {mostrarDespesa && (
        <FormDespesa
          usuario={usuario}
          lancamento={lancEditando}
          aoFechar={() => { setMostrarDespesa(false); setLancEditando(null); }}
        />
      )}
      {mostrarPacote && (
        <PacoteForm
          usuario={usuario}
          pacientes={pacientes}
          pacote={pacoteEditando}
          config={configComissao}
          parceiras={parceiras}
          aoFechar={() => { setMostrarPacote(false); setPacoteEditando(null); }}
        />
      )}
    </div>
  );
}

function SecaoLancamentos({ titulo, cor, itens, nomePaciente, aoEditar, aoExcluir }) {
  const total = itens.reduce((a, l) => a + (parseFloat(l.valor) || 0), 0);
  return (
    <div className="grupo-status">
      <div className="cabecalho-secao-lanc">
        <span className={"titulo-secao-lanc titulo-secao-" + cor}>{titulo}</span>
        <span className={"total-secao-lanc total-secao-" + cor}>{fmtMoeda(total)}</span>
      </div>
      <div className="cartao-lista-pacientes">
        {itens.map((l) => (
          <div key={l.id} className="linha-lancamento">
            <div className="info-lancamento">
              <div className="descricao-lancamento">
                {l.pacienteId ? nomePaciente(l.pacienteId) + " — " : ""}{l.descricao || l.tipo || l.categoria || "Lançamento"}
              </div>
              <div className="detalhe-lancamento">
                {l.data?.split("-").reverse().join("/")} · {l.formaPag || "—"}
              </div>
            </div>
            <span className={"etiqueta-status-lanc etiqueta-" + (l.status || "pendente")}>
              {l.status === "recebido" || l.status === "pago" ? "✓ " + (cor === "despesa" ? "Pago" : "Recebido") : "Pendente"}
            </span>
            <span className={"valor-lancamento valor-" + cor}>{fmtMoeda(l.valor)}</span>
            <button className="botao-icone" onClick={() => aoEditar(l)} title="Editar"><Icone nome="pencil" tamanho={15} /></button>
            <button className="botao-icone botao-icone-perigo" onClick={() => aoExcluir(l.id)} title="Excluir"><Icone nome="trash-2" tamanho={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormLancamento({ usuario, pacientes, lancamento, aoFechar }) {
  const [form, setForm] = useState(
    lancamento
      ? { ...lancamento, valor: String(lancamento.valor || "") }
      : { pacienteId: "", tipo: "Consulta", valor: "", data: new Date().toISOString().slice(0, 10), formaPag: "PIX", status: "pendente", obs: "" }
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(evento) {
    evento.preventDefault();
    if (!form.valor || !form.data) { setErro("Valor e data são obrigatórios."); return; }
    setErro("");
    setSalvando(true);
    try {
      const pac = pacientes.find((p) => p.id === form.pacienteId);
      const dados = { ...form, valor: parseFloat(form.valor), pacienteNome: pac?.nome || "" };
      if (lancamento) {
        await db.collection("clinica_lancamentos").doc(lancamento.id).update(dados);
      } else {
        await db.collection("clinica_lancamentos").add({
          ...dados,
          psi_id: usuario.psiId,
          tipo_lancamento: "avulso",
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
      aoFechar();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{lancamento ? "Editar Lançamento" : "Novo Lançamento"}</h3>
        <form onSubmit={salvar}>
          <label>Paciente <span className="opcional">(opcional)</span></label>
          <select value={form.pacienteId || ""} onChange={(e) => setForm({ ...form, pacienteId: e.target.value })}>
            <option value="">— Nenhum —</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>

          <label>Tipo</label>
          <select value={form.tipo || "Consulta"} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            {TIPOS_RECEITA.map((t) => <option key={t}>{t}</option>)}
          </select>

          <label>Valor (R$)</label>
          <input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />

          <label>Data</label>
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />

          <label>Forma de Pagamento</label>
          <select value={form.formaPag || "PIX"} onChange={(e) => setForm({ ...form, formaPag: e.target.value })}>
            {FORMAS_PAG_CLINICA.map((f) => <option key={f}>{f}</option>)}
          </select>

          <label>Status</label>
          <div className="pills-status">
            {[["pendente", "Pendente", "#F59E0B"], ["recebido", "Recebido", "var(--sucesso)"]].map(([v, l, c]) => (
              <button key={v} type="button" className={"pill-status" + (form.status === v ? " pill-status-ativa" : "")} style={{ "--cor-pill": c }} onClick={() => setForm({ ...form, status: v })}>
                {l}
              </button>
            ))}
          </div>

          <label>Observação <span className="opcional">(opcional)</span></label>
          <textarea className="campo-descricao" rows={2} value={form.obs || ""} onChange={(e) => setForm({ ...form, obs: e.target.value })} />

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="acoes-modal">
            <button type="button" className="botao-secundario" onClick={aoFechar}>Cancelar</button>
            <button type="submit" className="botao-primario" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormDespesa({ usuario, lancamento, aoFechar }) {
  const [form, setForm] = useState(
    lancamento
      ? { ...lancamento, valor: String(lancamento.valor || ""), parcelas: "1" }
      : { descricao: "", categoria: "", valor: "", data: new Date().toISOString().slice(0, 10), formaPag: "PIX", status: "pago", obs: "", parcelas: "1" }
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(evento) {
    evento.preventDefault();
    if (!form.valor || !form.data) { setErro("Valor e data são obrigatórios."); return; }
    setErro("");
    setSalvando(true);
    try {
      const valor = parseFloat(form.valor);
      const nParcelas = parseInt(form.parcelas) || 1;
      const base = {
        psi_id: usuario.psiId,
        tipo_lancamento: "despesa",
        categoria: form.categoria || "Outros",
        descricao: form.descricao || form.categoria || "Despesa",
        formaPag: form.formaPag,
        status: form.status,
        obs: form.obs || "",
      };

      if (lancamento) {
        await db.collection("clinica_lancamentos").doc(lancamento.id).update({ ...base, valor, data: form.data });
      } else if (nParcelas > 1) {
        const batch = db.batch();
        const [ano, mes, dia] = form.data.split("-").map(Number);
        for (let i = 0; i < nParcelas; i++) {
          let m = mes + i, a = ano;
          while (m > 12) { m -= 12; a++; }
          const dataParcela = `${a}-${String(m).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          batch.set(db.collection("clinica_lancamentos").doc(), {
            ...base,
            valor,
            data: dataParcela,
            parcela: `${i + 1}/${nParcelas}`,
            descricao: `${base.descricao} (${i + 1}/${nParcelas})`,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
        await batch.commit();
      } else {
        await db.collection("clinica_lancamentos").add({
          ...base,
          valor,
          data: form.data,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
      aoFechar();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{lancamento ? "Editar Despesa" : "Nova Despesa"}</h3>
        <form onSubmit={salvar}>
          <label>Descrição <span className="opcional">(opcional)</span></label>
          <input value={form.descricao || ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex.: Aluguel de setembro" />

          <label>Categoria</label>
          <select value={form.categoria || ""} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
            <option value="">Selecione</option>
            {CATS_DESPESA_CLINICA.map((c) => <option key={c}>{c}</option>)}
          </select>

          <label>Valor (R$)</label>
          <input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />

          <label>Data</label>
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />

          <label>Forma de Pagamento</label>
          <select value={form.formaPag || "PIX"} onChange={(e) => setForm({ ...form, formaPag: e.target.value })}>
            {FORMAS_PAG_CLINICA.map((f) => <option key={f}>{f}</option>)}
          </select>

          {!lancamento && (
            <>
              <label>Parcelas</label>
              <input type="number" min="1" value={form.parcelas} onChange={(e) => setForm({ ...form, parcelas: e.target.value })} />
            </>
          )}

          <label>Status</label>
          <div className="pills-status">
            {[["pendente", "Pendente", "#F59E0B"], ["pago", "Pago", "var(--sucesso)"]].map(([v, l, c]) => (
              <button key={v} type="button" className={"pill-status" + (form.status === v ? " pill-status-ativa" : "")} style={{ "--cor-pill": c }} onClick={() => setForm({ ...form, status: v })}>
                {l}
              </button>
            ))}
          </div>

          <label>Observação <span className="opcional">(opcional)</span></label>
          <textarea className="campo-descricao" rows={2} value={form.obs || ""} onChange={(e) => setForm({ ...form, obs: e.target.value })} />

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="acoes-modal">
            <button type="button" className="botao-secundario" onClick={aoFechar}>Cancelar</button>
            <button type="submit" className="botao-primario" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Pacotes & Sessões ──────────────────────────────────────────
// Portado do salvarPacote() do sistema real — sem comissão, repasse
// de parceria ou e-mail automático (fora do escopo por enquanto).

const MODALIDADES_PACOTE = ["Online", "Presencial"];

function ListaPacotes({ pacotes, sessoes, pacientes, aoEditar }) {
  async function excluirPacote(pacote) {
    if (!confirm("Excluir este pacote e todas as sessões vinculadas a ele?")) return;
    const batch = db.batch();
    batch.delete(db.collection("clinica_pacotes").doc(pacote.id));
    sessoes.filter((s) => s.pacoteId === pacote.id).forEach((s) => batch.delete(db.collection("clinica_sessoes").doc(s.id)));
    const lancSnap = await db.collection("clinica_lancamentos").where("pacoteId", "==", pacote.id).get();
    lancSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  if (pacotes.length === 0) {
    return <p className="texto-vazio">Nenhum pacote cadastrado ainda.</p>;
  }

  const porPaciente = {};
  pacotes.forEach((p) => {
    const chave = p.pacienteId || "sem-paciente";
    if (!porPaciente[chave]) porPaciente[chave] = [];
    porPaciente[chave].push(p);
  });

  return (
    <div>
      {Object.entries(porPaciente).map(([pacienteId, lista]) => {
        const nome = pacientes.find((p) => p.id === pacienteId)?.nome || lista[0].pacienteNome || "Paciente";
        return (
          <div key={pacienteId} className="grupo-status">
            <div className="cabecalho-secao-lanc">
              <span className="titulo-secao-lanc">{nome}</span>
            </div>
            <div className="cartao-lista-pacientes">
              {lista.map((pac) => {
                const sessoesPac = sessoes.filter((s) => s.pacoteId === pac.id);
                const realizadas = sessoesPac.filter((s) => s.status === "realizada" || s.pagamento === "pago").length;
                const total = pac.totalSessoes || sessoesPac.length || 1;
                const pct = Math.min(100, Math.round((realizadas / total) * 100));
                return (
                  <div key={pac.id} className="cartao-pacote">
                    <div className="info-pacote">
                      <div className="descricao-lancamento">
                        Pacote de {pac.totalSessoes} sessões — {pac.recorrencia}
                      </div>
                      <div className="detalhe-lancamento">
                        Início {pac.dataInicio?.split("-").reverse().join("/")}
                        {" · "}{TIPOS_ATENDIMENTO.find((t) => t.valor === pac.tipoAtendimento)?.rotulo || "Particular"}
                        {pac.horario ? " · " + pac.horario : ""}
                      </div>
                      <div className="barra-progresso">
                        <div className="barra-progresso-preenchimento" style={{ width: pct + "%" }} />
                      </div>
                      <div className="detalhe-lancamento">{realizadas} de {total} sessões realizadas</div>
                    </div>
                    <span className={"etiqueta-status-lanc etiqueta-" + (pac.statusPag || "pendente")}>
                      {pac.statusPag === "recebido" ? "✓ Recebido" : "Pendente"}
                    </span>
                    <span className="valor-lancamento valor-receita">{fmtMoeda(pac.valorTotal)}</span>
                    <button className="botao-icone" onClick={() => aoEditar(pac)} title="Editar"><Icone nome="pencil" tamanho={15} /></button>
                    <button className="botao-icone botao-icone-perigo" onClick={() => excluirPacote(pac)} title="Excluir"><Icone nome="trash-2" tamanho={15} /></button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PacoteForm({ usuario, pacientes, pacote, config, parceiras, aoFechar }) {
  const [form, setForm] = useState(
    pacote
      ? { ...pacote, totalSessoes: String(pacote.totalSessoes || ""), valorSessao: String(pacote.valorSessao || "") }
      : {
          pacienteId: "", totalSessoes: "", valorSessao: "", recorrencia: RECORRENCIAS[0],
          dataInicio: new Date().toISOString().slice(0, 10), horario: "", diasSemana: [],
          modalidade: "Online", tipoAtendimento: "particular",
          statusPag: "pendente", formaPag: "PIX", dataPagamento: "", obs: "",
          parceiraId: "", percParceiro: "",
        }
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const precisaDias = ["2x por semana", "3x por semana"].includes(form.recorrencia);
  const total = parseInt(form.totalSessoes) || 0;
  const valorSessao = parseFloat(form.valorSessao) || 0;
  const valorTotal = total * valorSessao;
  const temSecretaria = !!(config?.nomeSecretaria);
  const parceirasDisponiveis = parceiras.filter((p) => p.tipo !== "estagiaria");

  function alternarDia(dia) {
    const atual = form.diasSemana || [];
    setForm({ ...form, diasSemana: atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia] });
  }

  function salvar(evento) {
    evento.preventDefault();
    executarSalvar(null);
  }

  async function executarSalvar(tipoVenda) {
    if (!form.pacienteId || !form.totalSessoes || !form.dataInicio) {
      setErro("Paciente, nº de sessões e data de início são obrigatórios.");
      return;
    }
    if (precisaDias && (!form.diasSemana || form.diasSemana.length === 0)) {
      setErro("Selecione os dias da semana.");
      return;
    }
    if (form.tipoAtendimento === "parceria" && !form.parceiraId) {
      setErro("Selecione a parceira para a venda em parceria.");
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      const pac = pacientes.find((p) => p.id === form.pacienteId);

      if (pacote) {
        // Edição: atualiza os dados do pacote (não regera as sessões já criadas)
        await db.collection("clinica_pacotes").doc(pacote.id).update({
          pacienteId: form.pacienteId, pacienteNome: pac?.nome || "",
          totalSessoes: total, valorSessao, valorTotal,
          recorrencia: form.recorrencia, dataInicio: form.dataInicio, horario: form.horario,
          modalidade: form.modalidade, tipoAtendimento: form.tipoAtendimento,
          statusPag: form.statusPag, formaPag: form.formaPag, dataPagamento: form.dataPagamento,
          obs: form.obs,
        });
        aoFechar();
        return;
      }

      const datas = gerarDatasPacote(form.dataInicio, form.recorrencia, total, form.diasSemana);

      const pacRef = await db.collection("clinica_pacotes").add({
        psi_id: usuario.psiId,
        pacienteId: form.pacienteId, pacienteNome: pac?.nome || "",
        totalSessoes: total, valorSessao, valorTotal,
        recorrencia: form.recorrencia, dataInicio: form.dataInicio, horario: form.horario,
        diasSemana: form.diasSemana || [], modalidade: form.modalidade,
        tipoAtendimento: form.tipoAtendimento,
        statusPag: form.statusPag, formaPag: form.formaPag, dataPagamento: form.dataPagamento,
        obs: form.obs,
        status: "ativo",
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });

      const mesInicio = new Date(form.dataInicio + "T00:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      const descricaoLanc = `${pac?.nome || "Paciente"} — Pacote ${total} Sessões — ${mesInicio.charAt(0).toUpperCase() + mesInicio.slice(1)}`;
      await db.collection("clinica_lancamentos").add({
        psi_id: usuario.psiId,
        tipo_lancamento: "pacote", pacoteId: pacRef.id,
        pacienteId: form.pacienteId, pacienteNome: pac?.nome || "",
        tipo: descricaoLanc, descricao: descricaoLanc,
        valor: valorTotal, data: form.dataInicio,
        formaPag: form.formaPag, status: form.statusPag, dataPagamento: form.dataPagamento,
        obs: form.obs, totalSessoes: total, valorSessao,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });

      const jaPago = form.statusPag === "recebido";
      const batch = db.batch();
      datas.forEach((data, i) => {
        const ref = db.collection("clinica_sessoes").doc();
        batch.set(ref, {
          psi_id: usuario.psiId,
          pacienteId: form.pacienteId, pacienteNome: pac?.nome || "",
          data, hora: form.horario, duracao: "50", tipo: "Psicoterapia",
          status: "agendado", numSessao: i + 1, pacoteId: pacRef.id,
          valorSessao, pagamento: jaPago ? "pago" : "pendente",
          valorPago: jaPago ? valorSessao : 0,
          formaPagamento: form.formaPag,
          dataPagamento: jaPago ? (form.dataPagamento || new Date().toISOString().slice(0, 10)) : "",
          obs: "",
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();

      // ── Comissão da secretária (só se houver secretária configurada) ──
      if (form.tipoAtendimento === "particular" && tipoVenda && jaPago) {
        await registrarComissao(usuario, config, {
          tipo: "Pacote", valor: valorTotal, pacienteNome: pac?.nome || "", tipoVenda, pacoteId: pacRef.id,
        });
      }

      // ── Repasse de parceria ──
      if (form.tipoAtendimento === "parceria") {
        const parceiraEsc = parceiras.find((p) => p.id === form.parceiraId);
        if (parceiraEsc) {
          await registrarRepasseParceria(usuario, {
            parceira: { ...parceiraEsc, percentual: form.percParceiro || parceiraEsc.percentual },
            valorTotal, pacienteNome: pac?.nome || "", pacoteId: pacRef.id,
          });
        }
      }

      // ── Projeto Social: lança supervisão + comissão da estagiária ──
      if (form.tipoAtendimento === "social") {
        await registrarComissaoSocial(usuario, config, parceiras, {
          pacienteNome: pac?.nome || "", pacoteId: pacRef.id, dataInicio: form.dataInicio,
        });
      }

      aoFechar();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar o pacote.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{pacote ? "Editar Pacote" : "Novo Pacote de Sessões"}</h3>
        <form onSubmit={salvar}>
          <label>Paciente *</label>
          <select value={form.pacienteId} onChange={(e) => setForm({ ...form, pacienteId: e.target.value })} required>
            <option value="">Selecione</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>

          <label>Tipo de Atendimento</label>
          <div className="pills-status">
            {TIPOS_ATENDIMENTO.map((t) => (
              <button key={t.valor} type="button" className={"pill-status" + (form.tipoAtendimento === t.valor ? " pill-status-ativa" : "")} onClick={() => setForm({ ...form, tipoAtendimento: t.valor })}>
                <Icone nome={t.icone} tamanho={14} /> {t.rotulo}
              </button>
            ))}
          </div>

          {form.tipoAtendimento === "parceria" && (
            <div className="grade-2col">
              <div>
                <label>Parceira *</label>
                <select value={form.parceiraId || ""} onChange={(e) => { const p = parceirasDisponiveis.find((x) => x.id === e.target.value); setForm({ ...form, parceiraId: e.target.value, percParceiro: p?.percentual || "" }); }} required>
                  <option value="">Selecione</option>
                  {parceirasDisponiveis.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div>
                <label>Repasse (%)</label>
                <input type="number" step="0.1" value={form.percParceiro || ""} onChange={(e) => setForm({ ...form, percParceiro: e.target.value })} />
              </div>
            </div>
          )}

          <div className="grade-2col">
            <div>
              <label>Nº de Sessões *</label>
              <input type="number" min="1" value={form.totalSessoes} onChange={(e) => setForm({ ...form, totalSessoes: e.target.value })} required />
            </div>
            <div>
              <label>Recorrência *</label>
              <select value={form.recorrencia} onChange={(e) => setForm({ ...form, recorrencia: e.target.value })}>
                {RECORRENCIAS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {precisaDias && (
            <>
              <label>Dias da Semana</label>
              <div className="pills-status">
                {Object.entries(DIAS_SEMANA_LABEL).map(([n, l]) => (
                  <button key={n} type="button" className={"pill-status" + ((form.diasSemana || []).includes(Number(n)) ? " pill-status-ativa" : "")} onClick={() => alternarDia(Number(n))}>
                    {l}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="grade-2col">
            <div>
              <label>Data de Início *</label>
              <input type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} required />
            </div>
            <div>
              <label>Horário</label>
              <input type="time" value={form.horario || ""} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
            </div>
          </div>

          <label>Modalidade</label>
          <select value={form.modalidade} onChange={(e) => setForm({ ...form, modalidade: e.target.value })}>
            {MODALIDADES_PACOTE.map((m) => <option key={m}>{m}</option>)}
          </select>

          <div className="grade-2col">
            <div>
              <label>Valor por Sessão (R$)</label>
              <input type="number" step="0.01" value={form.valorSessao} onChange={(e) => setForm({ ...form, valorSessao: e.target.value })} />
            </div>
            <div>
              <label>Valor Total (automático)</label>
              <input type="text" value={fmtMoeda(valorTotal)} disabled />
            </div>
          </div>

          <label>Status do Pagamento</label>
          <div className="pills-status">
            {[["pendente", "Pendente", "#F59E0B"], ["recebido", "Recebido", "var(--sucesso)"]].map(([v, l, c]) => (
              <button key={v} type="button" className={"pill-status" + (form.statusPag === v ? " pill-status-ativa" : "")} style={{ "--cor-pill": c }} onClick={() => setForm({ ...form, statusPag: v })}>
                {l}
              </button>
            ))}
          </div>

          <div className="grade-2col">
            <div>
              <label>Forma de Pagamento</label>
              <select value={form.formaPag} onChange={(e) => setForm({ ...form, formaPag: e.target.value })}>
                {FORMAS_PAG_CLINICA.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label>Data do Pagamento</label>
              <input type="date" value={form.dataPagamento || ""} onChange={(e) => setForm({ ...form, dataPagamento: e.target.value })} />
            </div>
          </div>

          <label>Observações <span className="opcional">(opcional)</span></label>
          <TextAreaVoz className="campo-descricao" rows={2} value={form.obs || ""} onChange={(e) => setForm({ ...form, obs: e.target.value })} />

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="acoes-modal">
            <button type="button" className="botao-secundario" onClick={aoFechar}>Cancelar</button>
            {!pacote && form.tipoAtendimento === "particular" && temSecretaria ? (
              <>
                <button type="button" className="botao-secundario" disabled={salvando} onClick={() => executarSalvar(null)} title="Sem comissão — para lançamentos passados">
                  📋 Sem Comissão
                </button>
                <button type="button" className="botao-primario" disabled={salvando} onClick={() => executarSalvar("primeira")} title={`${config.percPrimeira}% de comissão`}>
                  🌟 Primeira Venda
                </button>
                <button type="button" className="botao-primario" disabled={salvando} onClick={() => executarSalvar("recorrente")} title={`${config.percRecorrente}% de comissão`}>
                  🔁 Recorrente
                </button>
              </>
            ) : (
              <button type="submit" className="botao-primario" disabled={salvando}>{salvando ? "Salvando..." : pacote ? "Salvar Alterações" : "Criar Pacote"}</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Acompanhamento Geral ───────────────────────────────────────
// Lista de pacientes ativos com pacote, e o Controle de Sessões e
// Frequência de cada um (portado do RelatorioFrequencia do sistema
// real — sem a remarcação de data e sem a exclusão em lote, que
// ficam para uma próxima etapa).

function AcompanhamentoGeral({ pacientes, pacotes, sessoes, aoAbrirPaciente }) {
  const ativos = pacientes
    .filter((p) => p.status === "ativo")
    .filter((p) => pacotes.some((pac) => pac.pacienteId === p.id))
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

  if (ativos.length === 0) {
    return <p className="texto-vazio">Nenhum paciente ativo com pacote cadastrado ainda.</p>;
  }

  return (
    <div className="cartao-lista-pacientes">
      {ativos.map((pac) => {
        const sessPac = sessoes.filter((s) => s.pacienteId === pac.id);
        const pacotesPac = pacotes.filter((p) => p.pacienteId === pac.id);
        const total = sessPac.length;
        const realizadas = sessPac.filter((s) => s.status === "realizado" || s.status === "falta").length;
        const recebido = sessPac.filter((s) => s.pagamento === "pago").reduce((a, s) => a + (parseFloat(s.valorPago) || parseFloat(s.valorSessao) || 0), 0);
        const aReceber = sessPac.filter((s) => s.pagamento !== "pago").reduce((a, s) => a + (parseFloat(s.valorSessao) || 0), 0);
        const pendentes = sessPac.filter((s) => s.pagamento !== "pago").length;
        return (
          <div key={pac.id} className="linha-acompanhamento" onClick={() => aoAbrirPaciente(pac.id)}>
            <div className="avatar-paciente">{(pac.nome || "?")[0].toUpperCase()}</div>
            <div className="info-lancamento">
              <div className="descricao-lancamento">{pac.nome}</div>
              <div className="detalhe-lancamento">{pacotesPac[0]?.recorrencia || "—"} · {pacotesPac[0]?.horario || "—"}</div>
            </div>
            <div className="metricas-acompanhamento">
              <div className="metrica">
                <span className="metrica-valor">{realizadas}/{total}</span>
                <span className="metrica-rotulo">Sessões</span>
              </div>
              <div className="metrica">
                <span className="metrica-valor metrica-receita">{fmtMoeda(recebido)}</span>
                <span className="metrica-rotulo">Recebido</span>
              </div>
              {aReceber > 0 && (
                <div className="metrica">
                  <span className="metrica-valor metrica-pendente">{fmtMoeda(aReceber)}</span>
                  <span className="metrica-rotulo">A Receber</span>
                </div>
              )}
            </div>
            <span className={"etiqueta-status-lanc " + (pendentes > 0 ? "etiqueta-pendente" : "etiqueta-recebido")}>
              {pendentes > 0 ? pendentes + " pendente(s)" : "✓ Em dia"}
            </span>
            <Icone nome="chevron-right" tamanho={16} />
          </div>
        );
      })}
    </div>
  );
}

const STATUS_SESSAO = {
  agendado: { rotulo: "Agendado", cor: "var(--cor-marca)" },
  confirmado: { rotulo: "Confirmado", cor: "var(--sucesso)" },
  realizado: { rotulo: "✓ Realizado", cor: "var(--sucesso)" },
  falta: { rotulo: "Falta", cor: "#d97706" },
  cancelado: { rotulo: "Cancelado", cor: "var(--erro)" },
};

function ControleSessoes({ paciente, sessoes, onVoltar }) {
  const sessOrdenadas = [...sessoes].sort((a, b) => (a.data || "").localeCompare(b.data || ""));
  const porMes = {};
  sessOrdenadas.forEach((s) => {
    const mes = s.data?.slice(0, 7) || "sem-data";
    if (!porMes[mes]) porMes[mes] = [];
    porMes[mes].push(s);
  });
  const meses = Object.keys(porMes).sort();

  const totalValor = sessOrdenadas.reduce((a, s) => a + (parseFloat(s.valorSessao) || 0), 0);
  const totalPago = sessOrdenadas.reduce((a, s) => a + (s.pagamento === "pago" ? (parseFloat(s.valorPago) || parseFloat(s.valorSessao) || 0) : 0), 0);

  async function atualizarStatus(s, status) {
    await db.collection("clinica_sessoes").doc(s.id).update({ status });
  }
  async function atualizarPagamento(s, pago) {
    await db.collection("clinica_sessoes").doc(s.id).update({
      pagamento: pago ? "pago" : "pendente",
      formaPagamento: pago ? s.formaPagamento || "PIX" : "",
      valorPago: pago ? (parseFloat(s.valorSessao) || 0) : 0,
      dataPagamento: pago ? new Date().toISOString().slice(0, 10) : "",
    });
  }
  async function excluirSessao(s) {
    if (!confirm("Excluir esta sessão?")) return;
    await db.collection("clinica_sessoes").doc(s.id).delete();
  }

  function imprimir() {
    const fmtD = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }) : "—");
    const fmtM = (m) => { const [y, mo] = m.split("-"); return new Date(y, mo - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }); };
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Resumo de Sessões — ${paciente?.nome || ""}</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;padding:32px;max-width:680px;margin:0 auto}
  .header{border-bottom:3px solid #7B00C4;margin-bottom:24px;padding-bottom:12px}
  .mes-title{font-size:14px;font-weight:700;color:#7B00C4;margin:20px 0 8px;border-bottom:1px solid #e5e7eb;padding-bottom:6px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:#7B00C4;color:white;padding:7px 10px;text-align:left}
  td{padding:7px 10px;border-bottom:1px solid #f3f4f6}
  .totais{margin-top:24px;background:#f9fafb;border-radius:10px;padding:14px 20px;display:flex;justify-content:space-between}
  @media print{@page{margin:1.5cm}}
</style></head><body>
<div class="header"><h2>${paciente?.nome || ""}</h2><div style="color:#6b7280;font-size:12px">Controle de Sessões e Frequência — gerado em ${new Date().toLocaleDateString("pt-BR")}</div></div>
${meses.map((mes) => `
<div class="mes-title">${fmtM(mes)}</div>
<table><thead><tr><th>Data</th><th>Horário</th><th>Status</th><th>Pagamento</th><th>Valor</th></tr></thead>
<tbody>${porMes[mes].map((s) => `<tr><td>${fmtD(s.data)}</td><td>${s.hora || "—"}</td><td>${STATUS_SESSAO[s.status]?.rotulo || s.status || "—"}</td><td>${s.pagamento === "pago" ? "Pago" : "Pendente"}</td><td>R$ ${(parseFloat(s.valorSessao) || 0).toFixed(2).replace(".", ",")}</td></tr>`).join("")}</tbody></table>`).join("")}
<div class="totais"><div><strong>Total:</strong> R$ ${totalValor.toFixed(2).replace(".", ",")}</div><div><strong>Recebido:</strong> R$ ${totalPago.toFixed(2).replace(".", ",")}</div></div>
</body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  }

  return (
    <div>
      <div className="barra-controle-sessoes">
        <button className="botao-voltar-sessoes" onClick={onVoltar}>
          <Icone nome="arrow-left" tamanho={15} /> Voltar
        </button>
        <div className="titulo-controle-sessoes">
          <strong>{paciente?.nome}</strong>
          <span>Controle de Sessões e Frequência</span>
        </div>
        <button className="botao-imprimir-sessoes" onClick={imprimir}>
          <Icone nome="printer" tamanho={15} /> Imprimir / PDF
        </button>
      </div>

      <div className="grade-resumo-mes">
        <div className="cartao-resumo receita">
          <span className="rotulo-resumo">Total do(s) pacote(s)</span>
          <span className="valor-resumo">{fmtMoeda(totalValor)}</span>
        </div>
        <div className="cartao-resumo saldo">
          <span className="rotulo-resumo">Recebido</span>
          <span className="valor-resumo">{fmtMoeda(totalPago)}</span>
        </div>
        <div className="cartao-resumo despesa">
          <span className="rotulo-resumo">A Receber</span>
          <span className="valor-resumo">{fmtMoeda(Math.max(0, totalValor - totalPago))}</span>
        </div>
      </div>

      {meses.length === 0 && <p className="texto-vazio">Nenhuma sessão registrada ainda.</p>}

      {meses.map((mes) => (
        <div key={mes} className="grupo-status">
          <div className="cabecalho-secao-lanc">
            <span className="titulo-secao-lanc">{new Date(mes + "-15").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
          </div>
          <div className="cartao-lista-pacientes">
            {porMes[mes].map((s) => (
              <div key={s.id} className="linha-sessao">
                <div className="info-lancamento">
                  <div className="descricao-lancamento">
                    Sessão nº {s.numSessao || "—"} · {s.data?.split("-").reverse().join("/")}{s.hora ? " às " + s.hora : ""}
                  </div>
                  <div className="detalhe-lancamento">{fmtMoeda(s.valorSessao)}</div>
                </div>
                <select
                  className="select-status-sessao"
                  value={s.status || "agendado"}
                  onChange={(e) => atualizarStatus(s, e.target.value)}
                  style={{ color: STATUS_SESSAO[s.status]?.cor || "inherit" }}
                >
                  {Object.entries(STATUS_SESSAO).map(([v, o]) => <option key={v} value={v}>{o.rotulo}</option>)}
                </select>
                {s.pagamento === "pago" ? (
                  <button className="etiqueta-status-lanc etiqueta-recebido" onClick={() => atualizarPagamento(s, false)}>✓ Pago</button>
                ) : (
                  <button className="etiqueta-status-lanc etiqueta-pendente" onClick={() => atualizarPagamento(s, true)}>Marcar Pago</button>
                )}
                <button className="botao-icone botao-icone-perigo" onClick={() => excluirSessao(s)} title="Excluir">
                  <Icone nome="trash-2" tamanho={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Comissões ───────────────────────────────────────────────────
// Versão adaptada ao multi-clínica do sistema real de comissões: uma
// secretária (opcional, salário fixo + % por venda) e parceiras ou
// estagiárias (repasse por %). Fora do escopo por enquanto: as
// ferramentas de auditoria/higienização de dados legados, que eram
// específicas do histórico da Dra. Lucia e não fazem sentido para uma
// clínica nova.

function ComissoesTab({ usuario, config, parceiras }) {
  const [comissoes, setComissoes] = useState([]);
  const [mesSel, setMesSel] = useState(() => new Date().toISOString().slice(0, 7));
  const [editandoConfig, setEditandoConfig] = useState(false);
  const [formConfig, setFormConfig] = useState(config);
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [mostrarParceira, setMostrarParceira] = useState(false);
  const [parceiraEditando, setParceiraEditando] = useState(null);

  useEffect(() => {
    const cancelar = db
      .collection("clinica_comissoes")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.criadoEm?.toMillis?.() || 0) - (a.criadoEm?.toMillis?.() || 0));
        setComissoes(docs);
      });
    return cancelar;
  }, [usuario.psiId]);

  async function salvarConfig() {
    setSalvandoConfig(true);
    try {
      await db.collection("clinica_config").doc(usuario.psiId).set({
        psi_id: usuario.psiId,
        comissoes: {
          nomeSecretaria: formConfig.nomeSecretaria || "",
          salarioFixo: parseFloat(formConfig.salarioFixo) || 0,
          percPrimeira: parseFloat(formConfig.percPrimeira) || 0,
          percRecorrente: parseFloat(formConfig.percRecorrente) || 0,
          valorSupervisaoSocial: parseFloat(formConfig.valorSupervisaoSocial) || 0,
          valorEstagiariaSocial: parseFloat(formConfig.valorEstagiariaSocial) || 0,
        },
      }, { merge: true });
      setEditandoConfig(false);
    } finally {
      setSalvandoConfig(false);
    }
  }

  async function marcarPago(c) {
    await db.collection("clinica_comissoes").doc(c.id).update({ status: "pago", dataPagamento: new Date().toISOString().slice(0, 10) });
  }

  async function excluirParceira(id) {
    if (!confirm("Remover esta parceira/estagiária?")) return;
    await db.collection("clinica_parceiras").doc(id).delete();
  }

  const comissoesMes = comissoes.filter((c) => (c.mesRef || "") === mesSel);
  const comissoesSecretaria = comissoesMes.filter((c) => c.tipo !== "Repasse Parceria" && c.tipo !== "Social — Estagiária");
  const totalComissaoSecretaria = comissoesSecretaria.reduce((a, c) => a + (parseFloat(c.valorComissao) || 0), 0);
  const totalAPagarSecretaria = (parseFloat(config.salarioFixo) || 0) + totalComissaoSecretaria;

  return (
    <div>
      <div className="cartao-secao">
        <div className="cabecalho-secao-lanc">
          <span className="titulo-secao-lanc">Configuração de Comissões</span>
          {!editandoConfig && (
            <button className="botao-icone" onClick={() => { setFormConfig(config); setEditandoConfig(true); }} title="Editar">
              <Icone nome="pencil" tamanho={15} />
            </button>
          )}
        </div>

        {!editandoConfig ? (
          <p className="texto-vazio">
            {config.nomeSecretaria
              ? `Secretária: ${config.nomeSecretaria} · ${fmtMoeda(config.salarioFixo)} fixo + ${config.percPrimeira}% (1ª venda) / ${config.percRecorrente}% (recorrente)`
              : "Nenhuma secretária configurada — os botões de comissão só aparecem depois de configurar."}
          </p>
        ) : (
          <>
            <div className="grade-2col">
              <div>
                <label>Nome da Secretária <span className="opcional">(opcional)</span></label>
                <input value={formConfig.nomeSecretaria || ""} onChange={(e) => setFormConfig({ ...formConfig, nomeSecretaria: e.target.value })} placeholder="Deixe em branco se não houver" />
              </div>
              <div>
                <label>Salário Fixo (R$)</label>
                <input type="number" step="0.01" value={formConfig.salarioFixo} onChange={(e) => setFormConfig({ ...formConfig, salarioFixo: e.target.value })} />
              </div>
              <div>
                <label>% Primeira Venda</label>
                <input type="number" step="0.1" value={formConfig.percPrimeira} onChange={(e) => setFormConfig({ ...formConfig, percPrimeira: e.target.value })} />
              </div>
              <div>
                <label>% Venda Recorrente</label>
                <input type="number" step="0.1" value={formConfig.percRecorrente} onChange={(e) => setFormConfig({ ...formConfig, percRecorrente: e.target.value })} />
              </div>
              <div>
                <label>Valor Supervisão Social (R$)</label>
                <input type="number" step="0.01" value={formConfig.valorSupervisaoSocial} onChange={(e) => setFormConfig({ ...formConfig, valorSupervisaoSocial: e.target.value })} />
              </div>
              <div>
                <label>Valor Estagiária Social (R$)</label>
                <input type="number" step="0.01" value={formConfig.valorEstagiariaSocial} onChange={(e) => setFormConfig({ ...formConfig, valorEstagiariaSocial: e.target.value })} />
              </div>
            </div>
            <div className="acoes-modal">
              <button className="botao-secundario" onClick={() => setEditandoConfig(false)}>Cancelar</button>
              <button className="botao-primario" disabled={salvandoConfig} onClick={salvarConfig}>{salvandoConfig ? "Salvando..." : "Salvar"}</button>
            </div>
          </>
        )}
      </div>

      <div className="faixa-meses" style={{ marginTop: 20 }}>
        {mesesUltimos12().map((m) => (
          <button key={m} className={"botao-mes" + (m === mesSel ? " botao-mes-ativo" : "")} onClick={() => setMesSel(m)}>
            {mesLabelCurto(m)}
          </button>
        ))}
      </div>

      {config.nomeSecretaria && (
        <div className="grade-resumo-mes">
          <div className="cartao-resumo saldo">
            <span className="rotulo-resumo">A pagar — {config.nomeSecretaria}</span>
            <span className="valor-resumo">{fmtMoeda(totalAPagarSecretaria)}</span>
          </div>
        </div>
      )}

      <div className="grupo-status">
        <div className="cabecalho-secao-lanc">
          <span className="titulo-secao-lanc">Comissões e Repasses do Mês</span>
        </div>
        {comissoesMes.length === 0 ? (
          <p className="texto-vazio">Nenhuma comissão registrada neste mês.</p>
        ) : (
          <div className="cartao-lista-pacientes">
            {comissoesMes.map((c) => (
              <div key={c.id} className="linha-lancamento">
                <div className="info-lancamento">
                  <div className="descricao-lancamento">
                    {c.tipo}{c.responsavel ? " — " + c.responsavel : ""}{c.pacienteNome ? " · " + c.pacienteNome : ""}
                  </div>
                  <div className="detalhe-lancamento">
                    {c.tipoVenda === "primeira" ? "Primeira venda" : c.tipoVenda === "recorrente" ? "Recorrente" : ""}
                    {c.perc ? ` · ${c.perc}%` : ""}
                  </div>
                </div>
                <span className={"etiqueta-status-lanc " + (c.status === "pago" ? "etiqueta-recebido" : "etiqueta-pendente")}>
                  {c.status === "pago" ? "✓ Pago" : "Pendente"}
                </span>
                <span className="valor-lancamento valor-receita">{fmtMoeda(c.valorComissao)}</span>
                {c.status !== "pago" && (
                  <button className="botao-secundario" onClick={() => marcarPago(c)}>Marcar Pago</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grupo-status">
        <div className="cabecalho-secao-lanc">
          <span className="titulo-secao-lanc">Parceiras e Estagiárias</span>
          <button className="botao-icone" onClick={() => { setParceiraEditando(null); setMostrarParceira(true); }} title="Adicionar">
            <Icone nome="plus" tamanho={15} />
          </button>
        </div>
        {parceiras.length === 0 ? (
          <p className="texto-vazio">Nenhuma parceira ou estagiária cadastrada.</p>
        ) : (
          <div className="cartao-lista-pacientes">
            {parceiras.map((p) => (
              <div key={p.id} className="linha-lancamento">
                <div className="info-lancamento">
                  <div className="descricao-lancamento">{p.nome}</div>
                  <div className="detalhe-lancamento">
                    {p.tipo === "estagiaria" ? "Estagiária" : "Parceira"} · {p.percentual}%{p.pix ? " · PIX: " + p.pix : ""}
                  </div>
                </div>
                <button className="botao-icone" onClick={() => { setParceiraEditando(p); setMostrarParceira(true); }} title="Editar">
                  <Icone nome="pencil" tamanho={15} />
                </button>
                <button className="botao-icone botao-icone-perigo" onClick={() => excluirParceira(p.id)} title="Excluir">
                  <Icone nome="trash-2" tamanho={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {mostrarParceira && (
        <FormParceira
          usuario={usuario}
          parceira={parceiraEditando}
          aoFechar={() => { setMostrarParceira(false); setParceiraEditando(null); }}
        />
      )}
    </div>
  );
}

function FormParceira({ usuario, parceira, aoFechar }) {
  const [form, setForm] = useState(parceira || { nome: "", percentual: "70", pix: "", tipo: "parceira" });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(evento) {
    evento.preventDefault();
    if (!form.nome) { setErro("Nome é obrigatório."); return; }
    setErro("");
    setSalvando(true);
    try {
      const dados = { nome: form.nome, percentual: parseFloat(form.percentual) || 0, pix: form.pix || "", tipo: form.tipo || "parceira" };
      if (parceira) {
        await db.collection("clinica_parceiras").doc(parceira.id).update(dados);
      } else {
        await db.collection("clinica_parceiras").add({ ...dados, psi_id: usuario.psiId, criadoEm: firebase.firestore.FieldValue.serverTimestamp() });
      }
      aoFechar();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{parceira ? "Editar" : "Nova"} Parceira / Estagiária</h3>
        <form onSubmit={salvar}>
          <label>Nome *</label>
          <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />

          <label>Tipo</label>
          <div className="pills-status">
            {[["parceira", "Parceira"], ["estagiaria", "Estagiária"]].map(([v, l]) => (
              <button key={v} type="button" className={"pill-status" + (form.tipo === v ? " pill-status-ativa" : "")} onClick={() => setForm({ ...form, tipo: v })}>
                {l}
              </button>
            ))}
          </div>

          <label>Percentual padrão de repasse (%)</label>
          <input type="number" step="0.1" value={form.percentual} onChange={(e) => setForm({ ...form, percentual: e.target.value })} />

          <label>Chave PIX <span className="opcional">(opcional)</span></label>
          <input value={form.pix || ""} onChange={(e) => setForm({ ...form, pix: e.target.value })} />

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="acoes-modal">
            <button type="button" className="botao-secundario" onClick={aoFechar}>Cancelar</button>
            <button type="submit" className="botao-primario" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
