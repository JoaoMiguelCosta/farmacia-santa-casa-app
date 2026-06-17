import { Link, useLocation, useParams } from "react-router-dom";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";
import Button from "../../../../../shared/ui/Button/Button";

import FarmaciaPedidoCard from "../../../shared/pedidos/components/FarmaciaPedidoCard/FarmaciaPedidoCard";

import { FARMACIA_ROUTES } from "../../../shared/config/farmaciaRoutes.config";

import { FARMACIA_HISTORICO_PAGE } from "../../config/farmaciaHistoricoPage.config";
import { useFarmaciaHistoricoDetail } from "../../hooks/useFarmaciaHistoricoDetail";

import OperationalDetailState from "../../../../../shared/ui/OperationalDetailState/OperationalDetailState";

import styles from "./FarmaciaHistoricoDetailPageContent.module.css";

function getBackPath(location) {
  const previousPath = location.state?.from;

  if (
    typeof previousPath === "string" &&
    previousPath.startsWith(FARMACIA_ROUTES.historico)
  ) {
    return previousPath;
  }

  return FARMACIA_ROUTES.historico;
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
          <Button
            variant="secondary"
            size="sm"
            disabled={isRefreshing}
            onClick={refreshPedido}
          >
            {isRefreshing ? detail.refreshingLabel : detail.refreshLabel}
          </Button>
        ) : null}
      </div>

      <PageHeader
        titleId="farmacia-historico-detail-title"
        eyebrow={detail.eyebrow}
        title={detail.title}
        description={detail.description}
      />

      {isLoading ? (
        <OperationalDetailState
          title={detail.loadingTitle}
          description={detail.loadingDescription}
        />
      ) : null}

      {!isLoading && error ? (
        <OperationalDetailState
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
