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

// Visualização simples do item — como ainda não portamos o conteúdo
// interativo de cada ferramenta (isso mora no Portal do Paciente,
// que é uma etapa futura separada), aqui mostra os dados cadastrados:
// título, categoria e descrição, e no caso das fábulas, a moral e as
// páginas da história (quando existirem).
function VisualizarRecursoModal({
  item,
  aoFechar
}) {
  const cores = corDaCategoria(item.categoria);
  const paginas = Array.isArray(item.paginas) ? item.paginas : [];
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
  }, formatarCategoria(item.categoria)), /*#__PURE__*/React.createElement("h3", null, item.titulo || item.nome), item.descricao && /*#__PURE__*/React.createElement("p", {
    className: "texto-visualizar-recurso"
  }, item.descricao), item.moral && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("strong", null, "Moral da hist\xF3ria"), /*#__PURE__*/React.createElement("p", {
    className: "texto-visualizar-recurso"
  }, item.moral)), paginas.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("strong", null, "P\xE1ginas (", paginas.length, ")"), paginas.map((pag, i) => /*#__PURE__*/React.createElement("p", {
    key: i,
    className: "texto-visualizar-recurso"
  }, typeof pag === "string" ? pag : pag.texto || JSON.stringify(pag)))), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: aoFechar
  }, "Fechar"))));
}