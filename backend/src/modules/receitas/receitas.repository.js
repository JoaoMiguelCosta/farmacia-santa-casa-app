// src/modules/receitas/receitas.repository.js
const { prisma } = require("../../db/prisma");
const regularizacoesRepository = require("../regularizacoes/regularizacoes.repository");
const { normalizeText } = require("../../shared/utils/normalize");

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

const linhaFefoOrderBy = Object.freeze([
  { nome: "asc" },
  { validade: "asc" },
  { createdAt: "asc" },
  { id: "asc" },
]);

const extraResolutionSelect = Object.freeze({
  id: true,
  utenteId: true,

  medicamentoId: true,
  medicamento: true,
  medicamentoNorm: true,

  quantidadeSolicitada: true,
  quantidadeRegularizada: true,
  quantidadeCancelada: true,
  status: true,

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
      status: true,
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
    orderBy: linhaFefoOrderBy,
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

function getLinhaMedicamentoNorm(linha) {
  return normalizeText(linha.medicamentoRef?.nome || linha.nome);
}

function getExtraMedicamentoNorm(extra) {
  return normalizeText(extra.medicamentoRef?.nome || extra.medicamento);
}

function sumPedidoQuantity(items = []) {
  return items.reduce((total, item) => {
    return total + (Number(item.quantidade) || 0);
  }, 0);
}

function sumPendingPedidoQuantity(items = []) {
  return items
    .filter((item) => item.status === "PENDENTE")
    .reduce((total, item) => {
      return total + (Number(item.quantidade) || 0);
    }, 0);
}

function getExtraQuantidadeNaoEnviada(extra) {
  const quantidadeSolicitada = Number(extra.quantidadeSolicitada) || 0;
  const quantidadeRegularizada = Number(extra.quantidadeRegularizada) || 0;
  const quantidadeCancelada = Number(extra.quantidadeCancelada) || 0;
  const quantidadePendenteEmPedido = sumPendingPedidoQuantity(
    extra.pedidoItens,
  );

  return Math.max(
    0,
    quantidadeSolicitada -
      quantidadeRegularizada -
      quantidadeCancelada -
      quantidadePendenteEmPedido,
  );
}

function toResolvedExtraResult(extra, action, quantidadeRemovida) {
  return {
    id: extra.id,
    utenteId: extra.utenteId,
    medicamento: extra.medicamentoRef?.nome || extra.medicamento,
    action,
    quantidadeRemovida,
    quantidadeSolicitada: extra.quantidadeSolicitada,
    quantidadeRegularizada: extra.quantidadeRegularizada,
    quantidadeCancelada: extra.quantidadeCancelada,
  };
}

async function resolveOpenExtrasForCreatedLinhasTx(tx, { utenteId, linhas }) {
  const medicamentoNorms = new Set(
    linhas.map(getLinhaMedicamentoNorm).filter(Boolean),
  );

  if (medicamentoNorms.size === 0) return [];

  const openExtras = await tx.extra.findMany({
    where: {
      utenteId,
      status: {
        in: ["PENDENTE", "PARCIALMENTE_REGULARIZADO"],
      },
    },
    select: extraResolutionSelect,
    orderBy: {
      createdAt: "desc",
    },
  });

  const matchingExtras = openExtras.filter((extra) => {
    return medicamentoNorms.has(getExtraMedicamentoNorm(extra));
  });

  const resolvedExtras = [];

  for (const extra of matchingExtras) {
    const totalPedidoItems = sumPedidoQuantity(extra.pedidoItens);
    const quantidadeNaoEnviada = getExtraQuantidadeNaoEnviada(extra);

    if (totalPedidoItems <= 0) {
      await tx.extra.delete({
        where: {
          id: extra.id,
        },
      });

      resolvedExtras.push(
        toResolvedExtraResult(
          extra,
          "DELETED",
          quantidadeNaoEnviada || Number(extra.quantidadeSolicitada) || 0,
        ),
      );

      continue;
    }

    if (quantidadeNaoEnviada <= 0) continue;

    const updatedExtra = await tx.extra.update({
      where: {
        id: extra.id,
      },
      data: {
        quantidadeCancelada: {
          increment: quantidadeNaoEnviada,
        },
      },
      select: extraResolutionSelect,
    });

    resolvedExtras.push(
      toResolvedExtraResult(
        updatedExtra,
        "CANCELLED_REMAINING",
        quantidadeNaoEnviada,
      ),
    );
  }

  return resolvedExtras;
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
      orderBy: linhaFefoOrderBy,
    });

    const extrasResolvidos = await resolveOpenExtrasForCreatedLinhasTx(tx, {
      utenteId,
      linhas: createdLinhas,
    });

    return {
      receita,
      linhas: createdLinhas,
      extrasResolvidos,
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
