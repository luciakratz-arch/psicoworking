// ═══════════════════════════════════════════════════════════════════
//  MODALIDADES DE ATENDIMENTO E MODELO ABA
//
//  O cadastro do paciente indica a(s) modalidade(s); cada uma abre o seu
//  próprio modelo de prontuário. Pronto: Atendimento clínico (TCC) e ABA.
//  Sem nenhuma marcação, vale "clínico" (como sempre foi).
//
//  ABA = Análise do Comportamento Aplicada (crianças e pessoas neurodivergentes):
//   - Plano de Ensino: alvos de aquisição (habilidades) e de redução (comportamentos)
//     em clinica_aba_planos/{pacienteId};
//   - anotação de sessão em clinica_prontuarios com modelo = "aba" (campo aba);
//   - evolução em gráficos, calculada das próprias anotações.
//  Sigilo igual ao do prontuário: só a psicóloga da clínica.
// ═══════════════════════════════════════════════════════════════════

const MODALIDADES_ATENDIMENTO = [{
  id: "clinico",
  rotulo: "Atendimento clínico (TCC)",
  pronto: true
}, {
  id: "aba",
  rotulo: "ABA",
  pronto: true
}, {
  id: "avaliacao",
  rotulo: "Avaliação psicológica / neuropsicológica",
  pronto: false
}, {
  id: "neuromodulacao",
  rotulo: "Neuromodulação",
  pronto: false
}, {
  id: "musicoterapia",
  rotulo: "Musicoterapia",
  pronto: false
}];
function modalidadesDoPaciente(p) {
  const m = p && Array.isArray(p.modalidades) ? p.modalidades : [];
  return m.length ? m : ["clinico"];
}
const ABA_PROCEDIMENTOS = ["DTT (tentativas discretas)", "NET (ensino naturalístico)", "Pareamento", "Treino de comunicação funcional (FCT)", "Encadeamento", "Modelação / vídeo", "Outro"];
const ABA_AJUDAS = ["Independente", "Dica gestual", "Dica verbal", "Dica modelada", "Ajuda física parcial", "Ajuda física total"];
const ABA_AREAS = ["Comunicação", "Social", "Brincar", "Autocuidado e autonomia", "Imitação", "Acadêmico", "Motor", "Tolerância e regulação", "Outro"];
const ABA_STATUS_ALVO = [{
  id: "aquisicao",
  rotulo: "Em aquisição"
}, {
  id: "mantido",
  rotulo: "Mantido"
}, {
  id: "generalizado",
  rotulo: "Generalizado"
}, {
  id: "dominado",
  rotulo: "Dominado"
}, {
  id: "pausado",
  rotulo: "Pausado"
}];
const ABA_FUNCOES = ["", "Fuga / esquiva", "Atenção", "Acesso a item ou atividade", "Sensorial / automática", "Ainda a investigar"];
const ABA_LOCAIS = [{
  id: "clinica",
  rotulo: "Clínica"
}, {
  id: "domiciliar",
  rotulo: "Domiciliar"
}, {
  id: "escolar",
  rotulo: "Escolar"
}, {
  id: "orientacao_pais",
  rotulo: "Orientação a pais"
}, {
  id: "supervisao",
  rotulo: "Supervisão"
}];
function abaNovoId() {
  return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function abaPct(parte, total) {
  return total > 0 && parte != null && parte !== "" ? Math.round(Number(parte) / Number(total) * 100) : null;
}
function abaNum(v) {
  return v === "" || v == null ? null : Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : null;
}
const ABA_CAMPO = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid var(--borda)",
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "inherit",
  boxSizing: "border-box"
};
const ABA_ROTULO = {
  fontSize: 11,
  fontWeight: 700,
  color: "#6B7280",
  textTransform: "uppercase",
  letterSpacing: ".3px",
  display: "block",
  marginBottom: 4
};

// ─── Plano de Ensino (alvos) ───────────────────────────────────────
function usePlanoABA(usuario, paciente) {
  const [plano, setPlano] = useState(null);
  const [carregado, setCarregado] = useState(false);
  useEffect(() => {
    const unsub = db.collection("clinica_aba_planos").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).onSnapshot(snap => {
      setPlano(snap.docs.length ? {
        id: snap.docs[0].id,
        ...snap.docs[0].data()
      } : null);
      setCarregado(true);
    }, () => setCarregado(true));
    return () => unsub();
  }, [usuario.psiId, paciente.id]);
  return {
    plano,
    carregado
  };
}

// ─── Plano de Tratamento (PEI) ─────────────────────────────────────
// Documento do paciente em ABA: queixas e demandas -> avaliação e linha de base -> metas gerais -> objetivos
// específicos (alvos) -> orientação aos pais -> alta e revisão -> visto da família. Cada objetivo pode ser
// ligado a uma meta (rastreabilidade da avaliação até o objetivo). Fica em clinica_aba_planos/{pacienteId}.
const ABA_REVISOES = ["Mensal", "Bimestral", "Trimestral", "Semestral", "Anual", "Outra"];
const ABA_PARENTESCOS = ["Mãe", "Pai", "Avó / avô", "Responsável legal", "Outro"];
const ABA_ORIGENS = ["Família", "Escola", "Equipe multidisciplinar", "Outra"];
function AbaBloco({
  secao,
  abrirSecao,
  setSecao,
  erro,
  salvando,
  chave,
  titulo,
  descricao,
  inicial,
  vista,
  editor,
  aoSalvar
}) {
  const aberto = secao === chave;
  return /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao",
    style: {
      margin: 0
    }
  }, titulo), !aberto && /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12
    },
    onClick: () => abrirSecao(chave, inicial)
  }, "Editar")), descricao && /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao",
    style: {
      marginBottom: 10
    }
  }, descricao), aberto ? /*#__PURE__*/React.createElement("div", null, editor, erro && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--erro)",
      fontSize: 12.5,
      marginTop: 8
    }
  }, erro), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end",
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: () => setSecao(null)
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    disabled: salvando,
    onClick: aoSalvar
  }, salvando ? "Salvando..." : "Salvar"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.7
    }
  }, vista));
}
function AbaCartaoAlvo({
  a,
  nomeMeta,
  rotuloStatus,
  aoEditar,
  aoPausar,
  aoExcluir
}) {
  const pausado = a.status === "pausado";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--borda)",
      borderRadius: 10,
      padding: "10px 14px",
      opacity: pausado ? 0.6 : 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 10,
      alignItems: "flex-start",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13.5
    }
  }, a.nome), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--texto-suave)",
      marginTop: 2
    }
  }, [a.area, a.procedimento, rotuloStatus(a.status)].filter(Boolean).join(" · ")), a.metaId && nomeMeta(a.metaId) && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "#5B21B6",
      marginTop: 3
    }
  }, "Meta: ", nomeMeta(a.metaId)), a.definicao && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 6,
      color: "#374151",
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Defini\xE7\xE3o:"), " ", a.definicao), a.linhaBase && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 3,
      color: "#374151"
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Linha de base:"), " ", a.linhaBase), a.criterioDominio && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 3,
      color: "#374151"
    }
  }, /*#__PURE__*/React.createElement("strong", null, a.tipo === "reducao" ? "Meta de redução" : "Critério de domínio", ":"), " ", a.criterioDominio), a.reforcadores && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 3,
      color: "#374151"
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Refor\xE7adores:"), " ", a.reforcadores), a.tipo === "reducao" && (a.funcao || a.manejo) && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 3,
      color: "#374151"
    }
  }, a.funcao && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "Fun\xE7\xE3o hipot\xE9tica:"), " ", a.funcao, ". "), a.manejo && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "Manejo:"), " ", a.manejo))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12,
      padding: "5px 10px"
    },
    onClick: aoEditar
  }, "Editar"), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12,
      padding: "5px 10px"
    },
    onClick: aoPausar
  }, pausado ? "Retomar" : "Pausar"), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12,
      padding: "5px 10px"
    },
    onClick: aoExcluir,
    title: "Excluir"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "trash-2",
    tamanho: 13
  })))));
}

