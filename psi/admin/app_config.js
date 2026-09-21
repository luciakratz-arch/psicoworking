// ═══════════════════════════════════════════════════════════════
//  app_config.js — Configurações (nome, foto, logo, cor primária)
//
//  Guarda em psi_config/{psi_id} (já protegido pelo firestore.rules:
//  leitura pública, escrita só da equipe daquela clínica).
//  Foto e logo vão pro Storage em logos/{psi_id}/... (storage.rules).
// ═══════════════════════════════════════════════════════════════

const storage = appAdmin.storage();

function TelaConfiguracoes({ usuario }) {
  const [nome, setNome] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("#6A2BD9");
  const [logoUrl, setLogoUrl] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
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
    db.collection("psi_config")
      .doc(usuario.psiId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const dados = doc.data();
          setNome(dados.nome || "");
          setCorPrimaria(dados.corPrimaria || "#6A2BD9");
          setLogoUrl(dados.logoUrl || "");
          setFotoUrl(dados.fotoUrl || "");
          setWhatsapp(dados.whatsapp || "");
        }
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
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

      await db.collection("psi_config").doc(usuario.psiId).set(
        {
          nome,
          corPrimaria,
          logoUrl: urlLogoFinal,
          fotoUrl: urlFotoFinal,
          whatsapp,
          atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

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
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setLinkCopiado(true);
        setTimeout(() => setLinkCopiado(false), 2500);
      })
      .catch(() => prompt("Copie o link:", url));
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

        <label>WhatsApp da clínica <span className="opcional">(opcional — usado no botão "Reagendar" do paciente)</span></label>
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ex.: 62994644950" />

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

        <label>Sua foto (aparece no seu perfil, no rodapé do menu)</label>
        {fotoUrl && <img src={fotoUrl} alt="Foto atual" className="preview-foto" />}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setArquivoFoto(e.target.files[0] || null)}
        />
        <p className="dica-campo">PNG ou JPG, até 3MB. Fica melhor uma foto quadrada.</p>

        <label>Logo da clínica (aparece no topo do menu)</label>
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

      <div className="cartao-config" style={{ marginTop: 16 }}>
        <label>Link do Portal do Paciente</label>
        <p className="dica-campo">
          Compartilhe esse link com seus pacientes (por WhatsApp, e-mail, etc.) — ele já abre o Portal
          mostrando o nome e a cor da sua clínica na tela de login, em vez do genérico PsiCoWorking.
        </p>
        <button type="button" className="botao-secundario" onClick={copiarLinkPortal}>
          <Icone nome="link" tamanho={15} /> {linkCopiado ? "Copiado!" : "Copiar Link do Portal"}
        </button>
      </div>

      <div className="cartao-config" style={{ marginTop: 16 }}>
        <label>Envio automático de e-mails</label>
        <p className="dica-campo">
          Usado nos e-mails de aniversário dos pacientes. Clique abaixo para receber um e-mail de teste no
          seu próprio endereço e confirmar que está tudo funcionando.
        </p>
        <button type="button" className="botao-secundario" onClick={enviarEmailTeste}>
          <Icone nome="mail" tamanho={15} /> Enviar e-mail de teste
        </button>
        {statusEmailTeste && <p className="dica-campo" style={{ marginTop: 10 }}>{statusEmailTeste}</p>}
      </div>
    </div>
  );
}
