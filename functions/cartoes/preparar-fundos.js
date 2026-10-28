// Uso único (rodar na pasta functions): converte os fundos aprovados para JPEG leve.
// node cartoes/preparar-fundos.js
const sharp = require("sharp");
const path = require("path");
const ORIGEM = path.join(__dirname, "..", "..", "..", "cartoes-aniversario", "clinica");
const FUNDOS = {
  "fem_01": "fundos/fem_01.png",
  "fem_02": "fundos/fem_02.png",
  "fem_03": "fundos/fem_03.png",
  "masc_01": "fundos/masc_01.png",
  "masc_02": "fundos/masc_02_v2.png",
  "masc_03": "fundos/masc_03.png",
};
(async () => {
  for (const [nome, arq] of Object.entries(FUNDOS)) {
    const saida = path.join(__dirname, nome + ".jpg");
    const info = await sharp(path.join(ORIGEM, arq)).resize(1080, 1350, { fit: "cover" }).jpeg({ quality: 86 }).toFile(saida);
    console.log(nome, info.width + "x" + info.height, Math.round(info.size / 1024) + " KB");
  }
})();
