// src/jobs/receitaExpiry.job.js
const cron = require("node-cron");

const { prisma } = require("../db/prisma");
const { env } = require("../config/env");

const CANCEL_REASON = "Cancelado automaticamente por expiração da receita.";

function getUniqueValues(values = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getStartOfDay(value = new Date()) {
  const date = new Date(value);

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

async function getExpiredActiveLineIds(client, now) {
  const expirationBoundary = getStartOfDay(now);

  const rows = await client.receitaLinha.findMany({
    where: {
      status: "ATIVA",
      validade: {
        lt: expirationBoundary,
      },
    },
    select: {
      id: true,
    },
  });

  return rows.map((row) => row.id);
}

async function getAffectedPendingPedidoIdsFromExpiredLines(
  client,
  receitaLinhaIds,
) {
  if (!Array.isArray(receitaLinhaIds) || receitaLinhaIds.length === 0) {
    return [];
  }

  const affectedItems = await client.pedidoItem.findMany({
    where: {
      receitaLinhaId: {
        in: receitaLinhaIds,
      },
      status: "PENDENTE",
      pedido: {
        status: "PENDENTE",
      },
    },
    select: {
      pedidoId: true,
    },
  });

  return getUniqueValues(affectedItems.map((item) => item.pedidoId));
}

async function countPendingItemsFromExpiredLines(client, receitaLinhaIds) {
  if (!Array.isArray(receitaLinhaIds) || receitaLinhaIds.length === 0) {
    return 0;
  }

  return client.pedidoItem.count({
    where: {
      receitaLinhaId: {
        in: receitaLinhaIds,
      },
      status: "PENDENTE",
      pedido: {
        status: "PENDENTE",
      },
    },
  });
}

async function countPendingItemsFromPedidos(client, pedidoIds) {
  if (!Array.isArray(pedidoIds) || pedidoIds.length === 0) {
    return 0;
  }

  return client.pedidoItem.count({
    where: {
      pedidoId: {
        in: pedidoIds,
      },
      status: "PENDENTE",
      pedido: {
        status: "PENDENTE",
      },
    },
  });
}

async function preview() {
  const now = new Date();

  const expiredLineIds = await getExpiredActiveLineIds(prisma, now);
  const affectedPedidoIds = await getAffectedPendingPedidoIdsFromExpiredLines(
    prisma,
    expiredLineIds,
  );

  const pendingItemsFromExpiredLines = await countPendingItemsFromExpiredLines(
    prisma,
    expiredLineIds,
  );

  const pendingItemsFromAffectedPedidos = await countPendingItemsFromPedidos(
    prisma,
    affectedPedidoIds,
  );

  return {
    checkedAt: now,
    expiredLines: expiredLineIds.length,
    pendingItemsFromExpiredLines,
    affectedPedidos: affectedPedidoIds.length,
    pendingItemsFromAffectedPedidos,
  };
}

async function cancelExpiredPedidoItemsByLineIds(tx, receitaLinhaIds) {
  if (!Array.isArray(receitaLinhaIds) || receitaLinhaIds.length === 0) {
    return {
      affectedPedidoIds: [],
      pendingItemsFromExpiredLines: 0,
      canceledPedidoItems: 0,
      canceledPedidos: 0,
    };
  }

  const expiredPendingItems = await tx.pedidoItem.findMany({
    where: {
      receitaLinhaId: {
        in: receitaLinhaIds,
      },
      status: "PENDENTE",
      pedido: {
        status: "PENDENTE",
      },
    },
    select: {
      id: true,
      pedidoId: true,
    },
  });

  const expiredPendingItemIds = expiredPendingItems.map((item) => item.id);
  const affectedPedidoIds = getUniqueValues(
    expiredPendingItems.map((item) => item.pedidoId),
  );

  if (expiredPendingItemIds.length === 0) {
    return {
      affectedPedidoIds,
      pendingItemsFromExpiredLines: 0,
      canceledPedidoItems: 0,
      canceledPedidos: 0,
    };
  }

  const canceledItems = await tx.pedidoItem.updateMany({
    where: {
      id: {
        in: expiredPendingItemIds,
      },
      status: "PENDENTE",
    },
    data: {
      status: "CANCELADO_POR_EXPIRACAO",
    },
  });

  const canceledPedidos = await tx.pedido.updateMany({
    where: {
      id: {
        in: affectedPedidoIds,
      },
      status: "PENDENTE",
      itens: {
        none: {
          status: "PENDENTE",
        },
      },
    },
    data: {
      status: "CANCELADO",
      closedReason: CANCEL_REASON,
    },
  });

  return {
    affectedPedidoIds,
    pendingItemsFromExpiredLines: expiredPendingItemIds.length,
    canceledPedidoItems: canceledItems.count,
    canceledPedidos: canceledPedidos.count,
  };
}

async function runOnce() {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const expiredLineIds = await getExpiredActiveLineIds(tx, now);

    if (expiredLineIds.length === 0) {
      return {
        checkedAt: now,
        expiredLines: 0,
        pendingItemsFromExpiredLines: 0,
        affectedPedidos: 0,
        pendingItemsFromAffectedPedidos: 0,
        canceledPedidoItems: 0,
        canceledPedidos: 0,
      };
    }

    const affectedPedidoIds = await getAffectedPendingPedidoIdsFromExpiredLines(
      tx,
      expiredLineIds,
    );

    const pendingItemsFromAffectedPedidos = await countPendingItemsFromPedidos(
      tx,
      affectedPedidoIds,
    );

    const expiredLines = await tx.receitaLinha.updateMany({
      where: {
        id: {
          in: expiredLineIds,
        },
        status: "ATIVA",
      },
      data: {
        status: "EXPIRADA",
      },
    });

    const cancellation = await cancelExpiredPedidoItemsByLineIds(
      tx,
      expiredLineIds,
    );

    return {
      checkedAt: now,
      expiredLines: expiredLines.count,
      pendingItemsFromExpiredLines: cancellation.pendingItemsFromExpiredLines,
      affectedPedidos: cancellation.affectedPedidoIds.length,
      pendingItemsFromAffectedPedidos,
      canceledPedidoItems: cancellation.canceledPedidoItems,
      canceledPedidos: cancellation.canceledPedidos,
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
