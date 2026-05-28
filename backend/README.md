# Backend — Farmácia Santa Casa

Backend da aplicação **Farmácia Santa Casa**, responsável pela gestão de utentes, receitas, medicamentos não sujeitos a receita médica, Vendas Suspensas, pedidos, validações da Farmácia, regularizações, autenticação, permissões e jobs de manutenção.

Este backend foi construído com **Node.js**, **Express**, **Prisma** e **PostgreSQL**.

---

## 1. Índice

- [1. Índice](#1-índice)
- [2. Estado atual](#2-estado-atual)
- [3. Objetivo do backend](#3-objetivo-do-backend)
- [4. Stack técnica](#4-stack-técnica)
- [5. Estrutura principal](#5-estrutura-principal)
- [6. Documentação complementar](#6-documentação-complementar)
- [7. Instalação local](#7-instalação-local)
- [8. Variáveis de ambiente](#8-variáveis-de-ambiente)
- [9. Base de dados e Prisma](#9-base-de-dados-e-prisma)
- [10. Seed inicial](#10-seed-inicial)
- [11. Scripts NPM](#11-scripts-npm)
- [12. Como arrancar o backend](#12-como-arrancar-o-backend)
- [13. Autenticação e autorização](#13-autenticação-e-autorização)
- [14. Contextos principais da API](#14-contextos-principais-da-api)
- [15. Modelo funcional resumido](#15-modelo-funcional-resumido)
- [16. Fluxo principal da aplicação](#16-fluxo-principal-da-aplicação)
- [17. Jobs de manutenção](#17-jobs-de-manutenção)
- [18. Testes](#18-testes)
- [19. Scripts manuais](#19-scripts-manuais)
- [20. Segurança](#20-segurança)
- [21. Convenções de desenvolvimento](#21-convenções-de-desenvolvimento)
- [22. Troubleshooting](#22-troubleshooting)
- [23. Checklist antes de commit](#23-checklist-antes-de-commit)
- [24. Checklist antes de deploy](#24-checklist-antes-de-deploy)
- [25. Limites atuais](#25-limites-atuais)
- [26. Próximos passos recomendados](#26-próximos-passos-recomendados)

---

## 2. Estado atual

Estado validado nesta fase:

- documentação técnica e funcional criada;
- `.env.example` criado;
- scripts manuais mantidos;
- Vitest e Supertest instalados;
- testes unitários criados;
- testes de integração criados;
- testes E2E criados;
- scripts manuais principais validados;
- `npm audit` sem vulnerabilidades conhecidas no momento da validação.

Comandos validados:

```bash
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm audit
```

Os testes atuais **não representam cobertura de 100%** do backend. Representam uma base sólida de validação inicial para continuar o projeto com mais segurança.

---

## 3. Objetivo do backend

Este backend gere a comunicação entre dois contextos funcionais principais:

- **Santa Casa**
  - gere utentes;
  - regista receitas;
  - regista medicamentos não sujeitos a receita médica;
  - regista Vendas Suspensas;
  - cria pedidos para a Farmácia;
  - consulta histórico e regularizações;
  - acompanha sinais/dashboard operacional.

- **Farmácia**
  - consulta pedidos pendentes;
  - valida pedidos;
  - rejeita pedidos;
  - consulta regularizações;
  - acompanha sinais/dashboard operacional.

Também existe um contexto **Admin**, responsável por:

- gestão de utilizadores;
- acesso a manutenção;
- execução manual de jobs;
- endpoints administrativos.

---

## 4. Stack técnica

| Área | Tecnologia |
|---|---|
| Runtime | Node.js |
| Framework HTTP | Express |
| ORM | Prisma |
| Base de dados | PostgreSQL |
| Autenticação | JWT em cookie HTTP-only |
| Password hashing | bcryptjs |
| Jobs | node-cron |
| Configuração | dotenv |
| Desenvolvimento | nodemon |
| Testes | Vitest + Supertest |

---

## 5. Estrutura principal

Estrutura simplificada do backend:

```txt
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── scripts/
│   ├── manual/
│   ├── test-current-api.js
│   ├── test-higiene-job.js
│   ├── test-purge-history-job.js
│   └── test-receita-expiry-job.js
├── src/
│   ├── app/
│   │   ├── app.js
│   │   └── server.js
│   ├── config/
│   │   ├── auth.config.js
│   │   └── env.js
│   ├── db/
│   │   └── prisma.js
│   ├── jobs/
│   │   ├── higiene.job.js
│   │   ├── index.js
│   │   ├── purgeHistory.job.js
│   │   └── receitaExpiry.job.js
│   ├── middlewares/
│   ├── modules/
│   ├── routes/
│   └── shared/
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   ├── helpers/
│   ├── integration/
│   └── unit/
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

| Documento | Objetivo |
|---|---|
| `BUSINESS_RULES.md` | Regras funcionais do domínio |
| `ARCHITECTURE.md` | Arquitetura interna do backend |
| `API_ROUTES.md` | Endpoints, payloads e permissões |
| `ENVIRONMENT.md` | Variáveis de ambiente e configuração |
| `MAINTENANCE_JOBS.md` | Jobs automáticos e manuais |
| `TESTING.md` | Estratégia e estado atual dos testes |

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
npx prisma generate
```

### 7.5 Aplicar migrations

```bash
npx prisma migrate dev
```

### 7.6 Criar utilizadores iniciais

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

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `DATABASE_URL` | Sim | URL PostgreSQL usada pelo Prisma |
| `NODE_ENV` | Sim | Ambiente atual |
| `PORT` | Sim | Porta do servidor |
| `TZ` | Sim | Timezone dos jobs |
| `JSON_LIMIT` | Sim | Limite de payload JSON |
| `ALLOWED_ORIGINS` | Sim | Origins permitidas para CORS |
| `AUTH_JWT_SECRET` | Sim | Segredo para assinar JWT |
| `AUTH_COOKIE_NAME` | Sim | Nome do cookie de sessão |
| `AUTH_TOKEN_EXPIRES_IN` | Sim | Duração do token |
| `AUTH_COOKIE_MAX_AGE_MS` | Sim | Duração do cookie em milissegundos |
| `AUTH_COOKIE_SECURE` | Sim | Define se o cookie exige HTTPS |
| `AUTH_COOKIE_SAME_SITE` | Sim | Política SameSite do cookie |

### Local development recomendado

```env
NODE_ENV="development"
PORT=3001
TZ="Europe/Lisbon"
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
```

### Produção

Em produção, usar obrigatoriamente:

```env
NODE_ENV="production"
AUTH_COOKIE_SECURE=true
```

Se `AUTH_COOKIE_SAME_SITE=none`, então `AUTH_COOKIE_SECURE` também tem de ser `true`.

---

## 9. Base de dados e Prisma

O backend usa Prisma com PostgreSQL.

### Comandos úteis

Gerar Prisma Client:

```bash
npx prisma generate
```

Criar/aplicar migration em desenvolvimento:

```bash
npx prisma migrate dev
```

Abrir Prisma Studio:

```bash
npx prisma studio
```

Executar seed:

```bash
npx prisma db seed
```

---

## 10. Seed inicial

O seed cria/atualiza três utilizadores:

| Role | Email padrão |
|---|---|
| `ADMIN` | `admin@sistema.local` |
| `SANTACASA` | `santacasa@sistema.local` |
| `FARMACIA` | `farmacia@sistema.local` |

As passwords vêm das variáveis:

```env
SEED_ADMIN_PASSWORD
SEED_SANTACASA_PASSWORD
SEED_FARMACIA_PASSWORD
```

Em desenvolvimento podem ser simples. Fora de desenvolvimento, devem ser trocadas.

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
```

### Testes automatizados

```bash
npm test
npm run test:watch
npm run test:unit
npm run test:integration
npm run test:e2e
```

Validação recomendada sem watch:

```bash
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm audit
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

---

## 13. Autenticação e autorização

A autenticação usa:

- login com email/password;
- JWT assinado;
- cookie HTTP-only;
- middleware `requireAuth`;
- middleware `requireRole`.

### Rotas de auth

```txt
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Roles

| Role | Acesso |
|---|---|
| `ADMIN` | Admin, manutenção, Santa Casa e Farmácia |
| `SANTACASA` | Contexto Santa Casa |
| `FARMACIA` | Contexto Farmácia |

### Proteção principal

A API está organizada por contexto:

```txt
/api/auth
/api/santacasa
/api/farmacia
/api/admin
/api/manutencao
```

---

## 14. Contextos principais da API

### Auth

```txt
/api/auth
```

Responsável por login, logout e utilizador atual.

### Santa Casa

```txt
/api/santacasa
```

Responsável por:

- utentes;
- receitas;
- medicamentos não sujeitos a receita médica;
- Vendas Suspensas;
- pedidos;
- regularizações;
- dashboard/sinais.

### Farmácia

```txt
/api/farmacia
```

Responsável por:

- listar pedidos;
- validar pedidos;
- rejeitar pedidos;
- consultar regularizações;
- consultar dashboard/sinais.

### Admin

```txt
/api/admin
```

Responsável por gestão de utilizadores.

### Manutenção

```txt
/api/manutencao
```

Responsável por preview e execução manual de jobs.

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

### Receita

Documento com:

- `numero19`;
- `pinAcesso6`;
- `pinOpcao4`;
- linhas de medicamento.

### Linha de receita

Representa um medicamento numa receita.

Estados:

```txt
ATIVA
EXPIRADA
```

### Medicamento não sujeito a receita médica

Medicamento disponível sem receita.

Internamente, o modelo técnico pode chamar-se `SemReceita`.

### Venda Suspensa

Venda criada quando não existe receita ativa disponível.

Internamente, o modelo técnico pode chamar-se `Extra`.

### Pedido

Pedido enviado pela Santa Casa à Farmácia.

Estados principais:

```txt
PENDENTE
VALIDADO
REJEITADO
CANCELADO
```

### Regularização

Registo criado quando uma Venda Suspensa validada precisa de ser regularizada posteriormente com receita.

Estados:

```txt
PENDENTE
PARCIALMENTE_REGULARIZADO
REGULARIZADO
```

---

## 16. Fluxo principal da aplicação

Fluxo funcional típico:

```txt
1. Santa Casa cria utente
2. Santa Casa regista receita, medicamento não sujeito a receita médica ou Venda Suspensa
3. Santa Casa cria pedido
4. Farmácia consulta pedidos pendentes
5. Farmácia valida ou rejeita pedido
6. Se validar:
   - receita é dispensada;
   - medicamento não sujeito a receita médica é debitado;
   - Venda Suspensa gera regularização;
7. Se nova receita cobrir regularização pendente:
   - regularização é aplicada automaticamente;
   - evento de regularização é criado;
   - quantidade dispensada é atualizada.
```

---

## 17. Jobs de manutenção

Existem três jobs principais:

| Job | Objetivo | Frequência padrão |
|---|---|---|
| `receita-expiry` | Expira linhas de receita vencidas e cancela pedidos afetados | diária |
| `higiene` | Trata utentes removidos antigos | mensal |
| `purge-history` | Remove histórico antigo fechado | mensal |

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

---

## 18. Testes

### 18.1 Estado atual

Existem testes automatizados organizados em:

```txt
tests/
├── unit/
├── integration/
└── e2e/
```

### 18.2 Unit tests

Cobrem:

- validators;
- mappers;
- utils.

Exemplos:

```txt
tests/unit/validators/
tests/unit/mappers/
tests/unit/utils/
```

### 18.3 Integration tests

Cobrem jobs com Prisma/base de dados:

```txt
tests/integration/jobs/
├── receitaExpiry.job.test.js
├── higiene.job.test.js
└── purgeHistory.job.test.js
```

### 18.4 E2E tests

Cobrem API Express com Supertest:

```txt
tests/e2e/
├── auth.e2e.test.js
├── santacasa.e2e.test.js
├── farmacia.e2e.test.js
└── manutencao.e2e.test.js
```

### 18.5 Comandos recomendados

```bash
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm audit
```

### 18.6 Limite da cobertura atual

Os testes atuais não garantem 100% de cobertura.

Ainda podem ser adicionados testes mais profundos para:

- services;
- repositories;
- FEFO;
- regularizações parciais;
- fluxos negativos complexos;
- Admin users E2E completo;
- histórico com filtros avançados;
- rollback/transações.

---

## 19. Scripts manuais

Os scripts em `scripts/` foram mantidos como smoke tests/manuais.

Eles são úteis, mas não substituem os testes automatizados.

```bash
npm run test:manual
```

Atenção:

- `test:api` precisa do servidor ligado com `npm run dev`;
- os scripts dos jobs criam dados reais;
- não devem ser executados contra produção.

---

## 20. Segurança

### Não versionar

Nunca versionar:

```txt
.env
.env.*
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

- `DATABASE_URL` real;
- passwords reais;
- `AUTH_JWT_SECRET`;
- credenciais de produção.

### Produção

Em produção:

```env
NODE_ENV="production"
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
```

`AUTH_JWT_SECRET` deve ser longo, aleatório e privado.

---

## 21. Convenções de desenvolvimento

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

| Camada | Responsabilidade |
|---|---|
| `routes` | Define endpoints |
| `controller` | Lê request e responde |
| `service` | Aplica regras de negócio |
| `repository` | Acede à base de dados |
| `validators` | Valida payload/query |
| `mappers` | Converte dados para DTO |

### Regra importante

Não colocar regras de negócio diretamente em controllers.

Controllers devem ser finos.

---

## 22. Troubleshooting

### Erro: `DATABASE_URL em falta`

Verificar se existe `.env` e se tem:

```env
DATABASE_URL="..."
```

### Erro: `AUTH_JWT_SECRET em falta`

Adicionar:

```env
AUTH_JWT_SECRET="..."
```

### Erro: login devolve `401`

Possíveis causas:

- seed não correu;
- email/password errados;
- utilizador está inativo;
- base de dados errada;
- cookie não está a ser enviado pelo cliente.

### Erro: CORS

Confirmar:

```env
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
```

E confirmar a porta real do frontend.

### Erro: cookie não é guardado no browser

Em local:

```env
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
```

Em produção com HTTPS:

```env
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
```

### Erro nos scripts com `fetch is not defined`

Usar Node.js 18 ou superior:

```bash
node -v
```

### `npm test` fica em watch

Usar:

```bash
npm test -- --run
```

Ou comandos específicos:

```bash
npm run test:unit -- --run
```

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

## 23. Checklist antes de commit

Antes de fazer commit:

```bash
git status
```

Confirmar:

- [ ] `.env` não aparece no Git.
- [ ] `.env.example` aparece.
- [ ] `docs/` atualizado.
- [ ] `tests/` atualizado, se aplicável.
- [ ] `scripts/` atualizado, se aplicável.
- [ ] `package.json` coerente.
- [ ] `package-lock.json` atualizado.
- [ ] `npm run test:unit -- --run` passou.
- [ ] `npm run test:integration -- --run` passou.
- [ ] `npm run test:e2e -- --run` passou.
- [ ] `npm audit` devolveu 0 vulnerabilidades.

Commit recomendado para esta fase:

```bash
git add .
git commit -m "docs: update backend documentation after tests"
```

---

## 24. Checklist antes de deploy

Antes de deploy:

- [ ] Definir `NODE_ENV=production`.
- [ ] Definir `DATABASE_URL` de produção.
- [ ] Usar `AUTH_JWT_SECRET` forte.
- [ ] Definir `AUTH_COOKIE_SECURE=true`.
- [ ] Confirmar `AUTH_COOKIE_SAME_SITE`.
- [ ] Confirmar `ALLOWED_ORIGINS`.
- [ ] Confirmar se jobs devem estar ativos.
- [ ] Confirmar backups.
- [ ] Correr migrations.
- [ ] Correr seed apenas se fizer sentido.
- [ ] Testar login.
- [ ] Testar CORS/cookies com o frontend real.
- [ ] Correr testes automatizados.
- [ ] Confirmar `npm audit`.

---

## 25. Limites atuais

Os testes estão bons para esta fase, mas não cobrem tudo.

Ainda faltam testes mais profundos para:

- services críticos;
- repositories críticos;
- FEFO;
- regularizações parciais;
- pedidos com múltiplas regras negativas;
- Admin users E2E completo;
- histórico com filtros avançados;
- rollback/transações;
- base de dados isolada para testes.

---

## 26. Próximos passos recomendados

### Curto prazo

- manter os testes atuais;
- avançar para análise/documentação do frontend;
- validar integração frontend/backend.

### Médio prazo

Adicionar testes quando houver alterações críticas em:

- `services`;
- regras de stock;
- regularizações;
- pedidos;
- histórico;
- permissões;
- jobs.

### Futuro

Adicionar coverage:

```bash
npm install -D @vitest/coverage-v8
```

Adicionar ao `package.json`:

```json
"test:coverage": "vitest --coverage"
```

Correr:

```bash
npm run test:coverage
```
