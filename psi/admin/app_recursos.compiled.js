// ═══════════════════════════════════════════════════════════════
//  app_recursos.js — Recursos Terapêuticos
//
//  Catálogo de Ferramentas, Fábulas Terapêuticas e Psicoeducação —
//  é conteúdo compartilhado por toda a plataforma PsiCoWorking (não
//  é de uma clínica só, ver firestore.rules: ehEquipeDeAlgumaClinica),
//  guardado em recursos_terapeuticos / fabulas_terapeuticas /
//  psicoeducacao_conteudos.
//
//  Daqui a psicóloga navega o catálogo e manda um recurso direto pra
//  um paciente — isso ativa o recurso na aba Módulos do perfil dele
//  (mesmo modulosConfig/modulosAtivos usado lá).
//
//  Simplificado em relação ao sistema real: sem a busca por sintoma
//  com IA (precisa de uma Cloud Function própria, com a chave da
//  Anthropic protegida no Secret Manager — fica pra depois) e sem o
//  assistente "Nova Ferramenta" com formulário passo a passo — aqui
//  o cadastro é direto (título, categoria, descrição).
// ═══════════════════════════════════════════════════════════════

const ABAS_RECURSOS = [{
  id: "ferramentas",
  rotulo: "Ferramentas",
  icone: "wrench",
  colecao: "recursos_terapeuticos",
  tipo: "ferramenta"
}, {
  id: "fabulas",
  rotulo: "Fábulas Terapêuticas",
  icone: "book-open",
  colecao: "fabulas_terapeuticas",
  tipo: "fabula"
}, {
  id: "psicoeducacao",
  rotulo: "Psicoeducação",
  icone: "brain",
  colecao: "psicoeducacao_conteudos",
  tipo: "psicoeducacao"
}];

// Cores por categoria, no espírito das macrocategorias do sistema
// real (cada uma com uma cor de destaque + fundo claro). Categorias
// que não estão no mapa caem numa paleta de reserva, sempre a mesma
// cor pra mesma categoria (hash do nome), pra nunca ficar tudo cinza.
const PALETA_CATEGORIAS = {
  tcc: {
    cor: "#7B00C4",
    bg: "#f3e6ff"
  },
  ansiedade: {
    cor: "#7B00C4",
    bg: "#f3e6ff"
  },
  relaxamento: {
    cor: "#0891b2",
    bg: "#e0f2fe"
  },
  avaliacao: {
    cor: "#6366f1",
    bg: "#e0e7ff"
  },
  musicoterapia: {
    cor: "#7B00C4",
    bg: "#f3e6ff"
  },
  depressao: {
    cor: "#db2777",
    bg: "#fce7f3"
  },
  humor: {
    cor: "#db2777",
    bg: "#fce7f3"
  },
  habitos: {
    cor: "#16a34a",
    bg: "#dcfce7"
  },
  autocuidado: {
    cor: "#16a34a",
    bg: "#dcfce7"
  },
  relacionamentos: {
    cor: "#0891b2",
    bg: "#e0f2fe"
  },
  familia: {
    cor: "#d97706",
    bg: "#fef3c7"
  },
  outros: {
    cor: "#6b7280",
    bg: "#f3f4f6"
  }
};
const PALETA_RESERVA = [{
  cor: "#7B00C4",
  bg: "#f3e6ff"
}, {
  cor: "#0891b2",
  bg: "#e0f2fe"
}, {
  cor: "#db2777",
  bg: "#fce7f3"
}, {
  cor: "#16a34a",
  bg: "#dcfce7"
}, {
  cor: "#d97706",
  bg: "#fef3c7"
}, {
  cor: "#6366f1",
  bg: "#e0e7ff"
}, {
  cor: "#0d9488",
  bg: "#ccfbf1"
}];
function corDaCategoria(categoria) {
  const chave = (categoria || "outros").toLowerCase();
  if (PALETA_CATEGORIAS[chave]) return PALETA_CATEGORIAS[chave];
  let hash = 0;
  for (let i = 0; i < chave.length; i++) hash = hash * 31 + chave.charCodeAt(i) >>> 0;
  return PALETA_RESERVA[hash % PALETA_RESERVA.length];
}
const ICONE_POR_TIPO = {
  ferramenta: "wrench",
  fabula: "book-open",
  psicoeducacao: "brain"
};
function TelaRecursos({
  usuario
}) {
  const [aba, setAba] = useState("ferramentas");
  const [itensPorColecao, setItensPorColecao] = useState({
    recursos_terapeuticos: [],
    fabulas_terapeuticas: [],
    psicoeducacao_conteudos: []
  });
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [enviarItem, setEnviarItem] = useState(null);
  const [visualizando, setVisualizando] = useState(null);
  const abaAtual = ABAS_RECURSOS.find(a => a.id === aba);
  const itens = itensPorColecao[abaAtual.colecao] || [];
  useEffect(() => {
    const cancelamentos = ABAS_RECURSOS.map(a => db.collection(a.colecao).onSnapshot(snap => {
      setItensPorColecao(prev => ({
        ...prev,
        [a.colecao]: snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      }));
      setCarregando(false);
    }, () => setCarregando(false)));
    return () => cancelamentos.forEach(c => c());
  }, []);
  const filtrados = itens.filter(it => {
    // "avaliacao" (Anamnese, Entrevista Clínica, Rastreamentos DSM-5...)
    // não é ferramenta de biblioteca compartilhada — é questionário
    // individual do paciente, mora na aba Questionários do perfil dele.
    if (aba === "ferramentas" && it.categoria === "avaliacao") return false;
    const titulo = it.titulo || it.nome || "";
    return !busca || titulo.toLowerCase().includes(busca.toLowerCase());
  });
  const porCategoria = {};
  filtrados.forEach(it => {
    const cat = it.categoria || "outros";
    (porCategoria[cat] = porCategoria[cat] || []).push(it);
  });
  const categorias = Object.keys(porCategoria).sort((a, b) => a.localeCompare(b, "pt-BR"));
  async function excluirItem(item) {
    if (!confirm(`Excluir "${item.titulo || item.nome}" da biblioteca? Isso não desativa quem já usa — só remove do catálogo.`)) return;
    await db.collection(abaAtual.colecao).doc(item.id).delete();
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "conteudo conteudo-larga"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-secao"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Recursos Terap\xEAuticos"), /*#__PURE__*/React.createElement("p", {
    className: "subtitulo-pagina"
  }, "Cat\xE1logo de ferramentas, f\xE1bulas e psicoeduca\xE7\xE3o \u2014 compartilhado com toda a plataforma")), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: () => {
      setItemEditando(null);
      setMostrarForm(true);
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "plus",
    tamanho: 16
  }), " Novo Item")), /*#__PURE__*/React.createElement("div", {
    className: "abas-financeiro"
  }, ABAS_RECURSOS.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.id,
    className: "aba-financeiro" + (aba === a.id ? " aba-financeiro-ativa" : ""),
    onClick: () => setAba(a.id)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: a.icone,
    tamanho: 15
  }), " ", a.rotulo))), /*#__PURE__*/React.createElement("input", {
    className: "campo-busca campo-busca-recursos",
    placeholder: "Buscar por nome...",
    value: busca,
    onChange: e => setBusca(e.target.value)
  }), carregando && /*#__PURE__*/React.createElement("p", null, "Carregando..."), !carregando && categorias.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhum item cadastrado ainda nesta aba. Use a ferramenta de migra\xE7\xE3o de dados (Passo 5) pra trazer o cat\xE1logo do sistema anterior, ou clique em \"Novo Item\" pra cadastrar direto."), categorias.map(cat => {
    const cores = corDaCategoria(cat);
    return /*#__PURE__*/React.createElement("div", {
      key: cat,
      className: "grupo-status"
    }, /*#__PURE__*/React.createElement("div", {
      className: "titulo-grupo-status"
    }, /*#__PURE__*/React.createElement("span", {
      className: "etiqueta-categoria-recurso",
      style: {
        "--cor-cat": cores.cor,
        "--bg-cat": cores.bg
      }
    }, formatarCategoria(cat)), "(", porCategoria[cat].length, ")"), /*#__PURE__*/React.createElement("div", {
      className: "grade-cartoes-recursos"
    }, porCategoria[cat].map(item => /*#__PURE__*/React.createElement("div", {
      key: item.id,
      className: "cartao-recurso",
      style: {
        "--cor-cat": cores.cor,
        "--bg-cat": cores.bg
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "cabecalho-cartao-recurso"
    }, /*#__PURE__*/React.createElement("div", {
      className: "icone-cartao-recurso"
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: ICONE_POR_TIPO[abaAtual.tipo],
      tamanho: 20
    })), /*#__PURE__*/React.createElement("div", {
      className: "titulo-cartao-recurso"
    }, item.titulo || item.nome)), item.descricao && /*#__PURE__*/React.createElement("p", {
      className: "descricao-cartao-recurso"
    }, item.descricao), /*#__PURE__*/React.createElement("div", {
      className: "acoes-cartao-recurso"
    }, /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      onClick: () => setVisualizando(item),
      title: "Visualizar"
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "eye",
      tamanho: 14
    }), " Visualizar"), /*#__PURE__*/React.createElement("button", {
      className: "botao-icone",
      onClick: () => {
        setItemEditando(item);
        setMostrarForm(true);
      },
      title: "Editar"
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "pencil",
      tamanho: 14
    })), /*#__PURE__*/React.createElement("button", {
      className: "botao-icone botao-icone-perigo",
      onClick: () => excluirItem(item),
      title: "Excluir"
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "trash-2",
      tamanho: 14
    }))), /*#__PURE__*/React.createElement("button", {
      className: "botao-primario botao-enviar-recurso",
      onClick: () => setEnviarItem(item)
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "send",
      tamanho: 14
    }), " Enviar para paciente")))));
  }), mostrarForm && /*#__PURE__*/React.createElement(FormRecurso, {
    colecao: abaAtual.colecao,
    item: itemEditando,
    aoFechar: () => {
      setMostrarForm(false);
      setItemEditando(null);
    }
  }), enviarItem && /*#__PURE__*/React.createElement(EnviarRecursoModal, {
    usuario: usuario,
    item: enviarItem,
    tipo: abaAtual.tipo,
    aoFechar: () => setEnviarItem(null)
  }), visualizando && /*#__PURE__*/React.createElement(VisualizarRecursoModal, {
    item: visualizando,
    aoFechar: () => setVisualizando(null)
  }));
}

