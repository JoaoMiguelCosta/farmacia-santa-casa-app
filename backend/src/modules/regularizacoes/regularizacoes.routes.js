// src/modules/regularizacoes/regularizacoes.routes.js
const { Router } = require("express");

const controller = require("./regularizacoes.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const router = Router();

router.get("/pendentes", asyncHandler(controller.listPendentes));
router.get("/historico", asyncHandler(controller.listHistorico));
router.get("/sinal", asyncHandler(controller.getSignal));

module.exports = router;
