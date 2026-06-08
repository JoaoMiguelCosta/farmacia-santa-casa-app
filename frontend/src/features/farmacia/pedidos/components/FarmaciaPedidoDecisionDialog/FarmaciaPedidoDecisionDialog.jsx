// src/features/farmacia/pedidos/components/FarmaciaPedidoDecisionDialog/FarmaciaPedidoDecisionDialog.jsx
import { useEffect, useRef } from "react";

import Button from "../../../../../shared/ui/Button/Button";

import {
  getPedidoItemsCount,
  getPedidoNumberLabel,
  getPedidoTotalQuantity,
  getPedidoUtentesCount,
} from "../../../shared/pedidos/utils/farmaciaPedido.utils";

import { FARMACIA_PEDIDOS_PAGE } from "../../config/farmaciaPedidosPage.config";

import styles from "./FarmaciaPedidoDecisionDialog.module.css";

const DIALOG_MODES = Object.freeze({
  VALIDATE: "validate",
  REJECT: "reject",
});

const FOCUSABLE_ELEMENTS_SELECTOR = [
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getDialogConfig(mode) {
  if (mode === DIALOG_MODES.REJECT) {
    return FARMACIA_PEDIDOS_PAGE.rejectDialog;
  }

  return FARMACIA_PEDIDOS_PAGE.validateDialog;
}

function getFocusableElements(container) {
  if (!container) return [];

  return Array.from(
    container.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR),
  ).filter((element) => {
    return element instanceof HTMLElement;
  });
}

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

  const titleId = `farmacia-pedido-${mode}-dialog-title`;

  const descriptionId = `farmacia-pedido-${mode}-dialog-description`;

  return (
    <div className={styles.overlay} role="presentation">
      <section
        ref={dialogRef}
        className={styles.dialog}
        data-tone={isRejectMode ? "danger" : "success"}
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
              {dialogConfig.description}
            </p>
          </div>
        </header>

        <div className={styles.body}>
          <dl className={styles.summary}>
            <div className={styles.summaryItem}>
              <dt>{decisionDialog.labels.pedido}</dt>

              <dd>{getPedidoNumberLabel(pedido)}</dd>
            </div>

            <div className={styles.summaryItem}>
              <dt>{decisionDialog.labels.totalUtentes}</dt>

              <dd>{getPedidoUtentesCount(pedido)}</dd>
            </div>

            <div className={styles.summaryItem}>
              <dt>{decisionDialog.labels.totalItems}</dt>

              <dd>{getPedidoItemsCount(pedido)}</dd>
            </div>

            <div className={styles.summaryItem}>
              <dt>{decisionDialog.labels.totalQuantity}</dt>

              <dd>{getPedidoTotalQuantity(pedido)}</dd>
            </div>
          </dl>

          <div className={styles.supportingText}>
            {dialogConfig.supportingText}
          </div>

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
