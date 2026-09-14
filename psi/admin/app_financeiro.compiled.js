// ═══════════════════════════════════════════════════════════════
//  app_financeiro.js — Financeiro da Clínica
//
//  Portado do sistema real da Dra. Lucia (mesmos campos, categorias
//  e formas de pagamento). O módulo completo tem 5 abas (Lançamentos,
//  Pacotes & Sessões, Acompanhamento Geral, Comissões, Orçamento) —
//  construindo uma de cada vez (CLAUDE.md REGRA 5). Por enquanto só
//  "Lançamentos" está funcional; as outras aparecem como "em breve".
// ═══════════════════════════════════════════════════════════════

const CATS_DESPESA_CLINICA = ["Aluguel", "Condomínio", "Energia / Água", "Telefone / Internet", "Salário Secretária", "Contador / Impostos", "Marketing", "Equipamentos", "Materiais", "Ferramentas de IA", "Cursos e Capacitação", "Musicoterapia", "Manutenção", "Outros"];
const FORMAS_PAG_CLINICA = ["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Depósito", "Transferência", "Outro"];
const TIPOS_RECEITA = ["Consulta", "Avaliação", "Sessão Avulsa", "Outro"];
const RECORRENCIAS = ["Semanal (1x/semana)", "2x por semana", "3x por semana", "Quinzenal", "Mensal", "Sessão única"];
const DIAS_SEMANA_LABEL = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb"
};
const TIPOS_ATENDIMENTO = [{
  valor: "particular",
  rotulo: "Particular",
  icone: "banknote"
}, {
  valor: "social",
  rotulo: "Social",
  icone: "leaf"
}, {
  valor: "parceria",
  rotulo: "Parceria",
  icone: "handshake"
}];

