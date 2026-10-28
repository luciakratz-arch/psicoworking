// Instruções da IA que organiza a anotação bruta da sessão no formato do prontuário TCC.
// Regras que importam para a psicóloga: nada do que foi dito se perde, nada é inventado,
// e campo sem informação fica VAZIO (nunca "não foi dito" / "não informado").

const CAMPOS = ["humor", "agenda", "pensamentosAutomaticos", "crencas", "tecnicas", "tarefas", "observacoes"];

function montarPromptProntuario({ textoBruto, pacienteNome, dataSessao, perfilClinico }) {
  return (
    "Você é uma psicóloga especialista em Terapia Cognitivo-Comportamental (TCC) e vai organizar as anotações brutas de uma sessão no formato de prontuário TCC.\n\n" +

    "REGRAS OBRIGATÓRIAS (a fidelidade ao que a psicóloga disse vem antes de tudo):\n" +
    "1. USE SOMENTE o que está nas anotações. NÃO invente fatos, sentimentos, técnicas, tarefas, diagnósticos ou frases que não foram ditos.\n" +
    "2. NÃO PERCA NADA. Toda informação das anotações deve aparecer em algum campo, com os detalhes concretos preservados: nomes de pessoas e relações (esposa, filho, chefe...), situações, datas, números, medicamentos, frases do paciente. Se uma informação não se encaixar claramente em nenhum campo, coloque-a em 'observacoes'.\n" +
    "3. Campo sem nenhuma informação nas anotações deve ser uma string VAZIA (\"\"). NUNCA escreva 'não foi dito', 'não informado', 'não relatado', 'sem informações' ou equivalentes.\n" +
    "4. Quando o paciente disser uma frase ou pensamento, mantenha as palavras dele (entre aspas) sempre que possível.\n" +
    "5. Não repita a mesma informação em vários campos, a menos que ela pertença realmente a mais de um.\n" +
    "6. Escreva em português do Brasil, em linguagem clínica clara, em frases completas e objetivas.\n\n" +

    "O QUE VAI EM CADA CAMPO (todos são texto simples, não listas de JSON):\n" +
    "- humor: estado emocional e de humor do paciente ao chegar e ao longo da sessão, e como estava no fim; inclui queixas de sono, energia e eventos da semana que ele trouxe no início.\n" +
    "- agenda: temas e assuntos abordados na sessão, na ordem em que apareceram.\n" +
    "- pensamentosAutomaticos: pensamentos, imagens ou frases automáticas do paciente, com as palavras dele.\n" +
    "- crencas: crenças intermediárias e centrais (regras, atitudes, crenças sobre si, os outros e o mundo) que apareceram ou foram trabalhadas.\n" +
    "- tecnicas: técnicas e intervenções que a psicóloga usou (reestruturação cognitiva, questionamento socrático, registro de pensamentos, psicoeducação, relaxamento etc.), exatamente as que foram citadas.\n" +
    "- tarefas: TODAS as tarefas e combinados para antes da próxima sessão, inclusive os que envolvem outras pessoas (por exemplo: conversar com a esposa, pedir ajuda a alguém). Este campo é enviado ao paciente por mensagem; por isso deve ser uma lista numerada, uma tarefa por linha, começando em '1- ', em linguagem simples e direta, dirigida ao paciente. Exemplo:\n" +
    "  1- Fazer caminhada duas vezes na semana\n" +
    "  2- Conversar com sua esposa sobre a divisão das tarefas da casa\n" +
    "  Se não houver nenhuma tarefa nas anotações, devolva \"\".\n" +
    "- observacoes: impressões e hipóteses da psicóloga, evolução, pontos de atenção, plano para a próxima sessão e qualquer informação que não coube nos outros campos.\n\n" +

    "ANTES DE RESPONDER, releia as anotações brutas do começo ao fim e confirme que nenhuma informação foi perdida e que nada foi inventado.\n\n" +

    "Retorne SOMENTE um JSON válido (sem markdown, sem explicações) com exatamente estas chaves, todas com valor texto: " + CAMPOS.join(", ") + ".\n\n" +

    "Paciente: " + (pacienteNome || "não informado") + "\n" +
    "Data: " + (dataSessao || "não informada") + "\n" +
    (perfilClinico && String(perfilClinico).trim()
      ? "Contexto clínico já cadastrado (CID, condições e medicações; use só como contexto, não repita nas seções): " +
        String(perfilClinico).trim().slice(0, 1500) + "\n"
      : "") +
    "\nANOTAÇÕES BRUTAS DA SESSÃO:\n" + String(textoBruto || "").trim()
  );
}

