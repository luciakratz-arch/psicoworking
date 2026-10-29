// ═══════════════════════════════════════════════════════
//  ÁREA ADMINISTRATIVA — DRA. LUCIA KRATZ
//  questionarios.js — Questionários Clínicos
//  Contém: AbaQuestionarios, AbaAnamnese, AbaEntrevistaClinica,
//          AbaRastreamento (Bipolar), AbaRastreamentoNeuro,
//          AbaRastreamentoAlimentar, AbaRastreamentoSexual,
//          AbaRastreamentoDependencia, AbaRastreamentoJogos,
//          AbaLinksPartilhados
// ═══════════════════════════════════════════════════════

// Alias: este arquivo usa Icon/name/size; o admin-base usa Icone/nome/tamanho
const Icon = ({ name, size = 16 }) => React.createElement(Icone, { nome: name, tamanho: size });

// ── Aba Anamnese ─────────────────────────────────────────────────────────────
function gerarPDFAnamnese(paciente, anamnese, LABELS, SKIP){
  const ts = anamnese.createdAt?.toDate?.()?.toLocaleString("pt-BR")||"—";
  const respondente = anamnese.informanteTipo && anamnese.informanteTipo!=="proprio"
    ? (anamnese.nomeRespondente||anamnese.informanteTipo)+(anamnese.parentescoRespondente?" ("+anamnese.parentescoRespondente+")":"")
    : "A própria pessoa";
  const linhas = Object.entries(anamnese)
    .filter(([k,v])=>!SKIP.includes(k)&&k!=="queixa"&&v&&String(v).trim())
    .map(([k,v])=>`<tr><td style="font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;background:#f3f4f6;width:200px;padding:7px 10px;border:1px solid #e5e7eb;vertical-align:top">${LABELS[k]||k}</td><td style="padding:7px 10px;border:1px solid #e5e7eb;font-size:13px;vertical-align:top">${String(v)}</td></tr>`).join("");
  const w = window.open("","_blank");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Anamnese — ${paciente.nome}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:30px 40px;color:#1f2937}
  @page{margin:20mm}@media print{.no-print{display:none}}</style></head><body>
  <div style="border-bottom:2px solid #7B00C4;padding-bottom:14px;margin-bottom:18px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <h1 style="font-size:20px;color:#3d006a;margin-bottom:8px">📋 Anamnese — ${paciente.nome||"—"}</h1>
        <table style="font-size:12px;border-collapse:collapse;width:100%">
          <tr><td style="padding:3px 12px 3px 0;width:50%"><b>Perfil:</b> ${anamnese.perfil==="infantil"?"Infantil/Neurodesenvolvimento":"Adulto/Idoso"}</td>
              <td style="padding:3px 0"><b>Data de nascimento:</b> ${paciente.dataNasc||"—"}</td></tr>
          <tr><td style="padding:3px 12px 3px 0"><b>CPF:</b> ${paciente.cpf||"—"}</td>
              <td style="padding:3px 0"><b>Gênero:</b> ${paciente.genero||"—"}</td></tr>
          <tr><td style="padding:3px 12px 3px 0"><b>Telefone:</b> ${paciente.telefone||"—"}</td>
              <td style="padding:3px 0"><b>E-mail:</b> ${paciente.email||"—"}</td></tr>
          <tr><td style="padding:3px 12px 3px 0"><b>Escolaridade:</b> ${paciente.escolaridade||anamnese.escolaridade||"—"}</td>
              <td style="padding:3px 0"><b>Preenchido em:</b> ${ts}</td></tr>
          <tr><td colspan="2" style="padding:3px 0"><b>Respondido por:</b> ${respondente}</td></tr>
          ${paciente.encaminhador||anamnese.encaminhador?`<tr><td colspan="2" style="padding:3px 0"><b>Encaminhado por:</b> ${paciente.encaminhador||anamnese.encaminhador}</td></tr>`:""}
        </table>
      </div>
      <div style="text-align:right;font-size:11px;color:#6b7280">
        <div style="font-weight:700;color:#3d006a">Dra. Lucia Kratz</div>
        <div>Psicóloga · CRP 09/20590</div>
        <div>Goiânia, GO</div>
      </div>
    </div>
  </div>
  ${anamnese.queixa?`<div style="background:#f0f4ff;border-left:4px solid #4338ca;padding:10px 14px;margin-bottom:16px"><div style="font-size:10px;font-weight:700;color:#4338ca;text-transform:uppercase;margin-bottom:4px">Queixa Principal</div><div style="font-size:13.5px;line-height:1.6">${anamnese.queixa}</div></div>`:""}
  <table style="width:100%;border-collapse:collapse">${linhas}</table>
  <div style="margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center">
    Documento gerado em ${new Date().toLocaleString("pt-BR")} · Clínica Dra. Lucia Kratz
  </div>
  <div class="no-print" style="margin-top:20px;text-align:center">
    <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">🖨️ Imprimir / Salvar PDF</button>
  </div>
  </body></html>`);
  w.document.close();
}


// ═══════════════════════════════════════════════════════════════════
//  MÓDULO: QUESTIONÁRIOS — agrupa Anamnese + Rastreamento
// ═══════════════════════════════════════════════════════════════════
function AbaQuestionarios({ paciente }) {
  const [sub, setSub] = useState(null); // null | "anamnese" | "rastreamento"

  function abrirEntrevista() {
    const url = `https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/entrevista/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    window.open(url, "_blank");
  }

  if(sub==="anamnese") return (
    <div>
      <button onClick={()=>setSub(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--purple)",fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:20,padding:0}}>
        <Icon name="arrow-left" size={15}/> Voltar para Questionários
      </button>
      <AbaAnamnese paciente={paciente}/>
    </div>
  );

  if(sub==="sexual") return (
    <div>
      <button onClick={()=>setSub(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--purple)",fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:20,padding:0}}>
        <Icon name="arrow-left" size={15}/> Voltar para Questionários
      </button>
      <AbaRastreamentoSexual paciente={paciente}/>
    </div>
  );

  if(sub==="alimentar") return (
    <div>
      <button onClick={()=>setSub(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--purple)",fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:20,padding:0}}>
        <Icon name="arrow-left" size={15}/> Voltar para Questionários
      </button>
      <AbaRastreamentoAlimentar paciente={paciente}/>
    </div>
  );

  if(sub==="neuro") return (
    <div>
      <button onClick={()=>setSub(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--purple)",fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:20,padding:0}}>
        <Icon name="arrow-left" size={15}/> Voltar para Questionários
      </button>
      <AbaRastreamentoNeuro paciente={paciente}/>
    </div>
  );

  if(sub==="dependencia") return (
    <div>
      <button onClick={()=>setSub(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--purple)",fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:20,padding:0}}>
        <Icon name="arrow-left" size={15}/> Voltar para Questionários
      </button>
      <AbaRastreamentoDependencia paciente={paciente}/>
    </div>
  );

  if(sub==="jogos") return (
    <div>
      <button onClick={()=>setSub(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--purple)",fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:20,padding:0}}>
        <Icon name="arrow-left" size={15}/> Voltar para Questionários
      </button>
      <AbaRastreamentoJogos paciente={paciente}/>
    </div>
  );

  if(sub==="entrevista") return (
    <div>
      <button onClick={()=>setSub(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--purple)",fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:20,padding:0}}>
        <Icon name="arrow-left" size={15}/> Voltar para Questionários
      </button>
      <AbaEntrevistaClinica paciente={paciente}/>
    </div>
  );

  if(sub==="rastreamento") return (
    <div>
      <button onClick={()=>setSub(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--purple)",fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:20,padding:0}}>
        <Icon name="arrow-left" size={15}/> Voltar para Questionários
      </button>
      <AbaRastreamento paciente={paciente}/>
    </div>
  );

  // Tela de cards
  return (
    <div>
      <div style={{fontWeight:700,fontSize:15,color:"var(--text-dark)",marginBottom:4}}>Questionários Clínicos</div>
      <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:20}}>Selecione um questionário para visualizar ou enviar ao paciente.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>

        {/* Card Anamnese */}
        <div style={{border:"1px solid var(--gray-200)",borderRadius:14,padding:20,background:"white",cursor:"pointer",transition:"all .2s"}}
          onClick={()=>setSub("anamnese")}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#7B00C4"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--gray-200)"}>
          <div style={{fontSize:32,marginBottom:10}}>📋</div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text-dark)",marginBottom:4}}>Anamnese</div>
          <div style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.5,marginBottom:14}}>Formulário completo de anamnese — marcos do desenvolvimento, histórico clínico e familiar.</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{background:"var(--purple-light-bg)",color:"var(--purple)",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>
              📋 Ver anamnese →
            </span>
          </div>
        </div>

        {/* Card Entrevista Clínica Inicial */}
        <div style={{border:"1px solid var(--gray-200)",borderRadius:14,padding:20,background:"white",cursor:"pointer",transition:"all .2s"}}
          onClick={()=>setSub("entrevista")}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#7B00C4"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--gray-200)"}>
          <div style={{fontSize:32,marginBottom:10}}>🧠</div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text-dark)",marginBottom:4}}>Entrevista Clínica Inicial</div>
          <div style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.5,marginBottom:14}}>Instrumento de avaliação clínica inicial com perfil etário, escalas de observação e hipóteses diagnósticas DSM-5.</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{background:"#f0fdf4",color:"#16a34a",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>
              🧠 Ver entrevista →
            </span>
          </div>
        </div>

        {/* Card Rastreamento */}
        <div style={{border:"1px solid var(--gray-200)",borderRadius:14,padding:20,background:"white",cursor:"pointer",transition:"all .2s"}}
          onClick={()=>setSub("rastreamento")}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#7B00C4"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--gray-200)"}>
          <div style={{fontSize:32,marginBottom:10}}>📊</div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text-dark)",marginBottom:4}}>Rastreamento Bipolar / Borderline</div>
          <div style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.5,marginBottom:14}}>Avaliação diferencial DSM-5 — aplicado ao paciente e familiares, com laudo comparativo.</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{background:"#eff6ff",color:"#2563eb",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>
              📊 Ver rastreamento →
            </span>
          </div>
        </div>

        {/* Card Sexual */}
        <div style={{border:"1px solid var(--gray-200)",borderRadius:14,padding:20,background:"white",cursor:"pointer",transition:"all .2s"}}
          onClick={()=>setSub("sexual")}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#7B00C4"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--gray-200)"}>
          <div style={{fontSize:32,marginBottom:10}}>🌸</div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text-dark)",marginBottom:4}}>Saúde Sexual</div>
          <div style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.5,marginBottom:14}}>Rastreamento confidencial de saúde sexual — respondido apenas pelo próprio paciente.</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{background:"#fdf2f8",color:"#be185d",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>
              🌸 Ver rastreamento →
            </span>
          </div>
        </div>

        {/* Card Alimentar */}
        <div style={{border:"1px solid var(--gray-200)",borderRadius:14,padding:20,background:"white",cursor:"pointer",transition:"all .2s"}}
          onClick={()=>setSub("alimentar")}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#7B00C4"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--gray-200)"}>
          <div style={{fontSize:32,marginBottom:10}}>🍎</div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text-dark)",marginBottom:4}}>Hábitos Alimentares</div>
          <div style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.5,marginBottom:14}}>Rastreamento de padrões e comportamentos alimentares — avaliação diferencial DSM-5.</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{background:"#f0fdf4",color:"#16a34a",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>
              🍎 Ver rastreamento →
            </span>
          </div>
        </div>

        {/* Card Rastreamento Neuro */}
        <div style={{border:"1px solid var(--gray-200)",borderRadius:14,padding:20,background:"white",cursor:"pointer",transition:"all .2s"}}
          onClick={()=>setSub("neuro")}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#7B00C4"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--gray-200)"}>
          <div style={{fontSize:32,marginBottom:10}}>🧩</div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text-dark)",marginBottom:4}}>Funcionamento e Comportamento</div>
          <div style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.5,marginBottom:14}}>Rastreamento de atenção, agitação, interação social e comportamento — avaliação diferencial DSM-5.</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{background:"#fdf4ff",color:"#9333ea",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>
              🧩 Ver rastreamento →
            </span>
          </div>
        </div>

        {/* Card Dependência Química */}
        <div style={{border:"1px solid var(--gray-200)",borderRadius:14,padding:20,background:"white",cursor:"pointer",transition:"all .2s"}}
          onClick={()=>setSub("dependencia")}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#7B00C4"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--gray-200)"}>
          <div style={{fontSize:32,marginBottom:10}}>💊</div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text-dark)",marginBottom:4}}>Dependência Química e Substâncias</div>
          <div style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.5,marginBottom:14}}>Rastreamento dos 11 critérios DSM-5 para Transtornos por Uso de Substâncias — paciente e familiares.</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{background:"#fef3c7",color:"#b45309",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>
              💊 Ver rastreamento →
            </span>
          </div>
        </div>

        {/* Card Jogos e Apostas */}
        <div style={{border:"1px solid var(--gray-200)",borderRadius:14,padding:20,background:"white",cursor:"pointer",transition:"all .2s"}}
          onClick={()=>setSub("jogos")}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#7B00C4"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--gray-200)"}>
          <div style={{fontSize:32,marginBottom:10}}>🎮</div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text-dark)",marginBottom:4}}>Dependência de Jogos e Apostas</div>
          <div style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.5,marginBottom:14}}>Rastreamento de Gaming / Gambling Disorder — DSM-5 / CID-11 — paciente e familiares.</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{background:"#ecfdf5",color:"#047857",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>
              🎮 Ver rastreamento →
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  Rastreamento Dependência Química — sub-tela de Questionários
//  Coleção: clinica_rastreamento_dependencia
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS_DEPENDENCIA = [
  {id:"p1",  modulo:"Módulo A — Controle Prejudicado", texto:"Consumo em maiores quantidades ou por mais tempo do que o pretendido"},
  {id:"p2",  modulo:"Módulo A — Controle Prejudicado", texto:"Desejo persistente ou esforços infrutíferos para controlar o uso"},
  {id:"p3",  modulo:"Módulo A — Controle Prejudicado", texto:"Despendimento excessivo de tempo com a substância"},
  {id:"p4",  modulo:"Módulo A — Controle Prejudicado", texto:"Fissura (craving) — desejo imperioso de usar"},
  {id:"p5",  modulo:"Módulo B — Prejuízo Social",      texto:"Falha no cumprimento de obrigações importantes"},
  {id:"p6",  modulo:"Módulo B — Prejuízo Social",      texto:"Uso contínuo apesar de problemas sociais ou interpessoais"},
  {id:"p7",  modulo:"Módulo B — Prejuízo Social",      texto:"Abandono de atividades importantes por causa do uso"},
  {id:"p8",  modulo:"Módulo C — Uso de Risco",         texto:"Uso em situações de perigo físico"},
  {id:"p9",  modulo:"Módulo C — Uso de Risco",         texto:"Uso contínuo apesar de problemas físicos ou psicológicos"},
  {id:"p10", modulo:"Módulo D — Farmacológico",        texto:"Tolerância — necessidade de doses crescentes"},
  {id:"p11", modulo:"Módulo D — Farmacológico",        texto:"Abstinência — síndrome ao parar ou uso para evitar mal-estar"},
];

function AbaRastreamentoDependencia({ paciente }) {
  const [docs, setDocs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selecionado, setSelecionado] = React.useState(null);
  const COR = {A:"#16a34a", B:"#d97706", C:"#dc2626"};

  React.useEffect(()=>{
    if(!paciente?.nome) return;
    db.collection("clinica_rastreamento_dependencia")
      .where("pacienteNome","==",paciente.nome)
      .get()
      .then(snap=>{
        const lista = snap.docs.map(d=>({id:d.id,...d.data()}))
          .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
        setDocs(lista);
        setLoading(false);
      })
      .catch(()=>setLoading(false));
  },[paciente?.nome]);

  function copiarLink(){
    const url = `https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/dependencia/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    navigator.clipboard.writeText(url).then(()=>alert("✓ Link copiado!\n"+url));
  }

  function enviarWhatsApp(){
    const url = `https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/dependencia/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    const msg = `Olá! 😊\n\nSua psicóloga Dra. Lucia Kratz preparou um questionário clínico para você preencher.\n\n*Questionário Clínico*\nResponda com calma e honestidade — leva cerca de 8 a 12 minutos.\n\n${url}\n\nQualquer dúvida, estou por aqui!\n_Dra. Lucia Kratz · CRP 09/20590_`;
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  }

  function calcularCriterios(doc){
    const C = PERGUNTAS_DEPENDENCIA.filter(p=>doc[p.id]==="C").length;
    const B = PERGUNTAS_DEPENDENCIA.filter(p=>doc[p.id]==="B").length;
    const total = C + B;
    let gravidade = "—";
    if(total>=6) gravidade="⚠ Grave (6+ critérios)";
    else if(total>=4) gravidade="⚡ Moderada (4-5 critérios)";
    else if(total>=2) gravidade="🟡 Leve (2-3 critérios)";
    else gravidade="✅ Abaixo do limiar diagnóstico";
    return {C, B, total, gravidade};
  }

  function gerarLaudo(){
    if(docs.length===0){alert("Nenhuma resposta para gerar laudo.");return;}
    const pacNome = paciente.nome||"Paciente";
    const data = new Date().toLocaleDateString("pt-BR");
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Laudo Rastreamento Dependência Química — ${pacNome}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#1f2937;padding:32px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6}
h1{font-size:20px;color:#3d006a;margin-bottom:4px}
h2{font-size:14px;color:#7B00C4;margin:20px 0 8px;border-bottom:1px solid #ede9fe;padding-bottom:4px}
h3{font-size:12.5px;color:#374151;margin:12px 0 6px}
.header{border-bottom:2px solid #7B00C4;padding-bottom:16px;margin-bottom:20px}
.sub{font-size:12px;color:#6b7280;margin-top:2px}
.gravidade{background:#f5f3ff;border:1px solid #c4b5fd;border-radius:10px;padding:14px 18px;margin:12px 0;font-size:15px;font-weight:700;color:#3d006a}
.resp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
.resp-table th{background:#f5f3ff;padding:6px 10px;text-align:left;font-size:10.5px;color:#7B00C4;border:1px solid #ede9fe}
.resp-table td{padding:6px 10px;border:1px solid #e5e7eb;vertical-align:top}
.resp-table tr:nth-child(even) td{background:#fafafa}
.assinatura{text-align:center;margin-top:40px}
.assinatura img{height:60px;opacity:.9}
.assinatura p{font-size:12px;color:#374151;margin-top:6px}
.rodape{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
@media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px">Imprimir / Salvar PDF</button>
</div>
<div class="header">
  <h1>Laudo de Rastreamento — Dependência Química e Substâncias</h1>
  <div class="sub">Paciente: <strong>${pacNome}</strong> · Data: ${data} · Dra. Lucia Kratz · CRP 09/20590</div>
  <div class="sub">Respondentes: ${docs.length} (${docs.map(d=>d.tipoRespondente==="paciente"?"próprio paciente":d.parentesco||"familiar").join(", ")})</div>
</div>
${docs.map(doc=>{
  const cr = calcularCriterios(doc);
  return `
<h2>Respondente: ${doc.tipoRespondente==="paciente"?"Próprio paciente":(doc.nomeRespondente||"Familiar")+" ("+( doc.parentesco||"—")+")"}</h2>
<div class="gravidade">Critérios preenchidos: ${cr.total}/11 &nbsp;·&nbsp; ${cr.gravidade}</div>
<p style="font-size:12px;color:#4b5563;margin-bottom:10px">Respostas C (critério pleno): <strong>${cr.C}</strong> &nbsp;|&nbsp; Respostas B (parcial/subclínico): <strong>${cr.B}</strong></p>
<table class="resp-table"><thead><tr><th>#</th><th>Critério</th><th>Módulo</th><th>Resp.</th></tr></thead><tbody>
${PERGUNTAS_DEPENDENCIA.map(p=>`<tr><td>${p.id.replace("p","")}</td><td>${p.texto}</td><td>${p.modulo}</td><td style="font-weight:700;color:${COR[doc[p.id]]||"#6b7280"}">${doc[p.id]||"—"}</td></tr>`).join("")}
${doc.obsFinais?`<tr><td colspan="2"><strong>Observações</strong></td><td colspan="2">${doc.obsFinais}</td></tr>`:""}
</tbody></table>`;
}).join("")}
<div class="assinatura">
  <img src="https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/Assinatura%20Lu%C3%ADcia%20Kratz.png" alt="Assinatura" onerror="this.style.display='none'"/>
  <p><strong>Dra. Lucia Kratz</strong><br/>Psicóloga · CRP 09/20590<br/>Doutora em Psicologia · TCC · Musicoterapia · Neuromodulação</p>
</div>
<div class="rodape">Documento gerado em ${data} · Uso exclusivo para fins clínicos · Confidencial · LGPD</div>
</body></html>`;
    const w = window.open("","_blank");
    w.document.write(html);
    w.document.close();
  }

  if(loading) return React.createElement("div",{style:{padding:40,textAlign:"center"}},React.createElement(Spinner,null));

  return (
    <div>
      <div style={{fontWeight:700,fontSize:15,color:"var(--text-dark)",marginBottom:4}}>Rastreamento de Dependência Química e Substâncias</div>
      <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:20}}>11 critérios DSM-5 · Instrumento aplicado ao paciente e/ou familiares</div>

      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
        <button onClick={copiarLink} style={{display:"flex",alignItems:"center",gap:6,background:"var(--purple-light-bg)",color:"var(--purple)",border:"none",borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          <Icon name="link" size={14}/> Copiar Link
        </button>
        <button onClick={enviarWhatsApp} style={{display:"flex",alignItems:"center",gap:6,background:"#dcfce7",color:"#15803d",border:"none",borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          <Icon name="message-circle" size={14}/> Enviar via WhatsApp
        </button>
        {docs.length>0&&<button onClick={gerarLaudo} style={{display:"flex",alignItems:"center",gap:6,background:"#fef3c7",color:"#b45309",border:"none",borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          <Icon name="file-text" size={14}/> Gerar Laudo PDF
        </button>}
      </div>

      {docs.length===0 ? (
        <div style={{background:"#f9fafb",border:"1px dashed #d1d5db",borderRadius:12,padding:32,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>
          Nenhuma resposta recebida ainda.<br/>Copie o link acima e envie ao paciente ou familiar.
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {docs.map(doc=>{
            const cr = calcularCriterios(doc);
            const isOpen = selecionado===doc.id;
            const corGrav = cr.total>=6?"#dc2626":cr.total>=4?"#d97706":cr.total>=2?"#b45309":"#16a34a";
            return (
              <div key={doc.id} style={{border:"1px solid #e5e7eb",borderRadius:12,overflow:"hidden"}}>
                <div onClick={()=>setSelecionado(isOpen?null:doc.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",cursor:"pointer",background:isOpen?"#f5f3ff":"white"}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:"var(--text-dark)"}}>
                      {doc.tipoRespondente==="paciente"?"🧑 Próprio paciente":"👨‍👩‍👧 "+(doc.nomeRespondente||"Familiar")+" · "+(doc.parentesco||"")}
                    </div>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>
                      {doc.createdAt?.seconds ? new Date(doc.createdAt.seconds*1000).toLocaleDateString("pt-BR") : "—"}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,fontSize:12,color:corGrav}}>{cr.gravidade}</div>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{cr.total} critérios / 11</div>
                  </div>
                </div>
                {isOpen&&(
                  <div style={{borderTop:"1px solid #e5e7eb",padding:16}}>
                    {PERGUNTAS_DEPENDENCIA.map(p=>(
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid #f3f4f6"}}>
                        <div style={{width:24,height:24,minWidth:24,borderRadius:"50%",background:doc[p.id]?COR[doc[p.id]]+"22":"#f3f4f6",border:"2px solid "+(doc[p.id]?COR[doc[p.id]]:"#e5e7eb"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:doc[p.id]?COR[doc[p.id]]:"#9ca3af"}}>
                          {doc[p.id]||"—"}
                        </div>
                        <div style={{fontSize:12,color:"#374151",flex:1}}>{p.texto}</div>
                        <div style={{fontSize:10,color:"#9ca3af",whiteSpace:"nowrap"}}>{p.modulo.split("—")[0].trim()}</div>
                      </div>
                    ))}
                    {doc.obsFinais&&<div style={{marginTop:12,background:"#f9fafb",borderRadius:8,padding:"10px 12px",fontSize:12,color:"#4b5563"}}><strong>Observações:</strong> {doc.obsFinais}</div>}
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


// ═══════════════════════════════════════════════════════════════════
//  Rastreamento Jogos e Apostas — sub-tela de Questionários
//  Coleção: clinica_rastreamento_jogos
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS_JOGOS = [
  {id:"p1", modulo:"Módulo A — Preocupação/Abstinência",  texto:"Preocupação mental excessiva com jogos"},
  {id:"p2", modulo:"Módulo A — Preocupação/Abstinência",  texto:"Sintomas de abstinência ao parar (irritabilidade, ansiedade)"},
  {id:"p3", modulo:"Módulo B — Tolerância/Controle",      texto:"Tolerância — necessidade crescente de tempo ou dinheiro"},
  {id:"p4", modulo:"Módulo B — Tolerância/Controle",      texto:"Tentativas infrutíferas de controlar ou cessar o jogo"},
  {id:"p5", modulo:"Módulo B — Tolerância/Controle",      texto:"Abandono de outros hobbies e atividades sociais"},
  {id:"p6", modulo:"Módulo C — Consequências",            texto:"Continuidade apesar de problemas graves"},
  {id:"p7", modulo:"Módulo C — Consequências",            texto:"Ocultação e mentiras sobre a extensão do hábito"},
  {id:"p8", modulo:"Módulo C — Consequências",            texto:"Uso do jogo como fuga de problemas emocionais"},
  {id:"p9", modulo:"Módulo D — Prejuízo Funcional",       texto:"Perda ou risco severo de emprego, estudos ou relacionamentos"},
];

function AbaRastreamentoJogos({ paciente }) {
  const [docs, setDocs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selecionado, setSelecionado] = React.useState(null);
  const COR = {A:"#16a34a", B:"#d97706", C:"#dc2626"};

  React.useEffect(()=>{
    if(!paciente?.nome) return;
    db.collection("clinica_rastreamento_jogos")
      .where("pacienteNome","==",paciente.nome)
      .get()
      .then(snap=>{
        const lista = snap.docs.map(d=>({id:d.id,...d.data()}))
          .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
        setDocs(lista);
        setLoading(false);
      })
      .catch(()=>setLoading(false));
  },[paciente?.nome]);

  function copiarLink(){
    const url = `https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/jogos/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    navigator.clipboard.writeText(url).then(()=>alert("✓ Link copiado!\n"+url));
  }

  function enviarWhatsApp(){
    const url = `https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/jogos/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    const msg = `Olá! 😊\n\nSua psicóloga Dra. Lucia Kratz preparou um questionário clínico para você preencher.\n\n*Questionário Clínico*\nResponda com calma e honestidade — leva cerca de 5 a 10 minutos.\n\n${url}\n\nQualquer dúvida, estou por aqui!\n_Dra. Lucia Kratz · CRP 09/20590_`;
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  }

  function calcularCriterios(doc){
    const C = PERGUNTAS_JOGOS.filter(p=>doc[p.id]==="C").length;
    const B = PERGUNTAS_JOGOS.filter(p=>doc[p.id]==="B").length;
    const total = C + B;
    let gravidade = "—";
    if(total>=6) gravidade="⚠ Grave (6+ critérios)";
    else if(total>=4) gravidade="⚡ Moderada (4-5 critérios)";
    else if(total>=2) gravidade="🟡 Leve (2-3 critérios)";
    else gravidade="✅ Abaixo do limiar diagnóstico";
    return {C, B, total, gravidade};
  }

  function gerarLaudo(){
    if(docs.length===0){alert("Nenhuma resposta para gerar laudo.");return;}
    const pacNome = paciente.nome||"Paciente";
    const data = new Date().toLocaleDateString("pt-BR");
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Laudo Rastreamento Jogos e Apostas — ${pacNome}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#1f2937;padding:32px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6}
h1{font-size:20px;color:#3d006a;margin-bottom:4px}
h2{font-size:14px;color:#7B00C4;margin:20px 0 8px;border-bottom:1px solid #ede9fe;padding-bottom:4px}
h3{font-size:12.5px;color:#374151;margin:12px 0 6px}
.header{border-bottom:2px solid #7B00C4;padding-bottom:16px;margin-bottom:20px}
.sub{font-size:12px;color:#6b7280;margin-top:2px}
.gravidade{background:#f5f3ff;border:1px solid #c4b5fd;border-radius:10px;padding:14px 18px;margin:12px 0;font-size:15px;font-weight:700;color:#3d006a}
.resp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
.resp-table th{background:#f5f3ff;padding:6px 10px;text-align:left;font-size:10.5px;color:#7B00C4;border:1px solid #ede9fe}
.resp-table td{padding:6px 10px;border:1px solid #e5e7eb;vertical-align:top}
.resp-table tr:nth-child(even) td{background:#fafafa}
.assinatura{text-align:center;margin-top:40px}
.assinatura img{height:60px;opacity:.9}
.assinatura p{font-size:12px;color:#374151;margin-top:6px}
.rodape{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
@media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px">Imprimir / Salvar PDF</button>
</div>
<div class="header">
  <h1>Laudo de Rastreamento — Dependência de Jogos e Apostas</h1>
  <div class="sub">Paciente: <strong>${pacNome}</strong> · Data: ${data} · Dra. Lucia Kratz · CRP 09/20590</div>
  <div class="sub">Respondentes: ${docs.length} (${docs.map(d=>d.tipoRespondente==="paciente"?"próprio paciente":d.parentesco||"familiar").join(", ")})</div>
</div>
${docs.map(doc=>{
  const cr = calcularCriterios(doc);
  return `
<h2>Respondente: ${doc.tipoRespondente==="paciente"?"Próprio paciente":(doc.nomeRespondente||"Familiar")+" ("+(doc.parentesco||"—")+")"}</h2>
<div class="gravidade">Critérios preenchidos: ${cr.total}/9 &nbsp;·&nbsp; ${cr.gravidade}</div>
<p style="font-size:12px;color:#4b5563;margin-bottom:10px">Respostas C (critério pleno): <strong>${cr.C}</strong> &nbsp;|&nbsp; Respostas B (parcial/subclínico): <strong>${cr.B}</strong></p>
<table class="resp-table"><thead><tr><th>#</th><th>Critério</th><th>Módulo</th><th>Resp.</th></tr></thead><tbody>
${PERGUNTAS_JOGOS.map(p=>`<tr><td>${p.id.replace("p","")}</td><td>${p.texto}</td><td>${p.modulo}</td><td style="font-weight:700;color:${COR[doc[p.id]]||"#6b7280"}">${doc[p.id]||"—"}</td></tr>`).join("")}
${doc.obsFinais?`<tr><td colspan="2"><strong>Observações</strong></td><td colspan="2">${doc.obsFinais}</td></tr>`:""}
</tbody></table>`;
}).join("")}
<div class="assinatura">
  <img src="https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/Assinatura%20Lu%C3%ADcia%20Kratz.png" alt="Assinatura" onerror="this.style.display='none'"/>
  <p><strong>Dra. Lucia Kratz</strong><br/>Psicóloga · CRP 09/20590<br/>Doutora em Psicologia · TCC · Musicoterapia · Neuromodulação</p>
</div>
<div class="rodape">Documento gerado em ${data} · Uso exclusivo para fins clínicos · Confidencial · LGPD</div>
</body></html>`;
    const w = window.open("","_blank");
    w.document.write(html);
    w.document.close();
  }

  if(loading) return React.createElement("div",{style:{padding:40,textAlign:"center"}},React.createElement(Spinner,null));

  return (
    <div>
      <div style={{fontWeight:700,fontSize:15,color:"var(--text-dark)",marginBottom:4}}>Rastreamento de Dependência de Jogos e Apostas</div>
      <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:20}}>9 critérios DSM-5 / CID-11 · Instrumento aplicado ao paciente e/ou familiares</div>

      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
        <button onClick={copiarLink} style={{display:"flex",alignItems:"center",gap:6,background:"var(--purple-light-bg)",color:"var(--purple)",border:"none",borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          <Icon name="link" size={14}/> Copiar Link
        </button>
        <button onClick={enviarWhatsApp} style={{display:"flex",alignItems:"center",gap:6,background:"#dcfce7",color:"#15803d",border:"none",borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          <Icon name="message-circle" size={14}/> Enviar via WhatsApp
        </button>
        {docs.length>0&&<button onClick={gerarLaudo} style={{display:"flex",alignItems:"center",gap:6,background:"#ecfdf5",color:"#047857",border:"none",borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          <Icon name="file-text" size={14}/> Gerar Laudo PDF
        </button>}
      </div>

      {docs.length===0 ? (
        <div style={{background:"#f9fafb",border:"1px dashed #d1d5db",borderRadius:12,padding:32,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>
          Nenhuma resposta recebida ainda.<br/>Copie o link acima e envie ao paciente ou familiar.
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {docs.map(doc=>{
            const cr = calcularCriterios(doc);
            const isOpen = selecionado===doc.id;
            const corGrav = cr.total>=6?"#dc2626":cr.total>=4?"#d97706":cr.total>=2?"#b45309":"#16a34a";
            return (
              <div key={doc.id} style={{border:"1px solid #e5e7eb",borderRadius:12,overflow:"hidden"}}>
                <div onClick={()=>setSelecionado(isOpen?null:doc.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",cursor:"pointer",background:isOpen?"#f5f3ff":"white"}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:"var(--text-dark)"}}>
                      {doc.tipoRespondente==="paciente"?"🧑 Próprio paciente":"👨‍👩‍👧 "+(doc.nomeRespondente||"Familiar")+" · "+(doc.parentesco||"")}
                    </div>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>
                      {doc.createdAt?.seconds ? new Date(doc.createdAt.seconds*1000).toLocaleDateString("pt-BR") : "—"}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,fontSize:12,color:corGrav}}>{cr.gravidade}</div>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{cr.total} critérios / 9</div>
                  </div>
                </div>
                {isOpen&&(
                  <div style={{borderTop:"1px solid #e5e7eb",padding:16}}>
                    {PERGUNTAS_JOGOS.map(p=>(
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid #f3f4f6"}}>
                        <div style={{width:24,height:24,minWidth:24,borderRadius:"50%",background:doc[p.id]?COR[doc[p.id]]+"22":"#f3f4f6",border:"2px solid "+(doc[p.id]?COR[doc[p.id]]:"#e5e7eb"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:doc[p.id]?COR[doc[p.id]]:"#9ca3af"}}>
                          {doc[p.id]||"—"}
                        </div>
                        <div style={{fontSize:12,color:"#374151",flex:1}}>{p.texto}</div>
                        <div style={{fontSize:10,color:"#9ca3af",whiteSpace:"nowrap"}}>{p.modulo.split("—")[0].trim()}</div>
                      </div>
                    ))}
                    {doc.obsFinais&&<div style={{marginTop:12,background:"#f9fafb",borderRadius:8,padding:"10px 12px",fontSize:12,color:"#4b5563"}}><strong>Observações:</strong> {doc.obsFinais}</div>}
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


// ═══════════════════════════════════════════════════════════════════
//  Entrevista Clínica Inicial — sub-tela de Questionários
// ═══════════════════════════════════════════════════════════════════
function AbaEntrevistaClinica({ paciente }) {
  const [link, setLink] = useState(null);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const BASE = "https://luciakratz-arch.github.io/clinica-dra.LuciaKratz";

  useEffect(()=>{
    db.collection("clinica_links_partilhados")
      .where("pacienteId","==",paciente.id)
      .where("tipoFerramenta","==","entrevista")
      .where("status","==","pendente")
      .get()
      .then(snap=>{
        if(!snap.empty) setLink({id:snap.docs[0].id,...snap.docs[0].data()});
      });
  },[paciente?.id]);

  async function gerarLink() {
    setGerando(true);
    try {
      const token = Math.random().toString(36).substring(2,10).toUpperCase()+Math.random().toString(36).substring(2,10).toUpperCase();
      const ref = await db.collection("clinica_links_partilhados").add({
        pacienteId: paciente.id, pacienteNome: paciente.nome||"",
        tipoFerramenta: "entrevista", token, status: "pendente",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      setLink({id:ref.id, token, status:"pendente"});
    } catch(e){ alert("Erro: "+e.message); }
    setGerando(false);
  }

  function copiarLink() {
    const url = `${BASE}/responder?token=${link.token}`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(()=>setCopiado(false),2000);
  }

  function enviarWhatsApp() {
    const url = `${BASE}/responder?token=${link.token}`;
    const nome = paciente.nome?.split(" ")[0]||"paciente";
    const msg = `Olá, ${nome}! 😊

Sua psicóloga Dra. Lucia Kratz enviou um formulário para você preencher:

🧠 *Entrevista Clínica Inicial*

Acesse pelo link abaixo e responda com calma — suas respostas vão direto para o prontuário:
${url}

Qualquer dúvida, estou por aqui!
_Dra. Lucia Kratz · CRP 09/20590_`;
    window.open(`https://api.whatsapp.com/send?phone=55${(paciente.telefone||"").replace(/\D/g,"")}&text=${encodeURIComponent(msg)}`,"_blank");
  }

  return (
    <div>
      <div style={{fontWeight:700,fontSize:15,color:"var(--text-dark)",marginBottom:4}}>Entrevista Clínica Inicial</div>
      <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:20}}>Instrumento de avaliação clínica inicial com perfil etário, escalas de observação e hipóteses diagnósticas DSM-5.</div>

      <div style={{border:"1.5px solid",borderColor:link?"var(--purple)":"var(--gray-200)",borderRadius:12,padding:"14px 16px",background:link?"var(--purple-soft)":"white"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:link?12:0}}>
          <div style={{fontSize:24}}>🧠</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:13}}>Entrevista Clínica Inicial (DSM-5)</div>
            <div style={{fontSize:11,color:"var(--text-muted)"}}>Instrumento de avaliação clínica inicial</div>
          </div>
          {link && <span style={{background:"#fef3c7",color:"#d97706",padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>⏱ Pendente</span>}
          <button className="btn btn-outline" style={{padding:"6px 12px",fontSize:12,flexShrink:0}}
            onClick={gerarLink} disabled={gerando}>
            <Icon name="link" size={13}/>
            {gerando?"Gerando...":link?"Novo Link":"Gerar Link"}
          </button>
        </div>

        {link && (
          <div style={{marginTop:4}}>
            <div style={{display:"flex",alignItems:"center",gap:8,background:"white",border:"1px solid var(--gray-200)",borderRadius:8,padding:"8px 12px",marginBottom:10}}>
              <Icon name="link" size={13} style={{color:"var(--text-muted)",flexShrink:0}}/>
              <span style={{fontSize:11,color:"var(--text-muted)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {`https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/responder?token=${link.token}`}
              </span>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button className="btn btn-outline" style={{padding:"7px 14px",fontSize:12}} onClick={copiarLink}>
                <Icon name={copiado?"check":"copy"} size={13}/>
                {copiado?"Copiado!":"Copiar Link"}
              </button>
              <button className="btn btn-purple" style={{padding:"7px 14px",fontSize:12}} onClick={enviarWhatsApp}>
                <Icon name="message-circle" size={13}/> Enviar pelo WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AbaAnamnese({paciente}){
  const [anamnese, setAnamnese] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(!paciente?.id) return;
    db.collection("clinica_anamneses")
      .where("pacienteNome","==",paciente.nome)
      .get()
      .then(snap=>{
        if(!snap.empty){
          const doc = snap.docs[0];
          setAnamnese({id:doc.id,...doc.data()});
        }
        setLoading(false);
      })
      .catch(()=>setLoading(false));
  },[paciente?.id]);

  const LABELS = {
    perfil:"Perfil",informanteTipo:"Quem respondeu",nomeRespondente:"Nome do respondente",
    parentescoRespondente:"Parentesco",queixa:"Queixa Principal",
    gestacaoPlanejada:"Gestação planejada",tipoParto:"Tipo de parto",
    idadeGestacional:"Idade gestacional",choroNascer:"Chorou ao nascer",
    sustCabeca:"Firmou a cabeça",sentou:"Sentou sozinho",engatinhou:"Engatinhou",
    caminhou:"Caminhou",lateralidade:"Lateralidade",balbucio:"Balbucio",
    primeirasParalavras:"Primeiras palavras",frasesSimples:"Frases simples",
    clarezaFala:"Clareza da fala",contatoVisual:"Contato visual",
    sorrisoSocial:"Sorriso social",padraOSono:"Padrão de sono",
    padraoAlimentar:"Padrão alimentar",desfralDiurno:"Desfralde diurno",
    desfralNoturno:"Desfralde noturno",idadeEscola:"Idade na escola",
    adaptacaoEscola:"Adaptação escolar",repetencia:"Repetência",
    facilidades:"Facilidades",dificuldades:"Dificuldades",
    foco:"Atenção/Foco",organizacao:"Organização",memoria:"Memória",
    convulsoes:"Convulsões/Desmaios",medicacoes:"Medicações",
    historicoFamiliar:"Histórico familiar",obsFinais:"Observações finais",
    // Adulto
    escolaridade:"Escolaridade",profissao:"Profissão",comQuemMora:"Com quem mora",
    contextoEncaminhamento:"Contexto do encaminhamento",inicioQueixa:"Início dos sintomas",
    evolucaoQueixa:"Evolução",usoAlcoolDrogas:"Uso de álcool/drogas",
    memoria:"Memória",orientacao:"Orientação",atencao:"Atenção",
    decisoes:"Tomada de decisões",avdBasicas:"Higiene/vestir",
    avdFinanceiro:"Gestão financeira",avdSair:"Sair sozinho",
    doencasCronicas:"Doenças crônicas",quedas:"Quedas frequentes",
    marcha:"Alteração de marcha",tremores:"Tremores",confusaoNoturna:"Confusão noturna",
  };

  const SKIP = ["pacienteId","pacienteNome","tipo","createdAt","id","perfil","informanteTipo","nomeRespondente","parentescoRespondente"];

  if(loading) return <div style={{padding:40,textAlign:"center"}}><Spinner/></div>;

  if(!anamnese) return (
    <div style={{textAlign:"center",padding:40,color:"var(--text-muted)"}}>
      <div style={{fontSize:40,marginBottom:12}}>📋</div>
      <div style={{fontWeight:600,marginBottom:6}}>Nenhuma anamnese encontrada</div>
      <div style={{fontSize:13}}>O paciente ainda não preencheu o formulário de anamnese.</div>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20,flexWrap:"wrap",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{background:"var(--purple-light-bg)",color:"var(--purple)",padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:600}}>
            {anamnese.perfil==="infantil"?"👶 Infantil/Neurodesenvolvimento":"🧑 Adulto/Idoso"}
          </div>
          {anamnese.informanteTipo && anamnese.informanteTipo!=="proprio" && (
            <div style={{background:"#f3f4f6",color:"#374151",padding:"4px 12px",borderRadius:20,fontSize:12}}>
              Respondido por: {anamnese.nomeRespondente||anamnese.informanteTipo} {anamnese.parentescoRespondente?"("+anamnese.parentescoRespondente+")":""}
            </div>
          )}
        </div>
        <button className="btn btn-ghost" style={{fontSize:12,color:"var(--purple)",border:"1px solid var(--purple)",padding:"7px 14px"}}
          onClick={()=>gerarPDFAnamnese(paciente,anamnese,LABELS,SKIP)}>
          <Icon name="file-text" size={13}/> Gerar PDF
        </button>
      </div>

      {/* Queixa em destaque */}
      {anamnese.queixa && (
        <div style={{background:"#f0f4ff",border:"1px solid #c7d2fe",borderRadius:12,padding:16,marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,color:"#4338ca",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Queixa Principal</div>
          <div style={{fontSize:14,color:"#1f2937",lineHeight:1.7}}>{anamnese.queixa}</div>
        </div>
      )}

      {/* Demais campos */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {Object.entries(anamnese)
          .filter(([k,v])=>!SKIP.includes(k)&&v&&String(v).trim())
          .map(([k,v])=>(
            <div key={k} style={{background:"var(--gray-50)",border:"1px solid var(--gray-200)",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:10.5,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>
                {LABELS[k]||k}
              </div>
              <div style={{fontSize:13.5,color:"var(--text-dark)",lineHeight:1.55}}>{String(v)}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function AbaCasal({ paciente, pacientes }) {
  const [casalId, setCasalId] = useState(paciente.casalId||"");
  const [salvando, setSalvando] = useState(false);
  const parceiro = pacientes.find(p=>p.id===paciente.casalId);
  const outros = pacientes.filter(p=>p.id!==paciente.id&&p.status==="ativo").sort((a,b)=>(a.nome||"").localeCompare(b.nome||"","pt-BR"));

  async function vincular() {
    if(!casalId){alert("Selecione o parceiro(a).");return;}
    if(casalId===paciente.id){alert("Selecione um paciente diferente.");return;}
    setSalvando(true);
    try {
      const p2 = pacientes.find(p=>p.id===casalId);
      // 1. Remove vínculo antigo de clinica_casais se existir (evita duplicatas)
      const snapAntigo1 = await db.collection("clinica_casais").where("p1Id","==",paciente.id).get();
      const snapAntigo2 = await db.collection("clinica_casais").where("p2Id","==",paciente.id).get();
      const batch = db.batch();
      [...snapAntigo1.docs, ...snapAntigo2.docs].forEach(d=>batch.delete(d.ref));
      await batch.commit();
      // 2. Cria novo documento em clinica_casais
      await db.collection("clinica_casais").add({
        p1Id: paciente.id, p1Nome: paciente.nome||"",
        p2Id: casalId,     p2Nome: p2?.nome||"",
        nomeCasal: `${paciente.nome?.split(" ")[0]||""} e ${p2?.nome?.split(" ")[0]||""}`,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      // 3. Grava casalId + mod5 nos dois pacientes
      await db.collection("clinica_pacientes").doc(paciente.id).update({
        casalId,
        modulosAtivos: firebase.firestore.FieldValue.arrayUnion("mod5")
      });
      await db.collection("clinica_pacientes").doc(casalId).update({
        casalId: paciente.id,
        modulosAtivos: firebase.firestore.FieldValue.arrayUnion("mod5")
      });
      alert("✓ Casal vinculado! Ambos terão acesso à Terapia de Casal no portal.");
    } catch(e) { alert("Erro ao vincular: "+e.message); }
    setSalvando(false);
  }
  async function desvincular() {
    if(!confirm("Desvincular casal?"))return;
    setSalvando(true);
    try {
      const parcId = paciente.casalId;
      // 1. Limpa casalId nos dois pacientes
      await db.collection("clinica_pacientes").doc(paciente.id).update({casalId:""});
      if(parcId) await db.collection("clinica_pacientes").doc(parcId).update({casalId:""});
      // 2. Remove documento de clinica_casais
      const snap1 = await db.collection("clinica_casais").where("p1Id","==",paciente.id).get();
      const snap2 = await db.collection("clinica_casais").where("p2Id","==",paciente.id).get();
      const batch = db.batch();
      [...snap1.docs, ...snap2.docs].forEach(d=>batch.delete(d.ref));
      await batch.commit();
      setCasalId("");
    } catch(e) { alert("Erro ao desvincular: "+e.message); }
    setSalvando(false);
  }

  return (
    <div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Icon name="heart" size={18}/><div style={{fontWeight:600}}>Vínculo de Casal</div></div>
        {paciente.casalId&&parceiro?(
          <div>
            <div style={{background:"var(--purple-bg)",borderRadius:10,padding:16,marginBottom:16}}>
              <div style={{fontSize:13,color:"var(--text-muted)",marginBottom:4}}>Parceiro(a) vinculado(a):</div>
              <div style={{fontWeight:600,fontSize:16}}>{parceiro.nome}</div>
              <div style={{fontSize:13,color:"var(--text-muted)"}}>{parceiro.email}</div>
            </div>
            <button className="btn btn-danger" onClick={desvincular} disabled={salvando}><Icon name="x" size={15}/> Desvincular casal</button>
          </div>
        ):(
          <div>
            <p style={{fontSize:13,color:"var(--text-muted)",marginBottom:16}}>Este paciente nao esta vinculado a um casal em terapia.</p>
            <div className="form-group" style={{marginBottom:16}}>
              <label className="form-label">Selecionar Parceiro(a)</label>
              <select className="form-input" value={casalId} onChange={e=>setCasalId(e.target.value)}>
                <option value="">Selecione um paciente...</option>
                {outros.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <button className="btn btn-purple" onClick={vincular} disabled={salvando}><Icon name="heart" size={15}/> Associar como Casal</button>
          </div>
        )}
      </div>

      {/* Respostas do diagnóstico — só aparece se o casal está vinculado */}
      {paciente.casalId && parceiro && (
        <div className="card">
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <Icon name="clipboard-list" size={18}/>
            <div style={{fontWeight:600}}>Diagnóstico e Atividades do Casal</div>
          </div>
          <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:4}}>
            Respostas preenchidas por {paciente.nome.split(" ")[0]} e {parceiro.nome.split(" ")[0]} no portal
          </div>
          <RespostasCasal
            pacienteId={paciente.id}
            parceiroId={paciente.casalId}
            parceiro={parceiro}
            nomePaciente={paciente.nome}
          />
        </div>
      )}
    </div>
  );
}

// PERFIL COMPLETO
function AbaOcupacional({ paciente }) {
  const EMITIDO_POR = { nome: "Dra. Lucia Kratz", crp: "CRP 09/20590" };
  const ASSINATURA_URL = "../Assinatura Lúcia Kratz.png"; // imagem na raiz do repositório

  const formVazio = {
    tipoDocumento: "relatorio_nr1",
    // Relatório NR-1
    dataInicio: "", dataFim: "", emAndamento: false,
    sessoesRealizadas: "", sessoesTotal: "",
    statusPrograma: "em_andamento", parecerTecnico: "",
    // Declaração de Comparecimento
    dataComparecimento: "", horaInicio: "", horaFim: "", obsDeclaracao: "",
  };

  const [form, setForm] = useState(formVazio);
  const [historico, setHistorico] = useState([]);
  const [loadingHist, setLoadingHist] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [preview, setPreview] = useState(null); // doc para preview (com _rascunho quando ainda não salvo)
  // Dados ocupacionais editáveis aqui mesmo (salvam de volta no cadastro do paciente)
  const [ocup, setOcup] = useState({
    empresa: paciente.empresa || paciente.empresaContratante || "",
    setor: paciente.setor || "",
    cargo: paciente.cargo || "",
  });

  useEffect(() => {
    db.collection("clinica_documentos_nr1")
      .where("pacienteId", "==", paciente.id)
      .get()
      .then(snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a,b)=>((b.createdAt&&b.createdAt.seconds)||0)-((a.createdAt&&a.createdAt.seconds)||0));
        setHistorico(docs);
        setLoadingHist(false);
      })
      .catch(() => setLoadingHist(false));
  }, [paciente.id]);

  const STATUS_LABELS = {
    em_andamento: "Em andamento (Acompanhamento contínuo)",
    concluido: "Concluído (Alta do programa ocupacional)",
    encaminhado: "Encaminhado para Especialista Externo",
    descontinuado: "Descontinuado (Faltas / Não adesão)",
  };

  const TIPO_LABELS = {
    relatorio_nr1: "Relatório de Atendimento Psicossocial (NR-1)",
    declaracao: "Declaração de Comparecimento",
  };
  const TIPO_DESC = {
    relatorio_nr1: "📊 Documento completo para a empresa: vigência do acompanhamento, sessões, status no programa e parecer técnico.",
    declaracao: "📄 Documento simples que atesta o comparecimento do colaborador em uma data e horário específicos.",
  };

  const eDeclaracao = form.tipoDocumento === "declaracao";
  const fmtData = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

  function montarDoc() {
    return {
      pacienteId: paciente.id,
      pacienteNome: paciente.nome || "",
      empresaContratante: ocup.empresa || "",
      setor: ocup.setor || "",
      cargo: ocup.cargo || "",
      tipoDocumento: form.tipoDocumento,
      periodo: { dataInicio: form.dataInicio, dataFim: form.emAndamento ? "" : form.dataFim, emAndamento: form.emAndamento },
      sessoes: { realizadas: Number(form.sessoesRealizadas) || 0, total: Number(form.sessoesTotal) || 0 },
      statusPrograma: form.statusPrograma,
      parecerTecnico: form.parecerTecnico,
      dataComparecimento: form.dataComparecimento,
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      obsDeclaracao: form.obsDeclaracao,
      emitidoPor: EMITIDO_POR,
    };
  }

  // 1) VISUALIZAR — monta o documento sem salvar nada
  function visualizar() {
    if (eDeclaracao && !form.dataComparecimento) { alert("Informe a data do comparecimento."); return; }
    if (!eDeclaracao && !form.parecerTecnico) { alert("Preencha o Parecer Técnico antes de visualizar."); return; }
    setPreview({ ...montarDoc(), _rascunho: true, createdAt: { seconds: Date.now()/1000 } });
  }

  // 2) SALVAR — só depois de visualizar e aprovar
  async function salvarDefinitivo() {
    setSalvando(true);
    const doc = { ...montarDoc(), createdAt: firebase.firestore.FieldValue.serverTimestamp() };
    try {
      const ref = await db.collection("clinica_documentos_nr1").add(doc);
      // Atualiza os dados ocupacionais no cadastro do paciente
      await db.collection("clinica_pacientes").doc(paciente.id).update({
        empresa: ocup.empresa || "", setor: ocup.setor || "", cargo: ocup.cargo || ""
      }).catch(()=>{});
      const novoDoc = { id: ref.id, ...doc, createdAt: { seconds: Date.now()/1000 } };
      setHistorico(prev => [novoDoc, ...prev]);
      setPreview(novoDoc);
      setForm(formVazio);
    } catch (e) { alert("Erro ao salvar: " + e.message); }
    setSalvando(false);
  }

  function abrirPreview(doc) { setPreview(doc); }

  function imprimirPreview() {
    const conteudo = document.getElementById("nr1-preview-print");
    if (!conteudo) return;
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>${TIPO_LABELS[preview?.tipoDocumento]||"Documento"} — ${preview?.pacienteNome||""}</title>
      <style>
        body{font-family:Arial,sans-serif;margin:40px;color:#1f2937;font-size:13px;line-height:1.6}
        img{max-height:70px}
        @media print{body{margin:20px}.no-print{display:none}}
      </style></head><body>
      ${conteudo.innerHTML}
      </body></html>
    `);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 600);
  }

  // ─── BLOCO DE ASSINATURA + CARIMBO ────────────────────────
  function BlocoAssinatura() {
    return (
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 24, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <div style={{ textAlign: "center" }}>
          <img src={ASSINATURA_URL} alt="" style={{ height: 64, objectFit: "contain", display: "block", margin: "0 auto -10px" }}
            onError={e => e.target.style.display = "none"} />
          <div style={{ width: 230, borderBottom: "1.5px solid #1f2937", margin: "0 auto 8px" }} />
          {/* Carimbo profissional */}
          <div style={{ display: "inline-block", border: "2px solid #7B00C4", borderRadius: 8, padding: "8px 20px", color: "#7B00C4" }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>Dra. Lucia Kratz</div>
            <div style={{ fontSize: 11, fontWeight: 600 }}>Psicóloga — CRP 09/20590</div>
            <div style={{ fontSize: 9.5, marginTop: 2 }}>Doutora em Psicologia · TCC · Musicoterapia · Neuromodulação</div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PREVIEW ──────────────────────────────────────────────
  if (preview) {
    const ehDecl = preview.tipoDocumento === "declaracao";
    const periodoStr = preview.periodo?.emAndamento
      ? `${fmtData(preview.periodo?.dataInicio)} — Em andamento`
      : `${fmtData(preview.periodo?.dataInicio)} a ${fmtData(preview.periodo?.dataFim)}`;
    const hojeExtenso = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

    return (
      <div>
        {preview._rascunho && (
          <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 10, padding: "10px 16px", marginBottom: 14, fontSize: 13, color: "#78350f", fontWeight: 600 }}>
            👁 Pré-visualização — o documento ainda NÃO foi salvo. Confira tudo e clique em "Salvar e Gerar PDF".
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={() => setPreview(null)}>
            <Icon name="arrow-left" size={15} /> {preview._rascunho ? "Voltar e editar" : "Voltar"}
          </button>
          {preview._rascunho ? (
            <button className="btn btn-purple" onClick={salvarDefinitivo} disabled={salvando}>
              <Icon name="save" size={15} /> {salvando ? "Salvando..." : "💾 Salvar e Gerar PDF"}
            </button>
          ) : (
            <button className="btn btn-purple" onClick={imprimirPreview}>
              <Icon name="printer" size={15} /> Imprimir / Salvar PDF
            </button>
          )}
        </div>

        <div id="nr1-preview-print" style={{ background: "white", borderRadius: 16, border: "1px solid var(--gray-200)", padding: 32, maxWidth: 680 }}>
          {/* Cabeçalho timbrado */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid #7B00C4" }}>
            <div>
              <div style={{ fontFamily: "Dancing Script, cursive", fontSize: 26, color: "#7B00C4", fontWeight: 700 }}>Dra. Lucia Kratz</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>CRP 09/20590 · Psicóloga · TCC · Musicoterapeuta · Neuromodulação</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Goiânia, GO — luciakratz.com.br</div>
            </div>
            <img src="../logo-transparente.png" style={{ height: 48, objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
          </div>

          {/* Título */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", textTransform: "uppercase", letterSpacing: 1 }}>
              {TIPO_LABELS[preview.tipoDocumento] || preview.tipoDocumento}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
              Emitido em {preview.createdAt?.seconds ? new Date(preview.createdAt.seconds * 1000).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR")}
            </div>
          </div>

          {ehDecl ? (
            <>
              {/* ── CORPO DA DECLARAÇÃO ── */}
              <div style={{ fontSize: 14, lineHeight: 2, textAlign: "justify", margin: "28px 0", textIndent: 40 }}>
                <strong>DECLARO</strong>, para os devidos fins, que <strong>{preview.pacienteNome}</strong>
                {preview.cargo ? `, ${preview.cargo}` : ""}
                {preview.empresaContratante ? <>, colaborador(a) da empresa <strong>{preview.empresaContratante}</strong></> : ""}
                , compareceu a atendimento psicológico nesta clínica no dia <strong>{fmtData(preview.dataComparecimento)}</strong>
                {preview.horaInicio ? <>, no horário das <strong>{preview.horaInicio}</strong>{preview.horaFim ? <> às <strong>{preview.horaFim}</strong></> : ""}</> : ""}.
              </div>
              {preview.obsDeclaracao && (
                <div style={{ fontSize: 13, lineHeight: 1.8, textAlign: "justify", marginBottom: 20, textIndent: 40 }}>{preview.obsDeclaracao}</div>
              )}
              <div style={{ fontSize: 13, margin: "28px 0 36px", textAlign: "right" }}>Goiânia, {hojeExtenso}.</div>
            </>
          ) : (
            <>
              {/* ── CORPO DO RELATÓRIO NR-1 ── */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#7B00C4", borderBottom: "1px solid #e9d5ff", paddingBottom: 4, marginBottom: 10, textTransform: "uppercase" }}>
                  Dados do Colaborador
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
                  {[
                    ["Nome", preview.pacienteNome],
                    ["Empresa Contratante", preview.empresaContratante || "—"],
                    ["Cargo", preview.cargo || "—"],
                    ["Setor", preview.setor || "—"],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>{l}</div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#7B00C4", borderBottom: "1px solid #e9d5ff", paddingBottom: 4, marginBottom: 10, textTransform: "uppercase" }}>
                  Dados do Atendimento
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
                  {[
                    ["Vigência", periodoStr],
                    ["Sessões Realizadas", `${preview.sessoes?.realizadas || 0} de ${preview.sessoes?.total || 0}`],
                    ["Status no Programa", STATUS_LABELS[preview.statusPrograma] || preview.statusPrograma],
                  ].map(([l, v]) => (
                    <div key={l} style={{ gridColumn: l === "Status no Programa" ? "span 2" : "auto" }}>
                      <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>{l}</div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {preview.parecerTecnico && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#7B00C4", borderBottom: "1px solid #e9d5ff", paddingBottom: 4, marginBottom: 10, textTransform: "uppercase" }}>
                    Parecer Técnico
                  </div>
                  <div style={{ background: "#f9f5ff", borderLeft: "3px solid #7B00C4", padding: "12px 16px", borderRadius: 4, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {preview.parecerTecnico}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Aviso ético */}
          <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6, padding: "10px 14px", fontSize: 11, marginBottom: 24, color: "#78350f" }}>
            ⚖️ Este documento foi elaborado em conformidade com a Resolução CFP nº 06/2019, preservando o sigilo profissional. Não contém diagnósticos, CID, sintomas clínicos ou informações íntimas do colaborador.
          </div>

          <BlocoAssinatura/>
        </div>
      </div>
    );
  }

  // ─── FORMULÁRIO ───────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--purple-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="briefcase" size={18} style={{ color: "var(--purple)" }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Saúde Ocupacional — NR-1</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Relatórios e declarações para empresas contratantes</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* Tipo de documento + descrição do que muda */}
          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label className="form-label">Tipo de Documento</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {Object.entries(TIPO_LABELS).map(([val, label]) => (
                <button key={val} onClick={() => setForm({ ...form, tipoDocumento: val })}
                  style={{ padding: "8px 16px", borderRadius: 20, border: "1.5px solid", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)", transition: "all .2s",
                    borderColor: form.tipoDocumento === val ? "var(--purple)" : "var(--gray-200)",
                    background: form.tipoDocumento === val ? "var(--purple)" : "white",
                    color: form.tipoDocumento === val ? "white" : "var(--gray-600)",
                    fontWeight: form.tipoDocumento === val ? 600 : 400 }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--purple)", background: "var(--purple-soft)", borderRadius: 8, padding: "8px 12px" }}>
              {TIPO_DESC[form.tipoDocumento]}
            </div>
          </div>

          {/* Empresa / Setor / Cargo — editáveis, salvam no cadastro */}
          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label className="form-label">Empresa Contratante</label>
            <input className="form-input" value={ocup.empresa}
              onChange={e => setOcup({ ...ocup, empresa: e.target.value })}
              placeholder="Ex: Construtora Horizonte Ltda." />
          </div>
          <div className="form-group">
            <label className="form-label">Setor</label>
            <input className="form-input" value={ocup.setor}
              onChange={e => setOcup({ ...ocup, setor: e.target.value })}
              placeholder="Ex: Administrativo" />
          </div>
          <div className="form-group">
            <label className="form-label">Cargo</label>
            <input className="form-input" value={ocup.cargo}
              onChange={e => setOcup({ ...ocup, cargo: e.target.value })}
              placeholder="Ex: Analista de RH" />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>Gravados no cadastro do paciente ao salvar o documento.</div>
          </div>

          {eDeclaracao ? (
            <>
              {/* ── CAMPOS DA DECLARAÇÃO ── */}
              <div className="form-group">
                <label className="form-label">Data do Comparecimento</label>
                <input className="form-input" type="date" value={form.dataComparecimento}
                  onChange={e => setForm({ ...form, dataComparecimento: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Horário (início — término)</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input className="form-input" type="time" value={form.horaInicio}
                    onChange={e => setForm({ ...form, horaInicio: e.target.value })} />
                  <span style={{ color: "var(--text-muted)" }}>—</span>
                  <input className="form-input" type="time" value={form.horaFim}
                    onChange={e => setForm({ ...form, horaFim: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Observação (opcional)</label>
                <TextAreaVoz className="form-input" rows={3} value={form.obsDeclaracao}
                  onChange={e => setForm({ ...form, obsDeclaracao: e.target.value })}
                  placeholder="Ex: O comparecimento integra programa de acompanhamento psicossocial vigente." />
              </div>
            </>
          ) : (
            <>
              {/* ── CAMPOS DO RELATÓRIO NR-1 ── */}
              <div className="form-group">
                <label className="form-label">Data de Início</label>
                <input className="form-input" type="date" value={form.dataInicio} onChange={e => setForm({ ...form, dataInicio: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Data de Fim</label>
                <input className="form-input" type="date" value={form.dataFim} disabled={form.emAndamento}
                  onChange={e => setForm({ ...form, dataFim: e.target.value })}
                  style={form.emAndamento ? { background: "var(--gray-50)", color: "var(--text-muted)" } : {}} />
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <input type="checkbox" id="emAndamento" checked={form.emAndamento}
                    onChange={e => setForm({ ...form, emAndamento: e.target.checked, dataFim: "" })} />
                  <label htmlFor="emAndamento" style={{ fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}>Em andamento</label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Sessões Realizadas</label>
                <input className="form-input" type="number" min="0" value={form.sessoesRealizadas}
                  onChange={e => setForm({ ...form, sessoesRealizadas: e.target.value })} placeholder="Ex: 4" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Planejado</label>
                <input className="form-input" type="number" min="0" value={form.sessoesTotal}
                  onChange={e => setForm({ ...form, sessoesTotal: e.target.value })} placeholder="Ex: 8" />
              </div>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Status no Programa</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                      padding: "10px 14px", borderRadius: 8, border: "1.5px solid", transition: "all .2s",
                      borderColor: form.statusPrograma === val ? "var(--purple)" : "var(--gray-200)",
                      background: form.statusPrograma === val ? "var(--purple-soft)" : "white" }}>
                      <input type="radio" name="statusPrograma" value={val} checked={form.statusPrograma === val}
                        onChange={() => setForm({ ...form, statusPrograma: val })} />
                      <span style={{ fontSize: 13, fontWeight: form.statusPrograma === val ? 600 : 400,
                        color: form.statusPrograma === val ? "var(--purple)" : "var(--gray-700)" }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Parecer Técnico</label>
                <TextAreaVoz className="form-input" rows={6} value={form.parecerTecnico}
                  onChange={e => setForm({ ...form, parecerTecnico: e.target.value })}
                  placeholder={"Foque em:\n• Capacidade laboral e funcionalidade no trabalho\n• Recomendações ergonômicas ou organizacionais\n• Necessidade de adaptações no posto de trabalho\n\nEvite: diagnósticos, CID, sintomas clínicos, informações íntimas."} />
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  ⚖️ Este campo deve seguir a Resolução CFP nº 06/2019 — foco em capacidade laboral, sem expor diagnósticos ou CID.
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button className="btn btn-purple" onClick={visualizar}>
            <Icon name="eye" size={15} /> 👁 Visualizar documento
          </button>
          <div style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>Nada é salvo antes de você conferir e aprovar.</div>
        </div>
      </div>

      {/* Histórico */}
      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="history" size={16} /> Histórico de Documentos NR-1
        </div>
        {loadingHist ? (
          <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>Carregando...</div>
        ) : historico.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 13 }}>
            Nenhum documento gerado ainda.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {historico.map(doc => (
              <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                borderRadius: 10, border: "1px solid var(--gray-200)", background: "white" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: doc.tipoDocumento==="declaracao" ? "#ccfbf1" : "var(--purple-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={doc.tipoDocumento==="declaracao" ? "badge-check" : "file-text"} size={16} style={{ color: doc.tipoDocumento==="declaracao" ? "#0d9488" : "var(--purple)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{TIPO_LABELS[doc.tipoDocumento] || doc.tipoDocumento}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {doc.tipoDocumento==="declaracao"
                      ? `Comparecimento em ${fmtData(doc.dataComparecimento)}${doc.horaInicio ? ` · ${doc.horaInicio}${doc.horaFim ? "–"+doc.horaFim : ""}` : ""}`
                      : `${doc.periodo?.emAndamento ? `${fmtData(doc.periodo?.dataInicio)} — Em andamento` : `${fmtData(doc.periodo?.dataInicio)} a ${fmtData(doc.periodo?.dataFim)}`} · ${doc.sessoes?.realizadas || 0}/${doc.sessoes?.total || 0} sessões`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }}
                    onClick={() => abrirPreview(doc)}>
                    <Icon name="eye" size={13} /> Ver
                  </button>
                  <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}
                    onClick={() => { abrirPreview(doc); setTimeout(imprimirPreview, 300); }}>
                    <Icon name="printer" size={13} />
                  </button>
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

// ═══════════════════════════════════════════════════════════════════
//  MÓDULO: RASTREAMENTO BIPOLAR/BORDERLINE — AbaRastreamento
//  Coleção: clinica_rastreamento_bipolar
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS_RASTREAMENTO = [
  { id:"p1",  bloco:"Eixo Bipolar · Energia",    texto:"Energia muito acima do normal / fases de aceleração" },
  { id:"p2",  bloco:"Eixo Bipolar · Energia",    texto:"Padrão de sono e fala durante os momentos de agitação" },
  { id:"p3",  bloco:"Eixo Bipolar · Energia",    texto:"Autoconfiança exagerada ou riscos incomuns" },
  { id:"p4",  bloco:"Eixo Bipolar · Depressão",  texto:"Tristeza profunda ou perda de interesse prolongada" },
  { id:"p5",  bloco:"Eixo Bipolar · Depressão",  texto:"Disposição física, sono, apetite nas fases de baixa" },
  { id:"p6",  bloco:"Eixo Bipolar · Depressão",  texto:"Desesperança, culpa excessiva ou ideação suicida" },
  { id:"p7",  bloco:"Eixo Borderline",           texto:"Reação ao abandono real ou imaginado" },
  { id:"p8",  bloco:"Eixo Borderline",           texto:"Relações intensas e instáveis ao longo do tempo" },
  { id:"p9",  bloco:"Eixo Borderline",           texto:"Instabilidade de identidade, objetivos ou autoimagem" },
  { id:"p10", bloco:"Eixo Borderline",           texto:"Comportamentos impulsivos no dia a dia" },
  { id:"p11", bloco:"Eixo Borderline",           texto:"Automutilação ou tentativas de autoextermínio" },
  { id:"p12", bloco:"Eixo Borderline",           texto:"Oscilação rápida de humor (horas / dias)" },
  { id:"p13", bloco:"Eixo Borderline",           texto:"Vazio interior persistente ou tédio crônico" },
  { id:"p14", bloco:"Eixo Borderline",           texto:"Manejo da raiva e da frustração" },
  { id:"p15", bloco:"Eixo Borderline",           texto:"Dissociação ou paranoia sob estresse extremo" },
];

// Pontuação: A=0, B=1, C=2, D=3
function pontuarResposta(letra) {
  return { A:0, B:1, C:2, D:3 }[letra] || 0;
}

function calcularEscores(doc) {
  const bipolarMania  = ["p1","p2","p3"].reduce((s,k)=>s+pontuarResposta(doc[k]),0);
  const bipolarDep    = ["p4","p5","p6"].reduce((s,k)=>s+pontuarResposta(doc[k]),0);
  const borderline    = ["p7","p8","p9","p10","p11","p12","p13","p14","p15"].reduce((s,k)=>s+pontuarResposta(doc[k]),0);
  return { bipolarMania, bipolarDep, borderline };
}

function laudoDSM5(escores) {
  const { bipolarMania, bipolarDep, borderline } = escores;
  const maxMania   = 8;  // 3 perguntas × max 2-3
  const maxDep     = 6;
  const maxBorder  = 18; // 9 perguntas × max 2
  const pctMania   = bipolarMania  / maxMania   * 100;
  const pctDep     = bipolarDep    / maxDep     * 100;
  const pctBorder  = borderline    / maxBorder  * 100;

  let hipotese = "";
  let criterios = [];
  let atencao = [];

  // Mania / Hipomania
  if(pctMania >= 75) {
    hipotese = "Transtorno Bipolar Tipo I (episódio maníaco com comprometimento grave)";
    criterios.push({ label:"TB Tipo I", atende:true, obs:"Escores de mania/hipomania elevados (≥75%). Verificar duração ≥7 dias e comprometimento funcional (Critério A do DSM-5)." });
    atencao.push("Confirmar duração exata dos episódios de aceleração (≥7 dias = mania; 4–6 dias = hipomania).");
    atencao.push("Checar se houve internação ou prejuízo grave — diferencial TB I vs TB II.");
  } else if(pctMania >= 45) {
    hipotese = "Transtorno Bipolar Tipo II (hipomania + depressão) — verificar";
    criterios.push({ label:"TB Tipo II", atende:true, obs:"Indícios moderados de hipomania (45–74%). Confirmar ausência de episódio maníaco pleno." });
    atencao.push("Investigar se os episódios de aceleração duraram 4–6 dias sem internação (perfil Tipo II).");
  } else if(pctMania >= 20 && pctDep >= 30) {
    hipotese = "Ciclotimia ou Transtorno Depressivo com características mistas — investigar";
    criterios.push({ label:"Ciclotimia", atende:null, obs:"Flutuações leves de humor sem critério pleno para mania ou depressão maior." });
    atencao.push("Mapear se as oscilações são crônicas (≥2 anos em adultos) para confirmar Ciclotimia (DSM-5 301.13).");
  } else {
    criterios.push({ label:"TB Tipo I", atende:false, obs:"Escores de energia/aceleração abaixo do limiar clínico." });
    criterios.push({ label:"TB Tipo II", atende:false, obs:"Sem indícios consistentes de hipomania." });
  }

  // Depressão
  if(pctDep >= 60) {
    criterios.push({ label:"Episódio Depressivo Maior", atende:true, obs:"Escores depressivos elevados. Avaliar ≥5 critérios por ≥2 semanas (DSM-5 Critério A)." });
    atencao.push("Verificar presença de ideação suicida ativa (p6=C) — acionar protocolo de segurança se necessário.");
  } else if(pctDep >= 30) {
    criterios.push({ label:"Depressão leve/moderada", atende:null, obs:"Indícios moderados. Não preenche critérios plenos — monitorar." });
  } else {
    criterios.push({ label:"Episódio Depressivo Maior", atende:false, obs:"Escores abaixo do limiar." });
  }

  // Borderline
  if(pctBorder >= 70) {
    if(!hipotese) hipotese = "Transtorno da Personalidade Borderline (TPB)";
    else hipotese += " com forte sobreposição de TPB";
    criterios.push({ label:"TPB (DSM-5 301.83)", atende:true, obs:"Escores elevados em ≥5 dos 9 critérios DSM-5 para TPB (escore ≥70%)." });
    atencao.push("Diferenciar oscilação de humor rápida (horas) do Borderline vs episódios longos do TB (dias/semanas).");
    atencao.push("Investigar história de automutilação, vazio crônico e instabilidade de identidade como critérios centrais do TPB.");
  } else if(pctBorder >= 40) {
    criterios.push({ label:"TPB (traços)", atende:null, obs:"Traços limítrofes moderados. Não preenche critérios plenos — avaliar longitudinalmente." });
    atencao.push("Checar se oscilações emocionais são reativas a estressores interpessoais (perfil Borderline) ou autônomas (perfil Bipolar).");
  } else {
    criterios.push({ label:"TPB", atende:false, obs:"Escores abaixo do limiar de critérios borderline." });
  }

  // Comorbidade
  if(pctMania >= 45 && pctBorder >= 55) {
    atencao.push("Alta probabilidade de COMORBIDADE TB + TPB — padrão encontrado em até 20% dos casos. Priorizar diagnóstico longitudinal.");
  }

  if(!hipotese) hipotese = "Sem hipótese diagnóstica definida pelos escores — avaliação clínica aprofundada indicada.";

  return { hipotese, criterios, atencao, pctMania, pctDep, pctBorder };
}

function CorBadge({ atende }) {
  if(atende === true)  return <span style={{background:"#fef2f2",color:"#dc2626",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>✓ Critérios presentes</span>;
  if(atende === false) return <span style={{background:"#f0fdf4",color:"#16a34a",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>✗ Não atende</span>;
  return <span style={{background:"#fffbeb",color:"#d97706",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>⚠ Investigar</span>;
}

function BarraEscore({ label, valor, max, cor }) {
  const pct = Math.min(100, Math.round(valor / max * 100));
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
        <span style={{fontWeight:600,color:"#374151"}}>{label}</span>
        <span style={{color:cor,fontWeight:700}}>{pct}%</span>
      </div>
      <div style={{background:"#f3f4f6",borderRadius:20,height:8,overflow:"hidden"}}>
        <div style={{width:pct+"%",background:cor,height:"100%",borderRadius:20,transition:"width .5s"}}/>
      </div>
    </div>
  );
}

function AbaRastreamento({ paciente }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);

  useEffect(()=>{
    if(!paciente?.nome) return;
    db.collection("clinica_rastreamento_bipolar")
      .where("pacienteNome","==",paciente.nome)
      .get()
      .then(snap=>{
        const lista = snap.docs.map(d=>({id:d.id,...d.data()}))
          .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
        setDocs(lista);
        setLoading(false);
      })
      .catch(()=>setLoading(false));
  },[paciente?.nome]);

  function copiarLink() {
    const url = `https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    navigator.clipboard.writeText(url).then(()=>alert("✓ Link copiado! "+url));
  }

  function enviarWhatsApp() {
    const nome = paciente.nome || "paciente";
    const url = `https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/?paciente=${encodeURIComponent(nome)}`;
    const msg = "Olá! 😊\n\nA Dra. Lucia Kratz preparou um questionário clínico para você responder sobre *"+nome+"*.\n\n*Questionário Clínico*\nResponda com calma e honestidade — leva cerca de 5 a 10 minutos.\n\nAcesse pelo link abaixo:\n"+url+"\n\nQualquer dúvida, estou por aqui!\n_Dra. Lucia Kratz · CRP 09/20590_";
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  }

  function gerarLaudo() {
    if(docs.length===0){alert("Nenhuma resposta para gerar laudo.");return;}
    const pacNome = paciente.nome || "Paciente";
    const data = new Date().toLocaleDateString("pt-BR");

    // Calcular escores por respondente
    const escoresPorDoc = docs.map(d=>({ ...d, escores: calcularEscores(d) }));
    // Escores médios
    const mediaEscores = {
      bipolarMania: Math.round(escoresPorDoc.reduce((s,d)=>s+d.escores.bipolarMania,0)/escoresPorDoc.length*10)/10,
      bipolarDep:   Math.round(escoresPorDoc.reduce((s,d)=>s+d.escores.bipolarDep,0)/escoresPorDoc.length*10)/10,
      borderline:   Math.round(escoresPorDoc.reduce((s,d)=>s+d.escores.borderline,0)/escoresPorDoc.length*10)/10,
    };
    const laudo = laudoDSM5(mediaEscores);

    const LETRA_COR = { A:"#16a34a", B:"#d97706", C:"#dc2626", D:"#7f1d1d" };

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Laudo Rastreamento — ${pacNome}</title>
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
.assinatura{text-align:center;margin-top:40px}
.assinatura img{height:60px;opacity:.9}
.assinatura p{font-size:12px;color:#374151;margin-top:6px}
@media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px">🖨️ Imprimir / Salvar PDF</button>
</div>
<div class="header">
  <h1>Laudo Analítico de Rastreamento Clínico</h1>
  <div class="sub">Paciente: <strong>${pacNome}</strong> · Data: ${data} · Dra. Lucia Kratz · CRP 09/20590</div>
  <div class="sub">Respondentes: ${docs.length} (${docs.map(d=>d.tipoRespondente==="paciente"?"próprio paciente":d.parentesco||"familiar").join(", ")})</div>
</div>

<h2>I. Escores por Eixo (média entre respondentes)</h2>
<div class="barra-wrap">
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>Eixo Bipolar — Mania/Hipomania</strong></span><span style="color:#dc2626;font-weight:700">${Math.round(mediaEscores.bipolarMania/8*100)}%</span></div>
  <div class="barra-bg"><div style="width:${Math.round(mediaEscores.bipolarMania/8*100)}%;background:#dc2626;height:100%;border-radius:20px"></div></div>
</div>
<div class="barra-wrap">
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>Eixo Bipolar — Depressão</strong></span><span style="color:#7c3aed;font-weight:700">${Math.round(mediaEscores.bipolarDep/6*100)}%</span></div>
  <div class="barra-bg"><div style="width:${Math.round(mediaEscores.bipolarDep/6*100)}%;background:#7c3aed;height:100%;border-radius:20px"></div></div>
</div>
<div class="barra-wrap">
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>Eixo Borderline (TPB)</strong></span><span style="color:#2563eb;font-weight:700">${Math.round(mediaEscores.borderline/18*100)}%</span></div>
  <div class="barra-bg"><div style="width:${Math.round(mediaEscores.borderline/18*100)}%;background:#2563eb;height:100%;border-radius:20px"></div></div>
</div>

<h2>II. Hipótese Diagnóstica Provável</h2>
<div class="hipotese">
  <div class="label">Hipótese principal</div>
  <div class="valor">${laudo.hipotese}</div>
</div>

<h3>Análise por Critério DSM-5</h3>
${laudo.criterios.map(c=>`
<div class="criterio">
  <div class="nome">${c.label} &nbsp; <span class="${c.atende===true?"badge-sim":c.atende===false?"badge-nao":"badge-inv"}">${c.atende===true?"✓ Critérios presentes":c.atende===false?"✗ Não atende":"⚠ Investigar"}</span></div>
  <div style="font-size:12px;color:#4b5563;margin-top:4px">${c.obs}</div>
</div>`).join("")}

<h2>III. Pontos de Atenção para a Entrevista Clínica</h2>
${laudo.atencao.length===0?"<p style='color:#6b7280;font-size:12px'>Nenhum ponto de atenção crítico identificado pelos escores.</p>":laudo.atencao.map(a=>`<div class="atencao-item">⚠ ${a}</div>`).join("")}

<h2>IV. Respostas por Respondente</h2>
${escoresPorDoc.map(d=>`
<h3>${d.tipoRespondente==="paciente"?"🧑 Próprio paciente":"👨‍👩‍👧 "+( d.nomeRespondente||"Familiar")+" ("+( d.parentesco||"—")+")"}</h3>
<table class="resp-table">
<thead><tr><th>#</th><th>Pergunta</th><th>Bloco</th><th>Resp.</th></tr></thead>
<tbody>
${PERGUNTAS_RASTREAMENTO.map(p=>`
<tr><td>${p.id.replace("p","")}</td><td>${p.texto}</td><td>${p.bloco}</td>
<td><span class="letra" style="color:${LETRA_COR[d[p.id]]||"#6b7280"}">${d[p.id]||"—"}</span></td></tr>`).join("")}
${d.obsFinais?`<tr><td colspan="2"><strong>Observações livres</strong></td><td colspan="2">${d.obsFinais}</td></tr>`:""}
</tbody></table>`).join("")}

<div class="assinatura">
  <img src="https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/Assinatura Lu%C3%ADcia%20Kratz.png" alt="Assinatura" onerror="this.style.display='none'"/>
  <p><strong>Dra. Lucia Kratz</strong><br/>Psicóloga · CRP 09/20590<br/>Doutora em Psicologia · TCC · Musicoterapia · Neuromodulação</p>
</div>
<div class="rodape">Documento gerado em ${data} · Uso exclusivo para fins clínicos · Confidencial · LGPD</div>
</body></html>`;

    const w = window.open("","_blank");
    w.document.write(html);
    w.document.close();
  }

  if(loading) return <div style={{padding:40,textAlign:"center"}}><Spinner/></div>;

  return (
    <div>
      {/* Cabeçalho com botões */}
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20,flexWrap:"wrap",justifyContent:"space-between"}}>
        <div>
          <div style={{fontWeight:700,fontSize:15,color:"var(--text-dark)"}}>Rastreamento Bipolar / Borderline</div>
          <div style={{fontSize:12,color:"var(--text-muted)",marginTop:2}}>{docs.length} respondente{docs.length!==1?"s":""} encontrado{docs.length!==1?"s":""}</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button className="btn btn-ghost" style={{fontSize:12,padding:"7px 14px"}} onClick={copiarLink}>
            <Icon name="link" size={13}/> Copiar Link
          </button>
          <button className="btn btn-ghost" style={{fontSize:12,padding:"7px 14px",color:"#16a34a",borderColor:"#16a34a"}} onClick={enviarWhatsApp}>
            <Icon name="message-circle" size={13}/> WhatsApp
          </button>
          {docs.length>0 && (
            <button className="btn btn-purple" style={{fontSize:12,padding:"7px 14px"}} onClick={gerarLaudo}>
              <Icon name="file-text" size={13}/> Gerar Laudo PDF
            </button>
          )}
        </div>
      </div>

      {/* Sem respostas */}
      {docs.length===0 && (
        <div style={{textAlign:"center",padding:40,color:"var(--text-muted)"}}>
          <div style={{fontSize:40,marginBottom:12}}>📊</div>
          <div style={{fontWeight:600,marginBottom:6}}>Nenhuma resposta ainda</div>
          <div style={{fontSize:13,marginBottom:16}}>Envie o link do rastreamento para o paciente e os familiares.</div>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-ghost" onClick={copiarLink}><Icon name="link" size={14}/> Copiar Link</button>
            <button className="btn btn-purple" onClick={enviarWhatsApp}><Icon name="message-circle" size={14}/> Enviar pelo WhatsApp</button>
          </div>
        </div>
      )}

      {/* Escores gerais */}
      {docs.length>0 && (()=>{
        const escoresPorDoc = docs.map(d=>({...d,escores:calcularEscores(d)}));
        const media = {
          bipolarMania: escoresPorDoc.reduce((s,d)=>s+d.escores.bipolarMania,0)/docs.length,
          bipolarDep:   escoresPorDoc.reduce((s,d)=>s+d.escores.bipolarDep,0)/docs.length,
          borderline:   escoresPorDoc.reduce((s,d)=>s+d.escores.borderline,0)/docs.length,
        };
        const laudo = laudoDSM5(media);
        return (
          <div>
            {/* Hipótese */}
            <div style={{background:"#f5f3ff",border:"1px solid #c4b5fd",borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--purple)",marginBottom:4}}>Hipótese diagnóstica provável</div>
              <div style={{fontSize:15,fontWeight:700,color:"#3d006a",lineHeight:1.4}}>{laudo.hipotese}</div>
            </div>

            {/* Barras de escore */}
            <div style={{background:"var(--gray-50)",border:"1px solid var(--gray-200)",borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:12}}>Escores médios por eixo</div>
              <BarraEscore label="Eixo Bipolar · Mania/Hipomania" valor={media.bipolarMania} max={8}  cor="#dc2626"/>
              <BarraEscore label="Eixo Bipolar · Depressão"       valor={media.bipolarDep}   max={6}  cor="#7c3aed"/>
              <BarraEscore label="Eixo Borderline (TPB)"          valor={media.borderline}   max={18} cor="#2563eb"/>
            </div>

            {/* Critérios DSM-5 */}
            <div style={{marginBottom:16}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>Análise DSM-5</div>
              {laudo.criterios.map((c,i)=>(
                <div key={i} style={{border:"1px solid var(--gray-200)",borderRadius:10,padding:"10px 14px",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontWeight:600,fontSize:13}}>{c.label}</span>
                    <CorBadge atende={c.atende}/>
                  </div>
                  <div style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.5}}>{c.obs}</div>
                </div>
              ))}
            </div>

            {/* Pontos de atenção */}
            {laudo.atencao.length>0 && (
              <div style={{marginBottom:16}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:8}}>⚠ Pontos de atenção para a entrevista</div>
                {laudo.atencao.map((a,i)=>(
                  <div key={i} style={{background:"#fff7ed",borderLeft:"3px solid #f97316",padding:"8px 12px",marginBottom:6,borderRadius:"0 8px 8px 0",fontSize:12,lineHeight:1.5}}>{a}</div>
                ))}
              </div>
            )}

            {/* Respondentes */}
            <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>Respondentes</div>
            {escoresPorDoc.map((d,i)=>(
              <div key={i} style={{border:"1px solid var(--gray-200)",borderRadius:12,padding:14,marginBottom:10,cursor:"pointer",background:selecionado===i?"#f5f3ff":"white"}}
                onClick={()=>setSelecionado(selecionado===i?null:i)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>
                      {d.tipoRespondente==="paciente"?"🧑 Próprio paciente":"👨‍👩‍👧 "+(d.nomeRespondente||"Familiar")+" · "+(d.parentesco||"Familiar")}
                    </div>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>
                      {d.createdAt?.toDate?.()?.toLocaleDateString("pt-BR")||"Data não disponível"}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <span style={{background:"#fef2f2",color:"#dc2626",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600}}>
                      Mania {Math.round(d.escores.bipolarMania/8*100)}%
                    </span>
                    <span style={{background:"#ede9fe",color:"#7c3aed",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600}}>
                      Dep {Math.round(d.escores.bipolarDep/6*100)}%
                    </span>
                    <span style={{background:"#eff6ff",color:"#2563eb",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600}}>
                      TPB {Math.round(d.escores.borderline/18*100)}%
                    </span>
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {selecionado===i && (
                  <div style={{marginTop:14,borderTop:"1px solid var(--gray-200)",paddingTop:12}}>
                    {PERGUNTAS_RASTREAMENTO.map(p=>(
                      <div key={p.id} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8,fontSize:12}}>
                        <span style={{
                          minWidth:22,height:22,borderRadius:"50%",
                          background:d[p.id]==="C"||d[p.id]==="D"?"#fef2f2":d[p.id]==="B"?"#fffbeb":"#f0fdf4",
                          color:d[p.id]==="C"||d[p.id]==="D"?"#dc2626":d[p.id]==="B"?"#d97706":"#16a34a",
                          display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11
                        }}>{d[p.id]||"—"}</span>
                        <div>
                          <div style={{color:"var(--text-muted)",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{p.bloco}</div>
                          <div style={{color:"var(--text-dark)",lineHeight:1.4}}>{p.texto}</div>
                        </div>
                      </div>
                    ))}
                    {d.obsFinais && (
                      <div style={{background:"var(--gray-50)",border:"1px solid var(--gray-200)",borderRadius:8,padding:10,marginTop:8}}>
                        <div style={{fontSize:10,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Observações livres</div>
                        <div style={{fontSize:12,color:"var(--text-dark)",lineHeight:1.6}}>{d.obsFinais}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  MÓDULO: RASTREAMENTO NEURO — AbaRastreamentoNeuro
//  Coleção: clinica_rastreamento_neuro
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS_NEURO = [
  {id:"p1",  eixo:"TDAH Inatenção",       texto:"Falhas em detalhes / erros por descuido"},
  {id:"p2",  eixo:"TDAH Inatenção",       texto:"Dificuldade em manter foco em tarefas longas"},
  {id:"p3",  eixo:"TDAH Inatenção",       texto:"Abandona tarefas antes de terminar"},
  {id:"p4",  eixo:"TDAH Inatenção",       texto:"Desorganização crônica de tempo e espaço"},
  {id:"p5",  eixo:"TDAH Inatenção",       texto:"Evitação de tarefas com esforço mental prolongado"},
  {id:"p6",  eixo:"TDAH Inatenção",       texto:"Perda frequente de objetos essenciais"},
  {id:"p7",  eixo:"TDAH Inatenção",       texto:"Distrabilidade por estímulos externos"},
  {id:"p8",  eixo:"TDAH Inatenção",       texto:"Esquecimentos de compromissos e rotinas"},
  {id:"p9",  eixo:"TDAH Hiperatividade",  texto:"Inquietação motora (mãos, pés, corpo)"},
  {id:"p10", eixo:"TDAH Hiperatividade",  texto:"Dificuldade em permanecer sentado(a)"},
  {id:"p11", eixo:"TDAH Hiperatividade",  texto:"Sensação de aceleração interna crônica"},
  {id:"p12", eixo:"TDAH Hiperatividade",  texto:"Fala excessiva / monopoliza conversas"},
  {id:"p13", eixo:"TDAH Hiperatividade",  texto:"Precipitação de respostas / completa frases alheias"},
  {id:"p14", eixo:"TDAH Hiperatividade",  texto:"Dificuldade para esperar / impaciência extrema"},
  {id:"p15", eixo:"TDAH Hiperatividade",  texto:"Interrupção ou intrusão em atividades alheias"},
  {id:"p16", eixo:"TEA",                  texto:"Dificuldade na reciprocidade social"},
  {id:"p17", eixo:"TEA",                  texto:"Uso atípico de contato visual / expressão facial"},
  {id:"p18", eixo:"TEA",                  texto:"Dificuldade em fazer e manter amigos"},
  {id:"p19", eixo:"TEA",                  texto:"Movimentos ou falas repetitivas (stimming)"},
  {id:"p20", eixo:"TEA",                  texto:"Angústia severa diante de mudanças de rotina"},
  {id:"p21", eixo:"TEA",                  texto:"Interesses restritos e hiperfixados"},
  {id:"p22", eixo:"TEA",                  texto:"Hiper ou hipossensibilidade sensorial"},
  {id:"p23", eixo:"TOD",                  texto:"Humor irritável e irascível"},
  {id:"p24", eixo:"TOD",                  texto:"Discussões com figuras de autoridade"},
  {id:"p25", eixo:"TOD",                  texto:"Desobediência ativa e recusa de regras"},
  {id:"p26", eixo:"TOD",                  texto:"Incomoda deliberadamente outras pessoas"},
  {id:"p27", eixo:"TOD",                  texto:"Culpa os outros pelos próprios erros"},
  {id:"p28", eixo:"TOD",                  texto:"Rancor e vingança persistentes"},
];

function calcularEscoresNeuro(doc) {
  const pontuar = id => ({A:0,B:1,C:2}[doc[id]]||0);
  const ids = (a,b) => Array.from({length:b-a+1},(_,i)=>"p"+(a+i));
  return {
    tdahIn:  ids(1,8).reduce((s,id)=>s+pontuar(id),0),
    tdahHi:  ids(9,15).reduce((s,id)=>s+pontuar(id),0),
    tea:     ids(16,22).reduce((s,id)=>s+pontuar(id),0),
    tod:     ids(23,28).reduce((s,id)=>s+pontuar(id),0),
  };
}

function laudoNeuro(escores) {
  const {tdahIn, tdahHi, tea, tod} = escores;
  const pIn  = Math.round(tdahIn/16*100);
  const pHi  = Math.round(tdahHi/14*100);
  const pTea = Math.round(tea/14*100);
  const pTod = Math.round(tod/12*100);

  const nivel = (pct) => pct>=75?"Severo":pct>=50?"Moderado":pct>=25?"Leve":"Subliminar";

  let hipotese = [];
  let criterios = [];
  let atencao = [];

  if(pIn>=50||pHi>=50){
    const subtipo = pIn>=50&&pHi>=50?"Apresentação Combinada":pIn>=50?"Predominantemente Desatento":"Predominantemente Hiperativo/Impulsivo";
    hipotese.push("TDAH — "+subtipo);
    criterios.push({label:"TDAH ("+subtipo+")",atende:pIn>=50||pHi>=50,obs:"Inatenção: "+nivel(pIn)+" ("+pIn+"%) · Hiperatividade: "+nivel(pHi)+" ("+pHi+"%). Verificar início antes dos 12 anos e prejuízo em múltiplos contextos (DSM-5 Critério C)."});
    atencao.push("Confirmar início dos sintomas antes dos 12 anos de idade (critério obrigatório DSM-5).");
    atencao.push("Verificar se os sintomas ocorrem em pelo menos 2 contextos (escola/trabalho, casa, social).");
  } else {
    criterios.push({label:"TDAH",atende:false,obs:"Escores abaixo do limiar clínico para ambos os subtipos."});
  }

  if(pTea>=50){
    hipotese.push("TEA — Transtorno do Espectro Autista");
    criterios.push({label:"TEA (DSM-5 F84.0)",atende:true,obs:"Escore "+nivel(pTea)+" ("+pTea+"%). Verificar se déficits em comunicação social e padrões restritos estão presentes desde o período do desenvolvimento precoce."});
    atencao.push("Investigar histórico de desenvolvimento precoce — sinais de TEA devem estar presentes desde a infância.");
    atencao.push("Diferenciar hiperfoco do TEA (restrito e intenso) da desatenção seletiva do TDAH.");
    if(pIn>=40) atencao.push("Alta sobreposição TDAH + TEA detectada — avaliar comorbidade (presente em ~50% dos casos de TEA).");
  } else {
    criterios.push({label:"TEA",atende:false,obs:"Escores abaixo do limiar — traços presentes mas insuficientes para indicação clínica de TEA."});
  }

  if(pTod>=50){
    hipotese.push("TOD — Transtorno Opositivo-Desafiador");
    criterios.push({label:"TOD (DSM-5 F91.3)",atende:true,obs:"Escore "+nivel(pTod)+" ("+pTod+"%). Avaliar se o padrão é persistente por ≥6 meses e presente com pelo menos uma pessoa que não seja irmão."});
    atencao.push("Diferenciar se a irritabilidade e oposição decorrem de desregulação emocional do TDAH ou de TOD independente.");
    atencao.push("Verificar duração ≥6 meses e prejuízo em pelo menos um contexto (DSM-5 Critério B).");
  } else {
    criterios.push({label:"TOD",atende:false,obs:"Escores abaixo do limiar clínico."});
  }

  if(hipotese.length===0) hipotese.push("Sem hipótese diagnóstica definida pelos escores — avaliação clínica aprofundada indicada.");

  return {hipotese:hipotese.join(" + "), criterios, atencao, pIn, pHi, pTea, pTod, nivel};
}

function BarraEscoreNeuro({label, valor, max, cor}){
  const pct = Math.min(100,Math.round(valor/max*100));
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
        <span style={{fontWeight:600,color:"#374151"}}>{label}</span>
        <span style={{color:cor,fontWeight:700}}>{pct}%</span>
      </div>
      <div style={{background:"#f3f4f6",borderRadius:20,height:8,overflow:"hidden"}}>
        <div style={{width:pct+"%",background:cor,height:"100%",borderRadius:20,transition:"width .5s"}}/>
      </div>
    </div>
  );
}

function AbaRastreamentoNeuro({ paciente }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);

  useEffect(()=>{
    if(!paciente?.nome) return;
    db.collection("clinica_rastreamento_neuro")
      .where("pacienteNome","==",paciente.nome)
      .get()
      .then(snap=>{
        const lista = snap.docs.map(d=>({id:d.id,...d.data()}))
          .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
        setDocs(lista);
        setLoading(false);
      })
      .catch(()=>setLoading(false));
  },[paciente?.nome]);

  function copiarLink(){
    const url = `https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/neuro/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    navigator.clipboard.writeText(url).then(()=>alert("✓ Link copiado! "+url));
  }

  function enviarWhatsApp(){
    const url = `https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/neuro/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    const msg = "Olá! 😊\n\nSua psicóloga Dra. Lucia Kratz preparou um questionário clínico para você preencher.\n\n*Questionário Clínico*\nResponda com calma e honestidade — leva cerca de 10 a 15 minutos.\n\n"+url+"\n\nQualquer dúvida, estou por aqui!\n_Dra. Lucia Kratz · CRP 09/20590_";
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  }

  function gerarLaudoNeuro(){
    if(docs.length===0){alert("Nenhuma resposta para gerar laudo.");return;}
    const pacNome = paciente.nome||"Paciente";
    const data = new Date().toLocaleDateString("pt-BR");
    const escoresPorDoc = docs.map(d=>({...d,escores:calcularEscoresNeuro(d)}));
    const n = docs.length;
    const media = {
      tdahIn: Math.round(escoresPorDoc.reduce((s,d)=>s+d.escores.tdahIn,0)/n*10)/10,
      tdahHi: Math.round(escoresPorDoc.reduce((s,d)=>s+d.escores.tdahHi,0)/n*10)/10,
      tea:    Math.round(escoresPorDoc.reduce((s,d)=>s+d.escores.tea,0)/n*10)/10,
      tod:    Math.round(escoresPorDoc.reduce((s,d)=>s+d.escores.tod,0)/n*10)/10,
    };
    const laudo = laudoNeuro(media);
    const COR = {A:"#16a34a",B:"#d97706",C:"#dc2626"};

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Laudo Rastreamento Comportamental — ${pacNome}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#1f2937;padding:32px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6}
h1{font-size:20px;color:#3d006a;margin-bottom:4px}
h2{font-size:14px;color:#7B00C4;margin:20px 0 8px;border-bottom:1px solid #ede9fe;padding-bottom:4px}
h3{font-size:12.5px;color:#374151;margin:12px 0 6px}
.header{border-bottom:2px solid #7B00C4;padding-bottom:16px;margin-bottom:20px}
.sub{font-size:12px;color:#6b7280;margin-top:2px}
.barra-bg{background:#f3f4f6;border-radius:20px;height:10px;overflow:hidden;margin-top:3px}
.hipotese{background:#f5f3ff;border:1px solid #c4b5fd;border-radius:10px;padding:14px 18px;margin:12px 0}
.criterio{border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:8px}
.badge-sim{background:#fef2f2;color:#dc2626;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-nao{background:#f0fdf4;color:#16a34a;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.atencao-item{background:#fff7ed;border-left:3px solid #f97316;padding:8px 12px;margin-bottom:6px;border-radius:0 6px 6px 0;font-size:12px}
.resp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
.resp-table th{background:#f5f3ff;padding:6px 10px;text-align:left;font-size:10.5px;color:#7B00C4;border:1px solid #ede9fe}
.resp-table td{padding:6px 10px;border:1px solid #e5e7eb;vertical-align:top}
.resp-table tr:nth-child(even) td{background:#fafafa}
.rodape{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
.assinatura{text-align:center;margin-top:40px}
.assinatura img{height:60px;opacity:.9}
.assinatura p{font-size:12px;color:#374151;margin-top:6px}
@media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px">🖨️ Imprimir / Salvar PDF</button>
</div>
<div class="header">
  <h1>Laudo de Rastreamento — Funcionamento e Comportamento</h1>
  <div class="sub">Paciente: <strong>${pacNome}</strong> · Data: ${data} · Dra. Lucia Kratz · CRP 09/20590</div>
  <div class="sub">Respondentes: ${docs.length} (${docs.map(d=>d.tipoRespondente==="paciente"?"próprio paciente":d.parentesco||"familiar").join(", ")})</div>
</div>

<h2>I. Escores por Eixo DSM-5 (média entre respondentes)</h2>
<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>TDAH — Inatenção</strong> (8 itens)</span><span style="color:#7c3aed;font-weight:700">${laudo.nivel(laudo.pIn)} (${laudo.pIn}%)</span></div><div class="barra-bg"><div style="width:${laudo.pIn}%;background:#7c3aed;height:100%;border-radius:20px"></div></div></div>
<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>TDAH — Hiperatividade/Impulsividade</strong> (7 itens)</span><span style="color:#dc2626;font-weight:700">${laudo.nivel(laudo.pHi)} (${laudo.pHi}%)</span></div><div class="barra-bg"><div style="width:${laudo.pHi}%;background:#dc2626;height:100%;border-radius:20px"></div></div></div>
<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>TEA — Espectro Autista</strong> (7 itens)</span><span style="color:#2563eb;font-weight:700">${laudo.nivel(laudo.pTea)} (${laudo.pTea}%)</span></div><div class="barra-bg"><div style="width:${laudo.pTea}%;background:#2563eb;height:100%;border-radius:20px"></div></div></div>
<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>TOD — Transtorno Opositivo-Desafiador</strong> (6 itens)</span><span style="color:#d97706;font-weight:700">${laudo.nivel(laudo.pTod)} (${laudo.pTod}%)</span></div><div class="barra-bg"><div style="width:${laudo.pTod}%;background:#d97706;height:100%;border-radius:20px"></div></div></div>

<h2>II. Hipótese Diagnóstica</h2>
<div class="hipotese"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7B00C4;margin-bottom:4px">Hipótese principal</div><div style="font-size:15px;font-weight:700;color:#3d006a">${laudo.hipotese}</div></div>
${laudo.criterios.map(c=>`<div class="criterio"><div style="font-weight:700;font-size:13px;margin-bottom:4px">${c.label} &nbsp;<span class="${c.atende?"badge-sim":"badge-nao"}">${c.atende?"✓ Critérios presentes":"✗ Não atende"}</span></div><div style="font-size:12px;color:#4b5563">${c.obs}</div></div>`).join("")}

<h2>III. Pontos de Atenção para a Entrevista Clínica</h2>
${laudo.atencao.length===0?"<p style='color:#6b7280;font-size:12px'>Nenhum ponto crítico identificado pelos escores.</p>":laudo.atencao.map(a=>`<div class="atencao-item">⚠ ${a}</div>`).join("")}

<h2>IV. Respostas por Respondente</h2>
${escoresPorDoc.map(d=>`
<h3>${d.tipoRespondente==="paciente"?"Próprio paciente":"Familiar: "+(d.nomeRespondente||"")+" ("+( d.parentesco||"—")+")"}</h3>
<table class="resp-table"><thead><tr><th>#</th><th>Item</th><th>Eixo</th><th>Resp.</th></tr></thead><tbody>
${PERGUNTAS_NEURO.map(p=>`<tr><td>${p.id.replace("p","")}</td><td>${p.texto}</td><td>${p.eixo}</td><td style="font-weight:700;color:${COR[d[p.id]]||"#6b7280"}">${d[p.id]||"—"}</td></tr>`).join("")}
${d.obsFinais?`<tr><td colspan="2"><strong>Observações</strong></td><td colspan="2">${d.obsFinais}</td></tr>`:""}
</tbody></table>`).join("")}

<div class="assinatura">
  <img src="https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/Assinatura%20Lu%C3%ADcia%20Kratz.png" alt="Assinatura" onerror="this.style.display='none'"/>
  <p><strong>Dra. Lucia Kratz</strong><br/>Psicóloga · CRP 09/20590<br/>Doutora em Psicologia · TCC · Musicoterapia · Neuromodulação</p>
</div>
<div class="rodape">Documento gerado em ${data} · Uso exclusivo para fins clínicos · Confidencial · LGPD</div>
</body></html>`;

    const w = window.open("","_blank");
    w.document.write(html);
    w.document.close();
  }

  if(loading) return <div style={{padding:40,textAlign:"center"}}><Spinner/></div>;

  return (
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20,flexWrap:"wrap",justifyContent:"space-between"}}>
        <div>
          <div style={{fontWeight:700,fontSize:15,color:"var(--text-dark)"}}>Funcionamento e Comportamento</div>
          <div style={{fontSize:12,color:"var(--text-muted)",marginTop:2}}>{docs.length} respondente{docs.length!==1?"s":""} encontrado{docs.length!==1?"s":""}</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button className="btn btn-ghost" style={{fontSize:12,padding:"7px 14px"}} onClick={copiarLink}>
            <Icon name="link" size={13}/> Copiar Link
          </button>
          <button className="btn btn-ghost" style={{fontSize:12,padding:"7px 14px",color:"#16a34a",borderColor:"#16a34a"}} onClick={enviarWhatsApp}>
            <Icon name="message-circle" size={13}/> WhatsApp
          </button>
          {docs.length>0 && (
            <button className="btn btn-purple" style={{fontSize:12,padding:"7px 14px"}} onClick={gerarLaudoNeuro}>
              <Icon name="file-text" size={13}/> Gerar Laudo PDF
            </button>
          )}
        </div>
      </div>

      {docs.length===0 && (
        <div style={{textAlign:"center",padding:40,color:"var(--text-muted)"}}>
          <div style={{fontSize:40,marginBottom:12}}>🧩</div>
          <div style={{fontWeight:600,marginBottom:6}}>Nenhuma resposta ainda</div>
          <div style={{fontSize:13,marginBottom:16}}>Envie o link para o paciente e os familiares responderem.</div>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-ghost" onClick={copiarLink}><Icon name="link" size={14}/> Copiar Link</button>
            <button className="btn btn-purple" onClick={enviarWhatsApp}><Icon name="message-circle" size={14}/> Enviar pelo WhatsApp</button>
          </div>
        </div>
      )}

      {docs.length>0 && (()=>{
        const escoresPorDoc = docs.map(d=>({...d,escores:calcularEscoresNeuro(d)}));
        const n = docs.length;
        const media = {
          tdahIn: escoresPorDoc.reduce((s,d)=>s+d.escores.tdahIn,0)/n,
          tdahHi: escoresPorDoc.reduce((s,d)=>s+d.escores.tdahHi,0)/n,
          tea:    escoresPorDoc.reduce((s,d)=>s+d.escores.tea,0)/n,
          tod:    escoresPorDoc.reduce((s,d)=>s+d.escores.tod,0)/n,
        };
        const laudo = laudoNeuro(media);
        return (
          <div>
            <div style={{background:"#f5f3ff",border:"1px solid #c4b5fd",borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--purple)",marginBottom:4}}>Hipótese diagnóstica provável</div>
              <div style={{fontSize:15,fontWeight:700,color:"#3d006a",lineHeight:1.4}}>{laudo.hipotese}</div>
            </div>

            <div style={{background:"var(--gray-50)",border:"1px solid var(--gray-200)",borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:12}}>Escores médios por eixo DSM-5</div>
              <BarraEscoreNeuro label="TDAH — Inatenção"              valor={media.tdahIn} max={16} cor="#7c3aed"/>
              <BarraEscoreNeuro label="TDAH — Hiperatividade/Impuls." valor={media.tdahHi} max={14} cor="#dc2626"/>
              <BarraEscoreNeuro label="TEA — Espectro Autista"        valor={media.tea}    max={14} cor="#2563eb"/>
              <BarraEscoreNeuro label="TOD — Opositivo-Desafiador"    valor={media.tod}    max={12} cor="#d97706"/>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>Análise DSM-5</div>
              {laudo.criterios.map((c,i)=>(
                <div key={i} style={{border:"1px solid var(--gray-200)",borderRadius:10,padding:"10px 14px",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontWeight:600,fontSize:13}}>{c.label}</span>
                    <CorBadge atende={c.atende===true?true:c.atende===false?false:null}/>
                  </div>
                  <div style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.5}}>{c.obs}</div>
                </div>
              ))}
            </div>

            {laudo.atencao.length>0 && (
              <div style={{marginBottom:16}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:8}}>⚠ Pontos de atenção para a entrevista</div>
                {laudo.atencao.map((a,i)=>(
                  <div key={i} style={{background:"#fff7ed",borderLeft:"3px solid #f97316",padding:"8px 12px",marginBottom:6,borderRadius:"0 8px 8px 0",fontSize:12,lineHeight:1.5}}>{a}</div>
                ))}
              </div>
            )}

            <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>Respondentes</div>
            {escoresPorDoc.map((d,i)=>(
              <div key={i} style={{border:"1px solid var(--gray-200)",borderRadius:12,padding:14,marginBottom:10,cursor:"pointer",background:selecionado===i?"#f5f3ff":"white"}}
                onClick={()=>setSelecionado(selecionado===i?null:i)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>
                      {d.tipoRespondente==="paciente"?"🙋 Próprio paciente":"👨‍👩‍👧 "+(d.nomeRespondente||"Familiar")+" · "+(d.parentesco||"")}
                    </div>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>
                      {d.createdAt?.toDate?.()?.toLocaleDateString("pt-BR")||"Data não disponível"}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {[
                      {label:"In "+Math.round(d.escores.tdahIn/16*100)+"%", cor:"#7c3aed", bg:"#ede9fe"},
                      {label:"Hi "+Math.round(d.escores.tdahHi/14*100)+"%", cor:"#dc2626", bg:"#fef2f2"},
                      {label:"TEA "+Math.round(d.escores.tea/14*100)+"%",   cor:"#2563eb", bg:"#eff6ff"},
                      {label:"TOD "+Math.round(d.escores.tod/12*100)+"%",   cor:"#d97706", bg:"#fffbeb"},
                    ].map((b,bi)=>(
                      <span key={bi} style={{background:b.bg,color:b.cor,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600}}>{b.label}</span>
                    ))}
                  </div>
                </div>
                {selecionado===i && (
                  <div style={{marginTop:14,borderTop:"1px solid var(--gray-200)",paddingTop:12}}>
                    {PERGUNTAS_NEURO.map(p=>(
                      <div key={p.id} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8,fontSize:12}}>
                        <span style={{
                          minWidth:22,height:22,borderRadius:"50%",
                          background:d[p.id]==="C"?"#fef2f2":d[p.id]==="B"?"#fffbeb":"#f0fdf4",
                          color:d[p.id]==="C"?"#dc2626":d[p.id]==="B"?"#d97706":"#16a34a",
                          display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11
                        }}>{d[p.id]||"—"}</span>
                        <div>
                          <div style={{color:"var(--text-muted)",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{p.eixo}</div>
                          <div style={{color:"var(--text-dark)",lineHeight:1.4}}>{p.texto}</div>
                        </div>
                      </div>
                    ))}
                    {d.obsFinais && (
                      <div style={{background:"var(--gray-50)",border:"1px solid var(--gray-200)",borderRadius:8,padding:10,marginTop:8}}>
                        <div style={{fontSize:10,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Observações</div>
                        <div style={{fontSize:12,color:"var(--text-dark)",lineHeight:1.6}}>{d.obsFinais}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  MÓDULO: RASTREAMENTO ALIMENTAR — AbaRastreamentoAlimentar
//  Coleção: clinica_rastreamento_alimentar
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS_ALIMENTAR = [
  {id:"p1",  eixo:"Anorexia",  texto:"Restrição persistente / peso abaixo do esperado"},
  {id:"p2",  eixo:"Anorexia",  texto:"Medo intenso de engordar"},
  {id:"p3",  eixo:"Anorexia",  texto:"Distorção da imagem corporal"},
  {id:"p4",  eixo:"Anorexia",  texto:"Padrão de controle de peso (últimos 3 meses)"},
  {id:"p5",  eixo:"Bulimia/TCA", texto:"Episódios de ingestão muito acima do normal"},
  {id:"p6",  eixo:"Bulimia/TCA", texto:"Perda de controle durante os episódios"},
  {id:"p7",  eixo:"Bulimia/TCA", texto:"Frequência dos episódios"},
  {id:"p8",  eixo:"Bulimia/TCA", texto:"Uso de métodos compensatórios após ingestão excessiva"},
  {id:"p9",  eixo:"TCA Puro",  texto:"Padrão de ingestão rápida, secreta ou exagerada"},
  {id:"p10", eixo:"TCA Puro",  texto:"Culpa intensa sem comportamentos compensatórios"},
];

function calcularEscoresAlimentar(doc) {
  const p = id => ({A:0,B:1,C:2}[doc[id]]||0);
  return {
    anorexia: ["p1","p2","p3","p4"].reduce((s,id)=>s+p(id),0),
    bulimia:  ["p5","p6","p7","p8"].reduce((s,id)=>s+p(id),0),
    tca:      ["p9","p10"].reduce((s,id)=>s+p(id),0),
  };
}

function laudoAlimentar(escores, doc) {
  const {anorexia, bulimia, tca} = escores;
  const pAn = Math.round(anorexia/8*100);
  const pBu = Math.round(bulimia/8*100);
  const pTc = Math.round(tca/4*100);

  let hipotese = [];
  let criterios = [];
  let atencao = [];

  if(pAn>=50){
    const subtipo = doc?.p4==="C" ? "Subtipo Compulsão/Purgativo" : "Subtipo Restritivo";
    hipotese.push("Anorexia Nervosa — "+subtipo);
    criterios.push({label:"Anorexia Nervosa (DSM-5 F50.0)",atende:true,obs:"Escores elevados nos três critérios nucleares: restrição (p1), medo de engordar (p2) e distorção da imagem corporal (p3). Subtipo: "+subtipo+"."});
    atencao.push("Avaliar IMC atual e velocidade de perda de peso — risco clínico de desnutrição grave.");
    atencao.push("Solicitar exames laboratoriais urgentes: eletrólitos, hemograma, função cardíaca (ECG) e densidade óssea.");
    if(doc?.p4==="C") atencao.push("Padrão purgativo confirmado — investigar lesões esofágicas, erosão dentária e hipocalemia.");
  } else {
    criterios.push({label:"Anorexia Nervosa",atende:false,obs:"Escores abaixo do limiar — sem os três critérios nucleares simultâneos."});
  }

  if(pBu>=50){
    const temPurgacao = doc?.p8==="C";
    if(temPurgacao){
      hipotese.push("Bulimia Nervosa");
      criterios.push({label:"Bulimia Nervosa (DSM-5 F50.2)",atende:true,obs:"Compulsão recorrente (p5/p6), frequência ≥1x/semana por 3 meses (p7) e comportamentos compensatórios (p8) confirmados."});
      atencao.push("Investigar desequilíbrio eletrolítico (hipocalemia, hiponatremia) — risco cardíaco.");
      atencao.push("Avaliar erosão dentária, calosas nos nós dos dedos (sinal de Russell) e lesões esofágicas.");
    } else if(pTc>=50){
      hipotese.push("Transtorno de Compulsão Alimentar (TCA)");
      criterios.push({label:"TCA — Compulsão sem Purgação (DSM-5 F50.8)",atende:true,obs:"Compulsão recorrente com sofrimento intenso e ausência de comportamentos compensatórios — perfil clássico de TCA."});
      atencao.push("Avaliar sobrepeso/obesidade como consequência do TCA e impacto metabólico.");
      atencao.push("Rastrear depressão e ansiedade associadas — alta comorbidade com TCA.");
    }
  } else if(pTc>=50 && pBu<50){
    hipotese.push("Transtorno de Compulsão Alimentar (TCA) leve");
    criterios.push({label:"TCA (traços)",atende:null,obs:"Padrão de compulsão com culpa presente, mas frequência abaixo do limiar diagnóstico pleno."});
    atencao.push("Monitorar frequência dos episódios — se aumentar para ≥1x/semana por 3 meses, revisar diagnóstico.");
  }

  if(hipotese.length===0){
    if(doc?.p4==="B"){
      hipotese.push("ARFID ou restrição alimentar subliminar — investigar");
      criterios.push({label:"ARFID (DSM-5 F50.82)",atende:null,obs:"Restrição presente sem distorção de imagem ou medo de engordar — investigar seletividade sensorial ou medo de engasgo."});
    } else {
      hipotese.push("Sem hipótese diagnóstica definida pelos escores — avaliação clínica aprofundada indicada.");
      criterios.push({label:"Transtornos Alimentares",atende:false,obs:"Escores abaixo do limiar para todos os diagnósticos avaliados."});
    }
  }

  return {hipotese:hipotese.join(" / "), criterios, atencao, pAn, pBu, pTc};
}

function AbaRastreamentoAlimentar({ paciente }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);

  useEffect(()=>{
    if(!paciente?.nome) return;
    db.collection("clinica_rastreamento_alimentar")
      .where("pacienteNome","==",paciente.nome)
      .get()
      .then(snap=>{
        const lista = snap.docs.map(d=>({id:d.id,...d.data()}))
          .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
        setDocs(lista);
        setLoading(false);
      })
      .catch(()=>setLoading(false));
  },[paciente?.nome]);

  function copiarLink(){
    const url = `https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/alimentar/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    navigator.clipboard.writeText(url).then(()=>alert("✓ Link copiado! "+url));
  }

  function enviarWhatsApp(){
    const url = `https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/alimentar/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    const msg = "Olá! 😊\n\nSua psicóloga Dra. Lucia Kratz preparou um questionário clínico para você preencher.\n\n*Questionário Clínico*\nResponda com calma e honestidade — leva cerca de 5 a 10 minutos.\n\n"+url+"\n\nQualquer dúvida, estou por aqui!\n_Dra. Lucia Kratz · CRP 09/20590_";
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  }

  function gerarLaudoAlimentar(){
    if(docs.length===0){alert("Nenhuma resposta para gerar laudo.");return;}
    const pacNome = paciente.nome||"Paciente";
    const data = new Date().toLocaleDateString("pt-BR");
    const escoresPorDoc = docs.map(d=>({...d,escores:calcularEscoresAlimentar(d)}));
    const n = docs.length;
    const media = {
      anorexia: escoresPorDoc.reduce((s,d)=>s+d.escores.anorexia,0)/n,
      bulimia:  escoresPorDoc.reduce((s,d)=>s+d.escores.bulimia,0)/n,
      tca:      escoresPorDoc.reduce((s,d)=>s+d.escores.tca,0)/n,
    };
    const laudo = laudoAlimentar(media, docs[0]);
    const COR = {A:"#16a34a",B:"#d97706",C:"#dc2626"};

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Laudo Rastreamento Alimentar — ${pacNome}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#1f2937;padding:32px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6}
h1{font-size:20px;color:#3d006a;margin-bottom:4px}
h2{font-size:14px;color:#7B00C4;margin:20px 0 8px;border-bottom:1px solid #ede9fe;padding-bottom:4px}
h3{font-size:12.5px;color:#374151;margin:12px 0 6px}
.header{border-bottom:2px solid #7B00C4;padding-bottom:16px;margin-bottom:20px}
.sub{font-size:12px;color:#6b7280;margin-top:2px}
.barra-bg{background:#f3f4f6;border-radius:20px;height:10px;overflow:hidden;margin-top:3px}
.hipotese{background:#f5f3ff;border:1px solid #c4b5fd;border-radius:10px;padding:14px 18px;margin:12px 0}
.criterio{border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:8px}
.badge-sim{background:#fef2f2;color:#dc2626;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-nao{background:#f0fdf4;color:#16a34a;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-inv{background:#fffbeb;color:#d97706;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.alerta{background:#fef2f2;border-left:3px solid #dc2626;padding:8px 12px;margin-bottom:6px;border-radius:0 6px 6px 0;font-size:12px}
.atencao-item{background:#fff7ed;border-left:3px solid #f97316;padding:8px 12px;margin-bottom:6px;border-radius:0 6px 6px 0;font-size:12px}
.resp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
.resp-table th{background:#f5f3ff;padding:6px 10px;text-align:left;font-size:10.5px;color:#7B00C4;border:1px solid #ede9fe}
.resp-table td{padding:6px 10px;border:1px solid #e5e7eb;vertical-align:top}
.resp-table tr:nth-child(even) td{background:#fafafa}
.rodape{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
.assinatura{text-align:center;margin-top:40px}
.assinatura img{height:60px;opacity:.9}
.assinatura p{font-size:12px;color:#374151;margin-top:6px}
@media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px">Imprimir / Salvar PDF</button>
</div>
<div class="header">
  <h1>Laudo de Rastreamento — Hábitos Alimentares</h1>
  <div class="sub">Paciente: <strong>${pacNome}</strong> · Data: ${data} · Dra. Lucia Kratz · CRP 09/20590</div>
  <div class="sub">Respondentes: ${docs.length} (${docs.map(d=>d.tipoRespondente==="paciente"?"próprio paciente":d.parentesco||"familiar").join(", ")})</div>
</div>

<h2>I. Perfil Diagnóstico por Categoria DSM-5</h2>
<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>Anorexia Nervosa</strong> (restrição, medo, distorção)</span><span style="color:#dc2626;font-weight:700">${laudo.pAn}%</span></div><div class="barra-bg"><div style="width:${laudo.pAn}%;background:#dc2626;height:100%;border-radius:20px"></div></div></div>
<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>Bulimia Nervosa</strong> (compulsão + compensação)</span><span style="color:#7c3aed;font-weight:700">${laudo.pBu}%</span></div><div class="barra-bg"><div style="width:${laudo.pBu}%;background:#7c3aed;height:100%;border-radius:20px"></div></div></div>
<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>TCA — Compulsão sem Purgação</strong></span><span style="color:#d97706;font-weight:700">${laudo.pTc}%</span></div><div class="barra-bg"><div style="width:${laudo.pTc}%;background:#d97706;height:100%;border-radius:20px"></div></div></div>

<h2>II. Hipótese Diagnóstica</h2>
<div class="hipotese"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7B00C4;margin-bottom:4px">Hipótese principal</div><div style="font-size:15px;font-weight:700;color:#3d006a">${laudo.hipotese}</div></div>
${laudo.criterios.map(c=>`<div class="criterio"><div style="font-weight:700;font-size:13px;margin-bottom:4px">${c.label} &nbsp;<span class="${c.atende===true?"badge-sim":c.atende===false?"badge-nao":"badge-inv"}">${c.atende===true?"✓ Critérios presentes":c.atende===false?"✗ Não atende":"⚠ Investigar"}</span></div><div style="font-size:12px;color:#4b5563">${c.obs}</div></div>`).join("")}

<h2>III. Pontos de Atenção e Alertas Clínicos</h2>
${laudo.atencao.length===0?"<p style='color:#6b7280;font-size:12px'>Nenhum alerta crítico identificado pelos escores.</p>":laudo.atencao.map(a=>`<div class="atencao-item">⚠ ${a}</div>`).join("")}

<h2>IV. Respostas por Respondente</h2>
${escoresPorDoc.map(d=>`
<h3>${d.tipoRespondente==="paciente"?"Próprio paciente":"Familiar: "+(d.nomeRespondente||"")+" ("+(d.parentesco||"—")+")"}</h3>
<table class="resp-table"><thead><tr><th>#</th><th>Item</th><th>Eixo</th><th>Resp.</th></tr></thead><tbody>
${PERGUNTAS_ALIMENTAR.map(p=>`<tr><td>${p.id.replace("p","")}</td><td>${p.texto}</td><td>${p.eixo}</td><td style="font-weight:700;color:${COR[d[p.id]]||"#6b7280"}">${d[p.id]||"—"}</td></tr>`).join("")}
${d.obsFinais?`<tr><td colspan="2"><strong>Observações</strong></td><td colspan="2">${d.obsFinais}</td></tr>`:""}
</tbody></table>`).join("")}

<div class="assinatura">
  <img src="https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/Assinatura%20Lu%C3%ADcia%20Kratz.png" alt="Assinatura" onerror="this.style.display='none'"/>
  <p><strong>Dra. Lucia Kratz</strong><br/>Psicóloga · CRP 09/20590<br/>Doutora em Psicologia · TCC · Musicoterapia · Neuromodulação</p>
</div>
<div class="rodape">Documento gerado em ${data} · Uso exclusivo para fins clínicos · Confidencial · LGPD</div>
</body></html>`;

    const w = window.open("","_blank");
    w.document.write(html);
    w.document.close();
  }

  if(loading) return <div style={{padding:40,textAlign:"center"}}><Spinner/></div>;

  return (
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20,flexWrap:"wrap",justifyContent:"space-between"}}>
        <div>
          <div style={{fontWeight:700,fontSize:15,color:"var(--text-dark)"}}>Hábitos Alimentares</div>
          <div style={{fontSize:12,color:"var(--text-muted)",marginTop:2}}>{docs.length} respondente{docs.length!==1?"s":""} encontrado{docs.length!==1?"s":""}</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button className="btn btn-ghost" style={{fontSize:12,padding:"7px 14px"}} onClick={copiarLink}>
            <Icon name="link" size={13}/> Copiar Link
          </button>
          <button className="btn btn-ghost" style={{fontSize:12,padding:"7px 14px",color:"#16a34a",borderColor:"#16a34a"}} onClick={enviarWhatsApp}>
            <Icon name="message-circle" size={13}/> WhatsApp
          </button>
          {docs.length>0 && (
            <button className="btn btn-purple" style={{fontSize:12,padding:"7px 14px"}} onClick={gerarLaudoAlimentar}>
              <Icon name="file-text" size={13}/> Gerar Laudo PDF
            </button>
          )}
        </div>
      </div>

      {docs.length===0 && (
        <div style={{textAlign:"center",padding:40,color:"var(--text-muted)"}}>
          <div style={{fontSize:40,marginBottom:12}}>🍎</div>
          <div style={{fontWeight:600,marginBottom:6}}>Nenhuma resposta ainda</div>
          <div style={{fontSize:13,marginBottom:16}}>Envie o link para o paciente e os familiares responderem.</div>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-ghost" onClick={copiarLink}><Icon name="link" size={14}/> Copiar Link</button>
            <button className="btn btn-purple" onClick={enviarWhatsApp}><Icon name="message-circle" size={14}/> Enviar pelo WhatsApp</button>
          </div>
        </div>
      )}

      {docs.length>0 && (()=>{
        const escoresPorDoc = docs.map(d=>({...d,escores:calcularEscoresAlimentar(d)}));
        const n = docs.length;
        const media = {
          anorexia: escoresPorDoc.reduce((s,d)=>s+d.escores.anorexia,0)/n,
          bulimia:  escoresPorDoc.reduce((s,d)=>s+d.escores.bulimia,0)/n,
          tca:      escoresPorDoc.reduce((s,d)=>s+d.escores.tca,0)/n,
        };
        const laudo = laudoAlimentar(media, docs[0]);
        return (
          <div>
            <div style={{background:"#f5f3ff",border:"1px solid #c4b5fd",borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--purple)",marginBottom:4}}>Hipótese diagnóstica provável</div>
              <div style={{fontSize:15,fontWeight:700,color:"#3d006a",lineHeight:1.4}}>{laudo.hipotese}</div>
            </div>

            <div style={{background:"var(--gray-50)",border:"1px solid var(--gray-200)",borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:12}}>Escores por categoria DSM-5</div>
              <BarraEscore label="Anorexia Nervosa"              valor={media.anorexia} max={8} cor="#dc2626"/>
              <BarraEscore label="Bulimia Nervosa"               valor={media.bulimia}  max={8} cor="#7c3aed"/>
              <BarraEscore label="TCA — Compulsão sem Purgação"  valor={media.tca}      max={4} cor="#d97706"/>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>Análise DSM-5</div>
              {laudo.criterios.map((c,i)=>(
                <div key={i} style={{border:"1px solid var(--gray-200)",borderRadius:10,padding:"10px 14px",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontWeight:600,fontSize:13}}>{c.label}</span>
                    <CorBadge atende={c.atende}/>
                  </div>
                  <div style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.5}}>{c.obs}</div>
                </div>
              ))}
            </div>

            {laudo.atencao.length>0 && (
              <div style={{marginBottom:16}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:8}}>⚠ Pontos de atenção</div>
                {laudo.atencao.map((a,i)=>(
                  <div key={i} style={{background:"#fff7ed",borderLeft:"3px solid #f97316",padding:"8px 12px",marginBottom:6,borderRadius:"0 8px 8px 0",fontSize:12,lineHeight:1.5}}>{a}</div>
                ))}
              </div>
            )}

            <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>Respondentes</div>
            {escoresPorDoc.map((d,i)=>(
              <div key={i} style={{border:"1px solid var(--gray-200)",borderRadius:12,padding:14,marginBottom:10,cursor:"pointer",background:selecionado===i?"#f5f3ff":"white"}}
                onClick={()=>setSelecionado(selecionado===i?null:i)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>
                      {d.tipoRespondente==="paciente"?"🙋 Próprio paciente":"👨‍👩‍👧 "+(d.nomeRespondente||"Familiar")+" · "+(d.parentesco||"")}
                    </div>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>
                      {d.createdAt?.toDate?.()?.toLocaleDateString("pt-BR")||"Data não disponível"}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {[
                      {label:"AN "+Math.round(d.escores.anorexia/8*100)+"%", cor:"#dc2626", bg:"#fef2f2"},
                      {label:"BN "+Math.round(d.escores.bulimia/8*100)+"%",  cor:"#7c3aed", bg:"#ede9fe"},
                      {label:"TCA "+Math.round(d.escores.tca/4*100)+"%",     cor:"#d97706", bg:"#fffbeb"},
                    ].map((b,bi)=>(
                      <span key={bi} style={{background:b.bg,color:b.cor,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600}}>{b.label}</span>
                    ))}
                  </div>
                </div>
                {selecionado===i && (
                  <div style={{marginTop:14,borderTop:"1px solid var(--gray-200)",paddingTop:12}}>
                    {PERGUNTAS_ALIMENTAR.map(p=>(
                      <div key={p.id} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8,fontSize:12}}>
                        <span style={{
                          minWidth:22,height:22,borderRadius:"50%",
                          background:d[p.id]==="C"?"#fef2f2":d[p.id]==="B"?"#fffbeb":"#f0fdf4",
                          color:d[p.id]==="C"?"#dc2626":d[p.id]==="B"?"#d97706":"#16a34a",
                          display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11
                        }}>{d[p.id]||"—"}</span>
                        <div>
                          <div style={{color:"var(--text-muted)",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{p.eixo}</div>
                          <div style={{color:"var(--text-dark)",lineHeight:1.4}}>{p.texto}</div>
                        </div>
                      </div>
                    ))}
                    {d.obsFinais && (
                      <div style={{background:"var(--gray-50)",border:"1px solid var(--gray-200)",borderRadius:8,padding:10,marginTop:8}}>
                        <div style={{fontSize:10,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Observações</div>
                        <div style={{fontSize:12,color:"var(--text-dark)",lineHeight:1.6}}>{d.obsFinais}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  MÓDULO: RASTREAMENTO SEXUAL — AbaRastreamentoSexual
//  Coleção: clinica_rastreamento_sexual
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS_SEXUAL=[
  {id:"p1", eixo:"Desejo",    texto:"Ausência ou redução persistente de desejo sexual (≥6m)"},
  {id:"p2", eixo:"Desejo",    texto:"Repulsa ou aversão ativa ao contato sexual"},
  {id:"p3", eixo:"Excitação", texto:"Dificuldade na resposta física de excitação"},
  {id:"p4", eixo:"Orgasmo",   texto:"Atraso ou ausência de orgasmo"},
  {id:"p5", eixo:"Ejaculação",texto:"Ejaculação precoce / involuntária (homens)"},
  {id:"p6", eixo:"Ejaculação",texto:"Atraso ou ausência de ejaculação (homens)"},
  {id:"p7", eixo:"Dor",       texto:"Dor genital ou pélvica durante penetração"},
  {id:"p8", eixo:"Dor",       texto:"Contração involuntária e medo da penetração (mulheres)"},
  {id:"p9", eixo:"Contexto",  texto:"Persistência ≥6 meses com sofrimento clínico"},
  {id:"p10",eixo:"Contexto",  texto:"Generalizado vs. situacional"},
  {id:"p11",eixo:"Contexto",  texto:"Fator etiológico associado"},
];

function calcularEscoresSexual(doc){
  const p=id=>({A:0,B:1,C:2}[doc[id]]||0);
  return {
    desejo:    p("p1")+p("p2"),
    excitacao: p("p3"),
    orgasmo:   p("p4"),
    ejaculacao:p("p5")+p("p6"),
    dor:       p("p7")+p("p8"),
    criterio:  p("p9"),
  };
}

function laudoSexual(doc){
  const p=id=>doc[id]||"A";
  let hipotese=[];
  let criterios=[];
  let atencao=[];
  const temCriterio=p("p9")==="C";
  const generalizado=p("p10")==="C";
  const etiologia=p("p11");

  if(p("p1")==="C"){
    hipotese.push("Transtorno do Desejo Sexual Hipoativo");
    criterios.push({label:"Desejo Sexual Hipoativo (DSM-5 F52.0)",atende:temCriterio,obs:"Ausência crônica de desejo por ≥6 meses com sofrimento clínico. "+(generalizado?"Caráter generalizado.":"Caráter situacional — avaliar fatores relacionais.")});
    atencao.push("Investigar queda hormonal (testosterona/estrogênio), uso de antidepressivos ISRS e conflitos relacionais.");
  }
  if(p("p2")==="C"){
    hipotese.push("Aversão Sexual");
    criterios.push({label:"Aversão Sexual",atende:temCriterio,obs:"Evitação fóbica ativa de contato sexual. Avaliar histórico de trauma ou abuso sexual."});
    atencao.push("Rastrear histórico de trauma sexual — alta prevalência de TEPT associado à aversão sexual.");
  }
  if(p("p3")==="C"){
    hipotese.push("Transtorno de Excitação");
    criterios.push({label:"Transtorno de Excitação (DSM-5 F52.22/F52.21)",atende:temCriterio,obs:"Disfunção erétil ou déficit de lubrificação crônico. "+(etiologia==="B"?"Possível efeito iatrogênico de medicação.":etiologia==="A"?"Investigar causa orgânica vascular/neurológica.":"Fator psicogênico predominante.")});
    if(etiologia==="A") atencao.push("Encaminhar para urologia/ginecologia — possível causa orgânica vascular ou hormonal.");
    if(etiologia==="B") atencao.push("Revisar medicações em uso — ISRS, antihipertensivos e anticoncepcionais são causas iatrogênicas frequentes.");
  }
  if(p("p4")==="C"){
    hipotese.push("Transtorno do Orgasmo / Anorgasmia");
    criterios.push({label:"Anorgasmia (DSM-5 F52.31/F52.32)",atende:temCriterio,obs:"Ausência ou grande dificuldade persistente de atingir o orgasmo. Avaliar se é primária (nunca teve) ou secundária (perdeu após período funcional)."});
    atencao.push("Diferenciar anorgasmia primária (nunca vivenciou orgasmo) de secundária (perdeu após período funcional).");
  }
  if(p("p5")==="C"){
    hipotese.push("Ejaculação Precoce");
    criterios.push({label:"Ejaculação Precoce (DSM-5 F52.4)",atende:temCriterio,obs:"Padrão persistente de ejaculação involuntária. "+(generalizado?"Caráter generalizado — não situacional.":"Caráter situacional.")});
    atencao.push("Avaliar ansiedade de desempenho como fator primário — técnica de start-stop e terapia sexual indicadas.");
  }
  if(p("p6")==="C"){
    hipotese.push("Ejaculação Retardada");
    criterios.push({label:"Ejaculação Retardada (DSM-5 F52.32)",atende:temCriterio,obs:"Atraso extremo ou incapacidade de ejacular intravaginal. Investigar uso de antidepressivos e fatores psicogênicos."});
    atencao.push("Ejaculação retardada tem alta correlação com uso de ISRS — avaliar ajuste medicamentoso com psiquiatra.");
  }
  if(p("p7")==="C"){
    hipotese.push("Dispareunia / Dor Gênito-Pélvica");
    criterios.push({label:"Transtorno de Dor Gênito-Pélvica/Penetração (DSM-5 F52.6)",atende:temCriterio,obs:"Dor genital/pélvica recorrente. Diferencial com endometriose, vulvodínia e vaginismo deve ser feito em consulta ginecológica."});
    atencao.push("Encaminhar para ginecologia — descartar endometriose, vulvodínia e outras causas orgânicas de dispareunia.");
  }
  if(p("p8")==="C"){
    if(!hipotese.includes("Dispareunia / Dor Gênito-Pélvica")) hipotese.push("Vaginismo");
    criterios.push({label:"Vaginismo (DSM-5 F52.6)",atende:temCriterio,obs:"Espasmo involuntário da musculatura pélvica com medo fóbico da penetração. Alta resposta à terapia sexual com fisioterapia pélvica."});
    atencao.push("Vaginismo tem excelente prognóstico com fisioterapia pélvica + terapia sexual — encaminhar para especialistas.");
    atencao.push("Rastrear histórico de trauma sexual — fator etiológico frequente no vaginismo.");
  }

  if(hipotese.length===0){
    hipotese.push("Sem hipótese diagnóstica definida pelos escores — avaliação clínica aprofundada indicada.");
    criterios.push({label:"Disfunções Sexuais DSM-5",atende:false,obs:"Escores abaixo do limiar para todos os diagnósticos avaliados."});
  }

  // Etiologia
  const etioLabel=etiologia==="A"?"Orgânica/Médica":etiologia==="B"?"Iatrogênica (medicação)":"Psicogênica/Relacional";
  const etioObs=etiologia==="A"?"Investigação médica especializada indicada (urologia, ginecologia, endocrinologia).":
    etiologia==="B"?"Revisar medicações — especialmente ISRS, antihipertensivos e anticoncepcionais. Discutir com médico prescritor.":
    "Terapia sexual, psicoterapia cognitivo-comportamental e trabalho com crenças disfuncionais indicados.";

  return {hipotese:hipotese.join(" + "), criterios, atencao, etioLabel, etioObs, temCriterio, generalizado};
}

function AbaRastreamentoSexual({paciente}){
  const [docs,setDocs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selecionado,setSelecionado]=useState(null);

  useEffect(()=>{
    if(!paciente?.nome) return;
    db.collection("clinica_rastreamento_sexual")
      .where("pacienteNome","==",paciente.nome)
      .get()
      .then(snap=>{
        const lista=snap.docs.map(d=>({id:d.id,...d.data()}))
          .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
        setDocs(lista);
        setLoading(false);
      })
      .catch(()=>setLoading(false));
  },[paciente?.nome]);

  function copiarLink(){
    const url=`https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/sexual/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    navigator.clipboard.writeText(url).then(()=>alert("✓ Link copiado! "+url));
  }

  function enviarWhatsApp(){
    const url=`https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/rastreamento/sexual/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    const msg="Olá! 😊\n\nSua psicóloga Dra. Lucia Kratz preparou um questionário clínico confidencial para você preencher.\n\n*Questionário Clínico*\nResponda com calma e honestidade — suas respostas são lidas apenas pela Dra. Lucia Kratz.\n\n"+url+"\n\nQualquer dúvida, estou por aqui!\n_Dra. Lucia Kratz · CRP 09/20590_";
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  }

  function gerarLaudoSexual(){
    if(docs.length===0){alert("Nenhuma resposta para gerar laudo.");return;}
    const pacNome=paciente.nome||"Paciente";
    const data=new Date().toLocaleDateString("pt-BR");
    const doc=docs[0];
    const laudo=laudoSexual(doc);
    const COR={A:"#16a34a",B:"#d97706",C:"#dc2626"};

    const htmlLaudo=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Laudo Saude Sexual — ${pacNome}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#1f2937;padding:32px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6}
h1{font-size:20px;color:#3d006a;margin-bottom:4px}
h2{font-size:14px;color:#7B00C4;margin:20px 0 8px;border-bottom:1px solid #ede9fe;padding-bottom:4px}
h3{font-size:12.5px;color:#374151;margin:12px 0 6px}
.header{border-bottom:2px solid #7B00C4;padding-bottom:16px;margin-bottom:20px}
.sub{font-size:12px;color:#6b7280;margin-top:2px}
.hipotese{background:#f5f3ff;border:1px solid #c4b5fd;border-radius:10px;padding:14px 18px;margin:12px 0}
.criterio{border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:8px}
.badge-sim{background:#fef2f2;color:#dc2626;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-nao{background:#f0fdf4;color:#16a34a;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.atencao-item{background:#fff7ed;border-left:3px solid #f97316;padding:8px 12px;margin-bottom:6px;border-radius:0 6px 6px 0;font-size:12px}
.etio{background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px;margin:12px 0}
.resp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
.resp-table th{background:#f5f3ff;padding:6px 10px;text-align:left;font-size:10.5px;color:#7B00C4;border:1px solid #ede9fe}
.resp-table td{padding:6px 10px;border:1px solid #e5e7eb;vertical-align:top}
.resp-table tr:nth-child(even) td{background:#fafafa}
.confidencial{background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 14px;font-size:11px;color:#065f46;margin-bottom:16px}
.rodape{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
.assinatura{text-align:center;margin-top:40px}
.assinatura img{height:60px;opacity:.9}
.assinatura p{font-size:12px;color:#374151;margin-top:6px}
@media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px">Imprimir / Salvar PDF</button>
</div>
<div class="confidencial">Documento de uso exclusivo e confidencial — acesso restrito à Dra. Lucia Kratz · CRP 09/20590</div>
<div class="header">
  <h1>Laudo de Rastreamento — Saúde Sexual</h1>
  <div class="sub">Paciente: <strong>${pacNome}</strong> · Data: ${data} · Dra. Lucia Kratz · CRP 09/20590</div>
  <div class="sub">Critério temporal ≥6 meses: ${laudo.temCriterio?"✓ Confirmado":"⚠ A verificar"} · Caráter: ${laudo.generalizado?"Generalizado":"Situacional/A definir"}</div>
</div>

<h2>I. Perfil Diagnóstico por Categoria DSM-5</h2>
<div class="hipotese"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7B00C4;margin-bottom:4px">Hipótese principal</div><div style="font-size:15px;font-weight:700;color:#3d006a">${laudo.hipotese}</div></div>
${laudo.criterios.map(c=>`<div class="criterio"><div style="font-weight:700;font-size:13px;margin-bottom:4px">${c.label} &nbsp;<span class="${c.atende?"badge-sim":"badge-nao"}">${c.atende?"✓ Critérios presentes":"✗ Verificar critério temporal"}</span></div><div style="font-size:12px;color:#4b5563">${c.obs}</div></div>`).join("")}

<h2>II. Análise Etiológica Diferencial</h2>
<div class="etio"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2563eb;margin-bottom:4px">Etiologia predominante indicada</div><div style="font-size:14px;font-weight:700;color:#1e40af;margin-bottom:6px">${laudo.etioLabel}</div><div style="font-size:12px;color:#374151">${laudo.etioObs}</div></div>

<h2>III. Pontos de Atenção para a Anamnese Presencial</h2>
${laudo.atencao.length===0?"<p style='color:#6b7280;font-size:12px'>Nenhum ponto crítico identificado.</p>":laudo.atencao.map(a=>`<div class="atencao-item">⚠ ${a}</div>`).join("")}

<h2>IV. Respostas do Paciente</h2>
<table class="resp-table"><thead><tr><th>#</th><th>Item</th><th>Eixo</th><th>Resp.</th></tr></thead><tbody>
${PERGUNTAS_SEXUAL.map(p=>`<tr><td>${p.id.replace("p","")}</td><td>${p.texto}</td><td>${p.eixo}</td><td style="font-weight:700;color:${COR[doc[p.id]]||"#6b7280"}">${doc[p.id]||"—"}</td></tr>`).join("")}
</tbody></table>

<div class="assinatura">
  <img src="https://luciakratz-arch.github.io/clinica-dra.LuciaKratz/Assinatura%20Lu%C3%ADcia%20Kratz.png" alt="Assinatura" onerror="this.style.display='none'"/>
  <p><strong>Dra. Lucia Kratz</strong><br/>Psicóloga · CRP 09/20590<br/>Doutora em Psicologia · TCC · Musicoterapia · Neuromodulação</p>
</div>
<div class="rodape">Documento gerado em ${data} · Uso exclusivo para fins clínicos · Confidencial · LGPD</div>
</body></html>`;

    const w=window.open("","_blank");
    w.document.write(htmlLaudo);
    w.document.close();
  }

  if(loading) return <div style={{padding:40,textAlign:"center"}}><Spinner/></div>;

  return (
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap",justifyContent:"space-between"}}>
        <div>
          <div style={{fontWeight:700,fontSize:15,color:"var(--text-dark)"}}>Saúde Sexual</div>
          <div style={{fontSize:12,color:"var(--text-muted)",marginTop:2}}>{docs.length} resposta{docs.length!==1?"s":""} encontrada{docs.length!==1?"s":""} · Confidencial</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button className="btn btn-ghost" style={{fontSize:12,padding:"7px 14px"}} onClick={copiarLink}>
            <Icon name="link" size={13}/> Copiar Link
          </button>
          <button className="btn btn-ghost" style={{fontSize:12,padding:"7px 14px",color:"#16a34a",borderColor:"#16a34a"}} onClick={enviarWhatsApp}>
            <Icon name="message-circle" size={13}/> WhatsApp
          </button>
          {docs.length>0 && (
            <button className="btn btn-purple" style={{fontSize:12,padding:"7px 14px"}} onClick={gerarLaudoSexual}>
              <Icon name="file-text" size={13}/> Gerar Laudo PDF
            </button>
          )}
        </div>
      </div>

      <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#065f46",marginBottom:16}}>
        &#128274; Este questionário é respondido apenas pelo próprio paciente. Nenhum familiar tem acesso.
      </div>

      {docs.length===0 && (
        <div style={{textAlign:"center",padding:40,color:"var(--text-muted)"}}>
          <div style={{fontSize:40,marginBottom:12}}>🌸</div>
          <div style={{fontWeight:600,marginBottom:6}}>Nenhuma resposta ainda</div>
          <div style={{fontSize:13,marginBottom:16}}>Envie o link diretamente para o paciente.</div>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-ghost" onClick={copiarLink}><Icon name="link" size={14}/> Copiar Link</button>
            <button className="btn btn-purple" onClick={enviarWhatsApp}><Icon name="message-circle" size={14}/> Enviar pelo WhatsApp</button>
          </div>
        </div>
      )}

      {docs.length>0 && (()=>{
        const doc=docs[0];
        const laudo=laudoSexual(doc);
        return (
          <div>
            <div style={{background:"#f5f3ff",border:"1px solid #c4b5fd",borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--purple)",marginBottom:4}}>Hipótese diagnóstica provável</div>
              <div style={{fontSize:15,fontWeight:700,color:"#3d006a",lineHeight:1.4}}>{laudo.hipotese}</div>
            </div>

            <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"12px 14px",marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"#2563eb",marginBottom:4}}>Etiologia predominante</div>
              <div style={{fontWeight:700,fontSize:13,color:"#1e40af",marginBottom:4}}>{laudo.etioLabel}</div>
              <div style={{fontSize:12,color:"#374151"}}>{laudo.etioObs}</div>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>Análise DSM-5</div>
              {laudo.criterios.map((c,i)=>(
                <div key={i} style={{border:"1px solid var(--gray-200)",borderRadius:10,padding:"10px 14px",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontWeight:600,fontSize:13}}>{c.label}</span>
                    <CorBadge atende={c.atende}/>
                  </div>
                  <div style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.5}}>{c.obs}</div>
                </div>
              ))}
            </div>

            {laudo.atencao.length>0 && (
              <div style={{marginBottom:16}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:8}}>⚠ Pontos de atenção</div>
                {laudo.atencao.map((a,i)=>(
                  <div key={i} style={{background:"#fff7ed",borderLeft:"3px solid #f97316",padding:"8px 12px",marginBottom:6,borderRadius:"0 8px 8px 0",fontSize:12,lineHeight:1.5}}>{a}</div>
                ))}
              </div>
            )}

            <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>Respostas — {doc.createdAt?.toDate?.()?.toLocaleDateString("pt-BR")||""}</div>
            <div style={{border:"1px solid var(--gray-200)",borderRadius:12,padding:14,cursor:"pointer",background:selecionado===0?"#f5f3ff":"white"}}
              onClick={()=>setSelecionado(selecionado===0?null:0)}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:selecionado===0?12:0}}>🌸 Próprio paciente — clique para expandir</div>
              {selecionado===0 && (
                <div style={{borderTop:"1px solid var(--gray-200)",paddingTop:12}}>
                  {PERGUNTAS_SEXUAL.map(p=>(
                    <div key={p.id} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8,fontSize:12}}>
                      <span style={{
                        minWidth:22,height:22,borderRadius:"50%",
                        background:doc[p.id]==="C"?"#fef2f2":doc[p.id]==="B"?"#fffbeb":"#f0fdf4",
                        color:doc[p.id]==="C"?"#dc2626":doc[p.id]==="B"?"#d97706":"#16a34a",
                        display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11
                      }}>{doc[p.id]||"—"}</span>
                      <div>
                        <div style={{color:"var(--text-muted)",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{p.eixo}</div>
                        <div style={{color:"var(--text-dark)",lineHeight:1.4}}>{p.texto}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {docs.length>1 && (
              <div style={{fontSize:12,color:"var(--text-muted)",marginTop:12,textAlign:"center"}}>
                {docs.length} respostas registradas — exibindo a mais recente. Gere o laudo PDF para ver todas.
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

//  MÓDULO 2: LINKS COMPARTILHÁVEIS — AbaLinksPartilhados
//  Coleção: clinica_links_partilhados
//  Inserir: antes da função PerfilPaciente em admin/app.js
// ═══════════════════════════════════════════════════════════════════

// Ferramentas disponíveis para link compartilhável
const FERRAMENTAS_LINK = [
  { id: "anamnese",      nome: "Anamnese — Marcos do Desenvolvimento",        emoji: "📋", desc: "Formulário completo de anamnese" },
  { id: "entrevista",    nome: "Entrevista Clínica Inicial (DSM-5)",           emoji: "🧠", desc: "Instrumento de avaliação clínica inicial" },
  { id: "rastreamento",  nome: "Rastreamento Bipolar / Borderline",            emoji: "📊", desc: "Avaliação diferencial DSM-5 — paciente e familiares" },
  { id: "neuro",         nome: "Rastreamento Comportamental",                  emoji: "🧩", desc: "Avaliação de funcionamento e comportamento" },
  { id: "alimentar",     nome: "Hábitos Alimentares",                          emoji: "🍎", desc: "Rastreamento de padrões alimentares" },
  { id: "sexual",        nome: "Saúde Sexual",                                 emoji: "🌸", desc: "Rastreamento confidencial de saúde sexual" },
  { id: "dependencia",   nome: "Dependência Química e Substâncias",            emoji: "💊", desc: "11 critérios DSM-5 — paciente e familiares" },
  { id: "jogos",         nome: "Dependência de Jogos e Apostas",               emoji: "🎮", desc: "Gaming / Gambling Disorder — DSM-5/CID-11" },
];

function gerarToken() {
  return Math.random().toString(36).substring(2, 10).toUpperCase() +
    Math.random().toString(36).substring(2, 10).toUpperCase();
}

function AbaLinksPartilhados({ paciente }) {
  const BASE_URL = "https://luciakratz-arch.github.io/clinica-dra.LuciaKratz";
  const [links, setLinks] = useState({});       // { ferramentaId: { token, status, createdAt, docId } }
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState({});   // { ferramentaId: true }
  const [copiado, setCopiado] = useState({});   // { token: true }

  // Carregar links existentes
  useEffect(() => {
    db.collection("clinica_links_partilhados")
      .where("pacienteId", "==", paciente.id)
      .get()
      .then(snap => {
        const mapa = {};
        snap.docs.forEach(d => {
          const data = d.data();
          // Manter o mais recente por ferramenta
          if (!mapa[data.tipoFerramenta] || (data.createdAt?.seconds || 0) > (mapa[data.tipoFerramenta]?.createdAt?.seconds || 0)) {
            mapa[data.tipoFerramenta] = { docId: d.id, ...data };
          }
        });
        setLinks(mapa);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [paciente.id]);

  async function gerarLink(ferramenta) {
    setGerando(g => ({ ...g, [ferramenta.id]: true }));
    const token = gerarToken();
    const doc = {
      token,
      pacienteId: paciente.id,
      pacienteNome: paciente.nome || "",
      tipoFerramenta: ferramenta.id,
      nomeFerramenta: ferramenta.nome,
      status: "pendente",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    try {
      // Desativar link anterior se existir
      if (links[ferramenta.id]?.docId) {
        await db.collection("clinica_links_partilhados").doc(links[ferramenta.id].docId).update({ status: "substituido" });
      }
      const ref = await db.collection("clinica_links_partilhados").add(doc);
      setLinks(l => ({
        ...l,
        [ferramenta.id]: {
          docId: ref.id, token, status: "pendente",
          createdAt: { seconds: Date.now() / 1000 },
          tipoFerramenta: ferramenta.id,
        },
      }));
    } catch (e) {
      alert("Erro ao gerar link: " + e.message);
    }
    setGerando(g => ({ ...g, [ferramenta.id]: false }));
  }

  function getLinkUrl(ferramenta, token) {
    if(ferramenta.id === "rastreamento") {
      return `${BASE_URL}/rastreamento/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    }
    if(ferramenta.id === "neuro") {
      return `${BASE_URL}/rastreamento/neuro/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    }
    if(ferramenta.id === "alimentar") {
      return `${BASE_URL}/rastreamento/alimentar/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    }
    if(ferramenta.id === "sexual") {
      return `${BASE_URL}/rastreamento/sexual/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    }
    if(ferramenta.id === "dependencia") {
      return `${BASE_URL}/rastreamento/dependencia/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    }
    if(ferramenta.id === "jogos") {
      return `${BASE_URL}/rastreamento/jogos/?paciente=${encodeURIComponent(paciente.nome||"")}`;
    }
    return `${BASE_URL}/responder?token=${token}`;
  }

  function copiarLink(token, ferramenta) {
    const url = getLinkUrl(ferramenta, token);
    navigator.clipboard.writeText(url);
    setCopiado(c => ({ ...c, [token]: true }));
    setTimeout(() => setCopiado(c => ({ ...c, [token]: false })), 2000);
  }

  function enviarWhatsApp(ferramenta, token) {
    const url = getLinkUrl(ferramenta, token);
    const nome = paciente.nome?.split(" ")[0] || "paciente";
    const isRastreio = ferramenta.id==="rastreamento" || ferramenta.id==="neuro" || ferramenta.id==="alimentar" || ferramenta.id==="sexual";
    const nomeForm = isRastreio ? "Questionário Clínico" : ferramenta.nome;
    const saudacao = isRastreio ? "Olá! 😊" : `Olá, ${nome}! 😊`;
    const msg = `${saudacao}\n\nSua psicóloga Dra. Lucia Kratz preparou um formulário para você preencher:\n\n📋 *${nomeForm}*\n\nAcesse pelo link abaixo e responda com calma — suas respostas vão direto para o prontuário:\n${url}\n\nQualquer dúvida, estou por aqui!\n_Dra. Lucia Kratz · CRP 09/20590_`;
    window.open(`https://api.whatsapp.com/send?phone=55${(paciente.telefone || "").replace(/\D/g, "")}&text=${encodeURIComponent(msg)}`, "_blank");
  }

  const fmtDataHora = (seconds) => {
    if (!seconds) return "—";
    return new Date(seconds * 1000).toLocaleDateString("pt-BR");
  };

  const STATUS_CONFIG = {
    pendente:    { label: "Pendente",    cor: "#d97706", bg: "#fef3c7", icon: "clock" },
    respondido:  { label: "Respondido", cor: "#059669", bg: "#d1fae5", icon: "check-circle" },
    substituido: { label: "Substituído",cor: "#6b7280", bg: "#f3f4f6", icon: "refresh-cw" },
  };

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--purple-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="link" size={18} style={{ color: "var(--purple)" }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Links Compartilháveis</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Envie ferramentas clínicas diretamente para {paciente.nome?.split(" ")[0] || "o paciente"} responder pelo celular</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>Carregando...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FERRAMENTAS_LINK.map(ferramenta => {
            const linkAtual = links[ferramenta.id];
            const statusCfg = STATUS_CONFIG[linkAtual?.status] || null;
            const url = linkAtual ? getLinkUrl(ferramenta, linkAtual.token) : null;

            return (
              <div key={ferramenta.id} style={{ border: "1.5px solid", borderColor: linkAtual ? "var(--purple)" : "var(--gray-200)",
                borderRadius: 12, padding: "14px 16px", background: linkAtual ? "var(--purple-soft)" : "white", transition: "all .2s" }}>

                {/* Header da ferramenta */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: linkAtual ? 12 : 0 }}>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{ferramenta.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{ferramenta.nome}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{ferramenta.desc}</div>
                  </div>

                  {/* Badge status */}
                  {statusCfg && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20,
                      background: statusCfg.bg, color: statusCfg.cor, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                      <Icon name={statusCfg.icon} size={11} />
                      {statusCfg.label}
                      {linkAtual?.status === "respondido" && linkAtual?.respondidoEm &&
                        <span> em {fmtDataHora(linkAtual.respondidoEm?.seconds)}</span>
                      }
                    </div>
                  )}

                  {/* Botão gerar link */}
                  <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12, flexShrink: 0 }}
                    onClick={() => gerarLink(ferramenta)} disabled={gerando[ferramenta.id]}>
                    <Icon name="link" size={13} />
                    {gerando[ferramenta.id] ? "Gerando..." : linkAtual ? "Novo Link" : "Gerar Link"}
                  </button>
                </div>

                {/* Link gerado */}
                {linkAtual && linkAtual.status !== "substituido" && url && (
                  <div style={{ marginTop: 4 }}>
                    {/* URL */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white",
                      border: "1px solid var(--gray-200)", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
                      <Icon name="link" size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {url}
                      </span>
                    </div>

                    {/* Ações */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="btn btn-outline" style={{ padding: "7px 14px", fontSize: 12 }}
                        onClick={() => copiarLink(linkAtual.token, ferramenta)}>
                        <Icon name={copiado[linkAtual.token] ? "check" : "copy"} size={13} />
                        {copiado[linkAtual.token] ? "Copiado!" : "Copiar Link"}
                      </button>
                      <button className="btn btn-purple" style={{ padding: "7px 14px", fontSize: 12 }}
                        onClick={() => enviarWhatsApp(ferramenta, linkAtual.token)}>
                        <Icon name="message-circle" size={13} /> Enviar pelo WhatsApp
                      </button>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                        <Icon name="calendar" size={11} />
                        Gerado em {fmtDataHora(linkAtual.createdAt?.seconds)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Nota informativa */}
      <div style={{ marginTop: 16, padding: "10px 14px", background: "#eff6ff", borderRadius: 8, fontSize: 11, color: "#1e40af", lineHeight: 1.6 }}>
        💡 <strong>Como funciona:</strong> O paciente recebe o link, acessa a ferramenta no celular, preenche e envia. As respostas entram automaticamente no prontuário e o status muda para <strong>Respondido</strong>.
        O link expira após ser respondido ou quando um novo link é gerado para a mesma ferramenta.
      </div>
    </div>
  );
}

