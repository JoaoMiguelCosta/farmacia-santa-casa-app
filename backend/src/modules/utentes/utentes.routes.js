// src/modules/utentes/utentes.routes.js
const { Router } = require("express");

const controller = require("./utentes.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const router = Router();

router.get("/", asyncHandler(controller.list));
router.get("/:utenteId", asyncHandler(controller.getById));

router.post("/", asyncHandler(controller.create));

router.patch("/:utenteId/archive", asyncHandler(controller.archive));
router.patch("/:utenteId/reactivate", asyncHandler(controller.reactivate));

router.delete("/:utenteId", asyncHandler(controller.remove));

module.exports = router;
