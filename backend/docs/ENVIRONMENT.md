# ENVIRONMENT.md

## Backend — Configuração de Ambiente

Este documento descreve a configuração de ambiente do backend do projeto **Farmácia Santa Casa**.

Abrange:

* desenvolvimento local;
* testes automatizados;
* staging público de portefólio;
* futura produção real;
* PostgreSQL e Prisma;
* autenticação;
* cookies;
* CORS;
* jobs;
* seed inicial;
* seed demo;
* smoke test remoto;
* Render;
* segurança operacional.

**Última atualização:** 2026-06-19
**Runtime oficial:** Node.js 24 LTS

---

## 1. Objetivo

Este documento serve para:

* explicar as variáveis de ambiente;
* separar configuração sensível do código;
* evitar mistura entre development, test, staging e production;
* documentar cookies, CORS, proxy, jobs e seeds;
* preparar deploys reproduzíveis;
* reduzir o risco de ligar testes ou scripts à base errada;
* documentar o ambiente público de demonstração;
* deixar a futura criação de produção preparada.

---

## 2. Regra principal

Nunca versionar ficheiros reais de ambiente.

Não devem ir para Git:

```txt
backend/.env
backend/.env.local
backend/.env.production
backend/.env.staging
backend/.env.test
```

Estes ficheiros ou variáveis podem conter:

* `DATABASE_URL`;
* `AUTH_JWT_SECRET`;
* passwords;
* credenciais de seed;
* configuração da infraestrutura;
* domínios reais;
* flags operacionais sensíveis.

Os valores reais devem existir apenas:

* localmente, num ficheiro ignorado;
* no gestor de secrets da plataforma;
* temporariamente na sessão do terminal;
* num gestor de passwords seguro.

---

## 3. Separação dos ambientes

| Ambiente    | Objetivo                   | Base de dados                    | Contas                    |
| ----------- | -------------------------- | -------------------------------- | ------------------------- |
| Development | Desenvolvimento local      | PostgreSQL local                 | Seed local                |
| Test        | Testes automatizados       | Base dedicada a testes/CI        | Fixtures e seed de testes |
| Staging     | Demo pública de portefólio | PostgreSQL exclusivo de staging  | Contas demo               |
| Production  | Utilização real futura     | PostgreSQL exclusivo de produção | Utilizadores reais        |

Regras obrigatórias:

```txt
development ≠ test ≠ staging ≠ production
```

Nunca reutilizar:

* a base de produção em testes;
* o segredo JWT de staging em produção;
* passwords demo em produção;
* dados fictícios no ambiente real;
* contas iniciais locais na produção.

---

## 4. Ficheiros de referência

Estrutura relevante:

```txt
backend/
├── .env
├── .env.example
├── .env.staging.example
├── .env.production.example
├── .node-version
├── prisma/
│   ├── seed.js
│   └── seed-demo.js
├── scripts/
│   ├── manual/
│   └── smoke/
│       └── staging-auth-smoke.js
├── src/
│   └── config/
│       └── env.js
└── docs/
    └── ENVIRONMENT.md
```

### `.env`

Configuração local real.

É privado e não deve ser versionado.

### `.env.example`

Template para desenvolvimento local.

Pode ser versionado porque não contém secrets reais.

### `.env.staging.example`

Template de referência para o ambiente público de demonstração.

Inclui nomes das variáveis demo, mas nunca passwords reais.

### `.env.production.example`

Template exclusivo para uma futura produção real.

Não deve conter:

```txt
ALLOW_DEMO_SEED
DEMO_SEED_CONFIRMATION
DEMO_ADMIN_*
DEMO_SANTACASA_*
DEMO_FARMACIA_*
STAGING_*
```

### `src/config/env.js`

Fonte central da configuração consumida pela aplicação.

É responsável por:

* carregar `.env`;
* converter booleanos;
* converter números;
* converter listas;
* aplicar defaults;
* validar configurações perigosas;
* bloquear o arranque quando a produção está mal configurada.

### Variáveis lidas diretamente por scripts

Nem todas as variáveis passam por `src/config/env.js`.

Algumas são lidas diretamente por:

```txt
prisma/seed.js
prisma/seed-demo.js
scripts/manual/*
scripts/smoke/*
```

Exemplos:

```txt
SEED_*
DEMO_*
ALLOW_DEMO_SEED
DEMO_SEED_CONFIRMATION
STAGING_*
ALLOW_TEST_SCRIPTS_IN_PRODUCTION
```

---

## 5. `.gitignore`

Os ambientes reais devem ser ignorados, mantendo os templates versionados.

Configuração relevante:

```gitignore
.env
.env.*
backend/.env
backend/.env.*
frontend/.env
frontend/.env.*

!.env.example
!backend/.env.example
!backend/.env.production.example
!backend/.env.staging.example
!frontend/.env.example
!frontend/.env.production.example
```

Confirmar um ficheiro real:

```bash
git check-ignore backend/.env
```

Resultado esperado:

```txt
backend/.env
```

Confirmar um template:

```bash
git check-ignore backend/.env.staging.example
```

Não deve devolver nada.

---

## 6. Node.js

O backend usa **Node.js 24 LTS**.

### `package.json`

```json
"engines": {
  "node": ">=24.0.0 <25.0.0"
}
```

### `.node-version`

```txt
24
```

### GitHub Actions

```yaml
node-version: "24.x"
```

### Render

```env
NODE_VERSION=24
```

`NODE_VERSION` é uma variável de infraestrutura.

Não é lida por:

```txt
src/config/env.js
```

Confirmar localmente:

```bash
node --version
```

Resultado esperado:

```txt
v24.x.x
```

---

## 7. Variáveis principais

| Variável                 |             Obrigatória | Descrição                             |
| ------------------------ | ----------------------: | ------------------------------------- |
| `DATABASE_URL`           |                     Sim | Ligação PostgreSQL                    |
| `NODE_ENV`               |           Sim em deploy | `development`, `test` ou `production` |
| `PORT`                   |      Plataforma/default | Porta HTTP                            |
| `TZ`                     |             Recomendado | Timezone                              |
| `JSON_LIMIT`             |                     Não | Limite do body JSON                   |
| `TRUST_PROXY`            | Conforme infraestrutura | Configuração Express                  |
| `ALLOWED_ORIGINS`        |         Sim em produção | Origins autorizadas                   |
| `AUTH_JWT_SECRET`        |                     Sim | Segredo JWT                           |
| `AUTH_COOKIE_NAME`       |                     Não | Nome do cookie                        |
| `AUTH_TOKEN_EXPIRES_IN`  |                     Não | Duração do JWT                        |
| `AUTH_COOKIE_MAX_AGE_MS` |                     Não | Duração do cookie                     |
| `AUTH_COOKIE_SECURE`     |         Sim em produção | Cookie apenas HTTPS                   |
| `AUTH_COOKIE_SAME_SITE`  |         Sim em produção | Política SameSite                     |

---

## 8. `NODE_ENV`

Valores aceites:

```env
NODE_ENV=development
NODE_ENV=test
NODE_ENV=production
```

Qualquer outro valor bloqueia o arranque:

```txt
[env] NODE_ENV inválido. Usa: development, test ou production.
```

Valor por defeito:

```env
development
```

Impacta:

* validação de secrets;
* segurança dos cookies;
* origins permitidas;
* origin guard;
* comportamento de erros;
* defaults dos jobs;
* proteção contra base local;
* comportamento dos seeds.

---

## 9. Base de dados

### `DATABASE_URL`

Formato:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Exemplo local:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_santacasa?schema=public"
```

Exemplo remoto:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/farmacia_santacasa?schema=public"
```

A variável é obrigatória.

Sem ela, o backend termina:

```txt
[env] DATABASE_URL em falta.
```

### Proteção em produção

Quando:

```env
NODE_ENV=production
```

o backend bloqueia bases que apontem para:

```txt
localhost
127.0.0.1
0.0.0.0
::1
```

Mensagem:

```txt
[env] DATABASE_URL não pode apontar para localhost/127.0.0.1 em produção.
```

### Separação obrigatória

Usar bases independentes:

```txt
farmacia_santacasa_development
farmacia_santacasa_test
farmacia_santacasa_staging
farmacia_santacasa_production
```

