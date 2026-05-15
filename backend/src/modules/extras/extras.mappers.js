// src/modules/extras/extras.mappers.js
function calculateReservedQuantity(row) {
  return (row.pedidoItens || []).reduce((total, item) => {
    return total + (Number(item.quantidade) || 0);
  }, 0);
}

function toExtraDTO(row) {
  if (!row) return null;

  const quantidadeSolicitada = Number(row.quantidadeSolicitada) || 0;
  const quantidadeRegularizada = Number(row.quantidadeRegularizada) || 0;
  const quantidadeCancelada = Number(row.quantidadeCancelada) || 0;
  const quantidadeReservadaPendente = calculateReservedQuantity(row);

  const quantidadeRestante = Math.max(
    0,
    quantidadeSolicitada -
      quantidadeRegularizada -
      quantidadeCancelada -
      quantidadeReservadaPendente,
  );

  return {
    id: row.id,
    utenteId: row.utenteId,

    medicamentoId: row.medicamentoId || null,
    medicamento: row.medicamentoRef?.nome || row.medicamento,

    quantidadeSolicitada,
    quantidadeRegularizada,
    quantidadeCancelada,
    quantidadeReservadaPendente,
    quantidadeRestante,

    status: row.status,

    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function getReceitaLinhaRestanteDTO(row) {
  const quantidade = Number(row.quantidade) || 0;
  const quantidadeDispensada = Number(row.quantidadeDispensada) || 0;

  const quantidadeReservadaPendente = (row.pedidoItens || []).reduce(
    (total, item) => total + (Number(item.quantidade) || 0),
    0,
  );

  return Math.max(
    0,
    quantidade - quantidadeDispensada - quantidadeReservadaPendente,
  );
}

module.exports = {
  toExtraDTO,
  getReceitaLinhaRestanteDTO,
};
