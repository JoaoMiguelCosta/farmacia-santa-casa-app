import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import FormField from "../../../../../shared/ui/FormField/FormField";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import styles from "./PedidoDraft.module.css";

function getTypeLabel(tipo) {
  if (tipo === "COM_RECEITA") return PEDIDOS_PAGE.labels.receita;
  if (tipo === "SEM_RECEITA") return PEDIDOS_PAGE.labels.semReceita;
  if (tipo === "EXTRA") return PEDIDOS_PAGE.labels.extra;

  return tipo;
}

function getTypeClassName(tipo) {
  if (tipo === "COM_RECEITA") return styles.receita;
  if (tipo === "SEM_RECEITA") return styles.semReceita;
  if (tipo === "EXTRA") return styles.extra;

  return styles.defaultType;
}

function getSafeInputId(prefix, key) {
  return `${prefix}-${String(key).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function getQuantityInfo(item) {
  const maximoDisponivel = Number(item.quantidadeRestante) || 0;
  const quantidadeEmPedido = Number(item.quantidade) || 0;
  const quantidadeNaLista = Math.max(0, maximoDisponivel - quantidadeEmPedido);

  return {
    maximoDisponivel,
    quantidadeEmPedido,
    quantidadeNaLista,
  };
}

function getQuantityToRemove(value, max) {
  if (max <= 0) return 0;

  const quantity = Math.floor(Number(value));

  if (!Number.isFinite(quantity) || quantity < 1) return 1;

  return Math.min(quantity, max);
}

export default function PedidoDraft({
  items = [],
  returnQuantities = {},
  isSubmitting = false,
  onQuantityChange,
  onReturnQuantityChange,
  onReturnQuantity,
  onRemove,
  onSubmit,
}) {
  return (
    <SurfaceCard
      title={PEDIDOS_PAGE.sections.draft.title}
      description={PEDIDOS_PAGE.sections.draft.description}
      tone="gold"
    >
      {items.length === 0 ? (
        <DataState
          type="empty"
          title={PEDIDOS_PAGE.sections.draft.emptyTitle}
          description={PEDIDOS_PAGE.sections.draft.emptyDescription}
        />
      ) : (
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.items} role="list">
            {items.map((item) => {
              const {
                maximoDisponivel,
                quantidadeEmPedido,
                quantidadeNaLista,
              } = getQuantityInfo(item);

              const quantityToRemove = getQuantityToRemove(
                returnQuantities[item.key],
                quantidadeEmPedido,
              );

              const quantityInputId = getSafeInputId(
                "pedido-quantidade",
                item.key,
              );

              const removeInputId = getSafeInputId("pedido-retirar", item.key);

              const badgeClassName = [styles.badge, getTypeClassName(item.tipo)]
                .filter(Boolean)
                .join(" ");

              return (
                <article key={item.key} className={styles.item} role="listitem">
                  <div className={styles.content}>
                    <span className={badgeClassName}>
                      {getTypeLabel(item.tipo)}
                    </span>

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>

                    {item.meta ? <small>{item.meta}</small> : null}

                    <div className={styles.quantitySummary}>
                      <span>
                        <strong>Máximo disponível:</strong> {maximoDisponivel}
                      </span>

                      <span>
                        <strong>Na lista:</strong> {quantidadeNaLista}
                      </span>

                      <span>
                        <strong>No pedido:</strong> {quantidadeEmPedido}
                      </span>
                    </div>
                  </div>

                  <div className={styles.controls}>
                    <FormField
                      id={quantityInputId}
                      label="Quantidade no pedido"
                    >
                      <input
                        id={quantityInputId}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={item.quantidade}
                        disabled={isSubmitting || maximoDisponivel <= 0}
                        aria-label={`Quantidade de ${item.title} no pedido`}
                        onChange={(event) =>
                          onQuantityChange?.(item.key, event.target.value)
                        }
                      />
                    </FormField>

                    <div className={styles.returnControls}>
                      <FormField id={removeInputId} label="Qtd a retirar">
                        <input
                          id={removeInputId}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={quantityToRemove}
                          disabled={isSubmitting || quantidadeEmPedido <= 0}
                          aria-label={`Quantidade de ${item.title} a retirar do pedido`}
                          onChange={(event) =>
                            onReturnQuantityChange?.(
                              item.key,
                              event.target.value,
                              quantidadeEmPedido,
                            )
                          }
                        />
                      </FormField>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isSubmitting || quantidadeEmPedido <= 0}
                        onClick={() =>
                          onReturnQuantity?.(item.key, quantityToRemove)
                        }
                      >
                        Retirar
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => onRemove?.(item.key)}
                    >
                      Remover do pedido
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          <footer className={styles.actions}>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? PEDIDOS_PAGE.sections.draft.submittingLabel
                : PEDIDOS_PAGE.sections.draft.submitLabel}
            </Button>
          </footer>
        </form>
      )}
    </SurfaceCard>
  );
}
