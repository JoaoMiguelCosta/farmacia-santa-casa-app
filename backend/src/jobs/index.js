// src/jobs/index.js
const { registerReceitaExpiryJob } = require("./receitaExpiry.job");
const { registerHigieneJob } = require("./higiene.job");
const { registerPurgeHistoryJob } = require("./purgeHistory.job");

function registerJobs() {
  registerReceitaExpiryJob();
  registerHigieneJob();
  registerPurgeHistoryJob();
}

module.exports = {
  registerJobs,
};
