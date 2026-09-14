// ═══════════════════════════════════════════════════════════════
//  app_agenda.js — Agenda 100% no Google Agenda conectado
//
//  Sem agenda local própria: a lista de sessões vem direto do
//  Google Agenda da psicóloga (via listarEventosAgenda), e criar
//  sessão nova cria o evento direto lá (via criarEventoAgenda).
//  O token nunca passa pelo navegador — só as Cloud Functions o
//  tocam (ver CLAUDE.md, seção Segurança).
// ═══════════════════════════════════════════════════════════════

// client_id não é segredo — é seguro expor no navegador (o segredo
// de verdade, client_secret, fica só na Cloud Function).
const GOOGLE_CLIENT_ID_PUBLICO = "176262015536-fkv54bhgvtv4v3h3m4sjo9duokp165j2.apps.googleusercontent.com";
const GOOGLE_REDIRECT_URI = "https://psicoworking.web.app/psi/admin/";
function construirUrlAutorizacaoGoogle() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID_PUBLICO,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent"
  });
  return "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
}
const chamarListarEventosAgenda = functions.httpsCallable("listarEventosAgenda");
const chamarCriarEventoAgenda = functions.httpsCallable("criarEventoAgenda");
const chamarConectarGoogleCalendar = functions.httpsCallable("conectarGoogleCalendar");
function TelaAgenda({
  usuario
}) {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [conectado, setConectado] = useState(null); // null = ainda não sabemos
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");
  const [semanaOffset, setSemanaOffset] = useState(0); // 0 = semana atual

  // Busca uma janela larga (6 semanas pra trás, 12 pra frente) de uma vez,
  // pra navegar entre semanas sem precisar recarregar toda hora.
  const carregarEventos = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const agora = new Date();
      const inicio = new Date(agora);
      inicio.setDate(inicio.getDate() - 42);
      const fim = new Date(agora);
      fim.setDate(fim.getDate() + 84);
      const resultado = await chamarListarEventosAgenda({
        dataInicio: inicio.toISOString(),
        dataFim: fim.toISOString()
      });
      setEventos(resultado.data.eventos || []);
      setConectado(true);
    } catch (e) {
      if (e.code === "functions/failed-precondition") {
        setConectado(false);
      } else {
        setErro("Não foi possível carregar a agenda: " + (e.message || ""));
      }
    } finally {
      setCarregando(false);
    }
  }, []);
  useEffect(() => {
    carregarEventos();
  }, [carregarEventos]);
  const {
    inicioSemana,
    dias
  } = useMemo(() => montarSemana(eventos, semanaOffset), [eventos, semanaOffset]);
  if (carregando && conectado === null) {
    return /*#__PURE__*/React.createElement("div", {
      className: "conteudo"
    }, /*#__PURE__*/React.createElement("p", null, "Carregando agenda..."));
  }
  if (conectado === false) {
    return /*#__PURE__*/React.createElement("div", {
      className: "conteudo"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cartao-conectar"
    }, /*#__PURE__*/React.createElement("h2", null, "Conectar Google Agenda"), /*#__PURE__*/React.createElement("p", null, "Para usar a Agenda, conecte a sua conta do Google Agenda. As sess\xF5es marcadas aqui aparecem direto na sua agenda pessoal, e o que j\xE1 est\xE1 na sua agenda aparece aqui."), /*#__PURE__*/React.createElement("button", {
      className: "botao-primario",
      onClick: () => {
        window.location.href = construirUrlAutorizacaoGoogle();
      }
    }, "Conectar Google Agenda")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "conteudo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-secao"
  }, /*#__PURE__*/React.createElement("h2", null, "Agenda"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: () => setMostrarForm(true)
  }, "+ Nova Sess\xE3o")), /*#__PURE__*/React.createElement("div", {
    className: "navegador-semana"
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-seta",
    onClick: () => setSemanaOffset(s => s - 1)
  }, "\u2039"), /*#__PURE__*/React.createElement("div", {
    className: "rotulo-semana"
  }, formatarPeriodoSemana(inicioSemana), semanaOffset !== 0 && /*#__PURE__*/React.createElement("button", {
    className: "botao-hoje",
    onClick: () => setSemanaOffset(0)
  }, "Hoje")), /*#__PURE__*/React.createElement("button", {
    className: "botao-seta",
    onClick: () => setSemanaOffset(s => s + 1)
  }, "\u203A")), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), carregando && /*#__PURE__*/React.createElement("p", null, "Carregando..."), !carregando && /*#__PURE__*/React.createElement("div", {
    className: "grupos-agenda"
  }, dias.map(dia => /*#__PURE__*/React.createElement("div", {
    key: dia.chave,
    className: "cartao-dia"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-dia"
  }, dia.rotulo), dia.eventos.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio-dia"
  }, "Sem sess\xF5es") : /*#__PURE__*/React.createElement("ul", {
    className: "lista-eventos"
  }, dia.eventos.map(ev => /*#__PURE__*/React.createElement("li", {
    key: ev.id,
    className: "item-evento"
  }, /*#__PURE__*/React.createElement("div", {
    className: "item-evento-hora"
  }, formatarHora(ev.inicio)), /*#__PURE__*/React.createElement("div", {
    className: "item-evento-titulo"
  }, ev.titulo), ev.link && /*#__PURE__*/React.createElement("a", {
    href: ev.link,
    target: "_blank",
    rel: "noreferrer",
    className: "item-evento-link"
  }, "Google Agenda \u2197"))))))), mostrarForm && /*#__PURE__*/React.createElement(FormNovaSessao, {
    aoFechar: () => setMostrarForm(false),
    aoCriar: async dados => {
      await chamarCriarEventoAgenda(dados);
      setMostrarForm(false);
      carregarEventos();
    }
  }));
}
function formatarHora(isoString) {
  try {
    return new Date(isoString).toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return "";
  }
}
function formatarRotuloDia(isoString) {
  try {
    const data = new Date(isoString);
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    const mesmoDia = (a, b) => a.toDateString() === b.toDateString();
    if (mesmoDia(data, hoje)) return "Hoje";
    if (mesmoDia(data, amanha)) return "Amanhã";
    const rotulo = data.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long"
    });
    return rotulo.charAt(0).toUpperCase() + rotulo.slice(1);
  } catch (e) {
    return isoString;
  }
}

