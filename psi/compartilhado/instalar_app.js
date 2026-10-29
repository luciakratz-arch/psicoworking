// Faixa "Instalar no celular" que aparece nas telas do PsiCoWorking.
// Android/Chrome e computador: abre a instalação direto. iPhone: mostra os passos do Safari.
// Se a pessoa já instalou, ou fechou a faixa, ela não aparece de novo.
(function () {
  try {
    var jaInstalado = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    if (jaInstalado) return;
    var CHAVE = "psico_instalar_fechado";
    try { if (localStorage.getItem(CHAVE) === "1") return; } catch (e) {}

    // telas sem manifesto próprio ganham um, com o endereço da própria tela
    if (!document.querySelector('link[rel="manifest"]')) {
      var origem = location.origin;
      var m = {
        name: document.title || "PsiCoWorking", short_name: "PsiCoWorking",
        start_url: location.pathname, scope: "/", display: "standalone",
        background_color: "#3B0D6F", theme_color: "#6A2BD9",
        icons: [
          { src: origem + "/instalar/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: origem + "/instalar/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      };
      var l = document.createElement("link");
      l.rel = "manifest";
      l.href = URL.createObjectURL(new Blob([JSON.stringify(m)], { type: "application/manifest+json" }));
      document.head.appendChild(l);
    }

    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var pedido = null;
    var faixa = null;

    function css() {
      var s = document.createElement("style");
      s.textContent =
        ".psico-inst{position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;max-width:460px;margin:0 auto;background:#3B0D6F;color:#fff;border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 28px rgba(0,0,0,.3);font-family:'DM Sans',system-ui,sans-serif}" +
        ".psico-inst img{width:42px;height:42px;border-radius:10px;flex:none}" +
        ".psico-inst div{flex:1;font-size:13.5px;line-height:1.35}" +
        ".psico-inst b{display:block;font-size:14.5px}" +
        ".psico-inst button{font:600 14px 'DM Sans',system-ui,sans-serif;border:0;border-radius:10px;cursor:pointer}" +
        ".psico-inst .sim{background:#fff;color:#6A2BD9;padding:10px 16px}" +
        ".psico-inst .x{background:transparent;color:#EADDFC;font-size:20px;padding:4px 8px}" +
        ".psico-inst-ajuda{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px}" +
        ".psico-inst-ajuda div{background:#fff;color:#1F1B2E;border-radius:16px;padding:22px;max-width:380px;font:15px/1.6 'DM Sans',system-ui,sans-serif}" +
        ".psico-inst-ajuda h3{margin:0 0 10px;font-size:18px}.psico-inst-ajuda ol{margin:0 0 14px;padding-left:20px}" +
        ".psico-inst-ajuda button{background:#6A2BD9;color:#fff;border:0;border-radius:10px;padding:10px 18px;font:600 14px 'DM Sans',sans-serif;cursor:pointer}";
      document.head.appendChild(s);
    }

    function ajuda() {
      var f = document.createElement("div");
      f.className = "psico-inst-ajuda";
      f.innerHTML = "<div><h3>Instalar no celular</h3><ol>" +
        (ios
          ? "<li>Abra esta página no <b>Safari</b>.</li><li>Toque no botão de compartilhar (quadrado com seta para cima).</li><li>Escolha <b>Adicionar à Tela de Início</b>.</li>"
          : "<li>Toque nos <b>três pontinhos</b> do navegador.</li><li>Escolha <b>Instalar aplicativo</b> ou <b>Adicionar à tela inicial</b>.</li>") +
        "</ol><button type='button'>Entendi</button></div>";
      f.onclick = function (e) { if (e.target === f || e.target.tagName === "BUTTON") f.remove(); };
      document.body.appendChild(f);
    }

    function mostrar() {
      if (faixa || !document.body) return;
      css();
      faixa = document.createElement("div");
      faixa.className = "psico-inst";
      faixa.innerHTML = "<img src='/instalar/icone-192.png' alt=''><div><b>Instale o PsiCoWorking</b>Tenha o atalho na tela do seu celular.</div>" +
        "<button type='button' class='sim'>Instalar</button><button type='button' class='x' aria-label='Fechar'>&times;</button>";
      faixa.querySelector(".sim").onclick = function () {
        if (pedido) {
          pedido.prompt();
          pedido.userChoice.then(function () { pedido = null; faixa.remove(); });
        } else ajuda();
      };
      faixa.querySelector(".x").onclick = function () {
        faixa.remove();
        try { localStorage.setItem(CHAVE, "1"); } catch (e) {}
      };
      document.body.appendChild(faixa);
    }

    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); pedido = e; mostrar(); });
    window.addEventListener("appinstalled", function () { if (faixa) faixa.remove(); });
    // iPhone e navegadores sem o aviso automático: mostra a faixa com os passos
    window.addEventListener("load", function () { setTimeout(mostrar, 2500); });
  } catch (e) {}
})();
