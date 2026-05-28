# ENVIRONMENT.md

## Backend — Configuração de Ambiente

Este documento descreve as variáveis de ambiente usadas pelo backend do projeto **Farmácia Santa Casa**.

O backend usa:

- Node.js
- Express
- Prisma
- PostgreSQL
- JWT
- Cookies HTTP-only
- `dotenv`
- `node-cron`

A configuração principal é carregada em:

```txt
src/config/env.js
```

O ficheiro `.env` deve existir na raiz do backend.

---

## 1. Objetivo deste ficheiro

Este documento serve para:

- Explicar cada variável de ambiente.
- Separar configuração sensível do código.
- Evitar erros entre ambiente local e produção.
- Documentar requisitos de segurança.
- Facilitar onboarding futuro.
- Preparar deploy em plataformas como Railway, Render, Fly.io, VPS ou outro ambiente Node.js.

---

## 2. Regra principal

Nunca fazer commit do ficheiro real `.env`.

O ficheiro `.env` pode conter:

- URL da base de dados.
- Segredo JWT.
- Configuração de cookies.
- Origens permitidas.
- Toggles de jobs.
- Configurações sensíveis de produção.

Deve existir apenas localmente ou no painel de variáveis da plataforma de deploy.

---

## 3. Ficheiros recomendados

Estrutura recomendada:

```txt
backend/
├── .env
├── .env.example
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

## 5. Exemplo seguro de `.env.example`

```env
# App
NODE_ENV=development
PORT=3001
TZ=Europe/Lisbon
JSON_LIMIT=1mb

# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/farmacia_santa_casa?schema=public"

# Auth
AUTH_JWT_SECRET="replace-with-a-secure-random-string-with-at-least-32-chars"
AUTH_COOKIE_NAME=farmacia_santacasa_session
AUTH_TOKEN_EXPIRES_IN=8h
AUTH_COOKIE_MAX_AGE_MS=28800000
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax

# Login rate limit
AUTH_LOGIN_RATE_LIMIT_WINDOW_MS=900000
AUTH_LOGIN_RATE_LIMIT_MAX=10

# CORS / Origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Jobs
ENABLE_HIGIENE=true
ENABLE_PURGE_HISTORY=true
ENABLE_RECEITAS_EXPIRY=true

# Higiene
HIGIENE_OFFSET_MONTHS=12
HIGIENE_ANONYMIZE=false
ALLOW_HIGIENE_ANONYMIZE=false

# Purge history
PURGE_OFFSET_MONTHS=6

# Cron
CRON_MONTHLY_03H="0 3 1 * *"
CRON_DAILY_03H="0 3 * * *"

