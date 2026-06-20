# ARCHITECTURE.md

Documentação da arquitetura do frontend **Farmácia Santa Casa**.

Este documento descreve a estrutura atual do frontend, a separação de responsabilidades, o fluxo de dados, a organização por features e as regras recomendadas para manter o projeto escalável.

> Estado atual: projeto fechado — funcionalidades principais implementadas e validadas.

---

## 1. Objetivo da arquitetura

A arquitetura do frontend foi pensada para separar claramente:

* áreas funcionais;
* lógica de domínio;
* componentes visuais;
* chamadas à API;
* estado global;
* componentes reutilizáveis;
* páginas finais.

O objetivo é evitar um frontend baseado apenas em pastas genéricas como `components/`, `hooks/` e `utils/`, que tende a ficar confuso quando o projeto cresce.

A estrutura atual segue uma abordagem **feature-based**.

---

## 2. Visão geral da estrutura

Estrutura principal:

```txt
src/
├── app/
├── assets/
├── features/
├── pages/
├── shared/
└── main.jsx
```

Responsabilidade de cada pasta:

| Pasta       | Responsabilidade                                |
| ----------- | ----------------------------------------------- |
| `app/`      | configuração global da aplicação                |
| `assets/`   | imagens e assets estáticos usados pelo frontend |
| `features/` | lógica organizada por domínio funcional         |
| `pages/`    | páginas finais ligadas ao router                |
| `shared/`   | código reutilizável entre várias features       |
| `main.jsx`  | entrada da aplicação React                      |

---

## 3. Pasta `app/`

```txt
src/app/
├── router/
│   ├── routes/
│   │   ├── farmacia.routes.jsx
│   │   ├── santaCasa.routes.jsx
│   │   └── system.routes.jsx
│   ├── router.jsx
│   └── router.utils.jsx
├── styles/
│   ├── global.css
│   └── tokens.css
└── App.jsx
```

### `App.jsx`

Responsável por montar os providers principais e o router.

Atualmente envolve a aplicação com:

* `AuthProvider`;
* `PedidoDraftProvider`;
* `RouterProvider`.

Isto faz sentido porque autenticação e pedido em preparação são estados transversais da aplicação.

### `router/`

Responsável por declarar as rotas principais da aplicação.

Inclui:

* rotas públicas;
* rotas protegidas por auth e role;
* redirects;
* rotas da Santa Casa, Farmácia e Sistema/Admin divididas em ficheiros próprios;
* página 404.

### `styles/`

Contém estilos globais:

```txt
global.css
tokens.css
```

Regra:

* `tokens.css` deve guardar variáveis globais do design system;
* `global.css` deve conter resets, base visual e regras globais controladas;
* estilos específicos devem continuar em CSS Modules.

---

## 4. Pasta `features/`

A pasta `features/` contém as áreas funcionais da aplicação.

```txt
src/features/
├── auth/
├── farmacia/
├── santacasa/
└── system/
```

Cada feature pode conter:

```txt
api/
components/
config/
hooks/
state/
utils/
```

Nem todas as features precisam de todas as pastas.

---

## 5. Padrão interno de uma feature

Padrão recomendado:

```txt
feature-name/
├── api/
├── components/
├── config/
├── hooks/
├── state/
└── utils/
```

Responsabilidades:

| Pasta         | Responsabilidade                          |
| ------------- | ----------------------------------------- |
| `api/`        | chamadas HTTP ao backend                  |
| `components/` | componentes específicos da feature        |
| `config/`     | textos, labels, mensagens e opções        |
| `hooks/`      | lógica de estado e ações da feature       |
| `state/`      | contexto, providers ou persistência local |
| `utils/`      | funções puras e helpers                   |

---

## 6. Pasta `pages/`

```txt
src/pages/
├── auth/
├── farmacia/
├── santacasa/
├── system/
├── HomePage.jsx
└── NotFoundPage.jsx
```

As páginas devem funcionar como **camada de composição**.

Uma página pode:

* importar hooks da feature;
* importar componentes da feature;
* importar componentes partilhados;
* montar layout;
* ligar feedbacks, diálogos, listas e formulários.

Uma página não deve:

* conter regras de negócio complexas;
* chamar `fetch` diretamente;
* duplicar lógica de API;
* ter textos longos hardcoded quando já existe config;
* misturar demasiadas responsabilidades.

Regra prática:

```txt
pages = composição
features = domínio
shared = reutilização global
```

---

## 7. Pasta `shared/`

```txt
src/shared/
├── api/
├── hooks/
├── layouts/
├── ui/
└── utils/
```

A pasta `shared/` deve conter apenas código reutilizável por várias áreas.

### `shared/api/`

```txt
endpoints.js
httpClient.js
```

Responsável por:

* centralizar endpoints;
* construir requests;
* enviar cookies;
* tratar erros HTTP;
* normalizar erros de autenticação/autorização.

### `shared/ui/`

Componentes de UI genéricos:

```txt
BarcodeValue/
BrandMark/
Button/
ConfirmDialog/
DashboardMetricCard/
DashboardMetricGroup/
DashboardPriorityCard/
DataState/
FeedbackDialog/
FormField/
HomeActionCard/
OperationalDetailState/
PageHeader/
SurfaceCard/
```

Estes componentes não devem depender de uma feature específica.

### `shared/layouts/`

Layouts reutilizáveis:

```txt
AppShell/
AreaLanding/
```

### `shared/hooks/`

Hooks genéricos reutilizáveis entre features.

Exemplo atual:

```txt
useEscapeKey.js
```

### `shared/utils/`

Helpers globais.

Exemplos atuais:

```txt
aria.js
classNames.js
formatDate.js
normalizeText.js
regularizacoesAccessors.utils.js
```

### `shared/api/`

Camada de comunicação HTTP centralizada.

```txt
endpoints.js
httpClient.js
httpClient.config.js
httpClient.utils.js
```

---

## 8. Fluxo de dados recomendado

Fluxo principal:

```txt
Page
  ↓
Feature Hook
  ↓
Feature API
  ↓
shared/httpClient
  ↓
Backend API
```

Exemplo:

```txt
SantaCasaUtentesPage
  ↓
useSantaCasaUtentes
  ↓
utentesApi
  ↓
httpClient
  ↓
/api/santacasa/utentes
```

Este padrão mantém as responsabilidades separadas.

---

## 9. Camada de API

A camada de API está dividida por domínio.

Exemplos:

```txt
features/santacasa/utentes/api/utentesApi.js
features/santacasa/receitas/api/receitasApi.js
features/santacasa/pedidos/api/pedidosApi.js
features/farmacia/pedidos/api/farmaciaPedidosApi.js
features/system/users/api/systemUsersApi.js
```

Os ficheiros de API devem:

* chamar `httpClient`;
* usar `API_ENDPOINTS`;
* preparar query params;
* normalizar respostas simples quando necessário.

Não devem:

* conter JSX;
* gerir estado React;
* abrir diálogos;
* formatar visualmente mensagens;
* conter regras visuais.

---

## 10. `httpClient`

Local:

```txt
src/shared/api/httpClient.js
```

Responsável por:

* usar `VITE_API_BASE_URL`;
* aplicar fallback local;
* construir query strings;
* enviar `credentials: "include"`;
* serializar body JSON;
* interpretar JSON/text;
* lançar erros normalizados;
* marcar erros `401` e `403`.

A sessão depende de cookies HTTP-only enviados pelo backend, por isso esta opção é essencial:

```js
credentials: "include"
```

---

## 11. `endpoints.js`

Local:

```txt
src/shared/api/endpoints.js
```

Responsável por centralizar endpoints da API.

Áreas principais:

```txt
auth
admin
santacasa
farmacia
manutencao
```

Regra:

* não escrever URLs soltas dentro de componentes;
* adicionar novos endpoints neste ficheiro;
* manter nomes coerentes com o backend.

---

## 12. Autenticação

A autenticação está em:

```txt
src/features/auth/
```

Estrutura principal:

```txt
api/
components/
config/
context/
hooks/
state/
```

Peças principais:

```txt
AuthProvider
AuthContext
useAuth
RequireAuth
RequireRole
AuthHomeRedirect
useIdleLogout
```

### Responsabilidades

| Peça               | Responsabilidade                               |
| ------------------ | ---------------------------------------------- |
| `AuthProvider`     | gerir sessão, login, logout e utilizador atual |
| `useAuth`          | expor contexto de autenticação                 |
| `RequireAuth`      | bloquear utilizador sem sessão                 |
| `RequireRole`      | bloquear utilizador sem permissão              |
| `AuthHomeRedirect` | redirecionar utilizador conforme role          |
| `useIdleLogout`    | gerir logout por inatividade                   |

---

## 13. Autorização por role

Roles principais:

```txt
ADMIN
SANTACASA
FARMACIA
```

Regras gerais:

| Role        | Acesso                               |
| ----------- | ------------------------------------ |
| `ADMIN`     | Sistema/Admin, Santa Casa e Farmácia |
| `SANTACASA` | Santa Casa                           |
| `FARMACIA`  | Farmácia                             |

O frontend protege rotas para melhorar a experiência do utilizador.

A segurança real deve continuar sempre no backend.

Regra importante:

```txt
Frontend controla navegação.
Backend controla segurança.
```

---

## 14. Estado global

Atualmente existem dois estados globais relevantes.

---

## 14.1 Estado de autenticação

Local:

```txt
src/features/auth/context/AuthProvider.jsx
```

Responsável por:

* guardar utilizador atual;
* verificar sessão;
* executar login;
* executar logout;
* tratar sessão expirada;
* tratar erros de autenticação;
* expor helpers para as features.

---

## 14.2 Estado do pedido em preparação

Local:

```txt
src/features/santacasa/pedidos/state/
```

Ficheiros principais:

```txt
PedidoDraftContext.js
PedidoDraftProvider.jsx
usePedidoDraft.js
pedidoDraft.storage.js
```

Responsável por:

* adicionar itens ao pedido geral;
* remover itens;
* alterar quantidades;
* persistir no `localStorage`;
* limpar pedido;
* proteger contra dados inválidos guardados no browser.

Chave de storage:

```txt
farmacia-santa-casa:pedido-draft
```

Este estado é global porque o pedido pode ser preparado a partir de várias zonas da área Santa Casa.

---

## 15. Área Santa Casa

Local:

```txt
src/features/santacasa/
```

Subáreas:

```txt
dashboard
extras
historico
home
medicacaoHabitual
operacao
pedidos
receitas
regularizacoes
semReceita
shared
utentes
```

### Responsabilidades principais

| Subárea             | Responsabilidade                                 |
| ------------------- | ------------------------------------------------ |
| `home`              | página de entrada da área Santa Casa             |
| `dashboard`         | sinais gerais da Santa Casa                      |
| `utentes`           | criação, listagem, arquivo, reativação e remoção |
| `operacao`          | agregação operacional por utente                 |
| `receitas`          | criação/listagem de receitas                     |
| `medicacaoHabitual` | medicação habitual e sugestões operacionais do utente |
| `semReceita`        | medicamentos não sujeitos a receita médica       |
| `extras`            | Vendas Suspensas                                 |
| `pedidos`           | pedido geral e pedidos pendentes                 |
| `regularizacoes`    | regularizações pendentes e histórico             |
| `historico`         | histórico de pedidos da Santa Casa               |

---

## 16. Área Farmácia

Local:

```txt
src/features/farmacia/
```

Subáreas:

```txt
alertas
dashboard
historico
home
pedidos
regularizacoes
shared
```

### Responsabilidades principais

| Subárea          | Responsabilidade                          |
| ---------------- | ----------------------------------------- |
| `home`           | página de entrada da área Farmácia        |
| `dashboard`      | sinais operacionais da Farmácia           |
| `alertas`        | consulta e fecho de alertas operacionais  |
| `pedidos`        | listagem, validação e rejeição de pedidos |
| `regularizacoes` | regularizações pendentes e histórico      |
| `historico`      | histórico de pedidos                      |
| `shared/pedidos` | componentes reutilizáveis de pedidos      |

