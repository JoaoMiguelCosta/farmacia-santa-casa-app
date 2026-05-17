# API Routes — Farmácia Santa Casa V2

Documentação das rotas atuais do backend.

Base URL local:

```txt
http://localhost:3001/api
```

---

## 1. Health Checks

### GET `/health`

Verifica se a API está ativa.

#### Exemplo

```bash
curl "http://localhost:3001/api/health"
```

#### Resposta esperada

```json
{
  "status": "ok",
  "service": "farmacia-santacasa-api",
  "timestamp": "2026-05-12T00:00:00.000Z"
}
```

---

### GET `/santacasa/health`

Verifica se o contexto Santa Casa está ativo.

#### Exemplo

```bash
curl "http://localhost:3001/api/santacasa/health"
```

#### Resposta esperada

```json
{
  "status": "ok",
  "context": "santacasa"
}
```

---

### GET `/farmacia/health`

Verifica se o contexto Farmácia está ativo.

#### Exemplo

```bash
curl "http://localhost:3001/api/farmacia/health"
```

#### Resposta esperada

```json
{
  "status": "ok",
  "context": "farmacia"
}
```

---

## 2. Santa Casa — Utentes

### Rotas

| Método | Rota                           | Descrição                    |
| ------ | ------------------------------ | ---------------------------- |
| GET    | `/santacasa/utentes`           | Lista utentes ativos         |
| GET    | `/santacasa/utentes/:utenteId` | Obtém um utente por ID       |
| POST   | `/santacasa/utentes`           | Cria um utente               |
| DELETE | `/santacasa/utentes/:utenteId` | Remove logicamente um utente |

---

### GET `/santacasa/utentes`

Lista todos os utentes ativos.

#### Exemplo

```bash
curl "http://localhost:3001/api/santacasa/utentes"
```

#### Resposta

```json
{
  "data": [
    {
      "id": "utente_id",
      "numero9": "111111111",
      "nome": "João Miguel Costa",
      "isValid": true,
      "invalidReason": null,
      "deletedAt": null,
      "createdAt": "2026-05-12T00:00:00.000Z",
      "updatedAt": "2026-05-12T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/santacasa/utentes/:utenteId`

Obtém um utente pelo ID interno.

#### Exemplo

```bash
curl "http://localhost:3001/api/santacasa/utentes/UTENTE_ID"
```

#### Resposta

```json
{
  "data": {
    "id": "utente_id",
    "numero9": "111111111",
    "nome": "João Miguel Costa",
    "isValid": true,
    "invalidReason": null,
    "deletedAt": null,
    "createdAt": "2026-05-12T00:00:00.000Z",
    "updatedAt": "2026-05-12T00:00:00.000Z"
  }
}
```

---

### POST `/santacasa/utentes`

Cria um novo utente.

#### Body

```json
{
  "numero9": "111111111",
  "nome": "João Miguel Costa"
}
```

#### Exemplo

```bash
curl -X POST "http://localhost:3001/api/santacasa/utentes" \
  -H "Content-Type: application/json" \
  -d "{\"numero9\":\"111111111\",\"nome\":\"João Miguel Costa\"}"
```

#### Regras

- `numero9` é obrigatório.
- `numero9` deve ter exatamente 9 dígitos.
- `nome` é obrigatório.
- Não permite outro utente ativo com o mesmo `numero9`.
- Não permite outro utente ativo com o mesmo `nome`.

#### Resposta

```json
{
  "data": {
    "id": "utente_id",
    "numero9": "111111111",
    "nome": "João Miguel Costa",
    "isValid": true,
    "invalidReason": null,
    "deletedAt": null,
    "createdAt": "2026-05-12T00:00:00.000Z",
    "updatedAt": "2026-05-12T00:00:00.000Z"
  }
}
```

#### Erros comuns

```json
{
  "error": "BAD_REQUEST",
  "message": "O campo 'numero9' deve ter exatamente 9 dígitos."
}
```

```json
{
  "error": "CONFLICT",
  "message": "Já existe um utente ativo com esse número."
}
```

---

### DELETE `/santacasa/utentes/:utenteId`

Remove logicamente um utente.

#### Exemplo

```bash
curl -X DELETE "http://localhost:3001/api/santacasa/utentes/UTENTE_ID"
```

#### Comportamento

