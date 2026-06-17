// src/features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralList.jsx

import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoGeralActionsBar from "./PedidoGeralActionsBar";
import PedidoGeralGroup from "./PedidoGeralGroup";

import {
  getItemsQuantityTotal,
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

  const totalQuantity = getItemsQuantityTotal(validItems);

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

          <PedidoGeralActionsBar
            totalUtentes={groups.length}
            totalItems={totalItems}
            totalQuantity={totalQuantity}
            isSubmitting={isSubmitting}
            onClearRequest={onClearRequest}
          />
        </form>
      )}
    </SurfaceCard>
  );
}
