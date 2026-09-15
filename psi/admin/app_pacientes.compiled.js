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

// Abre o WhatsApp já com a mensagem de boas-vindas + link de definir
// senha preenchidos, pra psicóloga só clicar em enviar (sem precisar
// copiar e colar nada). Usa o telefone que ela cadastrou no paciente.
function enviarWhatsAppCredenciais(paciente, link) {
  const numero = (paciente.telefone || "").replace(/\D/g, "");
  const mensagem = `Olá, ${paciente.nome}!\n\n` + `Seu cadastro foi feito com sucesso. Para acessar o Portal do Paciente, primeiro defina sua senha pelo link abaixo:\n\n` + `${link}\n\n` + `Depois é só entrar com seu e-mail e a senha que você escolher. Qualquer dúvida, estou à disposição.`;
  const url = numero ? `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}` : `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}
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

// Abas do perfil clínico completo do paciente — mesma estrutura do
// sistema real (perfil_paciente.js), menos "Terapia de Casal" (a Dra.
// Lucia decidiu não fazer essa por enquanto). Só "Perfil" está
// funcional; as outras vão sendo construídas uma de cada vez.
const ABAS_PACIENTE = [{
  id: "perfil",
  rotulo: "Perfil",
  icone: "user"
}, {
  id: "modulos",
  rotulo: "Módulos",
  icone: "grid"
}, {
  id: "metas",
  rotulo: "Metas",
  icone: "target"
}, {
  id: "laudos",
  rotulo: "Laudos",
  icone: "file-text"
}, {
  id: "evolucao",
  rotulo: "Evolução",
  icone: "trending-up"
}, {
  id: "saude-ocupacional",
  rotulo: "Saúde Ocupacional",
  icone: "briefcase"
}, {
  id: "questionarios",
  rotulo: "Questionários",
  icone: "clipboard-list"
}, {
  id: "links",
  rotulo: "Links Partilhados",
  icone: "link"
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
  if (pacienteSelecionado) {
    return /*#__PURE__*/React.createElement(PerfilPaciente, {
      usuario: usuario,
      paciente: pacienteSelecionado,
      aoFechar: () => setPacienteSelecionado(null),
      aoExcluir: () => setPacienteSelecionado(null)
    });
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
  const [emailEnviado, setEmailEnviado] = useState(false);
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
      // Manda o e-mail de verdade pro paciente definir a senha —
      // antes só gerava o link e esperava a psicóloga copiar e enviar
      // na mão; agora sai automático, igual o autocadastro público.
      try {
        await auth.sendPasswordResetEmail(form.email);
        setEmailEnviado(true);
      } catch (eEmail) {
        setEmailEnviado(false);
      }
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
  }, enviando ? "Cadastrando..." : "Salvar"))), linkSucesso && /*#__PURE__*/React.createElement("div", null, emailEnviado ? /*#__PURE__*/React.createElement("p", {
    className: "mensagem-sucesso"
  }, "Paciente cadastrado! J\xE1 mandamos um e-mail para ", /*#__PURE__*/React.createElement("strong", null, form.email), " com o link para ", /*#__PURE__*/React.createElement("strong", null, form.nome), " definir a pr\xF3pria senha (ningu\xE9m, nem a cl\xEDnica, fica sabendo qual senha ele escolhe).") : /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, "Paciente cadastrado, mas n\xE3o conseguimos enviar o e-mail autom\xE1tico. Copie o link abaixo e envie voc\xEA mesma para ", /*#__PURE__*/React.createElement("strong", null, form.nome), " (por WhatsApp, por exemplo):"), /*#__PURE__*/React.createElement("label", null, "Link de definir senha ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(reserva, caso o e-mail n\xE3o chegue)")), /*#__PURE__*/React.createElement("textarea", {
    readOnly: true,
    className: "campo-link",
    value: linkSucesso
  }), form.telefone && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    style: {
      marginTop: 10
    },
    onClick: () => enviarWhatsAppCredenciais(form, linkSucesso)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "message-circle",
    tamanho: 15
  }), " Enviar por WhatsApp"), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal"
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: aoFechar
  }, "Concluir")))));
}

// Painel do paciente — tela cheia com abas, igual ao sistema real
// (perfil_paciente.js: cabeçalho com nome/ID/Excluir + barra de abas).
function PerfilPaciente({
  usuario,
  paciente,
  aoFechar,
  aoExcluir
}) {
  const [aba, setAba] = useState("perfil");
  const [excluindo, setExcluindo] = useState(false);
  async function excluirPaciente() {
    if (!confirm(`Excluir ${paciente.nome}? Isso remove o cadastro clínico dele — não pode ser desfeito.`)) return;
    setExcluindo(true);
    try {
      await db.collection("clinica_pacientes").doc(paciente.id).delete();
      aoExcluir();
    } catch (e) {
      alert("Erro ao excluir: " + e.message);
      setExcluindo(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "conteudo conteudo-larga"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-perfil-paciente"
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario botao-voltar-perfil",
    onClick: aoFechar
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-left",
    tamanho: 15
  }), " Voltar"), /*#__PURE__*/React.createElement("div", {
    className: "titulo-perfil-paciente"
  }, /*#__PURE__*/React.createElement("h2", null, paciente.nome), /*#__PURE__*/React.createElement("span", {
    className: "subtitulo-pagina"
  }, "Perfil cl\xEDnico completo \xB7 ID: ", paciente.id)), /*#__PURE__*/React.createElement("button", {
    className: "botao-perigo",
    onClick: excluirPaciente,
    disabled: excluindo
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "trash-2",
    tamanho: 15
  }), " ", excluindo ? "Excluindo..." : "Excluir paciente")), /*#__PURE__*/React.createElement("div", {
    className: "abas-financeiro abas-perfil-paciente"
  }, ABAS_PACIENTE.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.id,
    className: "aba-financeiro" + (aba === a.id ? " aba-financeiro-ativa" : ""),
    onClick: () => setAba(a.id)
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: a.icone,
    tamanho: 15
  }), " ", a.rotulo))), aba === "perfil" && /*#__PURE__*/React.createElement(AbaPerfilPaciente, {
    paciente: paciente
  }), aba === "modulos" && /*#__PURE__*/React.createElement(AbaModulosPaciente, {
    paciente: paciente
  }), aba === "questionarios" && /*#__PURE__*/React.createElement(AbaQuestionariosPaciente, {
    usuario: usuario,
    paciente: paciente
  }), aba !== "perfil" && aba !== "modulos" && aba !== "questionarios" && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Essa aba (", ABAS_PACIENTE.find(a => a.id === aba)?.rotulo, ") ainda n\xE3o foi constru\xEDda \u2014 \xE9 uma das pr\xF3ximas etapas.")));
}
function AbaPerfilPaciente({
  paciente
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
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement(CamposPaciente, {
    form: form,
    setForm: setForm,
    mostrarStatus: true
  }), mensagem && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-sucesso"
  }, mensagem), /*#__PURE__*/React.createElement("div", {
    className: "acoes-modal acoes-perfil-paciente"
  }, /*#__PURE__*/React.createElement("button", {
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
  }), " ", reenviando ? "Enviando..." : "Enviar link de redefinição de senha")));
}

// ─── Módulos ─────────────────────────────────────────────────────
// Biblioteca de recursos terapêuticos (Ferramentas, Fábulas,
// Psicoeducação) — é conteúdo compartilhado por toda a plataforma
// (não é de uma clínica só), guardado em recursos_terapeuticos /
// fabulas_terapeuticas / psicoeducacao_conteudos. Aqui a psicóloga
// escolhe quais ficam ativados para este paciente. Simplificado em
// relação ao sistema real: sem os "Módulos I-VI" com sugestões
// cruzadas automáticas — ativa direto por item, agrupado por
// categoria.

function formatarCategoria(cat) {
  return (cat || "outros").replace(/_/g, " ").replace(/^./, c => c.toUpperCase());
}
function ToggleModulo({
  ativo,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "toggle-modulo" + (ativo ? " toggle-modulo-ativo" : ""),
    onClick: onClick
  }, /*#__PURE__*/React.createElement("span", {
    className: "toggle-modulo-bola"
  }));
}
function AbaModulosPaciente({
  paciente
}) {
  const [recursos, setRecursos] = useState([]);
  const [fabulas, setFabulas] = useState([]);
  const [psicoeducacoes, setPsicoeducacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [config, setConfig] = useState(paciente.modulosConfig || {});
  const [filtroTipo, setFiltroTipo] = useState("todas");
  const [busca, setBusca] = useState("");
  const [visualizando, setVisualizando] = useState(null);
  useEffect(() => {
    Promise.all([db.collection("recursos_terapeuticos").get(), db.collection("fabulas_terapeuticas").get(), db.collection("psicoeducacao_conteudos").get()]).then(([r, f, p]) => {
      setRecursos(r.docs.map(d => ({
        id: d.id,
        ...d.data()
      })));
      setFabulas(f.docs.map(d => ({
        id: d.id,
        ...d.data()
      })));
      setPsicoeducacoes(p.docs.map(d => ({
        id: d.id,
        ...d.data()
      })));
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }, []);
  const itens = [...recursos.map(r => ({
    ...r,
    tipo: "ferramenta",
    titulo: r.titulo || r.nome
  })), ...fabulas.map(f => ({
    ...f,
    tipo: "fabula",
    titulo: f.titulo || f.nome
  })), ...psicoeducacoes.map(p => ({
    ...p,
    tipo: "psicoeducacao",
    titulo: p.titulo || p.nome
  }))];
  const filtrados = itens.filter(it => {
    const okTipo = filtroTipo === "todas" || it.tipo === filtroTipo;
    const okBusca = !busca || (it.titulo || "").toLowerCase().includes(busca.toLowerCase());
    return okTipo && okBusca;
  });
  const porCategoria = {};
  filtrados.forEach(it => {
    const cat = it.categoria || "outros";
    (porCategoria[cat] = porCategoria[cat] || []).push(it);
  });
  const categorias = Object.keys(porCategoria).sort((a, b) => a.localeCompare(b, "pt-BR"));
  async function alternar(item) {
    const atual = config[item.id] || {};
    const novoAtivo = !atual.ativo;
    const novaConfig = {
      ...config,
      [item.id]: novoAtivo ? {
        ativo: true,
        tipo: item.tipo,
        titulo: item.titulo,
        dataInicio: new Date().toISOString().slice(0, 10)
      } : {
        ...atual,
        ativo: false
      }
    };
    setConfig(novaConfig);
    const ativos = Object.keys(novaConfig).filter(k => novaConfig[k]?.ativo);
    try {
      await db.collection("clinica_pacientes").doc(paciente.id).update({
        modulosConfig: novaConfig,
        modulosAtivos: ativos
      });
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    }
  }
  if (carregando) return /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Carregando biblioteca...");
  if (itens.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "cartao-secao"
    }, /*#__PURE__*/React.createElement("p", {
      className: "texto-vazio"
    }, "Nenhum recurso cadastrado ainda na biblioteca. Use a ferramenta de migra\xE7\xE3o de dados pra trazer o cat\xE1logo do sistema anterior (Ferramentas, F\xE1bulas e Psicoeduca\xE7\xE3o)."));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pills-status pills-filtro-modulos"
  }, [["todas", "Todas"], ["ferramenta", "Ferramentas"], ["fabula", "Fábulas"], ["psicoeducacao", "Psicoeducação"]].map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    type: "button",
    className: "pill-status" + (filtroTipo === v ? " pill-status-ativa" : ""),
    onClick: () => setFiltroTipo(v)
  }, l))), /*#__PURE__*/React.createElement("input", {
    className: "campo-busca campo-busca-modulos",
    placeholder: "Buscar por nome...",
    value: busca,
    onChange: e => setBusca(e.target.value)
  }), categorias.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhum item encontrado."), categorias.map(cat => {
    const cores = corDaCategoria(cat);
    return /*#__PURE__*/React.createElement("div", {
      key: cat,
      className: "grupo-status"
    }, /*#__PURE__*/React.createElement("div", {
      className: "titulo-grupo-status"
    }, /*#__PURE__*/React.createElement("span", {
      className: "etiqueta-categoria-recurso",
      style: {
        "--cor-cat": cores.cor,
        "--bg-cat": cores.bg
      }
    }, formatarCategoria(cat)), "(", porCategoria[cat].length, ")"), /*#__PURE__*/React.createElement("div", {
      className: "cartao-lista-pacientes"
    }, porCategoria[cat].map(item => {
      const ativo = !!config[item.id]?.ativo;
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        className: "linha-modulo",
        style: {
          "--cor-cat": cores.cor
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "info-lancamento"
      }, /*#__PURE__*/React.createElement("div", {
        className: "descricao-lancamento"
      }, item.titulo), item.descricao && /*#__PURE__*/React.createElement("div", {
        className: "detalhe-lancamento"
      }, item.descricao), ativo && config[item.id]?.dataInicio && /*#__PURE__*/React.createElement("div", {
        className: "detalhe-lancamento"
      }, "Ativado em ", config[item.id].dataInicio.split("-").reverse().join("/"))), /*#__PURE__*/React.createElement("button", {
        className: "botao-icone",
        onClick: () => setVisualizando(item),
        title: "Visualizar"
      }, /*#__PURE__*/React.createElement(Icone, {
        nome: "eye",
        tamanho: 15
      })), /*#__PURE__*/React.createElement(ToggleModulo, {
        ativo: ativo,
        onClick: () => alternar(item)
      }));
    })));
  }), visualizando && /*#__PURE__*/React.createElement(VisualizarRecursoModal, {
    item: visualizando,
    aoFechar: () => setVisualizando(null)
  }));
}

// ─── Questionários ───────────────────────────────────────────────
// Diferente de Módulos (biblioteca compartilhada que a psicóloga
// ativa/desativa por paciente), Questionários são instrumentos
// clínicos individuais desse paciente específico (Anamnese, Entrevista
// Clínica Inicial, Rastreamentos DSM-5 etc.) — no sistema real, cada
// um é preenchido pelo próprio paciente num formulário público e
// aparece aqui, só leitura, pra psicóloga consultar (ver
// admin/questionarios.js: AbaQuestionarios, AbaAnamnese...).
//
// Como o Portal do Paciente do PsiCoWorking ainda não existe (é uma
// etapa futura, maior, separada), esses formulários de autopreenchimento
// também ainda não existem — por isso essas telas aparecem vazias por
// enquanto, mesmo já prontas pra mostrar o resultado assim que a
// coleta existir. Começamos pela Anamnese, que é a mais simples
// (só leitura, sem pontuação); as outras (Entrevista Clínica,
// Rastreamento Bipolar/Borderline, Sexual, Alimentar, Neuro,
// Dependência, Jogos) ficam como "em construção" por enquanto.

const QUESTIONARIOS_DISPONIVEIS = [{
  id: "anamnese",
  rotulo: "Anamnese",
  icone: "clipboard-list",
  desc: "Marcos do desenvolvimento, histórico clínico e familiar.",
  pronto: true
}, {
  id: "entrevista",
  rotulo: "Entrevista Clínica Inicial",
  icone: "brain",
  desc: "Perfil etário, escalas de observação e hipóteses diagnósticas DSM-5.",
  pronto: false
}, {
  id: "rastreamento",
  rotulo: "Rastreamento Bipolar / Borderline",
  icone: "bar-chart-2",
  desc: "Avaliação diferencial DSM-5, com laudo comparativo.",
  pronto: false
}, {
  id: "sexual",
  rotulo: "Rastreamento de Saúde Sexual",
  icone: "heart",
  desc: "Rastreamento confidencial, respondido só pelo paciente.",
  pronto: false
}, {
  id: "alimentar",
  rotulo: "Hábitos Alimentares",
  icone: "utensils",
  desc: "Rastreamento de padrões e comportamentos alimentares.",
  pronto: false
}, {
  id: "neuro",
  rotulo: "Funcionamento e Comportamento",
  icone: "activity",
  desc: "Rastreamento de atenção, agitação e interação social.",
  pronto: false
}, {
  id: "dependencia",
  rotulo: "Dependência Química e Substâncias",
  icone: "triangle-alert",
  desc: "Rastreamento DSM-5 para Transtornos por Uso de Substâncias.",
  pronto: false
}, {
  id: "jogos",
  rotulo: "Jogos e Apostas",
  icone: "dice-5",
  desc: "Rastreamento de Gaming e Gambling Disorder (DSM-5 / CID-11).",
  pronto: false
}];
function AbaQuestionariosPaciente({
  usuario,
  paciente
}) {
  const [aberto, setAberto] = useState(null);
  if (aberto === "anamnese") {
    return /*#__PURE__*/React.createElement(AbaAnamneseView, {
      usuario: usuario,
      paciente: paciente,
      aoVoltar: () => setAberto(null)
    });
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "subtitulo-pagina",
    style: {
      marginBottom: 16
    }
  }, "Selecione um question\xE1rio para visualizar."), /*#__PURE__*/React.createElement("div", {
    className: "grade-cartoes-recursos"
  }, QUESTIONARIOS_DISPONIVEIS.map(q => /*#__PURE__*/React.createElement("div", {
    key: q.id,
    className: "cartao-recurso",
    style: {
      cursor: q.pronto ? "pointer" : "default",
      opacity: q.pronto ? 1 : 0.6
    },
    onClick: () => q.pronto && setAberto(q.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-cartao-recurso"
  }, /*#__PURE__*/React.createElement("div", {
    className: "icone-cartao-recurso",
    style: {
      "--cor-cat": "var(--cor-marca)"
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: q.icone,
    tamanho: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "titulo-cartao-recurso"
  }, q.rotulo)), /*#__PURE__*/React.createElement("p", {
    className: "descricao-cartao-recurso"
  }, q.desc), !q.pronto && /*#__PURE__*/React.createElement("span", {
    className: "texto-vazio",
    style: {
      fontSize: 11.5
    }
  }, "Em constru\xE7\xE3o")))));
}
function AbaAnamneseView({
  usuario,
  paciente,
  aoVoltar
}) {
  const [anamnese, setAnamnese] = useState(null);
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    db.collection("clinica_anamneses").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).limit(1).get().then(snap => {
      if (!snap.empty) setAnamnese({
        id: snap.docs[0].id,
        ...snap.docs[0].data()
      });
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }, [usuario.psiId, paciente.id]);
  const LABELS = {
    perfil: "Perfil",
    informanteTipo: "Quem respondeu",
    nomeRespondente: "Nome do respondente",
    parentescoRespondente: "Parentesco",
    queixa: "Queixa Principal",
    gestacaoPlanejada: "Gestação planejada",
    tipoParto: "Tipo de parto",
    idadeGestacional: "Idade gestacional",
    choroNascer: "Chorou ao nascer",
    sustCabeca: "Firmou a cabeça",
    sentou: "Sentou sozinho",
    engatinhou: "Engatinhou",
    caminhou: "Caminhou",
    lateralidade: "Lateralidade",
    balbucio: "Balbucio",
    primeirasParalavras: "Primeiras palavras",
    frasesSimples: "Frases simples",
    clarezaFala: "Clareza da fala",
    contatoVisual: "Contato visual",
    sorrisoSocial: "Sorriso social",
    padraOSono: "Padrão de sono",
    padraoAlimentar: "Padrão alimentar",
    desfralDiurno: "Desfralde diurno",
    desfralNoturno: "Desfralde noturno",
    idadeEscola: "Idade na escola",
    adaptacaoEscola: "Adaptação escolar",
    repetencia: "Repetência",
    facilidades: "Facilidades",
    dificuldades: "Dificuldades",
    foco: "Atenção/Foco",
    organizacao: "Organização",
    memoria: "Memória",
    convulsoes: "Convulsões/Desmaios",
    medicacoes: "Medicações",
    historicoFamiliar: "Histórico familiar",
    obsFinais: "Observações finais",
    escolaridade: "Escolaridade",
    profissao: "Profissão",
    comQuemMora: "Com quem mora",
    contextoEncaminhamento: "Contexto do encaminhamento",
    inicioQueixa: "Início dos sintomas",
    evolucaoQueixa: "Evolução",
    usoAlcoolDrogas: "Uso de álcool/drogas",
    orientacao: "Orientação",
    atencao: "Atenção",
    decisoes: "Tomada de decisões",
    avdBasicas: "Higiene/vestir",
    avdFinanceiro: "Gestão financeira",
    avdSair: "Sair sozinho",
    doencasCronicas: "Doenças crônicas",
    quedas: "Quedas frequentes",
    marcha: "Alteração de marcha",
    tremores: "Tremores",
    confusaoNoturna: "Confusão noturna"
  };
  const IGNORAR = ["id", "psi_id", "pacienteId", "pacienteNome", "tipo", "criadoEm", "perfil", "informanteTipo", "nomeRespondente", "parentescoRespondente"];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario botao-voltar-perfil",
    onClick: aoVoltar,
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-left",
    tamanho: 15
  }), " Voltar para Question\xE1rios"), carregando && /*#__PURE__*/React.createElement("p", null, "Carregando..."), !carregando && !anamnese && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma anamnese encontrada para ", paciente.nome, ". Ela \xE9 preenchida pelo pr\xF3prio paciente num formul\xE1rio p\xFAblico \u2014 o Portal do Paciente do PsiCoWorking ainda n\xE3o tem essa etapa pronta, ent\xE3o por enquanto n\xE3o h\xE1 como o paciente enviar essa resposta ainda.")), !carregando && anamnese && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-secao-lanc",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "etiqueta-categoria-recurso",
    style: {
      "--cor-cat": "var(--cor-marca)",
      "--bg-cat": "var(--marca-plataforma-lavanda)"
    }
  }, anamnese.perfil === "infantil" ? "Infantil/Neurodesenvolvimento" : "Adulto/Idoso")), anamnese.queixa && /*#__PURE__*/React.createElement("div", {
    className: "aviso-preview-paciente",
    style: {
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Queixa Principal"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0"
    }
  }, anamnese.queixa)), /*#__PURE__*/React.createElement("div", {
    className: "grade-2col",
    style: {
      marginTop: 16
    }
  }, Object.entries(anamnese).filter(([k, v]) => !IGNORAR.includes(k) && v && String(v).trim()).map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, LABELS[k] || k), /*#__PURE__*/React.createElement("p", {
    className: "texto-visualizar-recurso"
  }, String(v)))))));
}