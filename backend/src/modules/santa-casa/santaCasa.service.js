const repository = require("./santaCasa.repository");

async function getDashboardSignals() {
  return repository.getDashboardSignals();
}

module.exports = {
  getDashboardSignals,
};
