// src/modules/sem-receita/semReceita.repository.js
const { prisma } = require("../../db/prisma");

const baseSelect = Object.freeze({
  id: true,
  utenteId: true,
  medicamento: true,
  quantidade: true,
  createdAt: true,
  updatedAt: true,
});

function findByUtente(utenteId) {
  return prisma.semReceita.findMany({
    where: {
      utenteId,
    },
    select: {
      ...baseSelect,
      pedidoItens: {
        where: {
          status: "PENDENTE",
        },
        select: {
          quantidade: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

function create(utenteId, data) {
  return prisma.semReceita.create({
    data: {
      utenteId,
      medicamento: data.medicamento,
      quantidade: data.quantidade,
    },
    select: {
      ...baseSelect,
      pedidoItens: {
        where: {
          status: "PENDENTE",
        },
        select: {
          quantidade: true,
        },
      },
    },
  });
}

function findById(id) {
  return prisma.semReceita.findUnique({
    where: {
      id,
    },
    select: {
      ...baseSelect,
      pedidoItens: {
        where: {
          status: "PENDENTE",
        },
        select: {
          id: true,
          quantidade: true,
        },
      },
    },
  });
}

function countPedidoItemsBySemReceita(semReceitaId) {
  return prisma.pedidoItem.count({
    where: {
      semReceitaId,
    },
  });
}

function deleteById(id) {
  return prisma.semReceita.delete({
    where: {
      id,
    },
    select: baseSelect,
  });
}

module.exports = {
  findByUtente,
  create,
  findById,
  countPedidoItemsBySemReceita,
  deleteById,
};