// ─── Questionário inicial (entrevista com a família) -> rascunho do plano ───
const ABA_PERGUNTAS_INICIAIS = [{
  id: "motivo",
  rotulo: "O que trouxe a família até aqui? O que mais preocupa?"
}, {
  id: "prioridades",
  rotulo: "O que a família mais gostaria que a criança aprendesse ou fizesse?"
}, {
  id: "comunicacao",
  rotulo: "Comunicação: como a criança pede o que quer? (palavras, frases, gestos, puxar a mão, figuras) Quantas palavras fala?"
}, {
  id: "compreensao",
  rotulo: "Compreensão: segue instruções simples? E de duas etapas?"
}, {
  id: "social",
  rotulo: "Brincar e convívio: como brinca? Interage com outras crianças? De que brinquedos gosta?"
}, {
  id: "autonomia",
  rotulo: "Autonomia: alimentação, banheiro/fralda, vestir, higiene."
}, {
  id: "comportamentos",
  rotulo: "Comportamentos que preocupam: o que faz, quando acontece, o que vem antes e depois, quantas vezes."
}, {
  id: "rotina",
  rotulo: "Rotina e sensorial: mudanças de rotina, sono, alimentação seletiva, sensibilidades."
}, {
  id: "saude",
  rotulo: "Saúde: laudo ou diagnóstico, medicações, outras terapias (fono, TO...)."
}, {
  id: "escola",
  rotulo: "Escola: frequenta? Tem apoio ou mediador? Como se adapta?"
}, {
  id: "gosta",
  rotulo: "Do que a criança gosta (brinquedos, músicas, comidas, atividades): serve como reforçador."
}, {
  id: "familia",
  rotulo: "Quem convive com a criança e como a família pode participar (horários, disponibilidade para orientação)?"
}];
function ModalEntrevistaABA({
  usuario,
  paciente,
  aoFechar,
  aoAplicar
}) {
  const chave = "psw_entrevista_aba_" + paciente.id;
  const inicial = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(chave) || "{}");
    } catch (e) {
      return {};
    }
  })();
  const [respostas, setRespostas] = useState(inicial);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [rascunho, setRascunho] = useState(null);
  const [sel, setSel] = useState({
    queixas: {},
    metas: {},
    objetivos: {}
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(chave, JSON.stringify(respostas));
    } catch (e) {}
  }, [respostas]);
  const idadeTexto = (() => {
    if (!paciente.dataNasc) return "";
    const n = new Date(paciente.dataNasc + "T12:00:00"),
      h = new Date();
    let a = h.getFullYear() - n.getFullYear();
    if (h < new Date(h.getFullYear(), n.getMonth(), n.getDate())) a--;
    return a >= 0 ? a + (a === 1 ? " ano" : " anos") : "";
  })();
  async function gerar() {
    const texto = ABA_PERGUNTAS_INICIAIS.filter(p => (respostas[p.id] || "").trim()).map(p => p.rotulo + "\n" + respostas[p.id].trim()).join("\n\n");
    if (!texto.trim()) {
      setErro("Responda pelo menos algumas perguntas antes de gerar o rascunho.");
      return;
    }
    setGerando(true);
    setErro("");
    try {
      const fn = appAdmin.functions("southamerica-east1").httpsCallable("organizarProntuarioIA");
      const r = await fn({
        modelo: "plano_aba",
        textoBruto: texto,
        pacienteNome: paciente.nome,
        idade: idadeTexto
      });
      const p = r.data.plano || {
        queixas: [],
        metas: [],
        objetivos: [],
        orientacaoPais: "",
        lacunas: []
      };
      setRascunho(p);
      const marcar = lista => Object.fromEntries(lista.map((_, i) => [i, true]));
      setSel({
        queixas: marcar(p.queixas),
        metas: marcar(p.metas),
        objetivos: marcar(p.objetivos)
      });
    } catch (e) {
      setErro("Erro ao gerar: " + e.message);
    } finally {
      setGerando(false);
    }
  }
  function aplicar() {
    const escolha = {
      queixas: rascunho.queixas.map((q, i) => ({
        ...q,
        idx: i
      })).filter((q, i) => sel.queixas[i]),
      metas: rascunho.metas.map((m, i) => ({
        ...m,
        idx: i
      })).filter((m, i) => sel.metas[i]),
      objetivos: rascunho.objetivos.map(a => ({
        ...a
      })).filter((a, i) => sel.objetivos[i]),
      orientacaoPais: rascunho.orientacaoPais || ""
    };
    if (!escolha.queixas.length && !escolha.metas.length && !escolha.objetivos.length) {
      setErro("Marque pelo menos um item para levar ao plano.");
      return;
    }
    try {
      sessionStorage.removeItem(chave);
    } catch (e) {}
    aoAplicar(escolha, respostas);
  }
  const caixa = (grupo, i, rotulo, sub) => /*#__PURE__*/React.createElement("label", {
    key: grupo + i,
    style: {
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      padding: "6px 0",
      margin: 0,
      fontSize: 13,
      lineHeight: 1.5,
      cursor: "pointer",
      textTransform: "none",
      fontWeight: 400,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: !!sel[grupo][i],
    onChange: e => setSel(s => ({
      ...s,
      [grupo]: {
        ...s[grupo],
        [i]: e.target.checked
      }
    })),
    style: {
      marginTop: 3,
      width: 18,
      height: 18,
      flex: "none",
      padding: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: "left"
    }
  }, rotulo, sub && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 11.5,
      color: "var(--texto-suave)"
    }
  }, sub)));
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-largo",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0
    }
  }, "Question\xE1rio inicial \u2014 Plano ABA"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 4
    },
    onClick: aoFechar
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "x",
    tamanho: 18
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--texto-suave)",
      marginBottom: 12
    }
  }, paciente.nome, idadeTexto ? " · " + idadeTexto : ""), !rascunho ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "#374151",
      marginTop: 0
    }
  }, "Converse com a fam\xEDlia e registre as respostas (pode ditar). Responda o que souber: n\xE3o precisa preencher tudo. Depois a IA prop\xF5e um ", /*#__PURE__*/React.createElement("strong", null, "rascunho"), " de queixas, metas e objetivos, e voc\xEA escolhe o que entra no plano."), ABA_PERGUNTAS_INICIAIS.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      ...ABA_ROTULO,
      textTransform: "none",
      fontSize: 12.5
    }
  }, p.rotulo), /*#__PURE__*/React.createElement(TextAreaVoz, {
    rows: 2,
    value: respostas[p.id] || "",
    onChange: e => setRespostas(r => ({
      ...r,
      [p.id]: e.target.value
    }))
  }))), /*#__PURE__*/React.createElement(AvisoPlanoIA, {
    usuario: usuario
  }), erro && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--erro)",
      fontSize: 13,
      margin: "8px 0"
    }
  }, erro), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end",
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: aoFechar
  }, "Fechar (as respostas ficam guardadas nesta aba)"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: gerar,
    disabled: gerando
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "sparkles",
    tamanho: 14
  }), " ", gerando ? "Gerando o rascunho..." : "Gerar rascunho do plano com IA"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FFFBEB",
      border: "1px solid #FCD34D",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 12.5,
      color: "#78350F",
      marginBottom: 12
    }
  }, "Este \xE9 um ", /*#__PURE__*/React.createElement("strong", null, "rascunho"), ", montado s\xF3 com o que a fam\xEDlia respondeu. Desmarque o que n\xE3o quiser, e depois ajuste cada item no plano. A linha de base e o crit\xE9rio de dom\xEDnio ficam para voc\xEA definir na avalia\xE7\xE3o."), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 13
    }
  }, "Queixas e demandas"), rascunho.queixas.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma.") : rascunho.queixas.map((q, i) => caixa("queixas", i, q.texto, q.origem)), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 13,
      display: "block",
      marginTop: 12
    }
  }, "Metas gerais"), rascunho.metas.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma.") : rascunho.metas.map((m, i) => caixa("metas", i, m.texto, m.queixaIndex != null && rascunho.queixas[m.queixaIndex] ? "Ligada à queixa: " + rascunho.queixas[m.queixaIndex].texto.slice(0, 70) : "")), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 13,
      display: "block",
      marginTop: 12
    }
  }, "Objetivos espec\xEDficos"), rascunho.objetivos.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhum.") : rascunho.objetivos.map((a, i) => caixa("objetivos", i, (a.tipo === "reducao" ? "[Reduzir] " : "[Ensinar] ") + a.nome, [a.area, a.definicao].filter(Boolean).join(" · "))), rascunho.lacunas.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      border: "1px solid #DDD6FE",
      background: "#F5F3FF",
      borderRadius: 10,
      padding: "10px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 12.5,
      color: "#4C1D95",
      marginBottom: 4
    }
  }, "Vale esclarecer com a fam\xEDlia"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingLeft: 18,
      fontSize: 12.5,
      lineHeight: 1.7
    }
  }, rascunho.lacunas.map((q, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, q)))), erro && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--erro)",
      fontSize: 13,
      margin: "8px 0"
    }
  }, erro), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end",
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: () => setRascunho(null)
  }, "Voltar \xE0s respostas"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: aplicar
  }, "Levar os itens marcados ao plano")))));
}
function AbaPlanoABA({
  usuario,
  paciente
}) {
  const {
    plano,
    carregado
  } = usePlanoABA(usuario, paciente);
  const cfg = useConfigProntuario(usuario.psiId);
  const P = plano || {};
  const alvos = Array.isArray(P.alvos) ? P.alvos : [];
  const queixas = Array.isArray(P.queixas) ? P.queixas : [];
  const metas = Array.isArray(P.metas) ? P.metas : [];
  const ident = P.identificacao || {};
  const aval = P.avaliacao || {};
  const rev = P.revisao || {};
  const cons = P.consentimento || {};
  const hoje = prontHojeISO();
  const [secao, setSecao] = useState(null);
  const [form, setForm] = useState({});
  const [editando, setEditando] = useState(null);
  const [verDoc, setVerDoc] = useState(false);
  const [entrevistaAberta, setEntrevistaAberta] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // Grava uma parte do plano. Se a família já deu o visto e o conteúdo mudou, marca o visto como desatualizado.
  async function salvarPlano(parcial, conteudo = true) {
    setSalvando(true);
    setErro("");
    try {
      const extra = conteudo && cons.visto ? {
        consentimento: {
          ...cons,
          desatualizado: true
        }
      } : {};
      await db.collection("clinica_aba_planos").doc(paciente.id).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        ...parcial,
        ...extra,
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      }, {
        merge: true
      });
      setSecao(null);
      setEditando(null);
    } catch (e) {
      setErro("Não foi possível salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  // Leva ao plano os itens do rascunho marcados pela psicóloga, SOMANDO ao que já existe.
  function aplicarEntrevista(escolha, respostasEntrevista) {
    const idQueixa = {};
    const novasQueixas = escolha.queixas.map(q => {
      const id = abaNovoId();
      idQueixa[q.idx] = id;
      return {
        id,
        texto: q.texto,
        origem: q.origem || "Família"
      };
    });
    const idMeta = {};
    const novasMetas = escolha.metas.map(m => {
      const id = abaNovoId();
      idMeta[m.idx] = id;
      return {
        id,
        texto: m.texto,
        queixaId: m.queixaIndex != null && idQueixa[m.queixaIndex] || ""
      };
    });
    const novosAlvos = escolha.objetivos.map(a => ({
      id: abaNovoId(),
      tipo: a.tipo,
      nome: a.nome,
      area: a.area || "",
      metaId: a.metaIndex != null && idMeta[a.metaIndex] || "",
      definicao: a.definicao || "",
      linhaBase: "",
      criterioDominio: "",
      procedimento: a.procedimento || "",
      reforcadores: a.tipo === "reducao" ? "" : a.reforcadores || "",
      funcao: a.funcao || "",
      manejo: "",
      status: "aquisicao",
      inicio: hoje
    }));
    salvarPlano({
      queixas: [...queixas, ...novasQueixas],
      metas: [...metas, ...novasMetas],
      alvos: [...alvos, ...novosAlvos],
      entrevista: {
        respostas: respostasEntrevista,
        em: hoje
      },
      ...(!P.orientacaoPais && escolha.orientacaoPais ? {
        orientacaoPais: escolha.orientacaoPais
      } : {})
    }).then(() => setEntrevistaAberta(false));
  }
  function abrirSecao(chave, inicial) {
    setErro("");
    setForm(inicial);
    setSecao(chave);
  }
  const campo = k => e => setForm(f => ({
    ...f,
    [k]: e.target.value
  }));

  // ── objetivos (alvos) ──
  function novo(tipo) {
    setErro("");
    setEditando({
      id: null,
      tipo,
      nome: "",
      area: "",
      metaId: "",
      definicao: "",
      linhaBase: "",
      criterioDominio: "",
      procedimento: "",
      reforcadores: "",
      funcao: "",
      manejo: "",
      status: "aquisicao",
      inicio: hoje
    });
  }
  function salvarAlvo() {
    const a = editando;
    if (!a.nome.trim()) {
      setErro("Dê um nome ao objetivo.");
      return;
    }
    if (a.tipo === "reducao" && !a.definicao.trim()) {
      setErro("Para comportamentos a reduzir, escreva a definição operacional (como o comportamento se apresenta, de forma observável).");
      return;
    }
    const limpo = {
      ...a,
      nome: a.nome.trim(),
      definicao: a.definicao.trim(),
      id: a.id || abaNovoId()
    };
    salvarPlano({
      alvos: a.id ? alvos.map(x => x.id === a.id ? limpo : x) : [...alvos, limpo]
    });
  }
  function alternarPausa(a) {
    salvarPlano({
      alvos: alvos.map(x => x.id === a.id ? {
        ...x,
        status: x.status === "pausado" ? "aquisicao" : "pausado"
      } : x)
    });
  }
  function excluirAlvo(a) {
    if (!confirm("Excluir \"" + a.nome + "\" do plano? As anotações de sessões já feitas continuam guardadas.")) return;
    salvarPlano({
      alvos: alvos.filter(x => x.id !== a.id)
    });
  }

  // ── listas editáveis (queixas e metas) ──
  const mudarItem = (chave, i, parte) => setForm(f => ({
    ...f,
    [chave]: f[chave].map((x, j) => j === i ? {
      ...x,
      ...parte
    } : x)
  }));
  const tirarItem = (chave, i) => setForm(f => ({
    ...f,
    [chave]: f[chave].filter((_, j) => j !== i)
  }));
  const rotuloStatus = id => (ABA_STATUS_ALVO.find(s => s.id === id) || {}).rotulo || "";
  const nomeMeta = id => (metas.find(m => m.id === id) || {}).texto || "";
  const vazio = /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#9CA3AF",
      fontStyle: "italic"
    }
  }, "Ainda n\xE3o preenchido.");
  const verTexto = t => t && String(t).trim() ? /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: "pre-wrap"
    }
  }, t) : vazio;
  const aquisicao = alvos.filter(a => a.tipo !== "reducao");
  const reducao = alvos.filter(a => a.tipo === "reducao");
  const revisaoVencida = rev.proxima && rev.proxima < hoje;
  const revisaoProxima = rev.proxima && !revisaoVencida && rev.proxima <= new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
  if (!carregado) return /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Carregando...");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao",
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao",
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "target",
    tamanho: 16
  }), " Plano de Tratamento (PEI)"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao",
    style: {
      margin: "4px 0 0"
    }
  }, "Do que a fam\xEDlia traz at\xE9 os objetivos de cada sess\xE3o. Os objetivos alimentam as anota\xE7\xF5es e os gr\xE1ficos de evolu\xE7\xE3o.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: () => setEntrevistaAberta(true)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "sparkles",
    tamanho: 14
  }), " Question\xE1rio inicial (gerar plano)"), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: () => setVerDoc(true)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "file-text",
    tamanho: 14
  }), " Ver documento / imprimir"))), revisaoVencida && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FEF2F2",
      border: "1px solid #FCA5A5",
      color: "#991B1B",
      borderRadius: 10,
      padding: "10px 14px",
      marginBottom: 12,
      fontSize: 13
    }
  }, "A revis\xE3o deste plano estava prevista para ", prontDataBR(rev.proxima), ". Atualize o plano e a data da pr\xF3xima revis\xE3o."), revisaoProxima && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FFFBEB",
      border: "1px solid #FCD34D",
      color: "#92400E",
      borderRadius: 10,
      padding: "10px 14px",
      marginBottom: 12,
      fontSize: 13
    }
  }, "A revis\xE3o deste plano est\xE1 prevista para ", prontDataBR(rev.proxima), "."), cons.visto && cons.desatualizado && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FFFBEB",
      border: "1px solid #FCD34D",
      color: "#92400E",
      borderRadius: 10,
      padding: "10px 14px",
      marginBottom: 12,
      fontSize: 13
    }
  }, "O plano foi alterado depois do \xFAltimo visto da fam\xEDlia (", prontDataBR(cons.vistoEm), "). Apresente as mudan\xE7as e registre um novo visto."), /*#__PURE__*/React.createElement(AbaBloco, {
    secao: secao,
    abrirSecao: abrirSecao,
    setSecao: setSecao,
    erro: erro,
    salvando: salvando,
    chave: "ident",
    titulo: "1. Identifica\xE7\xE3o e carga hor\xE1ria",
    inicial: {
      equipe: ident.equipe || "",
      cargaHoraria: ident.cargaHoraria || "",
      modalidades: ident.modalidades || [],
      inicio: ident.inicio || ""
    },
    vista: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Equipe:"), " ", verTexto(ident.equipe)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Carga hor\xE1ria semanal:"), " ", ident.cargaHoraria ? ident.cargaHoraria + " h" : vazio, " \xB7 ", /*#__PURE__*/React.createElement("strong", null, "Modalidades:"), " ", (ident.modalidades || []).length ? (ident.modalidades || []).join(", ") : vazio), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "In\xEDcio do plano:"), " ", ident.inicio ? prontDataBR(ident.inicio) : vazio)),
    editor: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Equipe (psic\xF3loga, AT, supervis\xE3o, outros profissionais)"), /*#__PURE__*/React.createElement("input", {
      style: ABA_CAMPO,
      value: form.equipe || "",
      onChange: campo("equipe")
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 10,
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Carga hor\xE1ria semanal (h)"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      style: ABA_CAMPO,
      value: form.cargaHoraria || "",
      onChange: campo("cargaHoraria")
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "In\xEDcio do plano"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      style: ABA_CAMPO,
      value: form.inicio || "",
      onChange: campo("inicio")
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Onde o atendimento acontece"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, ["Clínica", "Domiciliar", "Escolar", "Orientação a pais"].map(m => {
      const marcada = (form.modalidades || []).includes(m);
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        key: m,
        className: "pill-status" + (marcada ? " pill-status-ativa" : ""),
        style: {
          "--cor-pill": "var(--cor-marca)"
        },
        onClick: () => setForm(f => ({
          ...f,
          modalidades: marcada ? f.modalidades.filter(x => x !== m) : [...(f.modalidades || []), m]
        }))
      }, m);
    })))),
    aoSalvar: () => salvarPlano({
      identificacao: {
        equipe: (form.equipe || "").trim(),
        cargaHoraria: form.cargaHoraria || "",
        modalidades: form.modalidades || [],
        inicio: form.inicio || ""
      }
    })
  }), /*#__PURE__*/React.createElement(AbaBloco, {
    secao: secao,
    abrirSecao: abrirSecao,
    setSecao: setSecao,
    erro: erro,
    salvando: salvando,
    chave: "queixas",
    titulo: "2. Queixas e demandas",
    descricao: "O que a fam\xEDlia (e a escola) trouxe. Cada queixa pode ter metas ligadas a ela.",
    inicial: {
      lista: queixas.map(q => ({
        ...q
      }))
    },
    vista: queixas.length ? /*#__PURE__*/React.createElement("ul", {
      style: {
        margin: 0,
        paddingLeft: 18
      }
    }, queixas.map(q => /*#__PURE__*/React.createElement("li", {
      key: q.id
    }, q.texto, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--texto-suave)",
        fontSize: 11.5
      }
    }, "(", q.origem || "Família", ")")))) : vazio,
    editor: /*#__PURE__*/React.createElement("div", null, (form.lista || []).map((q, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 8,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(TextAreaVoz, {
      rows: 2,
      value: q.texto,
      onChange: e => setForm(f => ({
        ...f,
        lista: f.lista.map((x, j) => j === i ? {
          ...x,
          texto: e.target.value
        } : x)
      })),
      placeholder: "Ex.: N\xE3o pede o que quer; s\xF3 puxa a m\xE3o do adulto."
    })), /*#__PURE__*/React.createElement("select", {
      style: {
        ...ABA_CAMPO,
        width: 150
      },
      value: q.origem || "Família",
      onChange: e => setForm(f => ({
        ...f,
        lista: f.lista.map((x, j) => j === i ? {
          ...x,
          origem: e.target.value
        } : x)
      }))
    }, ABA_ORIGENS.map(o => /*#__PURE__*/React.createElement("option", {
      key: o
    }, o))), /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      style: {
        padding: "6px 8px"
      },
      onClick: () => setForm(f => ({
        ...f,
        lista: f.lista.filter((_, j) => j !== i)
      }))
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "trash-2",
      tamanho: 13
    })))), /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      style: {
        fontSize: 12
      },
      onClick: () => setForm(f => ({
        ...f,
        lista: [...(f.lista || []), {
          id: abaNovoId(),
          texto: "",
          origem: "Família"
        }]
      }))
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "plus",
      tamanho: 13
    }), " Nova queixa")),
    aoSalvar: () => salvarPlano({
      queixas: (form.lista || []).filter(q => (q.texto || "").trim()).map(q => ({
        ...q,
        texto: q.texto.trim()
      }))
    })
  }), /*#__PURE__*/React.createElement(AbaBloco, {
    secao: secao,
    abrirSecao: abrirSecao,
    setSecao: setSecao,
    erro: erro,
    salvando: salvando,
    chave: "avaliacao",
    titulo: "3. Avalia\xE7\xE3o e linha de base",
    descricao: "Instrumentos aplicados (por exemplo VB-MAPP, ABLLS-R, AFLS, PEAK), o que mostraram e a an\xE1lise funcional inicial.",
    inicial: {
      instrumentos: aval.instrumentos || "",
      resultados: aval.resultados || "",
      analiseFuncional: aval.analiseFuncional || "",
      linhaBase: aval.linhaBase || ""
    },
    vista: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Instrumentos:"), " ", verTexto(aval.instrumentos)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Resultados:"), " ", verTexto(aval.resultados)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("strong", null, "An\xE1lise funcional inicial:"), " ", verTexto(aval.analiseFuncional)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Linha de base:"), " ", verTexto(aval.linhaBase))),
    editor: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Instrumentos aplicados"), /*#__PURE__*/React.createElement(TextAreaVoz, {
      rows: 2,
      value: form.instrumentos || "",
      onChange: campo("instrumentos")
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Resultados"), /*#__PURE__*/React.createElement(TextAreaVoz, {
      rows: 3,
      value: form.resultados || "",
      onChange: campo("resultados")
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "An\xE1lise funcional inicial (antecedente, comportamento, consequ\xEAncia)"), /*#__PURE__*/React.createElement(TextAreaVoz, {
      rows: 3,
      value: form.analiseFuncional || "",
      onChange: campo("analiseFuncional")
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Linha de base (como estava antes da interven\xE7\xE3o)"), /*#__PURE__*/React.createElement(TextAreaVoz, {
      rows: 3,
      value: form.linhaBase || "",
      onChange: campo("linhaBase")
    }))),
    aoSalvar: () => salvarPlano({
      avaliacao: {
        instrumentos: (form.instrumentos || "").trim(),
        resultados: (form.resultados || "").trim(),
        analiseFuncional: (form.analiseFuncional || "").trim(),
        linhaBase: (form.linhaBase || "").trim()
      }
    })
  }), /*#__PURE__*/React.createElement(AbaBloco, {
    secao: secao,
    abrirSecao: abrirSecao,
    setSecao: setSecao,
    erro: erro,
    salvando: salvando,
    chave: "metas",
    titulo: "4. Metas gerais (longo prazo)",
    descricao: "Aonde se quer chegar. Cada meta pode vir de uma queixa.",
    inicial: {
      lista: metas.map(m => ({
        ...m
      }))
    },
    vista: metas.length ? /*#__PURE__*/React.createElement("ul", {
      style: {
        margin: 0,
        paddingLeft: 18
      }
    }, metas.map(m => /*#__PURE__*/React.createElement("li", {
      key: m.id
    }, m.texto, m.queixaId && (queixas.find(q => q.id === m.queixaId) || {}).texto ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--texto-suave)",
        fontSize: 11.5
      }
    }, " (queixa: ", (queixas.find(q => q.id === m.queixaId) || {}).texto.slice(0, 60), ")") : null))) : vazio,
    editor: /*#__PURE__*/React.createElement("div", null, (form.lista || []).map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 8,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(TextAreaVoz, {
      rows: 2,
      value: m.texto,
      onChange: e => setForm(f => ({
        ...f,
        lista: f.lista.map((x, j) => j === i ? {
          ...x,
          texto: e.target.value
        } : x)
      })),
      placeholder: "Ex.: Comunicar o que deseja de forma funcional, sem depender de gestos."
    })), /*#__PURE__*/React.createElement("select", {
      style: {
        ...ABA_CAMPO,
        width: 180
      },
      value: m.queixaId || "",
      onChange: e => setForm(f => ({
        ...f,
        lista: f.lista.map((x, j) => j === i ? {
          ...x,
          queixaId: e.target.value
        } : x)
      }))
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Queixa ligada..."), queixas.map(q => /*#__PURE__*/React.createElement("option", {
      key: q.id,
      value: q.id
    }, q.texto.slice(0, 40)))), /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      style: {
        padding: "6px 8px"
      },
      onClick: () => setForm(f => ({
        ...f,
        lista: f.lista.filter((_, j) => j !== i)
      }))
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "trash-2",
      tamanho: 13
    })))), /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      style: {
        fontSize: 12
      },
      onClick: () => setForm(f => ({
        ...f,
        lista: [...(f.lista || []), {
          id: abaNovoId(),
          texto: "",
          queixaId: ""
        }]
      }))
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "plus",
      tamanho: 13
    }), " Nova meta")),
    aoSalvar: () => salvarPlano({
      metas: (form.lista || []).filter(m => (m.texto || "").trim()).map(m => ({
        ...m,
        texto: m.texto.trim()
      }))
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, "5. Objetivos espec\xEDficos"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, "Habilidades a ensinar e comportamentos a reduzir. Cada um pode ser ligado a uma meta, com linha de base e crit\xE9rio de dom\xEDnio."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 13
    }
  }, "Habilidades a ensinar (aquisi\xE7\xE3o)"), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12
    },
    onClick: () => novo("aquisicao")
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "plus",
    tamanho: 13
  }), " Novo objetivo")), aquisicao.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma habilidade cadastrada ainda.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, aquisicao.map(a => /*#__PURE__*/React.createElement(AbaCartaoAlvo, {
    key: a.id,
    a: a,
    nomeMeta: nomeMeta,
    rotuloStatus: rotuloStatus,
    aoEditar: () => {
      setErro("");
      setEditando({
        ...a
      });
    },
    aoPausar: () => alternarPausa(a),
    aoExcluir: () => excluirAlvo(a)
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 13
    }
  }, "Comportamentos a reduzir (comportamentos-barreira)"), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12
    },
    onClick: () => novo("reducao")
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "plus",
    tamanho: 13
  }), " Novo comportamento")), reducao.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhum comportamento cadastrado ainda.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, reducao.map(a => /*#__PURE__*/React.createElement(AbaCartaoAlvo, {
    key: a.id,
    a: a,
    nomeMeta: nomeMeta,
    rotuloStatus: rotuloStatus,
    aoEditar: () => {
      setErro("");
      setEditando({
        ...a
      });
    },
    aoPausar: () => alternarPausa(a),
    aoExcluir: () => excluirAlvo(a)
  }))))), /*#__PURE__*/React.createElement(AbaBloco, {
    secao: secao,
    abrirSecao: abrirSecao,
    setSecao: setSecao,
    erro: erro,
    salvando: salvando,
    chave: "orient",
    titulo: "6. Orienta\xE7\xE3o aos pais, generaliza\xE7\xE3o e manuten\xE7\xE3o",
    inicial: {
      orientacaoPais: P.orientacaoPais || "",
      generalizacao: P.generalizacao || ""
    },
    vista: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Orienta\xE7\xE3o / treino de pais (metas da fam\xEDlia):"), " ", verTexto(P.orientacaoPais)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Generaliza\xE7\xE3o e manuten\xE7\xE3o:"), " ", verTexto(P.generalizacao))),
    editor: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Orienta\xE7\xE3o / treino de pais e cuidadores (metas pactuadas com a fam\xEDlia)"), /*#__PURE__*/React.createElement(TextAreaVoz, {
      rows: 3,
      value: form.orientacaoPais || "",
      onChange: campo("orientacaoPais")
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Generaliza\xE7\xE3o e manuten\xE7\xE3o (outros ambientes, pessoas e materiais)"), /*#__PURE__*/React.createElement(TextAreaVoz, {
      rows: 3,
      value: form.generalizacao || "",
      onChange: campo("generalizacao")
    }))),
    aoSalvar: () => salvarPlano({
      orientacaoPais: (form.orientacaoPais || "").trim(),
      generalizacao: (form.generalizacao || "").trim()
    })
  }), /*#__PURE__*/React.createElement(AbaBloco, {
    secao: secao,
    abrirSecao: abrirSecao,
    setSecao: setSecao,
    erro: erro,
    salvando: salvando,
    chave: "alta",
    titulo: "7. Crit\xE9rios de alta e revis\xE3o do plano",
    inicial: {
      criteriosAlta: P.criteriosAlta || "",
      periodicidade: rev.periodicidade || "",
      proxima: rev.proxima || "",
      observacao: rev.observacao || ""
    },
    vista: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Crit\xE9rios de alta ou encaminhamento:"), " ", verTexto(P.criteriosAlta)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Revis\xE3o:"), " ", rev.periodicidade ? rev.periodicidade : vazio, rev.proxima ? " · próxima em " + prontDataBR(rev.proxima) : "", rev.observacao ? " · " + rev.observacao : "")),
    editor: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Crit\xE9rios de alta ou encaminhamento"), /*#__PURE__*/React.createElement(TextAreaVoz, {
      rows: 3,
      value: form.criteriosAlta || "",
      onChange: campo("criteriosAlta")
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 10,
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Periodicidade da revis\xE3o (a seu crit\xE9rio)"), /*#__PURE__*/React.createElement("select", {
      style: ABA_CAMPO,
      value: form.periodicidade || "",
      onChange: campo("periodicidade")
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Selecione"), ABA_REVISOES.map(r => /*#__PURE__*/React.createElement("option", {
      key: r
    }, r)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Data da pr\xF3xima revis\xE3o"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      style: ABA_CAMPO,
      value: form.proxima || "",
      onChange: campo("proxima")
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Observa\xE7\xE3o sobre a revis\xE3o (opcional)"), /*#__PURE__*/React.createElement("input", {
      style: ABA_CAMPO,
      value: form.observacao || "",
      onChange: campo("observacao")
    }))),
    aoSalvar: () => salvarPlano({
      criteriosAlta: (form.criteriosAlta || "").trim(),
      revisao: {
        periodicidade: form.periodicidade || "",
        proxima: form.proxima || "",
        observacao: (form.observacao || "").trim()
      }
    })
  }), /*#__PURE__*/React.createElement(AbaBloco, {
    secao: secao,
    abrirSecao: abrirSecao,
    setSecao: setSecao,
    erro: erro,
    salvando: salvando,
    chave: "visto",
    titulo: "8. Visto da fam\xEDlia",
    descricao: "Registro de que o plano foi apresentado e explicado ao respons\xE1vel. Na impress\xE3o h\xE1 espa\xE7o para a assinatura.",
    inicial: {
      vistoPor: cons.vistoPor || "",
      parentesco: cons.parentesco || "",
      vistoEm: cons.vistoEm || hoje,
      ciente: !!cons.visto
    },
    vista: cons.visto ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: cons.desatualizado ? "#92400E" : "#065F46",
        fontWeight: 600
      }
    }, cons.desatualizado ? "Visto desatualizado. " : "Visto registrado. ", cons.vistoPor, cons.parentesco ? " (" + cons.parentesco + ")" : "", " em ", prontDataBR(cons.vistoEm)) : vazio,
    editor: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 10,
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Nome do respons\xE1vel"), /*#__PURE__*/React.createElement("input", {
      style: ABA_CAMPO,
      value: form.vistoPor || "",
      onChange: campo("vistoPor")
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Parentesco"), /*#__PURE__*/React.createElement("select", {
      style: ABA_CAMPO,
      value: form.parentesco || "",
      onChange: campo("parentesco")
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Selecione"), ABA_PARENTESCOS.map(p => /*#__PURE__*/React.createElement("option", {
      key: p
    }, p)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Data do visto"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      style: ABA_CAMPO,
      value: form.vistoEm || "",
      onChange: campo("vistoEm")
    }))), /*#__PURE__*/React.createElement("label", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: !!form.ciente,
      onChange: e => setForm(f => ({
        ...f,
        ciente: e.target.checked
      })),
      style: {
        marginTop: 3
      }
    }), " O respons\xE1vel declarou estar ciente do plano de tratamento, de seus objetivos e dos procedimentos, e concordou com ele.")),
    aoSalvar: () => {
      if (form.ciente && !(form.vistoPor || "").trim()) {
        setErro("Informe o nome do responsável.");
        return;
      }
      salvarPlano({
        consentimento: form.ciente ? {
          visto: true,
          vistoPor: form.vistoPor.trim(),
          parentesco: form.parentesco || "",
          vistoEm: form.vistoEm || hoje,
          desatualizado: false
        } : {
          visto: false
        }
      }, false);
    }
  }), editando && /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: () => setEditando(null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-largo",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      marginTop: 0
    }
  }, editando.id ? "Editar objetivo" : editando.tipo === "reducao" ? "Novo comportamento a reduzir" : "Novo objetivo de aquisição"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Nome"), /*#__PURE__*/React.createElement("input", {
    style: ABA_CAMPO,
    value: editando.nome,
    onChange: e => setEditando({
      ...editando,
      nome: e.target.value
    }),
    placeholder: editando.tipo === "reducao" ? "Ex.: Choro e esquiva de tarefa" : "Ex.: Mando por água (vocal)"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Meta geral ligada"), /*#__PURE__*/React.createElement("select", {
    style: ABA_CAMPO,
    value: editando.metaId || "",
    onChange: e => setEditando({
      ...editando,
      metaId: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Sem meta ligada"), metas.map(m => /*#__PURE__*/React.createElement("option", {
    key: m.id,
    value: m.id
  }, m.texto.slice(0, 70))))), editando.tipo !== "reducao" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10,
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "\xC1rea"), /*#__PURE__*/React.createElement("select", {
    style: ABA_CAMPO,
    value: editando.area,
    onChange: e => setEditando({
      ...editando,
      area: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione"), ABA_AREAS.map(x => /*#__PURE__*/React.createElement("option", {
    key: x
  }, x)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Procedimento"), /*#__PURE__*/React.createElement("select", {
    style: ABA_CAMPO,
    value: editando.procedimento,
    onChange: e => setEditando({
      ...editando,
      procedimento: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione"), ABA_PROCEDIMENTOS.map(x => /*#__PURE__*/React.createElement("option", {
    key: x
  }, x)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Situa\xE7\xE3o"), /*#__PURE__*/React.createElement("select", {
    style: ABA_CAMPO,
    value: editando.status,
    onChange: e => setEditando({
      ...editando,
      status: e.target.value
    })
  }, ABA_STATUS_ALVO.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.rotulo))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, editando.tipo === "reducao" ? "Definição operacional (como o comportamento se apresenta, de forma observável)" : "Descrição do objetivo"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    rows: 2,
    value: editando.definicao,
    onChange: e => setEditando({
      ...editando,
      definicao: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10,
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Linha de base"), /*#__PURE__*/React.createElement("input", {
    style: ABA_CAMPO,
    value: editando.linhaBase || "",
    onChange: e => setEditando({
      ...editando,
      linhaBase: e.target.value
    }),
    placeholder: editando.tipo === "reducao" ? "Ex.: 9 ocorrências por sessão" : "Ex.: 20% independente"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, editando.tipo === "reducao" ? "Meta de redução" : "Critério de domínio"), /*#__PURE__*/React.createElement("input", {
    style: ABA_CAMPO,
    value: editando.criterioDominio || "",
    onChange: e => setEditando({
      ...editando,
      criterioDominio: e.target.value
    }),
    placeholder: editando.tipo === "reducao" ? "Ex.: até 2 ocorrências por sessão" : "Ex.: 80% independente em 3 sessões"
  }))), editando.tipo !== "reducao" ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Refor\xE7adores"), /*#__PURE__*/React.createElement("input", {
    style: ABA_CAMPO,
    value: editando.reforcadores || "",
    onChange: e => setEditando({
      ...editando,
      reforcadores: e.target.value
    })
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10,
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Fun\xE7\xE3o hipot\xE9tica"), /*#__PURE__*/React.createElement("select", {
    style: ABA_CAMPO,
    value: editando.funcao || "",
    onChange: e => setEditando({
      ...editando,
      funcao: e.target.value
    })
  }, ABA_FUNCOES.map(x => /*#__PURE__*/React.createElement("option", {
    key: x,
    value: x
  }, x || "-")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Plano de manejo"), /*#__PURE__*/React.createElement("input", {
    style: ABA_CAMPO,
    value: editando.manejo || "",
    onChange: e => setEditando({
      ...editando,
      manejo: e.target.value
    })
  })))), erro && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--erro)",
      fontSize: 12.5,
      marginTop: 8
    }
  }, erro), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end",
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: () => setEditando(null)
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: salvarAlvo,
    disabled: salvando
  }, salvando ? "Salvando..." : "Salvar")))), entrevistaAberta && /*#__PURE__*/React.createElement(ModalEntrevistaABA, {
    usuario: usuario,
    paciente: paciente,
    aoFechar: () => setEntrevistaAberta(false),
    aoAplicar: aplicarEntrevista
  }), verDoc && /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: () => setVerDoc(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-largo",
    onClick: e => e.stopPropagation(),
    style: {
      maxWidth: 780
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 12,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0
    }
  }, "Plano de Tratamento (PEI)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: () => prontImprimir("doc-plano-aba", "Plano de Tratamento ABA - " + paciente.nome)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "printer",
    tamanho: 14
  }), " Imprimir / PDF"), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: () => setVerDoc(false)
  }, "Fechar"))), /*#__PURE__*/React.createElement(DocumentoTimbrado, {
    id: "doc-plano-aba",
    cfg: cfg,
    titulo: "Plano de Tratamento (PEI) \u2014 ABA",
    subtitulo: paciente.nome + " · emitido em " + prontDataExtenso(hoje)
  }, /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "1. Identifica\xE7\xE3o e carga hor\xE1ria",
    cor: cfg.corPrimaria || "#6A2BD9"
  }, "Equipe: " + (ident.equipe || "—") + "\nCarga horária semanal: " + (ident.cargaHoraria ? ident.cargaHoraria + " h" : "—") + " · Modalidades: " + ((ident.modalidades || []).join(", ") || "—") + "\nInício: " + (ident.inicio ? prontDataBR(ident.inicio) : "—")), /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "2. Queixas e demandas",
    cor: cfg.corPrimaria || "#6A2BD9"
  }, queixas.length ? queixas.map((q, i) => i + 1 + ". " + q.texto + " (" + (q.origem || "Família") + ")").join("\n") : "—"), /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "3. Avalia\xE7\xE3o e linha de base",
    cor: cfg.corPrimaria || "#6A2BD9"
  }, "Instrumentos: " + (aval.instrumentos || "—") + "\nResultados: " + (aval.resultados || "—") + "\nAnálise funcional inicial: " + (aval.analiseFuncional || "—") + "\nLinha de base: " + (aval.linhaBase || "—")), /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "4. Metas gerais",
    cor: cfg.corPrimaria || "#6A2BD9"
  }, metas.length ? metas.map((m, i) => i + 1 + ". " + m.texto).join("\n") : "—"), /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "5. Objetivos espec\xEDficos",
    cor: cfg.corPrimaria || "#6A2BD9"
  }, alvos.length ? alvos.map((a, i) => i + 1 + ". " + (a.tipo === "reducao" ? "[Reduzir] " : "[Ensinar] ") + a.nome + (nomeMeta(a.metaId) ? "\n   Meta: " + nomeMeta(a.metaId) : "") + (a.definicao ? "\n   Definição: " + a.definicao : "") + (a.linhaBase ? "\n   Linha de base: " + a.linhaBase : "") + (a.criterioDominio ? "\n   " + (a.tipo === "reducao" ? "Meta de redução: " : "Critério de domínio: ") + a.criterioDominio : "") + (a.procedimento ? "\n   Procedimento: " + a.procedimento : "") + (a.reforcadores ? "\n   Reforçadores: " + a.reforcadores : "") + (a.funcao ? "\n   Função hipotética: " + a.funcao : "") + (a.manejo ? "\n   Manejo: " + a.manejo : "")).join("\n\n") : "—"), /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "6. Orienta\xE7\xE3o aos pais, generaliza\xE7\xE3o e manuten\xE7\xE3o",
    cor: cfg.corPrimaria || "#6A2BD9"
  }, "Orientação / treino de pais: " + (P.orientacaoPais || "—") + "\nGeneralização e manutenção: " + (P.generalizacao || "—")), /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "7. Crit\xE9rios de alta e revis\xE3o",
    cor: cfg.corPrimaria || "#6A2BD9"
  }, "Critérios de alta ou encaminhamento: " + (P.criteriosAlta || "—") + "\nRevisão: " + (rev.periodicidade || "—") + (rev.proxima ? " · próxima em " + prontDataBR(rev.proxima) : "") + (rev.observacao ? " · " + rev.observacao : "")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 6
    }
  }, "Declaro estar ciente do plano de tratamento acima, de seus objetivos e dos procedimentos, e concordo com ele."), cons.visto && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, "Visto registrado no sistema: ", cons.vistoPor, cons.parentesco ? " (" + cons.parentesco + ")" : "", ", em ", prontDataBR(cons.vistoEm), "."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 30,
      marginTop: 36,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 220,
      borderTop: "1px solid #6B7280",
      paddingTop: 4,
      textAlign: "center"
    }
  }, "Respons\xE1vel pelo paciente (visto)"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 140,
      borderTop: "1px solid #6B7280",
      paddingTop: 4,
      textAlign: "center"
    }
  }, "Data")))))));
}

