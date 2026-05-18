// src/modules/admin-users/adminUsers.routes.js
const { Router } = require("express");

const controller = require("./adminUsers.controller");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const router = Router();

router.get("/users", asyncHandler(controller.listUsers));
router.post("/users", asyncHandler(controller.createUser));

router.patch("/users/:userId", asyncHandler(controller.updateUser));

router.patch(
  "/users/:userId/password",
  asyncHandler(controller.updateUserPassword),
);

router.patch(
  "/users/:userId/status",
  asyncHandler(controller.updateUserStatus),
);

router.delete("/users/:userId", asyncHandler(controller.deleteUser));

module.exports = router;
