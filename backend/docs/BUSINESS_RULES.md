# BUSINESS_RULES.md

## Farmácia Santa Casa — Regras de Negócio do Backend

**Última atualização:** 2026-05-28  
**Âmbito:** Backend Express + Prisma + PostgreSQL  
**Objetivo:** Documentar as regras funcionais do domínio, independentemente da implementação concreta das rotas.

---

## 1. Visão geral do domínio

O backend gere o fluxo operacional entre a **Santa Casa** e a **Farmácia** para controlo de utentes, receitas, medicamentos, vendas suspensas, pedidos, validações, rejeições e regularizações.

O sistema tem três grandes áreas funcionais:

1. **Santa Casa**
   - Gere utentes.
   - Regista receitas.
   - Regista medicamentos não sujeitos a receita médica.
   - Regista vendas suspensas.
   - Cria e cancela pedidos antes da validação pela Farmácia.
   - Consulta histórico e regularizações.

2. **Farmácia**
   - Consulta pedidos pendentes.
   - Valida pedidos.
   - Rejeita pedidos.
   - Consulta histórico e regularizações.
   - Consulta sinais de dashboard.

3. **Administração**
   - Gere utilizadores do sistema.
   - Executa ou simula jobs de manutenção.
   - Acede a endpoints administrativos.

---

## 2. Terminologia funcional

| Termo funcional | Nome técnico interno | Descrição |
|---|---|---|
| Utente | `Utente` | Pessoa associada à Santa Casa. |
| Receita | `Receita` | Receita eletrónica identificada por número de 19 dígitos. |
| Linha de receita | `ReceitaLinha` | Medicamento individual dentro de uma receita. |
| Medicamento não sujeito a receita médica | `SemReceita` | Medicamento registado sem receita associada. |
| Venda Suspensa | `Extra` | Medicamento dispensado/necessitado antes de existir receita disponível para regularização. |
| Pedido | `Pedido` | Conjunto de itens enviado pela Santa Casa para validação pela Farmácia. |
| Item de pedido | `PedidoItem` | Linha individual de um pedido. Pode ser com receita, sem receita ou venda suspensa. |
| Dispensa | `Dispensa` | Registo criado quando a Farmácia valida um item com receita. |
| Regularização | `RegularizacaoExtra` | Processo que regulariza uma Venda Suspensa quando aparece receita compatível. |
| Evento de regularização | `RegularizacaoEvento` | Registo concreto de quantidade regularizada usando uma linha de receita. |

> Nota: Na UI deve ser usada linguagem funcional. `Extra` deve aparecer como **Venda Suspensa**. `SemReceita` deve aparecer como **Medicamento não sujeito a receita médica**.

---

## 3. Roles e permissões

### 3.1 Roles existentes

| Role | Descrição |
|---|---|
| `SANTACASA` | Utilizador da Santa Casa. |
| `FARMACIA` | Utilizador da Farmácia. |
| `ADMIN` | Administrador do sistema. |

### 3.2 Acesso por contexto

| Contexto | Roles permitidas |
|---|---|
| Autenticação | Login público; sessão atual exige autenticação. |
| Santa Casa | `SANTACASA`, `ADMIN` |
| Farmácia | `FARMACIA`, `ADMIN` |
| Manutenção | `ADMIN` |
| Administração de utilizadores | `ADMIN` |
| Health check global | `ADMIN` |

### 3.3 Regras gerais de autenticação

- A autenticação é feita por token JWT guardado em cookie HTTP-only.
- Um utilizador só é válido para sessão se existir e estiver ativo.
- Utilizadores inativos não podem autenticar-se.
- Uma sessão sem token, com token inválido ou expirado deve ser rejeitada.
- A role do utilizador autenticado controla o acesso aos grupos de rotas.

---

## 4. Utilizadores do sistema

### 4.1 Criação de utilizadores

Um utilizador deve ter:

- `name` obrigatório.
- `email` obrigatório.
- `email` único.
- `password` obrigatória.
- `password` com pelo menos 8 caracteres.
- `role` válida: `SANTACASA`, `FARMACIA` ou `ADMIN`.

Ao criar um utilizador:

- O email é normalizado para minúsculas.
- A password é guardada como hash.
- O utilizador fica ativo por defeito.

### 4.2 Atualização de utilizadores

