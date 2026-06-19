# Production Checklist — Farmácia Santa Casa

Checklist final para validar o backend da aplicação **Farmácia Santa Casa** em:

* desenvolvimento;
* CI;
* staging público de portefólio;
* futura produção real.

**Última atualização:** 2026-06-19
**Runtime oficial:** Node.js 24 LTS
**Estado atual:** staging publicado, validado e funcional; produção real ainda não criada.

---

## 1. Objetivo

Este documento serve para:

* registar o estado atual do projeto;
* distinguir staging de produção;
* evitar configuração insegura;
* preparar um futuro deploy real;
* documentar validações obrigatórias;
* garantir que seeds, jobs, backups e secrets são tratados conscientemente;
* permitir criar produção sem reconstruir a aplicação.

---

## 2. Estado atual do projeto

### Staging de portefólio

Estado atual:

* [x] Backend publicado.
* [x] Frontend publicado.
* [x] PostgreSQL de staging criado.
* [x] Node.js 24 configurado.
* [x] Migrations aplicadas.
* [x] Seed demo protegido e executado.
* [x] Contas demo criadas.
* [x] Dataset demo reposto e verificado.
* [x] Login das três roles validado.
* [x] CORS validado.
* [x] Cookies cross-site validados.
* [x] Sessão após refresh validada.
* [x] Logout validado.
* [x] Permissões por role validadas.
* [x] Smoke test remoto read-only criado.
* [x] Smoke test remoto passou.
* [x] Fluxo funcional completo validado.
* [x] Jobs automáticos desativados.
* [x] Build Command restaurado sem seed.
* [x] Seed demo bloqueado durante operação normal.
* [x] Hardening de ambiente aplicado.
* [x] Frontend bloqueia build inseguro.
* [x] Backend bloqueia base local em produção.
* [x] CI alinhado com as variáveis reais.

### Produção real

Estado atual:

* [ ] Base de produção criada.
* [ ] Backend de produção criado.
* [ ] Frontend de produção criado.
* [ ] Domínios finais configurados.
* [ ] Backups automáticos configurados.
* [ ] Restore testado.
* [ ] Secrets reais gerados.
* [ ] Utilizadores reais criados.
* [ ] Estratégia de jobs aprovada.
* [ ] Monitorização configurada.
* [ ] Plano de rollback executado/testado.

A produção real não foi criada por decisão consciente.

O projeto fica preparado para a criar futuramente.

---

## 3. Separação obrigatória de ambientes

Os ambientes devem permanecer separados:

```txt
development ≠ test ≠ staging ≠ production
```

Confirmar:

* [ ] Base de development separada.
* [ ] Base de test separada.
* [x] Base de staging separada.
* [ ] Base de production separada.
* [ ] Secrets exclusivos por ambiente.
* [ ] Domínios exclusivos por ambiente.
* [ ] Utilizadores exclusivos por ambiente.
* [ ] Dados demo ausentes de produção.
* [ ] Contas demo ausentes de produção.

Nunca reutilizar:

* base de staging em produção;
* segredo JWT de staging em produção;
* passwords demo em produção;
* contas demo em produção;
* dados fictícios no ambiente real;
* backups de staging como backups de produção.

---

## 4. Runtime Node.js

Confirmar:

* [x] Node.js 24 LTS é o runtime oficial.
* [x] `backend/package.json` contém:

```json
"engines": {
  "node": ">=24.0.0 <25.0.0"
}
```

* [x] `backend/.node-version` contém:

```txt
24
```

* [x] GitHub Actions usa:

```yaml
node-version: "24.x"
```

* [x] Render staging usa:

```env
NODE_VERSION=24
```

* [x] O build de staging confirmou Node.js 24.
* [ ] A futura produção deve usar igualmente Node.js 24.

---

## 5. Variáveis de ambiente

### Desenvolvimento

Template:

```txt
backend/.env.example
```

