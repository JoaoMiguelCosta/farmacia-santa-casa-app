// src/features/system/health/config/systemHealth.config.js

export const SYSTEM_HEALTH_CONFIG = Object.freeze({
  header: Object.freeze({
    eyebrow: "Administração",
    title: "Estado da plataforma",
    description:
      "Confirma se os serviços principais da Farmácia Santa Casa estão a responder corretamente.",
  }),

  services: Object.freeze([
    Object.freeze({
      key: "api",
      title: "Serviço principal",
      description: "Estado geral da ligação à plataforma.",
    }),

    Object.freeze({
      key: "santacasa",
      title: "Santa Casa",
      description: "Estado das funcionalidades usadas pela Santa Casa.",
    }),

    Object.freeze({
      key: "farmacia",
      title: "Farmácia",
      description: "Estado das funcionalidades usadas pela Farmácia.",
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
    loadingDescription: "Aguarda enquanto o estado da plataforma é verificado.",
    emptyTitle: "Sem serviços configurados.",
    emptyDescription:
      "Quando existirem serviços configurados, o estado aparece aqui.",
  }),
});
