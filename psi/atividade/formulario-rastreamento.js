// ═══════════════════════════════════════════════════════════════
//  FORMULÁRIOS PÚBLICOS DE RASTREAMENTO (DSM-5 / CID-11)
//
//  Motor genérico que serve qualquer instrumento de rastreamento no
//  formato "vários critérios, cada um com opções A/B/C de texto
//  completo, respondido pelo próprio paciente OU por um familiar".
//  Cada instrumento entra como um objeto de configuração em
//  CONFIGS_RASTREAMENTO — pra portar um novo instrumento do modelo,
//  só é preciso acrescentar os dados aqui, sem tocar no motor.
//
//  Mesmas regras dos outros formulários públicos: sem login, grava
//  através do `db` da página (que passa pela Cloud Function
//  salvarAtividadePublica) e usa o TextAreaVoz já existente pro
//  campo de observações.
// ═══════════════════════════════════════════════════════════════

// ── Instrumento: Rastreamento de Dependência de Jogos e Apostas ──
// 9 critérios DSM-5 / CID-11 (Gaming/Gambling Disorder).
const BLOCOS_RASTREAMENTO_JOGOS = [
  {
    titulo: "Módulo A · Preocupação Excessiva e Abstinência",
    sub: "Avalie o quanto os jogos ou apostas ocupam a mente da pessoa e o que acontece quando ela não pode jogar.",
    perguntas: [
      { id: "p1", num: "1", texto: "A pessoa passa grande parte do tempo pensando em jogos anteriores, planejando a próxima sessão ou fantasiando sobre jogar — a ponto de o jogo se tornar a atividade dominante na vida diária?", opcoes: [
        { letra: "A", texto: "Não pensa em jogos fora dos momentos em que decide jogar esporadicamente." },
        { letra: "B", texto: "Lembra de partidas recentes com entusiasmo, mas sem que isso ocupe a mente de forma obsessiva." },
        { letra: "C", texto: "Preocupação mental constante e intrusiva com jogos o dia todo, mesmo quando deveria estar focada em trabalho, estudos ou conversas." },
      ] },
      { id: "p2", num: "2", texto: "Quando o acesso aos jogos é cortado, limitado ou impedido, a pessoa manifesta sintomas como irritabilidade intensa, ansiedade, tédio profundo, tristeza ou agitação?", opcoes: [
        { letra: "A", texto: "Fica offline tranquilamente sem qualquer alteração de humor ou incômodo." },
        { letra: "B", texto: "Sente um leve tédio passageiro, mas distrai-se facilmente com outras coisas." },
        { letra: "C", texto: "Apresenta alterações severas de humor, irritabilidade desproporcional, ataques de raiva, ansiedade aguda ou desespero quando é forçada a parar de jogar." },
      ] },
    ],
  },
  {
    titulo: "Módulo B · Tolerância e Perda de Controle",
    sub: "Avalie se há necessidade crescente de jogar mais e se tentativas de parar falharam.",
    perguntas: [
      { id: "p3", num: "3", texto: "Há necessidade evidente de gastar quantidades crescentes de tempo jogando, de investir mais dinheiro em apostas, ou de buscar jogos cada vez mais intensos para alcançar a mesma excitação ou satisfação?", opcoes: [
        { letra: "A", texto: "O tempo dedicado aos jogos permanece estável e moderado ao longo do tempo." },
        { letra: "B", texto: "Joga um pouco mais em períodos de férias ou fins de semana, sem padrão progressivo." },
        { letra: "C", texto: "Tolerância nítida: o tempo ou dinheiro investido aumentam progressivamente porque o nível anterior já não gera a mesma excitação." },
      ] },
      { id: "p4", num: "4", texto: "A pessoa já tentou várias vezes reduzir o tempo de jogo ou parar completamente, mas falhou sistematicamente, voltando ao hábito logo em seguida?", opcoes: [
        { letra: "A", texto: "Nunca tentou parar porque joga apenas quando quer e controla perfeitamente o limite." },
        { letra: "B", texto: "Já pensou em jogar menos e conseguiu reduzir quando quis." },
        { letra: "C", texto: "Tentativas frustradas e repetidas de controlar o vício; faz promessas de parar que são quebradas em pouco tempo." },
      ] },
      { id: "p5", num: "5", texto: "Houve abandono marcante de outros hobbies, interesses de lazer, esportes ou atividades sociais que antes eram prazerosas, restringindo-se quase exclusivamente ao universo dos jogos?", opcoes: [
        { letra: "A", texto: "Mantém uma vida equilibrada com diversos hobbies, esportes e saídas sociais." },
        { letra: "B", texto: "Reduziu um pouco os passeios em semanas de provas ou picos de trabalho, sem prejuízo real." },
        { letra: "C", texto: "Abandono quase absoluto de qualquer outra fonte de lazer; o tempo livre é 100% dedicado aos jogos." },
      ] },
    ],
  },
  {
    titulo: "Módulo C · Consequências Psicossociais e Financeiras",
    sub: "Avalie o impacto do hábito na vida real — mentiras, fugas emocionais e prejuízos acumulados.",
    perguntas: [
      { id: "p6", num: "6", texto: "O hábito de jogar continua de forma irredutível mesmo com plena consciência de que está gerando problemas graves (queda no rendimento, dívidas impagáveis por apostas, rupturas em relacionamentos)?", opcoes: [
        { letra: "A", texto: "O jogo nunca causou nenhum tipo de prejuízo ou conflito na vida." },
        { letra: "B", texto: "Recebeu avisos leves de familiares sobre o tempo de tela, ajustando o comportamento rapidamente." },
        { letra: "C", texto: "Continuidade obstinada do jogo mesmo após demissões, reprovações, colapsos financeiros severos ou ameaças reais de término de relacionamento." },
      ] },
      { id: "p7", num: "7", texto: "A pessoa mente, esconde ou omite de familiares, cônjuge ou terapeuta a real quantidade de horas gastas jogando ou o volume de dinheiro perdido com apostas?", opcoes: [
        { letra: "A", texto: "Joga de forma transparente e aberta, sem precisar esconder nada de ninguém." },
        { letra: "B", texto: "Prefere não dar detalhes de partidas para não parecer bobagem, mas sem mentir sobre a vida." },
        { letra: "C", texto: "Mentiras frequentes e elaboradas para encobrir o tempo gasto ou os prejuízos financeiros gerados por apostas." },
      ] },
      { id: "p8", num: "8", texto: "Os jogos são utilizados de maneira recorrente como mecanismo principal de fuga ou alívio diante de sentimentos negativos (ansiedade, culpa, depressão, solidão, estresse ou frustrações)?", opcoes: [
        { letra: "A", texto: "Joga puramente por diversão ou entretenimento pontual, sem relação com o humor." },
        { letra: "B", texto: "Usa os jogos para relaxar após um dia cansativo, mantendo o controle emocional." },
        { letra: "C", texto: "Dependência emocional do jogo: é a única ferramenta que encontra para desligar a mente de problemas, tristezas ou angústias profundas." },
      ] },
    ],
  },
  {
    titulo: "Módulo D · Prejuízo Funcional Global + Observações",
    sub: "Avalie o impacto estrutural na vida e registre qualquer observação adicional.",
    perguntas: [
      { id: "p9", num: "9", texto: "O comportamento de jogo causou prejuízo acentuado ou perda real de oportunidades significativas de trabalho, carreira acadêmica, relacionamentos afetivos importantes ou amizades de longa data?", opcoes: [
        { letra: "A", texto: "Vida funcional preservada, sem impactos negativos nas esferas vitais." },
        { letra: "B", texto: "Pequenos atritos pontuais por falta de atenção momentânea, resolvidos com facilidade." },
        { letra: "C", texto: "Prejuízos graves e estruturais consolidados (perda de emprego, abandono escolar, divórcio ou isolamento social severo)." },
      ] },
    ],
    obs: true,
  },
];

