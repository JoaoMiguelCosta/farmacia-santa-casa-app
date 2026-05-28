# API Routes — Backend Farmácia Santa Casa

Documentação técnica das rotas HTTP atualmente expostas pelo backend.

Este ficheiro documenta **contratos de API**, não regras de negócio completas. Para regras funcionais, consultar `BUSINESS_RULES.md`.

---

## 1. Visão geral

O backend expõe uma API REST em Express com prefixo global:

```txt
/api
```

A aplicação está organizada por contextos funcionais:

```txt
/api/auth
/api/santacasa
/api/farmacia
/api/admin
/api/manutencao
/api/health
```

A autenticação é feita através de **JWT guardado em cookie HTTP-only**.

---

## 2. Autenticação

### Cookie de sessão

Depois de login com sucesso, o backend cria um cookie com o token JWT.

Nome por defeito:

```txt
farmacia_santacasa_session
```

O nome real pode ser alterado por variável de ambiente:

```txt
AUTH_COOKIE_NAME
```

### Credenciais no frontend

Como a autenticação usa cookies, os pedidos do frontend devem incluir credenciais:

```js
fetch(url, {
  credentials: "include",
});
```

Com Axios:

```js
axios.get(url, {
  withCredentials: true,
});
```

---

## 3. Roles existentes

```txt
ADMIN
SANTACASA
FARMACIA
```

### Matriz geral de acesso

| Contexto | Roles autorizadas |
|---|---|
| `/api/auth` | Público em login/logout; `/me` exige sessão válida |
| `/api/santacasa` | `SANTACASA`, `ADMIN` |
| `/api/farmacia` | `FARMACIA`, `ADMIN` |
| `/api/admin` | `ADMIN` |
| `/api/manutencao` | `ADMIN` |
| `/api/health` | `ADMIN` |

---

## 4. Formato geral de erro

A API devolve erros neste formato:

```json
{
  "error": "ERROR_CODE",
  "message": "Mensagem legível para o utilizador."
}
```

Em ambiente de desenvolvimento, alguns erros podem incluir `details`.

### Códigos comuns

| HTTP | Código | Significado |
|---:|---|---|
| 400 | `BAD_REQUEST` | Payload/query inválido |
| 401 | `UNAUTHORIZED` | Sessão inexistente, inválida ou expirada |
| 403 | `FORBIDDEN` | Role sem permissão ou origem bloqueada |
| 404 | `NOT_FOUND` | Recurso inexistente |
| 409 | `CONFLICT` | Regra de negócio violada |
| 429 | `TOO_MANY_REQUESTS` | Demasiadas tentativas de login |
| 500 | `INTERNAL_ERROR` | Erro interno |

---

## 5. Rotas de autenticação

Prefixo:

```txt
/api/auth
```

---

### POST `/api/auth/login`

Inicia sessão.

#### Acesso

Público.

#### Body

```json
{
  "email": "admin@sistema.local",
  "password": "Admin123!"
}
```

#### Resposta `200`

```json
{
  "user": {
    "id": "cuid",
    "name": "Administrador do Sistema",
    "email": "admin@sistema.local",
    "role": "ADMIN",
    "isActive": true
  }
}
```

#### Efeitos

- Cria cookie HTTP-only com token JWT.
- Rejeita utilizadores inexistentes, inativos ou com password inválida.
- Aplica rate limit por IP/email.

#### Erros comuns

| HTTP | Motivo |
|---:|---|
| 401 | Credenciais inválidas |
| 429 | Demasiadas tentativas de login |

---

### POST `/api/auth/logout`

Termina sessão.

#### Acesso

Público.

#### Body

Não requer body.

#### Resposta `200`

```json
{
  "message": "Sessão terminada com sucesso."
}
```

#### Efeitos

- Limpa o cookie de sessão.

---

### GET `/api/auth/me`

Obtém o utilizador autenticado.

#### Acesso

Sessão válida.

#### Resposta `200`

```json
{
  "user": {
    "id": "cuid",
    "name": "Utilizador Farmácia",
    "email": "farmacia@sistema.local",
    "role": "FARMACIA",
    "isActive": true
  }
}
```

#### Erros comuns

| HTTP | Motivo |
|---:|---|
| 401 | Sessão em falta, inválida ou expirada |

---

## 6. Health check global

### GET `/api/health`

Verifica estado geral da API.

#### Acesso

`ADMIN`.

#### Resposta `200`

```json
{
  "status": "ok",
  "service": "farmacia-santacasa-api",
  "timestamp": "2026-05-28T00:00:00.000Z"
}
```

---

# 7. Rotas Santa Casa

Prefixo protegido:

```txt
/api/santacasa
```

#### Acesso