// Garante que todas as chaves existam como texto, mesmo que a IA devolva lista/objeto, e tira
// respostas do tipo "não foi dito" que a IA ainda assim possa escrever.
const VAZIO = /^\s*(n[aã]o\s+(foi\s+)?(dito|informad[oa]|relatad[oa]|mencionad[oa]|houve|h[aá])[^.\n]*|sem\s+(informa[cç][õo]es|registro)[^.\n]*|nenhum[ao]?\s+(informa[cç][ãa]o|tarefa|t[eé]cnica)[^.\n]*|-|—)\.?\s*$/i;
function normalizarProntuario(tcc) {
  const saida = {};
  for (const k of CAMPOS) {
    let v = tcc && tcc[k];
    if (Array.isArray(v)) v = v.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join("\n");
    else if (v && typeof v === "object") v = Object.values(v).join("\n");
    v = v == null ? "" : String(v).trim();
    if (VAZIO.test(v)) v = "";
    saida[k] = v;
  }
  return saida;
}

module.exports = { montarPromptProntuario, normalizarProntuario, CAMPOS };

// ─────────────────────────────────────────────────────────────
// Modelo ABA (Análise do Comportamento Aplicada): sessão com alvos, tentativas e comportamentos.
// A IA só ORGANIZA o que foi dito: números só se foram ditos; nada inventado.
// ─────────────────────────────────────────────────────────────
function montarPromptABA({ textoBruto, pacienteNome, dataSessao, alvosDoPlano }) {
  const lista = (Array.isArray(alvosDoPlano) ? alvosDoPlano : [])
    .slice(0, 80)
    .map((a) => "- id=" + a.id + " | " + (a.tipo === "reducao" ? "REDUÇÃO" : "AQUISIÇÃO") + " | " + a.nome)
    .join("\n");
  return (
    "Você é uma psicóloga analista do comportamento (ABA) e vai organizar as anotações brutas de uma sessão de ABA no formato de prontuário.\n\n" +
    "REGRAS OBRIGATÓRIAS (fidelidade ao que foi dito vem antes de tudo):\n" +
    "1. USE SOMENTE o que está nas anotações. NÃO invente alvos, números, tentativas, acertos, ocorrências, durações, antecedentes, consequências, funções ou estratégias.\n" +
    "2. NÚMEROS: só preencha tentativas, acertos e ocorrências se foram ditos ou escritos. Se disseram 'acertou 8 de 10', tentativas=10 e acertos=8. Se não foi dito, use null. Nunca estime.\n" +
    "3. Se o número de acertos foi dito sem separar independentes e com ajuda, coloque em acertosIndependentes apenas quando ficar claro que foram independentes; caso contrário, coloque 'acertosIndependentes: null' e registre o dado em 'observacao' do alvo.\n" +
    "4. NÃO PERCA NADA: toda informação deve aparecer em algum campo. O que não se encaixar vai em 'observacoes'.\n" +
    "5. Campo de texto sem informação fica \"\" (vazio). NUNCA escreva 'não foi dito', 'não informado' ou equivalentes. Lista sem itens fica [].\n" +
    "6. LINGUAGEM OBJETIVA E OPERACIONAL: descreva o que foi observável (ex.: 'apresentou 5 ocorrências de choro e esquiva da tarefa ao receber a instrução de pareamento'). Evite adjetivos vagos como 'agitado', 'preguiçoso', 'birra'; se as anotações só trouxerem um termo vago e nenhum detalhe observável, mantenha o termo como foi dito, sem acrescentar detalhes que não existem.\n" +
    "7. Português do Brasil. Nos textos, 'AT' significa Acompanhante Terapêutico.\n" +
    "8. PERGUNTAS: no campo 'perguntas', faça de 0 a 6 perguntas curtas (até 110 caracteres cada), em português, SOMENTE sobre informações importantes que FALTARAM nas anotações e que a psicóloga pode responder rápido. Exemplos: 'Quantas tentativas e quantos acertos independentes no alvo X?'; 'Quantas vezes o comportamento Y ocorreu e o que veio antes?'; 'Como a criança chegou hoje?'; 'Houve orientação aos pais?'; 'O que fica combinado para a próxima sessão?'. Não pergunte o que já foi dito. Se as anotações já estão completas, devolva [].\n\n" +
    "ALVOS DO PLANO DE ENSINO deste paciente (use o 'id' quando o alvo citado corresponder a um deles; se for um alvo que não está na lista, use alvoId \"\"):\n" +
    (lista || "(nenhum alvo cadastrado ainda)") + "\n\n" +
    "Retorne SOMENTE um JSON válido (sem markdown, sem explicações) com exatamente estas chaves:\n" +
    "{\n" +
    '  "modalidadeAtendimento": um destes valores ou "": "clinica", "domiciliar", "escolar", "orientacao_pais", "supervisao",\n' +
    '  "participantes": texto (quem participou: criança, mãe, pai, AT, professora...),\n' +
    '  "estadoGeral": texto (engajamento, saúde, sono, medicação, motivação e operações motivadoras relatadas),\n' +
    '  "alvos": [ { "alvoId": string, "nome": string, "procedimento": string (ex.: DTT, NET, pareamento...), "ajuda": string (nível de ajuda: independente, gestual, verbal, física, ou ""), "tentativas": number|null, "acertosIndependentes": number|null, "acertosComAjuda": number|null, "observacao": string } ],\n' +
    '  "comportamentos": [ { "nome": string (comportamento descrito de forma objetiva), "ocorrencias": number|null, "duracaoMinutos": number|null, "antecedente": string, "consequencia": string, "funcao": string (função hipotética SOMENTE se foi dita), "manejo": string (estratégia usada) } ],\n' +
    '  "reforcadores": texto,\n' +
    '  "orientacaoPais": texto (orientação ou treino de pais/cuidadores e combinados para casa),\n' +
    '  "generalizacao": texto (uso da habilidade em outros ambientes ou com outras pessoas),\n' +
    '  "observacoes": texto (impressões, evolução, plano da próxima sessão e o que não coube nos outros campos),\n' +
    '  "perguntas": [ perguntas curtas sobre o que faltou (ver regra 8), ou [] ]\n' +
    "}\n\n" +
    "ANTES DE RESPONDER, releia as anotações do começo ao fim e confirme que nada foi perdido nem inventado.\n\n" +
    "Paciente: " + (pacienteNome || "não informado") + "\n" +
    "Data: " + (dataSessao || "não informada") + "\n" +
    "\nANOTAÇÕES BRUTAS DA SESSÃO:\n" + String(textoBruto || "").trim()
  );
}

