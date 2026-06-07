import { formatDateTime } from "../../../../shared/utils/formatDate";

import {
  SANTACASA_REGULARIZACOES_TABS,
  buildRegularizacoesViewRoute,
} from "../../regularizacoes/utils/santaCasaRegularizacoes.utils";

import { UTENTE_STATUS } from "../../utentes/config/utentesStatus.config";

import { SANTACASA_DASHBOARD_PAGE } from "../config/santaCasaDashboardPage.config";

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

function buildRouteWithStatus(baseRoute, status) {
  const searchParams = new URLSearchParams({
    status,
  });

  return `${baseRoute}?${searchParams.toString()}`;
}

function buildHistoricoStatusRoute(status) {
  return buildRouteWithStatus(
    SANTACASA_DASHBOARD_PAGE.cards.historico.to,
    status,
  );
}

function buildUtentesStatusRoute(status) {
  return buildRouteWithStatus(
    SANTACASA_DASHBOARD_PAGE.cards.utentes.to,
    status,
  );
}

function buildRegularizacoesRoute(view) {
  return buildRegularizacoesViewRoute(
    SANTACASA_DASHBOARD_PAGE.cards.regularizacoes.to,
    view,
  );
}

export function getTotalUtentesCount(dashboard) {
  return toSafeNumber(dashboard?.utentes?.total);
}

export function getUtentesAtivosCount(dashboard) {
  return toSafeNumber(dashboard?.utentes?.ativos);
}

export function getUtentesArquivadosCount(dashboard) {
  return toSafeNumber(dashboard?.utentes?.arquivados);
}

export function getTotalReceitasCount(dashboard) {
  return toSafeNumber(dashboard?.receitas?.total);
}

export function getReceitasAtivasCount(dashboard) {
  return toSafeNumber(dashboard?.receitas?.linhasAtivas);
}

export function getTotalSemReceitaCount(dashboard) {
  return toSafeNumber(dashboard?.semReceita?.total);
}

export function getExtrasAbertosCount(dashboard) {
  return toSafeNumber(dashboard?.extras?.abertos);
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

export function getPedidosCanceladosCount(dashboard) {
  return toSafeNumber(dashboard?.pedidos?.cancelados);
}

export function getRegularizacoesPendentesCount(dashboard) {
  return toSafeNumber(dashboard?.regularizacoes?.pendentes);
}

export function getRegularizacoesParciaisCount(dashboard) {
  return toSafeNumber(dashboard?.regularizacoes?.parcialmenteRegularizadas);
}

export function getRegularizacoesConcluidasCount(dashboard) {
  return toSafeNumber(dashboard?.regularizacoes?.regularizadas);
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
    SANTACASA_DASHBOARD_PAGE.status[pedido?.status] ||
    pedido?.status ||
    UNKNOWN_LABEL
  );
}

export function getLatestPedidoStatusTone(dashboard) {
  const pedido = getLatestPedido(dashboard);

  return SANTACASA_DASHBOARD_PAGE.statusTones[pedido?.status] || "neutral";
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
    return SANTACASA_DASHBOARD_PAGE.labels.validatedAt;
  }

  if (pedido?.status === "REJEITADO") {
    return SANTACASA_DASHBOARD_PAGE.labels.rejectedAt;
  }

  if (pedido?.status === "CANCELADO") {
    return SANTACASA_DASHBOARD_PAGE.labels.canceledAt;
  }

  return SANTACASA_DASHBOARD_PAGE.labels.createdAt;
}

export function buildDashboardPriorityMetrics(dashboard) {
  const pedidosPendentes = getPedidosPendentesCount(dashboard);

  const regularizacoesPendentes = getRegularizacoesPendentesCount(dashboard);

  return [
    {
      key: "pedidos-pendentes",
      label: SANTACASA_DASHBOARD_PAGE.labels.pedidosPendentes,
      value: pedidosPendentes,
      statusText:
        pedidosPendentes > 0
          ? SANTACASA_DASHBOARD_PAGE.priorityStates.pedidosAttention
          : SANTACASA_DASHBOARD_PAGE.priorityStates.pedidosClear,
      tone: pedidosPendentes > 0 ? "warning" : "success",
      to: SANTACASA_DASHBOARD_PAGE.cards.pedidos.to,
      actionLabel: SANTACASA_DASHBOARD_PAGE.cards.pedidos.actionLabel,
    },

    {
      key: "regularizacoes-pendentes",
      label: SANTACASA_DASHBOARD_PAGE.labels.regularizacoesPendentes,
      value: regularizacoesPendentes,
      statusText:
        regularizacoesPendentes > 0
          ? SANTACASA_DASHBOARD_PAGE.priorityStates.regularizacoesAttention
          : SANTACASA_DASHBOARD_PAGE.priorityStates.regularizacoesClear,
      tone: regularizacoesPendentes > 0 ? "warning" : "success",
      to: buildRegularizacoesRoute(SANTACASA_REGULARIZACOES_TABS.pending),
      actionLabel: SANTACASA_DASHBOARD_PAGE.cards.regularizacoes.actionLabel,
    },
  ];
}

