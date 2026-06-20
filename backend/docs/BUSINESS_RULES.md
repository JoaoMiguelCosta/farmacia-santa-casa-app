# BUSINESS_RULES.md

## Farmácia Santa Casa — Regras de Negócio do Backend

**Última atualização:** 2026-06-17
**Âmbito:** Backend Express + Prisma + PostgreSQL
**Objetivo:** Documentar as regras funcionais do domínio, independentemente da implementação concreta das rotas.

---

## 1. Visão geral do domínio

O backend gere o fluxo operacional entre a **Santa Casa** e a **Farmácia** para controlo de utentes, receitas, medicação habitual, medicamentos não sujeitos a receita médica, Vendas Suspensas, pedidos, validações, rejeições, alertas operacionais e regularizações.

O sistema tem três grandes áreas funcionais:

1. **Santa Casa**

   * Gere utentes.
   * Regista medicação habitual.
   * Regista receitas.
   * Regista medicamentos não sujeitos a receita médica.
   * Regista medicamentos para Venda Suspensa.
   * Cria pedidos para validação pela Farmácia.
   * Cancela pedidos antes da validação pela Farmácia.
   * Consulta histórico, regularizações e sinais operacionais.

2. **Farmácia**

   * Consulta pedidos pendentes.
   * Consulta detalhes de pedidos.
   * Valida pedidos.
   * Rejeita pedidos.
   * Consulta histórico de pedidos.
   * Consulta regularizações pendentes e concluídas.
   * Consulta e fecha alertas operacionais.
   * Consulta sinais de dashboard.

3. **Administração**

   * Gere utilizadores do sistema.
   * Executa ou simula jobs de manutenção.
   * Acede a endpoints administrativos.
   * Consulta health check global.

---

## 2. Terminologia funcional

| Termo funcional                          | Nome técnico interno  | Descrição                                                                                                             |
| ---------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Utente                                   | `Utente`              | Pessoa associada à Santa Casa.                                                                                        |
| Medicação habitual                       | `MedicacaoHabitual`   | Medicamentos normalmente usados pelo utente, usados como apoio/sugestão operacional.                                  |
| Receita                                  | `Receita`             | Receita eletrónica identificada por número de 19 dígitos.                                                             |
| Linha de receita                         | `ReceitaLinha`        | Medicamento individual dentro de uma receita.                                                                         |
| Medicamento não sujeito a receita médica | `SemReceita`          | Medicamento registado sem receita associada.                                                                          |
| Venda Suspensa                           | `Extra`               | Medicamento que o utente precisa, mas que ainda não tem receita disponível para permitir pedido/regularização normal. |
| Pedido                                   | `Pedido`              | Conjunto de itens enviado pela Santa Casa para validação pela Farmácia.                                               |
| Item de pedido                           | `PedidoItem`          | Linha individual de um pedido. Pode ser com receita, sem receita ou Venda Suspensa.                                   |
| Dispensa                                 | `Dispensa`            | Registo criado quando a Farmácia valida um item com receita.                                                          |
| Regularização                            | `RegularizacaoExtra`  | Processo que regulariza uma Venda Suspensa quando aparece receita compatível.                                         |
| Evento de regularização                  | `RegularizacaoEvento` | Registo concreto de quantidade regularizada usando uma linha de receita.                                              |
| Alerta operacional                       | `AlertaOperacional`   | Notificação operacional gerada para a Farmácia.                                                                       |

> Nota: Na UI deve ser usada linguagem funcional. `Extra` deve aparecer como **Venda Suspensa**. `SemReceita` deve aparecer como **Medicamento não sujeito a receita médica**.

---

## 3. Roles e permissões

### 3.1 Roles existentes

| Role        | Descrição                 |
| ----------- | ------------------------- |
| `SANTACASA` | Utilizador da Santa Casa. |
| `FARMACIA`  | Utilizador da Farmácia.   |
| `ADMIN`     | Administrador do sistema. |

### 3.2 Acesso por contexto

| Contexto                      | Roles permitidas                                        |
| ----------------------------- | ------------------------------------------------------- |
| Autenticação                  | Login/logout públicos; sessão atual exige autenticação. |
| Santa Casa                    | `SANTACASA`, `ADMIN`                                    |
| Farmácia                      | `FARMACIA`, `ADMIN`                                     |
| Manutenção                    | `ADMIN`                                                 |
| Administração de utilizadores | `ADMIN`                                                 |
| Health check live/ready       | Público                                                 |
| Health check global           | `ADMIN`                                                 |

### 3.3 Regras gerais de autenticação

* A autenticação é feita por token JWT guardado em cookie HTTP-only.
* Um utilizador só é válido para sessão se existir e estiver ativo.
* Utilizadores inativos não podem autenticar-se.
* Uma sessão sem token, com token inválido ou expirado deve ser rejeitada.
* A role do utilizador autenticado controla o acesso aos grupos de rotas.
* Logout é permitido mesmo sem sessão ativa, porque a operação apenas limpa o cookie.

### 3.4 Separação funcional por áreas

* Utilizadores `SANTACASA` não podem aceder às rotas protegidas da Farmácia.
* Utilizadores `FARMACIA` não podem aceder às rotas protegidas da Santa Casa.
* Utilizadores `ADMIN` podem aceder às áreas Santa Casa e Farmácia.
* Apenas `ADMIN` pode aceder a administração de utilizadores, manutenção e health check global.

---

## 4. Utilizadores do sistema

### 4.1 Criação de utilizadores

Um utilizador deve ter:

* `name` obrigatório.
* `email` obrigatório.
* `email` válido.
* `email` único.
* `password` obrigatória.
* `password` com pelo menos 10 caracteres.
* `role` válida: `SANTACASA`, `FARMACIA` ou `ADMIN`.

Ao criar um utilizador:

* O nome é limpo de espaços laterais.
* O email é normalizado para minúsculas.
* A role é normalizada para maiúsculas.
* A password é guardada como hash.
* O utilizador fica ativo por defeito.
* Nunca é devolvida password nem hash ao frontend.

### 4.2 Listagem de utilizadores

A listagem pode ser filtrada por:

* Pesquisa por nome/email.
* Role.
* Estado ativo/inativo.
* Paginação por `page/pageSize` ou `skip/take`.

Regras:

