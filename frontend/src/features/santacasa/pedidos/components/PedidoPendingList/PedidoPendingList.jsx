import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import styles from "./PedidoPendingList.module.css";

function getPedidoNumberLabel(pedido) {
  const numero = Number(pedido?.numero);

  if (!Number.isFinite(numero)) return "—";

  return `#${numero}`;
}

function getTypeLabel(tipo) {
  if (tipo === "COM_RECEITA") return PEDIDOS_PAGE.labels.receita;
  if (tipo === "SEM_RECEITA") return PEDIDOS_PAGE.labels.semReceita;
  if (tipo === "EXTRA") return PEDIDOS_PAGE.labels.extra;

  return tipo || "—";
}

function getPedidoItems(pedido) {
  return Array.isArray(pedido?.itens) ? pedido.itens : [];
}

function getPedidoTotalQuantity(pedido) {
  return getPedidoItems(pedido).reduce((total, item) => {
    return total + (Number(item?.quantidade) || 0);
  }, 0);
}

function getPedidoUtentesLabel(pedido) {
  const utentesMap = new Map();

  getPedidoItems(pedido).forEach((item) => {
    const utente = item?.utente;

    if (!utente?.id) return;

    utentesMap.set(utente.id, {
      nome: utente.nome || "Utente",
      numero9: utente.numero9 || "—",
    });
  });

  const utentes = Array.from(utentesMap.values());

  if (utentes.length === 0) return "—";

  return utentes
    .map((utente) => `${utente.nome} · ${utente.numero9}`)
    .join(", ");
}

function getPaginationLabel({ meta, currentPage, totalPages }) {
  const total = Number(meta?.total) || 0;
  const skip = Number(meta?.skip) || 0;
  const take = Number(meta?.take) || 0;

  if (total === 0) {
    return "Sem pedidos pendentes.";
  }

  const start = skip + 1;
  const end = Math.min(skip + take, total);

  return `A mostrar ${start}-${end} de ${total} pedido(s). Página ${currentPage} de ${totalPages}.`;
}

function PedidoPendingCard({ pedido, isCanceling = false, onCancelRequest }) {
  const items = getPedidoItems(pedido);

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.identity}>
          <span>{PEDIDOS_PAGE.labels.pedido}</span>
          <h3>{getPedidoNumberLabel(pedido)}</h3>
        </div>

        <span className={styles.status}>Pendente</span>
      </header>

      <dl className={styles.summary}>
        <div>
          <dt>{PEDIDOS_PAGE.labels.createdAt}</dt>
          <dd>{formatDateTime(pedido?.createdAt)}</dd>
        </div>

        <div>
          <dt>{PEDIDOS_PAGE.labels.utente}</dt>
          <dd>{getPedidoUtentesLabel(pedido)}</dd>
        </div>

        <div>
          <dt>{PEDIDOS_PAGE.labels.items}</dt>
          <dd>{items.length}</dd>
        </div>

        <div>
          <dt>{PEDIDOS_PAGE.labels.totalQuantity}</dt>
          <dd>{getPedidoTotalQuantity(pedido)}</dd>
        </div>
      </dl>

      <ul className={styles.items} aria-label="Itens do pedido pendente">
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <span className={styles.itemType}>{getTypeLabel(item.tipo)}</span>

            <strong>{item.medicamento || "Medicamento"}</strong>

            <span>Qtd. {Number(item.quantidade) || 0}</span>
          </li>
        ))}
      </ul>

      <footer className={styles.actions}>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={isCanceling}
          onClick={() => onCancelRequest?.(pedido)}
        >
          {PEDIDOS_PAGE.actions.cancelPedido}
        </Button>
      </footer>
    </article>
  );
}

export default function PedidoPendingList({
  pedidos = [],
  meta,
  searchInput = "",
  currentPage = 1,
  totalPages = 1,
  hasPreviousPage = false,
  hasNextPage = false,
  isLoading = false,
  isRefreshing = false,
  isCanceling = false,
  error = null,
  onSearchChange,
  onApplyFilters,
  onClearFilters,
  onRefresh,
  onPreviousPage,
  onNextPage,
  onCancelRequest,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onApplyFilters?.();
  }

  const paginationLabel = getPaginationLabel({
    meta,
    currentPage,
    totalPages,
  });

  return (
    <SurfaceCard
      title={PEDIDOS_PAGE.sections.pending.title}
      description={PEDIDOS_PAGE.sections.pending.description}
      tone="strong"
    >
      <form className={styles.filters} onSubmit={handleSubmit}>
        <label className={styles.filterField}>
          <span>{PEDIDOS_PAGE.filters.searchLabel}</span>

          <input
            type="search"
            value={searchInput}
            placeholder={PEDIDOS_PAGE.filters.searchPlaceholder}
            disabled={isLoading || isRefreshing || isCanceling}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </label>

        <div className={styles.filterActions}>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || isRefreshing || isCanceling}
          >
            {PEDIDOS_PAGE.filters.submit}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isLoading || isRefreshing || isCanceling}
            onClick={onClearFilters}
          >
            {PEDIDOS_PAGE.filters.clear}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            isLoading={isRefreshing}
            disabled={isLoading || isCanceling}
            onClick={onRefresh}
          >
            {isRefreshing
              ? PEDIDOS_PAGE.actions.refreshing
              : PEDIDOS_PAGE.actions.refresh}
          </Button>
        </div>
      </form>

      {isLoading ? (
        <DataState
          type="loading"
          title={PEDIDOS_PAGE.sections.pending.loadingTitle}
          description="Aguarda enquanto os pedidos pendentes são carregados."
        />
      ) : null}

      {!isLoading && error ? (
        <DataState
          type="error"
          title={PEDIDOS_PAGE.sections.pending.errorTitle}
          description={error}
          actionLabel="Tentar novamente"
          onAction={onRefresh}
        />
      ) : null}

      {!isLoading && !error && pedidos.length === 0 ? (
        <DataState
          type="empty"
          title={PEDIDOS_PAGE.sections.pending.emptyTitle}
          description={PEDIDOS_PAGE.sections.pending.emptyDescription}
        />
      ) : null}

      {!isLoading && !error && pedidos.length > 0 ? (
        <div className={styles.list}>
          {pedidos.map((pedido) => (
            <PedidoPendingCard
              key={pedido.id}
              pedido={pedido}
              isCanceling={isCanceling}
              onCancelRequest={onCancelRequest}
            />
          ))}
        </div>
      ) : null}

      <section
        className={styles.pagination}
        aria-label="Paginação de pedidos pendentes"
      >
        <p>{paginationLabel}</p>

        <div className={styles.paginationActions}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={
              !hasPreviousPage || isLoading || isRefreshing || isCanceling
            }
            onClick={onPreviousPage}
          >
            {PEDIDOS_PAGE.actions.previous}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!hasNextPage || isLoading || isRefreshing || isCanceling}
            onClick={onNextPage}
          >
            {PEDIDOS_PAGE.actions.next}
          </Button>
        </div>
      </section>
    </SurfaceCard>
  );
}
