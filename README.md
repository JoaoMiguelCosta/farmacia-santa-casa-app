# Farmácia Santa Casa — Fullstack App

Aplicação fullstack para gestão operacional entre **Santa Casa** e **Farmácia**.

O projeto está dividido em duas partes principais:

```txt
Farmacia-Santacasa-v2/
├── backend/
└── frontend/
```

* `backend/` — API, regras de negócio, autenticação, base de dados, jobs e testes.
* `frontend/` — interface React para Santa Casa, Farmácia e Sistema/Admin.

> Estado atual: projeto em desenvolvimento.
> O backend já tem documentação e testes automatizados.
> O frontend já tem arquitetura principal, documentação, lint e build funcionais, mas ainda não tem testes automatizados.

---

## 1. Stack técnica

### Backend

* Node.js
* Express
* Prisma
* PostgreSQL
* JWT em cookie HTTP-only
* node-cron
* Vitest
* Supertest

### Frontend

* React
* Vite
* React Router
* CSS Modules
* Context API
* ESLint

### Raiz do projeto

* Scripts globais com `npm --prefix`
* `concurrently` para arrancar backend e frontend ao mesmo tempo

---

## 2. Estrutura geral

```txt
Farmacia-Santacasa-v2/
├── backend/
│   ├── docs/
│   ├── prisma/
│   ├── scripts/
│   ├── src/
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── docs/
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 3. Áreas da aplicação

### Santa Casa

Permite:

* gerir utentes;
* criar receitas;
* criar medicamentos não sujeitos a receita médica;
* criar Vendas Suspensas;
* preparar pedidos;
* enviar pedidos para a Farmácia;
* consultar regularizações;
* consultar histórico.

### Farmácia

Permite:

* consultar pedidos pendentes;
* validar pedidos;
* rejeitar pedidos;
* consultar regularizações;
* consultar histórico;
* acompanhar sinais operacionais.

### Sistema/Admin

Permite:

* consultar health/status dos serviços;
* gerir utilizadores;
* consultar jobs de manutenção;
* executar jobs administrativos quando permitido.

---

## 4. Requisitos locais

Antes de arrancar o projeto, garantir:

* Node.js instalado;
* npm instalado;
* PostgreSQL instalado e ativo;
* base de dados criada;
* `.env` configurado no backend;
* `.env` configurado no frontend, se necessário.

---

## 5. Instalação

Na raiz do projeto:

```bash
npm run install:all
```

Isto instala dependências em:

```txt
backend/
frontend/
```

Também podes instalar separadamente:

```bash
npm run install:backend
npm run install:frontend
```

---

## 6. Configuração de ambiente

### Backend

Criar:

```txt
backend/.env
```

A partir de:

```txt
backend/.env.example
```

PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

### Frontend

Criar:

```txt
frontend/.env
```

A partir de:

```txt
frontend/.env.example
```

PowerShell:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Variável frontend principal:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

---

## 7. Base de dados

Entrar no backend:

```bash
cd backend
```

Gerar Prisma Client:

```bash
npx prisma generate
```

Aplicar migrations:

```bash
npx prisma migrate dev
```

Executar seed:

```bash
npx prisma db seed
```

Ou pela raiz:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

---

## 8. Arrancar o projeto

### Backend e frontend ao mesmo tempo

Na raiz:

```bash
npm run dev
```

Isto arranca:

```txt
backend  → http://localhost:3001/api
frontend → http://localhost:5173
```

### Arrancar separadamente

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

---

## 9. Scripts principais da raiz

```json
{
  "dev": "concurrently --kill-others-on-fail -n BACKEND,FRONTEND -c blue,green \"npm run dev:backend\" \"npm run dev:frontend\"",
  "dev:backend": "npm --prefix backend run dev",
  "dev:frontend": "npm --prefix frontend run dev",
  "install:all": "npm run install:backend && npm run install:frontend",
  "validate": "npm run validate:backend && npm run validate:frontend"
}
```

### Desenvolvimento

```bash
npm run dev
```

### Validação completa

```bash
npm run validate
```

Este comando valida:

Backend:

* unit tests;
* integration tests;
* E2E tests;
* audit.

Frontend:

* lint;
* build;
* audit.

### Audits

```bash
npm run audit
```

### Frontend build

```bash
npm run build:frontend
```

### Frontend lint

```bash
npm run lint:frontend
```

---

## 10. Backend

Documentação principal:

```txt
backend/README.md
```

Documentação técnica:

```txt
backend/docs/
├── ARCHITECTURE.md
├── API_ROUTES.md
├── BUSINESS_RULES.md
├── ENVIRONMENT.md
├── MAINTENANCE_JOBS.md
└── TESTING.md
```

### Comandos backend

```bash
npm run dev:backend
npm run start:backend
npm run validate:backend
npm run test:backend:unit
npm run test:backend:integration
npm run test:backend:e2e
```

### Estado atual do backend

* documentação criada;
* `.env.example` criado;
* testes unitários criados;
* testes de integração criados;
* testes E2E criados;
* scripts manuais mantidos;
* jobs documentados;
* `npm audit` validado sem vulnerabilidades conhecidas no momento da última verificação.

---

## 11. Frontend

Documentação principal:

```txt
frontend/README.md
```

Documentação técnica:

```txt
frontend/docs/
├── ARCHITECTURE.md
├── API_CONTRACT.md
├── ENVIRONMENT.md
├── ROUTES.md
├── STATE_MANAGEMENT.md
├── TESTING.md
└── UI_COMPONENTS.md
```

### Comandos frontend

```bash
npm run dev:frontend
npm run build:frontend
npm run lint:frontend
npm run validate:frontend
```

### Estado atual do frontend

* arquitetura principal montada;
* autenticação e roles implementadas;
* integração com backend feita via `httpClient`;
* `.env.example` criado;
* documentação frontend criada;
* `npm run lint` passa;
* `npm run build` passa;
* ainda não existem testes automatizados frontend.

Existe aviso conhecido no build:

```txt
Some chunks are larger than 500 kB after minification.
```

Este aviso não bloqueia a fase atual. Deve ser tratado futuramente com code splitting.

---

## 12. Autenticação

A autenticação usa:

* login por email/password;
* cookie HTTP-only definido pelo backend;
* `credentials: "include"` no frontend;
* guards por role no frontend;
* validação real de sessão e permissões no backend.

Roles principais:

```txt
ADMIN
SANTACASA
FARMACIA
```

Regra principal:

```txt
Frontend controla navegação.
Backend controla segurança real.
```

---

## 13. Jobs de manutenção

O backend tem três jobs principais:

```txt
receita-expiry
higiene
purge-history
```

A área de Sistema/Admin permite:

* listar jobs;
* fazer preview;
* executar jobs quando permitido.

Atenção:

```txt
purge-history é destrutivo e pode remover histórico antigo.
```

Consultar:

```txt
backend/docs/MAINTENANCE_JOBS.md
frontend/docs/API_CONTRACT.md
```

---

## 14. Testes

### Backend

O backend já tem testes automatizados.

Comandos:

```bash
npm run test:backend:unit
npm run test:backend:integration
npm run test:backend:e2e
```

Validação backend completa:

```bash
npm run validate:backend
```

### Frontend

O frontend ainda não tem testes automatizados.

Validação atual:

```bash
npm run validate:frontend
```

Inclui:

* lint;
* build;
* audit.

Testes frontend recomendados futuramente:

* Vitest;
* React Testing Library;
* Playwright.

---

## 15. Segurança

Nunca versionar:

```txt
.env
.env.*
backend/.env
frontend/.env
```

Versionar apenas:

```txt
backend/.env.example
frontend/.env.example
```

Nunca colocar no frontend:

* passwords;
* `DATABASE_URL`;
* `AUTH_JWT_SECRET`;
* tokens privados;
* credenciais reais;
* segredos.

---

## 16. Git

Antes de commit:

```bash
git status
npm run validate
```

Confirmar que não aparecem:

```txt
backend/.env
frontend/.env
backend/node_modules
frontend/node_modules
node_modules
frontend/dist
```

Commit típico:

```bash
git add .
git commit -m "docs: add root project README"
```

Push:

```bash
git push origin main
```

---

## 17. Checklist rápido para desenvolvimento

Antes de trabalhar:

```bash
npm run dev
```

Antes de commit:

```bash
npm run validate
git status
```

Antes de mexer em backend:

* confirmar regra em `backend/docs/BUSINESS_RULES.md`;
* confirmar rotas em `backend/docs/API_ROUTES.md`;
* atualizar testes se mudar regra crítica.

Antes de mexer em frontend:

* confirmar contrato em `frontend/docs/API_CONTRACT.md`;
* confirmar rotas em `frontend/docs/ROUTES.md`;
* correr lint/build.

---

## 18. Limitações atuais

O projeto ainda não está finalizado.

Limitações conhecidas:

* frontend ainda não tem testes automatizados;
* frontend ainda tem bundle principal grande;
* ainda não existe documentação de deploy final;
* ainda não existe pipeline CI/CD;
* ainda não foi feita auditoria final de acessibilidade;
* ainda não foi feita validação completa em ambiente de produção.

---

## 19. Próximos passos recomendados

Curto prazo:

* validar `npm run validate`;
* confirmar `.env` ignorados;
* rever documentação criada;
* continuar desenvolvimento funcional/frontend.

Médio prazo:

* adicionar testes frontend;
* adicionar code splitting;
* adicionar Error Boundary;
* preparar documentação de deploy;
* validar integração em ambiente real.

Futuro:

* CI/CD;
* testes E2E reais com browser;
* auditoria de acessibilidade;
* auditoria de performance;
* documentação final de produção.
