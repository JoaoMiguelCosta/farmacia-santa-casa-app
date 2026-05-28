# ROUTES.md

Documentação de rotas do frontend **Farmácia Santa Casa**.

Este documento descreve as rotas atuais da aplicação, as permissões por role, os redirects principais e as regras a seguir quando forem criadas ou alteradas páginas.

> Estado atual: projeto em desenvolvimento.
> As rotas refletem a arquitetura atual e podem evoluir conforme novas funcionalidades forem adicionadas.

---

## 1. Objetivo

Este ficheiro serve para documentar:

* rotas públicas;
* rotas protegidas;
* rotas por role;
* redirects;
* páginas associadas;
* regras de autorização;
* regras para criar novas rotas.

---

## 2. Ficheiro principal de rotas

As rotas estão definidas em:

```txt
src/app/router.jsx
```

A aplicação é montada em:

```txt
src/app/App.jsx
```

Com providers principais:

```txt
AuthProvider
PedidoDraftProvider
RouterProvider
```

---

## 3. Roles existentes

Roles principais:

```txt
ADMIN
SANTACASA
FARMACIA
```

Permissões gerais:

| Role        | Acesso                               |
| ----------- | ------------------------------------ |
| `ADMIN`     | Sistema/Admin, Santa Casa e Farmácia |
| `SANTACASA` | Área Santa Casa                      |
| `FARMACIA`  | Área Farmácia                        |

Regra importante:

```txt
Frontend controla navegação.
Backend controla segurança real.
```

---

## 4. Guards de autenticação

Os guards ficam em:

```txt
src/features/auth/components/
```

Principais guards:

```txt
RequireAuth.jsx
RequireRole.jsx
AuthHomeRedirect.jsx
```

### `RequireAuth`

Usado para bloquear acesso sem sessão.

Se o utilizador não estiver autenticado, deve ser enviado para:

```txt
/login
```

### `RequireRole`

Usado para bloquear acesso com role errada.

Exemplo:

* `SANTACASA` não deve aceder à área Farmácia;
* `FARMACIA` não deve aceder à área Santa Casa;
* apenas `ADMIN` deve aceder à área Sistema/Admin.

### `AuthHomeRedirect`

Usado para enviar utilizador autenticado para a sua área correta.

---

## 5. Rotas públicas

### Login

```txt
/login
```

Página:

```txt
src/pages/auth/LoginPage.jsx
```

Acesso:

```txt
Público
```

Notas:

* utilizador sem sessão pode entrar;
* utilizador já autenticado deve ser redirecionado conforme role.

---

## 6. Rota inicial

### Home

```txt
/
```

Página:

```txt
src/pages/HomePage.jsx
```

Função:

* entrada inicial;
* pode redirecionar utilizador autenticado para a área correta;
* pode apresentar landing simples caso faça sentido.

---

## 7. Área Santa Casa

Prefixo:

```txt
/santacasa
```

Roles permitidas:

```txt
SANTACASA
ADMIN
```

Guard recomendado:

```txt
RequireAuth + RequireRole
```

---

## 7.1 Visão geral Santa Casa

```txt
/santacasa
```

Página:

```txt
src/pages/santacasa/SantaCasaHomePage.jsx
```

Função:

* página inicial da área Santa Casa;
* entrada para operações principais.

---

## 7.2 Dashboard Santa Casa

```txt
/santacasa/dashboard
```

Página:

```txt
src/pages/santacasa/SantaCasaDashboardPage.jsx
```

Feature:

```txt
src/features/santacasa/dashboard/
```

Função:

* mostrar sinais operacionais da Santa Casa;
* resumir estado de utentes, pedidos e regularizações.

---

## 7.3 Utentes

```txt
/santacasa/utentes
```

Página:

```txt
src/pages/santacasa/SantaCasaUtentesPage.jsx
```

Feature:

```txt
src/features/santacasa/utentes/
```

Função:

* criar utentes;
* listar utentes;
* filtrar por estado;
* arquivar;
* reativar;
* remover registo quando permitido.

---

## 7.4 Operação

```txt
/santacasa/operacao
```

Página:

```txt
src/pages/santacasa/SantaCasaOperacaoPage.jsx
```

Feature:

```txt
src/features/santacasa/operacao/
```

Agrega:

```txt
receitas
sem-receita
extras
pedidos
```

Função:

* selecionar utente;
* criar receita;
* criar medicamento não sujeito a receita médica;
* criar Venda Suspensa;
* adicionar itens ao pedido geral.

---

## 7.5 Pedidos Santa Casa

```txt
/santacasa/pedidos
```

Página:

```txt
src/pages/santacasa/SantaCasaPedidosPage.jsx
```

Feature:

```txt
src/features/santacasa/pedidos/
```

Função:

* consultar pedido geral;
* consultar pedidos pendentes;
* enviar pedido;
* cancelar pedido quando permitido.

---

## 7.6 Regularizações Santa Casa

```txt
/santacasa/regularizacoes
```

Página:

```txt
src/pages/santacasa/SantaCasaRegularizacoesPage.jsx
```

Feature:

```txt
src/features/santacasa/regularizacoes/
```

Função:

* consultar regularizações pendentes;
* consultar histórico de regularizações;
* ver sinal/resumo.

---

## 7.7 Histórico Santa Casa

```txt
/santacasa/historico
```

Página:

```txt
src/pages/santacasa/SantaCasaHistoricoPage.jsx
```

Feature:

```txt
src/features/santacasa/historico/
```

Função:

* consultar histórico de pedidos da Santa Casa;
* aplicar filtros;
* consultar estados de pedidos fechados.

---

## 7.8 Redirects internos Santa Casa

Rotas antigas ou específicas podem redirecionar para operação:

```txt
/santacasa/receitas      -> /santacasa/operacao
/santacasa/sem-receita   -> /santacasa/operacao
/santacasa/extras        -> /santacasa/operacao
```

Motivo:

* receitas, medicamentos não sujeitos a receita médica e Vendas Suspensas passaram a fazer parte da página operacional agregada.

---

## 8. Área Farmácia

Prefixo:

```txt
/farmacia
```

Roles permitidas:

```txt
FARMACIA
ADMIN
```

Guard recomendado:

```txt
RequireAuth + RequireRole
```

---

## 8.1 Visão geral Farmácia

```txt
/farmacia
```

Página:

```txt
src/pages/farmacia/FarmaciaHomePage.jsx
```

Função:

* página inicial da área Farmácia;
* entrada para pedidos, regularizações e histórico.

---

## 8.2 Dashboard Farmácia

```txt
/farmacia/dashboard
```

Página:

```txt
src/pages/farmacia/FarmaciaDashboardPage.jsx
```

Feature:

```txt
src/features/farmacia/dashboard/
```

Função:

* mostrar sinais operacionais da Farmácia;
* resumir pedidos e regularizações.

---

## 8.3 Pedidos Farmácia

```txt
/farmacia/pedidos
```

Página:

```txt
src/pages/farmacia/FarmaciaPedidosPage.jsx
```

Feature:

```txt
src/features/farmacia/pedidos/
```

Componentes partilhados:

```txt
src/features/farmacia/shared/pedidos/
```

Função:

* listar pedidos pendentes;
* validar pedidos;
* rejeitar pedidos;
* consultar detalhes necessários para decisão.

---

## 8.4 Regularizações Farmácia

```txt
/farmacia/regularizacoes
```

Página:

```txt
src/pages/farmacia/FarmaciaRegularizacoesPage.jsx
```

Feature:

```txt
src/features/farmacia/regularizacoes/
```

Função:

* consultar regularizações pendentes;
* consultar histórico;
* acompanhar sinal de regularizações.

---

## 8.5 Histórico Farmácia

```txt
/farmacia/historico
```

Página:

```txt
src/pages/farmacia/FarmaciaHistoricoPage.jsx
```

Feature:

```txt
src/features/farmacia/historico/
```

Função:

* consultar histórico de pedidos validados, rejeitados ou cancelados;
* aplicar filtros.

---

## 9. Área Sistema/Admin

Prefixo:

```txt
/system
```

Roles permitidas:

```txt
ADMIN
```

Guard recomendado:

```txt
RequireAuth + RequireRole
```

---

## 9.1 Home Sistema/Admin

```txt
/system
```

Página:

```txt
src/pages/system/SystemHomePage.jsx
```

Função:

* entrada da área administrativa;
* acesso a health, utilizadores e manutenção.

---

## 9.2 Utilizadores

```txt
/system/users
```

Página:

```txt
src/pages/system/SystemUsersPage.jsx
```

Feature:

```txt
src/features/system/users/
```

Função:

* listar utilizadores;
* criar utilizador;
* editar utilizador;
* alterar password;
* ativar/desativar utilizador;
* remover utilizador inativo.

---

## 9.3 Manutenção

```txt
/system/manutencao
```

Página:

```txt
src/pages/system/SystemManutencaoPage.jsx
```

Feature:

```txt
src/features/system/manutencao/
```

Função:

* listar jobs;
* pré-visualizar jobs;
* executar jobs após preview;
* mostrar resultados.

Atenção:

```txt
Esta área é sensível.
Alguns jobs alteram ou removem dados reais.
```

---

## 10. Not Found

```txt
*
```

Página:

```txt
src/pages/NotFoundPage.jsx
```

Função:

* mostrar página 404;
* orientar utilizador para regressar a uma área válida.

---

## 11. Navegação principal

A navegação principal está ligada ao layout:

```txt
src/shared/layouts/AppShell/
```

O `AppShell` deve:

* mostrar marca;
* mostrar navegação conforme role;
* mostrar sessão atual;
* renderizar conteúdo via `Outlet`;
* incluir aviso de sessão inativa quando aplicável.

---

## 12. Navegação Santa Casa

Configuração:

```txt
src/features/santacasa/shared/config/santaCasaNavigation.config.js
```

Itens atuais:

```txt
/santacasa
/santacasa/dashboard
/santacasa/utentes
/santacasa/operacao
/santacasa/pedidos
/santacasa/regularizacoes
/santacasa/historico
```

