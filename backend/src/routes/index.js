// src/routes/index.js
const { Router } = require("express");

const authRoutes = require("./auth.routes");
const santacasaRoutes = require("./santacasa.routes");
const farmaciaRoutes = require("./farmacia.routes");
const manutencaoRoutes = require("./manutencao.routes");
const adminRoutes = require("./admin.routes");

const { prisma } = require("../db/prisma");
const { requireAuth, requireRole } = require("../middlewares/authMiddleware");

const SERVICE_NAME = "farmacia-santacasa-api";

const router = Router();

function getHealthPayload(extra = {}) {
  return {
    status: "ok",
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

router.get("/health/live", (_req, res) => {
  return res.status(200).json(
    getHealthPayload({
      check: "live",
    }),
  );
});

router.get("/health/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json(
      getHealthPayload({
        check: "ready",
        database: "ok",
      }),
    );
  } catch {
    return res.status(503).json({
      status: "error",
      service: SERVICE_NAME,
      check: "ready",
      database: "unavailable",
      timestamp: new Date().toISOString(),
    });
  }
});

router.get("/health", requireAuth, requireRole(["ADMIN"]), (_req, res) => {
  return res.status(200).json(getHealthPayload());
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
