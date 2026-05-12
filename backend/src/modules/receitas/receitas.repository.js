// src/modules/receitas/receitas.repository.js
const { prisma } = require("../../db/prisma");
const regularizacoesRepository = require("../regularizacoes/regularizacoes.repository");

const linhaSelect = Object.freeze({
  id: true,
  receitaId: true,
  medicamentoId: true,
  nome: true,
  quantidade: true,
  quantidadeDispensada: true,
  validade: true,
  status: true,
  createdAt: true,
  updatedAt: true,

  receita: {
    select: {
      id: true,
      utenteId: true,
      numero19: true,
      pinAcesso6: true,
      pinOpcao4: true,
    },
  },

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

function findLinhasByUtente(utenteId) {
  return prisma.receitaLinha.findMany({
    where: {
      receita: {
        utenteId,
      },
      status: "ATIVA",
    },
    select: linhaSelect,
    orderBy: [{ validade: "asc" }, { createdAt: "desc" }],
  });
}

function findReceitaByNumero19(numero19) {
  return prisma.receita.findUnique({
    where: {
      numero19,
    },
    select: {
      id: true,
      utenteId: true,
      numero19: true,
    },
  });
}

function findLinhaById(linhaId) {
  return prisma.receitaLinha.findUnique({
    where: {
      id: linhaId,
    },
    select: linhaSelect,
  });
}

function countDispensasByLinha(linhaId) {
  return prisma.dispensa.count({
    where: {
      receitaLinhaId: linhaId,
    },
  });
}

function countPedidoItemsByLinha(linhaId) {
  return prisma.pedidoItem.count({
    where: {
      receitaLinhaId: linhaId,
    },
  });
}

function countRegularizacaoEventosByLinha(linhaId) {
  return prisma.regularizacaoEvento.count({
    where: {
      receitaLinhaId: linhaId,
    },
  });
}

function countLinhasByReceita(receitaId) {
  return prisma.receitaLinha.count({
    where: {
      receitaId,
    },
  });
}

async function createReceitaWithLinhas(utenteId, payload) {
  return prisma.$transaction(async (tx) => {
    const receita = await tx.receita.create({
      data: {
        utenteId,
        numero19: payload.numero19,
        pinAcesso6: payload.pinAcesso6,
        pinOpcao4: payload.pinOpcao4,
      },
      select: {
        id: true,
        utenteId: true,
        numero19: true,
        pinAcesso6: true,
        pinOpcao4: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const createdLinhaIds = [];

    for (const linha of payload.linhas) {
      const created = await tx.receitaLinha.create({
        data: {
          receitaId: receita.id,
          nome: linha.nome,
          quantidade: linha.quantidade,
          validade: linha.validade,
        },
        select: {
          id: true,
        },
      });

      createdLinhaIds.push(created.id);
    }

    await regularizacoesRepository.applyPendingToLinhasTx(tx, {
      utenteId,
      receitaLinhaIds: createdLinhaIds,
    });

    const createdLinhas = await tx.receitaLinha.findMany({
      where: {
        id: {
          in: createdLinhaIds,
        },
      },
      select: linhaSelect,
      orderBy: [{ validade: "asc" }, { createdAt: "desc" }],
    });

    return {
      receita,
      linhas: createdLinhas,
    };
  });
}

async function deleteLinhaAndMaybeReceita(linhaId, receitaId) {
  return prisma.$transaction(async (tx) => {
    await tx.receitaLinha.delete({
      where: {
        id: linhaId,
      },
    });

    const remainingLines = await tx.receitaLinha.count({
      where: {
        receitaId,
      },
    });

    if (remainingLines === 0) {
      await tx.receita.delete({
        where: {
          id: receitaId,
        },
      });
    }

    return true;
  });
}

module.exports = {
  findLinhasByUtente,
  findReceitaByNumero19,
  findLinhaById,
  countDispensasByLinha,
  countPedidoItemsByLinha,
  countRegularizacaoEventosByLinha,
  countLinhasByReceita,
  createReceitaWithLinhas,
  deleteLinhaAndMaybeReceita,
};
