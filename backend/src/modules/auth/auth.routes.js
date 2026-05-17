// src/modules/auth/auth.routes.js
const { Router } = require("express");

const controller = require("./auth.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");
const { requireAuth } = require("../../middlewares/authMiddleware");

const router = Router();

router.post("/login", asyncHandler(controller.login));
router.post("/logout", asyncHandler(controller.logout));
router.get("/me", requireAuth, asyncHandler(controller.me));

module.exports = router;
