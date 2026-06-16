import Button from "../../../../../shared/ui/Button/Button";

import styles from "./SystemUserForm.module.css";

import { SYSTEM_USERS_PAGE } from "../../config/systemUsersPage.config";
import { SYSTEM_USERS_ROLE_OPTIONS } from "../../utils/systemUsers.utils";

function getFormTitle({ isCreateMode, isEditMode, isPasswordMode }) {
  if (isCreateMode) return SYSTEM_USERS_PAGE.sections.form.createTitle;
  if (isEditMode) return SYSTEM_USERS_PAGE.sections.form.editTitle;
  if (isPasswordMode) return SYSTEM_USERS_PAGE.sections.form.passwordTitle;

  return "";
}

function getSubmitLabel({
  isCreateMode,
  isEditMode,
  isPasswordMode,
  isSubmitting,
}) {
  if (isCreateMode) {
    return isSubmitting
      ? SYSTEM_USERS_PAGE.actions.creating
      : SYSTEM_USERS_PAGE.actions.create;
  }

  if (isEditMode) {
    return isSubmitting
      ? SYSTEM_USERS_PAGE.actions.saving
      : SYSTEM_USERS_PAGE.actions.save;
  }

  if (isPasswordMode) {
    return isSubmitting
      ? SYSTEM_USERS_PAGE.actions.changingPassword
      : SYSTEM_USERS_PAGE.actions.changePassword;
  }

  return SYSTEM_USERS_PAGE.actions.save;
}

export default function SystemUserForm({
  formState,
  isCreateMode = false,
  isEditMode = false,
  isPasswordMode = false,
  isSubmitting = false,
  feedback = null,
  onValueChange,
  onSubmit,
  onCancel,
}) {
  if (!formState?.mode) return null;

  const values = formState.values || {};
  const selectedUser = formState.selectedUser;
  const title = getFormTitle({
    isCreateMode,
    isEditMode,
    isPasswordMode,
  });

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.();
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="system-user-form-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Gestão de conta</p>

          <h2 id="system-user-form-title" className={styles.title}>
            {title}
          </h2>

          {selectedUser ? (
            <p className={styles.description}>
              Conta selecionada: <strong>{selectedUser.email}</strong>
            </p>
          ) : (
            <p className={styles.description}>
              Define os dados necessários para a conta de utilizador.
            </p>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          {SYSTEM_USERS_PAGE.actions.close}
        </Button>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {!isPasswordMode ? (
          <>
            <label className={styles.field}>
              <span>{SYSTEM_USERS_PAGE.fields.name.label}</span>

              <input
                type="text"
                value={values.name ?? ""}
                placeholder={SYSTEM_USERS_PAGE.fields.name.placeholder}
                autoComplete="name"
                disabled={isSubmitting}
                onChange={(event) =>
                  onValueChange?.("name", event.target.value)
                }
              />
            </label>

            <label className={styles.field}>
              <span>{SYSTEM_USERS_PAGE.fields.email.label}</span>

              <input
                type="email"
                value={values.email ?? ""}
                placeholder={SYSTEM_USERS_PAGE.fields.email.placeholder}
                autoComplete="email"
                disabled={isSubmitting}
                onChange={(event) =>
                  onValueChange?.("email", event.target.value)
                }
              />
            </label>

            <label className={styles.field}>
              <span>{SYSTEM_USERS_PAGE.fields.role.label}</span>

              <select
                value={values.role ?? ""}
                disabled={isSubmitting}
                onChange={(event) =>
                  onValueChange?.("role", event.target.value)
                }
              >
                {SYSTEM_USERS_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {isCreateMode || isPasswordMode ? (
          <label className={styles.field}>
            <span>{SYSTEM_USERS_PAGE.fields.password.label}</span>

            <input
              type="password"
              value={values.password ?? ""}
              placeholder={SYSTEM_USERS_PAGE.fields.password.placeholder}
              autoComplete={isCreateMode ? "new-password" : "off"}
              disabled={isSubmitting}
              onChange={(event) =>
                onValueChange?.("password", event.target.value)
              }
            />
          </label>
        ) : null}

        {feedback ? (
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

        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            {SYSTEM_USERS_PAGE.actions.cancel}
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
          >
            {getSubmitLabel({
              isCreateMode,
              isEditMode,
              isPasswordMode,
              isSubmitting,
            })}
          </Button>
        </div>
      </form>
    </section>
  );
}
