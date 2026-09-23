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

// ── Instrumento: Rastreamento Bipolar / Borderline ──
// 20 perguntas no total (p1-p15 são os 15 critérios DSM-5 originais,
// usados no cálculo dos escores; p16-p20 são perguntas mais novas de
// "Cognição e Humor Misto" que o modelo já coleta mas ainda não entra
// na fórmula de pontuação — mantido assim de propósito, é assim que
// está no modelo de referência).
const BLOCOS_RASTREAMENTO_BIPOLAR = [
  {
    titulo: "Bloco 1 · Energia e Aceleração",
    sub: "Observe se já houve períodos em que a pessoa parecia muito diferente do normal — com muita energia, aceleração ou grandiosidade.",
    perguntas: [
      { id: "p1", num: "1", texto: "Em algum período da vida ou de forma recorrente, você notou fases em que a pessoa avaliada passou a apresentar uma energia muito acima do normal, ficando extremamente acelerado(a), com disposição fora do comum, a ponto de parecer incansável?", opcoes: [
        { letra: "A", texto: "Não, nunca notei nada parecido com isso." },
        { letra: "B", texto: "Sim, por alguns dias parecia com a 'bateria 24h', mas depois voltava ao normal." },
        { letra: "C", texto: "Sim, por uma semana ou mais — ritmo frenético de atividade, agitação intensa e pouca necessidade de descanso." },
        { letra: "D", texto: "Sim, a ponto de perder o controle, agir de forma impulsiva perigosa ou precisar de atendimento médico." },
      ] },
      { id: "p2", num: "2", texto: "Como costumava ser o padrão de sono e a fala da pessoa durante esses momentos de maior agitação?", opcoes: [
        { letra: "A", texto: "Dormia e falava normalmente, no ritmo de sempre." },
        { letra: "B", texto: "Dizia precisar dormir bem menos (2 a 4h) e acordava descansado(a); a fala era bem rápida e atropelada." },
        { letra: "C", texto: "Passava noites inteiras acordado(a) organizando coisas ou trabalhando sem cansaço, falando excessivamente e mudando de assunto o tempo todo." },
      ] },
      { id: "p3", num: "3", texto: "Houve momentos em que a pessoa avaliada demonstrava autoconfiança exagerada, achando que podia realizar coisas grandiosas ou assumindo riscos que não costumava assumir (como gastos financeiros excessivos ou projetos mirabolantes)?", opcoes: [
        { letra: "A", texto: "Não, manteve o comportamento prudente de sempre." },
        { letra: "B", texto: "Sim, mostrava-se muito otimista com ideias fora do comum ou projetos de grande porte." },
        { letra: "C", texto: "Sim, tomou decisões impulsivas e arriscadas que trouxeram prejuízos ou grande preocupação para a família." },
      ] },
    ],
  },
  {
    titulo: "Bloco 2 · Tristeza e Depressão",
    sub: "Agora pense no lado oposto — períodos de baixa energia, tristeza profunda ou desânimo persistente.",
    perguntas: [
      { id: "p4", num: "4", texto: "Por outro lado, você observou fases em que a pessoa apresentou uma tristeza profunda, desânimo persistente ou perda total do interesse por coisas que antes davam prazer?", opcoes: [
        { letra: "A", texto: "Não, o humor manteve-se estável ou dentro das variações comuns." },
        { letra: "B", texto: "Sim, apresentou períodos de apatia e desinteresse, mas conseguia levar a rotina adiante." },
        { letra: "C", texto: "Sim, períodos prolongados de tristeza profunda, choro frequente, isolamento social e incapacidade de sentir prazer." },
      ] },
      { id: "p5", num: "5", texto: "Nesses períodos de desânimo ou baixa energia, como ficavam a disposição física, o sono, o apetite e o ânimo para as tarefas básicas?", opcoes: [
        { letra: "A", texto: "Mantinha as atividades e os cuidados pessoais normalmente." },
        { letra: "B", texto: "Apresentava cansaço constante, alterações moderadas no sono/apetite e lentidão para realizar tarefas." },
        { letra: "C", texto: "Ficava praticamente sem energia para sair da cama, descuidando da higiene e da alimentação, com mudanças drásticas no sono." },
      ] },
      { id: "p6", num: "6", texto: "Durante essas fases de baixa energia ou tristeza, a pessoa avaliada chegou a verbalizar sentimentos de desesperança, culpa excessiva ou vontade de sumir / desistir de viver?", opcoes: [
        { letra: "A", texto: "Nunca verbalizou nada disso." },
        { letra: "B", texto: "Reclamava que a vida estava difícil, mas sem citar morte ou ideação suicida." },
        { letra: "C", texto: "Falava abertamente sobre querer sumir, que a vida não tinha sentido ou mencionou pensamentos de morte." },
      ] },
    ],
  },
  {
    titulo: "Bloco 3 · Relacionamentos e Identidade",
    sub: "Como a pessoa se relaciona com os outros e como lida com a ideia de abandono ou rejeição.",
    perguntas: [
      { id: "p7", num: "7", texto: "Como a pessoa avaliada costuma reagir quando percebe — ou imagina — que vai ser rejeitado(a), ignorado(a) ou deixado(a) sozinho(a) por alguém importante?", opcoes: [
        { letra: "A", texto: "Reage de forma equilibrada, compreendendo que as pessoas têm seus compromissos." },
        { letra: "B", texto: "Fica chateado(a) ou carente, mas consegue lidar após conversar ou se acalmar." },
        { letra: "C", texto: "Tem reações extremas e desesperadas — liga repetidamente, faz ameaças, chora compulsivamente ou implora para a pessoa não ir embora." },
      ] },
      { id: "p8", num: "8", texto: "Você percebe que as relações afetivas ou de amizade dessa pessoa costumam ser intensas mas muito instáveis ao longo do tempo?", opcoes: [
        { letra: "A", texto: "Não, as relações são estáveis e duradouras." },
        { letra: "B", texto: "Há alguns desentendimentos normais de relacionamento, sem rupturas drásticas." },
        { letra: "C", texto: "É muito comum passar rapidamente de 'amar alguém excessivamente' para 'odiar essa mesma pessoa' por motivos pequenos." },
      ] },
      { id: "p9", num: "9", texto: "Como é a percepção que a pessoa tem de si mesmo(a)? Parece haver uma instabilidade marcante sobre quem ela é, seus objetivos ou sua identidade?", opcoes: [
        { letra: "A", texto: "Tem uma noção clara e estável de quem é, de seus valores e objetivos." },
        { letra: "B", texto: "Às vezes se sente confusa(o) sobre o futuro ou escolhas, o que é comum." },
        { letra: "C", texto: "Muda drasticamente de opinião sobre si mesma(o), planos, crenças ou aparência de tempos em tempos, parecendo não saber quem realmente é." },
      ] },
    ],
  },
  {
    titulo: "Bloco 4 · Impulsos, Humor e Emoções",
    sub: "Como a pessoa controla seus impulsos, lida com a raiva e experimenta o mundo emocional no dia a dia.",
    perguntas: [
      { id: "p10", num: "10", texto: "A pessoa costuma apresentar comportamentos impulsivos no dia a dia (como gastos descontrolados, direção perigosa, excessos na comida ou uso desregrado de substâncias)?", opcoes: [
        { letra: "A", texto: "Não, costuma ser uma pessoa prudente e controla bem seus impulsos." },
        { letra: "B", texto: "Ocorre ocasionalmente de forma leve." },
        { letra: "C", texto: "Tem episódios frequentes de impulsividade descontrolada em várias áreas, sem pensar nas consequências." },
      ] },
      { id: "p11", num: "11", texto: "Houve episódios de automutilação física (como cortes ou queimaduras superficiais) ou ameaças e tentativas de autoextermínio?", opcoes: [
        { letra: "A", texto: "Nunca apresentou nenhum comportamento desse tipo." },
        { letra: "B", texto: "Já mencionou verbalmente querer sumir sob estresse, mas sem atos práticos." },
        { letra: "C", texto: "Apresenta ou já apresentou histórico de cortes, automutilação para aliviar sofrimento emocional ou tentativas reais de suicídio." },
      ] },
      { id: "p12", num: "12", texto: "Como o humor dessa pessoa costuma oscilar no dia a dia ou de uma semana para outra?", opcoes: [
        { letra: "A", texto: "O humor é relativamente estável, variando de acordo com os fatos reais." },
        { letra: "B", texto: "Apresenta oscilações normais do estresse cotidiano." },
        { letra: "C", texto: "Tem mudanças de humor muito rápidas e intensas — passa de calma para irritação profunda ou desespero em poucas horas." },
      ] },
      { id: "p13", num: "13", texto: "A pessoa avaliada costuma relatar uma sensação persistente de vazio interior ou tédio crônico?", opcoes: [
        { letra: "A", texto: "Não relata esse tipo de sentimento." },
        { letra: "B", texto: "Sente-se vazia(o) ou entediada(o) esporadicamente, em fases de solidão." },
        { letra: "C", texto: "Queixa-se com frequência de um vazio interno profundo ou um 'buraco no peito' que nada parece preencher." },
      ] },
      { id: "p14", num: "14", texto: "Como a pessoa lida com a raiva e a frustração nas situações cotidianas?", opcoes: [
        { letra: "A", texto: "Consegue expressar o que sente de forma adequada e negociar quando algo a incomoda." },
        { letra: "B", texto: "Fica irritada(o), mas consegue se conter e evitar discussões maiores." },
        { letra: "C", texto: "Tem explosões de raiva intensas, desproporcionais ao motivo, com forte dificuldade de controlar a agressividade verbal ou física." },
      ] },
      { id: "p15", num: "15", texto: "Em momentos de forte pressão ou estresse, você já notou se a pessoa parece 'se desligar' da realidade, apresentar desconfianças exageradas das intenções dos outros ou um estranhamento intenso de si mesma?", opcoes: [
        { letra: "A", texto: "Não, mantém o contato firme com a realidade mesmo sob pressão." },
        { letra: "B", texto: "Fica apenas muito estressada(o) temporariamente." },
        { letra: "C", texto: "Sob estresse extremo, já apresentou episódios em que parecia 'fora de si', muito desconfiada(o) (quase persecutória) ou relatando sensação de irrealidade." },
      ] },
    ],
  },
  {
    titulo: "Bloco 5 · Cognição e Humor Misto",
    sub: "Estas perguntas ajudam a entender como o raciocínio, a concentração e eventuais sobreposições de humor se manifestam.",
    perguntas: [
      { id: "p16", num: "16", texto: "Durante os períodos de agitação ou aceleração, você notou que a pessoa avaliada parecia ter os pensamentos acelerados demais — como se as ideias se atropelassem, saltando de um assunto para outro sem conseguir parar?", opcoes: [
        { letra: "A", texto: "Não, o raciocínio sempre pareceu organizado e no ritmo normal." },
        { letra: "B", texto: "Sim, ficava muito dispersa(o) nas conversas, mudava de assunto com frequência mas sem parecer fora de controle." },
        { letra: "C", texto: "Sim, os pensamentos pareciam tão acelerados que era difícil acompanhar — falava muito rápido e saltava de ideia em ideia sem concluir nenhuma." },
      ] },
      { id: "p17", num: "17", texto: "Nesses momentos de agitação, a pessoa demonstrava grande dificuldade de manter a atenção — qualquer barulho, movimento ou estímulo externo parecia distraí-la facilmente, mesmo quando estava tentando fazer algo importante?", opcoes: [
        { letra: "A", texto: "Não, conseguia se concentrar normalmente mesmo em períodos de agitação." },
        { letra: "B", texto: "Ficava um pouco mais dispersa(o) que o habitual, mas conseguia retomar o foco." },
        { letra: "C", texto: "Sim, era impossível mantê-la focada — qualquer coisa tirava a atenção e ela não conseguia terminar nada." },
      ] },
      { id: "p18", num: "18", texto: "Nos períodos de tristeza ou baixa energia, você observou uma inquietação física visível — a pessoa não conseguia ficar parada, andava de um lado para outro, remexia as mãos ou os pés sem parar — ou o contrário: um estado de lentidão marcante, como se cada movimento custasse um esforço enorme?", opcoes: [
        { letra: "A", texto: "Não, o comportamento motor estava dentro do normal." },
        { letra: "B", texto: "Sim, ficava levemente inquieta(o) ou um pouco mais lenta(o) que o habitual." },
        { letra: "C", texto: "Sim, de forma marcante e visível para qualquer pessoa ao redor — agitação intensa ou lentidão extrema nos movimentos e na fala." },
      ] },
      { id: "p19", num: "19", texto: "Durante as fases de tristeza ou baixa energia, a pessoa demonstrava dificuldade acentuada para se concentrar, tomar decisões simples do cotidiano ou lembrar de coisas que normalmente lembraria sem esforço?", opcoes: [
        { letra: "A", texto: "Não, a memória e o raciocínio permaneciam normais." },
        { letra: "B", texto: "Sim, reclamava de 'cabeça pesada' ou dificuldade leve para se concentrar." },
        { letra: "C", texto: "Sim, de forma significativa — tinha dificuldade até para decisões simples e esquecia coisas rotineiras com frequência." },
      ] },
      { id: "p20", num: "20", texto: "Você já notou períodos em que a pessoa parecia apresentar tristeza ou choro frequente ao mesmo tempo em que estava agitada, com energia elevada, pensamentos acelerados ou pouco sono — como se estivesse 'deprimida e acelerada ao mesmo tempo'?", opcoes: [
        { letra: "A", texto: "Não, os períodos de tristeza e os de agitação sempre ocorreram de forma separada." },
        { letra: "B", texto: "Talvez — havia momentos em que parecia triste mas inquieta, embora não fosse o padrão principal." },
        { letra: "C", texto: "Sim, claramente — havia episódios em que a tristeza e a agitação coexistiam de forma intensa e perturbadora ao mesmo tempo." },
      ] },
    ],
  },
  {
    titulo: "Observações Finais",
    sub: "Se quiser, compartilhe qualquer observação adicional sobre o comportamento ou a história da pessoa avaliada.",
    perguntas: [],
    obs: true,
  },
];

