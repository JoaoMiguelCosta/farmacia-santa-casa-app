# ARCHITECTURE.md

# Arquitetura do Backend — Farmácia Santa Casa

## 1. Objetivo deste documento

Este documento descreve a arquitetura técnica do backend do projeto **Farmácia Santa Casa**.

O objetivo é explicar:

* como o backend está organizado;
* como os pedidos HTTP entram na aplicação;
* como as camadas comunicam entre si;
* como os módulos estão separados;
* como a autenticação e autorização funcionam;
* como o Prisma é usado;
* como os jobs de manutenção estão integrados;
* como os testes estão organizados;
* que decisões arquiteturais devem ser respeitadas ao evoluir o projeto.

Este ficheiro não substitui:

* `BUSINESS_RULES.md` — regras funcionais e decisões de domínio;
* `API_ROUTES.md` — documentação detalhada dos endpoints;
* `TESTING.md` — estratégia e fluxos de teste;
* `README.md` — entrada rápida no projeto;
* `ENVIRONMENT.md` — variáveis de ambiente e configuração local/produção.

---

## 2. Stack técnica

O backend usa uma stack simples, explícita e adequada ao tamanho atual do projeto:

* **Node.js**
* **Express 4**
* **Prisma ORM 5**
* **PostgreSQL**
* **JWT** para sessão autenticada
* **Cookie HTTP-only** para transporte do token
* **bcryptjs** para hashing de passwords
* **cookie-parser** para leitura de cookies
* **helmet** para security headers HTTP
* **node-cron** para jobs agendados
* **dotenv** para configuração por ambiente
* **Vitest** para testes unitários, integração e E2E
* **Supertest** para testes HTTP

Dependências principais:

```json
{
  "express": "^4.21.2",
  "@prisma/client": "^5.22.0",
  "prisma": "^5.22.0",
  "jsonwebtoken": "^9.0.3",
  "bcryptjs": "^3.0.3",
  "cookie": "^1.1.1",
  "cookie-parser": "^1.4.7",
  "helmet": "^8.2.0",
  "node-cron": "^4.2.1",
  "dotenv": "^16.6.1"
}
```

Dependências de desenvolvimento relevantes:

```json
{
  "vitest": "^4.1.7",
  "supertest": "^7.2.2",
  "nodemon": "^3.1.10"
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

| Camada        | Responsabilidade                                                   |
| ------------- | ------------------------------------------------------------------ |
| `routes`      | Define endpoints HTTP e aplica handlers                            |
| `controller`  | Recebe `req`, chama service e responde HTTP                        |
| `service`     | Contém regras de aplicação e orquestra operações                   |
| `repository`  | Acede à base de dados via Prisma                                   |
| `validators`  | Normaliza e valida payloads/query params                           |
| `mappers`     | Converte entidades Prisma em DTOs seguros                          |
| `guards`      | Centraliza validações reutilizáveis de estado/permissão de domínio |
| `jobs`        | Rotinas agendadas e executáveis manualmente                        |
| `middlewares` | Segurança, autenticação, erros e proteção HTTP                     |
| `shared`      | Utilitários genéricos e erros reutilizáveis                        |
| `tests`       | Testes unitários, integração, E2E, fixtures e helpers              |

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
│   │   ├── originGuard.js
│   │   └── requestId.js
│   │
│   ├── modules/
│   │   ├── admin-users/
│   │   ├── alertas/
│   │   ├── auth/
│   │   ├── extras/
│   │   ├── farmacia/
│   │   ├── manutencao/
│   │   ├── medicacao-habitual/
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
│           ├── date.js
│           ├── http.js
│           ├── normalize.js
│           └── pagination.js
│
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   ├── helpers/
│   ├── integration/
│   └── unit/
│
├── .env
├── .env.example
├── package.json
└── vitest.config.mjs
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
        ├── requestId
        ├── helmet
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

* `SIGINT`
* `SIGTERM`
* `unhandledRejection`
* `uncaughtException`

Durante shutdown, o servidor:

* evita shutdown duplicado;
* tenta parar jobs registados;
* fecha o servidor HTTP;
* fecha a ligação Prisma através de `disconnectPrisma()`;
* força encerramento se o processo não terminar dentro do timeout definido.

---

## 6. Express app

O ficheiro principal da aplicação Express é:

```txt
src/app/app.js
```

Responsabilidades:

* criar a instância Express;
* remover o header `x-powered-by`;
* adicionar `X-Request-Id` a todas as respostas;
* aplicar security headers HTTP com `helmet`;
* aplicar CORS manual;
* proteger pedidos de escrita por origem;
* ativar cookies;
* ativar JSON body parser;
* montar rotas em `/api`;
* aplicar handler de 404;
* aplicar handler global de erros.

Ordem dos middlewares:

```txt
app.disable("x-powered-by")
app.set("trust proxy", env.TRUST_PROXY)
app.use(requestId)
app.use(helmet())
app.use(corsMiddleware)
app.use(originGuard)
app.use(cookieParser())
app.use(express.json({ limit: env.JSON_LIMIT }))
app.use("/api", routes)
app.use(notFoundHandler)
app.use(errorHandler)
```

Esta ordem é importante.

O `requestId` corre no início para garantir `X-Request-Id` em todas as respostas.

O `helmet` corre antes das rotas para aplicar security headers HTTP.

O `originGuard` corre antes das rotas para bloquear operações de escrita vindas de origens não autorizadas.

---

## 7. Configuração de ambiente

A configuração central está em:

```txt
src/config/env.js
```

Este ficheiro:

* carrega `.env`;
* normaliza valores booleanos;
* normaliza valores numéricos;
* normaliza listas separadas por vírgulas;
* valida variáveis obrigatórias;
* impede configurações inseguras em produção;
* define `process.env.TZ`.

Configurações principais:

| Variável                 | Função                                    |
| ------------------------ | ----------------------------------------- |
| `DATABASE_URL`           | URL PostgreSQL usada pelo Prisma          |
| `PORT`                   | Porta HTTP                                |
| `NODE_ENV`               | Ambiente de execução                      |
| `TZ`                     | Timezone dos jobs e datas locais          |
| `JSON_LIMIT`             | Limite do body JSON                       |
| `TRUST_PROXY`            | Configuração de proxy confiável do Express |
| `AUTH_JWT_SECRET`        | Segredo JWT                               |
| `AUTH_COOKIE_NAME`       | Nome do cookie de sessão                  |
| `AUTH_TOKEN_EXPIRES_IN`  | Duração do JWT                            |
| `AUTH_COOKIE_MAX_AGE_MS` | Duração do cookie                         |
| `AUTH_COOKIE_SECURE`     | Cookie apenas HTTPS                       |
| `AUTH_COOKIE_SAME_SITE`  | Política SameSite                         |
| `ALLOWED_ORIGINS`        | Frontends autorizados                     |
| `ENABLE_HIGIENE`         | Liga/desliga job de higiene               |
| `ENABLE_PURGE_HISTORY`   | Liga/desliga job de limpeza de histórico  |
| `ENABLE_RECEITAS_EXPIRY` | Liga/desliga job de expiração de receitas |
| `CRON_MONTHLY_03H`       | Expressão cron mensal                     |
| `CRON_DAILY_03H`         | Expressão cron diária                     |
| `HIGIENE_OFFSET_MONTHS`  | Antiguidade usada pelo job de higiene     |
| `HIGIENE_ANONYMIZE`      | Permissão/configuração para anonimização  |
| `PURGE_OFFSET_MONTHS`    | Antiguidade usada pelo purge histórico    |

### 7.1 Validações de segurança

Em produção:

* `AUTH_JWT_SECRET` tem de existir;
* `AUTH_JWT_SECRET` deve ter pelo menos 32 caracteres;
* `AUTH_COOKIE_SECURE` tem de ser `true`;
* `AUTH_COOKIE_SAME_SITE=none` exige `AUTH_COOKIE_SECURE=true`;
* `ALLOWED_ORIGINS` não pode conter `*`;
* `ALLOWED_ORIGINS` não pode conter localhost/127.0.0.1;
* `AUTH_COOKIE_SAME_SITE=none` exige `AUTH_COOKIE_SECURE=true`.

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

### 8.1 Fluxo de login

```txt
POST /api/auth/login
└── loginRateLimit
    └── auth.controller.login
        └── auth.service.login
            ├── auth.validators.parseLoginPayload
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

