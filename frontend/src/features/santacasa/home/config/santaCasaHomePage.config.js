import { SANTACASA_ROUTES } from "../../shared/config/santaCasaRoutes.config";

const OPERATION_META_ITEMS = Object.freeze([
  "Medicação habitual",
  "Receitas",
  "Medicamentos não sujeitos a receita médica",
  "Vendas Suspensas",
]);

const QUICK_ACTIONS = Object.freeze([
  Object.freeze({
    id: "utentes",
    title: "Utentes",
    description: "Criar, consultar e gerir os utentes da Santa Casa.",
    actionLabel: "Gerir utentes",
    to: SANTACASA_ROUTES.utentes,
    variant: "quick",
    tone: "sage",
  }),

  Object.freeze({
    id: "pedidos",
    title: "Pedidos",
    description:
      "Acompanhar pedidos enviados e gerir os que ainda estão pendentes.",
    actionLabel: "Ver pedidos",
    to: SANTACASA_ROUTES.pedidos,
    variant: "quick",
    tone: "blue",
  }),

  Object.freeze({
    id: "regularizacoes",
    title: "Regularizações",
    description:
      "Consultar regularizações associadas a medicamentos para Venda Suspensa.",
    actionLabel: "Ver regularizações",
    to: SANTACASA_ROUTES.regularizacoes,
    variant: "quick",
    tone: "gold",
  }),

  Object.freeze({
    id: "historico",
    title: "Histórico",
    description: "Consultar o resultado final dos pedidos enviados à Farmácia.",
    actionLabel: "Consultar histórico",
    to: SANTACASA_ROUTES.historico,
    variant: "quick",
    tone: "neutral",
  }),
]);

export const SANTACASA_HOME_PAGE = Object.freeze({
  header: Object.freeze({
    eyebrow: "Área Santa Casa",
    title: "Gestão diária da Santa Casa",
    description:
      "Acede à operação diária ou acompanha os processos enviados à Farmácia.",
  }),

  featured: Object.freeze({
    ariaLabel: "Ações principais da Santa Casa",

    operation: Object.freeze({
      eyebrow: "Ação principal",
      title: "Operação diária",
      description:
        "Seleciona um utente, gere a sua medicação e prepara o próximo pedido para a Farmácia.",
      actionLabel: "Iniciar operação",
      to: SANTACASA_ROUTES.operacao,
      metaItems: OPERATION_META_ITEMS,
      variant: "primary",
      tone: "green",
    }),

    dashboard: Object.freeze({
      eyebrow: "Consulta operacional",
      title: "Dashboard",
      description:
        "Consulta indicadores, totais e sinais operacionais relevantes da Santa Casa.",
      actionLabel: "Ver dashboard",
      to: SANTACASA_ROUTES.dashboard,
      variant: "secondary",
      tone: "sage",
    }),
  }),

  quickAccess: Object.freeze({
    eyebrow: "Navegação",
    title: "Acessos rápidos",
    description:
      "Consulta e gere as restantes áreas de trabalho da Santa Casa.",
    actions: QUICK_ACTIONS,
  }),
});
