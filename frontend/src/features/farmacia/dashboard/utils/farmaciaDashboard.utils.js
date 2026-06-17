import { formatDateTime } from "../../../../shared/utils/formatDate";

import { FARMACIA_DASHBOARD_PAGE } from "../config/farmaciaDashboardPage.config";

const UNKNOWN_LABEL = "—";

function toSafeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return number;
}

function getDangerTone(value) {
  return value > 0 ? "danger" : "neutral";
}

function buildRouteWithParams(baseRoute, params) {
  const searchParams = new URLSearchParams(params);

  return `${baseRoute}?${searchParams.toString()}`;
}

function buildHistoricoStatusRoute(status) {
  return buildRouteWithParams(FARMACIA_DASHBOARD_PAGE.cards.historico.to, {
    status,
  });
}

function buildRegularizacoesViewRoute(view) {
  return buildRouteWithParams(FARMACIA_DASHBOARD_PAGE.cards.regularizacoes.to, {
    view,
  });
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

  if (!Number.isFinite(numero)) {
    return UNKNOWN_LABEL;
  }

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

export function getLatestPedidoStatusTone(dashboard) {
  const pedido = getLatestPedido(dashboard);

  return FARMACIA_DASHBOARD_PAGE.statusTones[pedido?.status] || "neutral";
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

export function buildDashboardPriorityMetrics(dashboard) {
  const pedidosPendentes = getPedidosPendentesCount(dashboard);
  const regularizacoesPendentes = getRegularizacoesPendentesCount(dashboard);

  return [
    {
      key: "pedidos-pendentes",
      label: FARMACIA_DASHBOARD_PAGE.labels.pendingPedidos,
      value: pedidosPendentes,
      statusText:
        pedidosPendentes > 0
          ? FARMACIA_DASHBOARD_PAGE.priorityStates.pedidosAttention
          : FARMACIA_DASHBOARD_PAGE.priorityStates.pedidosClear,
      tone: pedidosPendentes > 0 ? "warning" : "success",
      to: FARMACIA_DASHBOARD_PAGE.cards.pedidosPendentes.to,
      actionLabel: FARMACIA_DASHBOARD_PAGE.cards.pedidosPendentes.actionLabel,
    },

    {
      key: "regularizacoes-pendentes",
      label: FARMACIA_DASHBOARD_PAGE.labels.pendingRegularizacoes,
      value: regularizacoesPendentes,
      statusText:
        regularizacoesPendentes > 0
          ? FARMACIA_DASHBOARD_PAGE.priorityStates.regularizacoesAttention
          : FARMACIA_DASHBOARD_PAGE.priorityStates.regularizacoesClear,
      tone: regularizacoesPendentes > 0 ? "warning" : "success",
      to: FARMACIA_DASHBOARD_PAGE.cards.regularizacoes.to,
      actionLabel: FARMACIA_DASHBOARD_PAGE.cards.regularizacoes.actionLabel,
    },
  ];
}

export function buildPedidosMetrics(dashboard) {
  const pedidosPendentes = getPedidosPendentesCount(dashboard);
  const pedidosRejeitados = getPedidosRejeitadosCount(dashboard);

  return [
    {
      key: "pedidos-pendentes",
      label: FARMACIA_DASHBOARD_PAGE.labels.pendingPedidos,
      value: pedidosPendentes,
      tone: pedidosPendentes > 0 ? "warning" : "neutral",
      to: FARMACIA_DASHBOARD_PAGE.cards.pedidosPendentes.to,
    },

    {
      key: "pedidos-validados",
      label: FARMACIA_DASHBOARD_PAGE.labels.validatedPedidos,
      value: getPedidosValidadosCount(dashboard),
      tone: "success",
      to: buildHistoricoStatusRoute("VALIDADO"),
    },

    {
      key: "pedidos-rejeitados",
      label: FARMACIA_DASHBOARD_PAGE.labels.rejectedPedidos,
      value: pedidosRejeitados,
      tone: getDangerTone(pedidosRejeitados),
      to: buildHistoricoStatusRoute("REJEITADO"),
    },
  ];
}

export function buildRegularizacoesMetrics(dashboard) {
  const regularizacoesPendentes = getRegularizacoesPendentesCount(dashboard);

  return [
    {
      key: "regularizacoes-pendentes",
      label: FARMACIA_DASHBOARD_PAGE.labels.pendingRegularizacoes,
      value: regularizacoesPendentes,
      tone: regularizacoesPendentes > 0 ? "warning" : "neutral",
      to: FARMACIA_DASHBOARD_PAGE.cards.regularizacoes.to,
    },

    {
      key: "regularizacoes-concluidas",
      label: FARMACIA_DASHBOARD_PAGE.labels.regularizacoesConcluidas,
      value: getRegularizacoesConcluidasCount(dashboard),
      tone: "success",
      to: buildRegularizacoesViewRoute("history"),
    },

    {
      key: "regularizacoes-eventos",
      label: FARMACIA_DASHBOARD_PAGE.labels.regularizacoesEventos,
      value: getRegularizacoesEventosCount(dashboard),
      tone: "info",
    },

    {
      key: "regularizacoes-unidades",
      label: FARMACIA_DASHBOARD_PAGE.labels.regularizacoesUnidades,
      value: getRegularizacoesUnidadesCount(dashboard),
      tone: "info",
    },

    {
      key: "ultima-regularizacao",
      label: FARMACIA_DASHBOARD_PAGE.labels.latestRegularizacao,
      value: getLatestRegularizacaoAtLabel(dashboard),
      tone: "neutral",
    },
  ];
}

export function buildDashboardMetricGroups(dashboard) {
  const groups = FARMACIA_DASHBOARD_PAGE.sections.groups;

  return [
    {
      key: "pedidos",
      ...groups.pedidos,
      metrics: buildPedidosMetrics(dashboard),
    },

    {
      key: "regularizacoes",
      ...groups.regularizacoes,
      metrics: buildRegularizacoesMetrics(dashboard),
    },
  ];
}
