# Production Checklist — Farmácia Santa Casa API

Checklist para preparar o backend da aplicação **Farmácia Santa Casa** para staging/produção.

> Produção real só deve avançar depois de validar infraestrutura, ambiente, HTTPS, cookies, CORS, security headers, request ID, base de dados, backups, jobs, seed e testes.

**Última atualização:** 2026-06-17

---

## 1. Estado funcional

Antes de preparar produção, confirmar:

- [ ] Backend funcionalmente estável.
- [ ] Frontend compatível com as rotas atuais.
- [ ] Frontend alinhado com manutenção: `confirm` e `backupConfirmed`.
- [ ] Frontend alinhado com utilizadores: password mínima 10, email válido e role própria bloqueada.
- [ ] Testes unitários passam.
- [ ] Testes de integração passam.
- [ ] Testes E2E passam.
- [ ] `npm run test:all` passa.
- [ ] `npm run test:coverage` passa.
- [ ] `npm run validate` passa.
- [ ] Documentação principal atualizada.

---

## 2. Ambiente

Confirmar variáveis de ambiente:

- [ ] `NODE_ENV=production`.
- [ ] `DATABASE_URL` aponta para PostgreSQL real de produção/staging.
- [ ] `DATABASE_URL` não aponta para localhost.
- [ ] `PORT` definido conforme a plataforma.
- [ ] `TZ=Europe/Lisbon`.
- [ ] `JSON_LIMIT` adequado.
- [ ] `TRUST_PROXY` definido conforme a infraestrutura.
- [ ] `.env` real não está versionado no Git.
- [ ] `.env.production.example` não contém secrets reais.

Regras para `TRUST_PROXY`:

```env
TRUST_PROXY=false
```

usar quando a API está exposta diretamente.

```env
TRUST_PROXY=1
```

usar quando a API está atrás de um proxy/load balancer confiável.

Evitar:

```env
TRUST_PROXY=true
```

salvo se a infraestrutura controlar corretamente os headers `X-Forwarded-*`.

---

## 3. CORS e origins

Confirmar:

- [ ] `ALLOWED_ORIGINS` está definido em produção.
- [ ] `ALLOWED_ORIGINS` não contém `*`.
- [ ] `ALLOWED_ORIGINS` não contém `localhost`.
- [ ] `ALLOWED_ORIGINS` não contém `127.0.0.1`.
- [ ] `ALLOWED_ORIGINS` inclui apenas domínios reais do frontend.
- [ ] `ALLOWED_ORIGINS` não tem slash final.
- [ ] Frontend consegue fazer login/logout/me com cookies.

---

## 4. Cookies e autenticação

Confirmar:

- [ ] `AUTH_JWT_SECRET` é longo, aleatório e secreto.
- [ ] `AUTH_JWT_SECRET` tem pelo menos 32 caracteres.
- [ ] `AUTH_COOKIE_SECURE=true` em produção.
- [ ] `AUTH_COOKIE_SAME_SITE=none` se frontend/backend estiverem em domínios diferentes.
- [ ] `AUTH_COOKIE_SAME_SITE=lax` se frontend/backend estiverem no mesmo site.
- [ ] Login funciona.
- [ ] Logout limpa o cookie.
- [ ] `/api/auth/me` funciona após refresh.
- [ ] Roles `ADMIN`, `SANTACASA` e `FARMACIA` estão corretas.
- [ ] Utilizadores inativos não conseguem fazer login.
- [ ] Rate limit de login responde `429` após tentativas falhadas excessivas.

---

## 5. Base de dados e Prisma

Antes do deploy:

- [ ] PostgreSQL de produção/staging criado.
- [ ] Backups configurados.
- [ ] Acesso à base testado.
- [ ] `npx prisma generate` executado.
- [ ] Migrations revistas.
- [ ] Não usar `prisma migrate dev` em produção.
- [ ] Usar `prisma migrate deploy` em produção/staging.

Comando recomendado em produção/staging:

```bash
npm run prisma:migrate:deploy
```

---

## 6. Seed de produção

Confirmar:

- [ ] `ALLOW_PRODUCTION_SEED=false` por defeito.
- [ ] O seed de produção só será executado em setup inicial controlado.
- [ ] `SEED_ADMIN_EMAIL` é email real do admin inicial.
- [ ] `SEED_ADMIN_PASSWORD` é forte e não é valor default.
- [ ] Password do admin inicial tem pelo menos 10 caracteres.
- [ ] Santa Casa e Farmácia serão criados depois em `Sistema > Utilizadores`.
- [ ] Depois do setup, `ALLOW_PRODUCTION_SEED` volta para `false`.

Notas:

```txt
Em produção, o seed só cria ADMIN.
Não cria SANTACASA nem FARMACIA.
Não redefine password de ADMIN existente.
```

---

## 7. Jobs automáticos

Confirmar:

- [ ] Decidir se a produção terá uma ou várias instâncias.
- [ ] `ENABLE_JOBS` definido conscientemente.
- [ ] Em múltiplas instâncias, jobs automáticos não correm em todas as instâncias.
- [ ] `ENABLE_RECEITAS_EXPIRY` revisto.
- [ ] `ENABLE_HIGIENE` revisto.
- [ ] `ENABLE_PURGE_HISTORY` revisto.
- [ ] `CRON_DAILY_03H` confirmado.
- [ ] `CRON_MONTHLY_03H` confirmado.
- [ ] Timezone confirmada com `TZ=Europe/Lisbon`.

