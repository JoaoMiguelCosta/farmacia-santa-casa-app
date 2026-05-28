const { createApp } = require("../../src/app/app");

function getTestApp() {
  return createApp();
}

module.exports = {
  getTestApp,
};