const MODALIDADES_ATEND = ["clinica", "domiciliar", "escolar", "orientacao_pais", "supervisao"];
const txt = (v) => (v == null ? "" : String(v).trim());
const num = (v) => { if (v === null || v === undefined || v === "") return null; const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : null; };

function normalizarABA(o) {
  o = o && typeof o === "object" ? o : {};
  const lista = (v) => (Array.isArray(v) ? v : []);
  const alvos = lista(o.alvos).map((a) => {
    a = a || {};
    const tent = num(a.tentativas);
    let ind = num(a.acertosIndependentes);
    let ajuda = num(a.acertosComAjuda);
    // nunca mais acertos do que tentativas
    if (tent != null && ind != null && ind > tent) ind = tent;
    if (tent != null && ajuda != null && (ind || 0) + ajuda > tent) ajuda = Math.max(0, tent - (ind || 0));
    return { alvoId: txt(a.alvoId), nome: txt(a.nome), procedimento: txt(a.procedimento), ajuda: txt(a.ajuda), tentativas: tent, acertosIndependentes: ind, acertosComAjuda: ajuda, observacao: txt(a.observacao) };
  }).filter((a) => a.nome || a.alvoId);
  const comportamentos = lista(o.comportamentos).map((c) => {
    c = c || {};
    return { nome: txt(c.nome), ocorrencias: num(c.ocorrencias), duracaoMinutos: num(c.duracaoMinutos), antecedente: txt(c.antecedente), consequencia: txt(c.consequencia), funcao: txt(c.funcao), manejo: txt(c.manejo) };
  }).filter((c) => c.nome);
  const mod = txt(o.modalidadeAtendimento);
  return {
    modalidadeAtendimento: MODALIDADES_ATEND.includes(mod) ? mod : "",
    participantes: txt(o.participantes),
    estadoGeral: txt(o.estadoGeral),
    alvos,
    comportamentos,
    reforcadores: txt(o.reforcadores),
    orientacaoPais: txt(o.orientacaoPais),
    generalizacao: txt(o.generalizacao),
    observacoes: txt(o.observacoes),
    perguntas: lista(o.perguntas).map(txt).filter(Boolean).slice(0, 6),
  };
}

