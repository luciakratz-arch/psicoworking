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
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setForm({
      ...form,
      ehMenorDeIdade: !form.ehMenorDeIdade
    }),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      marginTop: 10,
      padding: "7px 14px",
      borderRadius: 20,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      border: form.ehMenorDeIdade ? "1.5px solid #0891b2" : "1.5px solid var(--borda)",
      background: form.ehMenorDeIdade ? "#0891b2" : "white",
      color: form.ehMenorDeIdade ? "white" : "var(--texto-suave)"
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "users",
    tamanho: 14
  }), " Paciente menor de 18 anos")), form.ehMenorDeIdade && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total titulo-secao-form",
    style: {
      color: "#0891b2",
      borderBottomColor: "#bae6fd"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "users",
    tamanho: 13
  }), " Respons\xE1vel / Pais")), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Nome do Respons\xE1vel ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement("input", {
    value: form.responsavelNome || "",
    onChange: e => setForm({
      ...form,
      responsavelNome: e.target.value
    }),
    placeholder: "Ex: Maria da Silva Castro"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Parentesco / V\xEDnculo"), /*#__PURE__*/React.createElement("select", {
    value: form.responsavelParentesco || "",
    onChange: e => setForm({
      ...form,
      responsavelParentesco: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione"), /*#__PURE__*/React.createElement("option", null, "M\xE3e"), /*#__PURE__*/React.createElement("option", null, "Pai"), /*#__PURE__*/React.createElement("option", null, "Av\xF3"), /*#__PURE__*/React.createElement("option", null, "Av\xF4"), /*#__PURE__*/React.createElement("option", null, "Tia/Tio"), /*#__PURE__*/React.createElement("option", null, "Tutor(a) legal"), /*#__PURE__*/React.createElement("option", null, "Respons\xE1vel institucional"), /*#__PURE__*/React.createElement("option", null, "Outro"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "CPF do Respons\xE1vel"), /*#__PURE__*/React.createElement("input", {
    value: form.responsavelCpf || "",
    onChange: e => setForm({
      ...form,
      responsavelCpf: e.target.value
    }),
    placeholder: "000.000.000-00"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Telefone do Respons\xE1vel"), /*#__PURE__*/React.createElement("input", {
    value: form.responsavelTelefone || "",
    onChange: e => setForm({
      ...form,
      responsavelTelefone: e.target.value
    }),
    placeholder: "(62) 9 0000-0000"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "E-mail do Respons\xE1vel"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: form.responsavelEmail || "",
    onChange: e => setForm({
      ...form,
      responsavelEmail: e.target.value
    }),
    placeholder: "email@exemplo.com"
  })), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Nome do Segundo Respons\xE1vel ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional)")), /*#__PURE__*/React.createElement("input", {
    value: form.responsavel2Nome || "",
    onChange: e => setForm({
      ...form,
      responsavel2Nome: e.target.value
    }),
    placeholder: "Ex: Jo\xE3o Castro (pai)"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Parentesco 2\xBA Respons\xE1vel"), /*#__PURE__*/React.createElement("select", {
    value: form.responsavel2Parentesco || "",
    onChange: e => setForm({
      ...form,
      responsavel2Parentesco: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione"), /*#__PURE__*/React.createElement("option", null, "M\xE3e"), /*#__PURE__*/React.createElement("option", null, "Pai"), /*#__PURE__*/React.createElement("option", null, "Av\xF3"), /*#__PURE__*/React.createElement("option", null, "Av\xF4"), /*#__PURE__*/React.createElement("option", null, "Tia/Tio"), /*#__PURE__*/React.createElement("option", null, "Tutor(a) legal"), /*#__PURE__*/React.createElement("option", null, "Respons\xE1vel institucional"), /*#__PURE__*/React.createElement("option", null, "Outro"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Telefone 2\xBA Respons\xE1vel"), /*#__PURE__*/React.createElement("input", {
    value: form.responsavel2Telefone || "",
    onChange: e => setForm({
      ...form,
      responsavel2Telefone: e.target.value
    }),
    placeholder: "(62) 9 0000-0000"
  })), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total"
  }, /*#__PURE__*/React.createElement("label", null, "Observa\xE7\xF5es sobre o respons\xE1vel / contexto familiar"), /*#__PURE__*/React.createElement(TextAreaVoz, {
    className: "campo-descricao",
    rows: 2,
    value: form.responsavelObs || "",
    onChange: e => setForm({
      ...form,
      responsavelObs: e.target.value
    }),
    placeholder: "Ex: Pais separados, guarda compartilhada. M\xE3e tem autoridade para autorizar procedimentos..."
  }))), /*#__PURE__*/React.createElement("div", {
    className: "campo-largura-total titulo-secao-form"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "briefcase",
    tamanho: 13
  }), " Dados Ocupacionais \u2014 para documentos NR-1 e declara\xE7\xF5es")), /*#__PURE__*/React.createElement("div", {
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
  // Se já existe algum dado de responsável salvo (cadastros antigos,
  // antes do botão existir), abre a seção automaticamente.
  const [form, setForm] = useState({
    ...paciente,
    ehMenorDeIdade: paciente.ehMenorDeIdade || !!paciente.responsavelNome
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
  if (typeof TODAS_SUBCATEGORIAS !== "undefined") {
    const sub = TODAS_SUBCATEGORIAS.find(s => s.id === cat);
    if (sub) return sub.label;
    const macro = MACROCATEGORIAS.find(m => m.id === cat);
    if (macro) return macro.label;
    const legado = CATEGORIAS_LEGADO.find(c => c.id === cat);
    if (legado) return legado.label;
  }
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

// Ordem e rótulo de cada módulo — nunca mistura ferramenta com fábula
// com psicoeducação numa mesma seção (era esse o "tudo misturado").
const ORDEM_MODULOS_RECURSO = ["ferramenta", "fabula", "psicoeducacao"];
const ROTULO_MODULO_RECURSO = {
  ferramenta: {
    titulo: "Ferramentas",
    icone: "wrench"
  },
  fabula: {
    titulo: "Fábulas Terapêuticas",
    icone: "book-open"
  },
  psicoeducacao: {
    titulo: "Psicoeducação",
    icone: "brain"
  }
};
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

  // Agrupa primeiro por MÓDULO (Ferramentas / Fábulas / Psicoeducação) —
  // igual ao modelo, que nunca mistura tipos diferentes numa mesma
  // seção — e só depois por macrocategoria clínica dentro de cada um.
  const porTipo = {};
  filtrados.forEach(it => {
    (porTipo[it.tipo] = porTipo[it.tipo] || []).push(it);
  });
  const tiposComItens = ORDEM_MODULOS_RECURSO.filter(tipo => porTipo[tipo]?.length);
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
  }), tiposComItens.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhum item encontrado."), tiposComItens.map(tipo => {
    const itensDoTipo = porTipo[tipo];
    const rotuloModulo = ROTULO_MODULO_RECURSO[tipo];
    const porCategoria = {};
    itensDoTipo.forEach(it => {
      const cat = it.categoria || "outros";
      (porCategoria[cat] = porCategoria[cat] || []).push(it);
    });
    const categorias = Object.keys(porCategoria).sort((a, b) => a.localeCompare(b, "pt-BR"));
    return /*#__PURE__*/React.createElement("div", {
      key: tipo,
      style: {
        marginBottom: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 15,
        fontWeight: 700,
        color: "var(--cor-marca)",
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: "2px solid #EADDFC"
      }
    }, /*#__PURE__*/React.createElement(Icone, {
      nome: rotuloModulo.icone,
      tamanho: 17
    }), rotuloModulo.titulo, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500,
        color: "var(--texto-suave)",
        fontSize: 13
      }
    }, "(", itensDoTipo.length, ")")), categorias.map(cat => {
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
    }));
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
  pronto: true
}, {
  id: "sexual",
  rotulo: "Rastreamento de Saúde Sexual",
  icone: "heart",
  desc: "Rastreamento confidencial, respondido só pelo paciente.",
  pronto: true
}, {
  id: "alimentar",
  rotulo: "Hábitos Alimentares",
  icone: "utensils",
  desc: "Rastreamento de padrões e comportamentos alimentares.",
  pronto: true
}, {
  id: "neuro",
  rotulo: "Funcionamento e Comportamento",
  icone: "activity",
  desc: "Rastreamento de atenção, agitação e interação social.",
  pronto: true
}, {
  id: "dependencia",
  rotulo: "Dependência Química e Substâncias",
  icone: "triangle-alert",
  desc: "Rastreamento DSM-5 para Transtornos por Uso de Substâncias.",
  pronto: true
}, {
  id: "jogos",
  rotulo: "Jogos e Apostas",
  icone: "dice-5",
  desc: "Rastreamento de Gaming e Gambling Disorder (DSM-5 / CID-11).",
  pronto: true
}];

// Dados de cada instrumento de rastreamento já portado — a lista
// completa de perguntas (mesma ordem/texto do formulário público em
// psi/atividade/formulario-rastreamento.js) e a fórmula de gravidade,
// que é igual nos dois: soma de respostas B+C contra os limiares do
// modelo original (2-3 leve, 4-5 moderada, 6+ grave).
const RASTREAMENTOS_ADMIN = {
  jogos: {
    titulo: "Rastreamento de Dependência de Jogos e Apostas",
    subtitulo: "9 critérios DSM-5 / CID-11 · Instrumento aplicado ao paciente e/ou familiares",
    totalCriterios: 9,
    perguntas: [{
      id: "p1",
      modulo: "Preocupação/Abstinência",
      texto: "Preocupação mental excessiva com jogos"
    }, {
      id: "p2",
      modulo: "Preocupação/Abstinência",
      texto: "Sintomas de abstinência ao parar (irritabilidade, ansiedade)"
    }, {
      id: "p3",
      modulo: "Tolerância/Controle",
      texto: "Tolerância — necessidade crescente de tempo ou dinheiro"
    }, {
      id: "p4",
      modulo: "Tolerância/Controle",
      texto: "Tentativas infrutíferas de controlar ou cessar o jogo"
    }, {
      id: "p5",
      modulo: "Tolerância/Controle",
      texto: "Abandono de outros hobbies e atividades sociais"
    }, {
      id: "p6",
      modulo: "Consequências",
      texto: "Continuidade apesar de problemas graves"
    }, {
      id: "p7",
      modulo: "Consequências",
      texto: "Ocultação e mentiras sobre a extensão do hábito"
    }, {
      id: "p8",
      modulo: "Consequências",
      texto: "Uso do jogo como fuga de problemas emocionais"
    }, {
      id: "p9",
      modulo: "Prejuízo Funcional",
      texto: "Perda ou risco severo de emprego, estudos ou relacionamentos"
    }]
  },
  dependencia: {
    titulo: "Rastreamento de Dependência Química e Substâncias",
    subtitulo: "11 critérios DSM-5 · Instrumento aplicado ao paciente e/ou familiares",
    totalCriterios: 11,
    perguntas: [{
      id: "p1",
      modulo: "Controle Prejudicado",
      texto: "Consumo em maiores quantidades ou por mais tempo do que o pretendido"
    }, {
      id: "p2",
      modulo: "Controle Prejudicado",
      texto: "Desejo persistente ou esforços infrutíferos para controlar o uso"
    }, {
      id: "p3",
      modulo: "Controle Prejudicado",
      texto: "Despendimento excessivo de tempo com a substância"
    }, {
      id: "p4",
      modulo: "Controle Prejudicado",
      texto: "Fissura (craving) — desejo imperioso de usar"
    }, {
      id: "p5",
      modulo: "Prejuízo Social",
      texto: "Falha no cumprimento de obrigações importantes"
    }, {
      id: "p6",
      modulo: "Prejuízo Social",
      texto: "Uso contínuo apesar de problemas sociais ou interpessoais"
    }, {
      id: "p7",
      modulo: "Prejuízo Social",
      texto: "Abandono de atividades importantes por causa do uso"
    }, {
      id: "p8",
      modulo: "Uso de Risco",
      texto: "Uso em situações de perigo físico"
    }, {
      id: "p9",
      modulo: "Uso de Risco",
      texto: "Uso contínuo apesar de problemas físicos ou psicológicos"
    }, {
      id: "p10",
      modulo: "Farmacológico",
      texto: "Tolerância — necessidade de doses crescentes"
    }, {
      id: "p11",
      modulo: "Farmacológico",
      texto: "Abstinência — síndrome ao parar ou uso para evitar mal-estar"
    }]
  }
};
function gravidadeRastreamento(doc, perguntas) {
  const C = perguntas.filter(p => doc[p.id] === "C").length;
  const B = perguntas.filter(p => doc[p.id] === "B").length;
  const total = C + B;
  let rotulo, cor;
  if (total >= 6) {
    rotulo = "Grave (6+ critérios)";
    cor = "#DC2626";
  } else if (total >= 4) {
    rotulo = "Moderada (4-5 critérios)";
    cor = "#D97706";
  } else if (total >= 2) {
    rotulo = "Leve (2-3 critérios)";
    cor = "#B45309";
  } else {
    rotulo = "Abaixo do limiar diagnóstico";
    cor = "#16A34A";
  }
  return {
    B,
    C,
    total,
    rotulo,
    cor
  };
}
const COR_LETRA_RASTREAMENTO = {
  A: "#16A34A",
  B: "#D97706",
  C: "#DC2626"
};

