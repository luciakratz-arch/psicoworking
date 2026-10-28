// Cartão de aniversário personalizado — gerado no próprio navegador (sem custo, sem servidor).
// Uso: window.abrirCartaoAniversario({ nome, genero, telefone, cor, assinatura, subtitulo })
//   - nome: nome completo do paciente (usa só o primeiro)
//   - genero: "Feminino" usa o estilo floral; qualquer outro valor usa o estilo neutro (balões)
//   - telefone: com ou sem DDD/55 (opcional; para abrir a conversa no WhatsApp)
//   - cor: cor dos textos (#RRGGBB); assinatura/subtitulo: texto da psicóloga (ex.: "Dra. Lucia Kratz", "Psicóloga · CRP 09/20590")
// O desenho de fundo e a mensagem giram a cada ano (3 fundos de cada estilo e 4 mensagens aprovadas).
// Botões: "Enviar pelo WhatsApp" (no celular abre o compartilhar com a imagem; no computador copia a imagem e abre a conversa)
// e "Baixar imagem". Os fundos ficam na pasta "cartoes/" ao lado deste arquivo.
(function () {
  const BASE = (document.currentScript && document.currentScript.src ? document.currentScript.src.replace(/[^/]*$/, "") : "") + "cartoes/";
  const FEM = ["fem_01", "fem_02", "fem_03"];
  const MASC = ["masc_01", "masc_02", "masc_03"];
  const MENSAGENS = [
    "Que este novo ciclo venha com leveza, saúde e muitos momentos que façam o seu coração sorrir.",
    "Que cada dia do novo ano lhe traga motivos para sorrir e a certeza de que você merece o melhor.",
    "Hoje é dia de celebrar quem você é e tudo o que já construiu. Que o novo ciclo seja cheio de paz e conquistas.",
    "Que este novo ciclo traga saúde, tranquilidade e a coragem de seguir realizando o que é importante para você.",
  ];
  const FONTE = "Lato, 'Segoe UI', Roboto, Arial, sans-serif";

  // fonte Lato (a mesma do cartão enviado por e-mail); se não carregar, usa a do aparelho
  try {
    if (!document.getElementById("fonte-cartao-lato")) {
      const l = document.createElement("link");
      l.id = "fonte-cartao-lato"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap";
      document.head.appendChild(l);
    }
  } catch (e) {}

const capitalizarNome = (n) => (n === n.toLowerCase() || n === n.toUpperCase()) ? n.charAt(0).toLocaleUpperCase("pt-BR") + n.slice(1).toLocaleLowerCase("pt-BR") : n;
  function escolher(genero, ano) {
    const lista = /^fem/i.test(genero || "") ? FEM : MASC;
    return { fundo: lista[ano % lista.length], mensagem: MENSAGENS[ano % MENSAGENS.length] };
  }

  function carregarImagem(url) {
    return new Promise((ok, erro) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => erro(new Error("fundo não carregou")); im.src = url; });
  }

  function quebrar(ctx, texto, larguraMax) {
    const linhas = []; let atual = "";
    texto.split(/\s+/).forEach((p) => {
      const t = (atual + " " + p).trim();
      if (ctx.measureText(t).width > larguraMax && atual) { linhas.push(atual); atual = p; } else atual = t;
    });
    if (atual) linhas.push(atual);
    return linhas;
  }

  async function desenhar({ nome, genero, cor, assinatura, subtitulo }) {
    try { await Promise.race([document.fonts.load("700 30px Lato"), new Promise((r) => setTimeout(r, 1500))]); await document.fonts.load("300 33px Lato"); } catch (e) {}
    const { fundo, mensagem } = escolher(genero, new Date().getFullYear());
    const img = await carregarImagem(BASE + fundo + ".jpg");
    const c = document.createElement("canvas"); c.width = 1080; c.height = 1350;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, 1080, 1350);
    const corTexto = /^#[0-9a-f]{6}$/i.test(cor || "") ? cor : "#6A2BD9";
    const primeiro = capitalizarNome(String(nome || "").trim().split(/\s+/)[0] || "");
    const corpoNome = primeiro.length <= 8 ? 104 : primeiro.length <= 12 ? 84 : 66;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    const txt = (t, y, peso, tam, cr, espaco) => {
      ctx.font = peso + " " + tam + "px " + FONTE; ctx.fillStyle = cr;
      if ("letterSpacing" in ctx) ctx.letterSpacing = (espaco || 0) + "px";
      ctx.fillText(t, 540 + (espaco ? espaco / 2 : 0), y);
      if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    };
    let y = 298;
    txt("PARABÉNS", y, 700, 30, corTexto, 9);
    y += 82; txt("Feliz aniversário,", y, 300, 46, "#3b3550");
    y += corpoNome * 0.95 + 14; txt(primeiro, y, 700, corpoNome, corTexto);
    y += 40; ctx.fillStyle = "#c9a24d"; ctx.fillRect(480, y, 120, 3);
    y += 62;
    ctx.font = "300 33px " + FONTE;
    quebrar(ctx, mensagem, 780).forEach((l) => { txt(l, y, 300, 33, "#3b3550"); y += 50; });
    y += 34; txt(assinatura || "", y, 700, 30, corTexto);
    if (subtitulo) { y += 36; txt(subtitulo, y, 400, 22, "#6b6480", 1); }
    return c;
  }

  const blobDe = (canvas, tipo, q) => new Promise((ok) => canvas.toBlob(ok, tipo, q));
  function numeroWhats(tel) {
    let n = String(tel || "").replace(/\D/g, "").replace(/^0+/, "");
    if (n.length === 10 || n.length === 11) n = "55" + n;
    return n;
  }

  async function abrirCartaoAniversario(dados) {
    const fundo = document.createElement("div");
    fundo.style.cssText = "position:fixed;inset:0;background:rgba(15,12,30,.6);z-index:100000;display:flex;align-items:center;justify-content:center;padding:14px;font-family:" + FONTE;
    const caixa = document.createElement("div");
    caixa.style.cssText = "background:#fff;border-radius:16px;max-width:430px;width:100%;max-height:96vh;overflow:auto;padding:16px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.35)";
    caixa.innerHTML = '<div style="font-weight:700;font-size:16px;margin-bottom:10px;color:#3b3550">Cartão de aniversário</div><div data-prev style="min-height:120px;color:#6b6480;padding:30px 0">Preparando o cartão...</div><div data-msg style="font-size:13px;color:#6b6480;min-height:18px;margin:8px 0"></div><div data-acoes style="display:flex;flex-direction:column;gap:8px"></div>';
    fundo.appendChild(caixa); document.body.appendChild(fundo);
    const fechar = () => { try { document.body.removeChild(fundo); } catch (e) {} };
    fundo.addEventListener("click", (e) => { if (e.target === fundo) fechar(); });
    const prev = caixa.querySelector("[data-prev]"), msg = caixa.querySelector("[data-msg]"), acoes = caixa.querySelector("[data-acoes]");
    const botao = (rotulo, estilo, aoClicar) => { const b = document.createElement("button"); b.textContent = rotulo; b.style.cssText = "padding:12px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;border:1.5px solid " + (dados.cor || "#6A2BD9") + ";" + estilo; b.onclick = aoClicar; acoes.appendChild(b); return b; };

    let canvas;
    try { canvas = await desenhar(dados); } catch (e) { prev.textContent = "Não foi possível montar o cartão agora."; botao("Fechar", "background:#fff;color:#444", fechar); return; }
    const jpg = await blobDe(canvas, "image/jpeg", 0.92);
    const nomeArq = "cartao-aniversario-" + String(dados.nome || "paciente").trim().split(/\s+/)[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") + ".jpg";
    const arquivo = new File([jpg], nomeArq, { type: "image/jpeg" });
    const url = URL.createObjectURL(jpg);
    prev.style.cssText = ""; prev.innerHTML = '<img alt="Cartão de aniversário" style="width:100%;border-radius:12px;display:block" src="' + url + '">';
    const primeiro = capitalizarNome(String(dados.nome || "").trim().split(/\s+/)[0] || "");
    const texto = "Feliz aniversário, " + primeiro + "! " + (dados.assinatura || "");

    botao("Enviar pelo WhatsApp", "background:" + (dados.cor || "#6A2BD9") + ";color:#fff", async () => {
      try {
        if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
          await navigator.share({ files: [arquivo], text: texto });
          return;
        }
      } catch (e) { if (e && e.name === "AbortError") return; }
      // computador: copia a imagem (para colar na conversa) e abre o WhatsApp do paciente
      let copiou = false;
      try {
        const png = await blobDe(canvas, "image/png");
        await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
        copiou = true;
      } catch (e) {}
      const n = numeroWhats(dados.telefone);
      window.open("https://wa.me/" + n + "?text=" + encodeURIComponent(texto), "_blank");
      msg.textContent = copiou ? "Imagem copiada. Na conversa do WhatsApp, aperte Ctrl + V para colar o cartão e envie." : "Use o botão Baixar imagem e anexe o cartão na conversa do WhatsApp.";
    });
    botao("Baixar imagem", "background:#fff;color:" + (dados.cor || "#6A2BD9"), () => { const a = document.createElement("a"); a.href = url; a.download = nomeArq; a.click(); });
    botao("Fechar", "background:#fff;color:#666;border-color:#ddd", fechar);
  }

  window.abrirCartaoAniversario = abrirCartaoAniversario;
  window.cartaoAniversarioEscolher = escolher;
})();
