# Business Rules — Farmácia Santa Casa V2

Este documento descreve as regras de negócio principais do backend.

Base técnica:

- Backend em Node.js + Express
- Prisma ORM
- PostgreSQL
- API REST
- Contextos principais:
  - Santa Casa
  - Farmácia
  - Manutenção

---

## 1. Conceitos principais

O sistema organiza o fluxo entre duas áreas:

### Santa Casa

Responsável por:

- criar utentes;
- adicionar medicamentos sem receita;
- adicionar receitas;
- criar pedidos;
- consultar histórico.

### Farmácia

Responsável por:

- listar pedidos pendentes;
- validar pedidos;
- rejeitar pedidos;
- consultar regularizações;
- consultar dashboard;
- executar manutenção controlada.

---

## 2. Estados principais

### Utente

| Campo | Significado |
|---|---|
| `isValid: true` | Utente ativo |
| `isValid: false` | Utente inválido/removido |
| `deletedAt: null` | Utente não removido |
| `deletedAt: Date` | Utente removido logicamente |
| `invalidReason` | Motivo da invalidação/remoção |

---

### ReceitaLinha

| Estado | Significado |
|---|---|
| `ATIVA` | Linha de receita válida |
| `EXPIRADA` | Linha vencida |
| `ESGOTADA` | Linha sem saldo disponível |

> Nota: atualmente a listagem filtra linhas com saldo disponível. Mesmo que uma linha continue `ATIVA`, pode não aparecer se `quantidadeRestante` for `0`.

---

### Pedido

| Estado | Significado |
|---|---|
| `PENDENTE` | Pedido criado e à espera da Farmácia |
| `VALIDADO` | Pedido aceite pela Farmácia |
| `REJEITADO` | Pedido recusado pela Farmácia |
| `CANCELADO` | Pedido cancelado automaticamente ou por regra futura |

---

### PedidoItem

| Estado | Significado |
|---|---|
| `PENDENTE` | Item ainda não tratado |
| `VALIDADO` | Item aprovado |
| `REJEITADO` | Item rejeitado |
| `CANCELADO_POR_EXPIRACAO` | Item cancelado por receita vencida |

---

### Extra

| Estado | Significado |
|---|---|
| `PENDENTE` | Extra ainda por regularizar |
| `PARCIALMENTE_REGULARIZADO` | Parte já foi regularizada |
| `REGULARIZADO` | Extra totalmente regularizado |

---

### RegularizacaoExtra

| Estado | Significado |
|---|---|
| `PENDENTE` | Ainda falta regularizar tudo |
| `PARCIALMENTE_REGULARIZADO` | Regularização parcial |
| `REGULARIZADO` | Regularização concluída |

---

## 3. Utentes

### 3.1 Criar utente

Um utente precisa de:

- `numero9`
- `nome`

Regras:

- `numero9` é obrigatório.
- `numero9` deve ter exatamente 9 dígitos.
- `nome` é obrigatório.
- `nome` não pode ser vazio.
- Não pode existir outro utente ativo com o mesmo `numero9`.
- Não pode existir outro utente ativo com o mesmo `nome`.

Exemplo válido:

```json
{
  "numero9": "111111111",
  "nome": "João Miguel Costa"
}
```

---

### 3.2 Consultar utente

Só deve devolver utentes relevantes para a operação atual.

Regras:

- `GET /santacasa/utentes` lista utentes ativos.
- `GET /santacasa/utentes/:utenteId` obtém um utente por ID.
- Se o utente não existir, devolve `404`.

---

### 3.3 Remover utente

A remoção é lógica.

O backend não apaga fisicamente o utente da base de dados.

Ao remover:

- `isValid` passa para `false`;
- `deletedAt` é preenchido;
- `invalidReason` é preenchido.

Regras de bloqueio:

Não é permitido remover utente se tiver:

- Extras em aberto;
- regularizações em aberto;
- itens de pedido pendentes.

Motivo:

- preservar histórico;
- impedir perda de contexto;
- evitar inconsistência em pedidos ainda ativos.

---

## 4. Medicamentos Sem Receita

Medicamentos sem receita representam medicamentos registados manualmente para um utente, sem estarem ligados a uma receita oficial.

---

### 4.1 Criar medicamento sem receita

Campos aceites:

```json
{
  "medicamento": "Ben-u-ron",
  "quantidade": 2
}
```

Também é aceite:

```json
{
  "nome": "Ben-u-ron",
  "quantidade": 2
}
```

Regras:

- Utente tem de existir.
- Utente não pode estar removido.
- Medicamento é obrigatório.
- Quantidade tem de ser inteiro maior que `0`.