```txt
SANTACASA, ADMIN
```

---

## 7.1 Dashboard Santa Casa

### GET `/api/santacasa/health`

Health check do contexto Santa Casa.

#### Resposta `200`

```json
{
  "status": "ok",
  "context": "santacasa"
}
```

---

### GET `/api/santacasa/dashboard/sinais`

Obtém sinais agregados para dashboard da Santa Casa.

#### Resposta `200`

```json
{
  "utentes": {
    "total": 10
  },
  "receitas": {
    "total": 5,
    "linhasAtivas": 8,
    "linhasExpiradas": 2
  },
  "semReceita": {
    "total": 3
  },
  "extras": {
    "pendentes": 1,
    "parcialmenteRegularizados": 1,
    "regularizados": 2,
    "expirados": 0
  },
  "pedidos": {
    "pendentes": 4,
    "validados": 12,
    "rejeitados": 1
  },
  "regularizacoes": {
    "pendentes": 1,
    "parcialmenteRegularizadas": 1,
    "regularizadas": 5
  },
  "latestPedido": null
}
```

---

## 7.2 Utentes

Prefixo:

```txt
/api/santacasa/utentes
```

---

### GET `/api/santacasa/utentes`

Lista utentes.

#### Query params

| Parâmetro | Tipo | Default | Descrição |
|---|---:|---|---|
| `status` | string | `ATIVO` | `ATIVO`, `ARQUIVADO`, `TODOS` |
| `search` | string | `""` | Pesquisa por nome ou número de utente |
| `skip` | number | `0` | Offset |
| `take` | number | `50` | Limite, máximo `100` |

#### Exemplo

```txt
GET /api/santacasa/utentes?status=ATIVO&search=joao&skip=0&take=50
```

#### Resposta `200`

```json
{
  "data": {
    "rows": [
      {
        "id": "cuid",
        "numero9": "123456789",
        "nome": "João Costa",
        "status": "ATIVO",
        "isArchived": false,
        "archivedAt": null,
        "archivedReason": null,
        "archivedById": null,
        "archivedBy": null,
        "isValid": true,
        "invalidReason": null,
        "deletedAt": null,
        "createdAt": "2026-05-28T00:00:00.000Z",
        "updatedAt": "2026-05-28T00:00:00.000Z"
      }
    ],
    "total": 1,
    "params": {
      "status": "ATIVO",
      "search": "joao",
      "skip": 0,
      "take": 50
    }
  }
}
```

---

### GET `/api/santacasa/utentes/:utenteId`

Obtém detalhe de um utente.

#### Resposta `200`

```json
{
  "data": {
    "id": "cuid",
    "numero9": "123456789",
    "nome": "João Costa",
    "status": "ATIVO",
    "isArchived": false,
    "archivedAt": null,
    "archivedReason": null,
    "archivedById": null,
    "archivedBy": null,
    "isValid": true,
    "invalidReason": null,
    "deletedAt": null,
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z"
  }
}
```

#### Erros comuns

| HTTP | Motivo |
|---:|---|
| 404 | Utente não encontrado |

---

### POST `/api/santacasa/utentes`

Cria utente.

#### Body

```json
{
  "numero9": "123456789",
  "nome": "João Costa"
}
```

#### Validações

- `numero9` deve ter exatamente 9 dígitos.
- `nome` é obrigatório.
- Não pode existir outro utente não removido com o mesmo nome.
- Não pode existir outro utente com o mesmo `numero9`, mesmo que removido.

#### Resposta `201`

```json
{
  "data": {
    "id": "cuid",
    "numero9": "123456789",
    "nome": "João Costa",
    "status": "ATIVO"
  }
}
```

#### Erros comuns

| HTTP | Motivo |
|---:|---|
| 400 | Número ou nome inválido |
| 409 | Utente duplicado |

---

### PATCH `/api/santacasa/utentes/:utenteId/archive`

Arquiva um utente.

#### Body

```json
{
  "archivedReason": "Deixou de ser acompanhado pela instituição."
}
```

Também é aceite:

```json
{
  "reason": "Deixou de ser acompanhado pela instituição."
}
```

#### Validações

- Utente tem de existir.
- Utente não pode estar removido.
- Utente não pode já estar arquivado.
- Não pode ter pendências operacionais abertas.

#### Resposta `200`

```json
{
  "data": {
    "id": "cuid",
    "status": "ARQUIVADO",
    "isArchived": true,
    "archivedReason": "Deixou de ser acompanhado pela instituição."
  }
}
```

---

### PATCH `/api/santacasa/utentes/:utenteId/reactivate`

Reativa um utente arquivado.

#### Body

Não requer body.

#### Resposta `200`

