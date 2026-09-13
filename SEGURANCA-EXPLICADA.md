# O que foi feito para proteger os dados dos pacientes — explicado sem código

Este documento é para você, Lucia, ler e entender sem precisar saber programação.

## O problema que existia antes

No jeito que o projeto estava planejado originalmente:

1. **A senha do paciente ficava guardada junto com os outros dados dele**, tipo anotada num papel dentro da própria ficha. Qualquer pessoa com acesso técnico ao sistema conseguiria ler a senha de qualquer paciente.
2. **Existia uma senha "coringa" (1234)** que funcionaria para entrar caso o paciente não tivesse senha própria — uma porta destrancada.
3. **A separação entre um psicólogo e outro dependia só do bom comportamento do programa**, não de uma trava de verdade no banco de dados — como se cada psicólogo tivesse uma gaveta com etiqueta, mas sem cadeado; só um acordo de "não abrir a gaveta do outro".
4. **A senha do Google Agenda** (que permite ler/escrever na agenda pessoal do psicólogo) seria guardada de um jeito que, na prática, qualquer um que abrisse o site conseguiria ver.

## O que foi feito agora

1. **Login de verdade para todo mundo.** Psicólogo, secretária, paciente e você (Admin Matriz) entram com e-mail e senha através do sistema de login do Google Firebase — a mesma tecnologia de segurança usada por milhões de aplicativos. A senha nunca fica visível para ninguém, nem para mim, nem para a equipe da clínica.

2. **Cada paciente cria a própria senha.** Quando a secretária ou o psicólogo cadastra um paciente novo, o sistema manda um link para o paciente escolher a própria senha — ninguém mais fica sabendo qual é. Acabou a senha "1234".

3. **Cadeado de verdade entre as clínicas.** Agora existe uma trava no próprio banco de dados (chamada de "regra de segurança") que verifica, a cada tentativa de acesso, se a pessoa logada realmente pertence àquela clínica antes de deixar ver qualquer dado. Isso significa que, mesmo que alguém tente manipular o site pelo navegador, o banco de dados recusa mostrar dado de paciente de outro psicólogo.

4. **O token do Google Agenda fica escondido num cofre.** Ele passa a ser guardado numa parte do sistema que só o "servidor invisível" do próprio Google (chamado de Cloud Function) consegue acessar — nunca aparece no navegador de ninguém.

5. **Toda ação sensível fica registrada.** Se alguém criar, mudar ou tentar acessar um cadastro de paciente, isso fica anotado num registro de auditoria que só você, como Admin Matriz, pode consultar — como uma câmera de segurança que grava quem mexeu em quê.

## O que ainda falta (próximos passos recomendados)

- [ ] Escrever a **Política de Privacidade** do PsicoWorking (documento legal, explicando pra pacientes e psicólogos o que é feito com os dados deles)
- [ ] Colocar uma **tela de consentimento** no cadastro do paciente, perguntando se ele concorda com o uso dos dados
- [ ] Criar um jeito do paciente **pedir a exclusão dos próprios dados**, se quiser (é um direito garantido por lei)
- [ ] Definir quem é o **encarregado de proteção de dados** (pode ser você mesma ou alguém da equipe) — é uma exigência legal ter esse contato público
- [ ] Configurar **cópia de segurança automática** do banco de dados
- [ ] Testar o sistema de login com uma clínica de teste antes de qualquer psicólogo real usar

## Se quiser confirmar que está tudo certo

Você não precisa entender código nenhum para confiar nisso — mas se quiser, pode pedir para um técnico de sua confiança (ou até me pedir de novo em outra conversa) revisar o arquivo `firestore.rules` e o `functions/index.js`, que são as duas peças que seguram essa proteção.
