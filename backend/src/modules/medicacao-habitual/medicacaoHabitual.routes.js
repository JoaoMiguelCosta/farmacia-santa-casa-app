const { Router } = require("express");

const controller = require("./medicacaoHabitual.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(controller.list));
router.post("/", asyncHandler(controller.create));

router.delete("/", asyncHandler(controller.clear));
router.delete("/:medicacaoId", asyncHandler(controller.remove));

module.exports = router;
