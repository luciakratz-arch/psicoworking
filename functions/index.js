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
//
//  Ambiente de execução: Node.js 22 (definido em firebase.json).
//  O Node 20 deixa de aceitar deploy em 30/10/2026.
// ═══════════════════════════════════════════════════════════════

const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
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
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");
const BOOTSTRAP_SECRET = defineSecret("BOOTSTRAP_SECRET");

// ─────────────────────────────────────────────────────────────
// 0) BOOTSTRAP — cria a conta Admin Matriz (uso único).
//    APAGAR ESTA FUNÇÃO depois de rodar uma vez.
//    Chamar com ?s=<BOOTSTRAP_SECRET>
// ─────────────────────────────────────────────────────────────
exports.bootstrapAdminMatriz = onRequest(
  { region: "southamerica-east1", secrets: [BOOTSTRAP_SECRET] },
  async (req, res) => {
    if (!req.query.s || req.query.s !== BOOTSTRAP_SECRET.value()) {
      res.status(403).send("Acesso negado.");
      return;
    }
    const EMAIL = "contato@luciakratz.com.br";
    try {
      let usuario;
      try {
        usuario = await auth.getUserByEmail(EMAIL);
      } catch {
        usuario = await auth.createUser({ email: EMAIL, displayName: "Admin Matriz" });
      }
      await auth.setCustomUserClaims(usuario.uid, { role: "admin_matriz" });
      const linkSenha = await auth.generatePasswordResetLink(EMAIL);
      res.send(
        "<h2>Admin Matriz configurado!</h2>" +
        "<p>UID: " + usuario.uid + "</p>" +
        "<p>Clique no link abaixo para definir sua senha:</p>" +
        "<a href='" + linkSenha + "'>" + linkSenha + "</a>"
      );
    } catch (err) {
      res.status(500).send("Erro: " + err.message);
    }
  }
);

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

  const dadosPaciente = validarDadosPaciente(request.data, { exigirEmail: false });

  const resultado = await criarPacienteEConta({
    psiId: psiIdDoChamador,
    status: dadosPaciente.status || "ativo",
    dadosPaciente,
    criadoPor: chamador.uid,
  });

  return resultado;
});

