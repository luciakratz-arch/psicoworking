// Leitor de fábulas em imagens — caixa de texto com fundo escuro DENTRO da imagem, com letra maior.
// Usado pelos três leitores do sistema antigo (painel da psicóloga, aplicativo do paciente e página do link).
// Só entra em ação quando a fábula tem o campo "legendas" (um texto por página). Sem ele, nada muda.
// Quando "legendaSobreFaixa" é verdadeiro, a caixa também cobre a faixa de legenda pequena que já vem desenhada
// na imagem original (assim não aparece texto duplicado e as imagens não precisam ser refeitas).
(function () {
  const h = React.createElement;
  const COR_FAIXA = "#2b2e3b";

  // Caixa escura no rodapé da imagem. `fonte` em px ou CSS (ex.: "clamp(...)").
  function CaixaLegenda({ texto, sobreFaixa, fonte }) {
    return h("div", {
      style: {
        position: "absolute", left: 0, right: 0, bottom: 0, boxSizing: "border-box",
        background: COR_FAIXA, color: "white", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "8px 14px", textAlign: "center", fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: fonte, lineHeight: 1.4, pointerEvents: "none",
      },
    },
      // altura mínima: cobre a faixa antiga (cerca de 13% da altura da imagem = 9% da largura)
      sobreFaixa ? h("div", { style: { width: 0, paddingTop: "9%", flex: "none" } }) : null,
      h("span", null, texto));
  }

  // Imagem + caixa de texto, para o cartão normal. No cartão pequeno a caixa fica colada embaixo do desenho
  // (no mesmo quadro, como a faixa original) para não cobrir a arte; a faixa antiga é cortada fora.
  function ImagemComLegenda({ src, alt, legenda, sobreFaixa, onClick }) {
    const [nat, setNat] = React.useState(null);
    React.useEffect(() => {
      setNat(null);
      const im = new Image();
      im.onload = () => setNat({ w: im.naturalWidth, h: im.naturalHeight });
      im.src = src;
    }, [src]);
    const corte = sobreFaixa ? 0.155 : 0; // parte de baixo da imagem ocupada pela faixa antiga (máx. ~15,5%)
    const proporcao = nat ? nat.w + " / " + (nat.h * (1 - corte)) : "16 / 9";
    return h("div", { style: { width: "100%", borderRadius: 14, overflow: "hidden", cursor: onClick ? "zoom-in" : "default", background: COR_FAIXA, containerType: "inline-size" }, onClick },
      h("div", { style: { position: "relative", width: "100%", aspectRatio: proporcao, overflow: "hidden", lineHeight: 0 } },
        h("img", { src, alt, style: { position: "absolute", top: 0, left: 0, width: "100%", display: "block" } })),
      h("div", { style: { padding: "10px 14px 12px", textAlign: "center", color: "white", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "clamp(15px, 3.8cqw, 32px)", lineHeight: 1.45 } }, legenda));
  }

  // Tela cheia. Em pé, gira a imagem para ocupar a tela do celular; deitado, enche a tela. Toque na imagem esconde/mostra o texto.
  function LeitorTelaCheiaFabula({ paginas, idx, setIdx, onAvancar, onClose, legendas, sobreFaixa }) {
    const medir = () => ({ w: window.innerWidth, h: window.innerHeight });
    const [tam, setTam] = React.useState(medir());
    const [nat, setNat] = React.useState(null);
    const [mostrar, setMostrar] = React.useState(true);
    React.useEffect(() => {
      const atualizar = () => setTam(medir());
      window.addEventListener("resize", atualizar);
      window.addEventListener("orientationchange", atualizar);
      return () => { window.removeEventListener("resize", atualizar); window.removeEventListener("orientationchange", atualizar); };
    }, []);
    React.useEffect(() => {
      setNat(null);
      const im = new Image();
      im.onload = () => setNat({ w: im.naturalWidth, h: im.naturalHeight });
      im.src = paginas[idx];
    }, [idx]);

    const emPe = tam.h > tam.w;
    const quadroL = emPe ? tam.h : tam.w;
    const quadroA = emPe ? tam.w : tam.h;
    const estilo = emPe
      ? { position: "fixed", top: 0, left: 0, width: tam.h + "px", height: tam.w + "px", transformOrigin: "top left", transform: "rotate(90deg) translateY(-100%)" }
      : { position: "fixed", top: 0, left: 0, width: tam.w + "px", height: tam.h + "px" };
    const esc = nat ? Math.min(quadroL / nat.w, quadroA / nat.h) : 1;
    const larg = nat ? Math.round(nat.w * esc) : 0;
    const alt = nat ? Math.round(nat.h * esc) : 0;
    const leg = (legendas || [])[idx] || "";
    const ultima = idx === paginas.length - 1;
    const botao = { position: "absolute", top: "50%", transform: "translateY(-50%)", width: 54, height: 54, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.22)", color: "white", fontSize: 26, cursor: "pointer" };
    const fonte = Math.max(14, Math.min(26, Math.round(alt / 19)));

    return h("div", { style: Object.assign({ background: "#000", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }, estilo) },
      nat
        ? h("div", { style: { position: "relative", width: larg, height: alt, lineHeight: 0 }, onClick: () => setMostrar(v => !v) },
            h("img", { src: paginas[idx], alt: "Painel " + (idx + 1), style: { width: "100%", height: "100%", display: "block" } }),
            leg && mostrar ? h(CaixaLegenda, { texto: leg, sobreFaixa, fonte }) : null)
        : null,
      h("button", { onClick: () => setIdx(i => Math.max(0, i - 1)), disabled: idx === 0, "aria-label": "Página anterior", style: Object.assign({ left: 10, opacity: idx === 0 ? 0.25 : 1 }, botao) }, "‹"),
      h("button", { onClick: () => { if (!ultima) (onAvancar ? onAvancar() : setIdx(i => i + 1)); }, disabled: ultima, "aria-label": "Próxima página", style: Object.assign({ right: 10, opacity: ultima ? 0.25 : 1 }, botao) }, "›"),
      h("div", { style: { position: "absolute", top: 10, left: 14, color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter,sans-serif" } }, (idx + 1) + "/" + paginas.length),
      h("button", { onClick: onClose, "aria-label": "Fechar", style: { position: "absolute", top: 8, right: 10, height: 40, padding: "0 16px", borderRadius: 20, border: "none", background: "rgba(255,255,255,0.22)", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Inter,sans-serif" } }, "Fechar ✕"));
  }

  // Devolve os textos (legendas) de uma fábula: primeiro os do próprio documento; se não tiver, os do arquivo
  // legendas_fabulas.js (procurados pelo título). `sobreFaixa` indica que a imagem ainda traz a faixa pequena antiga.
  const norm = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  window.legendasDaFabula = function (item) {
    if (!item) return { legendas: [], sobreFaixa: false };
    if (Array.isArray(item.legendas) && item.legendas.length > 0) return { legendas: item.legendas, sobreFaixa: !!item.legendaSobreFaixa };
    const mapa = window.LEGENDAS_FABULAS || {};
    const chave = Object.keys(mapa).find((k) => norm(k) === norm(item.titulo || item.nome));
    return chave ? { legendas: mapa[chave], sobreFaixa: true } : { legendas: [], sobreFaixa: false };
  };

  window.ImagemComLegenda = ImagemComLegenda;
  window.LeitorTelaCheiaFabula = LeitorTelaCheiaFabula;
})();
