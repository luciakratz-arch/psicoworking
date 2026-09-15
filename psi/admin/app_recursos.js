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

// Cores por categoria, no espírito das macrocategorias do sistema
// real (cada uma com uma cor de destaque + fundo claro). Categorias
// que não estão no mapa caem numa paleta de reserva, sempre a mesma
// cor pra mesma categoria (hash do nome), pra nunca ficar tudo cinza.
const PALETA_CATEGORIAS = {
  tcc: { cor: "#7B00C4", bg: "#f3e6ff" },
  ansiedade: { cor: "#7B00C4", bg: "#f3e6ff" },
  relaxamento: { cor: "#0891b2", bg: "#e0f2fe" },
  avaliacao: { cor: "#6366f1", bg: "#e0e7ff" },
  musicoterapia: { cor: "#7B00C4", bg: "#f3e6ff" },
  depressao: { cor: "#db2777", bg: "#fce7f3" },
  humor: { cor: "#db2777", bg: "#fce7f3" },
  habitos: { cor: "#16a34a", bg: "#dcfce7" },
  autocuidado: { cor: "#16a34a", bg: "#dcfce7" },
  relacionamentos: { cor: "#0891b2", bg: "#e0f2fe" },
  familia: { cor: "#d97706", bg: "#fef3c7" },
  outros: { cor: "#6b7280", bg: "#f3f4f6" },
};
const PALETA_RESERVA = [
  { cor: "#7B00C4", bg: "#f3e6ff" },
  { cor: "#0891b2", bg: "#e0f2fe" },
  { cor: "#db2777", bg: "#fce7f3" },
  { cor: "#16a34a", bg: "#dcfce7" },
  { cor: "#d97706", bg: "#fef3c7" },
  { cor: "#6366f1", bg: "#e0e7ff" },
  { cor: "#0d9488", bg: "#ccfbf1" },
];

function corDaCategoria(categoria) {
  const chave = (categoria || "outros").toLowerCase();
  if (PALETA_CATEGORIAS[chave]) return PALETA_CATEGORIAS[chave];
  let hash = 0;
  for (let i = 0; i < chave.length; i++) hash = (hash * 31 + chave.charCodeAt(i)) >>> 0;
  return PALETA_RESERVA[hash % PALETA_RESERVA.length];
}

