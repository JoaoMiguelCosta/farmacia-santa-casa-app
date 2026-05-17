export const SYSTEM_HEALTH_CONFIG = Object.freeze({
  header: {
    eyebrow: "Ligação ao backend",
    title: "Estado dos serviços",
    description:
      "Confirma se o frontend está a comunicar corretamente com a API.",
  },

  services: [
    {
      key: "api",
      title: "API Geral",
      description: "Estado principal do backend.",
    },
    {
      key: "santacasa",
      title: "Santa Casa",
      description: "Rotas operacionais da Santa Casa.",
    },
    {
      key: "farmacia",
      title: "Farmácia",
      description: "Rotas operacionais da Farmácia.",
    },
  ],

  status: {
    online: "Online",
    offline: "Offline",
    loading: "A verificar...",
  },

  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",
  },

  states: {
    loadingTitle: "A verificar serviços...",
    loadingDescription: "Aguarda enquanto a ligação ao backend é testada.",
    emptyTitle: "Sem serviços configurados.",
    emptyDescription:
      "Quando existirem serviços configurados, o estado aparece aqui.",
  },
});
