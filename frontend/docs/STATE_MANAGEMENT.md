# STATE_MANAGEMENT.md

Documentação de gestão de estado do frontend **Farmácia Santa Casa**.

Este documento descreve como o frontend gere estado global, estado local, persistência em `localStorage`, loading, erros, feedbacks e regras para futuras alterações.

> Estado atual: projeto em desenvolvimento.
> A aplicação usa Context API para estado global essencial e hooks locais para estado específico de cada feature.

---

## 1. Objetivo

Este documento serve para clarificar:

* que estados são globais;
* que estados devem ficar locais;
* como funciona a autenticação;
* como funciona o pedido em preparação;
* como usar `localStorage`;
* como tratar loading, erro e feedback;
* como evitar duplicação e crescimento desorganizado de estado.

---

## 2. Estratégia geral

A aplicação usa uma estratégia simples:

```txt
Context API para estado global essencial
useState/useReducer em hooks para estado de feature
localStorage apenas quando a persistência local é necessária
```

Não existe Redux, Zustand ou outra store externa.

Para o estado atual do projeto, isto é adequado.

---

## 3. Estados globais atuais

Existem dois estados globais principais:

```txt
AuthProvider
PedidoDraftProvider
```

Localização:

```txt
src/features/auth/context/AuthProvider.jsx
src/features/santacasa/pedidos/state/PedidoDraftProvider.jsx
```

Estes providers são montados no topo da aplicação em:

```txt
src/app/App.jsx
```

---

## 4. Auth state

Local:

```txt
src/features/auth/
```

Ficheiros principais:

```txt
context/AuthContext.js
context/AuthProvider.jsx
hooks/useAuth.js
components/RequireAuth.jsx
components/RequireRole.jsx
components/AuthHomeRedirect.jsx
hooks/useIdleLogout.js
state/authActivity.storage.js
```

---

## 5. Responsabilidades do AuthProvider

O `AuthProvider` deve gerir:

* utilizador atual;
* role atual;
* estado de carregamento inicial;
* login;
* logout;
* verificação de sessão;
* erros de autenticação;
* expiração de sessão;
* tratamento centralizado de `401` e `403`.

O `AuthProvider` não deve gerir:

* dados de utentes;
* dados de pedidos;
* dados de regularizações;
* estados visuais específicos de páginas;
* filtros de listagens.

---

## 6. useAuth

O hook:

```txt
src/features/auth/hooks/useAuth.js
```

deve ser a única forma normal de consumir autenticação.

Uso esperado:

```js
const { user, role, isAuthenticated, login, logout, handleAuthError } = useAuth();
```

Regras:

* não importar diretamente `AuthContext` fora do hook;
* não duplicar estado de utilizador noutras features;
* usar `handleAuthError` nos hooks que fazem chamadas à API;
* manter lógica de sessão centralizada.

---

## 7. Erros de autenticação

O `httpClient` marca erros `401` e `403` como erros de auth.

Fluxo esperado:

```txt
API request
  ↓
erro 401/403
  ↓
hook da feature chama handleAuthError(error)
  ↓
AuthProvider trata sessão/redirect/feedback
```

Regra:

```txt
Não repetir lógica de logout por 401 em cada feature.
```

---

## 8. Logout por inatividade

A aplicação tem lógica de inatividade em:

```txt
src/features/auth/hooks/useIdleLogout.js
src/features/auth/components/IdleSessionWarning/
src/features/auth/state/authActivity.storage.js
```

Objetivo:

* detetar inatividade;
* avisar o utilizador;
* terminar sessão quando necessário;
* sincronizar atividade local.

Esta lógica pertence à feature `auth`, não às páginas.

---

## 9. Pedido em preparação

Local:

```txt
src/features/santacasa/pedidos/state/
```

Ficheiros:

```txt
PedidoDraftContext.js
PedidoDraftProvider.jsx
usePedidoDraft.js
pedidoDraft.storage.js
```

Este estado representa o pedido que a Santa Casa está a preparar antes de enviar à Farmácia.

---

## 10. Responsabilidades do PedidoDraftProvider

