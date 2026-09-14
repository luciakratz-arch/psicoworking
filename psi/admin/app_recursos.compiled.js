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
function FormRecurso({
  colecao,
  item,
  aoFechar
}) {
  const [form, setForm] = useState(item || {
    titulo: "",
    categoria: "",
    descricao: ""
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
  }, "(opcional)")), /*#__PURE__*/React.createElement("textarea", {
    className: "campo-descricao",
    rows: 3,
    value: form.descricao || "",
    onChange: e => setForm({
      ...form,
      descricao: e.target.value
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
  "anxiety-management": PreviewGestaoAnsiedade
};
function VisualizarRecursoModal({
  item,
  aoFechar
}) {
  const cores = corDaCategoria(item.categoria);
  const paginas = Array.isArray(item.paginas) ? item.paginas : [];
  const blocos = Array.isArray(item.blocos) ? item.blocos : [];
  const ComponentePreview = PREVIEWS_INTERATIVOS[item.formularioKey];
  const temConteudoTexto = !!(item.conteudo || item.passos || item.texto);
  const temAlgumPreview = !!ComponentePreview || paginas.length > 0 || blocos.length > 0 || temConteudoTexto;
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
  }, formatarCategoria(item.categoria)), /*#__PURE__*/React.createElement("h3", null, item.titulo || item.nome), item.descricao && !temConteudoTexto && /*#__PURE__*/React.createElement("p", {
    className: "texto-visualizar-recurso"
  }, item.descricao), /*#__PURE__*/React.createElement("div", {
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
  }), !ComponentePreview && paginas.length === 0 && blocos.length === 0 && temConteudoTexto && /*#__PURE__*/React.createElement(PreviewConteudoTexto, {
    item: item
  }), !temAlgumPreview && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Pr\xE9-visualiza\xE7\xE3o interativa completa ainda n\xE3o dispon\xEDvel para esta ferramenta \u2014 s\xF3 os dados cadastrados no cat\xE1logo por enquanto."), /*#__PURE__*/React.createElement("div", {
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
function PreviewConteudoTexto({
  item
}) {
  const conteudo = item.conteudo || item.passos || item.texto || "";
  if (!conteudo) return null;
  return /*#__PURE__*/React.createElement("div", null, item.descricao && /*#__PURE__*/React.createElement("div", {
    className: "aviso-preview-paciente",
    style: {
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("strong", null, "\uD83C\uDFAF Objetivo"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0"
    }
  }, item.descricao)), /*#__PURE__*/React.createElement("p", {
    className: "texto-visualizar-recurso",
    style: {
      whiteSpace: "pre-wrap"
    }
  }, conteudo));
}