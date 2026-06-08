// src/features/farmacia/shared/pedidos/components/FarmaciaPedidoItem/FarmaciaPedidoItem.jsx
import BarcodeValue from "../../../../../../shared/ui/BarcodeValue/BarcodeValue";

import { FARMACIA_PEDIDO_UI } from "../../config/farmaciaPedidoUi.config";

import {
  getPedidoItemMedicamentoLabel,
  getPedidoItemMetaLabel,
  getPedidoItemQuantityLabel,
  getPedidoItemReferenceLabel,
  getPedidoItemStatusLabel,
  getPedidoItemTypeLabel,
} from "../../utils/farmaciaPedido.utils";

import styles from "./FarmaciaPedidoItem.module.css";

const RECEITA_CODE_DEFINITIONS = Object.freeze([
  {
    key: "numero19",
    labelKey: "receitaNumber",
    width: 0.72,
  },
  {
    key: "pinAcesso6",
    labelKey: "pinAcesso",
    width: 1.08,
  },
  {
    key: "pinOpcao4",
    labelKey: "pinOpcao",
    width: 1.16,
  },
]);

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Lisbon",
});

function normalizeDataValue(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function getPedidoItemReceita(item) {
  if (item?.tipo !== "COM_RECEITA") {
    return null;
  }

  return item?.receitaLinha?.receita ?? null;
}

function getPedidoItemValidadeLabel(item) {
  const rawValidade = item?.receitaLinha?.validade;

  if (!rawValidade) {
    return "—";
  }

  const validade = new Date(rawValidade);

  if (Number.isNaN(validade.getTime())) {
    return "—";
  }

  return DATE_FORMATTER.format(validade);
}

function canExpandPedidoItem(item) {
  return ["COM_RECEITA", "EXTRA"].includes(item?.tipo);
}

function getToggleLabel(item, isExpanded) {
  if (item?.tipo === "COM_RECEITA") {
    return isExpanded
      ? FARMACIA_PEDIDO_UI.actions.hideReceita
      : FARMACIA_PEDIDO_UI.actions.viewReceita;
  }

  return isExpanded
    ? FARMACIA_PEDIDO_UI.actions.hideDetails
    : FARMACIA_PEDIDO_UI.actions.viewDetails;
}

function FarmaciaPedidoReceitaBarcodes({ receita }) {
  if (!receita) return null;

  return (
    <section
      className={styles.barcodeSection}
      aria-label={FARMACIA_PEDIDO_UI.labels.receitaCodes}
    >
      <span className={styles.sectionLabel}>
        {FARMACIA_PEDIDO_UI.labels.receitaCodes}
      </span>

      <div className={styles.barcodePanel}>
        {RECEITA_CODE_DEFINITIONS.map((code) => {
          const value = receita[code.key];

          return (
            <BarcodeValue
              key={code.key}
              size="compact"
              label={FARMACIA_PEDIDO_UI.labels[code.labelKey]}
              value={value}
              caption={value}
              height={28}
              width={code.width}
              displayValue={false}
            />
          );
        })}
      </div>
    </section>
  );
}

function FarmaciaPedidoExtraInformation({ item }) {
  return (
    <div className={styles.information}>
      <span className={styles.reference}>
        {getPedidoItemReferenceLabel(item)}
      </span>

      <span className={styles.meta}>{getPedidoItemMetaLabel(item)}</span>
    </div>
  );
}

export default function FarmaciaPedidoItem({
  item,
  detailsId,
  isExpanded = false,
  onToggle,
}) {
  if (!item) return null;

  const receita = getPedidoItemReceita(item);
  const canExpand = canExpandPedidoItem(item);
  const isComReceita = item.tipo === "COM_RECEITA";

  const itemType = normalizeDataValue(item.tipo);
  const itemStatus = normalizeDataValue(item.status);

  return (
    <li
      className={styles.item}
      data-type={itemType}
      data-status={itemStatus}
      data-expanded={isExpanded ? "true" : "false"}
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <strong className={styles.title}>
            {getPedidoItemMedicamentoLabel(item)}
          </strong>

          <div className={styles.badges}>
            <span className={styles.typeBadge} data-type={itemType}>
              {getPedidoItemTypeLabel(item.tipo)}
            </span>

            <span className={styles.statusBadge} data-status={itemStatus}>
              {getPedidoItemStatusLabel(item.status)}
            </span>
          </div>
        </div>

        <div className={styles.side}>
          {isComReceita ? (
            <div className={styles.validade}>
              <span>{FARMACIA_PEDIDO_UI.labels.validade}</span>

              <strong>{getPedidoItemValidadeLabel(item)}</strong>
            </div>
          ) : null}

          <div className={styles.quantity}>
            <span>{FARMACIA_PEDIDO_UI.labels.requestedQuantity}</span>

            <strong>{getPedidoItemQuantityLabel(item)}</strong>
          </div>

          {canExpand ? (
            <button
              type="button"
              className={styles.toggleButton}
              aria-expanded={isExpanded}
              aria-controls={detailsId}
              onClick={onToggle}
            >
              {getToggleLabel(item, isExpanded)}
            </button>
          ) : null}
        </div>
      </header>

      {canExpand && isExpanded ? (
        <section id={detailsId} className={styles.details}>
          {receita ? (
            <FarmaciaPedidoReceitaBarcodes receita={receita} />
          ) : (
            <FarmaciaPedidoExtraInformation item={item} />
          )}
        </section>
      ) : null}
    </li>
  );
}
