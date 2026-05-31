// src/modules/extras/extras.repository.js
const { prisma } = require("../../db/prisma");

const extraSelect = Object.freeze({
  id: true,
  utenteId: true,

  medicamentoId: true,
  medicamento: true,
  medicamentoNorm: true,

  quantidadeSolicitada: true,
  quantidadeRegularizada: true,
  quantidadeCancelada: true,
  status: true,

  createdAt: true,
  updatedAt: true,

  medicamentoRef: {
    select: {
      id: true,
      nome: true,
      tipo: true,
    },
  },

  pedidoItens: {
    select: {
      id: true,
      quantidade: true,
      status: true,
    },
  },
});

const receitaLinhaSelect = Object.freeze({
  id: true,
  nome: true,
  medicamentoId: true,
  quantidade: true,
  quantidadeDispensada: true,
  validade: true,
  status: true,

  medicamentoRef: {
    select: {
      id: true,
      nome: true,
      tipo: true,
    },
  },

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
  return prisma.extra.findMany({
    where: {
      utenteId,
      status: {
        in: ["PENDENTE", "PARCIALMENTE_REGULARIZADO"],
      },
    },
    select: extraSelect,
    orderBy: {
      createdAt: "desc",
    },
  });
}

function findById(extraId) {
  return prisma.extra.findUnique({
    where: {
      id: extraId,
    },
    select: extraSelect,
  });
}

function findActiveReceitaLinhasByUtente(utenteId) {
  return prisma.receitaLinha.findMany({
    where: {
      receita: {
        utenteId,
      },
      status: "ATIVA",
      validade: {
        gt: new Date(),
      },
    },
    select: receitaLinhaSelect,
    orderBy: [{ validade: "asc" }, { createdAt: "desc" }],
  });
}

function findOpenExtrasByUtente(utenteId) {
  return prisma.extra.findMany({
    where: {
      utenteId,
      status: {
        in: ["PENDENTE", "PARCIALMENTE_REGULARIZADO"],
      },
    },
    select: extraSelect,
    orderBy: {
      createdAt: "desc",
    },
  });
}

function create(utenteId, data) {
  return prisma.extra.create({
    data: {
      utenteId,
      medicamento: data.medicamento,
      medicamentoNorm: data.medicamentoNorm,
      quantidadeSolicitada: data.quantidadeSolicitada,
    },
    select: extraSelect,
  });
}

function countPedidoItemsByExtra(extraId) {
  return prisma.pedidoItem.count({
    where: {
      extraId,
    },
  });
}

function deleteById(extraId) {
  return prisma.extra.delete({
    where: {
      id: extraId,
    },
    select: extraSelect,
  });
}

module.exports = {
  findByUtente,
  findById,
  findActiveReceitaLinhasByUtente,
  findOpenExtrasByUtente,
  create,
  countPedidoItemsByExtra,
  deleteById,
};
