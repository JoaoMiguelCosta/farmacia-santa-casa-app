import Button from "../../shared/ui/Button/Button";
import ConfirmDialog from "../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../shared/ui/FeedbackDialog/FeedbackDialog";
import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import SantaCasaSectionNav from "../../features/santacasa/shared/components/SantaCasaSectionNav/SantaCasaSectionNav";

import PedidoGeralList from "../../features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralList";
import { useSantaCasaPedidosActions } from "../../features/santacasa/pedidos/hooks/useSantaCasaPedidosActions";
import { usePedidoDraft } from "../../features/santacasa/pedidos/state/usePedidoDraft";

import styles from "./SantaCasaPedidosPage.module.css";

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

  const {
    returnQuantities,

    isSubmitting,
    isClearDialogOpen,
    feedback,
    setFeedback,

    handleReturnQuantityChange,
    handleReturnQuantity,
    handleQuantityChange,
    handleRemoveItem,

    handleRequestClearDraft,
    handleCancelClearDraft,
    handleConfirmClearDraft,

    handleSubmitPedido,
  } = useSantaCasaPedidosActions({
    items,
    hasItems,

    updateItemQuantity,
    removeItemQuantity,
    removeItem,
    removeItemsByKeys,
    clearDraft,
  });

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
