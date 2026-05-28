# MAINTENANCE_JOBS.md

Documentação dos jobs de manutenção do backend **Farmácia Santa Casa**.

Este ficheiro descreve os processos automáticos e manuais responsáveis por:

- expirar linhas de receita vencidas;
- cancelar pedidos pendentes afetados por receitas expiradas;
- marcar utentes removidos antigos como inválidos/arquivados por higiene;
- limpar histórico antigo de pedidos e regularizações;
- permitir execução manual controlada por utilizadores `ADMIN`.

---

## 1. Objetivo dos jobs

Os jobs existem para manter a base de dados coerente ao longo do tempo, sem depender apenas de ações manuais dos utilizadores.

No projeto atual existem três jobs principais:

| Job | Ficheiro | Frequência padrão | Objetivo |
|---|---|---:|---|
| Receita Expiry | `src/jobs/receitaExpiry.job.js` | diária | expirar linhas de receita vencidas e cancelar pedidos pendentes afetados |
| Higiene | `src/jobs/higiene.job.js` | mensal | marcar utentes removidos antigos como inválidos/arquivados por rotina |
| Purge History | `src/jobs/purgeHistory.job.js` | mensal | remover histórico antigo de pedidos fechados e regularizações concluídas |

---

## 2. Registo dos jobs no arranque

O servidor arranca em:

```txt
src/app/server.js
```

Durante o `server.listen`, é chamada a função:

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

## 3. Variáveis de ambiente relacionadas

As variáveis são carregadas em:

```txt
src/config/env.js
```

### Ativação/desativação dos jobs

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

### Timezone

```env
TZ=Europe/Lisbon
```

Todos os cron jobs usam esta timezone.

### Expressões cron

```env
CRON_MONTHLY_03H=0 3 1 * *
CRON_DAILY_03H=0 3 * * *
```

| Variável | Valor padrão | Interpretação |
|---|---|---|
| `CRON_DAILY_03H` | `0 3 * * *` | todos os dias às 03:00 |
| `CRON_MONTHLY_03H` | `0 3 1 * *` | dia 1 de cada mês às 03:00 |

### Offsets temporais

```env
HIGIENE_OFFSET_MONTHS=12
PURGE_OFFSET_MONTHS=6
```

| Variável | Valor padrão | Função |
|---|---:|---|
| `HIGIENE_OFFSET_MONTHS` | `12` | considera utentes removidos há pelo menos 12 meses |
| `PURGE_OFFSET_MONTHS` | `6` | remove histórico fechado há pelo menos 6 meses |

### Anonimização

```env
HIGIENE_ANONYMIZE=false
ALLOW_HIGIENE_ANONYMIZE=false
```

| Variável | Valor padrão | Função |
|---|---:|---|
| `HIGIENE_ANONYMIZE` | `false` | pede anonimização no job |
| `ALLOW_HIGIENE_ANONYMIZE` | `false` | permite de facto aplicar anonimização |

A anonimização só acontece se **ambas** estiverem a `true`.

---

## 4. Job: Receita Expiry

### Ficheiro

```txt
src/jobs/receitaExpiry.job.js
```

### Função principal

```js
runOnce()
```

### Função de preview

```js
preview()
```

### Frequência padrão

```env
CRON_DAILY_03H=0 3 * * *
```

Por defeito, corre todos os dias às 03:00.

---

## 4.1 O que este job faz

O job procura linhas de receita que estejam:

```txt
status = ATIVA
validade <= agora
```

Quando encontra linhas expiradas:

1. marca essas linhas como `EXPIRADA`;
2. procura pedidos pendentes com itens associados a essas linhas;
3. cancela os itens pendentes desses pedidos;
4. cancela os pedidos pendentes afetados;
5. guarda uma razão de fecho automática.

A razão usada é:

```txt
Cancelado automaticamente por expiração da receita.
```

---

## 4.2 Estados afetados

### ReceitaLinha

Antes:

```txt
ATIVA
```

Depois:

```txt
EXPIRADA
```

### PedidoItem

Antes:

```txt
PENDENTE
```

Depois:

```txt
CANCELADO_POR_EXPIRACAO
```

### Pedido

Antes:

```txt
PENDENTE
```

Depois:

```txt
CANCELADO
```

Com:

```txt
closedReason = "Cancelado automaticamente por expiração da receita."
```

---

## 4.3 Preview

O preview devolve informação sem alterar dados.

