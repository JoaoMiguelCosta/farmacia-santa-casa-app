# TESTING.md

Documentação da estratégia de testes do frontend **Farmácia Santa Casa**.

Este documento descreve o estado atual dos testes frontend, a estratégia recomendada, a ordem de implementação e as regras a seguir quando forem adicionados testes automatizados.

> Estado atual: ainda não existem testes automatizados no frontend.
> O frontend já tem `lint` e `build` validados, mas falta criar a estrutura de testes.

---

## 1. Estado atual

Nesta fase, o frontend tem validação por:

```bash
npm run lint
npm run build
npm audit
```

Estado atual:

```txt
npm run lint   ✅ passa
npm run build  ✅ passa
npm audit      a validar conforme ambiente
```

Ainda não existem:

```txt
tests/
*.test.js
*.spec.js
React Testing Library
Playwright
```

Isto é uma limitação conhecida e deve ser tratado numa fase seguinte.

---

## 2. Objetivo dos testes frontend

Os testes frontend devem garantir que:

* componentes renderizam corretamente;
* hooks tratam estado, loading e erros;
* utils devolvem resultados previsíveis;
* guards de autenticação funcionam;
* roles são respeitadas na navegação;
* formulários validam corretamente;
* chamadas à API são consumidas de forma esperada;
* fluxos principais não partem com alterações futuras.

---

## 3. Ferramentas recomendadas

### Unit/integration frontend

Recomendado:

```txt
Vitest
React Testing Library
@testing-library/user-event
jsdom
```

Uso:

* utils;
* hooks simples;
* componentes;
* guards;
* formulários.

### E2E browser

Recomendado mais tarde:

```txt
Playwright
```

Uso:

* login real;
* navegação por role;
* fluxos Santa Casa;
* fluxos Farmácia;
* área Admin;
* integração real frontend/backend.

---

## 4. Instalação futura recomendada

Quando chegar a fase de testes frontend:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Para E2E real no browser, mais tarde:

```bash
npm install -D @playwright/test
npx playwright install
```

---

## 5. Scripts recomendados

Adicionar ao `package.json` quando os testes forem criados:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:unit": "vitest tests/unit",
    "test:components": "vitest tests/components",
    "test:e2e": "playwright test",
    "test:coverage": "vitest --coverage"
  }
}
```

No início, pode ser suficiente:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch"
  }
}
```

---

## 6. Estrutura futura recomendada

Estrutura sugerida:

```txt
frontend/
└── tests/
    ├── unit/
    │   ├── utils/
    │   └── api/
    ├── components/
    │   ├── shared/
    │   ├── auth/
    │   ├── santacasa/
    │   ├── farmacia/
    │   └── system/
    ├── hooks/
    ├── fixtures/
    ├── mocks/
    └── e2e/
```

Alternativa aceitável:

```txt
src/
└── **/*.test.js
```

Recomendação para este projeto:

```txt
tests/
```

Motivo:

* separa código de produção de testes;
* mantém o `src/` mais limpo;
* facilita organização por tipo de teste.

---

## 7. Ordem recomendada de implementação

Não começar pelos testes mais difíceis.

Ordem certa:

```txt
1. Utils puras
2. httpClient e normalização de erros
3. Estado do pedido draft
4. Guards de autenticação/roles
5. Componentes shared simples
6. Formulários críticos
7. Hooks de features
8. Fluxos E2E browser
```

---

## 8. Prioridade 1 — Utils

Começar por funções puras.

Exemplos:

```txt
src/shared/utils/formatDate.js
src/shared/utils/classNames.js
src/features/santacasa/pedidos/utils/pedidoItems.js
src/features/santacasa/pedidos/utils/santaCasaPedidos.utils.js
src/features/system/users/utils/systemUsers.utils.js
src/features/system/manutencao/utils/systemManutencao.utils.js
```

### Exemplos de casos úteis

* `formatDateTime(null)` devolve `"—"`;
* `formatDateTime(data inválida)` devolve `"—"`;
* `classNames("a", false, "b")` devolve `"a b"`;
* `clampQuantity()` respeita mínimo e máximo;
* normalização de medicamento remove acentos e espaços duplicados;
* query builders não enviam strings vazias;
* paginação calcula corretamente `skip` e `take`.

---

## 9. Prioridade 2 — HTTP client

Testar:

```txt
src/shared/api/httpClient.js
```

Casos úteis:

* constrói URL com `VITE_API_BASE_URL`;
* adiciona query params;
* ignora query params vazios;
* envia `credentials: "include"`;
* envia JSON quando existe body;
* interpreta resposta JSON;
* interpreta resposta vazia;
* lança erro em status não OK;
* marca `401` como `isUnauthorized`;
* marca `403` como `isForbidden`;
* marca `401`/`403` como `isAuthError`.

---

## 10. Prioridade 3 — Pedido draft

Testar:

```txt
src/features/santacasa/pedidos/state/pedidoDraft.storage.js
src/features/santacasa/pedidos/state/PedidoDraftProvider.jsx
```

Casos úteis:

* lê array válido do `localStorage`;
* ignora JSON inválido;
* ignora itens inválidos;
* limita quantidade à quantidade restante;
* remove dados inválidos;
* escreve no `localStorage`;
* limpa o draft;
* adiciona item;
* remove item;
* altera quantidade;
* impede quantidade superior ao disponível.

---

## 11. Prioridade 4 — Auth guards

Testar:

```txt
src/features/auth/components/RequireAuth.jsx
src/features/auth/components/RequireRole.jsx
src/features/auth/components/AuthHomeRedirect.jsx
```

Casos úteis:

* utilizador sem sessão é enviado para `/login`;
* utilizador com sessão entra na rota protegida;
* role errada é redirecionada;
* `ADMIN` consegue aceder a áreas administrativas;
* `SANTACASA` não acede à Farmácia;
* `FARMACIA` não acede à Santa Casa;
* utilizador autenticado em `/login` é redirecionado para a sua home.

---

## 12. Prioridade 5 — Shared UI

Testar componentes críticos:

```txt
src/shared/ui/Button/
src/shared/ui/ConfirmDialog/
src/shared/ui/DataState/
src/shared/ui/FeedbackDialog/
src/shared/ui/FormField/
src/shared/ui/PageHeader/
src/shared/ui/SurfaceCard/
```

Casos úteis:

* `Button` renderiza label;
* `Button` respeita `disabled`;
* `ConfirmDialog` chama ação de confirmar;
* `ConfirmDialog` chama ação de cancelar;
* `DataState` mostra loading/error/empty;
* `FeedbackDialog` mostra mensagem correta;
* `FormField` mostra label, hint e erro;
* `PageHeader` mostra título e descrição.

---

## 13. Prioridade 6 — Formulários críticos

Formulários importantes:

```txt
UtenteCreateForm
ReceitaCreateForm
SemReceitaCreateForm
ExtraCreateForm
SystemUserForm
```

Casos úteis:

* campo obrigatório mostra erro;
* quantidade inválida mostra erro;
* número de utente exige 9 dígitos;
* número da receita exige 19 dígitos;
* PIN de acesso exige 6 dígitos;
* PIN de opção exige 4 dígitos;
* validade anterior ao dia atual é bloqueada;
* password curta é bloqueada;
* submit chama `onCreate` com payload normalizado.

---

## 14. Prioridade 7 — Hooks de features

Hooks importantes:

```txt
useSantaCasaUtentes
useSantaCasaOperacao
useSantaCasaPedidosActions
useFarmaciaPedidos
useSystemUsers
useSystemManutencao
```

Estes testes são mais caros porque envolvem:

* mocks de API;
* estado assíncrono;
* autenticação;
* feedback;
* loading;
* erros.

Não começar por aqui.

Criar testes apenas quando a feature estiver mais estável ou quando surgir bug/regressão.

---

## 15. Prioridade 8 — E2E browser

Mais tarde, com Playwright, testar fluxos reais:

### Auth

* login como `ADMIN`;
* login como `SANTACASA`;
* login como `FARMACIA`;
* logout;
* bloqueio de acesso por role.

### Santa Casa

* criar utente;
* criar receita;
* criar medicamento não sujeito a receita médica;
* criar Venda Suspensa;
* adicionar itens ao pedido geral;
* enviar pedido;
* consultar pedidos pendentes;
* consultar regularizações.

### Farmácia

* consultar pedidos;
* validar pedido;
* rejeitar pedido;
* consultar regularizações;
* consultar histórico.

### Sistema/Admin

* consultar health;
* gerir utilizadores;
* pré-visualizar jobs;
* bloquear execução sem preview.

---

## 16. Mocks

Quando forem criados testes, deve existir uma estratégia de mocks.

Recomendado:

```txt
tests/mocks/
├── server.js
├── handlers/
│   ├── auth.handlers.js
│   ├── santacasa.handlers.js
│   ├── farmacia.handlers.js
│   └── system.handlers.js
└── data/
```

Opções:

* mocks manuais com `vi.fn()`;
* mocks de `fetch`;
* MSW, se o projeto crescer.

Para início, mocks manuais são suficientes.

---

## 17. Fixtures

Criar fixtures para dados comuns:

```txt
tests/fixtures/
├── users.fixture.js
├── utentes.fixture.js
├── receitas.fixture.js
├── pedidos.fixture.js
└── regularizacoes.fixture.js
```

Exemplo:

```js
export const TEST_USERS = {
  admin: {
    role: "ADMIN",
    email: "admin@sistema.local",
  },
  santacasa: {
    role: "SANTACASA",
    email: "santacasa@sistema.local",
  },
  farmacia: {
    role: "FARMACIA",
    email: "farmacia@sistema.local",
  },
};
```

---

## 18. O que não testar demasiado cedo

