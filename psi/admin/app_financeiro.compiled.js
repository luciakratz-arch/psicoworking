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
  }, /*#__PURE__*/React.createElement("button", {
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
  }), " Novo Lan\xE7amento"))), /*#__PURE__*/React.createElement("div", {
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
    valor: "\u2014",
    legenda: "em breve",
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
  }), " ", a.rotulo))), aba !== "lancamentos" && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Essa aba (", ABAS_FINANCEIRO.find(a => a.id === aba)?.rotulo, ") ainda n\xE3o foi constru\xEDda \u2014 \xE9 a pr\xF3xima etapa combinada.")), aba === "lancamentos" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
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