* `passwordHash`;
* token no JSON;
* dados internos sensíveis.

### 8.2 Sessão atual

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

### 8.3 Logout

```txt
POST /api/auth/logout
```

Remove o cookie de sessão com `clearCookie`.

Logout é permitido mesmo sem sessão ativa.

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

| Prefixo           | Roles permitidas                                    |
| ----------------- | --------------------------------------------------- |
| `/api/auth`       | Público para login/logout; `/me` exige autenticação |
| `/api/santacasa`  | `SANTACASA`, `ADMIN`                                |
| `/api/farmacia`   | `FARMACIA`, `ADMIN`                                 |
| `/api/manutencao`   | `ADMIN`                                           |
| `/api/admin`        | `ADMIN`                                           |
| `/api/health/live`  | Público                                           |
| `/api/health/ready` | Público                                           |
| `/api/health`       | `ADMIN`                                          |

A autorização é feita por dois middlewares:

```txt
requireAuth
requireRole
```

### 9.1 `requireAuth`

Responsável por:

* ler o utilizador atual a partir do cookie;
* validar sessão;
* rejeitar token inexistente, inválido, expirado ou de utilizador inativo;
* colocar `req.user` disponível para controllers/services.

### 9.2 `requireRole`

Responsável por:

* bloquear acesso sem `req.user`;
* validar se `req.user.role` está na lista de roles permitidas.

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

* header `Origin`;
* ou, em alternativa, origem extraída de `Referer`.

Em produção, pedidos sem origem válida são bloqueados.

Em desenvolvimento, origem ausente é permitida para facilitar ferramentas como Postman, Insomnia, Supertest ou scripts locais.

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

O IP vem de `req.ip`, respeitando a configuração `TRUST_PROXY` do Express.

Isto evita ler `x-forwarded-for` manualmente dentro do middleware e reduz o risco de bypass quando `TRUST_PROXY=false`.

Quando o login falha com `401`, o contador aumenta.

Quando o login tem sucesso, o contador é limpo.

A implementação usa `Map` em memória.

### Limitação técnica

Como o rate limit usa memória local, ele não é persistente nem partilhado entre múltiplas instâncias do servidor.

Para produção multi-instância, o ideal seria migrar para uma solução com Redis ou serviço externo de rate limiting.

---

## 11.1 Request ID e headers de segurança

O middleware de request ID está em:

```txt
src/middlewares/requestId.js
```

Responsabilidades:

* ler `X-Request-Id` enviado pelo cliente, quando válido;
* gerar um identificador quando o cliente não envia;
* guardar o valor em `req.requestId`;
* devolver `X-Request-Id` em todas as respostas;
* expor `X-Request-Id` em CORS para apoio a diagnóstico no frontend.

O `errorHandler` inclui `requestId` nos logs de erro, sobretudo para facilitar análise de incidentes em produção.

Os security headers HTTP são aplicados por `helmet` em `src/app/app.js`.

O body das respostas de erro não foi alterado. O identificador fica no header para não quebrar contratos existentes da API.

---

## 12. Rotas principais

As rotas são montadas em camadas.

### 12.1 Router global

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
/api/health/live
/api/health/ready
/api/health
```

### 12.2 Santa Casa

```txt
src/routes/santacasa.routes.js
```

Monta:

```txt
/santacasa/health
/santacasa/dashboard/sinais
/santacasa/pedidos
/santacasa/regularizacoes
/santacasa/utentes
/santacasa/utentes/:utenteId/receitas
/santacasa/utentes/:utenteId/sem-receita
/santacasa/utentes/:utenteId/extras
/santacasa/utentes/:utenteId/medicacao-habitual
```

### 12.3 Farmácia

```txt
src/routes/farmacia.routes.js
```

Monta:

```txt
/farmacia/health
/farmacia/dashboard/sinais
/farmacia/pedidos
/farmacia/pedidos/:pedidoId
/farmacia/pedidos/:pedidoId/validar
/farmacia/pedidos/:pedidoId/rejeitar
/farmacia/regularizacoes
/farmacia/alertas
```

### 12.4 Admin

```txt
src/routes/admin.routes.js
```

Monta:

```txt
/admin/users
```

### 12.5 Manutenção

```txt
src/routes/manutencao.routes.js
```

Monta endpoints para:

* listar jobs;
* fazer preview de jobs;
* executar jobs manualmente.

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

### 13.1 Routes

Responsabilidades:

* definir path;
* definir método HTTP;
* aplicar `asyncHandler`;
* delegar para controller.

Exemplo conceptual:

```js
router.get("/", asyncHandler(controller.list));
router.post("/", asyncHandler(controller.create));
```

A route não deve conter regras de negócio.

---

### 13.2 Controllers

Responsabilidades:

* ler `req.params`, `req.query`, `req.body` e `req.user`;
* chamar o service correto;
* devolver resposta HTTP com helpers (`ok`, `created`, `noContent`).

Controllers devem ser finos.

Não devem conter:

* queries Prisma;
* regras de disponibilidade;
* validações complexas;
* transações;
* lógica de negócio.

---

### 13.3 Services

Responsabilidades:

* validar regras de aplicação;
* chamar validators;
* chamar guards;
* coordenar repositories;
* lançar erros funcionais;
* montar fluxos de negócio.

É a camada mais importante do backend.

Exemplos de responsabilidade dos services:

* impedir criar pedido para utente arquivado;
* validar disponibilidade de quantidades;
* impedir duplicados;
* aplicar regra FEFO;
* decidir se uma operação deve lançar conflito;
* garantir permissões funcionais;
* orquestrar regularizações;
* criar alertas operacionais.

---

### 13.4 Repositories

Responsabilidades:

* aceder à base de dados;
* encapsular queries Prisma;
* executar transações;
* selecionar apenas campos necessários;
* devolver entidades ou estruturas usadas pelo service.

Os repositories não devem saber detalhes HTTP.

Não devem receber `req` ou `res`.

---

### 13.5 Validators

Responsabilidades:

* validar payloads;
* validar query params;
* normalizar tipos;
* converter strings para datas/números/booleanos;
* limitar tamanhos de input;
* normalizar aliases técnicos aceites pela API.

Quando uma validação falha, normalmente lança:

```txt
badRequest(...)
```

---

### 13.6 Mappers

Responsabilidades:

* converter resultados Prisma para DTOs;
* esconder campos internos;
* calcular campos derivados úteis para o frontend;
* garantir contratos estáveis para a API.

Exemplos de campos derivados:

* `quantidadeRestante`;
* `quantidadeReservadaPendente`;
* `isArchived`;
* `validatedBy` formatado;
* `rejectedBy` formatado;
* `canceledBy` formatado;
* `archivedBy` formatado.

---

### 13.7 Guards

Responsabilidades:

* concentrar regras reutilizáveis de proteção do domínio;
* evitar duplicação entre módulos.

Exemplo atual:

```txt
src/modules/utentes/utentes.guards.js
```

Inclui regras como:

* utente tem de existir;
* utente não pode estar removido;
* utente tem de estar operacional;
* mensagens de bloqueio por dependências abertas.

---

## 14. Módulos de domínio

## 14.1 `auth`

Responsável por:

* login;
* logout;
* sessão atual;
* validação JWT;
* construção do utilizador público.

Não gere utilizadores. A gestão de utilizadores pertence a `admin-users`.

---

## 14.2 `admin-users`

Responsável por:

* listar utilizadores;
* criar utilizadores;
* editar nome/email/role;
* alterar password;
* ativar/desativar utilizadores;
* remover utilizadores sem histórico associado.

Este módulo é exclusivo para `ADMIN`.

Regras arquiteturais importantes:

* password é sempre guardada como hash;
* utilizador não pode alterar estado da própria conta;
* utilizador não pode remover a própria conta;
* utilizador com histórico de auditoria não deve ser removido;
* respostas nunca expõem password/hash.

---

## 14.3 `utentes`

Responsável por:

* criar utentes;
* listar utentes;
* consultar detalhe;
* arquivar;
* reativar;
* remover por soft delete quando não existem dependências.

Este módulo é central porque quase todos os outros domínios dependem de `Utente`.

Tem um ficheiro extra:

```txt
utentes.guards.js
```

Este ficheiro é reutilizado por:

* receitas;
* sem-receita;
* extras;
* medicação habitual;
* pedidos.

---

## 14.4 `medicacao-habitual`

Responsável por:

* listar medicação habitual de um utente;
* criar medicação habitual;
* impedir duplicados por medicamento normalizado;
* remover item específico;
* remover toda a medicação habitual do utente.

Este módulo não representa stock nem disponibilidade. Serve como apoio operacional e sugestão/autocomplete para outros fluxos.

---

## 14.5 `receitas`

Responsável por:

* listar linhas de receita ativas de um utente;
* criar receitas com linhas;
* remover linhas quando permitido;
* acionar regularizações pendentes quando uma nova receita cobre Vendas Suspensas.

Arquiteturalmente, este módulo interage fortemente com:

```txt
regularizacoes.repository.js
extras.repository.js
utentes.repository.js
```

A criação de receitas usa transação, porque pode:

* criar receita;
* criar várias linhas;
* aplicar regularizações pendentes;
* atualizar quantidades dispensadas;
* resolver Vendas Suspensas abertas;
* criar alertas de regularização parcial/total.

---

## 14.6 `sem-receita`

Representa medicamentos não sujeitos a receita médica.

Responsável por:

* listar medicamentos disponíveis por utente;
* criar novo registo;
* incrementar quantidade se o medicamento já existir;
* remover quando não há pedidos pendentes associados.

A arquitetura deste módulo é simples e serve como bom exemplo de separação controller/service/repository/mapper/validator.

---

## 14.7 `extras`

Representa tecnicamente as **Vendas Suspensas**.

Responsável por:

* listar Vendas Suspensas em aberto;
* criar Venda Suspensa;
* impedir duplicados em aberto;
* impedir Venda Suspensa quando já existe receita ativa com quantidade disponível;
* considerar `receitaDraftItems` ao validar disponibilidade;
* remover quando ainda não está associada a pedidos pendentes.

Nota de nomenclatura:

* nome técnico interno: `Extra`;
* nome funcional/UI: `Venda Suspensa`.

---

## 14.8 `pedidos`

Responsável pelo lado Santa Casa dos pedidos.

Inclui:

* criação de pedidos;
* consulta por ID;
* cancelamento antes de validação;
* histórico;
* lista de pendentes.

Este módulo valida disponibilidade antes de criar um pedido.

Também aplica a regra FEFO para linhas de receita:

```txt
First Expired, First Out
```

Ou seja: para o mesmo medicamento, deve ser usada primeiro a linha com validade mais próxima.

Ao criar pedido, também pode acionar alerta operacional `PEDIDO_ENVIADO` para a Farmácia.

---

## 14.9 `farmacia`

Responsável pelo lado Farmácia dos pedidos.

Inclui:

* listar pedidos;
* consultar detalhe de pedido;
* validar pedido;
* rejeitar pedido;
* dashboard da Farmácia.

A validação do pedido é uma das operações mais críticas do backend.

Usa transação porque pode:

* validar pedido;
* validar itens;
* cancelar itens expirados;
* criar dispensas;
* incrementar `quantidadeDispensada` em linhas de receita;
* decrementar quantidade de medicamentos não sujeitos a receita médica;
* criar regularizações para Vendas Suspensas;
* atualizar estados de itens;
* atualizar estado global do pedido.

---

## 14.10 `regularizacoes`

Responsável por:

* listar regularizações pendentes;
* listar histórico de regularizações;
* devolver sinal/dashboard;
* aplicar regularizações pendentes a linhas de receita.

As rotas deste módulo são montadas em dois contextos:

```txt
/api/santacasa/regularizacoes
/api/farmacia/regularizacoes
```

A separação de acesso é feita no router global:

* `SANTACASA` acede ao contexto Santa Casa;
* `FARMACIA` acede ao contexto Farmácia;
* `ADMIN` pode aceder a ambos.

O ponto mais importante é:

```txt
applyPendingToLinhasTx
```

Esta função é usada dentro da criação de receitas para regularizar Vendas Suspensas automaticamente quando aparece receita compatível.

---

## 14.11 `alertas`

Responsável por alertas operacionais da Farmácia.

Inclui:

* listar alertas ativos;
* fechar alerta individual;
* fechar todos os alertas ativos;
* criar alerta de pedido enviado;
* criar alerta de regularização parcial;
* criar alerta de regularização total.

Tipos principais:

```txt
PEDIDO_ENVIADO
REGULARIZACAO_PARCIAL
REGULARIZACAO_TOTAL
```

Apenas a Farmácia/Admin consulta alertas diretamente, porque os alertas atuais têm destino operacional `FARMACIA`.

---

## 14.12 `santa-casa`

Módulo agregado para dashboard/sinais da Santa Casa.

Responsável por devolver contadores gerais sobre:

* utentes;
* receitas;
* medicamentos não sujeitos a receita médica;
* Vendas Suspensas;
* pedidos;
* regularizações;
* último pedido criado.

Este módulo é agregador. Não deve conter regras transacionais profundas.

---

## 14.13 `manutencao`

Responsável por expor ações administrativas sobre jobs.

Inclui:

* listar jobs disponíveis;
* preview de execução;
* execução manual.

Este módulo é exclusivo para `ADMIN`.

A camada de manutenção permite executar jobs sem depender exclusivamente do cron e permite pré-visualizar impacto antes de operações destrutivas.

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
MedicacaoHabitual
Receita
ReceitaLinha
SemReceita
Extra
Pedido
PedidoItem
Dispensa
RegularizacaoExtra
RegularizacaoEvento
AlertaOperacional
AlertaOperacionalDismiss
```

