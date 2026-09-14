// ═══════════════════════════════════════════════════════════════
//  app_financeiro.js — Financeiro da Clínica
//
//  Portado do sistema real da Dra. Lucia (mesmos campos, categorias
//  e formas de pagamento). O módulo completo tem 5 abas (Lançamentos,
//  Pacotes & Sessões, Acompanhamento Geral, Comissões, Orçamento) —
//  construindo uma de cada vez (CLAUDE.md REGRA 5). Por enquanto só
//  "Lançamentos" está funcional; as outras aparecem como "em breve".
// ═══════════════════════════════════════════════════════════════

const CATS_DESPESA_CLINICA = [
  "Aluguel", "Condomínio", "Energia / Água", "Telefone / Internet",
  "Salário Secretária", "Contador / Impostos", "Marketing", "Equipamentos",
  "Materiais", "Ferramentas de IA", "Cursos e Capacitação", "Musicoterapia",
  "Manutenção", "Outros",
];
const FORMAS_PAG_CLINICA = ["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Depósito", "Transferência", "Outro"];
const TIPOS_RECEITA = ["Consulta", "Avaliação", "Sessão Avulsa", "Outro"];
const RECORRENCIAS = ["Semanal (1x/semana)", "2x por semana", "3x por semana", "Quinzenal", "Mensal", "Sessão única"];
const DIAS_SEMANA_LABEL = { 0: "Dom", 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb" };
const TIPOS_ATENDIMENTO = [
  { valor: "particular", rotulo: "Particular", icone: "banknote" },
  { valor: "social", rotulo: "Social", icone: "leaf" },
  { valor: "parceria", rotulo: "Parceria", icone: "handshake" },
];

// Gera as datas das sessões de um pacote a partir da recorrência —
// mesma lógica do sistema original.
function gerarDatasPacote(dataInicio, recorrencia, total, diasSemana) {
  if (recorrencia === "Sessão única") return [dataInicio];
  const datas = [];
  if (["Semanal (1x/semana)", "Quinzenal", "Mensal"].includes(recorrencia)) {
    let atual = new Date(dataInicio + "T00:00:00");
    while (datas.length < total) {
      datas.push(atual.toISOString().split("T")[0]);
      if (recorrencia === "Semanal (1x/semana)") atual.setDate(atual.getDate() + 7);
      else if (recorrencia === "Quinzenal") atual.setDate(atual.getDate() + 14);
      else atual.setMonth(atual.getMonth() + 1);
    }
    return datas.slice(0, total);
  }
  // 2x ou 3x por semana — sempre inclui a data de início como 1ª sessão
  const dias = (diasSemana || []).map(Number).sort();
  if (!dias.length) return [];
  datas.push(dataInicio);
  let atual = new Date(dataInicio + "T00:00:00");
  atual.setDate(atual.getDate() + 1);
  const fim = new Date(atual);
  fim.setFullYear(fim.getFullYear() + 2);
  while (datas.length < total && atual < fim) {
    if (dias.includes(atual.getDay())) datas.push(atual.toISOString().split("T")[0]);
    atual.setDate(atual.getDate() + 1);
  }
  return datas.slice(0, total);
}
const ABAS_FINANCEIRO = [
  { id: "lancamentos", rotulo: "Lançamentos", icone: "circle-dollar-sign" },
  { id: "pacotes", rotulo: "Pacotes & Sessões", icone: "package" },
  { id: "acompanhamento", rotulo: "Acompanhamento Geral", icone: "users" },
  { id: "comissoes", rotulo: "Comissões", icone: "percent" },
  { id: "orcamento", rotulo: "Orçamento", icone: "file-text" },
];

function fmtMoeda(v) {
  return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function TelaFinanceiro({ usuario }) {
  const [aba, setAba] = useState("lancamentos");
  const [pacientes, setPacientes] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [anoFiltro, setAnoFiltro] = useState(String(new Date().getFullYear()));
  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().slice(0, 7));
  const [filtroTipo, setFiltroTipo] = useState("tudo");
  const [mostrarNovo, setMostrarNovo] = useState(false);
  const [mostrarDespesa, setMostrarDespesa] = useState(false);
  const [lancEditando, setLancEditando] = useState(null);
  const [pacotes, setPacotes] = useState([]);
  const [sessoesPacotes, setSessoesPacotes] = useState([]);
  const [mostrarPacote, setMostrarPacote] = useState(false);
  const [pacoteEditando, setPacoteEditando] = useState(null);

  useEffect(() => {
    const cancelar = db
      .collection("clinica_pacientes")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot((snap) => setPacientes(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return cancelar;
  }, [usuario.psiId]);

  useEffect(() => {
    const cancelar = db
      .collection("clinica_lancamentos")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot(
        (snap) => {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          docs.sort((a, b) => (b.data || "").localeCompare(a.data || ""));
          setLancamentos(docs);
          setCarregando(false);
        },
        () => setCarregando(false)
      );
    return cancelar;
  }, [usuario.psiId]);

  useEffect(() => {
    const cancelar = db
      .collection("clinica_pacotes")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.criadoEm?.toMillis?.() || 0) - (a.criadoEm?.toMillis?.() || 0));
        setPacotes(docs);
      });
    return cancelar;
  }, [usuario.psiId]);

  useEffect(() => {
    const cancelar = db
      .collection("clinica_sessoes")
      .where("psi_id", "==", usuario.psiId)
      .onSnapshot((snap) => setSessoesPacotes(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return cancelar;
  }, [usuario.psiId]);

  function nomePaciente(id) {
    return pacientes.find((p) => p.id === id)?.nome || "—";
  }

  // Anos disponíveis (a partir dos lançamentos existentes + o atual)
  const anosDisp = [...new Set(lancamentos.map((l) => l.data?.slice(0, 4)).filter(Boolean))];
  if (!anosDisp.includes(anoFiltro)) anosDisp.push(anoFiltro);
  anosDisp.sort();

  const mesesDoAno = Array.from({ length: 12 }, (_, i) => `${anoFiltro}-${String(i + 1).padStart(2, "0")}`);
  const mesFiltroEfetivo = mesFiltro.startsWith(anoFiltro) ? mesFiltro : anoFiltro + "-01";

  const mesAtualStr = new Date().toISOString().slice(0, 7);
  const lancMesAtual = lancamentos.filter((l) => l.data?.startsWith(mesAtualStr));
  const lancDoAno = lancamentos.filter((l) => l.data?.startsWith(anoFiltro));
  const lancDoMesFiltrado = lancamentos.filter((l) => l.data?.startsWith(mesFiltroEfetivo));

  function calcReceitas(lista) { return lista.filter((l) => l.tipo_lancamento !== "despesa").reduce((a, l) => a + (parseFloat(l.valor) || 0), 0); }
  function calcDespesas(lista) { return lista.filter((l) => l.tipo_lancamento === "despesa").reduce((a, l) => a + (parseFloat(l.valor) || 0), 0); }

  const saldoMesAtual = calcReceitas(lancMesAtual) - calcDespesas(lancMesAtual);
  const pendenteDoAno = calcReceitas(lancDoAno.filter((l) => l.status === "pendente"));
  const receitasMesFiltro = calcReceitas(lancDoMesFiltrado);
  const despesasMesFiltro = calcDespesas(lancDoMesFiltrado);
  const saldoMesFiltro = receitasMesFiltro - despesasMesFiltro;

  const mesLabel = (m) => {
    try { return new Date(m + "-15").toLocaleDateString("pt-BR", { month: "long" }); }
    catch (e) { return m; }
  };

  const listaFiltrada = lancDoMesFiltrado.filter((l) => {
    if (filtroTipo === "receitas") return l.tipo_lancamento !== "despesa";
    if (filtroTipo === "despesas") return l.tipo_lancamento === "despesa";
    return true;
  });
  const receitasLista = listaFiltrada.filter((l) => l.tipo_lancamento !== "despesa");
  const despesasLista = listaFiltrada.filter((l) => l.tipo_lancamento === "despesa");

  function abrirEditar(l) {
    setLancEditando(l);
    if (l.tipo_lancamento === "despesa") setMostrarDespesa(true);
    else setMostrarNovo(true);
  }

  async function excluirLancamento(id) {
    if (!confirm("Excluir este lançamento?")) return;
    await db.collection("clinica_lancamentos").doc(id).delete();
  }

  return (
    <div className="conteudo conteudo-larga">
      <div className="cabecalho-secao">
        <div>
          <h2>Financeiro da Clínica</h2>
          <p className="subtitulo-pagina">Lançamentos, pacotes e controle de sessões</p>
        </div>
        <div className="acoes-cabecalho">
          {aba === "pacotes" ? (
            <button className="botao-primario" onClick={() => { setPacoteEditando(null); setMostrarPacote(true); }}>
              <Icone nome="plus" tamanho={16} /> Novo Pacote
            </button>
          ) : (
            <>
              <button className="botao-perigo" onClick={() => { setLancEditando(null); setMostrarDespesa(true); }}>
                <Icone nome="minus-circle" tamanho={16} /> Nova Despesa
              </button>
              <button className="botao-primario" onClick={() => { setLancEditando(null); setMostrarNovo(true); }}>
                <Icone nome="plus" tamanho={16} /> Novo Lançamento
              </button>
            </>
          )}
        </div>
      </div>

      <div className="seletor-ano">
        {anosDisp.map((a) => (
          <button key={a} className={"botao-ano" + (a === anoFiltro ? " botao-ano-ativo" : "")} onClick={() => setAnoFiltro(a)}>
            {a}
          </button>
        ))}
      </div>

      <div className="grade-cartoes-stat">
        <CartaoStat titulo={`Saldo (${mesLabel(mesAtualStr)})`} valor={fmtMoeda(saldoMesAtual)} legenda="mês atual" icone="wallet" />
        <CartaoStat titulo={`Pendente (${anoFiltro})`} valor={fmtMoeda(pendenteDoAno)} legenda="a receber" icone="clock" />
        <CartaoStat titulo="Pacotes ativos" valor={pacotes.filter((p) => p.status === "ativo").length} legenda="em andamento" icone="package" />
        <CartaoStat titulo={`Lançamentos (${mesLabel(mesFiltroEfetivo)})`} valor={lancDoMesFiltrado.length} legenda="neste mês" icone="list" />
      </div>

      <div className="abas-financeiro">
        {ABAS_FINANCEIRO.map((a) => (
          <button
            key={a.id}
            className={"aba-financeiro" + (aba === a.id ? " aba-financeiro-ativa" : "")}
            onClick={() => setAba(a.id)}
          >
            <Icone nome={a.icone} tamanho={15} /> {a.rotulo}
          </button>
        ))}
      </div>

      {aba !== "lancamentos" && aba !== "pacotes" && (
        <div className="cartao-secao">
          <p className="texto-vazio">
            Essa aba ({ABAS_FINANCEIRO.find((a) => a.id === aba)?.rotulo}) ainda não foi construída — é a próxima etapa combinada.
          </p>
        </div>
      )}

      {aba === "pacotes" && (
        <ListaPacotes
          pacotes={pacotes}
          sessoes={sessoesPacotes}
          pacientes={pacientes}
          aoEditar={(p) => { setPacoteEditando(p); setMostrarPacote(true); }}
        />
      )}

      {aba === "lancamentos" && (
        <>
          <div className="faixa-meses">
            {mesesDoAno.map((m) => (
              <button
                key={m}
                className={"botao-mes" + (m === mesFiltroEfetivo ? " botao-mes-ativo" : "")}
                onClick={() => setMesFiltro(m)}
              >
                {mesLabel(m)}
              </button>
            ))}
          </div>

          <div className="filtro-tipo-lanc">
            {[["tudo", "Tudo"], ["receitas", "Receitas"], ["despesas", "Despesas"]].map(([v, l]) => (
              <button key={v} className={"botao-filtro" + (filtroTipo === v ? " botao-filtro-ativo" : "")} onClick={() => setFiltroTipo(v)}>
                {l}
              </button>
            ))}
          </div>

          <div className="grade-resumo-mes">
            <div className="cartao-resumo receita">
              <span className="rotulo-resumo">Total Receitas</span>
              <span className="valor-resumo">{fmtMoeda(receitasMesFiltro)}</span>
            </div>
            <div className="cartao-resumo despesa">
              <span className="rotulo-resumo">Total Despesas</span>
              <span className="valor-resumo">{fmtMoeda(despesasMesFiltro)}</span>
            </div>
            <div className="cartao-resumo saldo">
              <span className="rotulo-resumo">Saldo Líquido</span>
              <span className="valor-resumo">{fmtMoeda(saldoMesFiltro)}</span>
            </div>
          </div>

          {carregando && <p>Carregando...</p>}

          {!carregando && receitasLista.length > 0 && (
            <SecaoLancamentos titulo="Receitas" cor="receita" itens={receitasLista} nomePaciente={nomePaciente} aoEditar={abrirEditar} aoExcluir={excluirLancamento} />
          )}
          {!carregando && despesasLista.length > 0 && (
            <SecaoLancamentos titulo="Despesas" cor="despesa" itens={despesasLista} nomePaciente={nomePaciente} aoEditar={abrirEditar} aoExcluir={excluirLancamento} />
          )}
          {!carregando && listaFiltrada.length === 0 && (
            <p className="texto-vazio">Nenhum lançamento em {mesLabel(mesFiltroEfetivo)}.</p>
          )}
        </>
      )}

      {mostrarNovo && (
        <FormLancamento
          usuario={usuario}
          pacientes={pacientes}
          lancamento={lancEditando}
          aoFechar={() => { setMostrarNovo(false); setLancEditando(null); }}
        />
      )}
      {mostrarDespesa && (
        <FormDespesa
          usuario={usuario}
          lancamento={lancEditando}
          aoFechar={() => { setMostrarDespesa(false); setLancEditando(null); }}
        />
      )}
      {mostrarPacote && (
        <PacoteForm
          usuario={usuario}
          pacientes={pacientes}
          pacote={pacoteEditando}
          aoFechar={() => { setMostrarPacote(false); setPacoteEditando(null); }}
        />
      )}
    </div>
  );
}

function SecaoLancamentos({ titulo, cor, itens, nomePaciente, aoEditar, aoExcluir }) {
  const total = itens.reduce((a, l) => a + (parseFloat(l.valor) || 0), 0);
  return (
    <div className="grupo-status">
      <div className="cabecalho-secao-lanc">
        <span className={"titulo-secao-lanc titulo-secao-" + cor}>{titulo}</span>
        <span className={"total-secao-lanc total-secao-" + cor}>{fmtMoeda(total)}</span>
      </div>
      <div className="cartao-lista-pacientes">
        {itens.map((l) => (
          <div key={l.id} className="linha-lancamento">
            <div className="info-lancamento">
              <div className="descricao-lancamento">
                {l.pacienteId ? nomePaciente(l.pacienteId) + " — " : ""}{l.descricao || l.tipo || l.categoria || "Lançamento"}
              </div>
              <div className="detalhe-lancamento">
                {l.data?.split("-").reverse().join("/")} · {l.formaPag || "—"}
              </div>
            </div>
            <span className={"etiqueta-status-lanc etiqueta-" + (l.status || "pendente")}>
              {l.status === "recebido" || l.status === "pago" ? "✓ " + (cor === "despesa" ? "Pago" : "Recebido") : "Pendente"}
            </span>
            <span className={"valor-lancamento valor-" + cor}>{fmtMoeda(l.valor)}</span>
            <button className="botao-icone" onClick={() => aoEditar(l)} title="Editar"><Icone nome="pencil" tamanho={15} /></button>
            <button className="botao-icone botao-icone-perigo" onClick={() => aoExcluir(l.id)} title="Excluir"><Icone nome="trash-2" tamanho={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormLancamento({ usuario, pacientes, lancamento, aoFechar }) {
  const [form, setForm] = useState(
    lancamento
      ? { ...lancamento, valor: String(lancamento.valor || "") }
      : { pacienteId: "", tipo: "Consulta", valor: "", data: new Date().toISOString().slice(0, 10), formaPag: "PIX", status: "pendente", obs: "" }
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(evento) {
    evento.preventDefault();
    if (!form.valor || !form.data) { setErro("Valor e data são obrigatórios."); return; }
    setErro("");
    setSalvando(true);
    try {
      const pac = pacientes.find((p) => p.id === form.pacienteId);
      const dados = { ...form, valor: parseFloat(form.valor), pacienteNome: pac?.nome || "" };
      if (lancamento) {
        await db.collection("clinica_lancamentos").doc(lancamento.id).update(dados);
      } else {
        await db.collection("clinica_lancamentos").add({
          ...dados,
          psi_id: usuario.psiId,
          tipo_lancamento: "avulso",
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
      aoFechar();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{lancamento ? "Editar Lançamento" : "Novo Lançamento"}</h3>
        <form onSubmit={salvar}>
          <label>Paciente <span className="opcional">(opcional)</span></label>
          <select value={form.pacienteId || ""} onChange={(e) => setForm({ ...form, pacienteId: e.target.value })}>
            <option value="">— Nenhum —</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>

          <label>Tipo</label>
          <select value={form.tipo || "Consulta"} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            {TIPOS_RECEITA.map((t) => <option key={t}>{t}</option>)}
          </select>

          <label>Valor (R$)</label>
          <input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />

          <label>Data</label>
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />

          <label>Forma de Pagamento</label>
          <select value={form.formaPag || "PIX"} onChange={(e) => setForm({ ...form, formaPag: e.target.value })}>
            {FORMAS_PAG_CLINICA.map((f) => <option key={f}>{f}</option>)}
          </select>

          <label>Status</label>
          <div className="pills-status">
            {[["pendente", "Pendente", "#F59E0B"], ["recebido", "Recebido", "var(--sucesso)"]].map(([v, l, c]) => (
              <button key={v} type="button" className={"pill-status" + (form.status === v ? " pill-status-ativa" : "")} style={{ "--cor-pill": c }} onClick={() => setForm({ ...form, status: v })}>
                {l}
              </button>
            ))}
          </div>

          <label>Observação <span className="opcional">(opcional)</span></label>
          <textarea className="campo-descricao" rows={2} value={form.obs || ""} onChange={(e) => setForm({ ...form, obs: e.target.value })} />

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="acoes-modal">
            <button type="button" className="botao-secundario" onClick={aoFechar}>Cancelar</button>
            <button type="submit" className="botao-primario" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormDespesa({ usuario, lancamento, aoFechar }) {
  const [form, setForm] = useState(
    lancamento
      ? { ...lancamento, valor: String(lancamento.valor || ""), parcelas: "1" }
      : { descricao: "", categoria: "", valor: "", data: new Date().toISOString().slice(0, 10), formaPag: "PIX", status: "pago", obs: "", parcelas: "1" }
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(evento) {
    evento.preventDefault();
    if (!form.valor || !form.data) { setErro("Valor e data são obrigatórios."); return; }
    setErro("");
    setSalvando(true);
    try {
      const valor = parseFloat(form.valor);
      const nParcelas = parseInt(form.parcelas) || 1;
      const base = {
        psi_id: usuario.psiId,
        tipo_lancamento: "despesa",
        categoria: form.categoria || "Outros",
        descricao: form.descricao || form.categoria || "Despesa",
        formaPag: form.formaPag,
        status: form.status,
        obs: form.obs || "",
      };

      if (lancamento) {
        await db.collection("clinica_lancamentos").doc(lancamento.id).update({ ...base, valor, data: form.data });
      } else if (nParcelas > 1) {
        const batch = db.batch();
        const [ano, mes, dia] = form.data.split("-").map(Number);
        for (let i = 0; i < nParcelas; i++) {
          let m = mes + i, a = ano;
          while (m > 12) { m -= 12; a++; }
          const dataParcela = `${a}-${String(m).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          batch.set(db.collection("clinica_lancamentos").doc(), {
            ...base,
            valor,
            data: dataParcela,
            parcela: `${i + 1}/${nParcelas}`,
            descricao: `${base.descricao} (${i + 1}/${nParcelas})`,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
        await batch.commit();
      } else {
        await db.collection("clinica_lancamentos").add({
          ...base,
          valor,
          data: form.data,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
      aoFechar();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{lancamento ? "Editar Despesa" : "Nova Despesa"}</h3>
        <form onSubmit={salvar}>
          <label>Descrição <span className="opcional">(opcional)</span></label>
          <input value={form.descricao || ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex.: Aluguel de setembro" />

          <label>Categoria</label>
          <select value={form.categoria || ""} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
            <option value="">Selecione</option>
            {CATS_DESPESA_CLINICA.map((c) => <option key={c}>{c}</option>)}
          </select>

          <label>Valor (R$)</label>
          <input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />

          <label>Data</label>
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />

          <label>Forma de Pagamento</label>
          <select value={form.formaPag || "PIX"} onChange={(e) => setForm({ ...form, formaPag: e.target.value })}>
            {FORMAS_PAG_CLINICA.map((f) => <option key={f}>{f}</option>)}
          </select>

          {!lancamento && (
            <>
              <label>Parcelas</label>
              <input type="number" min="1" value={form.parcelas} onChange={(e) => setForm({ ...form, parcelas: e.target.value })} />
            </>
          )}

          <label>Status</label>
          <div className="pills-status">
            {[["pendente", "Pendente", "#F59E0B"], ["pago", "Pago", "var(--sucesso)"]].map(([v, l, c]) => (
              <button key={v} type="button" className={"pill-status" + (form.status === v ? " pill-status-ativa" : "")} style={{ "--cor-pill": c }} onClick={() => setForm({ ...form, status: v })}>
                {l}
              </button>
            ))}
          </div>

          <label>Observação <span className="opcional">(opcional)</span></label>
          <textarea className="campo-descricao" rows={2} value={form.obs || ""} onChange={(e) => setForm({ ...form, obs: e.target.value })} />

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="acoes-modal">
            <button type="button" className="botao-secundario" onClick={aoFechar}>Cancelar</button>
            <button type="submit" className="botao-primario" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Pacotes & Sessões ──────────────────────────────────────────
// Portado do salvarPacote() do sistema real — sem comissão, repasse
// de parceria ou e-mail automático (fora do escopo por enquanto).

const MODALIDADES_PACOTE = ["Online", "Presencial"];

function ListaPacotes({ pacotes, sessoes, pacientes, aoEditar }) {
  async function excluirPacote(pacote) {
    if (!confirm("Excluir este pacote e todas as sessões vinculadas a ele?")) return;
    const batch = db.batch();
    batch.delete(db.collection("clinica_pacotes").doc(pacote.id));
    sessoes.filter((s) => s.pacoteId === pacote.id).forEach((s) => batch.delete(db.collection("clinica_sessoes").doc(s.id)));
    const lancSnap = await db.collection("clinica_lancamentos").where("pacoteId", "==", pacote.id).get();
    lancSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  if (pacotes.length === 0) {
    return <p className="texto-vazio">Nenhum pacote cadastrado ainda.</p>;
  }

  const porPaciente = {};
  pacotes.forEach((p) => {
    const chave = p.pacienteId || "sem-paciente";
    if (!porPaciente[chave]) porPaciente[chave] = [];
    porPaciente[chave].push(p);
  });

  return (
    <div>
      {Object.entries(porPaciente).map(([pacienteId, lista]) => {
        const nome = pacientes.find((p) => p.id === pacienteId)?.nome || lista[0].pacienteNome || "Paciente";
        return (
          <div key={pacienteId} className="grupo-status">
            <div className="cabecalho-secao-lanc">
              <span className="titulo-secao-lanc">{nome}</span>
            </div>
            <div className="cartao-lista-pacientes">
              {lista.map((pac) => {
                const sessoesPac = sessoes.filter((s) => s.pacoteId === pac.id);
                const realizadas = sessoesPac.filter((s) => s.status === "realizada" || s.pagamento === "pago").length;
                const total = pac.totalSessoes || sessoesPac.length || 1;
                const pct = Math.min(100, Math.round((realizadas / total) * 100));
                return (
                  <div key={pac.id} className="cartao-pacote">
                    <div className="info-pacote">
                      <div className="descricao-lancamento">
                        Pacote de {pac.totalSessoes} sessões — {pac.recorrencia}
                      </div>
                      <div className="detalhe-lancamento">
                        Início {pac.dataInicio?.split("-").reverse().join("/")}
                        {" · "}{TIPOS_ATENDIMENTO.find((t) => t.valor === pac.tipoAtendimento)?.rotulo || "Particular"}
                        {pac.horario ? " · " + pac.horario : ""}
                      </div>
                      <div className="barra-progresso">
                        <div className="barra-progresso-preenchimento" style={{ width: pct + "%" }} />
                      </div>
                      <div className="detalhe-lancamento">{realizadas} de {total} sessões realizadas</div>
                    </div>
                    <span className={"etiqueta-status-lanc etiqueta-" + (pac.statusPag || "pendente")}>
                      {pac.statusPag === "recebido" ? "✓ Recebido" : "Pendente"}
                    </span>
                    <span className="valor-lancamento valor-receita">{fmtMoeda(pac.valorTotal)}</span>
                    <button className="botao-icone" onClick={() => aoEditar(pac)} title="Editar"><Icone nome="pencil" tamanho={15} /></button>
                    <button className="botao-icone botao-icone-perigo" onClick={() => excluirPacote(pac)} title="Excluir"><Icone nome="trash-2" tamanho={15} /></button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PacoteForm({ usuario, pacientes, pacote, aoFechar }) {
  const [form, setForm] = useState(
    pacote
      ? { ...pacote, totalSessoes: String(pacote.totalSessoes || ""), valorSessao: String(pacote.valorSessao || "") }
      : {
          pacienteId: "", totalSessoes: "", valorSessao: "", recorrencia: RECORRENCIAS[0],
          dataInicio: new Date().toISOString().slice(0, 10), horario: "", diasSemana: [],
          modalidade: "Online", tipoAtendimento: "particular",
          statusPag: "pendente", formaPag: "PIX", dataPagamento: "", obs: "",
        }
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const precisaDias = ["2x por semana", "3x por semana"].includes(form.recorrencia);
  const total = parseInt(form.totalSessoes) || 0;
  const valorSessao = parseFloat(form.valorSessao) || 0;
  const valorTotal = total * valorSessao;

  function alternarDia(dia) {
    const atual = form.diasSemana || [];
    setForm({ ...form, diasSemana: atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia] });
  }

  async function salvar(evento) {
    evento.preventDefault();
    if (!form.pacienteId || !form.totalSessoes || !form.dataInicio) {
      setErro("Paciente, nº de sessões e data de início são obrigatórios.");
      return;
    }
    if (precisaDias && (!form.diasSemana || form.diasSemana.length === 0)) {
      setErro("Selecione os dias da semana.");
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      const pac = pacientes.find((p) => p.id === form.pacienteId);

      if (pacote) {
        // Edição: atualiza os dados do pacote (não regera as sessões já criadas)
        await db.collection("clinica_pacotes").doc(pacote.id).update({
          pacienteId: form.pacienteId, pacienteNome: pac?.nome || "",
          totalSessoes: total, valorSessao, valorTotal,
          recorrencia: form.recorrencia, dataInicio: form.dataInicio, horario: form.horario,
          modalidade: form.modalidade, tipoAtendimento: form.tipoAtendimento,
          statusPag: form.statusPag, formaPag: form.formaPag, dataPagamento: form.dataPagamento,
          obs: form.obs,
        });
        aoFechar();
        return;
      }

      const datas = gerarDatasPacote(form.dataInicio, form.recorrencia, total, form.diasSemana);

      const pacRef = await db.collection("clinica_pacotes").add({
        psi_id: usuario.psiId,
        pacienteId: form.pacienteId, pacienteNome: pac?.nome || "",
        totalSessoes: total, valorSessao, valorTotal,
        recorrencia: form.recorrencia, dataInicio: form.dataInicio, horario: form.horario,
        diasSemana: form.diasSemana || [], modalidade: form.modalidade,
        tipoAtendimento: form.tipoAtendimento,
        statusPag: form.statusPag, formaPag: form.formaPag, dataPagamento: form.dataPagamento,
        obs: form.obs,
        status: "ativo",
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });

      const mesInicio = new Date(form.dataInicio + "T00:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      const descricaoLanc = `${pac?.nome || "Paciente"} — Pacote ${total} Sessões — ${mesInicio.charAt(0).toUpperCase() + mesInicio.slice(1)}`;
      await db.collection("clinica_lancamentos").add({
        psi_id: usuario.psiId,
        tipo_lancamento: "pacote", pacoteId: pacRef.id,
        pacienteId: form.pacienteId, pacienteNome: pac?.nome || "",
        tipo: descricaoLanc, descricao: descricaoLanc,
        valor: valorTotal, data: form.dataInicio,
        formaPag: form.formaPag, status: form.statusPag, dataPagamento: form.dataPagamento,
        obs: form.obs, totalSessoes: total, valorSessao,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });

      const jaPago = form.statusPag === "recebido";
      const batch = db.batch();
      datas.forEach((data, i) => {
        const ref = db.collection("clinica_sessoes").doc();
        batch.set(ref, {
          psi_id: usuario.psiId,
          pacienteId: form.pacienteId, pacienteNome: pac?.nome || "",
          data, hora: form.horario, duracao: "50", tipo: "Psicoterapia",
          status: "agendado", numSessao: i + 1, pacoteId: pacRef.id,
          valorSessao, pagamento: jaPago ? "pago" : "pendente",
          valorPago: jaPago ? valorSessao : 0,
          formaPagamento: form.formaPag,
          dataPagamento: jaPago ? (form.dataPagamento || new Date().toISOString().slice(0, 10)) : "",
          obs: "",
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();

      aoFechar();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar o pacote.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="sobreposicao" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{pacote ? "Editar Pacote" : "Novo Pacote de Sessões"}</h3>
        <form onSubmit={salvar}>
          <label>Paciente *</label>
          <select value={form.pacienteId} onChange={(e) => setForm({ ...form, pacienteId: e.target.value })} required>
            <option value="">Selecione</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>

          <label>Tipo de Atendimento</label>
          <div className="pills-status">
            {TIPOS_ATENDIMENTO.map((t) => (
              <button key={t.valor} type="button" className={"pill-status" + (form.tipoAtendimento === t.valor ? " pill-status-ativa" : "")} onClick={() => setForm({ ...form, tipoAtendimento: t.valor })}>
                <Icone nome={t.icone} tamanho={14} /> {t.rotulo}
              </button>
            ))}
          </div>

          <div className="grade-2col">
            <div>
              <label>Nº de Sessões *</label>
              <input type="number" min="1" value={form.totalSessoes} onChange={(e) => setForm({ ...form, totalSessoes: e.target.value })} required />
            </div>
            <div>
              <label>Recorrência *</label>
              <select value={form.recorrencia} onChange={(e) => setForm({ ...form, recorrencia: e.target.value })}>
                {RECORRENCIAS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {precisaDias && (
            <>
              <label>Dias da Semana</label>
              <div className="pills-status">
                {Object.entries(DIAS_SEMANA_LABEL).map(([n, l]) => (
                  <button key={n} type="button" className={"pill-status" + ((form.diasSemana || []).includes(Number(n)) ? " pill-status-ativa" : "")} onClick={() => alternarDia(Number(n))}>
                    {l}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="grade-2col">
            <div>
              <label>Data de Início *</label>
              <input type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} required />
            </div>
            <div>
              <label>Horário</label>
              <input type="time" value={form.horario || ""} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
            </div>
          </div>

          <label>Modalidade</label>
          <select value={form.modalidade} onChange={(e) => setForm({ ...form, modalidade: e.target.value })}>
            {MODALIDADES_PACOTE.map((m) => <option key={m}>{m}</option>)}
          </select>

          <div className="grade-2col">
            <div>
              <label>Valor por Sessão (R$)</label>
              <input type="number" step="0.01" value={form.valorSessao} onChange={(e) => setForm({ ...form, valorSessao: e.target.value })} />
            </div>
            <div>
              <label>Valor Total (automático)</label>
              <input type="text" value={fmtMoeda(valorTotal)} disabled />
            </div>
          </div>

          <label>Status do Pagamento</label>
          <div className="pills-status">
            {[["pendente", "Pendente", "#F59E0B"], ["recebido", "Recebido", "var(--sucesso)"]].map(([v, l, c]) => (
              <button key={v} type="button" className={"pill-status" + (form.statusPag === v ? " pill-status-ativa" : "")} style={{ "--cor-pill": c }} onClick={() => setForm({ ...form, statusPag: v })}>
                {l}
              </button>
            ))}
          </div>

          <div className="grade-2col">
            <div>
              <label>Forma de Pagamento</label>
              <select value={form.formaPag} onChange={(e) => setForm({ ...form, formaPag: e.target.value })}>
                {FORMAS_PAG_CLINICA.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label>Data do Pagamento</label>
              <input type="date" value={form.dataPagamento || ""} onChange={(e) => setForm({ ...form, dataPagamento: e.target.value })} />
            </div>
          </div>

          <label>Observações <span className="opcional">(opcional)</span></label>
          <TextAreaVoz className="campo-descricao" rows={2} value={form.obs || ""} onChange={(e) => setForm({ ...form, obs: e.target.value })} />

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="acoes-modal">
            <button type="button" className="botao-secundario" onClick={aoFechar}>Cancelar</button>
            <button type="submit" className="botao-primario" disabled={salvando}>{salvando ? "Salvando..." : pacote ? "Salvar Alterações" : "Criar Pacote"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
