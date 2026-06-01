// src/features/santacasa/operacao/components/OperacaoReceitasSection/OperacaoReceitasSection.jsx
import ReceitaCreateForm from "../../../receitas/components/ReceitaCreateForm/ReceitaCreateForm";
import ReceitasList from "../../../receitas/components/ReceitasList/ReceitasList";

import { OPERACAO_PAGE } from "../../config/operacaoPage.config";

import OperationSection from "../OperationSection/OperationSection";

export default function OperacaoReceitasSection({
  selectedUtenteId,
  selectedUtente,

  receitas,
  isLoading,
  error,

  isReceitaBusy,
  receitaFormResetKey,
  medicacaoHabitualOptions,

  deletingLinhaId,
  pedidoQuantities,
  pedidoItemsQuantities,

  onCreateReceita,
  onPedidoQuantityChange,
  onAddToPedido,
  onRetry,
  onBlockedDelete,
  onRequestDelete,
  onQuantityBackToList,
}) {
  const section = OPERACAO_PAGE.sections.receitas;

  return (
    <OperationSection
      id={section.id}
      tone={section.tone}
      eyebrow={section.eyebrow}
      title={section.title}
      description={section.description}
    >
      <ReceitaCreateForm
        selectedUtenteId={selectedUtenteId}
        onCreate={onCreateReceita}
        isSubmitting={isReceitaBusy}
        resetKey={receitaFormResetKey}
        medicacaoHabitualOptions={medicacaoHabitualOptions}
      />

      <ReceitasList
        receitas={receitas}
        selectedUtenteId={selectedUtenteId}
        selectedUtente={selectedUtente}
        isLoading={isLoading}
        error={error}
        deletingLinhaId={deletingLinhaId}
        pedidoQuantities={pedidoQuantities}
        pedidoItemsQuantities={pedidoItemsQuantities}
        onPedidoQuantityChange={onPedidoQuantityChange}
        onAddToPedido={onAddToPedido}
        onRetry={onRetry}
        onBlockedDelete={onBlockedDelete}
        onDelete={onRequestDelete}
        onQuantityBackToList={onQuantityBackToList}
      />
    </OperationSection>
  );
}
