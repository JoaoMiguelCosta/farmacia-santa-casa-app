# MAINTENANCE_JOBS.md

Documentação dos jobs de manutenção do backend **Farmácia Santa Casa**.

Este ficheiro descreve os processos automáticos e manuais responsáveis por:

- expirar linhas de receita vencidas;
- cancelar pedidos pendentes afetados por receitas expiradas;
- tratar utentes removidos antigos através da rotina de higiene;
- limpar histórico antigo de pedidos e regularizações;
- permitir preview e execução manual controlada por utilizadores `ADMIN`.

---

## 1. Estado atual

Existem três jobs principais:

| Job | Ficheiro | Frequência padrão | Teste automatizado |
|---|---|---:|---|
| Receita Expiry | `src/jobs/receitaExpiry.job.js` | diária | `tests/integration/jobs/receitaExpiry.job.test.js` |
| Higiene | `src/jobs/higiene.job.js` | mensal | `tests/integration/jobs/higiene.job.test.js` |
| Purge History | `src/jobs/purgeHistory.job.js` | mensal | `tests/integration/jobs/purgeHistory.job.test.js` |

Também existem testes E2E para permissões e previews:

```txt
tests/e2e/manutencao.e2e.test.js
```

E scripts manuais/smoke tests:

```txt
scripts/
├── test-receita-expiry-job.js
├── test-higiene-job.js
└── test-purge-history-job.js
```

Comandos de validação já testados nesta fase:

```bash
npm run test:integration -- --run
npm run test:e2e -- --run
npm run test:receita-expiry
npm run test:higiene
npm run test:purge-history
```

---

## 2. Objetivo dos jobs

Os jobs existem para manter a base de dados coerente ao longo do tempo, sem depender apenas de ações manuais dos utilizadores.

Aplicam regras de negócio importantes:

- receitas expiradas deixam de poder sustentar pedidos;
- pedidos pendentes afetados por expiração são cancelados automaticamente;
- utentes removidos antigos são marcados como tratados pela rotina de higiene;
- histórico fechado antigo pode ser eliminado;
- regularizações concluídas antigas podem ser purgadas.

Qualquer alteração nestes jobs deve ser tratada como alteração sensível de domínio.

---

## 3. Registo dos jobs no arranque

O servidor arranca em:

```txt
src/app/server.js
```

Durante o arranque, é chamada a função:

```js
registerJobs();
```

A função está em:

```txt
src/jobs/index.js
```

E regista os três jobs:

```js
registerReceitaExpiryJob();
registerHigieneJob();
registerPurgeHistoryJob();
```

### Regra importante

Os jobs só são registados quando o servidor arranca com sucesso.

Se o backend não iniciar, os jobs também não correm.

---

## 4. Variáveis de ambiente relacionadas

As variáveis são carregadas em:

```txt
src/config/env.js
```

---

## 4.1 Ativação/desativação dos jobs

```env
ENABLE_HIGIENE=true
ENABLE_PURGE_HISTORY=true
ENABLE_RECEITAS_EXPIRY=true
```

| Variável | Valor padrão | Função |
|---|---:|---|
| `ENABLE_HIGIENE` | `true` | ativa/desativa o job de higiene |
| `ENABLE_PURGE_HISTORY` | `true` | ativa/desativa o job de limpeza de histórico |
| `ENABLE_RECEITAS_EXPIRY` | `true` | ativa/desativa o job de expiração de receitas |

Em desenvolvimento, podes desligar os jobs automáticos se quiseres controlar tudo manualmente:

```env
ENABLE_HIGIENE=false
ENABLE_PURGE_HISTORY=false
ENABLE_RECEITAS_EXPIRY=false
```

Isto não impede a execução direta via scripts ou endpoints de manutenção, se essas rotas/comandos forem chamados manualmente.

---

## 4.2 Timezone

```env
TZ="Europe/Lisbon"
```

A timezone é importante para cron e para consistência temporal dos jobs.

---

## 4.3 Cron

```env
CRON_MONTHLY_03H="0 3 1 * *"
CRON_DAILY_03H="0 3 * * *"
```

| Variável | Interpretação |
|---|---|
| `CRON_DAILY_03H` | todos os dias às 03:00 |
| `CRON_MONTHLY_03H` | dia 1 de cada mês às 03:00 |

---

## 4.4 Offsets

```env
HIGIENE_OFFSET_MONTHS=12
PURGE_OFFSET_MONTHS=6
```