---

### 4.2 Listar medicamentos sem receita

A listagem devolve apenas medicamentos com saldo disponível.

Saldo calculado:

```txt
quantidadeRestante = quantidade - quantidadeReservadaPendente
```

Onde:

- `quantidade` é a quantidade registada;
- `quantidadeReservadaPendente` é a quantidade já colocada em pedidos pendentes.

Se `quantidadeRestante <= 0`, o item não deve aparecer na listagem operacional.

---

### 4.3 Remover medicamento sem receita

Não é permitido remover se já estiver associado a qualquer pedido.

Isto inclui:

- pedido pendente;
- pedido validado;
- pedido rejeitado;
- pedido cancelado.

Motivo:

- manter histórico;
- evitar apagar referências usadas em pedidos antigos.

---

## 5. Receitas

Uma receita representa uma prescrição oficial.

Uma receita contém:

- `numero19`
- `pinAcesso6`
- `pinOpcao4`
- uma ou mais linhas de medicamentos

---

### 5.1 Criar receita

Exemplo:

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

Regras:

- Utente tem de existir.
- Utente não pode estar removido.
- `numero19` deve ter exatamente 19 dígitos.
- `pinAcesso6` deve ter exatamente 6 dígitos.
- `pinOpcao4` deve ter exatamente 4 dígitos.
- Deve existir pelo menos uma linha.
- Cada linha precisa de:
  - medicamento;
  - quantidade;
  - validade.
- Quantidade tem de ser maior que `0`.
- Validade tem de ser futura.
- Não é permitido repetir o mesmo medicamento dentro da mesma receita.
- Não é permitido criar duas receitas com o mesmo `numero19`.

---

### 5.2 Listar receitas

A listagem devolve linhas de receita com saldo disponível.

Saldo calculado:

```txt
quantidadeRestante =
  quantidade
  - quantidadeDispensada
  - quantidadeReservadaPendente
```

Onde:

- `quantidade` é a quantidade prescrita;
- `quantidadeDispensada` é o que já foi validado pela Farmácia;
- `quantidadeReservadaPendente` é o que está em pedidos pendentes.

Se `quantidadeRestante <= 0`, a linha não aparece na listagem operacional.

---

### 5.3 Remover linha de receita

Não é permitido remover linha se:

- já tiver quantidade dispensada;
- tiver dispensas associadas;
- estiver associada a pedidos;
- tiver sido usada em regularizações.

Motivo:

- preservar histórico clínico/operacional;
- evitar apagar referências usadas por pedidos ou regularizações.

---

### 5.4 Criação de receita e regularização automática

Quando uma nova receita é criada, o sistema tenta regularizar Extras pendentes compatíveis.

Critério principal:

- mesmo utente;
- mesmo medicamento;
- regularização em estado:
  - `PENDENTE`
  - `PARCIALMENTE_REGULARIZADO`
- linha de receita ativa;
- linha de receita com saldo disponível;
- validade futura.

Se existir compatibilidade:

- cria evento de regularização;
- incrementa `quantidadeRegularizada`;
- incrementa `quantidadeDispensada` da linha usada;
- atualiza o estado da regularização.

---

## 6. Extras / Venda Suspensa

Um Extra representa um medicamento entregue sem receita no momento, mas que precisa ser regularizado depois.

---

### 6.1 Criar Extra

Exemplo principal:

```json
{
  "medicamento": "Medicamento Extra Teste",
  "quantidadeSolicitada": 3
}
```

Exemplo alternativo aceite:

```json
{
  "nome": "Medicamento Extra Teste",
  "quantidade": 3
}
```

Regras:

- Utente tem de existir.
- Utente não pode estar removido.
- Medicamento é obrigatório.
- Quantidade tem de ser maior que `0`.
- Não permite criar Extra se já existir receita ativa com saldo disponível para o mesmo medicamento.
- Não permite duplicar Extra em aberto para o mesmo medicamento.

---

### 6.2 Listar Extras

A listagem mostra Extras em aberto com saldo restante.

Saldo calculado:

```txt
quantidadeRestante =
  quantidadeSolicitada
  - quantidadeRegularizada
  - quantidadeReservadaPendente
```

Onde:

- `quantidadeSolicitada` é o total criado no Extra;
- `quantidadeRegularizada` é a parte já regularizada;
- `quantidadeReservadaPendente` é a parte em pedidos pendentes.

---

### 6.3 Remover Extra

Não é permitido remover se já estiver associado a qualquer pedido.

Motivo:

- preservar histórico;
- manter ligação entre pedido, validação e regularização.

---

## 7. Pedidos Santa Casa

Um pedido é criado pela Santa Casa e enviado à Farmácia.

Pode conter itens de três tipos:

- `COM_RECEITA`
- `SEM_RECEITA`
- `EXTRA`

---

### 7.1 Criar pedido

Exemplo:

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

Regras:

- Pedido tem de ter pelo menos um item.
- Cada item precisa de:
  - `utenteId`
  - `tipo`
  - `id`
  - `quantidade`
- Quantidade tem de ser maior que `0`.
- Utente tem de existir.
- Utente não pode estar removido.
- O item tem de pertencer ao utente indicado.
- Não pode pedir mais do que o saldo disponível.
- Ao criar, o pedido fica `PENDENTE`.
- Todos os itens ficam `PENDENTE`.

---

### 7.2 Item `COM_RECEITA`

Validações:

- Linha de receita tem de existir.
- Linha tem de pertencer ao utente.
- Linha tem de estar ativa.
- Linha não pode estar expirada.
- Linha tem de ter saldo suficiente.

Saldo usado:

```txt
disponivel =
  quantidade
  - quantidadeDispensada
  - quantidadeReservadaPendente
```

---

### 7.3 Item `SEM_RECEITA`

Validações:

- Registo sem receita tem de existir.
- Registo tem de pertencer ao utente.
- Tem de existir saldo suficiente.

Saldo usado:

```txt
disponivel =
  quantidade
  - quantidadeReservadaPendente
```

---

### 7.4 Item `EXTRA`

Validações:

- Extra tem de existir.
- Extra tem de pertencer ao utente.
- Extra tem de estar em aberto.
- Tem de existir saldo suficiente.

Estados aceites:

- `PENDENTE`
- `PARCIALMENTE_REGULARIZADO`

Saldo usado:

```txt
disponivel =
  quantidadeSolicitada
  - quantidadeRegularizada
  - quantidadeReservadaPendente
```

---

## 8. Fluxo da Farmácia

A Farmácia pode:

- listar pedidos;
- validar pedidos;
- rejeitar pedidos.

---

### 8.1 Listar pedidos

Por defeito, lista pedidos:

```txt
status=PENDENTE
```

Pode filtrar por:

- `PENDENTE`
- `VALIDADO`
- `REJEITADO`
- `CANCELADO`

---

### 8.2 Validar pedido

Só é permitido validar pedido em estado:

```txt
PENDENTE
```

Ao validar:

- pedido passa para `VALIDADO`;
- `validatedAt` é preenchido;
- `validatedById` pode ser preenchido;
- todos os itens pendentes passam para `VALIDADO`.

---

### 8.3 Validar item com receita

Efeitos:

- cria `Dispensa`;
- incrementa `quantidadeDispensada` na linha da receita;
- item passa para `VALIDADO`.

---

### 8.4 Validar item sem receita

Efeitos:

- reduz a quantidade disponível no registo sem receita;
- item passa para `VALIDADO`.

Exemplo:

```txt
quantidade original: 2
pedido validado: 1
nova quantidade: 1
```

---

### 8.5 Validar item Extra

Efeitos:

- cria `RegularizacaoExtra`;
- reduz saldo do Extra;
- item passa para `VALIDADO`.

Se o Extra ainda tiver saldo, continua em aberto.

Se o Extra ficar sem saldo, pode passar para estado regularizado conforme a lógica aplicada.

---

### 8.6 Rejeitar pedido

Só é permitido rejeitar pedido em estado:

```txt
PENDENTE
```

Efeitos:

- pedido passa para `REJEITADO`;
- itens pendentes passam para `REJEITADO`;
- `rejectedAt` é preenchido;
- `cancelReason` recebe o motivo.

A rejeição não altera:

- quantidades de receitas;
- quantidades de medicamentos sem receita;
- saldo de Extras;
- regularizações.

---

## 9. Regularizações

Uma regularização nasce quando um Extra é validado pela Farmácia.

Objetivo:

- compensar futuramente o medicamento extra com uma receita oficial.

---

### 9.1 Criar regularização

Criada automaticamente ao validar pedido com item `EXTRA`.

Campos principais:

- `utenteId`
- `extraId`
- `pedidoId`
- `pedidoNumero`
- `medicamento`
- `medicamentoNorm`
- `quantidadeSolicitada`
- `quantidadeRegularizada`
- `status`

---

### 9.2 Estados da regularização

