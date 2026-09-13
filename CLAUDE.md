# CLAUDE.md — PsicoWorking

Leia este arquivo inteiro antes de qualquer edição. Estas regras são absolutas.

---

## Identidade do Produto

- **Produto:** PsicoWorking — plataforma SaaS white-label para psicólogos clínicos
- **Domínio:** `psicoworking.app.br`
- **Proprietária / Admin Matriz:** Dra. Lucia Kratz — CRP 09/20590
- **Empresa:** A!Equipe Desenvolvimento Humano e Cultural — CNPJ 07.242.408/0001-19
- **Marca PsicoWorking:** identidade própria (não é a marca pessoal da Lucia)
- **Marca da Lucia:** roxo `#7B00C4`, borboleta 🦋, Dancing Script — aparece apenas no Admin Matriz
- **Firebase projeto:** `psicoworking` (projeto dedicado, separado do `entrevista-inicial`)
- **Repositório:** `luciakratz-arch/psicoworking` (GitHub Pages)

---

## Conceito do Produto

Cada psicólogo contratante recebe:
1. Um **site institucional personalizado** em `psicoworking.app.br/psi-[slug]`
2. **Login do Psi** no próprio site → acessa o admin da clínica
3. **Login do Paciente** no próprio site → acessa o portal do paciente
4. Botão **"Instalar App"** (PWA — atalho na tela do celular)
5. Botão **"← PsicoWorking"** → volta ao site central
6. **IA de personalização** — psicólogo sobe logo e/ou cola link do site → IA extrai cores, sugere paleta e gera texto do site institucional

O **site central** (`psicoworking.app.br`) é a vitrine de todos os psicólogos cadastrados, com card de cada um mostrando nome, especialidade e ⭐ média de avaliações.

---

## ⚠️ SEGURANÇA E PROTEÇÃO DE DADOS — LEIA ANTES DE TUDO O MAIS

Este produto guarda **dado sensível de saúde** (LGPD art. 5º-II e art. 11 — categoria de dado que exige tratamento reforçado). As regras desta seção têm prioridade sobre qualquer outra parte deste arquivo em caso de conflito.

### Modelo de identidade (substitui qualquer versão anterior deste arquivo)

- **Ninguém loga com senha guardada em campo de Firestore.** Todo login — psicólogo, secretária, paciente, Admin Matriz — é **Firebase Authentication** de verdade (e-mail + senha com hash do próprio Firebase). Nunca existe um campo `senha` em nenhum documento do Firestore.
- **Não existe senha padrão nem fallback fraco** (nunca `"1234"`, nunca uma senha igual para todo mundo). Paciente novo recebe conta criada pela `Cloud Function cadastrarPaciente` com senha temporária aleatória e define a própria senha por link de redefinição — a clínica nunca fica sabendo a senha do paciente.
- **`psi_id` e `role` são custom claims do Firebase Auth**, atribuídos exclusivamente pelas Cloud Functions em `functions/index.js` (Admin SDK — o navegador nunca tem esse poder). Nenhuma Firestore Rule confia em um campo `psi_id` escrito pelo cliente sem cruzar com o claim do token.
- **Toda Firestore Rule está em `firestore.rules`** e segue o padrão: leitura/escrita de dado clínico exige `request.auth.token.psi_id == resource.data.psi_id` **e** o `role` certo. Ver esse arquivo para o modelo completo, coleção por coleção.
- **Token do Google Calendar nunca toca o navegador.** Fica em `clinica_google_tokens/{psi_id}`, coleção sem nenhuma regra de leitura liberada (bloqueada por padrão) — só a Cloud Function `conectarGoogleCalendar` (Admin SDK) lê e escreve ali. O client secret do Google fica em Secret Manager (`firebase functions:secrets:set`), nunca no código.
- **Toda ação sensível gera registro em `clinica_audit_log`** (quem fez, o quê, quando) — coleção só de escrita via Cloud Function, leitura só para Admin Matriz, nunca editável nem apagável.

### Checklist de conformidade LGPD (dado sensível de saúde)

