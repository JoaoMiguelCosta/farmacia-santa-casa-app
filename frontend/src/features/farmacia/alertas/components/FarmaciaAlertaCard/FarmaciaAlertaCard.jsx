import Button from "../../../../../shared/ui/Button/Button";
import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { FARMACIA_ALERTAS_CONFIG } from "../../config/farmaciaAlertas.config";
import {
  getAlertTone,
  getAlertTypeConfig,
} from "../../utils/farmaciaAlertas.utils";

import styles from "./FarmaciaAlertaCard.module.css";

function getAlertClassName(alerta) {
  const alertTone = getAlertTone(alerta);

  return [styles.alerta, styles[alertTone] || styles.default]
    .filter(Boolean)
    .join(" ");
}

export default function FarmaciaAlertaCard({
  alerta,
  dismissingId,
  isDismissingAll,
  onDismiss,
}) {
  const typeConfig = getAlertTypeConfig(alerta.tipo);
  const isDismissing = dismissingId === alerta.id;

  return (
    <article className={getAlertClassName(alerta)}>
      <div className={styles.alertaMain}>
        <div className={styles.alertaHeader}>
          <span className={styles.typeLabel}>{typeConfig.label}</span>

          <span className={styles.dateLabel}>
            {FARMACIA_ALERTAS_CONFIG.labels.createdAt}:{" "}
            {formatDateTime(alerta.createdAt)}
          </span>
        </div>

        <h3>{alerta.titulo}</h3>

        <p>{alerta.mensagem}</p>
      </div>

      <Button
        type="button"
        variant="primary"
        size="sm"
        isLoading={isDismissing}
        disabled={Boolean(dismissingId) || isDismissingAll}
        onClick={() => onDismiss(alerta.id)}
      >
        {isDismissing
          ? FARMACIA_ALERTAS_CONFIG.actions.dismissing
          : FARMACIA_ALERTAS_CONFIG.actions.dismiss}
      </Button>
    </article>
  );
}