* `skip/take` têm prioridade sobre `page/pageSize` quando ambos são enviados.
* `take` tem limite máximo.
* Pesquisa demasiado longa deve ser rejeitada.

### 4.3 Atualização de utilizadores

Pode ser atualizado:

* Nome.
* Email.
* Role.
* Password.
* Estado ativo/inativo.

Regras:

* O email atualizado não pode colidir com outro utilizador.
* A password nova deve respeitar as regras mínimas.
* O estado ativo/inativo deve ser booleano real.
* Um utilizador não pode alterar a role da sua própria conta.
* Um utilizador não pode alterar o estado da sua própria conta.

### 4.4 Remoção de utilizadores

Um utilizador só pode ser removido se:

* Não for o próprio utilizador autenticado.
* Estiver inativo.
* Não tiver histórico associado a validações, rejeições ou outras auditorias relevantes.

Se o utilizador tiver histórico associado, não deve ser removido. Deve permanecer inativo para preservar auditoria.

---

## 5. Utentes

### 5.1 Estados de utente

| Estado      | Significado                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| `ATIVO`     | Utente operacional. Pode receber receitas, medicação habitual, medicamentos, Vendas Suspensas e pedidos. |
| `ARQUIVADO` | Utente bloqueado para novas operações funcionais. Mantém histórico.                                      |

Além do estado funcional, um utente pode estar logicamente removido através de `deletedAt`.

### 5.2 Criação de utente

Um utente deve ter:

* `numero9` obrigatório.
* `numero9` com exatamente 9 dígitos.
* `nome` obrigatório.

Regras de duplicação:

* Se já existir utente ativo com o mesmo `numero9`, a criação é bloqueada.
* Se já existir utente arquivado com o mesmo `numero9`, a criação é bloqueada e deve ser considerada a reativação do registo existente.
* Se já existir utente removido com o mesmo `numero9`, a criação é bloqueada. O número não deve ser reutilizado.
* Se já existir utente arquivado com o mesmo nome, a criação é bloqueada para evitar duplicados funcionais.
* Se já existir utente não removido com o mesmo nome, a criação pode ser bloqueada conforme a regra de deduplicação ativa no backend.

### 5.3 Operações permitidas apenas em utentes operacionais

As seguintes operações exigem utente:

* Existente.
* Não removido.
* Com estado `ATIVO`.

Operações afetadas:

* Consultar medicação habitual do utente.
* Criar medicação habitual.
* Remover medicação habitual.
* Consultar receitas do utente.
* Criar receitas.
* Remover linhas de receita.
* Consultar medicamentos não sujeitos a receita médica.
* Criar medicamentos não sujeitos a receita médica.
* Remover medicamentos não sujeitos a receita médica.
* Consultar Vendas Suspensas.
* Criar Vendas Suspensas.
* Remover Vendas Suspensas.
* Criar pedidos para o utente.

### 5.4 Arquivo de utente

Um utente pode ser arquivado se:

* Existir.
* Não estiver removido.
* Ainda não estiver arquivado.
* Não tiver pendências operacionais em aberto.

São consideradas pendências operacionais:

* Linhas de receita ativas com quantidade restante disponível.
* Medicamentos não sujeitos a receita médica com quantidade disponível.
* Vendas Suspensas em aberto.
* Regularizações em aberto.
* Itens de pedido pendentes.

Ao arquivar:

* O estado passa para `ARQUIVADO`.
* É guardada a data de arquivo.
* Pode ser guardado o motivo.
* Pode ser guardado o utilizador responsável pelo arquivo.

### 5.5 Reativação de utente

Um utente pode ser reativado se:

* Existir.
* Não estiver removido.
* Estiver arquivado.

Ao reativar:

* O estado volta para `ATIVO`.
* A data de arquivo é limpa.
* O motivo de arquivo é limpo.
* O utilizador responsável pelo arquivo é limpo.

### 5.6 Remoção de utente

A remoção é lógica, não física.

Um utente só pode ser removido se:

* Existir.
* Não estiver já removido.
* Não tiver dados associados.

Bloqueiam a remoção:

* Receitas.
* Linhas de receita.
* Medicação habitual.
* Medicamentos não sujeitos a receita médica.
* Vendas Suspensas.
* Itens de pedido.
* Regularizações.
* Eventos de regularização.
* Dispensas.

Se existirem dados associados, o utente deve ser arquivado em vez de removido.

Ao remover:

* `deletedAt` é preenchido.
* `isValid` passa para `false`.
* `invalidReason` recebe o motivo da remoção.

---

## 6. Medicação habitual

### 6.1 Objetivo

A medicação habitual representa medicamentos normalmente usados pelo utente.

O backend persiste e disponibiliza a lista de medicamentos habituais do utente. O frontend utiliza essa lista como apoio e sugestão nos formulários operacionais aplicáveis, nomeadamente na criação de receitas, medicamentos não sujeitos a receita médica e Vendas Suspensas.

Não representa stock, receita, dispensa, pedido nem regularização.

### 6.2 Criação

Para criar medicação habitual:

* O utente deve estar operacional.
* O medicamento é obrigatório.
* O nome do medicamento é limpo de espaços laterais.
* O medicamento é normalizado para comparação.
* Não pode existir medicamento duplicado para o mesmo utente.

A comparação de duplicados é feita de forma normalizada, ignorando diferenças de caixa e acentos.

### 6.3 Listagem

Ao listar medicação habitual:

* São devolvidos os medicamentos associados ao utente.
* A medicação habitual não tem quantidade.
* A medicação habitual não altera disponibilidade.

### 6.4 Remoção

É possível:

* Remover um item específico de medicação habitual.
* Remover toda a medicação habitual de um utente.

A remoção de medicação habitual não altera receitas, pedidos, Vendas Suspensas ou regularizações.

---

## 7. Medicamentos

O modelo `Medicamento` existe como referência opcional para medicamentos normalizados.

Tipos possíveis:

| Tipo          | Descrição                                 |
| ------------- | ----------------------------------------- |
| `COM_RECEITA` | Medicamento associado a receita.          |
| `SEM_RECEITA` | Medicamento não sujeito a receita médica. |

Atualmente, várias operações também aceitam o nome textual do medicamento sem exigir referência direta a `Medicamento`.

---

## 8. Receitas

### 8.1 Estrutura de uma receita

Uma receita contém:

* `numero19`: número único de 19 dígitos.
* `pinAcesso6`: PIN de acesso com 6 dígitos.
* `pinOpcao4`: PIN de opção com 4 dígitos.
* Uma ou mais linhas de receita.

### 8.2 Criação de receita

Para criar uma receita:

* O utente deve estar operacional.
* `numero19` deve ter exatamente 19 dígitos.
* `pinAcesso6` deve ter exatamente 6 dígitos.
* `pinOpcao4` deve ter exatamente 4 dígitos.
* Deve existir pelo menos uma linha.
* O `numero19` não pode já existir.
* `confirmRegularizacao` é opcional e por defeito é `false`.

### 8.3 Regras das linhas de receita

Cada linha deve ter:

* Nome do medicamento obrigatório.
* Quantidade inteira maior que 0.
* Validade válida.
* Validade igual ao dia atual ou futura.

Na mesma receita:

* Não é permitido repetir o mesmo medicamento.
* A comparação usa nome normalizado, sem acentos, em minúsculas e sem espaços laterais.

Ao criar:

* A linha fica com estado `ATIVA`.
* `quantidadeDispensada` começa em 0.

### 8.4 Validade de receita

A validade deve respeitar a regra funcional:

* Validade igual ao dia atual é válida.
* Validade futura é válida.
* Validade anterior ao dia atual é inválida para criação.
* Linhas antigas podem ser expiradas por job quando a validade já ficou para trás.

A validade deve ser interpretada por dia funcional, não por hora exata do momento de criação.

### 8.5 Quantidade restante de uma linha de receita

A quantidade restante funcional é calculada assim:

```txt
quantidadeRestante = quantidade - quantidadeDispensada - quantidadeReservadaPendente
```

Onde:

* `quantidade` é a quantidade total da linha.
* `quantidadeDispensada` é o total já dispensado ou usado em regularizações.
* `quantidadeReservadaPendente` é a quantidade em itens de pedido pendentes.

A quantidade restante nunca deve ser negativa.

### 8.6 Listagem de receitas de um utente

Ao listar receitas de um utente:

* Só são consideradas linhas `ATIVA`.
* Só são consideradas linhas com validade igual ao dia atual ou futura; linhas `ATIVA` cuja validade seja anterior ao dia atual não são apresentadas como disponíveis, mesmo que o job de expiração ainda não tenha corrido.
* Só devem ser devolvidas linhas com quantidade restante maior que 0.
* As linhas são ordenadas por medicamento, validade, data de criação e ID, favorecendo o controlo FEFO.

### 8.7 Remoção de linha de receita

Uma linha de receita só pode ser removida se:

* O utente estiver operacional.
* A linha existir.
* A linha pertencer ao utente.
* A linha não tiver quantidade dispensada.
* A linha não tiver dispensas associadas.
* A linha não estiver associada a itens de pedido.
* A linha não tiver sido usada em eventos de regularização.

Se a linha removida for a última linha da receita, a receita também é removida.

### 8.8 Receitas e regularizações pendentes

Ao criar uma receita, o sistema verifica se as novas linhas podem regularizar Vendas Suspensas pendentes.

Se existirem regularizações possíveis e o pedido não trouxer confirmação explícita:

* A criação deve ser bloqueada.
* Deve ser devolvida informação de pré-visualização.
* O frontend deve pedir confirmação ao utilizador.

Se a confirmação for enviada:

* A receita é criada.
* As linhas são criadas.
* As regularizações pendentes compatíveis são aplicadas.
* São criados eventos de regularização.
* As quantidades dispensadas das linhas usadas são incrementadas.

---

## 9. Medicamentos não sujeitos a receita médica

### 9.1 Criação

Para criar um medicamento não sujeito a receita médica:

* O utente deve estar operacional.
* O nome do medicamento é obrigatório.
* A quantidade deve ser um inteiro maior que 0.
* Quantidades decimais são convertidas para inteiro por baixo.

Se o utente já tiver um registo com o mesmo medicamento:

* A comparação é case-insensitive.
* Não é criado novo registo.
* A quantidade é incrementada no registo existente.

### 9.2 Quantidade restante

A quantidade restante é calculada assim:

```txt
quantidadeRestante = quantidade - quantidadeReservadaPendente
```

Onde `quantidadeReservadaPendente` corresponde a itens de pedido pendentes associados ao registo.

A quantidade restante nunca deve ser negativa.

### 9.3 Listagem

Ao listar medicamentos não sujeitos a receita médica de um utente:

* Só devem ser devolvidos registos com quantidade restante maior que 0.
* Os registos são ordenados por data de criação descendente.

### 9.4 Remoção

Um registo só pode ser removido se:

* O utente estiver operacional.
* O registo existir.
* O registo pertencer ao utente.
* Não estiver associado a nenhum item de pedido pendente.

Após cancelamento de pedidos pendentes associados, a remoção volta a ser possível se não restarem bloqueios.

Se existirem itens históricos não pendentes associados ao registo, esses itens são desvinculados antes da eliminação. O histórico do pedido é preservado; o item deixa de referenciar o registo de medicamento não sujeito a receita médica, mas não é eliminado.

---

## 10. Vendas Suspensas

### 10.1 Estados de Venda Suspensa

| Estado                      | Significado                                                    |
| --------------------------- | -------------------------------------------------------------- |
| `PENDENTE`                  | Venda Suspensa em aberto.                                      |
| `PARCIALMENTE_REGULARIZADO` | Parte da quantidade já foi regularizada.                       |
| `REGULARIZADO`              | Venda Suspensa concluída.                                      |

### 10.2 Criação de Venda Suspensa

Para criar uma Venda Suspensa:

* O utente deve estar operacional.
* O medicamento é obrigatório.
* A quantidade solicitada deve ser um inteiro maior que 0.
* Quantidades decimais são convertidas para inteiro por baixo.
* O medicamento é normalizado para comparação funcional.

Antes de criar, o sistema valida:

1. Se existe receita ativa com quantidade disponível para o mesmo medicamento.
2. Se já existe Venda Suspensa em aberto para o mesmo medicamento.

Se existir receita ativa disponível:

* A criação é bloqueada.
* A lógica correta é usar primeiro a receita existente.

Se já existir Venda Suspensa em aberto para o mesmo medicamento:

* A criação é bloqueada.
* A Venda Suspensa existente deve ser usada em vez de duplicar.