// Cresce conforme mais ferramentas ganharem componente próprio (ver
// COMPONENTES_FERRAMENTA no app.js do paciente e PREVIEWS_INTERATIVOS
// acima) — precisa das duas listas em sincronia.
const FERRAMENTAS_INTERATIVAS_DISPONIVEIS = [{
  valor: "",
  rotulo: "Nenhuma — só título, categoria e descrição"
}, {
  valor: "anxiety-management",
  rotulo: "Gestão da Ansiedade"
}, {
  valor: "abc-record",
  rotulo: "Registro ABC de Pensamentos"
}, {
  valor: "decision-tree",
  rotulo: "Árvore da Decisão"
}, {
  valor: "roda-vida-integral",
  rotulo: "Roda da Vida Integral"
}, {
  valor: "breathing-478",
  rotulo: "Técnica de Respiração 4-7-8"
}, {
  valor: "muscle-relaxation",
  rotulo: "Relaxamento Muscular Progressivo"
}, {
  valor: "emotional-eating",
  rotulo: "Rastreamento Emocional da Alimentação"
}, {
  valor: "treino-neuro-auditivo",
  rotulo: "Treino Neuro-Auditivo"
}];
function FormRecurso({
  colecao,
  item,
  aoFechar
}) {
  const [form, setForm] = useState(item || {
    titulo: "",
    categoria: "",
    descricao: "",
    formularioKey: ""
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  async function salvar(evento) {
    evento.preventDefault();
    if (!(form.titulo || "").trim()) {
      setErro("Título é obrigatório.");
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      const dados = {
        titulo: form.titulo.trim(),
        categoria: form.categoria || "outros",
        descricao: form.descricao || ""
      };
      if (colecao === "recursos_terapeuticos") {
        dados.formularioKey = form.formularioKey || "";
      }
      if (item) {
        await db.collection(colecao).doc(item.id).update(dados);
      } else {
        await db.collection(colecao).add({
          ...dados,
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
  }, /*#__PURE__*/React.createElement("h3", null, item ? "Editar" : "Novo", " Item"), /*#__PURE__*/React.createElement("form", {
    onSubmit: salvar
  }, /*#__PURE__*/React.createElement("label", null, "T\xEDtulo *"), /*#__PURE__*/React.createElement("input", {
    value: form.titulo || "",
    onChange: e => setForm({
      ...form,
      titulo: e.target.value
    }),
    required: true
  }), /*#__PURE__*/React.createElement("label", null, "Categoria ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(ex.: tcc, relaxamento, ansiedade)")), /*#__PURE__*/React.createElement("input", {
    value: form.categoria || "",
    onChange: e => setForm({
      ...form,
      categoria: e.target.value
    })
  }), /*#__PURE__*/React.createElement("label", null, "Descri\xE7\xE3o ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional \u2014 uma frase curta, o passo a passo j\xE1 fica dentro da ferramenta)")), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 3,
    value: form.descricao || "",
    onChange: e => setForm({
      ...form,
      descricao: e.target.value
    })
  }), colecao === "recursos_terapeuticos" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", null, "Tipo de ferramenta interativa ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(se ela j\xE1 tem uma tela pronta)")), /*#__PURE__*/React.createElement("select", {
    value: form.formularioKey || "",
    onChange: e => setForm({
      ...form,
      formularioKey: e.target.value
    })
  }, FERRAMENTAS_INTERATIVAS_DISPONIVEIS.map(f => /*#__PURE__*/React.createElement("option", {
    key: f.valor,
    value: f.valor
  }, f.rotulo)))), erro && /*#__PURE__*/React.createElement("p", {
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
function EnviarRecursoModal({
  usuario,
  item,
  tipo,
  aoFechar
}) {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteId, setPacienteId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  useEffect(() => {
    db.collection("clinica_pacientes").where("psi_id", "==", usuario.psiId).get().then(snap => {
      const lista = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })).filter(p => p.status === "ativo");
      lista.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
      setPacientes(lista);
    });
  }, [usuario.psiId]);
  async function enviar() {
    if (!pacienteId) {
      setErro("Selecione um paciente.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const pacRef = db.collection("clinica_pacientes").doc(pacienteId);
      const pacDoc = await pacRef.get();
      const configAtual = pacDoc.data()?.modulosConfig || {};
      const novaConfig = {
        ...configAtual,
        [item.id]: {
          ativo: true,
          tipo,
          titulo: item.titulo || item.nome,
          dataInicio: new Date().toISOString().slice(0, 10)
        }
      };
      const ativos = Object.keys(novaConfig).filter(k => novaConfig[k]?.ativo);
      await pacRef.update({
        modulosConfig: novaConfig,
        modulosAtivos: ativos
      });
      setSucesso("Enviado! Já aparece ativado na aba Módulos do paciente.");
    } catch (e) {
      setErro(e.message || "Não foi possível enviar.");
    } finally {
      setEnviando(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: aoFechar
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", null, "Enviar \"", item.titulo || item.nome, "\""), !sucesso ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", null, "Paciente"), /*#__PURE__*/React.createElement("select", {
    value: pacienteId,
    onChange: e => setPacienteId(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione"), pacientes.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.nome))), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: aoFechar
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: enviar,
    disabled: enviando
  }, enviando ? "Enviando..." : "Enviar"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    className: "mensagem-sucesso"
  }, sucesso), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: aoFechar
  }, "Fechar")))));
}

// Preview de verdade — mostra a ferramenta tal como ela vai aparecer
// pro paciente, igual ao modelo ("Visualização do paciente"). Aqui é
// só demonstração: os botões de registrar/salvar nunca gravam nada de
// verdade no banco (não existe um paciente real nessa tela), só
// mostram a mensagem de confirmação. Cada ferramenta interativa
// precisa ser portada uma de cada vez — Gestão da Ansiedade é a
// primeira; as outras ainda caem no aviso "pré-visualização não
// disponível" abaixo.
const PREVIEWS_INTERATIVOS = {
  "anxiety-management": PreviewGestaoAnsiedade,
  "abc-record": PreviewFerramentaABC,
  "decision-tree": PreviewFerramentaArvore,
  "roda-vida-integral": PreviewFerramentaRodaVida,
  "breathing-478": PreviewFerramentaRespiracao,
  "muscle-relaxation": PreviewFerramentaRelaxamento,
  "emotional-eating": PreviewFerramentaRastreamento,
  "treino-neuro-auditivo": PreviewFerramentaTreino
};