// ─── Gráfico simples de linha (0 a 100% ou contagem) ───────────────
function AbaGrafico({
  pontos,
  maximo,
  sufixo,
  cor
}) {
  if (!pontos.length) return /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Ainda n\xE3o h\xE1 dados para este item.");
  const L = 560,
    A = 150,
    ml = 34,
    mb = 22,
    mt = 10,
    mr = 10;
  const max = maximo || Math.max(1, ...pontos.map(p => p.valor));
  const x = i => ml + (pontos.length === 1 ? (L - ml - mr) / 2 : i * (L - ml - mr) / (pontos.length - 1));
  const y = v => mt + (A - mt - mb) * (1 - v / max);
  const linha = pontos.map((p, i) => x(i) + "," + y(p.valor)).join(" ");
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 " + L + " " + A,
    style: {
      width: "100%",
      maxWidth: 620,
      display: "block"
    }
  }, [0, 0.5, 1].map(f => /*#__PURE__*/React.createElement("g", {
    key: f
  }, /*#__PURE__*/React.createElement("line", {
    x1: ml,
    x2: L - mr,
    y1: y(max * f),
    y2: y(max * f),
    stroke: "#E5E7EB"
  }), /*#__PURE__*/React.createElement("text", {
    x: ml - 6,
    y: y(max * f) + 3,
    fontSize: "10",
    fill: "#6B7280",
    textAnchor: "end"
  }, Math.round(max * f), sufixo))), /*#__PURE__*/React.createElement("polyline", {
    points: linha,
    fill: "none",
    stroke: cor,
    strokeWidth: "2.5"
  }), pontos.map((p, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("circle", {
    cx: x(i),
    cy: y(p.valor),
    r: "4",
    fill: cor
  }), /*#__PURE__*/React.createElement("text", {
    x: x(i),
    y: A - 6,
    fontSize: "9.5",
    fill: "#6B7280",
    textAnchor: "middle"
  }, dataBr(p.data).slice(0, 5)), /*#__PURE__*/React.createElement("text", {
    x: x(i),
    y: y(p.valor) - 8,
    fontSize: "10",
    fill: "#374151",
    textAnchor: "middle"
  }, p.valor, sufixo))));
}
function AbaPainelEvolucao({
  notas,
  alvosPlano
}) {
  const ordenadas = [...notas].sort((a, b) => (a.data || "").localeCompare(b.data || ""));
  const [escolha, setEscolha] = useState("");
  // itens possíveis: alvos e comportamentos do plano + os que aparecem nas anotações
  const itens = [];
  const jaTem = chave => itens.some(i => i.chave === chave);
  alvosPlano.forEach(a => itens.push({
    chave: "id:" + a.id,
    rotulo: (a.tipo === "reducao" ? "Comportamento: " : "Alvo: ") + a.nome,
    tipo: a.tipo === "reducao" ? "comp" : "alvo",
    id: a.id,
    nome: a.nome
  }));
  ordenadas.forEach(n => {
    (n.aba && n.aba.alvos || []).forEach(a => {
      if (!a.alvoId && a.nome && !jaTem("nome:" + a.nome)) itens.push({
        chave: "nome:" + a.nome,
        rotulo: "Alvo: " + a.nome,
        tipo: "alvo",
        id: "",
        nome: a.nome
      });
    });
    (n.aba && n.aba.comportamentos || []).forEach(c => {
      if (c.nome && !jaTem("nome:" + c.nome) && !alvosPlano.some(p => p.nome === c.nome)) itens.push({
        chave: "nome:" + c.nome,
        rotulo: "Comportamento: " + c.nome,
        tipo: "comp",
        id: "",
        nome: c.nome
      });
    });
  });
  if (!itens.length) return null;
  const atual = itens.find(i => i.chave === escolha) || itens[0];
  const pontos = [];
  ordenadas.forEach(n => {
    const aba = n.aba || {};
    if (atual.tipo === "alvo") {
      const a = (aba.alvos || []).find(x => atual.id && x.alvoId === atual.id || !atual.id && x.nome === atual.nome || x.nome === atual.nome);
      if (!a) return;
      const p = abaPct(a.acertosIndependentes, a.tentativas);
      if (p != null) pontos.push({
        data: n.data,
        valor: p
      });
    } else {
      const c = (aba.comportamentos || []).find(x => x.nome === atual.nome);
      if (c && c.ocorrencias != null) pontos.push({
        data: n.data,
        valor: c.ocorrencias
      });
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "trending-up",
    tamanho: 16
  }), " Evolu\xE7\xE3o"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, "Alvos: porcentagem de respostas independentes por sess\xE3o. Comportamentos: n\xFAmero de ocorr\xEAncias por sess\xE3o."), /*#__PURE__*/React.createElement("select", {
    className: "campo-select",
    value: atual.chave,
    onChange: e => setEscolha(e.target.value),
    style: {
      marginBottom: 12,
      maxWidth: "100%"
    }
  }, itens.map(i => /*#__PURE__*/React.createElement("option", {
    key: i.chave,
    value: i.chave
  }, i.rotulo))), /*#__PURE__*/React.createElement(AbaGrafico, {
    pontos: pontos,
    maximo: atual.tipo === "alvo" ? 100 : null,
    sufixo: atual.tipo === "alvo" ? "%" : "",
    cor: atual.tipo === "alvo" ? "#0E9F6E" : "#DC2626"
  }));
}

