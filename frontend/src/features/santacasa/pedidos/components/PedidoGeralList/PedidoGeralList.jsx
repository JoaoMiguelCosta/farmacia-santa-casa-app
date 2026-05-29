import Button from "../../../../../shared/ui/Button/Button";
import BarcodeValue from "../../../../../shared/ui/BarcodeValue/BarcodeValue";
import DataState from "../../../../../shared/ui/DataState/DataState";
import FormField from "../../../../../shared/ui/FormField/FormField";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import styles from "./PedidoGeralList.module.css";

function getTypeLabel(tipo) {
  if (tipo === "COM_RECEITA") return PEDIDOS_PAGE.labels.receita;
  if (tipo === "SEM_RECEITA") return PEDIDOS_PAGE.labels.semReceita;
  if (tipo === "EXTRA") return PEDIDOS_PAGE.labels.extra;

  return tipo;
}

function getReturnQuantity(value, max) {
  const quantity = Math.floor(Number(value));

  if (!Number.isFinite(quantity) || quantity < 1) return 1;

  return Math.min(quantity, max);
}

function getQuantityInfo(item) {
  const maximoDisponivel = Number(item.quantidadeRestante) || 0;
  const quantidadeNoPedido = Number(item.quantidade) || 0;
  const quantidadeNaOrigem = Math.max(0, maximoDisponivel - quantidadeNoPedido);

  return {
    maximoDisponivel,
    quantidadeNoPedido,
    quantidadeNaOrigem,
  };
}

function extractReceitaNumber(description) {
  const match = String(description || "").match(/receita\s+([0-9]+)/i);

  return match?.[1] || "";
}

function extractPinAcesso(meta) {
  const match = String(meta || "").match(/pin\s+([0-9]+)/i);

  return match?.[1] || "";
}

function extractPinOpcao(meta) {
  const match = String(meta || "").match(/opção\s+([0-9]+)/i);

  return match?.[1] || "";
}

function getPedidoGeralReceita(item) {
  if (item?.tipo !== "COM_RECEITA") return null;

  const source = item?.source;

  if (source?.receitaLinha?.receita) {
    return source.receitaLinha.receita;
  }

  if (source?.receita) {
    return source.receita;
  }

  if (source?.numero19 || source?.pinAcesso6 || source?.pinOpcao4) {
    return source;
  }

  return {
    numero19: extractReceitaNumber(item?.description),
    pinAcesso6: extractPinAcesso(item?.meta),
    pinOpcao4: extractPinOpcao(item?.meta),
  };
}

function hasReceitaBarcodeData(receita) {
  return Boolean(
    receita?.numero19 || receita?.pinAcesso6 || receita?.pinOpcao4,
  );
}

function PedidoGeralReceitaBarcodes({ receita }) {
  if (!hasReceitaBarcodeData(receita)) return null;

  const codes = [
    {
      key: "numero19",
      label: "N.º receita",
      value: receita.numero19,
      width: 0.72,
    },
    {
      key: "pinAcesso6",
      label: "PIN acesso",
      value: receita.pinAcesso6,
      width: 1.08,
    },
    {
      key: "pinOpcao4",
      label: "PIN opção",
      value: receita.pinOpcao4,
      width: 1.16,
    },
  ];

  return (
    <div className={styles.barcodePanel} aria-label="Códigos da receita">
      {codes.map((code) => (
        <BarcodeValue
          key={code.key}
          size="compact"
          label={code.label}
          value={code.value}
          caption={code.value}
          height={28}
          width={code.width}
          displayValue={false}
        />
      ))}
    </div>
  );
}

function groupByUtente(items = []) {
  const collator = new Intl.Collator("pt-PT", {
    sensitivity: "base",
    numeric: true,
  });

  const groupsMap = new Map();

  items.forEach((item) => {
    const groupKey = item.utenteId;

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        utenteId: item.utenteId,
        utenteNome: item.utenteNome || "Utente",
        utenteNumero9: item.utenteNumero9 || "",
        items: [],
      });
    }

    groupsMap.get(groupKey).items.push(item);
  });

  return Array.from(groupsMap.values())
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => {
        const tipoCompare = collator.compare(a.tipo || "", b.tipo || "");

        if (tipoCompare !== 0) return tipoCompare;

        return collator.compare(a.title || "", b.title || "");
      }),
    }))
    .sort((a, b) => {
      const nameCompare = collator.compare(a.utenteNome, b.utenteNome);

      if (nameCompare !== 0) return nameCompare;

      return collator.compare(a.utenteNumero9, b.utenteNumero9);
    });
}