// Itens cadastrados antes de existir o campo "Tipo de ferramenta
// interativa" no formulário não têm formularioKey salvo — por isso
// também reconhecemos pelo título, pra elas ficarem interativas sem
// a psicóloga precisar reabrir e editar cada uma manualmente. Um
// formularioKey salvo de verdade sempre tem prioridade sobre isso.
const TITULO_PARA_FORMULARIO_KEY = {
  "gestão da ansiedade": "anxiety-management",
  "registro abc de pensamentos": "abc-record",
  "árvore da decisão": "decision-tree",
  "roda da vida integral": "roda-vida-integral",
  "técnica de respiração 4-7-8": "breathing-478",
  "relaxamento muscular progressivo": "muscle-relaxation",
  "rastreamento emocional da alimentação": "emotional-eating",
  "treino neuro-auditivo": "treino-neuro-auditivo"
};
function resolverFormularioKey(item) {
  if (item.formularioKey) return item.formularioKey;
  const chave = (item.titulo || item.nome || "").trim().toLowerCase();
  return TITULO_PARA_FORMULARIO_KEY[chave] || null;
}
function VisualizarRecursoModal({
  item,
  aoFechar
}) {
  const cores = corDaCategoria(item.categoria);
  const paginas = Array.isArray(item.paginas) ? item.paginas : [];
  const blocos = Array.isArray(item.blocos) ? item.blocos : [];
  const ComponentePreview = PREVIEWS_INTERATIVOS[resolverFormularioKey(item)];
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: aoFechar
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-largo",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("span", {
    className: "etiqueta-categoria-recurso",
    style: {
      "--cor-cat": cores.cor,
      "--bg-cat": cores.bg
    }
  }, formatarCategoria(item.categoria)), /*#__PURE__*/React.createElement("h3", null, item.titulo || item.nome), /*#__PURE__*/React.createElement("div", {
    className: "aviso-preview-paciente"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "eye",
    tamanho: 16
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Visualiza\xE7\xE3o do paciente"), " \u2014 assim a ferramenta aparecer\xE1 na \xE1rea do paciente.")), ComponentePreview && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement(ComponentePreview, null)), !ComponentePreview && paginas.length > 0 && /*#__PURE__*/React.createElement(PreviewFabula, {
    item: item
  }), !ComponentePreview && paginas.length === 0 && blocos.length > 0 && /*#__PURE__*/React.createElement(PreviewBlocosPsicoeducacao, {
    item: item
  }), !ComponentePreview && paginas.length === 0 && blocos.length === 0 && /*#__PURE__*/React.createElement(PreviewConteudoTexto, {
    item: item
  }), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: aoFechar
  }, "Fechar"))));
}

// ─── Preview: Gestão da Ansiedade ──────────────────────────────────
// Porta fiel da ferramenta real (clinica/app.js, FerramentaGestaoAnsiedade),
// com as 3 abas (Estresse, Tracking, Pensamentos). Diferença de propósito:
// aqui os botões "Registrar"/"Salvar" NUNCA gravam nada no banco — é só
// demonstração pra psicóloga ver como fica pro paciente, sem paciente
// real nessa tela pra vincular o registro.
function PreviewGestaoAnsiedade() {
  const TECNICAS = [{
    id: "resp",
    label: "Respiração Relaxada",
    desc: "Inspirar → Pausar → Expirar por 2 min"
  }, {
    id: "visao",
    label: "Visão Periférica",
    desc: "Mover os olhos da direita para a esquerda"
  }, {
    id: "musc",
    label: "Relaxamento Muscular",
    desc: "Contrair músculos 5s e relaxar com suspiro"
  }];
  const ATIVIDADES = [{
    id: "caminhada",
    label: "🚶 Caminhada"
  }, {
    id: "meditacao",
    label: "🧘 Meditação"
  }, {
    id: "diario",
    label: "📓 Diário"
  }, {
    id: "musica",
    label: "🎵 Música"
  }, {
    id: "alongamento",
    label: "🤸 Alongamento"
  }, {
    id: "agua",
    label: "💧 Hidratação"
  }];
  const PERGUNTAS = ["Qual situação está me deixando ansioso(a)?", "Qual é o meu pensamento ansioso?", "Tenho provas reais de que é 100% verdadeiro?", "Quais evidências indicam que pode NÃO ser verdadeiro?", "Qual a probabilidade real de que o pior aconteça?", "O que eu diria a um amigo com esse mesmo pensamento?", "Existe uma forma mais útil de ver essa situação?", "Preocupar-me está me ajudando ou me machucando?"];
  const DESC_ESTRESSE = {
    1: "Em paz.",
    2: "Otimista.",
    3: "Calmo.",
    4: "Confortável.",
    5: "Neutro.",
    6: "Estressando.",
    7: "Estressado.",
    8: "Irritado.",
    9: "Tenso.",
    10: "Em pânico."
  };
  const [aba, setAba] = useState(0);
  const [stress, setStress] = useState(5);
  const [nota, setNota] = useState("");
  const [track, setTrack] = useState({});
  const [resp, setResp] = useState(Array(8).fill(""));
  const [msg, setMsg] = useState("");
  const corEstresse = stress <= 3 ? "var(--sucesso)" : stress <= 5 ? "#d97706" : stress <= 7 ? "#f97316" : "var(--erro)";
  function confirmar(texto) {
    setMsg("✓ " + texto + " (visualização — nada foi salvo de verdade)");
    setTimeout(() => setMsg(""), 3000);
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "abas-financeiro"
  }, ["😰 Estresse", "✅ Tracking", "🧠 Pensamentos"].map((n, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: "aba-financeiro" + (aba === i ? " aba-financeiro-ativa" : ""),
    onClick: () => setAba(i)
  }, n))), aba === 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 56,
      fontWeight: 900,
      color: corEstresse,
      lineHeight: 1
    }
  }, stress), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--texto-suave)"
    }
  }, "/10"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: corEstresse
    }
  }, DESC_ESTRESSE[stress])), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 1,
    max: 10,
    value: stress,
    onChange: e => setStress(+e.target.value),
    style: {
      width: "100%",
      accentColor: corEstresse,
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 2,
    value: nota,
    onChange: e => setNota(e.target.value),
    placeholder: "Observa\xE7\xF5es..."
  }), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      width: "100%",
      justifyContent: "center",
      marginTop: 12
    },
    onClick: () => {
      setNota("");
      confirmar("Registrado!");
    }
  }, msg || "Registrar")), aba === 1 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13,
      marginBottom: 10,
      color: "var(--cor-marca)"
    }
  }, "T\xE9cnicas Anti-Ansiedade"), TECNICAS.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: "item-selecao-servico" + (track[t.id] ? " item-selecao-ativo" : ""),
    style: {
      marginBottom: 8,
      justifyContent: "flex-start",
      gap: 10
    },
    onClick: () => setTrack(tr => ({
      ...tr,
      [t.id]: !tr[t.id]
    }))
  }, /*#__PURE__*/React.createElement("span", null, track[t.id] ? "✅" : "⭕"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13
    }
  }, t.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--texto-suave)"
    }
  }, t.desc)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13,
      margin: "14px 0 10px",
      color: "var(--cor-marca)"
    }
  }, "Atividades"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, ATIVIDADES.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    className: "item-selecao-servico" + (track[a.id] ? " item-selecao-ativo" : ""),
    style: {
      justifyContent: "center"
    },
    onClick: () => setTrack(tr => ({
      ...tr,
      [a.id]: !tr[a.id]
    }))
  }, a.label))), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      width: "100%",
      justifyContent: "center",
      marginTop: 14
    },
    onClick: () => {
      setTrack({});
      confirmar("Tracking salvo!");
    }
  }, msg || "Salvar tracking do dia")), aba === 2 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio",
    style: {
      marginBottom: 14
    }
  }, "Responda cada pergunta com honestidade para questionar pensamentos ansiosos."), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      display: "block",
      marginBottom: 6
    }
  }, i + 1, ". ", p), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 2,
    value: resp[i],
    onChange: e => {
      const r = [...resp];
      r[i] = e.target.value;
      setResp(r);
    },
    placeholder: "Sua resposta..."
  }))), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      width: "100%",
      justifyContent: "center"
    },
    onClick: () => {
      setResp(Array(8).fill(""));
      confirmar("Salvo!");
    }
  }, msg || "Salvar respostas")));
}

