# Frontend — Farmácia Santa Casa

Frontend da aplicação **Farmácia Santa Casa**, responsável pela interface operacional dos contextos **Santa Casa**, **Farmácia** e **Sistema/Admin**.

Construído com React, Vite, React Router e CSS Modules.

> **Estado atual:** funcionalidades principais implementadas, integração com o backend validada e frontend publicado em staging.

---

## Demonstração pública

### Frontend

https://farmacia-santacasa-frontend-staging.onrender.com

### API utilizada pelo staging

https://farmacia-santacasa-backend-staging.onrender.com/api

Contas demo:

| Role | Email |
| --- | --- |
| `ADMIN` | `demo.admin@sistema.local` |
| `SANTACASA` | `demo.santacasa@sistema.local` |
| `FARMACIA` | `demo.farmacia@sistema.local` |

As passwords são fornecidas separadamente e não existem no repositório.

---

## Objetivo

O frontend disponibiliza uma interface clara, institucional e operacional para:

### Santa Casa

- gerir utentes;
- gerir medicação habitual;
- criar receitas;
- criar medicamentos não sujeitos a receita médica;
- criar medicamentos para Venda Suspensa;
- preparar e enviar pedidos;
- consultar pedidos;
- consultar histórico;
- acompanhar regularizações;
- consultar indicadores operacionais.

### Farmácia

- consultar pedidos pendentes;
- validar pedidos;
- rejeitar pedidos;
- consultar histórico;
- acompanhar regularizações;
- consultar e fechar alertas;
- consultar indicadores operacionais.

### Sistema/Admin

- gerir utilizadores;
- consultar health e readiness;
- pré-visualizar jobs;
- executar jobs administrativos com confirmação;
- aceder às áreas Santa Casa e Farmácia.

---

## Stack técnica

| Área | Tecnologia |
| --- | --- |
| UI | React |
| Build | Vite |
| Routing | React Router |
| Estilos | CSS Modules |
| Estado global | Context API |
| HTTP | Fetch API encapsulada |
| Códigos de barras | JsBarcode |
| Lint | ESLint |
| Deploy atual | Render |

---

## Direção visual

A interface segue uma direção **clinic premium operacional**:

- clara;
- institucional;
- calma;
- profissional;
- acessível a utilizadores de várias idades;
- com boa legibilidade;
- superfícies claras;
- bordas suaves;
- sombras controladas;
- botões e controlos com dimensões confortáveis;
- contraste moderado;
- responsividade consistente.

---

## Estrutura principal

```text
frontend/
├── docs/
│   ├── API_CONTRACT.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── UI_COMPONENTS.md
├── public/
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── styles/
│   │   └── App.jsx
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
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── ui/
│   │   └── utils/
│   └── main.jsx
├── .env.example
├── .env.production.example
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

A pasta `dist/` é gerada pelo build e não deve ser versionada.

---

## Arquitetura

A aplicação segue uma arquitetura **feature-based**.

Estrutura típica:

```text
feature/
├── api/
├── components/
├── config/
├── hooks/
├── state/
└── utils/
```

Nem todas as features necessitam de todas as pastas.

### Responsabilidades

| Pasta | Responsabilidade |
| --- | --- |
| `api/` | chamadas HTTP do domínio |
| `components/` | componentes específicos da feature |
| `config/` | textos, labels, mensagens e opções |
| `hooks/` | estado e lógica da feature |
| `state/` | contextos e persistência local |
| `utils/` | funções puras |
| `pages/` | páginas finas e composição final |
| `shared/` | elementos reutilizáveis globais |

Princípios aplicados:

- páginas finas;
- lógica fora do JSX;
- API isolada;
- textos visíveis em ficheiros de configuração;
- CSS Modules;
- componentes partilhados sem dependências de domínio;
- alterações pequenas e validáveis.

---

## Instalação local

### 1. Entrar na pasta

```bash
cd frontend
```

### 2. Instalar dependências

```bash
npm install
```

Para uma instalação reprodutível:

```bash
npm ci
```

### 3. Criar o ambiente local

PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Conteúdo local:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

### 4. Arrancar

```bash
npm run dev
```

Endereço típico:

```text
http://localhost:5173
```

---

## Variáveis de ambiente

Templates:

```text
.env.example
.env.production.example
```

### Desenvolvimento

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

### Build remoto

Exemplo:

```env
VITE_API_BASE_URL="https://api.exemplo.pt/api"
```

### Regras de segurança

Todas as variáveis `VITE_*` ficam disponíveis no bundle do browser.

Nunca colocar no frontend:

- passwords;
- `DATABASE_URL`;
- `AUTH_JWT_SECRET`;
- tokens privados;
- chaves privadas;
- credenciais reais.

---

## Proteção do build

O `vite.config.js` valida `VITE_API_BASE_URL` durante o build.

O build falha quando a variável:

- está ausente;
- não contém uma URL válida;
- não usa HTTPS;
- aponta para `localhost`, `127.0.0.1`, `0.0.0.0` ou `::1`;
- contém query string;
- contém fragmento;
- não termina exatamente em `/api`.

Exemplo válido:

```env
VITE_API_BASE_URL="https://farmacia-santacasa-backend-staging.onrender.com/api"
```

Em desenvolvimento, o fallback local só é permitido quando o Vite está em modo `DEV`.

---

## Scripts NPM

Scripts atuais:

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "audit": "npm audit",
  "validate": "npm run lint && npm run build && npm run audit"
}
```

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

