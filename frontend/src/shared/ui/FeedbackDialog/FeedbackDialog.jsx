import { useEscapeKey } from "../../hooks/useEscapeKey";

import Button from "../Button/Button";

import { FEEDBACK_DIALOG_CONFIG } from "./FeedbackDialog.config";
import {
  getFeedbackDialogCopy,
  getSafeFeedbackDialogType,
} from "./FeedbackDialog.utils";

import { classNames } from "../../utils/classNames";

import styles from "./FeedbackDialog.module.css";

export default function FeedbackDialog({
  isOpen = false,
  type = FEEDBACK_DIALOG_CONFIG.fallbackType,
  title,
  message,
  closeLabel = FEEDBACK_DIALOG_CONFIG.defaultCloseLabel,
  onClose,
}) {
  const dialogType = getSafeFeedbackDialogType(type);
  const copy = getFeedbackDialogCopy(dialogType);
  const isError = dialogType === "error";

  useEscapeKey({
    enabled: isOpen,
    onEscape: onClose,
  });

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <section
        className={classNames(styles.dialog, styles[dialogType])}
        role={isError ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={FEEDBACK_DIALOG_CONFIG.ids.title}
        aria-describedby={
          message ? FEEDBACK_DIALOG_CONFIG.ids.description : undefined
        }
      >
        <div className={styles.icon} aria-hidden="true">
          {copy.symbol}
        </div>

        <div className={styles.content}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>

          <h2 id={FEEDBACK_DIALOG_CONFIG.ids.title} className={styles.title}>
            {title || copy.title}
          </h2>

          {message ? (
            <p
              id={FEEDBACK_DIALOG_CONFIG.ids.description}
              className={styles.description}
            >
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
