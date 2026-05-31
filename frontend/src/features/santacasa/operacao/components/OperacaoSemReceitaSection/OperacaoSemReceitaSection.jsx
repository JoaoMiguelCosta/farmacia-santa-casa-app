// src/features/santacasa/operacao/components/OperacaoSemReceitaSection/OperacaoSemReceitaSection.jsx
import SemReceitaCreateForm from "../../../sem-receita/components/SemReceitaCreateForm/SemReceitaCreateForm";
import SemReceitaList from "../../../sem-receita/components/SemReceitaList/SemReceitaList";

import { OPERACAO_PAGE } from "../../config/operacaoPage.config";

import OperationSection from "../OperationSection/OperationSection";

export default function OperacaoSemReceitaSection({
  selectedUtenteId,
  selectedUtente,

  items,
  isLoading,
  error,

  isCreating,
  medicacaoHabitualOptions,

  deletingItemId,
  pedidoQuantities,
  pedidoItemsQuantities,

  onCreateSemReceita,
  onPedidoQuantityChange,
  onAddToPedido,
  onRetry,
  onBlockedDelete,
  onRequestDelete,
}) {
  const section = OPERACAO_PAGE.sections.semReceita;

  return (
    <OperationSection
      id={section.id}
      eyebrow={section.eyebrow}
      title={section.title}
      description={section.description}
    >
      <SemReceitaCreateForm
        selectedUtenteId={selectedUtenteId}
        onCreate={onCreateSemReceita}
        isSubmitting={isCreating}
        medicacaoHabitualOptions={medicacaoHabitualOptions}
      />

      <SemReceitaList
        items={items}
        selectedUtenteId={selectedUtenteId}
        selectedUtente={selectedUtente}
        isLoading={isLoading}
        error={error}
        deletingItemId={deletingItemId}
        pedidoQuantities={pedidoQuantities}
        pedidoItemsQuantities={pedidoItemsQuantities}
        onPedidoQuantityChange={onPedidoQuantityChange}
        onAddToPedido={onAddToPedido}
        onRetry={onRetry}
        onBlockedDelete={onBlockedDelete}
        onDelete={onRequestDelete}
      />
    </OperationSection>
  );
}
