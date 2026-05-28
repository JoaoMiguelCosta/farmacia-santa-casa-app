# ARCHITECTURE.md

# Arquitetura do Backend — Farmácia Santa Casa

## 1. Objetivo deste documento

Este documento descreve a arquitetura técnica do backend do projeto **Farmácia Santa Casa**.

O objetivo é explicar:

- como o backend está organizado;
- como os pedidos HTTP entram na aplicação;
- como as camadas comunicam entre si;
- como os módulos estão separados;
- como a autenticação e autorização funcionam;
- como o Prisma é usado;
- como os jobs de manutenção estão integrados;
- que decisões arquiteturais devem ser respeitadas ao evoluir o projeto.

Este ficheiro não substitui:

- `BUSINESS_RULES.md` — regras funcionais e decisões de domínio;
- `API_ROUTES.md` — documentação detalhada dos endpoints;
- `TESTING.md` — estratégia e fluxos de teste;
- `README.md` — entrada rápida no projeto.

---

## 2. Stack técnica

O backend usa uma stack simples e direta:

- **Node.js**
- **Express 4**
- **Prisma ORM 5**
- **PostgreSQL**
- **JWT** para sessão autenticada
- **Cookie HTTP-only** para transporte do token
- **bcryptjs** para hashing de passwords
- **node-cron** para jobs agendados
- **dotenv** para configuração por ambiente

Dependências principais:

```json
{
  "express": "^4.21.2",
  "@prisma/client": "^5.22.0",
  "prisma": "^5.22.0",
  "jsonwebtoken": "^9.0.3",
  "bcryptjs": "^3.0.3",
  "cookie-parser": "^1.4.7",
  "node-cron": "^4.2.1",
  "dotenv": "^16.6.1"
}
```

---

## 3. Visão geral da arquitetura

A arquitetura segue uma abordagem modular por domínio.

Cada domínio principal tem normalmente esta estrutura:

```txt
module/
├── module.controller.js
├── module.service.js
├── module.repository.js
├── module.routes.js
├── module.validators.js
└── module.mappers.js
```

Nem todos os módulos têm todos os ficheiros, mas a intenção arquitetural é esta:

| Camada | Responsabilidade |
|---|---|
| `routes` | Define endpoints HTTP e aplica handlers |
| `controller` | Recebe `req`, chama service e responde HTTP |
| `service` | Contém regras de aplicação e orquestra operações |
| `repository` | Acede à base de dados via Prisma |
| `validators` | Normaliza e valida payloads/query params |
| `mappers` | Converte entidades Prisma em DTOs seguros |
| `guards` | Centraliza validações reutilizáveis de estado/permissão de domínio |
| `jobs` | Rotinas agendadas e executáveis manualmente |
| `middlewares` | Segurança, autenticação, erros e proteção HTTP |
| `shared` | Utilitários genéricos e erros reutilizáveis |

---

## 4. Estrutura principal de pastas

```txt
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   ├── app/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── config/
│   │   ├── auth.config.js
│   │   └── env.js
│   │
│   ├── db/
│   │   └── prisma.js
│   │
│   ├── jobs/
│   │   ├── higiene.job.js
│   │   ├── index.js
│   │   ├── purgeHistory.job.js
│   │   └── receitaExpiry.job.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── loginRateLimit.js
│   │   ├── notFoundHandler.js
│   │   └── originGuard.js
│   │
│   ├── modules/
│   │   ├── admin-users/
│   │   ├── auth/
│   │   ├── extras/
│   │   ├── farmacia/
│   │   ├── manutencao/
│   │   ├── pedidos/
│   │   ├── receitas/
│   │   ├── regularizacoes/
│   │   ├── santa-casa/
│   │   ├── sem-receita/
│   │   └── utentes/
│   │
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── farmacia.routes.js
│   │   ├── index.js
│   │   ├── manutencao.routes.js
│   │   └── santacasa.routes.js
│   │
│   └── shared/
│       ├── errors/
│       │   └── AppError.js
│       └── utils/
│           ├── asyncHandler.js
│           ├── http.js
│           ├── normalize.js
│           └── pagination.js
│
├── .env
└── package.json
```

---

## 5. Fluxo de arranque da aplicação

O backend arranca a partir de:

```txt
src/app/server.js
```

Fluxo simplificado:

```txt
server.js
└── createApp()
    └── app.js
        ├── corsMiddleware
        ├── originGuard
        ├── cookieParser
        ├── express.json
        ├── /api routes
        ├── notFoundHandler
        └── errorHandler
```

Depois de o servidor HTTP ficar ativo, são registados os jobs:

```txt
registerJobs()
├── registerReceitaExpiryJob()
├── registerHigieneJob()
└── registerPurgeHistoryJob()
```

O servidor também trata encerramento controlado:

- `SIGINT`
- `SIGTERM`
- `unhandledRejection`
- `uncaughtException`

Durante shutdown, fecha a ligação Prisma através de:

```txt
disconnectPrisma()
```

---

## 6. Express app

O ficheiro principal da aplicação Express é:

```txt
src/app/app.js
```

Responsabilidades:

- criar a instância Express;
- remover o header `x-powered-by`;
- aplicar CORS manual;
- proteger pedidos de escrita por origem;
- ativar cookies;
- ativar JSON body parser;
- montar rotas em `/api`;
- aplicar handler de 404;
- aplicar handler global de erros.

Ordem dos middlewares:

```txt
app.disable("x-powered-by")
app.use(corsMiddleware)
app.use(originGuard)
app.use(cookieParser())
app.use(express.json({ limit: env.JSON_LIMIT }))
app.use("/api", routes)
app.use(notFoundHandler)
app.use(errorHandler)
```

Esta ordem é importante.

O `originGuard` corre antes das rotas para bloquear operações de escrita vindas de origens não autorizadas.

---

## 7. Configuração de ambiente

A configuração central está em:

```txt
src/config/env.js
```

Este ficheiro:

- carrega `.env`;
- normaliza valores booleanos;
- normaliza valores numéricos;
- normaliza listas separadas por vírgulas;
- valida variáveis obrigatórias;
- impede configurações inseguras em produção;
- define `process.env.TZ`.

Configurações principais:

| Variável | Função |
|---|---|
| `DATABASE_URL` | URL PostgreSQL usada pelo Prisma |
| `PORT` | Porta HTTP |
| `NODE_ENV` | Ambiente de execução |
| `TZ` | Timezone dos jobs e datas locais |
| `JSON_LIMIT` | Limite do body JSON |
| `AUTH_JWT_SECRET` | Segredo JWT |
| `AUTH_COOKIE_NAME` | Nome do cookie de sessão |
| `AUTH_TOKEN_EXPIRES_IN` | Duração do JWT |
| `AUTH_COOKIE_MAX_AGE_MS` | Duração do cookie |
| `AUTH_COOKIE_SECURE` | Cookie apenas HTTPS |
| `AUTH_COOKIE_SAME_SITE` | Política SameSite |
| `ALLOWED_ORIGINS` | Frontends autorizados |
| `ENABLE_HIGIENE` | Liga/desliga job de higiene |
| `ENABLE_PURGE_HISTORY` | Liga/desliga job de limpeza de histórico |
| `ENABLE_RECEITAS_EXPIRY` | Liga/desliga job de expiração de receitas |
| `CRON_MONTHLY_03H` | Expressão cron mensal |
| `CRON_DAILY_03H` | Expressão cron diária |

### 7.1. Validações de segurança

Em produção:

- `AUTH_JWT_SECRET` tem de existir;
- `AUTH_JWT_SECRET` deve ter pelo menos 32 caracteres;
- `AUTH_COOKIE_SECURE` tem de ser `true`;
- `AUTH_COOKIE_SAME_SITE=none` exige `AUTH_COOKIE_SECURE=true`;
- `ALLOWED_ORIGINS` não pode conter `*`.

---

## 8. Autenticação

A autenticação está no módulo:

```txt
src/modules/auth/
```

Ficheiros principais:

```txt
auth.controller.js
auth.service.js
auth.repository.js
auth.routes.js
auth.validators.js
```

### 8.1. Fluxo de login

```txt
POST /api/auth/login
└── loginRateLimit
    └── auth.controller.login
        └── auth.service.login
            ├── auth.repository.findUserByEmail
            ├── bcrypt.compare
            ├── jwt.sign
            └── res.cookie(...)
```

O token JWT é guardado em cookie HTTP-only.

O corpo da resposta devolve apenas o utilizador público:

```js
{
  id,
  name,
  email,
  role,
  isActive
}
```

Não é devolvido:

- `passwordHash`;
- token no JSON;
- dados internos sensíveis.

### 8.2. Sessão atual

```txt
GET /api/auth/me
```

Fluxo:

```txt
requireAuth
└── getCurrentUserFromRequest(req)
    ├── lê cookie
    ├── valida JWT
    ├── procura utilizador ativo
    └── devolve user público
```

### 8.3. Logout

```txt
POST /api/auth/logout
```

Remove o cookie de sessão com `clearCookie`.

---

## 9. Autorização por roles

As permissões principais são aplicadas em:

```txt
src/routes/index.js
```

Roles existentes:

```txt
ADMIN
SANTACASA
FARMACIA
```

Tabela de acesso:

| Prefixo | Roles permitidas |
|---|---|
| `/api/auth` | Público para login/logout; `/me` exige autenticação |
| `/api/santacasa` | `SANTACASA`, `ADMIN` |
| `/api/farmacia` | `FARMACIA`, `ADMIN` |
| `/api/manutencao` | `ADMIN` |
| `/api/admin` | `ADMIN` |
| `/api/health` | `ADMIN` |

A autorização é feita por dois middlewares:

```txt
requireAuth
requireRole
```

### 9.1. `requireAuth`

Responsável por:

- ler o utilizador atual a partir do cookie;
- validar sessão;
- colocar `req.user` disponível para controllers/services.

### 9.2. `requireRole`

Responsável por:

- bloquear acesso sem `req.user`;
- validar se `req.user.role` está na lista de roles permitidas.

---

## 10. Proteção de origem

A proteção contra pedidos de escrita de origem não autorizada está em:

```txt
src/middlewares/originGuard.js
```

Métodos considerados seguros:

```txt
GET
HEAD
OPTIONS
```

Todos os outros métodos são tratados como operações de escrita.

Exemplos:

```txt
POST
PUT
PATCH
DELETE
```

Para pedidos de escrita, o middleware verifica:

- header `Origin`;
- ou, em alternativa, origem extraída de `Referer`.

Em produção, pedidos sem origem válida são bloqueados.

Em desenvolvimento, origem ausente é permitida para facilitar ferramentas como Postman, Insomnia ou scripts locais.

---

## 11. Rate limit de login

O rate limit de login está em:

```txt
src/middlewares/loginRateLimit.js
```

É aplicado apenas em:

```txt
POST /api/auth/login
```

A chave do rate limit combina:

```txt
IP + email normalizado
```

Quando o login falha com `401`, o contador aumenta.

Quando o login tem sucesso, o contador é limpo.

A implementação usa `Map` em memória.

### Limitação técnica

Como o rate limit usa memória local, ele não é persistente nem partilhado entre múltiplas instâncias do servidor.

Para produção multi-instância, o ideal seria migrar para uma solução com Redis ou serviço externo de rate limiting.

---

## 12. Rotas principais

As rotas são montadas em camadas.

### 12.1. Router global

```txt
src/routes/index.js
```

Monta:

```txt
/api/auth
/api/santacasa
/api/farmacia
/api/manutencao
/api/admin
```

### 12.2. Santa Casa

```txt
src/routes/santacasa.routes.js
```

Monta:

```txt
/santacasa/dashboard/sinais
/santacasa/pedidos
/santacasa/regularizacoes
/santacasa/utentes
/santacasa/utentes/:utenteId/receitas
/santacasa/utentes/:utenteId/sem-receita
/santacasa/utentes/:utenteId/extras
```

### 12.3. Farmácia

```txt
src/routes/farmacia.routes.js
```

Monta:

```txt
/farmacia/dashboard/sinais
/farmacia/pedidos
/farmacia/pedidos/:pedidoId/validar
/farmacia/pedidos/:pedidoId/rejeitar
/farmacia/regularizacoes
```

### 12.4. Admin

```txt
src/routes/admin.routes.js
```

Monta:

```txt
/admin/users
```

### 12.5. Manutenção

```txt
src/routes/manutencao.routes.js
```

Monta endpoints para:

- listar jobs;
- fazer preview de jobs;
- executar jobs manualmente.

---

## 13. Padrão interno dos módulos

O padrão recomendado é:

```txt
HTTP Request
└── routes
    └── controller
        └── service
            ├── validators
            ├── guards
            ├── repository
            └── mappers
```

### 13.1. Routes

Responsabilidades:

- definir path;
- definir método HTTP;
- aplicar `asyncHandler`;
- delegar para controller.

Exemplo conceptual:

```js
router.get("/", asyncHandler(controller.list));
router.post("/", asyncHandler(controller.create));
```

A route não deve conter regras de negócio.

---

### 13.2. Controllers

Responsabilidades:

- ler `req.params`, `req.query`, `req.body` e `req.user`;
- chamar o service correto;
- devolver resposta HTTP com helpers (`ok`, `created`, `noContent`).

Controllers devem ser finos.

Não devem conter:

- queries Prisma;
- regras de disponibilidade;
- validações complexas;
- transações;
- lógica de negócio.

---

### 13.3. Services

Responsabilidades:

- validar regras de aplicação;
- chamar validators;
- chamar guards;
- coordenar repositories;
- lançar erros funcionais;
- montar fluxos de negócio.

É a camada mais importante do backend.

Exemplos de responsabilidade dos services:

- impedir criar pedido para utente arquivado;
- validar disponibilidade de quantidades;
- impedir duplicados;
- aplicar regra FEFO;
- decidir se uma operação deve lançar conflito;
- garantir permissões funcionais.

---

### 13.4. Repositories

Responsabilidades:

- aceder à base de dados;
- encapsular queries Prisma;
- executar transações;
- selecionar apenas campos necessários;
- devolver entidades ou estruturas usadas pelo service.

Os repositories não devem saber detalhes HTTP.

Não devem receber `req` ou `res`.

---

### 13.5. Validators

Responsabilidades:

- validar payloads;
- validar query params;
- normalizar tipos;
- converter strings para datas/números/booleanos;
- limitar tamanhos de input.

Quando uma validação falha, normalmente lança:

```txt
badRequest(...)
```

---

### 13.6. Mappers

Responsabilidades:

- converter resultados Prisma para DTOs;
- esconder campos internos;
- calcular campos derivados úteis para o frontend.

Exemplos de campos derivados:

- `quantidadeRestante`;
- `quantidadeReservadaPendente`;
- `isArchived`;
- `validatedBy` formatado;
- `rejectedBy` formatado.

---

### 13.7. Guards

Responsabilidades:

- concentrar regras reutilizáveis de proteção do domínio;
- evitar duplicação entre módulos.

Exemplo atual:

```txt
src/modules/utentes/utentes.guards.js
```

Inclui regras como:

- utente tem de existir;
- utente não pode estar removido;
- utente tem de estar operacional;
- mensagens de bloqueio por dependências abertas.

---

## 14. Módulos de domínio

## 14.1. `auth`

Responsável por:

- login;
- logout;
- sessão atual;
- validação JWT;
- construção do utilizador público.

Não gere utilizadores. A gestão de utilizadores pertence a `admin-users`.

---

## 14.2. `admin-users`

Responsável por:

- listar utilizadores;
- criar utilizadores;
- editar nome/email/role;
- alterar password;
- ativar/desativar utilizadores;
- remover utilizadores sem histórico associado.

Este módulo é exclusivo para `ADMIN`.

Regras arquiteturais importantes:

- password é sempre guardada como hash;
- utilizador não pode alterar estado da própria conta;
- utilizador não pode remover a própria conta;
- utilizador com histórico de auditoria não deve ser removido.

---

## 14.3. `utentes`

Responsável por:

- criar utentes;
- listar utentes;
- consultar detalhe;
- arquivar;
- reativar;
- remover por soft delete quando não existem dependências.

Este módulo é central porque quase todos os outros domínios dependem de `Utente`.

Tem um ficheiro extra:

```txt
utentes.guards.js
```

Este ficheiro é reutilizado por:

- receitas;
- sem-receita;
- extras;
- pedidos.

---

## 14.4. `receitas`

Responsável por:

- listar linhas de receita ativas de um utente;
- criar receitas com linhas;
- remover linhas quando permitido;
- acionar regularizações pendentes quando uma nova receita cobre vendas suspensas.

Arquiteturalmente, este módulo interage fortemente com:

```txt
regularizacoes.repository.js
extras.repository.js
utentes.repository.js
```

A criação de receitas usa transação, porque pode:

- criar receita;
- criar várias linhas;
- aplicar regularizações pendentes;
- atualizar quantidades dispensadas;
- resolver vendas suspensas abertas.

---

## 14.5. `sem-receita`

Representa medicamentos não sujeitos a receita médica.

Responsável por:

- listar medicamentos disponíveis por utente;
- criar novo registo;
- incrementar quantidade se o medicamento já existir;
- remover quando não há pedidos associados.

A arquitetura deste módulo é simples e serve como bom exemplo de separação controller/service/repository/mapper/validator.

---

## 14.6. `extras`

Representa tecnicamente as **Vendas Suspensas**.

Responsável por:

- listar vendas suspensas em aberto;
- criar venda suspensa;
- impedir duplicados em aberto;
- impedir venda suspensa quando já existe receita ativa com quantidade disponível;
- remover quando ainda não está associada a pedidos.

Nota de nomenclatura:

- nome técnico interno: `Extra`;
- nome funcional/UI: `Venda Suspensa`.

---

## 14.7. `pedidos`

Responsável pelo lado Santa Casa dos pedidos.

Inclui:

- criação de pedidos;
- consulta por ID;
- cancelamento antes de validação;
- histórico;
- lista de pendentes.

Este módulo valida disponibilidade antes de criar um pedido.

Também aplica a regra FEFO para linhas de receita:

```txt
First Expired, First Out
```

Ou seja: para o mesmo medicamento, deve ser usada primeiro a linha com validade mais próxima.

---

## 14.8. `farmacia`

Responsável pelo lado Farmácia dos pedidos.

Inclui:

- listar pedidos;
- validar pedido;
- rejeitar pedido;
- dashboard da farmácia.

A validação do pedido é uma das operações mais críticas do backend.

Usa transação porque pode:

- validar pedido;
- validar itens;
- criar dispensas;
- incrementar `quantidadeDispensada` em linhas de receita;
- decrementar quantidade de medicamentos não sujeitos a receita médica;
- criar regularizações para vendas suspensas;
- atualizar estados de itens;
- atualizar estado global do pedido.

---

## 14.9. `regularizacoes`

Responsável por:

- listar regularizações pendentes;
- listar histórico de regularizações;
- devolver sinal/dashboard;
- aplicar regularizações pendentes a linhas de receita.

O ponto mais importante é:

```txt
applyPendingToLinhasTx
```

Esta função é usada dentro da criação de receitas para regularizar vendas suspensas automaticamente quando aparece receita compatível.

---

## 14.10. `santa-casa`

Módulo agregado para dashboard/sinais da Santa Casa.

Responsável por devolver contadores gerais sobre:

- utentes;
- receitas;
- medicamentos não sujeitos a receita médica;
- vendas suspensas;
- pedidos;
- regularizações;
- último pedido criado.

---

## 14.11. `manutencao`

Responsável por expor ações administrativas sobre jobs.

Inclui:

- listar jobs disponíveis;
- preview de execução;
- execução manual.

Este módulo é exclusivo para `ADMIN`.

---

## 15. Modelo de dados principal

O modelo de dados está em:

```txt
prisma/schema.prisma
```

Entidades principais:

```txt
User
Utente
Medicamento
Receita
ReceitaLinha
SemReceita
Extra
Pedido
PedidoItem
Dispensa
RegularizacaoExtra
RegularizacaoEvento
```

### 15.1. Relação conceptual

```txt
Utente
├── Receita
│   └── ReceitaLinha
│       ├── PedidoItem
│       ├── Dispensa
│       └── RegularizacaoEvento
│
├── SemReceita
│   └── PedidoItem
│
├── Extra
│   ├── PedidoItem
│   └── RegularizacaoExtra
│       └── RegularizacaoEvento
│
└── PedidoItem
    └── Pedido
```

### 15.2. Auditoria por utilizador

`User` está associado a:

- pedidos validados;
- itens validados;
- pedidos rejeitados;
- itens rejeitados;
- utentes arquivados.

Isto permite manter histórico de ações críticas.

---

## 16. Estados principais

### 16.1. `PedidoStatus`

```txt
PENDENTE
VALIDADO
REJEITADO
CANCELADO
```

### 16.2. `PedidoItemStatus`

```txt
PENDENTE
VALIDADO
REJEITADO
CANCELADO
CANCELADO_POR_EXPIRACAO
```

### 16.3. `PedidoItemTipo`

```txt
COM_RECEITA
SEM_RECEITA
EXTRA
```

### 16.4. `LinhaReceitaStatus`

```txt
ATIVA
EXPIRADA
```

### 16.5. `ExtraStatus`

```txt
PENDENTE
PARCIALMENTE_REGULARIZADO
REGULARIZADO
EXPIRADO
```

### 16.6. `RegularizacaoStatus`

```txt
PENDENTE
PARCIALMENTE_REGULARIZADO
REGULARIZADO
```

### 16.7. `UtenteStatus`

```txt
ATIVO
ARQUIVADO
```

### 16.8. `UserRole`

```txt
SANTACASA
FARMACIA
ADMIN
```

---

## 17. Prisma Client

O Prisma Client é centralizado em:

```txt
src/db/prisma.js
```

Este ficheiro:

- cria uma única instância de `PrismaClient`;
- usa a `DATABASE_URL` do ambiente;
- define logs diferentes por ambiente;
- reutiliza a instância em desenvolvimento via `global.__PRISMA_CLIENT__`;
- exporta `disconnectPrisma`.

### 17.1. Motivo da instância global em desenvolvimento

Em desenvolvimento, ferramentas como `nodemon` podem recarregar ficheiros várias vezes.

Sem reutilização global, cada reload pode criar nova ligação à base de dados.

Isto pode causar:

- excesso de conexões;
- warnings;
- comportamento instável.

---

## 18. Transações

Operações críticas usam `prisma.$transaction`.

Isto é obrigatório quando uma ação altera várias tabelas e precisa de consistência.

Exemplos atuais:

| Operação | Motivo da transação |
|---|---|
| Criar pedido | Criar pedido + múltiplos itens |
| Validar pedido | Atualizar pedido, itens, dispensas, quantidades e regularizações |
| Rejeitar pedido | Atualizar pedido e itens em conjunto |
| Cancelar pedido | Atualizar pedido e itens pendentes |
| Criar receita | Criar receita, linhas, regularizações e resolver vendas suspensas |
| Purge histórico | Apagar/desvincular entidades relacionadas |
| Expiração de receitas | Expirar linhas e cancelar pedidos afetados |

Regra para evolução:

> Se uma operação altera mais do que uma entidade de domínio no mesmo fluxo funcional, deve ser avaliada a necessidade de transação.