### 10.3 Consideração de rascunho de pedido

Ao validar se existe receita ativa disponível, o sistema pode considerar itens já em rascunho no frontend.

Objetivo:

* Evitar bloquear a criação de Venda Suspensa quando a quantidade disponível da receita já está a ser consumida no pedido em construção.

`receitaDraftItems`:

* Aceita `linhaId`.
* Aceita `id` como alias de `linhaId`.
* Ignora itens sem linha.
* Ignora quantidades inválidas.
* Junta itens duplicados.
* Converte quantidades decimais para inteiro por baixo.

### 10.4 Quantidade restante de Venda Suspensa

A quantidade restante é calculada assim:

```txt
quantidadeRestante = quantidadeSolicitada
  - quantidadeDispensada
  - quantidadeRegularizada
  - quantidadeCancelada
  - quantidadeReservadaPendente
```

Onde:

* `quantidadeSolicitada` é a quantidade em aberto.
* `quantidadeDispensada` é a quantidade incluída em itens de pedido validados.
* `quantidadeRegularizada` é a quantidade já regularizada.
* `quantidadeCancelada` é a quantidade cancelada por chegada posterior de receita ou ajuste do sistema.
* `quantidadeReservadaPendente` é a quantidade em pedidos pendentes.

A quantidade restante nunca deve ser negativa.

### 10.5 Listagem

Ao listar Vendas Suspensas de um utente:

* Só são consideradas Vendas Suspensas com estado `PENDENTE` ou `PARCIALMENTE_REGULARIZADO`.
* Só são devolvidas Vendas Suspensas com quantidade restante maior que 0.
* A ordenação é por data de criação descendente.

### 10.6 Remoção

Uma Venda Suspensa só pode ser removida se:

* O utente estiver operacional.
* A Venda Suspensa existir.
* A Venda Suspensa pertencer ao utente.
* Não estiver associada a nenhum item de pedido pendente.

Após cancelamento de pedidos pendentes associados, a remoção volta a ser possível se não restarem bloqueios.

Quando não existem pedidos pendentes, o comportamento é determinístico:

* Sem histórico (sem itens validados e sem regularizações associadas): o registo é eliminado fisicamente.
* Com histórico (itens validados ou regularizações presentes): o registo não é eliminado; a quantidade restante é acumulada em `quantidadeCancelada` e o estado interno passa para `REGULARIZADO`. O histórico é preservado. Este encerramento não representa associação efetiva a receita — é apenas o mecanismo de fecho do registo.

### 10.7 Resolução automática quando entra uma receita

Quando é criada uma nova receita, o sistema executa dois passos automáticos para medicamentos compatíveis do mesmo utente.

**Passo 1 — aplicação de regularizações pendentes (`applyPendingToLinhasTx`)**

Para cada nova linha de receita elegível, o sistema procura registos `RegularizacaoExtra` com estado `PENDENTE` ou `PARCIALMENTE_REGULARIZADO` e medicamento compatível.

Quando existe correspondência:

* incrementa `RegularizacaoExtra.quantidadeRegularizada`;
* atualiza o estado da `RegularizacaoExtra` para `PARCIALMENTE_REGULARIZADO` ou `REGULARIZADO`;
* incrementa `ReceitaLinha.quantidadeDispensada`;
* cria o respetivo `RegularizacaoEvento`.

O registo técnico `Extra` não é alterado neste passo.

**Passo 2 — resolução de Vendas Suspensas em aberto (`resolveOpenExtrasForCreatedLinhasTx`)**

Depois da aplicação das regularizações pendentes, o sistema analisa registos `Extra` em aberto com medicamento compatível:

* se não existir quantidade associada a itens de pedido, o registo `Extra` é eliminado;
* se existirem itens de pedido e também quantidade ainda não enviada em pedido, essa quantidade é acumulada em `quantidadeCancelada`;
* se existirem itens de pedido, mas não existir quantidade por cancelar, o registo permanece inalterado.

Nos dois últimos casos, este passo não altera diretamente o estado interno do `Extra`.

A eliminação ou atualização do `Extra` neste fluxo é distinta da aplicação da `RegularizacaoExtra` à receita. O fluxo automático não passa por `removeForUtente`.

---

## 11. Pedidos

### 11.1 Tipos de item de pedido

| Tipo          | Origem                                    |
| ------------- | ----------------------------------------- |
| `COM_RECEITA` | Linha de receita.                         |
| `SEM_RECEITA` | Medicamento não sujeito a receita médica. |
| `EXTRA`       | Venda Suspensa.                           |

Aliases aceites:

| Alias           | Tipo final    |
| --------------- | ------------- |
| `RECEITA`       | `COM_RECEITA` |
| `RECEITA_LINHA` | `COM_RECEITA` |
| `COM_RECEITA`   | `COM_RECEITA` |
| `SEM_RECEITA`   | `SEM_RECEITA` |
| `EXTRA`         | `EXTRA`       |

Também é aceite `kind` como alternativa técnica a `tipo`.

### 11.2 Estados de pedido

| Estado      | Significado                                                   |
| ----------- | ------------------------------------------------------------- |
| `PENDENTE`  | Pedido enviado, ainda não decidido pela Farmácia.             |
| `VALIDADO`  | Pedido aceite pela Farmácia.                                  |
| `REJEITADO` | Pedido recusado pela Farmácia.                                |
| `CANCELADO` | Pedido cancelado antes da conclusão ou por rotina automática. |

### 11.3 Estados de item de pedido

| Estado                    | Significado                                              |
| ------------------------- | -------------------------------------------------------- |
| `PENDENTE`                | Item ainda não processado.                               |
| `VALIDADO`                | Item aceite.                                             |
| `REJEITADO`               | Item recusado.                                           |
| `CANCELADO`               | Item cancelado pela Santa Casa antes da validação.       |
| `CANCELADO_POR_EXPIRACAO` | Item cancelado automaticamente por expiração de receita. |

### 11.4 Numeração de pedidos

* Cada pedido tem um número inteiro único.
* O número é gerado automaticamente por autoincremento.
* A numeração deve ser considerada sequencial e histórica.
* Não deve ser reiniciada manualmente por causa de limpezas de histórico.

### 11.5 Criação de pedido

Para criar um pedido:

* Deve existir pelo menos um item.
* Cada item deve ter `utenteId`.
* Cada item deve ter tipo válido.
* Cada item deve referenciar um ID válido.
* Cada item deve ter quantidade inteira maior que 0.
* Se a quantidade não for enviada, o padrão é 1.
* `qtd` é aceite como alias de `quantidade`.
* Quantidades decimais são convertidas para inteiro por baixo.
* O utente de cada item deve estar operacional.

Itens duplicados no mesmo pedido são agregados.

A chave funcional de agregação é:

```txt
utenteId + tipo + idReferencia
```

Itens iguais para utentes diferentes não são agregados.

### 11.6 Reserva de quantidades

Itens de pedido com estado `PENDENTE` funcionam como reserva.

Isto significa que:

* Reduzem a quantidade disponível apresentada ao utilizador.
* Impedem que outro pedido consuma a mesma quantidade.
* São considerados em validações de disponibilidade.

Enquanto o pedido não for validado, a quantidade ainda não foi definitivamente dispensada.

### 11.7 Validação de item com receita

Para adicionar item `COM_RECEITA` a um pedido:

* A linha de receita deve existir.
* A linha deve pertencer ao utente indicado.
* A linha deve estar `ATIVA`.
* A validade deve ser igual ao dia atual ou futura.
* A quantidade pedida não pode exceder a quantidade disponível.

Disponibilidade:

```txt
disponivel = quantidade - quantidadeDispensada - quantidadeReservadaPendente
```

### 11.8 Regra FEFO para receitas

O sistema aplica a regra **FEFO** — First Expired, First Out.

Para o mesmo medicamento:

* Deve ser usada primeiro a receita com validade mais próxima.
* Se existir linha ativa anterior com quantidade disponível, não é permitido usar uma linha com validade posterior.

A comparação considera:

* `medicamentoId`, quando disponível.
* Nome normalizado do medicamento, quando não existe `medicamentoId`.

A regra também considera as quantidades já incluídas no pedido em construção.

### 11.9 Validação de item de medicamento não sujeito a receita médica

Para adicionar item `SEM_RECEITA` a um pedido:

* O registo deve existir.
* O registo deve pertencer ao utente indicado.
* A quantidade pedida não pode exceder a quantidade disponível.

Disponibilidade:

```txt
disponivel = quantidade - quantidadeReservadaPendente
```

### 11.10 Validação de item de Venda Suspensa

Para adicionar item `EXTRA` a um pedido:

* A Venda Suspensa deve existir.
* A Venda Suspensa deve pertencer ao utente indicado.
* A Venda Suspensa deve estar `PENDENTE` ou `PARCIALMENTE_REGULARIZADO`.
* A quantidade pedida não pode exceder a quantidade disponível.

Disponibilidade:

```txt
disponivel = quantidadeSolicitada
  - quantidadeRegularizada
  - quantidadeCancelada
  - quantidadeReservadaPendente
```

### 11.11 Cancelamento de pedido pela Santa Casa

A Santa Casa pode cancelar um pedido se:

* O pedido existir.
* O pedido estiver `PENDENTE`.

Ao cancelar:

* O pedido passa para `CANCELADO`.
* Os itens pendentes passam para `CANCELADO`.
* O motivo de cancelamento é opcional; quando não é fornecido, o backend aplica um motivo padrão.
* É guardado um motivo em `closedReason`/`cancelReason`.
* Pode ser guardado o utilizador que cancelou.

Como os itens pendentes apenas representam reserva, o cancelamento liberta a disponibilidade.

### 11.12 Validação de pedido pela Farmácia

A Farmácia pode validar um pedido se:

* O pedido existir.
* O pedido estiver `PENDENTE`.
* Todos os itens estiverem `PENDENTE`.
* O utilizador autenticado existir.

Antes de validar, o sistema volta a verificar disponibilidade para evitar inconsistências.

### 11.13 Efeitos da validação por tipo de item

#### Item `COM_RECEITA`

Ao validar:

* É criada uma `Dispensa`.
* `quantidadeDispensada` da linha de receita é incrementada.
* O item passa para `VALIDADO`.
* É guardado `validatedAt` e `validatedById`.

#### Item `SEM_RECEITA`

Ao validar:

* A quantidade do registo é reduzida.
* O item passa para `VALIDADO`.
* É guardado `validatedAt` e `validatedById`.

#### Item `EXTRA`

Ao validar:

* O registo de Venda Suspensa associado é encerrado: o seu estado interno passa imediatamente para `REGULARIZADO`.
* É criada uma `RegularizacaoExtra` associada ao utente, Venda Suspensa e pedido.
* A `RegularizacaoExtra` fica pendente até existir uma linha de receita compatível; quando surgir, a quantidade pendente é aplicada à receita.
* O facto de a Venda Suspensa estar internamente em `REGULARIZADO` não significa que a receita já tenha sido associada — a regularização pode ainda estar pendente.
* A quantidade validada deixa de estar em aberto na Venda Suspensa.
* O item passa para `VALIDADO`.
* É guardado `validatedAt` e `validatedById`.

### 11.14 Pedidos com itens de receita expirados

Durante a tentativa de validação de um pedido pela Farmácia, o sistema verifica se as linhas de receita associadas ainda são válidas. Este controlo ocorre no momento da ação, independentemente de o job diário de expiração já ter corrido.

Se existirem itens de receita expirados:

* As linhas de receita afetadas que ainda estejam `ATIVA` são marcadas como `EXPIRADA`.
* Os itens pendentes associados passam para `CANCELADO_POR_EXPIRACAO`.
* Se o pedido ficar sem itens com estado `PENDENTE`, passa para `CANCELADO`.
* Se ainda existir pelo menos um item pendente válido, o pedido mantém-se operacional para os itens restantes.
* O motivo de fecho indica cancelamento automático por expiração da receita.

### 11.15 Fecho do pedido validado

Depois de todos os itens serem processados com sucesso:

* O pedido passa para `VALIDADO`.
* É guardado `validatedAt`.
* É guardado `validatedById`.

### 11.16 Rejeição de pedido pela Farmácia

A Farmácia pode rejeitar um pedido se:

* O pedido existir.
* O pedido estiver `PENDENTE`.
* O utilizador autenticado existir.

Ao rejeitar:

