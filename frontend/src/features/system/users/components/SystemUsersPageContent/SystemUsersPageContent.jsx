// src/features/system/users/components/SystemUsersPageContent/SystemUsersPageContent.jsx

import { useState } from "react";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import SystemUserForm from "../SystemUserForm/SystemUserForm";
import SystemUsersFilters from "../SystemUsersFilters/SystemUsersFilters";
import SystemUsersList from "../SystemUsersList/SystemUsersList";

import { SYSTEM_USERS_PAGE } from "../../config/systemUsersPage.config";
import { useSystemUsers } from "../../hooks/useSystemUsers";

import styles from "./SystemUsersPageContent.module.css";

function getStatusActionLabel(user) {
  if (!user) return "";

  return user.isActive
    ? SYSTEM_USERS_PAGE.actions.deactivate
    : SYSTEM_USERS_PAGE.actions.activate;
}

function getStatusConfirmDescription(user) {
  if (!user) return "";

  if (user.isActive) {
    return "Esta conta ficará inativa e deixará de conseguir iniciar sessão no sistema.";
  }

  return "Esta conta voltará a ficar ativa e poderá iniciar sessão no sistema.";
}

function getDeleteConfirmDescription(user) {
  if (!user) return "";

  return "Esta ação só será permitida se a conta estiver desativada e não tiver histórico associado. Caso tenha histórico de validações ou rejeições, o sistema vai bloquear a remoção.";
}

function getPaginationLabel({ meta, currentPage, totalPages }) {
  const total = Number(meta?.total) || 0;
  const skip = Number(meta?.skip) || 0;
  const take = Number(meta?.take) || 0;

  if (total === 0) {
    return "Sem resultados.";
  }

  const start = skip + 1;
  const end = Math.min(skip + take, total);

  return `A mostrar ${start}-${end} de ${total} utilizador(es). Página ${currentPage} de ${totalPages}.`;
}

export default function SystemUsersPageContent() {
  const [pendingStatusUser, setPendingStatusUser] = useState(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);

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

  const isStatusDialogOpen = Boolean(pendingStatusUser);
  const isDeleteDialogOpen = Boolean(pendingDeleteUser);
  const pendingStatusActionLabel = getStatusActionLabel(pendingStatusUser);

  const paginationLabel = getPaginationLabel({
    meta,
    currentPage,
    totalPages,
  });

  function handleRequestToggleStatus(user) {
    setPendingDeleteUser(null);
    setPendingStatusUser(user);
  }

  function handleCancelToggleStatus() {
    setPendingStatusUser(null);
  }

  async function handleConfirmToggleStatus() {
    if (!pendingStatusUser) return;

    await toggleUserStatus(pendingStatusUser);
    setPendingStatusUser(null);
  }

  function handleRequestDelete(user) {
    setPendingStatusUser(null);
    setPendingDeleteUser(user);
  }

  function handleCancelDelete() {
    setPendingDeleteUser(null);
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteUser) return;

    await deleteUser(pendingDeleteUser);
    setPendingDeleteUser(null);
  }

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
        aria-label="Paginação de utilizadores do sistema"
      >
        <p className={styles.paginationInfo}>{paginationLabel}</p>

        <div className={styles.paginationActions}>
          <button
            type="button"
            className={styles.cancelButton}
            disabled={!hasPreviousPage || isLoading || isRefreshing || isBusy}
            onClick={goToPreviousPage}
          >
            {SYSTEM_USERS_PAGE.actions.previous}
          </button>

          <button
            type="button"
            className={styles.cancelButton}
            disabled={!hasNextPage || isLoading || isRefreshing || isBusy}
            onClick={goToNextPage}
          >
            {SYSTEM_USERS_PAGE.actions.next}
          </button>
        </div>
      </section>

      {isStatusDialogOpen ? (
        <div className={styles.dialogBackdrop} role="presentation">
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="system-users-status-confirm-title"
            aria-describedby="system-users-status-confirm-description"
          >
            <div className={styles.dialogContent}>
              <p className={styles.dialogEyebrow}>Confirmação necessária</p>

              <h2
                id="system-users-status-confirm-title"
                className={styles.dialogTitle}
              >
                {pendingStatusActionLabel} utilizador?
              </h2>

              <p
                id="system-users-status-confirm-description"
                className={styles.dialogDescription}
              >
                {getStatusConfirmDescription(pendingStatusUser)}
              </p>

              <dl className={styles.dialogUser}>
                <div>
                  <dt>Nome</dt>
                  <dd>{pendingStatusUser?.name}</dd>
                </div>

                <div>
                  <dt>Email</dt>
                  <dd>{pendingStatusUser?.email}</dd>
                </div>

                <div>
                  <dt>Estado atual</dt>
                  <dd>{pendingStatusUser?.statusLabel}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.cancelButton}
                disabled={Boolean(statusChangingUserId)}
                onClick={handleCancelToggleStatus}
              >
                {SYSTEM_USERS_PAGE.actions.cancel}
              </button>

              <button
                type="button"
                className={
                  pendingStatusUser?.isActive
                    ? styles.dangerButton
                    : styles.confirmButton
                }
                disabled={Boolean(statusChangingUserId)}
                onClick={handleConfirmToggleStatus}
              >
                {statusChangingUserId
                  ? SYSTEM_USERS_PAGE.actions.saving
                  : pendingStatusActionLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isDeleteDialogOpen ? (
        <div className={styles.dialogBackdrop} role="presentation">
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="system-users-delete-confirm-title"
            aria-describedby="system-users-delete-confirm-description"
          >
            <div className={styles.dialogContent}>
              <p className={styles.dialogEyebrow}>Remoção segura</p>

              <h2
                id="system-users-delete-confirm-title"
                className={styles.dialogTitle}
              >
                Remover utilizador?
              </h2>

              <p
                id="system-users-delete-confirm-description"
                className={styles.dialogDescription}
              >
                {getDeleteConfirmDescription(pendingDeleteUser)}
              </p>

              <dl className={styles.dialogUser}>
                <div>
                  <dt>Nome</dt>
                  <dd>{pendingDeleteUser?.name}</dd>
                </div>

                <div>
                  <dt>Email</dt>
                  <dd>{pendingDeleteUser?.email}</dd>
                </div>

                <div>
                  <dt>Estado atual</dt>
                  <dd>{pendingDeleteUser?.statusLabel}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.cancelButton}
                disabled={Boolean(deletingUserId)}
                onClick={handleCancelDelete}
              >
                {SYSTEM_USERS_PAGE.actions.cancel}
              </button>

              <button
                type="button"
                className={styles.dangerButton}
                disabled={Boolean(deletingUserId)}
                onClick={handleConfirmDelete}
              >
                {deletingUserId
                  ? SYSTEM_USERS_PAGE.actions.removing
                  : SYSTEM_USERS_PAGE.actions.remove}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
