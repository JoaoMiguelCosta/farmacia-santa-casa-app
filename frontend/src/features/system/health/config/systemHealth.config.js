// src/features/system/health/config/systemHealth.config.js

export const SYSTEM_HEALTH_CONFIG = Object.freeze({
  header: Object.freeze({
    eyebrow: "Diagnóstico",
    title: "Estado dos serviços",
    description:
      "Confirma se o frontend está a comunicar corretamente com os serviços principais do backend.",
  }),

  services: Object.freeze([
    Object.freeze({
      key: "api",
      title: "API Geral",
      description: "Estado principal do backend e da ligação base à API.",
    }),

    Object.freeze({
      key: "santacasa",
      title: "Santa Casa",
      description: "Validação das rotas operacionais da Santa Casa.",
    }),

    Object.freeze({
      key: "farmacia",
      title: "Farmácia",
      description: "Validação das rotas operacionais da Farmácia.",
    }),
  ]),

  labels: Object.freeze({
    checkedAt: "Última verificação",
    technicalDetails: "Detalhe técnico",
    unavailable: "Sem dados disponíveis.",
    error: "Erro",
  }),

  status: Object.freeze({
    online: "Online",
    offline: "Offline",
    loading: "A verificar...",
  }),

  actions: Object.freeze({
    refresh: "Atualizar",
    refreshing: "A atualizar...",
  }),

  states: Object.freeze({
    loadingTitle: "A verificar serviços...",
    loadingDescription: "Aguarda enquanto a ligação ao backend é testada.",
    emptyTitle: "Sem serviços configurados.",
    emptyDescription:
      "Quando existirem serviços configurados, o estado aparece aqui.",
  }),
});