---

## 17. Área Sistema/Admin

Local:

```txt
src/features/system/
```

Subáreas:

```txt
health
home
manutencao
users
```

### Responsabilidades principais

| Subárea      | Responsabilidade                        |
| ------------ | --------------------------------------- |
| `home`       | página de entrada da área Sistema/Admin |
| `health`     | estado dos serviços/backend             |
| `manutencao` | preview/run de jobs de manutenção       |
| `users`      | gestão de utilizadores do sistema       |

A área de manutenção deve ser tratada como sensível porque permite executar jobs que podem alterar ou apagar dados.

---

## 18. Configs de UI

As features usam ficheiros `*.config.js`.

Exemplos:

```txt
receitasPage.config.js
pedidosPage.config.js
utentesPage.config.js
systemUsersPage.config.js
systemManutencaoPage.config.js
```

Estes ficheiros devem conter:

* títulos;
* descrições;
* labels;
* mensagens;
* estados vazios;
* textos de diálogos;
* opções de filtros;
* labels de status.

Objetivo:

* evitar texto hardcoded no JSX;
* facilitar manutenção;
* manter consistência de linguagem;
* permitir ajustes de copy sem mexer na lógica.

---

## 19. Componentes

### Componentes de feature

Devem ficar dentro de:

```txt
features/<feature>/components/
```

São componentes específicos de um domínio.

Exemplo:

```txt
features/santacasa/receitas/components/ReceitaCreateForm/
```

### Componentes partilhados

Devem ficar dentro de:

```txt
shared/ui/
shared/layouts/
```

Só devem ir para `shared/` quando forem realmente reutilizáveis entre áreas.

---

## 20. Hooks

Hooks são usados para separar lógica dos componentes.

Exemplos:

```txt
useSantaCasaUtentes
useSantaCasaPedidosActions
useFarmaciaPedidos
useSystemUsers
useSystemManutencao
```

Um hook pode gerir:

* estado local;
* loading;
* errors;
* feedback;
* paginação;
* filtros;
* chamadas à API;
* ações da feature.

### Regra importante

Evitar hooks com responsabilidades demais.

Quando um hook começa a misturar vários fluxos independentes, deve ser dividido.

Exemplo de divisão futura possível:

```txt
useReceitaActions
useSemReceitaActions
useExtraActions
usePedidoDraftActions
useRegularizacaoConfirmation
```

---

## 21. Utils

Utils devem conter funções puras.

Exemplos:

```txt
sortUtentes.js
sortReceitas.js
santaCasaPedidos.utils.js
systemUsers.utils.js
```

Boas práticas:

* não usar estado React;
* não chamar API;
* não manipular DOM;
* não depender de componentes;
* receber dados por argumento;
* devolver resultado previsível.

---

## 22. CSS Modules

O projeto usa CSS Modules.

Padrão:

```txt
Component.jsx
Component.module.css
```

Vantagens:

* escopo local;
* menos colisões de classes;
* componentes mais isolados;
* manutenção visual mais segura.

Regras:

* evitar estilos inline;
* usar tokens globais sempre que fizer sentido;
* não criar CSS global sem necessidade;
* manter nomes de classes claros;
* não depender de estrutura interna frágil de outros componentes.

---

## 23. Design system

O frontend segue uma direção visual de clínica premium:

* profissional;
* claro;
* calmo;
* confiável;
* institucional;
* moderno;
* com superfícies elegantes;
* contraste controlado;
* espaçamento confortável.

Tokens globais devem ficar em:

```txt
src/app/styles/tokens.css
```

Componentes reutilizáveis devem respeitar estes tokens.

---

## 24. Build

Comando:

```bash
npm run build
```

Estado atual:

```txt
Passa sem erros.
```

Aviso atual:

```txt
Some chunks are larger than 500 kB after minification.
```

Isto indica que o bundle principal está grande.

Não bloqueia a fase atual, mas deve ser otimizado futuramente com:

* `React.lazy`;
* `Suspense`;
* code splitting por páginas;
* imports dinâmicos;
* análise de bundle.

---

## 25. Lint

Comando:

```bash
npm run lint
```

Estado atual:

```txt
Passa sem erros.
```

O lint deve ser corrido antes de commits relevantes.

---

## 26. Testes frontend

Ainda não existem testes frontend automatizados.

Isto é uma limitação conhecida da fase atual.

Testes recomendados futuramente:

```txt
Vitest
React Testing Library
Playwright
```

Ordem recomendada:

```txt
1. utils
2. httpClient
3. hooks simples
4. guards de autenticação
5. componentes partilhados críticos
6. fluxos E2E reais no browser
```

---

## 27. Limitações atuais

### 27.1 Falta de testes frontend

Ainda não há testes automatizados.

Mitigação futura:

* começar por utils;
* depois guards de auth;
* depois componentes shared;
* só depois E2E browser.

---

### 27.2 Bundle grande

O bundle JS principal ultrapassa o limite recomendado pelo Vite (500 kB após minificação).

Mitigação futura:

* code splitting por área com `React.lazy`;
* lazy loading por página;
* análise de dependências.

---

### 27.3 Falta de Error Boundary

Ainda não existe uma camada dedicada para erros inesperados de render.

Mitigação futura:

* criar `RootErrorBoundary`;
* ligar ao router quando fizer sentido.

---

## 28. Regras para criar uma nova feature

Ao criar uma nova feature, seguir esta estrutura base:

```txt
features/nova-feature/
├── api/
├── components/
├── config/
├── hooks/
└── utils/
```

Adicionar `state/` apenas se a feature precisar de contexto ou persistência local.

Adicionar página em:

```txt
pages/
```

Adicionar rota em:

```txt
app/router/routes/
```

Adicionar endpoints em:

```txt
shared/api/endpoints.js
```

---

## 29. Regras para alterar features existentes

Antes de alterar uma feature:

* confirmar endpoint no backend;
* confirmar contrato de dados;
* verificar config existente;
* evitar hardcoded novo no JSX;
* manter lógica fora dos componentes quando crescer;
* correr lint;
* correr build.

---

## 30. Anti-padrões a evitar

Evitar:

* chamar `fetch` diretamente em páginas;
* duplicar endpoints como strings soltas;
* colocar regras de negócio complexas no JSX;
* criar componentes gigantes;
* criar hooks com fluxos demasiado diferentes;
* colocar tudo em `shared/` sem necessidade real;
* usar `.env` para segredos;
* versionar `dist/`;
* versionar `.env`;
* ignorar erros de build/lint;
* mexer em várias features sem necessidade.

---

## 31. Checklist de arquitetura antes de commit

Antes de commit:

```bash
npm run lint
npm run build
npm audit
```

Confirmar:

* [ ] alteração está na feature certa;
* [ ] endpoints novos estão em `endpoints.js`;
* [ ] chamadas HTTP usam `httpClient`;
* [ ] textos longos foram para config;
* [ ] componentes partilhados são realmente partilhados;
* [ ] não foi criado código morto;
* [ ] não foi versionado `.env`;
* [ ] não foi versionado `dist/`.

---

## 32. Melhorias futuras recomendadas

Prioridade recomendada:

```txt
1. Adicionar testes frontend a utils e guards
2. Criar Error Boundary
3. Implementar code splitting por páginas
4. Adicionar testes E2E com Playwright
```

---

## 33. Resumo

A arquitetura atual é adequada para a fase do projeto.

Pontos fortes:

* organização por features;
* API centralizada;
* roles bem separadas;
* estado global limitado ao necessário;
* componentes partilhados reutilizáveis;
* configs para textos da UI;
* build e lint funcionais.

Pontos a melhorar futuramente:

* testes frontend;
* code splitting;
* Error Boundary;
* redução de duplicação;
* divisão de hooks grandes;
* documentação complementar.

O projeto está fechado e tem uma base arquitetural sólida e sustentável.
