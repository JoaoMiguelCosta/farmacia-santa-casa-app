// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingTypeBadge.jsx
import { getTypeLabel } from "./pedidoPendingList.utils";

import styles from "./PedidoPendingItem.module.css";

function getTypeClassName(tipo) {
  if (tipo === "COM_RECEITA") return styles.receita;
  if (tipo === "SEM_RECEITA") return styles.semReceita;
  if (tipo === "EXTRA") return styles.extra;

  return styles.defaultType;
}

export default function PedidoPendingTypeBadge({ tipo }) {
  const className = [styles.itemType, getTypeClassName(tipo)]
    .filter(Boolean)
    .join(" ");

  return <span className={className}>{getTypeLabel(tipo)}</span>;
}