O `PedidoDraftProvider` deve gerir:

* lista de itens no pedido em preparação;
* adicionar item;
* remover item;
* alterar quantidade;
* limpar pedido;
* persistir no `localStorage`;
* normalizar dados lidos do browser.

Não deve gerir:

* validação final de negócio;
* stock real definitivo;
* permissões;
* comunicação direta com backend;
* regras críticas que pertencem ao backend.

---

## 11. Persistência local do pedido

Chave usada:

```txt
farmacia-santa-casa:pedido-draft
```

Objetivo:

* preservar o pedido se a página for recarregada;
* evitar perda acidental de trabalho;
* permitir construir pedido a partir de várias zonas da Santa Casa.

---

## 12. Regras para localStorage

O `localStorage` deve ser usado com cuidado.

Pode ser usado para:

* pedido em preparação;
* atividade de sessão;
* preferências simples não sensíveis.

Não deve ser usado para:

* passwords;
* tokens;
* dados sensíveis permanentes;
* segredos;
* dados críticos que substituam o backend.

Regra:

```txt
localStorage é conveniência de UX, não fonte de verdade.
```

---

## 13. Normalização de dados persistidos

Dados vindos do `localStorage` devem ser sempre tratados como não confiáveis.

Devem ser validados antes de entrar no estado React.

Exemplos:

* garantir que é array;
* garantir que cada item tem `key`;
* garantir que tem `utenteId`;
* garantir que `quantidade` é número válido;
* limitar quantidade ao máximo permitido;
* descartar itens inválidos.

---

## 14. Fonte de verdade

A fonte de verdade final é sempre o backend.

O frontend pode guardar estado temporário, mas o backend decide:

* se o utente existe;
* se o utente está ativo;
* se a receita ainda tem saldo;
* se a Venda Suspensa ainda está pendente;
* se o pedido pode ser validado;
* se a regularização pode acontecer;
* se uma ação é permitida.

Regra:

```txt
Frontend melhora UX.
Backend garante integridade.
```

---

## 15. Estado local por feature

A maioria dos estados deve ficar dentro dos hooks da própria feature.

Exemplos:

```txt
useSantaCasaUtentes
useSantaCasaOperacao
useSantaCasaPedidosPendentes
useFarmaciaPedidos
useSystemUsers
useSystemManutencao
```

Estes hooks podem gerir:

* loading;
* refreshing;
* erro;
* feedback;
* filtros;
* paginação;
* item selecionado;
* diálogos;
* ações assíncronas.

---

## 16. Estado local por formulário

Formulários devem gerir o seu estado localmente ou através de hook específico.

Exemplos:

```txt
useUtenteCreateForm
useReceitaCreateForm
useSemReceitaCreateForm
useExtraCreateForm
```

Responsabilidades:

* valores dos campos;
* erros de validação frontend;
* normalização do payload;
* reset do formulário;
* submissão para callback recebido por props.

O formulário não deve chamar diretamente APIs se a feature já tiver um hook de ações.

---

## 17. Loading states

Padrão recomendado:

```txt
isLoading      → primeiro carregamento
isRefreshing   → atualização com dados já existentes
isSubmitting   → submissão de formulário
isDeleting     → remoção
isRunning      → execução de ação sensível
```

Evitar usar apenas um `loading` genérico para tudo quando a feature tem várias ações independentes.

---

## 18. Error states

Cada hook de feature pode ter:

```js
const [error, setError] = useState(null);
```

Uso:

* erros de carregamento de dados;
* falhas de API;
* erros não associados a um campo específico.

Erros de campo devem ficar perto do formulário.

---

## 19. Feedback states

Feedbacks devem ser usados para mensagens transitórias:

```js
{
  type: "success" | "error" | "info",
  message: "..."
}
```

Exemplos:

* utente criado;
* pedido enviado;
* pedido validado;
* erro ao carregar dados;
* job executado.

Boas práticas:

* limpar feedback ao mudar filtros importantes;
* limpar feedback ao abrir novo formulário;
* não confundir `error` estrutural com `feedback` temporário.

---

## 20. Dialog state

Diálogos devem guardar apenas o mínimo necessário.