Pode ser atualizado:

- Nome.
- Email.
- Role.
- Password.
- Estado ativo/inativo.

Regras:

- O email atualizado não pode colidir com outro utilizador.
- A password nova deve respeitar as regras mínimas.
- Um utilizador não pode alterar o estado da sua própria conta.

### 4.3 Remoção de utilizadores

Um utilizador só pode ser removido se:

- Não for o próprio utilizador autenticado.
- Estiver inativo.
- Não tiver histórico associado a pedidos ou itens validados/rejeitados.

Se o utilizador tiver histórico associado, não deve ser removido. Deve permanecer inativo para preservar auditoria.

---

## 5. Utentes

### 5.1 Estados de utente

| Estado | Significado |
|---|---|
| `ATIVO` | Utente operacional. Pode receber receitas, medicamentos, vendas suspensas e pedidos. |
| `ARQUIVADO` | Utente bloqueado para novas operações funcionais. Mantém histórico. |

Além do estado funcional, um utente pode estar logicamente removido através de `deletedAt`.

### 5.2 Criação de utente

Um utente deve ter:

- `numero9` obrigatório.
- `numero9` com exatamente 9 dígitos.
- `numero9` único.
- `nome` obrigatório.

Regras de duplicação:

- Se já existir utente ativo com o mesmo `numero9`, a criação é bloqueada.
- Se já existir utente arquivado com o mesmo `numero9`, a criação é bloqueada e deve ser considerada a reativação do registo existente.
- Se já existir utente removido com o mesmo `numero9`, a criação é bloqueada. O número não deve ser reutilizado.
- Se já existir utente não removido com o mesmo nome, a criação é bloqueada para evitar duplicados funcionais.

### 5.3 Operações permitidas apenas em utentes operacionais

As seguintes operações exigem utente:

- Existente.
- Não removido.
- Com estado `ATIVO`.

Operações afetadas:

- Consultar receitas do utente.
- Criar receitas.
- Remover linhas de receita.
- Consultar medicamentos não sujeitos a receita médica.
- Criar medicamentos não sujeitos a receita médica.
- Remover medicamentos não sujeitos a receita médica.
- Consultar Vendas Suspensas.
- Criar Vendas Suspensas.
- Remover Vendas Suspensas.
- Criar pedidos para o utente.

### 5.4 Arquivo de utente

Um utente pode ser arquivado se:

- Existir.
- Não estiver removido.
- Ainda não estiver arquivado.
- Não tiver pendências operacionais em aberto.

São consideradas pendências operacionais:

- Linhas de receita ativas com quantidade restante disponível.
- Medicamentos não sujeitos a receita médica com quantidade disponível.
- Vendas Suspensas em aberto.
- Regularizações em aberto.
- Itens de pedido pendentes.

Ao arquivar:

- O estado passa para `ARQUIVADO`.
- É guardada a data de arquivo.
- Pode ser guardado o motivo.
- Pode ser guardado o utilizador responsável pelo arquivo.

### 5.5 Reativação de utente

Um utente pode ser reativado se:

- Existir.
- Não estiver removido.
- Estiver arquivado.

Ao reativar:

- O estado volta para `ATIVO`.
- A data de arquivo é limpa.
- O motivo de arquivo é limpo.
- O utilizador responsável pelo arquivo é limpo.

### 5.6 Remoção de utente

A remoção é lógica, não física.

Um utente só pode ser removido se:

- Existir.
- Não estiver já removido.
- Não tiver dados associados.

Bloqueiam a remoção:

- Receitas.
- Linhas de receita.
- Medicamentos não sujeitos a receita médica.
- Vendas Suspensas.
- Itens de pedido.
- Regularizações.
- Eventos de regularização.
- Dispensas.

Se existirem dados associados, o utente deve ser arquivado em vez de removido.

Ao remover:

- `deletedAt` é preenchido.
- `isValid` passa para `false`.
- `invalidReason` recebe o motivo da remoção.

---

## 6. Medicamentos

O modelo `Medicamento` existe como referência opcional para medicamentos normalizados.

Tipos possíveis:

| Tipo | Descrição |
|---|---|
| `COM_RECEITA` | Medicamento associado a receita. |
| `SEM_RECEITA` | Medicamento não sujeito a receita médica. |

