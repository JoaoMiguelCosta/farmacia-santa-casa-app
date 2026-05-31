// src/features/santacasa/operacao/components/OperacaoPageContent/OperacaoPageContent.jsx
import { useMemo } from "react";

import Button from "../../../../../shared/ui/Button/Button";
import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import ReceitaCreateForm from "../../../receitas/components/ReceitaCreateForm/ReceitaCreateForm";
import ReceitasList from "../../../receitas/components/ReceitasList/ReceitasList";

import SemReceitaCreateForm from "../../../sem-receita/components/SemReceitaCreateForm/SemReceitaCreateForm";
import SemReceitaList from "../../../sem-receita/components/SemReceitaList/SemReceitaList";

import ExtraCreateForm from "../../../extras/components/ExtraCreateForm/ExtraCreateForm";
import ExtrasList from "../../../extras/components/ExtrasList/ExtrasList";

import { usePedidoDraft } from "../../../pedidos/state/usePedidoDraft";

import OperacaoDialogs from "../OperacaoDialogs/OperacaoDialogs";
import OperacaoDraftNotice from "../OperacaoDraftNotice/OperacaoDraftNotice";
import OperacaoSelectedUtenteCard from "../OperacaoSelectedUtenteCard/OperacaoSelectedUtenteCard";
import OperationSection from "../OperationSection/OperationSection";

import { OPERACAO_PAGE } from "../../config/operacaoPage.config";

import { useSantaCasaOperacao } from "../../hooks/useSantaCasaOperacao";
import { useSantaCasaOperacaoActions } from "../../hooks/useSantaCasaOperacaoActions";

