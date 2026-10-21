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

// Nome próprio do app (não "[DEFAULT]") — evita que o login daqui
// (equipe da clínica) e o login do Portal do Paciente (mesmo projeto
// Firebase, mesma origem) disputem a mesma sessão salva no navegador.
// Sem isso, entrar como paciente numa aba podia "roubar" a sessão da
// psicóloga logada em outra aba do mesmo navegador.
const appAdmin = firebase.apps.find(a => a.name === "psicoworking-admin") || firebase.initializeApp(firebaseConfig, "psicoworking-admin");
const auth = appAdmin.auth();
const db = appAdmin.firestore();
const functions = appAdmin.functions();

// ─── Cloud Functions usadas pelo admin ────────────────────────────
const chamarCadastrarPaciente = functions.httpsCallable("cadastrarPaciente");
const chamarDefinirCarimboEquipe = functions.httpsCallable("definirCarimboEquipe");
// Publicada em southamerica-east1 (as demais ficam na região padrão).
const chamarEnviarAcessoPaciente = appAdmin.functions("southamerica-east1").httpsCallable("enviarAcessoPaciente");

// ─── Contato do paciente ─────────────────────────────────────────
// Nem todo paciente tem e-mail ou telefone próprios: criança, ou quem
// divide o e-mail com a mãe. O e-mail do cadastro pode ser um endereço
// interno (sem-email...@interno.local), que serve só para o login. Estes
// ajudantes decidem para quem vai cada envio e como cumprimentar.
// (Espelha contatoDoPaciente / emailEhReal de functions/index.js.)
function emailEhReal(e) {
  return !!e && !/@interno\.local$/i.test(e) && !/^sem-?email/i.test(e);
}
function primeiroNomeDe(n) {
  return (n || "").trim().split(/\s+/)[0] || "";
}
function contatoDoPaciente(p) {
  const emailResp = (p && p.responsavelEmail || "").trim();
  const usaResp = !!emailResp && (p.usaContatoResponsavel || p.ehMenorDeIdade || !emailEhReal(p.email));
  if (usaResp) {
    return {
      email: emailResp,
      ehResponsavel: true,
      nome: (p.responsavelNome || "").trim(),
      parentesco: (p.responsavelParentesco || "").trim()
    };
  }
  if (emailEhReal(p && p.email)) {
    return {
      email: p.email,
      ehResponsavel: false,
      nome: (p.nome || "").trim(),
      parentesco: ""
    };
  }
  return {
    email: "",
    ehResponsavel: false,
    nome: (p && p.nome || "").trim(),
    parentesco: ""
  };
}

// Qual WhatsApp usar e com quem se está falando. Se o telefone cadastrado
// é do responsável (marcação explícita), ou se o paciente não tem telefone
// mas o responsável tem, cumprimenta o responsável e cita o paciente.
function whatsappDoPaciente(p) {
  const fonePaciente = (p && p.telefone || "").replace(/\D/g, "");
  const foneResp = (p && p.responsavelTelefone || "").replace(/\D/g, "");
  const respNome = (p && p.responsavelNome || "").trim();
  if (p && p.telefoneEhDoResponsavel && (fonePaciente || foneResp)) {
    return {
      numero: fonePaciente || foneResp,
      ehResponsavel: true,
      nome: respNome,
      parentesco: (p.responsavelParentesco || "").trim()
    };
  }
  if (!fonePaciente && foneResp) {
    return {
      numero: foneResp,
      ehResponsavel: true,
      nome: respNome,
      parentesco: (p.responsavelParentesco || "").trim()
    };
  }
  return {
    numero: fonePaciente,
    ehResponsavel: false,
    nome: (p && p.nome || "").trim(),
    parentesco: ""
  };
}

// ─── Abertura do prontuário por link (vindo do sistema antigo da clínica) ───
// O botão "Prontuário TCC" do sistema antigo abre este admin com parâmetros
// (?prontuario=1&idAntigo=...&data=...&sessao=...). O pedido é lido uma vez,
// guardado na sessão do navegador (sobrevive ao login) e a URL é limpa. Não
// cria sessão, pacote nem evento na agenda: só abre a anotação.
const acaoPorLink = function () {
  try {
    let bruto = null;
    const q = new URLSearchParams(window.location.search);
    if (q.get("prontuario") === "1") {
      bruto = {
        idAntigo: q.get("idAntigo") || "",
        email: (q.get("email") || "").trim().toLowerCase(),
        nome: q.get("nome") || "",
        data: q.get("data") || "",
        hora: q.get("hora") || "",
        sessao: q.get("sessao") || "",
        pacote: q.get("pacote") || ""
      };
      sessionStorage.setItem("psw_acao_link", JSON.stringify(bruto));
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      const guardado = sessionStorage.getItem("psw_acao_link");
      if (guardado) bruto = JSON.parse(guardado);
    }
    if (!bruto || !bruto.sessao) return null;
    return Object.assign(bruto, {
      pacienteId: null,
      consumida: false
    });
  } catch (e) {
    return null;
  }
}();
function acaoPorLinkPendente() {
  return !!acaoPorLink && !acaoPorLink.consumida;
}
function encerrarAcaoPorLink() {
  if (acaoPorLink) acaoPorLink.consumida = true;
  try {
    sessionStorage.removeItem("psw_acao_link");
  } catch (e) {}
}
function normalizarNome(s) {
  return String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
}

