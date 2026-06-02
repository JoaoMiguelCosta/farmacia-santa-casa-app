// src/features/santacasa/operacao/components/OperacaoPageContent/OperacaoPageContent.jsx
import Button from "../../../../../shared/ui/Button/Button";
import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import { useMedicacaoHabitual } from "../../../medicacao-habitual/hooks/useMedicacaoHabitual";
import { usePedidoDraft } from "../../../pedidos/state/usePedidoDraft";

import OperacaoDialogs from "../OperacaoDialogs/OperacaoDialogs";
import OperacaoExtrasSection from "../OperacaoExtrasSection/OperacaoExtrasSection";
import OperacaoMedicacaoHabitualSection from "../OperacaoMedicacaoHabitualSection/OperacaoMedicacaoHabitualSection";
import OperacaoReceitasSection from "../OperacaoReceitasSection/OperacaoReceitasSection";
import OperacaoSelectedUtenteCard from "../OperacaoSelectedUtenteCard/OperacaoSelectedUtenteCard";
import OperacaoSemReceitaSection from "../OperacaoSemReceitaSection/OperacaoSemReceitaSection";

import { OPERACAO_PAGE } from "../../config/operacaoPage.config";

import { useSantaCasaOperacao } from "../../hooks/useSantaCasaOperacao";
import { useSantaCasaOperacaoActions } from "../../hooks/useSantaCasaOperacaoActions";

import { getDeletingId } from "../../utils/santaCasaOperacao.utils";

import { useOperacaoVisibleItems } from "./useOperacaoVisibleItems";

import styles from "./OperacaoPageContent.module.css";

