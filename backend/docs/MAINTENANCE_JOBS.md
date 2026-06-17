# MAINTENANCE_JOBS.md

Documentação dos jobs de manutenção do backend **Farmácia Santa Casa**.

Este ficheiro descreve os processos automáticos e manuais responsáveis por:

* expirar linhas de receita vencidas;
* cancelar itens/pedidos pendentes afetados por receitas expiradas;
* tratar utentes removidos antigos através da rotina de higiene;
* limpar histórico antigo de pedidos e regularizações;
* permitir preview e execução manual controlada por utilizadores `ADMIN`.

**Última atualização:** 2026-06-17
**Estado atual:** jobs implementados, endpoints protegidos, confirmação forte nos runs, testes de integração e E2E fechados por agora.

---

## 1. Estado atual

Existem três jobs principais:

| Job            | Ficheiro                        | Frequência padrão | Teste automatizado                                 |
| -------------- | ------------------------------- | ----------------: | -------------------------------------------------- |
| Receita Expiry | `src/jobs/receitaExpiry.job.js` |            diária | `tests/integration/jobs/receitaExpiry.job.test.js` |
| Higiene        | `src/jobs/higiene.job.js`       |            mensal | `tests/integration/jobs/higiene.job.test.js`       |
| Purge History  | `src/jobs/purgeHistory.job.js`  |            mensal | `tests/integration/jobs/purgeHistory.job.test.js`  |

Também existem testes E2E para permissões, previews, runs e validações de erro:

```txt id="96ql8u"
tests/e2e/manutencao.e2e.test.js
```

Comandos de validação executados e aprovados nesta fase:

```bash id="6r4o8q"
npm run test:unit -- --run
npm run test:integration -- --run
npm run test:e2e -- --run
npm run test:all
npm run validate
```

Estado recomendado:

```txt id="rn0nty"
A suite de manutenção está fechada por agora.
Adicionar novos testes apenas se houver nova regra, novo job, alteração de contrato ou bug real.
```

---

## 2. Objetivo dos jobs

Os jobs existem para manter a base de dados coerente ao longo do tempo, sem depender apenas de ações manuais dos utilizadores.

Aplicam regras de negócio importantes:

* receitas expiradas deixam de poder sustentar pedidos;
* pedidos pendentes afetados por expiração são cancelados automaticamente quando aplicável;
* utentes removidos antigos são marcados como tratados pela rotina de higiene;
* histórico fechado antigo pode ser eliminado;
* regularizações concluídas antigas podem ser purgadas;
* execuções administrativas podem ser pré-visualizadas antes de alterarem dados.

Qualquer alteração nestes jobs deve ser tratada como alteração sensível de domínio.

---

## 3. Registo dos jobs no arranque

O servidor arranca a partir de:

```txt id="ibcodk"
src/app/server.js
```

Durante o arranque, é chamada a função:

```js id="zvn97p"
registerJobs();
```

A função está em:

```txt id="qqqqey"
src/jobs/index.js
```

E regista os três jobs:

```js id="glw729"
registerReceitaExpiryJob();
registerHigieneJob();
registerPurgeHistoryJob();
```

### Regra importante

Os jobs só são registados quando o servidor arranca com sucesso.

Se o backend não iniciar, os jobs automáticos também não correm.

---

## 4. Proteção contra registo duplicado

Cada job usa uma flag global para evitar múltiplos registos no mesmo processo:

```txt id="xqna0t"
global.__RECEITAS_EXPIRY_JOB_REGISTERED__
global.__HIGIENE_JOB_REGISTERED__
global.__PURGE_HISTORY_JOB_REGISTERED__
```

Isto protege contra registos duplicados dentro da mesma instância Node.js.

### Limitação

Esta proteção não impede duplicação em múltiplas instâncias do backend.

Se o backend correr em produção com múltiplas instâncias, considerar:

* scheduler externo;
* worker dedicado;
* fila;
* lock distribuído na base de dados;
* execução manual via manutenção com controlo operacional.

---

## 5. Variáveis de ambiente relacionadas

As variáveis são carregadas em:

```txt id="7zoyhn"
src/config/env.js
```

---

