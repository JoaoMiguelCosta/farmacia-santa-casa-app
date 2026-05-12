# Backend — Farmácia Santa Casa V2

Documentação técnica do backend da aplicação **Farmácia Santa Casa V2**.

Este backend foi criado do zero com uma arquitetura modular, separando regras de negócio, rotas, controllers, serviços, repositórios, jobs automáticos e documentação.

---

## 1. Visão geral

O backend gere o fluxo entre duas áreas principais:

- **Santa Casa**
  - Gestão de utentes
  - Receitas
  - Medicamentos sem receita
  - Extras / venda suspensa
  - Criação de pedidos

- **Farmácia**
  - Listagem de pedidos
  - Validação de pedidos
  - Rejeição de pedidos
  - Regularizações
  - Histórico
  - Dashboard
  - Manutenção

---

## 2. Stack técnica

| Área | Tecnologia |
|---|---|
| Runtime | Node.js |
| Framework HTTP | Express |
| ORM | Prisma |
| Base de dados | PostgreSQL |
| Jobs | node-cron |
| Configuração | dotenv |
| Ambiente dev | nodemon |
| Testes atuais | Scripts Node.js com chamadas HTTP e Prisma |

---

## 3. Estrutura geral do projeto

```txt
Farmacia-Santacasa-v2/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── scripts/
│   │   ├── test-current-api.js
│   │   ├── test-receita-expiry-job.js
│   │   ├── test-higiene-job.js
│   │   └── test-purge-history-job.js
│   │
│   ├── src/
│   │   ├── app/
│   │   ├── config/
│   │   ├── db/
│   │   ├── jobs/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   ├── routes/
│   │   └── shared/
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── docs/
│   ├── API_ROUTES.md
│   ├── BACKEND.md
│   ├── BUSINESS_RULES.md
│   └── TESTING.md
│
└── frontend/
```

---

## 4. Estrutura interna do backend

```txt
backend/src/
├── app/
│   ├── app.js
│   └── server.js
│
├── config/
│   └── env.js
│
├── db/
│   └── prisma.js
│
├── jobs/
│   ├── index.js
│   ├── receitaExpiry.job.js
│   ├── higiene.job.js
│   └── purgeHistory.job.js
│
├── middlewares/
│   ├── cors.js
│   ├── errorHandler.js
│   ├── notFoundHandler.js
│   └── requestLogger.js
│
├── modules/
│   ├── extras/
│   ├── farmacia/
│   ├── manutencao/
│   ├── pedidos/
│   ├── receitas/
│   ├── regularizacoes/
│   ├── sem-receita/
│   └── utentes/
│
├── routes/
│   ├── index.js
│   ├── santacasa.routes.js
│   └── farmacia.routes.js
│
└── shared/
    ├── errors/
    └── utils/
```

---

## 5. Princípio de arquitetura

O backend usa uma arquitetura em camadas.

Fluxo típico:

```txt
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL
```

---

## 6. Responsabilidade de cada camada

### Routes

Responsáveis por:

- definir URLs;
- definir método HTTP;
- ligar rota ao controller;
- aplicar `asyncHandler`.

Exemplo:

```txt
GET /api/santacasa/utentes
POST /api/farmacia/pedidos/:pedidoId/validar
```

---

### Controllers

Responsáveis por:

- receber `req`;
- chamar o service;
- devolver resposta HTTP;
- não conter regra de negócio pesada.

Não devem:

- aceder diretamente ao Prisma;
- validar regras complexas;
- conter lógica de negócio relevante.

---

### Services

Responsáveis por:

- aplicar regras de negócio;
- validar permissões lógicas;
- coordenar repositórios;
- decidir se uma operação pode ou não acontecer.

Aqui ficam regras como:

- impedir utente duplicado;
- impedir apagar linha usada;
- validar saldo disponível;
- criar pedidos;
- validar pedidos;
- rejeitar pedidos.

---

### Repositories

Responsáveis por:

- aceder à base de dados;
- usar Prisma;
- fazer queries;
- fazer transações quando necessário.

Não devem conter lógica de negócio pesada.

---

### Validators

Responsáveis por:

- validar formatos;
- normalizar payloads;
- validar query params;
- lançar erros `BAD_REQUEST`.

---

### Mappers

Responsáveis por:

- transformar dados internos em DTOs;
- calcular campos derivados;
- esconder detalhe interno do Prisma.

Exemplos:

- `quantidadeRestante`
- `quantidadeReservadaPendente`
- resposta formatada de pedidos
- resposta formatada de regularizações

---

## 7. Módulos principais

## 7.1 Utentes

Pasta:

```txt
backend/src/modules/utentes/
```

Responsável por:

- criar utentes;
- listar utentes;
- obter utente por ID;
- remover logicamente utente.

Regras principais:

- `numero9` obrigatório.
- `numero9` deve ter 9 dígitos.
- `nome` obrigatório.
- Não permite duplicar utente ativo por número.
- Não permite duplicar utente ativo por nome.
- Remoção é lógica, não física.
- Não remove utente com pendências.

Rotas principais:

```txt
GET    /api/santacasa/utentes
GET    /api/santacasa/utentes/:utenteId
POST   /api/santacasa/utentes
DELETE /api/santacasa/utentes/:utenteId
```

---

## 7.2 Sem Receita

Pasta:

```txt
backend/src/modules/sem-receita/
```

Responsável por:

- criar medicamentos sem receita;
- listar medicamentos sem receita disponíveis;
- remover medicamentos sem receita ainda não usados.

Regras principais:

- utente tem de existir;
- utente não pode estar removido;
- medicamento obrigatório;
- quantidade maior que 0;
- não remove se já estiver associado a pedidos.

Rotas principais:

```txt
GET    /api/santacasa/utentes/:utenteId/sem-receita
POST   /api/santacasa/utentes/:utenteId/sem-receita
DELETE /api/santacasa/utentes/:utenteId/sem-receita/:semReceitaId
```

---

## 7.3 Receitas

Pasta:

```txt
backend/src/modules/receitas/
```

Responsável por:

- criar receitas;
- criar linhas de receita;
- listar linhas disponíveis;
- remover linhas ainda não usadas;
- disparar auto-regularização quando entra receita compatível.

Regras principais:

- `numero19` deve ter 19 dígitos;
- `pinAcesso6` deve ter 6 dígitos;
- `pinOpcao4` deve ter 4 dígitos;
- validade tem de ser futura;
- não permite duplicar `numero19`;
- não permite repetir medicamento na mesma receita;
- lista apenas linhas com saldo disponível.

Rotas principais:

```txt
GET    /api/santacasa/utentes/:utenteId/receitas
POST   /api/santacasa/utentes/:utenteId/receitas
DELETE /api/santacasa/utentes/:utenteId/receitas/linhas/:linhaId
```

---

## 7.4 Extras

Pasta:

```txt
backend/src/modules/extras/
```

Responsável por:

- criar Extra / venda suspensa;
- listar Extras em aberto;
- remover Extras ainda não usados.

Regras principais:

- não cria Extra se existir receita ativa com saldo para o mesmo medicamento;
- não duplica Extra em aberto;
- quantidade tem de ser maior que 0;
- não remove Extra já associado a pedidos.

Rotas principais:

```txt
GET    /api/santacasa/utentes/:utenteId/extras
POST   /api/santacasa/utentes/:utenteId/extras
DELETE /api/santacasa/utentes/:utenteId/extras/:extraId
```

---

## 7.5 Pedidos

Pasta:

```txt
backend/src/modules/pedidos/
```

Responsável por:

- criar pedidos Santa Casa;
- obter pedido por ID;
- listar histórico de pedidos.

Tipos de item aceites:

```txt
COM_RECEITA
SEM_RECEITA
EXTRA
```

Aliases internos aceites:

```txt
RECEITA
RECEITA_LINHA
```

Regras principais:

- pedido precisa de pelo menos um item;
- cada item precisa de `utenteId`, `tipo`, `id` e `quantidade`;
- item tem de pertencer ao utente;
- não pode ultrapassar saldo disponível;
- pedido começa como `PENDENTE`;
- itens começam como `PENDENTE`.

Rotas principais:

```txt
POST /api/santacasa/pedidos
GET  /api/santacasa/pedidos/:pedidoId
GET  /api/santacasa/pedidos/historico
```

---

## 7.6 Farmácia

Pasta:

```txt
backend/src/modules/farmacia/
```

Responsável por:

- listar pedidos;
- validar pedidos;
- rejeitar pedidos;
- dashboard.

Rotas principais:

```txt
GET  /api/farmacia/pedidos
POST /api/farmacia/pedidos/:pedidoId/validar
POST /api/farmacia/pedidos/:pedidoId/rejeitar
GET  /api/farmacia/dashboard/sinais
```

---

## 7.7 Regularizações

Pasta:

```txt
backend/src/modules/regularizacoes/
```

Responsável por:

- listar regularizações pendentes;
- listar histórico de regularizações;
- devolver sinal/resumo;
- aplicar regularização automática quando entra receita compatível.

Rotas principais:

```txt
GET /api/farmacia/regularizacoes/pendentes
GET /api/farmacia/regularizacoes/historico
GET /api/farmacia/regularizacoes/sinal
```

---

## 7.8 Manutenção

Pasta:

```txt
backend/src/modules/manutencao/
```

Responsável por:

- expor endpoints internos para jobs;
- preview de jobs;
- execução manual de jobs.

Rotas principais:

```txt
GET  /api/farmacia/manutencao/jobs
GET  /api/farmacia/manutencao/jobs/receita-expiry/preview
POST /api/farmacia/manutencao/jobs/receita-expiry/run
GET  /api/farmacia/manutencao/jobs/higiene/preview
POST /api/farmacia/manutencao/jobs/higiene/run
GET  /api/farmacia/manutencao/jobs/purge-history/preview
POST /api/farmacia/manutencao/jobs/purge-history/run
```

Todas exigem header:

```txt
x-maintenance-key
```

---

## 8. Jobs

Pasta:

```txt
backend/src/jobs/
```

Jobs atuais:

```txt
receitaExpiry.job.js
higiene.job.js
purgeHistory.job.js
```

---

## 8.1 receitaExpiry.job.js

Objetivo:

- expirar receitas vencidas;
- cancelar itens pendentes dessas receitas;
- cancelar pedidos totalmente afetados.

Corre por defeito:

```txt
todos os dias às 03:00
```

Cron:

```txt
0 3 * * *
```

Efeitos:

- `ReceitaLinha.status` passa para `EXPIRADA`;
- `PedidoItem.status` passa para `CANCELADO_POR_EXPIRACAO`;
- `Pedido.status` pode passar para `CANCELADO`.

---

## 8.2 higiene.job.js

Objetivo:

- marcar utentes removidos antigos como arquivados por higiene.

Corre por defeito:

```txt
dia 1 de cada mês às 03:00
```

Cron:

```txt
0 3 1 * *
```

Efeitos:

- mantém histórico;
- não apaga utentes;
- marca `invalidReason` com `[HIGIENE]`;
- pode anonimizar se configurado.

Anonimização só acontece se:

```env
HIGIENE_ANONYMIZE=true
ALLOW_HIGIENE_ANONYMIZE=true
```

---

## 8.3 purgeHistory.job.js

Objetivo:

- apagar histórico antigo fechado.

Corre por defeito:

```txt
dia 1 de cada mês às 03:00
```

Cron:

```txt
0 3 1 * *
```

Pode apagar:

- pedidos fechados antigos;
- itens desses pedidos;
- dispensas associadas;
- regularizações concluídas antigas;
- eventos dessas regularizações.

Não deve apagar:

- dados ativos;
- pedidos pendentes;
- regularizações pendentes;
- utentes ativos.

---

## 9. Configuração de ambiente

Ficheiro:

```txt
backend/.env
```

Exemplo seguro:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/farmacia_santacasa?schema=public"

NODE_ENV="development"
PORT=3001
TZ="Europe/Lisbon"

JSON_LIMIT="1mb"

MAINTENANCE_API_KEY="dev-maintenance-key"

ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"

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

## 10. Variáveis de ambiente

