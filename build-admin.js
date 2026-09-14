// Compila os arquivos fonte do admin (JSX) para .compiled.js (JS puro),
// exatamente como descrito no CLAUDE.md REGRA 2.
// Uso: node build-admin.js

const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const ARQUIVOS = [
  "psi/admin/app_core.js",
  "psi/admin/app_pacientes.js",
  "psi/admin/app_agenda.js",
  "psi/admin/app_config.js",
  "psi/admin/app_main.js",
];

let erro = false;

for (const relPath of ARQUIVOS) {
  const srcPath = path.join(__dirname, relPath);
  const outPath = srcPath.replace(/\.js$/, ".compiled.js");
  const src = fs.readFileSync(srcPath, "utf8");

  const resultado = babel.transformSync(src, {
    presets: [["@babel/preset-react", { runtime: "classic" }]],
  });

  const linhasComImport = resultado.code
    .split("\n")
    .filter((linha) => linha.trim().startsWith("import"));

  if (linhasComImport.length > 0) {
    console.error(`ERRO: ${relPath} gerou linhas com "import" — não pode ir para o navegador assim.`);
    erro = true;
    continue;
  }

  fs.writeFileSync(outPath, resultado.code, "utf8");
  console.log(`OK: ${relPath} -> ${path.basename(outPath)}`);
}

if (erro) process.exit(1);