const ICONE_POR_TIPO = { ferramenta: "wrench", fabula: "book-open", psicoeducacao: "brain" };

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
  const [visualizando, setVisualizando] = useState(null);

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
    // "avaliacao" (Anamnese, Entrevista Clínica, Rastreamentos DSM-5...)
    // não é ferramenta de biblioteca compartilhada — é questionário
    // individual do paciente, mora na aba Questionários do perfil dele.
    if (aba === "ferramentas" && it.categoria === "avaliacao") return false;
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
            <div className="grade-cartoes-recursos">
              {porCategoria[cat].map((item) => (
                <div key={item.id} className="cartao-recurso" style={{ "--cor-cat": cores.cor, "--bg-cat": cores.bg }}>
                  <div className="cabecalho-cartao-recurso">
                    <div className="icone-cartao-recurso">
                      <Icone nome={ICONE_POR_TIPO[abaAtual.tipo]} tamanho={20} />
                    </div>
                    <div className="titulo-cartao-recurso">{item.titulo || item.nome}</div>
                  </div>
                  {item.descricao && <p className="descricao-cartao-recurso">{item.descricao}</p>}
                  <div className="acoes-cartao-recurso">
                    <button className="botao-secundario" onClick={() => setVisualizando(item)} title="Visualizar">
                      <Icone nome="eye" tamanho={14} /> Visualizar
                    </button>
                    <button className="botao-icone" onClick={() => { setItemEditando(item); setMostrarForm(true); }} title="Editar">
                      <Icone nome="pencil" tamanho={14} />
                    </button>
                    <button className="botao-icone botao-icone-perigo" onClick={() => excluirItem(item)} title="Excluir">
                      <Icone nome="trash-2" tamanho={14} />
                    </button>
                  </div>
                  <button className="botao-primario botao-enviar-recurso" onClick={() => setEnviarItem(item)}>
                    <Icone nome="send" tamanho={14} /> Enviar para paciente
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

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

      {visualizando && (
        <VisualizarRecursoModal item={visualizando} aoFechar={() => setVisualizando(null)} />
      )}
    </div>
  );
}

// Cresce conforme mais ferramentas ganharem componente próprio (ver
// COMPONENTES_FERRAMENTA no app.js do paciente e PREVIEWS_INTERATIVOS
// acima) — precisa das duas listas em sincronia.
const FERRAMENTAS_INTERATIVAS_DISPONIVEIS = [
  { valor: "", rotulo: "Nenhuma — só título, categoria e descrição" },
  { valor: "anxiety-management", rotulo: "Gestão da Ansiedade" },
  { valor: "abc-record", rotulo: "Registro ABC de Pensamentos" },
  { valor: "decision-tree", rotulo: "Árvore da Decisão" },
];

function FormRecurso({ colecao, item, aoFechar }) {
  const [form, setForm] = useState(item || { titulo: "", categoria: "", descricao: "", formularioKey: "" });
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
      if (colecao === "recursos_terapeuticos") {
        dados.formularioKey = form.formularioKey || "";
      }
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

          <label>Descrição <span className="opcional">(opcional — uma frase curta, o passo a passo já fica dentro da ferramenta)</span></label>
          <TextAreaVoz className="campo-descricao" rows={3} value={form.descricao || ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />

          {colecao === "recursos_terapeuticos" && (
            <>
              <label>Tipo de ferramenta interativa <span className="opcional">(se ela já tem uma tela pronta)</span></label>
              <select value={form.formularioKey || ""} onChange={(e) => setForm({ ...form, formularioKey: e.target.value })}>
                {FERRAMENTAS_INTERATIVAS_DISPONIVEIS.map((f) => (
                  <option key={f.valor} value={f.valor}>{f.rotulo}</option>
                ))}
              </select>
            </>
          )}

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

// Preview de verdade — mostra a ferramenta tal como ela vai aparecer
// pro paciente, igual ao modelo ("Visualização do paciente"). Aqui é
// só demonstração: os botões de registrar/salvar nunca gravam nada de
// verdade no banco (não existe um paciente real nessa tela), só
// mostram a mensagem de confirmação. Cada ferramenta interativa
// precisa ser portada uma de cada vez — Gestão da Ansiedade é a
// primeira; as outras ainda caem no aviso "pré-visualização não
// disponível" abaixo.
const PREVIEWS_INTERATIVOS = {
  "anxiety-management": PreviewGestaoAnsiedade,
  "abc-record": PreviewFerramentaABC,
  "decision-tree": PreviewFerramentaArvore,
};

// Itens cadastrados antes de existir o campo "Tipo de ferramenta
// interativa" no formulário não têm formularioKey salvo — por isso
// também reconhecemos pelo título, pra elas ficarem interativas sem
// a psicóloga precisar reabrir e editar cada uma manualmente. Um
// formularioKey salvo de verdade sempre tem prioridade sobre isso.
const TITULO_PARA_FORMULARIO_KEY = {
  "gestão da ansiedade": "anxiety-management",
  "registro abc de pensamentos": "abc-record",
  "árvore da decisão": "decision-tree",
};
function resolverFormularioKey(item) {
  if (item.formularioKey) return item.formularioKey;
  const chave = (item.titulo || item.nome || "").trim().toLowerCase();
  return TITULO_PARA_FORMULARIO_KEY[chave] || null;
}

function VisualizarRecursoModal({ item, aoFechar }) {
  const cores = corDaCategoria(item.categoria);
  const paginas = Array.isArray(item.paginas) ? item.paginas : [];
  const blocos = Array.isArray(item.blocos) ? item.blocos : [];
  const ComponentePreview = PREVIEWS_INTERATIVOS[resolverFormularioKey(item)];
  const temConteudoTexto = !!(item.conteudo || item.passos || item.texto);
  const temAlgumPreview = !!ComponentePreview || paginas.length > 0 || blocos.length > 0 || temConteudoTexto;

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal modal-largo" onClick={(e) => e.stopPropagation()}>
        <span className="etiqueta-categoria-recurso" style={{ "--cor-cat": cores.cor, "--bg-cat": cores.bg }}>
          {formatarCategoria(item.categoria)}
        </span>
        <h3>{item.titulo || item.nome}</h3>

        {item.descricao && !temConteudoTexto && !ComponentePreview && <p className="texto-visualizar-recurso">{item.descricao}</p>}

        <div className="aviso-preview-paciente">
          <Icone nome="eye" tamanho={16} />
          <span><strong>Visualização do paciente</strong> — assim a ferramenta aparecerá na área do paciente.</span>
        </div>

        {ComponentePreview && (
          <div className="cartao-secao"><ComponentePreview /></div>
        )}
        {!ComponentePreview && paginas.length > 0 && <PreviewFabula item={item} />}
        {!ComponentePreview && paginas.length === 0 && blocos.length > 0 && <PreviewBlocosPsicoeducacao item={item} />}
        {!ComponentePreview && paginas.length === 0 && blocos.length === 0 && temConteudoTexto && <PreviewConteudoTexto item={item} />}
        {!temAlgumPreview && (
          <p className="texto-vazio">
            Pré-visualização interativa completa ainda não disponível para esta ferramenta — só os dados
            cadastrados no catálogo por enquanto.
          </p>
        )}

        <div className="acoes-modal">
          <button className="botao-primario" onClick={aoFechar}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Preview: Gestão da Ansiedade ──────────────────────────────────
// Porta fiel da ferramenta real (clinica/app.js, FerramentaGestaoAnsiedade),
// com as 3 abas (Estresse, Tracking, Pensamentos). Diferença de propósito:
// aqui os botões "Registrar"/"Salvar" NUNCA gravam nada no banco — é só
// demonstração pra psicóloga ver como fica pro paciente, sem paciente
// real nessa tela pra vincular o registro.
function PreviewGestaoAnsiedade() {
  const TECNICAS = [
    { id: "resp", label: "Respiração Relaxada", desc: "Inspirar → Pausar → Expirar por 2 min" },
    { id: "visao", label: "Visão Periférica", desc: "Mover os olhos da direita para a esquerda" },
    { id: "musc", label: "Relaxamento Muscular", desc: "Contrair músculos 5s e relaxar com suspiro" },
  ];
  const ATIVIDADES = [
    { id: "caminhada", label: "🚶 Caminhada" },
    { id: "meditacao", label: "🧘 Meditação" },
    { id: "diario", label: "📓 Diário" },
    { id: "musica", label: "🎵 Música" },
    { id: "alongamento", label: "🤸 Alongamento" },
    { id: "agua", label: "💧 Hidratação" },
  ];
  const PERGUNTAS = [
    "Qual situação está me deixando ansioso(a)?",
    "Qual é o meu pensamento ansioso?",
    "Tenho provas reais de que é 100% verdadeiro?",
    "Quais evidências indicam que pode NÃO ser verdadeiro?",
    "Qual a probabilidade real de que o pior aconteça?",
    "O que eu diria a um amigo com esse mesmo pensamento?",
    "Existe uma forma mais útil de ver essa situação?",
    "Preocupar-me está me ajudando ou me machucando?",
  ];
  const DESC_ESTRESSE = { 1: "Em paz.", 2: "Otimista.", 3: "Calmo.", 4: "Confortável.", 5: "Neutro.", 6: "Estressando.", 7: "Estressado.", 8: "Irritado.", 9: "Tenso.", 10: "Em pânico." };

  const [aba, setAba] = useState(0);
  const [stress, setStress] = useState(5);
  const [nota, setNota] = useState("");
  const [track, setTrack] = useState({});
  const [resp, setResp] = useState(Array(8).fill(""));
  const [msg, setMsg] = useState("");

  const corEstresse = stress <= 3 ? "var(--sucesso)" : stress <= 5 ? "#d97706" : stress <= 7 ? "#f97316" : "var(--erro)";

  function confirmar(texto) {
    setMsg("✓ " + texto + " (visualização — nada foi salvo de verdade)");
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div>
      <div className="abas-financeiro">
        {["😰 Estresse", "✅ Tracking", "🧠 Pensamentos"].map((n, i) => (
          <button key={i} className={"aba-financeiro" + (aba === i ? " aba-financeiro-ativa" : "")} onClick={() => setAba(i)}>
            {n}
          </button>
        ))}
      </div>

      {aba === 0 && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: corEstresse, lineHeight: 1 }}>{stress}</div>
            <div style={{ fontSize: 12, color: "var(--texto-suave)" }}>/10</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: corEstresse }}>{DESC_ESTRESSE[stress]}</div>
          </div>
          <input type="range" min={1} max={10} value={stress} onChange={(e) => setStress(+e.target.value)} style={{ width: "100%", accentColor: corEstresse, marginBottom: 14 }} />
          <TextAreaVoz className="campo-descricao" rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Observações..." />
          <button className="botao-primario" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} onClick={() => { setNota(""); confirmar("Registrado!"); }}>
            {msg || "Registrar"}
          </button>
        </div>
      )}

      {aba === 1 && (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: "var(--cor-marca)" }}>Técnicas Anti-Ansiedade</div>
          {TECNICAS.map((t) => (
            <div
              key={t.id}
              className={"item-selecao-servico" + (track[t.id] ? " item-selecao-ativo" : "")}
              style={{ marginBottom: 8, justifyContent: "flex-start", gap: 10 }}
              onClick={() => setTrack((tr) => ({ ...tr, [t.id]: !tr[t.id] }))}
            >
              <span>{track[t.id] ? "✅" : "⭕"}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: "var(--texto-suave)" }}>{t.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ fontWeight: 600, fontSize: 13, margin: "14px 0 10px", color: "var(--cor-marca)" }}>Atividades</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ATIVIDADES.map((a) => (
              <div
                key={a.id}
                className={"item-selecao-servico" + (track[a.id] ? " item-selecao-ativo" : "")}
                style={{ justifyContent: "center" }}
                onClick={() => setTrack((tr) => ({ ...tr, [a.id]: !tr[a.id] }))}
              >
                {a.label}
              </div>
            ))}
          </div>
          <button className="botao-primario" style={{ width: "100%", justifyContent: "center", marginTop: 14 }} onClick={() => { setTrack({}); confirmar("Tracking salvo!"); }}>
            {msg || "Salvar tracking do dia"}
          </button>
        </div>
      )}

      {aba === 2 && (
        <div>
          <p className="texto-vazio" style={{ marginBottom: 14 }}>Responda cada pergunta com honestidade para questionar pensamentos ansiosos.</p>
          {PERGUNTAS.map((p, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{i + 1}. {p}</label>
              <TextAreaVoz
                className="campo-descricao"
                rows={2}
                value={resp[i]}
                onChange={(e) => { const r = [...resp]; r[i] = e.target.value; setResp(r); }}
                placeholder="Sua resposta..."
              />
            </div>
          ))}
          <button className="botao-primario" style={{ width: "100%", justifyContent: "center" }} onClick={() => { setResp(Array(8).fill("")); confirmar("Salvo!"); }}>
            {msg || "Salvar respostas"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Preview: Registro ABC de Pensamentos ───────────────────────
// Porta fiel da ferramenta real (clinica/app.js, FerramentaABC): 4
// passos (Situação, Pensamento, Emoção, Resposta Racional) com barra
// de progresso. Aqui não grava nada — mesmo espírito do preview de
// Gestão da Ansiedade acima.
function PreviewFerramentaABC() {
  const EMOCOES = ["Ansiedade", "Tristeza", "Raiva", "Medo", "Vergonha", "Culpa", "Frustração", "Insegurança", "Alívio", "Esperança"];
  const PASSOS_INFO = [
    { n: 1, letra: "A", titulo: "Situação", subtitulo: "O que aconteceu?", dica: "Descreva a situação de forma objetiva — onde estava, com quem, o que aconteceu. Sem interpretações ainda.", placeholder: "Ex: Meu chefe me chamou para uma conversa inesperada..." },
    { n: 2, letra: "B", titulo: "Pensamento Automático", subtitulo: "O que passou pela sua cabeça?", dica: "Escreva exatamente como o pensamento veio à mente, sem filtrar.", placeholder: "Ex: Vou ser demitido(a), eu fiz tudo errado..." },
    { n: 3, letra: "C", titulo: "Emoção e Intensidade", subtitulo: "O que você sentiu?", dica: "Escolha a emoção mais próxima e avalie a intensidade dela." },
    { n: 4, letra: "D", titulo: "Resposta Racional", subtitulo: "O que a razão diz?", dica: "Questione o pensamento: há evidências reais? Existe outra forma de ver essa situação?", placeholder: "Ex: Não tenho provas de que serei demitido(a); posso perguntar diretamente..." },
  ];

  const [passo, setPasso] = useState(1);
  const [draft, setDraft] = useState({ situacao: "", pensamento: "", emocao: "", intensidade: 60, alternativo: "" });
  const [msg, setMsg] = useState("");

  const passoInfo = PASSOS_INFO[passo - 1];
  const podeAvancar =
    (passo === 1 && draft.situacao.trim()) ||
    (passo === 2 && draft.pensamento.trim()) ||
    (passo === 3 && draft.emocao) ||
    (passo === 4 && draft.alternativo.trim());

  function confirmar(texto) {
    setMsg("✓ " + texto + " (visualização — nada foi salvo de verdade)");
  }

  if (passo === 5) {
    return (
      <div className="cartao-secao" style={{ textAlign: "center" }}>
        <Icone nome="check-circle-2" tamanho={32} />
        <h3 style={{ margin: "10px 0 4px" }}>Registro concluído</h3>
        <p className="texto-vazio">{msg}</p>
        <button className="botao-secundario" style={{ marginTop: 10 }} onClick={() => { setDraft({ situacao: "", pensamento: "", emocao: "", intensidade: 60, alternativo: "" }); setPasso(1); setMsg(""); }}>
          <Icone nome="rotate-ccw" tamanho={14} /> Recomeçar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {PASSOS_INFO.map((p) => (
          <div key={p.n} style={{ flex: 1, height: 5, borderRadius: 20, background: p.n <= passo ? "var(--cor-marca)" : "#EADDFC" }} />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EADDFC", color: "var(--cor-marca)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{passoInfo.letra}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{passoInfo.titulo}</div>
          <div style={{ fontSize: 12.5, color: "var(--texto-suave)" }}>{passoInfo.subtitulo}</div>
        </div>
      </div>

      {passoInfo.dica && (
        <p style={{ fontSize: 12.5, color: "var(--texto-suave)", background: "#F9FAFB", borderRadius: 8, padding: "8px 10px", margin: "10px 0" }}>{passoInfo.dica}</p>
      )}

      {passo === 1 && <TextAreaVoz className="campo-descricao" rows={4} value={draft.situacao} onChange={(e) => setDraft((d) => ({ ...d, situacao: e.target.value }))} placeholder={passoInfo.placeholder} />}
      {passo === 2 && <TextAreaVoz className="campo-descricao" rows={4} value={draft.pensamento} onChange={(e) => setDraft((d) => ({ ...d, pensamento: e.target.value }))} placeholder={passoInfo.placeholder} />}
      {passo === 3 && (
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {EMOCOES.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, emocao: em }))}
                style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid", borderColor: draft.emocao === em ? "var(--cor-marca)" : "#E5E7EB", background: draft.emocao === em ? "var(--cor-marca)" : "white", color: draft.emocao === em ? "white" : "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                {em}
              </button>
            ))}
          </div>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Intensidade: {draft.intensidade}/100</label>
          <input type="range" min={0} max={100} value={draft.intensidade} onChange={(e) => setDraft((d) => ({ ...d, intensidade: +e.target.value }))} style={{ width: "100%", accentColor: "var(--cor-marca)" }} />
        </div>
      )}
      {passo === 4 && <TextAreaVoz className="campo-descricao" rows={4} value={draft.alternativo} onChange={(e) => setDraft((d) => ({ ...d, alternativo: e.target.value }))} placeholder={passoInfo.placeholder} />}

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="botao-secundario" style={{ flex: 1 }} disabled={passo === 1} onClick={() => setPasso((p) => p - 1)}>
          <Icone nome="arrow-left" tamanho={14} /> Anterior
        </button>
        {passo < 4 ? (
          <button className="botao-primario" style={{ flex: 2, justifyContent: "center" }} disabled={!podeAvancar} onClick={() => setPasso((p) => p + 1)}>
            Próximo <Icone nome="arrow-right" tamanho={14} />
          </button>
        ) : (
          <button className="botao-primario" style={{ flex: 2, justifyContent: "center" }} disabled={!podeAvancar} onClick={() => { confirmar("Registro concluído!"); setPasso(5); }}>
            <Icone nome="check" tamanho={14} /> Salvar registro
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Preview: Árvore da Decisão ──────────────────────────────────
// Porta fiel da ferramenta real (clinica/app.js, FerramentaArvore):
// árvore de decisão ramificada (cada resposta leva a uma tela
// diferente), não um wizard linear. Sem gravação — só demonstração.
function PreviewFerramentaArvore() {
  const [step, setStep] = useState("home");
  const [preocupacao, setPreocupacao] = useState("");
  const [acoes, setAcoes] = useState("");
  const [plano, setPlano] = useState("");
  const [conclusao, setConclusao] = useState(null);

  const TEXTO_CONCLUSAO = {
    redirect: { icone: "wind", titulo: "Solte essa preocupação", texto: "Isso não está sob seu controle agora. Tente redirecionar sua atenção para algo que você pode influenciar." },
    "act-now": { icone: "zap", titulo: "Ótimo, você pode agir agora", texto: "Você já sabe o que fazer — coloque em prática assim que possível." },
    plan: { icone: "calendar-check", titulo: "Você tem um plano", texto: "Nem tudo precisa ser resolvido agora. Ter um plano já reduz a ansiedade." },
  };

  function concluir(c) {
    setConclusao(c);
    setStep("conclusao");
  }

  function recomecar() {
    setPreocupacao(""); setAcoes(""); setPlano(""); setConclusao(null); setStep("home");
  }

  if (step === "conclusao" && conclusao) {
    const info = TEXTO_CONCLUSAO[conclusao];
    return (
      <div className="cartao-secao" style={{ textAlign: "center" }}>
        <Icone nome={info.icone} tamanho={30} />
        <h3 style={{ margin: "10px 0 4px" }}>{info.titulo}</h3>
        <p className="texto-vazio">{info.texto}</p>
        <p className="texto-vazio" style={{ fontSize: 11 }}>(visualização — nada foi salvo de verdade)</p>
        <button className="botao-secundario" style={{ marginTop: 10 }} onClick={recomecar}>
          <Icone nome="rotate-ccw" tamanho={14} /> Recomeçar
        </button>
      </div>
    );
  }

  return (
    <div>
      {step === "home" && (
        <div>
          <label style={{ fontWeight: 600, fontSize: 13 }}>O que está te preocupando?</label>
          <TextAreaVoz className="campo-descricao" rows={3} value={preocupacao} onChange={(e) => setPreocupacao(e.target.value)} placeholder="Descreva a preocupação..." />
          <button className="botao-primario" style={{ marginTop: 12, justifyContent: "center" }} disabled={!preocupacao.trim()} onClick={() => setStep("can-intervene")}>
            Continuar <Icone nome="arrow-right" tamanho={14} />
          </button>
        </div>
      )}
      {step === "can-intervene" && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Você pode fazer algo para resolver esta preocupação?</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="botao-primario" style={{ flex: 1, justifyContent: "center" }} onClick={() => setStep("actions")}>
              <Icone nome="check" tamanho={14} /> Sim, posso agir
            </button>
            <button className="botao-secundario" style={{ flex: 1, justifyContent: "center" }} onClick={() => concluir("redirect")}>
              <Icone nome="x" tamanho={14} /> Não está no meu controle
            </button>
          </div>
        </div>
      )}
      {step === "actions" && (
        <div>
          <label style={{ fontWeight: 600, fontSize: 13 }}>O que você pode fazer a respeito?</label>
          <TextAreaVoz className="campo-descricao" rows={3} value={acoes} onChange={(e) => setAcoes(e.target.value)} placeholder="Liste as ações possíveis..." />
          <button className="botao-primario" style={{ marginTop: 12, justifyContent: "center" }} disabled={!acoes.trim()} onClick={() => setStep("can-act-now")}>
            Continuar <Icone nome="arrow-right" tamanho={14} />
          </button>
        </div>
      )}
      {step === "can-act-now" && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Você pode agir agora mesmo?</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="botao-primario" style={{ flex: 1, justifyContent: "center" }} onClick={() => concluir("act-now")}>
              <Icone nome="zap" tamanho={14} /> Sim, agora
            </button>
            <button className="botao-secundario" style={{ flex: 1, justifyContent: "center" }} onClick={() => setStep("plan")}>
              <Icone nome="calendar" tamanho={14} /> Preciso planejar
            </button>
          </div>
        </div>
      )}
      {step === "plan" && (
        <div>
          <label style={{ fontWeight: 600, fontSize: 13 }}>Quando e como você vai agir?</label>
          <TextAreaVoz className="campo-descricao" rows={3} value={plano} onChange={(e) => setPlano(e.target.value)} placeholder="Ex: Vou conversar com meu chefe na sexta-feira..." />
          <button className="botao-primario" style={{ marginTop: 12, justifyContent: "center" }} disabled={!plano.trim()} onClick={() => concluir("plan")}>
            <Icone nome="check" tamanho={14} /> Concluir
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Preview: Fábula (página por página) ────────────────────────
// Porta fiel do leitor de fábulas real (clinica/app.js, trecho
// "Fábulas com campo paginas"). Passa as páginas uma a uma com barra
// de progresso, mostra a moral e as perguntas de reflexão na última
// página — sem gravar nada de verdade (mesmo motivo do preview de
// Gestão da Ansiedade: não existe paciente real nessa tela).
function PreviewFabula({ item }) {
  const paginas = Array.isArray(item.paginas) ? item.paginas : [];
  const perguntas = Array.isArray(item.perguntas) ? item.perguntas : [];
  const [idx, setIdx] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [msg, setMsg] = useState("");

  if (paginas.length === 0) return null;
  const pagina = paginas[idx];
  const textoPagina = typeof pagina === "string" ? pagina : pagina?.texto || "";
  const pct = Math.round(((idx + 1) / paginas.length) * 100);
  const concluido = idx === paginas.length - 1;

  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 5, background: "var(--marca-plataforma-lavanda)", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: "var(--cor-marca)", borderRadius: 20, transition: "width .4s ease" }} />
        </div>
        <span style={{ fontSize: 12, color: "var(--cor-marca)", fontWeight: 700, flexShrink: 0 }}>{idx + 1}/{paginas.length}</span>
      </div>

      <div style={{ background: "linear-gradient(145deg, var(--cor-marca-escura), var(--cor-marca))", borderRadius: 20, padding: "32px 26px", minHeight: 170, marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 18, color: "white", lineHeight: 1.9, textAlign: "center", fontStyle: "italic", margin: 0 }}>{textoPagina}</p>
      </div>

      {concluido && item.moral && (
        <div className="cartao-secao">
          <strong>Moral da história</strong>
          <p className="texto-visualizar-recurso">{item.moral}</p>
        </div>
      )}

      {concluido && perguntas.length > 0 && (
        <div className="cartao-secao">
          <strong>💭 Para Refletir</strong>
          {perguntas.map((p, i) => (
            <div key={i} style={{ marginTop: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{i + 1}. {p}</label>
              <TextAreaVoz
                className="campo-descricao"
                rows={2}
                value={respostas[i] || ""}
                onChange={(e) => setRespostas((r) => ({ ...r, [i]: e.target.value }))}
                placeholder="Escreva sua reflexão..."
              />
            </div>
          ))}
          <button
            className="botao-primario"
            style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
            onClick={() => { setMsg("✓ Reflexões salvas! (visualização — nada foi salvo de verdade)"); setTimeout(() => setMsg(""), 3000); }}
          >
            {msg || "Salvar minhas reflexões"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button className="botao-secundario" style={{ flex: 1 }} disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
          ← Anterior
        </button>
        {!concluido ? (
          <button className="botao-primario" style={{ flex: 2, justifyContent: "center" }} onClick={() => setIdx((i) => Math.min(paginas.length - 1, i + 1))}>
            Próxima página →
          </button>
        ) : (
          <button className="botao-primario" style={{ flex: 2, justifyContent: "center" }} onClick={() => setIdx(0)}>
            ✅ Concluído — Reler
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Preview: blocos de Psicoeducação ────────────────────────────
// O sistema real tem um "construtor" de conteúdo por blocos (banner,
// texto, card, lista, pergunta, checklist, gráficos...). Aqui cobrimos
// os tipos mais comuns; um tipo ainda não coberto aparece identificado
// em vez de simplesmente sumir, pra ficar claro o que falta portar.
function PreviewBlocosPsicoeducacao({ item }) {
  const blocos = Array.isArray(item.blocos) ? item.blocos : [];
  if (blocos.length === 0) return null;

  return (
    <div>
      {blocos.map((b, i) => {
        switch (b.tipo) {
          case "banner":
            return (
              <div key={i} style={{ background: b.cor || "var(--cor-marca)", borderRadius: 12, padding: 20, marginBottom: 14, color: "white", textAlign: "center" }}>
                {b.emoji && <div style={{ fontSize: 32, marginBottom: 6 }}>{b.emoji}</div>}
                <div style={{ fontWeight: 700, fontSize: 16 }}>{b.titulo}</div>
              </div>
            );
          case "texto":
            return <p key={i} className="texto-visualizar-recurso" style={{ marginBottom: 14 }}>{b.conteudo}</p>;
          case "card":
            return (
              <div key={i} className="cartao-secao" style={{ marginBottom: 12 }}>
                {b.icone && <div style={{ fontSize: 22, marginBottom: 4 }}>{b.icone}</div>}
                <strong>{b.titulo}</strong>
                <p className="texto-visualizar-recurso">{b.texto}</p>
              </div>
            );
          case "lista":
            return (
              <ul key={i} style={{ marginBottom: 14, paddingLeft: 20 }}>
                {(b.itens || []).map((it, j) => <li key={j} className="texto-visualizar-recurso">{it}</li>)}
              </ul>
            );
          case "checklist":
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                {b.titulo && <strong style={{ display: "block", marginBottom: 8 }}>{b.titulo}</strong>}
                {(b.itens || []).map((it, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <input type="checkbox" disabled /> <span className="texto-visualizar-recurso">{it}</span>
                  </div>
                ))}
              </div>
            );
          case "pergunta":
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{b.pergunta}</label>
                <textarea className="campo-descricao" rows={2} placeholder={b.placeholder || "Escreva aqui..."} readOnly />
              </div>
            );
          default:
            return (
              <p key={i} className="texto-vazio" style={{ marginBottom: 14 }}>
                [bloco do tipo "{b.tipo}" ainda não tem pré-visualização própria]
              </p>
            );
        }
      })}
    </div>
  );
}

// ─── Preview: conteúdo simples em texto ──────────────────────────
// Cobre o formato mais antigo/simples de ferramenta ou psicoeducação:
// só um texto corrido (campo conteudo/passos/texto), com a descrição
// como "objetivo" em destaque quando existir.
function PreviewConteudoTexto({ item }) {
  const conteudo = item.conteudo || item.passos || item.texto || "";
  if (!conteudo) return null;
  return (
    <div>
      {item.descricao && (
        <div className="aviso-preview-paciente" style={{ display: "block" }}>
          <strong>🎯 Objetivo</strong>
          <p style={{ margin: "4px 0 0" }}>{item.descricao}</p>
        </div>
      )}
      <p className="texto-visualizar-recurso" style={{ whiteSpace: "pre-wrap" }}>{conteudo}</p>
    </div>
  );
}
