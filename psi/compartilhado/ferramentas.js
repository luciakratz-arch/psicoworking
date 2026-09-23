// ═══════════════════════════════════════════════════════════════
//  FERRAMENTAS TERAPÊUTICAS — arquivo compartilhado
//
//  Estes componentes são usados em DOIS lugares:
//    1. psi/paciente/  — Portal do Paciente (paciente logado)
//    2. psi/atividade/ — página pública aberta por link (sem login),
//       usada quando a psicóloga manda a atividade por WhatsApp
//
//  Por isso aqui não pode existir nada que dependa de login: as
//  ferramentas só conversam com o banco através do objeto global
//  `db`, e cada página decide o que esse `db` é de verdade:
//    - no Portal, é o Firestore normal;
//    - na página pública, é um adaptador que grava through de uma
//      Cloud Function (o visitante não tem login pra gravar direto).
//  É isso que permite a MESMA ferramenta funcionar nos dois lugares
//  sem código duplicado.
// ═══════════════════════════════════════════════════════════════

const { useState, useEffect, useRef } = React;

function Icone({ nome, tamanho = 16 }) {
  // Sem array de dependências, isso rodava a cada re-render de CADA
  // ícone da tela — e window.lucide.createIcons() escaneia o
  // documento inteiro toda vez que é chamado, deixando qualquer tela
  // com muitos ícones (Recursos Terapêuticos, blocos interativos)
  // pesada a cada digitação. Só precisa rodar de novo se o nome do
  // ícone mudar.
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [nome]);
  return <i data-lucide={nome} className="icone-lucide" style={{ width: tamanho, height: tamanho }}></i>;
}

// Campo de texto com ditado por voz — mesmo componente usado em todo
// o admin (app_core.js). Regra permanente: todo campo de texto livre
// no PsiCoWorking tem esse microfone, nunca um <textarea> cru (ver
// memória "Padrão de UI PsiCoWorking"). Arquivo separado do admin,
// sem escopo compartilhado, por isso a mesma lógica é duplicada aqui.
function TextAreaVoz({ value, onChange, rows, placeholder }) {
  const [gravando, setGravando] = useState(false);
  const reconhecimentoRef = useRef(null);
  const temSuporte = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  function alternarGravacao() {
    if (gravando) {
      reconhecimentoRef.current?.stop();
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let textoNovo = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) textoNovo += e.results[i][0].transcript;
      }
      if (textoNovo) {
        onChange({ target: { value: (value ? value + " " : "") + textoNovo } });
      }
    };
    rec.onend = () => setGravando(false);
    rec.start();
    reconhecimentoRef.current = rec;
    setGravando(true);
  }

  return (
    <div className="campo-com-mic">
      <textarea rows={rows} placeholder={placeholder} value={value} onChange={onChange} />
      {temSuporte && (
        <button type="button" className={"botao-mic" + (gravando ? " botao-mic-gravando" : "")} onClick={alternarGravacao} title="Falar em vez de digitar">
          <Icone nome={gravando ? "square" : "mic"} tamanho={14} />
        </button>
      )}
    </div>
  );
}

// Cada ferramenta interativa tem seu próprio componente (mesmo padrão
// do app de referência: dispatcher por formularioKey). Uma ferramenta
// sem componente próprio ainda cai nos fallbacks (fábula/blocos/texto)
// logo abaixo — é assim que ela nasce simples e vai virando interativa.
const COMPONENTES_FERRAMENTA = {
  "anxiety-management": FerramentaGestaoAnsiedade,
  "abc-record": FerramentaABC,
  "decision-tree": FerramentaArvore,
  "roda-vida-integral": FerramentaRodaVida,
  "breathing-478": FerramentaRespiracao,
  "muscle-relaxation": FerramentaRelaxamento,
  "emotional-eating": FerramentaRastreamento,
  "treino-neuro-auditivo": FerramentaTreino,
  "baralho-distorcoes": FerramentaBaralhoDistorcoes,
};

// Itens cadastrados antes de existir o campo "Tipo de ferramenta
// interativa" no admin não têm formularioKey salvo — reconhecemos
// pelo título também, pra virarem interativas sem a psicóloga
// precisar editar cada uma. Um formularioKey salvo de verdade sempre
// tem prioridade (mesma lista em psi/admin/app_recursos.js).
const TITULO_PARA_FORMULARIO_KEY = {
  "gestão da ansiedade": "anxiety-management",
  "registro abc de pensamentos": "abc-record",
  "árvore da decisão": "decision-tree",
  "roda da vida integral": "roda-vida-integral",
  "técnica de respiração 4-7-8": "breathing-478",
  "relaxamento muscular progressivo": "muscle-relaxation",
  "rastreamento emocional da alimentação": "emotional-eating",
  "treino neuro-auditivo": "treino-neuro-auditivo",
  "baralho das distorções cognitivas": "baralho-distorcoes",
};
function resolverFormularioKey(item) {
  if (item.formularioKey) return item.formularioKey;
  const chave = (item.titulo || item.nome || "").trim().toLowerCase();
  return TITULO_PARA_FORMULARIO_KEY[chave] || null;
}

function DetalheRecurso({ item, usuario, paciente, aoVoltar }) {
  const paginas = Array.isArray(item.paginas) ? item.paginas : [];
  const blocos = Array.isArray(item.blocos) ? item.blocos : [];
  const ComponenteFerramenta = COMPONENTES_FERRAMENTA[resolverFormularioKey(item)];

  return (
    <div>
      <button className="botao-voltar" onClick={aoVoltar}>
        <Icone nome="arrow-left" tamanho={15} /> Voltar para Recursos
      </button>
      <div className="cartao">
        <h2 style={{ margin: "0 0 6px" }}>{item.titulo || item.nome}</h2>

        {ComponenteFerramenta && (
          <ComponenteFerramenta usuario={usuario} paciente={paciente} recurso={item} />
        )}
        {!ComponenteFerramenta && paginas.length > 0 && (
          <LeitorFabula usuario={usuario} paciente={paciente} recurso={item} />
        )}
        {!ComponenteFerramenta && paginas.length === 0 && blocos.length > 0 && (
          <VisualizadorBlocos blocos={blocos} usuario={usuario} paciente={paciente} recurso={item} />
        )}
        {!ComponenteFerramenta && paginas.length === 0 && blocos.length === 0 && (
          <LeitorConteudo item={item} />
        )}
      </div>
    </div>
  );
}

// Fallback universal pra qualquer ferramenta sem componente próprio
// ainda — porta fiel do fallback do app de referência (clinica/app.js,
// FerramentaPortal): divide o campo conteudo/passos por linha em
// branco e mostra um "slide" de cada vez, com barra de progresso, em
// vez de despejar tudo como um parágrafo só. Cobre a maioria das
// ferramentas do catálogo que ainda não ganharam componente dedicado.
function LeitorConteudo({ item }) {
  const conteudo = item.conteudo || item.passos || item.texto || "";
  const objetivo = item.objetivo || item.descricao || "";
  const slides = conteudo.split("\n\n").map((p) => p.trim()).filter((p) => p.length > 2);
  const [idx, setIdx] = useState(0);

  if (slides.length === 0) {
    if (!objetivo) {
      return (
        <div style={{ textAlign: "center", padding: "36px 20px" }}>
          <Icone nome="wrench" tamanho={40} />
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--cor-marca)", margin: "10px 0 8px" }}>Em desenvolvimento</div>
          <p className="texto-vazio-p" style={{ maxWidth: 280, margin: "0 auto" }}>
            Esta ferramenta está sendo preparada especialmente para você. Em breve estará disponível nesta área.
          </p>
        </div>
      );
    }
    return (
      <div style={{ background: "#F3E6FF", borderRadius: 10, padding: "14px 16px", border: "1px solid #EADDFC" }}>
        <div style={{ fontWeight: 700, fontSize: 12, color: "var(--cor-marca)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 6 }}>
          <Icone nome="target" tamanho={13} /> Objetivo
        </div>
        <div style={{ fontSize: 13, color: "#3D006A", lineHeight: 1.7 }}>{objetivo}</div>
      </div>
    );
  }

  const atual = slides[idx];
  const linhas = atual.split("\n");
  const titulo = linhas[0];
  const corpo = linhas.slice(1).join("\n").trim();
  const pct = Math.round(((idx + 1) / slides.length) * 100);
  const concluido = idx === slides.length - 1;

  return (
    <div>
      {objetivo && (
        <div style={{ background: "#F3E6FF", borderRadius: 10, padding: "14px 16px", marginBottom: 20, border: "1px solid #EADDFC" }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "var(--cor-marca)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 6 }}>
            <Icone nome="target" tamanho={13} /> Objetivo
          </div>
          <div style={{ fontSize: 13, color: "#3D006A", lineHeight: 1.7 }}>{objetivo}</div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{idx + 1} de {slides.length}</span>
        <span style={{ fontSize: 11, color: "var(--cor-marca)", fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: "#F3E6FF", borderRadius: 20, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: "var(--cor-marca)", borderRadius: 20, transition: "width .3s" }} />
      </div>
      <div style={{ background: "white", border: "1px solid #EADDFC", borderRadius: 16, padding: "22px 18px", minHeight: 150, marginBottom: 20, borderLeft: "4px solid var(--cor-marca)" }}>
        {titulo && <div style={{ fontWeight: 700, fontSize: 15, color: "var(--cor-marca)", marginBottom: corpo ? 12 : 0, lineHeight: 1.5 }}>{titulo}</div>}
        {corpo && <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{corpo}</div>}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="botao-secundario-p" style={{ flex: 1 }} disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
          <Icone nome="arrow-left" tamanho={14} /> Anterior
        </button>
        {!concluido ? (
          <button className="botao-primario-p" style={{ flex: 2 }} onClick={() => setIdx((i) => Math.min(slides.length - 1, i + 1))}>
            Próximo <Icone nome="arrow-right" tamanho={14} />
          </button>
        ) : (
          <button className="botao-primario-p" style={{ flex: 2, background: "#059669" }} onClick={() => setIdx(0)}>
            <Icone nome="check-circle-2" tamanho={14} /> Concluído — Recomeçar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Ferramenta: Gestão da Ansiedade (grava de verdade) ─────────
function FerramentaGestaoAnsiedade({ usuario, paciente, recurso }) {
  const TECNICAS = [
    { id: "resp", label: "Respiração Relaxada", desc: "Inspirar → Pausar → Expirar por 2 min" },
    { id: "visao", label: "Visão Periférica", desc: "Mover os olhos da direita para a esquerda" },
    { id: "musc", label: "Relaxamento Muscular", desc: "Contrair músculos 5s e relaxar com suspiro" },
  ];
  const ATIVIDADES = [
    { id: "caminhada", label: "Caminhada", icone: "footprints" }, { id: "meditacao", label: "Meditação", icone: "flower-2" },
    { id: "diario", label: "Diário", icone: "book-open" }, { id: "musica", label: "Música", icone: "music" },
    { id: "alongamento", label: "Alongamento", icone: "stretch-horizontal" }, { id: "agua", label: "Hidratação", icone: "droplet" },
  ];
  const PERGUNTAS = [
    "Qual situação está me deixando ansioso(a)?", "Qual é o meu pensamento ansioso?",
    "Tenho provas reais de que é 100% verdadeiro?", "Quais evidências indicam que pode NÃO ser verdadeiro?",
    "Qual a probabilidade real de que o pior aconteça?", "O que eu diria a um amigo com esse mesmo pensamento?",
    "Existe uma forma mais útil de ver essa situação?", "Preocupar-me está me ajudando ou me machucando?",
  ];
  const DESC_ESTRESSE = { 1: "Em paz.", 2: "Otimista.", 3: "Calmo.", 4: "Confortável.", 5: "Neutro.", 6: "Estressando.", 7: "Estressado.", 8: "Irritado.", 9: "Tenso.", 10: "Em pânico." };

  const [aba, setAba] = useState(0);
  const [stress, setStress] = useState(5);
  const [nota, setNota] = useState("");
  const [track, setTrack] = useState({});
  const [resp, setResp] = useState(Array(8).fill(""));
  const [msg, setMsg] = useState("");
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    db.collection("clinica_gestao_ansiedade")
      .where("pacienteId", "==", usuario.uid)
      .where("tipo", "==", "estresse")
      .get()
      .then((snap) => {
        const docs = snap.docs.map((d) => d.data()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setHistorico(docs.slice(0, 5));
      })
      .catch(() => {});
  }, [usuario.uid]);

  const corEstresse = stress <= 3 ? "#059669" : stress <= 5 ? "#d97706" : stress <= 7 ? "#f97316" : "#dc2626";

  async function registrarEstresse() {
    setMsg("Salvando...");
    try {
      await db.collection("clinica_gestao_ansiedade").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        tipo: "estresse", nivel: stress, nota,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setHistorico((h) => [{ nivel: stress, nota, data: new Date().toLocaleDateString("pt-BR") }, ...h].slice(0, 5));
      setNota("");
      setMsg("Registrado!");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    }
  }

  async function salvarTracking() {
    const feitos = [...TECNICAS, ...ATIVIDADES].filter((x) => track[x.id]).map((x) => x.label);
    if (feitos.length === 0) { alert("Marque pelo menos uma técnica ou atividade."); return; }
    setMsg("Salvando...");
    try {
      await db.collection("clinica_gestao_ansiedade").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        tipo: "tracking", itens: feitos,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setTrack({});
      setMsg("Tracking salvo!");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    }
  }

  async function salvarPensamentos() {
    if (!resp.some((r) => r.trim())) { alert("Responda pelo menos uma pergunta antes de salvar."); return; }
    setMsg("Salvando...");
    try {
      await db.collection("clinica_tcc").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        origem: "gestao-ansiedade",
        registros: PERGUNTAS.map((p, i) => ({ pergunta: p, resposta: resp[i] || "" })),
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setResp(Array(8).fill(""));
      setMsg("Salvo!");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    }
  }

  return (
    <div>
      <div className="nav-abas" style={{ background: "none", padding: 0, marginBottom: 16 }}>
        {[
          { rotulo: "Estresse", icone: "gauge" },
          { rotulo: "Tracking", icone: "list-checks" },
          { rotulo: "Pensamentos", icone: "brain" },
        ].map((a, i) => (
          <button key={i} className={"nav-aba" + (aba === i ? " nav-aba-ativa" : "")} onClick={() => setAba(i)}>
            <Icone nome={a.icone} tamanho={14} /> {a.rotulo}
          </button>
        ))}
      </div>

      {aba === 0 && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: corEstresse, lineHeight: 1 }}>{stress}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>/10</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: corEstresse }}>{DESC_ESTRESSE[stress]}</div>
          </div>
          <input type="range" min={1} max={10} value={stress} onChange={(e) => setStress(+e.target.value)} style={{ width: "100%", accentColor: corEstresse, marginBottom: 14 }} />
          <TextAreaVoz rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Observações..." />
          <button className="botao-primario-p" style={{ marginTop: 10 }} onClick={registrarEstresse}>{msg || "Registrar"}</button>

          {historico.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {historico.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "8px 10px", background: "#F9FAFB", borderRadius: 8, marginBottom: 6, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 700, color: corEstresse }}>{h.nivel}/10</span>
                  <span style={{ flex: 1, color: "#6B7280" }}>{h.nota || "—"}</span>
                  <span style={{ color: "#9CA3AF" }}>{h.data}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === 1 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "var(--cor-marca)" }}>Técnicas Anti-Ansiedade</div>
          {TECNICAS.map((t) => (
            <div
              key={t.id}
              onClick={() => setTrack((tr) => ({ ...tr, [t.id]: !tr[t.id] }))}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: "1.5px solid", borderColor: track[t.id] ? "var(--cor-marca)" : "#E5E7EB", background: track[t.id] ? "#EADDFC" : "white", cursor: "pointer", marginBottom: 8 }}
            >
              <Icone nome={track[t.id] ? "check-circle-2" : "circle"} tamanho={18} />
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div><div style={{ fontSize: 12, color: "#6B7280" }}>{t.desc}</div></div>
            </div>
          ))}
          <div style={{ fontWeight: 700, fontSize: 13, margin: "14px 0 10px", color: "var(--cor-marca)" }}>Atividades</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ATIVIDADES.map((a) => (
              <div
                key={a.id}
                onClick={() => setTrack((tr) => ({ ...tr, [a.id]: !tr[a.id] }))}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, borderRadius: 10, border: "1.5px solid", borderColor: track[a.id] ? "var(--cor-marca)" : "#E5E7EB", background: track[a.id] ? "#EADDFC" : "white", cursor: "pointer", fontSize: 12, textAlign: "center", fontWeight: track[a.id] ? 600 : 400 }}
              >
                <Icone nome={a.icone} tamanho={14} /> {a.label}
              </div>
            ))}
          </div>
          <button className="botao-primario-p" style={{ marginTop: 14 }} onClick={salvarTracking}>{msg || "Salvar tracking do dia"}</button>
        </div>
      )}

      {aba === 2 && (
        <div>
          <p className="texto-vazio-p" style={{ marginBottom: 14 }}>Responda cada pergunta com honestidade para questionar pensamentos ansiosos.</p>
          {PERGUNTAS.map((p, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>{i + 1}. {p}</label>
              <TextAreaVoz rows={2} value={resp[i]} onChange={(e) => { const r = [...resp]; r[i] = e.target.value; setResp(r); }} placeholder="Sua resposta..." />
            </div>
          ))}
          <button className="botao-primario-p" onClick={salvarPensamentos}>{msg || "Salvar respostas"}</button>
        </div>
      )}
    </div>
  );
}

