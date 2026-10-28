// ═══════════════════════════════════════════════════════════════
//  Testes das regras de segurança do Firestore — PsiCoWorking
//
//  Simula pessoas diferentes (duas clínicas, secretária, pacientes,
//  administradora e visitante sem login) tentando ler e escrever
//  dados, e confere se o banco permite ou recusa como deveria.
//
//  Como rodar (na pasta psicoworking):  npm run testar-regras
//  Usa um banco de mentira no computador; não toca nos dados reais.
// ═══════════════════════════════════════════════════════════════

const { test, before, after, beforeEach, describe } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");
const {
  doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc,
  collection, query, where, getDocs,
} = require("firebase/firestore");

let env;

before(async () => {
  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080").split(":");
  env = await initializeTestEnvironment({
    projectId: "demo-psicoworking",
    firestore: {
      rules: fs.readFileSync(path.join(__dirname, "..", "firestore.rules"), "utf8"),
      host,
      port: Number(port),
    },
  });
});

after(async () => { if (env) await env.cleanup(); });

// Pessoas
const psiA = () => env.authenticatedContext("psiA", { psi_id: "clinA", role: "psi" }).firestore();
const secA = () => env.authenticatedContext("secA", { psi_id: "clinA", role: "secretaria" }).firestore();
const psiB = () => env.authenticatedContext("psiB", { psi_id: "clinB", role: "psi" }).firestore();
const pacA1 = () => env.authenticatedContext("pacA1", { psi_id: "clinA", role: "paciente" }).firestore();
const pacA2 = () => env.authenticatedContext("pacA2", { psi_id: "clinA", role: "paciente" }).firestore();
const pacB1 = () => env.authenticatedContext("pacB1", { psi_id: "clinB", role: "paciente" }).firestore();
const matriz = () => env.authenticatedContext("matriz", { role: "admin_matriz" }).firestore();
const semLogin = () => env.unauthenticatedContext().firestore();
const logadoSemCarimbo = () => env.authenticatedContext("intruso").firestore();

// Dados de partida (gravados sem regras)
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const d = ctx.firestore();
    await setDoc(doc(d, "clinica_pacientes/pacA1"), { psi_id: "clinA", nome: "Paciente A1", fotoUrl: "" });
    await setDoc(doc(d, "clinica_pacientes/pacA2"), { psi_id: "clinA", nome: "Paciente A2" });
    await setDoc(doc(d, "clinica_pacientes/pacB1"), { psi_id: "clinB", nome: "Paciente B1" });
    await setDoc(doc(d, "clinica_sessoes/sessA1"), { psi_id: "clinA", pacienteId: "pacA1", status: "agendado" });
    await setDoc(doc(d, "clinica_prontuarios/prontA"), { psi_id: "clinA", pacienteId: "pacA1", textoBruto: "sigiloso A" });
    await setDoc(doc(d, "clinica_prontuarios/prontB"), { psi_id: "clinB", pacienteId: "pacB1", textoBruto: "sigiloso B" });
    await setDoc(doc(d, "clinica_crises/criseA"), { psi_id: "clinA", pacienteId: "pacA1", intensidade: "leve" });
    await setDoc(doc(d, "clinica_perfil_clinico/pacA1"), { psi_id: "clinA", pacienteId: "pacA1", cids: [] });
    await setDoc(doc(d, "clinica_aba_planos/pacA1"), { psi_id: "clinA", pacienteId: "pacA1", alvos: [] });
    await setDoc(doc(d, "clinica_laudos/laudoA"), { psi_id: "clinA", pacienteId: "pacA1", visivelPaciente: false });
    await setDoc(doc(d, "clinica_laudos/laudoVisivel"), { psi_id: "clinA", pacienteId: "pacA1", visivelPaciente: true });
    await setDoc(doc(d, "clinica_diario/diarioA1"), { psi_id: "clinA", pacienteId: "pacA1", texto: "diario" });
    await setDoc(doc(d, "clinica_lancamentos/lancA"), { psi_id: "clinA", valor: 100 });
    await setDoc(doc(d, "clinica_config/clinA"), { segredo: "x" });
    await setDoc(doc(d, "clinica_audit_log/log1"), { acao: "x" });
    await setDoc(doc(d, "psi_depoimentos/depAprovado"), { psi_id: "clinA", aprovado: true, texto: "ótimo" });
    await setDoc(doc(d, "psi_depoimentos/depPendente"), { psi_id: "clinA", aprovado: false, texto: "pendente" });
    await setDoc(doc(d, "clinica_links_partilhados/tokenA"), { psi_id: "clinA", nome: "x" });
    await setDoc(doc(d, "clinica_metas/metaA1"), { psi_id: "clinA", pacienteId: "pacA1", titulo: "Meta", progresso: 10, status: "ativa" });
    await setDoc(doc(d, "fabulas_terapeuticas/fab1"), { titulo: "Fábula", paginas: [] });
    await setDoc(doc(d, "clinica_solicitacoes_lgpd/sol1"), { psi_id: "clinA", uid: "pacA1", tipo: "exclusao", status: "pendente" });
    await setDoc(doc(d, "psi_interesse/int1"), { nome: "Maria", email: "m@x.com" });
    await setDoc(doc(d, "plataforma_config/planos"), { testeDias: 30 });
    for (const c of ["clinica_humor", "clinica_gestao_ansiedade", "clinica_tcc", "clinica_reflexoes", "clinica_anamneses", "clinica_registro_abc", "clinica_arvore_decisao", "clinica_relaxamento", "clinica_rastreamento_alimentar", "clinica_treino_auditivo", "clinica_rastreamento_bipolar"]) {
      await setDoc(doc(d, c + "/regA1"), { psi_id: "clinA", pacienteId: "pacA1" });
    }
  });
});

