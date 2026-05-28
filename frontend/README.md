# Frontend — Farmácia Santa Casa

Frontend da aplicação **Farmácia Santa Casa**, responsável pela interface de utilização para os contextos **Santa Casa**, **Farmácia** e **Sistema/Admin**.

Este frontend foi construído com **React**, **Vite**, **React Router** e **CSS Modules**.

> Estado atual: projeto em desenvolvimento.
> A arquitetura principal já está montada, o build passa e o lint passa, mas ainda faltam documentação complementar, testes frontend e otimizações finais.

---

## 1. Índice

* [1. Índice](#1-índice)
* [2. Estado atual](#2-estado-atual)
* [3. Objetivo do frontend](#3-objetivo-do-frontend)
* [4. Stack técnica](#4-stack-técnica)
* [5. Estrutura principal](#5-estrutura-principal)
* [6. Instalação local](#6-instalação-local)
* [7. Variáveis de ambiente](#7-variáveis-de-ambiente)
* [8. Scripts NPM](#8-scripts-npm)
* [9. Como arrancar o frontend](#9-como-arrancar-o-frontend)
* [10. Integração com o backend](#10-integração-com-o-backend)
* [11. Autenticação e autorização](#11-autenticação-e-autorização)
* [12. Áreas principais](#12-áreas-principais)
* [13. Arquitetura frontend](#13-arquitetura-frontend)
* [14. Estado global](#14-estado-global)
* [15. Camada de API](#15-camada-de-api)
* [16. Componentes partilhados](#16-componentes-partilhados)
* [17. Build e lint](#17-build-e-lint)
* [18. Testes](#18-testes)
* [19. Segurança](#19-segurança)
* [20. Convenções de desenvolvimento](#20-convenções-de-desenvolvimento)
* [21. Troubleshooting](#21-troubleshooting)
* [22. Checklist antes de commit](#22-checklist-antes-de-commit)
* [23. Checklist antes de deploy](#23-checklist-antes-de-deploy)
* [24. Limites atuais](#24-limites-atuais)
* [25. Próximos passos recomendados](#25-próximos-passos-recomendados)

---

## 2. Estado atual

Estado validado nesta fase:

* estrutura principal do frontend criada;
* arquitetura por features implementada;
* autenticação e guards por role implementados;
* integração com backend feita por `httpClient`;
* áreas principais criadas:

  * Santa Casa;
  * Farmácia;
  * Sistema/Admin;
* estado global de autenticação implementado;
* estado global do pedido em preparação implementado;
* persistência local do pedido em preparação via `localStorage`;
* `frontend/.env.example` criado;
* `npm run lint` passa sem erros;
* `npm run build` passa sem erros.

Comandos validados:

```bash
npm run lint
npm run build
```

Existe um aviso atual no build:

```txt
Some chunks are larger than 500 kB after minification.
```

Este aviso não bloqueia o projeto nesta fase. Deve ser tratado futuramente com code splitting por páginas.

---

## 3. Objetivo do frontend

O frontend serve como interface operacional para:

* **Santa Casa**

  * gerir utentes;
  * criar receitas;
  * criar medicamentos não sujeitos a receita médica;
  * criar Vendas Suspensas;
  * preparar e enviar pedidos para a Farmácia;
  * consultar pedidos pendentes;
  * consultar regularizações;
  * consultar histórico.

* **Farmácia**

  * consultar pedidos enviados pela Santa Casa;
  * validar pedidos;
  * rejeitar pedidos;
  * consultar regularizações;
  * consultar histórico;
  * acompanhar sinais operacionais.

* **Sistema/Admin**

  * consultar estado dos serviços;
  * gerir utilizadores;
  * pré-visualizar jobs de manutenção;
  * executar jobs de manutenção quando permitido.

---

## 4. Stack técnica

| Área            | Tecnologia            |
| --------------- | --------------------- |
| Framework UI    | React                 |
| Build tool      | Vite                  |
| Routing         | React Router          |
| Estilos         | CSS Modules           |
| Estado global   | Context API           |
| HTTP client     | Fetch API encapsulada |
| Lint            | ESLint                |
| Deploy previsto | Vercel ou equivalente |

---

## 5. Estrutura principal

Estrutura simplificada:

```txt
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   └── tokens.css
│   │   ├── App.jsx
│   │   └── router.jsx
│   ├── assets/
│   ├── features/
│   │   ├── auth/
│   │   ├── farmacia/
│   │   ├── santacasa/
│   │   └── system/
│   ├── pages/
│   │   ├── auth/
│   │   ├── farmacia/
│   │   ├── santacasa/
│   │   └── system/
│   ├── shared/
│   │   ├── api/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── ui/
│   │   └── utils/
│   └── main.jsx
├── .env
├── .env.example
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

A pasta `dist/` é gerada pelo build e não deve ser versionada.

---

## 6. Instalação local

### 6.1 Entrar na pasta do frontend

```bash
cd frontend
```

### 6.2 Instalar dependências

```bash
npm install
```

### 6.3 Criar `.env`

Copiar o exemplo:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

### 6.4 Arrancar servidor de desenvolvimento

```bash
npm run dev
```

---

## 7. Variáveis de ambiente

O frontend usa variáveis Vite.

Ficheiro local:

```txt
.env
```

Ficheiro de exemplo versionado:

```txt
.env.example
```

Conteúdo atual:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

### Nota importante

Todas as variáveis expostas ao frontend devem começar por:

```txt
VITE_
```

Nunca colocar segredos no frontend.

O frontend corre no browser. Qualquer variável `VITE_*` pode ser vista pelo utilizador final.

---

## 8. Scripts NPM

Scripts principais definidos no `package.json`:

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

### Desenvolvimento

```bash
npm run dev
```

### Build de produção

```bash
npm run build
```

### Preview local do build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 9. Como arrancar o frontend

### 9.1 Arrancar backend

Antes do frontend, o backend deve estar ativo:

```bash
cd backend
npm run dev
```

Por defeito:

```txt
http://localhost:3001/api
```

### 9.2 Arrancar frontend

Noutro terminal:

```bash
cd frontend
npm run dev
```

Por defeito, o Vite usa uma porta como:

```txt
http://localhost:5173
```

ou outra próxima, se a porta estiver ocupada.

---

## 10. Integração com o backend

A integração é feita através de:

```txt
src/shared/api/httpClient.js
src/shared/api/endpoints.js
```

### `httpClient.js`

Responsável por:

* construir URLs;
* enviar cookies com `credentials: "include"`;
* serializar query params;
* enviar JSON;
* interpretar respostas;
* lançar erros HTTP normalizados;
* marcar erros `401` e `403` como erros de autenticação/autorização.

### `endpoints.js`

Centraliza os endpoints usados pelo frontend:

```txt
auth
admin
santacasa
farmacia
manutencao
```

Isto evita strings de API espalhadas pela aplicação.

---

## 11. Autenticação e autorização

A autenticação usa sessão baseada em cookie HTTP-only emitido pelo backend.

No frontend, a autenticação é gerida por:

```txt
src/features/auth/
```

Principais peças:

```txt
AuthProvider
AuthContext
useAuth
RequireAuth
RequireRole
AuthHomeRedirect
useIdleLogout
```

### Regras principais

* utilizador sem sessão é redirecionado para `/login`;
* utilizador autenticado é encaminhado conforme a sua role;
* páginas sensíveis são protegidas por role;
* erros `401` e `403` são tratados centralmente.

### Roles

| Role        | Área                                 |
| ----------- | ------------------------------------ |
| `ADMIN`     | Sistema/Admin, Santa Casa e Farmácia |
| `SANTACASA` | Santa Casa                           |
| `FARMACIA`  | Farmácia                             |

Nota: o frontend melhora a experiência e bloqueia navegação indevida, mas a segurança real deve continuar sempre no backend.

---

## 12. Áreas principais

## 12.1 Auth

```txt
src/features/auth/
src/pages/auth/
```

Responsável por:

* login;
* sessão atual;
* logout;
* proteção de rotas;
* logout por inatividade;
* redirecionamento por role.

---

## 12.2 Santa Casa

```txt
src/features/santacasa/
src/pages/santacasa/
```

Inclui:

```txt
dashboard
utentes
operacao
pedidos
regularizacoes
historico
```

A área de operação agrega:

* receitas;
* medicamentos não sujeitos a receita médica;
* Vendas Suspensas;
* seleção de utente;
* ações para adicionar itens ao pedido geral.

---

## 12.3 Farmácia

```txt
src/features/farmacia/
src/pages/farmacia/
```

Inclui:

```txt
dashboard
pedidos
regularizacoes
historico
```

Permite:

* consultar pedidos;
* validar pedidos;
* rejeitar pedidos;
* acompanhar regularizações;
* consultar histórico.

---

## 12.4 Sistema/Admin

```txt
src/features/system/
src/pages/system/
```

Inclui:

```txt
health
manutencao
users
```

Permite:

* verificar estado dos serviços;
* gerir utilizadores;
* pré-visualizar jobs;
* executar jobs de manutenção.

---

## 13. Arquitetura frontend

A arquitetura segue uma abordagem **feature-based**.

Padrão principal:

```txt
feature/
├── api/
├── components/
├── config/
├── hooks/
├── state/
└── utils/
```

Nem todas as features têm todas as pastas. Cada feature tem apenas o que precisa.

### Responsabilidades

| Pasta         | Responsabilidade                       |
| ------------- | -------------------------------------- |
| `api/`        | chamadas HTTP ao backend               |
| `components/` | componentes específicos da feature     |
| `config/`     | textos, labels, opções, mensagens      |
| `hooks/`      | estado e lógica da feature             |
| `state/`      | contexto/persistência local da feature |
| `utils/`      | funções puras e helpers                |
| `pages/`      | composição final de página             |
| `shared/`     | elementos reutilizáveis globais        |

---

## 14. Estado global

Existem dois estados globais principais.

### 14.1 Auth

```txt
src/features/auth/context/AuthProvider.jsx
```

Responsável por:

* guardar utilizador atual;
* verificar sessão;
* login;
* logout;
* erros de autenticação;
* expiração de sessão.

### 14.2 Pedido em preparação

```txt
src/features/santacasa/pedidos/state/PedidoDraftProvider.jsx
```

Responsável por:

* guardar itens do pedido geral;
* adicionar/remover itens;
* alterar quantidades;
* persistir no `localStorage`;
* limpar pedido após envio.

Persistência:

```txt
farmacia-santa-casa:pedido-draft
```

---

## 15. Camada de API

Cada domínio tem o seu próprio ficheiro de API.

Exemplos:

```txt
features/santacasa/utentes/api/utentesApi.js
features/santacasa/receitas/api/receitasApi.js
features/santacasa/pedidos/api/pedidosApi.js
features/farmacia/pedidos/api/farmaciaPedidosApi.js
features/system/users/api/systemUsersApi.js
```

Estes ficheiros não devem conter lógica visual.

Devem apenas:

* preparar query params;
* chamar `httpClient`;
* normalizar respostas simples quando necessário.

---

## 16. Componentes partilhados

Componentes reutilizáveis:

```txt
src/shared/ui/
├── Button/
├── ConfirmDialog/
├── DataState/
├── FeedbackDialog/
├── FormField/
├── PageHeader/
└── SurfaceCard/
```

Layouts reutilizáveis:

```txt
src/shared/layouts/
├── AppShell/
└── AreaLanding/
```

Componentes globais:

```txt
src/shared/components/
└── BrandMark/
```

Regra:

* componentes em `shared/` não devem depender de uma feature específica;
* componentes específicos de domínio devem ficar dentro da respetiva feature.

---

## 17. Build e lint

### Lint

```bash
npm run lint
```

Estado atual:

```txt
✅ passa sem erros
```

### Build

```bash
npm run build
```

Estado atual:

```txt
✅ passa sem erros
```

Aviso atual:

```txt
Some chunks are larger than 500 kB after minification.
```

Este aviso deve ser tratado futuramente com code splitting.

---

## 18. Testes

Ainda não existem testes automatizados no frontend.

Isto é uma limitação conhecida.

### Testes recomendados futuramente

Ferramentas possíveis:

* Vitest;
* React Testing Library;
* Playwright, para E2E real no browser.

### Ordem recomendada

```txt
1. utils
2. hooks simples
3. httpClient
4. auth guards
5. componentes partilhados críticos
6. fluxos principais com browser real
```

### Exemplos de testes úteis

* `formatDateTime`;
* `classNames`;
* normalização de pedidos;
* normalização de regularizações;
* regras do pedido draft;
* guards por role;
* renderização de estados de loading/error/empty;
* login/logout;
* envio de pedido;
* validação/rejeição de pedido.

---

## 19. Segurança

### Nunca colocar segredos no frontend

Não colocar no `.env` do frontend:

* passwords;
* JWT secrets;
* URLs privadas sensíveis;
* credenciais de base de dados;
* chaves privadas.

### Cookies

O frontend usa:

```js
credentials: "include"
```

Isto é necessário porque a sessão é gerida pelo backend através de cookie HTTP-only.

### CORS

O backend deve permitir a origin do frontend em:

```env
ALLOWED_ORIGINS
```

Exemplo local:

```env
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
```

---

## 20. Convenções de desenvolvimento

### Componentes

* usar PascalCase;
* um componente por pasta quando tiver CSS Module;
* manter JSX limpo;
* mover textos longos para `config`;
* evitar lógica pesada dentro do JSX.

### Hooks

* usar `useSomething`;
* hooks devem concentrar lógica de estado;
* evitar hooks gigantes com responsabilidades demais;
* dividir quando começarem a misturar vários fluxos.

### API

* não chamar `fetch` diretamente nas páginas;
* usar sempre `httpClient`;
* centralizar endpoints em `endpoints.js`.

### CSS

* usar CSS Modules;
* usar tokens globais de `tokens.css`;
* evitar estilos inline, salvo exceções pequenas;
* manter UI consistente com o estilo clínico premium do projeto.

### Configs

Textos, labels, mensagens e opções devem ficar em ficheiros `*.config.js` sempre que fizer sentido.

---

## 21. Troubleshooting

### Erro: frontend não comunica com backend

Confirmar `.env`:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

Confirmar que o backend está ligado:

```bash
cd backend
npm run dev
```

### Erro de CORS

Confirmar no backend:

```env
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
```

### Login não mantém sessão

Confirmar no backend local:

```env
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
```

Confirmar que o frontend envia cookies:

```js
credentials: "include"
```

### Alterei `.env` e nada mudou

Reiniciar o Vite:

```bash
npm run dev
```

O Vite lê variáveis `.env` no arranque.

### Build gerou `dist/`

Normal.

A pasta `dist/` é output de produção e não deve ser commitada.

---

## 22. Checklist antes de commit

Antes de commit:

```bash
npm run lint
npm run build
npm audit
git status
```

Confirmar:

* [ ] `frontend/.env` não aparece no Git.
* [ ] `frontend/.env.example` aparece quando criado/alterado.
* [ ] `frontend/dist/` não aparece no Git.
* [ ] `npm run lint` passa.
* [ ] `npm run build` passa.
* [ ] `npm audit` não mostra vulnerabilidades relevantes.
* [ ] alterações estão limitadas ao necessário.
* [ ] textos novos foram colocados em config quando fizer sentido.

---

## 23. Checklist antes de deploy

* [ ] Definir `VITE_API_BASE_URL` para a API correta.
* [ ] Confirmar CORS no backend.
* [ ] Confirmar cookies em ambiente real.
* [ ] Correr `npm run lint`.
* [ ] Correr `npm run build`.
* [ ] Testar login.
* [ ] Testar cada role.
* [ ] Testar fluxo Santa Casa.
* [ ] Testar fluxo Farmácia.
* [ ] Testar área Admin.
* [ ] Confirmar que `dist/` não foi commitado manualmente.
* [ ] Confirmar variáveis no serviço de deploy.

---

## 24. Limites atuais

Limitações conhecidas:

* ainda não existem testes automatizados frontend;
* ainda não existe documentação técnica complementar do frontend;
* bundle principal está acima de 500 kB;
* ainda não foi implementado code splitting;
* alguns hooks podem crescer demasiado se não forem divididos no futuro;
* ainda há alguma duplicação de helpers de quantidade, medicamentos e queries;
* ainda não existe Error Boundary dedicado.

Estas limitações não bloqueiam a fase atual, mas devem ser tratadas gradualmente.

---

## 25. Próximos passos recomendados

### Curto prazo

* criar documentação frontend complementar:

  * `docs/ARCHITECTURE.md`;
  * `docs/API_CONTRACT.md`;
  * `docs/TESTING.md`;
* validar integração real com backend;
* manter `lint` e `build` sem erros.

### Médio prazo

* adicionar testes frontend;
* criar base de helpers partilhados para normalização;
* dividir hooks grandes;
* adicionar Error Boundary;
* adicionar code splitting por páginas.

### Futuro

* otimizar bundle;
* adicionar testes E2E com browser real;
* preparar documentação de deploy;
* rever acessibilidade;
* rever performance com Lighthouse.
