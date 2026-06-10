import styles from "./SantaCasaHistoricoList.module.css";

import SantaCasaHistoricoCard from "./components/SantaCasaHistoricoCard/SantaCasaHistoricoCard";

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

function SantaCasaHistoricoState({
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.state}>
      <strong className={styles.stateTitle}>{title}</strong>

      {description ? (
        <p className={styles.stateDescription}>{description}</p>
      ) : null}

      {actionLabel && onAction ? (
        <button type="button" className={styles.stateAction} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default function SantaCasaHistoricoList({
  pedidos = [],
  isLoading = false,
  isRefreshing = false,
  error = null,
  onRefresh,
}) {
  const hasPedidos = pedidos.length > 0;
  const sectionConfig = SANTACASA_HISTORICO_PAGE.sections.list;

  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <SantaCasaHistoricoState
          title={sectionConfig.loadingTitle}
          description={sectionConfig.loadingDescription}
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section} aria-live="polite">
        <SantaCasaHistoricoState
          title={sectionConfig.errorTitle}
          description={error}
          actionLabel={SANTACASA_HISTORICO_PAGE.actions.refresh}
          onAction={onRefresh}
        />
      </section>
    );
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="santacasa-historico-list-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id="santacasa-historico-list-title" className={styles.title}>
            {sectionConfig.title}
          </h2>

          <p className={styles.description}>{sectionConfig.description}</p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {isRefreshing
            ? SANTACASA_HISTORICO_PAGE.actions.refreshing
            : SANTACASA_HISTORICO_PAGE.actions.refresh}
        </button>
      </header>

      {!hasPedidos ? (
        <SantaCasaHistoricoState
          title={sectionConfig.emptyTitle}
          description={sectionConfig.emptyDescription}
        />
      ) : (
        <div className={styles.list}>
          {pedidos.map((pedido) => (
            <SantaCasaHistoricoCard key={pedido.id} pedido={pedido} />
          ))}
        </div>
      )}
    </section>
  );
}