| Estado | Regra |
|---|---|
| `PENDENTE` | Nada foi regularizado |
| `PARCIALMENTE_REGULARIZADO` | Parte da quantidade foi regularizada |
| `REGULARIZADO` | Toda a quantidade foi regularizada |

---

### 9.3 Auto-regularização

Quando uma nova receita é criada:

1. O sistema procura regularizações pendentes do mesmo utente.
2. Compara o medicamento.
3. Verifica saldo disponível na nova receita.
4. Cria `RegularizacaoEvento`.
5. Incrementa `quantidadeRegularizada`.
6. Incrementa `quantidadeDispensada` na linha da receita.
7. Atualiza o estado da regularização.

---

### 9.4 Regularização parcial

Se a receita nova só cobrir parte da quantidade:

```txt
quantidadeSolicitada: 3
quantidadeRegularizada anterior: 0
nova receita disponível: 1
```

Resultado:

```txt
quantidadeRegularizada: 1
status: PARCIALMENTE_REGULARIZADO
```

---

### 9.5 Regularização total

Se a receita nova cobrir tudo:

```txt
quantidadeSolicitada: 1
quantidadeRegularizada final: 1
```

Resultado:

```txt
status: REGULARIZADO
```

---

## 10. Histórico

### 10.1 Histórico de pedidos

Entram no histórico pedidos com estado:

- `VALIDADO`
- `REJEITADO`

Podem ser filtrados por:

- estado;
- data;
- pesquisa por utente;
- número;
- medicamento.

---

### 10.2 Histórico de regularizações

Entram no histórico regularizações com estado:

- `REGULARIZADO`

Regularizações pendentes ficam em:

```txt
/farmacia/regularizacoes/pendentes
```

Regularizações concluídas ficam em:

```txt
/farmacia/regularizacoes/historico
```

---

## 11. Dashboard

O dashboard da Farmácia devolve sinais agregados.

Inclui:

- pedidos pendentes;
- pedidos validados;
- pedidos rejeitados;
- pedidos cancelados;
- regularizações pendentes;
- regularizações concluídas;
- total de eventos de regularização;
- total de unidades regularizadas;
- último pedido;
- última regularização.

---

## 12. Jobs automáticos

Existem três jobs principais:

- `receitaExpiry`
- `higiene`
- `purgeHistory`

---

## 13. Job `receitaExpiry`

Objetivo:

- expirar linhas de receita vencidas;
- cancelar itens pendentes associados a essas linhas;
- cancelar pedidos totalmente afetados.

---

### 13.1 Quando corre

Agendamento por defeito:

```txt
0 3 * * *
```

Ou seja:

```txt
todos os dias às 03:00
```

---

### 13.2 Regras

O job procura linhas:

- `status: ATIVA`
- `validade <= now`

Efeitos:

- linha passa para `EXPIRADA`;
- itens pendentes ligados à linha passam para `CANCELADO_POR_EXPIRACAO`;
- se todos os itens do pedido forem cancelados por expiração, o pedido passa para `CANCELADO`.

---

## 14. Job `higiene`

Objetivo:

- marcar utentes removidos antigos como arquivados por rotina de higiene.

---

### 14.1 Quando corre

Agendamento por defeito:

```txt
0 3 1 * *
```

Ou seja:

```txt
dia 1 de cada mês às 03:00
```

---

### 14.2 Regras

O job procura utentes:

- com `deletedAt` antigo;
- ainda sem marcador de higiene no `invalidReason`.

Efeitos:

- mantém o registo;
- não apaga dados;
- mantém histórico;
- marca `invalidReason` com `[HIGIENE]`.

---

### 14.3 Anonimização

A anonimização só acontece se estiver explicitamente permitida.

Precisa de:

```env
HIGIENE_ANONYMIZE=true
ALLOW_HIGIENE_ANONYMIZE=true
```

Se não estiver permitido, o job apenas marca o utente como arquivado.

---

## 15. Job `purgeHistory`

Objetivo:

- apagar histórico antigo de forma controlada.

---

### 15.1 Quando corre

Agendamento por defeito:

```txt
0 3 1 * *
```

Ou seja:

```txt
dia 1 de cada mês às 03:00
```

---

### 15.2 O que pode apagar

Pode apagar:

- pedidos fechados antigos;
- itens desses pedidos;
- dispensas desses itens;
- regularizações já concluídas antigas;
- eventos dessas regularizações.

---

### 15.3 O que não deve apagar

Não deve apagar:

- utentes ativos;
- pedidos pendentes;
- receitas ativas;
- linhas de receita operacionais;
- medicamentos sem receita ativos;
- Extras em aberto;
- regularizações pendentes;
- regularizações parcialmente regularizadas.

