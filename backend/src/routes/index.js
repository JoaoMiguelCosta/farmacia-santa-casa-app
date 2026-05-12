// src/routes/index.js
const { Router } = require("express");

const santacasaRoutes = require("./santacasa.routes");
const farmaciaRoutes = require("./farmacia.routes");

const router = Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "farmacia-santacasa-api",
    timestamp: new Date().toISOString(),
  });
});

router.use("/santacasa", santacasaRoutes);
router.use("/farmacia", farmaciaRoutes);

module.exports = router;