describe("Visitante sem login", () => {
  for (const caminho of [
    "clinica_pacientes/pacA1", "clinica_sessoes/sessA1", "clinica_prontuarios/prontA",
    "clinica_crises/criseA", "clinica_perfil_clinico/pacA1", "clinica_aba_planos/pacA1", "clinica_laudos/laudoA",
    "clinica_diario/diarioA1", "clinica_lancamentos/lancA", "clinica_config/clinA",
    "clinica_audit_log/log1",
  ]) {
    test("não lê " + caminho, async () => { await assertFails(getDoc(doc(semLogin(), caminho))); });
  }
  test("não grava em prontuários", async () => {
    await assertFails(setDoc(doc(semLogin(), "clinica_prontuarios/novo"), { psi_id: "clinA" }));
  });
  test("lê a vitrine pública (psi_config e depoimento aprovado)", async () => {
    await assertSucceeds(getDoc(doc(semLogin(), "psi_config/clinA")));
    await assertSucceeds(getDoc(doc(semLogin(), "psi_depoimentos/depAprovado")));
  });
  test("não lê depoimento ainda não aprovado", async () => {
    await assertFails(getDoc(doc(semLogin(), "psi_depoimentos/depPendente")));
  });
  test("consegue abrir um link compartilhado pelo código, mas não listar todos", async () => {
    await assertSucceeds(getDoc(doc(semLogin(), "clinica_links_partilhados/tokenA")));
    await assertFails(getDocs(collection(semLogin(), "clinica_links_partilhados")));
  });
  test("coleção que não existe nas regras é bloqueada", async () => {
    await assertFails(getDoc(doc(semLogin(), "qualquer_coisa/x")));
  });
});

describe("Logado, mas sem carimbo de clínica", () => {
  test("não lê paciente nem prontuário", async () => {
    await assertFails(getDoc(doc(logadoSemCarimbo(), "clinica_pacientes/pacA1")));
    await assertFails(getDoc(doc(logadoSemCarimbo(), "clinica_prontuarios/prontA")));
  });
});

describe("Equipe da clínica A", () => {
  test("lê e grava os próprios dados", async () => {
    await assertSucceeds(getDoc(doc(psiA(), "clinica_pacientes/pacA1")));
    await assertSucceeds(getDoc(doc(psiA(), "clinica_prontuarios/prontA")));
    await assertSucceeds(getDoc(doc(psiA(), "clinica_crises/criseA")));
    await assertSucceeds(getDoc(doc(psiA(), "clinica_perfil_clinico/pacA1")));
    await assertSucceeds(updateDoc(doc(psiA(), "clinica_prontuarios/prontA"), { textoBruto: "editado" }));
    await assertSucceeds(addDoc(collection(psiA(), "clinica_prontuarios"), { psi_id: "clinA", pacienteId: "pacA1" }));
  });
  test("lista só os documentos da própria clínica", async () => {
    await assertSucceeds(getDocs(query(collection(psiA(), "clinica_prontuarios"), where("psi_id", "==", "clinA"))));
  });
  test("a secretária também acessa os dados da própria clínica", async () => {
    await assertSucceeds(getDoc(doc(secA(), "clinica_pacientes/pacA1")));
    await assertSucceeds(getDoc(doc(secA(), "clinica_lancamentos/lancA")));
  });
  test("não cria documento carimbado para outra clínica", async () => {
    await assertFails(addDoc(collection(psiA(), "clinica_prontuarios"), { psi_id: "clinB", pacienteId: "pacB1" }));
    await assertFails(setDoc(doc(psiA(), "clinica_pacientes/novoB"), { psi_id: "clinB", nome: "x" }));
  });
  test("não consegue passar um documento seu para outra clínica (trocando o psi_id)", async () => {
    await assertFails(updateDoc(doc(psiA(), "clinica_prontuarios/prontA"), { psi_id: "clinB" }));
    await assertFails(updateDoc(doc(psiA(), "clinica_pacientes/pacA1"), { psi_id: "clinB" }));
  });
  test("não escreve no registro de auditoria", async () => {
    await assertFails(setDoc(doc(psiA(), "clinica_audit_log/novo"), { acao: "x" }));
  });
});

