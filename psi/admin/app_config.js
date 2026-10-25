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
function CartaoMeuPlano({ usuario }) {
  const a = usarAssinatura(usuario.psiId);
  const [planos, setPlanos] = useState(null);
  const [pedido, setPedido] = useState(null);
  const [para, setPara] = useState("plus");
  const [ciclo, setCiclo] = useState("mensal");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    return db.collection("plataforma_config").doc("planos").onSnapshot(
      (s) => setPlanos(s.exists ? s.data() : {}),
      () => setPlanos({})
    );
  }, []);
  useEffect(() => {
    return db.collection("psi_pedidos_plano").doc(usuario.psiId).onSnapshot(
      (s) => setPedido(s.exists ? s.data() : null),
      () => setPedido(null)
    );
  }, [usuario.psiId]);

  if (!a) return null;

  const padrao = {
    essencial: { nome: "Essencial", precoMensal: 39.9, precoAnual: 399 },
    plus: { nome: "Plus", precoMensal: 69.9, precoAnual: 699 },
  };
  const p = (id) => ({ ...padrao[id], ...((planos && planos[id]) || {}) });
  const moeda = (v) => "R$ " + Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dataBr = (ts) => (ts && ts.toDate ? ts.toDate().toLocaleDateString("pt-BR") : "");

  const fundadora = a.origem === "fundadora";
  const nomePlano = fundadora ? "Fundadora (acesso integral, sem cobrança)" : p(a.plano).nome;
  const situacaoTxt = {
    teste: "Em teste até " + dataBr(a.testeAte),
    ativa: "Ativa" + (a.proximoVencimento ? ", próximo vencimento em " + dataBr(a.proximoVencimento) : ""),
    atrasada: "Pagamento em atraso",
    somente_leitura: "Somente leitura até " + dataBr(a.leituraAte),
    suspensa: "Suspensa",
    cancelada: "Cancelada",
  }[a.situacao] || a.situacao;
  const pendente = pedido && pedido.status === "pendente";
  const jaEhEsse = !fundadora && a.situacao !== "teste" && a.plano === para;

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
        pedidoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setMsg("Pedido enviado. Entraremos em contato para combinar o pagamento e liberar o plano.");
    } catch (e) {
      setMsg("Não foi possível enviar: " + e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="cartao-config" style={{ marginBottom: 16 }}>
      <label>Meu plano</label>
      <p className="dica-campo">
        <strong>{nomePlano}</strong> · {situacaoTxt}
      </p>
      <AvisoPlanoIA usuario={usuario} />
      {!fundadora && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <select value={para} onChange={(e) => setPara(e.target.value)}>
              <option value="essencial">{p("essencial").nome}: {moeda(p("essencial").precoMensal)}/mês, sem IA</option>
              <option value="plus">{p("plus").nome}: {moeda(p("plus").precoMensal)}/mês, com IA</option>
            </select>
            <select value={ciclo} onChange={(e) => setCiclo(e.target.value)}>
              <option value="mensal">Pagamento mensal</option>
              <option value="anual">Pagamento anual ({moeda(p(para).precoAnual)}, com desconto)</option>
            </select>
            <button type="button" className="botao-secundario" onClick={pedirMudanca} disabled={enviando || pendente || jaEhEsse}>
              {pendente ? "Pedido já enviado" : jaEhEsse ? "Este já é o seu plano" : enviando ? "Enviando..." : "Quero este plano"}
            </button>
          </div>
          {pendente && (
            <p className="dica-campo" style={{ marginTop: 8 }}>
              Você já pediu {p(pedido.para).nome} ({pedido.ciclo}) em {dataBr(pedido.pedidoEm)}. Aguarde o nosso contato.
            </p>
          )}
          {msg && <p className="dica-campo" style={{ marginTop: 8 }}>{msg}</p>}
        </div>
      )}
    </div>
  );
}

function TelaConfiguracoes({ usuario }) {
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
          setSlug(dados.slug || "");
          setWhatsapp(dados.whatsapp || "");
          setCrp(dados.crp || "");
          setCidade(dados.cidade || "");
          setTituloProfissional(dados.tituloProfissional || "");
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
          crp: crp.trim(),
          cidade: cidade.trim(),
          tituloProfissional: tituloProfissional.trim(),
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

  // Link de entrada da equipe (psicóloga e secretária): abre o login já com a
  // logo, o nome e a cor da clínica, em vez da tela genérica do PsiCoWorking.
  function copiarLinkEquipe() {
    const url = slug ? `https://psicoworking.app.br/${slug}/equipe` : `${window.location.origin}/psi/admin/?psi=${usuario.psiId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setLinkEquipeCopiado(true);
        setTimeout(() => setLinkEquipeCopiado(false), 2500);
      })
      .catch(() => prompt("Copie o link:", url));
  }

  function copiarLinkPortal() {
    const url = slug ? `https://psicoworking.app.br/${slug}` : `${window.location.origin}/psi/paciente/?psi=${usuario.psiId}`;
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

      {usuario.role === "psi" && <CartaoMeuPlano usuario={usuario} />}

      <form className="cartao-config" onSubmit={aoSalvar}>
        <label>Nome da clínica (ou seu nome)</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Consultório Dra. Maria Silva" />

        <label>WhatsApp da clínica <span className="opcional">(opcional — usado no botão "Reagendar" do paciente)</span></label>
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ex.: 62994644950" />

        <label>CRP <span className="opcional">(aparece nos laudos, relatórios e declarações)</span></label>
        <input value={crp} onChange={(e) => setCrp(e.target.value)} placeholder="Ex.: 09/12345" />

        <label>Cidade <span className="opcional">(aparece na data dos documentos)</span></label>
        <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex.: Goiânia, GO" />

        <label>Título profissional <span className="opcional">(opcional — aparece abaixo da assinatura)</span></label>
        <input value={tituloProfissional} onChange={(e) => setTituloProfissional(e.target.value)} placeholder="Ex.: Psicóloga · TCC · Neuropsicologia" />

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
        <label>Link de entrada da equipe</label>
        <p className="dica-campo">
          Envie esse link para você e para a sua secretária entrarem no painel. A tela de login já abre
          com o nome, a logo e a cor da sua clínica.
        </p>
        <button type="button" className="botao-secundario" onClick={copiarLinkEquipe}>
          <Icone nome="link" tamanho={15} /> {linkEquipeCopiado ? "Copiado!" : "Copiar Link da Equipe"}
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
