// ═══════════════════════════════════════════════════════════════════
//  PRONTUÁRIO DO PACIENTE — abas Metas, Evolução, Laudos, Saúde
//  Ocupacional e Links Partilhados do perfil clínico.
//  (Anamnese e Questionários continuam em app_pacientes.js.)
//  Todas as consultas filtram por psi_id + pacienteId, como pedem as
//  regras do Firestore.
// ═══════════════════════════════════════════════════════════════════

// ── Utilidades compartilhadas ──────────────────────────────────────
function prontHojeISO() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function prontDataBR(iso) {
  return iso ? new Date(iso + "T12:00:00").toLocaleDateString("pt-BR") : "—";
}
function prontDataExtenso(iso) {
  const d = iso ? new Date(iso + "T12:00:00") : new Date();
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}
function prontMomento(d) {
  return (d.createdAt && d.createdAt.seconds) || (d.criadoEm && d.criadoEm.seconds) || 0;
}
function prontDataDoc(d) {
  const s = prontMomento(d);
  return s ? new Date(s * 1000).toLocaleDateString("pt-BR") : d.data || "—";
}

// Dados da clínica usados no timbre dos documentos (nome, CRP, cidade…)
function useConfigProntuario(psiId) {
  const [cfg, setCfg] = useState({});
  useEffect(() => {
    db.collection("psi_config").doc(psiId).get()
      .then((d) => { if (d.exists) setCfg(d.data()); })
      .catch(() => {});
  }, [psiId]);
  return cfg;
}

// Abre uma janela só com o documento e chama a impressão (o navegador
// oferece "Salvar como PDF").
function prontImprimir(idElemento, titulo) {
  const el = document.getElementById(idElemento);
  if (!el) return;
  const w = window.open("", "_blank");
  w.document.write(
    '<html><head><meta charset="UTF-8"><title>' + titulo + "</title><style>" +
    "body{font-family:Arial,sans-serif;margin:40px;color:#1f2937;font-size:13px;line-height:1.6}" +
    "img{max-height:70px}@media print{body{margin:20px}.no-print{display:none}}" +
    "</style></head><body>" + el.innerHTML + "</body></html>"
  );
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 600);
}

function ProntSecao({ titulo, cor, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: cor, borderBottom: "1px solid #E5E7EB", paddingBottom: 4, marginBottom: 8, textTransform: "uppercase" }}>{titulo}</div>
      <div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", textAlign: "justify" }}>{children}</div>
    </div>
  );
}

// Folha timbrada com o nome/CRP da própria clínica e bloco de assinatura.
function DocumentoTimbrado({ id, cfg, titulo, subtitulo, aviso, children }) {
  const cor = cfg.corPrimaria || "#6A2BD9";
  const linhaCrp = [cfg.crp ? "CRP " + cfg.crp : "", cfg.tituloProfissional || ""].filter(Boolean).join(" · ");
  return (
    <div id={id} style={{ background: "white", borderRadius: 12, border: "1px solid #E5E7EB", padding: 32, maxWidth: 700 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20, paddingBottom: 14, borderBottom: "2px solid " + cor }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: cor }}>{cfg.nome || "Clínica"}</div>
          {linhaCrp && <div style={{ fontSize: 11, color: "#6B7280" }}>{linhaCrp}</div>}
          {cfg.cidade && <div style={{ fontSize: 11, color: "#6B7280" }}>{cfg.cidade}</div>}
        </div>
        {cfg.logoUrl && <img src={cfg.logoUrl} alt="" style={{ height: 48, objectFit: "contain" }} />}
      </div>

      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 16, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{titulo}</div>
        {subtitulo && <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>{subtitulo}</div>}
      </div>

      {children}

      {aviso && (
        <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 6, padding: "10px 14px", fontSize: 11, margin: "22px 0", color: "#78350F" }}>{aviso}</div>
      )}

      <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 26, marginTop: 20, textAlign: "center" }}>
        <div style={{ width: 240, borderBottom: "1.5px solid #1F2937", margin: "0 auto 8px" }} />
        <div style={{ display: "inline-block", border: "2px solid " + cor, borderRadius: 8, padding: "8px 20px", color: cor }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{cfg.nome || "Psicólogo(a)"}</div>
          <div style={{ fontSize: 11, fontWeight: 600 }}>Psicólogo(a){cfg.crp ? " — CRP " + cfg.crp : ""}</div>
          {cfg.tituloProfissional && <div style={{ fontSize: 9.5, marginTop: 2 }}>{cfg.tituloProfissional}</div>}
        </div>
      </div>
    </div>
  );
}

const PRONT_AVISO_CFP = "Este documento foi elaborado em conformidade com a Resolução CFP nº 06/2019, preservando o sigilo profissional.";

function ProntAvisoCrp({ cfg }) {
  if (cfg.crp) return null;
  return (
    <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12.5, color: "#78350F" }}>
      O número do seu CRP ainda não foi informado. Preencha em Configurações para ele aparecer nos documentos.
    </div>
  );
}

const TCC_SECOES = [
  { key: "humor", rotulo: "Estado de Humor / Início da Sessão" },
  { key: "agenda", rotulo: "Agenda e Temas Abordados" },
  { key: "pensamentosAutomaticos", rotulo: "Pensamentos Automáticos" },
  { key: "crencas", rotulo: "Crenças Intermediárias e Centrais" },
  { key: "tecnicas", rotulo: "Técnicas Utilizadas" },
  { key: "tarefas", rotulo: "Tarefas de Casa" },
  { key: "observacoes", rotulo: "Observações do Terapeuta" },
];

// ═══════════════════════════════════════════════════════════════════
//  METAS
// ═══════════════════════════════════════════════════════════════════

const PRONT_CATEGORIAS_META = ["Emocional", "Saúde", "Pessoal", "Profissional", "Relacionamento", "Outro"];

