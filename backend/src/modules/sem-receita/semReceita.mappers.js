// src/modules/sem-receita/semReceita.mappers.js
function calculateReservedQuantity(row) {
  return (row.pedidoItens || []).reduce((total, item) => {
    return total + (Number(item.quantidade) || 0);
  }, 0);
}

function toSemReceitaDTO(row) {
  if (!row) return null;

  const quantidade = Number(row.quantidade) || 0;
  const quantidadeReservadaPendente = calculateReservedQuantity(row);
  const quantidadeRestante = Math.max(
    0,
    quantidade - quantidadeReservadaPendente,
  );

  return {
    id: row.id,
    utenteId: row.utenteId,
    medicamento: row.medicamento,
    quantidade,
    quantidadeReservadaPendente,
    quantidadeRestante,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

module.exports = {
  toSemReceitaDTO,
};
