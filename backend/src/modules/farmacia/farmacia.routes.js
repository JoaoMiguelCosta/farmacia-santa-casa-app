// src/modules/farmacia/farmacia.routes.js
const { Router } = require("express");

const controller = require("./farmacia.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const router = Router();

router.get("/dashboard/sinais", asyncHandler(controller.getDashboardSignals));

router.get("/pedidos", asyncHandler(controller.listPedidos));
router.get("/pedidos/:pedidoId", asyncHandler(controller.getPedidoById));
router.post(
  "/pedidos/:pedidoId/validar",
  asyncHandler(controller.validarPedido),
);
router.post(
  "/pedidos/:pedidoId/rejeitar",
  asyncHandler(controller.rejeitarPedido),
);

module.exports = router;
