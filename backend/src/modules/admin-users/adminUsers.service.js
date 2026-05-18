// src/modules/admin-users/adminUsers.service.js
const bcrypt = require("bcryptjs");

const repository = require("./adminUsers.repository");

const {
  parseCreateUserPayload,
  parseListUsersQuery,
  parseUpdatePasswordPayload,
  parseUpdateStatusPayload,
  parseUpdateUserPayload,
} = require("./adminUsers.validators");

const {
  conflict,
  forbidden,
  notFound,
} = require("../../shared/errors/AppError");

const SALT_ROUNDS = 12;

async function assertEmailAvailable(email, ignoredUserId = null) {
  const existingUser = await repository.findUserByEmail(email);

  if (!existingUser) return;

  if (ignoredUserId && existingUser.id === ignoredUserId) return;

  throw conflict("Já existe um utilizador com este email.");
}

async function assertUserExists(userId) {
  const user = await repository.findUserById(userId);

  if (!user) {
    throw notFound("Utilizador não encontrado.");
  }

  return user;
}

function assertNotSelfStatusChange(targetUserId, currentUserId) {
  if (targetUserId === currentUserId) {
    throw forbidden("Não podes alterar o estado da tua própria conta.");
  }
}

function assertNotSelfDelete(targetUserId, currentUserId) {
  if (targetUserId === currentUserId) {
    throw forbidden("Não podes remover a tua própria conta.");
  }
}

function assertUserInactive(user) {
  if (user.isActive) {
    throw conflict("Só é possível remover utilizadores desativados.");
  }
}

function assertUserHasNoAuditUsage(usage) {
  if (!usage || usage.total === 0) return;

  throw conflict(
    "Este utilizador tem histórico associado e não pode ser removido. Mantém a conta desativada.",
  );
}

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function listUsers(query = {}) {
  const params = parseListUsersQuery(query);
  const result = await repository.listUsers(params);

  return {
    data: result.rows,
    meta: {
      total: result.total,
      skip: result.skip,
      take: result.take,
    },
  };
}

async function createUser(payload = {}) {
  const params = parseCreateUserPayload(payload);

  await assertEmailAvailable(params.email);

  const passwordHash = await hashPassword(params.password);

  return repository.createUser({
    name: params.name,
    email: params.email,
    passwordHash,
    role: params.role,
    isActive: true,
  });
}

async function updateUser(userId, payload = {}) {
  const params = parseUpdateUserPayload(payload);

  await assertUserExists(userId);
  await assertEmailAvailable(params.email, userId);

  return repository.updateUser(userId, {
    name: params.name,
    email: params.email,
    role: params.role,
  });
}

async function updateUserPassword(userId, payload = {}) {
  const params = parseUpdatePasswordPayload(payload);

  await assertUserExists(userId);

  const passwordHash = await hashPassword(params.password);

  return repository.updateUser(userId, {
    passwordHash,
  });
}

async function updateUserStatus(userId, payload = {}, context = {}) {
  const params = parseUpdateStatusPayload(payload);

  await assertUserExists(userId);
  assertNotSelfStatusChange(userId, context.currentUserId);

  return repository.updateUser(userId, {
    isActive: params.isActive,
  });
}

async function deleteUser(userId, context = {}) {
  const user = await assertUserExists(userId);

  assertNotSelfDelete(userId, context.currentUserId);
  assertUserInactive(user);

  const usage = await repository.getUserAuditUsage(userId);

  assertUserHasNoAuditUsage(usage);

  return repository.deleteUser(userId);
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  updateUserPassword,
  updateUserStatus,
  deleteUser,
};
