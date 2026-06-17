// src/modules/manutencao/manutencao.service.js
const receitaExpiryJob = require("../../jobs/receitaExpiry.job");
const higieneJob = require("../../jobs/higiene.job");
const purgeHistoryJob = require("../../jobs/purgeHistory.job");

const {
  parseHigieneOptions,
  parseHigieneRunOptions,
  parsePurgeOptions,
  parsePurgeRunOptions,
  parseReceitaExpiryRunPayload,
} = require("./manutencao.validators");

function listJobs() {
  return {
    data: [
      {
        key: "receita-expiry",
        description:
          "Expira linhas de receita vencidas e cancela itens pendentes associados.",
        schedule: "daily",
        actions: ["preview", "run"],
      },
      {
        key: "higiene",
        description:
          "Marca utentes removidos antigos como arquivados por higiene.",
        schedule: "monthly",
        actions: ["preview", "run"],
      },
      {
        key: "purge-history",
        description:
          "Remove histórico antigo de pedidos fechados e regularizações concluídas.",
        schedule: "monthly",
        actions: ["preview", "run"],
      },
    ],
  };
}

async function previewReceitaExpiry() {
  const result = await receitaExpiryJob.preview();

  return {
    job: "receita-expiry",
    mode: "preview",
    result,
  };
}

async function runReceitaExpiry(body = {}) {
  parseReceitaExpiryRunPayload(body);

  const result = await receitaExpiryJob.runOnce();

  return {
    job: "receita-expiry",
    mode: "run",
    result,
  };
}

async function previewHigiene(query = {}) {
  const options = parseHigieneOptions(query);
  const result = await higieneJob.preview(options);

  return {
    job: "higiene",
    mode: "preview",
    options,
    result,
  };
}

async function runHigiene(body = {}) {
  const options = parseHigieneRunOptions(body);
  const result = await higieneJob.runOnce(options);

  return {
    job: "higiene",
    mode: "run",
    options,
    result,
  };
}

async function previewPurgeHistory(query = {}) {
  const options = parsePurgeOptions(query);
  const result = await purgeHistoryJob.preview(options);

  return {
    job: "purge-history",
    mode: "preview",
    options,
    result,
  };
}

async function runPurgeHistory(body = {}) {
  const options = parsePurgeRunOptions(body);
  const result = await purgeHistoryJob.runOnce(options);

  return {
    job: "purge-history",
    mode: "run",
    options,
    result,
  };
}

module.exports = {
  listJobs,
  previewReceitaExpiry,
  runReceitaExpiry,
  previewHigiene,
  runHigiene,
  previewPurgeHistory,
  runPurgeHistory,
};