// ── Instrumento: Hábitos Alimentares ──
// 12 critérios DSM-5 (Anorexia, Bulimia/TCA, TCA puro, ARFID — os 2
// últimos, p11/p12, são coletados mas não entram na fórmula de
// pontuação, igual ao modelo original).
const BLOCOS_RASTREAMENTO_ALIMENTAR = [
  {
    titulo: "Bloco 1 — Padrão de Alimentação e Peso",
    sub: "Observe como a pessoa se relaciona com a alimentação, o peso corporal e a imagem que tem de si mesma.",
    perguntas: [
      { id: "p1", num: "1", texto: "A pessoa apresenta restrição persistente na quantidade de alimentos que consome, resultando em peso corporal muito abaixo do esperado para sua idade e altura?", opcoes: [
        { letra: "A", texto: "Não há restrição calórica; alimenta-se de forma adequada e mantém peso saudável." },
        { letra: "B", texto: "Apresenta restrições dietéticas leves ou modismos alimentares esporádicos, sem perda de peso clinicamente significativa." },
        { letra: "C", texto: "Restrição alimentar drástica e contínua, resultando em magreza acentuada e peso corporal abaixo do limite mínimo esperado." },
      ] },
      { id: "p2", num: "2", texto: "A pessoa demonstra medo intenso e persistente de ganhar peso ou de engordar, mesmo quando está visivelmente abaixo do peso?", opcoes: [
        { letra: "A", texto: "Não apresenta medo desproporcional em relação ao peso." },
        { letra: "B", texto: "Preocupa-se com o peso esteticamente, mas sem pavor ou comportamentos fóbicos." },
        { letra: "C", texto: "Medo intenso, irracional e persistente de engordar, acompanhado de pavor de qualquer alteração na balança." },
      ] },
      { id: "p3", num: "3", texto: "A pessoa tem uma percepção distorcida do próprio corpo, vendo-se acima do peso mesmo quando está muito magra, ou valoriza sua autoestima exclusivamente pelo número na balança?", opcoes: [
        { letra: "A", texto: "Tem percepção realista e saudável de sua forma física." },
        { letra: "B", texto: "Possui insatisfações estéticas comuns, mas sem distorção profunda da realidade corporal." },
        { letra: "C", texto: "Distorção severa da imagem corporal e valor pessoal atrelado exclusivamente ao peso." },
      ] },
      { id: "p4", num: "4", texto: "Nos últimos 3 meses, como tem sido o padrão de controle de peso da pessoa?", opcoes: [
        { letra: "A", texto: "Não se aplica — sem quadro restritivo." },
        { letra: "B", texto: "Controla o peso principalmente por meio de dietas rígidas ou exercício excessivo, sem episódios de compulsão ou purgação." },
        { letra: "C", texto: "Apresentou episódios de comer muito de uma vez seguidos de comportamentos para compensar (vômitos, laxantes ou jejum prolongado)." },
      ] },
    ],
  },
  {
    titulo: "Bloco 2 — Episódios de Ingestão Excessiva",
    sub: "Observe se a pessoa tem momentos em que come muito mais do que o comum, com sensação de perda de controle.",
    perguntas: [
      { id: "p5", num: "5", texto: "A pessoa tem episódios em que come uma quantidade muito grande de alimentos em pouco tempo, claramente mais do que a maioria das pessoas comeria na mesma situação?", opcoes: [
        { letra: "A", texto: "Nunca ocorrem episódios de ingestão descontrolada de grandes volumes." },
        { letra: "B", texto: "Ocasionalmente come um pouco além da conta em festas ou feriados, sem padrão clínico." },
        { letra: "C", texto: "Episódios recorrentes de ingestão volumosa e exagerada de comida." },
      ] },
      { id: "p6", num: "6", texto: "Durante esses episódios de ingestão excessiva, a pessoa sente que não consegue parar de comer ou controlar o quanto está comendo?", opcoes: [
        { letra: "A", texto: "Mantém controle absoluto sobre a alimentação." },
        { letra: "B", texto: "Sente que comeu rápido demais, mas sem perda de controle." },
        { letra: "C", texto: "Sensação inegável de impotência e perda de controle sobre a quantidade ingerida." },
      ] },
      { id: "p7", num: "7", texto: "Com que frequência ocorrem esses episódios de comer em excesso?", opcoes: [
        { letra: "A", texto: "Nunca ou em frequência irrelevante." },
        { letra: "B", texto: "Ocorrem esporadicamente (menos de uma vez por semana)." },
        { letra: "C", texto: "Ocorrem pelo menos uma vez por semana nos últimos 3 meses." },
      ] },
      { id: "p8", num: "8", texto: "Após comer em excesso, a pessoa adota métodos para compensar, como provocar vômito, usar laxantes, fazer jejum prolongado ou se exercitar de forma excessiva e punitiva?", opcoes: [
        { letra: "A", texto: "Nunca utiliza métodos compensatórios." },
        { letra: "B", texto: "Compensa reduzindo levemente a refeição seguinte de forma saudável." },
        { letra: "C", texto: "Uso regular de métodos drásticos de compensação ou purgação após os episódios." },
      ] },
    ],
  },
  {
    titulo: "Bloco 3 — Comportamento Durante a Ingestão e Sentimentos Posteriores",
    sub: "Observe como a pessoa se comporta durante e após os episódios de comer em excesso.",
    perguntas: [
      { id: "p9", num: "9", texto: "Durante os episódios de ingestão excessiva, a pessoa apresenta comportamentos como comer muito rápido, comer até sentir desconforto físico, comer escondida por vergonha ou comer sem sentir fome?", opcoes: [
        { letra: "A", texto: "Não apresenta esses padrões de ingestão." },
        { letra: "B", texto: "Apresenta esporadicamente um ou outro comportamento." },
        { letra: "C", texto: "Apresenta sistematicamente esse padrão de ingestão rápida, secreta e exagerada sem fome." },
      ] },
      { id: "p10", num: "10", texto: "Após os episódios de comer em excesso, a pessoa sente culpa intensa, vergonha ou nojo de si mesma, mas NÃO adota comportamentos de compensação como vômito ou laxantes?", opcoes: [
        { letra: "A", texto: "Não se aplica." },
        { letra: "B", texto: "Há compulsão ocasional com leve culpa, mas sem padrão clínico." },
        { letra: "C", texto: "Sofre intensamente com a culpa da compulsão, mas não usa métodos de compensação." },
      ] },
    ],
  },
  {
    titulo: "Bloco 4 — Restrição sem Preocupação com Peso (ARFID)",
    sub: "Observe se a pessoa evita alimentos por razões que NÃO incluem medo de engordar, como aversão sensorial, medo de engasgar ou falta de interesse por comida.",
    perguntas: [
      { id: "p11", num: "11", texto: "A pessoa evita ou restringe alimentos por causa de características sensoriais (textura, cheiro, cor, temperatura) ou por medo de engasgar, vomitar ou ter reação adversa, sem preocupação com peso ou imagem corporal?", opcoes: [
        { letra: "A", texto: "Não há restrição alimentar por razões sensoriais ou de medo." },
        { letra: "B", texto: "Há algumas preferências sensoriais, mas sem impacto significativo na nutrição." },
        { letra: "C", texto: "Restrição alimentar severa por aversão sensorial ou medo de engasgar, com impacto clínico na nutrição ou no funcionamento social." },
      ] },
      { id: "p12", num: "12", texto: "A restrição alimentar resulta em perda de peso significativa, deficiência nutricional, dependência de suplementos ou impacto importante nas atividades sociais (como não conseguir comer fora de casa)?", opcoes: [
        { letra: "A", texto: "Não há impacto clínico na nutrição ou na vida social." },
        { letra: "B", texto: "Há alguma limitação social, mas sem desnutrição ou perda de peso grave." },
        { letra: "C", texto: "Impacto clínico significativo: perda de peso, deficiência nutricional ou comprometimento grave da vida social por causa da restrição alimentar." },
      ] },
    ],
  },
  {
    titulo: "Observações Finais",
    sub: "Se quiser, compartilhe qualquer observação adicional sobre os hábitos alimentares da pessoa avaliada.",
    perguntas: [],
    obs: true,
  },
];

