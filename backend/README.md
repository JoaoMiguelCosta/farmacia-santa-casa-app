# Backend — Farmácia Santa Casa

Backend da aplicação **Farmácia Santa Casa**, responsável pela gestão de utentes, medicação habitual, receitas, medicamentos não sujeitos a receita médica, Vendas Suspensas, pedidos, validações da Farmácia, rejeições, histórico, regularizações, alertas operacionais, autenticação, permissões e manutenção.

Construído com:

* Node.js 24;
* Express;
* Prisma;
* PostgreSQL;
* JWT em cookies HTTP-only;
* Vitest;
* Supertest.

**Estado atual:** funcional, testado, publicado em staging, com ambiente demo reproduzível e tecnicamente preparado para uma futura produção real.

**Última atualização:** 2026-06-19

---

## 1. Estado do projeto

### Concluído

* backend funcionalmente estável;
* frontend integrado com a API;
* autenticação por roles;
* gestão de utilizadores;
* gestão de utentes;
* medicação habitual;
* receitas;
* medicamentos não sujeitos a receita médica;
* Vendas Suspensas;
* pedidos Santa Casa;
* validação e rejeição pela Farmácia;
* histórico;
* regularizações;
* alertas operacionais;
* manutenção manual;
* jobs de manutenção;
* testes unitários;
* testes de integração;
* testes E2E;
* coverage;
* audit de dependências;
* GitHub Actions;
* health checks;
* security headers;
* request ID;
* graceful shutdown;
* staging público;
* seed demo protegido;
* smoke test remoto read-only;
* validação funcional ponta a ponta;
* hardening de variáveis de ambiente;
* templates separados para staging e produção;
* documentação de preparação para produção.

### Não criado por opção

A aplicação ainda não possui uma produção real.

Não foram criados:

* base de dados real de produção;
* serviços reais de produção;
* domínio final;
* backups pagos;
* utilizadores reais;
* monitorização paga;
* scheduler externo.

O staging atual serve como demonstração pública de portefólio.

---

## 2. Staging público

### Frontend

```txt
https://farmacia-santacasa-frontend-staging.onrender.com
```

### Backend

```txt
https://farmacia-santacasa-backend-staging.onrender.com
```

### API

```txt
https://farmacia-santacasa-backend-staging.onrender.com/api
```

### Ambiente

O staging:

* usa PostgreSQL exclusivo;
* usa `NODE_ENV=production`;
* usa HTTPS;
* usa cookies seguros;
* tem jobs automáticos desativados;
* contém apenas dados fictícios;
* possui contas de demonstração;
* pode ser reposto através do seed demo;
* não representa uma produção real.

---

## 3. Contas demo

Emails padrão:

| Role        | Email                          |
| ----------- | ------------------------------ |
| `ADMIN`     | `demo.admin@sistema.local`     |
| `SANTACASA` | `demo.santacasa@sistema.local` |
| `FARMACIA`  | `demo.farmacia@sistema.local`  |

As passwords:

* não existem no código;
* não existem nos templates;
* são fornecidas através de variáveis de ambiente;
* são guardadas como hash na base de dados;
* podem ser sincronizadas pelo seed demo.

---

## 4. Stack técnica

| Área             | Tecnologia         |
| ---------------- | ------------------ |
| Runtime          | Node.js 24 LTS     |
| Framework HTTP   | Express 4          |
| ORM              | Prisma 5           |
| Base de dados    | PostgreSQL         |
| Autenticação     | JWT                |
| Sessão           | Cookie HTTP-only   |
| Password hashing | bcryptjs           |
| Segurança HTTP   | Helmet             |
| Cookies          | cookie-parser      |
| Jobs             | node-cron          |
| Configuração     | dotenv             |
| Testes           | Vitest + Supertest |
| CI               | GitHub Actions     |
| Deploy atual     | Render             |

---

## 5. Roles

A aplicação possui três roles.

### `ADMIN`

Pode:

* gerir utilizadores;
* consultar health administrativo;
* aceder à manutenção;
* executar jobs manualmente;
* aceder aos contextos Santa Casa e Farmácia.

### `SANTACASA`

Pode:

* gerir utentes;
* gerir medicação habitual;
* criar receitas;
* criar medicamentos não sujeitos a receita médica;
* criar medicamentos para Venda Suspensa;
* criar pedidos;
* consultar pedidos;
* consultar histórico;
* consultar regularizações;
* acompanhar o dashboard operacional.

### `FARMACIA`

Pode:

* consultar pedidos pendentes;
* validar pedidos;
* rejeitar pedidos;
* consultar histórico;
* consultar regularizações;
* consultar alertas;
* fechar alertas;
* acompanhar o dashboard operacional.

---

## 6. Fluxo funcional principal

```txt
1. A Santa Casa seleciona ou cria um utente.

2. Pode registar:
   - medicação habitual;
   - receita;
   - medicamento não sujeito a receita médica;
   - medicamento para Venda Suspensa.

3. A Santa Casa cria um pedido.

4. O backend cria um alerta para a Farmácia.

5. A Farmácia consulta o pedido.

6. A Farmácia valida ou rejeita.

7. Quando valida:
   - medicamentos com receita são dispensados;
   - medicamentos não sujeitos a receita médica são processados;
   - Vendas Suspensas geram regularizações.

8. Quando surge uma receita compatível:
   - a regularização pode ser aplicada;
   - são criados eventos;
   - são atualizadas quantidades;
   - são criados alertas de regularização.
```

---

## 7. Estrutura principal

```txt
backend/
├── docs/
│   ├── API_ROUTES.md
│   ├── ARCHITECTURE.md
│   ├── BUSINESS_RULES.md
│   ├── ENVIRONMENT.md
│   ├── MAINTENANCE_JOBS.md
│   ├── PRODUCTION_CHECKLIST.md
│   └── TESTING.md
│
├── prisma/
│   ├── demo/
│   │   ├── demo-dates.js
│   │   ├── demo-dataset.js
│   │   ├── demo-persist.js
│   │   ├── demo-reset.js
│   │   └── demo-verify.js
│   ├── migrations/
│   ├── schema.prisma
│   ├── seed.js
│   └── seed-demo.js
│
├── scripts/
│   ├── manual/
│   │   ├── test-current-api.js
│   │   ├── test-higiene-job.js
│   │   ├── test-purge-history-job.js
│   │   └── test-receita-expiry-job.js
│   └── smoke/
│       └── staging-auth-smoke.js
│
├── src/
│   ├── app/
│   │   ├── app.js
│   │   └── server.js
│   ├── config/
│   │   ├── auth.config.js
│   │   └── env.js
│   ├── db/
│   ├── jobs/
│   ├── middlewares/
│   ├── modules/
│   ├── routes/
│   └── shared/
│
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   ├── helpers/
│   ├── integration/
│   └── unit/
│
├── .env.example
├── .env.staging.example
├── .env.production.example
├── .node-version
├── package.json
├── package-lock.json
├── vitest.config.mjs
└── README.md
```

---

## 8. Documentação

A documentação aprofundada encontra-se em:

```txt
backend/docs/
```

| Documento                 | Conteúdo                                    |
| ------------------------- | ------------------------------------------- |
| `API_ROUTES.md`           | Endpoints, permissões, payloads e respostas |
| `ARCHITECTURE.md`         | Arquitetura interna                         |
| `BUSINESS_RULES.md`       | Regras do domínio                           |
| `ENVIRONMENT.md`          | Ambientes, variáveis, staging e produção    |
| `MAINTENANCE_JOBS.md`     | Jobs, previews e execuções                  |
| `PRODUCTION_CHECKLIST.md` | Checklist de staging e produção             |
| `TESTING.md`              | Estratégia e comandos de testes             |

---

## 9. Requisitos locais

### Node.js

O backend usa:

```txt
Node.js 24 LTS
```

Intervalo suportado:

```json
"engines": {
  "node": ">=24.0.0 <25.0.0"
}
```

Confirmar:

```bash
node --version
```

Resultado esperado:

```txt
v24.x.x
```

### PostgreSQL

É necessário um PostgreSQL local ou remoto acessível através de:

```env
DATABASE_URL
```

---

## 10. Instalação local

### Entrar na pasta

