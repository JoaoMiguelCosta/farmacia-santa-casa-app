# ENVIRONMENT.md

## Backend — Configuração de Ambiente

Este documento descreve as variáveis de ambiente usadas pelo backend do projeto **Farmácia Santa Casa**.

O backend usa:

* Node.js
* Express
* Helmet
* Prisma
* PostgreSQL
* JWT
* Cookies HTTP-only
* `dotenv`
* `node-cron`
* Vitest/Supertest para testes automatizados

A configuração principal é carregada em:

```txt
src/config/env.js
```

O ficheiro `.env` deve existir na raiz do backend.

**Última atualização:** 2026-06-19

---

## 1. Objetivo deste ficheiro

Este documento serve para:

* Explicar cada variável de ambiente.
* Separar configuração sensível do código.
* Evitar erros entre ambiente local, testes e produção.
* Documentar requisitos de segurança.
* Facilitar onboarding futuro.
* Preparar deploy em plataformas como Railway, Render, Fly.io, VPS ou outro ambiente Node.js.
* Documentar implicações de cookies, CORS, jobs e seed.

---

## 2. Regra principal

Nunca fazer commit do ficheiro real `.env`.

O ficheiro `.env` pode conter:

* URL da base de dados.
* Segredo JWT.
* Configuração de cookies.
* Origens permitidas.
* Toggles de jobs.
* Passwords de seed.
* Configurações sensíveis de produção.

Deve existir apenas localmente ou no painel de variáveis da plataforma de deploy.

---

## 3. Ficheiros recomendados

Estrutura recomendada:

```txt
backend/
├── .env
├── .env.example
├── .node-version
├── docs/
│   └── ENVIRONMENT.md
└── src/
    └── config/
        └── env.js
```

### `.env`

Ficheiro real, privado.

Não deve ir para Git.

### `.env.example`

Modelo seguro, sem segredos reais.

Pode e deve ir para Git.

### `docs/ENVIRONMENT.md`

Documentação explicativa.

Pode e deve ir para Git.

---

## 4. `.gitignore` recomendado

O backend deve ignorar pelo menos:

```gitignore
node_modules/
.env
.env.local
.env.*.local
dist/
coverage/
```

O ficheiro `.env.example` não deve ser ignorado.

---

## 4.1 Runtime Node.js

O backend usa **Node.js 24 LTS**.

A versão suportada está definida em `backend/package.json`:

```json
"engines": {
  "node": ">=24.0.0 <25.0.0"
}
```

O ficheiro de seleção local é:

```txt
backend/.node-version
```

Conteúdo:

```txt
24
```

O GitHub Actions deve usar:

```yaml
node-version: "24.x"
```

No Render, definir a variável de infraestrutura:

```env
NODE_VERSION=24
```

`NODE_VERSION` é usada pela plataforma para selecionar o runtime. Não é uma variável lida por `src/config/env.js` e não precisa de existir no `.env` local.

Antes de instalar dependências ou executar testes:

```bash
node --version
```

O resultado deve começar por `v24.`.

---

## 5. Exemplo seguro de `.env.example`