### 15.1 Relação conceptual

```txt
Utente
├── MedicacaoHabitual
│
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
├── PedidoItem
│   └── Pedido
│
└── RegularizacaoExtra

Pedido
├── PedidoItem
├── RegularizacaoExtra
└── AlertaOperacional

AlertaOperacional
└── AlertaOperacionalDismiss
```

### 15.2 Auditoria por utilizador

`User` está associado a:

* pedidos validados;
* itens validados;
* pedidos rejeitados;
* itens rejeitados;
* pedidos cancelados, quando aplicável;
* utentes arquivados;
* alertas fechados por utilizador.

Isto permite manter histórico de ações críticas.

---

## 16. Estados principais

### 16.1 `PedidoStatus`

```txt
PENDENTE
VALIDADO
REJEITADO
CANCELADO
```

### 16.2 `PedidoItemStatus`

```txt
PENDENTE
VALIDADO
REJEITADO
CANCELADO
CANCELADO_POR_EXPIRACAO
```

### 16.3 `PedidoItemTipo`

```txt
COM_RECEITA
SEM_RECEITA
EXTRA
```

### 16.4 `LinhaReceitaStatus`

```txt
ATIVA
EXPIRADA
```

### 16.5 `ExtraStatus`

```txt
PENDENTE
PARCIALMENTE_REGULARIZADO
REGULARIZADO
EXPIRADO
```

