// src/jobs/index.js
const { env } = require("../config/env");

const { registerReceitaExpiryJob } = require("./receitaExpiry.job");
const { registerHigieneJob } = require("./higiene.job");
const { registerPurgeHistoryJob } = require("./purgeHistory.job");

function registerJobs() {
  if (!env.ENABLE_JOBS) {
    console.log("[jobs] todos os jobs DESATIVADOS por ENABLE_JOBS=false");
    return [];
  }

  return [
    registerReceitaExpiryJob(),
    registerHigieneJob(),
    registerPurgeHistoryJob(),
  ].filter(Boolean);
}

module.exports = {
  registerJobs,
};
