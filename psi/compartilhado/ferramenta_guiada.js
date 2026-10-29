// Ferramenta guiada: transforma as ferramentas de "passos numerados" (1. TÍTULO / texto) em formulário de verdade.
// Cada passo tem campo de resposta com microfone; o sistema reconhece o que o passo pede:
//   - "de 0 a 10" (ou 0 a 100)  -> régua de intensidade para marcar;
//   - "(ex: medo, raiva, ...)"  -> botões de toque que preenchem a resposta;
// no fim: observações e botão Salvar (grava em clinica_reflexoes no portal; na prévia da psicóloga não grava nada).
// Usado pela prévia da psicóloga (admin), pelo portal do paciente e pelo link de atividade.
(function () {
  const h = React.createElement;

  // Quebra o texto em passos. Devolve null quando a ferramenta não tem o formato de passos numerados.
  function passosDaFerramenta(item) {
    if (!item) return null;
    const texto = item.passos || item.conteudo || item.texto || "";
    const blocos = String(texto).split(/\n\s*\n/).map((b) => b.trim()).filter((b) => b.length > 2);
    if (blocos.length < 3) return null;
    const numerados = blocos.filter((b) => /^\d+[.)]\s/.test(b)).length;
    if (numerados < blocos.length * 0.6) return null;
    return blocos.map((b, i) => {
      const linhas = b.split("\n");
      const titulo = linhas[0].replace(/^\d+[.)]\s*/, "").trim();
      const corpo = linhas.slice(1).join("\n").trim();
      const todo = titulo + "\n" + corpo;
      let intensidade = null;
      const m = todo.match(/\b0\s*(?:a|à|-|até)\s*(10|100)\b/i);
      if (m) intensidade = Number(m[1]);
      let exemplos = [];
      const e = corpo.match(/\((?:ex|exs|exemplos?)\s*[:.]\s*([^)]+)\)/i);
      if (e) {
        exemplos = e[1].split(/\s*[,;]\s*|\s+ou\s+/i).map((x) => x.replace(/[.\s]+$/, "").trim()).filter((x) => x.length >= 2 && x.length <= 42).slice(0, 14);
        if (exemplos.length < 2) exemplos = [];
      }
      return { n: i + 1, titulo, corpo, intensidade, exemplos };
    });
  }

  function Regua({ max, valor, aoMudar }) {
    if (max === 100) {
      return h("div", { style: { margin: "6px 0 2px" } },
        h("input", { type: "range", min: 0, max: 100, step: 5, value: valor == null ? 0 : valor, onChange: (e) => aoMudar(Number(e.target.value)), style: { width: "100%" } }),
        h("div", { style: { fontSize: 12, color: "#6B7280", textAlign: "center" } }, valor == null ? "Deslize para marcar" : valor + " de 100"));
    }
    const botoes = [];
    for (let i = 0; i <= max; i++) {
      const sel = valor === i;
      const cor = "hsl(" + Math.round(120 - (i / max) * 120) + ",65%,45%)";
      botoes.push(h("button", {
        key: i, type: "button", onClick: () => aoMudar(sel ? null : i), "aria-label": "Intensidade " + i,
        style: { width: 38, height: 38, borderRadius: 10, border: "2px solid " + (sel ? cor : "#E5E7EB"), background: sel ? cor : "#fff", color: sel ? "#fff" : "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer" },
      }, i));
    }
    return h("div", null,
      h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, botoes),
      h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6B7280", marginTop: 4 } },
        h("span", null, "0 = nenhuma"), h("span", null, valor == null ? "Toque para marcar" : "Você marcou " + valor), h("span", null, max + " = máxima")));
  }

  function FerramentaGuiada({ item, modo, usuario, paciente }) {
    const passos = passosDaFerramenta(item) || [];
    const total = passos.length + 1; // +1 = fechamento (observações e salvar)
    const [idx, setIdx] = React.useState(0);
    const [resp, setResp] = React.useState({}); // { n: { texto, intensidade } }
    const [obs, setObs] = React.useState("");
    const [msg, setMsg] = React.useState("");
    const [salvo, setSalvo] = React.useState(false);
    const [salvando, setSalvando] = React.useState(false);
    const previa = modo === "previa";

    // Rascunho (só onde existir: portal e link do paciente)
    const limpar = window.useRascunho
      ? window.useRascunho("ferramenta-" + (item.id || item.titulo || ""), { idx, resp, obs }, (r) => {
          if (r.resp) setResp(r.resp);
          if (r.obs) setObs(r.obs);
          if (r.idx != null) setIdx(Math.min(r.idx, total - 1));
        })
      : () => {};

    const objetivo = item.objetivo || item.descricao || "";
    const fechamento = idx === passos.length;
    const p = fechamento ? null : passos[idx];
    const atual = p ? resp[p.n] || {} : {};
    const pct = Math.round(((idx + 1) / total) * 100);
    const TextArea = window.TextAreaVoz;

    function mudar(n, parte) { setResp((r) => ({ ...r, [n]: { ...(r[n] || {}), ...parte } })); }
    function tocar(ex) {
      const t = (atual.texto || "").trim();
      const tem = t.toLowerCase().includes(ex.toLowerCase());
      if (tem) return;
      mudar(p.n, { texto: t ? t + ", " + ex : ex });
    }

    async function salvar() {
      if (previa) { setMsg("Na visualização da psicóloga nada é salvo. No portal do paciente, as respostas ficam guardadas no prontuário."); return; }
      const registros = passos
        .map((s) => ({ pergunta: s.n + ". " + s.titulo, resposta: (resp[s.n] && resp[s.n].texto) || "", intensidade: resp[s.n] && resp[s.n].intensidade != null ? resp[s.n].intensidade : null }))
        .filter((r) => r.resposta.trim() || r.intensidade != null);
      if (!registros.length && !obs.trim()) { setMsg("Responda pelo menos um passo antes de salvar."); return; }
      setSalvando(true); setMsg("");
      try {
        await db.collection("clinica_reflexoes").add({
          psi_id: usuario && usuario.psiId, pacienteId: usuario && usuario.uid, pacienteNome: (paciente && paciente.nome) || "",
          origem: "ferramenta", origemId: item.id || "", origemTitulo: item.titulo || item.nome || "",
          registros, observacoes: obs.trim(), data: new Date().toLocaleDateString("pt-BR"),
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        limpar();
        setSalvo(true);
      } catch (e) { setMsg("Não foi possível salvar: " + e.message); }
      finally { setSalvando(false); }
    }

    const estiloBotao = (principal) => ({ flex: principal ? 2 : 1, padding: "12px", borderRadius: 12, border: principal ? "none" : "1.5px solid #E5E7EB", background: principal ? "var(--cor-marca, #7B00C4)" : "#fff", color: principal ? "#fff" : "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" });

    if (salvo) {
      return h("div", { style: { textAlign: "center", padding: "26px 10px" } },
        h("div", { style: { fontSize: 18, fontWeight: 700, color: "#059669", marginBottom: 8 } }, "Respostas salvas!"),
        h("p", { style: { fontSize: 14, color: "#6B7280", lineHeight: 1.7 } }, "Suas respostas foram guardadas e a sua psicóloga poderá ver. Obrigada por se dedicar a este exercício."),
        h("button", { type: "button", style: { ...estiloBotao(false), flex: "none", padding: "10px 22px" }, onClick: () => { setSalvo(false); setResp({}); setObs(""); setIdx(0); } }, "Fazer de novo"));
    }

    return h("div", null,
      objetivo && h("div", { style: { background: "#F3E6FF", borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: "1px solid #EADDFC", fontSize: 13, color: "#3D006A", lineHeight: 1.7 } },
        h("strong", { style: { textTransform: "uppercase", fontSize: 11, letterSpacing: 0.5 } }, "Objetivo: "), objetivo),
      h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 } },
        h("span", { style: { color: "#9CA3AF" } }, fechamento ? "Fechamento" : "Passo " + (idx + 1) + " de " + passos.length),
        h("span", { style: { color: "var(--cor-marca, #7B00C4)", fontWeight: 700 } }, pct + "%")),
      h("div", { style: { height: 4, background: "#F3E6FF", borderRadius: 20, marginBottom: 18, overflow: "hidden" } },
        h("div", { style: { width: pct + "%", height: "100%", background: "var(--cor-marca, #7B00C4)", borderRadius: 20, transition: "width .3s" } })),

      fechamento
        ? h("div", { style: { background: "#fff", border: "1px solid #EADDFC", borderLeft: "4px solid var(--cor-marca, #7B00C4)", borderRadius: 16, padding: "20px 18px", marginBottom: 16 } },
            h("div", { style: { fontWeight: 700, fontSize: 15, color: "var(--cor-marca, #7B00C4)", marginBottom: 8 } }, "Observações finais"),
            h("div", { style: { fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 10 } }, "Quer acrescentar algo? Escreva ou fale o que ficou de mais importante, uma dúvida para levar à sessão ou o que percebeu."),
            TextArea ? h(TextArea, { value: obs, onChange: (e) => setObs(e.target.value), rows: 4, placeholder: "Suas observações (opcional)..." }) : h("textarea", { value: obs, onChange: (e) => setObs(e.target.value), rows: 4 }),
            h("div", { style: { fontSize: 12, color: "#6B7280", marginTop: 10 } }, passos.filter((s) => resp[s.n] && ((resp[s.n].texto || "").trim() || resp[s.n].intensidade != null)).length + " de " + passos.length + " passos respondidos."))
        : h("div", { style: { background: "#fff", border: "1px solid #EADDFC", borderLeft: "4px solid var(--cor-marca, #7B00C4)", borderRadius: 16, padding: "20px 18px", marginBottom: 16 } },
            h("div", { style: { fontWeight: 700, fontSize: 15, color: "var(--cor-marca, #7B00C4)", marginBottom: 8, lineHeight: 1.5 } }, p.n + ". " + p.titulo),
            p.corpo && h("div", { style: { fontSize: 14, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap", marginBottom: 12 } }, p.corpo),
            p.exemplos.length > 0 && h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 } },
              p.exemplos.map((ex) => h("button", { key: ex, type: "button", onClick: () => tocar(ex), style: { padding: "6px 12px", borderRadius: 999, border: "1.5px solid #D8B4FE", background: "#FAF5FF", color: "#6B21A8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, ex))),
            p.intensidade && h("div", { style: { marginBottom: 12 } },
              h("div", { style: { fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 } }, "Intensidade"),
              h(Regua, { max: p.intensidade, valor: atual.intensidade, aoMudar: (v) => mudar(p.n, { intensidade: v }) })),
            TextArea ? h(TextArea, { value: atual.texto || "", onChange: (e) => mudar(p.n, { texto: e.target.value }), rows: 4, placeholder: "Escreva ou use o microfone para falar..." })
                     : h("textarea", { value: atual.texto || "", onChange: (e) => mudar(p.n, { texto: e.target.value }), rows: 4, style: { width: "100%", boxSizing: "border-box" } })),

      msg && h("div", { style: { fontSize: 13, color: msg.startsWith("Não foi") || msg.startsWith("Responda") ? "#B91C1C" : "#6B7280", marginBottom: 10 } }, msg),
      h("div", { style: { display: "flex", gap: 10 } },
        h("button", { type: "button", style: estiloBotao(false), disabled: idx === 0, onClick: () => { setMsg(""); setIdx((i) => Math.max(0, i - 1)); } }, "Anterior"),
        fechamento
          ? h("button", { type: "button", style: { ...estiloBotao(true), background: "#059669" }, disabled: salvando, onClick: salvar }, salvando ? "Salvando..." : previa ? "Salvar (só no portal do paciente)" : "Salvar minhas respostas")
          : h("button", { type: "button", style: estiloBotao(true), onClick: () => { setMsg(""); setIdx((i) => Math.min(total - 1, i + 1)); } }, idx === passos.length - 1 ? "Concluir" : "Próximo")));
  }

  window.passosDaFerramenta = passosDaFerramenta;
  window.FerramentaGuiada = FerramentaGuiada;
})();
