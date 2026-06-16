# Backend — Farmácia Santa Casa

Backend da aplicação **Farmácia Santa Casa**, responsável pela gestão de utentes, medicação habitual, receitas, medicamentos não sujeitos a receita médica, Vendas Suspensas, pedidos, validações da Farmácia, rejeições, histórico, regularizações, alertas operacionais, autenticação, permissões e jobs de manutenção.

Este backend foi construído com **Node.js**, **Express**, **Prisma** e **PostgreSQL**.

**Última atualização:** 2026-06-16
**Estado atual:** backend estável; testes automatizados fechados por agora; documentação principal atualizada.

---

## 1. Índice

* [1. Índice](#1-índice)
* [2. Estado atual](#2-estado-atual)
* [3. Objetivo do backend](#3-objetivo-do-backend)
* [4. Stack técnica](#4-stack-técnica)
* [5. Estrutura principal](#5-estrutura-principal)
* [6. Documentação complementar](#6-documentação-complementar)
* [7. Instalação local](#7-instalação-local)
* [8. Variáveis de ambiente](#8-variáveis-de-ambiente)
* [9. Base de dados e Prisma](#9-base-de-dados-e-prisma)
* [10. Seed inicial](#10-seed-inicial)
* [11. Scripts NPM](#11-scripts-npm)
* [12. Como arrancar o backend](#12-como-arrancar-o-backend)
* [13. Autenticação e autorização](#13-autenticação-e-autorização)
* [14. Contextos principais da API](#14-contextos-principais-da-api)
* [15. Modelo funcional resumido](#15-modelo-funcional-resumido)
* [16. Fluxo principal da aplicação](#16-fluxo-principal-da-aplicação)
* [17. Jobs de manutenção](#17-jobs-de-manutenção)
* [18. Alertas operacionais](#18-alertas-operacionais)
* [19. Testes](#19-testes)
* [20. Scripts manuais](#20-scripts-manuais)
* [21. Segurança](#21-segurança)
* [22. Convenções de desenvolvimento](#22-convenções-de-desenvolvimento)
* [23. Troubleshooting](#23-troubleshooting)
* [24. Checklist antes de commit](#24-checklist-antes-de-commit)
* [25. Checklist antes de deploy](#25-checklist-antes-de-deploy)
* [26. Limites atuais](#26-limites-atuais)
* [27. Próximos passos recomendados](#27-próximos-passos-recomendados)
* [28. Estado final desta fase](#28-estado-final-desta-fase)

---

## 2. Estado atual

Estado validado nesta fase:

* documentação técnica e funcional atualizada;
* `.env.example` criado/atualizado;
* arquitetura backend documentada;
* contratos de API documentados;
* regras de negócio documentadas;
* jobs de manutenção documentados;
* estratégia de testes documentada;
* Vitest e Supertest configurados;
* testes unitários criados e validados;
* testes de integração criados e validados;
* testes E2E criados e validados;
* scripts manuais mantidos como apoio/smoke tests;
* alertas operacionais cobertos;
* regularizações Santa Casa/Farmácia cobertas;
* `npm audit` integrado no fluxo de validação.

Comandos validados:

```bash
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm run test:all
npm run validate
```

Estado final:

```txt
Unit tests        ✅ passam
Integration tests ✅ passam
E2E tests         ✅ passam
test:all          ✅ passa
validate          ✅ passa
```

Os testes atuais **não representam cobertura matemática de 100%** do backend. Representam uma matriz sólida e suficiente para dar esta fase de testes como fechada por agora.

---

## 3. Objetivo do backend

Este backend gere a comunicação entre dois contextos funcionais principais:

### Santa Casa

Responsável por:

* gerir utentes;
* registar medicação habitual;
* registar receitas;
* registar medicamentos não sujeitos a receita médica;
* registar medicamentos para Venda Suspensa;
* criar pedidos para validação pela Farmácia;
* cancelar pedidos pendentes antes da validação;
* consultar histórico;
* consultar regularizações;
* acompanhar sinais/dashboard operacional.

### Farmácia

Responsável por:

* consultar pedidos pendentes;
* consultar detalhes de pedidos;
* validar pedidos;
* rejeitar pedidos;
* consultar histórico;
* consultar regularizações;
* consultar alertas operacionais;
* fechar alertas operacionais;
* acompanhar sinais/dashboard operacional.

### Administração

Responsável por:

* gestão de utilizadores;
* acesso a manutenção;
* preview e execução manual de jobs;
* endpoints administrativos;
* health check global.

---

## 4. Stack técnica

| Área                     | Tecnologia              |
| ------------------------ | ----------------------- |
| Runtime                  | Node.js                 |
| Framework HTTP           | Express 4               |
| ORM                      | Prisma 5                |
| Base de dados            | PostgreSQL              |
| Autenticação             | JWT em cookie HTTP-only |
| Password hashing         | bcryptjs                |
| Cookies                  | cookie-parser           |
| Jobs                     | node-cron               |
| Configuração             | dotenv                  |
| Desenvolvimento          | nodemon                 |
| Testes                   | Vitest + Supertest      |
| Base de dados nos testes | Prisma                  |

---

## 5. Estrutura principal

Estrutura simplificada do backend:

```txt
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── scripts/
│   └── manual/
│       ├── test-current-api.js
│       ├── test-higiene-job.js
│       ├── test-purge-history-job.js
│       └── test-receita-expiry-job.js
│
├── src/
│   ├── app/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── config/
│   │   ├── auth.config.js
│   │   └── env.js
│   │
│   ├── db/
│   │   └── prisma.js
│   │
│   ├── jobs/
│   │   ├── higiene.job.js
│   │   ├── index.js
│   │   ├── purgeHistory.job.js
│   │   └── receitaExpiry.job.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── loginRateLimit.js
│   │   ├── notFoundHandler.js
│   │   └── originGuard.js
│   │
│   ├── modules/
│   │   ├── admin-users/
│   │   ├── alertas/
│   │   ├── auth/
│   │   ├── extras/
│   │   ├── farmacia/
│   │   ├── manutencao/
│   │   ├── medicacao-habitual/
│   │   ├── pedidos/
│   │   ├── receitas/
│   │   ├── regularizacoes/
│   │   ├── santa-casa/
│   │   ├── sem-receita/
│   │   └── utentes/
│   │
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── farmacia.routes.js
│   │   ├── index.js
│   │   ├── manutencao.routes.js
│   │   └── santacasa.routes.js
│   │
│   └── shared/
│       ├── errors/
│       │   └── AppError.js
│       └── utils/
│           ├── asyncHandler.js
│           ├── date.js
│           ├── http.js
│           ├── normalize.js
│           └── pagination.js
│
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   ├── helpers/
│   ├── integration/
│   └── unit/
│
├── docs/
├── .env
├── .env.example
├── package.json
├── package-lock.json
├── vitest.config.mjs
└── README.md
```

---

## 6. Documentação complementar

A documentação técnica e funcional fica em:

```txt
backend/docs/
```

Ficheiros principais:

```txt
docs/
├── API_ROUTES.md
├── ARCHITECTURE.md
├── BUSINESS_RULES.md
├── ENVIRONMENT.md
├── MAINTENANCE_JOBS.md
└── TESTING.md
```

| Documento             | Objetivo                                                    |
| --------------------- | ----------------------------------------------------------- |
| `API_ROUTES.md`       | Endpoints, payloads, respostas, permissões e contratos HTTP |
| `ARCHITECTURE.md`     | Arquitetura interna do backend                              |
| `BUSINESS_RULES.md`   | Regras funcionais do domínio                                |
| `ENVIRONMENT.md`      | Variáveis de ambiente, `.env`, cookies, CORS e produção     |
| `MAINTENANCE_JOBS.md` | Jobs automáticos, previews, runs e cuidados operacionais    |
| `TESTING.md`          | Estratégia, cobertura atual e comandos de testes            |

O `README.md` é a porta de entrada. Os detalhes profundos devem ficar nos ficheiros acima.

---

## 7. Instalação local

### 7.1 Entrar na pasta do backend

```bash
cd backend
```

### 7.2 Instalar dependências

```bash
npm install
```

### 7.3 Criar `.env`

Copiar o exemplo:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Depois editar `.env` com os valores reais locais.

### 7.4 Gerar Prisma Client

```bash
npm run prisma:generate
```

Ou diretamente:

```bash
npx prisma generate
```

### 7.5 Aplicar migrations

```bash
npm run prisma:migrate
```

Ou diretamente:

```bash
npx prisma migrate dev
```

### 7.6 Criar utilizadores iniciais

```bash
npm run prisma:seed
```

Ou diretamente:

```bash
npx prisma db seed
```

### 7.7 Arrancar servidor

```bash
npm run dev
```

---

## 8. Variáveis de ambiente

O backend usa `dotenv` e carrega variáveis a partir de:

```txt
.env
```

Existe um ficheiro seguro de referência:

```txt
.env.example
```

O `.env` real nunca deve ser versionado.

### Variáveis principais

| Variável                 | Obrigatória | Descrição                                 |
| ------------------------ | ----------: | ----------------------------------------- |
| `DATABASE_URL`           |         Sim | URL PostgreSQL usada pelo Prisma          |
| `NODE_ENV`               |         Sim | Ambiente atual                            |
| `PORT`                   |         Sim | Porta do servidor                         |
| `TZ`                     |         Sim | Timezone dos jobs                         |
| `JSON_LIMIT`             |         Sim | Limite de payload JSON                    |
| `ALLOWED_ORIGINS`        |         Sim | Origins permitidas para CORS/origin guard |
| `AUTH_JWT_SECRET`        |         Sim | Segredo para assinar JWT                  |
| `AUTH_COOKIE_NAME`       |         Sim | Nome do cookie de sessão                  |
| `AUTH_TOKEN_EXPIRES_IN`  |         Sim | Duração do token                          |
| `AUTH_COOKIE_MAX_AGE_MS` |         Sim | Duração do cookie em milissegundos        |
| `AUTH_COOKIE_SECURE`     |         Sim | Define se o cookie exige HTTPS            |
| `AUTH_COOKIE_SAME_SITE`  |         Sim | Política SameSite do cookie               |

### Variáveis de jobs

| Variável                  | Descrição                                              |
| ------------------------- | ------------------------------------------------------ |
| `ENABLE_HIGIENE`          | Ativa/desativa job automático de higiene               |
| `ENABLE_PURGE_HISTORY`    | Ativa/desativa job automático de limpeza de histórico  |
| `ENABLE_RECEITAS_EXPIRY`  | Ativa/desativa job automático de expiração de receitas |
| `HIGIENE_OFFSET_MONTHS`   | Meses mínimos para higiene                             |
| `HIGIENE_ANONYMIZE`       | Pede anonimização no job de higiene                    |
| `ALLOW_HIGIENE_ANONYMIZE` | Confirmação adicional para permitir anonimização       |
| `PURGE_OFFSET_MONTHS`     | Meses mínimos para purge histórico                     |
| `CRON_MONTHLY_03H`        | Cron mensal                                            |
| `CRON_DAILY_03H`          | Cron diário                                            |

### Local development recomendado

```env
NODE_ENV=development
PORT=3001
TZ=Europe/Lisbon
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Produção

Em produção, usar obrigatoriamente:

```env
NODE_ENV=production
AUTH_COOKIE_SECURE=true
```

Se `AUTH_COOKIE_SAME_SITE=none`, então `AUTH_COOKIE_SECURE` também tem de ser `true`.

---

## 9. Base de dados e Prisma

O backend usa Prisma com PostgreSQL.

### Comandos úteis

Gerar Prisma Client:

```bash
npm run prisma:generate
```

Criar/aplicar migration em desenvolvimento:

```bash
npm run prisma:migrate
```

Abrir Prisma Studio:

```bash
npm run prisma:studio
```

Executar seed:

```bash
npm run prisma:seed
```

### Nota sobre testes

Atualmente os testes usam a `DATABASE_URL` configurada no `.env`.

Recomendação futura:

```txt
usar .env.test com base dedicada para testes
```

Exemplo:

```env
NODE_ENV=test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_santacasa_test?schema=public"
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=false
```

---

## 10. Seed inicial

O seed cria/atualiza três utilizadores:

| Role        | Email padrão              |
| ----------- | ------------------------- |
| `ADMIN`     | `admin@sistema.local`     |
| `SANTACASA` | `santacasa@sistema.local` |
| `FARMACIA`  | `farmacia@sistema.local`  |

As passwords vêm das variáveis:

```env
SEED_ADMIN_PASSWORD
SEED_SANTACASA_PASSWORD
SEED_FARMACIA_PASSWORD
```

Em desenvolvimento podem ser simples.

Em produção:

* usar passwords fortes;
* alterar após primeiro login;
* controlar quando o seed corre;
* evitar passwords padrão.

---

## 11. Scripts NPM

### Desenvolvimento

```bash
npm run dev
npm start
```

### Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run prisma:seed
```

### Testes automatizados

```bash
npm test
npm run test:watch
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:all
npm run validate
```

Validação recomendada sem watch:

```bash
npm run test:all
npm run validate
```

### Scripts manuais

```bash
npm run test:api
npm run test:receita-expiry
npm run test:higiene
npm run test:purge-history
npm run test:manual
```

### Jobs diretos

```bash
npm run job:receita-expiry
npm run job:higiene
npm run job:purge-history
```

---

## 12. Como arrancar o backend

### Desenvolvimento

```bash
npm run dev
```

Por defeito, o backend fica em:

```txt
http://localhost:3001
```

A API fica em:

```txt
http://localhost:3001/api
```

### Produção

```bash
npm start
```

### Health check global

```txt
GET /api/health
```

Acesso:

```txt
ADMIN
```

---

## 13. Autenticação e autorização

A autenticação usa:

* login com email/password;
* JWT assinado;
* cookie HTTP-only;
* middleware `requireAuth`;
* middleware `requireRole`.

### Rotas de auth

```txt
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Roles

| Role        | Acesso                                   |
| ----------- | ---------------------------------------- |
| `ADMIN`     | Admin, manutenção, Santa Casa e Farmácia |
| `SANTACASA` | Contexto Santa Casa                      |
| `FARMACIA`  | Contexto Farmácia                        |

### Proteção principal

A API está organizada por contexto:

```txt
/api/auth
/api/santacasa
/api/farmacia
/api/admin
/api/manutencao
/api/health
```

### Matriz resumida

| Contexto          | Roles                                       |
| ----------------- | ------------------------------------------- |
| `/api/auth`       | Público em login/logout; `/me` exige sessão |
| `/api/santacasa`  | `SANTACASA`, `ADMIN`                        |
| `/api/farmacia`   | `FARMACIA`, `ADMIN`                         |
| `/api/admin`      | `ADMIN`                                     |
| `/api/manutencao` | `ADMIN`                                     |
| `/api/health`     | `ADMIN`                                     |

---

## 14. Contextos principais da API

### Auth

```txt
/api/auth
```

Responsável por:

* login;
* logout;
* utilizador atual.

### Santa Casa

```txt
/api/santacasa
```

Responsável por:

* health;
* dashboard/sinais;
* utentes;
* medicação habitual;
* receitas;
* medicamentos não sujeitos a receita médica;
* Vendas Suspensas;
* pedidos;
* histórico;
* regularizações.

### Farmácia

```txt
/api/farmacia
```

Responsável por:

* health;
* dashboard/sinais;
* alertas operacionais;
* listar pedidos;
* consultar detalhe de pedido;
* validar pedidos;
* rejeitar pedidos;
* consultar histórico;
* consultar regularizações.

### Admin

```txt
/api/admin
```

Responsável por gestão de utilizadores.

### Manutenção

```txt
/api/manutencao
```

Responsável por:

* listar jobs;
* fazer preview de jobs;
* executar jobs manualmente.

---

## 15. Modelo funcional resumido

### Utente

Pessoa associada à Santa Casa.

Estados principais:

```txt
ATIVO
ARQUIVADO
```

Também pode ficar removido logicamente através de `deletedAt`.

### Medicação habitual

Lista simples de medicamentos normalmente usados pelo utente.

Não representa stock, receita, pedido nem dispensa.

### Receita

Documento com:

* `numero19`;
* `pinAcesso6`;
* `pinOpcao4`;
* linhas de medicamento.

### Linha de receita

Representa um medicamento numa receita.

Estados:

```txt
ATIVA
EXPIRADA
```

### Medicamento não sujeito a receita médica

Medicamento disponível sem receita.

Internamente, o modelo técnico chama-se `SemReceita`.

### Venda Suspensa

Medicamento que o utente precisa, mas ainda sem receita disponível.

Internamente, o modelo técnico chama-se `Extra`.

### Pedido

Pedido enviado pela Santa Casa à Farmácia.

Estados principais:

```txt
PENDENTE
VALIDADO
REJEITADO
CANCELADO
```

### Item de pedido

Pode ser:

```txt
COM_RECEITA
SEM_RECEITA
EXTRA
```

Estados:

```txt
PENDENTE
VALIDADO
REJEITADO
CANCELADO
CANCELADO_POR_EXPIRACAO
```

### Regularização

Registo criado quando uma Venda Suspensa validada precisa de ser regularizada posteriormente com receita.

Estados:

```txt
PENDENTE
PARCIALMENTE_REGULARIZADO
REGULARIZADO
```

### Alerta operacional

Notificação operacional destinada à Farmácia.

Tipos atuais:

```txt
PEDIDO_ENVIADO
REGULARIZACAO_PARCIAL
REGULARIZACAO_TOTAL
```

---

## 16. Fluxo principal da aplicação

Fluxo funcional típico:

```txt
1. Santa Casa cria utente.
2. Santa Casa pode registar medicação habitual.
3. Santa Casa regista receita, medicamento não sujeito a receita médica ou Venda Suspensa.
4. Santa Casa cria pedido.
5. O backend cria alerta PEDIDO_ENVIADO para a Farmácia.
6. Farmácia consulta pedidos pendentes.
7. Farmácia valida ou rejeita pedido.
8. Se validar:
   - receita é dispensada;
   - medicamento não sujeito a receita médica é debitado;
   - Venda Suspensa gera regularização.
9. Se nova receita cobrir regularização pendente:
   - regularização é aplicada automaticamente;
   - evento de regularização é criado;
   - quantidade dispensada é atualizada;
   - alerta REGULARIZACAO_PARCIAL ou REGULARIZACAO_TOTAL é criado.
```

---

## 17. Jobs de manutenção

Existem três jobs principais:

| Job              | Objetivo                                                           | Frequência padrão |
| ---------------- | ------------------------------------------------------------------ | ----------------- |
| `receita-expiry` | Expira linhas de receita vencidas e cancela itens/pedidos afetados | diária            |
| `higiene`        | Trata utentes removidos antigos                                    | mensal            |
| `purge-history`  | Remove histórico antigo fechado                                    | mensal            |

### Comandos diretos

```bash
npm run job:receita-expiry
npm run job:higiene
npm run job:purge-history
```

### Rotas de manutenção

Apenas `ADMIN`:

```txt
GET  /api/manutencao/jobs

GET  /api/manutencao/jobs/receita-expiry/preview
POST /api/manutencao/jobs/receita-expiry/run

GET  /api/manutencao/jobs/higiene/preview
POST /api/manutencao/jobs/higiene/run

GET  /api/manutencao/jobs/purge-history/preview
POST /api/manutencao/jobs/purge-history/run
```

Os endpoints `run` alteram dados reais.

### Regra importante de validade

```txt
Receita com validade igual ao dia atual continua válida nesse dia.
Só validade anterior ao dia atual deve expirar.
```

---

## 18. Alertas operacionais

Os alertas operacionais notificam a Farmácia sobre eventos importantes.

Tipos atuais:

| Tipo                    | Quando é criado                                             |
| ----------------------- | ----------------------------------------------------------- |
| `PEDIDO_ENVIADO`        | Quando a Santa Casa cria um pedido                          |
| `REGULARIZACAO_PARCIAL` | Quando uma receita regulariza parte de uma Venda Suspensa   |
| `REGULARIZACAO_TOTAL`   | Quando uma receita regulariza totalmente uma Venda Suspensa |

Rotas principais:

```txt
GET  /api/farmacia/alertas
POST /api/farmacia/alertas/:alertaId/dismiss
POST /api/farmacia/alertas/dismiss-all
```

Acesso:

```txt
FARMACIA
ADMIN
```

Fechar alertas não altera pedidos, receitas, Vendas Suspensas ou regularizações.

---

## 19. Testes

### 19.1 Estado atual

Existem testes automatizados organizados em:

```txt
tests/
├── unit/
├── integration/
└── e2e/
```

A suite está fechada por agora.

Comandos finais:

```bash
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm run test:all
npm run validate
```

---

### 19.2 Unit tests

Cobrem:

* validators;
* mappers;
* utils.

Pastas:

```txt
tests/unit/validators/
tests/unit/mappers/
tests/unit/utils/
```

Cobertura principal:

* validação de payloads;
* validação de query params;
* normalização;
* paginação;
* datas;
* DTOs;
* cálculo de quantidades restantes;
* campos de auditoria;
* relações opcionais.

---

### 19.3 Integration tests

Cobrem jobs com Prisma/base de dados:

```txt
tests/integration/jobs/
├── receitaExpiry.job.test.js
├── higiene.job.test.js
└── purgeHistory.job.test.js
```

Cobrem:

* preview;
* run;
* efeitos reais;
* idempotência;
* validade de receita no dia atual;
* purge de histórico;
* higiene de utentes removidos.

---

### 19.4 E2E tests

Cobrem API Express com Supertest:

```txt
tests/e2e/
├── adminUsers.e2e.test.js
├── alertas.e2e.test.js
├── auth.e2e.test.js
├── extras.e2e.test.js
├── farmacia.e2e.test.js
├── farmaciaPedidos.e2e.test.js
├── manutencao.e2e.test.js
├── medicacaoHabitual.e2e.test.js
├── pedidos.e2e.test.js
├── receitas.e2e.test.js
├── regularizacoes.e2e.test.js
├── santacasa.e2e.test.js
├── semReceita.e2e.test.js
└── utentes.e2e.test.js
```

Cobrem:

* autenticação;
* permissões;
* utilizadores admin;
* utentes;
* medicação habitual;
* receitas;
* medicamentos não sujeitos a receita médica;
* Vendas Suspensas;
* pedidos Santa Casa;
* pedidos Farmácia;
* histórico;
* regularizações;
* alertas;
* manutenção;
* jobs via endpoints administrativos.

---

### 19.5 Limite da cobertura atual

Os testes atuais não garantem 100% de cobertura matemática.

Mas cobrem a matriz crítica atual:

```txt
auth
roles
utentes
medicação habitual
receitas
sem receita
Vendas Suspensas
pedidos
Farmácia
regularizações
alertas
jobs
admin users
```

Novos testes devem ser adicionados quando houver:

* bug real;
* regra nova;
* endpoint novo;
* alteração de payload;
* alteração de permissões;
* refatoração com risco.

---

## 20. Scripts manuais

Os scripts em `scripts/manual/` foram mantidos como smoke tests/manuais.

Eles são úteis, mas não substituem os testes automatizados.

```bash
npm run test:manual
```

Atenção:

* `test:api` precisa do servidor ligado com `npm run dev`;
* os scripts dos jobs criam dados reais;
* não devem ser executados contra produção;
* usar Vitest como fonte principal de validação automatizada.

---

## 21. Segurança

### Não versionar

Nunca versionar:

```txt
.env
.env.local
.env.*.local
```

Exceto:

```txt
.env.example
```

### Confirmar `.gitignore`

```bash
git check-ignore backend/.env
```

Deve devolver:

```txt
backend/.env
```

### Segredos

Nunca expor:

* `DATABASE_URL` real;
* passwords reais;
* `AUTH_JWT_SECRET`;
* credenciais de produção;
* dumps da base de dados.

### Produção

Em produção:

```env
NODE_ENV=production
AUTH_COOKIE_SECURE=true
```

Se frontend e backend estiverem em domínios diferentes:

```env
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
```

`AUTH_JWT_SECRET` deve ser longo, aleatório e privado.

### CORS e cookies

O frontend deve enviar cookies com credenciais:

```js
fetch(url, {
  credentials: "include",
});
```

Com Axios:

```js
axios.create({
  withCredentials: true,
});
```

---

## 22. Convenções de desenvolvimento

### Arquitetura por módulo

Cada módulo segue a lógica:

```txt
routes -> controller -> service -> repository
```

Exemplo:

```txt
src/modules/pedidos/
├── pedidos.controller.js
├── pedidos.mappers.js
├── pedidos.repository.js
├── pedidos.routes.js
├── pedidos.service.js
└── pedidos.validators.js
```

### Responsabilidades

| Camada       | Responsabilidade                        |
| ------------ | --------------------------------------- |
| `routes`     | Define endpoints                        |
| `controller` | Lê request e responde                   |
| `service`    | Aplica regras de negócio                |
| `repository` | Acede à base de dados                   |
| `validators` | Valida payload/query                    |
| `mappers`    | Converte dados para DTO                 |
| `guards`     | Reutiliza regras de proteção de domínio |

### Regra importante

Não colocar regras de negócio diretamente em controllers.

Controllers devem ser finos.

### Transações

Usar transação quando uma operação altera múltiplas entidades relacionadas.

Exemplos:

* criar pedido;
* validar pedido;
* rejeitar pedido;
* cancelar pedido;
* criar receita com regularizações;
* expirar receitas;
* purge de histórico.

### Linguagem funcional

No código técnico pode existir:

```txt
Extra
SemReceita
```

Na UI e documentação funcional usar:

```txt
Venda Suspensa
Medicamento não sujeito a receita médica
```

---

## 23. Troubleshooting

### Erro: `DATABASE_URL em falta`

Verificar se existe `.env` e se tem:

```env
DATABASE_URL="..."
```

---

### Erro: `AUTH_JWT_SECRET em falta`

Adicionar:

```env
AUTH_JWT_SECRET="..."
```

---

### Erro: `AUTH_JWT_SECRET deve ter pelo menos 32 caracteres em produção`

Usar segredo longo:

```env
AUTH_JWT_SECRET="use-um-segredo-real-com-mais-de-32-caracteres"
```

---

### Erro: login devolve `401`

Possíveis causas:

* seed não correu;
* email/password errados;
* utilizador está inativo;
* base de dados errada;
* cookie não está a ser enviado pelo cliente;
* token expirou;
* `AUTH_JWT_SECRET` mudou.

---

### Erro: CORS/origin

Confirmar:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

E confirmar a porta real do frontend.

---

### Erro: cookie não é guardado no browser

Em local:

```env
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
```

Em produção com HTTPS cross-site:

```env
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
```

---

### Erro nos scripts com `fetch is not defined`

Usar Node.js 18 ou superior:

```bash
node -v
```

---

### `npm test` fica em watch

Usar:

```bash
npm test -- --run
```

Ou comandos específicos:

```bash
npm run test:unit -- --run
```

---

### `test:api` devolve `fetch failed`

O backend provavelmente não está ligado.

Ligar o servidor:

```bash
npm run dev
```

Noutro terminal:

```bash
npm run test:api
```

---

### Testes E2E falham por login

Confirmar:

```bash
npm run prisma:seed
```

Confirmar variáveis:

```env
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
SEED_SANTACASA_EMAIL
SEED_SANTACASA_PASSWORD
SEED_FARMACIA_EMAIL
SEED_FARMACIA_PASSWORD
```

---

### Jobs alteram dados durante testes

Para ambiente de teste, considerar:

```env
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=false
```

---

## 24. Checklist antes de commit

Antes de fazer commit:

```bash
git status
```

Confirmar:

* [ ] `.env` não aparece no Git.
* [ ] `.env.example` aparece.
* [ ] `docs/` atualizado.
* [ ] `tests/` atualizado, se aplicável.
* [ ] `scripts/` atualizado, se aplicável.
* [ ] `package.json` coerente.
* [ ] `package-lock.json` atualizado, se houve alteração de dependências.
* [ ] `npm run test:all` passou.
* [ ] `npm run validate` passou.

Commit recomendado para esta fase:

```bash
git add .
git commit -m "docs: update backend documentation after test stabilization"
```

---

## 25. Checklist antes de deploy

Antes de deploy:

* [ ] Definir `NODE_ENV=production`.
* [ ] Definir `DATABASE_URL` de produção.
* [ ] Usar `AUTH_JWT_SECRET` forte.
* [ ] Definir `AUTH_COOKIE_SECURE=true`.
* [ ] Confirmar `AUTH_COOKIE_SAME_SITE`.
* [ ] Confirmar `ALLOWED_ORIGINS`.
* [ ] Confirmar se jobs devem estar ativos.
* [ ] Confirmar `PURGE_OFFSET_MONTHS`.
* [ ] Confirmar `HIGIENE_OFFSET_MONTHS`.
* [ ] Confirmar `HIGIENE_ANONYMIZE=false`, salvo decisão explícita.
* [ ] Confirmar `ALLOW_HIGIENE_ANONYMIZE=false`, salvo decisão explícita.
* [ ] Confirmar backups.
* [ ] Correr migrations.
* [ ] Correr seed apenas se fizer sentido.
* [ ] Testar login.
* [ ] Testar CORS/cookies com o frontend real.
* [ ] Correr `npm run validate`.

---

## 26. Limites atuais

O backend está estável para esta fase, mas existem limites conscientes:

* testes não usam ainda base isolada `.env.test`;
* não existe relatório formal de coverage;
* rate limit de login usa memória local;
* jobs correm no mesmo processo da API;
* em produção multi-instância será necessário rever scheduler/jobs;
* alguns formatos de resposta antigos ainda coexistem com formatos novos;
* ainda existem oportunidades futuras de reduzir duplicação de parsers/selects.

Nenhum destes pontos bloqueia a fase atual.

---

## 27. Próximos passos recomendados

### Curto prazo

* fazer commit do estado atual;
* manter backend estável;
* avançar para frontend ou documentação complementar;
* só voltar ao backend por bug real, nova regra ou ajuste necessário.

### Médio prazo

Adicionar testes quando houver alterações críticas em:

* `services`;
* regras de disponibilidade;
* regularizações;
* pedidos;
* histórico;
* permissões;
* jobs.

### Futuro

Adicionar coverage quando fizer sentido:

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

Também pode ser considerado no futuro:

* `.env.test`;
* base de dados dedicada para testes;
* logs estruturados;
* request ID;
* scheduler externo para jobs;
* Redis para rate limit;
* CI/CD com `npm run validate`.

---

## 28. Estado final desta fase

Resumo:

```txt
Backend funcionalmente estável.
Documentação principal atualizada.
Testes unitários passam.
Testes de integração passam.
Testes E2E passam.
test:all passa.
validate passa.
Suite de testes fechada por agora.
```

Recomendação final:

```txt
Fazer commit deste estado antes de iniciar nova fase.
```
