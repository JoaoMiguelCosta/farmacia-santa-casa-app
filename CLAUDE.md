# CLAUDE.md — Farmácia Santa Casa V2

## 1. Contexto geral do projeto

Este projeto chama-se **Farmácia Santa Casa V2**.

É uma aplicação web operacional para gerir o fluxo entre:

- Santa Casa
- Farmácia
- Administração / Sistema

O objetivo é permitir que a Santa Casa gira utentes, medicação, pedidos e regularizações, e que a Farmácia valide pedidos, acompanhe histórico, trate regularizações e consulte informação operacional.

Esta app não deve ser tratada como uma landing page nem como uma demo visual. É uma ferramenta operacional real.

Prioridades absolutas:

1. Manter a lógica funcional correta.
2. Não quebrar contratos com o backend.
3. Manter código limpo, simples e sustentável.
4. Usar UI clara, clínica, profissional e fácil para utilizadores de várias idades.
5. Fazer refatorações pequenas, controladas e validáveis.
6. Nunca alterar endpoints, payloads, enums, rotas, nomes internos ou comportamento sem pedido explícito.

---

## 2. Stack principal

### Frontend

- React
- Vite
- JavaScript
- CSS Modules
- React Router
- Hooks personalizados
- Configs para textos visíveis
- Utils para lógica pura

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL
- JWT/cookies
- Vitest
- Supertest
- node-cron
- Timezone: `Europe/Lisbon`

---

## 3. Estilo de resposta esperado

Responder sempre em **Português de Portugal**.

Formato preferido:

- Começar com `TL;DR`.
- Ser direto e prático.
- Usar bullets curtas.
- Não elogiar desnecessariamente.
- Apontar más práticas e riscos técnicos claramente.
- Explicar decisões técnicas quando forem relevantes.
- Entregar código completo pronto a colar.
- Quando criar novos ficheiros/pastas, incluir comandos PowerShell.

O utilizador é iniciante em programação web, por isso as respostas devem ser claras, mas sem simplificar ao ponto de esconder problemas técnicos.

---

## 4. Regra crítica sobre ficheiros

Quando for pedido para alterar código:

- Entregar sempre os ficheiros completos.
- Não entregar apenas excertos, salvo pedido explícito.
- Manter nomes de ficheiros existentes.
- Se forem sugeridos novos ficheiros ou pastas, incluir comandos PowerShell.
- Não avançar com grandes refatorações sem dividir em lotes pequenos.

Exemplo de comandos PowerShell quando criares ficheiros:

```powershell
New-Item -ItemType Directory -Force "frontend/src/features/system/home/components/SystemHomePageContent"
New-Item -ItemType File -Force "frontend/src/features/system/home/components/SystemHomePageContent/SystemHomePageContent.jsx"
New-Item -ItemType File -Force "frontend/src/features/system/home/components/SystemHomePageContent/SystemHomePageContent.module.css"
```

---

## 5. Direção visual global

A direção visual global é:

## Clinic Premium Operacional

A UI deve parecer:

- Clínica
- Institucional
- Clara
- Calma
- Profissional
- Confiável
- Operacional
- Legível para pessoas de várias idades

Preferir:

- Fundos claros
- Cards limpos
- Bordas suaves
- Sombras controladas
- Tipografia forte mas legível
- Botões grandes e claros
- Estados vazios úteis
- Filtros simples
- Tabelas e listas fáceis de ler
- Layouts responsivos
- Hierarquia visual objetiva

Evitar:

- UI demasiado escura
- Neon
- Gradientes decorativos exagerados
- Glassmorphism pesado
- Sombras agressivas
- Baixo contraste
- Botões pequenos
- Layouts demasiado “startup”
- Efeitos visuais que prejudiquem leitura
- Redesigns desnecessários

---

## 6. Cores funcionais por domínio

Na área operacional da Santa Casa:

### Medicação Habitual

Tom visual:

- Olive / sage
- Calmo
- Base de sugestão/autocomplete

Representa medicamentos normalmente usados pelo utente.

### Receitas / Medicamentos com receita

Tom visual:

- Verde / teal clínico

Representa medicamentos associados a receita.

### Medicamentos não sujeitos a receita médica

Tom visual:

- Azul clínico

Representa medicamentos que não exigem receita.

### Vendas Suspensas

Tom visual:

- Âmbar controlado

Representa medicamentos que exigem receita, mas ainda não têm receita disponível.

---

## 7. Terminologia visível obrigatória

Na UI, usar esta terminologia:

### Correto

