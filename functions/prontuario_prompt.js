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
