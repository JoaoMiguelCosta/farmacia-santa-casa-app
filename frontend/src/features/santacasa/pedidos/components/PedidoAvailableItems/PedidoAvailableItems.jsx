import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import styles from "./PedidoAvailableItems.module.css";

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

function getAvailableQuantity(value) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity) || quantity < 0) return 0;

  return quantity;
}

export default function PedidoAvailableItems({
  items = [],
  selectedUtenteId = "",
  isLoading = false,
  error = null,
  selectedKeys = [],
  onRetry,
  onAdd,
}) {
  if (!selectedUtenteId) {
    return (
      <DataState
        type="empty"
        title="Seleciona um utente."
        description="Depois de selecionares um utente, os itens disponíveis aparecem aqui."
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={PEDIDOS_PAGE.sections.available.loadingTitle}
        description="Aguarda enquanto os dados são carregados."
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={PEDIDOS_PAGE.sections.available.errorTitle}
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
        title={PEDIDOS_PAGE.sections.available.emptyTitle}
        description={PEDIDOS_PAGE.sections.available.emptyDescription}
      />
    );
  }

  return (
    <SurfaceCard
      title={PEDIDOS_PAGE.sections.available.title}
      description={PEDIDOS_PAGE.sections.available.description}
      tone="strong"
    >
      <div className={styles.grid} role="list">
        {items.map((item) => {
          const isSelected = selectedKeys.includes(item.key);
          const quantidadeRestante = getAvailableQuantity(
            item.quantidadeRestante,
          );
          const isUnavailable = quantidadeRestante <= 0;
          const isDisabled = isSelected || isUnavailable;

          const cardClassName = [
            styles.card,
            isSelected ? styles.selected : "",
            isUnavailable ? styles.unavailable : "",
          ]
            .filter(Boolean)
            .join(" ");

          const badgeClassName = [styles.badge, getTypeClassName(item.tipo)]
            .filter(Boolean)
            .join(" ");

          return (
            <article key={item.key} className={cardClassName} role="listitem">
              <div className={styles.content}>
                <span className={badgeClassName}>
                  {getTypeLabel(item.tipo)}
                </span>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <small>{item.meta}</small>

                <strong className={styles.stock}>
                  Disponível: {quantidadeRestante}
                </strong>
              </div>

              <div className={styles.action}>
                <Button
                  type="button"
                  variant={isSelected ? "secondary" : "primary"}
                  size="sm"
                  disabled={isDisabled}
                  aria-label={
                    isSelected
                      ? `${item.title} já selecionado`
                      : `Adicionar ${item.title} ao pedido`
                  }
                  onClick={() => onAdd?.(item)}
                >
                  {isSelected
                    ? "Selecionado"
                    : isUnavailable
                      ? "Indisponível"
                      : PEDIDOS_PAGE.labels.add}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
