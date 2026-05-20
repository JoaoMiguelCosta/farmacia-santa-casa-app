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

function getPaginationLabel({ pagination, currentPage, totalPages }) {
  const total = Number(pagination?.total) || 0;
  const skip = Number(pagination?.skip) || 0;
  const take = Number(pagination?.take) || 0;

  if (total === 0) {
    return "Sem resultados.";
  }

  const start = skip + 1;
  const end = Math.min(skip + take, total);

  return `A mostrar ${start}-${end} de ${total} utente(s). Página ${currentPage} de ${totalPages}.`;
}

export default function SantaCasaUtentesPage() {
  const [pendingAction, setPendingAction] = useState(null);

  const {
    utentes,

    statusFilter,
    statusOptions,

    searchInput,
    searchQuery,

    pagination,
    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,

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
    updateSearchInput,
    handleSubmitSearch,
    handleClearSearch,
    handlePreviousPage,
    handleNextPage,

    handleCreateUtente,
    handleArchiveUtente,
    handleReactivateUtente,

    handleRequestDeleteUtente,
    handleCancelDeleteUtente,
    handleConfirmDeleteUtente,
  } = useSantaCasaUtentes();

  const actionDialog = getActionDialogConfig(pendingAction);
  const paginationLabel = getPaginationLabel({
    pagination,
    currentPage,
    totalPages,
  });

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

        <form className={styles.searchGroup} onSubmit={handleSubmitSearch}>
          <label className={styles.filterLabel} htmlFor="utentes-search">
            Pesquisa
          </label>

          <div className={styles.searchControls}>
            <input
              id="utentes-search"
              className={styles.searchInput}
              type="search"
              placeholder="Nome ou número de utente"
              value={searchInput}
              disabled={isLoading || isRefreshing}
              onChange={(event) => updateSearchInput(event.target.value)}
            />

            <Button
              type="submit"
              size="sm"
              disabled={isLoading || isRefreshing}
            >
              Pesquisar
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={
                isLoading || isRefreshing || (!searchInput && !searchQuery)
              }
              onClick={handleClearSearch}
            >
              Limpar
            </Button>
          </div>
        </form>
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

        <section
          className={styles.pagination}
          aria-label="Paginação de utentes"
        >
          <p className={styles.paginationInfo}>{paginationLabel}</p>

          <div className={styles.paginationActions}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!hasPreviousPage || isLoading || isRefreshing}
              onClick={handlePreviousPage}
            >
              Anterior
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!hasNextPage || isLoading || isRefreshing}
              onClick={handleNextPage}
            >
              Seguinte
            </Button>
          </div>
        </section>
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