// Visualizador de qualquer rastreamento já portado (Jogos, Dependência
// Química, e os próximos que forem sendo adicionados a
// RASTREAMENTOS_ADMIN) — mesmo componente serve todos, só muda a
// config e a coleção.
function AbaRastreamentoView({
  usuario,
  paciente,
  tipo,
  aoVoltar
}) {
  const config = RASTREAMENTOS_ADMIN[tipo];
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [selecionado, setSelecionado] = useState(null);
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    db.collection("clinica_rastreamento_" + tipo).where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).get().then(snap => {
      const lista = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      lista.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
      setDocs(lista);
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }, [usuario.psiId, paciente.id, tipo]);
  async function gerarLink() {
    setGerandoLink(true);
    try {
      const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
      const cfg = cfgDoc.exists ? cfgDoc.data() : {};
      const token = gerarTokenLink();
      await db.collection("clinica_links_partilhados").doc(token).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome || "",
        tipo,
        titulo: config.titulo,
        nomeClinica: cfg.nome || "PsiCoWorking",
        corMarca: cfg.corPrimaria || "#6A2BD9",
        logoUrl: cfg.logoUrl || "",
        status: "enviado",
        cancelado: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      setLinkGerado(window.location.origin + "/psi/atividade/?t=" + token);
    } catch (e) {
      alert("Não foi possível gerar o link: " + e.message);
    } finally {
      setGerandoLink(false);
    }
  }
  function abrirWhatsApp() {
    const primeiroNome = (paciente.nome || "").split(" ")[0];
    const mensagem = `Olá, ${primeiroNome}!\n\n` + `Preparei um questionário clínico para você preencher: *${config.titulo}*.\n\n` + `Leva alguns minutos — é só abrir o link abaixo e responder com calma:\n\n` + `${linkGerado}\n\n` + `Qualquer dúvida, me chama por aqui.`;
    const numero = (paciente.telefone || "").replace(/\D/g, "");
    const url = numero ? "https://wa.me/55" + numero + "?text=" + encodeURIComponent(mensagem) : "https://wa.me/?text=" + encodeURIComponent(mensagem);
    window.open(url, "_blank");
  }
  function copiarLink() {
    navigator.clipboard.writeText(linkGerado).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }

  // Gera o laudo em PDF (via impressão do navegador) com a marca da
  // própria clínica — mesmo recurso do modelo, adaptado pra não ter
  // o nome da Dra. Lucia fixo no documento.
  async function gerarLaudo() {
    if (docs.length === 0) return;
    const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
    const cfg = cfgDoc.exists ? cfgDoc.data() : {};
    const nomeClinica = cfg.nome || "PsiCoWorking";
    const pacNome = paciente.nome || "Paciente";
    const dataDoc = new Date().toLocaleDateString("pt-BR");
    const linhasPorDoc = docs.map(doc => {
      const g = gravidadeRastreamento(doc, config.perguntas);
      const respondente = doc.tipoRespondente === "paciente" ? "Próprio paciente" : (doc.nomeRespondente || "Familiar") + " (" + (doc.parentesco || "—") + ")";
      const linhasPerguntas = config.perguntas.map(p => `<tr><td>${p.id.replace("p", "")}</td><td>${p.texto}</td><td>${p.modulo}</td><td style="font-weight:700;color:${COR_LETRA_RASTREAMENTO[doc[p.id]] || "#6b7280"}">${doc[p.id] || "—"}</td></tr>`).join("");
      const obsLinha = doc.obsFinais ? `<tr><td colspan="2"><strong>Observações</strong></td><td colspan="2">${doc.obsFinais}</td></tr>` : "";
      return `
        <h2>Respondente: ${respondente}</h2>
        <div class="gravidade">Critérios preenchidos: ${g.total}/${config.totalCriterios} &nbsp;·&nbsp; ${g.rotulo}</div>
        <p style="font-size:12px;color:#4b5563;margin-bottom:10px">Respostas C (critério pleno): <strong>${g.C}</strong> &nbsp;|&nbsp; Respostas B (parcial/subclínico): <strong>${g.B}</strong></p>
        <table class="resp-table"><thead><tr><th>#</th><th>Critério</th><th>Módulo</th><th>Resp.</th></tr></thead><tbody>${linhasPerguntas}${obsLinha}</tbody></table>`;
    }).join("");
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Laudo ${config.titulo} — ${pacNome}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#1f2937;padding:32px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6}
h1{font-size:20px;color:#3d006a;margin-bottom:4px}
h2{font-size:14px;color:#7B00C4;margin:20px 0 8px;border-bottom:1px solid #ede9fe;padding-bottom:4px}
.header{border-bottom:2px solid #7B00C4;padding-bottom:16px;margin-bottom:20px}
.sub{font-size:12px;color:#6b7280;margin-top:2px}
.gravidade{background:#f5f3ff;border:1px solid #c4b5fd;border-radius:10px;padding:14px 18px;margin:12px 0;font-size:15px;font-weight:700;color:#3d006a}
.resp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
.resp-table th{background:#f5f3ff;padding:6px 10px;text-align:left;font-size:10.5px;color:#7B00C4;border:1px solid #ede9fe}
.resp-table td{padding:6px 10px;border:1px solid #e5e7eb;vertical-align:top}
.resp-table tr:nth-child(even) td{background:#fafafa}
.rodape{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
@media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px">Imprimir / Salvar PDF</button>
</div>
<div class="header">
  <h1>Laudo — ${config.titulo}</h1>
  <div class="sub">Paciente: <strong>${pacNome}</strong> · Data: ${dataDoc} · ${nomeClinica}</div>
  <div class="sub">Respondentes: ${docs.length} (${docs.map(d => d.tipoRespondente === "paciente" ? "próprio paciente" : d.parentesco || "familiar").join(", ")})</div>
</div>
${linhasPorDoc}
<div class="rodape">Documento gerado em ${dataDoc} · Uso exclusivo para fins clínicos · Confidencial · LGPD</div>
</body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario botao-voltar-perfil",
    onClick: aoVoltar,
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-left",
    tamanho: 15
  }), " Voltar para Question\xE1rios"), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginBottom: 2
    }
  }, config.titulo), /*#__PURE__*/React.createElement("p", {
    className: "subtitulo-pagina",
    style: {
      marginBottom: 20
    }
  }, config.subtitulo), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginBottom: 20
    }
  }, !linkGerado ? /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: gerarLink,
    disabled: gerandoLink
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "link",
    tamanho: 15
  }), " ", gerandoLink ? "Gerando..." : "Gerar link do questionário") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: copiarLink
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: copiado ? "check" : "link",
    tamanho: 14
  }), " ", copiado ? "Copiado!" : "Copiar link"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: abrirWhatsApp,
    style: {
      background: "#25D366"
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "message-circle",
    tamanho: 14
  }), " Enviar pelo WhatsApp")), docs.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: gerarLaudo
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "file-text",
    tamanho: 14
  }), " Gerar laudo em PDF")), carregando && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Carregando..."), !carregando && docs.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma resposta recebida ainda. Gere o link acima e envie ao paciente ou familiar.")), !carregando && docs.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, docs.map(doc => {
    const g = gravidadeRastreamento(doc, config.perguntas);
    const aberto = selecionado === doc.id;
    return /*#__PURE__*/React.createElement("div", {
      key: doc.id,
      style: {
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setSelecionado(aberto ? null : doc.id),
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        cursor: "pointer",
        background: aberto ? "#F5F3FF" : "white"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13
      }
    }, doc.tipoRespondente === "paciente" ? "Próprio paciente" : (doc.nomeRespondente || "Familiar") + " · " + (doc.parentesco || "")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--texto-suave)",
        marginTop: 2
      }
    }, doc.criadoEm?.seconds ? new Date(doc.criadoEm.seconds * 1000).toLocaleDateString("pt-BR") : "—")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 12,
        color: g.cor
      }
    }, g.rotulo), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--texto-suave)",
        marginTop: 2
      }
    }, g.total, " crit\xE9rios / ", config.totalCriterios))), aberto && /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid #E5E7EB",
        padding: 16
      }
    }, config.perguntas.map(p => /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 0",
        borderBottom: "1px solid #F3F4F6"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 24,
        height: 24,
        minWidth: 24,
        borderRadius: "50%",
        background: doc[p.id] ? COR_LETRA_RASTREAMENTO[doc[p.id]] + "22" : "#F3F4F6",
        border: "2px solid " + (doc[p.id] ? COR_LETRA_RASTREAMENTO[doc[p.id]] : "#E5E7EB"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 700,
        color: doc[p.id] ? COR_LETRA_RASTREAMENTO[doc[p.id]] : "#9CA3AF"
      }
    }, doc[p.id] || "—"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#374151",
        flex: 1
      }
    }, p.texto), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF",
        whiteSpace: "nowrap"
      }
    }, p.modulo))), doc.obsFinais && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        background: "#F9FAFB",
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 12,
        color: "#4B5563"
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Observa\xE7\xF5es:"), " ", doc.obsFinais)));
  })));
}

// Lista resumida (pra montar a tabela do laudo) das 20 perguntas do
// instrumento — mesmo texto do formulário público em
// psi/atividade/formulario-rastreamento.js. Perguntas p16-p20 são
// coletadas mas não entram na fórmula de pontuação, igual ao modelo.
const PERGUNTAS_BIPOLAR = [{
  id: "p1",
  bloco: "Energia e Aceleração",
  texto: "Fases de energia acima do normal / aceleração"
}, {
  id: "p2",
  bloco: "Energia e Aceleração",
  texto: "Padrão de sono e fala durante agitação"
}, {
  id: "p3",
  bloco: "Energia e Aceleração",
  texto: "Autoconfiança exagerada ou riscos incomuns"
}, {
  id: "p4",
  bloco: "Tristeza e Depressão",
  texto: "Tristeza profunda ou perda de interesse"
}, {
  id: "p5",
  bloco: "Tristeza e Depressão",
  texto: "Disposição física, sono e apetite nas fases de baixa"
}, {
  id: "p6",
  bloco: "Tristeza e Depressão",
  texto: "Desesperança, culpa excessiva ou ideação suicida"
}, {
  id: "p7",
  bloco: "Relacionamentos e Identidade",
  texto: "Reação ao abandono real ou imaginado"
}, {
  id: "p8",
  bloco: "Relacionamentos e Identidade",
  texto: "Relações intensas e instáveis"
}, {
  id: "p9",
  bloco: "Relacionamentos e Identidade",
  texto: "Instabilidade de identidade ou objetivos"
}, {
  id: "p10",
  bloco: "Impulsos, Humor e Emoções",
  texto: "Comportamentos impulsivos no dia a dia"
}, {
  id: "p11",
  bloco: "Impulsos, Humor e Emoções",
  texto: "Automutilação ou tentativas de autoextermínio"
}, {
  id: "p12",
  bloco: "Impulsos, Humor e Emoções",
  texto: "Oscilação rápida de humor"
}, {
  id: "p13",
  bloco: "Impulsos, Humor e Emoções",
  texto: "Vazio interior persistente ou tédio crônico"
}, {
  id: "p14",
  bloco: "Impulsos, Humor e Emoções",
  texto: "Manejo da raiva e da frustração"
}, {
  id: "p15",
  bloco: "Impulsos, Humor e Emoções",
  texto: "Dissociação ou paranoia sob estresse extremo"
}, {
  id: "p16",
  bloco: "Cognição e Humor Misto",
  texto: "Pensamentos acelerados / fuga de ideias"
}, {
  id: "p17",
  bloco: "Cognição e Humor Misto",
  texto: "Distrabilidade nos episódios de agitação"
}, {
  id: "p18",
  bloco: "Cognição e Humor Misto",
  texto: "Agitação psicomotora ou lentidão visível"
}, {
  id: "p19",
  bloco: "Cognição e Humor Misto",
  texto: "Dificuldade de concentração e memória"
}, {
  id: "p20",
  bloco: "Cognição e Humor Misto",
  texto: "Humor misto: tristeza e agitação simultâneas"
}];
const COR_LETRA_BIPOLAR = {
  A: "#16A34A",
  B: "#D97706",
  C: "#DC2626",
  D: "#7F1D1D"
};
function pontuarLetraBipolar(letra) {
  return {
    A: 0,
    B: 1,
    C: 2,
    D: 3
  }[letra] || 0;
}

