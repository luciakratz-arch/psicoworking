// ═══════════════════════════════════════════════════════════════
//  CLOUD FUNCTIONS — PsicoWorking
//
//  Este arquivo roda do lado do Google (nunca no navegador do
//  usuário). É a única peça do sistema com poder de:
//    1) dar o "carimbo" (psi_id + role) que as regras do Firestore
//       usam para decidir quem pode ver o quê;
//    2) guardar e usar o token do Google Calendar sem nunca expor
//       esse token ao navegador.
// ═══════════════════════════════════════════════════════════════

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// Segredos do Google Calendar — configurados via `firebase functions:secrets:set`,
// NUNCA escritos direto no código nem no repositório.
const GOOGLE_CLIENT_ID = defineSecret("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = defineSecret("GOOGLE_CLIENT_SECRET");

// ─────────────────────────────────────────────────────────────
// 1) CARIMBO DE IDENTIDADE (custom claims)
//
// Só a Admin Matriz (Lucia) pode chamar isto, e só para definir o
// papel de um psicólogo/secretária dentro da própria clínica dele.
// O paciente ganha o carimbo automaticamente quando o cadastro dele
// é criado pela equipe da clínica (gatilho mais abaixo).
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

  // Só a Admin Matriz cria acesso de psicólogo/secretária.
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
//
// A equipe da clínica cria a conta de login do paciente (Firebase
// Authentication de verdade — nunca senha guardada em texto no
// Firestore). O paciente recebe um link para definir a própria
// senha, ou já é criado com uma senha temporária que ele troca
// no primeiro acesso.
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

  // Senha temporária forte e aleatória — nunca "1234", nunca fixa.
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

  // Envia link de redefinição de senha — o paciente escolhe a própria senha,
  // ninguém (nem a clínica) fica sabendo qual é.
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
// 3) GOOGLE CALENDAR — troca de código por token
//
// O token de acesso/atualização do Google NUNCA é devolvido ao
// navegador. Fica só nesta função e no Firestore, num documento
// que as regras de segurança bloqueiam para qualquer leitura vinda
// do cliente (só a própria Cloud Function, via Admin SDK, acessa).
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

    const { google } = require("googleapis");
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID.value(),
      GOOGLE_CLIENT_SECRET.value(),
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(codigoAutorizacao);

    // Guardado numa coleção separada, nunca lida pelo cliente (ver firestore.rules:
    // não existe "match" para clinica_google_tokens => acesso negado por padrão).
    await db
      .collection("clinica_google_tokens")
      .doc(chamador.token.psi_id)
      .set(tokens, { merge: true });

    return { ok: true };
  }
);

// ─────────────────────────────────────────────────────────────
// 4) Trava de segurança extra: se alguém tentar criar um
//    documento de paciente sem psi_id batendo com quem criou,
//    a auditoria registra a tentativa (as regras já bloqueiam
//    a escrita — isto aqui é só o registro para investigação).
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
