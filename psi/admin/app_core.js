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

// Descobre de qual clínica é quem está logando ANTES do login (o
// custom claim só existe depois de autenticar) — do parâmetro ?psi=
// na URL ou, se já logou aqui antes, do que ficou guardado no
// navegador. Mesmo mecanismo usado no Portal do Paciente.
function pegarPsiIdConhecido() {
  const daUrl = new URLSearchParams(window.location.search).get("psi");
  if (daUrl) return daUrl;
  try { return localStorage.getItem("psicoworking_psi_id") || ""; } catch (e) { return ""; }
}

function usarConfiguracaoPreLogin(psiId) {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    if (!psiId) return;
    db.collection("psi_config").doc(psiId).get().then((doc) => {
      if (doc.exists) {
        const dados = doc.data();
        setConfig(dados);
        aplicarCorMarca(dados.corPrimaria);
      }
    }).catch(() => {});
  }, [psiId]);
  return config;
}

// ─── Cor da marca de cada clínica ────────────────────────────────
// psi_config só guarda UMA cor (corPrimaria) — as variações mais
// clara/escura usadas nos degradês (barra lateral, tela de login) são
// calculadas a partir dela, pra tudo ficar de fato na identidade
// visual da psicóloga, não só o botão sólido.
function ajustarClaridadeCor(hex, percentual) {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) & 0xff, g = (num >> 8) & 0xff, b = num & 0xff;
  const ajustar = (canal) => (percentual >= 0 ? canal + (255 - canal) * (percentual / 100) : canal * (1 + percentual / 100));
  r = Math.min(255, Math.max(0, Math.round(ajustar(r))));
  g = Math.min(255, Math.max(0, Math.round(ajustar(g))));
  b = Math.min(255, Math.max(0, Math.round(ajustar(b))));
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function aplicarCorMarca(corPrimaria) {
  if (!corPrimaria) return;
  document.documentElement.style.setProperty("--cor-marca", corPrimaria);
  document.documentElement.style.setProperty("--cor-marca-clara", ajustarClaridadeCor(corPrimaria, 35));
  document.documentElement.style.setProperty("--cor-marca-escura", ajustarClaridadeCor(corPrimaria, -45));
}

// ─── Tela de Login ─────────────────────────────────────────────
function TelaLogin({ configClinica }) {
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

  const temMarca = configClinica && (configClinica.nome || configClinica.logoUrl || configClinica.fotoUrl);

  return (
    <div className="tela-login-split">
      <div className="painel-marca">
        <div className="painel-marca-conteudo">
          <span className="etiqueta-tipo-portal">Painel da Psicóloga</span>
          {temMarca && (
            <div className="marca-clinica-login">
              <div className="foto-profissional-login-caixa">
                {configClinica.fotoUrl ? (
                  <img src={configClinica.fotoUrl} alt={configClinica.nome} className="foto-profissional-login" />
                ) : (
                  <div className="avatar-clinica-login">{(configClinica.nome || "?").trim().charAt(0).toUpperCase()}</div>
                )}
                {configClinica.logoUrl && <img src={configClinica.logoUrl} alt="Logo" className="selo-logo-login" />}
              </div>
              <span className="nome-clinica-login">{configClinica.nome}</span>
            </div>
          )}
          <h1 style={{ marginTop: temMarca ? 16 : 0 }}>Bem-vinda(o) de volta</h1>
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

// ─── Campo de texto com ditado por voz (mesmo padrão do sistema
// já usado pela Dra. Lucia) — usa a Web Speech API do navegador. ────
function TextAreaVoz({ value, onChange, className, rows, placeholder }) {
  const [gravando, setGravando] = useState(false);
  const reconhecimentoRef = useRef(null);
  const temSuporte = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  function alternarGravacao() {
    if (gravando) {
      reconhecimentoRef.current?.stop();
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let textoNovo = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) textoNovo += e.results[i][0].transcript;
      }
      if (textoNovo) {
        onChange({ target: { value: (value ? value + " " : "") + textoNovo } });
      }
    };
    rec.onend = () => setGravando(false);
    rec.start();
    reconhecimentoRef.current = rec;
    setGravando(true);
  }

  return (
    <div className="campo-com-mic">
      <textarea
        className={className}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {temSuporte && (
        <button
          type="button"
          className={"botao-mic" + (gravando ? " botao-mic-gravando" : "")}
          onClick={alternarGravacao}
          title="Falar em vez de digitar"
        >
          <Icone nome={gravando ? "square" : "mic"} tamanho={14} />
        </button>
      )}
    </div>
  );
}
