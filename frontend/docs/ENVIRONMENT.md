# ENVIRONMENT.md

Documentação de ambiente do frontend **Farmácia Santa Casa**.

Este documento descreve as variáveis de ambiente usadas pelo frontend, regras de configuração local, integração com backend, cuidados de segurança e preparação futura para deploy.

> Estado atual: projeto em desenvolvimento.
> O frontend já tem `.env.example` e comunica com o backend através de `VITE_API_BASE_URL`.

---

## 1. Objetivo

Este documento serve para esclarecer:

* que ficheiros `.env` existem no frontend;
* que variáveis são usadas;
* como configurar ambiente local;
* como ligar frontend ao backend;
* que cuidados existem com cookies e CORS;
* o que nunca deve ser colocado no frontend;
* como preparar configuração futura para produção.

---

## 2. Ficheiros de ambiente

Na pasta `frontend/` existem ou podem existir:

```txt
frontend/
├── .env
└── .env.example
```

### `.env`

Ficheiro local real.

Não deve ser versionado.

Usado apenas no teu ambiente local.

### `.env.example`

Ficheiro de exemplo.

Deve ser versionado.

Serve para mostrar que variáveis o projeto precisa.

---

## 3. Variável atual

Conteúdo atual recomendado:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

Esta variável define a URL base da API usada pelo frontend.

---

## 4. Regra das variáveis Vite

No Vite, só ficam disponíveis no browser as variáveis com prefixo:

```txt
VITE_
```

Exemplo válido:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

Exemplo inválido para frontend:

```env
API_BASE_URL="http://localhost:3001/api"
```

Esta segunda variável não será exposta ao código React por defeito.

---

## 5. Segurança

Nunca colocar no `.env` do frontend:

* passwords;
* `AUTH_JWT_SECRET`;
* `DATABASE_URL`;
* tokens privados;
* credenciais de produção;
* chaves privadas;
* segredos de backend.

Motivo:

```txt
Tudo o que começa por VITE_ pode ser incluído no bundle final e visto no browser.
```

Regra:

```txt
Frontend não guarda segredos.
Backend guarda segredos.
```

---

## 6. Configuração local

### Backend local

Por defeito, o backend corre em:

```txt
http://localhost:3001/api
```

### Frontend local

Por defeito, o Vite corre em:

```txt
http://localhost:5173
```

ou porta próxima, se a `5173` estiver ocupada.

### `.env` local recomendado

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

---

## 7. Fallback no código

O frontend deve funcionar mesmo sem `.env`, porque o `httpClient` usa fallback local:

```txt
http://localhost:3001/api
```

Mesmo assim, o `.env.example` deve existir para documentar a variável.

---

## 8. Como criar `.env` local

Dentro de `frontend`:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Depois confirmar:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

---

## 9. Reiniciar Vite após alterar `.env`

O Vite lê variáveis de ambiente no arranque.

Depois de alterar `.env`, parar e arrancar novamente:

```bash
npm run dev
```

Se não reiniciares, a alteração pode não ser aplicada.

---

## 10. Integração com backend

O frontend comunica com o backend através de:

```txt
src/shared/api/httpClient.js
```

E usa endpoints centralizados em:

```txt
src/shared/api/endpoints.js
```

Regra:

* não usar `fetch` diretamente nas páginas;
* não escrever URLs soltas em componentes;
* usar sempre `httpClient`;
* adicionar endpoints em `endpoints.js`.

---

## 11. Cookies

A autenticação usa cookie HTTP-only definido pelo backend.

Por isso o frontend envia requests com:

```js
credentials: "include"
```

Isto é obrigatório para:

* login;
* sessão atual;
* logout;
* rotas protegidas;
* chamadas autenticadas.

---

## 12. CORS no backend

O backend deve permitir a origin do frontend.

Exemplo local no backend:

```env
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
```

Se o frontend correr noutra porta, essa porta também tem de estar em `ALLOWED_ORIGINS`.

Exemplo:

```env
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:5175"
```

---

## 13. Cookies em desenvolvimento

Backend local recomendado:

```env
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
```

Motivo:

* local normalmente não usa HTTPS;
* `secure=false` permite cookie em HTTP local;
* `sameSite=lax` costuma funcionar bem em localhost.

