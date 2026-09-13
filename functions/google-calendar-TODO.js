// ═══════════════════════════════════════════════════════════════
//  GOOGLE CALENDAR — guardado para depois
//
//  Este arquivo NÃO está ativo (não é carregado por index.js).
//  Quando formos configurar a integração de agenda de verdade,
//  fazemos isso com calma, em etapa própria:
//
//  1. Criar credenciais OAuth do Google (Google Cloud Console >
//     APIs e serviços > Credenciais > Criar credenciais > ID do
//     cliente OAuth) para o projeto psicoworking
//  2. Ativar a API do Secret Manager no projeto (ela pede
//     confirmação manual, diferente das outras APIs)
//  3. Guardar client_id e client_secret com:
//     firebase functions:secrets:set GOOGLE_CLIENT_ID
//     firebase functions:secrets:set GOOGLE_CLIENT_SECRET
//  4. Colar o código abaixo de volta em index.js e publicar
//
//  Até lá, a agenda funciona só localmente (sem sincronizar com
//  o Google), o que não afeta a proteção de dados dos pacientes.
// ═══════════════════════════════════════════════════════════════

/*
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

const GOOGLE_CLIENT_ID = defineSecret("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = defineSecret("GOOGLE_CLIENT_SECRET");

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

    await admin.firestore()
      .collection("clinica_google_tokens")
      .doc(chamador.token.psi_id)
      .set(tokens, { merge: true });

    return { ok: true };
  }
);
*/
