import { useEffect } from "react";

import Button from "../Button/Button";

import styles from "./ConfirmDialog.module.css";

export default function ConfirmDialog({
  isOpen = false,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isLoading) {
        onCancel?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={
          description ? "confirm-dialog-description" : undefined
        }
      >
        <div className={styles.icon} aria-hidden="true">
          !
        </div>

        <div className={styles.content}>
          <p className={styles.kicker}>Confirmação necessária</p>

          <h2 id="confirm-dialog-title" className={styles.title}>
            {title}
          </h2>

          {description ? (
            <p id="confirm-dialog-description" className={styles.description}>
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
