// src/features/santacasa/pedidos/components/PedidosSummaryCards/PedidosSummaryCards.jsx
import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import styles from "./PedidosSummaryCards.module.css";

function getPluralLabel({ amount, singular, plural }) {
  return amount === 1 ? singular : plural;
}

export default function PedidosSummaryCards({
  itemsCount = 0,
  utentesCount = 0,
  pendingCount = 0,
}) {
  const cards = [
    {
      key: "items",
      value: itemsCount,
      label: getPluralLabel({
        amount: itemsCount,
        singular: PEDIDOS_PAGE.summary.cards.items.singular,
        plural: PEDIDOS_PAGE.summary.cards.items.plural,
      }),
    },
    {
      key: "utentes",
      value: utentesCount,
      label: getPluralLabel({
        amount: utentesCount,
        singular: PEDIDOS_PAGE.summary.cards.utentes.singular,
        plural: PEDIDOS_PAGE.summary.cards.utentes.plural,
      }),
    },
    {
      key: "pending",
      value: pendingCount,
      label: getPluralLabel({
        amount: pendingCount,
        singular: PEDIDOS_PAGE.summary.cards.pending.singular,
        plural: PEDIDOS_PAGE.summary.cards.pending.plural,
      }),
    },
  ];

  return (
    <div
      className={styles.summary}
      aria-label={PEDIDOS_PAGE.summary.ariaLabel}
      role="list"
    >
      {cards.map((card) => (
        <article key={card.key} className={styles.card} role="listitem">
          <strong>{card.value}</strong>
          <span>{card.label}</span>
        </article>
      ))}
    </div>
  );
}