* Todos os itens pendentes passam para `REJEITADO`.
* O pedido passa para `REJEITADO`.
* É guardado `rejectedAt`.
* É guardado `rejectedById`.
* Pode ser guardado motivo em `closedReason`/`cancelReason`.

Como os itens pendentes apenas representam reserva, a rejeição liberta a disponibilidade.

---

## 12. Dispensas

Uma `Dispensa` é criada quando um item `COM_RECEITA` é validado pela Farmácia.

A dispensa regista:

* Linha de receita usada.
* Item de pedido associado.
* Quantidade dispensada.
* Data de criação.

Regras:

* Uma dispensa representa consumo definitivo da receita.
* Uma linha com dispensas associadas não pode ser removida.
* Uma dispensa contribui para bloqueios de remoção de utentes.
* Uma dispensa pode ser removida apenas por job de limpeza de histórico, respeitando as regras de manutenção.

---

## 13. Regularizações de Vendas Suspensas

### 13.1 Objetivo

Regularizações existem para ligar uma Venda Suspensa já validada pela Farmácia a uma receita criada posteriormente.

Fluxo típico:

1. A Santa Casa cria uma Venda Suspensa.
2. A Santa Casa envia um pedido com essa Venda Suspensa.
3. A Farmácia valida o pedido.
4. O sistema cria uma regularização pendente.
5. Mais tarde, a Santa Casa cria uma receita compatível.
6. O sistema aplica a receita à regularização pendente.

### 13.2 Estados de regularização

| Estado                      | Significado                           |
| --------------------------- | ------------------------------------- |
| `PENDENTE`                  | Ainda não foi regularizada.           |
| `PARCIALMENTE_REGULARIZADO` | Parte da quantidade foi regularizada. |
| `REGULARIZADO`              | Toda a quantidade foi regularizada.   |

### 13.3 Quantidade restante de regularização

```txt
quantidadeRestante = quantidadeSolicitada - quantidadeRegularizada
```

A quantidade restante nunca deve ser negativa.

### 13.4 Criação de regularização

Uma regularização é criada automaticamente quando a Farmácia valida um item de pedido do tipo `EXTRA`.

A regularização guarda:

* Utente.
* Venda Suspensa original.
* Pedido original.
* Número do pedido.
* Medicamento.
* Medicamento normalizado.
* Quantidade solicitada.
* Quantidade já regularizada.
* Estado.

### 13.5 Aplicação automática de regularizações

Quando são criadas novas linhas de receita, o sistema tenta aplicar regularizações pendentes.

A aplicação respeita:

* Mesmo utente.
* Medicamento compatível.
* Linha de receita ativa.
* Linha com validade igual ao dia atual ou futura.
* Quantidade disponível na linha.
* Regularizações pendentes mais antigas primeiro.

A ordenação funcional é:

1. Linhas de receita por validade ascendente.
2. Regularizações por data de criação ascendente.
3. Número do pedido ascendente.

### 13.6 Efeitos de uma regularização aplicada

Ao aplicar uma regularização:

* É criado um `RegularizacaoEvento`.
* `quantidadeRegularizada` da regularização é incrementada.
* O estado da regularização é atualizado.
* `quantidadeDispensada` da linha de receita é incrementada.

Se a quantidade regularizada atingir a quantidade solicitada:

* A regularização passa para `REGULARIZADO`.
* É gerado alerta operacional `REGULARIZACAO_TOTAL` para a Farmácia.

Se ainda faltar quantidade:

* A regularização passa para `PARCIALMENTE_REGULARIZADO`.
* É gerado alerta operacional `REGULARIZACAO_PARCIAL` para a Farmácia.

### 13.7 Consulta de regularizações

Regularizações podem ser consultadas em dois contextos:

* Área Santa Casa.
* Área Farmácia.

Ambas as áreas podem consultar:

* Regularizações pendentes.
* Regularizações concluídas.
* Sinal agregado de regularizações.

A separação de permissões continua a aplicar-se:

* `SANTACASA` acede apenas ao contexto Santa Casa.
* `FARMACIA` acede apenas ao contexto Farmácia.
* `ADMIN` pode aceder a ambos.

---

## 14. Alertas operacionais

### 14.1 Objetivo

Alertas operacionais notificam a Farmácia sobre eventos relevantes que exigem atenção ou atualização operacional.

Atualmente os alertas destinam-se à Farmácia.

### 14.2 Tipos de alerta

| Tipo                    | Quando é criado                                                   |
| ----------------------- | ----------------------------------------------------------------- |
| `PEDIDO_ENVIADO`        | Quando a Santa Casa cria um pedido.                               |
| `REGULARIZACAO_PARCIAL` | Quando uma receita regulariza apenas parte de uma Venda Suspensa. |
| `REGULARIZACAO_TOTAL`   | Quando uma receita regulariza totalmente uma Venda Suspensa.      |

### 14.3 Alerta de pedido enviado

Quando a Santa Casa cria um pedido:

* É criado um alerta `PEDIDO_ENVIADO`.
* O alerta aponta para o pedido.
* A Farmácia passa a ver esse alerta como ativo.

A criação é idempotente: é usada uma `idempotencyKey` com o formato `PEDIDO_ENVIADO:{pedidoId}`; tentativas repetidas não criam alertas duplicados para o mesmo pedido.

A criação do alerta ocorre como efeito secundário após a criação do pedido ser concluída. Uma falha ao criar o alerta não reverte o pedido; a falha é registada nos logs.

### 14.4 Alerta de regularização parcial

Quando uma regularização passa para `PARCIALMENTE_REGULARIZADO`:

* É criado alerta `REGULARIZACAO_PARCIAL`.
* O alerta inclui pedido, utente, medicamento e quantidades em metadata.
* O alerta indica que ainda existe quantidade por regularizar.

A criação ocorre como efeito secundário após a regularização. Uma falha ao criar o alerta não reverte a regularização; a falha é registada nos logs. O mesmo comportamento aplica-se ao alerta de regularização total (§14.5).

### 14.5 Alerta de regularização total

Quando uma regularização passa para `REGULARIZADO`:

* É criado alerta `REGULARIZACAO_TOTAL`.
* O alerta inclui pedido, utente, medicamento e quantidades em metadata.
* O alerta indica que a regularização ficou concluída.

### 14.6 Fecho de alertas

A Farmácia pode:

* Fechar um alerta individual.
* Fechar todos os alertas ativos.