- [ ] Política de privacidade publicada, explicando finalidade, base legal (consentimento) e prazo de retenção de cada categoria de dado
- [ ] Tela de consentimento explícito no cadastro do paciente, antes de qualquer coleta de dado clínico
- [ ] Mecanismo de exportação e exclusão de dados do paciente a pedido (direito de acesso e eliminação, LGPD art. 18)
- [ ] Encarregado de dados (DPO) identificado e contato publicado
- [ ] Plano de resposta a incidente (o que fazer em caso de vazamento) documentado
- [ ] Depoimentos sempre anônimos — nunca nome, foto ou identificação (já previsto na seção Ética abaixo)
- [ ] Backup do Firestore configurado e testado (recuperação, não só cópia)
- [ ] Nenhuma chave de API secreta (Google client secret, chave de serviço do Firebase) commitada no repositório — ver `.gitignore`

### Regra de senha (substitui a antiga tabela "Senhas padrão")

| Perfil | Como autentica |
|---|---|
| Admin Matriz | Firebase Auth, e-mail + senha própria da Lucia, sem fallback |
| Psicólogo / Secretária | Firebase Auth, e-mail + senha definida no cadastro (link de redefinição, nunca enviada em texto) |
| Paciente | Firebase Auth, e-mail + senha definida pelo próprio paciente via link — nunca `1234`, nunca senha visível para a clínica |

---

## Arquitetura Multi-Tenant

### Modelo de dados
- **Um único Firebase** com separação por `psi_id` em todas as coleções
- Nunca misturar dados de psicólogos distintos
- Toda query de paciente, sessão, financeiro DEVE filtrar por `psi_id` **e** essa filtragem é redundante de propósito — a proteção de verdade está nas Firestore Rules (ver seção de Segurança acima), o filtro no client é só performance/UX

### Estrutura de URLs
```
psicoworking.app.br/                    ← Site central (vitrine)
psicoworking.app.br/psi-[slug]/         ← Site individual do psicólogo
psicoworking.app.br/psi-[slug]/admin/   ← Admin do psicólogo
psicoworking.app.br/psi-[slug]/paciente/← Portal do paciente
psicoworking.app.br/admin-matriz/       ← Painel exclusivo da Lucia
```

### Estrutura do repositório
```
psicoworking/
├── index.html                    ← Site central (vitrine dos psicólogos)
├── firebase.json                 ← Config de hosting + Firestore + Functions
├── firestore.rules               ← Regras de segurança do banco (ler antes de mexer em qualquer dado)
├── firestore.indexes.json
├── .gitignore                    ← Bloqueia segredos de irem para o repositório
├── functions/
│   ├── package.json
│   └── index.js                  ← Cloud Functions: custom claims, cadastro de paciente, token do Google
├── admin-matriz/
│   └── index.html                ← Painel exclusivo Lucia (admin geral)
├── psi/                          ← Template do psicólogo (dinâmico por slug)
│   ├── index.html                ← Site institucional + login psi + login paciente
│   ├── admin/
│   │   ├── index.html
│   │   ├── app_core.js + .compiled.js
│   │   ├── app_pacientes.js + .compiled.js
│   │   ├── app_agenda.js + .compiled.js
│   │   ├── app_financeiro.js + .compiled.js
│   │   ├── app_recursos.js + .compiled.js
│   │   ├── app_config.js + .compiled.js
│   │   └── app_main.js + .compiled.js
│   └── paciente/
│       ├── index.html
│       └── app.js                ← Portal do paciente (Babel CDN inline)
├── Assinatura Lúcia Kratz.png    ← Só usada no admin-matriz
└── CLAUDE.md
```

---

## REGRAS CRÍTICAS

### REGRA 1 — Sempre partir do código atual do repositório
Nunca partir de arquivos externos ou uploads sem confirmar que são a versão mais recente do GitHub. Já houve perda de módulos inteiros por sobrescrita acidental.

### REGRA 2 — Admin usa arquivos pré-compilados (sem Babel CDN)
O `admin/index.html` NÃO carrega Babel. Usa apenas `.compiled.js` pré-compilados.

