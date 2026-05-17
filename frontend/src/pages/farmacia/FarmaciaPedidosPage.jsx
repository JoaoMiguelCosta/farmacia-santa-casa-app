import { useEffect, useState } from "react";

import Button from "../../shared/ui/Button/Button";
import ConfirmDialog from "../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../shared/ui/FeedbackDialog/FeedbackDialog";
import PageHeader from "../../shared/ui/PageHeader/PageHeader";
import FarmaciaPedidosList from "../../features/farmacia/shared/pedidos/components/FarmaciaPedidosList/FarmaciaPedidosList";

import { FARMACIA_PEDIDOS_PAGE } from "../../features/farmacia/pedidos/config/farmaciaPedidosPage.config";
import { useFarmaciaPedidos } from "../../features/farmacia/pedidos/hooks/useFarmaciaPedidos";
import { getPedidoNumberLabel } from "../../features/farmacia/shared/pedidos/utils/farmaciaPedido.utils";

import styles from "./FarmaciaPedidosPage.module.css";

function RejectPedidoDialog({
  pedido,
  reason,
  isLoading = false,
  onReasonChange,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!pedido) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isLoading) {
        onCancel?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pedido, isLoading, onCancel]);

  if (!pedido) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-pedido-title"
        aria-describedby="reject-pedido-description"
      >
        <div className={styles.dialogIcon} aria-hidden="true">
          !
        </div>

        <div className={styles.dialogContent}>
          <p className={styles.dialogEyebrow}>Confirmação necessária</p>

          <h2 id="reject-pedido-title" className={styles.dialogTitle}>
            {FARMACIA_PEDIDOS_PAGE.rejectDialog.title}
          </h2>

          <p id="reject-pedido-description" className={styles.dialogText}>
            {FARMACIA_PEDIDOS_PAGE.rejectDialog.description}
          </p>

          <p className={styles.dialogPedido}>
            {FARMACIA_PEDIDOS_PAGE.labels.pedido}:{" "}
            <strong>{getPedidoNumberLabel(pedido)}</strong>
          </p>

          <label className={styles.reasonField}>
            <span>{FARMACIA_PEDIDOS_PAGE.rejectDialog.reasonLabel}</span>

            <textarea
              value={reason}
              maxLength={500}
              rows={4}
              placeholder={FARMACIA_PEDIDOS_PAGE.rejectDialog.reasonPlaceholder}
              disabled={isLoading}
              onChange={(event) => onReasonChange?.(event.target.value)}
            />

            <small>{FARMACIA_PEDIDOS_PAGE.rejectDialog.reasonHint}</small>
          </label>
        </div>

        <footer className={styles.dialogActions}>
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={onCancel}
          >
            {FARMACIA_PEDIDOS_PAGE.rejectDialog.cancelLabel}
          </Button>

          <Button
            type="button"
            variant="danger"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {FARMACIA_PEDIDOS_PAGE.rejectDialog.confirmLabel}
          </Button>
        </footer>
      </section>
    </div>
  );
}

export default function FarmaciaPedidosPage() {
  const {
    pedidos,
    isLoading,
    isRefreshing,
    isActionRunning,
    validatingPedidoId,
    rejectingPedidoId,
    error,
    actionError,
    refreshPedidos,
    validatePedido,
    rejectPedido,
    clearActionError,
  } = useFarmaciaPedidos();

  const [pedidoToValidate, setPedidoToValidate] = useState(null);
  const [pedidoToReject, setPedidoToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [feedback, setFeedback] = useState(null);

  const isValidatingSelected =
    pedidoToValidate && validatingPedidoId === pedidoToValidate.id;

  const isRejectingSelected =
    pedidoToReject && rejectingPedidoId === pedidoToReject.id;

  function closeFeedback() {
    setFeedback(null);
  }

  function openValidateDialog(pedido) {
    clearActionError();
    setPedidoToValidate(pedido);
  }

  function closeValidateDialog() {
    if (isValidatingSelected) return;

    setPedidoToValidate(null);
  }

  function openRejectDialog(pedido) {
    clearActionError();
    setRejectReason("");
    setPedidoToReject(pedido);
  }

  function closeRejectDialog() {
    if (isRejectingSelected) return;

    setPedidoToReject(null);
    setRejectReason("");
  }

  async function handleConfirmValidate() {
    if (!pedidoToValidate?.id) return;

    const result = await validatePedido(pedidoToValidate.id);

    setPedidoToValidate(null);

    if (result) {
      setFeedback({
        type: "success",
        title: FARMACIA_PEDIDOS_PAGE.validateDialog.successMessage,
        message: `${getPedidoNumberLabel(pedidoToValidate)} foi validado.`,
      });

      return;
    }

    setFeedback({
      type: "error",
      title: FARMACIA_PEDIDOS_PAGE.feedback.validateError,
      message: FARMACIA_PEDIDOS_PAGE.feedback.genericError,
    });
  }

  async function handleConfirmReject() {
    if (!pedidoToReject?.id) return;

    const result = await rejectPedido(pedidoToReject.id, rejectReason);

    setPedidoToReject(null);
    setRejectReason("");

    if (result) {
      setFeedback({
        type: "success",
        title: FARMACIA_PEDIDOS_PAGE.rejectDialog.successMessage,
        message: `${getPedidoNumberLabel(pedidoToReject)} foi rejeitado.`,
      });

      return;
    }

    setFeedback({
      type: "error",
      title: FARMACIA_PEDIDOS_PAGE.feedback.rejectError,
      message: FARMACIA_PEDIDOS_PAGE.feedback.genericError,
    });
  }

  return (
    <section className={styles.page} aria-labelledby="farmacia-pedidos-title">
      <PageHeader
        titleId="farmacia-pedidos-title"
        eyebrow={FARMACIA_PEDIDOS_PAGE.header.eyebrow}
        title={FARMACIA_PEDIDOS_PAGE.header.title}
        description={FARMACIA_PEDIDOS_PAGE.header.description}
      />

      {actionError ? (
        <div className={styles.actionError} role="alert">
          <strong>Erro na operação</strong>
          <span>{actionError}</span>
        </div>
      ) : null}

      <FarmaciaPedidosList
        pedidos={pedidos}
        sectionConfig={FARMACIA_PEDIDOS_PAGE.sections.list}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isActionDisabled={isActionRunning}
        validatingPedidoId={validatingPedidoId}
        rejectingPedidoId={rejectingPedidoId}
        error={error}
        onRefresh={refreshPedidos}
        onValidate={openValidateDialog}
        onReject={openRejectDialog}
      />

      <ConfirmDialog
        isOpen={Boolean(pedidoToValidate)}
        title={FARMACIA_PEDIDOS_PAGE.validateDialog.title}
        description={`${FARMACIA_PEDIDOS_PAGE.validateDialog.description} Pedido: ${getPedidoNumberLabel(
          pedidoToValidate,
        )}.`}
        confirmLabel={FARMACIA_PEDIDOS_PAGE.validateDialog.confirmLabel}
        cancelLabel={FARMACIA_PEDIDOS_PAGE.validateDialog.cancelLabel}
        isLoading={Boolean(isValidatingSelected)}
        onConfirm={handleConfirmValidate}
        onCancel={closeValidateDialog}
      />

      <RejectPedidoDialog
        pedido={pedidoToReject}
        reason={rejectReason}
        isLoading={Boolean(isRejectingSelected)}
        onReasonChange={setRejectReason}
        onConfirm={handleConfirmReject}
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