| Variável | Função |
|---|---|
| `DATABASE_URL` | URL de ligação ao PostgreSQL |
| `NODE_ENV` | Ambiente atual |
| `PORT` | Porta do backend |
| `TZ` | Timezone |
| `JSON_LIMIT` | Limite do body JSON |
| `MAINTENANCE_API_KEY` | Chave para rotas de manutenção |
| `ALLOWED_ORIGINS` | Origins permitidas para CORS |
| `ENABLE_HIGIENE` | Liga/desliga job de higiene |
| `ENABLE_PURGE_HISTORY` | Liga/desliga purge de histórico |
| `ENABLE_RECEITAS_EXPIRY` | Liga/desliga expiry de receitas |
| `HIGIENE_OFFSET_MONTHS` | Meses para higiene |
| `HIGIENE_ANONYMIZE` | Pede anonimização |
| `ALLOW_HIGIENE_ANONYMIZE` | Permite anonimização real |
| `PURGE_OFFSET_MONTHS` | Meses para purge |
| `CRON_MONTHLY_03H` | Cron mensal |
| `CRON_DAILY_03H` | Cron diário |

---

## 11. Segurança do `.env`

O ficheiro `.env` nunca deve ser commitado.

Deve estar no `.gitignore`.

Confirmar:

```bash
git check-ignore -v backend/.env
```

Confirmar que não está versionado:

```bash
git ls-files backend/.env
```

Se não devolver nada, está correto.

---

## 12. Scripts disponíveis

Ficheiro:

```txt
backend/package.json
```