Atualmente, várias operações também aceitam o nome textual do medicamento sem exigir referência direta a `Medicamento`.

---

## 7. Receitas

### 7.1 Estrutura de uma receita

Uma receita contém:

- `numero19`: número único de 19 dígitos.
- `pinAcesso6`: PIN de acesso com 6 dígitos.
- `pinOpcao4`: PIN de opção com 4 dígitos.
- Uma ou mais linhas de receita.

### 7.2 Criação de receita

Para criar uma receita:

- O utente deve estar operacional.
- `numero19` deve ter exatamente 19 dígitos.
- `pinAcesso6` deve ter exatamente 6 dígitos.
- `pinOpcao4` deve ter exatamente 4 dígitos.
- Deve existir pelo menos uma linha.
- O `numero19` não pode já existir.

### 7.3 Regras das linhas de receita

Cada linha deve ter:

- Nome do medicamento obrigatório.
- Quantidade inteira maior que 0.
- Validade válida.
- Validade futura.

Na mesma receita:

- Não é permitido repetir o mesmo medicamento.
- A comparação usa nome normalizado, sem acentos, em minúsculas e sem espaços laterais.

Ao criar:

- A linha fica com estado `ATIVA`.
- `quantidadeDispensada` começa em 0.

### 7.4 Quantidade restante de uma linha de receita

A quantidade restante funcional é calculada assim:

```txt
quantidadeRestante = quantidade - quantidadeDispensada - quantidadeReservadaPendente
```

Onde:

- `quantidade` é a quantidade total da linha.
- `quantidadeDispensada` é o total já dispensado/regularizado.
- `quantidadeReservadaPendente` é a quantidade em itens de pedido pendentes.

A quantidade restante nunca deve ser negativa.

### 7.5 Listagem de receitas de um utente

Ao listar receitas de um utente:

- Só são consideradas linhas `ATIVA`.
- Só devem ser devolvidas linhas com quantidade restante maior que 0.
- As linhas são ordenadas por medicamento, validade, data de criação e ID, favorecendo o controlo FEFO.

### 7.6 Remoção de linha de receita

Uma linha de receita só pode ser removida se:

- O utente estiver operacional.
- A linha existir.
- A linha pertencer ao utente.
- A linha não tiver quantidade dispensada.
- A linha não tiver dispensas associadas.
- A linha não estiver associada a itens de pedido.
- A linha não tiver sido usada em eventos de regularização.

Se a linha removida for a última linha da receita, a receita também é removida.

### 7.7 Receitas e regularizações pendentes

Ao criar uma receita, o sistema verifica se as novas linhas podem regularizar Vendas Suspensas pendentes.

Se existirem regularizações possíveis e o pedido não trouxer confirmação explícita:

- A criação deve ser bloqueada.
- Deve ser devolvida informação de pré-visualização.
- O frontend deve pedir confirmação ao utilizador.

Se a confirmação for enviada:

- A receita é criada.
- As linhas são criadas.
- As regularizações pendentes compatíveis são aplicadas.
- São criados eventos de regularização.
- As quantidades dispensadas das linhas usadas são incrementadas.

---

## 8. Medicamentos não sujeitos a receita médica

### 8.1 Criação

Para criar um medicamento não sujeito a receita médica:

- O utente deve estar operacional.
- O nome do medicamento é obrigatório.
- A quantidade deve ser um inteiro maior que 0.

Se o utente já tiver um registo com o mesmo medicamento:

- A comparação é case-insensitive.
- Não é criado novo registo.
- A quantidade é incrementada no registo existente.

### 8.2 Quantidade restante

A quantidade restante é calculada assim:

```txt
quantidadeRestante = quantidade - quantidadeReservadaPendente
```

Onde `quantidadeReservadaPendente` corresponde a itens de pedido pendentes associados ao registo.

A quantidade restante nunca deve ser negativa.

### 8.3 Listagem

Ao listar medicamentos não sujeitos a receita médica de um utente:

- Só devem ser devolvidos registos com quantidade restante maior que 0.
- Os registos são ordenados por data de criação descendente.

### 8.4 Remoção

Um registo só pode ser removido se:

- O utente estiver operacional.
- O registo existir.
- O registo pertencer ao utente.
- Não estiver associado a nenhum item de pedido.

---

## 9. Vendas Suspensas

