# TESTING.md

Documentação de testes do backend **Farmácia Santa Casa**.

Este ficheiro define como testar o backend, que tipos de testes devem existir, que fluxos são críticos e que estrutura deve ser usada para manter os testes organizados.

---

## 1. Objetivo

O objetivo dos testes é garantir que o backend mantém as regras de negócio corretas ao longo do tempo.

Os testes devem validar:

- autenticação;
- permissões por role;
- criação e gestão de utentes;
- receitas;
- medicamentos não sujeitos a receita médica;
- vendas suspensas;
- pedidos;
- validação e rejeição pela Farmácia;
- regularizações;
- jobs de manutenção;
- erros esperados;
- integridade dos dados na base de dados.

---

## 2. Tipos de testes recomendados

O backend deve ter três níveis principais de teste:

```txt
tests/
├── unit/
├── integration/
└── e2e/
```

---

## 2.1 Testes unitários

Pasta:

```txt
tests/unit/
```

Servem para testar funções pequenas e isoladas.

Prioridade:

- validators;
- mappers;
- utils;
- funções puras de cálculo.

Exemplos:

```txt
tests/unit/validators/
tests/unit/mappers/
tests/unit/utils/
```

### Bons candidatos para testes unitários

```txt
src/modules/utentes/utentes.validators.js
src/modules/pedidos/pedidos.validators.js
src/modules/receitas/receitas.validators.js
src/modules/extras/extras.validators.js
src/modules/sem-receita/semReceita.validators.js
src/modules/regularizacoes/regularizacoes.validators.js
src/shared/utils/normalize.js
src/shared/utils/pagination.js
```

### Exemplo de casos a testar

- `numero9` deve ter exatamente 9 dígitos.
- `numero19` deve ter exatamente 19 dígitos.
- `pinAcesso6` deve ter exatamente 6 dígitos.
- `pinOpcao4` deve ter exatamente 4 dígitos.
- Quantidades devem ser inteiras e maiores que 0.
- Datas de validade devem ser futuras.
- Pesquisa não deve aceitar strings maiores que o limite definido.
- Tipos inválidos de pedido devem falhar.

---

## 2.2 Testes de integração

Pasta:

```txt
tests/integration/
```

Servem para testar serviços e repositórios com base de dados real de teste.

Prioridade:

```txt
tests/integration/services/
tests/integration/repositories/
```

### Bons candidatos

```txt
src/modules/utentes/utentes.service.js
src/modules/receitas/receitas.service.js
src/modules/pedidos/pedidos.service.js
src/modules/farmacia/farmacia.service.js
src/modules/regularizacoes/regularizacoes.service.js
src/jobs/receitaExpiry.job.js
src/jobs/higiene.job.js
src/jobs/purgeHistory.job.js
```

### O que validar

- criação real de dados;
- conflitos de duplicados;
- transações;
- reservas pendentes;
- decrementos/incrementos de quantidades;
- alteração de estados;
- bloqueios por utente arquivado/removido;
- efeitos dos jobs.

---

## 2.3 Testes E2E

Pasta:

```txt
tests/e2e/
```

Servem para testar a API como o frontend a usa.

Devem fazer requests HTTP reais à app Express.

Exemplos:

```txt
tests/e2e/auth.e2e.test.js
tests/e2e/santacasa.e2e.test.js
tests/e2e/farmacia.e2e.test.js
tests/e2e/admin.e2e.test.js
tests/e2e/manutencao.e2e.test.js
```

### O que validar

- login;
- cookie de sessão;
- acesso a rotas protegidas;
- bloqueio por role errada;
- criação de entidades;
- fluxo completo de pedido;
- validação pela Farmácia;
- rejeição pela Farmácia;
- execução manual de jobs por ADMIN.

---

## 3. Estrutura recomendada

```txt
backend/
├── tests/
│   ├── unit/
│   │   ├── validators/
│   │   ├── mappers/
│   │   └── utils/
│   ├── integration/
│   │   ├── services/
│   │   └── repositories/
│   ├── e2e/
│   ├── fixtures/
│   └── helpers/
├── scripts/
│   ├── manual/
│   ├── test-current-api.js
│   ├── test-higiene-job.js
│   ├── test-purge-history-job.js
│   └── test-receita-expiry-job.js
└── docs/
    └── TESTING.md
```

---

## 4. Ferramentas recomendadas