- `Medicamentos com receita`
- `Medicamentos não sujeitos a receita médica`
- `Medicamentos para Venda Suspensa`
- `Vendas Suspensas`
- `Venda Suspensa`
- `Vendas suspensas em aberto`
- `Venda suspensa por regularizar`
- `Total`
- `Dispensada`
- `Em pedido`
- `Para regularizações`

### Evitar na UI

- `Sem Receita`
- `Medicamento sem receita`
- `Medicamentos sem receita`
- `Extras`
- `Extra`
- `Extras em aberto`
- `Regularizada` dentro da lista operacional de Vendas Suspensas
- `Já usada`

Importante:

- Esta regra é apenas para texto visível na UI.
- Não alterar nomes internos, enums, endpoints, chaves técnicas, payloads ou estrutura sem pedido explícito.

---

## 8. Regra funcional sobre Vendas Suspensas

No projeto, “Vendas Suspensas” significa:

- A Santa Casa adiciona medicamentos que o utente precisa.
- Esses medicamentos exigem receita.
- No momento ainda não existe receita disponível.
- A Santa Casa não faz a venda suspensa.
- Quem faz ou regulariza a venda suspensa é a Farmácia.
- A regularização acontece depois, quando surgir receita compatível.

Na UI da Santa Casa:

- Não apresentar Vendas Suspensas como se já estivessem regularizadas.
- Não sugerir que a Santa Casa dispensou o medicamento.
- Evitar linguagem ambígua.
- Preferir:
  - `Total`
  - `Dispensada`
  - `Em pedido`

---

## 9. Regras funcionais principais

### Utentes

Estados principais:

- `ATIVO`
- `ARQUIVADO`
- `TODOS`

Regras:

- Arquivar é soft delete.
- Não remover definitivamente utentes se existirem dependências.
- Mostrar sempre nome e número de utente quando for relevante.

### Receitas

Regras:

- Uma receita tem pelo menos um medicamento associado.
- As linhas de receita têm validade.
- A validade é válida até 23:59 do dia final.
- Linhas podem estar:
  - `ATIVA`
  - `EXPIRADA`

### Pedidos

Tipos de item:

- `COM_RECEITA`
- `SEM_RECEITA`
- `EXTRA`

Estados principais:

- `PENDENTE`
- `VALIDADO`
- `REJEITADO`
- `CANCELADO_POR_EXPIRACAO`

Regras importantes:

- Um pedido pode ser aceite mesmo contendo itens expirados.
- Itens expirados ficam cancelados por expiração.
- Não cancelar automaticamente o pedido inteiro só porque um item expirou.
- A Santa Casa deve conseguir perceber no histórico que determinado item foi cancelado por expiração.

---

## 10. Arquitetura frontend esperada

As páginas em `src/pages` devem ser finas.

Exemplo correto:

```jsx
import FarmaciaDashboardPageContent from "../../features/farmacia/dashboard/components/FarmaciaDashboardPageContent/FarmaciaDashboardPageContent";

export default function FarmaciaDashboardPage() {
  return <FarmaciaDashboardPageContent />;
}
```

Estrutura geral esperada:

```txt
frontend/src/
├─ pages/
│  ├─ santacasa/
│  ├─ farmacia/
│  └─ system/
│
├─ features/
│  ├─ santacasa/
│  ├─ farmacia/
│  └─ system/
│
├─ shared/
│  ├─ api/
│  ├─ hooks/
│  ├─ layouts/
│  ├─ ui/
│  └─ utils/
│
└─ components/
```

---

## 11. Organização recomendada por componente

Cada componente relevante deve ter pasta própria:

```txt
ComponentName/
├─ ComponentName.jsx
├─ ComponentName.module.css
├─ useComponentName.js
├─ componentName.utils.js
└─ componentName.config.js
```

Nem todos os ficheiros são obrigatórios.

Criar apenas quando houver necessidade real.

### JSX

O JSX deve:

- Renderizar UI.
- Ter pouca lógica.
- Não conter textos longos hardcoded.
- Não conter cálculos complexos.
- Não conter transformação pesada de dados.

### Hooks

Hooks devem conter:

- Estado.
- Efeitos.
- Fetch.
- Handlers.
- Preparação de view model quando fizer sentido.

### Utils

Utils devem conter:

- Funções puras.
- Cálculos.
- Agrupamentos.
- Filtros.
- Ordenações.
- Formatação lógica.

### Configs

Configs devem conter:

- Títulos
- Labels
- Descrições
- Textos visíveis
- Ações
- Estados vazios
- Mensagens de erro
- Definições de cards

---

## 12. CSS Modules