**Fluxo obrigatório para qualquer edição no admin:**
1. Identificar o arquivo fonte correto (tabela abaixo)
2. Editar o `.js` fonte
3. Compilar: `babel.transformSync(src, {presets:[['@babel/preset-react',{runtime:'classic'}]]})`
4. Validar que ZERO linhas do compilado começam com `import`
5. Entregar AMBOS: `.js` (fonte) + `.compiled.js` (compilado)
6. Incrementar `?v=N` no `admin/index.html`

**Mapa de arquivos — qual editar:**

| O que mudar | Arquivo fonte | Compilado |
|---|---|---|
| Firebase config, Login, contexto psi_id | app_core.js | app_core.compiled.js |
| Pacientes (cadastro, perfil, evolução) | app_pacientes.js | app_pacientes.compiled.js |
| Agenda + Google Calendar | app_agenda.js | app_agenda.compiled.js |
| Financeiro (pacotes, sessões, recebimentos) | app_financeiro.js | app_financeiro.compiled.js |
| Recursos terapêuticos (ferramentas, fábulas, psicoeducações) | app_recursos.js | app_recursos.compiled.js |
| Configurações (logo, cores, dados, depoimentos) | app_config.js | app_config.compiled.js |
| App(), Sidebar, routing | app_main.js | app_main.compiled.js |

### REGRA 3 — psi_id em TODA query Firestore (defesa em profundidade)
Nunca fazer query sem filtrar por `psi_id` no client. Isso não é a proteção principal (quem protege de verdade é a Firestore Rule + custom claim, ver seção Segurança), mas é a segunda camada — sem exceção.

### REGRA 4 — Firestore sem .orderBy()
Nunca usar `.orderBy()` sem certeza de índice composto existente. Sempre ordenar client-side com `.sort()` após `.get()` ou `.onSnapshot()`.

### REGRA 5 — Nunca alterar seções aprovadas
Escopo cirúrgico: apenas o que foi explicitamente pedido. Uma etapa por vez.

### REGRA 6 — Confirmar antes de editar
Sempre: "vou editar o X.js — confirma?" antes de qualquer arquivo.

### REGRA 7 — Para mudanças de UI
Mostrar esboço textual e aguardar aprovação antes de codificar.

### REGRA 8 — Entregar arquivos completos
Sempre o arquivo completo — nunca trechos, diffs ou snippets.

### REGRA 9 — Nunca criar autenticação própria fora do Firebase Auth
Nenhuma tela nova de login pode comparar senha manualmente contra um campo do Firestore. Login é sempre `firebase.auth().signInWithEmailAndPassword(...)` ou fluxo equivalente do Firebase Auth. Se uma feature parecer exigir senha comparada "na mão", parar e reconsiderar o desenho antes de codificar.

### REGRA 10 — Toda comunicação com a Lucia é em português do Brasil
Sem exceção, nem em pergunta, confirmação ou comentário dirigido a ela. Código técnico (sintaxe de linguagens de programação) pode e deve ter as palavras-chave que a própria linguagem exige — isso não é uma escolha de idioma, é sintaxe obrigatória da ferramenta.

---

## Stack

- React 18 via CDN (sem bundler, sem SPA build)
- Firebase Authentication (login de psicólogo, secretária, paciente e Admin Matriz)
- Firebase Firestore (projeto `psicoworking`)
- Firebase Cloud Functions (custom claims, cadastro de paciente, token do Google Calendar — nunca no client)
- GitHub Pages (hospedagem do site estático)
- Babel `@babel/core` + `@babel/preset-react` — sempre `{runtime:'classic'}`
- Lucide Icons v0.383.0 (pinned)
- PWA: `manifest.json` + `service-worker.js` por psicólogo
- Google Calendar API (integração agenda, via Cloud Function)
- Claude API (`claude-sonnet-4-6`) — personalização IA do site institucional

---

## Coleções Firestore

Todas as coleções (exceto `clinica_google_tokens`) têm campo `psi_id` obrigatório e são protegidas por `firestore.rules` cruzando esse campo com o custom claim do usuário logado.