// Acha o paciente do link. Nunca adivinha: com mais de um candidato (ou
// nenhum), devolve o motivo em vez de escolher.
function acharPacienteDoLink(pacientes, a) {
  const porId = a.idAntigo ? pacientes.filter(p => p.idAntigo === a.idAntigo) : [];
  if (porId.length === 1) return {
    paciente: porId[0]
  };
  if (porId.length > 1) return {
    erro: "há mais de um cadastro ligado a esse paciente"
  };
  const nomeLink = normalizarNome(a.nome);
  const porEmailNome = pacientes.filter(p => a.email && String(p.email || "").toLowerCase() === a.email && normalizarNome(p.nome) === nomeLink);
  if (porEmailNome.length === 1) return {
    paciente: porEmailNome[0]
  };
  const porNome = nomeLink ? pacientes.filter(p => normalizarNome(p.nome) === nomeLink) : [];
  if (porNome.length === 1) return {
    paciente: porNome[0]
  };
  if (porNome.length > 1 || porEmailNome.length > 1) return {
    erro: "há mais de um paciente com esse nome"
  };
  return {
    erro: "o paciente não está cadastrado"
  };
}

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

// Descobre de qual clínica é quem está logando ANTES do login (o
// custom claim só existe depois de autenticar) — do parâmetro ?psi=
// na URL ou, se já logou aqui antes, do que ficou guardado no
// navegador. Mesmo mecanismo usado no Portal do Paciente.
function pegarPsiIdConhecido() {
  const daUrl = new URLSearchParams(window.location.search).get("psi");
  if (daUrl) return daUrl;
  try {
    return localStorage.getItem("psicoworking_psi_id") || "";
  } catch (e) {
    return "";
  }
}
function usarConfiguracaoPreLogin(psiId) {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    if (!psiId) return;
    db.collection("psi_config").doc(psiId).get().then(doc => {
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
  let r = num >> 16 & 0xff,
    g = num >> 8 & 0xff,
    b = num & 0xff;
  const ajustar = canal => percentual >= 0 ? canal + (255 - canal) * (percentual / 100) : canal * (1 + percentual / 100);
  r = Math.min(255, Math.max(0, Math.round(ajustar(r))));
  g = Math.min(255, Math.max(0, Math.round(ajustar(g))));
  b = Math.min(255, Math.max(0, Math.round(ajustar(b))));
  return "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");
}
function aplicarCorMarca(corPrimaria) {
  if (!corPrimaria) return;
  document.documentElement.style.setProperty("--cor-marca", corPrimaria);
  document.documentElement.style.setProperty("--cor-marca-clara", ajustarClaridadeCor(corPrimaria, 35));
  document.documentElement.style.setProperty("--cor-marca-escura", ajustarClaridadeCor(corPrimaria, -45));
}

// ─── Tela de Login ─────────────────────────────────────────────
function TelaLogin({
  configClinica
}) {
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
  return /*#__PURE__*/React.createElement("div", {
    className: "tela-login-split"
  }, /*#__PURE__*/React.createElement("div", {
    className: "painel-marca"
  }, /*#__PURE__*/React.createElement("div", {
    className: "painel-marca-conteudo"
  }, /*#__PURE__*/React.createElement("span", {
    className: "etiqueta-tipo-portal"
  }, "Painel da Psic\xF3loga"), temMarca && /*#__PURE__*/React.createElement("div", {
    className: "marca-clinica-login"
  }, /*#__PURE__*/React.createElement("div", {
    className: "foto-profissional-login-caixa"
  }, configClinica.fotoUrl ? /*#__PURE__*/React.createElement("img", {
    src: configClinica.fotoUrl,
    alt: configClinica.nome,
    className: "foto-profissional-login"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "avatar-clinica-login"
  }, (configClinica.nome || "?").trim().charAt(0).toUpperCase()), configClinica.logoUrl && /*#__PURE__*/React.createElement("img", {
    src: configClinica.logoUrl,
    alt: "Logo",
    className: "selo-logo-login"
  })), /*#__PURE__*/React.createElement("span", {
    className: "nome-clinica-login"
  }, configClinica.nome)), /*#__PURE__*/React.createElement("h1", {
    style: {
      marginTop: temMarca ? 16 : 0
    }
  }, "Bem-vinda(o) de volta"), /*#__PURE__*/React.createElement("p", null, "Acesse o painel e continue de onde parou."))), /*#__PURE__*/React.createElement("div", {
    className: "painel-formulario"
  }, /*#__PURE__*/React.createElement("form", {
    className: "cartao-login",
    onSubmit: aoEnviar
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo-plataforma"
  }, "PsiCoWorking"), /*#__PURE__*/React.createElement("h2", null, "Entrar"), /*#__PURE__*/React.createElement("p", {
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
  }, erro), mensagemRecuperacao && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-sucesso"
  }, mensagemRecuperacao), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: enviando
  }, enviando ? "Entrando..." : "Entrar"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "link-esqueci-senha",
    onClick: aoEsquecerSenha
  }, "Esqueci minha senha"))));
}

// ─── Campo de texto com ditado por voz (mesmo padrão do sistema
// já usado pela Dra. Lucia) — usa a Web Speech API do navegador. ────
function TextAreaVoz({
  value,
  onChange,
  className,
  rows,
  placeholder
}) {
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
    rec.onresult = e => {
      let textoNovo = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) textoNovo += e.results[i][0].transcript;
      }
      if (textoNovo) {
        onChange({
          target: {
            value: (value ? value + " " : "") + textoNovo
          }
        });
      }
    };
    rec.onend = () => setGravando(false);
    rec.start();
    reconhecimentoRef.current = rec;
    setGravando(true);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "campo-com-mic"
  }, /*#__PURE__*/React.createElement("textarea", {
    className: className,
    rows: rows,
    placeholder: placeholder,
    value: value,
    onChange: onChange
  }), temSuporte && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-mic" + (gravando ? " botao-mic-gravando" : ""),
    onClick: alternarGravacao,
    title: "Falar em vez de digitar"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: gravando ? "square" : "mic",
    tamanho: 14
  })));
}