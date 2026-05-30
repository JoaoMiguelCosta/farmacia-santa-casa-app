const { prisma } = require("../../db/prisma");

async function findActiveForUser({ destino, userId, take = 50 }) {
  return prisma.alertaOperacional.findMany({
    where: {
      destino,
      dismissals: {
        none: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
  });
}

async function findById(alertaId) {
  return prisma.alertaOperacional.findUnique({
    where: {
      id: alertaId,
    },
  });
}

async function createIfNotExists(data) {
  return prisma.alertaOperacional.upsert({
    where: {
      idempotencyKey: data.idempotencyKey,
    },
    update: {},
    create: data,
  });
}

async function dismissForUser({ alertaId, userId }) {
  return prisma.alertaOperacionalDismissal.upsert({
    where: {
      alertaId_userId: {
        alertaId,
        userId,
      },
    },
    update: {},
    create: {
      alertaId,
      userId,
    },
  });
}

async function dismissManyForUser({ alertaIds = [], userId }) {
  if (!alertaIds.length) {
    return {
      count: 0,
    };
  }

  return prisma.alertaOperacionalDismissal.createMany({
    data: alertaIds.map((alertaId) => ({
      alertaId,
      userId,
    })),
    skipDuplicates: true,
  });
}

module.exports = {
  findActiveForUser,
  findById,
  createIfNotExists,
  dismissForUser,
  dismissManyForUser,
};
