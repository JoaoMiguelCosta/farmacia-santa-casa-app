import Button from "../../shared/ui/Button/Button";
import ConfirmDialog from "../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../shared/ui/FeedbackDialog/FeedbackDialog";
import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import SantaCasaSectionNav from "../../features/santacasa/shared/components/SantaCasaSectionNav/SantaCasaSectionNav";

import PedidoGeralList from "../../features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralList";
import PedidoPendingList from "../../features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingList";

import { PEDIDOS_PAGE } from "../../features/santacasa/pedidos/config/pedidosPage.config";
import { useSantaCasaPedidosActions } from "../../features/santacasa/pedidos/hooks/useSantaCasaPedidosActions";
import { useSantaCasaPedidosPendentes } from "../../features/santacasa/pedidos/hooks/useSantaCasaPedidosPendentes";
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
    pedidos: pedidosPendentes,
    meta: pendentesMeta,

    searchInput: pendentesSearchInput,
    pedidoToCancel,

    currentPage: pendentesCurrentPage,
    totalPages: pendentesTotalPages,
    hasPreviousPage: pendentesHasPreviousPage,
    hasNextPage: pendentesHasNextPage,

    isLoading: isLoadingPendentes,
    isRefreshing: isRefreshingPendentes,
    isCanceling: isCancelingPedido,

    error: pendentesError,
    feedback: pendentesFeedback,

    refreshPendentes,

    updateSearchInput: updatePendentesSearchInput,
    applyFilters: applyPendentesFilters,
    clearFilters: clearPendentesFilters,
    goToPreviousPage: goToPreviousPendentesPage,
    goToNextPage: goToNextPendentesPage,

    requestCancelPedido,
    cancelCancelPedido,
    confirmCancelPedido,

    clearFeedback: clearPendentesFeedback,
  } = useSantaCasaPedidosPendentes();

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

    onPedidoCreated: refreshPendentes,
  });

  const utentesCount = new Set(items.map((item) => item.utenteId)).size;
  const activeFeedback = feedback || pendentesFeedback;

  function handleCloseFeedback() {
    if (feedback) {
      setFeedback(null);
    }

    if (pendentesFeedback) {
      clearPendentesFeedback();
    }
  }

  return (
    <section className={styles.page} aria-labelledby="santacasa-pedidos-title">
      <PageHeader
        titleId="santacasa-pedidos-title"
        eyebrow={PEDIDOS_PAGE.header.eyebrow}
        title={PEDIDOS_PAGE.header.title}
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
        aria-label="Resumo dos pedidos"
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

        <article role="listitem">
          <strong>{pendentesMeta.total}</strong>
          <span>
            {pendentesMeta.total === 1
              ? "pedido pendente enviado"
              : "pedidos pendentes enviados"}
          </span>
        </article>
      </div>

      <PedidoPendingList
        pedidos={pedidosPendentes}
        meta={pendentesMeta}
        searchInput={pendentesSearchInput}
        currentPage={pendentesCurrentPage}
        totalPages={pendentesTotalPages}
        hasPreviousPage={pendentesHasPreviousPage}
        hasNextPage={pendentesHasNextPage}
        isLoading={isLoadingPendentes}
        isRefreshing={isRefreshingPendentes}
        isCanceling={isCancelingPedido}
        error={pendentesError}
        onSearchChange={updatePendentesSearchInput}
        onApplyFilters={applyPendentesFilters}
        onClearFilters={clearPendentesFilters}
        onRefresh={refreshPendentes}
        onPreviousPage={goToPreviousPendentesPage}
        onNextPage={goToNextPendentesPage}
        onCancelRequest={requestCancelPedido}
      />

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

      <ConfirmDialog
        isOpen={Boolean(pedidoToCancel)}
        title={PEDIDOS_PAGE.cancelDialog.title}
        description={
          pedidoToCancel?.numero
            ? `Pedido #${pedidoToCancel.numero}. ${PEDIDOS_PAGE.cancelDialog.description}`
            : PEDIDOS_PAGE.cancelDialog.description
        }
        confirmLabel={PEDIDOS_PAGE.cancelDialog.confirmLabel}
        cancelLabel={PEDIDOS_PAGE.cancelDialog.cancelLabel}
        isLoading={isCancelingPedido}
        onConfirm={confirmCancelPedido}
        onCancel={cancelCancelPedido}
      />

      <FeedbackDialog
        isOpen={Boolean(activeFeedback)}
        type={activeFeedback?.type}
        message={activeFeedback?.message}
        onClose={handleCloseFeedback}
      />
    </section>
  );
}