O backend atual ainda não inclui runner de testes profissional.

Recomendação:

```bash
npm install -D vitest supertest
```

### Vitest

Usado para:

- testes unitários;
- testes de integração;
- testes de jobs;
- assertions.

### Supertest

Usado para:

- testar endpoints Express;
- simular requests HTTP;
- validar cookies;
- validar responses.

---

## 5. Scripts recomendados no package.json

Adicionar futuramente:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:unit": "vitest tests/unit",
    "test:integration": "vitest tests/integration",
    "test:e2e": "vitest tests/e2e"
  }
}
```

Manter os scripts manuais existentes:

```json
{
  "scripts": {
    "test:api": "node scripts/test-current-api.js",
    "test:receita-expiry": "node scripts/test-receita-expiry-job.js",
    "test:higiene": "node scripts/test-higiene-job.js",
    "test:purge-history": "node scripts/test-purge-history-job.js"
  }
}
```

---

## 6. Base de dados de teste

Nunca usar a base de dados de desenvolvimento ou produção para testes automatizados.

Criar uma base dedicada:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/farmacia_santacasa_test"
```

Recomendação futura:

```txt
.env.test
```

Exemplo:

```env
NODE_ENV=test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_santacasa_test"
AUTH_JWT_SECRET="test-secret-with-at-least-32-characters"
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
ALLOWED_ORIGINS=http://localhost:5173
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=false
```

### Regra importante

Em testes automatizados, os jobs automáticos devem estar desligados por defeito:

```env
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=false
```

Os jobs devem ser testados manualmente chamando `runOnce()`.

---

## 7. Preparação de dados

Usar `tests/fixtures/` para dados reutilizáveis.

Exemplo:

```txt
tests/fixtures/
├── users.fixture.js
├── utentes.fixture.js
├── receitas.fixture.js
├── pedidos.fixture.js
└── regularizacoes.fixture.js
```

### Dados mínimos recomendados

- 1 utilizador ADMIN;
- 1 utilizador SANTACASA;
- 1 utilizador FARMACIA;
- 1 utente ativo;
- 1 utente arquivado;
- 1 receita ativa;
- 1 receita expirada;
- 1 medicamento não sujeito a receita médica;
- 1 venda suspensa;
- 1 pedido pendente.

---

## 8. Helpers recomendados

Pasta:

```txt
tests/helpers/
```

Exemplos:

```txt
tests/helpers/db.js
tests/helpers/auth.js
tests/helpers/app.js
tests/helpers/factories.js
```

### `db.js`

Responsável por:

- limpar tabelas;
- fazer seed de teste;
- desligar Prisma depois dos testes.

### `auth.js`

Responsável por:

- fazer login;
- devolver cookie de sessão;
- criar sessão por role.

### `app.js`

Responsável por:

- importar `createApp`;
- devolver app Express para Supertest.

### `factories.js`

Responsável por:

- criar utentes;
- criar receitas;
- criar medicamentos;
- criar vendas suspensas;
- criar pedidos.

---

## 9. Ordem recomendada de implementação dos testes

Não comeces por E2E complexos.

Ordem ideal:

```txt
1. Testes unitários de validators
2. Testes unitários de mappers
3. Testes de serviços críticos
4. Testes dos jobs
5. Testes E2E dos fluxos principais
```

---

## 10. Primeiros testes a criar

### 10.1 Validators

Prioridade alta:

```txt
tests/unit/validators/utentes.validators.test.js
tests/unit/validators/receitas.validators.test.js
tests/unit/validators/pedidos.validators.test.js
tests/unit/validators/extras.validators.test.js
tests/unit/validators/semReceita.validators.test.js
```

### 10.2 Mappers

```txt
tests/unit/mappers/receitas.mappers.test.js
tests/unit/mappers/pedidos.mappers.test.js
tests/unit/mappers/extras.mappers.test.js
tests/unit/mappers/semReceita.mappers.test.js
```

### 10.3 Services

```txt
tests/integration/services/utentes.service.test.js
tests/integration/services/receitas.service.test.js
tests/integration/services/pedidos.service.test.js
tests/integration/services/farmacia.service.test.js
```

### 10.4 Jobs

```txt
tests/integration/jobs/receitaExpiry.job.test.js
tests/integration/jobs/higiene.job.test.js
tests/integration/jobs/purgeHistory.job.test.js
```

