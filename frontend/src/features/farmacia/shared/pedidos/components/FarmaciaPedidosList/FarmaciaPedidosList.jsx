import styles from "./FarmaciaPedidosList.module.css";

import FarmaciaPedidoCard from "../FarmaciaPedidoCard/FarmaciaPedidoCard";

import { FARMACIA_PEDIDO_UI } from "../../config/farmaciaPedidoUi.config";

function FarmaciaPedidosState({ title, description, actionLabel, onAction }) {
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

function getDefaultSectionConfig(variant) {
  if (variant === "history") {
    return FARMACIA_PEDIDO_UI.sections.history;
  }

  return FARMACIA_PEDIDO_UI.sections.list;
}

export default function FarmaciaPedidosList({
  pedidos = [],
  variant = "pending",
  sectionConfig: customSectionConfig = null,
  isLoading = false,
  isRefreshing = false,
  isActionDisabled = false,
  validatingPedidoId = null,
  rejectingPedidoId = null,
  error = null,
  onRefresh,
  onValidate,
  onReject,
}) {
  const sectionConfig = customSectionConfig || getDefaultSectionConfig(variant);
  const hasPedidos = pedidos.length > 0;
  const showActions = variant !== "history";

  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <FarmaciaPedidosState
          title={sectionConfig.loadingTitle}
          description="Aguarda enquanto os dados são carregados."
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section} aria-live="polite">
        <FarmaciaPedidosState
          title={sectionConfig.errorTitle}
          description={error}
          actionLabel={FARMACIA_PEDIDO_UI.actions.refresh}
          onAction={onRefresh}
        />
      </section>
    );
  }

  return (
    <section
      className={styles.section}
      aria-labelledby={`farmacia-pedidos-${variant}-title`}
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id={`farmacia-pedidos-${variant}-title`} className={styles.title}>
            {sectionConfig.title}
          </h2>

          <p className={styles.description}>{sectionConfig.description}</p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          disabled={isRefreshing || isActionDisabled}
          onClick={onRefresh}
        >
          {isRefreshing
            ? FARMACIA_PEDIDO_UI.actions.refreshing
            : FARMACIA_PEDIDO_UI.actions.refresh}
        </button>
      </header>

      {!hasPedidos ? (
        <FarmaciaPedidosState
          title={sectionConfig.emptyTitle}
          description={sectionConfig.emptyDescription}
        />
      ) : (
        <div className={styles.list}>
          {pedidos.map((pedido) => (
            <FarmaciaPedidoCard
              key={pedido.id}
              pedido={pedido}
              variant={variant}
              showActions={showActions}
              isValidating={validatingPedidoId === pedido.id}
              isRejecting={rejectingPedidoId === pedido.id}
              isActionDisabled={isActionDisabled}
              onValidate={onValidate}
              onReject={onReject}
            />
          ))}
        </div>
      )}
    </section>
  );
}