// ─── Ferramenta: Registro ABC de Pensamentos (grava de verdade) ─
function FerramentaABC({ usuario, paciente, recurso }) {
  const EMOCOES = ["Ansiedade", "Tristeza", "Raiva", "Medo", "Vergonha", "Culpa", "Frustração", "Insegurança", "Alívio", "Esperança"];
  const PASSOS_INFO = [
    { n: 1, letra: "A", titulo: "Situação", subtitulo: "O que aconteceu?", dica: "Descreva a situação de forma objetiva — onde estava, com quem, o que aconteceu. Sem interpretações ainda.", placeholder: "Ex: Meu chefe me chamou para uma conversa inesperada..." },
    { n: 2, letra: "B", titulo: "Pensamento Automático", subtitulo: "O que passou pela sua cabeça?", dica: "Escreva exatamente como o pensamento veio à mente, sem filtrar.", placeholder: "Ex: Vou ser demitido(a), eu fiz tudo errado..." },
    { n: 3, letra: "C", titulo: "Emoção e Intensidade", subtitulo: "O que você sentiu?", dica: "Escolha a emoção mais próxima e avalie a intensidade dela." },
    { n: 4, letra: "D", titulo: "Resposta Racional", subtitulo: "O que a razão diz?", dica: "Questione o pensamento: há evidências reais? Existe outra forma de ver essa situação?", placeholder: "Ex: Não tenho provas de que serei demitido(a); posso perguntar diretamente..." },
  ];

  const [passo, setPasso] = useState(1);
  const [draft, setDraft] = useState({ situacao: "", pensamento: "", emocao: "", intensidade: 60, alternativo: "" });
  const [historico, setHistorico] = useState([]);
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    db.collection("clinica_registro_abc")
      .where("pacienteId", "==", usuario.uid)
      .get()
      .then((snap) => {
        const docs = snap.docs.map((d) => d.data()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setHistorico(docs.slice(0, 5));
      })
      .catch(() => {});
  }, [usuario.uid]);

  const passoInfo = PASSOS_INFO[passo - 1];
  const podeAvancar =
    (passo === 1 && draft.situacao.trim()) ||
    (passo === 2 && draft.pensamento.trim()) ||
    (passo === 3 && draft.emocao) ||
    (passo === 4 && draft.alternativo.trim());

  async function salvar() {
    setSalvando(true);
    try {
      await db.collection("clinica_registro_abc").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        situacao: draft.situacao, pensamento: draft.pensamento, emocao: draft.emocao,
        intensidade: draft.intensidade, alternativo: draft.alternativo,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setHistorico((h) => [{ ...draft, data: new Date().toLocaleDateString("pt-BR") }, ...h].slice(0, 5));
      setPasso(5);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  function recomecar() {
    setDraft({ situacao: "", pensamento: "", emocao: "", intensidade: 60, alternativo: "" });
    setPasso(1);
    setMsg("");
  }

  if (passo === 5) {
    return (
      <div>
        <div className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB", textAlign: "center" }}>
          <Icone nome="check-circle-2" tamanho={36} />
          <h3 style={{ margin: "10px 0 4px" }}>Registro concluído</h3>
          <p className="texto-vazio-p">Seu registro foi salvo. Sua psicóloga vai poder ver isso na próxima sessão.</p>
          <button className="botao-primario-p" style={{ marginTop: 12 }} onClick={recomecar}>
            <Icone nome="plus" tamanho={14} /> Novo registro
          </button>
        </div>
        {historico.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong style={{ fontSize: 13 }}>Registros recentes</strong>
            {historico.map((h, i) => (
              <div key={i} className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB", marginTop: 8 }}>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{h.data} · {h.emocao} ({h.intensidade}/100)</div>
                <div style={{ fontSize: 13, marginTop: 4 }}><strong>Situação:</strong> {h.situacao}</div>
                <div style={{ fontSize: 13, marginTop: 2 }}><strong>Pensamento:</strong> {h.pensamento}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {PASSOS_INFO.map((p) => (
          <div
            key={p.n}
            style={{ flex: 1, height: 5, borderRadius: 20, background: p.n <= passo ? "var(--cor-marca)" : "#EADDFC", cursor: p.n < passo ? "pointer" : "default", transition: "background .2s" }}
            onClick={() => p.n < passo && setPasso(p.n)}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EADDFC", color: "var(--cor-marca)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{passoInfo.letra}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{passoInfo.titulo}</div>
          <div style={{ fontSize: 12.5, color: "#6B7280" }}>{passoInfo.subtitulo}</div>
        </div>
      </div>

      {passoInfo.dica && (
        <p style={{ fontSize: 12.5, color: "#6B7280", background: "#F9FAFB", borderRadius: 8, padding: "8px 10px", margin: "10px 0" }}>{passoInfo.dica}</p>
      )}

      {passo === 1 && (
        <TextAreaVoz rows={4} value={draft.situacao} onChange={(e) => setDraft((d) => ({ ...d, situacao: e.target.value }))} placeholder={passoInfo.placeholder} />
      )}
      {passo === 2 && (
        <TextAreaVoz rows={4} value={draft.pensamento} onChange={(e) => setDraft((d) => ({ ...d, pensamento: e.target.value }))} placeholder={passoInfo.placeholder} />
      )}
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
      {passo === 4 && (
        <TextAreaVoz rows={4} value={draft.alternativo} onChange={(e) => setDraft((d) => ({ ...d, alternativo: e.target.value }))} placeholder={passoInfo.placeholder} />
      )}

      {msg && <p className="erro-p">{msg}</p>}

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="botao-secundario-p" style={{ flex: 1 }} disabled={passo === 1} onClick={() => setPasso((p) => p - 1)}>
          <Icone nome="arrow-left" tamanho={14} /> Anterior
        </button>
        {passo < 4 ? (
          <button className="botao-primario-p" style={{ flex: 2 }} disabled={!podeAvancar} onClick={() => setPasso((p) => p + 1)}>
            Próximo <Icone nome="arrow-right" tamanho={14} />
          </button>
        ) : (
          <button className="botao-primario-p" style={{ flex: 2 }} disabled={!podeAvancar || salvando} onClick={salvar}>
            <Icone nome="check" tamanho={14} /> {salvando ? "Salvando..." : "Salvar registro"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Ferramenta: Árvore da Decisão (grava de verdade) ────────────
function FerramentaArvore({ usuario, paciente, recurso }) {
  const [step, setStep] = useState("home");
  const [preocupacao, setPreocupacao] = useState("");
  const [acoes, setAcoes] = useState("");
  const [plano, setPlano] = useState("");
  const [conclusao, setConclusao] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    db.collection("clinica_arvore_decisao")
      .where("pacienteId", "==", usuario.uid)
      .get()
      .then((snap) => {
        const docs = snap.docs.map((d) => d.data()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setHistorico(docs.slice(0, 5));
      })
      .catch(() => {});
  }, [usuario.uid]);

  const TEXTO_CONCLUSAO = {
    redirect: { icone: "wind", titulo: "Solte essa preocupação", texto: "Isso não está sob seu controle agora. Tente redirecionar sua atenção para algo que você pode influenciar." },
    "act-now": { icone: "zap", titulo: "Ótimo, você pode agir agora", texto: "Você já sabe o que fazer — coloque em prática assim que possível." },
    plan: { icone: "calendar-check", titulo: "Você tem um plano", texto: "Nem tudo precisa ser resolvido agora. Ter um plano já reduz a ansiedade." },
  };

  async function salvarHistorico(c) {
    setSalvando(true);
    try {
      await db.collection("clinica_arvore_decisao").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        preocupacao, acoes, plano, conclusao: c,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setHistorico((h) => [{ preocupacao, acoes, plano, conclusao: c, data: new Date().toLocaleDateString("pt-BR") }, ...h].slice(0, 5));
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    } finally {
      setConclusao(c);
      setStep("conclusao");
      setSalvando(false);
    }
  }

  function recomecar() {
    setPreocupacao(""); setAcoes(""); setPlano(""); setConclusao(null); setStep("home"); setMsg("");
  }

  if (step === "conclusao" && conclusao) {
    const info = TEXTO_CONCLUSAO[conclusao];
    return (
      <div>
        <div className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB", textAlign: "center" }}>
          <Icone nome={info.icone} tamanho={32} />
          <h3 style={{ margin: "10px 0 4px" }}>{info.titulo}</h3>
          <p className="texto-vazio-p">{info.texto}</p>
          <button className="botao-primario-p" style={{ marginTop: 12 }} onClick={recomecar}>
            <Icone nome="plus" tamanho={14} /> Nova preocupação
          </button>
        </div>
        {historico.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong style={{ fontSize: 13 }}>Registros recentes</strong>
            {historico.map((h, i) => (
              <div key={i} className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB", marginTop: 8 }}>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{h.data}</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>{h.preocupacao}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {step === "home" && (
        <div>
          <label style={{ fontWeight: 600, fontSize: 13 }}>O que está te preocupando?</label>
          <TextAreaVoz rows={3} value={preocupacao} onChange={(e) => setPreocupacao(e.target.value)} placeholder="Descreva a preocupação..." />
          <button className="botao-primario-p" style={{ marginTop: 12 }} disabled={!preocupacao.trim()} onClick={() => setStep("can-intervene")}>
            Continuar <Icone nome="arrow-right" tamanho={14} />
          </button>
        </div>
      )}

      {step === "can-intervene" && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Você pode fazer algo para resolver esta preocupação?</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="botao-primario-p" style={{ flex: 1 }} onClick={() => setStep("actions")}>
              <Icone nome="check" tamanho={14} /> Sim, posso agir
            </button>
            <button className="botao-secundario-p" style={{ flex: 1 }} onClick={() => salvarHistorico("redirect")}>
              <Icone nome="x" tamanho={14} /> Não está no meu controle
            </button>
          </div>
        </div>
      )}

      {step === "actions" && (
        <div>
          <label style={{ fontWeight: 600, fontSize: 13 }}>O que você pode fazer a respeito?</label>
          <TextAreaVoz rows={3} value={acoes} onChange={(e) => setAcoes(e.target.value)} placeholder="Liste as ações possíveis..." />
          <button className="botao-primario-p" style={{ marginTop: 12 }} disabled={!acoes.trim()} onClick={() => setStep("can-act-now")}>
            Continuar <Icone nome="arrow-right" tamanho={14} />
          </button>
        </div>
      )}

      {step === "can-act-now" && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Você pode agir agora mesmo?</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="botao-primario-p" style={{ flex: 1 }} onClick={() => salvarHistorico("act-now")}>
              <Icone nome="zap" tamanho={14} /> Sim, agora
            </button>
            <button className="botao-secundario-p" style={{ flex: 1 }} onClick={() => setStep("plan")}>
              <Icone nome="calendar" tamanho={14} /> Preciso planejar
            </button>
          </div>
        </div>
      )}

      {step === "plan" && (
        <div>
          <label style={{ fontWeight: 600, fontSize: 13 }}>Quando e como você vai agir?</label>
          <TextAreaVoz rows={3} value={plano} onChange={(e) => setPlano(e.target.value)} placeholder="Ex: Vou conversar com meu chefe na sexta-feira..." />
          <button className="botao-primario-p" style={{ marginTop: 12 }} disabled={!plano.trim() || salvando} onClick={() => salvarHistorico("plan")}>
            <Icone nome="check" tamanho={14} /> {salvando ? "Salvando..." : "Concluir"}
          </button>
        </div>
      )}

      {msg && <p className="erro-p">{msg}</p>}
    </div>
  );
}

// ─── Ferramenta: Roda da Vida Integral (grava de verdade) ────────
function FerramentaRodaVida({ usuario, paciente, recurso }) {
  const AREAS = [
    { id: "saude", label: "Saúde" },
    { id: "carreira", label: "Carreira" },
    { id: "financeiro", label: "Finanças" },
    { id: "familia", label: "Família" },
    { id: "social", label: "Relacionamentos" },
    { id: "espirito", label: "Espiritualidade" },
    { id: "lazer", label: "Lazer" },
    { id: "pessoal", label: "Desenv. Pessoal" },
  ];
  const [vals, setVals] = useState({});
  const [msg, setMsg] = useState("");
  const [historico, setHistorico] = useState([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    db.collection("clinica_gestao_ansiedade")
      .where("pacienteId", "==", usuario.uid)
      .where("tipo", "==", "roda")
      .get()
      .then((snap) => {
        const docs = snap.docs.map((d) => d.data()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        if (docs.length > 0) {
          const v = {};
          (docs[0].areas || []).forEach((a) => {
            const found = AREAS.find((x) => x.label === a.area);
            if (found) v[found.id] = a.valor;
          });
          setVals(v);
        }
        setHistorico(docs.slice(0, 5));
      })
      .catch(() => {});
  }, [usuario.uid]);

  function RadarSVG({ valores }) {
    const n = AREAS.length;
    const cx = 140, cy = 140, r = 110;
    const grades = [2, 4, 6, 8, 10].map((g) => {
      const pts = AREAS.map((_, i) => {
        const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
        return [cx + r * (g / 10) * Math.cos(ang), cy + r * (g / 10) * Math.sin(ang)].join(",");
      }).join(" ");
      return <polygon key={g} points={pts} fill="none" stroke="#E5E7EB" strokeWidth={g === 10 ? "1" : "0.5"} />;
    });
    const eixos = AREAS.map((_, i) => {
      const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
      return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(ang)} y2={cy + r * Math.sin(ang)} stroke="#E5E7EB" strokeWidth="0.5" />;
    });
    const pts = AREAS.map((a, i) => {
      const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
      const v = (valores[a.id] || 0) / 10;
      return [cx + r * v * Math.cos(ang), cy + r * v * Math.sin(ang)].join(",");
    }).join(" ");
    const pontos = AREAS.map((a, i) => {
      const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
      const v = (valores[a.id] || 0) / 10;
      return { x: cx + r * v * Math.cos(ang), y: cy + r * v * Math.sin(ang) };
    });
    const labels = AREAS.map((a, i) => {
      const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
      const lx = cx + (r + 22) * Math.cos(ang);
      const ly = cy + (r + 22) * Math.sin(ang);
      return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#6B7280" fontWeight="600">{a.label}</text>;
    });
    return (
      <svg width="280" height="280" viewBox="0 0 280 280">
        {grades}{eixos}
        <polygon points={pts} fill="rgba(123,0,196,0.15)" stroke="var(--cor-marca)" strokeWidth="2" />
        {pontos.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--cor-marca)" />)}
        {labels}
      </svg>
    );
  }

  async function salvar() {
    setSalvando(true);
    try {
      const areas = AREAS.map((a) => ({ area: a.label, valor: vals[a.id] || 0 }));
      await db.collection("clinica_gestao_ansiedade").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        tipo: "roda", areas,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setHistorico((h) => [{ areas, data: new Date().toLocaleDateString("pt-BR") }, ...h].slice(0, 5));
      setMsg("Roda da Vida salva!");
      setTimeout(() => setMsg(""), 2500);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16, background: "#F9F5FF", padding: "10px 12px", borderRadius: 8 }}>
        Avalie sua satisfação em cada área de <strong>0 a 10</strong>. O gráfico atualiza em tempo real conforme você move os controles.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {AREAS.map((a) => (
          <div key={a.id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{a.label}</span>
              <span style={{ fontWeight: 700, color: "var(--cor-marca)", minWidth: 32, textAlign: "right" }}>{vals[a.id] || 0}/10</span>
            </div>
            <input type="range" min={0} max={10} step={1} value={vals[a.id] || 0} onChange={(e) => setVals((v) => ({ ...v, [a.id]: +e.target.value }))} style={{ width: "100%", accentColor: "var(--cor-marca)" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 16px" }}>
        <RadarSVG valores={vals} />
      </div>
      <button className="botao-primario-p" style={{ width: "100%", justifyContent: "center" }} disabled={salvando} onClick={salvar}>
        <Icone nome="save" tamanho={14} /> {msg || (salvando ? "Salvando..." : "Salvar Roda da Vida")}
      </button>
      {historico.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--cor-marca)", marginBottom: 8 }}>Histórico</div>
          {historico.slice(1, 4).map((h, i) => (
            <div key={i} style={{ fontSize: 11, color: "#6B7280", padding: "6px 10px", background: "#F9FAFB", borderRadius: 8, marginBottom: 4 }}>
              {h.data} — {(h.areas || []).map((a) => `${a.area}: ${a.valor}`).join(" · ")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Ferramenta: Técnica de Respiração 4-7-8 (não grava — é prática) ─
function FerramentaRespiracao({ usuario, paciente, recurso }) {
  const FASES = [
    { label: "Inspire", dur: 4, cor: "#7B00C4", instrucao: "Inspire pelo nariz lentamente..." },
    { label: "Segure", dur: 7, cor: "#0891b2", instrucao: "Segure o ar com calma..." },
    { label: "Expire", dur: 8, cor: "#059669", instrucao: "Expire completamente pela boca..." },
  ];
  const TOTAL_CICLOS = 4;

  const [ativo, setAtivo] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [faseIdx, setFaseIdx] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [ciclo, setCiclo] = useState(1);
  const [tempoFase, setTempoFase] = useState(0);
  const [musica, setMusica] = useState(true);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const faseAnterior = useRef(-1);

  function falar(texto) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR"; u.rate = 0.85; u.pitch = 1.0; u.volume = 0.9;
    const vozes = window.speechSynthesis.getVoices();
    const ptVoz = vozes.find((v) => v.lang.startsWith("pt") && v.name.toLowerCase().includes("fem")) || vozes.find((v) => v.lang.startsWith("pt")) || vozes[0];
    if (ptVoz) u.voice = ptVoz;
    window.speechSynthesis.speak(u);
  }

  const fase = FASES[faseIdx];

  function iniciar() {
    setAtivo(true); setConcluido(false); setFaseIdx(0); setProgresso(0); setCiclo(1); setTempoFase(0);
    faseAnterior.current = -1;
    if (musica && audioRef.current) {
      audioRef.current.volume = 0.25;
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {});
    }
    setTimeout(() => falar("Vamos começar. Inspire."), 600);
  }

  function parar() {
    clearInterval(timerRef.current);
    setAtivo(false); setFaseIdx(0); setProgresso(0); setCiclo(1); setTempoFase(0);
    faseAnterior.current = -1;
    window.speechSynthesis && window.speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  }

  useEffect(() => {
    if (!ativo) return;
    if (faseAnterior.current !== faseIdx) {
      faseAnterior.current = faseIdx;
      falar(FASES[faseIdx].label);
    }
  }, [ativo, faseIdx]);

  useEffect(() => {
    if (!ativo) return;
    timerRef.current = setInterval(() => {
      setTempoFase((t) => {
        const novot = t + 0.1;
        const durFase = FASES[faseIdx].dur;
        if (novot >= durFase) {
          const proxFase = faseIdx + 1;
          if (proxFase >= FASES.length) {
            setCiclo((c) => {
              if (c >= TOTAL_CICLOS) {
                clearInterval(timerRef.current);
                setAtivo(false); setConcluido(true);
                window.speechSynthesis && window.speechSynthesis.cancel();
                setTimeout(() => falar("Prática concluída. Muito bem!"), 300);
                if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
                return c;
              }
              setFaseIdx(0); setProgresso(0);
              return c + 1;
            });
          } else {
            setFaseIdx(proxFase); setProgresso(0);
          }
          return 0;
        }
        setProgresso((novot / durFase) * 100);
        return novot;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [ativo, faseIdx]);

  useEffect(() => () => { clearInterval(timerRef.current); window.speechSynthesis && window.speechSynthesis.cancel(); }, []);

  const tamanhoCirculo = ativo
    ? fase.label === "Inspire" ? 140 + progresso * 0.6
    : fase.label === "Segure" ? 200
    : 200 - progresso * 0.6
    : 140;

  if (concluido) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <Icone nome="sparkles" tamanho={44} />
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--cor-marca)", margin: "12px 0 8px" }}>Prática concluída!</div>
        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 28, lineHeight: 1.6 }}>
          {TOTAL_CICLOS} ciclos de respiração 4-7-8 concluídos.<br />O seu sistema nervoso agradece.
        </div>
        <button className="botao-primario-p" onClick={iniciar}>Praticar novamente</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      {!ativo ? (
        <>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Técnica de Respiração 4-7-8</div>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 28, lineHeight: 1.6, maxWidth: 300, margin: "0 auto 28px" }}>
            Esta técnica ativa o nervo vago e reduz a ansiedade em minutos.<br />
            <strong>4</strong> ciclos · <strong>4</strong> inspirar · <strong>7</strong> segurar · <strong>8</strong> expirar
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ width: 160, height: 160, borderRadius: "50%", background: "#EADDFC", border: "3px solid var(--cor-marca)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.75 }}>
              <Icone nome="wind" tamanho={40} />
            </div>
          </div>
          <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" preload="none" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            <Icone nome="music" tamanho={14} />
            <span style={{ fontSize: 13, color: "#6B7280" }}>Música relaxante</span>
            <button type="button" onClick={() => setMusica((m) => !m)} style={{ padding: "4px 14px", borderRadius: 20, border: "1px solid var(--cor-marca)", background: musica ? "var(--cor-marca)" : "transparent", color: musica ? "white" : "var(--cor-marca)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              {musica ? "Ativada" : "Desativada"}
            </button>
          </div>
          <button className="botao-primario-p" style={{ padding: "13px 30px", fontSize: 15 }} onClick={iniciar}>
            <Icone nome="play" tamanho={16} /> Iniciar Prática
          </button>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 22 }}>
            {Array.from({ length: TOTAL_CICLOS }).map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < ciclo ? "var(--cor-marca)" : "#E5E7EB", transition: "background .3s" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <div style={{ width: tamanhoCirculo, height: tamanhoCirculo, borderRadius: "50%", background: fase.cor + "18", border: "4px solid " + fase.cor, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "all 0.1s linear" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: fase.cor }}>{fase.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: fase.cor, marginTop: 4 }}>{Math.ceil(fase.dur - tempoFase)}s</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 22, fontStyle: "italic" }}>{fase.instrucao}</div>
          <div style={{ width: "100%", maxWidth: 280, margin: "0 auto 22px", background: "#F3F4F6", borderRadius: 20, height: 6 }}>
            <div style={{ width: progresso + "%", height: "100%", borderRadius: 20, background: fase.cor, transition: "width 0.1s linear" }} />
          </div>
          <button className="botao-secundario-p" onClick={parar}>
            <Icone nome="square" tamanho={14} /> Parar
          </button>
        </>
      )}
    </div>
  );
}

// ─── Ferramenta: Relaxamento Muscular Progressivo (grava conclusão) ─
// Adaptação do modelo: lá o exercício é guiado por um áudio gravado
// pela psicóloga (arquivo que não existe aqui) — aqui a narração usa
// a mesma voz sintetizada (Web Speech API) já usada na Respiração 4-7-8.
function FerramentaRelaxamento({ usuario, paciente, recurso }) {
  const GRUPOS = [
    { nome: "Pés e panturrilhas", instrucao: "Enrole os dedos dos pés para baixo e tensione as panturrilhas." },
    { nome: "Coxas e glúteos", instrucao: "Aperte as coxas e os glúteos com força." },
    { nome: "Abdômen", instrucao: "Contraia o abdômen como se fosse levar um golpe." },
    { nome: "Mãos e braços", instrucao: "Feche as mãos em punho e tensione os braços." },
    { nome: "Ombros", instrucao: "Suba os ombros em direção às orelhas." },
    { nome: "Pescoço", instrucao: "Incline a cabeça levemente para trás, com cuidado." },
    { nome: "Rosto", instrucao: "Franza a testa e aperte os olhos com força." },
    { nome: "Corpo inteiro", instrucao: "Tensione o corpo todo ao mesmo tempo, por um instante." },
  ];
  const DUR_TENSIONAR = 5;
  const DUR_RELAXAR = 8;

  const [ativo, setAtivo] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [grupoIdx, setGrupoIdx] = useState(0);
  const [subfase, setSubfase] = useState("tensionar");
  const [tempo, setTempo] = useState(0);
  const timerRef = useRef(null);
  const anteriorRef = useRef("");

  function falar(texto) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR"; u.rate = 0.9; u.volume = 0.9;
    const vozes = window.speechSynthesis.getVoices();
    const ptVoz = vozes.find((v) => v.lang.startsWith("pt") && v.name.toLowerCase().includes("fem")) || vozes.find((v) => v.lang.startsWith("pt")) || vozes[0];
    if (ptVoz) u.voice = ptVoz;
    window.speechSynthesis.speak(u);
  }

  function iniciar() {
    setAtivo(true); setConcluido(false); setGrupoIdx(0); setSubfase("tensionar"); setTempo(0);
    anteriorRef.current = "";
  }

  async function concluir() {
    clearInterval(timerRef.current);
    setAtivo(false); setConcluido(true);
    window.speechSynthesis && window.speechSynthesis.cancel();
    try {
      await db.collection("clinica_relaxamento").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {}
  }

  function parar() {
    clearInterval(timerRef.current);
    window.speechSynthesis && window.speechSynthesis.cancel();
    setAtivo(false); setGrupoIdx(0); setSubfase("tensionar"); setTempo(0);
  }

  const grupo = GRUPOS[grupoIdx];
  const dur = subfase === "tensionar" ? DUR_TENSIONAR : DUR_RELAXAR;

  useEffect(() => {
    if (!ativo) return;
    const chave = grupoIdx + "-" + subfase;
    if (anteriorRef.current !== chave) {
      anteriorRef.current = chave;
      falar(subfase === "tensionar" ? grupo.instrucao : "Solte e relaxe. Sinta a diferença.");
    }
  }, [ativo, grupoIdx, subfase]);

  useEffect(() => {
    if (!ativo) return;
    timerRef.current = setInterval(() => {
      setTempo((t) => {
        const novo = t + 0.1;
        if (novo >= dur) {
          if (subfase === "tensionar") {
            setSubfase("relaxar");
          } else {
            const proxGrupo = grupoIdx + 1;
            if (proxGrupo >= GRUPOS.length) {
              concluir();
              return 0;
            }
            setGrupoIdx(proxGrupo);
            setSubfase("tensionar");
          }
          return 0;
        }
        return novo;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [ativo, grupoIdx, subfase]);

  useEffect(() => () => { clearInterval(timerRef.current); window.speechSynthesis && window.speechSynthesis.cancel(); }, []);

  const progresso = (tempo / dur) * 100;
  const corFase = subfase === "tensionar" ? "#dc2626" : "#059669";

  if (concluido) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <Icone nome="check-circle-2" tamanho={44} />
        <div style={{ fontSize: 20, fontWeight: 700, margin: "12px 0 8px" }}>Relaxamento concluído!</div>
        <p className="texto-vazio-p" style={{ marginBottom: 20 }}>Parabéns por cuidar de você.</p>
        <button className="botao-primario-p" onClick={iniciar}>Praticar novamente</button>
      </div>
    );
  }

  if (!ativo) {
    return (
      <div style={{ textAlign: "center", padding: "24px 20px" }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#EADDFC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Icone nome="sparkles" tamanho={34} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Relaxamento Muscular Progressivo</div>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 20, lineHeight: 1.6 }}>
          Tensione e relaxe cada grupo muscular, um de cada vez, seguindo as instruções faladas.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, textAlign: "left" }}>
          {["Encontre uma posição confortável", "Use fone de ouvido se possível", "Coloque o celular no silencioso"].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: "#F9F5FF", border: "1px solid #EADDFC", fontSize: 13 }}>
              <Icone nome="check" tamanho={14} /> {t}
            </div>
          ))}
        </div>
        <button className="botao-primario-p" onClick={iniciar}>
          <Icone nome="play" tamanho={16} /> Iniciar
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ width: 130, height: 130, borderRadius: "50%", background: "linear-gradient(135deg, " + corFase + ", var(--cor-marca))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "white" }}>
        <Icone nome={subfase === "tensionar" ? "zap" : "feather"} tamanho={32} />
      </div>
      <div style={{ fontSize: 12.5, color: "#9CA3AF", marginBottom: 2 }}>Grupo {grupoIdx + 1}/{GRUPOS.length}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{grupo.nome}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: corFase, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {subfase === "tensionar" ? "Tensione" : "Relaxe"}
      </div>
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 18, fontStyle: "italic" }}>
        {subfase === "tensionar" ? grupo.instrucao : "Solte e sinta a diferença."}
      </div>
      <div style={{ width: "100%", maxWidth: 280, margin: "0 auto 20px", background: "#F3F4F6", borderRadius: 20, height: 6 }}>
        <div style={{ width: progresso + "%", height: "100%", borderRadius: 20, background: corFase, transition: "width 0.1s linear" }} />
      </div>
      <button className="botao-secundario-p" onClick={parar}>
        <Icone nome="square" tamanho={14} /> Parar
      </button>
    </div>
  );
}

// ─── Ferramenta: Rastreamento Emocional da Alimentação (grava) ──
function FerramentaRastreamento({ usuario, paciente, recurso }) {
  const EMOCOES = ["Ansiedade", "Tédio", "Tristeza", "Raiva", "Solidão", "Estresse", "Cansaço", "Felicidade"];
  const SENSACOES = ["Culpa", "Vergonha", "Alívio", "Indiferença", "Satisfação", "Arrependimento"];
  const [fome, setFome] = useState(5);
  const [emocoes, setEmocoes] = useState([]);
  const [pensamento, setPensamento] = useState("");
  const [comeu, setComeu] = useState("");
  const [alivio, setAlivio] = useState(5);
  const [sensacoes, setSensacoes] = useState([]);
  const [reflexao, setReflexao] = useState("");
  const [entradas, setEntradas] = useState([]);
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const cancelar = db.collection("clinica_rastreamento_alimentar")
      .where("pacienteId", "==", usuario.uid)
      .onSnapshot(
        (snap) => {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setEntradas(docs.slice(0, 20));
        },
        () => {}
      );
    return cancelar;
  }, [usuario.uid]);

  function Chips({ opcoes, selecionadas, alternar }) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {opcoes.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => alternar(o)}
            style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid", borderColor: selecionadas.includes(o) ? "var(--cor-marca)" : "#E5E7EB", background: selecionadas.includes(o) ? "var(--cor-marca)" : "white", color: selecionadas.includes(o) ? "white" : "#6B7280", fontSize: 12, cursor: "pointer" }}
          >
            {o}
          </button>
        ))}
      </div>
    );
  }

  async function salvar() {
    if (!comeu.trim()) { alert("Descreva o que você comeu."); return; }
    setSalvando(true);
    try {
      await db.collection("clinica_rastreamento_alimentar").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        fome, emocoes, pensamento, comeu, alivio, sensacoes, reflexao,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setFome(5); setEmocoes([]); setPensamento(""); setComeu(""); setAlivio(5); setSensacoes([]); setReflexao("");
      setMsg("Salvo!");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  const corFome = fome <= 3 ? "#059669" : fome <= 6 ? "#d97706" : "#dc2626";
  const corAlivio = alivio <= 3 ? "#059669" : alivio <= 6 ? "#d97706" : "#dc2626";

  return (
    <div>
      <p style={{ background: "#FDF4FF", border: "1px solid #E9D5FF", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: "#5A007A", lineHeight: 1.6 }}>
        Use sempre que sentir urgência de comer ou após um episódio de compulsão. O objetivo é entender o motivo — sem julgamento.
      </p>

      {[["Nível de Fome Física", fome, setFome, corFome], ["Nível de Alívio após comer", alivio, setAlivio, corAlivio]].map(([lbl, val, set, cor]) => (
        <div key={lbl} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ fontWeight: 600 }}>{lbl}</span>
            <span style={{ fontWeight: 700, color: cor }}>{val}/10</span>
          </div>
          <input type="range" min={0} max={10} value={val} onChange={(e) => set(+e.target.value)} style={{ width: "100%", accentColor: "var(--cor-marca)" }} />
        </div>
      ))}

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6 }}>Emoções presentes</label>
        <Chips opcoes={EMOCOES} selecionadas={emocoes} alternar={(o) => setEmocoes((v) => (v.includes(o) ? v.filter((x) => x !== o) : [...v, o]))} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6 }}>Pensamento permissivo</label>
        <TextAreaVoz rows={2} value={pensamento} onChange={(e) => setPensamento(e.target.value)} placeholder="Só desta vez... Eu mereço isso..." />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6 }}>O que você comeu?</label>
        <TextAreaVoz rows={2} value={comeu} onChange={(e) => setComeu(e.target.value)} placeholder="Descreva os alimentos..." />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 8 }}>Como você se sentiu depois?</label>
        <Chips opcoes={SENSACOES} selecionadas={sensacoes} alternar={(o) => setSensacoes((v) => (v.includes(o) ? v.filter((x) => x !== o) : [...v, o]))} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6 }}>Reflexão</label>
        <TextAreaVoz rows={2} value={reflexao} onChange={(e) => setReflexao(e.target.value)} placeholder="O que esse episódio revela sobre suas necessidades emocionais?" />
      </div>

      <button className="botao-primario-p" style={{ width: "100%", justifyContent: "center" }} disabled={salvando} onClick={salvar}>
        {msg || (salvando ? "Salvando..." : "Salvar registro")}
      </button>

      {entradas.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{entradas.length} registro(s)</div>
          {entradas.map((en) => (
            <div key={en.id} style={{ background: "#F9FAFB", borderRadius: 10, padding: 12, marginBottom: 8, fontSize: 12, border: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#6B7280" }}>{en.data}</span>
                <span style={{ background: "#EADDFC", color: "var(--cor-marca)", borderRadius: 20, padding: "1px 8px", fontWeight: 600 }}>Fome: {en.fome}/10</span>
              </div>
              <div><strong>Comeu:</strong> {en.comeu}</div>
              {en.emocoes?.length > 0 && <div style={{ color: "#6B7280" }}><strong>Emoções:</strong> {en.emocoes.join(", ")}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Ferramenta: Treino Neuro-Auditivo (grava resultado) ─────────
function FerramentaTreino({ usuario, paciente, recurso }) {
  const [modulo, setModulo] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [tocando, setTocando] = useState(null);
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);
  const ctxRef = useRef(null);

  function getCtx() {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }
  function tocarTom(freq, dur = 1.5, vol = 0.4, wave = "sine") {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }
  function falar(txt, pitch = 1, rate = 0.9) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "pt-BR"; u.pitch = pitch; u.rate = rate;
    const v = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith("pt"));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }

  const MODULOS = [
    { titulo: "Grave / Agudo", icone: "music", exercicios: [
      { id: "m0e0", pergunta: "Ouça e diga: GRAVE ou AGUDO?", botao: { rotulo: "Tocar", acao: () => tocarTom(Math.random() > 0.5 ? 180 : 2200) }, opcoes: ["grave", "agudo"], resposta: "grave", dica: "Sons graves têm frequência baixa. Sons agudos têm frequência alta." },
      { id: "m0e1", pergunta: "Qual som é mais GRAVE?", botao: { rotulo: "Som A (80Hz)", acao: () => tocarTom(80) }, botao2: { rotulo: "Som B (800Hz)", acao: () => tocarTom(800) }, opcoes: ["Som A", "Som B"], resposta: "Som A", dica: "O Som A (80Hz) é grave — similar a um contrabaixo." },
    ]},
    { titulo: "Vozes", icone: "mic", exercicios: [
      { id: "m1e0", pergunta: "Feminina ou masculina?", botao: { rotulo: "Ouvir", acao: () => falar("Olá, como você está hoje?", 1.4, 0.95) }, opcoes: ["Feminina", "Masculina"], resposta: "Feminina", dica: "Tom agudo + pitch alto = voz feminina." },
      { id: "m1e1", pergunta: "Feminina ou masculina?", botao: { rotulo: "Ouvir", acao: () => falar("Bom dia, tudo bem com você?", 0.5, 0.85) }, opcoes: ["Feminina", "Masculina"], resposta: "Masculina", dica: "Pitch baixo indica voz masculina." },
    ]},
    { titulo: "Intensidade", icone: "volume-2", exercicios: [
      { id: "m2e0", pergunta: "Qual som tem mais volume?", botao: { rotulo: "Som Fraco", acao: () => tocarTom(440, 1, 0.08) }, botao2: { rotulo: "Som Forte", acao: () => tocarTom(440, 1, 0.7) }, opcoes: ["Som Fraco", "Som Forte"], resposta: "Som Forte", dica: "O Som Forte foi tocado com volume muito maior." },
    ]},
    { titulo: "Emoções", icone: "smile", exercicios: [
      { id: "m3e0", pergunta: "Que emoção você identifica?", botao: { rotulo: "Ouvir", acao: () => falar("Hoje foi um dia incrível, estou muito feliz!", 1.4, 1.1) }, opcoes: ["Alegria", "Tristeza", "Raiva", "Medo"], resposta: "Alegria", dica: "Tom agudo, rápido e animado = alegria." },
      { id: "m3e1", pergunta: "Que emoção você identifica?", botao: { rotulo: "Ouvir", acao: () => falar("Não sei o que fazer, tudo parece muito difícil.", 0.8, 0.8) }, opcoes: ["Alegria", "Tristeza", "Frustração", "Ansiedade"], resposta: "Tristeza", dica: "Tom baixo e pausado = tristeza." },
    ]},
  ];

  function responder(exId, val, correto) {
    const certo = val === correto;
    setRespostas((r) => ({ ...r, [exId]: val }));
    setFeedbacks((f) => ({ ...f, [exId]: certo }));
    if (!respostas[exId]) { setTotal((t) => t + 1); if (certo) setScore((s) => s + 1); }
  }

  async function salvarResultado() {
    if (total === 0) { alert("Responda pelo menos um exercício antes de salvar."); return; }
    setSalvando(true);
    const pct = Math.round((score / total) * 100);
    try {
      await db.collection("clinica_treino_auditivo").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        acertos: score, total, percentual: pct,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setMsg("Resultado salvo!");
      setTimeout(() => setMsg(""), 2500);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  const mod = MODULOS[modulo];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "8px 12px", background: "#EADDFC", borderRadius: 8, gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--cor-marca)", display: "flex", alignItems: "center", gap: 4 }}>
          <Icone nome="trophy" tamanho={14} /> {score}/{total}
        </span>
        <span style={{ fontSize: 12, color: "var(--cor-marca)" }}>{Math.round(total > 0 ? (score / total) * 100 : 0)}% de acerto</span>
        <button type="button" className="botao-primario-p" style={{ padding: "6px 12px", fontSize: 12 }} disabled={salvando} onClick={salvarResultado}>
          <Icone nome="save" tamanho={13} /> {msg || (salvando ? "Salvando..." : "Salvar resultado")}
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {MODULOS.map((m, i) => (
          <button key={i} type="button" onClick={() => setModulo(i)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 20, border: "1.5px solid", borderColor: modulo === i ? "var(--cor-marca)" : "#E5E7EB", background: modulo === i ? "var(--cor-marca)" : "white", color: modulo === i ? "white" : "#6B7280", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            <Icone nome={m.icone} tamanho={13} /> {m.titulo}
          </button>
        ))}
      </div>

      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
        <Icone nome={mod.icone} tamanho={15} /> {mod.titulo}
      </div>

      {mod.exercicios.map((ex) => (
        <div key={ex.id} style={{ background: "#F9FAFB", borderRadius: 12, padding: 14, marginBottom: 14, border: "1px solid #E5E7EB" }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>{ex.pergunta}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <button type="button" className="botao-primario-p" style={{ fontSize: 12 }} onClick={() => { setTocando(ex.id); ex.botao.acao(); setTimeout(() => setTocando(null), 2000); }}>
              <Icone nome="play" tamanho={13} /> {tocando === ex.id ? "Tocando..." : ex.botao.rotulo}
            </button>
            {ex.botao2 && (
              <button type="button" className="botao-secundario-p" style={{ fontSize: 12 }} onClick={ex.botao2.acao}>
                <Icone nome="play" tamanho={13} /> {ex.botao2.rotulo}
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {ex.opcoes.map((op, oi) => (
              <button
                key={oi}
                type="button"
                onClick={() => responder(ex.id, op, ex.resposta)}
                style={{
                  padding: "8px 16px", borderRadius: 10, border: "1.5px solid", fontSize: 13, cursor: "pointer", fontWeight: 500,
                  borderColor: respostas[ex.id] === op ? (feedbacks[ex.id] ? "#059669" : "#dc2626") : "#E5E7EB",
                  background: respostas[ex.id] === op ? (feedbacks[ex.id] ? "#D1FAE5" : "#FEE2E2") : "white",
                  color: respostas[ex.id] === op ? (feedbacks[ex.id] ? "#059669" : "#dc2626") : "#374151",
                }}
              >
                {op}
              </button>
            ))}
          </div>
          {respostas[ex.id] && (
            <div style={{ padding: "8px 12px", borderRadius: 8, background: feedbacks[ex.id] ? "#D1FAE5" : "#FEE2E2", fontSize: 12, color: feedbacks[ex.id] ? "#059669" : "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <Icone nome={feedbacks[ex.id] ? "check" : "x"} tamanho={13} /> {feedbacks[ex.id] ? "Correto! " : "Incorreto. "}{ex.dica}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Ferramenta: Baralho das Distorções Cognitivas ──────────────
// O paciente marca as crenças com que se identifica, ordena da mais
// influente pra menos, e trabalha uma por sessão com perguntas
// socráticas. Guarda a hierarquia inteira num único documento e vai
// avançando o contador `concluidas` a cada sessão — é isso que
// permite "continuar de onde parei" numa próxima visita.
const BARALHO_CATEGORIAS = [
  {
    id: "desvalor", nome: "Desvalor", cor: "#C0392B", bg: "#fdf2f2",
    desc: "Crenças de que não tenho valor como pessoa",
    frases: [
      "Eu nunca faço nada certo.",
      "Não tenho valor como pessoa.",
      "Sou um fardo para as pessoas ao meu redor.",
      "Qualquer um faria melhor do que eu.",
      "Não mereço as coisas boas que acontecem na minha vida.",
      "Sou inferior aos outros.",
      "Meus erros me definem para sempre.",
      "Não tenho nada de especial para oferecer.",
      "Quando me conhecem de verdade, acabam me rejeitando.",
      "Preciso ser perfeito para ter algum valor.",
    ],
  },
  {
    id: "desamor", nome: "Desamor", cor: "#1A5276", bg: "#eaf1f8",
    desc: "Crenças de que não sou amado ou amável",
    frases: [
      "Ninguém me ama de verdade.",
      "Sou difícil de amar.",
      "As pessoas só ficam perto de mim por interesse.",
      "Não mereço um amor verdadeiro.",
      "Sempre vou terminar sozinho.",
      "Quando me mostro como sou, as pessoas se afastam.",
      "Nunca serei prioridade para ninguém.",
      "O amor que recebo sempre tem um preço.",
      "As pessoas que dizem me amar vão embora cedo ou tarde.",
      "Sou muito intenso/complicado para ser amado.",
    ],
  },
  {
    id: "desamparo", nome: "Desamparo", cor: "#6C3483", bg: "#f5eeff",
    desc: "Crenças de que não tenho controle ou suporte",
    frases: [
      "Não adianta tentar, as coisas nunca mudam.",
      "Não tenho controle sobre o que acontece na minha vida.",
      "Sempre vou precisar dos outros para sobreviver.",
      "Não consigo me proteger sozinho.",
      "O mundo é perigoso e eu estou sozinho nele.",
      "Não importa o que eu faça, sempre dá errado.",
      "Sou impotente diante dos meus problemas.",
      "Ninguém vai me ajudar quando eu precisar de verdade.",
      "Fui feito para sofrer.",
      "Não tenho forças para mudar minha situação.",
    ],
  },
];

const BARALHO_PERGUNTAS = {
  desvalor: [
    "Que evidências reais você tem de que isso é verdade?",
    "Você julgaria um amigo da mesma forma que se julga?",
    "O que diria sobre você alguém que te conhece bem e te ama?",
    "Que qualidades suas você costuma ignorar quando pensa isso?",
    "Existe alguma situação em que você provou que essa crença está errada?",
  ],
  desamor: [
    "Existem pessoas na sua vida que demonstram cuidado por você?",
    "O que tornaria alguém digno de ser amado, na sua visão?",
    "Você aplicaria esse critério a alguém que você ama?",
    "Que experiências antigas podem ter ensinado essa crença?",
    "Como seria sua vida se acreditasse que merece amor?",
  ],
  desamparo: [
    "Houve algum momento em que as coisas realmente mudaram na sua vida?",
    "Quais recursos internos você tem que te ajudaram antes?",
    "O que você poderia fazer, mesmo que pequeno, para se sentir mais em controle?",
    "Quem poderia ser um apoio real para você agora?",
    "Se um amigo te dissesse isso, o que você responderia?",
  ],
};

function baralhoCategoria(id) {
  return BARALHO_CATEGORIAS.find((c) => c.id === id);
}

// Escolhe 3 das 5 perguntas, sempre as mesmas pra mesma frase (o
// paciente reencontra as mesmas perguntas se voltar na sessão).
function baralhoPerguntasPara(item) {
  const pool = BARALHO_PERGUNTAS[item.categoriaId] || BARALHO_PERGUNTAS.desvalor;
  const frases = baralhoCategoria(item.categoriaId)?.frases || [];
  const semente = Math.max(0, frases.indexOf(item.frase));
  const ordem = [0, 1, 2, 3, 4].sort((a, b) => ((a * 7 + semente) % 5) - ((b * 7 + semente) % 5));
  return ordem.slice(0, 3).map((i) => pool[i]);
}

function FerramentaBaralhoDistorcoes({ usuario, paciente, recurso }) {
  const [tela, setTela] = useState("intro");
  const [categoriaSel, setCategoriaSel] = useState(null);
  const [frasesSelecionadas, setFrasesSelecionadas] = useState([]);
  const [ordenadas, setOrdenadas] = useState([]);
  const [sessaoIdx, setSessaoIdx] = useState(0);
  const [etapaSessao, setEtapaSessao] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [reflexaoFinal, setReflexaoFinal] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [historico, setHistorico] = useState(null);

  useEffect(() => {
    db.collection("clinica_baralho_distorcoes")
      .where("pacienteId", "==", usuario.uid)
      .get()
      .then((snap) => {
        if (!snap.empty) {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setHistorico(docs[0]);
        }
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, [usuario.uid]);

  function alternarFrase(categoriaId, frase) {
    setFrasesSelecionadas((prev) => {
      const existe = prev.find((f) => f.categoriaId === categoriaId && f.frase === frase);
      if (existe) return prev.filter((f) => !(f.categoriaId === categoriaId && f.frase === frase));
      return [...prev, { categoriaId, frase }];
    });
  }

  function estaSelecionada(categoriaId, frase) {
    return !!frasesSelecionadas.find((f) => f.categoriaId === categoriaId && f.frase === frase);
  }

  function moverItem(idx, direcao) {
    setOrdenadas((prev) => {
      const arr = [...prev];
      const novo = idx + direcao;
      if (novo < 0 || novo >= arr.length) return arr;
      [arr[idx], arr[novo]] = [arr[novo], arr[idx]];
      return arr;
    });
  }

  function iniciarSessao(hierarquia, indiceInicial) {
    setOrdenadas(hierarquia);
    setSessaoIdx(indiceInicial);
    setEtapaSessao(0);
    setRespostas({});
    setReflexaoFinal("");
    setMsg("");
    setTela("sessao");
  }

  async function salvarSessao() {
    const itemAtual = ordenadas[sessaoIdx];
    const perguntas = baralhoPerguntasPara(itemAtual);
    setSalvando(true);
    try {
      const registro = {
        psi_id: usuario.psiId,
        pacienteId: usuario.uid,
        pacienteNome: paciente?.nome || "",
        hierarquia: ordenadas,
        concluidas: sessaoIdx + 1,
        sessaoAtual: {
          idx: sessaoIdx,
          frase: itemAtual.frase,
          categoriaId: itemAtual.categoriaId,
          registros: perguntas.map((p, i) => ({ pergunta: p, resposta: respostas[i] || "" })),
          reflexaoFinal,
          data: new Date().toLocaleDateString("pt-BR"),
        },
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      if (historico?.id) {
        await db.collection("clinica_baralho_distorcoes").doc(historico.id).update(registro);
      } else {
        const novo = await db.collection("clinica_baralho_distorcoes").add(registro);
        setHistorico({ id: novo.id, ...registro });
      }
      setTela("concluido");
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p className="texto-vazio-p">Carregando...</p>;

  // ── Introdução ──
  if (tela === "intro") {
    const emProgresso = historico && (historico.hierarquia || []).length > 0;
    return (
      <div>
        <div style={{ background: "linear-gradient(135deg, #4c0094, var(--cor-marca))", borderRadius: 16, padding: "28px 22px", textAlign: "center", color: "white", marginBottom: 18 }}>
          <Icone nome="layers" tamanho={40} />
          <div style={{ fontSize: 19, fontWeight: 800, margin: "8px 0 4px" }}>Baralho das Distorções</div>
          <div style={{ fontSize: 13.5, opacity: 0.85 }}>Identifique e trabalhe suas crenças limitantes</div>
        </div>

        <div className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB", marginBottom: 14 }}>
          <strong style={{ color: "var(--cor-marca)" }}>Como funciona</strong>
          <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.8, marginTop: 8 }}>
            <div>1. Leia as frases e marque as que você se identifica.</div>
            <div>2. Ordene da mais influente para a menos influente.</div>
            <div>3. A cada sessão trabalhamos uma crença com perguntas reflexivas.</div>
          </div>
        </div>

        {BARALHO_CATEGORIAS.map((cat) => (
          <div key={cat.id} style={{ background: cat.bg, border: "2px solid " + cat.cor + "20", borderRadius: 12, padding: "12px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: cat.cor, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: cat.cor, fontSize: 13.5 }}>{cat.nome}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>{cat.desc}</div>
            </div>
          </div>
        ))}

        {emProgresso && (
          <div style={{ background: "#F0FDF4", border: "2px solid #22C55E30", borderRadius: 14, padding: "14px 16px", margin: "14px 0" }}>
            <div style={{ fontWeight: 700, color: "#166534", fontSize: 13.5, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <Icone nome="rotate-ccw" tamanho={14} /> Você tem uma sessão em progresso
            </div>
            <div style={{ fontSize: 12, color: "#4B5563", marginBottom: 10 }}>
              Próxima crença: {(historico.concluidas || 0) + 1} de {(historico.hierarquia || []).length}
            </div>
            <button
              className="botao-primario-p"
              style={{ width: "100%", justifyContent: "center", background: "#22C55E" }}
              onClick={() => {
                const hier = historico.hierarquia || [];
                const feitas = historico.concluidas || 0;
                iniciarSessao(hier, feitas < hier.length ? feitas : 0);
              }}
            >
              Continuar de onde parei <Icone nome="arrow-right" tamanho={14} />
            </button>
          </div>
        )}

        <button className="botao-primario-p" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => setTela("selecao")}>
          {emProgresso ? "Iniciar nova hierarquia" : "Começar agora"} <Icone nome="arrow-right" tamanho={14} />
        </button>
      </div>
    );
  }

  // ── Seleção das frases ──
  if (tela === "selecao") {
    const cat = categoriaSel ? baralhoCategoria(categoriaSel) : null;
    return (
      <div>
        <div style={{ background: cat ? cat.cor : "var(--cor-marca)", borderRadius: 14, padding: "16px 14px", color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="botao-secundario-p"
            style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none", padding: "6px 10px" }}
            onClick={() => (categoriaSel ? setCategoriaSel(null) : setTela("intro"))}
          >
            <Icone nome="arrow-left" tamanho={15} />
          </button>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>{cat ? cat.nome : "Selecione suas frases"}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{cat ? cat.desc : frasesSelecionadas.length + " frases selecionadas"}</div>
          </div>
        </div>

        {!categoriaSel && (
          <div>
            <p className="texto-vazio-p" style={{ textAlign: "center", marginBottom: 14 }}>Escolha uma categoria para explorar as frases.</p>
            {BARALHO_CATEGORIAS.map((c) => (
              <div
                key={c.id}
                onClick={() => setCategoriaSel(c.id)}
                style={{ background: c.bg, border: "2px solid " + c.cor + "40", borderRadius: 14, padding: "16px 14px", marginBottom: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
              >
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: c.cor, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: c.cor, fontSize: 14.5 }}>{c.nome}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                    {frasesSelecionadas.filter((f) => f.categoriaId === c.id).length} selecionadas de {c.frases.length}
                  </div>
                </div>
                <Icone nome="chevron-right" tamanho={18} />
              </div>
            ))}
            {frasesSelecionadas.length > 0 && (
              <button
                className="botao-primario-p"
                style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                onClick={() => { setOrdenadas([...frasesSelecionadas]); setTela("ordenacao"); }}
              >
                Ordenar por influência ({frasesSelecionadas.length}) <Icone nome="arrow-right" tamanho={14} />
              </button>
            )}
          </div>
        )}

        {categoriaSel && (
          <div>
            {cat.frases.map((frase, i) => {
              const sel = estaSelecionada(cat.id, frase);
              return (
                <div
                  key={i}
                  onClick={() => alternarFrase(cat.id, frase)}
                  style={{ background: sel ? cat.bg : "white", border: "2px solid " + (sel ? cat.cor : "#E5E7EB"), borderRadius: 12, padding: "13px 14px", marginBottom: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 13.5, lineHeight: 1.5, color: sel ? "#1F2937" : "#4B5563" }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: sel ? cat.cor : "transparent", border: "2px solid " + (sel ? cat.cor : "#D1D5DB"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "white" }}>
                    {sel && <Icone nome="check" tamanho={12} />}
                  </div>
                  <span>{frase}</span>
                </div>
              );
            })}
            <button className="botao-secundario-p" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => setCategoriaSel(null)}>
              Voltar e ver outras categorias
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Ordenação por influência ──
  if (tela === "ordenacao") {
    return (
      <div>
        <div style={{ background: "var(--cor-marca)", borderRadius: 14, padding: "16px 14px", color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <button className="botao-secundario-p" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none", padding: "6px 10px" }} onClick={() => setTela("selecao")}>
            <Icone nome="arrow-left" tamanho={15} />
          </button>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>Ordene por influência</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>A mais influente fica no topo</div>
          </div>
        </div>

        <p style={{ background: "#FEF9FF", border: "1px solid #E9D5FF", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 12.5, color: "#6B21A8", display: "flex", alignItems: "center", gap: 8 }}>
          <Icone nome="lightbulb" tamanho={15} /> Use as setas para mover cada crença. A número 1 é a que mais influencia sua vida agora.
        </p>

        {ordenadas.map((item, i) => {
          const cat = baralhoCategoria(item.categoriaId);
          return (
            <div key={i} style={{ background: "white", border: "2px solid " + (cat?.cor || "#E5E7EB") + "30", borderRadius: 14, padding: "12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ minWidth: 30, height: 30, borderRadius: "50%", background: cat?.cor || "var(--cor-marca)", color: "white", fontWeight: 800, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 13, color: "#374151", lineHeight: 1.4 }}>
                <div style={{ fontSize: 10.5, color: cat?.cor, fontWeight: 700, marginBottom: 2, textTransform: "uppercase" }}>{cat?.nome}</div>
                {item.frase}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                <button className="botao-icone" disabled={i === 0} onClick={() => moverItem(i, -1)}><Icone nome="chevron-up" tamanho={14} /></button>
                <button className="botao-icone" disabled={i === ordenadas.length - 1} onClick={() => moverItem(i, 1)}><Icone nome="chevron-down" tamanho={14} /></button>
              </div>
            </div>
          );
        })}

        <button className="botao-primario-p" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => iniciarSessao(ordenadas, 0)}>
          Iniciar sessão com a número 1 <Icone nome="arrow-right" tamanho={14} />
        </button>
      </div>
    );
  }

  // ── Sessão de trabalho ──
  if (tela === "sessao") {
    const itemAtual = ordenadas[sessaoIdx];
    if (!itemAtual) return <p className="texto-vazio-p">Nenhuma crença selecionada.</p>;
    const cat = baralhoCategoria(itemAtual.categoriaId);
    const perguntas = baralhoPerguntasPara(itemAtual);

    return (
      <div>
        <div style={{ background: cat?.cor || "var(--cor-marca)", borderRadius: 14, padding: "16px 14px", color: "white", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <button className="botao-secundario-p" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none", padding: "6px 10px" }} onClick={() => setTela("ordenacao")}>
              <Icone nome="arrow-left" tamanho={15} />
            </button>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{cat?.nome} — Crença {sessaoIdx + 1}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>{sessaoIdx + 1} de {ordenadas.length} na sua hierarquia</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= etapaSessao ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
        </div>

        {etapaSessao === 0 && (
          <div>
            <div style={{ background: cat?.bg, border: "2px solid " + (cat?.cor || "var(--cor-marca)") + "30", borderRadius: 16, padding: "22px 18px", marginBottom: 18, textAlign: "center" }}>
              <Icone nome="layers" tamanho={28} />
              <div style={{ fontSize: 15, color: cat?.cor, fontWeight: 700, margin: "10px 0" }}>{cat?.nome}</div>
              <div style={{ fontSize: 16, color: "#1F2937", fontStyle: "italic", lineHeight: 1.6, fontWeight: 500 }}>"{itemAtual.frase}"</div>
            </div>
            <div className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB", marginBottom: 18 }}>
              <strong style={{ color: "var(--cor-marca)" }}>Sobre essa sessão</strong>
              <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.7, marginTop: 8 }}>
                Vamos olhar com cuidado para essa crença. Ela não define quem você é — é apenas um padrão aprendido que pode ser transformado.
                Responda as perguntas no seu tempo, com honestidade.
              </p>
            </div>
            <button className="botao-primario-p" style={{ width: "100%", justifyContent: "center", background: cat?.cor }} onClick={() => setEtapaSessao(1)}>
              Continuar <Icone nome="arrow-right" tamanho={14} />
            </button>
          </div>
        )}

        {etapaSessao === 1 && (
          <div>
            <div className="rotulo-mini" style={{ color: "var(--cor-marca)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>
              Perguntas para reflexão
            </div>
            {perguntas.map((pergunta, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, fontSize: 13.5, display: "block", marginBottom: 6 }}>{i + 1}. {pergunta}</label>
                <TextAreaVoz
                  rows={3}
                  value={respostas[i] || ""}
                  onChange={(e) => setRespostas((prev) => ({ ...prev, [i]: e.target.value }))}
                  placeholder="Escreva sua resposta aqui..."
                />
              </div>
            ))}
            <button className="botao-primario-p" style={{ width: "100%", justifyContent: "center", background: cat?.cor }} onClick={() => setEtapaSessao(2)}>
              Próximo <Icone nome="arrow-right" tamanho={14} />
            </button>
          </div>
        )}

        {etapaSessao === 2 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Icone nome="sparkles" tamanho={15} /> Reflexão final
            </div>
            <p className="texto-vazio-p" style={{ marginBottom: 12 }}>
              Depois de pensar nessas perguntas, o que você percebe? Há alguma nova perspectiva sobre essa crença?
            </p>
            <TextAreaVoz
              rows={5}
              value={reflexaoFinal}
              onChange={(e) => setReflexaoFinal(e.target.value)}
              placeholder="O que você percebe agora sobre essa crença?"
            />
            {msg && <p className="erro-p">{msg}</p>}
            <button className="botao-primario-p" style={{ width: "100%", justifyContent: "center", background: cat?.cor, marginTop: 14 }} disabled={salvando} onClick={salvarSessao}>
              <Icone nome="save" tamanho={14} /> {salvando ? "Salvando..." : "Salvar sessão"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Conclusão ──
  if (tela === "concluido") {
    const itemTrabalhado = ordenadas[sessaoIdx] || ordenadas[0];
    const cat = baralhoCategoria(itemTrabalhado?.categoriaId);
    const proximo = ordenadas[sessaoIdx + 1];
    return (
      <div>
        <div style={{ background: "linear-gradient(135deg, #4c0094, var(--cor-marca))", borderRadius: 16, padding: "32px 22px", textAlign: "center", color: "white", marginBottom: 18 }}>
          <Icone nome="award" tamanho={44} />
          <div style={{ fontSize: 19, fontWeight: 800, margin: "10px 0 4px" }}>Sessão concluída!</div>
          <div style={{ fontSize: 13.5, opacity: 0.85 }}>Você trabalhou com coragem suas crenças hoje.</div>
        </div>

        <div style={{ background: cat?.bg, border: "2px solid " + (cat?.cor || "var(--cor-marca)") + "20", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: cat?.cor, marginBottom: 6, fontSize: 13.5 }}>Crença trabalhada hoje</div>
          <div style={{ fontStyle: "italic", fontSize: 13.5, color: "#374151" }}>"{itemTrabalhado?.frase}"</div>
        </div>

        {proximo && (
          <div style={{ background: "#FEF9FF", border: "1px solid #E9D5FF", borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: "#6B21A8", marginBottom: 6, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}>
              <Icone nome="skip-forward" tamanho={14} /> Próxima sessão
            </div>
            <div style={{ fontStyle: "italic", fontSize: 13.5, color: "#374151" }}>"{proximo.frase}"</div>
          </div>
        )}

        <button className="botao-primario-p" style={{ width: "100%", justifyContent: "center" }} onClick={() => setTela("intro")}>
          Voltar ao início
        </button>
      </div>
    );
  }

  return null;
}

// ─── Fábula (leitor real, grava reflexões) ──────────────────────
function LeitorFabula({ usuario, paciente, recurso }) {
  const paginas = Array.isArray(recurso.paginas) ? recurso.paginas : [];
  const perguntas = Array.isArray(recurso.perguntas) ? recurso.perguntas : [];
  const [idx, setIdx] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [msg, setMsg] = useState("");

  if (paginas.length === 0) return null;
  const pagina = paginas[idx];
  const textoPagina = typeof pagina === "string" ? pagina : pagina?.texto || "";
  const pct = Math.round(((idx + 1) / paginas.length) * 100);
  const concluido = idx === paginas.length - 1;

  async function salvarReflexoes() {
    if (!perguntas.some((_, i) => (respostas[i] || "").trim())) { alert("Escreva pelo menos uma reflexão antes de salvar."); return; }
    setMsg("Salvando...");
    try {
      await db.collection("clinica_reflexoes").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        origem: "fabula", origemId: recurso.id, origemTitulo: recurso.titulo || recurso.nome || "",
        registros: perguntas.map((p, i) => ({ pergunta: p, resposta: respostas[i] || "" })),
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setMsg("Reflexões salvas!");
      setTimeout(() => setMsg(""), 2500);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    }
  }

  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 5, background: "#EADDFC", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: "var(--cor-marca)", borderRadius: 20, transition: "width .4s ease" }} />
        </div>
        <span style={{ fontSize: 12, color: "var(--cor-marca)", fontWeight: 700, flexShrink: 0 }}>{idx + 1}/{paginas.length}</span>
      </div>

      <div style={{ background: "linear-gradient(145deg, #4c0094, var(--cor-marca, #7B00C4))", borderRadius: 20, padding: "32px 26px", minHeight: 170, marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 18, color: "white", lineHeight: 1.9, textAlign: "center", fontStyle: "italic", margin: 0 }}>{textoPagina}</p>
      </div>

      {concluido && recurso.moral && (
        <div className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB" }}>
          <strong>Moral da história</strong>
          <p style={{ fontSize: 13.5, color: "#6B7280", marginTop: 6 }}>{recurso.moral}</p>
        </div>
      )}

      {concluido && perguntas.length > 0 && (
        <div className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: 6 }}><Icone nome="message-circle" tamanho={15} /> Para Refletir</strong>
          {perguntas.map((p, i) => (
            <div key={i} style={{ marginTop: 12 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>{i + 1}. {p}</label>
              <TextAreaVoz rows={2} value={respostas[i] || ""} onChange={(e) => setRespostas((r) => ({ ...r, [i]: e.target.value }))} placeholder="Escreva sua reflexão..." />
            </div>
          ))}
          <button className="botao-primario-p" style={{ marginTop: 10 }} onClick={salvarReflexoes}>{msg || "Salvar minhas reflexões"}</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button className="botao-secundario-p" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
          <Icone nome="arrow-left" tamanho={14} /> Anterior
        </button>
        {!concluido ? (
          <button className="botao-primario-p" style={{ flex: 2 }} onClick={() => setIdx((i) => Math.min(paginas.length - 1, i + 1))}>
            Próxima página <Icone nome="arrow-right" tamanho={14} />
          </button>
        ) : (
          <button className="botao-primario-p" style={{ flex: 2, background: "#059669" }} onClick={() => setIdx(0)}>
            <Icone nome="check" tamanho={14} /> Concluído — Reler
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Psicoeducação (blocos, leitura) ─────────────────────────────
// Renderiza o conteúdo montado no assistente "Nova Ferramenta"/"Nova
// Psicoeducação" do admin (blocos heterogêneos — ver TIPOS_BLOCO em
// psi/admin/app_recursos.js). Blocos de conteúdo (banner, texto,
// card, lista, imagem, gráficos, áudio) são só leitura; blocos de
// resposta (pergunta, slider, estrelas, checklist, seleção) guardam a
// resposta da paciente localmente e um botão no fim salva tudo junto
// em clinica_reflexoes — mesmo padrão já usado pra fábulas.
function VisualizadorBlocos({ blocos, usuario, paciente, recurso }) {
  const [respostas, setRespostas] = useState({});
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);

  const TIPOS_RESPOSTA = ["pergunta", "slider", "estrelas", "checklist", "selecao"];
  const temInterativo = blocos.some((b) => TIPOS_RESPOSTA.includes(b.tipo));

  function setResposta(id, valor) {
    setRespostas((r) => ({ ...r, [id]: valor }));
  }

  function formatarResposta(b) {
    const valor = respostas[b.id];
    if (b.tipo === "checklist" || b.tipo === "selecao") return Array.isArray(valor) ? valor.join(", ") : "";
    if (valor === undefined || valor === null || valor === "") return "";
    return String(valor);
  }

  async function salvarRespostas() {
    const registros = blocos
      .filter((b) => TIPOS_RESPOSTA.includes(b.tipo))
      .map((b) => ({ pergunta: b.pergunta || b.titulo || "Resposta", resposta: formatarResposta(b) }))
      .filter((r) => r.resposta);
    if (registros.length === 0) { setMsg("Responda pelo menos um item antes de salvar."); return; }
    setSalvando(true);
    try {
      await db.collection("clinica_reflexoes").add({
        psi_id: usuario.psiId, pacienteId: usuario.uid, pacienteNome: paciente?.nome || "",
        origem: "psicoeducacao", origemId: recurso?.id || "", origemTitulo: recurso?.titulo || recurso?.nome || "",
        registros,
        data: new Date().toLocaleDateString("pt-BR"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setMsg("Respostas salvas!");
      setTimeout(() => setMsg(""), 2500);
    } catch (e) {
      setMsg("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      {blocos.map((b, i) => {
        const key = b.id || i;
        switch (b.tipo) {
          case "banner":
            return (
              <div key={key} style={{ background: b.cor || "var(--cor-marca)", borderRadius: 12, padding: 20, marginBottom: 14, color: "white", textAlign: "center" }}>
                <Icone nome={b.icone || "sparkles"} tamanho={28} />
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 6 }}>{b.titulo}</div>
              </div>
            );
          case "texto":
            return <p key={key} style={{ marginBottom: 14, lineHeight: 1.7, fontSize: 14, whiteSpace: "pre-wrap" }}>{b.conteudo}</p>;
          case "card":
            return (
              <div key={key} className="cartao" style={{ boxShadow: "none", border: "1px solid #E5E7EB", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Icone nome={b.icone || "lightbulb"} tamanho={20} />
                  <strong>{b.titulo}</strong>
                </div>
                <p style={{ fontSize: 13.5, color: "#6B7280", marginTop: 4 }}>{b.texto}</p>
              </div>
            );
          case "lista":
            return (
              <ul key={key} style={{ marginBottom: 14, paddingLeft: 20 }}>
                {(b.itens || []).map((it, j) => <li key={j} style={{ fontSize: 13.5, color: "#374151", marginBottom: 4 }}>{it}</li>)}
              </ul>
            );
          case "imagem":
            return (
              <div key={key} style={{ marginBottom: 14 }}>
                {b.url && <img src={b.url} alt={b.legenda || ""} style={{ maxWidth: "100%", borderRadius: 10 }} />}
                {b.legenda && <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 6 }}>{b.legenda}</p>}
              </div>
            );
          case "grafico_barras":
            return <BarrasBloco key={key} titulo={b.titulo} itens={b.itens || []} />;
          case "grafico_radar":
            return <RadarBloco key={key} titulo={b.titulo} eixos={b.eixos || []} />;
          case "grafico_pizza":
            return <PizzaBloco key={key} titulo={b.titulo} fatias={b.fatias || []} />;
          case "audio":
            return (
              <div key={key} style={{ marginBottom: 14 }}>
                {b.legenda && <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{b.legenda}</p>}
                {b.url && (
                  <a href={b.url} target="_blank" rel="noreferrer" className="botao-secundario-p" style={{ display: "inline-flex", textDecoration: "none" }}>
                    <Icone nome="play" tamanho={14} /> Abrir áudio/vídeo
                  </a>
                )}
              </div>
            );
          case "slider":
            return (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6 }}>{b.pergunta}</label>
                <input type="range" min={b.min} max={b.max} value={respostas[b.id] ?? b.min} onChange={(e) => setResposta(b.id, +e.target.value)} style={{ width: "100%", accentColor: "var(--cor-marca)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF" }}>
                  <span>{b.labelMin}</span>
                  <span style={{ fontWeight: 700, color: "var(--cor-marca)" }}>{respostas[b.id] ?? b.min}</span>
                  <span>{b.labelMax}</span>
                </div>
              </div>
            );
          case "pergunta":
            return (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6 }}>{b.pergunta}</label>
                <TextAreaVoz rows={2} value={respostas[b.id] || ""} onChange={(e) => setResposta(b.id, e.target.value)} placeholder={b.placeholder || "Escreva aqui..."} />
              </div>
            );
          case "estrelas":
            return (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 8 }}>{b.pergunta}</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {Array.from({ length: b.max || 5 }).map((_, n) => (
                    <button key={n} type="button" onClick={() => setResposta(b.id, n + 1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <Icone nome="star" tamanho={24} style={{ color: (respostas[b.id] || 0) > n ? "#F59E0B" : "#D1D5DB" }} />
                    </button>
                  ))}
                </div>
              </div>
            );
          case "checklist":
            return (
              <div key={key} style={{ marginBottom: 16 }}>
                {b.titulo && <strong style={{ display: "block", marginBottom: 8 }}>{b.titulo}</strong>}
                {(b.itens || []).map((it, j) => {
                  const marcados = respostas[b.id] || [];
                  const ativo = marcados.includes(it);
                  return (
                    <div key={j} onClick={() => setResposta(b.id, ativo ? marcados.filter((x) => x !== it) : [...marcados, it])} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
                      <Icone nome={ativo ? "check-square" : "square"} tamanho={17} style={{ color: ativo ? "var(--cor-marca)" : "#9CA3AF" }} />
                      <span style={{ fontSize: 13.5 }}>{it}</span>
                    </div>
                  );
                })}
              </div>
            );
          case "selecao": {
            const selecionadas = respostas[b.id] || [];
            const multipla = b.tipo_sel === "multipla";
            return (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 8 }}>{b.pergunta}</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(b.opcoes || []).map((op, j) => {
                    const ativo = selecionadas.includes(op);
                    return (
                      <div
                        key={j}
                        onClick={() => {
                          if (multipla) setResposta(b.id, ativo ? selecionadas.filter((x) => x !== op) : [...selecionadas, op]);
                          else setResposta(b.id, [op]);
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, border: "1.5px solid", borderColor: ativo ? "var(--cor-marca)" : "#E5E7EB", background: ativo ? "#EADDFC" : "white", cursor: "pointer" }}
                      >
                        <Icone nome={ativo ? "check-circle-2" : "circle"} tamanho={16} style={{ color: ativo ? "var(--cor-marca)" : "#9CA3AF" }} />
                        <span style={{ fontSize: 13.5 }}>{op}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          default:
            return null;
        }
      })}

      {temInterativo && (
        <button className="botao-primario-p" onClick={salvarRespostas} disabled={salvando}>
          {msg || (salvando ? "Salvando..." : "Salvar minhas respostas")}
        </button>
      )}
    </div>
  );
}

function BarrasBloco({ titulo, itens }) {
  const max = Math.max(1, ...itens.map((i) => i.valor || 0));
  return (
    <div style={{ marginBottom: 16 }}>
      {titulo && <strong style={{ display: "block", marginBottom: 10 }}>{titulo}</strong>}
      {itens.map((it, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
            <span>{it.label}</span><span style={{ fontWeight: 600 }}>{it.valor}</span>
          </div>
          <div style={{ height: 8, background: "#F3F4F6", borderRadius: 20 }}>
            <div style={{ width: (it.valor / max) * 100 + "%", height: "100%", background: "var(--cor-marca)", borderRadius: 20 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RadarBloco({ titulo, eixos }) {
  const n = eixos.length;
  if (n < 3) return null;
  const cx = 100, cy = 100, r = 80;
  const maxValor = Math.max(1, ...eixos.map((e) => e.valor || 0), 10);
  const pontos = eixos.map((e, i) => {
    const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
    const v = (e.valor || 0) / maxValor;
    return [cx + r * v * Math.cos(ang), cy + r * v * Math.sin(ang)];
  });
  const eixosLinhas = eixos.map((_, i) => {
    const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  });
  return (
    <div style={{ marginBottom: 16, textAlign: "center" }}>
      {titulo && <strong style={{ display: "block", marginBottom: 10 }}>{titulo}</strong>}
      <svg width="200" height="200" viewBox="0 0 200 200">
        {eixosLinhas.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="#E5E7EB" strokeWidth="1" />)}
        <polygon points={pontos.map((p) => p.join(",")).join(" ")} fill="rgba(123,0,196,0.15)" stroke="var(--cor-marca)" strokeWidth="2" />
        {eixos.map((e, i) => {
          const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
          const lx = cx + (r + 18) * Math.cos(ang);
          const ly = cy + (r + 18) * Math.sin(ang);
          return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#6B7280">{e.label}</text>;
        })}
      </svg>
    </div>
  );
}

function PizzaBloco({ titulo, fatias }) {
  const total = fatias.reduce((s, f) => s + (f.valor || 0), 0) || 1;
  const cores = ["#7B00C4", "#0891b2", "#059669", "#d97706", "#dc2626", "#db2777", "#6366f1", "#374151"];
  let acumulado = 0;
  const cx = 60, cy = 60, r = 55;
  return (
    <div style={{ marginBottom: 16, textAlign: "center" }}>
      {titulo && <strong style={{ display: "block", marginBottom: 10 }}>{titulo}</strong>}
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ marginBottom: 10 }}>
        {fatias.map((f, i) => {
          const frac = (f.valor || 0) / total;
          const inicioAng = acumulado * 2 * Math.PI - Math.PI / 2;
          acumulado += frac;
          const fimAng = acumulado * 2 * Math.PI - Math.PI / 2;
          const x1 = cx + r * Math.cos(inicioAng), y1 = cy + r * Math.sin(inicioAng);
          const x2 = cx + r * Math.cos(fimAng), y2 = cy + r * Math.sin(fimAng);
          const grandeArco = frac > 0.5 ? 1 : 0;
          return <path key={i} d={`M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${grandeArco} 1 ${x2},${y2} Z`} fill={cores[i % cores.length]} />;
        })}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {fatias.map((f, i) => (
          <span key={i} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: cores[i % cores.length], display: "inline-block" }} /> {f.label} ({f.valor}%)
          </span>
        ))}
      </div>
    </div>
  );
}



// ─── Cor da marca da clínica ────────────────────────────────────
// Fica aqui porque as duas telas do paciente (Portal e página
// pública de atividade) precisam pintar a tela com a cor da
// clínica que mandou o material.
function ajustarClaridadeCor(hex, percentual) {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) & 0xff, g = (num >> 8) & 0xff, b = num & 0xff;
  const ajustar = (canal) => (percentual >= 0 ? canal + (255 - canal) * (percentual / 100) : canal * (1 + percentual / 100));
  r = Math.min(255, Math.max(0, Math.round(ajustar(r))));
  g = Math.min(255, Math.max(0, Math.round(ajustar(g))));
  b = Math.min(255, Math.max(0, Math.round(ajustar(b))));
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function aplicarCorMarca(corPrimaria) {
  if (!corPrimaria) return;
  document.documentElement.style.setProperty("--cor-marca", corPrimaria);
  document.documentElement.style.setProperty("--cor-marca-clara", ajustarClaridadeCor(corPrimaria, 35));
  document.documentElement.style.setProperty("--cor-marca-escura", ajustarClaridadeCor(corPrimaria, -45));
}


// ─── Publicação para as outras telas ────────────────────────────
// Este arquivo é carregado como um <script> separado do app.js de
// cada tela. Dependendo de como o Babel do navegador executa cada
// script, um `const` aqui em cima pode não ficar visível lá — e a
// tela quebraria inteira. Pendurar explicitamente no `window` tira
// essa dúvida: funciona igual em qualquer navegador.
Object.assign(window, {
  useState, useEffect, useRef,
  Icone, TextAreaVoz,
  COMPONENTES_FERRAMENTA, resolverFormularioKey,
  DetalheRecurso, LeitorConteudo, LeitorFabula, VisualizadorBlocos,
  ajustarClaridadeCor, aplicarCorMarca,
});
