// src/routes/auth.routes.js
const { Router } = require("express");

const authRoutes = require("../modules/auth/auth.routes");

const router = Router();

router.use("/", authRoutes);

module.exports = router;
