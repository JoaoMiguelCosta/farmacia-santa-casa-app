# API_CONTRACT.md

Contrato de integração entre o frontend **Farmácia Santa Casa** e o backend da aplicação.

Este documento descreve como o frontend comunica com a API, quais são os endpoints usados, como são tratados erros, autenticação, paginação, permissões e regras de integração.

> Estado atual: projeto em desenvolvimento.
> O contrato reflete o frontend e backend existentes nesta fase, mas pode evoluir conforme novas funcionalidades forem adicionadas.

---

## 1. Objetivo

Este documento serve para manter claro:

* que endpoints o frontend usa;
* como o frontend envia pedidos HTTP;
* como a autenticação funciona;
* como erros são tratados;
* como paginação e filtros são enviados;
* que áreas dependem de cada role;
* que regras devem ser respeitadas ao alterar frontend ou backend.

Sempre que o backend mudar um endpoint, payload ou resposta, este ficheiro deve ser atualizado.

---

## 2. Base URL da API

O frontend usa a variável:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

Se a variável não existir, o frontend usa fallback local:

```txt
http://localhost:3001/api
```

Local do ficheiro:

```txt
src/shared/api/httpClient.js
```

---

## 3. Variáveis de ambiente

Ficheiro local:

```txt
frontend/.env
```

Ficheiro versionado de exemplo:

```txt
frontend/.env.example
```

Conteúdo esperado:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

Regras:

* variáveis frontend devem começar por `VITE_`;
* nunca colocar segredos no frontend;
* o frontend corre no browser, logo variáveis `VITE_*` podem ser vistas pelo utilizador final.

---

## 4. HTTP client

Todas as chamadas à API devem passar por:

```txt
src/shared/api/httpClient.js
```

Não usar `fetch` diretamente em páginas ou componentes.

### Responsabilidades do `httpClient`

* construir URLs;
* aplicar `VITE_API_BASE_URL`;
* anexar query params;
* enviar cookies;
* serializar body JSON;
* interpretar resposta JSON/text;
* lançar erros normalizados;
* identificar erros de autenticação/autorização.

### Cookies

Todas as requests usam:

```js
credentials: "include"
```

Isto é obrigatório porque o backend usa sessão baseada em cookie HTTP-only.

---

## 5. Endpoints centralizados

Todos os endpoints usados pelo frontend ficam em:

```txt
src/shared/api/endpoints.js
```

Áreas principais:

```txt
auth
admin
santacasa
farmacia
manutencao
```

Regra:

* não escrever URLs diretamente nos componentes;
* adicionar ou alterar endpoints apenas em `endpoints.js`;
* manter os nomes alinhados com o backend.

---

## 6. Formato geral das respostas

O backend pode devolver:

### Resposta simples

```json
{
  "id": "string",
  "nome": "string"
}
```

### Resposta com `data`

```json
{
  "data": []
}
```