---

## 19. DTOs e exposição de dados

A API não deve devolver diretamente entidades Prisma completas quando existem dados sensíveis ou estrutura interna desnecessária.

Por isso existem mappers.

Exemplos:

```txt
pedidos.mappers.js
receitas.mappers.js
semReceita.mappers.js
extras.mappers.js
regularizacoes.mappers.js
utentes.mappers.js
```

Os DTOs servem para:

- controlar o contrato da API;
- proteger dados sensíveis;
- facilitar consumo pelo frontend;
- incluir campos calculados;
- normalizar estruturas repetidas.

### Regra recomendada

Não devolver `passwordHash` ou campos internos de controlo que não sejam necessários para o frontend.

---

## 20. Erros

Os erros funcionais são centralizados em:

```txt
src/shared/errors/AppError.js
```

Helpers disponíveis:

```txt
badRequest
unauthorized
forbidden
notFound
conflict
```

Cada erro inclui:

```txt
message
statusCode
code
details
isOperational
```

O handler global está em:

```txt
src/middlewares/errorHandler.js
```

Responsabilidades:

- mapear erros Prisma conhecidos;
- devolver resposta JSON consistente;
- esconder detalhes sensíveis em produção;
- fazer logging em desenvolvimento.

### 20.1. Mapeamento Prisma

| Código Prisma | Resposta HTTP | Código API |
|---|---:|---|
| `P2002` | 409 | `UNIQUE_VIOLATION` |
| `P2025` | 404 | `NOT_FOUND` |
| `P2003` | 409 | `FOREIGN_KEY_CONSTRAINT` |
| Outros | 400 | `PRISMA_ERROR` |

### 20.2. Formato de erro

```json
{
  "error": "CONFLICT",
  "message": "Mensagem funcional do erro."
}
```

Em desenvolvimento, pode incluir:

```json
{
  "details": {}
}
```

---

## 21. Jobs de manutenção

Os jobs vivem em:

```txt
src/jobs/
```

Jobs atuais:

```txt
receitaExpiry.job.js
higiene.job.js
purgeHistory.job.js
```

São registados por:

```txt
src/jobs/index.js
```

### 21.1. `receitaExpiry.job.js`

Responsável por:

- encontrar linhas de receita ativas expiradas;
- marcar linhas como `EXPIRADA`;
- cancelar pedidos pendentes afetados por essas linhas;
- marcar itens como `CANCELADO_POR_EXPIRACAO`;
- marcar pedidos como `CANCELADO`.

Agenda padrão:

```txt
CRON_DAILY_03H
```

### 21.2. `higiene.job.js`

Responsável por:

- procurar utentes removidos há mais de X meses;
- marcar como inválidos por rotina de higiene;
- opcionalmente anonimizar, se permitido por configuração.

Agenda padrão:

```txt
CRON_MONTHLY_03H
```

### 21.3. `purgeHistory.job.js`

Responsável por:

- remover histórico antigo de pedidos fechados;
- remover regularizações concluídas antigas;
- apagar entidades dependentes na ordem correta;
- desvincular regularizações de pedidos quando necessário.

Agenda padrão:

```txt
CRON_MONTHLY_03H
```

### 21.4. Proteção contra registo duplicado

Cada job usa uma flag global para evitar múltiplos registos no mesmo processo:

```txt
global.__RECEITAS_EXPIRY_JOB_REGISTERED__
global.__HIGIENE_JOB_REGISTERED__
global.__PURGE_HISTORY_JOB_REGISTERED__
```

---

## 22. Módulo de manutenção

O módulo `manutencao` permite executar jobs manualmente via API.

Exemplos de ações suportadas:

- preview de expiração de receitas;
- execução da expiração;
- preview de higiene;
- execução de higiene;
- preview de limpeza de histórico;
- execução de limpeza de histórico.

Esta camada é importante porque evita depender exclusivamente do cron.

Também permite validar impactos antes de executar rotinas destrutivas.

---

## 23. Segurança

Principais decisões de segurança:

- passwords com bcrypt;
- JWT assinado com segredo obrigatório;
- token em cookie HTTP-only;
- cookie seguro obrigatório em produção;
- CORS restrito a `ALLOWED_ORIGINS`;
- proteção de origem para operações de escrita;
- rate limit no login;
- roles aplicadas por prefixo de rota;
- erro genérico em login inválido;
- não exposição de `passwordHash`.

### Pontos a melhorar no futuro

- substituir rate limit em memória por Redis;
- adicionar logs estruturados;
- adicionar request ID;
- adicionar helmet;
- adicionar CSRF token se o contexto de deployment exigir proteção adicional;
- adicionar testes automatizados para permissões e fluxos críticos.

---

## 24. Convenções de resposta HTTP

Helpers em:

```txt
src/shared/utils/http.js
```

Disponíveis:

```txt
ok(res, data)        // 200
created(res, data)   // 201
noContent(res)       // 204
```

Padrões usados:

### Listagem

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "skip": 0,
    "take": 50
  },
  "params": {}
}
```

### Criação ou atualização

```json
{
  "data": {}
}
```

### Remoção sem conteúdo

```txt
204 No Content
```

Nota: existem pequenas diferenças entre alguns módulos antigos e novos. Ao evoluir, deve-se tentar manter o padrão `data/meta/params` para listagens.

---

## 25. Paginação

Existem duas abordagens no backend atual:

1. parsing manual por módulo;
2. helper genérico em `shared/utils/pagination.js`.

O helper genérico fornece:

```txt
parsePagination
buildPaginationMeta
```

No entanto, vários módulos ainda fazem parsing próprio de `skip` e `take`.

### Recomendação futura

Padronizar paginação para reduzir duplicação.

Exemplo recomendado:

```txt
page/pageSize para frontend
skip/take internamente
```

Ou manter `skip/take`, mas de forma consistente em todos os módulos.

---

## 26. Normalização de texto

A normalização vive em:

```txt
src/shared/utils/normalize.js
```

Função principal:

```txt
normalizeText(value)
```

Remove acentos, converte para minúsculas e faz trim.

É usada para comparar medicamentos de forma mais previsível, especialmente em:

- vendas suspensas;
- receitas;
- regularizações;
- regra FEFO por medicamento.

---

## 27. Seed

O seed está em:

```txt
prisma/seed.js
```

Cria/atualiza utilizadores iniciais:

- administrador;
- utilizador Santa Casa;
- utilizador Farmácia.

Usa `upsert`, portanto pode ser executado várias vezes sem duplicar emails.

Passwords são guardadas com bcrypt.

Variáveis suportadas:

```txt
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
SEED_SANTACASA_EMAIL
SEED_SANTACASA_PASSWORD
SEED_FARMACIA_EMAIL
SEED_FARMACIA_PASSWORD
```

---

## 28. Comandos principais

```bash
npm run dev
```

Arranca o backend em desenvolvimento com `nodemon`.

```bash
npm start
```

Arranca o backend em modo normal.

```bash
npm run prisma:generate
```

Gera Prisma Client.

```bash
npm run prisma:migrate
```

Cria/aplica migration em desenvolvimento.

```bash
npm run prisma:studio
```

Abre Prisma Studio.

```bash
npm run job:receita-expiry
```

Executa manualmente o job de expiração de receitas.

```bash
npm run job:higiene
```

Executa manualmente o job de higiene.

```bash
npm run job:purge-history
```

Executa manualmente o job de limpeza de histórico.

---

## 29. Decisões arquiteturais atuais

### 29.1. Backend modular por domínio

O backend não está organizado por tipo técnico global, mas sim por domínio.

Boa decisão.

Isto facilita:

- manutenção;
- leitura;
- evolução gradual;
- isolamento de regras por área.

---

### 29.2. Services como camada de regra de aplicação

As regras mais importantes estão nos services.

Boa decisão.

Evita controllers gordos e repositories com regras HTTP.

---

### 29.3. Repositories com Prisma encapsulado

Boa decisão.

Permite trocar queries e selects sem espalhar Prisma por controllers.

---

### 29.4. DTOs explícitos

Boa decisão.

Evita devolver entidades completas e reduz acoplamento com o schema da base de dados.

---

### 29.5. Jobs integrados no processo principal

Solução aceitável para projeto pequeno/médio.

Risco futuro:

- se o backend correr em múltiplas instâncias, cada instância pode tentar executar jobs;
- as flags globais só protegem dentro do mesmo processo.

Para produção multi-instância, considerar:

- scheduler externo;
- fila;
- worker dedicado;
- lock distribuído na base de dados.

---

## 30. Dívida técnica / melhorias futuras

### 30.1. Duplicação de selects

Há vários selects semelhantes para `Pedido`, `PedidoItem`, utilizadores de auditoria e relações.

Melhoria possível:

```txt
shared/selects/
├── auditUser.select.js
├── pedido.select.js
└── receitaLinha.select.js
```

Cuidado: isto deve ser feito sem esconder demasiado a query, para não prejudicar legibilidade.

---

### 30.2. Duplicação de parsing de paginação

Vários validators repetem lógica de `skip`, `take`, datas e search.

Melhoria possível:

```txt
shared/utils/queryParsers.js
```

Com helpers como:

```txt
parseIntegerQueryParam
parseDateQueryParam
parseSearchQuery
parseBooleanQueryParam
```

---

### 30.3. Datas e timezone

O backend usa `Date` nativo e define `process.env.TZ`.

Isto funciona, mas exige cuidado com:

- datas recebidas do frontend;
- filtros `from/to`;
- jobs às 03:00;
- comparação de validade.

Melhoria futura:

- padronizar entrada/saída de datas em ISO;
- documentar claramente timezone esperado;
- eventualmente usar uma biblioteca como `date-fns` ou `luxon` se a complexidade aumentar.

---

### 30.4. Rate limit em memória

Funciona em desenvolvimento e numa instância única.

Não é suficiente para produção distribuída.

---

### 30.5. Testes automatizados

O backend ainda depende muito de validação manual/scripts.

Recomendado adicionar:

- testes unitários para validators;
- testes unitários para services críticos;
- testes de integração para rotas principais;
- testes para jobs;
- testes de permissões por role.

---

## 31. Regras para futuras alterações

Ao criar ou alterar funcionalidades, respeitar estas regras:

### 31.1. Não colocar regra de negócio no controller

Errado:

```txt
controller valida disponibilidade, consulta Prisma e decide conflito
```

Certo:

```txt
controller chama service
service valida disponibilidade
repository consulta Prisma
```

---

### 31.2. Não aceder ao Prisma diretamente fora de repositories/jobs

Exceções aceitáveis:

- jobs;
- scripts;
- seed;
- casos muito específicos e justificados.

---

### 31.3. Não devolver entidades Prisma completas sem mapper

Usar mapper quando:

- há relações;
- há campos sensíveis;
- há campos calculados;
- a resposta é consumida pelo frontend.

---

### 31.4. Usar transação quando houver múltiplas alterações dependentes

Exemplos:

- pedido + itens;
- validação + dispensa + atualização de stock;
- receita + regularizações;
- limpeza de histórico.

---

### 31.5. Validar input antes de chamar repository

Validação deve acontecer antes de tocar na base de dados quando possível.

---

### 31.6. Manter linguagem funcional correta

No código técnico pode existir:

```txt
Extra
SemReceita
```

Na linguagem funcional/documentação/UI usar:

```txt
Venda Suspensa
Medicamento não sujeito a receita médica
```

---

## 32. Fluxo resumido de criação e validação de pedido

```txt
Santa Casa cria pedido
└── pedidos.controller.create
    └── pedidos.service.createPedido
        ├── valida payload
        ├── valida utente operacional
        ├── valida disponibilidade por tipo de item
        ├── aplica FEFO se for receita
        └── pedidos.repository.createPedidoWithItems
            └── transação: cria Pedido + PedidoItems
