# Testing — Farmácia Santa Casa V2

Documentação dos testes atuais do backend.

Este projeto usa scripts Node.js para testar:

- fluxo principal da API;
- job de expiração de receitas;
- job de higiene;
- job de purge de histórico.

Os testes atuais não usam Jest/Vitest. São scripts diretos que chamam a API ou o Prisma.

---

## 1. Objetivo dos testes

Os testes servem para garantir que:

- o backend arranca corretamente;
- as rotas principais respondem;
- as regras de negócio estão a funcionar;
- os jobs automáticos executam sem partir dados;
- os fluxos principais continuam válidos depois de alterações.

---

## 2. Pré-requisitos

Antes de correr testes, confirma que tens:

- PostgreSQL ativo;
- base de dados criada;
- `.env` configurado;
- migrations aplicadas;
- Prisma Client gerado;
- backend a correr na porta correta.

---

## 3. Estrutura dos testes

Os testes estão em:

```txt
backend/scripts/
```

Ficheiros principais:

```txt
backend/scripts/test-current-api.js
backend/scripts/test-receita-expiry-job.js
backend/scripts/test-higiene-job.js
backend/scripts/test-purge-history-job.js
```

---

## 4. Scripts disponíveis

No ficheiro:

```txt
backend/package.json
```

Existem estes scripts:

```json
{
  "test:api": "node scripts/test-current-api.js",
  "test:receita-expiry": "node scripts/test-receita-expiry-job.js",
  "test:higiene": "node scripts/test-higiene-job.js",
  "test:purge-history": "node scripts/test-purge-history-job.js"
}
```

---

## 5. Antes de testar

### 5.1 Instalar dependências

Na raiz do projeto:

```bash
npm --prefix backend install
```

---

### 5.2 Gerar Prisma Client

```bash
npm --prefix backend run prisma:generate
```

---

### 5.3 Aplicar migrations

```bash
npm --prefix backend run prisma:migrate
```

---

### 5.4 Iniciar backend

```bash
npm --prefix backend run dev
```

O terminal deve mostrar algo semelhante a:

```txt
[server] listening on http://localhost:3001 (development)
[jobs] receitaExpiry agendado: 0 3 * * * Europe/Lisbon
[jobs] higiene agendado: 0 3 1 * * Europe/Lisbon
[jobs] purgeHistory agendado: 0 3 1 * * Europe/Lisbon
```

---

## 6. Health checks manuais

Antes dos testes automáticos, podes confirmar no browser ou terminal.

### API geral

```bash
curl "http://localhost:3001/api/health"
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "farmacia-santacasa-api",
  "timestamp": "2026-05-12T00:00:00.000Z"
}
```

---

### Santa Casa

```bash
curl "http://localhost:3001/api/santacasa/health"
```

Resposta esperada:

```json
{
  "status": "ok",
  "context": "santacasa"
}
```

---

### Farmácia

```bash
curl "http://localhost:3001/api/farmacia/health"
```

Resposta esperada:

```json
{
  "status": "ok",
  "context": "farmacia"
}
```

---

### Raiz `/`

A rota raiz não existe.

```bash
curl "http://localhost:3001/"
```

Resposta esperada:

```json
{
  "error": "ROUTE_NOT_FOUND",
  "message": "Rota não encontrada.",
  "path": "/"
}
```

Isto é normal. A API começa em:

```txt
/api
```

---

## 7. Teste principal da API

### Comando

```bash
npm --prefix backend run test:api
```

---

### Ficheiro executado

```txt
backend/scripts/test-current-api.js
```

---

### O que este teste cobre

Este teste valida o fluxo principal completo da aplicação.

Fluxo testado:

1. Health checks.
2. Criar utente.
3. Criar medicamento sem receita.
4. Criar receita com linhas.
5. Criar Extra.
6. Criar pedido com:
   - item com receita;
   - item sem receita;
   - item Extra.
