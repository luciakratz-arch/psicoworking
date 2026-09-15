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

// Abre o WhatsApp já com a mensagem de boas-vindas + link de definir
// senha preenchidos, pra psicóloga só clicar em enviar (sem precisar
// copiar e colar nada). Usa o telefone que ela cadastrou no paciente.
function enviarWhatsAppCredenciais(paciente, link) {
  const numero = (paciente.telefone || "").replace(/\D/g, "");
  const mensagem =
    `Olá, ${paciente.nome}!\n\n` +
    `Seu cadastro foi feito com sucesso. Para acessar o Portal do Paciente, primeiro defina sua senha pelo link abaixo:\n\n` +
    `${link}\n\n` +
    `Depois é só entrar com seu e-mail e a senha que você escolher. Qualquer dúvida, estou à disposição.`;
  const url = numero
    ? `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`
    : `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

const GENEROS = ["Feminino", "Masculino", "Não-binário", "Não informar"];
const STATUS_PACIENTE = [
  { valor: "ativo", rotulo: "Ativo", cor: "var(--sucesso)" },
  { valor: "inativo", rotulo: "Inativo", cor: "var(--erro)" },
  { valor: "alta", rotulo: "Alta", cor: "var(--texto-suave)" },
];

// Abas do perfil clínico completo do paciente — mesma estrutura do
// sistema real (perfil_paciente.js), menos "Terapia de Casal" (a Dra.
// Lucia decidiu não fazer essa por enquanto). Só "Perfil" está
// funcional; as outras vão sendo construídas uma de cada vez.
const ABAS_PACIENTE = [
  { id: "perfil", rotulo: "Perfil", icone: "user" },
  { id: "modulos", rotulo: "Módulos", icone: "grid" },
  { id: "metas", rotulo: "Metas", icone: "target" },
  { id: "laudos", rotulo: "Laudos", icone: "file-text" },
  { id: "evolucao", rotulo: "Evolução", icone: "trending-up" },
  { id: "saude-ocupacional", rotulo: "Saúde Ocupacional", icone: "briefcase" },
  { id: "questionarios", rotulo: "Questionários", icone: "clipboard-list" },
  { id: "links", rotulo: "Links Partilhados", icone: "link" },
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

  if (pacienteSelecionado) {
    return (
      <PerfilPaciente
        usuario={usuario}
        paciente={pacienteSelecionado}
        aoFechar={() => setPacienteSelecionado(null)}
        aoExcluir={() => setPacienteSelecionado(null)}
      />
    );
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
  const [emailEnviado, setEmailEnviado] = useState(false);

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
      // Manda o e-mail de verdade pro paciente definir a senha —
      // antes só gerava o link e esperava a psicóloga copiar e enviar
      // na mão; agora sai automático, igual o autocadastro público.
      try {
        await auth.sendPasswordResetEmail(form.email);
        setEmailEnviado(true);
      } catch (eEmail) {
        setEmailEnviado(false);
      }
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
            {emailEnviado ? (
              <p className="mensagem-sucesso">
                Paciente cadastrado! Já mandamos um e-mail para <strong>{form.email}</strong> com o link
                para <strong>{form.nome}</strong> definir a própria senha (ninguém, nem a clínica, fica
                sabendo qual senha ele escolhe).
              </p>
            ) : (
              <p className="mensagem-erro">
                Paciente cadastrado, mas não conseguimos enviar o e-mail automático. Copie o link abaixo e
                envie você mesma para <strong>{form.nome}</strong> (por WhatsApp, por exemplo):
              </p>
            )}
            <label>Link de definir senha <span className="opcional">(reserva, caso o e-mail não chegue)</span></label>
            <textarea readOnly className="campo-link" value={linkSucesso} />

            {form.telefone && (
              <button type="button" className="botao-secundario" style={{ marginTop: 10 }} onClick={() => enviarWhatsAppCredenciais(form, linkSucesso)}>
                <Icone nome="message-circle" tamanho={15} /> Enviar por WhatsApp
              </button>
            )}

            <div className="acoes-modal">
              <button className="botao-primario" onClick={aoFechar}>Concluir</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Painel do paciente — tela cheia com abas, igual ao sistema real
// (perfil_paciente.js: cabeçalho com nome/ID/Excluir + barra de abas).
function PerfilPaciente({ usuario, paciente, aoFechar, aoExcluir }) {
  const [aba, setAba] = useState("perfil");
  const [excluindo, setExcluindo] = useState(false);

  async function excluirPaciente() {
    if (!confirm(`Excluir ${paciente.nome}? Isso remove o cadastro clínico dele — não pode ser desfeito.`)) return;
    setExcluindo(true);
    try {
      await db.collection("clinica_pacientes").doc(paciente.id).delete();
      aoExcluir();
    } catch (e) {
      alert("Erro ao excluir: " + e.message);
      setExcluindo(false);
    }
  }

  return (
    <div className="conteudo conteudo-larga">
      <div className="cabecalho-perfil-paciente">
        <button className="botao-secundario botao-voltar-perfil" onClick={aoFechar}>
          <Icone nome="arrow-left" tamanho={15} /> Voltar
        </button>
        <div className="titulo-perfil-paciente">
          <h2>{paciente.nome}</h2>
          <span className="subtitulo-pagina">Perfil clínico completo · ID: {paciente.id}</span>
        </div>
        <button className="botao-perigo" onClick={excluirPaciente} disabled={excluindo}>
          <Icone nome="trash-2" tamanho={15} /> {excluindo ? "Excluindo..." : "Excluir paciente"}
        </button>
      </div>

      <div className="abas-financeiro abas-perfil-paciente">
        {ABAS_PACIENTE.map((a) => (
          <button
            key={a.id}
            className={"aba-financeiro" + (aba === a.id ? " aba-financeiro-ativa" : "")}
            onClick={() => setAba(a.id)}
          >
            <Icone nome={a.icone} tamanho={15} /> {a.rotulo}
          </button>
        ))}
      </div>

      {aba === "perfil" && <AbaPerfilPaciente paciente={paciente} />}
      {aba === "modulos" && <AbaModulosPaciente paciente={paciente} />}
      {aba === "questionarios" && <AbaQuestionariosPaciente usuario={usuario} paciente={paciente} />}

      {aba !== "perfil" && aba !== "modulos" && aba !== "questionarios" && (
        <div className="cartao-secao">
          <p className="texto-vazio">
            Essa aba ({ABAS_PACIENTE.find((a) => a.id === aba)?.rotulo}) ainda não foi construída — é uma das próximas etapas.
          </p>
        </div>
      )}
    </div>
  );
}

function AbaPerfilPaciente({ paciente }) {
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
    <div className="cartao-secao">
      <CamposPaciente form={form} setForm={setForm} mostrarStatus={true} />

      {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}

      <div className="acoes-modal acoes-perfil-paciente">
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
  );
}

// ─── Módulos ─────────────────────────────────────────────────────
// Biblioteca de recursos terapêuticos (Ferramentas, Fábulas,
// Psicoeducação) — é conteúdo compartilhado por toda a plataforma
// (não é de uma clínica só), guardado em recursos_terapeuticos /
// fabulas_terapeuticas / psicoeducacao_conteudos. Aqui a psicóloga
// escolhe quais ficam ativados para este paciente. Simplificado em
// relação ao sistema real: sem os "Módulos I-VI" com sugestões
// cruzadas automáticas — ativa direto por item, agrupado por
// categoria.

function formatarCategoria(cat) {
  return (cat || "outros").replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function ToggleModulo({ ativo, onClick }) {
  return (
    <button type="button" className={"toggle-modulo" + (ativo ? " toggle-modulo-ativo" : "")} onClick={onClick}>
      <span className="toggle-modulo-bola" />
    </button>
  );
}

function AbaModulosPaciente({ paciente }) {
  const [recursos, setRecursos] = useState([]);
  const [fabulas, setFabulas] = useState([]);
  const [psicoeducacoes, setPsicoeducacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [config, setConfig] = useState(paciente.modulosConfig || {});
  const [filtroTipo, setFiltroTipo] = useState("todas");
  const [busca, setBusca] = useState("");
  const [visualizando, setVisualizando] = useState(null);

  useEffect(() => {
    Promise.all([
      db.collection("recursos_terapeuticos").get(),
      db.collection("fabulas_terapeuticas").get(),
      db.collection("psicoeducacao_conteudos").get(),
    ])
      .then(([r, f, p]) => {
        setRecursos(r.docs.map((d) => ({ id: d.id, ...d.data() })));
        setFabulas(f.docs.map((d) => ({ id: d.id, ...d.data() })));
        setPsicoeducacoes(p.docs.map((d) => ({ id: d.id, ...d.data() })));
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, []);

  const itens = [
    ...recursos.map((r) => ({ ...r, tipo: "ferramenta", titulo: r.titulo || r.nome })),
    ...fabulas.map((f) => ({ ...f, tipo: "fabula", titulo: f.titulo || f.nome })),
    ...psicoeducacoes.map((p) => ({ ...p, tipo: "psicoeducacao", titulo: p.titulo || p.nome })),
  ];

  const filtrados = itens.filter((it) => {
    const okTipo = filtroTipo === "todas" || it.tipo === filtroTipo;
    const okBusca = !busca || (it.titulo || "").toLowerCase().includes(busca.toLowerCase());
    return okTipo && okBusca;
  });

  const porCategoria = {};
  filtrados.forEach((it) => {
    const cat = it.categoria || "outros";
    (porCategoria[cat] = porCategoria[cat] || []).push(it);
  });
  const categorias = Object.keys(porCategoria).sort((a, b) => a.localeCompare(b, "pt-BR"));

  async function alternar(item) {
    const atual = config[item.id] || {};
    const novoAtivo = !atual.ativo;
    const novaConfig = {
      ...config,
      [item.id]: novoAtivo
        ? { ativo: true, tipo: item.tipo, titulo: item.titulo, dataInicio: new Date().toISOString().slice(0, 10) }
        : { ...atual, ativo: false },
    };
    setConfig(novaConfig);
    const ativos = Object.keys(novaConfig).filter((k) => novaConfig[k]?.ativo);
    try {
      await db.collection("clinica_pacientes").doc(paciente.id).update({
        modulosConfig: novaConfig,
        modulosAtivos: ativos,
      });
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    }
  }

  if (carregando) return <p className="texto-vazio">Carregando biblioteca...</p>;

  if (itens.length === 0) {
    return (
      <div className="cartao-secao">
        <p className="texto-vazio">
          Nenhum recurso cadastrado ainda na biblioteca. Use a ferramenta de migração de dados pra trazer o
          catálogo do sistema anterior (Ferramentas, Fábulas e Psicoeducação).
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="pills-status pills-filtro-modulos">
        {[
          ["todas", "Todas"],
          ["ferramenta", "Ferramentas"],
          ["fabula", "Fábulas"],
          ["psicoeducacao", "Psicoeducação"],
        ].map(([v, l]) => (
          <button key={v} type="button" className={"pill-status" + (filtroTipo === v ? " pill-status-ativa" : "")} onClick={() => setFiltroTipo(v)}>
            {l}
          </button>
        ))}
      </div>
      <input
        className="campo-busca campo-busca-modulos"
        placeholder="Buscar por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {categorias.length === 0 && <p className="texto-vazio">Nenhum item encontrado.</p>}

      {categorias.map((cat) => {
        const cores = corDaCategoria(cat);
        return (
          <div key={cat} className="grupo-status">
            <div className="titulo-grupo-status">
              <span className="etiqueta-categoria-recurso" style={{ "--cor-cat": cores.cor, "--bg-cat": cores.bg }}>
                {formatarCategoria(cat)}
              </span>
              ({porCategoria[cat].length})
            </div>
            <div className="cartao-lista-pacientes">
              {porCategoria[cat].map((item) => {
                const ativo = !!config[item.id]?.ativo;
                return (
                  <div key={item.id} className="linha-modulo" style={{ "--cor-cat": cores.cor }}>
                    <div className="info-lancamento">
                      <div className="descricao-lancamento">{item.titulo}</div>
                      {item.descricao && <div className="detalhe-lancamento">{item.descricao}</div>}
                      {ativo && config[item.id]?.dataInicio && (
                        <div className="detalhe-lancamento">Ativado em {config[item.id].dataInicio.split("-").reverse().join("/")}</div>
                      )}
                    </div>
                    <button className="botao-icone" onClick={() => setVisualizando(item)} title="Visualizar">
                      <Icone nome="eye" tamanho={15} />
                    </button>
                    <ToggleModulo ativo={ativo} onClick={() => alternar(item)} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {visualizando && (
        <VisualizarRecursoModal item={visualizando} aoFechar={() => setVisualizando(null)} />
      )}
    </div>
  );
}

// ─── Questionários ───────────────────────────────────────────────
// Diferente de Módulos (biblioteca compartilhada que a psicóloga
// ativa/desativa por paciente), Questionários são instrumentos
// clínicos individuais desse paciente específico (Anamnese, Entrevista
// Clínica Inicial, Rastreamentos DSM-5 etc.) — no sistema real, cada
// um é preenchido pelo próprio paciente num formulário público e
// aparece aqui, só leitura, pra psicóloga consultar (ver
// admin/questionarios.js: AbaQuestionarios, AbaAnamnese...).
//
// Como o Portal do Paciente do PsiCoWorking ainda não existe (é uma
// etapa futura, maior, separada), esses formulários de autopreenchimento
// também ainda não existem — por isso essas telas aparecem vazias por
// enquanto, mesmo já prontas pra mostrar o resultado assim que a
// coleta existir. Começamos pela Anamnese, que é a mais simples
// (só leitura, sem pontuação); as outras (Entrevista Clínica,
// Rastreamento Bipolar/Borderline, Sexual, Alimentar, Neuro,
// Dependência, Jogos) ficam como "em construção" por enquanto.

const QUESTIONARIOS_DISPONIVEIS = [
  { id: "anamnese", rotulo: "Anamnese", icone: "clipboard-list", desc: "Marcos do desenvolvimento, histórico clínico e familiar.", pronto: true },
  { id: "entrevista", rotulo: "Entrevista Clínica Inicial", icone: "brain", desc: "Perfil etário, escalas de observação e hipóteses diagnósticas DSM-5.", pronto: false },
  { id: "rastreamento", rotulo: "Rastreamento Bipolar / Borderline", icone: "bar-chart-2", desc: "Avaliação diferencial DSM-5, com laudo comparativo.", pronto: false },
  { id: "sexual", rotulo: "Rastreamento de Saúde Sexual", icone: "heart", desc: "Rastreamento confidencial, respondido só pelo paciente.", pronto: false },
  { id: "alimentar", rotulo: "Hábitos Alimentares", icone: "utensils", desc: "Rastreamento de padrões e comportamentos alimentares.", pronto: false },
  { id: "neuro", rotulo: "Funcionamento e Comportamento", icone: "activity", desc: "Rastreamento de atenção, agitação e interação social.", pronto: false },
  { id: "dependencia", rotulo: "Dependência Química e Substâncias", icone: "triangle-alert", desc: "Rastreamento DSM-5 para Transtornos por Uso de Substâncias.", pronto: false },
  { id: "jogos", rotulo: "Jogos e Apostas", icone: "dice-5", desc: "Rastreamento de Gaming e Gambling Disorder (DSM-5 / CID-11).", pronto: false },
];

function AbaQuestionariosPaciente({ usuario, paciente }) {
  const [aberto, setAberto] = useState(null);

  if (aberto === "anamnese") {
    return <AbaAnamneseView usuario={usuario} paciente={paciente} aoVoltar={() => setAberto(null)} />;
  }

  return (
    <div>
      <p className="subtitulo-pagina" style={{ marginBottom: 16 }}>Selecione um questionário para visualizar.</p>
      <div className="grade-cartoes-recursos">
        {QUESTIONARIOS_DISPONIVEIS.map((q) => (
          <div
            key={q.id}
            className="cartao-recurso"
            style={{ cursor: q.pronto ? "pointer" : "default", opacity: q.pronto ? 1 : 0.6 }}
            onClick={() => q.pronto && setAberto(q.id)}
          >
            <div className="cabecalho-cartao-recurso">
              <div className="icone-cartao-recurso" style={{ "--cor-cat": "var(--cor-marca)" }}>
                <Icone nome={q.icone} tamanho={20} />
              </div>
              <div className="titulo-cartao-recurso">{q.rotulo}</div>
            </div>
            <p className="descricao-cartao-recurso">{q.desc}</p>
            {!q.pronto && <span className="texto-vazio" style={{ fontSize: 11.5 }}>Em construção</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AbaAnamneseView({ usuario, paciente, aoVoltar }) {
  const [anamnese, setAnamnese] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    db.collection("clinica_anamneses")
      .where("psi_id", "==", usuario.psiId)
      .where("pacienteId", "==", paciente.id)
      .limit(1)
      .get()
      .then((snap) => {
        if (!snap.empty) setAnamnese({ id: snap.docs[0].id, ...snap.docs[0].data() });
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, [usuario.psiId, paciente.id]);

  const LABELS = {
    perfil: "Perfil", informanteTipo: "Quem respondeu", nomeRespondente: "Nome do respondente",
    parentescoRespondente: "Parentesco", queixa: "Queixa Principal",
    gestacaoPlanejada: "Gestação planejada", tipoParto: "Tipo de parto",
    idadeGestacional: "Idade gestacional", choroNascer: "Chorou ao nascer",
    sustCabeca: "Firmou a cabeça", sentou: "Sentou sozinho", engatinhou: "Engatinhou",
    caminhou: "Caminhou", lateralidade: "Lateralidade", balbucio: "Balbucio",
    primeirasParalavras: "Primeiras palavras", frasesSimples: "Frases simples",
    clarezaFala: "Clareza da fala", contatoVisual: "Contato visual",
    sorrisoSocial: "Sorriso social", padraOSono: "Padrão de sono",
    padraoAlimentar: "Padrão alimentar", desfralDiurno: "Desfralde diurno",
    desfralNoturno: "Desfralde noturno", idadeEscola: "Idade na escola",
    adaptacaoEscola: "Adaptação escolar", repetencia: "Repetência",
    facilidades: "Facilidades", dificuldades: "Dificuldades",
    foco: "Atenção/Foco", organizacao: "Organização", memoria: "Memória",
    convulsoes: "Convulsões/Desmaios", medicacoes: "Medicações",
    historicoFamiliar: "Histórico familiar", obsFinais: "Observações finais",
    escolaridade: "Escolaridade", profissao: "Profissão", comQuemMora: "Com quem mora",
    contextoEncaminhamento: "Contexto do encaminhamento", inicioQueixa: "Início dos sintomas",
    evolucaoQueixa: "Evolução", usoAlcoolDrogas: "Uso de álcool/drogas",
    orientacao: "Orientação", atencao: "Atenção",
    decisoes: "Tomada de decisões", avdBasicas: "Higiene/vestir",
    avdFinanceiro: "Gestão financeira", avdSair: "Sair sozinho",
    doencasCronicas: "Doenças crônicas", quedas: "Quedas frequentes",
    marcha: "Alteração de marcha", tremores: "Tremores", confusaoNoturna: "Confusão noturna",
  };
  const IGNORAR = ["id", "psi_id", "pacienteId", "pacienteNome", "tipo", "criadoEm", "perfil", "informanteTipo", "nomeRespondente", "parentescoRespondente"];

  return (
    <div>
      <button className="botao-secundario botao-voltar-perfil" onClick={aoVoltar} style={{ marginBottom: 16 }}>
        <Icone nome="arrow-left" tamanho={15} /> Voltar para Questionários
      </button>

      {carregando && <p>Carregando...</p>}

      {!carregando && !anamnese && (
        <div className="cartao-secao">
          <p className="texto-vazio">
            Nenhuma anamnese encontrada para {paciente.nome}. Ela é preenchida pelo próprio paciente num
            formulário público — o Portal do Paciente do PsiCoWorking ainda não tem essa etapa pronta, então
            por enquanto não há como o paciente enviar essa resposta ainda.
          </p>
        </div>
      )}

      {!carregando && anamnese && (
        <div className="cartao-secao">
          <div className="cabecalho-secao-lanc" style={{ marginBottom: 16 }}>
            <span className="etiqueta-categoria-recurso" style={{ "--cor-cat": "var(--cor-marca)", "--bg-cat": "var(--marca-plataforma-lavanda)" }}>
              {anamnese.perfil === "infantil" ? "Infantil/Neurodesenvolvimento" : "Adulto/Idoso"}
            </span>
          </div>

          {anamnese.queixa && (
            <div className="aviso-preview-paciente" style={{ display: "block" }}>
              <strong>Queixa Principal</strong>
              <p style={{ margin: "4px 0 0" }}>{anamnese.queixa}</p>
            </div>
          )}

          <div className="grade-2col" style={{ marginTop: 16 }}>
            {Object.entries(anamnese)
              .filter(([k, v]) => !IGNORAR.includes(k) && v && String(v).trim())
              .map(([k, v]) => (
                <div key={k} className="campo-largura-total">
                  <label>{LABELS[k] || k}</label>
                  <p className="texto-visualizar-recurso">{String(v)}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
