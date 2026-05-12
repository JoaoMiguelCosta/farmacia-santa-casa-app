// src/jobs/higiene.job.js
const cron = require("node-cron");

const { prisma } = require("../db/prisma");
const { env } = require("../config/env");

const HIGIENE_MARKER = "[HIGIENE]";

function subtractMonths(date, months) {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() - Number(months || 0));
  return result;
}

function getCutoffDate(offsetMonths = env.HIGIENE_OFFSET_MONTHS) {
  return subtractMonths(new Date(), offsetMonths);
}

function buildHigieneWhere(cutoffDate) {
  return {
    deletedAt: {
      lte: cutoffDate,
    },
    NOT: {
      invalidReason: {
        contains: HIGIENE_MARKER,
      },
    },
  };
}

async function preview({ offsetMonths = env.HIGIENE_OFFSET_MONTHS } = {}) {
  const cutoffDate = getCutoffDate(offsetMonths);

  const candidatos = await prisma.utente.count({
    where: buildHigieneWhere(cutoffDate),
  });

  return {
    cutoffDate,
    offsetMonths: Number(offsetMonths),
    candidatos,
  };
}

async function runOnce({
  offsetMonths = env.HIGIENE_OFFSET_MONTHS,
  anonymize = env.HIGIENE_ANONYMIZE,
} = {}) {
  const cutoffDate = getCutoffDate(offsetMonths);

  const allowAnonymize =
    Boolean(anonymize) && Boolean(env.ALLOW_HIGIENE_ANONYMIZE);

  const updateData = allowAnonymize
    ? {
        nome: "Utente removido",
        numero9: "000000000",
        isValid: false,
        invalidReason: `${HIGIENE_MARKER} Utente arquivado e anonimizado por rotina de higiene.`,
      }
    : {
        isValid: false,
        invalidReason: `${HIGIENE_MARKER} Utente arquivado por rotina de higiene.`,
      };

  const result = await prisma.utente.updateMany({
    where: buildHigieneWhere(cutoffDate),
    data: updateData,
  });

  return {
    checkedAt: new Date(),
    cutoffDate,
    offsetMonths: Number(offsetMonths),
    anonymizeRequested: Boolean(anonymize),
    anonymizeApplied: allowAnonymize,
    atualizados: result.count,
  };
}

function registerHigieneJob() {
  if (!env.ENABLE_HIGIENE) {
    console.log("[jobs] higiene DESATIVADO");
    return null;
  }

  if (global.__HIGIENE_JOB_REGISTERED__) {
    return null;
  }

  global.__HIGIENE_JOB_REGISTERED__ = true;

  const task = cron.schedule(
    env.CRON_MONTHLY_03H,
    async () => {
      console.log("[higiene] start", new Date().toISOString());

      try {
        const result = await runOnce();

        console.log("[higiene] ok", result);
      } catch (error) {
        console.error("[higiene] erro:", error?.message || error);
      }
    },
    {
      timezone: env.TZ,
    },
  );

  console.log(`[jobs] higiene agendado: ${env.CRON_MONTHLY_03H} ${env.TZ}`);

  return task;
}

module.exports = {
  HIGIENE_MARKER,
  preview,
  runOnce,
  registerHigieneJob,
};