Não apaga fisicamente da base de dados. Faz soft delete:

- `isValid: false`
- `deletedAt` preenchido
- `invalidReason` preenchido

#### Bloqueios

Não permite remover utente com:

- Extras em aberto;
- regularizações em aberto;
- itens pendentes em pedidos.

#### Resposta esperada

```txt
204 No Content
```

---

## 3. Santa Casa — Sem Receita

### Rotas

| Método | Rota                                                     | Descrição                                  |
| ------ | -------------------------------------------------------- | ------------------------------------------ |
| GET    | `/santacasa/utentes/:utenteId/sem-receita`               | Lista medicamentos sem receita disponíveis |
| POST   | `/santacasa/utentes/:utenteId/sem-receita`               | Cria medicamento sem receita               |
| DELETE | `/santacasa/utentes/:utenteId/sem-receita/:semReceitaId` | Remove medicamento sem receita             |

---

### GET `/santacasa/utentes/:utenteId/sem-receita`

Lista medicamentos sem receita disponíveis para um utente.

#### Exemplo

```bash
curl "http://localhost:3001/api/santacasa/utentes/UTENTE_ID/sem-receita"
```

#### Resposta

```json
{
  "data": [
    {
      "id": "sem_receita_id",
      "utenteId": "utente_id",
      "medicamento": "Ben-u-ron",
      "quantidade": 2,
      "createdAt": "2026-05-12T00:00:00.000Z",
      "updatedAt": "2026-05-12T00:00:00.000Z",
      "quantidadeDispensada": 0,
      "quantidadeReservadaPendente": 0,
      "quantidadeRestante": 2
    }
  ]
}
```

---

### POST `/santacasa/utentes/:utenteId/sem-receita`

Cria medicamento sem receita para um utente.

#### Body principal

```json
{
  "medicamento": "Ben-u-ron",
  "quantidade": 2
}
```

#### Body alternativo aceite

```json
{
  "nome": "Ben-u-ron",
  "quantidade": 2
}
```

#### Exemplo

```bash
curl -X POST "http://localhost:3001/api/santacasa/utentes/UTENTE_ID/sem-receita" \
  -H "Content-Type: application/json" \
  -d "{\"medicamento\":\"Ben-u-ron\",\"quantidade\":2}"
```

#### Regras

- Utente tem de existir.
- Utente não pode estar removido.
- `medicamento` é obrigatório.
- `quantidade` tem de ser inteiro maior que 0.

#### Resposta

```json
{
  "data": {
    "id": "sem_receita_id",
    "utenteId": "utente_id",
    "medicamento": "Ben-u-ron",
    "quantidade": 2,
    "quantidadeDispensada": 0,
    "quantidadeReservadaPendente": 0,
    "quantidadeRestante": 2,
    "createdAt": "2026-05-12T00:00:00.000Z",
    "updatedAt": "2026-05-12T00:00:00.000Z"
  }
}
```

---

### DELETE `/santacasa/utentes/:utenteId/sem-receita/:semReceitaId`

Remove medicamento sem receita.

#### Exemplo

```bash
curl -X DELETE "http://localhost:3001/api/santacasa/utentes/UTENTE_ID/sem-receita/SEM_RECEITA_ID"
```

#### Bloqueios

Não permite remover se já estiver associado a qualquer pedido.

#### Resposta esperada

```txt
204 No Content
```

---

## 4. Santa Casa — Receitas

### Rotas

| Método | Rota                                                    | Descrição                                |
| ------ | ------------------------------------------------------- | ---------------------------------------- |
| GET    | `/santacasa/utentes/:utenteId/receitas`                 | Lista linhas de receita ativas com saldo |
| POST   | `/santacasa/utentes/:utenteId/receitas`                 | Cria receita com linhas                  |
| DELETE | `/santacasa/utentes/:utenteId/receitas/linhas/:linhaId` | Remove linha de receita                  |

---

### GET `/santacasa/utentes/:utenteId/receitas`

Lista linhas de receita ativas com saldo disponível.

#### Exemplo

```bash
curl "http://localhost:3001/api/santacasa/utentes/UTENTE_ID/receitas"
```

#### Resposta