### 16.6 `RegularizacaoStatus`

```txt
PENDENTE
PARCIALMENTE_REGULARIZADO
REGULARIZADO
```

### 16.7 `UtenteStatus`

```txt
ATIVO
ARQUIVADO
```

### 16.8 `UserRole`

```txt
SANTACASA
FARMACIA
ADMIN
```

### 16.9 Alertas operacionais

```txt
PEDIDO_ENVIADO
REGULARIZACAO_PARCIAL
REGULARIZACAO_TOTAL
```

Destino atual:

```txt
FARMACIA
```

---

## 17. Prisma Client

O Prisma Client é centralizado em:

```txt
src/db/prisma.js
```

Este ficheiro:

* cria uma única instância de `PrismaClient`;
* usa a `DATABASE_URL` do ambiente;
* define logs diferentes por ambiente;
* reutiliza a instância em desenvolvimento via `global.__PRISMA_CLIENT__`;
* exporta `disconnectPrisma`.

### 17.1 Motivo da instância global em desenvolvimento

Em desenvolvimento, ferramentas como `nodemon` podem recarregar ficheiros várias vezes.

Sem reutilização global, cada reload pode criar nova ligação à base de dados.

Isto pode causar:

* excesso de conexões;
* warnings;
* comportamento instável.

---

## 18. Transações

Operações críticas usam `prisma.$transaction`.

Isto é obrigatório quando uma ação altera várias tabelas e precisa de consistência.

Exemplos atuais:

| Operação              | Motivo da transação                                                        |
| --------------------- | -------------------------------------------------------------------------- |
| Criar pedido          | Criar pedido + múltiplos itens                                             |
| Validar pedido        | Atualizar pedido, itens, dispensas, quantidades e regularizações           |
| Rejeitar pedido       | Atualizar pedido e itens em conjunto                                       |
| Cancelar pedido       | Atualizar pedido e itens pendentes                                         |
| Criar receita         | Criar receita, linhas, regularizações, alertas e resolver Vendas Suspensas |
| Purge histórico       | Apagar/desvincular entidades relacionadas                                  |
| Expiração de receitas | Expirar linhas e cancelar itens/pedidos afetados                           |

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
alertas.mappers.js
medicacaoHabitual.mappers.js
```

Os DTOs servem para:

* controlar o contrato da API;
* proteger dados sensíveis;
* facilitar consumo pelo frontend;
* incluir campos calculados;
* normalizar estruturas repetidas.

### Regra recomendada

Não devolver:

* `passwordHash`;
* token JWT no JSON;
* campos internos sensíveis;
* entidades Prisma completas sem necessidade.

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

* mapear erros Prisma conhecidos;
* devolver resposta JSON consistente;
* esconder detalhes sensíveis em produção;
* fazer logging em desenvolvimento.

### 20.1 Mapeamento Prisma

| Código Prisma | Resposta HTTP | Código API               |
| ------------- | ------------: | ------------------------ |
| `P2002`       |           409 | `UNIQUE_VIOLATION`       |
| `P2025`       |           404 | `NOT_FOUND`              |
| `P2003`       |           409 | `FOREIGN_KEY_CONSTRAINT` |
| Outros        |           400 | `PRISMA_ERROR`           |

### 20.2 Formato de erro

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

Rotas inexistentes são tratadas por:

```txt
src/middlewares/notFoundHandler.js
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

### 21.1 `receitaExpiry.job.js`

Responsável por:

* encontrar linhas de receita ativas expiradas;
* marcar linhas como `EXPIRADA`;
* cancelar itens pendentes afetados por essas linhas;
* marcar itens como `CANCELADO_POR_EXPIRACAO`;
* marcar pedidos como `CANCELADO` quando aplicável.

Regra importante:

* validade igual ao dia atual não deve expirar nesse dia;
* só validade anterior ao dia funcional atual deve ser expirada.

Agenda padrão:

```txt
CRON_DAILY_03H
```

### 21.2 `higiene.job.js`

Responsável por:

* procurar utentes removidos há mais de X meses;
* marcar como inválidos por rotina de higiene;
* opcionalmente anonimizar, se permitido por configuração;
* manter idempotência através de marcador funcional.

Agenda padrão:

```txt
CRON_MONTHLY_03H
```

### 21.3 `purgeHistory.job.js`

Responsável por:

* remover histórico antigo de pedidos fechados;
* remover regularizações concluídas antigas;
* apagar entidades dependentes na ordem correta;
* desvincular regularizações de pedidos quando necessário;
* manter idempotência em execuções repetidas.

Agenda padrão:

```txt
CRON_MONTHLY_03H
```

### 21.4 Proteção contra registo duplicado

Cada job usa uma flag global para evitar múltiplos registos no mesmo processo:

```txt
global.__RECEITAS_EXPIRY_JOB_REGISTERED__
global.__HIGIENE_JOB_REGISTERED__
global.__PURGE_HISTORY_JOB_REGISTERED__
```

### 21.5 Limitação arquitetural dos jobs

Os jobs correm no mesmo processo da API.

Isto é aceitável para uma instância única.

Para produção multi-instância, considerar:

* scheduler externo;
* worker dedicado;
* fila;
* lock distribuído na base de dados.

---

## 22. Módulo de manutenção

O módulo `manutencao` permite executar jobs manualmente via API.

Exemplos de ações suportadas:

* preview de expiração de receitas;
* execução da expiração;
* preview de higiene;
* execução de higiene;
* preview de limpeza de histórico;
* execução de limpeza de histórico.

Esta camada é importante porque evita depender exclusivamente do cron.

Também permite validar impactos antes de executar rotinas destrutivas.

Rotas inexistentes de job ou ação devem devolver `404`.

Parâmetros inválidos, como `offsetMonths` inválido, devem devolver `400`.

---

## 23. Segurança

Principais decisões de segurança:

* passwords com bcrypt;
* JWT assinado com segredo obrigatório;
* token em cookie HTTP-only;
* cookie seguro obrigatório em produção;
* CORS restrito a `ALLOWED_ORIGINS`;
* proteção de origem para operações de escrita;
* rate limit no login;
* security headers HTTP com `helmet`;
* `X-Request-Id` em todas as respostas;
* request ID nos logs de erro;
* roles aplicadas por prefixo de rota;
* erro genérico em login inválido;
* não exposição de `passwordHash`;
* password mínima de utilizadores com 10 caracteres;
* bloqueio de alteração da própria role pelo ADMIN autenticado;
* validação de utilizador ativo em sessão;
* bloqueio de utilizadores inativos.

### Pontos a melhorar no futuro

* substituir rate limit em memória por Redis em produção multi-instância;
* adicionar logs estruturados persistentes;
* adicionar CSRF token se o contexto de deployment exigir proteção adicional.

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

### Listagem moderna

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

### Listagem antiga ainda existente

Alguns módulos antigos devolvem:

```json
{
  "rows": [],
  "total": 0,
  "params": {}
}
```

ou:

```json
{
  "data": {
    "rows": [],
    "total": 0,
    "params": {}
  }
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

### Regra futura

Ao evoluir, preferir o padrão:

```txt
data + meta + params
```

para listagens paginadas.

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

### Convenções atuais

* `skip` começa em `0`.
* `take` tem limite máximo por módulo.
* Alguns módulos aceitam `page/pageSize`.
* Em `admin-users`, `skip/take` têm prioridade sobre `page/pageSize`.
* Queries inválidas devem devolver `400 BAD_REQUEST`.

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

* medicação habitual;
* Vendas Suspensas;
* receitas;
* regularizações;
* regra FEFO por medicamento.

Também existe:

```txt
cleanId(value)
```

Usado para normalizar IDs recebidos em payloads ou queries.

---

## 27. Utilitários de data

Os utilitários de data vivem em:

```txt
src/shared/utils/date.js
```

Funções principais:

```txt
getStartOfDay
isDateBeforeToday
```

Responsabilidades:

* comparar datas por dia funcional;
* evitar que validade igual ao dia atual seja tratada como expirada;
* apoiar validações de receitas e jobs.

Regra arquitetural:

> Sempre que a comparação for por validade diária, evitar comparar apenas `Date.now()` diretamente. Usar helpers por dia funcional.

---

## 28. Seed

O seed está em:

```txt
prisma/seed.js
```

Cria/atualiza utilizadores iniciais:

* administrador;
* utilizador Santa Casa;
* utilizador Farmácia.

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

## 29. Testes automatizados

A suite de testes está organizada em:

```txt
tests/
├── e2e/
├── fixtures/
├── helpers/
├── integration/
└── unit/
```

### 29.1 Vitest

Configuração principal:

```txt
vitest.config.mjs
```

A configuração atual privilegia estabilidade:

```txt
pool: threads
fileParallelism: false
maxWorkers: 1
minWorkers: 1
sequence.concurrent: false
sequence.shuffle: false
```

Isto evita instabilidade em testes E2E que partilham base de dados e sessão.

### 29.2 Helpers de teste

Helpers principais:

```txt
tests/helpers/app.js
tests/helpers/auth.js
```

Responsabilidades:

* criar app de teste sem abrir servidor HTTP real;
* criar agents autenticados;
* reutilizar login por role.

### 29.3 Fixtures

Fixtures principais:

```txt
tests/fixtures/users.fixture.js
tests/fixtures/utentes.fixture.js
```

Responsabilidades:

* reutilizar credenciais seed;
* gerar utentes únicos para testes.

### 29.4 Testes unitários

Cobrem principalmente:

* validators;
* mappers;
* utils.

Áreas cobertas:

```txt
adminUsers.validators
auth.validators
extras.validators
farmacia.validators
pedidos.validators
receitas.validators
regularizacoes.validators
semReceita.validators
utentes.validators