| Variável | Valor padrão | Função |
|---|---:|---|
| `HIGIENE_OFFSET_MONTHS` | `12` | considera utentes removidos há pelo menos 12 meses |
| `PURGE_OFFSET_MONTHS` | `6` | remove histórico fechado há pelo menos 6 meses |

---

## 4.5 Anonimização da higiene

```env
HIGIENE_ANONYMIZE=false
ALLOW_HIGIENE_ANONYMIZE=false
```

A anonimização só deve acontecer se ambas estiverem a `true`.

Isto evita anonimização acidental.

```env
HIGIENE_ANONYMIZE=true
ALLOW_HIGIENE_ANONYMIZE=true
```

---

## 5. Job: Receita Expiry

### Ficheiro

```txt
src/jobs/receitaExpiry.job.js
```

### Funções principais

```js
preview()
runOnce()
registerReceitaExpiryJob()
```

### Frequência padrão

```env
CRON_DAILY_03H="0 3 * * *"
```

### Objetivo

Expirar linhas de receita vencidas e cancelar pedidos pendentes afetados por essas linhas.

### Regras funcionais

O job procura linhas de receita com:

```txt
status = ATIVA
validade <= agora
```

Depois:

1. marca as linhas como `EXPIRADA`;
2. encontra itens de pedido pendentes associados a essas linhas;
3. cancela os itens afetados;
4. cancela pedidos pendentes que dependiam desses itens;
5. define uma razão automática de fecho.

Razão funcional:

```txt
Cancelado automaticamente por expiração da receita.
```

### Estados afetados

| Entidade | Antes | Depois |
|---|---|---|
| `ReceitaLinha` | `ATIVA` | `EXPIRADA` |
| `PedidoItem` | `PENDENTE` | `CANCELADO_POR_EXPIRACAO` |
| `Pedido` | `PENDENTE` | `CANCELADO` |

### Preview

O `preview()` deve devolver contadores sem alterar dados.

Campos esperados:

```txt
checkedAt
expiredLines
pendingItemsFromExpiredLines
affectedPedidos
pendingItemsFromAffectedPedidos
```

### Execução

O `runOnce()` aplica alterações reais.

Campos esperados:

```txt
checkedAt
expiredLines
pendingItemsFromExpiredLines
affectedPedidos
pendingItemsFromAffectedPedidos
canceledPedidoItems
canceledPedidos
```

### Teste automatizado

```txt
tests/integration/jobs/receitaExpiry.job.test.js
```

Cobre:

- criação de cenário com receita expirada;
- preview;
- execução real;
- linha passa para `EXPIRADA`;
- item passa para `CANCELADO_POR_EXPIRACAO`;
- pedido passa para `CANCELADO`.

### Script manual

```bash
npm run test:receita-expiry
```

### Execução direta

```bash
npm run job:receita-expiry
```

---

## 6. Job: Higiene

### Ficheiro

```txt
src/jobs/higiene.job.js
```

### Funções principais

```js
preview()
runOnce()
registerHigieneJob()
```

### Frequência padrão

```env
CRON_MONTHLY_03H="0 3 1 * *"
```

### Objetivo

Tratar utentes removidos antigos para evitar que fiquem indefinidamente como registos ativos de trabalho.

### Regras funcionais

O job considera candidatos com:

```txt
deletedAt <= cutoffDate
```

O cutoff é calculado com:

```txt
data atual - offsetMonths
```

Por defeito:

```txt
data atual - 12 meses
```

### Marcador interno

```txt
[HIGIENE]
```

Este marcador serve para evitar reprocessamento.

### Sem anonimização

Quando a anonimização não está ativa, o job marca o utente como tratado, mantendo dados principais.

Campos afetados:

```txt
isValid = false
invalidReason contém [HIGIENE]
```

### Com anonimização

A anonimização só deve ser aplicada se houver dupla confirmação no `.env`:

```env
HIGIENE_ANONYMIZE=true
ALLOW_HIGIENE_ANONYMIZE=true
```

Este comportamento é sensível e deve ser tratado com cuidado.

### Preview

O `preview()` deve devolver candidatos sem alterar dados.

Campos esperados:

```txt
cutoffDate
offsetMonths
candidatos
```

### Execução

O `runOnce()` aplica alterações reais.

Campos esperados:

```txt
checkedAt
cutoffDate
offsetMonths
anonymizeRequested
anonymizeApplied
atualizados
```

### Teste automatizado

```txt
tests/integration/jobs/higiene.job.test.js
```

Cobre:

- criação de utente removido antigo;
- preview;
- execução real;
- aplicação do marcador `[HIGIENE]`;
- idempotência.

### Script manual

```bash
npm run test:higiene
```

### Execução direta