// Só as 15 perguntas originais entram na pontuação — as 5 novas de
// "Cognição e Humor Misto" (p16-p20) são coletadas mas ficam de fora
// da fórmula, igual ao modelo original (assimetria proposital dele,
// não é bug — quando a psicóloga quiser, dá pra incorporar depois).
function calcularEscoresBipolar(doc) {
  const bipolarMania = ["p1", "p2", "p3"].reduce((s, k) => s + pontuarLetraBipolar(doc[k]), 0);
  const bipolarDep = ["p4", "p5", "p6"].reduce((s, k) => s + pontuarLetraBipolar(doc[k]), 0);
  const borderline = ["p7", "p8", "p9", "p10", "p11", "p12", "p13", "p14", "p15"].reduce((s, k) => s + pontuarLetraBipolar(doc[k]), 0);
  return {
    bipolarMania,
    bipolarDep,
    borderline
  };
}

// Gera a hipótese diagnóstica diferencial a partir dos 3 escores
// médios — mesma lógica do modelo (percentuais e limiares idênticos).
function laudoDiferencialBipolar(escores) {
  const {
    bipolarMania,
    bipolarDep,
    borderline
  } = escores;
  const maxMania = 8,
    maxDep = 6,
    maxBorder = 18;
  const pctMania = bipolarMania / maxMania * 100;
  const pctDep = bipolarDep / maxDep * 100;
  const pctBorder = borderline / maxBorder * 100;
  let hipotese = "";
  const criterios = [];
  const atencao = [];
  if (pctMania >= 75) {
    hipotese = "Transtorno Bipolar Tipo I (episódio maníaco com comprometimento grave)";
    criterios.push({
      label: "TB Tipo I",
      atende: true,
      obs: "Escores de mania/hipomania elevados (≥75%). Verificar duração ≥7 dias e comprometimento funcional (Critério A do DSM-5)."
    });
    atencao.push("Confirmar duração exata dos episódios de aceleração (≥7 dias = mania; 4–6 dias = hipomania).");
    atencao.push("Checar se houve internação ou prejuízo grave — diferencial TB I vs TB II.");
  } else if (pctMania >= 45) {
    hipotese = "Transtorno Bipolar Tipo II (hipomania + depressão) — verificar";
    criterios.push({
      label: "TB Tipo II",
      atende: true,
      obs: "Indícios moderados de hipomania (45–74%). Confirmar ausência de episódio maníaco pleno."
    });
    atencao.push("Investigar se os episódios de aceleração duraram 4–6 dias sem internação (perfil Tipo II).");
  } else if (pctMania >= 20 && pctDep >= 30) {
    hipotese = "Ciclotimia ou Transtorno Depressivo com características mistas — investigar";
    criterios.push({
      label: "Ciclotimia",
      atende: null,
      obs: "Flutuações leves de humor sem critério pleno para mania ou depressão maior."
    });
    atencao.push("Mapear se as oscilações são crônicas (≥2 anos em adultos) para confirmar Ciclotimia (DSM-5 301.13).");
  } else {
    criterios.push({
      label: "TB Tipo I",
      atende: false,
      obs: "Escores de energia/aceleração abaixo do limiar clínico."
    });
    criterios.push({
      label: "TB Tipo II",
      atende: false,
      obs: "Sem indícios consistentes de hipomania."
    });
  }
  if (pctDep >= 60) {
    criterios.push({
      label: "Episódio Depressivo Maior",
      atende: true,
      obs: "Escores depressivos elevados. Avaliar ≥5 critérios por ≥2 semanas (DSM-5 Critério A)."
    });
    atencao.push("Verificar presença de ideação suicida ativa (p6=C) — acionar protocolo de segurança se necessário.");
  } else if (pctDep >= 30) {
    criterios.push({
      label: "Depressão leve/moderada",
      atende: null,
      obs: "Indícios moderados. Não preenche critérios plenos — monitorar."
    });
  } else {
    criterios.push({
      label: "Episódio Depressivo Maior",
      atende: false,
      obs: "Escores abaixo do limiar."
    });
  }
  if (pctBorder >= 70) {
    hipotese = hipotese ? hipotese + " com forte sobreposição de TPB" : "Transtorno da Personalidade Borderline (TPB)";
    criterios.push({
      label: "TPB (DSM-5 301.83)",
      atende: true,
      obs: "Escores elevados em ≥5 dos 9 critérios DSM-5 para TPB (escore ≥70%)."
    });
    atencao.push("Diferenciar oscilação de humor rápida (horas) do Borderline vs episódios longos do TB (dias/semanas).");
    atencao.push("Investigar história de automutilação, vazio crônico e instabilidade de identidade como critérios centrais do TPB.");
  } else if (pctBorder >= 40) {
    criterios.push({
      label: "TPB (traços)",
      atende: null,
      obs: "Traços limítrofes moderados. Não preenche critérios plenos — avaliar longitudinalmente."
    });
    atencao.push("Checar se oscilações emocionais são reativas a estressores interpessoais (perfil Borderline) ou autônomas (perfil Bipolar).");
  } else {
    criterios.push({
      label: "TPB",
      atende: false,
      obs: "Escores abaixo do limiar de critérios borderline."
    });
  }
  if (pctMania >= 45 && pctBorder >= 55) {
    atencao.push("Alta probabilidade de COMORBIDADE TB + TPB — padrão encontrado em até 20% dos casos. Priorizar diagnóstico longitudinal.");
  }
  if (!hipotese) hipotese = "Sem hipótese diagnóstica definida pelos escores — avaliação clínica aprofundada indicada.";
  return {
    hipotese,
    criterios,
    atencao,
    pctMania,
    pctDep,
    pctBorder
  };
}
function CorBadgeCriterio({
  atende
}) {
  if (atende === true) return /*#__PURE__*/React.createElement("span", {
    style: {
      background: "#FEF2F2",
      color: "#DC2626",
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700
    }
  }, "Crit\xE9rios presentes");
  if (atende === false) return /*#__PURE__*/React.createElement("span", {
    style: {
      background: "#F0FDF4",
      color: "#16A34A",
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700
    }
  }, "N\xE3o atende");
  return /*#__PURE__*/React.createElement("span", {
    style: {
      background: "#FFFBEB",
      color: "#D97706",
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700
    }
  }, "Investigar");
}
function BarraEscoreBipolar({
  label,
  valor,
  max,
  cor
}) {
  const pct = Math.min(100, Math.round(valor / max * 100));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: "#374151"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: cor,
      fontWeight: 700
    }
  }, pct, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#F3F4F6",
      borderRadius: 20,
      height: 8,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + "%",
      background: cor,
      height: "100%",
      borderRadius: 20,
      transition: "width .5s"
    }
  })));
}