### Prisma em desenvolvimento

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Prisma em staging/produção

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
```

Nunca usar em staging/produção:

```bash
prisma migrate dev
```

### Backups

Antes de operações destrutivas:

* confirmar ambiente;
* confirmar `DATABASE_URL`;
* criar backup;
* testar restore;
* correr preview;
* só depois executar purge ou anonimização.

---

## 10. Servidor

### `PORT`

Exemplo:

```env
PORT=3001
```

Default:

```txt
3001
```

No Render, a porta é normalmente fornecida automaticamente.

Não deve ser fixada no código.

### `TZ`

Configuração recomendada:

```env
TZ=Europe/Lisbon
```

Default:

```txt
Europe/Lisbon
```

Afeta:

* jobs;
* validade de receitas;
* datas de corte;
* logs;
* operações mensais e diárias.

### `JSON_LIMIT`

Exemplo:

```env
JSON_LIMIT=1mb
```

Default:

```txt
1mb
```

---

## 11. Reverse proxy

### `TRUST_PROXY`

Configura:

```js
app.set("trust proxy", env.TRUST_PROXY);
```

API exposta diretamente:

```env
TRUST_PROXY=false
```

Atrás de um proxy/load balancer confiável:

```env
TRUST_PROXY=1
```

Evitar:

```env
TRUST_PROXY=true
```

salvo quando a topologia e os headers são totalmente controlados.

Esta variável influencia:

* `req.ip`;
* rate limit por IP;
* `X-Forwarded-For`;
* deteção do cliente real.

No Render:

```env
TRUST_PROXY=1
```

---

## 12. CORS e origins

### `ALLOWED_ORIGINS`

Lista separada por vírgulas:

```env
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
```

Produção:

```env
ALLOWED_ORIGINS="https://app.exemplo.pt"
```

Staging atual:

```env
ALLOWED_ORIGINS="https://farmacia-santacasa-frontend-staging.onrender.com"
```

### Regras

Em produção:

* é obrigatória;
* não pode estar vazia;
* não pode conter `*`;
* não pode conter localhost;
* não pode conter `127.0.0.1`;
* não deve ter slash final;
* deve conter apenas origins completas;
* não deve conter caminhos como `/login`.

Correto:

```env
ALLOWED_ORIGINS="https://app.exemplo.pt"
```

Incorreto:

```env
ALLOWED_ORIGINS="*"
```

```env
ALLOWED_ORIGINS="https://app.exemplo.pt/"
```

```env
ALLOWED_ORIGINS="https://app.exemplo.pt/login"
```

### Origin guard

Métodos mutáveis:

```txt
POST
PUT
PATCH
DELETE
```

Em produção exigem uma origem válida.

Métodos seguros:

```txt
GET
HEAD
OPTIONS
```

O frontend deve usar:

```js
credentials: "include"
```

---

## 13. Autenticação

### `AUTH_JWT_SECRET`

Obrigatória.

Exemplo seguro:

```env
AUTH_JWT_SECRET="replace_with_a_long_random_secret"
```

Em produção deve ter pelo menos 32 caracteres.

Gerar:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Nunca reutilizar o mesmo segredo entre:

```txt
development
test
staging
production
```

### `AUTH_COOKIE_NAME`

Default:

```env
AUTH_COOKIE_NAME=farmacia_santacasa_session
```

### `AUTH_TOKEN_EXPIRES_IN`

Default:

```env
AUTH_TOKEN_EXPIRES_IN=8h
```

Exemplos:

```txt
15m
1h
8h
1d
```

### `AUTH_COOKIE_MAX_AGE_MS`

Default para 8 horas:

```env
AUTH_COOKIE_MAX_AGE_MS=28800000
```

Deve ficar alinhado com:

```txt
AUTH_TOKEN_EXPIRES_IN
```

### `AUTH_COOKIE_SECURE`

Local:

```env
AUTH_COOKIE_SECURE=false
```

Produção HTTPS:

```env
AUTH_COOKIE_SECURE=true
```

Em produção, `false` bloqueia o arranque.

### `AUTH_COOKIE_SAME_SITE`

Valores aceites:

```txt
strict
lax
none
```

Desenvolvimento local:

```env
AUTH_COOKIE_SAME_SITE=lax
```

Frontend e backend cross-site:

```env
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
```

Regra obrigatória:

```txt
SameSite=None exige Secure=true
```

---

## 14. Rate limit de login

### `AUTH_LOGIN_RATE_LIMIT_WINDOW_MS`

Default:

```env
AUTH_LOGIN_RATE_LIMIT_WINDOW_MS=900000
```

Equivale a 15 minutos.

### `AUTH_LOGIN_RATE_LIMIT_MAX`

Default:

```env
AUTH_LOGIN_RATE_LIMIT_MAX=10
```

O rate limit usa:

```txt
IP + email
```

Resposta quando o limite é ultrapassado:

```txt
429 TOO_MANY_REQUESTS
```

### Limitação atual

O armazenamento usa memória local da instância.

Consequências:

* reinicia quando o processo reinicia;
* não é partilhado entre instâncias;
* é adequado para instância única;
* requer Redis ou equivalente numa futura arquitetura multi-instância.

---

## 15. Jobs automáticos

Jobs existentes:

| Job              | Frequência padrão | Objetivo                         |
| ---------------- | ----------------- | -------------------------------- |
| `receita-expiry` | Diário            | Expirar linhas de receita        |
| `higiene`        | Mensal            | Tratar utentes removidos antigos |
| `purge-history`  | Mensal            | Remover histórico fechado antigo |

### `ENABLE_JOBS`

Controla globalmente o registo automático.

```env
ENABLE_JOBS=true
```

ou:

```env
ENABLE_JOBS=false
```

### Defaults seguros

O código aplica:

```txt
development → true
test        → true
production  → false
```

No CI, staging e produção deve ser definido explicitamente:

```env
ENABLE_JOBS=false
```

Quando está `false`, nenhum job automático corre, mesmo que os toggles individuais estejam ativos.

### Toggles individuais

```env
ENABLE_RECEITAS_EXPIRY=true
ENABLE_HIGIENE=true
ENABLE_PURGE_HISTORY=true
```

Só têm efeito quando:

```env
ENABLE_JOBS=true
```

### Configuração conservadora

```env
ENABLE_JOBS=false
ENABLE_RECEITAS_EXPIRY=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
```

Recomendada para:

* testes;
* staging demo;
* primeira publicação;
* múltiplas instâncias;
* períodos de validação;
* ambientes sem backups confirmados.

### Produção futura

Preferir:

* worker único;
* scheduler externo;
* execução manual controlada;
* monitorização;
* logs persistentes.

Evitar jobs duplicados em várias instâncias web.

---

## 16. Configuração dos jobs

### Higiene

```env
HIGIENE_OFFSET_MONTHS=12
HIGIENE_ANONYMIZE=false
ALLOW_HIGIENE_ANONYMIZE=false
```

A anonimização só é permitida quando:

```env
HIGIENE_ANONYMIZE=true
ALLOW_HIGIENE_ANONYMIZE=true
```

### Purge de histórico

```env
PURGE_OFFSET_MONTHS=6
```

É uma operação destrutiva.

Antes de executar:

* criar backup;
* confirmar restore;
* correr preview;
* confirmar offset;
* confirmar base;
* confirmar ambiente.

### Cron

Mensal, dia 1 às 03:00:

```env
CRON_MONTHLY_03H="0 3 1 * *"
```

Diário às 03:00:

```env
CRON_DAILY_03H="0 3 * * *"
```

---

## 17. Seed inicial

Comando:

```bash
npm run prisma:seed
```

ou:

```bash
npx prisma db seed
```

### Desenvolvimento e testes

Pode criar ou atualizar:

```txt
ADMIN
SANTACASA
FARMACIA
```

Variáveis:

```env
SEED_ADMIN_NAME="Administrador"
SEED_ADMIN_EMAIL="admin@sistema.local"
SEED_ADMIN_PASSWORD="ChangeMeAdmin123!"