```
psi_profiles          ← cadastro dos psicólogos (psi_id, slug, nome, logo, cores, plano, status)
psi_config            ← personalização do site (cores, logo, textos gerados pela IA)
psi_depoimentos       ← depoimentos anônimos dos pacientes (texto, estrelas, psi_id)

clinica_pacientes     ← pacientes (psi_id obrigatório) — NUNCA contém senha
clinica_sessoes       ← sessões (psi_id obrigatório)
clinica_pacotes       ← pacotes de sessões (psi_id obrigatório)
clinica_lancamentos   ← lançamentos financeiros (psi_id obrigatório)
clinica_metas         ← metas terapêuticas (psi_id obrigatório)
clinica_tcc           ← registros de pensamentos (psi_id obrigatório)
clinica_humor         ← check-in diário de humor (psi_id obrigatório)
clinica_diario        ← diário terapêutico (psi_id obrigatório)
clinica_recursos      ← catálogo de recursos (psi_id ou global)
clinica_fabulas       ← fábulas (global)
clinica_psicoeducacao ← psicoeducações (global)
clinica_recurso_acessos ← log de uso de recursos (psi_id obrigatório)
clinica_gestao_ansiedade ← ferramentas de ansiedade (psi_id obrigatório)
clinica_arvore_decisao   ← árvore da decisão (psi_id obrigatório)
clinica_agenda        ← agenda local + sync Google Calendar (psi_id obrigatório)
clinica_google_tokens ← token OAuth do Google Calendar por psi_id — SEM psi_id em outras coleções o alcança; acesso só via Cloud Function, bloqueado por regra para qualquer client
clinica_audit_log     ← trilha de auditoria de ações sensíveis — só Cloud Function escreve, só Admin Matriz lê
```

---

## Módulos do Admin do Psicólogo

### 1. Pacientes
- Cadastro completo **via Cloud Function `cadastrarPaciente`** (cria o login no Firebase Auth + o documento em `clinica_pacientes`) — nunca criar só o documento do Firestore sem a conta de autenticação correspondente
- Perfil com abas: Dados, Evolução, Metas, Laudos, Módulos habilitados
- Nunca deletar paciente com pacote ativo — usar flag `inativo`

### 2. Agenda
- Agenda local com visualização semanal/mensal
- Integração Google Calendar (OAuth2) via Cloud Function `conectarGoogleCalendar` — sincronização bidirecional, token nunca chega ao client
- Botão "Instalar App" (PWA) na interface

### 3. Financeiro da Clínica
- Pacotes: Particular / Social / Parceria
- Lançamentos: recebimentos e despesas
- Relatório de recebidos × a receber por período

### 4. Recursos Terapêuticos
- Ferramentas, Fábulas, Psicoeducações
- Catálogo global + habilitação por paciente
- Log de uso em `clinica_recurso_acessos`

### 5. Configurações
- **Dados da clínica:** nome, CRP, especialidades, WhatsApp, endereço
- **Identidade visual:** logo (upload), cor primária
- **IA de personalização:** sobe logo e/ou cola link do site → IA gera paleta + textos do site institucional
- **Depoimentos:** lista de depoimentos anônimos recebidos, aprovação antes de publicar no site

---

## Portal do Paciente

Acesso via `psicoworking.app.br/psi-[slug]/paciente/`

- Login via Firebase Auth (e-mail + senha definida pelo próprio paciente) — nunca autocomplete de nome comparado contra senha em Firestore
- **Meu Painel** — saudação, humor do dia, metas ativas
- **Check-in Diário** — registro de humor
- **Minhas Metas** — visualiza e atualiza progresso
- **Diário Terapêutico** — escrita livre
- **Recursos Terapêuticos** — ferramentas, fábulas, psicoeducações habilitadas
- **Avaliar** — formulário anônimo de estrelas + texto (alimenta `psi_depoimentos`)
- Visual adaptado às cores do psicólogo (lido de `psi_config`)

---

## Site Institucional do Psicólogo (`psi/index.html`)

- Gerado dinamicamente pelo slug na URL (`?psi=maria-kratz` ou path `/psi-maria/`)
- Lê `psi_config` no Firestore e aplica cores, logo, textos
- Seções: Hero, Sobre, Especialidades, Depoimentos anônimos, Contato
- Dois botões de login: **"Área do Psi"** + **"Área do Paciente"**
- Botão **"Instalar App"** (PWA)
- Botão **"← PsicoWorking"** → `psicoworking.app.br`
- Cores, logo e textos vêm do `psi_config` — nunca hardcoded