```json
{
  "data": [
    {
      "linhaId": "linha_id",
      "receitaId": "receita_id",
      "utenteId": "utente_id",
      "numero19": "1234567890123456789",
      "pinAcesso6": "123456",
      "pinOpcao4": "1234",
      "medicamentoId": null,
      "medicamento": "Paracetamol 1000mg",
      "quantidade": 2,
      "quantidadeDispensada": 0,
      "quantidadeReservadaPendente": 0,
      "quantidadeRestante": 2,
      "validade": "2027-12-31T00:00:00.000Z",
      "status": "ATIVA",
      "createdAt": "2026-05-12T00:00:00.000Z",
      "updatedAt": "2026-05-12T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/santacasa/utentes/:utenteId/receitas`

Cria uma receita com uma ou mais linhas.

#### Body

```json
{
  "numero19": "1234567890123456789",
  "pinAcesso6": "123456",
  "pinOpcao4": "1234",
  "linhas": [
    {
      "medicamento": "Paracetamol 1000mg",
      "quantidade": 2,
      "validade": "2027-12-31"
    }
  ]
}
```

#### Exemplo

```bash
curl -X POST "http://localhost:3001/api/santacasa/utentes/UTENTE_ID/receitas" \
  -H "Content-Type: application/json" \
  -d "{\"numero19\":\"1234567890123456789\",\"pinAcesso6\":\"123456\",\"pinOpcao4\":\"1234\",\"linhas\":[{\"medicamento\":\"Paracetamol 1000mg\",\"quantidade\":2,\"validade\":\"2027-12-31\"}]}"
```

#### Regras

- `numero19` deve ter exatamente 19 dígitos.
- `pinAcesso6` deve ter exatamente 6 dígitos.
- `pinOpcao4` deve ter exatamente 4 dígitos.
- Deve existir pelo menos uma linha.
- Cada linha deve ter medicamento, quantidade e validade.
- A validade deve ser futura.
- Não permite repetir o mesmo medicamento na mesma receita.
- Não permite criar receita com `numero19` já existente.
- Ao criar nova receita, tenta regularizar automaticamente Extras pendentes compatíveis.

#### Resposta

```json
{
  "data": {
    "receitaId": "receita_id",
    "utenteId": "utente_id",
    "numero19": "1234567890123456789",
    "pinAcesso6": "123456",
    "pinOpcao4": "1234",
    "linhas": [
      {
        "linhaId": "linha_id",
        "receitaId": "receita_id",
        "utenteId": "utente_id",
        "numero19": "1234567890123456789",
        "pinAcesso6": "123456",
        "pinOpcao4": "1234",
        "medicamentoId": null,
        "medicamento": "Paracetamol 1000mg",
        "quantidade": 2,
        "quantidadeDispensada": 0,
        "quantidadeReservadaPendente": 0,
        "quantidadeRestante": 2,
        "validade": "2027-12-31T00:00:00.000Z",
        "status": "ATIVA"
      }
    ],
    "createdAt": "2026-05-12T00:00:00.000Z",
    "updatedAt": "2026-05-12T00:00:00.000Z"
  }
}
```

---

### DELETE `/santacasa/utentes/:utenteId/receitas/linhas/:linhaId`

Remove uma linha de receita.

#### Exemplo

```bash
curl -X DELETE "http://localhost:3001/api/santacasa/utentes/UTENTE_ID/receitas/linhas/LINHA_ID"
```

#### Bloqueios

Não permite remover se:

- já tem quantidade dispensada;
- tem dispensas associadas;
- está associada a pedidos;
- foi usada em regularizações.

#### Resposta esperada

```txt
204 No Content
```

---

## 5. Santa Casa — Extras / Venda Suspensa

### Rotas

| Método | Rota                                           | Descrição              |
| ------ | ---------------------------------------------- | ---------------------- |
| GET    | `/santacasa/utentes/:utenteId/extras`          | Lista Extras em aberto |
| POST   | `/santacasa/utentes/:utenteId/extras`          | Cria Extra             |
| DELETE | `/santacasa/utentes/:utenteId/extras/:extraId` | Remove Extra           |

---

### GET `/santacasa/utentes/:utenteId/extras`

Lista Extras em aberto para um utente.

#### Exemplo

```bash
curl "http://localhost:3001/api/santacasa/utentes/UTENTE_ID/extras"
```

#### Resposta

