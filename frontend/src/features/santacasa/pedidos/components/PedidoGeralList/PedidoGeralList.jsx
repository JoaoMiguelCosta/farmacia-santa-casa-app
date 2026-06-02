// src/features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralList.jsx
import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoGeralGroup from "./PedidoGeralGroup";

import {
  getValidPedidoGeralItems,
  groupByUtente,
} from "./pedidoGeralList.utils";

import styles from "./PedidoGeralList.module.css";

export default function PedidoGeralList({
  items = [],
  isSubmitting = false,
  onRemoveItem,
  onClearRequest,
  onSubmit,
}) {
  const validItems = getValidPedidoGeralItems(items);
  const groups = groupByUtente(validItems);
  const totalItems = validItems.length;

  return (
    <SurfaceCard
      title={PEDIDOS_PAGE.sections.draft.title}
      description={PEDIDOS_PAGE.sections.draft.description}
      tone="gold"
    >
      {totalItems === 0 ? (
        <DataState
          type="empty"
          title={PEDIDOS_PAGE.sections.draft.emptyTitle}
          description={PEDIDOS_PAGE.sections.draft.emptyDescription}
        />
      ) : (
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.groups}>
            {groups.map((group) => (
              <PedidoGeralGroup
                key={group.utenteId}
                group={group}
                defaultOpen={false}
                isSubmitting={isSubmitting}
                onRemoveItem={onRemoveItem}
              />
            ))}
          </div>

          <footer className={styles.actions}>
            <Button
              type="button"
              variant="danger"
              disabled={isSubmitting}
              onClick={onClearRequest}
            >
              {PEDIDOS_PAGE.actions.clearDraftGeneral}
            </Button>

            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? PEDIDOS_PAGE.sections.draft.submittingLabel
                : PEDIDOS_PAGE.sections.draft.submitLabel}
            </Button>
          </footer>
        </form>
      )}
    </SurfaceCard>
  );
}
