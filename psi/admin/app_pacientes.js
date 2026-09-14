// ═══════════════════════════════════════════════════════════════
//  app_pacientes.js — Pacientes (lista, cadastro, perfil, link
//  público de autocadastro)
//
//  Portado do sistema já usado pela Dra. Lucia (mesmos campos e
//  fluxo), com uma diferença de segurança de propósito: aqui não
//  existe senha "1234" nem senha guardada no Firestore — o cadastro
//  cria um login de verdade (Firebase Authentication) e o paciente
//  define a própria senha por um link, igual já fazemos em todo o
//  resto do sistema (CLAUDE.md REGRA 9).
// ═══════════════════════════════════════════════════════════════

const GENEROS = ["Feminino", "Masculino", "Não-binário", "Não informar"];
const STATUS_PACIENTE = [
  { valor: "ativo", rotulo: "Ativo", cor: "var(--sucesso)" },
  { valor: "inativo", rotulo: "Inativo", cor: "var(--erro)" },
  { valor: "alta", rotulo: "Alta", cor: "var(--texto-suave)" },
];

function TelaPacientes({ usuario }) {
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [linkCopiado, setLinkCopiado] = useState(false);

  useEffect(() => {
    // Filtra por psi_id no client (defesa em profundidade — quem
    // protege de verdade é a Firestore Rule, ver CLAUDE.md REGRA 3).
    // Sem .orderBy() — ordena no client (CLAUDE.md REGRA 4).
    const cancelar = db
      .collection("clinica_pacientes")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot(
        (snapshot) => {
          const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          lista.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
          setPacientes(lista);
          setCarregando(false);
        },
        (erro) => {
          console.error("Erro ao carregar pacientes:", erro);
          setCarregando(false);
        }
      );
    return cancelar;
  }, [usuario.psiId]);

  const filtrados = pacientes.filter((p) => {
    const ok = filtro === "todos" || p.status === filtro;
    const bateBusca =
      !busca ||
      p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      p.email?.toLowerCase().includes(busca.toLowerCase());
    return ok && bateBusca;
  });

  function copiarLinkCadastro() {
    const url = `${window.location.origin}/psi/cadastro-paciente/?psi=${usuario.psiId}`;
    const texto = `Olá! Para agilizar o seu atendimento, preencha o formulário de cadastro pelo link abaixo:\n\n👉 ${url}\n\nÉ rápido e seguro. Após o preenchimento, seus dados já estarão disponíveis para a psicóloga.\n\nQualquer dúvida, estamos à disposição!`;
    navigator.clipboard
      .writeText(texto)
      .then(() => {
        setLinkCopiado(true);
        setTimeout(() => setLinkCopiado(false), 2500);
      })
      .catch(() => prompt("Copie o texto:", texto));
  }

  return (
    <div className="conteudo conteudo-larga">
      <div className="cabecalho-secao">
        <div>
          <h2>Pacientes</h2>
          <p className="subtitulo-pagina">
            {pacientes.filter((p) => p.status === "ativo").length} ativos ·{" "}
            {pacientes.filter((p) => p.status === "alta").length} com alta ·{" "}
            {pacientes.filter((p) => p.status === "inativo").length} inativos
          </p>
        </div>
        <div className="acoes-cabecalho">
          <button className="botao-secundario" onClick={copiarLinkCadastro}>
            <Icone nome="link" tamanho={15} /> {linkCopiado ? "Copiado!" : "Link de Cadastro"}
          </button>
          <button className="botao-primario" onClick={() => setMostrarForm(true)}>
            <Icone nome="user-plus" tamanho={16} /> Novo Paciente
          </button>
        </div>
      </div>

      <div className="barra-filtros">
        <input
          className="campo-busca"
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        {[
          ["todos", "Todos"],
          ["ativo", "Em atendimento"],
          ["alta", "Alta"],
          ["inativo", "Inativos"],
        ].map(([valor, rotulo]) => (
          <button
            key={valor}
            className={"botao-filtro" + (filtro === valor ? " botao-filtro-ativo" : "")}
            onClick={() => setFiltro(valor)}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {carregando && <p>Carregando...</p>}

      {!carregando &&
        ["pendente", "ativo", "alta", "inativo"].map((status) => {
          const grupo = filtrados.filter((p) => p.status === status);
          if (grupo.length === 0) return null;
          return (
            <div key={status} className="grupo-status">
              <div className="titulo-grupo-status">
                <span className={"ponto-status ponto-" + status} />
                {status === "ativo" && "Em Atendimento"}
                {status === "alta" && "Alta"}
                {status === "pendente" && "⏳ Pendentes (Autocadastro)"}
                {status === "inativo" && "Inativos"}
                {" "}({grupo.length})
              </div>
              <div className="cartao-lista-pacientes">
                {grupo.map((p) => (
                  <div key={p.id} className="linha-paciente" onClick={() => setPacienteSelecionado(p)}>
                    <div className="avatar-paciente">{(p.nome || "?").charAt(0).toUpperCase()}</div>
                    <div className="info-paciente">
                      <div className="nome-paciente">{p.nome}</div>
                      <div className="email-paciente">{p.email}</div>
                    </div>
                    <Icone nome="chevron-right" tamanho={16} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {!carregando && filtrados.length === 0 && (
        <p className="texto-vazio">Nenhum paciente encontrado.</p>
      )}

      {mostrarForm && (
        <FormNovoPaciente usuario={usuario} aoFechar={() => setMostrarForm(false)} />
      )}

      {pacienteSelecionado && (
        <PerfilPaciente
          paciente={pacienteSelecionado}
          aoFechar={() => setPacienteSelecionado(null)}
        />
      )}
    </div>
  );
}

function CamposPaciente({ form, setForm, mostrarStatus }) {
  return (
    <div className="grade-2col">
      <div className="campo-largura-total">
        <label>Nome completo</label>
        <input value={form.nome || ""} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
      </div>
      <div>
        <label>E-mail</label>
        <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      </div>
      <div>
        <label>Telefone</label>
        <input value={form.telefone || ""} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
      </div>
      <div>
        <label>Data de Nascimento</label>
        <input type="date" value={form.dataNasc || ""} onChange={(e) => setForm({ ...form, dataNasc: e.target.value })} />
      </div>
      <div>
        <label>CPF</label>
        <input value={form.cpf || ""} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
      </div>
      <div>
        <label>Gênero</label>
        <select value={form.genero || ""} onChange={(e) => setForm({ ...form, genero: e.target.value })}>
          <option value="">Selecione</option>
          {GENEROS.map((g) => <option key={g}>{g}</option>)}
        </select>
      </div>
      {mostrarStatus && (
        <div>
          <label>Status</label>
          <div className="pills-status">
            {STATUS_PACIENTE.map((s) => (
              <button
                key={s.valor}
                type="button"
                className={"pill-status" + (form.status === s.valor ? " pill-status-ativa" : "")}
                style={{ "--cor-pill": s.cor }}
                onClick={() => setForm({ ...form, status: s.valor })}
              >
                {s.rotulo}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="campo-largura-total titulo-secao-form">
        🏢 Dados Ocupacionais — para documentos NR-1 e declarações
      </div>
      <div className="campo-largura-total">
        <label>Empresa Contratante <span className="opcional">(opcional)</span></label>
        <input value={form.empresa || ""} onChange={(e) => setForm({ ...form, empresa: e.target.value })} placeholder="Para colaboradores de empresas" />
      </div>
      <div>
        <label>Setor</label>
        <input value={form.setor || ""} onChange={(e) => setForm({ ...form, setor: e.target.value })} />
      </div>
      <div>
        <label>Cargo</label>
        <input value={form.cargo || ""} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
      </div>
      <div className="campo-largura-total">
        <label>Objetivos Terapêuticos</label>
        <TextAreaVoz
          className="campo-descricao"
          rows={3}
          value={form.objetivos || ""}
          onChange={(e) => setForm({ ...form, objetivos: e.target.value })}
          placeholder="Descreva os objetivos..."
        />
      </div>
    </div>
  );
}

function FormNovoPaciente({ usuario, aoFechar }) {
  const [form, setForm] = useState({ status: "ativo" });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [linkSucesso, setLinkSucesso] = useState("");

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");
    if (!form.nome || !form.email) {
      setErro("Nome e e-mail são obrigatórios.");
      return;
    }
    setEnviando(true);
    try {
      const resultado = await chamarCadastrarPaciente(form);
      setLinkSucesso(resultado.data.linkDefinirSenha);
    } catch (e) {
      setErro(e.message || "Não foi possível cadastrar o paciente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal modal-largo" onClick={(e) => e.stopPropagation()}>
        <h3>Novo Paciente</h3>

        {!linkSucesso && (
          <form onSubmit={aoEnviar}>
            <CamposPaciente form={form} setForm={setForm} mostrarStatus={true} />

            {erro && <p className="mensagem-erro">{erro}</p>}

            <div className="acoes-modal">
              <button type="button" className="botao-secundario" onClick={aoFechar}>Cancelar</button>
              <button type="submit" className="botao-primario" disabled={enviando}>
                {enviando ? "Cadastrando..." : "Salvar"}
              </button>
            </div>
          </form>
        )}

        {linkSucesso && (
          <div>
            <p>
              Paciente cadastrado! Envie este link para <strong>{form.nome}</strong> definir a
              própria senha (ninguém, nem a clínica, fica sabendo qual senha ele escolhe):
            </p>
            <textarea readOnly className="campo-link" value={linkSucesso} />
            <div className="acoes-modal">
              <button className="botao-primario" onClick={aoFechar}>Concluir</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PerfilPaciente({ paciente, aoFechar }) {
  const [form, setForm] = useState({ ...paciente });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [reenviando, setReenviando] = useState(false);

  async function salvar() {
    setSalvando(true);
    setMensagem("");
    const { id, ...dados } = form;
    try {
      await db.collection("clinica_pacientes").doc(paciente.id).update(dados);
      setMensagem("Salvo!");
    } catch (e) {
      setMensagem("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function reenviarLinkSenha() {
    setReenviando(true);
    try {
      await auth.sendPasswordResetEmail(paciente.email);
      setMensagem("Link de redefinição enviado para " + paciente.email + ".");
    } catch (e) {
      setMensagem("Erro ao enviar: " + e.message);
    } finally {
      setReenviando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal modal-largo" onClick={(e) => e.stopPropagation()}>
        <h3>{paciente.nome}</h3>

        <CamposPaciente form={form} setForm={setForm} mostrarStatus={true} />

        {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}

        <div className="acoes-modal">
          <button className="botao-secundario" onClick={aoFechar}>Fechar</button>
          <button className="botao-primario" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>

        <div className="cartao-credenciais">
          <div className="titulo-credenciais"><Icone nome="key" tamanho={16} /> Acesso do paciente</div>
          <p className="texto-credenciais">
            Aqui não guardamos nem mostramos a senha de ninguém — se o paciente esqueceu a senha,
            envie um link novo pra ele definir uma senha nova.
          </p>
          <button className="botao-secundario" onClick={reenviarLinkSenha} disabled={reenviando}>
            <Icone nome="send" tamanho={14} /> {reenviando ? "Enviando..." : "Enviar link de redefinição de senha"}
          </button>
        </div>
      </div>
    </div>
  );
}
