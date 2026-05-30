import Button from "../../../../../shared/ui/Button/Button";
import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { FARMACIA_ALERTAS_CONFIG } from "../../config/farmaciaAlertas.config";
import { useFarmaciaAlertas } from "../../hooks/useFarmaciaAlertas";

import styles from "./FarmaciaAlertasTray.module.css";

function getAlertTypeConfig(tipo) {
  return (
    FARMACIA_ALERTAS_CONFIG.types[tipo] || FARMACIA_ALERTAS_CONFIG.fallbackType
  );
}

function getAlertClassName(alerta) {
  const typeConfig = getAlertTypeConfig(alerta.tipo);

  return [styles.alerta, styles[typeConfig.tone] || styles.default]
    .filter(Boolean)
    .join(" ");
}

function getAlertasCountLabel(count) {
  if (count === 1) {
    return FARMACIA_ALERTAS_CONFIG.labels.countSingular;
  }

  return `${count} ${FARMACIA_ALERTAS_CONFIG.labels.countPlural}`;
}

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

  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  return (
    <section
      className={rootClassName}
      aria-label={FARMACIA_ALERTAS_CONFIG.labels.region}
    >
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.eyebrow}>Farmácia</span>

          <h2>{FARMACIA_ALERTAS_CONFIG.labels.title}</h2>

          <p>
            {hasAlertas
              ? getAlertasCountLabel(alertasCount)
              : FARMACIA_ALERTAS_CONFIG.labels.empty}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={isRefreshing}
            disabled={isLoading || isRefreshing || isDismissingAll}
            onClick={refreshAlertas}
          >
            {isRefreshing
              ? FARMACIA_ALERTAS_CONFIG.actions.refreshing
              : FARMACIA_ALERTAS_CONFIG.actions.refresh}
          </Button>

          {hasAlertas ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              isLoading={isDismissingAll}
              disabled={isLoading || isRefreshing || isDismissingAll}
              onClick={dismissAllAlertas}
            >
              {isDismissingAll
                ? FARMACIA_ALERTAS_CONFIG.actions.dismissingAll
                : FARMACIA_ALERTAS_CONFIG.actions.dismissAll}
            </Button>
          ) : null}
        </div>
      </header>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className={styles.loading} role="status">
          A carregar alertas...
        </p>
      ) : null}

      {hasAlertas ? (
        <div className={styles.list}>
          {visibleAlertas.map((alerta) => {
            const typeConfig = getAlertTypeConfig(alerta.tipo);
            const isDismissing = dismissingId === alerta.id;

            return (
              <article key={alerta.id} className={getAlertClassName(alerta)}>
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
                  variant="secondary"
                  size="sm"
                  isLoading={isDismissing}
                  disabled={Boolean(dismissingId) || isDismissingAll}
                  onClick={() => dismissAlerta(alerta.id)}
                >
                  {isDismissing
                    ? FARMACIA_ALERTAS_CONFIG.actions.dismissing
                    : FARMACIA_ALERTAS_CONFIG.actions.dismiss}
                </Button>
              </article>
            );
          })}

          {hiddenAlertasCount > 0 ? (
            <p className={styles.hiddenNotice}>
              Mais {hiddenAlertasCount} alerta(s) pendente(s). Usa “Marcar todos
              como vistos” ou atualiza após fechares os visíveis.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
