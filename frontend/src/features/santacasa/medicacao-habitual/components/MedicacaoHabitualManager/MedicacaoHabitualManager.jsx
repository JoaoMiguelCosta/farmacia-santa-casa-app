import Button from "../../../../../shared/ui/Button/Button";
import ConfirmDialog from "../../../../../shared/ui/ConfirmDialog/ConfirmDialog";
import DataState from "../../../../../shared/ui/DataState/DataState";
import FeedbackDialog from "../../../../../shared/ui/FeedbackDialog/FeedbackDialog";
import FormField from "../../../../../shared/ui/FormField/FormField";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";
import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { MEDICACAO_HABITUAL_CONFIG } from "../../config/medicacaoHabitual.config";

import styles from "./MedicacaoHabitualManager.module.css";

export default function MedicacaoHabitualManager({
  selectedUtenteId = "",
  selectedUtente = null,
  controller,
}) {
  const {
    medicacoes = [],
    hasMedicacoes = false,

    medicamentoInput = "",
    inputError = "",

    deleteTarget = null,
    isDeleteDialogOpen = false,
    isClearDialogOpen = false,

    isLoading = false,
    isRefreshing = false,
    isCreating = false,
    isClearing = false,
    deletingMedicacaoId = null,
    isBusy = false,

    error = null,
    feedback = null,

    refreshMedicacaoHabitual = () => {},

    updateMedicamentoInput = () => {},
    handleSubmit = () => {},

    requestDeleteMedicacao = () => {},
    cancelDeleteMedicacao = () => {},
    confirmDeleteMedicacao = () => {},

    requestClearMedicacao = () => {},
    cancelClearMedicacao = () => {},
    confirmClearMedicacao = () => {},

    clearFeedback = () => {},
  } = controller || {};

  const section = MEDICACAO_HABITUAL_CONFIG.section;
  const form = MEDICACAO_HABITUAL_CONFIG.form;
  const field = MEDICACAO_HABITUAL_CONFIG.fields.medicamento;
  const list = MEDICACAO_HABITUAL_CONFIG.list;

  if (!selectedUtenteId) {
    return (
      <DataState
        type="empty"
        title="Seleciona um utente."
        description="Depois de selecionares um utente, podes gerir a medicação habitual."
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={section.loadingTitle}
        description="Aguarda enquanto a medicação habitual é carregada."
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={section.errorTitle}
        description={error}
        actionLabel="Tentar novamente"
        onAction={refreshMedicacaoHabitual}
      />
    );
  }

  return (
    <>
      <SurfaceCard
        title={section.title}
        description={section.description}
        tone="strong"
      >
        <div className={styles.header}>
          <div className={styles.context}>
            <span className={styles.contextLabel}>Utente selecionado</span>
            <strong>{selectedUtente?.nome || "Utente selecionado"}</strong>
            <span>{selectedUtente?.numero9 || selectedUtenteId}</span>
          </div>

          <div className={styles.headerActions}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              isLoading={isRefreshing}
              disabled={isRefreshing || isBusy}
              onClick={refreshMedicacaoHabitual}
            >
              {isRefreshing ? "A atualizar..." : "Atualizar"}
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={!hasMedicacoes || isBusy}
              onClick={requestClearMedicacao}
            >
              {list.clearLabel}
            </Button>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formIntro}>
            <h3>{form.title}</h3>
            <p>{form.description}</p>
          </div>

          <div className={styles.formGrid}>
            <FormField
              id={field.id}
              label={field.label}
              hint={field.hint}
              error={inputError}
              required
            >
              <input
                id={field.id}
                type="text"
                placeholder={field.placeholder}
                value={medicamentoInput}
                disabled={isCreating || isClearing}
                autoComplete="off"
                onChange={(event) => updateMedicamentoInput(event.target.value)}
              />
            </FormField>

            <div className={styles.formAction}>
              <Button
                type="submit"
                isLoading={isCreating}
                disabled={isCreating || isClearing}
              >
                {isCreating ? form.submittingLabel : form.submitLabel}
              </Button>
            </div>
          </div>
        </form>

        {!hasMedicacoes ? (
          <div className={styles.emptyState} role="status">
            <strong>{section.emptyTitle}</strong>
            <span>{section.emptyDescription}</span>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>
                Lista de medicação habitual do utente selecionado
              </caption>

              <thead>
                <tr>
                  <th scope="col">Medicamento</th>
                  <th scope="col">Criado em</th>
                  <th scope="col">Atualizado em</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>

              <tbody>
                {medicacoes.map((medicacao) => {
                  const isDeleting = deletingMedicacaoId === medicacao.id;

                  return (
                    <tr key={medicacao.id}>
                      <td>
                        <strong>{medicacao.medicamento}</strong>
                        <span>{medicacao.id}</span>
                      </td>

                      <td>
                        <span>{formatDateTime(medicacao.createdAt)}</span>
                      </td>

                      <td>
                        <span>{formatDateTime(medicacao.updatedAt)}</span>
                      </td>

                      <td className={styles.actionCell}>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          isLoading={isDeleting}
                          disabled={isBusy}
                          aria-label={`Remover ${medicacao.medicamento} da medicação habitual`}
                          onClick={() => requestDeleteMedicacao(medicacao)}
                        >
                          {isDeleting ? list.removingLabel : list.removeLabel}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={MEDICACAO_HABITUAL_CONFIG.deleteDialog.title}
        description={`${MEDICACAO_HABITUAL_CONFIG.deleteDialog.description} Medicamento: ${
          deleteTarget?.medicamento || "—"
        }.`}
        confirmLabel={MEDICACAO_HABITUAL_CONFIG.deleteDialog.confirmLabel}
        cancelLabel={MEDICACAO_HABITUAL_CONFIG.deleteDialog.cancelLabel}
        isLoading={Boolean(deletingMedicacaoId)}
        onConfirm={confirmDeleteMedicacao}
        onCancel={cancelDeleteMedicacao}
      />

      <ConfirmDialog
        isOpen={isClearDialogOpen}
        title={MEDICACAO_HABITUAL_CONFIG.clearDialog.title}
        description={MEDICACAO_HABITUAL_CONFIG.clearDialog.description}
        confirmLabel={MEDICACAO_HABITUAL_CONFIG.clearDialog.confirmLabel}
        cancelLabel={MEDICACAO_HABITUAL_CONFIG.clearDialog.cancelLabel}
        isLoading={isClearing}
        onConfirm={confirmClearMedicacao}
        onCancel={cancelClearMedicacao}
      />

      <FeedbackDialog
        isOpen={Boolean(feedback)}
        type={feedback?.type}
        message={feedback?.message}
        onClose={clearFeedback}
      />
    </>
  );
}
