import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import SystemUsersDialogs from "../SystemUsersDialogs/SystemUsersDialogs";
import SystemUserForm from "../SystemUserForm/SystemUserForm";
import SystemUsersFilters from "../SystemUsersFilters/SystemUsersFilters";
import SystemUsersList from "../SystemUsersList/SystemUsersList";

import { SYSTEM_USERS_PAGE } from "../../config/systemUsersPage.config";
import { useSystemUsers } from "../../hooks/useSystemUsers";
import { useSystemUsersDialogs } from "../../hooks/useSystemUsersDialogs";

import styles from "./SystemUsersPageContent.module.css";

function getPaginationLabel({ meta, currentPage, totalPages }) {
  const total = Number(meta?.total) || 0;
  const skip = Number(meta?.skip) || 0;
  const take = Number(meta?.take) || 0;

  if (total === 0) return SYSTEM_USERS_PAGE.pagination.noResults;

  return SYSTEM_USERS_PAGE.pagination.getPaginationLabel({
    start: skip + 1,
    end: Math.min(skip + take, total),
    total,
    currentPage,
    totalPages,
  });
}

export default function SystemUsersPageContent() {
  const {
    users,
    meta,

    filters,

    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,

    formState,
    isFormOpen,
    isCreateMode,
    isEditMode,
    isPasswordMode,

    isLoading,
    isRefreshing,
    isSubmitting,
    isBusy,
    statusChangingUserId,
    deletingUserId,

    error,
    feedback,

    currentUser,

    refreshUsers,

    updateFilter,
    clearFilters,
    goToPreviousPage,
    goToNextPage,

    openCreateForm,
    openEditForm,
    openPasswordForm,
    closeForm,
    updateFormValue,
    submitForm,

    toggleUserStatus,
    deleteUser,
  } = useSystemUsers();

  const {
    pendingStatusUser,
    pendingDeleteUser,
    handleRequestToggleStatus,
    handleCancelToggleStatus,
    handleConfirmToggleStatus,
    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,
  } = useSystemUsersDialogs({ toggleUserStatus, deleteUser });

  const paginationLabel = getPaginationLabel({
    meta,
    currentPage,
    totalPages,
  });

  return (
    <section className={styles.page} aria-labelledby="system-users-title">
      <PageHeader
        titleId="system-users-title"
        eyebrow={SYSTEM_USERS_PAGE.header.eyebrow}
        title={SYSTEM_USERS_PAGE.header.title}
        description={SYSTEM_USERS_PAGE.header.description}
      />

      <SystemUsersFilters
        filters={filters}
        isRefreshing={isRefreshing}
        isDisabled={isBusy}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        onRefresh={refreshUsers}
        onCreate={openCreateForm}
      />

      {isFormOpen ? (
        <SystemUserForm
          formState={formState}
          currentUser={currentUser}
          isCreateMode={isCreateMode}
          isEditMode={isEditMode}
          isPasswordMode={isPasswordMode}
          isSubmitting={isSubmitting}
          feedback={feedback}
          onValueChange={updateFormValue}
          onSubmit={submitForm}
          onCancel={closeForm}
        />
      ) : null}

      {feedback && !isFormOpen ? (
        <p
          className={
            feedback.type === "success"
              ? styles.feedbackSuccess
              : styles.feedbackError
          }
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      ) : null}

      <SystemUsersList
        users={users}
        meta={meta}
        currentUser={currentUser}
        isLoading={isLoading}
        error={error}
        statusChangingUserId={statusChangingUserId}
        deletingUserId={deletingUserId}
        onRefresh={refreshUsers}
        onEdit={openEditForm}
        onPassword={openPasswordForm}
        onToggleStatus={handleRequestToggleStatus}
        onDelete={handleRequestDelete}
      />

      <section
        className={styles.pagination}
        aria-label={SYSTEM_USERS_PAGE.pagination.ariaLabel}
      >
        <p className={styles.paginationInfo}>{paginationLabel}</p>

        <div className={styles.paginationActions}>
          <button
            type="button"
            className={styles.paginationButton}
            disabled={!hasPreviousPage || isLoading || isRefreshing || isBusy}
            onClick={goToPreviousPage}
          >
            {SYSTEM_USERS_PAGE.actions.previous}
          </button>

          <button
            type="button"
            className={styles.paginationButton}
            disabled={!hasNextPage || isLoading || isRefreshing || isBusy}
            onClick={goToNextPage}
          >
            {SYSTEM_USERS_PAGE.actions.next}
          </button>
        </div>
      </section>

      <SystemUsersDialogs
        pendingStatusUser={pendingStatusUser}
        pendingDeleteUser={pendingDeleteUser}
        statusChangingUserId={statusChangingUserId}
        deletingUserId={deletingUserId}
        onConfirmStatus={handleConfirmToggleStatus}
        onCancelStatus={handleCancelToggleStatus}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
      />
    </section>
  );
}
