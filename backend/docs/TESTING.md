# TESTING.md

Documentação de testes do backend **Farmácia Santa Casa**.

Este ficheiro descreve a estratégia de testes, a estrutura atual, os comandos disponíveis, o que já está coberto e o que ainda não representa cobertura total.

---

## 1. Estado atual

O backend já tem testes automatizados com:

- **Vitest** como test runner;
- **Supertest** para testes E2E/API;
- **Prisma** nos testes de integração dos jobs.

Comandos validados nesta fase:

```bash
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm audit
```

Estado atual:

```txt
Unit tests        ✅ passam
Integration tests ✅ passam
E2E tests         ✅ passam
npm audit         ✅ 0 vulnerabilidades
```

Importante: isto **não significa cobertura de 100%**. Significa que existe uma base sólida de testes automatizados para continuar o projeto com mais segurança.

---

## 2. Objetivo dos testes

O objetivo dos testes é garantir que o backend mantém as regras de negócio corretas ao longo do tempo.

Os testes devem proteger principalmente:

- autenticação;
- permissões por role;
- criação e gestão de utentes;
- receitas;
- medicamentos não sujeitos a receita médica;
- Vendas Suspensas;
- pedidos;
- validação e rejeição pela Farmácia;
- regularizações;
- jobs de manutenção;
- erros esperados;
- integridade dos dados na base de dados.

---

## 3. Ferramentas usadas

### Vitest

Usado para:

- testes unitários;
- testes de integração;
- testes de jobs;
- assertions;
- execução em modo watch ou modo único.

### Supertest

Usado para:

- testar endpoints Express;
- simular requests HTTP;
- validar cookies;
- validar respostas JSON;
- validar permissões por role.

---

## 4. Configuração do Vitest

Ficheiro:

```txt
vitest.config.mjs
```

Configuração atual:

```js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.js"],
    testTimeout: 30000,
    hookTimeout: 30000,
    clearMocks: true,
    restoreMocks: true,
  },
});
```

Como `globals: true` está ativo, os testes podem usar diretamente:

```js
describe()
it()
expect()
beforeAll()
afterAll()
```

sem importar de `vitest`.

---

## 5. Estrutura atual dos testes

```txt
backend/
└── tests/
    ├── e2e/
    │   ├── auth.e2e.test.js
    │   ├── farmacia.e2e.test.js
    │   ├── manutencao.e2e.test.js
    │   └── santacasa.e2e.test.js
    ├── fixtures/
    │   ├── users.fixture.js
    │   └── utentes.fixture.js
    ├── helpers/
    │   ├── app.js
    │   └── auth.js
    ├── integration/
    │   └── jobs/
    │       ├── higiene.job.test.js
    │       ├── purgeHistory.job.test.js
    │       └── receitaExpiry.job.test.js
    └── unit/
        ├── mappers/
        ├── utils/
        └── validators/
```

---

## 6. Scripts no package.json

Scripts automatizados:

```json
{
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:unit": "vitest tests/unit",
  "test:integration": "vitest tests/integration",
  "test:e2e": "vitest tests/e2e"
}
```

Scripts manuais mantidos:

```json
{
  "test:api": "node scripts/test-current-api.js",
  "test:receita-expiry": "node scripts/test-receita-expiry-job.js",
  "test:higiene": "node scripts/test-higiene-job.js",
  "test:purge-history": "node scripts/test-purge-history-job.js",
  "test:manual": "npm run test:api && npm run test:receita-expiry && npm run test:higiene && npm run test:purge-history"
}
```

---

## 7. Como correr testes

### 7.1 Todos os testes em modo watch

```bash
npm test
```

### 7.2 Unit tests

```bash
npm run test:unit
```

Sem watch:

```bash
npm run test:unit -- --run
```

### 7.3 Integration tests

```bash
npm run test:integration
```

Sem watch:

```bash
npm run test:integration -- --run
```

### 7.4 E2E tests

```bash
npm run test:e2e
```

Sem watch:

```bash
npm run test:e2e -- --run
```

### 7.5 Validação recomendada antes de commit/deploy

```bash
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm audit
```

---

## 8. Unit tests

Pasta:

```txt
tests/unit/
```

Servem para testar funções pequenas e isoladas.

Cobrem atualmente:

- validators;
- mappers;
- utils.

---

## 8.1 Validators cobertos

```txt
tests/unit/validators/
├── adminUsers.validators.test.js
├── auth.validators.test.js
├── extras.validators.test.js
├── farmacia.validators.test.js
├── pedidos.validators.test.js
├── receitas.validators.test.js
├── regularizacoes.validators.test.js
├── semReceita.validators.test.js
└── utentes.validators.test.js
```

### O que estes testes validam

