import { useState } from "react";

import Button from "../../shared/ui/Button/Button";
import ConfirmDialog from "../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../shared/ui/FeedbackDialog/FeedbackDialog";
import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import SantaCasaSectionNav from "../../features/santacasa/shared/components/SantaCasaSectionNav/SantaCasaSectionNav";

import PedidoGeralList from "../../features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralList";
import { createPedido } from "../../features/santacasa/pedidos/api/pedidosApi";
import { usePedidoDraft } from "../../features/santacasa/pedidos/state/usePedidoDraft";

import {
  deleteExtra,
  getExtrasByUtente,
} from "../../features/santacasa/extras/api/extrasApi";

import styles from "./SantaCasaPedidosPage.module.css";

function clampQuantity(value, max) {
  const quantity = Math.floor(Number(value));
  const maxQuantity = Math.floor(Number(max));

  if (!Number.isFinite(maxQuantity) || maxQuantity <= 0) return 0;
  if (!Number.isFinite(quantity) || quantity <= 0) return 1;

  return Math.min(quantity, maxQuantity);
}

function formatUnitsLabel(quantity) {
  const amount = Number(quantity) || 0;

  return amount === 1 ? "1 unidade" : `${amount} unidades`;
}

function normalizeMedicationName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getItemMedicationName(item) {
  return (
    item?.medicamento ||
    item?.nome ||
    item?.title ||
    item?.source?.medicamento ||
    item?.source?.nome ||
    ""
  );
}

function isSameMedication(a, b) {
  return (
    normalizeMedicationName(getItemMedicationName(a)) ===
    normalizeMedicationName(getItemMedicationName(b))
  );
}

function buildPedidoPayload(items = []) {
  return {
    items: items.map((item) => ({
      utenteId: item.utenteId,
      tipo: item.tipo,
      id: item.id,
      quantidade: Number(item.quantidade),
    })),
  };
}

function buildRemoveMessage(item, quantity) {
  return `${formatUnitsLabel(quantity)} de ${getItemMedicationName(
    item,
  )} retiradas do pedido geral. A quantidade voltou a ficar disponível na lista correspondente.`;
}

function buildRemoveAllMessage(item) {
  return `${getItemMedicationName(
    item,
  )} removido do pedido geral. A quantidade voltou a ficar disponível na lista correspondente.`;
}