// ─────────────────────────────────────────────────────────────
// 2a) ENVIAR ACESSO AO PORTAL — manda o link para o paciente definir
//     a senha. O envio padrão do Firebase só chega ao e-mail da conta,
//     que pode ser o endereço interno; aqui o e-mail vai para o contato
//     certo (o paciente ou o responsável) e o texto se adapta.
// ─────────────────────────────────────────────────────────────
exports.enviarAcessoPaciente = onCall({ region: "southamerica-east1" }, async (request) => {
  const chamador = request.auth;
  if (!chamador) {
    throw new HttpsError("unauthenticated", "É preciso estar logado.");
  }
  const psiId = chamador.token.psi_id;
  const papel = chamador.token.role;
  if (!psiId || (papel !== "psi" && papel !== "secretaria")) {
    throw new HttpsError("permission-denied", "Só a equipe da clínica envia o acesso.");
  }

  const { pacienteId } = request.data || {};
  if (!pacienteId) {
    throw new HttpsError("invalid-argument", "Informe o paciente.");
  }

  const snap = await db.collection("clinica_pacientes").doc(pacienteId).get();
  if (!snap.exists || snap.data().psi_id !== psiId) {
    throw new HttpsError("not-found", "Paciente não encontrado.");
  }
  const p = snap.data();

  const contato = contatoDoPaciente(p);
  if (!contato.email) {
    throw new HttpsError(
      "failed-precondition",
      "Não há e-mail para o envio. Preencha o e-mail do paciente ou o e-mail do responsável."
    );
  }

  const linkDefinirSenha = await auth.generatePasswordResetLink(p.email);

  let nomeClinica = "Sua clínica";
  let corMarca = "#7B00C4";
  try {
    const cfg = await db.collection("psi_config").doc(psiId).get();
    if (cfg.exists) {
      nomeClinica = cfg.data().nome || nomeClinica;
      corMarca = cfg.data().corPrimaria || corMarca;
    }
  } catch (e) {}

  const primeiroNomePaciente = (p.nome || "").split(" ")[0];
  const primeiroNomeContato = (contato.nome || "").split(" ")[0];
  const parentesco = contato.parentesco ? contato.parentesco.toLowerCase() : "responsável";

  const abertura = contato.ehResponsavel
    ? "Olá" + (primeiroNomeContato ? ", <strong>" + escHtml(primeiroNomeContato) + "</strong>" : "") + ". " +
      "Você, como " + escHtml(parentesco) + " do paciente <strong>" + escHtml(p.nome) + "</strong>, " +
      "está recebendo o acesso ao Portal do Paciente dele(a)."
    : "Olá, <strong>" + escHtml(primeiroNomePaciente) + "</strong>! Seu cadastro foi feito com sucesso.";

  const usuario = contato.ehResponsavel || p.emailInterno || !emailEhReal(p.email)
    ? "<p style='color:#444'>O <strong>usuário de acesso</strong> é: <strong>" + escHtml(p.email) + "</strong></p>"
    : "";

  const html =
    "<div style='font-family:Arial;background:#f5f3ff;padding:30px'><div style='max-width:520px;margin:0 auto;background:white;border-radius:16px;overflow:hidden'>" +
    "<div style='background:" + escHtml(corMarca) + ";padding:24px;text-align:center'><h1 style='color:white;font-size:20px;margin:0'>" + escHtml(nomeClinica) + "</h1></div>" +
    "<div style='padding:28px'>" +
    "<p style='color:#444'>" + abertura + "</p>" +
    "<p style='color:#444'>Para entrar, primeiro defina a senha pelo botão abaixo. Ninguém, nem a clínica, fica sabendo qual senha foi escolhida.</p>" +
    usuario +
    "<p style='text-align:center;margin:26px 0'><a href='" + linkDefinirSenha + "' style='background:" + escHtml(corMarca) + ";color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold'>Definir senha</a></p>" +
    "<p style='color:#888;font-size:12px'>Se o botão não abrir, copie este endereço no navegador:<br>" + escHtml(linkDefinirSenha) + "</p>" +
    "</div></div></div>";

  await db.collection("clinica_emails").add({
    to: contato.email,
    message: {
      subject: contato.ehResponsavel ? "Acesso ao portal de " + p.nome : "Defina sua senha de acesso",
      html,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection("clinica_audit_log").add({
    acao: "enviar_acesso_paciente",
    alvoUid: pacienteId,
    psiId,
    executadoPor: chamador.uid,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    ok: true,
    enviadoPara: contato.email,
    ehResponsavel: contato.ehResponsavel,
    nomeContato: contato.nome,
    linkDefinirSenha,
  };
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
// E-mail "de mentira": o Firebase Auth exige um e-mail único por conta, mas
// nem todo paciente tem o próprio (crianças, ou quem divide o e-mail com a
// mãe). Nesses casos o sistema cria um endereço interno só para o login, e
// os envios reais vão para o e-mail do responsável.
function emailEhReal(e) {
  return !!e && !/@interno\.local$/i.test(e) && !/^sem-?email/i.test(e);
}

// Decide para onde vai um envio por e-mail e como cumprimentar.
function contatoDoPaciente(p) {
  const emailResp = ((p && p.responsavelEmail) || "").trim();
  const usaResponsavel = !!emailResp && (p.usaContatoResponsavel || p.ehMenorDeIdade || !emailEhReal(p.email));
  if (usaResponsavel) {
    return {
      email: emailResp,
      ehResponsavel: true,
      nome: ((p.responsavelNome) || "").trim(),
      parentesco: ((p.responsavelParentesco) || "").trim(),
    };
  }
  if (emailEhReal(p && p.email)) {
    return { email: p.email, ehResponsavel: false, nome: (p.nome || "").trim(), parentesco: "" };
  }
  return { email: "", ehResponsavel: false, nome: ((p && p.nome) || "").trim(), parentesco: "" };
}

function escHtml(t) {
  return String(t == null ? "" : t)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// exigirEmail: o autocadastro público continua exigindo (o próprio paciente
// preenche). O cadastro feito pela equipe aceita paciente sem e-mail e gera
// o endereço interno.
function validarDadosPaciente(dados, { exigirEmail = true } = {}) {
  const nome = ((dados && dados.nome) || "").trim();
  let email = ((dados && dados.email) || "").trim();
  if (!nome) {
    throw new HttpsError("invalid-argument", "O nome do paciente é obrigatório.");
  }
  if (!email) {
    if (exigirEmail) {
      throw new HttpsError("invalid-argument", "Nome e e-mail do paciente são obrigatórios.");
    }
    email = "sem-email." + Date.now() + String(Math.floor(Math.random() * 900) + 100) + "@interno.local";
  }
  const texto = (v) => (typeof v === "string" ? v.trim() : "");
  return {
    nome,
    email,
    emailInterno: !emailEhReal(email),
    telefone: dados.telefone || "",
    dataNasc: dados.dataNasc || "",
    cpf: dados.cpf || "",
    genero: dados.genero || "",
    status: dados.status || "",
    empresa: dados.empresa || "",
    setor: dados.setor || "",
    cargo: dados.cargo || "",
    objetivos: dados.objetivos || "",
    ehMenorDeIdade: !!dados.ehMenorDeIdade,
    usaContatoResponsavel: !!dados.usaContatoResponsavel,
    telefoneEhDoResponsavel: !!dados.telefoneEhDoResponsavel,
    responsavelNome: texto(dados.responsavelNome),
    responsavelParentesco: texto(dados.responsavelParentesco),
    responsavelCpf: texto(dados.responsavelCpf),
    responsavelTelefone: texto(dados.responsavelTelefone),
    responsavelEmail: texto(dados.responsavelEmail),
    responsavel2Nome: texto(dados.responsavel2Nome),
    responsavel2Parentesco: texto(dados.responsavel2Parentesco),
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
// Sem a região explícita esta função ia para us-central1, enquanto o painel
// da matriz a chama em southamerica-east1 — a chamada nunca encontrava a função.
exports.cadastrarPsicologa = onCall({ region: "southamerica-east1" }, async (request) => {
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
// Mesma correção de região da cadastrarPsicologa: o painel da matriz chama
// em southamerica-east1, então a função precisa estar publicada lá.
exports.ativarDesativarClinica = onCall({ region: "southamerica-east1" }, async (request) => {
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
// 7) ATUALIZAR EVENTO — remarcação ou realização de sessão
// ─────────────────────────────────────────────────────────────
exports.atualizarEventoAgenda = onCall(
  { secrets: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET] },
  async (request) => {
    const chamador = request.auth;
    if (!chamador || !["psi", "secretaria"].includes(chamador.token.role)) {
      throw new HttpsError("permission-denied", "Só a equipe da clínica atualiza sessões.");
    }

    const { eventoGoogleId, titulo, inicio, fim, descricao } = request.data || {};
    if (!eventoGoogleId) {
      throw new HttpsError("invalid-argument", "eventoGoogleId é obrigatório.");
    }

    const oauth2Client = await obterClienteAutenticado(chamador.token.psi_id);
    const calendar = obterGoogle().calendar({ version: "v3", auth: oauth2Client });

    const patch = {};
    if (titulo !== undefined) patch.summary = titulo;
    if (descricao !== undefined) patch.description = descricao;
    if (inicio !== undefined) patch.start = { dateTime: inicio };
    if (fim !== undefined) patch.end = { dateTime: fim };

    await calendar.events.patch({
      calendarId: "primary",
      eventId: eventoGoogleId,
      requestBody: patch,
    });

    return { ok: true };
  }
);

// ─────────────────────────────────────────────────────────────
// 8) EXCLUIR EVENTO — ao deletar pacote/sessão
// ─────────────────────────────────────────────────────────────
exports.excluirEventoAgenda = onCall(
  { secrets: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET] },
  async (request) => {
    const chamador = request.auth;
    if (!chamador || !["psi", "secretaria"].includes(chamador.token.role)) {
      throw new HttpsError("permission-denied", "Só a equipe da clínica remove sessões.");
    }

    const { eventoGoogleId } = request.data || {};
    if (!eventoGoogleId) {
      throw new HttpsError("invalid-argument", "eventoGoogleId é obrigatório.");
    }

    const oauth2Client = await obterClienteAutenticado(chamador.token.psi_id);
    const calendar = obterGoogle().calendar({ version: "v3", auth: oauth2Client });

    try {
      await calendar.events.delete({ calendarId: "primary", eventId: eventoGoogleId });
    } catch (e) {
      // 404 = evento já foi removido manualmente — não é erro
      if (e?.status !== 404 && e?.code !== 404) throw e;
    }

    return { ok: true };
  }
);

// ─────────────────────────────────────────────────────────────
// 9) BUSCA POR SINTOMA (IA) — Recursos Terapêuticos
// ─────────────────────────────────────────────────────────────
// A psicóloga digita a queixa/sintoma da paciente e a IA escolhe, só
// entre os itens que já existem na biblioteca da clínica, quais fazem
// mais sentido indicar. A chave da Anthropic fica só aqui (Secret
// Manager) — nunca é exposta no navegador.
exports.buscarPorSintoma = onCall({ secrets: [GEMINI_API_KEY] }, async (request) => {
  const chamador = request.auth;
  if (!chamador) {
    throw new HttpsError("unauthenticated", "É preciso estar logado.");
  }

  const { sintoma, itens } = request.data || {};
  if (!sintoma || !Array.isArray(itens) || itens.length === 0) {
    throw new HttpsError("invalid-argument", "Envie o sintoma e a lista de itens da biblioteca.");
  }

  const chaveConfigurada = GEMINI_API_KEY.value();
  if (!chaveConfigurada || chaveConfigurada === "NAO_CONFIGURADA") {
    throw new HttpsError(
      "failed-precondition",
      "A busca por sintoma ainda não está ativada: falta cadastrar a chave do Gemini."
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
    // "gemini-flash-latest" é apelido que sempre aponta para o modelo atual;
    // versões fixas são aposentadas e quebram a função sem aviso.
    resposta = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + chaveConfigurada,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 4000,
            temperature: 0.2,
          },
        }),
      }
    );
  } catch (e) {
    throw new HttpsError("internal", "Não foi possível consultar a IA: " + e.message);
  }

  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new HttpsError("internal", dados?.error?.message || "Erro ao consultar a IA.");
  }

  let recomendacoes = [];
  try {
    const partes = dados?.candidates?.[0]?.content?.parts || [];
    const texto = partes.map((p) => p.text || "").join("").trim() || "{}";
    // Mesmo pedindo JSON puro, o modelo às vezes embrulha em bloco markdown.
    const limpo = texto.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const json = JSON.parse(limpo);
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

function montarEmailAniversarioPaciente({ primeiroNome, anos, nomeClinica, corMarca, logoUrl, responsavel }) {
  const nome = escHtml(primeiroNome);
  // Quando o envio vai para o responsável, o texto fala com ele sobre o paciente.
  const mensagem = responsavel
    ? "Olá" + (responsavel.primeiroNome ? ", <strong style='color:" + corMarca + "'>" + escHtml(responsavel.primeiroNome) + "</strong>" : "") +
      "! Hoje é o aniversário de <strong>" + nome + "</strong>. Desejamos a vocês um novo ciclo repleto de saúde, leveza e crescimento."
    : "Olá, <strong style='color:" + corMarca + "'>" + nome + "</strong>! Hoje é o seu dia! Que este novo ciclo seja repleto de saúde, leveza e crescimento.";
  return (
    "<div style='font-family:Arial;background:#f5e8ff;padding:30px'><div style='max-width:500px;margin:0 auto;background:white;border-radius:20px;overflow:hidden'>" +
    "<div style='background:" + corMarca + ";padding:30px;text-align:center'>" +
    (logoUrl ? "<img src='" + logoUrl + "' style='width:80px;height:80px;object-fit:contain;border-radius:50%'/>" : "") +
    "<h1 style='color:white;margin:10px 0'>" + (responsavel ? "Aniversário de " + nome : "Feliz Aniversário, " + nome + "!") + "</h1>" +
    (anos ? "<p style='color:rgba(255,255,255,0.85)'>" + anos + " anos</p>" : "") +
    "</div><div style='padding:30px'>" +
    "<p style='color:#444'>" + mensagem + "</p>" +
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
// ─────────────────────────────────────────────────────────────
// 7) ORGANIZAR ANOTAÇÃO DE SESSÃO TCC COM IA
// ─────────────────────────────────────────────────────────────
exports.organizarProntuarioIA = onCall(
  { region: "southamerica-east1", secrets: [GEMINI_API_KEY] },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Acesso negado.");
    const { textoBruto, pacienteNome, dataSessao, perfilClinico } = request.data || {};
    if (!textoBruto || !textoBruto.trim()) {
      throw new HttpsError("invalid-argument", "Texto da sessão é obrigatório.");
    }

    const chave = GEMINI_API_KEY.value();
    if (!chave || chave === "NAO_CONFIGURADA") {
      throw new HttpsError("failed-precondition", "Chave do Gemini não configurada.");
    }

    const prompt =
      "Você é uma psicóloga especialista em Terapia Cognitivo-Comportamental (TCC).\n" +
      "Organize as anotações brutas da sessão abaixo no formato de prontuário TCC.\n" +
      "Retorne SOMENTE um JSON válido, sem markdown, sem explicações extras, com as seguintes chaves:\n" +
      "humor, agenda, pensamentosAutomaticos, crencas, tecnicas, tarefas, observacoes.\n\n" +
      "O campo 'tarefas' tem formato especial: é enviado ao paciente por mensagem, então deve ser\n" +
      "uma lista numerada, uma tarefa por linha, começando em '1- ', escrita em linguagem simples e\n" +
      "direta, dirigida ao paciente. Exemplo:\n" +
      "1- Fazer caminhada duas vezes na semana\n" +
      "2- Tomar um banho relaxante antes de dormir\n" +
      "Se não houver tarefa alguma na sessão, devolva o campo 'tarefas' como string vazia.\n\n" +
      "Paciente: " + (pacienteNome || "não informado") + "\n" +
      "Data: " + (dataSessao || "não informada") + "\n" +
      (perfilClinico && String(perfilClinico).trim()
        ? "Contexto clínico já cadastrado (CID, condições e medicações; use só como contexto, não repita nas seções): " +
          String(perfilClinico).trim().slice(0, 1500) + "\n"
        : "") +
      "\nAnotações brutas:\n" + textoBruto.trim();

    let resp;
    try {
      // responseMimeType força JSON puro na resposta, então não é preciso
      // limpar blocos markdown como era necessário com a API anterior.
      // "gemini-flash-latest" é apelido que sempre aponta para o modelo atual.
      // Versões fixas vão sendo aposentadas e quebram a função sem aviso.
      resp = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + chave,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              // Folga porque o modelo gasta tokens "pensando" antes de responder.
              maxOutputTokens: 4000,
              temperature: 0.2,
            },
          }),
        }
      );
    } catch (fetchErr) {
      console.error("organizarProntuarioIA fetch error:", fetchErr);
      throw new HttpsError("internal", "Falha ao conectar com a API de IA: " + fetchErr.message);
    }

    if (!resp.ok) {
      const errTxt = await resp.text();
      console.error("organizarProntuarioIA API error:", resp.status, errTxt.slice(0, 500));
      throw new HttpsError("internal", "Erro na API de IA (" + resp.status + "): " + errTxt.slice(0, 150));
    }

    const dados = await resp.json();
    const partes = dados.candidates?.[0]?.content?.parts || [];
    // O modelo pode devolver várias partes (raciocínio + resposta); juntamos todas.
    const texto = partes.map((p) => p.text || "").join("").trim();

    // Mesmo pedindo JSON puro, o modelo às vezes embrulha em bloco markdown.
    const jsonLimpo = texto.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    try {
      const tcc = JSON.parse(jsonLimpo);
      return { tcc };
    } catch (parseErr) {
      console.error("organizarProntuarioIA parse error:", parseErr, "texto:", texto.slice(0, 300));
      throw new HttpsError("internal", "Resposta da IA fora do formato JSON. Tente novamente.");
    }
  }
);

// ─────────────────────────────────────────────────────────────
// 8) ORGANIZAR PERFIL CLÍNICO (CID, CONDIÇÕES, MEDICAÇÕES) COM IA
// A psicóloga dita em texto livre; a IA devolve a lista estruturada
// para ela revisar antes de salvar. Nada é gravado aqui.
// ─────────────────────────────────────────────────────────────
exports.organizarPerfilClinicoIA = onCall(
  { region: "southamerica-east1", secrets: [GEMINI_API_KEY] },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Acesso negado.");
    const papel = request.auth.token.role;
    if (papel !== "psi" && papel !== "secretaria") throw new HttpsError("permission-denied", "Sem permissão.");
    const { texto } = request.data || {};
    if (!texto || !String(texto).trim()) {
      throw new HttpsError("invalid-argument", "Escreva ou dite as informações antes de organizar.");
    }
    const chave = GEMINI_API_KEY.value();
    if (!chave || chave === "NAO_CONFIGURADA") {
      throw new HttpsError("failed-precondition", "Chave do Gemini não configurada.");
    }

    const prompt =
      "Você auxilia uma psicóloga a registrar o perfil clínico de um paciente.\n" +
      "Do texto abaixo, extraia APENAS o que foi dito, sem inventar nada.\n" +
      "Retorne SOMENTE um JSON válido, sem markdown, com as chaves:\n" +
      "cids: lista de { codigo, descricao } (diagnósticos; 'codigo' é o código CID-10 ou CID-11 se foi dito ou se o\n" +
      "diagnóstico tem código inequívoco; caso contrário deixe 'codigo' vazio e preencha só a descrição);\n" +
      "condicoes: lista de textos curtos (outras doenças ou condições, ex.: hipertensão, TDAH sem laudo);\n" +
      "medicacoes: lista de { nome, dose } (dose vazia se não informada).\n" +
      "Listas vazias quando não houver nada. Português do Brasil, com acentos.\n\n" +
      "Texto:\n" + String(texto).trim().slice(0, 3000);

    let resp;
    try {
      resp = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + chave,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", maxOutputTokens: 3000, temperature: 0.1 },
          }),
        }
      );
    } catch (fetchErr) {
      console.error("organizarPerfilClinicoIA fetch error:", fetchErr);
      throw new HttpsError("internal", "Falha ao conectar com a API de IA.");
    }
    if (!resp.ok) {
      const errTxt = await resp.text();
      console.error("organizarPerfilClinicoIA API error:", resp.status, errTxt.slice(0, 300));
      throw new HttpsError("internal", "Erro na API de IA (" + resp.status + ").");
    }
    const dados = await resp.json();
    const partes = dados.candidates?.[0]?.content?.parts || [];
    const bruto = partes.map((p) => p.text || "").join("").trim()
      .replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    let obj;
    try { obj = JSON.parse(bruto); } catch (e) {
      throw new HttpsError("internal", "Resposta da IA fora do formato. Tente novamente.");
    }
    const txt = (v, max) => String(v == null ? "" : v).trim().slice(0, max);
    const lista = (v) => (Array.isArray(v) ? v : []);
    return {
      cids: lista(obj.cids).slice(0, 20).map((c) => ({ codigo: txt(c && c.codigo, 12), descricao: txt(c && c.descricao, 150) })).filter((c) => c.codigo || c.descricao),
      condicoes: lista(obj.condicoes).slice(0, 30).map((c) => txt(typeof c === "string" ? c : c && c.nome, 150)).filter(Boolean),
      medicacoes: lista(obj.medicacoes).slice(0, 30).map((m) => ({ nome: txt(m && m.nome, 100), dose: txt(m && m.dose, 80) })).filter((m) => m.nome),
    };
  }
);

