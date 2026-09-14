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
          <button className="botao-perigo" onClick={() => { setLancEditando(null); setMostrarDespesa(true); }}>
            <Icone nome="minus-circle" tamanho={16} /> Nova Despesa
          </button>
          <button className="botao-primario" onClick={() => { setLancEditando(null); setMostrarNovo(true); }}>
            <Icone nome="plus" tamanho={16} /> Novo Lançamento
          </button>
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
        <CartaoStat titulo="Pacotes ativos" valor="—" legenda="em breve" icone="package" />
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

      {aba !== "lancamentos" && (
        <div className="cartao-secao">
          <p className="texto-vazio">
            Essa aba ({ABAS_FINANCEIRO.find((a) => a.id === aba)?.rotulo}) ainda não foi construída — é a próxima etapa combinada.
          </p>
        </div>
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
