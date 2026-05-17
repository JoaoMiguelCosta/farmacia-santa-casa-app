import styles from "./SystemManutencaoAccess.module.css";

import { FARMACIA_MANUTENCAO_PAGE as SYSTEM_MANUTENCAO_PAGE } from "../../config/systemManutencaoPage.config";

export default function SystemManutencaoAccess({
  keyInput = "",
  hasKey = false,
  feedback = null,
  isDisabled = false,
  onKeyChange,
  onSaveKey,
  onClearKey,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSaveKey?.();
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="system-manutencao-access-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id="system-manutencao-access-title" className={styles.title}>
            {SYSTEM_MANUTENCAO_PAGE.sections.access.title}
          </h2>

          <p className={styles.description}>
            {SYSTEM_MANUTENCAO_PAGE.sections.access.description}
          </p>
        </div>

        {hasKey ? (
          <span className={styles.status}>
            {SYSTEM_MANUTENCAO_PAGE.access.savedLabel}
          </span>
        ) : (
          <span className={styles.statusMuted}>
            {SYSTEM_MANUTENCAO_PAGE.access.missingLabel}
          </span>
        )}
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>{SYSTEM_MANUTENCAO_PAGE.access.keyLabel}</span>

          <input
            type="password"
            value={keyInput}
            placeholder={SYSTEM_MANUTENCAO_PAGE.access.keyPlaceholder}
            autoComplete="off"
            disabled={isDisabled}
            onChange={(event) => onKeyChange?.(event.target.value)}
          />
        </label>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={isDisabled}
          >
            {SYSTEM_MANUTENCAO_PAGE.access.saveLabel}
          </button>

          <button
            type="button"
            className={styles.clearButton}
            disabled={isDisabled && !hasKey}
            onClick={onClearKey}
          >
            {SYSTEM_MANUTENCAO_PAGE.access.clearLabel}
          </button>
        </div>
      </form>

      {feedback?.message ? (
        <p
          className={
            feedback.type === "error"
              ? styles.feedbackError
              : styles.feedbackSuccess
          }
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      ) : null}
    </section>
  );
}