Confirmar:

* [ ] `NODE_ENV=development`.
* [ ] `DATABASE_URL` local.
* [ ] `AUTH_COOKIE_SECURE=false`.
* [ ] `AUTH_COOKIE_SAME_SITE=lax`.
* [ ] `TRUST_PROXY=false`.
* [ ] Origins locais.
* [ ] Secrets apenas de desenvolvimento.

### Staging

Template:

```txt
backend/.env.staging.example
```

Confirmado:

* [x] `NODE_ENV=production`.
* [x] `NODE_VERSION=24`.
* [x] `DATABASE_URL` remota.
* [x] `TRUST_PROXY=1`.
* [x] `AUTH_COOKIE_SECURE=true`.
* [x] `AUTH_COOKIE_SAME_SITE=none`.
* [x] `ALLOWED_ORIGINS` exata.
* [x] `ENABLE_JOBS=false`.
* [x] `ALLOW_PRODUCTION_SEED=false`.
* [x] Seed demo bloqueado durante operação normal.
* [x] Scripts manuais bloqueados.
* [x] Secrets guardados no Render.

### Produção

Template:

```txt
backend/.env.production.example
```

Antes de criar produção:

* [ ] `NODE_ENV=production`.
* [ ] `DATABASE_URL` exclusiva de produção.
* [ ] `DATABASE_URL` não aponta para localhost.
* [ ] `AUTH_JWT_SECRET` exclusivo.
* [ ] `AUTH_COOKIE_SECURE=true`.
* [ ] `AUTH_COOKIE_SAME_SITE` definido conscientemente.
* [ ] `ALLOWED_ORIGINS` exata.
* [ ] `TRUST_PROXY` ajustado à infraestrutura.
* [ ] `ENABLE_JOBS` definido explicitamente.
* [ ] `ALLOW_PRODUCTION_SEED=false`.
* [ ] `ALLOW_TEST_SCRIPTS_IN_PRODUCTION=false`.
* [ ] Nenhuma variável `DEMO_*`.
* [ ] Nenhuma variável `STAGING_*`.

---

## 6. Base de dados e Prisma

### Staging

Confirmado:

* [x] PostgreSQL de staging criado.
* [x] `DATABASE_URL` remota.
* [x] Prisma Client gerado.
* [x] 12 migrations encontradas.
* [x] Nenhuma migration pendente.
* [x] Build Command usa:

```bash
npm ci && npm run prisma:migrate:deploy
```

* [x] `prisma migrate dev` não é usado em staging.

### Produção futura

Confirmar:

* [ ] PostgreSQL exclusivo.
* [ ] Plano adequado.
* [ ] Região escolhida.
* [ ] Ligação segura.
* [ ] Backups automáticos.
* [ ] Política de retenção.
* [ ] Restore testado.
* [ ] Credenciais guardadas em secrets.
* [ ] Migrations revistas.
* [ ] `prisma migrate deploy` usado.
* [ ] Nunca usar `prisma migrate dev`.
* [ ] Nunca apontar testes para produção.

---

## 7. Proteções de ambiente

O backend deve bloquear:

* [x] `DATABASE_URL` ausente.
* [x] `DATABASE_URL` local em produção.
* [x] `AUTH_JWT_SECRET` ausente.
* [x] Secret curto em produção.
* [x] Cookie inseguro em produção.
* [x] `SameSite=None` sem `Secure`.
* [x] `ALLOWED_ORIGINS` ausente.
* [x] Origins vazias.
* [x] Wildcard em produção.
* [x] Localhost nas origins.
* [x] `NODE_ENV` inválido.

Mensagens esperadas:

```txt
[env] DATABASE_URL em falta.
[env] DATABASE_URL não pode apontar para localhost/127.0.0.1 em produção.
[env] AUTH_JWT_SECRET em falta.
[env] AUTH_JWT_SECRET deve ter pelo menos 32 caracteres em produção.
[env] AUTH_COOKIE_SECURE deve ser true em produção.
[env] AUTH_COOKIE_SAME_SITE=none exige AUTH_COOKIE_SECURE=true.
[env] ALLOWED_ORIGINS é obrigatório em produção.
[env] ALLOWED_ORIGINS não pode estar vazio em produção.
[env] ALLOWED_ORIGINS não pode conter '*' em produção.
[env] ALLOWED_ORIGINS não pode conter localhost/127.0.0.1 em produção.
```

---

## 8. CORS e origins

### Staging

Confirmado:

* [x] Origin exata:

```env
ALLOWED_ORIGINS="https://farmacia-santacasa-frontend-staging.onrender.com"
```

* [x] Sem `*`.
* [x] Sem localhost.
* [x] Sem slash final.
* [x] Sem caminhos.
* [x] `Access-Control-Allow-Origin` validado.
* [x] `Access-Control-Allow-Credentials=true`.
* [x] `X-Request-Id` exposto.
* [x] Preflight responde `204`.
* [x] Origem não autorizada é bloqueada.

### Produção futura

Confirmar:

* [ ] Apenas domínios finais.
* [ ] Sem wildcard.
* [ ] Sem localhost.
* [ ] Sem URLs de staging.
* [ ] Sem `/login` ou outros caminhos.
* [ ] Sem slash final.
* [ ] Login real validado.
* [ ] Logout validado.
* [ ] Sessão após refresh validada.

---

## 9. Cookies e autenticação

Confirmar:

* [x] Cookie HTTP-only.
* [x] Cookie `Secure` em staging.
* [x] Cookie `SameSite=None` em staging cross-site.
* [x] Cookie com `Path=/`.
* [x] Login `ADMIN`.
* [x] Login `SANTACASA`.
* [x] Login `FARMACIA`.
* [x] `/api/auth/me`.
* [x] Sessão após `F5`.
* [x] Logout limpa cookie.
* [x] Roles corretas.
* [x] Bloqueios cruzados.
* [x] Origem inválida bloqueada.
* [x] Sessão inexistente responde `401`.

Para produção futura:

* [ ] Secret JWT novo.
* [ ] Cookie name confirmado.
* [ ] Tempo do JWT confirmado.
* [ ] Tempo do cookie alinhado.
* [ ] `SameSite` revisto conforme domínios finais.
* [ ] Login dos utilizadores reais validado.
* [ ] Utilizadores inativos bloqueados.

---

## 10. Rate limit

Confirmar:

* [x] Rate limit de login ativo.
* [x] Usa IP + email.
* [x] `TRUST_PROXY` considerado.
* [x] CI inclui configuração explícita.
* [ ] Em produção futura, validar resposta `429`.
* [ ] Em múltiplas instâncias, considerar Redis.
* [ ] Rever limites conforme utilização real.

Configuração atual:

```env
AUTH_LOGIN_RATE_LIMIT_WINDOW_MS=900000
AUTH_LOGIN_RATE_LIMIT_MAX=10
```

Limitação consciente:

```txt
O rate limit atual usa memória da instância.
```

---

## 11. Jobs automáticos

Jobs existentes:

```txt
receita-expiry
higiene
purge-history
```

### Staging

Confirmado:

* [x] `ENABLE_JOBS=false`.
* [x] `ENABLE_RECEITAS_EXPIRY=false`.
* [x] `ENABLE_HIGIENE=false`.
* [x] `ENABLE_PURGE_HISTORY=false`.
* [x] Logs confirmam jobs desativados.
* [x] Dataset demo não é alterado automaticamente.

### Produção futura

Antes de ativar:

* [ ] Definir se existe uma ou várias instâncias.
* [ ] Evitar execução duplicada.
* [ ] Decidir worker único ou scheduler externo.
* [ ] Configurar monitorização.
* [ ] Configurar logs persistentes.
* [ ] Confirmar timezone.
* [ ] Confirmar crons.
* [ ] Confirmar backups.
* [ ] Confirmar preview.
* [ ] Confirmar responsáveis operacionais.