```json
{
  "data": {
    "id": "cuid",
    "status": "ATIVO",
    "isArchived": false,
    "archivedAt": null,
    "archivedReason": null,
    "archivedById": null
  }
}
```

---

### DELETE `/api/santacasa/utentes/:utenteId`

Remove logicamente um utente sem dependências.

#### Regras

- Não apaga fisicamente o registo.
- Define `deletedAt`.
- Só é permitido se não existirem dados associados relevantes.

#### Resposta `204`

Sem body.

#### Erros comuns

| HTTP | Motivo |
|---:|---|
| 409 | Utente tem dados associados |

---

## 7.3 Receitas

Prefixo:

```txt
/api/santacasa/utentes/:utenteId/receitas
```

---

### GET `/api/santacasa/utentes/:utenteId/receitas`

Lista linhas de receita ativas com quantidade restante.

#### Resposta `200`

```json
{
  "data": [
    {
      "linhaId": "cuid",
      "receitaId": "cuid",
      "utenteId": "cuid",
      "numero19": "1234567890123456789",
      "pinAcesso6": "123456",
      "pinOpcao4": "1234",
      "medicamentoId": null,
      "medicamento": "Paracetamol",
      "quantidade": 2,
      "quantidadeDispensada": 0,
      "quantidadeReservadaPendente": 0,
      "quantidadeRestante": 2,
      "validade": "2026-12-31T00:00:00.000Z",
      "status": "ATIVA",
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/santacasa/utentes/:utenteId/receitas`

Cria receita com uma ou mais linhas.

#### Body

```json
{
  "numero19": "1234567890123456789",
  "pinAcesso6": "123456",
  "pinOpcao4": "1234",
  "confirmRegularizacao": false,
  "linhas": [
    {
      "nome": "Paracetamol",
      "quantidade": 2,
      "validade": "2026-12-31"
    }
  ]
}
```

Também é aceite `medicamento` em vez de `nome` dentro das linhas.

#### Validações

- `numero19` deve ter exatamente 19 dígitos.
- `pinAcesso6` deve ter exatamente 6 dígitos.
- `pinOpcao4` deve ter exatamente 4 dígitos.
- Deve existir pelo menos uma linha.
- Cada linha precisa de medicamento, quantidade maior que zero e validade futura.
- Não é permitido repetir o mesmo medicamento na mesma receita.
- Não pode existir receita com o mesmo `numero19`.

#### Regularizações pendentes

Se a nova receita regularizar Vendas Suspensas pendentes e `confirmRegularizacao` não for verdadeiro, a API responde com conflito específico.

#### Erro `409` com confirmação obrigatória

```json
{
  "error": "REGULARIZACAO_CONFIRMATION_REQUIRED",
  "message": "Esta receita vai regularizar vendas suspensas pendentes. Confirma antes de continuar.",
  "details": {
    "hasRegularizacoes": true,
    "totalEventos": 1,
    "totalRegularizado": 1,
    "regularizacoes": []
  }
}
```

#### Resposta `201`

```json
{
  "data": {
    "receitaId": "cuid",
    "utenteId": "cuid",
    "numero19": "1234567890123456789",
    "pinAcesso6": "123456",
    "pinOpcao4": "1234",
    "linhas": [],
    "extrasResolvidos": [],
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z"
  }
}
```

---

### DELETE `/api/santacasa/utentes/:utenteId/receitas/linhas/:linhaId`

Remove uma linha de receita.

#### Regras

Só é permitido remover se a linha:

- Pertence ao utente.
- Não tem unidades dispensadas.
- Não tem dispensas associadas.
- Não está associada a pedidos.
- Não foi usada em regularizações.

Se for a última linha da receita, a receita também é removida.

#### Resposta `204`

Sem body.

---

## 7.4 Medicamentos não sujeitos a receita médica

Prefixo:

```txt
/api/santacasa/utentes/:utenteId/sem-receita
```

---

### GET `/api/santacasa/utentes/:utenteId/sem-receita`

Lista medicamentos não sujeitos a receita médica com quantidade restante.

#### Resposta `200`

```json
{
  "data": [
    {
      "id": "cuid",
      "utenteId": "cuid",
      "medicamento": "Ibuprofeno",
      "quantidade": 2,
      "quantidadeReservadaPendente": 0,
      "quantidadeRestante": 2,
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/santacasa/utentes/:utenteId/sem-receita`

Cria ou incrementa medicamento não sujeito a receita médica.

#### Body

```json
{
  "medicamento": "Ibuprofeno",
  "quantidade": 2
}
```

Também é aceite `nome` em vez de `medicamento`.

#### Regras

- Se já existir medicamento igual para o utente, incrementa quantidade.
- Pesquisa duplicados de forma case-insensitive.

