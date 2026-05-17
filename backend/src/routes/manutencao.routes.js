// src/routes/manutencao.routes.js
const { Router } = require("express");

const manutencaoRoutes = require("../modules/manutencao/manutencao.routes");

const router = Router();

router.use("/", manutencaoRoutes);

module.exports = router;
