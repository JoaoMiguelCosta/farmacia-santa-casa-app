// src/modules/auth/auth.repository.js
const { prisma } = require("../../db/prisma");

function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

function findActiveUserById(userId) {
  return prisma.user.findFirst({
    where: {
      id: userId,
      isActive: true,
    },
  });
}

module.exports = {
  findUserByEmail,
  findActiveUserById,
};
