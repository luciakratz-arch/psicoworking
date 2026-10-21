// ═══════════════════════════════════════════════════════════════════
//  PRONTUÁRIO DO PACIENTE — abas Metas, Evolução, Laudos, Saúde
//  Ocupacional e Links Partilhados do perfil clínico.
//  (Anamnese e Questionários continuam em app_pacientes.js.)
//  Todas as consultas filtram por psi_id + pacienteId, como pedem as
//  regras do Firestore.
// ═══════════════════════════════════════════════════════════════════

// ── Utilidades compartilhadas ──────────────────────────────────────
function prontHojeISO() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function prontDataBR(iso) {
  return iso ? new Date(iso + "T12:00:00").toLocaleDateString("pt-BR") : "—";
}
function prontDataExtenso(iso) {
  const d = iso ? new Date(iso + "T12:00:00") : new Date();
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}
function prontMomento(d) {
  return d.createdAt && d.createdAt.seconds || d.criadoEm && d.criadoEm.seconds || 0;
}
function prontDataDoc(d) {
  const s = prontMomento(d);
  return s ? new Date(s * 1000).toLocaleDateString("pt-BR") : d.data || "—";
}

// Dados da clínica usados no timbre dos documentos (nome, CRP, cidade…)
function useConfigProntuario(psiId) {
  const [cfg, setCfg] = useState({});
  useEffect(() => {
    db.collection("psi_config").doc(psiId).get().then(d => {
      if (d.exists) setCfg(d.data());
    }).catch(() => {});
  }, [psiId]);
  return cfg;
}

// Abre uma janela só com o documento e chama a impressão (o navegador
// oferece "Salvar como PDF").
function prontImprimir(idElemento, titulo) {
  const el = document.getElementById(idElemento);
  if (!el) return;
  const w = window.open("", "_blank");
  w.document.write('<html><head><meta charset="UTF-8"><title>' + titulo + "</title><style>" + "body{font-family:Arial,sans-serif;margin:40px;color:#1f2937;font-size:13px;line-height:1.6}" + "img{max-height:70px}@media print{body{margin:20px}.no-print{display:none}}" + "</style></head><body>" + el.innerHTML + "</body></html>");
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
  }, 600);
}
function ProntSecao({
  titulo,
  cor,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: cor,
      borderBottom: "1px solid #E5E7EB",
      paddingBottom: 4,
      marginBottom: 8,
      textTransform: "uppercase"
    }
  }, titulo), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.7,
      whiteSpace: "pre-wrap",
      textAlign: "justify"
    }
  }, children));
}

// Folha timbrada com o nome/CRP da própria clínica e bloco de assinatura.
function DocumentoTimbrado({
  id,
  cfg,
  titulo,
  subtitulo,
  aviso,
  children
}) {
  const cor = cfg.corPrimaria || "#6A2BD9";
  const linhaCrp = [cfg.crp ? "CRP " + cfg.crp : "", cfg.tituloProfissional || ""].filter(Boolean).join(" · ");
  return /*#__PURE__*/React.createElement("div", {
    id: id,
    style: {
      background: "white",
      borderRadius: 12,
      border: "1px solid #E5E7EB",
      padding: 32,
      maxWidth: 700
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 20,
      paddingBottom: 14,
      borderBottom: "2px solid " + cor
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 700,
      color: cor
    }
  }, cfg.nome || "Clínica"), linhaCrp && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#6B7280"
    }
  }, linhaCrp), cfg.cidade && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#6B7280"
    }
  }, cfg.cidade)), cfg.logoUrl && /*#__PURE__*/React.createElement("img", {
    src: cfg.logoUrl,
    alt: "",
    style: {
      height: 48,
      objectFit: "contain"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1
    }
  }, titulo), subtitulo && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#6B7280",
      marginTop: 4
    }
  }, subtitulo)), children, aviso && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FEF3C7",
      border: "1px solid #F59E0B",
      borderRadius: 6,
      padding: "10px 14px",
      fontSize: 11,
      margin: "22px 0",
      color: "#78350F"
    }
  }, aviso), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #E5E7EB",
      paddingTop: 26,
      marginTop: 20,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 240,
      borderBottom: "1.5px solid #1F2937",
      margin: "0 auto 8px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-block",
      border: "2px solid " + cor,
      borderRadius: 8,
      padding: "8px 20px",
      color: cor
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, cfg.nome || "Psicólogo(a)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600
    }
  }, "Psic\xF3logo(a)", cfg.crp ? " — CRP " + cfg.crp : ""), cfg.tituloProfissional && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      marginTop: 2
    }
  }, cfg.tituloProfissional))));
}
const PRONT_AVISO_CFP = "Este documento foi elaborado em conformidade com a Resolução CFP nº 06/2019, preservando o sigilo profissional.";
function ProntAvisoCrp({
  cfg
}) {
  if (cfg.crp) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FEF3C7",
      border: "1px solid #F59E0B",
      borderRadius: 10,
      padding: "10px 14px",
      marginBottom: 14,
      fontSize: 12.5,
      color: "#78350F"
    }
  }, "O n\xFAmero do seu CRP ainda n\xE3o foi informado. Preencha em Configura\xE7\xF5es para ele aparecer nos documentos.");
}
const TCC_SECOES = [{
  key: "humor",
  rotulo: "Estado de Humor / Início da Sessão"
}, {
  key: "agenda",
  rotulo: "Agenda e Temas Abordados"
}, {
  key: "pensamentosAutomaticos",
  rotulo: "Pensamentos Automáticos"
}, {
  key: "crencas",
  rotulo: "Crenças Intermediárias e Centrais"
}, {
  key: "tecnicas",
  rotulo: "Técnicas Utilizadas"
}, {
  key: "tarefas",
  rotulo: "Tarefas de Casa"
}, {
  key: "observacoes",
  rotulo: "Observações do Terapeuta"
}];

// ═══════════════════════════════════════════════════════════════════
//  METAS
// ═══════════════════════════════════════════════════════════════════

const PRONT_CATEGORIAS_META = ["Emocional", "Saúde", "Pessoal", "Profissional", "Relacionamento", "Outro"];
function AbaMetasPaciente({
  usuario,
  paciente
}) {
  const [metas, setMetas] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const vazio = {
    titulo: "",
    categoria: "Emocional",
    progresso: 0,
    status: "ativa"
  };
  const [form, setForm] = useState(vazio);
  const [erro, setErro] = useState("");
  useEffect(() => {
    return db.collection("clinica_metas").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).onSnapshot(snap => {
      const lista = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      lista.sort((a, b) => prontMomento(b) - prontMomento(a));
      setMetas(lista);
    }, () => {});
  }, [usuario.psiId, paciente.id]);
  function abrirNova() {
    setEditando(null);
    setForm(vazio);
    setErro("");
    setModal(true);
  }
  function abrirEdicao(m) {
    setEditando(m.id);
    setForm({
      titulo: m.titulo || "",
      categoria: m.categoria || "Emocional",
      progresso: m.progresso || 0,
      status: m.status || "ativa"
    });
    setErro("");
    setModal(true);
  }
  async function salvar() {
    if (!form.titulo.trim()) {
      setErro("Dê um título para a meta.");
      return;
    }
    try {
      const dados = {
        titulo: form.titulo.trim(),
        categoria: form.categoria,
        progresso: Number(form.progresso) || 0,
        status: form.status
      };
      if (editando) {
        await db.collection("clinica_metas").doc(editando).update({
          ...dados,
          atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
      } else {
        await db.collection("clinica_metas").add({
          ...dados,
          psi_id: usuario.psiId,
          pacienteId: paciente.id,
          pacienteNome: paciente.nome || "",
          criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      setModal(false);
    } catch (e) {
      setErro("Não foi possível salvar: " + e.message);
    }
  }
  async function excluir(id) {
    if (!confirm("Excluir esta meta?")) return;
    await db.collection("clinica_metas").doc(id).delete();
  }
  async function ajustarProgresso(id, valor) {
    await db.collection("clinica_metas").doc(id).update({
      progresso: valor
    });
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Metas terap\xEAuticas"), /*#__PURE__*/React.createElement("p", {
    className: "subtitulo-pagina"
  }, "Metas ativas e conclu\xEDdas aparecem no portal do paciente. Arquivadas ficam ocultas para ele.")), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: abrirNova
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "plus",
    tamanho: 15
  }), " Nova meta")), metas.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao",
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "target",
    tamanho: 36
  }), /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio",
    style: {
      marginTop: 10
    }
  }, "Nenhuma meta cadastrada.")) : metas.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.id,
    className: "cartao-secao",
    style: m.status === "concluida" ? {
      border: "1.5px solid #059669",
      background: "#F0FDF4"
    } : m.status === "arquivada" ? {
      opacity: 0.55
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600
    }
  }, m.titulo), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 6,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "etiqueta-ativo",
    style: {
      fontSize: 11,
      padding: "2px 10px",
      borderRadius: 12
    }
  }, m.categoria), m.status === "concluida" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "#059669",
      background: "#D1FAE5",
      borderRadius: 20,
      padding: "2px 8px"
    }
  }, "Conclu\xEDda"), m.status === "arquivada" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "#6B7280",
      background: "#F3F4F6",
      borderRadius: 20,
      padding: "2px 8px"
    }
  }, "Arquivada"), m.atualizadoPor === "paciente" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--cor-marca)"
    }
  }, "atualizada pelo paciente"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-icone",
    title: "Editar meta",
    onClick: () => abrirEdicao(m)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "pencil",
    tamanho: 15
  })), /*#__PURE__*/React.createElement("button", {
    className: "botao-icone botao-icone-perigo",
    title: "Excluir meta",
    onClick: () => excluir(m.id)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "trash-2",
    tamanho: 15
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: "#F3F4F6",
      borderRadius: 20,
      height: 8,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: (m.progresso || 0) + "%",
      height: "100%",
      background: "var(--cor-marca)",
      borderRadius: 20
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "var(--cor-marca)",
      minWidth: 38
    }
  }, m.progresso || 0, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12,
      padding: "4px 10px"
    },
    onClick: () => ajustarProgresso(m.id, Math.max(0, (m.progresso || 0) - 10))
  }, "-10%"), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12,
      padding: "4px 10px"
    },
    onClick: () => ajustarProgresso(m.id, Math.min(100, (m.progresso || 0) + 10))
  }, "+10%")))), modal && /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: () => setModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", null, editando ? "Editar meta" : "Nova meta"), /*#__PURE__*/React.createElement("div", {
    className: "grade-2col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "T\xEDtulo da meta"), /*#__PURE__*/React.createElement("input", {
    value: form.titulo,
    onChange: e => setForm({
      ...form,
      titulo: e.target.value
    }),
    placeholder: "Ex: Praticar respira\xE7\xE3o diariamente"
  })), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Categoria"), /*#__PURE__*/React.createElement("select", {
    value: form.categoria,
    onChange: e => setForm({
      ...form,
      categoria: e.target.value
    })
  }, PRONT_CATEGORIAS_META.map(c => /*#__PURE__*/React.createElement("option", {
    key: c
  }, c)))), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Progresso: ", /*#__PURE__*/React.createElement("strong", null, form.progresso, "%")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 0,
    max: 100,
    step: 5,
    value: form.progresso,
    onChange: e => setForm({
      ...form,
      progresso: +e.target.value
    }),
    style: {
      padding: 0
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Status"), /*#__PURE__*/React.createElement("select", {
    value: form.status,
    onChange: e => setForm({
      ...form,
      status: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: "ativa"
  }, "Ativa (vis\xEDvel para o paciente)"), /*#__PURE__*/React.createElement("option", {
    value: "concluida"
  }, "Conclu\xEDda (vis\xEDvel, marcada como alcan\xE7ada)"), /*#__PURE__*/React.createElement("option", {
    value: "arquivada"
  }, "Arquivada (oculta do paciente)")))), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: () => setModal(false)
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-primario",
    onClick: salvar
  }, editando ? "Salvar alterações" : "Salvar")))));
}

// ═══════════════════════════════════════════════════════════════════
//  EVOLUÇÃO
// ═══════════════════════════════════════════════════════════════════