### 10.5 E2E

```txt
tests/e2e/auth.e2e.test.js
tests/e2e/santacasa.e2e.test.js
tests/e2e/farmacia.e2e.test.js
tests/e2e/admin.e2e.test.js
```

---

## 11. Fluxos críticos a testar

## 11.1 Autenticação

### Deve permitir login válido

Fluxo:

1. enviar email/password corretos;
2. receber `200`;
3. receber cookie de sessão;
4. receber dados públicos do utilizador.

### Deve rejeitar login inválido

Fluxo:

1. enviar password errada;
2. receber `401`;
3. não receber cookie válido.

### Deve bloquear utilizador inativo

Fluxo:

1. criar user inativo;
2. tentar login;
3. receber `401`.

---

## 11.2 Autorização

Testar:

- SANTACASA não deve aceder a `/api/farmacia`;
- FARMACIA não deve aceder a `/api/santacasa`;
- utilizador sem login não deve aceder a rotas protegidas;
- ADMIN deve aceder a todas as áreas protegidas.

---

## 11.3 Utentes

### Criar utente

Casos:

- sucesso com `numero9` válido;
- erro com `numero9` inválido;
- erro com nome vazio;
- erro se número já existir;
- erro se nome já existir.

### Arquivar utente

Casos:

- sucesso se não houver pendências abertas;
- erro se houver receita ativa com quantidade restante;
- erro se houver medicamento não sujeito a receita médica disponível;
- erro se houver venda suspensa em aberto;
- erro se houver regularização em aberto;
- erro se houver pedido pendente.

### Reativar utente

Casos:

- sucesso se estiver arquivado;
- erro se já estiver ativo.

### Remover utente

Casos:

- sucesso se não tiver dados associados;
- erro se tiver receitas;
- erro se tiver pedidos;
- erro se tiver regularizações;
- erro se já estiver removido.

---

## 11.4 Receitas

### Criar receita

Casos:

- sucesso com `numero19`, `pinAcesso6`, `pinOpcao4` e linhas válidas;
- erro se `numero19` não tiver 19 dígitos;
- erro se `pinAcesso6` não tiver 6 dígitos;
- erro se `pinOpcao4` não tiver 4 dígitos;
- erro se validade for passada;
- erro se repetir medicamento na mesma receita;
- erro se a receita já existir.

### Listar receitas

Casos:

- só deve devolver linhas ativas;
- só deve devolver linhas com quantidade restante;
- deve descontar quantidade já dispensada;
- deve descontar quantidade reservada em pedidos pendentes.

### Remover linha de receita

Casos:

- sucesso se não tiver uso;
- erro se tiver dispensas;
- erro se estiver associada a pedido;
- erro se já tiver regularizações;
- se for a última linha, deve remover também a receita.

---

## 11.5 Medicamentos não sujeitos a receita médica

### Criar

Casos:

- sucesso com medicamento e quantidade válida;
- se já existir medicamento igual para o utente, deve incrementar quantidade;
- erro se medicamento vazio;
- erro se quantidade inválida.

### Listar

Casos:

- só deve devolver itens com quantidade restante;
- deve descontar quantidade reservada em pedidos pendentes.

### Remover

Casos:

- sucesso se não estiver associado a pedidos;
- erro se já estiver associado a pedidos;
- erro se não pertencer ao utente.

---

## 11.6 Vendas Suspensas

### Criar

Casos:

- sucesso se não existir receita ativa disponível para o mesmo medicamento;
- erro se já existir receita ativa com quantidade disponível;
- erro se já existir venda suspensa aberta para o mesmo medicamento;
- erro se medicamento vazio;
- erro se quantidade inválida.

### Listar

Casos:

- só deve devolver vendas suspensas em aberto;
- só deve devolver vendas com quantidade restante;
- deve descontar quantidade regularizada;
- deve descontar quantidade cancelada;
- deve descontar quantidade reservada em pedidos pendentes.

### Remover

Casos:

- sucesso se não estiver associada a pedidos;
- erro se já estiver associada a pedidos;
- erro se não pertencer ao utente.

---

## 11.7 Pedidos

### Criar pedido

Casos:

- sucesso com item de receita;
- sucesso com medicamento não sujeito a receita médica;
- sucesso com venda suspensa;
- erro se item não pertencer ao utente;
- erro se quantidade exceder disponível;
- erro se receita estiver expirada;
- erro se linha não estiver ativa;
- erro se venda suspensa não estiver em aberto;
- erro se tipo de item for inválido;
- erro se pedido não tiver itens.

