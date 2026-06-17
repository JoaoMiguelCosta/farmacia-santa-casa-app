// src/features/santacasa/medicacao-habitual/components/MedicacaoHabitualManager/MedicacaoHabitualManager.jsx
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { MEDICACAO_HABITUAL_CONFIG } from "../../config/medicacaoHabitual.config";

import MedicacaoHabitualDialogs from "./MedicacaoHabitualDialogs";
import MedicacaoHabitualForm from "./MedicacaoHabitualForm";
import MedicacaoHabitualHeader from "./MedicacaoHabitualHeader";
import MedicacaoHabitualList from "./MedicacaoHabitualList";

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

  if (!selectedUtenteId) {
    return (
      <DataState
        type="empty"
        title={section.noUtenteTitle}
        description={section.noUtenteDescription}
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={section.loadingTitle}
        description={section.loadingDescription}
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={section.errorTitle}
        description={error}
        actionLabel={section.retryLabel}
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
        <div className={styles.content}>
          <MedicacaoHabitualHeader
            selectedUtente={selectedUtente}
            hasMedicacoes={hasMedicacoes}
            isRefreshing={isRefreshing}
            isBusy={isBusy}
            onRefresh={refreshMedicacaoHabitual}
            onClear={requestClearMedicacao}
          />

          <MedicacaoHabitualForm
            medicamentoInput={medicamentoInput}
            inputError={inputError}
            isCreating={isCreating}
            isClearing={isClearing}
            onSubmit={handleSubmit}
            onInputChange={updateMedicamentoInput}
          />

          <MedicacaoHabitualList
            medicacoes={medicacoes}
            hasMedicacoes={hasMedicacoes}
            deletingMedicacaoId={deletingMedicacaoId}
            isBusy={isBusy}
            onRequestDelete={requestDeleteMedicacao}
          />
        </div>
      </SurfaceCard>

      <MedicacaoHabitualDialogs
        feedback={feedback}
        deleteTarget={deleteTarget}
        isDeleteDialogOpen={isDeleteDialogOpen}
        isClearDialogOpen={isClearDialogOpen}
        isClearing={isClearing}
        deletingMedicacaoId={deletingMedicacaoId}
        onClearFeedback={clearFeedback}
        onConfirmDelete={confirmDeleteMedicacao}
        onCancelDelete={cancelDeleteMedicacao}
        onConfirmClear={confirmClearMedicacao}
        onCancelClear={cancelClearMedicacao}
      />
    </>
  );
}
