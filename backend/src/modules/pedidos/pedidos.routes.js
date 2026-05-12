// src/modules/pedidos/pedidos.routes.js
const { Router } = require("express");

const controller = require("./pedidos.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const router = Router();

router.post("/", asyncHandler(controller.create));

// IMPORTANTE: histórico antes de "/:pedidoId"
router.get("/historico", asyncHandler(controller.listHistorico));

router.get("/:pedidoId", asyncHandler(controller.getById));

module.exports = router;
