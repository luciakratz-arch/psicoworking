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

      {aba === "metas" && <AbaMetasPaciente usuario={usuario} paciente={paciente} />}
      {aba === "laudos" && <AbaLaudosPaciente usuario={usuario} paciente={paciente} />}
      {aba === "evolucao" && <AbaEvolucaoPaciente usuario={usuario} paciente={paciente} />}
      {aba === "saude-ocupacional" && <AbaSaudeOcupacionalPaciente usuario={usuario} paciente={paciente} />}
      {aba === "links" && <AbaLinksPaciente usuario={usuario} paciente={paciente} />}
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
  { id: "rastreamento", rotulo: "Rastreamento Bipolar / Borderline", icone: "bar-chart-2", desc: "Avaliação diferencial DSM-5, com laudo comparativo.", pronto: true },
  { id: "sexual", rotulo: "Rastreamento de Saúde Sexual", icone: "heart", desc: "Rastreamento confidencial, respondido só pelo paciente.", pronto: true },
  { id: "alimentar", rotulo: "Hábitos Alimentares", icone: "utensils", desc: "Rastreamento de padrões e comportamentos alimentares.", pronto: true },
  { id: "neuro", rotulo: "Funcionamento e Comportamento", icone: "activity", desc: "Rastreamento de atenção, agitação e interação social.", pronto: true },
  { id: "dependencia", rotulo: "Dependência Química e Substâncias", icone: "triangle-alert", desc: "Rastreamento DSM-5 para Transtornos por Uso de Substâncias.", pronto: true },
  { id: "jogos", rotulo: "Jogos e Apostas", icone: "dice-5", desc: "Rastreamento de Gaming e Gambling Disorder (DSM-5 / CID-11).", pronto: true },
];