const PRONT_FERRAMENTAS_REGISTRO = [{
  col: "clinica_gestao_ansiedade",
  nome: "Gestão da Ansiedade / Roda da Vida"
}, {
  col: "clinica_registro_abc",
  nome: "Registro ABC"
}, {
  col: "clinica_arvore_decisao",
  nome: "Árvore da Decisão"
}, {
  col: "clinica_relaxamento",
  nome: "Relaxamento e Respiração"
}, {
  col: "clinica_rastreamento_alimentar",
  nome: "Rastreamento Emocional da Alimentação"
}, {
  col: "clinica_treino_auditivo",
  nome: "Treino Neuro-Auditivo"
}, {
  col: "clinica_baralho_distorcoes",
  nome: "Baralho das Distorções"
}];
function ProntGraficoHumor({
  registros
}) {
  const pontos = registros.slice(0, 30).reverse();
  if (pontos.length < 2) return null;
  const L = 600,
    A = 130,
    mx = 24,
    my = 14;
  const x = i => mx + i * (L - 2 * mx) / (pontos.length - 1);
  const y = v => A - my - (v - 1) / 9 * (A - 2 * my);
  const linha = pontos.map((p, i) => x(i) + "," + y(p.valor || 1)).join(" ");
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 " + L + " " + A,
    style: {
      width: "100%",
      height: "auto",
      marginBottom: 12
    }
  }, [1, 5, 10].map(v => /*#__PURE__*/React.createElement("g", {
    key: v
  }, /*#__PURE__*/React.createElement("line", {
    x1: mx,
    x2: L - mx,
    y1: y(v),
    y2: y(v),
    stroke: "#E5E7EB",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("text", {
    x: 2,
    y: y(v) + 4,
    fontSize: "10",
    fill: "#9CA3AF"
  }, v))), /*#__PURE__*/React.createElement("polyline", {
    points: linha,
    fill: "none",
    stroke: "var(--cor-marca)",
    strokeWidth: "2.5",
    strokeLinejoin: "round"
  }), pontos.map((p, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: x(i),
    cy: y(p.valor || 1),
    r: "3.5",
    fill: "var(--cor-marca)"
  })));
}
function ProntRegistrosExpansivel({
  itens,
  tituloDe,
  subtituloDe,
  registrosDe
}) {
  const [aberto, setAberto] = useState(null);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, itens.slice(0, 15).map(r => {
    const on = aberto === r.id;
    return /*#__PURE__*/React.createElement("div", {
      key: r.id,
      style: {
        border: "1px solid #F3F4F6",
        borderRadius: 10,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setAberto(on ? null : r.id),
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        cursor: "pointer",
        gap: 10,
        background: on ? "var(--marca-plataforma-lavanda)" : "#FAFAFA"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13
      }
    }, tituloDe(r)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--texto-suave)",
        marginTop: 2
      }
    }, subtituloDe(r))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--cor-marca)",
        fontWeight: 600,
        flexShrink: 0
      }
    }, on ? "Fechar" : "Ver respostas")), on && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 14px",
        background: "white"
      }
    }, registrosDe(r).map((reg, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "var(--cor-marca)",
        marginBottom: 3
      }
    }, i + 1, ". ", reg.pergunta), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: reg.resposta ? "#1F2937" : "#9CA3AF",
        lineHeight: 1.6,
        paddingLeft: 12,
        borderLeft: "3px solid var(--marca-plataforma-lavanda)"
      }
    }, reg.resposta || "— sem resposta —")))));
  }));
}
function AbaEvolucaoPaciente({
  usuario,
  paciente
}) {
  const [humor, setHumor] = useState([]);
  const [metasAtivas, setMetasAtivas] = useState(0);
  const [sessoes, setSessoes] = useState(0);
  const [diario, setDiario] = useState([]);
  const [tcc, setTcc] = useState([]);
  const [reflexoes, setReflexoes] = useState([]);
  const [ferramentas, setFerramentas] = useState([]);
  useEffect(() => {
    const base = col => db.collection(col).where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id);
    const ordenada = snap => snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })).sort((a, b) => prontMomento(b) - prontMomento(a));
    const cancelar = [base("clinica_humor").onSnapshot(s => setHumor(ordenada(s)), () => {}), base("clinica_metas").onSnapshot(s => setMetasAtivas(s.docs.filter(d => d.data().status === "ativa").length), () => {}), base("clinica_sessoes").onSnapshot(s => setSessoes(s.size), () => {}), base("clinica_diario").onSnapshot(s => setDiario(ordenada(s)), () => {}), base("clinica_tcc").onSnapshot(s => setTcc(ordenada(s)), () => {}), base("clinica_reflexoes").onSnapshot(s => setReflexoes(ordenada(s)), () => {})];
    Promise.all(PRONT_FERRAMENTAS_REGISTRO.map(f => base(f.col).get().then(s => ({
      nome: f.nome,
      total: s.size,
      ultima: s.docs.reduce((m, d) => Math.max(m, prontMomento(d.data())), 0)
    })).catch(() => ({
      nome: f.nome,
      total: 0,
      ultima: 0
    })))).then(r => setFerramentas(r.filter(f => f.total > 0)));
    return () => cancelar.forEach(f => f());
  }, [usuario.psiId, paciente.id]);
  const media = humor.length ? (humor.reduce((a, h) => a + (h.valor || 0), 0) / humor.length).toFixed(1) : "—";
  const cartao = (icone, titulo, valor, legenda) => /*#__PURE__*/React.createElement("div", {
    className: "cartao-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-cartao-stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "titulo-cartao-stat"
  }, titulo), /*#__PURE__*/React.createElement("div", {
    className: "icone-cartao-stat"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: icone,
    tamanho: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "valor-cartao-stat"
  }, valor), legenda && /*#__PURE__*/React.createElement("div", {
    className: "legenda-cartao-stat"
  }, legenda));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "grade-cartoes-stat"
  }, cartao("calendar", "Sessões registradas", sessoes), cartao("book-open", "Diário terapêutico", diario.length, diario[0] ? "última: " + prontDataDoc(diario[0]) : ""), cartao("target", "Metas ativas", metasAtivas), cartao("heart", "Humor médio", media === "—" ? "—" : media + "/10", humor[0] ? "último: " + prontDataDoc(humor[0]) : "")), /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "trending-up",
    tamanho: 16
  }), " Evolu\xE7\xE3o do humor"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, "Check-ins di\xE1rios feitos pelo paciente no portal (1 a 10)."), humor.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Sem check-ins de humor para este paciente ainda.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ProntGraficoHumor, {
    registros: humor
  }), humor.slice(0, 10).map(h => /*#__PURE__*/React.createElement("div", {
    key: h.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "8px 0",
      borderBottom: "1px solid #F3F4F6"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "var(--cor-marca)",
      minWidth: 42
    }
  }, h.valor, "/10"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: "#F3F4F6",
      borderRadius: 20,
      height: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: (h.valor || 0) * 10 + "%",
      height: "100%",
      background: "var(--cor-marca)",
      borderRadius: 20
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--texto-suave)",
      minWidth: 80,
      textAlign: "right"
    }
  }, prontDataDoc(h)), h.nota && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#4B5563",
      flexBasis: "100%"
    }
  }, h.nota))))), /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "layers",
    tamanho: 16
  }), " Uso das ferramentas terap\xEAuticas"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, "Quantas vezes o paciente registrou cada exerc\xEDcio."), ferramentas.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhum exerc\xEDcio registrado ainda.") : ferramentas.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.nome,
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: "1px solid #F3F4F6",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", null, f.nome), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--texto-suave)"
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--cor-marca)"
    }
  }, f.total), " registro(s)", f.ultima ? " · último em " + new Date(f.ultima * 1000).toLocaleDateString("pt-BR") : "")))), tcc.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "brain",
    tamanho: 16
  }), " Registros TCC \u2014 pensamentos guiados"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, tcc.length, " registro(s)"), /*#__PURE__*/React.createElement(ProntRegistrosExpansivel, {
    itens: tcc,
    tituloDe: r => "Registro de " + prontDataDoc(r),
    subtituloDe: () => "Gestão da Ansiedade",
    registrosDe: r => r.registros || []
  })), reflexoes.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "message-square",
    tamanho: 16
  }), " Reflex\xF5es \u2014 f\xE1bulas e psicoeduca\xE7\xF5es"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, reflexoes.length, " registro(s)"), /*#__PURE__*/React.createElement(ProntRegistrosExpansivel, {
    itens: reflexoes,
    tituloDe: r => r.origemTitulo || "Reflexão",
    subtituloDe: r => (r.origem === "fabula" ? "Fábula" : "Psicoeducação") + " · " + prontDataDoc(r),
    registrosDe: r => r.registros || []
  })), diario.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "book-open",
    tamanho: 16
  }), " Di\xE1rio terap\xEAutico"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, diario.length, " entrada(s)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      maxHeight: 360,
      overflowY: "auto"
    }
  }, diario.slice(0, 15).map(d => /*#__PURE__*/React.createElement("div", {
    key: d.id,
    style: {
      padding: "10px 14px",
      borderRadius: 10,
      border: "1px solid #F3F4F6",
      background: "#FAFAFA"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "var(--cor-marca)",
      background: "var(--marca-plataforma-lavanda)",
      borderRadius: 20,
      padding: "2px 8px",
      textTransform: "capitalize"
    }
  }, d.tag || "geral"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--texto-suave)"
    }
  }, prontDataDoc(d), d.hora ? " às " + d.hora : "")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.6,
      whiteSpace: "pre-wrap"
    }
  }, d.texto))))));
}

// ═══════════════════════════════════════════════════════════════════
//  LAUDOS E DOCUMENTOS PSICOLÓGICOS (Resolução CFP nº 06/2019)
// ═══════════════════════════════════════════════════════════════════