Fechar um alerta:

* Não altera pedidos.
* Não altera regularizações.
* Não altera receitas.
* Apenas marca o alerta como dispensado para o utilizador atual.

O encerramento global processa até 200 alertas operacionais ativos por execução. Caso existam mais de 200 alertas ativos, pode ser necessário invocar o endpoint novamente.

---

## 15. Histórico

O sistema mantém histórico para:

* Pedidos validados.
* Pedidos rejeitados.
* Pedidos cancelados.
* Regularizações concluídas.
* Eventos de regularização.
* Auditoria de utilizadores que validaram, rejeitaram, cancelaram ou arquivaram.

Regra importante:

* Dados com valor histórico não devem ser removidos manualmente sem passar pelas regras de manutenção previstas.

---

## 16. Jobs de manutenção

### 16.1 Receita Expiry Job

Objetivo:

* Expirar linhas de receita vencidas.
* Cancelar itens pendentes afetados por essas linhas.
* Cancelar pedidos que fiquem sem itens processáveis por expiração.

Periodicidade prevista:

* Diária.

Regras:

* Linhas `ATIVA` com validade anterior ao dia atual passam para `EXPIRADA`.
* Validade igual ao dia atual não deve expirar nesse dia.
* Se uma linha expirada estiver associada a itens pendentes de pedidos pendentes, esses itens passam para `CANCELADO_POR_EXPIRACAO`.
* Um pedido afetado passa para `CANCELADO` quando deixa de ter itens com estado `PENDENTE`; se ainda restar pelo menos um item pendente válido, o pedido mantém-se operacional.
* O motivo de fecho indica cancelamento automático por expiração da receita.

Nota: o job faz manutenção periódica das linhas expiradas. A validação de pedido pela Farmácia aplica a mesma proteção operacional no momento da ação, sem depender de o job já ter corrido.

### 16.2 Higiene Job

Objetivo:

* Marcar utentes removidos antigos como tratados pela rotina de higiene.
* Opcionalmente anonimizar dados, se a configuração permitir.

Periodicidade prevista:

* Mensal.

Regras:

* Considera utentes com `deletedAt` anterior ou igual à data de corte.
* Ignora utentes já marcados com o marcador de higiene.
* Por defeito, marca o utente como inválido e atualiza o motivo.
* A rotina deve ser idempotente.
* A anonimização só é aplicada se estiver pedida e explicitamente permitida por configuração.

### 16.3 Purge History Job

Objetivo:

* Remover histórico antigo de pedidos fechados e regularizações concluídas.

Periodicidade prevista:

* Mensal.

Regras para pedidos:

* Considera pedidos com estado `VALIDADO`, `REJEITADO` ou `CANCELADO`.
* Usa datas de validação, rejeição ou atualização para determinar antiguidade.
* Remove dispensas associadas aos itens desses pedidos.
* Remove itens dos pedidos.
* Remove os pedidos.
* Antes de remover pedidos, desvincula regularizações que apontem para esses pedidos.

Regras para regularizações:

* Considera regularizações com estado `REGULARIZADO`.
* Usa `updatedAt` ou eventos associados para determinar antiguidade, conforme implementação do job.
* Remove eventos de regularização associados.
* Remove regularizações concluídas.

Regras gerais:

* Deve respeitar a data de corte.
* Não deve apagar histórico recente.
* Deve ser idempotente.
* Deve permitir `preview` antes de `run`.

---

## 17. Disponibilidade e reservas

### 17.1 Princípio geral

Qualquer item pendente em pedido representa uma reserva temporária.

Isto aplica-se a:

* Linhas de receita.
* Medicamentos não sujeitos a receita médica.
* Vendas Suspensas.

### 17.2 Motivo da reserva

A reserva evita que a mesma quantidade seja usada em dois pedidos pendentes ao mesmo tempo.

Exemplo:

* Uma linha de receita tem 10 unidades.
* Já existe pedido pendente com 4 unidades.
* A disponibilidade funcional passa a ser 6 unidades.

### 17.3 Libertação da reserva

A reserva é libertada quando o item deixa de estar pendente por:

* Validação.
* Rejeição.
* Cancelamento.
* Cancelamento automático por expiração.

Na validação, a reserva deixa de ser reserva e passa a consumo definitivo ou processo regularizado, conforme o tipo de item.

---

## 18. Normalização de medicamentos

O sistema usa normalização textual para comparar medicamentos quando não existe ID de medicamento explícito.

A normalização:

* Remove acentos.
* Converte para minúsculas.
* Remove espaços laterais.

Esta normalização é usada em regras como:

* Deteção de medicamentos repetidos numa receita.
* Deteção de medicamentos repetidos na medicação habitual.
* Deteção de receita ativa antes de criar Venda Suspensa.
* Deteção de Vendas Suspensas duplicadas.
* Associação de regularizações a novas linhas de receita.
* Regra FEFO quando não existe `medicamentoId`.

---

## 19. Auditoria

O sistema guarda informação de auditoria em operações críticas.

### 19.1 Validação

Ao validar pedidos e itens:

* É guardada a data de validação.
* É guardado o utilizador que validou.

### 19.2 Rejeição

Ao rejeitar pedidos e itens:

* É guardada a data de rejeição.
* É guardado o utilizador que rejeitou.
* Pode ser guardado motivo.

### 19.3 Cancelamento

Ao cancelar pedidos:

* É guardada a informação de fecho.
* Pode ser guardado o utilizador que cancelou.
* Pode ser guardado motivo.

### 19.4 Arquivo de utentes

Ao arquivar utentes:

* É guardada a data de arquivo.
* Pode ser guardado o motivo.
* Pode ser guardado o utilizador responsável.

### 19.5 Utilizadores com histórico

Utilizadores que aparecem em histórico de validação, rejeição, cancelamento ou arquivo não devem ser removidos.

Devem ser desativados para preservar a integridade da auditoria.

---

## 20. Dashboards e sinais operacionais

### 20.1 Santa Casa

O dashboard da Santa Casa agrega sinais funcionais sobre:

* Utentes.
* Receitas.
* Medicamentos não sujeitos a receita médica.
* Vendas Suspensas.
* Pedidos.
* Regularizações.
* Último pedido relevante.

Os sinais são informativos e não devem substituir validações funcionais nos services.

### 20.2 Farmácia

