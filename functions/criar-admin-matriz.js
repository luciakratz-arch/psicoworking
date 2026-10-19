// Script de uso único — roda localmente com Firebase Admin SDK.
// Cria (ou encontra) a conta contato@luciakratz.com.br e
// concede o papel admin_matriz via custom claim.
// Executar: node criar-admin-matriz.js

const admin = require("firebase-admin");

// Usa as credenciais já configuradas pelo firebase login
// (Application Default Credentials via gcloud/firebase CLI)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "psicoworking",
});

const EMAIL = "contato@luciakratz.com.br";

async function main() {
  const auth = admin.auth();

  // 1) Busca ou cria a conta
  let usuario;
  try {
    usuario = await auth.getUserByEmail(EMAIL);
    console.log("Conta já existe. UID:", usuario.uid);
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      usuario = await auth.createUser({ email: EMAIL, displayName: "Admin Matriz" });
      console.log("Conta criada. UID:", usuario.uid);
    } else {
      throw e;
    }
  }

  // 2) Concede o papel admin_matriz
  await auth.setCustomUserClaims(usuario.uid, { role: "admin_matriz" });
  console.log("Papel admin_matriz concedido.");

  // 3) Gera link de redefinição de senha
  const link = await auth.generatePasswordResetLink(EMAIL);
  console.log("\n✅ Pronto!\n");
  console.log("Acesse o link abaixo para definir sua senha:");
  console.log(link);
  console.log("\nDepois faça login em: https://psicoworking.web.app/psi/matriz/");

  process.exit(0);
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