```json
{
  "data": [
    {
      "id": "extra_id",
      "utenteId": "utente_id",
      "medicamentoId": null,
      "medicamento": "Medicamento Extra Teste",
      "quantidadeSolicitada": 3,
      "quantidadeRegularizada": 0,
      "quantidadeReservadaPendente": 0,
      "quantidadeRestante": 3,
      "status": "PENDENTE",
      "createdAt": "2026-05-12T00:00:00.000Z",
      "updatedAt": "2026-05-12T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/santacasa/utentes/:utenteId/extras`

Cria Extra para um utente.

#### Body principal

```json
{
  "medicamento": "Medicamento Extra Teste",
  "quantidadeSolicitada": 3
}
```

#### Body alternativo aceite

```json
{
  "nome": "Medicamento Extra Teste",
  "quantidade": 3
}
```

#### Exemplo

```bash
curl -X POST "http://localhost:3001/api/santacasa/utentes/UTENTE_ID/extras" \
  -H "Content-Type: application/json" \
  -d "{\"medicamento\":\"Medicamento Extra Teste\",\"quantidadeSolicitada\":3}"
```

#### Regras

- Utente tem de existir.
- Utente não pode estar removido.
- Não permite criar Extra se já existir receita ativa com quantidade disponível para o mesmo medicamento.
- Não permite duplicar Extra em aberto para o mesmo medicamento.
- Quantidade tem de ser maior que 0.

#### Resposta

```json
{
  "data": {
    "id": "extra_id",
    "utenteId": "utente_id",
    "medicamentoId": null,
    "medicamento": "Medicamento Extra Teste",
    "quantidadeSolicitada": 3,
    "quantidadeRegularizada": 0,
    "quantidadeReservadaPendente": 0,
    "quantidadeRestante": 3,
    "status": "PENDENTE",
    "createdAt": "2026-05-12T00:00:00.000Z",
    "updatedAt": "2026-05-12T00:00:00.000Z"
  }
}
```

---

### DELETE `/santacasa/utentes/:utenteId/extras/:extraId`

Remove um Extra.

#### Exemplo

```bash
curl -X DELETE "http://localhost:3001/api/santacasa/utentes/UTENTE_ID/extras/EXTRA_ID"
```

#### Bloqueios

Não permite remover se já estiver associado a pedidos.

#### Resposta esperada

```txt
204 No Content
```

---

## 6. Santa Casa — Pedidos

### Rotas

| Método | Rota                           | Descrição                           |
| ------ | ------------------------------ | ----------------------------------- |
| POST   | `/santacasa/pedidos`           | Cria pedido pendente                |
| GET    | `/santacasa/pedidos/:pedidoId` | Obtém pedido por ID                 |
| GET    | `/santacasa/pedidos/historico` | Lista histórico de pedidos fechados |

---

### POST `/santacasa/pedidos`

Cria um pedido pendente com itens de receita, sem receita e/ou extra.

#### Body

```json
{
  "items": [
    {
      "utenteId": "UTENTE_ID",
      "tipo": "COM_RECEITA",
      "id": "LINHA_RECEITA_ID",
      "quantidade": 1
    },
    {
      "utenteId": "UTENTE_ID",
      "tipo": "SEM_RECEITA",
      "id": "SEM_RECEITA_ID",
      "quantidade": 1
    },
    {
      "utenteId": "UTENTE_ID",
      "tipo": "EXTRA",
      "id": "EXTRA_ID",
      "quantidade": 1
    }
  ]
}
```

#### Tipos aceites

```txt
COM_RECEITA
SEM_RECEITA
EXTRA
```

#### Aliases internos aceites

```txt
RECEITA
RECEITA_LINHA
```

#### Exemplo

```bash
curl -X POST "http://localhost:3001/api/santacasa/pedidos" \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"utenteId\":\"UTENTE_ID\",\"tipo\":\"COM_RECEITA\",\"id\":\"LINHA_RECEITA_ID\",\"quantidade\":1}]}"
```

#### Regras

- Pedido deve ter pelo menos um item.
- Cada item deve ter `utenteId`, `tipo`, `id` e `quantidade`.
- Quantidade tem de ser maior que 0.
- Utente tem de existir e estar ativo.
- Cada item tem de pertencer ao utente indicado.
- Não permite quantidade superior ao saldo disponível.
- Ao criar, pedido e itens ficam `PENDENTE`.

#### Resposta