// ── Instrumento: Saúde Sexual ──
// 11 critérios DSM-5, respondido apenas pelo próprio paciente
// (confidencial — sem opção de familiar, igual ao modelo original).
const BLOCOS_RASTREAMENTO_SEXUAL = [
  {
    titulo: "Bloco 1 — Desejo e Interesse",
    sub: "Responda sobre como você percebe seu interesse e desejo pela vida sexual nos últimos meses.",
    perguntas: [
      { id: "p1", num: "1", texto: "Você percebe uma ausência ou redução significativa do desejo por atividade sexual ou de fantasias sexuais, de forma persistente há 6 meses ou mais?", opcoes: [
        { letra: "A", texto: "Mantenho um nível de desejo adequado e estável para minha realidade." },
        { letra: "B", texto: "Percebo quedas pontuais de desejo associadas a estresse, cansaço ou momentos difíceis na relação." },
        { letra: "C", texto: "Ausência crônica e marcante de desejo ou fantasias sexuais por 6 meses ou mais, causando sofrimento real." },
      ] },
      { id: "p2", num: "2", texto: "Você sente repulsa, aversão ou evita ativamente qualquer situação de contato sexual ou íntimo?", opcoes: [
        { letra: "A", texto: "Não há qualquer aversão ao toque ou contato íntimo." },
        { letra: "B", texto: "Em momentos de cansaço extremo, prefiro carícia sem ato sexual, mas sem repulsa." },
        { letra: "C", texto: "Sinto repulsa ativa ou evito de forma intensa qualquer aproximação de cunho sexual." },
      ] },
    ],
  },
  {
    titulo: "Bloco 2 — Resposta Física e Orgasmo",
    sub: "Responda sobre o que acontece com seu corpo durante a atividade sexual.",
    perguntas: [
      { id: "p3", num: "3", texto: "Você tem dificuldade persistente para obter ou manter a resposta física de excitação durante a atividade sexual (lubrificação, ereção) de forma adequada?", opcoes: [
        { letra: "A", texto: "A resposta física de excitação ocorre normalmente quando há estímulo e intenção." },
        { letra: "B", texto: "Ocorre ocasionalmente por ansiedade ou cansaço, mas não é um padrão." },
        { letra: "C", texto: "Dificuldade crônica e recorrente para atingir ou sustentar a resposta física até o fim da relação." },
      ] },
      { id: "p4", num: "4", texto: "Você experimenta atraso acentuado, pouca frequência ou ausência total de orgasmo, mesmo após estimulação adequada?", opcoes: [
        { letra: "A", texto: "Atinjo o orgasmo de forma satisfatória e regular quando estimulado(a)." },
        { letra: "B", texto: "Ocorre variação esporádica no tempo dependendo do contexto." },
        { letra: "C", texto: "Ausência ou grande dificuldade persistente de atingir o orgasmo, gerando frustração e sofrimento." },
      ] },
      { id: "p5", num: "5", texto: "(Para homens) A ejaculação ocorre de forma muito rápida, antes ou logo após o início da relação, sem que você consiga controlar?", opcoes: [
        { letra: "A", texto: "Consigo controlar o momento da ejaculação adequadamente." },
        { letra: "B", texto: "Ocorre de forma mais rápida raramente, em momentos de alta excitação." },
        { letra: "C", texto: "Padrão persistente de ejaculação rápida e involuntária sem controle." },
      ] },
      { id: "p6", num: "6", texto: "(Para homens) Há um atraso muito grande ou impossibilidade de ejacular durante a relação sexual?", opcoes: [
        { letra: "A", texto: "Tempo ejaculatório normal e satisfatório." },
        { letra: "B", texto: "Variação esporádica no tempo ejaculatório." },
        { letra: "C", texto: "Atraso extremo ou incapacidade de ejacular durante a relação, gerando grande desgaste." },
      ] },
    ],
  },
  {
    titulo: "Bloco 3 — Dor e Desconforto",
    sub: "Responda sobre eventuais dores ou desconfortos físicos relacionados à atividade sexual.",
    perguntas: [
      { id: "p7", num: "7", texto: "Você sente dor física genital ou pélvica durante ou ao tentar ter relação sexual com penetração?", opcoes: [
        { letra: "A", texto: "Nenhuma dor ou desconforto durante as relações." },
        { letra: "B", texto: "Desconforto leve e pontual resolvido com lubrificação ou ajustes." },
        { letra: "C", texto: "Dor genital ou pélvica acentuada, recorrente e significativa associada à penetração." },
      ] },
      { id: "p8", num: "8", texto: "(Para mulheres) Você percebe uma contração ou aperto involuntário dos músculos vaginais ao tentar a penetração, acompanhado de medo ou ansiedade intensa?", opcoes: [
        { letra: "A", texto: "Musculatura relaxada e sem medo ou tensão associada." },
        { letra: "B", texto: "Tensão leve inicial por inexperiência ou pressa que cede logo." },
        { letra: "C", texto: "Contração involuntária severa da musculatura e medo intenso da penetração." },
      ] },
    ],
  },
  {
    titulo: "Bloco 4 — Contexto e Duração",
    sub: "Responda sobre há quanto tempo isso acontece e em que situações.",
    perguntas: [
      { id: "p9", num: "9", texto: "Os sintomas ou dificuldades que você descreveu persistem há 6 meses ou mais e causam sofrimento real na sua vida ou nos seus relacionamentos?", opcoes: [
        { letra: "A", texto: "Não preenchem o critério de 6 meses ou não causam sofrimento real." },
        { letra: "B", texto: "Tenho dúvida sobre a constância ou duração do que sinto." },
        { letra: "C", texto: "Sim, persistem há mais de 6 meses e causam forte sofrimento pessoal ou nas relações." },
      ] },
      { id: "p10", num: "10", texto: "As dificuldades ocorrem em todas as situações ou apenas com determinados parceiros ou contextos específicos?", opcoes: [
        { letra: "A", texto: "Não se aplica — sem disfunção." },
        { letra: "B", texto: "Ocorre apenas em situações ou com parceiros específicos (por exemplo, com alguém novo)." },
        { letra: "C", texto: "Ocorre em todas as situações, independentemente do parceiro ou contexto." },
      ] },
      { id: "p11", num: "11", texto: "Você associa as dificuldades a algum desses fatores?", opcoes: [
        { letra: "A", texto: "Problemas físicos ou hormonais já investigados por médico." },
        { letra: "B", texto: "Início ou mudança de medicamentos (como antidepressivos, anticoncepcionais ou outros)." },
        { letra: "C", texto: "Ansiedade, pensamentos negativos sobre o próprio corpo ou desempenho, traumas ou conflitos no relacionamento." },
      ] },
    ],
  },
];