// ─── Aba "Sessões ABA" ─────────────────────────────────────────────
function AbaSessoesABA({
  usuario,
  paciente
}) {
  const [sessoes, setSessoes] = useState([]);
  const [notas, setNotas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modal, setModal] = useState(null);
  const {
    plano
  } = usePlanoABA(usuario, paciente);
  const alvosPlano = plano && Array.isArray(plano.alvos) ? plano.alvos : [];
  useEffect(() => {
    const unsubS = db.collection("clinica_sessoes").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).onSnapshot(snap => {
      const l = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      l.sort((a, b) => (b.data || "").localeCompare(a.data || ""));
      setSessoes(l);
      setCarregando(false);
    }, () => setCarregando(false));
    const unsubN = db.collection("clinica_prontuarios").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).onSnapshot(snap => setNotas(snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })).filter(n => n.modelo === "aba")), () => {});
    return () => {
      unsubS();
      unsubN();
    };
  }, [usuario.psiId, paciente.id]);
  const idsSessoes = new Set(sessoes.map(s => s.id));
  const avulsas = notas.filter(n => !idsSessoes.has(n.sessaoId)).sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  const fmt = iso => iso ? new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }) : "Data não definida";
  function abrirNova() {
    setModal({
      sessao: {
        id: "avulsa:" + Date.now().toString(36),
        data: prontHojeISO(),
        horario: "",
        pacoteId: null,
        origem: "avulsa",
        avulsa: true
      },
      nota: null
    });
  }
  const linha = (chave, titulo, subtitulo, nota, aoAbrir) => /*#__PURE__*/React.createElement("div", {
    key: chave,
    style: {
      border: "1px solid var(--borda)",
      borderRadius: 10,
      padding: "12px 14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13
    }
  }, titulo), subtitulo && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--texto-suave)",
      marginTop: 2
    }
  }, subtitulo), nota && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--sucesso)",
      marginTop: 3,
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "check-circle",
    tamanho: 12
  }), " Anota\xE7\xE3o registrada")), /*#__PURE__*/React.createElement("button", {
    className: nota ? "botao-secundario" : "botao-primario",
    style: {
      fontSize: 12,
      padding: "6px 14px"
    },
    onClick: aoAbrir
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: nota ? "eye" : "notebook-pen",
    tamanho: 13
  }), " ", nota ? "Ver / Editar" : "Anotar"));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(AbaPainelEvolucao, {
    notas: notas,
    alvosPlano: alvosPlano
  }), /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "notebook-pen",
    tamanho: 16
  }), " Anota\xE7\xF5es de Sess\xE3o ABA"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, "Registre alvos, tentativas e comportamentos de cada sess\xE3o. Dite ou escreva e pe\xE7a para a IA organizar; os gr\xE1ficos de evolu\xE7\xE3o se montam sozinhos."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: abrirNova
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "plus",
    tamanho: 14
  }), " Nova anota\xE7\xE3o (sem sess\xE3o na agenda)")), carregando ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Carregando sess\xF5es...") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, sessoes.map(s => {
    const nota = notas.find(n => n.sessaoId === s.id) || null;
    return linha(s.id, fmt(s.data) + (s.horario || s.hora ? " · " + (s.horario || s.hora) : ""), [s.modalidade, s.status].filter(Boolean).join(" · "), nota, () => setModal({
      sessao: s,
      nota
    }));
  }), avulsas.map(n => linha(n.id, fmt(n.data), "Anotação avulsa", n, () => setModal({
    sessao: {
      id: n.sessaoId,
      data: n.data,
      horario: n.horario || "",
      pacoteId: n.pacoteId || null,
      origem: n.origem || "avulsa",
      avulsa: String(n.sessaoId).startsWith("avulsa:")
    },
    nota: n
  }))), sessoes.length === 0 && avulsas.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma sess\xE3o ou anota\xE7\xE3o ainda. Use \"Nova anota\xE7\xE3o\" para come\xE7ar."))), modal && /*#__PURE__*/React.createElement(ModalAnotacaoABA, {
    usuario: usuario,
    paciente: paciente,
    sessao: modal.sessao,
    notaExistente: modal.nota,
    alvosPlano: alvosPlano,
    aoFechar: () => setModal(null)
  }));
}

