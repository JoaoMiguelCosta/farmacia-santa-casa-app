import { formatDateTime } from "../../../../../../../shared/utils/formatDate";

import {
  getExpiredMedicamentosCountLabel,
  getMedicamentosCountLabel,
  getPedidoExpirationWarningsCount,
  getPedidoMedicamentosCount,
  getPedidoNumberLabel,
  getPedidoPendingMedicamentosCount,
  getPedidoPendingQuantity,
  getPedidoStatusLabel,
  getPedidoTotalQuantity,
  getPedidoUtentesCount,
  getUnidadesCountLabel,
  getUtentesCountLabel,
  hasPedidoExpirationWarnings,
} from "../../pedidoPendingList.utils";

export function usePedidoPendingCard(pedido) {
  const utentesCount = getPedidoUtentesCount(pedido);

  const medicamentosCount = getPedidoMedicamentosCount(pedido);

  const pendingMedicamentosCount = getPedidoPendingMedicamentosCount(pedido);

  const totalQuantity = getPedidoTotalQuantity(pedido);

  const pendingQuantity = getPedidoPendingQuantity(pedido);

  const expirationWarningsCount = getPedidoExpirationWarningsCount(pedido);

  return {
    hasExpirationWarning: hasPedidoExpirationWarnings(pedido),

    pedidoNumberLabel: getPedidoNumberLabel(pedido),

    pedidoStatusLabel: getPedidoStatusLabel(pedido),

    createdAtLabel: formatDateTime(pedido?.createdAt),

    utentesCountLabel: getUtentesCountLabel(utentesCount),

    medicamentosCountLabel: getMedicamentosCountLabel(medicamentosCount),

    pendingMedicamentosCountLabel: getMedicamentosCountLabel(
      pendingMedicamentosCount,
    ),

    canceledMedicamentosCountLabel: getMedicamentosCountLabel(
      expirationWarningsCount,
    ),

    totalQuantityLabel: getUnidadesCountLabel(totalQuantity),

    pendingQuantityLabel: getUnidadesCountLabel(pendingQuantity),

    expirationWarningsLabel: getExpiredMedicamentosCountLabel(
      expirationWarningsCount,
    ),
  };
}