const PRONT_TIPOS_LAUDO = {
  declaracao: {
    rotulo: "Declaração",
    desc: "Declara fatos objetivos (por exemplo, comparecimento ou acompanhamento), sem conteúdo clínico.",
    obrigatorios: ["corpo"]
  },
  atestado: {
    rotulo: "Atestado Psicológico",
    desc: "Afirma tecnicamente uma condição ou recomendação, com finalidade definida.",
    obrigatorios: ["finalidade", "corpo"]
  },
  relatorio: {
    rotulo: "Relatório Psicológico",
    desc: "Descreve o processo de acompanhamento: demanda, procedimentos, análise e conclusão.",
    obrigatorios: ["demanda", "conclusao"]
  },
  laudo: {
    rotulo: "Laudo Psicológico",
    desc: "Resultado de avaliação psicológica, com procedimentos, análise e conclusão.",
    obrigatorios: ["demanda", "procedimento", "analise", "conclusao"]
  }
};
const PRONT_CAMPOS_LAUDO = {
  finalidade: "Finalidade do documento",
  corpo: "Texto do documento",
  demanda: "Descrição da demanda",
  procedimento: "Procedimento",
  analise: "Análise",
  conclusao: "Conclusão"
};
function ProntConteudoLaudo({
  doc,
  cfg
}) {
  const cor = cfg.corPrimaria || "#6A2BD9";
  const nomeProf = cfg.nome || "o(a) psicólogo(a)";
  const fecho = /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      margin: "24px 0 8px",
      textAlign: "right"
    }
  }, cfg.cidade ? cfg.cidade + ", " : "", prontDataExtenso(doc.dataEmissao), ".");
  if (doc.tipo === "declaracao") {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        lineHeight: 2,
        textAlign: "justify",
        margin: "24px 0",
        textIndent: 36
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Declaro"), ", para os devidos fins", doc.solicitante ? ", a pedido de " + doc.solicitante : "", ", que ", /*#__PURE__*/React.createElement("strong", null, doc.pacienteNome), " ", doc.corpo), fecho);
  }
  if (doc.tipo === "atestado") {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        lineHeight: 2,
        textAlign: "justify",
        margin: "24px 0",
        textIndent: 36
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Atesto"), ", para fins de ", /*#__PURE__*/React.createElement("strong", null, doc.finalidade), ", que ", /*#__PURE__*/React.createElement("strong", null, doc.pacienteNome), " ", doc.corpo), doc.conclusao && /*#__PURE__*/React.createElement(ProntSecao, {
      titulo: "Conclus\xE3o / Recomenda\xE7\xF5es",
      cor: cor
    }, doc.conclusao), fecho);
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "Identifica\xE7\xE3o",
    cor: cor
  }, "Autor(a): " + nomeProf + (cfg.crp ? " — CRP " + cfg.crp : "") + "\n" + "Interessado(a): " + doc.pacienteNome + "\n" + "Solicitante: " + (doc.solicitante || "o(a) próprio(a) paciente") + "\n" + "Finalidade: " + (doc.finalidade || "Acompanhamento psicológico")), /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "Descri\xE7\xE3o da demanda",
    cor: cor
  }, doc.demanda), doc.procedimento && /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "Procedimento",
    cor: cor
  }, doc.procedimento), doc.analise && /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "An\xE1lise",
    cor: cor
  }, doc.analise), /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "Conclus\xE3o",
    cor: cor
  }, doc.conclusao), fecho);
}
function AbaLaudosPaciente({
  usuario,
  paciente
}) {
  const cfg = useConfigProntuario(usuario.psiId);
  const formVazio = {
    tipo: "relatorio",
    titulo: "",
    finalidade: "",
    solicitante: "",
    corpo: "",
    demanda: "",
    procedimento: "",
    analise: "",
    conclusao: "",
    dataEmissao: prontHojeISO(),
    visivelPaciente: false
  };
  const [form, setForm] = useState(formVazio);
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [preview, setPreview] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  function carregar() {
    db.collection("clinica_laudos").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).get().then(snap => {
      const lista = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      lista.sort((a, b) => prontMomento(b) - prontMomento(a));
      setDocs(lista);
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }
  useEffect(carregar, [usuario.psiId, paciente.id]);
  const tipo = PRONT_TIPOS_LAUDO[form.tipo];
  const mostra = campo => {
    if (campo === "finalidade") return form.tipo !== "declaracao";
    if (campo === "corpo") return form.tipo === "declaracao" || form.tipo === "atestado";
    if (campo === "conclusao") return form.tipo !== "declaracao";
    return form.tipo === "relatorio" || form.tipo === "laudo" ? true : false;
  };
  function montarDoc() {
    return {
      psi_id: usuario.psiId,
      pacienteId: paciente.id,
      pacienteNome: paciente.nome || "",
      tipo: form.tipo,
      titulo: form.titulo.trim() || tipo.rotulo,
      finalidade: form.finalidade.trim(),
      solicitante: form.solicitante.trim(),
      corpo: form.corpo.trim(),
      demanda: form.demanda.trim(),
      procedimento: form.procedimento.trim(),
      analise: form.analise.trim(),
      conclusao: form.conclusao.trim(),
      dataEmissao: form.dataEmissao,
      data: prontDataBR(form.dataEmissao),
      visivelPaciente: !!form.visivelPaciente
    };
  }
  function visualizar() {
    const faltando = tipo.obrigatorios.find(c => !form[c].trim());
    if (faltando) {
      setErro('Preencha o campo "' + PRONT_CAMPOS_LAUDO[faltando] + '" antes de visualizar.');
      return;
    }
    setErro("");
    setPreview({
      ...montarDoc(),
      _rascunho: true
    });
  }
  async function salvar() {
    setSalvando(true);
    try {
      await db.collection("clinica_laudos").add({
        ...montarDoc(),
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      setPreview(null);
      setForm(formVazio);
      carregar();
    } catch (e) {
      alert("Não foi possível salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }
  async function alternarVisibilidade(d) {
    await db.collection("clinica_laudos").doc(d.id).update({
      visivelPaciente: !d.visivelPaciente
    });
    carregar();
  }
  async function excluir(d) {
    if (!confirm("Excluir este documento? Essa ação não pode ser desfeita.")) return;
    await db.collection("clinica_laudos").doc(d.id).delete();
    carregar();
  }
  if (preview) {
    return /*#__PURE__*/React.createElement("div", null, preview._rascunho && /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#FEF3C7",
        border: "1px solid #F59E0B",
        borderRadius: 10,
        padding: "10px 16px",
        marginBottom: 14,
        fontSize: 13,
        color: "#78350F",
        fontWeight: 600
      }
    }, "Pr\xE9-visualiza\xE7\xE3o \u2014 o documento ainda N\xC3O foi salvo. Confira tudo e clique em \"Salvar documento\"."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginBottom: 18,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      onClick: () => setPreview(null)
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "arrow-left",
      tamanho: 15
    }), " ", preview._rascunho ? "Voltar e editar" : "Voltar"), preview._rascunho ? /*#__PURE__*/React.createElement("button", {
      className: "botao-primario",
      onClick: salvar,
      disabled: salvando
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "save",
      tamanho: 15
    }), " ", salvando ? "Salvando..." : "Salvar documento") : /*#__PURE__*/React.createElement("button", {
      className: "botao-primario",
      onClick: () => prontImprimir("prontuario-laudo-print", preview.titulo)
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "printer",
      tamanho: 15
    }), " Imprimir / Salvar PDF")), /*#__PURE__*/React.createElement(DocumentoTimbrado, {
      id: "prontuario-laudo-print",
      cfg: cfg,
      titulo: PRONT_TIPOS_LAUDO[preview.tipo].rotulo,
      subtitulo: preview.titulo !== PRONT_TIPOS_LAUDO[preview.tipo].rotulo ? preview.titulo : "",
      aviso: PRONT_AVISO_CFP
    }, /*#__PURE__*/React.createElement(ProntConteudoLaudo, {
      doc: preview,
      cfg: cfg
    })));
  }
  const campoTexto = (campo, linhas, dica) => /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total",
    key: campo
  }, /*#__PURE__*/React.createElement("label", null, PRONT_CAMPOS_LAUDO[campo], tipo.obrigatorios.includes(campo) ? "" : " ", !tipo.obrigatorios.includes(campo) && /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: linhas,
    value: form[campo],
    onChange: e => setForm({
      ...form,
      [campo]: e.target.value
    }),
    placeholder: dica
  }));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ProntAvisoCrp, {
    cfg: cfg
  }), /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "file-text",
    tamanho: 16
  }), " Novo documento psicol\xF3gico"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, "Nada \xE9 salvo antes de voc\xEA conferir e aprovar a pr\xE9-visualiza\xE7\xE3o."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 8
    }
  }, Object.entries(PRONT_TIPOS_LAUDO).map(([id, t]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    type: "button",
    onClick: () => setForm({
      ...form,
      tipo: id
    }),
    style: {
      padding: "8px 16px",
      borderRadius: 20,
      border: "1.5px solid " + (form.tipo === id ? "var(--cor-marca)" : "var(--borda)"),
      background: form.tipo === id ? "var(--cor-marca)" : "white",
      color: form.tipo === id ? "white" : "var(--texto)",
      fontSize: 13,
      fontWeight: form.tipo === id ? 700 : 500
    }
  }, t.rotulo))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--cor-marca)",
      background: "var(--marca-plataforma-lavanda)",
      borderRadius: 8,
      padding: "8px 12px",
      marginBottom: 6
    }
  }, tipo.desc), /*#__PURE__*/React.createElement("div", {
    className: "grade-2col"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "T\xEDtulo ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement("input", {
    value: form.titulo,
    onChange: e => setForm({
      ...form,
      titulo: e.target.value
    }),
    placeholder: tipo.rotulo
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Data de emiss\xE3o"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.dataEmissao,
    onChange: e => setForm({
      ...form,
      dataEmissao: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Solicitante ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional \u2014 deixe vazio se for o pr\xF3prio paciente)")), /*#__PURE__*/React.createElement("input", {
    value: form.solicitante,
    onChange: e => setForm({
      ...form,
      solicitante: e.target.value
    }),
    placeholder: "Ex: Empresa X, escola Y, m\xE9dico(a) Z"
  })), mostra("finalidade") && /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, PRONT_CAMPOS_LAUDO.finalidade, !tipo.obrigatorios.includes("finalidade") && /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, " (opcional)")), /*#__PURE__*/React.createElement("input", {
    value: form.finalidade,
    onChange: e => setForm({
      ...form,
      finalidade: e.target.value
    }),
    placeholder: "Ex: apresenta\xE7\xE3o \xE0 institui\xE7\xE3o de ensino"
  })), mostra("corpo") && campoTexto("corpo", 4, form.tipo === "declaracao" ? "Continue a frase: Declaro que [nome] ... (Ex: está em acompanhamento psicológico nesta clínica desde 10/03/2026, com frequência semanal.)" : "Continue a frase: Atesto que [nome] ... (descreva de forma objetiva, sem diagnóstico ou CID)"), mostra("demanda") && campoTexto("demanda", 4, "Motivo do acompanhamento/avaliação e quem o solicitou."), mostra("procedimento") && campoTexto("procedimento", 4, "Instrumentos, técnicas, número de sessões e período."), mostra("analise") && campoTexto("analise", 6, "Análise fundamentada dos dados coletados."), mostra("conclusao") && campoTexto("conclusao", 4, form.tipo === "atestado" ? "Recomendações (por exemplo, afastamento por X dias)." : "Conclusão e encaminhamentos.")), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 14,
      fontSize: 13,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: form.visivelPaciente,
    onChange: e => setForm({
      ...form,
      visivelPaciente: e.target.checked
    }),
    style: {
      width: "auto"
    }
  }), "Liberar este documento para o paciente ver no portal"), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: visualizar
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "eye",
    tamanho: 15
  }), " Visualizar documento"))), /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "history",
    tamanho: 16
  }), " Documentos emitidos"), carregando ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio",
    style: {
      marginTop: 10
    }
  }, "Carregando...") : docs.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio",
    style: {
      marginTop: 10
    }
  }, "Nenhum documento emitido ainda.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginTop: 12
    }
  }, docs.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 14px",
      borderRadius: 10,
      border: "1px solid var(--borda)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13
    }
  }, d.titulo), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--texto-suave)",
      marginTop: 2
    }
  }, (PRONT_TIPOS_LAUDO[d.tipo] || {}).rotulo || d.tipo, " \xB7 ", d.data || prontDataDoc(d), " \xB7", " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: d.visivelPaciente ? "#059669" : "var(--texto-suave)",
      fontWeight: 600
    }
  }, d.visivelPaciente ? "visível ao paciente" : "só você vê"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12,
      padding: "6px 12px"
    },
    onClick: () => setPreview(d)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "eye",
    tamanho: 13
  }), " Ver"), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12,
      padding: "6px 12px"
    },
    onClick: () => alternarVisibilidade(d)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: d.visivelPaciente ? "eye-off" : "share-2",
    tamanho: 13
  }), " ", d.visivelPaciente ? "Ocultar" : "Liberar"), /*#__PURE__*/React.createElement("button", {
    className: "botao-icone botao-icone-perigo",
    title: "Excluir",
    onClick: () => excluir(d)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "trash-2",
    tamanho: 15
  }))))))));
}

// ═══════════════════════════════════════════════════════════════════
//  SAÚDE OCUPACIONAL (NR-1): relatório para empresas e declaração
// ═══════════════════════════════════════════════════════════════════

