import { Link, useParams } from "react-router-dom";

import Button from "../../../../../shared/ui/Button/Button";
import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import { SANTACASA_ROUTES } from "../../../shared/config/santaCasaRoutes.config";

import SantaCasaPedidoCard from "../../../shared/pedidos/components/SantaCasaPedidoCard/SantaCasaPedidoCard";
import SantaCasaPedidoDetails from "../../../shared/pedidos/components/SantaCasaPedidoDetails/SantaCasaPedidoDetails";

import { getSantaCasaPedidoOperationalSummary } from "../../../shared/pedidos/utils/santaCasaPedidoOperational.utils";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";
import { useSantaCasaPedidoDetail } from "../../hooks/useSantaCasaPedidoDetail";
import { useSantaCasaPedidoDetailActions } from "../../hooks/useSantaCasaPedidoDetailActions";
import {
  canCancelPedido,
  getSafeDomId,
} from "../../utils/santaCasaPedidoDetail.utils";

import SantaCasaPedidoDetailDialogs from "./components/SantaCasaPedidoDetailDialogs/SantaCasaPedidoDetailDialogs";
import OperationalDetailState from "../../../../../shared/ui/OperationalDetailState/OperationalDetailState";

import styles from "./SantaCasaPedidoDetailPageContent.module.css";

export default function SantaCasaPedidoDetailPageContent() {
  const { pedidoId } = useParams();

  const {
    pedido,
    error,

    isLoading,
    isRefreshing,
    isCanceling,

    refreshPedido,
    cancelCurrentPedido,
  } = useSantaCasaPedidoDetail(pedidoId);

  const {
    isCancelDialogOpen,
    feedback,

    openCancelDialog,
    closeCancelDialog,
    confirmCancelPedido,
    closeFeedback,
  } = useSantaCasaPedidoDetailActions({
    isCanceling,
    cancelCurrentPedido,
  });

  const { detail } = PEDIDOS_PAGE;

  const operationalSummary = pedido
    ? getSantaCasaPedidoOperationalSummary(pedido)
    : null;

  const isCancellationAvailable = canCancelPedido(pedido, operationalSummary);

  const detailsId = pedido
    ? `santacasa-pedido-${getSafeDomId(pedido.id || pedidoId)}-items`
    : "santacasa-pedido-items";

  return (
    <section
      className={styles.page}
      aria-labelledby="santacasa-pedido-detail-title"
    >
      <div className={styles.navigation}>
        <Link to={SANTACASA_ROUTES.pedidos} className={styles.backLink}>
          ← {detail.backLabel}
        </Link>

        {!isLoading && pedido ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={isRefreshing || isCanceling}
            onClick={refreshPedido}
          >
            {isRefreshing ? detail.refreshingLabel : detail.refreshLabel}
          </Button>
        ) : null}
      </div>

      <PageHeader
        titleId="santacasa-pedido-detail-title"
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

      {!isLoading && !error && pedido && operationalSummary ? (
        <>
          <SantaCasaPedidoCard pedido={pedido} />

          {isCancellationAvailable ? (
            <section
              className={styles.cancelSection}
              aria-labelledby="santacasa-pedido-cancel-title"
            >
              <div className={styles.cancelContent}>
                <h2 id="santacasa-pedido-cancel-title">
                  {PEDIDOS_PAGE.actions.cancelPedido}
                </h2>

                <p>{PEDIDOS_PAGE.cancelDialog.description}</p>
              </div>

              <Button
                type="button"
                variant="danger"
                disabled={isCanceling}
                isLoading={isCanceling}
                onClick={openCancelDialog}
              >
                {isCanceling
                  ? PEDIDOS_PAGE.actions.cancelingPedido
                  : PEDIDOS_PAGE.actions.cancelPedido}
              </Button>
            </section>
          ) : null}

          <SantaCasaPedidoDetails
            key={pedido.id || pedidoId}
            id={detailsId}
            pedido={pedido}
          />
        </>
      ) : null}

      <SantaCasaPedidoDetailDialogs
        pedido={pedido}
        isCancelDialogOpen={isCancelDialogOpen}
        isCanceling={isCanceling}
        feedback={feedback}
        onConfirmCancel={confirmCancelPedido}
        onCloseCancel={closeCancelDialog}
        onCloseFeedback={closeFeedback}
      />
    </section>
  );
}
