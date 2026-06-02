// src/features/santacasa/pedidos/components/SantaCasaPedidosDialogs/SantaCasaPedidosDialogs.jsx
import ConfirmDialog from "../../../../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../../../../shared/ui/FeedbackDialog/FeedbackDialog";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

function getCancelPedidoDescription(pedidoToCancel) {
  if (!pedidoToCancel?.numero) {
    return PEDIDOS_PAGE.cancelDialog.description;
  }

  return `Pedido #${pedidoToCancel.numero}. ${PEDIDOS_PAGE.cancelDialog.description}`;
}

export default function SantaCasaPedidosDialogs({
  isClearDialogOpen = false,
  pedidoToCancel = null,
  isCancelingPedido = false,
  activeFeedback = null,

  onConfirmClearDraft,
  onCancelClearDraft,

  onConfirmCancelPedido,
  onCancelCancelPedido,

  onCloseFeedback,
}) {
  return (
    <>
      <ConfirmDialog
        isOpen={isClearDialogOpen}
        title={PEDIDOS_PAGE.clearDialog.title}
        description={PEDIDOS_PAGE.clearDialog.description}
        confirmLabel={PEDIDOS_PAGE.clearDialog.confirmLabel}
        cancelLabel={PEDIDOS_PAGE.clearDialog.cancelLabel}
        onConfirm={onConfirmClearDraft}
        onCancel={onCancelClearDraft}
      />

      <ConfirmDialog
        isOpen={Boolean(pedidoToCancel)}
        title={PEDIDOS_PAGE.cancelDialog.title}
        description={getCancelPedidoDescription(pedidoToCancel)}
        confirmLabel={PEDIDOS_PAGE.cancelDialog.confirmLabel}
        cancelLabel={PEDIDOS_PAGE.cancelDialog.cancelLabel}
        isLoading={isCancelingPedido}
        onConfirm={onConfirmCancelPedido}
        onCancel={onCancelCancelPedido}
      />

      <FeedbackDialog
        isOpen={Boolean(activeFeedback)}
        type={activeFeedback?.type}
        message={activeFeedback?.message}
        onClose={onCloseFeedback}
      />
    </>
  );
}