```env
# -----------------------------------------------------------------------------
# Farmácia Santa Casa API - Environment Example
# -----------------------------------------------------------------------------
# Copia este ficheiro para `.env` e ajusta os valores ao teu ambiente local.
#
# Nunca faças commit do ficheiro `.env` real.
# Este ficheiro `.env.example` pode ser versionado no Git.
# -----------------------------------------------------------------------------

# -----------------------------------------------------------------------------
# Base de dados
# -----------------------------------------------------------------------------
# PostgreSQL + Prisma
# Formato:
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

DATABASE_URL="postgresql://postgres:password@localhost:5432/farmacia_santacasa?schema=public"

# -----------------------------------------------------------------------------
# Servidor
# -----------------------------------------------------------------------------

NODE_ENV="development"
PORT=3001
TZ="Europe/Lisbon"
JSON_LIMIT="1mb"

# -----------------------------------------------------------------------------
# Reverse proxy / infraestrutura
# -----------------------------------------------------------------------------
# TRUST_PROXY controla `app.set("trust proxy", ...)` no Express.
#
# Desenvolvimento local direto:
#   TRUST_PROXY=false
#
# Produção atrás de 1 proxy/load balancer:
#   TRUST_PROXY=1
#
# Evitar TRUST_PROXY=true salvo se a infraestrutura controlar corretamente os
# headers X-Forwarded-*.

TRUST_PROXY=false

# -----------------------------------------------------------------------------
# CORS / Frontend origins permitidas
# -----------------------------------------------------------------------------
# Separar múltiplas origins por vírgula.
# Em desenvolvimento, normalmente:
# - http://localhost:5173
# - http://localhost:5174

ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"

# -----------------------------------------------------------------------------
# Jobs automáticos
# -----------------------------------------------------------------------------
# ENABLE_JOBS controla o registo global dos jobs no arranque.
# Se estiver false, nenhum job automático é registado.
#
# Os toggles individuais só têm efeito quando ENABLE_JOBS=true.
#
# Para testes automatizados, recomenda-se usar false.

ENABLE_JOBS=true
ENABLE_HIGIENE=true
ENABLE_PURGE_HISTORY=true
ENABLE_RECEITAS_EXPIRY=true

# -----------------------------------------------------------------------------
# Job de higiene
# -----------------------------------------------------------------------------
# HIGIENE_OFFSET_MONTHS:
#   Número de meses após deletedAt para o utente ser tratado pela rotina.
#
# HIGIENE_ANONYMIZE:
#   Pedido de anonimização.
#
# ALLOW_HIGIENE_ANONYMIZE:
#   Confirmação explícita para permitir anonimização.
#
# A anonimização só acontece se HIGIENE_ANONYMIZE=true
# e ALLOW_HIGIENE_ANONYMIZE=true.

HIGIENE_OFFSET_MONTHS=12
HIGIENE_ANONYMIZE=false
ALLOW_HIGIENE_ANONYMIZE=false

# -----------------------------------------------------------------------------
# Job de limpeza de histórico
# -----------------------------------------------------------------------------
# Remove histórico fechado antigo de pedidos e regularizações concluídas.

PURGE_OFFSET_MONTHS=6

# -----------------------------------------------------------------------------
# Agendamento cron
# -----------------------------------------------------------------------------
# CRON_MONTHLY_03H:
#   Dia 1 de cada mês às 03:00.
#
# CRON_DAILY_03H:
#   Todos os dias às 03:00.

CRON_MONTHLY_03H="0 3 1 * *"
CRON_DAILY_03H="0 3 * * *"

# -----------------------------------------------------------------------------
# Autenticação
# -----------------------------------------------------------------------------
# AUTH_JWT_SECRET:
#   Obrigatório.
#   Em produção deve ter pelo menos 32 caracteres.
#   Usa um valor longo, aleatório e secreto.
#
# Exemplo para gerar:
#   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

AUTH_JWT_SECRET="replace_with_a_long_random_secret_at_least_32_characters"

AUTH_COOKIE_NAME="farmacia_santacasa_session"
AUTH_TOKEN_EXPIRES_IN="8h"
AUTH_COOKIE_MAX_AGE_MS=28800000

# Desenvolvimento local:
#   AUTH_COOKIE_SECURE=false
#   AUTH_COOKIE_SAME_SITE=lax
#
# Produção HTTPS cross-site:
#   AUTH_COOKIE_SECURE=true
#   AUTH_COOKIE_SAME_SITE=none

AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax

# -----------------------------------------------------------------------------
# Rate limit de login
# -----------------------------------------------------------------------------
# O rate limit usa IP + email.
# O IP é obtido por req.ip, respeitando TRUST_PROXY.

AUTH_LOGIN_RATE_LIMIT_WINDOW_MS=900000
AUTH_LOGIN_RATE_LIMIT_MAX=10

# -----------------------------------------------------------------------------
# Seed inicial
# -----------------------------------------------------------------------------
# Usado por:
#   npm run prisma:seed
#
# Em development/test cria ADMIN, SANTACASA e FARMACIA.
# Em production só cria ADMIN e apenas com ALLOW_PRODUCTION_SEED=true.
#
# Trocar passwords antes de usar fora do desenvolvimento local.

ALLOW_PRODUCTION_SEED=false

SEED_ADMIN_EMAIL="admin@sistema.local"
SEED_ADMIN_PASSWORD="ChangeMeAdmin123!"

SEED_SANTACASA_EMAIL="santacasa@sistema.local"
SEED_SANTACASA_PASSWORD="ChangeMeSantaCasa123!"

SEED_FARMACIA_EMAIL="farmacia@sistema.local"
SEED_FARMACIA_PASSWORD="ChangeMeFarmacia123!"

# -----------------------------------------------------------------------------
# Segurança adicional para scripts manuais
# -----------------------------------------------------------------------------
# Os scripts manuais ficam bloqueados em NODE_ENV=production,
# exceto se esta variável for definida explicitamente como true.
#
# Não usar em produção salvo caso excecional e consciente.

ALLOW_TEST_SCRIPTS_IN_PRODUCTION=false
```

---

## 6. Variáveis obrigatórias

### `DATABASE_URL`

URL de ligação à base de dados PostgreSQL usada pelo Prisma.

