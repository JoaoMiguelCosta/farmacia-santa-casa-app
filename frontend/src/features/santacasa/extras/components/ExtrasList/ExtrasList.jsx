import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";
import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { EXTRAS_PAGE } from "../../config/extrasPage.config";

import styles from "./ExtrasList.module.css";

function getQuantidadeSolicitada(item) {
  return Number(item.quantidadeSolicitada ?? item.quantidade ?? 0) || 0;
}

function getQuantidadeRegularizada(item) {
  return (
    Number(item.quantidadeRegularizada ?? item.quantidadeDispensada ?? 0) || 0
  );
}

function getQuantidadeRestante(item) {
  const restante = Number(item.quantidadeRestante);

  if (Number.isFinite(restante)) {
    return Math.max(0, restante);
  }

  return Math.max(
    0,
    getQuantidadeSolicitada(item) - getQuantidadeRegularizada(item),
  );
}

function buildPedidoItem(item) {
  const quantidadeRestante = getQuantidadeRestante(item);

  return {
    key: `EXTRA:${item.id}`,
    tipo: "EXTRA",
    id: item.id,
    title: item.medicamento,
    description: "Venda suspensa por regularizar",
    meta: `Quantidade restante ${quantidadeRestante}`,
    quantidadeRestante,
    source: item,
  };
}

function getInputQuantity(value, max) {
  if (max <= 0) return 0;

  const quantity = Math.floor(Number(value));

  if (!Number.isFinite(quantity) || quantity < 1) return 1;

  return Math.min(quantity, max);
}

function getStatusLabel({ quantidadeDisponivel, quantidadeEmPedido }) {
  if (quantidadeDisponivel > 0) return "Pendente";
  if (quantidadeEmPedido > 0) return "Selecionado";

  return "Regularizado";
}

function getStatusClassName({ quantidadeDisponivel }) {
  return quantidadeDisponivel > 0
    ? `${styles.status} ${styles.pendente}`
    : `${styles.status} ${styles.regularizado}`;
}

export default function ExtrasList({
  items = [],
  selectedUtenteId = "",
  selectedUtente = null,
  isLoading = false,
  error = null,
  deletingItemId = null,
  pedidoQuantities = {},
  pedidoItemsQuantities = {},
  onPedidoQuantityChange,
  onAddToPedido,
  onRetry,
  onBlockedDelete,
  onDelete,
}) {
  const hasPedidoActions = typeof onAddToPedido === "function";
  const hasDeleteActions = typeof onDelete === "function";

  if (!selectedUtenteId) {
    return (
      <DataState
        type="empty"
        title="Seleciona um utente."
        description="Depois de selecionares um utente, as vendas suspensas aparecem aqui."
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={EXTRAS_PAGE.list.loadingTitle}
        description="Aguarda enquanto as vendas suspensas são carregadas."
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={EXTRAS_PAGE.list.errorTitle}
        description={error}
        actionLabel="Tentar novamente"
        onAction={onRetry}
      />
    );
  }

  if (items.length === 0) {
    return (
      <DataState
        type="empty"
        title={EXTRAS_PAGE.list.emptyTitle}
        description={EXTRAS_PAGE.list.emptyDescription}
      />
    );
  }

  return (
    <SurfaceCard
      title={EXTRAS_PAGE.list.title}
      description={EXTRAS_PAGE.list.description}
      tone="strong"
    >
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>
            Lista de vendas suspensas do utente selecionado
          </caption>

          <thead>
            <tr>
              <th scope="col">Utente</th>
              <th scope="col">Medicamento</th>
              <th scope="col">Quantidade</th>
              <th scope="col">Estado</th>
              <th scope="col">Criado em</th>
              {hasPedidoActions ? <th scope="col">Pedido</th> : null}
              {hasDeleteActions ? <th scope="col">Remover</th> : null}
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const pedidoItem = buildPedidoItem(item);

              const quantidadeEmPedido =
                Number(pedidoItemsQuantities[pedidoItem.key]) || 0;

              const isDeleteBlocked = quantidadeEmPedido > 0;

              const quantidadeDisponivel = Math.max(
                0,
                pedidoItem.quantidadeRestante - quantidadeEmPedido,
              );

              const quantity = getInputQuantity(
                pedidoQuantities[pedidoItem.key],
                quantidadeDisponivel,
              );

              const isDeleting = deletingItemId === item.id;
              const quantidadeSolicitada = getQuantidadeSolicitada(item);
              const quantidadeRegularizada = getQuantidadeRegularizada(item);

              return (
                <tr key={item.id}>
                  <td className={styles.identityCell}>
                    <strong>
                      {selectedUtente?.nome || "Utente selecionado"}
                    </strong>
                    <span>{selectedUtente?.numero9 || selectedUtenteId}</span>
                  </td>

                  <td className={styles.medicineCell}>
                    <strong>{item.medicamento}</strong>
                    <span>{item.id}</span>
                  </td>

                  <td className={styles.quantityCell}>
                    <strong>{quantidadeDisponivel}</strong>
                    <span>
                      Total {quantidadeSolicitada} · Regularizada{" "}
                      {quantidadeRegularizada}
                    </span>
                    <span>Em pedido {quantidadeEmPedido}</span>
                  </td>

                  <td>
                    <span
                      className={getStatusClassName({
                        quantidadeDisponivel,
                      })}
                    >
                      {getStatusLabel({
                        quantidadeDisponivel,
                        quantidadeEmPedido,
                      })}
                    </span>
                  </td>

                  <td>
                    <span className={styles.dateValue}>
                      {formatDateTime(item.createdAt)}
                    </span>
                  </td>

                  {hasPedidoActions ? (
                    <td className={styles.actionCell}>
                      <div className={styles.actionStack}>
                        <label htmlFor={`extra-pedido-${item.id}`}>Qtd</label>

                        <input
                          id={`extra-pedido-${item.id}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={quantity}
                          disabled={quantidadeDisponivel <= 0}
                          aria-label={`Quantidade para pedido de ${item.medicamento}`}
                          onChange={(event) =>
                            onPedidoQuantityChange?.(
                              pedidoItem.key,
                              event.target.value,
                              quantidadeDisponivel,
                            )
                          }
                        />

                        <Button
                          type="button"
                          size="sm"
                          disabled={quantidadeDisponivel <= 0}
                          onClick={() =>
                            onAddToPedido({
                              ...pedidoItem,
                              quantidade: quantity,
                            })
                          }
                        >
                          {quantidadeDisponivel <= 0
                            ? "Sem saldo"
                            : "Adicionar"}
                        </Button>
                      </div>
                    </td>
                  ) : null}

                  {hasDeleteActions ? (
                    <td className={styles.actionCell}>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        isLoading={isDeleting}
                        disabled={Boolean(deletingItemId)}
                        onClick={() => {
                          if (isDeleteBlocked) {
                            onBlockedDelete?.(item, quantidadeEmPedido);
                            return;
                          }

                          onDelete(item);
                        }}
                      >
                        {isDeleting
                          ? EXTRAS_PAGE.list.deletingLabel
                          : EXTRAS_PAGE.list.deleteLabel}
                      </Button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
