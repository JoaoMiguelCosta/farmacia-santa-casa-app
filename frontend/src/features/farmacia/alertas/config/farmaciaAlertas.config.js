import { FARMACIA_ROUTES } from "../../shared/config/farmaciaRoutes.config";

export const FARMACIA_ALERTAS_CONFIG = Object.freeze({
  pollingIntervalMs: 30000,
  maxVisibleAlertas: 5,

  labels: Object.freeze({
    region: "Alertas operacionais da Farmácia",
    title: "Alertas operacionais",
    eyebrow: "Farmácia",
    empty: "Sem alertas pendentes",
    countSingular: "1 alerta pendente",
    countPlural: "alertas pendentes",
    createdAt: "Recebido em",
    hiddenNotice:
      "Existem mais alertas pendentes. Fecha os visíveis ou marca todos como vistos.",
  }),

  actions: Object.freeze({
    refresh: "Atualizar",
    refreshing: "A atualizar...",

    dismiss: "Marcar como visto",
    dismissing: "A fechar...",

    dismissAll: "Marcar todos como vistos",
    dismissingAll: "A fechar alertas...",

    openPedidos: "Abrir pedidos",
    openRegularizacoes: "Ver regularizações",
    openHistoricoRegularizacoes: "Ver histórico",
  }),

  errors: Object.freeze({
    load: "Não foi possível carregar os alertas da Farmácia.",
    dismiss: "Não foi possível fechar o alerta.",
    dismissAll: "Não foi possível fechar todos os alertas.",
  }),

  routes: Object.freeze({
    pedidos: FARMACIA_ROUTES.pedidos,
    regularizacoes: FARMACIA_ROUTES.regularizacoes,
    regularizacoesHistorico: FARMACIA_ROUTES.regularizacoesHistorico,
  }),

  types: Object.freeze({
    PEDIDO_ENVIADO: Object.freeze({
      label: "Novo pedido recebido",
      tone: "pedido",
      actionLabel: "Abrir pedidos",
      to: FARMACIA_ROUTES.pedidos,
    }),

    REGULARIZACAO_PARCIAL: Object.freeze({
      label: "Regularização parcial",
      tone: "regularizacaoParcial",
      actionLabel: "Ver regularizações",
      to: FARMACIA_ROUTES.regularizacoes,
    }),

    REGULARIZACAO_TOTAL: Object.freeze({
      label: "Regularização concluída",
      tone: "regularizacaoTotal",
      actionLabel: "Ver histórico",
      to: FARMACIA_ROUTES.regularizacoesHistorico,
    }),
  }),

  fallbackType: Object.freeze({
    label: "Alerta",
    tone: "default",
    actionLabel: "",
    to: "",
  }),
});