// ─── Janela da anotação de sessão ABA ──────────────────────────────
const ABA_VAZIO = {
  modalidadeAtendimento: "clinica",
  participantes: "",
  estadoGeral: "",
  alvos: [],
  comportamentos: [],
  reforcadores: "",
  orientacaoPais: "",
  generalizacao: "",
  observacoes: ""
};
function ModalAnotacaoABA({
  usuario,
  paciente,
  sessao,
  notaExistente,
  alvosPlano,
  aoFechar
}) {
  const [textoBruto, setTextoBruto] = useState(notaExistente?.textoBruto || "");
  const [aba, setAba] = useState({
    ...ABA_VAZIO,
    ...(notaExistente?.aba || {})
  });
  const [dataSessao, setDataSessao] = useState(sessao.data || prontHojeISO());
  const [horario, setHorario] = useState(notaExistente?.horario || sessao.horario || sessao.hora || "");
  const [duracaoMin, setDuracaoMin] = useState(notaExistente?.duracaoMin ?? (sessao.duracao && Number(sessao.duracao) > 0 ? Number(sessao.duracao) : ""));
  const [organizando, setOrganizando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvoAuto, setSalvoAuto] = useState(false);
  const [erro, setErro] = useState("");
  const [perguntas, setPerguntas] = useState([]);
  const [respostas, setRespostas] = useState({});
  const notaIdRef = useRef(notaExistente?.id || null);
  const filaRef = useRef(Promise.resolve());
  const temConteudo = () => textoBruto.trim() || aba.estadoGeral || aba.alvos.length || aba.comportamentos.length || aba.observacoes;
  function persistir(textoAtual, abaAtual) {
    // Fila: dois salvamentos seguidos não podem criar duas anotações.
    filaRef.current = filaRef.current.then(async () => {
      const dados = {
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        sessaoId: sessao.id,
        pacoteId: sessao.pacoteId || null,
        origem: sessao.origem || null,
        data: dataSessao || null,
        horario: horario || "",
        duracaoMin: abaNum(duracaoMin),
        modelo: "aba",
        textoBruto: textoAtual,
        aba: abaAtual,
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      };
      if (notaIdRef.current) {
        await db.collection("clinica_prontuarios").doc(notaIdRef.current).update(dados);
      } else {
        const ref = await db.collection("clinica_prontuarios").add({
          ...dados,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
        notaIdRef.current = ref.id;
      }
    });
    return filaRef.current;
  }

  // Salvamento automático alguns segundos depois de parar de digitar.
  const primeiraRef = useRef(true);
  useEffect(() => {
    if (primeiraRef.current) {
      primeiraRef.current = false;
      return;
    }
    if (!temConteudo()) return;
    setSalvoAuto(false);
    const t = setTimeout(() => {
      persistir(textoBruto, aba).then(() => setSalvoAuto(true)).catch(() => {});
    }, 3500);
    return () => clearTimeout(t);
  }, [textoBruto, aba, dataSessao, horario, duracaoMin]);

  // Junta as respostas às anotações e pede para a IA organizar tudo de novo.
  function completarComRespostas() {
    const linhas = perguntas.map((q, i) => (respostas[i] || "").trim() ? "- " + q + " " + respostas[i].trim() : "").filter(Boolean);
    if (!linhas.length) {
      setErro("Responda pelo menos uma pergunta para completar.");
      return;
    }
    const novoTexto = (textoBruto.trim() ? textoBruto.trim() + "\n\n" : "") + "Respostas complementares:\n" + linhas.join("\n");
    setTextoBruto(novoTexto);
    organizarComIA(novoTexto);
  }
  function atualizar(parte) {
    setAba(a => ({
      ...a,
      ...parte
    }));
  }
  function mudarLinha(campo, i, parte) {
    setAba(a => ({
      ...a,
      [campo]: a[campo].map((x, j) => j === i ? {
        ...x,
        ...parte
      } : x)
    }));
  }
  function removerLinha(campo, i) {
    setAba(a => ({
      ...a,
      [campo]: a[campo].filter((_, j) => j !== i)
    }));
  }
  function adicionarAlvoDoPlano(id) {
    const p = alvosPlano.find(x => x.id === id);
    if (!p) return;
    if (p.tipo === "reducao") {
      setAba(a => ({
        ...a,
        comportamentos: [...a.comportamentos, {
          nome: p.nome,
          ocorrencias: null,
          duracaoMinutos: null,
          antecedente: "",
          consequencia: "",
          funcao: "",
          manejo: ""
        }]
      }));
    } else {
      setAba(a => ({
        ...a,
        alvos: [...a.alvos, {
          alvoId: p.id,
          nome: p.nome,
          procedimento: p.procedimento || "",
          ajuda: "",
          tentativas: null,
          acertosIndependentes: null,
          acertosComAjuda: null,
          observacao: ""
        }]
      }));
    }
  }
  async function organizarComIA(textoExtra) {
    const textoUsado = typeof textoExtra === "string" ? textoExtra : textoBruto;
    if (!textoUsado.trim()) {
      setErro("Dite ou escreva as anotações antes de organizar.");
      return;
    }
    setOrganizando(true);
    setErro("");
    try {
      const fn = appAdmin.functions("southamerica-east1").httpsCallable("organizarProntuarioIA");
      const r = await fn({
        modelo: "aba",
        textoBruto: textoUsado,
        pacienteNome: paciente.nome,
        dataSessao,
        alvos: alvosPlano.map(a => ({
          id: a.id,
          tipo: a.tipo,
          nome: a.nome
        }))
      });
      const {
        perguntas: qs,
        ...recebido
      } = r.data.aba || {};
      setPerguntas(Array.isArray(qs) ? qs : []);
      setRespostas({});
      const novo = {
        ...ABA_VAZIO,
        ...recebido
      };
      if (!novo.modalidadeAtendimento) novo.modalidadeAtendimento = aba.modalidadeAtendimento || "clinica";
      setAba(novo);
      await persistir(textoUsado, novo);
      setSalvoAuto(true);
    } catch (e) {
      setErro("Erro ao organizar: " + e.message);
    } finally {
      setOrganizando(false);
    }
  }
  async function salvar() {
    if (!temConteudo()) {
      setErro("Registre alguma informação antes de salvar.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await persistir(textoBruto, aba);
      aoFechar();
    } catch (e) {
      setErro("Erro ao salvar: " + e.message);
      setSalvando(false);
    }
  }
  function tentarFechar() {
    if (temConteudo() && !salvoAuto && !confirm("Há alterações que ainda não foram salvas. Fechar mesmo assim?")) return;
    aoFechar();
  }
  const cx = {
    display: "grid",
    gap: 10
  };
  const idsUsados = new Set([...aba.alvos.map(a => a.alvoId), ...aba.comportamentos.map(c => c.nome)]);
  const disponiveis = alvosPlano.filter(p => p.status !== "pausado" && !idsUsados.has(p.tipo === "reducao" ? p.nome : p.id));
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-largo",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0
    }
  }, "Anota\xE7\xE3o de Sess\xE3o ABA"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 4
    },
    onClick: tentarFechar
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "x",
    tamanho: 18
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--texto-suave)",
      marginBottom: 10
    }
  }, paciente.nome), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cx,
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Data"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    style: ABA_CAMPO,
    value: dataSessao,
    onChange: e => setDataSessao(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Hor\xE1rio"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    style: ABA_CAMPO,
    value: horario,
    onChange: e => setHorario(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Dura\xE7\xE3o (min)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    style: ABA_CAMPO,
    value: duracaoMin,
    onChange: e => setDuracaoMin(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Local / modalidade"), /*#__PURE__*/React.createElement("select", {
    style: ABA_CAMPO,
    value: aba.modalidadeAtendimento,
    onChange: e => atualizar({
      modalidadeAtendimento: e.target.value
    })
  }, ABA_LOCAIS.map(l => /*#__PURE__*/React.createElement("option", {
    key: l.id,
    value: l.id
  }, l.rotulo))))), /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Anota\xE7\xF5es da sess\xE3o (dite ou escreva livremente)"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: textoBruto,
    onChange: e => setTextoBruto(e.target.value),
    rows: 6,
    placeholder: "Ex.: Mando de \xE1gua em DTT, 10 tentativas, 8 independentes e 2 com dica verbal. Choro e esquiva 5 vezes no pareamento visual..."
  }), !textoBruto.trim() && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#F5F3FF",
      border: "1px solid #DDD6FE",
      borderRadius: 10,
      padding: "10px 14px",
      marginTop: 10,
      fontSize: 12.5,
      lineHeight: 1.7,
      color: "#4C1D95"
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Roteiro r\xE1pido do que falar:"), " como a crian\xE7a chegou; quais alvos voc\xEA trabalhou", alvosPlano.filter(a => a.tipo !== "reducao" && a.status !== "pausado").length ? " (" + alvosPlano.filter(a => a.tipo !== "reducao" && a.status !== "pausado").slice(0, 4).map(a => a.nome).join(", ") + ")" : "", " com tentativas e acertos (com e sem ajuda); se houve comportamento-problema, quantas vezes, o que veio antes e depois e o que voc\xEA fez; refor\xE7adores; orienta\xE7\xE3o aos pais; o que fica para a pr\xF3xima sess\xE3o."), /*#__PURE__*/React.createElement(AvisoPlanoIA, {
    usuario: usuario
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      margin: "12px 0 16px",
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: organizarComIA,
    disabled: organizando
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "sparkles",
    tamanho: 15
  }), " ", organizando ? "Organizando..." : "Organizar com IA"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--texto-suave)"
    }
  }, "A IA s\xF3 organiza o que voc\xEA disse; confira os n\xFAmeros antes de salvar.")), perguntas.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1.5px solid #F59E0B",
      background: "#FFFBEB",
      borderRadius: 10,
      padding: "12px 14px",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: "#92400E",
      marginBottom: 4
    }
  }, "Faltou registrar algumas informa\xE7\xF5es"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "#78350F",
      margin: "0 0 10px"
    }
  }, "Responda o que souber (pode ditar). Deixe em branco o que n\xE3o quiser registrar."), perguntas.map((q, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      display: "block",
      marginBottom: 4
    }
  }, i + 1, ". ", q), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: respostas[i] || "",
    onChange: e => setRespostas(r => ({
      ...r,
      [i]: e.target.value
    })),
    rows: 1
  }))), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: completarComRespostas,
    disabled: organizando
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "sparkles",
    tamanho: 14
  }), " ", organizando ? "Completando..." : "Completar com as respostas")), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--borda)",
      borderRadius: 10,
      padding: "14px 16px",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--cor-marca)",
      marginBottom: 12
    }
  }, "Registro ABA \u2014 revise e edite"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cx,
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Quem participou"), /*#__PURE__*/React.createElement("input", {
    style: ABA_CAMPO,
    value: aba.participantes,
    onChange: e => atualizar({
      participantes: e.target.value
    }),
    placeholder: "Crian\xE7a, m\xE3e, AT..."
  }))), /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Estado geral e opera\xE7\xF5es motivadoras"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: aba.estadoGeral,
    onChange: e => atualizar({
      estadoGeral: e.target.value
    }),
    rows: 2
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 13
    }
  }, "Alvos trabalhados"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, disponiveis.length > 0 && /*#__PURE__*/React.createElement("select", {
    className: "campo-select",
    value: "",
    onChange: e => {
      adicionarAlvoDoPlano(e.target.value);
      e.target.value = "";
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Adicionar do plano..."), disponiveis.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.id
  }, (p.tipo === "reducao" ? "[comportamento] " : "") + p.nome))), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12
    },
    onClick: () => atualizar({
      alvos: [...aba.alvos, {
        alvoId: "",
        nome: "",
        procedimento: "",
        ajuda: "",
        tentativas: null,
        acertosIndependentes: null,
        acertosComAjuda: null,
        observacao: ""
      }]
    })
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "plus",
    tamanho: 13
  }), " Outro alvo"))), aba.alvos.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhum alvo registrado nesta sess\xE3o."), aba.alvos.map((a, i) => {
    const pInd = abaPct(a.acertosIndependentes, a.tentativas);
    const pTot = a.tentativas > 0 ? abaPct((a.acertosIndependentes || 0) + (a.acertosComAjuda || 0), a.tentativas) : null;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        border: "1px solid var(--borda)",
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        background: "#FAFAFB"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("input", {
      style: {
        ...ABA_CAMPO,
        fontWeight: 600
      },
      value: a.nome,
      onChange: e => mudarLinha("alvos", i, {
        nome: e.target.value
      }),
      placeholder: "Nome do alvo"
    }), /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      style: {
        padding: "6px 8px"
      },
      onClick: () => removerLinha("alvos", i),
      title: "Remover"
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "trash-2",
      tamanho: 13
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        ...cx,
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Procedimento"), /*#__PURE__*/React.createElement("select", {
      style: ABA_CAMPO,
      value: a.procedimento || "",
      onChange: e => mudarLinha("alvos", i, {
        procedimento: e.target.value
      })
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "-"), ABA_PROCEDIMENTOS.map(x => /*#__PURE__*/React.createElement("option", {
      key: x
    }, x)), a.procedimento && !ABA_PROCEDIMENTOS.includes(a.procedimento) && /*#__PURE__*/React.createElement("option", null, a.procedimento))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "N\xEDvel de ajuda"), /*#__PURE__*/React.createElement("select", {
      style: ABA_CAMPO,
      value: a.ajuda || "",
      onChange: e => mudarLinha("alvos", i, {
        ajuda: e.target.value
      })
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "-"), ABA_AJUDAS.map(x => /*#__PURE__*/React.createElement("option", {
      key: x
    }, x)), a.ajuda && !ABA_AJUDAS.includes(a.ajuda) && /*#__PURE__*/React.createElement("option", null, a.ajuda))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Tentativas"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      style: ABA_CAMPO,
      value: a.tentativas ?? "",
      onChange: e => mudarLinha("alvos", i, {
        tentativas: abaNum(e.target.value)
      })
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Acertos independentes"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      style: ABA_CAMPO,
      value: a.acertosIndependentes ?? "",
      onChange: e => mudarLinha("alvos", i, {
        acertosIndependentes: abaNum(e.target.value)
      })
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: ABA_ROTULO
    }, "Acertos com ajuda"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      style: ABA_CAMPO,
      value: a.acertosComAjuda ?? "",
      onChange: e => mudarLinha("alvos", i, {
        acertosComAjuda: abaNum(e.target.value)
      })
    }))), (pInd != null || pTot != null) && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        marginTop: 8,
        color: "#065F46",
        fontWeight: 600
      }
    }, pInd != null && /*#__PURE__*/React.createElement(React.Fragment, null, "Independente: ", pInd, "%"), pInd != null && pTot != null && " · ", pTot != null && /*#__PURE__*/React.createElement(React.Fragment, null, "Total (com ajuda): ", pTot, "%")), /*#__PURE__*/React.createElement("label", {
      style: {
        ...ABA_ROTULO,
        marginTop: 8
      }
    }, "Observa\xE7\xE3o"), /*#__PURE__*/React.createElement("input", {
      style: ABA_CAMPO,
      value: a.observacao || "",
      onChange: e => mudarLinha("alvos", i, {
        observacao: e.target.value
      })
    }));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 13
    }
  }, "Comportamentos-problema (ABC)"), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12
    },
    onClick: () => atualizar({
      comportamentos: [...aba.comportamentos, {
        nome: "",
        ocorrencias: null,
        duracaoMinutos: null,
        antecedente: "",
        consequencia: "",
        funcao: "",
        manejo: ""
      }]
    })
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "plus",
    tamanho: 13
  }), " Outro comportamento")), aba.comportamentos.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhum comportamento registrado nesta sess\xE3o."), aba.comportamentos.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      border: "1px solid var(--borda)",
      borderRadius: 8,
      padding: 10,
      marginBottom: 8,
      background: "#FFFAFA"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: {
      ...ABA_CAMPO,
      fontWeight: 600
    },
    value: c.nome,
    onChange: e => mudarLinha("comportamentos", i, {
      nome: e.target.value
    }),
    placeholder: "Comportamento (descri\xE7\xE3o observ\xE1vel)"
  }), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      padding: "6px 8px"
    },
    onClick: () => removerLinha("comportamentos", i),
    title: "Remover"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "trash-2",
    tamanho: 13
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cx,
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Ocorr\xEAncias"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    style: ABA_CAMPO,
    value: c.ocorrencias ?? "",
    onChange: e => mudarLinha("comportamentos", i, {
      ocorrencias: abaNum(e.target.value)
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Dura\xE7\xE3o (min)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    style: ABA_CAMPO,
    value: c.duracaoMinutos ?? "",
    onChange: e => mudarLinha("comportamentos", i, {
      duracaoMinutos: abaNum(e.target.value)
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Fun\xE7\xE3o hipot\xE9tica"), /*#__PURE__*/React.createElement("select", {
    style: ABA_CAMPO,
    value: c.funcao || "",
    onChange: e => mudarLinha("comportamentos", i, {
      funcao: e.target.value
    })
  }, ABA_FUNCOES.map(x => /*#__PURE__*/React.createElement("option", {
    key: x,
    value: x
  }, x || "-")), c.funcao && !ABA_FUNCOES.includes(c.funcao) && /*#__PURE__*/React.createElement("option", null, c.funcao)))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cx,
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Antecedente (o que veio antes)"), /*#__PURE__*/React.createElement("input", {
    style: ABA_CAMPO,
    value: c.antecedente || "",
    onChange: e => mudarLinha("comportamentos", i, {
      antecedente: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Consequ\xEAncia (o que veio depois)"), /*#__PURE__*/React.createElement("input", {
    style: ABA_CAMPO,
    value: c.consequencia || "",
    onChange: e => mudarLinha("comportamentos", i, {
      consequencia: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Manejo / estrat\xE9gia usada"), /*#__PURE__*/React.createElement("input", {
    style: ABA_CAMPO,
    value: c.manejo || "",
    onChange: e => mudarLinha("comportamentos", i, {
      manejo: e.target.value
    })
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "grid",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Refor\xE7adores usados"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: aba.reforcadores,
    onChange: e => atualizar({
      reforcadores: e.target.value
    }),
    rows: 2
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Orienta\xE7\xE3o aos pais / cuidadores"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: aba.orientacaoPais,
    onChange: e => atualizar({
      orientacaoPais: e.target.value
    }),
    rows: 2
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Generaliza\xE7\xE3o (outros ambientes ou pessoas)"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: aba.generalizacao,
    onChange: e => atualizar({
      generalizacao: e.target.value
    }),
    rows: 2
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: ABA_ROTULO
  }, "Observa\xE7\xF5es e plano da pr\xF3xima sess\xE3o"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: aba.observacoes,
    onChange: e => atualizar({
      observacoes: e.target.value
    }),
    rows: 3
  })))), erro && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--erro)",
      fontSize: 13,
      marginBottom: 10
    }
  }, erro), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--sucesso)"
    }
  }, salvoAuto ? "Anotação salva automaticamente." : ""), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: tentarFechar
  }, "Fechar"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: salvar,
    disabled: salvando
  }, salvando ? "Salvando..." : "Salvar anotação")))));
}