Usar sempre CSS Modules.

Não usar CSS global salvo quando já existir no projeto para tokens/layouts globais.

CSS deve ser:

- Claro
- Modular
- Responsivo
- Fácil de manter
- Sem duplicação exagerada

Preferir:

- `display: grid`
- `gap`
- `minmax`
- `clamp`
- `rem`
- `border`
- `box-shadow` subtil
- `transition` curta
- `focus-visible`

Evitar:

- `!important`
- Selectors demasiado profundos
- Hacks visuais frágeis
- Alturas fixas desnecessárias
- Layouts que quebram em mobile
- CSS gigantes sem organização
- Efeitos decorativos desnecessários

---

## 13. Micro-regra de texto visual

Manter espaçamento correto em labels com dois pontos.

Correto:

```txt
Total: 3
Em pedido: 2
Dispensada: 1
```

Errado:

```txt
Total:3
Em pedido:2
Dispensada:1
```

---

## 14. React — boas práticas

Usar:

- Componentes pequenos
- Props claras
- Naming explícito
- Separação de responsabilidades
- Estado derivado quando possível
- Hooks para lógica
- Utils para funções puras
- Configs para textos

Evitar:

- Ficheiros gigantes
- Componentes com múltiplas responsabilidades
- Fetch direto em componentes visuais
- Config misturada no JSX
- Lógica pesada dentro do render
- `setState` síncrono dentro de `useEffect` quando pode ser evitado
- `useMemo` ou `useCallback` sem benefício real
- Abstrações genéricas cedo demais

---

## 15. Shared vs feature local

Só colocar em `shared` se for verdadeiramente genérico.

Se um componente conhece domínio Santa Casa/Farmácia, deve ficar dentro de `features`.

Exemplo:

- `MedicamentoAutocomplete` conhece o domínio.
- Deve ficar em:
  - `src/features/santacasa/shared/components/MedicamentoAutocomplete`

Não colocar em `src/shared/ui` se não for realmente genérico.

Antes de extrair algo para shared, confirmar:

1. É usado em mais de uma feature?
2. Reduz duplicação real?
3. Não esconde regras de domínio?
4. O naming continua claro?
5. A alteração é pequena e validável?

---

## 16. Rotas frontend conhecidas

### Santa Casa

```txt
/santacasa
/santacasa/dashboard
/santacasa/operacao
/santacasa/pedidos
/santacasa/historico
/santacasa/regularizacoes
/santacasa/regularizacoes/utente/:utenteId
```

### Farmácia

```txt
/farmacia
/farmacia/dashboard
/farmacia/pedidos
/farmacia/pedidos/:pedidoId
/farmacia/historico
/farmacia/historico/:pedidoId
/farmacia/regularizacoes
/farmacia/regularizacoes/utente/:utenteId
/farmacia/regularizacoes/historico/:utenteId
```

### Sistema

```txt
/sistema
/sistema/utilizadores
/sistema/manutencao
/sistema/estado-servicos
```

---

## 17. Estado atual das features

### Santa Casa — Operação

Estado: fechado por agora.

Inclui:

- Seleção de utente
- Medicação habitual
- Receitas
- Medicamentos não sujeitos a receita médica
- Vendas Suspensas
- Criação de pedido geral
- Autocomplete de medicamentos
- UI clinic premium operacional

### Santa Casa — Pedidos

Estado: fechado por agora.

Inclui:

- Lista de pedidos
- Detalhe
- Histórico operacional
- Estados e avisos claros

### Santa Casa — Histórico

Estado: fechado por agora.

Inclui:

- Filtros
- Cards
- Detalhe
- Rastreabilidade
- Itens cancelados por expiração

### Santa Casa — Regularizações

Estado: fechado por agora.

Inclui:

- Tabs Pendentes/Histórico
- Agrupamento por utente
- Ver mais/ver menos
- Detalhe por utente
- Voltar mantém tab correta

### Farmácia — Dashboard

Estado: fechado por agora.

Foi alinhado visualmente com o Dashboard da Santa Casa, adaptado ao contexto da Farmácia.

### Farmácia — Home

Estado: fechado por agora.

Usa estrutura equivalente à Home da Santa Casa, adaptada ao contexto da Farmácia.

### Farmácia — Pedidos

Estado: fechado por agora.

Inclui:

- Lista de pendentes
- Cards por utente
- Detalhe
- Validade visível
- Itens expirados
- Ações de validar/rejeitar

### Farmácia — Histórico

Estado: fechado por agora.

Inclui:

- Filtros
- Lista
- Detalhe
- Voltar mantém estado/filtro

