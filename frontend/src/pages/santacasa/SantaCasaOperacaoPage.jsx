import { Link } from "react-router-dom";
import { useMemo } from "react";

import Button from "../../shared/ui/Button/Button";
import ConfirmDialog from "../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../shared/ui/FeedbackDialog/FeedbackDialog";
import PageHeader from "../../shared/ui/PageHeader/PageHeader";
import SurfaceCard from "../../shared/ui/SurfaceCard/SurfaceCard";

import SantaCasaSectionNav from "../../features/santacasa/shared/components/SantaCasaSectionNav/SantaCasaSectionNav";
import UtenteSelector from "../../features/santacasa/shared/components/UtenteSelector/UtenteSelector";

import ReceitaCreateForm from "../../features/santacasa/receitas/components/ReceitaCreateForm/ReceitaCreateForm";
import ReceitasList from "../../features/santacasa/receitas/components/ReceitasList/ReceitasList";

import SemReceitaCreateForm from "../../features/santacasa/sem-receita/components/SemReceitaCreateForm/SemReceitaCreateForm";
import SemReceitaList from "../../features/santacasa/sem-receita/components/SemReceitaList/SemReceitaList";

import ExtraCreateForm from "../../features/santacasa/extras/components/ExtraCreateForm/ExtraCreateForm";
import ExtrasList from "../../features/santacasa/extras/components/ExtrasList/ExtrasList";

import { usePedidoDraft } from "../../features/santacasa/pedidos/state/usePedidoDraft";

import OperationSection from "../../features/santacasa/operacao/components/OperationSection/OperationSection";
import { useSantaCasaOperacao } from "../../features/santacasa/operacao/hooks/useSantaCasaOperacao";
import { useSantaCasaOperacaoActions } from "../../features/santacasa/operacao/hooks/useSantaCasaOperacaoActions";

import {
  buildDraftQuantityMap,
  getDeletingId,
  getExtraPedidoKey,
  getExtraQuantidadeRestante,
  getQuantidadeDisponivelVisual,
  getReceitaPedidoKey,
  getSemReceitaPedidoKey,
} from "../../features/santacasa/operacao/utils/santaCasaOperacao.utils";

import styles from "./SantaCasaOperacaoPage.module.css";

export default function SantaCasaOperacaoPage() {
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
    <section className={styles.page} aria-labelledby="operacao-title">
      <PageHeader
        titleId="operacao-title"
        eyebrow="Santa Casa"
        title="Operação diária"
        description="Gere receitas, medicamentos sem receita e Extras. A partir daqui podes adicionar itens ao pedido geral para a Farmácia."
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={refreshOperationData}
            isLoading={isRefreshing}
            disabled={!selectedUtenteId || isRefreshing}
          >
            {isRefreshing ? "A atualizar..." : "Atualizar operação"}
          </Button>
        }
      />

      <SantaCasaSectionNav />

      <SurfaceCard
        eyebrow="Utente selecionado"
        title={selectedUtente?.nome || "Seleciona um utente"}
        description={
          selectedUtente
            ? `Número de utente: ${selectedUtente.numero9}`
            : "Escolhe um utente para carregar receitas, medicamentos sem receita e Extras."
        }
        tone="green"
      >
        <UtenteSelector
          utentes={utentes}
          value={selectedUtenteId}
          onChange={handleSelectOperationUtente}
          isLoading={isLoadingUtentes}
          error={utentesError}
        />

        {dataError ? (
          <p className={styles.error} role="alert">
            {dataError}
          </p>
        ) : null}

        {selectedUtente ? (
          <div
            className={styles.summary}
            aria-label="Resumo operacional"
            role="list"
          >
            <article role="listitem">
              <strong>{receitas.length}</strong>
              <span>Linhas de receita</span>
            </article>

            <article role="listitem">
              <strong>{semReceita.length}</strong>
              <span>Sem receita</span>
            </article>

            <article role="listitem">
              <strong>{extras.length}</strong>
              <span>Extras</span>
            </article>

            <article role="listitem">
              <strong>{pedidoDraftCount}</strong>
              <span>No pedido geral</span>
            </article>
          </div>
        ) : null}
      </SurfaceCard>

      <SurfaceCard
        eyebrow="Pedido geral"
        title="Itens selecionados para Farmácia"
        description="Os itens adicionados nesta página ficam guardados no pedido geral. Podes adicionar itens de vários utentes e enviar tudo pela página Pedidos."
        tone="gold"
      >
        <div className={styles.draftNotice}>
          <p>
            Existem <strong>{pedidoDraftCount}</strong>{" "}
            {pedidoDraftCount === 1 ? "item" : "itens"} no pedido geral.
          </p>

          <Link to="/santacasa/pedidos" className={styles.draftLink}>
            Ver pedido geral
          </Link>
        </div>
      </SurfaceCard>

      <div className={styles.sections}>
        <OperationSection
          id="operacao-receitas"
          eyebrow="Receitas"
          title="Receitas do utente"
          description="Cria receitas, seleciona linhas para o pedido geral ou remove linhas ainda removíveis."
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
          id="operacao-sem-receita"
          eyebrow="Sem Receita"
          title="Medicamentos sem receita"
          description="Adiciona medicamentos sem receita, seleciona para o pedido geral ou remove registos ainda removíveis."
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
          id="operacao-extras"
          eyebrow="Extras"
          title="Extras em aberto"
          description="Cria Extras, seleciona para o pedido geral ou remove Extras ainda removíveis."
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

      <ConfirmDialog
        isOpen={Boolean(regularizacaoConfirmation)}
        title={regularizacaoDialogData.title}
        description={regularizacaoDialogData.description}
        confirmLabel={regularizacaoDialogData.confirmLabel}
        cancelLabel={regularizacaoDialogData.cancelLabel}
        isLoading={isConfirmingRegularizacao}
        onConfirm={handleConfirmRegularizacaoConfirmation}
        onCancel={handleCancelRegularizacaoConfirmation}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteDialogData.title}
        description={deleteDialogData.description}
        confirmLabel={deleteDialogData.confirmLabel}
        cancelLabel={deleteDialogData.cancelLabel}
        isLoading={Boolean(deletingTargetKey)}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
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