---

## 13. Redirects por role

Regras esperadas:

| Role        | Home principal |
| ----------- | -------------- |
| `ADMIN`     | `/system`      |
| `SANTACASA` | `/santacasa`   |
| `FARMACIA`  | `/farmacia`    |

Se uma role tentar aceder a uma área não permitida, deve ser redirecionada para a sua home principal ou receber estado de acesso negado, conforme o comportamento definido nos guards.

---

## 14. Regras para criar nova rota

Quando criares uma nova rota:

1. criar página em `src/pages`;
2. criar feature em `src/features`, se houver lógica própria;
3. adicionar rota em `src/app/router.jsx`;
4. aplicar `RequireAuth`, se for protegida;
5. aplicar `RequireRole`, se for limitada por role;
6. adicionar item de navegação se fizer sentido;
7. adicionar endpoint em `endpoints.js`, se usar API;
8. atualizar documentação:

   * `ROUTES.md`;
   * `API_CONTRACT.md`, se houver API;
   * `ARCHITECTURE.md`, se mudar estrutura.

---

## 15. Regras para alterar rota existente

Antes de alterar uma rota:

* verificar se existem links internos;
* verificar redirects antigos;
* verificar permissões;
* verificar navegação;
* verificar páginas que usam `Navigate`;
* verificar documentação;
* testar manualmente com cada role.

---

## 16. Regras para remover rota

Antes de remover uma rota:

* confirmar que já não é usada;
* criar redirect temporário se houver risco de links antigos;
* remover item de navegação;
* remover página, se ficar sem uso;
* remover feature apenas se não for usada noutro local;
* atualizar documentação.

---

## 17. Rotas e backend

As rotas frontend não precisam de ter o mesmo nome dos endpoints backend.

Exemplo:

```txt
Frontend: /santacasa/operacao
Backend:  /api/santacasa/utentes/:utenteId/receitas
Backend:  /api/santacasa/utentes/:utenteId/sem-receita
Backend:  /api/santacasa/utentes/:utenteId/extras
```

A rota frontend representa a experiência de utilização.

O endpoint backend representa o recurso técnico.

---

## 18. Segurança

A proteção por rota no frontend não substitui a segurança do backend.

Mesmo que o frontend esconda uma página, o backend deve continuar a validar:

* sessão;
* role;
* permissões;
* estados;
* regras de negócio.

Regra:

```txt
Nunca confiar apenas no frontend para proteger dados.
```

---

## 19. Checklist manual de rotas

Depois de alterar rotas, testar:

* [ ] `/login`
* [ ] `/`
* [ ] `/santacasa`
* [ ] `/santacasa/dashboard`
* [ ] `/santacasa/utentes`
* [ ] `/santacasa/operacao`
* [ ] `/santacasa/pedidos`
* [ ] `/santacasa/regularizacoes`
* [ ] `/santacasa/historico`
* [ ] `/farmacia`
* [ ] `/farmacia/dashboard`
* [ ] `/farmacia/pedidos`
* [ ] `/farmacia/regularizacoes`
* [ ] `/farmacia/historico`
* [ ] `/system`
* [ ] `/system/users`
* [ ] `/system/manutencao`
* [ ] rota inexistente mostra 404

---

## 20. Checklist por role

### ADMIN

* [ ] entra em `/system`;
* [ ] entra em `/system/users`;
* [ ] entra em `/system/manutencao`;
* [ ] entra em `/santacasa`;
* [ ] entra em `/farmacia`.

### SANTACASA

* [ ] entra em `/santacasa`;
* [ ] entra em páginas da Santa Casa;
* [ ] não entra em `/farmacia`;
* [ ] não entra em `/system`.

### FARMACIA

* [ ] entra em `/farmacia`;
* [ ] entra em páginas da Farmácia;
* [ ] não entra em `/santacasa`;
* [ ] não entra em `/system`.

### Sem sessão

* [ ] não entra em rotas protegidas;
* [ ] é enviado para `/login`.

---

## 21. Anti-padrões a evitar

Evitar:

* criar rota sem guard quando deve ser protegida;
* criar rota protegida sem role;
* duplicar rotas equivalentes sem redirect;
* deixar páginas órfãs;
* ter links para rotas removidas;
* colocar lógica pesada no router;
* usar strings de rotas espalhadas sem necessidade;
* alterar URL pública sem atualizar documentação.

---

## 22. Melhorias futuras

Melhorias possíveis:

* centralizar paths frontend em ficheiro `routes.config.js`;
* adicionar Error Boundary ao router;
* adicionar lazy loading por página;
* adicionar testes de guards;
* adicionar testes de redirects;
* adicionar breadcrumbs;
* documentar fluxos por role com screenshots, quando a UI estiver estável.

---

## 23. Resumo

As rotas atuais estão organizadas por área:

```txt
/login
/santacasa/*
/farmacia/*
/system/*
```

A separação por role está correta para esta fase.

O ponto mais importante a manter é:

```txt
rotas protegidas por auth + role
endpoints protegidos pelo backend
documentação atualizada sempre que URLs mudarem
```
