import { useEffect, useRef } from "react";

import Button from "../../../../../shared/ui/Button/Button";

import { buildPedidoOperationalSummary } from "../../../shared/pedidos/utils/farmaciaPedidoOperational.utils";

import { FARMACIA_PEDIDOS_PAGE } from "../../config/farmaciaPedidosPage.config";

import { DIALOG_MODES } from "./farmaciaPedidoDecisionDialog.config";
import {
  buildDefaultMetrics,
  buildWarningMetrics,
  getDialogConfig,
  getFocusableElements,
} from "./farmaciaPedidoDecisionDialog.utils";

import styles from "./FarmaciaPedidoDecisionDialog.module.css";

export default function FarmaciaPedidoDecisionDialog({
  mode = DIALOG_MODES.VALIDATE,
  pedido,
  reason = "",
  isLoading = false,
  onReasonChange,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  const isRejectMode = mode === DIALOG_MODES.REJECT;

  const dialogConfig = getDialogConfig(mode);

  const { decisionDialog } = FARMACIA_PEDIDOS_PAGE;

  useEffect(() => {
    if (!pedido) return undefined;

    const previousActiveElement = document.activeElement;

    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const animationFrameId = window.requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (!isLoading) {
          onCancel?.();
        }

        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];

      const lastElement = focusableElements[focusableElements.length - 1];

      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === firstElement || activeElement === dialogRef.current)
      ) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrameId);

      window.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = previousBodyOverflow;

      if (
        previousActiveElement instanceof HTMLElement &&
        document.contains(previousActiveElement)
      ) {
        previousActiveElement.focus();
      }
    };
  }, [isLoading, onCancel, pedido]);

  if (!pedido) return null;

  const summary = buildPedidoOperationalSummary(pedido);

  const hasExpiredItems = summary.hasExpiredItems;

  const titleId = `farmacia-pedido-${mode}-dialog-title`;

  const descriptionId = `farmacia-pedido-${mode}-dialog-description`;

  const description = hasExpiredItems
    ? dialogConfig.warningDescription
    : dialogConfig.description;

  const supportingText = hasExpiredItems
    ? dialogConfig.warningSupportingText
    : dialogConfig.supportingText;

  const metrics = hasExpiredItems
    ? buildWarningMetrics({
        mode,
        pedido,
        summary,
        labels: decisionDialog.labels,
      })
    : buildDefaultMetrics({
        pedido,
        summary,
        labels: decisionDialog.labels,
      });

  return (
    <div className={styles.overlay} role="presentation">
      <section
        ref={dialogRef}
        className={styles.dialog}
        data-tone={isRejectMode ? "danger" : "success"}
        data-has-warning={hasExpiredItems ? "true" : "false"}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <header className={styles.header}>
          <div className={styles.icon} aria-hidden="true">
            {dialogConfig.icon}
          </div>

          <div className={styles.heading}>
            <p className={styles.eyebrow}>{decisionDialog.eyebrow}</p>

            <h2 id={titleId} className={styles.title}>
              {dialogConfig.title}
            </h2>

            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          </div>
        </header>

        <div className={styles.body}>
          <dl className={styles.summary}>
            {metrics.map((metric) => (
              <div
                key={metric.key}
                className={styles.summaryItem}
                data-tone={metric.tone || "default"}
              >
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>

          {hasExpiredItems ? (
            <div className={styles.expiryNotice} role="note">
              <strong>{decisionDialog.expiryWarningTitle}</strong>

              <span>{dialogConfig.expiryNotice}</span>
            </div>
          ) : null}

          <div className={styles.supportingText}>{supportingText}</div>

          {isRejectMode ? (
            <label className={styles.reasonField}>
              <span>{dialogConfig.reasonLabel}</span>

              <textarea
                value={reason}
                maxLength={dialogConfig.reasonMaxLength}
                rows={4}
                placeholder={dialogConfig.reasonPlaceholder}
                disabled={isLoading}
                onChange={(event) => {
                  onReasonChange?.(event.target.value);
                }}
              />

              <small>{dialogConfig.reasonHint}</small>
            </label>
          ) : null}
        </div>

        <footer className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={onCancel}
          >
            {dialogConfig.cancelLabel}
          </Button>

          {isRejectMode ? (
            <Button
              type="button"
              variant="danger"
              isLoading={isLoading}
              onClick={onConfirm}
            >
              {dialogConfig.confirmLabel}
            </Button>
          ) : (
            <Button type="button" isLoading={isLoading} onClick={onConfirm}>
              {dialogConfig.confirmLabel}
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
}