7. Listar pedidos pendentes na Farmácia.
8. Validar pedido.
9. Confirmar regularização criada pelo Extra.
10. Criar nova receita compatível.
11. Confirmar auto-regularização.
12. Confirmar histórico de regularizações.
13. Confirmar sinal de regularizações.
14. Confirmar efeitos na receita.
15. Confirmar efeitos em sem receita.
16. Confirmar efeitos em Extra.
17. Bloquear remoções inválidas.
18. Criar pedido para rejeição.
19. Rejeitar pedido.
20. Confirmar histórico de pedidos.
21. Confirmar dashboard.

---

### Resultado esperado

No fim deve aparecer:

```txt
✅ TODOS OS TESTES PASSARAM
```

---

### Se falhar

O terminal mostra:

```txt
❌ mensagem do erro
```

E normalmente mostra o objeto recebido.

Exemplo:

```txt
❌ Linha de receita validada devia continuar na listagem
```

Neste caso, deves verificar:

- se o teste está a usar a linha correta da receita;
- se a receita usada tinha saldo suficiente;
- se a linha não desapareceu por `quantidadeRestante = 0`.

---

## 8. Teste do job `receitaExpiry`

### Comando

```bash
npm --prefix backend run test:receita-expiry
```

---

### Ficheiro executado

```txt
backend/scripts/test-receita-expiry-job.js
```

---

### O que este teste cobre

Este teste cria um cenário artificial com:

- utente de teste;
- receita antiga;
- linha de receita expirada;
- pedido pendente ligado a essa linha.

Depois executa o job diretamente.

---

### Regras testadas

O job deve:

- encontrar linha de receita expirada;
- mudar a linha para `EXPIRADA`;
- mudar item pendente para `CANCELADO_POR_EXPIRACAO`;
- cancelar pedido se todos os itens foram cancelados por expiração.

---

### Resultado esperado

```txt
✅ TESTE receitaExpiry PASSOU
```

---

### Exemplo de resumo esperado

```txt
Resumo:
{
  utenteId: "...",
  receitaId: "...",
  linhaId: "...",
  pedidoId: "...",
  pedidoItemId: "...",
  result: {
    expiredLines: 1,
    canceledPedidoItems: 1,
    canceledPedidos: 1
  }
}
```

---

## 9. Teste do job `higiene`

### Comando

```bash
npm --prefix backend run test:higiene
```

---

### Ficheiro executado

```txt
backend/scripts/test-higiene-job.js
```

---

### O que este teste cobre

Este teste cria um utente:

- removido logicamente;
- com `deletedAt` antigo;
- ainda sem marcador de higiene.

Depois executa o job de higiene.

---

### Regras testadas

O job deve:

- encontrar utentes removidos antigos;
- marcar `invalidReason` com `[HIGIENE]`;
- manter `isValid: false`;
- manter `deletedAt`;
- ser idempotente.

---

### Resultado esperado

```txt
✅ TESTE higiene PASSOU
```

---

### O que significa idempotência

Idempotência significa que correr o mesmo job mais do que uma vez não deve estragar o estado.

Exemplo:

```txt
1ª execução: marca utente com [HIGIENE]
2ª execução: não duplica marcações nem quebra dados
```

---

## 10. Teste do job `purgeHistory`

### Comando

```bash
npm --prefix backend run test:purge-history
```

---

### Ficheiro executado

```txt
backend/scripts/test-purge-history-job.js
```

---

### O que este teste cobre

Este teste cria dois cenários antigos:

1. Pedido validado antigo.
2. Regularização concluída antiga.

Depois executa o purge.

---

### Regras testadas

O job deve apagar:

- pedido fechado antigo;
- itens desse pedido;
- dispensas associadas;
- regularização concluída antiga;
- eventos dessa regularização.

---

### O que não deve apagar

O job não deve mexer em:

- pedidos pendentes;
- regularizações pendentes;
- dados ativos;
- utentes ativos;
- receitas operacionais.

---

### Resultado esperado

```txt
✅ TESTE purgeHistory PASSOU
```

---

## 11. Executar todos os testes

Com o backend a correr:

```bash
npm --prefix backend run test:api
npm --prefix backend run test:receita-expiry
npm --prefix backend run test:higiene
npm --prefix backend run test:purge-history
```

---

## 12. Ordem recomendada dos testes

A ordem mais segura é:

```bash
npm --prefix backend run test:api
npm --prefix backend run test:receita-expiry
npm --prefix backend run test:higiene
npm --prefix backend run test:purge-history
```

Motivo:

- `test:api` valida o fluxo principal;
- jobs validam cenários específicos;
- purge apaga dados de teste antigos, por isso deve ficar no fim.

---

## 13. Testes manuais com curl

Além dos scripts, podes testar rotas manualmente.

---

### 13.1 Criar utente

```bash
curl -X POST "http://localhost:3001/api/santacasa/utentes" \
  -H "Content-Type: application/json" \
  -d "{\"numero9\":\"111111111\",\"nome\":\"João Miguel Costa\"}"
```

---

### 13.2 Listar utentes

```bash
curl "http://localhost:3001/api/santacasa/utentes"
```

---

### 13.3 Criar sem receita

```bash
curl -X POST "http://localhost:3001/api/santacasa/utentes/UTENTE_ID/sem-receita" \
  -H "Content-Type: application/json" \
  -d "{\"medicamento\":\"Ben-u-ron\",\"quantidade\":2}"
```

---

### 13.4 Criar receita

```bash
curl -X POST "http://localhost:3001/api/santacasa/utentes/UTENTE_ID/receitas" \
  -H "Content-Type: application/json" \
  -d "{\"numero19\":\"1234567890123456789\",\"pinAcesso6\":\"123456\",\"pinOpcao4\":\"1234\",\"linhas\":[{\"medicamento\":\"Paracetamol 1000mg\",\"quantidade\":2,\"validade\":\"2027-12-31\"}]}"
```

---

### 13.5 Criar Extra

```bash
curl -X POST "http://localhost:3001/api/santacasa/utentes/UTENTE_ID/extras" \
  -H "Content-Type: application/json" \
  -d "{\"medicamento\":\"Medicamento Extra Teste\",\"quantidadeSolicitada\":3}"
```

---

### 13.6 Criar pedido

```bash
curl -X POST "http://localhost:3001/api/santacasa/pedidos" \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"utenteId\":\"UTENTE_ID\",\"tipo\":\"COM_RECEITA\",\"id\":\"LINHA_RECEITA_ID\",\"quantidade\":1}]}"
```

---

### 13.7 Listar pedidos da Farmácia

```bash
curl "http://localhost:3001/api/farmacia/pedidos"
```

---

### 13.8 Validar pedido

```bash
curl -X POST "http://localhost:3001/api/farmacia/pedidos/PEDIDO_ID/validar"
```

---

### 13.9 Rejeitar pedido

```bash
curl -X POST "http://localhost:3001/api/farmacia/pedidos/PEDIDO_ID/rejeitar" \
  -H "Content-Type: application/json" \
  -d "{\"motivo\":\"Teste manual de rejeição\"}"
```

---

## 14. Testes de manutenção

As rotas de manutenção exigem header:

```txt
x-maintenance-key: dev-maintenance-key
```

---

### 14.1 Sem chave deve falhar

```bash
curl -i "http://localhost:3001/api/farmacia/manutencao/jobs"
```

Resultado esperado:

```txt
HTTP/1.1 401 Unauthorized
```

---

### 14.2 Com chave deve funcionar

```bash
curl "http://localhost:3001/api/farmacia/manutencao/jobs" \
  -H "x-maintenance-key: dev-maintenance-key"
```

Resultado esperado:

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

### 14.3 Preview receita expiry

```bash
curl "http://localhost:3001/api/farmacia/manutencao/jobs/receita-expiry/preview" \
  -H "x-maintenance-key: dev-maintenance-key"
```

---

### 14.4 Run receita expiry

```bash
curl -X POST "http://localhost:3001/api/farmacia/manutencao/jobs/receita-expiry/run" \
  -H "x-maintenance-key: dev-maintenance-key"
```

