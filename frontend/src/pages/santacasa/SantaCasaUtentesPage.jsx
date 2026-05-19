// src/pages/santacasa/SantaCasaUtentesPage.jsx
import { useState } from "react";

import Button from "../../shared/ui/Button/Button";
import ConfirmDialog from "../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../shared/ui/FeedbackDialog/FeedbackDialog";
import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import SantaCasaSectionNav from "../../features/santacasa/shared/components/SantaCasaSectionNav/SantaCasaSectionNav";

import UtenteCreateForm from "../../features/santacasa/utentes/components/UtenteCreateForm/UtenteCreateForm";
import UtentesList from "../../features/santacasa/utentes/components/UtentesList/UtentesList";
import { UTENTES_PAGE } from "../../features/santacasa/utentes/config/utentesPage.config";

import {
  UTENTE_ACTION_DIALOGS,
  UTENTE_ARCHIVE_DEFAULT_REASON,
} from "../../features/santacasa/utentes/config/utentesStatus.config";

import { useSantaCasaUtentes } from "../../features/santacasa/utentes/hooks/useSantaCasaUtentes";

import styles from "./SantaCasaUtentesPage.module.css";

const UTENTE_ACTIONS = Object.freeze({
  ARCHIVE: "archive",
  REACTIVATE: "reactivate",
});

function getActionDialogConfig(actionState) {
  if (!actionState?.type) {
    return UTENTE_ACTION_DIALOGS.archive;
  }

  return (
    UTENTE_ACTION_DIALOGS[actionState.type] || UTENTE_ACTION_DIALOGS.archive
  );
}

function buildActionDescription(actionState) {
  const config = getActionDialogConfig(actionState);
  const utenteName = actionState?.utente?.nome;

  if (!utenteName) {
    return config.description;
  }

  return `${config.description} Utente: ${utenteName}.`;
}

export default function SantaCasaUtentesPage() {
  const [pendingAction, setPendingAction] = useState(null);

  const {
    utentes,

    statusFilter,
    statusOptions,

    isLoading,
    isRefreshing,
    isCreating,
    isActionRunning,

    deletingUtenteId,
    archivingUtenteId,
    reactivatingUtenteId,

    utenteToDelete,

    error,
    feedback,
    setFeedback,

    handleRefreshUtentes,
    updateStatusFilter,

    handleCreateUtente,
    handleArchiveUtente,
    handleReactivateUtente,

    handleRequestDeleteUtente,
    handleCancelDeleteUtente,
    handleConfirmDeleteUtente,
  } = useSantaCasaUtentes();

  const actionDialog = getActionDialogConfig(pendingAction);

  function handleRequestArchiveUtente(utente) {
    setPendingAction({
      type: UTENTE_ACTIONS.ARCHIVE,
      utente,
    });
  }

  function handleRequestReactivateUtente(utente) {
    setPendingAction({
      type: UTENTE_ACTIONS.REACTIVATE,
      utente,
    });
  }

  function handleCancelPendingAction() {
    if (isActionRunning) return;

    setPendingAction(null);
  }

  async function handleConfirmPendingAction() {
    if (!pendingAction?.utente) return;

    if (pendingAction.type === UTENTE_ACTIONS.REACTIVATE) {
      const updated = await handleReactivateUtente(pendingAction.utente);

      if (updated) {
        setPendingAction(null);
      }

      return;
    }

    const updated = await handleArchiveUtente(pendingAction.utente, {
      archivedReason: UTENTE_ARCHIVE_DEFAULT_REASON,
    });

    if (updated) {
      setPendingAction(null);
    }
  }

  return (
    <section className={styles.page} aria-labelledby="utentes-title">
      <PageHeader
        titleId="utentes-title"
        eyebrow={UTENTES_PAGE.header.eyebrow}
        title={UTENTES_PAGE.header.title}
        description={UTENTES_PAGE.header.description}
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={handleRefreshUtentes}
            isLoading={isRefreshing}
            disabled={isRefreshing || isLoading}
          >
            {isRefreshing ? "A atualizar..." : "Atualizar lista"}
          </Button>
        }
      />

      <SantaCasaSectionNav />

      <section className={styles.toolbar} aria-label="Filtros de utentes">
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Estado dos utentes</span>

          <div className={styles.filterOptions}>
            {statusOptions.map((option) => {
              const isActive = statusFilter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={
                    isActive
                      ? `${styles.filterButton} ${styles.filterButtonActive}`
                      : styles.filterButton
                  }
                  disabled={isLoading || isRefreshing}
                  aria-pressed={isActive}
                  onClick={() => updateStatusFilter(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <UtenteCreateForm
          onCreate={handleCreateUtente}
          isSubmitting={isCreating}
        />

        <UtentesList
          utentes={utentes}
          isLoading={isLoading}
          error={error}
          deletingUtenteId={deletingUtenteId}
          archivingUtenteId={archivingUtenteId}
          reactivatingUtenteId={reactivatingUtenteId}
          onRetry={handleRefreshUtentes}
          onDelete={handleRequestDeleteUtente}
          onArchive={handleRequestArchiveUtente}
          onReactivate={handleRequestReactivateUtente}
        />
      </div>

      <ConfirmDialog
        isOpen={Boolean(utenteToDelete)}
        title={UTENTE_ACTION_DIALOGS.delete.title}
        description={
          utenteToDelete
            ? `${UTENTE_ACTION_DIALOGS.delete.description} Utente: ${utenteToDelete.nome}.`
            : UTENTE_ACTION_DIALOGS.delete.description
        }
        confirmLabel={UTENTE_ACTION_DIALOGS.delete.confirmLabel}
        cancelLabel="Cancelar"
        isLoading={Boolean(deletingUtenteId)}
        onConfirm={handleConfirmDeleteUtente}
        onCancel={handleCancelDeleteUtente}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        title={actionDialog.title}
        description={buildActionDescription(pendingAction)}
        confirmLabel={actionDialog.confirmLabel}
        cancelLabel="Cancelar"
        isLoading={isActionRunning}
        onConfirm={handleConfirmPendingAction}
        onCancel={handleCancelPendingAction}
      />

      <FeedbackDialog
        isOpen={Boolean(feedback)}
        type={feedback?.type}
        message={feedback?.message}
        onClose={() => setFeedback(null)}
      />
    </section>
  );
}
