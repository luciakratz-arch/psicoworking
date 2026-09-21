// ═══════════════════════════════════════════════════════════════
//  app_dashboard.js — Dashboard
//
//  Portado do painel real da Dra. Lucia, mas só com os números que
//  já temos de verdade (Pacientes, Agenda). Financeiro e Terapia de
//  Casais aparecem quando esses módulos existirem — nada de número
//  inventado (CLAUDE.md REGRA 5: escopo cirúrgico).
// ═══════════════════════════════════════════════════════════════

const COLECOES_ATIVIDADE = [{
  colecao: "clinica_diario",
  rotulo: "Diário",
  icone: "book-open"
}, {
  colecao: "clinica_humor",
  rotulo: "Humor",
  icone: "smile"
}, {
  colecao: "clinica_arvore_decisao",
  rotulo: "Árvore Decisão",
  icone: "trees"
}];
function TelaDashboard({
  usuario,
  aoAbrirPaciente
}) {
  const [pacientes, setPacientes] = useState([]);
  const [carregandoPacientes, setCarregandoPacientes] = useState(true);
  const [sessoesHoje, setSessoesHoje] = useState(null); // null = não sabemos ainda
  const [atividades, setAtividades] = useState([]);
  const [carregandoAtividades, setCarregandoAtividades] = useState(true);
  const [linkAnivCopiado, setLinkAnivCopiado] = useState(false);
  useEffect(() => {
    const cancelar = db.collection("clinica_pacientes").where("psi_id", "==", usuario.psiId).onSnapshot(snapshot => {
      setPacientes(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      setCarregandoPacientes(false);
    });
    return cancelar;
  }, [usuario.psiId]);
  useEffect(() => {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 1);
    chamarListarEventosAgenda({
      dataInicio: inicio.toISOString(),
      dataFim: fim.toISOString()
    }).then(resultado => setSessoesHoje((resultado.data.eventos || []).length)).catch(() => setSessoesHoje(null));
  }, [usuario.psiId]);
  useEffect(() => {
    // Busca as últimas atividades do paciente nas 3 ferramentas que já
    // existem no portal (o portal do paciente ainda não foi construído,
    // então isso aparece vazio até ter pacientes usando o app).
    Promise.all(COLECOES_ATIVIDADE.map(c => db.collection(c.colecao).where("psi_id", "==", usuario.psiId).get().then(snap => snap.docs.map(d => ({
      ...d.data(),
      _tipo: c.rotulo,
      _icone: c.icone
    }))).catch(() => []))).then(listas => {
      const todas = listas.flat();
      todas.sort((a, b) => (b.criadoEm?.toMillis?.() || 0) - (a.criadoEm?.toMillis?.() || 0));
      setAtividades(todas.slice(0, 20));
      setCarregandoAtividades(false);
    });
  }, [usuario.psiId]);
  const ativos = pacientes.filter(p => p.status === "ativo").length;
  const pendentes = pacientes.filter(p => p.status === "pendente").length;

  // Aniversários — campo clinica_pacientes.dataNasc ("YYYY-MM-DD"),
  // já coletado no cadastro (admin e autocadastro público), só
  // opcional. Comparação por mês/dia (não por Date completo, pra não
  // ter problema de fuso horário virando o dia errado).
  const pacientesAtivos = pacientes.filter(p => p.status === "ativo");
  const hojeD = new Date();
  const aniversariantesHoje = pacientesAtivos.filter(p => {
    if (!p.dataNasc) return false;
    return parseInt(p.dataNasc.slice(5, 7), 10) === hojeD.getMonth() + 1 && parseInt(p.dataNasc.slice(8, 10), 10) === hojeD.getDate();
  });
  const proximosAniv = pacientesAtivos.filter(p => {
    if (!p.dataNasc || aniversariantesHoje.some(a => a.id === p.id)) return false;
    for (let i = 1; i <= 7; i++) {
      const prox = new Date(hojeD);
      prox.setDate(hojeD.getDate() + i);
      if (parseInt(p.dataNasc.slice(5, 7), 10) === prox.getMonth() + 1 && parseInt(p.dataNasc.slice(8, 10), 10) === prox.getDate()) return true;
    }
    return false;
  }).sort((a, b) => {
    const proximaOcorrencia = p => {
      const d = new Date(hojeD.getFullYear(), parseInt(p.dataNasc.slice(5, 7), 10) - 1, parseInt(p.dataNasc.slice(8, 10), 10));
      if (d < hojeD) d.setFullYear(hojeD.getFullYear() + 1);
      return d.getTime();
    };
    return proximaOcorrencia(a) - proximaOcorrencia(b);
  });
  const semDataNasc = pacientesAtivos.filter(p => !p.dataNasc);
  function copiarLinkAniversario() {
    const url = `${window.location.origin}/psi/aniversario/?psi=${usuario.psiId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkAnivCopiado(true);
      setTimeout(() => setLinkAnivCopiado(false), 2500);
    }).catch(() => prompt("Copie o link:", url));
  }

  // Agrupa atividades por paciente, contando quantas de cada tipo.
  const atividadesPorPaciente = {};
  atividades.forEach(a => {
    const id = a.pacienteId;
    if (!id) return;
    if (!atividadesPorPaciente[id]) atividadesPorPaciente[id] = {};
    atividadesPorPaciente[id][a._tipo] = (atividadesPorPaciente[id][a._tipo] || 0) + 1;
  });
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "conteudo conteudo-larga"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-secao"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Dashboard"), /*#__PURE__*/React.createElement("p", {
    className: "subtitulo-pagina"
  }, dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)))), /*#__PURE__*/React.createElement("div", {
    className: "grade-cartoes-stat"
  }, /*#__PURE__*/React.createElement(CartaoStat, {
    titulo: "Pacientes Ativos",
    valor: carregandoPacientes ? "..." : ativos,
    legenda: `${pacientes.length} total`,
    icone: "users"
  }), /*#__PURE__*/React.createElement(CartaoStat, {
    titulo: "Sess\xF5es Hoje",
    valor: sessoesHoje === null ? "—" : sessoesHoje,
    legenda: sessoesHoje === null ? "Conecte a Agenda" : "agendadas",
    icone: "calendar-days"
  }), /*#__PURE__*/React.createElement(CartaoStat, {
    titulo: "Cadastros Pendentes",
    valor: carregandoPacientes ? "..." : pendentes,
    legenda: "via autocadastro",
    icone: "user-plus"
  })), !carregandoPacientes && (aniversariantesHoje.length > 0 || proximosAniv.length > 0 || semDataNasc.length > 0) && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "cake",
    tamanho: 17
  }), " Anivers\xE1rios"), aniversariantesHoje.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rotulo-mini",
    style: {
      color: "#d97706"
    }
  }, "Hoje"), aniversariantesHoje.map(p => {
    const anos = p.dataNasc ? hojeD.getFullYear() - parseInt(p.dataNasc.slice(0, 4), 10) : null;
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      className: "linha-atividade"
    }, /*#__PURE__*/React.createElement("div", {
      className: "avatar-paciente"
    }, (p.nome || "?").charAt(0).toUpperCase()), /*#__PURE__*/React.createElement("div", {
      className: "info-atividade"
    }, /*#__PURE__*/React.createElement("div", {
      className: "nome-paciente"
    }, p.nome), anos != null && /*#__PURE__*/React.createElement("div", {
      className: "badges-atividade"
    }, /*#__PURE__*/React.createElement("span", {
      className: "badge-atividade"
    }, anos, " anos"))), p.email && /*#__PURE__*/React.createElement("a", {
      className: "botao-secundario",
      href: `mailto:${p.email}?subject=${encodeURIComponent("Feliz Aniversário, " + (p.nome || "").split(" ")[0] + "!")}`
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: "mail",
      tamanho: 14
    }), " Enviar e-mail"));
  })), proximosAniv.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rotulo-mini"
  }, "Pr\xF3ximos 7 dias"), proximosAniv.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "linha-atividade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "avatar-paciente"
  }, (p.nome || "?").charAt(0).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "info-atividade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nome-paciente"
  }, p.nome), /*#__PURE__*/React.createElement("div", {
    className: "badges-atividade"
  }, /*#__PURE__*/React.createElement("span", {
    className: "badge-atividade"
  }, p.dataNasc.slice(8, 10), "/", p.dataNasc.slice(5, 7))))))), semDataNasc.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "aviso-modulo-futuro",
    style: {
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "alert-triangle",
    tamanho: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, semDataNasc.length, " paciente(s) sem data de nascimento cadastrada."), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: copiarLinkAniversario
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: linkAnivCopiado ? "check" : "link",
    tamanho: 13
  }), " ", linkAnivCopiado ? "Copiado!" : "Copiar link para o paciente preencher"))), /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-secao"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "activity",
    tamanho: 17
  }), " Atividade recente dos pacientes"), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-secao"
  }, "Uso das ferramentas do portal do paciente (Di\xE1rio, Humor, \xC1rvore de Decis\xE3o)."), carregandoAtividades && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Carregando..."), !carregandoAtividades && Object.keys(atividadesPorPaciente).length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma atividade ainda \u2014 vai aparecer aqui assim que os pacientes come\xE7arem a usar o portal."), Object.entries(atividadesPorPaciente).map(([pacienteId, contagens]) => {
    const paciente = pacientes.find(p => p.id === pacienteId);
    return /*#__PURE__*/React.createElement("div", {
      key: pacienteId,
      className: "linha-atividade"
    }, /*#__PURE__*/React.createElement("div", {
      className: "avatar-paciente"
    }, (paciente?.nome || "?").charAt(0).toUpperCase()), /*#__PURE__*/React.createElement("div", {
      className: "info-atividade"
    }, /*#__PURE__*/React.createElement("div", {
      className: "nome-paciente"
    }, paciente?.nome || "Paciente"), /*#__PURE__*/React.createElement("div", {
      className: "badges-atividade"
    }, Object.entries(contagens).map(([tipo, qtd]) => /*#__PURE__*/React.createElement("span", {
      key: tipo,
      className: "badge-atividade"
    }, tipo, " (", qtd, ")")))), paciente && /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      onClick: () => aoAbrirPaciente(paciente)
    }, "Ver perfil"));
  })), /*#__PURE__*/React.createElement("div", {
    className: "aviso-modulo-futuro"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "info",
    tamanho: 16
  }), "Financeiro e Terapia de Casais ainda n\xE3o t\xEAm dados aqui \u2014 esses m\xF3dulos entram em uma pr\xF3xima etapa."));
}
function CartaoStat({
  titulo,
  valor,
  legenda,
  icone
}) {
  return /*#__PURE__*/React.createElement("div", {
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
  }, valor), /*#__PURE__*/React.createElement("div", {
    className: "legenda-cartao-stat"
  }, legenda));
}