### Audit

```bash
npm run audit
```

### Validação completa do frontend

```bash
npm run validate
```

---

## Integração com o backend

A camada HTTP partilhada encontra-se em:

```text
src/shared/api/
├── endpoints.js
├── httpClient.config.js
├── httpClient.js
└── httpClient.utils.js
```

### Responsabilidades

`httpClient.config.js`:

- resolve a base URL;
- permite localhost apenas em desenvolvimento;
- bloqueia ausência de configuração fora de desenvolvimento.

`httpClient.js`:

- constrói requests;
- envia cookies com `credentials: "include"`;
- envia JSON;
- interpreta respostas;
- normaliza erros;
- trata `401` e `403`.

`endpoints.js`:

- centraliza os caminhos da API;
- evita strings espalhadas;
- organiza endpoints por domínio.

---

## Autenticação e autorização

A autenticação usa cookie HTTP-only emitido pelo backend.

Principais peças:

```text
src/features/auth/
```

Inclui:

```text
AuthProvider
AuthContext
useAuth
RequireAuth
RequireRole
AuthHomeRedirect
useIdleLogout
```

### Regras

- utilizadores sem sessão são redirecionados para `/login`;
- utilizadores autenticados são encaminhados de acordo com a role;
- rotas sensíveis são protegidas;
- a sessão é validada no backend;
- erros `401` e `403` são tratados centralmente;
- o logout remove a sessão;
- a sessão mantém-se após refresh quando o cookie continua válido.

### Roles

| Role | Acesso |
| --- | --- |
| `ADMIN` | Sistema/Admin, Santa Casa e Farmácia |
| `SANTACASA` | Santa Casa |
| `FARMACIA` | Farmácia |

O frontend protege a navegação, mas a autorização real pertence ao backend.

---

## Áreas funcionais

### Auth

```text
src/features/auth/
src/pages/auth/
```

Responsável por:

- login;
- sessão;
- logout;
- proteção de rotas;
- redirecionamento por role;
- logout por inatividade.

### Santa Casa

```text
src/features/santacasa/
src/pages/santacasa/
```

Features principais:

```text
dashboard
home
utentes
operacao
pedidos
historico
regularizacoes
```

A Operação integra:

- seleção de utente;
- medicação habitual;
- receitas;
- medicamentos não sujeitos a receita médica;
- medicamentos para Venda Suspensa;
- pedido em preparação.

### Farmácia

```text
src/features/farmacia/
src/pages/farmacia/
```

Features principais:

```text
dashboard
home
pedidos
historico
regularizacoes
alertas
```

### Sistema/Admin

```text
src/features/system/
src/pages/system/
```

Features principais:

```text
home
health
users
manutencao
```

---

## Estado global

### Autenticação

O estado de autenticação gere:

- utilizador atual;
- verificação da sessão;
- login;
- logout;
- erros de autenticação;
- expiração da sessão.

### Pedido em preparação

O pedido da Santa Casa é mantido num provider dedicado.

Responsabilidades:

- adicionar itens;
- remover itens;
- alterar quantidades;
- persistir em `localStorage`;
- limpar depois do envio.

Chave utilizada:

```text
farmacia-santa-casa:pedido-draft
```

---

## Componentes partilhados

Exemplos em:

```text
src/shared/ui/
```

Incluem:

- `BarcodeValue`;
- `BrandMark`;
- `Button`;
- `ConfirmDialog`;
- componentes de dashboard;
- `DataState`;
- `FeedbackDialog`;
- `FormField`;
- `OperationalDetailState`;
- `PageHeader`;
- `SurfaceCard`.

Layouts:

```text
src/shared/layouts/
├── AppShell/
└── AreaLanding/
```

Regra:

```text
Um componente shared não deve depender de uma feature específica.
```

---

## Routing e carregamento

As rotas estão organizadas por área:

```text
src/app/router/routes/
├── farmacia.routes.jsx
├── santaCasa.routes.jsx
└── system.routes.jsx
```

As páginas são carregadas de forma lazy quando aplicável, reduzindo o carregamento inicial e separando o bundle por rotas.

O deploy deve aplicar rewrite SPA para que rotas diretas sejam encaminhadas para:

```text
/index.html
```

---

## Build e validação

### Lint

```bash
npm run lint
```

### Build de staging

PowerShell:

```powershell
$env:VITE_API_BASE_URL="https://farmacia-santacasa-backend-staging.onrender.com/api"
npm run build
Remove-Item Env:VITE_API_BASE_URL
```

### Preview

```bash
npm run preview
```

### Validação completa