#### Resposta `201`

```json
{
  "data": {
    "id": "cuid",
    "utenteId": "cuid",
    "medicamento": "Ibuprofeno",
    "quantidade": 4,
    "quantidadeReservadaPendente": 0,
    "quantidadeRestante": 4
  }
}
```

---

### DELETE `/api/santacasa/utentes/:utenteId/sem-receita/:semReceitaId`

Remove medicamento não sujeito a receita médica.

#### Regras

Só é permitido se:

- O registo pertence ao utente.
- Não está associado a pedidos.

#### Resposta `204`

Sem body.

---

## 7.5 Vendas Suspensas

Prefixo:

```txt
/api/santacasa/utentes/:utenteId/extras
```

> Nota técnica: no código, Vendas Suspensas ainda correspondem ao modelo/módulo `Extra`.

---

### GET `/api/santacasa/utentes/:utenteId/extras`

Lista Vendas Suspensas em aberto com quantidade restante.

#### Resposta `200`

```json
{
  "data": [
    {
      "id": "cuid",
      "utenteId": "cuid",
      "medicamentoId": null,
      "medicamento": "Amoxicilina",
      "quantidadeSolicitada": 1,
      "quantidadeRegularizada": 0,
      "quantidadeCancelada": 0,
      "quantidadeReservadaPendente": 0,
      "quantidadeRestante": 1,
      "status": "PENDENTE",
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/santacasa/utentes/:utenteId/extras`

Cria Venda Suspensa.

#### Body

```json
{
  "medicamento": "Amoxicilina",
  "quantidadeSolicitada": 1,
  "receitaDraftItems": [
    {
      "linhaId": "cuid",
      "quantidade": 1
    }
  ]
}
```

Também é aceite:

```json
{
  "nome": "Amoxicilina",
  "quantidade": 1
}
```

#### Regras

- Não pode existir receita ativa com quantidade disponível para o mesmo medicamento.
- Não pode existir Venda Suspensa em aberto para o mesmo medicamento.
- `receitaDraftItems` é usado para descontar quantidades já escolhidas num pedido em preparação.

#### Resposta `201`

```json
{
  "data": {
    "id": "cuid",
    "utenteId": "cuid",
    "medicamento": "Amoxicilina",
    "quantidadeSolicitada": 1,
    "quantidadeRegularizada": 0,
    "quantidadeCancelada": 0,
    "quantidadeReservadaPendente": 0,
    "quantidadeRestante": 1,
    "status": "PENDENTE"
  }
}
```

---

### DELETE `/api/santacasa/utentes/:utenteId/extras/:extraId`

Remove Venda Suspensa.

#### Regras

Só é permitido se:

- A Venda Suspensa pertence ao utente.
- Não está associada a pedidos.

#### Resposta `204`

Sem body.

---

## 7.6 Pedidos Santa Casa

Prefixo:

```txt
/api/santacasa/pedidos
```

---

### POST `/api/santacasa/pedidos`

Cria pedido para validação pela Farmácia.

#### Body

```json
{
  "items": [
    {
      "utenteId": "cuid",
      "tipo": "COM_RECEITA",
      "id": "receitaLinhaId",
      "quantidade": 1
    },
    {
      "utenteId": "cuid",
      "tipo": "SEM_RECEITA",
      "id": "semReceitaId",
      "quantidade": 1
    },
    {
      "utenteId": "cuid",
      "tipo": "EXTRA",
      "id": "extraId",
      "quantidade": 1
    }
  ]
}
```

#### Aliases aceites

Para `tipo`:

```txt
COM_RECEITA
RECEITA
RECEITA_LINHA
SEM_RECEITA
EXTRA
```

Para IDs:

| Tipo | Campos aceites |
|---|---|
| `COM_RECEITA` | `id`, `linhaId`, `receitaLinhaId` |
| `SEM_RECEITA` | `id`, `semReceitaId` |
| `EXTRA` | `id`, `extraId` |

Para quantidade:

```txt
quantidade ou qtd
```

#### Regras

- O pedido deve conter pelo menos um item.
- Itens duplicados são agregados por `utenteId:tipo:id`.
- Utente tem de estar operacional.
- Cada item tem de pertencer ao utente.
- Quantidade tem de estar disponível.
- Para receitas, aplica regra FEFO: usar primeiro a linha do mesmo medicamento com validade mais próxima.

#### Resposta `201`

```json
{
  "data": {
    "id": "cuid",
    "numero": 1,
    "status": "PENDENTE",
    "validatedAt": null,
    "validatedById": null,
    "validatedBy": null,
    "rejectedAt": null,
    "rejectedById": null,
    "rejectedBy": null,
    "closedReason": null,
    "cancelReason": null,
    "itens": [],
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z"
  }
}
```