SEED_SANTACASA_NAME="Santa Casa"
SEED_SANTACASA_EMAIL="santacasa@sistema.local"
SEED_SANTACASA_PASSWORD="ChangeMeSantaCasa123!"

SEED_FARMACIA_NAME="Farmácia"
SEED_FARMACIA_EMAIL="farmacia@sistema.local"
SEED_FARMACIA_PASSWORD="ChangeMeFarmacia123!"
```

### Produção

Por defeito:

```env
ALLOW_PRODUCTION_SEED=false
```

Para setup inicial controlado:

```env
ALLOW_PRODUCTION_SEED=true
SEED_ADMIN_NAME="Administrador do Sistema"
SEED_ADMIN_EMAIL="admin@exemplo.pt"
SEED_ADMIN_PASSWORD="password forte"
```

Em produção, o seed inicial:

* cria apenas o `ADMIN`;
* não cria Santa Casa;
* não cria Farmácia;
* não aceita passwords padrão;
* não redefine a password de um admin existente;
* não altera role, nome ou estado de um admin existente.

Depois:

1. confirmar login do admin;
2. definir `ALLOW_PRODUCTION_SEED=false`;
3. remover variáveis temporárias;
4. criar contas reais pela UI;
5. não voltar a executar o seed sem necessidade.

---

## 18. Seed demo

Comando:

```bash
npm run prisma:seed:demo
```

Ficheiro:

```txt
prisma/seed-demo.js
```

Objetivo:

* criar ou atualizar as três contas demo;
* sincronizar as passwords com as variáveis;
* repor o dataset fictício operacional;
* manter uma demonstração reproduzível.

### Proteção obrigatória

O seed só executa com:

```env
ALLOW_DEMO_SEED=true
DEMO_SEED_CONFIRMATION=PORTFOLIO_DEMO
```

Durante operação normal:

```env
ALLOW_DEMO_SEED=false
DEMO_SEED_CONFIRMATION=""
```

### Contas padrão

```txt
demo.admin@sistema.local
demo.santacasa@sistema.local
demo.farmacia@sistema.local
```

### Variáveis

```env
DEMO_ADMIN_NAME="Administrador Demo"
DEMO_ADMIN_EMAIL="demo.admin@sistema.local"
DEMO_ADMIN_PASSWORD="password forte"

DEMO_SANTACASA_NAME="Santa Casa Demo"
DEMO_SANTACASA_EMAIL="demo.santacasa@sistema.local"
DEMO_SANTACASA_PASSWORD="password forte"

