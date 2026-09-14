// ═══════════════════════════════════════════════════════════════
//  app_config.js — Configurações (nome, logo, cor primária)
//
//  Guarda em psi_config/{psi_id} (já protegido pelo firestore.rules:
//  leitura pública, escrita só da equipe daquela clínica).
//  A logo vai para Storage em logos/{psi_id}/... (storage.rules).
// ═══════════════════════════════════════════════════════════════

const storage = firebase.storage();
function TelaConfiguracoes({
  usuario
}) {
  const [nome, setNome] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("#7B00C4");
  const [logoUrl, setLogoUrl] = useState("");
  const [arquivoLogo, setArquivoLogo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  useEffect(() => {
    db.collection("psi_config").doc(usuario.psiId).get().then(doc => {
      if (doc.exists) {
        const dados = doc.data();
        setNome(dados.nome || "");
        setCorPrimaria(dados.corPrimaria || "#7B00C4");
        setLogoUrl(dados.logoUrl || "");
      }
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }, [usuario.psiId]);
  async function aoSalvar(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");
    setSalvando(true);
    try {
      let urlFinal = logoUrl;
      if (arquivoLogo) {
        const extensao = arquivoLogo.name.split(".").pop();
        const referencia = storage.ref(`logos/${usuario.psiId}/logo.${extensao}`);
        await referencia.put(arquivoLogo);
        urlFinal = await referencia.getDownloadURL();
        setLogoUrl(urlFinal);
      }
      await db.collection("psi_config").doc(usuario.psiId).set({
        nome,
        corPrimaria,
        logoUrl: urlFinal,
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      }, {
        merge: true
      });

      // Aplica a cor imediatamente nesta sessão, sem precisar recarregar.
      document.documentElement.style.setProperty("--cor-marca", corPrimaria);
      setMensagem("Configurações salvas!");
    } catch (e) {
      setErro(e.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
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
  }), /*#__PURE__*/React.createElement("label", null, "Cor principal"), /*#__PURE__*/React.createElement("div", {
    className: "linha-cor"
  }, /*#__PURE__*/React.createElement("input", {
    type: "color",
    value: corPrimaria,
    onChange: e => setCorPrimaria(e.target.value),
    className: "seletor-cor"
  }), /*#__PURE__*/React.createElement("span", {
    className: "valor-cor"
  }, corPrimaria)), /*#__PURE__*/React.createElement("label", null, "Logo"), logoUrl && /*#__PURE__*/React.createElement("img", {
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
  }, salvando ? "Salvando..." : "Salvar Configurações")));
}