Configuração inicial recomendada:

```env
ENABLE_JOBS=false
ENABLE_RECEITAS_EXPIRY=false
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
```

---

## 12. Job de higiene

Antes de executar:

* [ ] Confirmar `HIGIENE_OFFSET_MONTHS`.
* [ ] Confirmar preview.
* [ ] Confirmar ambiente.
* [ ] Confirmar base.
* [ ] Confirmar política de retenção.
* [ ] Confirmar base legal.
* [ ] Confirmar backup.
* [ ] Testar restore.
* [ ] Manter anonimização desativada por defeito.

Configuração segura:

```env
HIGIENE_OFFSET_MONTHS=12
HIGIENE_ANONYMIZE=false
ALLOW_HIGIENE_ANONYMIZE=false
```

A anonimização exige ambas:

```env
HIGIENE_ANONYMIZE=true
ALLOW_HIGIENE_ANONYMIZE=true
```

---

## 13. Purge de histórico

Esta operação é destrutiva.

Antes de executar:

* [ ] Backup automático disponível.
* [ ] Backup manual recente.
* [ ] Restore testado.
* [ ] `PURGE_OFFSET_MONTHS` aprovado.
* [ ] Preview executado.
* [ ] Quantidades revistas.
* [ ] Ambiente confirmado.
* [ ] Base confirmada.
* [ ] `backupConfirmed=true`.
* [ ] Responsável autorizado.

Payload:

```json
{
  "confirm": "RUN_PURGE_HISTORY",
  "backupConfirmed": true,
  "offsetMonths": 6
}
```

Não ativar automaticamente numa primeira produção sem estes pontos.

---

## 14. Manutenção manual

Confirmar:

* [x] Apenas `ADMIN` acede.
* [x] Endpoints de preview existem.
* [x] Endpoints run exigem confirmação forte.
* [x] Purge exige `backupConfirmed`.
* [x] UI envia confirmação adequada.
* [x] Jobs podem ser executados manualmente.

Payloads:

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

---

## 15. Seed inicial de produção

Por defeito:

```env
ALLOW_PRODUCTION_SEED=false
```

Antes do setup:

* [ ] Criar base de produção.
* [ ] Aplicar migrations.
* [ ] Definir admin real.
* [ ] Usar email real.
* [ ] Usar password forte.
* [ ] Não usar passwords padrão.
* [ ] Ativar seed temporariamente.
* [ ] Executar seed uma única vez.
* [ ] Confirmar admin.
* [ ] Voltar a `false`.
* [ ] Remover variáveis temporárias.
* [ ] Criar Santa Casa e Farmácia pela UI.

Em produção, o seed:

* cria apenas `ADMIN`;
* não cria `SANTACASA`;
* não cria `FARMACIA`;
* não redefine password de admin existente;
* não altera role;
* não altera nome;
* não altera estado.

---

## 16. Seed demo

O seed demo é exclusivo de staging/portefólio.

Comando:

```bash
npm run prisma:seed:demo
```

Proteção:

```env
ALLOW_DEMO_SEED=true
DEMO_SEED_CONFIRMATION=PORTFOLIO_DEMO
```

Confirmado:

* [x] Seed transacional.
* [x] Guardas obrigatórias.
* [x] Passwords sem fallback.
* [x] Mínimo de 12 caracteres.
* [x] Emails demo separados.
* [x] Contas iniciais protegidas.
* [x] Idempotência validada.
* [x] Dataset reposto.
* [x] Passwords sincronizadas.
* [x] Build Command restaurado.
* [x] Guardas removidas após reposição.
* [x] Seed não corre automaticamente.

Produção futura:

* [ ] Nenhuma variável `DEMO_*`.
* [ ] Nenhum seed demo.
* [ ] Nenhuma conta demo.
* [ ] Nenhum dado fictício.

---

## 17. Smoke test remoto

Script:

```txt
backend/scripts/smoke/staging-auth-smoke.js
```

Comando:

```bash
npm run test:staging:auth
```

Confirmado:

* [x] Read-only.
* [x] Proteção por confirmação.
* [x] Health live.
* [x] Health ready.
* [x] CORS.
* [x] Preflight.
* [x] Security headers.
* [x] Request ID.
* [x] Sessão inexistente.
* [x] Origem inválida.
* [x] Login das três roles.
* [x] `/auth/me`.
* [x] Permissões por role.
* [x] Bloqueios cruzados.
* [x] Logout.
* [x] Cookies seguros.
* [x] Não cria dados operacionais.

Resultado validado:

```txt
STAGING AUTH SMOKE PASSOU
```

---

## 18. Health checks

Endpoints:

```txt
GET /api/health/live
GET /api/health/ready
GET /api/health
```

Confirmado:

* [x] `/live` responde `200`.
* [x] `/ready` responde `200`.
* [x] `/health` protegido por `ADMIN`.
* [x] Request ID presente.
* [x] Plataforma iniciou corretamente.

Produção futura:

* [ ] Liveness configurado.
* [ ] Readiness configurado, se suportado.
* [ ] Alertas de indisponibilidade.
* [ ] Monitorização externa.
* [ ] Teste de base indisponível.
* [ ] `/ready` devolve `503` sem base.

---

## 19. Segurança HTTP

Confirmado:

* [x] `helmet` ativo.
* [x] `x-powered-by` removido.
* [x] Security headers presentes.
* [x] `X-Request-Id` presente.
* [x] `X-Request-Id` exposto em CORS.
* [x] Origin guard ativo.
* [x] Cookies HTTP-only.
* [x] Cookies secure.
* [x] Rate limit ativo.
* [x] Erros não expõem stack em produção.
* [x] Logs incluem request ID.

Produção futura:

* [ ] Rever CSP conforme domínios finais.
* [ ] Rever headers no domínio final.
* [ ] Configurar logs persistentes.
* [ ] Configurar retenção de logs.
* [ ] Configurar alertas.

---

## 20. Graceful shutdown

Confirmado:

* [x] `SIGINT` tratado.
* [x] `SIGTERM` tratado.
* [x] HTTP fecha antes do Prisma.
* [x] Jobs são parados.
* [x] Prisma é desligado.
* [x] Timeout de shutdown existe.
* [x] `unhandledRejection` tratado.
* [x] `uncaughtException` tratado.
* [x] Logs de shutdown existem.

Produção futura:

* [ ] Validar shutdown real na plataforma final.
* [ ] Confirmar tempo de grace period.
* [ ] Confirmar que pedidos ativos terminam adequadamente.
* [ ] Confirmar que jobs não ficam duplicados.

---

## 21. Frontend

### Desenvolvimento

Confirmar:

* [x] `frontend/.env.example` aponta para localhost.
* [x] `npm run dev` permite API local.
* [x] Fallback local só existe em desenvolvimento.

### Build

Confirmado:

* [x] `VITE_API_BASE_URL` é obrigatória.
* [x] HTTPS obrigatório.
* [x] Localhost bloqueado.
* [x] Query string bloqueada.
* [x] Fragmento bloqueado.
* [x] URL tem de terminar exatamente em `/api`.
* [x] Build com staging passou.
* [x] Build local inseguro falhou de propósito.
* [x] Lint passou.

### Produção futura

* [ ] Configurar `VITE_API_BASE_URL` real.
* [ ] Executar rebuild.
* [ ] Confirmar API embebida no bundle.
* [ ] Confirmar login.
* [ ] Confirmar refresh.
* [ ] Confirmar logout.
* [ ] Confirmar rotas SPA.
* [ ] Configurar rewrite para `/index.html`.