# Seed users
SEED_ADMIN_EMAIL=admin@sistema.local
SEED_ADMIN_PASSWORD=Admin123!
SEED_SANTACASA_EMAIL=santacasa@sistema.local
SEED_SANTACASA_PASSWORD=SantaCasa123!
SEED_FARMACIA_EMAIL=farmacia@sistema.local
SEED_FARMACIA_PASSWORD=Farmacia123!
```

---

## 6. Variáveis obrigatórias

### `DATABASE_URL`

URL de ligação à base de dados PostgreSQL.

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

Em produção deve ter pelo menos 32 caracteres.

Má prática:

```env
AUTH_JWT_SECRET=123
```

Boa prática:

```env
AUTH_JWT_SECRET="use-um-valor-longo-aleatorio-e-dificil-de-adivinhar"
```

---

## 7. Variáveis da aplicação

### `NODE_ENV`

Define o ambiente da aplicação.

Valores comuns:

```env
NODE_ENV=development
NODE_ENV=production
```

Impacta:

- Logs do Prisma.
- Segurança dos cookies.
- Validações de produção.
- Comportamento de permissões relacionadas com origem.

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

- Jobs cron.
- Datas de execução.
- Consistência em logs.
- Cálculo de datas de corte.

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

## 8. Variáveis de autenticação

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

- `false` em desenvolvimento.
- `true` em produção.

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

- `lax` em desenvolvimento.
- `none` em produção.

Regra crítica:

```txt
AUTH_COOKIE_SAME_SITE=none exige AUTH_COOKIE_SECURE=true
```

Isto é obrigatório porque browsers modernos rejeitam cookies `SameSite=None` sem `Secure`.

---

## 9. Login rate limit

O backend tem proteção básica contra tentativas repetidas de login.

### `AUTH_LOGIN_RATE_LIMIT_WINDOW_MS`

Janela temporal do rate limit.

Exemplo:

```env
AUTH_LOGIN_RATE_LIMIT_WINDOW_MS=900000
```

Equivale a 15 minutos.

---

### `AUTH_LOGIN_RATE_LIMIT_MAX`

Número máximo de tentativas falhadas dentro da janela.

Exemplo:

```env
AUTH_LOGIN_RATE_LIMIT_MAX=10
```

Se ultrapassar o limite, o backend responde com `429 TOO_MANY_REQUESTS`.

---

## 10. Origens permitidas

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

Não usar `*` em produção.

O backend bloqueia pedidos mutáveis vindos de origens não autorizadas.

Pedidos mutáveis incluem:

- `POST`
- `PUT`
- `PATCH`
- `DELETE`

Pedidos seguros:

- `GET`
- `HEAD`
- `OPTIONS`

---

## 11. Jobs

O backend tem jobs automáticos com `node-cron`.

Os jobs são registados no arranque do servidor.

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

---

## 12. Job de higiene

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

## 13. Job de limpeza de histórico

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

- Pedidos validados antigos.
- Pedidos rejeitados antigos.
- Pedidos cancelados antigos.
- Regularizações concluídas antigas.
- Eventos associados às regularizações removidas.
- Dispensas e itens associados aos pedidos removidos.

---

## 14. Expressões cron

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

- Job de higiene.
- Job de limpeza de histórico.

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

- Job de expiração de receitas.

---

## 15. Variáveis de seed

O seed cria utilizadores iniciais.

### Admin

```env
SEED_ADMIN_EMAIL=admin@sistema.local
SEED_ADMIN_PASSWORD=Admin123!
```

### Santa Casa

```env
SEED_SANTACASA_EMAIL=santacasa@sistema.local
SEED_SANTACASA_PASSWORD=SantaCasa123!
```

### Farmácia

```env
SEED_FARMACIA_EMAIL=farmacia@sistema.local
SEED_FARMACIA_PASSWORD=Farmacia123!
```

Em produção, não usar passwords fracas ou previsíveis.

O seed pode atualizar utilizadores existentes com os mesmos emails.

---

## 16. Ambiente local recomendado

Exemplo para desenvolvimento local:

```env
NODE_ENV=development
PORT=3001
TZ=Europe/Lisbon
JSON_LIMIT=1mb

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

ENABLE_HIGIENE=true
ENABLE_PURGE_HISTORY=true
ENABLE_RECEITAS_EXPIRY=true

HIGIENE_OFFSET_MONTHS=12
HIGIENE_ANONYMIZE=false
ALLOW_HIGIENE_ANONYMIZE=false

PURGE_OFFSET_MONTHS=6

CRON_MONTHLY_03H="0 3 1 * *"
CRON_DAILY_03H="0 3 * * *"
```

---

## 17. Ambiente de produção recomendado

Exemplo genérico:

```env
NODE_ENV=production
PORT=3001
TZ=Europe/Lisbon
JSON_LIMIT=1mb

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

ENABLE_HIGIENE=true
ENABLE_PURGE_HISTORY=true
ENABLE_RECEITAS_EXPIRY=true

HIGIENE_OFFSET_MONTHS=12
HIGIENE_ANONYMIZE=false
ALLOW_HIGIENE_ANONYMIZE=false

PURGE_OFFSET_MONTHS=6

