// ═══════════════════════════════════════════════════════════════
//  app_pacientes.js — Pacientes (cadastro, lista, perfil básico)
//
//  Versão 1: lista + cadastro (via Cloud Function cadastrarPaciente)
//  + marcar inativo. Abas de Evolução/Metas/Laudos ficam para uma
//  etapa futura (CLAUDE.md REGRA 5 — uma etapa por vez).
// ═══════════════════════════════════════════════════════════════

function TelaPacientes({
  usuario
}) {
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  useEffect(() => {
    // Filtra por psi_id no client (defesa em profundidade — quem
    // protege de verdade é a Firestore Rule, ver CLAUDE.md REGRA 3).
    // Sem .orderBy() — ordena no client (CLAUDE.md REGRA 4).
    const cancelar = db.collection("clinica_pacientes").where("psi_id", "==", usuario.psiId).onSnapshot(snapshot => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      lista.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
      setPacientes(lista);
      setCarregando(false);
    }, erro => {
      console.error("Erro ao carregar pacientes:", erro);
      setCarregando(false);
    });
    return cancelar;
  }, [usuario.psiId]);
  async function alternarInativo(paciente) {
    await db.collection("clinica_pacientes").doc(paciente.id).update({
      inativo: !paciente.inativo
    });
    setPacienteSelecionado(null);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "conteudo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-secao"
  }, /*#__PURE__*/React.createElement("h2", null, "Pacientes"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: () => setMostrarForm(true)
  }, "+ Novo Paciente")), carregando && /*#__PURE__*/React.createElement("p", null, "Carregando..."), !carregando && pacientes.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhum paciente cadastrado ainda."), !carregando && pacientes.length > 0 && /*#__PURE__*/React.createElement("table", {
    className: "tabela-pacientes"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Nome"), /*#__PURE__*/React.createElement("th", null, "E-mail"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, pacientes.map(p => /*#__PURE__*/React.createElement("tr", {
    key: p.id,
    onClick: () => setPacienteSelecionado(p),
    className: "linha-clicavel"
  }, /*#__PURE__*/React.createElement("td", null, p.nome), /*#__PURE__*/React.createElement("td", null, p.email), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: p.inativo ? "etiqueta-inativo" : "etiqueta-ativo"
  }, p.inativo ? "Inativo" : "Ativo")))))), mostrarForm && /*#__PURE__*/React.createElement(FormNovoPaciente, {
    usuario: usuario,
    aoFechar: () => setMostrarForm(false)
  }), pacienteSelecionado && /*#__PURE__*/React.createElement(PerfilPacienteSimples, {
    paciente: pacienteSelecionado,
    aoFechar: () => setPacienteSelecionado(null),
    aoAlternarInativo: alternarInativo
  }));
}
function FormNovoPaciente({
  usuario,
  aoFechar
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [linkSucesso, setLinkSucesso] = useState("");
  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resultado = await chamarCadastrarPaciente({
        nome,
        email
      });
      setLinkSucesso(resultado.data.linkDefinirSenha);
    } catch (e) {
      setErro(e.message || "Não foi possível cadastrar o paciente.");
    } finally {
      setEnviando(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: aoFechar
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", null, "Novo Paciente"), !linkSucesso && /*#__PURE__*/React.createElement("form", {
    onSubmit: aoEnviar
  }, /*#__PURE__*/React.createElement("label", null, "Nome completo"), /*#__PURE__*/React.createElement("input", {
    value: nome,
    onChange: e => setNome(e.target.value),
    required: true
  }), /*#__PURE__*/React.createElement("label", null, "E-mail"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    required: true
  }), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: aoFechar
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "botao-primario",
    disabled: enviando
  }, enviando ? "Cadastrando..." : "Cadastrar"))), linkSucesso && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Paciente cadastrado! Envie este link para ", /*#__PURE__*/React.createElement("strong", null, nome), " definir a pr\xF3pria senha (ningu\xE9m, nem a cl\xEDnica, fica sabendo qual senha ele escolhe):"), /*#__PURE__*/React.createElement("textarea", {
    readOnly: true,
    className: "campo-link",
    value: linkSucesso
  }), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: aoFechar
  }, "Concluir")))));
}
function PerfilPacienteSimples({
  paciente,
  aoFechar,
  aoAlternarInativo
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: aoFechar
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", null, paciente.nome), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "E-mail:"), " ", paciente.email), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Status:"), " ", paciente.inativo ? "Inativo" : "Ativo"), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: aoFechar
  }, "Fechar"), /*#__PURE__*/React.createElement("button", {
    className: paciente.inativo ? "botao-primario" : "botao-perigo",
    onClick: () => aoAlternarInativo(paciente)
  }, paciente.inativo ? "Marcar como Ativo" : "Marcar como Inativo"))));
}