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
const GOOGLE_CLIENT_ID_PUBLICO =
  "176262015536-fkv54bhgvtv4v3h3m4sjo9duokp165j2.apps.googleusercontent.com";
const GOOGLE_REDIRECT_URI = "https://psicoworking.web.app/psi/admin/";

function construirUrlAutorizacaoGoogle() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID_PUBLICO,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
  });
  return "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
}

const chamarListarEventosAgenda = functions.httpsCallable("listarEventosAgenda");
const chamarCriarEventoAgenda = functions.httpsCallable("criarEventoAgenda");
const chamarConectarGoogleCalendar = functions.httpsCallable("conectarGoogleCalendar");

function TelaAgenda({ usuario }) {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [conectado, setConectado] = useState(null); // null = ainda não sabemos
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");

  const carregarEventos = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const agora = new Date();
      const inicio = new Date(agora);
      inicio.setDate(inicio.getDate() - 1);
      const fim = new Date(agora);
      fim.setDate(fim.getDate() + 30);

      const resultado = await chamarListarEventosAgenda({
        dataInicio: inicio.toISOString(),
        dataFim: fim.toISOString(),
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

  if (carregando && conectado === null) {
    return <div className="conteudo"><p>Carregando agenda...</p></div>;
  }

  if (conectado === false) {
    return (
      <div className="conteudo">
        <div className="cartao-conectar">
          <h2>Conectar Google Agenda</h2>
          <p>
            Para usar a Agenda, conecte a sua conta do Google Agenda. As sessões
            marcadas aqui aparecem direto na sua agenda pessoal, e o que já está
            na sua agenda aparece aqui.
          </p>
          <button
            className="botao-primario"
            onClick={() => { window.location.href = construirUrlAutorizacaoGoogle(); }}
          >
            Conectar Google Agenda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="conteudo">
      <div className="cabecalho-secao">
        <h2>Agenda</h2>
        <button className="botao-primario" onClick={() => setMostrarForm(true)}>
          + Nova Sessão
        </button>
      </div>

      {erro && <p className="mensagem-erro">{erro}</p>}

      {!carregando && eventos.length === 0 && (
        <p className="texto-vazio">Nenhuma sessão nos próximos 30 dias.</p>
      )}

      {eventos.length > 0 && (
        <ul className="lista-eventos">
          {eventos.map((ev) => (
            <li key={ev.id} className="item-evento">
              <div className="item-evento-data">{formatarDataHora(ev.inicio)}</div>
              <div className="item-evento-titulo">{ev.titulo}</div>
              {ev.link && (
                <a href={ev.link} target="_blank" rel="noreferrer" className="item-evento-link">
                  Ver no Google Agenda
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {mostrarForm && (
        <FormNovaSessao
          aoFechar={() => setMostrarForm(false)}
          aoCriar={async (dados) => {
            await chamarCriarEventoAgenda(dados);
            setMostrarForm(false);
            carregarEventos();
          }}
        />
      )}
    </div>
  );
}

function formatarDataHora(isoString) {
  try {
    const data = new Date(isoString);
    return data.toLocaleString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return isoString;
  }
}

function FormNovaSessao({ aoFechar, aoCriar }) {
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
        fim: fim.toISOString(),
      });
    } catch (e) {
      setErro(e.message || "Não foi possível criar a sessão.");
      setEnviando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Nova Sessão</h3>
        <form onSubmit={aoEnviar}>
          <label>Título (ex.: nome do paciente)</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />

          <label>Data</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />

          <label>Hora de início</label>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />

          <label>Duração (minutos)</label>
          <input
            type="number"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            min="10"
            step="5"
            required
          />

          <label>Observação (opcional)</label>
          <textarea
            className="campo-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="acoes-modal">
            <button type="button" className="botao-secundario" onClick={aoFechar}>
              Cancelar
            </button>
            <button type="submit" className="botao-primario" disabled={enviando}>
              {enviando ? "Criando..." : "Criar Sessão"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