### 9.1 Estados de Venda Suspensa

| Estado | Significado |
|---|---|
| `PENDENTE` | Venda Suspensa em aberto. |
| `PARCIALMENTE_REGULARIZADO` | Parte da quantidade já foi regularizada. |
| `REGULARIZADO` | Venda Suspensa concluída. |
| `EXPIRADO` | Estado previsto para expiração/encerramento, quando aplicável. |

### 9.2 Criação de Venda Suspensa

Para criar uma Venda Suspensa:

- O utente deve estar operacional.
- O medicamento é obrigatório.
- A quantidade solicitada deve ser um inteiro maior que 0.
- O medicamento é normalizado para comparação funcional.

Antes de criar, o sistema valida:

1. Se existe receita ativa com quantidade disponível para o mesmo medicamento.
2. Se já existe Venda Suspensa em aberto para o mesmo medicamento.

Se existir receita ativa disponível:

- A criação é bloqueada.
- A lógica correta é usar primeiro a receita existente.

Se já existir Venda Suspensa em aberto para o mesmo medicamento:

- A criação é bloqueada.
- A Venda Suspensa existente deve ser usada em vez de duplicar.

### 9.3 Consideração de rascunho de pedido

Ao validar se existe receita ativa disponível, o sistema pode considerar itens já em rascunho no frontend.

Objetivo:

- Evitar bloquear a criação de Venda Suspensa quando a quantidade disponível da receita já está a ser consumida no pedido em construção.

### 9.4 Quantidade restante de Venda Suspensa

A quantidade restante é calculada assim:

```txt
quantidadeRestante = quantidadeSolicitada
  - quantidadeRegularizada
  - quantidadeCancelada
  - quantidadeReservadaPendente
```

Onde:

- `quantidadeSolicitada` é a quantidade em aberto.
- `quantidadeRegularizada` é a quantidade já regularizada.
- `quantidadeCancelada` é a quantidade cancelada por chegada posterior de receita ou ajuste do sistema.
- `quantidadeReservadaPendente` é a quantidade em pedidos pendentes.

A quantidade restante nunca deve ser negativa.

### 9.5 Listagem

Ao listar Vendas Suspensas de um utente:

- Só são consideradas Vendas Suspensas com estado `PENDENTE` ou `PARCIALMENTE_REGULARIZADO`.
- Só são devolvidas Vendas Suspensas com quantidade restante maior que 0.
- A ordenação é por data de criação descendente.

### 9.6 Remoção

Uma Venda Suspensa só pode ser removida se:

- O utente estiver operacional.
- A Venda Suspensa existir.
- A Venda Suspensa pertencer ao utente.
- Não estiver associada a nenhum item de pedido.

### 9.7 Resolução automática quando entra uma receita

Quando uma nova receita é criada, o sistema procura Vendas Suspensas em aberto para medicamentos compatíveis.

Se encontrar Venda Suspensa compatível:

- Se não houver itens de pedido associados, a Venda Suspensa pode ser removida.
- Se houver itens de pedido associados, a quantidade ainda não enviada em pedido pode ser cancelada.
- A quantidade cancelada é acumulada em `quantidadeCancelada`.

Esta regra evita manter em aberto uma Venda Suspensa que passou a ter cobertura por receita.

---

## 10. Pedidos

### 10.1 Tipos de item de pedido

| Tipo | Origem |
|---|---|
| `COM_RECEITA` | Linha de receita. |
| `SEM_RECEITA` | Medicamento não sujeito a receita médica. |
| `EXTRA` | Venda Suspensa. |

### 10.2 Estados de pedido

| Estado | Significado |
|---|---|
| `PENDENTE` | Pedido enviado, ainda não decidido pela Farmácia. |
| `VALIDADO` | Pedido aceite pela Farmácia. |
| `REJEITADO` | Pedido recusado pela Farmácia. |
| `CANCELADO` | Pedido cancelado antes da conclusão ou por rotina automática. |

### 10.3 Estados de item de pedido

| Estado | Significado |
|---|---|
| `PENDENTE` | Item ainda não processado. |
| `VALIDADO` | Item aceite. |
| `REJEITADO` | Item recusado. |
| `CANCELADO` | Item cancelado pela Santa Casa antes da validação. |
| `CANCELADO_POR_EXPIRACAO` | Item cancelado automaticamente por expiração de receita. |

