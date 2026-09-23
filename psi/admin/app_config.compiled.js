// ═══════════════════════════════════════════════════════════════
//  app_config.js — Configurações (nome, foto, logo, cor primária)
//
//  Guarda em psi_config/{psi_id} (já protegido pelo firestore.rules:
//  leitura pública, escrita só da equipe daquela clínica).
//  Foto e logo vão pro Storage em logos/{psi_id}/... (storage.rules).
// ═══════════════════════════════════════════════════════════════

const storage = appAdmin.storage();
function TelaConfiguracoes({
  usuario
}) {
  const [nome, setNome] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("#6A2BD9");
  const [logoUrl, setLogoUrl] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
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
  function copiarLinkPortal() {
    const url = `${window.location.origin}/psi/paciente/?psi=${usuario.psiId}`;
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