describe("Isolamento: equipe da clínica B não vê a clínica A", () => {
  for (const caminho of [
    "clinica_pacientes/pacA1", "clinica_sessoes/sessA1", "clinica_prontuarios/prontA",
    "clinica_crises/criseA", "clinica_perfil_clinico/pacA1", "clinica_aba_planos/pacA1", "clinica_laudos/laudoA",
    "clinica_diario/diarioA1", "clinica_lancamentos/lancA", "clinica_config/clinA",
  ]) {
    test("não lê " + caminho, async () => { await assertFails(getDoc(doc(psiB(), caminho))); });
  }
  test("não edita nem apaga dados da clínica A", async () => {
    await assertFails(updateDoc(doc(psiB(), "clinica_prontuarios/prontA"), { textoBruto: "invadido" }));
    await assertFails(deleteDoc(doc(psiB(), "clinica_prontuarios/prontA")));
    await assertFails(updateDoc(doc(psiB(), "clinica_pacientes/pacA1"), { nome: "invadido" }));
  });
  test("não consegue listar a clínica A mesmo pedindo pelo psi_id dela", async () => {
    await assertFails(getDocs(query(collection(psiB(), "clinica_prontuarios"), where("psi_id", "==", "clinA"))));
    await assertFails(getDocs(query(collection(psiB(), "clinica_pacientes"), where("psi_id", "==", "clinA"))));
  });
  test("não lista tudo sem filtro", async () => {
    await assertFails(getDocs(collection(psiB(), "clinica_prontuarios")));
  });
  test("lê os próprios dados normalmente", async () => {
    await assertSucceeds(getDoc(doc(psiB(), "clinica_prontuarios/prontB")));
  });
});