### 10.4 Numeração de pedidos

- Cada pedido tem um número inteiro único.
- O número é gerado automaticamente por autoincremento.
- A numeração deve ser considerada sequencial e histórica.
- Não deve ser reiniciada manualmente por causa de limpezas de histórico.

### 10.5 Criação de pedido

Para criar um pedido:

- Deve existir pelo menos um item.
- Cada item deve ter `utenteId`.
- Cada item deve ter tipo válido.
- Cada item deve referenciar um ID válido.
- Cada item deve ter quantidade inteira maior que 0.
- O utente de cada item deve estar operacional.

Itens duplicados no mesmo pedido são agregados.

A chave funcional de agregação é:

```txt
utenteId + tipo + idReferencia
```

### 10.6 Reserva de quantidades

Itens de pedido com estado `PENDENTE` funcionam como reserva.

Isto significa que:

- Reduzem a quantidade disponível apresentada ao utilizador.
- Impedem que outro pedido consuma a mesma quantidade.
- São considerados em validações de disponibilidade.

Enquanto o pedido não for validado, a quantidade ainda não foi definitivamente dispensada.

### 10.7 Validação de item com receita

Para adicionar item `COM_RECEITA` a um pedido:

- A linha de receita deve existir.
- A linha deve pertencer ao utente indicado.
- A linha deve estar `ATIVA`.
- A validade deve ser futura.
- A quantidade pedida não pode exceder a quantidade disponível.

Disponibilidade:

```txt
disponivel = quantidade - quantidadeDispensada - quantidadeReservadaPendente
```

### 10.8 Regra FEFO para receitas

O sistema aplica a regra **FEFO** — First Expired, First Out.

Para o mesmo medicamento:

- Deve ser usada primeiro a receita com validade mais próxima.
- Se existir linha ativa anterior com quantidade disponível, não é permitido usar uma linha com validade posterior.

A comparação considera:

- `medicamentoId`, quando disponível.
- Nome normalizado do medicamento, quando não existe `medicamentoId`.

A regra também considera as quantidades já incluídas no pedido em construção.

### 10.9 Validação de item de medicamento não sujeito a receita médica

Para adicionar item `SEM_RECEITA` a um pedido:

- O registo deve existir.
- O registo deve pertencer ao utente indicado.
- A quantidade pedida não pode exceder a quantidade disponível.

Disponibilidade:

```txt
disponivel = quantidade - quantidadeReservadaPendente
```

### 10.10 Validação de item de Venda Suspensa

Para adicionar item `EXTRA` a um pedido:

- A Venda Suspensa deve existir.
- A Venda Suspensa deve pertencer ao utente indicado.
- A Venda Suspensa deve estar `PENDENTE` ou `PARCIALMENTE_REGULARIZADO`.
- A quantidade pedida não pode exceder a quantidade disponível.

Disponibilidade:

```txt
disponivel = quantidadeSolicitada
  - quantidadeRegularizada
  - quantidadeCancelada
  - quantidadeReservadaPendente
```

### 10.11 Cancelamento de pedido pela Santa Casa

A Santa Casa pode cancelar um pedido se:

- O pedido existir.
- O pedido estiver `PENDENTE`.

Ao cancelar:

- O pedido passa para `CANCELADO`.
- Os itens pendentes passam para `CANCELADO`.
- É guardado um motivo em `closedReason`.

Como os itens pendentes apenas representam reserva, o cancelamento liberta a disponibilidade.

### 10.12 Validação de pedido pela Farmácia

A Farmácia pode validar um pedido se:

- O pedido existir.
- O pedido estiver `PENDENTE`.
- Todos os itens estiverem `PENDENTE`.
- Todos os itens continuarem disponíveis no momento da validação.
- O utilizador autenticado existir.

Antes de validar, o sistema volta a verificar disponibilidade para evitar inconsistências.

### 10.13 Efeitos da validação por tipo de item

#### Item `COM_RECEITA`

Ao validar:

- É criada uma `Dispensa`.
- `quantidadeDispensada` da linha de receita é incrementada.
- O item passa para `VALIDADO`.
- É guardado `validatedAt` e `validatedById`.

#### Item `SEM_RECEITA`

Ao validar:

- A quantidade do registo é reduzida.
- O item passa para `VALIDADO`.
- É guardado `validatedAt` e `validatedById`.

