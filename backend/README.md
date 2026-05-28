# Backend — Farmácia Santa Casa

Backend da aplicação **Farmácia Santa Casa**, responsável pela gestão de utentes, receitas, medicamentos não sujeitos a receita médica, Vendas Suspensas, pedidos, validações da Farmácia, regularizações e jobs de manutenção.

Este backend foi construído com **Node.js**, **Express**, **Prisma** e **PostgreSQL**.

---

## 1. Índice

- [1. Índice](#1-índice)
- [2. Objetivo do backend](#2-objetivo-do-backend)
- [3. Stack técnica](#3-stack-técnica)
- [4. Estrutura principal](#4-estrutura-principal)
- [5. Documentação complementar](#5-documentação-complementar)
- [6. Instalação local](#6-instalação-local)
- [7. Variáveis de ambiente](#7-variáveis-de-ambiente)
- [8. Base de dados e Prisma](#8-base-de-dados-e-prisma)
- [9. Seed inicial](#9-seed-inicial)
- [10. Scripts NPM](#10-scripts-npm)
- [11. Como arrancar o backend](#11-como-arrancar-o-backend)
- [12. Autenticação e autorização](#12-autenticação-e-autorização)
- [13. Contextos principais da API](#13-contextos-principais-da-api)
- [14. Modelo funcional resumido](#14-modelo-funcional-resumido)
- [15. Fluxo principal da aplicação](#15-fluxo-principal-da-aplicação)
- [16. Jobs de manutenção](#16-jobs-de-manutenção)
- [17. Testes manuais atuais](#17-testes-manuais-atuais)
- [18. Testes automatizados futuros](#18-testes-automatizados-futuros)
- [19. Segurança](#19-segurança)
- [20. Convenções de desenvolvimento](#20-convenções-de-desenvolvimento)
- [21. Troubleshooting](#21-troubleshooting)
- [22. Checklist antes de commit](#22-checklist-antes-de-commit)
- [23. Checklist antes de deploy](#23-checklist-antes-de-deploy)
- [24. Próximos passos recomendados](#24-próximos-passos-recomendados)

---

## 2. Objetivo do backend

Este backend gere a comunicação entre dois contextos funcionais principais:

- **Santa Casa**
  - gere utentes;
  - regista receitas;
  - regista medicamentos não sujeitos a receita médica;
  - regista Vendas Suspensas;
  - cria pedidos para a Farmácia;
  - consulta histórico e regularizações.

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

## 3. Stack técnica

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

---

## 4. Estrutura principal

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
├── .env
├── .env.example
└── package.json
```

---

## 5. Documentação complementar

A documentação técnica e funcional deve ficar em:

```txt
backend/docs/
```

Ficheiros recomendados:

```txt
docs/
├── API_ROUTES.md
├── ARCHITECTURE.md
├── BUSINESS_RULES.md
├── ENVIRONMENT.md
├── MAINTENANCE_JOBS.md
└── TESTING.md
```

### Função de cada documento

| Documento | Objetivo |
|---|---|
| `BUSINESS_RULES.md` | Regras funcionais do domínio |
| `ARCHITECTURE.md` | Arquitetura interna do backend |
| `API_ROUTES.md` | Endpoints, payloads e permissões |
| `ENVIRONMENT.md` | Variáveis de ambiente e configuração |
| `MAINTENANCE_JOBS.md` | Jobs automáticos e manuais |
| `TESTING.md` | Estratégia de testes |

O `README.md` deve ser a porta de entrada. Os detalhes profundos devem ficar nos ficheiros acima.

---

## 6. Instalação local

### 6.1 Entrar na pasta do backend

```bash
cd backend
```

### 6.2 Instalar dependências

```bash
npm install
```

### 6.3 Criar `.env`

Copiar o exemplo:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Depois editar `.env` com os valores reais locais.

### 6.4 Gerar Prisma Client

```bash
npx prisma generate
```

### 6.5 Aplicar migrations

```bash
npx prisma migrate dev
```

### 6.6 Criar utilizadores iniciais

```bash
npx prisma db seed
```

### 6.7 Arrancar servidor

```bash
npm run dev
```

---

## 7. Variáveis de ambiente

O backend usa `dotenv` e carrega variáveis a partir de:

```txt
.env
```

Existe um ficheiro seguro de referência:

```txt
.env.example
```

### Variáveis principais

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `DATABASE_URL` | Sim | URL PostgreSQL usada pelo Prisma |
| `NODE_ENV` | Sim | Ambiente atual |
| `PORT` | Sim | Porta do servidor |
| `TZ` | Sim | Timezone dos jobs |
| `ALLOWED_ORIGINS` | Sim | Origins permitidas para CORS |
| `AUTH_JWT_SECRET` | Sim | Segredo para assinar JWT |
| `AUTH_COOKIE_NAME` | Sim | Nome do cookie de sessão |
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

## 8. Base de dados e Prisma

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

## 9. Seed inicial

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

## 10. Scripts NPM

Scripts definidos no `package.json`:

```json
{
  "dev": "nodemon --watch src --watch prisma --ext js,json,prisma --exec node src/app/server.js",
  "start": "node src/app/server.js",
  "prisma:generate": "npx prisma generate",
  "prisma:studio": "npx prisma studio",
  "prisma:migrate": "npx prisma migrate dev",
  "test:api": "node scripts/test-current-api.js",
  "test:receita-expiry": "node scripts/test-receita-expiry-job.js",
  "test:higiene": "node scripts/test-higiene-job.js",
  "test:purge-history": "node scripts/test-purge-history-job.js",
  "job:receita-expiry": "node -e "require('./src/jobs/receitaExpiry.job').runOnce().then(console.log).catch((e)=>{console.error(e);process.exit(1)})"",
  "job:higiene": "node -e "require('./src/jobs/higiene.job').runOnce().then(console.log).catch((e)=>{console.error(e);process.exit(1)})"",
  "job:purge-history": "node -e "require('./src/jobs/purgeHistory.job').runOnce().then(console.log).catch((e)=>{console.error(e);process.exit(1)})""
}
```

---

## 11. Como arrancar o backend

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

## 12. Autenticação e autorização

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

## 13. Contextos principais da API

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

## 14. Modelo funcional resumido

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

## 15. Fluxo principal da aplicação

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

## 16. Jobs de manutenção

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

---

## 17. Testes manuais atuais

Existem scripts manuais em:

```txt
scripts/
```

### Testar fluxo principal da API

```bash
npm run test:api
```

Este script valida:

- login por role;
- cookies;
- permissões;
- criação de utente;
- criação de medicamento não sujeito a receita médica;
- criação de receita;
- criação de Venda Suspensa;
- criação de pedido;
- validação pela Farmácia;
- regularização automática;
- rejeição;
- histórico;
- dashboard.

### Testar job de expiração de receitas

```bash
npm run test:receita-expiry
```

### Testar job de higiene

```bash
npm run test:higiene
```

### Testar job de limpeza de histórico

```bash
npm run test:purge-history
```

### Atenção

Estes scripts criam dados reais e executam alterações reais na base configurada em `DATABASE_URL`.

Não correr contra produção.

---

## 18. Testes automatizados futuros

A fase seguinte recomendada é adicionar testes com:

```bash
npm install -D vitest supertest
```

Estrutura futura:

```txt
tests/
├── helpers/
├── fixtures/
├── unit/
├── integration/
└── e2e/
```

### Ordem recomendada

```txt
1. tests/helpers
2. tests/fixtures
3. tests/unit/validators
4. tests/e2e/auth
5. tests/e2e/santacasa
6. tests/e2e/farmacia
7. tests/integration/jobs
```

Não substituir imediatamente os scripts manuais. Eles continuam úteis para validação rápida.

---

## 19. Segurança

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

## 20. Convenções de desenvolvimento

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

## 21. Troubleshooting

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

---

## 22. Checklist antes de commit

Antes de fazer commit:

```bash
git status
```

Confirmar:

- [ ] `.env` não aparece no Git.
- [ ] `.env.example` aparece.
- [ ] `docs/` atualizado.
- [ ] `scripts/` atualizado.
- [ ] `package.json` coerente.
- [ ] `npm run test:api` passou.
- [ ] `npm run test:receita-expiry` passou.
- [ ] `npm run test:higiene` passou.
- [ ] `npm run test:purge-history` passou.

Commit recomendado:

```bash
git add .
git commit -m "docs: add backend documentation and manual test setup"
```

---

## 23. Checklist antes de deploy

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

---

## 24. Próximos passos recomendados

### Fase atual

- [x] Documentar regras de negócio.
- [x] Documentar arquitetura.
- [x] Documentar rotas.
- [x] Documentar ambiente.
- [x] Documentar jobs.
- [x] Documentar testes.
- [x] Criar `.env.example`.
- [x] Validar scripts manuais principais.

### Próxima fase

- [ ] Instalar Vitest e Supertest.
- [ ] Criar `tests/helpers`.
- [ ] Criar `tests/fixtures`.
- [ ] Criar primeiros testes unitários.
- [ ] Criar primeiros testes E2E.
- [ ] Criar testes de integração dos jobs.

---

## 25. Estado atual recomendado

Antes de avançar para testes automatizados, o backend deve ter:

```txt
backend/
├── docs/
├── scripts/
├── src/
├── prisma/
├── .env.example
├── package.json
└── README.md
```


