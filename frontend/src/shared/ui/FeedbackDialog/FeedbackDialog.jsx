import { useEffect } from "react";

import Button from "../Button/Button";

import styles from "./FeedbackDialog.module.css";

const DIALOG_COPY = Object.freeze({
  success: {
    eyebrow: "Sucesso",
    title: "Operação concluída",
    symbol: "✓",
  },
  error: {
    eyebrow: "Erro",
    title: "Operação não concluída",
    symbol: "!",
  },
  info: {
    eyebrow: "Informação",
    title: "Aviso",
    symbol: "i",
  },
});

export default function FeedbackDialog({
  isOpen = false,
  type = "info",
  title,
  message,
  closeLabel = "Fechar",
  onClose,
}) {
  const copy = DIALOG_COPY[type] ?? DIALOG_COPY.info;

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <section
        className={`${styles.dialog} ${styles[type]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-dialog-title"
        aria-describedby="feedback-dialog-description"
      >
        <div className={styles.icon} aria-hidden="true">
          {copy.symbol}
        </div>

        <div className={styles.content}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>

          <h2 id="feedback-dialog-title" className={styles.title}>
            {title || copy.title}
          </h2>

          {message ? (
            <p id="feedback-dialog-description" className={styles.description}>
              {message}
            </p>
          ) : null}
        </div>

        <footer className={styles.actions}>
          <Button type="button" variant="primary" onClick={onClose}>
            {closeLabel}
          </Button>
        </footer>
      </section>
    </div>
  );
}