export default function OperacaoPageContent() {
  const {
    utentes,
    selectedUtenteId,
    selectedUtente,

    receitas,
    semReceita,
    extras,

    isLoadingUtentes,
    isLoadingData,
    isRefreshing,

    utentesError,
    dataError,

    handleSelectUtente,
    refreshOperationData,
  } = useSantaCasaOperacao();

  const medicacaoHabitualController = useMedicacaoHabitual({
    selectedUtenteId,
  });

  const medicacaoHabitualOptions = medicacaoHabitualController.options || [];

  const {
    items: pedidoDraftItems,
    addItem: addPedidoDraftItem,
    removeItemsByKeys,
  } = usePedidoDraft();

  const {
    pedidoItemsQuantities,
    visibleReceitas,
    visibleSemReceita,
    visibleExtras,
  } = useOperacaoVisibleItems({
    receitas,
    semReceita,
    extras,
    pedidoDraftItems,
  });

  const {
    pedidoQuantities,
    deleteTarget,
    deleteDialogData,
    deletingTargetKey,

    regularizacaoConfirmation,
    regularizacaoDialogData,
    receitaFormResetKey,

    isCreatingReceita,
    isConfirmingRegularizacao,
    isCreatingSemReceita,
    isCreatingExtra,

    feedback,
    setFeedback,

    handleSelectOperationUtente,
    handlePedidoQuantityInputChange,

    handleCreateReceita,
    handleCreateSemReceita,
    handleCreateExtra,

    handleCancelRegularizacaoConfirmation,
    handleConfirmRegularizacaoConfirmation,

    handleAddPedidoItem,
    handleBlockedDelete,

    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,

    handleAfterReceitaQuantityBackToList,
  } = useSantaCasaOperacaoActions({
    selectedUtenteId,
    selectedUtente,
    extras,
    pedidoDraftItems,
    addPedidoDraftItem,
    removeItemsByKeys,
    refreshOperationData,
    handleSelectUtente,
  });

  const isReceitaBusy = isCreatingReceita || isConfirmingRegularizacao;

  const isPageRefreshing =
    isRefreshing || medicacaoHabitualController.isRefreshing;

  async function handleRefreshPage() {
    await Promise.all([
      refreshOperationData(),
      medicacaoHabitualController.refreshMedicacaoHabitual(),
    ]);
  }

  function handleCloseFeedback() {
    setFeedback(null);
  }

  return (
    <section
      className={styles.page}
      aria-labelledby={OPERACAO_PAGE.page.titleId}
    >
      <PageHeader
        titleId={OPERACAO_PAGE.page.titleId}
        eyebrow={OPERACAO_PAGE.header.eyebrow}
        title={OPERACAO_PAGE.header.title}
        description={OPERACAO_PAGE.header.description}
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={handleRefreshPage}
            isLoading={isPageRefreshing}
            disabled={!selectedUtenteId || isPageRefreshing}
          >
            {isPageRefreshing
              ? OPERACAO_PAGE.header.refreshingLabel
              : OPERACAO_PAGE.header.refreshLabel}
          </Button>
        }
      />

      <OperacaoSelectedUtenteCard
        utentes={utentes}
        selectedUtenteId={selectedUtenteId}
        selectedUtente={selectedUtente}
        isLoadingUtentes={isLoadingUtentes}
        utentesError={utentesError}
        dataError={dataError}
        onSelectUtente={handleSelectOperationUtente}
      />

      <div className={styles.sections}>
        <OperacaoMedicacaoHabitualSection
          selectedUtenteId={selectedUtenteId}
          selectedUtente={selectedUtente}
          medicacaoHabitualController={medicacaoHabitualController}
        />

        <OperacaoReceitasSection
          selectedUtenteId={selectedUtenteId}
          selectedUtente={selectedUtente}
          receitas={visibleReceitas}
          isLoading={isLoadingData}
          error={dataError}
          isReceitaBusy={isReceitaBusy}
          receitaFormResetKey={receitaFormResetKey}
          medicacaoHabitualOptions={medicacaoHabitualOptions}
          deletingLinhaId={getDeletingId(deletingTargetKey, "receita")}
          pedidoQuantities={pedidoQuantities}
          pedidoItemsQuantities={pedidoItemsQuantities}
          onCreateReceita={handleCreateReceita}
          onPedidoQuantityChange={handlePedidoQuantityInputChange}
          onAddToPedido={handleAddPedidoItem}
          onRetry={refreshOperationData}
          onBlockedDelete={handleBlockedDelete}
          onRequestDelete={(linha) => handleRequestDelete("receita", linha)}
          onQuantityBackToList={handleAfterReceitaQuantityBackToList}
        />

        <OperacaoSemReceitaSection
          selectedUtenteId={selectedUtenteId}
          selectedUtente={selectedUtente}
          items={visibleSemReceita}
          isLoading={isLoadingData}
          error={dataError}
          isCreating={isCreatingSemReceita}
          medicacaoHabitualOptions={medicacaoHabitualOptions}
          deletingItemId={getDeletingId(deletingTargetKey, "semReceita")}
          pedidoQuantities={pedidoQuantities}
          pedidoItemsQuantities={pedidoItemsQuantities}
          onCreateSemReceita={handleCreateSemReceita}
          onPedidoQuantityChange={handlePedidoQuantityInputChange}
          onAddToPedido={handleAddPedidoItem}
          onRetry={refreshOperationData}
          onBlockedDelete={handleBlockedDelete}
          onRequestDelete={(item) => handleRequestDelete("semReceita", item)}
        />

        <OperacaoExtrasSection
          selectedUtenteId={selectedUtenteId}
          selectedUtente={selectedUtente}
          items={visibleExtras}
          isLoading={isLoadingData}
          error={dataError}
          isCreating={isCreatingExtra}
          medicacaoHabitualOptions={medicacaoHabitualOptions}
          deletingItemId={getDeletingId(deletingTargetKey, "extra")}
          pedidoQuantities={pedidoQuantities}
          pedidoItemsQuantities={pedidoItemsQuantities}
          onCreateExtra={handleCreateExtra}
          onPedidoQuantityChange={handlePedidoQuantityInputChange}
          onAddToPedido={handleAddPedidoItem}
          onRetry={refreshOperationData}
          onBlockedDelete={handleBlockedDelete}
          onRequestDelete={(item) => handleRequestDelete("extra", item)}
        />
      </div>

      <OperacaoDialogs
        regularizacaoConfirmation={regularizacaoConfirmation}
        regularizacaoDialogData={regularizacaoDialogData}
        isConfirmingRegularizacao={isConfirmingRegularizacao}
        deleteTarget={deleteTarget}
        deleteDialogData={deleteDialogData}
        deletingTargetKey={deletingTargetKey}
        feedback={feedback}
        onConfirmRegularizacao={handleConfirmRegularizacaoConfirmation}
        onCancelRegularizacao={handleCancelRegularizacaoConfirmation}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
        onCloseFeedback={handleCloseFeedback}
      />
    </section>
  );
}
