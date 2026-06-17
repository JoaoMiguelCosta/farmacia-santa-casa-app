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

const pedidoItemSelect = Object.freeze({
  id: true,
  quantidade: true,
  status: true,
});

const selectWithPedidoItems = Object.freeze({
  ...baseSelect,
  pedidoItens: {
    select: pedidoItemSelect,
  },
});

function findByUtente(utenteId) {
  return prisma.semReceita.findMany({
    where: {
      utenteId,
    },
    select: selectWithPedidoItems,
    orderBy: {
      createdAt: "desc",
    },
  });
}

function findExistingByMedicamento(utenteId, medicamento) {
  return prisma.semReceita.findFirst({
    where: {
      utenteId,
      quantidade: {
        gt: 0,
      },
      medicamento: {
        equals: medicamento,
        mode: "insensitive",
      },
      pedidoItens: {
        none: {},
      },
    },
    select: selectWithPedidoItems,
  });
}

function create(utenteId, data) {
  return prisma.semReceita.create({
    data: {
      utenteId,
      medicamento: data.medicamento,
      quantidade: data.quantidade,
    },
    select: selectWithPedidoItems,
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
    select: selectWithPedidoItems,
  });
}

function findById(id) {
  return prisma.semReceita.findUnique({
    where: {
      id,
    },
    select: selectWithPedidoItems,
  });
}

function countPedidoItemsBySemReceita(semReceitaId) {
  return prisma.pedidoItem.count({
    where: {
      semReceitaId,
    },
  });
}

function countPendingPedidoItemsBySemReceita(semReceitaId) {
  return prisma.pedidoItem.count({
    where: {
      semReceitaId,
      status: "PENDENTE",
    },
  });
}

function unlinkPedidoItemsBySemReceita(semReceitaId) {
  return prisma.pedidoItem.updateMany({
    where: {
      semReceitaId,
    },
    data: {
      semReceitaId: null,
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
  countPendingPedidoItemsBySemReceita,
  unlinkPedidoItemsBySemReceita,
  deleteById,
};