CRON_MONTHLY_03H="0 3 1 * *"
CRON_DAILY_03H="0 3 * * *"
```

---

## 18. Checklist antes de arrancar localmente

Antes de correr o backend:

- [ ] Criar `.env`.
- [ ] Confirmar `DATABASE_URL`.
- [ ] Confirmar `AUTH_JWT_SECRET`.
- [ ] Confirmar `ALLOWED_ORIGINS`.
- [ ] Instalar dependências.
- [ ] Gerar Prisma Client.
- [ ] Aplicar migrations.
- [ ] Executar seed, se necessário.
- [ ] Arrancar servidor.

Comandos:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npx prisma db seed
npm run dev
```

---

## 19. Checklist antes de produção

Antes de publicar:

- [ ] `NODE_ENV=production`.
- [ ] `AUTH_JWT_SECRET` forte.
- [ ] `AUTH_COOKIE_SECURE=true`.
- [ ] `AUTH_COOKIE_SAME_SITE=none`, se frontend e backend estiverem em domínios diferentes.
- [ ] `ALLOWED_ORIGINS` sem `*`.
- [ ] `DATABASE_URL` de produção correta.
- [ ] Jobs confirmados.
- [ ] Backups da base de dados configurados.
- [ ] Seed com passwords seguras ou desativado após setup inicial.
- [ ] Logs de produção revistos.
- [ ] Frontend configurado para enviar cookies com credenciais.

---

## 20. Erros comuns

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

### Login funciona no backend mas frontend não mantém sessão

Causas prováveis:

- Frontend não envia credenciais.
- `ALLOWED_ORIGINS` não inclui o domínio do frontend.
- Cookie bloqueado por `SameSite`.
- `AUTH_COOKIE_SECURE` incorreto.
- Backend e frontend estão em domínios diferentes.

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

## 21. Segurança

### Não expor segredos

Nunca expor:

- `DATABASE_URL`
- `AUTH_JWT_SECRET`
- Passwords de seed reais
- Credenciais de produção

---

### Não usar passwords padrão em produção

As passwords de seed são aceitáveis apenas para desenvolvimento local.

Em produção:

- Usar passwords fortes.
- Alterar após primeiro login.
- Criar utilizadores manualmente se necessário.
- Remover ou controlar execução de seed.

---

### Não usar `ALLOWED_ORIGINS=*`

O backend usa cookies HTTP-only.

Com cookies e credenciais, `*` é perigoso e deve ser evitado.

---

## 22. Boas práticas

- Usar `.env.example` sempre atualizado.
- Documentar novas variáveis neste ficheiro.
- Validar variáveis obrigatórias em `src/config/env.js`.
- Nunca depender de valores mágicos espalhados pelo código.
- Centralizar configuração em `env.js`.
- Manter defaults seguros para desenvolvimento.
- Ser mais restritivo em produção.
- Alinhar tempo de cookie com tempo de JWT.
- Rever jobs antes de produção.

---

## 23. Quando adicionar uma nova variável

Sempre que adicionares uma nova variável:

1. Adiciona ao `.env.example`.
2. Adiciona ao `src/config/env.js`.
3. Define fallback, se fizer sentido.
4. Valida se for obrigatória.
5. Documenta neste ficheiro.
6. Verifica produção.
7. Atualiza README, se for uma variável essencial.

---

## 24. Convenções

### Prefixos recomendados

```txt
AUTH_      Configuração de autenticação
ENABLE_    Ativar/desativar funcionalidades
CRON_      Agendamentos
SEED_      Dados usados pelo seed
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

---

## 25. Resumo rápido

Variáveis críticas:

```txt
DATABASE_URL
AUTH_JWT_SECRET
AUTH_COOKIE_SECURE
AUTH_COOKIE_SAME_SITE
ALLOWED_ORIGINS
```

Para local:

```env
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
```

Para produção:

```env
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
```

Regra final:

```txt
Se mexeres em autenticação, cookies, CORS ou deploy, revê este ficheiro antes de publicar.
```
