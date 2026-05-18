// src/routes/admin.routes.js
const { Router } = require("express");

const adminUsersRoutes = require("../modules/admin-users/adminUsers.routes");

const router = Router();

router.use("/", adminUsersRoutes);

module.exports = router;