DEMO_FARMACIA_NAME="Farmácia Demo"
DEMO_FARMACIA_EMAIL="demo.farmacia@sistema.local"
DEMO_FARMACIA_PASSWORD="password forte"
```

### Regras das passwords

As três passwords:

* são obrigatórias;
* não têm fallback;
* devem ter pelo menos 12 caracteres;
* devem ser diferentes;
* não devem ser guardadas no repositório;
* não podem usar os valores de exemplo bloqueados em produção.

### Regras adicionais

As contas demo:

* devem ter emails distintos;
* não podem reutilizar as contas do seed inicial;
* ficam ativas;
* têm as roles corretas;
* recebem novos hashes quando o seed corre.

### Efeito operacional

O seed demo:

* repõe dados fictícios;
* remove dados pertencentes ao dataset demo anterior;
* recria utentes, receitas, pedidos, regularizações e alertas;
* sincroniza as contas;
* é transacional;
* faz rollback em caso de erro;
* deve ser tratado como operação controlada.

Não usar contra uma produção real.

---

## 19. Reposição controlada do staging demo

Método preferencial:

* One-Off Job;
* shell/SSH;
* tarefa isolada da plataforma.

Quando não estiver disponível, pode ser usado temporariamente o Build Command.

### 1. Definir temporariamente

```env
ALLOW_DEMO_SEED=true
DEMO_SEED_CONFIRMATION=PORTFOLIO_DEMO
```

Confirmar também:

```txt
DEMO_ADMIN_PASSWORD
DEMO_SANTACASA_PASSWORD
DEMO_FARMACIA_PASSWORD
```

### 2. Build Command temporário

```bash
npm ci && npm run prisma:migrate:deploy && npm run prisma:seed:demo
```

### 3. Confirmar logs

```txt
[seed:demo] Ambiente demo reposto e verificado com sucesso.
[seed:demo] As passwords foram sincronizadas com as variáveis de ambiente.
```

### 4. Restaurar imediatamente

```bash
npm ci && npm run prisma:migrate:deploy
```

### 5. Remover a autorização

Remover ou desativar:

```env
ALLOW_DEMO_SEED
DEMO_SEED_CONFIRMATION
```

### 6. Fazer novo deploy

Confirmar que já não aparece:

```txt
prisma:seed:demo
```

O seed demo nunca deve ficar permanentemente no Build Command.

---

## 20. Smoke test remoto de staging

Script:

```txt
scripts/smoke/staging-auth-smoke.js
```

Comando:

```bash
npm run test:staging:auth
```

O teste é read-only.

Valida:

* `/api/health/live`;
* `/api/health/ready`;
* CORS;
* preflight;
* security headers;
* `X-Request-Id`;
* sessão inexistente;
* origem não autorizada;
* login de `ADMIN`;
* login de `SANTACASA`;
* login de `FARMACIA`;
* `/api/auth/me`;
* permissões por role;
* bloqueios cruzados;
* logout;
* cookies `HttpOnly`, `Secure` e `SameSite=None`.

Não cria:

* utentes;
* receitas;
* medicamentos;
* pedidos;
* regularizações;
* alertas.

### Variáveis locais

No PowerShell:

```powershell
$env:STAGING_SMOKE_CONFIRMATION="STAGING_READ_ONLY"

$env:STAGING_API_BASE_URL="https://farmacia-santacasa-backend-staging.onrender.com/api"

$env:STAGING_FRONTEND_ORIGIN="https://farmacia-santacasa-frontend-staging.onrender.com"

$env:DEMO_ADMIN_PASSWORD="PASSWORD_ADMIN"
$env:DEMO_SANTACASA_PASSWORD="PASSWORD_SANTACASA"
$env:DEMO_FARMACIA_PASSWORD="PASSWORD_FARMACIA"
```

Executar:

```powershell
npm run test:staging:auth
```

Resultado esperado:

```txt
STAGING AUTH SMOKE PASSOU
```

Limpar:

```powershell
Remove-Item Env:STAGING_SMOKE_CONFIRMATION
Remove-Item Env:STAGING_API_BASE_URL
Remove-Item Env:STAGING_FRONTEND_ORIGIN
Remove-Item Env:DEMO_ADMIN_PASSWORD
Remove-Item Env:DEMO_SANTACASA_PASSWORD
Remove-Item Env:DEMO_FARMACIA_PASSWORD
```

As passwords não devem ser colocadas em:

* comandos versionados;
* screenshots;
* logs;
* documentação;
* `.env.example`;
* Pull Requests.

---

## 21. Desenvolvimento local

Template:

```txt
backend/.env.example
```

Exemplo:

```env
NODE_ENV=development
PORT=3001
TZ=Europe/Lisbon
JSON_LIMIT=1mb
TRUST_PROXY=false

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_santacasa_development?schema=public"

ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"

