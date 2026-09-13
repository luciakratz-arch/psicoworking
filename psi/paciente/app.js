// ═══════════════════════════════════════════════════════════════
//  Portal do Paciente — app.js (Babel CDN inline, não precisa compilar)
// ═══════════════════════════════════════════════════════════════

const { useState, useEffect } = React;

// Mesmas chaves do projeto "psicoworking" — ver psi/admin/app_core.js
const firebaseConfig = {
  apiKey: "AIzaSyCJx1RwX5-FM2wcUqzeC_CYAUdkmTKU2u4",
  authDomain: "psicoworking.firebaseapp.com",
  projectId: "psicoworking",
  storageBucket: "psicoworking.firebasestorage.app",
  messagingSenderId: "176262015536",
  appId: "1:176262015536:web:4c72df01b83ba6f6995bf5"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Login do paciente: sempre Firebase Authentication (e-mail + senha
// que o próprio paciente definiu por link) — nunca autocomplete de
// nome comparado contra senha guardada em documento do Firestore.
async function loginPaciente(email, senha) {
  const credencial = await auth.signInWithEmailAndPassword(email, senha);
  return credencial.user;
}

// TODO: telas do portal (Meu Painel, Check-in Diário, Minhas Metas,
// Diário Terapêutico, Recursos, Avaliar) — próximas etapas, uma de
// cada vez, com esboço aprovado antes de codificar (CLAUDE.md REGRA 7).
