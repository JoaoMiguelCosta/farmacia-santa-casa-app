import { useEffect, useMemo, useState } from "react";

import Button from "../../shared/ui/Button/Button";
import ConfirmDialog from "../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../shared/ui/FeedbackDialog/FeedbackDialog";
import PageHeader from "../../shared/ui/PageHeader/PageHeader";
import FarmaciaPedidosList from "../../features/farmacia/shared/pedidos/components/FarmaciaPedidosList/FarmaciaPedidosList";

import { FARMACIA_PEDIDOS_PAGE } from "../../features/farmacia/pedidos/config/farmaciaPedidosPage.config";
import { useFarmaciaPedidos } from "../../features/farmacia/pedidos/hooks/useFarmaciaPedidos";
import { getPedidoNumberLabel } from "../../features/farmacia/shared/pedidos/utils/farmaciaPedido.utils";

import styles from "./FarmaciaPedidosPage.module.css";

const PAGE_FALLBACKS = Object.freeze({
  labels: {
    pedido: "Pedido",
  },

  validateDialog: {
    title: "Validar pedido?",
    description:
      "Ao validar, o backend vai dispensar quantidades, atualizar saldos e criar regularizações quando existirem vendas suspensas.",
    confirmLabel: "Validar pedido",
    cancelLabel: "Cancelar",
    successMessage: "Pedido validado com sucesso.",
  },

  rejectDialog: {
    title: "Rejeitar pedido?",
    description:
      "Ao rejeitar, todos os itens pendentes deste pedido passam para estado rejeitado e o motivo fica guardado no histórico.",
    confirmLabel: "Rejeitar pedido",
    cancelLabel: "Cancelar",
    successMessage: "Pedido rejeitado com sucesso.",
    reasonLabel: "Motivo da rejeição",
    reasonPlaceholder: "Ex: medicamento indisponível, dados inválidos...",
    reasonHint: "Opcional. Máximo recomendado: 500 caracteres.",
  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
    validateError: "Não foi possível validar o pedido.",
    rejectError: "Não foi possível rejeitar o pedido.",
  },
});

function getPageLabels() {
  return {
    ...PAGE_FALLBACKS.labels,
    ...(FARMACIA_PEDIDOS_PAGE.labels || {}),
  };
}

function getValidateDialogConfig() {
  return {
    ...PAGE_FALLBACKS.validateDialog,
    ...(FARMACIA_PEDIDOS_PAGE.validateDialog || {}),
  };
}

function getRejectDialogConfig() {
  return {
    ...PAGE_FALLBACKS.rejectDialog,
    ...(FARMACIA_PEDIDOS_PAGE.rejectDialog || {}),
  };
}

function getFeedbackConfig() {
  return {
    ...PAGE_FALLBACKS.feedback,
    ...(FARMACIA_PEDIDOS_PAGE.feedback || {}),
  };
}

function RejectPedidoDialog({
  pedido,
  reason,
  isLoading = false,
  onReasonChange,
  onConfirm,
  onCancel,
}) {
  const labels = useMemo(() => getPageLabels(), []);
  const rejectDialog = useMemo(() => getRejectDialogConfig(), []);

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
            {rejectDialog.title}
          </h2>

          <p id="reject-pedido-description" className={styles.dialogText}>
            {rejectDialog.description}
          </p>

          <p className={styles.dialogPedido}>
            {labels.pedido}: <strong>{getPedidoNumberLabel(pedido)}</strong>
          </p>

          <label className={styles.reasonField}>
            <span>{rejectDialog.reasonLabel}</span>

            <textarea
              value={reason}
              maxLength={500}
              rows={4}
              placeholder={rejectDialog.reasonPlaceholder}
              disabled={isLoading}
              onChange={(event) => onReasonChange?.(event.target.value)}
            />

            <small>{rejectDialog.reasonHint}</small>
          </label>
        </div>

        <footer className={styles.dialogActions}>
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={onCancel}
          >
            {rejectDialog.cancelLabel}
          </Button>

          <Button
            type="button"
            variant="danger"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {rejectDialog.confirmLabel}
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

  const labels = useMemo(() => getPageLabels(), []);
  const validateDialog = useMemo(() => getValidateDialogConfig(), []);
  const rejectDialog = useMemo(() => getRejectDialogConfig(), []);
  const feedbackConfig = useMemo(() => getFeedbackConfig(), []);

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

    const currentPedido = pedidoToValidate;
    const result = await validatePedido(currentPedido.id);

    setPedidoToValidate(null);

    if (result) {
      setFeedback({
        type: "success",
        title: validateDialog.successMessage,
        message: `${getPedidoNumberLabel(currentPedido)} foi validado.`,
      });

      return;
    }

    setFeedback({
      type: "error",
      title: feedbackConfig.validateError,
      message: feedbackConfig.genericError,
    });
  }

  async function handleConfirmReject() {
    if (!pedidoToReject?.id) return;

    const currentPedido = pedidoToReject;
    const result = await rejectPedido(currentPedido.id, rejectReason);

    setPedidoToReject(null);
    setRejectReason("");

    if (result) {
      setFeedback({
        type: "success",
        title: rejectDialog.successMessage,
        message: `${getPedidoNumberLabel(currentPedido)} foi rejeitado.`,
      });

      return;
    }

    setFeedback({
      type: "error",
      title: feedbackConfig.rejectError,
      message: feedbackConfig.genericError,
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
        title={validateDialog.title}
        description={`${validateDialog.description} ${labels.pedido}: ${getPedidoNumberLabel(
          pedidoToValidate,
        )}.`}
        confirmLabel={validateDialog.confirmLabel}
        cancelLabel={validateDialog.cancelLabel}
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
