import styles from "./SantaCasaHistoricoCardHeader.module.css";

import { SANTACASA_HISTORICO_PAGE } from "../../../config/santaCasaHistoricoPage.config";

import {
  getHistoricoPedidoNumberLabel,
  getHistoricoPedidoVisualStatusLabel,
  isHistoricoPedidoCancelado,
  isHistoricoPedidoValidadoComAvisos,
} from "../../../utils/santaCasaHistorico.utils";

function getStatusClassName(pedido) {
  return [
    styles.status,
    pedido?.status === "VALIDADO" ? styles.statusValidated : "",
    isHistoricoPedidoValidadoComAvisos(pedido) ? styles.statusWarning : "",
    pedido?.status === "REJEITADO" ? styles.statusRejected : "",
    isHistoricoPedidoCancelado(pedido) ? styles.statusCancelled : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function SantaCasaHistoricoCardHeader({ pedido }) {
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <span className={styles.eyebrow}>
          {SANTACASA_HISTORICO_PAGE.labels.pedido}
        </span>

        <h3 className={styles.title}>
          {getHistoricoPedidoNumberLabel(pedido)}
        </h3>
      </div>

      <span className={getStatusClassName(pedido)}>
        {getHistoricoPedidoVisualStatusLabel(pedido)}
      </span>
    </header>
  );
}
