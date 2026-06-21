# Farmácia Santa Casa

Aplicação full-stack para gestão operacional entre a **Santa Casa**, a **Farmácia** e a área de **Sistema/Admin**.

O projeto centraliza o ciclo completo de utentes, medicação habitual, receitas, medicamentos não sujeitos a receita médica, medicamentos para Venda Suspensa, pedidos, validações, rejeições, regularizações, histórico, alertas e manutenção administrativa.

> **Estado atual:** aplicação funcional, testada e publicada num ambiente público de staging com dados fictícios. O projeto está tecnicamente preparado para uma futura produção real, mas a infraestrutura de produção ainda não foi criada.

---

## Demonstração pública

### Frontend

https://farmacia-santacasa-frontend-staging.onrender.com

### Backend

https://farmacia-santacasa-backend-staging.onrender.com

### API

https://farmacia-santacasa-backend-staging.onrender.com/api

### Contas demo

| Role | Email |
| --- | --- |
| `ADMIN` | `demo.admin@sistema.local` |
| `SANTACASA` | `demo.santacasa@sistema.local` |
| `FARMACIA` | `demo.farmacia@sistema.local` |

As passwords não são guardadas no repositório. Devem ser fornecidas separadamente para demonstração.

---

## Áreas da aplicação

### Santa Casa

Permite:

- gerir utentes;
- gerir medicação habitual;
- criar receitas;
- criar medicamentos não sujeitos a receita médica;
- criar medicamentos para Venda Suspensa;
- preparar e enviar pedidos;
- acompanhar pedidos;
- consultar histórico;
- consultar regularizações;
- acompanhar indicadores operacionais.

### Farmácia

Permite:

- consultar pedidos pendentes;
- validar pedidos;
- rejeitar pedidos;
- consultar histórico;
- acompanhar regularizações;
- consultar e fechar alertas operacionais;
- acompanhar indicadores operacionais.

### Sistema/Admin

Permite:

- gerir utilizadores;
- consultar o estado dos serviços;
- consultar previews dos jobs;
- executar jobs de manutenção com confirmação;
- aceder às áreas Santa Casa e Farmácia.

---

## Fluxo funcional principal

```text
1. A Santa Casa seleciona ou cria um utente.

2. Regista os elementos necessários:
   - medicação habitual;
   - receita;
   - medicamento não sujeito a receita médica;
   - medicamento para Venda Suspensa.

3. Adiciona itens ao pedido em preparação.

4. Envia o pedido para a Farmácia.

5. A Farmácia valida ou rejeita o pedido.

6. A validação atualiza quantidades, histórico e regularizações.

7. Quando surge uma receita compatível, a Venda Suspensa pode ser regularizada.

8. Os intervenientes acompanham o resultado através de dashboards,
   histórico, regularizações e alertas.
```

---

## Stack técnica

### Backend

- Node.js 24 LTS;
- Express;
- Prisma;
- PostgreSQL;
- JWT em cookie HTTP-only;
- bcryptjs;
- Helmet;
- node-cron;
- Vitest;
- Supertest.

### Frontend

- React;
- Vite;
- React Router;
- CSS Modules;
- Context API;
- Fetch API encapsulada;
- ESLint.

### Infraestrutura e qualidade

- Render;
- GitHub Actions;
- PostgreSQL em staging;
- migrations Prisma;
- testes unitários;
- testes de integração;
- testes E2E do backend;
- coverage;
- audit de dependências;
- smoke test remoto read-only.

---

## Estrutura do repositório

```text
Farmacia-Santacasa-v2/
├── .github/
│   └── workflows/
│       └── backend-ci.yml
├── backend/
│   ├── docs/
│   ├── prisma/
│   │   ├── demo/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── seed-demo.js
│   ├── scripts/
│   │   ├── manual/
│   │   └── smoke/
│   ├── src/
│   ├── tests/
│   ├── .env.example
│   ├── .env.staging.example
│   ├── .env.production.example
│   └── README.md
├── frontend/
│   ├── docs/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── .env.production.example
│   └── README.md
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## Requisitos locais

- Node.js 24 LTS;
- npm;
- PostgreSQL;
- Git.

Confirmar o runtime:

```bash
node --version
```

Resultado esperado:

```text
v24.x.x
```

---

## Instalação local

### 1. Clonar o repositório

```bash
git clone https://github.com/JoaoMiguelCosta/farmacia-santa-casa-app.git
cd farmacia-santa-casa-app
```

### 2. Instalar dependências

Na raiz:

```bash
npm run install:all
```

Em alternativa:

```bash
npm run install:backend
npm run install:frontend
```

### 3. Configurar o backend

PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Linux/macOS:

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` e configurar, no mínimo:

```env
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_santacasa_development?schema=public"
AUTH_JWT_SECRET="development-secret-with-at-least-32-characters"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
```

### 4. Configurar o frontend

PowerShell:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Linux/macOS:

```bash
cp frontend/.env.example frontend/.env
```

Configuração local:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

### 5. Preparar a base de dados

Na raiz:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 6. Arrancar backend e frontend

```bash
npm run dev
```

Endereços locais:

```text
Backend API → http://localhost:3001/api
Frontend    → http://localhost:5173
```

---

## Scripts da raiz

### Desenvolvimento

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
npm run start:backend
npm run preview:frontend
```

### Instalação

```bash
npm run install:backend
npm run install:frontend
npm run install:all
```

### Frontend

```bash
npm run build:frontend
npm run lint:frontend
npm run validate:frontend
```

### Backend

```bash
npm run test:backend
npm run test:backend:unit
npm run test:backend:integration
npm run test:backend:e2e
npm run test:backend:coverage
npm run test:backend:manual
npm run validate:backend
```

### Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run prisma:seed
```

### Segurança e validação

```bash
npm run audit
npm run validate
npm run test:backend:coverage
npm run validate:release
```

O `validate` executa:

- backend: unit, integration, E2E e audit;
- frontend: lint, build e audit.

O coverage não integra o `validate`. `npm run test:backend:coverage` é um alias executado a partir da raiz; chama `npm run test:coverage` dentro de `backend/` e gera o relatório de coverage usando a configuração definida em `backend/vitest.config.mjs`.

`npm run validate:release` executa `validate` e, em seguida, o coverage do backend. Indicado para uma validação mais abrangente antes de um release; não substitui o pipeline de CI.

---

## Backend

Documentação principal:

```text
backend/README.md
```

Documentação técnica:

```text
backend/docs/
├── API_ROUTES.md
├── ARCHITECTURE.md
├── BUSINESS_RULES.md
├── ENVIRONMENT.md
├── MAINTENANCE_JOBS.md
├── PRODUCTION_CHECKLIST.md
└── TESTING.md
```

Principais responsabilidades:

- API HTTP;
- autenticação e autorização;
- regras de negócio;
- persistência Prisma/PostgreSQL;
- validação de pedidos;
- regularizações;
- alertas;
- jobs;
- manutenção;
- health checks;
- graceful shutdown;
- segurança HTTP.

---

## Frontend

Documentação principal:

```text
frontend/README.md
```

Documentação técnica:

```text
frontend/docs/
├── API_CONTRACT.md
├── ARCHITECTURE.md
├── DEPLOYMENT.md
└── UI_COMPONENTS.md
```

A arquitetura é organizada por features:

```text
frontend/src/
├── app/
├── features/
│   ├── auth/
│   ├── farmacia/
│   ├── santacasa/
│   └── system/
├── pages/
└── shared/
```

As páginas em `pages/` são finas. A lógica fica em hooks, utils e APIs de cada feature. Os textos visíveis são centralizados em ficheiros de configuração sempre que aplicável.

---

## Autenticação e autorização

A autenticação utiliza:

- login por email e password;
- JWT;
- cookie HTTP-only;
- `credentials: "include"` no frontend;
- guards por role no frontend;
- validação real de sessão e permissões no backend.

Roles:

```text
ADMIN
SANTACASA
FARMACIA
```

Regra de segurança:

```text
O frontend controla a navegação.
O backend controla a autorização real.
```

---

## Variáveis de ambiente

### Backend

Templates:

```text
backend/.env.example
backend/.env.staging.example
backend/.env.production.example
```

### Frontend

Templates:

```text
frontend/.env.example
frontend/.env.production.example
```

Nunca versionar:

```text
backend/.env
frontend/.env
.env
```

Nunca colocar no frontend:

- passwords;
- `DATABASE_URL`;
- `AUTH_JWT_SECRET`;
- tokens privados;
- chaves privadas;
- credenciais reais.