// ─── 7 Grupos Diagnósticos DSM-5 ──────────────────────────────────
// Cada grupo agrupa hipóteses diagnósticas. A psicóloga seleciona as
// hipóteses relevantes por paciente e gera um link de rastreamento
// personalizado (token em clinica_rastreamento_tokens).
const GRUPOS_DIAGNOSTICOS = [
  {
    id: "G1", icone: "bar-chart", titulo: "Transtornos do Humor",
    descricao: "Depressão, bipolar e ciclotimia — avaliação do eixo do humor",
    cor: "#4F46E5", corBg: "#EEF2FF",
    hipoteses: [
      { id: "tdm",        rotulo: "Depressão Maior (TDM)" },
      { id: "distimia",   rotulo: "Depressão Persistente (Distimia)" },
      { id: "ciclotimia", rotulo: "Ciclotimia" },
      { id: "bipolar_I",  rotulo: "Transtorno Bipolar tipo I (Mania)" },
      { id: "bipolar_II", rotulo: "Transtorno Bipolar tipo II (Hipomania + Depressão)" },
    ],
  },
  {
    id: "G2", icone: "wind", titulo: "Transtornos de Ansiedade",
    descricao: "Ansiedade generalizada, pânico e ansiedade social",
    cor: "#0D9488", corBg: "#F0FDFA",
    hipoteses: [
      { id: "tag",          rotulo: "Ansiedade Generalizada (TAG)" },
      { id: "panico",       rotulo: "Transtorno do Pânico" },
      { id: "fobia_social", rotulo: "Ansiedade Social (Fobia Social)" },
    ],
  },
  {
    id: "G3", icone: "rotate-cw", titulo: "TOC e Transtornos Relacionados",
    descricao: "Obsessões, compulsões e comportamentos repetitivos",
    cor: "#D97706", corBg: "#FFFBEB",
    hipoteses: [
      { id: "toc", rotulo: "TOC — Transtorno Obsessivo-Compulsivo" },
    ],
  },
  {
    id: "G4", icone: "zap", titulo: "Trauma e Estressores",
    descricao: "TEPT, TEPT Complexo, dissociativo e adaptação",
    cor: "#DC2626", corBg: "#FEF2F2",
    hipoteses: [
      { id: "tept",          rotulo: "TEPT — Estresse Pós-Traumático" },
      { id: "tept_complexo", rotulo: "TEPT Complexo (CID-11)" },
      { id: "dissociativo",  rotulo: "Transtorno Dissociativo" },
      { id: "adaptacao",     rotulo: "Transtorno de Adaptação" },
    ],
  },
  {
    id: "G5", icone: "user", titulo: "Transtornos de Personalidade",
    descricao: "Padrões persistentes de experiência e comportamento desadaptativos",
    cor: "#BE185D", corBg: "#FDF2F8",
    hipoteses: [
      { id: "borderline",  rotulo: "TP Borderline" },
      { id: "histrionico", rotulo: "TP Histriônico" },
      { id: "narcisista",  rotulo: "TP Narcisista" },
      { id: "antissocial", rotulo: "TP Antissocial" },
    ],
  },
  {
    id: "G6", icone: "cpu", titulo: "Neurodesenvolvimento",
    descricao: "TDAH, TEA, TOD e outros transtornos do desenvolvimento",
    cor: "#7C3AED", corBg: "#F5F3FF",
    hipoteses: [
      { id: "tdah_des", rotulo: "TDAH — Predominantemente Desatento" },
      { id: "tdah_hip", rotulo: "TDAH — Hiperativo/Impulsivo" },
      { id: "tea",      rotulo: "TEA — Transtorno do Espectro Autista" },
      { id: "tod",      rotulo: "TOD — Transtorno Opositivo-Desafiador" },
    ],
  },
  {
    id: "G7", icone: "layers", titulo: "Comportamentos Aditivos e Alimentares",
    descricao: "Dependência química, jogos e transtornos alimentares",
    cor: "#059669", corBg: "#ECFDF5",
    hipoteses: [
      { id: "substancias", rotulo: "Dependência Química / Substâncias" },
      { id: "gaming",      rotulo: "Transtorno de Jogos Digitais (Gaming)" },
      { id: "gambling",    rotulo: "Transtorno de Apostas (Gambling)" },
      { id: "anorexia",    rotulo: "Anorexia Nervosa" },
      { id: "bulimia",     rotulo: "Bulimia / TCA" },
    ],
  },
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

// Regras reais do DSM-5 para cada instrumento genérico. Só a resposta C
// conta como critério presente; B (parcial) fica listada como ponto a
// observar. Jogo patológico: 4 de 9 (leve 4-5, moderado 6-7, grave
// 8-9). Uso de substâncias: 2 de 11 (leve 2-3, moderado 4-5, grave 6+).
const REGRAS_DSM5_RASTREAMENTO = {
  jogos: {
    nome: "Transtorno de Jogo / Apostas (Gambling/Gaming Disorder)", minimo: 4, provavel: 3, graus: [[8, "Grave"], [6, "Moderado"], [4, "Leve"]],
    confirmacoes: [
      "Padrão problemático persistente ou recorrente ao longo de 12 meses, com sofrimento ou prejuízo clinicamente significativo?",
      "O comportamento não é melhor explicado por um episódio maníaco?",
    ],
  },
  dependencia: {
    nome: "Transtorno por Uso de Substâncias", minimo: 2, provavel: 1, graus: [[6, "Grave"], [4, "Moderado"], [2, "Leve"]],
    confirmacoes: [
      "Padrão problemático de uso levando a prejuízo ou sofrimento clinicamente significativo, em um período de 12 meses?",
    ],
  },
};

function gravidadeRastreamento(doc, config, ajustes = {}) {
  const regra = REGRAS_DSM5_RASTREAMENTO[config.tipo];
  const av = avaliarCriteriosDSM5({
    nome: regra.nome,
    criterios: config.perguntas.map((p) => ({ texto: p.texto, atende: doc[p.id] === "C" })),
    minimoDiagnostico: regra.minimo, minimoProvavel: regra.provavel,
    regra: "mínimo necessário: " + regra.minimo,
    confirmacoes: regra.confirmacoes,
    ajustes,
  });
  av.nomeCurto = regra.nome;
  const C = av.n;
  const parciais = config.perguntas.filter((p, i) => doc[p.id] === "B" && !av.itens[i].atende);
  const B = parciais.length;
  let cor, rotulo, resumo = av.obs;
  if (av.status === "diagnostico") {
    const grau = regra.graus.find(([min]) => C >= min)[1];
    cor = grau === "Grave" ? "#DC2626" : grau === "Moderado" ? "#D97706" : "#B45309";
    rotulo = av.labelStatus + " — grau " + grau + " (" + C + " de " + config.totalCriterios + ")";
    resumo = "Grau " + grau + ". " + av.obs;
  } else if (av.status === "provavel") {
    cor = "#D97706";
    rotulo = "Diagnóstico provável (" + C + " de " + config.totalCriterios + ")";
  } else {
    cor = "#16A34A";
    rotulo = av.labelStatus + " (" + C + " de " + config.totalCriterios + ")";
  }
  if (B > 0) resumo += " Critérios parciais (resposta B, não contados): " + parciais.map((p) => p.texto).join("; ") + ".";
  return { B, C, total: C, status: av.status, rotulo, cor, resumo, criterio: av };
}

const COR_LETRA_RASTREAMENTO = { A: "#16A34A", B: "#D97706", C: "#DC2626" };

// Visualizador de qualquer rastreamento já portado (Jogos, Dependência
// Química, e os próximos que forem sendo adicionados a
// RASTREAMENTOS_ADMIN) — mesmo componente serve todos, só muda a
// config e a coleção.
function AbaRastreamentoView({ usuario, paciente, tipo, aoVoltar }) {
  const config = { ...RASTREAMENTOS_ADMIN[tipo], tipo };
  const [docs, setDocs] = useState([]);
  const [ajustesPorDoc, setAjustesPorDoc] = useState({});
  const ajustesDe = (d) => ajustesPorDoc[d.id] || d.ajustesClinicos || {};
  async function ajustarDocLote(d, mapa) {
    const novo = { ...ajustesDe(d) };
    Object.keys(mapa).forEach((k) => { if (mapa[k] === null) delete novo[k]; else novo[k] = mapa[k]; });
    setAjustesPorDoc((m) => ({ ...m, [d.id]: novo }));
    try { await db.collection("clinica_rastreamento_" + tipo).doc(d.id).update({ ajustesClinicos: novo }); }
    catch (e) { alert("Não foi possível salvar sua resposta: " + e.message); }
  }
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
      const g = gravidadeRastreamento(doc, config, ajustesDe(doc));
      const respondente = doc.tipoRespondente === "paciente" ? "Próprio paciente" : (doc.nomeRespondente || "Familiar") + " (" + (doc.parentesco || "—") + ")";
      const linhasPerguntas = config.perguntas.map((p) =>
        `<tr><td>${p.id.replace("p", "")}</td><td>${p.texto}</td><td>${p.modulo}</td><td style="font-weight:700;color:${COR_LETRA_RASTREAMENTO[doc[p.id]] || "#6b7280"}">${doc[p.id] || "—"}</td></tr>`
      ).join("");
      const obsLinha = doc.obsFinais ? `<tr><td colspan="2"><strong>Observações</strong></td><td colspan="2">${doc.obsFinais}</td></tr>` : "";
      return `
        <h2>Respondente: ${respondente}</h2>
        <div class="gravidade">${g.rotulo}</div>
        <p style="font-size:12.5px;color:#374151;margin-bottom:8px">${g.resumo}</p>
        <p style="font-size:12px;color:#4b5563;margin-bottom:10px">Respostas C (critério presente): <strong>${g.C}</strong> &nbsp;|&nbsp; Respostas B (parcial/subclínico): <strong>${g.B}</strong></p>
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
            const g = gravidadeRastreamento(doc, config, ajustesDe(doc));
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
                    <div style={{ marginBottom: 12 }}><ListaCriteriosDSM5 criterios={[g.criterio]} aoAjustarLote={(mapa) => ajustarDocLote(doc, mapa)} /></div>
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

// Lista resumida (pra montar a tabela do laudo) das 20 perguntas do
// instrumento — mesmo texto do formulário público em
// psi/atividade/formulario-rastreamento.js. Perguntas p16-p20 são
// coletadas mas não entram na fórmula de pontuação, igual ao modelo.
const PERGUNTAS_BIPOLAR = [
  { id: "p1", bloco: "Energia e Aceleração", texto: "Fases de energia acima do normal / aceleração" },
  { id: "p2", bloco: "Energia e Aceleração", texto: "Padrão de sono e fala durante agitação" },
  { id: "p3", bloco: "Energia e Aceleração", texto: "Autoconfiança exagerada ou riscos incomuns" },
  { id: "p4", bloco: "Tristeza e Depressão", texto: "Tristeza profunda ou perda de interesse" },
  { id: "p5", bloco: "Tristeza e Depressão", texto: "Disposição física, sono e apetite nas fases de baixa" },
  { id: "p6", bloco: "Tristeza e Depressão", texto: "Desesperança, culpa excessiva ou ideação suicida" },
  { id: "p7", bloco: "Relacionamentos e Identidade", texto: "Reação ao abandono real ou imaginado" },
  { id: "p8", bloco: "Relacionamentos e Identidade", texto: "Relações intensas e instáveis" },
  { id: "p9", bloco: "Relacionamentos e Identidade", texto: "Instabilidade de identidade ou objetivos" },
  { id: "p10", bloco: "Impulsos, Humor e Emoções", texto: "Comportamentos impulsivos no dia a dia" },
  { id: "p11", bloco: "Impulsos, Humor e Emoções", texto: "Automutilação ou tentativas de autoextermínio" },
  { id: "p12", bloco: "Impulsos, Humor e Emoções", texto: "Oscilação rápida de humor" },
  { id: "p13", bloco: "Impulsos, Humor e Emoções", texto: "Vazio interior persistente ou tédio crônico" },
  { id: "p14", bloco: "Impulsos, Humor e Emoções", texto: "Manejo da raiva e da frustração" },
  { id: "p15", bloco: "Impulsos, Humor e Emoções", texto: "Dissociação ou paranoia sob estresse extremo" },
  { id: "p16", bloco: "Cognição e Humor Misto", texto: "Pensamentos acelerados / fuga de ideias" },
  { id: "p17", bloco: "Cognição e Humor Misto", texto: "Distrabilidade nos episódios de agitação" },
  { id: "p18", bloco: "Cognição e Humor Misto", texto: "Agitação psicomotora ou lentidão visível" },
  { id: "p19", bloco: "Cognição e Humor Misto", texto: "Dificuldade de concentração e memória" },
  { id: "p20", bloco: "Cognição e Humor Misto", texto: "Humor misto: tristeza e agitação simultâneas" },
];

const COR_LETRA_BIPOLAR = { A: "#16A34A", B: "#D97706", C: "#DC2626", D: "#7F1D1D" };

function pontuarLetraBipolar(letra) {
  return { A: 0, B: 1, C: 2, D: 3 }[letra] || 0;
}

// Resposta C ou D = critério clinicamente presente (o instrumento usa
// A=ausente, B=leve/inespecífico, C=presente, D=presente e grave,
// quando o instrumento tem 4 opções).
function criterioAtende(letra) {
  return letra === "C" || letra === "D";
}

// Helper compartilhado por todos os rastreamentos bespoke: conta
// quantos critérios de uma lista foram atendidos e compara contra o
// mínimo real de diagnóstico do DSM-5 (ou o mínimo possível com os
// itens que o instrumento tem, quando ele tem menos itens que o
// número oficial de sintomas do manual — isso fica explícito em
// `notaClinica`). Devolve texto pronto nomeando os critérios
// presentes, não só um rótulo genérico de "possível"/"moderado".
function avaliarCriteriosDSM5({ nome, codigo, criterios, minimoDiagnostico, minimoProvavel, notaClinica, statusFn, regra, confirmacoes = [], ajustes = {} }) {
  // Cada critério pode ser corrigido pela psicóloga na entrevista
  // ("sim"/"nao"), sobrepondo o que o questionário indicou.
  const itens = criterios.map((c, i) => {
    const chave = nome + "#" + i;
    const aj = ajustes[chave] || null;
    return { chave, texto: c.texto, atende: aj === "sim" ? true : aj === "nao" ? false : c.atende, automatico: c.atende, ajuste: aj };
  });
  const conf = confirmacoes.map((texto, j) => {
    const chave = nome + "#conf" + j;
    return { chave, texto, resposta: ajustes[chave] || null };
  });
  const refutadas = conf.filter((c) => c.resposta === "nao");
  const pendentes = conf.filter((c) => !c.resposta);

  const atendidos = itens.filter((c) => c.atende);
  const n = atendidos.length;
  const total = itens.length;
  let status;
  if (statusFn) status = statusFn(itens);
  else if (n >= minimoDiagnostico) status = "diagnostico";
  else if (n >= minimoProvavel) status = "provavel";
  else status = "abaixo";
  const contagemOk = status;
  if (refutadas.length > 0 && status !== "abaixo") status = "abaixo";
  const textoMinimo = (typeof regra === "function" ? regra(itens) : regra) || ("mínimo necessário: " + minimoDiagnostico);

  const atende = status === "diagnostico" ? true : status === "provavel" ? null : false;
  let labelStatus;
  if (refutadas.length > 0 && contagemOk !== "abaixo") labelStatus = "Não fecha diagnóstico";
  else if (status === "diagnostico") {
    if (conf.length === 0) labelStatus = "Diagnóstico";
    else if (pendentes.length === 0) labelStatus = "Diagnóstico confirmado";
    else if (pendentes.length === conf.length) labelStatus = "Diagnóstico (confirmar na entrevista)";
    else labelStatus = "Diagnóstico (confirmação parcial)";
  } else if (status === "provavel") labelStatus = "Diagnóstico provável";
  else labelStatus = "Não atende";

  const listaAtendidos = atendidos.map((c) => c.texto).join("; ");
  const faltando = itens.filter((c) => !c.atende).map((c) => c.texto).join("; ");

  let obs;
  if (status === "diagnostico") {
    obs = `Diagnóstico — atende a ${n} de ${total} critérios avaliados (${textoMinimo}). Critérios presentes: ${listaAtendidos}.`;
  } else if (status === "provavel") {
    obs = `Diagnóstico provável — atende a ${n} de ${total} critérios avaliados, próximo do mínimo (${textoMinimo}) mas ainda sem fechar o diagnóstico. Critérios presentes: ${listaAtendidos || "nenhum"}. Observar/investigar na entrevista: ${faltando}.`;
  } else if (refutadas.length > 0 && contagemOk !== "abaixo") {
    obs = `Não fecha diagnóstico — os critérios contados (${n} de ${total}) seriam suficientes, mas a entrevista descartou um requisito obrigatório: ${refutadas.map((c) => c.texto).join("; ")}.`;
  } else {
    obs = `Não atende — apenas ${n} de ${total} critérios avaliados presentes, abaixo do limiar clínico (${textoMinimo}).`;
  }
  if (status !== "abaixo" && conf.length > 0) {
    const sims = conf.filter((c) => c.resposta === "sim");
    if (sims.length > 0) obs += ` Confirmado na entrevista: ${sims.map((c) => c.texto).join("; ")}.`;
    if (pendentes.length > 0) obs += ` A confirmar na entrevista: ${pendentes.map((c) => c.texto).join("; ")}.`;
  }
  if (notaClinica) obs += " " + notaClinica;

  return { label: codigo ? `${nome} (${codigo})` : nome, nome, atende, status, labelStatus, obs, n, total, itens, conf };
}

// Guarda as respostas da psicóloga (Sim/Não) no próprio registro do
// questionário e recalcula o laudo a partir delas.
function useAjustesClinicos(colecao, doc) {
  const [ajustes, setAjustes] = useState({});
  const docId = doc?.id;
  useEffect(() => { setAjustes(doc?.ajustesClinicos || {}); }, [docId]);
  async function ajustarLote(mapa) {
    const novo = { ...ajustes };
    Object.keys(mapa).forEach((k) => { if (mapa[k] === null) delete novo[k]; else novo[k] = mapa[k]; });
    setAjustes(novo);
    if (docId) {
      try { await db.collection(colecao).doc(docId).update({ ajustesClinicos: novo }); }
      catch (e) { alert("Não foi possível salvar suas respostas: " + e.message); }
    }
  }
  return [ajustes, ajustarLote];
}

// Lista de diagnósticos com painel "Reavaliar com a entrevista": a
// psicóloga responde Sim/Não e o resultado é recalculado na hora.
function BotaoTri({ ativo, rotulo, cor, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ padding: "3px 10px", borderRadius: 14, border: "1.5px solid " + (ativo ? cor : "#E5E7EB"), background: ativo ? cor : "white", color: ativo ? "white" : "#6B7280", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
    >
      {rotulo}
    </button>
  );
}

function ListaCriteriosDSM5({ criterios, aoAjustarLote }) {
  // As respostas ficam "pendentes" até a psicóloga clicar em
  // Recalcular — só então o diagnóstico muda e tudo é salvo.
  const [pendente, setPendente] = useState({});
  const [aviso, setAviso] = useState("");
  const [gravando, setGravando] = useState(false);
  const atualDe = (chave, salvo) => (chave in pendente ? pendente[chave] : salvo);
  function marcar(chave, salvo, valor) {
    setAviso("");
    setPendente((p) => ({ ...p, [chave]: atualDe(chave, salvo) === valor ? null : valor }));
  }
  const qtdPendente = Object.keys(pendente).length;
  async function recalcular() {
    setGravando(true);
    await aoAjustarLote(pendente);
    setPendente({});
    setGravando(false);
    setAviso("Diagnóstico recalculado com base nas suas respostas.");
  }
  const total = criterios.reduce((s, c) => s + (c.conf ? c.conf.length : 0) + (c.itens ? c.itens.length : 0), 0);
  return (
    <div>
      {criterios.map((c, i) => (
        <div key={i} style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{c.label}</span>
            <CorBadgeCriterio atende={c.atende} rotulo={c.labelStatus} />
          </div>
          <div style={{ fontSize: 12, color: "#4B5563" }}>{c.obs}</div>

          {c.conf && c.conf.length > 0 && (
            <div style={{ marginTop: 10, background: "#FFF7ED", borderLeft: "3px solid #F97316", borderRadius: "0 8px 8px 0", padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9A3412", marginBottom: 6 }}>Perguntas para a entrevista</div>
              {c.conf.map((q) => {
                const v = atualDe(q.chave, q.resposta);
                return (
                  <div key={q.chave} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200, fontSize: 12.5, color: "#374151" }}>{q.texto}</div>
                    <BotaoTri ativo={v === "sim"} rotulo="Sim" cor="#16A34A" onClick={() => marcar(q.chave, q.resposta, "sim")} />
                    <BotaoTri ativo={v === "nao"} rotulo="Não" cor="#DC2626" onClick={() => marcar(q.chave, q.resposta, "nao")} />
                  </div>
                );
              })}
            </div>
          )}

          {c.itens && c.itens.length > 0 && (
            <div style={{ marginTop: 10, background: "#F9FAFB", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4B5563", marginBottom: 6 }}>Critérios — confirme ou corrija após a entrevista</div>
              {c.itens.map((it) => {
                const v = atualDe(it.chave, it.ajuste);
                const presente = v === "sim" ? true : v === "nao" ? false : it.automatico;
                return (
                  <div key={it.chave} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #F3F4F6", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200, fontSize: 12, color: "#374151" }}>
                      {it.texto}
                      <span style={{ fontSize: 10, color: presente ? "#DC2626" : "#16A34A", marginLeft: 6, fontWeight: 600 }}>
                        {v ? (presente ? "presente (definido por você)" : "ausente (definido por você)") : presente ? "presente no questionário" : "não indicado no questionário"}
                      </span>
                    </div>
                    <BotaoTri ativo={v === "sim"} rotulo="Presente" cor="#DC2626" onClick={() => marcar(it.chave, it.ajuste, "sim")} />
                    <BotaoTri ativo={v === "nao"} rotulo="Ausente" cor="#16A34A" onClick={() => marcar(it.chave, it.ajuste, "nao")} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {total > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          <button type="button" className="botao-primario" onClick={recalcular} disabled={gravando || qtdPendente === 0}>
            <Icone nome="refresh-cw" tamanho={14} /> {gravando ? "Recalculando..." : "Recalcular diagnóstico"}
          </button>
          {qtdPendente > 0 && (
            <>
              <span style={{ fontSize: 12, color: "#9A3412" }}>{qtdPendente} resposta(s) ainda não aplicada(s)</span>
              <button type="button" className="botao-secundario" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setPendente({})}>Descartar</button>
            </>
          )}
          {aviso && qtdPendente === 0 && <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>{aviso}</span>}
        </div>
      )}
    </div>
  );
}

function PontosAtencaoRespondiveis({ atencao, ajustes, aoAjustarLote }) {
  const [pendente, setPendente] = useState({});
  const [gravando, setGravando] = useState(false);
  const [aviso, setAviso] = useState("");
  if (!atencao || atencao.length === 0) return null;
  function ch(i) { return "atencao_" + i; }
  function atualDe(i) { const k = ch(i); return k in pendente ? pendente[k] : (ajustes[k] || null); }
  function marcar(i, valor) {
    setAviso("");
    const k = ch(i);
    setPendente((p) => ({ ...p, [k]: atualDe(i) === valor ? null : valor }));
  }
  const qtdPendente = Object.keys(pendente).length;
  async function registrar() {
    setGravando(true);
    await aoAjustarLote(pendente);
    setPendente({});
    setGravando(false);
    setAviso("Respostas da entrevista registradas.");
  }
  const confirmados = atencao.filter((_, i) => atualDe(i) === "sim").length;
  const naoConf = atencao.filter((_, i) => atualDe(i) === "nao").length;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>Pontos de atenção para a entrevista clínica</div>
        {(confirmados > 0 || naoConf > 0) && (
          <div style={{ fontSize: 11 }}>
            {confirmados > 0 && <span style={{ color: "#16A34A", fontWeight: 600, marginRight: 8 }}>{confirmados} confirmado(s)</span>}
            {naoConf > 0 && <span style={{ color: "#DC2626", fontWeight: 600 }}>{naoConf} não confirmado(s)</span>}
          </div>
        )}
      </div>
      {atencao.map((texto, i) => {
        const v = atualDe(i);
        const bg = v === "sim" ? "#F0FDF4" : v === "nao" ? "#FEF2F2" : "#FFF7ED";
        const borda = v === "sim" ? "#16A34A" : v === "nao" ? "#DC2626" : "#F97316";
        return (
          <div key={i} style={{ background: bg, borderLeft: "3px solid " + borda, padding: "10px 12px", marginBottom: 6, borderRadius: "0 6px 6px 0" }}>
            <div style={{ fontSize: 12, color: "#374151", marginBottom: 8 }}>{texto}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <BotaoTri ativo={v === "sim"} rotulo="Confirmado" cor="#16A34A" onClick={() => marcar(i, "sim")} />
              <BotaoTri ativo={v === "nao"} rotulo="Não confirmado" cor="#DC2626" onClick={() => marcar(i, "nao")} />
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
        <button type="button" className="botao-primario" onClick={registrar} disabled={gravando || qtdPendente === 0}>
          <Icone nome="check-circle" tamanho={14} /> {gravando ? "Salvando..." : "Registrar respostas da entrevista"}
        </button>
        {qtdPendente > 0 && (
          <>
            <span style={{ fontSize: 12, color: "#9A3412" }}>{qtdPendente} resposta(s) ainda não salva(s)</span>
            <button type="button" className="botao-secundario" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setPendente({})}>Descartar</button>
          </>
        )}
        {aviso && qtdPendente === 0 && <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>{aviso}</span>}
      </div>
    </div>
  );
}

// Diagnóstico diferencial a partir do respondente mais recente
// (docs[0]) — critérios contados um a um e nomeados, não mais por
// percentual. O eixo Borderline usa as 9 perguntas p7-p15 na MESMA
// ordem dos 9 critérios oficiais do DSM-5 (301.83), então o limiar
// de 5 de 9 é literal. Mania e Depressão têm só 3 perguntas cada
// (proxy dos sintomas nucleares — o instrumento não tem itens
// suficientes pra replicar os "3 de 7"/"5 de 9" oficiais do manual),
// então usam limiar "3 de 3", com a ressalva registrada no texto.
function laudoDiferencialBipolar(doc, ajustes = {}) {
  const c = (id) => criterioAtende(doc[id]);

  const mania = avaliarCriteriosDSM5({
    nome: "Episódio Maníaco/Hipomaníaco", codigo: "DSM-5 296.4x/296.8x",
    criterios: [
      { texto: "Energia/aceleração muito acima do normal", atende: c("p1") },
      { texto: "Alteração marcante de sono e fala durante a agitação", atende: c("p2") },
      { texto: "Autoconfiança exagerada ou comportamento de risco incomum", atende: c("p3") },
    ],
    minimoDiagnostico: 3, minimoProvavel: 2,
    notaClinica: "Instrumento tem só 3 itens de mania (proxy) — o DSM-5 pede 3 de 7 sintomas + duração ≥7 dias (mania) ou 4-6 dias (hipomania). Use a reavaliação para completar os sintomas que o questionário não cobre.",
    confirmacoes: [
      "Humor elevado/irritável e aumento de energia por pelo menos 4 dias (hipomania) ou 7 dias (mania)?",
      "Os sintomas não são atribuíveis a substância, medicação ou condição médica?",
    ],
    ajustes,
  });

  const depressao = avaliarCriteriosDSM5({
    nome: "Episódio Depressivo Maior", codigo: "DSM-5 296.2x/296.3x",
    criterios: [
      { texto: "Tristeza profunda ou perda de interesse/prazer", atende: c("p4") },
      { texto: "Alteração de sono, apetite ou disposição física", atende: c("p5") },
      { texto: "Desesperança, culpa excessiva ou ideação suicida", atende: c("p6") },
    ],
    minimoDiagnostico: 3, minimoProvavel: 2,
    notaClinica: "Instrumento tem só 3 itens (proxy) — o DSM-5 pede 5 de 9 sintomas por ≥2 semanas. Se o critério de ideação suicida estiver presente, acionar protocolo de segurança imediatamente.",
    confirmacoes: [
      "Sintomas presentes na maior parte do dia, quase todos os dias, por pelo menos 2 semanas?",
      "Sofrimento clinicamente significativo ou prejuízo social/profissional?",
      "Os sintomas não são atribuíveis a substância, medicação ou condição médica?",
    ],
    ajustes,
  });

  const borderline = avaliarCriteriosDSM5({
    nome: "Transtorno da Personalidade Borderline", codigo: "DSM-5 301.83",
    criterios: [
      { texto: "Esforços para evitar abandono real ou imaginado", atende: c("p7") },
      { texto: "Relações interpessoais intensas e instáveis", atende: c("p8") },
      { texto: "Perturbação de identidade / instabilidade de autoimagem", atende: c("p9") },
      { texto: "Impulsividade em pelo menos duas áreas potencialmente danosas", atende: c("p10") },
      { texto: "Comportamento, gestos ou ameaças suicidas recorrentes, ou automutilação", atende: c("p11") },
      { texto: "Instabilidade afetiva por reatividade acentuada do humor", atende: c("p12") },
      { texto: "Sentimentos crônicos de vazio", atende: c("p13") },
      { texto: "Raiva intensa e inadequada ou dificuldade de controlá-la", atende: c("p14") },
      { texto: "Ideação paranoide transitória ou sintomas dissociativos graves sob estresse", atende: c("p15") },
    ],
    minimoDiagnostico: 5, minimoProvavel: 4,
    notaClinica: "Estas 9 perguntas seguem a ordem dos 9 critérios oficiais do DSM-5 — o mínimo de 5 é o critério real do manual, não uma estimativa.",
    confirmacoes: [
      "Padrão pervasivo e persistente, com início até a adolescência/início da vida adulta e presente em vários contextos?",
      "As oscilações de humor são reativas a estressores interpessoais (e não episódios autônomos de dias/semanas)?",
    ],
    ajustes,
  });

  const partes = [];
  if (mania.status === "diagnostico") partes.push("Transtorno Bipolar (episódio maníaco/hipomaníaco confirmado pelos critérios avaliados)");
  else if (mania.status === "provavel") partes.push("Transtorno Bipolar — hipótese provável (investigar hipomania)");
  if (depressao.status === "diagnostico") partes.push("Episódio Depressivo Maior");
  else if (depressao.status === "provavel" && partes.length === 0) partes.push("Episódio Depressivo — hipótese provável");
  if (borderline.status === "diagnostico") partes.push("Transtorno da Personalidade Borderline");
  else if (borderline.status === "provavel") partes.push("Traços Borderline — hipótese provável");

  const hipotese = partes.length > 0
    ? partes.join(" + ")
    : "Nenhum diagnóstico DSM-5 atingido pelos critérios avaliados neste instrumento — quadro abaixo do limiar clínico em todos os eixos.";

  const atencao = [mania.obs, depressao.obs, borderline.obs];
  if (mania.status !== "abaixo" && borderline.status !== "abaixo") {
    atencao.push("Comorbidade Bipolar + Borderline é frequente (até ~20% dos casos) — priorizar avaliação longitudinal para diferenciar humor reativo a eventos (padrão Borderline) de episódios autônomos (padrão Bipolar).");
  }

  return { hipotese, criterios: [mania, depressao, borderline], atencao };
}

function CorBadgeCriterio({ atende, rotulo }) {
  if (atende === true) return <span style={{ background: "#FEF2F2", color: "#DC2626", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{rotulo || "Diagnóstico"}</span>;
  if (atende === false) return <span style={{ background: "#F0FDF4", color: "#16A34A", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{rotulo || "Não atende"}</span>;
  return <span style={{ background: "#FFFBEB", color: "#D97706", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{rotulo || "Diagnóstico provável"}</span>;
}

function BarraEscoreBipolar({ label, valor, max, cor }) {
  const pct = Math.min(100, Math.round((valor / max) * 100));
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: "#374151" }}>{label}</span>
        <span style={{ color: cor, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ background: "#F3F4F6", borderRadius: 20, height: 8, overflow: "hidden" }}>
        <div style={{ width: pct + "%", background: cor, height: "100%", borderRadius: 20, transition: "width .5s" }} />
      </div>
    </div>
  );
}

// Visualizador do Rastreamento Bipolar/Borderline — não usa o motor
// genérico dos outros (AbaRastreamentoView) porque a pontuação é
// diferente: 3 eixos ponderados com hipótese diagnóstica diferencial,
// em vez de uma contagem simples de B+C.
function AbaRastreamentoBipolarView({ usuario, paciente, aoVoltar }) {
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [ajustes, ajustar] = useAjustesClinicos("clinica_rastreamento_bipolar", docs[0]);

  useEffect(() => {
    db.collection("clinica_rastreamento_bipolar")
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
  }, [usuario.psiId, paciente.id]);

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
        tipo: "bipolar",
        titulo: "Rastreamento Bipolar / Borderline",
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
      `Olá!\n\n` +
      `Preparei um questionário clínico para você preencher sobre *${primeiroNome}*: *Rastreamento Bipolar / Borderline*.\n\n` +
      `Leva de 8 a 12 minutos — é só abrir o link abaixo e responder com calma:\n\n` +
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

  async function gerarLaudo() {
    if (docs.length === 0) return;
    const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
    const cfg = cfgDoc.exists ? cfgDoc.data() : {};
    const nomeClinica = cfg.nome || "PsiCoWorking";
    const pacNome = paciente.nome || "Paciente";
    const dataDoc = new Date().toLocaleDateString("pt-BR");

    const doc = docs[0];
    const laudo = laudoDiferencialBipolar(doc, ajustes);
    const [mania, depressao, borderline] = laudo.criterios;

    const criteriosHtml = laudo.criterios.map((c) => `
      <div class="criterio">
        <div class="nome">${c.label} &nbsp; <span class="${c.atende === true ? "badge-sim" : c.atende === false ? "badge-nao" : "badge-inv"}">${c.labelStatus}</span></div>
        <div style="font-size:12px;color:#4b5563;margin-top:4px">${c.obs}</div>
      </div>`).join("");

    const atencaoHtml = laudo.atencao.length === 0
      ? "<p style='color:#6b7280;font-size:12px'>Nenhum ponto de atenção crítico identificado pelos escores.</p>"
      : laudo.atencao.map((a) => `<div class="atencao-item">${a}</div>`).join("");

    const respostasHtml = docs.map((d) => `
      <h3>${d.tipoRespondente === "paciente" ? "Próprio paciente" : (d.nomeRespondente || "Familiar") + " (" + (d.parentesco || "—") + ")"}</h3>
      <table class="resp-table">
        <thead><tr><th>#</th><th>Pergunta</th><th>Bloco</th><th>Resp.</th></tr></thead>
        <tbody>
          ${PERGUNTAS_BIPOLAR.map((p) => `<tr><td>${p.id.replace("p", "")}</td><td>${p.texto}</td><td>${p.bloco}</td><td><span class="letra" style="color:${COR_LETRA_BIPOLAR[d[p.id]] || "#6b7280"}">${d[p.id] || "—"}</span></td></tr>`).join("")}
          ${d.obsFinais ? `<tr><td colspan="2"><strong>Observações livres</strong></td><td colspan="2">${d.obsFinais}</td></tr>` : ""}
        </tbody>
      </table>`).join("");

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Laudo Rastreamento Bipolar/Borderline — ${pacNome}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#1f2937;padding:32px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6}
h1{font-size:20px;color:#3d006a;margin-bottom:4px}
h2{font-size:14px;color:#7B00C4;margin:20px 0 8px;border-bottom:1px solid #ede9fe;padding-bottom:4px}
h3{font-size:12.5px;color:#374151;margin:12px 0 6px}
.header{border-bottom:2px solid #7B00C4;padding-bottom:16px;margin-bottom:20px}
.sub{font-size:12px;color:#6b7280;margin-top:2px}
.barra-wrap{margin-bottom:10px}
.barra-bg{background:#f3f4f6;border-radius:20px;height:10px;overflow:hidden;margin-top:3px}
.hipotese{background:#f5f3ff;border:1px solid #c4b5fd;border-radius:10px;padding:14px 18px;margin:12px 0}
.hipotese .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7B00C4;margin-bottom:4px}
.hipotese .valor{font-size:15px;font-weight:700;color:#3d006a}
.criterio{border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:8px}
.criterio .nome{font-weight:700;font-size:13px;margin-bottom:4px}
.badge-sim{background:#fef2f2;color:#dc2626;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-nao{background:#f0fdf4;color:#16a34a;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-inv{background:#fffbeb;color:#d97706;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.atencao-item{background:#fff7ed;border-left:3px solid #f97316;padding:8px 12px;margin-bottom:6px;border-radius:0 6px 6px 0;font-size:12px}
.resp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
.resp-table th{background:#f5f3ff;padding:6px 10px;text-align:left;font-size:10.5px;color:#7B00C4;border:1px solid #ede9fe}
.resp-table td{padding:6px 10px;border:1px solid #e5e7eb;vertical-align:top}
.resp-table tr:nth-child(even) td{background:#fafafa}
.letra{font-weight:700;font-size:13px}
.rodape{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
@media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px">Imprimir / Salvar PDF</button>
</div>
<div class="header">
  <h1>Laudo Analítico de Rastreamento Clínico</h1>
  <div class="sub">Paciente: <strong>${pacNome}</strong> · Data: ${dataDoc} · ${nomeClinica}</div>
  <div class="sub">Respondentes: ${docs.length} (${docs.map((d) => (d.tipoRespondente === "paciente" ? "próprio paciente" : d.parentesco || "familiar")).join(", ")}) · Diagnóstico baseado no respondente mais recente${docs.length > 1 ? " — comparar com os demais na seção IV" : ""}</div>
</div>
<h2>I. Critérios Atendidos por Eixo</h2>
<div class="barra-wrap">
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>Eixo Bipolar — Mania/Hipomania</strong></span><span style="color:#dc2626;font-weight:700">${mania.n} de ${mania.total}</span></div>
  <div class="barra-bg"><div style="width:${Math.round((mania.n / mania.total) * 100)}%;background:#dc2626;height:100%;border-radius:20px"></div></div>
</div>
<div class="barra-wrap">
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>Eixo Bipolar — Depressão</strong></span><span style="color:#7c3aed;font-weight:700">${depressao.n} de ${depressao.total}</span></div>
  <div class="barra-bg"><div style="width:${Math.round((depressao.n / depressao.total) * 100)}%;background:#7c3aed;height:100%;border-radius:20px"></div></div>
</div>
<div class="barra-wrap">
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>Eixo Borderline (TPB)</strong></span><span style="color:#2563eb;font-weight:700">${borderline.n} de ${borderline.total}</span></div>
  <div class="barra-bg"><div style="width:${Math.round((borderline.n / borderline.total) * 100)}%;background:#2563eb;height:100%;border-radius:20px"></div></div>
</div>
<h2>II. Hipótese Diagnóstica</h2>
<div class="hipotese">
  <div class="label">Hipótese principal</div>
  <div class="valor">${laudo.hipotese}</div>
</div>
<h3>Análise por Critério DSM-5</h3>
${criteriosHtml}
<h2>III. Pontos de Atenção para a Entrevista Clínica</h2>
${atencaoHtml}
<h2>IV. Respostas por Respondente</h2>
${respostasHtml}
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

      <h3 style={{ marginBottom: 2 }}>Rastreamento Bipolar / Borderline</h3>
      <p className="subtitulo-pagina" style={{ marginBottom: 20 }}>Avaliação diferencial DSM-5 (20 critérios) · Instrumento aplicado ao paciente e/ou familiares</p>

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

      {!carregando && docs.length > 0 && (() => {
        const doc = docs[0];
        const laudo = laudoDiferencialBipolar(doc, ajustes);
        const [mania, depressao, borderline] = laudo.criterios;
        return (
          <div>
            <div style={{ background: "#F5F3FF", border: "1px solid #C4B5FD", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--cor-marca)", marginBottom: 4 }}>Hipótese diagnóstica</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#3D006A", lineHeight: 1.4 }}>{laudo.hipotese}</div>
              {docs.length > 1 && <div style={{ fontSize: 11, color: "#6B7280", marginTop: 8 }}>Baseado no respondente mais recente — compare com os demais registros abaixo.</div>}
            </div>

            <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Critérios atendidos por eixo</div>
              <BarraEscoreBipolar label={`Eixo Bipolar · Mania/Hipomania (${mania.n} de ${mania.total})`} valor={mania.n} max={mania.total} cor="#DC2626" />
              <BarraEscoreBipolar label={`Eixo Bipolar · Depressão (${depressao.n} de ${depressao.total})`} valor={depressao.n} max={depressao.total} cor="#7C3AED" />
              <BarraEscoreBipolar label={`Eixo Borderline · TPB (${borderline.n} de ${borderline.total})`} valor={borderline.n} max={borderline.total} cor="#2563EB" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Análise DSM-5</div>
              <ListaCriteriosDSM5 criterios={laudo.criterios} aoAjustarLote={ajustar} />
            </div>

            <PontosAtencaoRespondiveis atencao={laudo.atencao} ajustes={ajustes} aoAjustarLote={ajustar} />

            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Respostas por respondente</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {docs.map((doc) => (
                <div key={doc.id} style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                    {doc.tipoRespondente === "paciente" ? "Próprio paciente" : (doc.nomeRespondente || "Familiar") + " · " + (doc.parentesco || "")}
                  </div>
                  {PERGUNTAS_BIPOLAR.map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
                      <div style={{
                        width: 24, height: 24, minWidth: 24, borderRadius: "50%",
                        background: doc[p.id] ? COR_LETRA_BIPOLAR[doc[p.id]] + "22" : "#F3F4F6",
                        border: "2px solid " + (doc[p.id] ? COR_LETRA_BIPOLAR[doc[p.id]] : "#E5E7EB"),
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                        color: doc[p.id] ? COR_LETRA_BIPOLAR[doc[p.id]] : "#9CA3AF",
                      }}>
                        {doc[p.id] || "—"}
                      </div>
                      <div style={{ fontSize: 12, color: "#374151", flex: 1 }}>{p.texto}</div>
                      <div style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap" }}>{p.bloco}</div>
                    </div>
                  ))}
                  {doc.obsFinais && (
                    <div style={{ marginTop: 12, background: "#F9FAFB", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#4B5563" }}>
                      <strong>Observações:</strong> {doc.obsFinais}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Rastreamento de Hábitos Alimentares — bespoke (3 eixos: Anorexia,
// Bulimia/TCA, TCA puro), igual ao modelo (admin/questionarios.js).
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS_ALIMENTAR = [
  { id: "p1", eixo: "Anorexia", texto: "Restrição persistente / peso abaixo do esperado" },
  { id: "p2", eixo: "Anorexia", texto: "Medo intenso de engordar" },
  { id: "p3", eixo: "Anorexia", texto: "Distorção da imagem corporal" },
  { id: "p4", eixo: "Anorexia", texto: "Padrão de controle de peso (últimos 3 meses)" },
  { id: "p5", eixo: "Bulimia/TCA", texto: "Episódios de ingestão muito acima do normal" },
  { id: "p6", eixo: "Bulimia/TCA", texto: "Perda de controle durante os episódios" },
  { id: "p7", eixo: "Bulimia/TCA", texto: "Frequência dos episódios" },
  { id: "p8", eixo: "Bulimia/TCA", texto: "Uso de métodos compensatórios após ingestão excessiva" },
  { id: "p9", eixo: "TCA Puro", texto: "Padrão de ingestão rápida, secreta ou exagerada" },
  { id: "p10", eixo: "TCA Puro", texto: "Culpa intensa sem comportamentos compensatórios" },
  { id: "p11", eixo: "ARFID", texto: "Restrição por aversão sensorial / medo de engasgar" },
  { id: "p12", eixo: "ARFID", texto: "Impacto clínico da restrição (peso, nutrição, vida social)" },
];

const COR_LETRA_TRIAGEM = { A: "#16A34A", B: "#D97706", C: "#DC2626" };

function pontuarLetraTriagem(letra) {
  return { A: 0, B: 1, C: 2 }[letra] || 0;
}

// Monta a hipótese textual a partir de uma lista de avaliações:
// diagnósticos fechados primeiro, depois os prováveis.
const CORES_EIXOS = ["#DC2626", "#7C3AED", "#2563EB", "#D97706", "#0D9488"];

function barrasDeCriterios(criterios) {
  return criterios.map((c, i) => ({
    label: c.nomeCurto || c.label,
    pct: Math.round((c.n / c.total) * 100),
    texto: c.n + " de " + c.total + " critérios",
    cor: CORES_EIXOS[i % CORES_EIXOS.length],
  }));
}

function montarHipoteseCriterios(avaliacoes, textoNenhum) {
  const fechados = avaliacoes.filter((a) => a.status === "diagnostico").map((a) => a.nomeCurto);
  const provaveis = avaliacoes.filter((a) => a.status === "provavel").map((a) => a.nomeCurto + " (provável)");
  const todos = [...fechados, ...provaveis];
  return todos.length > 0 ? todos.join(" + ") : textoNenhum;
}

// Critérios contados um a um contra o DSM-5. Anorexia: os 3 critérios
// oficiais (p1-p3, subtipo em p4). Bulimia: compulsão com perda de
// controle + frequência + compensação. TCA: 5 requisitos, incluindo
// ausência de compensação. ARFID: p11-p12 sem preocupação com peso.
function laudoAlimentar(doc, ajustes) {
  const c = (id) => doc[id] === "C";
  const comp = c("p8");
  const compulsao = c("p5") && c("p6");

  const anorexia = avaliarCriteriosDSM5({
    nome: "Anorexia Nervosa", codigo: "DSM-5 F50.0",
    criterios: [
      { texto: "Restrição persistente da ingestão com peso abaixo do esperado", atende: c("p1") },
      { texto: "Medo intenso de ganhar peso", atende: c("p2") },
      { texto: "Distorção da imagem corporal / autoestima atrelada ao peso", atende: c("p3") },
    ],
    minimoDiagnostico: 3, minimoProvavel: 2,
    notaClinica: "Subtipo: " + (c("p4") ? "Compulsão/Purgativo." : "Restritivo."),
    confirmacoes: ["Peso significativamente baixo para idade, sexo e estatura (IMC ou histórico de perda de peso confirmado)?"],
    ajustes,
  });
  anorexia.nomeCurto = "Anorexia Nervosa";

  const bulimia = avaliarCriteriosDSM5({
    nome: "Bulimia Nervosa", codigo: "DSM-5 F50.2",
    criterios: [
      { texto: "Episódios recorrentes de compulsão com perda de controle", atende: compulsao },
      { texto: "Compulsão ao menos 1x por semana nos últimos 3 meses", atende: c("p7") },
      { texto: "Comportamentos compensatórios inadequados (vômito, laxantes, jejum, exercício excessivo)", atende: comp },
    ],
    minimoDiagnostico: 3, minimoProvavel: 2,
    confirmacoes: [
      "Autoavaliação indevidamente influenciada pela forma e pelo peso corporal?",
      "Os episódios não ocorrem exclusivamente durante episódios de anorexia nervosa?",
    ],
    ajustes,
  });
  bulimia.nomeCurto = "Bulimia Nervosa";

  const tca = avaliarCriteriosDSM5({
    nome: "Transtorno de Compulsão Alimentar", codigo: "DSM-5 F50.8",
    criterios: [
      { texto: "Episódios recorrentes de compulsão com perda de controle", atende: compulsao },
      { texto: "Frequência de ao menos 1x por semana por 3 meses", atende: c("p7") },
      { texto: "Padrão de ingestão rápida, escondida ou sem fome", atende: c("p9") },
      { texto: "Culpa, vergonha ou sofrimento intenso após os episódios", atende: c("p10") },
      { texto: "Ausência de comportamentos compensatórios regulares", atende: !comp },
    ],
    minimoDiagnostico: 5, minimoProvavel: 4,
    confirmacoes: ["Sofrimento acentuado em relação à compulsão alimentar?"],
    ajustes,
  });
  tca.nomeCurto = "Transtorno de Compulsão Alimentar";

  const arfid = avaliarCriteriosDSM5({
    nome: "ARFID — Transtorno Alimentar Restritivo/Evitativo", codigo: "DSM-5 F50.82",
    criterios: [
      { texto: "Restrição por aversão sensorial ou medo de engasgar/vomitar", atende: c("p11") },
      { texto: "Impacto clínico (peso, nutrição ou vida social)", atende: c("p12") },
      { texto: "Sem medo de engordar nem distorção da imagem corporal", atende: !c("p2") && !c("p3") },
    ],
    minimoDiagnostico: 3, minimoProvavel: 2,
    confirmacoes: ["A restrição não é explicada por falta de alimento ou prática cultural, nem por outro transtorno mental/condição médica?"],
    ajustes,
  });
  arfid.nomeCurto = "ARFID";

  const avaliacoes = [anorexia, bulimia, tca, arfid];
  const hipotese = montarHipoteseCriterios(avaliacoes, "Nenhum transtorno alimentar atinge o mínimo de critérios DSM-5 avaliados neste instrumento.");

  const atencao = [];
  if (anorexia.status !== "abaixo") {
    atencao.push("Avaliar IMC atual e velocidade de perda de peso — risco clínico de desnutrição grave.");
    atencao.push("Solicitar exames laboratoriais: eletrólitos, hemograma, ECG e densidade óssea.");
  }
  if (bulimia.status !== "abaixo" || (anorexia.status !== "abaixo" && c("p4"))) {
    atencao.push("Investigar desequilíbrio eletrolítico (hipocalemia), erosão dentária, sinal de Russell e lesões esofágicas.");
  }
  if (tca.status !== "abaixo") {
    atencao.push("Avaliar sobrepeso/obesidade e impacto metabólico; rastrear depressão e ansiedade associadas.");
  }
  if (arfid.status !== "abaixo") {
    atencao.push("Investigar seletividade sensorial, medo de engasgo e possível associação com TEA; avaliar deficiências nutricionais.");
  }

  return { hipotese, criterios: avaliacoes, atencao };
}

function gerarHtmlLaudoTriagem({ titulo, pacNome, nomeClinica, data, docs, perguntas, barras, hipotese, criterios, atencao, respostasHtmlExtra }) {
  const criteriosHtml = criterios.map((c) => `
    <div class="criterio">
      <div class="nome">${c.label} &nbsp; <span class="${c.atende === true ? "badge-sim" : c.atende === false ? "badge-nao" : "badge-inv"}">${c.labelStatus}</span></div>
      <div style="font-size:12px;color:#4b5563;margin-top:4px">${c.obs}</div>
    </div>`).join("");
  const atencaoHtml = atencao.length === 0
    ? "<p style='color:#6b7280;font-size:12px'>Nenhum ponto de atenção crítico identificado pelos escores.</p>"
    : atencao.map((a) => `<div class="atencao-item">${a}</div>`).join("");
  const barrasHtml = barras.map((b) => `
    <div class="barra-wrap">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>${b.label}</strong></span><span style="color:${b.cor};font-weight:700">${b.texto || b.pct + "%"}</span></div>
      <div class="barra-bg"><div style="width:${b.pct}%;background:${b.cor};height:100%;border-radius:20px"></div></div>
    </div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>${titulo} — ${pacNome}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#1f2937;padding:32px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6}
h1{font-size:20px;color:#3d006a;margin-bottom:4px}
h2{font-size:14px;color:#7B00C4;margin:20px 0 8px;border-bottom:1px solid #ede9fe;padding-bottom:4px}
h3{font-size:12.5px;color:#374151;margin:12px 0 6px}
.header{border-bottom:2px solid #7B00C4;padding-bottom:16px;margin-bottom:20px}
.sub{font-size:12px;color:#6b7280;margin-top:2px}
.barra-wrap{margin-bottom:10px}
.barra-bg{background:#f3f4f6;border-radius:20px;height:10px;overflow:hidden;margin-top:3px}
.hipotese{background:#f5f3ff;border:1px solid #c4b5fd;border-radius:10px;padding:14px 18px;margin:12px 0}
.hipotese .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7B00C4;margin-bottom:4px}
.hipotese .valor{font-size:15px;font-weight:700;color:#3d006a}
.criterio{border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:8px}
.criterio .nome{font-weight:700;font-size:13px;margin-bottom:4px}
.badge-sim{background:#fef2f2;color:#dc2626;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-nao{background:#f0fdf4;color:#16a34a;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-inv{background:#fffbeb;color:#d97706;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.atencao-item{background:#fff7ed;border-left:3px solid #f97316;padding:8px 12px;margin-bottom:6px;border-radius:0 6px 6px 0;font-size:12px}
.resp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
.resp-table th{background:#f5f3ff;padding:6px 10px;text-align:left;font-size:10.5px;color:#7B00C4;border:1px solid #ede9fe}
.resp-table td{padding:6px 10px;border:1px solid #e5e7eb;vertical-align:top}
.resp-table tr:nth-child(even) td{background:#fafafa}
.letra{font-weight:700;font-size:13px}
.rodape{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
@media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px">Imprimir / Salvar PDF</button>
</div>
<div class="header">
  <h1>${titulo}</h1>
  <div class="sub">Paciente: <strong>${pacNome}</strong> · Data: ${data} · ${nomeClinica}</div>
  <div class="sub">Respondentes: ${docs.length} (${docs.map((d) => (d.tipoRespondente === "paciente" ? "próprio paciente" : d.parentesco || "familiar")).join(", ")})</div>
</div>
<h2>I. Escores por Eixo</h2>
${barrasHtml}
<h2>II. Hipótese Diagnóstica Provável</h2>
<div class="hipotese">
  <div class="label">Hipótese principal</div>
  <div class="valor">${hipotese}</div>
</div>
<h3>Análise por Critério DSM-5</h3>
${criteriosHtml}
<h2>III. Pontos de Atenção para a Entrevista Clínica</h2>
${atencaoHtml}
<h2>IV. Respostas por Respondente</h2>
${respostasHtmlExtra}
<div class="rodape">Documento gerado em ${data} · Uso exclusivo para fins clínicos · Confidencial · LGPD</div>
</body></html>`;
}

function AbaRastreamentoAlimentarView({ usuario, paciente, aoVoltar }) {
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [ajustes, ajustar] = useAjustesClinicos("clinica_rastreamento_alimentar", docs[0]);

  useEffect(() => {
    db.collection("clinica_rastreamento_alimentar")
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
  }, [usuario.psiId, paciente.id]);

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
        tipo: "alimentar",
        titulo: "Rastreamento de Hábitos Alimentares",
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
      `Olá!\n\n` +
      `Preparei um questionário clínico para você preencher sobre *${primeiroNome}*: *Rastreamento de Hábitos Alimentares*.\n\n` +
      `Leva de 6 a 10 minutos — é só abrir o link abaixo e responder com calma:\n\n` +
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

  async function gerarLaudo() {
    if (docs.length === 0) return;
    const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
    const cfg = cfgDoc.exists ? cfgDoc.data() : {};
    const nomeClinica = cfg.nome || "PsiCoWorking";
    const pacNome = paciente.nome || "Paciente";
    const dataDoc = new Date().toLocaleDateString("pt-BR");
    const doc = docs[0];
    const laudo = laudoAlimentar(doc, ajustes);

    const respostasHtml = docs.map((d) => `
      <h3>${d.tipoRespondente === "paciente" ? "Próprio paciente" : (d.nomeRespondente || "Familiar") + " (" + (d.parentesco || "—") + ")"}</h3>
      <table class="resp-table">
        <thead><tr><th>#</th><th>Item</th><th>Eixo</th><th>Resp.</th></tr></thead>
        <tbody>
          ${PERGUNTAS_ALIMENTAR.map((p) => `<tr><td>${p.id.replace("p", "")}</td><td>${p.texto}</td><td>${p.eixo}</td><td><span class="letra" style="color:${COR_LETRA_TRIAGEM[d[p.id]] || "#6b7280"}">${d[p.id] || "—"}</span></td></tr>`).join("")}
          ${d.obsFinais ? `<tr><td colspan="2"><strong>Observações livres</strong></td><td colspan="2">${d.obsFinais}</td></tr>` : ""}
        </tbody>
      </table>`).join("");

    const html = gerarHtmlLaudoTriagem({
      titulo: "Laudo Analítico — Hábitos Alimentares",
      pacNome, nomeClinica, data: dataDoc, docs,
      barras: barrasDeCriterios(laudo.criterios),
      hipotese: laudo.hipotese, criterios: laudo.criterios, atencao: laudo.atencao,
      respostasHtmlExtra: respostasHtml,
    });
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }

  return (
    <div>
      <button className="botao-secundario botao-voltar-perfil" onClick={aoVoltar} style={{ marginBottom: 16 }}>
        <Icone nome="arrow-left" tamanho={15} /> Voltar para Questionários
      </button>

      <h3 style={{ marginBottom: 2 }}>Rastreamento de Hábitos Alimentares</h3>
      <p className="subtitulo-pagina" style={{ marginBottom: 20 }}>Avaliação diferencial DSM-5 (12 critérios) · Instrumento aplicado ao paciente e/ou familiares</p>

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

      {!carregando && docs.length > 0 && (() => {
        const doc = docs[0];
        const laudo = laudoAlimentar(doc, ajustes);
        return (
          <div>
            <div style={{ background: "#F5F3FF", border: "1px solid #C4B5FD", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--cor-marca)", marginBottom: 4 }}>Hipótese diagnóstica provável</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#3D006A", lineHeight: 1.4 }}>{laudo.hipotese}</div>
            </div>

            <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Critérios atendidos por transtorno (resposta mais recente)</div>
              {laudo.criterios.map((c, i) => (
                <BarraEscoreBipolar key={i} label={`${c.nomeCurto} (${c.n} de ${c.total})`} valor={c.n} max={c.total} cor={CORES_EIXOS[i % CORES_EIXOS.length]} />
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Análise DSM-5</div>
              <ListaCriteriosDSM5 criterios={laudo.criterios} aoAjustarLote={ajustar} />
            </div>

            <PontosAtencaoRespondiveis atencao={laudo.atencao} ajustes={ajustes} aoAjustarLote={ajustar} />

            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Respostas por respondente</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {docs.map((d) => (
                <div key={d.id} style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                    {d.tipoRespondente === "paciente" ? "Próprio paciente" : (d.nomeRespondente || "Familiar") + " · " + (d.parentesco || "")}
                  </div>
                  {PERGUNTAS_ALIMENTAR.map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
                      <div style={{
                        width: 24, height: 24, minWidth: 24, borderRadius: "50%",
                        background: d[p.id] ? COR_LETRA_TRIAGEM[d[p.id]] + "22" : "#F3F4F6",
                        border: "2px solid " + (d[p.id] ? COR_LETRA_TRIAGEM[d[p.id]] : "#E5E7EB"),
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                        color: d[p.id] ? COR_LETRA_TRIAGEM[d[p.id]] : "#9CA3AF",
                      }}>
                        {d[p.id] || "—"}
                      </div>
                      <div style={{ fontSize: 12, color: "#374151", flex: 1 }}>{p.texto}</div>
                      <div style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap" }}>{p.eixo}</div>
                    </div>
                  ))}
                  {d.obsFinais && (
                    <div style={{ marginTop: 12, background: "#F9FAFB", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#4B5563" }}>
                      <strong>Observações:</strong> {d.obsFinais}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Rastreamento de Saúde Sexual — bespoke, respondido apenas pelo
// paciente (confidencial). Traz análise etiológica diferencial além
// das hipóteses DSM-5, igual ao modelo.
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS_SEXUAL = [
  { id: "p1", eixo: "Desejo", texto: "Ausência ou redução persistente de desejo sexual (≥6m)" },
  { id: "p2", eixo: "Desejo", texto: "Repulsa ou aversão ativa ao contato sexual" },
  { id: "p3", eixo: "Excitação", texto: "Dificuldade na resposta física de excitação" },
  { id: "p4", eixo: "Orgasmo", texto: "Atraso ou ausência de orgasmo" },
  { id: "p5", eixo: "Ejaculação", texto: "Ejaculação precoce / involuntária (homens)" },
  { id: "p6", eixo: "Ejaculação", texto: "Atraso ou ausência de ejaculação (homens)" },
  { id: "p7", eixo: "Dor", texto: "Dor genital ou pélvica durante penetração" },
  { id: "p8", eixo: "Dor", texto: "Contração involuntária e medo da penetração (mulheres)" },
  { id: "p9", eixo: "Contexto", texto: "Persistência ≥6 meses com sofrimento clínico" },
  { id: "p10", eixo: "Contexto", texto: "Generalizado vs. situacional" },
  { id: "p11", eixo: "Contexto", texto: "Fator etiológico associado" },
];

function laudoSexual(doc, ajustes) {
  const p = (id) => doc[id] || "A";
  const atencao = [];
  const temCriterio = p("p9") === "C";
  const generalizado = p("p10") === "C";
  const etiologia = p("p11");

  // Cada disfunção do DSM-5 exige (1) o sintoma e (2) duração ≥6 meses
  // com sofrimento clínico (p9). Só entram na lista as disfunções cujo
  // sintoma foi marcado — as demais não geram cartão.
  const definicoes = [
    { id: "p1", nome: "Transtorno do Desejo Sexual Hipoativo", codigo: "DSM-5 F52.0", sintoma: "Ausência ou redução persistente de desejo/fantasias sexuais", nota: "Investigar queda hormonal, uso de ISRS e conflitos relacionais.", atencao: "Investigar queda hormonal (testosterona/estrogênio), uso de antidepressivos ISRS e conflitos relacionais." },
    { id: "p2", nome: "Aversão Sexual", codigo: "DSM-5", sintoma: "Repulsa ou evitação ativa de contato sexual/íntimo", nota: "Avaliar histórico de trauma ou abuso sexual.", atencao: "Rastrear histórico de trauma sexual — alta prevalência de TEPT associado à aversão sexual." },
    { id: "p3", nome: "Transtorno de Excitação (ereção/lubrificação)", codigo: "DSM-5 F52.21/F52.22", sintoma: "Dificuldade persistente de obter ou manter a resposta física de excitação", nota: etiologia === "B" ? "Possível efeito iatrogênico de medicação." : etiologia === "A" ? "Investigar causa orgânica vascular/neurológica." : "Fator psicogênico predominante.", atencao: etiologia === "A" ? "Encaminhar para urologia/ginecologia — possível causa orgânica vascular ou hormonal." : etiologia === "B" ? "Revisar medicações em uso — ISRS, anti-hipertensivos e anticoncepcionais são causas iatrogênicas frequentes." : null },
    { id: "p4", nome: "Transtorno do Orgasmo (Anorgasmia)", codigo: "DSM-5 F52.31", sintoma: "Atraso, raridade ou ausência de orgasmo apesar de estimulação adequada", nota: "Diferenciar anorgasmia primária de secundária.", atencao: "Diferenciar anorgasmia primária (nunca vivenciou orgasmo) de secundária (perdeu após período funcional)." },
    { id: "p5", nome: "Ejaculação Precoce", codigo: "DSM-5 F52.4", sintoma: "Ejaculação rápida e involuntária, sem controle", nota: generalizado ? "Caráter generalizado." : "Caráter situacional.", atencao: "Avaliar ansiedade de desempenho como fator primário — técnica de start-stop e terapia sexual indicadas." },
    { id: "p6", nome: "Ejaculação Retardada", codigo: "DSM-5 F52.32", sintoma: "Atraso extremo ou incapacidade de ejacular durante a relação", nota: "Investigar uso de antidepressivos e fatores psicogênicos.", atencao: "Ejaculação retardada tem alta correlação com uso de ISRS — avaliar ajuste medicamentoso com psiquiatra." },
    { id: "p7", nome: "Transtorno de Dor Gênito-Pélvica/Penetração", codigo: "DSM-5 F52.6", sintoma: "Dor genital ou pélvica recorrente durante ou ao tentar penetração", nota: "Diferencial com endometriose, vulvodínia e vaginismo em consulta ginecológica.", atencao: "Encaminhar para ginecologia — descartar endometriose, vulvodínia e outras causas orgânicas de dispareunia." },
    { id: "p8", nome: "Vaginismo (contração involuntária e medo da penetração)", codigo: "DSM-5 F52.6", sintoma: "Contração involuntária da musculatura vaginal com medo intenso da penetração", nota: "Alto índice de resposta a terapia sexual com fisioterapia pélvica.", atencao: "Vaginismo tem excelente prognóstico com fisioterapia pélvica + terapia sexual — rastrear também histórico de trauma sexual." },
  ];

  const criterios = [];
  definicoes.forEach((d) => {
    if (p(d.id) !== "C") return;
    const av = avaliarCriteriosDSM5({
      nome: d.nome, codigo: d.codigo,
      criterios: [
        { texto: d.sintoma, atende: true },
        { texto: "Persistência por ≥6 meses com sofrimento clínico significativo", atende: temCriterio },
      ],
      minimoDiagnostico: 2, minimoProvavel: 1,
      notaClinica: d.nota,
      confirmacoes: [
        "Os sintomas não são melhor explicados por outro transtorno mental, uso de substância/medicação, condição médica ou conflito relacional grave?",
      ],
      ajustes,
    });
    av.nomeCurto = d.nome;
    criterios.push(av);
    if (d.atencao) atencao.push(d.atencao);
  });

  let hipotese;
  if (criterios.length === 0) {
    hipotese = "Nenhuma disfunção sexual do DSM-5 atinge os critérios avaliados neste instrumento (nenhum sintoma marcado como presente).";
    criterios.push({ label: "Disfunções Sexuais DSM-5", nomeCurto: "Disfunções Sexuais", atende: false, status: "abaixo", labelStatus: "Não atende", obs: "Nenhum sintoma foi assinalado como claramente presente.", n: 0, total: 1 });
  } else {
    hipotese = montarHipoteseCriterios(criterios, "");
  }

  const etioLabel = etiologia === "A" ? "Orgânica/Médica" : etiologia === "B" ? "Iatrogênica (medicação)" : "Psicogênica/Relacional";
  const etioObs = etiologia === "A" ? "Investigação médica especializada indicada (urologia, ginecologia, endocrinologia)." :
    etiologia === "B" ? "Revisar medicações — especialmente ISRS, anti-hipertensivos e anticoncepcionais. Discutir com médico prescritor." :
    "Terapia sexual, psicoterapia cognitivo-comportamental e trabalho com crenças disfuncionais indicados.";

  return { hipotese, criterios, atencao, etioLabel, etioObs, temCriterio, generalizado };
}

function AbaRastreamentoSexualView({ usuario, paciente, aoVoltar }) {
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [ajustes, ajustar] = useAjustesClinicos("clinica_rastreamento_sexual", docs[0]);

  useEffect(() => {
    db.collection("clinica_rastreamento_sexual")
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
  }, [usuario.psiId, paciente.id]);

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
        tipo: "sexual",
        titulo: "Rastreamento de Saúde Sexual",
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
      `Olá!\n\n` +
      `Preparei um questionário clínico confidencial para você preencher: *Rastreamento de Saúde Sexual*.\n\n` +
      `Leva de 5 a 10 minutos — suas respostas são lidas apenas por mim. É só abrir o link abaixo:\n\n` +
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

  async function gerarLaudo() {
    if (docs.length === 0) return;
    const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
    const cfg = cfgDoc.exists ? cfgDoc.data() : {};
    const nomeClinica = cfg.nome || "PsiCoWorking";
    const pacNome = paciente.nome || "Paciente";
    const dataDoc = new Date().toLocaleDateString("pt-BR");
    const doc = docs[0];
    const laudo = laudoSexual(doc, ajustes);

    const respostasHtml = `
      <h3>Próprio paciente · Confidencial</h3>
      <table class="resp-table">
        <thead><tr><th>#</th><th>Item</th><th>Eixo</th><th>Resp.</th></tr></thead>
        <tbody>
          ${PERGUNTAS_SEXUAL.map((p) => `<tr><td>${p.id.replace("p", "")}</td><td>${p.texto}</td><td>${p.eixo}</td><td><span class="letra" style="color:${COR_LETRA_TRIAGEM[doc[p.id]] || "#6b7280"}">${doc[p.id] || "—"}</span></td></tr>`).join("")}
        </tbody>
      </table>
      <div style="margin-top:12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2563eb;margin-bottom:4px">Etiologia predominante indicada</div>
        <div style="font-size:14px;font-weight:700;color:#1e40af;margin-bottom:6px">${laudo.etioLabel}</div>
        <div style="font-size:12px;color:#374151">${laudo.etioObs}</div>
      </div>`;

    const html = gerarHtmlLaudoTriagem({
      titulo: "Laudo de Rastreamento — Saúde Sexual",
      pacNome, nomeClinica, data: dataDoc, docs,
      barras: [],
      hipotese: laudo.hipotese, criterios: laudo.criterios, atencao: laudo.atencao,
      respostasHtmlExtra: respostasHtml,
    });
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }

  return (
    <div>
      <button className="botao-secundario botao-voltar-perfil" onClick={aoVoltar} style={{ marginBottom: 16 }}>
        <Icone nome="arrow-left" tamanho={15} /> Voltar para Questionários
      </button>

      <h3 style={{ marginBottom: 2 }}>Rastreamento de Saúde Sexual</h3>
      <p className="subtitulo-pagina" style={{ marginBottom: 12 }}>Avaliação diferencial DSM-5 (11 critérios) · Confidencial</p>

      <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#065F46", marginBottom: 16 }}>
        Este questionário é respondido apenas pelo próprio paciente. Nenhum familiar tem acesso.
      </div>

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
          <p className="texto-vazio">Nenhuma resposta recebida ainda. Gere o link acima e envie ao paciente.</p>
        </div>
      )}

      {!carregando && docs.length > 0 && (() => {
        const doc = docs[0];
        const laudo = laudoSexual(doc, ajustes);
        return (
          <div>
            <div style={{ background: "#F5F3FF", border: "1px solid #C4B5FD", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--cor-marca)", marginBottom: 4 }}>Hipótese diagnóstica provável</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#3D006A", lineHeight: 1.4 }}>{laudo.hipotese}</div>
            </div>

            <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#2563EB", marginBottom: 4 }}>Etiologia predominante</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1E40AF", marginBottom: 4 }}>{laudo.etioLabel}</div>
              <div style={{ fontSize: 12, color: "#374151" }}>{laudo.etioObs}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Análise DSM-5</div>
              <ListaCriteriosDSM5 criterios={laudo.criterios} aoAjustarLote={ajustar} />
            </div>

            <PontosAtencaoRespondiveis atencao={laudo.atencao} ajustes={ajustes} aoAjustarLote={ajustar} />

            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Respostas do paciente</div>
            <div style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
              {PERGUNTAS_SEXUAL.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{
                    width: 24, height: 24, minWidth: 24, borderRadius: "50%",
                    background: doc[p.id] ? COR_LETRA_TRIAGEM[doc[p.id]] + "22" : "#F3F4F6",
                    border: "2px solid " + (doc[p.id] ? COR_LETRA_TRIAGEM[doc[p.id]] : "#E5E7EB"),
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                    color: doc[p.id] ? COR_LETRA_TRIAGEM[doc[p.id]] : "#9CA3AF",
                  }}>
                    {doc[p.id] || "—"}
                  </div>
                  <div style={{ fontSize: 12, color: "#374151", flex: 1 }}>{p.texto}</div>
                  <div style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap" }}>{p.eixo}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Rastreamento de Funcionamento e Comportamento (TDAH/TEA/TOD) —
// bespoke, 4 eixos independentes (não excludentes entre si).
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS_NEURO = [
  { id: "p1", eixo: "TDAH Inatenção", texto: "Falhas em detalhes / erros por descuido" },
  { id: "p2", eixo: "TDAH Inatenção", texto: "Dificuldade em manter foco em tarefas longas" },
  { id: "p3", eixo: "TDAH Inatenção", texto: "Abandona tarefas antes de terminar" },
  { id: "p4", eixo: "TDAH Inatenção", texto: "Desorganização crônica de tempo e espaço" },
  { id: "p5", eixo: "TDAH Inatenção", texto: "Evitação de tarefas com esforço mental prolongado" },
  { id: "p6", eixo: "TDAH Inatenção", texto: "Perda frequente de objetos essenciais" },
  { id: "p7", eixo: "TDAH Inatenção", texto: "Distrabilidade por estímulos externos" },
  { id: "p8", eixo: "TDAH Inatenção", texto: "Esquecimentos de compromissos e rotinas" },
  { id: "p9", eixo: "TDAH Hiperatividade", texto: "Inquietação motora (mãos, pés, corpo)" },
  { id: "p10", eixo: "TDAH Hiperatividade", texto: "Dificuldade em permanecer sentado(a)" },
  { id: "p11", eixo: "TDAH Hiperatividade", texto: "Sensação de aceleração interna crônica" },
  { id: "p12", eixo: "TDAH Hiperatividade", texto: "Fala excessiva / monopoliza conversas" },
  { id: "p13", eixo: "TDAH Hiperatividade", texto: "Precipitação de respostas / completa frases alheias" },
  { id: "p14", eixo: "TDAH Hiperatividade", texto: "Dificuldade para esperar / impaciência extrema" },
  { id: "p15", eixo: "TDAH Hiperatividade", texto: "Interrupção ou intrusão em atividades alheias" },
  { id: "p16", eixo: "TEA", texto: "Dificuldade na reciprocidade social" },
  { id: "p17", eixo: "TEA", texto: "Uso atípico de contato visual / expressão facial" },
  { id: "p18", eixo: "TEA", texto: "Dificuldade em fazer e manter amigos" },
  { id: "p19", eixo: "TEA", texto: "Movimentos ou falas repetitivas (stimming)" },
  { id: "p20", eixo: "TEA", texto: "Angústia severa diante de mudanças de rotina" },
  { id: "p21", eixo: "TEA", texto: "Interesses restritos e hiperfixados" },
  { id: "p22", eixo: "TEA", texto: "Hiper ou hipossensibilidade sensorial" },
  { id: "p23", eixo: "TOD", texto: "Humor irritável e irascível" },
  { id: "p24", eixo: "TOD", texto: "Discussões com figuras de autoridade" },
  { id: "p25", eixo: "TOD", texto: "Desobediência ativa e recusa de regras" },
  { id: "p26", eixo: "TOD", texto: "Incomoda deliberadamente outras pessoas" },
  { id: "p27", eixo: "TOD", texto: "Culpa os outros pelos próprios erros" },
  { id: "p28", eixo: "TOD", texto: "Rancor e vingança persistentes" },
];

// Critérios contados um a um (resposta C = critério presente).
// TDAH: DSM-5 pede 6 de 9 sintomas (5 a partir dos 17 anos); o
// instrumento tem 8 de desatenção e 7 de hiperatividade, então o
// limiar foi ajustado proporcionalmente (5 de 8 e 5 de 7). TEA segue
// a estrutura real: Critério A (3 domínios sociais, todos exigidos) +
// Critério B (ao menos 2 de 4 padrões restritos/repetitivos). TOD: 4
// de 8 sintomas no DSM-5 → 4 de 6 aqui.
function laudoNeuro(doc, ajustes = {}) {
  const c = (id) => doc[id] === "C";
  const lista = (textos, a) => textos.map((t, i) => ({ texto: t, atende: c("p" + (a + i)) }));

  const desatencao = avaliarCriteriosDSM5({
    nome: "TDAH — sintomas de Desatenção", codigo: "DSM-5 F90.0",
    criterios: lista([
      "Falha em detalhes / erros por descuido", "Dificuldade de manter o foco em tarefas longas", "Abandona tarefas antes de terminar",
      "Desorganização crônica de tempo e espaço", "Evita tarefas de esforço mental prolongado", "Perde objetos essenciais com frequência",
      "Distrai-se com estímulos externos", "Esquece compromissos e rotinas",
    ], 1),
    minimoDiagnostico: 5, minimoProvavel: 4,
    regra: "mínimo: 5 de 8 (equivalente proporcional aos 6 de 9 do DSM-5)",
    confirmacoes: [
      "Vários sintomas já estavam presentes antes dos 12 anos?",
      "Sintomas presentes em 2 ou mais contextos (escola/trabalho, casa, social)?",
      "Persistem há pelo menos 6 meses, com prejuízo claro no funcionamento?",
    ],
    ajustes,
  });
  desatencao.nomeCurto = "TDAH — Desatenção";

  const hiperatividade = avaliarCriteriosDSM5({
    nome: "TDAH — sintomas de Hiperatividade/Impulsividade", codigo: "DSM-5 F90.1",
    criterios: lista([
      "Inquietação motora (mãos, pés, corpo)", "Levanta-se quando deveria permanecer sentado(a)", "Aceleração interna crônica",
      "Fala excessiva", "Responde antes de a pergunta terminar", "Dificuldade para esperar a vez", "Interrompe ou se intromete nas atividades alheias",
    ], 9),
    minimoDiagnostico: 5, minimoProvavel: 4,
    regra: "mínimo: 5 de 7 (equivalente proporcional aos 6 de 9 do DSM-5)",
    confirmacoes: [
      "Vários sintomas já estavam presentes antes dos 12 anos?",
      "Sintomas presentes em 2 ou mais contextos (escola/trabalho, casa, social)?",
      "Persistem há pelo menos 6 meses, com prejuízo claro no funcionamento?",
    ],
    ajustes,
  });
  hiperatividade.nomeCurto = "TDAH — Hiperatividade/Impulsividade";

  const socialTextos = ["Dificuldade de reciprocidade social/emocional", "Uso atípico de contato visual e comunicação não verbal", "Dificuldade de fazer, manter e compreender relações"];
  const restritosTextos = ["Movimentos ou falas repetitivas (estereotipias)", "Insistência em rotina / sofrimento com mudanças", "Interesses restritos e hiperfixados", "Hiper ou hiporreatividade sensorial"];
  const contarAB = (itens) => ({ A: itens.slice(0, 3).filter((x) => x.atende).length, B: itens.slice(3).filter((x) => x.atende).length });
  const tea = avaliarCriteriosDSM5({
    nome: "TEA — Transtorno do Espectro Autista", codigo: "DSM-5 F84.0",
    criterios: [
      ...socialTextos.map((t, i) => ({ texto: "Critério A — " + t, atende: c("p" + (16 + i)) })),
      ...restritosTextos.map((t, i) => ({ texto: "Critério B — " + t, atende: c("p" + (19 + i)) })),
    ],
    statusFn: (itens) => {
      const { A, B } = contarAB(itens);
      return A === 3 && B >= 2 ? "diagnostico" : (A >= 2 && B >= 2) || (A === 3 && B === 1) ? "provavel" : "abaixo";
    },
    regra: (itens) => {
      const { A, B } = contarAB(itens);
      return "exigido: Critério A com os 3 domínios sociais + Critério B com ao menos 2 de 4 padrões restritos. Encontrado: A " + A + "/3, B " + B + "/4";
    },
    confirmacoes: [
      "Os sintomas estão presentes desde o período do desenvolvimento precoce?",
      "Causam prejuízo clinicamente significativo no funcionamento?",
    ],
    ajustes,
  });
  tea.nomeCurto = "TEA — Espectro Autista";

  const tod = avaliarCriteriosDSM5({
    nome: "TOD — Transtorno Opositivo-Desafiador", codigo: "DSM-5 F91.3",
    criterios: lista([
      "Irritabilidade e humor facilmente ofendido", "Discute com figuras de autoridade", "Recusa-se a cumprir regras e pedidos",
      "Incomoda deliberadamente os outros", "Culpa os outros pelos próprios erros", "Rancor ou vingança persistentes",
    ], 23),
    minimoDiagnostico: 4, minimoProvavel: 3,
    regra: "mínimo: 4 de 6 (equivalente proporcional aos 4 de 8 do DSM-5)",
    confirmacoes: [
      "Padrão presente há pelo menos 6 meses?",
      "Ocorre com ao menos uma pessoa que não seja irmão/irmã?",
    ],
    ajustes,
  });
  tod.nomeCurto = "TOD — Opositivo-Desafiador";

  const avaliacoes = [desatencao, hiperatividade, tea, tod];

  const tdahDiag = desatencao.status === "diagnostico" || hiperatividade.status === "diagnostico";
  const tdahProv = !tdahDiag && (desatencao.status === "provavel" || hiperatividade.status === "provavel");
  const subtipo = desatencao.status === "diagnostico" && hiperatividade.status === "diagnostico" ? "Apresentação Combinada"
    : desatencao.status !== "abaixo" && hiperatividade.status !== "abaixo" ? "Apresentação Combinada"
    : desatencao.status !== "abaixo" ? "Predominantemente Desatento" : "Predominantemente Hiperativo/Impulsivo";

  const partes = [];
  if (tdahDiag) partes.push("TDAH — " + subtipo);
  else if (tdahProv) partes.push("TDAH — " + subtipo + " (provável)");
  if (tea.status === "diagnostico") partes.push("TEA — Transtorno do Espectro Autista");
  else if (tea.status === "provavel") partes.push("TEA (provável)");
  if (tod.status === "diagnostico") partes.push("TOD — Transtorno Opositivo-Desafiador");
  else if (tod.status === "provavel") partes.push("TOD (provável)");

  const hipotese = partes.length > 0 ? partes.join(" + ") : "Nenhum transtorno atinge o mínimo de critérios DSM-5 avaliados neste instrumento.";

  const atencao = [];
  if (tdahDiag || tdahProv) atencao.push("TDAH: confirmar início antes dos 12 anos e prejuízo em ao menos 2 contextos (escola/trabalho, casa, social) — critérios obrigatórios do DSM-5.");
  if (tea.status !== "abaixo") atencao.push("TEA: investigar histórico de desenvolvimento precoce e diferenciar hiperfoco do TEA da desatenção seletiva do TDAH.");
  if ((tdahDiag || tdahProv) && tea.status !== "abaixo") atencao.push("Sobreposição TDAH + TEA — avaliar comorbidade (frequente, ~50% dos casos de TEA).");
  if (tod.status !== "abaixo") atencao.push("TOD: diferenciar oposição da desregulação emocional do TDAH e confirmar duração ≥6 meses.");

  return { hipotese, criterios: avaliacoes, atencao };
}

function AbaRastreamentoNeuroView({ usuario, paciente, aoVoltar }) {
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [ajustes, ajustar] = useAjustesClinicos("clinica_rastreamento_neuro", docs[0]);

  useEffect(() => {
    db.collection("clinica_rastreamento_neuro")
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
  }, [usuario.psiId, paciente.id]);

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
        tipo: "neuro",
        titulo: "Rastreamento de Funcionamento e Comportamento",
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
      `Olá!\n\n` +
      `Preparei um questionário clínico para você preencher sobre *${primeiroNome}*: *Rastreamento de Funcionamento e Comportamento*.\n\n` +
      `Leva de 10 a 15 minutos — é só abrir o link abaixo e responder com calma:\n\n` +
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

  async function gerarLaudo() {
    if (docs.length === 0) return;
    const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
    const cfg = cfgDoc.exists ? cfgDoc.data() : {};
    const nomeClinica = cfg.nome || "PsiCoWorking";
    const pacNome = paciente.nome || "Paciente";
    const dataDoc = new Date().toLocaleDateString("pt-BR");
    const laudo = laudoNeuro(docs[0], ajustes);

    const respostasHtml = docs.map((d) => `
      <h3>${d.tipoRespondente === "paciente" ? "Próprio paciente" : (d.nomeRespondente || "Familiar") + " (" + (d.parentesco || "—") + ")"}</h3>
      <table class="resp-table">
        <thead><tr><th>#</th><th>Item</th><th>Eixo</th><th>Resp.</th></tr></thead>
        <tbody>
          ${PERGUNTAS_NEURO.map((p) => `<tr><td>${p.id.replace("p", "")}</td><td>${p.texto}</td><td>${p.eixo}</td><td><span class="letra" style="color:${COR_LETRA_TRIAGEM[d[p.id]] || "#6b7280"}">${d[p.id] || "—"}</span></td></tr>`).join("")}
          ${d.obsFinais ? `<tr><td colspan="2"><strong>Observações livres</strong></td><td colspan="2">${d.obsFinais}</td></tr>` : ""}
        </tbody>
      </table>`).join("");

    const html = gerarHtmlLaudoTriagem({
      titulo: "Laudo de Rastreamento — Funcionamento e Comportamento",
      pacNome, nomeClinica, data: dataDoc, docs,
      barras: barrasDeCriterios(laudo.criterios),
      hipotese: laudo.hipotese, criterios: laudo.criterios, atencao: laudo.atencao,
      respostasHtmlExtra: respostasHtml,
    });
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }

  return (
    <div>
      <button className="botao-secundario botao-voltar-perfil" onClick={aoVoltar} style={{ marginBottom: 16 }}>
        <Icone nome="arrow-left" tamanho={15} /> Voltar para Questionários
      </button>

      <h3 style={{ marginBottom: 2 }}>Funcionamento e Comportamento</h3>
      <p className="subtitulo-pagina" style={{ marginBottom: 20 }}>Avaliação de TDAH, TEA e TOD (28 critérios DSM-5) · Instrumento aplicado ao paciente e/ou familiares</p>

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

      {!carregando && docs.length > 0 && (() => {
        const laudo = laudoNeuro(docs[0], ajustes);
        return (
          <div>
            <div style={{ background: "#F5F3FF", border: "1px solid #C4B5FD", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--cor-marca)", marginBottom: 4 }}>Hipótese diagnóstica provável</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#3D006A", lineHeight: 1.4 }}>{laudo.hipotese}</div>
            </div>

            <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Critérios atendidos por transtorno (respondente mais recente{docs.length > 1 ? " — compare com os demais abaixo" : ""})</div>
              {laudo.criterios.map((c, i) => (
                <BarraEscoreBipolar key={i} label={`${c.nomeCurto} (${c.n} de ${c.total})`} valor={c.n} max={c.total} cor={CORES_EIXOS[i % CORES_EIXOS.length]} />
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Análise DSM-5</div>
              <ListaCriteriosDSM5 criterios={laudo.criterios} aoAjustarLote={ajustar} />
            </div>

            <PontosAtencaoRespondiveis atencao={laudo.atencao} ajustes={ajustes} aoAjustarLote={ajustar} />

            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Respostas por respondente</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {docs.map((doc) => (
                <div key={doc.id} style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                    {doc.tipoRespondente === "paciente" ? "Próprio paciente" : (doc.nomeRespondente || "Familiar") + " · " + (doc.parentesco || "")}
                  </div>
                  {PERGUNTAS_NEURO.map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
                      <div style={{
                        width: 24, height: 24, minWidth: 24, borderRadius: "50%",
                        background: doc[p.id] ? COR_LETRA_TRIAGEM[doc[p.id]] + "22" : "#F3F4F6",
                        border: "2px solid " + (doc[p.id] ? COR_LETRA_TRIAGEM[doc[p.id]] : "#E5E7EB"),
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                        color: doc[p.id] ? COR_LETRA_TRIAGEM[doc[p.id]] : "#9CA3AF",
                      }}>
                        {doc[p.id] || "—"}
                      </div>
                      <div style={{ fontSize: 12, color: "#374151", flex: 1 }}>{p.texto}</div>
                      <div style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap" }}>{p.eixo}</div>
                    </div>
                  ))}
                  {doc.obsFinais && (
                    <div style={{ marginTop: 12, background: "#F9FAFB", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#4B5563" }}>
                      <strong>Observações:</strong> {doc.obsFinais}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Painel de Grupo Diagnóstico ──────────────────────────────────
// Exibe hipóteses selecionáveis, gera token e lista respostas.
function PainelGrupoDiagnostico({ usuario, paciente, grupo, onVoltar }) {
  const [hipSel, setHipSel] = useState([]);
  const [gerando, setGerando] = useState(false);
  const [link, setLink] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [respostas, setRespostas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    if (!paciente?.id) return;
    db.collection("clinica_rastreamento_diagnostico")
      .where("psi_id", "==", usuario.psiId)
      .where("pacienteId", "==", paciente.id)
      .where("grupoId", "==", grupo.id)
      .get()
      .then((snap) => {
        const lista = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
        setRespostas(lista);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, [usuario.psiId, paciente.id, grupo.id]);

  function toggleHip(id) {
    setHipSel((prev) => prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]);
  }

  async function gerarLink() {
    if (hipSel.length === 0) return;
    setGerando(true);
    try {
      const token = "diag_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      await db.collection("clinica_rastreamento_tokens").doc(token).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome || "",
        grupoId: grupo.id,
        grupoTitulo: grupo.titulo,
        hipoteses: hipSel,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usado: false,
      });
      setLink(window.location.origin + "/psi/atividade/diagnostico/?token=" + token);
    } catch (e) {
      alert("Erro ao gerar link: " + e.message);
    } finally {
      setGerando(false);
    }
  }

  function copiar() {
    navigator.clipboard.writeText(link).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }

  function enviarWhatsApp() {
    const primeiroNome = (paciente.nome || "").split(" ")[0];
    const msg =
      `Olá, ${primeiroNome}!\n\n` +
      `Preparei um questionário clínico personalizado para você preencher.\n\n` +
      `É rápido, leva cerca de 10 minutos. Responda com calma e honestidade:\n\n${link}\n\n` +
      `Qualquer dúvida, me chama por aqui.`;
    const numero = (paciente.telefone || "").replace(/\D/g, "");
    window.open(
      (numero ? "https://wa.me/55" + numero : "https://wa.me/") + "?text=" + encodeURIComponent(msg),
      "_blank"
    );
  }

  function calcularEscores(doc) {
    if (!doc.respostas) return {};
    const escores = {};
    (doc.hipoteses || []).forEach((hipId) => {
      const pares = Object.entries(doc.respostas).filter(([k]) => k.startsWith(hipId + "_"));
      if (pares.length === 0) return;
      const pts = pares.reduce((s, [, v]) => s + (v === "C" ? 2 : v === "B" ? 1 : 0), 0);
      escores[hipId] = Math.round((pts / (pares.length * 2)) * 100);
    });
    return escores;
  }

  return (
    <div>
      <button
        type="button"
        onClick={onVoltar}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: grupo.cor, fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}
      >
        <Icone nome="arrow-left" tamanho={15} /> Voltar para Questionários
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: grupo.corBg, display: "flex", alignItems: "center", justifyContent: "center", color: grupo.cor }}>
          <Icone nome={grupo.icone} tamanho={22} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{grupo.titulo}</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>{grupo.descricao}</div>
        </div>
      </div>

      <div style={{ background: grupo.corBg, border: "1px solid " + grupo.cor + "33", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: grupo.cor, marginBottom: 12 }}>
          Selecione as hipóteses a incluir no questionário
        </div>
        {grupo.hipoteses.map((h) => (
          <label key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={hipSel.includes(h.id)}
              onChange={() => toggleHip(h.id)}
              style={{ width: 16, height: 16, accentColor: grupo.cor }}
            />
            <span style={{ fontSize: 13, color: "#374151" }}>{h.rotulo}</span>
          </label>
        ))}
        <div style={{ marginTop: 14 }}>
          <button
            type="button"
            className="botao-primario"
            style={{ background: grupo.cor }}
            disabled={hipSel.length === 0 || gerando}
            onClick={gerarLink}
          >
            <Icone nome="link" tamanho={14} />
            {gerando ? "Gerando..." : "Gerar link do questionário"}
          </button>
        </div>
      </div>

      {link && (
        <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 12, padding: 14, marginBottom: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: "#166534", marginBottom: 8 }}>Link gerado — válido por 30 dias</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              readOnly
              value={link}
              style={{ flex: 1, minWidth: 200, fontSize: 11, padding: "8px 10px", border: "1px solid #86EFAC", borderRadius: 8, background: "white", color: "#374151" }}
            />
            <button type="button" className="botao-secundario" style={{ fontSize: 12 }} onClick={copiar}>
              <Icone nome={copiado ? "check" : "copy"} tamanho={13} /> {copiado ? "Copiado!" : "Copiar"}
            </button>
            <button type="button" className="botao-primario" style={{ background: "#25D366", fontSize: 12 }} onClick={enviarWhatsApp}>
              <Icone nome="message-circle" tamanho={13} /> WhatsApp
            </button>
          </div>
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 12 }}>
        Respostas recebidas{respostas.length > 0 && <span style={{ fontSize: 12, fontWeight: 400, color: "#6B7280", marginLeft: 6 }}>({respostas.length})</span>}
      </div>

      {carregando ? (
        <Spinner />
      ) : respostas.length === 0 ? (
        <div className="texto-vazio" style={{ padding: "24px 0" }}>Nenhuma resposta recebida ainda.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {respostas.map((doc) => {
            const escores = calcularEscores(doc);
            const isOpen = aberto === doc.id;
            const hips = (doc.hipoteses || []).map(
              (id) => grupo.hipoteses.find((h) => h.id === id)?.rotulo || id
            );
            const data = doc.criadoEm?.seconds
              ? new Date(doc.criadoEm.seconds * 1000).toLocaleDateString("pt-BR")
              : "—";
            return (
              <div key={doc.id} style={{ border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                <div
                  onClick={() => setAberto(isOpen ? null : doc.id)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer", background: isOpen ? grupo.corBg : "white" }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{data}</div>
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{hips.join(" · ")}</div>
                  </div>
                  <Icone nome={isOpen ? "chevron-up" : "chevron-down"} tamanho={16} />
                </div>
                {isOpen && (
                  <div style={{ padding: "12px 16px", borderTop: "1px solid #F3F4F6" }}>
                    {(doc.hipoteses || []).map((hipId) => {
                      const hip = grupo.hipoteses.find((h) => h.id === hipId);
                      const escore = escores[hipId];
                      const cor = escore >= 60 ? "#DC2626" : escore >= 30 ? "#D97706" : "#16A34A";
                      return (
                        <div key={hipId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                          <span style={{ fontSize: 13, color: "#374151" }}>{hip?.rotulo || hipId}</span>
                          {escore !== undefined ? (
                            <span style={{ fontSize: 12, fontWeight: 700, color: cor }}>{escore}% concordância</span>
                          ) : (
                            <span style={{ fontSize: 12, color: "#9CA3AF" }}>sem dados</span>
                          )}
                        </div>
                      );
                    })}
                    {doc.obsFinais && (
                      <div style={{ marginTop: 10, padding: 10, background: "#F9FAFB", borderRadius: 8, fontSize: 12, color: "#374151" }}>
                        <strong>Obs:</strong> {doc.obsFinais}
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
  const [enviandoId, setEnviandoId] = useState(null);

  if (aberto?.tipo === "grupo") {
    const grupo = GRUPOS_DIAGNOSTICOS.find((g) => g.id === aberto.id);
    if (grupo) return <PainelGrupoDiagnostico usuario={usuario} paciente={paciente} grupo={grupo} onVoltar={() => setAberto(null)} />;
  }
  if (aberto === "anamnese") {
    return <AbaAnamneseView usuario={usuario} paciente={paciente} aoVoltar={() => setAberto(null)} />;
  }
  if (aberto === "rastreamento") {
    return <AbaRastreamentoBipolarView usuario={usuario} paciente={paciente} aoVoltar={() => setAberto(null)} />;
  }
  if (aberto === "alimentar") {
    return <AbaRastreamentoAlimentarView usuario={usuario} paciente={paciente} aoVoltar={() => setAberto(null)} />;
  }
  if (aberto === "sexual") {
    return <AbaRastreamentoSexualView usuario={usuario} paciente={paciente} aoVoltar={() => setAberto(null)} />;
  }
  if (aberto === "neuro") {
    return <AbaRastreamentoNeuroView usuario={usuario} paciente={paciente} aoVoltar={() => setAberto(null)} />;
  }
  if (aberto && RASTREAMENTOS_ADMIN[aberto]) {
    return <AbaRastreamentoView usuario={usuario} paciente={paciente} tipo={aberto} aoVoltar={() => setAberto(null)} />;
  }

  // Gera o link individual do questionário e abre o WhatsApp com a
  // mensagem pronta — mesmo fluxo das telas internas, direto do cartão.
  async function enviarPorWhatsApp(q) {
    setEnviandoId(q.id);
    try {
      const tipo = q.id === "rastreamento" ? "bipolar" : q.id;
      const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
      const cfg = cfgDoc.exists ? cfgDoc.data() : {};
      const token = gerarTokenLink();
      await db.collection("clinica_links_partilhados").doc(token).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome || "",
        tipo,
        titulo: q.rotulo,
        nomeClinica: cfg.nome || "PsiCoWorking",
        corMarca: cfg.corPrimaria || "#6A2BD9",
        logoUrl: cfg.logoUrl || "",
        status: "enviado",
        cancelado: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
      const link = window.location.origin + "/psi/atividade/?t=" + token;
      const primeiroNome = (paciente.nome || "").split(" ")[0];
      const mensagem =
        `Olá, ${primeiroNome}!\n\n` +
        `Preparei um questionário para você preencher: *${q.rotulo}*.\n\n` +
        `É só abrir o link abaixo e responder com calma:\n\n${link}\n\n` +
        `Qualquer dúvida, me chama por aqui.`;
      const numero = (paciente.telefone || "").replace(/\D/g, "");
      window.open(
        (numero ? "https://wa.me/55" + numero : "https://wa.me/") + "?text=" + encodeURIComponent(mensagem),
        "_blank"
      );
    } catch (e) {
      alert("Não foi possível gerar o link: " + e.message);
    } finally {
      setEnviandoId(null);
    }
  }

  return (
    <div>
      {/* ── 7 Grupos Diagnósticos DSM-5 ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4 }}>7 Grupos Diagnósticos DSM-5</div>
        <p className="subtitulo-pagina" style={{ marginBottom: 16 }}>Selecione um grupo, escolha as hipóteses e gere um link de rastreamento personalizado para o paciente.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 12 }}>
          {GRUPOS_DIAGNOSTICOS.map((grupo) => (
            <div
              key={grupo.id}
              className="cartao-recurso"
              style={{ cursor: "pointer", borderTop: "3px solid " + grupo.cor, paddingTop: 14 }}
              onClick={() => setAberto({ tipo: "grupo", id: grupo.id })}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ color: grupo.cor }}><Icone nome={grupo.icone} tamanho={20} /></span>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#111827", lineHeight: 1.3 }}>{grupo.titulo}</span>
              </div>
              <p style={{ fontSize: 11.5, color: "#6B7280", marginBottom: 10, lineHeight: 1.45 }}>{grupo.descricao}</p>
              <span style={{ fontSize: 11, color: grupo.cor, fontWeight: 600 }}>{grupo.hipoteses.length} hipóteses disponíveis</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Questionários individuais (legado) ── */}
      <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 20, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4 }}>Questionários Individuais</div>
        <p className="subtitulo-pagina" style={{ marginBottom: 16 }}>Visualize as respostas ou envie o questionário ao paciente pelo WhatsApp.</p>
      </div>
      <div className="grade-cartoes-recursos">
        {QUESTIONARIOS_DISPONIVEIS.map((q) => (
          <div key={q.id} className="cartao-recurso" style={{ opacity: q.pronto ? 1 : 0.6 }}>
            <div className="cabecalho-cartao-recurso">
              <div className="icone-cartao-recurso" style={{ "--cor-cat": "var(--cor-marca)" }}>
                <Icone nome={q.icone} tamanho={20} />
              </div>
              <div className="titulo-cartao-recurso">{q.rotulo}</div>
            </div>
            <p className="descricao-cartao-recurso">{q.desc}</p>
            {q.pronto ? (
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <button className="botao-secundario" onClick={() => setAberto(q.id)}>
                  <Icone nome="eye" tamanho={14} /> Visualizar
                </button>
                <button className="botao-primario" style={{ background: "#25D366" }} disabled={enviandoId === q.id} onClick={() => enviarPorWhatsApp(q)}>
                  <Icone nome="message-circle" tamanho={14} /> {enviandoId === q.id ? "Gerando..." : "Enviar WhatsApp"}
                </button>
              </div>
            ) : (
              <span className="texto-vazio" style={{ fontSize: 11.5 }}>Em construção</span>
            )}
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