### Resposta paginada

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "skip": 0,
    "take": 50
  },
  "params": {}
}
```

O frontend deve tratar respostas de forma defensiva:

* se `data` não for array, usar `[]`;
* se `meta.total` não for número, usar `0`;
* se `skip`/`take` vierem inválidos, aplicar fallback;
* não assumir que relações opcionais existem.

---

## 7. Erros HTTP

O `httpClient` transforma respostas inválidas em `Error`.

Formato interno esperado no frontend:

```js
{
  message: string,
  status: number,
  payload: unknown,
  code: string | null,
  isUnauthorized: boolean,
  isForbidden: boolean,
  isAuthError: boolean
}
```

### Estados tratados

| Status | Significado                  | Tratamento frontend           |
| -----: | ---------------------------- | ----------------------------- |
|  `400` | Pedido inválido              | Mostrar erro ao utilizador    |
|  `401` | Sem sessão                   | Redirecionar para login       |
|  `403` | Sem permissão                | Tratar como erro de auth/role |
|  `404` | Recurso inexistente          | Mostrar erro contextual       |
|  `409` | Conflito de regra de negócio | Mostrar erro funcional        |
|  `500` | Erro interno                 | Mostrar erro genérico         |

---

## 8. Autenticação

Endpoints:

```txt
POST /auth/login
POST /auth/logout
GET  /auth/me
```

### Login

O frontend envia:

```json
{
  "email": "admin@sistema.local",
  "password": "password"
}
```

Resposta esperada:

```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "ADMIN",
    "isActive": true
  }
}
```

O backend também define o cookie HTTP-only.

### Sessão atual

```txt
GET /auth/me
```

Usado para verificar se existe sessão ativa.

### Logout

```txt
POST /auth/logout
```

Termina sessão e remove cookie no backend.

---

## 9. Roles

Roles reconhecidas:

```txt
ADMIN
SANTACASA
FARMACIA
```

Regras:

| Role        | Acesso frontend                      |
| ----------- | ------------------------------------ |
| `ADMIN`     | Sistema/Admin, Santa Casa e Farmácia |
| `SANTACASA` | Santa Casa                           |
| `FARMACIA`  | Farmácia                             |

O frontend bloqueia navegação indevida, mas a segurança real pertence ao backend.

---

## 10. Auth guards

O frontend usa:

```txt
RequireAuth
RequireRole
AuthHomeRedirect
```

### `RequireAuth`

Bloqueia acesso sem sessão.

### `RequireRole`

Bloqueia acesso com role errada.

### `AuthHomeRedirect`

Redireciona o utilizador autenticado para a área correta.

---

## 11. Health

Endpoints:

```txt
GET /health
GET /santacasa/health
GET /farmacia/health
```

Usados pela área Sistema/Admin para verificar comunicação com o backend.

---

## 12. Santa Casa — Dashboard

Endpoint:

```txt
GET /santacasa/dashboard/sinais
```

Usado para obter sinais operacionais da Santa Casa.

Resposta esperada: objeto com contadores/resumos usados no dashboard.

---

## 13. Santa Casa — Utentes

Endpoints:

```txt
GET    /santacasa/utentes
POST   /santacasa/utentes
GET    /santacasa/utentes/:utenteId
DELETE /santacasa/utentes/:utenteId
PATCH  /santacasa/utentes/:utenteId/archive
PATCH  /santacasa/utentes/:utenteId/reactivate
```

### Query de listagem

```json
{
  "status": "ATIVO",
  "search": "",
  "skip": 0,
  "take": 50
}
```

### Criar utente

Payload:

```json
{
  "numero9": "123456789",
  "nome": "Nome do Utente"
}
```

### Arquivar utente

Payload:

```json
{
  "archivedReason": "Arquivado pela Santa Casa."
}
```

### Reativar utente

Sem payload obrigatório.

### Remover utente

Remove logicamente ou remove conforme regra do backend.

---

## 14. Santa Casa — Receitas

Endpoints:

```txt
GET    /santacasa/utentes/:utenteId/receitas
POST   /santacasa/utentes/:utenteId/receitas
DELETE /santacasa/utentes/:utenteId/receitas/linhas/:linhaId
```

### Criar receita

Payload:

```json
{
  "numero19": "1234567890123456789",
  "pinAcesso6": "123456",
  "pinOpcao4": "1234",
  "linhas": [
    {
      "medicamento": "Paracetamol 1000mg",
      "quantidade": 2,
      "validade": "2030-01-01"
    }
  ]
}
```

### Regras frontend

* `numero19` deve ter 19 dígitos;
* `pinAcesso6` deve ter 6 dígitos;
* `pinOpcao4` deve ter 4 dígitos;
* validade não deve ser anterior ao dia atual;
* quantidade deve ser número inteiro maior que 0.

O backend continua a validar tudo novamente.

---

## 15. Santa Casa — Medicamentos não sujeitos a receita médica

Endpoints:

```txt
GET    /santacasa/utentes/:utenteId/sem-receita
POST   /santacasa/utentes/:utenteId/sem-receita
DELETE /santacasa/utentes/:utenteId/sem-receita/:semReceitaId
```

### Criar medicamento não sujeito a receita médica

Payload:

```json
{
  "medicamento": "Ben-u-ron",
  "quantidade": 2
}
```

### Regras frontend

* medicamento obrigatório;
* quantidade inteira maior que 0.

---

## 16. Santa Casa — Vendas Suspensas

Endpoints:

```txt
GET    /santacasa/utentes/:utenteId/extras
POST   /santacasa/utentes/:utenteId/extras
DELETE /santacasa/utentes/:utenteId/extras/:extraId
```

### Criar Venda Suspensa

Payload esperado:

```json
{
  "medicamentoId": "string opcional",
  "nome": "string",
  "quantidadeSolicitada": 1,
  "cartLinhas": []
}
```

A estrutura exata pode variar conforme o fluxo operacional.

### Terminologia

Na UI deve aparecer:

```txt
Venda Suspensa
Vendas Suspensas
```

Não usar “Extra” como texto visível ao utilizador.

---

## 17. Santa Casa — Pedidos

Endpoints:

```txt
GET    /santacasa/pedidos
POST   /santacasa/pedidos
GET    /santacasa/pedidos/:pedidoId
GET    /santacasa/pedidos/pendentes
GET    /santacasa/pedidos/historico
POST   /santacasa/pedidos/:pedidoId/cancelar
```

### Criar pedido

Payload:

```json
{
  "items": [
    {
      "utenteId": "string",
      "tipo": "COM_RECEITA",
      "id": "string",
      "quantidade": 1
    }
  ]
}
```

### Tipos de item

```txt
COM_RECEITA
SEM_RECEITA
EXTRA
```

### Cancelar pedido

Payload:

```json
{
  "reason": "Pedido criado por engano pela Santa Casa."
}
```

---

## 18. Santa Casa — Regularizações

Endpoints:

```txt
GET /santacasa/regularizacoes/pendentes
GET /santacasa/regularizacoes/historico
GET /santacasa/regularizacoes/sinal
```

### Query

```json
{
  "search": "",
  "medicamento": "",
  "utenteId": "",
  "from": "",
  "to": "",
  "skip": 0,
  "take": 50
}
```

### Estados esperados

```txt
PENDENTE
PARCIALMENTE_REGULARIZADO
REGULARIZADO
```

---

## 19. Farmácia — Dashboard

Endpoint:

```txt
GET /farmacia/dashboard/sinais
```

Usado para obter sinais operacionais da Farmácia.

---

## 20. Farmácia — Pedidos

Endpoints:

```txt
GET  /farmacia/pedidos
POST /farmacia/pedidos/:pedidoId/validar
POST /farmacia/pedidos/:pedidoId/rejeitar
```

### Query de listagem

```json
{
  "status": "",
  "search": "",
  "skip": 0,
  "take": 50
}
```

### Validar pedido

Sem payload obrigatório no frontend atual.

### Rejeitar pedido

Payload possível:

```json
{
  "reason": "string"
}
```

### Estados esperados

```txt
PENDENTE
VALIDADO
REJEITADO
CANCELADO
```

---

## 21. Farmácia — Regularizações

Endpoints:

```txt
GET /farmacia/regularizacoes/pendentes
GET /farmacia/regularizacoes/historico
GET /farmacia/regularizacoes/sinal
```

### Query

```json
{
  "search": "",
  "medicamento": "",
  "utenteId": "",
  "from": "",
  "to": "",
  "skip": 0,
  "take": 50
}
```

---

## 22. Admin — Utilizadores

Endpoints:

```txt
GET    /admin/users
POST   /admin/users
PATCH  /admin/users/:userId
PATCH  /admin/users/:userId/password
PATCH  /admin/users/:userId/status
DELETE /admin/users/:userId
```

### Query de listagem

```json
{
  "search": "",
  "role": "",
  "isActive": "",
  "skip": 0,
  "take": 50
}
```

### Criar utilizador

Payload:

```json
{
  "name": "Nome",
  "email": "email@sistema.local",
  "password": "password",
  "role": "SANTACASA"
}
```

### Atualizar utilizador

Payload:

```json
{
  "name": "Nome",
  "email": "email@sistema.local",
  "role": "FARMACIA"
}
```

### Alterar password

Payload:

```json
{
  "password": "nova-password"
}
```

### Alterar estado

Payload:

```json
{
  "isActive": true
}
```

### Regras frontend

* não permitir desativar a própria conta;
* não permitir remover a própria conta;
* só permitir remover utilizadores inativos;
* validar email básico;
* validar password com mínimo de 8 caracteres.

O backend continua a ser a fonte final de validação.

---

## 23. Manutenção

Endpoints:

```txt
GET  /manutencao/jobs
GET  /manutencao/jobs/receita-expiry/preview
POST /manutencao/jobs/receita-expiry/run
GET  /manutencao/jobs/higiene/preview
POST /manutencao/jobs/higiene/run
GET  /manutencao/jobs/purge-history/preview
POST /manutencao/jobs/purge-history/run
```

Apenas `ADMIN` deve aceder a esta área.

---

## 24. Manutenção — Receita Expiry

### Preview

```txt
GET /manutencao/jobs/receita-expiry/preview
```

### Run

```txt
POST /manutencao/jobs/receita-expiry/run
```

Payload:

```json
{}
```

Este job pode:

* expirar linhas de receita;
* cancelar itens pendentes;
* cancelar pedidos afetados.

---

## 25. Manutenção — Higiene

### Preview

```txt
GET /manutencao/jobs/higiene/preview
```

Query:

```json
{
  "offsetMonths": 12,
  "anonymize": false
}
```

### Run

```txt
POST /manutencao/jobs/higiene/run
```

Payload:

```json
{
  "offsetMonths": 12,
  "anonymize": false
}
```

Este job pode alterar dados de utentes removidos antigos.

---

## 26. Manutenção — Purge History

### Preview

```txt
GET /manutencao/jobs/purge-history/preview
```

Query:

```json
{
  "offsetMonths": 6
}
```

### Run

```txt
POST /manutencao/jobs/purge-history/run
```

Payload:

```json
{
  "offsetMonths": 6
}
```

Este job é destrutivo e pode apagar histórico antigo.

O frontend deve obrigar a preview antes de permitir execução.

---

## 27. Paginação

Padrão usado:

```json
{
  "skip": 0,
  "take": 50
}
```

Resposta esperada:

```json
{
  "data": [],
  "meta": {
    "total": 100,
    "skip": 0,
    "take": 50
  }
}
```

### Regras frontend

* `skip` não deve ser negativo;
* `take` deve ter limite razoável;
* página atual é calculada com `skip` e `take`;
* botão “Anterior” depende de `skip > 0`;
* botão “Seguinte” depende de `skip + take < total`.

---

## 28. Filtros

Filtros comuns:

```json
{
  "search": "",
  "from": "",
  "to": "",
  "status": "",
  "role": "",
  "isActive": ""
}
```

Regras:

* não enviar strings vazias quando não necessário;
* normalizar espaços;
* resetar `skip` para `0` quando filtros mudam;
* manter filtros controlados por estado.

---

## 29. Datas

O frontend recebe datas em formato serializado pelo backend.

Formatação visual centralizada em:

```txt
src/shared/utils/formatDate.js
```

Formato visual atual:

```txt
pt-PT
dateStyle: short
timeStyle: short
```

Se a data for inválida ou ausente, mostrar:

```txt
—
```

---

## 30. Terminologia funcional

Usar linguagem visível correta:

| Técnico/interno      | UI                                         |
| -------------------- | ------------------------------------------ |
| `EXTRA`              | Venda Suspensa                             |
| `EXTRAS`             | Vendas Suspensas                           |
| `SEM_RECEITA`        | Medicamento não sujeito a receita médica   |
| `SEM_RECEITA` plural | Medicamentos não sujeitos a receita médica |

Evitar mostrar ao utilizador:

```txt
Extra
Sem Receita
```

Exceto em nomes técnicos, código, enums ou endpoints.

---

## 31. Validação frontend vs backend

O frontend pode validar para melhorar UX.

Exemplos:

* campos obrigatórios;
* formato de número;
* quantidade positiva;
* datas inválidas;
* password curta;
* email básico.

Mas o backend é sempre a autoridade final.

Regra:

```txt
Frontend valida para UX.
Backend valida para segurança e integridade.
```

---

## 32. Contrato para erros de autenticação

O frontend espera que erros `401` e `403` sejam tratados como erros de auth.

Fluxo esperado:

```txt
request -> erro 401/403 -> handleAuthError -> logout/redirect/feedback
```

Não tratar manualmente `401`/`403` em cada componente, exceto se houver motivo específico.

---

## 33. Contrato para jobs perigosos

Jobs de manutenção devem seguir a regra:

```txt
preview antes de run
```

O frontend deve bloquear execução se o último resultado não for uma preview do mesmo job.

Aplica-se especialmente a:

```txt
purge-history
higiene
```

---

## 34. Regras ao alterar endpoints

Sempre que um endpoint mudar:

1. atualizar backend;
2. atualizar `src/shared/api/endpoints.js`;
3. atualizar ficheiro `api/` da feature;
4. atualizar hooks afetados;
5. atualizar configs se houver texto novo;
6. testar fluxo manualmente;
7. correr `npm run lint`;
8. correr `npm run build`;
9. atualizar este documento.

---

## 35. Regras ao alterar payloads

Sempre que um payload mudar:

1. atualizar normalização no frontend;
2. atualizar validação do formulário;
3. atualizar API da feature;
4. atualizar backend validators;
5. atualizar docs;
6. testar casos felizes;
7. testar erros esperados.

---

## 36. Regras ao alterar responses

Sempre que uma resposta mudar:

1. atualizar mappers/backend, se aplicável;
2. atualizar normalização frontend;
3. atualizar componentes que leem a resposta;
4. manter fallback defensivo;
5. atualizar documentação;
6. testar loading/error/empty/success.

---

## 37. Anti-padrões a evitar

Evitar:

* URLs hardcoded em componentes;
* `fetch` direto fora do `httpClient`;
* depender de estrutura não documentada da resposta;
* assumir que arrays vêm sempre definidos;
* assumir que relações existem;
* mostrar nomes técnicos ao utilizador;
* ignorar `401`/`403`;
* executar jobs destrutivos sem preview;
* duplicar lógica de paginação em excesso;
* colocar segredos em `.env` do frontend.

---

## 38. Checklist de integração

Antes de considerar uma integração pronta:

* [ ] endpoint existe no backend;
* [ ] endpoint está em `endpoints.js`;
* [ ] feature tem ficheiro `api`;
* [ ] hook consome a API;
* [ ] loading está tratado;
* [ ] error está tratado;
* [ ] empty state está tratado;
* [ ] permissões estão corretas;
* [ ] payload foi validado;
* [ ] resposta foi normalizada;
* [ ] texto visível está correto;
* [ ] lint passa;
* [ ] build passa.

---

## 39. Estado atual do contrato

O contrato atual cobre:

* auth;
* health;
* Santa Casa;
* Farmácia;
* Admin users;
* manutenção;
* pedidos;
* regularizações;
* jobs;
* paginação;
* erros;
* roles.

Ainda pode ser aprofundado futuramente com:

* exemplos reais de responses;
* tabela completa de payloads;
* documentação de erros por endpoint;
* testes frontend de contrato;
* mocks para desenvolvimento offline.

---

## 40. Resumo

A camada de integração frontend/backend está bem centralizada.

Pontos fortes:

* `httpClient` único;
* endpoints centralizados;
* cookies enviados corretamente;
* erros `401`/`403` identificados;
* features com ficheiros `api` próprios;
* UI alinhada com roles;
* manutenção com preview antes de execução.

Pontos a melhorar futuramente:

* adicionar testes de contrato;
* criar mocks;
* centralizar normalização paginada;
* documentar responses reais por endpoint;
* reduzir duplicação entre APIs de regularizações/histórico.
