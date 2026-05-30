// src/features/santacasa/utentes/components/UtentesPageContent/UtentesPageContent.jsx
import Button from "../../../../../shared/ui/Button/Button";
import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";


import { useUtentePendingAction } from "../../hooks/useUtentePendingAction";

import UtenteCreateForm from "../UtenteCreateForm/UtenteCreateForm";
import UtentesDialogs from "../UtentesDialogs/UtentesDialogs";
import UtentesList from "../UtentesList/UtentesList";
import UtentesPagination from "../UtentesPagination/UtentesPagination";
import UtentesToolbar from "../UtentesToolbar/UtentesToolbar";

import { UTENTES_PAGE } from "../../config/utentesPage.config";

import styles from "./UtentesPageContent.module.css";

export default function UtentesPageContent({
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
}) {
  const {
    pendingAction,
    actionDialog,

    handleRequestArchiveUtente,
    handleRequestReactivateUtente,
    handleCancelPendingAction,
    handleConfirmPendingAction,
  } = useUtentePendingAction({
    isActionRunning,
    onArchiveUtente: handleArchiveUtente,
    onReactivateUtente: handleReactivateUtente,
  });

  return (
    <section
      className={styles.page}
      aria-labelledby={UTENTES_PAGE.page.titleId}
    >
    

      <PageHeader
        titleId={UTENTES_PAGE.page.titleId}
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
            {isRefreshing
              ? UTENTES_PAGE.header.refreshingLabel
              : UTENTES_PAGE.header.refreshLabel}
          </Button>
        }
      />

      <div className={styles.content}>
        <UtenteCreateForm
          onCreate={handleCreateUtente}
          isSubmitting={isCreating}
        />

        <UtentesToolbar
          statusFilter={statusFilter}
          statusOptions={statusOptions}
          searchInput={searchInput}
          searchQuery={searchQuery}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          updateStatusFilter={updateStatusFilter}
          updateSearchInput={updateSearchInput}
          handleSubmitSearch={handleSubmitSearch}
          handleClearSearch={handleClearSearch}
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

        <UtentesPagination
          pagination={pagination}
          currentPage={currentPage}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      </div>

      <UtentesDialogs
        utenteToDelete={utenteToDelete}
        deletingUtenteId={deletingUtenteId}
        pendingAction={pendingAction}
        actionDialog={actionDialog}
        isActionRunning={isActionRunning}
        feedback={feedback}
        setFeedback={setFeedback}
        onConfirmDelete={handleConfirmDeleteUtente}
        onCancelDelete={handleCancelDeleteUtente}
        onConfirmPendingAction={handleConfirmPendingAction}
        onCancelPendingAction={handleCancelPendingAction}
      />
    </section>
  );
}
