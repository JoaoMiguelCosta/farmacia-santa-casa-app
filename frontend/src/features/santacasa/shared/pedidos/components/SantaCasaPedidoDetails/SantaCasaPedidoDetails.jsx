import SantaCasaPedidoUtentesList from "./components/SantaCasaPedidoUtentesList/SantaCasaPedidoUtentesList";

import { useSantaCasaPedidoDetails } from "./useSantaCasaPedidoDetails";

import styles from "./SantaCasaPedidoDetails.module.css";

export default function SantaCasaPedidoDetails({ id, pedido }) {
  const { hasGroups, groups } = useSantaCasaPedidoDetails(pedido);

  if (!hasGroups) {
    return null;
  }

  const variant = pedido?.status === "PENDENTE" ? "pending" : "history";

  return (
    <div id={id} className={styles.details}>
      <SantaCasaPedidoUtentesList
        pedidoId={pedido?.id || id}
        groups={groups}
        variant={variant}
      />
    </div>
  );
}
