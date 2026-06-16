import { FARMACIA_ROUTES } from "../../shared/config/farmaciaRoutes.config";

const PEDIDOS_META_ITEMS = Object.freeze([
  "Pedidos pendentes",
  "Validação",
  "Rejeição",
  "Rastreabilidade",
]);

const QUICK_ACTIONS = Object.freeze([
  Object.freeze({
    id: "pedidos",
    title: "Pedidos",
    description:
      "Consultar pedidos enviados pela Santa Casa e decidir validação ou rejeição.",
    actionLabel: "Ver pedidos",
    to: FARMACIA_ROUTES.pedidos,
    variant: "quick",
    tone: "blue",
  }),

  Object.freeze({
    id: "regularizacoes",
    title: "Regularizações",
    description:
      "Acompanhar e consultar regularizações associadas a Vendas Suspensas.",
    actionLabel: "Ver regularizações",
    to: FARMACIA_ROUTES.regularizacoes,
    variant: "quick",
    tone: "gold",
  }),

  Object.freeze({
    id: "historico",
    title: "Histórico",
    description: "Consultar pedidos já validados ou rejeitados pela Farmácia.",
    actionLabel: "Consultar histórico",
    to: FARMACIA_ROUTES.historico,
    variant: "quick",
    tone: "neutral",
  }),
]);

export const FARMACIA_HOME_PAGE = Object.freeze({
  header: Object.freeze({
    eyebrow: "Área Farmácia",
    title: "Gestão operacional da Farmácia",
    description:
      "Acompanha pedidos, valida decisões e consulta regularizações associadas à Santa Casa.",
  }),

  featured: Object.freeze({
    ariaLabel: "Ações principais da Farmácia",

    pedidos: Object.freeze({
      eyebrow: "Ação principal",
      title: "Pedidos pendentes",
      description:
        "Consulta os pedidos enviados pela Santa Casa, valida medicamentos disponíveis ou rejeita quando necessário.",
      actionLabel: "Gerir pedidos",
      to: FARMACIA_ROUTES.pedidos,
      metaItems: PEDIDOS_META_ITEMS,
      metaAriaLabel: "Áreas incluídas",
      variant: "primary",
      tone: "green",
    }),

    dashboard: Object.freeze({
      eyebrow: "Consulta operacional",
      title: "Dashboard",
      description:
        "Consulta prioridades, indicadores e sinais operacionais relevantes da Farmácia.",
      actionLabel: "Ver dashboard",
      to: FARMACIA_ROUTES.dashboard,
      variant: "secondary",
      tone: "sage",
    }),
  }),

  quickAccess: Object.freeze({
    eyebrow: "Navegação",
    title: "Acessos rápidos",
    description: "Consulta e gere as restantes áreas de trabalho da Farmácia.",
    actions: QUICK_ACTIONS,
  }),
});
