// ═══════════════════════════════════════════════════════════════
//  CLOUD FUNCTIONS — PsicoWorking
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
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { google } = require("googleapis");

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

const GOOGLE_CLIENT_ID = defineSecret("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = defineSecret("GOOGLE_CLIENT_SECRET");

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

  const { email, nome } = request.data || {};
  if (!email || !nome) {
    throw new HttpsError("invalid-argument", "Nome e e-mail do paciente são obrigatórios.");
  }

  const senhaTemporaria = admin.firestore().collection("_").doc().id + "Aa1!";

  const usuarioCriado = await auth.createUser({
    email,
    password: senhaTemporaria,
    displayName: nome,
  });

  await auth.setCustomUserClaims(usuarioCriado.uid, {
    psi_id: psiIdDoChamador,
    role: "paciente",
  });

  await db.collection("clinica_pacientes").doc(usuarioCriado.uid).set({
    psi_id: psiIdDoChamador,
    nome,
    email,
    criadoPor: chamador.uid,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    inativo: false,
  });

  const linkDefinirSenha = await auth.generatePasswordResetLink(email);

  await db.collection("clinica_audit_log").add({
    acao: "cadastrar_paciente",
    alvoUid: usuarioCriado.uid,
    psiId: psiIdDoChamador,
    executadoPor: chamador.uid,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { ok: true, uid: usuarioCriado.uid, linkDefinirSenha };
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
  const oauth2Client = new google.auth.OAuth2(
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

    const oauth2Client = new google.auth.OAuth2(
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
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

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
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

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
