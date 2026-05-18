// src/modules/admin-users/adminUsers.controller.js
const service = require("./adminUsers.service");
const { ok, created } = require("../../shared/utils/http");

async function listUsers(req, res) {
  const data = await service.listUsers(req.query);

  return ok(res, data);
}

async function createUser(req, res) {
  const data = await service.createUser(req.body);

  return created(res, { data });
}

async function updateUser(req, res) {
  const data = await service.updateUser(req.params.userId, req.body);

  return ok(res, { data });
}

async function updateUserPassword(req, res) {
  const data = await service.updateUserPassword(req.params.userId, req.body);

  return ok(res, { data });
}

async function updateUserStatus(req, res) {
  const data = await service.updateUserStatus(req.params.userId, req.body, {
    currentUserId: req.user?.id,
  });

  return ok(res, { data });
}

async function deleteUser(req, res) {
  const data = await service.deleteUser(req.params.userId, {
    currentUserId: req.user?.id,
  });

  return ok(res, { data });
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  updateUserPassword,
  updateUserStatus,
  deleteUser,
};