```

Depois:

```txt
Farmácia valida pedido
└── farmacia.controller.validarPedido
    └── farmacia.service.validarPedido
        ├── valida utilizador autenticado
        └── farmacia.repository.validarPedido
            └── transação:
                ├── valida pedido pendente
                ├── valida itens pendentes
                ├── cria dispensas se COM_RECEITA
                ├── atualiza quantidadeDispensada
                ├── decrementa SemReceita se SEM_RECEITA
                ├── cria RegularizacaoExtra se EXTRA
                ├── atualiza Extra
                ├── valida PedidoItems
                └── valida Pedido
```

---

## 33. Fluxo resumido de regularização automática

```txt
Santa Casa cria receita
└── receitas.service.createForUtente
    ├── valida utente operacional
    ├── valida payload
    ├── impede número de receita duplicado
    ├── calcula preview de regularizações
    ├── exige confirmação se houver impacto
    └── receitas.repository.createReceitaWithLinhas
        └── transação:
            ├── cria Receita
            ├── cria ReceitaLinhas
            ├── regularizacoes.applyPendingToLinhasTx
            ├── procura linhas criadas
            └── resolve vendas suspensas abertas
```

---

## 34. Fluxo resumido de expiração de receitas

```txt
Job diário
└── receitaExpiry.job.runOnce
    └── transação:
        ├── procura ReceitaLinha ATIVA com validade <= agora
        ├── procura pedidos pendentes afetados
        ├── marca linhas como EXPIRADA
        ├── cancela itens pendentes dos pedidos afetados
        └── marca pedidos como CANCELADO
```

---

## 35. Avaliação geral da arquitetura atual

A arquitetura atual está bem encaminhada.

Pontos fortes:

- separação clara por domínio;
- controllers finos;
- services com regras de aplicação;
- repositories com Prisma encapsulado;
- mappers explícitos;
- guards reutilizáveis;
- autenticação e roles bem separadas;
- jobs com preview/run;
- uso de transações em operações críticas;
- boas validações de segurança em ambiente.

Pontos a melhorar:

- duplicação de parsers e selects;
- falta de testes automatizados formais;
- rate limit em memória;
- jobs no mesmo processo da API;
- alguma inconsistência entre formatos de resposta antigos e novos;
- documentação de API ainda separada por criar.