### Regra FEFO

Testar:

- se existir receita do mesmo medicamento com validade mais próxima, deve bloquear usar uma validade mais distante;
- se a receita mais próxima não tiver quantidade disponível, deve permitir a seguinte;
- se a receita mais próxima já estiver totalmente reservada no mesmo pedido, deve permitir a seguinte.

### Cancelar pedido

Casos:

- sucesso se pedido estiver pendente;
- erro se pedido já estiver validado;
- erro se pedido já estiver rejeitado;
- erro se pedido não existir.

---

## 11.8 Farmácia

### Listar pedidos

Casos:

- listar pendentes por defeito;
- filtrar por status;
- pesquisar por número de pedido;
- pesquisar por utente;
- pesquisar por medicamento;
- filtrar por datas.

### Validar pedido

Casos:

- sucesso com item de receita;
- sucesso com medicamento não sujeito a receita médica;
- sucesso com venda suspensa;
- deve criar dispensa para receita;
- deve incrementar quantidade dispensada na linha;
- deve decrementar quantidade de medicamento não sujeito a receita médica;
- deve criar regularização quando validar venda suspensa;
- deve marcar itens como `VALIDADO`;
- deve marcar pedido como `VALIDADO`;
- deve guardar `validatedAt` e `validatedById`.

### Rejeitar pedido

Casos:

- sucesso se pedido estiver pendente;
- deve marcar itens como `REJEITADO`;
- deve marcar pedido como `REJEITADO`;
- deve guardar motivo em `closedReason`;
- deve guardar `rejectedAt` e `rejectedById`.

---

## 11.9 Regularizações

### Listar pendentes

Casos:

- deve listar `PENDENTE` e `PARCIALMENTE_REGULARIZADO`;
- deve calcular quantidade restante;
- deve permitir filtrar por utente;
- deve permitir filtrar por medicamento;
- deve permitir pesquisar por utente, receita, pedido e medicamento.

### Listar histórico

Casos:

- deve listar apenas `REGULARIZADO`;
- deve ordenar por atualização mais recente;
- deve incluir eventos.

### Aplicação automática ao criar receita

Casos:

- criar receita com medicamento que regulariza venda suspensa deve exigir confirmação;
- com confirmação, deve aplicar regularização;
- deve criar eventos;
- deve incrementar quantidade regularizada;
- deve incrementar quantidade dispensada da linha de receita;
- deve marcar regularização como `REGULARIZADO` quando completa;
- deve marcar como `PARCIALMENTE_REGULARIZADO` se a quantidade não chegar.

---

## 11.10 Jobs

### Receita Expiry

Casos:

- deve expirar linhas vencidas;
- deve cancelar itens pendentes associados;
- deve cancelar pedidos pendentes afetados;
- não deve afetar linhas já expiradas;
- não deve afetar receitas futuras.

### Higiene

Casos:

- deve encontrar utentes removidos antigos;
- deve ignorar utentes sem `deletedAt`;
- deve ignorar utentes já marcados com `[HIGIENE]`;
- deve aplicar anonimização apenas se ambas as flags estiverem ativas.

### Purge History

Casos:

- deve remover pedidos fechados antigos;
- deve remover itens e dispensas associadas;
- deve remover regularizações concluídas antigas;
- deve remover eventos associados;
- não deve remover pedidos pendentes;
- não deve remover regularizações pendentes;
- deve desvincular regularizações de pedidos removidos quando necessário.

---

# 12. Scripts manuais

O projeto tem scripts manuais referenciados no `package.json`.

Localização:

```txt
scripts/
```

Scripts existentes/recomendados:

```txt
scripts/test-current-api.js
scripts/test-higiene-job.js
scripts/test-purge-history-job.js
scripts/test-receita-expiry-job.js
```

Estes scripts são úteis para validar rapidamente fluxos sem instalar runner de testes.

### Regra

Scripts chamados diretamente pelo `package.json` devem ficar em:

```txt
scripts/
```

Scripts temporários/debug/ad hoc devem ficar em:

```txt
scripts/manual/
```

---

## 13. Quando usar scripts manuais vs testes automatizados

### Usar scripts manuais quando:

- estás a validar rapidamente um fluxo;
- estás a testar um job específico;
- ainda estás a desenvolver a regra;
- precisas de imprimir resultados no terminal;
- o teste ainda não está estável.

### Usar testes automatizados quando:

- a regra já está definida;
- o fluxo é crítico;
- queres evitar regressões;
- o mesmo teste será corrido muitas vezes;
- vais fazer deploy.

---

## 14. Convenções de nomes

### Testes unitários

```txt
*.unit.test.js
```

Exemplo:

```txt
utentes.validators.unit.test.js
```

### Testes de integração

```txt
*.integration.test.js
```

Exemplo:

```txt
pedidos.service.integration.test.js
```

### Testes E2E

```txt
*.e2e.test.js
```

Exemplo:

```txt
farmacia.e2e.test.js
```

---

## 15. Checklist antes de criar um teste

Antes de escrever um teste:

- [ ] Saber que regra está a ser testada.
- [ ] Confirmar o comportamento esperado.
- [ ] Confirmar o erro esperado.
- [ ] Preparar dados mínimos.
- [ ] Evitar depender de dados manuais existentes.
- [ ] Limpar dados depois do teste.
- [ ] Garantir que o teste é repetível.
- [ ] Garantir que não usa produção.
- [ ] Dar nome claro ao teste.

---

## 16. Checklist antes de correr testes

- [ ] Confirmar `NODE_ENV=test`.
- [ ] Confirmar `DATABASE_URL` de teste.
- [ ] Confirmar que não estás ligado à base de produção.
- [ ] Correr migrations na base de teste.
- [ ] Gerar Prisma Client.
- [ ] Criar seed de teste.
- [ ] Desligar jobs automáticos.
- [ ] Correr testes.
- [ ] Verificar se os dados foram limpos.

---

## 17. Ordem recomendada para começar agora

Como o projeto já tem documentação e estrutura inicial, a ordem prática é:

```txt
1. Confirmar scripts existentes
2. Criar .env.test
3. Instalar vitest e supertest
4. Criar helpers de teste
5. Criar primeiros testes unitários
6. Criar primeiros testes E2E
7. Criar testes de jobs
```

---

## 18. Primeira milestone de testes

Para uma primeira versão sólida, criar apenas estes:

```txt
tests/unit/validators/utentes.validators.test.js
tests/unit/validators/receitas.validators.test.js
tests/unit/validators/pedidos.validators.test.js
tests/e2e/auth.e2e.test.js
tests/e2e/santacasa.e2e.test.js
tests/e2e/farmacia.e2e.test.js
```

Isto já cobre uma parte importante do risco do backend.

---

## 19. Segunda milestone de testes

Depois avançar para:

```txt
tests/integration/services/receitas.service.test.js
tests/integration/services/pedidos.service.test.js
tests/integration/services/farmacia.service.test.js
tests/integration/jobs/receitaExpiry.job.test.js
tests/integration/jobs/higiene.job.test.js
tests/integration/jobs/purgeHistory.job.test.js
```

---

## 20. Más práticas a evitar

Evitar:

- testar contra a base de produção;
- depender de dados criados manualmente;
- deixar scripts `debug.js` soltos na raiz;
- criar testes enormes que validam tudo ao mesmo tempo;
- escrever testes sem limpar dados;
- testar só casos felizes;
- ignorar erros esperados;
- correr jobs destrutivos sem preview;
- commitar `.env` real;
- guardar passwords reais em fixtures.

---

## 21. Critério mínimo antes de deploy

Antes de considerar o backend seguro para deploy:

- [ ] Login testado.
- [ ] Roles testadas.
- [ ] Utentes testados.
- [ ] Criação de receitas testada.
- [ ] Criação de pedidos testada.
- [ ] Validação pela Farmácia testada.
- [ ] Rejeição pela Farmácia testada.
- [ ] Regularizações testadas.
- [ ] Jobs testados em ambiente local.
- [ ] CORS/cookies testados com frontend.
- [ ] `.env` de produção validado.

---

## 22. Resumo final

A pasta `tests/` deve ser usada para testes automatizados.

A pasta `scripts/` deve ser usada para scripts manuais ou comandos chamados diretamente pelo `package.json`.

A prioridade inicial deve ser testar validators, autenticação, permissões e fluxos principais de pedidos, porque são os pontos com maior impacto funcional.