---

### GET `/api/santacasa/pedidos/pendentes`

Lista pedidos pendentes.

#### Query params

| Parâmetro | Tipo | Default | Descrição |
|---|---:|---|---|
| `search` | string | `""` | Pesquisa por número, utente, receita ou medicamento |
| `skip` | number | `0` | Offset |
| `take` | number | `50` | Limite, máximo `200` |

#### Resposta `200`

```json
{
  "rows": [],
  "total": 0,
  "params": {
    "skip": 0,
    "take": 50,
    "search": "",
    "status": "PENDENTE"
  }
}
```

---

### GET `/api/santacasa/pedidos/historico`

Lista histórico de pedidos fechados.

#### Query params

| Parâmetro | Tipo | Default | Descrição |
|---|---:|---|---|
| `status` | string | `TODOS` | `TODOS`, `VALIDADO`, `REJEITADO`, `CANCELADO` |
| `from` | date | `null` | Data inicial |
| `to` | date | `null` | Data final |
| `search` | string | `""` | Pesquisa |
| `skip` | number | `0` | Offset |
| `take` | number | `50` | Limite, máximo `200` |

#### Resposta `200`

```json
{
  "rows": [],
  "total": 0,
  "params": {
    "skip": 0,
    "take": 50,
    "search": "",
    "status": "TODOS",
    "from": null,
    "to": null
  }
}
```

---

### GET `/api/santacasa/pedidos/:pedidoId`

Obtém detalhe de pedido.

#### Resposta `200`

```json
{
  "data": {
    "id": "cuid",
    "numero": 1,
    "status": "PENDENTE",
    "itens": []
  }
}
```

---

### POST `/api/santacasa/pedidos/:pedidoId/cancelar`

Cancela pedido pendente antes de validação pela Farmácia.

#### Body

```json
{
  "reason": "Cancelado pela Santa Casa antes da validação pela Farmácia."
}
```

Também é aceite:

```json
{
  "motivo": "Cancelado por engano."
}
```

#### Regras

- Só pedidos `PENDENTE` podem ser cancelados.
- Itens pendentes passam para `CANCELADO`.
- Pedido passa para `CANCELADO`.

#### Resposta `200`

```json
{
  "data": {
    "id": "cuid",
    "numero": 1,
    "status": "CANCELADO",
    "closedReason": "Cancelado por engano."
  }
}
```

---

## 7.7 Regularizações Santa Casa

Prefixo:

```txt
/api/santacasa/regularizacoes
```

As mesmas rotas também existem no contexto Farmácia em:

```txt
/api/farmacia/regularizacoes
```

---

### GET `/api/santacasa/regularizacoes/pendentes`

Lista regularizações pendentes ou parcialmente regularizadas.

#### Query params

| Parâmetro | Tipo | Default | Descrição |
|---|---:|---|---|
| `utenteId` | string | `null` | Filtra por utente |
| `medicamento` | string | `null` | Filtra por medicamento |
| `search` | string | `""` | Pesquisa geral |
| `from` | date | `null` | Data inicial |
| `to` | date | `null` | Data final |
| `skip` | number | `0` | Offset |
| `take` | number | `50` | Limite, máximo `200` |

#### Resposta `200`

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "skip": 0,
    "take": 50
  },
  "params": {
    "utenteId": null,
    "medicamento": "",
    "search": "",
    "from": null,
    "to": null
  }
}
```

---

### GET `/api/santacasa/regularizacoes/historico`

Lista regularizações concluídas.

#### Query params

Iguais a `/pendentes`.

#### Resposta `200`

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "skip": 0,
    "take": 50
  },
  "params": {
    "utenteId": null,
    "medicamento": "",
    "search": "",
    "from": null,
    "to": null
  }
}
```

---

### GET `/api/santacasa/regularizacoes/sinal`

Obtém sinal agregado de regularizações.

#### Resposta `200`

```json
{
  "totalEventos": 0,
  "totalUnidades": 0,
  "latestEventoAt": null
}
```

---

# 8. Rotas Farmácia

Prefixo protegido:

```txt
/api/farmacia
```

#### Acesso

```txt
FARMACIA, ADMIN
```

---

## 8.1 Health Farmácia

### GET `/api/farmacia/health`

Health check do contexto Farmácia.

#### Resposta `200`

```json
{
  "status": "ok",
  "context": "farmacia"
}
```

---

## 8.2 Dashboard Farmácia

### GET `/api/farmacia/dashboard/sinais`

Obtém sinais agregados para dashboard da Farmácia.

#### Resposta `200`

