// ═══════════════════════════════════════════════════════════════
//  app_pacientes.js — Pacientes (lista, cadastro, perfil, link
//  público de autocadastro)
//
//  Portado do sistema já usado pela Dra. Lucia (mesmos campos e
//  fluxo), com uma diferença de segurança de propósito: aqui não
//  existe senha "1234" nem senha guardada no Firestore — o cadastro
//  cria um login de verdade (Firebase Authentication) e o paciente
//  define a própria senha por um link, igual já fazemos em todo o
//  resto do sistema (CLAUDE.md REGRA 9).
// ═══════════════════════════════════════════════════════════════

const GENEROS = ["Feminino", "Masculino", "Não-binário", "Não informar"];
const STATUS_PACIENTE = [{
  valor: "ativo",
  rotulo: "Ativo",
  cor: "var(--sucesso)"
}, {
  valor: "inativo",
  rotulo: "Inativo",
  cor: "var(--erro)"
}, {
  valor: "alta",
  rotulo: "Alta",
  cor: "var(--texto-suave)"
}];
function TelaPacientes({
  usuario
}) {
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [linkCopiado, setLinkCopiado] = useState(false);
  useEffect(() => {
    // Filtra por psi_id no client (defesa em profundidade — quem
    // protege de verdade é a Firestore Rule, ver CLAUDE.md REGRA 3).
    // Sem .orderBy() — ordena no client (CLAUDE.md REGRA 4).
    const cancelar = db.collection("clinica_pacientes").where("psi_id", "==", usuario.psiId).onSnapshot(snapshot => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      lista.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
      setPacientes(lista);
      setCarregando(false);
    }, erro => {
      console.error("Erro ao carregar pacientes:", erro);
      setCarregando(false);
    });
    return cancelar;
  }, [usuario.psiId]);
  const filtrados = pacientes.filter(p => {
    const ok = filtro === "todos" || p.status === filtro;
    const bateBusca = !busca || p.nome?.toLowerCase().includes(busca.toLowerCase()) || p.email?.toLowerCase().includes(busca.toLowerCase());
    return ok && bateBusca;
  });
  function copiarLinkCadastro() {
    const url = `${window.location.origin}/psi/cadastro-paciente/?psi=${usuario.psiId}`;
    const texto = `Olá! Para agilizar o seu atendimento, preencha o formulário de cadastro pelo link abaixo:\n\n👉 ${url}\n\nÉ rápido e seguro. Após o preenchimento, seus dados já estarão disponíveis para a psicóloga.\n\nQualquer dúvida, estamos à disposição!`;
    navigator.clipboard.writeText(texto).then(() => {
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2500);
    }).catch(() => prompt("Copie o texto:", texto));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "conteudo conteudo-larga"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-secao"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Pacientes"), /*#__PURE__*/React.createElement("p", {
    className: "subtitulo-pagina"
  }, pacientes.filter(p => p.status === "ativo").length, " ativos \xB7", " ", pacientes.filter(p => p.status === "alta").length, " com alta \xB7", " ", pacientes.filter(p => p.status === "inativo").length, " inativos")), /*#__PURE__*/React.createElement("div", {
    className: "acoes-cabecalho"
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: copiarLinkCadastro
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "link",
    tamanho: 15
  }), " ", linkCopiado ? "Copiado!" : "Link de Cadastro"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: () => setMostrarForm(true)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "user-plus",
    tamanho: 16
  }), " Novo Paciente"))), /*#__PURE__*/React.createElement("div", {
    className: "barra-filtros"
  }, /*#__PURE__*/React.createElement("input", {
    className: "campo-busca",
    placeholder: "Buscar por nome ou e-mail...",
    value: busca,
    onChange: e => setBusca(e.target.value)
  }), [["todos", "Todos"], ["ativo", "Em atendimento"], ["alta", "Alta"], ["inativo", "Inativos"]].map(([valor, rotulo]) => /*#__PURE__*/React.createElement("button", {
    key: valor,
    className: "botao-filtro" + (filtro === valor ? " botao-filtro-ativo" : ""),
    onClick: () => setFiltro(valor)
  }, rotulo))), carregando && /*#__PURE__*/React.createElement("p", null, "Carregando..."), !carregando && ["pendente", "ativo", "alta", "inativo"].map(status => {
    const grupo = filtrados.filter(p => p.status === status);
    if (grupo.length === 0) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: status,
      className: "grupo-status"
    }, /*#__PURE__*/React.createElement("div", {
      className: "titulo-grupo-status"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ponto-status ponto-" + status
    }), status === "ativo" && "Em Atendimento", status === "alta" && "Alta", status === "pendente" && "⏳ Pendentes (Autocadastro)", status === "inativo" && "Inativos", " ", "(", grupo.length, ")"), /*#__PURE__*/React.createElement("div", {
      className: "cartao-lista-pacientes"
    }, grupo.map(p => /*#__PURE__*/React.createElement("div", {
      key: p.id,
      className: "linha-paciente",
      onClick: () => setPacienteSelecionado(p)
    }, /*#__PURE__*/React.createElement("div", {
      className: "avatar-paciente"
    }, (p.nome || "?").charAt(0).toUpperCase()), /*#__PURE__*/React.createElement("div", {
      className: "info-paciente"
    }, /*#__PURE__*/React.createElement("div", {
      className: "nome-paciente"
    }, p.nome), /*#__PURE__*/React.createElement("div", {
      className: "email-paciente"
    }, p.email)), /*#__PURE__*/React.createElement(Icone, {
      nome: "chevron-right",
      tamanho: 16
    })))));
  }), !carregando && filtrados.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhum paciente encontrado."), mostrarForm && /*#__PURE__*/React.createElement(FormNovoPaciente, {
    usuario: usuario,
    aoFechar: () => setMostrarForm(false)
  }), pacienteSelecionado && /*#__PURE__*/React.createElement(PerfilPaciente, {
    paciente: pacienteSelecionado,
    aoFechar: () => setPacienteSelecionado(null)
  }));
}
function CamposPaciente({
  form,
  setForm,
  mostrarStatus
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "grade-2col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Nome completo"), /*#__PURE__*/React.createElement("input", {
    value: form.nome || "",
    onChange: e => setForm({
      ...form,
      nome: e.target.value
    }),
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "E-mail"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: form.email || "",
    onChange: e => setForm({
      ...form,
      email: e.target.value
    }),
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Telefone"), /*#__PURE__*/React.createElement("input", {
    value: form.telefone || "",
    onChange: e => setForm({
      ...form,
      telefone: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Data de Nascimento"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.dataNasc || "",
    onChange: e => setForm({
      ...form,
      dataNasc: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "CPF"), /*#__PURE__*/React.createElement("input", {
    value: form.cpf || "",
    onChange: e => setForm({
      ...form,
      cpf: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "G\xEAnero"), /*#__PURE__*/React.createElement("select", {
    value: form.genero || "",
    onChange: e => setForm({
      ...form,
      genero: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione"), GENEROS.map(g => /*#__PURE__*/React.createElement("option", {
    key: g
  }, g)))), mostrarStatus && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Status"), /*#__PURE__*/React.createElement("div", {
    className: "pills-status"
  }, STATUS_PACIENTE.map(s => /*#__PURE__*/React.createElement("button", {
    key: s.valor,
    type: "button",
    className: "pill-status" + (form.status === s.valor ? " pill-status-ativa" : ""),
    style: {
      "--cor-pill": s.cor
    },
    onClick: () => setForm({
      ...form,
      status: s.valor
    })
  }, s.rotulo)))), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total titulo-secao-form"
  }, "\uD83C\uDFE2 Dados Ocupacionais \u2014 para documentos NR-1 e declara\xE7\xF5es"), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Empresa Contratante ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement("input", {
    value: form.empresa || "",
    onChange: e => setForm({
      ...form,
      empresa: e.target.value
    }),
    placeholder: "Para colaboradores de empresas"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Setor"), /*#__PURE__*/React.createElement("input", {
    value: form.setor || "",
    onChange: e => setForm({
      ...form,
      setor: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Cargo"), /*#__PURE__*/React.createElement("input", {
    value: form.cargo || "",
    onChange: e => setForm({
      ...form,
      cargo: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Objetivos Terap\xEAuticos"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 3,
    value: form.objetivos || "",
    onChange: e => setForm({
      ...form,
      objetivos: e.target.value
    }),
    placeholder: "Descreva os objetivos..."
  })));
}
function FormNovoPaciente({
  usuario,
  aoFechar
}) {
  const [form, setForm] = useState({
    status: "ativo"
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [linkSucesso, setLinkSucesso] = useState("");
  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");
    if (!form.nome || !form.email) {
      setErro("Nome e e-mail são obrigatórios.");
      return;
    }
    setEnviando(true);
    try {
      const resultado = await chamarCadastrarPaciente(form);
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
    className: "modal modal-largo",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", null, "Novo Paciente"), !linkSucesso && /*#__PURE__*/React.createElement("form", {
    onSubmit: aoEnviar
  }, /*#__PURE__*/React.createElement(CamposPaciente, {
    form: form,
    setForm: setForm,
    mostrarStatus: true
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
  }, enviando ? "Cadastrando..." : "Salvar"))), linkSucesso && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Paciente cadastrado! Envie este link para ", /*#__PURE__*/React.createElement("strong", null, form.nome), " definir a pr\xF3pria senha (ningu\xE9m, nem a cl\xEDnica, fica sabendo qual senha ele escolhe):"), /*#__PURE__*/React.createElement("textarea", {
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
function PerfilPaciente({
  paciente,
  aoFechar
}) {
  const [form, setForm] = useState({
    ...paciente
  });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [reenviando, setReenviando] = useState(false);
  async function salvar() {
    setSalvando(true);
    setMensagem("");
    const {
      id,
      ...dados
    } = form;
    try {
      await db.collection("clinica_pacientes").doc(paciente.id).update(dados);
      setMensagem("Salvo!");
    } catch (e) {
      setMensagem("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }
  async function reenviarLinkSenha() {
    setReenviando(true);
    try {
      await auth.sendPasswordResetEmail(paciente.email);
      setMensagem("Link de redefinição enviado para " + paciente.email + ".");
    } catch (e) {
      setMensagem("Erro ao enviar: " + e.message);
    } finally {
      setReenviando(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "sobreposicao",
    onClick: aoFechar
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-largo",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", null, paciente.nome), /*#__PURE__*/React.createElement(CamposPaciente, {
    form: form,
    setForm: setForm,
    mostrarStatus: true
  }), mensagem && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-sucesso"
  }, mensagem), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: aoFechar
  }, "Fechar"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: salvar,
    disabled: salvando
  }, salvando ? "Salvando..." : "Salvar alterações")), /*#__PURE__*/React.createElement("div", {
    className: "cartao-credenciais"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titulo-credenciais"
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "key",
    tamanho: 16
  }), " Acesso do paciente"), /*#__PURE__*/React.createElement("p", {
    className: "texto-credenciais"
  }, "Aqui n\xE3o guardamos nem mostramos a senha de ningu\xE9m \u2014 se o paciente esqueceu a senha, envie um link novo pra ele definir uma senha nova."), /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: reenviarLinkSenha,
    disabled: reenviando
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "send",
    tamanho: 14
  }), " ", reenviando ? "Enviando..." : "Enviar link de redefinição de senha"))));
}