Exemplos:

```js
const [utenteToDelete, setUtenteToDelete] = useState(null);
const [pedidoToReject, setPedidoToReject] = useState(null);
const [confirmDialog, setConfirmDialog] = useState(null);
```

Evitar estados duplicados como:

```txt
selectedItem
selectedItemId
isDialogOpen
```

se apenas um objeto já resolve.

---

## 21. Paginação

Estado comum:

```js
{
  total: 0,
  skip: 0,
  take: 50
}
```

Regras:

* `skip` começa em `0`;
* `take` deve ter fallback;
* mudar filtro deve repor `skip` para `0`;
* `hasPreviousPage` depende de `skip > 0`;
* `hasNextPage` depende de `skip + take < total`.

---

## 22. Filtros e pesquisa

Filtros devem ficar no hook da feature.

Padrão recomendado:

```js
const [filters, setFilters] = useState(defaultFilters);
```

Para pesquisa por texto, pode fazer sentido separar:

```txt
searchInput → texto no input
searchQuery → texto efetivamente aplicado
```

Isto evita requests a cada tecla quando não é necessário.

---

## 23. Recarregamento de dados

Hooks devem expor função clara:

```js
loadData()
refreshData()
```

Diferença:

* `loadData` pode ser usado para carregamento inicial;
* `refreshData` deve manter dados existentes e mostrar loading discreto.

Evitar duplicar lógica de fetch em vários sítios do mesmo hook.

---

## 24. useEffect

`useEffect` deve ser usado para:

* carregar dados iniciais;
* reagir a filtros/paginação;
* sincronizar estado externo;
* resetar formulário quando uma chave muda.

Cuidados:

* evitar dependências em falta;
* evitar dependências artificiais;
* cancelar/ignorar updates após unmount;
* não meter lógica complexa demais dentro do `useEffect`.

---

## 25. resetKey

Alguns formulários podem usar `resetKey` para forçar reset externo.

Regra recomendada:

```txt
resetKey muda → formulário limpa valores e erros
```

A forma correta é usar `useEffect`, não dependências artificiais em `useMemo`.

Exemplo:

```js
useEffect(() => {
  resetForm();
}, [resetKey]);
```

---

## 26. Quando criar Context

Criar Context apenas quando o estado precisa de ser consumido por várias zonas distantes da árvore React.

Bons candidatos:

* autenticação;
* pedido em preparação;
* tema global, se existir futuramente;
* preferências globais simples.

Maus candidatos:

* formulário de uma página;
* loading de uma lista;
* filtros locais;
* diálogo de uma feature;
* dados usados apenas por um componente.

Regra:

```txt
Se só uma página usa, não é global.
```

---

## 27. Quando criar hook dedicado

Criar hook dedicado quando:

* a lógica ultrapassa o JSX simples;
* há várias ações assíncronas;
* há loading/error/feedback;
* há filtros/paginação;
* há regras de normalização;
* a página começa a ficar difícil de ler.

Exemplo:

```txt
SantaCasaUtentesPage → useSantaCasaUtentes
```

---

## 28. Quando dividir hook grande

Dividir um hook quando ele começa a gerir fluxos independentes.

Sinais de alerta:

* muitas funções públicas;
* muitos estados booleanos;
* várias APIs diferentes;
* vários formulários;
* vários domínios funcionais;
* dificuldade em testar;
* dificuldade em explicar o hook em uma frase.

Exemplo de divisão futura possível:

```txt
useSantaCasaOperacaoActions
├── useReceitaActions
├── useSemReceitaActions
├── useExtraActions
├── usePedidoDraftActions
└── useRegularizacaoConfirmation
```

Não dividir cedo demais sem necessidade real.

---

## 29. Estado derivado

Sempre que possível, calcular estado derivado em vez de duplicar.

Exemplo:

```js
const hasItems = items.length > 0;
const isBusy = isLoading || isSubmitting || isDeleting;
```

Evitar guardar em estado algo que pode ser calculado com base noutro estado.

---

## 30. useMemo e useCallback

Usar `useMemo` e `useCallback` com critério.

