// ═══════════════════════════════════════════════════════════════
//  app_config.js — Configurações (nome, logo, cor primária)
//
//  Guarda em psi_config/{psi_id} (já protegido pelo firestore.rules:
//  leitura pública, escrita só da equipe daquela clínica).
//  A logo vai para Storage em logos/{psi_id}/... (storage.rules).
// ═══════════════════════════════════════════════════════════════

const storage = firebase.storage();

function TelaConfiguracoes({ usuario }) {
  const [nome, setNome] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("#6A2BD9");
  const [logoUrl, setLogoUrl] = useState("");
  const [arquivoLogo, setArquivoLogo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    db.collection("psi_config")
      .doc(usuario.psiId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const dados = doc.data();
          setNome(dados.nome || "");
          setCorPrimaria(dados.corPrimaria || "#6A2BD9");
          setLogoUrl(dados.logoUrl || "");
        }
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
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

      await db.collection("psi_config").doc(usuario.psiId).set(
        {
          nome,
          corPrimaria,
          logoUrl: urlFinal,
          atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

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
    return <div className="conteudo"><p>Carregando...</p></div>;
  }

  return (
    <div className="conteudo">
      <div className="cabecalho-secao">
        <h2>Configurações</h2>
      </div>

      <form className="cartao-config" onSubmit={aoSalvar}>
        <label>Nome da clínica (ou seu nome)</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Consultório Dra. Maria Silva" />

        <label>Cor principal</label>
        <div className="linha-cor">
          <input
            type="color"
            value={corPrimaria}
            onChange={(e) => setCorPrimaria(e.target.value)}
            className="seletor-cor"
          />
          <span className="valor-cor">{corPrimaria}</span>
        </div>

        <label>Logo</label>
        {logoUrl && <img src={logoUrl} alt="Logo atual" className="preview-logo" />}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setArquivoLogo(e.target.files[0] || null)}
        />
        <p className="dica-campo">PNG ou JPG, até 3MB.</p>

        {erro && <p className="mensagem-erro">{erro}</p>}
        {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}

        <button type="submit" className="botao-primario" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar Configurações"}
        </button>
      </form>
    </div>
  );
}
