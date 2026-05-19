// src/modules/utentes/utentes.repository.js
const { prisma } = require("../../db/prisma");

const baseSelect = Object.freeze({
  id: true,
  numero9: true,
  nome: true,

  status: true,
  archivedAt: true,
  archivedReason: true,
  archivedById: true,
  archivedBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },

  isValid: true,
  invalidReason: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});

function buildListWhere({ status = "ATIVO" } = {}) {
  const where = {
    deletedAt: null,
  };

  if (status !== "TODOS") {
    where.status = status;
  }

  return where;
}

function findAll(params = {}) {
  return prisma.utente.findMany({
    where: buildListWhere(params),
    select: baseSelect,
    orderBy: [{ nome: "asc" }, { numero9: "asc" }],
  });
}

function findAllActive() {
  return findAll({
    status: "ATIVO",
  });
}

function findById(id) {
  return prisma.utente.findUnique({
    where: { id },
    select: baseSelect,
  });
}

function findByNumero9(numero9) {
  return prisma.utente.findUnique({
    where: {
      numero9,
    },
    select: baseSelect,
  });
}

function findNonDeletedByNome(nome) {
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

function archive(id, { archivedReason, archivedById }) {
  return prisma.utente.update({
    where: { id },
    data: {
      status: "ARQUIVADO",
      archivedReason,
      archivedById,
      archivedAt: new Date(),
    },
    select: baseSelect,
  });
}

function reactivate(id) {
  return prisma.utente.update({
    where: { id },
    data: {
      status: "ATIVO",
      archivedAt: null,
      archivedReason: null,
      archivedById: null,
    },
    select: baseSelect,
  });
}

function softDelete(id, reason = "Removido sem dados associados.") {
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

function sumPendingQuantity(items = []) {
  return items.reduce((total, item) => {
    return total + (Number(item.quantidade) || 0);
  }, 0);
}

function hasReceitaLinhaRemaining(linha) {
  const quantidade = Number(linha.quantidade) || 0;
  const quantidadeDispensada = Number(linha.quantidadeDispensada) || 0;
  const quantidadePendente = sumPendingQuantity(linha.pedidoItens);

  return (
    Math.max(0, quantidade - quantidadeDispensada - quantidadePendente) > 0
  );
}

function hasSemReceitaRemaining(item) {
  const quantidade = Number(item.quantidade) || 0;
  const quantidadePendente = sumPendingQuantity(item.pedidoItens);

  return Math.max(0, quantidade - quantidadePendente) > 0;
}

async function countDeleteBlockingDependencies(utenteId) {
  const [
    receitas,
    receitaLinhas,
    semReceita,
    extras,
    pedidoItens,
    regularizacoes,
    regularizacaoEventos,
    dispensas,
  ] = await Promise.all([
    prisma.receita.count({
      where: {
        utenteId,
      },
    }),

    prisma.receitaLinha.count({
      where: {
        receita: {
          utenteId,
        },
      },
    }),

    prisma.semReceita.count({
      where: {
        utenteId,
      },
    }),

    prisma.extra.count({
      where: {
        utenteId,
      },
    }),

    prisma.pedidoItem.count({
      where: {
        utenteId,
      },
    }),

    prisma.regularizacaoExtra.count({
      where: {
        utenteId,
      },
    }),

    prisma.regularizacaoEvento.count({
      where: {
        receitaLinha: {
          receita: {
            utenteId,
          },
        },
      },
    }),

    prisma.dispensa.count({
      where: {
        receitaLinha: {
          receita: {
            utenteId,
          },
        },
      },
    }),
  ]);

  return {
    receitas,
    receitaLinhas,
    semReceita,
    extras,
    pedidoItens,
    regularizacoes,
    regularizacaoEventos,
    dispensas,
  };
}

async function countOpenOperationalDependencies(utenteId) {
  const [
    receitaLinhas,
    semReceitaItems,
    extras,
    regularizacoes,
    pedidosPendentes,
  ] = await Promise.all([
    prisma.receitaLinha.findMany({
      where: {
        receita: {
          utenteId,
        },
        status: "ATIVA",
        validade: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        quantidade: true,
        quantidadeDispensada: true,
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
    }),

    prisma.semReceita.findMany({
      where: {
        utenteId,
      },
      select: {
        id: true,
        quantidade: true,
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
    }),

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
    receitasAtivas: receitaLinhas.filter(hasReceitaLinhaRemaining).length,
    semReceitaDisponivel: semReceitaItems.filter(hasSemReceitaRemaining).length,
    extras,
    regularizacoes,
    pedidosPendentes,
  };
}

module.exports = {
  findAll,
  findAllActive,
  findById,
  findByNumero9,
  findNonDeletedByNome,
  create,
  archive,
  reactivate,
  softDelete,
  countDeleteBlockingDependencies,
  countOpenOperationalDependencies,
};