describe("Paciente", () => {
  test("lê a própria ficha, mas não a de outro paciente nem de outra clínica", async () => {
    await assertSucceeds(getDoc(doc(pacA1(), "clinica_pacientes/pacA1")));
    await assertFails(getDoc(doc(pacA1(), "clinica_pacientes/pacA2")));
    await assertFails(getDoc(doc(pacA1(), "clinica_pacientes/pacB1")));
    await assertFails(getDoc(doc(pacB1(), "clinica_pacientes/pacA1")));
  });
  test("não lê prontuário, crises nem perfil clínico (nem os dele)", async () => {
    await assertFails(getDoc(doc(pacA1(), "clinica_prontuarios/prontA")));
    await assertFails(getDoc(doc(pacA1(), "clinica_crises/criseA")));
    await assertFails(getDoc(doc(pacA1(), "clinica_perfil_clinico/pacA1")));
  });
  test("não lê financeiro nem configurações da clínica", async () => {
    await assertFails(getDoc(doc(pacA1(), "clinica_lancamentos/lancA")));
    await assertFails(getDoc(doc(pacA1(), "clinica_config/clinA")));
  });
  test("edita os próprios dados pessoais e a foto; e-mail, status e clínica não", async () => {
    await assertSucceeds(updateDoc(doc(pacA1(), "clinica_pacientes/pacA1"), { fotoUrl: "https://x/foto.png" }));
    await assertSucceeds(updateDoc(doc(pacA1(), "clinica_pacientes/pacA1"), { nome: "Nome Corrigido", telefone: "11999990000", dataNasc: "1990-05-01", cpf: "000.000.000-00", genero: "Feminino" }));
    await assertFails(updateDoc(doc(pacA1(), "clinica_pacientes/pacA1"), { nome: "" }));
    await assertFails(updateDoc(doc(pacA1(), "clinica_pacientes/pacA1"), { nome: 123 }));
    await assertFails(updateDoc(doc(pacA1(), "clinica_pacientes/pacA1"), { email: "novo@x.com" }));
    await assertFails(updateDoc(doc(pacA1(), "clinica_pacientes/pacA1"), { status: "inativo" }));
    await assertFails(updateDoc(doc(pacA1(), "clinica_pacientes/pacA1"), { responsavelEmail: "x@x.com" }));
    await assertFails(updateDoc(doc(pacA1(), "clinica_pacientes/pacA1"), { psi_id: "clinB" }));
    await assertFails(updateDoc(doc(pacA2(), "clinica_pacientes/pacA1"), { fotoUrl: "https://x/foto.png" }));
  });
  test("não apaga a própria ficha", async () => {
    await assertFails(deleteDoc(doc(pacA1(), "clinica_pacientes/pacA1")));
  });
  test("lê o laudo só se a psicóloga liberou", async () => {
    await assertFails(getDoc(doc(pacA1(), "clinica_laudos/laudoA")));
    await assertSucceeds(getDoc(doc(pacA1(), "clinica_laudos/laudoVisivel")));
    await assertFails(getDoc(doc(pacA2(), "clinica_laudos/laudoVisivel")));
  });
  test("o diário é dele: a equipe lê, outro paciente não", async () => {
    await assertSucceeds(getDoc(doc(pacA1(), "clinica_diario/diarioA1")));
    await assertSucceeds(getDoc(doc(psiA(), "clinica_diario/diarioA1")));
    await assertFails(getDoc(doc(pacA2(), "clinica_diario/diarioA1")));
    await assertFails(getDoc(doc(psiB(), "clinica_diario/diarioA1")));
  });
  test("não escreve registro em nome de outro paciente", async () => {
    await assertFails(setDoc(doc(pacA2(), "clinica_humor/x"), { psi_id: "clinA", pacienteId: "pacA1" }));
  });
  test("escreve registro de humor em nome próprio", async () => {
    await assertSucceeds(setDoc(doc(pacA1(), "clinica_humor/meu"), { psi_id: "clinA", pacienteId: "pacA1", nota: 3 }));
  });
  test("não escreve registro carimbado para outra clínica", async () => {
    await assertFails(setDoc(doc(pacA1(), "clinica_humor/x"), { psi_id: "clinB", pacienteId: "pacA1" }));
  });
});

describe("Administradora da plataforma (admin_matriz)", () => {
  test("não lê dados clínicos de nenhuma clínica", async () => {
    await assertFails(getDoc(doc(matriz(), "clinica_prontuarios/prontA")));
    await assertFails(getDoc(doc(matriz(), "clinica_pacientes/pacA1")));
    await assertFails(getDoc(doc(matriz(), "clinica_crises/criseA")));
  });
  test("lê o registro de auditoria, mas ninguém escreve nele", async () => {
    await assertSucceeds(getDoc(doc(matriz(), "clinica_audit_log/log1")));
    await assertFails(setDoc(doc(matriz(), "clinica_audit_log/novo"), { acao: "x" }));
  });
});

describe("Secretária não acessa o prontuário (sigilo profissional)", () => {
  for (const caminho of ["clinica_prontuarios/prontA", "clinica_crises/criseA", "clinica_perfil_clinico/pacA1", "clinica_aba_planos/pacA1"]) {
    test("não lê " + caminho, async () => { await assertFails(getDoc(doc(secA(), caminho))); });
  }
  test("não grava prontuário, crise nem perfil clínico", async () => {
    await assertFails(addDoc(collection(secA(), "clinica_prontuarios"), { psi_id: "clinA", pacienteId: "pacA1" }));
    await assertFails(addDoc(collection(secA(), "clinica_crises"), { psi_id: "clinA", pacienteId: "pacA1" }));
    await assertFails(updateDoc(doc(secA(), "clinica_perfil_clinico/pacA1"), { cids: [] }));
    await assertFails(updateDoc(doc(secA(), "clinica_aba_planos/pacA1"), { alvos: [] }));
    await assertFails(addDoc(collection(secA(), "clinica_aba_planos"), { psi_id: "clinA", pacienteId: "pacA2" }));
  });
  test("a psicóloga continua acessando normalmente", async () => {
    await assertSucceeds(getDoc(doc(psiA(), "clinica_prontuarios/prontA")));
    await assertSucceeds(getDoc(doc(psiA(), "clinica_crises/criseA")));
    await assertSucceeds(getDoc(doc(psiA(), "clinica_perfil_clinico/pacA1")));
    await assertSucceeds(getDoc(doc(psiA(), "clinica_aba_planos/pacA1")));
    await assertSucceeds(setDoc(doc(psiA(), "clinica_aba_planos/pacA1"), { psi_id: "clinA", pacienteId: "pacA1", alvos: [{ id: "a1" }] }));
  });
  test("a secretária segue acessando cadastro, agenda e financeiro", async () => {
    await assertSucceeds(getDoc(doc(secA(), "clinica_pacientes/pacA1")));
    await assertSucceeds(getDoc(doc(secA(), "clinica_sessoes/sessA1")));
    await assertSucceeds(getDoc(doc(secA(), "clinica_lancamentos/lancA")));
  });
});