```bash
npm run job:higiene
```

---

## 7. Job: Purge History

### Ficheiro

```txt
src/jobs/purgeHistory.job.js
```

### Funções principais

```js
preview()
runOnce()
registerPurgeHistoryJob()
```

### Frequência padrão

```env
CRON_MONTHLY_03H="0 3 1 * *"
```

### Objetivo

Remover histórico antigo fechado, reduzindo acumulação de dados operacionais antigos.

Este job é destrutivo.

### Dados afetados

Pode remover:

- pedidos fechados antigos;
- itens desses pedidos;
- dispensas associadas;
- regularizações concluídas antigas;
- eventos das regularizações removidas.

### Pedidos elegíveis

Estados elegíveis:

```txt
VALIDADO
REJEITADO
CANCELADO
```

Pedidos `PENDENTE` não devem ser removidos.

### Regularizações elegíveis

Regularizações elegíveis:

```txt
status = REGULARIZADO
updatedAt <= cutoffDate
```

Regularizações pendentes ou parcialmente regularizadas não devem ser removidas.

### Ordem de limpeza

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

### Preview

O `preview()` deve devolver contadores sem apagar dados.

Campos esperados:

```txt
cutoffDate
offsetMonths
regularizacoes
eventos
pedidos
pedidoItens
dispensas
```

### Execução

O `runOnce()` aplica alterações reais.

Campos esperados:

```txt
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

### Teste automatizado

```txt
tests/integration/jobs/purgeHistory.job.test.js
```

Cobre:

- criação de pedido validado antigo;
- criação de regularização concluída antiga;
- preview;
- execução real;
- remoção de pedido;
- remoção de item;
- remoção de dispensa;
- remoção de regularização;
- remoção de evento;
- idempotência.

### Script manual

```bash
npm run test:purge-history
```

### Execução direta

```bash
npm run job:purge-history
```

---

## 8. Endpoints de manutenção

Todas as rotas de manutenção estão protegidas por:

```txt
requireAuth
requireRole(["ADMIN"])
```

Prefixo:

```txt
/api/manutencao
```

### Listar jobs

```http
GET /api/manutencao/jobs
```

### Receita Expiry

```http
GET  /api/manutencao/jobs/receita-expiry/preview
POST /api/manutencao/jobs/receita-expiry/run
```

### Higiene

```http
GET  /api/manutencao/jobs/higiene/preview
POST /api/manutencao/jobs/higiene/run
```

### Purge History

```http
GET  /api/manutencao/jobs/purge-history/preview
POST /api/manutencao/jobs/purge-history/run
```

---

## 9. Testes E2E de manutenção

Ficheiro:

```txt
tests/e2e/manutencao.e2e.test.js
```

Cobre:

- bloqueio sem sessão;
- bloqueio de `SANTACASA`;
- bloqueio de `FARMACIA`;
- acesso permitido a `ADMIN`;
- listagem de jobs;
- preview de `receita-expiry`;
- preview de `higiene`;
- preview de `purge-history`;
- validação de parâmetros inválidos.

### O que não cobre

Não executa endpoints `run`.

Motivo:

- `run` altera dados reais;
- `purge-history` é destrutivo;
- os `run` estão cobertos nos testes de integração dos jobs.

---

## 10. Scripts manuais vs testes automatizados

### Testes automatizados

Local:

```txt
tests/integration/jobs/
```

Uso:

- validação antes de commit;
- validação antes de deploy;
- proteção contra regressões;
- execução repetível;
- melhor isolamento do que scripts manuais.

Comando:

```bash
npm run test:integration -- --run
```

### Scripts manuais

Local:

```txt
scripts/
```

Uso:

- smoke test;
- diagnóstico rápido;
- validação manual de ambiente local;
- execução fora do Vitest;
- confirmação operacional.

Comandos:

```bash
npm run test:receita-expiry
npm run test:higiene
npm run test:purge-history
```

### Recomendação

Manter os scripts manuais por agora.

Não os usar como substituto dos testes automatizados.

---

## 11. Cuidados operacionais

### Nunca correr contra produção sem confirmação

Antes de executar scripts ou jobs diretos, confirmar:

```bash
echo $NODE_ENV
```

ou no PowerShell:

```powershell
$env:NODE_ENV
```

Confirmar também a base:

```env
DATABASE_URL="..."
```

### Atenção especial ao `purge-history`

Este job remove dados.

Antes de executar manualmente:

1. correr preview;
2. confirmar contadores;
3. confirmar ambiente;
4. garantir backup;
5. só depois executar.

---

## 12. Checklist antes de alterar jobs

Antes de alterar qualquer job:

- [ ] Confirmar regra de negócio no `BUSINESS_RULES.md`.
- [ ] Confirmar modelos no `schema.prisma`.
- [ ] Confirmar impacto em rotas existentes.
- [ ] Confirmar impacto no frontend.
- [ ] Confirmar impacto no histórico.
- [ ] Confirmar impacto em regularizações.
- [ ] Atualizar testes de integração.
- [ ] Atualizar E2E se mudar contrato HTTP.
- [ ] Atualizar scripts manuais se necessário.
- [ ] Atualizar documentação.

---

## 13. Checklist antes de correr jobs manualmente em produção

- [ ] Confirmar ambiente.
- [ ] Confirmar `DATABASE_URL`.
- [ ] Confirmar `NODE_ENV`.
- [ ] Confirmar `TZ`.
- [ ] Confirmar offsets.
- [ ] Executar preview.
- [ ] Guardar output do preview.
- [ ] Confirmar backup.
- [ ] Confirmar janela de manutenção.
- [ ] Executar apenas se o resultado esperado estiver correto.
- [ ] Guardar output do run.
- [ ] Verificar dashboards depois da execução.

---

## 14. Edge cases conhecidos

### Receita Expiry

- Receita pode expirar enquanto existe pedido pendente.
- Pedido afetado pode ter vários itens.
- Linhas já expiradas não devem ser reprocessadas.
- Pedidos já fechados não devem ser reabertos.

### Higiene

- Utentes sem `deletedAt` não são processados.
- Utentes já marcados com `[HIGIENE]` não são reprocessados.
- Anonimização exige dupla confirmação.
- A rotina deve ser idempotente.

### Purge History

- Não remove pedidos pendentes.
- Não remove regularizações pendentes.
- Não remove regularizações parcialmente regularizadas.
- Regularizações associadas a pedidos antigos podem ser desvinculadas se necessário.
- Remove histórico antigo e fechado.
- É destrutivo.

---

## 15. Convenções para novos jobs

Ao criar um novo job, seguir este padrão:

```txt
src/jobs/nomeDoJob.job.js
```

Deve exportar, quando aplicável:

```js
preview()
runOnce()
registerNomeDoJob()
```

E deve ser registado em:

```txt
src/jobs/index.js
```

Também deve ter:

- flag `ENABLE_*` no `.env`;
- cron configurável no `.env`;
- endpoint em `manutencao`, se fizer sentido;
- documentação neste ficheiro;
- teste de integração;
- E2E de permissões/preview, se existir endpoint;
- script manual apenas se for útil para diagnóstico.

---

## 16. Melhorias futuras recomendadas

### 16.1 Base de dados isolada para testes

Atualmente os testes usam `DATABASE_URL`.

Futuro recomendado:

```txt
.env.test
```

com base dedicada:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_santacasa_test?schema=public"
```