Exemplo de resposta conceptual:

```json
{
  "checkedAt": "2026-05-28T03:00:00.000Z",
  "expiredLines": 3,
  "pendingItemsFromExpiredLines": 2,
  "affectedPedidos": 1,
  "pendingItemsFromAffectedPedidos": 4
}
```

### Quando usar preview

Usa preview antes de executar manualmente o job em ambiente sensível.

---

## 4.4 Execução manual por NPM

```bash
npm run job:receita-expiry
```

Este comando chama diretamente:

```js
require('./src/jobs/receitaExpiry.job').runOnce()
```

---

## 4.5 Execução manual por API

Apenas `ADMIN`.

```http
GET /api/manutencao/jobs/receita-expiry/preview
POST /api/manutencao/jobs/receita-expiry/run
```

---

## 4.6 Riscos e cuidados

Este job altera dados reais.

Antes de correr manualmente em produção:

- confirma a timezone;
- confirma a data atual do servidor;
- faz preview;
- valida se há pedidos pendentes importantes;
- confirma que a regra de expiração é desejada;
- não corras repetidamente sem necessidade.

O job é seguro para repetir no sentido em que linhas já expiradas deixam de cumprir `status = ATIVA`, mas continua a ser uma operação com impacto real.

---

# 5. Job: Higiene

### Ficheiro

```txt
src/jobs/higiene.job.js
```

### Função principal

```js
runOnce()
```

### Função de preview

```js
preview()
```

### Frequência padrão

```env
CRON_MONTHLY_03H=0 3 1 * *
```

Por defeito, corre no dia 1 de cada mês às 03:00.

---

## 5.1 O que este job faz

O job procura utentes com:

```txt
deletedAt <= cutoffDate
```

E que ainda não tenham sido tratados pela rotina de higiene.

O cutoff é calculado com:

```txt
data atual - HIGIENE_OFFSET_MONTHS
```

Por defeito:

```txt
data atual - 12 meses
```

---

## 5.2 Marcador interno

O job usa o marcador:

```txt
[HIGIENE]
```

Este marcador é colocado no campo `invalidReason`.

Serve para impedir que o mesmo utente seja processado repetidamente pela rotina.

---

## 5.3 Comportamento sem anonimização

Quando a anonimização não está ativa, o job atualiza:

```txt
isValid = false
invalidReason = "[HIGIENE] Utente arquivado por rotina de higiene."
```

Não altera nome nem número do utente.

---

## 5.4 Comportamento com anonimização

A anonimização só é aplicada se:

```env
HIGIENE_ANONYMIZE=true
ALLOW_HIGIENE_ANONYMIZE=true
```

Quando aplicada, atualiza:

```txt
nome = "Utente removido"
numero9 = "000000000"
isValid = false
invalidReason = "[HIGIENE] Utente arquivado e anonimizado por rotina de higiene."
```

---

## 5.5 Preview

Exemplo conceptual:

```json
{
  "cutoffDate": "2025-05-28T00:00:00.000Z",
  "offsetMonths": 12,
  "candidatos": 4
}
```

---

## 5.6 Execução manual por NPM

```bash
npm run job:higiene
```

---

## 5.7 Execução manual por API

Apenas `ADMIN`.

```http
GET /api/manutencao/jobs/higiene/preview
POST /api/manutencao/jobs/higiene/run
```

### Query/body suportado

```json
{
  "offsetMonths": 12,
  "anonymize": false
}
```

---

## 5.8 Riscos e cuidados

Este job pode alterar dados sensíveis.

Antes de ativar anonimização:

- confirma requisitos legais;
- confirma se o histórico ainda precisa de identificação nominal;
- confirma se `numero9 = "000000000"` não viola restrições únicas;
- confirma se os dados podem ser anonimizados sem quebrar auditoria.

Má prática grave:

```env
HIGIENE_ANONYMIZE=true
ALLOW_HIGIENE_ANONYMIZE=true
```

sem teres validado o impacto legal e funcional.

---

# 6. Job: Purge History

### Ficheiro

```txt
src/jobs/purgeHistory.job.js
```

### Função principal

```js
runOnce()
```

### Função de preview

```js
preview()
```

### Frequência padrão

```env
CRON_MONTHLY_03H=0 3 1 * *
```

Por defeito, corre no dia 1 de cada mês às 03:00.

---

## 6.1 O que este job faz

Remove dados antigos de histórico, nomeadamente:

- pedidos fechados antigos;
- itens dos pedidos removidos;
- dispensas associadas aos itens removidos;
- regularizações concluídas antigas;
- eventos das regularizações removidas.

---

## 6.2 Pedidos elegíveis para remoção

Um pedido pode ser removido se estiver num destes estados:

```txt
VALIDADO
REJEITADO
CANCELADO
```

E se estiver fora do período de retenção definido por:

```env
PURGE_OFFSET_MONTHS=6
```

### Campos usados para calcular antiguidade

| Estado | Campo usado |
|---|---|
| `VALIDADO` | `validatedAt` |
| `REJEITADO` | `rejectedAt` |
| `CANCELADO` | `updatedAt`, quando não tem `validatedAt` nem `rejectedAt` |

---

## 6.3 Regularizações elegíveis para remoção

Uma regularização pode ser removida se:

```txt
status = REGULARIZADO
updatedAt <= cutoffDate
```

---

## 6.4 Ordem de limpeza

A limpeza é feita dentro de uma transação.

### Regularizações

1. encontrar regularizações concluídas antigas;
2. remover eventos associados;
3. remover regularizações.

### Pedidos

1. encontrar pedidos fechados antigos;
2. encontrar itens desses pedidos;
3. desvincular regularizações que apontem para esses pedidos;
4. remover dispensas associadas aos itens;
5. remover itens dos pedidos;
6. remover pedidos.

---

## 6.5 Porque as regularizações são desvinculadas antes de remover pedidos

Algumas regularizações podem manter referência ao pedido original.

Antes de remover pedidos antigos, o job faz:

```txt
regularizacaoExtra.pedidoId = null
```

Isto evita violar integridade referencial e mantém a regularização quando ela ainda não é elegível para purge.

---

## 6.6 Preview

Exemplo conceptual:

```json
{
  "cutoffDate": "2025-11-28T00:00:00.000Z",
  "offsetMonths": 6,
  "pedidos": 12,
  "pedidoItens": 30,
  "dispensas": 18,
  "regularizacoes": 5,
  "eventos": 7
}
```

---

## 6.7 Execução manual por NPM

```bash
npm run job:purge-history
```

---

## 6.8 Execução manual por API

Apenas `ADMIN`.

```http
GET /api/manutencao/jobs/purge-history/preview
POST /api/manutencao/jobs/purge-history/run
```

### Query/body suportado

```json
{
  "offsetMonths": 6
}
```

---

## 6.9 Riscos e cuidados

Este job apaga dados.

Antes de correr manualmente em produção:

- confirma que existe backup;
- executa preview;
- valida a quantidade de registos a apagar;
- confirma se o período de retenção está correto;
- não uses `offsetMonths` demasiado baixo sem razão forte.

Má prática grave:

```json
{
  "offsetMonths": 0
}
```

Isto pode remover histórico fechado muito recente.

---

# 7. Endpoints de manutenção

Todas as rotas de manutenção estão protegidas por:

```txt
requireAuth
requireRole(["ADMIN"])
```

Prefixo base:

```txt
/api/manutencao
```

---

## 7.1 Listar jobs disponíveis

```http
GET /api/manutencao/jobs
```

Resposta conceptual:

```json
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

## 7.2 Receita Expiry

```http
GET /api/manutencao/jobs/receita-expiry/preview
POST /api/manutencao/jobs/receita-expiry/run
```

---

## 7.3 Higiene

```http
GET /api/manutencao/jobs/higiene/preview
POST /api/manutencao/jobs/higiene/run
```

---

## 7.4 Purge History

```http
GET /api/manutencao/jobs/purge-history/preview
POST /api/manutencao/jobs/purge-history/run
```

---

# 8. Comandos NPM disponíveis

Definidos em:

```txt
package.json
```

```bash
npm run job:receita-expiry
npm run job:higiene
npm run job:purge-history
```

Também existem scripts de teste manual referenciados:

```bash
npm run test:receita-expiry
npm run test:higiene
npm run test:purge-history
```

Atenção: estes scripts dependem da existência dos ficheiros em `scripts/`.

---

# 9. Relação com as regras de negócio

Os jobs não são tarefas isoladas.

Eles afetam diretamente entidades centrais:

| Job | Entidades afetadas |
|---|---|
| Receita Expiry | `ReceitaLinha`, `Pedido`, `PedidoItem` |
| Higiene | `Utente` |
| Purge History | `Pedido`, `PedidoItem`, `Dispensa`, `RegularizacaoExtra`, `RegularizacaoEvento` |

Antes de alterar um job, confirma sempre:

- regras de negócio;
- modelo Prisma;
- rotas de manutenção;
- testes manuais;
- impacto no frontend;
- impacto em auditoria.

---

# 10. Checklist antes de alterar jobs

Antes de alterar qualquer job:

- [ ] Confirmar regra de negócio no `BUSINESS_RULES.md`.
- [ ] Confirmar modelos no `schema.prisma`.
- [ ] Confirmar impacto em rotas existentes.
- [ ] Confirmar impacto em dashboards.
- [ ] Confirmar impacto em histórico/auditoria.
- [ ] Adicionar ou atualizar testes.
- [ ] Executar preview quando existir.
- [ ] Testar em base de dados local.
- [ ] Validar edge cases.
- [ ] Atualizar documentação.

---

# 11. Checklist antes de correr manualmente em produção

- [ ] Confirmar que estás no ambiente certo.
- [ ] Confirmar `.env`.
- [ ] Confirmar `DATABASE_URL`.
- [ ] Confirmar `TZ`.
- [ ] Confirmar offsets.
- [ ] Executar preview.
- [ ] Guardar output do preview.
- [ ] Confirmar que existe backup.
- [ ] Executar apenas se o resultado esperado estiver correto.
- [ ] Guardar output do run.
- [ ] Verificar dashboards depois da execução.

---

# 12. Edge cases conhecidos

## Receita Expiry

- Uma receita pode expirar enquanto existe pedido pendente.
- Um pedido pode ter vários itens; se um item de receita expirar, o pedido afetado é cancelado.
- Linhas já expiradas não voltam a ser processadas.

## Higiene

- Utentes sem `deletedAt` não são processados.
- Utentes já marcados com `[HIGIENE]` não são reprocessados.
- A anonimização só ocorre com dupla confirmação por `.env`.

## Purge History

- Só remove pedidos fechados.
- Não remove pedidos pendentes.
- Regularizações ainda pendentes não são removidas.
- Regularizações ligadas a pedidos removidos são desvinculadas quando necessário.

---

# 13. Decisões arquiteturais atuais

## Jobs têm `preview` e `runOnce`

Boa prática.

Permite validar impacto antes da execução real.

## Jobs usam transações quando apagam/alteram múltiplas entidades

Boa prática.

Evita base de dados parcialmente alterada em caso de falha.

## Jobs são registados uma só vez com flags globais

Boa prática para desenvolvimento com reload/hot restart.

Evita múltiplas instâncias do mesmo cron no mesmo processo.

## Jobs são controláveis por `.env`

Boa prática.

Permite desligar jobs por ambiente.

---

# 14. Melhorias futuras recomendadas

## 14.1 Criar tabela de logs de jobs

Atualmente os jobs usam `console.log`.

Recomendado criar uma tabela, por exemplo:

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

Isto permitiria auditoria real.

---

## 14.2 Registar execuções manuais por utilizador

Quando um `ADMIN` executa um job por API, o backend deveria guardar:

- id do utilizador;
- data;
- job executado;
- parâmetros usados;
- resultado;
- erro, se existir.

---

## 14.3 Separar jobs destrutivos por confirmação forte

Para `purge-history`, no futuro pode ser exigido payload como:

```json
{
  "confirm": "PURGE_HISTORY"
}
```

Isto reduz o risco de execução acidental.

---

## 14.4 Adicionar testes automatizados

Prioridade recomendada:

1. `receitaExpiry.job.test.js`
2. `higiene.job.test.js`
3. `purgeHistory.job.test.js`

---

# 15. Convenções para novos jobs

Ao criar um novo job, seguir este padrão:

```txt
src/jobs/nomeDoJob.job.js
```

Deve exportar:

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
- testes manuais/automatizados.

---

# 16. Resumo final

Os jobs de manutenção são parte crítica do backend.

Eles não servem apenas para limpeza técnica; aplicam regras de negócio importantes:

- receitas expiradas deixam de poder sustentar pedidos;
- pedidos pendentes afetados por expiração são cancelados;
- utentes removidos antigos são tratados por higiene;
- histórico fechado antigo pode ser eliminado;
- regularizações concluídas antigas podem ser purgadas.

Qualquer alteração nestes jobs deve ser tratada como alteração sensível de domínio.