const PRONT_TIPOS_NR1 = {
  relatorio_nr1: {
    rotulo: "Relatório de Atendimento Psicossocial (NR-1)",
    desc: "Documento para a empresa: vigência do acompanhamento, sessões, status no programa e parecer técnico."
  },
  declaracao: {
    rotulo: "Declaração de Comparecimento",
    desc: "Documento simples que atesta o comparecimento do colaborador em uma data e horário."
  }
};
const PRONT_STATUS_NR1 = {
  em_andamento: "Em andamento (acompanhamento contínuo)",
  concluido: "Concluído (alta do programa ocupacional)",
  encaminhado: "Encaminhado para especialista externo",
  descontinuado: "Descontinuado (faltas / não adesão)"
};
function ProntConteudoNr1({
  doc,
  cfg
}) {
  const cor = cfg.corPrimaria || "#6A2BD9";
  const fecho = /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      margin: "24px 0 8px",
      textAlign: "right"
    }
  }, cfg.cidade ? cfg.cidade + ", " : "", prontDataExtenso(doc.dataEmissao), ".");
  if (doc.tipoDocumento === "declaracao") {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        lineHeight: 2,
        textAlign: "justify",
        margin: "24px 0",
        textIndent: 36
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Declaro"), ", para os devidos fins, que ", /*#__PURE__*/React.createElement("strong", null, doc.pacienteNome), doc.cargo ? ", " + doc.cargo : "", doc.empresaContratante ? /*#__PURE__*/React.createElement(React.Fragment, null, ", colaborador(a) da empresa ", /*#__PURE__*/React.createElement("strong", null, doc.empresaContratante)) : "", ", compareceu a atendimento psicol\xF3gico nesta cl\xEDnica no dia ", /*#__PURE__*/React.createElement("strong", null, prontDataBR(doc.dataComparecimento)), doc.horaInicio ? /*#__PURE__*/React.createElement(React.Fragment, null, ", no hor\xE1rio das ", /*#__PURE__*/React.createElement("strong", null, doc.horaInicio), doc.horaFim ? /*#__PURE__*/React.createElement(React.Fragment, null, " \xE0s ", /*#__PURE__*/React.createElement("strong", null, doc.horaFim)) : "") : "", "."), doc.obsDeclaracao && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        lineHeight: 1.8,
        textAlign: "justify",
        textIndent: 36
      }
    }, doc.obsDeclaracao), fecho);
  }
  const periodo = doc.periodo && doc.periodo.emAndamento ? prontDataBR(doc.periodo.dataInicio) + " — em andamento" : prontDataBR(doc.periodo && doc.periodo.dataInicio) + " a " + prontDataBR(doc.periodo && doc.periodo.dataFim);
  const linhas = (titulo, itens) => /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: cor,
      borderBottom: "1px solid #E5E7EB",
      paddingBottom: 4,
      marginBottom: 8,
      textTransform: "uppercase"
    }
  }, titulo), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "6px 24px"
    }
  }, itens.map(([l, v, larga]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      gridColumn: larga ? "span 2" : "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#6B7280",
      fontWeight: 600,
      textTransform: "uppercase"
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 500,
      fontSize: 13
    }
  }, v)))));
  return /*#__PURE__*/React.createElement(React.Fragment, null, linhas("Dados do colaborador", [["Nome", doc.pacienteNome], ["Empresa contratante", doc.empresaContratante || "—"], ["Cargo", doc.cargo || "—"], ["Setor", doc.setor || "—"]]), linhas("Dados do atendimento", [["Vigência", periodo], ["Sessões realizadas", (doc.sessoes ? doc.sessoes.realizadas : 0) + " de " + (doc.sessoes ? doc.sessoes.total : 0)], ["Status no programa", PRONT_STATUS_NR1[doc.statusPrograma] || doc.statusPrograma, true]]), doc.parecerTecnico && /*#__PURE__*/React.createElement(ProntSecao, {
    titulo: "Parecer t\xE9cnico",
    cor: cor
  }, doc.parecerTecnico), fecho);
}
function AbaSaudeOcupacionalPaciente({
  usuario,
  paciente
}) {
  const cfg = useConfigProntuario(usuario.psiId);
  const formVazio = {
    tipoDocumento: "relatorio_nr1",
    dataInicio: "",
    dataFim: "",
    emAndamento: false,
    sessoesRealizadas: "",
    sessoesTotal: "",
    statusPrograma: "em_andamento",
    parecerTecnico: "",
    dataComparecimento: "",
    horaInicio: "",
    horaFim: "",
    obsDeclaracao: ""
  };
  const [form, setForm] = useState(formVazio);
  const [ocup, setOcup] = useState({
    empresa: paciente.empresa || "",
    setor: paciente.setor || "",
    cargo: paciente.cargo || ""
  });
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [preview, setPreview] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  function carregar() {
    db.collection("clinica_documentos_nr1").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).get().then(snap => {
      const lista = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      lista.sort((a, b) => prontMomento(b) - prontMomento(a));
      setDocs(lista);
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }
  useEffect(carregar, [usuario.psiId, paciente.id]);
  const ehDecl = form.tipoDocumento === "declaracao";
  function montarDoc() {
    return {
      psi_id: usuario.psiId,
      pacienteId: paciente.id,
      pacienteNome: paciente.nome || "",
      empresaContratante: ocup.empresa,
      setor: ocup.setor,
      cargo: ocup.cargo,
      tipoDocumento: form.tipoDocumento,
      periodo: {
        dataInicio: form.dataInicio,
        dataFim: form.emAndamento ? "" : form.dataFim,
        emAndamento: form.emAndamento
      },
      sessoes: {
        realizadas: Number(form.sessoesRealizadas) || 0,
        total: Number(form.sessoesTotal) || 0
      },
      statusPrograma: form.statusPrograma,
      parecerTecnico: form.parecerTecnico.trim(),
      dataComparecimento: form.dataComparecimento,
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      obsDeclaracao: form.obsDeclaracao.trim(),
      dataEmissao: prontHojeISO()
    };
  }
  function visualizar() {
    if (ehDecl && !form.dataComparecimento) {
      setErro("Informe a data do comparecimento.");
      return;
    }
    if (!ehDecl && !form.parecerTecnico.trim()) {
      setErro("Preencha o parecer técnico antes de visualizar.");
      return;
    }
    setErro("");
    setPreview({
      ...montarDoc(),
      _rascunho: true
    });
  }
  async function salvar() {
    setSalvando(true);
    try {
      await db.collection("clinica_documentos_nr1").add({
        ...montarDoc(),
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      await db.collection("clinica_pacientes").doc(paciente.id).update({
        empresa: ocup.empresa,
        setor: ocup.setor,
        cargo: ocup.cargo
      }).catch(() => {});
      setPreview(null);
      setForm(formVazio);
      carregar();
    } catch (e) {
      alert("Não foi possível salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }
  async function excluir(d) {
    if (!confirm("Excluir este documento? Essa ação não pode ser desfeita.")) return;
    await db.collection("clinica_documentos_nr1").doc(d.id).delete();
    carregar();
  }
  if (preview) {
    return /*#__PURE__*/React.createElement("div", null, preview._rascunho && /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#FEF3C7",
        border: "1px solid #F59E0B",
        borderRadius: 10,
        padding: "10px 16px",
        marginBottom: 14,
        fontSize: 13,
        color: "#78350F",
        fontWeight: 600
      }
    }, "Pr\xE9-visualiza\xE7\xE3o \u2014 o documento ainda N\xC3O foi salvo. Confira tudo e clique em \"Salvar documento\"."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginBottom: 18,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      onClick: () => setPreview(null)
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "arrow-left",
      tamanho: 15
    }), " ", preview._rascunho ? "Voltar e editar" : "Voltar"), preview._rascunho ? /*#__PURE__*/React.createElement("button", {
      className: "botao-primario",
      onClick: salvar,
      disabled: salvando
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "save",
      tamanho: 15
    }), " ", salvando ? "Salvando..." : "Salvar documento") : /*#__PURE__*/React.createElement("button", {
      className: "botao-primario",
      onClick: () => prontImprimir("prontuario-nr1-print", PRONT_TIPOS_NR1[preview.tipoDocumento].rotulo)
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "printer",
      tamanho: 15
    }), " Imprimir / Salvar PDF")), /*#__PURE__*/React.createElement(DocumentoTimbrado, {
      id: "prontuario-nr1-print",
      cfg: cfg,
      titulo: PRONT_TIPOS_NR1[preview.tipoDocumento].rotulo,
      aviso: PRONT_AVISO_CFP + " Não contém diagnósticos, CID, sintomas clínicos ou informações íntimas do colaborador."
    }, /*#__PURE__*/React.createElement(ProntConteudoNr1, {
      doc: preview,
      cfg: cfg
    })));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ProntAvisoCrp, {
    cfg: cfg
  }), /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "briefcase",
    tamanho: 16
  }), " Sa\xFAde Ocupacional \u2014 NR-1"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, "Relat\xF3rios e declara\xE7\xF5es para empresas contratantes. Nada \xE9 salvo antes de voc\xEA conferir."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 8
    }
  }, Object.entries(PRONT_TIPOS_NR1).map(([id, t]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    type: "button",
    onClick: () => setForm({
      ...form,
      tipoDocumento: id
    }),
    style: {
      padding: "8px 16px",
      borderRadius: 20,
      border: "1.5px solid " + (form.tipoDocumento === id ? "var(--cor-marca)" : "var(--borda)"),
      background: form.tipoDocumento === id ? "var(--cor-marca)" : "white",
      color: form.tipoDocumento === id ? "white" : "var(--texto)",
      fontSize: 13,
      fontWeight: form.tipoDocumento === id ? 700 : 500
    }
  }, t.rotulo))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--cor-marca)",
      background: "var(--marca-plataforma-lavanda)",
      borderRadius: 8,
      padding: "8px 12px",
      marginBottom: 6
    }
  }, PRONT_TIPOS_NR1[form.tipoDocumento].desc), /*#__PURE__*/React.createElement("div", {
    className: "grade-2col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Empresa contratante"), /*#__PURE__*/React.createElement("input", {
    value: ocup.empresa,
    onChange: e => setOcup({
      ...ocup,
      empresa: e.target.value
    }),
    placeholder: "Ex: Construtora Horizonte Ltda."
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Setor"), /*#__PURE__*/React.createElement("input", {
    value: ocup.setor,
    onChange: e => setOcup({
      ...ocup,
      setor: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Cargo"), /*#__PURE__*/React.createElement("input", {
    value: ocup.cargo,
    onChange: e => setOcup({
      ...ocup,
      cargo: e.target.value
    })
  })), /*#__PURE__*/React.createElement("p", {
    className: "opcional campo-largura-total",
    style: {
      marginTop: 4
    }
  }, "Empresa, setor e cargo s\xE3o gravados no cadastro do paciente ao salvar o documento."), ehDecl ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Data do comparecimento"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.dataComparecimento,
    onChange: e => setForm({
      ...form,
      dataComparecimento: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Hor\xE1rio (in\xEDcio e t\xE9rmino)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: form.horaInicio,
    onChange: e => setForm({
      ...form,
      horaInicio: e.target.value
    })
  }), /*#__PURE__*/React.createElement("span", null, "\u2014"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: form.horaFim,
    onChange: e => setForm({
      ...form,
      horaFim: e.target.value
    })
  }))), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Observa\xE7\xE3o ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 3,
    value: form.obsDeclaracao,
    onChange: e => setForm({
      ...form,
      obsDeclaracao: e.target.value
    }),
    placeholder: "Ex: O comparecimento integra programa de acompanhamento psicossocial vigente."
  }))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Data de in\xEDcio"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.dataInicio,
    onChange: e => setForm({
      ...form,
      dataInicio: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Data de fim"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.dataFim,
    disabled: form.emAndamento,
    onChange: e => setForm({
      ...form,
      dataFim: e.target.value
    })
  }), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: form.emAndamento,
    onChange: e => setForm({
      ...form,
      emAndamento: e.target.checked,
      dataFim: ""
    }),
    style: {
      width: "auto"
    }
  }), " Em andamento")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Sess\xF5es realizadas"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    value: form.sessoesRealizadas,
    onChange: e => setForm({
      ...form,
      sessoesRealizadas: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Total planejado"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    value: form.sessoesTotal,
    onChange: e => setForm({
      ...form,
      sessoesTotal: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Status no programa"), /*#__PURE__*/React.createElement("select", {
    value: form.statusPrograma,
    onChange: e => setForm({
      ...form,
      statusPrograma: e.target.value
    })
  }, Object.entries(PRONT_STATUS_NR1).map(([v, l]) => /*#__PURE__*/React.createElement("option", {
    key: v,
    value: v
  }, l)))), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Parecer t\xE9cnico"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 6,
    value: form.parecerTecnico,
    onChange: e => setForm({
      ...form,
      parecerTecnico: e.target.value
    }),
    placeholder: "Foque em capacidade laboral e funcionalidade no trabalho, recomendações organizacionais e adaptações no posto de trabalho.\nEvite diagnósticos, CID, sintomas clínicos e informações íntimas."
  }), /*#__PURE__*/React.createElement("p", {
    className: "opcional"
  }, "Siga a Resolu\xE7\xE3o CFP n\xBA 06/2019: foco em capacidade laboral, sem expor diagn\xF3stico ou CID.")))), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: visualizar
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "eye",
    tamanho: 15
  }), " Visualizar documento"))), /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "history",
    tamanho: 16
  }), " Hist\xF3rico de documentos NR-1"), carregando ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio",
    style: {
      marginTop: 10
    }
  }, "Carregando...") : docs.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio",
    style: {
      marginTop: 10
    }
  }, "Nenhum documento gerado ainda.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginTop: 12
    }
  }, docs.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 14px",
      borderRadius: 10,
      border: "1px solid var(--borda)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13
    }
  }, PRONT_TIPOS_NR1[d.tipoDocumento] ? PRONT_TIPOS_NR1[d.tipoDocumento].rotulo : d.tipoDocumento), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--texto-suave)",
      marginTop: 2
    }
  }, d.tipoDocumento === "declaracao" ? "Comparecimento em " + prontDataBR(d.dataComparecimento) : (d.periodo && d.periodo.emAndamento ? prontDataBR(d.periodo.dataInicio) + " — em andamento" : prontDataBR(d.periodo && d.periodo.dataInicio) + " a " + prontDataBR(d.periodo && d.periodo.dataFim)) + " · " + (d.sessoes ? d.sessoes.realizadas : 0) + "/" + (d.sessoes ? d.sessoes.total : 0) + " sessões")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 12,
      padding: "6px 12px"
    },
    onClick: () => setPreview(d)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "eye",
    tamanho: 13
  }), " Ver"), /*#__PURE__*/React.createElement("button", {
    className: "botao-icone botao-icone-perigo",
    title: "Excluir",
    onClick: () => excluir(d)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "trash-2",
    tamanho: 15
  }))))))));
}

// ═══════════════════════════════════════════════════════════════════
//  LINKS PARTILHADOS — o que já foi enviado e se foi respondido
// ═══════════════════════════════════════════════════════════════════