```json
{
  "data": {
    "id": "pedido_id",
    "numero": 1,
    "status": "PENDENTE",
    "validatedAt": null,
    "validatedById": null,
    "rejectedAt": null,
    "closedReason": null,
    "itens": [
      {
        "id": "pedido_item_id",
        "pedidoId": "pedido_id",
        "utenteId": "utente_id",
        "tipo": "COM_RECEITA",
        "status": "PENDENTE",
        "medicamento": "Paracetamol 1000mg",
        "quantidade": 1,
        "receitaLinhaId": "linha_id",
        "semReceitaId": null,
        "extraId": null
      }
    ],
    "createdAt": "2026-05-12T00:00:00.000Z",
    "updatedAt": "2026-05-12T00:00:00.000Z"
  }
}
```

---

### GET `/santacasa/pedidos/:pedidoId`

Obtém um pedido por ID.

#### Exemplo

```bash
curl "http://localhost:3001/api/santacasa/pedidos/PEDIDO_ID"
```

---

### GET `/santacasa/pedidos/historico`

Lista pedidos fechados.

#### Query params

| Param    | Exemplo                   | Descrição                                  |
| -------- | ------------------------- | ------------------------------------------ |
| `status` | `VALIDADO` ou `REJEITADO` | Filtra por estado                          |
| `from`   | `2026-01-01`              | Data inicial                               |
| `to`     | `2026-12-31`              | Data final                                 |
| `search` | `João`                    | Pesquisa por utente, número ou medicamento |
| `skip`   | `0`                       | Paginação                                  |
| `take`   | `50`                      | Limite                                     |

#### Exemplo

```bash
curl "http://localhost:3001/api/santacasa/pedidos/historico?status=VALIDADO&search=João"
```

#### Resposta

```json
{
  "rows": [],
  "total": 0,
  "params": {
    "skip": 0,
    "take": 50,
    "search": "",
    "status": null
  }
}
```

---

## 7. Farmácia — Pedidos

### Rotas

| Método | Rota                                   | Descrição                     |
| ------ | -------------------------------------- | ----------------------------- |
| GET    | `/farmacia/pedidos`                    | Lista pedidos para a farmácia |
| POST   | `/farmacia/pedidos/:pedidoId/validar`  | Valida pedido                 |
| POST   | `/farmacia/pedidos/:pedidoId/rejeitar` | Rejeita pedido                |

---

### GET `/farmacia/pedidos`

Lista pedidos para a Farmácia.

#### Query params

| Param    | Exemplo                                          | Descrição          |
| -------- | ------------------------------------------------ | ------------------ |
| `status` | `PENDENTE`, `VALIDADO`, `REJEITADO`, `CANCELADO` | Estado dos pedidos |
| `skip`   | `0`                                              | Paginação          |
| `take`   | `50`                                             | Limite             |

#### Default

```txt
status=PENDENTE
```

#### Exemplo

```bash
curl "http://localhost:3001/api/farmacia/pedidos"
```

---

### POST `/farmacia/pedidos/:pedidoId/validar`

Valida um pedido pendente.

#### Body opcional

```json
{
  "validatedById": "user_id"
}
```

#### Exemplo

```bash
curl -X POST "http://localhost:3001/api/farmacia/pedidos/PEDIDO_ID/validar"
```

#### Efeitos por tipo de item

##### COM_RECEITA

- Cria `Dispensa`.
- Incrementa `quantidadeDispensada` na linha da receita.
- Item passa para `VALIDADO`.

##### SEM_RECEITA

- Reduz a quantidade disponível.
- Item passa para `VALIDADO`.

##### EXTRA

- Cria `RegularizacaoExtra`.
- Reduz o saldo do Extra.
- Item passa para `VALIDADO`.

##### Pedido

- Passa para `VALIDADO`.
- Preenche `validatedAt`.
- Preenche `validatedById`, se enviado.

---

### POST `/farmacia/pedidos/:pedidoId/rejeitar`

Rejeita um pedido pendente.

#### Body

```json
{
  "motivo": "Motivo da rejeição"
}
```

#### Exemplo

```bash
curl -X POST "http://localhost:3001/api/farmacia/pedidos/PEDIDO_ID/rejeitar" \
  -H "Content-Type: application/json" \
  -d "{\"motivo\":\"Teste automático de rejeição\"}"
```

