// src/routes/santacasa.routes.js
const { Router } = require("express");

const utentesRoutes = require("../modules/utentes/utentes.routes");
const semReceitaRoutes = require("../modules/sem-receita/semReceita.routes");
const receitasRoutes = require("../modules/receitas/receitas.routes");
const extrasRoutes = require("../modules/extras/extras.routes");
const pedidosRoutes = require("../modules/pedidos/pedidos.routes");

const router = Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    context: "santacasa",
  });
});

router.use("/pedidos", pedidosRoutes);

router.use("/utentes/:utenteId/receitas", receitasRoutes);
router.use("/utentes/:utenteId/sem-receita", semReceitaRoutes);
router.use("/utentes/:utenteId/extras", extrasRoutes);
router.use("/utentes", utentesRoutes);

module.exports = router;