export function buildUtentesMetrics(dashboard) {
  return [
    {
      key: "utentes-total",
      label: SANTACASA_DASHBOARD_PAGE.labels.totalUtentes,
      value: getTotalUtentesCount(dashboard),
      tone: "neutral",
      to: buildUtentesStatusRoute(UTENTE_STATUS.TODOS),
    },

    {
      key: "utentes-ativos",
      label: SANTACASA_DASHBOARD_PAGE.labels.utentesAtivos,
      value: getUtentesAtivosCount(dashboard),
      tone: "success",
      to: buildUtentesStatusRoute(UTENTE_STATUS.ATIVO),
    },

    {
      key: "utentes-arquivados",
      label: SANTACASA_DASHBOARD_PAGE.labels.utentesArquivados,
      value: getUtentesArquivadosCount(dashboard),
      tone: "neutral",
      to: buildUtentesStatusRoute(UTENTE_STATUS.ARQUIVADO),
    },
  ];
}

export function buildReceitasMedicacaoMetrics(dashboard) {
  return [
    {
      key: "receitas-total",
      label: SANTACASA_DASHBOARD_PAGE.labels.totalReceitas,
      value: getTotalReceitasCount(dashboard),
      tone: "neutral",
    },

    {
      key: "receitas-ativas",
      label: SANTACASA_DASHBOARD_PAGE.labels.receitasAtivas,
      value: getReceitasAtivasCount(dashboard),
      tone: "success",
    },

    {
      key: "sem-receita-total",
      label: SANTACASA_DASHBOARD_PAGE.labels.totalSemReceita,
      value: getTotalSemReceitaCount(dashboard),
      tone: "info",
    },

    {
      key: "extras-abertos",
      label: SANTACASA_DASHBOARD_PAGE.labels.extrasAbertos,
      value: getExtrasAbertosCount(dashboard),
      tone: "warning",
    },
  ];
}

export function buildPedidosMetrics(dashboard) {
  const pedidosPendentes = getPedidosPendentesCount(dashboard);

  const pedidosRejeitados = getPedidosRejeitadosCount(dashboard);

  const pedidosCancelados = getPedidosCanceladosCount(dashboard);

  return [
    {
      key: "pedidos-pendentes",
      label: SANTACASA_DASHBOARD_PAGE.labels.pedidosPendentes,
      value: pedidosPendentes,
      tone: pedidosPendentes > 0 ? "warning" : "neutral",
      to: SANTACASA_DASHBOARD_PAGE.cards.pedidos.to,
    },

    {
      key: "pedidos-validados",
      label: SANTACASA_DASHBOARD_PAGE.labels.pedidosValidados,
      value: getPedidosValidadosCount(dashboard),
      tone: "success",
      to: buildHistoricoStatusRoute("VALIDADO"),
    },

    {
      key: "pedidos-rejeitados",
      label: SANTACASA_DASHBOARD_PAGE.labels.pedidosRejeitados,
      value: pedidosRejeitados,
      tone: getDangerTone(pedidosRejeitados),
      to: buildHistoricoStatusRoute("REJEITADO"),
    },

    {
      key: "pedidos-cancelados",
      label: SANTACASA_DASHBOARD_PAGE.labels.pedidosCancelados,
      value: pedidosCancelados,
      tone: getDangerTone(pedidosCancelados),
      to: buildHistoricoStatusRoute("CANCELADO"),
    },
  ];
}

export function buildRegularizacoesMetrics(dashboard) {
  const regularizacoesPendentes = getRegularizacoesPendentesCount(dashboard);

  return [
    {
      key: "regularizacoes-pendentes",
      label: SANTACASA_DASHBOARD_PAGE.labels.regularizacoesPendentes,
      value: regularizacoesPendentes,
      tone: regularizacoesPendentes > 0 ? "warning" : "neutral",
      to: buildRegularizacoesRoute(SANTACASA_REGULARIZACOES_TABS.pending),
    },

    {
      key: "regularizacoes-parciais",
      label: SANTACASA_DASHBOARD_PAGE.labels.regularizacoesParciais,
      value: getRegularizacoesParciaisCount(dashboard),
      tone: "info",
    },

    {
      key: "regularizacoes-concluidas",
      label: SANTACASA_DASHBOARD_PAGE.labels.regularizacoesConcluidas,
      value: getRegularizacoesConcluidasCount(dashboard),
      tone: "success",
      to: buildRegularizacoesRoute(SANTACASA_REGULARIZACOES_TABS.history),
    },
  ];
}

export function buildDashboardMetricGroups(dashboard) {
  const groups = SANTACASA_DASHBOARD_PAGE.sections.groups;

  return [
    {
      key: "utentes",
      ...groups.utentes,
      metrics: buildUtentesMetrics(dashboard),
    },

    {
      key: "receitas-medicacao",
      ...groups.receitasMedicacao,
      metrics: buildReceitasMedicacaoMetrics(dashboard),
    },

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
