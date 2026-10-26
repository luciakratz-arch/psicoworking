// ═══════════════════════════════════════════════════════════════
//  app_config.js — Configurações (nome, foto, logo, cor primária)
//
//  Guarda em psi_config/{psi_id} (já protegido pelo firestore.rules:
//  leitura pública, escrita só da equipe daquela clínica).
//  Foto e logo vão pro Storage em logos/{psi_id}/... (storage.rules).
// ═══════════════════════════════════════════════════════════════

const storage = appAdmin.storage();

// Plano da clínica: situação, vencimento, uso da IA e pedido de mudança de plano.
// O pedido só avisa a administradora; ela aplica o plano e registra o pagamento.
function CartaoMeuPlano({
  usuario
}) {
  const a = usarAssinatura(usuario.psiId);
  const [planos, setPlanos] = useState(null);
  const [pedido, setPedido] = useState(null);
  const [para, setPara] = useState("plus");
  const [ciclo, setCiclo] = useState("mensal");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");
  const [documento, setDocumento] = useState("");
  const [assinando, setAssinando] = useState(false);
  useEffect(() => {
    return db.collection("plataforma_config").doc("planos").onSnapshot(s => setPlanos(s.exists ? s.data() : {}), () => setPlanos({}));
  }, []);
  useEffect(() => {
    return db.collection("psi_pedidos_plano").doc(usuario.psiId).onSnapshot(s => setPedido(s.exists ? s.data() : null), () => setPedido(null));
  }, [usuario.psiId]);
  if (!a) return null;
  const padrao = {
    essencial: {
      nome: "Essencial",
      precoMensal: 39.9,
      precoAnual: 399
    },
    plus: {
      nome: "Plus",
      precoMensal: 69.9,
      precoAnual: 699
    }
  };
  const p = id => ({
    ...padrao[id],
    ...(planos && planos[id] || {})
  });
  const moeda = v => "R$ " + Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const dataBr = ts => ts && ts.toDate ? ts.toDate().toLocaleDateString("pt-BR") : "";
  const fundadora = a.origem === "fundadora";
  const cortesia = a.origem === "cortesia";
  const nomePlano = fundadora ? "Fundadora (acesso integral, sem cobrança)" : cortesia ? p(a.plano).nome + " (cortesia)" : p(a.plano).nome;
  const situacaoTxt = {
    teste: "Em teste até " + dataBr(a.testeAte),
    ativa: cortesia ? "Acesso gratuito" + (a.cortesiaAte ? " até " + dataBr(a.cortesiaAte) : ", sem prazo definido") : "Ativa" + (a.proximoVencimento ? ", próximo vencimento em " + dataBr(a.proximoVencimento) : ""),
    atrasada: "Pagamento em atraso",
    somente_leitura: "Somente leitura até " + dataBr(a.leituraAte),
    suspensa: "Suspensa",
    cancelada: "Cancelada"
  }[a.situacao] || a.situacao;
  const pendente = pedido && pedido.status === "pendente";
  const cobrancaAutomatica = !!(planos && planos.asaasAtivo);
  const jaEhEsse = !fundadora && !cortesia && a.situacao !== "teste" && a.plano === para;

  // Cobrança automática (Asaas): cria a assinatura e abre o link de pagamento.
  async function assinarAgora() {
    setAssinando(true);
    setMsg("");
    try {
      const fn = appAdmin.functions("southamerica-east1").httpsCallable("asaasAssinar");
      const r = await fn({
        plano: para,
        ciclo,
        cpfCnpj: documento
      });
      if (r.data && r.data.link) {
        window.open(r.data.link, "_blank", "noopener");
        setMsg("Abrimos a página de pagamento em outra aba. Assim que o pagamento for confirmado, o seu plano é liberado automaticamente.");
      }
    } catch (e) {
      setMsg(e.message || "Não foi possível gerar a cobrança.");
    } finally {
      setAssinando(false);
    }
  }
  async function pedirMudanca() {
    setEnviando(true);
    setMsg("");
    try {
      await db.collection("psi_pedidos_plano").doc(usuario.psiId).set({
        psi_id: usuario.psiId,
        nomeClinica: usuario.email,
        de: a.plano || "essencial",
        para,
        ciclo,
        status: "pendente",
        pedidoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      setMsg("Pedido enviado. Entraremos em contato para combinar o pagamento e liberar o plano.");
    } catch (e) {
      setMsg("Não foi possível enviar: " + e.message);
    } finally {
      setEnviando(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "cartao-config",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", null, "Meu plano"), /*#__PURE__*/React.createElement("p", {
    className: "dica-campo"
  }, /*#__PURE__*/React.createElement("strong", null, nomePlano), " \xB7 ", situacaoTxt), /*#__PURE__*/React.createElement(AvisoPlanoIA, {
    usuario: usuario
  }), !fundadora && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: para,
    onChange: e => setPara(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "essencial"
  }, p("essencial").nome, ": ", moeda(p("essencial").precoMensal), "/m\xEAs, sem IA"), /*#__PURE__*/React.createElement("option", {
    value: "plus"
  }, p("plus").nome, ": ", moeda(p("plus").precoMensal), "/m\xEAs, com IA")), /*#__PURE__*/React.createElement("select", {
    value: ciclo,
    onChange: e => setCiclo(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "mensal"
  }, "Pagamento mensal"), /*#__PURE__*/React.createElement("option", {
    value: "anual"
  }, "Pagamento anual (", moeda(p(para).precoAnual), ", com desconto)")), cobrancaAutomatica ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-primario",
    onClick: assinarAgora,
    disabled: assinando || jaEhEsse
  }, jaEhEsse ? "Este já é o seu plano" : assinando ? "Gerando cobrança..." : "Assinar agora") : /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: pedirMudanca,
    disabled: enviando || pendente || jaEhEsse
  }, pendente ? "Pedido já enviado" : jaEhEsse ? "Este já é o seu plano" : enviando ? "Enviando..." : "Quero este plano")), cobrancaAutomatica && !jaEhEsse && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      maxWidth: 360
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 12
    }
  }, "CPF ou CNPJ para a cobran\xE7a"), /*#__PURE__*/React.createElement("input", {
    value: documento,
    onChange: e => setDocumento(e.target.value),
    placeholder: "somente n\xFAmeros",
    inputMode: "numeric"
  })), a.linkCobranca && a.planoPretendido && /*#__PURE__*/React.createElement("p", {
    className: "dica-campo",
    style: {
      marginTop: 8
    }
  }, "Voc\xEA tem uma cobran\xE7a em aberto do plano ", p(a.planoPretendido).nome, ".", " ", /*#__PURE__*/React.createElement("a", {
    href: a.linkCobranca,
    target: "_blank",
    rel: "noopener",
    style: {
      color: "var(--cor-marca)",
      fontWeight: 700
    }
  }, "Pagar agora")), pendente && /*#__PURE__*/React.createElement("p", {
    className: "dica-campo",
    style: {
      marginTop: 8
    }
  }, "Voc\xEA j\xE1 pediu ", p(pedido.para).nome, " (", pedido.ciclo, ") em ", dataBr(pedido.pedidoEm), ". Aguarde o nosso contato."), msg && /*#__PURE__*/React.createElement("p", {
    className: "dica-campo",
    style: {
      marginTop: 8
    }
  }, msg)));
}
function TelaMeuPlano({
  usuario
}) {
  const a = usarAssinatura(usuario.psiId);
  const moeda = v => "R$ " + Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const dataBr = ts => ts && ts.toDate ? ts.toDate().toLocaleDateString("pt-BR") : "";
  const dataIso = s => s ? String(s).split("-").reverse().join("/") : "";
  const pagamentos = [...(a && a.pagamentos || [])].reverse();
  return /*#__PURE__*/React.createElement("div", {
    className: "conteudo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-secao"
  }, /*#__PURE__*/React.createElement("h2", null, "Meu plano")), /*#__PURE__*/React.createElement(CartaoMeuPlano, {
    usuario: usuario
  }), a && a.cobrancaAberta && a.linkCobranca && /*#__PURE__*/React.createElement("div", {
    className: "cartao-config",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", null, "Cobran\xE7a em aberto"), /*#__PURE__*/React.createElement("p", {
    className: "dica-campo"
  }, moeda(a.cobrancaAberta.valor), a.cobrancaAberta.vencimento ? " · vence em " + dataIso(a.cobrancaAberta.vencimento) : ""), /*#__PURE__*/React.createElement("a", {
    href: a.linkCobranca,
    target: "_blank",
    rel: "noopener",
    className: "botao-primario",
    style: {
      display: "inline-block",
      textDecoration: "none",
      marginTop: 8
    }
  }, "Pagar agora")), /*#__PURE__*/React.createElement("div", {
    className: "cartao-config"
  }, /*#__PURE__*/React.createElement("label", null, "Pagamentos"), pagamentos.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "dica-campo"
  }, "Nenhum pagamento registrado ainda.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      marginTop: 8
    }
  }, pagamentos.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 10,
      flexWrap: "wrap",
      fontSize: 13,
      borderBottom: "1px solid var(--borda)",
      paddingBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", null, dataBr(p.em), " \xB7 ", p.forma), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, moeda(p.valor)), " \xB7 cobre at\xE9 ", dataBr(p.ate)))))));
}
function TelaConfiguracoes({
  usuario
}) {
  const [nome, setNome] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("#6A2BD9");
  const [logoUrl, setLogoUrl] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [crp, setCrp] = useState("");
  const [cidade, setCidade] = useState("");
  const [tituloProfissional, setTituloProfissional] = useState("");
  const [arquivoLogo, setArquivoLogo] = useState(null);
  const [arquivoFoto, setArquivoFoto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [linkEquipeCopiado, setLinkEquipeCopiado] = useState(false);
  const [statusEmailTeste, setStatusEmailTeste] = useState("");
  async function enviarEmailTeste() {
    setStatusEmailTeste("Enviando...");
    try {
      const resultado = await functions.httpsCallable("enviarEmailTeste")();
      setStatusEmailTeste("Enviado para " + resultado.data.destino + " — confira sua caixa de entrada (pode levar 1 minuto).");
    } catch (e) {
      setStatusEmailTeste("Erro: " + (e.message || "não foi possível enviar."));
    }
  }
  useEffect(() => {
    db.collection("psi_config").doc(usuario.psiId).get().then(doc => {
      if (doc.exists) {
        const dados = doc.data();
        setNome(dados.nome || "");
        setCorPrimaria(dados.corPrimaria || "#6A2BD9");
        setLogoUrl(dados.logoUrl || "");
        setFotoUrl(dados.fotoUrl || "");
        setSlug(dados.slug || "");
        setWhatsapp(dados.whatsapp || "");
        setCrp(dados.crp || "");
        setCidade(dados.cidade || "");
        setTituloProfissional(dados.tituloProfissional || "");
      }
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }, [usuario.psiId]);
  async function enviarArquivo(arquivo, nomeArquivo) {
    const extensao = arquivo.name.split(".").pop();
    const referencia = storage.ref(`logos/${usuario.psiId}/${nomeArquivo}.${extensao}`);
    await referencia.put(arquivo);
    return referencia.getDownloadURL();
  }
  async function aoSalvar(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");
    setSalvando(true);
    try {
      let urlLogoFinal = logoUrl;
      let urlFotoFinal = fotoUrl;
      if (arquivoLogo) {
        urlLogoFinal = await enviarArquivo(arquivoLogo, "logo");
        setLogoUrl(urlLogoFinal);
      }
      if (arquivoFoto) {
        urlFotoFinal = await enviarArquivo(arquivoFoto, "foto");
        setFotoUrl(urlFotoFinal);
      }
      await db.collection("psi_config").doc(usuario.psiId).set({
        nome,
        corPrimaria,
        logoUrl: urlLogoFinal,
        fotoUrl: urlFotoFinal,
        whatsapp,
        crp: crp.trim(),
        cidade: cidade.trim(),
        tituloProfissional: tituloProfissional.trim(),
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      }, {
        merge: true
      });

      // Aplica a cor (e as variações clara/escura dos degradês)
      // imediatamente nesta sessão, sem precisar recarregar.
      aplicarCorMarca(corPrimaria);
      setMensagem("Configurações salvas!");
    } catch (e) {
      setErro(e.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  // Link de entrada da equipe (psicóloga e secretária): abre o login já com a
  // logo, o nome e a cor da clínica, em vez da tela genérica do PsiCoWorking.
  function copiarLinkEquipe() {
    const url = slug ? `https://psicoworking.app.br/${slug}/equipe` : `${window.location.origin}/psi/admin/?psi=${usuario.psiId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkEquipeCopiado(true);
      setTimeout(() => setLinkEquipeCopiado(false), 2500);
    }).catch(() => prompt("Copie o link:", url));
  }
  function copiarLinkPortal() {
    const url = slug ? `https://psicoworking.app.br/${slug}` : `${window.location.origin}/psi/paciente/?psi=${usuario.psiId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2500);
    }).catch(() => prompt("Copie o link:", url));
  }
  if (carregando) {
    return /*#__PURE__*/React.createElement("div", {
      className: "conteudo"
    }, /*#__PURE__*/React.createElement("p", null, "Carregando..."));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "conteudo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cabecalho-secao"
  }, /*#__PURE__*/React.createElement("h2", null, "Configura\xE7\xF5es")), /*#__PURE__*/React.createElement("form", {
    className: "cartao-config",
    onSubmit: aoSalvar
  }, /*#__PURE__*/React.createElement("label", null, "Nome da cl\xEDnica (ou seu nome)"), /*#__PURE__*/React.createElement("input", {
    value: nome,
    onChange: e => setNome(e.target.value),
    placeholder: "Ex.: Consult\xF3rio Dra. Maria Silva"
  }), /*#__PURE__*/React.createElement("label", null, "WhatsApp da cl\xEDnica ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional \u2014 usado no bot\xE3o \"Reagendar\" do paciente)")), /*#__PURE__*/React.createElement("input", {
    value: whatsapp,
    onChange: e => setWhatsapp(e.target.value),
    placeholder: "Ex.: 62994644950"
  }), /*#__PURE__*/React.createElement("label", null, "CRP ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(aparece nos laudos, relat\xF3rios e declara\xE7\xF5es)")), /*#__PURE__*/React.createElement("input", {
    value: crp,
    onChange: e => setCrp(e.target.value),
    placeholder: "Ex.: 09/12345"
  }), /*#__PURE__*/React.createElement("label", null, "Cidade ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(aparece na data dos documentos)")), /*#__PURE__*/React.createElement("input", {
    value: cidade,
    onChange: e => setCidade(e.target.value),
    placeholder: "Ex.: Goi\xE2nia, GO"
  }), /*#__PURE__*/React.createElement("label", null, "T\xEDtulo profissional ", /*#__PURE__*/React.createElement("span", {
    className: "opcional"
  }, "(opcional \u2014 aparece abaixo da assinatura)")), /*#__PURE__*/React.createElement("input", {
    value: tituloProfissional,
    onChange: e => setTituloProfissional(e.target.value),
    placeholder: "Ex.: Psic\xF3loga \xB7 TCC \xB7 Neuropsicologia"
  }), /*#__PURE__*/React.createElement("label", null, "Cor principal"), /*#__PURE__*/React.createElement("div", {
    className: "linha-cor"
  }, /*#__PURE__*/React.createElement("input", {
    type: "color",
    value: corPrimaria,
    onChange: e => setCorPrimaria(e.target.value),
    className: "seletor-cor"
  }), /*#__PURE__*/React.createElement("span", {
    className: "valor-cor"
  }, corPrimaria)), /*#__PURE__*/React.createElement("label", null, "Sua foto (aparece no seu perfil, no rodap\xE9 do menu)"), fotoUrl && /*#__PURE__*/React.createElement("img", {
    src: fotoUrl,
    alt: "Foto atual",
    className: "preview-foto"
  }), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: e => setArquivoFoto(e.target.files[0] || null)
  }), /*#__PURE__*/React.createElement("p", {
    className: "dica-campo"
  }, "PNG ou JPG, at\xE9 3MB. Fica melhor uma foto quadrada."), /*#__PURE__*/React.createElement("label", null, "Logo da cl\xEDnica (aparece no topo do menu)"), logoUrl && /*#__PURE__*/React.createElement("img", {
    src: logoUrl,
    alt: "Logo atual",
    className: "preview-logo"
  }), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: e => setArquivoLogo(e.target.files[0] || null)
  }), /*#__PURE__*/React.createElement("p", {
    className: "dica-campo"
  }, "PNG ou JPG, at\xE9 3MB."), erro && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-erro"
  }, erro), mensagem && /*#__PURE__*/React.createElement("p", {
    className: "mensagem-sucesso"
  }, mensagem), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "botao-primario",
    disabled: salvando
  }, salvando ? "Salvando..." : "Salvar Configurações")), /*#__PURE__*/React.createElement("div", {
    className: "cartao-config",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("label", null, "Link do Portal do Paciente"), /*#__PURE__*/React.createElement("p", {
    className: "dica-campo"
  }, "Compartilhe esse link com seus pacientes (por WhatsApp, e-mail, etc.) \u2014 ele j\xE1 abre o Portal mostrando o nome e a cor da sua cl\xEDnica na tela de login, em vez do gen\xE9rico PsiCoWorking."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: copiarLinkPortal
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "link",
    tamanho: 15
  }), " ", linkCopiado ? "Copiado!" : "Copiar Link do Portal")), /*#__PURE__*/React.createElement("div", {
    className: "cartao-config",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("label", null, "Link de entrada da equipe"), /*#__PURE__*/React.createElement("p", {
    className: "dica-campo"
  }, "Envie esse link para voc\xEA e para a sua secret\xE1ria entrarem no painel. A tela de login j\xE1 abre com o nome, a logo e a cor da sua cl\xEDnica."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: copiarLinkEquipe
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "link",
    tamanho: 15
  }), " ", linkEquipeCopiado ? "Copiado!" : "Copiar Link da Equipe")), /*#__PURE__*/React.createElement("div", {
    className: "cartao-config",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("label", null, "Envio autom\xE1tico de e-mails"), /*#__PURE__*/React.createElement("p", {
    className: "dica-campo"
  }, "Usado nos e-mails de anivers\xE1rio dos pacientes. Clique abaixo para receber um e-mail de teste no seu pr\xF3prio endere\xE7o e confirmar que est\xE1 tudo funcionando."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "botao-secundario",
    onClick: enviarEmailTeste
  }, /*#__PURE__*/React.createElement(Icone, {
    nome: "mail",
    tamanho: 15
  }), " Enviar e-mail de teste"), statusEmailTeste && /*#__PURE__*/React.createElement("p", {
    className: "dica-campo",
    style: {
      marginTop: 10
    }
  }, statusEmailTeste)));
}