Evitar gastar tempo agora em:

* snapshots grandes;
* estilos CSS Modules;
* testes frágeis de layout visual;
* detalhes internos de componentes;
* hooks ainda instáveis;
* fluxos E2E antes da UI estabilizar.

Snapshots grandes são má prática neste projeto. Dão falsa segurança e quebram facilmente.

---

## 19. O que deve ser testado primeiro

Começar por baixo custo e alto valor:

```txt
formatDate
classNames
query builders
normalização de pedido draft
normalização de regularizações
normalização de utilizadores
systemManutencao.utils
systemUsers.utils
```

Isto dá confiança sem exigir setup complexo.

---

## 20. Critério mínimo antes de adicionar testes complexos

Antes de testar hooks grandes:

* feature está estável;
* API já não muda diariamente;
* payloads estão definidos;
* UI principal já está aprovada;
* bugs recorrentes justificam proteção;
* existe documentação do contrato.

---

## 21. Lint e build continuam obrigatórios

Mesmo antes de existirem testes, manter sempre:

```bash
npm run lint
npm run build
npm audit
```

Antes de commits relevantes.

---

## 22. Coverage futuro

Quando houver testes suficientes, adicionar coverage:

```bash
npm install -D @vitest/coverage-v8
```

Adicionar script:

```json
{
  "scripts": {
    "test:coverage": "vitest --coverage"
  }
}
```

Correr:

```bash
npm run test:coverage
```

Atenção: coverage alto não significa qualidade alta.

Objetivo:

```txt
cobrir regras críticas, não atingir 100% artificial
```

---

## 23. Regras para escrever bons testes

Bons testes devem:

* ter nome claro;
* testar comportamento, não implementação interna;
* preparar dados mínimos;
* ser repetíveis;
* evitar dependência de ordem;
* limpar mocks entre testes;
* não depender de estilos visuais;
* testar casos felizes e erros esperados;
* evitar excesso de snapshots;
* falhar quando uma regra importante partir.

---

## 24. Anti-padrões a evitar

Evitar:

* testar só snapshots;
* testar classes CSS como comportamento principal;
* mockar tudo de forma irrealista;
* duplicar lógica do componente dentro do teste;
* testar detalhes internos em vez de resultado visível;
* criar testes enormes com vários fluxos;
* depender de tempo real sem controlo;
* depender de dados do backend local em unit tests;
* colocar credenciais reais em fixtures;
* ignorar warnings.

---

## 25. Testes por tipo de ficheiro

### `utils/`

Testar diretamente funções exportadas.

### `api/`

Mockar `httpClient` ou `fetch`.

### `hooks/`

Usar React Testing Library ou wrappers de teste.

### `components/`

Renderizar componente e validar texto/interação.

### `pages/`

Testar apenas quando a página tiver lógica relevante. Caso contrário, confiar em testes de componentes/hooks.

### `router`

Testar guards e redirects principais.

---

## 26. Checklist antes de criar um teste

Antes de criar um teste:

* [ ] sei que comportamento quero proteger;
* [ ] o teste não depende de produção;
* [ ] consigo criar dados mínimos;
* [ ] sei qual é o resultado esperado;
* [ ] sei como simular erro;
* [ ] sei se é unit, component ou E2E;
* [ ] não estou a testar CSS irrelevante;
* [ ] não estou a duplicar lógica no teste.

---

## 27. Checklist antes de commit

Enquanto não existem testes frontend:

```bash
npm run lint
npm run build
npm audit
```

Depois de adicionar testes:

```bash
npm run lint
npm run build
npm test -- --run
npm audit
```

Se houver Playwright:

```bash
npm run test:e2e
```

---

## 28. Estratégia recomendada para a próxima fase

Não instalar tudo já se não vais escrever testes de imediato.

Ordem prática:

```txt
1. Fechar documentação frontend
2. Validar integração frontend/backend
3. Estabilizar UI principal
4. Instalar Vitest + Testing Library
5. Criar testes de utils
6. Criar testes de auth guards
7. Criar testes de pedido draft
8. Só depois avançar para hooks grandes e E2E
```

---

## 29. Estado final pretendido

Objetivo futuro:

```txt
frontend/
├── tests/
│   ├── unit/
│   ├── components/
│   ├── hooks/
│   ├── fixtures/
│   ├── mocks/
│   └── e2e/
├── src/
└── docs/
```

Comandos desejados:

```bash
npm run lint
npm run build
npm test -- --run
npm audit
```

E, mais tarde:

```bash
npm run test:e2e
npm run test:coverage
```

---

## 30. Resumo

O frontend ainda não tem testes automatizados.

Isto não bloqueia a fase atual, porque:

* o projeto ainda está em desenvolvimento;
* `lint` passa;
* `build` passa;
* a arquitetura já está documentada;
* a prioridade imediata é fechar documentação e validar integração.

A próxima fase de testes deve começar por funções puras e regras de baixo custo, não por E2E complexos.
