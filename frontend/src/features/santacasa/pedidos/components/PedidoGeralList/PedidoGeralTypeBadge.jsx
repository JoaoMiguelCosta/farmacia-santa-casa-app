import { getTypeLabel } from "./pedidoGeralList.utils";

import styles from "./PedidoGeralItem.module.css";

function getTypeClassName(tipo) {
  if (tipo === "COM_RECEITA") return styles.receita;
  if (tipo === "SEM_RECEITA") return styles.semReceita;
  if (tipo === "EXTRA") return styles.extra;

  return styles.defaultType;
}

export default function PedidoGeralTypeBadge({ tipo }) {
  const className = [styles.badge, getTypeClassName(tipo)]
    .filter(Boolean)
    .join(" ");

  return <span className={className}>{getTypeLabel(tipo)}</span>;
}
