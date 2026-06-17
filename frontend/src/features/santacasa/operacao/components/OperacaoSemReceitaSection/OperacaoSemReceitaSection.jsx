import SemReceitaCreateForm from "../../../semReceita/components/SemReceitaCreateForm/SemReceitaCreateForm";
import SemReceitaList from "../../../semReceita/components/SemReceitaList/SemReceitaList";

import { OPERACAO_PAGE } from "../../config/operacaoPage.config";
import { useOperacaoContext } from "../../context/OperacaoContext";

import OperationSection from "../OperationSection/OperationSection";

export default function OperacaoSemReceitaSection({
  items,
  isCreating,
  deletingItemId,
  onCreateSemReceita,
  onRequestDelete,
}) {
  const {
    selectedUtenteId,
    selectedUtente,
    isLoading,
    error,
    medicacaoHabitualOptions,
    pedidoQuantities,
    pedidoItemsQuantities,
    onPedidoQuantityChange,
    onAddToPedido,
    onRetry,
    onBlockedDelete,
  } = useOperacaoContext();

  const section = OPERACAO_PAGE.sections.semReceita;

  return (
    <OperationSection
      id={section.id}
      tone={section.tone}
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