## 5.1 Ativação/desativação dos jobs

```env id="bhz61a"
ENABLE_JOBS=true
ENABLE_HIGIENE=true
ENABLE_PURGE_HISTORY=true
ENABLE_RECEITAS_EXPIRY=true
```

| Variável                 | Valor padrão | Função                                                   |
| ------------------------ | -----------: | -------------------------------------------------------- |
| `ENABLE_JOBS`            |       `true` | ativa/desativa globalmente o registo automático de jobs  |
| `ENABLE_HIGIENE`         |       `true` | ativa/desativa o job automático de higiene               |
| `ENABLE_PURGE_HISTORY`   |       `true` | ativa/desativa o job automático de limpeza de histórico  |
| `ENABLE_RECEITAS_EXPIRY` |       `true` | ativa/desativa o job automático de expiração de receitas |

Em desenvolvimento ou testes, podes desligar os jobs automáticos se quiseres controlar tudo manualmente:

```env id="4u79rz"
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=false
```

Quando `ENABLE_JOBS=false`, nenhum job automático é registado no arranque.

Isto não impede a execução direta via endpoints de manutenção ou scripts, se forem chamados manualmente.

---

## 5.2 Timezone

```env id="1cfrkt"
TZ="Europe/Lisbon"
```

A timezone é importante para:

* cron;
* cálculo de datas de corte;
* comparação por dia funcional;
* validade de receitas;
* consistência de logs.

Regra importante:

```txt id="wfmkvw"
A validade de uma receita deve ser avaliada por dia funcional.
Validade igual ao dia atual não deve expirar nesse dia.
```

---

## 5.3 Cron

```env id="2jbrom"
CRON_MONTHLY_03H="0 3 1 * *"
CRON_DAILY_03H="0 3 * * *"
```

| Variável           | Interpretação              |
| ------------------ | -------------------------- |
| `CRON_DAILY_03H`   | todos os dias às 03:00     |
| `CRON_MONTHLY_03H` | dia 1 de cada mês às 03:00 |

---

## 5.4 Offsets

```env id="2znem8"
HIGIENE_OFFSET_MONTHS=12
PURGE_OFFSET_MONTHS=6
```

| Variável                | Valor padrão | Função                                             |
| ----------------------- | -----------: | -------------------------------------------------- |
| `HIGIENE_OFFSET_MONTHS` |         `12` | considera utentes removidos há pelo menos 12 meses |
| `PURGE_OFFSET_MONTHS`   |          `6` | remove histórico fechado há pelo menos 6 meses     |

---

## 5.5 Anonimização da higiene

```env id="4h76r1"
HIGIENE_ANONYMIZE=false
ALLOW_HIGIENE_ANONYMIZE=false
```

A anonimização só deve acontecer se ambas estiverem a `true`.

```env id="1djdno"
HIGIENE_ANONYMIZE=true
ALLOW_HIGIENE_ANONYMIZE=true
```

Isto evita anonimização acidental.

Regra recomendada:

```txt id="gxz4rj"
Manter ALLOW_HIGIENE_ANONYMIZE=false em produção salvo decisão explícita e documentada.
```

---

# 6. Job: Receita Expiry

## 6.1 Ficheiro

```txt id="lqjkrm"
src/jobs/receitaExpiry.job.js
```

## 6.2 Funções principais

```js id="f7tb0y"
preview()
runOnce()
registerReceitaExpiryJob()
```

## 6.3 Frequência padrão

```env id="iuyfjq"
CRON_DAILY_03H="0 3 * * *"
```

## 6.4 Objetivo

Expirar linhas de receita vencidas e cancelar itens/pedidos pendentes afetados por essas linhas.

## 6.5 Regra de validade

O job deve tratar validade por dia funcional.

Regra atual:

```txt id="8m20mq"
Receita com validade anterior ao dia atual expira.
Receita com validade igual ao dia atual não expira nesse dia.
```

Isto evita cancelar receitas ainda válidas no próprio dia de validade.

## 6.6 Regras funcionais

O job procura linhas de receita com:

```txt id="io3nho"
status = ATIVA
validade anterior ao dia atual
```

Depois:

1. marca as linhas como `EXPIRADA`;
2. encontra itens de pedido pendentes associados a essas linhas;
3. cancela os itens afetados;
4. cancela pedidos pendentes que fiquem afetados conforme regra interna;
5. define uma razão automática de fecho.

Razão funcional:

```txt id="wsys6j"
Cancelado automaticamente por expiração da receita.
```

## 6.7 Estados afetados

| Entidade       | Antes      | Depois                        |
| -------------- | ---------- | ----------------------------- |
| `ReceitaLinha` | `ATIVA`    | `EXPIRADA`                    |
| `PedidoItem`   | `PENDENTE` | `CANCELADO_POR_EXPIRACAO`     |
| `Pedido`       | `PENDENTE` | `CANCELADO`, quando aplicável |

## 6.8 Preview

O `preview()` deve devolver contadores sem alterar dados.

Campos esperados:

```txt id="bycyms"
checkedAt
expiredLines
pendingItemsFromExpiredLines
affectedPedidos
pendingItemsFromAffectedPedidos
```

Exemplo estrutural:

```json id="3ubgri"
{
  "checkedAt": "2026-06-16T00:00:00.000Z",
  "expiredLines": 0,
  "pendingItemsFromExpiredLines": 0,
  "affectedPedidos": 0,
  "pendingItemsFromAffectedPedidos": 0
}
```

## 6.9 Execução

O `runOnce()` aplica alterações reais.

Campos esperados:

```txt id="1qnjrg"
checkedAt
expiredLines
pendingItemsFromExpiredLines
affectedPedidos
pendingItemsFromAffectedPedidos
canceledPedidoItems
canceledPedidos
```

Exemplo estrutural:

```json id="vyfmyi"
{
  "checkedAt": "2026-06-16T00:00:00.000Z",
  "expiredLines": 0,
  "pendingItemsFromExpiredLines": 0,
  "affectedPedidos": 0,
  "pendingItemsFromAffectedPedidos": 0,
  "canceledPedidoItems": 0,
  "canceledPedidos": 0
}
```

## 6.10 Teste automatizado

```txt id="qtw10e"
tests/integration/jobs/receitaExpiry.job.test.js
```

Cobre:

* criação de cenário com receita expirada;
* preview;
* execução real;
* linha passa para `EXPIRADA`;
* item passa para `CANCELADO_POR_EXPIRACAO`;
* pedido passa para `CANCELADO`;
* receita com validade no dia atual não expira;
* idempotência/segurança de execução repetida.

## 6.11 Execução direta

```bash id="0e2ris"
npm run job:receita-expiry
```

---

# 7. Job: Higiene

## 7.1 Ficheiro

```txt id="coojew"
src/jobs/higiene.job.js
```

## 7.2 Funções principais

```js id="6vx452"
preview()
runOnce()
registerHigieneJob()
```

## 7.3 Frequência padrão

```env id="fbn8oj"
CRON_MONTHLY_03H="0 3 1 * *"
```

## 7.4 Objetivo

Tratar utentes removidos antigos para evitar que fiquem indefinidamente como registos pendentes de higiene.

## 7.5 Regras funcionais

O job considera candidatos com:

```txt id="v3xayq"
deletedAt <= cutoffDate
```

O cutoff é calculado com:

```txt id="k0dnn4"
data atual - offsetMonths
```

Por defeito:

```txt id="cbtrlf"
data atual - 12 meses
```

## 7.6 Marcador interno

```txt id="m8a79c"
[HIGIENE]
```

Este marcador serve para evitar reprocessamento.

## 7.7 Sem anonimização

Quando a anonimização não está ativa, o job marca o utente como tratado, mantendo dados principais.

Campos afetados:

```txt id="wdage4"
isValid = false
invalidReason contém [HIGIENE]
```

## 7.8 Com anonimização

A anonimização só deve ser aplicada se houver dupla confirmação no `.env`:

```env id="5mahlc"
HIGIENE_ANONYMIZE=true
ALLOW_HIGIENE_ANONYMIZE=true
```

Este comportamento é sensível e deve ser tratado com cuidado.

## 7.9 Preview

O `preview()` deve devolver candidatos sem alterar dados.

