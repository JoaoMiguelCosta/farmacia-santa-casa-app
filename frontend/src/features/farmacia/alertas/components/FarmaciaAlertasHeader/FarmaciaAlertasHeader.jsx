import Button from "../../../../../shared/ui/Button/Button";

import { FARMACIA_ALERTAS_CONFIG } from "../../config/farmaciaAlertas.config";
import { getAlertasCountLabel } from "../../utils/farmaciaAlertas.utils";

import styles from "./FarmaciaAlertasHeader.module.css";

export default function FarmaciaAlertasHeader({
  hasAlertas,
  alertasCount,
  isLoading,
  isRefreshing,
  isDismissingAll,
  onRefresh,
  onDismissAll,
}) {
  const countLabel = hasAlertas
    ? getAlertasCountLabel(alertasCount)
    : FARMACIA_ALERTAS_CONFIG.labels.empty;

  const countClassName = [
    styles.countBadge,
    !hasAlertas ? styles.emptyBadge : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <span className={styles.eyebrow}>
          {FARMACIA_ALERTAS_CONFIG.labels.eyebrow}
        </span>

        <div className={styles.titleRow}>
          <h2>{FARMACIA_ALERTAS_CONFIG.labels.title}</h2>

          <span className={countClassName}>{countLabel}</span>
        </div>
      </div>

      <div className={styles.headerActions}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          isLoading={isRefreshing}
          disabled={isLoading || isRefreshing || isDismissingAll}
          onClick={onRefresh}
        >
          {isRefreshing
            ? FARMACIA_ALERTAS_CONFIG.actions.refreshing
            : FARMACIA_ALERTAS_CONFIG.actions.refresh}
        </Button>

        {hasAlertas ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isDismissingAll}
            disabled={isLoading || isRefreshing || isDismissingAll}
            onClick={onDismissAll}
          >
            {isDismissingAll
              ? FARMACIA_ALERTAS_CONFIG.actions.dismissingAll
              : FARMACIA_ALERTAS_CONFIG.actions.dismissAll}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