---

## 16. Manutenção

As rotas de manutenção permitem:

- listar jobs;
- fazer preview;
- executar jobs manualmente.

Todas exigem header:

```txt
x-maintenance-key
```

---

### 16.1 Preview

Preview serve para ver o impacto antes de executar.

Exemplos:

- quantas receitas expiradas existem;
- quantos utentes seriam afetados por higiene;
- quantos pedidos antigos seriam apagados.

---

### 16.2 Run

Run executa de facto o job.

Deve ser usado com cuidado, especialmente:

```txt
purge-history
```

Porque apaga dados históricos antigos.

---

### 16.3 Segurança

Atualmente a proteção é por chave simples:

```txt
x-maintenance-key
```

Antes de produção, deve ser substituída ou complementada por autenticação real.

---

## 17. Regras de segurança

### 17.1 Nunca commitar `.env`

O ficheiro `.env` contém dados sensíveis, incluindo:

- `DATABASE_URL`
- password da base de dados
- chave de manutenção

Deve estar no `.gitignore`.

---

### 17.2 Não expor chave de manutenção

A chave:

```txt
MAINTENANCE_API_KEY
```

não deve ser colocada no frontend público.

---

### 17.3 Não usar password real em documentação

A documentação deve usar exemplos genéricos.

Não documentar passwords reais, tokens reais ou credenciais reais.

---

## 18. Regras de consistência

### 18.1 Não apagar dados ativos

Dados ativos não devem ser apagados diretamente.

Preferir:

- soft delete;
- status;
- histórico;
- bloqueios por regra de negócio.

---

### 18.2 Preservar histórico

Se um registo já foi usado em pedidos, dispensas ou regularizações, deve ser preservado.

Exemplos:

- linha de receita usada não pode ser apagada;
- sem receita usado em pedido não pode ser apagado;
- Extra usado em pedido não pode ser apagado.

---

### 18.3 Validar saldo sempre

Antes de criar pedidos ou validar pedidos, o sistema deve confirmar saldo real disponível.

Isto evita:

- dispensar mais do que a receita permite;
- duplicar quantidades pendentes;
- criar pedidos inconsistentes.

---

## 19. Erros esperados

### `400 BAD_REQUEST`

Quando o pedido enviado tem dados inválidos.

Exemplos:

- número com tamanho errado;
- quantidade inválida;
- validade inválida;
- body incompleto.

---

### `401 UNAUTHORIZED`

Quando falta autenticação ou chave de manutenção válida.

Exemplo:

- rota de manutenção sem `x-maintenance-key`.

---

### `403 FORBIDDEN`

Quando o recurso existe, mas não pertence ao utente indicado.

Exemplo:

- tentar usar linha de receita de outro utente.

---

### `404 NOT_FOUND`

Quando o recurso não existe.

Exemplos:

- utente inexistente;
- pedido inexistente;
- linha de receita inexistente.

---

### `409 CONFLICT`

Quando existe conflito de regra de negócio.

Exemplos:

- criar utente duplicado;
- pedir quantidade superior ao saldo;
- validar pedido já validado;
- apagar recurso já associado a histórico;
- remover utente com pendências.

---

## 20. Fluxo completo principal

### Fluxo com receita

1. Santa Casa cria utente.
2. Santa Casa adiciona receita.
3. Santa Casa cria pedido com item `COM_RECEITA`.
4. Farmácia valida pedido.
5. Sistema cria dispensa.
6. Linha da receita incrementa `quantidadeDispensada`.
7. Pedido entra no histórico como `VALIDADO`.

---

### Fluxo sem receita

1. Santa Casa cria utente.
2. Santa Casa adiciona medicamento sem receita.
3. Santa Casa cria pedido com item `SEM_RECEITA`.
4. Farmácia valida pedido.
5. Sistema reduz quantidade disponível do medicamento sem receita.
6. Pedido entra no histórico como `VALIDADO`.

---

### Fluxo com Extra

1. Santa Casa cria utente.
2. Santa Casa cria Extra.
3. Santa Casa cria pedido com item `EXTRA`.
4. Farmácia valida pedido.
5. Sistema cria regularização pendente.
6. Mais tarde, Santa Casa adiciona receita compatível.
7. Sistema regulariza automaticamente.
8. Regularização passa para histórico quando concluída.

---

## 21. Regra geral do sistema

O sistema deve sempre privilegiar:

1. consistência de dados;
2. preservação de histórico;
3. bloqueio de operações perigosas;
4. validação antes de mutação;
5. clareza nos estados;
6. respostas previsíveis para o frontend.