// ═══════════════════════════════════════════════════════════════
//  app_pacientes.js — Pacientes (cadastro, lista, perfil básico)
//
//  Versão 1: lista + cadastro (via Cloud Function cadastrarPaciente)
//  + marcar inativo. Abas de Evolução/Metas/Laudos ficam para uma
//  etapa futura (CLAUDE.md REGRA 5 — uma etapa por vez).
// ═══════════════════════════════════════════════════════════════

function TelaPacientes({ usuario }) {
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

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
          lista.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
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

  async function alternarInativo(paciente) {
    await db.collection("clinica_pacientes").doc(paciente.id).update({
      inativo: !paciente.inativo,
    });
    setPacienteSelecionado(null);
  }

  return (
    <div className="conteudo">
      <div className="cabecalho-secao">
        <h2>Pacientes</h2>
        <button className="botao-primario" onClick={() => setMostrarForm(true)}>
          + Novo Paciente
        </button>
      </div>

      {carregando && <p>Carregando...</p>}

      {!carregando && pacientes.length === 0 && (
        <p className="texto-vazio">Nenhum paciente cadastrado ainda.</p>
      )}

      {!carregando && pacientes.length > 0 && (
        <table className="tabela-pacientes">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => (
              <tr key={p.id} onClick={() => setPacienteSelecionado(p)} className="linha-clicavel">
                <td>{p.nome}</td>
                <td>{p.email}</td>
                <td>
                  <span className={p.inativo ? "etiqueta-inativo" : "etiqueta-ativo"}>
                    {p.inativo ? "Inativo" : "Ativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {mostrarForm && (
        <FormNovoPaciente usuario={usuario} aoFechar={() => setMostrarForm(false)} />
      )}

      {pacienteSelecionado && (
        <PerfilPacienteSimples
          paciente={pacienteSelecionado}
          aoFechar={() => setPacienteSelecionado(null)}
          aoAlternarInativo={alternarInativo}
        />
      )}
    </div>
  );
}

function FormNovoPaciente({ usuario, aoFechar }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [linkSucesso, setLinkSucesso] = useState("");

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resultado = await chamarCadastrarPaciente({ nome, email });
      setLinkSucesso(resultado.data.linkDefinirSenha);
    } catch (e) {
      setErro(e.message || "Não foi possível cadastrar o paciente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Novo Paciente</h3>

        {!linkSucesso && (
          <form onSubmit={aoEnviar}>
            <label>Nome completo</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />

            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {erro && <p className="mensagem-erro">{erro}</p>}

            <div className="acoes-modal">
              <button type="button" className="botao-secundario" onClick={aoFechar}>
                Cancelar
              </button>
              <button type="submit" className="botao-primario" disabled={enviando}>
                {enviando ? "Cadastrando..." : "Cadastrar"}
              </button>
            </div>
          </form>
        )}

        {linkSucesso && (
          <div>
            <p>
              Paciente cadastrado! Envie este link para <strong>{nome}</strong> definir a
              própria senha (ninguém, nem a clínica, fica sabendo qual senha ele escolhe):
            </p>
            <textarea readOnly className="campo-link" value={linkSucesso} />
            <div className="acoes-modal">
              <button className="botao-primario" onClick={aoFechar}>
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PerfilPacienteSimples({ paciente, aoFechar, aoAlternarInativo }) {
  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{paciente.nome}</h3>
        <p><strong>E-mail:</strong> {paciente.email}</p>
        <p><strong>Status:</strong> {paciente.inativo ? "Inativo" : "Ativo"}</p>

        <div className="acoes-modal">
          <button className="botao-secundario" onClick={aoFechar}>
            Fechar
          </button>
          <button
            className={paciente.inativo ? "botao-primario" : "botao-perigo"}
            onClick={() => aoAlternarInativo(paciente)}
          >
            {paciente.inativo ? "Marcar como Ativo" : "Marcar como Inativo"}
          </button>
        </div>
      </div>
    </div>
  );
}
