// src/jobs/receitaExpiry.job.js
const cron = require("node-cron");

const { prisma } = require("../db/prisma");
const { env } = require("../config/env");

async function getExpiredActiveLineIds(tx, now) {
  const rows = await tx.receitaLinha.findMany({
    where: {
      status: "ATIVA",
      validade: {
        lte: now,
      },
    },
    select: {
      id: true,
    },
  });

  return rows.map((row) => row.id);
}

async function preview() {
  const now = new Date();

  const expiredLines = await prisma.receitaLinha.count({
    where: {
      status: "ATIVA",
      validade: {
        lte: now,
      },
    },
  });

  const pendingItems = await prisma.pedidoItem.count({
    where: {
      status: "PENDENTE",
      receitaLinha: {
        status: "ATIVA",
        validade: {
          lte: now,
        },
      },
    },
  });

  return {
    checkedAt: now,
    expiredLines,
    pendingItemsFromExpiredLines: pendingItems,
  };
}

async function cancelPendingItemsFromExpiredLines(tx, receitaLinhaIds) {
  if (!Array.isArray(receitaLinhaIds) || receitaLinhaIds.length === 0) {
    return {
      count: 0,
      affectedPedidoIds: [],
    };
  }

  const affectedItems = await tx.pedidoItem.findMany({
    where: {
      receitaLinhaId: {
        in: receitaLinhaIds,
      },
      status: "PENDENTE",
    },
    select: {
      id: true,
      pedidoId: true,
    },
  });

  const affectedItemIds = affectedItems.map((item) => item.id);
  const affectedPedidoIds = Array.from(
    new Set(affectedItems.map((item) => item.pedidoId)),
  );

  if (affectedItemIds.length === 0) {
    return {
      count: 0,
      affectedPedidoIds,
    };
  }

  const result = await tx.pedidoItem.updateMany({
    where: {
      id: {
        in: affectedItemIds,
      },
    },
    data: {
      status: "CANCELADO_POR_EXPIRACAO",
    },
  });

  return {
    count: result.count,
    affectedPedidoIds,
  };
}

async function cancelPedidosFullyExpired(tx, pedidoIds) {
  if (!Array.isArray(pedidoIds) || pedidoIds.length === 0) {
    return 0;
  }

  let totalCanceled = 0;

  for (const pedidoId of pedidoIds) {
    const pedido = await tx.pedido.findUnique({
      where: {
        id: pedidoId,
      },
      select: {
        id: true,
        status: true,
        itens: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!pedido || pedido.status !== "PENDENTE") {
      continue;
    }

    const hasPendingItems = pedido.itens.some(
      (item) => item.status === "PENDENTE",
    );

    const allItemsCanceledByExpiry =
      pedido.itens.length > 0 &&
      pedido.itens.every((item) => item.status === "CANCELADO_POR_EXPIRACAO");

    if (!hasPendingItems && allItemsCanceledByExpiry) {
      await tx.pedido.update({
        where: {
          id: pedido.id,
        },
        data: {
          status: "CANCELADO",
          closedReason: "Cancelado automaticamente por expiração da receita.",
        },
      });

      totalCanceled += 1;
    }
  }

  return totalCanceled;
}

async function runOnce() {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const expiredLineIds = await getExpiredActiveLineIds(tx, now);

    if (expiredLineIds.length === 0) {
      return {
        checkedAt: now,
        expiredLines: 0,
        canceledPedidoItems: 0,
        canceledPedidos: 0,
      };
    }

    const expiredLines = await tx.receitaLinha.updateMany({
      where: {
        id: {
          in: expiredLineIds,
        },
      },
      data: {
        status: "EXPIRADA",
      },
    });

    const canceledItems = await cancelPendingItemsFromExpiredLines(
      tx,
      expiredLineIds,
    );

    const canceledPedidos = await cancelPedidosFullyExpired(
      tx,
      canceledItems.affectedPedidoIds,
    );

    return {
      checkedAt: now,
      expiredLines: expiredLines.count,
      canceledPedidoItems: canceledItems.count,
      canceledPedidos,
    };
  });
}

function registerReceitaExpiryJob() {
  if (!env.ENABLE_RECEITAS_EXPIRY) {
    console.log("[jobs] receitaExpiry DESATIVADO");
    return null;
  }

  if (global.__RECEITAS_EXPIRY_JOB_REGISTERED__) {
    return null;
  }

  global.__RECEITAS_EXPIRY_JOB_REGISTERED__ = true;

  const task = cron.schedule(
    env.CRON_DAILY_03H,
    async () => {
      console.log("[receitaExpiry] start", new Date().toISOString());

      try {
        const result = await runOnce();

        console.log("[receitaExpiry] ok", result);
      } catch (error) {
        console.error("[receitaExpiry] erro:", error?.message || error);
      }
    },
    {
      timezone: env.TZ,
    },
  );

  console.log(`[jobs] receitaExpiry agendado: ${env.CRON_DAILY_03H} ${env.TZ}`);

  return task;
}

module.exports = {
  preview,
  runOnce,
  registerReceitaExpiryJob,
};
