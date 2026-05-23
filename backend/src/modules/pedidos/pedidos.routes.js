// src/modules/pedidos/pedidos.routes.js
const { Router } = require("express");

const controller = require("./pedidos.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const router = Router();

router.post("/", asyncHandler(controller.create));

router.get("/historico", asyncHandler(controller.listHistorico));
router.get("/pendentes", asyncHandler(controller.listPendentes));

router.post("/:pedidoId/cancelar", asyncHandler(controller.cancel));

router.get("/:pedidoId", asyncHandler(controller.getById));

module.exports = router;