// ─── Preview: Registro ABC de Pensamentos ───────────────────────
// Porta fiel da ferramenta real (clinica/app.js, FerramentaABC): 4
// passos (Situação, Pensamento, Emoção, Resposta Racional) com barra
// de progresso. Aqui não grava nada — mesmo espírito do preview de
// Gestão da Ansiedade acima.
function PreviewFerramentaABC() {
  const EMOCOES = ["Ansiedade", "Tristeza", "Raiva", "Medo", "Vergonha", "Culpa", "Frustração", "Insegurança", "Alívio", "Esperança"];
  const PASSOS_INFO = [{
    n: 1,
    letra: "A",
    titulo: "Situação",
    subtitulo: "O que aconteceu?",
    dica: "Descreva a situação de forma objetiva — onde estava, com quem, o que aconteceu. Sem interpretações ainda.",
    placeholder: "Ex: Meu chefe me chamou para uma conversa inesperada..."
  }, {
    n: 2,
    letra: "B",
    titulo: "Pensamento Automático",
    subtitulo: "O que passou pela sua cabeça?",
    dica: "Escreva exatamente como o pensamento veio à mente, sem filtrar.",
    placeholder: "Ex: Vou ser demitido(a), eu fiz tudo errado..."
  }, {
    n: 3,
    letra: "C",
    titulo: "Emoção e Intensidade",
    subtitulo: "O que você sentiu?",
    dica: "Escolha a emoção mais próxima e avalie a intensidade dela."
  }, {
    n: 4,
    letra: "D",
    titulo: "Resposta Racional",
    subtitulo: "O que a razão diz?",
    dica: "Questione o pensamento: há evidências reais? Existe outra forma de ver essa situação?",
    placeholder: "Ex: Não tenho provas de que serei demitido(a); posso perguntar diretamente..."
  }];
  const [passo, setPasso] = useState(1);
  const [draft, setDraft] = useState({
    situacao: "",
    pensamento: "",
    emocao: "",
    intensidade: 60,
    alternativo: ""
  });
  const [msg, setMsg] = useState("");
  const passoInfo = PASSOS_INFO[passo - 1];
  const podeAvancar = passo === 1 && draft.situacao.trim() || passo === 2 && draft.pensamento.trim() || passo === 3 && draft.emocao || passo === 4 && draft.alternativo.trim();
  function confirmar(texto) {
    setMsg("✓ " + texto + " (visualização — nada foi salvo de verdade)");
  }
  if (passo === 5) {
    return /*#__PURE__*/React.createElement("div", {
      className: "cartao-secao",
      style: {
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "check-circle-2",
      tamanho: 32
    }), /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: "10px 0 4px"
      }
    }, "Registro conclu\xEDdo"), /*#__PURE__*/React.createElement("p", {
      className: "texto-vazio"
    }, msg), /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      style: {
        marginTop: 10
      },
      onClick: () => {
        setDraft({
          situacao: "",
          pensamento: "",
          emocao: "",
          intensidade: 60,
          alternativo: ""
        });
        setPasso(1);
        setMsg("");
      }
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "rotate-ccw",
      tamanho: 14
    }), " Recome\xE7ar"));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 18
    }
  }, PASSOS_INFO.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.n,
    style: {
      flex: 1,
      height: 5,
      borderRadius: 20,
      background: p.n <= passo ? "var(--cor-marca)" : "#EADDFC"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 10,
      background: "#EADDFC",
      color: "var(--cor-marca)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      flexShrink: 0
    }
  }, passoInfo.letra), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, passoInfo.titulo), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--texto-suave)"
    }
  }, passoInfo.subtitulo))), passoInfo.dica && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12.5,
      color: "var(--texto-suave)",
      background: "#F9FAFB",
      borderRadius: 8,
      padding: "8px 10px",
      margin: "10px 0"
    }
  }, passoInfo.dica), passo === 1 && /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 4,
    value: draft.situacao,
    onChange: e => setDraft(d => ({
      ...d,
      situacao: e.target.value
    })),
    placeholder: passoInfo.placeholder
  }), passo === 2 && /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 4,
    value: draft.pensamento,
    onChange: e => setDraft(d => ({
      ...d,
      pensamento: e.target.value
    })),
    placeholder: passoInfo.placeholder
  }), passo === 3 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16
    }
  }, EMOCOES.map(em => /*#__PURE__*/React.createElement("button", {
    key: em,
    type: "button",
    onClick: () => setDraft(d => ({
      ...d,
      emocao: em
    })),
    style: {
      padding: "7px 14px",
      borderRadius: 20,
      border: "1.5px solid",
      borderColor: draft.emocao === em ? "var(--cor-marca)" : "#E5E7EB",
      background: draft.emocao === em ? "var(--cor-marca)" : "white",
      color: draft.emocao === em ? "white" : "#374151",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer"
    }
  }, em))), /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, "Intensidade: ", draft.intensidade, "/100"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 0,
    max: 100,
    value: draft.intensidade,
    onChange: e => setDraft(d => ({
      ...d,
      intensidade: +e.target.value
    })),
    style: {
      width: "100%",
      accentColor: "var(--cor-marca)"
    }
  })), passo === 4 && /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 4,
    value: draft.alternativo,
    onChange: e => setDraft(d => ({
      ...d,
      alternativo: e.target.value
    })),
    placeholder: passoInfo.placeholder
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      flex: 1
    },
    disabled: passo === 1,
    onClick: () => setPasso(p => p - 1)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-left",
    tamanho: 14
  }), " Anterior"), passo < 4 ? /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      flex: 2,
      justifyContent: "center"
    },
    disabled: !podeAvancar,
    onClick: () => setPasso(p => p + 1)
  }, "Pr\xF3ximo ", /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-right",
    tamanho: 14
  })) : /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      flex: 2,
      justifyContent: "center"
    },
    disabled: !podeAvancar,
    onClick: () => {
      confirmar("Registro concluído!");
      setPasso(5);
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "check",
    tamanho: 14
  }), " Salvar registro")));
}

// ─── Preview: Árvore da Decisão ──────────────────────────────────
// Porta fiel da ferramenta real (clinica/app.js, FerramentaArvore):
// árvore de decisão ramificada (cada resposta leva a uma tela
// diferente), não um wizard linear. Sem gravação — só demonstração.
function PreviewFerramentaArvore() {
  const [step, setStep] = useState("home");
  const [preocupacao, setPreocupacao] = useState("");
  const [acoes, setAcoes] = useState("");
  const [plano, setPlano] = useState("");
  const [conclusao, setConclusao] = useState(null);
  const TEXTO_CONCLUSAO = {
    redirect: {
      icone: "wind",
      titulo: "Solte essa preocupação",
      texto: "Isso não está sob seu controle agora. Tente redirecionar sua atenção para algo que você pode influenciar."
    },
    "act-now": {
      icone: "zap",
      titulo: "Ótimo, você pode agir agora",
      texto: "Você já sabe o que fazer — coloque em prática assim que possível."
    },
    plan: {
      icone: "calendar-check",
      titulo: "Você tem um plano",
      texto: "Nem tudo precisa ser resolvido agora. Ter um plano já reduz a ansiedade."
    }
  };
  function concluir(c) {
    setConclusao(c);
    setStep("conclusao");
  }
  function recomecar() {
    setPreocupacao("");
    setAcoes("");
    setPlano("");
    setConclusao(null);
    setStep("home");
  }
  if (step === "conclusao" && conclusao) {
    const info = TEXTO_CONCLUSAO[conclusao];
    return /*#__PURE__*/React.createElement("div", {
      className: "cartao-secao",
      style: {
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: info.icone,
      tamanho: 30
    }), /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: "10px 0 4px"
      }
    }, info.titulo), /*#__PURE__*/React.createElement("p", {
      className: "texto-vazio"
    }, info.texto), /*#__PURE__*/React.createElement("p", {
      className: "texto-vazio",
      style: {
        fontSize: 11
      }
    }, "(visualiza\xE7\xE3o \u2014 nada foi salvo de verdade)"), /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      style: {
        marginTop: 10
      },
      onClick: recomecar
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "rotate-ccw",
      tamanho: 14
    }), " Recome\xE7ar"));
  }
  return /*#__PURE__*/React.createElement("div", null, step === "home" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: 13
    }
  }, "O que est\xE1 te preocupando?"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 3,
    value: preocupacao,
    onChange: e => setPreocupacao(e.target.value),
    placeholder: "Descreva a preocupa\xE7\xE3o..."
  }), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      marginTop: 12,
      justifyContent: "center"
    },
    disabled: !preocupacao.trim(),
    onClick: () => setStep("can-intervene")
  }, "Continuar ", /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-right",
    tamanho: 14
  }))), step === "can-intervene" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      marginBottom: 12
    }
  }, "Voc\xEA pode fazer algo para resolver esta preocupa\xE7\xE3o?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      flex: 1,
      justifyContent: "center"
    },
    onClick: () => setStep("actions")
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "check",
    tamanho: 14
  }), " Sim, posso agir"), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      flex: 1,
      justifyContent: "center"
    },
    onClick: () => concluir("redirect")
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "x",
    tamanho: 14
  }), " N\xE3o est\xE1 no meu controle"))), step === "actions" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: 13
    }
  }, "O que voc\xEA pode fazer a respeito?"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 3,
    value: acoes,
    onChange: e => setAcoes(e.target.value),
    placeholder: "Liste as a\xE7\xF5es poss\xEDveis..."
  }), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      marginTop: 12,
      justifyContent: "center"
    },
    disabled: !acoes.trim(),
    onClick: () => setStep("can-act-now")
  }, "Continuar ", /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-right",
    tamanho: 14
  }))), step === "can-act-now" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      marginBottom: 12
    }
  }, "Voc\xEA pode agir agora mesmo?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      flex: 1,
      justifyContent: "center"
    },
    onClick: () => concluir("act-now")
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "zap",
    tamanho: 14
  }), " Sim, agora"), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      flex: 1,
      justifyContent: "center"
    },
    onClick: () => setStep("plan")
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "calendar",
    tamanho: 14
  }), " Preciso planejar"))), step === "plan" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: 13
    }
  }, "Quando e como voc\xEA vai agir?"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 3,
    value: plano,
    onChange: e => setPlano(e.target.value),
    placeholder: "Ex: Vou conversar com meu chefe na sexta-feira..."
  }), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      marginTop: 12,
      justifyContent: "center"
    },
    disabled: !plano.trim(),
    onClick: () => concluir("plan")
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "check",
    tamanho: 14
  }), " Concluir")));
}