#### Item `EXTRA`

Ao validar:

- É criada uma `RegularizacaoExtra` associada ao utente, Venda Suspensa e pedido.
- A regularização fica pendente até existir receita compatível.
- A quantidade validada deixa de estar em aberto na Venda Suspensa.
- O item passa para `VALIDADO`.
- É guardado `validatedAt` e `validatedById`.

### 10.14 Fecho do pedido validado

Depois de todos os itens serem processados:

- O pedido passa para `VALIDADO`.
- É guardado `validatedAt`.
- É guardado `validatedById`.

### 10.15 Rejeição de pedido pela Farmácia

A Farmácia pode rejeitar um pedido se:

- O pedido existir.
- O pedido estiver `PENDENTE`.
- O utilizador autenticado existir.

Ao rejeitar:

- Todos os itens pendentes passam para `REJEITADO`.
- O pedido passa para `REJEITADO`.
- É guardado `rejectedAt`.
- É guardado `rejectedById`.
- Pode ser guardado motivo em `closedReason`.

Como os itens pendentes apenas representam reserva, a rejeição liberta a disponibilidade.

---

## 11. Dispensas

Uma `Dispensa` é criada quando um item `COM_RECEITA` é validado pela Farmácia.

A dispensa regista:

- Linha de receita usada.
- Item de pedido associado.
- Quantidade dispensada.
- Data de criação.

Regras:

- Uma dispensa representa consumo definitivo da receita.
- Uma linha com dispensas associadas não pode ser removida.
- Uma dispensa contribui para bloqueios de remoção de utentes.

---

## 12. Regularizações de Vendas Suspensas

### 12.1 Objetivo

Regularizações existem para ligar uma Venda Suspensa já validada pela Farmácia a uma receita criada posteriormente.

Fluxo típico:

1. A Santa Casa cria uma Venda Suspensa.
2. A Santa Casa envia um pedido com essa Venda Suspensa.
3. A Farmácia valida o pedido.
4. O sistema cria uma regularização pendente.
5. Mais tarde, a Santa Casa cria uma receita compatível.
6. O sistema aplica a receita à regularização pendente.

### 12.2 Estados de regularização

| Estado | Significado |
|---|---|
| `PENDENTE` | Ainda não foi regularizada. |
| `PARCIALMENTE_REGULARIZADO` | Parte da quantidade foi regularizada. |
| `REGULARIZADO` | Toda a quantidade foi regularizada. |

### 12.3 Quantidade restante de regularização

```txt
quantidadeRestante = quantidadeSolicitada - quantidadeRegularizada
```

A quantidade restante nunca deve ser negativa.

### 12.4 Criação de regularização

Uma regularização é criada automaticamente quando a Farmácia valida um item de pedido do tipo `EXTRA`.

A regularização guarda:

- Utente.
- Venda Suspensa original.
- Pedido original.
- Número do pedido.
- Medicamento.
- Medicamento normalizado.
- Quantidade solicitada.
- Quantidade já regularizada.
- Estado.

### 12.5 Aplicação automática de regularizações

Quando são criadas novas linhas de receita, o sistema tenta aplicar regularizações pendentes.

A aplicação respeita:

- Mesmo utente.
- Medicamento compatível.
- Linha de receita ativa.
- Linha com validade futura.
- Quantidade disponível na linha.
- Regularizações pendentes mais antigas primeiro.

A ordenação funcional é:

1. Linhas de receita por validade ascendente.
2. Regularizações por data de criação ascendente.
3. Número do pedido ascendente.

### 12.6 Efeitos de uma regularização aplicada

Ao aplicar uma regularização:

- É criado um `RegularizacaoEvento`.
- `quantidadeRegularizada` da regularização é incrementada.
- O estado da regularização é atualizado.
- `quantidadeDispensada` da linha de receita é incrementada.

Se a quantidade regularizada atingir a quantidade solicitada:

- A regularização passa para `REGULARIZADO`.

Se ainda faltar quantidade:

- A regularização passa para `PARCIALMENTE_REGULARIZADO`.

---

## 13. Histórico

O sistema mantém histórico para:

- Pedidos validados.
- Pedidos rejeitados.
- Pedidos cancelados.
- Regularizações concluídas.
- Eventos de regularização.
- Auditoria de utilizadores que validaram/rejeitaram.

