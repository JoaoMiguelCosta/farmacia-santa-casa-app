import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";
import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { SEM_RECEITA_PAGE } from "../../config/semReceitaPage.config";

import styles from "./SemReceitaList.module.css";

function buildPedidoItem(item) {
  return {
    key: `SEM_RECEITA:${item.id}`,
    tipo: "SEM_RECEITA",
    id: item.id,
    title: item.medicamento,
    description: "Medicamento não sujeito a receita médica",
    meta: `Total ${item.quantidade} · Reservada ${item.quantidadeReservadaPendente}`,
    quantidadeRestante: Number(item.quantidadeRestante) || 0,
    source: item,
  };
}

function getInputQuantity(value, max) {
  if (max <= 0) return 0;

  const quantity = Math.floor(Number(value));

  if (!Number.isFinite(quantity) || quantity < 1) return 1;

  return Math.min(quantity, max);
}

export default function SemReceitaList({
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
        description="Depois de selecionares um utente, os medicamentos não sujeitos a receita médica aparecem aqui."
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={SEM_RECEITA_PAGE.list.loadingTitle}
        description="Aguarda enquanto os medicamentos não sujeitos a receita médica são carregados."
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={SEM_RECEITA_PAGE.list.errorTitle}
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
        title={SEM_RECEITA_PAGE.list.emptyTitle}
        description={SEM_RECEITA_PAGE.list.emptyDescription}
      />
    );
  }

  return (
    <SurfaceCard
      title={SEM_RECEITA_PAGE.list.title}
      description={SEM_RECEITA_PAGE.list.description}
      tone="strong"
    >
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>
            Lista de medicamentos não sujeitos a receita médica do utente
            selecionado
          </caption>

          <thead>
            <tr>
              <th scope="col">Utente</th>
              <th scope="col">Medicamento</th>
              <th scope="col">Quantidade</th>
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

              return (
                <tr key={item.id}>
                  <td>
                    <strong>
                      {selectedUtente?.nome || "Utente selecionado"}
                    </strong>
                    <span>{selectedUtente?.numero9 || selectedUtenteId}</span>
                  </td>

                  <td>
                    <strong>{item.medicamento}</strong>
                    <span>{item.id}</span>
                  </td>

                  <td>
                    <strong>{quantidadeDisponivel}</strong>
                    <span>
                      Total {item.quantidade} · Reservada{" "}
                      {item.quantidadeReservadaPendente}
                    </span>
                    <span>Em pedido {quantidadeEmPedido}</span>
                  </td>

                  <td>{formatDateTime(item.createdAt)}</td>

                  {hasPedidoActions ? (
                    <td className={styles.actionCell}>
                      <div className={styles.actionStack}>
                        <label htmlFor={`sem-receita-pedido-${item.id}`}>
                          Qtd
                        </label>

                        <input
                          id={`sem-receita-pedido-${item.id}`}
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
                          ? SEM_RECEITA_PAGE.list.deletingLabel
                          : SEM_RECEITA_PAGE.list.deleteLabel}
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
