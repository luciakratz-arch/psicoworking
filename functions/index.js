// ═══════════════════════════════════════════════════════════════
//  CLOUD FUNCTIONS — PsiCoWorking
//
//  Este arquivo roda do lado do Google (nunca no navegador do
//  usuário). Responsabilidades:
//    1) dar o "carimbo" (psi_id + role) que as regras do Firestore
//       usam para decidir quem pode ver o quê;
//    2) cadastrar paciente com login de verdade (Firebase Auth);
//    3) conectar, ler e criar eventos no Google Agenda de cada
//       psicóloga, sem o token do Google jamais tocar o navegador.
// ═══════════════════════════════════════════════════════════════

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

// googleapis é um pacote gigante e demora vários segundos pra
// carregar — se ficar no topo do arquivo, o deploy falha com
// "Cannot determine backend specification. Timeout after 10000",
// porque o Firebase carrega este arquivo só pra descobrir quais
// functions existem. Carregamos sob demanda, só nas functions da
// Agenda que realmente usam.
let _google = null;
function obterGoogle() {
  if (!_google) _google = require("googleapis").google;
  return _google;
}

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

const GOOGLE_CLIENT_ID = defineSecret("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = defineSecret("GOOGLE_CLIENT_SECRET");
const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

// ─────────────────────────────────────────────────────────────
// 1) CARIMBO DE IDENTIDADE (custom claims)
// ─────────────────────────────────────────────────────────────
exports.definirCarimboEquipe = onCall(async (request) => {
  const chamador = request.auth;
  if (!chamador) {
    throw new HttpsError("unauthenticated", "É preciso estar logado.");
  }

  const { uid, psiId, role } = request.data || {};
  const papeisValidos = ["psi", "secretaria"];

  if (!uid || !psiId || !papeisValidos.includes(role)) {
    throw new HttpsError("invalid-argument", "Dados incompletos para definir o carimbo.");
  }

  const chamadorEhAdminMatriz = chamador.token.role === "admin_matriz";
  if (!chamadorEhAdminMatriz) {
    throw new HttpsError("permission-denied", "Só a Admin Matriz pode conceder este acesso.");
  }

  await auth.setCustomUserClaims(uid, { psi_id: psiId, role });

  await db.collection("clinica_audit_log").add({
    acao: "definir_carimbo_equipe",
    alvoUid: uid,
    psiId,
    role,
    executadoPor: chamador.uid,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { ok: true };
});

// ─────────────────────────────────────────────────────────────
// 2) CADASTRO DO PACIENTE
// ─────────────────────────────────────────────────────────────
exports.cadastrarPaciente = onCall(async (request) => {
  const chamador = request.auth;
  if (!chamador) {
    throw new HttpsError("unauthenticated", "É preciso estar logado.");
  }

  const psiIdDoChamador = chamador.token.psi_id;
  const papelDoChamador = chamador.token.role;
  const podeCadastrar = papelDoChamador === "psi" || papelDoChamador === "secretaria";

  if (!podeCadastrar || !psiIdDoChamador) {
    throw new HttpsError("permission-denied", "Só a equipe da clínica cadastra pacientes.");
  }

  const dadosPaciente = validarDadosPaciente(request.data);

  const resultado = await criarPacienteEConta({
    psiId: psiIdDoChamador,
    status: dadosPaciente.status || "ativo",
    dadosPaciente,
    criadoPor: chamador.uid,
  });

  return resultado;
});

// ─────────────────────────────────────────────────────────────
// 2b) AUTOCADASTRO PÚBLICO — o "link de cadastro" que a psicóloga
//     manda pro paciente preencher sozinho. Sem autenticação (é
//     público por natureza), mas sempre cria com status "pendente"
//     — a psicóloga aprova depois, igual ao modelo do site antigo.
// ─────────────────────────────────────────────────────────────
exports.autoCadastroPaciente = onCall(async (request) => {
  const { psiId } = request.data || {};
  if (!psiId) {
    throw new HttpsError("invalid-argument", "Link de cadastro inválido (falta psiId).");
  }

  // Confirma que existe uma clínica com esse psi_id antes de aceitar o
  // cadastro (evita criar pacientes "órfãos" com um link inventado).
  // Checa psi_config em vez de psi_profiles porque o cadastro de
  // psicólogas pela Admin Matriz ainda não existe — psi_config é
  // criado assim que a psicóloga salva Configurações pela 1ª vez.
  const psiExiste = await db.collection("psi_config").doc(psiId).get();
  if (!psiExiste.exists) {
    throw new HttpsError("not-found", "Clínica não encontrada para este link.");
  }

  const dadosPaciente = validarDadosPaciente(request.data);

  const resultado = await criarPacienteEConta({
    psiId,
    status: "pendente",
    dadosPaciente,
    criadoPor: null,
  });

  return resultado;
});

// Campos aceitos no cadastro de paciente — mesmo modelo do sistema
// já usado pela Dra. Lucia (nome, contato, dados ocupacionais p/ NR-1).
function validarDadosPaciente(dados) {
  const { nome, email } = dados || {};
  if (!nome || !email) {
    throw new HttpsError("invalid-argument", "Nome e e-mail do paciente são obrigatórios.");
  }
  return {
    nome,
    email,
    telefone: dados.telefone || "",
    dataNasc: dados.dataNasc || "",
    cpf: dados.cpf || "",
    genero: dados.genero || "",
    status: dados.status || "",
    empresa: dados.empresa || "",
    setor: dados.setor || "",
    cargo: dados.cargo || "",
    objetivos: dados.objetivos || "",
  };
}

// Cria a conta de login (Firebase Auth) + o documento do paciente,
// compartilhado pelo cadastro feito pela equipe e pelo autocadastro
// público — a única diferença é o status inicial e quem executou.
async function criarPacienteEConta({ psiId, status, dadosPaciente, criadoPor }) {
  const usuarioCriado = await auth.createUser({
    email: dadosPaciente.email,
    displayName: dadosPaciente.nome,
  });

  await auth.setCustomUserClaims(usuarioCriado.uid, {
    psi_id: psiId,
    role: "paciente",
  });

  await db.collection("clinica_pacientes").doc(usuarioCriado.uid).set({
    ...dadosPaciente,
    status,
    psi_id: psiId,
    criadoPor,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  });

  const linkDefinirSenha = await auth.generatePasswordResetLink(dadosPaciente.email);

  await db.collection("clinica_audit_log").add({
    acao: criadoPor ? "cadastrar_paciente" : "autocadastro_paciente",
    alvoUid: usuarioCriado.uid,
    psiId,
    executadoPor: criadoPor,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { ok: true, uid: usuarioCriado.uid, linkDefinirSenha };
}

// ─────────────────────────────────────────────────────────────
// 2c) CADASTRO DE PSICÓLOGA — só Admin Matriz pode chamar.
//     Cria conta Firebase Auth + carimbo psi + perfil público.
//     Retorna o link de definição de senha pra Admin Matriz
//     enviar pra ela por WhatsApp/e-mail.
// ─────────────────────────────────────────────────────────────
exports.cadastrarPsicologa = onCall(async (request) => {
  const chamador = request.auth;
  if (!chamador || chamador.token.role !== "admin_matriz") {
    throw new HttpsError("permission-denied", "Só a Admin Matriz pode cadastrar psicólogas.");
  }

  const { nome, email, crp, cidade, titulo } = request.data || {};
  if (!nome || !email) {
    throw new HttpsError("invalid-argument", "Nome e e-mail são obrigatórios.");
  }

  const usuarioCriado = await auth.createUser({ email, displayName: nome });
  const uid = usuarioCriado.uid;

  await auth.setCustomUserClaims(uid, { psi_id: uid, role: "psi" });

  await db.collection("psi_profiles").doc(uid).set({
    nome,
    email,
    crp: crp || "",
    cidade: cidade || "",
    titulo: titulo || "Psicóloga",
    ativo: true,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection("psi_config").doc(uid).set({
    nome,
    corPrimaria: "#6A2BD9",
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  });

  const linkDefinirSenha = await auth.generatePasswordResetLink(email);

  await db.collection("clinica_audit_log").add({
    acao: "cadastrar_psicologa",
    alvoUid: uid,
    email,
    executadoPor: chamador.uid,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { ok: true, uid, linkDefinirSenha };
});

// ─────────────────────────────────────────────────────────────
// 2d) ATIVAR / DESATIVAR CLÍNICA — só Admin Matriz.
//     Bloqueia o login da psicóloga no Firebase Auth e marca
//     psi_profiles.ativo para a listagem do painel refletir.
// ─────────────────────────────────────────────────────────────
exports.ativarDesativarClinica = onCall(async (request) => {
  const chamador = request.auth;
  if (!chamador || chamador.token.role !== "admin_matriz") {
    throw new HttpsError("permission-denied", "Só a Admin Matriz pode ativar ou desativar clínicas.");
  }

  const { psiId, ativo } = request.data || {};
  if (!psiId || typeof ativo !== "boolean") {
    throw new HttpsError("invalid-argument", "psiId e ativo (boolean) são obrigatórios.");
  }

  await auth.updateUser(psiId, { disabled: !ativo });
  await db.collection("psi_profiles").doc(psiId).update({ ativo });

  await db.collection("clinica_audit_log").add({
    acao: ativo ? "ativar_clinica" : "desativar_clinica",
    alvoUid: psiId,
    executadoPor: chamador.uid,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { ok: true };
});

// ─────────────────────────────────────────────────────────────
// 3) Auditoria de segurança extra
// ─────────────────────────────────────────────────────────────
exports.auditarCriacaoPaciente = onDocumentCreated(
  "clinica_pacientes/{pacienteId}",
  async (event) => {
    const dados = event.data?.data();
    if (!dados?.psi_id) {
      console.error("Paciente criado sem psi_id — investigar imediatamente:", event.params.pacienteId);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// GOOGLE AGENDA — helper interno (não exportado)
//
// Monta um cliente OAuth já autenticado com o token guardado da
// psicóloga, e persiste de volta se o Google renovar o token.
// ─────────────────────────────────────────────────────────────
function montarClienteOAuth(psiId) {
  const oauth2Client = new (obterGoogle()).auth.OAuth2(
    GOOGLE_CLIENT_ID.value(),
    GOOGLE_CLIENT_SECRET.value()
  );

  oauth2Client.on("tokens", (novosTokens) => {
    db.collection("clinica_google_tokens").doc(psiId).set(novosTokens, { merge: true }).catch(() => {});
  });

  return oauth2Client;
}

async function obterClienteAutenticado(psiId) {
  const doc = await db.collection("clinica_google_tokens").doc(psiId).get();
  if (!doc.exists) {
    throw new HttpsError("failed-precondition", "Google Agenda ainda não conectado.");
  }
  const oauth2Client = montarClienteOAuth(psiId);
  oauth2Client.setCredentials(doc.data());
  return oauth2Client;
}

// ─────────────────────────────────────────────────────────────
// 4) CONECTAR GOOGLE AGENDA — troca o código de autorização pelo token
// ─────────────────────────────────────────────────────────────
exports.conectarGoogleCalendar = onCall(
  { secrets: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET] },
  async (request) => {
    const chamador = request.auth;
    if (!chamador || chamador.token.role !== "psi") {
      throw new HttpsError("permission-denied", "Só o psicólogo conecta a própria agenda.");
    }

    const { codigoAutorizacao, redirectUri } = request.data || {};
    if (!codigoAutorizacao || !redirectUri) {
      throw new HttpsError("invalid-argument", "Código de autorização do Google ausente.");
    }

    try {
      const oauth2Client = new (obterGoogle()).auth.OAuth2(
        GOOGLE_CLIENT_ID.value(),
        GOOGLE_CLIENT_SECRET.value(),
        redirectUri
      );

      const { tokens } = await oauth2Client.getToken(codigoAutorizacao);

      // Guardado numa coleção separada, sem regra de leitura para o
      // client (ver firestore.rules: sem "match" para esta coleção
      // = acesso negado por padrão). Só Cloud Functions acessam.
      await db
        .collection("clinica_google_tokens")
        .doc(chamador.token.psi_id)
        .set(tokens, { merge: true });

      await db.collection("clinica_audit_log").add({
        acao: "conectar_google_agenda",
        psiId: chamador.token.psi_id,
        executadoPor: chamador.uid,
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { ok: true };
    } catch (e) {
      console.error("Erro ao conectar Google Agenda:", e.response?.data || e.message || e);
      throw new HttpsError("internal", "Falha ao trocar código pelo token: " + (e.message || "erro desconhecido"));
    }
  }
);

// ─────────────────────────────────────────────────────────────
// 5) LISTAR EVENTOS — busca a agenda de verdade da psicóloga
// ─────────────────────────────────────────────────────────────
exports.listarEventosAgenda = onCall(
  { secrets: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET] },
  async (request) => {
    const chamador = request.auth;
    if (!chamador || !["psi", "secretaria"].includes(chamador.token.role)) {
      throw new HttpsError("permission-denied", "Só a equipe da clínica acessa a agenda.");
    }

    const { dataInicio, dataFim } = request.data || {};
    if (!dataInicio || !dataFim) {
      throw new HttpsError("invalid-argument", "Período (dataInicio/dataFim) é obrigatório.");
    }

    const oauth2Client = await obterClienteAutenticado(chamador.token.psi_id);
    const calendar = obterGoogle().calendar({ version: "v3", auth: oauth2Client });

    const resposta = await calendar.events.list({
      calendarId: "primary",
      timeMin: dataInicio,
      timeMax: dataFim,
      singleEvents: true,
      orderBy: "startTime",
    });

    const eventos = (resposta.data.items || []).map((ev) => ({
      id: ev.id,
      titulo: ev.summary || "(sem título)",
      descricao: ev.description || "",
      inicio: ev.start?.dateTime || ev.start?.date,
      fim: ev.end?.dateTime || ev.end?.date,
      link: ev.htmlLink,
    }));

    return { eventos };
  }
);

// ─────────────────────────────────────────────────────────────
// 6) CRIAR EVENTO — nova sessão direto no Google Agenda
// ─────────────────────────────────────────────────────────────
exports.criarEventoAgenda = onCall(
  { secrets: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET] },
  async (request) => {
    const chamador = request.auth;
    if (!chamador || !["psi", "secretaria"].includes(chamador.token.role)) {
      throw new HttpsError("permission-denied", "Só a equipe da clínica cria sessões.");
    }

    const { titulo, descricao, inicio, fim } = request.data || {};
    if (!titulo || !inicio || !fim) {
      throw new HttpsError("invalid-argument", "Título, início e fim são obrigatórios.");
    }

    const oauth2Client = await obterClienteAutenticado(chamador.token.psi_id);
    const calendar = obterGoogle().calendar({ version: "v3", auth: oauth2Client });

    const resposta = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: titulo,
        description: descricao || "",
        start: { dateTime: inicio },
        end: { dateTime: fim },
      },
    });

    await db.collection("clinica_audit_log").add({
      acao: "criar_evento_agenda",
      psiId: chamador.token.psi_id,
      executadoPor: chamador.uid,
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { ok: true, eventoId: resposta.data.id };
  }
);

// ─────────────────────────────────────────────────────────────
// 7) BUSCA POR SINTOMA (IA) — Recursos Terapêuticos
// ─────────────────────────────────────────────────────────────
// A psicóloga digita a queixa/sintoma da paciente e a IA escolhe, só
// entre os itens que já existem na biblioteca da clínica, quais fazem
// mais sentido indicar. A chave da Anthropic fica só aqui (Secret
// Manager) — nunca é exposta no navegador.
exports.buscarPorSintoma = onCall({ secrets: [ANTHROPIC_API_KEY] }, async (request) => {
  const chamador = request.auth;
  if (!chamador) {
    throw new HttpsError("unauthenticated", "É preciso estar logado.");
  }

  const { sintoma, itens } = request.data || {};
  if (!sintoma || !Array.isArray(itens) || itens.length === 0) {
    throw new HttpsError("invalid-argument", "Envie o sintoma e a lista de itens da biblioteca.");
  }

  // A chave só existe de verdade depois que a psicóloga criar uma
  // conta na Anthropic e rodarmos `firebase functions:secrets:set`.
  // Até lá o segredo guarda um marcador, e a mensagem abaixo explica
  // a situação em vez de estourar um erro técnico da API.
  const chaveConfigurada = ANTHROPIC_API_KEY.value();
  if (!chaveConfigurada || chaveConfigurada === "NAO_CONFIGURADA") {
    throw new HttpsError(
      "failed-precondition",
      "A busca por sintoma ainda não está ativada: falta cadastrar a chave da Anthropic."
    );
  }

  const lista = itens
    .slice(0, 200)
    .map((it) => `- "${it.titulo}" (${it.categoria || "sem categoria"}): ${it.descricao || "sem descrição"}`)
    .join("\n");

  const prompt = `Você é uma psicóloga clínica experiente em TCC, DBT e recursos terapêuticos digitais.

Estas são as opções disponíveis na biblioteca da clínica:
${lista}

A queixa/sintoma relatado é: "${sintoma}"

Escolha as 3 a 5 opções mais indicadas, usando SOMENTE títulos que estão exatamente na lista acima (nunca invente um título novo). Responda apenas em JSON válido, sem nenhum texto antes ou depois:
{"recomendacoes":[{"titulo":"título exato como está na lista","motivo":"justificativa clínica breve","ordem":1}]}`;

  let resposta;
  try {
    resposta = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": chaveConfigurada,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (e) {
    throw new HttpsError("internal", "Não foi possível consultar a IA: " + e.message);
  }

  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new HttpsError("internal", dados?.error?.message || "Erro ao consultar a IA.");
  }

  let recomendacoes = [];
  try {
    const texto = dados?.content?.[0]?.text || "{}";
    const json = JSON.parse(texto);
    recomendacoes = Array.isArray(json.recomendacoes) ? json.recomendacoes : [];
  } catch (e) {
    throw new HttpsError("internal", "A IA respondeu num formato inesperado.");
  }

  return { recomendacoes };
});

// ─────────────────────────────────────────────────────────────
// 8) ANIVERSÁRIOS
// ─────────────────────────────────────────────────────────────

// Chamada pela página pública psi/aniversario/ (sem login — o
// paciente não tem conta ainda ou não lembra a senha). Por segurança
// só atualiza quando o nome digitado bate com EXATAMENTE UM paciente
// daquela clínica — em caso de ambiguidade ou "não encontrado" quem
// decide o que fazer é a psicóloga, não a function.
// ═══════════════════════════════════════════════════════════════
//  ATIVIDADE ABERTA POR LINK (WhatsApp) — gravação das respostas
//
//  A página psi/atividade/ não tem login: o paciente entra só com o
//  link. Por isso ela NÃO pode gravar direto no banco — quem grava é
//  esta função, que confere o token do link e carimba psi_id e
//  pacienteId a partir do próprio documento do link, ignorando o que
//  o navegador mandou. Assim um link só consegue escrever no
//  prontuário do paciente pra quem ele foi criado, e em mais nada.
// ═══════════════════════════════════════════════════════════════

// Só estas coleções aceitam gravação vinda de link público — são as
// que as ferramentas terapêuticas usam. Nada de financeiro, cadastro
// ou configuração entra aqui.
const COLECOES_ATIVIDADE_PUBLICA = [
  "clinica_gestao_ansiedade",
  "clinica_tcc",
  "clinica_registro_abc",
  "clinica_arvore_decisao",
  "clinica_relaxamento",
  "clinica_treino_auditivo",
  "clinica_baralho_distorcoes",
  "clinica_reflexoes",
  "clinica_anamneses",
  "clinica_rastreamento_jogos",
  "clinica_rastreamento_dependencia",
  "clinica_rastreamento_bipolar",
  "clinica_rastreamento_alimentar",
  "clinica_rastreamento_sexual",
  "clinica_rastreamento_neuro",
];

// A página manda a hora como { __horaDoServidor: true } porque lá não
// existe SDK de escrita. Aqui isso vira a hora real do servidor.
function trocarMarcasDeHora(valor) {
  if (Array.isArray(valor)) return valor.map(trocarMarcasDeHora);
  if (valor && typeof valor === "object") {
    if (valor.__horaDoServidor) return admin.firestore.FieldValue.serverTimestamp();
    const saida = {};
    for (const chave of Object.keys(valor)) saida[chave] = trocarMarcasDeHora(valor[chave]);
    return saida;
  }
  return valor;
}

exports.salvarAtividadePublica = onCall(async (request) => {
  const { token, colecao, dados, docId } = request.data || {};

  if (!token || typeof token !== "string") {
    throw new HttpsError("invalid-argument", "Link inválido.");
  }
  if (!COLECOES_ATIVIDADE_PUBLICA.includes(colecao)) {
    throw new HttpsError("permission-denied", "Este tipo de registro não pode ser gravado por link.");
  }
  if (!dados || typeof dados !== "object") {
    throw new HttpsError("invalid-argument", "Nada para gravar.");
  }

  const linkRef = db.collection("clinica_links_partilhados").doc(token);
  const linkDoc = await linkRef.get();
  if (!linkDoc.exists) {
    throw new HttpsError("not-found", "Link não encontrado ou expirado.");
  }
  const link = linkDoc.data();
  if (link.cancelado) {
    throw new HttpsError("permission-denied", "Este link foi desativado.");
  }

  // O navegador pode mandar o que quiser nestes campos — o que vale é
  // sempre o que está gravado no link.
  const registro = {
    ...trocarMarcasDeHora(dados),
    psi_id: link.psi_id,
    pacienteId: link.pacienteId,
    pacienteNome: link.pacienteNome || "",
    origem: "link_publico",
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  };

  let idGravado;
  if (docId) {
    await db.collection(colecao).doc(docId).set(registro, { merge: true });
    idGravado = docId;
  } else {
    const novo = await db.collection(colecao).add(registro);
    idGravado = novo.id;
  }

  await linkRef.update({
    status: "respondido",
    respondidoEm: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { ok: true, id: idGravado };
});

exports.registrarNascimento = onCall(async (request) => {
  const { psiId, nome, dataNasc } = request.data || {};
  if (!psiId || !nome || !dataNasc) {
    throw new HttpsError("invalid-argument", "Nome, data de nascimento e clínica são obrigatórios.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataNasc)) {
    throw new HttpsError("invalid-argument", "Data de nascimento em formato inválido.");
  }

  const snap = await db.collection("clinica_pacientes").where("psi_id", "==", psiId).get();
  const nomeBuscado = nome.trim().toLowerCase();
  const encontrados = snap.docs.filter((doc) => (doc.data().nome || "").trim().toLowerCase() === nomeBuscado);

  if (encontrados.length === 0) return { status: "nao_encontrado" };
  if (encontrados.length > 1) return { status: "ambiguo" };

  await encontrados[0].ref.update({ dataNasc });

  await db.collection("clinica_audit_log").add({
    acao: "registrar_nascimento_publico",
    psiId,
    pacienteId: encontrados[0].id,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { status: "ok" };
});

// Enfileira um e-mail de teste pro endereço da própria psicóloga.
// Serve pra confirmar que a extensão "Trigger Email from Firestore"
// está configurada e entregando de verdade — sem depender de
// esperar o aniversário de alguém chegar.
exports.enviarEmailTeste = onCall(async (request) => {
  const chamador = request.auth;
  if (!chamador || !["psi", "secretaria"].includes(chamador.token.role)) {
    throw new HttpsError("permission-denied", "Só a equipe da clínica pode enviar e-mail de teste.");
  }

  const destino = chamador.token.email;
  if (!destino) {
    throw new HttpsError("failed-precondition", "Sua conta não tem e-mail cadastrado.");
  }

  await db.collection("clinica_emails").add({
    to: destino,
    message: {
      subject: "Teste de envio — PsiCoWorking",
      html:
        "<div style='font-family:Arial;padding:24px'>" +
        "<h2 style='color:#7B00C4'>Funcionou!</h2>" +
        "<p>Se você está lendo isto, o envio automático de e-mails do PsiCoWorking está configurado corretamente.</p>" +
        "<p>Os e-mails de aniversário dos seus pacientes vão sair normalmente.</p>" +
        "</div>",
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { ok: true, destino };
});

function montarEmailAniversarioPaciente({ primeiroNome, anos, nomeClinica, corMarca, logoUrl }) {
  return (
    "<div style='font-family:Arial;background:#f5e8ff;padding:30px'><div style='max-width:500px;margin:0 auto;background:white;border-radius:20px;overflow:hidden'>" +
    "<div style='background:" + corMarca + ";padding:30px;text-align:center'>" +
    (logoUrl ? "<img src='" + logoUrl + "' style='width:80px;height:80px;object-fit:contain;border-radius:50%'/>" : "") +
    "<h1 style='color:white;margin:10px 0'>Feliz Aniversário, " + primeiroNome + "!</h1>" +
    (anos ? "<p style='color:rgba(255,255,255,0.85)'>" + anos + " anos</p>" : "") +
    "</div><div style='padding:30px'>" +
    "<p style='color:#444'>Olá, <strong style='color:" + corMarca + "'>" + primeiroNome + "</strong>! Hoje é o seu dia! Que este novo ciclo seja repleto de saúde, leveza e crescimento.</p>" +
    "<p style='color:" + corMarca + ";font-size:18px;margin-top:20px'>" + nomeClinica + "</p>" +
    "</div></div></div>"
  );
}

function montarEmailAvisoAniversario({ nomeClinica, corMarca, logoUrl, quantidade, lista }) {
  return (
    "<div style='font-family:Arial;background:#f5e8ff;padding:30px'><div style='max-width:500px;margin:0 auto;background:white;border-radius:20px;overflow:hidden'>" +
    "<div style='background:" + corMarca + ";padding:30px;text-align:center'>" +
    (logoUrl ? "<img src='" + logoUrl + "' style='width:70px;height:70px;object-fit:contain;border-radius:50%'/>" : "") +
    "<h1 style='color:white;font-size:20px;margin:10px 0'>Aniversariantes de Hoje</h1></div>" +
    "<div style='padding:28px'><p style='color:#555'>Hoje é aniversário de <strong style='color:" + corMarca + "'>" + quantidade + " paciente(s)</strong> de " + nomeClinica + ":</p>" +
    "<ul style='color:#444;line-height:2'>" + lista + "</ul></div></div></div>"
  );
}

// Roda todo dia às 08:00 (horário de Brasília). Precisa da extensão
// "Trigger Email from Firestore" (ext-firestore-send-email) instalada
// e apontando pra coleção clinica_emails — sem ela, os documentos são
// criados normalmente mas nenhum e-mail sai de verdade.
exports.verificarAniversarios = onSchedule(
  { schedule: "0 8 * * *", timeZone: "America/Sao_Paulo" },
  async () => {
    const hoje = new Date();
    const mes = hoje.getMonth() + 1;
    const dia = hoje.getDate();

    const snap = await db.collection("clinica_pacientes").where("status", "==", "ativo").get();
    const aniversariantes = [];
    snap.forEach((doc) => {
      const p = doc.data();
      if (!p.dataNasc) return;
      if (parseInt(p.dataNasc.slice(5, 7), 10) === mes && parseInt(p.dataNasc.slice(8, 10), 10) === dia) {
        aniversariantes.push({ id: doc.id, ...p });
      }
    });

    if (aniversariantes.length === 0) {
      console.log("Nenhum aniversariante hoje.");
      return;
    }

    // Agrupa por clínica (psi_id) — cada uma tem sua própria cor/logo
    // e recebe um único e-mail de aviso, mesmo com vários pacientes.
    const porClinica = {};
    aniversariantes.forEach((p) => {
      (porClinica[p.psi_id] = porClinica[p.psi_id] || []).push(p);
    });

    for (const [psiId, pacientesDaClinica] of Object.entries(porClinica)) {
      let nomeClinica = "Sua clínica";
      let corMarca = "#7B00C4";
      let logoUrl = "";
      try {
        const configDoc = await db.collection("psi_config").doc(psiId).get();
        if (configDoc.exists) {
          const config = configDoc.data();
          nomeClinica = config.nome || nomeClinica;
          corMarca = config.corPrimaria || corMarca;
          logoUrl = config.logoUrl || "";
        }
      } catch (e) {}

      for (const p of pacientesDaClinica) {
        if (!p.email) continue;
        const primeiroNome = (p.nome || "").split(" ")[0];
        const anos = hoje.getFullYear() - parseInt(p.dataNasc.slice(0, 4), 10);
        await db.collection("clinica_emails").add({
          to: p.email,
          message: {
            subject: "Feliz Aniversário, " + primeiroNome + "!",
            html: montarEmailAniversarioPaciente({ primeiroNome, anos, nomeClinica, corMarca, logoUrl }),
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      try {
        const psiInfo = await auth.getUser(psiId);
        if (psiInfo.email) {
          const lista = pacientesDaClinica
            .map((p) => {
              const anosP = hoje.getFullYear() - parseInt(p.dataNasc.slice(0, 4), 10);
              return "<li><strong>" + p.nome + "</strong> — " + anosP + " anos · " + (p.email || "sem e-mail") + "</li>";
            })
            .join("");
          await db.collection("clinica_emails").add({
            to: psiInfo.email,
            message: {
              subject: pacientesDaClinica.length + " aniversariante(s) hoje — " + dia + "/" + mes,
              html: montarEmailAvisoAniversario({ nomeClinica, corMarca, logoUrl, quantidade: pacientesDaClinica.length, lista }),
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (e) {
        console.error("Erro ao buscar e-mail da psicóloga " + psiId + ":", e.message);
      }
    }

    console.log("Aniversariantes de hoje:", aniversariantes.map((p) => p.nome).join(", "));
  }
);

// ─────────────────────────────────────────────────────────────
// BACKUP DIÁRIO DO FIRESTORE
// Roda todo dia às 03:00 (horário de Brasília) e exporta todo o
// banco pra um bucket do Cloud Storage, numa pasta com a data.
// Requer que o bucket "psicoworking-backups" exista no Cloud
// Storage (criar manualmente no console, região southamerica-east1).
// A conta de serviço padrão já tem permissão via papel "Editor".
// ─────────────────────────────────────────────────────────────
exports.backupFirestoreDiario = onSchedule(
  {
    schedule: "0 3 * * *",
    timeZone: "America/Sao_Paulo",
    region: "southamerica-east1",
  },
  async () => {
    const google = obterGoogle();
    const authClient = await new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/datastore"],
    }).getClient();

    const projectId = "psicoworking";
    const data = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const destino = `gs://psicoworking-backups/${data}`;

    const token = await authClient.getAccessToken();
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`;

    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${typeof token === "string" ? token : token.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ outputUriPrefix: destino }),
    });

    if (!resposta.ok) {
      const erro = await resposta.text();
      throw new Error(`Backup falhou (${resposta.status}): ${erro}`);
    }

    const resultado = await resposta.json();
    console.log(`Backup iniciado com sucesso: ${resultado.name} → ${destino}`);
  }
);
