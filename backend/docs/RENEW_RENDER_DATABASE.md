# RENEW_RENDER_DATABASE.md

Guia passo a passo para renovar a base de dados PostgreSQL gratuita do staging demo no **Render**.

A base PostgreSQL gratuita do Render expira ao fim de **30 dias**. Depois disso, o backend deixa de conseguir ligar-se à base e a demo pública deixa de funcionar.

Como o staging usa exclusivamente dados fictícios, não é necessário recuperar a base antiga: cria-se uma base nova e repõe-se o ambiente com o seed demo.

**Última atualização:** 2026-10-08
**Última renovação:** 2026-10-08 (`farmacia-santacasa-db-staging-v3`)
**Próxima renovação recomendada:** até 2026-11-03

---

## 1. Contexto

| Item | Valor |
| --- | --- |
| Backend | `farmacia-santacasa-backend-staging` |
| Frontend | `farmacia-santacasa-frontend-staging` |
| Região | Frankfurt (EU Central) |
| Plano | Free |
| Reposição de dados | `npm run prisma:seed:demo` via Build Command temporário |

O frontend não precisa de ser alterado. Apenas o `DATABASE_URL` do backend muda.

O workflow `.github/workflows/backend-ci.yml` **não** está relacionado com este processo: usa uma base temporária dentro do GitHub Actions apenas para testes.

---

## 2. Quando renovar

* Colocar um lembrete para cerca de **25 dias** após cada renovação.
* O Render envia avisos por email antes da expiração.
* Se a demo deixar de funcionar e os logs mostrarem erros de ligação à base, a base expirou.

---

## 3. Parte A — Criar a nova base de dados

O plano gratuito permite apenas **uma** base PostgreSQL gratuita por workspace.

1. Abrir https://dashboard.render.com.
2. Se a base antiga ainda aparecer na lista, abri-la → **Settings** → **Delete Database**.
3. Clicar em **+ New** → **Postgres**.
4. Preencher, incrementando a versão (`v4`, `v5`, …):

| Campo | Valor |
| --- | --- |
| Name | `farmacia-santacasa-db-staging-vN` |
| Database | `farmacia_santacasa_staging` |
| User | `farmacia_santacasa_staging_vN_user` |
| Region | **Frankfurt (EU Central)** — tem de ser a mesma do backend |
| PostgreSQL Version | a predefinida |
| Plan | **Free** |

5. Clicar em **Create Database**.
6. Esperar até o estado passar a **Available**.
7. Em **Connect** / **Connections**, copiar o **Internal Database URL**.

Não usar o External Database URL no backend.

---

## 4. Parte B — Configurar o backend

Serviço `farmacia-santacasa-backend-staging` → **Environment** → **Edit**:

1. Substituir `DATABASE_URL` pelo Internal Database URL novo.
2. Ativar temporariamente o seed demo:

```env
ALLOW_DEMO_SEED=true
DEMO_SEED_CONFIRMATION=PORTFOLIO_DEMO
```

3. Confirmar que existem `DEMO_ADMIN_PASSWORD`, `DEMO_SANTACASA_PASSWORD` e `DEMO_FARMACIA_PASSWORD`, com pelo menos 12 caracteres.
4. Guardar com **Save only** (sem deploy).

---

## 5. Parte C — Criar tabelas e dados demo

1. **Settings** → **Build & Deploy** → **Build Command**.
2. Confirmar que o valor atual é:

```bash
npm ci && npm run prisma:migrate:deploy
```

3. Alterar temporariamente para:

```bash
npm ci && npm run prisma:migrate:deploy && npm run prisma:seed:demo
```

4. Guardar. O Render pode iniciar um deploy automaticamente; não há problema se o seed correr mais do que uma vez.
5. Se não iniciar sozinho: **Manual Deploy** → **Deploy latest commit**.
6. Abrir o deploy e procurar no log de build (acima de `==> Deploying...`):

```txt
[seed:demo] Ambiente demo reposto e verificado com sucesso.
[seed:demo] As passwords foram sincronizadas com as variáveis de ambiente.
```

Se o deploy falhar, não alterar mais nada e analisar as últimas linhas do log.

---

## 6. Parte D — Desligar o seed (obrigatório)

Se este passo for esquecido, **cada deploy volta a repor os dados demo**.

1. **Settings** → **Build Command** → repor:

```bash
npm ci && npm run prisma:migrate:deploy
```

2. **Environment** → **Edit**:

```env
ALLOW_DEMO_SEED=false
DEMO_SEED_CONFIRMATION=
```

3. Guardar com **Save, rebuild, and deploy**.
4. Confirmar no log que `prisma:seed:demo` já não aparece e que o serviço fica **Live**.

---

## 7. Parte E — Validar

1. Abrir https://farmacia-santacasa-frontend-staging.onrender.com.
2. O primeiro carregamento pode demorar até ~1 minuto (instância gratuita adormecida).
3. Fazer login com as contas demo `SANTACASA` e `FARMACIA` (credenciais públicas no [README principal](../../README.md#demonstração-pública)).
4. Confirmar que aparecem dados fictícios.
5. Opcional: correr o smoke test remoto descrito em [ENVIRONMENT.md](ENVIRONMENT.md#20-smoke-test-remoto-de-staging).

---

## 8. Checklist rápida

* [ ] Base antiga apagada (se ainda existir).
* [ ] Base nova criada em Frankfurt, plano Free.
* [ ] `DATABASE_URL` atualizado com o Internal Database URL.
* [ ] `ALLOW_DEMO_SEED=true` e `DEMO_SEED_CONFIRMATION=PORTFOLIO_DEMO`.
* [ ] Build Command com `prisma:seed:demo`.
* [ ] Deploy com sucesso e logs do seed confirmados.
* [ ] Build Command reposto sem seed.
* [ ] `ALLOW_DEMO_SEED=false` e `DEMO_SEED_CONFIRMATION` vazio.
* [ ] Novo deploy sem `prisma:seed:demo`.
* [ ] Login demo validado no frontend.
* [ ] Datas de renovação atualizadas no topo deste ficheiro.
* [ ] Lembrete criado para a próxima renovação.

---

## 9. Histórico de renovações

| Data | Base criada |
| --- | --- |
| 2026-10-08 | `farmacia-santacasa-db-staging-v3` |
