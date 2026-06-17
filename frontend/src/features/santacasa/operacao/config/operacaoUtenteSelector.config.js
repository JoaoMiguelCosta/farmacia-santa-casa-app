// src/features/santacasa/operacao/config/operacaoUtenteSelector.config.js
export const OPERACAO_UTENTE_SELECTOR = Object.freeze({
  titleId: "operacao-utente-selector-title",

  title: "Selecionar utente",
  description: "Escolhe o utente para consultar ou registar dados.",

  field: {
    id: "operacao-utente-selector",
    label: "Utente",
    loadingHint: "A carregar utentes...",
    defaultHint: "Escolhe o utente para carregar os dados da operação.",
    emptyHint: "Ainda não existem utentes disponíveis.",
    placeholder: "Seleciona um utente",
    emptyPlaceholder: "Nenhum utente disponível",
    searchPlaceholder: "Pesquisar por nome ou n.º de utente...",
    noResultsLabel: "Nenhum utente encontrado.",
    optionNumberPrefix: "N.º utente",
  },
});