```bash
cd backend
```

### Instalar dependências

```bash
npm install
```

### Criar o ambiente local

PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Editar os valores no `.env`.

### Gerar Prisma Client

```bash
npm run prisma:generate
```

### Aplicar migrations em desenvolvimento

```bash
npm run prisma:migrate
```

### Executar seed local

```bash
npm run prisma:seed
```

### Arrancar

```bash
npm run dev
```

API local:

```txt
http://localhost:3001/api
```

---

## 11. Variáveis de ambiente

Templates disponíveis:

```txt
.env.example
.env.staging.example
.env.production.example
```

### Desenvolvimento

```txt
backend/.env.example
```

### Staging público

```txt
backend/.env.staging.example
```

Inclui documentação para:

* Render;
* contas demo;
* seed demo;
* cookies cross-site;
* smoke test;
* jobs desativados.

### Produção futura

```txt
backend/.env.production.example
```

Não inclui:

* contas demo;
* passwords demo;
* confirmação do seed demo;
* variáveis do smoke test de staging.

Documentação completa:

```txt
docs/ENVIRONMENT.md
```

---

## 12. Segurança de ambiente

O backend bloqueia o arranque quando encontra configurações inseguras.

### Base em falta

```txt
[env] DATABASE_URL em falta.
```

### Base local em produção

```txt
[env] DATABASE_URL não pode apontar para localhost/127.0.0.1 em produção.
```

### JWT ausente

```txt
[env] AUTH_JWT_SECRET em falta.
```

### JWT curto

```txt
[env] AUTH_JWT_SECRET deve ter pelo menos 32 caracteres em produção.
```

### Cookie inseguro

```txt
[env] AUTH_COOKIE_SECURE deve ser true em produção.
```

### SameSite inválido

```txt
[env] AUTH_COOKIE_SAME_SITE=none exige AUTH_COOKIE_SECURE=true.
```

### CORS ausente ou inseguro

```txt
[env] ALLOWED_ORIGINS é obrigatório em produção.
[env] ALLOWED_ORIGINS não pode estar vazio em produção.
[env] ALLOWED_ORIGINS não pode conter '*' em produção.
[env] ALLOWED_ORIGINS não pode conter localhost/127.0.0.1 em produção.
```

---

## 13. Prisma

### Gerar cliente

```bash
npm run prisma:generate
```

### Desenvolvimento

```bash
npm run prisma:migrate
```

### Staging e produção

```bash
npm run prisma:migrate:deploy
```

### Prisma Studio

```bash
npm run prisma:studio
```

Nunca usar em staging ou produção:

```bash
prisma migrate dev
```

---

## 14. Seed inicial

Comando:

```bash
npm run prisma:seed
```

### Development e test

Pode criar:

* `ADMIN`;
* `SANTACASA`;
* `FARMACIA`.

### Production

Por defeito:

```env
ALLOW_PRODUCTION_SEED=false
```

Quando autorizado temporariamente, cria apenas o `ADMIN` inicial.

Não cria:

* Santa Casa;
* Farmácia;
* dados demo.

Depois do setup:

```env
ALLOW_PRODUCTION_SEED=false
```

As restantes contas devem ser criadas através de:

```txt
Sistema > Utilizadores
```

---

## 15. Seed demo

Comando:

```bash
npm run prisma:seed:demo
```

Proteção obrigatória:

```env
ALLOW_DEMO_SEED=true
DEMO_SEED_CONFIRMATION=PORTFOLIO_DEMO
```

O seed demo:

* cria ou atualiza as três contas demo;
* sincroniza passwords;
* repõe dados fictícios;
* é transacional;
* valida o resultado final;
* pode ser executado novamente;
* não deve ser usado em produção real.

Durante operação normal:

```env
ALLOW_DEMO_SEED=false
DEMO_SEED_CONFIRMATION=""
```

O seed nunca deve ficar permanentemente no Build Command.

Documentação:

```txt
docs/ENVIRONMENT.md
```

---

## 16. Scripts NPM

### Desenvolvimento

```bash
npm run dev
npm start
```

### Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run prisma:studio
npm run prisma:seed
npm run prisma:seed:demo
```

### Testes

```bash
npm test
npm run test:watch
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:all
npm run test:coverage
npm run validate
```

### Staging

```bash
npm run test:staging:auth
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

### Segurança

```bash
npm run audit
```

---

## 17. Testes

Estrutura:

```txt
tests/
├── unit/
├── integration/
└── e2e/
```

### Unitários

Cobrem:

* validators;
* mappers;
* utils;
* normalização;
* paginação;
* datas;
* quantidades;
* DTOs.

### Integração

Cobrem os jobs com Prisma e PostgreSQL:

* receita expiry;
* higiene;
* purge de histórico.

### E2E

Cobrem:

* autenticação;
* roles;
* utilizadores;
* utentes;
* medicação habitual;
* receitas;
* medicamentos não sujeitos a receita médica;
* Vendas Suspensas;
* pedidos;
* histórico;
* regularizações;
* alertas;
* manutenção;
* health checks;
* security headers;
* request ID;
* rate limit.

### Comandos finais

```bash
npm run test:all
npm run test:coverage
npm run validate
```

Estado atual:

```txt
Unit tests        passam
Integration tests passam
E2E tests         passam
Coverage          configurado
Audit             passa
CI                passa
```

Os testes não garantem cobertura matemática de 100%.

Cobrem a matriz crítica do projeto.

---

## 18. Smoke test remoto

Ficheiro:

```txt
scripts/smoke/staging-auth-smoke.js
```

Comando:

```bash
npm run test:staging:auth
```

É um teste read-only.

Valida:

* health live;
* health ready;
* CORS;
* preflight;
* security headers;
* request ID;
* login das três roles;
* `/auth/me`;
* permissões;
* bloqueios cruzados;
* logout;
* origem não autorizada;
* cookies seguros.

Não cria nem altera dados operacionais.

Confirmação obrigatória:

```env
STAGING_SMOKE_CONFIRMATION=STAGING_READ_ONLY
```

Resultado esperado:

```txt
STAGING AUTH SMOKE PASSOU
```

---

## 19. Health checks

### Liveness

```txt
GET /api/health/live
```

Público.

Confirma que o processo está ativo.

### Readiness

```txt
GET /api/health/ready
```

Público.

Confirma API e PostgreSQL.

### Administrativo

```txt
GET /api/health
```

Requer `ADMIN`.

---

## 20. Segurança HTTP

A API usa:

* Helmet;
* cookie HTTP-only;
* cookie Secure em produção;
* SameSite configurável;
* CORS restrito;
* origin guard;
* request ID;
* rate limit de login;
* erros sem stack em produção;
* graceful shutdown.

O header:

```txt
X-Powered-By
```

está desativado.

Todas as respostas devem incluir:

```txt
X-Request-Id
```

---

## 21. Jobs

Jobs existentes:

| Job              | Objetivo                         |
| ---------------- | -------------------------------- |
| `receita-expiry` | Expirar linhas de receita        |
| `higiene`        | Tratar utentes removidos antigos |
| `purge-history`  | Remover histórico fechado        |

Configuração conservadora:

```env
ENABLE_JOBS=false
ENABLE_RECEITAS_EXPIRY=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
```

Em produção, `ENABLE_JOBS` fica `false` por defeito quando não é definido.

Para uma utilização real, preferir:

* worker único;
* scheduler externo;
* monitorização;
* backups;
* logs persistentes.

---

## 22. Manutenção

Apenas `ADMIN`.

Rotas:

```txt
GET  /api/manutencao/jobs

GET  /api/manutencao/jobs/receita-expiry/preview
POST /api/manutencao/jobs/receita-expiry/run

GET  /api/manutencao/jobs/higiene/preview
POST /api/manutencao/jobs/higiene/run

GET  /api/manutencao/jobs/purge-history/preview
POST /api/manutencao/jobs/purge-history/run
```

Confirmações:

```json
{
  "confirm": "RUN_RECEITA_EXPIRY"
}
```

```json
{
  "confirm": "RUN_HIGIENE",
  "offsetMonths": 12,
  "anonymize": false
}
```

```json
{
  "confirm": "RUN_PURGE_HISTORY",
  "backupConfirmed": true,
  "offsetMonths": 6
}
```

