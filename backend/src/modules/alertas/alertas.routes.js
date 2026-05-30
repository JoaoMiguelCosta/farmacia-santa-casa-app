const express = require("express");

const { asyncHandler } = require("../../shared/utils/asyncHandler");
const alertasController = require("./alertas.controller");

const router = express.Router();

router.get("/", asyncHandler(alertasController.listFarmaciaAlertas));

router.post(
  "/dismiss-all",
  asyncHandler(alertasController.dismissAllFarmaciaAlertas),
);

router.post(
  "/:alertaId/dismiss",
  asyncHandler(alertasController.dismissFarmaciaAlerta),
);

module.exports = router;