O dashboard da Farmácia agrega sinais sobre:

* Pedidos pendentes.
* Pedidos validados.
* Pedidos rejeitados.
* Pedidos cancelados.
* Regularizações pendentes.
* Regularizações concluídas.
* Eventos de regularização.
* Último pedido relevante.

Os sinais são informativos e não devem substituir validações funcionais nos services.

---

## 21. Erros funcionais esperados

### 21.1 `400 BAD_REQUEST`

Usado quando o payload ou query params são inválidos.

Exemplos:

* Número de utente sem 9 dígitos.
* Receita sem número de 19 dígitos.
* PIN inválido.
* Quantidade inválida.
* Data inválida.
* Role inválida.
* Password demasiado curta.
* Query `skip`, `take`, `page` ou `pageSize` inválida.
* Pesquisa demasiado longa.

### 21.2 `401 UNAUTHORIZED`

Usado quando:

* Falta sessão.
* Token é inválido ou expirou.
* Utilizador está inativo.
* Utilizador autenticado esperado não existe no contexto.

### 21.3 `403 FORBIDDEN`

Usado quando:

* O utilizador não tem role necessária.
* Um recurso pertence a outro contexto.
* Um recurso pertence a outro utente quando essa operação não é permitida.
* Um admin tenta alterar/remover a própria conta em operações proibidas.
* A origem do pedido é inválida em operações protegidas.

### 21.4 `404 NOT_FOUND`

Usado quando:

* Utente não existe.
* Pedido não existe.
* Linha de receita não existe.
* Venda Suspensa não existe.
* Medicamento não sujeito a receita médica não existe.
* Medicação habitual não existe.
* Utilizador não existe.
* Alerta não existe.
* Job não existe.
* Rota não existe.

### 21.5 `409 CONFLICT`

Usado quando a operação é tecnicamente válida, mas viola uma regra de negócio.

Exemplos:

* Criar utente duplicado.
* Criar utilizador com email duplicado.
* Criar receita com número já existente.
* Criar Venda Suspensa quando já existe receita ativa disponível.
* Criar Venda Suspensa duplicada.
* Criar medicação habitual duplicada.
* Pedir quantidade superior à disponível.
* Usar receita com validade posterior quando existe outra mais próxima.
* Arquivar utente com pendências.
* Remover registo com histórico associado.
* Validar pedido que já não está pendente.
* Rejeitar pedido que já não está pendente.
* Cancelar pedido que já não está pendente.
* Regularização exige confirmação.

---

## 22. Decisões funcionais importantes

### 22.1 Arquivar é preferível a remover

Sempre que um utente tem histórico ou dependências, deve ser arquivado em vez de removido.

Motivo:

* Preserva histórico.
* Evita inconsistências.
* Mantém rastreabilidade.

### 22.2 Pedidos pendentes são reservas

Pedidos pendentes não alteram definitivamente stock ou quantidades dispensadas.

Mas reduzem a disponibilidade funcional até serem resolvidos.

### 22.3 Validação revalida tudo

Mesmo que o pedido tenha sido criado com sucesso, a Farmácia revalida disponibilidade no momento da validação.

Motivo:

* Evitar inconsistências por alterações concorrentes.
* Garantir que receitas continuam ativas e válidas.
* Garantir que quantidades continuam disponíveis.

### 22.4 Receita mais antiga deve ser usada primeiro

A regra FEFO impede usar linhas com validade mais longa enquanto existir linha compatível com validade mais curta e quantidade disponível.

### 22.5 Validade de hoje é válida

Uma receita com validade igual ao dia atual deve ser considerada válida durante esse dia funcional.

### 22.6 Numeração de pedidos não deve reiniciar

A numeração de pedidos é histórica e sequencial.

Mesmo que histórico antigo seja limpo, os novos pedidos devem continuar a sequência natural da base de dados.

### 22.7 A Santa Casa cria o registo; a Farmácia valida o pedido

No contexto das Vendas Suspensas:

* A Santa Casa regista o medicamento para Venda Suspensa.
* A Santa Casa envia o pedido.
* A Farmácia valida ou rejeita.
* A regularização acontece quando surge receita compatível.

A UI deve evitar sugerir que a Santa Casa “dispensa” ou “regulariza” diretamente.

### 22.8 Alertas não alteram estado funcional

Alertas são notificações operacionais.

Fechar alertas não altera:

* Pedidos.
* Receitas.
* Vendas Suspensas.
* Regularizações.
* Utentes.

---

## 23. Checklist de consistência funcional

Antes de alterar o backend, confirmar que a alteração não quebra:

* [ ] Bloqueio de operações em utentes arquivados.
* [ ] Bloqueio de operações em utentes removidos.
* [ ] Cálculo de quantidade restante em receitas.
* [ ] Cálculo de quantidade restante em medicamentos não sujeitos a receita médica.
* [ ] Cálculo de quantidade restante em Vendas Suspensas.
* [ ] Reservas de itens pendentes.
* [ ] Regra FEFO.
* [ ] Validade de receitas no dia atual.
* [ ] Validação final pela Farmácia.
* [ ] Criação de dispensas.
* [ ] Criação de regularizações a partir de Vendas Suspensas.
* [ ] Aplicação automática de regularizações quando entra receita.
* [ ] Criação de alertas `PEDIDO_ENVIADO`.
* [ ] Criação de alertas `REGULARIZACAO_PARCIAL`.
* [ ] Criação de alertas `REGULARIZACAO_TOTAL`.
* [ ] Fecho de alertas sem alterar estado funcional.
* [ ] Bloqueios de remoção com histórico.
* [ ] Auditoria de utilizadores.
* [ ] Jobs de expiração, higiene e purge.
* [ ] Separação de permissões por role.
* [ ] Rotas equivalentes de regularizações em Santa Casa e Farmácia.
* [ ] Testes unitários, integração e E2E afetados pela alteração.

---

## 24. Fora do âmbito deste ficheiro

Este ficheiro não documenta em detalhe:

* URLs completas dos endpoints.
* Payloads exatos de cada rota.
* Exemplos de requests/responses.
* Setup local.
* Variáveis de ambiente.
* Estratégia de testes.

Esses temas devem ficar em ficheiros próprios:

* `API_ROUTES.md`
* `README.md`
* `ENVIRONMENT.md`
* `TESTING.md`
