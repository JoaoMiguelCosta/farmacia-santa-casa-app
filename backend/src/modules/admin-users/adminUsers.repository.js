// src/modules/admin-users/adminUsers.repository.js
const { prisma } = require("../../db/prisma");

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

function buildUsersWhere({ search, role, isActive } = {}) {
  const where = {};

  if (role) {
    where.role = role;
  }

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

async function listUsers(params = {}) {
  const { search, role, isActive, skip, take } = params;
  const where = buildUsersWhere({ search, role, isActive });

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          name: "asc",
        },
      ],
      skip,
      take,
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    rows,
    total,
    skip,
    take,
  };
}

function findUserById(userId) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: userSelect,
  });
}

function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
    },
  });
}

function createUser(data) {
  return prisma.user.create({
    data,
    select: userSelect,
  });
}

function updateUser(userId, data) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data,
    select: userSelect,
  });
}

async function getUserAuditUsage(userId) {
  const [
    pedidosValidados,
    pedidosRejeitados,
    pedidoItensValidados,
    pedidoItensRejeitados,
  ] = await Promise.all([
    prisma.pedido.count({
      where: {
        validatedById: userId,
      },
    }),

    prisma.pedido.count({
      where: {
        rejectedById: userId,
      },
    }),

    prisma.pedidoItem.count({
      where: {
        validatedById: userId,
      },
    }),

    prisma.pedidoItem.count({
      where: {
        rejectedById: userId,
      },
    }),
  ]);

  const total =
    pedidosValidados +
    pedidosRejeitados +
    pedidoItensValidados +
    pedidoItensRejeitados;

  return {
    total,
    pedidosValidados,
    pedidosRejeitados,
    pedidoItensValidados,
    pedidoItensRejeitados,
  };
}

function deleteUser(userId) {
  return prisma.user.delete({
    where: {
      id: userId,
    },
    select: userSelect,
  });
}

module.exports = {
  listUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  getUserAuditUsage,
  deleteUser,
};
