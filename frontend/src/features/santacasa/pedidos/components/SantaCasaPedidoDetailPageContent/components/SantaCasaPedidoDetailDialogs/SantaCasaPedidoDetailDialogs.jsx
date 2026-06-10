import ConfirmDialog from "../../../../../../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../../../../../../shared/ui/FeedbackDialog/FeedbackDialog";

import { PEDIDOS_PAGE } from "../../../../config/pedidosPage.config";

function getCancelDescription(pedido) {
  const pedidoNumber = Number(pedido?.numero);

  if (!Number.isFinite(pedidoNumber)) {
    return PEDIDOS_PAGE.cancelDialog.description;
  }

  return `Pedido #${pedidoNumber}. ${PEDIDOS_PAGE.cancelDialog.description}`;
}

export default function SantaCasaPedidoDetailDialogs({
  pedido = null,

  isCancelDialogOpen = false,
  isCanceling = false,

  feedback = null,

  onConfirmCancel,
  onCloseCancel,
  onCloseFeedback,
}) {
  return (
    <>
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        title={PEDIDOS_PAGE.cancelDialog.title}
        description={getCancelDescription(pedido)}
        confirmLabel={PEDIDOS_PAGE.cancelDialog.confirmLabel}
        cancelLabel={PEDIDOS_PAGE.cancelDialog.cancelLabel}
        isLoading={isCanceling}
        onConfirm={onConfirmCancel}
        onCancel={onCloseCancel}
      />

      <FeedbackDialog
        isOpen={Boolean(feedback)}
        type={feedback?.type}
        message={feedback?.message}
        onClose={onCloseFeedback}
      />
    </>
  );
}