```json
{
  "pedidos": {
    "pendentes": 0,
    "validados": 0,
    "rejeitados": 0,
    "cancelados": 0
  },
  "regularizacoes": {
    "pendentes": 0,
    "historico": 0,
    "totalEventos": 0,
    "totalUnidades": 0,
    "latestEventoAt": null
  },
  "latestPedido": null
}
```

---

## 8.3 Pedidos Farmácia

Prefixo:

```txt
/api/farmacia/pedidos
```

---

### GET `/api/farmacia/pedidos`

Lista pedidos para a Farmácia.

#### Query params

| Parâmetro | Tipo | Default | Descrição |
|---|---:|---|---|
| `status` | string | `PENDENTE` | `TODOS`, `PENDENTE`, `VALIDADO`, `REJEITADO`, `CANCELADO` |
| `search` | string | `""` | Pesquisa por número, utente, receita, PIN, motivo ou medicamento |
| `from` | date | `null` | Data inicial |
| `to` | date | `null` | Data final |
| `skip` | number | `0` | Offset |
| `take` | number | `50` | Limite, máximo `200` |

#### Exemplo

```txt
GET /api/farmacia/pedidos?status=PENDENTE&skip=0&take=50
```

#### Resposta `200`

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "skip": 0,
    "take": 50
  },
  "params": {
    "status": "PENDENTE",
    "search": "",
    "from": null,
    "to": null
  }
}
```

---

### POST `/api/farmacia/pedidos/:pedidoId/validar`

Valida pedido pendente.

#### Body

```json
{}
```

Existe suporte técnico para `validatedById`, mas em uso normal o backend usa o utilizador autenticado.

#### Regras

- Pedido tem de existir.
- Pedido tem de estar `PENDENTE`.
- Todos os itens têm de estar `PENDENTE`.
- As quantidades ainda têm de estar disponíveis.
- Linhas de receita têm de estar ativas e dentro da validade.
- Medicamentos não sujeitos a receita médica reduzem stock.
- Vendas Suspensas geram regularizações.
- Itens e pedido ficam com auditoria de validação.

#### Resposta `200`

```json
{
  "data": {
    "id": "cuid",
    "numero": 1,
    "status": "VALIDADO",
    "validatedAt": "2026-05-28T00:00:00.000Z",
    "validatedById": "userId",
    "validatedBy": {
      "id": "userId",
      "name": "Utilizador Farmácia",
      "email": "farmacia@sistema.local",
      "role": "FARMACIA"
    },
    "itens": []
  }
}
```

---

### POST `/api/farmacia/pedidos/:pedidoId/rejeitar`

Rejeita pedido pendente.

#### Body

```json
{
  "motivo": "Medicamento indisponível."
}
```

Também é aceite:

```json
{
  "reason": "Medicamento indisponível."
}
```

#### Regras

- Pedido tem de existir.
- Pedido tem de estar `PENDENTE`.
- Itens pendentes passam para `REJEITADO`.
- Pedido passa para `REJEITADO`.
- Guarda auditoria do utilizador autenticado.

#### Resposta `200`

```json
{
  "data": {
    "id": "cuid",
    "numero": 1,
    "status": "REJEITADO",
    "rejectedAt": "2026-05-28T00:00:00.000Z",
    "rejectedById": "userId",
    "closedReason": "Medicamento indisponível.",
    "itens": []
  }
}
```

---

## 8.4 Regularizações Farmácia

Prefixo:

```txt
/api/farmacia/regularizacoes
```

As rotas são iguais às de Santa Casa:

```txt
GET /api/farmacia/regularizacoes/pendentes
GET /api/farmacia/regularizacoes/historico
GET /api/farmacia/regularizacoes/sinal
```

Consultar secção `7.7 Regularizações Santa Casa`.

---

# 9. Rotas Admin

Prefixo protegido:

```txt
/api/admin
```

#### Acesso

```txt
ADMIN
```

---

## 9.1 Utilizadores

Prefixo:

```txt
/api/admin/users
```

---

### GET `/api/admin/users`

Lista utilizadores do sistema.

#### Query params

| Parâmetro | Tipo | Default | Descrição |
|---|---:|---|---|
| `search` | string | `""` | Pesquisa por nome/email |
| `role` | string | `TODOS` | `ADMIN`, `SANTACASA`, `FARMACIA`, `TODOS` |
| `isActive` | boolean/string | `TODOS` | `true`, `false`, `ativo`, `inativo`, `TODOS` |
| `page` | number | `1` | Página, se não usar `skip/take` |
| `pageSize` | number | `50` | Tamanho da página |
| `skip` | number | `0` | Offset alternativo |
| `take` | number | `50` | Limite, máximo `100` |

#### Resposta `200`

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "skip": 0,
    "take": 50
  },
  "params": {
    "search": "",
    "role": "TODOS",
    "isActive": "TODOS"
  }
}
```