Recomendação inicial para instância web:

```env
ENABLE_JOBS=false
```

Para execução automática, preferir instância worker única ou scheduler externo.

---

## 8. Manutenção manual

Confirmar:

- [ ] Apenas `ADMIN` acede a `/api/manutencao`.
- [ ] Endpoints `preview` funcionam.
- [ ] Endpoints `run` exigem `confirm`.
- [ ] `purge-history` exige `backupConfirmed=true`.
- [ ] UI de manutenção envia `confirm` correto.
- [ ] UI de manutenção envia `backupConfirmed=true` no purge.
- [ ] Operadores sabem que `purge-history` é destrutivo.

Payloads obrigatórios:

```json
{ "confirm": "RUN_RECEITA_EXPIRY" }
```

```json
{ "confirm": "RUN_HIGIENE", "offsetMonths": 12, "anonymize": false }
```

```json
{ "confirm": "RUN_PURGE_HISTORY", "backupConfirmed": true, "offsetMonths": 6 }
```

---

## 9. Health checks

Confirmar:

- [ ] `GET /api/health/live` responde `200` sem sessão.
- [ ] `GET /api/health/ready` responde `200` quando a base está acessível.
- [ ] `GET /api/health/ready` responde `503` se a base não estiver disponível.
- [ ] `GET /api/health` continua protegido por `ADMIN`.
- [ ] Plataforma de deploy usa `/api/health/live` para liveness.
- [ ] Plataforma de deploy usa `/api/health/ready` para readiness, se aplicável.

---

## 10. Segurança HTTP

Confirmar:

- [ ] `x-powered-by` removido.
- [ ] `helmet` ativo.
- [ ] Security headers presentes nas respostas.
- [ ] `X-Request-Id` presente em respostas `200`, `4xx` e `5xx`.
- [ ] `X-Request-Id` exposto em CORS.
- [ ] Origin guard ativo para métodos mutáveis.
- [ ] CORS restrito a origins reais.
- [ ] Cookies HTTP-only.
- [ ] Cookies secure em produção.
- [ ] Rate limit de login ativo.
- [ ] `TRUST_PROXY` testado com a infraestrutura real.
- [ ] Erros 500 não expõem stack trace em produção.
- [ ] Logs de erro incluem `requestId`.

Melhorias futuras possíveis:

- [ ] Logs estruturados persistentes.
- [ ] Rate limit com Redis para múltiplas instâncias.

---

## 11. Testes antes do deploy

Executar:

```bash
npm run prisma:generate
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm run test:coverage
npm run test:all
npm run validate
```

Testes específicos críticos:

```bash
npm run test:e2e -- --run tests/e2e/health.e2e.test.js
npm run test:e2e -- --run tests/e2e/loginRateLimit.e2e.test.js
npm run test:e2e -- --run tests/e2e/securityHeaders.e2e.test.js
npm run test:e2e -- --run tests/e2e/requestId.e2e.test.js
npm run test:e2e -- --run tests/e2e/manutencao.e2e.test.js
npm run test:e2e -- --run tests/e2e/adminUsers.e2e.test.js
```

---

## 12. Deploy

Antes de arrancar a app:

- [ ] Variáveis reais configuradas na plataforma.
- [ ] `npm install` ou build da imagem concluído.
- [ ] `npm run prisma:generate` executado.
- [ ] `npm run prisma:migrate:deploy` executado.
- [ ] Seed só executado se for setup inicial controlado.
- [ ] API arranca com `npm start`.
- [ ] Logs iniciais revistos.
- [ ] Jobs não duplicados.

---

## 12.1 Server runtime e shutdown

Confirmar:

- [ ] API arranca sem expor secrets nos logs.
- [ ] Jobs são registados apenas depois de o servidor estar a escutar.
- [ ] `SIGINT` encerra de forma controlada.
- [ ] `SIGTERM` encerra de forma controlada.
- [ ] Shutdown tenta parar jobs registados.
- [ ] Shutdown fecha servidor HTTP antes de desligar Prisma.
- [ ] `unhandledRejection` e `uncaughtException` são tratados com encerramento controlado.

---

## 13. Smoke test pós-deploy

Validar:

```txt
GET /api/health/live
GET /api/health/ready
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
```

Depois, com `ADMIN`:

```txt
GET /api/health
GET /api/manutencao/jobs
GET /api/admin/users
```

Depois validar fluxos reais:

- [ ] Login Santa Casa.
- [ ] Login Farmácia.
- [ ] Login Admin.
- [ ] Criar utilizador de teste.
- [ ] Desativar utilizador de teste.
- [ ] Confirmar bloqueio de role/contexto.
- [ ] Confirmar frontend mantém sessão após refresh.

---

## 14. Backups e recuperação

Confirmar:

- [ ] Backup automático da base configurado.
- [ ] Processo de restore documentado.
- [ ] Restore testado pelo menos em staging.
- [ ] Backup confirmado antes de qualquer `purge-history`.
- [ ] Política de retenção de backups definida.

---

## 15. Estado recomendado para primeiro deploy

Configuração conservadora inicial:

```env
NODE_ENV=production
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
TRUST_PROXY=1
ENABLE_JOBS=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=true
ALLOW_PRODUCTION_SEED=false
ALLOW_TEST_SCRIPTS_IN_PRODUCTION=false
```

Depois de validar infraestrutura, decidir se jobs ficam:

```txt
manual via Sistema > Manutenção
```

ou:

```txt
automáticos numa única instância worker/scheduler externo
```
