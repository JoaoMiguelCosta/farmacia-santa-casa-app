import { classNames } from "../../../../../shared/utils/classNames";

import { FARMACIA_ALERTAS_CONFIG } from "../../config/farmaciaAlertas.config";
import { useFarmaciaAlertas } from "../../hooks/useFarmaciaAlertas";

import FarmaciaAlertaCard from "../FarmaciaAlertaCard/FarmaciaAlertaCard";
import FarmaciaAlertasHeader from "../FarmaciaAlertasHeader/FarmaciaAlertasHeader";
import FarmaciaAlertasState from "../FarmaciaAlertasState/FarmaciaAlertasState";

import styles from "./FarmaciaAlertasTray.module.css";

export default function FarmaciaAlertasTray({
  enabled = true,
  className = "",
}) {
  const {
    visibleAlertas,
    alertasCount,
    hiddenAlertasCount,

    hasAlertas,
    error,

    isLoading,
    isRefreshing,
    dismissingId,
    isDismissingAll,

    refreshAlertas,
    dismissAlerta,
    dismissAllAlertas,
  } = useFarmaciaAlertas({
    enabled,
  });

  if (!enabled) return null;

  if (!hasAlertas && !error && !isLoading) {
    return null;
  }

  const rootClassName = classNames(styles.root, className);

  return (
    <section
      className={rootClassName}
      aria-label={FARMACIA_ALERTAS_CONFIG.labels.region}
    >
      <FarmaciaAlertasHeader
        hasAlertas={hasAlertas}
        alertasCount={alertasCount}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isDismissingAll={isDismissingAll}
        onRefresh={refreshAlertas}
        onDismissAll={dismissAllAlertas}
      />

      {error ? (
        <FarmaciaAlertasState tone="error" role="alert">
          {error}
        </FarmaciaAlertasState>
      ) : null}

      {isLoading ? (
        <FarmaciaAlertasState tone="loading" role="status">
          A carregar alertas...
        </FarmaciaAlertasState>
      ) : null}

      {hasAlertas ? (
        <div className={styles.list}>
          {visibleAlertas.map((alerta) => (
            <FarmaciaAlertaCard
              key={alerta.id}
              alerta={alerta}
              dismissingId={dismissingId}
              isDismissingAll={isDismissingAll}
              onDismiss={dismissAlerta}
            />
          ))}

          {hiddenAlertasCount > 0 ? (
            <FarmaciaAlertasState tone="notice">
              {FARMACIA_ALERTAS_CONFIG.labels.hiddenNotice}
            </FarmaciaAlertasState>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