extras.mappers
pedidos.mappers
receitas.mappers
regularizacoes.mappers
semReceita.mappers
utentes.mappers

date
normalize
pagination
```

### 29.5 Testes de integração

Cobrem jobs com efeitos reais em base de dados:

```txt
receitaExpiry.job
higiene.job
purgeHistory.job
```

Incluem:

* preview;
* run;
* efeitos reais nas entidades;
* idempotência;
* proteção contra expirar validade igual ao dia atual.

### 29.6 Testes E2E

Cobrem os principais fluxos HTTP:

```txt
auth.e2e.test.js
adminUsers.e2e.test.js
alertas.e2e.test.js
extras.e2e.test.js
farmacia.e2e.test.js
farmaciaPedidos.e2e.test.js
manutencao.e2e.test.js
medicacaoHabitual.e2e.test.js
pedidos.e2e.test.js
receitas.e2e.test.js
regularizacoes.e2e.test.js
santacasa.e2e.test.js
semReceita.e2e.test.js
utentes.e2e.test.js
```

Cobrem:

* autenticação;
* permissões;
* CRUDs principais;
* pedidos;
* validação/rejeição;
* histórico;
* regularizações;
* alertas;
* jobs;
* erros funcionais;
* casos de conflito.

### 29.7 Estado atual dos testes

A suite está considerada fechada por agora.

Foram validados:

```bash
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm run test:all
npm run validate
```

Novos testes devem ser adicionados apenas quando existir:

* regra funcional nova;
* endpoint novo;
* alteração de payload;
* refatoração com risco;
* bug real;
* regressão encontrada no frontend.

---

## 30. Comandos principais

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
npm run test
```

Executa a suite de testes configurada.

```bash
npm run test:unit
```

Executa testes unitários.

```bash
npm run test:integration
```

Executa testes de integração.

```bash
npm run test:e2e
```

Executa testes E2E.

```bash
npm run test:all
```

Executa unitários, integração e E2E.

```bash
npm run validate
```

Executa `test:all` (unitários, integração e E2E) e a auditoria de dependências. Coverage não integra este comando; é executado separadamente via `npm run test:coverage`, incluindo num passo próprio no CI.

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

## 31. Decisões arquiteturais atuais

### 31.1 Backend modular por domínio

O backend não está organizado por tipo técnico global, mas sim por domínio.

Boa decisão.

Isto facilita:

* manutenção;
* leitura;
* evolução gradual;
* isolamento de regras por área.

---

### 31.2 Services como camada de regra de aplicação

As regras mais importantes estão nos services.

Boa decisão.

Evita controllers gordos e repositories com regras HTTP.

---

### 31.3 Repositories com Prisma encapsulado

Boa decisão.

Permite trocar queries e selects sem espalhar Prisma por controllers.

---

### 31.4 DTOs explícitos

Boa decisão.

Evita devolver entidades completas e reduz acoplamento com o schema da base de dados.

---

### 31.5 Jobs integrados no processo principal

Solução aceitável para projeto pequeno/médio e instância única.

Risco futuro:

* se o backend correr em múltiplas instâncias, cada instância pode tentar executar jobs;
* as flags globais só protegem dentro do mesmo processo.

Para produção multi-instância, considerar:

* scheduler externo;
* fila;
* worker dedicado;
* lock distribuído na base de dados.

---

### 31.6 Testes E2E como proteção de contrato

A suite E2E funciona como proteção principal contra regressões de contrato HTTP e regras de negócio integradas.

Boa decisão para o estado atual do projeto.

Não deve ser substituída por testes unitários isolados nos fluxos críticos. O ideal é manter ambos:

* unitários para validação/mappers/utils;
* E2E para fluxos reais;
* integração para jobs.

---

## 32. Dívida técnica / melhorias futuras

### 32.1 Duplicação de selects

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

### 32.2 Duplicação de parsing de paginação

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

### 32.3 Datas e timezone

O backend usa `Date` nativo e define `process.env.TZ`.

Isto funciona, mas exige cuidado com:

* datas recebidas do frontend;
* filtros `from/to`;
* jobs às 03:00;
* comparação de validade;
* validade igual ao dia atual.

Melhoria futura:

* padronizar entrada/saída de datas em ISO;
* documentar claramente timezone esperado;
* continuar a usar helpers de data por dia funcional;
* eventualmente usar uma biblioteca como `date-fns` ou `luxon` se a complexidade aumentar.

---

### 32.4 Rate limit em memória

Funciona em desenvolvimento e numa instância única.

Não é suficiente para produção distribuída.

---

### 32.5 Jobs no processo da API

Funciona bem para instância única.