---

### 14.5 Preview higiene

```bash
curl "http://localhost:3001/api/farmacia/manutencao/jobs/higiene/preview?offsetMonths=12" \
  -H "x-maintenance-key: dev-maintenance-key"
```

---

### 14.6 Run higiene

```bash
curl -X POST "http://localhost:3001/api/farmacia/manutencao/jobs/higiene/run" \
  -H "Content-Type: application/json" \
  -H "x-maintenance-key: dev-maintenance-key" \
  -d "{\"offsetMonths\":12,\"anonymize\":false}"
```

---

### 14.7 Preview purge history

```bash
curl "http://localhost:3001/api/farmacia/manutencao/jobs/purge-history/preview?offsetMonths=6" \
  -H "x-maintenance-key: dev-maintenance-key"
```

---

### 14.8 Run purge history

```bash
curl -X POST "http://localhost:3001/api/farmacia/manutencao/jobs/purge-history/run" \
  -H "Content-Type: application/json" \
  -H "x-maintenance-key: dev-maintenance-key" \
  -d "{\"offsetMonths\":6}"
```

---

## 15. Como interpretar falhas

### 15.1 Erro `ECONNREFUSED`

Exemplo:

```txt
ECONNREFUSED 127.0.0.1:3001
```

Causa provável:

- backend não está a correr;
- porta errada;
- `PORT` diferente no `.env`.

Solução:

```bash
npm --prefix backend run dev
```

---

### 15.2 Erro `ROUTE_NOT_FOUND`

Exemplo:

```json
{
  "error": "ROUTE_NOT_FOUND",
  "message": "Rota não encontrada.",
  "path": "/"
}
```

Causa provável:

- estás a chamar uma rota que não existe;
- esqueceste `/api`;
- usaste path errado.

Correto:

```txt
http://localhost:3001/api/health
```

Errado:

```txt
http://localhost:3001/health
```

---

### 15.3 Erro `UNAUTHORIZED`

Exemplo:

```json
{
  "error": "UNAUTHORIZED",
  "message": "Chave de manutenção inválida."
}
```

Causa provável:

- falta header `x-maintenance-key`;
- chave errada;
- `MAINTENANCE_API_KEY` diferente no `.env`.

Solução:

```bash
curl "http://localhost:3001/api/farmacia/manutencao/jobs" \
  -H "x-maintenance-key: dev-maintenance-key"
```

---

### 15.4 Erro `CONFLICT`

Exemplo:

```json
{
  "error": "CONFLICT",
  "message": "Já existe um utente ativo com esse número."
}
```

Causa provável:

- estás a repetir dados que têm de ser únicos;
- estás a tentar apagar algo já usado;
- estás a pedir quantidade superior ao disponível;
- estás a validar pedido já validado.

Solução:

- usa dados novos;
- confirma saldos;
- verifica estado do recurso;
- cria novo cenário de teste.

---

### 15.5 Erro no Prisma

Exemplo:

```txt
PrismaClientKnownRequestError
```

Causa provável:

- schema mudou e migration não correu;
- Prisma Client desatualizado;
- constraint da base de dados;
- relação obrigatória violada.

Soluções:

```bash
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate
```

---

## 16. Regras para criar novos testes

Quando criares novos testes, segue esta ordem:

1. Criar dados necessários.
2. Guardar IDs gerados.
3. Executar a ação principal.
4. Validar resposta HTTP.
5. Validar efeitos na base de dados ou noutras rotas.
6. Testar casos de erro.
7. Confirmar que o teste é repetível.

---

## 17. Boas práticas nos testes atuais

### 17.1 Usar dados únicos

Usar `Date.now()` ou número aleatório evita conflitos.

Exemplo:

```js
const timestamp = Date.now();
const nome = `Teste Automatizado ${timestamp}`;
```

---

### 17.2 Não depender da ordem das listas

Má prática:

```js
linhaReceitaId = createdReceita.data.linhas[0].linhaId;
```

Melhor prática:

```js
const linhaParacetamol = createdReceita.data.linhas.find(
  (linha) => linha.medicamento === "Paracetamol 1000mg"
);

linhaReceitaId = linhaParacetamol.linhaId;
```

Motivo:

- a API pode ordenar por validade;
- a primeira linha nem sempre é a esperada;
- isto já causou erro real no teste.

---

### 17.3 Validar efeitos reais

Não basta validar `200`.

Também é preciso confirmar:

- status mudou;
- quantidade foi debitada;
- histórico foi criado;
- regularização foi criada;
- remoção foi bloqueada quando devia.

---

### 17.4 Testar bloqueios

Exemplos importantes:

- apagar linha usada deve devolver `409`;
- apagar Extra usado deve devolver `409`;
- apagar sem receita usado deve devolver `409`;
- remover utente com pendências deve devolver `409`;
- validar pedido já validado deve devolver `409`.

---

## 18. Limitações dos testes atuais

Os testes atuais são úteis, mas ainda são simples.

Limitações:

- não usam Jest/Vitest;
- não têm base de dados isolada por teste;
- não limpam todos os dados criados;
- dependem de backend em execução para `test:api`;
- os jobs usam Prisma diretamente;
- não há cobertura percentual;
- não há mocks;
- não há CI/CD configurado.

---

## 19. Melhorias futuras recomendadas

### Curto prazo

- Criar script `test:all`.
- Criar script para seed de desenvolvimento.
- Criar script para reset de base de dados local.
- Separar testes por módulo.

---

### Médio prazo

Adicionar framework de testes:

```txt
Vitest
```

ou:

```txt
Jest
```

Recomendação para este projeto:

```txt
Vitest
```

Motivo:

- moderno;
- rápido;
- simples;
- boa integração com projetos JS atuais.

---

### Longo prazo

- Base de dados de teste separada.
- Testes de integração reais.
- Testes unitários nos services.
- Testes de repositories.
- Testes de segurança.
- Pipeline GitHub Actions.
- Relatório de coverage.

---

## 20. Script recomendado para o futuro

Adicionar ao `backend/package.json`:

```json
{
  "test:all": "npm run test:api && npm run test:receita-expiry && npm run test:higiene && npm run test:purge-history"
}
```

Depois correr:

```bash
npm --prefix backend run test:all
```

---

## 21. Checklist antes de commit

Antes de fazer commit depois de mexer no backend:

```bash
npm --prefix backend run test:api
npm --prefix backend run test:receita-expiry
npm --prefix backend run test:higiene
npm --prefix backend run test:purge-history
```

Depois:

```bash
git status
```

Confirmar que não aparece:

```txt
backend/.env
```

Se estiver tudo correto:

```bash
git add -A
git commit -m "mensagem do commit"
```

---

## 22. Checklist antes de push

Antes de `git push`:

```bash
git status
```

Esperado:

```txt
working tree clean
```

Depois:

```bash
git push
```

Se for o primeiro push:

```bash
git push -u origin master
```

---

## 23. Comando completo recomendado

Quando quiseres validar tudo antes de avançar:

```bash
npm --prefix backend run test:api
npm --prefix backend run test:receita-expiry
npm --prefix backend run test:higiene
npm --prefix backend run test:purge-history
git status
```

Se tudo passar e o `.env` não aparecer, podes fazer commit/push.

---

## 24. Resultado esperado do backend neste momento

Se todos os testes passarem, o backend garante:

- criação de utentes;
- criação de receitas;
- criação de sem receita;
- criação de Extras;
- criação de pedidos;
- validação pela Farmácia;
- rejeição pela Farmácia;
- regularização automática;
- histórico;
- dashboard;
- jobs automáticos;
- endpoints de manutenção protegidos;
- bloqueios de operações perigosas.

---

## 25. Regra geral

Qualquer alteração futura no backend deve responder a três perguntas:

1. O teste principal da API continua a passar?
2. Os jobs continuam a passar?
3. As regras de negócio continuam documentadas?

Se a resposta a qualquer uma for “não”, a alteração ainda não está pronta.