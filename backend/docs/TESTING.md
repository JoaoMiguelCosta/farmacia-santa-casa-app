# TESTING.md

Documentação de testes do backend **Farmácia Santa Casa**.

Este ficheiro descreve a estratégia de testes, a estrutura atual, os comandos disponíveis, o que está coberto e as regras a seguir quando forem criados ou alterados testes.

**Última atualização:** 2026-06-19
**Estado atual:** suite de testes backend fechada por agora.

---

## 1. Estado atual

O backend tem testes automatizados com:

* **Vitest** como test runner;
* **Supertest** para testes E2E/API;
* **Prisma** nos testes de integração dos jobs e em alguns cenários E2E controlados;
* **coverage V8** para relatório de cobertura;
* helpers e fixtures reutilizáveis para autenticação e criação de dados.

Comandos validados nesta fase:

```bash
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm run test:all
npm run test:coverage
npm run validate
```

Estado final validado:

```txt
Unit tests        ✅ passam
Integration tests ✅ passam
E2E tests         ✅ passam
test:all          ✅ passa
test:coverage     ✅ configurado
validate          ✅ passa
npm audit         ✅ sem vulnerabilidades conhecidas nesta validação
```

Importante:

```txt
Isto não significa cobertura matemática de 100%.
Significa que a matriz crítica do backend está coberta e estável para a fase atual.
```

A suite pode ser considerada **fechada por agora**.

Novos testes devem ser adicionados quando existir:

* bug real;
* endpoint novo;
* payload novo;
* regra funcional nova;
* alteração de permissões;
* alteração de estados;
* alteração em jobs;
* refatoração interna com risco funcional.

---

## 1.1 Runtime de testes e CI

A suite deve correr com **Node.js 24 LTS**.

Configuração alinhada:

```txt
package.json: >=24.0.0 <25.0.0
.node-version: 24
GitHub Actions: node-version 24.x
```

Antes de executar testes localmente:

```bash
node --version
```

O resultado deve começar por:

```txt
v24.
```

O workflow `.github/workflows/backend-ci.yml` usa PostgreSQL e executa instalação limpa, Prisma, migrations, testes unitários, integração, E2E, coverage e audit com Node 24.

---

## 2. Objetivo dos testes

O objetivo dos testes é garantir que o backend mantém as regras de negócio corretas ao longo do tempo.

Os testes protegem principalmente:

* autenticação;
* sessão por cookie HTTP-only;
* permissões por role;
* criação e gestão de utentes;
* medicação habitual;
* receitas;
* medicamentos não sujeitos a receita médica;
* Vendas Suspensas;
* pedidos;
* validação e rejeição pela Farmácia;
* cancelamento pela Santa Casa;
* histórico;
* regularizações;
* alertas operacionais;
* jobs de manutenção;
* erros esperados;
* security headers com `helmet`;
* request ID;
* integridade dos dados na base de dados.

---

## 3. Ferramentas usadas

### Vitest

Usado para:

* testes unitários;
* testes de integração;
* testes E2E;
* testes de jobs;
* assertions;
* execução em modo watch ou modo único.

### Supertest

Usado para:

* testar endpoints Express;
* simular requests HTTP;
* validar cookies;
* validar respostas JSON;
* validar permissões por role;
* testar fluxos reais sem arrancar servidor HTTP com `npm run dev`.

### Prisma

Usado em testes de integração e alguns E2E para:

* preparar cenários específicos;
* validar efeitos reais na base de dados;
* limpar dados de teste quando necessário.

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

    pool: "threads",
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1,

    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,

    clearMocks: true,
    restoreMocks: true,

    sequence: {
      concurrent: false,
      shuffle: false,
    },

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
    },
  },
});
```

### Motivo desta configuração

A suite E2E usa base de dados, cookies, sessões e cenários com dados reais.

Por isso, a configuração privilegia estabilidade:

```txt
fileParallelism: false
maxWorkers: 1
minWorkers: 1
sequence.concurrent: false
sequence.shuffle: false
```

Isto evita colisões de dados, instabilidade de workers e falhas intermitentes.

Como `globals: true` está ativo, os testes podem usar diretamente:

```js
describe()
it()
expect()
beforeAll()
afterAll()
beforeEach()
afterEach()
```

sem importar de `vitest`.

---

## 5. Estrutura atual dos testes

```txt
backend/
└── tests/
    ├── e2e/
    │   ├── adminUsers.e2e.test.js
    │   ├── alertas.e2e.test.js
    │   ├── auth.e2e.test.js
    │   ├── extras.e2e.test.js
    │   ├── farmacia.e2e.test.js
    │   ├── farmaciaPedidos.e2e.test.js
    │   ├── health.e2e.test.js
    │   ├── loginRateLimit.e2e.test.js
    │   ├── manutencao.e2e.test.js
    │   ├── medicacaoHabitual.e2e.test.js
    │   ├── pedidos.e2e.test.js
    │   ├── receitas.e2e.test.js
    │   ├── regularizacoes.e2e.test.js
    │   ├── santacasa.e2e.test.js
    │   ├── semReceita.e2e.test.js
    │   └── utentes.e2e.test.js
    │
    ├── fixtures/
    │   ├── users.fixture.js
    │   └── utentes.fixture.js
    │
    ├── helpers/
    │   ├── app.js
    │   └── auth.js
    │
    ├── integration/
    │   └── jobs/
    │       ├── higiene.job.test.js
    │       ├── purgeHistory.job.test.js
    │       └── receitaExpiry.job.test.js
    │
    └── unit/
        ├── mappers/
        ├── utils/
        └── validators/
