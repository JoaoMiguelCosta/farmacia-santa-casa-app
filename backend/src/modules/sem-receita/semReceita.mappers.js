// src/modules/sem-receita/semReceita.mappers.js
function getPedidoItemStatus(item) {
  return item?.status || "PENDENTE";
}

function calculateQuantityByStatus(row, status) {
  return (row.pedidoItens || [])
    .filter((item) => getPedidoItemStatus(item) === status)
    .reduce((total, item) => {
      return total + (Number(item.quantidade) || 0);
    }, 0);
}

function toSemReceitaDTO(row) {
  if (!row) return null;

  const quantidade = Number(row.quantidade) || 0;
  const quantidadeReservadaPendente = calculateQuantityByStatus(
    row,
    "PENDENTE",
  );
  const quantidadeDispensada = calculateQuantityByStatus(row, "VALIDADO");

  const quantidadeRestante = Math.max(
    0,
    quantidade - quantidadeReservadaPendente,
  );

  const dto = {
    id: row.id,
    utenteId: row.utenteId,
    medicamento: row.medicamento,
    quantidade,
    quantidadeReservadaPendente,
    quantidadeRestante,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  if (quantidadeDispensada > 0) {
    dto.quantidadeDispensada = quantidadeDispensada;
  }

  return dto;
}

module.exports = {
  toSemReceitaDTO,
};
