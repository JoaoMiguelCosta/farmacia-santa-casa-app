export const FARMACIA_ALERTAS_CONFIG = Object.freeze({
  pollingIntervalMs: 30000,
  maxVisibleAlertas: 8,

  labels: {
    region: "Alertas operacionais da Farmácia",
    title: "Alertas da Farmácia",
    empty: "Sem alertas pendentes.",
    countSingular: "1 alerta pendente",
    countPlural: "alertas pendentes",
    createdAt: "Recebido em",
  },

  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",
    dismiss: "Marcar como visto",
    dismissing: "A fechar...",
    dismissAll: "Marcar todos como vistos",
    dismissingAll: "A fechar alertas...",
  },

  errors: {
    load: "Não foi possível carregar os alertas da Farmácia.",
    dismiss: "Não foi possível fechar o alerta.",
    dismissAll: "Não foi possível fechar todos os alertas.",
  },

  types: {
    PEDIDO_ENVIADO: {
      label: "Pedido",
      tone: "pedido",
    },

    REGULARIZACAO_PARCIAL: {
      label: "Regularização parcial",
      tone: "regularizacao",
    },

    REGULARIZACAO_TOTAL: {
      label: "Regularização concluída",
      tone: "regularizacao",
    },
  },

  fallbackType: {
    label: "Alerta",
    tone: "default",
  },
});