export default function PedidoGeralList({
  items = [],
  returnQuantities = {},
  isSubmitting = false,
  onQuantityChange,
  onReturnQuantityChange,
  onReturnQuantity,
  onRemoveItem,
  onClearRequest,
  onSubmit,
}) {
  const groups = groupByUtente(items);
  const totalItems = items.length;

  return (
    <SurfaceCard
      title="Pedido geral para a Farmácia"
      description="Revê os itens selecionados por utente antes de enviares um único pedido para a Farmácia."
      tone="gold"
    >
      {totalItems === 0 ? (
        <DataState
          type="empty"
          title="Pedido geral vazio."
          description="Adiciona itens a partir da página Operação. Podes juntar itens de vários utentes no mesmo pedido."
        />
      ) : (
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.groups}>
            {groups.map((group) => (
              <section key={group.utenteId} className={styles.group}>
                <header className={styles.groupHeader}>
                  <div>
                    <p className={styles.groupEyebrow}>Utente</p>
                    <h3>{group.utenteNome}</h3>
                    <span>{group.utenteNumero9}</span>
                  </div>

                  <strong>
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "item" : "itens"}
                  </strong>
                </header>

                <div className={styles.items}>
                  {group.items.map((item) => {
                    const {
                      maximoDisponivel,
                      quantidadeNoPedido,
                      quantidadeNaOrigem,
                    } = getQuantityInfo(item);

                    const returnQuantity = getReturnQuantity(
                      returnQuantities[item.key],
                      quantidadeNoPedido,
                    );

                    const receita = getPedidoGeralReceita(item);
                    const hasBarcodes = hasReceitaBarcodeData(receita);

                    return (
                      <article key={item.key} className={styles.item}>
                        <div className={styles.content}>
                          <span className={styles.badge}>
                            {getTypeLabel(item.tipo)}
                          </span>

                          <h4>{item.title}</h4>

                          {hasBarcodes ? (
                            <PedidoGeralReceitaBarcodes receita={receita} />
                          ) : (
                            <>
                              {item.description ? (
                                <p>{item.description}</p>
                              ) : null}

                              {item.meta ? <small>{item.meta}</small> : null}
                            </>
                          )}

                          <div className={styles.quantitySummary}>
                            <span>
                              <strong>Máximo disponível:</strong>{" "}
                              {maximoDisponivel}
                            </span>

                            <span>
                              <strong>Na origem:</strong> {quantidadeNaOrigem}
                            </span>

                            <span>
                              <strong>No pedido:</strong> {quantidadeNoPedido}
                            </span>
                          </div>
                        </div>

                        <div className={styles.controls}>
                          <FormField
                            id={`pedido-geral-quantidade-${item.key}`}
                            label="Quantidade no pedido"
                          >
                            <input
                              id={`pedido-geral-quantidade-${item.key}`}
                              type="number"
                              min="1"
                              max={maximoDisponivel}
                              value={item.quantidade}
                              disabled={isSubmitting}
                              onChange={(event) =>
                                onQuantityChange?.(item.key, event.target.value)
                              }
                            />
                          </FormField>

                          <div className={styles.returnControls}>
                            <FormField
                              id={`pedido-geral-retirar-${item.key}`}
                              label="Qtd a retirar"
                            >
                              <input
                                id={`pedido-geral-retirar-${item.key}`}
                                type="number"
                                min="1"
                                max={quantidadeNoPedido}
                                value={returnQuantity}
                                disabled={
                                  isSubmitting || quantidadeNoPedido <= 0
                                }
                                onChange={(event) =>
                                  onReturnQuantityChange?.(
                                    item.key,
                                    event.target.value,
                                    quantidadeNoPedido,
                                  )
                                }
                              />
                            </FormField>

                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={isSubmitting || quantidadeNoPedido <= 0}
                              onClick={() =>
                                onReturnQuantity?.(item.key, returnQuantity)
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
                            onClick={() => onRemoveItem?.(item.key)}
                          >
                            Remover do pedido
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <footer className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={onClearRequest}
            >
              Limpar pedido geral
            </Button>

            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "A enviar..." : "Enviar para Farmácia"}
            </Button>
          </footer>
        </form>
      )}
    </SurfaceCard>
  );
}
