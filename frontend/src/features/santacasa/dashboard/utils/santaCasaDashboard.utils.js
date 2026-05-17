import { formatDateTime } from "../../../../shared/utils/formatDate";
import { SANTACASA_DASHBOARD_PAGE } from "../config/santaCasaDashboardPage.config";

const UNKNOWN_LABEL = "—";

function toSafeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return number;
}

export function getTotalUtentesCount(dashboard) {
  return toSafeNumber(dashboard?.utentes?.total);
}

export function getTotalReceitasCount(dashboard) {
  return toSafeNumber(dashboard?.receitas?.total);
}

export function getReceitasAtivasCount(dashboard) {
  return toSafeNumber(dashboard?.receitas?.linhasAtivas);
}

export function getReceitasExpiradasCount(dashboard) {
  return toSafeNumber(dashboard?.receitas?.linhasExpiradas);
}

export function getTotalSemReceitaCount(dashboard) {
  return toSafeNumber(dashboard?.semReceita?.total);
}

export function getExtrasPendentesCount(dashboard) {
  return toSafeNumber(dashboard?.extras?.pendentes);
}

export function getExtrasParcialmenteRegularizadosCount(dashboard) {
  return toSafeNumber(dashboard?.extras?.parcialmenteRegularizados);
}

export function getExtrasRegularizadosCount(dashboard) {
  return toSafeNumber(dashboard?.extras?.regularizados);
}

export function getExtrasExpiradosCount(dashboard) {
  return toSafeNumber(dashboard?.extras?.expirados);
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

  if (!Number.isFinite(numero)) return UNKNOWN_LABEL;

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

  return SANTACASA_DASHBOARD_PAGE.labels.createdAt;
}

export function buildDashboardMainMetrics(dashboard) {
  return [
    {
      key: "utentes-total",
      label: SANTACASA_DASHBOARD_PAGE.labels.totalUtentes,
      value: getTotalUtentesCount(dashboard),
      to: SANTACASA_DASHBOARD_PAGE.cards.utentes.to,
    },
    {
      key: "pedidos-pendentes",
      label: SANTACASA_DASHBOARD_PAGE.labels.pedidosPendentes,
      value: getPedidosPendentesCount(dashboard),
      to: SANTACASA_DASHBOARD_PAGE.cards.pedidos.to,
    },
    {
      key: "extras-pendentes",
      label: SANTACASA_DASHBOARD_PAGE.labels.extrasPendentes,
      value: getExtrasPendentesCount(dashboard),
      to: SANTACASA_DASHBOARD_PAGE.cards.operacao.to,
    },
    {
      key: "regularizacoes-pendentes",
      label: SANTACASA_DASHBOARD_PAGE.labels.regularizacoesPendentes,
      value: getRegularizacoesPendentesCount(dashboard),
      to: SANTACASA_DASHBOARD_PAGE.cards.regularizacoes.to,
    },
  ];
}

export function buildReceitasMetrics(dashboard) {
  return [
    {
      key: "receitas-total",
      label: SANTACASA_DASHBOARD_PAGE.labels.totalReceitas,
      value: getTotalReceitasCount(dashboard),
    },
    {
      key: "receitas-ativas",
      label: SANTACASA_DASHBOARD_PAGE.labels.receitasAtivas,
      value: getReceitasAtivasCount(dashboard),
    },
    {
      key: "receitas-expiradas",
      label: SANTACASA_DASHBOARD_PAGE.labels.receitasExpiradas,
      value: getReceitasExpiradasCount(dashboard),
    },
    {
      key: "sem-receita-total",
      label: SANTACASA_DASHBOARD_PAGE.labels.totalSemReceita,
      value: getTotalSemReceitaCount(dashboard),
    },
  ];
}

export function buildPedidosMetrics(dashboard) {
  return [
    {
      key: "pedidos-pendentes",
      label: SANTACASA_DASHBOARD_PAGE.labels.pedidosPendentes,
      value: getPedidosPendentesCount(dashboard),
    },
    {
      key: "pedidos-validados",
      label: SANTACASA_DASHBOARD_PAGE.labels.pedidosValidados,
      value: getPedidosValidadosCount(dashboard),
    },
    {
      key: "pedidos-rejeitados",
      label: SANTACASA_DASHBOARD_PAGE.labels.pedidosRejeitados,
      value: getPedidosRejeitadosCount(dashboard),
    },
  ];
}

export function buildExtrasMetrics(dashboard) {
  return [
    {
      key: "extras-pendentes",
      label: SANTACASA_DASHBOARD_PAGE.labels.extrasPendentes,
      value: getExtrasPendentesCount(dashboard),
    },
    {
      key: "extras-parciais",
      label: SANTACASA_DASHBOARD_PAGE.labels.extrasParcialmenteRegularizados,
      value: getExtrasParcialmenteRegularizadosCount(dashboard),
    },
    {
      key: "extras-regularizados",
      label: SANTACASA_DASHBOARD_PAGE.labels.extrasRegularizados,
      value: getExtrasRegularizadosCount(dashboard),
    },
    {
      key: "extras-expirados",
      label: SANTACASA_DASHBOARD_PAGE.labels.extrasExpirados,
      value: getExtrasExpiradosCount(dashboard),
    },
  ];
}

export function buildRegularizacoesMetrics(dashboard) {
  return [
    {
      key: "regularizacoes-pendentes",
      label: SANTACASA_DASHBOARD_PAGE.labels.regularizacoesPendentes,
      value: getRegularizacoesPendentesCount(dashboard),
    },
    {
      key: "regularizacoes-parciais",
      label: SANTACASA_DASHBOARD_PAGE.labels.regularizacoesParciais,
      value: getRegularizacoesParciaisCount(dashboard),
    },
    {
      key: "regularizacoes-concluidas",
      label: SANTACASA_DASHBOARD_PAGE.labels.regularizacoesConcluidas,
      value: getRegularizacoesConcluidasCount(dashboard),
    },
  ];
}

export function getDashboardQuickLinks() {
  return [
    SANTACASA_DASHBOARD_PAGE.cards.utentes,
    SANTACASA_DASHBOARD_PAGE.cards.operacao,
    SANTACASA_DASHBOARD_PAGE.cards.pedidos,
    SANTACASA_DASHBOARD_PAGE.cards.regularizacoes,
    SANTACASA_DASHBOARD_PAGE.cards.historico,
  ];
}