#### Efeitos

- Pedido passa para `REJEITADO`.
- Itens pendentes passam para `REJEITADO`.
- Preenche `rejectedAt`.
- Guarda `closedReason`.

---

## 8. Farmácia — Regularizações

### Rotas

| Método | Rota                                 | Descrição                       |
| ------ | ------------------------------------ | ------------------------------- |
| GET    | `/farmacia/regularizacoes/pendentes` | Lista regularizações pendentes  |
| GET    | `/farmacia/regularizacoes/historico` | Lista regularizações concluídas |
| GET    | `/farmacia/regularizacoes/sinal`     | Mostra resumo de eventos        |

---

### GET `/farmacia/regularizacoes/pendentes`

Lista regularizações pendentes ou parcialmente regularizadas.

#### Query params

| Param         | Exemplo     | Descrição              |
| ------------- | ----------- | ---------------------- |
| `utenteId`    | `UTENTE_ID` | Filtra por utente      |
| `medicamento` | `Ben-u-ron` | Filtra por medicamento |
| `skip`        | `0`         | Paginação              |
| `take`        | `50`        | Limite                 |

#### Exemplo

```bash
curl "http://localhost:3001/api/farmacia/regularizacoes/pendentes?utenteId=UTENTE_ID"
```

---

### GET `/farmacia/regularizacoes/historico`

Lista regularizações concluídas.

#### Query params

| Param         | Exemplo     | Descrição              |
| ------------- | ----------- | ---------------------- |
| `utenteId`    | `UTENTE_ID` | Filtra por utente      |
| `medicamento` | `Ben-u-ron` | Filtra por medicamento |
| `skip`        | `0`         | Paginação              |
| `take`        | `50`        | Limite                 |

#### Exemplo

```bash
curl "http://localhost:3001/api/farmacia/regularizacoes/historico?utenteId=UTENTE_ID"
```

---

### GET `/farmacia/regularizacoes/sinal`

Resumo de regularizações.

#### Exemplo

```bash
curl "http://localhost:3001/api/farmacia/regularizacoes/sinal"
```

#### Resposta

```json
{
  "totalEventos": 1,
  "totalUnidades": 1,
  "latestEventoAt": "2026-05-12T00:00:00.000Z"
}
```

---

## 9. Farmácia — Dashboard

### GET `/farmacia/dashboard/sinais`

Resumo geral para dashboard.

#### Exemplo

```bash
curl "http://localhost:3001/api/farmacia/dashboard/sinais"
```

#### Resposta

```json
{
  "pedidos": {
    "pendentes": 0,
    "validados": 1,
    "rejeitados": 1,
    "cancelados": 0
  },
  "regularizacoes": {
    "pendentes": 0,
    "historico": 1,
    "totalEventos": 1,
    "totalUnidades": 1,
    "latestEventoAt": "2026-05-12T00:00:00.000Z"
  },
  "latestPedido": {
    "id": "pedido_id",
    "numero": 1,
    "status": "VALIDADO",
    "createdAt": "2026-05-12T00:00:00.000Z",
    "validatedAt": "2026-05-12T00:00:00.000Z",
    "rejectedAt": null
  }
}
```

---

## 10. Farmácia — Manutenção

Todas as rotas de manutenção exigem o header:

```txt
x-maintenance-key: dev-maintenance-key
```

Sem este header, devolve:

```json
{
  "error": "UNAUTHORIZED",
  "message": "Chave de manutenção inválida."
}
```

### Rotas

| Método | Rota                                               | Descrição                            |
| ------ | -------------------------------------------------- | ------------------------------------ |
| GET    | `/farmacia/manutencao/jobs`                        | Lista jobs disponíveis               |
| GET    | `/farmacia/manutencao/jobs/receita-expiry/preview` | Preview do job de receitas expiradas |
| POST   | `/farmacia/manutencao/jobs/receita-expiry/run`     | Executa job de receitas expiradas    |
| GET    | `/farmacia/manutencao/jobs/higiene/preview`        | Preview do job de higiene            |
| POST   | `/farmacia/manutencao/jobs/higiene/run`            | Executa job de higiene               |
| GET    | `/farmacia/manutencao/jobs/purge-history/preview`  | Preview do purge de histórico        |
| POST   | `/farmacia/manutencao/jobs/purge-history/run`      | Executa purge de histórico           |

