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

const ABAS_RECURSOS = [
  { id: "ferramentas", rotulo: "Ferramentas", icone: "wrench", colecao: "recursos_terapeuticos", tipo: "ferramenta" },
  { id: "fabulas", rotulo: "Fábulas Terapêuticas", icone: "book-open", colecao: "fabulas_terapeuticas", tipo: "fabula" },
  { id: "psicoeducacao", rotulo: "Psicoeducação", icone: "brain", colecao: "psicoeducacao_conteudos", tipo: "psicoeducacao" },
];

function TelaRecursos({ usuario }) {
  const [aba, setAba] = useState("ferramentas");
  const [itensPorColecao, setItensPorColecao] = useState({
    recursos_terapeuticos: [],
    fabulas_terapeuticas: [],
    psicoeducacao_conteudos: [],
  });
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [enviarItem, setEnviarItem] = useState(null);

  const abaAtual = ABAS_RECURSOS.find((a) => a.id === aba);
  const itens = itensPorColecao[abaAtual.colecao] || [];

  useEffect(() => {
    const cancelamentos = ABAS_RECURSOS.map((a) =>
      db.collection(a.colecao).onSnapshot(
        (snap) => {
          setItensPorColecao((prev) => ({ ...prev, [a.colecao]: snap.docs.map((d) => ({ id: d.id, ...d.data() })) }));
          setCarregando(false);
        },
        () => setCarregando(false)
      )
    );
    return () => cancelamentos.forEach((c) => c());
  }, []);

  const filtrados = itens.filter((it) => {
    const titulo = it.titulo || it.nome || "";
    return !busca || titulo.toLowerCase().includes(busca.toLowerCase());
  });

  const porCategoria = {};
  filtrados.forEach((it) => {
    const cat = it.categoria || "outros";
    (porCategoria[cat] = porCategoria[cat] || []).push(it);
  });
  const categorias = Object.keys(porCategoria).sort((a, b) => a.localeCompare(b, "pt-BR"));

  async function excluirItem(item) {
    if (!confirm(`Excluir "${item.titulo || item.nome}" da biblioteca? Isso não desativa quem já usa — só remove do catálogo.`)) return;
    await db.collection(abaAtual.colecao).doc(item.id).delete();
  }

  return (
    <div className="conteudo conteudo-larga">
      <div className="cabecalho-secao">
        <div>
          <h2>Recursos Terapêuticos</h2>
          <p className="subtitulo-pagina">Catálogo de ferramentas, fábulas e psicoeducação — compartilhado com toda a plataforma</p>
        </div>
        <button className="botao-primario" onClick={() => { setItemEditando(null); setMostrarForm(true); }}>
          <Icone nome="plus" tamanho={16} /> Novo Item
        </button>
      </div>

      <div className="abas-financeiro">
        {ABAS_RECURSOS.map((a) => (
          <button
            key={a.id}
            className={"aba-financeiro" + (aba === a.id ? " aba-financeiro-ativa" : "")}
            onClick={() => setAba(a.id)}
          >
            <Icone nome={a.icone} tamanho={15} /> {a.rotulo}
          </button>
        ))}
      </div>

      <input
        className="campo-busca campo-busca-recursos"
        placeholder="Buscar por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {carregando && <p>Carregando...</p>}
      {!carregando && categorias.length === 0 && (
        <p className="texto-vazio">
          Nenhum item cadastrado ainda nesta aba. Use a ferramenta de migração de dados (Passo 5) pra trazer o
          catálogo do sistema anterior, ou clique em "Novo Item" pra cadastrar direto.
        </p>
      )}

      {categorias.map((cat) => (
        <div key={cat} className="grupo-status">
          <div className="titulo-grupo-status">{formatarCategoria(cat)} ({porCategoria[cat].length})</div>
          <div className="grade-cartoes-recursos">
            {porCategoria[cat].map((item) => (
              <div key={item.id} className="cartao-recurso">
                <div className="titulo-cartao-recurso">{item.titulo || item.nome}</div>
                {item.descricao && <p className="descricao-cartao-recurso">{item.descricao}</p>}
                <div className="acoes-cartao-recurso">
                  <button className="botao-secundario" onClick={() => setEnviarItem(item)}>
                    <Icone nome="send" tamanho={14} /> Enviar para paciente
                  </button>
                  <button className="botao-icone" onClick={() => { setItemEditando(item); setMostrarForm(true); }} title="Editar">
                    <Icone nome="pencil" tamanho={14} />
                  </button>
                  <button className="botao-icone botao-icone-perigo" onClick={() => excluirItem(item)} title="Excluir">
                    <Icone nome="trash-2" tamanho={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {mostrarForm && (
        <FormRecurso
          colecao={abaAtual.colecao}
          item={itemEditando}
          aoFechar={() => { setMostrarForm(false); setItemEditando(null); }}
        />
      )}

      {enviarItem && (
        <EnviarRecursoModal
          usuario={usuario}
          item={enviarItem}
          tipo={abaAtual.tipo}
          aoFechar={() => setEnviarItem(null)}
        />
      )}
    </div>
  );
}

function FormRecurso({ colecao, item, aoFechar }) {
  const [form, setForm] = useState(item || { titulo: "", categoria: "", descricao: "" });
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
        descricao: form.descricao || "",
      };
      if (item) {
        await db.collection(colecao).doc(item.id).update(dados);
      } else {
        await db.collection(colecao).add({ ...dados, criadoEm: firebase.firestore.FieldValue.serverTimestamp() });
      }
      aoFechar();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{item ? "Editar" : "Novo"} Item</h3>
        <form onSubmit={salvar}>
          <label>Título *</label>
          <input value={form.titulo || ""} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />

          <label>Categoria <span className="opcional">(ex.: tcc, relaxamento, ansiedade)</span></label>
          <input value={form.categoria || ""} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />

          <label>Descrição <span className="opcional">(opcional)</span></label>
          <textarea className="campo-descricao" rows={3} value={form.descricao || ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="acoes-modal">
            <button type="button" className="botao-secundario" onClick={aoFechar}>Cancelar</button>
            <button type="submit" className="botao-primario" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EnviarRecursoModal({ usuario, item, tipo, aoFechar }) {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteId, setPacienteId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    db.collection("clinica_pacientes")
      .where("psi_id", "==", usuario.psiId)
      .get()
      .then((snap) => {
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.status === "ativo");
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
        [item.id]: { ativo: true, tipo, titulo: item.titulo || item.nome, dataInicio: new Date().toISOString().slice(0, 10) },
      };
      const ativos = Object.keys(novaConfig).filter((k) => novaConfig[k]?.ativo);
      await pacRef.update({ modulosConfig: novaConfig, modulosAtivos: ativos });
      setSucesso("Enviado! Já aparece ativado na aba Módulos do paciente.");
    } catch (e) {
      setErro(e.message || "Não foi possível enviar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Enviar "{item.titulo || item.nome}"</h3>
        {!sucesso ? (
          <>
            <label>Paciente</label>
            <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
              <option value="">Selecione</option>
              {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>

            {erro && <p className="mensagem-erro">{erro}</p>}

            <div className="acoes-modal">
              <button className="botao-secundario" onClick={aoFechar}>Cancelar</button>
              <button className="botao-primario" onClick={enviar} disabled={enviando}>{enviando ? "Enviando..." : "Enviar"}</button>
            </div>
          </>
        ) : (
          <>
            <p className="mensagem-sucesso">{sucesso}</p>
            <div className="acoes-modal">
              <button className="botao-primario" onClick={aoFechar}>Fechar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