// ── Instrumento: Rastreamento de Dependência Química e Substâncias ──
// 11 critérios DSM-5 (Transtorno por Uso de Substâncias).
const BLOCOS_RASTREAMENTO_DEPENDENCIA = [
  {
    titulo: "Módulo A · Controle Prejudicado (Parte 1)",
    sub: "Avalie o padrão de consumo da substância — quantidade, tempo e tentativas de parar.",
    perguntas: [
      { id: "p1", num: "1", texto: "A substância é consumida em maiores quantidades ou por um período muito maior do que o inicialmente planejado?", opcoes: [
        { letra: "A", texto: "Nunca consome além do planejado." },
        { letra: "B", texto: "Ocasionalmente estende o consumo em festas ou comemorações, sem perda de controle habitual." },
        { letra: "C", texto: "Frequentemente perde o controle da quantidade ou do tempo, consumindo muito mais do que pretendia." },
      ] },
      { id: "p2", num: "2", texto: "Há um desejo persistente de cortar ou controlar o uso da substância, acompanhado de tentativas infrutíferas de reduzir ou cessar o consumo?", opcoes: [
        { letra: "A", texto: "Não sente necessidade de controlar nem tenta parar, pois o uso é ocasional e controlado." },
        { letra: "B", texto: "Já pensou em diminuir por vaidade ou saúde, conseguindo fazê-lo quando quis." },
        { letra: "C", texto: "Desejo constante de parar, mas todas as tentativas de redução ou abstinência sozinho(a) falham." },
      ] },
      { id: "p3", num: "3", texto: "É gasto muito tempo em atividades necessárias para obter a substância, usá-la ou se recuperar de seus efeitos (ressacas prolongadas, busca constante)?", opcoes: [
        { letra: "A", texto: "O uso não interfere no tempo livre ou nas atividades cotidianas." },
        { letra: "B", texto: "Ocorre gasto de tempo pontual em finais de semana ou eventos específicos." },
        { letra: "C", texto: "Grande parte do dia ou da rotina é ocupada pela obtenção, consumo ou recuperação dos efeitos da substância." },
      ] },
    ],
  },
  {
    titulo: "Módulo A · Controle Prejudicado (Parte 2) + Módulo B · Prejuízo Social",
    sub: "Fissura (craving) e os impactos do uso nas obrigações e nos relacionamentos.",
    perguntas: [
      { id: "p4", num: "4", texto: "Há presença de fissura — desejo imperioso ou ânsia intensa (craving) de usar a substância, muitas vezes desencadeado por estímulos ambientais ou locais associados ao uso?", opcoes: [
        { letra: "A", texto: "Não experimenta desejo incontrolável ou fissura." },
        { letra: "B", texto: "Lembra da substância com saudosismo ocasional, mas sem urgência física." },
        { letra: "C", texto: "Fissura intensa e recorrente, gerando urgência física e mental incontrolável pelo uso." },
      ] },
      { id: "p5", num: "5", texto: "O uso recorrente da substância resulta em falha no cumprimento de obrigações importantes no trabalho, na escola ou em casa (faltas frequentes, queda de rendimento, negligência familiar)?", opcoes: [
        { letra: "A", texto: "Cumpre todas as obrigações profissionais e familiares normalmente." },
        { letra: "B", texto: "Houve quedas leves de rendimento em fases de estresse isoladas." },
        { letra: "C", texto: "Prejuízo crônico e recorrente nas obrigações de trabalho, estudos ou cuidados com a casa e família devido ao uso." },
      ] },
      { id: "p6", num: "6", texto: "O consumo continua apesar de problemas sociais ou interpessoais causados ou exacerbados pelos efeitos da substância (brigas conjugais, discussões familiares, afastamento de amigos)?", opcoes: [
        { letra: "A", texto: "O uso não gera conflitos interpessoais." },
        { letra: "B", texto: "Houve alertas leves de familiares, mas que foram contornados rapidamente." },
        { letra: "C", texto: "Conflitos graves, repetitivos e rupturas de relacionamentos importantes causados diretamente pelo comportamento sob o efeito ou pela busca da substância." },
      ] },
    ],
  },
  {
    titulo: "Módulo B · Prejuízo Social (cont.) + Módulo C · Uso de Risco",
    sub: "Abandono de atividades importantes e exposição a situações de risco físico.",
    perguntas: [
      { id: "p7", num: "7", texto: "Importantes atividades sociais, profissionais ou de lazer são abandonadas ou reduzidas por causa do uso da substância?", opcoes: [
        { letra: "A", texto: "Mantém todos os hobbies, lazeres e compromissos sociais de sempre." },
        { letra: "B", texto: "Reduziu levemente a frequência a alguns eventos por cansaço." },
        { letra: "C", texto: "Abandonou completamente esportes, hobbies, lazeres e convívios sociais que antes eram prazerosos para priorizar o uso." },
      ] },
      { id: "p8", num: "8", texto: "Há uso recorrente da substância em situações em que isso representa perigo físico (como dirigir veículos, operar máquinas perigosas ou transitar em locais de alto risco sob efeito)?", opcoes: [
        { letra: "A", texto: "Nunca se coloca em risco físico por causa da substância." },
        { letra: "B", texto: "Ocorreu de forma isolada no passado, sem incidentes maiores." },
        { letra: "C", texto: "Padrão recorrente e perigoso de dirigir alcoolizado(a)/drogado(a) ou se expor a riscos extremos sob efeito." },
      ] },
      { id: "p9", num: "9", texto: "O uso da substância é mantido apesar do conhecimento de ter um problema físico ou psicológico persistente ou recorrente que provavelmente foi causado ou exacerbado pela substância (ex: gastrite grave, crises de pânico, hipertensão, danos hepáticos)?", opcoes: [
        { letra: "A", texto: "Sem problemas de saúde relacionados ao uso." },
        { letra: "B", texto: "Alertas médicos genéricos recebidos, mas sem diagnóstico fechado." },
        { letra: "C", texto: "Continuação irredutível do consumo mesmo após diagnósticos médicos graves ou piora óbvia da saúde física e mental decorrentes da substância." },
      ] },
    ],
  },
  {
    titulo: "Módulo D · Critérios Farmacológicos",
    sub: "Tolerância e síndrome de abstinência — sinais de dependência física estabelecida.",
    perguntas: [
      { id: "p10", num: "10", texto: "Há necessidade de quantidades crescentes da substância para alcançar a intoxicação ou o efeito desejado, ou efeito substancialmente menor com o uso contínuo da mesma quantidade?", opcoes: [
        { letra: "A", texto: "A reação à substância permanece estável ao longo do tempo." },
        { letra: "B", texto: "Percebeu que tolera um pouco mais do que no início, sem grandes mudanças." },
        { letra: "C", texto: "Tolerância acentuada: precisa de doses progressivamente muito maiores para sentir o mesmo efeito anterior." },
      ] },
      { id: "p11", num: "11", texto: "Há presença de síndrome de abstinência característica ao parar o uso (sintomas físicos e psicológicos desconfortáveis), ou o uso da substância para aliviar ou evitar os sintomas de abstinência?", opcoes: [
        { letra: "A", texto: "Nunca apresentou sintomas físicos ou psicológicos desagradáveis ao ficar sem a substância." },
        { letra: "B", texto: "Apresenta apenas leves incômodos ou ressaca comum." },
        { letra: "C", texto: "Síndrome de abstinência evidente (tremores, sudorese, insônia severa, ansiedade extrema, náuseas) ou uso contínuo justamente para evitar passar mal." },
      ] },
    ],
    obs: true,
  },
];

