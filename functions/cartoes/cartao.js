// Gera a imagem do cartão de aniversário (JPEG 1080x1350) com o nome do paciente,
// a mensagem do ano e a assinatura/cor da psicóloga. Roda no servidor, sem custo por cartão.
// Fundos aprovados: cartoes/fem_01..03.jpg e masc_01..03.jpg (ver memória "cartao-aniversario").
const fs = require("fs");
const path = require("path");
// sharp e resvg são pesados: carregados só ao gerar um cartão, para o deploy não estourar
// o tempo de análise do código (10 s) nem atrasar as demais funções.

const FUNDOS_FEM = ["fem_01", "fem_02", "fem_03"];
const FUNDOS_MASC = ["masc_01", "masc_02", "masc_03"];

// Mensagens aprovadas: neutras, sem tratamento de gênero. Giram com o ano.
const MENSAGENS = [
  "Que este novo ciclo venha com leveza, saúde e muitos momentos que façam o seu coração sorrir.",
  "Que cada dia do novo ano lhe traga motivos para sorrir e a certeza de que você merece o melhor.",
  "Hoje é dia de celebrar quem você é e tudo o que já construiu. Que o novo ciclo seja cheio de paz e conquistas.",
  "Que este novo ciclo traga saúde, tranquilidade e a coragem de seguir realizando o que é importante para você.",
];

const FONTES = ["Lato-Light.ttf", "Lato-Regular.ttf", "Lato-Bold.ttf"].map((f) => path.join(__dirname, "fontes", f));

const capitalizarNome = (n) => (n === n.toLowerCase() || n === n.toUpperCase()) ? n.charAt(0).toLocaleUpperCase("pt-BR") + n.slice(1).toLocaleLowerCase("pt-BR") : n;
function esc(t) {
  return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Quebra o texto em linhas de no máximo `larguraMax` pixels (largura média de letra ≈ 0,5 do corpo).
function quebrar(texto, corpo, larguraMax) {
  const porLinha = Math.max(10, Math.floor(larguraMax / (corpo * 0.5)));
  const linhas = [];
  let atual = "";
  texto.split(/\s+/).forEach((p) => {
    if ((atual + " " + p).trim().length > porLinha) { linhas.push(atual); atual = p; }
    else atual = (atual + " " + p).trim();
  });
  if (atual) linhas.push(atual);
  return linhas;
}

// Escolhe fundo e mensagem pelo gênero e pelo ano (rodízio; sem gênero informado usa o neutro/masculino).
function escolher(genero, ano) {
  const lista = /^fem/i.test(genero || "") ? FUNDOS_FEM : FUNDOS_MASC;
  return { fundo: lista[ano % lista.length], mensagem: MENSAGENS[ano % MENSAGENS.length] };
}

async function gerarCartao({ nome, genero, ano, cor, assinatura, subtitulo }) {
  const { fundo, mensagem } = escolher(genero, ano);
  const corTexto = /^#[0-9a-f]{6}$/i.test(cor || "") ? cor : "#6A2BD9";
  const primeiro = capitalizarNome(String(nome || "").trim().split(/\s+/)[0] || "");
  const corpoNome = primeiro.length <= 8 ? 104 : primeiro.length <= 12 ? 84 : 66;
  const linhasMsg = quebrar(mensagem, 33, 780);

  let y = 268 + 30;
  const partes = [];
  partes.push(`<text x="540" y="${y}" text-anchor="middle" font-family="Lato" font-weight="700" font-size="30" letter-spacing="9" fill="${corTexto}">PARABÉNS</text>`);
  y += 82;
  partes.push(`<text x="540" y="${y}" text-anchor="middle" font-family="Lato" font-weight="300" font-size="46" fill="#3b3550">Feliz aniversário,</text>`);
  y += corpoNome * 0.95 + 14;
  partes.push(`<text x="540" y="${y}" text-anchor="middle" font-family="Lato" font-weight="700" font-size="${corpoNome}" fill="${corTexto}">${esc(primeiro)}</text>`);
  y += 40;
  partes.push(`<rect x="480" y="${y}" width="120" height="3" fill="#c9a24d"/>`);
  y += 62;
  linhasMsg.forEach((l) => { partes.push(`<text x="540" y="${y}" text-anchor="middle" font-family="Lato" font-weight="300" font-size="33" fill="#3b3550">${esc(l)}</text>`); y += 50; });
  y += 34;
  partes.push(`<text x="540" y="${y}" text-anchor="middle" font-family="Lato" font-weight="700" font-size="30" fill="${corTexto}">${esc(assinatura)}</text>`);
  if (subtitulo) { y += 36; partes.push(`<text x="540" y="${y}" text-anchor="middle" font-family="Lato" font-weight="400" font-size="22" letter-spacing="1" fill="#6b6480">${esc(subtitulo)}</text>`); }

  const fundoB64 = fs.readFileSync(path.join(__dirname, fundo + ".jpg")).toString("base64");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="1350" viewBox="0 0 1080 1350">` +
    `<image x="0" y="0" width="1080" height="1350" xlink:href="data:image/jpeg;base64,${fundoB64}"/>${partes.join("")}</svg>`;
  const { Resvg } = require("@resvg/resvg-js");
  const sharp = require("sharp");
  const png = new Resvg(svg, { font: { fontFiles: FONTES, loadSystemFonts: false, defaultFontFamily: "Lato" } }).render().asPng();
  const jpeg = await sharp(png).jpeg({ quality: 88 }).toBuffer();
  return { jpeg, fundo, ultimaLinhaY: y };
}

module.exports = { gerarCartao, escolher, MENSAGENS };