O purge é destrutivo.

Não deve ser executado sem backup e restore testado.

---

## 23. Render

### Backend

Configuração validada:

```txt
Root Directory: backend
Build Command: npm ci && npm run prisma:migrate:deploy
Start Command: npm start
Auto-Deploy: On Commit
Included Paths: backend/**
```

Runtime:

```env
NODE_VERSION=24
```

O Build Command normal não contém:

```txt
prisma:seed
prisma:seed:demo
```

### Logs esperados

```txt
[server] listening on port <PORT> (production)
[jobs] todos os jobs DESATIVADOS por ENABLE_JOBS=false
```

---

## 24. GitHub Actions

Workflow:

```txt
.github/workflows/backend-ci.yml
```

Executa:

1. PostgreSQL service;
2. Node.js 24;
3. `npm ci`;
4. Prisma Client;
5. migrations;
6. testes unitários;
7. testes de integração;
8. seed E2E;
9. testes E2E;
10. seed coverage;
11. coverage;
12. audit.

Os jobs ficam desativados no CI.

---

## 25. Staging validado

Foram validados:

### Autenticação

* login `ADMIN`;
* login `SANTACASA`;
* login `FARMACIA`;
* `/auth/me`;
* sessão após refresh;
* logout;
* cookies;
* CORS;
* permissões.

### Santa Casa

* Home;
* Dashboard;
* Utentes;
* Operação;
* Medicação habitual;
* Receitas;
* Medicamentos não sujeitos a receita médica;
* Vendas Suspensas;
* Pedidos;
* Histórico;
* Regularizações.

### Farmácia

* Home;
* Dashboard;
* Pedidos;
* Validação;
* Rejeição;
* Histórico;
* Regularizações;
* Alertas.

### Sistema

* Utilizadores;
* Health;
* Manutenção;
* Permissões.

### Ponta a ponta

* criação operacional;
* envio de pedido;
* tratamento pela Farmácia;
* regularização;
* histórico;
* persistência;
* reposição final do dataset demo.

---

## 26. Preparação para produção

O projeto está tecnicamente preparado, mas a produção ainda requer:

* PostgreSQL exclusivo;
* backups;
* restore testado;
* domínios finais;
* HTTPS;
* secrets exclusivos;
* utilizadores reais;
* política de jobs;
* monitorização;
* logs persistentes;
* plano de rollback;
* validação pós-deploy.

Checklist:

```txt
docs/PRODUCTION_CHECKLIST.md
```

Template:

```txt
.env.production.example
```

A produção real nunca deve conter:

```txt
DEMO_*
ALLOW_DEMO_SEED
DEMO_SEED_CONFIRMATION
STAGING_*
```

---

## 27. Limitações atuais

Limitações conscientes:

* coverage sem threshold obrigatório;
* rate limit em memória;
* jobs integrados no processo da API;
* sem Redis;
* sem logs estruturados persistentes;
* sem `.env.test` dedicado obrigatório;
* produção real ainda não criada;
* backups e restore não testados numa infraestrutura real;
* alguns formatos antigos de resposta ainda coexistem.

Estes pontos não bloqueiam o ambiente de portefólio.

Devem ser revistos antes de uma utilização real com escala.

---

## 28. Checklist antes de commit

```bash
git status
git diff --check
```

Backend:

```bash
npm run test:all
npm run test:coverage
npm run audit
```

Frontend:

```bash
npm run lint
npm run build
```

Confirmar:

* `.env` real não aparece;
* passwords não aparecem;
* templates aparecem;
* package lock está sincronizado;
* working tree contém apenas alterações esperadas.

---

## 29. Estado final

Resumo:

```txt
Backend funcionalmente estável.
Frontend integrado.
Testes automatizados passam.
Coverage configurado.
CI ativo.
Staging publicado.
Seed demo protegido.
Smoke test remoto validado.
Fluxo ponta a ponta validado.
Configuração endurecida.
Produção futura documentada.
```

Definição final:

```txt
Aplicação full-stack funcional, testada, publicada em staging,
com ambiente demo reproduzível e preparada tecnicamente para produção.
```