describe("Paciente: só confirma presença e atualiza o andamento das metas", () => {
  test("confirma presença na própria sessão", async () => {
    await assertSucceeds(updateDoc(doc(pacA1(), "clinica_sessoes/sessA1"), { statusConfirmacao: "confirmado", confirmadoEm: new Date() }));
  });
  test("não altera status, valor, data nem dono da sessão", async () => {
    await assertFails(updateDoc(doc(pacA1(), "clinica_sessoes/sessA1"), { status: "realizado" }));
    await assertFails(updateDoc(doc(pacA1(), "clinica_sessoes/sessA1"), { valor: 0 }));
    await assertFails(updateDoc(doc(pacA1(), "clinica_sessoes/sessA1"), { pacienteId: "pacA2" }));
    await assertFails(updateDoc(doc(pacA1(), "clinica_sessoes/sessA1"), { statusConfirmacao: "confirmado", status: "realizado" }));
  });
  test("outro paciente não confirma a sessão alheia", async () => {
    await assertFails(updateDoc(doc(pacA2(), "clinica_sessoes/sessA1"), { statusConfirmacao: "confirmado" }));
  });
  test("atualiza o progresso da própria meta, mas não o título nem valores fora de 0 a 100", async () => {
    await assertSucceeds(updateDoc(doc(pacA1(), "clinica_metas/metaA1"), { progresso: 50, status: "ativa", atualizadoPor: "paciente", atualizadoEm: new Date() }));
    await assertFails(updateDoc(doc(pacA1(), "clinica_metas/metaA1"), { titulo: "Outra" }));
    await assertFails(updateDoc(doc(pacA1(), "clinica_metas/metaA1"), { progresso: 500 }));
    await assertFails(updateDoc(doc(pacA2(), "clinica_metas/metaA1"), { progresso: 20 }));
  });
  test("a equipe continua editando sessão e meta", async () => {
    await assertSucceeds(updateDoc(doc(psiA(), "clinica_sessoes/sessA1"), { status: "realizado" }));
    await assertSucceeds(updateDoc(doc(secA(), "clinica_sessoes/sessA1"), { valor: 150 }));
    await assertSucceeds(updateDoc(doc(psiA(), "clinica_metas/metaA1"), { titulo: "Nova meta" }));
  });
});

describe("Fábulas: só a administradora da plataforma altera", () => {
  test("psicóloga e secretária leem, mas não gravam nem apagam", async () => {
    await assertSucceeds(getDoc(doc(psiA(), "fabulas_terapeuticas/fab1")));
    await assertFails(updateDoc(doc(psiA(), "fabulas_terapeuticas/fab1"), { titulo: "Alterada" }));
    await assertFails(addDoc(collection(psiA(), "fabulas_terapeuticas"), { titulo: "Nova" }));
    await assertFails(deleteDoc(doc(psiB(), "fabulas_terapeuticas/fab1")));
    await assertFails(updateDoc(doc(secA(), "fabulas_terapeuticas/fab1"), { titulo: "Alterada" }));
  });
  test("paciente e visitante não gravam", async () => {
    await assertFails(updateDoc(doc(pacA1(), "fabulas_terapeuticas/fab1"), { titulo: "x" }));
    await assertFails(updateDoc(doc(semLogin(), "fabulas_terapeuticas/fab1"), { titulo: "x" }));
  });
  test("a administradora da plataforma grava e apaga", async () => {
    await assertSucceeds(updateDoc(doc(matriz(), "fabulas_terapeuticas/fab1"), { titulo: "Revisada" }));
    await assertSucceeds(addDoc(collection(matriz(), "fabulas_terapeuticas"), { titulo: "Nova" }));
    await assertSucceeds(deleteDoc(doc(matriz(), "fabulas_terapeuticas/fab1")));
  });
});

