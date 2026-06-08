// src/features/farmacia/historico/components/FarmaciaHistoricoDetailPageContent/FarmaciaHistoricoDetailPageContent.jsx
import { Link, useLocation, useParams } from "react-router-dom";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import FarmaciaPedidoCard from "../../../shared/pedidos/components/FarmaciaPedidoCard/FarmaciaPedidoCard";

import { FARMACIA_HISTORICO_PAGE } from "../../config/farmaciaHistoricoPage.config";

import { useFarmaciaHistoricoDetail } from "../../hooks/useFarmaciaHistoricoDetail";

import styles from "./FarmaciaHistoricoDetailPageContent.module.css";

function HistoricoDetailState({
  title,
  description,
  actionLabel,
  isActionLoading = false,
  onAction,
}) {
  return (
    <div className={styles.state} role="status">
      <strong className={styles.stateTitle}>{title}</strong>

      {description ? (
        <p className={styles.stateDescription}>{description}</p>
      ) : null}

      {actionLabel && onAction ? (
        <button
          type="button"
          className={styles.stateAction}
          disabled={isActionLoading}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function getBackPath(location) {
  const previousPath = location.state?.from;

  if (
    typeof previousPath === "string" &&
    previousPath.startsWith("/farmacia/historico")
  ) {
    return previousPath;
  }

  return "/farmacia/historico";
}

export default function FarmaciaHistoricoDetailPageContent() {
  const { pedidoId } = useParams();
  const location = useLocation();

  const {
    pedido,
    error,

    isLoading,
    isRefreshing,

    refreshPedido,
  } = useFarmaciaHistoricoDetail(pedidoId);

  const { detail } = FARMACIA_HISTORICO_PAGE;

  const backPath = getBackPath(location);

  return (
    <section
      className={styles.page}
      aria-labelledby="farmacia-historico-detail-title"
    >
      <div className={styles.navigation}>
        <Link to={backPath} className={styles.backLink}>
          ← {detail.backLabel}
        </Link>

        {!isLoading && pedido ? (
          <button
            type="button"
            className={styles.refreshButton}
            disabled={isRefreshing}
            onClick={refreshPedido}
          >
            {isRefreshing ? detail.refreshingLabel : detail.refreshLabel}
          </button>
        ) : null}
      </div>

      <PageHeader
        titleId="farmacia-historico-detail-title"
        eyebrow={detail.eyebrow}
        title={detail.title}
        description={detail.description}
      />

      {isLoading ? (
        <HistoricoDetailState
          title={detail.loadingTitle}
          description={detail.loadingDescription}
        />
      ) : null}

      {!isLoading && error ? (
        <HistoricoDetailState
          title={detail.errorTitle}
          description={error}
          actionLabel={
            isRefreshing ? detail.refreshingLabel : detail.retryLabel
          }
          isActionLoading={isRefreshing}
          onAction={refreshPedido}
        />
      ) : null}

      {!isLoading && !error && pedido ? (
        <FarmaciaPedidoCard pedido={pedido} variant="history" showUtentes />
      ) : null}
    </section>
  );
}