---

### GET `/farmacia/manutencao/jobs`

Lista jobs disponíveis.

#### Exemplo

```bash
curl "http://localhost:3001/api/farmacia/manutencao/jobs" \
  -H "x-maintenance-key: dev-maintenance-key"
```

---

### GET `/farmacia/manutencao/jobs/receita-expiry/preview`

Pré-visualiza linhas de receita expiradas.

#### Exemplo

```bash
curl "http://localhost:3001/api/farmacia/manutencao/jobs/receita-expiry/preview" \
  -H "x-maintenance-key: dev-maintenance-key"
```

---

### POST `/farmacia/manutencao/jobs/receita-expiry/run`

Executa manualmente o job `receita-expiry`.

#### Exemplo

```bash
curl -X POST "http://localhost:3001/api/farmacia/manutencao/jobs/receita-expiry/run" \
  -H "x-maintenance-key: dev-maintenance-key"
```

---

### GET `/farmacia/manutencao/jobs/higiene/preview`

Pré-visualiza utentes removidos antigos candidatos a higiene.

#### Query params

| Param          | Exemplo |
| -------------- | ------- |
| `offsetMonths` | `12`    |

#### Exemplo

```bash
curl "http://localhost:3001/api/farmacia/manutencao/jobs/higiene/preview?offsetMonths=12" \
  -H "x-maintenance-key: dev-maintenance-key"
```

---

### POST `/farmacia/manutencao/jobs/higiene/run`

Executa manualmente o job de higiene.

#### Body

```json
{
  "offsetMonths": 12,
  "anonymize": false
}
```

#### Exemplo

```bash
curl -X POST "http://localhost:3001/api/farmacia/manutencao/jobs/higiene/run" \
  -H "Content-Type: application/json" \
  -H "x-maintenance-key: dev-maintenance-key" \
  -d "{\"offsetMonths\":12,\"anonymize\":false}"
```

---

### GET `/farmacia/manutencao/jobs/purge-history/preview`

Pré-visualiza histórico antigo candidato a purge.

#### Query params

| Param          | Exemplo |
| -------------- | ------- |
| `offsetMonths` | `6`     |

#### Exemplo

```bash
curl "http://localhost:3001/api/farmacia/manutencao/jobs/purge-history/preview?offsetMonths=6" \
  -H "x-maintenance-key: dev-maintenance-key"
```

---

### POST `/farmacia/manutencao/jobs/purge-history/run`

Executa manualmente o job de purge histórico.

#### Body

```json
{
  "offsetMonths": 6
}
```

#### Exemplo

```bash
curl -X POST "http://localhost:3001/api/farmacia/manutencao/jobs/purge-history/run" \
  -H "Content-Type: application/json" \
  -H "x-maintenance-key: dev-maintenance-key" \
  -d "{\"offsetMonths\":6}"
```

---

## 11. Status HTTP usados

### Sucesso

| Status | Significado  |
| ------ | ------------ |
| `200`  | OK           |
| `201`  | Criado       |
| `204`  | Sem conteúdo |

### Erro

| Status | Significado                  |
| ------ | ---------------------------- |
| `400`  | Pedido inválido              |
| `401`  | Não autorizado               |
| `403`  | Proibido                     |
| `404`  | Não encontrado               |
| `409`  | Conflito de regra de negócio |
| `500`  | Erro interno                 |

---

## 12. Convenções de resposta

### Sucesso com objeto

```json
{
  "data": {}
}
```

### Sucesso com lista

```json
{
  "data": []
}
```

### Sucesso com paginação

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "skip": 0,
    "take": 50
  }
}
```

### Histórico de pedidos

```json
{
  "rows": [],
  "total": 0,
  "params": {
    "skip": 0,
    "take": 50,
    "search": "",
    "status": null
  }
}
```

### Erro

```json
{
  "error": "ERROR_CODE",
  "message": "Mensagem legível."
}
```

---

## 13. Notas importantes

- A rota `/` não existe e devolve `ROUTE_NOT_FOUND`.
- A API principal começa em `/api`.
- A documentação considera a base local `http://localhost:3001/api`.
- Rotas de manutenção são sensíveis e devem ter autenticação real antes de produção.
- O header `x-maintenance-key` é uma proteção simples para desenvolvimento.
