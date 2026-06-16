// src/features/santacasa/medicacao-habitual/components/MedicacaoHabitualManager/MedicacaoHabitualDialogs.jsx
import ConfirmDialog from "../../../../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../../../../shared/ui/FeedbackDialog/FeedbackDialog";

import { MEDICACAO_HABITUAL_CONFIG } from "../../config/medicacaoHabitual.config";

export default function MedicacaoHabitualDialogs({
  feedback,
  deleteTarget,
  isDeleteDialogOpen,
  isClearDialogOpen,
  isClearing,
  deletingMedicacaoId,
  onClearFeedback,
  onConfirmDelete,
  onCancelDelete,
  onConfirmClear,
  onCancelClear,
}) {
  return (
    <>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={MEDICACAO_HABITUAL_CONFIG.deleteDialog.title}
        description={`${MEDICACAO_HABITUAL_CONFIG.deleteDialog.description} ${
          MEDICACAO_HABITUAL_CONFIG.deleteDialog.medicationPrefix
        } ${
          deleteTarget?.medicamento ||
          MEDICACAO_HABITUAL_CONFIG.deleteDialog.emptyMedication
        }.`}
        confirmLabel={MEDICACAO_HABITUAL_CONFIG.deleteDialog.confirmLabel}
        cancelLabel={MEDICACAO_HABITUAL_CONFIG.deleteDialog.cancelLabel}
        isLoading={Boolean(deletingMedicacaoId)}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />

      <ConfirmDialog
        isOpen={isClearDialogOpen}
        title={MEDICACAO_HABITUAL_CONFIG.clearDialog.title}
        description={MEDICACAO_HABITUAL_CONFIG.clearDialog.description}
        confirmLabel={MEDICACAO_HABITUAL_CONFIG.clearDialog.confirmLabel}
        cancelLabel={MEDICACAO_HABITUAL_CONFIG.clearDialog.cancelLabel}
        isLoading={isClearing}
        onConfirm={onConfirmClear}
        onCancel={onCancelClear}
      />

      <FeedbackDialog
        isOpen={Boolean(feedback)}
        type={feedback?.type}
        message={feedback?.message}
        onClose={onClearFeedback}
      />
    </>
  );
}
