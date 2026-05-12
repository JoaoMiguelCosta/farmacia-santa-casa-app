// src/modules/manutencao/manutencao.routes.js
const { Router } = require("express");

const controller = require("./manutencao.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");
const { assertMaintenanceKey } = require("./manutencao.validators");

const router = Router();

router.use((req, _res, next) => {
  assertMaintenanceKey(req);
  next();
});

router.get("/jobs", asyncHandler(controller.listJobs));

router.get(
  "/jobs/receita-expiry/preview",
  asyncHandler(controller.previewReceitaExpiry),
);

router.post(
  "/jobs/receita-expiry/run",
  asyncHandler(controller.runReceitaExpiry),
);

router.get("/jobs/higiene/preview", asyncHandler(controller.previewHigiene));
router.post("/jobs/higiene/run", asyncHandler(controller.runHigiene));

router.get(
  "/jobs/purge-history/preview",
  asyncHandler(controller.previewPurgeHistory),
);

router.post(
  "/jobs/purge-history/run",
  asyncHandler(controller.runPurgeHistory),
);

module.exports = router;