---

### POST `/api/admin/users`

Cria utilizador.

#### Body

```json
{
  "name": "Utilizador Farmácia",
  "email": "farmacia@sistema.local",
  "password": "Farmacia123!",
  "role": "FARMACIA"
}
```

#### Validações

- Nome obrigatório.
- Email obrigatório e deve conter `@`.
- Password obrigatória com pelo menos 8 caracteres.
- Role válida: `SANTACASA`, `FARMACIA`, `ADMIN`.
- Email único.

#### Resposta `201`

```json
{
  "data": {
    "id": "cuid",
    "name": "Utilizador Farmácia",
    "email": "farmacia@sistema.local",
    "role": "FARMACIA",
    "isActive": true,
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z"
  }
}
```

---

### PATCH `/api/admin/users/:userId`

Atualiza dados principais do utilizador.

#### Body

```json
{
  "name": "Novo Nome",
  "email": "novo@email.local",
  "role": "SANTACASA"
}
```

#### Resposta `200`

```json
{
  "data": {
    "id": "cuid",
    "name": "Novo Nome",
    "email": "novo@email.local",
    "role": "SANTACASA",
    "isActive": true
  }
}
```

---

### PATCH `/api/admin/users/:userId/password`

Atualiza password de utilizador.

#### Body

```json
{
  "password": "NovaPassword123!"
}
```

#### Resposta `200`

```json
{
  "data": {
    "id": "cuid",
    "email": "utilizador@email.local",
    "role": "FARMACIA",
    "isActive": true
  }
}
```

---

### PATCH `/api/admin/users/:userId/status`

Ativa ou desativa utilizador.

#### Body

```json
{
  "isActive": false
}
```

#### Regras

- Não é permitido alterar o estado da própria conta autenticada.

#### Resposta `200`

```json
{
  "data": {
    "id": "cuid",
    "isActive": false
  }
}
```

---

### DELETE `/api/admin/users/:userId`

Remove utilizador.

#### Regras

- Não é permitido remover a própria conta.
- Só é possível remover utilizadores desativados.
- Não é possível remover utilizadores com histórico de auditoria associado.

#### Resposta `200`

```json
{
  "data": {
    "id": "cuid",
    "email": "utilizador@email.local",
    "isActive": false
  }
}
```

---

# 10. Rotas de Manutenção

Prefixo protegido:

```txt
/api/manutencao
```

#### Acesso

```txt
ADMIN
```

---

## 10.1 Jobs

### GET `/api/manutencao/jobs`

Lista jobs disponíveis.

#### Resposta `200`

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

### GET `/api/manutencao/jobs/receita-expiry/preview`

Pré-visualiza expiração de receitas.

#### Resposta `200`

```json
{
  "job": "receita-expiry",
  "mode": "preview",
  "result": {
    "checkedAt": "2026-05-28T00:00:00.000Z",
    "expiredLines": 0,
    "pendingItemsFromExpiredLines": 0,
    "affectedPedidos": 0,
    "pendingItemsFromAffectedPedidos": 0
  }
}
```

---

### POST `/api/manutencao/jobs/receita-expiry/run`

Executa expiração de receitas.

#### Resposta `200`

```json
{
  "job": "receita-expiry",
  "mode": "run",
  "result": {
    "checkedAt": "2026-05-28T00:00:00.000Z",
    "expiredLines": 0,
    "pendingItemsFromExpiredLines": 0,
    "affectedPedidos": 0,
    "pendingItemsFromAffectedPedidos": 0,
    "canceledPedidoItems": 0,
    "canceledPedidos": 0
  }
}
```

---

### GET `/api/manutencao/jobs/higiene/preview`

Pré-visualiza rotina de higiene.

#### Query params

| Parâmetro | Tipo | Default | Descrição |
|---|---:|---|---|
| `offsetMonths` | number | `HIGIENE_OFFSET_MONTHS` | Meses de antiguidade |
| `anonymize` | boolean | `HIGIENE_ANONYMIZE` | Indica intenção de anonimizar |

#### Resposta `200`

```json
{
  "job": "higiene",
  "mode": "preview",
  "options": {
    "offsetMonths": 12,
    "anonymize": false
  },
  "result": {
    "cutoffDate": "2025-05-28T00:00:00.000Z",
    "offsetMonths": 12,
    "candidatos": 0
  }
}
```

---

### POST `/api/manutencao/jobs/higiene/run`

Executa rotina de higiene.

#### Body

```json
{
  "offsetMonths": 12,
  "anonymize": false
}
```

#### Resposta `200`

