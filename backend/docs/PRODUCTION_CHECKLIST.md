# Production Checklist — Farmácia Santa Casa API

Checklist para preparar o backend da aplicação **Farmácia Santa Casa** para staging/produção.

> Produção real só deve avançar depois de validar infraestrutura, ambiente, HTTPS, cookies, CORS, base de dados, backups, jobs e testes.

---

## 1. Estado funcional

Antes de preparar produção, confirmar:

- [ ] Backend funcionalmente estável.
- [ ] Frontend compatível com as rotas atuais.
- [ ] Testes unitários passam.
- [ ] Testes de integração passam.
- [ ] Testes E2E passam.
- [ ] `npm run test:all` passa.
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
- [ ] `.env` real não está versionado no Git.
- [ ] `.env.production.example` não contém secrets reais.

---

## 3. CORS e origins

Confirmar:

- [ ] `ALLOWED_ORIGINS` está definido em produção.
- [ ] `ALLOWED_ORIGINS` não contém `*`.
- [ ] `ALLOWED_ORIGINS` não contém `localhost`.
- [ ] `ALLOWED_ORIGINS` não contém `127.0.0.1`.
- [ ] `ALLOWED_ORIGINS` inclui apenas domínios reais do frontend.
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
- [ ] `/auth/me` funciona após refresh.
- [ ] Roles `ADMIN`, `SANTACASA` e `FARMACIA` estão corretas.

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