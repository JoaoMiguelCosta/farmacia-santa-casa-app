// src/features/santacasa/operacao/components/OperacaoPageContent/OperacaoPageContent.jsx
import Button from "../../../../../shared/ui/Button/Button";
import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import { useMedicacaoHabitual } from "../../../medicacaoHabitual/hooks/useMedicacaoHabitual";
import { usePedidoDraft } from "../../../pedidos/state/usePedidoDraft";

import { OperacaoContext } from "../../context/OperacaoContext";

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

import { useOperacaoVisibleItems } from "../../hooks/useOperacaoVisibleItems";

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

      <OperacaoContext.Provider
        value={{
          selectedUtenteId,
          selectedUtente,
          isLoading: isLoadingData,
          error: dataError,
          medicacaoHabitualOptions,
          pedidoQuantities,
          pedidoItemsQuantities,
          onPedidoQuantityChange: handlePedidoQuantityInputChange,
          onAddToPedido: handleAddPedidoItem,
          onRetry: refreshOperationData,
          onBlockedDelete: handleBlockedDelete,
        }}
      >
        <div className={styles.sections}>
          <OperacaoMedicacaoHabitualSection
            selectedUtenteId={selectedUtenteId}
            selectedUtente={selectedUtente}
            medicacaoHabitualController={medicacaoHabitualController}
          />

          <OperacaoReceitasSection
            receitas={visibleReceitas}
            isReceitaBusy={isReceitaBusy}
            receitaFormResetKey={receitaFormResetKey}
            deletingLinhaId={getDeletingId(deletingTargetKey, "receita")}
            onCreateReceita={handleCreateReceita}
            onRequestDelete={(linha) => handleRequestDelete("receita", linha)}
            onQuantityBackToList={handleAfterReceitaQuantityBackToList}
          />

          <OperacaoSemReceitaSection
            items={visibleSemReceita}
            isCreating={isCreatingSemReceita}
            deletingItemId={getDeletingId(deletingTargetKey, "semReceita")}
            onCreateSemReceita={handleCreateSemReceita}
            onRequestDelete={(item) => handleRequestDelete("semReceita", item)}
          />

          <OperacaoExtrasSection
            items={visibleExtras}
            isCreating={isCreatingExtra}
            deletingItemId={getDeletingId(deletingTargetKey, "extra")}
            onCreateExtra={handleCreateExtra}
            onRequestDelete={(item) => handleRequestDelete("extra", item)}
          />
        </div>
      </OperacaoContext.Provider>

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