Scripts principais:

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
  "job:receita-expiry": "node -e \"require('./src/jobs/receitaExpiry.job').runOnce().then(console.log).catch((e)=>{console.error(e);process.exit(1)})\"",
  "job:higiene": "node -e \"require('./src/jobs/higiene.job').runOnce().then(console.log).catch((e)=>{console.error(e);process.exit(1)})\"",
  "job:purge-history": "node -e \"require('./src/jobs/purgeHistory.job').runOnce().then(console.log).catch((e)=>{console.error(e);process.exit(1)})\""
}
```

---

## 13. Comandos de desenvolvimento

Instalar dependências:

```bash
npm --prefix backend install
```

Gerar Prisma Client:

```bash
npm --prefix backend run prisma:generate
```

Executar migrations:

```bash
npm --prefix backend run prisma:migrate
```

Abrir Prisma Studio:

```bash
npm --prefix backend run prisma:studio
```

Iniciar backend em desenvolvimento:

```bash
npm --prefix backend run dev
```

Iniciar backend em produção/local simples:

```bash
npm --prefix backend start
```

---

## 14. Testes

Testar fluxo principal da API:

```bash
npm --prefix backend run test:api
```

Testar job de receitas expiradas:

```bash
npm --prefix backend run test:receita-expiry
```

Testar job de higiene:

```bash
npm --prefix backend run test:higiene
```

Testar purge de histórico:

```bash
npm --prefix backend run test:purge-history
```

Executar todos manualmente:

```bash
npm --prefix backend run test:api
npm --prefix backend run test:receita-expiry
npm --prefix backend run test:higiene
npm --prefix backend run test:purge-history
```

---

## 15. Health checks

API geral:

```bash
curl "http://localhost:3001/api/health"
```

Santa Casa:

```bash
curl "http://localhost:3001/api/santacasa/health"
```

Farmácia:

```bash
curl "http://localhost:3001/api/farmacia/health"
```

A rota raiz não existe:

```txt
http://localhost:3001/
```

Resposta esperada:

```json
{
  "error": "ROUTE_NOT_FOUND",
  "message": "Rota não encontrada.",
  "path": "/"
}
```

Isto é normal porque a API começa em:

```txt
/api
```

---

## 16. Middleware

Middlewares principais:

```txt
cors
requestLogger
notFoundHandler
errorHandler
```

---

### CORS

Controla origens permitidas.

Configuração via:

```env
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
```

---

### Request Logger

Regista chamadas HTTP no terminal.

Exemplo:

```txt
2026-05-12T18:00:00.000Z [INFO] GET /api/health -> 200 3.1ms
```

---

### Not Found Handler

Devolve erro quando a rota não existe.

Formato:

```json
{
  "error": "ROUTE_NOT_FOUND",
  "message": "Rota não encontrada.",
  "path": "/rota/inexistente"
}
```

---

### Error Handler

Centraliza erros.

Formato:

```json
{
  "error": "ERROR_CODE",
  "message": "Mensagem legível."
}
```

---

## 17. Erros usados

| Código | Uso |
|---|---|
| `BAD_REQUEST` | Dados inválidos |
| `UNAUTHORIZED` | Falta chave/autorização |
| `FORBIDDEN` | Recurso não pertence ao utente |
| `NOT_FOUND` | Recurso inexistente |
| `CONFLICT` | Conflito de regra de negócio |
| `INTERNAL_ERROR` | Erro inesperado |

---

## 18. Fluxo principal completo

### 18.1 Criar utente

```txt
POST /api/santacasa/utentes
```

Resultado:

```txt
Utente ativo criado
```

---

### 18.2 Adicionar receita

```txt
POST /api/santacasa/utentes/:utenteId/receitas
```

Resultado:

```txt
Receita com linhas disponíveis
```

---

### 18.3 Adicionar medicamento sem receita

```txt
POST /api/santacasa/utentes/:utenteId/sem-receita
```

Resultado:

```txt
Medicamento disponível sem receita
```

---

### 18.4 Criar Extra

```txt
POST /api/santacasa/utentes/:utenteId/extras
```

Resultado:

```txt
Extra pendente criado
```

---

### 18.5 Criar pedido

```txt
POST /api/santacasa/pedidos
```

Resultado:

```txt
Pedido PENDENTE
```

---

### 18.6 Validar pedido

```txt
POST /api/farmacia/pedidos/:pedidoId/validar
```

Resultado:

```txt
Pedido VALIDADO
Dispensa criada
Sem receita debitado
Regularização criada
```

---

### 18.7 Criar receita compatível com Extra

```txt
POST /api/santacasa/utentes/:utenteId/receitas
```

Resultado:

```txt
Regularização automática
```

---

## 19. Cuidados importantes

### Não alterar diretamente a base de dados

Evitar fazer alterações manuais no Prisma Studio se isso quebrar regras de negócio.

Exemplo perigoso:

```txt
Alterar status de pedido diretamente sem atualizar itens
```

---

### Não apagar histórico manualmente

Histórico deve ser removido apenas por:

```txt
purgeHistory.job.js
```

---

### Não usar `--force` no Git sem confirmar

Evitar:

```bash
git push --force
```

Pode apagar trabalho remoto.

---

### Não commitar `.env`

Nunca fazer:

```bash
git add backend/.env
```

---

## 20. Estado atual do backend

Funcionalidades implementadas:

- Health checks
- Utentes
- Sem Receita
- Receitas
- Extras
- Pedidos Santa Casa
- Farmácia
- Validação
- Rejeição
- Regularizações automáticas
- Histórico de pedidos
- Histórico de regularizações
- Dashboard
- Jobs automáticos
- Manutenção com chave
- Testes por script
- Documentação inicial

---

## 21. Próximos passos recomendados

### Backend

- Adicionar autenticação real.
- Adicionar perfis de utilizador:
  - Santa Casa
  - Farmácia
  - Admin
- Substituir `x-maintenance-key` por autenticação protegida.
- Adicionar testes com framework dedicado.
- Preparar seed de desenvolvimento.
- Melhorar logging em produção.
- Preparar deploy.

### Frontend

- Criar Vite + React.
- Criar layout Santa Casa.
- Criar layout Farmácia.
- Criar cliente HTTP.
- Criar páginas:
  - Utentes
  - Receitas
  - Sem Receita
  - Extras
  - Criar Pedido
  - Pedidos Farmácia
  - Regularizações
  - Dashboard
  - Manutenção

---

## 22. Regra geral do backend

O backend deve manter sempre estas prioridades:

1. Consistência dos dados.
2. Preservação de histórico.
3. Validação antes de mutação.
4. Erros claros.
5. Separação de responsabilidades.
6. Código simples e legível.
7. Segurança antes de produção.