// Gera as datas das sessões de um pacote a partir da recorrência —
// mesma lógica do sistema original.
function gerarDatasPacote(dataInicio, recorrencia, total, diasSemana) {
  if (recorrencia === "Sessão única") return [dataInicio];
  const datas = [];
  if (["Semanal (1x/semana)", "Quinzenal", "Mensal"].includes(recorrencia)) {
    let atual = new Date(dataInicio + "T00:00:00");
    while (datas.length < total) {
      datas.push(atual.toISOString().split("T")[0]);
      if (recorrencia === "Semanal (1x/semana)") atual.setDate(atual.getDate() + 7);else if (recorrencia === "Quinzenal") atual.setDate(atual.getDate() + 14);else atual.setMonth(atual.getMonth() + 1);
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
const ABAS_FINANCEIRO = [{
  id: "lancamentos",
  rotulo: "Lançamentos",
  icone: "circle-dollar-sign"
}, {
  id: "pacotes",
  rotulo: "Pacotes & Sessões",
  icone: "package"
}, {
  id: "acompanhamento",
  rotulo: "Acompanhamento Geral",
  icone: "users"
}, {
  id: "comissoes",
  rotulo: "Comissões",
  icone: "percent"
}, {
  id: "orcamento",
  rotulo: "Orçamento",
  icone: "file-text"
}];
function fmtMoeda(v) {
  return (v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
function TelaFinanceiro({
  usuario
}) {
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
  useEffect(() => {
    const cancelar = db.collection("clinica_pacientes").where("psi_id", "==", usuario.psiId).onSnapshot(snap => setPacientes(snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }))));
    return cancelar;
  }, [usuario.psiId]);
  useEffect(() => {
    const cancelar = db.collection("clinica_lancamentos").where("psi_id", "==", usuario.psiId).onSnapshot(snap => {
      const docs = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      docs.sort((a, b) => (b.data || "").localeCompare(a.data || ""));
      setLancamentos(docs);
      setCarregando(false);
    }, () => setCarregando(false));
    return cancelar;
  }, [usuario.psiId]);
  useEffect(() => {
    const cancelar = db.collection("clinica_pacotes").where("psi_id", "==", usuario.psiId).onSnapshot(snap => {
      const docs = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      docs.sort((a, b) => (b.criadoEm?.toMillis?.() || 0) - (a.criadoEm?.toMillis?.() || 0));
      setPacotes(docs);
    });
    return cancelar;
  }, [usuario.psiId]);
  useEffect(() => {
    const cancelar = db.collection("clinica_sessoes").where("psi_id", "==", usuario.psiId).onSnapshot(snap => setSessoesPacotes(snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }))));
    return cancelar;
  }, [usuario.psiId]);
  function nomePaciente(id) {
    return pacientes.find(p => p.id === id)?.nome || "—";
  }

  // Anos disponíveis (a partir dos lançamentos existentes + o atual)
  const anosDisp = [...new Set(lancamentos.map(l => l.data?.slice(0, 4)).filter(Boolean))];
  if (!anosDisp.includes(anoFiltro)) anosDisp.push(anoFiltro);
  anosDisp.sort();
  const mesesDoAno = Array.from({
    length: 12
  }, (_, i) => `${anoFiltro}-${String(i + 1).padStart(2, "0")}`);
  const mesFiltroEfetivo = mesFiltro.startsWith(anoFiltro) ? mesFiltro : anoFiltro + "-01";
  const mesAtualStr = new Date().toISOString().slice(0, 7);
  const lancMesAtual = lancamentos.filter(l => l.data?.startsWith(mesAtualStr));
  const lancDoAno = lancamentos.filter(l => l.data?.startsWith(anoFiltro));
  const lancDoMesFiltrado = lancamentos.filter(l => l.data?.startsWith(mesFiltroEfetivo));
  function calcReceitas(lista) {
    return lista.filter(l => l.tipo_lancamento !== "despesa").reduce((a, l) => a + (parseFloat(l.valor) || 0), 0);
  }
  function calcDespesas(lista) {
    return lista.filter(l => l.tipo_lancamento === "despesa").reduce((a, l) => a + (parseFloat(l.valor) || 0), 0);
  }
  const saldoMesAtual = calcReceitas(lancMesAtual) - calcDespesas(lancMesAtual);
  const pendenteDoAno = calcReceitas(lancDoAno.filter(l => l.status === "pendente"));
  const receitasMesFiltro = calcReceitas(lancDoMesFiltrado);
  const despesasMesFiltro = calcDespesas(lancDoMesFiltrado);
  const saldoMesFiltro = receitasMesFiltro - despesasMesFiltro;
  const mesLabel = m => {
    try {
      return new Date(m + "-15").toLocaleDateString("pt-BR", {
        month: "long"
      });
    } catch (e) {
      return m;
    }
  };
  const listaFiltrada = lancDoMesFiltrado.filter(l => {
    if (filtroTipo === "receitas") return l.tipo_lancamento !== "despesa";
    if (filtroTipo === "despesas") return l.tipo_lancamento === "despesa";
    return true;
  });
  const receitasLista = listaFiltrada.filter(l => l.tipo_lancamento !== "despesa");
  const despesasLista = listaFiltrada.filter(l => l.tipo_lancamento === "despesa");
  function abrirEditar(l) {
    setLancEditando(l);
    if (l.tipo_lancamento === "despesa") setMostrarDespesa(true);else setMostrarNovo(true);
  }
  async function excluirLancamento(id) {
    if (!confirm("Excluir este lançamento?")) return;
    await db.collection("clinica_lancamentos").doc(id).delete();
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "conteudo conteudo-larga"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-secao"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Financeiro da Cl\xEDnica"), /*#__PURE__*/React.createElement("p", {
    className: "subtitulo-pagina"
  }, "Lan\xE7amentos, pacotes e controle de sess\xF5es")), /*#__PURE__*/React.createElement("div", {
    className: "acoes-cabecalho"
  }, aba === "pacotes" ? /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: () => {
      setPacoteEditando(null);
      setMostrarPacote(true);
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "plus",
    tamanho: 16
  }), " Novo Pacote") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "botao-perigo",
    onClick: () => {
      setLancEditando(null);
      setMostrarDespesa(true);
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "minus-circle",
    tamanho: 16
  }), " Nova Despesa"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: () => {
      setLancEditando(null);
      setMostrarNovo(true);
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "plus",
    tamanho: 16
  }), " Novo Lan\xE7amento")))), /*#__PURE__*/React.createElement("div", {
    className: "seletor-ano"
  }, anosDisp.map(a => /*#__PURE__*/React.createElement("button", {
    key: a,
    className: "botao-ano" + (a === anoFiltro ? " botao-ano-ativo" : ""),
    onClick: () => setAnoFiltro(a)
  }, a))), /*#__PURE__*/React.createElement("div", {
    className: "grade-cartoes-stat"
  }, /*#__PURE__*/React.createElement(CartaoStat, {
    titulo: `Saldo (${mesLabel(mesAtualStr)})`,
    valor: fmtMoeda(saldoMesAtual),
    legenda: "m\xEAs atual",
    icone: "wallet"
  }), /*#__PURE__*/React.createElement(CartaoStat, {
    titulo: `Pendente (${anoFiltro})`,
    valor: fmtMoeda(pendenteDoAno),
    legenda: "a receber",
    icone: "clock"
  }), /*#__PURE__*/React.createElement(CartaoStat, {
    titulo: "Pacotes ativos",
    valor: pacotes.filter(p => p.status === "ativo").length,
    legenda: "em andamento",
    icone: "package"
  }), /*#__PURE__*/React.createElement(CartaoStat, {
    titulo: `Lançamentos (${mesLabel(mesFiltroEfetivo)})`,
    valor: lancDoMesFiltrado.length,
    legenda: "neste m\xEAs",
    icone: "list"
  })), /*#__PURE__*/React.createElement("div", {
    className: "abas-financeiro"
  }, ABAS_FINANCEIRO.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.id,
    className: "aba-financeiro" + (aba === a.id ? " aba-financeiro-ativa" : ""),
    onClick: () => setAba(a.id)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: a.icone,
    tamanho: 15
  }), " ", a.rotulo))), aba !== "lancamentos" && aba !== "pacotes" && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Essa aba (", ABAS_FINANCEIRO.find(a => a.id === aba)?.rotulo, ") ainda n\xE3o foi constru\xEDda \u2014 \xE9 a pr\xF3xima etapa combinada.")), aba === "pacotes" && /*#__PURE__*/React.createElement(ListaPacotes, {
    pacotes: pacotes,
    sessoes: sessoesPacotes,
    pacientes: pacientes,
    aoEditar: p => {
      setPacoteEditando(p);
      setMostrarPacote(true);
    }
  }), aba === "lancamentos" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "faixa-meses"
  }, mesesDoAno.map(m => /*#__PURE__*/React.createElement("button", {
    key: m,
    className: "botao-mes" + (m === mesFiltroEfetivo ? " botao-mes-ativo" : ""),
    onClick: () => setMesFiltro(m)
  }, mesLabel(m)))), /*#__PURE__*/React.createElement("div", {
    className: "filtro-tipo-lanc"
  }, [["tudo", "Tudo"], ["receitas", "Receitas"], ["despesas", "Despesas"]].map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: "botao-filtro" + (filtroTipo === v ? " botao-filtro-ativo" : ""),
    onClick: () => setFiltroTipo(v)
  }, l))), /*#__PURE__*/React.createElement("div", {
    className: "grade-resumo-mes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cartao-resumo receita"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rotulo-resumo"
  }, "Total Receitas"), /*#__PURE__*/React.createElement("span", {
    className: "valor-resumo"
  }, fmtMoeda(receitasMesFiltro))), /*#__PURE__*/React.createElement("div", {
    className: "cartao-resumo despesa"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rotulo-resumo"
  }, "Total Despesas"), /*#__PURE__*/React.createElement("span", {
    className: "valor-resumo"
  }, fmtMoeda(despesasMesFiltro))), /*#__PURE__*/React.createElement("div", {
    className: "cartao-resumo saldo"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rotulo-resumo"
  }, "Saldo L\xEDquido"), /*#__PURE__*/React.createElement("span", {
    className: "valor-resumo"
  }, fmtMoeda(saldoMesFiltro)))), carregando && /*#__PURE__*/React.createElement("p", null, "Carregando..."), !carregando && receitasLista.length > 0 && /*#__PURE__*/React.createElement(SecaoLancamentos, {
    titulo: "Receitas",
    cor: "receita",
    itens: receitasLista,
    nomePaciente: nomePaciente,
    aoEditar: abrirEditar,
    aoExcluir: excluirLancamento
  }), !carregando && despesasLista.length > 0 && /*#__PURE__*/React.createElement(SecaoLancamentos, {
    titulo: "Despesas",
    cor: "despesa",
    itens: despesasLista,
    nomePaciente: nomePaciente,
    aoEditar: abrirEditar,
    aoExcluir: excluirLancamento
  }), !carregando && listaFiltrada.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhum lan\xE7amento em ", mesLabel(mesFiltroEfetivo), ".")), mostrarNovo && /*#__PURE__*/React.createElement(FormLancamento, {
    usuario: usuario,
    pacientes: pacientes,
    lancamento: lancEditando,
    aoFechar: () => {
      setMostrarNovo(false);
      setLancEditando(null);
    }
  }), mostrarDespesa && /*#__PURE__*/React.createElement(FormDespesa, {
    usuario: usuario,
    lancamento: lancEditando,
    aoFechar: () => {
      setMostrarDespesa(false);
      setLancEditando(null);
    }
  }), mostrarPacote && /*#__PURE__*/React.createElement(PacoteForm, {
    usuario: usuario,
    pacientes: pacientes,
    pacote: pacoteEditando,
    aoFechar: () => {
      setMostrarPacote(false);
      setPacoteEditando(null);
    }
  }));
}
function SecaoLancamentos({
  titulo,
  cor,
  itens,
  nomePaciente,
  aoEditar,
  aoExcluir
}) {
  const total = itens.reduce((a, l) => a + (parseFloat(l.valor) || 0), 0);
  return /*#__PURE__*/React.createElement("div", {
    className: "grupo-status"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-secao-lanc"
  }, /*#__PURE__*/React.createElement("span", {
    className: "titulo-secao-lanc titulo-secao-" + cor
  }, titulo), /*#__PURE__*/React.createElement("span", {
    className: "total-secao-lanc total-secao-" + cor
  }, fmtMoeda(total))), /*#__PURE__*/React.createElement("div", {
    className: "cartao-lista-pacientes"
  }, itens.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.id,
    className: "linha-lancamento"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info-lancamento"
  }, /*#__PURE__*/React.createElement("div", {
    className: "descricao-lancamento"
  }, l.pacienteId ? nomePaciente(l.pacienteId) + " — " : "", l.descricao || l.tipo || l.categoria || "Lançamento"), /*#__PURE__*/React.createElement("div", {
    className: "detalhe-lancamento"
  }, l.data?.split("-").reverse().join("/"), " \xB7 ", l.formaPag || "—")), /*#__PURE__*/React.createElement("span", {
    className: "etiqueta-status-lanc etiqueta-" + (l.status || "pendente")
  }, l.status === "recebido" || l.status === "pago" ? "✓ " + (cor === "despesa" ? "Pago" : "Recebido") : "Pendente"), /*#__PURE__*/React.createElement("span", {
    className: "valor-lancamento valor-" + cor
  }, fmtMoeda(l.valor)), /*#__PURE__*/React.createElement("button", {
    className: "botao-icone",
    onClick: () => aoEditar(l),
    title: "Editar"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "pencil",
    tamanho: 15
  })), /*#__PURE__*/React.createElement("button", {
    className: "botao-icone botao-icone-perigo",
    onClick: () => aoExcluir(l.id),
    title: "Excluir"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "trash-2",
    tamanho: 15
  }))))));
}
function FormLancamento({
  usuario,
  pacientes,
  lancamento,
  aoFechar
}) {
  const [form, setForm] = useState(lancamento ? {
    ...lancamento,
    valor: String(lancamento.valor || "")
  } : {
    pacienteId: "",
    tipo: "Consulta",
    valor: "",
    data: new Date().toISOString().slice(0, 10),
    formaPag: "PIX",
    status: "pendente",
    obs: ""
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  async function salvar(evento) {
    evento.preventDefault();
    if (!form.valor || !form.data) {
      setErro("Valor e data são obrigatórios.");
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      const pac = pacientes.find(p => p.id === form.pacienteId);
      const dados = {
        ...form,
        valor: parseFloat(form.valor),
        pacienteNome: pac?.nome || ""
      };
      if (lancamento) {
        await db.collection("clinica_lancamentos").doc(lancamento.id).update(dados);
      } else {
        await db.collection("clinica_lancamentos").add({
          ...dados,
          psi_id: usuario.psiId,
          tipo_lancamento: "avulso",
          criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      aoFechar();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: aoFechar
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", null, lancamento ? "Editar Lançamento" : "Novo Lançamento"), /*#__PURE__*/React.createElement("form", {
    onSubmit: salvar
  }, /*#__PURE__*/React.createElement("label", null, "Paciente ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement("select", {
    value: form.pacienteId || "",
    onChange: e => setForm({
      ...form,
      pacienteId: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Nenhum \u2014"), pacientes.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.nome))), /*#__PURE__*/React.createElement("label", null, "Tipo"), /*#__PURE__*/React.createElement("select", {
    value: form.tipo || "Consulta",
    onChange: e => setForm({
      ...form,
      tipo: e.target.value
    })
  }, TIPOS_RECEITA.map(t => /*#__PURE__*/React.createElement("option", {
    key: t
  }, t))), /*#__PURE__*/React.createElement("label", null, "Valor (R$)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.01",
    value: form.valor,
    onChange: e => setForm({
      ...form,
      valor: e.target.value
    }),
    required: true
  }), /*#__PURE__*/React.createElement("label", null, "Data"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.data,
    onChange: e => setForm({
      ...form,
      data: e.target.value
    }),
    required: true
  }), /*#__PURE__*/React.createElement("label", null, "Forma de Pagamento"), /*#__PURE__*/React.createElement("select", {
    value: form.formaPag || "PIX",
    onChange: e => setForm({
      ...form,
      formaPag: e.target.value
    })
  }, FORMAS_PAG_CLINICA.map(f => /*#__PURE__*/React.createElement("option", {
    key: f
  }, f))), /*#__PURE__*/React.createElement("label", null, "Status"), /*#__PURE__*/React.createElement("div", {
    className: "pills-status"
  }, [["pendente", "Pendente", "#F59E0B"], ["recebido", "Recebido", "var(--sucesso)"]].map(([v, l, c]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    type: "button",
    className: "pill-status" + (form.status === v ? " pill-status-ativa" : ""),
    style: {
      "--cor-pill": c
    },
    onClick: () => setForm({
      ...form,
      status: v
    })
  }, l))), /*#__PURE__*/React.createElement("label", null, "Observa\xE7\xE3o ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement("textarea", {
    className: "campo-descricao",
    rows: 2,
    value: form.obs || "",
    onChange: e => setForm({
      ...form,
      obs: e.target.value
    })
  }), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: aoFechar
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "botao-primario",
    disabled: salvando
  }, salvando ? "Salvando..." : "Salvar")))));
}
function FormDespesa({
  usuario,
  lancamento,
  aoFechar
}) {
  const [form, setForm] = useState(lancamento ? {
    ...lancamento,
    valor: String(lancamento.valor || ""),
    parcelas: "1"
  } : {
    descricao: "",
    categoria: "",
    valor: "",
    data: new Date().toISOString().slice(0, 10),
    formaPag: "PIX",
    status: "pago",
    obs: "",
    parcelas: "1"
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  async function salvar(evento) {
    evento.preventDefault();
    if (!form.valor || !form.data) {
      setErro("Valor e data são obrigatórios.");
      return;
    }
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
        obs: form.obs || ""
      };
      if (lancamento) {
        await db.collection("clinica_lancamentos").doc(lancamento.id).update({
          ...base,
          valor,
          data: form.data
        });
      } else if (nParcelas > 1) {
        const batch = db.batch();
        const [ano, mes, dia] = form.data.split("-").map(Number);
        for (let i = 0; i < nParcelas; i++) {
          let m = mes + i,
            a = ano;
          while (m > 12) {
            m -= 12;
            a++;
          }
          const dataParcela = `${a}-${String(m).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          batch.set(db.collection("clinica_lancamentos").doc(), {
            ...base,
            valor,
            data: dataParcela,
            parcela: `${i + 1}/${nParcelas}`,
            descricao: `${base.descricao} (${i + 1}/${nParcelas})`,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
        await batch.commit();
      } else {
        await db.collection("clinica_lancamentos").add({
          ...base,
          valor,
          data: form.data,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      aoFechar();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: aoFechar
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", null, lancamento ? "Editar Despesa" : "Nova Despesa"), /*#__PURE__*/React.createElement("form", {
    onSubmit: salvar
  }, /*#__PURE__*/React.createElement("label", null, "Descri\xE7\xE3o ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement("input", {
    value: form.descricao || "",
    onChange: e => setForm({
      ...form,
      descricao: e.target.value
    }),
    placeholder: "Ex.: Aluguel de setembro"
  }), /*#__PURE__*/React.createElement("label", null, "Categoria"), /*#__PURE__*/React.createElement("select", {
    value: form.categoria || "",
    onChange: e => setForm({
      ...form,
      categoria: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione"), CATS_DESPESA_CLINICA.map(c => /*#__PURE__*/React.createElement("option", {
    key: c
  }, c))), /*#__PURE__*/React.createElement("label", null, "Valor (R$)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.01",
    value: form.valor,
    onChange: e => setForm({
      ...form,
      valor: e.target.value
    }),
    required: true
  }), /*#__PURE__*/React.createElement("label", null, "Data"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.data,
    onChange: e => setForm({
      ...form,
      data: e.target.value
    }),
    required: true
  }), /*#__PURE__*/React.createElement("label", null, "Forma de Pagamento"), /*#__PURE__*/React.createElement("select", {
    value: form.formaPag || "PIX",
    onChange: e => setForm({
      ...form,
      formaPag: e.target.value
    })
  }, FORMAS_PAG_CLINICA.map(f => /*#__PURE__*/React.createElement("option", {
    key: f
  }, f))), !lancamento && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", null, "Parcelas"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    value: form.parcelas,
    onChange: e => setForm({
      ...form,
      parcelas: e.target.value
    })
  })), /*#__PURE__*/React.createElement("label", null, "Status"), /*#__PURE__*/React.createElement("div", {
    className: "pills-status"
  }, [["pendente", "Pendente", "#F59E0B"], ["pago", "Pago", "var(--sucesso)"]].map(([v, l, c]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    type: "button",
    className: "pill-status" + (form.status === v ? " pill-status-ativa" : ""),
    style: {
      "--cor-pill": c
    },
    onClick: () => setForm({
      ...form,
      status: v
    })
  }, l))), /*#__PURE__*/React.createElement("label", null, "Observa\xE7\xE3o ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement("textarea", {
    className: "campo-descricao",
    rows: 2,
    value: form.obs || "",
    onChange: e => setForm({
      ...form,
      obs: e.target.value
    })
  }), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: aoFechar
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "botao-primario",
    disabled: salvando
  }, salvando ? "Salvando..." : "Salvar")))));
}

// ─── Pacotes & Sessões ──────────────────────────────────────────
// Portado do salvarPacote() do sistema real — sem comissão, repasse
// de parceria ou e-mail automático (fora do escopo por enquanto).

const MODALIDADES_PACOTE = ["Online", "Presencial"];
function ListaPacotes({
  pacotes,
  sessoes,
  pacientes,
  aoEditar
}) {
  async function excluirPacote(pacote) {
    if (!confirm("Excluir este pacote e todas as sessões vinculadas a ele?")) return;
    const batch = db.batch();
    batch.delete(db.collection("clinica_pacotes").doc(pacote.id));
    sessoes.filter(s => s.pacoteId === pacote.id).forEach(s => batch.delete(db.collection("clinica_sessoes").doc(s.id)));
    const lancSnap = await db.collection("clinica_lancamentos").where("pacoteId", "==", pacote.id).get();
    lancSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  if (pacotes.length === 0) {
    return /*#__PURE__*/React.createElement("p", {
      className: "texto-vazio"
    }, "Nenhum pacote cadastrado ainda.");
  }
  const porPaciente = {};
  pacotes.forEach(p => {
    const chave = p.pacienteId || "sem-paciente";
    if (!porPaciente[chave]) porPaciente[chave] = [];
    porPaciente[chave].push(p);
  });
  return /*#__PURE__*/React.createElement("div", null, Object.entries(porPaciente).map(([pacienteId, lista]) => {
    const nome = pacientes.find(p => p.id === pacienteId)?.nome || lista[0].pacienteNome || "Paciente";
    return /*#__PURE__*/React.createElement("div", {
      key: pacienteId,
      className: "grupo-status"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cabecalho-secao-lanc"
    }, /*#__PURE__*/React.createElement("span", {
      className: "titulo-secao-lanc"
    }, nome)), /*#__PURE__*/React.createElement("div", {
      className: "cartao-lista-pacientes"
    }, lista.map(pac => {
      const sessoesPac = sessoes.filter(s => s.pacoteId === pac.id);
      const realizadas = sessoesPac.filter(s => s.status === "realizada" || s.pagamento === "pago").length;
      const total = pac.totalSessoes || sessoesPac.length || 1;
      const pct = Math.min(100, Math.round(realizadas / total * 100));
      return /*#__PURE__*/React.createElement("div", {
        key: pac.id,
        className: "cartao-pacote"
      }, /*#__PURE__*/React.createElement("div", {
        className: "info-pacote"
      }, /*#__PURE__*/React.createElement("div", {
        className: "descricao-lancamento"
      }, "Pacote de ", pac.totalSessoes, " sess\xF5es \u2014 ", pac.recorrencia), /*#__PURE__*/React.createElement("div", {
        className: "detalhe-lancamento"
      }, "In\xEDcio ", pac.dataInicio?.split("-").reverse().join("/"), " · ", TIPOS_ATENDIMENTO.find(t => t.valor === pac.tipoAtendimento)?.rotulo || "Particular", pac.horario ? " · " + pac.horario : ""), /*#__PURE__*/React.createElement("div", {
        className: "barra-progresso"
      }, /*#__PURE__*/React.createElement("div", {
        className: "barra-progresso-preenchimento",
        style: {
          width: pct + "%"
        }
      })), /*#__PURE__*/React.createElement("div", {
        className: "detalhe-lancamento"
      }, realizadas, " de ", total, " sess\xF5es realizadas")), /*#__PURE__*/React.createElement("span", {
        className: "etiqueta-status-lanc etiqueta-" + (pac.statusPag || "pendente")
      }, pac.statusPag === "recebido" ? "✓ Recebido" : "Pendente"), /*#__PURE__*/React.createElement("span", {
        className: "valor-lancamento valor-receita"
      }, fmtMoeda(pac.valorTotal)), /*#__PURE__*/React.createElement("button", {
        className: "botao-icone",
        onClick: () => aoEditar(pac),
        title: "Editar"
      }, /*#__PURE__*/React.createElement(Icone, {
        nome: "pencil",
        tamanho: 15
      })), /*#__PURE__*/React.createElement("button", {
        className: "botao-icone botao-icone-perigo",
        onClick: () => excluirPacote(pac),
        title: "Excluir"
      }, /*#__PURE__*/React.createElement(Icone, {
        nome: "trash-2",
        tamanho: 15
      })));
    })));
  }));
}
function PacoteForm({
  usuario,
  pacientes,
  pacote,
  aoFechar
}) {
  const [form, setForm] = useState(pacote ? {
    ...pacote,
    totalSessoes: String(pacote.totalSessoes || ""),
    valorSessao: String(pacote.valorSessao || "")
  } : {
    pacienteId: "",
    totalSessoes: "",
    valorSessao: "",
    recorrencia: RECORRENCIAS[0],
    dataInicio: new Date().toISOString().slice(0, 10),
    horario: "",
    diasSemana: [],
    modalidade: "Online",
    tipoAtendimento: "particular",
    statusPag: "pendente",
    formaPag: "PIX",
    dataPagamento: "",
    obs: ""
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const precisaDias = ["2x por semana", "3x por semana"].includes(form.recorrencia);
  const total = parseInt(form.totalSessoes) || 0;
  const valorSessao = parseFloat(form.valorSessao) || 0;
  const valorTotal = total * valorSessao;
  function alternarDia(dia) {
    const atual = form.diasSemana || [];
    setForm({
      ...form,
      diasSemana: atual.includes(dia) ? atual.filter(d => d !== dia) : [...atual, dia]
    });
  }
  async function salvar(evento) {
    evento.preventDefault();
    if (!form.pacienteId || !form.totalSessoes || !form.dataInicio) {
      setErro("Paciente, nº de sessões e data de início são obrigatórios.");
      return;
    }
    if (precisaDias && (!form.diasSemana || form.diasSemana.length === 0)) {
      setErro("Selecione os dias da semana.");
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      const pac = pacientes.find(p => p.id === form.pacienteId);
      if (pacote) {
        // Edição: atualiza os dados do pacote (não regera as sessões já criadas)
        await db.collection("clinica_pacotes").doc(pacote.id).update({
          pacienteId: form.pacienteId,
          pacienteNome: pac?.nome || "",
          totalSessoes: total,
          valorSessao,
          valorTotal,
          recorrencia: form.recorrencia,
          dataInicio: form.dataInicio,
          horario: form.horario,
          modalidade: form.modalidade,
          tipoAtendimento: form.tipoAtendimento,
          statusPag: form.statusPag,
          formaPag: form.formaPag,
          dataPagamento: form.dataPagamento,
          obs: form.obs
        });
        aoFechar();
        return;
      }
      const datas = gerarDatasPacote(form.dataInicio, form.recorrencia, total, form.diasSemana);
      const pacRef = await db.collection("clinica_pacotes").add({
        psi_id: usuario.psiId,
        pacienteId: form.pacienteId,
        pacienteNome: pac?.nome || "",
        totalSessoes: total,
        valorSessao,
        valorTotal,
        recorrencia: form.recorrencia,
        dataInicio: form.dataInicio,
        horario: form.horario,
        diasSemana: form.diasSemana || [],
        modalidade: form.modalidade,
        tipoAtendimento: form.tipoAtendimento,
        statusPag: form.statusPag,
        formaPag: form.formaPag,
        dataPagamento: form.dataPagamento,
        obs: form.obs,
        status: "ativo",
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      const mesInicio = new Date(form.dataInicio + "T00:00:00").toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
      });
      const descricaoLanc = `${pac?.nome || "Paciente"} — Pacote ${total} Sessões — ${mesInicio.charAt(0).toUpperCase() + mesInicio.slice(1)}`;
      await db.collection("clinica_lancamentos").add({
        psi_id: usuario.psiId,
        tipo_lancamento: "pacote",
        pacoteId: pacRef.id,
        pacienteId: form.pacienteId,
        pacienteNome: pac?.nome || "",
        tipo: descricaoLanc,
        descricao: descricaoLanc,
        valor: valorTotal,
        data: form.dataInicio,
        formaPag: form.formaPag,
        status: form.statusPag,
        dataPagamento: form.dataPagamento,
        obs: form.obs,
        totalSessoes: total,
        valorSessao,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      const jaPago = form.statusPag === "recebido";
      const batch = db.batch();
      datas.forEach((data, i) => {
        const ref = db.collection("clinica_sessoes").doc();
        batch.set(ref, {
          psi_id: usuario.psiId,
          pacienteId: form.pacienteId,
          pacienteNome: pac?.nome || "",
          data,
          hora: form.horario,
          duracao: "50",
          tipo: "Psicoterapia",
          status: "agendado",
          numSessao: i + 1,
          pacoteId: pacRef.id,
          valorSessao,
          pagamento: jaPago ? "pago" : "pendente",
          valorPago: jaPago ? valorSessao : 0,
          formaPagamento: form.formaPag,
          dataPagamento: jaPago ? form.dataPagamento || new Date().toISOString().slice(0, 10) : "",
          obs: "",
          criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
      aoFechar();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar o pacote.");
    } finally {
      setSalvando(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: aoFechar
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", null, pacote ? "Editar Pacote" : "Novo Pacote de Sessões"), /*#__PURE__*/React.createElement("form", {
    onSubmit: salvar
  }, /*#__PURE__*/React.createElement("label", null, "Paciente *"), /*#__PURE__*/React.createElement("select", {
    value: form.pacienteId,
    onChange: e => setForm({
      ...form,
      pacienteId: e.target.value
    }),
    required: true
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione"), pacientes.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.nome))), /*#__PURE__*/React.createElement("label", null, "Tipo de Atendimento"), /*#__PURE__*/React.createElement("div", {
    className: "pills-status"
  }, TIPOS_ATENDIMENTO.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.valor,
    type: "button",
    className: "pill-status" + (form.tipoAtendimento === t.valor ? " pill-status-ativa" : ""),
    onClick: () => setForm({
      ...form,
      tipoAtendimento: t.valor
    })
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: t.icone,
    tamanho: 14
  }), " ", t.rotulo))), /*#__PURE__*/React.createElement("div", {
    className: "grade-2col"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "N\xBA de Sess\xF5es *"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    value: form.totalSessoes,
    onChange: e => setForm({
      ...form,
      totalSessoes: e.target.value
    }),
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Recorr\xEAncia *"), /*#__PURE__*/React.createElement("select", {
    value: form.recorrencia,
    onChange: e => setForm({
      ...form,
      recorrencia: e.target.value
    })
  }, RECORRENCIAS.map(r => /*#__PURE__*/React.createElement("option", {
    key: r
  }, r))))), precisaDias && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", null, "Dias da Semana"), /*#__PURE__*/React.createElement("div", {
    className: "pills-status"
  }, Object.entries(DIAS_SEMANA_LABEL).map(([n, l]) => /*#__PURE__*/React.createElement("button", {
    key: n,
    type: "button",
    className: "pill-status" + ((form.diasSemana || []).includes(Number(n)) ? " pill-status-ativa" : ""),
    onClick: () => alternarDia(Number(n))
  }, l)))), /*#__PURE__*/React.createElement("div", {
    className: "grade-2col"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Data de In\xEDcio *"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.dataInicio,
    onChange: e => setForm({
      ...form,
      dataInicio: e.target.value
    }),
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Hor\xE1rio"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: form.horario || "",
    onChange: e => setForm({
      ...form,
      horario: e.target.value
    })
  }))), /*#__PURE__*/React.createElement("label", null, "Modalidade"), /*#__PURE__*/React.createElement("select", {
    value: form.modalidade,
    onChange: e => setForm({
      ...form,
      modalidade: e.target.value
    })
  }, MODALIDADES_PACOTE.map(m => /*#__PURE__*/React.createElement("option", {
    key: m
  }, m))), /*#__PURE__*/React.createElement("div", {
    className: "grade-2col"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Valor por Sess\xE3o (R$)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.01",
    value: form.valorSessao,
    onChange: e => setForm({
      ...form,
      valorSessao: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Valor Total (autom\xE1tico)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: fmtMoeda(valorTotal),
    disabled: true
  }))), /*#__PURE__*/React.createElement("label", null, "Status do Pagamento"), /*#__PURE__*/React.createElement("div", {
    className: "pills-status"
  }, [["pendente", "Pendente", "#F59E0B"], ["recebido", "Recebido", "var(--sucesso)"]].map(([v, l, c]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    type: "button",
    className: "pill-status" + (form.statusPag === v ? " pill-status-ativa" : ""),
    style: {
      "--cor-pill": c
    },
    onClick: () => setForm({
      ...form,
      statusPag: v
    })
  }, l))), /*#__PURE__*/React.createElement("div", {
    className: "grade-2col"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Forma de Pagamento"), /*#__PURE__*/React.createElement("select", {
    value: form.formaPag,
    onChange: e => setForm({
      ...form,
      formaPag: e.target.value
    })
  }, FORMAS_PAG_CLINICA.map(f => /*#__PURE__*/React.createElement("option", {
    key: f
  }, f)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Data do Pagamento"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.dataPagamento || "",
    onChange: e => setForm({
      ...form,
      dataPagamento: e.target.value
    })
  }))), /*#__PURE__*/React.createElement("label", null, "Observa\xE7\xF5es ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 2,
    value: form.obs || "",
    onChange: e => setForm({
      ...form,
      obs: e.target.value
    })
  }), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: aoFechar
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "botao-primario",
    disabled: salvando
  }, salvando ? "Salvando..." : pacote ? "Salvar Alterações" : "Criar Pacote")))));
}