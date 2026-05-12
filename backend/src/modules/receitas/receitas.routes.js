// src/modules/receitas/receitas.routes.js
const { Router } = require("express");

const controller = require("./receitas.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(controller.list));
router.post("/", asyncHandler(controller.create));
router.delete("/linhas/:linhaId", asyncHandler(controller.removeLinha));

module.exports = router;