### Farmácia — Regularizações

Estado: fechado por agora.

Inclui:

- Tabs Pendentes/Histórico
- Agrupamento por utente
- Agrupamento por medicamento
- Soma de quantidades iguais em pedidos diferentes
- Páginas de detalhe por utente
- Voltar com tab correta

### Sistema

Estado: próxima grande área de refatoração visual e estrutural.

Objetivo:

- Aplicar a mesma metodologia usada em Santa Casa e Farmácia.
- Manter visual clinic premium operacional.
- Refatorar por lotes pequenos.
- Páginas finas.
- Textos em config.
- Lógica em hooks/utils.
- CSS Modules.
- Sem alterar backend/rotas/lógica sem necessidade.

---

## 18. AppShell e layout global

Existem componentes globais em `shared/layouts`.

Componentes importantes:

- `AppHeader`
- `AppPrimaryNav`
- `AppSectionNav`
- `AppSessionBar`

Regras:

- Não duplicar headers por feature.
- Não criar navegação paralela sem necessidade.
- Usar layout global existente.
- Manter navegação consistente entre Santa Casa, Farmácia e Sistema.

---

## 19. Padrão para listas operacionais

Listas operacionais devem usar:

- Cards por entidade
- Informação agrupada
- Hierarquia clara
- Ações bem visíveis
- Estados vazios úteis
- “Ver mais/ver menos” quando houver muitos itens

Evitar:

- Tabelas largas sem necessidade
- Informação toda ao mesmo nível
- Badges em excesso
- Repetição visual
- Scroll horizontal fraco

---

## 20. Padrão para métricas

Cards de métricas devem ter:

- Label curta
- Valor forte
- Descrição curta, se útil
- Link apenas se a métrica levar a uma área relevante
- Tom visual discreto

Evitar cards decorativos sem valor operacional.

---

## 21. Estados vazios

Estados vazios devem explicar o que está a acontecer.

Bom exemplo:

```txt
Ainda não existem pedidos pendentes para este utente.
```

Mau exemplo:

```txt
Sem dados.
```

---

## 22. Estados de erro

Erros devem:

- Ser claros
- Ser humanos
- Não expor stack traces
- Explicar ação possível quando aplicável

Exemplo:

```txt
Não foi possível carregar os pedidos. Tenta novamente.
```

---

## 23. Acessibilidade

Manter atenção a:

- `aria-label`
- `aria-live`
- Botões com texto claro
- Estados disabled compreensíveis
- `focus-visible`
- Contraste suficiente
- Navegação por teclado

Não sacrificar acessibilidade por estética.

---

## 24. Responsividade

Todas as features devem funcionar bem em:

- Desktop
- Tablet
- Mobile

A UI operacional deve manter:

- Botões clicáveis
- Texto legível
- Cards sem overflow
- Tabelas adaptadas
- Filtros usáveis
- Espaçamento confortável

---

## 25. Backend — cuidado

Não alterar backend sem pedido explícito.

Quando for necessário mexer:

- Ler validators
- Ler services
- Ler controllers/routes
- Ler testes existentes
- Preservar payloads
- Preservar enums
- Preservar contratos do frontend
- Criar ou atualizar testes

---

## 26. Jobs backend conhecidos

Jobs relevantes:

- Expiração de receitas
- Higiene
- Purge de histórico

Agendamentos conhecidos:

- Receitas: diário às 03h
- Higiene: mensal, dia 1, 03h
- Purge history: mensal, dia 1, 03h

Timezone:

```txt
Europe/Lisbon
```

---

## 27. Alertas

Existem alertas operacionais.

Exemplos:

- Pedido enviado
- Regularização parcial
- Regularização total
- Item cancelado por expiração, quando aplicável

Na UI, alertas devem ser claros, úteis e não vagos.

---

## 28. Regras sobre tabs, filtros e URL

Quando uma página tem tabs/filtros via URL, manter comportamento existente.

Exemplos:

- Voltar do detalhe para histórico deve preservar filtro.
- Voltar de regularizações deve preservar tab.
- Se uma página abre por defeito em `Pendentes`, não adicionar query string desnecessária.
- Só usar query params quando forem necessários para preservar estado explícito.

---

## 29. Erros já encontrados e padrões a evitar

### setState síncrono em useEffect

Evitar este padrão quando for possível derivar estado:

```jsx
useEffect(() => {
  setActiveTab(requestedTab);
}, [requestedTab]);
```

Preferir:

- Estado derivado da URL
- Inicialização correta
- Handlers controlados
- `requestAnimationFrame` ou timeout apenas se necessário