// ─── Preview: Roda da Vida Integral ──────────────────────────────
// Porta fiel de FerramentaRodaVidaIntegral (clinica/app.js): 8
// sliders de 0 a 10 com radar SVG que atualiza em tempo real. Sem
// gravar nada — só demonstração.
function PreviewFerramentaRodaVida() {
  const AREAS = [{
    id: "saude",
    label: "Saúde"
  }, {
    id: "carreira",
    label: "Carreira"
  }, {
    id: "financeiro",
    label: "Finanças"
  }, {
    id: "familia",
    label: "Família"
  }, {
    id: "social",
    label: "Relacionamentos"
  }, {
    id: "espirito",
    label: "Espiritualidade"
  }, {
    id: "lazer",
    label: "Lazer"
  }, {
    id: "pessoal",
    label: "Desenv. Pessoal"
  }];
  const [vals, setVals] = useState({});
  const [msg, setMsg] = useState("");
  function RadarSVG({
    valores
  }) {
    const n = AREAS.length;
    const cx = 140,
      cy = 140,
      r = 110;
    const grades = [2, 4, 6, 8, 10].map(g => {
      const pts = AREAS.map((_, i) => {
        const ang = i / n * 2 * Math.PI - Math.PI / 2;
        return [cx + r * (g / 10) * Math.cos(ang), cy + r * (g / 10) * Math.sin(ang)].join(",");
      }).join(" ");
      return /*#__PURE__*/React.createElement("polygon", {
        key: g,
        points: pts,
        fill: "none",
        stroke: "#E5E7EB",
        strokeWidth: g === 10 ? "1" : "0.5"
      });
    });
    const eixos = AREAS.map((_, i) => {
      const ang = i / n * 2 * Math.PI - Math.PI / 2;
      return /*#__PURE__*/React.createElement("line", {
        key: i,
        x1: cx,
        y1: cy,
        x2: cx + r * Math.cos(ang),
        y2: cy + r * Math.sin(ang),
        stroke: "#E5E7EB",
        strokeWidth: "0.5"
      });
    });
    const pts = AREAS.map((a, i) => {
      const ang = i / n * 2 * Math.PI - Math.PI / 2;
      const v = (valores[a.id] || 0) / 10;
      return [cx + r * v * Math.cos(ang), cy + r * v * Math.sin(ang)].join(",");
    }).join(" ");
    const pontos = AREAS.map((a, i) => {
      const ang = i / n * 2 * Math.PI - Math.PI / 2;
      const v = (valores[a.id] || 0) / 10;
      return {
        x: cx + r * v * Math.cos(ang),
        y: cy + r * v * Math.sin(ang)
      };
    });
    const labels = AREAS.map((a, i) => {
      const ang = i / n * 2 * Math.PI - Math.PI / 2;
      const lx = cx + (r + 22) * Math.cos(ang);
      const ly = cy + (r + 22) * Math.sin(ang);
      return /*#__PURE__*/React.createElement("text", {
        key: i,
        x: lx,
        y: ly,
        textAnchor: "middle",
        dominantBaseline: "middle",
        fontSize: "9",
        fill: "var(--texto-suave)",
        fontWeight: "600"
      }, a.label);
    });
    return /*#__PURE__*/React.createElement("svg", {
      width: "280",
      height: "280",
      viewBox: "0 0 280 280"
    }, grades, eixos, /*#__PURE__*/React.createElement("polygon", {
      points: pts,
      fill: "rgba(123,0,196,0.15)",
      stroke: "var(--cor-marca)",
      strokeWidth: "2"
    }), pontos.map((p, i) => /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: p.x,
      cy: p.y,
      r: "4",
      fill: "var(--cor-marca)"
    })), labels);
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio",
    style: {
      marginBottom: 16,
      background: "#F9F5FF",
      padding: "10px 12px",
      borderRadius: 8
    }
  }, "Avalie sua satisfa\xE7\xE3o em cada \xE1rea de ", /*#__PURE__*/React.createElement("strong", null, "0 a 10"), ". O gr\xE1fico atualiza em tempo real conforme voc\xEA move os controles."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 16
    }
  }, AREAS.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, a.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: "var(--cor-marca)",
      minWidth: 32,
      textAlign: "right"
    }
  }, vals[a.id] || 0, "/10")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 0,
    max: 10,
    step: 1,
    value: vals[a.id] || 0,
    onChange: e => setVals(v => ({
      ...v,
      [a.id]: +e.target.value
    })),
    style: {
      width: "100%",
      accentColor: "var(--cor-marca)"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      margin: "8px 0 16px"
    }
  }, /*#__PURE__*/React.createElement(RadarSVG, {
    valores: vals
  })), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      width: "100%",
      justifyContent: "center"
    },
    onClick: () => setMsg("✓ Roda da Vida salva! (visualização — nada foi salvo de verdade)")
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "save",
    tamanho: 14
  }), " ", msg || "Salvar Roda da Vida"));
}

// ─── Preview: Técnica de Respiração 4-7-8 ───────────────────────
// Porta fiel de FerramentaRespiracao (clinica/app.js). Não grava
// nada — nem a versão real do paciente grava (é só prática guiada).
function PreviewFerramentaRespiracao() {
  const FASES = [{
    label: "Inspire",
    dur: 4,
    cor: "#7B00C4",
    instrucao: "Inspire pelo nariz lentamente..."
  }, {
    label: "Segure",
    dur: 7,
    cor: "#0891b2",
    instrucao: "Segure o ar com calma..."
  }, {
    label: "Expire",
    dur: 8,
    cor: "#059669",
    instrucao: "Expire completamente pela boca..."
  }];
  const TOTAL_CICLOS = 4;
  const [ativo, setAtivo] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [faseIdx, setFaseIdx] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [ciclo, setCiclo] = useState(1);
  const [tempoFase, setTempoFase] = useState(0);
  const timerRef = useRef(null);
  const faseAnterior = useRef(-1);
  function falar(texto) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR";
    u.rate = 0.85;
    const vozes = window.speechSynthesis.getVoices();
    const ptVoz = vozes.find(v => v.lang.startsWith("pt") && v.name.toLowerCase().includes("fem")) || vozes.find(v => v.lang.startsWith("pt")) || vozes[0];
    if (ptVoz) u.voice = ptVoz;
    window.speechSynthesis.speak(u);
  }
  const fase = FASES[faseIdx];
  function iniciar() {
    setAtivo(true);
    setConcluido(false);
    setFaseIdx(0);
    setProgresso(0);
    setCiclo(1);
    setTempoFase(0);
    faseAnterior.current = -1;
    setTimeout(() => falar("Vamos começar. Inspire."), 600);
  }
  function parar() {
    clearInterval(timerRef.current);
    setAtivo(false);
    setFaseIdx(0);
    setProgresso(0);
    setCiclo(1);
    setTempoFase(0);
    window.speechSynthesis && window.speechSynthesis.cancel();
  }
  useEffect(() => {
    if (!ativo) return;
    if (faseAnterior.current !== faseIdx) {
      faseAnterior.current = faseIdx;
      falar(FASES[faseIdx].label);
    }
  }, [ativo, faseIdx]);
  useEffect(() => {
    if (!ativo) return;
    timerRef.current = setInterval(() => {
      setTempoFase(t => {
        const novot = t + 0.1;
        const durFase = FASES[faseIdx].dur;
        if (novot >= durFase) {
          const proxFase = faseIdx + 1;
          if (proxFase >= FASES.length) {
            setCiclo(c => {
              if (c >= TOTAL_CICLOS) {
                clearInterval(timerRef.current);
                setAtivo(false);
                setConcluido(true);
                window.speechSynthesis && window.speechSynthesis.cancel();
                return c;
              }
              setFaseIdx(0);
              setProgresso(0);
              return c + 1;
            });
          } else {
            setFaseIdx(proxFase);
            setProgresso(0);
          }
          return 0;
        }
        setProgresso(novot / durFase * 100);
        return novot;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [ativo, faseIdx]);
  useEffect(() => () => {
    clearInterval(timerRef.current);
    window.speechSynthesis && window.speechSynthesis.cancel();
  }, []);
  const tamanhoCirculo = ativo ? fase.label === "Inspire" ? 130 + progresso * 0.5 : fase.label === "Segure" ? 180 : 180 - progresso * 0.5 : 130;
  if (concluido) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "24px 20px"
      }
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "sparkles",
      tamanho: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 700,
        color: "var(--cor-marca)",
        margin: "10px 0 6px"
      }
    }, "Pr\xE1tica conclu\xEDda!"), /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      style: {
        marginTop: 8
      },
      onClick: iniciar
    }, "Praticar novamente"));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "16px 0"
    }
  }, !ativo ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--texto-suave)",
      marginBottom: 20,
      lineHeight: 1.6
    }
  }, "4 ciclos \xB7 4s inspirar \xB7 7s segurar \xB7 8s expirar"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 130,
      height: 130,
      borderRadius: "50%",
      background: "#EADDFC",
      border: "3px solid var(--cor-marca)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "wind",
    tamanho: 32
  }))), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      justifyContent: "center"
    },
    onClick: iniciar
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "play",
    tamanho: 15
  }), " Iniciar Pr\xE1tica")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 6,
      marginBottom: 16
    }
  }, Array.from({
    length: TOTAL_CICLOS
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: i < ciclo ? "var(--cor-marca)" : "#E5E7EB"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: tamanhoCirculo,
      height: tamanhoCirculo,
      borderRadius: "50%",
      background: fase.cor + "18",
      border: "4px solid " + fase.cor,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.1s linear"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: fase.cor
    }
  }, fase.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: fase.cor
    }
  }, Math.ceil(fase.dur - tempoFase), "s"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--texto-suave)",
      marginBottom: 16,
      fontStyle: "italic"
    }
  }, fase.instrucao), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: parar
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "square",
    tamanho: 13
  }), " Parar")));
}

