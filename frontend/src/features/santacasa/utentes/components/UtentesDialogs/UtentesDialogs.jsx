// src/features/santacasa/utentes/components/UtentesDialogs/UtentesDialogs.jsx
import ConfirmDialog from "../../../../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../../../../shared/ui/FeedbackDialog/FeedbackDialog";

import { UTENTES_PAGE } from "../../config/utentesPage.config";
import { UTENTE_ACTION_DIALOGS } from "../../config/utentesStatus.config";

import {
  buildUtenteActionDescription,
  buildUtenteDeleteDescription,
} from "../../utils/utentesPage.utils";

export default function UtentesDialogs({
  utenteToDelete,
  deletingUtenteId,

  pendingAction,
  actionDialog,
  isActionRunning,

  feedback,
  setFeedback,

  onConfirmDelete,
  onCancelDelete,

  onConfirmPendingAction,
  onCancelPendingAction,
}) {
  return (
    <>
      <ConfirmDialog
        isOpen={Boolean(utenteToDelete)}
        title={UTENTE_ACTION_DIALOGS.delete.title}
        description={buildUtenteDeleteDescription(utenteToDelete)}
        confirmLabel={UTENTE_ACTION_DIALOGS.delete.confirmLabel}
        cancelLabel={UTENTES_PAGE.dialogs.cancelLabel}
        isLoading={Boolean(deletingUtenteId)}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        title={actionDialog.title}
        description={buildUtenteActionDescription(pendingAction)}
        confirmLabel={actionDialog.confirmLabel}
        cancelLabel={UTENTES_PAGE.dialogs.cancelLabel}
        isLoading={isActionRunning}
        onConfirm={onConfirmPendingAction}
        onCancel={onCancelPendingAction}
      />

      <FeedbackDialog
        isOpen={Boolean(feedback)}
        type={feedback?.type}
        message={feedback?.message}
        onClose={() => setFeedback(null)}
      />
    </>
  );
}
