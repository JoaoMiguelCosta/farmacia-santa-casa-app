# UI_COMPONENTS.md

Documentação dos componentes de UI do frontend **Farmácia Santa Casa**.

Este documento descreve os componentes partilhados, layouts reutilizáveis, padrões de composição, CSS Modules, estados visuais, acessibilidade e regras para criar novos componentes.

> Estado atual: projeto fechado — componentes shared estabilizados.

---

## 1. Objetivo

Este documento serve para definir:

- que componentes partilhados existem;
- quando usar cada componente;
- onde criar novos componentes;
- como organizar JSX e CSS Modules;
- como tratar loading, error e empty states;
- como manter consistência visual;
- que regras de acessibilidade seguir;
- que anti-padrões evitar.

---

## 2. Estrutura atual de UI

Os componentes reutilizáveis estão em:

```txt
src/shared/
├── layouts/
└── ui/
```

Estrutura atual:

```txt
src/shared/
├── layouts/
│   ├── AppShell/
│   └── AreaLanding/
└── ui/
    ├── BarcodeValue/
    ├── BrandMark/
    ├── Button/
    ├── ConfirmDialog/
    ├── DashboardMetricCard/
    ├── DashboardMetricGroup/
    ├── DashboardPriorityCard/
    ├── DataState/
    ├── FeedbackDialog/
    ├── FormField/
    ├── HomeActionCard/
    ├── OperationalDetailState/
    ├── PageHeader/
    └── SurfaceCard/
```

---

## 3. Regra principal

Componentes em `shared/` devem ser realmente reutilizáveis.

Regra prática:

```txt
Se só é usado por uma feature, fica dentro dessa feature.
Se é usado por várias áreas, pode ir para shared.
```

Exemplos:

```txt
shared/ui/Button                     ✅ reutilizável
shared/ui/FormField                  ✅ reutilizável
features/santacasa/utentes/UtentesList ✅ específico da feature
features/farmacia/shared/pedidos     ✅ partilhado dentro da área Farmácia
```

---

## 4. Diferença entre `shared/ui` e `shared/layouts`

### `shared/ui`

Para componentes genéricos de interface.

Exemplos:

- botões;
- cards;
- campos;
- estados de dados;
- diálogos;
- headers de página.

### `shared/layouts`

Para estruturas de layout reutilizáveis.

Exemplos:

```txt
AppShell
AreaLanding
```

---

## 5. Componentes `shared/ui`

---

## 5.1 Button

Local:

```txt
src/shared/ui/Button/
```

Responsabilidade:

- renderizar botões consistentes;
- suportar variantes visuais;
- suportar estados disabled/loading quando aplicável;
- evitar repetição de classes de botão.

Uso esperado:

```jsx
<Button type="submit">Guardar</Button>
```

Boas práticas:

- usar `type="button"` em botões que não submetem formulário;
- usar `type="submit"` dentro de formulários;
- não criar botões com `<div>`;
- não duplicar estilos de botão fora deste componente sem motivo.

---

## 5.2 ConfirmDialog

Local:

```txt
src/shared/ui/ConfirmDialog/
```

Responsabilidade:

- confirmar ações sensíveis;
- cancelar ações destrutivas;
- mostrar título, descrição e botões de ação.

Usar para:

- apagar/remover;
- rejeitar pedido;
- executar job;
- cancelar pedido;
- ações irreversíveis ou sensíveis.

Não usar para:

- mensagens simples de sucesso;
- estados de loading;
- feedback transitório.

Boas práticas:

- título claro;
- descrição objetiva;
- botão principal explícito;
- botão de cancelar sempre disponível;
- não executar ação destrutiva sem confirmação.

---

## 5.3 DataState

Local:

```txt
src/shared/ui/DataState/
```

Responsabilidade:

- mostrar estados de dados;
- loading;
- erro;
- vazio.

Usar quando uma listagem ou secção não tem dados prontos.

Estados comuns:

```txt
loading
error
empty
```

Exemplos:

- “A carregar utentes...”
- “Não foi possível carregar pedidos.”
- “Sem regularizações pendentes.”

Boas práticas:

- não repetir markup de loading em cada componente;
- usar mensagens vindas de config sempre que possível;
- manter texto claro para o utilizador.

---

## 5.4 FeedbackDialog