module.exports.montarPromptABA = montarPromptABA;
module.exports.normalizarABA = normalizarABA;

// ─────────────────────────────────────────────────────────────
// Questionário inicial ABA -> RASCUNHO do Plano de Tratamento (queixas, metas e objetivos).
// A IA só propõe a partir do que a família respondeu; a psicóloga revisa e escolhe o que entra.
// ─────────────────────────────────────────────────────────────
const AREAS_ABA = ["Comunicação", "Social", "Brincar", "Autocuidado e autonomia", "Imitação", "Acadêmico", "Motor", "Tolerância e regulação", "Outro"];
const PROCS_ABA = ["DTT (tentativas discretas)", "NET (ensino naturalístico)", "Pareamento", "Treino de comunicação funcional (FCT)", "Encadeamento", "Modelação / vídeo", "Outro"];
const FUNCOES_ABA = ["Fuga / esquiva", "Atenção", "Acesso a item ou atividade", "Sensorial / automática", "Ainda a investigar"];
const ORIGENS_ABA = ["Família", "Escola", "Equipe multidisciplinar", "Outra"];

function montarPromptPlanoABA({ textoBruto, pacienteNome, idadeTexto }) {
  return (
    "Você é uma psicóloga analista do comportamento (ABA). Com base SOMENTE nas respostas do questionário inicial da família abaixo, escreva um RASCUNHO de plano de tratamento: queixas, metas gerais e objetivos específicos. A psicóloga vai revisar tudo antes de usar.\n\n" +
    "REGRAS OBRIGATÓRIAS:\n" +
    "1. USE SOMENTE o que está nas respostas. NÃO invente diagnóstico, número, idade, instrumento, resultado de avaliação nem fatos. Não faça diagnóstico.\n" +
    "2. QUEIXAS: o que a família (ou a escola) relatou como preocupação, nas palavras mais fiéis possíveis, de forma objetiva. No máximo 6.\n" +
    "3. METAS GERAIS: resultados de longo prazo, formulados a partir das queixas e das prioridades da família, em linguagem observável e positiva (o que a criança passará a FAZER). Cada meta aponta para a queixa de origem pelo índice (começando em 0). No máximo 5.\n" +
    "4. OBJETIVOS ESPECÍFICOS: habilidades a ensinar (tipo 'aquisicao') e comportamentos a reduzir (tipo 'reducao') coerentes com as respostas. Nome curto e operacional (ex.: 'Mando por água (vocal)'). Cada objetivo aponta para a meta pelo índice (começando em 0). No máximo 10.\n" +
    "   - 'definicao': para 'reducao', descreva o comportamento de forma OBSERVÁVEL a partir do que foi relatado, sem adjetivos vagos; para 'aquisicao', descreva em uma frase o que a criança fará.\n" +
    "   - NÃO inclua linha de base nem critério de domínio: serão definidos pela psicóloga na avaliação.\n" +
    "   - 'funcao' (só para redução): preencha SOMENTE se as respostas deixarem a função clara; caso contrário \"\". 'manejo': deixe \"\".\n" +
    "   - 'reforcadores': use os itens e atividades de que a criança gosta, se foram relatados.\n" +
    "5. Se faltam informações importantes para montar o plano, liste em 'lacunas' até 6 perguntas curtas (até 110 caracteres) para a psicóloga esclarecer com a família. Não pergunte o que já foi respondido.\n" +
    "6. Português do Brasil. Campo de texto sem informação fica \"\". Listas vazias ficam [].\n\n" +
    "Valores permitidos: area = um destes ou \"\": " + AREAS_ABA.join(" | ") + ". procedimento = um destes ou \"\": " + PROCS_ABA.join(" | ") + ". funcao = um destes ou \"\": " + FUNCOES_ABA.join(" | ") + ". origem = " + ORIGENS_ABA.join(" | ") + ".\n\n" +
    "Retorne SOMENTE um JSON válido (sem markdown) com exatamente estas chaves:\n" +
    "{\n" +
    '  "queixas": [ { "texto": string, "origem": string } ],\n' +
    '  "metas": [ { "texto": string, "queixaIndex": number|null } ],\n' +
    '  "objetivos": [ { "tipo": "aquisicao"|"reducao", "nome": string, "area": string, "definicao": string, "procedimento": string, "metaIndex": number|null, "reforcadores": string, "funcao": string, "manejo": string } ],\n' +
    '  "orientacaoPais": string (sugestão de metas para orientação aos pais, só se decorrer das respostas),\n' +
    '  "lacunas": [ string ]\n' +
    "}\n\n" +
    "Paciente: " + (pacienteNome || "não informado") + (idadeTexto ? " · Idade: " + idadeTexto : "") + "\n\n" +
    "RESPOSTAS DO QUESTIONÁRIO INICIAL:\n" + String(textoBruto || "").trim()
  );
}