AUTH_JWT_SECRET="development-secret-with-at-least-32-characters"
AUTH_COOKIE_NAME="farmacia_santacasa_session"
AUTH_TOKEN_EXPIRES_IN="8h"
AUTH_COOKIE_MAX_AGE_MS=28800000
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax

AUTH_LOGIN_RATE_LIMIT_WINDOW_MS=900000
AUTH_LOGIN_RATE_LIMIT_MAX=10

ENABLE_JOBS=true
ENABLE_RECEITAS_EXPIRY=true
ENABLE_HIGIENE=true
ENABLE_PURGE_HISTORY=true

HIGIENE_OFFSET_MONTHS=12
HIGIENE_ANONYMIZE=false
ALLOW_HIGIENE_ANONYMIZE=false
PURGE_OFFSET_MONTHS=6

CRON_MONTHLY_03H="0 3 1 * *"
CRON_DAILY_03H="0 3 * * *"

ALLOW_PRODUCTION_SEED=false
ALLOW_TEST_SCRIPTS_IN_PRODUCTION=false
```

Arranque:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

---

## 22. Testes

Configuração recomendada:

```env
NODE_ENV=test
TZ=Europe/Lisbon
TRUST_PROXY=false

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_santacasa_test?schema=public"

AUTH_JWT_SECRET="test-secret-with-at-least-32-characters"
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax

ALLOWED_ORIGINS="http://localhost:5173"

ENABLE_JOBS=false
ENABLE_RECEITAS_EXPIRY=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false

ALLOW_PRODUCTION_SEED=false
```

A base de testes deve ser descartável.

Nunca apontar testes para:

* staging;
* produção;
* uma base com dados reais.

Comandos:

```bash
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm run test:all
npm run test:coverage
npm run validate
```

---

## 23. Staging público

Template:

```txt
backend/.env.staging.example
```

URLs atuais:

```txt
Backend:
https://farmacia-santacasa-backend-staging.onrender.com

Frontend:
https://farmacia-santacasa-frontend-staging.onrender.com
```

API:

```txt
https://farmacia-santacasa-backend-staging.onrender.com/api
```

Configuração principal:

```env
NODE_VERSION=24
NODE_ENV=production
TZ=Europe/Lisbon
TRUST_PROXY=1

DATABASE_URL="POSTGRESQL_STAGING_URL"

ALLOWED_ORIGINS="https://farmacia-santacasa-frontend-staging.onrender.com"

AUTH_JWT_SECRET="STAGING_SECRET"
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none

ENABLE_JOBS=false
ENABLE_RECEITAS_EXPIRY=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false

ALLOW_PRODUCTION_SEED=false
ALLOW_TEST_SCRIPTS_IN_PRODUCTION=false
```

O staging usa:

```env
NODE_ENV=production
```

para exercitar as proteções reais da aplicação.

Apesar disso, continua a ser:

* uma demonstração;
* uma base separada;
* um ambiente com dados fictícios;
* um ambiente sem utilização real.

---

## 24. Produção futura

Template:

```txt
backend/.env.production.example
```

Configuração inicial conservadora:

```env
NODE_VERSION=24
NODE_ENV=production
TZ=Europe/Lisbon
TRUST_PROXY=1

DATABASE_URL="POSTGRESQL_PRODUCTION_URL"

ALLOWED_ORIGINS="https://app.exemplo.pt"

AUTH_JWT_SECRET="PRODUCTION_SECRET"
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none

ENABLE_JOBS=false
ENABLE_RECEITAS_EXPIRY=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false