Exemplo local:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_santa_casa?schema=public"
```

Obrigatória.

Se estiver em falta, o backend não arranca.

---

### `AUTH_JWT_SECRET`

Segredo usado para assinar tokens JWT.

Exemplo:

```env
AUTH_JWT_SECRET="replace-with-a-secure-random-string-with-at-least-32-chars"
```

Obrigatória.

Se estiver em falta, o backend não arranca.

Em produção deve ter pelo menos 32 caracteres.

Má prática:

```env
AUTH_JWT_SECRET=123
```

Boa prática:

```env
AUTH_JWT_SECRET="use-um-valor-longo-aleatorio-e-dificil-de-adivinhar"
```

Exemplo para gerar valor seguro:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 7. Variáveis da aplicação

### `NODE_ENV`

Define o ambiente da aplicação.

Valores comuns:

```env
NODE_ENV=development
NODE_ENV=test
NODE_ENV=production
```

Impacta:

* Logs do Prisma.
* Segurança dos cookies.
* Validações de produção.
* Comportamento de permissões relacionadas com origem.
* Mensagens/logs de erro.

Valor por defeito:

```env
development
```

---

### `PORT`

Porta HTTP do backend.

Exemplo:

```env
PORT=3001
```

Valor por defeito:

```env
3001
```

---

### `TZ`

Timezone usada pelo backend e pelos jobs.

Exemplo:

```env
TZ=Europe/Lisbon
```

Valor por defeito:

```env
Europe/Lisbon
```

Importante para:

* Jobs cron.
* Datas de execução.
* Consistência em logs.
* Cálculo de datas de corte.
* Validade diária de receitas.

O backend define `process.env.TZ` com este valor.

---

### `JSON_LIMIT`

Limite máximo para payloads JSON recebidos pelo Express.

Exemplo:

```env
JSON_LIMIT=1mb
```

Valor por defeito:

```env
1mb
```

---

### `TRUST_PROXY`

Configura o `trust proxy` do Express.

Exemplo local:

```env
TRUST_PROXY=false
```

Exemplo produção atrás de um proxy/load balancer:

```env
TRUST_PROXY=1
```

Valores aceites:

```env
TRUST_PROXY=false
TRUST_PROXY=true
TRUST_PROXY=1
TRUST_PROXY=2
```

Recomendação:

* usar `false` quando a API está exposta diretamente;
* usar `1` quando a API está atrás de um proxy/load balancer confiável;
* evitar `true` salvo se a infraestrutura controlar corretamente os headers `X-Forwarded-*`.

Esta variável é importante para `req.ip` e, por consequência, para o rate limit de login.

---

## 8. Base de dados

### `DATABASE_URL`

O backend usa PostgreSQL através do Prisma.

Formato:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Exemplo local:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_santa_casa?schema=public"
```

