// src/features/santacasa/shared/config/utenteSelector.config.js
export const UTENTE_SELECTOR = Object.freeze({
  titleId: "utente-selector-title",

  title: "Selecionar utente",
  description: "Escolhe o utente para consultar ou registar dados.",

  field: {
    id: "utente-selector",
    label: "Utente",
    loadingHint: "A carregar utentes...",
    defaultHint: "Escolhe o utente para carregar os dados da operação.",
    emptyHint: "Ainda não existem utentes disponíveis.",
    placeholder: "Seleciona um utente",
    emptyPlaceholder: "Nenhum utente disponível",
    searchPlaceholder: "Pesquisar por nome ou n.º de utente...",
    noResultsLabel: "Nenhum utente encontrado.",
  },
});
