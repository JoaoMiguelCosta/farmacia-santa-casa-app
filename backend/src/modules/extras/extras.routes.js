// src/modules/extras/extras.routes.js
const { Router } = require("express");

const controller = require("./extras.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(controller.list));
router.post("/", asyncHandler(controller.create));
router.delete("/:extraId", asyncHandler(controller.remove));

module.exports = router;