function AbaLinksPaciente({
  usuario,
  paciente
}) {
  const [links, setLinks] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(null);
  function carregar() {
    db.collection("clinica_links_partilhados").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).get().then(snap => {
      const lista = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      lista.sort((a, b) => prontMomento(b) - prontMomento(a));
      setLinks(lista);
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }
  useEffect(carregar, [usuario.psiId, paciente.id]);
  const urlDe = l => window.location.origin + "/psi/atividade/?t=" + l.id;
  function situacao(l) {
    if (l.cancelado) return {
      rotulo: "Cancelado",
      cor: "#6B7280",
      fundo: "#F3F4F6"
    };
    if (l.status === "respondido") {
      const s = l.respondidoEm && l.respondidoEm.seconds;
      return {
        rotulo: "Respondido" + (s ? " em " + new Date(s * 1000).toLocaleDateString("pt-BR") : ""),
        cor: "#059669",
        fundo: "#D1FAE5"
      };
    }
    return {
      rotulo: "Pendente",
      cor: "#D97706",
      fundo: "#FEF3C7"
    };
  }
  function copiar(l) {
    navigator.clipboard.writeText(urlDe(l)).then(() => {
      setCopiado(l.id);
      setTimeout(() => setCopiado(null), 2000);
    });
  }
  function whatsapp(l) {
    const nome = (paciente.nome || "").split(" ")[0];
    const msg = "Olá, " + nome + "!\n\nPreparei um material para você: *" + (l.titulo || "atividade") + "*.\n\nÉ só abrir o link abaixo:\n\n" + urlDe(l) + "\n\nQualquer dúvida, me chama por aqui.";
    const numero = (paciente.telefone || "").replace(/\D/g, "");
    window.open((numero ? "https://wa.me/55" + numero : "https://wa.me/") + "?text=" + encodeURIComponent(msg), "_blank");
  }
  async function alternarCancelamento(l) {
    const cancelar = !l.cancelado;
    if (cancelar && !confirm("Cancelar este link? O paciente não conseguirá mais abri-lo.")) return;
    await db.collection("clinica_links_partilhados").doc(l.id).update({
      cancelado: cancelar
    });
    carregar();
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "link",
    tamanho: 16
  }), " Links enviados"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, "Todo material enviado por link para este paciente. Os links novos s\xE3o criados em Recursos Terap\xEAuticos e em Question\xE1rios."), carregando ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Carregando...") : links.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhum link enviado para este paciente ainda.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, links.map(l => {
    const s = situacao(l);
    return /*#__PURE__*/React.createElement("div", {
      key: l.id,
      style: {
        border: "1px solid var(--borda)",
        borderRadius: 10,
        padding: "12px 14px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 200
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13
      }
    }, l.titulo || "Atividade"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--texto-suave)",
        marginTop: 2
      }
    }, "Enviado em ", prontDataDoc(l))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: s.cor,
        background: s.fundo,
        borderRadius: 20,
        padding: "3px 10px"
      }
    }, s.rotulo)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 10
      }
    }, !l.cancelado && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      style: {
        fontSize: 12,
        padding: "6px 12px"
      },
      onClick: () => copiar(l)
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: copiado === l.id ? "check" : "copy",
      tamanho: 13
    }), " ", copiado === l.id ? "Copiado!" : "Copiar link"), /*#__PURE__*/React.createElement("button", {
      className: "botao-primario",
      style: {
        fontSize: 12,
        padding: "6px 12px",
        background: "#25D366"
      },
      onClick: () => whatsapp(l)
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "message-circle",
      tamanho: 13
    }), " WhatsApp")), /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      style: {
        fontSize: 12,
        padding: "6px 12px"
      },
      onClick: () => alternarCancelamento(l)
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: l.cancelado ? "rotate-ccw" : "x-circle",
      tamanho: 13
    }), " ", l.cancelado ? "Reativar" : "Cancelar link")));
  }))));
}

// ═══════════════════════════════════════════════════════════════════
//  SESSÕES TCC — anotações clínicas por sessão + PDF por período
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
//  PERFIL CLÍNICO (CID, condições, medicações) E CRISES
// ═══════════════════════════════════════════════════════════════════

const INTENSIDADES_CRISE = [{
  id: "leve",
  rotulo: "Leve",
  cor: "#D97706"
}, {
  id: "moderada",
  rotulo: "Moderada",
  cor: "#EA580C"
}, {
  id: "intensa",
  rotulo: "Intensa",
  cor: "#DC2626"
}];
function corDaIntensidade(id) {
  const i = INTENSIDADES_CRISE.find(x => x.id === id);
  return i ? i.cor : "#6B7280";
}
function textoPerfilClinico(p) {
  if (!p) return "";
  const partes = [];
  (p.cids || []).forEach(c => partes.push("CID " + [c.codigo, c.descricao].filter(Boolean).join(" - ")));
  if ((p.condicoes || []).length) partes.push("Condições: " + p.condicoes.join(", "));
  if ((p.medicacoes || []).length) partes.push("Medicações: " + p.medicacoes.map(m => m.nome + (m.dose ? " " + m.dose : "")).join(", "));
  return partes.join(". ");
}
function diasDesdeData(dataIso) {
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);
  return Math.round((hoje - new Date(dataIso + "T12:00:00")) / 86400000);
}
function textoHaQuantoTempo(dias) {
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 60) return "há " + dias + " dias";
  const meses = Math.floor(dias / 30);
  return meses < 24 ? "há cerca de " + meses + " meses" : "há mais de 2 anos";
}
function dataBr(iso) {
  return iso ? iso.split("-").reverse().join("/") : "";
}
function idCriseDaSessao(pacienteId, sessaoId) {
  return "s_" + pacienteId + "_" + String(sessaoId).replace(/[^A-Za-z0-9_-]/g, "_");
}