// Visualizador do Rastreamento Bipolar/Borderline — não usa o motor
// genérico dos outros (AbaRastreamentoView) porque a pontuação é
// diferente: 3 eixos ponderados com hipótese diagnóstica diferencial,
// em vez de uma contagem simples de B+C.
function AbaRastreamentoBipolarView({
  usuario,
  paciente,
  aoVoltar
}) {
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    db.collection("clinica_rastreamento_bipolar").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).get().then(snap => {
      const lista = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      lista.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
      setDocs(lista);
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }, [usuario.psiId, paciente.id]);
  async function gerarLink() {
    setGerandoLink(true);
    try {
      const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
      const cfg = cfgDoc.exists ? cfgDoc.data() : {};
      const token = gerarTokenLink();
      await db.collection("clinica_links_partilhados").doc(token).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome || "",
        tipo: "bipolar",
        titulo: "Rastreamento Bipolar / Borderline",
        nomeClinica: cfg.nome || "PsiCoWorking",
        corMarca: cfg.corPrimaria || "#6A2BD9",
        logoUrl: cfg.logoUrl || "",
        status: "enviado",
        cancelado: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      setLinkGerado(window.location.origin + "/psi/atividade/?t=" + token);
    } catch (e) {
      alert("Não foi possível gerar o link: " + e.message);
    } finally {
      setGerandoLink(false);
    }
  }
  function abrirWhatsApp() {
    const primeiroNome = (paciente.nome || "").split(" ")[0];
    const mensagem = `Olá!\n\n` + `Preparei um questionário clínico para você preencher sobre *${primeiroNome}*: *Rastreamento Bipolar / Borderline*.\n\n` + `Leva de 8 a 12 minutos — é só abrir o link abaixo e responder com calma:\n\n` + `${linkGerado}\n\n` + `Qualquer dúvida, me chama por aqui.`;
    const numero = (paciente.telefone || "").replace(/\D/g, "");
    const url = numero ? "https://wa.me/55" + numero + "?text=" + encodeURIComponent(mensagem) : "https://wa.me/?text=" + encodeURIComponent(mensagem);
    window.open(url, "_blank");
  }
  function copiarLink() {
    navigator.clipboard.writeText(linkGerado).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }
  async function gerarLaudo() {
    if (docs.length === 0) return;
    const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
    const cfg = cfgDoc.exists ? cfgDoc.data() : {};
    const nomeClinica = cfg.nome || "PsiCoWorking";
    const pacNome = paciente.nome || "Paciente";
    const dataDoc = new Date().toLocaleDateString("pt-BR");
    const escoresPorDoc = docs.map(d => ({
      ...d,
      escores: calcularEscoresBipolar(d)
    }));
    const media = {
      bipolarMania: escoresPorDoc.reduce((s, d) => s + d.escores.bipolarMania, 0) / docs.length,
      bipolarDep: escoresPorDoc.reduce((s, d) => s + d.escores.bipolarDep, 0) / docs.length,
      borderline: escoresPorDoc.reduce((s, d) => s + d.escores.borderline, 0) / docs.length
    };
    const laudo = laudoDiferencialBipolar(media);
    const criteriosHtml = laudo.criterios.map(c => `
      <div class="criterio">
        <div class="nome">${c.label} &nbsp; <span class="${c.atende === true ? "badge-sim" : c.atende === false ? "badge-nao" : "badge-inv"}">${c.atende === true ? "Critérios presentes" : c.atende === false ? "Não atende" : "Investigar"}</span></div>
        <div style="font-size:12px;color:#4b5563;margin-top:4px">${c.obs}</div>
      </div>`).join("");
    const atencaoHtml = laudo.atencao.length === 0 ? "<p style='color:#6b7280;font-size:12px'>Nenhum ponto de atenção crítico identificado pelos escores.</p>" : laudo.atencao.map(a => `<div class="atencao-item">${a}</div>`).join("");
    const respostasHtml = escoresPorDoc.map(d => `
      <h3>${d.tipoRespondente === "paciente" ? "Próprio paciente" : (d.nomeRespondente || "Familiar") + " (" + (d.parentesco || "—") + ")"}</h3>
      <table class="resp-table">
        <thead><tr><th>#</th><th>Pergunta</th><th>Bloco</th><th>Resp.</th></tr></thead>
        <tbody>
          ${PERGUNTAS_BIPOLAR.map(p => `<tr><td>${p.id.replace("p", "")}</td><td>${p.texto}</td><td>${p.bloco}</td><td><span class="letra" style="color:${COR_LETRA_BIPOLAR[d[p.id]] || "#6b7280"}">${d[p.id] || "—"}</span></td></tr>`).join("")}
          ${d.obsFinais ? `<tr><td colspan="2"><strong>Observações livres</strong></td><td colspan="2">${d.obsFinais}</td></tr>` : ""}
        </tbody>
      </table>`).join("");
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Laudo Rastreamento Bipolar/Borderline — ${pacNome}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#1f2937;padding:32px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6}
h1{font-size:20px;color:#3d006a;margin-bottom:4px}
h2{font-size:14px;color:#7B00C4;margin:20px 0 8px;border-bottom:1px solid #ede9fe;padding-bottom:4px}
h3{font-size:12.5px;color:#374151;margin:12px 0 6px}
.header{border-bottom:2px solid #7B00C4;padding-bottom:16px;margin-bottom:20px}
.sub{font-size:12px;color:#6b7280;margin-top:2px}
.barra-wrap{margin-bottom:10px}
.barra-bg{background:#f3f4f6;border-radius:20px;height:10px;overflow:hidden;margin-top:3px}
.hipotese{background:#f5f3ff;border:1px solid #c4b5fd;border-radius:10px;padding:14px 18px;margin:12px 0}
.hipotese .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7B00C4;margin-bottom:4px}
.hipotese .valor{font-size:15px;font-weight:700;color:#3d006a}
.criterio{border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:8px}
.criterio .nome{font-weight:700;font-size:13px;margin-bottom:4px}
.badge-sim{background:#fef2f2;color:#dc2626;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-nao{background:#f0fdf4;color:#16a34a;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-inv{background:#fffbeb;color:#d97706;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.atencao-item{background:#fff7ed;border-left:3px solid #f97316;padding:8px 12px;margin-bottom:6px;border-radius:0 6px 6px 0;font-size:12px}
.resp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
.resp-table th{background:#f5f3ff;padding:6px 10px;text-align:left;font-size:10.5px;color:#7B00C4;border:1px solid #ede9fe}
.resp-table td{padding:6px 10px;border:1px solid #e5e7eb;vertical-align:top}
.resp-table tr:nth-child(even) td{background:#fafafa}
.letra{font-weight:700;font-size:13px}
.rodape{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
@media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px">Imprimir / Salvar PDF</button>
</div>
<div class="header">
  <h1>Laudo Analítico de Rastreamento Clínico</h1>
  <div class="sub">Paciente: <strong>${pacNome}</strong> · Data: ${dataDoc} · ${nomeClinica}</div>
  <div class="sub">Respondentes: ${docs.length} (${docs.map(d => d.tipoRespondente === "paciente" ? "próprio paciente" : d.parentesco || "familiar").join(", ")})</div>
</div>
<h2>I. Escores por Eixo (média entre respondentes)</h2>
<div class="barra-wrap">
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>Eixo Bipolar — Mania/Hipomania</strong></span><span style="color:#dc2626;font-weight:700">${Math.round(media.bipolarMania / 8 * 100)}%</span></div>
  <div class="barra-bg"><div style="width:${Math.round(media.bipolarMania / 8 * 100)}%;background:#dc2626;height:100%;border-radius:20px"></div></div>
</div>
<div class="barra-wrap">
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>Eixo Bipolar — Depressão</strong></span><span style="color:#7c3aed;font-weight:700">${Math.round(media.bipolarDep / 6 * 100)}%</span></div>
  <div class="barra-bg"><div style="width:${Math.round(media.bipolarDep / 6 * 100)}%;background:#7c3aed;height:100%;border-radius:20px"></div></div>
</div>
<div class="barra-wrap">
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>Eixo Borderline (TPB)</strong></span><span style="color:#2563eb;font-weight:700">${Math.round(media.borderline / 18 * 100)}%</span></div>
  <div class="barra-bg"><div style="width:${Math.round(media.borderline / 18 * 100)}%;background:#2563eb;height:100%;border-radius:20px"></div></div>
</div>
<h2>II. Hipótese Diagnóstica Provável</h2>
<div class="hipotese">
  <div class="label">Hipótese principal</div>
  <div class="valor">${laudo.hipotese}</div>
</div>
<h3>Análise por Critério DSM-5</h3>
${criteriosHtml}
<h2>III. Pontos de Atenção para a Entrevista Clínica</h2>
${atencaoHtml}
<h2>IV. Respostas por Respondente</h2>
${respostasHtml}
<div class="rodape">Documento gerado em ${dataDoc} · Uso exclusivo para fins clínicos · Confidencial · LGPD</div>
</body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario botao-voltar-perfil",
    onClick: aoVoltar,
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-left",
    tamanho: 15
  }), " Voltar para Question\xE1rios"), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginBottom: 2
    }
  }, "Rastreamento Bipolar / Borderline"), /*#__PURE__*/React.createElement("p", {
    className: "subtitulo-pagina",
    style: {
      marginBottom: 20
    }
  }, "Avalia\xE7\xE3o diferencial DSM-5 (20 crit\xE9rios) \xB7 Instrumento aplicado ao paciente e/ou familiares"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginBottom: 20
    }
  }, !linkGerado ? /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: gerarLink,
    disabled: gerandoLink
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "link",
    tamanho: 15
  }), " ", gerandoLink ? "Gerando..." : "Gerar link do questionário") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: copiarLink
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: copiado ? "check" : "link",
    tamanho: 14
  }), " ", copiado ? "Copiado!" : "Copiar link"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: abrirWhatsApp,
    style: {
      background: "#25D366"
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "message-circle",
    tamanho: 14
  }), " Enviar pelo WhatsApp")), docs.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: gerarLaudo
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "file-text",
    tamanho: 14
  }), " Gerar laudo em PDF")), carregando && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Carregando..."), !carregando && docs.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma resposta recebida ainda. Gere o link acima e envie ao paciente ou familiar.")), !carregando && docs.length > 0 && (() => {
    const escoresPorDoc = docs.map(d => ({
      ...d,
      escores: calcularEscoresBipolar(d)
    }));
    const media = {
      bipolarMania: escoresPorDoc.reduce((s, d) => s + d.escores.bipolarMania, 0) / docs.length,
      bipolarDep: escoresPorDoc.reduce((s, d) => s + d.escores.bipolarDep, 0) / docs.length,
      borderline: escoresPorDoc.reduce((s, d) => s + d.escores.borderline, 0) / docs.length
    };
    const laudo = laudoDiferencialBipolar(media);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#F5F3FF",
        border: "1px solid #C4B5FD",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "var(--cor-marca)",
        marginBottom: 4
      }
    }, "Hip\xF3tese diagn\xF3stica prov\xE1vel"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: "#3D006A",
        lineHeight: 1.4
      }
    }, laudo.hipotese)), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 12
      }
    }, "Escores m\xE9dios por eixo (", docs.length, " respondente", docs.length !== 1 ? "s" : "", ")"), /*#__PURE__*/React.createElement(BarraEscoreBipolar, {
      label: "Eixo Bipolar \xB7 Mania/Hipomania",
      valor: media.bipolarMania,
      max: 8,
      cor: "#DC2626"
    }), /*#__PURE__*/React.createElement(BarraEscoreBipolar, {
      label: "Eixo Bipolar \xB7 Depress\xE3o",
      valor: media.bipolarDep,
      max: 6,
      cor: "#7C3AED"
    }), /*#__PURE__*/React.createElement(BarraEscoreBipolar, {
      label: "Eixo Borderline (TPB)",
      valor: media.borderline,
      max: 18,
      cor: "#2563EB"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10
      }
    }, "An\xE1lise DSM-5"), laudo.criterios.map((c, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: "10px 14px",
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 13
      }
    }, c.label), /*#__PURE__*/React.createElement(CorBadgeCriterio, {
      atende: c.atende
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#4B5563"
      }
    }, c.obs)))), laudo.atencao.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10
      }
    }, "Pontos de aten\xE7\xE3o para a entrevista cl\xEDnica"), laudo.atencao.map((a, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: "#FFF7ED",
        borderLeft: "3px solid #F97316",
        padding: "8px 12px",
        marginBottom: 6,
        borderRadius: "0 6px 6px 0",
        fontSize: 12
      }
    }, a))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10
      }
    }, "Respostas por respondente"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, docs.map(doc => /*#__PURE__*/React.createElement("div", {
      key: doc.id,
      style: {
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        marginBottom: 10
      }
    }, doc.tipoRespondente === "paciente" ? "Próprio paciente" : (doc.nomeRespondente || "Familiar") + " · " + (doc.parentesco || "")), PERGUNTAS_BIPOLAR.map(p => /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 0",
        borderBottom: "1px solid #F3F4F6"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 24,
        height: 24,
        minWidth: 24,
        borderRadius: "50%",
        background: doc[p.id] ? COR_LETRA_BIPOLAR[doc[p.id]] + "22" : "#F3F4F6",
        border: "2px solid " + (doc[p.id] ? COR_LETRA_BIPOLAR[doc[p.id]] : "#E5E7EB"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 700,
        color: doc[p.id] ? COR_LETRA_BIPOLAR[doc[p.id]] : "#9CA3AF"
      }
    }, doc[p.id] || "—"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#374151",
        flex: 1
      }
    }, p.texto), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF",
        whiteSpace: "nowrap"
      }
    }, p.bloco))), doc.obsFinais && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        background: "#F9FAFB",
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 12,
        color: "#4B5563"
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Observa\xE7\xF5es:"), " ", doc.obsFinais)))));
  })());
}

// ═══════════════════════════════════════════════════════════════════
// Rastreamento de Hábitos Alimentares — bespoke (3 eixos: Anorexia,
// Bulimia/TCA, TCA puro), igual ao modelo (admin/questionarios.js).
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS_ALIMENTAR = [{
  id: "p1",
  eixo: "Anorexia",
  texto: "Restrição persistente / peso abaixo do esperado"
}, {
  id: "p2",
  eixo: "Anorexia",
  texto: "Medo intenso de engordar"
}, {
  id: "p3",
  eixo: "Anorexia",
  texto: "Distorção da imagem corporal"
}, {
  id: "p4",
  eixo: "Anorexia",
  texto: "Padrão de controle de peso (últimos 3 meses)"
}, {
  id: "p5",
  eixo: "Bulimia/TCA",
  texto: "Episódios de ingestão muito acima do normal"
}, {
  id: "p6",
  eixo: "Bulimia/TCA",
  texto: "Perda de controle durante os episódios"
}, {
  id: "p7",
  eixo: "Bulimia/TCA",
  texto: "Frequência dos episódios"
}, {
  id: "p8",
  eixo: "Bulimia/TCA",
  texto: "Uso de métodos compensatórios após ingestão excessiva"
}, {
  id: "p9",
  eixo: "TCA Puro",
  texto: "Padrão de ingestão rápida, secreta ou exagerada"
}, {
  id: "p10",
  eixo: "TCA Puro",
  texto: "Culpa intensa sem comportamentos compensatórios"
}, {
  id: "p11",
  eixo: "ARFID",
  texto: "Restrição por aversão sensorial / medo de engasgar"
}, {
  id: "p12",
  eixo: "ARFID",
  texto: "Impacto clínico da restrição (peso, nutrição, vida social)"
}];
const COR_LETRA_TRIAGEM = {
  A: "#16A34A",
  B: "#D97706",
  C: "#DC2626"
};
function pontuarLetraTriagem(letra) {
  return {
    A: 0,
    B: 1,
    C: 2
  }[letra] || 0;
}
function calcularEscoresAlimentar(doc) {
  const p = id => pontuarLetraTriagem(doc[id]);
  return {
    anorexia: ["p1", "p2", "p3", "p4"].reduce((s, id) => s + p(id), 0),
    bulimia: ["p5", "p6", "p7", "p8"].reduce((s, id) => s + p(id), 0),
    tca: ["p9", "p10"].reduce((s, id) => s + p(id), 0)
  };
}

// p11/p12 (ARFID) são coletados mas não entram na fórmula — mesma
// assimetria proposital do modelo original.
function laudoAlimentar(escores, doc) {
  const {
    anorexia,
    bulimia,
    tca
  } = escores;
  const pAn = Math.round(anorexia / 8 * 100);
  const pBu = Math.round(bulimia / 8 * 100);
  const pTc = Math.round(tca / 4 * 100);
  let hipotese = [];
  const criterios = [];
  const atencao = [];
  if (pAn >= 50) {
    const subtipo = doc?.p4 === "C" ? "Subtipo Compulsão/Purgativo" : "Subtipo Restritivo";
    hipotese.push("Anorexia Nervosa — " + subtipo);
    criterios.push({
      label: "Anorexia Nervosa (DSM-5 F50.0)",
      atende: true,
      obs: "Escores elevados nos três critérios nucleares: restrição (p1), medo de engordar (p2) e distorção da imagem corporal (p3). Subtipo: " + subtipo + "."
    });
    atencao.push("Avaliar IMC atual e velocidade de perda de peso — risco clínico de desnutrição grave.");
    atencao.push("Solicitar exames laboratoriais urgentes: eletrólitos, hemograma, função cardíaca (ECG) e densidade óssea.");
    if (doc?.p4 === "C") atencao.push("Padrão purgativo confirmado — investigar lesões esofágicas, erosão dentária e hipocalemia.");
  } else {
    criterios.push({
      label: "Anorexia Nervosa",
      atende: false,
      obs: "Escores abaixo do limiar — sem os três critérios nucleares simultâneos."
    });
  }
  if (pBu >= 50) {
    const temPurgacao = doc?.p8 === "C";
    if (temPurgacao) {
      hipotese.push("Bulimia Nervosa");
      criterios.push({
        label: "Bulimia Nervosa (DSM-5 F50.2)",
        atende: true,
        obs: "Compulsão recorrente (p5/p6), frequência ≥1x/semana por 3 meses (p7) e comportamentos compensatórios (p8) confirmados."
      });
      atencao.push("Investigar desequilíbrio eletrolítico (hipocalemia, hiponatremia) — risco cardíaco.");
      atencao.push("Avaliar erosão dentária, calosidades nos nós dos dedos (sinal de Russell) e lesões esofágicas.");
    } else if (pTc >= 50) {
      hipotese.push("Transtorno de Compulsão Alimentar (TCA)");
      criterios.push({
        label: "TCA — Compulsão sem Purgação (DSM-5 F50.8)",
        atende: true,
        obs: "Compulsão recorrente com sofrimento intenso e ausência de comportamentos compensatórios — perfil clássico de TCA."
      });
      atencao.push("Avaliar sobrepeso/obesidade como consequência do TCA e impacto metabólico.");
      atencao.push("Rastrear depressão e ansiedade associadas — alta comorbidade com TCA.");
    }
  } else if (pTc >= 50 && pBu < 50) {
    hipotese.push("Transtorno de Compulsão Alimentar (TCA) leve");
    criterios.push({
      label: "TCA (traços)",
      atende: null,
      obs: "Padrão de compulsão com culpa presente, mas frequência abaixo do limiar diagnóstico pleno."
    });
    atencao.push("Monitorar frequência dos episódios — se aumentar para ≥1x/semana por 3 meses, revisar diagnóstico.");
  }
  if (hipotese.length === 0) {
    if (doc?.p4 === "B") {
      hipotese.push("ARFID ou restrição alimentar subliminar — investigar");
      criterios.push({
        label: "ARFID (DSM-5 F50.82)",
        atende: null,
        obs: "Restrição presente sem distorção de imagem ou medo de engordar — investigar seletividade sensorial ou medo de engasgo."
      });
    } else {
      hipotese.push("Sem hipótese diagnóstica definida pelos escores — avaliação clínica aprofundada indicada.");
      criterios.push({
        label: "Transtornos Alimentares",
        atende: false,
        obs: "Escores abaixo do limiar para todos os diagnósticos avaliados."
      });
    }
  }
  return {
    hipotese: hipotese.join(" / "),
    criterios,
    atencao,
    pAn,
    pBu,
    pTc
  };
}
function gerarHtmlLaudoTriagem({
  titulo,
  pacNome,
  nomeClinica,
  data,
  docs,
  perguntas,
  barras,
  hipotese,
  criterios,
  atencao,
  respostasHtmlExtra
}) {
  const criteriosHtml = criterios.map(c => `
    <div class="criterio">
      <div class="nome">${c.label} &nbsp; <span class="${c.atende === true ? "badge-sim" : c.atende === false ? "badge-nao" : "badge-inv"}">${c.atende === true ? "Critérios presentes" : c.atende === false ? "Não atende" : "Investigar"}</span></div>
      <div style="font-size:12px;color:#4b5563;margin-top:4px">${c.obs}</div>
    </div>`).join("");
  const atencaoHtml = atencao.length === 0 ? "<p style='color:#6b7280;font-size:12px'>Nenhum ponto de atenção crítico identificado pelos escores.</p>" : atencao.map(a => `<div class="atencao-item">${a}</div>`).join("");
  const barrasHtml = barras.map(b => `
    <div class="barra-wrap">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span><strong>${b.label}</strong></span><span style="color:${b.cor};font-weight:700">${b.pct}%</span></div>
      <div class="barra-bg"><div style="width:${b.pct}%;background:${b.cor};height:100%;border-radius:20px"></div></div>
    </div>`).join("");
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>${titulo} — ${pacNome}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#1f2937;padding:32px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6}
h1{font-size:20px;color:#3d006a;margin-bottom:4px}
h2{font-size:14px;color:#7B00C4;margin:20px 0 8px;border-bottom:1px solid #ede9fe;padding-bottom:4px}
h3{font-size:12.5px;color:#374151;margin:12px 0 6px}
.header{border-bottom:2px solid #7B00C4;padding-bottom:16px;margin-bottom:20px}
.sub{font-size:12px;color:#6b7280;margin-top:2px}
.barra-wrap{margin-bottom:10px}
.barra-bg{background:#f3f4f6;border-radius:20px;height:10px;overflow:hidden;margin-top:3px}
.hipotese{background:#f5f3ff;border:1px solid #c4b5fd;border-radius:10px;padding:14px 18px;margin:12px 0}
.hipotese .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7B00C4;margin-bottom:4px}
.hipotese .valor{font-size:15px;font-weight:700;color:#3d006a}
.criterio{border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:8px}
.criterio .nome{font-weight:700;font-size:13px;margin-bottom:4px}
.badge-sim{background:#fef2f2;color:#dc2626;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-nao{background:#f0fdf4;color:#16a34a;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-inv{background:#fffbeb;color:#d97706;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700}
.atencao-item{background:#fff7ed;border-left:3px solid #f97316;padding:8px 12px;margin-bottom:6px;border-radius:0 6px 6px 0;font-size:12px}
.resp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
.resp-table th{background:#f5f3ff;padding:6px 10px;text-align:left;font-size:10.5px;color:#7B00C4;border:1px solid #ede9fe}
.resp-table td{padding:6px 10px;border:1px solid #e5e7eb;vertical-align:top}
.resp-table tr:nth-child(even) td{background:#fafafa}
.letra{font-weight:700;font-size:13px}
.rodape{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
@media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#7B00C4;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px">Imprimir / Salvar PDF</button>
</div>
<div class="header">
  <h1>${titulo}</h1>
  <div class="sub">Paciente: <strong>${pacNome}</strong> · Data: ${data} · ${nomeClinica}</div>
  <div class="sub">Respondentes: ${docs.length} (${docs.map(d => d.tipoRespondente === "paciente" ? "próprio paciente" : d.parentesco || "familiar").join(", ")})</div>
</div>
<h2>I. Escores por Eixo</h2>
${barrasHtml}
<h2>II. Hipótese Diagnóstica Provável</h2>
<div class="hipotese">
  <div class="label">Hipótese principal</div>
  <div class="valor">${hipotese}</div>
</div>
<h3>Análise por Critério DSM-5</h3>
${criteriosHtml}
<h2>III. Pontos de Atenção para a Entrevista Clínica</h2>
${atencaoHtml}
<h2>IV. Respostas por Respondente</h2>
${respostasHtmlExtra}
<div class="rodape">Documento gerado em ${data} · Uso exclusivo para fins clínicos · Confidencial · LGPD</div>
</body></html>`;
}
function AbaRastreamentoAlimentarView({
  usuario,
  paciente,
  aoVoltar
}) {
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    db.collection("clinica_rastreamento_alimentar").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).get().then(snap => {
      const lista = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      lista.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
      setDocs(lista);
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }, [usuario.psiId, paciente.id]);
  async function gerarLink() {
    setGerandoLink(true);
    try {
      const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
      const cfg = cfgDoc.exists ? cfgDoc.data() : {};
      const token = gerarTokenLink();
      await db.collection("clinica_links_partilhados").doc(token).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome || "",
        tipo: "alimentar",
        titulo: "Rastreamento de Hábitos Alimentares",
        nomeClinica: cfg.nome || "PsiCoWorking",
        corMarca: cfg.corPrimaria || "#6A2BD9",
        logoUrl: cfg.logoUrl || "",
        status: "enviado",
        cancelado: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      setLinkGerado(window.location.origin + "/psi/atividade/?t=" + token);
    } catch (e) {
      alert("Não foi possível gerar o link: " + e.message);
    } finally {
      setGerandoLink(false);
    }
  }
  function abrirWhatsApp() {
    const primeiroNome = (paciente.nome || "").split(" ")[0];
    const mensagem = `Olá!\n\n` + `Preparei um questionário clínico para você preencher sobre *${primeiroNome}*: *Rastreamento de Hábitos Alimentares*.\n\n` + `Leva de 6 a 10 minutos — é só abrir o link abaixo e responder com calma:\n\n` + `${linkGerado}\n\n` + `Qualquer dúvida, me chama por aqui.`;
    const numero = (paciente.telefone || "").replace(/\D/g, "");
    const url = numero ? "https://wa.me/55" + numero + "?text=" + encodeURIComponent(mensagem) : "https://wa.me/?text=" + encodeURIComponent(mensagem);
    window.open(url, "_blank");
  }
  function copiarLink() {
    navigator.clipboard.writeText(linkGerado).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }
  async function gerarLaudo() {
    if (docs.length === 0) return;
    const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
    const cfg = cfgDoc.exists ? cfgDoc.data() : {};
    const nomeClinica = cfg.nome || "PsiCoWorking";
    const pacNome = paciente.nome || "Paciente";
    const dataDoc = new Date().toLocaleDateString("pt-BR");
    const doc = docs[0];
    const escores = calcularEscoresAlimentar(doc);
    const laudo = laudoAlimentar(escores, doc);
    const respostasHtml = docs.map(d => `
      <h3>${d.tipoRespondente === "paciente" ? "Próprio paciente" : (d.nomeRespondente || "Familiar") + " (" + (d.parentesco || "—") + ")"}</h3>
      <table class="resp-table">
        <thead><tr><th>#</th><th>Item</th><th>Eixo</th><th>Resp.</th></tr></thead>
        <tbody>
          ${PERGUNTAS_ALIMENTAR.map(p => `<tr><td>${p.id.replace("p", "")}</td><td>${p.texto}</td><td>${p.eixo}</td><td><span class="letra" style="color:${COR_LETRA_TRIAGEM[d[p.id]] || "#6b7280"}">${d[p.id] || "—"}</span></td></tr>`).join("")}
          ${d.obsFinais ? `<tr><td colspan="2"><strong>Observações livres</strong></td><td colspan="2">${d.obsFinais}</td></tr>` : ""}
        </tbody>
      </table>`).join("");
    const html = gerarHtmlLaudoTriagem({
      titulo: "Laudo Analítico — Hábitos Alimentares",
      pacNome,
      nomeClinica,
      data: dataDoc,
      docs,
      barras: [{
        label: "Anorexia Nervosa",
        pct: laudo.pAn,
        cor: "#DC2626"
      }, {
        label: "Bulimia Nervosa / TCA",
        pct: laudo.pBu,
        cor: "#7C3AED"
      }, {
        label: "TCA Puro (sem purgação)",
        pct: laudo.pTc,
        cor: "#2563EB"
      }],
      hipotese: laudo.hipotese,
      criterios: laudo.criterios,
      atencao: laudo.atencao,
      respostasHtmlExtra: respostasHtml
    });
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario botao-voltar-perfil",
    onClick: aoVoltar,
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-left",
    tamanho: 15
  }), " Voltar para Question\xE1rios"), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginBottom: 2
    }
  }, "Rastreamento de H\xE1bitos Alimentares"), /*#__PURE__*/React.createElement("p", {
    className: "subtitulo-pagina",
    style: {
      marginBottom: 20
    }
  }, "Avalia\xE7\xE3o diferencial DSM-5 (12 crit\xE9rios) \xB7 Instrumento aplicado ao paciente e/ou familiares"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginBottom: 20
    }
  }, !linkGerado ? /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: gerarLink,
    disabled: gerandoLink
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "link",
    tamanho: 15
  }), " ", gerandoLink ? "Gerando..." : "Gerar link do questionário") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: copiarLink
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: copiado ? "check" : "link",
    tamanho: 14
  }), " ", copiado ? "Copiado!" : "Copiar link"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: abrirWhatsApp,
    style: {
      background: "#25D366"
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "message-circle",
    tamanho: 14
  }), " Enviar pelo WhatsApp")), docs.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: gerarLaudo
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "file-text",
    tamanho: 14
  }), " Gerar laudo em PDF")), carregando && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Carregando..."), !carregando && docs.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma resposta recebida ainda. Gere o link acima e envie ao paciente ou familiar.")), !carregando && docs.length > 0 && (() => {
    const doc = docs[0];
    const escores = calcularEscoresAlimentar(doc);
    const laudo = laudoAlimentar(escores, doc);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#F5F3FF",
        border: "1px solid #C4B5FD",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "var(--cor-marca)",
        marginBottom: 4
      }
    }, "Hip\xF3tese diagn\xF3stica prov\xE1vel"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: "#3D006A",
        lineHeight: 1.4
      }
    }, laudo.hipotese)), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 12
      }
    }, "Escores por eixo (resposta mais recente)"), /*#__PURE__*/React.createElement(BarraEscoreBipolar, {
      label: "Anorexia Nervosa",
      valor: escores.anorexia,
      max: 8,
      cor: "#DC2626"
    }), /*#__PURE__*/React.createElement(BarraEscoreBipolar, {
      label: "Bulimia Nervosa / TCA",
      valor: escores.bulimia,
      max: 8,
      cor: "#7C3AED"
    }), /*#__PURE__*/React.createElement(BarraEscoreBipolar, {
      label: "TCA Puro (sem purga\xE7\xE3o)",
      valor: escores.tca,
      max: 4,
      cor: "#2563EB"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10
      }
    }, "An\xE1lise DSM-5"), laudo.criterios.map((c, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: "10px 14px",
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 13
      }
    }, c.label), /*#__PURE__*/React.createElement(CorBadgeCriterio, {
      atende: c.atende
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#4B5563"
      }
    }, c.obs)))), laudo.atencao.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10
      }
    }, "Pontos de aten\xE7\xE3o para a entrevista cl\xEDnica"), laudo.atencao.map((a, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: "#FFF7ED",
        borderLeft: "3px solid #F97316",
        padding: "8px 12px",
        marginBottom: 6,
        borderRadius: "0 6px 6px 0",
        fontSize: 12
      }
    }, a))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10
      }
    }, "Respostas por respondente"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, docs.map(d => /*#__PURE__*/React.createElement("div", {
      key: d.id,
      style: {
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        marginBottom: 10
      }
    }, d.tipoRespondente === "paciente" ? "Próprio paciente" : (d.nomeRespondente || "Familiar") + " · " + (d.parentesco || "")), PERGUNTAS_ALIMENTAR.map(p => /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 0",
        borderBottom: "1px solid #F3F4F6"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 24,
        height: 24,
        minWidth: 24,
        borderRadius: "50%",
        background: d[p.id] ? COR_LETRA_TRIAGEM[d[p.id]] + "22" : "#F3F4F6",
        border: "2px solid " + (d[p.id] ? COR_LETRA_TRIAGEM[d[p.id]] : "#E5E7EB"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 700,
        color: d[p.id] ? COR_LETRA_TRIAGEM[d[p.id]] : "#9CA3AF"
      }
    }, d[p.id] || "—"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#374151",
        flex: 1
      }
    }, p.texto), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF",
        whiteSpace: "nowrap"
      }
    }, p.eixo))), d.obsFinais && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        background: "#F9FAFB",
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 12,
        color: "#4B5563"
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Observa\xE7\xF5es:"), " ", d.obsFinais)))));
  })());
}

// ═══════════════════════════════════════════════════════════════════
// Rastreamento de Saúde Sexual — bespoke, respondido apenas pelo
// paciente (confidencial). Traz análise etiológica diferencial além
// das hipóteses DSM-5, igual ao modelo.
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS_SEXUAL = [{
  id: "p1",
  eixo: "Desejo",
  texto: "Ausência ou redução persistente de desejo sexual (≥6m)"
}, {
  id: "p2",
  eixo: "Desejo",
  texto: "Repulsa ou aversão ativa ao contato sexual"
}, {
  id: "p3",
  eixo: "Excitação",
  texto: "Dificuldade na resposta física de excitação"
}, {
  id: "p4",
  eixo: "Orgasmo",
  texto: "Atraso ou ausência de orgasmo"
}, {
  id: "p5",
  eixo: "Ejaculação",
  texto: "Ejaculação precoce / involuntária (homens)"
}, {
  id: "p6",
  eixo: "Ejaculação",
  texto: "Atraso ou ausência de ejaculação (homens)"
}, {
  id: "p7",
  eixo: "Dor",
  texto: "Dor genital ou pélvica durante penetração"
}, {
  id: "p8",
  eixo: "Dor",
  texto: "Contração involuntária e medo da penetração (mulheres)"
}, {
  id: "p9",
  eixo: "Contexto",
  texto: "Persistência ≥6 meses com sofrimento clínico"
}, {
  id: "p10",
  eixo: "Contexto",
  texto: "Generalizado vs. situacional"
}, {
  id: "p11",
  eixo: "Contexto",
  texto: "Fator etiológico associado"
}];
function laudoSexual(doc) {
  const p = id => doc[id] || "A";
  let hipotese = [];
  const criterios = [];
  const atencao = [];
  const temCriterio = p("p9") === "C";
  const generalizado = p("p10") === "C";
  const etiologia = p("p11");
  if (p("p1") === "C") {
    hipotese.push("Transtorno do Desejo Sexual Hipoativo");
    criterios.push({
      label: "Desejo Sexual Hipoativo (DSM-5 F52.0)",
      atende: temCriterio,
      obs: "Ausência crônica de desejo por ≥6 meses com sofrimento clínico. " + (generalizado ? "Caráter generalizado." : "Caráter situacional — avaliar fatores relacionais.")
    });
    atencao.push("Investigar queda hormonal (testosterona/estrogênio), uso de antidepressivos ISRS e conflitos relacionais.");
  }
  if (p("p2") === "C") {
    hipotese.push("Aversão Sexual");
    criterios.push({
      label: "Aversão Sexual",
      atende: temCriterio,
      obs: "Evitação fóbica ativa de contato sexual. Avaliar histórico de trauma ou abuso sexual."
    });
    atencao.push("Rastrear histórico de trauma sexual — alta prevalência de TEPT associado à aversão sexual.");
  }
  if (p("p3") === "C") {
    hipotese.push("Transtorno de Excitação");
    criterios.push({
      label: "Transtorno de Excitação (DSM-5 F52.22/F52.21)",
      atende: temCriterio,
      obs: "Disfunção erétil ou déficit de lubrificação crônico. " + (etiologia === "B" ? "Possível efeito iatrogênico de medicação." : etiologia === "A" ? "Investigar causa orgânica vascular/neurológica." : "Fator psicogênico predominante.")
    });
    if (etiologia === "A") atencao.push("Encaminhar para urologia/ginecologia — possível causa orgânica vascular ou hormonal.");
    if (etiologia === "B") atencao.push("Revisar medicações em uso — ISRS, anti-hipertensivos e anticoncepcionais são causas iatrogênicas frequentes.");
  }
  if (p("p4") === "C") {
    hipotese.push("Transtorno do Orgasmo / Anorgasmia");
    criterios.push({
      label: "Anorgasmia (DSM-5 F52.31/F52.32)",
      atende: temCriterio,
      obs: "Ausência ou grande dificuldade persistente de atingir o orgasmo. Avaliar se é primária (nunca teve) ou secundária (perdeu após período funcional)."
    });
    atencao.push("Diferenciar anorgasmia primária (nunca vivenciou orgasmo) de secundária (perdeu após período funcional).");
  }
  if (p("p5") === "C") {
    hipotese.push("Ejaculação Precoce");
    criterios.push({
      label: "Ejaculação Precoce (DSM-5 F52.4)",
      atende: temCriterio,
      obs: "Padrão persistente de ejaculação involuntária. " + (generalizado ? "Caráter generalizado — não situacional." : "Caráter situacional.")
    });
    atencao.push("Avaliar ansiedade de desempenho como fator primário — técnica de start-stop e terapia sexual indicadas.");
  }
  if (p("p6") === "C") {
    hipotese.push("Ejaculação Retardada");
    criterios.push({
      label: "Ejaculação Retardada (DSM-5 F52.32)",
      atende: temCriterio,
      obs: "Atraso extremo ou incapacidade de ejacular intravaginal. Investigar uso de antidepressivos e fatores psicogênicos."
    });
    atencao.push("Ejaculação retardada tem alta correlação com uso de ISRS — avaliar ajuste medicamentoso com psiquiatra.");
  }
  if (p("p7") === "C") {
    hipotese.push("Dispareunia / Dor Gênito-Pélvica");
    criterios.push({
      label: "Transtorno de Dor Gênito-Pélvica/Penetração (DSM-5 F52.6)",
      atende: temCriterio,
      obs: "Dor genital/pélvica recorrente. Diferencial com endometriose, vulvodínia e vaginismo deve ser feito em consulta ginecológica."
    });
    atencao.push("Encaminhar para ginecologia — descartar endometriose, vulvodínia e outras causas orgânicas de dispareunia.");
  }
  if (p("p8") === "C") {
    if (!hipotese.includes("Dispareunia / Dor Gênito-Pélvica")) hipotese.push("Vaginismo");
    criterios.push({
      label: "Vaginismo (DSM-5 F52.6)",
      atende: temCriterio,
      obs: "Espasmo involuntário da musculatura pélvica com medo fóbico da penetração. Alta resposta à terapia sexual com fisioterapia pélvica."
    });
    atencao.push("Vaginismo tem excelente prognóstico com fisioterapia pélvica + terapia sexual — encaminhar para especialistas.");
    atencao.push("Rastrear histórico de trauma sexual — fator etiológico frequente no vaginismo.");
  }
  if (hipotese.length === 0) {
    hipotese.push("Sem hipótese diagnóstica definida pelos escores — avaliação clínica aprofundada indicada.");
    criterios.push({
      label: "Disfunções Sexuais DSM-5",
      atende: false,
      obs: "Escores abaixo do limiar para todos os diagnósticos avaliados."
    });
  }
  const etioLabel = etiologia === "A" ? "Orgânica/Médica" : etiologia === "B" ? "Iatrogênica (medicação)" : "Psicogênica/Relacional";
  const etioObs = etiologia === "A" ? "Investigação médica especializada indicada (urologia, ginecologia, endocrinologia)." : etiologia === "B" ? "Revisar medicações — especialmente ISRS, anti-hipertensivos e anticoncepcionais. Discutir com médico prescritor." : "Terapia sexual, psicoterapia cognitivo-comportamental e trabalho com crenças disfuncionais indicados.";
  return {
    hipotese: hipotese.join(" + "),
    criterios,
    atencao,
    etioLabel,
    etioObs,
    temCriterio,
    generalizado
  };
}
function AbaRastreamentoSexualView({
  usuario,
  paciente,
  aoVoltar
}) {
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    db.collection("clinica_rastreamento_sexual").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).get().then(snap => {
      const lista = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      lista.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
      setDocs(lista);
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }, [usuario.psiId, paciente.id]);
  async function gerarLink() {
    setGerandoLink(true);
    try {
      const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
      const cfg = cfgDoc.exists ? cfgDoc.data() : {};
      const token = gerarTokenLink();
      await db.collection("clinica_links_partilhados").doc(token).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome || "",
        tipo: "sexual",
        titulo: "Rastreamento de Saúde Sexual",
        nomeClinica: cfg.nome || "PsiCoWorking",
        corMarca: cfg.corPrimaria || "#6A2BD9",
        logoUrl: cfg.logoUrl || "",
        status: "enviado",
        cancelado: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      setLinkGerado(window.location.origin + "/psi/atividade/?t=" + token);
    } catch (e) {
      alert("Não foi possível gerar o link: " + e.message);
    } finally {
      setGerandoLink(false);
    }
  }
  function abrirWhatsApp() {
    const primeiroNome = (paciente.nome || "").split(" ")[0];
    const mensagem = `Olá!\n\n` + `Preparei um questionário clínico confidencial para você preencher: *Rastreamento de Saúde Sexual*.\n\n` + `Leva de 5 a 10 minutos — suas respostas são lidas apenas por mim. É só abrir o link abaixo:\n\n` + `${linkGerado}\n\n` + `Qualquer dúvida, me chama por aqui.`;
    const numero = (paciente.telefone || "").replace(/\D/g, "");
    const url = numero ? "https://wa.me/55" + numero + "?text=" + encodeURIComponent(mensagem) : "https://wa.me/?text=" + encodeURIComponent(mensagem);
    window.open(url, "_blank");
  }
  function copiarLink() {
    navigator.clipboard.writeText(linkGerado).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }
  async function gerarLaudo() {
    if (docs.length === 0) return;
    const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
    const cfg = cfgDoc.exists ? cfgDoc.data() : {};
    const nomeClinica = cfg.nome || "PsiCoWorking";
    const pacNome = paciente.nome || "Paciente";
    const dataDoc = new Date().toLocaleDateString("pt-BR");
    const doc = docs[0];
    const laudo = laudoSexual(doc);
    const respostasHtml = `
      <h3>Próprio paciente · Confidencial</h3>
      <table class="resp-table">
        <thead><tr><th>#</th><th>Item</th><th>Eixo</th><th>Resp.</th></tr></thead>
        <tbody>
          ${PERGUNTAS_SEXUAL.map(p => `<tr><td>${p.id.replace("p", "")}</td><td>${p.texto}</td><td>${p.eixo}</td><td><span class="letra" style="color:${COR_LETRA_TRIAGEM[doc[p.id]] || "#6b7280"}">${doc[p.id] || "—"}</span></td></tr>`).join("")}
        </tbody>
      </table>
      <div style="margin-top:12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2563eb;margin-bottom:4px">Etiologia predominante indicada</div>
        <div style="font-size:14px;font-weight:700;color:#1e40af;margin-bottom:6px">${laudo.etioLabel}</div>
        <div style="font-size:12px;color:#374151">${laudo.etioObs}</div>
      </div>`;
    const html = gerarHtmlLaudoTriagem({
      titulo: "Laudo de Rastreamento — Saúde Sexual",
      pacNome,
      nomeClinica,
      data: dataDoc,
      docs,
      barras: [],
      hipotese: laudo.hipotese,
      criterios: laudo.criterios,
      atencao: laudo.atencao,
      respostasHtmlExtra: respostasHtml
    });
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario botao-voltar-perfil",
    onClick: aoVoltar,
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-left",
    tamanho: 15
  }), " Voltar para Question\xE1rios"), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginBottom: 2
    }
  }, "Rastreamento de Sa\xFAde Sexual"), /*#__PURE__*/React.createElement("p", {
    className: "subtitulo-pagina",
    style: {
      marginBottom: 12
    }
  }, "Avalia\xE7\xE3o diferencial DSM-5 (11 crit\xE9rios) \xB7 Confidencial"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#F0FDF4",
      border: "1px solid #86EFAC",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 12,
      color: "#065F46",
      marginBottom: 16
    }
  }, "Este question\xE1rio \xE9 respondido apenas pelo pr\xF3prio paciente. Nenhum familiar tem acesso."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginBottom: 20
    }
  }, !linkGerado ? /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: gerarLink,
    disabled: gerandoLink
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "link",
    tamanho: 15
  }), " ", gerandoLink ? "Gerando..." : "Gerar link do questionário") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: copiarLink
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: copiado ? "check" : "link",
    tamanho: 14
  }), " ", copiado ? "Copiado!" : "Copiar link"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: abrirWhatsApp,
    style: {
      background: "#25D366"
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "message-circle",
    tamanho: 14
  }), " Enviar pelo WhatsApp")), docs.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: gerarLaudo
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "file-text",
    tamanho: 14
  }), " Gerar laudo em PDF")), carregando && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Carregando..."), !carregando && docs.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma resposta recebida ainda. Gere o link acima e envie ao paciente.")), !carregando && docs.length > 0 && (() => {
    const doc = docs[0];
    const laudo = laudoSexual(doc);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#F5F3FF",
        border: "1px solid #C4B5FD",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "var(--cor-marca)",
        marginBottom: 4
      }
    }, "Hip\xF3tese diagn\xF3stica prov\xE1vel"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: "#3D006A",
        lineHeight: 1.4
      }
    }, laudo.hipotese)), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#EFF6FF",
        border: "1px solid #BFDBFE",
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "#2563EB",
        marginBottom: 4
      }
    }, "Etiologia predominante"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        color: "#1E40AF",
        marginBottom: 4
      }
    }, laudo.etioLabel), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#374151"
      }
    }, laudo.etioObs)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10
      }
    }, "An\xE1lise DSM-5"), laudo.criterios.map((c, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: "10px 14px",
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 13
      }
    }, c.label), /*#__PURE__*/React.createElement(CorBadgeCriterio, {
      atende: c.atende
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#4B5563"
      }
    }, c.obs)))), laudo.atencao.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10
      }
    }, "Pontos de aten\xE7\xE3o para a entrevista cl\xEDnica"), laudo.atencao.map((a, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: "#FFF7ED",
        borderLeft: "3px solid #F97316",
        padding: "8px 12px",
        marginBottom: 6,
        borderRadius: "0 6px 6px 0",
        fontSize: 12
      }
    }, a))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10
      }
    }, "Respostas do paciente"), /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16
      }
    }, PERGUNTAS_SEXUAL.map(p => /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 0",
        borderBottom: "1px solid #F3F4F6"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 24,
        height: 24,
        minWidth: 24,
        borderRadius: "50%",
        background: doc[p.id] ? COR_LETRA_TRIAGEM[doc[p.id]] + "22" : "#F3F4F6",
        border: "2px solid " + (doc[p.id] ? COR_LETRA_TRIAGEM[doc[p.id]] : "#E5E7EB"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 700,
        color: doc[p.id] ? COR_LETRA_TRIAGEM[doc[p.id]] : "#9CA3AF"
      }
    }, doc[p.id] || "—"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#374151",
        flex: 1
      }
    }, p.texto), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF",
        whiteSpace: "nowrap"
      }
    }, p.eixo)))));
  })());
}

// ═══════════════════════════════════════════════════════════════════
// Rastreamento de Funcionamento e Comportamento (TDAH/TEA/TOD) —
// bespoke, 4 eixos independentes (não excludentes entre si).
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS_NEURO = [{
  id: "p1",
  eixo: "TDAH Inatenção",
  texto: "Falhas em detalhes / erros por descuido"
}, {
  id: "p2",
  eixo: "TDAH Inatenção",
  texto: "Dificuldade em manter foco em tarefas longas"
}, {
  id: "p3",
  eixo: "TDAH Inatenção",
  texto: "Abandona tarefas antes de terminar"
}, {
  id: "p4",
  eixo: "TDAH Inatenção",
  texto: "Desorganização crônica de tempo e espaço"
}, {
  id: "p5",
  eixo: "TDAH Inatenção",
  texto: "Evitação de tarefas com esforço mental prolongado"
}, {
  id: "p6",
  eixo: "TDAH Inatenção",
  texto: "Perda frequente de objetos essenciais"
}, {
  id: "p7",
  eixo: "TDAH Inatenção",
  texto: "Distrabilidade por estímulos externos"
}, {
  id: "p8",
  eixo: "TDAH Inatenção",
  texto: "Esquecimentos de compromissos e rotinas"
}, {
  id: "p9",
  eixo: "TDAH Hiperatividade",
  texto: "Inquietação motora (mãos, pés, corpo)"
}, {
  id: "p10",
  eixo: "TDAH Hiperatividade",
  texto: "Dificuldade em permanecer sentado(a)"
}, {
  id: "p11",
  eixo: "TDAH Hiperatividade",
  texto: "Sensação de aceleração interna crônica"
}, {
  id: "p12",
  eixo: "TDAH Hiperatividade",
  texto: "Fala excessiva / monopoliza conversas"
}, {
  id: "p13",
  eixo: "TDAH Hiperatividade",
  texto: "Precipitação de respostas / completa frases alheias"
}, {
  id: "p14",
  eixo: "TDAH Hiperatividade",
  texto: "Dificuldade para esperar / impaciência extrema"
}, {
  id: "p15",
  eixo: "TDAH Hiperatividade",
  texto: "Interrupção ou intrusão em atividades alheias"
}, {
  id: "p16",
  eixo: "TEA",
  texto: "Dificuldade na reciprocidade social"
}, {
  id: "p17",
  eixo: "TEA",
  texto: "Uso atípico de contato visual / expressão facial"
}, {
  id: "p18",
  eixo: "TEA",
  texto: "Dificuldade em fazer e manter amigos"
}, {
  id: "p19",
  eixo: "TEA",
  texto: "Movimentos ou falas repetitivas (stimming)"
}, {
  id: "p20",
  eixo: "TEA",
  texto: "Angústia severa diante de mudanças de rotina"
}, {
  id: "p21",
  eixo: "TEA",
  texto: "Interesses restritos e hiperfixados"
}, {
  id: "p22",
  eixo: "TEA",
  texto: "Hiper ou hipossensibilidade sensorial"
}, {
  id: "p23",
  eixo: "TOD",
  texto: "Humor irritável e irascível"
}, {
  id: "p24",
  eixo: "TOD",
  texto: "Discussões com figuras de autoridade"
}, {
  id: "p25",
  eixo: "TOD",
  texto: "Desobediência ativa e recusa de regras"
}, {
  id: "p26",
  eixo: "TOD",
  texto: "Incomoda deliberadamente outras pessoas"
}, {
  id: "p27",
  eixo: "TOD",
  texto: "Culpa os outros pelos próprios erros"
}, {
  id: "p28",
  eixo: "TOD",
  texto: "Rancor e vingança persistentes"
}];
function calcularEscoresNeuro(doc) {
  const pontuar = id => pontuarLetraTriagem(doc[id]);
  const ids = (a, b) => Array.from({
    length: b - a + 1
  }, (_, i) => "p" + (a + i));
  return {
    tdahIn: ids(1, 8).reduce((s, id) => s + pontuar(id), 0),
    tdahHi: ids(9, 15).reduce((s, id) => s + pontuar(id), 0),
    tea: ids(16, 22).reduce((s, id) => s + pontuar(id), 0),
    tod: ids(23, 28).reduce((s, id) => s + pontuar(id), 0)
  };
}
function laudoNeuro(escores) {
  const {
    tdahIn,
    tdahHi,
    tea,
    tod
  } = escores;
  const pIn = Math.round(tdahIn / 16 * 100);
  const pHi = Math.round(tdahHi / 14 * 100);
  const pTea = Math.round(tea / 14 * 100);
  const pTod = Math.round(tod / 12 * 100);
  const nivel = pct => pct >= 75 ? "Severo" : pct >= 50 ? "Moderado" : pct >= 25 ? "Leve" : "Subliminar";
  let hipotese = [];
  const criterios = [];
  const atencao = [];
  if (pIn >= 50 || pHi >= 50) {
    const subtipo = pIn >= 50 && pHi >= 50 ? "Apresentação Combinada" : pIn >= 50 ? "Predominantemente Desatento" : "Predominantemente Hiperativo/Impulsivo";
    hipotese.push("TDAH — " + subtipo);
    criterios.push({
      label: "TDAH (" + subtipo + ")",
      atende: true,
      obs: "Inatenção: " + nivel(pIn) + " (" + pIn + "%) · Hiperatividade: " + nivel(pHi) + " (" + pHi + "%). Verificar início antes dos 12 anos e prejuízo em múltiplos contextos (DSM-5 Critério C)."
    });
    atencao.push("Confirmar início dos sintomas antes dos 12 anos de idade (critério obrigatório DSM-5).");
    atencao.push("Verificar se os sintomas ocorrem em pelo menos 2 contextos (escola/trabalho, casa, social).");
  } else {
    criterios.push({
      label: "TDAH",
      atende: false,
      obs: "Escores abaixo do limiar clínico para ambos os subtipos."
    });
  }
  if (pTea >= 50) {
    hipotese.push("TEA — Transtorno do Espectro Autista");
    criterios.push({
      label: "TEA (DSM-5 F84.0)",
      atende: true,
      obs: "Escore " + nivel(pTea) + " (" + pTea + "%). Verificar se déficits em comunicação social e padrões restritos estão presentes desde o período do desenvolvimento precoce."
    });
    atencao.push("Investigar histórico de desenvolvimento precoce — sinais de TEA devem estar presentes desde a infância.");
    atencao.push("Diferenciar hiperfoco do TEA (restrito e intenso) da desatenção seletiva do TDAH.");
    if (pIn >= 40) atencao.push("Alta sobreposição TDAH + TEA detectada — avaliar comorbidade (presente em ~50% dos casos de TEA).");
  } else {
    criterios.push({
      label: "TEA",
      atende: false,
      obs: "Escores abaixo do limiar — traços presentes mas insuficientes para indicação clínica de TEA."
    });
  }
  if (pTod >= 50) {
    hipotese.push("TOD — Transtorno Opositivo-Desafiador");
    criterios.push({
      label: "TOD (DSM-5 F91.3)",
      atende: true,
      obs: "Escore " + nivel(pTod) + " (" + pTod + "%). Avaliar se o padrão é persistente por ≥6 meses e presente com pelo menos uma pessoa que não seja irmão."
    });
    atencao.push("Diferenciar se a irritabilidade e oposição decorrem de desregulação emocional do TDAH ou de TOD independente.");
    atencao.push("Verificar duração ≥6 meses e prejuízo em pelo menos um contexto (DSM-5 Critério B).");
  } else {
    criterios.push({
      label: "TOD",
      atende: false,
      obs: "Escores abaixo do limiar clínico."
    });
  }
  if (hipotese.length === 0) hipotese.push("Sem hipótese diagnóstica definida pelos escores — avaliação clínica aprofundada indicada.");
  return {
    hipotese: hipotese.join(" + "),
    criterios,
    atencao,
    pIn,
    pHi,
    pTea,
    pTod,
    nivel
  };
}
function AbaRastreamentoNeuroView({
  usuario,
  paciente,
  aoVoltar
}) {
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    db.collection("clinica_rastreamento_neuro").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).get().then(snap => {
      const lista = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      lista.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
      setDocs(lista);
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }, [usuario.psiId, paciente.id]);
  async function gerarLink() {
    setGerandoLink(true);
    try {
      const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
      const cfg = cfgDoc.exists ? cfgDoc.data() : {};
      const token = gerarTokenLink();
      await db.collection("clinica_links_partilhados").doc(token).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome || "",
        tipo: "neuro",
        titulo: "Rastreamento de Funcionamento e Comportamento",
        nomeClinica: cfg.nome || "PsiCoWorking",
        corMarca: cfg.corPrimaria || "#6A2BD9",
        logoUrl: cfg.logoUrl || "",
        status: "enviado",
        cancelado: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      setLinkGerado(window.location.origin + "/psi/atividade/?t=" + token);
    } catch (e) {
      alert("Não foi possível gerar o link: " + e.message);
    } finally {
      setGerandoLink(false);
    }
  }
  function abrirWhatsApp() {
    const primeiroNome = (paciente.nome || "").split(" ")[0];
    const mensagem = `Olá!\n\n` + `Preparei um questionário clínico para você preencher sobre *${primeiroNome}*: *Rastreamento de Funcionamento e Comportamento*.\n\n` + `Leva de 10 a 15 minutos — é só abrir o link abaixo e responder com calma:\n\n` + `${linkGerado}\n\n` + `Qualquer dúvida, me chama por aqui.`;
    const numero = (paciente.telefone || "").replace(/\D/g, "");
    const url = numero ? "https://wa.me/55" + numero + "?text=" + encodeURIComponent(mensagem) : "https://wa.me/?text=" + encodeURIComponent(mensagem);
    window.open(url, "_blank");
  }
  function copiarLink() {
    navigator.clipboard.writeText(linkGerado).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }
  async function gerarLaudo() {
    if (docs.length === 0) return;
    const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
    const cfg = cfgDoc.exists ? cfgDoc.data() : {};
    const nomeClinica = cfg.nome || "PsiCoWorking";
    const pacNome = paciente.nome || "Paciente";
    const dataDoc = new Date().toLocaleDateString("pt-BR");
    const escoresPorDoc = docs.map(d => ({
      ...d,
      escores: calcularEscoresNeuro(d)
    }));
    const n = docs.length;
    const media = {
      tdahIn: Math.round(escoresPorDoc.reduce((s, d) => s + d.escores.tdahIn, 0) / n * 10) / 10,
      tdahHi: Math.round(escoresPorDoc.reduce((s, d) => s + d.escores.tdahHi, 0) / n * 10) / 10,
      tea: Math.round(escoresPorDoc.reduce((s, d) => s + d.escores.tea, 0) / n * 10) / 10,
      tod: Math.round(escoresPorDoc.reduce((s, d) => s + d.escores.tod, 0) / n * 10) / 10
    };
    const laudo = laudoNeuro(media);
    const respostasHtml = escoresPorDoc.map(d => `
      <h3>${d.tipoRespondente === "paciente" ? "Próprio paciente" : (d.nomeRespondente || "Familiar") + " (" + (d.parentesco || "—") + ")"}</h3>
      <table class="resp-table">
        <thead><tr><th>#</th><th>Item</th><th>Eixo</th><th>Resp.</th></tr></thead>
        <tbody>
          ${PERGUNTAS_NEURO.map(p => `<tr><td>${p.id.replace("p", "")}</td><td>${p.texto}</td><td>${p.eixo}</td><td><span class="letra" style="color:${COR_LETRA_TRIAGEM[d[p.id]] || "#6b7280"}">${d[p.id] || "—"}</span></td></tr>`).join("")}
          ${d.obsFinais ? `<tr><td colspan="2"><strong>Observações livres</strong></td><td colspan="2">${d.obsFinais}</td></tr>` : ""}
        </tbody>
      </table>`).join("");
    const html = gerarHtmlLaudoTriagem({
      titulo: "Laudo de Rastreamento — Funcionamento e Comportamento",
      pacNome,
      nomeClinica,
      data: dataDoc,
      docs,
      barras: [{
        label: "TDAH — Inatenção (8 itens)",
        pct: laudo.pIn,
        cor: "#7C3AED"
      }, {
        label: "TDAH — Hiperatividade/Impulsividade (7 itens)",
        pct: laudo.pHi,
        cor: "#DC2626"
      }, {
        label: "TEA — Espectro Autista (7 itens)",
        pct: laudo.pTea,
        cor: "#2563EB"
      }, {
        label: "TOD — Transtorno Opositivo-Desafiador (6 itens)",
        pct: laudo.pTod,
        cor: "#D97706"
      }],
      hipotese: laudo.hipotese,
      criterios: laudo.criterios,
      atencao: laudo.atencao,
      respostasHtmlExtra: respostasHtml
    });
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario botao-voltar-perfil",
    onClick: aoVoltar,
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "arrow-left",
    tamanho: 15
  }), " Voltar para Question\xE1rios"), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginBottom: 2
    }
  }, "Funcionamento e Comportamento"), /*#__PURE__*/React.createElement("p", {
    className: "subtitulo-pagina",
    style: {
      marginBottom: 20
    }
  }, "Avalia\xE7\xE3o de TDAH, TEA e TOD (28 crit\xE9rios DSM-5) \xB7 Instrumento aplicado ao paciente e/ou familiares"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginBottom: 20
    }
  }, !linkGerado ? /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: gerarLink,
    disabled: gerandoLink
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "link",
    tamanho: 15
  }), " ", gerandoLink ? "Gerando..." : "Gerar link do questionário") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: copiarLink
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: copiado ? "check" : "link",
    tamanho: 14
  }), " ", copiado ? "Copiado!" : "Copiar link"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: abrirWhatsApp,
    style: {
      background: "#25D366"
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "message-circle",
    tamanho: 14
  }), " Enviar pelo WhatsApp")), docs.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: gerarLaudo
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "file-text",
    tamanho: 14
  }), " Gerar laudo em PDF")), carregando && /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Carregando..."), !carregando && docs.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "cartao-secao"
  }, /*#__PURE__*/React.createElement("p", {
    className: "texto-vazio"
  }, "Nenhuma resposta recebida ainda. Gere o link acima e envie ao paciente ou familiar.")), !carregando && docs.length > 0 && (() => {
    const escoresPorDoc = docs.map(d => ({
      ...d,
      escores: calcularEscoresNeuro(d)
    }));
    const n = docs.length;
    const media = {
      tdahIn: Math.round(escoresPorDoc.reduce((s, d) => s + d.escores.tdahIn, 0) / n * 10) / 10,
      tdahHi: Math.round(escoresPorDoc.reduce((s, d) => s + d.escores.tdahHi, 0) / n * 10) / 10,
      tea: Math.round(escoresPorDoc.reduce((s, d) => s + d.escores.tea, 0) / n * 10) / 10,
      tod: Math.round(escoresPorDoc.reduce((s, d) => s + d.escores.tod, 0) / n * 10) / 10
    };
    const laudo = laudoNeuro(media);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#F5F3FF",
        border: "1px solid #C4B5FD",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "var(--cor-marca)",
        marginBottom: 4
      }
    }, "Hip\xF3tese diagn\xF3stica prov\xE1vel"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: "#3D006A",
        lineHeight: 1.4
      }
    }, laudo.hipotese)), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 12
      }
    }, "Escores m\xE9dios por eixo (", docs.length, " respondente", docs.length !== 1 ? "s" : "", ")"), /*#__PURE__*/React.createElement(BarraEscoreBipolar, {
      label: "TDAH \u2014 Inaten\xE7\xE3o",
      valor: media.tdahIn,
      max: 16,
      cor: "#7C3AED"
    }), /*#__PURE__*/React.createElement(BarraEscoreBipolar, {
      label: "TDAH \u2014 Hiperatividade/Impulsividade",
      valor: media.tdahHi,
      max: 14,
      cor: "#DC2626"
    }), /*#__PURE__*/React.createElement(BarraEscoreBipolar, {
      label: "TEA \u2014 Espectro Autista",
      valor: media.tea,
      max: 14,
      cor: "#2563EB"
    }), /*#__PURE__*/React.createElement(BarraEscoreBipolar, {
      label: "TOD \u2014 Opositivo-Desafiador",
      valor: media.tod,
      max: 12,
      cor: "#D97706"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10
      }
    }, "An\xE1lise DSM-5"), laudo.criterios.map((c, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: "10px 14px",
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 13
      }
    }, c.label), /*#__PURE__*/React.createElement(CorBadgeCriterio, {
      atende: c.atende
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#4B5563"
      }
    }, c.obs)))), laudo.atencao.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10
      }
    }, "Pontos de aten\xE7\xE3o para a entrevista cl\xEDnica"), laudo.atencao.map((a, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: "#FFF7ED",
        borderLeft: "3px solid #F97316",
        padding: "8px 12px",
        marginBottom: 6,
        borderRadius: "0 6px 6px 0",
        fontSize: 12
      }
    }, a))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10
      }
    }, "Respostas por respondente"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, docs.map(doc => /*#__PURE__*/React.createElement("div", {
      key: doc.id,
      style: {
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        marginBottom: 10
      }
    }, doc.tipoRespondente === "paciente" ? "Próprio paciente" : (doc.nomeRespondente || "Familiar") + " · " + (doc.parentesco || "")), PERGUNTAS_NEURO.map(p => /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 0",
        borderBottom: "1px solid #F3F4F6"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 24,
        height: 24,
        minWidth: 24,
        borderRadius: "50%",
        background: doc[p.id] ? COR_LETRA_TRIAGEM[doc[p.id]] + "22" : "#F3F4F6",
        border: "2px solid " + (doc[p.id] ? COR_LETRA_TRIAGEM[doc[p.id]] : "#E5E7EB"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 700,
        color: doc[p.id] ? COR_LETRA_TRIAGEM[doc[p.id]] : "#9CA3AF"
      }
    }, doc[p.id] || "—"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#374151",
        flex: 1
      }
    }, p.texto), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF",
        whiteSpace: "nowrap"
      }
    }, p.eixo))), doc.obsFinais && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        background: "#F9FAFB",
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 12,
        color: "#4B5563"
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Observa\xE7\xF5es:"), " ", doc.obsFinais)))));
  })());
}
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
  if (aberto === "rastreamento") {
    return /*#__PURE__*/React.createElement(AbaRastreamentoBipolarView, {
      usuario: usuario,
      paciente: paciente,
      aoVoltar: () => setAberto(null)
    });
  }
  if (aberto === "alimentar") {
    return /*#__PURE__*/React.createElement(AbaRastreamentoAlimentarView, {
      usuario: usuario,
      paciente: paciente,
      aoVoltar: () => setAberto(null)
    });
  }
  if (aberto === "sexual") {
    return /*#__PURE__*/React.createElement(AbaRastreamentoSexualView, {
      usuario: usuario,
      paciente: paciente,
      aoVoltar: () => setAberto(null)
    });
  }
  if (aberto === "neuro") {
    return /*#__PURE__*/React.createElement(AbaRastreamentoNeuroView, {
      usuario: usuario,
      paciente: paciente,
      aoVoltar: () => setAberto(null)
    });
  }
  if (aberto && RASTREAMENTOS_ADMIN[aberto]) {
    return /*#__PURE__*/React.createElement(AbaRastreamentoView, {
      usuario: usuario,
      paciente: paciente,
      tipo: aberto,
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
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    db.collection("clinica_anamneses").where("psi_id", "==", usuario.psiId).where("pacienteId", "==", paciente.id).limit(1).get().then(snap => {
      if (!snap.empty) setAnamnese({
        id: snap.docs[0].id,
        ...snap.docs[0].data()
      });
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }, [usuario.psiId, paciente.id]);

  // Gera o link público do formulário de Anamnese, igual ao "Enviar
  // para paciente" dos Recursos Terapêuticos — mesma coleção
  // clinica_links_partilhados, só que com tipo "anamnese" em vez de
  // apontar pra um item do catálogo (gerarTokenLink vem de
  // app_recursos.js, carregado antes deste script no index.html).
  async function gerarLinkAnamnese() {
    setGerandoLink(true);
    try {
      const cfgDoc = await db.collection("psi_config").doc(usuario.psiId).get();
      const cfg = cfgDoc.exists ? cfgDoc.data() : {};
      const token = gerarTokenLink();
      await db.collection("clinica_links_partilhados").doc(token).set({
        psi_id: usuario.psiId,
        pacienteId: paciente.id,
        pacienteNome: paciente.nome || "",
        tipo: "anamnese",
        titulo: "Formulário de Anamnese",
        nomeClinica: cfg.nome || "PsiCoWorking",
        corMarca: cfg.corPrimaria || "#6A2BD9",
        logoUrl: cfg.logoUrl || "",
        status: "enviado",
        cancelado: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      setLinkGerado(window.location.origin + "/psi/atividade/?t=" + token);
    } catch (e) {
      alert("Não foi possível gerar o link: " + e.message);
    } finally {
      setGerandoLink(false);
    }
  }
  function abrirWhatsAppAnamnese() {
    const primeiroNome = (paciente.nome || "").split(" ")[0];
    const mensagem = `Olá, ${primeiroNome}!\n\n` + `Antes da nossa sessão, preciso que você preencha um formulário com algumas informações — leva de 10 a 20 minutos.\n\n` + `É só abrir o link abaixo no celular e responder com calma:\n\n` + `${linkGerado}\n\n` + `Qualquer dúvida, me chama por aqui.`;
    const numero = (paciente.telefone || "").replace(/\D/g, "");
    const url = numero ? "https://wa.me/55" + numero + "?text=" + encodeURIComponent(mensagem) : "https://wa.me/?text=" + encodeURIComponent(mensagem);
    window.open(url, "_blank");
  }
  function copiarLinkAnamnese() {
    navigator.clipboard.writeText(linkGerado).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }
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
    className: "texto-vazio",
    style: {
      marginBottom: 16
    }
  }, "Nenhuma anamnese encontrada para ", paciente.nome, ". Ela \xE9 preenchida pelo pr\xF3prio paciente num formul\xE1rio p\xFAblico \u2014 sem precisar de login, direto pelo celular."), !linkGerado ? /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: gerarLinkAnamnese,
    disabled: gerandoLink
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "link",
    tamanho: 15
  }), " ", gerandoLink ? "Gerando..." : "Gerar link do formulário") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#F9FAFB",
      border: "1px solid #E5E7EB",
      borderRadius: 10,
      padding: "10px 12px",
      fontSize: 12,
      wordBreak: "break-all",
      marginBottom: 12
    }
  }, linkGerado), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "botao-secundario",
    onClick: copiarLinkAnamnese
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: copiado ? "check" : "link",
    tamanho: 14
  }), " ", copiado ? "Copiado!" : "Copiar link"), /*#__PURE__*/React.createElement("button", {
    className: "botao-primario",
    onClick: abrirWhatsAppAnamnese,
    style: {
      background: "#25D366"
    }
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "message-circle",
    tamanho: 14
  }), " Enviar pelo WhatsApp")))), !carregando && anamnese && /*#__PURE__*/React.createElement("div", {
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