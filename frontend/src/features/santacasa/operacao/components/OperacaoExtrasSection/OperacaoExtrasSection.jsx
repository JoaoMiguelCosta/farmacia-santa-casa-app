import ExtraCreateForm from "../../../extras/components/ExtraCreateForm/ExtraCreateForm";
import ExtrasList from "../../../extras/components/ExtrasList/ExtrasList";

import { OPERACAO_PAGE } from "../../config/operacaoPage.config";
import { useOperacaoContext } from "../../context/OperacaoContext";

import OperationSection from "../OperationSection/OperationSection";

export default function OperacaoExtrasSection({
  items,
  isCreating,
  deletingItemId,
  onCreateExtra,
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

  const section = OPERACAO_PAGE.sections.extras;

  return (
    <OperationSection
      id={section.id}
      tone={section.tone}
      eyebrow={section.eyebrow}
      title={section.title}
      description={section.description}
    >
      <ExtraCreateForm
        selectedUtenteId={selectedUtenteId}
        onCreate={onCreateExtra}
        isSubmitting={isCreating}
        medicacaoHabitualOptions={medicacaoHabitualOptions}
      />

      <ExtrasList
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