// ─── Preview: Relaxamento Muscular Progressivo ──────────────────
function PreviewFerramentaRelaxamento() {
  const GRUPOS = [{
    nome: "Pés e panturrilhas",
    instrucao: "Enrole os dedos dos pés para baixo e tensione as panturrilhas."
  }, {
    nome: "Coxas e glúteos",
    instrucao: "Aperte as coxas e os glúteos com força."
  }, {
    nome: "Abdômen",
    instrucao: "Contraia o abdômen como se fosse levar um golpe."
  }, {
    nome: "Mãos e braços",
    instrucao: "Feche as mãos em punho e tensione os braços."
  }, {
    nome: "Ombros",
    instrucao: "Suba os ombros em direção às orelhas."
  }, {
    nome: "Pescoço",
    instrucao: "Incline a cabeça levemente para trás, com cuidado."
  }, {
    nome: "Rosto",
    instrucao: "Franza a testa e aperte os olhos com força."
  }, {
    nome: "Corpo inteiro",
    instrucao: "Tensione o corpo todo ao mesmo tempo, por um instante."
  }];
  const DUR_TENSIONAR = 5,
    DUR_RELAXAR = 8;
  const [ativo, setAtivo] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [grupoIdx, setGrupoIdx] = useState(0);
  const [subfase, setSubfase] = useState("tensionar");
  const [tempo, setTempo] = useState(0);
  const timerRef = useRef(null);
  function iniciar() {
    setAtivo(true);
    setConcluido(false);
    setGrupoIdx(0);
    setSubfase("tensionar");
    setTempo(0);
  }
  function parar() {
    clearInterval(timerRef.current);
    setAtivo(false);
    setGrupoIdx(0);
    setSubfase("tensionar");
    setTempo(0);
  }
  const grupo = GRUPOS[grupoIdx];
  const dur = subfase === "tensionar" ? DUR_TENSIONAR : DUR_RELAXAR;
  useEffect(() => {
    if (!ativo) return;
    timerRef.current = setInterval(() => {
      setTempo(t => {
        const novo = t + 0.1;
        if (novo >= dur) {
          if (subfase === "tensionar") {
            setSubfase("relaxar");
          } else {
            const proxGrupo = grupoIdx + 1;
            if (proxGrupo >= GRUPOS.length) {
              clearInterval(timerRef.current);
              setAtivo(false);
              setConcluido(true);
              return 0;
            }
            setGrupoIdx(proxGrupo);
            setSubfase("tensionar");
          }
          return 0;
        }
        return novo;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [ativo, grupoIdx, subfase]);
  const progresso = tempo / dur * 100;
  const corFase = subfase === "tensionar" ? "#dc2626" : "#059669";
  if (concluido) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "24px 20px"
      }
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "check-circle-2",
      tamanho: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 700,
        margin: "10px 0 6px"
      }
    }, "Relaxamento conclu\xEDdo!"), /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      onClick: iniciar
    }, "Praticar novamente"));
  }
  if (!ativo) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "16px 0"
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 12.5,
        color: "var(--texto-suave)",
        marginBottom: 18,
        lineHeight: 1.6
      }
    }, "Tensione e relaxe cada grupo muscular, um de cada vez, seguindo as instru\xE7\xF5es faladas."), /*#__PURE__*/React.createElement("button", {
      className: "botao-primario",
      style: {
        justifyContent: "center"
      },
      onClick: iniciar
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "play",
      tamanho: 15
    }), " Iniciar"));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "16px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 110,
      height: 110,
      borderRadius: "50%",
      background: "linear-gradient(135deg, " + corFase + ", var(--cor-marca))",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 16px",
      color: "white"
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: subfase === "tensionar" ? "zap" : "feather",
    tamanho: 26
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--texto-suave)"
    }
  }, "Grupo ", grupoIdx + 1, "/", GRUPOS.length), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 4
    }
  }, grupo.nome), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: corFase,
      marginBottom: 8,
      textTransform: "uppercase"
    }
  }, subfase === "tensionar" ? "Tensione" : "Relaxe"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 260,
      margin: "0 auto 16px",
      background: "#F3F4F6",
      borderRadius: 20,
      height: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: progresso + "%",
      height: "100%",
      borderRadius: 20,
      background: corFase,
      transition: "width 0.1s linear"
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: parar
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "square",
    tamanho: 13
  }), " Parar"));
}

// ─── Preview: Rastreamento Emocional da Alimentação ─────────────
function PreviewFerramentaRastreamento() {
  const EMOCOES = ["Ansiedade", "Tédio", "Tristeza", "Raiva", "Solidão", "Estresse", "Cansaço", "Felicidade"];
  const SENSACOES = ["Culpa", "Vergonha", "Alívio", "Indiferença", "Satisfação", "Arrependimento"];
  const [fome, setFome] = useState(5);
  const [emocoes, setEmocoes] = useState([]);
  const [pensamento, setPensamento] = useState("");
  const [comeu, setComeu] = useState("");
  const [alivio, setAlivio] = useState(5);
  const [sensacoes, setSensacoes] = useState([]);
  const [reflexao, setReflexao] = useState("");
  const [msg, setMsg] = useState("");
  function Chips({
    opcoes,
    selecionadas,
    alternar
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6
      }
    }, opcoes.map(o => /*#__PURE__*/React.createElement("button", {
      key: o,
      type: "button",
      onClick: () => alternar(o),
      style: {
        padding: "4px 12px",
        borderRadius: 20,
        border: "1px solid",
        borderColor: selecionadas.includes(o) ? "var(--cor-marca)" : "#E5E7EB",
        background: selecionadas.includes(o) ? "var(--cor-marca)" : "white",
        color: selecionadas.includes(o) ? "white" : "var(--texto-suave)",
        fontSize: 12,
        cursor: "pointer"
      }
    }, o)));
  }
  const corFome = fome <= 3 ? "#059669" : fome <= 6 ? "#d97706" : "#dc2626";
  const corAlivio = alivio <= 3 ? "#059669" : alivio <= 6 ? "#d97706" : "#dc2626";
  return /*#__PURE__*/React.createElement("div", null, [["Nível de Fome Física", fome, setFome, corFome], ["Nível de Alívio após comer", alivio, setAlivio, corAlivio]].map(([lbl, val, set, cor]) => /*#__PURE__*/React.createElement("div", {
    key: lbl,
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, lbl), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: cor
    }
  }, val, "/10")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 0,
    max: 10,
    value: val,
    onChange: e => set(+e.target.value),
    style: {
      width: "100%",
      accentColor: "var(--cor-marca)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: 13,
      display: "block",
      marginBottom: 6
    }
  }, "Emo\xE7\xF5es presentes"), /*#__PURE__*/React.createElement(Chips, {
    opcoes: EMOCOES,
    selecionadas: emocoes,
    alternar: o => setEmocoes(v => v.includes(o) ? v.filter(x => x !== o) : [...v, o])
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: 13,
      display: "block",
      marginBottom: 6
    }
  }, "Pensamento permissivo"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 2,
    value: pensamento,
    onChange: e => setPensamento(e.target.value),
    placeholder: "S\xF3 desta vez... Eu mere\xE7o isso..."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: 13,
      display: "block",
      marginBottom: 6
    }
  }, "O que voc\xEA comeu?"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 2,
    value: comeu,
    onChange: e => setComeu(e.target.value),
    placeholder: "Descreva os alimentos..."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: 13,
      display: "block",
      marginBottom: 8
    }
  }, "Como voc\xEA se sentiu depois?"), /*#__PURE__*/React.createElement(Chips, {
    opcoes: SENSACOES,
    selecionadas: sensacoes,
    alternar: o => setSensacoes(v => v.includes(o) ? v.filter(x => x !== o) : [...v, o])
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: 13,
      display: "block",
      marginBottom: 6
    }
  }, "Reflex\xE3o"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 2,
    value: reflexao,
    onChange: e => setReflexao(e.target.value),
    placeholder: "O que esse epis\xF3dio revela sobre suas necessidades emocionais?"
  })), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      width: "100%",
      justifyContent: "center"
    },
    onClick: () => {
      if (!comeu.trim()) {
        alert("Descreva o que você comeu.");
        return;
      }
      setFome(5);
      setEmocoes([]);
      setPensamento("");
      setComeu("");
      setAlivio(5);
      setSensacoes([]);
      setReflexao("");
      setMsg("✓ Salvo! (visualização — nada foi salvo de verdade)");
      setTimeout(() => setMsg(""), 3000);
    }
  }, msg || "Salvar registro"));
}