```

---

## 6. Scripts no `package.json`

Scripts automatizados:

```json
{
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:unit": "vitest tests/unit",
  "test:integration": "vitest tests/integration",
  "test:e2e": "vitest tests/e2e",
  "test:all": "npm run test:unit -- --run && npm run test:integration -- --run && npm run test:e2e -- --run",
  "test:coverage": "vitest --coverage --run",
  "audit": "npm audit",
  "validate": "npm run test:all && npm run audit"
}
```

Scripts manuais/smoke mantidos:

```json
{
  "test:api": "node scripts/manual/test-current-api.js",
  "test:receita-expiry": "node scripts/manual/test-receita-expiry-job.js",
  "test:higiene": "node scripts/manual/test-higiene-job.js",
  "test:purge-history": "node scripts/manual/test-purge-history-job.js",
  "test:manual": "npm run test:api && npm run test:receita-expiry && npm run test:higiene && npm run test:purge-history"
}
```

Scripts diretos de jobs:

```json
{
  "job:receita-expiry": "node -e \"require('./src/jobs/receitaExpiry.job').runOnce().then(console.log).catch((e)=>{console.error(e);process.exit(1)})\"",
  "job:higiene": "node -e \"require('./src/jobs/higiene.job').runOnce().then(console.log).catch((e)=>{console.error(e);process.exit(1)})\"",
  "job:purge-history": "node -e \"require('./src/jobs/purgeHistory.job').runOnce().then(console.log).catch((e)=>{console.error(e);process.exit(1)})\""
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

### 7.5 Testar um ficheiro específico

```bash
npm run test:e2e -- --run tests/e2e/regularizacoes.e2e.test.js
```

```bash
npm run test:unit -- --run tests/unit/validators/pedidos.validators.test.js
```

### 7.6 Validação completa recomendada

Confirmar primeiro o runtime:

```bash
node --version
```

Depois:

```bash
npm run test:all
npm run test:coverage
npm run validate
```

`validate` executa:

```txt
test:all + npm audit
```

---

## 8. Unit tests

Pasta:

```txt
tests/unit/
```

Servem para testar funções pequenas e isoladas.

Cobrem atualmente:

* validators;
* mappers;
* utils.

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

### `adminUsers.validators.test.js`

Cobre:

* roles válidas;
* listagem de utilizadores;
* filtros por role;
* filtros por estado ativo/inativo;
* paginação por `page/pageSize`;
* prioridade de `skip/take`;
* pesquisa;
* criação de utilizador;
* atualização de utilizador;
* alteração de password;
* alteração de estado;
* erros de payload inválido.

### `auth.validators.test.js`

Cobre:

* login válido;
* normalização de email;
* password como string;
* email vazio;
* email inválido;
* password vazia;
* campos extra ignorados.

### `extras.validators.test.js`

Cobre:

* criação de Venda Suspensa;
* alias `nome`;
* alias `quantidade`;
* normalização de medicamento;
* quantidade maior que zero;
* arredondamento de decimais para inteiro por baixo;
* `receitaDraftItems`;
* alias `id` para linha de receita;
* junção de itens duplicados em rascunho;
* ignorar rascunhos inválidos.

### `farmacia.validators.test.js`

Cobre:

* query de listagem de pedidos da Farmácia;
* status válidos;
* status inválidos;
* datas `from/to`;
* pesquisa;
* paginação;
* payload de rejeição;
* alias `reason`;
* limite de motivo;
* payload de validação.

### `pedidos.validators.test.js`

Cobre:

* criação de pedido;
* tipos `COM_RECEITA`, `SEM_RECEITA`, `EXTRA`;
* aliases `RECEITA`, `RECEITA_LINHA`;
* alias `kind`;
* alias `qtd`;
* agregação de duplicados;
* não agregar itens de utentes diferentes;
* quantidade padrão;
* quantidade inválida;
* item sem ID;
* item sem utente;
* query de histórico;
* query de pendentes;
* payload de cancelamento;
* alias `motivo`.

### `receitas.validators.test.js`

Cobre:

* criação de receita válida;
* validade no dia atual aceite;
* `nome` ou `medicamento`;
* `numero19`;
* `pinAcesso6`;
* `pinOpcao4`;
* confirmação de regularização;
* linhas obrigatórias;
* medicamento obrigatório;
* quantidade inválida;
* validade passada inválida;
* medicamentos duplicados na mesma receita;
* normalização de medicamentos.

### `regularizacoes.validators.test.js`

Cobre:

* query default;
* `skip/take`;
* `utenteId`;
* `medicamento`;
* `search`;
* datas `from/to`;
* datas simples `YYYY-MM-DD`;
* datas ISO;
* valores inválidos.

### `semReceita.validators.test.js`

Cobre:

* criação válida;
* alias `nome`;
* medicamento obrigatório;
* quantidade maior que zero;
* quantidade decimal convertida;
* quantidade inválida.

### `utentes.validators.test.js`

Cobre:

* criação de utente;
* `numero9` com 9 dígitos;
* nome obrigatório;
* listagem de utentes;
* filtros de estado;
* pesquisa;
* paginação;
* arquivo de utente;
* alias `reason`.

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

* DTOs devolvidos pela API;
* cálculo de quantidade restante;
* quantidade reservada pendente;
* quantidade regularizada;
* quantidade cancelada;
* campos de auditoria;
* relações opcionais;
* comportamento com `null`/`undefined`;
* estrutura esperada para frontend.

### `extras.mappers.test.js`

Cobre:

* `toExtraDTO`;
* `getReceitaLinhaRestanteDTO`;
* medicamento textual e `medicamentoRef`;
* reservas pendentes;
* quantidades inválidas;
* evitar valores negativos.

### `pedidos.mappers.test.js`

Cobre:

* `toPedidoDTO`;
* `toPedidoItemDTO`;
* utente;
* receitaLinha;
* semReceita;
* extra;
* utilizadores de auditoria;
* `validatedBy`;
* `rejectedBy`;
* `canceledBy`;
* `closedReason`;
* fallback `cancelReason`.

### `receitas.mappers.test.js`

Cobre:

* `toReceitaLinhaDTO`;
* `toReceitaCreatedDTO`;
* linhas;
* receita;
* quantidade restante;
* reservas pendentes;
* extras resolvidos;
* filtros de valores nulos.

### `regularizacoes.mappers.test.js`

Cobre:

* `toRegularizacaoDTO`;
* `toRegularizacoesPageDTO`;
* eventos de regularização;
* receitaLinha;
* receita;
* utente;
* pedido;
* paginação;
* params.

### `semReceita.mappers.test.js`

Cobre:

* `toSemReceitaDTO`;
* quantidade restante;
* reservas pendentes;
* valores inválidos;
* proteção contra negativos.

### `utentes.mappers.test.js`

Cobre:

* `toUtenteDTO`;
* utente ativo;
* utente arquivado;
* utente removido logicamente;
* `archivedBy`;
* campos opcionais.

---

## 8.3 Utils cobertas

```txt
tests/unit/utils/
├── date.test.js
├── normalize.test.js
├── pagination.test.js
└── smoke.test.js
```

### `date.test.js`

Cobre:

* `getStartOfDay`;
* `isDateBeforeToday`;
* validade igual ao dia atual não é considerada passada;
* data anterior é considerada passada;
* datas inválidas não rebentam validação.

### `normalize.test.js`

Cobre:

* `normalizeText`;
* remoção de acentos;
* lowercase;
* trim;
* números;
* hífens;
* `null`/`undefined`;
* `cleanId`.

### `pagination.test.js`

Cobre:

* `parsePagination`;
* `buildPaginationMeta`;
* defaults;
* `page/pageSize`;
* `skip/take`;
* prioridade de `pageSize`;
* limites máximos;
* valores inválidos;
* cálculo de `skip`;
* cálculo de `totalPages`.

### `smoke.test.js`

Cobre:

* sanity check da configuração base do Vitest.

Pode ser mantido por agora. Pode ser removido no futuro se deixar de acrescentar valor.

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

* identifica linhas vencidas;
* faz preview sem alterar dados;
* marca linhas como `EXPIRADA`;
* cancela itens pendentes associados;
* cancela pedidos pendentes afetados;
* guarda razão de fecho;
* não expira receita com validade igual ao dia atual.

Regra crítica protegida:

```txt
Validade igual ao dia atual continua válida nesse dia.
```

---

## 9.2 Higiene

Ficheiro:

```txt
tests/integration/jobs/higiene.job.test.js
```

Valida que o job:

* identifica utentes removidos antigos;
* faz preview sem alterar dados;
* aplica marcador `[HIGIENE]`;
* respeita `anonymize: false`;
* é idempotente.

---

## 9.3 Purge History

Ficheiro:

```txt
tests/integration/jobs/purgeHistory.job.test.js
```

Valida que o job:

* identifica pedidos fechados antigos;
* identifica regularizações concluídas antigas;
* faz preview sem apagar dados;
* remove pedidos antigos;
* remove itens associados;
* remove dispensas associadas;
* remove regularizações concluídas antigas;
* remove eventos associados;
* é seguro para repetir.

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

* testes não sujam a base de desenvolvimento;
* reduz colisões de dados;
* facilita limpeza total antes/depois dos testes;
* melhora isolamento;
* reduz risco operacional.

---

## 10. E2E tests

Pasta:

```txt
tests/e2e/
```

Os E2E usam Supertest contra a app Express diretamente.

Não é necessário arrancar:

```bash
npm run dev
```

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

* login de `ADMIN`;
* login de `SANTACASA`;
* login de `FARMACIA`;
* cookie HTTP-only;
* credenciais inválidas;
* utilizador inexistente;
* utilizador inativo;
* sessão em falta;
* token adulterado;
* token expirado;
* token de utilizador inativo;
* `/api/auth/me`;
* logout;
* logout sem sessão;
* rotas protegidas;
* bloqueios por role;
* `/api/health` protegido por `ADMIN`.

---

## 10.1.1 Health E2E

Ficheiro:

```txt
tests/e2e/health.e2e.test.js
```

Cobre:

* `/api/health/live` público;
* `/api/health/ready` público com validação de base de dados;
* `/api/health` protegido sem sessão;
* `/api/health` permitido com `ADMIN`;
* `/api/health` bloqueado para `SANTACASA`;
* `/api/health` bloqueado para `FARMACIA`.

---

## 10.1.2 Login Rate Limit E2E

Ficheiro:

```txt
tests/e2e/loginRateLimit.e2e.test.js
```

Cobre:

* limite de tentativas falhadas de login;
* resposta `429 TOO_MANY_REQUESTS`;
* header `Retry-After`;
* proteção contra bypass por `X-Forwarded-For` manipulado quando `TRUST_PROXY=false`.

---

## 10.1.3 Security Headers E2E

Ficheiro:

```txt
tests/e2e/securityHeaders.e2e.test.js
```

Cobre:

* aplicação de headers de segurança em respostas públicas com `helmet`;
* remoção de `x-powered-by`;
* `X-Content-Type-Options`;
* `Referrer-Policy`;
* `X-Frame-Options`;
* `Cross-Origin-Resource-Policy`;
* `Content-Security-Policy`;
* manutenção do CORS para origins permitidas.

---

## 10.1.4 Request ID E2E

Ficheiro:

```txt
tests/e2e/requestId.e2e.test.js
```

Cobre:

* geração automática de `X-Request-Id`;
* preservação de `X-Request-Id` válido enviado pelo cliente;
* exposição do header em CORS;
* presença de `X-Request-Id` em respostas de erro.


---

## 10.2 Admin Users E2E

Ficheiro:

```txt
tests/e2e/adminUsers.e2e.test.js
```

Cobre:

* bloqueio sem sessão;
* bloqueio de `SANTACASA`;
* bloqueio de `FARMACIA`;
* listagem por `ADMIN`;
* criação de utilizador;
* password mínima de 10 caracteres;
* email com formato válido;
* bloqueio de alteração da própria role;
* listagem com pesquisa/filtros;
* atualização de nome/email/role;
* alteração de password;
* login com nova password;
* desativação;
* remoção de utilizador inativo;
* bloqueio de email duplicado;
* bloqueio de remoção de utilizador ativo.

---

## 10.3 Alertas E2E

Ficheiro:

```txt
tests/e2e/alertas.e2e.test.js
```

Cobre:

* bloqueio sem sessão;
* bloqueio de `SANTACASA`;
* listagem por `FARMACIA`;
* listagem por `ADMIN`;
* criação de alerta `PEDIDO_ENVIADO`;
* fecho de alerta individual;
* `404` ao fechar alerta inexistente;
* fecho de todos os alertas ativos;
* alerta `REGULARIZACAO_TOTAL`;
* alerta `REGULARIZACAO_PARCIAL`.

Fluxos novos fechados nesta fase:

```txt
REGULARIZACAO_TOTAL
REGULARIZACAO_PARCIAL
```

---

## 10.4 Extras / Vendas Suspensas E2E

Ficheiro:

```txt
tests/e2e/extras.e2e.test.js
```

Cobre:

* bloqueio sem sessão;
* bloqueio de `FARMACIA`;
* criação de Venda Suspensa;
* listagem;
* remoção;
* duplicado em aberto bloqueado;
* validação de medicamento obrigatório;
* validação de quantidade;
* bloqueio quando existe receita ativa disponível;
* bloqueio de remoção associada a pedido pendente;
* remoção após cancelamento de pedido pendente.

---

## 10.5 Farmácia E2E

Ficheiro:

```txt
tests/e2e/farmacia.e2e.test.js
```

Cobre:

* health da Farmácia;
* bloqueio de `SANTACASA`;
* listagem/validação de pedido pendente;
* validação de pedido com medicamento não sujeito a receita médica;
* validação de pedido com receita válida no dia atual;
* rejeição de pedido;
* bloqueio de validação de pedido já rejeitado;
* dashboard/sinais;
* sinal de regularizações.

---

## 10.6 Farmácia Pedidos E2E

Ficheiro:

```txt
tests/e2e/farmaciaPedidos.e2e.test.js
```

Cobre:

* listagem de pedidos pendentes;
* detalhe de pedido;
* `404` para pedido inexistente;
* query de status inválido;
* validação de pedido;
* consulta em filtro `VALIDADO`;
* impacto da validação em medicamento não sujeito a receita médica;
* rejeição de pedido;
* consulta em filtro `REJEITADO`;
* motivo de rejeição demasiado longo;
* pedido com receita expirada;
* item `CANCELADO_POR_EXPIRACAO`;
* linha `EXPIRADA`;
* pedido `CANCELADO`;
* consulta em filtro `CANCELADO`.

---

## 10.7 Manutenção E2E

Ficheiro:

```txt
tests/e2e/manutencao.e2e.test.js
```

Cobre:

* bloqueio sem sessão;
* bloqueio de `SANTACASA`;
* bloqueio de `FARMACIA`;
* acesso de `ADMIN`;
* listagem de jobs;
* preview de `receita-expiry`;
* run de `receita-expiry` com confirmação;
* rejeição de `receita-expiry` sem confirmação;
* preview de `higiene`;
* run de `higiene` com confirmação;
* rejeição de `higiene` sem confirmação;
* preview de `purge-history`;
* run de `purge-history` com confirmação e backup confirmado;
* rejeição de `purge-history` sem confirmação ou sem `backupConfirmed`;
* validação de `offsetMonths` inválido;
* job inexistente;
* ação inexistente.

Nota:

```txt
Os endpoints run são testados com parâmetros controlados e seguros.
```

---

## 10.8 Medicação Habitual E2E

Ficheiro:

```txt
tests/e2e/medicacaoHabitual.e2e.test.js
```

Cobre:

* bloqueio sem sessão;
* bloqueio de `FARMACIA`;
* criação de medicação habitual;
* listagem;
* remoção;
* duplicado por medicamento normalizado;
* validação de medicamento obrigatório;
* remoção de toda a medicação habitual do utente.

---

## 10.9 Pedidos Santa Casa E2E

Ficheiro:

```txt
tests/e2e/pedidos.e2e.test.js
```

Cobre:

* bloqueio sem sessão;
* bloqueio de `FARMACIA`;
* criação de pedido misto;
* item `COM_RECEITA`;
* item `SEM_RECEITA`;
* item `EXTRA`;
* detalhe de pedido;
* listagem de pendentes;
* pesquisa;
* merge de itens duplicados no mesmo pedido;
* payload vazio;
* bloqueio por quantidade já reservada em pedido pendente;
* regra FEFO;
* cancelamento de pedido pendente;
* histórico de cancelamento;
* bloqueio de cancelamento de pedido validado.

---

## 10.10 Receitas E2E

Ficheiro:

```txt
tests/e2e/receitas.e2e.test.js
```

Cobre:

* bloqueio sem sessão;
* bloqueio de `FARMACIA`;
* criação de receita;
* listagem;
* remoção de linha sem dependências;
* número de receita duplicado;
* medicamento duplicado na mesma receita;
* validade no dia atual aceite;
* bloqueio de remoção de linha associada a pedido pendente;
* fluxo de confirmação de regularização;
* erro `REGULARIZACAO_CONFIRMATION_REQUIRED`;
* criação com `confirmRegularizacao: true`;
* uso de quantidade de receita para regularizar Venda Suspensa.

---

## 10.11 Regularizações E2E

Ficheiro:

```txt
tests/e2e/regularizacoes.e2e.test.js
```

Cobre:

* bloqueio sem sessão;
* bloqueio de `SANTACASA` nas rotas de regularizações da Farmácia;
* `FARMACIA` consulta sinal de regularizações;
* regularização pendente criada a partir de Venda Suspensa validada;
* filtros por utente, medicamento e pesquisa;
* query inválida;
* regularização total movida para histórico;
* regularização parcial permanece em pendentes;
* eventos de regularização;
* consulta de regularizações na área Santa Casa;
* consulta de histórico de regularizações na área Santa Casa;
* consulta de sinal de regularizações na área Santa Casa;
* bloqueio de `FARMACIA` nas rotas da Santa Casa.

Fluxos novos fechados nesta fase:

```txt
/api/santacasa/regularizacoes/pendentes
/api/santacasa/regularizacoes/historico
/api/santacasa/regularizacoes/sinal
```

---

## 10.12 Santa Casa E2E

Ficheiro:

```txt
tests/e2e/santacasa.e2e.test.js
```

Cobre:

* health da Santa Casa;
* bloqueio de `FARMACIA`;
* criação de utente;
* listagem de utentes;
* consulta de utente por ID;
* arquivo de utente;
* reativação de utente;
* remoção lógica de utente;
* rejeição de `numero9` inválido;
* rejeição de duplicado por `numero9`;
* dashboard/sinais.

---

## 10.13 Sem Receita E2E

Ficheiro:

```txt
tests/e2e/semReceita.e2e.test.js
```

Cobre:

* bloqueio sem sessão;
* bloqueio de `FARMACIA`;
* criação de medicamento não sujeito a receita médica;
* listagem;
* remoção;
* duplicado ativo com incremento de quantidade;
* medicamento obrigatório;
* quantidade inválida;
* bloqueio de remoção associada a pedido pendente;
* remoção após cancelamento de pedido pendente.

---

## 10.14 Utentes E2E

Ficheiro:

```txt
tests/e2e/utentes.e2e.test.js
```

Cobre:

* bloqueio sem sessão;
* bloqueio de `FARMACIA`;
* arquivo com motivo;
* listagem de arquivados;
* bloqueio de operação em utente arquivado;
* reativação;
* bloqueio de arquivo de utente já arquivado;
* bloqueio de reativação de utente já ativo;
* bloqueio de arquivo com medicamento não sujeito a receita médica disponível;
* bloqueio de arquivo com pedido pendente;
* bloqueio de remoção com dados associados;
* recomendação funcional de arquivo;
* bloqueios de duplicação com utentes removidos/arquivados.

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

* `admin`;
* `santacasa`;
* `farmacia`.

As credenciais vêm de `process.env` quando existirem, com fallback para valores de desenvolvimento.

### `utentes.fixture.js`

Gera payloads únicos para criação de utentes.

Evita colisões por:

* `numero9`;
* `nome`.

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

```js
const { createApp } = require("../../src/app/app");

function getTestApp() {
  return createApp();
}
```

### `auth.js`

Responsável por criar agentes autenticados:

```js
createAdminAgent(app)
createSantaCasaAgent(app)
createFarmaciaAgent(app)
```

Também contém helpers base como:

```js
loginAs(app, user)
createAuthenticatedAgent(app, user)
```

Isto evita repetir login em todos os E2E.

---

## 13. Scripts manuais

Além dos testes Vitest, existem scripts manuais em:

```txt
scripts/manual/
```

Scripts atuais:

```txt
scripts/manual/test-current-api.js
scripts/manual/test-higiene-job.js
scripts/manual/test-purge-history-job.js
scripts/manual/test-receita-expiry-job.js
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

* queres validar rapidamente um fluxo completo;
* queres testar o backend com servidor HTTP real;
* estás a diagnosticar comportamento no terminal;
* queres executar um smoke test local;
* estás a validar um job manualmente.

### Usar testes automatizados quando:

* a regra já está definida;
* queres evitar regressões;
* vais fazer commit;
* vais fazer deploy;
* precisas de integração com CI;
* queres testes repetíveis.

Regra:

```txt
Scripts manuais não substituem Vitest.
```

---

## 15. Cuidados com scripts manuais

Os scripts manuais criam dados reais e podem alterar a base definida em `DATABASE_URL`.

Regras:

* não correr contra produção;
* confirmar `.env` antes de correr;
* confirmar `DATABASE_URL`;
* para `test:api`, manter `npm run dev` ligado;
* para jobs, preferir preview quando disponível;
* não usar scripts manuais como substituto dos testes Vitest.

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

* [ ] Saber que regra está a ser testada.
* [ ] Confirmar o comportamento esperado no backend real.
* [ ] Confirmar o erro esperado.
* [ ] Preparar dados mínimos.
* [ ] Evitar depender de dados manuais existentes.
* [ ] Garantir que o teste é repetível.
* [ ] Garantir que não usa produção.
* [ ] Dar nome claro ao teste.
* [ ] Fazer cleanup quando criar dados diretamente na base.
* [ ] Usar fixtures/helpers quando houver repetição.
* [ ] Não alterar backend só para satisfazer um teste errado.

---

## 18. Checklist antes de correr testes

* [ ] Confirmar que estás dentro de `backend`.
* [ ] Confirmar `.env`.
* [ ] Confirmar que `DATABASE_URL` não aponta para produção.
* [ ] Confirmar que o seed já foi corrido quando necessário.
* [ ] Confirmar Prisma Client gerado.
* [ ] Confirmar que jobs automáticos não vão interferir.
* [ ] Correr primeiro o teste específico se alteraste um ficheiro.
* [ ] Depois correr `test:all`.
* [ ] Depois correr `validate`.

Comandos:

```bash
npx prisma generate
npm run prisma:seed
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm run test:all
npm run validate
```

---

## 19. Fluxos críticos cobertos

### Autenticação

Coberto:

* login válido;
* login inválido;
* cookie HTTP-only;
* sessão em falta;
* token inválido;
* token expirado;
* utilizador inativo;
* `/api/auth/me`;
* logout.

### Autorização

Coberto:

* Santa Casa bloqueada na Farmácia;
* Farmácia bloqueada na Santa Casa;
* Santa Casa/Farmácia bloqueadas em manutenção;
* Admin autorizado em manutenção;
* Admin autorizado em áreas administrativas;
* roles corretas por contexto.

### Utentes

Coberto:

* criação;
* listagem;
* consulta;
* arquivo;
* reativação;
* remoção lógica;
* duplicados;
* payload inválido;
* bloqueios por pendências;
* bloqueios por dados associados.

### Medicação habitual

Coberto:

* criação;
* listagem;
* duplicado;
* remoção individual;
* remoção total;
* bloqueio de role errada.

### Receitas

Coberto:

* criação;
* listagem;
* remoção de linha;
* duplicados;
* validade no dia atual;
* bloqueios por pedidos;
* confirmação de regularização.

### Medicamentos não sujeitos a receita médica

Coberto:

* criação;
* incremento de duplicados;
* listagem;
* remoção;
* quantidade inválida;
* bloqueio por pedido pendente.

### Vendas Suspensas

Coberto:

* criação;
* listagem;
* duplicado em aberto;
* bloqueio quando existe receita ativa disponível;
* remoção;
* bloqueio por pedido pendente;
* remoção após cancelamento.

### Pedidos

Coberto:

* criação de pedido;
* pedido misto;
* agregação de duplicados;
* reservas pendentes;
* FEFO;
* cancelamento;
* histórico;
* validação pela Farmácia;
* rejeição pela Farmácia;
* pedido com receita expirada.

### Regularizações

Coberto:

* criação por validação de Venda Suspensa;
* pendentes;
* histórico;
* parcial;
* total;
* eventos;
* sinal;
* contexto Farmácia;
* contexto Santa Casa;
* permissões cruzadas.

### Alertas

Coberto:

* pedido enviado;
* regularização parcial;
* regularização total;
* listagem;
* dismiss individual;
* dismiss all;
* permissões.

### Jobs

Coberto:

* `receita-expiry`;
* `higiene`;
* `purge-history`;
* previews;
* runs;
* permissões dos endpoints de manutenção;
* idempotência em integração.

---

## 20. Fluxos que não precisam de ser aprofundados agora

A suite está fechada por agora.

Não é necessário criar mais testes apenas para aumentar quantidade.

Pode ser aprofundado no futuro se houver alteração real em:

* services críticos;
* transações;
* concorrência;
* jobs destrutivos;
* alertas;
* permissões;
* filtros avançados;
* nova área funcional;
* base de dados isolada para testes;
* coverage report.

---

## 21. Más práticas a evitar

Evitar:

* testar contra produção;
* depender de dados criados manualmente;
* deixar scripts `debug.js` soltos na raiz;
* criar testes enormes que validam tudo ao mesmo tempo;
* escrever testes sem cleanup quando criam dados diretos;
* testar só casos felizes;
* ignorar erros esperados;
* correr jobs destrutivos sem preview;
* commitar `.env` real;
* guardar passwords reais em fixtures;
* alterar backend só para satisfazer um teste errado;
* tornar testes frágeis com asserts excessivamente específicos em campos irrelevantes;
* duplicar testes que não acrescentam proteção real.

---

## 22. Critério mínimo antes de commit

Antes de commit:

```bash
npm run test:all
npm run validate
```

Confirmar:

* [ ] todos os testes passam;
* [ ] `npm audit` não acusa vulnerabilidades relevantes;
* [ ] `.env` não aparece no Git;
* [ ] `package-lock.json` está atualizado, se houve alteração de dependências;
* [ ] documentação está atualizada se houve alteração estrutural;
* [ ] novos testes têm nomes claros;
* [ ] testes não dependem de valores fixos que colidem facilmente.

---

## 23. Critério mínimo antes de deploy

Antes de considerar deploy:

* [ ] login testado;
* [ ] roles testadas;
* [ ] utentes testados;
* [ ] criação de receitas testada;
* [ ] criação de pedidos testada;
* [ ] validação pela Farmácia testada;
* [ ] rejeição pela Farmácia testada;
* [ ] regularizações testadas;
* [ ] alertas testados;
* [ ] jobs testados localmente;
* [ ] CORS/cookies testados com frontend;
* [ ] `.env` de produção validado;
* [ ] migrations preparadas;
* [ ] backups considerados para jobs destrutivos;
* [ ] `npm run validate` passa.

---

## 24. Coverage futuro

Ainda não foi configurado relatório formal de coverage.

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

Atenção:

```txt
Coverage alto não garante qualidade.
O objetivo não é chegar a 100% artificialmente.
O objetivo é proteger regras críticas.
```

---

## 25. Prioridade futura de testes

Não é necessário tentar chegar a 100% agora.

Prioridade futura, apenas se houver necessidade real:

```txt
1. Base de dados isolada para testes
2. Coverage report
3. Testes específicos para regressões reais encontradas no frontend
4. Testes unitários de services críticos se houver refatoração profunda
5. Testes de concorrência/reservas se o backend passar a ter maior carga
6. Testes de compatibilidade quando existir futura mudança de runtime Node
7. Testes de cookies/CORS em ambiente de staging
```

---

## 26. Estratégia recomendada daqui para a frente

Estado atual:

```txt
Backend estável.
Testes fechados por agora.
Documentação principal atualizada.
```

Regra prática:

* Não criar testes redundantes.
* Criar teste novo quando houver bug ou regra nova.
* Se uma refatoração tocar em service crítico, correr teste específico primeiro.
* Depois correr `test:all`.
* Antes de commit/deploy, correr `validate`.

Fluxo recomendado:

```bash
npm run test:e2e -- --run tests/e2e/<ficheiro-afetado>.test.js
npm run test:all
npm run validate
```

---

## 27. Resumo final

A pasta `tests/` é a fonte principal de testes automatizados.

A pasta `scripts/manual/` mantém scripts manuais/smoke úteis, mas não substitui Vitest.

A base atual de testes cobre:

* validators;
* mappers;
* utils;
* autenticação;
* permissões;
* Santa Casa;
* Farmácia;
* Sistema/Admin;
* manutenção;
* utentes;
* medicação habitual;
* receitas;
* medicamentos não sujeitos a receita médica;
* Vendas Suspensas;
* pedidos;
* histórico;
* regularizações;
* alertas;
* jobs críticos.

Conclusão:

```txt
A suite de testes backend está num nível sólido e pode ser dada como fechada por agora.
```

Próximo passo recomendado:

```txt
Manter backend estável, fazer commit e avançar para frontend ou documentação complementar.
```


---

## Anexo — Coverage

O comando:

```bash
npm run test:coverage
```

gera relatório de cobertura com Vitest/V8.

Relatórios esperados:

```txt
coverage/
├── index.html
└── lcov.info
```

Notas:

* coverage mede linhas/funções/branches executadas pelos testes;
* coverage alto não prova que a regra de negócio está correta;
* nesta fase, o coverage serve sobretudo para identificar zonas sem testes;
* thresholds obrigatórios podem ser adicionados mais tarde.