// Segunda-feira da semana atual, ajustada por semanaOffset (semanas
// inteiras pra frente/trás). Sempre à meia-noite local.
function obterInicioSemana(semanaOffset) {
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0=domingo
  const deslocamentoAteSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  inicio.setDate(inicio.getDate() + deslocamentoAteSegunda + semanaOffset * 7);
  return inicio;
}

// Monta os 7 dias (segunda a domingo) da semana selecionada, cada um
// já com seus eventos daquele dia (pode ser lista vazia).
function montarSemana(eventos, semanaOffset) {
  const inicioSemana = obterInicioSemana(semanaOffset);
  const porChave = {};
  for (const ev of eventos) {
    const chave = (ev.inicio || "").slice(0, 10);
    (porChave[chave] = porChave[chave] || []).push(ev);
  }
  const dias = [];
  for (let i = 0; i < 7; i++) {
    const data = new Date(inicioSemana);
    data.setDate(data.getDate() + i);
    const chave = data.toISOString().slice(0, 10);
    dias.push({
      chave,
      rotulo: formatarRotuloDia(data),
      eventos: porChave[chave] || []
    });
  }
  return {
    inicioSemana,
    dias
  };
}
function formatarPeriodoSemana(inicioSemana) {
  const fim = new Date(inicioSemana);
  fim.setDate(fim.getDate() + 6);
  const mesmomes = inicioSemana.getMonth() === fim.getMonth();
  const opcoesInicio = mesmomes ? {
    day: "2-digit"
  } : {
    day: "2-digit",
    month: "short"
  };
  const inicioTxt = inicioSemana.toLocaleDateString("pt-BR", opcoesInicio);
  const fimTxt = fim.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short"
  });
  return `${inicioTxt} – ${fimTxt}`;
}
function FormNovaSessao({
  aoFechar,
  aoCriar
}) {
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [duracao, setDuracao] = useState("50");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const inicio = new Date(`${data}T${hora}:00`);
      const fim = new Date(inicio.getTime() + Number(duracao) * 60000);
      await aoCriar({
        titulo,
        descricao,
        inicio: inicio.toISOString(),
        fim: fim.toISOString()
      });
    } catch (e) {
      setErro(e.message || "Não foi possível criar a sessão.");
      setEnviando(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: aoFechar
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", null, "Nova Sess\xE3o"), /*#__PURE__*/React.createElement("form", {
    onSubmit: aoEnviar
  }, /*#__PURE__*/React.createElement("label", null, "T\xEDtulo (ex.: nome do paciente)"), /*#__PURE__*/React.createElement("input", {
    value: titulo,
    onChange: e => setTitulo(e.target.value),
    required: true
  }), /*#__PURE__*/React.createElement("label", null, "Data"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: data,
    onChange: e => setData(e.target.value),
    required: true
  }), /*#__PURE__*/React.createElement("label", null, "Hora de in\xEDcio"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: hora,
    onChange: e => setHora(e.target.value),
    required: true
  }), /*#__PURE__*/React.createElement("label", null, "Dura\xE7\xE3o (minutos)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: duracao,
    onChange: e => setDuracao(e.target.value),
    min: "10",
    step: "5",
    required: true
  }), /*#__PURE__*/React.createElement("label", null, "Observa\xE7\xE3o (opcional)"), /*#__PURE__*/React.createElement("textarea", {
    className: "campo-descricao",
    value: descricao,
    onChange: e => setDescricao(e.target.value)
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
    disabled: enviando
  }, enviando ? "Criando..." : "Criar Sessão")))));
}