// Faixa de lembrete: CID/condições/medicações e a última crise.
function FaixaClinica({
  perfil,
  crises
}) {
  const texto = textoPerfilClinico(perfil);
  const comData = (crises || []).filter(c => c.data).sort((a, b) => b.data.localeCompare(a.data));
  const ultima = comData[0];
  if (!texto && !ultima) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#F5F0FF",
      border: "1px solid #D9C7F5",
      borderRadius: 10,
      padding: "10px 14px",
      marginBottom: 14,
      fontSize: 12.5,
      color: "#3B1D63",
      lineHeight: 1.6
    }
  }, texto && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Perfil cl\xEDnico:"), " ", texto), ultima && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "\xDAltima crise:"), " ", dataBr(ultima.data), " (", textoHaQuantoTempo(diasDesdeData(ultima.data)), ultima.intensidade ? ", " + ultima.intensidade : "", ")"));
}
function PainelPerfilClinico({
  usuario,
  paciente,
  perfil
}) {
  const [editando, setEditando] = useState(false);
  const [cids, setCids] = useState([]);
  const [condicoes, setCondicoes] = useState([]);
  const [medicacoes, setMedicacoes] = useState([]);
  const [ditado, setDitado] = useState("");
  const [organizando, setOrganizando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  function abrirEdicao() {
    setCids((perfil?.cids || []).map(c => ({
      ...c
    })));
    setCondicoes([...(perfil?.condicoes || [])]);
    setMedicacoes((perfil?.medicacoes || []).map(m => ({
      ...m
    })));
    setDitado("");
    setErro("");
    setEditando(true);
  }
  async function organizarComIA() {
    if (!ditado.trim()) {
      setErro("Escreva ou dite as informações antes de organizar.");
      return;
    }
    setOrganizando(true);
    setErro("");
    try {
      const fn = appAdmin.functions("southamerica-east1").httpsCallable("organizarPerfilClinicoIA");
      const r = (await fn({
        texto: ditado
      })).data;
      const chave = c => ((c.codigo || "") + "|" + (c.descricao || "")).toLowerCase();
      setCids(prev => [...prev, ...(r.cids || []).filter(n => !prev.some(p => chave(p) === chave(n)))]);
      setCondicoes(prev => [...prev, ...(r.condicoes || []).filter(n => !prev.some(p => p.toLowerCase() === n.toLowerCase()))]);
      setMedicacoes(prev => [...prev, ...(r.medicacoes || []).filter(n => !prev.some(p => p.nome.toLowerCase() === n.nome.toLowerCase()))]);
      setDitado("");
    } catch (e) {
      setErro("Erro ao organizar: " + e.message);
    } finally {
      setOrganizando(false);
    }
  }
  async function salvar() {
    setSalvando(true);
    setErro("");
    try {
      await db.collection("clinica_perfil_clinico").doc(paciente.id).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        cids: cids.map(c => ({
          codigo: (c.codigo || "").trim(),
          descricao: (c.descricao || "").trim()
        })).filter(c => c.codigo || c.descricao),
        condicoes: condicoes.map(c => c.trim()).filter(Boolean),
        medicacoes: medicacoes.map(m => ({
          nome: (m.nome || "").trim(),
          dose: (m.dose || "").trim()
        })).filter(m => m.nome),
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      setEditando(false);
    } catch (e) {
      setErro("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }
  const rotuloLista = {
    fontSize: 11,
    fontWeight: 700,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: ".5px",
    margin: "12px 0 6px"
  };
  const chip = {
    display: "inline-block",
    background: "#F3F4F6",
    borderRadius: 999,
    padding: "4px 12px",
    fontSize: 12.5,
    marginRight: 6,
    marginBottom: 6
  };
  const vazio = !perfil || !(perfil.cids || []).length && !(perfil.condicoes || []).length && !(perfil.medicacoes || []).length;
  return /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "clipboard-list",
    tamanho: 16
  }), " Perfil cl\xEDnico: CID, condi\xE7\xF5es e medica\xE7\xF5es"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, "Fica vis\xEDvel no topo das anota\xE7\xF5es e \xE9 enviado \xE0 IA como contexto ao organizar cada sess\xE3o."), !editando && /*#__PURE__*/React.createElement("div", null, vazio ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nada cadastrado ainda para este paciente.") : /*#__PURE__*/React.createElement("div", null, (perfil.cids || []).length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: rotuloLista
  }, "CID / diagn\xF3sticos"), perfil.cids.map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: chip
  }, [c.codigo, c.descricao].filter(Boolean).join(" · ")))), (perfil.condicoes || []).length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: rotuloLista
  }, "Outras condi\xE7\xF5es"), perfil.condicoes.map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: chip
  }, c))), (perfil.medicacoes || []).length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: rotuloLista
  }, "Medica\xE7\xF5es em uso"), perfil.medicacoes.map((m, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: chip
  }, m.nome, m.dose ? " · " + m.dose : "")))), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      marginTop: 10
    },
    onClick: abrirEdicao
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "pencil",
    tamanho: 14
  }), " ", vazio ? "Cadastrar" : "Editar")), editando && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Dite ou escreva e a IA organiza ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: ditado,
    onChange: e => setDitado(e.target.value),
    rows: 3,
    placeholder: "Ex.: tem transtorno de ansiedade generalizada, F41.1, hipertens\xE3o, usa sertralina 50 mg de manh\xE3"
  }), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    style: {
      margin: "8px 0 4px"
    },
    onClick: organizarComIA,
    disabled: organizando
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "sparkles",
    tamanho: 14
  }), " ", organizando ? "Organizando..." : "Organizar com IA"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11.5,
      color: "var(--texto-suave)",
      margin: "2px 0 0"
    }
  }, "A IA acrescenta nas listas abaixo. Confira tudo antes de salvar."), /*#__PURE__*/React.createElement("div", {
    style: rotuloLista
  }, "CID / diagn\xF3sticos"), cids.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: {
      width: 110
    },
    placeholder: "C\xF3digo",
    value: c.codigo || "",
    onChange: e => setCids(cids.map((x, j) => j === i ? {
      ...x,
      codigo: e.target.value
    } : x))
  }), /*#__PURE__*/React.createElement("input", {
    style: {
      flex: 1
    },
    placeholder: "Descri\xE7\xE3o",
    value: c.descricao || "",
    onChange: e => setCids(cids.map((x, j) => j === i ? {
      ...x,
      descricao: e.target.value
    } : x))
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: () => setCids(cids.filter((_, j) => j !== i))
  }, "Remover"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: () => setCids([...cids, {
      codigo: "",
      descricao: ""
    }])
  }, "+ Adicionar CID"), /*#__PURE__*/React.createElement("div", {
    style: rotuloLista
  }, "Outras condi\xE7\xF5es"), condicoes.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: {
      flex: 1
    },
    placeholder: "Ex.: hipertens\xE3o",
    value: c,
    onChange: e => setCondicoes(condicoes.map((x, j) => j === i ? e.target.value : x))
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: () => setCondicoes(condicoes.filter((_, j) => j !== i))
  }, "Remover"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: () => setCondicoes([...condicoes, ""])
  }, "+ Adicionar condi\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
    style: rotuloLista
  }, "Medica\xE7\xF5es em uso"), medicacoes.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: {
      flex: 1
    },
    placeholder: "Medica\xE7\xE3o",
    value: m.nome || "",
    onChange: e => setMedicacoes(medicacoes.map((x, j) => j === i ? {
      ...x,
      nome: e.target.value
    } : x))
  }), /*#__PURE__*/React.createElement("input", {
    style: {
      width: 150
    },
    placeholder: "Dose",
    value: m.dose || "",
    onChange: e => setMedicacoes(medicacoes.map((x, j) => j === i ? {
      ...x,
      dose: e.target.value
    } : x))
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: () => setMedicacoes(medicacoes.filter((_, j) => j !== i))
  }, "Remover"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: () => setMedicacoes([...medicacoes, {
      nome: "",
      dose: ""
    }])
  }, "+ Adicionar medica\xE7\xE3o"), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: () => setEditando(false)
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: salvar,
    disabled: salvando
  }, salvando ? "Salvando..." : "Salvar perfil clínico"))), !editando && erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro));
}
function PainelCrises({
  usuario,
  paciente,
  crises
}) {
  const [formAberto, setFormAberto] = useState(false);
  const [data, setData] = useState("");
  const [intensidade, setIntensidade] = useState("");
  const [obs, setObs] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [verTodas, setVerTodas] = useState(false);
  const lista = [...crises].filter(c => c.data).sort((a, b) => b.data.localeCompare(a.data));
  const ultima = lista[0];
  const diasUltima = ultima ? diasDesdeData(ultima.data) : null;
  const ate30 = lista.filter(c => diasDesdeData(c.data) <= 30).length;
  const ate90 = lista.filter(c => diasDesdeData(c.data) <= 90).length;
  let intervaloMedio = null;
  if (lista.length >= 2) {
    const dias = [];
    for (let i = 0; i < lista.length - 1; i++) dias.push(diasDesdeData(lista[i + 1].data) - diasDesdeData(lista[i].data));
    intervaloMedio = Math.round(dias.reduce((a, b) => a + b, 0) / dias.length);
  }

  // Últimos 6 meses, do mais antigo ao mais recente.
  const meses = [];
  const ref = new Date();
  ref.setDate(1);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const chave = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    const doMes = lista.filter(c => c.data.startsWith(chave));
    meses.push({
      chave,
      rotulo: d.toLocaleDateString("pt-BR", {
        month: "short"
      }).replace(".", ""),
      qtd: doMes.length,
      cor: corDaIntensidade(["intensa", "moderada", "leve"].find(n => doMes.some(c => c.intensidade === n)))
    });
  }
  const maxQtd = Math.max(1, ...meses.map(m => m.qtd));
  function abrirForm() {
    setData(new Date().toISOString().slice(0, 10));
    setIntensidade("");
    setObs("");
    setErro("");
    setFormAberto(true);
  }
  async function registrar() {
    if (!data) {
      setErro("Informe a data da crise.");
      return;
    }
    if (!intensidade) {
      setErro("Escolha a intensidade.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await db.collection("clinica_crises").add({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        data,
        intensidade,
        obs: obs.trim(),
        sessaoId: null,
        origem: "manual",
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      setFormAberto(false);
    } catch (e) {
      setErro("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }
  async function excluir(c) {
    if (!confirm("Excluir a crise de " + dataBr(c.data) + "?")) return;
    try {
      await db.collection("clinica_crises").doc(c.id).delete();
    } catch (e) {
      alert("Erro ao excluir: " + e.message);
    }
  }
  const visiveis = verTodas ? lista : lista.slice(0, 6);
  const quadro = {
    background: "#F9FAFB",
    border: "1px solid var(--borda)",
    borderRadius: 10,
    padding: "10px 14px",
    minWidth: 120
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "activity",
    tamanho: 16
  }), " Evolu\xE7\xE3o das crises"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, "Marque \"em crise\" dentro de cada anota\xE7\xE3o, ou lance aqui uma crise antiga com a data."), lista.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma crise registrada para este paciente.") : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: quadro
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#6B7280",
      fontWeight: 700
    }
  }, "\xDALTIMA CRISE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700
    }
  }, dataBr(ultima.data)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#6B7280"
    }
  }, textoHaQuantoTempo(diasUltima))), /*#__PURE__*/React.createElement("div", {
    style: quadro
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#6B7280",
      fontWeight: 700
    }
  }, "NOS \xDALTIMOS 30 DIAS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700
    }
  }, ate30)), /*#__PURE__*/React.createElement("div", {
    style: quadro
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#6B7280",
      fontWeight: 700
    }
  }, "NOS \xDALTIMOS 90 DIAS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700
    }
  }, ate90)), /*#__PURE__*/React.createElement("div", {
    style: quadro
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#6B7280",
      fontWeight: 700
    }
  }, "INTERVALO M\xC9DIO"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700
    }
  }, intervaloMedio === null ? "—" : intervaloMedio + " dias"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#6B7280"
    }
  }, lista.length, " registrada(s)"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "#6B7280",
      textTransform: "uppercase",
      marginBottom: 6
    }
  }, "Crises por m\xEAs (\xFAltimos 6 meses)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 10,
      height: 90,
      marginBottom: 16
    }
  }, meses.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.chave,
    style: {
      flex: 1,
      maxWidth: 70,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700
    }
  }, m.qtd), /*#__PURE__*/React.createElement("div", {
    style: {
      height: Math.max(3, Math.round(m.qtd / maxQtd * 56)),
      background: m.qtd ? m.cor : "#E5E7EB",
      borderRadius: 4
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#6B7280",
      marginTop: 3
    }
  }, m.rotulo)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, visiveis.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      border: "1px solid var(--borda)",
      borderRadius: 10,
      padding: "8px 12px",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 13
    }
  }, dataBr(c.data)), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 10,
      fontSize: 12,
      fontWeight: 700,
      color: corDaIntensidade(c.intensidade)
    }
  }, c.intensidade), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 10,
      fontSize: 11,
      color: "#6B7280"
    }
  }, c.origem === "manual" ? "lançada à mão" : "da anotação da sessão"), c.obs && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#4B5563",
      marginTop: 2
    }
  }, c.obs)), c.origem === "manual" && /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      fontSize: 11,
      padding: "4px 10px"
    },
    onClick: () => excluir(c)
  }, "Excluir")))), lista.length > 6 && /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      marginTop: 8
    },
    onClick: () => setVerTodas(!verTodas)
  }, verTodas ? "Mostrar menos" : "Ver todas (" + lista.length + ")")), !formAberto ? /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    style: {
      marginTop: 12
    },
    onClick: abrirForm
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "plus",
    tamanho: 14
  }), " Registrar crise com data") : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      border: "1px solid var(--borda)",
      borderRadius: 10,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("label", null, "Data da crise"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: data,
    onChange: e => setData(e.target.value)
  }), /*#__PURE__*/React.createElement("label", {
    style: {
      marginTop: 10
    }
  }, "Intensidade"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, INTENSIDADES_CRISE.map(i => /*#__PURE__*/React.createElement("button", {
    key: i.id,
    type: "button",
    onClick: () => setIntensidade(i.id),
    style: {
      padding: "6px 14px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 12.5,
      border: "2px solid " + i.cor,
      background: intensidade === i.id ? i.cor : "white",
      color: intensidade === i.id ? "white" : i.cor
    }
  }, i.rotulo))), /*#__PURE__*/React.createElement("label", {
    style: {
      marginTop: 10
    }
  }, "Observa\xE7\xE3o ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: obs,
    onChange: e => setObs(e.target.value),
    rows: 2,
    placeholder: "O que aconteceu, dura\xE7\xE3o, gatilho..."
  }), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: () => setFormAberto(false)
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: registrar,
    disabled: salvando
  }, salvando ? "Salvando..." : "Registrar crise"))));
}
function escHtmlRel(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Relatório resumido: curto, com a identidade da psicóloga, para entregar a
// terceiros se solicitado. A IA escreve o texto, a psicóloga revisa e só então
// o PDF é gerado. CID, medicações e crises só entram se ela marcar.
function ModalRelatorioResumido({
  paciente,
  cfg,
  perfil,
  crisesDoPeriodo,
  notasDoPeriodo,
  periodoTexto,
  aoFechar
}) {
  const [finalidade, setFinalidade] = useState("");
  const [resumo, setResumo] = useState("");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [incluirCid, setIncluirCid] = useState(false);
  const [incluirMedicacoes, setIncluirMedicacoes] = useState(false);
  const [incluirCrises, setIncluirCrises] = useState(false);
  const temCid = (perfil?.cids || []).length > 0;
  const temMedicacoes = (perfil?.medicacoes || []).length > 0 || (perfil?.condicoes || []).length > 0;
  async function gerarTexto() {
    setGerando(true);
    setErro("");
    try {
      const fn = appAdmin.functions("southamerica-east1").httpsCallable("resumirPeriodoIA");
      const r = await fn({
        notas: notasDoPeriodo.map(n => ({
          data: n.data,
          tcc: n.tcc || {}
        })),
        pacienteNome: paciente.nome,
        periodo: periodoTexto,
        finalidade
      });
      setResumo(r.data.resumo || "");
    } catch (e) {
      setErro("Erro ao gerar o texto: " + e.message);
    } finally {
      setGerando(false);
    }
  }
  function gerarPdf() {
    if (!resumo.trim()) {
      setErro("Gere ou escreva o texto do resumo antes de criar o PDF.");
      return;
    }
    const cor = cfg.corPrimaria || "#6A2BD9";
    const linhaCrp = [cfg.crp ? "CRP " + cfg.crp : "", cfg.tituloProfissional || ""].filter(Boolean).join(" · ");
    const hoje = new Date().toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const extras = [];
    if (incluirCid && temCid) {
      extras.push("<div><strong>Diagnóstico (CID):</strong> " + escHtmlRel(perfil.cids.map(c => [c.codigo, c.descricao].filter(Boolean).join(" - ")).join("; ")) + "</div>");
    }
    if (incluirMedicacoes && temMedicacoes) {
      if ((perfil.condicoes || []).length) extras.push("<div><strong>Outras condições:</strong> " + escHtmlRel(perfil.condicoes.join(", ")) + "</div>");
      if ((perfil.medicacoes || []).length) extras.push("<div><strong>Medicações em uso:</strong> " + escHtmlRel(perfil.medicacoes.map(m => m.nome + (m.dose ? " " + m.dose : "")).join(", ")) + "</div>");
    }
    if (incluirCrises) {
      const n = crisesDoPeriodo.length;
      extras.push("<div><strong>Crises no período:</strong> " + (n === 0 ? "nenhuma registrada" : n + " registrada(s)") + "</div>");
    }
    const paragrafos = resumo.trim().split(/\n{2,}|\n/).filter(Boolean).map(p => "<p style='margin:0 0 12px;text-align:justify'>" + escHtmlRel(p) + "</p>").join("");
    const html = "<html><head><meta charset='UTF-8'><title>Relatório resumido — " + escHtmlRel(paciente.nome) + "</title>" + "<style>body{font-family:Arial,sans-serif;margin:40px;color:#1f2937;font-size:13px;line-height:1.7}" + "@media print{body{margin:20px}.no-print{display:none}}</style></head><body>" + "<div style='display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid " + cor + ";padding-bottom:14px;margin-bottom:24px'>" + "<div><div style='font-size:20px;font-weight:700;color:" + cor + "'>" + escHtmlRel(cfg.nome || "Clínica") + "</div>" + (linhaCrp ? "<div style='font-size:11px;color:#6B7280'>" + escHtmlRel(linhaCrp) + "</div>" : "") + (cfg.cidade ? "<div style='font-size:11px;color:#6B7280'>" + escHtmlRel(cfg.cidade) + "</div>" : "") + "</div>" + (cfg.logoUrl ? "<img src='" + cfg.logoUrl + "' style='height:48px;object-fit:contain'>" : "") + "</div>" + "<div style='text-align:center;margin-bottom:22px'>" + "<div style='font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:1px'>Relatório Psicológico Resumido</div></div>" + "<div style='background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:12px 16px;margin-bottom:22px;font-size:12.5px'>" + "<div><strong>Paciente:</strong> " + escHtmlRel(paciente.nome) + "</div>" + "<div><strong>Período:</strong> " + escHtmlRel(periodoTexto) + "</div>" + "<div><strong>Sessões com anotação no período:</strong> " + notasDoPeriodo.length + "</div>" + (finalidade.trim() ? "<div><strong>Finalidade:</strong> " + escHtmlRel(finalidade.trim()) + "</div>" : "") + extras.join("") + "</div>" + "<div style='font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px'>Resumo do acompanhamento</div>" + paragrafos + "<div style='margin-top:48px;text-align:center'>" + "<div style='font-size:12px;color:#6B7280;margin-bottom:34px'>" + escHtmlRel(cfg.cidade ? cfg.cidade + ", " : "") + hoje + "</div>" + "<div style='display:inline-block;border-top:1px solid #1f2937;padding-top:6px;min-width:260px'>" + "<div style='font-weight:700'>" + escHtmlRel(cfg.nome || "") + "</div>" + (linhaCrp ? "<div style='font-size:11px;color:#6B7280'>" + escHtmlRel(linhaCrp) + "</div>" : "") + "</div></div>" + "<div style='font-size:10px;color:#9CA3AF;text-align:center;margin-top:30px'>Documento confidencial — Resolução CFP nº 06/2019</div>" + "<div class='no-print' style='text-align:center;margin-top:20px'>" + "<button onclick='window.print()' style='background:" + cor + ";color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer'>Imprimir / Salvar PDF</button></div>" + "</body></html>";
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => {
      w.focus();
      w.print();
    }, 600);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: () => {
      if (!resumo.trim()) aoFechar();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-largo",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0
    }
  }, "Relat\xF3rio resumido"), /*#__PURE__*/React.createElement("button", {
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
  }))), /*#__PURE__*/React.createElement(ProntAvisoCrp, {
    cfg: cfg
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--texto-suave)",
      marginBottom: 12
    }
  }, paciente.nome, " \xB7 ", periodoTexto, " \xB7 ", notasDoPeriodo.length, " anota\xE7\xE3o(\xF5es)"), /*#__PURE__*/React.createElement("label", null, "Finalidade ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional, ex.: para o m\xE9dico, para a escola)")), /*#__PURE__*/React.createElement("input", {
    value: finalidade,
    onChange: e => setFinalidade(e.target.value),
    placeholder: "Para quem ou para qu\xEA \xE9 este relat\xF3rio"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "12px 0 4px",
      fontSize: 12,
      fontWeight: 700,
      color: "#6B7280",
      textTransform: "uppercase"
    }
  }, "Incluir no documento"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      fontWeight: 400,
      opacity: temCid ? 1 : 0.5
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    style: {
      width: "auto"
    },
    disabled: !temCid,
    checked: incluirCid,
    onChange: e => setIncluirCid(e.target.checked)
  }), " CID / diagn\xF3stico ", !temCid && "(nenhum cadastrado)"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      fontWeight: 400,
      opacity: temMedicacoes ? 1 : 0.5
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    style: {
      width: "auto"
    },
    disabled: !temMedicacoes,
    checked: incluirMedicacoes,
    onChange: e => setIncluirMedicacoes(e.target.checked)
  }), " Condi\xE7\xF5es e medica\xE7\xF5es ", !temMedicacoes && "(nenhuma cadastrada)"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      fontWeight: 400
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    style: {
      width: "auto"
    },
    checked: incluirCrises,
    onChange: e => setIncluirCrises(e.target.checked)
  }), " Quantidade de crises no per\xEDodo"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      margin: "14px 0 8px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: gerarTexto,
    disabled: gerando
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "sparkles",
    tamanho: 15
  }), " ", gerando ? "Escrevendo..." : resumo ? "Gerar o texto de novo" : "Gerar texto com IA"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: "var(--texto-suave)"
    }
  }, "A IA resume as anota\xE7\xF5es do per\xEDodo. Voc\xEA revisa antes do PDF.")), /*#__PURE__*/React.createElement("label", null, "Texto do resumo ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(revise e edite)")), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: resumo,
    onChange: e => setResumo(e.target.value),
    rows: 10,
    placeholder: "Clique em Gerar texto com IA, ou escreva o resumo aqui."
  }), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: aoFechar
  }, "Fechar"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: gerarPdf
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "file-text",
    tamanho: 15
  }), " Gerar PDF"))));
}
function ModalAnotacaoTCC({
  usuario,
  paciente,
  sessao,
  notaExistente,
  perfil,
  crises,
  criseExistente,
  aoFechar
}) {
  // Rascunho de segurança: guarda o que está sendo escrito no próprio navegador
  // (apenas nesta aba, some ao fechá-la) para não perder nada se a tela recarregar.
  const chaveRascunho = "psw_rascunho_tcc_" + paciente.id + "_" + sessao.id;
  const rascunho = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(chaveRascunho) || "null");
    } catch (e) {
      return null;
    }
  })();
  const [textoBruto, setTextoBruto] = useState(rascunho?.textoBruto ?? notaExistente?.textoBruto ?? "");
  const [tcc, setTcc] = useState(rascunho?.tcc ?? notaExistente?.tcc ?? {});
  const [notaId, setNotaId] = useState(notaExistente?.id || null);
  // crise: null = não informado, true = em crise, false = sem crise (apaga o registro, se houver).
  const [crise, setCrise] = useState(rascunho?.crise ?? (criseExistente ? true : null));
  const [intensidadeCrise, setIntensidadeCrise] = useState(rascunho?.intensidadeCrise ?? criseExistente?.intensidade ?? "");
  const [obsCrise, setObsCrise] = useState(rascunho?.obsCrise ?? criseExistente?.obs ?? "");
  const [salvoAuto, setSalvoAuto] = useState(false);
  const [organizando, setOrganizando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const temTcc = TCC_SECOES.some(s => tcc[s.key]);
  const cfg = useConfigProntuario(usuario.psiId);
  useEffect(() => {
    try {
      if (textoBruto.trim() || Object.keys(tcc).length || crise !== null) {
        sessionStorage.setItem(chaveRascunho, JSON.stringify({
          textoBruto,
          tcc,
          crise,
          intensidadeCrise,
          obsCrise
        }));
      }
    } catch (e) {}
  }, [textoBruto, tcc, crise, intensidadeCrise, obsCrise]);

  // Grava no Firestore sem fechar a janela; usada pelo salvamento automático
  // (ao organizar com IA e ao enviar tarefas por WhatsApp) e pelo botão Salvar.
  async function persistir(textoAtual, tccAtual) {
    const dados = {
      psi_id: usuario.psiId,
      pacienteId: paciente.id,
      pacienteNome: paciente.nome,
      sessaoId: sessao.id,
      pacoteId: sessao.pacoteId || null,
      origem: sessao.origem || null,
      sessaoAntigaId: sessao.sessaoAntigaId || null,
      pacoteAntigoId: sessao.pacoteAntigoId || null,
      data: sessao.data || null,
      textoBruto: textoAtual,
      tcc: tccAtual,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (notaId) {
      await db.collection("clinica_prontuarios").doc(notaId).update(dados);
    } else {
      const ref = await db.collection("clinica_prontuarios").add({
        ...dados,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      setNotaId(ref.id);
    }
    // Crise da sessão: um documento por sessão, para poder medir a evolução.
    const idCrise = idCriseDaSessao(paciente.id, sessao.id);
    if (crise === true && intensidadeCrise) {
      await db.collection("clinica_crises").doc(idCrise).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        data: sessao.data || null,
        intensidade: intensidadeCrise,
        obs: obsCrise.trim(),
        sessaoId: sessao.id,
        origem: "sessao",
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else if (crise === false) {
      try {
        await db.collection("clinica_crises").doc(idCrise).delete();
      } catch (e) {}
    }
  }
  function salvarAutomatico(textoAtual, tccAtual) {
    if (!textoAtual.trim()) return;
    persistir(textoAtual, tccAtual).then(() => setSalvoAuto(true)).catch(() => {});
  }

  // Manda ao paciente só as tarefas de casa, nunca o resto do prontuário.
  function enviarTarefasWhatsApp() {
    const tarefas = (tcc.tarefas || "").trim();
    if (!tarefas) {
      setErro("Não há tarefas preenchidas para enviar.");
      return;
    }
    setErro("");
    const assinatura = cfg.nome || "Sua psicóloga";
    // Se o telefone cadastrado é do responsável (ex.: a mãe), cumprimenta ele
    // e cita o paciente; senão, fala direto com o paciente.
    const wa = whatsappDoPaciente(paciente);
    const abertura = wa.ehResponsavel ? "Olá" + (wa.nome ? ", " + primeiroNomeDe(wa.nome) : "") + "! 😊\n\n" : "Olá, " + primeiroNomeDe(paciente.nome) + "! 😊\n\n";
    const titulo = wa.ehResponsavel ? "*Atividades da semana de " + primeiroNomeDe(paciente.nome) + ":*\n" : "*Atividades da Semana:*\n";
    const msg = abertura + titulo + tarefas + "\n\n" + "Qualquer dúvida, estou à disposição. 💜\n" + "_" + assinatura + "_";
    const numero = (wa.numero || paciente.celular || "").replace(/\D/g, "");
    const base = numero ? "https://wa.me/55" + numero : "https://wa.me/";
    salvarAutomatico(textoBruto, tcc);
    window.open(base + "?text=" + encodeURIComponent(msg), "_blank");
  }
  async function organizarComIA() {
    if (!textoBruto.trim()) {
      setErro("Digite ou dite as anotações antes de organizar.");
      return;
    }
    setOrganizando(true);
    setErro("");
    try {
      const fn = appAdmin.functions("southamerica-east1").httpsCallable("organizarProntuarioIA");
      const resultado = await fn({
        textoBruto,
        pacienteNome: paciente.nome,
        dataSessao: sessao.data,
        perfilClinico: textoPerfilClinico(perfil)
      });
      const novoTcc = resultado.data.tcc || {};
      setTcc(novoTcc);
      salvarAutomatico(textoBruto, novoTcc);
    } catch (e) {
      setErro("Erro ao organizar: " + e.message);
    } finally {
      setOrganizando(false);
    }
  }
  async function salvar() {
    if (!textoBruto.trim()) {
      setErro("Insira alguma anotação antes de salvar.");
      return;
    }
    if (crise === true && !intensidadeCrise) {
      setErro("Você marcou que o paciente está em crise. Escolha a intensidade.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await persistir(textoBruto, tcc);
      try {
        sessionStorage.removeItem(chaveRascunho);
      } catch (e) {}
      aoFechar();
    } catch (e) {
      setErro("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }
  const dataFormatada = sessao.data ? new Date(sessao.data + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }) : "";
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: () => {
      if (!textoBruto.trim()) aoFechar();
    }
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
  }, "Anota\xE7\xE3o de Sess\xE3o TCC"), /*#__PURE__*/React.createElement("button", {
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
      padding: "0 0 10px",
      fontSize: 12,
      color: "var(--texto-suave)"
    }
  }, paciente.nome, " \xB7 ", dataFormatada, sessao.horario ? " · " + sessao.horario : ""), /*#__PURE__*/React.createElement(FaixaClinica, {
    perfil: perfil,
    crises: (crises || []).filter(c => c.sessaoId !== sessao.id)
  }), /*#__PURE__*/React.createElement("label", null, "Anota\xE7\xF5es brutas da sess\xE3o ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(dite ou escreva livremente)")), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: textoBruto,
    onChange: e => setTextoBruto(e.target.value),
    rows: 6,
    placeholder: "Descreva o que aconteceu na sess\xE3o, os temas discutidos, t\xE9cnicas usadas, tarefas combinadas..."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      margin: "12px 0 18px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: organizarComIA,
    disabled: organizando
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "sparkles",
    tamanho: 15
  }), " ", organizando ? "Organizando..." : "Organizar com IA"), temTcc && !organizando && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--sucesso)",
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "check-circle",
    tamanho: 13
  }), " Organizado")), temTcc && /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--borda)",
      borderRadius: 10,
      padding: "14px 16px",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--cor-marca)",
      marginBottom: 12
    }
  }, "Prontu\xE1rio TCC \u2014 revise e edite se necess\xE1rio"), TCC_SECOES.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.key,
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "#6B7280",
      textTransform: "uppercase"
    }
  }, s.rotulo), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: tcc[s.key] || "",
    onChange: e => setTcc(prev => ({
      ...prev,
      [s.key]: e.target.value
    })),
    rows: 3
  }), s.key === "tarefas" && (tcc.tarefas || "").trim() !== "" && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    style: {
      marginTop: 8
    },
    onClick: enviarTarefasWhatsApp
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "message-circle",
    tamanho: 14
  }), " Enviar tarefas por WhatsApp")))), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--borda)",
      borderRadius: 10,
      padding: "12px 14px",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#6B7280",
      textTransform: "uppercase",
      marginBottom: 8
    }
  }, "O paciente est\xE1 em crise?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCrise(crise === true ? null : true),
    style: {
      padding: "6px 16px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 12.5,
      border: "2px solid #DC2626",
      background: crise === true ? "#DC2626" : "white",
      color: crise === true ? "white" : "#DC2626"
    }
  }, "Sim, em crise"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCrise(crise === false ? null : false),
    style: {
      padding: "6px 16px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 12.5,
      border: "2px solid #059669",
      background: crise === false ? "#059669" : "white",
      color: crise === false ? "white" : "#059669"
    }
  }, "N\xE3o")), crise === true && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("label", null, "Intensidade"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 8
    }
  }, INTENSIDADES_CRISE.map(i => /*#__PURE__*/React.createElement("button", {
    key: i.id,
    type: "button",
    onClick: () => setIntensidadeCrise(i.id),
    style: {
      padding: "5px 14px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 12.5,
      border: "2px solid " + i.cor,
      background: intensidadeCrise === i.id ? i.cor : "white",
      color: intensidadeCrise === i.id ? "white" : i.cor
    }
  }, i.rotulo))), /*#__PURE__*/React.createElement("label", null, "Observa\xE7\xE3o da crise ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement(TextAreaVoz, {
    value: obsCrise,
    onChange: e => setObsCrise(e.target.value),
    rows: 2,
    placeholder: "O que aconteceu, gatilho, dura\xE7\xE3o..."
  })), crise === null && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11.5,
      color: "var(--texto-suave)",
      margin: "8px 0 0"
    }
  }, "Sem resposta, nada \xE9 registrado sobre crise nesta sess\xE3o.")), rascunho && !notaExistente && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--texto-suave)"
    }
  }, "Rascunho recuperado: voc\xEA n\xE3o perdeu o que escreveu."), salvoAuto && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--sucesso)"
    }
  }, "Anota\xE7\xE3o salva automaticamente."), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: () => {
      try {
        sessionStorage.removeItem(chaveRascunho);
      } catch (e) {}
      aoFechar();
    }
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: salvar,
    disabled: salvando
  }, salvando ? "Salvando..." : "Salvar anotação"))));
}
function AbaSessoesTCC({
  usuario,
  paciente
}) {
  const [sessoes, setSessoes] = useState([]);
  const [notas, setNotas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const [resumoAberto, setResumoAberto] = useState(false);
  const [sessaoModal, setSessaoModal] = useState(null);
  const [notasCarregadas, setNotasCarregadas] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [crises, setCrises] = useState([]);
  const [crisesCarregadas, setCrisesCarregadas] = useState(false);
  const cfg = useConfigProntuario(usuario.psiId);

  // Aberto pelo botão "Prontuário TCC" do sistema antigo: assim que as sessões
  // e as anotações carregam, abre a janela da sessão pedida. A sessão do sistema
  // antigo não existe aqui (de propósito: não cria sessão nem evento na agenda),
  // então ela vai como uma sessão avulsa com id "antigo:<id>". Se já houver
  // anotação para ela, reabre a existente em vez de criar outra.
  useEffect(() => {
    if (!acaoPorLinkPendente() || acaoPorLink.pacienteId !== paciente.id) return;
    if (carregando || !notasCarregadas || !crisesCarregadas) return;
    const sessaoId = "antigo:" + acaoPorLink.sessao;
    setSessaoModal({
      sessao: {
        id: sessaoId,
        data: acaoPorLink.data,
        horario: acaoPorLink.hora,
        pacoteId: null,
        origem: "clinica-antiga",
        sessaoAntigaId: acaoPorLink.sessao,
        pacoteAntigoId: acaoPorLink.pacote || null
      },
      nota: notas.find(n => n.sessaoId === sessaoId) || null
    });
    encerrarAcaoPorLink();
  }, [carregando, notasCarregadas, crisesCarregadas]);
  useEffect(() => {
    const unsubSess = db.collection("clinica_sessoes").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).onSnapshot(snap => {
      const lista = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      lista.sort((a, b) => (b.data || "").localeCompare(a.data || ""));
      setSessoes(lista);
      setCarregando(false);
    }, () => setCarregando(false));
    const unsubNotas = db.collection("clinica_prontuarios").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).onSnapshot(snap => {
      setNotas(snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })));
      setNotasCarregadas(true);
    }, () => setNotasCarregadas(true));
    const unsubPerfil = db.collection("clinica_perfil_clinico").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).onSnapshot(snap => setPerfil(snap.docs.length ? {
      id: snap.docs[0].id,
      ...snap.docs[0].data()
    } : null), () => setPerfil(null));
    const unsubCrises = db.collection("clinica_crises").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).onSnapshot(snap => {
      setCrises(snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })));
      setCrisesCarregadas(true);
    }, () => setCrisesCarregadas(true));
    return () => {
      unsubSess();
      unsubNotas();
      unsubPerfil();
      unsubCrises();
    };
  }, [usuario.psiId, paciente.id]);
  const mesesDisponiveis = [...new Set(sessoes.map(s => (s.data || "").slice(0, 7)).filter(Boolean))].sort().reverse();
  // Mês escolhido na lista = período do primeiro ao último dia daquele mês.
  const mesFiltro = de && ate && de.endsWith("-01") && ate.endsWith("-31") && de.slice(0, 7) === ate.slice(0, 7) ? de.slice(0, 7) : "";
  const temPeriodo = !!(de || ate);
  const noPeriodo = data => !!data && (!de || data >= de) && (!ate || data <= ate);
  const comOrdem = lista => ordem === "antigas" ? [...lista].reverse() : lista;
  const fmtBr = iso => iso ? iso.split("-").reverse().join("/") : "";
  const sessoesExibidas = comOrdem(temPeriodo ? sessoes.filter(s => noPeriodo(s.data)) : sessoes);

  // Anotações cuja sessão não está aqui (ex.: feitas pelo botão do sistema antigo
  // da clínica). Sem esta lista elas ficariam salvas mas invisíveis.
  const idsDasSessoes = new Set(sessoes.map(s => s.id));
  const notasSemSessao = notas.filter(n => !idsDasSessoes.has(n.sessaoId)).filter(n => !temPeriodo || noPeriodo(n.data)).sort((a, b) => (ordem === "antigas" ? 1 : -1) * (a.data || "").localeCompare(b.data || ""));
  function periodoDescrito() {
    if (!temPeriodo) return "Todas as sessões";
    if (mesFiltro) return new Date(mesFiltro + "-01T12:00:00").toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric"
    });
    return de && ate ? "de " + fmtBr(de) + " a " + fmtBr(ate) : de ? "a partir de " + fmtBr(de) : "até " + fmtBr(ate);
  }
  function abrirResumo() {
    if (de && ate && de > ate) {
      alert("A data inicial é depois da data final. Confira o período.");
      return;
    }
    if (notas.filter(n => !temPeriodo || noPeriodo(n.data)).length === 0) {
      alert("Nenhuma anotação registrada" + (temPeriodo ? " neste período" : "") + ".");
      return;
    }
    setResumoAberto(true);
  }
  function gerarPdf() {
    if (de && ate && de > ate) {
      alert("A data inicial é depois da data final. Confira o período.");
      return;
    }
    const notasFiltradas = (temPeriodo ? notas.filter(n => noPeriodo(n.data)) : [...notas]).sort((a, b) => (ordem === "antigas" ? 1 : -1) * (b.data || "").localeCompare(a.data || "") * -1);
    if (notasFiltradas.length === 0) {
      alert("Nenhuma anotação registrada" + (temPeriodo ? " neste período" : "") + ".");
      return;
    }
    const cor = cfg.corPrimaria || "#6A2BD9";
    const linhaCrp = [cfg.crp ? "CRP " + cfg.crp : "", cfg.tituloProfissional || ""].filter(Boolean).join(" · ");
    const periodo = !temPeriodo ? "Todas as sessões" : mesFiltro ? new Date(mesFiltro + "-01T12:00:00").toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric"
    }) : de && ate ? "de " + fmtBr(de) + " a " + fmtBr(ate) : de ? "a partir de " + fmtBr(de) : "até " + fmtBr(ate);
    const sessoesHtml = notasFiltradas.map(n => {
      const dataFmt = n.data ? new Date(n.data + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }) : "—";
      const t = n.tcc || {};
      return "<div style='margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #E5E7EB'>" + "<div style='font-size:13px;font-weight:700;color:" + cor + ";margin-bottom:14px;text-transform:uppercase'>" + dataFmt + (crises.find(c => c.sessaoId === n.sessaoId) ? " <span style='color:#DC2626'>· crise " + crises.find(c => c.sessaoId === n.sessaoId).intensidade + "</span>" : "") + "</div>" + TCC_SECOES.filter(s => t[s.key]).map(s => "<div style='margin-bottom:10px'>" + "<div style='font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px'>" + s.rotulo + "</div>" + "<div style='font-size:12.5px;line-height:1.7;color:#1f2937;white-space:pre-wrap'>" + t[s.key] + "</div>" + "</div>").join("") + "</div>";
    }).join("");
    const html = "<html><head><meta charset='UTF-8'><title>Prontuário TCC — " + paciente.nome + "</title>" + "<style>body{font-family:Arial,sans-serif;margin:40px;color:#1f2937;font-size:13px;line-height:1.6}" + "@media print{body{margin:20px}.no-print{display:none}}</style></head><body>" + "<div style='display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid " + cor + ";padding-bottom:14px;margin-bottom:24px'>" + "<div><div style='font-size:20px;font-weight:700;color:" + cor + "'>" + (cfg.nome || "Clínica") + "</div>" + (linhaCrp ? "<div style='font-size:11px;color:#6B7280'>" + linhaCrp + "</div>" : "") + (cfg.cidade ? "<div style='font-size:11px;color:#6B7280'>" + cfg.cidade + "</div>" : "") + "</div>" + (cfg.logoUrl ? "<img src='" + cfg.logoUrl + "' style='height:48px;object-fit:contain'>" : "") + "</div>" + "<div style='text-align:center;margin-bottom:24px'>" + "<div style='font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:1px'>Prontuário de Sessões TCC</div>" + "<div style='font-size:12px;color:#6B7280;margin-top:4px'>" + paciente.nome + " · " + periodo + "</div>" + (textoPerfilClinico(perfil) ? "<div style='font-size:11px;color:#6B7280;margin-top:4px'>" + textoPerfilClinico(perfil) + "</div>" : "") + "</div>" + sessoesHtml + "<div style='font-size:10px;color:#9CA3AF;text-align:center;margin-top:24px'>Documento confidencial — Resolução CFP nº 06/2019</div>" + "<div class='no-print' style='text-align:center;margin-top:20px'>" + "<button onclick='window.print()' style='background:" + cor + ";color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer'>Imprimir / Salvar PDF</button></div>" + "</body></html>";
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => {
      w.focus();
      w.print();
    }, 600);
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FaixaClinica, {
    perfil: perfil,
    crises: crises
  }), /*#__PURE__*/React.createElement(PainelPerfilClinico, {
    usuario: usuario,
    paciente: paciente,
    perfil: perfil
  }), /*#__PURE__*/React.createElement(PainelCrises, {
    usuario: usuario,
    paciente: paciente,
    crises: crises
  }), /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "notebook-pen",
    tamanho: 16
  }), " Anota\xE7\xF5es de Sess\xE3o TCC"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, "Registre e organize as anota\xE7\xF5es de cada sess\xE3o no formato TCC com aux\xEDlio de IA. Gere relat\xF3rios em PDF por per\xEDodo."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("select", {
    className: "campo-select",
    value: mesFiltro,
    onChange: e => {
      const m = e.target.value;
      setDe(m ? m + "-01" : "");
      setAte(m ? m + "-31" : "");
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Todos os meses"), mesesDisponiveis.map(m => /*#__PURE__*/React.createElement("option", {
    key: m,
    value: m
  }, new Date(m + "-01").toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  }), " ", "(", notas.filter(n => (n.data || "").startsWith(m)).length, " nota(s))"))), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: gerarPdf
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "file-text",
    tamanho: 15
  }), " Relat\xF3rio detalhado (PDF)"), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: abrirResumo
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "send",
    tamanho: 15
  }), " Relat\xF3rio resumido")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "flex-end",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "#6B7280"
    }
  }, "De"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "campo-select",
    value: de,
    onChange: e => setDe(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "#6B7280"
    }
  }, "At\xE9"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "campo-select",
    value: ate,
    onChange: e => setAte(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "#6B7280"
    }
  }, "Ordem"), /*#__PURE__*/React.createElement("select", {
    className: "campo-select",
    value: ordem,
    onChange: e => setOrdem(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "recentes"
  }, "Mais recentes primeiro"), /*#__PURE__*/React.createElement("option", {
    value: "antigas"
  }, "Mais antigas primeiro"))), temPeriodo && /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: () => {
      setDe("");
      setAte("");
    }
  }, "Limpar per\xEDodo")), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao",
    style: {
      marginTop: -8
    }
  }, "O per\xEDodo e a ordem valem para a lista e para os relat\xF3rios. O detalhado \xE9 para sua consulta; o resumido \xE9 o que se envia, se solicitado."), carregando ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Carregando sess\xF5es...") : sessoesExibidas.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma sess\xE3o", temPeriodo ? " neste período" : "", " encontrada para este paciente.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, sessoesExibidas.map(s => {
    const nota = notas.find(n => n.sessaoId === s.id);
    const dataFmt = s.data ? new Date(s.data + "T12:00:00").toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    }) : "Data não definida";
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
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
    }, dataFmt, s.horario ? " · " + s.horario : ""), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--texto-suave)",
        marginTop: 2
      }
    }, [s.modalidade, s.status].filter(Boolean).join(" · ")), nota && /*#__PURE__*/React.createElement("div", {
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
      onClick: () => setSessaoModal({
        sessao: s,
        nota: nota || null
      })
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: nota ? "eye" : "notebook-pen",
      tamanho: 13
    }), " ", nota ? "Ver / Editar" : "Anotar"));
  })), notasSemSessao.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--texto-suave)",
      textTransform: "uppercase",
      letterSpacing: ".5px",
      marginBottom: 4
    }
  }, "Anota\xE7\xF5es de sess\xF5es que n\xE3o est\xE3o no PsiCoWorking"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao",
    style: {
      marginBottom: 10
    }
  }, "Registradas a partir do sistema antigo da cl\xEDnica. A sess\xE3o e a agenda continuam l\xE1; s\xF3 a anota\xE7\xE3o fica aqui."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, notasSemSessao.map(n => {
    const dataFmt = n.data ? new Date(n.data + "T12:00:00").toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    }) : "Data não definida";
    return /*#__PURE__*/React.createElement("div", {
      key: n.id,
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
    }, dataFmt), /*#__PURE__*/React.createElement("div", {
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
      className: "botao-secundario",
      style: {
        fontSize: 12,
        padding: "6px 14px"
      },
      onClick: () => setSessaoModal({
        sessao: {
          id: n.sessaoId,
          data: n.data,
          horario: "",
          pacoteId: n.pacoteId || null,
          origem: n.origem || null,
          sessaoAntigaId: n.sessaoAntigaId || null,
          pacoteAntigoId: n.pacoteAntigoId || null
        },
        nota: n
      })
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "eye",
      tamanho: 13
    }), " Ver / Editar"));
  })))), resumoAberto && /*#__PURE__*/React.createElement(ModalRelatorioResumido, {
    paciente: paciente,
    cfg: cfg,
    perfil: perfil,
    crisesDoPeriodo: crises.filter(c => !temPeriodo || noPeriodo(c.data)),
    notasDoPeriodo: notas.filter(n => !temPeriodo || noPeriodo(n.data)).sort((a, b) => (a.data || "").localeCompare(b.data || "")),
    periodoTexto: periodoDescrito(),
    aoFechar: () => setResumoAberto(false)
  }), sessaoModal && /*#__PURE__*/React.createElement(ModalAnotacaoTCC, {
    usuario: usuario,
    paciente: paciente,
    sessao: sessaoModal.sessao,
    notaExistente: sessaoModal.nota,
    perfil: perfil,
    crises: crises,
    criseExistente: crises.find(c => c.sessaoId === sessaoModal.sessao.id) || null,
    aoFechar: () => setSessaoModal(null)
  }));
}