// ─── Preview: Treino Neuro-Auditivo ──────────────────────────────
function PreviewFerramentaTreino() {
  const [modulo, setModulo] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [tocando, setTocando] = useState(null);
  const [msg, setMsg] = useState("");
  const ctxRef = useRef(null);
  function getCtx() {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }
  function tocarTom(freq, dur = 1.5, vol = 0.4) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }
  function falar(txt, pitch = 1, rate = 0.9) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "pt-BR";
    u.pitch = pitch;
    u.rate = rate;
    const v = window.speechSynthesis.getVoices().find(x => x.lang.startsWith("pt"));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }
  const MODULOS = [{
    titulo: "Grave / Agudo",
    icone: "music",
    exercicios: [{
      id: "m0e0",
      pergunta: "Ouça e diga: GRAVE ou AGUDO?",
      botao: {
        rotulo: "Tocar",
        acao: () => tocarTom(Math.random() > 0.5 ? 180 : 2200)
      },
      opcoes: ["grave", "agudo"],
      resposta: "grave",
      dica: "Sons graves têm frequência baixa. Sons agudos têm frequência alta."
    }]
  }, {
    titulo: "Vozes",
    icone: "mic",
    exercicios: [{
      id: "m1e0",
      pergunta: "Feminina ou masculina?",
      botao: {
        rotulo: "Ouvir",
        acao: () => falar("Olá, como você está hoje?", 1.4, 0.95)
      },
      opcoes: ["Feminina", "Masculina"],
      resposta: "Feminina",
      dica: "Tom agudo + pitch alto = voz feminina."
    }]
  }, {
    titulo: "Intensidade",
    icone: "volume-2",
    exercicios: [{
      id: "m2e0",
      pergunta: "Qual som tem mais volume?",
      botao: {
        rotulo: "Som Fraco",
        acao: () => tocarTom(440, 1, 0.08)
      },
      botao2: {
        rotulo: "Som Forte",
        acao: () => tocarTom(440, 1, 0.7)
      },
      opcoes: ["Som Fraco", "Som Forte"],
      resposta: "Som Forte",
      dica: "O Som Forte foi tocado com volume muito maior."
    }]
  }, {
    titulo: "Emoções",
    icone: "smile",
    exercicios: [{
      id: "m3e0",
      pergunta: "Que emoção você identifica?",
      botao: {
        rotulo: "Ouvir",
        acao: () => falar("Hoje foi um dia incrível, estou muito feliz!", 1.4, 1.1)
      },
      opcoes: ["Alegria", "Tristeza", "Raiva", "Medo"],
      resposta: "Alegria",
      dica: "Tom agudo, rápido e animado = alegria."
    }]
  }];
  function responder(exId, val, correto) {
    const certo = val === correto;
    setRespostas(r => ({
      ...r,
      [exId]: val
    }));
    setFeedbacks(f => ({
      ...f,
      [exId]: certo
    }));
    if (!respostas[exId]) {
      setTotal(t => t + 1);
      if (certo) setScore(s => s + 1);
    }
  }
  const mod = MODULOS[modulo];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      padding: "8px 12px",
      background: "#EADDFC",
      borderRadius: 8,
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "var(--cor-marca)",
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "trophy",
    tamanho: 14
  }), " ", score, "/", total), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-primario",
    style: {
      padding: "6px 12px",
      fontSize: 12
    },
    onClick: () => {
      if (total === 0) {
        alert("Responda pelo menos um exercício antes de salvar.");
        return;
      }
      setMsg("✓ Resultado salvo! (visualização)");
      setTimeout(() => setMsg(""), 2500);
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "save",
    tamanho: 13
  }), " ", msg || "Salvar resultado")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      overflowX: "auto",
      marginBottom: 16,
      paddingBottom: 4
    }
  }, MODULOS.map((m, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    onClick: () => setModulo(i),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      padding: "6px 12px",
      borderRadius: 20,
      border: "1.5px solid",
      borderColor: modulo === i ? "var(--cor-marca)" : "#E5E7EB",
      background: modulo === i ? "var(--cor-marca)" : "white",
      color: modulo === i ? "white" : "var(--texto-suave)",
      fontSize: 12,
      cursor: "pointer",
      whiteSpace: "nowrap",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: m.icone,
    tamanho: 13
  }), " ", m.titulo))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 14,
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: mod.icone,
    tamanho: 15
  }), " ", mod.titulo), mod.exercicios.map(ex => /*#__PURE__*/React.createElement("div", {
    key: ex.id,
    style: {
      background: "#F9FAFB",
      borderRadius: 12,
      padding: 14,
      marginBottom: 14,
      border: "1px solid #E5E7EB"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13,
      marginBottom: 10
    }
  }, ex.pergunta), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-primario",
    style: {
      fontSize: 12
    },
    onClick: () => {
      setTocando(ex.id);
      ex.botao.acao();
      setTimeout(() => setTocando(null), 2000);
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "play",
    tamanho: 13
  }), " ", tocando === ex.id ? "Tocando..." : ex.botao.rotulo), ex.botao2 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    style: {
      fontSize: 12
    },
    onClick: ex.botao2.acao
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "play",
    tamanho: 13
  }), " ", ex.botao2.rotulo)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 8
    }
  }, ex.opcoes.map((op, oi) => /*#__PURE__*/React.createElement("button", {
    key: oi,
    type: "button",
    onClick: () => responder(ex.id, op, ex.resposta),
    style: {
      padding: "8px 16px",
      borderRadius: 10,
      border: "1.5px solid",
      fontSize: 13,
      cursor: "pointer",
      fontWeight: 500,
      borderColor: respostas[ex.id] === op ? feedbacks[ex.id] ? "#059669" : "#dc2626" : "#E5E7EB",
      background: respostas[ex.id] === op ? feedbacks[ex.id] ? "#D1FAE5" : "#FEE2E2" : "white",
      color: respostas[ex.id] === op ? feedbacks[ex.id] ? "#059669" : "#dc2626" : "#374151"
    }
  }, op))), respostas[ex.id] && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 12px",
      borderRadius: 8,
      background: feedbacks[ex.id] ? "#D1FAE5" : "#FEE2E2",
      fontSize: 12,
      color: feedbacks[ex.id] ? "#059669" : "#dc2626",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: feedbacks[ex.id] ? "check" : "x",
    tamanho: 13
  }), " ", feedbacks[ex.id] ? "Correto! " : "Incorreto. ", ex.dica))));
}

// ─── Preview: Fábula (página por página) ────────────────────────
// Porta fiel do leitor de fábulas real (clinica/app.js, trecho
// "Fábulas com campo paginas"). Passa as páginas uma a uma com barra
// de progresso, mostra a moral e as perguntas de reflexão na última
// página — sem gravar nada de verdade (mesmo motivo do preview de
// Gestão da Ansiedade: não existe paciente real nessa tela).
function PreviewFabula({
  item
}) {
  const paginas = Array.isArray(item.paginas) ? item.paginas : [];
  const perguntas = Array.isArray(item.perguntas) ? item.perguntas : [];
  const [idx, setIdx] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [msg, setMsg] = useState("");
  if (paginas.length === 0) return null;
  const pagina = paginas[idx];
  const textoPagina = typeof pagina === "string" ? pagina : pagina?.texto || "";
  const pct = Math.round((idx + 1) / paginas.length * 100);
  const concluido = idx === paginas.length - 1;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Georgia, serif"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 5,
      background: "var(--marca-plataforma-lavanda)",
      borderRadius: 20,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + "%",
      height: "100%",
      background: "var(--cor-marca)",
      borderRadius: 20,
      transition: "width .4s ease"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--cor-marca)",
      fontWeight: 700,
      flexShrink: 0
    }
  }, idx + 1, "/", paginas.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(145deg, var(--cor-marca-escura), var(--cor-marca))",
      borderRadius: 20,
      padding: "32px 26px",
      minHeight: 170,
      marginBottom: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 18,
      color: "white",
      lineHeight: 1.9,
      textAlign: "center",
      fontStyle: "italic",
      margin: 0
    }
  }, textoPagina)), concluido && item.moral && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("strong", null, "Moral da hist\xF3ria"), /*#__PURE__*/React.createElement("p", {
    className: "texto-visualizar-recurso"
  }, item.moral)), concluido && perguntas.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("strong", null, "\uD83D\uDCAD Para Refletir"), perguntas.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      display: "block",
      marginBottom: 6
    }
  }, i + 1, ". ", p), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 2,
    value: respostas[i] || "",
    onChange: e => setRespostas(r => ({
      ...r,
      [i]: e.target.value
    })),
    placeholder: "Escreva sua reflex\xE3o..."
  }))), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      width: "100%",
      justifyContent: "center",
      marginTop: 12
    },
    onClick: () => {
      setMsg("✓ Reflexões salvas! (visualização — nada foi salvo de verdade)");
      setTimeout(() => setMsg(""), 3000);
    }
  }, msg || "Salvar minhas reflexões")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      flex: 1
    },
    disabled: idx === 0,
    onClick: () => setIdx(i => Math.max(0, i - 1))
  }, "\u2190 Anterior"), !concluido ? /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      flex: 2,
      justifyContent: "center"
    },
    onClick: () => setIdx(i => Math.min(paginas.length - 1, i + 1))
  }, "Pr\xF3xima p\xE1gina \u2192") : /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      flex: 2,
      justifyContent: "center"
    },
    onClick: () => setIdx(0)
  }, "\u2705 Conclu\xEDdo \u2014 Reler")));
}

