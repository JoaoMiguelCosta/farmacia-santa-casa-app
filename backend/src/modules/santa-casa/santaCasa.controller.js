const service = require("./santaCasa.service");

async function getDashboardSignals(_req, res) {
  const data = await service.getDashboardSignals();

  return res.status(200).json(data);
}

module.exports = {
  getDashboardSignals,
};