```json
{
  "job": "higiene",
  "mode": "run",
  "options": {
    "offsetMonths": 12,
    "anonymize": false
  },
  "result": {
    "checkedAt": "2026-05-28T00:00:00.000Z",
    "cutoffDate": "2025-05-28T00:00:00.000Z",
    "offsetMonths": 12,
    "anonymizeRequested": false,
    "anonymizeApplied": false,
    "atualizados": 0
  }
}
```

---

### GET `/api/manutencao/jobs/purge-history/preview`

Pré-visualiza limpeza de histórico.

#### Query params

| Parâmetro | Tipo | Default | Descrição |
|---|---:|---|---|
| `offsetMonths` | number | `PURGE_OFFSET_MONTHS` | Meses de antiguidade |

#### Resposta `200`

```json
{
  "job": "purge-history",
  "mode": "preview",
  "options": {
    "offsetMonths": 6
  },
  "result": {
    "cutoffDate": "2025-11-28T00:00:00.000Z",
    "offsetMonths": 6,
    "pedidos": 0,
    "pedidoItens": 0,
    "dispensas": 0,
    "regularizacoes": 0,
    "eventos": 0
  }
}
```

---

### POST `/api/manutencao/jobs/purge-history/run`

Executa limpeza de histórico.

#### Body

```json
{
  "offsetMonths": 6
}
```

#### Resposta `200`

```json
{
  "job": "purge-history",
  "mode": "run",
  "options": {
    "offsetMonths": 6
  },
  "result": {
    "checkedAt": "2026-05-28T00:00:00.000Z",
    "cutoffDate": "2025-11-28T00:00:00.000Z",
    "offsetMonths": 6,
    "regularizacoes": 0,
    "eventos": 0,
    "pedidos": 0,
    "pedidoItens": 0,
    "dispensas": 0,
    "regularizacoesDesvinculadas": 0
  }
}
```

---

# 11. Estados principais

## 11.1 Pedido

```txt
PENDENTE
VALIDADO
REJEITADO
CANCELADO
```

## 11.2 Item de pedido

```txt
PENDENTE
VALIDADO
REJEITADO
CANCELADO
CANCELADO_POR_EXPIRACAO
```

## 11.3 Tipo de item

```txt
COM_RECEITA
SEM_RECEITA
EXTRA
```

## 11.4 Linha de receita

```txt
ATIVA
EXPIRADA
```

## 11.5 Venda Suspensa

```txt
PENDENTE
PARCIALMENTE_REGULARIZADO
REGULARIZADO
EXPIRADO
```

## 11.6 Regularização

```txt
PENDENTE
PARCIALMENTE_REGULARIZADO
REGULARIZADO
```

## 11.7 Utente

```txt
ATIVO
ARQUIVADO
```

## 11.8 Utilizador

```txt
ADMIN
SANTACASA
FARMACIA
```

---

# 12. Notas para frontend

## 12.1 Enviar sempre cookies

Todas as chamadas autenticadas devem usar `credentials: "include"` ou `withCredentials: true`.

## 12.2 Tratar `401`

Quando a API devolver `401`, o frontend deve:

- Limpar estado local de autenticação.
- Redirecionar para login.
- Evitar manter UI com utilizador antigo.

## 12.3 Tratar `409`

`409` normalmente indica erro funcional esperado:

- Quantidade indisponível.
- Pedido já não está pendente.
- Utente arquivado/removido.
- Venda Suspensa duplicada.
- Receita duplicada.
- Regularização exige confirmação.

O frontend deve mostrar a mensagem do backend.

## 12.4 Datas

A API aceita datas em formato:

```txt
YYYY-MM-DD
```

ou strings compatíveis com `Date`.

Para filtros `from` e `to`:

- `from=YYYY-MM-DD` é interpretado como início do dia.
- `to=YYYY-MM-DD` é interpretado como fim do dia.

---

# 13. Checklist ao adicionar nova rota

Antes de adicionar uma rota nova:

- [ ] Definir contexto correto: `auth`, `santacasa`, `farmacia`, `admin` ou `manutencao`.
- [ ] Confirmar roles autorizadas.
- [ ] Criar ou atualizar controller.
- [ ] Colocar regra de negócio no service.
- [ ] Colocar acesso a dados no repository.
- [ ] Criar validator para body/query.
- [ ] Criar mapper/DTO se a resposta expõe dados ao frontend.
- [ ] Evitar devolver password, hashes ou dados internos sensíveis.
- [ ] Garantir erros com `AppError`.
- [ ] Atualizar este ficheiro.
- [ ] Atualizar `BUSINESS_RULES.md` se a rota alterar comportamento funcional.
- [ ] Atualizar `TESTING.md` com cenário de teste.
