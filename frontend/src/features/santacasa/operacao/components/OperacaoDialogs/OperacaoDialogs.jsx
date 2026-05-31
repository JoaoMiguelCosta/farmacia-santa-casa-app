// src/features/santacasa/operacao/components/OperacaoDialogs/OperacaoDialogs.jsx
import ConfirmDialog from "../../../../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../../../../shared/ui/FeedbackDialog/FeedbackDialog";

export default function OperacaoDialogs({
  regularizacaoConfirmation,
  regularizacaoDialogData,
  isConfirmingRegularizacao,

  deleteTarget,
  deleteDialogData,
  deletingTargetKey,

  feedback,
  setFeedback,

  onConfirmRegularizacao,
  onCancelRegularizacao,

  onConfirmDelete,
  onCancelDelete,
}) {
  return (
    <>
      <ConfirmDialog
        isOpen={Boolean(regularizacaoConfirmation)}
        title={regularizacaoDialogData.title}
        description={regularizacaoDialogData.description}
        confirmLabel={regularizacaoDialogData.confirmLabel}
        cancelLabel={regularizacaoDialogData.cancelLabel}
        isLoading={isConfirmingRegularizacao}
        onConfirm={onConfirmRegularizacao}
        onCancel={onCancelRegularizacao}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteDialogData.title}
        description={deleteDialogData.description}
        confirmLabel={deleteDialogData.confirmLabel}
        cancelLabel={deleteDialogData.cancelLabel}
        isLoading={Boolean(deletingTargetKey)}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
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
