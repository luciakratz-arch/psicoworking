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
      <div className="campo-largura-total">
        <button
          type="button"
          onClick={() => setForm({ ...form, ehMenorDeIdade: !form.ehMenorDeIdade })}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
            padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
            border: form.ehMenorDeIdade ? "1.5px solid #0891b2" : "1.5px solid var(--borda)",
            background: form.ehMenorDeIdade ? "#0891b2" : "white",
            color: form.ehMenorDeIdade ? "white" : "var(--texto-suave)",
          }}
        >
          <Icone nome="users" tamanho={14} /> Paciente menor de 18 anos
        </button>
      </div>
      {form.ehMenorDeIdade && (
        <>
          <div className="campo-largura-total titulo-secao-form" style={{ color: "#0891b2", borderBottomColor: "#bae6fd" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icone nome="users" tamanho={13} /> Responsável / Pais
            </span>
          </div>
          <div className="campo-largura-total">
            <label>Nome do Responsável <span className="opcional">(opcional)</span></label>
            <input value={form.responsavelNome || ""} onChange={(e) => setForm({ ...form, responsavelNome: e.target.value })} placeholder="Ex: Maria da Silva Castro" />
          </div>
          <div>
            <label>Parentesco / Vínculo</label>
            <select value={form.responsavelParentesco || ""} onChange={(e) => setForm({ ...form, responsavelParentesco: e.target.value })}>
              <option value="">Selecione</option>
              <option>Mãe</option>
              <option>Pai</option>
              <option>Avó</option>
              <option>Avô</option>
              <option>Tia/Tio</option>
              <option>Tutor(a) legal</option>
              <option>Responsável institucional</option>
              <option>Outro</option>
            </select>
          </div>
          <div>
            <label>CPF do Responsável</label>
            <input value={form.responsavelCpf || ""} onChange={(e) => setForm({ ...form, responsavelCpf: e.target.value })} placeholder="000.000.000-00" />
          </div>
          <div>
            <label>Telefone do Responsável</label>
            <input value={form.responsavelTelefone || ""} onChange={(e) => setForm({ ...form, responsavelTelefone: e.target.value })} placeholder="(62) 9 0000-0000" />
          </div>
          <div>
            <label>E-mail do Responsável</label>
            <input type="email" value={form.responsavelEmail || ""} onChange={(e) => setForm({ ...form, responsavelEmail: e.target.value })} placeholder="email@exemplo.com" />
          </div>
          <div className="campo-largura-total">
            <label>Nome do Segundo Responsável <span className="opcional">(opcional)</span></label>
            <input value={form.responsavel2Nome || ""} onChange={(e) => setForm({ ...form, responsavel2Nome: e.target.value })} placeholder="Ex: João Castro (pai)" />
          </div>
          <div>
            <label>Parentesco 2º Responsável</label>
            <select value={form.responsavel2Parentesco || ""} onChange={(e) => setForm({ ...form, responsavel2Parentesco: e.target.value })}>
              <option value="">Selecione</option>
              <option>Mãe</option>
              <option>Pai</option>
              <option>Avó</option>
              <option>Avô</option>
              <option>Tia/Tio</option>
              <option>Tutor(a) legal</option>
              <option>Responsável institucional</option>
              <option>Outro</option>
            </select>
          </div>
          <div>
            <label>Telefone 2º Responsável</label>
            <input value={form.responsavel2Telefone || ""} onChange={(e) => setForm({ ...form, responsavel2Telefone: e.target.value })} placeholder="(62) 9 0000-0000" />
          </div>
          <div className="campo-largura-total">
            <label>Observações sobre o responsável / contexto familiar</label>
            <TextAreaVoz
              className="campo-descricao"
              rows={2}
              value={form.responsavelObs || ""}
              onChange={(e) => setForm({ ...form, responsavelObs: e.target.value })}
              placeholder="Ex: Pais separados, guarda compartilhada. Mãe tem autoridade para autorizar procedimentos..."
            />
          </div>
        </>
      )}
      <div className="campo-largura-total titulo-secao-form">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icone nome="briefcase" tamanho={13} /> Dados Ocupacionais — para documentos NR-1 e declarações
        </span>
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
  // Se já existe algum dado de responsável salvo (cadastros antigos,
  // antes do botão existir), abre a seção automaticamente.
  const [form, setForm] = useState({
    ...paciente,
    ehMenorDeIdade: paciente.ehMenorDeIdade || !!paciente.responsavelNome,
  });
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
  if (typeof TODAS_SUBCATEGORIAS !== "undefined") {
    const sub = TODAS_SUBCATEGORIAS.find((s) => s.id === cat);
    if (sub) return sub.label;
    const macro = MACROCATEGORIAS.find((m) => m.id === cat);
    if (macro) return macro.label;
    const legado = CATEGORIAS_LEGADO.find((c) => c.id === cat);
    if (legado) return legado.label;
  }
  return (cat || "outros").replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function ToggleModulo({ ativo, onClick }) {
  return (
    <button type="button" className={"toggle-modulo" + (ativo ? " toggle-modulo-ativo" : "")} onClick={onClick}>
      <span className="toggle-modulo-bola" />
    </button>
  );
}

// Ordem e rótulo de cada módulo — nunca mistura ferramenta com fábula
// com psicoeducação numa mesma seção (era esse o "tudo misturado").
const ORDEM_MODULOS_RECURSO = ["ferramenta", "fabula", "psicoeducacao"];
const ROTULO_MODULO_RECURSO = {
  ferramenta: { titulo: "Ferramentas", icone: "wrench" },
  fabula: { titulo: "Fábulas Terapêuticas", icone: "book-open" },
  psicoeducacao: { titulo: "Psicoeducação", icone: "brain" },
};

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

  // Agrupa primeiro por MÓDULO (Ferramentas / Fábulas / Psicoeducação) —
  // igual ao modelo, que nunca mistura tipos diferentes numa mesma
  // seção — e só depois por macrocategoria clínica dentro de cada um.
  const porTipo = {};
  filtrados.forEach((it) => {
    (porTipo[it.tipo] = porTipo[it.tipo] || []).push(it);
  });
  const tiposComItens = ORDEM_MODULOS_RECURSO.filter((tipo) => porTipo[tipo]?.length);

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

      {tiposComItens.length === 0 && <p className="texto-vazio">Nenhum item encontrado.</p>}

      {tiposComItens.map((tipo) => {
        const itensDoTipo = porTipo[tipo];
        const rotuloModulo = ROTULO_MODULO_RECURSO[tipo];
        const porCategoria = {};
        itensDoTipo.forEach((it) => {
          const cat = it.categoria || "outros";
          (porCategoria[cat] = porCategoria[cat] || []).push(it);
        });
        const categorias = Object.keys(porCategoria).sort((a, b) => a.localeCompare(b, "pt-BR"));

        return (
          <div key={tipo} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "var(--cor-marca)", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #EADDFC" }}>
              <Icone nome={rotuloModulo.icone} tamanho={17} />
              {rotuloModulo.titulo}
              <span style={{ fontWeight: 500, color: "var(--texto-suave)", fontSize: 13 }}>({itensDoTipo.length})</span>
            </div>

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
  { id: "dependencia", rotulo: "Dependência Química e Substâncias", icone: "triangle-alert", desc: "Rastreamento DSM-5 para Transtornos por Uso de Substâncias.", pronto: true },
  { id: "jogos", rotulo: "Jogos e Apostas", icone: "dice-5", desc: "Rastreamento de Gaming e Gambling Disorder (DSM-5 / CID-11).", pronto: true },
];

// Dados de cada instrumento de rastreamento já portado — a lista
// completa de perguntas (mesma ordem/texto do formulário público em
// psi/atividade/formulario-rastreamento.js) e a fórmula de gravidade,
// que é igual nos dois: soma de respostas B+C contra os limiares do
// modelo original (2-3 leve, 4-5 moderada, 6+ grave).
const RASTREAMENTOS_ADMIN = {
  jogos: {
    titulo: "Rastreamento de Dependência de Jogos e Apostas",
    subtitulo: "9 critérios DSM-5 / CID-11 · Instrumento aplicado ao paciente e/ou familiares",
    totalCriterios: 9,
    perguntas: [
      { id: "p1", modulo: "Preocupação/Abstinência", texto: "Preocupação mental excessiva com jogos" },
      { id: "p2", modulo: "Preocupação/Abstinência", texto: "Sintomas de abstinência ao parar (irritabilidade, ansiedade)" },
      { id: "p3", modulo: "Tolerância/Controle", texto: "Tolerância — necessidade crescente de tempo ou dinheiro" },
      { id: "p4", modulo: "Tolerância/Controle", texto: "Tentativas infrutíferas de controlar ou cessar o jogo" },
      { id: "p5", modulo: "Tolerância/Controle", texto: "Abandono de outros hobbies e atividades sociais" },
      { id: "p6", modulo: "Consequências", texto: "Continuidade apesar de problemas graves" },
      { id: "p7", modulo: "Consequências", texto: "Ocultação e mentiras sobre a extensão do hábito" },
      { id: "p8", modulo: "Consequências", texto: "Uso do jogo como fuga de problemas emocionais" },
      { id: "p9", modulo: "Prejuízo Funcional", texto: "Perda ou risco severo de emprego, estudos ou relacionamentos" },
    ],
  },
  dependencia: {
    titulo: "Rastreamento de Dependência Química e Substâncias",
    subtitulo: "11 critérios DSM-5 · Instrumento aplicado ao paciente e/ou familiares",
    totalCriterios: 11,
    perguntas: [
      { id: "p1", modulo: "Controle Prejudicado", texto: "Consumo em maiores quantidades ou por mais tempo do que o pretendido" },
      { id: "p2", modulo: "Controle Prejudicado", texto: "Desejo persistente ou esforços infrutíferos para controlar o uso" },
      { id: "p3", modulo: "Controle Prejudicado", texto: "Despendimento excessivo de tempo com a substância" },
      { id: "p4", modulo: "Controle Prejudicado", texto: "Fissura (craving) — desejo imperioso de usar" },
      { id: "p5", modulo: "Prejuízo Social", texto: "Falha no cumprimento de obrigações importantes" },
      { id: "p6", modulo: "Prejuízo Social", texto: "Uso contínuo apesar de problemas sociais ou interpessoais" },
      { id: "p7", modulo: "Prejuízo Social", texto: "Abandono de atividades importantes por causa do uso" },
      { id: "p8", modulo: "Uso de Risco", texto: "Uso em situações de perigo físico" },
      { id: "p9", modulo: "Uso de Risco", texto: "Uso contínuo apesar de problemas físicos ou psicológicos" },
      { id: "p10", modulo: "Farmacológico", texto: "Tolerância — necessidade de doses crescentes" },
      { id: "p11", modulo: "Farmacológico", texto: "Abstinência — síndrome ao parar ou uso para evitar mal-estar" },
    ],
  },
};

function gravidadeRastreamento(doc, perguntas) {
  const C = perguntas.filter((p) => doc[p.id] === "C").length;
  const B = perguntas.filter((p) => doc[p.id] === "B").length;
  const total = C + B;
  let rotulo, cor;
  if (total >= 6) { rotulo = "Grave (6+ critérios)"; cor = "#DC2626"; }
  else if (total >= 4) { rotulo = "Moderada (4-5 critérios)"; cor = "#D97706"; }
  else if (total >= 2) { rotulo = "Leve (2-3 critérios)"; cor = "#B45309"; }
  else { rotulo = "Abaixo do limiar diagnóstico"; cor = "#16A34A"; }
  return { B, C, total, rotulo, cor };
}

const COR_LETRA_RASTREAMENTO = { A: "#16A34A", B: "#D97706", C: "#DC2626" };

// Visualizador de qualquer rastreamento já portado (Jogos, Dependência
// Química, e os próximos que forem sendo adicionados a
// RASTREAMENTOS_ADMIN) — mesmo componente serve todos, só muda a
// config e a coleção.
function AbaRastreamentoView({ usuario, paciente, tipo, aoVoltar }) {
  const config = RASTREAMENTOS_ADMIN[tipo];
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [selecionado, setSelecionado] = useState(null);
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    db.collection("clinica_rastreamento_" + tipo)
      .where("psi_id", "==", usuario.psiId)
      .where("pacienteId", "==", paciente.id)
      .get()
      .then((snap) => {
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
        setDocs(lista);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, [usuario.psiId, paciente.id, tipo]);

  async function gerarLink() {
    setGerandoLink(true);
    try {
      const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
      const cfg = cfgDoc.exists ? cfgDoc.data() : {};
      const token = gerarTokenLink();
      await db.collection("clinica_links_partilhados").doc(token).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome || "",
        tipo,
        titulo: config.titulo,
        nomeClinica: cfg.nome || "PsiCoWorking",
        corMarca: cfg.corPrimaria || "#6A2BD9",
        logoUrl: cfg.logoUrl || "",
        status: "enviado",
        cancelado: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setLinkGerado(window.location.origin + "/psi/atividade/?t=" + token);
    } catch (e) {
      alert("Não foi possível gerar o link: " + e.message);
    } finally {
      setGerandoLink(false);
    }
  }

  function abrirWhatsApp() {
    const primeiroNome = (paciente.nome || "").split(" ")[0];
    const mensagem =
      `Olá, ${primeiroNome}!\n\n` +
      `Preparei um questionário clínico para você preencher: *${config.titulo}*.\n\n` +
      `Leva alguns minutos — é só abrir o link abaixo e responder com calma:\n\n` +
      `${linkGerado}\n\n` +
      `Qualquer dúvida, me chama por aqui.`;
    const numero = (paciente.telefone || "").replace(/\D/g, "");
    const url = numero
      ? "https://wa.me/55" + numero + "?text=" + encodeURIComponent(mensagem)
      : "https://wa.me/?text=" + encodeURIComponent(mensagem);
    window.open(url, "_blank");
  }

  function copiarLink() {
    navigator.clipboard.writeText(linkGerado).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }

  // Gera o laudo em PDF (via impressão do navegador) com a marca da
  // própria clínica — mesmo recurso do modelo, adaptado pra não ter
  // o nome da Dra. Lucia fixo no documento.
  async function gerarLaudo() {
    if (docs.length === 0) return;
    const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
    const cfg = cfgDoc.exists ? cfgDoc.data() : {};
    const nomeClinica = cfg.nome || "PsiCoWorking";
    const pacNome = paciente.nome || "Paciente";
    const dataDoc = new Date().toLocaleDateString("pt-BR");

    const linhasPorDoc = docs.map((doc) => {
      const g = gravidadeRastreamento(doc, config.perguntas);
      const respondente = doc.tipoRespondente === "paciente" ? "Próprio paciente" : (doc.nomeRespondente || "Familiar") + " (" + (doc.parentesco || "—") + ")";
      const linhasPerguntas = config.perguntas.map((p) =>
        `<tr><td>${p.id.replace("p", "")}</td><td>${p.texto}</td><td>${p.modulo}</td><td style="font-weight:700;color:${COR_LETRA_RASTREAMENTO[doc[p.id]] || "#6b7280"}">${doc[p.id] || "—"}</td></tr>`
      ).join("");
      const obsLinha = doc.obsFinais ? `<tr><td colspan="2"><strong>Observações</strong></td><td colspan="2">${doc.obsFinais}</td></tr>` : "";
      return `
        <h2>Respondente: ${respondente}</h2>
        <div class="gravidade">Critérios preenchidos: ${g.total}/${config.totalCriterios} &nbsp;·&nbsp; ${g.rotulo}</div>
        <p style="font-size:12px;color:#4b5563;margin-bottom:10px">Respostas C (critério pleno): <strong>${g.C}</strong> &nbsp;|&nbsp; Respostas B (parcial/subclínico): <strong>${g.B}</strong></p>
        <table class="resp-table"><thead><tr><th>#</th><th>Critério</th><th>Módulo</th><th>Resp.</th></tr></thead><tbody>${linhasPerguntas}${obsLinha}</tbody></table>`;
    }).join("");

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Laudo ${config.titulo} — ${pacNome}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#1f2937;padding:32px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6}
h1{font-size:20px;color:#3d006a;margin-bottom:4px}
h2{font-size:14px;color:#7B00C4;margin:20px 0 8px;border-bottom:1px solid #ede9fe;padding-bottom:4px}
.header{border-bottom:2px solid #7B00C4;padding-bottom:16px;margin-bottom:20px}
.sub{font-size:12px;color:#6b7280;margin-top:2px}
.gravidade{background:#f5f3ff;border:1px solid #c4b5fd;border-radius:10px;padding:14px 18px;margin:12px 0;font-size:15px;font-weight:700;color:#3d006a}
.resp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
.resp-table th{background:#f5f3ff;padding:6px 10px;text-align:left;font-size:10.5px;color:#7B00C4;border:1px solid #ede9fe}
.resp-table td{padding:6px 10px;border:1px solid #e5e7eb;vertical-align:top}
.resp-table tr:nth-child(even) td{background:#fafafa}
.rodape{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
@media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px">Imprimir / Salvar PDF</button>
</div>
<div class="header">
  <h1>Laudo — ${config.titulo}</h1>
  <div class="sub">Paciente: <strong>${pacNome}</strong> · Data: ${dataDoc} · ${nomeClinica}</div>
  <div class="sub">Respondentes: ${docs.length} (${docs.map((d) => (d.tipoRespondente === "paciente" ? "próprio paciente" : d.parentesco || "familiar")).join(", ")})</div>
</div>
${linhasPorDoc}
<div class="rodape">Documento gerado em ${dataDoc} · Uso exclusivo para fins clínicos · Confidencial · LGPD</div>
</body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }

  return (
    <div>
      <button className="botao-secundario botao-voltar-perfil" onClick={aoVoltar} style={{ marginBottom: 16 }}>
        <Icone nome="arrow-left" tamanho={15} /> Voltar para Questionários
      </button>

      <h3 style={{ marginBottom: 2 }}>{config.titulo}</h3>
      <p className="subtitulo-pagina" style={{ marginBottom: 20 }}>{config.subtitulo}</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {!linkGerado ? (
          <button className="botao-primario" onClick={gerarLink} disabled={gerandoLink}>
            <Icone nome="link" tamanho={15} /> {gerandoLink ? "Gerando..." : "Gerar link do questionário"}
          </button>
        ) : (
          <>
            <button className="botao-secundario" onClick={copiarLink}>
              <Icone nome={copiado ? "check" : "link"} tamanho={14} /> {copiado ? "Copiado!" : "Copiar link"}
            </button>
            <button className="botao-primario" onClick={abrirWhatsApp} style={{ background: "#25D366" }}>
              <Icone nome="message-circle" tamanho={14} /> Enviar pelo WhatsApp
            </button>
          </>
        )}
        {docs.length > 0 && (
          <button className="botao-secundario" onClick={gerarLaudo}>
            <Icone nome="file-text" tamanho={14} /> Gerar laudo em PDF
          </button>
        )}
      </div>

      {carregando && <p className="texto-vazio">Carregando...</p>}

      {!carregando && docs.length === 0 && (
        <div className="cartao-secao">
          <p className="texto-vazio">Nenhuma resposta recebida ainda. Gere o link acima e envie ao paciente ou familiar.</p>
        </div>
      )}

      {!carregando && docs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {docs.map((doc) => {
            const g = gravidadeRastreamento(doc, config.perguntas);
            const aberto = selecionado === doc.id;
            return (
              <div key={doc.id} style={{ border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                <div
                  onClick={() => setSelecionado(aberto ? null : doc.id)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer", background: aberto ? "#F5F3FF" : "white" }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {doc.tipoRespondente === "paciente" ? "Próprio paciente" : (doc.nomeRespondente || "Familiar") + " · " + (doc.parentesco || "")}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--texto-suave)", marginTop: 2 }}>
                      {doc.criadoEm?.seconds ? new Date(doc.criadoEm.seconds * 1000).toLocaleDateString("pt-BR") : "—"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: g.cor }}>{g.rotulo}</div>
                    <div style={{ fontSize: 11, color: "var(--texto-suave)", marginTop: 2 }}>{g.total} critérios / {config.totalCriterios}</div>
                  </div>
                </div>
                {aberto && (
                  <div style={{ borderTop: "1px solid #E5E7EB", padding: 16 }}>
                    {config.perguntas.map((p) => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
                        <div style={{
                          width: 24, height: 24, minWidth: 24, borderRadius: "50%",
                          background: doc[p.id] ? COR_LETRA_RASTREAMENTO[doc[p.id]] + "22" : "#F3F4F6",
                          border: "2px solid " + (doc[p.id] ? COR_LETRA_RASTREAMENTO[doc[p.id]] : "#E5E7EB"),
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                          color: doc[p.id] ? COR_LETRA_RASTREAMENTO[doc[p.id]] : "#9CA3AF",
                        }}>
                          {doc[p.id] || "—"}
                        </div>
                        <div style={{ fontSize: 12, color: "#374151", flex: 1 }}>{p.texto}</div>
                        <div style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap" }}>{p.modulo}</div>
                      </div>
                    ))}
                    {doc.obsFinais && (
                      <div style={{ marginTop: 12, background: "#F9FAFB", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#4B5563" }}>
                        <strong>Observações:</strong> {doc.obsFinais}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AbaQuestionariosPaciente({ usuario, paciente }) {
  const [aberto, setAberto] = useState(null);

  if (aberto === "anamnese") {
    return <AbaAnamneseView usuario={usuario} paciente={paciente} aoVoltar={() => setAberto(null)} />;
  }
  if (aberto && RASTREAMENTOS_ADMIN[aberto]) {
    return <AbaRastreamentoView usuario={usuario} paciente={paciente} tipo={aberto} aoVoltar={() => setAberto(null)} />;
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
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);

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

  // Gera o link público do formulário de Anamnese, igual ao "Enviar
  // para paciente" dos Recursos Terapêuticos — mesma coleção
  // clinica_links_partilhados, só que com tipo "anamnese" em vez de
  // apontar pra um item do catálogo (gerarTokenLink vem de
  // app_recursos.js, carregado antes deste script no index.html).
  async function gerarLinkAnamnese() {
    setGerandoLink(true);
    try {
      const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
      const cfg = cfgDoc.exists ? cfgDoc.data() : {};
      const token = gerarTokenLink();
      await db.collection("clinica_links_partilhados").doc(token).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome || "",
        tipo: "anamnese",
        titulo: "Formulário de Anamnese",
        nomeClinica: cfg.nome || "PsiCoWorking",
        corMarca: cfg.corPrimaria || "#6A2BD9",
        logoUrl: cfg.logoUrl || "",
        status: "enviado",
        cancelado: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setLinkGerado(window.location.origin + "/psi/atividade/?t=" + token);
    } catch (e) {
      alert("Não foi possível gerar o link: " + e.message);
    } finally {
      setGerandoLink(false);
    }
  }

  function abrirWhatsAppAnamnese() {
    const primeiroNome = (paciente.nome || "").split(" ")[0];
    const mensagem =
      `Olá, ${primeiroNome}!\n\n` +
      `Antes da nossa sessão, preciso que você preencha um formulário com algumas informações — leva de 10 a 20 minutos.\n\n` +
      `É só abrir o link abaixo no celular e responder com calma:\n\n` +
      `${linkGerado}\n\n` +
      `Qualquer dúvida, me chama por aqui.`;
    const numero = (paciente.telefone || "").replace(/\D/g, "");
    const url = numero
      ? "https://wa.me/55" + numero + "?text=" + encodeURIComponent(mensagem)
      : "https://wa.me/?text=" + encodeURIComponent(mensagem);
    window.open(url, "_blank");
  }

  function copiarLinkAnamnese() {
    navigator.clipboard.writeText(linkGerado).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }

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
          <p className="texto-vazio" style={{ marginBottom: 16 }}>
            Nenhuma anamnese encontrada para {paciente.nome}. Ela é preenchida pelo próprio paciente num
            formulário público — sem precisar de login, direto pelo celular.
          </p>

          {!linkGerado ? (
            <button className="botao-primario" onClick={gerarLinkAnamnese} disabled={gerandoLink}>
              <Icone nome="link" tamanho={15} /> {gerandoLink ? "Gerando..." : "Gerar link do formulário"}
            </button>
          ) : (
            <>
              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 12, wordBreak: "break-all", marginBottom: 12 }}>
                {linkGerado}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="botao-secundario" onClick={copiarLinkAnamnese}>
                  <Icone nome={copiado ? "check" : "link"} tamanho={14} /> {copiado ? "Copiado!" : "Copiar link"}
                </button>
                <button className="botao-primario" onClick={abrirWhatsAppAnamnese} style={{ background: "#25D366" }}>
                  <Icone nome="message-circle" tamanho={14} /> Enviar pelo WhatsApp
                </button>
              </div>
            </>
          )}
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