// ─────────────────────────────────────────────────────────────
// 9) RESUMO DO PERÍODO PARA RELATÓRIO RESUMIDO (envio a terceiros)
// Recebe as anotações do período e devolve um texto sóbrio para a
// psicóloga revisar. Nada é gravado aqui.
// ─────────────────────────────────────────────────────────────
exports.resumirPeriodoIA = onCall(
  { region: "southamerica-east1", secrets: [GEMINI_API_KEY] },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Acesso negado.");
    const papel = request.auth.token.role;
    if (papel !== "psi" && papel !== "secretaria") throw new HttpsError("permission-denied", "Sem permissão.");
    const { notas, pacienteNome, periodo, finalidade } = request.data || {};
    if (!Array.isArray(notas) || notas.length === 0) {
      throw new HttpsError("invalid-argument", "Não há anotações no período para resumir.");
    }
    const chave = GEMINI_API_KEY.value();
    if (!chave || chave === "NAO_CONFIGURADA") {
      throw new HttpsError("failed-precondition", "Chave do Gemini não configurada.");
    }

    const campos = ["humor", "agenda", "pensamentosAutomaticos", "crencas", "tecnicas", "observacoes"];
    const corte = (v) => String(v == null ? "" : v).trim().slice(0, 700);
    const blocos = notas.slice(0, 60).map((n) => {
      const tcc = n.tcc || {};
      const linhas = campos.filter((c) => corte(tcc[c])).map((c) => c + ": " + corte(tcc[c]));
      return "Sessão de " + corte(n.data) + "\n" + linhas.join("\n");
    });

    const prompt =
      "Você auxilia uma psicóloga a redigir um RELATÓRIO PSICOLÓGICO RESUMIDO, que poderá ser entregue a terceiros\n" +
      "(médico, escola, convênio) se solicitado. Com base nas anotações das sessões abaixo, escreva o resumo do período.\n" +
      "Regras:\n" +
      "- Português do Brasil, com acentos, em terceira pessoa, tom técnico, sóbrio e respeitoso.\n" +
      "- De 150 a 250 palavras, em 2 a 4 parágrafos curtos, sem listas e sem títulos.\n" +
      "- Descreva de forma geral: demandas e temas trabalhados, evolução observada, abordagem/técnicas e perspectivas.\n" +
      "- NÃO inclua detalhes íntimos, falas literais, nomes de terceiros, diagnósticos que não estejam nas anotações nem previsões.\n" +
      "- NÃO invente nada que não conste nas anotações.\n" +
      "Retorne SOMENTE um JSON válido: { \"resumo\": \"texto\" }.\n\n" +
      "Paciente: " + corte(pacienteNome) + "\n" +
      "Período: " + corte(periodo) + "\n" +
      (finalidade && String(finalidade).trim() ? "Finalidade do relatório: " + corte(finalidade) + "\n" : "") +
      "\nAnotações:\n" + blocos.join("\n\n");

    let resp;
    try {
      resp = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + chave,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4000, temperature: 0.3 },
          }),
        }
      );
    } catch (fetchErr) {
      console.error("resumirPeriodoIA fetch error:", fetchErr);
      throw new HttpsError("internal", "Falha ao conectar com a API de IA.");
    }
    if (!resp.ok) {
      const errTxt = await resp.text();
      console.error("resumirPeriodoIA API error:", resp.status, errTxt.slice(0, 300));
      throw new HttpsError("internal", "Erro na API de IA (" + resp.status + ").");
    }
    const dados = await resp.json();
    const partes = dados.candidates?.[0]?.content?.parts || [];
    const bruto = partes.map((p) => p.text || "").join("").trim()
      .replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    let obj;
    try { obj = JSON.parse(bruto); } catch (e) {
      throw new HttpsError("internal", "Resposta da IA fora do formato. Tente novamente.");
    }
    const resumo = String(obj.resumo || "").trim();
    if (!resumo) throw new HttpsError("internal", "A IA não devolveu o resumo. Tente novamente.");
    return { resumo };
  }
);

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
        const contato = contatoDoPaciente(p);
        if (!contato.email) continue;
        const primeiroNome = (p.nome || "").split(" ")[0];
        const anos = hoje.getFullYear() - parseInt(p.dataNasc.slice(0, 4), 10);
        const responsavel = contato.ehResponsavel
          ? { primeiroNome: (contato.nome || "").split(" ")[0], parentesco: contato.parentesco }
          : null;
        await db.collection("clinica_emails").add({
          to: contato.email,
          message: {
            subject: responsavel ? "Hoje é aniversário de " + primeiroNome + "!" : "Feliz Aniversário, " + primeiroNome + "!",
            html: montarEmailAniversarioPaciente({ primeiroNome, anos, nomeClinica, corMarca, logoUrl, responsavel }),
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
              return "<li><strong>" + p.nome + "</strong> — " + anosP + " anos · " + (contatoDoPaciente(p).email || "sem e-mail de contato") + "</li>";
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
