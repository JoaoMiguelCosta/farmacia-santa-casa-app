// src/routes/index.js
const { Router } = require("express");

const authRoutes = require("./auth.routes");
const santacasaRoutes = require("./santacasa.routes");
const farmaciaRoutes = require("./farmacia.routes");
const manutencaoRoutes = require("./manutencao.routes");
const adminRoutes = require("./admin.routes");

const { requireAuth, requireRole } = require("../middlewares/authMiddleware");

const router = Router();

router.get("/health", requireAuth, requireRole(["ADMIN"]), (_req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "farmacia-santacasa-api",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);

router.use(
  "/santacasa",
  requireAuth,
  requireRole(["SANTACASA", "ADMIN"]),
  santacasaRoutes,
);

router.use(
  "/farmacia",
  requireAuth,
  requireRole(["FARMACIA", "ADMIN"]),
  farmaciaRoutes,
);

router.use(
  "/manutencao",
  requireAuth,
  requireRole(["ADMIN"]),
  manutencaoRoutes,
);

router.use("/admin", requireAuth, requireRole(["ADMIN"]), adminRoutes);

module.exports = router;
