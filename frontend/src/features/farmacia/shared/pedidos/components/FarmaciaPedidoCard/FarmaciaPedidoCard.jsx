import BarcodeValue from "../../../../../../shared/ui/BarcodeValue/BarcodeValue";

import styles from "./FarmaciaPedidoCard.module.css";

import { FARMACIA_PEDIDO_UI } from "../../config/farmaciaPedidoUi.config";
import { useFarmaciaPedidoCard } from "../../hooks/useFarmaciaPedidoCard";

import {
  getPedidoClosedReasonLabel,
  getPedidoClosedReasonTitle,
  getPedidoItemMedicamentoLabel,
  getPedidoItemMetaLabel,
  getPedidoItemQuantityLabel,
  getPedidoItemReferenceLabel,
  getPedidoItemStatusLabel,
  getPedidoItemTypeLabel,
  getPedidoItemUtenteLabel,
  getPedidoItemsCount,
  getPedidoNumberLabel,
  getPedidoStatusLabel,
  getPedidoTotalQuantity,
  getPedidoUtentesLabel,
  hasPedidoClosedReason,
} from "../../utils/farmaciaPedido.utils";

function getPedidoItemReceita(item) {
  if (item?.tipo !== "COM_RECEITA") return null;

  return item?.receitaLinha?.receita ?? null;
}

function PedidoItemReceitaBarcodes({ receita }) {
  if (!receita) return null;

  const codes = [
    {
      key: "numero19",
      label: "N.º receita",
      value: receita.numero19,
      width: 0.72,
    },
    {
      key: "pinAcesso6",
      label: "PIN acesso",
      value: receita.pinAcesso6,
      width: 1.08,
    },
    {
      key: "pinOpcao4",
      label: "PIN opção",
      value: receita.pinOpcao4,
      width: 1.16,
    },
  ];

  return (
    <div className={styles.barcodePanel} aria-label="Códigos da receita">
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
  );
}

function FarmaciaPedidoItem({ item }) {
  const receita = getPedidoItemReceita(item);

  return (
    <li className={styles.item}>
      <div className={styles.itemMain}>
        <div className={styles.itemHeader}>
          <span className={styles.itemType}>
            {getPedidoItemTypeLabel(item.tipo)}
          </span>

          <span className={styles.itemStatus}>
            {getPedidoItemStatusLabel(item.status)}
          </span>
        </div>

        <strong className={styles.itemTitle}>
          {getPedidoItemMedicamentoLabel(item)}
        </strong>

        {receita ? (
          <PedidoItemReceitaBarcodes receita={receita} />
        ) : (
          <>
            <span className={styles.itemReference}>
              {getPedidoItemReferenceLabel(item)}
            </span>

            <span className={styles.itemMeta}>
              {getPedidoItemMetaLabel(item)}
            </span>
          </>
        )}
      </div>

      <div className={styles.itemSide}>
        <span className={styles.itemQuantityLabel}>
          {FARMACIA_PEDIDO_UI.labels.quantidade}
        </span>

        <strong className={styles.itemQuantity}>
          {getPedidoItemQuantityLabel(item)}
        </strong>
      </div>

      <div className={styles.itemFooter}>
        <span>{FARMACIA_PEDIDO_UI.labels.utente}</span>
        <strong>{getPedidoItemUtenteLabel(item)}</strong>
      </div>
    </li>
  );
}

export default function FarmaciaPedidoCard({
  pedido,
  variant = "pending",
  showActions = true,
  isValidating = false,
  isRejecting = false,
  isActionDisabled = false,
  onValidate,
  onReject,
}) {
  const {
    isDetailsOpen,

    items,
    canAct,
    auditInfo,

    dateLabel,
    dateValue,

    handleToggleDetails,
  } = useFarmaciaPedidoCard({
    pedido,
    variant,
    isActionDisabled,
  });

  if (!pedido) return null;

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>
            {FARMACIA_PEDIDO_UI.labels.pedido}
          </span>

          <h3 className={styles.title}>{getPedidoNumberLabel(pedido)}</h3>
        </div>

        <span className={styles.status}>
          {getPedidoStatusLabel(pedido.status)}
        </span>
      </header>

      <dl className={styles.summary}>
        <div className={styles.summaryItem}>
          <dt>{dateLabel}</dt>
          <dd>{dateValue}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_PEDIDO_UI.labels.utente}</dt>
          <dd>{getPedidoUtentesLabel(pedido)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_PEDIDO_UI.labels.totalItems}</dt>
          <dd>{getPedidoItemsCount(pedido)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_PEDIDO_UI.labels.quantidade}</dt>
          <dd>{getPedidoTotalQuantity(pedido)}</dd>
        </div>

        {auditInfo ? (
          <div className={styles.summaryItem}>
            <dt>{auditInfo.label}</dt>
            <dd>{auditInfo.value}</dd>
          </div>
        ) : null}
      </dl>

      {hasPedidoClosedReason(pedido) ? (
        <div className={styles.closedReason}>
          <span>{getPedidoClosedReasonTitle(pedido)}</span>
          <strong>{getPedidoClosedReasonLabel(pedido)}</strong>
        </div>
      ) : null}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryAction}
          onClick={handleToggleDetails}
        >
          {isDetailsOpen
            ? FARMACIA_PEDIDO_UI.actions.hideDetails
            : FARMACIA_PEDIDO_UI.actions.viewDetails}
        </button>

        {showActions ? (
          <div className={styles.primaryActions}>
            <button
              type="button"
              className={styles.rejectAction}
              disabled={!canAct || isRejecting}
              onClick={() => onReject?.(pedido)}
            >
              {isRejecting
                ? FARMACIA_PEDIDO_UI.actions.rejecting
                : FARMACIA_PEDIDO_UI.actions.reject}
            </button>

            <button
              type="button"
              className={styles.validateAction}
              disabled={!canAct || isValidating}
              onClick={() => onValidate?.(pedido)}
            >
              {isValidating
                ? FARMACIA_PEDIDO_UI.actions.validating
                : FARMACIA_PEDIDO_UI.actions.validate}
            </button>
          </div>
        ) : null}
      </div>

      {isDetailsOpen ? (
        <section className={styles.details}>
          <h4 className={styles.detailsTitle}>
            {FARMACIA_PEDIDO_UI.labels.items}
          </h4>

          <ul className={styles.itemsList}>
            {items.map((item) => (
              <FarmaciaPedidoItem key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