describe("Paciente lê os próprios registros (histórico no portal e exportação LGPD)", () => {
  const MEUS = ["clinica_humor", "clinica_gestao_ansiedade", "clinica_tcc", "clinica_reflexoes", "clinica_anamneses", "clinica_registro_abc", "clinica_arvore_decisao", "clinica_relaxamento", "clinica_rastreamento_alimentar", "clinica_treino_auditivo"];
  for (const c of MEUS) {
    test("lê o próprio registro em " + c + ", mas outro paciente e outra clínica não", async () => {
      await assertSucceeds(getDoc(doc(pacA1(), c + "/regA1")));
      await assertSucceeds(getDocs(query(collection(pacA1(), c), where("psi_id", "==", "clinA"), where("pacienteId", "==", "pacA1"))));
      await assertFails(getDoc(doc(pacA2(), c + "/regA1")));
      await assertFails(getDoc(doc(pacB1(), c + "/regA1")));
      await assertFails(getDoc(doc(psiB(), c + "/regA1")));
    });
  }
  test("a avaliação clínica (rastreamento diagnóstico) continua só com a psicóloga", async () => {
    await assertFails(getDoc(doc(pacA1(), "clinica_rastreamento_bipolar/regA1")));
    await assertSucceeds(getDoc(doc(psiA(), "clinica_rastreamento_bipolar/regA1")));
  });
});

describe("Pedidos de privacidade (LGPD)", () => {
  test("o paciente cria o próprio pedido e lê só o dele", async () => {
    await assertSucceeds(setDoc(doc(pacA1(), "clinica_solicitacoes_lgpd/novo"), { uid: "pacA1", psi_id: "clinA", tipo: "exclusao", status: "pendente" }));
    await assertSucceeds(getDoc(doc(pacA1(), "clinica_solicitacoes_lgpd/sol1")));
    await assertFails(getDoc(doc(pacA2(), "clinica_solicitacoes_lgpd/sol1")));
  });
  test("o paciente não cria pedido em nome de outro nem altera o status", async () => {
    await assertFails(setDoc(doc(pacA1(), "clinica_solicitacoes_lgpd/falso"), { uid: "pacA2", psi_id: "clinA", tipo: "exclusao", status: "pendente" }));
    await assertFails(updateDoc(doc(pacA1(), "clinica_solicitacoes_lgpd/sol1"), { status: "atendida" }));
  });
  test("a equipe da própria clínica trata o pedido; outra clínica não vê", async () => {
    await assertSucceeds(updateDoc(doc(psiA(), "clinica_solicitacoes_lgpd/sol1"), { status: "atendida" }));
    await assertFails(getDoc(doc(psiB(), "clinica_solicitacoes_lgpd/sol1")));
  });
});

async function definirSituacao(psiId, situacao) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "psi_assinaturas/" + psiId), { plano: "essencial", situacao });
  });
}

