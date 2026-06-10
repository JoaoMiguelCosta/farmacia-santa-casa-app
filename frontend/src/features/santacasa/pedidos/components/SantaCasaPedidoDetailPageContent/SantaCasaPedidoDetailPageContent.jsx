// src/features/santacasa/pedidos/components/SantaCasaPedidoDetailPageContent/SantaCasaPedidoDetailPageContent.jsx

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

import SantaCasaPedidoDetailDialogs from "../SantaCasaPedidoDetailDialogs/SantaCasaPedidoDetailDialogs";

import styles from "./SantaCasaPedidoDetailPageContent.module.css";

function PedidoDetailState({
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

function canCancelPedido(pedido, operationalSummary) {
  return Boolean(
    pedido?.status === "PENDENTE" && operationalSummary?.pendingItems > 0,
  );
}

function getSafeDomId(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-");
}

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
          <button
            type="button"
            className={styles.refreshButton}
            disabled={isRefreshing || isCanceling}
            onClick={refreshPedido}
          >
            {isRefreshing ? detail.refreshingLabel : detail.refreshLabel}
          </button>
        ) : null}
      </div>

      <PageHeader
        titleId="santacasa-pedido-detail-title"
        eyebrow={detail.eyebrow}
        title={detail.title}
        description={detail.description}
      />

      {isLoading ? (
        <PedidoDetailState
          title={detail.loadingTitle}
          description={detail.loadingDescription}
        />
      ) : null}

      {!isLoading && error ? (
        <PedidoDetailState
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
