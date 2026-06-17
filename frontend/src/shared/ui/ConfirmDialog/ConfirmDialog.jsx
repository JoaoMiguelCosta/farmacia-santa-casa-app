import { useEscapeKey } from "../../hooks/useEscapeKey";

import Button from "../Button/Button";

import { CONFIRM_DIALOG_CONFIG } from "./ConfirmDialog.config";

import styles from "./ConfirmDialog.module.css";

export default function ConfirmDialog({
  isOpen = false,
  title,
  description,
  confirmLabel = CONFIRM_DIALOG_CONFIG.labels.confirm,
  cancelLabel = CONFIRM_DIALOG_CONFIG.labels.cancel,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  useEscapeKey({
    enabled: isOpen && !isLoading,
    onEscape: onCancel,
  });

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={CONFIRM_DIALOG_CONFIG.ids.title}
        aria-describedby={
          description ? CONFIRM_DIALOG_CONFIG.ids.description : undefined
        }
      >
        <div className={styles.icon} aria-hidden="true">
          {CONFIRM_DIALOG_CONFIG.copy.icon}
        </div>

        <div className={styles.content}>
          <p className={styles.kicker}>{CONFIRM_DIALOG_CONFIG.copy.kicker}</p>

          <h2 id={CONFIRM_DIALOG_CONFIG.ids.title} className={styles.title}>
            {title}
          </h2>

          {description ? (
            <p
              id={CONFIRM_DIALOG_CONFIG.ids.description}
              className={styles.description}
            >
              {description}
            </p>
          ) : null}
        </div>

        <footer className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </footer>
      </section>
    </div>
  );
}