### 16.2 Tabela de logs de jobs

Criar tabela futura:

```txt
MaintenanceJobRun
```

Campos possíveis:

```txt
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

### 16.3 Registar execuções manuais

Guardar:

- utilizador que executou;
- job executado;
- parâmetros usados;
- data;
- resultado;
- erro, se existir.

### 16.4 Confirmação forte para jobs destrutivos

Para `purge-history`, considerar payload obrigatório:

```json
{
  "confirm": "PURGE_HISTORY"
}
```

---

## 17. Comandos úteis

### Validar testes dos jobs

```bash
npm run test:integration -- --run
```

### Validar E2E de manutenção

```bash
npm run test:e2e -- --run
```

### Validar scripts manuais dos jobs

```bash
npm run test:receita-expiry
npm run test:higiene
npm run test:purge-history
```

### Executar jobs diretamente

```bash
npm run job:receita-expiry
npm run job:higiene
npm run job:purge-history
```

---

## 18. Resumo final

Os jobs de manutenção são parte crítica do backend.

Eles não servem apenas para limpeza técnica. Aplicam regras de negócio importantes:

- receitas expiradas deixam de poder sustentar pedidos;
- pedidos pendentes afetados por expiração são cancelados;
- utentes removidos antigos são tratados por higiene;
- histórico fechado antigo pode ser eliminado;
- regularizações concluídas antigas podem ser purgadas.

Estado atual:

- jobs documentados;
- scripts manuais mantidos;
- testes de integração criados;
- E2E de manutenção criado;
- previews cobertos;
- permissões cobertas;
- endpoints `run` protegidos por `ADMIN`.

O backend está num estado adequado para fechar esta fase dos jobs e avançar para o frontend.