// ─── Anotação aberta de fora do perfil do paciente ─────────────────
// (ex.: Financeiro > Pacotes & Sessões). Escolhe o modelo conforme as modalidades do paciente:
// só clínico -> TCC; só ABA -> ABA; as duas -> pergunta qual anotação fazer.
function AnotacaoDaSessao({
  usuario,
  paciente,
  sessao,
  notas,
  aoFechar
}) {
  const [mod, setMod] = useState(null);
  const [escolha, setEscolha] = useState(null);
  const {
    plano
  } = usePlanoABA(usuario, paciente);
  const alvosPlano = plano && Array.isArray(plano.alvos) ? plano.alvos : [];
  const notaTcc = (notas || []).find(n => n.sessaoId === sessao.id && (!n.modelo || n.modelo === "tcc")) || null;
  const notaAba = (notas || []).find(n => n.sessaoId === sessao.id && n.modelo === "aba") || null;
  useEffect(() => {
    db.collection("clinica_pacientes").doc(paciente.id).get().then(d => setMod(modalidadesDoPaciente(d.exists ? d.data() : null))).catch(() => setMod(["clinico"]));
  }, [paciente.id]);
  useEffect(() => {
    if (!mod) return;
    const temAba = mod.includes("aba"),
      temClinico = mod.includes("clinico");
    if (temAba && !temClinico) setEscolha("aba");else if (!temAba) setEscolha("tcc");else if (notaAba && !notaTcc) setEscolha("aba");else if (notaTcc && !notaAba) setEscolha("tcc");
  }, [mod]);
  if (!mod) return null;
  if (escolha === "tcc") return /*#__PURE__*/React.createElement(ModalAnotacaoTCC, {
    usuario: usuario,
    paciente: paciente,
    sessao: sessao,
    notaExistente: notaTcc,
    aoFechar: aoFechar
  });
  if (escolha === "aba") return /*#__PURE__*/React.createElement(ModalAnotacaoABA, {
    usuario: usuario,
    paciente: paciente,
    sessao: sessao,
    notaExistente: notaAba,
    alvosPlano: alvosPlano,
    aoFechar: aoFechar
  });
  const opcao = (id, titulo, sub, feita) => /*#__PURE__*/React.createElement("button", {
    key: id,
    className: "botao-secundario",
    onClick: () => setEscolha(id),
    style: {
      width: "100%",
      textAlign: "left",
      padding: "14px 16px",
      display: "block",
      marginBottom: 10,
      borderColor: feita ? "#15803D" : undefined,
      background: feita ? "#F0FDF4" : undefined
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14
    }
  }, titulo, feita ? " (já preenchida)" : ""), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--texto-suave)",
      marginTop: 2
    }
  }, sub));
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: aoFechar
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation(),
    style: {
      maxWidth: 440
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      marginTop: 0
    }
  }, "Qual anota\xE7\xE3o desta sess\xE3o?"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--texto-suave)",
      marginTop: 0
    }
  }, paciente.nome, " tem mais de uma modalidade de atendimento."), opcao("tcc", "Atendimento clínico (TCC)", "Humor, pensamentos automáticos, técnicas e tarefas de casa.", !!notaTcc), opcao("aba", "ABA", "Alvos, tentativas, comportamentos e orientação aos pais.", !!notaAba), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: aoFechar
  }, "Cancelar"))));
}