import styles from "./SantaCasaHistoricoCardNotice.module.css";

import {
  getHistoricoPedidoCancellationNoticeTitle,
  getHistoricoPedidoCancellationReleaseMessage,
  getHistoricoPedidoClosedReasonLabel,
  getHistoricoPedidoClosedReasonTitle,
  getHistoricoPedidoMessage,
  getHistoricoPedidoWarningNoticeMessage,
  getHistoricoPedidoWarningNoticeTitle,
  isHistoricoPedidoCancelado,
  isHistoricoPedidoValidadoComAvisos,
  shouldShowHistoricoPedidoReason,
} from "../../utils/santaCasaHistorico.utils";

function getMessageClassName(pedido) {
  return [
    styles.message,
    pedido?.status === "VALIDADO" ? styles.messageValidated : "",
    isHistoricoPedidoValidadoComAvisos(pedido) ? styles.messageWarning : "",
    pedido?.status === "REJEITADO" ? styles.messageDanger : "",
    isHistoricoPedidoCancelado(pedido) ? styles.messageDanger : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function SantaCasaHistoricoCardNotice({ pedido }) {
  const message = getHistoricoPedidoMessage(pedido);
  const showWarningNotice = isHistoricoPedidoValidadoComAvisos(pedido);
  const showCancellationNotice = isHistoricoPedidoCancelado(pedido);
  const showReason = shouldShowHistoricoPedidoReason(pedido);

  return (
    <>
      {message ? (
        <p className={getMessageClassName(pedido)}>{message}</p>
      ) : null}

      {showWarningNotice ? (
        <div className={styles.warningNotice} role="note">
          <span>{getHistoricoPedidoWarningNoticeTitle(pedido)}</span>

          <strong>{getHistoricoPedidoWarningNoticeMessage(pedido)}</strong>
        </div>
      ) : null}

      {showCancellationNotice ? (
        <div className={styles.cancellationNotice} role="note">
          <span>{getHistoricoPedidoCancellationNoticeTitle(pedido)}</span>

          <strong>
            {getHistoricoPedidoCancellationReleaseMessage(pedido)}
          </strong>
        </div>
      ) : null}

      {showReason ? (
        <div className={styles.reason}>
          <span>{getHistoricoPedidoClosedReasonTitle(pedido)}</span>
          <strong>{getHistoricoPedidoClosedReasonLabel(pedido)}</strong>
        </div>
      ) : null}
    </>
  );
}
