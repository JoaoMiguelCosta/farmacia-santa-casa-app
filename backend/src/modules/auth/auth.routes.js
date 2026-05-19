// src/modules/auth/auth.routes.js
const { Router } = require("express");

const controller = require("./auth.controller");
const { loginRateLimit } = require("../../middlewares/loginRateLimit");
const { requireAuth } = require("../../middlewares/authMiddleware");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const router = Router();

router.post("/login", loginRateLimit, asyncHandler(controller.login));
router.post("/logout", asyncHandler(controller.logout));
router.get("/me", requireAuth, asyncHandler(controller.me));

module.exports = router;