Exemplo produção:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/farmacia_santa_casa?schema=public"
```

### Recomendações

* Usar base de dados separada para desenvolvimento e produção.
* Evitar usar a base de dados de produção para testes automatizados.
* Fazer backup antes de executar jobs destrutivos em produção.
* Confirmar `DATABASE_URL` antes de correr migrations, seed ou purge.

---

## 9. Variáveis de autenticação

### `AUTH_COOKIE_NAME`

Nome do cookie de sessão.

Exemplo:

```env
AUTH_COOKIE_NAME=farmacia_santacasa_session
```

Valor por defeito:

```env
farmacia_santacasa_session
```

---

### `AUTH_TOKEN_EXPIRES_IN`

Tempo de validade do token JWT.

Exemplo:

```env
AUTH_TOKEN_EXPIRES_IN=8h
```

Valor por defeito:

```env
8h
```

Exemplos aceites pela biblioteca JWT:

```env
15m
1h
8h
1d
```

---

### `AUTH_COOKIE_MAX_AGE_MS`

Tempo de validade do cookie em milissegundos.

Exemplo para 8 horas:

```env
AUTH_COOKIE_MAX_AGE_MS=28800000
```

Valor por defeito:

```env
28800000
```

Atenção: deve estar alinhado com `AUTH_TOKEN_EXPIRES_IN`.

Má prática:

```env
AUTH_TOKEN_EXPIRES_IN=8h
AUTH_COOKIE_MAX_AGE_MS=604800000
```

Isto deixaria o cookie durar mais tempo do que o token.

---

### `AUTH_COOKIE_SECURE`

Define se o cookie só deve ser enviado por HTTPS.

Valores:

```env
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SECURE=false
```

Valor por defeito:

* `false` em desenvolvimento.
* `true` em produção.

Em produção deve ser `true`.

---

### `AUTH_COOKIE_SAME_SITE`

Define a política `SameSite` do cookie.

Valores aceites:

```env
AUTH_COOKIE_SAME_SITE=strict
AUTH_COOKIE_SAME_SITE=lax
AUTH_COOKIE_SAME_SITE=none
```

Valor por defeito:

* `lax` em desenvolvimento.
* `none` em produção.

Regra crítica:

```txt
AUTH_COOKIE_SAME_SITE=none exige AUTH_COOKIE_SECURE=true
```

Isto é obrigatório porque browsers modernos rejeitam cookies `SameSite=None` sem `Secure`.

---

## 10. Login rate limit

O backend tem proteção básica contra tentativas repetidas de login.

### `AUTH_LOGIN_RATE_LIMIT_WINDOW_MS`

Janela temporal do rate limit.

Exemplo:

```env
AUTH_LOGIN_RATE_LIMIT_WINDOW_MS=900000
```

Equivale a 15 minutos.

Valor por defeito:

```env
900000
```

---

### `AUTH_LOGIN_RATE_LIMIT_MAX`

Número máximo de tentativas falhadas dentro da janela.

Exemplo:

```env
AUTH_LOGIN_RATE_LIMIT_MAX=10
```

Valor por defeito:

```env
10
```

Se ultrapassar o limite, o backend responde com `429 TOO_MANY_REQUESTS`.

### Limitação técnica

O rate limit usa `Map` em memória e identifica tentativas por IP + email.

O IP é obtido através de `req.ip`, respeitando `TRUST_PROXY`.

Se a API estiver atrás de reverse proxy/load balancer, `TRUST_PROXY` deve estar configurado corretamente para que o IP do cliente seja interpretado de forma segura.

O rate limit usa `Map` em memória.

Isto significa que:

* funciona bem em desenvolvimento;
* funciona numa instância única;
* reinicia quando o processo reinicia;
* não é partilhado entre múltiplas instâncias.

Para produção multi-instância, considerar Redis ou outro rate limiter externo.

---

## 11. Origens permitidas

### `ALLOWED_ORIGINS`

Lista de origens autorizadas a comunicar com o backend.

Exemplo local:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

Exemplo produção:

```env
ALLOWED_ORIGINS=https://farmacia-santa-casa.vercel.app
```

Valor por defeito em desenvolvimento:

```txt
http://localhost:5173
http://localhost:5174
```

### Regras

* Separar múltiplas origins por vírgula.
* Não usar `*` em produção.
* A origin deve incluir protocolo.
* Não colocar slash final.

Correto:

```env
ALLOWED_ORIGINS=https://app.exemplo.pt
```

Evitar:

```env
ALLOWED_ORIGINS=https://app.exemplo.pt/
```

### Origin guard

O backend bloqueia pedidos mutáveis vindos de origens não autorizadas.

Pedidos mutáveis incluem:

```txt
POST
PUT
PATCH
DELETE
```

Pedidos seguros:

```txt
GET
HEAD
OPTIONS
```

Em desenvolvimento, pedidos sem `Origin` podem ser permitidos para ferramentas locais, scripts e Supertest.

Em produção, pedidos mutáveis sem origem válida devem ser bloqueados.

---

## 12. Jobs automáticos

O backend tem jobs automáticos com `node-cron`.

Os jobs são registados no arranque do servidor apenas se `ENABLE_JOBS=true`.

### `ENABLE_JOBS`

Ativa ou desativa globalmente o registo automático de jobs.

```env
ENABLE_JOBS=true
```

Valor por defeito:

```env
true
```

Quando está `false`, nenhum job automático é registado, mesmo que os toggles individuais estejam `true`.

Isto é útil para:

* ambientes de teste;
* produção com múltiplas instâncias;
* separar instância web e instância worker.

### `ENABLE_HIGIENE`

Ativa ou desativa o job de higiene de utentes removidos antigos.

```env
ENABLE_HIGIENE=true
```

Valor por defeito:

```env
true
```

---

### `ENABLE_PURGE_HISTORY`

Ativa ou desativa o job de limpeza de histórico antigo.

```env
ENABLE_PURGE_HISTORY=true
```

Valor por defeito:

```env
true
```

---

### `ENABLE_RECEITAS_EXPIRY`

Ativa ou desativa o job de expiração de linhas de receita.

```env
ENABLE_RECEITAS_EXPIRY=true
```

Valor por defeito:

```env
true
```

### Recomendação para testes

Para testes automatizados ou ambientes temporários, pode ser preferível usar:

```env
ENABLE_JOBS=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=false
```

Isto evita que jobs automáticos alterem dados enquanto testes correm.

---

## 13. Job de higiene

### `HIGIENE_OFFSET_MONTHS`

Define a idade mínima, em meses, para considerar um utente removido elegível para higiene.

Exemplo:

```env
HIGIENE_OFFSET_MONTHS=12
```

Valor por defeito:

```env
12
```

Significa:

```txt
Utentes removidos há 12 meses ou mais podem ser marcados pela rotina de higiene.
```

---

### `HIGIENE_ANONYMIZE`

Indica se o job deve tentar anonimizar dados do utente.

```env
HIGIENE_ANONYMIZE=false
```

Valor por defeito:

```env
false
```

---

### `ALLOW_HIGIENE_ANONYMIZE`

Confirmação adicional para permitir anonimização.

```env
ALLOW_HIGIENE_ANONYMIZE=false
```

Valor por defeito:

```env
false
```

A anonimização só é aplicada quando ambas estão ativas:

```env
HIGIENE_ANONYMIZE=true
ALLOW_HIGIENE_ANONYMIZE=true
```

Isto é intencional e reduz o risco de anonimização acidental.

---

## 14. Job de limpeza de histórico

### `PURGE_OFFSET_MONTHS`

Define a idade mínima, em meses, para remover histórico fechado.

Exemplo:

```env
PURGE_OFFSET_MONTHS=6
```

Valor por defeito:

```env
6
```

Afeta:

* Pedidos validados antigos.
* Pedidos rejeitados antigos.
* Pedidos cancelados antigos.
* Itens de pedido associados.
* Dispensas associadas.
* Regularizações concluídas antigas.
* Eventos associados às regularizações removidas.

### Nota de segurança

O job de purge remove dados históricos.

Antes de executar em produção:

* fazer backup;
* correr preview;
* confirmar `PURGE_OFFSET_MONTHS`;
* confirmar `DATABASE_URL`;
* confirmar que está no ambiente correto.

---

## 15. Expressões cron

### `CRON_MONTHLY_03H`

Agenda mensal.

Exemplo:

```env
CRON_MONTHLY_03H="0 3 1 * *"
```

Significa:

```txt
Dia 1 de cada mês às 03:00.
```

Usado por:

* Job de higiene.
* Job de limpeza de histórico.

Valor por defeito:

```env
0 3 1 * *
```

---

### `CRON_DAILY_03H`

Agenda diária.

Exemplo:

```env
CRON_DAILY_03H="0 3 * * *"
```

Significa:

```txt
Todos os dias às 03:00.
```

Usado por:

* Job de expiração de receitas.

Valor por defeito:

```env
0 3 * * *
```

---

## 16. Variáveis de seed

O seed é executado por:

```bash
npm run prisma:seed
```

ou diretamente:

```bash
npx prisma db seed
```

### Desenvolvimento e testes

Em `development` e `test`, o seed cria/atualiza os utilizadores iniciais:

```env
SEED_ADMIN_EMAIL=admin@sistema.local
SEED_ADMIN_PASSWORD=ChangeMeAdmin123!