Campos esperados:

```txt id="arv2ou"
cutoffDate
offsetMonths
candidatos
```

Exemplo estrutural:

```json id="5d5ckb"
{
  "cutoffDate": "2025-06-16T00:00:00.000Z",
  "offsetMonths": 12,
  "candidatos": 0
}
```

## 7.10 Execução

O `runOnce()` aplica alterações reais.

Campos esperados:

```txt id="22bvcp"
checkedAt
cutoffDate
offsetMonths
anonymizeRequested
anonymizeApplied
atualizados
```

Exemplo estrutural:

```json id="nuvp9q"
{
  "checkedAt": "2026-06-16T00:00:00.000Z",
  "cutoffDate": "2025-06-16T00:00:00.000Z",
  "offsetMonths": 12,
  "anonymizeRequested": false,
  "anonymizeApplied": false,
  "atualizados": 0
}
```

## 7.11 Teste automatizado

```txt id="efsyng"
tests/integration/jobs/higiene.job.test.js
```

Cobre:

* criação de utente removido antigo;
* preview;
* execução real;
* aplicação do marcador `[HIGIENE]`;
* preservação de dados quando `anonymize: false`;
* idempotência.

## 7.12 Execução direta

```bash id="hrlz0x"
npm run job:higiene
```

---

# 8. Job: Purge History

## 8.1 Ficheiro

```txt id="jpq0qo"
src/jobs/purgeHistory.job.js
```

## 8.2 Funções principais

```js id="354nu2"
preview()
runOnce()
registerPurgeHistoryJob()
```

## 8.3 Frequência padrão

```env id="iml3v2"
CRON_MONTHLY_03H="0 3 1 * *"
```

## 8.4 Objetivo

Remover histórico antigo fechado, reduzindo acumulação de dados operacionais antigos.

Este job é destrutivo.

## 8.5 Dados afetados

Pode remover:

* pedidos fechados antigos;
* itens desses pedidos;
* dispensas associadas;
* regularizações concluídas antigas;
* eventos das regularizações removidas.

## 8.6 Pedidos elegíveis

Estados elegíveis:

```txt id="n9dezy"
VALIDADO
REJEITADO
CANCELADO
```

Pedidos `PENDENTE` não devem ser removidos.

## 8.7 Regularizações elegíveis

Regularizações elegíveis:

```txt id="nakgce"
status = REGULARIZADO
```

A antiguidade é determinada pela data de atualização/eventos conforme a implementação do job.

Regularizações pendentes ou parcialmente regularizadas não devem ser removidas.

## 8.8 Ordem de limpeza

O job deve respeitar a integridade referencial.

Ordem funcional:

1. encontrar regularizações concluídas antigas;
2. remover eventos associados;
3. remover regularizações;
4. encontrar pedidos fechados antigos;
5. encontrar itens desses pedidos;
6. desvincular regularizações que apontem para esses pedidos, se necessário;
7. remover dispensas associadas aos itens;
8. remover itens dos pedidos;
9. remover pedidos.

## 8.9 Preview

O `preview()` deve devolver contadores sem apagar dados.

Campos esperados:

```txt id="mjhu9s"
cutoffDate
offsetMonths
regularizacoes
eventos
pedidos
pedidoItens
dispensas
```

Exemplo estrutural:

```json id="q9p5pd"
{
  "cutoffDate": "2025-12-16T00:00:00.000Z",
  "offsetMonths": 6,
  "regularizacoes": 0,
  "eventos": 0,
  "pedidos": 0,
  "pedidoItens": 0,
  "dispensas": 0
}
```

## 8.10 Execução

O `runOnce()` aplica alterações reais.

Campos esperados:

```txt id="r4m50t"
checkedAt
cutoffDate
offsetMonths
regularizacoes
eventos
pedidos
pedidoItens
dispensas
regularizacoesDesvinculadas
```

Exemplo estrutural:

```json id="gytnta"
{
  "checkedAt": "2026-06-16T00:00:00.000Z",
  "cutoffDate": "2025-12-16T00:00:00.000Z",
  "offsetMonths": 6,
  "regularizacoes": 0,
  "eventos": 0,
  "pedidos": 0,
  "pedidoItens": 0,
  "dispensas": 0,
  "regularizacoesDesvinculadas": 0
}
```

