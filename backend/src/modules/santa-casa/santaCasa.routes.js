const { Router } = require("express");

const controller = require("./santaCasa.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const router = Router();

router.get("/dashboard/sinais", asyncHandler(controller.getDashboardSignals));

module.exports = router;
