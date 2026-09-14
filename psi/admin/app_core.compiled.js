// ═══════════════════════════════════════════════════════════════
//  app_core.js — Firebase config, Login, contexto psi_id
//  Segura TODAS as declarações globais — os módulos seguintes
//  (app_pacientes.js, app_agenda.js, etc.) NÃO redeclaram
//  useState/useEffect/db, apenas usam o que está definido aqui.
// ═══════════════════════════════════════════════════════════════

const {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} = React;

// Chaves do projeto Firebase "psicoworking". Não são segredo — a
// proteção de verdade está nas Firestore Rules e nas Cloud Functions
// (ver CLAUDE.md, seção Segurança). Nunca colocar aqui client secret
// do Google Calendar nem chave de service account — essas ficam só
// em Secret Manager, do lado das Cloud Functions.
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
const functions = firebase.functions();

// ─── Cloud Functions usadas pelo admin ────────────────────────────
const chamarCadastrarPaciente = functions.httpsCallable("cadastrarPaciente");
const chamarDefinirCarimboEquipe = functions.httpsCallable("definirCarimboEquipe");

// ─── Login (Firebase Authentication — ver CLAUDE.md REGRA 9) ─────
// Nunca comparar senha manualmente contra um campo do Firestore.
async function loginComEmailSenha(email, senha) {
  const credencial = await auth.signInWithEmailAndPassword(email, senha);
  return credencial.user;
}
async function logout() {
  await auth.signOut();
}

// ─── Contexto do usuário logado (psi_id + role vêm do token) ────
// O token carrega os custom claims definidos pela Cloud Function
// (definirCarimboEquipe / cadastrarPaciente) — nunca de um campo
// que o próprio cliente escreveria.
function useUsuarioLogado() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    const cancelar = auth.onAuthStateChanged(async usuarioFirebase => {
      if (!usuarioFirebase) {
        setUsuario(null);
        setCarregando(false);
        return;
      }
      const resultadoToken = await usuarioFirebase.getIdTokenResult(true);
      setUsuario({
        uid: usuarioFirebase.uid,
        email: usuarioFirebase.email,
        psiId: resultadoToken.claims.psi_id || null,
        role: resultadoToken.claims.role || null
      });
      setCarregando(false);
    });
    return cancelar;
  }, []);
  return {
    usuario,
    carregando
  };
}

// ─── Tela de Login ─────────────────────────────────────────────
function TelaLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await loginComEmailSenha(email, senha);
    } catch (e) {
      setErro("E-mail ou senha incorretos.");
    } finally {
      setEnviando(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "tela-login-split"
  }, /*#__PURE__*/React.createElement("div", {
    className: "painel-marca"
  }, /*#__PURE__*/React.createElement("div", {
    className: "painel-marca-conteudo"
  }, /*#__PURE__*/React.createElement("h1", null, "PsiCoWorking"), /*#__PURE__*/React.createElement("p", null, "A plataforma completa para organizar sua cl\xEDnica de psicologia."))), /*#__PURE__*/React.createElement("div", {
    className: "painel-formulario"
  }, /*#__PURE__*/React.createElement("form", {
    className: "cartao-login",
    onSubmit: aoEnviar
  }, /*#__PURE__*/React.createElement("h2", null, "Entrar"), /*#__PURE__*/React.createElement("p", {
    className: "subtitulo"
  }, "Acesse o painel da sua cl\xEDnica"), /*#__PURE__*/React.createElement("label", null, "E-mail"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    required: true
  }), /*#__PURE__*/React.createElement("label", null, "Senha"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: senha,
    onChange: e => setSenha(e.target.value),
    required: true
  }), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: enviando
  }, enviando ? "Entrando..." : "Entrar"))));
}