SEED_SANTACASA_EMAIL=santacasa@sistema.local
SEED_SANTACASA_PASSWORD=ChangeMeSantaCasa123!

SEED_FARMACIA_EMAIL=farmacia@sistema.local
SEED_FARMACIA_PASSWORD=ChangeMeFarmacia123!
```

### Produção

Em `production`, o seed é bloqueado por defeito:

```env
ALLOW_PRODUCTION_SEED=false
```

Só deve ser ativado em setup inicial controlado:

```env
ALLOW_PRODUCTION_SEED=true
SEED_ADMIN_EMAIL=admin@exemplo.pt
SEED_ADMIN_PASSWORD=password forte com pelo menos 10 caracteres
```

Em produção, o seed:

* cria apenas o `ADMIN` inicial;
* não cria `SANTACASA` nem `FARMACIA`;
* não aceita passwords padrão;
* não redefine password de admin já existente;
* não altera role, nome ou estado de admin já existente.

Depois do admin inicial, as contas Santa Casa/Farmácia devem ser criadas na UI:

```txt
Sistema > Utilizadores
```

---

## 17. Segurança adicional para scripts manuais

### `ALLOW_TEST_SCRIPTS_IN_PRODUCTION`

Controla execução de scripts manuais em produção, quando aplicável.

Exemplo:

```env
ALLOW_TEST_SCRIPTS_IN_PRODUCTION=false
```

Valor recomendado:

```env
false
```

Objetivo:

* evitar execução acidental de scripts de teste ou manutenção em produção;
* criar uma barreira explícita para casos excecionais.

Regra:

```txt
Não ativar em produção salvo caso excecional e consciente.
```

---

## 18. Ambiente local recomendado

Exemplo para desenvolvimento local:

```env
NODE_ENV=development
PORT=3001
TZ=Europe/Lisbon
JSON_LIMIT=1mb
TRUST_PROXY=false

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_santa_casa?schema=public"

AUTH_JWT_SECRET="dev-secret-change-this-value-with-at-least-32-characters"
AUTH_COOKIE_NAME=farmacia_santacasa_session
AUTH_TOKEN_EXPIRES_IN=8h
AUTH_COOKIE_MAX_AGE_MS=28800000
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax

AUTH_LOGIN_RATE_LIMIT_WINDOW_MS=900000
AUTH_LOGIN_RATE_LIMIT_MAX=10

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

ENABLE_JOBS=true
ENABLE_HIGIENE=true
ENABLE_PURGE_HISTORY=true
ENABLE_RECEITAS_EXPIRY=true

HIGIENE_OFFSET_MONTHS=12
HIGIENE_ANONYMIZE=false
ALLOW_HIGIENE_ANONYMIZE=false

PURGE_OFFSET_MONTHS=6

CRON_MONTHLY_03H="0 3 1 * *"
CRON_DAILY_03H="0 3 * * *"

ALLOW_PRODUCTION_SEED=false

SEED_ADMIN_EMAIL=admin@sistema.local
SEED_ADMIN_PASSWORD=ChangeMeAdmin123!
SEED_SANTACASA_EMAIL=santacasa@sistema.local
SEED_SANTACASA_PASSWORD=ChangeMeSantaCasa123!
SEED_FARMACIA_EMAIL=farmacia@sistema.local
SEED_FARMACIA_PASSWORD=ChangeMeFarmacia123!

ALLOW_TEST_SCRIPTS_IN_PRODUCTION=false
```

---

## 19. Ambiente de testes recomendado

A suite de testes atual usa Vitest e Supertest.

Em testes automatizados, recomenda-se:

```env
NODE_ENV=test
TZ=Europe/Lisbon
TRUST_PROXY=false

ENABLE_JOBS=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=false
```

### Nota importante

O backend não define obrigatoriamente uma variável própria `TEST_DATABASE_URL`.

Por isso, antes de correr testes, confirma que `DATABASE_URL` aponta para uma base adequada a testes/desenvolvimento, e nunca para produção.

Comandos habituais:

```bash
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm run test:all
npm run test:coverage
npm run validate
```

---

## 20. Ambiente de produção recomendado

Exemplo genérico:

```env
NODE_ENV=production
PORT=3001
TZ=Europe/Lisbon
JSON_LIMIT=1mb
TRUST_PROXY=1

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