---

## 22. CI

Confirmado:

* [x] Workflow existe.
* [x] PostgreSQL service.
* [x] Node.js 24.
* [x] `npm ci`.
* [x] Prisma Client.
* [x] Migrations.
* [x] Unit tests.
* [x] Integration tests.
* [x] Seed para E2E.
* [x] E2E tests.
* [x] Seed para coverage.
* [x] Coverage.
* [x] Audit.
* [x] Jobs desativados.
* [x] Variáveis antigas removidas.
* [x] Variáveis atuais alinhadas.

Workflow:

```txt
.github/workflows/backend-ci.yml
```

---

## 23. Testes

Antes de merge relevante:

```bash
npm run prisma:generate
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm run test:all
npm run test:coverage
npm run audit
npm run validate
```

Confirmado nesta fase:

* [x] Unit passam.
* [x] Integration passam.
* [x] E2E passam.
* [x] `test:all` passa.
* [x] Coverage passa.
* [x] Audit passa.
* [x] CI passa.

Limitação consciente:

```txt
Coverage configurado sem threshold obrigatório.
```

---

## 24. Build e deploy no Render

### Backend de staging

Configuração validada:

```txt
Root Directory: backend
Build Command: npm ci && npm run prisma:migrate:deploy
Start Command: npm start
Auto-Deploy: On Commit
Included Paths: backend/**
```

Confirmado:

* [x] Node 24.
* [x] `npm ci`.
* [x] Prisma generate.
* [x] Migrations.
* [x] Zero vulnerabilidades no build validado.
* [x] Serviço live.
* [x] Jobs desativados.
* [x] Seed demo não executa automaticamente.

### Frontend de staging

Confirmado:

* [x] `VITE_API_BASE_URL` configurada.
* [x] Build passou.
* [x] Rewrite SPA configurado.
* [x] `/login` funciona.
* [x] Rotas internas funcionam.
* [x] Refresh funciona.

---

## 25. Validação funcional de staging

Confirmado:

### Santa Casa

* [x] Home.
* [x] Dashboard.
* [x] Utentes.
* [x] Operação.
* [x] Medicação habitual.
* [x] Receitas.
* [x] Medicamentos não sujeitos a receita médica.
* [x] Vendas Suspensas.
* [x] Pedidos.
* [x] Histórico.
* [x] Regularizações.

### Farmácia

* [x] Home.
* [x] Dashboard.
* [x] Pedidos.
* [x] Validação.
* [x] Rejeição.
* [x] Histórico.
* [x] Regularizações.
* [x] Alertas.

### Sistema

* [x] Login ADMIN.
* [x] Utilizadores.
* [x] Health.
* [x] Manutenção.
* [x] Permissões.

### Fluxo ponta a ponta

* [x] Criação operacional.
* [x] Pedido.
* [x] Tratamento pela Farmácia.
* [x] Regularização.
* [x] Histórico.
* [x] Persistência após refresh.
* [x] Dataset demo reposto após validação.

---

## 26. Backups

### Staging

Estado atual:

* [ ] Backups automáticos confirmados.
* [ ] Restore testado.

Como staging é apenas portefólio/demo, estes pontos não bloquearam esta fase.

### Produção futura

Obrigatório:

* [ ] Backup automático.
* [ ] Retenção definida.
* [ ] Backup antes de purge.
* [ ] Restore documentado.
* [ ] Restore testado.
* [ ] Responsáveis definidos.
* [ ] RTO definido.
* [ ] RPO definido.

Sem restore testado, não ativar `purge-history`.

---

## 27. Logs e monitorização

### Staging

Confirmado:

* [x] Logs de build.
* [x] Logs de arranque.
* [x] Request ID.
* [x] Logs de erros.
* [x] Estado dos jobs.

### Produção futura