export default function SantaCasaPedidosPage() {
  const {
    items,
    count,
    hasItems,

    updateItemQuantity,
    removeItemQuantity,
    removeItem,
    removeItemsByKeys,
    clearDraft,
  } = usePedidoDraft();

  const [returnQuantities, setReturnQuantities] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function deleteCompatibleExtrasFromBackend(receitaItem) {
    const matchingDraftExtras = items.filter((item) => {
      return (
        item.tipo === "EXTRA" &&
        item.utenteId === receitaItem.utenteId &&
        isSameMedication(item, receitaItem)
      );
    });

    const backendExtras = await getExtrasByUtente(receitaItem.utenteId).catch(
      () => [],
    );

    const matchingBackendExtras = backendExtras.filter((extra) =>
      isSameMedication(extra, receitaItem),
    );

    const keysToRemove = [
      ...matchingDraftExtras.map((item) => item.key),
      ...matchingBackendExtras.map((extra) => `EXTRA:${extra.id}`),
    ];

    if (keysToRemove.length > 0) {
      removeItemsByKeys(keysToRemove);
    }

    if (matchingBackendExtras.length === 0) {
      return {
        removedCount: matchingDraftExtras.length,
        removedLabel:
          matchingDraftExtras.length === 1
            ? matchingDraftExtras[0].title
            : `${matchingDraftExtras.length} Extras`,
      };
    }

    try {
      await Promise.all(
        matchingBackendExtras.map((extra) =>
          deleteExtra(receitaItem.utenteId, extra.id),
        ),
      );

      return {
        removedCount: matchingBackendExtras.length,
        removedLabel:
          matchingBackendExtras.length === 1
            ? matchingBackendExtras[0].medicamento
            : `${matchingBackendExtras.length} Extras`,
      };
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.message ||
          "Erro ao remover Extra incompatível com a receita disponível.",
      });

      return {
        removedCount: 0,
        removedLabel: "",
      };
    }
  }

  function handleReturnQuantityChange(itemKey, value, max) {
    const quantity = max > 0 ? clampQuantity(value, max) : 0;

    setReturnQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: quantity,
    }));
  }

  async function handleReturnQuantity(itemKey, quantityToReturn) {
    const item = items.find((currentItem) => currentItem.key === itemKey);

    if (!item) return;

    const currentQuantity = Number(item.quantidade) || 0;
    const returnQuantity = clampQuantity(quantityToReturn, currentQuantity);

    removeItemQuantity(itemKey, returnQuantity);

    setReturnQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: 1,
    }));

    let extraInfo = null;

    if (item.tipo === "COM_RECEITA") {
      extraInfo = await deleteCompatibleExtrasFromBackend(item);
    }

    const extraMessage =
      extraInfo?.removedCount > 0
        ? ` ${extraInfo.removedLabel} removido dos Extras em aberto e do pedido geral, porque voltou a existir quantidade disponível com receita para o mesmo medicamento.`
        : "";

    setFeedback({
      type: "success",
      message: `${buildRemoveMessage(item, returnQuantity)}${extraMessage}`,
    });
  }

  async function handleQuantityChange(itemKey, value) {
    const item = items.find((currentItem) => currentItem.key === itemKey);

    if (!item) return;

    const currentQuantity = Number(item.quantidade) || 0;
    const nextQuantity = clampQuantity(value, item.quantidadeRestante);

    updateItemQuantity(itemKey, nextQuantity);

    if (item.tipo === "COM_RECEITA" && nextQuantity < currentQuantity) {
      const extraInfo = await deleteCompatibleExtrasFromBackend(item);

      if (extraInfo.removedCount > 0) {
        setFeedback({
          type: "info",
          message: `${extraInfo.removedLabel} removido dos Extras em aberto e do pedido geral, porque voltou a existir quantidade disponível com receita para o mesmo medicamento.`,
        });
      }
    }
  }

  async function handleRemoveItem(itemKey) {
    const item = items.find((currentItem) => currentItem.key === itemKey);

    if (!item) return;

    removeItem(itemKey);

    setReturnQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: 1,
    }));

    let extraInfo = null;

    if (item.tipo === "COM_RECEITA") {
      extraInfo = await deleteCompatibleExtrasFromBackend(item);
    }

    const extraMessage =
      extraInfo?.removedCount > 0
        ? ` ${extraInfo.removedLabel} removido dos Extras em aberto e do pedido geral, porque voltou a existir quantidade disponível com receita para o mesmo medicamento.`
        : "";

    setFeedback({
      type: "success",
      message: `${buildRemoveAllMessage(item)}${extraMessage}`,
    });
  }

  function handleRequestClearDraft() {
    if (!hasItems) return;

    setIsClearDialogOpen(true);
  }

  function handleCancelClearDraft() {
    setIsClearDialogOpen(false);
  }

  function handleConfirmClearDraft() {
    clearDraft();
    setReturnQuantities({});
    setIsClearDialogOpen(false);

    setFeedback({
      type: "success",
      message: "Pedido geral limpo com sucesso.",
    });
  }

  async function handleSubmitPedido(event) {
    event.preventDefault();

    if (!hasItems) {
      setFeedback({
        type: "info",
        message: "Adiciona pelo menos um item ao pedido geral antes de enviar.",
      });

      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await createPedido(buildPedidoPayload(items));

      clearDraft();
      setReturnQuantities({});

      setFeedback({
        type: "success",
        message:
          "Pedido geral enviado para a Farmácia com sucesso. A Farmácia pode agora validar ou rejeitar o pedido.",
      });
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.message || "Erro ao enviar pedido para a Farmácia.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const utentesCount = new Set(items.map((item) => item.utenteId)).size;

  return (
    <section className={styles.page} aria-labelledby="santacasa-pedidos-title">
      <PageHeader
        titleId="santacasa-pedidos-title"
        eyebrow="Santa Casa"
        title="Pedidos"
        description="Lista geral multiutente para enviar um único pedido consolidado para a Farmácia."
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={handleRequestClearDraft}
            disabled={!hasItems}
          >
            Limpar pedido
          </Button>
        }
      />

      <SantaCasaSectionNav />

      <div
        className={styles.summary}
        aria-label="Resumo do pedido geral"
        role="list"
      >
        <article role="listitem">
          <strong>{count}</strong>
          <span>{count === 1 ? "item no pedido" : "itens no pedido"}</span>
        </article>

        <article role="listitem">
          <strong>{utentesCount}</strong>
          <span>{utentesCount === 1 ? "utente" : "utentes"}</span>
        </article>
      </div>

      <PedidoGeralList
        items={items}
        returnQuantities={returnQuantities}
        isSubmitting={isSubmitting}
        onQuantityChange={handleQuantityChange}
        onReturnQuantityChange={handleReturnQuantityChange}
        onReturnQuantity={handleReturnQuantity}
        onRemoveItem={handleRemoveItem}
        onClearRequest={handleRequestClearDraft}
        onSubmit={handleSubmitPedido}
      />

      <ConfirmDialog
        isOpen={isClearDialogOpen}
        title="Limpar pedido geral?"
        description="Todos os itens selecionados serão retirados do pedido geral. As quantidades voltam a ficar disponíveis nas respetivas listas."
        confirmLabel="Limpar pedido"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmClearDraft}
        onCancel={handleCancelClearDraft}
      />

      <FeedbackDialog
        isOpen={Boolean(feedback)}
        type={feedback?.type}
        message={feedback?.message}
        onClose={() => setFeedback(null)}
      />
    </section>
  );
}
