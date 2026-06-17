import ConfirmDialog from "../../../../../../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../../../../../../shared/ui/FeedbackDialog/FeedbackDialog";

import { PEDIDOS_PAGE } from "../../../../config/pedidosPage.config";

export default function SantaCasaPedidosDialogs({
  isClearDialogOpen = false,
  activeFeedback = null,

  onConfirmClearDraft,
  onCancelClearDraft,

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

      <FeedbackDialog
        isOpen={Boolean(activeFeedback)}
        type={activeFeedback?.type}
        message={activeFeedback?.message}
        onClose={onCloseFeedback}
      />
    </>
  );
}
