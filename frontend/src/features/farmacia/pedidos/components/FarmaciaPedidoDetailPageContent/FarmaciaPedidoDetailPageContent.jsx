import { Link, useParams } from "react-router-dom";

import FeedbackDialog from "../../../../../shared/ui/FeedbackDialog/FeedbackDialog";
import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";
import Button from "../../../../../shared/ui/Button/Button";

import FarmaciaPedidoCard from "../../../shared/pedidos/components/FarmaciaPedidoCard/FarmaciaPedidoCard";

import { isPedidoPending } from "../../../shared/pedidos/utils/farmaciaPedido.utils";

import { FARMACIA_ROUTES } from "../../../shared/config/farmaciaRoutes.config";

import { FARMACIA_PEDIDOS_PAGE } from "../../config/farmaciaPedidosPage.config";
import { useFarmaciaPedidoDetail } from "../../hooks/useFarmaciaPedidoDetail";
import { useFarmaciaPedidosPageActions } from "../../hooks/useFarmaciaPedidosPageActions";

import FarmaciaPedidoDecisionDialog from "../FarmaciaPedidoDecisionDialog/FarmaciaPedidoDecisionDialog";
import FarmaciaPedidoDetailActionsBar from "../FarmaciaPedidoDetailActionsBar/FarmaciaPedidoDetailActionsBar";
import OperationalDetailState from "../../../../../shared/ui/OperationalDetailState/OperationalDetailState";

import styles from "./FarmaciaPedidoDetailPageContent.module.css";

export default function FarmaciaPedidoDetailPageContent() {
  const { pedidoId } = useParams();

  const {
    pedido,

    error,
    actionError,

    isLoading,
    isRefreshing,
    isActionRunning,

    validatingPedidoId,
    rejectingPedidoId,

    refreshPedido,
    validatePedido,
    rejectPedido,
    clearActionError,
  } = useFarmaciaPedidoDetail(pedidoId);

  const {
    pedidoToValidate,
    pedidoToReject,
    rejectReason,
    feedback,

    isValidatingSelected,
    isRejectingSelected,

    openValidateDialog,
    closeValidateDialog,
    openRejectDialog,
    closeRejectDialog,
    changeRejectReason,
    confirmValidate,
    confirmReject,
    closeFeedback,
  } = useFarmaciaPedidosPageActions({
    validatingPedidoId,
    rejectingPedidoId,
    validatePedido,
    rejectPedido,
    clearActionError,
  });

  const { detail, feedback: feedbackConfig } = FARMACIA_PEDIDOS_PAGE;

  const cardVariant = pedido?.status === "PENDENTE" ? "pending" : "history";

  const showDecisionActions = Boolean(pedido) && isPedidoPending(pedido);

  const pageClassName = [
    styles.page,

    showDecisionActions ? styles.pageWithDecisionBar : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={pageClassName}
      aria-labelledby="farmacia-pedido-detail-title"
    >
      <div className={styles.navigation}>
        <Link to={FARMACIA_ROUTES.pedidos} className={styles.backLink}>
          ← {detail.backLabel}
        </Link>

        {!isLoading && pedido ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={isRefreshing || isActionRunning}
            onClick={refreshPedido}
          >
            {isRefreshing ? detail.refreshingLabel : detail.refreshLabel}
          </Button>
        ) : null}
      </div>

      <PageHeader
        titleId="farmacia-pedido-detail-title"
        eyebrow={detail.eyebrow}
        title={detail.title}
        description={detail.description}
      />

      {actionError ? (
        <div className={styles.actionError} role="alert">
          <strong>{feedbackConfig.actionErrorTitle}</strong>

          <span>{actionError}</span>
        </div>
      ) : null}

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
        <>
          <FarmaciaPedidoCard
            pedido={pedido}
            variant={cardVariant}
            showUtentes
          />

          {showDecisionActions ? (
            <FarmaciaPedidoDetailActionsBar
              pedido={pedido}
              isActionDisabled={isActionRunning}
              isValidating={validatingPedidoId === pedido.id}
              isRejecting={rejectingPedidoId === pedido.id}
              onValidate={openValidateDialog}
              onReject={openRejectDialog}
            />
          ) : null}
        </>
      ) : null}

      <FarmaciaPedidoDecisionDialog
        mode="validate"
        pedido={pedidoToValidate}
        isLoading={isValidatingSelected}
        onConfirm={confirmValidate}
        onCancel={closeValidateDialog}
      />

      <FarmaciaPedidoDecisionDialog
        mode="reject"
        pedido={pedidoToReject}
        reason={rejectReason}
        isLoading={isRejectingSelected}
        onReasonChange={changeRejectReason}
        onConfirm={confirmReject}
        onCancel={closeRejectDialog}
      />

      <FeedbackDialog
        isOpen={Boolean(feedback)}
        type={feedback?.type}
        title={feedback?.title}
        message={feedback?.message}
        onClose={closeFeedback}
      />
    </section>
  );
}
