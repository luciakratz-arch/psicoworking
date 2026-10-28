// Perguntas da Entrevista Clínica Inicial (perfis infantil e adulto): as MESMAS da anamnese enviada por link
// (psi/atividade/formulario-anamnese.js). Copiadas para uso no painel; se mudar lá, mude aqui.
(function () {
  function etapasAnamneseInfantil() {
    return [
      { titulo: "1. Identificação", sub: "Dados básicos sobre a criança ou adolescente e o motivo da avaliação.", campos: [
        { id: "nome", type: "text", label: "Nome completo", placeholder: "Nome da criança ou adolescente" },
        { type: "grid", fields: [
          { id: "dataNasc", type: "date", label: "Data de Nascimento *" },
          { id: "idade", type: "text", label: "Idade atual", placeholder: "Ex: 8 anos" },
        ] },
        { type: "grid", fields: [
          { id: "email", type: "email", label: "E-mail *", placeholder: "seu@email.com" },
          { id: "telefone", type: "tel", label: "WhatsApp / Telefone *", placeholder: "(62) 9 9999-9999" },
        ] },
        { type: "grid", fields: [
          { id: "cpf", type: "text", label: "CPF *", placeholder: "000.000.000-00" },
          { id: "genero", type: "select", label: "Gênero *", options: ["Masculino", "Feminino", "Não-binário", "Prefiro não informar"] },
        ] },
        { id: "escolaridade", type: "select", label: "Escolaridade *", options: ["Nunca estudou", "Ensino Fundamental incompleto", "Ensino Fundamental completo", "Ensino Médio incompleto", "Ensino Médio completo", "Ensino Superior incompleto", "Ensino Superior completo", "Pós-graduação"] },
        { id: "informante", type: "text", label: "Quem está respondendo e qual a relação com a criança", placeholder: "Ex: Mãe, pai, avó..." },
        { id: "encaminhador", type: "text", label: "Quem indicou ou encaminhou para a avaliação", placeholder: "Médico, escola, iniciativa própria...", optional: true },
        { id: "queixa", type: "textarea", label: "Qual o motivo principal desta avaliação?", placeholder: "Descreva com suas palavras o que está preocupando..." },
      ] },
      { titulo: "2. Gravidez e Nascimento", sub: "Informações sobre a gestação e o parto. Se não souber algo, deixe em branco.", campos: [
        { id: "gestacaoPlanejada", type: "radiogroup", label: "A gravidez foi planejada?", options: ["Sim", "Não", "Não sei"] },
        { id: "intercorrenciasGest", type: "textarea", label: "Houve alguma complicação durante a gravidez?", placeholder: "Infecções, pressão alta, diabetes, uso de remédios, sangramento, estresse intenso...", optional: true },
        { type: "grid", fields: [
          { id: "tipoParto", type: "select", label: "Tipo de parto", options: ["Normal", "Cesárea", "Fórceps"] },
          { id: "idadeGestacional", type: "select", label: "Nasceu", options: ["No tempo certo (9 meses)", "Prematuro (antes de 9 meses)", "Passou do tempo (mais de 9 meses)"] },
        ] },
        { id: "intercorrenciasPeri", type: "textarea", label: "Houve algum problema logo após o nascimento?", placeholder: "Ficou roxo, precisou de UTI, ficou amarelo (icterícia), não chorou imediatamente...", optional: true },
        { type: "grid", fields: [
          { id: "choroNascer", type: "select", label: "Chorou ao nascer?", options: ["Sim, imediatamente", "Só com estimulação", "Não chorou"] },
          { id: "tempoInternacao", type: "text", label: "Ficou internado?", placeholder: "Ex: 5 dias ou não ficou" },
        ] },
      ] },
      { titulo: "3. Desenvolvimento Motor", sub: "Como foi o desenvolvimento dos movimentos e coordenação.", campos: [
        { type: "section", label: "Movimentos Grandes (sentar, andar...)" },
        { type: "grid", fields: [
          { id: "sustCabeca", type: "text", label: "Firmou a cabeça (meses)", placeholder: "Ex: 3 meses" },
          { id: "sentou", type: "text", label: "Sentou sem apoio (meses)", placeholder: "Ex: 6 meses" },
        ] },
        { type: "grid", fields: [
          { id: "engatinhou", type: "text", label: "Engatinhou (meses)", placeholder: "Ex: 9 meses" },
          { id: "caminhou", type: "text", label: "Andou sozinho (meses)", placeholder: "Ex: 12 meses" },
        ] },
        { id: "padraoEngatinhar", type: "select", label: "Como engatinhou?", options: ["Normal (mãos e joelhos alternados)", "Se arrastou em vez de engatinhar", "Pulou essa fase e foi direto para o andar", "Não se aplica"] },
        { id: "dificMotorGrosso", type: "textarea", label: "Tem dificuldades de coordenação hoje?", placeholder: "Cai muito, tropeça, é desajeitado nos esportes...", optional: true },
        { type: "section", label: "Coordenação Fina (mãos, escrita...)" },
        { type: "grid", fields: [
          { id: "pegouObjetos", type: "text", label: "Pegou objetos com intenção (meses)", placeholder: "Ex: 4 meses" },
          { id: "pincaFina", type: "text", label: "Pegou objetos pequenos com 2 dedos (meses)", placeholder: "Ex: 9 meses" },
        ] },
        { id: "talheiresEscrita", type: "textarea", label: "Como está o uso de talheres, a escrita e o desenho?", placeholder: "Descreva como está a caligrafia, se segura o lápis bem, se usa talheres adequadamente...", optional: true },
        { id: "lateralidade", type: "select", label: "É destro ou canhoto?", options: ["Destro (mão direita)", "Canhoto (mão esquerda)", "Usa as duas mãos", "Ainda em definição"] },
      ] },
      { titulo: "4. Linguagem e Comunicação", sub: "Como a criança se comunica e se expressa.", campos: [
        { type: "section", label: "Primeiros Sons e Palavras" },
        { type: "grid", fields: [
          { id: "balbucio", type: "text", label: "Quando começou a fazer sons e balbuciar (meses)", placeholder: "Ex: 4 meses" },
          { id: "respostaSons", type: "select", label: "Respondia quando chamava pelo nome?", options: ["Sim, adequadamente", "Com algum atraso", "Raramente ou nunca"] },
        ] },
        { type: "grid", fields: [
          { id: "primeirasParalavras", type: "text", label: "Primeiras palavras com sentido (meses)", placeholder: "Ex: 12 meses" },
          { id: "frasesSimples", type: "text", label: "Começou a juntar palavras (meses/anos)", placeholder: "Ex: 18 meses" },
        ] },
        { id: "clarezaFala", type: "select", label: "Como está a fala hoje?", options: ["Qualquer pessoa entende", "Só quem conhece entende", "Difícil de entender mesmo para a família"] },
        { id: "atrasosLing", type: "textarea", label: "Houve algum atraso, troca de letras ou gagueira?", placeholder: "Descreva se houve e como está hoje...", optional: true },
        { type: "section", label: "Comunicação Não-Verbal" },
        { type: "grid", fields: [
          { id: "contatoVisual", type: "select", label: "Olha nos olhos durante conversa?", options: ["Sim, normalmente", "Às vezes", "Raramente ou nunca"] },
          { id: "gestos", type: "text", label: "Quando começou a apontar coisas (meses)", placeholder: "Ex: 12 meses", optional: true },
        ] },
        { id: "expressaoFacial", type: "select", label: "Expressa emoções com o rosto?", options: ["Sim, de forma adequada", "Às vezes, de forma reduzida", "Raramente ou expressão muito limitada"] },
      ] },
      { titulo: "5. Comportamento e Rotina", sub: "Como a criança se comporta, dorme, come e se relaciona.", campos: [
        { type: "section", label: "Relacionamento Social" },
        { type: "grid", fields: [
          { id: "sorrisoSocial", type: "text", label: "Quando deu o primeiro sorriso (meses)", placeholder: "Ex: 2 meses" },
          { id: "interessePares", type: "select", label: "Tem interesse em brincar com outras crianças?", options: ["Sim, gosta de brincar junto", "Prefere brincar sozinho", "Não tem interesse por outras crianças"] },
        ] },
        { id: "empatia", type: "select", label: "Percebe quando alguém está triste ou com raiva?", options: ["Sim, percebe bem", "Às vezes percebe", "Raramente percebe"] },
        { type: "section", label: "Sono e Alimentação" },
        { id: "padraOSono", type: "textarea", label: "Como é o sono?", placeholder: "Demora para dormir, acorda à noite, ronca, pesadelos frequentes..." },
        { id: "padraoAlimentar", type: "textarea", label: "Como é a alimentação?", placeholder: "Recusa muitos alimentos, só come certas texturas, tem dificuldade de mastigar..." },
        { type: "grid", fields: [
          { id: "desfralDiurno", type: "text", label: "Deixou as fraldas de dia (anos)", placeholder: "Ex: 2 anos e meio" },
          { id: "desfralNoturno", type: "text", label: "Deixou as fraldas de noite (anos)", placeholder: "Ex: 3 anos" },
        ] },
        { type: "section", label: "Comportamento" },
        { id: "comportRepetitivos", type: "textarea", label: "Tem movimentos repetitivos ou rituais rígidos?", placeholder: "Balança o corpo, gira objetos, insiste em rotinas específicas, tem apego excessivo a objetos...", optional: true },
        { id: "atividadeEmocional", type: "textarea", label: "Como lida com frustração e mudanças?", placeholder: "Fica muito agitado, tem crises, é impulsivo, tem dificuldade de aceitar não..." },
      ] },
      { titulo: "6. Escola e Aprendizagem", sub: "Desempenho escolar, atenção e organização.", campos: [
        { type: "grid", fields: [
          { id: "idadeEscola", type: "text", label: "Que idade tinha ao entrar na escola?", placeholder: "Ex: 1 ano e meio" },
          { id: "adaptacaoEscola", type: "select", label: "Como foi a adaptação?", options: ["Tranquila", "Chorou muito por um tempo", "Recusou por muito tempo", "Não se aplica"] },
        ] },
        { type: "grid", fields: [
          { id: "repetencia", type: "select", label: "Já repetiu de ano?", options: ["Não", "Sim, uma vez", "Sim, mais de uma vez"] },
          { id: "trocaEscola", type: "select", label: "Mudou muito de escola?", options: ["Não", "Sim, por escolha da família", "Sim, por dificuldades de adaptação"] },
        ] },
        { id: "facilidades", type: "textarea", label: "Em quais matérias vai melhor?", placeholder: "Leitura, matemática, artes, educação física..." },
        { id: "dificuldades", type: "textarea", label: "Em quais matérias tem mais dificuldade?", placeholder: "Leitura, escrita, cálculo, concentração..." },
        { type: "section", label: "Atenção e Organização" },
        { id: "foco", type: "select", label: "Consegue prestar atenção nas tarefas?", options: ["Sim, adequado para a idade", "Se distrai com facilidade", "Tem muita dificuldade de se concentrar"] },
        { id: "organizacao", type: "select", label: "Consegue se organizar para fazer as lições?", options: ["Sim, com autonomia", "Precisa de ajuda", "Não consegue sem acompanhamento constante"] },
        { id: "memoria", type: "select", label: "Lembra de recados e instruções?", options: ["Sim, normalmente", "Esquece com frequência", "Tem muita dificuldade de lembrar"] },
      ] },
      { titulo: "7. Histórico Médico e Família", sub: "Saúde geral e ocorrências na família que podem ser relevantes.", campos: [
        { id: "internacoes", type: "textarea", label: "Já ficou internado, fez cirurgia ou bateu forte a cabeça?", placeholder: "Descreva o que aconteceu e quando...", optional: true },
        { id: "convulsoes", type: "select", label: "Já teve convulsão, crise epiléptica ou desmaio?", options: ["Não", "Sim — crise epiléptica", "Sim — convulsão por febre", "Sim — desmaio"] },
        { id: "medicacoes", type: "textarea", label: "Usa algum remédio de uso contínuo?", placeholder: "Nome do remédio, dose e para que serve...", optional: true },
        { id: "exames", type: "textarea", label: "Já fez algum exame especializado?", placeholder: "Exame de audição, eletroencefalograma, ressonância, avaliação neuropsicológica...", optional: true },
        { type: "section", label: "Histórico Familiar" },
        { id: "historicoFamiliar", type: "textarea", label: "Alguém na família tem ou teve alguma dessas condições?", placeholder: "TDAH, autismo, dislexia, ansiedade, depressão, epilepsia, atraso no desenvolvimento, dificuldades de aprendizagem..." },
      ] },
      { titulo: "8. Para Finalizar", sub: "Mais alguma informação que queira compartilhar.", campos: [
        { id: "obsFinais", type: "textarea", label: "Tem mais alguma coisa que considere importante?", placeholder: "Qualquer informação que não foi perguntada mas que você acha relevante...", optional: true },
        { id: "origem", type: "select", label: "Como ficou sabendo da clínica?", options: ["Indicação de amigo ou familiar", "Indicação médica", "Instagram", "Google", "Doctoralia", "Outro"], optional: true },
        { type: "aviso", text: "Suas informações são confidenciais e serão usadas exclusivamente para fins clínicos, de acordo com o Código de Ética do Psicólogo e a LGPD." },
      ] },
    ];
  }
  
  // ═══════════════════════════════════════════
  // ETAPAS — perfil adulto/idoso
  // ═══════════════════════════════════════════
  function etapasAnamneseAdulto() {
    return [
      { titulo: "1. Identificação", sub: "Dados básicos sobre a pessoa que está sendo avaliada.", campos: [
        { id: "nome", type: "text", label: "Nome completo" },
        { type: "grid", fields: [
          { id: "dataNasc", type: "date", label: "Data de Nascimento *" },
          { id: "idade", type: "text", label: "Idade atual", placeholder: "Ex: 65 anos" },
        ] },
        { type: "grid", fields: [
          { id: "email", type: "email", label: "E-mail *", placeholder: "seu@email.com" },
          { id: "telefone", type: "tel", label: "WhatsApp / Telefone *", placeholder: "(62) 9 9999-9999" },
        ] },
        { type: "grid", fields: [
          { id: "cpf", type: "text", label: "CPF *", placeholder: "000.000.000-00" },
          { id: "genero", type: "select", label: "Gênero *", options: ["Masculino", "Feminino", "Não-binário", "Prefiro não informar"] },
        ] },
        { id: "escolaridade", type: "select", label: "Escolaridade *", options: ["Nunca estudou", "Ensino Fundamental incompleto", "Ensino Fundamental completo", "Ensino Médio incompleto", "Ensino Médio completo", "Ensino Superior incompleto", "Ensino Superior completo", "Pós-graduação"] },
        { id: "informante", type: "text", label: "Quem está respondendo e qual a relação com a pessoa avaliada", placeholder: "A própria pessoa, filho(a), cônjuge..." },
        { id: "encaminhador", type: "text", label: "Quem indicou ou encaminhou para a avaliação", placeholder: "Médico, advogado, iniciativa própria...", optional: true },
        { id: "queixa", type: "textarea", label: "Qual o motivo principal desta avaliação?", placeholder: "Descreva com suas palavras o que está acontecendo..." },
      ] },
      { titulo: "2. Histórico de Vida", sub: "Informações gerais sobre a vida da pessoa.", campos: [
        { type: "grid", fields: [
          { id: "estadoCivil", type: "select", label: "Estado civil", options: ["Solteiro(a)", "Casado(a) ou união estável", "Separado(a) ou divorciado(a)", "Viúvo(a)"] },
          { id: "profissao", type: "text", label: "Profissão atual ou anterior", placeholder: "Ex: Professora aposentada, comerciante..." },
        ] },
        { id: "comQuemMora", type: "text", label: "Com quem mora atualmente?", placeholder: "Ex: Mora sozinho, com cônjuge, com filhos..." },
        { id: "contextoEncaminhamento", type: "select", label: "Por que está buscando avaliação agora?", options: ["Preocupação com a memória ou raciocínio", "Pedido médico", "Processo judicial ou legal", "Questão profissional", "Autoconhecimento", "Outro"] },
      ] },
      { titulo: "3. Desenvolvimento na Infância", sub: "Informações sobre como foi o desenvolvimento nos primeiros anos. Se não souber, deixe em branco.", campos: [
        { type: "aviso", text: "Se possível, pergunte a familiares mais velhos sobre essas informações. Se não souber, escreva 'não sei' ou deixe em branco." },
        { id: "intercorrenciasGest", type: "textarea", label: "Houve alguma complicação na gravidez ou no parto?", placeholder: "O que a família conta sobre a gestação e o nascimento...", optional: true },
        { type: "grid", fields: [
          { id: "caminhou", type: "text", label: "Quando começou a andar (meses/anos)", placeholder: "Ex: 13 meses ou 'não sei'", optional: true },
          { id: "primeirasParalavras", type: "text", label: "Quando começou a falar (meses/anos)", placeholder: "Ex: 12 meses ou 'não sei'", optional: true },
        ] },
        { id: "dificEscolar", type: "select", label: "Teve dificuldades na escola?", options: ["Não", "Sim — dificuldade de leitura ou escrita", "Sim — dificuldade de matemática", "Sim — repetiu de ano", "Sim — várias dificuldades", "Não estudou"] },
        { id: "diagInfancia", type: "textarea", label: "Recebeu algum diagnóstico ou acompanhamento especial na infância?", placeholder: "TDAH, autismo, dislexia, fonoaudiologia, psicologia, neurologia...", optional: true },
        { id: "compInfancia", type: "select", label: "Como era o comportamento na infância?", options: ["Tranquilo e sociável", "Muito agitado e impulsivo", "Isolado e com poucas amizades", "Ansioso ou com muitos medos", "Não sei"] },
      ] },
      { titulo: "4. Queixa Atual e Histórico de Saúde Mental", sub: "Informações sobre o que está acontecendo agora e tratamentos anteriores.", campos: [
        { id: "inicioQueixa", type: "text", label: "Quando os sintomas ou dificuldades começaram?", placeholder: "Ex: Há 2 anos, desde a aposentadoria, após um acidente..." },
        { id: "evolucaoQueixa", type: "textarea", label: "Como foi evoluindo com o tempo?", placeholder: "Ficou pior, melhorou, veio de repente ou foi gradual..." },
        { id: "tratamentosAnteriores", type: "textarea", label: "Já fez tratamento psicológico ou psiquiátrico antes?", placeholder: "Quando, por quanto tempo, o que ajudou...", optional: true },
        { id: "usoAlcoolDrogas", type: "select", label: "Faz ou já fez uso de álcool ou outras substâncias?", options: ["Não", "Uso social e moderado", "Uso frequente de álcool", "Uso de outras substâncias", "Uso problemático no passado, hoje em abstinência"] },
        { id: "historicoFamiliarSM", type: "textarea", label: "Alguém na família tem ou teve problemas de saúde mental?", placeholder: "Depressão, ansiedade, esquizofrenia, bipolaridade, dependência química...", optional: true },
      ] },
      { titulo: "5. Memória e Raciocínio", sub: "Como está o funcionamento mental e cognitivo atualmente.", campos: [
        { type: "aviso", text: "Responda sobre como está <strong>hoje</strong>, comparando com como era há alguns anos." },
        { id: "memoria", type: "select", label: "Como está a memória?", options: ["Boa, sem queixas", "Esquece coisas recentes com certa frequência", "Esquece muito — compromissos, nomes, onde guardou objetos", "Muito comprometida — não lembra de coisas importantes do dia a dia"] },
        { id: "orientacao", type: "select", label: "Sabe o dia, mês e ano em que estamos?", options: ["Sim, sempre", "Às vezes fica confuso com datas", "Com frequência não sabe a data", "Não sabe e se confunde com lugares também"] },
        { id: "atencao", type: "select", label: "Consegue se concentrar em uma conversa ou tarefa?", options: ["Sim, normalmente", "Se distrai com facilidade", "Tem muita dificuldade de focar", "Quase não consegue se concentrar"] },
        { id: "decisoes", type: "select", label: "Consegue tomar decisões do dia a dia com tranquilidade?", options: ["Sim", "Com alguma dificuldade", "Com muita dificuldade", "Precisa que outros decidam por ele/ela"] },
        { id: "mudancaPersonalidade", type: "textarea", label: "Houve mudança de comportamento ou personalidade nos últimos anos?", placeholder: "Ficou mais irritado, apático, desinibido, desconfiado, agressivo...", optional: true },
      ] },
      { titulo: "6. Vida Diária e Independência", sub: "O que consegue fazer sozinho no dia a dia.", campos: [
        { type: "aviso", text: "Avalie comparando com como era há alguns anos atrás." },
        { id: "avdBasicas", type: "select", label: "Consegue se vestir, tomar banho e cuidar da higiene sozinho?", options: ["Sim, totalmente independente", "Com alguma dificuldade mas consegue", "Precisa de ajuda parcial", "Depende totalmente de outra pessoa"] },
        { id: "avdFinanceiro", type: "select", label: "Consegue pagar contas e gerenciar dinheiro?", options: ["Sim, normalmente", "Com alguma dificuldade", "Precisa de ajuda", "Não consegue mais fazer isso"] },
        { id: "avdCelular", type: "select", label: "Usa celular e tecnologia com tranquilidade?", options: ["Sim, sem dificuldades", "Com alguma dificuldade", "Com muita dificuldade", "Não usa"] },
        { id: "avdSair", type: "select", label: "Sai sozinho de casa?", options: ["Sim, sem problema", "Às vezes fica desorientado", "Raramente sai sozinho por medo de se perder", "Não sai sozinho"] },
        { id: "avdDirigir", type: "select", label: "Dirige ou usava dirigir?", options: ["Sim, dirige normalmente", "Reduziu por dificuldades", "Parou de dirigir recentemente", "Não dirige / nunca dirigiu"] },
      ] },
      { titulo: "7. Saúde Física e Sinais de Declínio", sub: "Estado de saúde geral e sinais que podem indicar alterações neurológicas.", campos: [
        { type: "section", label: "Saúde Geral" },
        { id: "internacoes", type: "textarea", label: "Já ficou internado, fez cirurgia ou sofreu acidente sério?", placeholder: "O que foi, quando aconteceu...", optional: true },
        { id: "doencasCronicas", type: "textarea", label: "Tem alguma doença crônica?", placeholder: "Diabetes, hipertensão, doença cardíaca, AVC, Parkinson, Alzheimer..." },
        { id: "convulsoes", type: "select", label: "Já teve convulsão, crise epiléptica ou desmaio?", options: ["Não", "Sim — crise epiléptica", "Sim — desmaio", "Sim — AVC ou derrame"] },
        { id: "medicacoes", type: "textarea", label: "Quais remédios usa atualmente?", placeholder: "Nome, dose e para que serve...", optional: true },
        { id: "exames", type: "textarea", label: "Fez algum exame especializado recentemente?", placeholder: "Ressonância, tomografia, neuropsicológico, eletroencefalograma...", optional: true },
        { type: "section", label: "Sinais de Declínio Cognitivo" },
        { id: "quedas", type: "select", label: "Está caindo ou tropeçando com frequência?", options: ["Não", "Às vezes", "Sim, com frequência"] },
        { id: "marcha", type: "select", label: "O jeito de andar mudou?", options: ["Não", "Anda mais devagar ou com passos menores", "Anda arrastando os pés ou com dificuldade de equilíbrio"] },
        { id: "tremores", type: "select", label: "Tem tremores nas mãos ou no corpo?", options: ["Não", "Leve, só às vezes", "Sim, frequente"] },
        { id: "confusaoNoturna", type: "select", label: "Fica confuso ou agitado à noite?", options: ["Não", "Às vezes", "Sim, com frequência"] },
        { id: "historicoFamiliar", type: "textarea", label: "Alguém na família teve Alzheimer, Parkinson ou outra demência?", placeholder: "Quem foi e em que idade começou...", optional: true },
      ] },
      { titulo: "8. Para Finalizar", sub: "Mais alguma informação que queira compartilhar.", campos: [
        { id: "obsFinais", type: "textarea", label: "Tem mais alguma coisa que considere importante?", placeholder: "Qualquer informação que não foi perguntada mas que você acha relevante...", optional: true },
        { id: "origem", type: "select", label: "Como ficou sabendo da clínica?", options: ["Indicação de amigo ou familiar", "Indicação médica", "Instagram", "Google", "Doctoralia", "Outro"], optional: true },
        { type: "aviso", text: "Suas informações são confidenciais e serão usadas exclusivamente para fins clínicos, de acordo com o Código de Ética do Psicólogo e a LGPD." },
      ] },
    ];
  }
  window.ENTREVISTA_ETAPAS = { infantil: etapasAnamneseInfantil, adulto: etapasAnamneseAdulto };
})();