Regra importante:

- Dados com valor histórico não devem ser removidos manualmente sem passar pelas regras de manutenção previstas.

---

## 14. Jobs de manutenção

### 14.1 Receita Expiry Job

Objetivo:

- Expirar linhas de receita vencidas.
- Cancelar pedidos pendentes afetados por essas linhas.

Periodicidade prevista:

- Diária.

Regras:

- Linhas `ATIVA` com `validade <= agora` passam para `EXPIRADA`.
- Se uma linha expirada estiver associada a itens pendentes de pedidos pendentes, o pedido inteiro é afetado.
- Os itens pendentes dos pedidos afetados passam para `CANCELADO_POR_EXPIRACAO`.
- Os pedidos afetados passam para `CANCELADO`.
- O motivo de fecho indica cancelamento automático por expiração da receita.

### 14.2 Higiene Job

Objetivo:

- Marcar utentes removidos antigos como tratados pela rotina de higiene.
- Opcionalmente anonimizar dados, se a configuração permitir.

Periodicidade prevista:

- Mensal.

Regras:

- Considera utentes com `deletedAt` anterior ou igual à data de corte.
- Ignora utentes já marcados com o marcador de higiene.
- Por defeito, marca o utente como inválido e atualiza o motivo.
- A anonimização só é aplicada se estiver pedida e explicitamente permitida por configuração.

### 14.3 Purge History Job

Objetivo:

- Remover histórico antigo de pedidos fechados e regularizações concluídas.

Periodicidade prevista:

- Mensal.

Regras para pedidos:

- Considera pedidos com estado `VALIDADO`, `REJEITADO` ou `CANCELADO`.
- Usa datas de validação, rejeição ou atualização para determinar antiguidade.
- Remove dispensas associadas aos itens desses pedidos.
- Remove itens dos pedidos.
- Remove os pedidos.
- Antes de remover pedidos, desvincula regularizações que apontem para esses pedidos.

Regras para regularizações:

- Considera regularizações com estado `REGULARIZADO`.
- Usa `updatedAt` para determinar antiguidade.
- Remove eventos de regularização associados.
- Remove regularizações concluídas.

---

## 15. Disponibilidade e reservas

### 15.1 Princípio geral

Qualquer item pendente em pedido representa uma reserva temporária.

Isto aplica-se a:

- Linhas de receita.
- Medicamentos não sujeitos a receita médica.
- Vendas Suspensas.

### 15.2 Motivo da reserva

A reserva evita que a mesma quantidade seja usada em dois pedidos pendentes ao mesmo tempo.

Exemplo:

- Uma linha de receita tem 10 unidades.
- Já existe pedido pendente com 4 unidades.
- A disponibilidade funcional passa a ser 6 unidades.

### 15.3 Libertação da reserva

A reserva é libertada quando o item deixa de estar pendente por:

- Validação.
- Rejeição.
- Cancelamento.
- Cancelamento automático por expiração.

Na validação, a reserva deixa de ser reserva e passa a consumo definitivo.

---

## 16. Normalização de medicamentos

O sistema usa normalização textual para comparar medicamentos quando não existe ID de medicamento explícito.

A normalização:

- Remove acentos.
- Converte para minúsculas.
- Remove espaços laterais.

Esta normalização é usada em regras como:

- Deteção de medicamentos repetidos numa receita.
- Deteção de receita ativa antes de criar Venda Suspensa.
- Deteção de Vendas Suspensas duplicadas.
- Associação de regularizações a novas linhas de receita.
- Regra FEFO quando não existe `medicamentoId`.

---

## 17. Auditoria

O sistema guarda informação de auditoria em operações críticas.

### 17.1 Validação

Ao validar pedidos e itens:

- É guardada a data de validação.
- É guardado o utilizador que validou.

### 17.2 Rejeição

Ao rejeitar pedidos e itens:

- É guardada a data de rejeição.
- É guardado o utilizador que rejeitou.
- Pode ser guardado motivo.

### 17.3 Arquivo de utentes

Ao arquivar utentes:

- É guardada a data de arquivo.
- Pode ser guardado o motivo.
- Pode ser guardado o utilizador responsável.

### 17.4 Utilizadores com histórico