function normalizarPlanoABA(o) {
  o = o && typeof o === "object" ? o : {};
  const lista = (v) => (Array.isArray(v) ? v : []);
  const idx = (v, max) => { const n = Number(v); return Number.isInteger(n) && n >= 0 && n < max ? n : null; };
  const dentro = (v, permitidos) => (permitidos.includes(txt(v)) ? txt(v) : "");
  const queixas = lista(o.queixas).map((q) => ({ texto: txt(q && q.texto), origem: dentro(q && q.origem, ORIGENS_ABA) || "Família" })).filter((q) => q.texto).slice(0, 6);
  const metas = lista(o.metas).map((m) => ({ texto: txt(m && m.texto), queixaIndex: idx(m && m.queixaIndex, queixas.length) })).filter((m) => m.texto).slice(0, 5);
  const objetivos = lista(o.objetivos).map((a) => ({
    tipo: a && a.tipo === "reducao" ? "reducao" : "aquisicao",
    nome: txt(a && a.nome), area: dentro(a && a.area, AREAS_ABA), definicao: txt(a && a.definicao),
    procedimento: dentro(a && a.procedimento, PROCS_ABA), metaIndex: idx(a && a.metaIndex, metas.length),
    reforcadores: txt(a && a.reforcadores), funcao: dentro(a && a.funcao, FUNCOES_ABA), manejo: txt(a && a.manejo),
  })).filter((a) => a.nome).slice(0, 10);
  return { queixas, metas, objetivos, orientacaoPais: txt(o.orientacaoPais), lacunas: lista(o.lacunas).map(txt).filter(Boolean).slice(0, 6) };
}

module.exports.montarPromptPlanoABA = montarPromptPlanoABA;
module.exports.normalizarPlanoABA = normalizarPlanoABA;