## 8.11 Teste automatizado

```txt id="b2m1nb"
tests/integration/jobs/purgeHistory.job.test.js
```

Cobre:

* criação de pedido validado antigo;
* criação de regularização concluída antiga;
* preview;
* execução real;
* remoção de pedido;
* remoção de item;
* remoção de dispensa;
* remoção de regularização;
* remoção de evento;
* idempotência.

## 8.12 Execução direta

```bash id="o27bqh"
npm run job:purge-history
```

---

# 9. Endpoints de manutenção

Todas as rotas de manutenção estão protegidas por:

```txt id="egpuxu"
requireAuth
requireRole(["ADMIN"])
```

Prefixo:

```txt id="f4na72"
/api/manutencao
```

Os endpoints `preview` não alteram dados.

Os endpoints `run` alteram dados reais e exigem confirmação forte no body.

---

## 9.1 Listar jobs

```http id="mc3ncn"
GET /api/manutencao/jobs
```

Resposta esperada:

```json id="ubp9ni"
{
  "data": [
    {
      "key": "receita-expiry",
      "description": "Expira linhas de receita vencidas e cancela itens pendentes associados.",
      "schedule": "daily",
      "actions": ["preview", "run"]
    },
    {
      "key": "higiene",
      "description": "Marca utentes removidos antigos como arquivados por higiene.",
      "schedule": "monthly",
      "actions": ["preview", "run"]
    },
    {
      "key": "purge-history",
      "description": "Remove histórico antigo de pedidos fechados e regularizações concluídas.",
      "schedule": "monthly",
      "actions": ["preview", "run"]
    }
  ]
}
```

---

## 9.2 Receita Expiry

```http id="mfjpjp"
GET  /api/manutencao/jobs/receita-expiry/preview
POST /api/manutencao/jobs/receita-expiry/run
```

Body obrigatório para execução:

```json id="a92ooa"
{
  "confirm": "RUN_RECEITA_EXPIRY"
}
```

---

## 9.3 Higiene

```http id="e9596r"
GET  /api/manutencao/jobs/higiene/preview
POST /api/manutencao/jobs/higiene/run
```

Query de preview e body de execução podem aceitar:

```json id="ea06p0"
{
  "offsetMonths": 12,
  "anonymize": false
}
```

Body obrigatório para execução:

```json id="zt8q24"
{
  "confirm": "RUN_HIGIENE",
  "offsetMonths": 12,
  "anonymize": false
}
```

---

## 9.4 Purge History

```http id="mjm9nw"
GET  /api/manutencao/jobs/purge-history/preview
POST /api/manutencao/jobs/purge-history/run
```

Query de preview pode aceitar:

```json id="t6jkhj"
{
  "offsetMonths": 6
}
```

Body obrigatório para execução:

```json id="f73bda"
{
  "confirm": "RUN_PURGE_HISTORY",
  "backupConfirmed": true,
  "offsetMonths": 6
}
```

Regra crítica:

```txt id="fq6w79"
Purge history só deve ser executado depois de backup confirmado.
```

---

## 9.5 Erros esperados

| Caso                                      |  HTTP |
| ----------------------------------------- | ----: |
| Sem sessão                                | `401` |
| Role `SANTACASA` ou `FARMACIA`            | `403` |
| Job inexistente                           | `404` |
| Ação inexistente                          | `404` |
| `offsetMonths` inválido                   | `400` |
| `confirm` inválido ou ausente             | `400` |
| `backupConfirmed` ausente em purge-history | `400` |

# 10. Testes E2E de manutenção

# 10. Testes E2E de manutenção

Ficheiro:

```txt id="x1an5v"
tests/e2e/manutencao.e2e.test.js
```

Cobre:

* bloqueio sem sessão;
* bloqueio de `SANTACASA`;
* bloqueio de `FARMACIA`;
* acesso permitido a `ADMIN`;
* listagem de jobs;
* preview de `receita-expiry`;
* run de `receita-expiry` com `confirm`;
* rejeição de `receita-expiry` sem confirmação;
* preview de `higiene`;
* run de `higiene` com `confirm`;
* rejeição de `higiene` sem confirmação;
* preview de `purge-history`;
* run de `purge-history` com `confirm` e `backupConfirmed`;
* rejeição de `purge-history` sem confirmação ou sem backup confirmado;
* validação de parâmetros inválidos;
* job inexistente;
* ação inexistente.

### Nota sobre endpoints `run` em E2E

Os endpoints `run` são testados com parâmetros controlados e seguros.

Exemplos:

* `higiene` com `offsetMonths` muito elevado e `anonymize: false`;
* `purge-history` com `offsetMonths` muito elevado;
* `receita-expiry` em cenário seguro de teste.

Assim, o E2E valida contrato HTTP sem apagar dados inesperados.

---

# 11. Testes de integração dos jobs

Os testes de integração validam diretamente as funções dos jobs.

Local:

```txt id="y0tu5f"
tests/integration/jobs/
```

Cobrem:

* `preview`;
* `runOnce`;
* efeitos reais na base de dados;
* idempotência;
* proteção de regras críticas.

---

## 11.1 Receita Expiry integration

Ficheiro:

```txt id="bid7uz"
tests/integration/jobs/receitaExpiry.job.test.js
```

Cobre:

* linha de receita expirada antiga;
* item pendente associado;
* pedido pendente associado;
* preview com contadores;
* run com alteração real;
* linha passa para `EXPIRADA`;
* item passa para `CANCELADO_POR_EXPIRACAO`;
* pedido passa para `CANCELADO`;
* validade igual ao dia atual continua `ATIVA`;
* pedido/item associado à validade de hoje continua pendente.

---

## 11.2 Higiene integration

Ficheiro:

```txt id="wzl35g"
tests/integration/jobs/higiene.job.test.js
```

Cobre:

* utente removido antigo;
* preview com candidatos;
* run com marcação;
* `invalidReason` contém marcador de higiene;
* execução repetida sem reprocessamento indevido.

---

## 11.3 Purge History integration

Ficheiro:

```txt id="0sdj61"
tests/integration/jobs/purgeHistory.job.test.js
```

Cobre:

* pedido validado antigo;
* pedido item associado;
* dispensa associada;
* regularização concluída antiga;
* evento de regularização associado;
* preview com contadores;
* run remove entidades esperadas;
* execução repetida mantém idempotência.

---

# 12. Scripts manuais e execução direta

## 12.1 Execução direta dos jobs

Comandos principais:

```bash id="v255ha"
npm run job:receita-expiry
npm run job:higiene
npm run job:purge-history
```

Uso:

* diagnóstico local;
* execução manual controlada;
* ambiente de desenvolvimento;
* operações administrativas pontuais.

## 12.2 Scripts manuais/smoke

Se existirem scripts manuais no projeto, devem ser tratados como apoio operacional, não como substituto da suite automatizada.

Exemplos esperados:

```txt id="ok8va5"
scripts/
├── test-receita-expiry-job.js
├── test-higiene-job.js
└── test-purge-history-job.js
```

Comandos possíveis, se existirem no `package.json`:

```bash id="i87m0f"
npm run test:receita-expiry
npm run test:higiene
npm run test:purge-history
```

### Recomendação

Manter os scripts manuais apenas se continuarem úteis para diagnóstico.

Não os usar como substituto de:

```bash id="yz8fdr"
npm run test:integration -- --run
npm run test:e2e -- --run
npm run validate
```

---

# 13. Cuidados operacionais

## 13.1 Nunca correr contra produção sem confirmação

Antes de executar scripts ou jobs diretos, confirmar ambiente.

Em bash:

```bash id="okzaxz"
echo $NODE_ENV
```

Em PowerShell:

```powershell id="2tt0mt"
$env:NODE_ENV
```

Confirmar também a base:

```env id="tgon7z"
DATABASE_URL="..."
```

## 13.2 Atenção especial ao `purge-history`

Este job remove dados.

Antes de executar manualmente:

1. confirmar ambiente;
2. confirmar `DATABASE_URL`;
3. confirmar `PURGE_OFFSET_MONTHS`;
4. correr preview;
5. guardar output do preview;
6. confirmar contadores;
7. garantir backup;
8. enviar `confirm` correto no endpoint `run`;
9. em `purge-history`, enviar `backupConfirmed=true`;
8. só depois executar.

## 13.3 Atenção à higiene com anonimização

Antes de executar higiene com anonimização:

1. confirmar ambiente;
2. confirmar `HIGIENE_ANONYMIZE`;
3. confirmar `ALLOW_HIGIENE_ANONYMIZE`;
4. correr preview;
5. validar candidatos;
6. confirmar que a anonimização é realmente pretendida.

## 13.4 Atenção à validade de receitas

Antes de alterar o job de expiração:

* confirmar regra de validade diária;
* garantir que receitas válidas no dia atual não expiram no próprio dia;
* atualizar testes se a regra mudar.

---

# 14. Checklist antes de alterar jobs

Antes de alterar qualquer job:

* [ ] Confirmar regra de negócio no `BUSINESS_RULES.md`.
* [ ] Confirmar contratos em `API_ROUTES.md`.
* [ ] Confirmar arquitetura em `ARCHITECTURE.md`.
* [ ] Confirmar variáveis em `ENVIRONMENT.md`.
* [ ] Confirmar modelos no `schema.prisma`.
* [ ] Confirmar impacto em rotas existentes.
* [ ] Confirmar impacto no frontend.
* [ ] Confirmar impacto no histórico.
* [ ] Confirmar impacto em regularizações.
* [ ] Confirmar impacto em alertas operacionais.
* [ ] Atualizar testes de integração.
* [ ] Atualizar E2E se mudar contrato HTTP.
* [ ] Atualizar scripts manuais se necessário.
* [ ] Atualizar documentação.

---

# 15. Checklist antes de correr jobs manualmente em produção

* [ ] Confirmar ambiente.
* [ ] Confirmar `DATABASE_URL`.
* [ ] Confirmar `NODE_ENV`.
* [ ] Confirmar `TZ`.
* [ ] Confirmar offsets.
* [ ] Confirmar flags de anonimização.
* [ ] Executar preview.
* [ ] Guardar output do preview.
* [ ] Confirmar backup.
* [ ] Confirmar janela de manutenção.
* [ ] Executar apenas se o resultado esperado estiver correto.
* [ ] Guardar output do run.
* [ ] Verificar dashboards depois da execução.
* [ ] Verificar logs.
* [ ] Verificar uma amostra dos dados afetados.

---

# 16. Edge cases conhecidos

## 16.1 Receita Expiry

* Receita pode expirar enquanto existe pedido pendente.
* Pedido afetado pode ter vários itens.
* Linhas já expiradas não devem ser reprocessadas.
* Pedidos já fechados não devem ser reabertos.
* Receita com validade igual ao dia atual não deve expirar no próprio dia.
* Itens afetados por expiração passam para `CANCELADO_POR_EXPIRACAO`.
* Pedidos afetados podem passar para `CANCELADO`.

## 16.2 Higiene

* Utentes sem `deletedAt` não são processados.
* Utentes já marcados com `[HIGIENE]` não são reprocessados.
* Anonimização exige dupla confirmação.
* A rotina deve ser idempotente.
* Não deve afetar utentes ativos.

## 16.3 Purge History

* Não remove pedidos pendentes.
* Não remove regularizações pendentes.
* Não remove regularizações parcialmente regularizadas.
* Regularizações associadas a pedidos antigos podem ser desvinculadas se necessário.
* Remove histórico antigo e fechado.
* É destrutivo.
* Deve ser idempotente.
* Deve respeitar integridade referencial.

---

# 17. Convenções para novos jobs

Ao criar um novo job, seguir este padrão:

```txt id="q9c46z"
src/jobs/nomeDoJob.job.js
```

Deve exportar, quando aplicável:

```js id="n17t8n"
preview()
runOnce()
registerNomeDoJob()
```

E deve ser registado em:

```txt id="ll1ysy"
src/jobs/index.js
```

Também deve ter:

* flag `ENABLE_*` no `.env`;
* cron configurável no `.env`;
* endpoint em `manutencao`, se fizer sentido;
* documentação neste ficheiro;
* regra funcional em `BUSINESS_RULES.md`;
* contrato em `API_ROUTES.md`, se expuser endpoint;
* teste de integração;
* E2E de permissões/preview/run, se existir endpoint;
* script manual apenas se for útil para diagnóstico.

---

# 18. Melhorias futuras recomendadas

## 18.1 Base de dados isolada para testes

Atualmente os testes usam `DATABASE_URL`.

Futuro recomendado:

```txt id="kplnxn"
.env.test
```

com base dedicada:

```env id="jq6txj"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_santacasa_test?schema=public"
```

## 18.2 Tabela de logs de jobs

Criar tabela futura:

```txt id="zjb4pd"
MaintenanceJobRun
```

Campos possíveis:

```txt id="enkq29"
id
jobKey
mode
startedAt
finishedAt
status
resultJson
errorMessage
triggeredById
createdAt
```

## 18.3 Registar execuções manuais

Guardar:

* utilizador que executou;
* job executado;
* parâmetros usados;
* data;
* resultado;
* erro, se existir.

## 18.4 Confirmação forte para jobs destrutivos e sensíveis

Para `purge-history`, considerar payload obrigatório:

```json id="bpt9u7"
{
  "confirm": "PURGE_HISTORY"
}
```

## 18.5 Worker ou scheduler externo

Se o backend crescer para múltiplas instâncias:

* retirar cron do processo principal da API;
* usar worker dedicado;
* ou usar scheduler externo;
* ou implementar lock distribuído.

---

# 19. Comandos úteis

## 19.1 Validar testes dos jobs

```bash id="4bxf52"
npm run test:integration -- --run
```

## 19.2 Validar E2E de manutenção

```bash id="wah7uk"
npm run test:e2e -- --run tests/e2e/manutencao.e2e.test.js
```

## 19.3 Validar E2E completo

```bash id="oi9x25"
npm run test:e2e -- --run
```

## 19.4 Validar tudo

```bash id="hmc785"
npm run test:all
npm run validate
```

## 19.5 Executar jobs diretamente

```bash id="vtv0sn"
npm run job:receita-expiry
npm run job:higiene
npm run job:purge-history
```

---

# 20. Estado atual da cobertura

## 20.1 Integration tests

Cobrem os três jobs diretamente:

```txt id="y7plno"
receitaExpiry.job
higiene.job
purgeHistory.job
```

Incluem:

* preview;
* run;
* efeitos reais;
* idempotência;
* proteção da regra de validade no dia atual.

## 20.2 E2E tests

Cobrem endpoints administrativos de manutenção:

```txt id="pdm3qt"
/api/manutencao/jobs
/api/manutencao/jobs/:jobKey/preview
/api/manutencao/jobs/:jobKey/run
```

Incluem:

* permissões por role;
* listagem de jobs;
* preview;
* run;
* parâmetros inválidos;
* job inexistente;
* ação inexistente.

## 20.3 Estado final

```txt id="1k5369"
Testes dos jobs fechados por agora.
Novas alterações nos jobs devem atualizar testes e documentação.
```

---

# 21. Resumo final

Os jobs de manutenção são parte crítica do backend.

Eles não servem apenas para limpeza técnica. Aplicam regras de negócio importantes:

* receitas expiradas deixam de poder sustentar pedidos;
* pedidos pendentes afetados por expiração são cancelados;
* validade igual ao dia atual continua válida nesse dia;
* utentes removidos antigos são tratados por higiene;
* histórico fechado antigo pode ser eliminado;
* regularizações concluídas antigas podem ser purgadas.

Estado atual:

* jobs implementados;
* jobs registados no arranque;
* flags globais evitam registo duplicado no mesmo processo;
* endpoints `preview` e `run` protegidos por `ADMIN`;
* testes de integração passam;
* E2E de manutenção passa;
* `test:all` passa;
* `validate` passa;
* documentação principal alinhada com o backend atual.

Recomendação:

```txt id="qhnnna"
Manter os jobs estáveis.
Só alterar por bug real, nova regra funcional ou necessidade operacional concreta.
```