AUTH_JWT_SECRET="use-a-real-long-random-secret-with-at-least-32-characters"
AUTH_COOKIE_NAME=farmacia_santacasa_session
AUTH_TOKEN_EXPIRES_IN=8h
AUTH_COOKIE_MAX_AGE_MS=28800000
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none

AUTH_LOGIN_RATE_LIMIT_WINDOW_MS=900000
AUTH_LOGIN_RATE_LIMIT_MAX=10

ALLOWED_ORIGINS=https://your-frontend-domain.com

ENABLE_JOBS=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=true

HIGIENE_OFFSET_MONTHS=12
HIGIENE_ANONYMIZE=false
ALLOW_HIGIENE_ANONYMIZE=false

PURGE_OFFSET_MONTHS=6

CRON_MONTHLY_03H="0 3 1 * *"
CRON_DAILY_03H="0 3 * * *"

ALLOW_PRODUCTION_SEED=false
ALLOW_TEST_SCRIPTS_IN_PRODUCTION=false
```

### Produção com frontend e backend no mesmo site

Pode ser possível usar:

```env
AUTH_COOKIE_SAME_SITE=lax
AUTH_COOKIE_SECURE=true
```

### Produção com frontend e backend em domínios diferentes

Normalmente será necessário:

```env
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
```

O frontend também deve enviar cookies com credenciais.

---

## 20.1 Health checks de produção

Endpoints disponíveis:

```txt
GET /api/health/live
GET /api/health/ready
GET /api/health
```

Acesso:

| Endpoint | Acesso | Uso recomendado |
| -------- | ------ | --------------- |
| `/api/health/live` | Público | Liveness/processo Node ativo |
| `/api/health/ready` | Público | Readiness/API + base de dados |
| `/api/health` | `ADMIN` | Verificação administrativa autenticada |

Recomendação:

* usar `/api/health/live` para probes simples;
* usar `/api/health/ready` quando a plataforma suportar readiness;
* manter `/api/health` para a área administrativa.


---

## 20.2 Security headers e request ID

Estes pontos não exigem variáveis de ambiente novas.

A API aplica security headers HTTP através de `helmet`.

Todas as respostas incluem:

```txt
X-Request-Id
```

Regras:

* se o cliente enviar `X-Request-Id` válido, o backend preserva esse valor;
* se o cliente não enviar, o backend gera um identificador;
* o header é exposto em CORS;
* os logs de erro incluem `requestId`.

Isto permite cruzar uma falha vista no frontend com os logs do backend.

---

## 20.3 Runtime e configuração no Render

Configuração atual/recomendada do serviço backend no Render:

```txt
Root Directory: backend
Build Command: npm ci && npm run prisma:migrate:deploy
Start Command: npm start
Auto-Deploy: On Commit
Included Path: backend/**
```

Runtime da plataforma:

```env
NODE_VERSION=24
```

Configuração operacional conservadora para staging/demo:

```env
NODE_ENV=production
TZ=Europe/Lisbon
TRUST_PROXY=1
ENABLE_JOBS=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=false
```

Os logs de arranque devem confirmar:

```txt
[server] listening on port <PORT> (production)
[jobs] todos os jobs DESATIVADOS por ENABLE_JOBS=false
```

A porta é fornecida pelo Render através de `PORT` e não deve ser fixada manualmente no código.

---

## 21. Checklist antes de arrancar localmente

Antes de correr o backend:

* [ ] Confirmar Node.js `v24.x`.
* [ ] Confirmar que `.node-version` contém `24`.
* [ ] Criar `.env`.
* [ ] Confirmar `DATABASE_URL`.
* [ ] Confirmar `AUTH_JWT_SECRET`.
* [ ] Confirmar `ALLOWED_ORIGINS`.
* [ ] Confirmar `AUTH_COOKIE_SECURE=false` para HTTP local.
* [ ] Confirmar `AUTH_COOKIE_SAME_SITE=lax` para desenvolvimento local.
* [ ] Instalar dependências.
* [ ] Gerar Prisma Client.
* [ ] Aplicar migrations.
* [ ] Executar seed, se necessário.
* [ ] Arrancar servidor.

Comandos:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npx prisma db seed
npm run dev
```

---

## 22. Checklist antes de correr testes

Antes de correr a suite:

* [ ] Confirmar Node.js `v24.x`.
* [ ] Confirmar que não estás ligado à base de produção.
* [ ] Confirmar `DATABASE_URL`.
* [ ] Confirmar utilizadores de seed.
* [ ] Executar seed se a base estiver limpa.
* [ ] Confirmar que jobs automáticos não vão interferir.
* [ ] Confirmar que `NODE_ENV` não está como `production`.
* [ ] Correr primeiro o teste específico quando alterares um ficheiro.
* [ ] Depois correr `test:all` e `validate`.

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

## 23. Checklist antes de produção

Antes de publicar:

* [ ] Node.js 24 LTS confirmado.
* [ ] `NODE_VERSION=24` definido na plataforma de deploy.
* [ ] GitHub Actions usa `node-version: "24.x"`.
* [ ] `NODE_ENV=production`.
* [ ] `TRUST_PROXY` definido conforme a infraestrutura (`false` direto, `1` atrás de um proxy).
* [ ] `AUTH_JWT_SECRET` forte, aleatório e com pelo menos 32 caracteres.
* [ ] `AUTH_COOKIE_SECURE=true`.
* [ ] `AUTH_COOKIE_SAME_SITE=none`, se frontend e backend estiverem em domínios diferentes.
* [ ] `ALLOWED_ORIGINS` sem `*`.
* [ ] `ALLOWED_ORIGINS` com domínio exato do frontend.
* [ ] `DATABASE_URL` de produção correta.
* [ ] Jobs confirmados.
* [ ] `PURGE_OFFSET_MONTHS` confirmado.
* [ ] `HIGIENE_OFFSET_MONTHS` confirmado.
* [ ] `HIGIENE_ANONYMIZE=false`, salvo decisão explícita.
* [ ] `ALLOW_HIGIENE_ANONYMIZE=false`, salvo decisão explícita.
* [ ] `ENABLE_JOBS` definido conscientemente.
* [ ] Security headers confirmados numa resposta real.
* [ ] `X-Request-Id` confirmado numa resposta real.
* [ ] `ALLOW_PRODUCTION_SEED=false`, salvo setup inicial controlado.
* [ ] `ALLOW_TEST_SCRIPTS_IN_PRODUCTION=false`.
* [ ] Backups da base de dados configurados.
* [ ] Seed com passwords seguras ou desativado/controlado após setup inicial.
* [ ] Logs de produção revistos.
* [ ] Frontend configurado para enviar cookies com credenciais.
* [ ] `npm run validate` passou antes do deploy.

---

## 24. Validações feitas por `src/config/env.js`

O backend bloqueia arranque quando:

### `DATABASE_URL` está em falta

```txt
[env] DATABASE_URL em falta.
```

### `AUTH_JWT_SECRET` está em falta

```txt
[env] AUTH_JWT_SECRET em falta.
```

### `AUTH_JWT_SECRET` é demasiado curto em produção

```txt
[env] AUTH_JWT_SECRET deve ter pelo menos 32 caracteres em produção.
```

### `AUTH_COOKIE_SECURE=false` em produção

```txt
[env] AUTH_COOKIE_SECURE deve ser true em produção.
```

### `AUTH_COOKIE_SAME_SITE=none` sem cookie seguro

```txt
[env] AUTH_COOKIE_SAME_SITE=none exige AUTH_COOKIE_SECURE=true.
```

### `TRUST_PROXY` mal configurado

Sintomas possíveis:

* rate limit por IP não funciona como esperado;
* todos os pedidos parecem vir do proxy;
* `X-Forwarded-For` não é respeitado quando deveria ser;
* ou, no sentido oposto, headers externos são confiados indevidamente.

Solução:

```env
TRUST_PROXY=false
```

para API exposta diretamente, ou:

```env
TRUST_PROXY=1
```

para API atrás de um proxy/load balancer confiável.

---

### `ALLOWED_ORIGINS=*` em produção

```txt
[env] ALLOWED_ORIGINS não pode conter '*' em produção.
```

---

## 25. Erros comuns

### `DATABASE_URL em falta`

Causa:

```txt
.env não existe ou DATABASE_URL não está definida.
```

Solução:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

---

### `AUTH_JWT_SECRET em falta`

Causa:

```txt
AUTH_JWT_SECRET não definida.
```

Solução:

```env
AUTH_JWT_SECRET="use-um-segredo-longo"
```

---

### `AUTH_JWT_SECRET deve ter pelo menos 32 caracteres em produção`

Causa:

```txt
NODE_ENV=production com segredo demasiado curto.
```

Solução:

```env
AUTH_JWT_SECRET="use-um-segredo-real-com-mais-de-32-caracteres"
```

---

### `AUTH_COOKIE_SECURE deve ser true em produção`

Causa:

```txt
NODE_ENV=production e AUTH_COOKIE_SECURE=false.
```

Solução:

```env
AUTH_COOKIE_SECURE=true
```

---

### `AUTH_COOKIE_SAME_SITE=none exige AUTH_COOKIE_SECURE=true`

Causa:

```txt
Cookie cross-site configurado sem HTTPS obrigatório.
```

Solução:

```env
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
```

---

### `ALLOWED_ORIGINS não pode conter '*' em produção`

Causa:

```txt
NODE_ENV=production e ALLOWED_ORIGINS contém *.
```

Solução:

```env
ALLOWED_ORIGINS=https://teu-frontend.pt
```

---

### Login funciona no backend mas frontend não mantém sessão

Causas prováveis:

* Frontend não envia credenciais.
* `ALLOWED_ORIGINS` não inclui o domínio do frontend.
* Cookie bloqueado por `SameSite`.
* `AUTH_COOKIE_SECURE` incorreto.
* Backend e frontend estão em domínios diferentes.
* Estás a usar HTTP local com `AUTH_COOKIE_SECURE=true`.
* Estás a usar cross-site em produção sem `AUTH_COOKIE_SAME_SITE=none`.

No frontend, chamadas autenticadas devem usar:

```js
fetch(url, {
  credentials: "include",
});
```

Ou no Axios:

```js
axios.create({
  withCredentials: true,
});
```

---

### Testes E2E falham com autenticação

Causas prováveis:

* Seed não executado.
* Credenciais de seed no `.env` diferentes das fixtures.
* Base de dados errada.
* Utilizador seed está inativo.
* `AUTH_JWT_SECRET` mudou durante a execução.
* Rate limit acumulado por tentativas falhadas.

Soluções:

```bash
npx prisma db seed
npm run test:e2e -- --run
```

Confirmar também:

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

Causa:

```txt
Jobs automáticos ativos num ambiente onde estão a correr testes.
```

Solução:

```env
ENABLE_JOBS=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=false
```

---

## 26. Segurança

### Não expor segredos

Nunca expor:

* `DATABASE_URL`
* `AUTH_JWT_SECRET`
* Passwords de seed reais
* Credenciais de produção
* Dumps da base de dados

---

### Não usar passwords padrão em produção

As passwords de seed são aceitáveis apenas para desenvolvimento local.

Em produção:

* Usar passwords fortes.
* Alterar após primeiro login.
* Criar utilizadores manualmente se necessário.
* Remover ou controlar execução de seed.

---

### Não usar `ALLOWED_ORIGINS=*`

O backend usa cookies HTTP-only.

Com cookies e credenciais, `*` é perigoso e deve ser evitado.

Em produção, o backend bloqueia `*`.

---

### Rever flags destrutivas

Antes de produção, rever sempre:

```env
ENABLE_PURGE_HISTORY
PURGE_OFFSET_MONTHS
HIGIENE_ANONYMIZE
ALLOW_HIGIENE_ANONYMIZE
ALLOW_TEST_SCRIPTS_IN_PRODUCTION
```

---

## 27. Boas práticas

* Usar `.env.example` sempre atualizado.
* Documentar novas variáveis neste ficheiro.
* Validar variáveis obrigatórias em `src/config/env.js`.
* Nunca depender de valores mágicos espalhados pelo código.
* Centralizar configuração em `env.js`.
* Manter defaults seguros para desenvolvimento.
* Ser mais restritivo em produção.
* Alinhar tempo de cookie com tempo de JWT.
* Rever jobs antes de produção.
* Correr `npm run validate` antes de deploy.
* Nunca correr testes contra produção.

---

## 28. Quando adicionar uma nova variável

Sempre que adicionares uma nova variável:

1. Adiciona ao `.env.example`.
2. Adiciona ao `src/config/env.js`, se for consumida pela aplicação.
3. Define fallback, se fizer sentido.
4. Valida se for obrigatória ou perigosa.
5. Documenta neste ficheiro.
6. Verifica produção.
7. Atualiza README, se for uma variável essencial.
8. Atualiza testes, se a variável alterar comportamento.

---

## 29. Convenções

### Prefixos recomendados

```txt
AUTH_      Configuração de autenticação
ENABLE_    Ativar/desativar funcionalidades/jobs
CRON_      Agendamentos
SEED_      Dados usados pelo seed
HIGIENE_   Configuração do job de higiene
PURGE_     Configuração do job de limpeza de histórico
ALLOW_     Confirmações explícitas para operações sensíveis
```

### Formato de listas

Listas devem ser separadas por vírgulas:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Booleanos aceites

O backend aceita como verdadeiro:

```txt
1
true
yes
on
```

Aceita como falso:

```txt
0
false
no
off
```

Qualquer outro valor usa o fallback definido em `env.js`.

### Números

Valores numéricos inválidos usam fallback definido em `env.js`.

Exemplos:

```env
PORT=3001
AUTH_COOKIE_MAX_AGE_MS=28800000
HIGIENE_OFFSET_MONTHS=12
PURGE_OFFSET_MONTHS=6
```

---

## 30. Resumo rápido

Variáveis críticas:

```txt
DATABASE_URL
AUTH_JWT_SECRET
AUTH_COOKIE_SECURE
AUTH_COOKIE_SAME_SITE
ALLOWED_ORIGINS
```

Variáveis críticas para jobs:

```txt
ENABLE_HIGIENE
ENABLE_PURGE_HISTORY
ENABLE_RECEITAS_EXPIRY
HIGIENE_OFFSET_MONTHS
HIGIENE_ANONYMIZE
ALLOW_HIGIENE_ANONYMIZE
PURGE_OFFSET_MONTHS
```

Variáveis críticas para seed/testes:

```txt
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
SEED_SANTACASA_EMAIL
SEED_SANTACASA_PASSWORD
SEED_FARMACIA_EMAIL
SEED_FARMACIA_PASSWORD
```

Para local:

```env
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
```

Para produção HTTPS cross-site:

```env
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
```

Regra final:

```txt
Se mexeres em autenticação, cookies, CORS, jobs, seed, testes ou deploy, revê este ficheiro antes de publicar.
```