---

## Site Central (`index.html`)

- Vitrine de todos os psicólogos com `status: ativo` em `psi_profiles`
- Card por psicólogo: foto/logo, nome, CRP, especialidades, ⭐ média de estrelas
- Click no card → `psicoworking.app.br/psi-[slug]/`
- Busca por especialidade / cidade
- Header com login discreto da **Admin Matriz** (Lucia)

---

## Admin Matriz (`admin-matriz/index.html`)

Acesso exclusivo da Lucia — Firebase Auth com conta própria, senha exclusiva, não compartilhada, sem fallback.

- Lista de todos os psicólogos cadastrados
- Cadastrar novo psicólogo (gera `psi_id` + slug, e chama `definirCarimboEquipe` para dar o primeiro acesso)
- Ativar / suspender / excluir psicólogo
- Ver métricas por psicólogo (pacientes ativos, sessões no mês)
- Futuro: planos e cobrança

---

## IA de Personalização

Endpoint interno que usa **Claude API** (`claude-sonnet-4-6`):

**Input do psicólogo:**
- Upload de logo (imagem) → extrai cor dominante via canvas
- Link do site atual (opcional) → Claude lê e extrai estilo/tom

**Output gerado pela IA:**
- Paleta de cores (primária, secundária, fundo, texto)
- Texto Hero (título + subtítulo)
- Texto "Sobre mim" (rascunho para editar)
- Texto de cada especialidade

**Regra:** IA gera sugestão — psicólogo revisa e aprova antes de publicar. Nunca publicar automaticamente sem aprovação. A chave da Claude API fica em Secret Manager (Cloud Function), nunca no client.

---

## PWA — Instalação como App

Cada psicólogo tem seu próprio `manifest.json` com:
- `name`: nome da clínica
- `theme_color`: cor primária do psicólogo
- `icons`: logo do psicólogo

Botão "Instalar App" captura o evento `beforeinstallprompt` e exibe para o paciente e para o psicólogo.

---

## Google Calendar

- OAuth2 com escopo `calendar.events`
- Sessões criadas no admin → sincronizam para o Google Calendar do psicólogo via Cloud Function
- Eventos do Google → aparecem como bloqueios na agenda local
- Token trocado e armazenado só pela Cloud Function `conectarGoogleCalendar`, em `clinica_google_tokens/{psi_id}` — coleção sem regra de leitura para nenhum client, client secret do Google em Secret Manager

---

## Ética e Compliance

- Depoimentos **sempre anônimos** — nunca nome, foto ou qualquer identificação
- Psicólogo aprova cada depoimento antes de publicar
- No site central: apenas ⭐ média agregada — sem transcrever depoimentos
- Mensagens WhatsApp e formulários externos: nunca revelar foco clínico — rótulos neutros
- PDFs de laudos seguem CFP Resolução nº 06/2019
- Ver checklist completo de conformidade LGPD na seção de Segurança, no topo deste arquivo

---

## Padrões de Código

### React (CDN — sem bundler)
- `React.useState`, `React.useEffect` (sem destructuring — compatibilidade CDN)
- Módulos do admin que herdam de `app_core.js` podem usar `useState`, `useEffect` direto
- Ícones via `<Icon name="..." size={N}/>` (wrapper Lucide)
- Componente `TextAreaVoz` para textareas com ditado por voz
- Componente `Spinner` para loading

### Parsing de datas
Strings `YYYY-MM-DD` sempre `+ 'T12:00:00'` para evitar bug UTC midnight.

### Autenticação
Sempre Firebase Authentication (ver REGRA 9). Nunca senha em campo de Firestore, nunca senha padrão compartilhada.

### PDFs
Via `window.open` + `print()` com CSS de impressão.

---

## Publicação de Arquivos Grandes

Quando o arquivo for grande demais para colar no editor web do GitHub, usar **GitHub REST API via Python**:

```python
import urllib.request, json, base64, time

TOKEN = "ghp_..."         # Token clássico com escopo 'repo' — deletar após uso
REPO  = "luciakratz-arch/psicoworking"
PATH  = "psi/admin/app_main.compiled.js"

# 1. GET para obter o SHA atual do arquivo
req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/contents/{PATH}",
    headers={"Authorization": f"token {TOKEN}"}
)
try:
    res = json.loads(urllib.request.urlopen(req).read())
    sha = res["sha"]
except: sha = None          # arquivo novo: omitir sha no PUT

# 2. PUT para sobrescrever
with open("arquivo_local.js", "rb") as f:
    content = base64.b64encode(f.read()).decode()

body = {"message": "update", "content": content}
if sha: body["sha"] = sha

req2 = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/contents/{PATH}",
    data=json.dumps(body).encode(),
    headers={"Authorization": f"token {TOKEN}", "Content-Type": "application/json"},
    method="PUT"
)
urllib.request.urlopen(req2)
time.sleep(0.4)             # evitar rate limiting entre múltiplos arquivos
```

**Regras do token:**
- Sempre token clássico, escopo `repo` apenas
- Gerar em `github.com/settings/tokens`
- Deletar imediatamente após o uso — nunca deixar salvo

---

## Gotchas Conhecidos

- Babel DEVE usar `{runtime:'classic'}` — sem isso o output começa com `import` e quebra no browser
- Nunca `.orderBy()` no Firestore — sempre `.sort()` client-side
- `paciente/app.js` usa Babel CDN inline (`text/babel`) — não precisa compilar
- `psi_id` ausente em qualquer query = bug crítico de segurança multi-tenant (e agora também bloqueado pela Firestore Rule)
- `psi_config` deve ser carregado antes de renderizar qualquer página do psicólogo
- PWA: `manifest.json` e `service-worker.js` devem ser servidos da raiz do subpath do psicólogo
- `app_core.js` segura TODAS as declarações globais (`const { useState, useEffect } = React`, `const db = firebase.firestore()`) — módulos subsequentes NÃO redeclaram essas variáveis, jamais
- Parsing de datas: `YYYY-MM-DD` direto produz NaN — sempre `+ 'T12:00:00'`
- Cache busting após publicar: **aba anônima + Ctrl+Shift+R** — aba normal não limpa cache de service worker
- Busca no codebase: `grep -rn "termo" psi/admin/ --include="*.js" | grep -v "// "` para filtrar comentários
- **NUNCA criar botões de ação destrutiva em massa** (deletar tudo, limpar base, higienizar) — lição aprendida com deleção acidental de dados de pacientes; qualquer ação irreversível exige confirmação dupla com digitação do texto "CONFIRMAR"
- **NUNCA guardar senha em campo de Firestore, nunca criar fallback de senha padrão** — ver seção Segurança no topo

---

## Pessoas do Projeto

| Nome | Papel |
|---|---|
| Lucia Kratz | Proprietária, Admin Matriz, desenvolvedora |
| Psicólogo contratante | Cliente do SaaS — gerencia sua clínica |
| Paciente | Usuário final do portal |

---

## Templates e Prompts Salvos

- **`PROMPT_PWA_INSTALACAO.md`** — fluxo completo de instalação PWA com placeholders `#COR_HEX` e `portal/` — reutilizar para cada psicólogo
- **`MENSAGEM_USUARIO_INSTALAR_APP.md`** — mensagem WhatsApp para orientar paciente a instalar o app como atalho — adaptar com nome da clínica

---

## Fluxo de Trabalho Esperado

1. Ler este arquivo antes de qualquer ação
2. Verificar o arquivo atual no repositório antes de editar
3. Confirmar escopo com a Lucia antes de tocar qualquer arquivo
4. Para UI: mostrar esboço textual e aguardar aprovação
5. Compilar com Babel (`{runtime:'classic'}`) e validar zero `import` no output
6. Entregar fonte + compilado, completos
7. Indicar qual `?v=N` incrementar no `admin/index.html`
8. Uma etapa por vez — só avançar após confirmação
9. Falar com a Lucia sempre em português do Brasil (REGRA 10)