- `numero9` com exatamente 9 dígitos;
- `numero19` com exatamente 19 dígitos;
- `pinAcesso6` com exatamente 6 dígitos;
- `pinOpcao4` com exatamente 4 dígitos;
- quantidades inteiras e maiores que 0;
- datas de validade futuras;
- normalização de texto;
- aliases aceites por payload;
- tipos de pedido válidos;
- status válidos;
- paginação;
- filtros;
- mensagens de erro esperadas.

---

## 8.2 Mappers cobertos

```txt
tests/unit/mappers/
├── extras.mappers.test.js
├── pedidos.mappers.test.js
├── receitas.mappers.test.js
├── regularizacoes.mappers.test.js
├── semReceita.mappers.test.js
└── utentes.mappers.test.js
```

### O que estes testes validam

- DTOs devolvidos pela API;
- cálculo de quantidade restante;
- quantidade reservada pendente;
- quantidade regularizada;
- quantidade cancelada;
- campos de auditoria;
- relações opcionais;
- comportamento com `null`/`undefined`;
- estrutura esperada para frontend.

---

## 8.3 Utils cobertas

```txt
tests/unit/utils/
├── normalize.test.js
├── pagination.test.js
└── smoke.test.js
```

### O que estes testes validam

- normalização de texto;
- remoção de acentos;
- limpeza de IDs;
- paginação;
- cálculo de metadata de paginação;
- configuração base do Vitest.

O `smoke.test.js` pode ser mantido por agora. Pode ser removido mais tarde quando deixar de acrescentar valor.

---

## 9. Integration tests

Pasta:

```txt
tests/integration/
```

Os testes de integração atuais focam-se nos jobs críticos com Prisma/base de dados real.

```txt
tests/integration/jobs/
├── receitaExpiry.job.test.js
├── higiene.job.test.js
└── purgeHistory.job.test.js
```

---

## 9.1 Receita Expiry

Ficheiro:

```txt
tests/integration/jobs/receitaExpiry.job.test.js
```

Valida que o job:

- identifica linhas vencidas;
- marca linhas como `EXPIRADA`;
- cancela itens pendentes associados;
- cancela pedidos pendentes afetados;
- guarda razão de fecho.

---

## 9.2 Higiene

Ficheiro:

```txt
tests/integration/jobs/higiene.job.test.js
```

Valida que o job:

- identifica utentes removidos antigos;
- aplica marcador `[HIGIENE]`;
- respeita opções;
- é idempotente.

---

## 9.3 Purge History

Ficheiro:

```txt
tests/integration/jobs/purgeHistory.job.test.js
```

Valida que o job:

- remove pedidos fechados antigos;
- remove itens associados;
- remove dispensas associadas;
- remove regularizações concluídas antigas;
- remove eventos associados;
- é seguro para repetir.

---

## 9.4 Nota importante sobre base de dados

Atualmente os testes usam a `DATABASE_URL` configurada no `.env`.

Isto está aceitável nesta fase local, mas não é o ideal para uma fase mais profissional.

Recomendação futura:

```txt
.env.test
```

com uma base dedicada:

```env
NODE_ENV=test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_santacasa_test?schema=public"
AUTH_JWT_SECRET="test-secret-with-at-least-32-characters"
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=false
```

Vantagens:

- testes não sujam a base de desenvolvimento;
- reduz colisões de dados;
- facilita limpeza total antes/depois dos testes;
- melhora isolamento;
- reduz risco operacional.

---

## 10. E2E tests

Pasta:

```txt
tests/e2e/
```

Os E2E usam Supertest contra a app Express diretamente. Não é necessário arrancar `npm run dev`.

Helper usado:

```txt
tests/helpers/app.js
```

---

## 10.1 Auth E2E

Ficheiro:

```txt
tests/e2e/auth.e2e.test.js
```

Cobre:

- login de `ADMIN`;
- login de `SANTACASA`;
- login de `FARMACIA`;
- credenciais inválidas;
- sessão em falta;
- `/api/auth/me`;
- logout;
- rotas protegidas;
- bloqueios por role.

---

## 10.2 Santa Casa E2E

Ficheiro:

```txt
tests/e2e/santacasa.e2e.test.js
```

Cobre:

- acesso ao health da Santa Casa;
- bloqueio de Farmácia nas rotas da Santa Casa;
- criação de utente;
- listagem de utentes;
- consulta de utente por ID;
- arquivo de utente;
- reativação de utente;
- remoção lógica de utente;
- rejeição de `numero9` inválido;
- rejeição de duplicado por `numero9`;
- dashboard/sinais.

---

## 10.3 Farmácia E2E

Ficheiro:

```txt
tests/e2e/farmacia.e2e.test.js
```

Cobre:

- acesso ao health da Farmácia;
- bloqueio de Santa Casa nas rotas da Farmácia;
- listagem de pedidos;
- validação de pedido pendente;
- rejeição de pedido pendente;
- bloqueio de validação de pedido já rejeitado;
- dashboard/sinais;
- sinal de regularizações.

---

## 10.4 Manutenção E2E

Ficheiro:

```txt
tests/e2e/manutencao.e2e.test.js
```

Cobre:

- bloqueio sem sessão;
- bloqueio de `SANTACASA`;
- bloqueio de `FARMACIA`;
- acesso de `ADMIN`;
- listagem de jobs;
- preview de `receita-expiry`;
- preview de `higiene`;
- preview de `purge-history`;
- validação de parâmetros inválidos.

Não executa endpoints `run`, porque esses alteram/apagam dados reais.

---

## 11. Fixtures

Pasta:

```txt
tests/fixtures/
```

Ficheiros atuais:

```txt
users.fixture.js
utentes.fixture.js
```

### `users.fixture.js`

Centraliza credenciais dos utilizadores seed:

- `admin`;
- `santacasa`;
- `farmacia`.

### `utentes.fixture.js`

Gera payloads únicos para criação de utentes.

Evita colisões por:

- `numero9`;
- `nome`.

---

## 12. Helpers

Pasta:

```txt
tests/helpers/
```

Ficheiros atuais:

```txt
app.js
auth.js
```

### `app.js`

Responsável por importar `createApp` e devolver a app Express para Supertest.

### `auth.js`

Responsável por criar agentes autenticados:

```js
createAdminAgent(app)
createSantaCasaAgent(app)
createFarmaciaAgent(app)
```

Isto evita repetir login em todos os E2E.

---

## 13. Scripts manuais

Além dos testes Vitest, existem scripts manuais em:

```txt
scripts/
```

Scripts atuais:

```txt
scripts/test-current-api.js
scripts/test-higiene-job.js
scripts/test-purge-history-job.js
scripts/test-receita-expiry-job.js
```

Comandos:

```bash
npm run test:api
npm run test:receita-expiry
npm run test:higiene
npm run test:purge-history
npm run test:manual
```

---

## 14. Quando usar scripts manuais vs testes automatizados

### Usar scripts manuais quando:

- queres validar rapidamente um fluxo completo;
- queres testar o backend com servidor HTTP real;
- estás a diagnosticar comportamento no terminal;
- queres executar um smoke test local;
- estás a validar um job manualmente.

### Usar testes automatizados quando:

- a regra já está definida;
- queres evitar regressões;
- vais fazer commit;
- vais fazer deploy;
- precisas de integração com CI;
- queres testes repetíveis.

---

## 15. Cuidados com scripts manuais

Os scripts manuais criam dados reais e podem alterar a base definida em `DATABASE_URL`.

Regras:

- não correr contra produção;
- confirmar `.env` antes de correr;
- confirmar `DATABASE_URL`;
- para `test:api`, manter `npm run dev` ligado;
- para jobs, preferir preview quando disponível;
- não usar scripts manuais como substituto dos testes Vitest.

---

## 16. Convenções de nomes

O padrão usado atualmente é:

```txt
*.test.js
```

Organizado por pasta:

```txt
tests/unit/validators/*.test.js
tests/unit/mappers/*.test.js
tests/unit/utils/*.test.js
tests/integration/jobs/*.test.js
tests/e2e/*.e2e.test.js
```

Não é necessário usar nomes como `*.unit.test.js`, porque a pasta já identifica o tipo de teste.

---

## 17. Checklist antes de criar um teste

Antes de escrever um teste:

- [ ] Saber que regra está a ser testada.
- [ ] Confirmar o comportamento esperado.
- [ ] Confirmar o erro esperado.
- [ ] Preparar dados mínimos.
- [ ] Evitar depender de dados manuais existentes.
- [ ] Garantir que o teste é repetível.
- [ ] Garantir que não usa produção.
- [ ] Dar nome claro ao teste.
- [ ] Fazer cleanup quando criar dados diretamente na base.
- [ ] Usar fixtures/helpers quando houver repetição.

---

## 18. Checklist antes de correr testes

- [ ] Confirmar que estás dentro de `backend`.
- [ ] Confirmar `.env`.
- [ ] Confirmar que `DATABASE_URL` não aponta para produção.
- [ ] Confirmar que o seed já foi corrido quando necessário.
- [ ] Confirmar Prisma Client gerado.
- [ ] Correr testes.
- [ ] Confirmar `npm audit`.

Comandos:

```bash
npx prisma generate
npx prisma db seed
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm audit
```

---

## 19. Fluxos críticos já parcialmente cobertos

### Autenticação

Coberto:

- login válido;
- login inválido;
- cookie HTTP-only;
- sessão em falta;
- `/api/auth/me`;
- logout.

### Autorização

Coberto:

- Santa Casa bloqueada na Farmácia;
- Farmácia bloqueada na Santa Casa;
- Santa Casa/Farmácia bloqueadas em manutenção;
- Admin autorizado em manutenção.

### Utentes

Coberto:

- criação;
- listagem;
- consulta;
- arquivo;
- reativação;
- remoção lógica;
- duplicado por `numero9`;
- payload inválido.

### Pedidos/Farmácia

Coberto:

- criação de pedido por Santa Casa em fluxos E2E;
- listagem pela Farmácia;
- validação;
- rejeição;
- bloqueio de validação após rejeição.

### Jobs

Coberto:

- `receita-expiry`;
- `higiene`;
- `purge-history`;
- previews em manutenção;
- permissões dos endpoints de manutenção.

---

## 20. Fluxos críticos ainda por aprofundar

Ainda faltam testes profundos para:

### Services

```txt
src/modules/utentes/utentes.service.js
src/modules/receitas/receitas.service.js
src/modules/pedidos/pedidos.service.js
src/modules/farmacia/farmacia.service.js
src/modules/regularizacoes/regularizacoes.service.js
```

### Regras de negócio críticas

- FEFO;
- reservas pendentes;
- regularizações parciais;
- bloqueio de utente arquivado/removido em todos os módulos;
- pedido com quantidade superior ao disponível;
- receita expirada em criação de pedido;
- venda suspensa em estado inválido;
- histórico com filtros avançados;
- Admin users E2E completo;
- rollback/transações;
- ids inexistentes;
- estados inválidos.

---

## 21. Más práticas a evitar

Evitar:

- testar contra produção;
- depender de dados criados manualmente;
- deixar scripts `debug.js` soltos na raiz;
- criar testes enormes que validam tudo ao mesmo tempo;
- escrever testes sem cleanup quando criam dados diretos;
- testar só casos felizes;
- ignorar erros esperados;
- correr jobs destrutivos sem preview;
- commitar `.env` real;
- guardar passwords reais em fixtures;
- alterar backend só para satisfazer um teste errado.

---

## 22. Critério mínimo antes de commit

Antes de commit:

```bash
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm audit
```

Confirmar:

- [ ] todos os testes passam;
- [ ] `npm audit` devolve 0 vulnerabilidades;
- [ ] `.env` não aparece no Git;
- [ ] `package-lock.json` está atualizado;
- [ ] documentação está atualizada se houve alteração estrutural;
- [ ] novos testes têm nomes claros;
- [ ] testes não dependem de valores fixos que colidem facilmente.

---

## 23. Critério mínimo antes de deploy

Antes de considerar deploy:

- [ ] login testado;
- [ ] roles testadas;
- [ ] utentes testados;
- [ ] criação de receitas testada;
- [ ] criação de pedidos testada;
- [ ] validação pela Farmácia testada;
- [ ] rejeição pela Farmácia testada;
- [ ] regularizações testadas;
- [ ] jobs testados localmente;
- [ ] CORS/cookies testados com frontend;
- [ ] `.env` de produção validado;
- [ ] migrations preparadas;
- [ ] backups considerados para jobs destrutivos;
- [ ] `npm audit` sem vulnerabilidades conhecidas.

---

## 24. Coverage futuro

Ainda não foi configurado relatório de coverage.

Quando fizer sentido medir cobertura real:

```bash
npm install -D @vitest/coverage-v8
```

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "test:coverage": "vitest --coverage"
  }
}
```

Correr:

```bash
npm run test:coverage
```

Atenção: coverage alto não garante qualidade. O objetivo não é chegar a 100% artificialmente, mas cobrir regras críticas.

---

## 25. Prioridade futura de testes

Não é necessário tentar chegar a 100% agora.

Prioridade recomendada:

```txt
1. Services críticos
2. FEFO
3. Regularizações parciais
4. Admin users E2E completo
5. Histórico com filtros avançados
6. Base de dados isolada de teste
7. Coverage report
```

---

## 26. Resumo final

A pasta `tests/` é a fonte principal de testes automatizados.

A pasta `scripts/` mantém scripts manuais/smoke tests úteis.

A pasta `scripts/manual/` deve ficar reservada para scripts temporários, auxiliares ou de debug.

A base atual de testes cobre:

- validators;
- mappers;
- utils;
- autenticação;
- permissões;
- fluxos básicos da Santa Casa;
- fluxos básicos da Farmácia;
- manutenção;
- jobs críticos.

Ainda não existe cobertura total, mas o backend está num nível adequado para fechar esta fase e avançar para o frontend.
