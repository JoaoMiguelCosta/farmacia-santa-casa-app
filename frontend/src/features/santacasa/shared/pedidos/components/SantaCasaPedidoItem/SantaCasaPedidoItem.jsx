// src/features/santacasa/shared/pedidos/components/SantaCasaPedidoItem/SantaCasaPedidoItem.jsx

import BarcodeValue from "../../../../../../shared/ui/BarcodeValue/BarcodeValue";

import { SANTACASA_PEDIDO_DETAILS } from "../../config/santaCasaPedidoDetails.config";

import { getSantaCasaPedidoItemViewModel } from "../SantaCasaPedidoDetails/santaCasaPedidoDetails.utils";

import styles from "./SantaCasaPedidoItem.module.css";

function getToggleLabel(isExpanded) {
  const { actions } = SANTACASA_PEDIDO_DETAILS;

  return isExpanded ? actions.hideReceita : actions.viewReceita;
}

function ReceitaBarcodes({ codes = [] }) {
  if (codes.length === 0) {
    return null;
  }

  return (
    <section
      className={styles.barcodeSection}
      aria-label={SANTACASA_PEDIDO_DETAILS.labels.barcodeAriaLabel}
    >
      <span className={styles.sectionLabel}>
        {SANTACASA_PEDIDO_DETAILS.labels.receitaCodes}
      </span>

      <div className={styles.barcodePanel}>
        {codes.map((code) => (
          <BarcodeValue
            key={code.key}
            size="compact"
            label={code.label}
            value={code.value}
            caption={code.value}
            height={28}
            width={code.width}
            displayValue={false}
          />
        ))}
      </div>
    </section>
  );
}

export default function SantaCasaPedidoItem({
  item,
  variant = "pending",
  detailsId,
  isExpanded = false,
  onToggle,
}) {
  if (!item) {
    return null;
  }

  const viewModel = getSantaCasaPedidoItemViewModel(item, {
    variant,
  });

  return (
    <li
      className={styles.item}
      data-type={viewModel.itemType}
      data-status={viewModel.itemStatus}
      data-expired={viewModel.isCanceledByExpiration ? "true" : "false"}
      data-expanded={isExpanded ? "true" : "false"}
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <strong className={styles.title}>{viewModel.medicamentoLabel}</strong>

          <div className={styles.badges}>
            <span className={styles.typeBadge} data-type={viewModel.itemType}>
              {viewModel.typeLabel}
            </span>

            <span
              className={styles.statusBadge}
              data-status={viewModel.itemStatus}
            >
              {viewModel.statusLabel}
            </span>
          </div>
        </div>

        <div className={styles.side}>
          {viewModel.isComReceita ? (
            <div className={styles.validade}>
              <span>{SANTACASA_PEDIDO_DETAILS.labels.validadeReceita}</span>

              <strong>{viewModel.validadeLabel}</strong>
            </div>
          ) : null}

          <div className={styles.quantity}>
            <span>{SANTACASA_PEDIDO_DETAILS.labels.requestedQuantity}</span>

            <strong>{viewModel.quantidade}</strong>
          </div>

          {viewModel.canExpand ? (
            <button
              type="button"
              className={styles.toggleButton}
              aria-expanded={isExpanded}
              aria-controls={detailsId}
              onClick={onToggle}
            >
              {getToggleLabel(isExpanded)}
            </button>
          ) : null}
        </div>
      </header>

      {viewModel.isCanceledByExpiration ? (
        <div className={styles.expiredNotice} role="note">
          <span className={styles.expiredNoticeIcon} aria-hidden="true">
            !
          </span>

          <div className={styles.expiredNoticeContent}>
            <strong>{viewModel.expiredWarning.title}</strong>

            <p>{viewModel.expiredWarning.message}</p>
          </div>
        </div>
      ) : null}

      {viewModel.canExpand && isExpanded ? (
        <section id={detailsId} className={styles.details}>
          <ReceitaBarcodes codes={viewModel.barcodeCodes} />
        </section>
      ) : null}
    </li>
  );
}