```bash
npm run validate
```

O build de staging e o lint foram validados.

---

## Deploy no Render

A plataforma deve definir:

```env
VITE_API_BASE_URL="https://farmacia-santacasa-backend-staging.onrender.com/api"
```

A variável é incorporada durante o build.

Alterar o valor exige novo build/deploy.

Também é necessário configurar um rewrite SPA:

```text
/* → /index.html
```

Foram validados:

- `/login`;
- rotas internas;
- refresh em rotas diretas;
- sessão;
- logout;
- comunicação cross-site com a API.

---

## Segurança

### Cookies

As requests autenticadas usam:

```js
credentials: "include"
```

### CORS

O backend deve permitir exatamente a origin do frontend.

Exemplo de staging:

```env
ALLOWED_ORIGINS="https://farmacia-santacasa-frontend-staging.onrender.com"
```

### Secrets

Nunca expor no frontend:

- passwords;
- JWT secrets;
- ligação à base;
- tokens privados;
- chaves de infraestrutura.

### Guards

Os guards frontend melhoram a experiência, mas não substituem o controlo de permissões do backend.

---

## Testes

Ainda não existe uma suite automatizada de testes frontend.

A validação atual cobre:

- ESLint;
- build;
- audit;
- testes manuais no staging;
- integração real com o backend;
- autenticação das três roles;
- rotas e refresh;
- fluxos principais da aplicação.

### Evolução recomendada

Ordem sugerida:

1. utils puras;
2. `httpClient`;
3. guards de autenticação;
4. hooks críticos;
5. componentes partilhados;
6. fluxos com Playwright.

Ferramentas adequadas:

- Vitest;
- React Testing Library;
- Playwright.

---

## Convenções de desenvolvimento

### Componentes

- PascalCase;
- um componente por pasta quando tem CSS Module;
- JSX focado em renderização;
- lógica movida para hooks e utils;
- textos visíveis em config sempre que aplicável.

### Hooks

- prefixo `use`;
- responsabilidade clara;
- evitar hooks demasiado grandes;
- separar lógica quando mistura vários fluxos.

### API

- não usar `fetch` diretamente nas páginas;
- usar o `httpClient`;
- centralizar caminhos em `endpoints.js`.

### CSS

- usar CSS Modules;
- reutilizar os tokens globais;
- evitar estilos inline;
- manter coerência com o estilo clinic premium operacional;
- preservar responsividade.

### Páginas

- manter páginas finas;
- renderizar `PageContent`;
- evitar regras de negócio em `/pages`.

---

## Troubleshooting

### O frontend não comunica com o backend

Confirmar:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

Confirmar o backend:

```bash
cd ../backend
npm run dev
```

### Erro de CORS

No backend local:

```env
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
```

### O login não mantém a sessão

No backend local:

```env
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
```

Confirmar que o frontend usa:

```js
credentials: "include"
```

### O build falha por causa da API

O build exige uma URL HTTPS remota que termine em `/api`.

PowerShell:

```powershell
$env:VITE_API_BASE_URL="https://api.exemplo.pt/api"
npm run build
Remove-Item Env:VITE_API_BASE_URL
```

### Alterei `.env` e nada mudou

Reiniciar:

```bash
npm run dev
```

O Vite lê os ficheiros de ambiente no arranque.

### Refresh numa rota interna devolve 404

Configurar rewrite SPA:

```text
/* → /index.html
```

---

## Checklist antes de commit

```bash
npm run lint
npm run build
npm run audit
git status
```

Confirmar:

- [ ] `.env` real não aparece no Git;
- [ ] `.env.example` e `.env.production.example` estão versionados;
- [ ] `dist/` não aparece no Git;
- [ ] lint passa;
- [ ] build passa;
- [ ] audit não apresenta vulnerabilidades relevantes;
- [ ] alterações estão limitadas ao necessário;
- [ ] textos novos foram colocados em config quando aplicável.

---

## Checklist antes de deploy

- [ ] definir `VITE_API_BASE_URL`;
- [ ] confirmar HTTPS;
- [ ] confirmar terminação `/api`;
- [ ] confirmar CORS no backend;
- [ ] confirmar cookies;
- [ ] executar lint;
- [ ] executar build;
- [ ] testar login;
- [ ] testar as três roles;
- [ ] testar refresh em rotas internas;
- [ ] testar logout;
- [ ] testar fluxo Santa Casa;
- [ ] testar fluxo Farmácia;
- [ ] testar Sistema/Admin;
- [ ] confirmar rewrite SPA;
- [ ] confirmar que não existem secrets no bundle.

---

## Limitações conhecidas

- ainda não existe uma suite automatizada de testes frontend;
- a produção real ainda não foi criada;
- não existe uma pipeline dedicada de testes E2E no browser;
- a validação de acessibilidade ainda é predominantemente manual.

Estas limitações não bloqueiam o ambiente atual de portefólio.

---

## Estado final

```text
Frontend funcional, integrado com o backend, publicado em staging,
validado nas três roles e preparado para uma futura produção real.
```
