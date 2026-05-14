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

const selectWithPendingPedidoItems = Object.freeze({
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
});

function findByUtente(utenteId) {
  return prisma.semReceita.findMany({
    where: {
      utenteId,
    },
    select: selectWithPendingPedidoItems,
    orderBy: {
      createdAt: "desc",
    },
  });
}

function findExistingByMedicamento(utenteId, medicamento) {
  return prisma.semReceita.findFirst({
    where: {
      utenteId,
      medicamento: {
        equals: medicamento,
        mode: "insensitive",
      },
    },
    select: selectWithPendingPedidoItems,
  });
}

function create(utenteId, data) {
  return prisma.semReceita.create({
    data: {
      utenteId,
      medicamento: data.medicamento,
      quantidade: data.quantidade,
    },
    select: selectWithPendingPedidoItems,
  });
}

function incrementQuantidade(id, quantidadeToAdd) {
  return prisma.semReceita.update({
    where: {
      id,
    },
    data: {
      quantidade: {
        increment: quantidadeToAdd,
      },
    },
    select: selectWithPendingPedidoItems,
  });
}

function findById(id) {
  return prisma.semReceita.findUnique({
    where: {
      id,
    },
    select: selectWithPendingPedidoItems,
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
  findExistingByMedicamento,
  create,
  incrementQuantidade,
  findById,
  countPedidoItemsBySemReceita,
  deleteById,
};
