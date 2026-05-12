// src/modules/utentes/utentes.repository.js
const { prisma } = require("../../db/prisma");

const baseSelect = Object.freeze({
  id: true,
  numero9: true,
  nome: true,
  isValid: true,
  invalidReason: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});

function findAllActive() {
  return prisma.utente.findMany({
    where: {
      deletedAt: null,
    },
    select: baseSelect,
    orderBy: [{ nome: "asc" }, { numero9: "asc" }],
  });
}

function findById(id) {
  return prisma.utente.findUnique({
    where: { id },
    select: baseSelect,
  });
}

function findActiveByNumero9(numero9) {
  return prisma.utente.findFirst({
    where: {
      numero9,
      deletedAt: null,
    },
    select: baseSelect,
  });
}

function findActiveByNome(nome) {
  return prisma.utente.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
      deletedAt: null,
    },
    select: baseSelect,
  });
}

function create(data) {
  return prisma.utente.create({
    data,
    select: baseSelect,
  });
}

function softDelete(id, reason = "Removido sem pendências.") {
  return prisma.utente.update({
    where: { id },
    data: {
      isValid: false,
      invalidReason: reason,
      deletedAt: new Date(),
    },
    select: baseSelect,
  });
}

async function countOpenDependencies(utenteId) {
  const [extras, regularizacoes, pedidosPendentes] = await Promise.all([
    prisma.extra.count({
      where: {
        utenteId,
        status: {
          in: ["PENDENTE", "PARCIALMENTE_REGULARIZADO"],
        },
      },
    }),

    prisma.regularizacaoExtra.count({
      where: {
        utenteId,
        status: {
          in: ["PENDENTE", "PARCIALMENTE_REGULARIZADO"],
        },
      },
    }),

    prisma.pedidoItem.count({
      where: {
        utenteId,
        status: "PENDENTE",
      },
    }),
  ]);

  return {
    extras,
    regularizacoes,
    pedidosPendentes,
  };
}

module.exports = {
  findAllActive,
  findById,
  findActiveByNumero9,
  findActiveByNome,
  create,
  softDelete,
  countOpenDependencies,
};