---

## 14. Cookies em produção

Em produção com HTTPS:

```env
AUTH_COOKIE_SECURE=true
```

Se frontend e backend estiverem em domínios diferentes e for necessário cookie cross-site:

```env
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
```

Atenção:

```txt
SameSite=None exige Secure=true.
```

---

## 15. Configuração futura de produção

Exemplo futuro:

```env
VITE_API_BASE_URL="https://api.farmacia-santacasa.pt/api"
```

Ou, se frontend e backend estiverem no mesmo domínio com proxy/rewrite:

```env
VITE_API_BASE_URL="/api"
```

A escolha depende da infraestrutura final.

---

## 16. Ambientes possíveis

### Desenvolvimento local

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

### Preview/staging

```env
VITE_API_BASE_URL="https://staging-api.exemplo.pt/api"
```

### Produção

```env
VITE_API_BASE_URL="https://api.exemplo.pt/api"
```

---

## 17. `.gitignore`

O `.env` real deve estar ignorado.

Regras recomendadas no `.gitignore` da raiz:

```gitignore
frontend/.env
frontend/.env.*
!frontend/.env.example
```

Confirmar:

```bash
git check-ignore frontend/.env
```

Deve devolver:

```txt
frontend/.env
```

E:

```bash
git check-ignore frontend/.env.example
```

Não deve devolver nada, porque `.env.example` deve poder ir para Git.

---

## 18. Verificação antes de commit

Antes de commit:

```bash
git status
```

Confirmar:

* [ ] `frontend/.env` não aparece;
* [ ] `frontend/.env.example` aparece se foi criado/alterado;
* [ ] `frontend/dist/` não aparece;
* [ ] `.gitignore` está correto.

---

## 19. Comandos úteis

### Arrancar frontend

```bash
npm run dev
```

### Validar build

```bash
npm run build
```

### Validar lint

```bash
npm run lint
```

### Validar dependências

```bash
npm audit
```

---

## 20. Troubleshooting

### Frontend não comunica com backend

Verificar:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

Confirmar backend:

```bash
cd backend
npm run dev
```

Confirmar frontend:

```bash
cd frontend
npm run dev
```

---

### Erro de CORS

Confirmar no backend:

```env
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
```

Se o Vite estiver noutra porta, adicionar essa origin.

---

### Login funciona mas sessão perde-se

Confirmar backend local:

```env
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
```

Confirmar que o frontend usa:

```js
credentials: "include"
```

---

### Alterei `.env` mas nada mudou

Reiniciar Vite:

```bash
npm run dev
```

---

### `.env` aparece no Git

Não fazer commit.

Adicionar ao `.gitignore`:

```gitignore
frontend/.env
frontend/.env.*
!frontend/.env.example
```

Se já estiver tracked:

```bash
git rm --cached frontend/.env
```

---

## 21. Regras para adicionar novas variáveis

Ao adicionar uma nova variável:

1. confirmar que não é segredo;
2. usar prefixo `VITE_`;
3. adicionar ao `.env.example`;
4. documentar neste ficheiro;
5. reiniciar Vite;
6. validar `npm run build`;
7. garantir que `.env` real não foi versionado.

---

## 22. Variáveis que não devem existir no frontend

Não criar:

```env
DATABASE_URL="..."
AUTH_JWT_SECRET="..."
SEED_ADMIN_PASSWORD="..."
POSTGRES_PASSWORD="..."
PRIVATE_API_KEY="..."
```

Essas pertencem ao backend ou ao ambiente de servidor.

---

## 23. Estado atual

Variável frontend atual:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

Estado:

```txt
.env.example criado
.env local opcional/criado localmente
.env real ignorado pelo Git
frontend validado com lint/build
```

---

## 24. Resumo

O frontend precisa atualmente de uma única variável de ambiente:

```env
VITE_API_BASE_URL
```

O `.env.example` deve ser versionado.

O `.env` real não deve ser versionado.

A autenticação depende de:

* backend com CORS correto;
* backend com cookies configurados;
* frontend a enviar `credentials: "include"`;
* `VITE_API_BASE_URL` a apontar para a API correta.

Regra principal:

```txt
Configuração pública no frontend.
Segredos sempre no backend.
```