describe("Assinatura, planos e situação da clínica", () => {
  test("a equipe lê a própria assinatura; outra clínica, paciente e visitante não", async () => {
    await definirSituacao("clinA", "teste");
    await assertSucceeds(getDoc(doc(psiA(), "psi_assinaturas/clinA")));
    await assertSucceeds(getDoc(doc(secA(), "psi_assinaturas/clinA")));
    await assertFails(getDoc(doc(psiB(), "psi_assinaturas/clinA")));
    await assertFails(getDoc(doc(pacA1(), "psi_assinaturas/clinA")));
    await assertFails(getDoc(doc(semLogin(), "psi_assinaturas/clinA")));
  });
  test("só a administradora grava a assinatura (a equipe não troca o próprio plano)", async () => {
    await definirSituacao("clinA", "teste");
    await assertFails(updateDoc(doc(psiA(), "psi_assinaturas/clinA"), { plano: "plus" }));
    await assertFails(updateDoc(doc(psiA(), "psi_assinaturas/clinA"), { situacao: "ativa" }));
    await assertFails(setDoc(doc(psiB(), "psi_assinaturas/clinB"), { plano: "plus", situacao: "ativa" }));
    await assertSucceeds(updateDoc(doc(matriz(), "psi_assinaturas/clinA"), { plano: "plus" }));
  });
  test("planos e preços: a equipe lê, só a administradora grava", async () => {
    await assertSucceeds(getDoc(doc(psiA(), "plataforma_config/planos")));
    await assertFails(updateDoc(doc(psiA(), "plataforma_config/planos"), { testeDias: 999 }));
    await assertFails(getDoc(doc(pacA1(), "plataforma_config/planos")));
    await assertSucceeds(updateDoc(doc(matriz(), "plataforma_config/planos"), { testeDias: 30 }));
  });
  for (const ok of ["teste", "ativa", "atrasada"]) {
    test("situação " + ok + ": a equipe grava normalmente", async () => {
      await definirSituacao("clinA", ok);
      await assertSucceeds(updateDoc(doc(psiA(), "clinica_prontuarios/prontA"), { textoBruto: "ok" }));
      await assertSucceeds(addDoc(collection(psiA(), "clinica_prontuarios"), { psi_id: "clinA", pacienteId: "pacA1" }));
      await assertSucceeds(updateDoc(doc(secA(), "clinica_sessoes/sessA1"), { valor: 10 }));
    });
  }
  for (const bloqueada of ["somente_leitura", "suspensa", "cancelada"]) {
    test("situação " + bloqueada + ": a equipe lê e exporta, mas não grava", async () => {
      await definirSituacao("clinA", bloqueada);
      await assertSucceeds(getDoc(doc(psiA(), "clinica_prontuarios/prontA")));
      await assertSucceeds(getDoc(doc(secA(), "clinica_pacientes/pacA1")));
      await assertSucceeds(getDocs(query(collection(psiA(), "clinica_prontuarios"), where("psi_id", "==", "clinA"))));
      await assertFails(updateDoc(doc(psiA(), "clinica_prontuarios/prontA"), { textoBruto: "x" }));
      await assertFails(addDoc(collection(psiA(), "clinica_prontuarios"), { psi_id: "clinA", pacienteId: "pacA1" }));
      await assertFails(updateDoc(doc(secA(), "clinica_sessoes/sessA1"), { valor: 10 }));
      await assertFails(addDoc(collection(secA(), "clinica_lancamentos"), { psi_id: "clinA", valor: 1 }));
      await assertFails(deleteDoc(doc(psiA(), "clinica_crises/criseA")));
    });
  }
  test("a situação de uma clínica não afeta a outra", async () => {
    await definirSituacao("clinA", "suspensa");
    await assertSucceeds(updateDoc(doc(psiB(), "clinica_prontuarios/prontB"), { textoBruto: "livre" }));
  });
  test("pedidos de interesse: o público envia, só a administradora lê e responde", async () => {
    await assertSucceeds(addDoc(collection(semLogin(), "psi_interesse"), { nome: "Ana", email: "a@x.com" }));
    await assertFails(getDoc(doc(semLogin(), "psi_interesse/int1")));
    await assertFails(getDoc(doc(psiA(), "psi_interesse/int1")));
    await assertSucceeds(updateDoc(doc(matriz(), "psi_interesse/int1"), { status: "aprovado" }));
  });
});

describe("Depoimentos do site (psicólogas)", () => {
  const novo = (o) => ({ nome: "Ana", detalhe: "Goiânia", texto: "Facilitou muito a minha rotina.", aprovado: false, autorizou: true, autorizouEm: new Date(), criadoEm: new Date(), ...o });
  test("qualquer pessoa envia um depoimento válido, sempre como não aprovado", async () => {
    await assertSucceeds(addDoc(collection(semLogin(), "site_depoimentos"), novo()));
  });
  test("não consegue se aprovar, enviar sem autorização, com texto curto/enorme ou campos extras", async () => {
    await assertFails(addDoc(collection(semLogin(), "site_depoimentos"), novo({ aprovado: true })));
    await assertFails(addDoc(collection(semLogin(), "site_depoimentos"), novo({ autorizou: false })));
    await assertFails(addDoc(collection(semLogin(), "site_depoimentos"), novo({ texto: "curto" })));
    await assertFails(addDoc(collection(semLogin(), "site_depoimentos"), novo({ texto: "x".repeat(800) })));
    await assertFails(addDoc(collection(semLogin(), "site_depoimentos"), novo({ role: "admin" })));
  });
  test("o público lê só os aprovados; a administradora lê, edita e apaga tudo", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const d = ctx.firestore();
      await setDoc(doc(d, "site_depoimentos/ok"), novo({ aprovado: true }));
      await setDoc(doc(d, "site_depoimentos/pendente"), novo());
    });
    await assertSucceeds(getDoc(doc(semLogin(), "site_depoimentos/ok")));
    await assertFails(getDoc(doc(semLogin(), "site_depoimentos/pendente")));
    await assertSucceeds(getDocs(query(collection(semLogin(), "site_depoimentos"), where("aprovado", "==", true))));
    await assertFails(getDocs(collection(semLogin(), "site_depoimentos")));
    await assertFails(updateDoc(doc(psiA(), "site_depoimentos/pendente"), { aprovado: true }));
    await assertSucceeds(getDoc(doc(matriz(), "site_depoimentos/pendente")));
    await assertSucceeds(updateDoc(doc(matriz(), "site_depoimentos/pendente"), { aprovado: true, texto: "Texto corrigido pela administradora." }));
    await assertSucceeds(deleteDoc(doc(matriz(), "site_depoimentos/ok")));
  });
});

