# Testes das regras de segurança

Provam que uma clínica não enxerga a outra, que paciente não lê prontuário e que
visitante sem login não lê nada. Usam um banco de mentira no computador.

Rodar (na pasta `psicoworking`): `npm run testar-regras`

Precisa de Java instalado (o simulador do Firebase exige). Na primeira vez:
`cd testes-regras && npm install`.

Rode sempre antes de publicar mudanças em `firestore.rules`.
