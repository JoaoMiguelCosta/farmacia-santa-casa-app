// src/shared/utils/normalize.js
function cleanId(value) {
  return String(value || "").trim();
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

module.exports = {
  cleanId,
  normalizeText,
};
