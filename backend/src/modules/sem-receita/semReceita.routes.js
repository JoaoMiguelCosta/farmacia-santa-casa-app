// src/modules/sem-receita/semReceita.routes.js
const { Router } = require("express");

const controller = require("./semReceita.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(controller.list));
router.post("/", asyncHandler(controller.create));
router.delete("/:semReceitaId", asyncHandler(controller.remove));

module.exports = router;
