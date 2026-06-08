// src/features/farmacia/pedidos/hooks/useFarmaciaPedidosPageActions.js
import { useCallback, useState } from "react";

import { getPedidoNumberLabel } from "../../shared/pedidos/utils/farmaciaPedido.utils";

import { FARMACIA_PEDIDOS_PAGE } from "../config/farmaciaPedidosPage.config";

export function useFarmaciaPedidosPageActions({
  validatingPedidoId,
  rejectingPedidoId,
  validatePedido,
  rejectPedido,
  clearActionError,
}) {
  const [pedidoToValidate, setPedidoToValidate] = useState(null);
  const [pedidoToReject, setPedidoToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [feedback, setFeedback] = useState(null);

  const isValidatingSelected = Boolean(
    pedidoToValidate?.id && validatingPedidoId === pedidoToValidate.id,
  );

  const isRejectingSelected = Boolean(
    pedidoToReject?.id && rejectingPedidoId === pedidoToReject.id,
  );

  const closeFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const openValidateDialog = useCallback(
    (pedido) => {
      clearActionError();
      setPedidoToValidate(pedido);
    },
    [clearActionError],
  );

  const closeValidateDialog = useCallback(() => {
    if (isValidatingSelected) return;

    setPedidoToValidate(null);
  }, [isValidatingSelected]);

  const openRejectDialog = useCallback(
    (pedido) => {
      clearActionError();
      setRejectReason("");
      setPedidoToReject(pedido);
    },
    [clearActionError],
  );

  const closeRejectDialog = useCallback(() => {
    if (isRejectingSelected) return;

    setPedidoToReject(null);
    setRejectReason("");
  }, [isRejectingSelected]);

  const changeRejectReason = useCallback((reason) => {
    setRejectReason(reason);
  }, []);

  const confirmValidate = useCallback(async () => {
    if (!pedidoToValidate?.id) return;

    const currentPedido = pedidoToValidate;
    const result = await validatePedido(currentPedido.id);

    setPedidoToValidate(null);

    if (result) {
      setFeedback({
        type: "success",
        title: FARMACIA_PEDIDOS_PAGE.validateDialog.successMessage,
        message: `${getPedidoNumberLabel(currentPedido)} ${
          FARMACIA_PEDIDOS_PAGE.feedback.validateSuccessDetail
        }`,
      });

      return;
    }

    setFeedback({
      type: "error",
      title: FARMACIA_PEDIDOS_PAGE.feedback.validateError,
      message: FARMACIA_PEDIDOS_PAGE.feedback.genericError,
    });
  }, [pedidoToValidate, validatePedido]);

  const confirmReject = useCallback(async () => {
    if (!pedidoToReject?.id) return;

    const currentPedido = pedidoToReject;
    const result = await rejectPedido(currentPedido.id, rejectReason);

    setPedidoToReject(null);
    setRejectReason("");

    if (result) {
      setFeedback({
        type: "success",
        title: FARMACIA_PEDIDOS_PAGE.rejectDialog.successMessage,
        message: `${getPedidoNumberLabel(currentPedido)} ${
          FARMACIA_PEDIDOS_PAGE.feedback.rejectSuccessDetail
        }`,
      });

      return;
    }

    setFeedback({
      type: "error",
      title: FARMACIA_PEDIDOS_PAGE.feedback.rejectError,
      message: FARMACIA_PEDIDOS_PAGE.feedback.genericError,
    });
  }, [pedidoToReject, rejectPedido, rejectReason]);

  return {
    pedidoToValidate,
    pedidoToReject,
    rejectReason,
    feedback,

    isValidatingSelected,
    isRejectingSelected,

    openValidateDialog,
    closeValidateDialog,
    openRejectDialog,
    closeRejectDialog,
    changeRejectReason,
    confirmValidate,
    confirmReject,
    closeFeedback,
  };
}