// ── Instrumento: Funcionamento e Comportamento (TDAH / TEA / TOD) ──
// 28 critérios DSM-5 em 4 blocos + observações finais.
const BLOCOS_RASTREAMENTO_NEURO = [
  {
    titulo: "Bloco 1 — Atenção e Foco",
    sub: "Observe como a pessoa lida com tarefas que exigem concentração, organização e memória no dia a dia.",
    perguntas: [
      { id: "p1", num: "1", texto: "A pessoa costuma falhar em prestar atenção em detalhes, cometendo erros por descuido em tarefas escolares, profissionais ou cotidianas?", opcoes: [
        { letra: "A", texto: "Raramente ou nunca." },
        { letra: "B", texto: "Ocasionalmente, em momentos de muita exaustão." },
        { letra: "C", texto: "Frequentemente — deixa passar detalhes essenciais ou erra por desatenção de forma recorrente." },
      ] },
      { id: "p2", num: "2", texto: "Apresenta dificuldade persistente em manter o foco em tarefas longas, leituras ou conversas?", opcoes: [
        { letra: "A", texto: "Consegue manter a atenção pelo tempo necessário." },
        { letra: "B", texto: "Distrai-se se o assunto for maçante, mas se esforça." },
        { letra: "C", texto: "Frequentemente perde o foco com facilidade extrema, parecendo não escutar quando falam diretamente." },
      ] },
      { id: "p3", num: "3", texto: "Inicia tarefas mas logo se perde ou abandona o que começou antes de terminar?", opcoes: [
        { letra: "A", texto: "Termina tudo o que começa de forma organizada." },
        { letra: "B", texto: "Às vezes acumula tarefas, mas dá conta no prazo." },
        { letra: "C", texto: "Frequentemente não segue instruções até o fim, deixando obrigações incompletas." },
      ] },
      { id: "p4", num: "4", texto: "Apresenta grande dificuldade para organizar tarefas, gerenciar o tempo ou manter o espaço de trabalho em ordem?", opcoes: [
        { letra: "A", texto: "É uma pessoa organizada e pontual." },
        { letra: "B", texto: "Tem momentos de desorganização sob estresse, mas se acha." },
        { letra: "C", texto: "Desorganização crônica severa: prazos perdidos, espaços caóticos, incapacidade de gerenciar rotinas." },
      ] },
      { id: "p5", num: "5", texto: "Evita ou procrastina de forma extrema atividades que exigem foco e esforço mental prolongado?", opcoes: [
        { letra: "A", texto: "Envolve-se normalmente nas tarefas exigidas." },
        { letra: "B", texto: "Prefere as mais fáceis, mas faz as difíceis quando precisa." },
        { letra: "C", texto: "Procrastina de forma extrema e evita ativamente qualquer atividade que exija esforço mental sustentado." },
      ] },
      { id: "p6", num: "6", texto: "Perde com frequência itens essenciais para o dia a dia (chaves, celular, documentos, carteira)?", opcoes: [
        { letra: "A", texto: "Nunca ou raramente perde coisas." },
        { letra: "B", texto: "Perde algo raramente." },
        { letra: "C", texto: "Perde coisas constantemente, gerando grande desgaste e perda de tempo procurando." },
      ] },
      { id: "p7", num: "7", texto: "É facilmente distraído(a) por estímulos externos como barulhos, movimentos ao redor ou pensamentos paralelos?", opcoes: [
        { letra: "A", texto: "Concentra-se bem mesmo com barulho ao redor." },
        { letra: "B", texto: "Incomoda-se se o ambiente for muito caótico." },
        { letra: "C", texto: "Distrai-se por qualquer estímulo irrelevante do ambiente com facilidade extrema." },
      ] },
      { id: "p8", num: "8", texto: "Esquece compromissos, contas a pagar, recados importantes ou tarefas rotineiras com frequência?", opcoes: [
        { letra: "A", texto: "Tem boa memória para compromissos." },
        { letra: "B", texto: "Esquece algo menor esporadicamente." },
        { letra: "C", texto: "Esquece com alta frequência compromissos agendados, tarefas e obrigações básicas." },
      ] },
    ],
  },
  {
    titulo: "Bloco 2 — Agitação e Impulsividade",
    sub: "Observe como a pessoa lida com a quietude, a espera e o controle dos próprios impulsos.",
    perguntas: [
      { id: "p9", num: "9", texto: "Remexe ou bate as mãos ou os pés, ou se contorce na cadeira quando precisa ficar sentado(a)?", opcoes: [
        { letra: "A", texto: "Fica sentado(a) com tranquilidade." },
        { letra: "B", texto: "Mexe as pernas levemente quando está ansioso(a)." },
        { letra: "C", texto: "Incapacidade de ficar com o corpo parado; remexe-se ou balança os pés constantemente." },
      ] },
      { id: "p10", num: "10", texto: "Levanta-se em situações em que se espera que permaneça sentado(a), como em reuniões ou refeições?", opcoes: [
        { letra: "A", texto: "Permanece sentado(a) sem problemas." },
        { letra: "B", texto: "Sente leve alívio ao levantar, mas se controla." },
        { letra: "C", texto: "Sente forte necessidade física de se levantar e circular fora de hora." },
      ] },
      { id: "p11", num: "11", texto: "Sente-se frequentemente acelerado(a) ou com muita energia em situações que não justificam isso?", opcoes: [
        { letra: "A", texto: "Ritmo calmo e controlado." },
        { letra: "B", texto: "Ritmo acelerado apenas em épocas de pico de trabalho." },
        { letra: "C", texto: "Inquietação interna crônica, como se estivesse sempre sob pressão ou com o acelerador travado." },
      ] },
      { id: "p12", num: "12", texto: "Fala excessivamente em situações sociais ou de trabalho, monopolizando conversas?", opcoes: [
        { letra: "A", texto: "Fala na medida certa, respeitando o turno de fala." },
        { letra: "B", texto: "Fala bastante quando o assunto lhe interessa muito." },
        { letra: "C", texto: "Monopoliza conversas, fala sem parar e atropela o interlocutor." },
      ] },
      { id: "p13", num: "13", texto: "Responde a perguntas antes que elas tenham sido concluídas ou completa a frase dos outros?", opcoes: [
        { letra: "A", texto: "Espera o outro terminar de falar educadamente." },
        { letra: "B", texto: "Ocorre raramente em momentos de pressa." },
        { letra: "C", texto: "Frequentemente atropela as perguntas ou completa as frases alheias antes do término." },
      ] },
      { id: "p14", num: "14", texto: "Tem dificuldade em aguardar em filas, no trânsito ou em situações que exigem espera?", opcoes: [
        { letra: "A", texto: "Aguarda pacientemente." },
        { letra: "B", texto: "Fica impaciente, mas se controla." },
        { letra: "C", texto: "Impaciência extrema em filas ou turnos, irritando-se ou tentando burlar a espera." },
      ] },
      { id: "p15", num: "15", texto: "Interrompe ou se intromete em conversas, jogos ou atividades dos outros sem permissão?", opcoes: [
        { letra: "A", texto: "Respeita o espaço e a atividade alheia." },
        { letra: "B", texto: "Dá pitacos esporádicos, mas percebe logo." },
        { letra: "C", texto: "Entra em conversas alheias ou interrompe atividades de terceiros com frequência." },
      ] },
    ],
  },
  {
    titulo: "Bloco 3 — Comunicação e Interação Social",
    sub: "Observe como a pessoa se relaciona com outras pessoas, como se comunica e como lida com rotinas e mudanças.",
    perguntas: [
      { id: "p16", num: "16", texto: "Tem dificuldade para manter uma conversa de forma natural e recíproca, ou para compartilhar interesses genuinamente?", opcoes: [
        { letra: "A", texto: "Interage de forma natural e recíproca." },
        { letra: "B", texto: "Pode ser mais reservado(a), mas compreende a troca." },
        { letra: "C", texto: "Dificuldade marcante na reciprocidade; conversas parecem unilaterais, mecânicas ou distantes." },
      ] },
      { id: "p17", num: "17", texto: "Apresenta uso atípico de contato visual, expressão facial reduzida ou gestualidade limitada?", opcoes: [
        { letra: "A", texto: "Contato visual e expressões perfeitamente naturais." },
        { letra: "B", texto: "Um pouco contido(a) na expressão facial, mas funcional." },
        { letra: "C", texto: "Evita contato visual direto, expressividade facial muito rígida ou gestualidade incomum." },
      ] },
      { id: "p18", num: "18", texto: "Apresenta grande dificuldade para ajustar o comportamento a diferentes contextos sociais ou para fazer e manter amigos?", opcoes: [
        { letra: "A", texto: "Relaciona-se com facilidade e mantém amigos de longa data." },
        { letra: "B", texto: "Tem poucos amigos, mas cultiva bons vínculos." },
        { letra: "C", texto: "Dificuldade crônica para engajar em amizades ou entender códigos sociais implícitos." },
      ] },
      { id: "p19", num: "19", texto: "Apresenta movimentos repetitivos (como balançar as mãos, alinhar objetos) ou falas ecolálicas/repetitivas?", opcoes: [
        { letra: "A", texto: "Nenhuma estereotipia motora presente." },
        { letra: "B", texto: "Movimentos leves de ansiedade em momentos isolados." },
        { letra: "C", texto: "Presença marcante de movimentos repetitivos ou falas/estereotipias frequentes para autorregulação." },
      ] },
      { id: "p20", num: "20", texto: "Sofre angústia severa diante de pequenas mudanças na rotina, imprevistos ou alterações no ambiente?", opcoes: [
        { letra: "A", texto: "Adapta-se bem a mudanças de planos." },
        { letra: "B", texto: "Prefere a rotina, mas tolera imprevistos se avisado(a)." },
        { letra: "C", texto: "Rigidez extrema: qualquer alteração imprevista gera desorganização emocional intensa ou crise." },
      ] },
      { id: "p21", num: "21", texto: "Possui interesses muito restritos e fixos, com intensidade ou foco incomuns (como memorização exaustiva de dados técnicos específicos)?", opcoes: [
        { letra: "A", texto: "Interesses comuns e variados." },
        { letra: "B", texto: "Hobbies bem definidos, mas sem exclusividade obsessiva." },
        { letra: "C", texto: "Hiperfoco profundo e restrito em tópicos específicos que dominam grande parte de seu tempo." },
      ] },
      { id: "p22", num: "22", texto: "Demonstra reatividade incomum a estímulos sensoriais (sons altos, texturas de roupas, luzes ou odores)?", opcoes: [
        { letra: "A", texto: "Sensibilidade sensorial dentro da normalidade." },
        { letra: "B", texto: "Incomoda-se com barulhos muito fortes eventuais." },
        { letra: "C", texto: "Hipersensibilidade acentuada a sons, luzes, texturas ou cheiros, exigindo adaptações constantes." },
      ] },
    ],
  },
  {
    titulo: "Bloco 4 — Comportamento e Relações com Regras",
    sub: "Observe como a pessoa lida com frustração, autoridade, regras e conflitos no dia a dia.",
    perguntas: [
      { id: "p23", num: "23", texto: "Perde a paciência com facilidade ou é frequentemente irritável e facilmente ofendido(a)?", opcoes: [
        { letra: "A", texto: "Bom controle emocional, não se ofende com facilidade." },
        { letra: "B", texto: "Estressa-se com cargas pesadas, mas pondera." },
        { letra: "C", texto: "Humor cronicamente irritável, suscetível e zangado na maior parte do tempo." },
      ] },
      { id: "p24", num: "24", texto: "Discute ativamente com figuras de autoridade como pais, chefes, professores ou supervisores?", opcoes: [
        { letra: "A", texto: "Respeita autoridades e cumpre diretrizes." },
        { letra: "B", texto: "Reclama de regras burocráticas, mas cumpre." },
        { letra: "C", texto: "Bate de frente sistematicamente, discute ordens e desafia autoridades de forma recorrente." },
      ] },
      { id: "p25", num: "25", texto: "Recusa-se ativamente a cumprir solicitações de autoridades ou regras fundamentais de convivência?", opcoes: [
        { letra: "A", texto: "Cumpre acordos e regras estabelecidas." },
        { letra: "B", texto: "Esquece regras menores ocasionalmente." },
        { letra: "C", texto: "Recusa-se de forma desafiadora a obedecer diretrizes ou acordos estabelecidos." },
      ] },
      { id: "p26", num: "26", texto: "Incomoda deliberadamente outras pessoas ou provoca o esgotamento e a irritação alheia de forma recorrente?", opcoes: [
        { letra: "A", texto: "Evita atritos e respeita o espaço alheio." },
        { letra: "B", texto: "Brinca ou provoca de forma leve em contextos específicos." },
        { letra: "C", texto: "Provoca intencionalmente o esgotamento ou a irritação alheia de maneira recorrente." },
      ] },
      { id: "p27", num: "27", texto: "Culpa frequentemente os outros pelos próprios erros ou falhas, sem assumir responsabilidade?", opcoes: [
        { letra: "A", texto: "Assume responsabilidade quando erra." },
        { letra: "B", texto: "Tenta justificar o erro antes de assumir, mas reconhece depois." },
        { letra: "C", texto: "Jamais assume culpa; culpa sistematicamente os outros por tudo o que dá errado." },
      ] },
      { id: "p28", num: "28", texto: "Mostra-se rancoroso(a), vingativo(a) ou guarda ressentimentos profundos por longos períodos?", opcoes: [
        { letra: "A", texto: "Perdoa e esquece desentendimentos facilmente." },
        { letra: "B", texto: "Demora a digerir mágoas profundas, mas não age por vingança." },
        { letra: "C", texto: "Apresenta nítida tendência a guardar rancor e buscar desforra por ofensas reais ou imaginadas." },
      ] },
    ],
  },
  {
    titulo: "Observações Finais",
    sub: "Se quiser, compartilhe qualquer observação adicional sobre o comportamento ou a história da pessoa avaliada.",
    perguntas: [],
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
  bipolar: {
    titulo: "Rastreamento Bipolar / Borderline",
    tempoEstimado: "8 a 12 minutos",
    blocos: BLOCOS_RASTREAMENTO_BIPOLAR,
  },
  alimentar: {
    titulo: "Rastreamento de Hábitos Alimentares",
    tempoEstimado: "6 a 10 minutos",
    blocos: BLOCOS_RASTREAMENTO_ALIMENTAR,
  },
  sexual: {
    titulo: "Rastreamento de Saúde Sexual",
    tempoEstimado: "5 a 10 minutos",
    blocos: BLOCOS_RASTREAMENTO_SEXUAL,
    somentePaciente: true,
  },
  neuro: {
    titulo: "Rastreamento de Funcionamento e Comportamento",
    tempoEstimado: "10 a 15 minutos",
    blocos: BLOCOS_RASTREAMENTO_NEURO,
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

  const limparRascunho = useRascunho(
    "rastreamento-" + link.tipo,
    tela === "sucesso" ? {} : { tela, tipoRespondente, nomeRespondente, parentesco, blocoIdx, respostas, obsFinais },
    (r) => {
      if (!r.tipoRespondente && !r.respostas) return;
      if (r.tipoRespondente) setTipoRespondente(r.tipoRespondente);
      if (r.nomeRespondente != null) setNomeRespondente(r.nomeRespondente);
      if (r.parentesco != null) setParentesco(r.parentesco);
      if (r.respostas) setRespostas(r.respostas);
      if (r.obsFinais != null) setObsFinais(r.obsFinais);
      if (r.tela === "formulario") {
        setBlocoIdx(r.blocoIdx || 0);
        setTela("formulario");
      }
    }
  );

  if (!config) {
    return (
      <div className="cartao" style={{ textAlign: "center", padding: "30px 20px" }}>
        <Icone nome="alert-triangle" tamanho={32} />
        <p className="texto-vazio-p" style={{ marginTop: 12 }}>Este questionário não está mais disponível.</p>
      </div>
    );
  }

  useEffect(() => {
    if (config?.somentePaciente) setTipoRespondente("paciente");
  }, [config]);

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
      limparRascunho();
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

        {config.somentePaciente ? (
          <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 12, padding: "13px 16px", fontSize: 12.5, color: "#065F46", lineHeight: 1.6, marginBottom: 16, display: "flex", gap: 10 }}>
            <Icone nome="lock" tamanho={16} />
            <span>Este questionário é confidencial e respondido apenas por você — nenhum familiar tem acesso.</span>
          </div>
        ) : (
          <>
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
          </>
        )}

        {!config.somentePaciente && tipoRespondente === "familiar" && (
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
