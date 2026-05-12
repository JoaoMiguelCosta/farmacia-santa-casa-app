// src/jobs/purgeHistory.job.js
const cron = require("node-cron");

const { prisma } = require("../db/prisma");
const { env } = require("../config/env");

function subtractMonths(date, months) {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() - Number(months || 0));
  return result;
}

function getCutoffDate(offsetMonths = env.PURGE_OFFSET_MONTHS) {
  return subtractMonths(new Date(), offsetMonths);
}

function buildClosedPedidosWhere(cutoffDate) {
  return {
    status: {
      in: ["VALIDADO", "REJEITADO", "CANCELADO"],
    },
    OR: [
      {
        validatedAt: {
          lte: cutoffDate,
        },
      },
      {
        rejectedAt: {
          lte: cutoffDate,
        },
      },
      {
        AND: [
          {
            validatedAt: null,
          },
          {
            rejectedAt: null,
          },
          {
            updatedAt: {
              lte: cutoffDate,
            },
          },
        ],
      },
    ],
  };
}

function buildRegularizacoesWhere(cutoffDate) {
  return {
    status: "REGULARIZADO",
    updatedAt: {
      lte: cutoffDate,
    },
  };
}

async function preview({ offsetMonths = env.PURGE_OFFSET_MONTHS } = {}) {
  const cutoffDate = getCutoffDate(offsetMonths);

  const pedidosWhere = buildClosedPedidosWhere(cutoffDate);
  const regularizacoesWhere = buildRegularizacoesWhere(cutoffDate);

  const [pedidos, pedidoItens, dispensas, regularizacoes, eventos] =
    await Promise.all([
      prisma.pedido.count({
        where: pedidosWhere,
      }),

      prisma.pedidoItem.count({
        where: {
          pedido: pedidosWhere,
        },
      }),

      prisma.dispensa.count({
        where: {
          pedidoItem: {
            pedido: pedidosWhere,
          },
        },
      }),

      prisma.regularizacaoExtra.count({
        where: regularizacoesWhere,
      }),

      prisma.regularizacaoEvento.count({
        where: {
          regularizacao: regularizacoesWhere,
        },
      }),
    ]);

  return {
    cutoffDate,
    offsetMonths: Number(offsetMonths),
    pedidos,
    pedidoItens,
    dispensas,
    regularizacoes,
    eventos,
  };
}

async function purgeRegularizacoesTx(tx, cutoffDate) {
  const regularizacoes = await tx.regularizacaoExtra.findMany({
    where: buildRegularizacoesWhere(cutoffDate),
    select: {
      id: true,
    },
  });

  const regularizacaoIds = regularizacoes.map((row) => row.id);

  if (regularizacaoIds.length === 0) {
    return {
      regularizacoes: 0,
      eventos: 0,
    };
  }

  const eventos = await tx.regularizacaoEvento.deleteMany({
    where: {
      regularizacaoId: {
        in: regularizacaoIds,
      },
    },
  });

  const deletedRegularizacoes = await tx.regularizacaoExtra.deleteMany({
    where: {
      id: {
        in: regularizacaoIds,
      },
    },
  });

  return {
    regularizacoes: deletedRegularizacoes.count,
    eventos: eventos.count,
  };
}

async function purgePedidosTx(tx, cutoffDate) {
  const pedidos = await tx.pedido.findMany({
    where: buildClosedPedidosWhere(cutoffDate),
    select: {
      id: true,
    },
  });

  const pedidoIds = pedidos.map((row) => row.id);

  if (pedidoIds.length === 0) {
    return {
      pedidos: 0,
      pedidoItens: 0,
      dispensas: 0,
      regularizacoesDesvinculadas: 0,
    };
  }

  const pedidoItens = await tx.pedidoItem.findMany({
    where: {
      pedidoId: {
        in: pedidoIds,
      },
    },
    select: {
      id: true,
    },
  });

  const pedidoItemIds = pedidoItens.map((item) => item.id);

  const regularizacoesDesvinculadas = await tx.regularizacaoExtra.updateMany({
    where: {
      pedidoId: {
        in: pedidoIds,
      },
    },
    data: {
      pedidoId: null,
    },
  });

  const dispensas =
    pedidoItemIds.length > 0
      ? await tx.dispensa.deleteMany({
          where: {
            pedidoItemId: {
              in: pedidoItemIds,
            },
          },
        })
      : { count: 0 };

  const deletedPedidoItens =
    pedidoItemIds.length > 0
      ? await tx.pedidoItem.deleteMany({
          where: {
            id: {
              in: pedidoItemIds,
            },
          },
        })
      : { count: 0 };

  const deletedPedidos = await tx.pedido.deleteMany({
    where: {
      id: {
        in: pedidoIds,
      },
    },
  });

  return {
    pedidos: deletedPedidos.count,
    pedidoItens: deletedPedidoItens.count,
    dispensas: dispensas.count,
    regularizacoesDesvinculadas: regularizacoesDesvinculadas.count,
  };
}

async function runOnce({ offsetMonths = env.PURGE_OFFSET_MONTHS } = {}) {
  const cutoffDate = getCutoffDate(offsetMonths);

  return prisma.$transaction(async (tx) => {
    const regularizacoes = await purgeRegularizacoesTx(tx, cutoffDate);
    const pedidos = await purgePedidosTx(tx, cutoffDate);

    return {
      checkedAt: new Date(),
      cutoffDate,
      offsetMonths: Number(offsetMonths),
      ...regularizacoes,
      ...pedidos,
    };
  });
}

function registerPurgeHistoryJob() {
  if (!env.ENABLE_PURGE_HISTORY) {
    console.log("[jobs] purgeHistory DESATIVADO");
    return null;
  }

  if (global.__PURGE_HISTORY_JOB_REGISTERED__) {
    return null;
  }

  global.__PURGE_HISTORY_JOB_REGISTERED__ = true;

  const task = cron.schedule(
    env.CRON_MONTHLY_03H,
    async () => {
      console.log("[purgeHistory] start", new Date().toISOString());

      try {
        const result = await runOnce();

        console.log("[purgeHistory] ok", result);
      } catch (error) {
        console.error("[purgeHistory] erro:", error?.message || error);
      }
    },
    {
      timezone: env.TZ,
    },
  );

  console.log(
    `[jobs] purgeHistory agendado: ${env.CRON_MONTHLY_03H} ${env.TZ}`,
  );

  return task;
}

module.exports = {
  preview,
  runOnce,
  registerPurgeHistoryJob,
};