ALLOW_PRODUCTION_SEED=false
ALLOW_TEST_SCRIPTS_IN_PRODUCTION=false
```

### Produção não deve conter

```txt
ALLOW_DEMO_SEED
DEMO_SEED_CONFIRMATION
DEMO_ADMIN_*
DEMO_SANTACASA_*
DEMO_FARMACIA_*
STAGING_SMOKE_CONFIRMATION
STAGING_API_BASE_URL
STAGING_FRONTEND_ORIGIN
```

### Antes de criar produção

Será necessário:

1. criar PostgreSQL exclusivo;
2. configurar backups;
3. testar restore;
4. criar serviço backend;
5. criar frontend;
6. configurar domínios;
7. gerar secrets exclusivos;
8. aplicar migrations;
9. criar o primeiro admin;
10. desativar novamente o seed;
11. criar utilizadores reais;
12. decidir estratégia de jobs;
13. executar smoke tests;
14. validar logs;
15. preparar rollback.

---

## 25. Render

### Backend

Configuração:

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

Health check recomendado:

```txt
/api/health/live
```

Readiness:

```txt
/api/health/ready
```

### Logs esperados

```txt
[server] listening on port <PORT> (production)
[jobs] todos os jobs DESATIVADOS por ENABLE_JOBS=false
```

### Frontend

A plataforma deve definir:

```env
VITE_API_BASE_URL="https://farmacia-santacasa-backend-staging.onrender.com/api"
```

As variáveis `VITE_*` são incorporadas durante o build.

Alterá-las exige rebuild/deploy do frontend.

---

## 26. Health checks

Endpoints:

```txt
GET /api/health/live
GET /api/health/ready
GET /api/health
```

| Endpoint            | Acesso  | Objetivo                   |
| ------------------- | ------- | -------------------------- |
| `/api/health/live`  | Público | Processo ativo             |
| `/api/health/ready` | Público | API e base disponíveis     |
| `/api/health`       | `ADMIN` | Diagnóstico administrativo |

Resultados esperados:

```txt
live  → 200
ready → 200 com base acessível
ready → 503 sem base
```

---

## 27. Security headers e request ID

A API usa:

```txt
helmet
```

E remove:

```txt
X-Powered-By
```

Todas as respostas devem incluir:

```txt
X-Request-Id
```

O header:

* é gerado quando não existe;
* preserva um valor válido enviado pelo cliente;
* é exposto em CORS;
* aparece nos logs de erro;
* permite correlacionar frontend e backend.

---

## 28. Validações de `env.js`

O backend bloqueia o arranque quando:

### `DATABASE_URL` está em falta

```txt
[env] DATABASE_URL em falta.
```

### Base local em produção

```txt
[env] DATABASE_URL não pode apontar para localhost/127.0.0.1 em produção.
```

### `AUTH_JWT_SECRET` está em falta

```txt
[env] AUTH_JWT_SECRET em falta.
```

### Secret curto em produção

```txt
[env] AUTH_JWT_SECRET deve ter pelo menos 32 caracteres em produção.
```

### Cookie inseguro

```txt
[env] AUTH_COOKIE_SECURE deve ser true em produção.
```

### `SameSite=None` sem `Secure`

```txt
[env] AUTH_COOKIE_SAME_SITE=none exige AUTH_COOKIE_SECURE=true.
```

### Origins não definidas

```txt
[env] ALLOWED_ORIGINS é obrigatório em produção.
```

### Origins vazias

```txt
[env] ALLOWED_ORIGINS não pode estar vazio em produção.
```

### Wildcard

```txt
[env] ALLOWED_ORIGINS não pode conter '*' em produção.
```

### Localhost nas origins

```txt
[env] ALLOWED_ORIGINS não pode conter localhost/127.0.0.1 em produção.
```

---

## 29. Erros comuns

### Login funciona na API mas não no frontend

Confirmar:

```env
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
ALLOWED_ORIGINS="ORIGIN_EXATA"
```

No frontend:

```js
credentials: "include"
```

### Sessão desaparece após refresh

Verificar:

* cookie recebido;
* `Secure`;
* `SameSite`;
* `Domain`;
* `Path=/`;
* `credentials: include`;
* segredo JWT constante;
* validade do token;
* validade do cookie.

### Rate limit identifica o proxy

Confirmar:

```env
TRUST_PROXY=1
```

apenas quando existe um proxy confiável.

### Jobs alteram staging

Definir:

```env
ENABLE_JOBS=false
ENABLE_RECEITAS_EXPIRY=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
```

### Seed demo bloqueado

Confirmar temporariamente:

```env
ALLOW_DEMO_SEED=true
DEMO_SEED_CONFIRMATION=PORTFOLIO_DEMO
```

### Password demo inválida

Confirmar:

* variável definida;
* mínimo de 12 caracteres;
* não usar password de exemplo bloqueada;
* variável disponível no processo que executa o seed.

### Smoke test bloqueado

Definir:

```env
STAGING_SMOKE_CONFIRMATION=STAGING_READ_ONLY
```

---

## 30. Scripts manuais

### `ALLOW_TEST_SCRIPTS_IN_PRODUCTION`

Default recomendado:

```env
ALLOW_TEST_SCRIPTS_IN_PRODUCTION=false
```

Não ativar em produção salvo caso excecional e consciente.

Os scripts manuais:

* podem criar dados;
* podem executar jobs;
* podem alterar histórico;
* não substituem testes automatizados;
* não devem ser executados contra produção.

O smoke test de autenticação de staging é separado e read-only.

---

## 31. Checklist local

* [ ] Node.js `v24.x`.
* [ ] `.env` criado.
* [ ] `DATABASE_URL` local.
* [ ] `AUTH_JWT_SECRET` definido.
* [ ] cookies locais com `Secure=false`.
* [ ] `SameSite=lax`.
* [ ] origins locais.
* [ ] Prisma Client gerado.
* [ ] migrations aplicadas.
* [ ] seed executado, se necessário.
* [ ] backend inicia.
* [ ] frontend comunica com a API.

---

## 32. Checklist de testes

* [ ] Base de testes separada.
* [ ] `NODE_ENV=test`.
* [ ] jobs desativados.
* [ ] nenhum URL de produção presente.
* [ ] seed/fixtures disponíveis.
* [ ] unit passam.
* [ ] integration passam.
* [ ] E2E passam.
* [ ] coverage passa.
* [ ] audit passa.
* [ ] CI passa.

---

## 33. Checklist de staging

* [ ] Base PostgreSQL exclusiva.
* [ ] `NODE_ENV=production`.
* [ ] `NODE_VERSION=24`.
* [ ] `TRUST_PROXY=1`.
* [ ] frontend origin exata.
* [ ] cookie `Secure`.
* [ ] cookie `SameSite=None`.
* [ ] jobs desativados.
* [ ] seed inicial bloqueado.
* [ ] seed demo bloqueado durante operação normal.
* [ ] contas demo funcionais.
* [ ] dataset fictício.
* [ ] smoke test read-only passa.
* [ ] fluxo funcional completo validado.
* [ ] build não executa seed demo.
* [ ] migrations sem pendências.
* [ ] health checks passam.
* [ ] logs não expõem secrets.

---

## 34. Checklist de produção

* [ ] Base exclusiva de produção.
* [ ] Backups automáticos.
* [ ] Restore testado.
* [ ] Secrets exclusivos.
* [ ] Domínios finais.
* [ ] HTTPS.
* [ ] origins exatas.
* [ ] cookies confirmados.
* [ ] migrations revistas.
* [ ] seed inicial controlado.
* [ ] seed demo ausente.
* [ ] contas demo ausentes.
* [ ] utilizadores reais.
* [ ] jobs decididos conscientemente.
* [ ] scheduler único, se aplicável.
* [ ] rate limit revisto para a escala.
* [ ] logs persistentes.
* [ ] monitorização.
* [ ] plano de rollback.
* [ ] smoke test pós-deploy.
* [ ] validação funcional.

---

## 35. Segurança

Nunca expor:

```txt
DATABASE_URL
AUTH_JWT_SECRET
SEED_*_PASSWORD
DEMO_*_PASSWORD
cookies de sessão
tokens JWT
dumps da base
backups
credenciais da plataforma
```

Nunca colocar secrets em:

* Git;
* README;
* templates;
* Issues;
* Pull Requests;
* screenshots;
* logs partilhados;
* frontend;
* variáveis `VITE_*`.

As variáveis do frontend são públicas no bundle.

---

## 36. Adicionar uma variável nova

Sempre que uma variável for criada:

1. adicionar ao template adequado;
2. adicionar a `src/config/env.js`, se for da aplicação;
3. definir fallback seguro;
4. validar valores perigosos;
5. atualizar esta documentação;
6. atualizar CI;
7. atualizar staging;
8. preparar produção;
9. adicionar testes;
10. confirmar que não contém secrets no frontend.

---

## 37. Convenções

Prefixos:

```txt
AUTH_      Autenticação
ENABLE_    Toggles
CRON_      Agendamentos
SEED_      Seed inicial
DEMO_      Ambiente demo
STAGING_   Smoke test ou configuração de staging
HIGIENE_   Job de higiene
PURGE_     Limpeza de histórico
ALLOW_     Confirmação explícita
VITE_      Variáveis públicas do frontend
```

Booleanos reconhecidos como verdadeiros:

```txt
1
true
yes
on
```

Booleanos reconhecidos como falsos:

```txt
0
false
no
off
```

Listas:

```env
ALLOWED_ORIGINS="https://app1.pt,https://app2.pt"
```

---

## 38. Resumo rápido

### Desenvolvimento

```env
NODE_ENV=development
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
TRUST_PROXY=false
```

### Staging cross-site

```env
NODE_ENV=production
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
TRUST_PROXY=1
ENABLE_JOBS=false
ALLOW_PRODUCTION_SEED=false
ALLOW_DEMO_SEED=false
```

### Produção inicial

```env
NODE_ENV=production
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
TRUST_PROXY=1
ENABLE_JOBS=false
ALLOW_PRODUCTION_SEED=false
ALLOW_TEST_SCRIPTS_IN_PRODUCTION=false
```

Regra final:

```txt
Development, test, staging e production devem usar bases, secrets,
domínios, utilizadores e objetivos operacionais separados.
```
