import { formatDateTime } from "../../../../shared/utils/formatDate";
import { FARMACIA_DASHBOARD_PAGE } from "../config/farmaciaDashboardPage.config";

const UNKNOWN_LABEL = "—";

function toSafeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return number;
}

export function getPedidosPendentesCount(dashboard) {
  return toSafeNumber(dashboard?.pedidos?.pendentes);
}

export function getPedidosValidadosCount(dashboard) {
  return toSafeNumber(dashboard?.pedidos?.validados);
}

export function getPedidosRejeitadosCount(dashboard) {
  return toSafeNumber(dashboard?.pedidos?.rejeitados);
}

export function getRegularizacoesPendentesCount(dashboard) {
  return toSafeNumber(dashboard?.regularizacoes?.pendentes);
}

export function getRegularizacoesConcluidasCount(dashboard) {
  return toSafeNumber(dashboard?.regularizacoes?.historico);
}

export function getRegularizacoesEventosCount(dashboard) {
  return toSafeNumber(dashboard?.regularizacoes?.totalEventos);
}

export function getRegularizacoesUnidadesCount(dashboard) {
  return toSafeNumber(dashboard?.regularizacoes?.totalUnidades);
}

export function getLatestRegularizacaoAtLabel(dashboard) {
  return formatDateTime(dashboard?.regularizacoes?.latestEventoAt);
}

export function getLatestPedido(dashboard) {
  return dashboard?.latestPedido ?? null;
}

export function hasLatestPedido(dashboard) {
  return Boolean(getLatestPedido(dashboard));
}

export function getLatestPedidoNumberLabel(dashboard) {
  const pedido = getLatestPedido(dashboard);
  const numero = Number(pedido?.numero);

  if (!Number.isFinite(numero)) return UNKNOWN_LABEL;

  return `#${numero}`;
}

export function getLatestPedidoStatusLabel(dashboard) {
  const pedido = getLatestPedido(dashboard);

  return (
    FARMACIA_DASHBOARD_PAGE.status[pedido?.status] ||
    pedido?.status ||
    UNKNOWN_LABEL
  );
}

export function getLatestPedidoCreatedAtLabel(dashboard) {
  return formatDateTime(getLatestPedido(dashboard)?.createdAt);
}

export function getLatestPedidoDecisionAtLabel(dashboard) {
  const pedido = getLatestPedido(dashboard);

  const decidedAt =
    pedido?.validatedAt ||
    pedido?.rejectedAt ||
    pedido?.updatedAt ||
    pedido?.createdAt;

  return formatDateTime(decidedAt);
}

export function getLatestPedidoDecisionLabel(dashboard) {
  const pedido = getLatestPedido(dashboard);

  if (pedido?.status === "VALIDADO") {
    return FARMACIA_DASHBOARD_PAGE.labels.validatedAt;
  }

  if (pedido?.status === "REJEITADO") {
    return FARMACIA_DASHBOARD_PAGE.labels.rejectedAt;
  }

  return FARMACIA_DASHBOARD_PAGE.labels.createdAt;
}

export function buildDashboardMetrics(dashboard) {
  return [
    {
      key: "pedidos-pendentes",
      label: FARMACIA_DASHBOARD_PAGE.labels.pendingPedidos,
      value: getPedidosPendentesCount(dashboard),
      to: FARMACIA_DASHBOARD_PAGE.cards.pedidosPendentes.to,
    },
    {
      key: "pedidos-validados",
      label: FARMACIA_DASHBOARD_PAGE.labels.validatedPedidos,
      value: getPedidosValidadosCount(dashboard),
      to: FARMACIA_DASHBOARD_PAGE.cards.historico.to,
    },
    {
      key: "pedidos-rejeitados",
      label: FARMACIA_DASHBOARD_PAGE.labels.rejectedPedidos,
      value: getPedidosRejeitadosCount(dashboard),
      to: FARMACIA_DASHBOARD_PAGE.cards.historico.to,
    },
    {
      key: "regularizacoes-pendentes",
      label: FARMACIA_DASHBOARD_PAGE.labels.pendingRegularizacoes,
      value: getRegularizacoesPendentesCount(dashboard),
      to: FARMACIA_DASHBOARD_PAGE.cards.regularizacoes.to,
    },
  ];
}

export function buildRegularizacoesMetrics(dashboard) {
  return [
    {
      key: "regularizacoes-concluidas",
      label: "Regularizações concluídas",
      value: getRegularizacoesConcluidasCount(dashboard),
    },
    {
      key: "regularizacoes-eventos",
      label: "Eventos de regularização",
      value: getRegularizacoesEventosCount(dashboard),
    },
    {
      key: "regularizacoes-unidades",
      label: "Unidades regularizadas",
      value: getRegularizacoesUnidadesCount(dashboard),
    },
    {
      key: "ultima-regularizacao",
      label: "Última regularização",
      value: getLatestRegularizacaoAtLabel(dashboard),
    },
  ];
}

export function getDashboardQuickLinks() {
  return [
    FARMACIA_DASHBOARD_PAGE.cards.pedidosPendentes,
    FARMACIA_DASHBOARD_PAGE.cards.historico,
    FARMACIA_DASHBOARD_PAGE.cards.regularizacoes,
  ];
}