Utilizadores que aparecem em histórico de validação/rejeição não devem ser removidos.

Devem ser desativados para preservar a integridade da auditoria.

---

## 18. Erros funcionais esperados

### 18.1 `400 BAD_REQUEST`

Usado quando o payload ou query params são inválidos.

Exemplos:

- Número de utente sem 9 dígitos.
- Receita sem número de 19 dígitos.
- Quantidade inválida.
- Data inválida.
- Role inválida.
- Password demasiado curta.

### 18.2 `401 UNAUTHORIZED`

Usado quando:

- Falta sessão.
- Token é inválido ou expirou.
- Utilizador está inativo.
- Utilizador autenticado esperado não existe no contexto.

### 18.3 `403 FORBIDDEN`

Usado quando:

- O utilizador não tem role necessária.
- Um recurso pertence a outro utente.
- Um admin tenta alterar/remover a própria conta em operações proibidas.
- A origem do pedido é inválida em operações protegidas.

### 18.4 `404 NOT_FOUND`

Usado quando:

- Utente não existe.
- Pedido não existe.
- Linha de receita não existe.
- Venda Suspensa não existe.
- Medicamento não sujeito a receita médica não existe.
- Utilizador não existe.

### 18.5 `409 CONFLICT`

Usado quando a operação é tecnicamente válida, mas viola uma regra de negócio.

Exemplos:

- Criar utente duplicado.
- Criar receita com número já existente.
- Criar Venda Suspensa quando já existe receita ativa disponível.
- Pedir quantidade superior à disponível.
- Usar receita com validade posterior quando existe outra mais próxima.
- Arquivar utente com pendências.
- Remover registo com histórico associado.
- Validar pedido que já não está pendente.

---

## 19. Decisões funcionais importantes

### 19.1 Arquivar é preferível a remover

Sempre que um utente tem histórico ou dependências, deve ser arquivado em vez de removido.

Motivo:

- Preserva histórico.
- Evita inconsistências.
- Mantém rastreabilidade.

### 19.2 Pedidos pendentes são reservas

Pedidos pendentes não alteram definitivamente stock ou quantidades dispensadas.

Mas reduzem a disponibilidade funcional até serem resolvidos.

### 19.3 Validação revalida tudo

Mesmo que o pedido tenha sido criado com sucesso, a Farmácia revalida disponibilidade no momento da validação.

Motivo:

- Evitar inconsistências por alterações concorrentes.
- Garantir que receitas continuam ativas e não expiraram.
- Garantir que quantidades continuam disponíveis.

### 19.4 Receita mais antiga deve ser usada primeiro

A regra FEFO impede usar linhas com validade mais longa enquanto existir linha compatível com validade mais curta e quantidade disponível.

### 19.5 Numeração de pedidos não deve reiniciar

A numeração de pedidos é histórica e sequencial.

Mesmo que histórico antigo seja limpo, os novos pedidos devem continuar a sequência natural da base de dados.

---

## 20. Checklist de consistência funcional

Antes de alterar o backend, confirmar que a alteração não quebra:

- [ ] Bloqueio de operações em utentes arquivados.
- [ ] Bloqueio de operações em utentes removidos.
- [ ] Cálculo de quantidade restante em receitas.
- [ ] Cálculo de quantidade restante em medicamentos não sujeitos a receita médica.
- [ ] Cálculo de quantidade restante em Vendas Suspensas.
- [ ] Reservas de itens pendentes.
- [ ] Regra FEFO.
- [ ] Validação final pela Farmácia.
- [ ] Criação de dispensas.
- [ ] Criação de regularizações a partir de Vendas Suspensas.
- [ ] Aplicação automática de regularizações quando entra receita.
- [ ] Bloqueios de remoção com histórico.
- [ ] Auditoria de utilizadores.
- [ ] Jobs de expiração, higiene e purge.
- [ ] Separação de permissões por role.

---

## 21. Fora do âmbito deste ficheiro

Este ficheiro não documenta em detalhe:

- URLs completas dos endpoints.
- Payloads exatos de cada rota.
- Exemplos de requests/responses.
- Setup local.
- Variáveis de ambiente.
- Estratégia de testes.

Esses temas devem ficar em ficheiros próprios:

- `API_ROUTES.md`
- `README.md`
- `ENVIRONMENT.md`
- `TESTING.md`

