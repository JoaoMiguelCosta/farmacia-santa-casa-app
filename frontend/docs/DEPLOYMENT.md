# DEPLOYMENT.md

Guia de deploy do frontend **Farmácia Santa Casa**.

Este documento descreve como preparar e fazer deploy do frontend em ambiente de produção.

---

## 1. Pré-requisitos

Antes de fazer deploy:

- backend em produção e acessível;
- URL da API de produção definida;
- CORS configurado no backend para a origin do frontend;
- cookies configurados para HTTPS em produção.

---

## 2. Variáveis de ambiente

O frontend precisa de uma variável:

```env
VITE_API_BASE_URL="https://api.dominio.pt/api"
```

Regras:

- variáveis `VITE_*` ficam visíveis no bundle final — nunca colocar segredos;
- definir a variável no serviço de deploy (Vercel, Netlify, ou equivalente);
- não commitar `.env` com valores de produção.

---

## 3. Build de produção

```bash
cd frontend
npm install
npm run build
```

Output gerado em:

```txt
frontend/dist/
```

A pasta `dist/` não deve ser versionada.

---

## 4. Validação antes de deploy

```bash
npm run lint
npm run build
npm audit
```

Confirmar:

- [ ] `npm run lint` passa sem erros;
- [ ] `npm run build` passa sem erros;
- [ ] `VITE_API_BASE_URL` está definida e aponta para a API correta;
- [ ] `frontend/.env` não foi commitado;
- [ ] `frontend/dist/` não foi commitado.

---

## 5. Configuração do backend para produção

No backend, confirmar:

```env
ALLOWED_ORIGINS="https://frontend.dominio.pt"
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=lax
```

Se frontend e backend estiverem em domínios diferentes e for necessário cookie cross-site:

```env
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
```

Nota: `SameSite=None` exige `Secure=true`.

---

## 6. Checklist de deploy

Antes de publicar:

- [ ] `VITE_API_BASE_URL` definida no serviço de deploy;
- [ ] CORS no backend permite a origin do frontend em produção;
- [ ] cookies configurados para HTTPS;
- [ ] `npm run lint` passa;
- [ ] `npm run build` passa;
- [ ] login testado manualmente;
- [ ] sessão mantida após refresh;
- [ ] cada role testada (ADMIN, SANTACASA, FARMACIA);
- [ ] fluxo Santa Casa testado;
- [ ] fluxo Farmácia testado;
- [ ] área Sistema/Admin testada;
- [ ] página 404 funciona;
- [ ] redirecionamentos por role funcionam.

---

## 7. Serviço de deploy recomendado

O frontend é um SPA gerado pelo Vite.

Funciona em qualquer serviço que sirva ficheiros estáticos:

- Vercel;
- Netlify;
- Cloudflare Pages;
- servidor nginx com `dist/`.

### Nota importante para SPA

Qualquer serviço que sirva o frontend deve redirecionar todas as rotas para `index.html`.

Exemplo nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Sem isto, recarregar uma página em `/santacasa/pedidos` devolve 404.

---

## 8. Troubleshooting de produção

### Login não funciona

Verificar:

- `ALLOWED_ORIGINS` no backend inclui a origin do frontend;
- `AUTH_COOKIE_SECURE=true` se o frontend usar HTTPS;
- `AUTH_COOKIE_SAME_SITE` está correto para o setup de domínios.

### Sessão perde-se ao recarregar

Verificar cookies no browser (DevTools → Application → Cookies):

- cookie `HttpOnly` deve estar presente após login;
- atributos `Secure` e `SameSite` devem corresponder ao backend.

### Rotas internas devolvem 404

Confirmar que o servidor está a redirecionar todas as rotas para `index.html`.

### Frontend não comunica com backend

Confirmar `VITE_API_BASE_URL` no serviço de deploy e fazer redeploy após alteração.