describe("Preços públicos do site de vendas", () => {
  test("qualquer pessoa lê, só a administradora grava", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "plataforma_publico/planos"), { testeDias: 30 });
    });
    await assertSucceeds(getDoc(doc(semLogin(), "plataforma_publico/planos")));
    await assertFails(setDoc(doc(semLogin(), "plataforma_publico/planos"), { testeDias: 1 }));
    await assertFails(setDoc(doc(psiA(), "plataforma_publico/planos"), { testeDias: 1 }));
    await assertSucceeds(setDoc(doc(matriz(), "plataforma_publico/planos"), { testeDias: 30 }));
  });
});

describe("Endereço da clínica (psi_slugs)", () => {
  test("qualquer pessoa lê o apelido, mas ninguém grava pelo navegador", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "psi_slugs/clinica-a"), { psiId: "clinA" });
    });
    await assertSucceeds(getDoc(doc(semLogin(), "psi_slugs/clinica-a")));
    await assertFails(setDoc(doc(semLogin(), "psi_slugs/outra"), { psiId: "clinA" }));
    await assertFails(setDoc(doc(psiA(), "psi_slugs/roubada"), { psiId: "clinA" }));
    await assertFails(setDoc(doc(matriz(), "psi_slugs/admin-direto"), { psiId: "clinA" }));
    await assertFails(updateDoc(doc(psiB(), "psi_slugs/clinica-a"), { psiId: "clinB" }));
  });
});

describe("Autocadastro de psicóloga e pedido de mudança de plano", () => {
  const valido = () => ({ nome: "Ana Souza", email: "ana@exemplo.com", crp: "06/12345", telefone: "11999990000", cidade: "Goiânia", indicadoPor: "Lucia", origem: "autocadastro", criadoEm: new Date() });
  test("o público envia um pedido válido", async () => {
    await assertSucceeds(addDoc(collection(semLogin(), "psi_interesse"), valido()));
    await assertSucceeds(addDoc(collection(semLogin(), "psi_interesse"), { nome: "Maria", email: "m@x.com", origem: "site", criadoEm: new Date() }));
  });
  test("o público não consegue enviar status, campos extras, e-mail inválido ou nome enorme", async () => {
    await assertFails(addDoc(collection(semLogin(), "psi_interesse"), { ...valido(), status: "aprovado" }));
    await assertFails(addDoc(collection(semLogin(), "psi_interesse"), { ...valido(), role: "admin_matriz" }));
    await assertFails(addDoc(collection(semLogin(), "psi_interesse"), { ...valido(), email: "sem-arroba" }));
    await assertFails(addDoc(collection(semLogin(), "psi_interesse"), { ...valido(), nome: "x".repeat(500) }));
    await assertFails(addDoc(collection(semLogin(), "psi_interesse"), { ...valido(), nome: "A" }));
  });
  const pedido = (o) => ({ psi_id: "clinA", nomeClinica: "Clínica A", de: "essencial", para: "plus", ciclo: "mensal", status: "pendente", pedidoEm: new Date(), ...o });
  test("a psicóloga pede mudança de plano na própria clínica", async () => {
    await assertSucceeds(setDoc(doc(psiA(), "psi_pedidos_plano/clinA"), pedido()));
    await assertSucceeds(getDoc(doc(psiA(), "psi_pedidos_plano/clinA")));
    await assertSucceeds(getDoc(doc(matriz(), "psi_pedidos_plano/clinA")));
  });
  test("não pede em nome de outra clínica, não se autoaprova e a secretária não pede", async () => {
    await assertFails(setDoc(doc(psiA(), "psi_pedidos_plano/clinB"), pedido({ psi_id: "clinB" })));
    await assertFails(setDoc(doc(psiA(), "psi_pedidos_plano/clinA"), pedido({ status: "atendido" })));
    await assertFails(setDoc(doc(psiA(), "psi_pedidos_plano/clinA"), pedido({ para: "premium" })));
    await assertFails(setDoc(doc(secA(), "psi_pedidos_plano/clinA"), pedido()));
    await assertFails(setDoc(doc(pacA1(), "psi_pedidos_plano/clinA"), pedido()));
    await assertFails(getDoc(doc(psiB(), "psi_pedidos_plano/clinA")));
  });
  test("a administradora marca o pedido como atendido", async () => {
    await assertSucceeds(setDoc(doc(psiA(), "psi_pedidos_plano/clinA"), pedido()));
    await assertSucceeds(updateDoc(doc(matriz(), "psi_pedidos_plano/clinA"), { status: "atendido" }));
  });
});