function AbaMetasPaciente({ usuario, paciente }) {
  const [metas, setMetas] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const vazio = { titulo: "", categoria: "Emocional", progresso: 0, status: "ativa" };
  const [form, setForm] = useState(vazio);
  const [erro, setErro] = useState("");

  useEffect(() => {
    return db.collection("clinica_metas")
      .where("psi_id", "==", usuario.psiId)
      .where("pacienteId", "==", paciente.id)
      .onSnapshot(
        (snap) => {
          const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          lista.sort((a, b) => prontMomento(b) - prontMomento(a));
          setMetas(lista);
        },
        () => {}
      );
  }, [usuario.psiId, paciente.id]);

  function abrirNova() { setEditando(null); setForm(vazio); setErro(""); setModal(true); }
  function abrirEdicao(m) {
    setEditando(m.id);
    setForm({ titulo: m.titulo || "", categoria: m.categoria || "Emocional", progresso: m.progresso || 0, status: m.status || "ativa" });
    setErro("");
    setModal(true);
  }

  async function salvar() {
    if (!form.titulo.trim()) { setErro("Dê um título para a meta."); return; }
    try {
      const dados = { titulo: form.titulo.trim(), categoria: form.categoria, progresso: Number(form.progresso) || 0, status: form.status };
      if (editando) {
        await db.collection("clinica_metas").doc(editando).update({ ...dados, atualizadoEm: firebase.firestore.FieldValue.serverTimestamp() });
      } else {
        await db.collection("clinica_metas").add({
          ...dados,
          psi_id: usuario.psiId, pacienteId: paciente.id, pacienteNome: paciente.nome || "",
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
      setModal(false);
    } catch (e) {
      setErro("Não foi possível salvar: " + e.message);
    }
  }

  async function excluir(id) {
    if (!confirm("Excluir esta meta?")) return;
    await db.collection("clinica_metas").doc(id).delete();
  }
  async function ajustarProgresso(id, valor) {
    await db.collection("clinica_metas").doc(id).update({ progresso: valor });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <strong>Metas terapêuticas</strong>
          <p className="subtitulo-pagina">Metas ativas e concluídas aparecem no portal do paciente. Arquivadas ficam ocultas para ele.</p>
        </div>
        <button className="botao-primario" onClick={abrirNova}><Icone nome="plus" tamanho={15} /> Nova meta</button>
      </div>

      {metas.length === 0 ? (
        <div className="cartao-secao" style={{ textAlign: "center" }}>
          <Icone nome="target" tamanho={36} />
          <p className="texto-vazio" style={{ marginTop: 10 }}>Nenhuma meta cadastrada.</p>
        </div>
      ) : (
        metas.map((m) => (
          <div key={m.id} className="cartao-secao" style={m.status === "concluida" ? { border: "1.5px solid #059669", background: "#F0FDF4" } : m.status === "arquivada" ? { opacity: 0.55 } : {}}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{m.titulo}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="etiqueta-ativo" style={{ fontSize: 11, padding: "2px 10px", borderRadius: 12 }}>{m.categoria}</span>
                  {m.status === "concluida" && <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#D1FAE5", borderRadius: 20, padding: "2px 8px" }}>Concluída</span>}
                  {m.status === "arquivada" && <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", background: "#F3F4F6", borderRadius: 20, padding: "2px 8px" }}>Arquivada</span>}
                  {m.atualizadoPor === "paciente" && <span style={{ fontSize: 11, color: "var(--cor-marca)" }}>atualizada pelo paciente</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button className="botao-icone" title="Editar meta" onClick={() => abrirEdicao(m)}><Icone nome="pencil" tamanho={15} /></button>
                <button className="botao-icone botao-icone-perigo" title="Excluir meta" onClick={() => excluir(m.id)}><Icone nome="trash-2" tamanho={15} /></button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, background: "#F3F4F6", borderRadius: 20, height: 8, overflow: "hidden" }}>
                <div style={{ width: (m.progresso || 0) + "%", height: "100%", background: "var(--cor-marca)", borderRadius: 20 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--cor-marca)", minWidth: 38 }}>{m.progresso || 0}%</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="botao-secundario" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => ajustarProgresso(m.id, Math.max(0, (m.progresso || 0) - 10))}>-10%</button>
              <button className="botao-secundario" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => ajustarProgresso(m.id, Math.min(100, (m.progresso || 0) + 10))}>+10%</button>
            </div>
          </div>
        ))
      )}

      {modal && (
        <div className="sobreposicao" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editando ? "Editar meta" : "Nova meta"}</h3>
            <div className="grade-2col">
              <div className="campo-largura-total">
                <label>Título da meta</label>
                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Praticar respiração diariamente" />
              </div>
              <div className="campo-largura-total">
                <label>Categoria</label>
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                  {PRONT_CATEGORIAS_META.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="campo-largura-total">
                <label>Progresso: <strong>{form.progresso}%</strong></label>
                <input type="range" min={0} max={100} step={5} value={form.progresso} onChange={(e) => setForm({ ...form, progresso: +e.target.value })} style={{ padding: 0 }} />
              </div>
              <div className="campo-largura-total">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ativa">Ativa (visível para o paciente)</option>
                  <option value="concluida">Concluída (visível, marcada como alcançada)</option>
                  <option value="arquivada">Arquivada (oculta do paciente)</option>
                </select>
              </div>
            </div>
            {erro && <p className="mensagem-erro">{erro}</p>}
            <div className="acoes-modal">
              <button type="button" className="botao-secundario" onClick={() => setModal(false)}>Cancelar</button>
              <button type="button" className="botao-primario" onClick={salvar}>{editando ? "Salvar alterações" : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  EVOLUÇÃO
// ═══════════════════════════════════════════════════════════════════

const PRONT_FERRAMENTAS_REGISTRO = [
  { col: "clinica_gestao_ansiedade", nome: "Gestão da Ansiedade / Roda da Vida" },
  { col: "clinica_registro_abc", nome: "Registro ABC" },
  { col: "clinica_arvore_decisao", nome: "Árvore da Decisão" },
  { col: "clinica_relaxamento", nome: "Relaxamento e Respiração" },
  { col: "clinica_rastreamento_alimentar", nome: "Rastreamento Emocional da Alimentação" },
  { col: "clinica_treino_auditivo", nome: "Treino Neuro-Auditivo" },
  { col: "clinica_baralho_distorcoes", nome: "Baralho das Distorções" },
];

function ProntGraficoHumor({ registros }) {
  const pontos = registros.slice(0, 30).reverse();
  if (pontos.length < 2) return null;
  const L = 600, A = 130, mx = 24, my = 14;
  const x = (i) => mx + (i * (L - 2 * mx)) / (pontos.length - 1);
  const y = (v) => A - my - ((v - 1) / 9) * (A - 2 * my);
  const linha = pontos.map((p, i) => x(i) + "," + y(p.valor || 1)).join(" ");
  return (
    <svg viewBox={"0 0 " + L + " " + A} style={{ width: "100%", height: "auto", marginBottom: 12 }}>
      {[1, 5, 10].map((v) => (
        <g key={v}>
          <line x1={mx} x2={L - mx} y1={y(v)} y2={y(v)} stroke="#E5E7EB" strokeWidth="1" />
          <text x={2} y={y(v) + 4} fontSize="10" fill="#9CA3AF">{v}</text>
        </g>
      ))}
      <polyline points={linha} fill="none" stroke="var(--cor-marca)" strokeWidth="2.5" strokeLinejoin="round" />
      {pontos.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.valor || 1)} r="3.5" fill="var(--cor-marca)" />)}
    </svg>
  );
}

function ProntRegistrosExpansivel({ itens, tituloDe, subtituloDe, registrosDe }) {
  const [aberto, setAberto] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {itens.slice(0, 15).map((r) => {
        const on = aberto === r.id;
        return (
          <div key={r.id} style={{ border: "1px solid #F3F4F6", borderRadius: 10, overflow: "hidden" }}>
            <div onClick={() => setAberto(on ? null : r.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", cursor: "pointer", gap: 10, background: on ? "var(--marca-plataforma-lavanda)" : "#FAFAFA" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{tituloDe(r)}</div>
                <div style={{ fontSize: 11, color: "var(--texto-suave)", marginTop: 2 }}>{subtituloDe(r)}</div>
              </div>
              <span style={{ fontSize: 12, color: "var(--cor-marca)", fontWeight: 600, flexShrink: 0 }}>{on ? "Fechar" : "Ver respostas"}</span>
            </div>
            {on && (
              <div style={{ padding: "12px 14px", background: "white" }}>
                {registrosDe(r).map((reg, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--cor-marca)", marginBottom: 3 }}>{i + 1}. {reg.pergunta}</div>
                    <div style={{ fontSize: 13, color: reg.resposta ? "#1F2937" : "#9CA3AF", lineHeight: 1.6, paddingLeft: 12, borderLeft: "3px solid var(--marca-plataforma-lavanda)" }}>{reg.resposta || "— sem resposta —"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AbaEvolucaoPaciente({ usuario, paciente }) {
  const [humor, setHumor] = useState([]);
  const [metasAtivas, setMetasAtivas] = useState(0);
  const [sessoes, setSessoes] = useState(0);
  const [diario, setDiario] = useState([]);
  const [tcc, setTcc] = useState([]);
  const [reflexoes, setReflexoes] = useState([]);
  const [ferramentas, setFerramentas] = useState([]);

  useEffect(() => {
    const base = (col) => db.collection(col).where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id);
    const ordenada = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => prontMomento(b) - prontMomento(a));
    const cancelar = [
      base("clinica_humor").onSnapshot((s) => setHumor(ordenada(s)), () => {}),
      base("clinica_metas").onSnapshot((s) => setMetasAtivas(s.docs.filter((d) => d.data().status === "ativa").length), () => {}),
      base("clinica_sessoes").onSnapshot((s) => setSessoes(s.size), () => {}),
      base("clinica_diario").onSnapshot((s) => setDiario(ordenada(s)), () => {}),
      base("clinica_tcc").onSnapshot((s) => setTcc(ordenada(s)), () => {}),
      base("clinica_reflexoes").onSnapshot((s) => setReflexoes(ordenada(s)), () => {}),
    ];

    Promise.all(
      PRONT_FERRAMENTAS_REGISTRO.map((f) =>
        base(f.col).get()
          .then((s) => ({ nome: f.nome, total: s.size, ultima: s.docs.reduce((m, d) => Math.max(m, prontMomento(d.data())), 0) }))
          .catch(() => ({ nome: f.nome, total: 0, ultima: 0 }))
      )
    ).then((r) => setFerramentas(r.filter((f) => f.total > 0)));

    return () => cancelar.forEach((f) => f());
  }, [usuario.psiId, paciente.id]);

  const media = humor.length ? (humor.reduce((a, h) => a + (h.valor || 0), 0) / humor.length).toFixed(1) : "—";
  const cartao = (icone, titulo, valor, legenda) => (
    <div className="cartao-stat">
      <div className="cabecalho-cartao-stat">
        <span className="titulo-cartao-stat">{titulo}</span>
        <div className="icone-cartao-stat"><Icone nome={icone} tamanho={16} /></div>
      </div>
      <div className="valor-cartao-stat">{valor}</div>
      {legenda && <div className="legenda-cartao-stat">{legenda}</div>}
    </div>
  );

  return (
    <div>
      <div className="grade-cartoes-stat">
        {cartao("calendar", "Sessões registradas", sessoes)}
        {cartao("book-open", "Diário terapêutico", diario.length, diario[0] ? "última: " + prontDataDoc(diario[0]) : "")}
        {cartao("target", "Metas ativas", metasAtivas)}
        {cartao("heart", "Humor médio", media === "—" ? "—" : media + "/10", humor[0] ? "último: " + prontDataDoc(humor[0]) : "")}
      </div>

      <div className="cartao-secao">
        <div className="titulo-cartao-secao"><Icone nome="trending-up" tamanho={16} /> Evolução do humor</div>
        <p className="descricao-cartao-secao">Check-ins diários feitos pelo paciente no portal (1 a 10).</p>
        {humor.length === 0 ? (
          <p className="texto-vazio">Sem check-ins de humor para este paciente ainda.</p>
        ) : (
          <>
            <ProntGraficoHumor registros={humor} />
            {humor.slice(0, 10).map((h) => (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ fontWeight: 700, color: "var(--cor-marca)", minWidth: 42 }}>{h.valor}/10</div>
                <div style={{ flex: 1, background: "#F3F4F6", borderRadius: 20, height: 6 }}>
                  <div style={{ width: ((h.valor || 0) * 10) + "%", height: "100%", background: "var(--cor-marca)", borderRadius: 20 }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--texto-suave)", minWidth: 80, textAlign: "right" }}>{prontDataDoc(h)}</div>
                {h.nota && <div style={{ fontSize: 12, color: "#4B5563", flexBasis: "100%" }}>{h.nota}</div>}
              </div>
            ))}
          </>
        )}
      </div>

      <div className="cartao-secao">
        <div className="titulo-cartao-secao"><Icone nome="layers" tamanho={16} /> Uso das ferramentas terapêuticas</div>
        <p className="descricao-cartao-secao">Quantas vezes o paciente registrou cada exercício.</p>
        {ferramentas.length === 0 ? (
          <p className="texto-vazio">Nenhum exercício registrado ainda.</p>
        ) : (
          ferramentas.map((f) => (
            <div key={f.nome} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>
              <span>{f.nome}</span>
              <span style={{ color: "var(--texto-suave)" }}>
                <strong style={{ color: "var(--cor-marca)" }}>{f.total}</strong> registro(s){f.ultima ? " · último em " + new Date(f.ultima * 1000).toLocaleDateString("pt-BR") : ""}
              </span>
            </div>
          ))
        )}
      </div>

      {tcc.length > 0 && (
        <div className="cartao-secao">
          <div className="titulo-cartao-secao"><Icone nome="brain" tamanho={16} /> Registros TCC — pensamentos guiados</div>
          <p className="descricao-cartao-secao">{tcc.length} registro(s)</p>
          <ProntRegistrosExpansivel itens={tcc} tituloDe={(r) => "Registro de " + prontDataDoc(r)} subtituloDe={() => "Gestão da Ansiedade"} registrosDe={(r) => r.registros || []} />
        </div>
      )}

      {reflexoes.length > 0 && (
        <div className="cartao-secao">
          <div className="titulo-cartao-secao"><Icone nome="message-square" tamanho={16} /> Reflexões — fábulas e psicoeducações</div>
          <p className="descricao-cartao-secao">{reflexoes.length} registro(s)</p>
          <ProntRegistrosExpansivel
            itens={reflexoes}
            tituloDe={(r) => r.origemTitulo || "Reflexão"}
            subtituloDe={(r) => (r.origem === "fabula" ? "Fábula" : "Psicoeducação") + " · " + prontDataDoc(r)}
            registrosDe={(r) => r.registros || []}
          />
        </div>
      )}

      {diario.length > 0 && (
        <div className="cartao-secao">
          <div className="titulo-cartao-secao"><Icone nome="book-open" tamanho={16} /> Diário terapêutico</div>
          <p className="descricao-cartao-secao">{diario.length} entrada(s)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" }}>
            {diario.slice(0, 15).map((d) => (
              <div key={d.id} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #F3F4F6", background: "#FAFAFA" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cor-marca)", background: "var(--marca-plataforma-lavanda)", borderRadius: 20, padding: "2px 8px", textTransform: "capitalize" }}>{d.tag || "geral"}</span>
                  <span style={{ fontSize: 11, color: "var(--texto-suave)" }}>{prontDataDoc(d)}{d.hora ? " às " + d.hora : ""}</span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{d.texto}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  LAUDOS E DOCUMENTOS PSICOLÓGICOS (Resolução CFP nº 06/2019)
// ═══════════════════════════════════════════════════════════════════

const PRONT_TIPOS_LAUDO = {
  declaracao: {
    rotulo: "Declaração",
    desc: "Declara fatos objetivos (por exemplo, comparecimento ou acompanhamento), sem conteúdo clínico.",
    obrigatorios: ["corpo"],
  },
  atestado: {
    rotulo: "Atestado Psicológico",
    desc: "Afirma tecnicamente uma condição ou recomendação, com finalidade definida.",
    obrigatorios: ["finalidade", "corpo"],
  },
  relatorio: {
    rotulo: "Relatório Psicológico",
    desc: "Descreve o processo de acompanhamento: demanda, procedimentos, análise e conclusão.",
    obrigatorios: ["demanda", "conclusao"],
  },
  laudo: {
    rotulo: "Laudo Psicológico",
    desc: "Resultado de avaliação psicológica, com procedimentos, análise e conclusão.",
    obrigatorios: ["demanda", "procedimento", "analise", "conclusao"],
  },
};

const PRONT_CAMPOS_LAUDO = {
  finalidade: "Finalidade do documento",
  corpo: "Texto do documento",
  demanda: "Descrição da demanda",
  procedimento: "Procedimento",
  analise: "Análise",
  conclusao: "Conclusão",
};

function ProntConteudoLaudo({ doc, cfg }) {
  const cor = cfg.corPrimaria || "#6A2BD9";
  const nomeProf = cfg.nome || "o(a) psicólogo(a)";
  const fecho = (
    <div style={{ fontSize: 13, margin: "24px 0 8px", textAlign: "right" }}>
      {cfg.cidade ? cfg.cidade + ", " : ""}{prontDataExtenso(doc.dataEmissao)}.
    </div>
  );

  if (doc.tipo === "declaracao") {
    return (
      <>
        <div style={{ fontSize: 14, lineHeight: 2, textAlign: "justify", margin: "24px 0", textIndent: 36 }}>
          <strong>Declaro</strong>, para os devidos fins{doc.solicitante ? ", a pedido de " + doc.solicitante : ""}, que <strong>{doc.pacienteNome}</strong> {doc.corpo}
        </div>
        {fecho}
      </>
    );
  }
  if (doc.tipo === "atestado") {
    return (
      <>
        <div style={{ fontSize: 14, lineHeight: 2, textAlign: "justify", margin: "24px 0", textIndent: 36 }}>
          <strong>Atesto</strong>, para fins de <strong>{doc.finalidade}</strong>, que <strong>{doc.pacienteNome}</strong> {doc.corpo}
        </div>
        {doc.conclusao && <ProntSecao titulo="Conclusão / Recomendações" cor={cor}>{doc.conclusao}</ProntSecao>}
        {fecho}
      </>
    );
  }
  return (
    <>
      <ProntSecao titulo="Identificação" cor={cor}>
        {"Autor(a): " + nomeProf + (cfg.crp ? " — CRP " + cfg.crp : "") + "\n" +
          "Interessado(a): " + doc.pacienteNome + "\n" +
          "Solicitante: " + (doc.solicitante || "o(a) próprio(a) paciente") + "\n" +
          "Finalidade: " + (doc.finalidade || "Acompanhamento psicológico")}
      </ProntSecao>
      <ProntSecao titulo="Descrição da demanda" cor={cor}>{doc.demanda}</ProntSecao>
      {doc.procedimento && <ProntSecao titulo="Procedimento" cor={cor}>{doc.procedimento}</ProntSecao>}
      {doc.analise && <ProntSecao titulo="Análise" cor={cor}>{doc.analise}</ProntSecao>}
      <ProntSecao titulo="Conclusão" cor={cor}>{doc.conclusao}</ProntSecao>
      {fecho}
    </>
  );
}

function AbaLaudosPaciente({ usuario, paciente }) {
  const cfg = useConfigProntuario(usuario.psiId);
  const formVazio = { tipo: "relatorio", titulo: "", finalidade: "", solicitante: "", corpo: "", demanda: "", procedimento: "", analise: "", conclusao: "", dataEmissao: prontHojeISO(), visivelPaciente: false };
  const [form, setForm] = useState(formVazio);
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [preview, setPreview] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function carregar() {
    db.collection("clinica_laudos")
      .where("psi_id", "==", usuario.psiId)
      .where("pacienteId", "==", paciente.id)
      .get()
      .then((snap) => {
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => prontMomento(b) - prontMomento(a));
        setDocs(lista);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }
  useEffect(carregar, [usuario.psiId, paciente.id]);

  const tipo = PRONT_TIPOS_LAUDO[form.tipo];
  const mostra = (campo) => {
    if (campo === "finalidade") return form.tipo !== "declaracao";
    if (campo === "corpo") return form.tipo === "declaracao" || form.tipo === "atestado";
    if (campo === "conclusao") return form.tipo !== "declaracao";
    return form.tipo === "relatorio" || form.tipo === "laudo" ? true : false;
  };

  function montarDoc() {
    return {
      psi_id: usuario.psiId, pacienteId: paciente.id, pacienteNome: paciente.nome || "",
      tipo: form.tipo,
      titulo: form.titulo.trim() || tipo.rotulo,
      finalidade: form.finalidade.trim(), solicitante: form.solicitante.trim(),
      corpo: form.corpo.trim(), demanda: form.demanda.trim(), procedimento: form.procedimento.trim(),
      analise: form.analise.trim(), conclusao: form.conclusao.trim(),
      dataEmissao: form.dataEmissao, data: prontDataBR(form.dataEmissao),
      visivelPaciente: !!form.visivelPaciente,
    };
  }

  function visualizar() {
    const faltando = tipo.obrigatorios.find((c) => !form[c].trim());
    if (faltando) { setErro('Preencha o campo "' + PRONT_CAMPOS_LAUDO[faltando] + '" antes de visualizar.'); return; }
    setErro("");
    setPreview({ ...montarDoc(), _rascunho: true });
  }

  async function salvar() {
    setSalvando(true);
    try {
      await db.collection("clinica_laudos").add({ ...montarDoc(), criadoEm: firebase.firestore.FieldValue.serverTimestamp() });
      setPreview(null);
      setForm(formVazio);
      carregar();
    } catch (e) {
      alert("Não foi possível salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function alternarVisibilidade(d) {
    await db.collection("clinica_laudos").doc(d.id).update({ visivelPaciente: !d.visivelPaciente });
    carregar();
  }
  async function excluir(d) {
    if (!confirm("Excluir este documento? Essa ação não pode ser desfeita.")) return;
    await db.collection("clinica_laudos").doc(d.id).delete();
    carregar();
  }

  if (preview) {
    return (
      <div>
        {preview._rascunho && (
          <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 10, padding: "10px 16px", marginBottom: 14, fontSize: 13, color: "#78350F", fontWeight: 600 }}>
            Pré-visualização — o documento ainda NÃO foi salvo. Confira tudo e clique em "Salvar documento".
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <button className="botao-secundario" onClick={() => setPreview(null)}>
            <Icone nome="arrow-left" tamanho={15} /> {preview._rascunho ? "Voltar e editar" : "Voltar"}
          </button>
          {preview._rascunho ? (
            <button className="botao-primario" onClick={salvar} disabled={salvando}>
              <Icone nome="save" tamanho={15} /> {salvando ? "Salvando..." : "Salvar documento"}
            </button>
          ) : (
            <button className="botao-primario" onClick={() => prontImprimir("prontuario-laudo-print", preview.titulo)}>
              <Icone nome="printer" tamanho={15} /> Imprimir / Salvar PDF
            </button>
          )}
        </div>
        <DocumentoTimbrado id="prontuario-laudo-print" cfg={cfg} titulo={PRONT_TIPOS_LAUDO[preview.tipo].rotulo} subtitulo={preview.titulo !== PRONT_TIPOS_LAUDO[preview.tipo].rotulo ? preview.titulo : ""} aviso={PRONT_AVISO_CFP}>
          <ProntConteudoLaudo doc={preview} cfg={cfg} />
        </DocumentoTimbrado>
      </div>
    );
  }

  const campoTexto = (campo, linhas, dica) => (
    <div className="campo-largura-total" key={campo}>
      <label>{PRONT_CAMPOS_LAUDO[campo]}{tipo.obrigatorios.includes(campo) ? "" : " "}{!tipo.obrigatorios.includes(campo) && <span className="opcional">(opcional)</span>}</label>
      <TextAreaVoz className="campo-descricao" rows={linhas} value={form[campo]} onChange={(e) => setForm({ ...form, [campo]: e.target.value })} placeholder={dica} />
    </div>
  );

  return (
    <div>
      <ProntAvisoCrp cfg={cfg} />
      <div className="cartao-secao">
        <div className="titulo-cartao-secao"><Icone nome="file-text" tamanho={16} /> Novo documento psicológico</div>
        <p className="descricao-cartao-secao">Nada é salvo antes de você conferir e aprovar a pré-visualização.</p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {Object.entries(PRONT_TIPOS_LAUDO).map(([id, t]) => (
            <button key={id} type="button" onClick={() => setForm({ ...form, tipo: id })}
              style={{ padding: "8px 16px", borderRadius: 20, border: "1.5px solid " + (form.tipo === id ? "var(--cor-marca)" : "var(--borda)"), background: form.tipo === id ? "var(--cor-marca)" : "white", color: form.tipo === id ? "white" : "var(--texto)", fontSize: 13, fontWeight: form.tipo === id ? 700 : 500 }}>
              {t.rotulo}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--cor-marca)", background: "var(--marca-plataforma-lavanda)", borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>{tipo.desc}</p>

        <div className="grade-2col">
          <div>
            <label>Título <span className="opcional">(opcional)</span></label>
            <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder={tipo.rotulo} />
          </div>
          <div>
            <label>Data de emissão</label>
            <input type="date" value={form.dataEmissao} onChange={(e) => setForm({ ...form, dataEmissao: e.target.value })} />
          </div>
          <div className="campo-largura-total">
            <label>Solicitante <span className="opcional">(opcional — deixe vazio se for o próprio paciente)</span></label>
            <input value={form.solicitante} onChange={(e) => setForm({ ...form, solicitante: e.target.value })} placeholder="Ex: Empresa X, escola Y, médico(a) Z" />
          </div>
          {mostra("finalidade") && (
            <div className="campo-largura-total">
              <label>{PRONT_CAMPOS_LAUDO.finalidade}{!tipo.obrigatorios.includes("finalidade") && <span className="opcional"> (opcional)</span>}</label>
              <input value={form.finalidade} onChange={(e) => setForm({ ...form, finalidade: e.target.value })} placeholder="Ex: apresentação à instituição de ensino" />
            </div>
          )}
          {mostra("corpo") && campoTexto("corpo", 4, form.tipo === "declaracao" ? "Continue a frase: Declaro que [nome] ... (Ex: está em acompanhamento psicológico nesta clínica desde 10/03/2026, com frequência semanal.)" : "Continue a frase: Atesto que [nome] ... (descreva de forma objetiva, sem diagnóstico ou CID)")}
          {mostra("demanda") && campoTexto("demanda", 4, "Motivo do acompanhamento/avaliação e quem o solicitou.")}
          {mostra("procedimento") && campoTexto("procedimento", 4, "Instrumentos, técnicas, número de sessões e período.")}
          {mostra("analise") && campoTexto("analise", 6, "Análise fundamentada dos dados coletados.")}
          {mostra("conclusao") && campoTexto("conclusao", 4, form.tipo === "atestado" ? "Recomendações (por exemplo, afastamento por X dias)." : "Conclusão e encaminhamentos.")}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={form.visivelPaciente} onChange={(e) => setForm({ ...form, visivelPaciente: e.target.checked })} style={{ width: "auto" }} />
          Liberar este documento para o paciente ver no portal
        </label>

        {erro && <p className="mensagem-erro">{erro}</p>}
        <div style={{ marginTop: 16 }}>
          <button className="botao-primario" onClick={visualizar}><Icone nome="eye" tamanho={15} /> Visualizar documento</button>
        </div>
      </div>

      <div className="cartao-secao">
        <div className="titulo-cartao-secao"><Icone nome="history" tamanho={16} /> Documentos emitidos</div>
        {carregando ? (
          <p className="texto-vazio" style={{ marginTop: 10 }}>Carregando...</p>
        ) : docs.length === 0 ? (
          <p className="texto-vazio" style={{ marginTop: 10 }}>Nenhum documento emitido ainda.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {docs.map((d) => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: "1px solid var(--borda)", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{d.titulo}</div>
                  <div style={{ fontSize: 11, color: "var(--texto-suave)", marginTop: 2 }}>
                    {(PRONT_TIPOS_LAUDO[d.tipo] || {}).rotulo || d.tipo} · {d.data || prontDataDoc(d)} ·{" "}
                    <span style={{ color: d.visivelPaciente ? "#059669" : "var(--texto-suave)", fontWeight: 600 }}>{d.visivelPaciente ? "visível ao paciente" : "só você vê"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="botao-secundario" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setPreview(d)}><Icone nome="eye" tamanho={13} /> Ver</button>
                  <button className="botao-secundario" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => alternarVisibilidade(d)}>
                    <Icone nome={d.visivelPaciente ? "eye-off" : "share-2"} tamanho={13} /> {d.visivelPaciente ? "Ocultar" : "Liberar"}
                  </button>
                  <button className="botao-icone botao-icone-perigo" title="Excluir" onClick={() => excluir(d)}><Icone nome="trash-2" tamanho={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  SAÚDE OCUPACIONAL (NR-1): relatório para empresas e declaração
// ═══════════════════════════════════════════════════════════════════

const PRONT_TIPOS_NR1 = {
  relatorio_nr1: { rotulo: "Relatório de Atendimento Psicossocial (NR-1)", desc: "Documento para a empresa: vigência do acompanhamento, sessões, status no programa e parecer técnico." },
  declaracao: { rotulo: "Declaração de Comparecimento", desc: "Documento simples que atesta o comparecimento do colaborador em uma data e horário." },
};
const PRONT_STATUS_NR1 = {
  em_andamento: "Em andamento (acompanhamento contínuo)",
  concluido: "Concluído (alta do programa ocupacional)",
  encaminhado: "Encaminhado para especialista externo",
  descontinuado: "Descontinuado (faltas / não adesão)",
};

function ProntConteudoNr1({ doc, cfg }) {
  const cor = cfg.corPrimaria || "#6A2BD9";
  const fecho = (
    <div style={{ fontSize: 13, margin: "24px 0 8px", textAlign: "right" }}>{cfg.cidade ? cfg.cidade + ", " : ""}{prontDataExtenso(doc.dataEmissao)}.</div>
  );
  if (doc.tipoDocumento === "declaracao") {
    return (
      <>
        <div style={{ fontSize: 14, lineHeight: 2, textAlign: "justify", margin: "24px 0", textIndent: 36 }}>
          <strong>Declaro</strong>, para os devidos fins, que <strong>{doc.pacienteNome}</strong>
          {doc.cargo ? ", " + doc.cargo : ""}
          {doc.empresaContratante ? <>, colaborador(a) da empresa <strong>{doc.empresaContratante}</strong></> : ""}
          , compareceu a atendimento psicológico nesta clínica no dia <strong>{prontDataBR(doc.dataComparecimento)}</strong>
          {doc.horaInicio ? <>, no horário das <strong>{doc.horaInicio}</strong>{doc.horaFim ? <> às <strong>{doc.horaFim}</strong></> : ""}</> : ""}.
        </div>
        {doc.obsDeclaracao && <div style={{ fontSize: 13, lineHeight: 1.8, textAlign: "justify", textIndent: 36 }}>{doc.obsDeclaracao}</div>}
        {fecho}
      </>
    );
  }
  const periodo = doc.periodo && doc.periodo.emAndamento
    ? prontDataBR(doc.periodo.dataInicio) + " — em andamento"
    : prontDataBR(doc.periodo && doc.periodo.dataInicio) + " a " + prontDataBR(doc.periodo && doc.periodo.dataFim);
  const linhas = (titulo, itens) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: cor, borderBottom: "1px solid #E5E7EB", paddingBottom: 4, marginBottom: 8, textTransform: "uppercase" }}>{titulo}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
        {itens.map(([l, v, larga]) => (
          <div key={l} style={{ gridColumn: larga ? "span 2" : "auto" }}>
            <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <>
      {linhas("Dados do colaborador", [["Nome", doc.pacienteNome], ["Empresa contratante", doc.empresaContratante || "—"], ["Cargo", doc.cargo || "—"], ["Setor", doc.setor || "—"]])}
      {linhas("Dados do atendimento", [["Vigência", periodo], ["Sessões realizadas", (doc.sessoes ? doc.sessoes.realizadas : 0) + " de " + (doc.sessoes ? doc.sessoes.total : 0)], ["Status no programa", PRONT_STATUS_NR1[doc.statusPrograma] || doc.statusPrograma, true]])}
      {doc.parecerTecnico && <ProntSecao titulo="Parecer técnico" cor={cor}>{doc.parecerTecnico}</ProntSecao>}
      {fecho}
    </>
  );
}

function AbaSaudeOcupacionalPaciente({ usuario, paciente }) {
  const cfg = useConfigProntuario(usuario.psiId);
  const formVazio = {
    tipoDocumento: "relatorio_nr1", dataInicio: "", dataFim: "", emAndamento: false,
    sessoesRealizadas: "", sessoesTotal: "", statusPrograma: "em_andamento", parecerTecnico: "",
    dataComparecimento: "", horaInicio: "", horaFim: "", obsDeclaracao: "",
  };
  const [form, setForm] = useState(formVazio);
  const [ocup, setOcup] = useState({ empresa: paciente.empresa || "", setor: paciente.setor || "", cargo: paciente.cargo || "" });
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [preview, setPreview] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function carregar() {
    db.collection("clinica_documentos_nr1")
      .where("psi_id", "==", usuario.psiId)
      .where("pacienteId", "==", paciente.id)
      .get()
      .then((snap) => {
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => prontMomento(b) - prontMomento(a));
        setDocs(lista);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }
  useEffect(carregar, [usuario.psiId, paciente.id]);

  const ehDecl = form.tipoDocumento === "declaracao";

  function montarDoc() {
    return {
      psi_id: usuario.psiId, pacienteId: paciente.id, pacienteNome: paciente.nome || "",
      empresaContratante: ocup.empresa, setor: ocup.setor, cargo: ocup.cargo,
      tipoDocumento: form.tipoDocumento,
      periodo: { dataInicio: form.dataInicio, dataFim: form.emAndamento ? "" : form.dataFim, emAndamento: form.emAndamento },
      sessoes: { realizadas: Number(form.sessoesRealizadas) || 0, total: Number(form.sessoesTotal) || 0 },
      statusPrograma: form.statusPrograma, parecerTecnico: form.parecerTecnico.trim(),
      dataComparecimento: form.dataComparecimento, horaInicio: form.horaInicio, horaFim: form.horaFim, obsDeclaracao: form.obsDeclaracao.trim(),
      dataEmissao: prontHojeISO(),
    };
  }

  function visualizar() {
    if (ehDecl && !form.dataComparecimento) { setErro("Informe a data do comparecimento."); return; }
    if (!ehDecl && !form.parecerTecnico.trim()) { setErro("Preencha o parecer técnico antes de visualizar."); return; }
    setErro("");
    setPreview({ ...montarDoc(), _rascunho: true });
  }

  async function salvar() {
    setSalvando(true);
    try {
      await db.collection("clinica_documentos_nr1").add({ ...montarDoc(), criadoEm: firebase.firestore.FieldValue.serverTimestamp() });
      await db.collection("clinica_pacientes").doc(paciente.id).update({ empresa: ocup.empresa, setor: ocup.setor, cargo: ocup.cargo }).catch(() => {});
      setPreview(null);
      setForm(formVazio);
      carregar();
    } catch (e) {
      alert("Não foi possível salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(d) {
    if (!confirm("Excluir este documento? Essa ação não pode ser desfeita.")) return;
    await db.collection("clinica_documentos_nr1").doc(d.id).delete();
    carregar();
  }

  if (preview) {
    return (
      <div>
        {preview._rascunho && (
          <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 10, padding: "10px 16px", marginBottom: 14, fontSize: 13, color: "#78350F", fontWeight: 600 }}>
            Pré-visualização — o documento ainda NÃO foi salvo. Confira tudo e clique em "Salvar documento".
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <button className="botao-secundario" onClick={() => setPreview(null)}>
            <Icone nome="arrow-left" tamanho={15} /> {preview._rascunho ? "Voltar e editar" : "Voltar"}
          </button>
          {preview._rascunho ? (
            <button className="botao-primario" onClick={salvar} disabled={salvando}><Icone nome="save" tamanho={15} /> {salvando ? "Salvando..." : "Salvar documento"}</button>
          ) : (
            <button className="botao-primario" onClick={() => prontImprimir("prontuario-nr1-print", PRONT_TIPOS_NR1[preview.tipoDocumento].rotulo)}>
              <Icone nome="printer" tamanho={15} /> Imprimir / Salvar PDF
            </button>
          )}
        </div>
        <DocumentoTimbrado
          id="prontuario-nr1-print" cfg={cfg}
          titulo={PRONT_TIPOS_NR1[preview.tipoDocumento].rotulo}
          aviso={PRONT_AVISO_CFP + " Não contém diagnósticos, CID, sintomas clínicos ou informações íntimas do colaborador."}
        >
          <ProntConteudoNr1 doc={preview} cfg={cfg} />
        </DocumentoTimbrado>
      </div>
    );
  }

  return (
    <div>
      <ProntAvisoCrp cfg={cfg} />
      <div className="cartao-secao">
        <div className="titulo-cartao-secao"><Icone nome="briefcase" tamanho={16} /> Saúde Ocupacional — NR-1</div>
        <p className="descricao-cartao-secao">Relatórios e declarações para empresas contratantes. Nada é salvo antes de você conferir.</p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {Object.entries(PRONT_TIPOS_NR1).map(([id, t]) => (
            <button key={id} type="button" onClick={() => setForm({ ...form, tipoDocumento: id })}
              style={{ padding: "8px 16px", borderRadius: 20, border: "1.5px solid " + (form.tipoDocumento === id ? "var(--cor-marca)" : "var(--borda)"), background: form.tipoDocumento === id ? "var(--cor-marca)" : "white", color: form.tipoDocumento === id ? "white" : "var(--texto)", fontSize: 13, fontWeight: form.tipoDocumento === id ? 700 : 500 }}>
              {t.rotulo}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--cor-marca)", background: "var(--marca-plataforma-lavanda)", borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>{PRONT_TIPOS_NR1[form.tipoDocumento].desc}</p>

        <div className="grade-2col">
          <div className="campo-largura-total">
            <label>Empresa contratante</label>
            <input value={ocup.empresa} onChange={(e) => setOcup({ ...ocup, empresa: e.target.value })} placeholder="Ex: Construtora Horizonte Ltda." />
          </div>
          <div>
            <label>Setor</label>
            <input value={ocup.setor} onChange={(e) => setOcup({ ...ocup, setor: e.target.value })} />
          </div>
          <div>
            <label>Cargo</label>
            <input value={ocup.cargo} onChange={(e) => setOcup({ ...ocup, cargo: e.target.value })} />
          </div>
          <p className="opcional campo-largura-total" style={{ marginTop: 4 }}>Empresa, setor e cargo são gravados no cadastro do paciente ao salvar o documento.</p>

          {ehDecl ? (
            <>
              <div>
                <label>Data do comparecimento</label>
                <input type="date" value={form.dataComparecimento} onChange={(e) => setForm({ ...form, dataComparecimento: e.target.value })} />
              </div>
              <div>
                <label>Horário (início e término)</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} />
                  <span>—</span>
                  <input type="time" value={form.horaFim} onChange={(e) => setForm({ ...form, horaFim: e.target.value })} />
                </div>
              </div>
              <div className="campo-largura-total">
                <label>Observação <span className="opcional">(opcional)</span></label>
                <TextAreaVoz className="campo-descricao" rows={3} value={form.obsDeclaracao} onChange={(e) => setForm({ ...form, obsDeclaracao: e.target.value })} placeholder="Ex: O comparecimento integra programa de acompanhamento psicossocial vigente." />
              </div>
            </>
          ) : (
            <>
              <div>
                <label>Data de início</label>
                <input type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} />
              </div>
              <div>
                <label>Data de fim</label>
                <input type="date" value={form.dataFim} disabled={form.emAndamento} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} />
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.emAndamento} onChange={(e) => setForm({ ...form, emAndamento: e.target.checked, dataFim: "" })} style={{ width: "auto" }} /> Em andamento
                </label>
              </div>
              <div>
                <label>Sessões realizadas</label>
                <input type="number" min="0" value={form.sessoesRealizadas} onChange={(e) => setForm({ ...form, sessoesRealizadas: e.target.value })} />
              </div>
              <div>
                <label>Total planejado</label>
                <input type="number" min="0" value={form.sessoesTotal} onChange={(e) => setForm({ ...form, sessoesTotal: e.target.value })} />
              </div>
              <div className="campo-largura-total">
                <label>Status no programa</label>
                <select value={form.statusPrograma} onChange={(e) => setForm({ ...form, statusPrograma: e.target.value })}>
                  {Object.entries(PRONT_STATUS_NR1).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="campo-largura-total">
                <label>Parecer técnico</label>
                <TextAreaVoz className="campo-descricao" rows={6} value={form.parecerTecnico} onChange={(e) => setForm({ ...form, parecerTecnico: e.target.value })}
                  placeholder={"Foque em capacidade laboral e funcionalidade no trabalho, recomendações organizacionais e adaptações no posto de trabalho.\nEvite diagnósticos, CID, sintomas clínicos e informações íntimas."} />
                <p className="opcional">Siga a Resolução CFP nº 06/2019: foco em capacidade laboral, sem expor diagnóstico ou CID.</p>
              </div>
            </>
          )}
        </div>

        {erro && <p className="mensagem-erro">{erro}</p>}
        <div style={{ marginTop: 16 }}>
          <button className="botao-primario" onClick={visualizar}><Icone nome="eye" tamanho={15} /> Visualizar documento</button>
        </div>
      </div>

      <div className="cartao-secao">
        <div className="titulo-cartao-secao"><Icone nome="history" tamanho={16} /> Histórico de documentos NR-1</div>
        {carregando ? (
          <p className="texto-vazio" style={{ marginTop: 10 }}>Carregando...</p>
        ) : docs.length === 0 ? (
          <p className="texto-vazio" style={{ marginTop: 10 }}>Nenhum documento gerado ainda.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {docs.map((d) => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: "1px solid var(--borda)", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{PRONT_TIPOS_NR1[d.tipoDocumento] ? PRONT_TIPOS_NR1[d.tipoDocumento].rotulo : d.tipoDocumento}</div>
                  <div style={{ fontSize: 11, color: "var(--texto-suave)", marginTop: 2 }}>
                    {d.tipoDocumento === "declaracao"
                      ? "Comparecimento em " + prontDataBR(d.dataComparecimento)
                      : (d.periodo && d.periodo.emAndamento ? prontDataBR(d.periodo.dataInicio) + " — em andamento" : prontDataBR(d.periodo && d.periodo.dataInicio) + " a " + prontDataBR(d.periodo && d.periodo.dataFim)) + " · " + (d.sessoes ? d.sessoes.realizadas : 0) + "/" + (d.sessoes ? d.sessoes.total : 0) + " sessões"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="botao-secundario" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setPreview(d)}><Icone nome="eye" tamanho={13} /> Ver</button>
                  <button className="botao-icone botao-icone-perigo" title="Excluir" onClick={() => excluir(d)}><Icone nome="trash-2" tamanho={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  LINKS PARTILHADOS — o que já foi enviado e se foi respondido
// ═══════════════════════════════════════════════════════════════════

function AbaLinksPaciente({ usuario, paciente }) {
  const [links, setLinks] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(null);

  function carregar() {
    db.collection("clinica_links_partilhados")
      .where("psi_id", "==", usuario.psiId)
      .where("pacienteId", "==", paciente.id)
      .get()
      .then((snap) => {
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => prontMomento(b) - prontMomento(a));
        setLinks(lista);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }
  useEffect(carregar, [usuario.psiId, paciente.id]);

  const urlDe = (l) => window.location.origin + "/psi/atividade/?t=" + l.id;
  function situacao(l) {
    if (l.cancelado) return { rotulo: "Cancelado", cor: "#6B7280", fundo: "#F3F4F6" };
    if (l.status === "respondido") {
      const s = l.respondidoEm && l.respondidoEm.seconds;
      return { rotulo: "Respondido" + (s ? " em " + new Date(s * 1000).toLocaleDateString("pt-BR") : ""), cor: "#059669", fundo: "#D1FAE5" };
    }
    return { rotulo: "Pendente", cor: "#D97706", fundo: "#FEF3C7" };
  }

  function copiar(l) {
    navigator.clipboard.writeText(urlDe(l)).then(() => {
      setCopiado(l.id);
      setTimeout(() => setCopiado(null), 2000);
    });
  }
  function whatsapp(l) {
    const nome = (paciente.nome || "").split(" ")[0];
    const msg = "Olá, " + nome + "!\n\nPreparei um material para você: *" + (l.titulo || "atividade") + "*.\n\nÉ só abrir o link abaixo:\n\n" + urlDe(l) + "\n\nQualquer dúvida, me chama por aqui.";
    const numero = (paciente.telefone || "").replace(/\D/g, "");
    window.open((numero ? "https://wa.me/55" + numero : "https://wa.me/") + "?text=" + encodeURIComponent(msg), "_blank");
  }
  async function alternarCancelamento(l) {
    const cancelar = !l.cancelado;
    if (cancelar && !confirm("Cancelar este link? O paciente não conseguirá mais abri-lo.")) return;
    await db.collection("clinica_links_partilhados").doc(l.id).update({ cancelado: cancelar });
    carregar();
  }

  return (
    <div>
      <div className="cartao-secao">
        <div className="titulo-cartao-secao"><Icone nome="link" tamanho={16} /> Links enviados</div>
        <p className="descricao-cartao-secao">Todo material enviado por link para este paciente. Os links novos são criados em Recursos Terapêuticos e em Questionários.</p>
        {carregando ? (
          <p className="texto-vazio">Carregando...</p>
        ) : links.length === 0 ? (
          <p className="texto-vazio">Nenhum link enviado para este paciente ainda.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {links.map((l) => {
              const s = situacao(l);
              return (
                <div key={l.id} style={{ border: "1px solid var(--borda)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 200 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{l.titulo || "Atividade"}</div>
                      <div style={{ fontSize: 11, color: "var(--texto-suave)", marginTop: 2 }}>Enviado em {prontDataDoc(l)}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.cor, background: s.fundo, borderRadius: 20, padding: "3px 10px" }}>{s.rotulo}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    {!l.cancelado && (
                      <>
                        <button className="botao-secundario" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => copiar(l)}>
                          <Icone nome={copiado === l.id ? "check" : "copy"} tamanho={13} /> {copiado === l.id ? "Copiado!" : "Copiar link"}
                        </button>
                        <button className="botao-primario" style={{ fontSize: 12, padding: "6px 12px", background: "#25D366" }} onClick={() => whatsapp(l)}>
                          <Icone nome="message-circle" tamanho={13} /> WhatsApp
                        </button>
                      </>
                    )}
                    <button className="botao-secundario" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => alternarCancelamento(l)}>
                      <Icone nome={l.cancelado ? "rotate-ccw" : "x-circle"} tamanho={13} /> {l.cancelado ? "Reativar" : "Cancelar link"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  SESSÕES TCC — anotações clínicas por sessão + PDF por período
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
//  PERFIL CLÍNICO (CID, condições, medicações) E CRISES
// ═══════════════════════════════════════════════════════════════════

const INTENSIDADES_CRISE = [
  { id: "leve", rotulo: "Leve", cor: "#D97706" },
  { id: "moderada", rotulo: "Moderada", cor: "#EA580C" },
  { id: "intensa", rotulo: "Intensa", cor: "#DC2626" },
];

function corDaIntensidade(id) {
  const i = INTENSIDADES_CRISE.find((x) => x.id === id);
  return i ? i.cor : "#6B7280";
}

function textoPerfilClinico(p) {
  if (!p) return "";
  const partes = [];
  (p.cids || []).forEach((c) => partes.push("CID " + [c.codigo, c.descricao].filter(Boolean).join(" - ")));
  if ((p.condicoes || []).length) partes.push("Condições: " + p.condicoes.join(", "));
  if ((p.medicacoes || []).length) partes.push("Medicações: " + p.medicacoes.map((m) => m.nome + (m.dose ? " " + m.dose : "")).join(", "));
  return partes.join(". ");
}

function diasDesdeData(dataIso) {
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);
  return Math.round((hoje - new Date(dataIso + "T12:00:00")) / 86400000);
}

function textoHaQuantoTempo(dias) {
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 60) return "há " + dias + " dias";
  const meses = Math.floor(dias / 30);
  return meses < 24 ? "há cerca de " + meses + " meses" : "há mais de 2 anos";
}

function dataBr(iso) {
  return iso ? iso.split("-").reverse().join("/") : "";
}

function idCriseDaSessao(pacienteId, sessaoId) {
  return "s_" + pacienteId + "_" + String(sessaoId).replace(/[^A-Za-z0-9_-]/g, "_");
}

// Faixa de lembrete: CID/condições/medicações e a última crise.
function FaixaClinica({ perfil, crises }) {
  const texto = textoPerfilClinico(perfil);
  const comData = (crises || []).filter((c) => c.data).sort((a, b) => b.data.localeCompare(a.data));
  const ultima = comData[0];
  if (!texto && !ultima) return null;
  return (
    <div style={{ background: "#F5F0FF", border: "1px solid #D9C7F5", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12.5, color: "#3B1D63", lineHeight: 1.6 }}>
      {texto && <div><strong>Perfil clínico:</strong> {texto}</div>}
      {ultima && (
        <div>
          <strong>Última crise:</strong> {dataBr(ultima.data)} ({textoHaQuantoTempo(diasDesdeData(ultima.data))}
          {ultima.intensidade ? ", " + ultima.intensidade : ""})
        </div>
      )}
    </div>
  );
}

function PainelPerfilClinico({ usuario, paciente, perfil }) {
  const [editando, setEditando] = useState(false);
  const [cids, setCids] = useState([]);
  const [condicoes, setCondicoes] = useState([]);
  const [medicacoes, setMedicacoes] = useState([]);
  const [ditado, setDitado] = useState("");
  const [organizando, setOrganizando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function abrirEdicao() {
    setCids((perfil?.cids || []).map((c) => ({ ...c })));
    setCondicoes([...(perfil?.condicoes || [])]);
    setMedicacoes((perfil?.medicacoes || []).map((m) => ({ ...m })));
    setDitado("");
    setErro("");
    setEditando(true);
  }

  async function organizarComIA() {
    if (!ditado.trim()) { setErro("Escreva ou dite as informações antes de organizar."); return; }
    setOrganizando(true);
    setErro("");
    try {
      const fn = appAdmin.functions("southamerica-east1").httpsCallable("organizarPerfilClinicoIA");
      const r = (await fn({ texto: ditado })).data;
      const chave = (c) => ((c.codigo || "") + "|" + (c.descricao || "")).toLowerCase();
      setCids((prev) => [...prev, ...(r.cids || []).filter((n) => !prev.some((p) => chave(p) === chave(n)))]);
      setCondicoes((prev) => [...prev, ...(r.condicoes || []).filter((n) => !prev.some((p) => p.toLowerCase() === n.toLowerCase()))]);
      setMedicacoes((prev) => [...prev, ...(r.medicacoes || []).filter((n) => !prev.some((p) => p.nome.toLowerCase() === n.nome.toLowerCase()))]);
      setDitado("");
    } catch (e) {
      setErro("Erro ao organizar: " + e.message);
    } finally {
      setOrganizando(false);
    }
  }

  async function salvar() {
    setSalvando(true);
    setErro("");
    try {
      await db.collection("clinica_perfil_clinico").doc(paciente.id).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        cids: cids.map((c) => ({ codigo: (c.codigo || "").trim(), descricao: (c.descricao || "").trim() })).filter((c) => c.codigo || c.descricao),
        condicoes: condicoes.map((c) => c.trim()).filter(Boolean),
        medicacoes: medicacoes.map((m) => ({ nome: (m.nome || "").trim(), dose: (m.dose || "").trim() })).filter((m) => m.nome),
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setEditando(false);
    } catch (e) {
      setErro("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  const rotuloLista = { fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".5px", margin: "12px 0 6px" };
  const chip = { display: "inline-block", background: "#F3F4F6", borderRadius: 999, padding: "4px 12px", fontSize: 12.5, marginRight: 6, marginBottom: 6 };
  const vazio = !perfil || (!(perfil.cids || []).length && !(perfil.condicoes || []).length && !(perfil.medicacoes || []).length);

  return (
    <div className="cartao-secao">
      <div className="titulo-cartao-secao"><Icone nome="clipboard-list" tamanho={16} /> Perfil clínico: CID, condições e medicações</div>
      <p className="descricao-cartao-secao">Fica visível no topo das anotações e é enviado à IA como contexto ao organizar cada sessão.</p>

      {!editando && (
        <div>
          {vazio ? (
            <p className="texto-vazio">Nada cadastrado ainda para este paciente.</p>
          ) : (
            <div>
              {(perfil.cids || []).length > 0 && (
                <div>
                  <div style={rotuloLista}>CID / diagnósticos</div>
                  {perfil.cids.map((c, i) => <span key={i} style={chip}>{[c.codigo, c.descricao].filter(Boolean).join(" · ")}</span>)}
                </div>
              )}
              {(perfil.condicoes || []).length > 0 && (
                <div>
                  <div style={rotuloLista}>Outras condições</div>
                  {perfil.condicoes.map((c, i) => <span key={i} style={chip}>{c}</span>)}
                </div>
              )}
              {(perfil.medicacoes || []).length > 0 && (
                <div>
                  <div style={rotuloLista}>Medicações em uso</div>
                  {perfil.medicacoes.map((m, i) => <span key={i} style={chip}>{m.nome}{m.dose ? " · " + m.dose : ""}</span>)}
                </div>
              )}
            </div>
          )}
          <button className="botao-secundario" style={{ marginTop: 10 }} onClick={abrirEdicao}>
            <Icone nome="pencil" tamanho={14} /> {vazio ? "Cadastrar" : "Editar"}
          </button>
        </div>
      )}

      {editando && (
        <div>
          <label>Dite ou escreva e a IA organiza <span className="opcional">(opcional)</span></label>
          <TextAreaVoz value={ditado} onChange={(e) => setDitado(e.target.value)} rows={3}
            placeholder="Ex.: tem transtorno de ansiedade generalizada, F41.1, hipertensão, usa sertralina 50 mg de manhã" />
          <button className="botao-primario" style={{ margin: "8px 0 4px" }} onClick={organizarComIA} disabled={organizando}>
            <Icone nome="sparkles" tamanho={14} /> {organizando ? "Organizando..." : "Organizar com IA"}
          </button>
          <p style={{ fontSize: 11.5, color: "var(--texto-suave)", margin: "2px 0 0" }}>A IA acrescenta nas listas abaixo. Confira tudo antes de salvar.</p>

          <div style={rotuloLista}>CID / diagnósticos</div>
          {cids.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input style={{ width: 110 }} placeholder="Código" value={c.codigo || ""} onChange={(e) => setCids(cids.map((x, j) => (j === i ? { ...x, codigo: e.target.value } : x)))} />
              <input style={{ flex: 1 }} placeholder="Descrição" value={c.descricao || ""} onChange={(e) => setCids(cids.map((x, j) => (j === i ? { ...x, descricao: e.target.value } : x)))} />
              <button type="button" className="botao-secundario" onClick={() => setCids(cids.filter((_, j) => j !== i))}>Remover</button>
            </div>
          ))}
          <button type="button" className="botao-secundario" onClick={() => setCids([...cids, { codigo: "", descricao: "" }])}>+ Adicionar CID</button>

          <div style={rotuloLista}>Outras condições</div>
          {condicoes.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input style={{ flex: 1 }} placeholder="Ex.: hipertensão" value={c} onChange={(e) => setCondicoes(condicoes.map((x, j) => (j === i ? e.target.value : x)))} />
              <button type="button" className="botao-secundario" onClick={() => setCondicoes(condicoes.filter((_, j) => j !== i))}>Remover</button>
            </div>
          ))}
          <button type="button" className="botao-secundario" onClick={() => setCondicoes([...condicoes, ""])}>+ Adicionar condição</button>

          <div style={rotuloLista}>Medicações em uso</div>
          {medicacoes.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input style={{ flex: 1 }} placeholder="Medicação" value={m.nome || ""} onChange={(e) => setMedicacoes(medicacoes.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)))} />
              <input style={{ width: 150 }} placeholder="Dose" value={m.dose || ""} onChange={(e) => setMedicacoes(medicacoes.map((x, j) => (j === i ? { ...x, dose: e.target.value } : x)))} />
              <button type="button" className="botao-secundario" onClick={() => setMedicacoes(medicacoes.filter((_, j) => j !== i))}>Remover</button>
            </div>
          ))}
          <button type="button" className="botao-secundario" onClick={() => setMedicacoes([...medicacoes, { nome: "", dose: "" }])}>+ Adicionar medicação</button>

          {erro && <p className="mensagem-erro">{erro}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <button className="botao-secundario" onClick={() => setEditando(false)}>Cancelar</button>
            <button className="botao-primario" onClick={salvar} disabled={salvando}>{salvando ? "Salvando..." : "Salvar perfil clínico"}</button>
          </div>
        </div>
      )}
      {!editando && erro && <p className="mensagem-erro">{erro}</p>}
    </div>
  );
}

function PainelCrises({ usuario, paciente, crises }) {
  const [formAberto, setFormAberto] = useState(false);
  const [data, setData] = useState("");
  const [intensidade, setIntensidade] = useState("");
  const [obs, setObs] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [verTodas, setVerTodas] = useState(false);

  const lista = [...crises].filter((c) => c.data).sort((a, b) => b.data.localeCompare(a.data));
  const ultima = lista[0];
  const diasUltima = ultima ? diasDesdeData(ultima.data) : null;
  const ate30 = lista.filter((c) => diasDesdeData(c.data) <= 30).length;
  const ate90 = lista.filter((c) => diasDesdeData(c.data) <= 90).length;
  let intervaloMedio = null;
  if (lista.length >= 2) {
    const dias = [];
    for (let i = 0; i < lista.length - 1; i++) dias.push(diasDesdeData(lista[i + 1].data) - diasDesdeData(lista[i].data));
    intervaloMedio = Math.round(dias.reduce((a, b) => a + b, 0) / dias.length);
  }

  // Últimos 6 meses, do mais antigo ao mais recente.
  const meses = [];
  const ref = new Date();
  ref.setDate(1);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const chave = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    const doMes = lista.filter((c) => c.data.startsWith(chave));
    meses.push({
      chave,
      rotulo: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      qtd: doMes.length,
      cor: corDaIntensidade(["intensa", "moderada", "leve"].find((n) => doMes.some((c) => c.intensidade === n))),
    });
  }
  const maxQtd = Math.max(1, ...meses.map((m) => m.qtd));

  function abrirForm() {
    setData(new Date().toISOString().slice(0, 10));
    setIntensidade("");
    setObs("");
    setErro("");
    setFormAberto(true);
  }

  async function registrar() {
    if (!data) { setErro("Informe a data da crise."); return; }
    if (!intensidade) { setErro("Escolha a intensidade."); return; }
    setSalvando(true);
    setErro("");
    try {
      await db.collection("clinica_crises").add({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        data,
        intensidade,
        obs: obs.trim(),
        sessaoId: null,
        origem: "manual",
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setFormAberto(false);
    } catch (e) {
      setErro("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(c) {
    if (!confirm("Excluir a crise de " + dataBr(c.data) + "?")) return;
    try { await db.collection("clinica_crises").doc(c.id).delete(); } catch (e) { alert("Erro ao excluir: " + e.message); }
  }

  const visiveis = verTodas ? lista : lista.slice(0, 6);
  const quadro = { background: "#F9FAFB", border: "1px solid var(--borda)", borderRadius: 10, padding: "10px 14px", minWidth: 120 };

  return (
    <div className="cartao-secao">
      <div className="titulo-cartao-secao"><Icone nome="activity" tamanho={16} /> Evolução das crises</div>
      <p className="descricao-cartao-secao">Marque "em crise" dentro de cada anotação, ou lance aqui uma crise antiga com a data.</p>

      {lista.length === 0 ? (
        <p className="texto-vazio">Nenhuma crise registrada para este paciente.</p>
      ) : (
        <div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <div style={quadro}>
              <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700 }}>ÚLTIMA CRISE</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{dataBr(ultima.data)}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>{textoHaQuantoTempo(diasUltima)}</div>
            </div>
            <div style={quadro}>
              <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700 }}>NOS ÚLTIMOS 30 DIAS</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{ate30}</div>
            </div>
            <div style={quadro}>
              <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700 }}>NOS ÚLTIMOS 90 DIAS</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{ate90}</div>
            </div>
            <div style={quadro}>
              <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700 }}>INTERVALO MÉDIO</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{intervaloMedio === null ? "—" : intervaloMedio + " dias"}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>{lista.length} registrada(s)</div>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: 6 }}>Crises por mês (últimos 6 meses)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 90, marginBottom: 16 }}>
            {meses.map((m) => (
              <div key={m.chave} style={{ flex: 1, maxWidth: 70, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{m.qtd}</div>
                <div style={{ height: Math.max(3, Math.round((m.qtd / maxQtd) * 56)), background: m.qtd ? m.cor : "#E5E7EB", borderRadius: 4 }} />
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}>{m.rotulo}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {visiveis.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, border: "1px solid var(--borda)", borderRadius: 10, padding: "8px 12px", flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{dataBr(c.data)}</span>
                  <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, color: corDaIntensidade(c.intensidade) }}>{c.intensidade}</span>
                  <span style={{ marginLeft: 10, fontSize: 11, color: "#6B7280" }}>{c.origem === "manual" ? "lançada à mão" : "da anotação da sessão"}</span>
                  {c.obs && <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>{c.obs}</div>}
                </div>
                {c.origem === "manual" && (
                  <button className="botao-secundario" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => excluir(c)}>Excluir</button>
                )}
              </div>
            ))}
          </div>
          {lista.length > 6 && (
            <button className="botao-secundario" style={{ marginTop: 8 }} onClick={() => setVerTodas(!verTodas)}>
              {verTodas ? "Mostrar menos" : "Ver todas (" + lista.length + ")"}
            </button>
          )}
        </div>
      )}

      {!formAberto ? (
        <button className="botao-secundario" style={{ marginTop: 12 }} onClick={abrirForm}>
          <Icone nome="plus" tamanho={14} /> Registrar crise com data
        </button>
      ) : (
        <div style={{ marginTop: 14, border: "1px solid var(--borda)", borderRadius: 10, padding: "12px 14px" }}>
          <label>Data da crise</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          <label style={{ marginTop: 10 }}>Intensidade</label>
          <div style={{ display: "flex", gap: 8 }}>
            {INTENSIDADES_CRISE.map((i) => (
              <button key={i.id} type="button" onClick={() => setIntensidade(i.id)}
                style={{ padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12.5,
                  border: "2px solid " + i.cor, background: intensidade === i.id ? i.cor : "white", color: intensidade === i.id ? "white" : i.cor }}>
                {i.rotulo}
              </button>
            ))}
          </div>
          <label style={{ marginTop: 10 }}>Observação <span className="opcional">(opcional)</span></label>
          <TextAreaVoz value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="O que aconteceu, duração, gatilho..." />
          {erro && <p className="mensagem-erro">{erro}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button className="botao-secundario" onClick={() => setFormAberto(false)}>Cancelar</button>
            <button className="botao-primario" onClick={registrar} disabled={salvando}>{salvando ? "Salvando..." : "Registrar crise"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalAnotacaoTCC({ usuario, paciente, sessao, notaExistente, perfil, crises, criseExistente, aoFechar }) {
  // Rascunho de segurança: guarda o que está sendo escrito no próprio navegador
  // (apenas nesta aba, some ao fechá-la) para não perder nada se a tela recarregar.
  const chaveRascunho = "psw_rascunho_tcc_" + paciente.id + "_" + sessao.id;
  const rascunho = (() => {
    try { return JSON.parse(sessionStorage.getItem(chaveRascunho) || "null"); } catch (e) { return null; }
  })();
  const [textoBruto, setTextoBruto] = useState(rascunho?.textoBruto ?? notaExistente?.textoBruto ?? "");
  const [tcc, setTcc] = useState(rascunho?.tcc ?? notaExistente?.tcc ?? {});
  const [notaId, setNotaId] = useState(notaExistente?.id || null);
  // crise: null = não informado, true = em crise, false = sem crise (apaga o registro, se houver).
  const [crise, setCrise] = useState(rascunho?.crise ?? (criseExistente ? true : null));
  const [intensidadeCrise, setIntensidadeCrise] = useState(rascunho?.intensidadeCrise ?? criseExistente?.intensidade ?? "");
  const [obsCrise, setObsCrise] = useState(rascunho?.obsCrise ?? criseExistente?.obs ?? "");
  const [salvoAuto, setSalvoAuto] = useState(false);
  const [organizando, setOrganizando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const temTcc = TCC_SECOES.some((s) => tcc[s.key]);
  const cfg = useConfigProntuario(usuario.psiId);

  useEffect(() => {
    try {
      if (textoBruto.trim() || Object.keys(tcc).length || crise !== null) {
        sessionStorage.setItem(chaveRascunho, JSON.stringify({ textoBruto, tcc, crise, intensidadeCrise, obsCrise }));
      }
    } catch (e) {}
  }, [textoBruto, tcc, crise, intensidadeCrise, obsCrise]);

  // Grava no Firestore sem fechar a janela; usada pelo salvamento automático
  // (ao organizar com IA e ao enviar tarefas por WhatsApp) e pelo botão Salvar.
  async function persistir(textoAtual, tccAtual) {
    const dados = {
      psi_id: usuario.psiId,
      pacienteId: paciente.id,
      pacienteNome: paciente.nome,
      sessaoId: sessao.id,
      pacoteId: sessao.pacoteId || null,
      origem: sessao.origem || null,
      sessaoAntigaId: sessao.sessaoAntigaId || null,
      pacoteAntigoId: sessao.pacoteAntigoId || null,
      data: sessao.data || null,
      textoBruto: textoAtual,
      tcc: tccAtual,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (notaId) {
      await db.collection("clinica_prontuarios").doc(notaId).update(dados);
    } else {
      const ref = await db.collection("clinica_prontuarios").add({ ...dados, criadoEm: firebase.firestore.FieldValue.serverTimestamp() });
      setNotaId(ref.id);
    }
    // Crise da sessão: um documento por sessão, para poder medir a evolução.
    const idCrise = idCriseDaSessao(paciente.id, sessao.id);
    if (crise === true && intensidadeCrise) {
      await db.collection("clinica_crises").doc(idCrise).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        data: sessao.data || null,
        intensidade: intensidadeCrise,
        obs: obsCrise.trim(),
        sessaoId: sessao.id,
        origem: "sessao",
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } else if (crise === false) {
      try { await db.collection("clinica_crises").doc(idCrise).delete(); } catch (e) {}
    }
  }

  function salvarAutomatico(textoAtual, tccAtual) {
    if (!textoAtual.trim()) return;
    persistir(textoAtual, tccAtual)
      .then(() => setSalvoAuto(true))
      .catch(() => {});
  }

  // Manda ao paciente só as tarefas de casa, nunca o resto do prontuário.
  function enviarTarefasWhatsApp() {
    const tarefas = (tcc.tarefas || "").trim();
    if (!tarefas) { setErro("Não há tarefas preenchidas para enviar."); return; }
    setErro("");
    const assinatura = cfg.nome || "Sua psicóloga";
    // Se o telefone cadastrado é do responsável (ex.: a mãe), cumprimenta ele
    // e cita o paciente; senão, fala direto com o paciente.
    const wa = whatsappDoPaciente(paciente);
    const abertura = wa.ehResponsavel
      ? "Olá" + (wa.nome ? ", " + primeiroNomeDe(wa.nome) : "") + "! 😊\n\n"
      : "Olá, " + primeiroNomeDe(paciente.nome) + "! 😊\n\n";
    const titulo = wa.ehResponsavel
      ? "*Atividades da semana de " + primeiroNomeDe(paciente.nome) + ":*\n"
      : "*Atividades da Semana:*\n";
    const msg =
      abertura +
      titulo +
      tarefas + "\n\n" +
      "Qualquer dúvida, estou à disposição. 💜\n" +
      "_" + assinatura + "_";
    const numero = (wa.numero || paciente.celular || "").replace(/\D/g, "");
    const base = numero ? "https://wa.me/55" + numero : "https://wa.me/";
    salvarAutomatico(textoBruto, tcc);
    window.open(base + "?text=" + encodeURIComponent(msg), "_blank");
  }

  async function organizarComIA() {
    if (!textoBruto.trim()) { setErro("Digite ou dite as anotações antes de organizar."); return; }
    setOrganizando(true);
    setErro("");
    try {
      const fn = appAdmin.functions("southamerica-east1").httpsCallable("organizarProntuarioIA");
      const resultado = await fn({ textoBruto, pacienteNome: paciente.nome, dataSessao: sessao.data, perfilClinico: textoPerfilClinico(perfil) });
      const novoTcc = resultado.data.tcc || {};
      setTcc(novoTcc);
      salvarAutomatico(textoBruto, novoTcc);
    } catch (e) {
      setErro("Erro ao organizar: " + e.message);
    } finally {
      setOrganizando(false);
    }
  }

  async function salvar() {
    if (!textoBruto.trim()) { setErro("Insira alguma anotação antes de salvar."); return; }
    if (crise === true && !intensidadeCrise) { setErro("Você marcou que o paciente está em crise. Escolha a intensidade."); return; }
    setSalvando(true);
    setErro("");
    try {
      await persistir(textoBruto, tcc);
      try { sessionStorage.removeItem(chaveRascunho); } catch (e) {}
      aoFechar();
    } catch (e) {
      setErro("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  const dataFormatada = sessao.data
    ? new Date(sessao.data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="sobreposicao" onClick={() => { if (!textoBruto.trim()) aoFechar(); }}>
      <div className="modal modal-largo" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Anotação de Sessão TCC</h3>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} onClick={aoFechar}><Icone nome="x" tamanho={18} /></button>
        </div>
        <div style={{ padding: "0 0 10px", fontSize: 12, color: "var(--texto-suave)" }}>
          {paciente.nome} · {dataFormatada}{sessao.horario ? " · " + sessao.horario : ""}
        </div>
        <FaixaClinica perfil={perfil} crises={(crises || []).filter((c) => c.sessaoId !== sessao.id)} />

        <label>Anotações brutas da sessão <span className="opcional">(dite ou escreva livremente)</span></label>
        <TextAreaVoz value={textoBruto} onChange={e => setTextoBruto(e.target.value)} rows={6} placeholder="Descreva o que aconteceu na sessão, os temas discutidos, técnicas usadas, tarefas combinadas..." />

        <div style={{ display: "flex", gap: 10, margin: "12px 0 18px", alignItems: "center" }}>
          <button className="botao-primario" onClick={organizarComIA} disabled={organizando}>
            <Icone nome="sparkles" tamanho={15} /> {organizando ? "Organizando..." : "Organizar com IA"}
          </button>
          {temTcc && !organizando && (
            <span style={{ fontSize: 12, color: "var(--sucesso)", display: "flex", alignItems: "center", gap: 4 }}>
              <Icone nome="check-circle" tamanho={13} /> Organizado
            </span>
          )}
        </div>

        {temTcc && (
          <div style={{ border: "1px solid var(--borda)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--cor-marca)", marginBottom: 12 }}>Prontuário TCC — revise e edite se necessário</div>
            {TCC_SECOES.map((s) => (
              <div key={s.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>{s.rotulo}</label>
                <TextAreaVoz value={tcc[s.key] || ""} onChange={e => setTcc((prev) => ({ ...prev, [s.key]: e.target.value }))} rows={3} />
                {s.key === "tarefas" && (tcc.tarefas || "").trim() !== "" && (
                  <button type="button" className="botao-secundario" style={{ marginTop: 8 }} onClick={enviarTarefasWhatsApp}>
                    <Icone nome="message-circle" tamanho={14} /> Enviar tarefas por WhatsApp
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ border: "1px solid var(--borda)", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: 8 }}>O paciente está em crise?</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setCrise(crise === true ? null : true)}
              style={{ padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12.5, border: "2px solid #DC2626", background: crise === true ? "#DC2626" : "white", color: crise === true ? "white" : "#DC2626" }}>
              Sim, em crise
            </button>
            <button type="button" onClick={() => setCrise(crise === false ? null : false)}
              style={{ padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12.5, border: "2px solid #059669", background: crise === false ? "#059669" : "white", color: crise === false ? "white" : "#059669" }}>
              Não
            </button>
          </div>
          {crise === true && (
            <div style={{ marginTop: 10 }}>
              <label>Intensidade</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {INTENSIDADES_CRISE.map((i) => (
                  <button key={i.id} type="button" onClick={() => setIntensidadeCrise(i.id)}
                    style={{ padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12.5,
                      border: "2px solid " + i.cor, background: intensidadeCrise === i.id ? i.cor : "white", color: intensidadeCrise === i.id ? "white" : i.cor }}>
                    {i.rotulo}
                  </button>
                ))}
              </div>
              <label>Observação da crise <span className="opcional">(opcional)</span></label>
              <TextAreaVoz value={obsCrise} onChange={(e) => setObsCrise(e.target.value)} rows={2} placeholder="O que aconteceu, gatilho, duração..." />
            </div>
          )}
          {crise === null && <p style={{ fontSize: 11.5, color: "var(--texto-suave)", margin: "8px 0 0" }}>Sem resposta, nada é registrado sobre crise nesta sessão.</p>}
        </div>

        {rascunho && !notaExistente && (
          <p style={{ fontSize: 12, color: "var(--texto-suave)" }}>Rascunho recuperado: você não perdeu o que escreveu.</p>
        )}
        {salvoAuto && (
          <p style={{ fontSize: 12, color: "var(--sucesso)" }}>Anotação salva automaticamente.</p>
        )}
        {erro && <p className="mensagem-erro">{erro}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button className="botao-secundario" onClick={() => { try { sessionStorage.removeItem(chaveRascunho); } catch (e) {} aoFechar(); }}>Cancelar</button>
          <button className="botao-primario" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar anotação"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AbaSessoesTCC({ usuario, paciente }) {
  const [sessoes, setSessoes] = useState([]);
  const [notas, setNotas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const [sessaoModal, setSessaoModal] = useState(null);
  const [notasCarregadas, setNotasCarregadas] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [crises, setCrises] = useState([]);
  const [crisesCarregadas, setCrisesCarregadas] = useState(false);
  const cfg = useConfigProntuario(usuario.psiId);

  // Aberto pelo botão "Prontuário TCC" do sistema antigo: assim que as sessões
  // e as anotações carregam, abre a janela da sessão pedida. A sessão do sistema
  // antigo não existe aqui (de propósito: não cria sessão nem evento na agenda),
  // então ela vai como uma sessão avulsa com id "antigo:<id>". Se já houver
  // anotação para ela, reabre a existente em vez de criar outra.
  useEffect(() => {
    if (!acaoPorLinkPendente() || acaoPorLink.pacienteId !== paciente.id) return;
    if (carregando || !notasCarregadas || !crisesCarregadas) return;
    const sessaoId = "antigo:" + acaoPorLink.sessao;
    setSessaoModal({
      sessao: {
        id: sessaoId,
        data: acaoPorLink.data,
        horario: acaoPorLink.hora,
        pacoteId: null,
        origem: "clinica-antiga",
        sessaoAntigaId: acaoPorLink.sessao,
        pacoteAntigoId: acaoPorLink.pacote || null,
      },
      nota: notas.find((n) => n.sessaoId === sessaoId) || null,
    });
    encerrarAcaoPorLink();
  }, [carregando, notasCarregadas, crisesCarregadas]);

  useEffect(() => {
    const unsubSess = db.collection("clinica_sessoes")
      .where("psi_id", "==", usuario.psiId)
      .where("pacienteId", "==", paciente.id)
      .onSnapshot(
        (snap) => {
          const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          lista.sort((a, b) => (b.data || "").localeCompare(a.data || ""));
          setSessoes(lista);
          setCarregando(false);
        },
        () => setCarregando(false)
      );
    const unsubNotas = db.collection("clinica_prontuarios")
      .where("psi_id", "==", usuario.psiId)
      .where("pacienteId", "==", paciente.id)
      .onSnapshot(
        (snap) => { setNotas(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setNotasCarregadas(true); },
        () => setNotasCarregadas(true)
      );
    const unsubPerfil = db.collection("clinica_perfil_clinico")
      .where("psi_id", "==", usuario.psiId)
      .where("pacienteId", "==", paciente.id)
      .onSnapshot(
        (snap) => setPerfil(snap.docs.length ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null),
        () => setPerfil(null)
      );
    const unsubCrises = db.collection("clinica_crises")
      .where("psi_id", "==", usuario.psiId)
      .where("pacienteId", "==", paciente.id)
      .onSnapshot(
        (snap) => { setCrises(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setCrisesCarregadas(true); },
        () => setCrisesCarregadas(true)
      );
    return () => { unsubSess(); unsubNotas(); unsubPerfil(); unsubCrises(); };
  }, [usuario.psiId, paciente.id]);

  const mesesDisponiveis = [...new Set(sessoes.map((s) => (s.data || "").slice(0, 7)).filter(Boolean))].sort().reverse();
  // Mês escolhido na lista = período do primeiro ao último dia daquele mês.
  const mesFiltro = de && ate && de.endsWith("-01") && ate.endsWith("-31") && de.slice(0, 7) === ate.slice(0, 7) ? de.slice(0, 7) : "";
  const temPeriodo = !!(de || ate);
  const noPeriodo = (data) => !!data && (!de || data >= de) && (!ate || data <= ate);
  const comOrdem = (lista) => (ordem === "antigas" ? [...lista].reverse() : lista);
  const fmtBr = (iso) => (iso ? iso.split("-").reverse().join("/") : "");
  const sessoesExibidas = comOrdem(temPeriodo ? sessoes.filter((s) => noPeriodo(s.data)) : sessoes);

  // Anotações cuja sessão não está aqui (ex.: feitas pelo botão do sistema antigo
  // da clínica). Sem esta lista elas ficariam salvas mas invisíveis.
  const idsDasSessoes = new Set(sessoes.map((s) => s.id));
  const notasSemSessao = notas
    .filter((n) => !idsDasSessoes.has(n.sessaoId))
    .filter((n) => !temPeriodo || noPeriodo(n.data))
    .sort((a, b) => (ordem === "antigas" ? 1 : -1) * (a.data || "").localeCompare(b.data || ""));

  function gerarPdf() {
    if (de && ate && de > ate) { alert("A data inicial é depois da data final. Confira o período."); return; }
    const notasFiltradas = (temPeriodo ? notas.filter((n) => noPeriodo(n.data)) : [...notas])
      .sort((a, b) => (ordem === "antigas" ? 1 : -1) * (b.data || "").localeCompare(a.data || "") * -1);
    if (notasFiltradas.length === 0) {
      alert("Nenhuma anotação registrada" + (temPeriodo ? " neste período" : "") + ".");
      return;
    }
    const cor = cfg.corPrimaria || "#6A2BD9";
    const linhaCrp = [cfg.crp ? "CRP " + cfg.crp : "", cfg.tituloProfissional || ""].filter(Boolean).join(" · ");
    const periodo = !temPeriodo
      ? "Todas as sessões"
      : mesFiltro
        ? new Date(mesFiltro + "-01T12:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
        : (de && ate ? "de " + fmtBr(de) + " a " + fmtBr(ate) : de ? "a partir de " + fmtBr(de) : "até " + fmtBr(ate));
    const sessoesHtml = notasFiltradas.map((n) => {
      const dataFmt = n.data
        ? new Date(n.data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        : "—";
      const t = n.tcc || {};
      return (
        "<div style='margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #E5E7EB'>" +
        "<div style='font-size:13px;font-weight:700;color:" + cor + ";margin-bottom:14px;text-transform:uppercase'>" + dataFmt +
        (crises.find((c) => c.sessaoId === n.sessaoId) ? " <span style='color:#DC2626'>· crise " + crises.find((c) => c.sessaoId === n.sessaoId).intensidade + "</span>" : "") + "</div>" +
        TCC_SECOES.filter((s) => t[s.key]).map((s) =>
          "<div style='margin-bottom:10px'>" +
          "<div style='font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px'>" + s.rotulo + "</div>" +
          "<div style='font-size:12.5px;line-height:1.7;color:#1f2937;white-space:pre-wrap'>" + t[s.key] + "</div>" +
          "</div>"
        ).join("") +
        "</div>"
      );
    }).join("");
    const html =
      "<html><head><meta charset='UTF-8'><title>Prontuário TCC — " + paciente.nome + "</title>" +
      "<style>body{font-family:Arial,sans-serif;margin:40px;color:#1f2937;font-size:13px;line-height:1.6}" +
      "@media print{body{margin:20px}.no-print{display:none}}</style></head><body>" +
      "<div style='display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid " + cor + ";padding-bottom:14px;margin-bottom:24px'>" +
      "<div><div style='font-size:20px;font-weight:700;color:" + cor + "'>" + (cfg.nome || "Clínica") + "</div>" +
      (linhaCrp ? "<div style='font-size:11px;color:#6B7280'>" + linhaCrp + "</div>" : "") +
      (cfg.cidade ? "<div style='font-size:11px;color:#6B7280'>" + cfg.cidade + "</div>" : "") + "</div>" +
      (cfg.logoUrl ? "<img src='" + cfg.logoUrl + "' style='height:48px;object-fit:contain'>" : "") + "</div>" +
      "<div style='text-align:center;margin-bottom:24px'>" +
      "<div style='font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:1px'>Prontuário de Sessões TCC</div>" +
      "<div style='font-size:12px;color:#6B7280;margin-top:4px'>" + paciente.nome + " · " + periodo + "</div>" +
      (textoPerfilClinico(perfil) ? "<div style='font-size:11px;color:#6B7280;margin-top:4px'>" + textoPerfilClinico(perfil) + "</div>" : "") + "</div>" +
      sessoesHtml +
      "<div style='font-size:10px;color:#9CA3AF;text-align:center;margin-top:24px'>Documento confidencial — Resolução CFP nº 06/2019</div>" +
      "<div class='no-print' style='text-align:center;margin-top:20px'>" +
      "<button onclick='window.print()' style='background:" + cor + ";color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer'>Imprimir / Salvar PDF</button></div>" +
      "</body></html>";
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 600);
  }

  return (
    <div>
      <FaixaClinica perfil={perfil} crises={crises} />
      <PainelPerfilClinico usuario={usuario} paciente={paciente} perfil={perfil} />
      <PainelCrises usuario={usuario} paciente={paciente} crises={crises} />
      <div className="cartao-secao">
        <div className="titulo-cartao-secao"><Icone nome="notebook-pen" tamanho={16} /> Anotações de Sessão TCC</div>
        <p className="descricao-cartao-secao">Registre e organize as anotações de cada sessão no formato TCC com auxílio de IA. Gere relatórios em PDF por período.</p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
          <select className="campo-select" value={mesFiltro} onChange={(e) => {
            const m = e.target.value;
            setDe(m ? m + "-01" : "");
            setAte(m ? m + "-31" : "");
          }}>
            <option value="">Todos os meses</option>
            {mesesDisponiveis.map((m) => (
              <option key={m} value={m}>
                {new Date(m + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                {" "}({notas.filter((n) => (n.data || "").startsWith(m)).length} nota(s))
              </option>
            ))}
          </select>
          <button className="botao-secundario" onClick={gerarPdf}>
            <Icone nome="file-text" tamanho={15} /> Gerar PDF
          </button>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280" }}>De</label>
            <input type="date" className="campo-select" value={de} onChange={(e) => setDe(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280" }}>Até</label>
            <input type="date" className="campo-select" value={ate} onChange={(e) => setAte(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280" }}>Ordem</label>
            <select className="campo-select" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
              <option value="recentes">Mais recentes primeiro</option>
              <option value="antigas">Mais antigas primeiro</option>
            </select>
          </div>
          {temPeriodo && (
            <button className="botao-secundario" onClick={() => { setDe(""); setAte(""); }}>Limpar período</button>
          )}
        </div>
        <p className="descricao-cartao-secao" style={{ marginTop: -8 }}>O período e a ordem valem para a lista e para o PDF.</p>

        {carregando ? (
          <p className="texto-vazio">Carregando sessões...</p>
        ) : sessoesExibidas.length === 0 ? (
          <p className="texto-vazio">Nenhuma sessão{temPeriodo ? " neste período" : ""} encontrada para este paciente.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sessoesExibidas.map((s) => {
              const nota = notas.find((n) => n.sessaoId === s.id);
              const dataFmt = s.data
                ? new Date(s.data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                : "Data não definida";
              return (
                <div key={s.id} style={{ border: "1px solid var(--borda)", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{dataFmt}{s.horario ? " · " + s.horario : ""}</div>
                    <div style={{ fontSize: 11, color: "var(--texto-suave)", marginTop: 2 }}>
                      {[s.modalidade, s.status].filter(Boolean).join(" · ")}
                    </div>
                    {nota && (
                      <div style={{ fontSize: 11, color: "var(--sucesso)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                        <Icone nome="check-circle" tamanho={12} /> Anotação registrada
                      </div>
                    )}
                  </div>
                  <button
                    className={nota ? "botao-secundario" : "botao-primario"}
                    style={{ fontSize: 12, padding: "6px 14px" }}
                    onClick={() => setSessaoModal({ sessao: s, nota: nota || null })}
                  >
                    <Icone nome={nota ? "eye" : "notebook-pen"} tamanho={13} />
                    {" "}{nota ? "Ver / Editar" : "Anotar"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {notasSemSessao.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--texto-suave)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>
              Anotações de sessões que não estão no PsiCoWorking
            </div>
            <p className="descricao-cartao-secao" style={{ marginBottom: 10 }}>
              Registradas a partir do sistema antigo da clínica. A sessão e a agenda continuam lá; só a anotação fica aqui.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {notasSemSessao.map((n) => {
                const dataFmt = n.data
                  ? new Date(n.data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                  : "Data não definida";
                return (
                  <div key={n.id} style={{ border: "1px solid var(--borda)", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{dataFmt}</div>
                      <div style={{ fontSize: 11, color: "var(--sucesso)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                        <Icone nome="check-circle" tamanho={12} /> Anotação registrada
                      </div>
                    </div>
                    <button
                      className="botao-secundario"
                      style={{ fontSize: 12, padding: "6px 14px" }}
                      onClick={() => setSessaoModal({
                        sessao: {
                          id: n.sessaoId,
                          data: n.data,
                          horario: "",
                          pacoteId: n.pacoteId || null,
                          origem: n.origem || null,
                          sessaoAntigaId: n.sessaoAntigaId || null,
                          pacoteAntigoId: n.pacoteAntigoId || null,
                        },
                        nota: n,
                      })}
                    >
                      <Icone nome="eye" tamanho={13} /> Ver / Editar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {sessaoModal && (
        <ModalAnotacaoTCC
          usuario={usuario}
          paciente={paciente}
          sessao={sessaoModal.sessao}
          notaExistente={sessaoModal.nota}
          perfil={perfil}
          crises={crises}
          criseExistente={crises.find((c) => c.sessaoId === sessaoModal.sessao.id) || null}
          aoFechar={() => setSessaoModal(null)}
        />
      )}
    </div>
  );
}
