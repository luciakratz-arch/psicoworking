// ═══════════════════════════════════════════════════════════════
//  app_core.js — Firebase config, Login, contexto psi_id
//  Segura TODAS as declarações globais — os módulos seguintes
//  (app_pacientes.js, app_agenda.js, etc.) NÃO redeclaram
//  useState/useEffect/db, apenas usam o que está definido aqui.
// ═══════════════════════════════════════════════════════════════

const { useState, useEffect, useCallback, useRef, useMemo } = React;

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
    const cancelar = auth.onAuthStateChanged(async (usuarioFirebase) => {
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
        role: resultadoToken.claims.role || null,
      });
      setCarregando(false);
    });
    return cancelar;
  }, []);

  return { usuario, carregando };
}

// ─── Tela de Login ─────────────────────────────────────────────
function TelaLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState("");

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

  async function aoEsquecerSenha() {
    setErro("");
    setMensagemRecuperacao("");
    if (!email) {
      setErro("Digite seu e-mail acima primeiro, depois clique em \"Esqueci minha senha\".");
      return;
    }
    try {
      await auth.sendPasswordResetEmail(email);
      setMensagemRecuperacao("Enviamos um e-mail para " + email + " com um link para você criar uma senha nova. Confira também a caixa de spam.");
    } catch (e) {
      setErro("Não foi possível enviar o e-mail de recuperação.");
    }
  }

  return (
    <div className="tela-login-split">
      <div className="painel-marca">
        <div className="painel-marca-conteudo">
          {/* Este espaço em destaque é reservado para o nome/logo de
              CADA psicóloga (via psi_config, ainda não construído).
              Por enquanto mostra um texto de boas-vindas neutro. */}
          <h1>Bem-vinda(o) de volta</h1>
          <p>Acesse o painel e continue de onde parou.</p>
        </div>
      </div>

      <div className="painel-formulario">
        <form className="cartao-login" onSubmit={aoEnviar}>
          <div className="logo-plataforma">PsiCoWorking</div>
          <h2>Entrar</h2>
          <p className="subtitulo">Acesse o painel da sua clínica</p>

          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {erro && <p className="mensagem-erro">{erro}</p>}
          {mensagemRecuperacao && <p className="mensagem-sucesso">{mensagemRecuperacao}</p>}

          <button type="submit" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>

          <button type="button" className="link-esqueci-senha" onClick={aoEsquecerSenha}>
            Esqueci minha senha
          </button>
        </form>
      </div>
    </div>
  );
}
