// src/features/santacasa/pedidos/components/PedidosPageContent/PedidosPageContent.jsx

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import { useSantaCasaPedidosActions } from "../../hooks/useSantaCasaPedidosActions";
import { useSantaCasaPedidosPendentes } from "../../hooks/useSantaCasaPedidosPendentes";

import { usePedidoDraft } from "../../state/usePedidoDraft";

import PedidoGeralList from "../PedidoGeralList/PedidoGeralList";
import PedidoPendingList from "../PedidoPendingList/PedidoPendingList";
import SantaCasaPedidosDialogs from "./components/SantaCasaPedidosDialogs/SantaCasaPedidosDialogs";

import styles from "./PedidosPageContent.module.css";

export default function PedidosPageContent() {
  const {
    items,
    hasItems,

    removeItem,
    removeItemsByKeys,
    clearDraft,
  } = usePedidoDraft();

  const {
    pedidos: pedidosPendentes,
    meta: pendentesMeta,

    searchInput: pendentesSearchInput,

    currentPage: pendentesCurrentPage,

    totalPages: pendentesTotalPages,

    hasPreviousPage: pendentesHasPreviousPage,

    hasNextPage: pendentesHasNextPage,

    isLoading: isLoadingPendentes,

    isRefreshing: isRefreshingPendentes,

    error: pendentesError,

    refreshPendentes,

    updateSearchInput: updatePendentesSearchInput,

    applyFilters: applyPendentesFilters,

    clearFilters: clearPendentesFilters,

    goToPreviousPage: goToPreviousPendentesPage,

    goToNextPage: goToNextPendentesPage,
  } = useSantaCasaPedidosPendentes();

  const {
    isSubmitting,
    isClearDialogOpen,
    feedback,
    setFeedback,

    handleRemoveItem,

    handleRequestClearDraft,
    handleCancelClearDraft,
    handleConfirmClearDraft,

    handleSubmitPedido,
  } = useSantaCasaPedidosActions({
    items,
    hasItems,

    removeItem,
    removeItemsByKeys,
    clearDraft,

    onPedidoCreated: refreshPendentes,
  });

  return (
    <section className={styles.page} aria-labelledby="santacasa-pedidos-title">
      <PageHeader
        titleId="santacasa-pedidos-title"
        eyebrow={PEDIDOS_PAGE.header.eyebrow}
        title={PEDIDOS_PAGE.header.title}
        description={PEDIDOS_PAGE.header.description}
      />

      <PedidoGeralList
        items={items}
        isSubmitting={isSubmitting}
        onRemoveItem={handleRemoveItem}
        onClearRequest={handleRequestClearDraft}
        onSubmit={handleSubmitPedido}
      />

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
        error={pendentesError}
        onSearchChange={updatePendentesSearchInput}
        onApplyFilters={applyPendentesFilters}
        onClearFilters={clearPendentesFilters}
        onRefresh={refreshPendentes}
        onPreviousPage={goToPreviousPendentesPage}
        onNextPage={goToNextPendentesPage}
      />

      <SantaCasaPedidosDialogs
        isClearDialogOpen={isClearDialogOpen}
        activeFeedback={feedback}
        onConfirmClearDraft={handleConfirmClearDraft}
        onCancelClearDraft={handleCancelClearDraft}
        onCloseFeedback={() => setFeedback(null)}
      />
    </section>
  );
}