Todas as variáveis `VITE_*` ficam acessíveis no bundle do browser.

---

## Segurança de configuração

O backend bloqueia o arranque quando deteta configurações inseguras, incluindo:

- `DATABASE_URL` ausente;
- base local em `NODE_ENV=production`;
- JWT ausente ou demasiado curto;
- cookie inseguro em produção;
- `SameSite=None` sem `Secure`;
- origins ausentes, locais ou com wildcard em produção.

O frontend bloqueia builds de produção quando `VITE_API_BASE_URL`:

- está ausente;
- não é uma URL válida;
- não usa HTTPS;
- aponta para localhost;
- contém query string;
- contém fragmento;
- não termina exatamente em `/api`.

---

## Testes e qualidade

### Backend

Disponíveis:

- testes unitários;
- testes de integração;
- testes E2E;
- coverage;
- audit;
- smoke test remoto de staging.

Comandos:

```bash
cd backend
npm run test:all
npm run test:coverage
npm run audit
npm run test:staging:auth
```

### Frontend

Validação atual:

```bash
cd frontend
npm run lint
npm run build
npm run audit
npm run validate
```

Ainda não existe uma suite automatizada de testes frontend.

### CI

Workflow:

```text
.github/workflows/backend-ci.yml
```

Executa:

- PostgreSQL service;
- Node.js 24;
- instalação limpa;
- Prisma generate;
- migrations;
- unit;
- integration;
- E2E;
- coverage;
- audit.

---

## Seed local e seed demo

### Seed local

```bash
npm run prisma:seed
```

### Seed demo de staging

```bash
cd backend
npm run prisma:seed:demo
```

O seed demo exige:

```env
ALLOW_DEMO_SEED=true
DEMO_SEED_CONFIRMATION=PORTFOLIO_DEMO
```

É exclusivo do ambiente de demonstração e não deve ser executado numa produção real.

---

## Jobs e manutenção

Jobs existentes:

```text
receita-expiry
higiene
purge-history
```

No staging, os jobs automáticos permanecem desativados.

A área de Sistema/Admin permite:

- consultar estado;
- executar preview;
- executar jobs com confirmação.

O `purge-history` é destrutivo e exige backup confirmado.

---

## Deploy atual

### Backend Render

```text
Root Directory: backend
Build Command: npm ci && npm run prisma:migrate:deploy
Start Command: npm start
```

### Frontend Render

A plataforma define:

```env
VITE_API_BASE_URL="https://farmacia-santacasa-backend-staging.onrender.com/api"
```

O frontend é reconstruído quando esta variável muda.

---

## Estado validado em staging

Foram validados:

- login das três roles;
- persistência da sessão após refresh;
- logout;
- CORS;
- cookies cross-site;
- permissões por role;
- rotas internas;
- fluxo Santa Casa;
- fluxo Farmácia;
- gestão de utilizadores;
- regularizações;
- histórico;
- alertas;
- manutenção;
- health checks;
- fluxo funcional ponta a ponta;
- reposição do dataset demo.

---

## Limitações conhecidas

- o frontend ainda não possui testes automatizados;
- o rate limit do backend usa memória da instância;
- os jobs estão integrados no processo da API;
- a produção real ainda não foi criada;
- backups e restore ainda não foram testados numa infraestrutura real;
- não existe observabilidade persistente dedicada.

Estas limitações não bloqueiam a versão de portefólio, mas devem ser revistas antes de uma utilização real.

---

## Estado de produção

O projeto está preparado tecnicamente para uma futura produção, mas ainda requer:

- PostgreSQL exclusivo;
- backups automáticos;
- restore testado;
- domínios finais;
- secrets exclusivos;
- utilizadores reais;
- estratégia de jobs;
- logs persistentes;
- monitorização;
- plano de rollback.

Checklist:

```text
backend/docs/PRODUCTION_CHECKLIST.md
```

---

## Checklist antes de commit

Na raiz:

```bash
git status
npm run validate
```

Confirmar que não aparecem:

```text
backend/.env
frontend/.env
backend/node_modules
frontend/node_modules
node_modules
frontend/dist
```

Para uma validação mais completa do backend:

```bash
cd backend
npm run test:coverage
```

---

## Estado final

```text
Aplicação full-stack funcional, testada e publicada em staging,
com ambiente demo reproduzível e preparada tecnicamente para produção.
```