### Export default em falta

Garantir que componentes `PageContent` têm `export default` quando a página importa default.

### Filename too long no Windows

Evitar estruturas demasiado profundas como:

```txt
components/A/components/B/components/C/components/D
```

Preferir estrutura mais plana.

---

## 30. Git

Antes de grandes alterações:

```powershell
git status
```

Não fazer commits automaticamente sem pedido explícito.

Se houver erro de filename too long:

```powershell
git config --global core.longpaths true
```

Evitar criar estruturas de pastas demasiado profundas.

---

## 31. Comandos comuns

### Frontend

```powershell
cd frontend
npm install
npm run dev
npm run lint
npm run build
```

### Testes

```powershell
npm test
```

ou:

```powershell
npm run test
```

### Git após lote validado

```powershell
git status
git add -A
git commit -m "refactor: improve feature structure"
```

Não fazer commit sem autorização do utilizador.

---

## 32. Próxima área principal: Sistema

Ao trabalhar em `frontend/src/features/system`, seguir este fluxo:

1. Analisar estrutura atual.
2. Identificar páginas e componentes existentes.
3. Comparar com padrões já fechados em Santa Casa/Farmácia.
4. Refatorar uma página ou componente de cada vez.
5. Começar por `home`, se fizer sentido.
6. Depois seguir para:
   - utilizadores
   - manutenção
   - estado de serviços
7. Manter rotas existentes.
8. Manter lógica existente.
9. Aplicar clinic premium operacional.
10. Validar lint/build.

---

## 33. Não fazer

Não fazer:

- Redesign total sem pedido.
- Alterar backend sem necessidade.
- Alterar nomes técnicos por causa da UI.
- Mudar rotas.
- Mudar endpoints.
- Criar abstrações genéricas cedo demais.
- Criar CSS global novo sem motivo.
- Introduzir bibliotecas novas sem pedir.
- Reescrever features fechadas sem necessidade.
- Usar TypeScript se o projeto está em JavaScript.
- Converter tudo para outra arquitetura sem pedido.
- Criar ficheiros vazios decorativos.
- Adicionar comentários óbvios ao código.
- Usar emojis na UI operacional sem pedido.
- Fazer commits automaticamente.

---

## 34. Fazer sempre que relevante

Fazer:

- Manter ficheiros completos.
- Separar config/hook/utils/CSS.
- Preservar comportamento.
- Corrigir imports.
- Remover código morto.
- Melhorar naming.
- Reduzir duplicação.
- Validar responsividade.
- Validar loading/error/empty states.
- Validar build.
- Explicar riscos técnicos quando existirem.

---

## 35. Checklist antes de entregar alterações

Antes de considerar uma tarefa terminada:

- [ ] Página continua a abrir.
- [ ] Não há imports mortos.
- [ ] Não há texto visível importante hardcoded no JSX.
- [ ] CSS Module está importado corretamente.
- [ ] Componentes têm responsabilidade clara.
- [ ] Hooks não misturam UI visual.
- [ ] Utils são puras quando possível.
- [ ] Estados loading/error/empty estão tratados.
- [ ] Responsivo não quebrou.
- [ ] `npm run lint` passa.
- [ ] `npm run build` passa.
- [ ] Nenhuma rota foi alterada sem pedido.
- [ ] Nenhum endpoint/payload/enum foi alterado sem pedido.

---

## 36. Como responder quando o utilizador envia ficheiros

Quando o utilizador enviar ficheiros e pedir refatoração:

1. Identificar a feature.
2. Dar diagnóstico curto.
3. Propor o primeiro lote pequeno.
4. Entregar ficheiros completos.
5. Incluir comandos PowerShell se houver novos ficheiros/pastas.
6. Indicar comandos de validação.
7. Não avançar para o próximo lote sem confirmação se a alteração for grande.

Formato ideal:

```txt
TL;DR: o problema principal está em X. O melhor próximo passo é separar Y de Z sem alterar comportamento.

Vou mexer apenas em:
- ficheiro A
- ficheiro B
- novo ficheiro C

Não vou alterar:
- endpoints
- payloads
- rotas
- lógica funcional

Comandos PowerShell:
...

Ficheiros completos:
...
```

---

## 37. Regra final de prioridade

Se houver conflito entre estética, arquitetura, lógica funcional e contratos com backend, a prioridade é:

1. Lógica funcional.
2. Contratos com backend.
3. Arquitetura limpa.
4. Acessibilidade.
5. Responsividade.
6. Estética.

Nunca sacrificar funcionamento real por aparência visual.