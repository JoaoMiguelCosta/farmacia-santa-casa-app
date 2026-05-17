// src/routes/farmacia.routes.js
const { Router } = require("express");

const farmaciaRoutes = require("../modules/farmacia/farmacia.routes");
const regularizacoesRoutes = require("../modules/regularizacoes/regularizacoes.routes");

const router = Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    context: "farmacia",
  });
});

router.use("/regularizacoes", regularizacoesRoutes);
router.use("/", farmaciaRoutes);

module.exports = router;