Local:

```txt
src/shared/ui/FeedbackDialog/
```

Responsabilidade:

- mostrar feedback após ações;
- sucesso;
- erro;
- informação.

Usar para:

- “Utente criado com sucesso.”
- “Pedido validado com sucesso.”
- “Ocorreu um erro inesperado.”

Boas práticas:

- feedback deve ser curto;
- erros técnicos devem ser convertidos para linguagem funcional;
- não expor stack traces;
- permitir fechar feedback.

---

## 5.5 FormField

Local:

```txt
src/shared/ui/FormField/
```

Responsabilidade:

- padronizar campos de formulário;
- mostrar label;
- mostrar hint;
- mostrar erro;
- manter estrutura acessível.

Usar em:

- criação de utente;
- criação de receita;
- criação de medicamento não sujeito a receita médica;
- criação de Venda Suspensa;
- gestão de utilizadores.

Boas práticas:

- cada campo deve ter label;
- erro deve ficar junto ao campo;
- hint deve ajudar, não repetir o label;
- usar `aria-invalid` quando houver erro;
- usar `aria-describedby` quando houver hint/erro.

---

## 5.6 PageHeader

Local:

```txt
src/shared/ui/PageHeader/
```

Responsabilidade:

- título da página;
- eyebrow;
- descrição;
- ações principais quando aplicável.

Usar no topo das páginas principais.

Exemplos:

- Santa Casa — Utentes;
- Farmácia — Pedidos;
- Sistema/Admin — Manutenção.

Boas práticas:

- cada página deve ter um header claro;
- evitar múltiplos headers principais na mesma página;
- textos devem vir de config quando fizer sentido.

---

## 5.7 SurfaceCard

Local:

```txt
src/shared/ui/SurfaceCard/
```

Responsabilidade:

- criar superfícies visuais consistentes;
- agrupar conteúdo;
- manter padrão de card.

Usar para:

- painéis;
- listas;
- blocos de dashboard;
- secções de formulário;
- caixas de detalhe.

Boas práticas:

- não usar cards em excesso;
- não aninhar muitos cards sem necessidade;
- manter hierarquia visual clara.

---

## 6. Componentes globais

---

## 6.1 BrandMark

Local:

```txt
src/shared/ui/BrandMark/
```

Responsabilidade:

- representar a marca Farmácia Santa Casa;
- manter consistência no header/login/layout.

Boas práticas:

- não duplicar marca manualmente noutros componentes;
- alterações visuais da marca devem passar por este componente;
- manter acessibilidade textual.

---

## 7. Layouts

---

## 7.1 AppShell

Local:

```txt
src/shared/layouts/AppShell/
```

Responsabilidade:

- estrutura principal da aplicação autenticada;
- header;
- navegação;
- sessão atual;
- área de conteúdo;
- `Outlet`;
- aviso de sessão inativa.

Usar para áreas protegidas.

Deve integrar:

- navegação por role;
- `AuthSessionBar`;
- `IdleSessionWarning`;
- layout consistente entre Santa Casa, Farmácia e Sistema/Admin.

Boas práticas:

- não colocar lógica específica de uma feature dentro do `AppShell`;
- manter o layout transversal;
- navegação deve respeitar role;
- conteúdo de página deve entrar via `Outlet`.

---

## 7.2 AreaLanding

Local:

```txt
src/shared/layouts/AreaLanding/
```

Responsabilidade:

- criar páginas de entrada por área;
- mostrar cartões de acesso;
- orientar o utilizador para secções principais.

Usar em:

- home da Santa Casa;
- home da Farmácia;
- home do Sistema/Admin;
- eventualmente home geral.

Boas práticas:

- links devem ser claros;
- cards devem apontar para rotas válidas;
- não misturar áreas sem necessidade.

---

## 8. Componentes específicos de feature

Componentes específicos devem ficar dentro da feature.

Exemplo:

```txt
src/features/santacasa/utentes/components/
src/features/santacasa/receitas/components/
src/features/farmacia/pedidos/components/
src/features/system/users/components/
```

Regra:

```txt
Componente específico do domínio fica na feature.
Componente reutilizável entre domínios pode ir para shared.
```

---

## 9. Quando mover para `shared/`

Mover um componente para `shared/` apenas quando:

- é usado por mais do que uma feature;
- não depende de dados específicos de uma feature;
- tem API de props genérica;
- não conhece endpoints;
- não conhece regras internas de domínio.

Exemplo bom:

```txt
Button
FormField
DataState
```

Exemplo mau:

```txt
UtenteCard em shared
ReceitaCreateForm em shared
FarmaciaPedidoCard em shared global
```

Nestes casos, devem ficar dentro da feature.

---

## 10. Estrutura recomendada de componente

Para componentes com estilo próprio:

```txt
ComponentName/
├── ComponentName.jsx
└── ComponentName.module.css
```

Exemplo:

```txt
Button/
├── Button.jsx
└── Button.module.css
```

Para componentes muito pequenos sem CSS próprio, pode existir apenas:

```txt
ComponentName.jsx
```

Mas, neste projeto, o padrão com pasta própria é preferível para componentes reutilizáveis.

---

## 11. CSS Modules

O projeto usa CSS Modules.

Padrão:

```jsx
import styles from "./ComponentName.module.css";
```

Uso:

```jsx
<div className={styles.root}>...</div>
```

Vantagens:

- classes com escopo local;
- menor risco de colisão;
- manutenção mais segura;
- componentes mais previsíveis.

---

## 12. Tokens globais

Tokens globais ficam em:

```txt
src/app/styles/tokens.css
```

Devem ser usados para:

- cores;
- espaçamento;
- sombras;
- raios;
- tipografia;
- superfícies;
- bordas.

Regra:

```txt
Antes de inventar valor novo, verificar se já existe token.
```

---

## 13. Estilo visual esperado

A UI deve manter uma estética de clínica premium:

- clara;
- profissional;
- calma;
- institucional;
- confiável;
- moderna;
- com contraste controlado;
- superfícies suaves;
- espaçamento confortável;
- boa legibilidade.

Evitar:

- visual demasiado pesado;
- cores agressivas;
- efeitos decorativos excessivos;
- inconsistência entre páginas;
- botões diferentes para a mesma ação;
- cards com estilos completamente diferentes sem motivo.

---

## 14. Naming de classes CSS

Preferir nomes semânticos:

```css
.root {
}
.header {
}
.content {
}
.footer {
}
.actions {
}
.title {
}
.description {
}
.list {
}
.item {
}
```

Evitar nomes vagos:

```css
.box {
}
.thing {
}
.wrapper2 {
}
.greenText {
}
.big {
}
```

Regra:

```txt
Nome da classe deve descrever função, não apenas aparência.
```

---

## 15. Variantes visuais

Quando um componente tiver variantes, preferir props claras.

Exemplo:

```jsx
<Button variant="primary" />
<Button variant="secondary" />
<Button variant="danger" />
```

Evitar criar componentes separados se a diferença for só visual:

```txt
PrimaryButton
SecondaryButton
DangerButton
```

Só criar componente novo se houver comportamento novo.

---

## 16. Estados visuais obrigatórios

Componentes interativos devem tratar:

- normal;
- hover;
- focus-visible;
- disabled;
- loading, se aplicável;
- erro, se aplicável.

Especialmente:

- botões;
- inputs;
- links;
- cards clicáveis;
- ações de listagem.

---

## 17. Acessibilidade

Regras mínimas:

- usar elementos semânticos;
- botões devem ser `<button>`;
- links de navegação devem ser `<a>`/`Link`;
- inputs devem ter label;
- estados de erro devem estar associados ao campo;
- ações só com ícone devem ter `aria-label`;
- focus visível nunca deve ser removido sem substituto;
- diálogos devem ter título claro;
- textos devem ter contraste suficiente.

---

## 18. Botões

Regras:

- ações de formulário usam `type="submit"`;
- ações normais usam `type="button"`;
- ações destrutivas devem ter variante visual clara;
- botões disabled não devem executar ação;
- botão em loading deve evitar duplo submit.

Exemplo:

```jsx
<Button type="submit" disabled={isSubmitting}>
  Guardar
</Button>
```

---

## 19. Links

Links de navegação devem usar `Link` do React Router quando forem rotas internas.

Evitar:

```jsx
<button onClick={() => navigate("/rota")}>
```

se a ação for apenas navegação.

Usar botão para ação.

Usar link para navegação.

---