Usar quando:

* evita recalcular operações pesadas;
* estabiliza props para componentes memoizados;
* evita recriar funções passadas a hooks dependentes.

Evitar:

* usar em tudo;
* usar para calar lint;
* adicionar dependências artificiais;
* esconder lógica que deveria ser simples.

---

## 31. Estado e backend

Depois de mutações importantes, a regra geral deve ser:

```txt
executar ação → mostrar feedback → recarregar dados relevantes
```

Exemplos:

* criar utente → recarregar lista;
* arquivar utente → recarregar lista;
* validar pedido → recarregar pedidos;
* executar job → recarregar jobs/resultado;
* enviar pedido → limpar draft e recarregar pendentes.

---

## 32. Atualização otimista

Ainda não é recomendada como padrão neste projeto.

Motivo:

* regras de negócio são sensíveis;
* backend pode bloquear ações por estado;
* stock/saldos podem mudar;
* regularizações têm regras próprias.

Preferir:

```txt
ação no backend → resposta OK → atualizar/recarregar frontend
```

---

## 33. Estados sensíveis

Alguns estados devem ser tratados com cuidado:

* pedidos pendentes;
* quantidades restantes;
* Vendas Suspensas;
* regularizações;
* utilizadores admin;
* jobs de manutenção;
* sessão.

Nestas zonas, evitar assumir que o estado local está sempre correto.

---

## 34. Anti-padrões a evitar

Evitar:

* guardar tudo em Context;
* duplicar estado derivado;
* guardar dados críticos só no `localStorage`;
* usar `localStorage` como fonte de verdade;
* ignorar erros de API;
* esconder erros sem feedback;
* misturar vários domínios num único hook;
* deixar formulários chamar API diretamente sem padrão;
* usar `useMemo` para resolver problemas de lógica;
* fazer atualização otimista em regras sensíveis sem necessidade.

---

## 35. Checklist ao criar novo estado

Antes de criar estado novo:

* [ ] este estado é mesmo necessário?
* [ ] pode ser derivado de outro estado?
* [ ] pertence à página, feature ou app inteira?
* [ ] precisa de persistência?
* [ ] contém dados sensíveis?
* [ ] precisa de cleanup?
* [ ] precisa de reset quando filtros mudam?
* [ ] precisa de feedback ao utilizador?

---

## 36. Checklist ao criar novo Context

Antes de criar novo Context:

* [ ] mais do que uma área precisa deste estado?
* [ ] passar props ficou realmente problemático?
* [ ] o estado é transversal?
* [ ] há ações globais associadas?
* [ ] não é apenas estado de formulário?
* [ ] não é apenas loading local?

Se a resposta for “não” à maioria, não criar Context.

---

## 37. Checklist antes de commit

Antes de commit:

```bash
npm run lint
npm run build
npm audit
```

Confirmar:

* [ ] não há warnings de hooks;
* [ ] estado global não foi criado sem necessidade;
* [ ] não há `.env` no Git;
* [ ] não há `dist/` no Git;
* [ ] erros são tratados;
* [ ] feedbacks são claros;
* [ ] mutações importantes recarregam dados necessários.

---

## 38. Melhorias futuras recomendadas

Prioridade futura:

```txt
1. Criar testes para pedidoDraft.storage.js
2. Criar testes para helpers de normalização
3. Criar testes para auth guards
4. Dividir hooks grandes quando começarem a travar evolução
5. Centralizar helpers repetidos de quantidades/paginação
6. Avaliar useReducer em fluxos complexos
```

---

## 39. Resumo

A gestão de estado atual é adequada para esta fase.

Pontos fortes:

* poucos estados globais;
* autenticação centralizada;
* pedido em preparação isolado;
* persistência local controlada;
* hooks por feature;
* loading/error/feedback tratados por domínio.

Pontos a vigiar:

* hooks grandes;
* duplicação de helpers;
* ausência de testes frontend;
* excesso futuro de Context;
* dependência de estado local para dados que o backend deve validar.

Regra final:

```txt
Global só quando é transversal.
Local sempre que possível.
Backend como fonte de verdade.
```