// Ao adicionar um novo instrumento, é só acrescentar uma entrada aqui
// — o motor abaixo (`FormularioRastreamento`) e o roteador em app.js
// já funcionam pra qualquer instrumento cadastrado neste objeto.
const CONFIGS_RASTREAMENTO = {
  jogos: {
    titulo: "Rastreamento de Dependência de Jogos e Apostas",
    tempoEstimado: "5 a 10 minutos",
    blocos: BLOCOS_RASTREAMENTO_JOGOS,
  },
  dependencia: {
    titulo: "Rastreamento de Dependência Química e Substâncias",
    tempoEstimado: "8 a 12 minutos",
    blocos: BLOCOS_RASTREAMENTO_DEPENDENCIA,
  },
};

function FormularioRastreamento({ link }) {
  const config = CONFIGS_RASTREAMENTO[link.tipo];
  const [tela, setTela] = useState("boasvindas"); // boasvindas | formulario | sucesso
  const [tipoRespondente, setTipoRespondente] = useState("");
  const [nomeRespondente, setNomeRespondente] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [blocoIdx, setBlocoIdx] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [obsFinais, setObsFinais] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!config) {
    return (
      <div className="cartao" style={{ textAlign: "center", padding: "30px 20px" }}>
        <Icone nome="alert-triangle" tamanho={32} />
        <p className="texto-vazio-p" style={{ marginTop: 12 }}>Este questionário não está mais disponível.</p>
      </div>
    );
  }

  function iniciar() {
    if (!tipoRespondente) { setErro("Selecione quem está respondendo."); return; }
    if (tipoRespondente === "familiar") {
      if (!nomeRespondente.trim()) { setErro("Informe o seu nome."); return; }
      if (!parentesco) { setErro("Selecione sua relação com o paciente."); return; }
    }
    setErro("");
    setBlocoIdx(0);
    setTela("formulario");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function avancar() {
    const bloco = config.blocos[blocoIdx];
    const faltando = bloco.perguntas.find((p) => !respostas[p.id]);
    if (faltando) { setErro("Selecione uma opção para o critério " + faltando.num + " antes de continuar."); return; }
    setErro("");
    if (blocoIdx < config.blocos.length - 1) {
      setBlocoIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      enviar();
    }
  }

  function voltar() {
    if (blocoIdx > 0) { setBlocoIdx((i) => i - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }

  async function enviar() {
    setEnviando(true);
    setErro("");
    try {
      await db.collection("clinica_rastreamento_" + link.tipo).add({
        tipoRespondente,
        nomeRespondente: tipoRespondente === "paciente" ? (link.pacienteNome || "Próprio paciente") : nomeRespondente,
        parentesco: tipoRespondente === "paciente" ? "paciente" : parentesco,
        ...respostas,
        obsFinais,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setTela("sucesso");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErro("Erro ao enviar: " + e.message);
    } finally {
      setEnviando(false);
    }
  }

  // ── Tela de boas-vindas ──
  if (tela === "boasvindas") {
    return (
      <div className="cartao">
        <div style={{ background: "#F5F3FF", borderRadius: 14, padding: 20, marginBottom: 20, fontSize: 13.5, color: "#4B5563", lineHeight: 1.7 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#3D006A", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <Icone nome="clipboard-list" tamanho={18} /> Antes de começar, leia com atenção
          </div>
          <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
            <li>Este questionário leva entre <strong>{config.tempoEstimado}</strong> para ser respondido.</li>
            <li>Não há respostas certas ou erradas — responda com <strong>honestidade e calma</strong>.</li>
            <li>Se for familiar, responda sobre o <strong>comportamento da pessoa avaliada</strong>, não sobre você.</li>
            <li>Você pode usar o microfone para <strong>falar em vez de digitar</strong> nos campos de texto.</li>
            <li>Suas respostas são <strong>confidenciais</strong> e usadas apenas para fins clínicos.</li>
          </ul>
        </div>

        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#3D006A", marginBottom: 10 }}>Quem está respondendo?</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { id: "paciente", icone: "user", titulo: "O próprio paciente", desc: "Você é a pessoa que está sendo avaliada" },
            { id: "familiar", icone: "users", titulo: "Familiar / pessoa próxima", desc: "Você conhece bem a pessoa avaliada" },
          ].map((o) => (
            <div
              key={o.id}
              onClick={() => setTipoRespondente(o.id)}
              style={{
                border: tipoRespondente === o.id ? "2px solid var(--cor-marca)" : "2px solid #EDE9FE",
                background: tipoRespondente === o.id ? "#F5F0FF" : "white",
                borderRadius: 14, padding: "18px 14px", textAlign: "center", cursor: "pointer",
              }}
            >
              <Icone nome={o.icone} tamanho={28} />
              <div style={{ fontSize: 14, fontWeight: 700, color: "#3D006A", marginTop: 8 }}>{o.titulo}</div>
              <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 4, lineHeight: 1.4 }}>{o.desc}</div>
            </div>
          ))}
        </div>

        {tipoRespondente === "familiar" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 5 }}>Seu nome completo</label>
              <input value={nomeRespondente} onChange={(e) => setNomeRespondente(e.target.value)} placeholder="Seu nome" style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 5 }}>Sua relação com o paciente</label>
              <select value={parentesco} onChange={(e) => setParentesco(e.target.value)} style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, background: "white" }}>
                <option value="">Selecione o grau de parentesco</option>
                {["Mãe", "Pai", "Cônjuge / Companheiro(a)", "Irmão / Irmã", "Filho(a)", "Avô / Avó", "Tio(a)", "Amigo(a) próximo(a)", "Outro familiar"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        )}

        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 12, padding: "13px 16px", fontSize: 12.5, color: "#7F1D1D", lineHeight: 1.6, marginBottom: 18, display: "flex", gap: 10 }}>
          <Icone nome="shield-alert" tamanho={16} />
          <span>Este é um instrumento clínico sensível. As informações prestadas são sigilosas e serão analisadas exclusivamente pela sua psicóloga. Responda com total honestidade — isso é fundamental para um cuidado adequado.</span>
        </div>

        {erro && <p className="erro-p" style={{ marginBottom: 12 }}>{erro}</p>}

        <button className="botao-primario-p" style={{ width: "100%", justifyContent: "center" }} onClick={iniciar}>
          Começar Questionário <Icone nome="arrow-right" tamanho={15} />
        </button>
      </div>
    );
  }

  // ── Tela de sucesso ──
  if (tela === "sucesso") {
    return (
      <div className="cartao" style={{ textAlign: "center", padding: "36px 22px" }}>
        <Icone nome="check-circle-2" tamanho={48} />
        <div style={{ fontSize: 20, fontWeight: 700, color: "#3D006A", margin: "14px 0 10px" }}>Respostas enviadas!</div>
        <p className="texto-vazio-p" style={{ lineHeight: 1.7 }}>
          Obrigado por responder com cuidado e honestidade.<br />
          Suas respostas foram registradas com segurança e serão analisadas pela sua psicóloga.
        </p>
      </div>
    );
  }

  // ── Formulário (wizard por blocos) ──
  const bloco = config.blocos[blocoIdx];
  const total = config.blocos.length;
  const progresso = Math.round(((blocoIdx + 1) / total) * 100);

  return (
    <div className="cartao">
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginBottom: 5 }}>
          <span>Etapa {blocoIdx + 1} de {total}</span>
          <span>{progresso}%</span>
        </div>
        <div style={{ height: 6, background: "#EDE9FE", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ width: progresso + "%", height: "100%", background: "var(--cor-marca)", borderRadius: 20, transition: "width .4s ease" }} />
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: "#3D006A", marginBottom: 3 }}>{bloco.titulo}</div>
      <p style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 18, lineHeight: 1.5, background: "#F9FAFB", borderLeft: "3px solid var(--cor-marca)", padding: "8px 12px", borderRadius: "0 8px 8px 0" }}>{bloco.sub}</p>

      {bloco.perguntas.map((p) => (
        <div key={p.id} style={{ background: "#F9FAFB", border: "1px solid #EDE9FE", borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--cor-marca)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
            Critério {p.num} de {config.blocos.reduce((n, b) => n + b.perguntas.length, 0)}
          </div>
          <div style={{ fontSize: 14, color: "#1F2937", lineHeight: 1.6, marginBottom: 14, fontWeight: 500 }}>{p.texto}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {p.opcoes.map((o) => {
              const sel = respostas[p.id] === o.letra;
              return (
                <div
                  key={o.letra}
                  onClick={() => setRespostas((r) => ({ ...r, [p.id]: o.letra }))}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    border: sel ? "1.5px solid var(--cor-marca)" : "1.5px solid #E5E7EB",
                    background: sel ? "#F5F0FF" : "white",
                    borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontSize: 13.5, color: "#374151", lineHeight: 1.5,
                  }}
                >
                  <div style={{
                    width: 22, height: 22, minWidth: 22, borderRadius: "50%", marginTop: 1,
                    border: sel ? "2px solid var(--cor-marca)" : "2px solid #D1D5DB",
                    background: sel ? "var(--cor-marca)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                    color: sel ? "white" : "#9CA3AF",
                  }}>
                    {o.letra}
                  </div>
                  <div>{o.texto}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {bloco.obs && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 5 }}>
            Observações adicionais <span style={{ fontWeight: 400, textTransform: "none" }}>(opcional)</span>
          </label>
          <TextAreaVoz value={obsFinais} onChange={(e) => setObsFinais(e.target.value)} placeholder="Fale ou escreva qualquer observação importante..." rows={4} />
          <p style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 12, padding: "13px 16px", fontSize: 12.5, color: "#92400E", lineHeight: 1.6, marginTop: 12 }}>
            Suas respostas são confidenciais e serão analisadas exclusivamente pela sua psicóloga para fins clínicos.
          </p>
        </div>
      )}

      {erro && <p className="erro-p" style={{ marginBottom: 12 }}>{erro}</p>}

      <div style={{ display: "flex", gap: 10 }}>
        {blocoIdx > 0 && (
          <button className="botao-secundario-p" style={{ flex: 1, justifyContent: "center" }} onClick={voltar}>
            <Icone nome="arrow-left" tamanho={15} /> Voltar
          </button>
        )}
        <button className="botao-primario-p" style={{ flex: 2, justifyContent: "center" }} disabled={enviando} onClick={avancar}>
          {enviando ? "Enviando..." : blocoIdx === total - 1 ? "Confirmar e Enviar" : "Próximo"} <Icone nome={blocoIdx === total - 1 ? "check" : "arrow-right"} tamanho={15} />
        </button>
      </div>
    </div>
  );
}