## 20. Formulários

Formulários devem:

- validar no frontend para melhorar UX;
- enviar payload normalizado;
- mostrar erros por campo;
- respeitar disabled durante submissão;
- evitar duplo submit;
- resetar após sucesso quando fizer sentido.

A validação do frontend não substitui a validação do backend.

Regra:

```txt
Frontend valida para UX.
Backend valida para integridade.
```

---

## 21. Estados de dados

Listagens devem tratar:

- loading;
- erro;
- vazio;
- sucesso com dados.

Evitar renderizar lista vazia sem mensagem.

Padrão recomendado:

```txt
if loading -> DataState loading
if error -> DataState error
if empty -> DataState empty
else -> list
```

---

## 22. Diálogos de confirmação

Usar `ConfirmDialog` para ações como:

- remover utente;
- cancelar pedido;
- rejeitar pedido;
- executar job;
- remover utilizador.

A descrição deve explicar a consequência.

Para ações destrutivas, o texto deve ser explícito.

Exemplo:

```txt
Esta ação pode remover histórico antigo. Confirma apenas depois de reveres o preview.
```

---

## 23. Feedback

Usar `FeedbackDialog` ou feedback equivalente para:

- sucesso;
- erro;
- aviso;
- informação.

Mensagens devem ser curtas e funcionais.

Evitar mensagens técnicas como:

```txt
PrismaClientKnownRequestError
Cannot read properties of undefined
```

Converter para linguagem de utilizador.

---

## 24. Loading

Evitar bloquear a página inteira sem necessidade.

Padrões:

```txt
isLoading      → primeiro carregamento
isRefreshing   → atualização secundária
isSubmitting   → formulário
isDeleting     → remoção
isRunning      → job/ação sensível
```

Cada estado deve refletir a ação real.

---

## 25. Error

Erros devem ser tratados perto da zona onde acontecem.

Exemplos:

- erro ao carregar lista → zona da lista;
- erro ao submeter formulário → formulário/feedback;
- erro de sessão → AuthProvider;
- erro de permissão → guard ou feedback contextual.

---

## 26. Empty state

Cada lista importante deve ter empty state claro.

Exemplos:

```txt
Sem utentes encontrados.
Sem pedidos pendentes.
Sem regularizações pendentes.
Sem utilizadores encontrados.
```

Empty state deve dizer o que está vazio e, se útil, o que fazer a seguir.

---

## 27. Configs de texto

Textos longos, labels e mensagens devem ficar em ficheiros `*.config.js`.

Exemplo:

```txt
systemUsersPage.config.js
pedidosPage.config.js
receitasPage.config.js
```

Evitar hardcoded excessivo no JSX.

Aceitável no JSX:

- texto muito pequeno;
- texto altamente específico;
- texto temporário em desenvolvimento.

Preferível em config:

- títulos;
- descrições;
- labels;
- mensagens de erro;
- estados vazios;
- botões;
- textos de diálogo.

---

## 28. Componentes e domínio

Componentes não devem misturar domínio em excesso se forem reutilizáveis.

Exemplo incorreto:

```txt
Button conhece PedidoStatus
```

Exemplo correto:

```txt
PedidoCard conhece PedidoStatus
Button só conhece variant/disabled/onClick
```

---

## 29. Componentes grandes

Sinais de que um componente está grande demais:

- muitos blocos condicionais;
- muitas funções internas;
- muitos estados locais;
- várias secções não relacionadas;
- JSX difícil de ler;
- props demais.

Soluções:

- extrair subcomponentes;
- mover lógica para hook;
- mover transformações para utils;
- mover textos para config.

---

## 30. Props

Props devem ter nomes claros.

Bom:

```jsx
<ConfirmDialog
  isOpen={isOpen}
  title={title}
  description={description}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

Mau:

```jsx
<ConfirmDialog open={x} data={y} action={z} />
```

Evitar props genéricas como `data`, `item`, `value` quando o contexto não é claro.

---

## 31. Composition over configuration

Preferir composição quando o componente fica demasiado configurável.

Se um componente começa a ter props como:

```txt
showHeader
showFooter
showIcon
showBadge
showActions
layoutType
mode
kind
```

pode estar demasiado genérico.

Nesses casos, dividir ou compor componentes menores.

---

## 32. Responsividade

Componentes devem funcionar em:

- mobile;
- tablet;
- desktop.

Regras:

- evitar larguras fixas desnecessárias;
- usar `minmax`, `clamp`, `flex-wrap`, `grid`;
- garantir que botões não saem do ecrã;
- garantir que listas ficam legíveis;
- testar páginas principais em largura reduzida.

---

## 33. Tabelas vs cards

Neste projeto, cards/listas são geralmente mais adequados do que tabelas complexas, porque:

- funcionam melhor em mobile;
- suportam estados e ações;
- permitem hierarquia visual;
- evitam scroll horizontal.

Usar tabela apenas se a leitura tabular for realmente superior.

---

## 34. Ícones

Se forem adicionados ícones futuramente:

- não usar ícone sem texto em ações críticas;
- ícones decorativos devem ter `aria-hidden="true"`;
- botões só com ícone precisam de `aria-label`;
- manter estilo consistente.

---

## 35. Animações

Animações devem ser discretas.

Permitido:

- transições de hover;
- foco;
- entrada suave;
- feedback visual curto.

Evitar:

- animações longas;
- efeitos que atrasam tarefas;
- movimento excessivo;
- animações que prejudiquem legibilidade.

---

## 36. Anti-padrões a evitar

Evitar:

- duplicar botões personalizados em cada página;
- criar componentes globais específicos demais;
- pôr tudo em `shared/`;
- criar CSS global sem necessidade;
- usar `div` como botão;
- remover focus outline sem alternativa;
- hardcoded excessivo no JSX;
- estilos inline sem motivo;
- componentes enormes;
- props vagas;
- loading genérico para ações diferentes;
- mensagens técnicas para o utilizador.

---

## 37. Quando criar novo componente partilhado

Criar componente em `shared/ui` quando:

- é usado em várias features;
- resolve um padrão repetido;
- tem API genérica;
- não depende de regras específicas de domínio;
- ajuda a reduzir duplicação real.

Não criar se:

- só é usado uma vez;
- ainda não sabes se será reutilizado;
- a abstração vai complicar mais do que ajudar.

Regra:

```txt
Duplica uma vez se for simples.
Abstrai quando a repetição for real.
```

---

## 38. Checklist antes de criar componente

Antes de criar:

- [ ] já existe componente que resolve isto?
- [ ] é específico de uma feature?
- [ ] precisa de CSS Module?
- [ ] precisa de acessibilidade específica?
- [ ] os textos devem ir para config?
- [ ] há estados loading/error/disabled?
- [ ] o nome é claro?
- [ ] as props são simples?

---

## 39. Checklist antes de mover para shared

Antes de mover para `shared/`:

- [ ] é usado por mais do que uma feature?
- [ ] não depende de domínio?
- [ ] não importa APIs de feature?
- [ ] não importa configs específicas?
- [ ] tem props claras?
- [ ] o CSS é genérico?
- [ ] melhora manutenção?

Se a resposta for “não” a vários pontos, deixar na feature.

---

## 40. Checklist antes de commit

Antes de commit:

```bash
npm run lint
npm run build
npm audit
```

Confirmar:

- [ ] não há CSS global desnecessário;
- [ ] não há `dist/` no Git;
- [ ] não há `.env` no Git;
- [ ] componente está na pasta certa;
- [ ] classes CSS são claras;
- [ ] UI tem estados de loading/error/empty quando aplicável;
- [ ] ações interativas têm foco acessível;
- [ ] textos estão em config quando faz sentido.

---

## 41. Melhorias futuras recomendadas

Prioridade futura:

```txt
1. Adicionar testes para Button, FormField, DataState e ConfirmDialog
2. Rever acessibilidade de diálogos
3. Criar Error Boundary visual
```

---

## 42. Resumo

A base de UI está bem encaminhada.

Pontos fortes:

- CSS Modules;
- componentes reutilizáveis;
- layouts separados;
- configs de texto;
- separação entre feature e shared;
- padrão visual clínico claro.

Pontos a vigiar:

- não colocar componentes com lógica de domínio em `shared/`;
- manter acessibilidade;
- criar testes de componentes quando possível.

Regra final:

```txt
Shared só quando é realmente partilhado.
Feature quando é domínio.
CSS Module por componente.
Acessibilidade sempre.
```