import {
  buildDraftQuantityMap,
  getDeletingId,
  getExtraPedidoKey,
  getExtraQuantidadeRestante,
  getQuantidadeDisponivelVisual,
  getReceitaPedidoKey,
  getSemReceitaPedidoKey,
} from "../../utils/santaCasaOperacao.utils";

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

  const {
    items: pedidoDraftItems,
    count: pedidoDraftCount,
    addItem: addPedidoDraftItem,
    removeItemsByKeys,
  } = usePedidoDraft();

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

  const pedidoItemsQuantities = useMemo(
    () => buildDraftQuantityMap(pedidoDraftItems),
    [pedidoDraftItems],
  );

  const visibleReceitas = useMemo(
    () =>
      receitas.filter((linha) => {
        const pedidoKey = getReceitaPedidoKey(linha);

        return (
          getQuantidadeDisponivelVisual(
            linha.quantidadeRestante,
            pedidoKey,
            pedidoItemsQuantities,
          ) > 0
        );
      }),
    [receitas, pedidoItemsQuantities],
  );

  const visibleSemReceita = useMemo(
    () =>
      semReceita.filter((item) => {
        const pedidoKey = getSemReceitaPedidoKey(item);

        return (
          getQuantidadeDisponivelVisual(
            item.quantidadeRestante,
            pedidoKey,
            pedidoItemsQuantities,
          ) > 0
        );
      }),
    [semReceita, pedidoItemsQuantities],
  );

  const visibleExtras = useMemo(
    () =>
      extras.filter((item) => {
        const pedidoKey = getExtraPedidoKey(item);

        return (
          getQuantidadeDisponivelVisual(
            getExtraQuantidadeRestante(item),
            pedidoKey,
            pedidoItemsQuantities,
          ) > 0
        );
      }),
    [extras, pedidoItemsQuantities],
  );

  const isReceitaBusy = isCreatingReceita || isConfirmingRegularizacao;

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
            onClick={refreshOperationData}
            isLoading={isRefreshing}
            disabled={!selectedUtenteId || isRefreshing}
          >
            {isRefreshing
              ? OPERACAO_PAGE.header.refreshingLabel
              : OPERACAO_PAGE.header.refreshLabel}
          </Button>
        }
      />

      <OperacaoSelectedUtenteCard
        utentes={utentes}
        selectedUtenteId={selectedUtenteId}
        selectedUtente={selectedUtente}
        receitasCount={receitas.length}
        semReceitaCount={semReceita.length}
        extrasCount={extras.length}
        pedidoDraftCount={pedidoDraftCount}
        isLoadingUtentes={isLoadingUtentes}
        utentesError={utentesError}
        dataError={dataError}
        onSelectUtente={handleSelectOperationUtente}
      />

      <OperacaoDraftNotice pedidoDraftCount={pedidoDraftCount} />

      <div className={styles.sections}>
        <OperationSection
          id={OPERACAO_PAGE.sections.receitas.id}
          eyebrow={OPERACAO_PAGE.sections.receitas.eyebrow}
          title={OPERACAO_PAGE.sections.receitas.title}
          description={OPERACAO_PAGE.sections.receitas.description}
        >
          <ReceitaCreateForm
            selectedUtenteId={selectedUtenteId}
            onCreate={handleCreateReceita}
            isSubmitting={isReceitaBusy}
            resetKey={receitaFormResetKey}
          />

          <ReceitasList
            receitas={visibleReceitas}
            selectedUtenteId={selectedUtenteId}
            selectedUtente={selectedUtente}
            isLoading={isLoadingData}
            error={dataError}
            deletingLinhaId={getDeletingId(deletingTargetKey, "receita")}
            pedidoQuantities={pedidoQuantities}
            pedidoItemsQuantities={pedidoItemsQuantities}
            onPedidoQuantityChange={handlePedidoQuantityInputChange}
            onAddToPedido={handleAddPedidoItem}
            onRetry={refreshOperationData}
            onBlockedDelete={handleBlockedDelete}
            onDelete={(linha) => handleRequestDelete("receita", linha)}
            onQuantityBackToList={handleAfterReceitaQuantityBackToList}
          />
        </OperationSection>

        <OperationSection
          id={OPERACAO_PAGE.sections.semReceita.id}
          eyebrow={OPERACAO_PAGE.sections.semReceita.eyebrow}
          title={OPERACAO_PAGE.sections.semReceita.title}
          description={OPERACAO_PAGE.sections.semReceita.description}
        >
          <SemReceitaCreateForm
            selectedUtenteId={selectedUtenteId}
            onCreate={handleCreateSemReceita}
            isSubmitting={isCreatingSemReceita}
          />

          <SemReceitaList
            items={visibleSemReceita}
            selectedUtenteId={selectedUtenteId}
            selectedUtente={selectedUtente}
            isLoading={isLoadingData}
            error={dataError}
            deletingItemId={getDeletingId(deletingTargetKey, "semReceita")}
            pedidoQuantities={pedidoQuantities}
            pedidoItemsQuantities={pedidoItemsQuantities}
            onPedidoQuantityChange={handlePedidoQuantityInputChange}
            onAddToPedido={handleAddPedidoItem}
            onRetry={refreshOperationData}
            onBlockedDelete={handleBlockedDelete}
            onDelete={(item) => handleRequestDelete("semReceita", item)}
          />
        </OperationSection>

        <OperationSection
          id={OPERACAO_PAGE.sections.extras.id}
          eyebrow={OPERACAO_PAGE.sections.extras.eyebrow}
          title={OPERACAO_PAGE.sections.extras.title}
          description={OPERACAO_PAGE.sections.extras.description}
        >
          <ExtraCreateForm
            selectedUtenteId={selectedUtenteId}
            onCreate={handleCreateExtra}
            isSubmitting={isCreatingExtra}
          />

          <ExtrasList
            items={visibleExtras}
            selectedUtenteId={selectedUtenteId}
            selectedUtente={selectedUtente}
            isLoading={isLoadingData}
            error={dataError}
            deletingItemId={getDeletingId(deletingTargetKey, "extra")}
            pedidoQuantities={pedidoQuantities}
            pedidoItemsQuantities={pedidoItemsQuantities}
            onPedidoQuantityChange={handlePedidoQuantityInputChange}
            onAddToPedido={handleAddPedidoItem}
            onRetry={refreshOperationData}
            onBlockedDelete={handleBlockedDelete}
            onDelete={(item) => handleRequestDelete("extra", item)}
          />
        </OperationSection>
      </div>

      <OperacaoDialogs
        regularizacaoConfirmation={regularizacaoConfirmation}
        regularizacaoDialogData={regularizacaoDialogData}
        isConfirmingRegularizacao={isConfirmingRegularizacao}
        deleteTarget={deleteTarget}
        deleteDialogData={deleteDialogData}
        deletingTargetKey={deletingTargetKey}
        feedback={feedback}
        setFeedback={setFeedback}
        onConfirmRegularizacao={handleConfirmRegularizacaoConfirmation}
        onCancelRegularizacao={handleCancelRegularizacaoConfirmation}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
      />
    </section>
  );
}
