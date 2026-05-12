// src/modules/regularizacoes/regularizacoes.validators.js
function parseRegularizacoesQuery(query = {}) {
  const skip = Math.max(0, Number(query.skip || 0));
  const take = Math.min(Math.max(1, Number(query.take || 50)), 200);

  const utenteId = query.utenteId ? String(query.utenteId).trim() : null;
  const medicamento = query.medicamento
    ? String(query.medicamento).trim()
    : null;

  return {
    skip,
    take,
    utenteId,
    medicamento,
  };
}

module.exports = {
  parseRegularizacoesQuery,
};
