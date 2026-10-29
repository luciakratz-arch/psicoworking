// Psicoeducações visuais (copiadas do sistema da clínica; chave = título).
(function () {
  const {
    useState,
    useEffect,
    useRef,
    useMemo
  } = React;
  // ═══════════════════════════════════════════════════════
  //  psicoeducacoes.js — Componentes Visuais de Psicoeducação
  //  Clínica Dra. Lucia Kratz — CRP 09/20590
  //  Depende de: psifabulas.js (carregado antes)
  // ═══════════════════════════════════════════════════════

  function PsicoPreocupacao({
    cat
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83E\uDDE9"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Voc\xEA preocupa com o que pode \u2014 ou com o que n\xE3o pode controlar?"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Aprender a separar as preocupa\xE7\xF5es muda sua rela\xE7\xE3o com a ansiedade.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 18px",
        borderRight: "2px solid #e8c8ff",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#22C55E",
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 6
      }
    }, "\u2705 Produtiva"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6
      }
    }, "Existe uma a\xE7\xE3o concreta que posso fazer agora para resolver. A energia vai para a solu\xE7\xE3o.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        padding: "16px 18px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#F97316",
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 6
      }
    }, "\u26A0\uFE0F Improdutiva"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6
      }
    }, "O problema est\xE1 fora do meu controle ou no futuro. Ruminar s\xF3 gasta energia sem resolver nada."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        padding: "14px 20px",
        borderBottom: "1px solid #9a00e0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Pergunta-chave:"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: "10px 14px",
        color: "#f3e6ff",
        fontSize: 13,
        fontStyle: "italic"
      }
    }, "\"Existe algo que eu possa FAZER agora para resolver isso?\""), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        background: "rgba(34,197,94,0.2)",
        borderRadius: 8,
        padding: "8px 10px",
        border: "1px solid rgba(34,197,94,0.4)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#86efac",
        fontSize: 12,
        fontWeight: 500
      }
    }, "SIM \u2192 Aja agora"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 11,
        marginTop: 2
      }
    }, "Transforme em tarefa concreta")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        background: "rgba(249,115,22,0.2)",
        borderRadius: 8,
        padding: "8px 10px",
        border: "1px solid rgba(249,115,22,0.4)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fed7aa",
        fontSize: 12,
        fontWeight: 500
      }
    }, "N\xC3O \u2192 Solte conscientemente"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 11,
        marginTop: 2
      }
    }, "Escreva: \"Isso est\xE1 fora do meu controle\"")))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "14px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "\uD83C\uDFAF Na pr\xE1tica"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6
      }
    }, "Liste suas 3 preocupa\xE7\xF5es do momento. Para cada uma: existe uma a\xE7\xE3o concreta que voc\xEA pode fazer hoje? Se sim, fa\xE7a. Se n\xE3o, pratique soltar conscientemente.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        borderRadius: "0 0 12px 12px",
        padding: "14px 20px",
        borderTop: "2px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Reflita"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 12,
        lineHeight: 1.6
      }
    }, "De cada 10 preocupa\xE7\xF5es, 8 est\xE3o fora do nosso controle. Quanto de energia voc\xEA investe nessas 8? \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoPiorCenario({
    cat
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\u26C8\uFE0F"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Voc\xEA vive imaginando o pior?"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Catastrofizar \xE9 um h\xE1bito mental \u2014 e h\xE1bitos podem ser mudados.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que \xE9 catastrofizar?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6
      }
    }, "\xC9 o h\xE1bito de imaginar o pior resultado poss\xEDvel como o mais prov\xE1vel. A mente entra em modo de amea\xE7a \u2014 mesmo quando n\xE3o h\xE1 perigo real \u2014 e a ansiedade dispara.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        padding: "16px 20px",
        borderBottom: "1px solid #9a00e0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O tri\xE2ngulo da catastrofiza\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, [["🔮", "Superestimar o perigo", "Trata incerteza como certeza negativa"], ["🙈", "Subestimar a capacidade", "Esquece que já superou coisas difíceis"], ["🚫", "Descartar o positivo", "Ignora evidências de que pode dar certo"]].map(([e, t, d], i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: 1,
        minWidth: 140,
        background: "rgba(255,255,255,0.12)",
        borderRadius: 10,
        padding: "10px 12px",
        border: "1px solid rgba(255,255,255,0.2)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22,
        marginBottom: 4
      }
    }, e), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 12,
        fontWeight: 500,
        marginBottom: 3
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 11,
        lineHeight: 1.4
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "3 perguntas para quebrar o ciclo"), [["1", "Qual é a evidência real de que isso vai acontecer?"], ["2", "Qual é o resultado mais provável — não o mais temido?"], ["3", "Se acontecer, conseguirei lidar? O que faria?"]].map(([n, q]) => /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "#7B00C4",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0
      }
    }, n), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.5
      }
    }, q)))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        borderRadius: "0 0 12px 12px",
        padding: "14px 20px",
        borderTop: "2px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Reflita"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 12,
        lineHeight: 1.6
      }
    }, "Da \xFAltima vez que voc\xEA imaginou o pior \u2014 o que realmente aconteceu? Sua mente provavelmente superestimou o perigo. \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoEustresse({
    cat
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\u26A1"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Nem todo estresse \xE9 seu inimigo"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Aprender a diferenci\xE1-los muda como voc\xEA responde \xE0s press\xF5es da vida.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 18px",
        borderRight: "2px solid #e8c8ff",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#22C55E",
        fontWeight: 600,
        fontSize: 14,
        marginBottom: 8
      }
    }, "Eustresse \u2705"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6,
        marginBottom: 10
      }
    }, "O estresse que impulsiona. Gera energia, foco e motiva\xE7\xE3o para superar desafios."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 4
      }
    }, ["Antes de apresentações", "Novos desafios", "Metas importantes", "Adrenalina saudável"].map(t => /*#__PURE__*/React.createElement("span", {
      key: t,
      style: {
        background: "#dcfce7",
        color: "#16a34a",
        borderRadius: 20,
        padding: "2px 8px",
        fontSize: 10
      }
    }, t)))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        padding: "16px 18px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#F97316",
        fontWeight: 600,
        fontSize: 14,
        marginBottom: 8
      }
    }, "Distresse \u26A0\uFE0F"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6,
        marginBottom: 10
      }
    }, "O estresse que adoece. Quando a press\xE3o ultrapassa a capacidade e se torna cr\xF4nica."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 4
      }
    }, ["Pressão constante", "Sem descanso", "Sensação de descontrole", "Esgotamento"].map(t => /*#__PURE__*/React.createElement("span", {
      key: t,
      style: {
        background: "#fff7ed",
        color: "#ea580c",
        borderRadius: 20,
        padding: "2px 8px",
        fontSize: 10
      }
    }, t))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        padding: "14px 20px",
        borderBottom: "1px solid #9a00e0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "A diferen\xE7a est\xE1 em 2 fatores:"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 12,
        fontWeight: 500,
        marginBottom: 3
      }
    }, "\u23F1\uFE0F Dura\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 11,
        lineHeight: 1.4
      }
    }, "Tempor\xE1rio = eustresse. Cr\xF4nico = distresse.")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 12,
        fontWeight: 500,
        marginBottom: 3
      }
    }, "\uD83C\uDFAE Percep\xE7\xE3o de controle"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 11,
        lineHeight: 1.4
      }
    }, "Sinto que posso lidar = eustresse. Paralisado = distresse.")))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "14px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "\uD83C\uDFAF Na pr\xE1tica"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6
      }
    }, "Hoje, identifique um estressor e pergunte: ", /*#__PURE__*/React.createElement("em", null, "\"Isso me desafia ou me paralisa?\""), " Se desafia, use a energia. Se paralisa, \xE9 sinal de que precisa de pausa ou ajuda.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        borderRadius: "0 0 12px 12px",
        padding: "14px 20px",
        borderTop: "2px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Reflita"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 12,
        lineHeight: 1.6
      }
    }, "O estresse que voc\xEA sente agora \u2014 est\xE1 te impulsionando ou te adoecendo? Essa resposta \xE9 o primeiro passo para cuidar de voc\xEA. \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoCicloAnsiedade({
    cat
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83C\uDF00"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Evitar o que teme s\xF3 faz o medo crescer"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Entender o ciclo da ansiedade \xE9 o primeiro passo para quebr\xE1-lo.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O ciclo que alimenta a ansiedade"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      n: "1",
      e: "😰",
      t: "Situação temida",
      d: "Algo aciona a ameaça percebida",
      c: "#7B00C4"
    }, {
      n: "2",
      e: "💓",
      t: "Reação física",
      d: "Coração acelera, tensão, sudorese",
      c: "#9a00e0"
    }, {
      n: "3",
      e: "🧠",
      t: "Pensamento catastrófico",
      d: "'Não vou conseguir', 'Algo vai dar errado'",
      c: "#b040e0"
    }, {
      n: "4",
      e: "🚪",
      t: "Evitação",
      d: "Foge ou evita a situação temida",
      c: "#c870f0"
    }, {
      n: "5",
      e: "😮",
      t: "Alívio temporário",
      d: "A ansiedade cai — mas o medo cresce",
      c: "#d9b3f5"
    }].map(({
      n,
      e,
      t,
      d,
      c
    }) => /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        border: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: c,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0
      }
    }, n), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#3d006a"
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#7B00C4",
        lineHeight: 1.4
      }
    }, d)))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 12,
        color: "#F97316",
        fontWeight: 500,
        padding: "4px 0"
      }
    }, "\u21A9\uFE0F Volta para o passo 1 \u2014 o ciclo se repete e se fortalece"))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        padding: "14px 20px",
        borderBottom: "1px solid #9a00e0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Como quebrar o ciclo?"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [["🎯", "Exposição gradual", "Enfrente a situação temida em pequenos passos — o medo diminui com a prática"], ["💨", "Técnicas de regulação", "Respiração, mindfulness e relaxamento interrompem a resposta física"], ["🧩", "Reestruturação cognitiva", "Questione os pensamentos catastróficos — são fatos ou suposições?"]].map(([e, t, d]) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 12,
        fontWeight: 500,
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 11,
        lineHeight: 1.4
      }
    }, d)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        borderRadius: "0 0 12px 12px",
        padding: "14px 20px",
        borderTop: "2px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Reflita"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 12,
        lineHeight: 1.6
      }
    }, "O que voc\xEA tem evitado por ansiedade? Cada vez que evita, o medo ganha poder. Cada vez que enfrenta \u2014 mesmo com medo \u2014 voc\xEA retoma o controle. \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoDesmontarAnsiedade({
    cat
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83E\uDDE0"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Voc\xEA pode desmontar o circuito cerebral da ansiedade"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "4 passos para retomar o comando da sua pr\xF3pria vida.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 0
      }
    }, [{
      n: "1",
      e: "🔍",
      t: "SEPARAR",
      c: "#7B00C4",
      bg: "#f9f0ff",
      tc: "#3d006a",
      dc: "#5a0090",
      d: "Quando separamos a ansiedade de quem você é, podemos colocá-la no banco do carona. Assim você que estará no comando — não importa o quanto a ansiedade grite."
    }, {
      n: "2",
      e: "🎯",
      t: "CONHECER",
      c: "#9a00e0",
      bg: "#f3e6ff",
      tc: "#3d006a",
      dc: "#5a0090",
      d: "A ansiedade é composta por sensações físicas, pensamentos automáticos negativos e ações comportamentais. Quando conhecemos esses três aspectos em nós mesmos, podemos desarmar o ciclo ansioso."
    }, {
      n: "3",
      e: "🛡️",
      t: "NEUTRALIZAR",
      c: "#b040e0",
      bg: "#f9f0ff",
      tc: "#3d006a",
      dc: "#5a0090",
      d: "É importante reunir ferramentas estratégicas de força mental antes que a crise de ansiedade comece — e treinar o sistema natural de relaxamento e confiança do corpo."
    }, {
      n: "4",
      e: "🗺️",
      t: "PLANEJAR",
      c: "#c870f0",
      bg: "#f3e6ff",
      tc: "#3d006a",
      dc: "#5a0090",
      d: "Para vencer a ansiedade precisamos mapear como e quando ela tende a atacar. Assim criamos um roteiro de como agir — com ações práticas e declarações de coragem."
    }].map(({
      n,
      e,
      t,
      c,
      bg,
      tc,
      dc,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        background: bg,
        padding: "14px 20px",
        borderBottom: "1px solid #e8c8ff",
        display: "flex",
        gap: 12,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: c,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0
      }
    }, n), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, e), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: tc,
        letterSpacing: 1
      }
    }, t)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: dc,
        lineHeight: 1.6
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        borderRadius: "0 0 12px 12px",
        padding: "14px 20px",
        borderTop: "2px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Reflita"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 12,
        lineHeight: 1.6
      }
    }, "Em qual dos 4 passos voc\xEA sente que precisa trabalhar mais? A consci\xEAncia sobre o pr\xF3prio processo ansioso j\xE1 \xE9, em si, um ato de cura. \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PSICOEDUCAÇÕES VISUAIS — TCC
  // ═══════════════════════════════════════════════════════════════════════

  function PsicoModeloABC({
    cat
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDD3A"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O que realmente gera suas emo\xE7\xF5es?"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "N\xE3o \xE9 o evento \u2014 \xE9 o que voc\xEA acredita sobre ele.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 12
      }
    }, "O Modelo ABC da TCC"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [{
      l: "A",
      "t": "Adversidade",
      "e": "📌",
      "d": "O evento que aconteceu — o fato puro, sem julgamento",
      "c": "#7B00C4"
    }, {
      l: "B",
      "t": "Belief (Crença)",
      "e": "🧠",
      "d": "O que você acredita, pensa ou interpreta sobre o evento",
      "c": "#9a00e0"
    }, {
      l: "C",
      "t": "Consequência",
      "e": "💭",
      "d": "A emoção e o comportamento que surgem da crença",
      "c": "#b040e0"
    }].map(({
      l,
      t,
      e,
      d,
      c
    }) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 10,
        padding: "10px 14px",
        border: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: c,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 700,
        flexShrink: 0
      }
    }, l), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16
      }
    }, e), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "#3d006a"
      }
    }, t)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.5
      }
    }, d)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        padding: "16px 20px",
        borderBottom: "1px solid #9a00e0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Exemplo pr\xE1tico"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(255,255,255,0.12)",
        borderRadius: 10,
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 11,
        fontWeight: 500,
        marginBottom: 4
      }
    }, "Situa\xE7\xE3o A (mesmo evento)"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 11,
        lineHeight: 1.4
      }
    }, "Chefe critica seu trabalho")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(255,255,255,0.12)",
        borderRadius: 10,
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 11,
        fontWeight: 500,
        marginBottom: 4
      }
    }, "Situa\xE7\xE3o A (mesmo evento)"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 11,
        lineHeight: 1.4
      }
    }, "Chefe critica seu trabalho")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(249,115,22,0.2)",
        borderRadius: 10,
        padding: "10px 12px",
        border: "1px solid rgba(249,115,22,0.3)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fed7aa",
        fontSize: 11,
        fontWeight: 500,
        marginBottom: 4
      }
    }, "B: \"Sou um fracasso\""), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fde68a",
        fontSize: 11
      }
    }, "C: Tristeza, desmotiva\xE7\xE3o")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(34,197,94,0.2)",
        borderRadius: 10,
        padding: "10px 12px",
        border: "1px solid rgba(34,197,94,0.3)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#86efac",
        fontSize: 11,
        fontWeight: 500,
        marginBottom: 4
      }
    }, "B: \"Posso melhorar\""), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#86efac",
        fontSize: 11
      }
    }, "C: Motiva\xE7\xE3o, foco"))), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 12,
        marginTop: 10,
        textAlign: "center",
        fontStyle: "italic"
      }
    }, "Mesmo A \u2014 B diferente \u2014 C completamente diferente")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "14px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "\uD83C\uDFAF Na pr\xE1tica"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6
      }
    }, "Pense em uma situa\xE7\xE3o que te deixou mal. Escreva o A (fato), o B (o que voc\xEA acreditou) e o C (emo\xE7\xE3o). Agora invente um B diferente \u2014 o que mudaria?")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        borderRadius: "0 0 12px 12px",
        padding: "14px 20px",
        borderTop: "2px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Reflita"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 12,
        lineHeight: 1.6
      }
    }, "Voc\xEA n\xE3o pode controlar tudo que acontece (A), mas pode trabalhar suas cren\xE7as (B) \u2014 e isso muda tudo no que voc\xEA sente (C). \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoPensamentos({
    cat
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDCAD"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Seus pensamentos criam sua realidade emocional"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "N\xE3o s\xE3o as coisas em si \u2014 \xE9 o que voc\xEA acredita sobre elas.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como funciona o ciclo"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8
      }
    }, [["💭", "Pensamento"], ["💓", "Emoção"], ["🏃", "Comportamento"], ["🌍", "Resultado"]].map(([e, t], i, arr) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: t
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 28,
        marginBottom: 4
      }
    }, e), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#5a0090",
        fontWeight: 500
      }
    }, t)), i < arr.length - 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#b040e0",
        fontSize: 18,
        fontWeight: 700
      }
    }, "\u2192"))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        padding: "16px 20px",
        borderBottom: "1px solid #9a00e0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O mesmo evento \u2014 perspectivas diferentes"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [{
      p: "'Fui ignorado — ninguém gosta de mim'",
      e: "Tristeza, isolamento",
      cor: "rgba(249,115,22,0.2)",
      bc: "rgba(249,115,22,0.4)"
    }, {
      p: "'Fui ignorado — ela deve estar ocupada'",
      e: "Neutralidade, tranquilidade",
      cor: "rgba(34,197,94,0.2)",
      bc: "rgba(34,197,94,0.4)"
    }].map(({
      p,
      e,
      cor,
      bc
    }) => /*#__PURE__*/React.createElement("div", {
      key: p,
      style: {
        background: cor,
        borderRadius: 8,
        padding: "10px 12px",
        border: "1px solid " + bc
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 12,
        fontStyle: "italic",
        marginBottom: 4
      }
    }, p), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 11
      }
    }, "\u2192 ", e))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "14px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "\uD83C\uDFAF Na pr\xE1tica"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6
      }
    }, "Hoje, quando notar uma emo\xE7\xE3o forte, pergunte: \"Que pensamento veio antes disso?\" Escreva num papel. S\xF3 observar j\xE1 come\xE7a a mudar tudo.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        borderRadius: "0 0 12px 12px",
        padding: "14px 20px",
        borderTop: "2px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Reflita"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 12,
        lineHeight: 1.6
      }
    }, "Que hist\xF3ria sua mente conta sobre voc\xEA quando as coisas d\xE3o errado? Essa hist\xF3ria \xE9 um fato \u2014 ou uma interpreta\xE7\xE3o? \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoPizzaResponsabilidade({
    cat
  }) {
    const [passo, setPasso] = React.useState(0);
    const [resps, setResps] = React.useState({
      outro: "",
      ambiente: "",
      eu: ""
    });
    const FATIAS = [{
      key: "outro",
      cor: "#0EA5E9",
      label: "O Outro",
      emoji: "👤",
      angIni: 270,
      angFim: 390
    }, {
      key: "ambiente",
      cor: "#22C55E",
      label: "O Ambiente",
      emoji: "🌍",
      angIni: 390,
      angFim: 510
    }, {
      key: "eu",
      cor: "#7B00C4",
      label: "Eu",
      emoji: "🫵",
      angIni: 510,
      angFim: 630
    }];
    function fatiaPath(cx, cy, r, angIni, angFim) {
      const a1 = (angIni - 90) * Math.PI / 180;
      const a2 = (angFim - 90) * Math.PI / 180;
      const x1 = cx + r * Math.cos(a1),
        y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2),
        y2 = cy + r * Math.sin(a2);
      return `M${cx},${cy} L${x1},${y1} A${r},${r},0,0,1,${x2},${y2} Z`;
    }
    function labelPos(cx, cy, r, angIni, angFim) {
      const mid = ((angIni + angFim) / 2 - 90) * Math.PI / 180;
      return {
        x: cx + r * 0.65 * Math.cos(mid),
        y: cy + r * 0.65 * Math.sin(mid)
      };
    }
    const PERGUNTAS = [{
      key: "outro",
      titulo: "1️⃣ O que o OUTRO fez ou deixou de fazer?",
      sub: "Seja honesto. Qual foi a parte de responsabilidade da outra pessoa nessa situação?",
      placeholder: "Ex: Ele não comunicou claramente o que esperava de mim..."
    }, {
      key: "ambiente",
      titulo: "2️⃣ O que o AMBIENTE ou contexto contribuiu?",
      sub: "Circunstâncias, pressões externas, cultura, recursos disponíveis — o que estava fora do seu controle?",
      placeholder: "Ex: A situação era nova para todos, não havia um processo claro..."
    }, {
      key: "eu",
      titulo: "3️⃣ O que EU fiz ou deixei de fazer?",
      sub: "Agora, com a perspectiva dos outros dois terços avaliados, qual é a sua parte real? E mais importante: você está fazendo os seus 33,33%?",
      placeholder: "Ex: Eu poderia ter pedido mais clareza antes de agir..."
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83C\uDF55"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 6
      }
    }, "A Pizza da Responsabilidade"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Toda situa\xE7\xE3o tem 3 fatias iguais de 33,33%: o outro, o ambiente e voc\xEA.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "20px",
        textAlign: "center",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "180",
      height: "180",
      viewBox: "0 0 180 180"
    }, FATIAS.map(f => /*#__PURE__*/React.createElement("path", {
      key: f.key,
      d: fatiaPath(90, 90, 80, f.angIni, f.angFim),
      fill: f.cor,
      stroke: "white",
      strokeWidth: "2"
    })), FATIAS.map(f => {
      const pos = labelPos(90, 90, 80, f.angIni, f.angFim);
      return /*#__PURE__*/React.createElement("g", {
        key: f.key
      }, /*#__PURE__*/React.createElement("text", {
        x: pos.x,
        y: pos.y - 6,
        textAnchor: "middle",
        fill: "white",
        fontSize: "16"
      }, f.emoji), /*#__PURE__*/React.createElement("text", {
        x: pos.x,
        y: pos.y + 10,
        textAnchor: "middle",
        fill: "white",
        fontSize: "9",
        fontWeight: "bold"
      }, f.label), /*#__PURE__*/React.createElement("text", {
        x: pos.x,
        y: pos.y + 20,
        textAnchor: "middle",
        fill: "rgba(255,255,255,0.85)",
        fontSize: "8"
      }, "33,33%"));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        gap: 16,
        marginTop: 8
      }
    }, FATIAS.map(f => /*#__PURE__*/React.createElement("div", {
      key: f.key,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: f.cor
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#5a0090"
      }
    }, f.label))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "white",
        padding: "14px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 8
      }
    }, "Por que isso importa?"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff0f0",
        borderRadius: 8,
        padding: "10px 12px",
        border: "1px solid #fca5a5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: "#dc2626",
        marginBottom: 4
      }
    }, "\uD83D\uDE14 Autoculpa t\xF3xica"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#7f1d1d",
        lineHeight: 1.4
      }
    }, "Assume 100% e carrega o peso dos outros dois ter\xE7os que n\xE3o s\xE3o seus.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        borderRadius: 8,
        padding: "10px 12px",
        border: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: "#c2410c",
        marginBottom: 4
      }
    }, "\uD83D\uDE24 Vitimiza\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#7c2d12",
        lineHeight: 1.4
      }
    }, "Isenta-se completamente e perde o poder de mudar a sua parte real.")))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "14px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\uD83C\uDFAF Exerc\xEDcio \u2014 avalie uma situa\xE7\xE3o dif\xEDcil"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        marginBottom: 16
      }
    }, PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      onClick: () => setPasso(i),
      style: {
        flex: 1,
        height: 4,
        borderRadius: 4,
        cursor: "pointer",
        background: i <= passo ? FATIAS[i].cor : "#e8c8ff",
        transition: "background .3s"
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "white",
        borderRadius: 10,
        padding: "14px 16px",
        border: "2px solid " + FATIAS[passo].cor + "30"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: FATIAS[passo].cor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        flexShrink: 0
      }
    }, FATIAS[passo].emoji), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        color: "#3d006a"
      }
    }, PERGUNTAS[passo].titulo), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, PERGUNTAS[passo].sub))), /*#__PURE__*/React.createElement("textarea", {
      value: resps[FATIAS[passo].key],
      onChange: e => setResps({
        ...resps,
        [FATIAS[passo].key]: e.target.value
      }),
      placeholder: PERGUNTAS[passo].placeholder,
      style: {
        width: "100%",
        minHeight: 80,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + FATIAS[passo].cor + "50",
        fontSize: 12,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setPasso(Math.max(0, passo - 1)),
      disabled: passo === 0,
      style: {
        padding: "7px 16px",
        borderRadius: 8,
        border: "1px solid #e8c8ff",
        background: "white",
        color: "#7B00C4",
        cursor: passo === 0 ? "not-allowed" : "pointer",
        fontSize: 12,
        fontFamily: "inherit",
        opacity: passo === 0 ? 0.4 : 1
      }
    }, "\u2190 Anterior"), passo < 2 ? /*#__PURE__*/React.createElement("button", {
      onClick: () => setPasso(passo + 1),
      style: {
        padding: "7px 16px",
        borderRadius: 8,
        border: "none",
        background: FATIAS[passo].cor,
        color: "white",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "inherit"
      }
    }, "Pr\xF3ximo \u2192") : /*#__PURE__*/React.createElement("button", {
      onClick: () => setPasso(0),
      style: {
        padding: "7px 16px",
        borderRadius: 8,
        border: "none",
        background: "#7B00C4",
        color: "white",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "inherit"
      }
    }, "Recome\xE7ar \uD83D\uDD04"))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        borderRadius: "0 0 12px 12px",
        padding: "14px 20px",
        borderTop: "2px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 6
      }
    }, "\uD83D\uDC9C Reflex\xE3o final"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#3d006a",
        lineHeight: 1.7
      }
    }, "Depois de avaliar o outro e o ambiente, olhe para a sua fatia com honestidade:", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "Voc\xEA est\xE1 fazendo os seus 33,33%?"), /*#__PURE__*/React.createElement("br", null), "N\xE3o 100% \u2014 s\xF3 a sua parte. E isso j\xE1 \xE9 o suficiente para come\xE7ar a mudar.")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoFatosInterpretacoes({
    cat
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Voc\xEA acredita em tudo que sua mente diz?"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Separar fatos de interpreta\xE7\xF5es \xE9 uma das habilidades mais poderosas da TCC.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Qual \xE9 a diferen\xE7a?"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        borderRadius: 10,
        padding: "12px 14px",
        border: "2px solid #7B00C4"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#3d006a",
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 6
      }
    }, "\uD83D\uDCCC Fato"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 11,
        lineHeight: 1.5
      }
    }, "O que aconteceu objetivamente. Pode ser verificado. Qualquer pessoa que estivesse l\xE1 veria a mesma coisa.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        borderRadius: 10,
        padding: "12px 14px",
        border: "2px solid #F97316"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#9a3412",
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 6
      }
    }, "\uD83E\uDDE0 Interpreta\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7c2d12",
        fontSize: 11,
        lineHeight: 1.5
      }
    }, "O significado que sua mente atribui ao fato. Depende da sua hist\xF3ria, cren\xE7as e estado emocional.")))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        padding: "16px 20px",
        borderBottom: "1px solid #9a00e0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Exemplos do dia a dia"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [{
      f: "Ela não respondeu minha mensagem",
      i: "Deve estar com raiva de mim"
    }, {
      f: "Meu chefe não sorriu para mim",
      i: "Devo ter feito algo errado"
    }, {
      f: "Fui reprovado na prova",
      i: "Não sou inteligente o suficiente"
    }].map(({
      f,
      i
    }) => /*#__PURE__*/React.createElement("div", {
      key: f,
      style: {
        background: "rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 11,
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#d9b3f5",
        fontWeight: 500
      }
    }, "Fato:"), " ", f), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fde68a",
        fontSize: 11
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#fde68a",
        fontWeight: 500
      }
    }, "Interpreta\xE7\xE3o:"), " ", i))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "14px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "\uD83C\uDFAF Na pr\xE1tica"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6
      }
    }, "Pegue uma situa\xE7\xE3o que te incomodou hoje. Separe: o que REALMENTE aconteceu? E o que VOC\xCA acrescentou com sua interpreta\xE7\xE3o? Escreva os dois lados.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        borderRadius: "0 0 12px 12px",
        padding: "14px 20px",
        borderTop: "2px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Reflita"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 12,
        lineHeight: 1.6
      }
    }, "Quantas vezes sua mente criou uma hist\xF3ria sobre algu\xE9m \u2014 e voc\xEA sofreu por algo que nunca aconteceu de verdade? \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoSempreNunca({
    cat
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\u221E"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "\"Eu SEMPRE fa\xE7o isso errado\" \u2014 isso \xE9 verdade?"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "A supergeneraliza\xE7\xE3o transforma eventos pontuais em verdades permanentes.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O que \xE9 supergeneraliza\xE7\xE3o?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6,
        marginBottom: 12
      }
    }, "\xC9 quando transformamos um evento espec\xEDfico em uma regra geral sobre n\xF3s, os outros ou o mundo. Uma experi\xEAncia ruim vira uma \"verdade eterna\"."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      a: "Errei uma vez",
      b: "SEMPRE erro tudo"
    }, {
      a: "Ela não me ouviu hoje",
      b: "NUNCA me ouve"
    }, {
      a: "Não consegui dormir ontem",
      b: "NUNCA durmo bem"
    }].map(({
      a,
      b
    }) => /*#__PURE__*/React.createElement("div", {
      key: a,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        border: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#5a0090",
        flex: 1
      }
    }, a), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#F97316",
        fontWeight: 700,
        fontSize: 14
      }
    }, "\u2192"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#F97316",
        fontWeight: 500,
        flex: 1
      }
    }, b))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        padding: "16px 20px",
        borderBottom: "1px solid #9a00e0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como quebrar a generaliza\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      de: "SEMPRE / NUNCA",
      para: "Desta vez / Às vezes / Com frequência"
    }, {
      de: "TODO MUNDO",
      para: "Algumas pessoas / Nesse contexto"
    }, {
      de: "SOU assim",
      para: "Agi assim nessa situação"
    }].map(({
      de,
      para
    }) => /*#__PURE__*/React.createElement("div", {
      key: de,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#fde68a",
        fontWeight: 500,
        flex: 1
      }
    }, de), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#86efac",
        fontWeight: 700
      }
    }, "\u2192"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#86efac",
        flex: 1
      }
    }, para))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "14px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "\uD83C\uDFAF Na pr\xE1tica"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6
      }
    }, "Quando notar um \"sempre\" ou \"nunca\" no seu pensamento, troque por: \"desta vez\", \"\xE0s vezes\", \"com frequ\xEAncia\". Observe como a frase \u2014 e a emo\xE7\xE3o \u2014 mudam completamente.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        borderRadius: "0 0 12px 12px",
        padding: "14px 20px",
        borderTop: "2px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Reflita"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 12,
        lineHeight: 1.6
      }
    }, "Que \"verdades permanentes\" voc\xEA carrega sobre si mesmo que na verdade foram apenas momentos passageiros? \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function Psico7Distorcoes({
    cat
  }) {
    const distorcoes = [{
      e: "📢",
      t: "Generalização Excessiva",
      d: "Tirar conclusões amplas com base em uma única experiência negativa.",
      ex: "'Eu sempre falho.'"
    }, {
      e: "🎭",
      t: "Pensamento Dicotômico",
      d: "Ver as coisas como preto ou branco, sem considerar outras opções — o famoso 8 ou 80.",
      ex: "'Ou faço perfeito ou não faço.'"
    }, {
      e: "👥",
      t: "Leitura da Mente",
      d: "Presumir que sabe o que os outros estão pensando ou sentindo, sem evidências.",
      ex: "'Ele está com raiva de mim.'"
    }, {
      e: "👤",
      t: "Culpa Pessoal",
      d: "Atribuir a si mesmo a culpa por tudo que acontece de ruim.",
      ex: "'Estraguei tudo mesmo.'"
    }, {
      e: "💔",
      t: "Raciocínio Emocional",
      d: "Tomar decisões com base em emoções em vez de fatos ou lógica.",
      ex: "'Sinto que vai dar errado, então vai.'"
    }, {
      e: "🏆",
      t: "Desqualificação do Positivo",
      d: "Nomear eventos positivos como sorte ou coincidência, nunca como conquista.",
      ex: "'Foi pura sorte.'"
    }, {
      e: "🌪️",
      t: "Catastrofização",
      d: "Supor que as coisas sempre serão as piores possíveis, sem considerar outras saídas.",
      ex: "'Não vai dar certo de jeito nenhum.'"
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#7B00C4",
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83E\uDDE9"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Sua mente te engana \u2014 e voc\xEA nem percebe"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "As 7 distor\xE7\xF5es de pensamento mais comuns que afetam como voc\xEA sente e age.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "14px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.6
      }
    }, "Distor\xE7\xF5es cognitivas s\xE3o padr\xF5es de pensamento que levam a conclus\xF5es imprecisas e negativas. Eles se repetem na nossa mente, afetando nossa interpreta\xE7\xE3o da realidade, nossos sentimentos e nossas rea\xE7\xF5es.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 0
      }
    }, distorcoes.map(({
      e,
      t,
      d,
      ex
    }, i) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        padding: "12px 20px",
        borderBottom: "1px solid #e8c8ff",
        background: i % 2 === 0 ? "#f9f0ff" : "white",
        display: "flex",
        gap: 12,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "#7B00C4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "#3d006a",
        marginBottom: 3
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.5,
        marginBottom: 4
      }
    }, d), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9a00e0",
        fontStyle: "italic",
        background: "#f3e6ff",
        borderRadius: 6,
        padding: "3px 8px",
        display: "inline-block"
      }
    }, ex))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        borderRadius: "0 0 12px 12px",
        padding: "14px 20px",
        borderTop: "2px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Reflita"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#7B00C4",
        fontSize: 12,
        lineHeight: 1.6
      }
    }, "Qual dessas distor\xE7\xF5es aparece mais nos seus pensamentos? Reconhecer o padr\xE3o \xE9 o primeiro passo para mudar a narrativa interna. \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }

  // Mapa legado → macro para fábulas
  const FAB_LEGADO_MACRO = {
    "resiliencia": "macro_habitos",
    "resiliência": "macro_habitos",
    "crescimento": "macro_habitos",
    "mindfulness": "macro_habitos",
    "perspectiva": "macro_habitos",
    "habitos": "macro_habitos",
    "esperanca": "macro_humor",
    "esperança": "macro_humor",
    "autoconfianca": "macro_humor",
    "autoconfiança": "macro_humor",
    "autoestima": "macro_humor",
    "emocoes": "macro_humor",
    "expressão emocional": "macro_humor",
    "expressao emocional": "macro_humor",
    "regulação emocional": "macro_humor",
    "regulacao emocional": "macro_humor",
    "coragem": "macro_humor",
    "perdao": "macro_humor",
    "perdão": "macro_humor",
    "autoconhecimento": "macro_ansiedade",
    "ansiedade": "macro_ansiedade",
    "tcc": "macro_ansiedade",
    "relacionamentos": "macro_relacionamentos",
    "casais": "macro_casais",
    "corpo": "macro_habitos",
    "alimentacao": "macro_habitos",
    "saude_mental": "macro_habitos",
    "compulsao_ciclo": "macro_compulsao",
    "compulsao_habitos": "macro_compulsao",
    "compulsao_emocional": "macro_compulsao",
    "compulsao_vinculos": "macro_compulsao",
    "compulsao_aval": "macro_compulsao",
    "compulsao": "macro_compulsao",
    // já migradas
    "macro_ansiedade": "macro_ansiedade",
    "macro_humor": "macro_humor",
    "macro_habitos": "macro_habitos",
    "macro_relacionamentos": "macro_relacionamentos",
    "macro_casais": "macro_casais",
    "macro_corpo": "macro_habitos",
    "macro_compulsao": "macro_compulsao"
  };

  // Mapa de visualizações

  // ═══════════════════════════════════════════════════════════════════
  // PSICOEDUCAÇÕES VISUAIS — Novas (macro_ansiedade, macro_humor, etc.)
  // ═══════════════════════════════════════════════════════════════════

  // Componente base reutilizável para todas as psicoeducações visuais
  function PsicoVisualBase({
    titulo,
    emoji,
    cor,
    bg,
    secoes,
    perguntas
  }) {
    const [secao, setSecao] = useState(0);
    const [fase, setFase] = useState("leitura"); // leitura | reflexao | concluido
    const [respostas, setRespostas] = useState(Array(perguntas.length).fill(""));
    const [respIdx, setRespIdx] = useState(0);
    const total = secoes.length;
    const progresso = Math.round((secao + (fase === "reflexao" ? 0.5 : 0)) / total * 100);

    // ── Concluído ───────────────────────────────────────────────────
    if (fase === "concluido") return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: cor,
        borderRadius: 14,
        padding: "20px",
        marginBottom: 20,
        color: "white",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 44,
        marginBottom: 8
      }
    }, emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 4
      }
    }, titulo), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        opacity: 0.85
      }
    }, "Leitura e reflex\xE3o conclu\xEDdas \uD83D\uDC9C")), respostas.some(r => r.trim().length > 0) && /*#__PURE__*/React.createElement("div", {
      style: {
        background: "white",
        border: "1px solid var(--gray-200)",
        borderRadius: 12,
        padding: "16px",
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        color: cor,
        marginBottom: 12
      }
    }, "Suas reflex\xF5es"), perguntas.map((p, i) => respostas[i].trim() && /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottom: i < perguntas.length - 1 ? "1px solid var(--gray-100)" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-muted)",
        marginBottom: 4,
        fontStyle: "italic"
      }
    }, p), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--text)",
        lineHeight: 1.6,
        background: bg,
        borderRadius: 8,
        padding: "8px 12px"
      }
    }, respostas[i])))), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setSecao(0);
        setFase("leitura");
        setRespostas(Array(perguntas.length).fill(""));
        setRespIdx(0);
      },
      style: {
        width: "100%",
        padding: "11px",
        borderRadius: 10,
        border: "none",
        background: cor,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "Rever conte\xFAdo"));

    // ── Reflexão ────────────────────────────────────────────────────
    if (fase === "reflexao") return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        background: "var(--gray-100)",
        borderRadius: 20,
        height: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: progresso + "%",
        height: "100%",
        borderRadius: 20,
        background: cor,
        transition: "width .3s"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--text-muted)",
        flexShrink: 0
      }
    }, secao + 1, "/", total)), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fffdf5",
        borderRadius: 14,
        border: "1px solid #f3e6c0",
        marginBottom: 16,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: cor,
        padding: "12px 16px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "rgba(255,255,255,0.8)",
        marginBottom: 3,
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }
    }, "Reflex\xE3o"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: "white",
        fontWeight: 600,
        lineHeight: 1.4
      }
    }, perguntas[respIdx] || perguntas[0])), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: 36,
        top: 0,
        bottom: 0,
        width: 1,
        background: "#fca5a5",
        opacity: 0.4
      }
    }), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[respIdx] || "",
      onChange: e => {
        const r = [...respostas];
        r[respIdx] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva livremente aqui...",
      style: {
        width: "100%",
        minHeight: 130,
        padding: "12px 12px 12px 48px",
        background: "transparent",
        border: "none",
        outline: "none",
        resize: "none",
        fontSize: 14,
        lineHeight: "28px",
        fontFamily: "Georgia,serif",
        color: "var(--text)",
        boxSizing: "border-box",
        backgroundImage: "repeating-linear-gradient(transparent,transparent 27px,#f0ebe0 27px,#f0ebe0 28px)"
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setFase("leitura"),
      style: {
        flex: 1,
        padding: "10px",
        borderRadius: 10,
        border: "1px solid var(--gray-200)",
        background: "white",
        color: "var(--text-muted)",
        cursor: "pointer",
        fontSize: 13,
        fontFamily: "inherit"
      }
    }, "\u2190 Voltar"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (secao < total - 1) {
          setSecao(secao + 1);
          setRespIdx(Math.min(respIdx + 1, perguntas.length - 1));
          setFase("leitura");
        } else setFase("concluido");
      },
      style: {
        flex: 2,
        padding: "10px",
        borderRadius: 10,
        border: "none",
        background: cor,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, secao < total - 1 ? "Próxima seção →" : "Concluir 💜")));

    // ── Leitura ─────────────────────────────────────────────────────
    const s = secoes[secao];
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        background: "var(--gray-100)",
        borderRadius: 20,
        height: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: progresso + "%",
        height: "100%",
        borderRadius: 20,
        background: cor,
        transition: "width .3s"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--text-muted)",
        flexShrink: 0
      }
    }, secao + 1, "/", total)), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "linear-gradient(135deg," + cor + "," + cor + "dd)",
        borderRadius: 12,
        padding: "16px",
        marginBottom: 16,
        color: "white"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 32,
        marginBottom: 6
      }
    }, s.icone), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 4
      }
    }, s.titulo), s.subtitulo && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        opacity: 0.85
      }
    }, s.subtitulo)), s.tipo === "intro" && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: "var(--text)",
        lineHeight: 1.8,
        marginBottom: 16
      }
    }, s.texto), s.destaque && /*#__PURE__*/React.createElement("div", {
      style: {
        background: bg,
        borderRadius: 12,
        padding: "14px 16px",
        borderLeft: "4px solid " + cor
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: cor,
        fontWeight: 700,
        lineHeight: 1.6
      }
    }, s.destaque))), s.tipo === "cards" && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, s.intro && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: "var(--text)",
        lineHeight: 1.7,
        marginBottom: 14
      }
    }, s.intro), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
        gap: 10
      }
    }, s.cards.map((c, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: c.bg || bg,
        borderRadius: 12,
        padding: "14px",
        border: "1px solid " + c.cor + "30"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24,
        marginBottom: 6
      }
    }, c.icone), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        color: c.cor || cor,
        marginBottom: 4
      }
    }, c.titulo), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-muted)",
        lineHeight: 1.5
      }
    }, c.texto))))), s.tipo === "lista" && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, s.intro && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: "var(--text)",
        lineHeight: 1.7,
        marginBottom: 14
      }
    }, s.intro), s.itens.map((item, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 12px",
        background: i % 2 === 0 ? bg : "white",
        borderRadius: 10,
        marginBottom: 6,
        border: "1px solid " + cor + "20"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, item.icone), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        color: cor,
        marginBottom: 2
      }
    }, item.titulo), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-muted)",
        lineHeight: 1.5
      }
    }, item.texto))))), s.tipo === "destaque" && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, s.intro && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: "var(--text)",
        lineHeight: 1.7,
        marginBottom: 14
      }
    }, s.intro), /*#__PURE__*/React.createElement("div", {
      style: {
        background: bg,
        borderRadius: 14,
        padding: "20px",
        textAlign: "center",
        border: "2px solid " + cor + "30"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 44,
        marginBottom: 8
      }
    }, s.icone), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 18,
        fontWeight: 700,
        color: cor,
        marginBottom: 8
      }
    }, s.frase), s.subtexto && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--text-muted)",
        lineHeight: 1.6
      }
    }, s.subtexto))), s.tipo === "comparacao" && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, s.intro && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: "var(--text)",
        lineHeight: 1.7,
        marginBottom: 14
      }
    }, s.intro), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }
    }, s.lados.map((lado, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: lado.bg,
        borderRadius: 12,
        padding: "14px",
        border: "1px solid " + lado.cor + "30"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        color: lado.cor,
        marginBottom: 8
      }
    }, lado.icone, " ", lado.titulo), lado.itens.map((it, j) => /*#__PURE__*/React.createElement("div", {
      key: j,
      style: {
        fontSize: 12,
        color: "var(--text-muted)",
        padding: "4px 0",
        borderBottom: j < lado.itens.length - 1 ? "1px solid " + lado.cor + "20" : "none"
      }
    }, it)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, secao > 0 && /*#__PURE__*/React.createElement("button", {
      onClick: () => setSecao(secao - 1),
      style: {
        flex: 1,
        padding: "10px",
        borderRadius: 10,
        border: "1px solid var(--gray-200)",
        background: "white",
        color: "var(--text-muted)",
        cursor: "pointer",
        fontSize: 13,
        fontFamily: "inherit"
      }
    }, "\u2190"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setFase("reflexao"),
      style: {
        flex: 2,
        padding: "10px",
        borderRadius: 10,
        border: "none",
        background: cor,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "Refletir sobre isso \u270F\uFE0F")));
  }

  // ── PILOTO: O Alarme Falso do Cérebro ────────────────────────────
  function PsicoAlarme({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Você consegue identificar situações recentes em que seu alarme disparou sem perigo real?", "Que situações do dia a dia o seu cérebro trata como se fossem ameaças?", "Como você costuma reagir quando o alarme dispara? Luta, foge ou congela?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexões — O Alarme Falso do Cérebro:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "—"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83E\uDDE0"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O seu c\xE9rebro tem um alarme \u2014 e ele dispara mais do que deveria"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "A am\xEDgdala n\xE3o distingue um le\xE3o de uma apresenta\xE7\xE3o no trabalho.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "\uD83D\uDD14 O que \xE9 a am\xEDgdala?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.7
      }
    }, "\xC9 uma estrutura cerebral antiga, r\xE1pida e poderosa cuja fun\xE7\xE3o \xE9 simples: manter voc\xEA vivo. Quando percebe qualquer sinal de perigo, dispara o alarme antes mesmo que voc\xEA pense conscientemente sobre o que est\xE1 acontecendo."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#3d006a",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "O problema? Ela n\xE3o distingue um le\xE3o de uma cr\xEDtica no trabalho."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #9a00e0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "\u26A1 Quando o alarme dispara, em milissegundos..."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      e: "❤️",
      t: "Coração acelera",
      d: "Para bombear sangue aos músculos — prontos para correr ou lutar"
    }, {
      e: "💨",
      t: "Respiração fica rápida",
      d: "Para captar mais oxigênio e alimentar a ação"
    }, {
      e: "💪",
      t: "Músculos tensionam",
      d: "Preparando o corpo para movimento imediato"
    }, {
      e: "🍃",
      t: "Digestão para",
      d: "O estômago aperta — não é prioridade numa emergência"
    }, {
      e: "👁️",
      t: "Foco estreita",
      d: "A visão periférica diminui — tudo foca na ameaça percebida"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 11,
        marginTop: 2
      }
    }, d)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "\u2696\uFE0F Para o que foi criado vs. o que dispara hoje"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fee2e2",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#dc2626",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "\uD83E\uDD81 Para o que foi criado"), ["Predadores reais", "Ameaças físicas", "Perigos de vida ou morte", "Soluções físicas imediatas"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#7f1d1d",
        marginBottom: 3
      }
    }, "\u2022 ", i))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fef3c7",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d97706",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "\uD83D\uDCE7 Para o que dispara hoje"), ["E-mails não respondidos", "Conflitos no trabalho", "Incerteza sobre o futuro", "Críticas e julgamentos"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#78350f",
        marginBottom: 3
      }
    }, "\u2022 ", i))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        padding: "14px 20px",
        borderBottom: "1px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "\uD83D\uDCA1 O insight que muda tudo"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#3d006a",
        lineHeight: 1.7
      }
    }, "A ansiedade n\xE3o \xE9 fraqueza. \xC9 um sistema de prote\xE7\xE3o disparando fora do contexto certo. Quando voc\xEA entende isso, muda a rela\xE7\xE3o com os sintomas \u2014 em vez de lutar contra o alarme com p\xE2nico, come\xE7a a reconhec\xEA-lo: ", /*#__PURE__*/React.createElement("em", null, "\"Meu sistema de seguran\xE7a est\xE1 ativo. O que est\xE1 interpretando como amea\xE7a?\""))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#3d006a",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflex\xF5es"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#3d006a",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflex\xE3o...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflex\xF5es pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }

  // ── macro_ansiedade: novos componentes ───────────────────────────────────────

  function PsicoPensamentosSaoEventos({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Que pensamento recorrente você tem e que talvez esteja tratando como facto?", "Se separasse o facto da interpretação numa situação recente, o que mudaria?", "O que aconteceria se você observasse esse pensamento como uma nuvem passando — sem lutar contra ele?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexões — Pensamentos São Eventos, Não Factos:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "—"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDCAD"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Voc\xEA n\xE3o \xE9 seus pensamentos \u2014 voc\xEA \xE9 quem os observa"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Pensar algo n\xE3o torna aquilo verdade. Pensamentos s\xE3o eventos mentais, como nuvens passando.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "\uD83C\uDF0A O que \xE9 um pensamento?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.7
      }
    }, "A nossa mente produz cerca de 60.000 pensamentos por dia. A maioria passa sem ser notada. O problema come\xE7a quando acreditamos que todo pensamento \xE9 verdade \u2014 como se pensar algo fosse prova de que \xE9 real."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#3d006a",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Pensar \"Sou um fracasso\" n\xE3o me torna um fracasso. \xC9 apenas um evento mental, como uma nuvem passando."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #9a00e0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "\u2696\uFE0F Facto vs. interpreta\xE7\xE3o \u2014 a diferen\xE7a que muda tudo"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#86efac",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "\uD83D\uDCCC Facto"), ["Ela não respondeu minha mensagem", "A reunião foi adiada", "Cometi um erro no relatório", "Fiquei em silêncio na reunião"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#f3e6ff",
        marginBottom: 3,
        padding: "2px 0",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }
    }, i))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fca5a5",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "\uD83D\uDD2E Interpreta\xE7\xE3o"), ["Ela está com raiva de mim", "Não valorizam meu trabalho", "Sou incompetente", "As pessoas me julgaram"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#f3e6ff",
        marginBottom: 3,
        padding: "2px 0",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }
    }, i))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "\uD83E\uDDD8 Defus\xE3o cognitiva \u2014 criar dist\xE2ncia do pensamento"), [{
      e: "👁️",
      t: "Nomeie o pensamento",
      d: "Em vez de 'Sou um fracasso', diga: 'Estou tendo o pensamento de que sou um fracasso'"
    }, {
      e: "🍃",
      t: "Deixe passar",
      d: "Visualize o pensamento como uma folha num rio — observe-o fluir sem segurá-lo"
    }, {
      e: "❓",
      t: "Questione a evidência",
      d: "'O que prova que esse pensamento é 100% verdade? E o que contradiz?'"
    }, {
      e: "🔄",
      t: "Gere alternativas",
      d: "'Que outro pensamento seria igualmente plausível sobre esta situação?'"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#3d006a",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#5a0090",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        padding: "14px 20px",
        borderBottom: "1px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "\uD83D\uDCA1 A virada"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#3d006a",
        lineHeight: 1.7
      }
    }, "Voc\xEA n\xE3o \xE9 seus pensamentos. Voc\xEA \xE9 quem os observa. Essa distin\xE7\xE3o simples \xE9 a base de toda mudan\xE7a cognitiva. Quando voc\xEA observa um pensamento em vez de ser ele, recupera o poder de escolher como reagir. \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#3d006a",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflex\xF5es"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#3d006a",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflex\xE3o...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflex\xF5es pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoCurvaPanico({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Em um ataque de pânico, qual é o pensamento que mais te assusta no momento em que os sintomas aparecem?", "Sabendo que o pânico tem pico e desce naturalmente, o que muda na sua forma de encarar os sintomas?", "Que estratégia você pode usar nos primeiros minutos para não alimentar o ciclo do pânico?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexões — A Curva do Pânico:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "—"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDCC8"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O p\xE2nico atinge o pico \u2014 e desce naturalmente"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "O maior medo de quem passa por p\xE2nico \xE9 que n\xE3o vai parar. A neuroci\xEAncia mostra que sempre para.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "\uD83E\uDDE0 O que a neuroci\xEAncia diz"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5a0090",
        lineHeight: 1.7
      }
    }, "Um dos maiores medos de quem experiencia ataques de p\xE2nico \xE9 acreditar que vai continuar a crescer indefinidamente \u2014 que o cora\xE7\xE3o vai continuar a acelerar at\xE9 parar, que o descontrolo vai aumentar at\xE9 \xE0 loucura."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#3d006a",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Isso n\xE3o acontece. O p\xE2nico segue sempre uma curva previs\xEDvel \u2014 e o seu corpo sabe como descer."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #9a00e0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f3e6ff",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "\uD83D\uDCCA As 3 fases da curva"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [{
      n: "1",
      fase: "Ativação",
      t: "0–3 min",
      desc: "O sistema nervoso simpático dispara. O coração acelera, a respiração fica curta, os músculos tensionam. O corpo entra em modo de emergência.",
      cor: "#fca5a5"
    }, {
      n: "2",
      fase: "Pico",
      t: "3–10 min",
      desc: "A intensidade atinge o máximo — geralmente entre 3 e 10 minutos após o início. Este é o momento mais assustador, mas também o ponto de virada.",
      cor: "#fde68a"
    }, {
      n: "3",
      fase: "Descida",
      t: "10–30 min",
      desc: "O sistema parassimpático assume. O cortisol e a adrenalina são metabolizados. O corpo começa a se acalmar — inevitavelmente.",
      cor: "#86efac"
    }].map(({
      n,
      fase,
      t,
      desc,
      cor
    }) => /*#__PURE__*/React.createElement("div", {
      key: fase,
      style: {
        background: "rgba(255,255,255,0.12)",
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: cor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        color: "#1a001a",
        flexShrink: 0
      }
    }, n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#f3e6ff",
        fontSize: 13,
        fontWeight: 600
      }
    }, fase), /*#__PURE__*/React.createElement("span", {
      style: {
        background: "rgba(255,255,255,0.15)",
        color: cor,
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 7px",
        borderRadius: 10
      }
    }, t)), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d9b3f5",
        fontSize: 11,
        lineHeight: 1.6
      }
    }, desc)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f0ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e8c8ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "\u26A0\uFE0F O que alimenta o ciclo \u2014 e o que quebra"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fee2e2",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#dc2626",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "\uD83D\uDD01 Alimenta o p\xE2nico"), ["'Não vai parar'", "Lutar contra os sintomas", "Fugir da situação", "Checar o coração com medo", "Respiração hiperventilada"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#7f1d1d",
        marginBottom: 3
      }
    }, "\u2022 ", i))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#dcfce7",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#16a34a",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "\u2705 Quebra o ciclo"), ["'Já passou antes, vai passar'", "Observar sem lutar", "Permanecer e atravessar", "Respiração lenta e profunda", "Nomear o que está sentindo"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#14532d",
        marginBottom: 3
      }
    }, "\u2022 ", i))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f3e6ff",
        padding: "14px 20px",
        borderBottom: "1px solid #d9b3f5"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#5a0090",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "\uD83D\uDCA1 A frase que muda tudo"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#3d006a",
        lineHeight: 1.7
      }
    }, "Quando o p\xE2nico aparece, o c\xE9rebro grita ", /*#__PURE__*/React.createElement("em", null, "\"isso n\xE3o vai parar\""), ". Mas o seu hist\xF3rico prova o contr\xE1rio: ", /*#__PURE__*/React.createElement("strong", null, "sempre parou"), ". Saber disso n\xE3o elimina o medo \u2014 mas cria uma \xE2ncora de realidade no momento mais dif\xEDcil. A curva sempre desce. \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#3d006a",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflex\xF5es"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#3d006a",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflex\xE3o...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflex\xF5es pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoEustresseV2({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    return /*#__PURE__*/React.createElement(PsicoVisualBase, {
      titulo: "Eustresse vs. distresse",
      emoji: "\u26A1",
      cor: COR,
      bg: BG,
      secoes: [{
        tipo: "intro",
        icone: "⚡",
        titulo: "Nem todo estresse é inimigo",
        subtitulo: "Existe um estresse que nos faz crescer",
        texto: "A palavra 'estresse' virou sinônimo de algo negativo. Mas o psicólogo Hans Selye mostrou que existe uma distinção crucial: há o estresse que nos impulsiona e o que nos adoece.",
        destaque: "A diferença não está na intensidade — está na nossa percepção de controle e no tempo de duração."
      }, {
        tipo: "comparacao",
        icone: "⚖️",
        titulo: "Eustresse vs. Distresse",
        subtitulo: "Dois tipos, efeitos opostos",
        intro: "O mesmo evento pode gerar eustresse numa pessoa e distresse em outra, dependendo de recursos e percepção:",
        lados: [{
          titulo: "Eustresse ✅",
          icone: "🚀",
          cor: "#16a34a",
          bg: "#dcfce7",
          itens: ["Motivador e energizante", "Sentido de desafio", "Curto prazo, gerenciável", "Aumenta foco e desempenho", "Exemplo: prazo que estimula"]
        }, {
          titulo: "Distresse ❌",
          icone: "🪫",
          cor: "#dc2626",
          bg: "#fee2e2",
          itens: ["Desgastante e paralisante", "Sensação de ameaça", "Prolongado ou sem saída", "Prejudica saúde e memória", "Exemplo: sobrecarga crônica"]
        }]
      }, {
        tipo: "lista",
        icone: "🎯",
        titulo: "Como converter distresse em eustresse",
        subtitulo: "Estratégias concretas",
        intro: "A percepção é modificável. Algumas formas práticas de ressignificar o estresse:",
        itens: [{
          icone: "🔍",
          titulo: "Identifique o que está no seu controle",
          texto: "Separe o que você pode fazer agora do que está fora do seu alcance"
        }, {
          icone: "🧩",
          titulo: "Divida o desafio",
          texto: "Tarefas enormes geram distresse; tarefas pequenas e claras geram eustresse"
        }, {
          icone: "🌱",
          titulo: "Reframe o significado",
          texto: "'Isso está me destruindo' → 'Isso está me desafiando a crescer'"
        }, {
          icone: "⏱️",
          titulo: "Estabeleça limites de tempo",
          texto: "Estresse sem fim é distresse; estresse com prazo definido é tolerável"
        }]
      }, {
        tipo: "destaque",
        icone: "🧠",
        titulo: "O que a ciência diz",
        frase: "Acreditar que o estresse é útil pode melhorar seu desempenho e saúde.",
        subtexto: "Um estudo de Stanford com 30 000 pessoas mostrou que o estresse só é prejudicial quando acreditamos que ele é prejudicial. A percepção importa tanto quanto a intensidade."
      }],
      perguntas: ["Existe algum estressor na sua vida agora que poderia ser reinterpretado como desafio em vez de ameaça?", "Quando você pensa nos seus momentos de maior crescimento, havia algum estresse presente?", "O que mudaria se você tratasse o nervosismo antes de algo importante como energia, e não como sinal de perigo?"]
    });
  }
  function PsicoCicloAnsiedadeV2({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    return /*#__PURE__*/React.createElement(PsicoVisualBase, {
      titulo: "O ciclo da ansiedade",
      emoji: "\uD83C\uDF00",
      cor: COR,
      bg: BG,
      secoes: [{
        tipo: "intro",
        icone: "🌀",
        titulo: "Como a ansiedade se alimenta de si mesma",
        subtitulo: "O ciclo que nunca para — até você entender",
        texto: "A ansiedade não surge do nada. Ela segue um ciclo previsível que se repete e se intensifica cada vez que não é interrompido. Entender o ciclo é o primeiro passo para quebrá-lo.",
        destaque: "A evitação é o combustível da ansiedade. O que evitamos hoje fica maior amanhã."
      }, {
        tipo: "lista",
        icone: "🔄",
        titulo: "As 4 fases do ciclo",
        subtitulo: "Reconheça onde você está",
        intro: "O ciclo da ansiedade passa por quatro estágios que se retroalimentam:",
        itens: [{
          icone: "1️⃣",
          titulo: "Gatilho",
          texto: "Situação real ou imaginada que o cérebro interpreta como ameaça — uma apresentação, um conflito, uma incerteza"
        }, {
          icone: "2️⃣",
          titulo: "Pensamentos catastróficos",
          texto: "A mente começa a projetar o pior: 'Vou falhar', 'Vão me julgar', 'Não vou conseguir'"
        }, {
          icone: "3️⃣",
          titulo: "Sintomas físicos",
          texto: "Coração acelera, músculo tensa, estômago aperta — o corpo entra em modo de alerta real"
        }, {
          icone: "4️⃣",
          titulo: "Evitação ou fuga",
          texto: "Você evita a situação → sente alívio imediato → o cérebro aprende que 'fugir = seguro' → o gatilho fica maior"
        }]
      }, {
        tipo: "cards",
        icone: "🔓",
        titulo: "Como quebrar o ciclo",
        subtitulo: "Intervenção em cada fase",
        intro: "Você pode interromper o ciclo em qualquer ponto:",
        cards: [{
          icone: "🎯",
          titulo: "No gatilho",
          texto: "Identifique o que realmente desencadeou a ansiedade — nem sempre é o óbvio",
          cor: COR,
          bg: BG
        }, {
          icone: "💭",
          titulo: "No pensamento",
          texto: "Questione: 'Qual a evidência? Qual o pior caso real? Consigo lidar?'",
          cor: "#0891b2",
          bg: "#e0f2fe"
        }, {
          icone: "🌬️",
          titulo: "No corpo",
          texto: "Respiração 4-7-8: inspire 4s, segure 7s, expire 8s — ativa o nervo vago",
          cor: "#16a34a",
          bg: "#dcfce7"
        }, {
          icone: "🚶",
          titulo: "Na evitação",
          texto: "Exposição gradual: enfrente a situação em passos pequenos, do menos ao mais temido",
          cor: "#d97706",
          bg: "#fef3c7"
        }]
      }, {
        tipo: "destaque",
        icone: "💪",
        titulo: "A exposição gradual",
        frase: "Cada vez que você enfrenta em vez de fugir, o ciclo perde força.",
        subtexto: "A ansiedade é como uma onda: sobe, atinge o pico e desce. Se você ficar presente durante a subida, vai descobrir que o pico passa — e que sobreviveu."
      }],
      perguntas: ["Em qual fase do ciclo você costuma estar quando percebe a ansiedade?", "Existe algo que você evita regularmente e que, no fundo, sabe que poderia enfrentar?", "Que exposição pequena e segura você poderia fazer esta semana para começar a quebrar o ciclo?"]
    });
  }
  function PsicoPreocupacaoV2({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    return /*#__PURE__*/React.createElement(PsicoVisualBase, {
      titulo: "Preocupa\xE7\xE3o produtiva vs. improdutiva",
      emoji: "\uD83C\uDF9B\uFE0F",
      cor: COR,
      bg: BG,
      secoes: [{
        tipo: "intro",
        icone: "🎛️",
        titulo: "Nem toda preocupação é inútil",
        subtitulo: "Mas a maioria é",
        texto: "Preocupar-se é natural e, em pequenas doses, útil. O problema é quando a mente fica presa em loop — ruminando o mesmo problema sem chegar a nenhuma solução. Isso se chama preocupação improdutiva.",
        destaque: "A pergunta-chave: 'Existe alguma ação concreta que posso fazer agora?' Se sim, é produtiva. Se não, é improdutiva."
      }, {
        tipo: "comparacao",
        icone: "⚖️",
        titulo: "Produtiva vs. Improdutiva",
        subtitulo: "Como diferenciar na prática",
        intro: "",
        lados: [{
          titulo: "Produtiva ✅",
          icone: "✅",
          cor: "#16a34a",
          bg: "#dcfce7",
          itens: ["Leva a uma ação concreta", "Tem prazo e solução possível", "Você pensa e depois age", "Reduz a incerteza", "Exemplo: planejar uma conversa difícil"]
        }, {
          titulo: "Improdutiva ❌",
          icone: "🔄",
          cor: "#dc2626",
          bg: "#fee2e2",
          itens: ["Fica em loop sem solução", "Sobre o futuro ou passado", "Você pensa e continua pensando", "Aumenta a incerteza", "Exemplo: 'E se eu ficar doente?'"]
        }]
      }, {
        tipo: "lista",
        icone: "🛑",
        titulo: "Como interromper a preocupação improdutiva",
        subtitulo: "4 técnicas testadas",
        intro: "",
        itens: [{
          icone: "📅",
          titulo: "Agenda a preocupação",
          texto: "Reserve 20 minutos por dia para se preocupar conscientemente. Fora desse horário, adie o pensamento: 'Vou pensar nisso às 18h'"
        }, {
          icone: "✍️",
          titulo: "Escreva e solte",
          texto: "Coloque a preocupação no papel. O ato de escrever descarrega a memória de trabalho e reduz a ruminação"
        }, {
          icone: "❓",
          titulo: "Teste a utilidade",
          texto: "Pergunte: 'Pensar nisso agora vai mudar alguma coisa?' Se não, é sinal para redirecionar a atenção"
        }, {
          icone: "🎯",
          titulo: "Converta em ação",
          texto: "Para cada preocupação, defina UMA ação pequena possível — mesmo que não resolva tudo, cria sensação de controle"
        }]
      }, {
        tipo: "destaque",
        icone: "🧘",
        titulo: "Soltar o incontrolável",
        frase: "Se você pode fazer algo, faça. Se não pode, preocupar-se não vai ajudar.",
        subtexto: "Esta frase, do estoicismo, resume séculos de sabedoria: energia mental é um recurso finito. Investir em preocupações fora do seu controle é um desperdício que drena exatamente o que você precisaria para agir."
      }],
      perguntas: ["Liste suas 3 principais preocupações agora. Para cada uma: existe uma ação concreta possível hoje?", "Existe uma preocupação que você carrega há muito tempo sem conseguir resolver? O que a mantém viva?", "Como seria a sua semana se você dedicasse à preocupação apenas 20 minutos por dia — e o restante, às ações?"]
    });
  }
  function PsicoPiorCenarioV2({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    return /*#__PURE__*/React.createElement(PsicoVisualBase, {
      titulo: "A armadilha do pior cen\xE1rio",
      emoji: "\u26C8\uFE0F",
      cor: COR,
      bg: BG,
      secoes: [{
        tipo: "intro",
        icone: "⛈️",
        titulo: "Catastrofizar: o hábito de sofrer antecipado",
        subtitulo: "Por que a mente vai sempre para o pior",
        texto: "Catastrofizar é imaginar o pior desfecho possível e tratá-lo como provável ou certo. 'E se eu perder o emprego?' 'E se a doença for grave?' O cérebro não distingue ameaça imaginada de real — então você sofre de verdade por algo que talvez nunca aconteça.",
        destaque: "A catastrofização é uma distorção cognitiva, não uma previsão realista do futuro."
      }, {
        tipo: "lista",
        icone: "🔍",
        titulo: "Como identificar que você está catastrofizando",
        subtitulo: "Sinais internos",
        intro: "",
        itens: [{
          icone: "📢",
          titulo: "Linguagem absoluta",
          texto: "'Vai ser horrível', 'Não vou conseguir', 'Vai dar tudo errado'"
        }, {
          icone: "🔮",
          titulo: "Previsão sem evidência",
          texto: "Você prevê resultados negativos sem dados que os sustentem"
        }, {
          icone: "💥",
          titulo: "Magnificação",
          texto: "O erro vira catástrofe: um deslize no trabalho = demissão certa"
        }, {
          icone: "🏃",
          titulo: "Fuga preventiva",
          texto: "Você começa a evitar situações por medo do pior cenário imaginado"
        }]
      }, {
        tipo: "cards",
        icone: "🛠️",
        titulo: "As 3 perguntas que destroem o catastrofismo",
        subtitulo: "Técnica da TCC",
        intro: "Quando perceber que está indo para o pior cenário, faça essas três perguntas:",
        cards: [{
          icone: "📊",
          titulo: "Qual a probabilidade real?",
          texto: "De 0 a 100%, o quanto isso realmente vai acontecer? Seja honesto.",
          cor: "#0891b2",
          bg: "#e0f2fe"
        }, {
          icone: "📚",
          titulo: "Qual o histórico?",
          texto: "Esse tipo de coisa já aconteceu antes? Com que frequência o pior cenário se concretizou?",
          cor: "#16a34a",
          bg: "#dcfce7"
        }, {
          icone: "💪",
          titulo: "Se acontecer, consigo lidar?",
          texto: "Humanos são incrivelmente resilientes. Você já superou coisas difíceis antes.",
          cor: COR,
          bg: BG
        }]
      }, {
        tipo: "destaque",
        icone: "🌤️",
        titulo: "O cenário realista",
        frase: "Entre o melhor e o pior cenário, existe um mais provável — e geralmente é suportável.",
        subtexto: "A mente ansiosa tende a ignorar o cenário médio realista. Treine-se a perguntar: 'O que provavelmente vai acontecer?' — não o melhor, não o pior, mas o mais provável."
      }],
      perguntas: ["Qual é uma situação atual em que você sente que está indo para o pior cenário?", "Se você desse uma probabilidade real (%) a esse pior cenário, qual seria?", "Pensando em situações difíceis que já viveu — o que isso diz sobre sua capacidade de lidar com o que vier?"]
    });
  }
  function PsicoModeloABCV2({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    return /*#__PURE__*/React.createElement(PsicoVisualBase, {
      titulo: "O modelo ABC na pr\xE1tica",
      emoji: "\uD83D\uDD3A",
      cor: COR,
      bg: BG,
      secoes: [{
        tipo: "intro",
        icone: "🔺",
        titulo: "Não são os eventos que nos perturbam",
        subtitulo: "São nossas crenças sobre eles",
        texto: "Albert Ellis criou o modelo ABC para mostrar que entre um evento e nossa reação emocional existe algo crucial: o que acreditamos sobre o evento. A mesma situação pode gerar emoções completamente diferentes dependendo da crença.",
        destaque: "A → Adversidade (o que aconteceu) · B → Belief (crença) · C → Consequência emocional"
      }, {
        tipo: "lista",
        icone: "🧩",
        titulo: "O modelo na vida real",
        subtitulo: "Dois colegas, mesma crítica, emoções opostas",
        intro: "Maria e João recebem a mesma crítica do chefe: 'Esse relatório precisa melhorar'.",
        itens: [{
          icone: "👩",
          titulo: "Maria — B: 'Sou incompetente'",
          texto: "C: Tristeza, vergonha, desmotivação. Pensa em pedir demissão."
        }, {
          icone: "👨",
          titulo: "João — B: 'Posso aprender com isso'",
          texto: "C: Curiosidade leve, motivação. Pergunta como melhorar."
        }, {
          icone: "📌",
          titulo: "O A foi idêntico",
          texto: "O que criou emoções opostas foi exclusivamente o B — a crença de cada um sobre o evento."
        }, {
          icone: "💡",
          titulo: "A boa notícia",
          texto: "Crenças são modificáveis. Diferente de eventos, que muitas vezes estão fora do nosso controle."
        }]
      }, {
        tipo: "cards",
        icone: "🔧",
        titulo: "Como disputar crenças (o D do modelo)",
        subtitulo: "ABCDE na prática",
        intro: "Ellis adicionou D (Dispute) e E (Efeito) ao modelo original:",
        cards: [{
          icone: "❓",
          titulo: "D — Dispute",
          texto: "'Que evidências tenho de que essa crença é verdade? E contra ela?'",
          cor: "#0891b2",
          bg: "#e0f2fe"
        }, {
          icone: "🔄",
          titulo: "Crença alternativa",
          texto: "'O que mais poderia significar esse evento além da minha interpretação inicial?'",
          cor: "#16a34a",
          bg: "#dcfce7"
        }, {
          icone: "✨",
          titulo: "E — Efeito",
          texto: "Após disputar a crença, que nova emoção emerge? Como muda seu comportamento?",
          cor: COR,
          bg: BG
        }]
      }, {
        tipo: "destaque",
        icone: "🗝️",
        titulo: "O poder do B",
        frase: "Mudar os eventos é raro. Mudar o que acreditamos sobre eles está ao nosso alcance.",
        subtexto: "Não se trata de pensamento positivo forçado — mas de pensamento realista e flexível. A crença não precisa ser bonita; precisa ser mais precisa."
      }],
      perguntas: ["Pense numa situação recente que gerou emoção forte. Qual foi o A? Qual foi o B que você não percebeu de imediato?", "Se você mudasse o B dessa situação para uma crença mais realista, como mudaria o C?", "Existe uma crença recorrente sua que você já questiona se é verdade, mas continua acreditando?"]
    });
  }
  function PsicoPensamentosV2({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    return /*#__PURE__*/React.createElement(PsicoVisualBase, {
      titulo: "O poder dos pensamentos",
      emoji: "\uD83D\uDCAD",
      cor: COR,
      bg: BG,
      secoes: [{
        tipo: "intro",
        icone: "💭",
        titulo: "A mente como filtro da realidade",
        subtitulo: "O que pensamos molda o que sentimos",
        texto: "Você já reparou como a mesma situação pode gerar emoções completamente diferentes em pessoas diferentes? Não é a situação em si que determina como nos sentimos — é o que pensamos sobre ela. A mente funciona como um filtro.",
        destaque: "Não são as coisas em si que nos perturbam, mas o que acreditamos sobre elas. — Epicteto"
      }, {
        tipo: "lista",
        icone: "🔗",
        titulo: "A cadeia pensamento → emoção → comportamento",
        subtitulo: "Como tudo se conecta",
        intro: "Cada pensamento dispara uma emoção, que dispara um comportamento, que cria uma nova situação:",
        itens: [{
          icone: "💭",
          titulo: "Pensamento automático",
          texto: "'Ela não me respondeu — deve estar me ignorando de propósito'"
        }, {
          icone: "😠",
          titulo: "Emoção",
          texto: "Raiva, mágoa, insegurança — sentidas no corpo como tensão real"
        }, {
          icone: "🚪",
          titulo: "Comportamento",
          texto: "Você age de forma distante ou confrontadora — criando o problema que temia"
        }, {
          icone: "🔄",
          titulo: "Retroalimentação",
          texto: "O resultado confirma o pensamento original — o ciclo se fecha e se fortalece"
        }]
      }, {
        tipo: "cards",
        icone: "🛠️",
        titulo: "Como trabalhar os pensamentos",
        subtitulo: "3 ferramentas práticas",
        intro: "",
        cards: [{
          icone: "📓",
          titulo: "Registro de pensamentos",
          texto: "Anote o pensamento, a emoção, a situação. Observar já cria distância",
          cor: "#0891b2",
          bg: "#e0f2fe"
        }, {
          icone: "🔍",
          titulo: "Questionamento socrático",
          texto: "'Isso é um facto ou uma interpretação? Que evidência tenho? E contra?'",
          cor: "#16a34a",
          bg: "#dcfce7"
        }, {
          icone: "🔄",
          titulo: "Pensamento alternativo",
          texto: "Gere pelo menos 2 explicações alternativas para a mesma situação",
          cor: COR,
          bg: BG
        }]
      }, {
        tipo: "destaque",
        icone: "✏️",
        titulo: "O exercício de hoje",
        frase: "Hoje, quando notar uma emoção forte, pergunte: 'Que pensamento veio antes disso?'",
        subtexto: "Só essa pergunta — feita com curiosidade, sem julgamento — já começa a criar o espaço entre o estímulo e a resposta. E nesse espaço mora a liberdade."
      }],
      perguntas: ["Que pensamento recorrente você tem que mais afeta seu humor ao longo do dia?", "Consegue identificar um momento recente em que um pensamento automático levou a uma emoção forte?", "Se você gerasse um pensamento alternativo para aquela situação, como sua emoção poderia ter sido diferente?"]
    });
  }
  function PsicoPizzaV2({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    return /*#__PURE__*/React.createElement(PsicoVisualBase, {
      titulo: "A pizza da responsabilidade",
      emoji: "\uD83C\uDF55",
      cor: COR,
      bg: BG,
      secoes: [{
        tipo: "intro",
        icone: "🍕",
        titulo: "A culpa raramente é só sua",
        subtitulo: "Como dividir a responsabilidade com mais justiça",
        texto: "Quando algo dá errado, a mente ansiosa tende a um extremo: ou coloca toda a culpa em si mesma (autoculpa tóxica) ou em outra pessoa (vitimização). A realidade é mais complexa e mais justa.",
        destaque: "Distribuir responsabilidade de forma justa não é escapar da culpa. É pensar com clareza."
      }, {
        tipo: "lista",
        icone: "⚖️",
        titulo: "Os três fatores de todo problema",
        subtitulo: "A fórmula equilibrada",
        intro: "Na maioria das situações difíceis, existe uma combinação de:",
        itens: [{
          icone: "🙋",
          titulo: "Eu (minha parte)",
          texto: "Minhas escolhas, meu comportamento, o que eu poderia ter feito diferente — sem exagerar nem minimizar"
        }, {
          icone: "🧑‍🤝‍🧑",
          titulo: "O outro (parte deles)",
          texto: "O comportamento do outro, as escolhas que fizeram, o que contribuíram para a situação"
        }, {
          icone: "🌍",
          titulo: "As circunstâncias (contexto)",
          texto: "Fatores externos: timing, pressão, informações que ninguém tinha, acasos que ninguém controlava"
        }]
      }, {
        tipo: "cards",
        icone: "🎯",
        titulo: "Como fazer a pizza na prática",
        subtitulo: "Passo a passo",
        intro: "",
        cards: [{
          icone: "📝",
          titulo: "Descreva a situação",
          texto: "Seja objetivo: o que aconteceu de fato, sem julgamentos ainda",
          cor: "#0891b2",
          bg: "#e0f2fe"
        }, {
          icone: "🍕",
          titulo: "Divida a pizza",
          texto: "Dê uma porcentagem a cada fator: Eu (X%) · O outro (Y%) · Circunstâncias (Z%)",
          cor: COR,
          bg: BG
        }, {
          icone: "🔍",
          titulo: "Avalie a sua fatia",
          texto: "O que exatamente foi sua responsabilidade? Nem mais, nem menos do que foi.",
          cor: "#16a34a",
          bg: "#dcfce7"
        }, {
          icone: "🌱",
          titulo: "Defina o que você pode mudar",
          texto: "Só a sua fatia é modificável por você. Trabalhe o que está ao seu alcance.",
          cor: "#d97706",
          bg: "#fef3c7"
        }]
      }, {
        tipo: "destaque",
        icone: "🕊️",
        titulo: "O alívio da divisão justa",
        frase: "Você não precisa carregar 100% do peso de algo que foi construído por vários.",
        subtexto: "Assumir apenas a sua fatia real significa que você pode trabalhar nela com clareza, sem o peso paralisante de se sentir responsável por tudo."
      }],
      perguntas: ["Existe uma situação passada em que você assumiu 100% da culpa? Como ficaria a pizza se você dividisse honestamente?", "E o oposto — existe algo em que colocou toda a culpa no outro, mas que tinha uma parte sua?", "Como seria trabalhar só a sua fatia — sem se sentir responsável pela parte dos outros?"]
    });
  }
  function PsicoFatosV2({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    return /*#__PURE__*/React.createElement(PsicoVisualBase, {
      titulo: "Fatos vs. interpreta\xE7\xF5es",
      emoji: "\uD83D\uDD0D",
      cor: COR,
      bg: BG,
      secoes: [{
        tipo: "intro",
        icone: "🔍",
        titulo: "A mente preenche lacunas automaticamente",
        subtitulo: "E nem sempre acerta",
        texto: "O cérebro recebe informação incompleta e, em frações de segundo, preenche as lacunas com base em experiências passadas, medos e crenças. O resultado? Confundimos a nossa versão da realidade com a realidade em si.",
        destaque: "'Ela não me respondeu' é um facto. 'Ela está com raiva de mim' é uma interpretação. Toda a emoção vem da interpretação, não do facto."
      }, {
        tipo: "lista",
        icone: "🧩",
        titulo: "Como separar facto de interpretação",
        subtitulo: "O teste prático",
        intro: "Um facto: qualquer pessoa na sala teria visto a mesma coisa. Uma interpretação: é a história que você acrescenta.",
        itens: [{
          icone: "📹",
          titulo: "O teste da câmera",
          texto: "O que uma câmera filmaria? Só isso é facto. Tudo que a câmera não captura é interpretação."
        }, {
          icone: "💬",
          titulo: "O teste do acordo",
          texto: "Qualquer pessoa concordaria com essa afirmação? Se não, provavelmente é interpretação."
        }, {
          icone: "🔮",
          titulo: "Cuidado com o 'deve ser'",
          texto: "'Ele deve estar bravo', 'ela deve estar me ignorando' — o 'deve' quase sempre sinaliza interpretação."
        }, {
          icone: "❓",
          titulo: "A pergunta de ouro",
          texto: "'Isso eu sei, ou estou supondo?' — simples e transformadora."
        }]
      }, {
        tipo: "comparacao",
        icone: "⚖️",
        titulo: "Exemplos do dia a dia",
        subtitulo: "",
        intro: "",
        lados: [{
          titulo: "Facto",
          icone: "📌",
          cor: "#16a34a",
          bg: "#dcfce7",
          itens: ["Ele ficou em silêncio", "A reunião foi cancelada", "Ela não sorriu", "Não recebi resposta"]
        }, {
          titulo: "Interpretação comum",
          icone: "🔮",
          cor: "#dc2626",
          bg: "#fee2e2",
          itens: ["Ele está me ignorando", "Não confiam em mim", "Ela me detesta", "Fiz algo errado"]
        }]
      }, {
        tipo: "destaque",
        icone: "🗝️",
        titulo: "A liberdade da distinção",
        frase: "Quando você para de confundir interpretação com facto, perde menos energia sofrendo por histórias que inventou.",
        subtexto: "Não é sobre não ter interpretações — é inevitável, somos humanos. É sobre perceber quando está confundindo uma com a outra, e ter a curiosidade de verificar antes de reagir."
      }],
      perguntas: ["Pense numa situação recente que te gerou emoção negativa. O que era facto? O que era interpretação?", "Você tem o hábito de verificar suas interpretações antes de agir? O que te impede de fazer isso mais?", "Existe uma interpretação sobre alguém próximo que você nunca verificou e que pode não ser verdade?"]
    });
  }
  function PsicoSempreNuncaV2({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    return /*#__PURE__*/React.createElement(PsicoVisualBase, {
      titulo: "O perigo do sempre e nunca",
      emoji: "\u221E",
      cor: COR,
      bg: BG,
      secoes: [{
        tipo: "intro",
        icone: "∞",
        titulo: "A supergeneralização",
        subtitulo: "Quando um evento vira uma regra permanente",
        texto: "'Eu SEMPRE faço tudo errado.' 'Ele NUNCA me ouve.' Essas palavras parecem descrever a realidade — mas na verdade a distorcem. Transformam um evento pontual em característica permanente. E o permanente gera desânimo.",
        destaque: "Quase nada na vida humana é realmente 'sempre' ou 'nunca'. Essas palavras são sinais de alarme cognitivo."
      }, {
        tipo: "lista",
        icone: "⚠️",
        titulo: "Por que é perigoso",
        subtitulo: "O impacto real da supergeneralização",
        intro: "",
        itens: [{
          icone: "🧊",
          titulo: "Paralisa a mudança",
          texto: "Se 'sempre foi assim', pra que tentar? A supergeneralização cria fatalismo."
        }, {
          icone: "💔",
          titulo: "Destrói relacionamentos",
          texto: "'Você nunca me ouve' fecha o diálogo. A outra pessoa se defende em vez de ouvir."
        }, {
          icone: "🪞",
          titulo: "Distorce a autoimagem",
          texto: "'Sou sempre o problema' generaliza um erro pontual para a identidade inteira."
        }, {
          icone: "😔",
          titulo: "Alimenta depressão",
          texto: "A supergeneralização é um dos principais mecanismos cognitivos da depressão."
        }]
      }, {
        tipo: "cards",
        icone: "🔧",
        titulo: "Como corrigir",
        subtitulo: "Substituições que mudam tudo",
        intro: "Palavras pequenas, impacto enorme. Experimente trocar:",
        cards: [{
          icone: "🔄",
          titulo: "'Sempre' → 'desta vez'",
          texto: "'Errei desta vez' é verdade e modificável. 'Sempre erro' é uma sentença.",
          cor: COR,
          bg: BG
        }, {
          icone: "🔄",
          titulo: "'Nunca' → 'ainda não'",
          texto: "'Ainda não consegui' mantém a possibilidade aberta. 'Nunca vou conseguir' a fecha.",
          cor: "#0891b2",
          bg: "#e0f2fe"
        }, {
          icone: "🔄",
          titulo: "'É sempre assim' → 'às vezes'",
          texto: "Reduz a magnitude e permite ver exceções que existem mas são ignoradas.",
          cor: "#16a34a",
          bg: "#dcfce7"
        }, {
          icone: "🔎",
          titulo: "Busque a exceção",
          texto: "Existe algum momento em que não foi assim? Uma exceção destrói o 'sempre'.",
          cor: "#d97706",
          bg: "#fef3c7"
        }]
      }, {
        tipo: "destaque",
        icone: "🌱",
        titulo: "A precisão como cura",
        frase: "Quanto mais precisa a linguagem, mais preciso o pensamento — e mais realista a emoção.",
        subtexto: "'Cometi um erro nessa situação' é um facto que pode ser trabalhado. 'Sempre cometo erros' é uma sentença que paralisa."
      }],
      perguntas: ["Você usa 'sempre' ou 'nunca' com frequência? Sobre quem — você mesmo ou alguém próximo?", "Escolha uma frase com 'sempre/nunca' que você pensa com frequência. Existe pelo menos uma exceção?", "Como mudaria a sua emoção se trocasse 'sempre' por 'desta vez' nessa frase?"]
    });
  }
  function PsicoDesmontarV2({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    return /*#__PURE__*/React.createElement(PsicoVisualBase, {
      titulo: "Desmontar o Circuito Cerebral da Ansiedade",
      emoji: "\uD83E\uDDE0",
      cor: COR,
      bg: BG,
      secoes: [{
        tipo: "intro",
        icone: "🧠",
        titulo: "Como o cérebro cria a ansiedade",
        subtitulo: "E como você pode interromper o circuito",
        texto: "A ansiedade não é aleatória — é um circuito neural bem estabelecido. A amígdala detecta ameaça (real ou imaginada), dispara o alarme, e o corpo reage antes que o pensamento consciente intervenha. Mas esse circuito pode ser interrompido.",
        destaque: "Você não pode evitar que o alarme dispare. Mas pode aprender a não deixá-lo tomar o comando."
      }, {
        tipo: "lista",
        icone: "⚡",
        titulo: "O circuito em 4 passos",
        subtitulo: "O que acontece no seu cérebro",
        intro: "",
        itens: [{
          icone: "1️⃣",
          titulo: "Detecção da ameaça (amígdala)",
          texto: "Em milissegundos, a amígdala escaneia o ambiente. Qualquer sinal de perigo — real ou simbólico — ativa o alarme."
        }, {
          icone: "2️⃣",
          titulo: "Resposta de estresse (hipotálamo)",
          texto: "Cortisol e adrenalina são liberados. Coração acelera, músculos tensionam, atenção estreita."
        }, {
          icone: "3️⃣",
          titulo: "Pensamentos catastróficos (córtex)",
          texto: "O córtex pré-frontal, agora sobrecarregado, gera pensamentos de ameaça em cascata."
        }, {
          icone: "4️⃣",
          titulo: "Evitação ou hipervigilância",
          texto: "O comportamento de fuga reforça o circuito: o cérebro aprende que a situação era mesmo perigosa."
        }]
      }, {
        tipo: "cards",
        icone: "🔓",
        titulo: "4 interruptores do circuito",
        subtitulo: "Técnicas com base neurocientífica",
        intro: "",
        cards: [{
          icone: "🌬️",
          titulo: "Respiração diafragmática",
          texto: "Ativa o nervo vago e sinaliza segurança ao sistema nervoso em 60-90 segundos",
          cor: "#16a34a",
          bg: "#dcfce7"
        }, {
          icone: "🖐️",
          titulo: "Técnica 5-4-3-2-1",
          texto: "5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia — âncora no presente",
          cor: "#0891b2",
          bg: "#e0f2fe"
        }, {
          icone: "💭",
          titulo: "Nomear a emoção",
          texto: "'Estou sentindo ansiedade' ativa o córtex pré-frontal e reduz a ativação da amígdala",
          cor: COR,
          bg: BG
        }, {
          icone: "🚶",
          titulo: "Movimento intencional",
          texto: "10 minutos de caminhada reduzem cortisol e produzem endorfina — quebra o ciclo fisiologicamente",
          cor: "#d97706",
          bg: "#fef3c7"
        }]
      }, {
        tipo: "destaque",
        icone: "🔄",
        titulo: "Neuroplasticidade",
        frase: "Cada vez que você usa um interruptor, o circuito da ansiedade perde um pouco de força.",
        subtexto: "O cérebro muda com o uso. Repetição constrói novos caminhos neurais. Com prática, o alarme começa a disparar com menos intensidade e você recupera o acesso ao pensamento claro mais rapidamente."
      }],
      perguntas: ["Qual dos 4 interruptores parece mais acessível para você experimentar esta semana?", "Em que momento do seu dia o circuito da ansiedade costuma disparar com mais força?", "Você já percebeu que depois de respirar fundo ou se mover, a ansiedade diminuiu? O que isso diz?"]
    });
  }
  function Psico7DistorcoesV2({
    cat
  }) {
    const COR = "#7B00C4";
    const BG = "#f3e6ff";
    return /*#__PURE__*/React.createElement(PsicoVisualBase, {
      titulo: "7 Distor\xE7\xF5es de Pensamento",
      emoji: "\uD83E\uDDE9",
      cor: COR,
      bg: BG,
      secoes: [{
        tipo: "intro",
        icone: "🧩",
        titulo: "A mente distorce — é parte do design",
        subtitulo: "Mas podemos aprender a perceber",
        texto: "Distorções cognitivas são padrões de pensamento sistemáticos que nos afastam da realidade. Não são defeitos de caráter — são atalhos neurais que o cérebro desenvolveu. O problema é que muitos desses atalhos nos sabotam.",
        destaque: "Reconhecer uma distorção não a apaga — mas cria distância suficiente para você escolher como responder."
      }, {
        tipo: "lista",
        icone: "🔍",
        titulo: "As 7 distorções mais comuns",
        subtitulo: "Você se reconhece em alguma?",
        intro: "",
        itens: [{
          icone: "⚫",
          titulo: "Pensamento tudo ou nada",
          texto: "'Ou é perfeito ou é um fracasso.' Sem meio-termo. Leva ao perfeccionismo e à decepção constante."
        }, {
          icone: "🌊",
          titulo: "Supergeneralização",
          texto: "Um evento negativo vira uma regra permanente: 'Isso sempre acontece comigo.'"
        }, {
          icone: "🔦",
          titulo: "Filtro mental",
          texto: "Foca exclusivamente no negativo, ignorando o positivo — como uma gota de tinta escurecendo um copo d'água."
        }, {
          icone: "⛔",
          titulo: "Desconto do positivo",
          texto: "Conquistas são minimizadas: 'Qualquer um teria feito isso.' O negativo conta; o positivo não."
        }, {
          icone: "🔮",
          titulo: "Leitura mental",
          texto: "'Sei o que ele está pensando' — sem perguntar. Quase sempre erra, e age com base no erro."
        }, {
          icone: "💥",
          titulo: "Catastrofização",
          texto: "Amplifica o negativo e minimiza a capacidade de lidar: 'Vai ser horrível e não vou aguentar.'"
        }, {
          icone: "🏷️",
          titulo: "Rotulação",
          texto: "Generaliza um comportamento para a identidade: 'Errei' vira 'Sou um fracasso.'"
        }]
      }, {
        tipo: "cards",
        icone: "🛠️",
        titulo: "Como responder a cada distorção",
        subtitulo: "A pergunta certa para cada uma",
        intro: "",
        cards: [{
          icone: "⚫",
          titulo: "Tudo ou nada",
          texto: "'Existe um meio-termo? Onde estaria numa escala de 0 a 10?'",
          cor: COR,
          bg: BG
        }, {
          icone: "🌊",
          titulo: "Supergeneralização",
          texto: "'Existe pelo menos uma exceção a esse sempre/nunca?'",
          cor: "#0891b2",
          bg: "#e0f2fe"
        }, {
          icone: "🔦",
          titulo: "Filtro / Desconto",
          texto: "'O que estou ignorando que também é verdade nessa situação?'",
          cor: "#16a34a",
          bg: "#dcfce7"
        }, {
          icone: "💥",
          titulo: "Catastrofização / Leitura mental",
          texto: "'Qual a probabilidade real? Já verifiquei com a pessoa?'",
          cor: "#d97706",
          bg: "#fef3c7"
        }]
      }, {
        tipo: "destaque",
        icone: "🪞",
        titulo: "O treino da consciência",
        frase: "Você não precisa eliminar distorções. Precisa apenas reconhecê-las antes de agir.",
        subtexto: "O simples ato de dizer 'Estou catastrofizando agora' já ativa o córtex pré-frontal e cria distância da reação automática. A consciência é o início da mudança."
      }],
      perguntas: ["Das 7 distorções, qual você mais reconhece no seu próprio padrão de pensamento?", "Consegue lembrar de uma situação recente em que essa distorção influenciou como você agiu?", "O que mudaria se você fizesse a pergunta certa para essa distorção na próxima vez que ela aparecer?"]
    });
  }

  // ── macro_casais ─────────────────────────────────────────────────────────────

  function PsicoDiscutirDinheiro({
    cat
  }) {
    const COR = "#d97706";
    const BG = "#fef3c7";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Quando você e seu parceiro(a) discutem sobre dinheiro, o que você está sentindo por baixo — segurança, controle, respeito?", "Como o dinheiro era tratado na sua família de origem? Que crença você herdou sobre ele?", "Existe um objetivo financeiro comum que vocês ainda não colocaram no papel e que poderia unir em vez de dividir?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexões sobre Dinheiro e Relacionamento:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "—"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDCB0"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Por que brigamos sobre dinheiro?"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fed7aa",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Quase nunca \xE9 sobre o dinheiro em si \u2014 \xE9 sobre o que ele representa.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "16px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O dinheiro como campo de batalha simb\xF3lico"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#92400e",
        lineHeight: 1.7
      }
    }, "Casais brigam sobre dinheiro com uma intensidade que vai muito al\xE9m dos n\xFAmeros. A conta que n\xE3o foi paga, o gasto que n\xE3o foi consultado \u2014 raramente s\xE3o sobre o valor em si. S\xE3o sobre ", /*#__PURE__*/React.createElement("strong", null, "controle, seguran\xE7a, respeito e poder"), "."), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        borderRadius: 10,
        padding: "10px 14px",
        marginTop: 10,
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#78350f",
        fontStyle: "italic"
      }
    }, "Quando a briga \xE9 sobre dinheiro, a pergunta real \xE9: \"Voc\xEA me respeita? Voc\xEA me protege? Voc\xEA me v\xEA?\""))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #b45309"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O que dizemos vs. o que sentimos"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, [{
      t: "O que dizemos",
      itens: ["'Você gasta demais'", "'Nunca decidimos juntos'", "'Você é controlador(a)'", "'Não sobra nada'"],
      bg: "rgba(255,255,255,0.12)",
      c: "#fed7aa"
    }, {
      t: "O que sentimos",
      itens: ["'Não me sinto seguro(a)'", "'Não tenho voz aqui'", "'Não confio em você'", "'Tenho medo do futuro'"],
      bg: "rgba(255,255,255,0.2)",
      c: "#fef3c7"
    }].map(({
      t,
      itens,
      bg,
      c
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        background: bg,
        borderRadius: 10,
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: c,
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 6
      }
    }, t), itens.map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        color: "#fff7ed",
        fontSize: 11,
        padding: "3px 0",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }
    }, i)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "16px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "De onde v\xEAm as cren\xE7as sobre dinheiro?"), [{
      e: "👨‍👩‍👧",
      t: "Família de origem",
      d: "Quem controlava o dinheiro em casa? Era tabu? Havia escassez ou abundância?"
    }, {
      e: "🧠",
      t: "Crenças formadas",
      d: "'Dinheiro é fonte de conflito', 'Quem ganha mais manda', 'Poupar é obrigação'"
    }, {
      e: "😰",
      t: "Gatilhos emocionais",
      d: "Ver o saldo baixar pode ativar um medo primitivo de sobrevivência"
    }, {
      e: "🔄",
      t: "Padrões repetidos",
      d: "Casais reencenam dinâmicas financeiras que viram nos pais"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#78350f",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#92400e",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "14px 20px",
        borderBottom: "1px solid #b45309"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Como conversar sobre dinheiro de verdade"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [["🕐", "Escolha o momento", "Nunca quando exaustos. Agende uma conversa financeira semanal"], ["🎯", "Separe fato de sentimento", "'O saldo caiu' (fato) → 'Estou preocupado(a) com nossa segurança' (sentimento)"], ["🌱", "Explore as origens", "'O que o dinheiro representa pra você? Como era na sua família?'"], ["🤝", "Construam projeto comum", "Objetivos compartilhados transformam o dinheiro de campo de batalha em aliado"]].map(([e, t, d]) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 10px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 12,
        fontWeight: 500,
        marginBottom: 1
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fed7aa",
        fontSize: 11,
        lineHeight: 1.4
      }
    }, d)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "14px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "\uD83D\uDCA1 Para lembrar"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#78350f",
        lineHeight: 1.7
      }
    }, "O dinheiro n\xE3o divide casais \u2014 a falta de conversa honesta sobre o que ele ", /*#__PURE__*/React.createElement("em", null, "representa"), " \xE9 que divide. Quando dois parceiros conseguem falar sobre o medo por tr\xE1s das contas, a conversa financeira deixa de ser uma batalha e se torna um ato de intimidade. \uD83D\uDC9C")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#78350f",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflex\xF5es"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#78350f",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflex\xE3o...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflex\xF5es pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoFusaoCasal({
    cat
  }) {
    const COR = "#EC4899";
    const BG = "#fdf2f8";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Existe algum interesse, amizade ou parte de você que foi diminuindo desde que está nessa relação?", "Você consegue expressar discordâncias com seu parceiro(a) sem sentir que ameaça a relação?", "O que você faria diferente se soubesse que manter sua individualidade fortalece — e não ameaça — o amor?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexões — Amor ou Fusão:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "—"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDD17"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff0f6",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Amor ou fus\xE3o?"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fce7f3",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Voc\xEA n\xE3o pode amar bem algu\xE9m se perdeu a si mesmo.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff0f6",
        padding: "16px 20px",
        borderBottom: "1px solid #fce7f3"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que \xE9 fus\xE3o?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        lineHeight: 1.7
      }
    }, "No in\xEDcio, a fus\xE3o parece amor profundo: querer estar sempre juntos, pensar no outro o tempo todo, abrir m\xE3o das pr\xF3prias prefer\xEAncias. Mas com o tempo, o que parecia intimidade se torna sufocamento \u2014 e o que parecia cuidado se torna depend\xEAncia."), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        borderRadius: 10,
        padding: "10px 14px",
        marginTop: 10,
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        fontStyle: "italic"
      }
    }, "O amor saud\xE1vel acontece entre dois inteiros \u2014 n\xE3o entre duas metades."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #be185d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff0f6",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Fus\xE3o vs. Intimidade"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, [{
      t: "Fusão ⚠️",
      itens: ["'Somos um só'", "Abandona hobbies", "Ansiedade ao se separar", "Identidade depende do outro", "Ciúme como 'prova de amor'"],
      bg: "rgba(220,38,38,0.2)",
      c: "#fce7f3"
    }, {
      t: "Intimidade ✅",
      itens: ["'Somos dois que escolhem'", "Mantém vida própria", "Conforto na separação", "Identidade estável", "Confiança sem controle"],
      bg: "rgba(255,255,255,0.15)",
      c: "#fff0f6"
    }].map(({
      t,
      itens,
      bg,
      c
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        background: bg,
        borderRadius: 10,
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: c,
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 6
      }
    }, t), itens.map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        color: "#fce7f3",
        fontSize: 11,
        padding: "3px 0",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }
    }, i)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff0f6",
        padding: "16px 20px",
        borderBottom: "1px solid #fce7f3"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como cultivar individualidade dentro do casal"), [{
      e: "🎯",
      t: "Mantenha seus interesses",
      d: "Hobbies, amizades e objetivos individuais não ameaçam o casal — o nutrem"
    }, {
      e: "🗣️",
      t: "Expresse discordâncias",
      d: "Sempre concordar não é harmonia — é apagamento. Divergir com respeito é intimidade real"
    }, {
      e: "⏱️",
      t: "Valorize o tempo sozinho",
      d: "Estar bem consigo mesmo é pré-requisito para estar bem com o outro"
    }, {
      e: "🪞",
      t: "Pergunte-se regularmente",
      d: "'O que eu penso? O que eu quero?' — independente do que o parceiro pensa e quer"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fce7f3"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#831843",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9d174d",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff0f6",
        padding: "14px 20px",
        borderBottom: "1px solid #fce7f3"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 12,
        lineHeight: 1.7
      }
    }, "\uD83E\uDD8B ", /*#__PURE__*/React.createElement("em", null, "Um relacionamento saud\xE1vel \xE9 como dois rios que correm lado a lado \u2014 pr\xF3ximos, mas com suas pr\xF3prias margens. Quando correm paralelos, cada um mant\xE9m sua for\xE7a \u2014 e juntos, criam algo maior."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#831843",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflex\xF5es"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#831843",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflex\xE3o...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflex\xF5es pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoTriangulacao({
    cat
  }) {
    const COR = "#0891b2";
    const BG = "#e0f2fe";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Existe alguém que você tem envolvido nos conflitos do seu relacionamento? O que isso diz sobre o que você evita dizer diretamente?", "Quando sente tensão no casal, qual é o seu impulso — confrontar diretamente ou buscar apoio externo?", "O que tornaria mais seguro ter conversas difíceis diretamente com seu parceiro(a)?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexões — Triangulação no Casal:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "—"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDD3A"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#e0f2fe",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O tri\xE2ngulo invis\xEDvel"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bae6fd",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Por que envolvemos terceiros para evitar conversas dif\xEDceis.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0f9ff",
        padding: "16px 20px",
        borderBottom: "1px solid #bae6fd"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que \xE9 triangula\xE7\xE3o?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#0c4a6e",
        lineHeight: 1.7
      }
    }, "Quando um conflito fica tenso demais, a mente busca uma sa\xEDda: envolver uma terceira pessoa \u2014 um filho, um amigo, a sogra. Qualquer um que alivie a tens\xE3o direta. Mas isso impede que o conflito real seja resolvido."), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        borderRadius: 10,
        padding: "10px 14px",
        marginTop: 10,
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#0c4a6e",
        fontStyle: "italic"
      }
    }, "A triangula\xE7\xE3o alivia a tens\xE3o imediata mas enterra o problema \u2014 at\xE9 ele explodir de outra forma."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #0369a1"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#e0f2fe",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Formas comuns de triangula\xE7\xE3o"), [{
      e: "👶",
      t: "Usar os filhos",
      d: "Passar recados, fazer a criança escolher lados, desabafar sobre o cônjuge"
    }, {
      e: "👩‍👦",
      t: "Envolver a família",
      d: "'Minha mãe também acha que você está errado(a)' — buscar aliados fora"
    }, {
      e: "👫",
      t: "Desabafar demais com amigos",
      d: "O amigo vira árbitro involuntário do conflito do casal"
    }, {
      e: "📱",
      t: "Ciúme como triangulação",
      d: "Introduzir uma ameaça para provocar reação emocional no parceiro"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 10px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#e0f2fe",
        fontSize: 12,
        fontWeight: 500,
        marginBottom: 1
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bae6fd",
        fontSize: 11,
        lineHeight: 1.4
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0f9ff",
        padding: "16px 20px",
        borderBottom: "1px solid #bae6fd"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como sair do tri\xE2ngulo"), [{
      e: "🎯",
      t: "Identifique o que evita",
      d: "Medo de rejeição, conflito direto, vulnerabilidade — nomeie o que a triangulação serve para esconder"
    }, {
      e: "🗣️",
      t: "Volte ao par",
      d: "'Preciso conversar com você sobre algo que me incomoda' — direto, sem intermediários"
    }, {
      e: "🔒",
      t: "Proteja a privacidade do casal",
      d: "Conflitos de casal resolvem-se dentro do casal. Compartilhar com terceiros corrói a confiança"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #bae6fd"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#0c4a6e",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#075985",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0f9ff",
        padding: "14px 20px",
        borderBottom: "1px solid #bae6fd"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 12,
        lineHeight: 1.7
      }
    }, "\uD83D\uDCAC ", /*#__PURE__*/React.createElement("em", null, "Toda triangula\xE7\xE3o \xE9 um pedido de conversa que ainda n\xE3o teve coragem de acontecer. O que voc\xEA precisa dizer diretamente ao seu parceiro(a) que ainda n\xE3o disse?"))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#0c4a6e",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflex\xF5es"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#0c4a6e",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflex\xE3o...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflex\xF5es pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoPaisPerfeitos({
    cat
  }) {
    const COR = "#EC4899";
    const BG = "#fdf2f8";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Em que aspecto da parentalidade você se cobra mais? Essa cobrança está te aproximando ou te afastando dos seus filhos?", "Lembra de um momento em que você 'errou' como pai/mãe e depois reparou? Como a criança respondeu?", "Como seria dar a si mesmo(a) a mesma compaixão que daria a um(a) amigo(a) que estivesse passando pelo mesmo?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexões — O Mito do Pai/Mãe Perfeito:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "—"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff0f6",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O mito do pai/m\xE3e perfeito"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fce7f3",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Nunca houve tantas informa\xE7\xF5es sobre parentalidade \u2014 e tanta culpa.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff0f6",
        padding: "16px 20px",
        borderBottom: "1px solid #fce7f3"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O ideal imposs\xEDvel"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        lineHeight: 1.7
      }
    }, "O excesso de informa\xE7\xE3o criou um ideal imposs\xEDvel: o pai/m\xE3e perfeitamente presente, paciente, estimulante, gentil e realizado. Quem n\xE3o alcan\xE7a esse ideal sente que est\xE1 falhando \u2014 e esse sentimento ", /*#__PURE__*/React.createElement("strong", null, "adoece"), "."), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        borderRadius: 10,
        padding: "10px 14px",
        marginTop: 10,
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        fontStyle: "italic"
      }
    }, "O perfeccionismo parental n\xE3o protege os filhos \u2014 mas adoece os pais e, indiretamente, as crian\xE7as."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #be185d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff0f6",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O custo do perfeccionismo parental"), [{
      e: "😰",
      t: "Ansiedade crônica",
      d: "Monitoramento constante com culpa automática a cada erro"
    }, {
      e: "😤",
      t: "Irritabilidade aumentada",
      d: "A pressão de ser sempre paciente cria um cansaço que explode nos momentos errados"
    }, {
      e: "💔",
      t: "Modelagem do perfeccionismo",
      d: "Pais que não toleram seus erros ensinam o mesmo às crianças"
    }, {
      e: "🚪",
      t: "Distância emocional",
      d: "Pais exaustos ficam menos presentes do que pais que se permitem ser humanos"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 10px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff0f6",
        fontSize: 12,
        fontWeight: 500,
        marginBottom: 1
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fce7f3",
        fontSize: 11,
        lineHeight: 1.4
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff0f6",
        padding: "16px 20px",
        borderBottom: "1px solid #fce7f3"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O que as crian\xE7as realmente precisam"), [{
      e: "🔄",
      t: "Reparação, não perfeição",
      d: "O que forma o apego seguro não é nunca errar — é reparar quando erra. 'Me desculpe, errei'"
    }, {
      e: "🎭",
      t: "Emoções autênticas",
      d: "Ver o pai/mãe lidar com frustração de forma humana ensina regulação emocional"
    }, {
      e: "⏱️",
      t: "Presença qualitativa",
      d: "20 minutos de presença real valem mais do que 3 horas de presença física no celular"
    }, {
      e: "🌿",
      t: "Pais que se cuidam",
      d: "Um pai/mãe descansado é mais disponível do que um exausto e culpado"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fce7f3"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#831843",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9d174d",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff0f6",
        padding: "14px 20px",
        borderBottom: "1px solid #fce7f3"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 12,
        lineHeight: 1.7
      }
    }, "\uD83D\uDC9B ", /*#__PURE__*/React.createElement("em", null, "Winnicott estava certo: 'suficientemente bom(a)' \xE9 exatamente o que uma crian\xE7a precisa para crescer segura. Voc\xEA n\xE3o precisa ser perfeito(a) para ser o(a) pai/m\xE3e que seu filho(a) precisa."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#831843",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflex\xF5es"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#831843",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflex\xE3o...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflex\xF5es pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoDesejoAdormece({
    cat
  }) {
    const COR = "#EC4899";
    const BG = "#fdf2f8";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["O que você sente quando pensa na diminuição do desejo na sua relação — culpa, tristeza, resignação?", "Existe algum conflito emocional não resolvido que pode estar criando distância física também?", "O que vocês faziam no início da relação que criava conexão e que pararam de fazer?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexões — O Desejo Não Desaparece, Adormece:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "—"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDD25"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff0f6",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O desejo n\xE3o desaparece \u2014 adormece"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fce7f3",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "A queda do desejo raramente significa falta de amor.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff0f6",
        padding: "16px 20px",
        borderBottom: "1px solid #fce7f3"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que acontece com o desejo no longo prazo"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        lineHeight: 1.7
      }
    }, "Em quase todos os relacionamentos longos, chega um momento em que o desejo sexual diminui. Isso \xE9 t\xE3o comum que pesquisadores o consideram quase universal. Mas culturalmente tratamos como sinal de que algo est\xE1 errado \u2014 quando quase sempre sinaliza algo que precisa de aten\xE7\xE3o, n\xE3o o fim."), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        borderRadius: 10,
        padding: "10px 14px",
        marginTop: 10,
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        fontStyle: "italic"
      }
    }, "A queda do desejo raramente significa falta de amor. Quase sempre sinaliza algo que precisa de aten\xE7\xE3o."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #be185d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff0f6",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Por que o desejo adormece"), [{
      e: "🧠",
      t: "Neurobiologia",
      d: "A dopamina da novidade diminui com a familiaridade — é fisiológico, não é falta de amor"
    }, {
      e: "😤",
      t: "Conflitos não resolvidos",
      d: "Ressentimentos acumulados criam uma barreira emocional que bloqueia a proximidade física"
    }, {
      e: "🪫",
      t: "Exaustão e sobrecarga",
      d: "Filhos, trabalho, finanças — quando a energia está no mínimo, o desejo vai junto"
    }, {
      e: "🔄",
      t: "Rotina excessiva",
      d: "Previsibilidade total é confortável — mas não é excitante. O desejo precisa de alguma surpresa"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 10px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff0f6",
        fontSize: 12,
        fontWeight: 500,
        marginBottom: 1
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fce7f3",
        fontSize: 11,
        lineHeight: 1.4
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff0f6",
        padding: "16px 20px",
        borderBottom: "1px solid #fce7f3"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como despertar o que adormeceu"), [{
      e: "💬",
      t: "Conversa honesta",
      d: "Falar sobre o desejo (ou a falta dele) sem acusação é um dos maiores atos de intimidade possíveis"
    }, {
      e: "🆕",
      t: "Introduzir novidade",
      d: "Experiências novas juntos — viagens, atividades diferentes — reativam dopamina"
    }, {
      e: "🤝",
      t: "Resolver o que ficou pendente",
      d: "Às vezes o bloqueio é emocional. Resolver um conflito antigo pode desbloquear o desejo físico"
    }, {
      e: "🧰",
      t: "Buscar apoio especializado",
      d: "Terapia de casal ou sexual não é sinal de fracasso — é investimento num aspecto vital da relação"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fce7f3"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#831843",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9d174d",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff0f6",
        padding: "14px 20px",
        borderBottom: "1px solid #fce7f3"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 12,
        lineHeight: 1.7
      }
    }, "\uD83D\uDC9B ", /*#__PURE__*/React.createElement("em", null, "O desejo n\xE3o some \u2014 ele vai para onde h\xE1 espa\xE7o, cuidado e conex\xE3o emocional. Em casais que mant\xEAm o desejo ao longo do tempo, o denominador comum \xE9 a disposi\xE7\xE3o de continuar se escolhendo ativamente."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#831843",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflex\xF5es"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#831843",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflex\xE3o...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflex\xF5es pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }

  // ── macro_relacionamentos ─────────────────────────────────────────────────────

  function PsicoOuvirCompetencia({
    cat
  }) {
    const COR = "#d97706";
    const BG = "#fef3c7";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Numa conversa recente, voce estava realmente ouvindo ou ja preparando sua resposta?", "O que costuma te impedir de ouvir de verdade — pressa, julgamento, necessidade de resolver?", "Como seria uma conversa dificil na sua vida se voce aplicasse escuta ativa de verdade?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- Ouvir E Uma Competencia:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDC42"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Ouvir e uma competencia \u2014 e a maioria de nos nao aprendeu"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fed7aa",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Escuta ativa e mais poderosa do que qualquer argumento.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "16px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que e realmente escutar?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#92400e",
        lineHeight: 1.7
      }
    }, "A maioria das pessoas nao ouve para entender \u2014 ouve para responder. Enquanto o outro fala, ja estamos formulando nossa resposta, julgando, comparando com nossa experiencia. A escuta real exige suspender tudo isso."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#78350f",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Sentir-se ouvido e uma das necessidades humanas mais profundas. E raro. E poderoso."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #b45309"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Os 4 niveis de escuta"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      n: "1",
      t: "Fingir que ouve",
      d: "Balancando a cabeca mas pensando em outra coisa",
      c: "#fca5a5"
    }, {
      n: "2",
      t: "Ouvir seletivamente",
      d: "So capta o que confirma o que ja pensa",
      c: "#fde68a"
    }, {
      n: "3",
      t: "Ouvir atentamente",
      d: "Presta atencao nas palavras, mas nao no sentimento",
      c: "#86efac"
    }, {
      n: "4",
      t: "Escuta empatica",
      d: "Ouve para entender — palavras, emocao, intencao por tras",
      c: "#7dd3fc"
    }].map(({
      n,
      t,
      d,
      c
    }) => /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: c,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        color: "#1a001a",
        flexShrink: 0
      }
    }, n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fed7aa",
        fontSize: 11,
        marginTop: 2
      }
    }, d)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "16px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como praticar escuta ativa"), [{
      e: "👁️",
      t: "Contato visual",
      d: "Olhe para a pessoa, nao para o celular ou ao redor"
    }, {
      e: "🤐",
      t: "Nao interrompa",
      d: "Deixe o silencio existir — ele nao precisa ser preenchido"
    }, {
      e: "🔄",
      t: "Parafrasear",
      d: "Repita o que entendeu: Se entendi bem, voce esta dizendo..."
    }, {
      e: "❓",
      t: "Perguntar antes de opinar",
      d: "Voce quer que eu ajude a resolver ou so quer ser ouvido?"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#78350f",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#92400e",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#78350f",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#78350f",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoPalavrasFerem({
    cat
  }) {
    const COR = "#d97706";
    const BG = "#fef3c7";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Voce consegue identificar uma situacao em que suas palavras feriram mais do que queria — o que estava acontecendo no seu cerebro naquele momento?", "Que padrao voce percebe em si mesmo quando esta sob estresse: atacar, calar, ou outro?", "Como voce gostaria de reagir na proxima vez que sentir o cerebro sequestrado numa conversa dificil?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- Por Que as Nossas Palavras Ferem:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDCAC"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Por que as nossas palavras ferem mais do que queremos?"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fed7aa",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "O cerebro sob stress abandona a linguagem empatica e recorre a acusacao automatica.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "16px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que acontece no cerebro em conflito"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#92400e",
        lineHeight: 1.7
      }
    }, "Quando nos sentimos ameacados emocionalmente, a amigdala sequestra o cortex pre-frontal \u2014 a parte responsavel pela empatia, raciocinio e escolha das palavras. O que sai e reativo, nao refletido."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#78350f",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Nao e falta de carater \u2014 e neurobiologia. Mas entender isso nao nos isenta de aprender a fazer diferente."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #b45309"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O que dizemos vs. o que queremos dizer"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      a: "Voce nunca me ouve",
      b: "Preciso sentir que importo para voce"
    }, {
      a: "Voce e irresponsavel",
      b: "Estou com medo e preciso de seguranca"
    }, {
      a: "Sempre e assim com voce",
      b: "Esse padrao me esgota e precisa mudar"
    }, {
      a: "Esquece, nao adianta",
      b: "Estou desistindo porque me sinto invisivel"
    }].map(({
      a,
      b
    }) => /*#__PURE__*/React.createElement("div", {
      key: a,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontSize: 11,
        color: "#fde68a"
      }
    }, a), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#86efac",
        fontWeight: 700
      }
    }, "\u2192"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontSize: 11,
        color: "#bbf7d0"
      }
    }, b))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "16px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como desacelerar antes de falar"), [{
      e: "⏸️",
      t: "Pausa de 6 segundos",
      d: "O cortisol demora 6s para reduzir o suficiente para voce pensar antes de falar"
    }, {
      e: "🌬️",
      t: "Uma respiracao profunda",
      d: "Ativa o sistema parassimpatico e reduz a reatividade da amigdala"
    }, {
      e: "🎯",
      t: "Pergunte-se",
      d: "O que eu quero que o outro entenda de verdade?"
    }, {
      e: "📝",
      t: "Reformule",
      d: "Troque acusacao por necessidade: de Voce faz X para Eu preciso de Y"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#78350f",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#92400e",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#78350f",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#78350f",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoTangoConflito({
    cat
  }) {
    const COR = "#d97706";
    const BG = "#fef3c7";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Qual e o conflito que se repete na sua vida com mais frequencia — e qual e o padrao por tras dele?", "No ciclo de acusacao e defesa, qual e geralmente o seu papel: quem ataca ou quem recua?", "O que precisaria mudar na dinamica para o ciclo ser interrompido antes de escalar?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- O Tango do Conflito:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDD04"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Por que discutimos sempre pela mesma razao?"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fed7aa",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Os ciclos de acusacao e defesa se formam \u2014 e e possivel criar pontos de saida.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "16px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O tango leva dois"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#92400e",
        lineHeight: 1.7
      }
    }, "Conflitos relacionais raramente sao sobre o conteudo da discussao. Sao padroes que se repetem: um ataca, o outro defende ou recua, o primeiro escala, o segundo fecha. Um tango que nenhum dos dois ensaiou conscientemente \u2014 mas que ambos sabem dancar."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#78350f",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Nao e o tema que se repete. E o padrao de interacao que se repete usando temas diferentes."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #b45309"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O ciclo mais comum"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      n: "1",
      t: "Gatilho",
      d: "Um evento ativa uma ferida antiga ou necessidade nao atendida"
    }, {
      n: "2",
      t: "Acusacao",
      d: "A dor se transforma em ataque: Voce sempre... Voce nunca..."
    }, {
      n: "3",
      t: "Defesa",
      d: "O outro sente ameaca e contra-ataca ou recua — nenhum dos dois ouve"
    }, {
      n: "4",
      t: "Escalada ou silencio",
      d: "A briga explode ou alguem fecha — o problema original fica sem solucao"
    }, {
      n: "5",
      t: "Falsa reconciliacao",
      d: "Fazem as pazes sem falar do real — o ciclo se prepara para recomecar"
    }].map(({
      n,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "#fde68a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        color: "#78350f",
        flexShrink: 0
      }
    }, n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fed7aa",
        fontSize: 11,
        marginTop: 2
      }
    }, d)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "16px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Como criar pontos de saida"), [{
      e: "🛑",
      t: "Sinal combinado",
      d: "Acordem uma palavra ou gesto neutro que significa: estamos no ciclo, precisamos parar"
    }, {
      e: "⏰",
      t: "Pausa consciente",
      d: "20 minutos e o tempo minimo para o cortisol baixar o suficiente para conversar"
    }, {
      e: "🎯",
      t: "Nomear o padrao",
      d: "Acho que estamos no nosso ciclo de novo"
    }, {
      e: "💬",
      t: "Falar do sentimento",
      d: "Eu me sinto invisivel em vez de Voce me ignora"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#78350f",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#92400e",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#78350f",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#78350f",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoLimitesPortas({
    cat
  }) {
    const COR = "#d97706";
    const BG = "#fef3c7";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Em qual area da sua vida voce sente mais dificuldade de estabelecer limites — trabalho, familia, amizades?", "Qual e o medo por tras da dificuldade de dizer nao? Rejeicao, culpa, conflito?", "Um limite que voce precisa estabelecer agora — e como voce poderia comunicar isso de forma clara e respeitosa?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- Limites Nao Sao Muros:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDEAA"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Limites nao sao muros \u2014 sao portas com chave"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fed7aa",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Voce decide quem entra, quando e em que condicoes.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "16px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que e um limite saudavel?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#92400e",
        lineHeight: 1.7
      }
    }, "Um limite nao e uma parede para manter as pessoas longe. E uma porta com chave \u2014 voce decide quem entra, quando entra, e em que condicoes. Limites saudaveis protegem sua energia, sua identidade e seus valores sem isolar voce do mundo."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#78350f",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Dizer nao a algo e dizer sim para voce mesmo."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #b45309"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Muro vs. Porta com chave"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fca5a5",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "Muro (rigido)"), ["Nao deixa ninguem se aproximar", "Vem do medo e da dor", "Isola e protege em excesso", "Nao tem excecoes"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#fde8d8",
        marginBottom: 3
      }
    }, "\u2022 ", i))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#86efac",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "Porta (saudavel)"), ["Escolhe quem entra e quando", "Vem dos valores e necessidades", "Permite intimidade com seguranca", "E flexivel e comunicado"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#bbf7d0",
        marginBottom: 3
      }
    }, "\u2022 ", i))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "16px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Por que e tao dificil dizer nao?"), [{
      e: "😰",
      t: "Medo de rejeicao",
      d: "Fui ensinado que meu valor depende de agradar os outros"
    }, {
      e: "😔",
      t: "Culpa",
      d: "Sinto que sou egoista quando coloco minhas necessidades em primeiro lugar"
    }, {
      e: "⚡",
      t: "Medo do conflito",
      d: "Prefiro me sobrecarregar a enfrentar a tensao de discordar"
    }, {
      e: "🔄",
      t: "Padrao aprendido",
      d: "Em minha familia de origem, limites nao eram permitidos ou modelados"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#78350f",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#92400e",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#78350f",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#78350f",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoCargaMental({
    cat
  }) {
    const COR = "#d97706";
    const BG = "#fef3c7";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Quais sao as tarefas invisiveis que voce gerencia sozinho(a) e que raramente sao reconhecidas?", "Voce ja tentou redistribuir essa carga? O que aconteceu?", "O que voce precisaria que a outra pessoa entendesse sobre o peso do que voce carrega?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- A Carga que Nao Se Ve:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83E\uDDE9"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "A carga que nao se ve \u2014 o que e a carga mental"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fed7aa",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "O trabalho invisivel de gerir, planejar e coordenar que esgota sem ser reconhecido.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "16px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que e carga mental?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#92400e",
        lineHeight: 1.7
      }
    }, "Carga mental e o trabalho cognitivo e emocional invisivel de antecipar, lembrar, planejar e coordenar tudo que precisa ser feito. Quem a carrega nao so faz as tarefas \u2014 gerencia a existencia delas. E esse gerenciamento e o que esgota."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#78350f",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Nao e so fazer \u2014 e lembrar que precisa ser feito, quando, como, por quem. Isso tem peso."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #b45309"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O que a carga mental inclui"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      e: "🧠",
      t: "Antecipacao",
      d: "Pensar no que vai acabar, o que precisa ser agendado, o que pode dar errado"
    }, {
      e: "📋",
      t: "Planejamento",
      d: "Organizar rotinas, compromissos, necessidades de todos"
    }, {
      e: "🔄",
      t: "Delegacao",
      d: "Dividir tarefas e ainda assim acompanhar se foram feitas"
    }, {
      e: "💭",
      t: "Carga emocional",
      d: "Monitorar o humor, as necessidades e o bem-estar das pessoas ao redor"
    }, {
      e: "🤫",
      t: "Invisibilidade",
      d: "Tudo isso acontece em silencio — e raramente e visto ou agradecido"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fff7ed",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fed7aa",
        fontSize: 11,
        marginTop: 2
      }
    }, d)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff7ed",
        padding: "16px 20px",
        borderBottom: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Como redistribuir de forma saudavel"), [{
      e: "📊",
      t: "Tornar visivel",
      d: "Liste tudo que voce gerencia. Mostrar dados e mais eficaz do que reclamar"
    }, {
      e: "🤝",
      t: "Delegar de verdade",
      d: "Delegar e transferir a responsabilidade — nao so a tarefa com instrucoes detalhadas"
    }, {
      e: "💬",
      t: "Conversar sem acusar",
      d: "Aborde como parceiros resolvendo um problema, nao como adversarios"
    }, {
      e: "🔄",
      t: "Rever periodicamente",
      d: "A distribuicao precisa ser revisitada conforme a vida muda"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fed7aa"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#78350f",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#92400e",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#78350f",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#78350f",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }

  // ── macro_corpo ───────────────────────────────────────────────────────────────

  function PsicoVisaoIntegral({
    cat
  }) {
    const COR = "#16a34a";
    const BG = "#dcfce7";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Qual dimensao da sua vida esta mais negligenciada agora — fisica, emocional, social, espiritual?", "Como essa negligencia esta afetando as outras areas?", "Um pequeno passo que voce poderia dar essa semana para atender essa area?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- Visao Integral da Saude:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\u2B55"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f0fdf4",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Por que nao basta tratar um sintoma"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bbf7d0",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "As dimensoes de vida se influenciam mutuamente \u2014 o diagnostico precisa ser sistemico.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "A visao integral da saude"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#14532d",
        lineHeight: 1.7
      }
    }, "Tratar apenas o sintoma e como apagar a luz de aviso no painel do carro sem verificar o motor. A saude integral reconhece que corpo, mente, emocoes, relacoes e proposito estao interligados \u2014 o que acontece em uma area afeta todas as outras."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#14532d",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "O sintoma e um mensageiro. A pergunta real e: do que ele esta tentando me avisar?"))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #15803d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f0fdf4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "As dimensoes que se influenciam"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6
      }
    }, [{
      e: "🏃",
      t: "Fisica",
      d: "Sono, alimentacao, movimento, dor"
    }, {
      e: "🧠",
      t: "Mental",
      d: "Pensamentos, crencas, cognicao"
    }, {
      e: "💜",
      t: "Emocional",
      d: "Sentimentos, regulacao, autoestima"
    }, {
      e: "👥",
      t: "Social",
      d: "Vinculos, pertencimento, limites"
    }, {
      e: "🌱",
      t: "Espiritual",
      d: "Proposito, valores, sentido de vida"
    }, {
      e: "💼",
      t: "Ocupacional",
      d: "Trabalho, criatividade, realizacao"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 10px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        marginBottom: 4
      }
    }, e), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f0fdf4",
        fontSize: 11,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bbf7d0",
        fontSize: 10,
        marginTop: 2
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Como pensar sistemicamente sobre sua saude"), [{
      e: "🔍",
      t: "Identifique o sintoma",
      d: "Onde voce sente o desequilibrio? Corpo, emocoes, relacoes?"
    }, {
      e: "🔗",
      t: "Busque a conexao",
      d: "Que outra area pode estar alimentando esse sintoma?"
    }, {
      e: "⚖️",
      t: "Avalie o conjunto",
      d: "Qual dimensao esta mais negligenciada na sua vida agora?"
    }, {
      e: "🌱",
      t: "Intervenha na raiz",
      d: "Tratar o sistema, nao so o sinal — mesmo que seja mais lento"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#14532d",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#166534",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#14532d",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#14532d",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoEscadaSeguranca({
    cat
  }) {
    const COR = "#16a34a";
    const BG = "#dcfce7";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Em qual dos 3 estados do sistema nervoso voce passa mais tempo — seguranca, mobilizacao ou colapso?", "Que situacoes ou pessoas te ajudam a voltar ao estado de seguranca?", "Que sinais do seu corpo indicam que voce esta saindo do estado de seguranca?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- A Escada de Seguranca:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83E\uDDEC"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f0fdf4",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Como o seu sistema nervoso decide se esta em perigo"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bbf7d0",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "A Teoria Polivagal \u2014 os tres estados do sistema nervoso e como regula-los.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que e a Teoria Polivagal?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#14532d",
        lineHeight: 1.7
      }
    }, "Desenvolvida pelo Dr. Stephen Porges, a Teoria Polivagal explica que o sistema nervoso autonomo tem tres estados hierarquicos de resposta ao ambiente. O corpo avalia constantemente o nivel de seguranca \u2014 processo chamado neurocep\xE7\xE3o \u2014 e ativa o estado correspondente, sem consultar a mente consciente.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #15803d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f0fdf4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Os 3 estados da escada"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [{
      n: "↑",
      t: "Seguranca e conexao",
      sub: "Nervo vago ventral",
      d: "Voce se sente calmo, conectado, curioso. Consegue pensar com clareza, ser empatico e colaborativo.",
      c: "#86efac"
    }, {
      n: "⚡",
      t: "Mobilizacao",
      sub: "Sistema simpatico",
      d: "Voce sente urgencia, ansiedade, irritacao. O corpo se prepara para lutar ou fugir.",
      c: "#fde68a"
    }, {
      n: "↓",
      t: "Colapso e desligamento",
      sub: "Nervo vago dorsal",
      d: "Voce se sente entorpecido, desconectado, apagado. O corpo entra em modo de conservacao de energia.",
      c: "#fca5a5"
    }].map(({
      n,
      t,
      sub,
      d,
      c
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        background: "rgba(255,255,255,0.12)",
        borderRadius: 10,
        padding: "12px 14px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f0fdf4",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        background: c,
        color: "#1a001a",
        fontSize: 10,
        fontWeight: 600,
        padding: "1px 7px",
        borderRadius: 10,
        display: "inline-block",
        marginTop: 2
      }
    }, sub))), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bbf7d0",
        fontSize: 11,
        lineHeight: 1.6
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como subir a escada de volta para seguranca"), [{
      e: "🌬️",
      t: "Respiracao lenta",
      d: "Expiracao mais longa que a inspiracao ativa o vago ventral diretamente"
    }, {
      e: "👁️",
      t: "Movimento dos olhos",
      d: "Olhar lentamente ao redor sinaliza ao cerebro que o ambiente e seguro"
    }, {
      e: "🤝",
      t: "Conexao humana",
      d: "Uma voz calma, um toque gentil ou um rosto acolhedor regulam o sistema"
    }, {
      e: "🎵",
      t: "Musica ou voz ritmica",
      d: "O nervo vago responde a sons humanos suaves e ritmos regulares"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#14532d",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#166534",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#14532d",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#14532d",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoCorpoNaoMente({
    cat
  }) {
    const COR = "#16a34a";
    const BG = "#dcfce7";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Voce consegue identificar uma emocao que costuma se manifestar como sintoma fisico no seu corpo?", "Que situacoes ou emocoes precedem seus sintomas fisicos mais frequentes?", "Se o seu corpo pudesse falar, o que ele estaria tentando dizer agora?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- O Corpo Nao Mente:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83E\uDEC0"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f0fdf4",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O corpo nao mente \u2014 a linguagem fisica das emocoes nao expressas"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bbf7d0",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "A neurobiologia da somatizacao \u2014 por que os sintomas fisicos sao frequentemente mensagens emocionais.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que e somatizacao?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#14532d",
        lineHeight: 1.7
      }
    }, "Somatizacao e quando o corpo expressa atraves de sintomas fisicos o que a mente nao consegue ou nao permite processar emocionalmente. Nao e fingimento \u2014 e neurobiologia. O sistema nervoso registra tudo, e quando as emocoes nao encontram saida consciente, elas encontram saida pelo corpo."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#14532d",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "O corpo mantem o placar. O que nao e expresso, e armazenado."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #15803d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f0fdf4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Emocoes e suas manifestacoes no corpo"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      e: "😰",
      em: "Ansiedade",
      f: "Aperto no peito, nausea, tensao muscular, formigamento"
    }, {
      e: "😔",
      em: "Tristeza reprimida",
      f: "Cansaco cronico, dores nas costas, sensacao de peso"
    }, {
      e: "😤",
      em: "Raiva contida",
      f: "Dor de cabeca, tensao no pescoco, mandibula travada"
    }, {
      e: "😨",
      em: "Medo",
      f: "Estomago embrulhado, frio nas maos, dificuldade de respirar"
    }, {
      e: "😶",
      em: "Emocoes nao expressas",
      f: "Sintomas difusos que medicos nao conseguem explicar"
    }].map(({
      e,
      em,
      f
    }) => /*#__PURE__*/React.createElement("div", {
      key: em,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f0fdf4",
        fontSize: 12,
        fontWeight: 600
      }
    }, em), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bbf7d0",
        fontSize: 11,
        marginTop: 2
      }
    }, f)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como ouvir o corpo"), [{
      e: "🔍",
      t: "Escanear o corpo",
      d: "Feche os olhos e percorra o corpo — onde ha tensao, dor ou desconforto?"
    }, {
      e: "❓",
      t: "Pergunte ao sintoma",
      d: "Se essa dor pudesse falar, o que ela diria? Qual emocao ela carrega?"
    }, {
      e: "📓",
      t: "Diario corpo-emocao",
      d: "Registre quando o sintoma aparece e o que estava acontecendo emocionalmente"
    }, {
      e: "🤝",
      t: "Busque apoio",
      d: "Terapia, fisioterapia, acupuntura — tratar o sistema todo, nao so o sintoma"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#14532d",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#166534",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#14532d",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#14532d",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoCienciaPresenca({
    cat
  }) {
    const COR = "#16a34a";
    const BG = "#dcfce7";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Em quais momentos do dia voce percebe que sua mente esta mais ausente do que presente?", "O que voce perde quando esta fisicamente em um lugar mas mentalmente em outro?", "Uma pratica pequena que voce poderia adotar para treinar mais presenca no dia a dia?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- A Ciencia da Presenca:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83E\uDDD8"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f0fdf4",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Onde esta a sua mente quando seu corpo esta aqui?"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bbf7d0",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "A mente vagua 47% do tempo \u2014 e esse custo e fisico, emocional e relacional.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que a ciencia diz sobre presenca"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#14532d",
        lineHeight: 1.7
      }
    }, "Uma pesquisa de Harvard com 2.250 pessoas mostrou que a mente vagueia em 47% do tempo \u2014 independente do que a pessoa esta fazendo. Os participantes eram menos felizes quando a mente estava em outro lugar, mesmo que o pensamento fosse positivo. A presenca, por si so, gera bem-estar."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#14532d",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Uma mente que vagueia e uma mente infeliz. A presenca e treinavel."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #15803d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f0fdf4",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Os custos da ausencia mental"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      e: "😔",
      t: "Infelicidade",
      d: "A mente no passado gera arrependimento. No futuro, gera ansiedade"
    }, {
      e: "💔",
      t: "Conexao reduzida",
      d: "Estar presente em corpo mas ausente em mente isola mesmo estando junto"
    }, {
      e: "⚡",
      t: "Esgotamento",
      d: "Multitarefa mental consome energia sem produzir"
    }, {
      e: "🧠",
      t: "Memoria prejudicada",
      d: "Nao formamos memorias do que nao vivenciamos conscientemente"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f0fdf4",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bbf7d0",
        fontSize: 11,
        marginTop: 2
      }
    }, d)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como treinar a presenca"), [{
      e: "🔁",
      t: "Retorne sem julgamento",
      d: "Quando perceber que a mente viajou, simplesmente retorne. Sem critica — isso e o treino"
    }, {
      e: "👁️",
      t: "Ancora sensorial",
      d: "Foque em 1 coisa que voce ve, ouve ou sente agora. Isso ancora no presente"
    }, {
      e: "📵",
      t: "Uma coisa de cada vez",
      d: "Multitarefa e mito — faz tudo pior. Escolha uma tarefa e fique so com ela"
    }, {
      e: "🌬️",
      t: "Respire conscientemente",
      d: "3 respiracoes lentas e intencionais reiniciam a presenca em qualquer momento"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#14532d",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#166534",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#14532d",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#14532d",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }

  // ── macro_habitos ─────────────────────────────────────────────────────────────

  function PsicoCicloAlivioFalso({
    cat
  }) {
    const COR = "#059669";
    const BG = "#d1fae5";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Qual e o seu principal comportamento de alivio falso — procrastinacao, comida, celular, outro?", "O que voce esta evitando quando recorre a esse comportamento?", "Como voce se sente 30 minutos depois de ter usado esse alivio?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- O Ciclo do Alivio Falso:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDD01"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O ciclo do alivio falso"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 13
      }
    }, "Por que adiar nos acalma na hora \u2014 mas gera uma avalanche de ansiedade depois.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que e alivio falso?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        lineHeight: 1.7
      }
    }, "Alivio falso e qualquer comportamento que reduz a ansiedade no curto prazo, mas que aumenta o problema no longo prazo. A procrastinacao e o exemplo classico: adiar a tarefa alivia imediatamente \u2014 mas a tarefa continua la, e a culpa e a ansiedade crescem."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "O problema nao desaparece \u2014 ele cobra juros."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #047857"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O ciclo em 4 passos"), [{
      n: "1",
      t: "Gatilho",
      d: "Tarefa dificil, emocao desconfortavel"
    }, {
      n: "2",
      t: "Comportamento de fuga",
      d: "Procrastinar, rolar o celular, maratonar serie"
    }, {
      n: "3",
      t: "Alivio imediato",
      d: "A tensao cai — o cerebro aprende que funciona"
    }, {
      n: "4",
      t: "Consequencia",
      d: "A tarefa acumula, a culpa e a ansiedade crescem"
    }].map(({
      n,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "#a7f3d0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        color: "#065f46",
        flexShrink: 0
      }
    }, n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 11,
        marginTop: 2
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como quebrar o ciclo"), [{
      e: "🎯",
      t: "Identifique o gatilho",
      d: "O que especificamente aciona o comportamento?"
    }, {
      e: "⏱️",
      t: "Regra dos 2 minutos",
      d: "Se leva menos de 2 minutos, faca agora"
    }, {
      e: "🌊",
      t: "Surf na emocao",
      d: "Observe o desconforto sem agir — ele passa mais rapido do que parece"
    }, {
      e: "✅",
      t: "Comece pelo menor passo",
      d: "Nao a tarefa inteira — apenas o primeiro minuto"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#065f46",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#047857",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#065f46",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#065f46",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoLimpezaNoturna({
    cat
  }) {
    const COR = "#059669";
    const BG = "#d1fae5";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Como tem sido a qualidade do seu sono ultimamente — e o que voce acha que esta interferindo?", "Qual e o seu ritual (ou falta de ritual) antes de dormir?", "Uma mudanca pequena que voce poderia fazer essa semana para proteger melhor o seu sono?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- A Limpeza Noturna do Cerebro:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83C\uDF19"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "A limpeza noturna do cerebro"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 13
      }
    }, "Como o sono lava as toxinas emocionais e consolida a memoria.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O sistema glinfatico"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        lineHeight: 1.7
      }
    }, "Durante o sono profundo, o cerebro ativa o sistema glinfatico \u2014 uma rede de canais que literalmente lava as toxinas acumuladas ao longo do dia. Privacao de sono nao e apenas cansaco: e toxinas acumuladas no cerebro."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Dormir bem nao e preguica \u2014 e manutencao essencial do cerebro."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #047857"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O que acontece enquanto voce dorme"), [{
      e: "🧹",
      t: "Limpeza de toxinas",
      d: "O sistema glinfatico remove residuos metabolicos"
    }, {
      e: "💾",
      t: "Consolidacao da memoria",
      d: "Aprendizados do dia sao transferidos para a memoria de longo prazo"
    }, {
      e: "😌",
      t: "Regulacao emocional",
      d: "O sono REM processa emocoes dificeis"
    }, {
      e: "🔧",
      t: "Reparacao celular",
      d: "Hormonios de crescimento sao liberados"
    }, {
      e: "⚡",
      t: "Recarga energetica",
      d: "O ATP e restaurado — sem sono, cada decisao custa mais"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 11,
        marginTop: 2
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como proteger o sono"), [{
      e: "📵",
      t: "Tela fora 1h antes",
      d: "A luz azul suprime a melatonina e atrasa o inicio do sono"
    }, {
      e: "🌡️",
      t: "Quarto fresco e escuro",
      d: "O cerebro precisa baixar 1-2 graus para o sono profundo"
    }, {
      e: "⏰",
      t: "Horario regular",
      d: "Acordar sempre no mesmo horario e mais importante que a hora de dormir"
    }, {
      e: "🌙",
      t: "Ritual de transicao",
      d: "20-30 min de atividade calma sinaliza ao cerebro que e hora de desligar"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#065f46",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#047857",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#065f46",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#065f46",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoRegra5Minutos({
    cat
  }) {
    const COR = "#059669";
    const BG = "#d1fae5";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Qual tarefa voce vem adiando ha mais tempo — o que aconteceria se voce fizesse apenas 5 minutos dela agora?", "Quando voce comeca uma tarefa, consegue parar depois de 5 minutos — ou tende a continuar?", "O que o seu cerebro costuma dizer para justificar o adiamento?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- A Regra dos 5 Minutos:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\u23F1\uFE0F"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "A regra dos 5 minutos"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 13
      }
    }, "A tecnica infalivel para vencer a procrastinacao.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Por que o inicio e o maior obstaculo"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        lineHeight: 1.7
      }
    }, "O cerebro percebe tarefas adiadas como ameacas. A antecipacao do esforco ativa a mesma regiao cerebral que processa dor fisica. A regra dos 5 minutos engana esse mecanismo: comprometer-se com apenas 5 minutos e suficientemente pequeno para o cerebro aceitar."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "A motivacao nao vem antes da acao \u2014 vem depois. Comece, e o humor muda."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #047857"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como aplicar"), [{
      n: "1",
      t: "Escolha a tarefa",
      d: "Aquela que voce mais esta evitando"
    }, {
      n: "2",
      t: "Comprometa-se com 5 minutos",
      d: "Nao com a tarefa inteira — apenas 5 minutos"
    }, {
      n: "3",
      t: "Comece imediatamente",
      d: "Sem preparar, sem o momento perfeito. Agora"
    }, {
      n: "4",
      t: "Avalie aos 5 minutos",
      d: "Quer continuar? Otimo. Quer parar? Voce quebrou o ciclo"
    }].map(({
      n,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "#a7f3d0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        color: "#065f46",
        flexShrink: 0
      }
    }, n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 11,
        marginTop: 2
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Por que funciona"), [{
      e: "🧠",
      t: "Efeito Zeigarnik",
      d: "O cerebro tem dificuldade de esquecer tarefas incompletas — comecar cria impulso"
    }, {
      e: "💉",
      t: "Dopamina do progresso",
      d: "Qualquer progresso, mesmo pequeno, libera dopamina"
    }, {
      e: "🌊",
      t: "Quebra a inercio",
      d: "O maior custo de energia e o inicio — depois fica mais facil"
    }, {
      e: "🎯",
      t: "Permite comecar imperfeito",
      d: "Imperfeitamente comecado e melhor que nao comecado"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#065f46",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#047857",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#065f46",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#065f46",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoSinaisDesgaste({
    cat
  }) {
    const COR = "#059669";
    const BG = "#d1fae5";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Quais sinais de desgaste emocional voce esta ignorando ou minimizando agora?", "O que costuma impedir voce de fazer pausa quando precisa?", "Uma estrategia de recarga que funciona para voce — e por que voce nao a usa com mais frequencia?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- Sinais de Desgaste Emocional:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDD0B"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Sinais de desgaste emocional"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 13
      }
    }, "Como identificar a sobrecarga e estrategias de pausa real.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Por que ignoramos os sinais"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        lineHeight: 1.7
      }
    }, "O desgaste emocional raramente aparece de repente. Ele se instala aos poucos, com sinais que frequentemente normalizamos. A cultura da produtividade ensinou a tratar o cansaco como fraqueza \u2014 e muitos so param quando o corpo para compulsoriamente."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Se voce nao criar espaco para descansar, o seu corpo vai criar \u2014 geralmente na pior hora."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #047857"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Sinais de alerta por nivel"), [{
      nivel: "Amarelo",
      c: "#fde68a",
      tc: "#78350f",
      s: "Irritabilidade, dificuldade de concentrar, sono irregular, menos prazer nas coisas"
    }, {
      nivel: "Laranja",
      c: "#fed7aa",
      tc: "#7c2d12",
      s: "Esquecimento frequente, choro facil, isolamento, sensacao de estar no limite"
    }, {
      nivel: "Vermelho",
      c: "#fca5a5",
      tc: "#7f1d1d",
      s: "Esgotamento mesmo apos dormir, apatia total, sintomas fisicos, incapacidade de funcionar"
    }].map(({
      nivel,
      c,
      tc,
      s
    }) => /*#__PURE__*/React.createElement("div", {
      key: nivel,
      style: {
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "10px 12px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: c,
        color: tc,
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 10,
        display: "inline-block",
        marginBottom: 6
      }
    }, nivel), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 11,
        lineHeight: 1.6
      }
    }, s)))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Estrategias de pausa real"), [{
      e: "🌿",
      t: "Pausa ativa",
      d: "Caminhada, alongamento — movimento leve que reseta o sistema nervoso"
    }, {
      e: "📵",
      t: "Desconexao digital",
      d: "30 minutos sem tela sao mais restauradores do que 3h de rolagem passiva"
    }, {
      e: "💤",
      t: "Sono como prioridade",
      d: "Nao e luxo — e a manutencao mais barata e eficaz que existe"
    }, {
      e: "🤝",
      t: "Conexao genuina",
      d: "Uma conversa de verdade com alguem que voce confia recarrega de forma unica"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#065f46",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#047857",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#065f46",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#065f46",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoAgirantesVontade({
    cat
  }) {
    const COR = "#059669";
    const BG = "#d1fae5";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Existe um habito que voce so age quando esta motivado — e o que acontece quando a motivacao vai embora?", "Qual seria um passo tao pequeno que voce conseguiria fazer mesmo sem vontade nenhuma?", "Como voce poderia estruturar seu ambiente para que a acao seja mais facil do que a inacao?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- Agir Antes de Ter Vontade:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDE80"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Agir antes de ter vontade"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 13
      }
    }, "O principio pratico: fazer algo para gerar motivacao \u2014 nao o contrario.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O mito da motivacao"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        lineHeight: 1.7
      }
    }, "A maioria das pessoas espera sentir vontade para agir. Mas a neurociencia mostra o oposto: a motivacao e consequencia da acao, nao sua causa. O sistema dopaminergico e ativado pelo progresso \u2014 e o progresso so existe se voce comecar, com ou sem vontade."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Nao espere a vontade. A vontade vem depois que voce comeca."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #047857"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O ciclo correto"), [{
      n: "❌",
      t: "Mito",
      d: "Vontade → Acao → Resultado (funciona raramente)"
    }, {
      n: "✅",
      t: "Realidade",
      d: "Acao → Progresso → Dopamina → Motivacao → Mais acao"
    }].map(({
      n,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "10px 12px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, n), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 12,
        fontWeight: 600
      }
    }, t)), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 11
      }
    }, d))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      e: "📐",
      t: "Design do ambiente",
      d: "Remova friccao: tenis ao lado da cama, livro na mesa"
    }, {
      e: "⏰",
      t: "Horario fixo",
      d: "Habito atrelado a horario nao precisa de decisao"
    }, {
      e: "🔗",
      t: "Empilhamento",
      d: "Depois de [habito existente], vou [novo habito]"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 11,
        marginTop: 2
      }
    }, d)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#065f46",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#065f46",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoMitoBateriaInfinita({
    cat
  }) {
    const COR = "#059669";
    const BG = "#d1fae5";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Em que nivel sua bateria emocional esta agora — e quando foi a ultima vez que voce a recarregou de verdade?", "O que drena mais sua energia — situacoes, pessoas ou pensamentos?", "O que voce precisaria eliminar, reduzir ou mudar para ter mais energia disponivel?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- O Mito da Bateria Infinita:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDD0B"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O mito da bateria infinita"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 13
      }
    }, "Sinais de alerta de que o sistema nervoso esta a entrar em esgotamento.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O mito da produtividade ilimitada"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        lineHeight: 1.7
      }
    }, "A cultura moderna trata os seres humanos como maquinas com bateria infinita. Mas o sistema nervoso tem limites fisicos e quimicos reais. Cortisol, noradrenalina, serotonina \u2014 todos se esgotam. Quando os recursos neurobiologicos acabam, o desempenho cai e a irritabilidade aumenta."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Voce nao e preguicoso quando esta esgotado. Voce esta sem recurso."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #047857"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Sinais de bateria baixa"), [{
      e: "😤",
      t: "Irritabilidade desproporcional",
      d: "Pequenas coisas provocam reacoes grandes"
    }, {
      e: "🧠",
      t: "Neblina mental",
      d: "Dificuldade de concentrar, esquecer coisas simples"
    }, {
      e: "😴",
      t: "Cansaco que nao passa",
      d: "Dormir nao resolve — esgotamento mais profundo"
    }, {
      e: "😶",
      t: "Apatia e desconexao",
      d: "Coisas que antes davam prazer nao movem mais"
    }, {
      e: "🤒",
      t: "Sintomas fisicos recorrentes",
      d: "Imunidade baixa, dores de cabeca, tensao cronica"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 11,
        marginTop: 2
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como recarregar de verdade"), [{
      e: "💤",
      t: "Sono de qualidade",
      d: "A unica recarga que o cerebro aceita — nao ha substituto"
    }, {
      e: "🌿",
      t: "Exposicao a natureza",
      d: "20 minutos em ambiente natural reduz cortisol significativamente"
    }, {
      e: "🤝",
      t: "Conexao genuina",
      d: "Conversas reais com pessoas que te fazem bem"
    }, {
      e: "🎯",
      t: "Eliminar drenos",
      d: "Identificar e reduzir o que consome energia sem retornar"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#065f46",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#047857",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#065f46",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#065f46",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoPoder1Porcento({
    cat
  }) {
    const COR = "#059669";
    const BG = "#d1fae5";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Em qual area da sua vida 1% de melhoria diaria teria mais impacto em 1 ano?", "Qual habito pequeno voce poderia comecar hoje — tao pequeno que seria impossivel dizer nao?", "O que tem te impedido de manter habitos — o inicio ou a consistencia?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- O Poder do 1% Diario:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDCC8"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O poder do 1% diario"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 13
      }
    }, "Como pequenas melhorias diarias se acumulam em transformacoes extraordinarias.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "A matematica dos pequenos habitos"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        lineHeight: 1.7
      }
    }, "Melhorar 1% por dia durante um ano resulta em 37 vezes melhor. Piorar 1% por dia resulta em quase zero. O impacto dos habitos e invisivel no curto prazo \u2014 e inevitavel no longo prazo."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        borderRadius: 8,
        padding: "10px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24,
        fontWeight: 700,
        color: COR
      }
    }, "37x"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#065f46"
      }
    }, "+1% ao dia / 1 ano")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fee2e2",
        borderRadius: 8,
        padding: "10px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24,
        fontWeight: 700,
        color: "#dc2626"
      }
    }, "0,03"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#7f1d1d"
      }
    }, "-1% ao dia / 1 ano")))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #047857"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Por que habitos pequenos funcionam melhor"), [{
      e: "🧠",
      t: "Reducao da resistencia",
      d: "O cerebro nao resiste a algo pequeno"
    }, {
      e: "🔄",
      t: "Automatizacao",
      d: "Acoes repetidas criam vias neurais — apos 60-70 dias vira piloto automatico"
    }, {
      e: "💉",
      t: "Recompensa imediata",
      d: "Pequenas vitorias diarias geram dopamina"
    }, {
      e: "📐",
      t: "Identidade",
      d: "Cada acao consistente confirma para voce mesmo quem voce e"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 11,
        marginTop: 2
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Como comecar o seu 1%"), [{
      e: "🎯",
      t: "Escolha uma area so",
      d: "Saude, relacoes, trabalho, aprendizado"
    }, {
      e: "📏",
      t: "Seja especifico",
      d: "Nao meditar — mas respirar 2 minutos"
    }, {
      e: "🔗",
      t: "Conecte a algo existente",
      d: "Depois de escovar os dentes, vou ler 1 pagina"
    }, {
      e: "📊",
      t: "Registre",
      d: "Ver progresso visual e mais motivador do que qualquer discurso"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#065f46",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#047857",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#065f46",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#065f46",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoDiarioPequenasVitorias({
    cat
  }) {
    const COR = "#059669";
    const BG = "#d1fae5";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Quais foram as 3 menores vitorias dessa semana que voce deixou passar sem reconhecer?", "Como voce se sente quando reconhece o proprio progresso — mesmo que pequeno?", "Que formato de registro funcionaria melhor para voce: diario, app, bloco de papel?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- O Diario de Pequenas Vitorias:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83C\uDFC6"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O diario de pequenas vitorias"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 13
      }
    }, "Como treinar o cerebro para notar o que deu certo.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Por que o cerebro ignora o progresso"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        lineHeight: 1.7
      }
    }, "O cerebro humano tem vies de negatividade \u2014 registra ameacas e fracassos com muito mais intensidade do que sucessos. Isso foi util na savana. Na vida moderna, significa que acabamos o dia lembrando do que nao fizemos e esquecendo o que fizemos."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#065f46",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "O que voce registra, voce fortifica. O que voce ignora, desaparece."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #047857"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O que conta como vitoria"), [{
      e: "✅",
      t: "Fez o que planejou",
      d: "Acordou no horario, foi a academia, entregou — isso conta"
    }, {
      e: "💪",
      t: "Resistiu a algo dificil",
      d: "Nao comeu o que nao queria, esperou — isso conta"
    }, {
      e: "🌱",
      t: "Tentou algo novo",
      d: "Saiu da zona de conforto, pediu ajuda — isso conta"
    }, {
      e: "💜",
      t: "Cuidou de si",
      d: "Dormiu cedo, fez pausa, disse nao — isso conta"
    }, {
      e: "🔄",
      t: "Recomeçou",
      d: "Caiu e retomou no mesmo dia — isso conta mais do que nunca ter caido"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ecfdf5",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 11,
        marginTop: 2
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como criar o habito do registro"), [{
      e: "🌙",
      t: "Faca a noite",
      d: "2 minutos antes de dormir. Qual foi a menor vitoria de hoje?"
    }, {
      e: "📏",
      t: "Seja especifico",
      d: "Nao apenas bom dia — mas acordei sem celular por 30 minutos"
    }, {
      e: "🔢",
      t: "3 por dia",
      d: "Suficiente para treinar o olhar, pequeno o suficiente para manter"
    }, {
      e: "🔁",
      t: "Revise semanalmente",
      d: "Ler as vitorias da semana toda de uma vez cria sensacao poderosa de progresso"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #a7f3d0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#065f46",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#047857",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#065f46",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#065f46",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }

  // ── macro_humor ───────────────────────────────────────────────────────────────

  function PsicoParaQueServemEmocoes({
    cat
  }) {
    const COR = "#db2777";
    const BG = "#fce7f3";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Qual emocao voce mais tende a suprimir — e o que voce acha que ela esta tentando dizer?", "Quando voce sente uma emocao intensa, sua tendencia e agir, suprimir ou observar?", "Como seria sua relacao com suas emocoes se voce as tratasse como mensageiras em vez de inimigos?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- Para que Servem as Emocoes:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\u2764\uFE0F"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Para que servem as emocoes?"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 13
      }
    }, "Nao ha emocoes erradas \u2014 todas sao mensageiras com uma funcao vital.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Emocoes como sistema de informacao"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        lineHeight: 1.7
      }
    }, "As emocoes nao sao defeitos do sistema nervoso \u2014 sao o sistema de navegacao mais sofisticado que existe. Cada emocao carrega uma mensagem sobre o que e importante para voce, o que esta ameacado, o que precisa de atencao. Suprimir emocoes e como desligar os indicadores do painel do carro."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Nao existe emocao ruim. Existe emocao bem ou mal utilizada."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #be185d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O que cada emocao comunica"), [{
      e: "😨",
      em: "Medo",
      f: "Algo importante esta ameacado — avalie o perigo real"
    }, {
      e: "😤",
      em: "Raiva",
      f: "Um limite foi violado ou uma injustica aconteceu"
    }, {
      e: "😢",
      em: "Tristeza",
      f: "Uma perda ocorreu — voce precisa processar e integrar"
    }, {
      e: "😔",
      em: "Culpa",
      f: "Voce agiu contra seus valores — ha oportunidade de reparar"
    }, {
      e: "😊",
      em: "Alegria",
      f: "Voce esta alinhado com o que importa — registre e amplifique"
    }, {
      e: "🤢",
      em: "Nojo",
      f: "Um limite moral ou fisico foi cruzado"
    }].map(({
      e,
      em,
      f
    }) => /*#__PURE__*/React.createElement("div", {
      key: em,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 10px",
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 12,
        fontWeight: 600
      }
    }, em), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 11,
        marginTop: 2
      }
    }, f))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como se relacionar melhor com as emocoes"), [{
      e: "👁️",
      t: "Observe antes de agir",
      d: "Pause entre sentir e reagir"
    }, {
      e: "🏷️",
      t: "Nomeie com precisao",
      d: "Diferenciar ansiedade de medo muda a resposta"
    }, {
      e: "❓",
      t: "Pergunte a mensagem",
      d: "O que essa emocao esta tentando me dizer?"
    }, {
      e: "🌊",
      t: "Surf — nao lute",
      d: "Resistir amplifica. Observar deixa passar"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#831843",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9d174d",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#831843",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#831843",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoAutocompaixao({
    cat
  }) {
    const COR = "#db2777";
    const BG = "#fce7f3";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Como voce fala consigo mesmo quando comete um erro — voce trataria um amigo da mesma forma?", "Que crenca esta por tras da sua autocritica — ela te protege ou te motiva de verdade?", "Uma frase de autocompaixao que voce poderia usar na proxima vez que falhar consigo mesmo?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- Autocompaixao:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83E\uDD17"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Autocompaixao"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 13
      }
    }, "Como ser menos critico consigo mesmo \u2014 sem baixar o padrao.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que e autocompaixao"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        lineHeight: 1.7
      }
    }, "Autocompaixao e a capacidade de se tratar com a mesma gentileza que voce trataria um bom amigo diante do sofrimento ou das proprias falhas. Nao e vitimismo, nao e baixar o padrao. E parar de adicionar sofrimento ao sofrimento."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "A critica severa nao motiva \u2014 paralisa. A autocompaixao libera energia para mudar."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #be185d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Os 3 componentes"), [{
      n: "1",
      t: "Gentileza consigo mesmo",
      sub: "Em vez de julgamento severo",
      d: "Tratar-se com cuidado quando voce falha — como faria com alguem que ama"
    }, {
      n: "2",
      t: "Humanidade compartilhada",
      sub: "Em vez de isolamento",
      d: "Reconhecer que sofrer e falhar faz parte da experiencia humana"
    }, {
      n: "3",
      t: "Mindfulness",
      sub: "Em vez de superidentificacao",
      d: "Observar pensamentos e emocoes dolorosas sem exagerar nem suprimir"
    }].map(({
      n,
      t,
      sub,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        background: "rgba(255,255,255,0.12)",
        borderRadius: 10,
        padding: "10px 12px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "#fbcfe8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        color: "#831843",
        flexShrink: 0
      }
    }, n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 10,
        marginTop: 1
      }
    }, sub))), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 11,
        lineHeight: 1.6
      }
    }, d)))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Praticas"), [{
      e: "🪞",
      t: "Fale como falaria a um amigo",
      d: "Quando critico, pergunte: eu diria isso a alguem que amo?"
    }, {
      e: "✋",
      t: "Gesto de conforto",
      d: "Mao no coracao ao sentir sofrimento — o toque ativa o sistema de cuidado"
    }, {
      e: "📝",
      t: "Carta de autocompaixao",
      d: "Escreva para si como um amigo compassivo escreveria"
    }, {
      e: "🌊",
      t: "Valide antes de resolver",
      d: "Antes de buscar solucao: isso e dificil. Faz sentido que eu esteja sofrendo"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#831843",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9d174d",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#831843",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#831843",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoAcaoGeraMotivacao({
    cat
  }) {
    const COR = "#db2777";
    const BG = "#fce7f3";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Existe algo que voce vem adiando esperando ter vontade — qual seria o menor passo possivel para comecar agora?", "Como voce se sente depois de agir mesmo sem vontade — diferente de quando ficou parado esperando?", "Que area da sua vida mais precisa de acao agora, independente de como voce esta se sentindo?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- Acao Gera Motivacao:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\u26A1"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Acao gera motivacao"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 13
      }
    }, "Por que esperar ter vontade so agrava o desanimo \u2014 e como inverter o ciclo.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "A armadilha de esperar a motivacao"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        lineHeight: 1.7
      }
    }, "Quando estamos desanimados, esperamos sentir vontade para agir. Mas a neurociencia mostra que essa sequencia esta invertida: a motivacao nao precede a acao \u2014 ela e produzida por ela. A dopamina e liberada pelo progresso, nao pela antecipacao."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Voce nao precisa estar pronto. Voce precisa comecar."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #be185d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como o ciclo funciona"), [{
      n: "1",
      t: "Acao minima",
      d: "Qualquer acao, por menor que seja"
    }, {
      n: "2",
      t: "Progresso percebido",
      d: "O cerebro registra que algo foi feito"
    }, {
      n: "3",
      t: "Dopamina liberada",
      d: "O sistema de recompensa e ativado"
    }, {
      n: "4",
      t: "Motivacao gerada",
      d: "A vontade aparece como consequencia da acao"
    }, {
      n: "5",
      t: "Mais acao",
      d: "O ciclo se autoalimenta"
    }].map(({
      n,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "#fbcfe8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        color: "#831843",
        flexShrink: 0
      }
    }, n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 11,
        marginTop: 2
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Estrategias para comecar sem vontade"), [{
      e: "🎯",
      t: "O minimo absurdo",
      d: "O que e tao pequeno que seria ridiculo nao fazer?"
    }, {
      e: "⏱️",
      t: "Temporizador de 10 min",
      d: "Comprometa-se com 10 minutos apenas"
    }, {
      e: "🌍",
      t: "Mude o ambiente",
      d: "Sair do lugar onde voce esta parado quebra o estado emocional"
    }, {
      e: "💬",
      t: "Diga em voz alta",
      d: "Declarar a acao antes de fazer aumenta a probabilidade de execucao"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#831843",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9d174d",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#831843",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#831843",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoCerebroSequestrado({
    cat
  }) {
    const COR = "#db2777";
    const BG = "#fce7f3";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Voce consegue identificar uma situacao recente em que seu cerebro foi sequestrado — o que disparou e como voce reagiu?", "Quais sao os seus sinais pessoais de que o sequestro esta acontecendo — no corpo, no pensamento, na fala?", "Que estrategia voce poderia usar nos proximos 6 segundos para nao dizer algo de que vai se arrepender?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- O Cerebro Sequestrado:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83E\uDDE0"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O cerebro sequestrado"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 13
      }
    }, "O sequestro da amigdala \u2014 por que dizemos o que nao queremos na raiva.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O que e o sequestro da amigdala?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        lineHeight: 1.7
      }
    }, "Quando a amigdala percebe uma ameaca, ela literalmente sequestra o cortex pre-frontal \u2014 responsavel pela razao, empatia e controle de impulsos. Em milissegundos, voce perde acesso ao seu melhor julgamento e age a partir do instinto de sobrevivencia."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Nao e fraqueza de carater \u2014 e neurobiologia. Mas e possivel treinar a pausa."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #be185d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "O que acontece durante o sequestro"), [{
      e: "⚡",
      t: "Disparo instantaneo",
      d: "A amigdala reage antes do cortex processar"
    }, {
      e: "🔴",
      t: "Cortex desligado",
      d: "Perdemos acesso a empatia, logica e controle de impulsos"
    }, {
      e: "💬",
      t: "Palavras que escapam",
      d: "O filtro social desaparece"
    }, {
      e: "😔",
      t: "Arrependimento depois",
      d: "Quando o cortex volta (10-20 min), percebemos o estrago"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 11,
        marginTop: 2
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como treinar a pausa"), [{
      e: "⏱️",
      t: "Regra dos 6 segundos",
      d: "O pico de cortisol dura 6 segundos. Aguardar reduz drasticamente a reatividade"
    }, {
      e: "🌬️",
      t: "Respiracao 4-7-8",
      d: "Inspirar 4s, segurar 7s, expirar 8s. Ativa o vago"
    }, {
      e: "🚶",
      t: "Sair fisicamente",
      d: "Mudar o ambiente interrompe o ciclo"
    }, {
      e: "🏷️",
      t: "Nomeie a emocao",
      d: "Nomear em voz alta reduz a atividade da amigdala"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#831843",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9d174d",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#831843",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#831843",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoFiltroNegativo({
    cat
  }) {
    const COR = "#db2777";
    const BG = "#fce7f3";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Voce consegue identificar uma situacao recente em que ignorou elogios e focou em uma critica?", "Que evidencias positivas sobre voce mesmo voce costuma descartar ou minimizar?", "Como seria sua percepcao de si mesmo se voce aplicasse o mesmo peso aos elogios que as criticas?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- O Filtro Negativo da Mente:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDD26"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O filtro negativo da mente"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 13
      }
    }, "Por que ignoramos 10 elogios e focamos em 1 critica.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "O vies de negatividade"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        lineHeight: 1.7
      }
    }, "O cerebro humano e biologicamente programado para dar mais peso a experiencias negativas \u2014 uma heranca evolutiva. Na vida moderna, esse mecanismo faz com que uma critica dure dias na memoria enquanto 10 elogios desaparecem em horas."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Experiencias negativas grudam. Positivas escorregam. E possivel mudar isso."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #be185d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como o filtro se manifesta"), [{
      e: "🔍",
      t: "Filtragem mental",
      d: "Captar apenas o negativo, ignorando todo o contexto positivo"
    }, {
      e: "💭",
      t: "Desqualificacao do positivo",
      d: "Receber elogio e pensar: foi sorte, estao sendo gentis"
    }, {
      e: "📺",
      t: "Ruminacao seletiva",
      d: "Revisitar criticas repetidamente enquanto sucessos sao esquecidos"
    }, {
      e: "⚖️",
      t: "Assimetria de peso",
      d: "Erros valem muito mais do que acertos na balanca interna"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 11,
        marginTop: 2
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como re-equilibrar o filtro"), [{
      e: "📓",
      t: "Diario de evidencias positivas",
      d: "Registre diariamente 3 coisas que deram certo"
    }, {
      e: "⏸️",
      t: "Pause antes de descartar",
      d: "Quando receber um elogio, respire antes de minimizar"
    }, {
      e: "🔄",
      t: "Busque evidencias contrarias",
      d: "Para cada critica que gruda, liste 3 evidencias que a contradizem"
    }, {
      e: "🧠",
      t: "Saiba que e neurobiologia",
      d: "Nao e pessimismo — e o sistema padrao. Mudar exige esforco consciente"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#831843",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9d174d",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#831843",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#831843",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoJuizInternoTreinador({
    cat
  }) {
    const COR = "#db2777";
    const BG = "#fce7f3";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Como e a voz do seu Juiz Interno — severa, ironica, catastrofica? De onde voce acha que ela veio?", "Pense em um treinador que voce admira. Como essa pessoa falaria sobre o mesmo erro?", "Como seria sua vida se voce substituisse 50% das mensagens do Juiz pelo Treinador?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- O Juiz Interno vs. O Treinador:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\u2696\uFE0F"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O Juiz Interno vs. O Treinador"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 13
      }
    }, "A diferenca entre a critica que paralisa e o incentivo que produz mudanca real.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Duas vozes internas"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        lineHeight: 1.7
      }
    }, "Todos temos duas vozes internas: o Juiz \u2014 que condena, humilha e generaliza \u2014 e o Treinador \u2014 que avalia com honestidade, aponta o que melhorar e encoraja. A diferenca nao e o nivel de exigencia. E a intencao: o Juiz quer punir; o Treinador quer crescimento.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #be185d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Juiz vs. Treinador \u2014 na pratica"), [{
      j: "Que idiota, voce errou de novo",
      t: "Esse erro mostra onde precisa praticar mais"
    }, {
      j: "Voce nunca vai conseguir",
      t: "Ainda nao chegou la — o que pode fazer diferente?"
    }, {
      j: "Todo mundo ja percebeu que voce e incompetente",
      t: "Essa situacao foi dificil. O que voce aprendeu?"
    }, {
      j: "Nao adianta nem tentar",
      t: "O proximo passo e pequeno o suficiente para tentar agora"
    }].map(({
      j,
      t
    }) => /*#__PURE__*/React.createElement("div", {
      key: j,
      style: {
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        marginBottom: 4,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "#fca5a5",
        fontWeight: 600,
        flexShrink: 0
      }
    }, "Juiz:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#fde8d8",
        fontStyle: "italic"
      }
    }, j)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "#86efac",
        fontWeight: 600,
        flexShrink: 0
      }
    }, "Trein.:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#bbf7d0"
      }
    }, t))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como fortalecer o Treinador"), [{
      e: "👁️",
      t: "Reconheca a voz do Juiz",
      d: "Nomeie quando ele falar — isso cria distancia"
    }, {
      e: "❓",
      t: "Questione a sentenca",
      d: "O Juiz e justo? Quais evidencias contradizem o que ele diz?"
    }, {
      e: "🔄",
      t: "Reformule com o Treinador",
      d: "O que um treinador que eu respeito diria sobre isso?"
    }, {
      e: "📈",
      t: "Foque no processo",
      d: "Juiz foca no resultado. Treinador foca no aprendizado"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#831843",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9d174d",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#831843",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#831843",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoRodaEmocoes({
    cat
  }) {
    const COR = "#db2777";
    const BG = "#fce7f3";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Voce tem dificuldade de nomear o que sente com precisao — ou usa sempre as mesmas palavras como bem, mal, estressado?", "Qual e a emocao que voce mais evita nomear — e por que acha que a evita?", "Como um vocabulario emocional mais rico poderia mudar suas conversas mais importantes?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- A Roda das Emocoes:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83C\uDFA8"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "A roda das emocoes"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 13
      }
    }, "A importancia de saber nomear exatamente o que voce sente.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "Por que nomear importa"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        lineHeight: 1.7
      }
    }, "Pesquisas de neurociencia mostram que nomear uma emocao com precisao reduz sua intensidade \u2014 processo chamado affect labeling. Quanto mais preciso voce e ao nomear o que sente, mais controle tem sobre isso."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "Granularidade emocional \u2014 vocabulario emocional rico \u2014 e preditor de saude mental."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #be185d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Da emocao basica a nuance"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6
      }
    }, [{
      base: "Triste",
      nuances: ["Melancólico", "Decepcionado", "Saudoso", "Desolado"]
    }, {
      base: "Com medo",
      nuances: ["Ansioso", "Apreensivo", "Inseguro", "Vulneravel"]
    }, {
      base: "Raivoso",
      nuances: ["Frustrado", "Indignado", "Irritado", "Ressentido"]
    }, {
      base: "Feliz",
      nuances: ["Grato", "Aliviado", "Empolgado", "Realizado"]
    }].map(({
      base,
      nuances
    }) => /*#__PURE__*/React.createElement("div", {
      key: base,
      style: {
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "10px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 6
      }
    }, base), nuances.map(n => /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        fontSize: 10,
        color: "#fbcfe8",
        marginBottom: 2
      }
    }, "\u2022 ", n)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como ampliar seu vocabulario emocional"), [{
      e: "🎨",
      t: "Use a Roda das Emocoes",
      d: "A roda de Robert Plutchik mostra camadas de nuance"
    }, {
      e: "📓",
      t: "Diario emocional",
      d: "Qual foi a emocao mais intensa hoje? Consigo nomear com mais precisao?"
    }, {
      e: "❓",
      t: "Pergunte mais fundo",
      d: "Quando disser estou mal, pergunte: mal como? Cansado, triste, frustrado?"
    }, {
      e: "🗣️",
      t: "Compartilhe com precisao",
      d: "Em conversas importantes, ouse usar palavras mais especificas"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#831843",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9d174d",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#831843",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#831843",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoSurfarOndaEmocao({
    cat
  }) {
    const COR = "#db2777";
    const BG = "#fce7f3";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Qual emocao intensa voce mais tende a fugir ou suprimir — e o que costuma fazer para evitar sentir?", "Voce ja tentou apenas observar uma emocao sem agir ou fugir? O que aconteceu?", "Como seria atravessar a proxima onda emocional intensa com curiosidade em vez de resistencia?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = "Reflexoes -- Surfar a Onda da Emocao:\n\n" + PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "--"}`).join("\n\n");
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83C\uDFC4"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "Surfar a onda da emocao"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 13
      }
    }, "Como a emocao intensa tem um pico e desce naturalmente \u2014 se nao lutarmos contra ela.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 8
      }
    }, "A metafora da onda"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        lineHeight: 1.7
      }
    }, "Emocoes sao como ondas: sobem, atingem um pico e descem naturalmente \u2014 se nao interferirmos. O problema e que a maioria das pessoas tenta resistir a onda ou e arrastada por ela. Surfar e diferente: voce se move com a onda, sem ser controlado por ela e sem fugir dela."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "A emocao nao e o problema. Resistir a ela e que a torna insuportavel."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #be185d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fdf2f8",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Resistir vs. Surfar"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fca5a5",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "Resistir"), ["Emocao fica mais intensa", "Gera mais ansiedade", "Cria comportamentos de fuga", "Consome muita energia"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#fde8d8",
        marginBottom: 3
      }
    }, "\u2022 ", i))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#86efac",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "Surfar"), ["Emocao tem seu curso natural", "Dura menos do que parece", "Reduz o medo da propria emocao", "Libera energia para agir"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#bbf7d0",
        marginBottom: 3
      }
    }, "\u2022 ", i))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fdf2f8",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 10
      }
    }, "Como surfar na pratica"), [{
      e: "🧘",
      t: "Observe sem agir",
      d: "Quando a emocao chegar, pause antes de fazer qualquer coisa"
    }, {
      e: "📍",
      t: "Localize no corpo",
      d: "Onde voce sente essa emocao? Descreva sem julgar"
    }, {
      e: "🌬️",
      t: "Respire com ela",
      d: "Nao para eliminar — para acompanhar"
    }, {
      e: "⏱️",
      t: "Espere o pico",
      d: "A maioria das emocoes intensas dura menos de 90 segundos no pico"
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "white",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#831843",
        marginBottom: 2
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9d174d",
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#831843",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Suas reflexoes"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#831843",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflexao...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        boxSizing: "border-box"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit"
      }
    }, "\uD83D\uDCF2 Enviar reflexoes pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888780",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psicologa \xB7 CRP 09/20590"));
  }
  function PsicoSurfandoOndaEmocao({
    cat
  }) {
    return /*#__PURE__*/React.createElement(PsicoSurfarOndaEmocao, {
      cat: cat
    });
  }

  // ═══════════════════════════════════════════════════════
  // COMPULSÃO SEXUAL — Psicoeducação Visual
  // Formato: página única · JSX direto · sem navegação por seções
  // ═══════════════════════════════════════════════════════

  function PsicoCicloGatilho({
    cat
  }) {
    const COR = "#7c3aed";
    const BG = "#ede9fe";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Em qual etapa do ciclo você se percebe mais claramente?", "Qual emoção costuma ser o gatilho mais frequente?", "Que estratégia poderia usar para interromper o ciclo antes do ato?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = `Reflexões — O Ciclo do Gatilho:\n\n${PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "—"}`).join("\n\n")}`;
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDD04"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ede9fe",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "O comportamento compulsivo raramente come\xE7a com desejo"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#c4b5fd",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "Come\xE7a com um estado emocional desconfort\xE1vel \u2014 e segue um ciclo previs\xEDvel.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f5ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e9d5ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 8
      }
    }, "\uD83E\uDDE0 Por que o ciclo se repete?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#4c1d95",
        lineHeight: 1.7
      }
    }, "O que mant\xE9m o ciclo n\xE3o \xE9 fraqueza moral \u2014 \xE9 neurobiologia. O c\xE9rebro aprendeu que esse comportamento resolve aquele estado emocional rapidamente. E o que funciona rapidamente, o c\xE9rebro repete."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#4c1d95",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "N\xE3o \xE9 falta de vontade. \xC9 um padr\xE3o neurol\xF3gico aprendido \u2014 e padr\xF5es aprendidos podem ser desaprendidos."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #6d28d9"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ede9fe",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 10
      }
    }, "\u26A1 As 5 etapas do ciclo"), [{
      e: "⚡",
      t: "1. Gatilho",
      d: "Estresse, solidão, tédio, ansiedade. O desconforto começa."
    }, {
      e: "🌊",
      t: "2. Fissura",
      d: "O cérebro acessa o comportamento como promessa de alívio."
    }, {
      e: "🔑",
      t: "3. Ritual",
      d: "Comportamentos preparatórios: abrir o celular, fechar a porta."
    }, {
      e: "✓",
      t: "4. Ato",
      d: "O comportamento acontece. O alívio é real — mas temporário."
    }, {
      e: "💔",
      t: "5. Culpa",
      d: "O desconforto retorna, maior. O ciclo se fecha e se prepara para repetir."
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#ede9fe",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#c4b5fd",
        fontSize: 11,
        marginTop: 2,
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f9f5ff",
        padding: "16px 20px",
        borderBottom: "1px solid #e9d5ff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 8
      }
    }, "\uD83C\uDFAF Onde posso intervir?"), [{
      ponto: "No gatilho",
      acao: "Identificar e nomear a emoção antes que vire fissura",
      cor: "#059669",
      bg: "#d1fae5"
    }, {
      ponto: "Na fissura",
      acao: "Usar técnicas de regulação emocional",
      cor: "#0891b2",
      bg: "#e0f2fe"
    }, {
      ponto: "No ritual",
      acao: "Criar barreiras de estímulo — dificultar o acesso",
      cor: "#d97706",
      bg: "#fef3c7"
    }, {
      ponto: "Após o ato",
      acao: "Praticar autocompaixão em vez de vergonha",
      cor: "#7c3aed",
      bg: "#ede9fe"
    }].map(({
      ponto,
      acao,
      cor,
      bg
    }) => /*#__PURE__*/React.createElement("div", {
      key: ponto,
      style: {
        background: bg,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + cor,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: cor,
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 2
      }
    }, ponto), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#374151",
        lineHeight: 1.5
      }
    }, acao)))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#4c1d95",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflex\xF5es"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#4c1d95",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflex\xE3o...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflex\xF5es pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoDopaminaAlivio({
    cat
  }) {
    const COR = "#db2777";
    const BG = "#fce7f3";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Quando cede ao comportamento, é mais por prazer ou por alívio de algo difícil?", "Quais emoções você mais tenta aliviar com o comportamento?", "Que outras formas de alívio poderiam funcionar nesses momentos?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = `Reflexões — Reflexão:\n\n${PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "—"}`).join("\n\n")}`;
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\u26A1"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fce7f3",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "N\xE3o \xE9 sobre prazer \u2014 \xE9 sobre al\xEDvio"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "O c\xE9rebro busca o comportamento como anestesia emocional para t\xE9dio, solid\xE3o ou estresse.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff0f6",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 8
      }
    }, "\uD83E\uDDE0 O que a dopamina realmente faz"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        lineHeight: 1.7
      }
    }, "A dopamina n\xE3o \xE9 o neurotransmissor do prazer \u2014 \xE9 o da ", /*#__PURE__*/React.createElement("strong", null, "antecipa\xE7\xE3o e do al\xEDvio da tens\xE3o"), ". O maior pico acontece ", /*#__PURE__*/React.createElement("em", null, "antes"), " do comportamento, na fase de busca. Isso explica por que a experi\xEAncia real frequentemente decepciona \u2014 mas a busca continua."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: BG,
        borderRadius: 8,
        padding: "10px 14px",
        borderLeft: "3px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#831843",
        fontStyle: "italic",
        fontWeight: 500
      }
    }, "\xC9 como usar analg\xE9sico para uma infec\xE7\xE3o \u2014 alivia a dor, mas a infec\xE7\xE3o continua."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #be185d"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fce7f3",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 10
      }
    }, "\uD83D\uDC8A Estados que criam \"press\xE3o interna\""), [{
      e: "😰",
      t: "Estresse",
      d: "O cérebro busca o alívio mais rápido do seu arquivo de soluções."
    }, {
      e: "😔",
      t: "Solidão e vazio",
      d: "O comportamento preenche o vazio momentaneamente."
    }, {
      e: "😤",
      t: "Tédio",
      d: "Dopamina cria urgência e propósito momentâneos."
    }, {
      e: "😟",
      t: "Ansiedade",
      d: "Age como válvula de pressão — alívio rápido da tensão."
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fce7f3",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#fbcfe8",
        fontSize: 11,
        marginTop: 2,
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff0f6",
        padding: "16px 20px",
        borderBottom: "1px solid #fbcfe8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 8
      }
    }, "\uD83D\uDCA1 Analg\xE9sico vs. compuls\xE3o"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fee2e2",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#dc2626",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "\uD83D\uDC8A Analg\xE9sico"), ["Alivia rapidamente", "Não trata a causa", "Precisa de mais dose", "Dependência crescente"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#7f1d1d",
        marginBottom: 3
      }
    }, "\u2022 ", i))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "\uD83D\uDD12 Compuls\xE3o"), ["Alivia a emoção rapidamente", "Não resolve o estado", "Precisa de mais intensidade", "O ciclo se aprofunda"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#831843",
        marginBottom: 3
      }
    }, "\u2022 ", i))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#831843",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflex\xF5es"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#831843",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflex\xE3o...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflex\xF5es pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoSubstituicaoHabitos({
    cat
  }) {
    const COR = "#059669";
    const BG = "#d1fae5";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Quais são os horários e contextos de maior vulnerabilidade para você?", "Que barreira de estímulo seria mais viável implementar agora?", "Qual substituto comportamental tem mais chance de funcionar na sua fissura?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = `Reflexões — Reflexão:\n\n${PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "—"}`).join("\n\n")}`;
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDD27"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d1fae5",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "N\xE3o \xE9 poss\xEDvel simplesmente \"n\xE3o fazer\""), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "O c\xE9rebro precisa de algo no lugar. E o ambiente precisa ser modificado.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        padding: "16px 20px",
        borderBottom: "1px solid #bbf7d0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 8
      }
    }, "\uD83D\uDEE1\uFE0F Controle de est\xEDmulos na pr\xE1tica"), [{
      e: "📱",
      t: "Filtros de conteúdo",
      d: "Bloqueadores com senha gerenciada por pessoa de confiança."
    }, {
      e: "🚫",
      t: "Remover atalhos",
      d: "Apagar apps ou históricos que facilitam o acesso."
    }, {
      e: "🕐",
      t: "Mapear vulnerabilidade",
      d: "Identificar horários e locais de maior risco."
    }, {
      e: "🛏️",
      t: "Gestão do quarto",
      d: "Não usar dispositivos no quarto, especialmente antes de dormir."
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: BG,
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#14532d",
        fontSize: 11,
        marginTop: 2,
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #047857"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d1fae5",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 10
      }
    }, "\u26A1 Substitui\xE7\xF5es que funcionam"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#a7f3d0",
        marginBottom: 10
      }
    }, "A substitui\xE7\xE3o n\xE3o precisa ser prazerosa de imediato \u2014 precisa ser acess\xEDvel no momento da fissura."), [{
      e: "🏃",
      t: "Exercício físico intenso",
      d: "Libera dopamina e endorfina — especialmente eficaz no pico da fissura."
    }, {
      e: "👥",
      t: "Contato social real",
      d: "Ativa o sistema de recompensa de forma sustentável."
    }, {
      e: "🎵",
      t: "Música, arte, criação",
      d: "Fontes alternativas de estimulação que não alimentam o ciclo."
    }, {
      e: "🚿",
      t: "Banho frio breve",
      d: "Ativa o sistema nervoso parassimpático e quebra o estado de fissura."
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#d1fae5",
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#a7f3d0",
        fontSize: 11,
        marginTop: 2,
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#14532d",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflex\xF5es"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#14532d",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflex\xE3o...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflex\xF5es pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  function PsicoImpactoVinculos({
    cat
  }) {
    const COR = "#0891b2";
    const BG = "#e0f2fe";
    const [respostas, setRespostas] = React.useState(["", "", ""]);
    const PERGUNTAS = ["Em que relacionamento o segredo está criando mais distância?", "O que você deixou de compartilhar com pessoas próximas por causa da vergonha?", "O que significaria ter uma relação mais autêntica — mesmo sem revelar tudo agora?"];
    function enviarWhatsApp() {
      const tel = (cat && cat.telefone || "").replace(/\D/g, "");
      const texto = `Reflexões — Reflexão:\n\n${PERGUNTAS.map((p, i) => `${i + 1}. ${p}\nR: ${respostas[i] || "—"}`).join("\n\n")}`;
      window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`, "_blank");
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        maxWidth: 640,
        margin: "0 auto",
        paddingBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 8
      }
    }, "\uD83D\uDC94"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#e0f2fe",
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 6
      }
    }, "A compuls\xE3o sexual vive bem no segredo"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bae6fd",
        fontSize: 13,
        lineHeight: 1.5
      }
    }, "E o segredo cobra um pre\xE7o nas rela\xE7\xF5es \u2014 mesmo quando o comportamento n\xE3o \xE9 descoberto.")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0f9ff",
        padding: "16px 20px",
        borderBottom: "1px solid #bae6fd"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 8
      }
    }, "\uD83D\uDD12 Como o segredo afeta os v\xEDnculos"), [{
      e: "🌫️",
      t: "Distanciamento emocional",
      d: "Parte da energia está sempre 'em outro lugar', reduzindo a presença real."
    }, {
      e: "🚪",
      t: "Intimidade substituída",
      d: "O comportamento pode ocupar o espaço da intimidade genuína."
    }, {
      e: "😶",
      t: "Vergonha como barreira",
      d: "A culpa cria dificuldade de se deixar ver — mesmo em áreas não relacionadas."
    }, {
      e: "🏝️",
      t: "Isolamento progressivo",
      d: "Vergonha → afastamento → mais solidão → alimenta o ciclo."
    }].map(({
      e,
      t,
      d
    }) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: BG,
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, e), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: COR,
        fontSize: 12,
        fontWeight: 600
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#0c4a6e",
        fontSize: 11,
        marginTop: 2,
        lineHeight: 1.5
      }
    }, d))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: COR,
        padding: "16px 20px",
        borderBottom: "1px solid #0369a1"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#e0f2fe",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 10
      }
    }, "\uD83D\uDCA1 Uma distin\xE7\xE3o importante"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bae6fd",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "\u274C O que N\xC3O \xE9"), ["Falta de amor", "Falta de comprometimento", "Defeito de caráter", "Escolha consciente"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#e0f2fe",
        marginBottom: 3
      }
    }, "\u2022 ", i))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bae6fd",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6
      }
    }, "\u2713 O que realmente \xE9"), ["Padrão de regulação emocional", "Aprendizado neurológico", "Resposta a estados difíceis", "Algo tratável"].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: 11,
        color: "#e0f2fe",
        marginBottom: 3
      }
    }, "\u2022 ", i)))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        background: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "10px 14px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#e0f2fe",
        lineHeight: 1.6
      }
    }, "Compreender n\xE3o \xE9 justificar \u2014 \xE9 o que torna a mudan\xE7a poss\xEDvel. E \xE9 o que permite que a vergonha n\xE3o bloqueie o processo terap\xEAutico."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BG,
        padding: "16px 20px",
        borderTop: "2px solid " + COR
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#0c4a6e",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12
      }
    }, "\u270F\uFE0F Suas reflex\xF5es"), PERGUNTAS.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: COR,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "#0c4a6e",
        lineHeight: 1.5
      }
    }, p)), /*#__PURE__*/React.createElement("textarea", {
      value: respostas[i],
      onChange: e => {
        const r = [...respostas];
        r[i] = e.target.value;
        setRespostas(r);
      },
      placeholder: "Escreva sua reflex\xE3o...",
      style: {
        width: "100%",
        minHeight: 70,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid " + COR + "50",
        fontSize: 13,
        fontFamily: "inherit",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        outline: "none"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: enviarWhatsApp,
      style: {
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: COR,
        color: "white",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }
    }, "\uD83D\uDCF2 Enviar reflex\xF5es pelo WhatsApp")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11,
        color: "#888",
        marginTop: 8
      }
    }, "Dra. Lucia Kratz \xB7 Psic\xF3loga \xB7 CRP 09/20590"));
  }
  const PSICO_VISUAIS = {
    // macro_compulsao
    "O Ciclo do Gatilho e da Fissura": PsicoCicloGatilho,
    "Dopamina e a Busca pelo Alívio": PsicoDopaminaAlivio,
    "Substituição de Hábitos e Gestão de Estímulos": PsicoSubstituicaoHabitos,
    "O Impacto nos Vínculos e na Intimidade": PsicoImpactoVinculos,
    // macro_ansiedade — originais (página única, sem navegação)
    "Preocupação produtiva vs. improdutiva": PsicoPreocupacao,
    "A armadilha do pior cenário": PsicoPiorCenario,
    "Eustresse vs. distresse": PsicoEustresse,
    "O ciclo da ansiedade": PsicoCicloAnsiedade,
    "Desmontar o Circuito Cerebral da Ansiedade": PsicoDesmontarAnsiedade,
    "O modelo ABC na prática": PsicoModeloABC,
    "O poder dos pensamentos": PsicoPensamentos,
    "A pizza da responsabilidade": PsicoPizzaResponsabilidade,
    "Fatos vs. interpretações": PsicoFatosInterpretacoes,
    "O perigo do sempre e nunca": PsicoSempreNunca,
    "7 Distorções de Pensamento": Psico7Distorcoes,
    "O Alarme Falso do Cérebro": PsicoAlarme,
    "Pensamentos São Eventos, Não Factos": PsicoPensamentosSaoEventos,
    "A Curva do Pânico": PsicoCurvaPanico,
    // macro_casais — página única com perguntas + WhatsApp
    "Por Que Discutimos Sobre Dinheiro — Quando Não é Realmente Sobre Dinheiro": PsicoDiscutirDinheiro,
    "Por Que Perder-se no Outro Não É Amor — É Fusão": PsicoFusaoCasal,
    "A Triangulação — Quando Usamos Terceiros para Evitar Conversas Difíceis": PsicoTriangulacao,
    "O Mito do Pai/Mãe Perfeito — E o Custo Real do Perfeccionismo Parental": PsicoPaisPerfeitos,
    "O Desejo Não Desaparece — Adormece": PsicoDesejoAdormece,
    // macro_relacionamentos
    "Ouvir É Uma Competência — E a Maioria de Nós Não Aprendeu": PsicoOuvirCompetencia,
    "Por Que as Nossas Palavras Ferem Mais do que Queremos?": PsicoPalavrasFerem,
    "O Tango do Conflito — Por Que Discutimos Sempre Pela Mesma Razão": PsicoTangoConflito,
    "Limites Não São Muros — São Portas com Chave": PsicoLimitesPortas,
    "A Carga que Não Se Vê — O que É a Carga Mental": PsicoCargaMental,
    // macro_corpo
    "Por Que Não Basta Tratar Um Sintoma — A Visão Integral da Saúde": PsicoVisaoIntegral,
    "A Escada de Segurança — Como o Seu Sistema Nervoso Decide se Está em Perigo": PsicoEscadaSeguranca,
    "O Corpo Não Mente — A Linguagem Física das Emoções Não Expressas": PsicoCorpoNaoMente,
    "Onde Está a Sua Mente Quando o Seu Corpo Está Aqui — A Ciência da Presença": PsicoCienciaPresenca,
    // macro_habitos
    "O Ciclo do Alívio Falso": PsicoCicloAlivioFalso,
    "A \"Limpeza Noturna\" do Cérebro": PsicoLimpezaNoturna,
    "A regra dos 5 minutos": PsicoRegra5Minutos,
    "Sinais de desgaste emocional": PsicoSinaisDesgaste,
    "Agir antes de ter vontade": PsicoAgirantesVontade,
    "O Mito da Bateria Infinita": PsicoMitoBateriaInfinita,
    "O Poder do 1% Diário": PsicoPoder1Porcento,
    "O diário de pequenas vitórias": PsicoDiarioPequenasVitorias,
    // macro_humor
    "Para que Servem as Emoções?": PsicoParaQueServemEmocoes,
    "Autocompaixão": PsicoAutocompaixao,
    "Ação Gera Motivação": PsicoAcaoGeraMotivacao,
    "O Cérebro Sequestrado": PsicoCerebroSequestrado,
    "O filtro negativo da mente": PsicoFiltroNegativo,
    "O Juiz Interno vs. O Treinador": PsicoJuizInternoTreinador,
    "A roda das emoções": PsicoRodaEmocoes,
    "Surfar a Onda da Emoção": PsicoSurfarOndaEmocao,
    "Surfando a onda da emoção": PsicoSurfandoOndaEmocao
  };
  const CATS_PSICOEDUCACAO = {
    tcc: {
      label: "TCC",
      cor: "#7B00C4",
      bg: "#f3e6ff",
      accent: "#0EA5E9"
    },
    ansiedade: {
      label: "Ansiedade",
      cor: "#7B00C4",
      bg: "#f3e6ff",
      accent: "#F97316"
    },
    emocoes: {
      label: "Emoções",
      cor: "#7B00C4",
      bg: "#f3e6ff",
      accent: "#F43F5E"
    },
    autocuidado: {
      label: "Autocuidado",
      cor: "#7B00C4",
      bg: "#f3e6ff",
      accent: "#22C55E"
    },
    relacionamentos: {
      label: "Relacionamentos",
      cor: "#7B00C4",
      bg: "#f3e6ff",
      accent: "#EF4444"
    },
    casais: {
      label: "Casais",
      cor: "#7B00C4",
      bg: "#f3e6ff",
      accent: "#EC4899"
    },
    corpo: {
      label: "Corpo & Alimentação",
      cor: "#7B00C4",
      bg: "#f3e6ff",
      accent: "#EAB308"
    },
    esquema: {
      label: "Terapia do Esquema",
      cor: "#7B00C4",
      bg: "#f3e6ff",
      accent: "#8B5CF6"
    },
    outros: {
      label: "Outros",
      cor: "#7B00C4",
      bg: "#f3e6ff",
      accent: "#64748B"
    }
  };

  // Mapa legado → macro para psicoeducação (fora do componente para evitar hoisting)
  const PSICO_LEGADO_MACRO = {
    tcc: "macro_ansiedade",
    ansiedade: "macro_ansiedade",
    esquema: "macro_ansiedade",
    emocoes: "macro_humor",
    autocuidado: "macro_habitos",
    relacionamentos: "macro_relacionamentos",
    casais: "macro_casais",
    corpo: "macro_corpo",
    outros: "macro_ansiedade",
    autoestima: "macro_humor",
    mindfulness: "macro_habitos",
    trauma: "macro_ansiedade",
    depressao: "macro_humor",
    habitos: "macro_habitos",
    // novas macrocategorias já passam direto
    macro_ansiedade: "macro_ansiedade",
    macro_humor: "macro_humor",
    macro_habitos: "macro_habitos",
    macro_relacionamentos: "macro_relacionamentos",
    macro_casais: "macro_casais",
    macro_corpo: "macro_corpo",
    macro_compulsao: "macro_compulsao",
    compulsao_sexual: "macro_compulsao",
    compulsao: "macro_compulsao"
  };
  window.PSICO_VISUAIS = PSICO_VISUAIS;
})();