Em produção com múltiplas instâncias, deve ser revisto.

---

### 32.6 Formatos de resposta antigos e novos

Ainda existem pequenas diferenças entre módulos:

* alguns devolvem `data/meta/params`;
* outros devolvem `rows/total/params`;
* outros devolvem `data.rows`.

Melhoria futura:

* padronizar gradualmente para `data/meta/params`.

---

## 33. Regras para futuras alterações

Ao criar ou alterar funcionalidades, respeitar estas regras.

### 33.1 Não colocar regra de negócio no controller

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

### 33.2 Não aceder ao Prisma diretamente fora de repositories/jobs

Exceções aceitáveis:

* jobs;
* scripts;
* seed;
* testes de integração/E2E;
* casos muito específicos e justificados.

---

### 33.3 Não devolver entidades Prisma completas sem mapper

Usar mapper quando:

* há relações;
* há campos sensíveis;
* há campos calculados;
* a resposta é consumida pelo frontend.

---

### 33.4 Usar transação quando houver múltiplas alterações dependentes

Exemplos:

* pedido + itens;
* validação + dispensa + atualização de stock;
* receita + regularizações + alertas;
* limpeza de histórico.

---

### 33.5 Validar input antes de chamar repository

Validação deve acontecer antes de tocar na base de dados quando possível.

---

### 33.6 Manter linguagem funcional correta

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

### 33.7 Atualizar testes com alterações funcionais

Sempre que houver:

* endpoint novo;
* payload novo;
* regra nova;
* alteração de estado;
* alteração de permissões;
* alteração em job;

deve ser avaliada a atualização da suite de testes.

---

## 34. Fluxo resumido de criação e validação de pedido

```txt
Santa Casa cria pedido
└── pedidos.controller.create
    └── pedidos.service.createPedido
        ├── valida payload
        ├── valida utente operacional
        ├── valida disponibilidade por tipo de item
        ├── aplica FEFO se for receita
        ├── cria alerta PEDIDO_ENVIADO
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
                ├── cancela itens expirados se aplicável
                ├── cria dispensas se COM_RECEITA
                ├── atualiza quantidadeDispensada
                ├── decrementa SemReceita se SEM_RECEITA
                ├── cria RegularizacaoExtra se EXTRA
                ├── atualiza Extra
                ├── valida PedidoItems
                └── valida/cancela Pedido conforme resultado
```

---

## 35. Fluxo resumido de regularização automática

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
            ├── cria eventos de regularização
            ├── atualiza quantidadeDispensada
            ├── cria alertas REGULARIZACAO_PARCIAL/TOTAL
            ├── procura linhas criadas
            └── resolve Vendas Suspensas abertas
```

---

## 36. Fluxo resumido de alertas operacionais

```txt
Evento funcional
├── Pedido criado
│   └── cria AlertaOperacional PEDIDO_ENVIADO
│
└── Receita regulariza Venda Suspensa
    ├── se parcial: cria REGULARIZACAO_PARCIAL
    └── se total: cria REGULARIZACAO_TOTAL
```

Consulta:

```txt
Farmácia consulta alertas
└── alertas.controller.list
    └── alertas.service.listActiveForUser
        └── alertas.repository.findActiveForUser
            └── alertas.mappers.toAlertaDTO
```

Fecho:

```txt
Farmácia fecha alerta
└── cria registo de dismiss para o utilizador atual
```

Fechar alertas não altera estado funcional de pedidos, receitas ou regularizações.

---

## 37. Fluxo resumido de expiração de receitas

```txt
Job diário
└── receitaExpiry.job.runOnce
    └── transação:
        ├── procura ReceitaLinha ATIVA com validade anterior ao dia atual
        ├── procura pedidos pendentes afetados
        ├── marca linhas como EXPIRADA
        ├── cancela itens pendentes afetados
        └── marca pedidos como CANCELADO quando aplicável
```

Regra importante:

```txt
validade igual ao dia atual não expira nesse dia
```

---

## 38. Avaliação geral da arquitetura atual

A arquitetura atual está bem encaminhada e encontra-se estável para a fase atual do projeto.

Pontos fortes:

* separação clara por domínio;
* controllers finos;
* services com regras de aplicação;
* repositories com Prisma encapsulado;
* mappers explícitos;
* guards reutilizáveis;
* autenticação e roles bem separadas;
* jobs com preview/run;
* uso de transações em operações críticas;
* boas validações de segurança em ambiente;
* suite de testes unitários, integração e E2E robusta;
* cobertura de alertas e regularizações reforçada;
* documentação técnica separada por tema.

Pontos a melhorar futuramente:

* duplicação de parsers e selects;
* rate limit em memória;
* jobs no mesmo processo da API;
* alguma inconsistência entre formatos de resposta antigos e novos;
* ausência de logs estruturados/request ID;
* possível necessidade futura de scheduler externo em produção multi-instância.

---

## 39. Estado arquitetural atual

Estado recomendado:

```txt
Backend funcionalmente estável.
Testes fechados por agora.
Documentação principal atualizada.
Próximas alterações devem ser incrementais e acompanhadas por testes quando houver risco funcional.
```

Não é recomendado fazer refatorações grandes no backend neste momento sem necessidade concreta.

Prioridade atual recomendada:

1. Manter backend estável.
2. Fazer commit do estado atual.
3. Continuar frontend ou documentação complementar.
4. Só voltar ao backend para bugs, ajustes reais ou novas regras funcionais.
