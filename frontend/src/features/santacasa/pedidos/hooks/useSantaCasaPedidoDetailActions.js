// src/features/santacasa/pedidos/hooks/useSantaCasaPedidoDetailActions.js

import { useCallback, useState } from "react";

import { PEDIDOS_PAGE } from "../config/pedidosPage.config";

export function useSantaCasaPedidoDetailActions({
  isCanceling = false,
  cancelCurrentPedido,
}) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const [feedback, setFeedback] = useState(null);

  const openCancelDialog = useCallback(() => {
    setFeedback(null);
    setIsCancelDialogOpen(true);
  }, []);

  const closeCancelDialog = useCallback(() => {
    if (isCanceling) {
      return;
    }

    setIsCancelDialogOpen(false);
  }, [isCanceling]);

  const confirmCancelPedido = useCallback(async () => {
    const result = await cancelCurrentPedido?.(
      PEDIDOS_PAGE.cancelDialog.reason,
    );

    setIsCancelDialogOpen(false);

    if (result?.pedido) {
      setFeedback({
        type: "success",
        message: PEDIDOS_PAGE.feedback.cancelSuccess,
      });

      return;
    }

    if (result?.error) {
      setFeedback({
        type: "error",
        message: result.error,
      });
    }
  }, [cancelCurrentPedido]);

  const closeFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return {
    isCancelDialogOpen,
    feedback,

    openCancelDialog,
    closeCancelDialog,
    confirmCancelPedido,
    closeFeedback,
  };
}
