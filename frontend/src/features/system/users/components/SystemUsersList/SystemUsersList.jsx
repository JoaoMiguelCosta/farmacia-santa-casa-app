import { formatDateTime } from "../../../../../shared/utils/formatDate";

import styles from "./SystemUsersList.module.css";

import { SYSTEM_USERS_PAGE } from "../../config/systemUsersPage.config";
import { canToggleSystemUserStatus } from "../../utils/systemUsers.utils";

function SystemUsersListState({ title, description, actionLabel, onAction }) {
  return (
    <div className={styles.state}>
      <strong className={styles.stateTitle}>{title}</strong>

      {description ? (
        <p className={styles.stateDescription}>{description}</p>
      ) : null}

      {actionLabel && onAction ? (
        <button type="button" className={styles.stateAction} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function SystemUserCard({
  user,
  currentUser,
  isChangingStatus = false,
  isDeleting = false,
  onEdit,
  onPassword,
  onToggleStatus,
  onDelete,
}) {
  const canToggle = canToggleSystemUserStatus(user, currentUser);
  const isCurrentUser = user.id === currentUser?.id;
  const canDelete = !user.isActive && !isCurrentUser;

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.identity}>
          <span
            className={
              user.isActive ? styles.statusDotActive : styles.statusDotInactive
            }
            aria-hidden="true"
          />

          <div className={styles.userInfo}>
            <h3 className={styles.name}>{user.name}</h3>
            <p className={styles.email}>{user.email}</p>
          </div>
        </div>

        <span
          className={
            user.isActive ? styles.statusActive : styles.statusInactive
          }
        >
          {user.statusLabel}
        </span>
      </header>

      <dl className={styles.metaGrid}>
        <div>
          <dt>Perfil</dt>
          <dd>{user.roleLabel}</dd>
        </div>

        <div>
          <dt>Criado em</dt>
          <dd>{formatDateTime(user.createdAt)}</dd>
        </div>

        <div>
          <dt>Atualizado em</dt>
          <dd>{formatDateTime(user.updatedAt)}</dd>
        </div>

        <div>
          <dt>Conta atual</dt>
          <dd>{isCurrentUser ? "Sim" : "Não"}</dd>
        </div>
      </dl>

      <footer className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={isDeleting}
          onClick={() => onEdit?.(user)}
        >
          {SYSTEM_USERS_PAGE.actions.edit}
        </button>

        <button
          type="button"
          className={styles.secondaryButton}
          disabled={isDeleting}
          onClick={() => onPassword?.(user)}
        >
          {SYSTEM_USERS_PAGE.actions.changePassword}
        </button>

        <button
          type="button"
          className={user.isActive ? styles.dangerButton : styles.primaryButton}
          disabled={!canToggle || isChangingStatus || isDeleting}
          title={
            canToggle
              ? undefined
              : SYSTEM_USERS_PAGE.feedback.selfDeactivateBlocked
          }
          onClick={() => onToggleStatus?.(user)}
        >
          {isChangingStatus
            ? SYSTEM_USERS_PAGE.actions.saving
            : user.isActive
              ? SYSTEM_USERS_PAGE.actions.deactivate
              : SYSTEM_USERS_PAGE.actions.activate}
        </button>

        {!user.isActive ? (
          <button
            type="button"
            className={styles.removeButton}
            disabled={!canDelete || isDeleting || isChangingStatus}
            title={
              canDelete
                ? undefined
                : SYSTEM_USERS_PAGE.feedback.selfDeleteBlocked
            }
            onClick={() => onDelete?.(user)}
          >
            {isDeleting
              ? SYSTEM_USERS_PAGE.actions.removing
              : SYSTEM_USERS_PAGE.actions.remove}
          </button>
        ) : null}
      </footer>
    </article>
  );
}

export default function SystemUsersList({
  users = [],
  meta = {},
  currentUser = null,
  isLoading = false,
  error = null,
  statusChangingUserId = null,
  deletingUserId = null,
  onRefresh,
  onEdit,
  onPassword,
  onToggleStatus,
  onDelete,
}) {
  const hasUsers = users.length > 0;
  const sectionConfig = SYSTEM_USERS_PAGE.sections.list;

  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <SystemUsersListState
          title={sectionConfig.loadingTitle}
          description="Aguarda enquanto os utilizadores são carregados."
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section} aria-live="polite">
        <SystemUsersListState
          title={sectionConfig.errorTitle}
          description={error}
          actionLabel={SYSTEM_USERS_PAGE.actions.refresh}
          onAction={onRefresh}
        />
      </section>
    );
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="system-users-list-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id="system-users-list-title" className={styles.title}>
            {sectionConfig.title}
          </h2>

          <p className={styles.description}>{sectionConfig.description}</p>
        </div>

        <span className={styles.total}>
          Total: <strong>{meta.total ?? users.length}</strong>
        </span>
      </header>

      {!hasUsers ? (
        <SystemUsersListState
          title={sectionConfig.emptyTitle}
          description={sectionConfig.emptyDescription}
          actionLabel={SYSTEM_USERS_PAGE.actions.refresh}
          onAction={onRefresh}
        />
      ) : (
        <div className={styles.grid}>
          {users.map((user) => (
            <SystemUserCard
              key={user.id}
              user={user}
              currentUser={currentUser}
              isChangingStatus={statusChangingUserId === user.id}
              isDeleting={deletingUserId === user.id}
              onEdit={onEdit}
              onPassword={onPassword}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