Necessário:

* [ ] Logs persistentes.
* [ ] Retenção de logs.
* [ ] Alertas de erro.
* [ ] Alertas de indisponibilidade.
* [ ] Métricas de latência.
* [ ] Métricas de base.
* [ ] Monitorização dos jobs.
* [ ] Correlação por request ID.
* [ ] Proteção de dados nos logs.

---

## 28. Rollback

Antes da produção real:

* [ ] Identificar versão estável anterior.
* [ ] Manter artefacto/commit anterior.
* [ ] Documentar rollback do backend.
* [ ] Documentar rollback do frontend.
* [ ] Rever compatibilidade das migrations.
* [ ] Evitar migrations destrutivas sem plano.
* [ ] Criar backup antes de mudança crítica.
* [ ] Testar rollback em staging.
* [ ] Definir responsável.

Rollback de código não substitui rollback de dados.

---

## 29. Procedimento futuro para criar produção

### Infraestrutura

1. Criar PostgreSQL de produção.
2. Configurar backups.
3. Testar restore.
4. Criar serviço backend.
5. Criar frontend.
6. Configurar domínios.
7. Configurar HTTPS.

### Backend

1. Usar `backend/.env.production.example`.
2. Gerar `AUTH_JWT_SECRET`.
3. Definir `DATABASE_URL`.
4. Definir `ALLOWED_ORIGINS`.
5. Confirmar cookies.
6. Definir jobs como `false`.
7. Aplicar migrations.
8. Executar seed inicial controlado.
9. Voltar a bloquear seed.
10. Criar utilizadores reais.

### Frontend

1. Definir `VITE_API_BASE_URL`.
2. Executar build.
3. Configurar rewrite SPA.
4. Confirmar login.
5. Confirmar refresh.
6. Confirmar logout.

### Validação

1. Health live.
2. Health ready.
3. Smoke test.
4. Login ADMIN.
5. Login Santa Casa.
6. Login Farmácia.
7. Fluxo operacional.
8. Logs.
9. Backups.
10. Rollback.

---

## 30. Critérios de conclusão do projeto para portefólio

O projeto pode ser considerado concluído quando:

* [x] Backend funcional.
* [x] Frontend funcional.
* [x] Base de staging.
* [x] Demo pública.
* [x] Contas demo.
* [x] Dados fictícios.
* [x] Testes automatizados.
* [x] CI.
* [x] Coverage.
* [x] Audit.
* [x] Segurança HTTP.
* [x] Cookies seguros.
* [x] CORS.
* [x] Roles.
* [x] Smoke test.
* [x] Fluxo completo validado.
* [x] Templates separados.
* [x] Hardening de ambiente.
* [x] Produção futura documentada.

Não é necessário para o portefólio:

* [ ] Criar produção real.
* [ ] Comprar domínio.
* [ ] Contratar backups pagos.
* [ ] Configurar Redis.
* [ ] Configurar observabilidade paga.
* [ ] Ativar jobs automáticos.

---

## 31. Estado final recomendado

Para portefólio:

```txt
Aplicação full-stack funcional, testada, publicada em staging,
com ambiente demo reproduzível e preparada tecnicamente para produção.
```

Para uma futura utilização real:

```txt
Criar infraestrutura exclusiva, configurar backups, secrets,
domínios, utilizadores reais, jobs, monitorização e rollback.
```

---

## 32. Regra final

Antes de qualquer deploy real:

```txt
Confirmar ambiente, base de dados, secrets, origins, cookies,
migrations, backups, jobs, seed, logs, smoke test e rollback.
```

Nunca assumir que staging e produção são equivalentes apenas porque ambos usam:

```env
NODE_ENV=production
```

O staging é uma demonstração isolada.

A produção deverá ser criada com:

* infraestrutura própria;
* secrets próprios;
* base própria;
* utilizadores reais;
* dados reais;
* política operacional aprovada.