// ─── Preview: blocos de Psicoeducação ────────────────────────────
// O sistema real tem um "construtor" de conteúdo por blocos (banner,
// texto, card, lista, pergunta, checklist, gráficos...). Aqui cobrimos
// os tipos mais comuns; um tipo ainda não coberto aparece identificado
// em vez de simplesmente sumir, pra ficar claro o que falta portar.
function PreviewBlocosPsicoeducacao({
  item
}) {
  const blocos = Array.isArray(item.blocos) ? item.blocos : [];
  if (blocos.length === 0) return null;
  return /*#__PURE__*/React.createElement("div", null, blocos.map((b, i) => {
    switch (b.tipo) {
      case "banner":
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          style: {
            background: b.cor || "var(--cor-marca)",
            borderRadius: 12,
            padding: 20,
            marginBottom: 14,
            color: "white",
            textAlign: "center"
          }
        }, b.emoji && /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 32,
            marginBottom: 6
          }
        }, b.emoji), /*#__PURE__*/React.createElement("div", {
          style: {
            fontWeight: 700,
            fontSize: 16
          }
        }, b.titulo));
      case "texto":
        return /*#__PURE__*/React.createElement("p", {
          key: i,
          className: "texto-visualizar-recurso",
          style: {
            marginBottom: 14
          }
        }, b.conteudo);
      case "card":
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          className: "cartao-secao",
          style: {
            marginBottom: 12
          }
        }, b.icone && /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 22,
            marginBottom: 4
          }
        }, b.icone), /*#__PURE__*/React.createElement("strong", null, b.titulo), /*#__PURE__*/React.createElement("p", {
          className: "texto-visualizar-recurso"
        }, b.texto));
      case "lista":
        return /*#__PURE__*/React.createElement("ul", {
          key: i,
          style: {
            marginBottom: 14,
            paddingLeft: 20
          }
        }, (b.itens || []).map((it, j) => /*#__PURE__*/React.createElement("li", {
          key: j,
          className: "texto-visualizar-recurso"
        }, it)));
      case "checklist":
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          style: {
            marginBottom: 14
          }
        }, b.titulo && /*#__PURE__*/React.createElement("strong", {
          style: {
            display: "block",
            marginBottom: 8
          }
        }, b.titulo), (b.itens || []).map((it, j) => /*#__PURE__*/React.createElement("div", {
          key: j,
          style: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          disabled: true
        }), " ", /*#__PURE__*/React.createElement("span", {
          className: "texto-visualizar-recurso"
        }, it))));
      case "pergunta":
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          style: {
            marginBottom: 14
          }
        }, /*#__PURE__*/React.createElement("label", {
          style: {
            fontSize: 13,
            fontWeight: 600,
            display: "block",
            marginBottom: 6
          }
        }, b.pergunta), /*#__PURE__*/React.createElement("textarea", {
          className: "campo-descricao",
          rows: 2,
          placeholder: b.placeholder || "Escreva aqui...",
          readOnly: true
        }));
      default:
        return /*#__PURE__*/React.createElement("p", {
          key: i,
          className: "texto-vazio",
          style: {
            marginBottom: 14
          }
        }, "[bloco do tipo \"", b.tipo, "\" ainda n\xE3o tem pr\xE9-visualiza\xE7\xE3o pr\xF3pria]");
    }
  }));
}

// ─── Preview: conteúdo simples em texto ──────────────────────────
// Cobre o formato mais antigo/simples de ferramenta ou psicoeducação:
// só um texto corrido (campo conteudo/passos/texto), com a descrição
// como "objetivo" em destaque quando existir.
// Fallback universal pra qualquer ferramenta sem componente próprio
// ainda — porta fiel do fallback do app de referência (clinica/app.js,
// FerramentaPortal): divide o campo conteudo/passos por linha em
// branco e mostra um "slide" de cada vez, com barra de progresso,
// em vez de despejar tudo como um parágrafo só. É esse fallback que
// cobre a grande maioria das ferramentas do catálogo que ainda não
// ganharam um componente dedicado (Registro ABC, Gestão da Ansiedade
// etc. têm o próprio; todas as outras caem aqui).
function PreviewConteudoTexto({
  item
}) {
  const conteudo = item.conteudo || item.passos || item.texto || "";
  const objetivo = item.objetivo || item.descricao || "";
  const slides = conteudo.split("\n\n").map(p => p.trim()).filter(p => p.length > 2);
  const [idx, setIdx] = useState(0);
  if (slides.length === 0) {
    if (!objetivo) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: "center",
          padding: "32px 20px"
        }
      }, /*#__PURE__*/React.createElement(Icone, {
        nome: "wrench",
        tamanho: 36
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 16,
          fontWeight: 700,
          color: "var(--cor-marca)",
          margin: "10px 0 6px"
        }
      }, "Em desenvolvimento"), /*#__PURE__*/React.createElement("p", {
        className: "texto-vazio",
        style: {
          maxWidth: 280,
          margin: "0 auto"
        }
      }, "Esta ferramenta ainda n\xE3o tem conte\xFAdo cadastrado \u2014 edite o item e preencha o campo Descri\xE7\xE3o."));
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#F3E6FF",
        borderRadius: 10,
        padding: "14px 16px",
        border: "1px solid #EADDFC"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 12,
        color: "var(--cor-marca)",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "target",
      tamanho: 13
    }), " Objetivo"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "#3D006A",
        lineHeight: 1.7
      }
    }, objetivo));
  }
  const atual = slides[idx];
  const linhas = atual.split("\n");
  const titulo = linhas[0];
  const corpo = linhas.slice(1).join("\n").trim();
  const pct = Math.round((idx + 1) / slides.length * 100);
  const concluido = idx === slides.length - 1;
  return /*#__PURE__*/React.createElement("div", null, objetivo && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#F3E6FF",
      borderRadius: 10,
      padding: "14px 16px",
      marginBottom: 20,
      border: "1px solid #EADDFC"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 12,
      color: "var(--cor-marca)",
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "target",
    tamanho: 13
  }), " Objetivo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#3D006A",
      lineHeight: 1.7
    }
  }, objetivo)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--texto-suave)"
    }
  }, idx + 1, " de ", slides.length), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--cor-marca)",
      fontWeight: 700
    }
  }, pct, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: "#F3E6FF",
      borderRadius: 20,
      marginBottom: 20,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + "%",
      height: "100%",
      background: "var(--cor-marca)",
      borderRadius: 20,
      transition: "width .3s"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "white",
      border: "1px solid #EADDFC",
      borderRadius: 16,
      padding: "22px 18px",
      minHeight: 150,
      marginBottom: 20,
      borderLeft: "4px solid var(--cor-marca)"
    }
  }, titulo && /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: "var(--cor-marca)",
      marginBottom: corpo ? 12 : 0,
      lineHeight: 1.5
    }
  }, titulo), corpo && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "#374151",
      lineHeight: 1.8,
      whiteSpace: "pre-wrap"
    }
  }, corpo)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      flex: 1
    },
    disabled: idx === 0,
    onClick: () => setIdx(i => Math.max(0, i - 1))
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-left",
    tamanho: 14
  }), " Anterior"), !concluido ? /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      flex: 2,
      justifyContent: "center"
    },
    onClick: () => setIdx(i => Math.min(slides.length - 1, i + 1))
  }, "Pr\xF3ximo ", /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-right",
    tamanho: 14
  })) : /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      flex: 2,
      justifyContent: "center",
      background: "#059669"
    },
    onClick: () => setIdx(0)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "check-circle-2",
    tamanho: 14
  }), " Conclu\xEDdo \u2014 Recome\xE7ar")));
}